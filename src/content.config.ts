import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';
import { readCsv, bool, numOr, youtubeId } from '@/lib/cms';

/* ============================================================
 *  Collections backed by the local Webflow CSV export
 *  (cms-colletions/). Inline loaders map each CSV row → entry.
 *  Swap readCsv() for a backend fetch later — schemas/templates
 *  stay the same.
 * ============================================================ */

/* ---------- BLOG ---------- */
const blog = defineCollection({
  loader: async () =>
    readCsv('Blog Posts').map((r) => ({
      id: r['Slug'],
      title: r['Name'],
      summary: r['Post Summary'] || '',
      body: r['Post Body'] || '',
      category: r['Category'] || '',
      author: r['Author'] || 'sebastian-navia',
      featured: bool(r['Featured?']),
      mainImage: r['Main Image'] || '',
      thumbnail: r['Thumbnail image'] || r['Main Image'] || '',
      altImage: r['ALT image SEO'] || r['Name'] || '',
      seoTitle: r['Title SEO'] || r['Name'],
      seoDescription: r['Metadescription SEO'] || r['Post Summary'] || '',
      pubDate: r['Published On'] || r['Created On'] || '',
    })),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(''),
    body: z.string().default(''),
    category: z.string().default(''),
    author: z.string().default('sebastian-navia'),
    featured: z.boolean().default(false),
    mainImage: z.string().default(''),
    thumbnail: z.string().default(''),
    altImage: z.string().default(''),
    seoTitle: z.string().default(''),
    seoDescription: z.string().default(''),
    pubDate: z.coerce.date().optional(),
  }),
});

/* ---------- PORTFOLIO (Projects) ---------- */
const portfolio = defineCollection({
  loader: async () =>
    readCsv('Projects').map((r, i) => ({
      id: r['Slug'],
      title: r['Name'],
      summary: r['Project Summary'] || '',
      mainImage: r['Main Project Image'] || '',
      imageAlt: r['Metadata Main Project Image'] || r['Name'] || '',
      details: r['Project Details'] || '',
      services: r['Services Rendered'] || '',
      featured: bool(r['Featured Project?']),
      order: i,
    })),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(''),
    mainImage: z.string().default(''),
    imageAlt: z.string().default(''),
    details: z.string().default(''),
    services: z.string().default(''),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

/* ---------- SERVICE AREAS ---------- */
const serviceAreas = defineCollection({
  loader: async () =>
    readCsv('Service Areas').map((r, i) => ({
      id: r['Slug'],
      city: r['Name'],
      county: r['Country'] || '',
      heroMeta: r['Metadata Img Hero'] || '',
      titlePage: r['Title Page'] || r['Name'],
      summaryPage: r['Summary Page'] || '',
      headingIntro: r['Heading Intro'] || '',
      paragraphIntro: r['Paragraph Intro'] || '',
      headingServices: r['Heading Services'] || '',
      paragraphServices: r['Paragraph Services'] || '',
      headingPortfolio: r['Heading Portfolio'] || '',
      paragraphPortfolio: r['Paragraph Portfolio'] || '',
      headingProcess: r['Heading Process'] || '',
      paragraphProcess: r['Paragraph Process'] || '',
      headingReviews: r['Heading Reviews'] || '',
      paragraphReviews: r['Paragraph Reviews'] || '',
      headingBlog: r['Heading Blog'] || '',
      paragraphBlog: r['Paragraph Blog'] || '',
      seoTitle: r['Title SEO'] || r['Name'],
      seoDescription: r['Metadescription SEO'] || r['Summary Page'] || '',
      order: i,
    })),
  schema: z.object({
    city: z.string(),
    county: z.string().default(''),
    heroMeta: z.string().default(''),
    titlePage: z.string().default(''),
    summaryPage: z.string().default(''),
    headingIntro: z.string().default(''),
    paragraphIntro: z.string().default(''),
    headingServices: z.string().default(''),
    paragraphServices: z.string().default(''),
    headingPortfolio: z.string().default(''),
    paragraphPortfolio: z.string().default(''),
    headingProcess: z.string().default(''),
    paragraphProcess: z.string().default(''),
    headingReviews: z.string().default(''),
    paragraphReviews: z.string().default(''),
    headingBlog: z.string().default(''),
    paragraphBlog: z.string().default(''),
    seoTitle: z.string().default(''),
    seoDescription: z.string().default(''),
    order: z.number().default(0),
  }),
});

/* ---------- WEBSITE PACKAGES (pricing) ---------- */
const packages = defineCollection({
  loader: async () =>
    readCsv('Website Packages').map((r) => ({
      id: r['Slug'],
      name: r['Name'],
      category: r['Category'] || '',
      tagline: r['Tagline'] || '',
      description: r['Description'] || '',
      include: r['Include'] || '',
      price: numOr(r['Price']),
      deliveryTime: r['Delivery Time'] || '',
      revisionRounds: r['Revision Rounds'] || '',
      supportDays: r['Support Days'] || '',
      hostingIncluded: r['Hosting Included'] || '',
      cmsTraining: r['CMS Training Included'] || '',
      maintenanceAddon: r['Maintenance Add-on'] || '',
      badge: r['Badge Label'] || '',
      sortOrder: numOr(r['Sort Order']),
      paymentInstallments: numOr(r['Payment Installments']),
      components: (r['Included Components'] || '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean),
    })),
  schema: z.object({
    name: z.string(),
    category: z.string().default(''),
    tagline: z.string().default(''),
    description: z.string().default(''),
    include: z.string().default(''),
    price: z.number().default(0),
    deliveryTime: z.string().default(''),
    revisionRounds: z.string().default(''),
    supportDays: z.string().default(''),
    hostingIncluded: z.string().default(''),
    cmsTraining: z.string().default(''),
    maintenanceAddon: z.string().default(''),
    badge: z.string().default(''),
    sortOrder: z.number().default(0),
    paymentInstallments: z.number().default(0),
    components: z.array(z.string()).default([]),
  }),
});

/* ---------- LOGOS (tools / integrations) ---------- */
const logos = defineCollection({
  loader: async () =>
    readCsv('Logos').map((r, i) => ({
      id: r['Slug'],
      name: r['Name'],
      logo: r['Logo'] || '',
      order: i,
    })),
  schema: z.object({
    name: z.string(),
    logo: z.string().default(''),
    order: z.number().default(0),
  }),
});

/* ---------- VIDEOS (video testimonials / showcases) ---------- */
const videos = defineCollection({
  loader: async () =>
    readCsv('Videos').map((r, i) => ({
      id: r['Slug'],
      name: r['Name'],
      summary: r['Summary'] || '',
      link: r['Link Video'] || '',
      youtubeId: youtubeId(r['Link Video']),
      order: i,
    })),
  schema: z.object({
    name: z.string(),
    summary: z.string().default(''),
    link: z.string().default(''),
    youtubeId: z.string().default(''),
    order: z.number().default(0),
  }),
});

/* ---------- TESTIMONIALS (text reviews — local JSON, no CMS export yet) ---------- */
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
    date: z.string(),
    avatarClass: z.string().optional(),
    videoType: z.enum(['youtube', 'none']).default('none'),
    videoId: z.string().optional(),
    thumbClass: z.string().optional(),
    duration: z.string().optional(),
  }),
});

export const collections = { blog, portfolio, serviceAreas, packages, logos, videos, testimonials };
