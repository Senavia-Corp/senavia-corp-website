#!/usr/bin/env node
// tools/qa/audit.mjs <NN> [--routes=/a,/b] [--quick] [--shots=all|templates|none] [--port 4173]
// Auditor Playwright del dist/ servido por serve.mjs.
// Reusa playwright + @axe-core/playwright ya instalados. ESM, Node 24.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { discoverRoutes, templateRoutes, crossCheck } from './lib/routes.mjs';
import {
  consoleAllowed,
  HREF_HASH_ALLOW_SELECTOR,
  PLACEHOLDER_PATTERNS,
  PLACEHOLDER_EXEMPT_SELECTORS,
  AXE_EXCLUDE_SELECTORS,
} from './lib/allowlist.mjs';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const QA_DIR = join(REPO_ROOT, '_qa');
const SERVE_SCRIPT = fileURLToPath(new URL('./serve.mjs', import.meta.url));

// ---------- CLI ----------
const argv = process.argv.slice(2);
const NN = argv.find((a) => !a.startsWith('--'));
if (!NN) {
  console.error('Uso: node tools/qa/audit.mjs <NN> [--routes=/a,/b] [--quick] [--shots=all|templates|none] [--port 4173]');
  process.exit(2);
}
const quick = argv.includes('--quick');
let shotsPolicy = quick ? 'none' : 'templates';
let port = 4173;
let routesFilter = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--shots=')) shotsPolicy = a.split('=')[1];
  else if (a.startsWith('--routes=')) routesFilter = a.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean);
  else if (a.startsWith('--port=')) port = Number(a.split('=')[1]);
  else if (a === '--port') port = Number(argv[i + 1]);
}
if (quick) shotsPolicy = 'none';

const VIEWPORTS = [
  { w: 360, h: 740 },
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];
const LANGS = ['en', 'es'];
const AXE_VIEWPORTS = [390, 1280];
const TOUCH_VIEWPORTS = [360, 390];
const WORKERS = 8;
const ORIGIN = `http://localhost:${port}`;

const ITER_DIR = join(QA_DIR, `iteration-${NN}`);
const SHOTS_DIR = join(ITER_DIR, 'shots');
mkdirSync(SHOTS_DIR, { recursive: true });

// ---------- rutas ----------
const cc = crossCheck();
let routes = routesFilter ?? cc.routes;
const tRoutes = new Set(templateRoutes());
if (cc.inDistNotSitemap.length || cc.inSitemapNotDist.length) {
  console.log(`[routes] dist-vs-sitemap: soloDist=${JSON.stringify(cc.inDistNotSitemap)} soloSitemap=${JSON.stringify(cc.inSitemapNotDist)}`);
}

