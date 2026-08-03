/**
 * Self-check for the sales chat brain (src/lib/chatBot.mjs).
 *
 * The bug that killed the old chat was a reply that wasn't a reply: n8n's 404
 * HTML page went straight into the chat bubble. So the invariants here are
 * blunt on purpose — every reply must be real text, in the visitor's language,
 * with a way to reach a human. Prices are asserted against src/data/pricing.ts
 * so this fails loudly if the two ever drift.
 *
 * Run: npm run check:chat
 */
import assert from 'node:assert/strict';
import { botReply, pickLang, route } from '../src/lib/chatBot.mjs';
import { BUSINESS, ECOMMERCE } from '../src/data/pricing.ts';

const say = (text, lang) => botReply({ text, lang });

/* ---------- every reply is usable ---------- */
const SAMPLES = [
  '', 'hi', 'hola', 'how much does a website cost?', '¿cuánto cuesta una página web?',
  'i need an online store', 'quiero una tienda en línea', 'do you do SEO?',
  'how much for google ads?', 'we need a client portal with CRM', 'how long does it take?',
  'can I see your work?', 'I want to talk to a human', '¿hablan español?',
  'book a call', 'asdkjhaskdjh', '你好', 'REDESIGN MY SITE',
];

for (const s of SAMPLES) {
  const r = say(s, 'en');
  assert.ok(r.length > 40, `reply too short for ${JSON.stringify(s)}`);
  assert.ok(!/[<>]/.test(r), `reply leaked markup for ${JSON.stringify(s)}: ${r.slice(0, 80)}`);
  // Always a way out: booking, phone, or email.
  assert.match(r, /\/schedule|tel:\+1754|mailto:/, `no next step for ${JSON.stringify(s)}`);
}

/* ---------- language ---------- */
assert.equal(pickLang('hello there', 'en'), 'en');
assert.equal(pickLang('hola, necesito ayuda', 'en'), 'es', 'Spanish text must win over an EN page');
assert.equal(pickLang('hello, how much?', 'es'), 'en', 'English text must win over an ES page');
assert.equal(pickLang('SEO Miami', 'es'), 'es', 'no language signal → trust the page');
assert.equal(pickLang('SEO Miami', 'en'), 'en');
assert.match(say('¿cuánto cuesta un sitio web?', 'en'), /Precios fijos/);
assert.match(say('how much does a website cost?', 'es'), /Transparent, fixed-price/);

/* ---------- routing ---------- */
assert.equal(route('how much for an online store?'), 'priceEcommerce');
assert.equal(route('how much do google ads cost?'), 'priceTraffic');
assert.equal(route('how much for a website?'), 'priceBusiness');
assert.equal(route('¿cuánto vale una tienda online?'), 'priceEcommerce');
assert.equal(route('how long does a build take?'), 'timeline');
assert.equal(route('I want to book a call'), 'booking');
assert.equal(route('do you build admin panels or CRM integrations?'), 'dev');
assert.equal(route('can I see examples of your work?'), 'portfolio');
assert.equal(route('I want to talk to a person'), 'contact');
assert.equal(route('qwertyuiop'), 'fallback');

/* ---------- prices stay in sync with the pricing page ---------- */
const usd = (n) => '$' + n.toLocaleString('en-US');
const biz = say('how much for a website?', 'en');
for (const p of BUSINESS) {
  assert.ok(biz.includes(usd(p.price)), `business price missing: ${p.name} ${usd(p.price)}`);
  assert.ok(biz.includes(p.name), `business package missing: ${p.name}`);
}
const shop = say('how much for an online store?', 'en');
for (const p of ECOMMERCE) {
  assert.ok(shop.includes(usd(p.price)), `store price missing: ${p.name} ${usd(p.price)}`);
}
// SEO/Ads have no list price — never invent one.
assert.doesNotMatch(say('how much for SEO?', 'en'), /\$\d/, 'SEO must be quoted after an audit, not priced');

/* ---------- honesty: the chat cannot deliver messages, so it must not promise to ---------- */
const shared = say('sure, my email is bob@example.com', 'en');
assert.match(shared, /doesn't deliver messages/);
assert.match(say('llámame al 754 262 3659', 'en'), /no entrega mensajes/);

/* ---------- delivery times come from the data, not from memory ---------- */
const when = say('how long does it take?', 'en');
for (const p of BUSINESS) assert.ok(when.includes(p.delivery_en), `delivery missing: ${p.delivery_en}`);

console.log(`✅ chat brain OK — ${SAMPLES.length} sample messages, ${BUSINESS.length + ECOMMERCE.length} packages in sync`);
