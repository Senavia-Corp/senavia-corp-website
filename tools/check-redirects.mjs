/**
 * Self-check for the vercel.json redirect table.
 *
 * The legacy Next.js site served every page under /en/* and /es/*. Those 82 URLs
 * all 404 today. The rules that rescue them are order-sensitive: the catch-all
 * /:locale(en|es)/:rest* eats every later rule, so it MUST stay last. This file
 * fails loudly if that ordering ever breaks.
 *
 * Vercel matches redirects top-to-bottom, first match wins, using path-to-regexp.
 * We reuse the copy already in node_modules rather than reimplementing matching.
 *
 * Run: npm run check:redirects
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { match, compile } from 'path-to-regexp';

const root = fileURLToPath(new URL('..', import.meta.url));
const { redirects } = JSON.parse(readFileSync(`${root}vercel.json`, 'utf8'));

const rules = redirects.map((r) => ({
  ...r,
  test: match(r.source, { decode: decodeURIComponent }),
  build: compile(r.destination, { encode: encodeURIComponent }),
}));

/** First matching rule wins, exactly like Vercel. Returns null when nothing matches (= 404). */
function resolve(path) {
  for (const rule of rules) {
    const hit = rule.test(path);
    if (hit) return { destination: rule.build(hit.params), source: rule.source };
  }
  return null;
}

// [request path, expected destination or null for "stays 404"]
const cases = [
  // The two highest-value URLs: the legacy root of each language.
  ['/en', '/'],
  ['/es', '/'],

  // Money pages — the *-miami slugs are dead, three services exist today.
  ['/en/web-design-miami', '/services/web-design'],
  ['/es/web-design-miami', '/services/web-design'],
  ['/en/web-development-miami', '/services/web-development'],
  ['/es/web-development-miami', '/services/web-development'],
  ['/en/digital-marketing-miami', '/services/traffic-generation'],
  ['/es/digital-marketing-miami', '/services/traffic-generation'],

  // graphic-design has no equivalent — only 3 services exist. Send to the hub.
  ['/en/graphic-design', '/services'],
  ['/es/graphic-design', '/services'],

  // Singular -> plural rename.
  ['/en/testimonial', '/testimonials'],
  ['/es/testimonial', '/testimonials'],

  // 36 legacy combinations collapse onto the hub: the old
  // /{county}/{city}/{websites|marketing} tree has no 1:1 target today.
  ['/en/service-areas', '/service-areas'],
  ['/en/service-areas/miami-dade/miami/websites', '/service-areas'],
  ['/es/service-areas/broward/plantation/marketing', '/service-areas'],

  // Legacy blog used Prisma integer IDs, not slugs (schema.prisma: `id Int`, no
  // slug column), so a post can never be resolved. The index is the honest target.
  ['/en/blog', '/blog'],
  ['/en/blog/123', '/blog'],
  ['/es/blog/4567', '/blog'],

  // Homonymous routes ride the catch-all: same slug, just unprefixed.
  ['/en/about', '/about'],
  ['/es/about', '/about'],
  ['/en/contact', '/contact'],
  ['/es/contact', '/contact'],
  ['/en/pricing', '/pricing'],
  ['/es/pricing', '/pricing'],
  ['/en/portfolio', '/portfolio'],
  ['/en/schedule', '/schedule'],

  // The 8 pre-existing rules must keep working.
  ['/request-estimate', '/website-cost-estimator-online'],
  ['/index.html', '/'],
  ['/401', '/404'],
  ['/services/digital-marketing', '/services/traffic-generation'],

  // Private legacy routes: the catch-all strips the locale and the target does
  // not exist, so they still end at 404. Deliberate — see plan TANDA 2.
  ['/en/admin', '/admin'],

  // Nothing outside the locale prefix may be touched.
  ['/about', null],
  ['/services/web-design', null],
  ['/blog/some-real-post', null],
  ['/english-lessons', null], // must NOT match /:locale(en|es)
  ['/espresso', null],
];

let failed = 0;
for (const [path, expected] of cases) {
  const got = resolve(path);
  const actual = got ? got.destination : null;
  try {
    assert.equal(actual, expected);
  } catch {
    failed++;
    console.error(`FAIL ${path}\n  expected: ${expected}\n  actual:   ${actual}${got ? `  (via ${got.source})` : ''}`);
  }
}

// The ordering trap, asserted directly rather than inferred from the cases above:
// the catch-all must be the last locale rule, or it shadows every specific one.
const localeRules = rules.filter((r) => r.source.startsWith('/:locale'));
const catchAllIndex = localeRules.findIndex((r) => r.source === '/:locale(en|es)/:rest*');
try {
  assert.equal(catchAllIndex, localeRules.length - 1, 'the /:rest* catch-all must be the LAST locale rule');
} catch (e) {
  failed++;
  console.error(`FAIL ordering: ${e.message}`);
}

if (failed) {
  console.error(`\n${failed} redirect check(s) failed.`);
  process.exit(1);
}
console.log(`All ${cases.length} redirect cases pass, and the catch-all is last.`);
