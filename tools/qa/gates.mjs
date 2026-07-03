#!/usr/bin/env node
// tools/qa/gates.mjs <NN>
// Emite _qa/iteration-NN/gates.json con gates {gate, valor_medido, umbral, pass, comando, salida_literal}.
// Lee _qa/iteration-NN/results.json + corre comandos de repo (check/grep/git/audit).
// NO mide Lighthouse (otra lente).

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const NN = process.argv[2];
if (!NN) { console.error('Uso: node tools/qa/gates.mjs <NN>'); process.exit(2); }

const ITER_DIR = join(REPO_ROOT, '_qa', `iteration-${NN}`);
const results = JSON.parse(readFileSync(join(ITER_DIR, 'results.json'), 'utf8'));
const gates = [];

const trunc = (s, n = 700) => (s ?? '').toString().trim().slice(0, n);

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', timeout: opts.timeout ?? 180000, stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: `${e.stdout || ''}${e.stderr || ''}` || String(e.message), code: e.status };
  }
}

// ---- gates desde results.json ----
const s = results.summary || {};
const fromResults = [
  ['overflow', s.overflowCount, 'overflowCount = 0'],
  ['axe-serious', s.axeSerious, 'axe serious = 0'],
  ['axe-critical', s.axeCritical, 'axe critical = 0'],
  ['req4xx5xx-same-origin', s.req4xx5xx, 'requests >=400 same-origin = 0'],
  ['console-errors', s.consoleErrors, 'errores de consola (fuera de allowlist) = 0'],
  ['href-hash-fuera-allowlist', s.hrefHashOutsideAllowlist, 'a[href="#"] fuera de allowlist = 0'],
  ['touch-targets', s.touchTargetViolations, 'touch targets <44x44 en 360/390 = 0'],
  ['placeholders', s.placeholderHits, 'placeholders en texto renderizado = 0'],
];
for (const [gate, val, umbral] of fromResults) {
  gates.push({
    gate, valor_medido: val ?? null, umbral, pass: val === 0,
    comando: `node tools/qa/audit.mjs ${NN} (summary.${gate})`,
    salida_literal: `summary => ${JSON.stringify({ [gate]: val })}`,
  });
}

// h1 exacto por RUTA (no por celda): 101/101
{
  const perRoute = new Map();
  for (const r of results.results || []) {
    if (r.error) continue;
    if (!perRoute.has(r.ruta)) perRoute.set(r.ruta, new Set());
    perRoute.get(r.ruta).add(r.h1Count);
  }
  const total = (results.routes || []).length;
  const okRoutes = [...perRoute.entries()].filter(([, set]) => set.size === 1 && set.has(1)).map(([r]) => r);
  const badRoutes = [...perRoute.keys()].filter((r) => !okRoutes.includes(r));
  gates.push({
    gate: 'h1-exactamente-uno',
    valor_medido: `${okRoutes.length}/${total}`,
    umbral: `${total}/${total} rutas con exactamente 1 <h1>`,
    pass: okRoutes.length === total && perRoute.size === total,
    comando: `node tools/qa/audit.mjs ${NN} (h1Count por ruta)`,
    salida_literal: badRoutes.length ? `rutas con h1 != 1: ${badRoutes.slice(0, 15).join(', ')}` : 'todas las rutas con h1Count=1',
  });
}

// ---- npm run check (ratchet vs baseline) ----
{
  const baselineFile = join(REPO_ROOT, '_qa', 'STATE', 'check-baseline.txt');
  let baseline = null;
  if (existsSync(baselineFile)) {
    const m = readFileSync(baselineFile, 'utf8').match(/-\s*(\d+)\s+errors/);
    if (m) baseline = Number(m[1]);
  }
  const r = run('npm run check', { timeout: 300000 });
  const m = r.out.match(/-\s*(\d+)\s+errors/);
  const errors = m ? Number(m[1]) : null;
  gates.push({
    gate: 'astro-check-ratchet',
    valor_medido: errors,
    umbral: `errores <= baseline (${baseline ?? 'baseline no encontrado'})`,
    pass: errors !== null && baseline !== null && errors <= baseline,
    comando: 'npm run check',
    salida_literal: trunc(r.out.split('\n').filter((l) => /errors|warnings|hints|Result/.test(l)).join('\n') || r.out),
  });
}

// ---- grep new.senaviacorp ----
{
  const cmd = `grep -rl 'new\\.senaviacorp' src/ public/ astro.config.mjs || true`;
  const r = run(cmd);
  const hits = r.out.split('\n').map((l) => l.trim()).filter(Boolean);
  const allowed = new Set(['src/data/site.ts', 'public/robots.txt', 'astro.config.mjs']);
  const offenders = hits.filter((h) => !allowed.has(h));
  gates.push({
    gate: 'dominio-new.senaviacorp-solo-en-config',
    valor_medido: hits,
    umbral: 'hits ⊆ {src/data/site.ts, public/robots.txt, astro.config.mjs}',
    pass: offenders.length === 0,
    comando: cmd,
    salida_literal: trunc(r.out) + (offenders.length ? `\nFUERA DE ALLOWLIST: ${offenders.join(', ')}` : ''),
  });
}

// ---- vercel.json intacto vs main ----
{
  const cmd = 'git show main:vercel.json | diff - vercel.json';
  const r = run(cmd);
  gates.push({
    gate: 'vercel.json-sin-cambios-vs-main',
    valor_medido: r.ok ? 'idéntico' : 'difiere o error',
    umbral: 'diff vacío contra git show main:vercel.json',
    pass: r.ok && r.out.trim() === '',
    comando: cmd,
    salida_literal: trunc(r.out || '(sin diferencias)'),
  });
}

// ---- npm audit ----
{
  const r = run('npm audit --json', { timeout: 120000 });
  let high = null, critical = null;
  try {
    const j = JSON.parse(r.out);
    const v = j.metadata?.vulnerabilities || {};
    high = v.high ?? 0; critical = v.critical ?? 0;
  } catch {}
  gates.push({
    gate: 'npm-audit-high-critical',
    valor_medido: { high, critical },
    umbral: '0 high y 0 critical',
    pass: high === 0 && critical === 0,
    comando: 'npm audit --json',
    salida_literal: trunc(JSON.stringify({ high, critical })),
  });
}

// ---- llms.txt ----
{
  const cmd = 'test -f public/llms.txt && echo EXISTS || echo MISSING';
  const r = run(cmd);
  const exists = r.out.includes('EXISTS');
  gates.push({
    gate: 'llms.txt-presente',
    valor_medido: exists ? 'existe' : 'falta',
    umbral: 'public/llms.txt existe',
    pass: exists,
    comando: 'test -f public/llms.txt',
    salida_literal: trunc(r.out),
  });
}

const passed = gates.filter((g) => g.pass).length;
const payload = { iteration: NN, generatedAt: new Date().toISOString(), passed, total: gates.length, gates };
writeFileSync(join(ITER_DIR, 'gates.json'), JSON.stringify(payload, null, 2));
console.log(`[gates] ${passed}/${gates.length} gates PASS → _qa/iteration-${NN}/gates.json`);
for (const g of gates) console.log(`  ${g.pass ? 'PASS' : 'FAIL'}  ${g.gate}  (${JSON.stringify(g.valor_medido)})`);
process.exit(0);
