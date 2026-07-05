# agtconsults.com — Alpha Global Tech & Consulting

Marketing site, rebuilt in **Astro** (static output) with vanilla CSS and a
restrained motion layer. Dark, layered, typographically driven — the same
positioning and copy as before, elevated presentation.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # → dist/ (static)
npm run preview    # serve dist/ locally
```

## Structure

```
src/
  layouts/Base.astro        # <head>, fonts, global JS (reveals, nav, mobile menu)
  styles/global.css         # design system: tokens, type scale, motion primitives
  components/                # one file per section + icons/
  pages/index.astro          # composes the homepage
public/
  images/                    # logos, product + team photos (carried over)
  shots/                     # captured hero screenshots for Selected Work + Havyn
  team/aboladelawal/         # full founder profile (static, links back to /)
  thank-you.html, 404.html
```

## Motion

- Scroll reveals via `IntersectionObserver` (`.reveal` → `.reveal.in`).
- Hover/state via CSS transitions.
- One live hero element: a slow CSS gradient mesh (lighting, not decoration).
- All motion is disabled under `prefers-reduced-motion: reduce`; a `<noscript>`
  fallback keeps `.reveal` content visible without JS.

## Contact form (Resend)

The contact form (`src/components/Contact.astro`) POSTs to a server endpoint,
`src/pages/api/contact.ts` (`export const prerender = false`), which validates
the fields, checks a hidden `company` honeypot, and sends the enquiry with
[Resend](https://resend.com). Everything else on the site stays static; only
this route runs on-demand.

### Setup

1. Create an API key at <https://resend.com/api-keys>.
2. Local dev: copy `.env.example` to `.env` and set `RESEND_API_KEY`.
   ```bash
   cp .env.example .env
   # then edit .env and paste your key
   ```
3. **Vercel: add the same `RESEND_API_KEY` env var** in the project settings
   (Settings → Environment Variables, Production + Preview) **before deploying** —
   the endpoint returns a 500 without it.

Enquiries are sent to `aboladelawal@agtconsults.com`, with the submitter's email
as `replyTo`, so you can reply straight from your inbox.

### DNS verification for agtconsults.com

Until the domain is verified, the endpoint sends from Resend's shared sender
`onboarding@resend.dev`. To send from your own domain:

1. In Resend, **Domains → Add Domain** → `agtconsults.com`.
2. Add the DNS records Resend shows (SPF `TXT`, DKIM `CNAME`/`TXT`, and the
   recommended DMARC `TXT`) at your DNS provider, then click **Verify**.
3. Once verified, change the `from` line in `src/pages/api/contact.ts` to
   `'AGT Site <noreply@agtconsults.com>'` (a comment marks the exact spot).

## Deploy (Vercel)

The project uses the `@astrojs/vercel` adapter, so `npm run build` produces a
Vercel-ready output (static pages + the contact function).

1. Import the repo in Vercel (framework preset: **Astro**, auto-detected).
2. Set `RESEND_API_KEY` in Environment Variables (see above).
3. Deploy, then point `agtconsults.com` DNS at Vercel and set it as the primary
   domain.
4. Submit the live form once and confirm the enquiry lands in the inbox and the
   browser lands on `/thank-you.html`.

## Asset notes

- Selected Work card images and the Havyn section image are real hero
  screenshots captured from the live sites (`scripts/capture-shots.mjs`).
- The old `images/havyn.png` ("coming soon") is no longer used; Havyn now shows
  the live `gethavyn.app` screenshot.
- The previous single-file `index.html` and `team/` at the repo root are the
  legacy site, left in place for reference; the Astro build in `dist/` supersedes
  them.
