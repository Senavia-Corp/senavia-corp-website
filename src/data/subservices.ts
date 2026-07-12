// Data-driven content for the Web Design subservice pages.
// One template (src/pages/services/web-design/[slug].astro) renders all of these.
// Images live at /images/subservices/<slug>-hero.avif and -intro.avif.

export interface Feature {
  icon: string; // lucide icon name
  title_en: string;
  title_es: string;
  body_en: string;
  body_es: string;
}

export interface Faq {
  q_en: string;
  q_es: string;
  a_en: string;
  a_es: string;
}

export interface Subservice {
  slug: string;
  accent: 'purple' | 'cyan' | 'green';
  icon: string; // lucide icon for hero/eyebrow
  num: string;

  metaTitle: string;
  metaDescription: string;

  eyebrow_en: string; eyebrow_es: string;
  h1_en: string; h1_es: string;
  heroSub_en: string; heroSub_es: string;

  introH2_en: string; introH2_es: string;
  introBody_en: string[]; introBody_es: string[];
  introBadge_en: string; introBadge_es: string;

  deliverables: Feature[];
  benefits: Feature[];

  idealFor_en: string[]; idealFor_es: string[];

  faq: Faq[];

  /* Optional per-subservice testimonials copy for the shared
     ProcessTestimonials section; falls back to the home copy when absent. */
  testimonialsTitle_en?: string; testimonialsTitle_es?: string;
  testimonialsIntro_en?: string; testimonialsIntro_es?: string;

  related: string[]; // sibling slugs
}

