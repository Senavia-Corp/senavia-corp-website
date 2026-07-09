// Image prompts for the Traffic Generation + Web Development subservice images.
// Style mirrors the existing Web Design set (see ~/prompts/senavia-subservice-image-prompts.md):
// ultra-realistic Apple-device product photo, navy #0A0E26→#0D1235 bg, accent aurora glow,
// connector lines + floating mini-icons, glass badges, sparkle, 1:1 square, no readable text.
// Prompts are BUILT from a base template + per-subservice SPECS (DRY, consistent).

const GLOW = {
  purple: 'violet #7B3FE4 core warming to magenta #C13B8A',
  cyan: 'cyan #33CCCC into blue #3399FF',
  green: 'lime #99CC33 into green #66CC66',
};
const ACCENTWORD = { purple: 'violet', cyan: 'cyan', green: 'lime' };

// accent · screen (main laptop) · mirror (phone) · icons · heroBadges (3) · introBadge (1) · ipad?
const SPECS = {
  // ── Traffic Generation ───────────────────────────────────────────────
  'google-ads-management': {
    accent: 'purple',
    screen: 'a Google Ads campaign dashboard with bid/impression/click bar and line charts, a compact search-ad preview block, and a CPC/ROAS pill',
    mirror: 'a single rising conversion chart',
    icons: 'cursor-click, target, bar-chart, dollar-badge',
    heroBadges: 'the Google Ads logo, a green up-arrow ROI chip, and a target glyph chip',
    introBadge: 'the Google Ads logo',
  },
  'seo-services': {
    accent: 'cyan',
    screen: 'a search-results page with the number-one organic listing highlighted and a keyword-ranking line chart climbing',
    mirror: 'a mobile search-results page',
    icons: 'search, link, bar-chart, arrow-up',
    heroBadges: "a Google 'G' mark chip, a magnifier search-console glyph chip, and an upward-rank arrow chip",
    introBadge: "a Google 'G' mark chip",
  },
  'local-seo-services': {
    accent: 'green',
    screen: 'a Google Maps view with a location pin and a local business card showing five gold stars and an Open-now tag',
    mirror: 'a mobile map with a call button',
    icons: 'map-pin, star, phone, store',
    heroBadges: 'the Google Maps pin logo, a gold five-star chip, and a verified-check chip',
    introBadge: 'the Google Maps pin logo',
  },
  'facebook-instagram-ads': {
    accent: 'purple',
    screen: 'a Meta Ads Manager with an audience-reach chart and a social ad creative preview card with a heart-like icon',
    mirror: 'an Instagram-style ad in a feed',
    icons: 'thumbs-up, heart, users, target',
    heroBadges: "the Facebook 'f' logo, the Instagram camera logo, and a target glyph chip",
    introBadge: 'the Instagram camera logo',
  },
  'google-business-profile-optimization': {
    accent: 'cyan',
    screen: 'a polished Google Business Profile card with photos, hours, star reviews and a small map',
    mirror: 'the mobile profile with Directions and Call buttons',
    icons: 'map-pin, star, image, clock',
    heroBadges: 'the Google Maps logo, a verified-check chip, and a gold-star chip',
    introBadge: 'a verified-check chip',
  },
  'ai-search-optimization': {
    accent: 'green',
    screen: 'an AI generative-search answer panel citing a brand as a source card, with soft sparkle accents',
    mirror: 'an AI assistant answer',
    icons: 'sparkles, message-square, quote, link',
    heroBadges: "each a pure minimal glyph with no wordmark: a sparkle 'AI' glyph chip, a generic AI-search glyph chip, and a source-link chip",
    introBadge: "a sparkle 'AI' glyph chip",
  },
  // ── Web Development ──────────────────────────────────────────────────
  'custom-web-application-development': {
    accent: 'purple',
    ipad: true,
    screen: 'a split screen — left a dark IDE as crisp colored horizontal code bars with no readable letters, right a live web-app UI with auth, cards and toggles',
    mirror: 'the same web-app UI',
    icons: 'code, gear, plug, layers',
    heroBadges: 'JavaScript, Node.js and React pill badges with large razor-sharp labels only',
    introBadge: 'a React pill badge',
  },
  'admin-panel-development': {
    accent: 'cyan',
    screen: 'an admin dashboard with a sidebar nav, KPI stat cards, a bar chart and a data table with filters',
    mirror: 'a compact mobile dashboard',
    icons: 'layout-grid, bar-chart, table, sliders',
    heroBadges: 'a chart glyph chip, a React pill badge, and a table glyph chip',
    introBadge: 'a chart glyph chip',
  },
  'crm-development': {
    accent: 'green',
    screen: 'a custom CRM showing a contacts list and a deal pipeline kanban with distinct stage columns, plus a contact detail card',
    mirror: 'a mobile CRM record',
    icons: 'users, kanban, mail, phone',
    heroBadges: 'each a pure minimal glyph with no wordmark: a contacts glyph, a pipeline glyph, and a database glyph',
    introBadge: 'a contacts glyph chip',
  },
  'api-integration-services': {
    accent: 'purple',
    screen: 'an integration canvas — connected service nodes linked by lines, a JSON payload block as colored bars, and webhook toggles',
    mirror: 'a connected-status check',
    icons: 'plug, git-branch, share-2, webhook',
    heroBadges: 'each a pure minimal glyph with no wordmark: an API braces glyph chip, a webhook glyph chip, and a plug glyph chip',
    introBadge: 'an API braces glyph chip',
  },
  'workflow-automation': {
    accent: 'cyan',
    screen: 'an automation flow builder with trigger-to-action nodes connected in a flow and a run-history list with green checks',
    mirror: 'a workflow-ran notification',
    icons: 'workflow, zap, gear, check-circle',
    heroBadges: 'an automation zap glyph chip, a Node.js pill badge, and a green check glyph chip',
    introBadge: 'an automation zap glyph chip',
  },
  'erp-system-development': {
    accent: 'green',
    screen: 'a modular ERP with module tiles for inventory, finance and HR, a stock and finance chart, and a data grid',
    mirror: 'a single ERP module card',
    icons: 'boxes, database, bar-chart, layout-grid',
    heroBadges: 'each a pure minimal glyph with no wordmark: a modules-grid glyph chip, a database glyph chip, and a chart glyph chip',
    introBadge: 'a modules-grid glyph chip',
  },
};

