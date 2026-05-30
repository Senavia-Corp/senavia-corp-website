import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://new.senaviacorp.com',
  output: 'static',
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
        !page.includes('/_source'),
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
