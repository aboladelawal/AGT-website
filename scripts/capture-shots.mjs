import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = process.argv[2];
const PORT = 9350;

const SITES = [
  { name: "gails",       url: "https://gails-website.vercel.app/" },
  { name: "liquiddeath", url: "https://liquid-death-khaki.vercel.app/" },
  { name: "popmart",     url: "https://pop-mart-iota.vercel.app/" },
  { name: "gethavyn",    url: "https://gethavyn.app/" },
];

const chrome = spawn(CHROME, ["--headless=new","--disable-gpu","--no-first-run","--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,"--user-data-dir=/tmp/cdp-shots","about:blank"]);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getWs(){for(let i=0;i<60;i++){try{const l=await fetch(`http://127.0.0.1:${PORT}/json`).then(r=>r.json());const p=l.find(t=>t.type==="page");if(p?.webSocketDebuggerUrl)return p.webSocketDebuggerUrl;}catch{}await sleep(250);}throw new Error("no cdp");}
const wsUrl = await getWs();
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener("open", r, { once:true }));
let id=0; const pend=new Map();
ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}});
const send=(method,params={})=>new Promise(res=>{const mid=++id;pend.set(mid,res);ws.send(JSON.stringify({id:mid,method,params}));});

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:2,mobile:false});
for (const s of SITES) {
  try {
    await send("Page.navigate",{url:s.url});
    await sleep(4500); // let hero fonts/animations settle
    // nudge any lazy content, then return to top
    await send("Runtime.evaluate",{expression:"window.scrollTo(0,300)"}); await sleep(600);
    await send("Runtime.evaluate",{expression:"window.scrollTo(0,0)"}); await sleep(900);
    const r = await send("Page.captureScreenshot",{format:"jpeg",quality:82,clip:{x:0,y:0,width:1440,height:900,scale:1}});
    writeFileSync(`${OUT}/${s.name}.jpg`, Buffer.from(r.result.data,"base64"));
    console.log("captured", s.name);
  } catch (e) { console.log("FAILED", s.name, e.message); }
}
ws.close(); chrome.kill(); process.exit(0);
