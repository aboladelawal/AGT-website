# Build Brief: Rebuild agtconsults.com

Rebuild the Alpha Global Tech & Consulting site (agtconsults.com) from the current static, dark, narrow HTML document into a lively, responsive, crafted site at the level of snappymob.com. Keep AGT's serious engineering register. This is not a colorful consumer site. It sells certainty to banks and enterprises, so the craft shows through restraint, motion and typography, not loud color.

Reference for craft level and register: snappymob.com and thoughtbot.com. Emulate their confidence, restraint, motion and typographic scale. Do not copy their layouts. AGT keeps its own identity, executed far better.

## The problem to fix

The current site feels like a plain HTML document: dark, flat, narrow, static, no motion, weak hierarchy. The copy and section structure are strong and must be preserved. The job is to elevate the presentation, layout, motion and craft, not to change the message.

## Four levers (apply all)

1. Motion. Scroll reveals, hover responses, smooth scrolling, one live hero element. A static dark page feels dead at any palette. Respect `prefers-reduced-motion`.
2. Typographic energy. Big confident headlines, real scale and weight, clear hierarchy doing the heavy lifting.
3. Depth in the dark. Layered surfaces, one accent used with intent, subtle gradient as lighting rather than decoration. Dark that looks lit, not flat.
4. Craft in the product shots. Frame and treat the Picki, Havyn and banking screenshots with care. This is where a studio signals taste.

## Stack

- Astro (latest), matching the demo projects' approach.
- Vanilla CSS, no heavy UI kit. Custom, intentional styling.
- Restrained motion layer: Intersection Observer for scroll reveals, CSS transitions for hover and state, optional Lenis for smooth scroll, optional GSAP only if a specific hero animation needs it. Keep JS minimal and performant.
- Deploy to the existing agtconsults.com domain. Keep the current host or move to Vercel, whichever is cleaner.

## Content (preserve, do not rewrite)

Pull all copy from the current agtconsults.com as the source of truth. Keep every section and every line of positioning. Rebuild only the presentation. Sections to carry over:

- Hero with the AGT positioning line.
- Picki as flagship proof.
- The four services.
- The banking and fintech platform work, with the GitHub repo previews.
- How we work.
- Havyn.
- Team.
- FAQ.
- Contact.

Keep the strong existing lines intact, for example the one about shipping one system that holds under load rather than ten demos that impress in a meeting.

## Layout fixes

- Kill the narrow feel. Use a proper max width for text with full-bleed section backgrounds. Generous whitespace and vertical rhythm.
- Real responsive layout, mobile-first. Working mobile nav. No horizontal scroll. Fluid type. Test at 375px, 768px, 1280px, 1536px.
- Strong hierarchy: oversized section headings, clear sublevels, calm body text.

## Hero

Give the hero one live element that signals engineering, done with restraint. Options: a subtle animated gradient mesh as lighting, or an abstract systems, grid or data-line motif that moves slowly. Not a gimmick, not a toy. It should feel like a serious studio, alive but composed.

## New section: Selected work (prototypes)

Add a work section featuring the three brand rebuild prototypes. Frame them honestly as self-initiated concept rebuilds that demonstrate AGT's design and front-end engineering, not as client production sites. A short intro line should make clear these are prototype rebuilds of well-known brands, built to show craft.

Three cards, each with the brand name, a one-line descriptor of the design register it shows, and a live link:

- Gail's Bakery, editorial and typographic, https://gails-website.vercel.app/
- Liquid Death, loud and high-energy, https://liquid-death-khaki.vercel.app/
- Pop Mart, playful and colorful, https://pop-mart-iota.vercel.app/

Use a real screenshot of each site's hero as the card image if provided, otherwise build a clean branded card. Cards should have tasteful hover motion and open the live site in a new tab.

## Brand identity

Keep AGT's identity but elevate it. If the accent color reads muddy or is underused, introduce one confident accent used with intent. Push the display typography much larger and more assured. The palette can stay dark, but make it layered and lit rather than flat.

## Global requirements

- Fully responsive and mobile-first.
- Accessibility: semantic HTML, correct heading order, alt text, visible focus states, adequate contrast, keyboard-navigable nav.
- Performance: optimized lazy-loaded imagery, fast first paint, no layout shift.
- Motion respects `prefers-reduced-motion`.

## Build order and deliverable

1. Migrate all existing copy into the new Astro structure.
2. Build the design system: type scale, color and surface layers, spacing, motion primitives.
3. Build sections top to bottom with the four levers applied.
4. Build the Selected work section with the three prototype cards.
5. Motion pass, then responsive and accessibility pass.
6. Deploy to agtconsults.com and report the live URL.

Report the live URL, confirm responsiveness across breakpoints, and note any content or asset assumption made.
