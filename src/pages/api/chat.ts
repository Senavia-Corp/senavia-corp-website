// Chat endpoint for the floating sales widget.
//
// Was a proxy in front of an n8n Cloud webhook (n8n → Gemini). Both
// subscriptions lapsed; n8n started answering with its "404 - No workspace here"
// HTML page and this route forwarded it verbatim, so visitors saw raw HTML in
// the chat bubble. The answers now come from src/lib/chatBot.mjs — no upstream,
// nothing to renew.
//
// Turnstile still guards the route: when the env is configured, only visitors
// holding the HMAC-signed "human verified" cookie from /api/chat-verify get in.
// Fail-open until that env exists, so the chat never breaks during setup.
export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyToken } from '@/lib/chatAuth';
import { botReply } from '@/lib/chatBot.mjs';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  const cookieSecret = process.env.CHAT_COOKIE_SECRET;
  const gate = !!process.env.TURNSTILE_SECRET && !!cookieSecret;

  if (gate && !verifyToken(cookies.get('chat_ok')?.value, cookieSecret!)) {
    return json({ output: 'Please refresh the page to verify you are human.' }, 403);
  }

  let body: { action?: string; chatInput?: string; metadata?: { site_lang?: string } } = {};
  try {
    body = await request.json();
  } catch {
    // Malformed body → fall through and answer with the greeting.
  }

  // The widget asks for the session history when it opens. We keep no history,
  // so it renders its own initial messages instead.
  if (body.action === 'loadPreviousSession') return json({ data: [] });

  return json({ output: botReply({ text: body.chatInput, lang: body.metadata?.site_lang }) });
};
