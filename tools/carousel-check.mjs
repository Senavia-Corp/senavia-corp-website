#!/usr/bin/env node
/**
 * carousel-check — gate for the arrow carousels (.carousel / home.js).
 *
 * Guards the four things that were actually broken, measured 2026-08-05:
 *   - touch dragging moved the track 1.6-2.1x the finger travel (native pan +
 *     JS pointer-drag both writing scrollLeft)
 *   - the last arrow click travelled 16px at desktop — a button that looks dead
 *   - dots claimed role=tab with no tabpanel, labelled in English on a bilingual site
 *   - nothing honoured prefers-reduced-motion
 *
 * Usage: node tools/carousel-check.mjs [baseUrl]
 * Serves ./dist itself unless a baseUrl is passed.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROUTES = ['/', '/services/web-design'];
const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, touch: true },
  { name: '1280x800', width: 1280, height: 800, touch: false },
];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

const fails = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// the Vercel adapter emits static output under dist/client, not dist
const DIST = 'dist/client';

async function serveDist(port = 4399) {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (!extname(p)) p += '/index.html';
    try {
      const body = await readFile(join(DIST, p));
      res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  await new Promise((r) => server.listen(port, r));
  return { url: `http://localhost:${port}`, close: () => server.close() };
}

/** Real compositor touch — synthetic TouchEvents don't trigger native pan,
 *  so a JS-dispatched swipe would pass even with the double-scroll bug.
 *  CDP coordinates are viewport-relative, so the carousel must be on screen
 *  first: measured off-screen, every swipe silently moves 0px and passes. */
async function swipe(page, dx, vpWidth, steps = 10) {
  const track = page.locator('.carousel-track').first();
  await track.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const box = await track.boundingBox();
  const y = box.y + box.height / 2;
  const x0 = Math.min(box.x + box.width - 40, vpWidth - 40);

  const cdp = await page.context().newCDPSession(page);
  const pt = (x) => [{ x, y, radiusX: 10, radiusY: 10, force: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x0) });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent',
      { type: 'touchMove', touchPoints: pt(x0 + (dx * i) / steps) });
    await page.waitForTimeout(16);
  }
  // read while the finger is still down: no inertia in flight, so this is
  // pure 1:1 tracking — exactly what the double-scroll bug broke
  const moved = await page.evaluate(() => document.querySelector('.carousel-track').scrollLeft);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  return moved;
}

/** scroll-behavior:smooth means assigning scrollLeft animates — a plain
 *  assignment plus a short wait reads a mid-flight value. */
async function resetScroll(page) {
  await page.evaluate(() => {
    const t = document.querySelector('.carousel-track');
    const prev = t.style.scrollBehavior;
    t.style.scrollBehavior = 'auto';
    t.scrollLeft = 0;
    t.style.scrollBehavior = prev;
  });
  await page.waitForFunction(() => document.querySelector('.carousel-track').scrollLeft === 0,
    null, { timeout: 3000 });
  await page.waitForTimeout(150); // let the scroll handler repaint the dots
}

const geom = (page) => page.evaluate(() => {
  const t = document.querySelector('.carousel-track');
  const cs = getComputedStyle(t);
  const card = t.firstElementChild.getBoundingClientRect().width;
  return {
    step: card + parseFloat(cs.columnGap || cs.gap || 0),
    scrollLeft: t.scrollLeft,
    max: t.scrollWidth - t.clientWidth,
  };
});

