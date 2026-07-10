// Same-origin proxy to the Cal.com API v2.
// Cal.com's Cloudflare blocks n8n Cloud's egress IP (403 "you have been blocked"),
// but allows Vercel's. So the chatbot's n8n tools call this endpoint instead of
// api.cal.com directly; we forward the request (method, path, query, body,
// Authorization + cal-api-version headers) to Cal.com and relay the response.
// Scoped to slots + bookings only, so it can't be used as a general open proxy.
export const prerender = false;

import type { APIRoute } from 'astro';

const CAL_BASE = 'https://api.cal.com/v2';
const ALLOWED = new Set(['slots', 'bookings']);

const handler: APIRoute = async ({ params, request }) => {
  // Require a shared secret so only our n8n workflow (server-to-server) can use
  // this Cal.com-authenticated proxy. Fail-open until CAL_PROXY_SECRET is set,
  // matching /api/chat, so deploying this never breaks the live chatbot.
  const proxyKey = process.env.CAL_PROXY_SECRET;
  if (proxyKey && request.headers.get('x-proxy-key') !== proxyKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const path = params.path ?? '';
  const base = path.split('/')[0];
  if (!ALLOWED.has(base)) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const search = new URL(request.url).search;
  const target = `${CAL_BASE}/${path}${search}`;

  const headers: Record<string, string> = {
    'cal-api-version': request.headers.get('cal-api-version') ?? '2024-08-13',
    'User-Agent': 'Mozilla/5.0 (compatible; SenaviaBot/1.0)',
    Accept: 'application/json',
  };
  // Prefer the Cal.com key from Vercel env (single secure source); fall back to
  // whatever Authorization the caller forwarded.
  const apiKey = process.env.CAL_API_KEY;
  const auth = request.headers.get('authorization');
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  else if (auth) headers.Authorization = auth;

  const init: RequestInit = { method: request.method, headers };
  if (request.method === 'POST') {
    headers['Content-Type'] = 'application/json';
    init.body = await request.text();
  }

  try {
    const res = await fetch(target, init);
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json',
        'x-cal-proxy': process.env.CAL_API_KEY ? 'env-key' : 'forwarded',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy fetch failed', detail: String(e) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const GET = handler;
export const POST = handler;
