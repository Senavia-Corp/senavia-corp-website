import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

const SITE_URL = 'https://senaviacorp.com';

/**
 * Real <lastmod> dates for the CMS-backed pages.
 *
 * Fetched once here rather than per-item inside serialize(), so the build makes
 * one request instead of 109. Sanity's `production` dataset answers unauthenticated,
 * which is why this needs no token. A failure degrades to "no lastmod" — the
 * element is optional in the sitemap spec, so a stale date is worse than none.
 */
async function fetchLastmod() {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'zx255dw6';
  const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
  // Which URL prefix each Sanity type is published under. Types absent here
  // (logo, video, testimonial) have no page of their own.
  const prefixes = { blogPost: '/blog', project: '/portfolio', serviceArea: '/service-areas' };
  const query = `*[_type in ["blogPost","project","serviceArea"] && defined(slug.current)]{_type,"slug":slug.current,_updatedAt}`;
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity returned ${res.status}`);
    const { result = [] } = await res.json();
    const map = new Map(
      result
        .filter((d) => d._updatedAt && prefixes[d._type])
        .map((d) => [`${prefixes[d._type]}/${d.slug}`, d._updatedAt]),
    );
    console.log(`[sitemap] lastmod resolved for ${map.size} CMS pages`);
    return map;
  } catch (err) {
    console.warn(`[sitemap] lastmod unavailable, emitting sitemap without it: ${err.message}`);
    return new Map();
  }
}

const LASTMOD = await fetchLastmod();

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // Dev-only UI; never shipped in the static build. Disabled so it never
  // overlays content in dev or QA screenshots.
  devToolbar: { enabled: false },
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: false,
  }),
  integrations: [
    icon(),
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/brand-foundation') &&
        !page.includes('/_source') &&
        !page.includes('/terms') &&
        !page.includes('/privacy') &&
        // noindex,nofollow by design (Seo.astro emits it from thank-you.astro's
        // `noindex` prop) — a noindex page has no business in the sitemap.
        !page.includes('/thank-you') &&
        !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
      // The generator emits trailing slashes but vercel.json sets
      // trailingSlash:false, so every URL here 308'd before reaching its 200.
      // Strip it, except on the root, whose canonical is the bare origin + "/".
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/$/, '');
        item.url = url.href;
        const lastmod = LASTMOD.get(url.pathname);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
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
