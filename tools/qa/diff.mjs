#!/usr/bin/env node
// tools/qa/diff.mjs <NN> <MM>
// Compara _qa/iteration-NN/results.json (nuevo) contra iteration-MM (base).
// Regresión = métrica de summary que empeora, o celda (ruta,viewport,lang)
// con un check que pasa de limpio a sucio. Compara like-for-like vía checksRun.
// Exit 1 si hay regresiones; exit 0 si no (las mejoras están OK).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const [NN, MM] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!NN || !MM) {
  console.error('Uso: node tools/qa/diff.mjs <NN nuevo> <MM base>');
  process.exit(2);
}

function load(it) {
  const p = join(REPO_ROOT, '_qa', `iteration-${it}`, 'results.json');
  return JSON.parse(readFileSync(p, 'utf8'));
}
const nueva = load(NN);
const base = load(MM);

// checks presentes en ambas corridas
const checksComunes = new Set((nueva.checksRun || []).filter((c) => (base.checksRun || []).includes(c)));

// Mapa check -> métricas de summary y extractor de "suciedad" por celda
const CHECK_DEFS = {
  overflow: {
    metrics: ['overflowCount'],
    dirty: (r) => (r.overflow === true ? 1 : 0),
  },
  console: { metrics: ['consoleErrors'], dirty: (r) => (r.consoleErrors || []).length },
  req4xx: { metrics: ['req4xx5xx'], dirty: (r) => (r.requests4xx5xx || []).length },
  axe: {
    metrics: ['axeSerious', 'axeCritical'],
    dirty: (r) => (r.axe ? r.axe.serious + r.axe.critical : 0),
  },
  touch: { metrics: ['touchTargetViolations'], dirty: (r) => (r.touchTargetViolations || []).length },
  placeholders: { metrics: ['placeholderHits'], dirty: (r) => (r.placeholderHits || []).length },
  h1: { metrics: ['h1NotExactlyOne'], dirty: (r) => (r.h1Count !== undefined && r.h1Count !== 1 ? 1 : 0) },
  hrefHash: { metrics: ['hrefHashOutsideAllowlist'], dirty: (r) => (r.hrefHashOutsideAllowlist || []).length },
};

const regresiones = [];

// 1) summary like-for-like
for (const [check, def] of Object.entries(CHECK_DEFS)) {
  if (!checksComunes.has(check)) continue;
  for (const m of def.metrics) {
    const b = base.summary?.[m];
    const n = nueva.summary?.[m];
    if (typeof b === 'number' && typeof n === 'number' && n > b) {
      regresiones.push(`summary.${m}: ${b} → ${n} (peor)`);
    }
  }
}
// navErrors siempre comparable
if ((nueva.summary?.navErrors ?? 0) > (base.summary?.navErrors ?? 0)) {
  regresiones.push(`summary.navErrors: ${base.summary?.navErrors ?? 0} → ${nueva.summary?.navErrors ?? 0} (peor)`);
}

// 2) celdas limpio → sucio
const key = (r) => `${r.ruta}|${r.viewport}|${r.lang}`;
const baseMap = new Map((base.results || []).map((r) => [key(r), r]));
for (const rNew of nueva.results || []) {
  const rBase = baseMap.get(key(rNew));
  if (!rBase) continue; // celda nueva: no comparable
  if (rBase.error || rNew.error) {
    if (!rBase.error && rNew.error) regresiones.push(`${key(rNew)}: navegación OK → ${rNew.error}`);
    continue;
  }
  for (const [check, def] of Object.entries(CHECK_DEFS)) {
    if (!checksComunes.has(check)) continue;
    // axe solo corre en ciertos viewports: compara solo si ambos lo midieron
    if (check === 'axe' && (!rBase.axe || !rNew.axe)) continue;
    if (check === 'touch' && (rBase.touchTargetViolations === undefined || rNew.touchTargetViolations === undefined)) continue;
    const b = def.dirty(rBase);
    const n = def.dirty(rNew);
    if (b === 0 && n > 0) {
      regresiones.push(`${key(rNew)}: check '${check}' limpio → sucio (${n})`);
    }
  }
}

if (regresiones.length) {
  console.log(`REGRESIONES (${NN} vs ${MM}): ${regresiones.length}`);
  for (const r of regresiones) console.log(`  - ${r}`);
  process.exit(1);
}
console.log(`Sin regresiones (${NN} vs ${MM}). Checks comparados: ${[...checksComunes].join(', ')}`);
process.exit(0);
