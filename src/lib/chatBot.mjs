/**
 * SENAVIA sales chat — the brain behind /api/chat.
 *
 * The old brain was an n8n Cloud workflow calling Gemini. Both subscriptions
 * lapsed: n8n Cloud now serves its "404 - No workspace here" page for the whole
 * host, and /api/chat forwarded that HTML straight into the chat bubble. This
 * replacement talks to nothing, so it cannot lapse, rate-limit or bill.
 *
 * ponytail: keyword routing, not an LLM. Good enough because the chat's job is
 * to answer the five questions visitors actually ask and hand off to the Cal.com
 * booking. Upgrade path: swap botReply() for a model call keeping the same
 * contract ({ text, lang } -> markdown string) and the route needs no changes.
 *
 * Prices and delivery times are imported from the pricing page's own data so the
 * two can never drift apart.
 *
 * Self-check: npm run check:chat
 */
import { BUSINESS, ECOMMERCE } from '../data/pricing.ts';

const PHONE = '(754) 262-3659';
const TEL = 'tel:+17542623659';
const EMAIL = 'info@senaviacorp.com';
const BOOK = { en: '[Book a free 30-min call](/schedule)', es: '[Agenda una llamada gratis de 30 min](/schedule)' };
const CALL = `[${PHONE}](${TEL})`;

const money = (n) => '$' + n.toLocaleString('en-US');

/** "- **Landing Page** — $1,500 · 1 month" */
const table = (pkgs, lang) =>
  pkgs
    .map((p) => {
      const delivery = lang === 'es' ? p.delivery_es : p.delivery_en;
      const platform = p.platform ? ` (${p.platform})` : '';
      return `- **${p.name}**${platform} — ${money(p.price)} · ${delivery}`;
    })
    .join('\n');

const range = (pkgs) => `${money(pkgs[0].price)} – ${money(pkgs[pkgs.length - 1].price)}`;

