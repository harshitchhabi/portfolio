import { defineConfig } from 'astro/config';

// TODO(harshit): swap in the real domain once the Vercel project is set up.
const SITE = 'https://harshitchhabi.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Keep every style and script in its own file so the CSP never needs 'unsafe-inline'.
    inlineStylesheets: 'never',
  },
  vite: {
    // three.js is one big chunk on purpose: it loads async, after first paint, only when the 3D floor runs.
    build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 800 },
  },
});
