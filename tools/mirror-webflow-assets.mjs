/* ============================================================
 * mirror-webflow-assets.mjs — WL-008
 *
 * Mirrors every asset still hotlinked from the legacy Webflow
 * CDN (cdn.prod.website-files.com) into public/images/webflow/
 * so the site stops depending on a third-party origin.
 *
 * Local name = original basename with the 24-hex Webflow asset
 * id prefix stripped (must stay in sync with toLocalWebflowAsset
 * in src/lib/cms.ts). Name collisions keep an 8-char id prefix.
 *
 * Usage:
 *   node tools/mirror-webflow-assets.mjs           # scan dist/ + download
 *   node tools/mirror-webflow-assets.mjs --check   # fail if dist/ still references the CDN
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'webflow');
const CDN_RE = /https:\/\/cdn\.prod\.website-files\.com\/[^\s"'<>()\\]+/g;
const MAX_BYTES = 300 * 1024;
const MAX_WIDTH = 1600;

function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

function collectUrls() {
  if (!fs.existsSync(DIST)) {
    console.error('[mirror] dist/ not found — run a build first.');
    process.exit(1);
  }
  const urls = new Set();
  for (const f of walk(DIST, ['.html', '.xml', '.txt', '.json'])) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.match(CDN_RE) || []) urls.add(m);
  }
  return [...urls].sort();
}

const stripId = (name) =>
  decodeURIComponent(name).replace(/^[0-9a-f]{20,}_/, '').replace(/[^A-Za-z0-9._-]/g, '-');

function localNames(urls) {
  const byName = new Map();
  for (const url of urls) {
    const raw = url.split('/').pop();
    let name = stripId(raw);
    if (byName.has(name) && byName.get(name) !== url) {
      const id = (raw.match(/^([0-9a-f]{20,})_/) || [])[1] || 'x';
      name = `${id.slice(-8)}-${name}`;
    }
    byName.set(name, url);
  }
  return byName;
}

async function recompress(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) return;
  const tmp = file + '.tmp';
  const img = sharp(file).resize({ width: MAX_WIDTH, withoutEnlargement: true });
  if (ext === '.png') await img.png({ compressionLevel: 9 }).toFile(tmp);
  else if (ext === '.webp') await img.webp({ quality: 78 }).toFile(tmp);
  else if (ext === '.avif') await img.avif({ quality: 55 }).toFile(tmp);
  else await img.jpeg({ quality: 78, mozjpeg: true }).toFile(tmp);
  if (fs.statSync(tmp).size < fs.statSync(file).size) fs.renameSync(tmp, file);
  else fs.rmSync(tmp);
}

async function main() {
  const check = process.argv.includes('--check');
  const urls = collectUrls();

  if (check) {
    if (urls.length > 0) {
      console.error(`[mirror --check] FAIL: ${urls.length} website-files.com URLs still in dist/`);
      for (const u of urls.slice(0, 10)) console.error('  ' + u);
      process.exit(1);
    }
    console.log('[mirror --check] OK: no website-files.com references in dist/');
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const names = localNames(urls);
  let ok = 0, skipped = 0, failed = 0, bytes = 0;

  for (const [name, url] of names) {
    const dest = path.join(OUT_DIR, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { skipped++; continue; }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      if (fs.statSync(dest).size > MAX_BYTES) await recompress(dest);
      bytes += fs.statSync(dest).size;
      ok++;
      console.log(`  ok  ${name} (${fs.statSync(dest).size} B)`);
    } catch (e) {
      failed++;
      if (fs.existsSync(dest)) fs.rmSync(dest);
      console.error(`  FAIL ${url}: ${e.message}`);
    }
  }
  console.log(`[mirror] ${ok} downloaded (${(bytes / 1024 / 1024).toFixed(2)} MB), ${skipped} already present, ${failed} failed of ${names.size} assets`);
  if (failed > 0) process.exit(1);
}

main();