const T = {
  en: {
    priceBusiness: () =>
      `Transparent, fixed-price packages — no hidden fees:\n\n${table(BUSINESS, 'en')}\n\n` +
      `Every build includes hosting & SSL, on-page SEO, GA4 tracking, CMS training and 30 days of post-launch optimization.\n\n` +
      `Full breakdown on [Pricing](/pricing), or get an instant ballpark with the [cost estimator](/website-cost-estimator-online).\n` +
      `Want an exact number for your project? ${BOOK.en}.`,
    priceEcommerce: () =>
      `Online store packages:\n\n${table(ECOMMERCE, 'en')}\n\n` +
      `Webflow for brand-led stores, Shopify when you need heavy catalog and multichannel selling — we'll tell you which fits on the call.\n` +
      `See [Pricing](/pricing) or ${BOOK.en}.`,
    priceTraffic: () =>
      `SEO, Google Ads and GEO are priced per market — it depends on your competition, keywords and ad budget, so we quote after a short audit instead of guessing.\n` +
      `${BOOK.en} and we'll come with real numbers. More on [Traffic Generation](/services/traffic-generation).`,
    booking: () =>
      `Happy to — 30 minutes, free, no pitch: ${BOOK.en}.\n` +
      `Prefer the phone? Call or text ${CALL}, Mon–Fri 8:00am–6:00pm.`,
    design: () =>
      `100% custom web design — never templates. Conversion-focused UX/UI, mobile-first, technical SEO built in, and bilingual EN/ES. See [Custom Web Design](/services/web-design).\n` +
      `Business sites run ${range(BUSINESS)} depending on scope ([pricing](/pricing)).\n` +
      `Want us to look at your current site? ${BOOK.en}.`,
    ecommerce: () =>
      `We build online stores on Webflow and Shopify — product pages that sell, checkout that doesn't leak, and analytics wired from day one. Packages run ${range(ECOMMERCE)}.\n` +
      `See [Pricing](/pricing) or ${BOOK.en}.`,
    traffic: () =>
      `Traffic Generation — SEO, Google Ads (SEM) and GEO (getting picked up by AI search) working together. We're a Google Partner-certified agency in Plantation, FL. See [Traffic Generation](/services/traffic-generation).\n` +
      `${BOOK.en} for a quick audit of where your traffic is leaking.`,
    dev: () =>
      `Web development — admin panels, client portals, CRM/ERP integrations and workflow automation built around how your team actually works. See [Web Development](/services/web-development).\n` +
      `Scope drives the price here, so it starts with a short discovery call: ${BOOK.en}.`,
    timeline: () =>
      `Delivery by package:\n\n${table(BUSINESS, 'en')}\n\nStores run ${ECOMMERCE[0].delivery_en} to ${ECOMMERCE[ECOMMERCE.length - 1].delivery_en}. Every project also includes 30 days of post-launch optimization.\n` +
      `Need a firm date for yours? ${BOOK.en}.`,
    portfolio: () =>
      `Take a look: [Portfolio](/portfolio) and [video testimonials](/testimonials) from our South Florida clients.\n` +
      `See something close to what you need? ${BOOK.en}.`,
    contact: () =>
      `Of course — real humans, based in Plantation, FL:\n\n` +
      `- Phone or text: ${CALL} · Mon–Fri 8:00am–6:00pm\n` +
      `- Email: [${EMAIL}](mailto:${EMAIL})\n` +
      `- Or pick a time directly: ${BOOK.en}`,
    shared: () =>
      `Thanks! Heads-up: this chat doesn't deliver messages to the team, so the fastest way to reach us is to grab a slot — ${BOOK.en} — or call/text ${CALL} and a human picks up.`,
    greeting: () =>
      `Hi 👋 I can help with pricing, timelines and what we build.\n` +
      `What are you after — a **website**, an **online store**, or **more traffic** (SEO/Ads)?\n` +
      `Or skip ahead: ${BOOK.en}.`,
    fallback: () =>
      `I can help with:\n\n` +
      `- **Pricing & packages** — "how much for a website?"\n` +
      `- **What we build** — web design, online stores, portals, SEO & Ads\n` +
      `- **Timelines** — "how long does it take?"\n` +
      `- **A human** — phone, email or a free call\n\n` +
      `Or jump straight to it: ${BOOK.en} · ${CALL}`,
  },
  es: {
    priceBusiness: () =>
      `Precios fijos y transparentes — sin costos ocultos:\n\n${table(BUSINESS, 'es')}\n\n` +
      `Todo proyecto incluye hosting y SSL, SEO on-page, GA4, capacitación en el CMS y 30 días de optimización post-lanzamiento.\n\n` +
      `Detalle completo en [Precios](/pricing), o un estimado al instante con el [estimador de costos](/website-cost-estimator-online).\n` +
      `¿Quieres el número exacto para tu proyecto? ${BOOK.es}.`,
    priceEcommerce: () =>
      `Paquetes de tienda en línea:\n\n${table(ECOMMERCE, 'es')}\n\n` +
      `Webflow para tiendas de marca, Shopify cuando necesitas catálogo grande y venta multicanal — en la llamada te decimos cuál te conviene.\n` +
      `Mira [Precios](/pricing) o ${BOOK.es}.`,
    priceTraffic: () =>
      `El SEO, Google Ads y GEO se cotizan por mercado: dependen de tu competencia, las palabras clave y el presupuesto de pauta, así que cotizamos después de una auditoría corta en vez de adivinar.\n` +
      `${BOOK.es} y llegamos con números reales. Más en [Generación de Tráfico](/services/traffic-generation).`,
    booking: () =>
      `Con gusto — 30 minutos, gratis y sin compromiso: ${BOOK.es}.\n` +
      `¿Prefieres el teléfono? Llama o escribe a ${CALL}, Lun–Vie 8:00am–6:00pm.`,
    design: () =>
      `Diseño web 100% a medida — nada de plantillas. UX/UI enfocado en conversión, mobile-first, SEO técnico incluido y soporte bilingüe EN/ES. Mira [Diseño Web Personalizado](/services/web-design).\n` +
      `Los sitios empresariales van de ${range(BUSINESS)} según el alcance ([precios](/pricing)).\n` +
      `¿Quieres que revisemos tu sitio actual? ${BOOK.es}.`,
    ecommerce: () =>
      `Construimos tiendas en Webflow y Shopify — fichas de producto que venden, checkout que no pierde clientes y analítica conectada desde el día uno. Los paquetes van de ${range(ECOMMERCE)}.\n` +
      `Mira [Precios](/pricing) o ${BOOK.es}.`,
    traffic: () =>
      `Generación de Tráfico — SEO, Google Ads (SEM) y GEO (aparecer en las búsquedas con IA) trabajando juntos. Somos agencia certificada Google Partner en Plantation, FL. Mira [Generación de Tráfico](/services/traffic-generation).\n` +
      `${BOOK.es} y revisamos por dónde se te está escapando el tráfico.`,
    dev: () =>
      `Desarrollo web — paneles de administración, portales para clientes, integraciones CRM/ERP y automatización de flujos, hechos a la medida de cómo trabaja tu equipo. Mira [Desarrollo Web](/services/web-development).\n` +
      `Aquí el alcance define el precio, así que empieza con una llamada corta: ${BOOK.es}.`,
    timeline: () =>
      `Tiempos de entrega por paquete:\n\n${table(BUSINESS, 'es')}\n\nLas tiendas van de ${ECOMMERCE[0].delivery_es} a ${ECOMMERCE[ECOMMERCE.length - 1].delivery_es}. Todo proyecto incluye además 30 días de optimización post-lanzamiento.\n` +
      `¿Necesitas una fecha firme para el tuyo? ${BOOK.es}.`,
    portfolio: () =>
      `Míralo tú mismo: [Portafolio](/portfolio) y [testimonios en video](/testimonials) de nuestros clientes en el sur de Florida.\n` +
      `¿Viste algo parecido a lo que necesitas? ${BOOK.es}.`,
    contact: () =>
      `Claro — personas reales, en Plantation, FL:\n\n` +
      `- Teléfono o mensaje: ${CALL} · Lun–Vie 8:00am–6:00pm\n` +
      `- Correo: [${EMAIL}](mailto:${EMAIL})\n` +
      `- O elige un horario directo: ${BOOK.es}`,
    shared: () =>
      `¡Gracias! Un aviso: este chat no entrega mensajes al equipo, así que lo más rápido es tomar un horario — ${BOOK.es} — o llamar/escribir al ${CALL} y te atiende una persona.`,
    greeting: () =>
      `¡Hola! 👋 Te puedo ayudar con precios, tiempos y lo que construimos.\n` +
      `¿Qué buscas — un **sitio web**, una **tienda en línea** o **más tráfico** (SEO/Ads)?\n` +
      `O ve directo al grano: ${BOOK.es}.`,
    fallback: () =>
      `Te puedo ayudar con:\n\n` +
      `- **Precios y paquetes** — "¿cuánto cuesta un sitio web?"\n` +
      `- **Lo que construimos** — diseño web, tiendas, portales, SEO y Ads\n` +
      `- **Tiempos** — "¿cuánto se demora?"\n` +
      `- **Una persona** — teléfono, correo o llamada gratis\n\n` +
      `O ve directo: ${BOOK.es} · ${CALL}`,
  },
};

