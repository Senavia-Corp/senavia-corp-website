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

/* ---------- Legacy Webflow CDN → local mirror (WL-008) ---------- */
/* Assets are mirrored into public/images/webflow/ by
 * scripts/mirror-webflow-assets.mjs. Local name = basename minus the
 * 24-hex Webflow asset-id prefix (collisions keep an 8-char id prefix);
 * the naming here must stay in sync with that script. */
const WEBFLOW_CDN_RE = /https:\/\/cdn\.prod\.website-files\.com\/[^\s"'<>()\\,]+/g;
const WEBFLOW_LOCAL_DIR = path.join(process.cwd(), 'public', 'images', 'webflow');
const webflowLocalCache = new Map<string, string>();

/** cdn.prod.website-files.com URL → /images/webflow/<name>; falls back to the remote URL if the asset was never mirrored. */
export function toLocalWebflowAsset(url: string): string {
  const cached = webflowLocalCache.get(url);
  if (cached) return cached;
  const raw = url.split('/').pop() || '';
  const base = decodeURIComponent(raw).replace(/^[0-9a-f]{20,}_/, '').replace(/[^A-Za-z0-9._-]/g, '-');
  const id = (raw.match(/^([0-9a-f]{20,})_/) || [])[1];
  let resolved = url;
  for (const name of id ? [base, `${id.slice(-8)}-${base}`] : [base]) {
    if (fs.existsSync(path.join(WEBFLOW_LOCAL_DIR, name))) {
      resolved = `/images/webflow/${name}`;
      break;
    }
  }
  webflowLocalCache.set(url, resolved);
  return resolved;
}

/** Replace every Webflow CDN URL inside a string (plain URL field or HTML body) with its local mirror. */
export const localizeWebflowAssets = (v: string): string =>
  v.includes('website-files.com') ? v.replace(WEBFLOW_CDN_RE, toLocalWebflowAsset) : v;

/** Deep-localize all string fields of CMS records (wrap collection loader output with this). */
export function localizeWebflowRecords<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map((r) => {
    const o: Record<string, unknown> = { ...r };
    for (const k in o) if (typeof o[k] === 'string') o[k] = localizeWebflowAssets(o[k] as string);
    return o as T;
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
  const rows = parseCsvObjects(text).filter(
    (r) => (r['Draft'] || '').toLowerCase() !== 'true' && (r['Archived'] || '').toLowerCase() !== 'true',
  );
  return localizeWebflowRecords(rows);
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
