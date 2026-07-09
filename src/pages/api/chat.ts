// Same-origin proxy in front of the n8n chat webhook.
// - Hides the n8n webhook URL from the client.
// - When Turnstile is configured (env set), requires the HMAC-signed "human
//   verified" cookie set by /api/chat-verify, so bots can't reach Gemini.
// - Fail-open until the env is configured, so the chat never breaks during setup.
export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyToken } from '@/lib/chatAuth';

const N8N_WEBHOOK =
  'https://senavia.app.n8n.cloud/webhook/95bd1c1b-bdd5-4b05-8541-ce98f915b422/chat';

export const POST: APIRoute = async ({ request, cookies }) => {
  const cookieSecret = process.env.CHAT_COOKIE_SECRET;
  const gate = !!process.env.TURNSTILE_SECRET && !!cookieSecret;

  if (gate) {
    const ok = verifyToken(cookies.get('chat_ok')?.value, cookieSecret!);
    if (!ok) {
      return new Response(
        JSON.stringify({ output: 'Please refresh the page to verify you are human.' }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      );
    }
  }

  const body = await request.text();
  try {
    const res = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': request.headers.get('content-type') ?? 'application/json' },
      body,
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ output: 'Chat is temporarily unavailable. Please try again.' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
};