// Every alternation is wrapped in a group so both \b anchors apply to all of it.
// Ungrouped, /\bseo|ads?|...\b/ matches "ad" inside "admin" and routes a CRM
// question to the SEO answer.
const RE = {
  shared: /[\w.+-]+@[\w-]+\.[a-z]{2,}|\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/i,
  price: /\b(price|pricing|costs?|quote|budget|how much|cheap|expensive|afford|invest|precios?|costos?|cuesta|cuanto|cuánto|cotiza\w*|presupuesto)\b/i,
  ecommerce: /\b(e-?commerce|shop|store|shopify|cart|checkout|sell online|tienda|carrito|vender en línea|vender en linea)\b/i,
  traffic: /\b(seo|sem|ppc|ads?|adwords|traffic|ranking|rank|leads|geo|marketing|posicionamiento|tráfico|trafico|publicidad|pauta|anuncios)\b/i,
  dev: /\b(develop|developers?|development|apps?|application|portal|crm|erp|dashboard|admin|panel|integrations?|automat\w*|api|software|desarrollo|integración|integracion)\b/i,
  design: /\b(design|redesign|website|web site|web page|landing|brand|logo|ux|ui|diseño|diseno|rediseño|rediseno|sitio|página web|pagina web|web)\b/i,
  booking: /\b(book|schedule|appointment|meeting|consult\w*|demo|call me|free call|agendar|cita|reunión|reunion|llamada|asesoría|asesoria)\b/i,
  timeline: /\b(how long|timeline|deadline|how fast|delivery|turnaround|weeks|months|cuánto tiempo|cuanto tiempo|plazo|demora|tarda|entrega|rápido|rapido)\b/i,
  portfolio: /\b(portfolio|examples?|samples?|case stud\w*|your work|clients|references|reviews|testimonials?|portafolio|ejemplos?|trabajos|casos|clientes|referencias|testimonios?)\b/i,
  contact: /\b(human|person|agent|representative|talk to|speak (to|with)|someone|contact|phone|email|address|where are you|located|office|hours|humano|persona|asesor|hablar con|alguien|contacto|teléfono|telefono|correo|dirección|direccion|dónde|donde|oficina|horario)\b/i,
  spanish: /\b(hablan|habla|hablas|speak)\s+(español|espanol|spanish)\b|^\s*(español|espanol|spanish)\s*\??\s*$/i,
  greeting: /^\s*(hi|hey|hello|good (morning|afternoon|evening)|hola|buenas|buenos días|buenos dias|buenas tardes|qué tal|que tal|holi|saludos)\b/i,
  es: /[áéíóúñ¿¡]|\b(hola|buenas|gracias|precios?|cuánto|cuanto|cuesta|quiero|necesito|tienda|sitio|página|pagina|ayuda|español|espanol|dónde|donde|cómo|una|para|con|mi|tengo|hacer|puedo)\b/i,
  en: /\b(the|is|are|do|does|did|you|your|i|we|my|how|what|when|where|much|cost|price|need|want|looking|website|site|hello|thanks|can|would|have|about)\b/i,
};

