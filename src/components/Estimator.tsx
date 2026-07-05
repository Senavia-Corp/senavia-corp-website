import { useState, useMemo, useEffect, useRef } from 'react';
import { CALENDLY_URL } from '@/data/site';
import {
  EST_PACKAGES,
  EST_COMPONENTS,
  packagesFor,
  nextPackage,
  availableAddons,
  packageNameForTier,
  type EstPkg,
  type EstComponent,
  type Category,
  type Track,
} from '@/data/estimator';

// ============================================================
// I18N
// ============================================================
type Lang = 'en' | 'es';
const t = (lang: Lang, en: string, es: string) => (lang === 'es' ? es : en);
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const fmtMonths = (m: number) => {
  const r = Math.round(m * 2) / 2;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
    /* Shared Calendly loader exposed by BaseLayout (WL-022). */
    ensureCalendly?: () => Promise<{ initPopupWidget: (opts: { url: string }) => void } | null>;
    openCalendly?: (url?: string) => void;
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

// ============================================================
// STATE
// ============================================================
interface State {
  category: '' | Category;
  track: '' | Track;
  packageId: string;
  addons: string[];
}

const STEP_LABELS: Record<string, { en: string; es: string }> = {
  category: { en: 'Type', es: 'Tipo' },
  platform: { en: 'Platform', es: 'Plataforma' },
  pkg: { en: 'Package', es: 'Paquete' },
  addons: { en: 'Add-ons', es: 'Add-ons' },
  summary: { en: 'Estimate', es: 'Estimado' },
};

// ============================================================
// PROGRESS
// ============================================================
function Progress({ stepIds, current, onJump, lang }: { stepIds: string[]; current: number; onJump: (i: number) => void; lang: Lang }) {
  const pct = stepIds.length > 1 ? (current / (stepIds.length - 1)) * 100 : 0;
  return (
    <div className="est-progress">
      <div className="est-progress-track">
        <div className="est-progress-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="est-progress-steps">
        {stepIds.map((id, i) => {
          const status = i < current ? 'done' : i === current ? 'active' : 'todo';
          return (
            <button
              key={id}
              type="button"
              className={`est-step-dot is-${status}`}
              onClick={() => i <= current && onJump(i)}
              disabled={i > current}
              aria-current={i === current ? 'step' : undefined}
              aria-label={`${t(lang, 'Step', 'Paso')} ${i + 1}: ${t(lang, STEP_LABELS[id].en, STEP_LABELS[id].es)}`}
            >
              <span className="est-step-num">{i + 1}</span>
              <span className="est-step-label">{t(lang, STEP_LABELS[id].en, STEP_LABELS[id].es)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STEP 1 — CATEGORY
// ============================================================
function StepCategory({ state, choose, lang }: { state: State; choose: (c: Category) => void; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 1 · What you need', 'Paso 1 · Qué necesitas')}</span>
      <h2>{t(lang, 'What do you want to build?', '¿Qué quieres construir?')}</h2>
      <p className="est-lede">{t(lang, 'Two paths, in plain terms. Pick the one that sounds like you — we tailor everything from here.', 'Dos caminos, en simple. Elige el que suene a ti — desde aquí lo ajustamos todo.')}</p>
      <div className="est-grid-2">
        <button type="button" className={`est-tile ${state.category === 'business' ? 'is-active' : ''}`} aria-pressed={state.category === 'business'} onClick={() => choose('business')}>
          <span className="est-tile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><circle cx="6" cy="6.5" r="0.6" fill="currentColor" /></svg>
          </span>
          <span className="est-tile-label">{t(lang, 'A site that grows my business', 'Un sitio que haga crecer mi negocio')}</span>
          <span className="est-tile-sub">{t(lang, 'Presence, authority, and leads — from a landing page to a full client portal.', 'Presencia, autoridad y clientes — desde una landing hasta un portal de clientes.')}</span>
          <span className="est-tile-price">{t(lang, 'Business Websites · from', 'Sitios Empresariales · desde')} $1,500</span>
        </button>
        <button type="button" className={`est-tile ${state.category === 'ecommerce' ? 'is-active' : ''}`} aria-pressed={state.category === 'ecommerce'} onClick={() => choose('ecommerce')}>
          <span className="est-tile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-2 11H8L6 4H3" /><circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
          </span>
          <span className="est-tile-label">{t(lang, 'Sell products online', 'Vender productos en línea')}</span>
          <span className="est-tile-sub">{t(lang, 'An online store built to sell — on Webflow for brand, or Shopify to scale.', 'Una tienda hecha para vender — en Webflow por marca, o Shopify para escalar.')}</span>
          <span className="est-tile-price">{t(lang, 'E-Commerce · from', 'E-Commerce · desde')} $1,600</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 — PLATFORM (e-commerce only)
// ============================================================
function StepPlatform({ state, choose, lang }: { state: State; choose: (tr: Track) => void; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step 2 · Platform', 'Paso 2 · Plataforma')}</span>
      <h2>{t(lang, 'How do you want to sell?', '¿Cómo quieres vender?')}</h2>
      <p className="est-lede">{t(lang, 'Webflow and Shopify are different engines. This one question routes you to the right one — they don’t mix.', 'Webflow y Shopify son motores distintos. Esta pregunta te lleva al correcto — no se mezclan.')}</p>
      <div className="est-grid-2">
        <button type="button" className={`est-tile ${state.track === 'webflow' ? 'is-active' : ''}`} aria-pressed={state.track === 'webflow'} onClick={() => choose('webflow')}>
          <span className="est-platform-tag is-webflow">Webflow</span>
          <span className="est-tile-label">{t(lang, 'Brand, design & content', 'Marca, diseño y contenido')}</span>
          <span className="est-tile-sub">{t(lang, 'A design-led store with a manageable catalog. You sell through brand and story.', 'Una tienda con diseño y catálogo manejable. Vendes por marca e historia.')}</span>
          <span className="est-tile-price">{t(lang, 'Starter / Brand · from', 'Starter / Brand · desde')} $1,600</span>
        </button>
        <button type="button" className={`est-tile ${state.track === 'shopify' ? 'is-active' : ''}`} aria-pressed={state.track === 'shopify'} onClick={() => choose('shopify')}>
          <span className="est-platform-tag is-shopify">Shopify</span>
          <span className="est-tile-label">{t(lang, 'Scale & sell everywhere', 'Escalar y vender en todos lados')}</span>
          <span className="est-tile-sub">{t(lang, 'Recurring revenue, omnichannel, heavy inventory. Built to scale operations.', 'Ingresos recurrentes, omnicanal, mucho inventario. Hecho para escalar.')}</span>
          <span className="est-tile-price">{t(lang, 'Scale / Enterprise · from', 'Scale / Enterprise · desde')} $6,800</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 3 — BASE PACKAGE
// ============================================================
function StepPackage({ state, pkgs, choose, lang }: { state: State; pkgs: EstPkg[]; choose: (id: string) => void; lang: Lang }) {
  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step · Base package', 'Paso · Paquete base')}</span>
      <h2>{t(lang, 'Pick your starting package', 'Elige tu paquete base')}</h2>
      <p className="est-lede">{t(lang, 'This is your floor — everything it includes is yours. Next, you only add capabilities from higher tiers.', 'Este es tu piso — todo lo que incluye es tuyo. Luego solo sumas capacidades de niveles superiores.')}</p>
      <div className="est-pkg-grid">
        {pkgs.map((p) => {
          const on = state.packageId === p.id;
          return (
            <button key={p.id} type="button" className={`est-pkg ${on ? 'is-active' : ''} ${p.badge_en ? 'is-badged' : ''}`} aria-pressed={on} onClick={() => choose(p.id)}>
              <span className="est-pkg-flag">
                <span className="est-pkg-level">{t(lang, p.level_en, p.level_es)}</span>
                {p.badge_en && <span className="est-pkg-badge">★ {t(lang, p.badge_en, p.badge_es || p.badge_en)}</span>}
              </span>
              <span className="est-pkg-name">{p.name}</span>
              <span className="est-pkg-price"><b>{fmt(p.basePrice)}</b> <i>{t(lang, 'base', 'base')}</i></span>
              <span className="est-pkg-tagline">{t(lang, p.tagline_en, p.tagline_es)}</span>
              <span className="est-pkg-foryou"><b>{t(lang, 'For you if', 'Para ti si')}</b> {t(lang, p.forYou_en, p.forYou_es)}</span>
              <span className="est-pkg-meta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>
                {t(lang, `Delivery in ${p.delivery_en}`, `Entrega en ${p.delivery_es}`)}
              </span>
              <span className="est-pkg-radio" aria-hidden="true">{on ? <span /> : null}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STEP 4 — ADD-ONS
// ============================================================
function StepAddons({
  base, addons, addonsTotal, toggle, nudgePkg, jump, onUpgrade, lang,
}: {
  base: EstPkg;
  addons: string[];
  addonsTotal: number;
  toggle: (id: string) => void;
  nudgePkg: EstPkg | null;
  jump: number;
  onUpgrade: (id: string) => void;
  lang: Lang;
}) {
  const available = availableAddons(base);
  const tiers = [...new Set(available.map((c) => c.tier))].sort((a, b) => a - b);
  const showNudge = !!(nudgePkg && addonsTotal >= 0.8 * jump && addonsTotal > 0);
  const isWebflowTop = base.category === 'ecommerce' && base.track === 'webflow' && available.length === 0;
  const isTopTier = base.cta === 'sales';

  return (
    <div className="est-card">
      <span className="est-eyebrow">{t(lang, 'Step · Add capabilities', 'Paso · Suma capacidades')}</span>
      <h2>{t(lang, 'Build on your base', 'Construye sobre tu base')}</h2>
      <p className="est-lede">
        {t(lang,
          `You start with everything in ${base.name}. Add only what takes you further — value first, price at the end.`,
          `Arrancas con todo lo de ${base.name}. Suma solo lo que te lleva más lejos — primero el valor, el precio al final.`)}
      </p>

      {/* Included in base */}
      <div className="est-incl">
        <div className="est-incl-head">{t(lang, `Included in your ${base.name}`, `Incluido en tu ${base.name}`)}</div>
        <ul className="est-incl-list">
          {base.includes.map((it, i) => (
            <li key={i}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {t(lang, it.en, it.es)}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade nudge */}
      {showNudge && nudgePkg && (
        <div className="est-nudge">
          <div className="est-nudge-body">
            <strong>{t(lang, `You're almost at ${nudgePkg.name}`, `Estás casi en ${nudgePkg.name}`)}</strong>
            <span>{t(lang,
              `These add-ons cost about the same as upgrading to ${nudgePkg.name} (${fmt(nudgePkg.basePrice)}) — which includes all of this and more.`,
              `Estos add-ons cuestan casi lo mismo que subir a ${nudgePkg.name} (${fmt(nudgePkg.basePrice)}) — que ya incluye todo esto y más.`)}</span>
          </div>
          <button type="button" className="est-nudge-btn" onClick={() => onUpgrade(nudgePkg.id)}>
            {t(lang, `Switch to ${nudgePkg.name}`, `Cambiar a ${nudgePkg.name}`)}
          </button>
        </div>
      )}

      {/* Available add-ons grouped by source package */}
      {available.length > 0 ? (
        tiers.map((tier) => (
          <div className="est-group" key={tier}>
            <div className="est-group-head">
              <span>{t(lang, 'Add from', 'Suma de')} <b>{packageNameForTier(base, tier)}</b></span>
            </div>
            <div className="est-feat-grid">
              {available.filter((c) => c.tier === tier).map((c) => {
                const on = addons.includes(c.id);
                return (
                  <button key={c.id} type="button" className={`est-feat ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(c.id)}>
                    <span className="est-feat-check" aria-hidden="true">
                      {on ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> : null}
                    </span>
                    <span className="est-feat-body">
                      <span className="est-feat-label">{t(lang, c.label_en, c.label_es)}</span>
                      <span className="est-feat-desc">{t(lang, c.benefit_en, c.benefit_es)}</span>
                    </span>
                    <span className="est-feat-price">+{fmt(c.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : isWebflowTop ? (
        <div className="est-note">
          {t(lang,
            "You've got the full Webflow line. To scale further — subscriptions at volume, omnichannel, recurring revenue — that's our Shopify line. Let's find the right fit on a call.",
            'Tienes toda la línea Webflow. Para escalar más — suscripciones a volumen, omnicanal, ingresos recurrentes — esa es la línea Shopify. Definamos el ajuste correcto en una llamada.')}
        </div>
      ) : isTopTier ? (
        <div className="est-note">
          {t(lang,
            "This is our top tier — it's tailored to you. We'll scope the exact build together on a call.",
            'Este es nuestro nivel más alto — se diseña a tu medida. Definimos el alcance exacto juntos en una llamada.')}
        </div>
      ) : null}

      <p className="est-disclaimer">{t(lang, 'Non-binding estimate. Final price is confirmed on a call.', 'Estimado no vinculante. El precio final se confirma en una llamada.')}</p>
    </div>
  );
}

// ============================================================
// STEP 5 — SUMMARY
// ============================================================
function StepSummary({
  base, selected, total, months, nudgePkg, jump, addonsTotal, onUpgrade, onBook, lang,
}: {
  base: EstPkg;
  selected: EstComponent[];
  total: number;
  months: number;
  nudgePkg: EstPkg | null;
  jump: number;
  addonsTotal: number;
  onUpgrade: (id: string) => void;
  onBook: () => void;
  lang: Lang;
}) {
  const isSales = base.cta === 'sales';
  const showNudge = !!(nudgePkg && addonsTotal >= 0.8 * jump && addonsTotal > 0);
  return (
    <div className="est-card est-result">
      <span className="est-eyebrow">{t(lang, 'Your estimate', 'Tu estimado')}</span>
      <h2>{t(lang, "Here's your starting estimate", 'Aquí está tu estimado de partida')}</h2>
      <p className="est-lede">{t(lang,
        'A realistic starting point based on your selections. The final scope and price are locked in on a free 30-minute call.',
        'Un punto de partida realista según tus selecciones. El alcance y precio final se definen en una llamada gratis de 30 minutos.')}</p>

      {showNudge && nudgePkg && (
        <div className="est-nudge">
          <div className="est-nudge-body">
            <strong>{t(lang, `Tip: ${nudgePkg.name} may be the better deal`, `Tip: ${nudgePkg.name} puede convenirte más`)}</strong>
            <span>{t(lang,
              `It includes everything you picked and more for ${fmt(nudgePkg.basePrice)} base.`,
              `Incluye todo lo que elegiste y más por ${fmt(nudgePkg.basePrice)} base.`)}</span>
          </div>
          <button type="button" className="est-nudge-btn" onClick={() => onUpgrade(nudgePkg.id)}>
            {t(lang, `Switch to ${nudgePkg.name}`, `Cambiar a ${nudgePkg.name}`)}
          </button>
        </div>
      )}

      <div className="est-result-grid">
        <div className="est-bd">
          <h3>{t(lang, 'What you’re getting', 'Lo que obtienes')}</h3>
          <ul className="est-bd-list">
            <li>
              <span><b>{base.name}</b> <span className="tag">{t(lang, 'base', 'base')}</span></span>
              <span className="amt">{fmt(base.basePrice)}</span>
            </li>
            {selected.map((c) => (
              <li key={c.id}>
                <span>{t(lang, c.label_en, c.label_es)}</span>
                <span className="amt">+{fmt(c.price)}</span>
              </li>
            ))}
            <li className="subtotal">
              <span>{t(lang, 'Estimated timeline', 'Plazo estimado')}</span>
              <span className="amt">≈ {fmtMonths(months)} {t(lang, 'mo', 'meses')}</span>
            </li>
          </ul>
        </div>
        <div className="est-total">
          <span className="est-total-label">{t(lang, 'Estimated total', 'Total estimado')}</span>
          <span className="est-total-amount">{t(lang, 'from', 'desde')} {fmt(total)}</span>
          <span className="est-total-note">{t(lang,
            'Includes hosting setup, training, and 30-day post-launch optimization.',
            'Incluye configuración de hosting, capacitación y 30 días de optimización post-lanzamiento.')}</span>
          <button type="button" className="est-send" onClick={onBook}>
            {isSales ? t(lang, 'Talk to Sales', 'Hablar con Ventas') : t(lang, 'Book a Free Call', 'Agenda tu Llamada Gratis')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
          <a href="tel:+17542623659" className="est-call">{t(lang, 'Or call us · (754) 262-3659', 'O llámanos · (754) 262-3659')}</a>
        </div>
      </div>
      <p className="est-disclaimer">{t(lang, 'Non-binding estimate. Final price is confirmed on a call.', 'Estimado no vinculante. El precio final se confirma en una llamada.')}</p>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function Estimator() {
  const [lang, setLang] = useState<Lang>('en');
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>({ category: '', track: '', packageId: '', addons: [] });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  // Sync with site-wide language switcher.
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('lang-es')) setLang('es');
    const onLang = (e: Event) => {
      const d = (e as CustomEvent<{ lang?: string }>).detail;
      if (d?.lang === 'es' || d?.lang === 'en') setLang(d.lang);
    };
    window.addEventListener('languagechange', onLang as EventListener);
    return () => window.removeEventListener('languagechange', onLang as EventListener);
  }, []);

  // Dynamic step sequence (e-commerce inserts a platform step).
  const stepIds = useMemo(
    () => (state.category === 'ecommerce'
      ? ['category', 'platform', 'pkg', 'addons', 'summary']
      : ['category', 'pkg', 'addons', 'summary']),
    [state.category],
  );
  const stepId = stepIds[step] ?? 'category';

  const base = useMemo(() => EST_PACKAGES.find((p) => p.id === state.packageId) ?? null, [state.packageId]);
  const selected = useMemo(() => EST_COMPONENTS.filter((c) => state.addons.includes(c.id)), [state.addons]);
  const addonsTotal = useMemo(() => selected.reduce((s, c) => s + c.price, 0), [selected]);
  const total = base ? base.basePrice + addonsTotal : 0;
  const nudgePkg = base ? nextPackage(base) : null;
  const jump = base && nudgePkg ? nudgePkg.basePrice - base.basePrice : 0;
  const months = useMemo(() => {
    if (!base) return 0;
    let m = base.baseMonths + selected.reduce((s, c) => s + c.months, 0);
    if (nudgePkg) m = Math.min(m, nudgePkg.baseMonths + 0.5);
    return m;
  }, [base, selected, nudgePkg]);

  // Scroll into view on step change. WL-038: skipped on the initial mount so
  // the page loads at y=0 (hero + nav visible) instead of jumping ~565px down.
  // WL-039: after each real step change, move focus to the new step's heading
  // — the stage re-mounts (key={stepId}) and would otherwise drop focus to
  // <body>, forcing keyboard/SR users to re-tab through the whole nav.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (wrapRef.current) {
      const top = wrapRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
      const heading = wrapRef.current.querySelector<HTMLElement>('.est-stage h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [step]);

  const goTo = (i: number) => setStep(Math.max(0, Math.min(i, stepIds.length - 1)));
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const chooseCategory = (c: Category) => {
    setState({ category: c, track: '', packageId: '', addons: [] });
    setTimeout(() => setStep(1), 200);
  };
  const choosePlatform = (tr: Track) => {
    setState((p) => ({ ...p, track: tr, packageId: '', addons: [] }));
    setTimeout(() => setStep(2), 200);
  };
  const choosePackage = (id: string) => {
    setState((p) => ({ ...p, packageId: id, addons: [] }));
    const idx = stepIds.indexOf('addons');
    setTimeout(() => setStep(idx), 200);
  };

  // Toggle add-on with dependency handling (requires → auto-include; removing a
  // prerequisite removes its dependents).
  const toggleAddon = (id: string) => {
    const comp = EST_COMPONENTS.find((c) => c.id === id);
    if (!comp) return;
    setState((prev) => {
      let addons = [...prev.addons];
      if (addons.includes(id)) {
        addons = addons.filter((x) => x !== id);
        addons = addons.filter((x) => {
          const c = EST_COMPONENTS.find((k) => k.id === x);
          return !c?.requires?.includes(id);
        });
      } else {
        addons.push(id);
        (comp.requires ?? []).forEach((req) => { if (!addons.includes(req)) addons.push(req); });
      }
      return { ...prev, addons };
    });
  };

  // Upgrade to the next package: keep only add-ons still above the new tier.
  const upgradeTo = (pkgId: string) => {
    const np = EST_PACKAGES.find((p) => p.id === pkgId);
    if (!np) return;
    setState((prev) => ({
      ...prev,
      packageId: pkgId,
      addons: prev.addons.filter((aid) => {
        const c = EST_COMPONENTS.find((k) => k.id === aid);
        return !!c && c.tier > np.tier;
      }),
    }));
  };

  const book = () => {
    if (!base) return;
    const lines = [
      `${t(lang, 'Package', 'Paquete')}: ${base.name} (${fmt(base.basePrice)})`,
      selected.length ? `${t(lang, 'Add-ons', 'Add-ons')}: ${selected.map((c) => t(lang, c.label_en, c.label_es)).join(', ')}` : '',
      `${t(lang, 'Estimated total', 'Total estimado')}: ${t(lang, 'from', 'desde')} ${fmt(total)}`,
      `${t(lang, 'Timeline', 'Plazo')}: ≈ ${fmtMonths(months)} ${t(lang, 'months', 'meses')}`,
    ].filter(Boolean).join(' · ');
    const url = `${CALENDLY_URL}?${new URLSearchParams({ a1: lines }).toString()}`;
    if (typeof window.plausible === 'function') {
      window.plausible('estimator_complete', { props: { package: base.id, total: String(Math.round(total)) } });
    }
    // WL-038 — go through the shared loader (BaseLayout, WL-022) instead of
    // racing window.Calendly directly: on slow networks the widget may still
    // be loading, and openCalendly() waits for it (with its own new-tab
    // fallback on ad-blockers/timeouts).
    if (typeof window.openCalendly === 'function') window.openCalendly(url);
    else if (window.Calendly) window.Calendly.initPopupWidget({ url });
    else window.open(url, '_blank', 'noopener');
  };

  // Can we advance from the current step?
  const canNext = (() => {
    if (stepId === 'category') return !!state.category;
    if (stepId === 'platform') return !!state.track;
    if (stepId === 'pkg') return !!state.packageId;
    return true;
  })();

  const pkgs = state.category ? packagesFor(state.category as Category, state.track as Track) : [];

  return (
    <div className="est-wrap" ref={wrapRef}>
      <Progress stepIds={stepIds} current={step} onJump={goTo} lang={lang} />
      <div className="est-stage" key={stepId}>
        {stepId === 'category' && <StepCategory state={state} choose={chooseCategory} lang={lang} />}
        {stepId === 'platform' && <StepPlatform state={state} choose={choosePlatform} lang={lang} />}
        {stepId === 'pkg' && <StepPackage state={state} pkgs={pkgs} choose={choosePackage} lang={lang} />}
        {stepId === 'addons' && base && (
          <StepAddons base={base} addons={state.addons} addonsTotal={addonsTotal} toggle={toggleAddon} nudgePkg={nudgePkg} jump={jump} onUpgrade={upgradeTo} lang={lang} />
        )}
        {stepId === 'summary' && base && (
          <StepSummary base={base} selected={selected} total={total} months={months} nudgePkg={nudgePkg} jump={jump} addonsTotal={addonsTotal} onUpgrade={upgradeTo} onBook={book} lang={lang} />
        )}
      </div>

      {stepId !== 'summary' && (
        <div className="est-nav">
          <button type="button" className="est-back" onClick={back} disabled={step === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18" /></svg>
            {t(lang, 'Back', 'Atrás')}
          </button>
          {base && step >= stepIds.indexOf('addons') - 1 && step >= 1 && (
            <div className="est-live">
              <span className="est-live-label">{t(lang, 'Running total', 'Total acumulado')}</span>
              <span className="est-live-amount">{t(lang, 'from', 'desde')} {fmt(total)}</span>
            </div>
          )}
          <button type="button" className="est-next" onClick={next} disabled={!canNext}>
            {stepId === 'addons' ? t(lang, 'See my estimate', 'Ver mi estimado') : t(lang, 'Continue', 'Continuar')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
