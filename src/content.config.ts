import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* ------------------------------------------------------------------ *
 *  BLOG — long-form prose (mdx). One entry per (post × language),
 *  paired across languages by `translationKey`. The index/[slug]
 *  templates filter by the active language class via lang-only-* wrappers.
 * ------------------------------------------------------------------ */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('SENAVIA Editorial'),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    coverClass: z.string().optional(),     // 'bg-1'..'bg-8' fallback gradient
    readingTime: z.string().optional(),    // "8 min read"
    featured: z.boolean().default(false),
    lang: z.enum(['en', 'es']).default('en'),
    translationKey: z.string(),            // links the en/es pair
    draft: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ *
 *  PORTFOLIO — case studies (mdx). Bilingual short fields live as
 *  *_en / *_es siblings; the template emits both in lang-only-* spans.
 *  Schema mirrors the existing hand-built detail pages
 *  (pergola-plus-florida, angele-glow).
 * ------------------------------------------------------------------ */
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),                       // "Pergola Plus Florida"
    seoTitle: z.string(),
    description: z.string(),
    client: z.string(),
    category: z.enum(['web-design', 'ecommerce', 'web-app', 'marketing']),
    categoryLabel_en: z.string(),            // "Web Design · Outdoor Living"
    categoryLabel_es: z.string(),
    year: z.string(),
    stack: z.string(),
    liveUrl: z.string().url().optional(),
    summary_en: z.string(),                  // card blurb
    summary_es: z.string(),
    heroGradient: z.string().default('linear-gradient(135deg, #2D7DB8 0%, #33CCCC 50%, #99CC33 100%)'),
    coverClass: z.string().default('ph-1'),  // index-card cover gradient
    overviewHeading_en: z.string(),
    overviewHeading_es: z.string(),
    overviewBody_en: z.array(z.string()),
    overviewBody_es: z.array(z.string()),
    metrics: z.array(z.object({
      num: z.string(),
      label_en: z.string(),
      label_es: z.string(),
    })).default([]),
    csr: z.object({
      challenge: z.object({ heading_en: z.string(), heading_es: z.string(), body_en: z.array(z.string()), body_es: z.array(z.string()) }),
      solution:  z.object({ heading_en: z.string(), heading_es: z.string(), body_en: z.array(z.string()), body_es: z.array(z.string()) }),
      result:    z.object({ heading_en: z.string(), heading_es: z.string(), body_en: z.array(z.string()), body_es: z.array(z.string()) }),
    }),
    gallery: z.array(z.object({
      label_en: z.string(),
      label_es: z.string(),
      bg: z.string(),                        // 'bg-1'..'bg-6'
      full: z.boolean().default(false),
    })).default([]),
    tech: z.array(z.string()).default([]),   // ['Webflow','Figma','GA4',...]
    testimonialQuote_en: z.string().optional(),
    testimonialQuote_es: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ *
 *  TESTIMONIALS — structured records (json). Easiest format for the
 *  client to paste real CMS rows into later.
 * ------------------------------------------------------------------ */
const testimonials = defineCollection({
  loader: file('./src/content/testimonials.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    company: z.string(),
    category: z.enum(['web-design', 'ecommerce', 'web-app', 'marketing']),
    rating: z.number().min(1).max(5).default(5),
    quote_en: z.string(),
    quote_es: z.string(),
    date: z.string(),                        // display string ("2 weeks ago" / "Mar 2026")
    avatarClass: z.string().optional(),      // 'a1'..'a6'
    videoType: z.enum(['youtube', 'none']).default('none'),
    videoId: z.string().optional(),
    thumbClass: z.string().optional(),       // 'bg-1'..'bg-8'
    duration: z.string().optional(),
  }),
});

/* ------------------------------------------------------------------ *
 *  SERVICE AREAS — local landing pages (mdx). Bilingual via *_en/_es.
 *  `miami` migrates here; the rest are seeded as test data.
 * ------------------------------------------------------------------ */
const serviceAreas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/service-areas' }),
  schema: z.object({
    city: z.string(),                        // "Miami"
    county: z.enum(['miami-dade', 'broward', 'palm-beach']),
    countyLabel: z.string(),                 // "Miami-Dade County"
    seoTitle: z.string(),
    description: z.string(),
    intro_en: z.string(),
    intro_es: z.string(),
    population: z.string().optional(),
    nearbyCities: z.array(z.string()).default([]),
    heroGradient: z.string().default('linear-gradient(135deg, #2D7DB8 0%, #33CCCC 50%, #99CC33 100%)'),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, portfolio, testimonials, serviceAreas };