const NEG = 'Negative: cropped or cut-off elements, anything touching or bleeding past the frame edge, badges clipped at the bottom, wide or panoramic crop, 3D-render or CGI plastic look, illustration, cartoon, flat vector, white or pure black background, garbled text, paragraphs, body text, numerals.';

function buildHero(s) {
  const devices = s.ipad
    ? 'a genuine MacBook Pro at a 3/4 angle slightly off-center, a slim iPad Pro behind it and a real iPhone Pro beside it'
    : 'a genuine MacBook Pro at a 3/4 angle slightly off-center to leave a calm headline zone, with a real iPhone Pro beside it';
  return `Ultra-realistic studio product photography for a premium digital agency, indistinguishable from a real photo, cinematic soft studio lighting, shallow depth of field, accurate contact shadows. Perfect SQUARE canvas: ${devices}, true aluminum and glass, realistic screen glow and reflections. Zoom out so EVERY element sits COMPLETELY INSIDE the square frame with comfortable margin — nothing cropped, cut off, or bleeding past any edge. SCREEN CONTENT, rendered as a real screenshot using crisp geometric blocks, cards, charts and icons — no paragraphs, no body text, no numerals, at most one short razor-sharp word, no garbled text: ${s.screen}; the iPhone mirrors ${s.mirror}. BACKGROUND: deep navy seamless gradient #0A0E26 to #0D1235, never white or pure black, dim dot-grid and faint circuit texture. ACCENT GLOW: one large soft organic aurora blob in ${GLOW[s.accent]}, glowing fully within the frame behind the MacBook. Thin ${ACCENTWORD[s.accent]}-tinted connector lines with small nodes and a few thin-outline floating mini-icons (${s.icons}), all inside the frame. Three frosted dark-glass badge cards, fully visible and uncropped with padding: ${s.heroBadges}. A small subtle sparkle accent lower-right. Mood: Apple-meets-Linear, premium, clean. Aspect ratio 1:1 (perfect square), ultra high resolution. ${NEG}`;
}

function buildIntro(s) {
  return `Tighter ultra-realistic studio product photography for a premium digital agency, indistinguishable from a real photo, cinematic soft studio lighting, shallow depth of field, accurate contact shadows. Perfect SQUARE canvas: a single genuine MacBook Pro at a gentle 3/4 angle, optionally a real iPhone Pro just behind it, true aluminum and glass, realistic screen glow and reflections. Pull back enough that the whole device and EVERY element sits COMPLETELY INSIDE the square frame with comfortable margin — nothing cropped, cut off, or bleeding past any edge. Focus on ONE clear screen view, rendered as a real screenshot using crisp geometric blocks, cards, charts and icons — no paragraphs, no body text, no numerals, at most one short razor-sharp word, no garbled text: ${s.screen}. BACKGROUND: deep navy seamless gradient #0A0E26 to #0D1235, never white or pure black, dim dot-grid and faint circuit texture. ACCENT GLOW: one large soft organic aurora blob in ${GLOW[s.accent]}, glowing fully within the frame behind the laptop. A couple of thin ${ACCENTWORD[s.accent]}-tinted connector lines with small nodes and at most one floating mini-icon, all inside the frame. At most ONE frosted dark-glass badge card, fully visible and not clipped, holding ${s.introBadge}. A small subtle sparkle accent lower-right. Mood: Apple-meets-Linear, premium, clean. Aspect ratio 1:1 (perfect square), ultra high resolution. ${NEG}`;
}

export const PROMPTS = Object.fromEntries(
  Object.entries(SPECS).map(([slug, s]) => [slug, { hero: buildHero(s), intro: buildIntro(s) }])
);
