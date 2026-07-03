#!/usr/bin/env node
// tools/qa/serve.mjs [--port 4173]
// Server estático puro (node:http) para dist/ que emula el comportamiento de
// Vercel: cleanUrls, redirects y headers de vercel.json (leído en runtime).
// Sin dependencias.

import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DIST = join(REPO_ROOT, 'dist');
const VERCEL_JSON = join(REPO_ROOT, 'vercel.json');

const args = process.argv.slice(2);
let port = 4173;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port') port = Number(args[i + 1]);
  else if (args[i].startsWith('--port=')) port = Number(args[i].split('=')[1]);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Convierte un source de vercel.json a RegExp: '/(.*)' = todo; '/x/(.*)' = prefijo. */
function sourceToRegex(source) {
  // Escapa todo menos los grupos '(.*)'
  const parts = source.split('(.*)');
  const escaped = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('^' + escaped.join('(.*)') + '$');
}

function loadVercelConfig() {
  try {
    const cfg = JSON.parse(readFileSync(VERCEL_JSON, 'utf8'));
    return {
      redirects: (cfg.redirects || []).map((r) => ({ ...r })),
      headers: (cfg.headers || []).map((h) => ({
        regex: sourceToRegex(h.source),
        headers: h.headers || [],
      })),
    };
  } catch (e) {
    console.error(`[serve] no pude leer vercel.json: ${e.message}`);
    return { redirects: [], headers: [] };
  }
}

function applyHeaders(res, pathname, cfg) {
  for (const rule of cfg.headers) {
    if (rule.regex.test(pathname)) {
      for (const { key, value } of rule.headers) res.setHeader(key, value);
    }
  }
}

function send(res, status, body, contentType) {
  if (contentType) res.setHeader('Content-Type', contentType);
  res.statusCode = status;
  res.end(body);
}

const server = http.createServer((req, res) => {
  const cfg = loadVercelConfig(); // runtime read (barato: archivo pequeño)
  let rawPath;
  try {
    rawPath = new URL(req.url, `http://localhost:${port}`).pathname;
  } catch {
    return send(res, 400, 'Bad request', 'text/plain; charset=utf-8');
  }
  let pathname;
  try { pathname = decodeURIComponent(rawPath); } catch { pathname = rawPath; }

  // 1) Redirects de vercel.json (source literal; compara raw y decodificado).
  for (const r of cfg.redirects) {
    let decodedSource;
    try { decodedSource = decodeURIComponent(r.source); } catch { decodedSource = r.source; }
    if (rawPath === r.source || pathname === r.source || pathname === decodedSource) {
      applyHeaders(res, pathname, cfg);
      res.setHeader('Location', r.destination);
      return send(res, r.permanent ? 301 : 302, '');
    }
  }

  // 2) trailingSlash:false → /about/ redirige a /about (301).
  if (pathname.length > 1 && pathname.endsWith('/')) {
    applyHeaders(res, pathname, cfg);
    res.setHeader('Location', pathname.slice(0, -1));
    return send(res, 301, '');
  }

  // 3) Resolución de archivo (cleanUrls).
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const candidates = [];
  if (pathname === '/') {
    candidates.push(join(DIST, 'index.html'));
  } else {
    candidates.push(join(DIST, safePath)); // archivo tal cual (assets, .html directo)
    candidates.push(join(DIST, safePath, 'index.html')); // /about -> about/index.html
    candidates.push(join(DIST, safePath + '.html')); // /about -> about.html
  }

  for (const file of candidates) {
    if (!file.startsWith(DIST)) continue; // path traversal guard
    if (existsSync(file) && statSync(file).isFile()) {
      applyHeaders(res, pathname, cfg);
      const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
      return send(res, 200, readFileSync(file), type);
    }
  }

  // 4) 404 con dist/404.html.
  applyHeaders(res, pathname, cfg);
  const notFound = join(DIST, '404.html');
  if (existsSync(notFound)) {
    return send(res, 404, readFileSync(notFound), 'text/html; charset=utf-8');
  }
  return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
});

server.listen(port, () => {
  console.log(`[serve] dist/ en http://localhost:${port} (cleanUrls + vercel.json headers/redirects)`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