/**
 * Which language to answer in. What the visitor typed wins over the page
 * language, so an English speaker on /es (or the reverse) still gets answered in
 * their own language. Neither signal → trust the page.
 */
export function pickLang(text, siteLang) {
  const t = String(text || '');
  if (RE.es.test(t)) return 'es';
  if (RE.en.test(t)) return 'en';
  return siteLang === 'es' ? 'es' : 'en';
}

/** Name of the reply to send. Order matters: the specific rules run before the broad ones. */
export function route(text) {
  const t = String(text || '').trim();
  if (!t) return 'greeting';
  if (RE.shared.test(t)) return 'shared';
  if (RE.price.test(t)) {
    if (RE.ecommerce.test(t)) return 'priceEcommerce';
    if (RE.traffic.test(t) && !RE.design.test(t)) return 'priceTraffic';
    return 'priceBusiness';
  }
  if (RE.booking.test(t)) return 'booking';
  if (RE.timeline.test(t)) return 'timeline';
  if (RE.portfolio.test(t)) return 'portfolio';
  if (RE.ecommerce.test(t)) return 'ecommerce';
  if (RE.traffic.test(t)) return 'traffic';
  if (RE.dev.test(t)) return 'dev';
  if (RE.design.test(t)) return 'design';
  if (RE.spanish.test(t)) return 'contact';
  if (RE.contact.test(t)) return 'contact';
  if (RE.greeting.test(t)) return 'greeting';
  return 'fallback';
}

/**
 * @param {{ text?: string, lang?: string }} input
 * @returns {string} markdown — the widget renders it and reads it from `output`.
 */
export function botReply({ text = '', lang } = {}) {
  const l = pickLang(text, lang);
  return T[l][route(text)]();
}
