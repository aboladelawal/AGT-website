// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://agtconsults.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  adapter: vercel(),
  security: {
    // Astro's built-in CSRF origin check gives false rejections behind Vercel's
    // proxy: the host it reconstructs from forwarded headers doesn't match the
    // request's Origin, so legitimate same-origin form POSTs are rejected with
    // "Cross-site POST form submissions are forbidden". We turn it off here and
    // replace it with explicit, proxy-aware origin validation in the only
    // on-demand route, src/pages/api/contact.ts (see originAllowed()).
    checkOrigin: false,
  },
});