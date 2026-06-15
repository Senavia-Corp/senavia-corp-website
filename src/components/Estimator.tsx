import { useState, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CALENDLY_URL } from '@/data/site';

// ============================================================
// TYPES
// ============================================================
type Lang = 'en' | 'es';

interface SiteType {
  id: string;
  label: { en: string; es: string };
  sub: { en: string; es: string };
  base: number;
  basePages: number;
  icon: ReactNode;
}
interface Feature {
  id: string;
  label: { en: string; es: string };
  price: number;
  desc: { en: string; es: string };
}
interface Timeline {
  id: string;
  label: { en: string; es: string };
  sub: { en: string; es: string };
  mult: number;
  badge: { en: string; es: string };
  tone: 'warn' | 'mid' | 'good' | 'ok';
}
interface Step {
  id: string;
  short: { en: string; es: string };
  label: { en: string; es: string };
}
interface State {
  type: string;
  pages: number;
  features: string[];
  timeline: string;
  name: string;
  email: string;
  phone: string;
}
interface Errors {
  name?: string;
  email?: string;
}

// ============================================================
// I18N HELPERS
// ============================================================
const t = (lang: Lang, en: string, es: string) => (lang === 'es' ? es : en);
const pick = (lang: Lang, v: { en: string; es: string }) => (lang === 'es' ? v.es : v.en);

// ============================================================
// DATA
// ============================================================
const SITE_TYPES: SiteType[] = [
  {
    id: 'business',
    label: { en: 'Business Site', es: 'Sitio Empresarial' },
    sub: { en: 'Brand & lead-gen marketing site', es: 'Sitio de marca y captación de clientes' },
    base: 1500,
    basePages: 5,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <circle cx="6" cy="6.5" r="0.6" fill="currentColor"></circle>
      </svg>
    ),
  },
  {
    id: 'ecommerce',
    label: { en: 'E-commerce', es: 'E-Commerce' },
    sub: { en: 'Shopify or Webflow storefront', es: 'Tienda en Shopify o Webflow' },
    base: 2800,
    basePages: 8,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6h15l-2 11H8L6 4H3"></path>
        <circle cx="10" cy="20" r="1.4"></circle>
        <circle cx="17" cy="20" r="1.4"></circle>
      </svg>
    ),
  },
  {
    id: 'webapp',
    label: { en: 'Web App', es: 'Aplicación Web' },
    sub: { en: 'Custom platform or CRM / portal', es: 'Plataforma a medida o CRM / portal' },
    base: 5000,
    basePages: 6,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="14" rx="2"></rect>
        <line x1="7" y1="9" x2="17" y2="9"></line>
        <line x1="7" y1="13" x2="13" y2="13"></line>
        <line x1="8" y1="21" x2="16" y2="21"></line>
      </svg>
    ),
  },
  {
    id: 'landing',
    label: { en: 'Landing Page', es: 'Landing Page' },
    sub: { en: 'Single-page campaign page', es: 'Página de campaña de una sola sección' },
    base: 800,
    basePages: 1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="2"></rect>
        <line x1="8" y1="8" x2="16" y2="8"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
        <line x1="8" y1="16" x2="13" y2="16"></line>
      </svg>
    ),
  },
];