export const SUBSERVICES: Subservice[] = [
  // ── 01 · Business Website Design ───────────────────────────────────────────
  {
    slug: 'business-website-design',
    accent: 'purple',
    icon: 'lucide:briefcase',
    num: '01',
    metaTitle: 'Business Website Design in Miami — SENAVIA Corp',
    metaDescription:
      'Custom business website design in Miami & South Florida. Conversion-focused, mobile-first sites built on local SEO that turn searches into booked leads.',
    eyebrow_en: 'Business Website Design · Miami',
    eyebrow_es: 'Diseño Web de Negocio · Miami',
    h1_en: 'Business Website Design That Turns Local Searches Into Booked Leads',
    h1_es: 'Diseño Web de Negocio que Convierte Búsquedas Locales en Clientes',
    heroSub_en:
      'Clean, mobile-first websites for South Florida businesses — built on SEO architecture and engineered to turn visitors into calls, form fills, and booked jobs. 100% custom, never a template.',
    heroSub_es:
      'Sitios web limpios y mobile-first para negocios del Sur de Florida — construidos sobre arquitectura SEO y diseñados para convertir visitantes en llamadas, formularios y trabajos agendados. 100% personalizados, nunca una plantilla.',
    introH2_en: 'Websites Built Around How Your Customers Actually Decide',
    introH2_es: 'Sitios Web Construidos en Torno a Cómo Deciden Realmente sus Clientes',
    introBody_en: [
      'SENAVIA designs 100% custom business websites for contractors, service companies, and local brands across Miami-Dade, Broward, and Palm Beach. No prebuilt themes — every page is structured around the action you want a visitor to take.',
      'As a Google Partner-certified, bilingual EN/ES team, we pair clean design with local SEO and conversion architecture — so your site does not just look professional, it brings in calls, quotes, and booked jobs month after month.',
    ],
    introBody_es: [
      'SENAVIA diseña sitios web de negocio 100% personalizados para contratistas, empresas de servicios y marcas locales en Miami-Dade, Broward y Palm Beach. Sin temas prediseñados — cada página se estructura en torno a la acción que quiere que tome el visitante.',
      'Como equipo bilingüe EN/ES certificado como Google Partner, combinamos diseño limpio con SEO local y arquitectura de conversión — para que su sitio no solo se vea profesional, sino que genere llamadas, cotizaciones y trabajos mes tras mes.',
    ],
    introBadge_en: '100% Custom · No Templates',
    introBadge_es: '100% Personalizado · Sin Plantillas',
    deliverables: [
      { icon: 'lucide:layout', title_en: 'Conversion-First Homepage', title_es: 'Inicio Enfocado en Conversión',
        body_en: 'A homepage architected around your #1 action — call, quote, or booking — with a clear message above the fold.',
        body_es: 'Una página de inicio diseñada en torno a su acción principal — llamar, cotizar o agendar — con un mensaje claro en la primera vista.' },
      { icon: 'lucide:search-check', title_en: 'Local SEO Architecture', title_es: 'Arquitectura SEO Local',
        body_en: 'Service and location pages, schema markup, and Core Web Vitals tuning so you rank across South Florida searches.',
        body_es: 'Páginas de servicio y ubicación, marcado schema y optimización de Core Web Vitals para posicionar en las búsquedas del Sur de Florida.' },
      { icon: 'lucide:smartphone', title_en: 'Mobile-First Design', title_es: 'Diseño Mobile-First',
        body_en: 'Most local searches happen on a phone — your site is designed for that screen first: fast and tap-friendly.',
        body_es: 'La mayoría de las búsquedas locales ocurren en el celular — su sitio se diseña primero para esa pantalla: rápido y fácil de tocar.' },
      { icon: 'lucide:file-text', title_en: 'Lead-Capture Forms', title_es: 'Formularios de Captación',
        body_en: 'Quote requests, contact, and booking forms wired to reach you instantly so you never lose a lead.',
        body_es: 'Solicitudes de cotización, contacto y reserva conectados para llegarle al instante y no perder ningún cliente.' },
      { icon: 'lucide:badge-check', title_en: 'Reviews & Trust Signals', title_es: 'Reseñas y Señales de Confianza',
        body_en: 'Google reviews, certifications, and trust badges placed where they tip the decision in your favor.',
        body_es: 'Reseñas de Google, certificaciones y sellos de confianza ubicados donde inclinan la decisión a su favor.' },
    ],
    benefits: [
      { icon: 'lucide:badge-check', title_en: 'Google Partner-Certified Team', title_es: 'Equipo Certificado Google Partner',
        body_en: 'Verified agency status and ongoing training on the latest Google products.',
        body_es: 'Estatus de agencia verificada y formación continua en los últimos productos de Google.' },
      { icon: 'lucide:languages', title_en: 'Bilingual EN / ES', title_es: 'Servicio Bilingüe EN / ES',
        body_en: 'Design, copy, and SEO delivered fluently in both languages — for both audiences.',
        body_es: 'Diseño, redacción y SEO con fluidez en ambos idiomas — para ambas audiencias.' },
      { icon: 'lucide:map-pin', title_en: 'Local South Florida Expertise', title_es: 'Experiencia Local en el Sur de Florida',
        body_en: 'Deep market knowledge across Miami-Dade, Broward, and Palm Beach.',
        body_es: 'Profundo conocimiento del mercado en Miami-Dade, Broward y Palm Beach.' },
      { icon: 'lucide:target', title_en: 'Built to Convert', title_es: 'Diseñado para Convertir',
        body_en: 'Every page is built around a measurable action — and tracked after launch.',
        body_es: 'Cada página se construye en torno a una acción medible — y se mide tras el lanzamiento.' },
      { icon: 'lucide:zap', title_en: 'Fast & Mobile-Optimized', title_es: 'Rápido y Optimizado para Móvil',
        body_en: 'Lightweight builds that score high on PageSpeed and feel instant on any device.',
        body_es: 'Desarrollos ligeros con alto puntaje en PageSpeed que se sienten instantáneos en cualquier dispositivo.' },
      { icon: 'lucide:trending-up', title_en: 'Ongoing Optimization', title_es: 'Optimización Continua',
        body_en: 'Post-launch SEO, content, and CRO support — we stay accountable to results.',
        body_es: 'Soporte post-lanzamiento de SEO, contenido y CRO — respondemos por los resultados.' },
    ],
    idealFor_en: ['Contractors & home services', 'Local retailers & shops', 'Professional services', 'Restaurants & hospitality', 'Clinics & wellness', 'Growing small businesses'],
    idealFor_es: ['Contratistas y servicios para el hogar', 'Tiendas y comercios locales', 'Servicios profesionales', 'Restaurantes y hospitalidad', 'Clínicas y bienestar', 'Pequeñas empresas en crecimiento'],
    faq: [
      { q_en: 'How long does a business website take to launch?', q_es: '¿Cuánto tarda en lanzarse un sitio web de negocio?',
        a_en: 'Most business sites launch in 3–6 weeks, depending on page count and how ready your content is. We give you a clear timeline at the start of the project.',
        a_es: 'La mayoría de los sitios se lanzan en 3 a 6 semanas, según la cantidad de páginas y qué tan listo esté su contenido. Le damos un cronograma claro al inicio del proyecto.' },
      { q_en: 'Will my website actually show up on Google?', q_es: '¿Mi sitio web realmente aparecerá en Google?',
        a_en: 'Yes. Every build includes local SEO architecture — service and location pages, schema, and fast performance — so you can rank for South Florida searches. Ongoing SEO accelerates results further.',
        a_es: 'Sí. Cada desarrollo incluye arquitectura de SEO local — páginas de servicio y ubicación, schema y alto rendimiento — para posicionar en las búsquedas del Sur de Florida. El SEO continuo acelera aún más los resultados.' },
      { q_en: 'Do you use templates or build custom?', q_es: '¿Usan plantillas o desarrollan a medida?',
        a_en: 'We build 100% custom — never prebuilt themes. We work across WordPress, Webflow, and Shopify, choosing the platform that fits your business best.',
        a_es: 'Desarrollamos 100% a medida — nunca temas prediseñados. Trabajamos con WordPress, Webflow y Shopify, eligiendo la plataforma que mejor se adapte a su negocio.' },
      { q_en: 'Can the site be in both English and Spanish?', q_es: '¿El sitio puede estar en inglés y español?',
        a_en: 'Yes. We build bilingual EN/ES websites so you reach both audiences across South Florida.',
        a_es: 'Sí. Construimos sitios bilingües EN/ES para que llegue a ambas audiencias en todo el Sur de Florida.' },
      { q_en: 'How much does a business website cost?', q_es: '¿Cuánto cuesta un sitio web de negocio?',
        a_en: 'It depends on scope and page count. We give you a transparent quote on a free consultation — no obligation.',
        a_es: 'Depende del alcance y la cantidad de páginas. Le damos una cotización transparente en una consulta gratuita — sin compromiso.' },
    ],
    testimonialsTitle_en: 'What Local Business Owners Say',
    testimonialsTitle_es: 'Lo Que Dicen los Dueños de Negocios Locales',
    testimonialsIntro_en: 'From service companies to growing brands, South Florida owners trust SENAVIA with the website their business runs on. Hear what launching with our team is like — on camera, in their own words.',
    testimonialsIntro_es: 'De empresas de servicios a marcas en crecimiento, los dueños de negocios del Sur de Florida confían a SENAVIA el sitio web del que vive su negocio. Descubre cómo es lanzar con nuestro equipo — frente a cámara, en sus propias palabras.',

    related: ['landing-page-design', 'website-redesign'],
  },

  // ── 02 · Corporate Website Design ──────────────────────────────────────────
  {
    slug: 'corporate-website-design',
    accent: 'cyan',
    icon: 'lucide:building-2',
    num: '02',
    metaTitle: 'Corporate Website Design in Miami — SENAVIA Corp',
    metaDescription:
      'Premium corporate website design in South Florida. Multi-page platforms with structured information architecture, brand polish, and enterprise scalability.',
    eyebrow_en: 'Corporate Website Design · Miami',
    eyebrow_es: 'Diseño Web Corporativo · Miami',
    h1_en: 'Corporate Website Design Built for Scale and Brand Authority',
    h1_es: 'Diseño Web Corporativo Construido para Escalar y Dar Autoridad de Marca',
    heroSub_en:
      'Premium, multi-page websites for established companies — structured information architecture, brand-level polish, and the scalability larger organizations demand.',
    heroSub_es:
      'Sitios web premium de varias páginas para empresas consolidadas — arquitectura de información estructurada, acabado a nivel de marca y la escalabilidad que exigen las grandes organizaciones.',
    introH2_en: 'A Platform That Grows With Your Organization',
    introH2_es: 'Una Plataforma que Crece con su Organización',
    introBody_en: [
      'Established companies need more than a brochure site. SENAVIA designs corporate web platforms with clear information architecture — services, divisions, about, team, careers, and resources — organized so visitors, partners, and recruits find exactly what they need.',
      'Our Google Partner-certified, bilingual team delivers brand-level polish and a scalable structure, so your site stays consistent and fast as you add pages, regions, and languages over time.',
    ],
    introBody_es: [
      'Las empresas consolidadas necesitan más que un sitio folleto. SENAVIA diseña plataformas web corporativas con una arquitectura de información clara — servicios, divisiones, nosotros, equipo, empleo y recursos — organizada para que visitantes, socios y candidatos encuentren exactamente lo que buscan.',
      'Nuestro equipo bilingüe certificado como Google Partner entrega un acabado a nivel de marca y una estructura escalable, para que su sitio se mantenga consistente y rápido a medida que agrega páginas, regiones e idiomas con el tiempo.',
    ],
    introBadge_en: 'Structured · Scalable',
    introBadge_es: 'Estructurado · Escalable',
    deliverables: [
      { icon: 'lucide:workflow', title_en: 'Information Architecture', title_es: 'Arquitectura de Información',
        body_en: 'A clear sitemap and navigation that organize many pages so every audience finds its path fast.',
        body_es: 'Un mapa del sitio y una navegación claros que organizan muchas páginas para que cada audiencia encuentre su ruta rápido.' },
      { icon: 'lucide:layers', title_en: 'Multi-Page System', title_es: 'Sistema Multipágina',
        body_en: 'Services, divisions, about, team, careers, and resources — built as a consistent, reusable page system.',
        body_es: 'Servicios, divisiones, nosotros, equipo, empleo y recursos — construidos como un sistema de páginas consistente y reutilizable.' },
      { icon: 'lucide:palette', title_en: 'Brand-Level Design', title_es: 'Diseño a Nivel de Marca',
        body_en: 'A polished, on-brand design system with typography, color, and components applied across the whole site.',
        body_es: 'Un sistema de diseño pulido y fiel a la marca con tipografía, color y componentes aplicados en todo el sitio.' },
      { icon: 'lucide:users', title_en: 'Team & Careers Pages', title_es: 'Páginas de Equipo y Empleo',
        body_en: 'Leadership, team, and careers sections that build trust with clients, partners, and future hires.',
        body_es: 'Secciones de liderazgo, equipo y empleo que generan confianza con clientes, socios y futuros colaboradores.' },
      { icon: 'lucide:globe', title_en: 'Bilingual & Scalable', title_es: 'Bilingüe y Escalable',
        body_en: 'EN/ES structure and a CMS-ready foundation so the platform grows without a rebuild.',
        body_es: 'Estructura EN/ES y una base lista para CMS para que la plataforma crezca sin rehacerla.' },
    ],
    benefits: [
      { icon: 'lucide:badge-check', title_en: 'Google Partner-Certified Team', title_es: 'Equipo Certificado Google Partner',
        body_en: 'Verified agency status and ongoing training on the latest Google products.',
        body_es: 'Estatus de agencia verificada y formación continua en los últimos productos de Google.' },
      { icon: 'lucide:layout', title_en: 'Enterprise-Grade Structure', title_es: 'Estructura de Nivel Empresarial',
        body_en: 'A scalable architecture that handles dozens of pages without becoming a maze.',
        body_es: 'Una arquitectura escalable que maneja decenas de páginas sin volverse un laberinto.' },
      { icon: 'lucide:languages', title_en: 'Bilingual EN / ES', title_es: 'Servicio Bilingüe EN / ES',
        body_en: 'Design, copy, and SEO delivered fluently in both languages — for both audiences.',
        body_es: 'Diseño, redacción y SEO con fluidez en ambos idiomas — para ambas audiencias.' },
      { icon: 'lucide:search-check', title_en: 'Technical SEO Included', title_es: 'SEO Técnico Incluido',
        body_en: 'Schema, Core Web Vitals, sitemaps, and AEO structure — part of the build, not an upsell.',
        body_es: 'Schema, Core Web Vitals, sitemaps y estructura AEO — parte del desarrollo, no un costo adicional.' },
      { icon: 'lucide:shield-check', title_en: 'Consistent & Maintainable', title_es: 'Consistente y Mantenible',
        body_en: 'A design system keeps every page on-brand and easy for your team to extend.',
        body_es: 'Un sistema de diseño mantiene cada página fiel a la marca y fácil de ampliar por su equipo.' },
      { icon: 'lucide:trending-up', title_en: 'Ongoing Optimization', title_es: 'Optimización Continua',
        body_en: 'Post-launch SEO, content, and performance support as your organization grows.',
        body_es: 'Soporte post-lanzamiento de SEO, contenido y rendimiento a medida que crece su organización.' },
    ],
    idealFor_en: ['Established companies', 'Multi-location organizations', 'B2B & professional firms', 'Manufacturers & distributors', 'Franchises', 'Companies hiring at scale'],
    idealFor_es: ['Empresas consolidadas', 'Organizaciones con varias ubicaciones', 'Firmas B2B y profesionales', 'Fabricantes y distribuidores', 'Franquicias', 'Empresas que contratan a gran escala'],
    faq: [
      { q_en: 'How is a corporate site different from a business site?', q_es: '¿En qué se diferencia un sitio corporativo de uno de negocio?',
        a_en: 'A corporate site is larger and more structured — multiple departments, services, team, and careers pages — with information architecture and a design system built to scale.',
        a_es: 'Un sitio corporativo es más grande y estructurado — múltiples departamentos, servicios, equipo y páginas de empleo — con arquitectura de información y un sistema de diseño hecho para escalar.' },
      { q_en: 'Can we manage and update content ourselves?', q_es: '¿Podemos gestionar y actualizar el contenido nosotros mismos?',
        a_en: 'Yes. We build on a CMS so your team can edit pages, add news, and publish without touching code.',
        a_es: 'Sí. Construimos sobre un CMS para que su equipo edite páginas, agregue noticias y publique sin tocar código.' },
      { q_en: 'Do you support multiple languages and regions?', q_es: '¿Soportan varios idiomas y regiones?',
        a_en: 'Yes. We build bilingual EN/ES structures and can extend to additional regions as you grow.',
        a_es: 'Sí. Construimos estructuras bilingües EN/ES y podemos extenderlas a más regiones a medida que crece.' },
      { q_en: 'Will the site stay fast with so many pages?', q_es: '¿El sitio se mantendrá rápido con tantas páginas?',
        a_en: 'Yes. We engineer performance from the start — optimized images, clean code, and Core Web Vitals tuning across the platform.',
        a_es: 'Sí. Diseñamos el rendimiento desde el inicio — imágenes optimizadas, código limpio y optimización de Core Web Vitals en toda la plataforma.' },
      { q_en: 'Can you redesign our existing corporate site?', q_es: '¿Pueden rediseñar nuestro sitio corporativo actual?',
        a_en: 'Absolutely — we migrate and modernize existing sites while preserving your SEO. Ask us about a redesign on a free consultation.',
        a_es: 'Por supuesto — migramos y modernizamos sitios existentes preservando su SEO. Pregúntenos por un rediseño en una consulta gratuita.' },
    ],
    testimonialsTitle_en: 'What Corporate Clients Say',
    testimonialsTitle_es: 'Lo Que Dicen Nuestros Clientes Corporativos',
    testimonialsIntro_en: 'Companies across South Florida rely on SENAVIA for corporate websites that project credibility and win business. Hear what working with our team is like — on camera, in their own words.',
    testimonialsIntro_es: 'Empresas de todo el Sur de Florida confían en SENAVIA para sitios corporativos que proyectan credibilidad y generan negocio. Descubre cómo es trabajar con nuestro equipo — frente a cámara, en sus propias palabras.',

    related: ['business-website-design', 'custom-website-development'],
  },

  // ── 03 · Shopify Store Design ──────────────────────────────────────────────
  {
    slug: 'shopify-store-design',
    accent: 'green',
    icon: 'lucide:shopping-bag',
    num: '03',
    metaTitle: 'Shopify Store Design in Miami — SENAVIA Corp',
    metaDescription:
      'High-converting Shopify store design in South Florida. Fast, mobile-optimized storefronts with secure checkout and product pages built to sell from day one.',
    eyebrow_en: 'Shopify Store Design · Miami',
    eyebrow_es: 'Diseño de Tiendas Shopify · Miami',
    h1_en: 'Shopify Store Design Built to Sell From Day One',
    h1_es: 'Diseño de Tiendas Shopify Hecho para Vender Desde el Primer Día',
    heroSub_en:
      'High-converting Shopify storefronts — fast, mobile-optimized, with secure checkout and product pages designed to turn browsers into buyers.',
    heroSub_es:
      'Tiendas Shopify de alta conversión — rápidas, optimizadas para móvil, con checkout seguro y páginas de producto diseñadas para convertir visitantes en compradores.',
    introH2_en: 'Storefronts Designed Around the Buying Decision',
    introH2_es: 'Tiendas Diseñadas en Torno a la Decisión de Compra',
    introBody_en: [
      'SENAVIA designs custom Shopify stores for South Florida brands — product pages, collections, and a checkout flow engineered to reduce friction and lift conversion. No recycled themes; a storefront shaped around how your customers actually shop.',
      'As a Google Partner-certified, bilingual team, we combine clean, mobile-first design with secure checkout and SEO so your store loads fast, ranks, and sells on every device from day one.',
    ],
    introBody_es: [
      'SENAVIA diseña tiendas Shopify a medida para marcas del Sur de Florida — páginas de producto, colecciones y un flujo de checkout diseñado para reducir la fricción y aumentar la conversión. Sin temas reciclados; una tienda construida en torno a cómo compran realmente sus clientes.',
      'Como equipo bilingüe certificado como Google Partner, combinamos diseño limpio y mobile-first con checkout seguro y SEO para que su tienda cargue rápido, posicione y venda en cualquier dispositivo desde el primer día.',
    ],
    introBadge_en: 'Fast · Mobile-Optimized',
    introBadge_es: 'Rápida · Optimizada para Móvil',
    deliverables: [
      { icon: 'lucide:shopping-bag', title_en: 'High-Converting Product Pages', title_es: 'Páginas de Producto que Convierten',
        body_en: 'Clear imagery, variants, pricing, and add-to-cart designed to move shoppers toward purchase.',
        body_es: 'Imágenes claras, variantes, precios y agregar al carrito diseñados para acercar al comprador a la compra.' },
      { icon: 'lucide:layout', title_en: 'Collections & Merchandising', title_es: 'Colecciones y Merchandising',
        body_en: 'Collection layouts and filtering that help customers find the right product fast.',
        body_es: 'Diseños de colecciones y filtros que ayudan a los clientes a encontrar el producto correcto rápido.' },
      { icon: 'lucide:credit-card', title_en: 'Secure, Streamlined Checkout', title_es: 'Checkout Seguro y Simplificado',
        body_en: 'A frictionless, secure checkout with trusted payment options to reduce cart abandonment.',
        body_es: 'Un checkout seguro y sin fricción con opciones de pago confiables para reducir el abandono del carrito.' },
      { icon: 'lucide:smartphone', title_en: 'Mobile-First Shopping', title_es: 'Compra Mobile-First',
        body_en: 'Most shopping happens on phones — your store is fast and effortless to buy from on mobile.',
        body_es: 'La mayoría de las compras ocurren en el celular — su tienda es rápida y fácil para comprar desde el móvil.' },
      { icon: 'lucide:search-check', title_en: 'E-Commerce SEO', title_es: 'SEO para E-Commerce',
        body_en: 'Optimized product and collection pages with schema so your store ranks and gets found.',
        body_es: 'Páginas de producto y colección optimizadas con schema para que su tienda posicione y la encuentren.' },
    ],
    benefits: [
      { icon: 'lucide:badge-check', title_en: 'Google Partner-Certified Team', title_es: 'Equipo Certificado Google Partner',
        body_en: 'Verified agency status and ongoing training on the latest Google products.',
        body_es: 'Estatus de agencia verificada y formación continua en los últimos productos de Google.' },
      { icon: 'lucide:zap', title_en: 'Fast, Conversion-Tuned Stores', title_es: 'Tiendas Rápidas y Optimizadas',
        body_en: 'Speed and UX tuned for sales — every second and every tap counts.',
        body_es: 'Velocidad y UX optimizadas para vender — cada segundo y cada toque cuentan.' },
      { icon: 'lucide:languages', title_en: 'Bilingual EN / ES', title_es: 'Servicio Bilingüe EN / ES',
        body_en: 'Storefront, copy, and SEO delivered fluently in both languages.',
        body_es: 'Tienda, redacción y SEO con fluidez en ambos idiomas.' },
      { icon: 'lucide:lock', title_en: 'Secure & Reliable', title_es: 'Segura y Confiable',
        body_en: 'Trusted checkout, reliable hosting, and a store built to handle real traffic.',
        body_es: 'Checkout confiable, hosting estable y una tienda construida para tráfico real.' },
      { icon: 'lucide:target', title_en: 'Built to Convert', title_es: 'Diseñada para Convertir',
        body_en: 'Every page is designed around the purchase — and measured after launch.',
        body_es: 'Cada página se diseña en torno a la compra — y se mide tras el lanzamiento.' },
      { icon: 'lucide:trending-up', title_en: 'Ongoing Optimization', title_es: 'Optimización Continua',
        body_en: 'Post-launch CRO, SEO, and content to keep sales climbing.',
        body_es: 'CRO, SEO y contenido post-lanzamiento para que las ventas sigan subiendo.' },
    ],
    idealFor_en: ['Retail & DTC brands', 'Apparel & accessories', 'Beauty & wellness products', 'Food & specialty goods', 'Brands launching online', 'Stores migrating to Shopify'],
    idealFor_es: ['Marcas retail y DTC', 'Ropa y accesorios', 'Productos de belleza y bienestar', 'Alimentos y productos especializados', 'Marcas que lanzan en línea', 'Tiendas que migran a Shopify'],
    faq: [
      { q_en: 'Why Shopify over other e-commerce platforms?', q_es: '¿Por qué Shopify en vez de otras plataformas de e-commerce?',
        a_en: 'Shopify gives you a secure, reliable checkout, a huge app ecosystem, and easy management — so you can focus on selling. We design a custom storefront on top of that foundation.',
        a_es: 'Shopify le da un checkout seguro y confiable, un gran ecosistema de apps y una gestión sencilla — para que se enfoque en vender. Nosotros diseñamos una tienda a medida sobre esa base.' },
      { q_en: 'Can you migrate my existing store to Shopify?', q_es: '¿Pueden migrar mi tienda actual a Shopify?',
        a_en: 'Yes. We migrate products, content, and SEO from your current platform and redesign the storefront for higher conversion.',
        a_es: 'Sí. Migramos productos, contenido y SEO desde su plataforma actual y rediseñamos la tienda para mayor conversión.' },
      { q_en: 'Will my store work well on mobile?', q_es: '¿Mi tienda funcionará bien en móvil?',
        a_en: 'Absolutely — we design mobile-first, since most shopping and checkout now happen on phones.',
        a_es: 'Por supuesto — diseñamos mobile-first, ya que la mayoría de las compras y el checkout ahora ocurren en el celular.' },
      { q_en: 'Can the store be in English and Spanish?', q_es: '¿La tienda puede estar en inglés y español?',
        a_en: 'Yes. We build bilingual EN/ES stores so you sell to both audiences across South Florida and beyond.',
        a_es: 'Sí. Construimos tiendas bilingües EN/ES para que venda a ambas audiencias en el Sur de Florida y más allá.' },
      { q_en: 'How much does a Shopify store cost?', q_es: '¿Cuánto cuesta una tienda Shopify?',
        a_en: 'It depends on catalog size and features. We give you a transparent quote on a free consultation — no obligation.',
        a_es: 'Depende del tamaño del catálogo y las funciones. Le damos una cotización transparente en una consulta gratuita — sin compromiso.' },
    ],
    testimonialsTitle_en: 'What Our E-commerce Clients Say',
    testimonialsTitle_es: 'Lo Que Dicen Nuestros Clientes de E-commerce',
    testimonialsIntro_en: 'Store owners across South Florida trust SENAVIA to design Shopify stores that turn visitors into orders. Hear what selling with our team is like — on camera, in their own words.',
    testimonialsIntro_es: 'Dueños de tiendas en todo el Sur de Florida confían en SENAVIA para diseñar tiendas Shopify que convierten visitantes en pedidos. Descubre cómo es vender con nuestro equipo — frente a cámara, en sus propias palabras.',

    related: ['business-website-design', 'website-redesign'],
  },

  // ── 04 · Custom Website Development ─────────────────────────────────────────
  {
    slug: 'custom-website-development',
    accent: 'purple',
    icon: 'lucide:code-2',
    num: '04',
    metaTitle: 'Custom Website Development in Miami — SENAVIA Corp',
    metaDescription:
      'Custom website development in South Florida — bespoke functionality, integrations, portals, dashboards, and automation engineered for complex business needs.',
    eyebrow_en: 'Custom Website Development · Miami',
    eyebrow_es: 'Desarrollo Web a Medida · Miami',
    h1_en: 'Custom Website Development for Complex, High-Ticket Builds',
    h1_es: 'Desarrollo Web a Medida para Proyectos Complejos y de Alto Nivel',
    heroSub_en:
      'Custom functionality, integrations, and the infrastructure to power the portals, dashboards, and automation your business runs on — engineered, not templated.',
    heroSub_es:
      'Funcionalidad a medida, integraciones y la infraestructura para impulsar los portales, paneles y automatización sobre los que opera su negocio — desarrollados a medida, no con plantillas.',
    introH2_en: 'When Off-the-Shelf Stops Being Enough',
    introH2_es: 'Cuando lo Prediseñado Deja de Ser Suficiente',
    introBody_en: [
      'Some businesses need more than a website — they need software. SENAVIA builds custom web applications: client portals, internal dashboards, booking and quoting systems, and workflow automation, all integrated with the tools your team already uses.',
      'Our engineers design the architecture, connect the APIs, and build secure, scalable functionality around your real processes — so technology removes bottlenecks instead of creating them.',
    ],
    introBody_es: [
      'Algunos negocios necesitan más que un sitio web — necesitan software. SENAVIA construye aplicaciones web a medida: portales de clientes, paneles internos, sistemas de reservas y cotización, y automatización de flujos, todo integrado con las herramientas que su equipo ya usa.',
      'Nuestros ingenieros diseñan la arquitectura, conectan las APIs y construyen funcionalidad segura y escalable en torno a sus procesos reales — para que la tecnología elimine cuellos de botella en lugar de crearlos.',
    ],
    introBadge_en: 'Engineered · Integrated',
    introBadge_es: 'Desarrollado · Integrado',
    deliverables: [
      { icon: 'lucide:settings', title_en: 'Custom Functionality', title_es: 'Funcionalidad a Medida',
        body_en: 'Bespoke features built around your exact workflow — not bent to fit a template.',
        body_es: 'Funciones a medida construidas en torno a su flujo exacto — no forzadas a una plantilla.' },
      { icon: 'lucide:plug', title_en: 'API & Tool Integrations', title_es: 'Integraciones de API y Herramientas',
        body_en: 'Connect your CRM, payments, ERP, and third-party tools so data flows automatically.',
        body_es: 'Conecte su CRM, pagos, ERP y herramientas externas para que los datos fluyan automáticamente.' },
      { icon: 'lucide:bar-chart-3', title_en: 'Portals & Dashboards', title_es: 'Portales y Paneles',
        body_en: 'Client portals and internal dashboards that give the right people the right data.',
        body_es: 'Portales de clientes y paneles internos que dan a las personas correctas los datos correctos.' },
      { icon: 'lucide:workflow', title_en: 'Workflow Automation', title_es: 'Automatización de Flujos',
        body_en: 'Automate repetitive steps — bookings, quotes, notifications — to free your team.',
        body_es: 'Automatice pasos repetitivos — reservas, cotizaciones, notificaciones — para liberar a su equipo.' },
      { icon: 'lucide:server', title_en: 'Scalable Architecture', title_es: 'Arquitectura Escalable',
        body_en: 'Secure, performant infrastructure designed to grow with your usage and data.',
        body_es: 'Infraestructura segura y de alto rendimiento diseñada para crecer con su uso y datos.' },
    ],
    benefits: [
      { icon: 'lucide:badge-check', title_en: 'Google Partner-Certified Team', title_es: 'Equipo Certificado Google Partner',
        body_en: 'Verified agency status and ongoing training on the latest products and best practices.',
        body_es: 'Estatus de agencia verificada y formación continua en los últimos productos y mejores prácticas.' },
      { icon: 'lucide:code-2', title_en: 'Real Engineering, Not Plugins', title_es: 'Ingeniería Real, No Plugins',
        body_en: 'Custom-coded solutions you own — no fragile stacks of mismatched plugins.',
        body_es: 'Soluciones programadas a medida que usted posee — sin pilas frágiles de plugins incompatibles.' },
      { icon: 'lucide:languages', title_en: 'Bilingual EN / ES', title_es: 'Servicio Bilingüe EN / ES',
        body_en: 'Project management and documentation delivered fluently in both languages.',
        body_es: 'Gestión de proyecto y documentación con fluidez en ambos idiomas.' },
      { icon: 'lucide:shield-check', title_en: 'Secure & Reliable', title_es: 'Seguro y Confiable',
        body_en: 'Security and reliability built into the architecture from day one.',
        body_es: 'Seguridad y confiabilidad integradas en la arquitectura desde el primer día.' },
      { icon: 'lucide:refresh-cw', title_en: 'Built to Evolve', title_es: 'Construido para Evolucionar',
        body_en: 'Clean, documented code that your team or ours can extend over time.',
        body_es: 'Código limpio y documentado que su equipo o el nuestro puede ampliar con el tiempo.' },
      { icon: 'lucide:trending-up', title_en: 'Ongoing Support', title_es: 'Soporte Continuo',
        body_en: 'Maintenance, monitoring, and iteration after launch — we stay accountable.',
        body_es: 'Mantenimiento, monitoreo e iteración tras el lanzamiento — respondemos por ello.' },
    ],
    idealFor_en: ['Businesses outgrowing their tools', 'Client or member portals', 'Booking & quoting systems', 'Internal dashboards', 'CRM/ERP integrations', 'Workflow automation projects'],
    idealFor_es: ['Negocios que superan sus herramientas', 'Portales de clientes o miembros', 'Sistemas de reservas y cotización', 'Paneles internos', 'Integraciones CRM/ERP', 'Proyectos de automatización de flujos'],
    faq: [
      { q_en: 'How is this different from a regular website?', q_es: '¿En qué se diferencia esto de un sitio web normal?',
        a_en: 'A regular site presents information; custom development builds functionality — portals, dashboards, automation, and integrations tailored to your processes.',
        a_es: 'Un sitio normal presenta información; el desarrollo a medida construye funcionalidad — portales, paneles, automatización e integraciones adaptados a sus procesos.' },
      { q_en: 'Can you integrate with our existing tools?', q_es: '¿Pueden integrarse con nuestras herramientas actuales?',
        a_en: 'Yes. We connect CRMs, payment systems, ERPs, and third-party APIs so your tools share data automatically.',
        a_es: 'Sí. Conectamos CRMs, sistemas de pago, ERPs y APIs de terceros para que sus herramientas compartan datos automáticamente.' },
      { q_en: 'Do we own the code?', q_es: '¿Somos dueños del código?',
        a_en: 'Yes. We build custom, documented code that belongs to you — not a locked, plugin-dependent setup.',
        a_es: 'Sí. Construimos código a medida y documentado que le pertenece — no una configuración cerrada y dependiente de plugins.' },
      { q_en: 'What technologies do you use?', q_es: '¿Qué tecnologías usan?',
        a_en: 'We choose the right stack per project — typically modern JavaScript (Node.js, React) and proven frameworks, selected for performance and maintainability.',
        a_es: 'Elegimos el stack adecuado por proyecto — normalmente JavaScript moderno (Node.js, React) y frameworks probados, elegidos por rendimiento y mantenibilidad.' },
      { q_en: 'How do projects like this get priced?', q_es: '¿Cómo se cotizan proyectos como este?',
        a_en: 'Custom builds are scoped individually. We map your requirements and give a clear proposal on a free consultation.',
        a_es: 'Los desarrollos a medida se cotizan individualmente. Mapeamos sus requisitos y le damos una propuesta clara en una consulta gratuita.' },
    ],
    testimonialsTitle_en: 'What Our Custom-Build Clients Say',
    testimonialsTitle_es: 'Lo Que Dicen Nuestros Clientes de Desarrollo a Medida',
    testimonialsIntro_en: 'Businesses that outgrew templates trust SENAVIA to build fully custom websites around how they actually work. Hear what going custom is like — on camera, in their own words.',
    testimonialsIntro_es: 'Negocios que superaron las plantillas confían en SENAVIA para construir sitios totalmente a medida en torno a cómo trabajan realmente. Descubre cómo es ir a la medida — frente a cámara, en sus propias palabras.',

    related: ['corporate-website-design', 'shopify-store-design'],
  },

  // ── 05 · Landing Page Design ───────────────────────────────────────────────
  {
    slug: 'landing-page-design',
    accent: 'cyan',
    icon: 'lucide:mouse-pointer-click',
    num: '05',
    metaTitle: 'Landing Page Design in Miami — SENAVIA Corp',
    metaDescription:
      'High-converting landing page design for Google Ads & campaigns in South Florida. Single-focus, fast-loading pages engineered to lower your cost per lead.',
    eyebrow_en: 'Landing Page Design · Miami',
    eyebrow_es: 'Diseño de Landing Pages · Miami',
    h1_en: 'Landing Page Design Engineered to Lower Your Cost Per Lead',
    h1_es: 'Diseño de Landing Pages Hecho para Reducir su Costo por Lead',
    heroSub_en:
      'High-intent landing pages for Google Ads and campaigns — single-focus, fast-loading, and built to maximize conversions and stretch every ad dollar.',
    heroSub_es:
      'Landing pages de alta intención para Google Ads y campañas — enfocadas en un solo objetivo, de carga rápida y diseñadas para maximizar conversiones y rendir cada dólar de inversión.',
    introH2_en: 'One Page, One Goal, More Conversions',
    introH2_es: 'Una Página, Un Objetivo, Más Conversiones',
    introBody_en: [
      'When you pay for traffic, every click counts. SENAVIA designs focused landing pages with a single message and a single action — no navigation to wander off into, no distractions between the ad and the conversion.',
      'As a Google Partner-certified team, we align the page with your ad messaging, load it fast, and structure it to convert — so your cost per lead drops and your campaigns work harder.',
    ],
    introBody_es: [
      'Cuando paga por tráfico, cada clic cuenta. SENAVIA diseña landing pages enfocadas con un solo mensaje y una sola acción — sin navegación para distraerse, sin obstáculos entre el anuncio y la conversión.',
      'Como equipo certificado como Google Partner, alineamos la página con el mensaje de su anuncio, la cargamos rápido y la estructuramos para convertir — para que su costo por lead baje y sus campañas rindan más.',
    ],
    introBadge_en: 'Single-Focus · Built to Convert',
    introBadge_es: 'Un Solo Enfoque · Hecha para Convertir',
    deliverables: [
      { icon: 'lucide:target', title_en: 'Single-Goal Layout', title_es: 'Diseño de Un Solo Objetivo',
        body_en: 'One clear message and one primary call-to-action, with distractions stripped away.',
        body_es: 'Un mensaje claro y una sola llamada a la acción principal, sin distracciones.' },
      { icon: 'lucide:mouse-pointer-click', title_en: 'Ad-to-Page Message Match', title_es: 'Coherencia Anuncio-Página',
        body_en: 'The page mirrors your ad copy so visitors instantly feel they are in the right place.',
        body_es: 'La página refleja el mensaje de su anuncio para que el visitante sienta de inmediato que está en el lugar correcto.' },
      { icon: 'lucide:zap', title_en: 'Fast-Loading Performance', title_es: 'Rendimiento de Carga Rápida',
        body_en: 'Speed-optimized pages that hold Quality Score and stop visitors from bouncing.',
        body_es: 'Páginas optimizadas en velocidad que mantienen el Quality Score y evitan que el visitante se vaya.' },
      { icon: 'lucide:file-text', title_en: 'Conversion-Tuned Forms', title_es: 'Formularios Optimizados',
        body_en: 'Lead forms designed for completion, wired to reach you the moment someone converts.',
        body_es: 'Formularios diseñados para completarse, conectados para llegarle en el momento en que alguien convierte.' },
      { icon: 'lucide:bar-chart-3', title_en: 'Tracking & A/B Ready', title_es: 'Listo para Medición y A/B',
        body_en: 'Conversion tracking and A/B-test structure so you can measure and improve.',
        body_es: 'Seguimiento de conversiones y estructura para pruebas A/B para medir y mejorar.' },
    ],
    benefits: [
      { icon: 'lucide:badge-check', title_en: 'Google Partner-Certified Team', title_es: 'Equipo Certificado Google Partner',
        body_en: 'We know what Google Ads rewards — and design pages that earn Quality Score.',
        body_es: 'Sabemos qué premia Google Ads — y diseñamos páginas que ganan Quality Score.' },
      { icon: 'lucide:trending-down', title_en: 'Lower Cost Per Lead', title_es: 'Menor Costo por Lead',
        body_en: 'Higher conversion rates mean you pay less for every lead your ads bring in.',
        body_es: 'Mayores tasas de conversión significan que paga menos por cada lead que traen sus anuncios.' },
      { icon: 'lucide:languages', title_en: 'Bilingual EN / ES', title_es: 'Servicio Bilingüe EN / ES',
        body_en: 'Run English and Spanish campaigns with pages that speak each audience.',
        body_es: 'Ejecute campañas en inglés y español con páginas que hablan a cada audiencia.' },
      { icon: 'lucide:rocket', title_en: 'Fast Turnaround', title_es: 'Entrega Rápida',
        body_en: 'Campaign landing pages built quickly so you can launch and capture demand now.',
        body_es: 'Landing pages de campaña construidas rápido para que lance y capte la demanda ya.' },
      { icon: 'lucide:target', title_en: 'Conversion-Obsessed Design', title_es: 'Diseño Obsesionado con la Conversión',
        body_en: 'Every element earns its place by moving the visitor toward the action.',
        body_es: 'Cada elemento se gana su lugar acercando al visitante a la acción.' },
      { icon: 'lucide:line-chart', title_en: 'Measured & Improved', title_es: 'Medida y Mejorada',
        body_en: 'We track results and iterate so the page keeps getting more efficient.',
        body_es: 'Medimos los resultados e iteramos para que la página sea cada vez más eficiente.' },
    ],
    idealFor_en: ['Google Ads campaigns', 'Meta / social ad traffic', 'Product or service launches', 'Lead-generation offers', 'Event & webinar signups', 'Seasonal promotions'],
    idealFor_es: ['Campañas de Google Ads', 'Tráfico de anuncios en Meta / redes', 'Lanzamientos de producto o servicio', 'Ofertas de generación de leads', 'Registros a eventos y webinars', 'Promociones de temporada'],
    faq: [
      { q_en: 'How is a landing page different from a homepage?', q_es: '¿En qué se diferencia una landing page de una página de inicio?',
        a_en: 'A homepage serves many goals; a landing page has one. It removes navigation and distractions to focus the visitor on a single conversion — ideal for paid traffic.',
        a_es: 'Una página de inicio atiende muchos objetivos; una landing page tiene uno. Elimina la navegación y las distracciones para enfocar al visitante en una sola conversión — ideal para tráfico pagado.' },
      { q_en: 'Will this really lower my cost per lead?', q_es: '¿Esto realmente bajará mi costo por lead?',
        a_en: 'A focused, fast, message-matched page typically converts more of the same traffic — which lowers your cost per lead and improves Quality Score.',
        a_es: 'Una página enfocada, rápida y coherente con el anuncio suele convertir más del mismo tráfico — lo que baja su costo por lead y mejora el Quality Score.' },
      { q_en: 'Do you also manage the ad campaigns?', q_es: '¿También gestionan las campañas de anuncios?',
        a_en: 'Yes — as a Google Partner agency we offer paid traffic management. Ask about pairing your landing page with campaign management.',
        a_es: 'Sí — como agencia Google Partner ofrecemos gestión de tráfico pagado. Pregunte por combinar su landing page con la gestión de campañas.' },
      { q_en: 'Can you build pages in English and Spanish?', q_es: '¿Pueden crear páginas en inglés y español?',
        a_en: 'Yes. We build bilingual EN/ES landing pages so each campaign speaks its audience.',
        a_es: 'Sí. Construimos landing pages bilingües EN/ES para que cada campaña hable a su audiencia.' },
      { q_en: 'How fast can a landing page be ready?', q_es: '¿Qué tan rápido puede estar lista una landing page?',
        a_en: 'Single landing pages move fast — often within days. We scope your timeline on a free consultation.',
        a_es: 'Las landing pages individuales avanzan rápido — a menudo en días. Definimos su cronograma en una consulta gratuita.' },
    ],
    testimonialsTitle_en: 'What Our Landing Page Clients Say',
    testimonialsTitle_es: 'Lo Que Dicen Nuestros Clientes de Landing Pages',
    testimonialsIntro_en: 'Advertisers across South Florida trust SENAVIA with the pages their campaigns depend on. Hear what converting with our team is like — on camera, in their own words.',
    testimonialsIntro_es: 'Anunciantes de todo el Sur de Florida confían a SENAVIA las páginas de las que dependen sus campañas. Descubre cómo es convertir con nuestro equipo — frente a cámara, en sus propias palabras.',

    related: ['business-website-design', 'website-redesign'],
  },

  // ── 06 · Website Redesign ──────────────────────────────────────────────────
  {
    slug: 'website-redesign',
    accent: 'green',
    icon: 'lucide:paintbrush',
    num: '06',
    metaTitle: 'Website Redesign in Miami — SENAVIA Corp',
    metaDescription:
      'Website redesign in South Florida. We rebuild underperforming sites for modern UX, speed, and SEO — keeping what works and fixing what costs you conversions.',
    eyebrow_en: 'Website Redesign · Miami',
    eyebrow_es: 'Rediseño de Sitios Web · Miami',
    h1_en: 'Website Redesign for Modern UX, Speed, and SEO',
    h1_es: 'Rediseño de Sitios Web para UX Moderno, Velocidad y SEO',
    heroSub_en:
      'Already have a site that underperforms? We rebuild it for modern UX, speed, and SEO — keeping what works and fixing what quietly costs you conversions.',
    heroSub_es:
      '¿Ya tiene un sitio que rinde por debajo de su potencial? Lo reconstruimos con UX moderno, velocidad y SEO — conservando lo que funciona y corrigiendo lo que le cuesta conversiones en silencio.',
    introH2_en: 'Rebuild Without Losing What You Have Earned',
    introH2_es: 'Reconstruir Sin Perder lo que Ya Ganó',
    introBody_en: [
      'A dated, slow, or hard-to-use site costs you leads every day. SENAVIA redesigns it from the ground up — modern UX, faster load times, and an SEO architecture that turns more of your existing traffic into customers.',
      'As a Google Partner-certified team, we migrate carefully to preserve your rankings, keep the pages and content that already work, and rebuild everything that holds you back — so the new site performs from launch day.',
    ],
    introBody_es: [
      'Un sitio anticuado, lento o difícil de usar le cuesta clientes cada día. SENAVIA lo rediseña desde cero — UX moderno, tiempos de carga más rápidos y una arquitectura SEO que convierte más de su tráfico actual en clientes.',
      'Como equipo certificado como Google Partner, migramos con cuidado para preservar su posicionamiento, conservamos las páginas y el contenido que ya funcionan, y reconstruimos todo lo que lo frena — para que el nuevo sitio rinda desde el día del lanzamiento.',
    ],
    introBadge_en: 'Keep SEO · Fix Conversions',
    introBadge_es: 'Conserve el SEO · Corrija la Conversión',
    deliverables: [
      { icon: 'lucide:search', title_en: 'Audit & Strategy', title_es: 'Auditoría y Estrategia',
        body_en: 'We diagnose what is hurting UX, speed, and SEO, then map a redesign plan around real fixes.',
        body_es: 'Diagnosticamos qué daña la UX, la velocidad y el SEO, y trazamos un plan de rediseño en torno a soluciones reales.' },
      { icon: 'lucide:wand-2', title_en: 'Modern UX & Design', title_es: 'UX y Diseño Modernos',
        body_en: 'A fresh, on-brand design that is easier to use and guides visitors toward action.',
        body_es: 'Un diseño fresco y fiel a la marca, más fácil de usar y que guía al visitante hacia la acción.' },
      { icon: 'lucide:gauge', title_en: 'Speed & Core Web Vitals', title_es: 'Velocidad y Core Web Vitals',
        body_en: 'A rebuild tuned for fast load times and strong Core Web Vitals scores.',
        body_es: 'Una reconstrucción optimizada para tiempos de carga rápidos y buenos puntajes de Core Web Vitals.' },
      { icon: 'lucide:search-check', title_en: 'SEO-Safe Migration', title_es: 'Migración Segura para el SEO',
        body_en: 'Redirects, schema, and structure handled carefully so you keep your rankings.',
        body_es: 'Redirecciones, schema y estructura gestionados con cuidado para conservar su posicionamiento.' },
      { icon: 'lucide:target', title_en: 'Conversion Fixes', title_es: 'Correcciones de Conversión',
        body_en: 'We rework the pages and paths that quietly lose leads and sales.',
        body_es: 'Reelaboramos las páginas y rutas que pierden leads y ventas en silencio.' },
    ],
    benefits: [
      { icon: 'lucide:badge-check', title_en: 'Google Partner-Certified Team', title_es: 'Equipo Certificado Google Partner',
        body_en: 'Verified agency status and ongoing training on the latest Google products.',
        body_es: 'Estatus de agencia verificada y formación continua en los últimos productos de Google.' },
      { icon: 'lucide:shield-check', title_en: 'No Lost Rankings', title_es: 'Sin Pérdida de Posicionamiento',
        body_en: 'Careful migration and redirects protect the SEO you have already built.',
        body_es: 'Una migración cuidadosa y las redirecciones protegen el SEO que ya construyó.' },
      { icon: 'lucide:languages', title_en: 'Bilingual EN / ES', title_es: 'Servicio Bilingüe EN / ES',
        body_en: 'Design, copy, and SEO delivered fluently in both languages.',
        body_es: 'Diseño, redacción y SEO con fluidez en ambos idiomas.' },
      { icon: 'lucide:gauge', title_en: 'Dramatically Faster', title_es: 'Mucho Más Rápido',
        body_en: 'A modern rebuild that loads fast and feels effortless on every device.',
        body_es: 'Una reconstrucción moderna que carga rápido y se siente fluida en cualquier dispositivo.' },
      { icon: 'lucide:target', title_en: 'Conversion-Focused', title_es: 'Enfocado en la Conversión',
        body_en: 'We fix the leaks so more of your existing traffic turns into customers.',
        body_es: 'Corregimos las fugas para que más de su tráfico actual se convierta en clientes.' },
      { icon: 'lucide:trending-up', title_en: 'Ongoing Optimization', title_es: 'Optimización Continua',
        body_en: 'Post-launch SEO, content, and CRO to keep the new site improving.',
        body_es: 'SEO, contenido y CRO post-lanzamiento para que el nuevo sitio siga mejorando.' },
    ],
    idealFor_en: ['Outdated or slow websites', 'Sites that do not convert', 'Poor mobile experience', 'Rebrands & refreshes', 'Platform migrations', 'Sites that lost rankings'],
    idealFor_es: ['Sitios anticuados o lentos', 'Sitios que no convierten', 'Mala experiencia móvil', 'Cambios de marca y refrescos', 'Migraciones de plataforma', 'Sitios que perdieron posicionamiento'],
    faq: [
      { q_en: 'Will a redesign hurt my Google rankings?', q_es: '¿Un rediseño dañará mi posicionamiento en Google?',
        a_en: 'Not when it is done right. We plan redirects, preserve URLs and content that rank, and migrate carefully — most clients hold or improve rankings after launch.',
        a_es: 'No cuando se hace bien. Planificamos redirecciones, conservamos URLs y contenido que posicionan, y migramos con cuidado — la mayoría de los clientes mantiene o mejora su posicionamiento tras el lanzamiento.' },
      { q_en: 'Do you keep any of my current site?', q_es: '¿Conservan algo de mi sitio actual?',
        a_en: 'Yes. We keep what already works — strong pages, content, and brand assets — and rebuild only what holds you back.',
        a_es: 'Sí. Conservamos lo que ya funciona — páginas sólidas, contenido y elementos de marca — y reconstruimos solo lo que lo frena.' },
      { q_en: 'How do you decide what to change?', q_es: '¿Cómo deciden qué cambiar?',
        a_en: 'We start with an audit of UX, speed, and SEO, then prioritize the changes that will move leads and conversions the most.',
        a_es: 'Empezamos con una auditoría de UX, velocidad y SEO, y luego priorizamos los cambios que más moverán los leads y las conversiones.' },
      { q_en: 'Can you move my site to a different platform?', q_es: '¿Pueden mover mi sitio a otra plataforma?',
        a_en: 'Yes. We migrate between platforms — for example to WordPress, Webflow, or Shopify — while protecting your SEO and content.',
        a_es: 'Sí. Migramos entre plataformas — por ejemplo a WordPress, Webflow o Shopify — protegiendo su SEO y contenido.' },
      { q_en: 'How much does a website redesign cost?', q_es: '¿Cuánto cuesta un rediseño de sitio web?',
        a_en: 'It depends on your current site and goals. We review it and give a transparent quote on a free consultation — no obligation.',
        a_es: 'Depende de su sitio actual y sus objetivos. Lo revisamos y le damos una cotización transparente en una consulta gratuita — sin compromiso.' },
    ],
    testimonialsTitle_en: 'What Redesign Clients Say',
    testimonialsTitle_es: 'Lo Que Dicen Nuestros Clientes de Rediseño',
    testimonialsIntro_en: 'Owners who outgrew their old sites trust SENAVIA to redesign without losing rankings or momentum. Hear what relaunching with our team is like — on camera, in their own words.',
    testimonialsIntro_es: 'Dueños que superaron sus sitios anteriores confían en SENAVIA para rediseñar sin perder posicionamiento ni impulso. Descubre cómo es relanzar con nuestro equipo — frente a cámara, en sus propias palabras.',

    related: ['business-website-design', 'landing-page-design'],
  },
];

export const getSubservice = (slug: string): Subservice | undefined =>
  SUBSERVICES.find((s) => s.slug === slug);
