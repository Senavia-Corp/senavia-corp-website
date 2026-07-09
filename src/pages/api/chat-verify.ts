// Verifies a Cloudflare Turnstile token and, on success, sets an HMAC-signed
// short-lived cookie that /api/chat requires. Called once when the chat opens.
// Fail-open until Turnstile is configured (returns ok so setup doesn't block chat).
export const prerender = false;

import type { APIRoute } from 'astro';
import { signToken } from '@/lib/chatAuth';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TTL_MS = 30 * 60 * 1000;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const secret = process.env.TURNSTILE_SECRET;
  const cookieSecret = process.env.CHAT_COOKIE_SECRET;

  // Not configured yet -> treat as verified so the chat keeps working during setup.
  if (!secret || !cookieSecret) {
    return new Response(JSON.stringify({ ok: true, mode: 'open' }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  let token = '';
  try {
    token = (await request.json())?.token ?? '';
  } catch {
    /* ignore */
  }
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'missing token' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (clientAddress) form.set('remoteip', clientAddress);

  let ok = false;
  try {
    const res = await fetch(SITEVERIFY, { method: 'POST', body: form });
    ok = ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    ok = false;
  }

  if (!ok) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  cookies.set('chat_ok', signToken(Date.now() + TTL_MS, cookieSecret), {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: TTL_MS / 1000,
  });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
