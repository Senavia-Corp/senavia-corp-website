// Generate the 24 subservice images (12 hero + 12 intro) via Google AI Studio.
// Uso:
//   node --env-file=.env.local tools/gen-subservice-images.mjs            (todas las faltantes)
//   node --env-file=.env.local tools/gen-subservice-images.mjs --only crm-development --kind hero
//   node --env-file=.env.local tools/gen-subservice-images.mjs --force    (regenera todo)
// Requiere en .env.local:  GEMINI_API_KEY=<token de Google AI Studio>
import { writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { PROMPTS } from './subservice-image-prompts.mjs';

const KEY = process.env.GEMINI_API_KEY;
// "Nano Banana" = gemini-2.5-flash-image (mismo modelo que hizo las imágenes de Web Design).
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const OUT = path.resolve('public/images/subservices');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const onlySlug = val('--only'), onlyKind = val('--kind'), force = flag('--force'), keepPng = flag('--keep-png');

// --- self-check antes de gastar cuota ---
const slugs = Object.keys(PROMPTS);
const entries = slugs.flatMap((slug) => ['hero', 'intro'].map((kind) => ({ slug, kind, prompt: PROMPTS[slug]?.[kind] })));
console.assert(slugs.length === 12, `Esperados 12 slugs, hay ${slugs.length}`);
console.assert(entries.length === 24 && entries.every((e) => typeof e.prompt === 'string' && e.prompt.length > 400), 'Faltan prompts o son muy cortos');
if (!KEY) { console.error('❌ Falta GEMINI_API_KEY (Google AI Studio) en .env.local'); process.exit(1); }

const exists = (p) => access(p, constants.F_OK).then(() => true).catch(() => false);

async function genOne(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const json = await res.json();
      const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (part) return Buffer.from(part.inlineData.data, 'base64');
      throw new Error('Respuesta sin imagen: ' + JSON.stringify(json).slice(0, 300));
    }
    const txt = await res.text();
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 4000 * attempt)); continue; }
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  throw new Error('Agotados los reintentos');
}

let done = 0, skipped = 0, failed = 0;
const fails = [];
for (const { slug, kind, prompt } of entries) {
  if (onlySlug && slug !== onlySlug) continue;
  if (onlyKind && kind !== onlyKind) continue;
  const avifPath = path.join(OUT, `${slug}-${kind}.avif`);
  if (!force && await exists(avifPath)) { skipped++; continue; }
  try {
    process.stdout.write(`🎨 ${slug}-${kind} … `);
    const png = await genOne(prompt);
    if (keepPng) await writeFile(path.join(OUT, `${slug}-${kind}.png`), png);
    await sharp(png).resize(1200, 1200, { fit: 'cover' }).avif({ quality: 62, effort: 4 }).toFile(avifPath);
    console.log('✅');
    done++;
    await new Promise((r) => setTimeout(r, 1500)); // respeta rate limit
  } catch (e) { console.log('❌', e.message); failed++; fails.push(`${slug}-${kind}: ${e.message}`); }
}
console.log(`\nHecho: ${done} generadas, ${skipped} ya existían, ${failed} fallaron.`);
if (fails.length) console.log('Fallos:\n' + fails.join('\n'));
process.exit(failed ? 1 : 0);