const run = async () => {
  let server = null;
  if (!process.argv[2]) {
    try { await readFile(join(DIST, 'index.html')); }
    catch { console.error(`carousel-check: falta ${DIST}/ — corre \`npm run build\`, o pásame una URL.`); process.exit(1); }
    server = await serveDist();
  }
  const base = process.argv[2] || server.url;
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      const where = `${vp.name} ${route}`;
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        hasTouch: vp.touch, isMobile: vp.touch,
      });
      const page = await ctx.newPage();
      await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('.carousel-track', { timeout: 10000 });
      await page.waitForTimeout(300); // let home.js inject the dots

      const g0 = await geom(page);

      // 1. prev starts disabled, and every arrow click travels a real distance
      const prev = page.locator('.carousel .carousel-arrow.prev').first();
      const next = page.locator('.carousel .carousel-arrow.next').first();
      if (!(await prev.isDisabled())) fail(where, 'prev no nace disabled en scrollLeft 0');

      const deltas = [];
      for (let i = 0; i < 8 && !(await next.isDisabled()); i++) {
        const before = (await geom(page)).scrollLeft;
        await next.click();
        await page.waitForTimeout(650);
        deltas.push((await geom(page)).scrollLeft - before);
      }
      if (!(await next.isDisabled())) fail(where, 'next sigue habilitado al llegar al final');

      // 2. every step is one card, except the last which may absorb the remainder
      deltas.slice(0, -1).forEach((d, i) => {
        if (!near(d, g0.step, 2)) fail(where, `paso ${i} movió ${d}px, esperado ${g0.step.toFixed(0)}px`);
      });
      // 3. no dead click — the regression that shipped 16px final steps
      const last = deltas[deltas.length - 1];
      if (last !== undefined && last < g0.step * 0.25)
        fail(where, `último clic movió solo ${last}px (<25% del paso ${g0.step.toFixed(0)}px) — botón muerto`);

      // 4. dots: count matches pages, first one is current, labelled in page language
      await resetScroll(page);
      const dots = await page.evaluate(() => {
        const root = document.querySelector('.carousel');
        const d = [...root.querySelectorAll('.carousel-dot')];
        return {
          n: d.length,
          activeIdx: d.findIndex((x) => x.getAttribute('aria-current') === 'true'),
          role: root.querySelector('.carousel-dots')?.getAttribute('role'),
          tabRoles: d.filter((x) => x.getAttribute('role') === 'tab').length,
          label: d[0]?.getAttribute('aria-label') || '',
          lang: document.documentElement.lang,
        };
      });
      const expectedPages = Math.max(1, Math.round(g0.max / g0.step) + 1);
      if (dots.n !== expectedPages) fail(where, `${dots.n} dots para ${expectedPages} páginas`);
      if (dots.activeIdx !== 0) fail(where, `dot activo en índice ${dots.activeIdx} con scrollLeft 0`);
      if (dots.tabRoles > 0) fail(where, `${dots.tabRoles} dots con role=tab sin ningún tabpanel`);
      const isES = dots.lang.toLowerCase().startsWith('es');
      if (isES && /Go to slide/.test(dots.label)) fail(where, `dot en inglés ("${dots.label}") con lang=${dots.lang}`);

      // labels must follow the client-side EN/ES switch, not freeze at load
      const afterSwitch = await page.evaluate(async () => {
        document.documentElement.setAttribute('lang', 'es');
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: 'es' } }));
        await new Promise((r) => setTimeout(r, 150));
        const l = document.querySelector('.carousel-dot')?.getAttribute('aria-label') || '';
        document.documentElement.setAttribute('lang', 'en');
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: 'en' } }));
        return l;
      });
      if (/Go to slide/.test(afterSwitch))
        fail(where, `tras cambiar a ES el dot sigue en inglés ("${afterSwitch}")`);

      // 5. touch tracks the finger 1:1 — the double-scroll guard
      if (vp.touch) {
        await resetScroll(page);
        const dx = 150;
        const moved = await swipe(page, -dx, vp.width);
        const ratio = moved / dx;
        // ~0.90 is healthy: Chromium eats ~15px of touch slop before panning.
        // The bug this guards shipped 1.6-2.1; a broken probe reads 0.
        if (ratio < 0.75 || ratio > 1.2)
          fail(where, `swipe de ${dx}px movió ${moved.toFixed(0)}px (ratio ${ratio.toFixed(2)}, esperado ~0.90)`);
      }
      await ctx.close();
    }
  }

  // 6. reduced motion: the jump is instant, no smooth animation left running
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.carousel-track', { timeout: 10000 });
  await page.waitForTimeout(300);
  const before = (await geom(page)).scrollLeft;
  await page.locator('.carousel .carousel-arrow.next').first().click();
  await page.waitForTimeout(60); // way under any smooth-scroll duration
  const after = (await geom(page)).scrollLeft;
  if (after - before < 1) fail('reduced-motion', 'el scroll sigue animado (no llegó en 60ms)');
  await ctx.close();

  await browser.close();
  server?.close();

  if (fails.length) {
    console.error(`\n✗ carousel-check: ${fails.length} fallo(s)\n`);
    fails.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('✓ carousel-check: flechas, dots, táctil y reduced-motion OK');
};

run().catch((e) => { console.error('carousel-check reventó:', e.message); process.exit(1); });
