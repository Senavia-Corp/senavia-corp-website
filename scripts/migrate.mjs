#!/usr/bin/env node
/**
 * One-shot migration: converts each source HTML page into an .astro page
 * that uses BaseLayout. Strips global nav/footer/mobile-aside/global scripts
 * (those live in BaseLayout). Rewrites asset paths and internal links.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SOURCE = resolve('_source');
const OUT = resolve('src/pages');

/**
 * Pages map: source → target.
 * For each page we declare:
 *  - in: relative HTML path under _source/
 *  - out: relative target path under src/pages/
 *  - title: title used by Seo (overrides parsed <title>)
 *  - description: meta description (overrides parsed)
 *  - jsonLdType: type for JsonLd
 *  - canonical: canonical path
 *  - bodyClass: classes for <body>
 *  - screenLabel: data-screen-label for <body>
 */
const PAGES = [
  { in: 'index.html', out: 'index.astro', jsonLdType: 'home', canonical: '/' },
  { in: 'about.html', out: 'about.astro', jsonLdType: 'about', canonical: '/about' },
  { in: 'services.html', out: 'services/index.astro', jsonLdType: 'service', canonical: '/services' },
  { in: 'services/web-design.html', out: 'services/web-design.astro', jsonLdType: 'service', canonical: '/services/web-design' },
  { in: 'services/web-development.html', out: 'services/web-development.astro', jsonLdType: 'service', canonical: '/services/web-development' },
  { in: 'services/digital-marketing.html', out: 'services/digital-marketing.astro', jsonLdType: 'service', canonical: '/services/digital-marketing' },
  { in: 'portfolio.html', out: 'portfolio/index.astro', jsonLdType: 'portfolio', canonical: '/portfolio' },
  { in: 'portfolio/angele-glow.html', out: 'portfolio/angele-glow.astro', jsonLdType: 'portfolio', canonical: '/portfolio/angele-glow' },
  { in: 'portfolio/pergola-plus-florida.html', out: 'portfolio/pergola-plus-florida.astro', jsonLdType: 'portfolio', canonical: '/portfolio/pergola-plus-florida' },
  { in: 'service-areas.html', out: 'service-areas/index.astro', jsonLdType: 'localbusiness', canonical: '/service-areas' },
  { in: 'service-areas/miami.html', out: 'service-areas/miami.astro', jsonLdType: 'localbusiness', canonical: '/service-areas/miami' },
  { in: 'pricing.html', out: 'pricing.astro', jsonLdType: 'pricing', canonical: '/pricing' },
  { in: 'testimonials.html', out: 'testimonials.astro', jsonLdType: 'home', canonical: '/testimonials' },
  { in: 'schedule.html', out: 'schedule.astro', jsonLdType: 'home', canonical: '/schedule' },
  { in: 'blog.html', out: 'blog/index.astro', jsonLdType: 'home', canonical: '/blog' },
  { in: 'website-cost-estimator-online.html', out: 'website-cost-estimator-online.astro', jsonLdType: 'home', canonical: '/website-cost-estimator-online' },
  { in: 'contact.html', out: 'contact.astro', jsonLdType: 'home', canonical: '/contact' },
  { in: '404.html', out: '404.astro', jsonLdType: 'home', canonical: '/404', noindex: true },
];

/**
 * URL rewrites: source HTML uses `.html` suffixes. Strip them.
 * Also strip leading `./` and rewrite asset paths.
 */
function rewriteHrefs(html) {
  // .html suffix removal in href attributes (but not in external links)
  html = html.replace(/href="([^"]*\.html)"/g, (m, p1) => {
    if (p1.startsWith('http')) return m;
    let path = p1.replace(/\.html$/, '');
    if (path === 'index') path = '';
    if (path.endsWith('/index')) path = path.replace(/\/index$/, '');
    if (!path.startsWith('/')) path = '/' + path;
    return `href="${path}"`;
  });

  // Strip 'href="#"' that lead nowhere → keep as # for now (handled per page)
  // Asset rewrites
  html = html.replace(/(["'(])assets\//g, '$1/');
  // After the swap CSS/JS paths point to /css/... and /js/... which don't exist;
  // images and videos now point to /images/... and /videos/... (which is correct).
  // We'll strip references to /css/senavia.css and /js/home.js (loaded by BaseLayout).
  html = html.replace(/<link[^>]+\/css\/senavia\.css[^>]*>\s*/g, '');
  html = html.replace(/<script[^>]+\/js\/home\.js[^>]*><\/script>\s*/g, '');
  // Strip Google Fonts preconnect + stylesheet (replaced by @fontsource-variable/inter)
  html = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>\s*/g, '');
  html = html.replace(/<link[^>]+fonts\.gstatic\.com[^>]*>\s*/g, '');
  // Strip Calendly external CSS/JS (loaded by BaseLayout)
  html = html.replace(/<link[^>]+calendly\.com[^>]+widget\.css[^>]*>\s*/g, '');
  html = html.replace(/<script[^>]+calendly\.com[^>]+widget\.js[^>]*><\/script>\s*/g, '');
  return html;
}

function extractBetween(s, openMarker, closeMarker, includeMarkers = true) {
  const i = s.indexOf(openMarker);
  if (i === -1) return { found: false, before: s, match: '', after: '' };
  const j = s.indexOf(closeMarker, i);
  if (j === -1) return { found: false, before: s, match: '', after: '' };
  const end = j + closeMarker.length;
  return {
    found: true,
    before: s.slice(0, i),
    match: includeMarkers ? s.slice(i, end) : s.slice(i + openMarker.length, j),
    after: s.slice(end),
  };
}

function extractTag(html, tag, attrHint = '') {
  // very dumb tag matcher: finds the FIRST opening <tag ...> and matching </tag>
  // attrHint, if provided, must be a substring of the opening tag.
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'i');
  let cur = 0;
  while (true) {
    const m = html.slice(cur).match(openRe);
    if (!m) return null;
    const openStart = cur + m.index;
    const openTag = m[0];
    if (attrHint && !openTag.includes(attrHint)) {
      cur = openStart + openTag.length;
      continue;
    }
    // find matching close, accounting for nesting
    const closeRe = new RegExp(`</?${tag}\\b[^>]*>`, 'gi');
    let depth = 1;
    closeRe.lastIndex = openStart + openTag.length;
    let mm;
    while ((mm = closeRe.exec(html))) {
      if (mm[0].startsWith('</')) {
        depth--;
        if (depth === 0) {
          const end = mm.index + mm[0].length;
          return {
            start: openStart,
            end,
            content: html.slice(openStart, end),
            inner: html.slice(openStart + openTag.length, mm.index),
          };
        }
      } else {
        depth++;
      }
    }
    return null;
  }
}

