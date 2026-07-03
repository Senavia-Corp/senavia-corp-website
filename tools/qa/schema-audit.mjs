#!/usr/bin/env node
// tools/qa/schema-audit.mjs <NN>
// Audita JSON-LD (<script type="application/ld+json">) en cada HTML de dist/,
// valida completitud por tipo y diffea sitemap-0.xml ↔ rutas dist.
// Salida: _qa/iteration-NN/schema-audit.json. Sin dependencias.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverRoutes, fileToRoute, sitemapRoutes, DIST_DIR } from './lib/routes.mjs';
import { readdirSync, statSync } from 'node:fs';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const NN = process.argv[2];
if (!NN) { console.error('Uso: node tools/qa/schema-audit.mjs <NN>'); process.exit(2); }
const ITER_DIR = join(REPO_ROOT, '_qa', `iteration-${NN}`);
mkdirSync(ITER_DIR, { recursive: true });

// ---------- helpers ----------
function walkHtml(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walkHtml(f, out);
    else if (e.endsWith('.html')) out.push(f);
  }
  return out;
}

function extractLdJson(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks;
}

/** Aplana entidades: acepta objeto, array y @graph. */
function flattenEntities(node, out = []) {
  if (Array.isArray(node)) { node.forEach((n) => flattenEntities(n, out)); return out; }
  if (node && typeof node === 'object') {
    if (node['@type']) out.push(node);
    if (node['@graph']) flattenEntities(node['@graph'], out);
  }
  return out;
}

const has = (e, k) => {
  const v = e[k];
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

/** Reglas de completitud por tipo. Devuelve lista de campos faltantes. */
function validateEntity(e) {
  const types = Array.isArray(e['@type']) ? e['@type'] : [e['@type']];
  const missing = [];
  if (types.includes('BlogPosting')) {
    for (const k of ['headline', 'datePublished', 'author', 'image']) if (!has(e, k)) missing.push(k);
  }
  if (types.includes('Service')) {
    for (const k of ['name', 'description', 'provider']) if (!has(e, k)) missing.push(k);
  }
  if (types.includes('LocalBusiness') || types.includes('ProfessionalService')) {
    for (const k of ['name', 'address', 'telephone', 'geo']) if (!has(e, k)) missing.push(k);
  }
  if (types.includes('FAQPage')) {
    const me = e.mainEntity;
    const list = Array.isArray(me) ? me : me ? [me] : [];
    const okQ = list.filter((q) => {
      const t = Array.isArray(q['@type']) ? q['@type'] : [q['@type']];
      return t.includes('Question') && q.acceptedAnswer;
    });
    if (okQ.length < 1) missing.push('mainEntity(>=1 Question con acceptedAnswer)');
  }
  return missing;
}

// ---------- audit por página ----------
const htmlFiles = walkHtml(DIST_DIR).sort();
const pages = [];
const typeCounts = {};
let parseFailures = 0;
let incompleteCount = 0;

for (const file of htmlFiles) {
  const route = fileToRoute(file);
  const html = readFileSync(file, 'utf8');
  const blocks = extractLdJson(html);
  const page = { route, blocks: blocks.length, types: [], parseErrors: [], issues: [] };

  const entities = [];
  for (const [i, raw] of blocks.entries()) {
    try {
      const parsed = JSON.parse(raw);
      flattenEntities(parsed, entities);
    } catch (e) {
      page.parseErrors.push(`bloque ${i}: ${String(e.message).slice(0, 100)}`);
      parseFailures++;
    }
  }
  for (const e of entities) {
    const types = Array.isArray(e['@type']) ? e['@type'] : [e['@type']];
    for (const t of types) {
      page.types.push(t);
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
    const missing = validateEntity(e);
    if (missing.length) {
      page.issues.push({ type: types.join('+'), missing });
      incompleteCount++;
    }
  }

  // BreadcrumbList requerido en rutas de >= 2 niveles (p.ej. /blog/x, /services/web-design/y)
  const depth = route.split('/').filter(Boolean).length;
  if (depth >= 2 && !page.types.includes('BreadcrumbList')) {
    page.issues.push({ type: 'BreadcrumbList', missing: ['(ausente en ruta de >=2 niveles)'] });
  }
  pages.push(page);
}

// blog posts sin BlogPosting
const blogPostsSinBlogPosting = pages
  .filter((p) => p.route.startsWith('/blog/') && p.route !== '/blog' && !p.types.includes('BlogPosting'))
  .map((p) => p.route);

// rutas >=2 niveles sin BreadcrumbList
const sinBreadcrumb = pages
  .filter((p) => p.issues.some((i) => i.type === 'BreadcrumbList'))
  .map((p) => p.route);

// ---------- diff sitemap ----------
const WHITELIST_EXCLUSIONS = new Set(['/terms', '/privacy', '/404', '/brand-foundation', '/_source']);
const distRoutes = discoverRoutes();
const smRoutes = sitemapRoutes();
const rset = new Set(distRoutes);
const sset = new Set(smRoutes);
const enDistNoSitemap = distRoutes.filter((r) => !sset.has(r) && !WHITELIST_EXCLUSIONS.has(r));
const enSitemapNoDist = smRoutes.filter((r) => !rset.has(r) && !WHITELIST_EXCLUSIONS.has(r));

const payload = {
  iteration: NN,
  generatedAt: new Date().toISOString(),
  totalPages: pages.length,
  resumenPorTipo: typeCounts,
  parseFailures,
  entidadesIncompletas: incompleteCount,
  blogPostsSinBlogPosting,
  rutasSinBreadcrumb: sinBreadcrumb,
  sitemapDiff: {
    whitelist: [...WHITELIST_EXCLUSIONS],
    enDistNoSitemap,
    enSitemapNoDist,
  },
  pages: pages.filter((p) => p.parseErrors.length || p.issues.length || p.blocks === 0),
};

writeFileSync(join(ITER_DIR, 'schema-audit.json'), JSON.stringify(payload, null, 2));
console.log(`[schema] ${pages.length} páginas → _qa/iteration-${NN}/schema-audit.json`);
console.log(JSON.stringify({
  resumenPorTipo: typeCounts,
  parseFailures,
  entidadesIncompletas: incompleteCount,
  blogPostsSinBlogPosting: blogPostsSinBlogPosting.length,
  rutasSinBreadcrumb: sinBreadcrumb.length,
  sitemapDiff: payload.sitemapDiff,
}, null, 2));