const FEATURES: Feature[] = [
  { id: 'blog', label: { en: 'Blog & CMS', es: 'Blog y CMS' }, price: 400, desc: { en: 'CMS-driven blog with categories & author profiles', es: 'Blog con CMS, categorías y perfiles de autor' } },
  { id: 'contact', label: { en: 'Contact & lead forms', es: 'Formularios de contacto y leads' }, price: 150, desc: { en: 'Multi-step forms with CRM & email routing', es: 'Formularios de varios pasos con CRM y enrutamiento de correo' } },
  { id: 'booking', label: { en: 'Online booking system', es: 'Sistema de reservas en línea' }, price: 650, desc: { en: 'Calendar embed, reminders, payments', es: 'Calendario integrado, recordatorios y pagos' } },
  { id: 'multilingual', label: { en: 'Multilingual (EN / ES)', es: 'Multilingüe (EN / ES)' }, price: 850, desc: { en: 'Bilingual structure with hreflang setup', es: 'Estructura bilingüe con configuración de hreflang' } },
  { id: 'ecommerce', label: { en: 'E-commerce store', es: 'Tienda E-Commerce' }, price: 1200, desc: { en: 'Products, checkout, payments — Shopify or custom', es: 'Productos, checkout y pagos — Shopify o a medida' } },
  { id: 'crm', label: { en: 'CRM integration', es: 'Integración con CRM' }, price: 950, desc: { en: 'HubSpot, Pipedrive, Podio, or custom CRM', es: 'HubSpot, Pipedrive, Podio o CRM a medida' } },
  { id: 'membership', label: { en: 'Membership / gated content', es: 'Membresías / contenido exclusivo' }, price: 1400, desc: { en: 'Member login, paywall, tiered access', es: 'Acceso de miembros, muro de pago y niveles' } },
  { id: 'automation', label: { en: 'Email automation flows', es: 'Flujos de automatización de correo' }, price: 1200, desc: { en: 'Klaviyo or Mailchimp nurture sequences', es: 'Secuencias de nutrición en Klaviyo o Mailchimp' } },
  { id: 'analytics', label: { en: 'GA4 & conversion tracking', es: 'GA4 y seguimiento de conversiones' }, price: 250, desc: { en: 'Analytics, GTM, conversion goals — verified', es: 'Analytics, GTM y metas de conversión — verificadas' } },
  { id: 'seo-advanced', label: { en: 'Advanced SEO & schema', es: 'SEO avanzado y schema' }, price: 750, desc: { en: 'Schema markup, AEO structure, audit report', es: 'Marcado schema, estructura AEO e informe de auditoría' } },
  { id: 'forms-custom', label: { en: 'Custom quote builder', es: 'Cotizador a medida' }, price: 800, desc: { en: 'Multi-step intake with conditional logic', es: 'Captura en varios pasos con lógica condicional' } },
  { id: 'photography', label: { en: 'Photography day', es: 'Día de fotografía' }, price: 1100, desc: { en: 'Half-day on-location shoot, edited deliverables', es: 'Sesión de medio día en locación con entregables editados' } },
];

const TIMELINES: Timeline[] = [
  { id: 'asap', label: { en: 'ASAP', es: 'Lo Antes Posible' }, sub: { en: 'Rush · within 3 weeks', es: 'Urgente · en menos de 3 semanas' }, mult: 1.25, badge: { en: '+25%', es: '+25%' }, tone: 'warn' },
  { id: '1mo', label: { en: '1 month', es: '1 mes' }, sub: { en: 'Standard fast-track', es: 'Vía rápida estándar' }, mult: 1.1, badge: { en: '+10%', es: '+10%' }, tone: 'mid' },
  { id: '2-3mo', label: { en: '2 – 3 months', es: '2 – 3 meses' }, sub: { en: 'Recommended pace', es: 'Ritmo recomendado' }, mult: 1.0, badge: { en: 'Best fit', es: 'Ideal' }, tone: 'good' },
  { id: 'flexible', label: { en: 'Flexible', es: 'Flexible' }, sub: { en: 'No rush · 4+ months', es: 'Sin prisa · 4+ meses' }, mult: 0.95, badge: { en: '−5%', es: '−5%' }, tone: 'ok' },
];

const STEPS: Step[] = [
  { id: 'type', short: { en: 'Type', es: 'Tipo' }, label: { en: 'Project type', es: 'Tipo de proyecto' } },
  { id: 'pages', short: { en: 'Pages', es: 'Páginas' }, label: { en: 'Page count', es: 'Número de páginas' } },
  { id: 'features', short: { en: 'Features', es: 'Funciones' }, label: { en: 'Features', es: 'Funcionalidades' } },
  { id: 'timeline', short: { en: 'Timeline', es: 'Plazo' }, label: { en: 'Timeline', es: 'Plazo' } },
  { id: 'contact', short: { en: 'You', es: 'Tú' }, label: { en: 'Your info', es: 'Tus datos' } },
  { id: 'result', short: { en: 'Result', es: 'Resultado' }, label: { en: 'Your estimate', es: 'Tu estimado' } },
];

// ============================================================
// HELPERS
// ============================================================
const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

interface Breakdown {
  base: { label: string; amount: number };
  pages: { label: string; amount: number } | null;
  features: { label: string; amount: number }[];
  subtotal: number;
  timeline: Timeline;
  tlAdjust: number;
  total: number;
}