function escapeForTemplate(str) {
  // Inside Astro's HTML, we're fine with raw HTML, but we must escape literal braces if any.
  return str;
}

function migrate(page) {
  const srcPath = resolve(SOURCE, page.in);
  let html = readFileSync(srcPath, 'utf8');

  // Parse <title>
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = page.title || (titleMatch ? titleMatch[1].trim() : 'SENAVIA Corp');

  // Parse <meta name="description">
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"[^>]*>/i);
  const description = page.description || (descMatch ? descMatch[1].trim() : '');

  // Parse <body data-screen-label="...">
  const bodyOpen = html.match(/<body([^>]*)>/i);
  const bodyAttrs = bodyOpen ? bodyOpen[1] : '';
  const screenLabelMatch = bodyAttrs.match(/data-screen-label="([^"]+)"/);
  const screenLabel = page.screenLabel || (screenLabelMatch ? screenLabelMatch[1] : undefined);

  // Extract body inner
  const body = extractTag(html, 'body');
  if (!body) throw new Error(`No body in ${page.in}`);
  let bodyInner = body.inner;

  // Strip global blocks that BaseLayout owns:
  //  - <nav class="nav" ...>...</nav>
  //  - <div class="nav-scrim"...></div>
  //  - <aside class="nav-mobile" ...>...</aside>
  //  - <footer id="footer" ...>...</footer>
  //  - The inline burger/mobile menu <script>
  //  - The global language switcher <script>
  //  - The home.js <script src=...>
  //  - Calendly <link> and <script>
  function stripBlock(open, close) {
    while (true) {
      const r = extractBetween(bodyInner, open, close, true);
      if (!r.found) return;
      bodyInner = r.before + r.after;
    }
  }

  // Strip nav-wrapper, mobile aside, scrim, footer
  // Use precise opening sequences from the source files (these appear once each)
  stripBlock('<nav class="nav"', '</nav>');
  stripBlock('<div class="nav-scrim"', '</div>');
  stripBlock('<aside class="nav-mobile"', '</aside>');
  stripBlock('<footer id="footer"', '</footer>');

  // Strip the burger/mobile-menu script (it follows the </aside> in source — pattern: starts with "<script>" then "  (function(){\n    var burger")
  // Find any <script> blocks that contain "navBurger" or "navMobile"
  bodyInner = bodyInner.replace(
    /<script>\s*\(function\(\)\{\s*var burger[\s\S]*?\}\)\(\);\s*<\/script>/g,
    ''
  );
  // Strip the global lang switcher script (contains "senavia.lang")
  bodyInner = bodyInner.replace(
    /<script>\s*\(function\(\)\{[^<]*senavia\.lang[\s\S]*?\}\)\(\);\s*<\/script>/g,
    ''
  );
  // Strip Calendly bits and home.js
  bodyInner = rewriteHrefs(bodyInner);

  // Trim noise comments and excess blank lines
  bodyInner = bodyInner
    .replace(/<!-- Calendly -->/g, '')
    .replace(/<!-- Language switcher \(global\) -->/g, '')
    .replace(/<!-- Home page interactions[^>]*-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Build .astro
  const titleEscaped = title.replace(/"/g, '\\"');
  const descEscaped = description.replace(/"/g, '\\"');
  const frontmatter = [
    `---`,
    `import BaseLayout from '@/layouts/BaseLayout.astro';`,
    `const title = "${titleEscaped}";`,
    description ? `const description = "${descEscaped}";` : null,
    `---`,
  ]
    .filter(Boolean)
    .join('\n');

  const baseLayoutProps = [
    `title={title}`,
    description ? `description={description}` : null,
    page.canonical ? `canonical="${page.canonical}"` : null,
    page.jsonLdType ? `jsonLdType="${page.jsonLdType}"` : null,
    page.noindex ? `noindex` : null,
    screenLabel ? `screenLabel="${screenLabel}"` : null,
  ]
    .filter(Boolean)
    .join('\n  ');

  const astroContent = `${frontmatter}
<BaseLayout
  ${baseLayoutProps}
>
${escapeForTemplate(bodyInner)}
</BaseLayout>
`;

  const outPath = resolve(OUT, page.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, astroContent, 'utf8');
  return { path: outPath, bytes: astroContent.length };
}

const results = [];
for (const page of PAGES) {
  try {
    const r = migrate(page);
    results.push({ src: page.in, out: page.out, bytes: r.bytes });
    console.log(`✓ ${page.in} → ${page.out} (${r.bytes.toLocaleString()} bytes)`);
  } catch (err) {
    console.error(`✗ ${page.in}: ${err.message}`);
  }
}
console.log(`\nMigrated ${results.length}/${PAGES.length} pages.`);