function slugOf(route) {
  return route === '/' ? 'index' : route.replace(/^\//, '').replace(/\//g, '-');
}

function wantsShot(route, vp) {
  if (shotsPolicy === 'none') return false;
  if (shotsPolicy === 'templates') return tRoutes.has(route) && vp === 390;
  // 'all': plantillas en los 6 viewports; resto solo 360/390
  return tRoutes.has(route) || vp === 360 || vp === 390;
}

// ---------- server ----------
async function portAlive() {
  try {
    const r = await fetch(`${ORIGIN}/`, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch { return false; }
}

let serverChild = null;
async function ensureServer() {
  if (await portAlive()) { console.log(`[server] reuso server existente en :${port}`); return; }
  serverChild = spawn(process.execPath, [SERVE_SCRIPT, '--port', String(port)], {
    cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverChild.stdout.on('data', () => {});
  serverChild.stderr.on('data', (d) => process.stderr.write(`[serve.err] ${d}`));
  const t0 = Date.now();
  while (Date.now() - t0 < 8000) {
    if (await portAlive()) { console.log(`[server] levantado serve.mjs en :${port}`); return; }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`serve.mjs no respondió en :${port}`);
}
function stopServer() {
  if (serverChild) { try { serverChild.kill('SIGTERM'); } catch {} serverChild = null; }
}

// ---------- checks in-page (se ejecuta en el browser) ----------
function pageChecks({ allowSelector, placeholderPatterns, exemptSelectors, doTouch }) {
  const out = {};
  out.scrollWidth = document.documentElement.scrollWidth;
  out.clientWidth = document.documentElement.clientWidth;
  out.overflow = out.scrollWidth > out.clientWidth;
  out.h1Count = document.querySelectorAll('h1').length;
  out.title = document.title;

  // placeholders sobre innerText (ocultando fallbacks intencionales)
  const hidden = [];
  for (const sel of exemptSelectors) {
    for (const el of document.querySelectorAll(sel)) {
      hidden.push([el, el.style.display]);
      el.style.display = 'none';
    }
  }
  const text = document.body ? document.body.innerText : '';
  for (const [el, prev] of hidden) el.style.display = prev || '';
  out.placeholderHits = [];
  for (const p of placeholderPatterns) {
    const re = new RegExp(p.source, p.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      out.placeholderHits.push({
        pattern: p.name,
        match: m[0],
        context: text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, ' '),
      });
      if (out.placeholderHits.length >= 20) break;
    }
    if (out.placeholderHits.length >= 20) break;
  }

  // href="#" fuera de allowlist
  out.hrefHashOutsideAllowlist = [];
  for (const a of document.querySelectorAll('a[href="#"]')) {
    if (!a.matches(allowSelector)) out.hrefHashOutsideAllowlist.push(a.outerHTML.slice(0, 120));
  }

  // touch targets (solo viewports móviles)
  out.touchTargetViolations = [];
  if (doTouch) {
    const isVisible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const inlineTextLink = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display !== 'inline') return false;
      const parent = el.parentElement;
      if (parent && ['P','LI','SPAN','TD','FIGCAPTION'].includes(parent.tagName)) return true;
      for (const n of el.parentNode ? el.parentNode.childNodes : []) {
        if (n.nodeType === 3 && n.textContent.trim().length > 0) return true;
      }
      return false;
    };
    const descr = (el) => {
      let s = el.tagName.toLowerCase();
      if (el.id) s += '#' + el.id;
      else if (el.classList.length) s += '.' + [...el.classList].slice(0, 3).join('.');
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return t ? s + ' "' + t + '"' : s;
    };
    for (const el of document.querySelectorAll('a,button,[role=button],input,select,textarea')) {
      if (!isVisible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width >= 44 && r.height >= 44) continue;
      if (inlineTextLink(el)) continue;
      out.touchTargetViolations.push({ selector: descr(el), width: Math.round(r.width), height: Math.round(r.height) });
      if (out.touchTargetViolations.length >= 40) break;
    }
  }
  return out;
}

// ---------- cola de celdas ----------
const cells = [];
for (const route of routes) {
  for (const vp of VIEWPORTS) {
    for (const lang of LANGS) cells.push({ route, vp, lang });
  }
}
let nextCell = 0;
const results = [];
let done = 0;

async function processCell(page, collector, cell) {
  const { route, vp, lang } = cell;
  const url = ORIGIN + route;
  await page.setViewportSize({ width: vp.w, height: vp.h });
  collector.console.length = 0;
  collector.req.length = 0;

  let navError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    navError = null;
    collector.console.length = 0;
    collector.req.length = 0;
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      break;
    } catch (e) {
      navError = /Timeout/i.test(String(e)) ? 'nav-timeout' : `nav-error: ${String(e).slice(0, 120)}`;
    }
  }
  const base = { ruta: route, viewport: vp.w, lang };
  if (navError) {
    return { ...base, error: navError };
  }
  await page.waitForTimeout(300);

  let checks;
  try {
    checks = await page.evaluate(pageChecks, {
      allowSelector: HREF_HASH_ALLOW_SELECTOR,
      placeholderPatterns: PLACEHOLDER_PATTERNS.map(({ name, source, flags }) => ({ name, source, flags })),
      exemptSelectors: PLACEHOLDER_EXEMPT_SELECTORS,
      doTouch: TOUCH_VIEWPORTS.includes(vp.w),
    });
  } catch (e) {
    return { ...base, error: `eval-error: ${String(e).slice(0, 120)}` };
  }

  const result = {
    ...base,
    overflow: checks.overflow,
    scrollWidth: checks.scrollWidth,
    consoleErrors: collector.console.slice(0, 20),
    requests4xx5xx: collector.req.slice(0, 20),
    h1Count: checks.h1Count,
    title: checks.title,
    placeholderHits: checks.placeholderHits,
    hrefHashOutsideAllowlist: checks.hrefHashOutsideAllowlist,
    touchTargetViolations: checks.touchTargetViolations,
    axe: null,
    shot: null,
  };

  if (!quick && AXE_VIEWPORTS.includes(vp.w)) {
    try {
      let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
      for (const sel of AXE_EXCLUDE_SELECTORS) builder = builder.exclude(sel);
      const axe = await builder.analyze();
      const bad = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      result.axe = {
        serious: bad.filter((v) => v.impact === 'serious').length,
        critical: bad.filter((v) => v.impact === 'critical').length,
        violations: bad.map((v) => ({
          id: v.id, impact: v.impact,
          nodes: v.nodes.slice(0, 10).map((n) => n.target.join(' ')),
        })),
      };
    } catch (e) {
      result.axe = { serious: 0, critical: 0, violations: [], error: String(e).slice(0, 120) };
    }
  }

  if (wantsShot(route, vp.w)) {
    const file = `${slugOf(route)}__${vp.w}__${lang}.png`;
    try {
      await page.screenshot({ path: join(SHOTS_DIR, file), fullPage: true });
      result.shot = `shots/${file}`;
    } catch { result.shot = null; }
  }
  return result;
}

