/* ============================================================
 *  ESTIMATOR MODEL — SENAVIA Corp
 *  Guided configurator (not an open quote tool). Reuses the 8
 *  pricing packages and adds tier/track/timeline metadata plus
 *  the upper-tier components ("add-ons"). Rules:
 *   - The base package is the floor; you only add UP.
 *   - Only components of tiers ABOVE the base are available.
 *   - Webflow and Shopify are isolated tracks (no cross-add).
 *   - Σ add-ons of a level ≥ the jump to the next package →
 *     the nudge pushes the user to upgrade (cleaner tickets).
 *  Source of truth: Estimador-Sitio-Web-SENAVIA-Logica-y-Flujo.md
 * ============================================================ */
import { BUSINESS, ECOMMERCE, type Pkg } from './pricing';

export type Track = 'webflow' | 'shopify';
export type Category = 'business' | 'ecommerce';

export interface EstPkg extends Pkg {
  tier: number;
  track?: Track;
  baseMonths: number;
  category: Category;
  basePrice: number;   // alias of pricing `price`, used by the estimator math
}

/* tier / track / base timeline per package id (from pricing.ts) */
const META: Record<string, { tier: number; track?: Track; baseMonths: number }> = {
  'landing-page':           { tier: 1, baseMonths: 1 },
  'corporate-business':     { tier: 2, baseMonths: 2 },
  'lead-generation':        { tier: 3, baseMonths: 3 },
  'corporate-portal-suite': { tier: 4, baseMonths: 3.5 },
  'starter-store':          { tier: 1, track: 'webflow', baseMonths: 1 },
  'brand-store':            { tier: 2, track: 'webflow', baseMonths: 2 },
  'scale-store':            { tier: 3, track: 'shopify', baseMonths: 3 },
  'enterprise-store':       { tier: 4, track: 'shopify', baseMonths: 4 },
};

export const EST_PACKAGES: EstPkg[] = [
  ...BUSINESS.map((p): EstPkg => ({ ...p, ...META[p.id], category: 'business', basePrice: p.price })),
  ...ECOMMERCE.map((p): EstPkg => ({ ...p, ...META[p.id], category: 'ecommerce', basePrice: p.price })),
];

export interface EstComponent {
  id: string;
  tier: number;
  category: Category;
  track?: Track;
  price: number;
  months: number;           // added to the base timeline
  label_en: string;
  label_es: string;
  benefit_en: string;
  benefit_es: string;
  requires?: string[];      // prerequisite component ids (auto-included)
}

