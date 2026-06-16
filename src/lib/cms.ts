/* ============================================================
 * Internal CMS layer — reads the Webflow CSV export in
 * `cms-colletions/` as the local content source.
 *
 * This is the swap point for the future backend: replace the
 * `readCsv()` calls below with API/DB fetches and the content
 * collections (and every template that uses getCollection) keep
 * working unchanged.
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const CMS_DIR = path.join(process.cwd(), 'cms-colletions');

/* ---------- RFC-4180 CSV parser (no deps) ---------- */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input; // strip BOM
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

export function parseCsvObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => {
      const o: Record<string, string> = {};
      header.forEach((h, idx) => { o[h.trim()] = r[idx] ?? ''; });
      return o;
    });
}

/* ---------- File lookup (filenames carry changing Webflow IDs) ---------- */
function findFile(substr: string): string {
  const files = fs.readdirSync(CMS_DIR).filter((f) => f.endsWith('.csv') && f.includes(substr));
  if (files.length === 0) throw new Error(`[cms] No CSV matching "${substr}" in ${CMS_DIR}`);
  return path.join(CMS_DIR, files[0]);
}

/** Read a collection CSV → array of row objects, excluding drafts/archived. */
export function readCsv(substr: string): Record<string, string>[] {
  const text = fs.readFileSync(findFile(substr), 'utf-8');
  return parseCsvObjects(text).filter(
    (r) => (r['Draft'] || '').toLowerCase() !== 'true' && (r['Archived'] || '').toLowerCase() !== 'true',
  );
}

/* ---------- Field helpers ---------- */
export const bool = (v: string | undefined) => (v || '').toLowerCase() === 'true';
export const numOr = (v: string | undefined, d = 0) => {
  const n = Number((v || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : d;
};
export const youtubeId = (url: string | undefined): string => {
  if (!url) return '';
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/embed\/([^?&]+)/);
  return m ? m[1] : '';
};
/** "sebastian-navia" → "Sebastian Navia" */
export const prettyName = (slug: string | undefined): string =>
  (slug || '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
