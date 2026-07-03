// tools/qa/lib/allowlist.mjs
// Allowlists compartidas por el harness de QA. ESM, sin dependencias.

/**
 * CONSOLA — mensajes/URLs benignos.
 * Los checks duros de red son same-origin only; todo lo externo
 * (Calendly, Plausible, YouTube, Google) se tolera aquí porque en un
 * entorno local/headless esos orígenes fallan o son bloqueados por CSP.
 */
export const CONSOLE_ALLOW_SUBSTRINGS = [
  'calendly.com',
  'plausible.io',
  'ytimg',
  'youtube',
  'googleapis',
  'gstatic',
  'google.com/maps',
  'net::ERR_BLOCKED_BY_CLIENT',
];

export const CONSOLE_ALLOW_PATTERNS = [
  /net::ERR_.*BLOCKED/, // p.ej. ERR_BLOCKED_BY_CLIENT / ERR_BLOCKED_BY_CSP / ERR_BLOCKED_BY_ORB
  // Los fallos HTTP de recursos ya los captura el check de red (requests4xx5xx,
  // same-origin only). Se excluyen aquí para no contar el mismo defecto dos veces
  // (verificado en calibración iteration-00: el <img> 404 inyectado generaba
  // 1 request 404 + 1 console error duplicado).
  /^Failed to load resource:/,
];

/** true si el error de consola está permitido. */
export function consoleAllowed(text, locationUrl = '') {
  const hay = `${text} ${locationUrl}`;
  if (CONSOLE_ALLOW_SUBSTRINGS.some((s) => hay.includes(s))) return true;
  if (CONSOLE_ALLOW_PATTERNS.some((re) => re.test(hay))) return true;
  return false;
}

/**
 * href="#" LEGÍTIMOS — selectores derivados de inspección del código fuente
 * (2026-07-02):
 *
 * 1) Botones Calendly — abren el popup de Calendly vía JS, no navegan.
 *    - src/components/CalendlyButton.astro:17-23 → <a href="#" data-calendly-trigger data-track="book_call_click">
 *    - src/components/PackageCard.astro:69       → <a href="#" class={btnClass} data-calendly-trigger>
 *    - src/components/Nav.astro:107,206          → <a href="#" class="btn is-nav-primary|is-block" data-calendly-trigger>
 *    - Además múltiples usos inline en src/pages/*.astro, todos con data-calendly-trigger.
 *    Selector canónico: [data-calendly-trigger]
 *
 * 2) Language switcher — cambia clase lang-en/lang-es en <html>, no navega.
 *    - src/components/LangSwitcher.astro:21,26 → <a href="#" class="nav-lang-option" data-lang="en|es" role="menuitem">
 *    Selectores: a.nav-lang-option[data-lang]  (y el atributo data-lang como red de seguridad)
 */
export const HREF_HASH_ALLOW_SELECTORS = [
  '[data-calendly-trigger]',
  'a.nav-lang-option[data-lang]',
];

/** Selector combinado para usar con Element.matches(). */
export const HREF_HASH_ALLOW_SELECTOR = HREF_HASH_ALLOW_SELECTORS.join(', ');

/**
 * PLACEHOLDERS — regex sobre innerText renderizado.
 * Nota de calibración: el sitio es bilingüe EN/ES con CSS-swap; "todo" es
 * una palabra común en español, así que `TODO` se matchea case-SENSITIVE
 * (mayúsculas exactas) para no generar cientos de falsos positivos.
 * El resto de términos sí son case-insensitive.
 */
export const PLACEHOLDER_PATTERNS = [
  { name: 'lorem', source: '\\blorem( ipsum)?\\b', flags: 'gi' },
  { name: 'placeholder', source: '\\bplaceholder\\b', flags: 'gi' },
  { name: 'todo', source: '\\bTODO\\b', flags: 'g' }, // case-sensitive a propósito
  { name: 'coming-soon', source: '\\bcoming soon\\b', flags: 'gi' },
];

/**
 * Elementos cuyo texto es un fallback INTENCIONAL (no placeholder de contenido):
 * #calendlyFallback — "Loading the calendar…" mientras monta el widget de Calendly
 * (src/pages/contact.astro:509, src/pages/schedule.astro:125).
 */
export const PLACEHOLDER_EXEMPT_SELECTORS = ['#calendlyFallback'];

/**
 * AXE — iframes de terceros excluidos del análisis.
 * axe-core desciende a iframes; el DOM interno del player de YouTube
 * (#movie_player, .ytmVideoInfoChannelAvatar) generaba aria-prohibited-attr +
 * button-name en cada página con video embebido (detectado en iteration-01).
 * Ese DOM no es editable desde src/, así que el scope de axe es first-party.
 */
export const AXE_EXCLUDE_SELECTORS = [
  'iframe[src*="youtube"]',
  'iframe[src*="calendly"]',
  'iframe[src*="google"]',
];
