// TEMP diagnostic endpoint: does Vercel's egress IP pass Cal.com's Cloudflare?
// If it returns status 401 -> Cloudflare passed (Cal.com just rejects the dummy key) -> a proxy works.
// If it returns status 403 (HTML "you have been blocked") -> Vercel is also blocked -> proxy won't help.
// Delete after diagnosis.
export const prerender = false;

export async function GET() {
  let out: Record<string, unknown> = {};
  try {
    const r = await fetch(
      'https://api.cal.com/v2/slots?eventTypeId=6253901&start=2026-07-09&end=2026-07-10&timeZone=America/New_York',
      {
        headers: {
          'cal-api-version': '2024-09-04',
          Authorization: 'Bearer dummy-test-key',
          'User-Agent': 'Mozilla/5.0 (compatible; SenaviaBot/1.0)',
        },
      },
    );
    const text = await r.text();
    out = { upstreamStatus: r.status, snippet: text.slice(0, 220) };
  } catch (e) {
    out = { error: String(e) };
  }
  return new Response(JSON.stringify(out), {
    headers: { 'content-type': 'application/json' },
  });
}
