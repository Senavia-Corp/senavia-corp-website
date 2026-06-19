import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://new.senaviacorp.com',
  output: 'static',
  // Dev-only UI; never shipped in the static build. Disabled so it never
  // overlays content in dev or QA screenshots.
  devToolbar: { enabled: false },
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: false,
  }),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/brand-foundation') &&
        !page.includes('/_source') &&
        !page.includes('/terms') &&
        !page.includes('/privacy') &&
        !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
