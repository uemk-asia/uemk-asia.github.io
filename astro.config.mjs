// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The organization-level GitHub Pages site is served from the domain root,
// so no `base` path is needed.
export default defineConfig({
  site: 'https://uemk-asia.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory', // clean paths: /about/ instead of /about.html
  },
  // GitHub Pages has no server-side redirects; Astro writes a static HTML page
  // with a meta refresh and canonical link for each entry below.
  redirects: {
    '/organizers': '/people/',
  },
  integrations: [
    sitemap({
      // Keep redirect-only pages out of the sitemap.
      filter: (page) => !page.endsWith('/organizers/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