function calc(state: State, lang: Lang): Breakdown {
  const type = SITE_TYPES.find((t) => t.id === state.type) || SITE_TYPES[0];
  const tl = TIMELINES.find((t) => t.id === state.timeline) || TIMELINES[2];
  const baseLine = {
    label: t(lang, `${pick('en', type.label)} base build`, `Construcción base · ${pick('es', type.label)}`),
    amount: type.base,
  };
  const pagesOver = Math.max(0, state.pages - type.basePages);
  const pagesLine = pagesOver > 0
    ? {
        label: t(lang, `Additional pages (${pagesOver} × $150)`, `Páginas adicionales (${pagesOver} × $150)`),
        amount: pagesOver * 150,
      }
    : null;
  const featLines = state.features.map((fid) => {
    const f = FEATURES.find((x) => x.id === fid)!;
    return { label: pick(lang, f.label), amount: f.price };
  });
  const subtotal =
    baseLine.amount +
    (pagesLine ? pagesLine.amount : 0) +
    featLines.reduce((s, l) => s + l.amount, 0);
  const tlAdjust = subtotal * (tl.mult - 1);
  const total = subtotal + tlAdjust;
  return { base: baseLine, pages: pagesLine, features: featLines, subtotal, timeline: tl, tlAdjust, total };
}

