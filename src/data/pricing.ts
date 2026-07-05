/* ============================================================
 *  PRICING DATA — SENAVIA Corp (8 packages, 2 product lines)
 *  Bilingual (EN/ES). Sales-oriented card content.
 *  Order = level ascending → highest price anchors on the right.
 *  Easy to move to the CMS later; templates read these fields.
 * ============================================================ */

export type CtaKind = 'plan' | 'sales';
export type Platform = 'Webflow' | 'Shopify';

export interface Pkg {
  id: string;
  level_en: string;
  level_es: string;
  badge_en?: string;
  badge_es?: string;
  name: string;            // product name — same in both languages
  platform?: Platform;     // e-commerce only
  tagline_en: string;
  tagline_es: string;
  forYou_en: string;
  forYou_es: string;
  includes: { en: string; es: string }[];
  achieve_en: string;
  achieve_es: string;
  price: number;
  delivery_en: string;
  delivery_es: string;
  addons_en?: string;
  addons_es?: string;
  cta: CtaKind;
}

/* ---------------- LINE 1 — BUSINESS WEBSITES ---------------- */
export const BUSINESS: Pkg[] = [
  {
    id: 'landing-page',
    level_en: 'Level 1 · Presence',
    level_es: 'Nivel 1 · Presencia',
    name: 'Landing Page',
    tagline_en: 'Your first professional website, ready to get you calls',
    tagline_es: 'Tu primera web profesional, lista para que te llamen',
    forYou_en: "you're just starting out and need an online presence that builds trust without overspending.",
    forYou_es: 'estás empezando y necesitas presencia en línea que genere confianza sin gastar de más.',
    includes: [
      { en: 'A single page that earns trust at first glance', es: 'Una página que da confianza desde el primer vistazo' },
      { en: 'Looks perfect on mobile', es: 'Se ve perfecta en el celular' },
      { en: 'WhatsApp & click-to-call buttons so they reach you instantly', es: 'Botón de WhatsApp y llamada directa para que te contacten al instante' },
      { en: 'Services, testimonials & FAQs that answer for you', es: 'Servicios, testimonios y preguntas frecuentes que responden por ti' },
      { en: 'Optimized to show up when they search you on Google', es: 'Optimizada para aparecer cuando te buscan en Google' },
      { en: 'Hosting, domain & security ready — zero technical work for you', es: 'Hosting, dominio y seguridad listos, sin que toques nada técnico' },
    ],
    achieve_en: 'A professional presence that turns visits into calls.',
    achieve_es: 'Presencia profesional que convierte visitas en llamadas.',
    price: 1500,
    delivery_en: '1 month',
    delivery_es: '1 mes',
    cta: 'plan',
  },
  {
    id: 'corporate-business',
    level_en: 'Level 2 · Growth',
    level_es: 'Nivel 2 · Crecimiento',
    badge_en: 'Best Seller',
    badge_es: 'Más vendido',
    name: 'Corporate Business',
    tagline_en: 'The website that makes your business look big',
    tagline_es: 'El sitio que hace que tu negocio se vea grande',
    forYou_en: 'your business has grown and you need a corporate site that reflects that seriousness.',
    forYou_es: 'tu negocio ya creció y necesitas un sitio corporativo que refleje esa seriedad.',
    includes: [
      { en: 'Up to 10 pages that showcase everything you offer', es: 'Hasta 10 páginas que muestran todo lo que ofreces' },
      { en: 'Update text & images yourself — no one to depend on', es: 'Tú mismo actualizas textos e imágenes, sin depender de nadie' },
      { en: 'A page per service that Google can rank', es: 'Una página por servicio que Google puede posicionar' },
      { en: 'A blog that brings free traffic and positions you as the expert', es: 'Blog que te trae visitas gratis y te posiciona como experto' },
      { en: 'Clients book appointments on their own — no back-and-forth calls', es: 'Tus clientes agendan citas solos, sin llamadas de ida y vuelta' },
      { en: 'Your Google Business Profile optimized so they find you locally', es: 'Tu ficha de Google optimizada para que te encuentren en tu zona' },
    ],
    achieve_en: 'A site that projects authority and brings in clients from your city.',
    achieve_es: 'Un sitio que proyecta seriedad y te trae clientes de tu ciudad.',
    price: 4200,
    delivery_en: '2 months',
    delivery_es: '2 meses',
    addons_en: 'bilingual ES/EN · email marketing',
    addons_es: 'bilingüe ES/EN · email marketing',
    cta: 'plan',
  },
  {
    id: 'lead-generation',
    level_en: 'Level 3 · Lead Capture',
    level_es: 'Nivel 3 · Captación',
    badge_en: 'Best ROI',
    badge_es: 'Mejor ROI',
    name: 'Lead Generation',
    tagline_en: 'The website that turns your ads into clients',
    tagline_es: 'El sitio que convierte tus anuncios en clientes',
    forYou_en: 'you invest in advertising or live on winning clients, and need a site engineered to convert.',
    forYou_es: 'inviertes en publicidad o vives de captar clientes, y necesitas un sitio diseñado para convertir.',
    includes: [
      { en: 'A page per service, ready for each Google & Meta Ads campaign', es: 'Una página por servicio, lista para cada campaña de Google y Meta Ads' },
      { en: 'City pages that rank you in every area you serve', es: 'Páginas por ciudad que te posicionan en cada zona donde trabajas' },
      { en: 'Advanced SEO that brings free clients and lowers your ad cost', es: 'SEO avanzado que te trae clientes gratis y baja tu costo de ads' },
      { en: 'Lead-capture forms built to get their details', es: 'Formularios de captación hechos para que dejen sus datos' },
      { en: 'Prospects book an appointment online instantly', es: 'Tus prospectos agendan cita en línea al instante' },
      { en: 'Know which ad and page brings each client and each call', es: 'Sabes qué anuncio y qué página te trae cada cliente y cada llamada' },
    ],
    achieve_en: 'More qualified leads and less money wasted on advertising.',
    achieve_es: 'Más clientes potenciales y menos dinero gastado en publicidad.',
    price: 6800,
    delivery_en: '3 months',
    delivery_es: '3 meses',
    cta: 'plan',
  },
  {
    id: 'corporate-portal-suite',
    level_en: 'Level 4 · Portal',
    level_es: 'Nivel 4 · Portal',
    name: 'Corporate Portal Suite',
    tagline_en: 'A portal where your clients and team operate in one place',
    tagline_es: 'Un portal donde tus clientes y tu equipo operan en un solo lugar',
    forYou_en: 'you need more than a site: a portal with users who register, access private information, and connect to your systems.',
    forYou_es: 'necesitas más que un sitio: un portal con usuarios que se registran, acceden a información privada y se conecta con tus sistemas.',
    includes: [
      { en: 'Clients and team log in with their own accounts', es: 'Tus clientes y tu equipo entran con su propio usuario' },
      { en: "Everyone sees only what's theirs (admin, client, employee)", es: 'Cada quien ve solo lo que le corresponde (admin, cliente, empleado)' },
      { en: 'A private dashboard to manage their records and tracking', es: 'Un panel privado donde llevan sus registros y seguimiento' },
      { en: 'Connects to your CRM or the system you already use', es: 'Se conecta con tu CRM o el sistema que ya usas' },
      { en: 'A private resource library for your clients', es: 'Una biblioteca privada de recursos para tus clientes' },
      { en: 'Up to 25 pages with content you manage yourself', es: 'Hasta 25 páginas con contenido que tú administras' },
    ],
    achieve_en: 'A complete portal that serves your users straight from the web.',
    achieve_es: 'Un portal completo que atiende a tus usuarios desde la web.',
    price: 11900,
    delivery_en: '3.5 months',
    delivery_es: '3.5 meses',
    addons_en: 'Stripe · accounting sync · KPI dashboard',
    addons_es: 'Stripe · sync contable · dashboard de KPIs',
    cta: 'sales',
  },
];