export const EST_COMPONENTS: EstComponent[] = [
  /* ---- Business · Tier 2 (Corporate Business) ---- */
  { id: 'pages10',     tier: 2, category: 'business', price: 800, months: 0.5,
    label_en: 'Up to 10 pages', label_es: 'Hasta 10 páginas',
    benefit_en: 'Room to show everything you offer', benefit_es: 'Espacio para mostrar todo lo que ofreces' },
  { id: 'cms_edit',    tier: 2, category: 'business', price: 400, months: 0.25,
    label_en: 'Self-service content editing (CMS)', label_es: 'Autoadministración de contenido (CMS)',
    benefit_en: 'Update text & images yourself, no one to depend on', benefit_es: 'Actualiza textos e imágenes tú mismo, sin depender de nadie' },
  { id: 'service_pgs', tier: 2, category: 'business', price: 500, months: 0.25,
    label_en: 'A page per service (SEO)', label_es: 'Una página por servicio (SEO)',
    benefit_en: 'Each service rankable on Google', benefit_es: 'Cada servicio posicionable en Google' },
  { id: 'blog_b',      tier: 2, category: 'business', price: 500, months: 0.25,
    label_en: 'Blog', label_es: 'Blog',
    benefit_en: 'Free traffic that positions you as the expert', benefit_es: 'Visitas gratis que te posicionan como experto' },
  { id: 'booking',     tier: 2, category: 'business', price: 300, months: 0.25,
    label_en: 'Online appointment booking', label_es: 'Agenda de citas en línea',
    benefit_en: 'Clients book themselves — no phone tag', benefit_es: 'Tus clientes agendan solos, sin llamadas de ida y vuelta' },
  { id: 'gbp',         tier: 2, category: 'business', price: 300, months: 0.25,
    label_en: 'Google Business Profile optimization', label_es: 'Optimización de tu ficha de Google',
    benefit_en: 'Get found in local search', benefit_es: 'Que te encuentren en búsqueda local' },

  /* ---- Business · Tier 3 (Lead Generation) ---- */
  { id: 'campaign_lp', tier: 3, category: 'business', price: 700, months: 0.25,
    label_en: 'Campaign landing pages', label_es: 'Landing pages por campaña',
    benefit_en: 'One per Google / Meta Ads campaign', benefit_es: 'Una por campaña de Google / Meta Ads' },
  { id: 'city_pages',  tier: 3, category: 'business', price: 700, months: 0.5,
    label_en: 'City / area pages (geo SEO)', label_es: 'Páginas por ciudad (SEO geo)',
    benefit_en: 'Rank in every zone you serve', benefit_es: 'Posiciona en cada zona donde trabajas' },
  { id: 'seo_adv',     tier: 3, category: 'business', price: 600, months: 0.5,
    label_en: 'Advanced SEO', label_es: 'SEO avanzado',
    benefit_en: 'Lowers your cost per lead from ads', benefit_es: 'Baja tu costo por lead en ads' },
  { id: 'lead_forms',  tier: 3, category: 'business', price: 300, months: 0.25,
    label_en: 'Conversion-optimized lead forms', label_es: 'Formularios de captación a conversión',
    benefit_en: 'Built to get their details', benefit_es: 'Hechos para que dejen sus datos' },
  { id: 'attribution', tier: 3, category: 'business', price: 500, months: 0.25,
    label_en: 'Attribution tracking', label_es: 'Tracking de atribución',
    benefit_en: 'Know which ad & page brings each lead', benefit_es: 'Sabe qué anuncio y página trae cada lead' },

  /* ---- Business · Tier 4 (Corporate Portal Suite) ---- */
  { id: 'user_login',  tier: 4, category: 'business', price: 1500, months: 0.5,
    label_en: 'User login (clients & team)', label_es: 'Login de usuarios (clientes y equipo)',
    benefit_en: 'Everyone gets their own account', benefit_es: 'Cada quien entra con su propio usuario' },
  { id: 'roles',       tier: 4, category: 'business', price: 1000, months: 0.5, requires: ['user_login'],
    label_en: 'Role-based access', label_es: 'Accesos por rol',
    benefit_en: 'Admin, client, employee see only theirs', benefit_es: 'Admin, cliente y empleado ven solo lo suyo' },
  { id: 'dashboard',   tier: 4, category: 'business', price: 1200, months: 0.5, requires: ['user_login'],
    label_en: 'Private dashboard', label_es: 'Panel privado',
    benefit_en: 'Records & tracking per user', benefit_es: 'Registros y seguimiento por usuario' },
  { id: 'crm_sync',    tier: 4, category: 'business', price: 1000, months: 0.5,
    label_en: 'CRM / system integration', label_es: 'Integración con CRM o sistema',
    benefit_en: 'Connect the tools you already use', benefit_es: 'Conecta las herramientas que ya usas' },
  { id: 'library',     tier: 4, category: 'business', price: 600, months: 0.25, requires: ['user_login'],
    label_en: 'Private resource library', label_es: 'Biblioteca privada de recursos',
    benefit_en: 'Gated content for your clients', benefit_es: 'Contenido privado para tus clientes' },
  { id: 'pages25',     tier: 4, category: 'business', price: 400, months: 0.25,
    label_en: 'Up to 25 managed pages', label_es: 'Hasta 25 páginas administrables',
    benefit_en: 'Room to scale your content', benefit_es: 'Espacio para escalar tu contenido' },

  /* ---- E-Commerce · Webflow · Tier 2 (Brand Store) ---- */
  { id: 'catalog500', tier: 2, category: 'ecommerce', track: 'webflow', price: 800, months: 0.5,
    label_en: 'Up to 500 products + filters', label_es: 'Hasta 500 productos + filtros',
    benefit_en: 'Catalog organized by category', benefit_es: 'Catálogo organizado por categorías' },
  { id: 'blog_e',     tier: 2, category: 'ecommerce', track: 'webflow', price: 500, months: 0.25,
    label_en: 'Blog', label_es: 'Blog',
    benefit_en: 'Free traffic from Google', benefit_es: 'Visitas gratis desde Google' },
  { id: 'reviews',    tier: 2, category: 'ecommerce', track: 'webflow', price: 400, months: 0.25,
    label_en: 'Customer reviews', label_es: 'Reseñas de clientes',
    benefit_en: 'Social proof that sells for you', benefit_es: 'Reseñas que venden por ti' },
  { id: 'accounts',   tier: 2, category: 'ecommerce', track: 'webflow', price: 500, months: 0.25,
    label_en: 'Accounts + favorites', label_es: 'Cuentas + favoritos',
    benefit_en: 'Customers return and rebuy', benefit_es: 'Vuelven a comprar' },
  { id: 'subs_wf',    tier: 2, category: 'ecommerce', track: 'webflow', price: 600, months: 0.25,
    label_en: 'Subscription selling', label_es: 'Venta por suscripción',
    benefit_en: 'For products that restock', benefit_es: 'Para productos que se reponen' },

  /* ---- E-Commerce · Shopify · Tier 4 (Enterprise Store) ---- */
  { id: 'multichannel', tier: 4, category: 'ecommerce', track: 'shopify', price: 1500, months: 0.5,
    label_en: 'Omnichannel selling', label_es: 'Venta omnicanal',
    benefit_en: 'TikTok Shop, Instagram, Pinterest, Google', benefit_es: 'TikTok Shop, Instagram, Pinterest, Google' },
  { id: 'inv_sync',    tier: 4, category: 'ecommerce', track: 'shopify', price: 1200, months: 0.5,
    label_en: 'Inventory sync', label_es: 'Sincronización de inventario',
    benefit_en: 'Across channels & warehouses', benefit_es: 'Entre canales y bodegas' },
  { id: 'checkout1',   tier: 4, category: 'ecommerce', track: 'shopify', price: 800, months: 0.25,
    label_en: '1-click checkout', label_es: 'Checkout de 1 clic',
    benefit_en: 'Drives conversion', benefit_es: 'Dispara la conversión' },
  { id: 'ai_assist',   tier: 4, category: 'ecommerce', track: 'shopify', price: 1500, months: 0.5,
    label_en: 'AI assistant (sells 24/7)', label_es: 'Asistente IA (vende 24/7)',
    benefit_en: 'Answers and sells around the clock', benefit_es: 'Responde y vende las 24 horas' },
  { id: 'automation',  tier: 4, category: 'ecommerce', track: 'shopify', price: 1000, months: 0.5,
    label_en: 'Payments / shipping / stock automation', label_es: 'Automatización de cobros / envíos / stock',
    benefit_en: 'Operations on autopilot', benefit_es: 'Operación en piloto automático' },
  { id: 'managed_ads', tier: 4, category: 'ecommerce', track: 'shopify', price: 1000, months: 0.5,
    label_en: '1 month of managed ads', label_es: '1 mes de ads gestionada',
    benefit_en: 'Launch with paid traffic included', benefit_es: 'Arranca con tráfico pago incluido' },
];

/* ---- Selectors ---- */
export const packagesFor = (category: Category, track?: Track): EstPkg[] =>
  EST_PACKAGES.filter(
    (p) => p.category === category && (category !== 'ecommerce' || p.track === track),
  ).sort((a, b) => a.tier - b.tier);

export const nextPackage = (base: EstPkg): EstPkg | null =>
  EST_PACKAGES.find(
    (p) =>
      p.category === base.category &&
      (base.category !== 'ecommerce' || p.track === base.track) &&
      p.tier === base.tier + 1,
  ) ?? null;

export const availableAddons = (base: EstPkg): EstComponent[] =>
  EST_COMPONENTS.filter(
    (c) =>
      c.category === base.category &&
      (base.category !== 'ecommerce' || c.track === base.track) &&
      c.tier > base.tier,
  );

/* Name of the package a given tier's components come from (group header). */
export const packageNameForTier = (base: EstPkg, tier: number): string =>
  EST_PACKAGES.find(
    (p) =>
      p.category === base.category &&
      (base.category !== 'ecommerce' || p.track === base.track) &&
      p.tier === tier,
  )?.name ?? '';