function buildCalendlyUrl(state: State, breakdown: Breakdown, lang: Lang) {
  const type = SITE_TYPES.find((t) => t.id === state.type);
  const features = state.features
    .map((id) => {
      const f = FEATURES.find((x) => x.id === id);
      return f ? pick(lang, f.label) : undefined;
    })
    .filter(Boolean)
    .join(', ');
  const summary = [
    `${t(lang, 'Project', 'Proyecto')}: ${type ? pick(lang, type.label) : t(lang, 'Unknown', 'Desconocido')}`,
    `${t(lang, 'Pages', 'Páginas')}: ${state.pages}`,
    `${t(lang, 'Timeline', 'Plazo')}: ${pick(lang, breakdown.timeline.label)}`,
    `${t(lang, 'Estimated total', 'Total estimado')}: ${fmt(breakdown.total)}`,
    features ? `${t(lang, 'Features', 'Funcionalidades')}: ${features}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const params = new URLSearchParams({
    name: state.name,
    email: state.email,
    a1: summary,
  });
  return `${CALENDLY_URL}?${params.toString()}`;
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

// ============================================================
// PROGRESS BAR
// ============================================================
interface ProgressProps {
  current: number;
  total: number;
  steps: Step[];
  onJump: (i: number) => void;
  lang: Lang;
}
function Progress({ current, total, steps, onJump, lang }: ProgressProps) {
  const pct = (current / (total - 1)) * 100;
  return (
    <div className="est-progress">
      <div className="est-progress-track">
        <div className="est-progress-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="est-progress-steps">
        {steps.map((s, i) => {
          const status = i < current ? 'done' : i === current ? 'active' : 'todo';
          return (
            <button
              key={s.id}
              type="button"
              className={`est-step-dot is-${status}`}
              onClick={() => i <= current && onJump(i)}
              disabled={i > current}
              aria-label={`${t(lang, 'Step', 'Paso')} ${i + 1}: ${pick(lang, s.label)}`}
            >
              <span className="est-step-num">{i + 1}</span>
              <span className="est-step-label">{pick(lang, s.short)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STEP PANELS
// ============================================================
function StepType({ state, set, next, lang }: { state: State; set: (p: Partial<State>) => void; next: () => void; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 1 · Project type', 'Paso 1 · Tipo de proyecto')}</span>
      <h2>{t(lang, 'What type of website do you need?', '¿Qué tipo de sitio web necesitas?')}</h2>
      <p className="est-lede">{t(lang, "Pick the option closest to your project — we'll fine-tune the details in the next steps.", 'Elige la opción más parecida a tu proyecto — afinaremos los detalles en los siguientes pasos.')}</p>
      <div className="est-grid-4">
        {SITE_TYPES.map((ty) => (
          <button
            key={ty.id}
            type="button"
            className={`est-tile ${state.type === ty.id ? 'is-active' : ''}`}
            onClick={() => {
              set({ type: ty.id, pages: state.pages === 0 ? ty.basePages : state.pages });
              setTimeout(next, 220);
            }}
          >
            <span className="est-tile-icon">{ty.icon}</span>
            <span className="est-tile-label">{pick(lang, ty.label)}</span>
            <span className="est-tile-sub">{pick(lang, ty.sub)}</span>
            <span className="est-tile-price">{t(lang, 'from', 'desde')} {fmt(ty.base)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPages({ state, set, lang }: { state: State; set: (p: Partial<State>) => void; lang: Lang }) {
  const type = SITE_TYPES.find((t) => t.id === state.type) || SITE_TYPES[0];
  const pages = state.pages || type.basePages;
  const pagesOver = Math.max(0, pages - type.basePages);
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 2 · Page count', 'Paso 2 · Número de páginas')}</span>
      <h2>{t(lang, 'How many pages?', '¿Cuántas páginas?')}</h2>
      <p className="est-lede">{t(lang, 'Includes Home, About, Service, Contact — and any deeper pages your visitors need.', 'Incluye Inicio, Nosotros, Servicios, Contacto — y cualquier otra página que tus visitantes necesiten.')}</p>
      <div className="est-pages-display">
        <span className="est-pages-num">{pages}</span>
        <span className="est-pages-unit">{pages === 1 ? t(lang, 'page', 'página') : t(lang, 'pages', 'páginas')}</span>
      </div>
      <input
        type="range"
        min={1}
        max={50}
        step={1}
        value={pages}
        onChange={(e) => set({ pages: parseInt(e.target.value, 10) })}
        className="est-slider"
        aria-label={t(lang, 'Number of pages', 'Número de páginas')}
      />
      <div className="est-slider-scale">
        <span>1</span>
        <span>10</span>
        <span>25</span>
        <span>50</span>
      </div>
      <div className="est-page-meta">
        <span>{t(lang, `${type.basePages} pages included in ${pick('en', type.label)} base`, `${type.basePages} páginas incluidas en la base de ${pick('es', type.label)}`)}</span>
        {pagesOver > 0 ? (
          <span className="accent">+{pagesOver} × $150 = {fmt(pagesOver * 150)}</span>
        ) : (
          <span className="muted">{t(lang, 'No additional charge', 'Sin cargo adicional')}</span>
        )}
      </div>
    </div>
  );
}

function StepFeatures({ state, toggle, lang }: { state: State; toggle: (id: string) => void; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 3 · Features', 'Paso 3 · Funcionalidades')}</span>
      <h2>{t(lang, 'What features should we include?', '¿Qué funcionalidades incluimos?')}</h2>
      <p className="est-lede">{t(lang, 'Pick any combination. Prices are added to your base build below.', 'Elige cualquier combinación. Los precios se suman a tu construcción base.')}</p>
      <div className="est-feat-grid">
        {FEATURES.map((f) => {
          const on = state.features.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={`est-feat ${on ? 'is-on' : ''}`}
              onClick={() => toggle(f.id)}
            >
              <span className="est-feat-check" aria-hidden="true">
                {on ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : null}
              </span>
              <span className="est-feat-body">
                <span className="est-feat-label">{pick(lang, f.label)}</span>
                <span className="est-feat-desc">{pick(lang, f.desc)}</span>
              </span>
              <span className="est-feat-price">+{fmt(f.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTimeline({ state, set, next, lang }: { state: State; set: (p: Partial<State>) => void; next: () => void; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 4 · Timeline', 'Paso 4 · Plazo')}</span>
      <h2>{t(lang, 'When do you need it live?', '¿Cuándo lo necesitas en línea?')}</h2>
      <p className="est-lede">{t(lang, 'Rush projects carry a premium; flexible timelines unlock a small discount.', 'Los proyectos urgentes tienen un recargo; los plazos flexibles obtienen un pequeño descuento.')}</p>
      <div className="est-tl-grid">
        {TIMELINES.map((tl) => {
          const on = state.timeline === tl.id;
          return (
            <button
              key={tl.id}
              type="button"
              className={`est-tl ${on ? 'is-active' : ''} tone-${tl.tone}`}
              onClick={() => {
                set({ timeline: tl.id });
                setTimeout(next, 220);
              }}
            >
              <span className={`est-tl-badge tone-${tl.tone}`}>{pick(lang, tl.badge)}</span>
              <span className="est-tl-label">{pick(lang, tl.label)}</span>
              <span className="est-tl-sub">{pick(lang, tl.sub)}</span>
              <span className="est-tl-radio" aria-hidden="true">{on ? <span /> : null}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepContact({ state, set, errors, lang }: { state: State; set: (p: Partial<State>) => void; errors: Errors; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 5 · Your info', 'Paso 5 · Tus datos')}</span>
      <h2>{t(lang, 'Where should we send your estimate?', '¿A dónde enviamos tu estimado?')}</h2>
      <p className="est-lede">{t(lang, "We'll open our calendar pre-filled so you can pick a 30-minute review call. No spam, ever.", 'Abriremos nuestro calendario prellenado para que elijas una llamada de revisión de 30 minutos. Sin spam, nunca.')}</p>
      <div className="est-form">
        <div className="est-field">
          <label>{t(lang, 'Full name', 'Nombre Completo')} <span className="req">*</span></label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={t(lang, 'Jane Rivera', 'Juana Rivera')}
            autoComplete="name"
          />
          {errors.name ? <span className="est-err">{errors.name}</span> : null}
        </div>
        <div className="est-field">
          <label>{t(lang, 'Email', 'Correo Electrónico')} <span className="req">*</span></label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder={t(lang, 'jane@business.com', 'juana@empresa.com')}
            autoComplete="email"
          />
          {errors.email ? <span className="est-err">{errors.email}</span> : null}
        </div>
        <div className="est-field full">
          <label>{t(lang, 'Phone', 'Teléfono')} <span className="muted-label">{t(lang, '(optional)', '(opcional)')}</span></label>
          <input
            type="tel"
            value={state.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="(754) 555-0123"
            autoComplete="tel"
          />
        </div>
      </div>
    </div>
  );
}

function StepResult({ state, breakdown, onSend, sent, lang }: {
  state: State;
  breakdown: Breakdown;
  onSend: () => void;
  sent: boolean;
  lang: Lang;
}) {
  const tlGood = breakdown.timeline.mult <= 1;
  return (
    <div className="est-card est-result">
      <span className="est-eyebrow">{t(lang, 'Step 6 · Your estimate', 'Paso 6 · Tu estimado')}</span>
      <h2>{t(lang, "Here's your ballpark estimate", 'Aquí está tu estimado aproximado')}</h2>
      <p className="est-lede">{t(lang, "Based on your selections, here's what a project like this typically runs at SENAVIA. Final pricing is locked in after a 30-minute scope call.", 'Según tus selecciones, esto es lo que normalmente cuesta un proyecto así en SENAVIA. El precio final se define tras una llamada de alcance de 30 minutos.')}</p>
      <div className="est-result-grid">
        <div className="est-bd">
          <h3>{t(lang, 'Cost breakdown', 'Desglose de costos')}</h3>
          <ul className="est-bd-list">
            <li>
              <span>{breakdown.base.label}</span>
              <span className="amt">{fmt(breakdown.base.amount)}</span>
            </li>
            {breakdown.pages ? (
              <li>
                <span>{breakdown.pages.label}</span>
                <span className="amt">{fmt(breakdown.pages.amount)}</span>
              </li>
            ) : null}
            {breakdown.features.map((f, i) => (
              <li key={i}>
                <span>{f.label}</span>
                <span className="amt">+{fmt(f.amount)}</span>
              </li>
            ))}
            <li className="subtotal">
              <span>{t(lang, 'Subtotal', 'Subtotal')}</span>
              <span className="amt">{fmt(breakdown.subtotal)}</span>
            </li>
            <li className={tlGood ? '' : 'rush'}>
              <span>{t(lang, 'Timeline', 'Plazo')} · {pick(lang, breakdown.timeline.label)} <span className="tag">{pick(lang, breakdown.timeline.badge)}</span></span>
              <span className="amt">{breakdown.tlAdjust >= 0 ? '+' : ''}{fmt(breakdown.tlAdjust)}</span>
            </li>
          </ul>
        </div>
        <div className="est-total">
          <span className="est-total-label">{t(lang, 'Estimated total', 'Costo Estimado')}</span>
          <span className="est-total-amount">{fmt(breakdown.total)}</span>
          <span className="est-total-note">{t(lang, 'Includes hosting setup, training, and 30-day post-launch optimization', 'Incluye configuración de hosting, capacitación y 30 días de optimización post-lanzamiento')}</span>
          {sent ? (
            <div className="est-sent">
              <span className="est-sent-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <strong>{t(lang, `Calendar opened for ${state.email}`, `Calendario abierto para ${state.email}`)}</strong>
              <span>{t(lang, "Pick a 30-minute slot from the Calendly grid — we'll have your estimate context ready.", 'Elige un horario de 30 minutos en el calendario de Calendly — tendremos listo el contexto de tu estimado.')}</span>
            </div>
          ) : (
            <button type="button" className="est-send" onClick={onSend}>
              {t(lang, 'Book my scope call', 'Agenda mi llamada de alcance')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          )}
          <a href="tel:+17542623659" className="est-call">{t(lang, 'Or call us · (754) 262-3659', 'O llámanos · (754) 262-3659')}</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function Estimator() {
  const [lang, setLang] = useState<Lang>('en');
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<State>({
    type: '',
    pages: 0,
    features: [],
    timeline: '',
    name: '',
    email: '',
    phone: '',
  });

  // Sync language with the site-wide switcher (class on <html> + languagechange event).
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('lang-es')) {
      setLang('es');
    }
    const onLangChange = (e: Event) => {
      const detail = (e as CustomEvent<{ lang?: string }>).detail;
      if (detail?.lang === 'es' || detail?.lang === 'en') {
        setLang(detail.lang);
      }
    };
    window.addEventListener('languagechange', onLangChange as EventListener);
    return () => window.removeEventListener('languagechange', onLangChange as EventListener);
  }, []);

  const set = (patch: Partial<State>) => setState((prev) => ({ ...prev, ...patch }));
  const breakdown = useMemo(() => (state.type ? calc(state, lang) : null), [state, lang]);

  const validate = (): boolean => {
    if (step === 0) return !!state.type;
    if (step === 1) return state.pages >= 1;
    if (step === 2) return true;
    if (step === 3) return !!state.timeline;
    if (step === 4) {
      const errs: Errors = {};
      if (!state.name.trim()) errs.name = t(lang, 'Name is required', 'El nombre es requerido');
      const emailOk = /^\S+@\S+\.\S+$/.test(state.email);
      if (!emailOk) errs.email = t(lang, 'Enter a valid email', 'Ingresa un correo válido');
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const next = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  // Closure-safe advance for tile auto-advance (selecting a tile is itself the
  // validation for that step). Uses a functional update so it never reads stale
  // step/state captured by the setTimeout in StepType/StepTimeline.
  const advance = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  // Functional feature toggle — robust against rapid clicks (no stale read).
  const toggleFeature = (id: string) =>
    setState((prev) => ({
      ...prev,
      features: prev.features.includes(id)
        ? prev.features.filter((x) => x !== id)
        : [...prev.features, id],
    }));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const jump = (i: number) => setStep(i);

  const send = () => {
    if (!breakdown) return;
    const url = buildCalendlyUrl(state, breakdown, lang);
    if (typeof window.plausible === 'function') {
      window.plausible('estimator_complete', {
        props: { type: state.type, timeline: state.timeline, total: String(Math.round(breakdown.total)) },
      });
    }
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url });
    } else {
      window.open(url, '_blank');
    }
    setSent(true);
  };

  const showLiveBar = step >= 1 && breakdown;
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (wrapRef.current) {
      const top = wrapRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [step]);

  return (
    <div className="est-wrap" ref={wrapRef}>
      <Progress current={step} total={STEPS.length} steps={STEPS} onJump={jump} lang={lang} />
      <div className="est-stage" key={step}>
        {step === 0 && <StepType state={state} set={set} next={advance} lang={lang} />}
        {step === 1 && <StepPages state={state} set={set} lang={lang} />}
        {step === 2 && <StepFeatures state={state} toggle={toggleFeature} lang={lang} />}
        {step === 3 && <StepTimeline state={state} set={set} next={advance} lang={lang} />}
        {step === 4 && <StepContact state={state} set={set} errors={errors} lang={lang} />}
        {step === 5 && breakdown && <StepResult state={state} breakdown={breakdown} onSend={send} sent={sent} lang={lang} />}
      </div>
      {step < STEPS.length - 1 && (
        <div className="est-nav">
          <button type="button" className="est-back" onClick={back} disabled={step === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"></polyline></svg>
            {t(lang, 'Back', 'Atrás')}
          </button>
          {showLiveBar && breakdown && (
            <div className="est-live">
              <span className="est-live-label">{t(lang, 'Running total', 'Total acumulado')}</span>
              <span className="est-live-amount">{fmt(breakdown.total)}</span>
            </div>
          )}
          <button type="button" className="est-next" onClick={next}>
            {step === STEPS.length - 2 ? t(lang, 'Get my estimate', 'Obtener mi Estimado') : t(lang, 'Continue', 'Continuar')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}
