import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.argv[2] || "http://localhost:4321/";
const OUT = process.argv[3];
const PORT = 9360;

const chrome = spawn(CHROME, ["--headless=new","--disable-gpu","--no-first-run","--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,"--user-data-dir=/tmp/cdp-verify","about:blank"]);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getWs(){for(let i=0;i<60;i++){try{const l=await fetch(`http://127.0.0.1:${PORT}/json`).then(r=>r.json());const p=l.find(t=>t.type==="page");if(p?.webSocketDebuggerUrl)return p.webSocketDebuggerUrl;}catch{}await sleep(250);}throw new Error("no cdp");}
const ws = new WebSocket(await getWs());
await new Promise(r => ws.addEventListener("open", r, { once:true }));
let id=0; const pend=new Map();
ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}});
const send=(method,params={})=>new Promise(res=>{const mid=++id;pend.set(mid,res);ws.send(JSON.stringify({id:mid,method,params}));});
const ev=async(expression)=>{const r=await send("Runtime.evaluate",{expression,returnByValue:true});return r.result?.result?.value;};

await send("Page.enable"); await send("Runtime.enable");

const widths = [375, 768, 1280, 1536];
const results = [];
for (const w of widths) {
  await send("Emulation.setDeviceMetricsOverride",{width:w,height:900,deviceScaleFactor:1,mobile:w<768});
  await send("Page.navigate",{url:URL}); await sleep(1100);
  const data = await ev(`(() => {
    const de=document.documentElement, iw=window.innerWidth, sw=de.scrollWidth;
    const off=[];
    if (sw>iw+1) document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect();
      if(r.right>iw+1&&r.width>0&&el.offsetParent!==null) off.push((el.id?'#'+el.id:'')+(el.className&&el.className.toString?('.'+el.className.toString().trim().split(/\\s+/)[0]):el.tagName)+' r='+Math.round(r.right));});
    return {w:iw, scrollWidth:sw, overflow: sw>iw+1, offenders:[...new Set(off)].slice(0,8)};
  })()`);
  results.push(data);
}
console.log(JSON.stringify(results,null,2));

// full-page visual captures (reveals forced on)
async function shot(name, w, dsf=1) {
  await send("Emulation.setDeviceMetricsOverride",{width:w,height:1000,deviceScaleFactor:dsf,mobile:w<768});
  await send("Page.navigate",{url:URL}); await sleep(1200);
  await ev(`document.documentElement.style.scrollBehavior='auto';document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));true`);
  await sleep(500);
  const r = await send("Page.captureScreenshot",{format:"jpeg",quality:80,captureBeyondViewport:true});
  writeFileSync(`${OUT}/${name}.jpg`, Buffer.from(r.result.data,"base64"));
  console.log("shot", name);
}
if (OUT) { await shot("full_1440", 1440); await shot("full_390", 390, 2); }

ws.close(); chrome.kill(); process.exit(0);
