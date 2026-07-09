// HMAC-signed, self-expiring token for the "human verified" chat cookie.
// Payload is the expiry epoch-ms; signature binds it to CHAT_COOKIE_SECRET so a
// bot can't forge the cookie without the secret.
import { createHmac, timingSafeEqual } from 'node:crypto';

export function signToken(expiryMs: number, secret: string): string {
  const payload = String(expiryMs);
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = parseInt(payload, 10);
  return Number.isFinite(exp) && Date.now() < exp;
}
