import { defineCollection, z } from 'astro:content';
import { fetchSanity } from '@/lib/sanity';

function extractYoutubeId(url: string): string {
  if (!url) return '';
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

/* ============================================================
 *  Collections backed by Sanity CMS (project: zx255dw6)
 *  GROQ queries fetch published documents at build time.
 * ============================================================ */

const blog = defineCollection({
  loader: async () =>
    fetchSanity<any[]>(`*[_type == "blogPost"] | order(pubDate desc) {
      "id": slug.current,
      title,
      "summary": coalesce(summary, ''),
      "body": coalesce(body, ''),
      "category": coalesce(category, ''),
      "author": coalesce(author, 'sebastian-navia'),
      "featured": coalesce(featured, false),
      "mainImage": coalesce(mainImage, ''),
      "thumbnail": coalesce(thumbnail, mainImage, ''),
      "altImage": coalesce(altImage, title, ''),
      "seoTitle": coalesce(seoTitle, title, ''),
      "seoDescription": coalesce(seoDescription, summary, ''),
      pubDate
    }`),
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

const portfolio = defineCollection({
  loader: async () =>
    fetchSanity<any[]>(`*[_type == "project"] | order(order asc) {
      "id": slug.current,
      title,
      "summary": coalesce(summary, ''),
      "mainImage": coalesce(mainImage, ''),
      "imageAlt": coalesce(imageAlt, title, ''),
      "liveUrl": coalesce(liveUrl, ''),
      "details": coalesce(details, ''),
      "services": coalesce(services, ''),
      "featured": coalesce(featured, false),
      "order": coalesce(order, 0)
    }`),
  schema: z.object({
    title: z.string(),
    summary: z.string().default(''),
    mainImage: z.string().default(''),
    imageAlt: z.string().default(''),
    liveUrl: z.string().default(''),
    details: z.string().default(''),
    services: z.string().default(''),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const serviceAreas = defineCollection({
  loader: async () =>
    fetchSanity<any[]>(`*[_type == "serviceArea"] | order(order asc) {
      "id": slug.current,
      city,
      "county": coalesce(county, ''),
      "heroMeta": coalesce(heroMeta, ''),
      "titlePage": coalesce(titlePage, city, ''),
      "summaryPage": coalesce(summaryPage, ''),
      "headingIntro": coalesce(headingIntro, ''),
      "paragraphIntro": coalesce(paragraphIntro, ''),
      "headingServices": coalesce(headingServices, ''),
      "paragraphServices": coalesce(paragraphServices, ''),
      "headingPortfolio": coalesce(headingPortfolio, ''),
      "paragraphPortfolio": coalesce(paragraphPortfolio, ''),
      "headingProcess": coalesce(headingProcess, ''),
      "paragraphProcess": coalesce(paragraphProcess, ''),
      "headingReviews": coalesce(headingReviews, ''),
      "paragraphReviews": coalesce(paragraphReviews, ''),
      "headingBlog": coalesce(headingBlog, ''),
      "paragraphBlog": coalesce(paragraphBlog, ''),
      "seoTitle": coalesce(seoTitle, city, ''),
      "seoDescription": coalesce(seoDescription, summaryPage, ''),
      "order": coalesce(order, 0)
    }`),
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

const logos = defineCollection({
  loader: async () =>
    fetchSanity<any[]>(`*[_type == "logo"] | order(order asc) {
      "id": slug.current,
      name,
      "logo": coalesce(logoUrl, ''),
      "order": coalesce(order, 0)
    }`),
  schema: z.object({
    name: z.string(),
    logo: z.string().default(''),
    order: z.number().default(0),
  }),
});

const videos = defineCollection({
  loader: async () => {
    const data = await fetchSanity<any[]>(`*[_type == "video"] | order(order asc) {
      "id": slug.current,
      name,
      "summary": coalesce(summary, ''),
      "link": coalesce(link, ''),
      "order": coalesce(order, 0)
    }`);
    return data.map((v) => ({ ...v, youtubeId: extractYoutubeId(v.link) }));
  },
  schema: z.object({
    name: z.string(),
    summary: z.string().default(''),
    link: z.string().default(''),
    youtubeId: z.string().default(''),
    order: z.number().default(0),
  }),
});

const testimonials = defineCollection({
  loader: async () =>
    fetchSanity<any[]>(`*[_type == "testimonial"] | order(_createdAt asc) {
      "id": _id,
      name, company, category,
      "rating": coalesce(rating, 5),
      "quote_en": coalesce(quoteEn, ''),
      "quote_es": coalesce(quoteEs, ''),
      "date": coalesce(date, ''),
      "avatarClass": coalesce(avatarClass, ''),
      "videoType": coalesce(videoType, 'none'),
      "videoId": coalesce(videoId, ''),
      "thumbClass": coalesce(thumbClass, ''),
      "duration": coalesce(duration, '')
    }`),
  schema: z.object({
    id: z.string().optional(),
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

export const collections = { blog, portfolio, serviceAreas, logos, videos, testimonials };
