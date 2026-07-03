// tools/qa/lib/routes.mjs
// Descubre rutas enumerando dist/**/*.html y las cruza contra sitemap-0.xml.
// ESM, Node 24, sin dependencias.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
export const DIST_DIR = join(REPO_ROOT, 'dist');

/** Prefijos de colecciones dinámicas (rutas generadas por getStaticPaths). */
export const COLLECTION_PREFIXES = [
  '/blog/',
  '/portfolio/',
  '/service-areas/',
  '/services/web-design/',
];

function walkHtml(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

/** dist/about/index.html -> /about ; dist/index.html -> / ; dist/404.html -> /404 */
export function fileToRoute(file, distDir = DIST_DIR) {
  let rel = '/' + relative(distDir, file).split('\\').join('/');
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'/index.html'.length) || '/';
  else if (rel.endsWith('.html')) rel = rel.slice(0, -'.html'.length);
  return rel === '' ? '/' : rel;
}

/** Todas las rutas de dist, ordenadas. */
export function discoverRoutes(distDir = DIST_DIR) {
  return walkHtml(distDir).map((f) => fileToRoute(f, distDir)).sort();
}

/** Rutas del sitemap-0.xml normalizadas (sin origin, sin trailing slash salvo /). */
export function sitemapRoutes(distDir = DIST_DIR) {
  const file = join(distDir, 'sitemap-0.xml');
  if (!existsSync(file)) return [];
  const xml = readFileSync(file, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locs.map((u) => {
    let p;
    try { p = new URL(u).pathname; } catch { p = u; }
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }).sort();
}

/**
 * Cross-check dist vs sitemap. Reporta diferencias, no falla.
 * @returns {{routes: string[], sitemap: string[], inDistNotSitemap: string[], inSitemapNotDist: string[]}}
 */
export function crossCheck(distDir = DIST_DIR) {
  const routes = discoverRoutes(distDir);
  const sitemap = sitemapRoutes(distDir);
  const rset = new Set(routes);
  const sset = new Set(sitemap);
  return {
    routes,
    sitemap,
    inDistNotSitemap: routes.filter((r) => !sset.has(r)),
    inSitemapNotDist: sitemap.filter((r) => !rset.has(r)),
  };
}

/** ¿A qué colección pertenece la ruta? (null = estática/plantilla única) */
export function collectionOf(route) {
  // El prefijo más largo gana (/services/web-design/ antes que un hipotético /services/).
  const sorted = [...COLLECTION_PREFIXES].sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    if (route.startsWith(p) && route.length > p.length) return p;
  }
  return null;
}

/**
 * Muestra "por plantilla": todas las rutas estáticas + las 2 primeras
 * (orden alfabético) de cada colección dinámica.
 */
export function templateRoutes(distDir = DIST_DIR) {
  const routes = discoverRoutes(distDir);
  const byCollection = new Map();
  const statics = [];
  for (const r of routes) {
    const c = collectionOf(r);
    if (c === null) statics.push(r);
    else {
      if (!byCollection.has(c)) byCollection.set(c, []);
      byCollection.get(c).push(r);
    }
  }
  const sample = [...statics];
  for (const list of byCollection.values()) sample.push(...list.slice(0, 2));
  return sample.sort();
}

// CLI: node tools/qa/lib/routes.mjs
if (process.argv[1] && fileURLToPath(new URL(import.meta.url)) === process.argv[1]) {
  const cc = crossCheck();
  console.log(JSON.stringify({
    total: cc.routes.length,
    templateSample: templateRoutes(),
    inDistNotSitemap: cc.inDistNotSitemap,
    inSitemapNotDist: cc.inSitemapNotDist,
  }, null, 2));
}
