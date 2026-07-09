// Build per-page social/OG images for every subservice from its hero AVIF.
// og:image should be a crawler-friendly format (WebP — same as the site's
// og-default.webp) at the declared 1200x630 (1.91:1) so previews render on
// Google, Facebook, LinkedIn, X, WhatsApp, and AI chats. AVIF heroes don't
// preview reliably on social crawlers, hence this derived WebP.
// Run: cd ~/Sites/senavia-corp && node tools/gen-og-images.mjs [--force]
import { readdir } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('public/images/subservices');
const FIT = process.env.OG_FIT || 'cover';        // cover (crop to 1.91:1) | contain
const force = process.argv.includes('--force');
const NAVY = { r: 10, g: 14, b: 38 };             // #0A0E26 (site bg) for contain letterbox

const exists = (p) => access(p, constants.F_OK).then(() => true).catch(() => false);

const files = (await readdir(DIR)).filter((f) => f.endsWith('-hero.avif'));
const slugs = files.map((f) => f.replace(/-hero\.avif$/, ''));
console.assert(slugs.length === 18, `Expected 18 hero images, found ${slugs.length}`);

let done = 0, skipped = 0, failed = 0;
for (const slug of slugs) {
  const src = path.join(DIR, `${slug}-hero.avif`);
  const out = path.join(DIR, `${slug}-og.webp`);
  if (!force && await exists(out)) { skipped++; continue; }
  try {
    const pipe = sharp(src).resize(1200, 630, FIT === 'contain'
      ? { fit: 'contain', background: NAVY }
      : { fit: 'cover', position: 'centre' });
    const info = await pipe.webp({ quality: 82 }).toFile(out);
    console.log(`✅ ${slug}-og.webp  ${(info.size / 1024).toFixed(0)}KB`);
    done++;
  } catch (e) { console.log(`❌ ${slug}: ${e.message}`); failed++; }
}
console.log(`\nOG images: ${done} written, ${skipped} existed, ${failed} failed (fit=${FIT}).`);
process.exit(failed ? 1 : 0);
