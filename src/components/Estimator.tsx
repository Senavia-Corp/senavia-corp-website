import { useState, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CALENDLY_URL } from '@/data/site';

// ============================================================
// TYPES
// ============================================================
interface SiteType {
  id: string;
  label: string;
  sub: string;
  base: number;
  basePages: number;
  icon: ReactNode;
}
interface Feature {
  id: string;
  label: string;
  price: number;
  desc: string;
}
interface Timeline {
  id: string;
  label: string;
  sub: string;
  mult: number;
  badge: string;
  tone: 'warn' | 'mid' | 'good' | 'ok';
}
interface Step {
  id: string;
  short: string;
  label: string;
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
// DATA
// ============================================================
const SITE_TYPES: SiteType[] = [
  {
    id: 'business',
    label: 'Business Site',
    sub: 'Brand & lead-gen marketing site',
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
    label: 'E-commerce',
    sub: 'Shopify or Webflow storefront',
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
    label: 'Web App',
    sub: 'Custom platform or CRM / portal',
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
    label: 'Landing Page',
    sub: 'Single-page campaign page',
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
  { id: 'blog', label: 'Blog & CMS', price: 400, desc: 'CMS-driven blog with categories & author profiles' },
  { id: 'contact', label: 'Contact & lead forms', price: 150, desc: 'Multi-step forms with CRM & email routing' },
  { id: 'booking', label: 'Online booking system', price: 650, desc: 'Calendar embed, reminders, payments' },
  { id: 'multilingual', label: 'Multilingual (EN / ES)', price: 850, desc: 'Bilingual structure with hreflang setup' },
  { id: 'ecommerce', label: 'E-commerce store', price: 1200, desc: 'Products, checkout, payments — Shopify or custom' },
  { id: 'crm', label: 'CRM integration', price: 950, desc: 'HubSpot, Pipedrive, Podio, or custom CRM' },
  { id: 'membership', label: 'Membership / gated content', price: 1400, desc: 'Member login, paywall, tiered access' },
  { id: 'automation', label: 'Email automation flows', price: 1200, desc: 'Klaviyo or Mailchimp nurture sequences' },
  { id: 'analytics', label: 'GA4 & conversion tracking', price: 250, desc: 'Analytics, GTM, conversion goals — verified' },
  { id: 'seo-advanced', label: 'Advanced SEO & schema', price: 750, desc: 'Schema markup, AEO structure, audit report' },
  { id: 'forms-custom', label: 'Custom quote builder', price: 800, desc: 'Multi-step intake with conditional logic' },
  { id: 'photography', label: 'Photography day', price: 1100, desc: 'Half-day on-location shoot, edited deliverables' },
];

const TIMELINES: Timeline[] = [
  { id: 'asap', label: 'ASAP', sub: 'Rush · within 3 weeks', mult: 1.25, badge: '+25%', tone: 'warn' },
  { id: '1mo', label: '1 month', sub: 'Standard fast-track', mult: 1.1, badge: '+10%', tone: 'mid' },
  { id: '2-3mo', label: '2 – 3 months', sub: 'Recommended pace', mult: 1.0, badge: 'Best fit', tone: 'good' },
  { id: 'flexible', label: 'Flexible', sub: 'No rush · 4+ months', mult: 0.95, badge: '−5%', tone: 'ok' },
];

const STEPS: Step[] = [
  { id: 'type', short: 'Type', label: 'Project type' },
  { id: 'pages', short: 'Pages', label: 'Page count' },
  { id: 'features', short: 'Features', label: 'Features' },
  { id: 'timeline', short: 'Timeline', label: 'Timeline' },
  { id: 'contact', short: 'You', label: 'Your info' },
  { id: 'result', short: 'Result', label: 'Your estimate' },
];

// ============================================================
// HELPERS
// ============================================================
const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

function calc(state: State) {
  const type = SITE_TYPES.find((t) => t.id === state.type) || SITE_TYPES[0];
  const tl = TIMELINES.find((t) => t.id === state.timeline) || TIMELINES[2];
  const baseLine = { label: type.label + ' base build', amount: type.base };
  const pagesOver = Math.max(0, state.pages - type.basePages);
  const pagesLine = pagesOver > 0
    ? { label: `Additional pages (${pagesOver} × $150)`, amount: pagesOver * 150 }
    : null;
  const featLines = state.features.map((fid) => {
    const f = FEATURES.find((x) => x.id === fid)!;
    return { label: f.label, amount: f.price };
  });
  const subtotal =
    baseLine.amount +
    (pagesLine ? pagesLine.amount : 0) +
    featLines.reduce((s, l) => s + l.amount, 0);
  const tlAdjust = subtotal * (tl.mult - 1);
  const total = subtotal + tlAdjust;
  return { base: baseLine, pages: pagesLine, features: featLines, subtotal, timeline: tl, tlAdjust, total };
}

function buildCalendlyUrl(state: State, breakdown: ReturnType<typeof calc>) {
  const type = SITE_TYPES.find((t) => t.id === state.type);
  const features = state.features
    .map((id) => FEATURES.find((f) => f.id === id)?.label)
    .filter(Boolean)
    .join(', ');
  const summary = [
    `Project: ${type?.label ?? 'Unknown'}`,
    `Pages: ${state.pages}`,
    `Timeline: ${breakdown.timeline.label}`,
    `Estimated total: ${fmt(breakdown.total)}`,
    features ? `Features: ${features}` : '',
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
}
function Progress({ current, total, steps, onJump }: ProgressProps) {
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
              aria-label={`Step ${i + 1}: ${s.label}`}
            >
              <span className="est-step-num">{i + 1}</span>
              <span className="est-step-label">{s.short}</span>
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
function StepType({ state, set, next }: { state: State; set: (p: Partial<State>) => void; next: () => void }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">Step 1 · Project type</span>
      <h2>What type of website do you need?</h2>
      <p className="est-lede">Pick the option closest to your project — we'll fine-tune the details in the next steps.</p>
      <div className="est-grid-4">
        {SITE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`est-tile ${state.type === t.id ? 'is-active' : ''}`}
            onClick={() => {
              set({ type: t.id, pages: state.pages === 0 ? t.basePages : state.pages });
              setTimeout(next, 220);
            }}
          >
            <span className="est-tile-icon">{t.icon}</span>
            <span className="est-tile-label">{t.label}</span>
            <span className="est-tile-sub">{t.sub}</span>
            <span className="est-tile-price">from {fmt(t.base)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPages({ state, set }: { state: State; set: (p: Partial<State>) => void }) {
  const type = SITE_TYPES.find((t) => t.id === state.type) || SITE_TYPES[0];
  const pages = state.pages || type.basePages;
  const pagesOver = Math.max(0, pages - type.basePages);
  return (
    <div className="est-card">
      <span className="est-eyebrow">Step 2 · Page count</span>
      <h2>How many pages?</h2>
      <p className="est-lede">Includes Home, About, Service, Contact — and any deeper pages your visitors need.</p>
      <div className="est-pages-display">
        <span className="est-pages-num">{pages}</span>
        <span className="est-pages-unit">{pages === 1 ? 'page' : 'pages'}</span>
      </div>
      <input
        type="range"
        min={1}
        max={50}
        step={1}
        value={pages}
        onChange={(e) => set({ pages: parseInt(e.target.value, 10) })}
        className="est-slider"
        aria-label="Number of pages"
      />
      <div className="est-slider-scale">
        <span>1</span>
        <span>10</span>
        <span>25</span>
        <span>50</span>
      </div>
      <div className="est-page-meta">
        <span>{type.basePages} pages included in {type.label} base</span>
        {pagesOver > 0 ? (
          <span className="accent">+{pagesOver} × $150 = {fmt(pagesOver * 150)}</span>
        ) : (
          <span className="muted">No additional charge</span>
        )}
      </div>
    </div>
  );
}

function StepFeatures({ state, set }: { state: State; set: (p: Partial<State>) => void }) {
  const toggle = (id: string) => {
    const f = state.features.includes(id)
      ? state.features.filter((x) => x !== id)
      : [...state.features, id];
    set({ features: f });
  };
  return (
    <div className="est-card">
      <span className="est-eyebrow">Step 3 · Features</span>
      <h2>What features should we include?</h2>
      <p className="est-lede">Pick any combination. Prices are added to your base build below.</p>
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
                <span className="est-feat-label">{f.label}</span>
                <span className="est-feat-desc">{f.desc}</span>
              </span>
              <span className="est-feat-price">+{fmt(f.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTimeline({ state, set, next }: { state: State; set: (p: Partial<State>) => void; next: () => void }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">Step 4 · Timeline</span>
      <h2>When do you need it live?</h2>
      <p className="est-lede">Rush projects carry a premium; flexible timelines unlock a small discount.</p>
      <div className="est-tl-grid">
        {TIMELINES.map((t) => {
          const on = state.timeline === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className={`est-tl ${on ? 'is-active' : ''} tone-${t.tone}`}
              onClick={() => {
                set({ timeline: t.id });
                setTimeout(next, 220);
              }}
            >
              <span className={`est-tl-badge tone-${t.tone}`}>{t.badge}</span>
              <span className="est-tl-label">{t.label}</span>
              <span className="est-tl-sub">{t.sub}</span>
              <span className="est-tl-radio" aria-hidden="true">{on ? <span /> : null}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepContact({ state, set, errors }: { state: State; set: (p: Partial<State>) => void; errors: Errors }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">Step 5 · Your info</span>
      <h2>Where should we send your estimate?</h2>
      <p className="est-lede">We'll open our calendar pre-filled so you can pick a 30-minute review call. No spam, ever.</p>
      <div className="est-form">
        <div className="est-field">
          <label>Full name <span className="req">*</span></label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Jane Rivera"
            autoComplete="name"
          />
          {errors.name ? <span className="est-err">{errors.name}</span> : null}
        </div>
        <div className="est-field">
          <label>Email <span className="req">*</span></label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="jane@business.com"
            autoComplete="email"
          />
          {errors.email ? <span className="est-err">{errors.email}</span> : null}
        </div>
        <div className="est-field full">
          <label>Phone <span className="muted-label">(optional)</span></label>
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

function StepResult({ state, breakdown, onSend, sent }: {
  state: State;
  breakdown: ReturnType<typeof calc>;
  onSend: () => void;
  sent: boolean;
}) {
  const tlGood = breakdown.timeline.mult <= 1;
  return (
    <div className="est-card est-result">
      <span className="est-eyebrow">Step 6 · Your estimate</span>
      <h2>Here's your ballpark estimate</h2>
      <p className="est-lede">Based on your selections, here's what a project like this typically runs at SENAVIA. Final pricing is locked in after a 30-minute scope call.</p>
      <div className="est-result-grid">
        <div className="est-bd">
          <h3>Cost breakdown</h3>
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
              <span>Subtotal</span>
              <span className="amt">{fmt(breakdown.subtotal)}</span>
            </li>
            <li className={tlGood ? '' : 'rush'}>
              <span>Timeline · {breakdown.timeline.label} <span className="tag">{breakdown.timeline.badge}</span></span>
              <span className="amt">{breakdown.tlAdjust >= 0 ? '+' : ''}{fmt(breakdown.tlAdjust)}</span>
            </li>
          </ul>
        </div>
        <div className="est-total">
          <span className="est-total-label">Estimated total</span>
          <span className="est-total-amount">{fmt(breakdown.total)}</span>
          <span className="est-total-note">Includes hosting setup, training, and 30-day post-launch optimization</span>
          {sent ? (
            <div className="est-sent">
              <span className="est-sent-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <strong>Calendar opened for {state.email}</strong>
              <span>Pick a 30-minute slot from the Calendly grid — we'll have your estimate context ready.</span>
            </div>
          ) : (
            <button type="button" className="est-send" onClick={onSend}>
              Book my scope call
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          )}
          <a href="tel:+17542623659" className="est-call">Or call us · (754) 262-3659</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function Estimator() {
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

  const set = (patch: Partial<State>) => setState((prev) => ({ ...prev, ...patch }));
  const breakdown = useMemo(() => (state.type ? calc(state) : null), [state]);

  const validate = (): boolean => {
    if (step === 0) return !!state.type;
    if (step === 1) return state.pages >= 1;
    if (step === 2) return true;
    if (step === 3) return !!state.timeline;
    if (step === 4) {
      const errs: Errors = {};
      if (!state.name.trim()) errs.name = 'Name is required';
      const emailOk = /^\S+@\S+\.\S+$/.test(state.email);
      if (!emailOk) errs.email = 'Enter a valid email';
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const next = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const jump = (i: number) => setStep(i);

  const send = () => {
    if (!breakdown) return;
    const url = buildCalendlyUrl(state, breakdown);
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
      <Progress current={step} total={STEPS.length} steps={STEPS} onJump={jump} />
      <div className="est-stage" key={step}>
        {step === 0 && <StepType state={state} set={set} next={next} />}
        {step === 1 && <StepPages state={state} set={set} />}
        {step === 2 && <StepFeatures state={state} set={set} />}
        {step === 3 && <StepTimeline state={state} set={set} next={next} />}
        {step === 4 && <StepContact state={state} set={set} errors={errors} />}
        {step === 5 && breakdown && <StepResult state={state} breakdown={breakdown} onSend={send} sent={sent} />}
      </div>
      {step < STEPS.length - 1 && (
        <div className="est-nav">
          <button type="button" className="est-back" onClick={back} disabled={step === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"></polyline></svg>
            Back
          </button>
          {showLiveBar && breakdown && (
            <div className="est-live">
              <span className="est-live-label">Running total</span>
              <span className="est-live-amount">{fmt(breakdown.total)}</span>
            </div>
          )}
          <button type="button" className="est-next" onClick={next}>
            {step === STEPS.length - 2 ? 'Get my estimate' : 'Continue'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}