/* ---------------- LINE 2 — E-COMMERCE WEBSITES ---------------- */
export const ECOMMERCE: Pkg[] = [
  {
    id: 'starter-store',
    level_en: 'Level 1 · Launch',
    level_es: 'Nivel 1 · Lanzamiento',
    name: 'Starter Store',
    platform: 'Webflow',
    tagline_en: 'Your online store, ready to start selling fast',
    tagline_es: 'Tu tienda online, lista para empezar a vender rápido',
    forYou_en: "you're starting out, have a few products, and want to look professional without overspending.",
    forYou_es: 'estás empezando, tienes pocos productos y quieres verte profesional sin gastar de más.',
    includes: [
      { en: 'A store designed for you, not a generic template', es: 'Una tienda diseñada para ti, no una plantilla genérica' },
      { en: 'Looks perfect on mobile, where most customers buy', es: 'Se ve perfecta en el celular, donde compra la mayoría' },
      { en: 'Take card, PayPal, Apple & Google Pay from day one', es: 'Cobra con tarjeta, PayPal, Apple y Google Pay desde el día 1' },
      { en: 'A streamlined checkout so customers buy in just a few clicks', es: 'Un checkout ágil para que tus clientes compren en pocos clics' },
      { en: 'Every sale confirms itself and calculates taxes', es: 'Cada venta confirma sola y calcula impuestos' },
      { en: 'Ready for Google and your social channels to find it', es: 'Lista para que Google y tus redes la encuentren' },
    ],
    achieve_en: 'Start selling online fast — and look professional doing it.',
    achieve_es: 'Empezar a vender en línea rápido y verte profesional.',
    price: 1600,
    delivery_en: '1 month',
    delivery_es: '1 mes',
    cta: 'plan',
  },
  {
    id: 'brand-store',
    level_en: 'Level 2 · Brand',
    level_es: 'Nivel 2 · Marca',
    badge_en: 'Most Chosen on Webflow',
    badge_es: 'El más elegido en Webflow',
    name: 'Brand Store',
    platform: 'Webflow',
    tagline_en: 'A store as premium as your brand',
    tagline_es: 'Una tienda tan premium como tu marca',
    forYou_en: 'you already have a brand and want a unique store that tells your story and organizes your catalog well.',
    forYou_es: 'ya tienes marca y quieres una tienda única que cuente tu historia y organice bien tu catálogo.',
    includes: [
      { en: '100% custom design for your brand — no templates', es: 'Diseño 100% a la medida de tu marca, nada de plantillas' },
      { en: 'Up to 500 products organized by categories and filters', es: 'Hasta 500 productos organizados por categorías y filtros' },
      { en: 'A blog that brings free traffic from Google', es: 'Blog que te trae visitas gratis desde Google' },
      { en: 'Customer reviews that sell for you', es: 'Reseñas de clientes que venden por ti' },
      { en: 'Customers save favorites and return with their account', es: 'Tus clientes guardan favoritos y vuelven con su cuenta' },
      { en: 'Sell by subscription if your product restocks', es: 'Vende por suscripción si tu producto se repone' },
    ],
    achieve_en: 'A store that stands out, attracts traffic, and converts.',
    achieve_es: 'Una tienda que destaca, atrae tráfico y convierte.',
    price: 4200,
    delivery_en: '2 months',
    delivery_es: '2 meses',
    cta: 'plan',
  },
  {
    id: 'scale-store',
    level_en: 'Level 3 · Scale',
    level_es: 'Nivel 3 · Escala',
    badge_en: 'Best Return',
    badge_es: 'El de mejor retorno',
    name: 'Scale Store',
    platform: 'Shopify',
    tagline_en: 'Sell more to the customers you already have',
    tagline_es: 'Vende más a los clientes que ya tienes',
    forYou_en: 'you already sell and want recurring revenue — to stop depending only on advertising.',
    forYou_es: 'ya vendes y quieres ingresos recurrentes y dejar de depender solo de la publicidad.',
    includes: [
      { en: 'Automatically recover abandoned-cart sales you lose today', es: 'Recupera solo las ventas de carritos abandonados que hoy pierdes' },
      { en: 'Emails and SMS that bring your customers back', es: 'Emails y SMS que traen de vuelta a tus clientes' },
      { en: 'Predictable revenue with subscriptions and recurring payments', es: 'Ingresos predecibles con suscripciones y pagos recurrentes' },
      { en: 'A points program that rewards repeat buyers', es: 'Programa de puntos que premia a quien vuelve a comprar' },
      { en: 'Let them pay in installments without you taking the risk', es: 'Deja que paguen a plazos sin que tú asumas el riesgo' },
      { en: 'Sell in other currencies and reach customers abroad', es: 'Vende en otras monedas y llega a clientes de otros países' },
    ],
    achieve_en: 'More revenue per customer and less spend acquiring new ones.',
    achieve_es: 'Más ventas por cliente y menos gasto en captar nuevos.',
    price: 6800,
    delivery_en: '3 months',
    delivery_es: '3 meses',
    cta: 'plan',
  },
  {
    id: 'enterprise-store',
    level_en: 'Level 4 · Omnichannel',
    level_es: 'Nivel 4 · Omnicanal',
    name: 'Enterprise Store',
    platform: 'Shopify',
    tagline_en: 'Sell everywhere from a single place',
    tagline_es: 'Vende en todos lados desde un solo lugar',
    forYou_en: 'you sell across multiple channels, manage heavy inventory, and need everything working in sync.',
    forYou_es: 'vendes en varios canales, manejas mucho inventario y necesitas que todo funcione sincronizado.',
    includes: [
      { en: 'Sell on TikTok Shop, Instagram, Pinterest & Google without double work', es: 'Vende en TikTok Shop, Instagram, Pinterest y Google sin duplicar trabajo' },
      { en: 'Inventory syncs itself across every channel and warehouse', es: 'Tu inventario se sincroniza solo en todos los canales y bodegas' },
      { en: '1-click checkout that drives conversion', es: 'Checkout de 1 clic que dispara la conversión' },
      { en: 'An AI assistant that answers and sells 24/7 for you', es: 'Un asistente con IA responde y vende 24/7 por ti' },
      { en: 'Payments, shipping & stock automated — no chaos', es: 'Cobros, envíos y stock automatizados, sin caos' },
      { en: 'Launch with 1 month of managed advertising included', es: 'Arrancas con 1 mes de publicidad gestionada incluida' },
    ],
    achieve_en: 'Scale your omnichannel operation without it spiraling out of control.',
    achieve_es: 'Escalar tu operación omnicanal sin que se salga de control.',
    price: 12900,
    delivery_en: '4 months',
    delivery_es: '4 meses',
    addons_en: 'advanced Stripe · 3D viewer · product configurator',
    addons_es: 'Stripe avanzado · 3D viewer · configurador de producto',
    cta: 'sales',
  },
];