function makeCollector(page) {
  const collector = { console: [], req: [] };
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const loc = msg.location() || {};
    if (consoleAllowed(msg.text(), loc.url || '')) return;
    collector.console.push({ text: msg.text().slice(0, 300), url: (loc.url || '').slice(0, 200) });
  });
  page.on('pageerror', (err) => {
    const text = String(err && err.message ? err.message : err);
    if (consoleAllowed(text)) return;
    collector.console.push({ text: `pageerror: ${text.slice(0, 300)}`, url: '' });
  });
  page.on('response', (resp) => {
    try {
      const u = resp.url();
      if (resp.status() >= 400 && u.startsWith(ORIGIN)) {
        collector.req.push({ url: u.slice(ORIGIN.length), status: resp.status() });
      }
    } catch {}
  });
  return collector;
}

async function worker(browser, id) {
  const pages = {};
  for (const lang of LANGS) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    if (lang === 'es') {
      await context.addInitScript(() => localStorage.setItem('senavia.lang', 'es'));
    }
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    pages[lang] = { context, page, collector: makeCollector(page) };
  }
  while (true) {
    const i = nextCell++;
    if (i >= cells.length) break;
    const cell = cells[i];
    const { page, collector } = pages[cell.lang];
    let res;
    try {
      res = await processCell(page, collector, cell);
    } catch (e) {
      res = { ruta: cell.route, viewport: cell.vp.w, lang: cell.lang, error: `worker-error: ${String(e).slice(0, 160)}` };
    }
    results.push(res);
    done++;
    if (done % 100 === 0) console.log(`[audit] ${done}/${cells.length} celdas`);
  }
  for (const lang of LANGS) await pages[lang].context.close();
}

// ---------- main ----------
const startedAt = new Date().toISOString();
const t0 = Date.now();
await ensureServer();
const browser = await chromium.launch({ headless: true });
try {
  await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(browser, i)));
} finally {
  await browser.close();
  stopServer();
}

results.sort((a, b) =>
  a.ruta.localeCompare(b.ruta) || a.viewport - b.viewport || a.lang.localeCompare(b.lang));

const routesWithBadH1 = new Set(
  results.filter((r) => !r.error && r.h1Count !== 1).map((r) => r.ruta));

const summary = {
  cells: results.length,
  overflowCount: results.filter((r) => r.overflow === true).length,
  axeSerious: results.reduce((n, r) => n + (r.axe ? r.axe.serious : 0), 0),
  axeCritical: results.reduce((n, r) => n + (r.axe ? r.axe.critical : 0), 0),
  req4xx5xx: results.reduce((n, r) => n + (r.requests4xx5xx ? r.requests4xx5xx.length : 0), 0),
  consoleErrors: results.reduce((n, r) => n + (r.consoleErrors ? r.consoleErrors.length : 0), 0),
  touchTargetViolations: results.reduce((n, r) => n + (r.touchTargetViolations ? r.touchTargetViolations.length : 0), 0),
  placeholderHits: results.reduce((n, r) => n + (r.placeholderHits ? r.placeholderHits.length : 0), 0),
  hrefHashOutsideAllowlist: results.reduce((n, r) => n + (r.hrefHashOutsideAllowlist ? r.hrefHashOutsideAllowlist.length : 0), 0),
  h1NotExactlyOne: routesWithBadH1.size, // rutas (no celdas) con h1Count != 1
  navErrors: results.filter((r) => r.error).length,
};

const payload = {
  iteration: NN,
  generatedFrom: 'dist',
  startedAt,
  durationSec: Math.round((Date.now() - t0) / 10) / 100,
  routes,
  sitemapCrossCheck: { inDistNotSitemap: cc.inDistNotSitemap, inSitemapNotDist: cc.inSitemapNotDist },
  checksRun: quick
    ? ['overflow', 'console', 'req4xx', 'touch', 'placeholders', 'h1', 'hrefHash']
    : ['overflow', 'console', 'req4xx', 'axe', 'touch', 'placeholders', 'h1', 'hrefHash'],
  axeViewports: quick ? [] : AXE_VIEWPORTS,
  shotsPolicy,
  results,
  summary,
};

writeFileSync(join(ITER_DIR, 'results.json'), JSON.stringify(payload, null, 1));
console.log(`\n[audit] iteración ${NN} completa en ${payload.durationSec}s → _qa/iteration-${NN}/results.json`);
console.log(JSON.stringify(summary, null, 2));
process.exit(0);
