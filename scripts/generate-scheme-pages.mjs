// ═══════════════════════════════════════════════════════════════════════════════
// scripts/generate-scheme-pages.js
// ─────────────────────────────────────────────────────────────────────────────
// Runs automatically before every build (wired via "prebuild" in package.json).
// Reads SCHEME_DB (same source of truth the app uses) and writes one lightweight
// static HTML file per scheme into public/schemes/{slug}.html and a Hindi twin
// into public/yojana/{slug}.html — each individually indexable by Google.
//
// Also regenerates sitemap.xml with every scheme URL (replacing the old
// single-URL static file).
//
// WHY: the React app has zero URL routing — every visitor lands on "/" and
// navigates via in-memory state. Google can only ever rank that one URL.
// These static pages give Google a distinct, crawlable, keyword-matching URL
// for every single scheme — in both languages — without touching the React app
// at all (besides one small addition to read ?scheme= on load).
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, "..");
const SITE_URL   = "https://yojanasahay.vercel.app";

// ── Import scheme data ─────────────────────────────────────────────────────────
// Node can import .js ESM modules directly since "type":"module" is implied by
// using import/export syntax + Vite's package.json. If your package.json does
// NOT have "type":"module", rename this file to generate-scheme-pages.mjs and
// update the prebuild script path accordingly.
const { SCHEME_DB: ALL_SCHEMES } = await import("../src/schemesData.js");
// Duplicate listings (duplicateOf) get no page of their own — the main
// scheme's page covers them, so Google never sees near-copy pages.
const SCHEME_DB = ALL_SCHEMES.filter(s => !s.duplicateOf);
const { FAQ_DATA, faqAnswerText } = await import("../src/faqData.js");
const { TERMS } = await import("../src/legalText.js");
const { SCHEME_COUNT_LABEL, STATE_COUNT, CENTRAL_COUNT } = await import("../src/schemeStats.js");
const { whoCanApply } = await import("../src/eligibilityText.js");
const { isOfficialUrl } = await import("../src/schemeMatch.js");
const { benefitKind } = await import("../src/benefitMath.js");
const { nicheAudience } = await import("../src/audience.js");
const { GUIDES, GUIDES_REVIEWED } = await import("./seo-guides.mjs");
let META = {};
try { META = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "schemes-meta.json"), "utf8")); } catch { /* optional */ }

// Real "last checked" date per scheme (from the link verifier) — used both on
// the page and as the sitemap <lastmod>, so Google sees honest dates instead
// of every page claiming to change on every deploy.
function checkedDate(id) {
  const v = META[id]?.lastVerified;
  return v && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null;
}
const stateSlug = st => "list-" + String(st || "india").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const hubFile = s => (s.scope === "state" && s.state ? stateSlug(s.state) : "list-central");
// Schemes grouped by hub, for "more schemes" links + state list pages.
const HUBS = new Map();
for (const s of SCHEME_DB) {
  if (!s?.id || !s?.name?.en) continue;
  const k = hubFile(s);
  if (!HUBS.has(k)) HUBS.set(k, { key: k, state: s.scope === "state" ? s.state : null, schemes: [] });
  HUBS.get(k).schemes.push(s);
}

// Category from the tag ("Farmer / Crop Loan" → "Farmer") — used to link
// similar schemes in OTHER states (real, useful links between pages).
const category = s => String(s?.tag?.en || "").split(/[\/·,]/)[0].trim().toLowerCase();
const BY_CAT = new Map();
for (const s of SCHEME_DB) {
  const c = category(s);
  if (!c) continue;
  if (!BY_CAT.has(c)) BY_CAT.set(c, []);
  BY_CAT.get(c).push(s);
}
const YEAR = new Date().getFullYear();

// ── Which pages Google should index ─────────────────────────────────────────
// Google was leaving 2,000+ pages "discovered – not indexed": it holds back
// sites that look like many thin, similar pages. So only pages with solid,
// checked information are offered to Google (index + sitemap); the rest stay
// live for visitors but say "noindex" until their data is filled in.
// Central schemes and pages already getting Google impressions always count.
const FORCE_INDEX = new Set([
  "ts-epass-fee", "maha-smart-solar", "punjab-kisan-karj-mafi", "chandigarh-ladli-yojana", "bihar-student-credit-card",
  "tn-chief-minister-health", "ts-micro-irrigation", "jk-widow-pension", "odisha-cm-kisan", "maha-ai-agriculture-policy",
  "wb-student-credit-card", "punjab-free-eye-checkup", "ts-t-fiber", "karnataka-sericulture", "inspire-she", "pmawas-rural",
  "assam-she-scholarship", "assam-jibika-sakhi", "maha-majhi-ladki-bahin", "mp-ladli-behna", "odisha-subhadra",
  "jharkhand-maiya-samman", "cg-mahtari-vandan", "wb-annapurna-bhandar", "karnataka-gruha-lakshmi", "assam-orunodoi",
]);
function qualityScore(s) {
  const m = META[s.id] || {};
  let sc = 0;
  if ((whoCanApply(s, "en") || []).length >= 2) sc++;
  if ((s.docs?.en || []).length >= 3) sc++;
  if (s.description?.en) sc++;
  if (s.annual > 0) sc++;
  if (m.lastVerified) sc++;
  if ((s.benefit?.en || "").length >= 40) sc++;
  if (m.linkAlive === true) sc++;
  return sc;
}
function isIndexable(s) {
  const m = META[s.id] || {};
  if (s.closed || m.isActive === false || m.linkAlive === false) return false;
  if (FORCE_INDEX.has(String(s.id).toLowerCase().replace(/[^a-z0-9-]/g, "-"))) return true;
  return s.scope === "national" || qualityScore(s) >= 5;
}


// ── Other names people search a scheme by ──────────────────────────────────
// Only real variants of the scheme's own name (acronym, PM/CM forms, Yojana /
// Scheme, Hindi name, state) plus a few well-known nicknames. No keyword lists.
const NICKNAMES = {
  pmkisan: ["PM-KISAN", "Kisan Samman Nidhi", "PM Kisan Yojana"],
  ayushman: ["Ayushman Card", "Ayushman Bharat Yojana", "PM-JAY", "Golden Card"],
  nfsa_pds: ["Ration Card", "Free Ration Yojana"],
  e_shram: ["e-Shram Card", "Shramik Card", "ई-श्रम कार्ड"],
  maha_majhi_ladki_bahin: ["Ladki Bahin Yojana", "Ladki Bahin"],
  mp_ladli_behna: ["Ladli Behna", "Ladli Bahna Yojana"],
  pmjdy: ["Jan Dhan Account", "Jan Dhan Yojana"],
  ujjwala: ["Free Gas Connection Yojana"],
  apy: ["Atal Pension"],
  sukanya: ["Sukanya Yojana", "Sukanya Account"],
  pmsby: ["₹20 Accident Insurance"],
  pmjjby: ["₹436 Life Insurance"],
  pmsvanidhi: ["Street Vendor Loan Yojana", "SVANidhi"],
  mudra: ["Mudra Loan"],
};
const TAIL = /\b(yojana|yojna|scheme|mission|abhiyan|card|pension|nidhi|programme|program|fund|bima|insurance|loan|scholarship|portal|account)\b/i;
function aliasesOf(scheme, lang) {
  const en = String(scheme.name?.en || "").trim(), hi = String(scheme.name?.hi || "").trim();
  const shown = (lang === "hi" ? hi || en : en).toLowerCase();
  const out = [];
  const add = (x) => { x = String(x || "").replace(/\s+/g, " ").trim(); if (x.length < 3 || x.length > 70) return;
    const k = x.toLowerCase(); if (k === shown || out.some(o => o.toLowerCase() === k)) return; out.push(x); };
  const acr = (en.match(/\(([A-Z][A-Za-z0-9-]{1,14})\)/) || en.match(/[—–-]\s*([A-Z][A-Z0-9-]{2,14})$/) || [])[1];
  let base = en.replace(/\s*\([^)]*\)/g, "").replace(/\s+[—–]\s+[A-Z][A-Z0-9-]{2,14}$/, "").trim();
  const full = base;
  const head = base.split(/\s+[—–-]\s+|:\s+/)[0].trim();
  if (head !== base) { add(full); base = head; }
  const forms = [base];
  if (/\bChief Minister'?s?\b/i.test(base)) forms.push(base.replace(/\bChief Minister'?s?\b/i, "CM"), base.replace(/\bChief Minister'?s?\b/i, "Mukhyamantri"));
  if (/\bPradhan Mantri\b/i.test(base)) forms.push(base.replace(/\bPradhan Mantri\b/i, "PM"));
  else if (/^PM\b/.test(base)) forms.push(base.replace(/^PM\b/, "Pradhan Mantri"));
  if (/\bMukhya ?mantri\b/i.test(base)) forms.push(base.replace(/\bMukhya ?mantri\b/i, "CM"));
  forms.forEach((f, i) => {
    add(f);
    if (i > 0) return;
    if (/\byojana$/i.test(f)) add(f.replace(/\byojana$/i, "Scheme"));
    else if (/\bscheme$/i.test(f)) add(f.replace(/\bscheme$/i, "Yojana"));
    else if (!TAIL.test(f) && !/^[A-Z0-9-]+$/.test(f) && !/\bfor\b/i.test(f) && f.split(" ").length <= 5) add(`${f} Yojana`);
  });
  const formerly = en.match(/\bformerly\s+([^()—–,]+)/i);
  if (formerly) add(formerly[1].replace(/[.)\s]+$/, ""));
  if (acr && (acr.match(/[A-Z]/g) || []).length >= 2 && !/^(UP|MP|CG|HP|UK|J&K|WB|TN|AP)$/.test(acr)) add(acr);
  for (const n of NICKNAMES[scheme.id] || []) add(n);
  if (scheme.scope === "state" && scheme.state && base.split(" ").length <= 5 && !/\bfor\b/i.test(base) && !base.toLowerCase().includes(scheme.state.toLowerCase())) add(`${base} ${scheme.state}`);
  add(lang === "hi" ? en.replace(/\s*\((UP|MP|CG|HP|UK|WB|TN|AP)\)$/, "") : hi.replace(/\s*\([^)]*\)$/, ""));
  return out.slice(0, 7);
}

// ── Category hubs: "schemes for women", "schemes for farmers"… ───────────────
// National hub per category + a state version only where the state really has
// 5+ such schemes (never every state × category combination).
const CATS = [
  { key: "women",      re: /women|girl|maternity|widow|mahila/i,                  en: "Women",               hi: "महिलाओं",              alt: "Mahila Yojana, Ladki / Beti Yojana", altHi: "महिला योजना, बेटी योजना", icon: "👩" },
  { key: "farmers",    re: /farmer|fisher|animal|livestock|agri|dairy/i,          en: "Farmers",             hi: "किसानों",              alt: "Kisan Yojana, Krishi Yojana", altHi: "किसान योजना, कृषि योजना", icon: "🌾" },
  { key: "students",   re: /student|education|scholarship/i,                      en: "Students",            hi: "विद्यार्थियों",          alt: "Scholarship, Chhatravritti Yojana", altHi: "छात्रवृत्ति योजना, स्कॉलरशिप", icon: "📚" },
  { key: "health",     re: /health|medic|wellness|medicine/i,                     en: "Health",              hi: "स्वास्थ्य",              alt: "Swasthya Yojana, Free Treatment Schemes", altHi: "स्वास्थ्य योजना, मुफ्त इलाज योजना", icon: "🏥" },
  { key: "senior",     re: /senior|pension|old age/i,                             en: "Senior Citizens",     hi: "वरिष्ठ नागरिकों",         alt: "Old Age Pension, Vridha Pension Yojana", altHi: "वृद्धा पेंशन योजना, बुढ़ापा पेंशन", icon: "👴" },
  { key: "business",   re: /business|entrepreneur|startup|self.?employ|street vendor|livelihood|artisan|weaver/i, en: "Business & Self-Employment", hi: "व्यापार व स्वरोज़गार", alt: "Swarozgar Yojana, Business Loan Yojana", altHi: "स्वरोज़गार योजना, लोन योजना", icon: "💼" },
  { key: "housing",    re: /housing/i,                                            en: "Housing",             hi: "आवास",                 alt: "Awas Yojana, Ghar Yojana", altHi: "आवास योजना, घर योजना", icon: "🏠" },
  { key: "workers",    re: /labour|worker|employment|skill|unemploy|construction/i, en: "Workers & Jobs",    hi: "श्रमिकों व रोज़गार",       alt: "Shramik Yojana, Rozgar Yojana", altHi: "श्रमिक योजना, रोज़गार योजना", icon: "👷" },
  { key: "disability", re: /disab|divyang/i,                                       en: "Persons with Disabilities", hi: "दिव्यांगजनों",     alt: "Divyang Yojana, Viklang Pension", altHi: "दिव्यांग योजना, विकलांग पेंशन", icon: "♿" },
];
const catsOf = s => CATS.filter(c => c.re.test(String(s?.tag?.en || "")));
const stateKey = st => String(st || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const catFile = (c, st) => st ? `cat-${c.key}-${stateKey(st)}` : `cat-${c.key}`;
const CAT_HUBS = [];            // { file, cat, state|null, schemes }
const CAT_STATE = new Set();    // files of state × category hubs that exist
for (const c of CATS) {
  const all = SCHEME_DB.filter(s => catsOf(s).includes(c));
  CAT_HUBS.push({ file: catFile(c), cat: c, state: null, schemes: all });
  const byState = new Map();
  for (const s of all) if (s.scope === "state" && s.state) { if (!byState.has(s.state)) byState.set(s.state, []); byState.get(s.state).push(s); }
  for (const [st, list] of byState) if (list.length >= 5) { CAT_HUBS.push({ file: catFile(c, st), cat: c, state: st, schemes: list }); CAT_STATE.add(catFile(c, st)); }
}

// Money for titles: "₹6,000/year", "₹4 lakh"…
function moneyOf(text) {
  const m = String(text || "").match(/₹\s?[\d,.]+(?:\s?(?:lakh|lac|crore|cr|k|L))?(?:\s?(?:\/|per |a |प्रति )\s?(?:month|year|yr|mo|annum|माह|महीना|वर्ष|साल))?/i);
  return m ? m[0].replace(/\s+/g, " ").trim() : "";
}
// Only government links are shown as "official" (some data links point to blogs).
function officialOnly(s, lang) {
  for (const raw of [s.apply?.en, s.apply?.[lang], s.apply?.hi]) {
    const u = officialUrl(raw);
    if (u && isOfficialUrl(u)) return u;
  }
  return "";
}

// ── Slug helper ────────────────────────────────────────────────────────────────
// Use the scheme's own `id` field — already unique, already URL-safe (lowercase,
// no spaces) based on how schemesData.js is written (e.g. "pmkisan", "ayushman").
function slugify(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

// ── HTML escape (for safety — scheme data is trusted but good practice) ────────
function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Turn an apply value into a usable absolute URL, or null for plain text.
function officialUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  let candidate = /^https?:\/\//i.test(t) ? t.split(/\s/)[0] : t.split(/[\s(—–,]/)[0];
  if (!/^https?:\/\//i.test(candidate)) {
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(candidate)) return null;
    candidate = `https://${candidate}`;
  }
  try { return new URL(candidate).href; } catch { return null; }
}

// ── Shared footer: who we are + trust links ─────────────────────────────────
function trustFooter(isHindi) {
  return `<footer>
      ${isHindi ? "YojanaSahay एक स्वतंत्र, मुफ्त नागरिक मंच है — भारत सरकार या किसी राज्य सरकार से संबद्ध नहीं।" : "YojanaSahay is a free, independent civic-tech guide — not affiliated with the Government of India or any state government."}
      <div class="trust"><a href="/about.html">${isHindi ? "हमारे बारे में" : "About"}</a>·<a href="/how-we-verify.html">${isHindi ? "हम जानकारी कैसे जांचते हैं" : "How we verify"}</a>·<a href="/faq.html">FAQ</a>·<a href="/add-widget.html">${isHindi ? "मुफ्त विजेट" : "Free widget"}</a>·<a href="/contact.html">${isHindi ? "संपर्क / सुधार" : "Contact & corrections"}</a>·<a href="/terms.html">${isHindi ? "शर्तें" : "Terms"}</a>·<a href="/privacy.html">${isHindi ? "गोपनीयता" : "Privacy"}</a>·<a href="/press.html">${isHindi ? "मीडिया" : "Press"}</a>·<a href="/poster.html">${isHindi ? "मुफ़्त पोस्टर" : "Free posters"}</a></div>
      <a href="${SITE_URL}/">yojanasahay.vercel.app</a>
    </footer>`;
}
const SHARED_CSS = `:root{color-scheme:light dark;} *{box-sizing:border-box;}
  body{margin:0;font-family:'Noto Sans',-apple-system,system-ui,sans-serif;background:#fafaf9;color:#1c1917;}
  .wrap{max-width:720px;margin:0 auto;padding:28px 20px 60px;}
  h1{font-size:24px;line-height:1.3;margin:0 0 8px;font-weight:800;} h2{font-size:16px;margin:24px 0 10px;}
  p, li{font-size:14.5px;line-height:1.65;color:#44403c;} p.lead{color:#57534e;}
  ul,ol{padding-left:20px;} li{margin:6px 0;}
  .shots{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;} .shots img{width:140px;height:auto;border-radius:12px;border:1px solid #e7e5e4;display:block;}
  li a{color:#c2410c;font-weight:700;text-decoration:none;} li span{color:#57534e;}
  a{color:#c2410c;}
  .cta{display:block;text-align:center;text-decoration:none;background:#FF9933;color:#fff;font-weight:700;padding:14px;border-radius:12px;margin:22px 0;}
  .others{font-size:13px;line-height:2;color:#78716c;} .others a{color:#78716c;}
  .crumbs{font-size:12.5px;color:#78716c;margin-bottom:12px;} .crumbs a{color:#c2410c;text-decoration:none;}
  .notice{font-size:12.5px;line-height:1.5;color:#57534e;background:#f5f5f4;border:1px solid #e7e5e4;border-radius:10px;padding:9px 12px;margin:0 0 16px;}
  .catlinks a{display:inline-block;margin:4px 6px 0 0;padding:5px 10px;border:1px solid #fed7aa;border-radius:99px;font-size:12.5px;color:#9a3412;text-decoration:none;background:#fff7ed;}
  footer{margin-top:40px;font-size:12px;color:#a8a29e;text-align:center;line-height:1.8;} footer a{color:#a8a29e;} .trust a{margin:0 6px;}
  @media (prefers-color-scheme: dark){ body{background:#111;color:#f5f5f4;} p,li,li span{color:#d6d3d1;} p.lead{color:#a8a29e;} .notice{background:#1c1917;border-color:#292524;color:#d6d3d1;} }`;
const NOTICE = (isHindi) => `<p class="notice">${isHindi
  ? "ℹ️ YojanaSahay एक मुफ्त, स्वतंत्र गाइड है — सरकारी वेबसाइट नहीं। हम कभी पैसे या OTP नहीं मांगते।"
  : "ℹ️ YojanaSahay is a free, independent guide — not a government website. We never ask for money or OTP."}</p>`;
function head({ lang, title, desc, url, enUrl, hiUrl, robots = "index, follow, max-image-preview:large" }) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${url}" />
${enUrl && hiUrl ? `<link rel="alternate" hreflang="en-IN" href="${enUrl}" />
<link rel="alternate" hreflang="hi-IN" href="${hiUrl}" />
<link rel="alternate" hreflang="x-default" href="${enUrl}" />` : ""}
<meta name="robots" content="${robots}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<link rel="icon" href="/favicon.ico" />
<style>${SHARED_CSS}</style>
</head>`;
}

// ── Printable posters (/poster.html) ─────────────────────────────────────────
// A4 poster for panchayat offices, CSCs, ration shops, colleges: a QR code that
// opens the eligibility checker. Counts and example schemes come from the data
// at every build, per state.
function renderPoster() {
  const live = SCHEME_DB.filter(s => !s.closed && s.name?.en);
  const pick = list => list
    .filter(s => benefitKind(s) === "yearly" && (Number(s.annual) || 0) > 0 && !nicheAudience(s))
    .sort((a, b) => (b.annual || 0) - (a.annual || 0))
    .slice(0, 3).map(s => ({ en: String(s.name.en).replace(/\s*\([^)]*\)\s*$/, ""), hi: String(s.name.hi || s.name.en).replace(/\s*\([^)]*\)\s*$/, "") }));
  const central = live.filter(s => s.scope === "national");
  const FAMOUS = ["pmkisan", "ayushman", "pmawas-rural", "pmujjwala", "nfsa-pds"];
  const centralTop = FAMOUS.map(id => central.find(s => s.id === id)).filter(Boolean).slice(0, 3)
    .map(s => ({ en: String(s.name.en).replace(/\s*\([^)]*\)\s*$/, ""), hi: String(s.name.hi || s.name.en).replace(/\s*\([^)]*\)\s*$/, "") }));
  const states = {};
  for (const s of live) if (s.scope === "state" && s.state) (states[s.state] ||= []).push(s);
  const data = { central: central.length, centralTop, states: Object.fromEntries(Object.entries(states).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, { n: v.length, top: pick(v) }])) };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Free Printable Posters – YojanaSahay</title>
<meta name="description" content="Print a free A4 poster with a QR code that opens the YojanaSahay scheme checker — for panchayat offices, CSCs, ration shops, schools and colleges. Hindi and English, any state." />
<link rel="canonical" href="${SITE_URL}/poster.html" />
<meta property="og:title" content="Free printable scheme-checker posters – YojanaSahay" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<link rel="icon" href="/favicon.ico" />
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:'Noto Sans','Noto Sans Devanagari',-apple-system,system-ui,sans-serif;background:#e7e5e4;color:#1c1917}
  .tools{max-width:820px;margin:0 auto;padding:18px 16px 6px}
  .tools h1{font-size:20px;margin:0 0 4px} .tools p{font-size:13.5px;color:#57534e;margin:0 0 12px;line-height:1.55}
  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px}
  label{font-size:12px;font-weight:700;color:#44403c;display:flex;flex-direction:column;gap:4px;flex:1 1 160px}
  select{font:inherit;font-size:14px;padding:9px 10px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;color:#1c1917}
  .chk{flex-direction:row;align-items:center;gap:6px;flex:0 0 auto;font-weight:600}
  button{font:inherit;font-weight:800;font-size:15px;padding:11px 18px;border-radius:12px;border:0;background:#FF9933;color:#fff;cursor:pointer}
  .tip{font-size:12px;color:#78716c;margin:0 0 14px}
  .wrap{display:flex;justify-content:center;padding:0 12px 30px;overflow:hidden}
  .sheet{width:210mm;height:297mm;background:#fff;box-shadow:0 6px 30px rgba(0,0,0,.18);position:relative;overflow:hidden;display:flex;flex-direction:column;transform-origin:top center}
  .band{height:9mm;background:linear-gradient(90deg,#FF9933 0 33.3%,#fff 33.3% 66.6%,#138808 66.6%)}
  .in{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:8mm 15mm 7mm}
  .brand{display:flex;align-items:center;gap:4mm;margin-bottom:4mm}
  .brand img{width:16mm;height:16mm;border-radius:4mm}
  .brand b{font-size:9mm;letter-spacing:.2mm;color:#1B2A4A}
  .kick{font-size:4.3mm;font-weight:700;color:#C2410C;letter-spacing:.3mm;margin-bottom:4mm}
  .h1{font-size:11mm;line-height:1.18;font-weight:900;color:#111;margin:0 0 3mm}
  .h1en{font-size:6.2mm;font-weight:700;color:#44403c;margin:0 0 4mm}
  .sub{font-size:5mm;color:#44403c;line-height:1.45;margin:0 0 4mm}
  .qrbox{display:flex;align-items:center;justify-content:center;gap:9mm;margin:0 0 4mm}
  .qr{border:1.6mm solid #FF9933;border-radius:6mm;padding:3mm;background:#fff}
  .qr img{display:block;width:66mm;height:66mm}
  .qr.small img{width:30mm;height:30mm}
  .qrl{font-size:5.6mm;font-weight:900;margin-top:3mm;color:#111}
  .qrs{font-size:3.8mm;color:#57534e;margin-top:1mm}
  .stats{display:flex;gap:5mm;justify-content:center;margin:0 0 3mm;flex-wrap:wrap}
  .stat{border:0.5mm solid #e7e5e4;border-radius:4mm;padding:3mm 6mm;background:#fafaf9}
  .stat b{display:block;font-size:9mm;color:#138808;line-height:1.1} .stat span{font-size:4mm;color:#44403c}
  .eg{font-size:4.2mm;color:#44403c;line-height:1.5;margin:0 0 4mm;max-width:170mm}
  .steps{display:flex;gap:4mm;justify-content:center;margin:0 0 4mm}
  .step{flex:1;max-width:56mm;font-size:4.2mm;line-height:1.35;color:#1c1917;background:#FFF7ED;border-radius:4mm;padding:3mm}
  .step i{font-style:normal;display:block;font-size:6mm;font-weight:900;color:#FF9933}
  .foot{margin-top:auto;width:100%;border-top:0.5mm solid #e7e5e4;padding-top:4mm}
  .url{font-size:5.6mm;font-weight:900;color:#1B2A4A}
  .warn{font-size:3.9mm;color:#7f1d1d;background:#FEF2F2;border-radius:3mm;padding:2.5mm 4mm;margin-top:3mm;line-height:1.45}
  .fine{font-size:3.2mm;color:#78716c;margin-top:2.5mm}
  @page{size:A4 portrait;margin:0}
  @media print{body{background:#fff}.tools{display:none}.wrap{padding:0}.sheet{box-shadow:none;transform:none!important;margin:0!important}}
</style>
</head>
<body>
<div class="tools">
  <h1>Free posters — print and paste</h1>
  <p>Put one up at a panchayat office, CSC, ration shop, bank, school or college. People scan the QR code with their phone camera and check which schemes they qualify for — free, in Hindi and English.</p>
  <div class="row">
    <label>Language
      <select id="lang"><option value="hi">हिंदी (with English line)</option><option value="en">English</option></select>
    </label>
    <label>State on the poster
      <select id="state"><option value="">All India (Central schemes)</option></select>
    </label>
    <label class="chk"><input type="checkbox" id="tg" checked> Telegram QR</label>
    <button type="button" onclick="window.print()">🖨️ Print / Save PDF</button>
  </div>
  <p class="tip">Tip: in the print window choose paper size A4, margins “None”, and turn on “Background graphics”. Save as PDF to share on WhatsApp.</p>
</div>
<div class="wrap"><div class="sheet" id="sheet">
  <div class="band"></div>
  <div class="in">
    <div class="brand"><img src="/press/yojana-sahay-logo-512.png" alt=""><b id="brand">योजना सहाय</b></div>
    <div class="kick" id="kick"></div>
    <div class="h1" id="h1"></div>
    <div class="h1en" id="h1en"></div>
    <div class="sub" id="sub"></div>
    <div class="qrbox">
      <div><div class="qr"><img src="/poster/qr-checker.svg" alt="QR code: YojanaSahay scheme checker"></div><div class="qrl" id="qrl"></div><div class="qrs" id="qrs"></div></div>
      <div id="tgbox"><div class="qr small"><img src="/poster/qr-telegram.svg" alt="QR code: YojanaSahay on Telegram"></div><div class="qrs" id="tgl" style="font-weight:800;color:#0369A1"></div></div>
    </div>
    <div class="stats" id="stats"></div>
    <div class="eg" id="eg"></div>
    <div class="steps" id="steps"></div>
    <div class="foot">
      <div class="url">yojanasahay.vercel.app</div>
      <div class="warn" id="warn"></div>
      <div class="fine" id="fine"></div>
    </div>
  </div>
</div></div>
<script>
var D=${json};
var S=document.getElementById("state");
Object.keys(D.states).forEach(function(k){var o=document.createElement("option");o.value=k;o.textContent=k;S.appendChild(o);});
function $(i){return document.getElementById(i);}
function render(){
  var hi=$("lang").value==="hi", st=S.value, sd=st&&D.states[st];
  var T=function(e,h){return hi?h:e;};
  $("brand").textContent=T("YojanaSahay","योजना सहाय");
  $("kick").textContent=T("FREE · INDEPENDENT · IN HINDI & ENGLISH","मुफ़्त · स्वतंत्र · हिंदी और English में");
  $("h1").textContent=T("Which government schemes can you get?","आपको कौन सी सरकारी योजनाएं मिल सकती हैं?");
  $("h1en").textContent=hi?"Which government schemes can you get? Check free.":"";
  $("h1en").style.display=hi?"":"none";
  $("sub").textContent=T("Answer a few simple questions — find out in 2 minutes. Pensions, scholarships, farmer support, housing, health cover and more.","कुछ आसान सवालों के जवाब दें — 2 मिनट में जानें। पेंशन, छात्रवृत्ति, किसान सहायता, मकान, इलाज और भी बहुत कुछ।");
  $("qrl").textContent=T("📱 Scan with your phone camera","📱 फ़ोन के कैमरे से स्कैन करें");
  $("qrs").textContent=T("Opens the free scheme checker","मुफ़्त योजना जांच खुलेगी");
  $("tgbox").style.display=$("tg").checked?"":"none";
  $("tgl").textContent=T("or on Telegram: @YojanaSahayBot","या Telegram पर: @YojanaSahayBot");
  var stats='<div class="stat"><b>'+D.central+'</b><span>'+T("Central Government schemes","केंद्र सरकार की योजनाएं")+'</span></div>';
  if(sd) stats+='<div class="stat"><b>'+sd.n+'</b><span>'+T(st+" schemes",st+" की योजनाएं")+'</span></div>';
  $("stats").innerHTML=stats;
  var top=(sd&&sd.top.length?sd.top:D.centralTop).map(function(x){return hi?x.hi:x.en;});
  $("eg").textContent=top.length?T("For example: ","जैसे: ")+top.join(" · "):"";
  $("steps").innerHTML=[T("Scan the QR code","QR कोड स्कैन करें"),T("Answer a few questions","कुछ सवालों के जवाब दें"),T("See your schemes and how to apply","अपनी योजनाएं और आवेदन का तरीका देखें")]
    .map(function(t,i){return '<div class="step"><i>'+(i+1)+'</i>'+t+'</div>';}).join("");
  $("warn").textContent=T("⚠️ Applying for a scheme is free. Never pay anyone or share an OTP. Apply only on the official website or at the office.","⚠️ योजना का आवेदन मुफ़्त है। किसी को पैसे या OTP न दें। आवेदन सिर्फ़ आधिकारिक वेबसाइट या कार्यालय में करें।");
  $("fine").textContent=T("YojanaSahay is a free, independent guide — not a government website or service.","YojanaSahay एक मुफ़्त, स्वतंत्र गाइड है — सरकारी वेबसाइट या सेवा नहीं।");
  fit();
}
function fit(){var w=document.querySelector(".wrap").clientWidth-24, sh=$("sheet"), px=sh.offsetWidth, k=Math.min(1,w/px); sh.style.transform="scale("+k+")"; sh.style.marginBottom=(k<1?-(sh.offsetHeight*(1-k)):0)+"px";}
["lang","state","tg"].forEach(function(i){$(i).addEventListener("change",render);});
window.addEventListener("resize",fit);
try{var q=new URLSearchParams(location.search); if(q.get("state")&&D.states[q.get("state")]) S.value=q.get("state"); if(q.get("lang")==="en") $("lang").value="en";}catch(e){}
render();
</script>
</body>
</html>`;
}

// ── Category hubs ("Schemes for Women", "Farmer schemes in Bihar") ──────────
function renderCatHub(hub, lang) {
  const isHindi = lang === "hi";
  const lp = isHindi ? "yojana" : "schemes";
  const c = hub.cat, n = hub.schemes.length;
  const place = hub.state || (isHindi ? "भारत" : "India");
  const title = isHindi
    ? `${hub.state ? hub.state + " में " : ""}${c.hi} के लिए सरकारी योजनाएं ${YEAR} – ${n} योजनाओं की सूची`
    : `${hub.state ? hub.state + " " : ""}Government Schemes for ${c.en} ${YEAR} – ${n} Schemes List`;
  const desc = isHindi
    ? `${place} में ${c.hi} के लिए ${n} सरकारी योजनाएं — लाभ, कौन आवेदन कर सकता है, दस्तावेज़ और आवेदन का तरीका। मुफ्त में अपनी पात्रता जांचें।`
    : `${n} government schemes for ${c.en.toLowerCase()} in ${place} — benefits, who can apply, documents and how to apply. Check your eligibility free.`;
  const url = `${SITE_URL}/${lp}/${hub.file}.html`;
  // Central first, then by state; biggest yearly value first inside each group.
  const groups = new Map();
  for (const s of [...hub.schemes].sort((a, b) => (b.annual || 0) - (a.annual || 0))) {
    const g = s.scope === "state" ? s.state : (isHindi ? "केंद्र सरकार" : "Central Government");
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(s);
  }
  const order = [...groups.keys()].sort((a, b) => (/^(Central|केंद्र)/.test(a) ? -1 : /^(Central|केंद्र)/.test(b) ? 1 : a.localeCompare(b)));
  const li = x => `      <li><a href="/${lp}/${slugify(x.id)}.html">${esc(x.name[lang] || x.name.en)}</a><span> — ${esc(x.benefit?.[lang] || x.benefit?.en || "")}</span></li>`;
  const stateHubs = !hub.state ? CAT_HUBS.filter(h => h.cat === c && h.state).sort((a, b) => a.state.localeCompare(b.state)) : [];
  const crumbs = [`<a href="/">YojanaSahay</a>`, hub.state ? `<a href="/${lp}/${catFile(c)}.html">${esc(isHindi ? c.hi + " के लिए योजनाएं" : "Schemes for " + c.en)}</a>` : "", esc(hub.state || (isHindi ? c.hi + " के लिए योजनाएं" : "Schemes for " + c.en))].filter(Boolean).join(" › ");
  return `${head({ lang: isHindi ? "hi" : "en", title, desc, url, enUrl: `${SITE_URL}/schemes/${hub.file}.html`, hiUrl: `${SITE_URL}/yojana/${hub.file}.html` })}
<body><div class="wrap">
  <nav class="crumbs">${crumbs}</nav>
  ${NOTICE(isHindi)}
  <h1>${c.icon} ${esc(isHindi ? `${hub.state ? hub.state + " में " : ""}${c.hi} के लिए सरकारी योजनाएं ${YEAR}` : `Government Schemes for ${c.en}${hub.state ? " in " + hub.state : ""} ${YEAR}`)}</h1>
  <p class="lead">${esc(desc)}</p>
  <p class="lead">${isHindi ? `इन्हें ${c.altHi} भी कहा जाता है।` : `Also searched as ${c.alt}${hub.state ? " in " + hub.state : ""}.`}</p>
  <a class="cta" href="${SITE_URL}/">${isHindi ? "ऐप में देखें आप किनके पात्र हैं →" : "Check which ones you qualify for →"}</a>
  ${stateHubs.length ? `<h2>${isHindi ? "राज्य के अनुसार" : "By state"}</h2>
  <p class="catlinks">${stateHubs.map(h => `<a href="/${lp}/${h.file}.html">${esc(h.state)} (${h.schemes.length})</a>`).join("")}</p>` : ""}
${order.map(g => `  <h2>${esc(g)} (${groups.get(g).length})</h2>
  <ul>
${groups.get(g).map(li).join("\n")}
  </ul>`).join("\n")}
  <h2>${isHindi ? "दूसरी श्रेणियां" : "Other categories"}</h2>
  <p class="catlinks">${CATS.filter(x => x !== c).map(x => `<a href="/${lp}/${catFile(x)}.html">${x.icon} ${esc(isHindi ? x.hi : x.en)}</a>`).join("")}</p>
  ${trustFooter(isHindi)}
</div></body></html>`;
}

// ── Trust pages + FAQ (bilingual). Facts here must match the app:
//    reports = Profile → "Report / Query" (sign-in needed); email below;
//    FAQ text comes from src/faqData.js (same as the in-app FAQ).
const SUPPORT_EMAIL = "yojanasahayofficial@gmail.com";
const MAIL = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
function renderTrust(kind) {
  // Counts come from src/schemeStats.js (recounted on every build).
  const nRounded = SCHEME_COUNT_LABEL.replace(/\+$/, "");
  const nStates = STATE_COUNT;
  const nCentral = CENTRAL_COUNT;
  const pages = {
    terms: {
      title: "Terms of Service – YojanaSahay",
      desc: "The terms for using the YojanaSahay app and website: an independent, free guide to Indian government schemes — not a government service.",
      body: `
  <h1>${esc(TERMS.en.title)}</h1>
  <p class="lead">Effective date: 22 October 2026 · The same terms are shown in the app under About.</p>
  <ol>
${TERMS.en.points.map(t => `    <li>${esc(t)}</li>`).join("\n")}
  </ol>
  <p>Questions about these terms: ${MAIL}. See also our <a href="/privacy.html">Privacy Policy</a>.</p>
  <h2>${esc(TERMS.hi.title)} (हिंदी)</h2>
  <ol>
${TERMS.hi.points.map(t => `    <li>${esc(t)}</li>`).join("\n")}
  </ol>`,
    },
    press: {
      title: "Press & Media Kit – YojanaSahay",
      desc: "Logos, screenshots, key facts and descriptions of YojanaSahay — the free app that helps people in India find the government schemes they qualify for.",
      body: `
  <h1>Press & media kit</h1>
  <p class="lead">Everything you need to write about YojanaSahay — free to use in articles, videos and posts about the app.</p>
  <h2>In one line</h2>
  <p><strong>YojanaSahay helps people in India find the government schemes they qualify for — free, in Hindi and English.</strong></p>
  <h2>Short description</h2>
  <p>YojanaSahay is a free app and website that brings together ${nRounded}+ Central and State government welfare schemes. People answer a few simple questions and see the schemes they may be eligible for — pensions, scholarships, farmer support, housing, health cover and more — with who can apply, the documents needed and the official link to apply. An AI assistant answers questions in Hindi, English or Hinglish, by text or voice.</p>
  <h2>Key facts</h2>
  <ul>
    <li><strong>${nRounded}+ schemes</strong> — ${nCentral} Central Government schemes and State schemes from <strong>${nStates} states and union territories</strong></li>
    <li><strong>Free</strong> — no ads, no charges to find schemes or check eligibility</li>
    <li><strong>Hindi and English</strong>, with voice input</li>
    <li>Official government links on every scheme, re-checked automatically on a regular schedule</li>
    <li>Available as a website, an Android app and a Telegram bot (@YojanaSahayBot)</li>
    <li>Built in India by Sahnawaz Ahmed Laskar</li>
  </ul>
  <h2>Please note</h2>
  <p>YojanaSahay is an independent civic-tech app. It is <strong>not a government website</strong> and is not affiliated with the Government of India or any state government. It does not take applications — people always apply on the official government website or at the office. Please describe it as an "independent app", not as a government service.</p>
  <h2>Name</h2>
  <p>Written <strong>Yojana Sahay</strong> (two words) in text, and <strong>YojanaSahay</strong> in handles and web addresses. In Hindi: <strong>योजना सहाय</strong>.</p>
  <h2>Logos and images</h2>
  <ul>
    <li><a href="/press/yojana-sahay-logo-1024.png" download>App logo — 1024 × 1024 PNG</a> · <a href="/press/yojana-sahay-logo-512.png" download>512 × 512 PNG</a></li>
    <li><a href="/press/yojana-sahay-banner-1024x500.jpg" download>Banner — 1024 × 500</a> · <a href="/og-image.png" download>Social image — 1200 × 630</a></li>
  </ul>
  <p>Please don't change the colours or shape of the logo, or combine it with government emblems.</p>
  <h2>Screenshots</h2>
  <div class="shots">
    <a href="/press/screenshot-1-home.jpg" download><img src="/press/screenshot-1-home.jpg" alt="Home screen" loading="lazy" width="216" height="384"></a>
    <a href="/press/screenshot-2-eligibility.jpg" download><img src="/press/screenshot-2-eligibility.jpg" alt="Eligibility check" loading="lazy" width="216" height="384"></a>
    <a href="/press/screenshot-3-scheme-details.jpg" download><img src="/press/screenshot-3-scheme-details.jpg" alt="Scheme details" loading="lazy" width="216" height="384"></a>
    <a href="/press/screenshot-4-ai-assistant.jpg" download><img src="/press/screenshot-4-ai-assistant.jpg" alt="AI assistant" loading="lazy" width="216" height="384"></a>
    <a href="/press/screenshot-5-search.jpg" download><img src="/press/screenshot-5-search.jpg" alt="Search" loading="lazy" width="216" height="384"></a>
  </div>
  <h2>Links</h2>
  <ul>
    <li>Website: <a href="${SITE_URL}/">${SITE_URL.replace(/^https:\/\//, "")}</a></li>
    <li>Android app: on Google Play — link here at launch</li>
    <li>Open data — the full scheme list as <a href="/data/schemes.json">JSON</a> or <a href="/data/schemes.csv">CSV</a> (ODC-By licence, please credit YojanaSahay)</li>
    <li>Free printable posters with a QR code (Hindi / English, any state): <a href="/poster.html">yojanasahay.vercel.app/poster.html</a></li>
    <li>Telegram bot: <a href="https://t.me/YojanaSahayBot">@YojanaSahayBot</a> — the same eligibility check inside Telegram, in English and Hindi</li>
    <li>How the information is checked: <a href="/how-we-verify.html">How we verify</a></li>
  </ul>
  <h2>Media contact</h2>
  <p>${MAIL} — we usually reply within 24 hours.</p>
  <h2>मीडिया के लिए (हिंदी)</h2>
  <p>योजना सहाय एक मुफ़्त ऐप और वेबसाइट है जो भारत के लोगों को उनकी पात्र सरकारी योजनाएं ढूंढने में मदद करती है — केंद्र और ${nStates} राज्यों/केंद्र शासित प्रदेशों की ${nRounded}+ योजनाएं, हिंदी और English में। यह एक स्वतंत्र ऐप है, सरकारी वेबसाइट नहीं। लोगो और स्क्रीनशॉट ऊपर दिए गए हैं। संपर्क: ${SUPPORT_EMAIL}</p>`,
    },
    about: {
      title: "About YojanaSahay – Free Government Scheme Finder for India",
      desc: "What YojanaSahay is, who built it and how it helps people in India find the government schemes they qualify for — free, in Hindi and English.",
      body: `
  <h1>About YojanaSahay</h1>
  <p class="lead">YojanaSahay is a free app and website that helps people in India find the government schemes they can get — in simple Hindi and English.</p>
  <h2>What it does</h2>
  <ul>
    <li><strong>${SCHEME_COUNT_LABEL} schemes in one place</strong> — Central Government schemes plus State schemes from ${STATE_COUNT} states and union territories: pensions, scholarships, farmer support, housing, health cover, loans and more.</li>
    <li><strong>Eligibility Checker</strong> — answer a few simple questions and see the schemes you qualify for, with the money or benefit for each.</li>
    <li><strong>Clear scheme details</strong> — who can apply, documents needed, how to apply and the official government link.</li>
    <li><strong>AI assistant</strong> — ask in Hindi, English or Hinglish, by typing or by voice. It can check your eligibility in the chat, explain why you do or don't qualify, make a document checklist and track your applications.</li>
    <li><strong>Document checklist, My Applications and deadline alerts</strong> to help you apply on time.</li>
  </ul>
  <h2>Who built it</h2>
  <p>YojanaSahay is built and run by <strong>Sahnawaz Ahmed Laskar</strong>, an independent developer from Assam, India. It is a civic-tech project — <strong>not a government website</strong>, and not connected to the Government of India or any state government.</p>
  <h2>What we never do</h2>
  <ul>
    <li>We never charge you to find schemes or check eligibility.</li>
    <li>We never ask for money, OTP, bank details or your Aadhaar number. Anyone asking for these in our name is a scammer.</li>
    <li>We never take or submit applications — you always apply on the official government website or at the office.</li>
  </ul>
  <p>Questions? Read the <a href="/faq.html">FAQ</a> or <a href="/contact.html">contact us</a>.</p>
  <h2>हमारे बारे में (हिंदी)</h2>
  <p>योजना सहाय एक मुफ़्त ऐप और वेबसाइट है जो भारत के लोगों को उनकी पात्र सरकारी योजनाएं ढूंढने में मदद करती है — केंद्र और ${STATE_COUNT} राज्यों/केंद्र शासित प्रदेशों की ${SCHEME_COUNT_LABEL} योजनाएं, आसान हिंदी और English में। इसे असम के स्वतंत्र डेवलपर सहनवाज़ अहमद लस्कर ने बनाया है। यह सरकारी वेबसाइट नहीं है। हम कभी पैसे, OTP या आधार नंबर नहीं मांगते, और आवेदन हमेशा आधिकारिक सरकारी वेबसाइट या कार्यालय में ही होता है।</p>`,
    },
    "how-we-verify": {
      title: "How YojanaSahay Checks Scheme Information",
      desc: "Where YojanaSahay's scheme information comes from, how new schemes are added, how official links are checked automatically and how mistakes are corrected.",
      body: `
  <h1>How we check scheme information</h1>
  <p class="lead">Scheme rules change. This is how we keep the information correct — and how you can tell us when something is wrong.</p>
  <h2>Where the information comes from</h2>
  <ul>
    <li>Official government websites, scheme guidelines and notifications from the ministry or state department that runs each scheme.</li>
    <li>Official announcements (such as PIB and state information departments) for new schemes and changes.</li>
  </ul>
  <h2>How new schemes are added</h2>
  <p>New schemes are found from official announcements, from each state's own list of schemes, and from what people search for or request in the app. A scheme is published only after its details are checked against an official government (.gov.in / .nic.in) page; before it goes live on its own, the amount must also not disagree with a second official page. Anything that is not fully clear is reviewed by hand first.</p>
  <h2>Automatic checks</h2>
  <p>The official page of every scheme is re-read automatically on a regular schedule, and each scheme page shows the date it was last checked. Links that stop working are repaired, deadlines are updated, schemes that close are marked as closed, and a changed benefit amount is flagged and corrected after review.</p>
  <h2>Eligibility results</h2>
  <p>The Eligibility Checker applies each scheme's published conditions (state, age, income, category and so on) to your answers. Results are a guide — the final decision is always made by the government office that runs the scheme.</p>
  <h2>AI assistant</h2>
  <p>The in-app AI assistant answers from this scheme list and official sources. It can make mistakes, so always confirm important details on the official website.</p>
  <h2>Found a mistake?</h2>
  <p>In the app, sign in and go to <strong>Profile → “Report / Query”</strong>, or email ${MAIL}. Every report is acknowledged within 24 hours.</p>
  <h2>हम जानकारी कैसे जांचते हैं (हिंदी)</h2>
  <p>जानकारी आधिकारिक सरकारी वेबसाइटों, योजना दिशानिर्देशों और अधिसूचनाओं से ली जाती है। नई योजना तभी प्रकाशित होती है जब उसकी जानकारी आधिकारिक सरकारी (.gov.in / .nic.in) पेज से जांच ली जाए। हर योजना का आधिकारिक लिंक नियमित रूप से अपने आप जांचा जाता है, और पेज पर आखिरी जांच की तारीख दिखती है। कोई गलती दिखे तो ऐप में साइन इन करके प्रोफाइल → “रिपोर्ट / सवाल” से बताएं, या ${SUPPORT_EMAIL} पर ईमेल करें।</p>`,
    },
    contact: {
      title: "Contact YojanaSahay – Report a Mistake or Ask for Help",
      desc: "Contact YojanaSahay to report wrong scheme information, request a missing scheme, ask a question or get help with the app.",
      body: `
  <h1>Contact & corrections</h1>
  <p class="lead">Tell us about wrong information, a missing scheme, a question, or a problem with the app.</p>
  <h2>Ways to reach us</h2>
  <ul>
    <li><strong>Wrong scheme information?</strong> Open the scheme in the app and tap <strong>“⚑ Something wrong with this scheme?”</strong> at the bottom — one tap, no sign-in needed.</li>
    <li><strong>In the app</strong> — sign in, open the <strong>Profile</strong> tab and tap <strong>“Report / Query”</strong>. You can report a bug, request a scheme, ask a question or share feedback, and follow the status of your request there.</li>
    <li><strong>Email</strong> — ${MAIL}</li>
  </ul>
  <p>Every report is acknowledged within 24 hours.</p>
  <h2>Delete your account</h2>
  <p>In the app: <strong>Profile → Delete account</strong> — deleted immediately. Or email ${MAIL} from your registered email with the subject “Data Deletion Request” — done within 7 working days. <a href="/delete-account.html">More about account deletion</a>.</p>
  <h2>Please note</h2>
  <ul>
    <li>We cannot check or change your application status — only the department that runs the scheme can. Use the official website or helpline shown on each scheme page.</li>
    <li>We will never call you asking for an OTP or money. If someone does, it is a scam.</li>
  </ul>
  <p>Many answers are already in the <a href="/faq.html">FAQ</a>.</p>
  <h2>संपर्क (हिंदी)</h2>
  <p>ऐप में साइन इन करें, <strong>प्रोफाइल</strong> टैब खोलें और <strong>“रिपोर्ट / सवाल”</strong> दबाएं — बग बताएं, योजना जोड़ने का अनुरोध करें, सवाल पूछें या सुझाव दें। या ईमेल करें: ${SUPPORT_EMAIL}। आवेदन की स्थिति केवल संबंधित सरकारी विभाग ही बता सकता है। हम कभी OTP या पैसे के लिए फ़ोन नहीं करते।</p>`,
    },
  };
  const p = pages[kind];
  return `${head({ lang: "en", title: p.title, desc: p.desc, url: `${SITE_URL}/${kind}.html` })}
<body><div class="wrap">
  <nav class="crumbs"><a href="/">YojanaSahay</a> › ${esc(p.title.split(" – ")[0])}</nav>
${p.body}
  <a class="cta" href="${SITE_URL}/">Find schemes you qualify for →</a>
  ${trustFooter(false)}
</div></body></html>`;
}

// ── Public FAQ page — same text as the in-app FAQ (src/faqData.js) ──────────
function renderFaq() {
  const CAT = { about: ["About the app", "ऐप के बारे में"], privacy: ["Privacy & data", "गोपनीयता"], schemes: ["Schemes & eligibility", "योजनाएं"], ai: ["AI assistant", "AI सहायक"], account: ["Account & support", "अकाउंट और सहायता"] };
  const section = (lang) => {
    const list = FAQ_DATA[lang] || [];
    const isHi = lang === "hi";
    return Object.keys(CAT).map(cat => {
      const qs = list.filter(f => f.cat === cat);
      if (!qs.length) return "";
      return `  <h2>${esc(CAT[cat][isHi ? 1 : 0])}</h2>
${qs.map(f => `  <details id="${isHi ? "hi-" : ""}${f.id}"><summary>${esc(f.q)}</summary><p>${esc(faqAnswerText(f.a))}</p></details>`).join("\n")}`;
    }).join("\n");
  };
  const all = [...FAQ_DATA.en, ...FAQ_DATA.hi];
  const faqLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": all.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": faqAnswerText(f.a) } })),
  });
  return `${head({ lang: "en", title: "YojanaSahay FAQ – Questions About Finding Government Schemes", desc: "Answers to common questions about YojanaSahay: is it free, is it official, how the Eligibility Checker and AI assistant work, privacy, and how to report a problem.", url: `${SITE_URL}/faq.html` }).replace("</head>", `<script type="application/ld+json">${faqLd}</script>
<style>details{border:1px solid #e7e5e4;border-radius:12px;padding:10px 14px;margin:8px 0;background:#fff;} summary{font-weight:700;font-size:14.5px;cursor:pointer;} details p{margin:8px 0 2px;} @media (prefers-color-scheme: dark){details{background:#1c1917;border-color:#292524;}}</style>
</head>`)}
<body><div class="wrap">
  <nav class="crumbs"><a href="/">YojanaSahay</a> › FAQ</nav>
  <h1>Frequently asked questions</h1>
  <p class="lead">The same answers as the FAQ inside the app. <a href="#hindi">हिंदी में पढ़ें ↓</a></p>
${section("en")}
  <h1 id="hindi" style="margin-top:36px">अक्सर पूछे जाने वाले सवाल</h1>
${section("hi")}
  <a class="cta" href="${SITE_URL}/">Find schemes you qualify for →</a>
  ${trustFooter(false)}
</div></body></html>`;
}

// ── Page template ───────────────────────────────────────────────────────────────
function renderPage(scheme, lang) {
  const isHindi = lang === "hi";
  const name     = scheme.name[lang]     || scheme.name.en;
  const benefit  = scheme.benefit[lang]  || scheme.benefit.en;
  const ministry = scheme.ministry?.[lang] || scheme.ministry?.en || "";
  const tag      = scheme.tag[lang]      || scheme.tag.en;
  const docs     = scheme.docs?.[lang]   || scheme.docs?.en || [];
  // Prefer the English value (it's the verified, full URL); the Hindi field
  // is often a bare or outdated domain. Plain-text values like "Nearest bank
  // branch" used to become a broken "https://Nearest bank branch" link.
  const applyUrl = officialOnly(scheme, lang);
  const indexable = isIndexable(scheme);
  const slug     = slugify(scheme.id);
  const langPath = isHindi ? "yojana" : "schemes";
  const pageUrl  = `${SITE_URL}/${langPath}/${slug}.html`;
  const deepLink = `${SITE_URL}/?scheme=${encodeURIComponent(scheme.id)}`;
  const stateLabel = scheme.scope === "state" ? scheme.state : (isHindi ? "संपूर्ण भारत" : "All India");

  // Title leads with the money and the year — people search "pm kisan 2026"
  // and click results that show the amount. Kept short enough not to be cut.
  const money = moneyOf(benefit) || moneyOf(scheme.benefit?.en);
  const fit = (t) => (t.length <= 62 ? `${t} | YojanaSahay` : t);
  // Schemes with a status guide: people search "<scheme> status" — lead with it.
  const hasGuide = !!GUIDES[scheme.id];
  const title = hasGuide
    ? (isHindi
        ? fit(`${name} स्टेटस ${YEAR} – पैसा नहीं आया? पात्रता और आवेदन`)
        : fit(`${name} Status Check ${YEAR} – Not Received? Eligibility & Apply`))
    : isHindi
    ? fit(money ? `${name} ${YEAR}: ${money} – पात्रता, दस्तावेज़, आवेदन` : `${name} ${YEAR} – पात्रता, लाभ, दस्तावेज़ और आवेदन`)
    : fit(money
        ? `${name} ${YEAR}: ${money} – ${name.length > 40 ? "Eligibility & Apply" : "Eligibility, Documents & Apply"}`
        : `${name} ${YEAR} – Eligibility, Benefits & How to Apply`);
  const checked0 = checkedDate(scheme.id);
  const trimTo = (t, n) => (t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[\s&,;:(–-]+$/, "") + "…");
  const benefitShort = trimTo(String(benefit).replace(/[.।\s]+$/, ""), 90);
  const end = benefitShort.endsWith("…") ? " " : (isHindi ? "। " : ". ");
  const descCore = isHindi
    ? `${benefitShort}${end}कौन आवेदन कर सकता है, ज़रूरी दस्तावेज़ और आवेदन का तरीका${scheme.scope === "state" ? ` (${scheme.state})` : ""}। मुफ्त पात्रता जांच।`
    : `${benefitShort}${end}Who can apply, documents & how to apply${scheme.scope === "state" ? ` (${scheme.state})` : ""}. Free eligibility check.`;
  const descDate = checked0 ? (isHindi ? ` जांचा गया: ${checked0}` : ` Checked ${checked0}.`) : "";
  const description = (descCore + descDate).length <= 175 ? descCore + descDate : descCore;
  // (who-can-apply lines are added to the page body below)

  const docsListItems = docs.map(d => `        <li>${esc(d)}</li>`).join("\n");
  const checked  = checkedDate(scheme.id);
  const whoLines = whoCanApply(scheme, lang) ?? [];
  const hub      = HUBS.get(hubFile(scheme));
  const hubName  = hub?.state ? hub.state : (isHindi ? "केंद्र सरकार" : "Central Government");
  const hubHref  = `/${langPath}/${hubFile(scheme)}.html`;
  const related  = (hub?.schemes ?? []).filter(x => x.id !== scheme.id).slice(0, 8);
  const about    = scheme.description?.[lang] || scheme.description?.en || "";
  const guide    = GUIDES[scheme.id]?.[lang] || null;
  const myCats   = catsOf(scheme);
  // Amount by kind — a loan size or insurance cover is not "a year" (benefitMath.js).
  const kind     = benefitKind(scheme);
  const yearly   = scheme.annual > 0 && kind !== "other" ? `₹${Number(scheme.annual).toLocaleString("en-IN")}` : "";
  const valueTh  = kind === "health" ? (isHindi ? "इलाज कवर (तक)" : "Health cover (up to)")
                 : kind === "oneTime" ? (isHindi ? "एकमुश्त सहायता (लगभग)" : "One-time help (approx.)")
                 : (isHindi ? "सालाना लाभ (लगभग)" : "Yearly value (approx.)");
  const valueSfx = kind === "health" ? (isHindi ? ` (${yearly} तक इलाज कवर)` : ` (cover up to ${yearly})`)
                 : kind === "oneTime" ? (isHindi ? ` (लगभग ${yearly} एकमुश्त)` : ` (about ${yearly} one-time)`)
                 : (isHindi ? ` (लगभग ${yearly} सालाना)` : ` (about ${yearly} a year)`);
  const catKey   = category(scheme);
  // Similar schemes elsewhere: same category, other states/Central (Central first).
  // One per state, so it reads like a real comparison across India.
  const seenHub = new Set();
  const similar  = (BY_CAT.get(catKey) ?? [])
    .filter(x => x.id !== scheme.id && hubFile(x) !== hubFile(scheme))
    .sort((a, b) => (a.scope === "national" ? 0 : 1) - (b.scope === "national" ? 0 : 1))
    .filter(x => { const h = hubFile(x); if (h !== "list-central" && seenHub.has(h)) return false; seenHub.add(h); return true; })
    .slice(0, 6);
  const rawApply = scheme.apply?.[lang] || scheme.apply?.en || "";
  const applyText = scheme.applyType === "offline" || !applyUrl
    ? (rawApply && !/^https?:|^www\.|\.(com|in|org|net)\b/i.test(rawApply)
        ? rawApply
        : (isHindi ? "आवेदन का आधिकारिक तरीका अपने ज़िला / विभाग कार्यालय या नज़दीकी CSC (जन सेवा केंद्र) से पता करें।" : "Get the official application route from your district / department office or the nearest CSC (Common Service Centre)."))
    : (isHindi ? "आधिकारिक सरकारी वेबसाइट पर ऑनलाइन आवेदन करें (नीचे लिंक)।" : "Apply online on the official government website (link below).");

  // GovernmentService structured data — helps Google understand this is an
  // official-style benefit page, distinct from a generic article.
  const aliases = aliasesOf(scheme, lang);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": name,
    "description": description,
    ...(aliases.length ? { "alternateName": aliases } : {}),
    "serviceType": tag,
    "provider": {
      "@type": "GovernmentOrganization",
      "name": ministry || "Government of India"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": stateLabel
    },
    "url": pageUrl,
    "inLanguage": isHindi ? "hi-IN" : "en-IN"
  }, null, 2);

  // FAQ built only from the scheme's own data — nothing invented.
  const faqs = [];
  if (whoLines.length) faqs.push([
    isHindi ? `${name} के लिए कौन आवेदन कर सकता है?` : `Who can apply for ${name}?`,
    whoLines.join(isHindi ? "। " : ". ") + (isHindi ? "।" : "."),
  ]);
  faqs.push([
    isHindi ? `${name} में कितना लाभ मिलता है?` : `What is the benefit of ${name}?`,
    benefit + (yearly ? valueSfx : ""),
  ]);
  if (docs.length) faqs.push([
    isHindi ? `${name} के लिए कौन से दस्तावेज़ चाहिए?` : `What documents are needed for ${name}?`,
    docs.join(", ") + (isHindi ? "।" : "."),
  ]);
  faqs.push([
    isHindi ? `${name} के लिए आवेदन कैसे करें?` : `How do I apply for ${name}?`,
    applyUrl
      ? (isHindi ? `आधिकारिक वेबसाइट पर ऑनलाइन आवेदन करें: ${applyUrl}` : `Apply online on the official website: ${applyUrl}`)
      : (applyText || (isHindi ? "नज़दीकी सरकारी कार्यालय या CSC पर आवेदन करें।" : "Apply at the nearest government office or Common Service Centre (CSC).")),
  ]);
  if (guide) {
    faqs.push([
      isHindi ? `${name} का स्टेटस कैसे चेक करें?` : `How to check ${name} status?`,
      guide.status.join(" "),
    ]);
    faqs.push([
      isHindi ? `${name} का पैसा / लाभ नहीं मिला तो क्या करें?` : `What to do if ${name} money or benefit is not received?`,
      guide.notReceived.slice(0, 3).join(" ") + " " + guide.help,
    ]);
  }
  faqs.push([
    isHindi ? `कैसे पता करें कि मैं ${name} के लिए पात्र हूं?` : `How can I check if I am eligible for ${name}?`,
    isHindi
      ? "YojanaSahay पर कुछ आसान सवालों के जवाब दें — यह मुफ्त में बताता है कि आप किन योजनाओं के लिए पात्र हैं, और हर योजना के दस्तावेज़ भी।"
      : "Answer a few simple questions on YojanaSahay — it tells you free of cost which schemes you qualify for, with the documents for each.",
  ]);
  const faqLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": faqs.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } })),
  });
  const crumbLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "YojanaSahay", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": hubName, "item": `${SITE_URL}${hubHref}` },
      { "@type": "ListItem", "position": 3, "name": name, "item": pageUrl },
    ],
  });

  return `<!DOCTYPE html>
<html lang="${isHindi ? "hi" : "en"}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${pageUrl}" />
<link rel="alternate" hreflang="en-IN" href="${SITE_URL}/schemes/${slug}.html" />
<link rel="alternate" hreflang="hi-IN" href="${SITE_URL}/yojana/${slug}.html" />
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/schemes/${slug}.html" />
<meta name="robots" content="${indexable ? "index, follow, max-image-preview:large" : "noindex, follow"}" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<meta property="og:locale" content="${isHindi ? "hi_IN" : "en_IN"}" />

<link rel="icon" href="/favicon.ico" />
<script type="application/ld+json">${jsonLd}</script>
<script type="application/ld+json">${faqLd}</script>
<script type="application/ld+json">${crumbLd}</script>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "WebPage", "name": title, "url": pageUrl, "inLanguage": isHindi ? "hi-IN" : "en-IN",
  ...(checked0 ? { "dateModified": checked0 } : {}),
  "publisher": { "@type": "Organization", "name": "YojanaSahay", "url": `${SITE_URL}/` },
})}</script>

<style>
  :root{color-scheme:light dark;}
  *{box-sizing:border-box;}
  body{
    margin:0; padding:0; min-height:100vh;
    font-family:'Noto Sans',-apple-system,system-ui,sans-serif;
    background:#fafaf9; color:#1c1917;
    display:flex; flex-direction:column; align-items:center;
  }
  .wrap{ max-width:640px; width:100%; padding:28px 20px 60px; }
  .badge{
    display:inline-block; font-size:12px; font-weight:700;
    padding:4px 10px; border-radius:99px;
    background:#fff7ed; color:#9a3412; border:1px solid #fed7aa;
    margin-bottom:14px;
  }
  h1{ font-size:24px; line-height:1.3; margin:0 0 10px; font-weight:800; }
  .ministry{ font-size:13.5px; color:#78716c; margin-bottom:18px; }
  .aka{ font-size:13px; color:#78716c; margin:-4px 0 8px; line-height:1.5; overflow-wrap:anywhere; }
  .benefit-card{
    background:#fff; border:1px solid #e7e5e4; border-radius:14px;
    padding:18px; margin-bottom:18px;
  }
  .benefit-card .label{ font-size:11.5px; font-weight:700; color:#a16207; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:6px; }
  .benefit-card .value{ font-size:17px; font-weight:700; color:#1c1917; }
  h2{ font-size:15px; font-weight:700; margin:22px 0 10px; }
  ul{ margin:0; padding-left:20px; }
  li{ font-size:14.5px; line-height:1.7; color:#44403c; }
  .cta{
    display:block; text-align:center; text-decoration:none;
    background:#FF9933; color:#fff; font-weight:700; font-size:15.5px;
    padding:15px; border-radius:12px; margin-top:26px;
  }
  .cta-sub{
    display:block; text-align:center; text-decoration:none;
    color:#78716c; font-size:13px; margin-top:12px;
  }
  .official{
    display:block; text-align:center; text-decoration:none;
    color:#1d4ed8; font-size:13.5px; margin-top:18px; font-weight:600;
  }
  .crumbs{ font-size:12.5px; color:#78716c; margin-bottom:12px; }
  .crumbs a, .related a{ color:#c2410c; text-decoration:none; }
  .how{ font-size:14.5px; line-height:1.6; color:#44403c; margin:0; }
  .note{ font-size:12px; color:#a8a29e; margin:6px 0 0; }
  .checked{ font-size:12px; color:#a8a29e; text-align:center; margin-top:18px; }
  .notice{ font-size:12.5px; line-height:1.5; color:#57534e; background:#f5f5f4; border:1px solid #e7e5e4; border-radius:10px; padding:9px 12px; margin:0 0 16px; }
  .guide{ background:#fff; border:1px solid #e7e5e4; border-radius:14px; padding:6px 16px 14px; margin:18px 0; }
  .guide ol, .guide ul{ padding-left:20px; } .guide li{ margin:4px 0; }
  .help{ font-size:13.5px; font-weight:600; color:#1c1917; margin:10px 0 0; }
  .catlinks a{ display:inline-block; margin:4px 6px 0 0; padding:5px 10px; border:1px solid #fed7aa; border-radius:99px; font-size:12.5px; color:#9a3412; text-decoration:none; background:#fff7ed; }
  .trust{ margin-top:10px; } .trust a{ margin:0 6px; }
  footer{ margin-top:40px; font-size:12px; color:#a8a29e; text-align:center; }
  .about{ font-size:15px; line-height:1.65; color:#44403c; margin:0 0 16px; }
  table.facts{ width:100%; border-collapse:collapse; font-size:14px; margin:4px 0 6px; }
  table.facts th{ text-align:left; font-weight:600; color:#78716c; padding:7px 10px 7px 0; vertical-align:top; width:38%; }
  table.facts td{ padding:7px 0; color:#1c1917; border-bottom:1px solid #f0efed; }
  table.facts th{ border-bottom:1px solid #f0efed; }
  details{ border:1px solid #e7e5e4; border-radius:12px; padding:10px 14px; margin:8px 0; background:#fff; }
  summary{ font-weight:700; font-size:14.5px; cursor:pointer; }
  details p{ font-size:14px; line-height:1.6; color:#44403c; margin:8px 0 2px; }
  footer a{ color:#a8a29e; }
  @media (prefers-color-scheme: dark){
    body{ background:#111111; color:#f5f5f4; }
    .benefit-card{ background:#1c1917; border-color:#292524; }
    .benefit-card .value{ color:#f5f5f4; }
    li{ color:#d6d3d1; }
    .about, details p{ color:#d6d3d1; } table.facts td{ color:#f5f5f4; border-color:#292524; } table.facts th{ border-color:#292524; }
    details{ background:#1c1917; border-color:#292524; }
    .notice{ background:#1c1917; border-color:#292524; color:#d6d3d1; } .guide{ background:#1c1917; border-color:#292524; } .help{ color:#f5f5f4; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <nav class="crumbs"><a href="/">YojanaSahay</a> › <a href="${hubHref}">${esc(hubName)}</a></nav>
    <p class="notice">${isHindi
      ? "ℹ️ YojanaSahay एक मुफ्त, स्वतंत्र गाइड है — सरकारी वेबसाइट नहीं। हम कभी पैसे या OTP नहीं मांगते। आवेदन केवल आधिकारिक .gov.in साइट पर करें।"
      : "ℹ️ YojanaSahay is a free, independent guide — not a government website. We never ask for money or OTP. Apply only on the official .gov.in website."}</p>
    <span class="badge">${esc(stateLabel)} · ${esc(tag)}</span>
    <h1>${esc(name)}</h1>
    ${aliases.length ? `<p class="aka">${isHindi ? "इन नामों से भी जानी जाती है" : "Also known as"}: ${aliases.map(esc).join(" · ")}</p>` : ""}
    ${ministry ? `<div class="ministry">${esc(ministry)}</div>` : ""}
    ${scheme.closed ? `<p class="notice" style="background:#FEF2F2;border-color:#FECACA;color:#991B1B">${isHindi ? "🔒 यह योजना अभी नए आवेदन नहीं ले रही है। जानकारी सिर्फ़ संदर्भ के लिए है।" : "🔒 This scheme is not taking new applications. The details are kept here for reference only."}</p>` : ""}

    <div class="benefit-card">
      <div class="label">${isHindi ? "लाभ" : "Benefit"}</div>
      <div class="value">${esc(benefit)}</div>
    </div>

    ${about ? `<p class="about">${esc(about)}</p>` : ""}

    <h2>${isHindi ? "एक नज़र में" : "At a glance"}</h2>
    <table class="facts">
      <tr><th>${isHindi ? "योजना" : "Scheme"}</th><td>${esc(name)}</td></tr>
      <tr><th>${isHindi ? "किसके लिए" : "For"}</th><td>${esc(tag)}</td></tr>
      <tr><th>${isHindi ? "कहां" : "Where"}</th><td>${esc(stateLabel)}</td></tr>
      ${yearly ? `<tr><th>${valueTh}</th><td>${yearly}</td></tr>` : ""}
      ${ministry ? `<tr><th>${isHindi ? "विभाग" : "Department"}</th><td>${esc(ministry)}</td></tr>` : ""}
      <tr><th>${isHindi ? "आवेदन" : "How to apply"}</th><td>${scheme.applyType === "online" && applyUrl ? (isHindi ? "ऑनलाइन" : "Online") : (isHindi ? "कार्यालय / CSC पर" : "At office / CSC")}</td></tr>
      ${checked ? `<tr><th>${isHindi ? "जानकारी जांची गई" : "Info checked"}</th><td>${checked}</td></tr>` : ""}
    </table>

    ${whoLines.length ? `
    <h2>${isHindi ? "कौन आवेदन कर सकता है" : "Who Can Apply"}</h2>
    <ul>
${whoLines.map(l => `        <li>${esc(l)}</li>`).join("\n")}
    </ul>
    <p class="note">${isHindi ? "संक्षेप में — पूरी शर्तें आधिकारिक वेबसाइट पर देखें।" : "In short — check the official website for the full rules."}</p>` : ""}

    ${docs.length ? `
    <h2>${isHindi ? "आवश्यक दस्तावेज़" : "Required Documents"}</h2>
    <ul>
${docsListItems}
    </ul>` : ""}

    ${applyText && !/^https?:/i.test(applyText) ? `
    <h2>${isHindi ? "आवेदन कैसे करें" : "How to Apply"}</h2>
    <p class="how">${esc(applyText)}</p>` : ""}

    ${guide ? `
    <div class="guide" id="status">
      <h2>${isHindi ? `${esc(name)} का स्टेटस कैसे देखें` : `How to check ${esc(name)} status`}</h2>
      <ol>
${guide.status.map(t => `        <li>${esc(t)}</li>`).join("\n")}
      </ol>
      <h2>${isHindi ? "पैसे / लाभ नहीं मिला? क्या करें" : "Money or benefit not received? What to do"}</h2>
      <ul>
${guide.notReceived.map(t => `        <li>${esc(t)}</li>`).join("\n")}
      </ul>
      <p class="help">📞 ${esc(guide.help)}</p>
      <p class="note">${isHindi ? `ये चरण ${GUIDES_REVIEWED} में जांचे गए — प्रक्रिया बदल सकती है, आधिकारिक पोर्टल पर पुष्टि करें।` : `Steps reviewed ${GUIDES_REVIEWED} — processes can change, confirm on the official portal.`}</p>
    </div>` : ""}

    <a class="cta" href="${deepLink}">
      ${isHindi ? "YojanaSahay ऐप में खोलें और पात्रता जांचें →" : "Open in YojanaSahay App & Check Eligibility →"}
    </a>
    <a class="cta-sub" href="${SITE_URL}/">
      ${isHindi ? "या सभी योजनाएं ब्राउज़ करें" : "or browse all schemes"}
    </a>

    ${applyUrl ? `<a class="official" href="${esc(applyUrl)}" rel="nofollow noopener" target="_blank">
      ${isHindi ? "आधिकारिक वेबसाइट पर जाएं ↗" : "Visit Official Government Website ↗"}
    </a>` : ""}

    ${related.length ? `
    <h2>${isHindi ? `${esc(hubName)} की और योजनाएं` : `More schemes — ${esc(hubName)}`}</h2>
    <ul class="related">
${related.map(r => `      <li><a href="/${langPath}/${slugify(r.id)}.html">${esc(r.name[lang] || r.name.en)}</a></li>`).join("\n")}
    </ul>
    <a class="cta-sub" href="${hubHref}">${isHindi ? `सभी ${hub.schemes.length} योजनाएं देखें →` : `See all ${hub.schemes.length} schemes →`}</a>` : ""}


    ${myCats.length ? `
    <h2>${isHindi ? "इसी तरह की और योजनाएं" : "Browse similar schemes"}</h2>
    <p class="catlinks">${myCats.map(c => {
      const sf = scheme.scope === "state" && CAT_STATE.has(catFile(c, scheme.state)) ? catFile(c, scheme.state) : null;
      return (sf ? `<a href="/${langPath}/${sf}.html">${c.icon} ${esc(isHindi ? `${scheme.state} में ${c.hi} के लिए योजनाएं` : `${c.en} schemes in ${scheme.state}`)}</a>` : "")
        + `<a href="/${langPath}/${catFile(c)}.html">${c.icon} ${esc(isHindi ? `${c.hi} के लिए सभी योजनाएं` : `All schemes for ${c.en}`)}</a>`;
    }).join("")}</p>` : ""}

    <h2>${isHindi ? "अक्सर पूछे जाने वाले सवाल" : "Frequently asked questions"}</h2>
${faqs.map(([q, a]) => `    <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}

    ${similar.length ? `
    <h2>${isHindi ? "दूसरे राज्यों / केंद्र की ऐसी ही योजनाएं" : "Similar schemes in other states & Central"}</h2>
    <ul class="related">
${similar.map(r => `      <li><a href="/${langPath}/${slugify(r.id)}.html">${esc(r.name[lang] || r.name.en)}</a> <span style="color:#a8a29e">· ${esc(r.scope === "state" ? r.state : (isHindi ? "केंद्र" : "Central"))}</span></li>`).join("\n")}
    </ul>` : ""}

    ${checked ? `<p class="checked">${isHindi ? "आधिकारिक लिंक अंतिम बार जांचा गया" : "Official link last checked"}: ${checked}</p>` : ""}

    ${trustFooter(isHindi)}
  </div>
</body>
</html>`;
}

// ── State / Central list pages ───────────────────────────────────────────────
function renderHub(hub, lang, allHubs) {
  const isHindi = lang === "hi";
  const langPath = isHindi ? "yojana" : "schemes";
  const place = hub.state ?? (isHindi ? "केंद्र सरकार" : "Central Government");
  // "Central Government Schemes", not "Central Government Government Schemes".
  const placeEn = hub.state ? `${hub.state} Government Schemes` : "Central Government Schemes";
  const placeHi = hub.state ? `${hub.state} की सरकारी योजनाएं` : "केंद्र सरकार की योजनाएं";
  const title = isHindi
    ? `${placeHi} ${YEAR} – ${hub.schemes.length} योजनाओं की सूची | YojanaSahay`
    : `${placeEn} List ${YEAR} – ${hub.schemes.length} Yojanas | YojanaSahay`;
  const desc = isHindi
    ? `${place} की ${hub.schemes.length} सरकारी योजनाओं की सूची — लाभ, ज़रूरी दस्तावेज़ और आवेदन का तरीका। मुफ्त में पात्रता जांचें।`
    : `List of ${hub.schemes.length} ${hub.state ? hub.state + " government" : "Central Government"} schemes — benefits, required documents and how to apply. Check your eligibility free.`;
  const url = `${SITE_URL}/${langPath}/${hub.key}.html`;
  const items = hub.schemes.map(x => `      <li><a href="/${langPath}/${slugify(x.id)}.html">${esc(x.name[lang] || x.name.en)}</a><span> — ${esc(x.benefit?.[lang] || x.benefit?.en || "")}</span></li>`).join("\n");
  const hubCats = hub.state ? CAT_HUBS.filter(h => h.state === hub.state) : CAT_HUBS.filter(h => !h.state);
  const others = allHubs.filter(h => h.key !== hub.key).map(h => `<a href="/${langPath}/${h.key}.html">${esc(h.state ?? (isHindi ? "केंद्र सरकार" : "Central"))}</a>`).join(" · ");
  return `<!DOCTYPE html>
<html lang="${isHindi ? "hi" : "en"}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${url}" />
<link rel="alternate" hreflang="en-IN" href="${SITE_URL}/schemes/${hub.key}.html" />
<link rel="alternate" hreflang="hi-IN" href="${SITE_URL}/yojana/${hub.key}.html" />
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/schemes/${hub.key}.html" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<meta property="og:locale" content="${isHindi ? "hi_IN" : "en_IN"}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.ico" />
<style>
  :root{color-scheme:light dark;} *{box-sizing:border-box;}
  body{margin:0;font-family:'Noto Sans',-apple-system,system-ui,sans-serif;background:#fafaf9;color:#1c1917;}
  .wrap{max-width:720px;margin:0 auto;padding:28px 20px 60px;}
  h1{font-size:24px;line-height:1.3;margin:0 0 8px;font-weight:800;} p.lead{color:#57534e;font-size:14.5px;line-height:1.6;}
  ul{padding-left:20px;} li{font-size:14.5px;line-height:1.6;margin:8px 0;color:#44403c;}
  li a{color:#c2410c;font-weight:700;text-decoration:none;} li span{color:#57534e;}
  .cta{display:block;text-align:center;text-decoration:none;background:#FF9933;color:#fff;font-weight:700;padding:14px;border-radius:12px;margin:22px 0;}
  .others{font-size:13px;line-height:2;color:#78716c;} .others a{color:#78716c;}
  .crumbs{font-size:12.5px;color:#78716c;margin-bottom:12px;} .crumbs a{color:#c2410c;text-decoration:none;}
  .notice{font-size:12.5px;line-height:1.5;color:#57534e;background:#f5f5f4;border:1px solid #e7e5e4;border-radius:10px;padding:9px 12px;margin:0 0 16px;}
  .catlinks a{display:inline-block;margin:4px 6px 0 0;padding:5px 10px;border:1px solid #fed7aa;border-radius:99px;font-size:12.5px;color:#9a3412;text-decoration:none;background:#fff7ed;}
  footer{margin-top:40px;font-size:12px;color:#a8a29e;text-align:center;line-height:1.8;} footer a{color:#a8a29e;} .trust a{margin:0 6px;}
  @media (prefers-color-scheme: dark){ body{background:#111;color:#f5f5f4;} li,li span{color:#d6d3d1;} p.lead{color:#a8a29e;} .notice{background:#1c1917;border-color:#292524;color:#d6d3d1;} }
</style>
</head>
<body><div class="wrap">
  <nav class="crumbs"><a href="/">YojanaSahay</a> › ${esc(place)}</nav>
  ${NOTICE(isHindi)}
  <h1>${esc(isHindi ? placeHi : placeEn)}</h1>
  <p class="lead">${esc(desc)}</p>
  <a class="cta" href="${SITE_URL}/">${isHindi ? "ऐप में अपनी पात्रता जांचें →" : "Check which ones you qualify for →"}</a>
  <ul>
${items}
  </ul>
  ${hubCats.length ? `<h2 style="font-size:15px">${isHindi ? "श्रेणी के अनुसार" : "By category"}</h2>
  <p class="catlinks">${hubCats.map(h => `<a href="/${langPath}/${h.file}.html">${h.cat.icon} ${esc(isHindi ? h.cat.hi : h.cat.en)} (${h.schemes.length})</a>`).join("")}</p>` : ""}
  <h2 style="font-size:15px">${isHindi ? "अन्य राज्य" : "Other states"}</h2>
  <p class="others">${others}</p>
  ${trustFooter(isHindi)}
</div></body></html>`;
}

// ── Run generator ────────────────────────────────────────────────────────────
function main() {
  const schemesDir = path.join(ROOT, "public", "schemes");
  const yojanaDir   = path.join(ROOT, "public", "yojana");
  fs.mkdirSync(schemesDir, { recursive: true });
  fs.mkdirSync(yojanaDir,   { recursive: true });

  const sitemapEntries = [];

  // Homepage entry first
  sitemapEntries.push({ loc: `${SITE_URL}/` });

  const hubs = [...HUBS.values()].sort((a, b) => (a.state === null ? -1 : b.state === null ? 1 : a.state.localeCompare(b.state)));
  const ids = new Set(SCHEME_DB.map(x => slugify(x.id ?? "")));
  for (const hub of hubs) {
    if (ids.has(hub.key)) throw new Error(`List page ${hub.key} clashes with a scheme id`);
    fs.writeFileSync(path.join(schemesDir, `${hub.key}.html`), renderHub(hub, "en", hubs), "utf8");
    fs.writeFileSync(path.join(yojanaDir,   `${hub.key}.html`), renderHub(hub, "hi", hubs), "utf8");
    const last = hub.schemes.map(x => checkedDate(x.id)).filter(Boolean).sort().pop() ?? null;
    sitemapEntries.push({ loc: `${SITE_URL}/schemes/${hub.key}.html`, lastmod: last });
    sitemapEntries.push({ loc: `${SITE_URL}/yojana/${hub.key}.html`,  lastmod: last });
  }

  // Category hubs
  for (const hub of CAT_HUBS) {
    if (ids.has(hub.file)) throw new Error(`Category page ${hub.file} clashes with a scheme id`);
    fs.writeFileSync(path.join(schemesDir, `${hub.file}.html`), renderCatHub(hub, "en"), "utf8");
    fs.writeFileSync(path.join(yojanaDir,   `${hub.file}.html`), renderCatHub(hub, "hi"), "utf8");
    sitemapEntries.push({ loc: `${SITE_URL}/schemes/${hub.file}.html` });
    sitemapEntries.push({ loc: `${SITE_URL}/yojana/${hub.file}.html` });
  }
  // Trust pages
  for (const kind of ["about", "how-we-verify", "contact", "terms", "press"]) {
    fs.writeFileSync(path.join(ROOT, "public", `${kind}.html`), renderTrust(kind), "utf8");
    sitemapEntries.push({ loc: `${SITE_URL}/${kind}.html` });
  }
  fs.writeFileSync(path.join(ROOT, "public", "poster.html"), renderPoster(), "utf8");
  // Open data — the scheme list as JSON and CSV for NGOs, researchers and
  // developers (Open Data Commons Attribution licence). No personal data.
  {
    const dir = path.join(ROOT, "public", "data");
    fs.mkdirSync(dir, { recursive: true });
    const open = ALL_SCHEMES.filter(s => s?.id && s.name?.en);
    const arr = v => (Array.isArray(v) ? v.map(x => String(x)) : v ? [String(v)] : []);
    const who = (s, l) => { try { return arr(whoCanApply(s, l)); } catch { return []; } };
    const official = s => { const raw = String(s.apply?.en || "").trim(); const u = /^https?:\/\//i.test(raw) ? raw : /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(raw) ? `https://${raw}` : ""; return u && isOfficialUrl(u) ? u : ""; };
    const rows = open.map(s => ({
      id: s.id,
      name: { en: s.name.en, hi: s.name.hi || "" },
      scope: s.scope === "national" ? "central" : "state",
      state: s.scope === "national" ? "" : (s.state || ""),
      ministry: s.ministry?.en || "",
      benefit: { en: s.benefit?.en || "", hi: s.benefit?.hi || "" },
      annualValueINR: Number(s.annual) || 0,
      valueKind: benefitKind(s),
      category: s.tag?.en || "",
      whoCanApply: { en: who(s, "en"), hi: who(s, "hi") },
      documents: { en: arr(s.docs?.en), hi: arr(s.docs?.hi) },
      applyMode: s.applyType === "online" ? "online" : "offline",
      officialLink: official(s),
      status: s.closed ? "closed" : "open",
      duplicateOf: s.duplicateOf || "",
      page: { en: `${SITE_URL}/schemes/${slugify(s.duplicateOf || s.id)}.html`, hi: `${SITE_URL}/yojana/${slugify(s.duplicateOf || s.id)}.html` },
    }));
    const meta = {
      name: "YojanaSahay — Indian government welfare schemes (Central and State)",
      publisher: "YojanaSahay (Sahnawaz Ahmed Laskar)",
      homepage: SITE_URL,
      license: "Open Data Commons Attribution License (ODC-By) v1.0 — https://opendatacommons.org/licenses/by/1-0/",
      attribution: "Data: YojanaSahay (yojanasahay.vercel.app)",
      note: "Compiled from official government sources for information only. Not an official government dataset; always confirm details on the official website before applying. annualValueINR is the scheme's typical yearly amount, or a one-time / cover amount — read valueKind (yearly, oneTime, health, other).",
      generatedAt: new Date().toISOString(),
      count: rows.length,
    };
    fs.writeFileSync(path.join(dir, "schemes.json"), JSON.stringify({ meta, schemes: rows }), "utf8");
    const csvCell = v => { const t = String(v ?? ""); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    const cols = ["id", "name_en", "name_hi", "scope", "state", "ministry", "benefit_en", "annual_value_inr", "value_kind", "category", "who_can_apply_en", "documents_en", "apply_mode", "official_link", "status", "duplicate_of", "page_en"];
    const csv = [cols.join(","), ...rows.map(r => [r.id, r.name.en, r.name.hi, r.scope, r.state, r.ministry, r.benefit.en, r.annualValueINR, r.valueKind, r.category, r.whoCanApply.en.join(" | "), r.documents.en.join(" | "), r.applyMode, r.officialLink, r.status, r.duplicateOf, r.page.en].map(csvCell).join(","))].join("\n");
    fs.writeFileSync(path.join(dir, "schemes.csv"), "\ufeff" + csv, "utf8");
  }
  sitemapEntries.push({ loc: `${SITE_URL}/poster.html` });
  fs.writeFileSync(path.join(ROOT, "public", "faq.html"), renderFaq(), "utf8");
  sitemapEntries.push({ loc: `${SITE_URL}/faq.html` });
  // Data for the embeddable widget (public/widget.html, shown on other
  // websites) — one small file per language: rows of [slug, name, benefit,
  // state ("" = Central), category keys, yearly ₹]. Open schemes only.
  {
    const cut = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…"; };
    const open = SCHEME_DB.filter(s => !s.closed && s.name?.en);
    const states = [...new Set(open.map(s => s.scope === "state" ? s.state : "").filter(Boolean))].sort();
    for (const lng of ["en", "hi"]) {
      const rows = open.map(s => [
        slugify(s.id), s.name[lng] || s.name.en, cut(s.benefit?.[lng] || s.benefit?.en, 80),
        s.scope === "state" ? (s.state || "") : "", catsOf(s).map(c => c.key).join(","), Number(s.annual) || 0,
      ]);
      fs.writeFileSync(path.join(ROOT, "public", `widget-data-${lng}.json`), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), states, d: rows }), "utf8");
    }
  }
  sitemapEntries.push({ loc: `${SITE_URL}/add-widget.html` });

  let count = 0, indexed = 0;
  for (const scheme of SCHEME_DB) {
    if (!scheme?.id || !scheme?.name?.en) continue; // skip malformed entries safely
    const slug = slugify(scheme.id);

    const enHtml = renderPage(scheme, "en");
    const hiHtml = renderPage(scheme, "hi");

    fs.writeFileSync(path.join(schemesDir, `${slug}.html`), enHtml, "utf8");
    fs.writeFileSync(path.join(yojanaDir,   `${slug}.html`), hiHtml, "utf8");

    // Only pages offered to Google go in the sitemap.
    if (isIndexable(scheme)) {
      const lastmod = checkedDate(scheme.id);
      sitemapEntries.push({ loc: `${SITE_URL}/schemes/${slug}.html`, lastmod });
      sitemapEntries.push({ loc: `${SITE_URL}/yojana/${slug}.html`,  lastmod });
      indexed++;
    }

    count++;
  }

  // ── Crawlable links on the homepage ───────────────────────────────────────
  // The app's home screen is drawn by JavaScript, so Google's first look at
  // yojanasahay.vercel.app saw an empty page with no links. This plain-HTML
  // directory sits inside #root (React replaces it as the app starts — the
  // same links the app shows) so Google finds every state list, category and
  // popular scheme page straight from the homepage.
  {
    const idxPath = path.join(ROOT, "index.html");
    const idx = fs.readFileSync(idxPath, "utf8");
    const li = (href, text) => `<li><a href="${href}">${esc(text)}</a></li>`;
    const stateHubs = hubs.map(h => li(`/schemes/${h.key}.html`, `${h.state || "Central Government"} schemes (${h.schemes.length})`)).join("");
    const catHubs = CAT_HUBS.filter(h => !h.state).map(h => li(`/schemes/${h.file}.html`, `Schemes for ${h.cat.en} (${h.schemes.length})`)).join("");
    const popular = SCHEME_DB.filter(x => isIndexable(x) && (x.scope === "national" || FORCE_INDEX.has(slugify(x.id))))
      .sort((a, b) => (Number(b.annual) || 0) - (Number(a.annual) || 0)).slice(0, 80)
      .map(x => li(`/schemes/${slugify(x.id)}.html`, x.name.en)).join("");
    const block = `<!--SEO-LINKS:START--><main class="seo-fallback" style="max-width:860px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;color:#1c1917;background:#fff">`
      + `<h1>YojanaSahay – Free Government Scheme Finder for India</h1>`
      + `<p>Find the Central and State government welfare schemes you qualify for: ${SCHEME_COUNT_LABEL} schemes for farmers, women, students, workers, senior citizens and persons with disabilities, with eligibility, documents and the official link to apply. Free, in Hindi and English. YojanaSahay is an independent guide, not a government website.</p>`
      + `<p><a href="/faq.html">FAQ</a> · <a href="/about.html">About</a> · <a href="/how-we-verify.html">How we verify</a> · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · <a href="/press.html">Press</a> · <a href="/poster.html">Free posters</a></p>`
      + `<h2>Government schemes by state</h2><ul>${stateHubs}</ul>`
      + `<h2>Schemes by category</h2><ul>${catHubs}</ul>`
      + `<h2>Popular schemes</h2><ul>${popular}</ul></main><!--SEO-LINKS:END-->`;
    const next = /<!--SEO-LINKS:START-->[\s\S]*?<!--SEO-LINKS:END-->/.test(idx)
      ? idx.replace(/<!--SEO-LINKS:START-->[\s\S]*?<!--SEO-LINKS:END-->/, block)
      : idx.replace('<div id="root"></div>', `<div id="root">${block}</div>`);
    // The homepage's own text (title tags, social previews, structured data)
    // says "1,100+ … schemes" and "34 Indian States" — keep those numbers
    // equal to the data on every build instead of typed by hand.
    const counted = next
      .replace(/\b\d{1,2},\d00\+(?=\s+(?:Central|government|Indian|Central &|welfare))/g, SCHEME_COUNT_LABEL)
      .replace(/\b\d{2} Indian States and Union Territories covered/g, `${STATE_COUNT} Indian States and Union Territories covered`);
    if (counted !== idx) fs.writeFileSync(idxPath, counted, "utf8");
    console.log(`✓ homepage directory: ${hubs.length} state lists, ${CAT_HUBS.filter(h => !h.state).length} categories, popular schemes`);
  }

  // ── Old pages of merged duplicates → forward to the main scheme ───────────
  // A scheme later marked duplicateOf lost its page, and Google reported the
  // old address as "Not found (404)". A tiny forwarding page (instant
  // redirect + canonical to the main page) passes visitors and Google on.
  let forwarded = 0;
  const liveSlugs = new Set(SCHEME_DB.map(x => slugify(x.id ?? "")));
  for (const dup of ALL_SCHEMES) {
    if (!dup?.duplicateOf || !dup.id) continue;
    const from = slugify(dup.id), to = slugify(dup.duplicateOf);
    if (liveSlugs.has(from) || !liveSlugs.has(to)) continue;
    for (const [dir, base] of [[schemesDir, "schemes"], [yojanaDir, "yojana"]]) {
      const url = `${SITE_URL}/${base}/${to}.html`;
      fs.writeFileSync(path.join(dir, `${from}.html`), `<!doctype html><html><head><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="${url}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${url}"><script>location.replace(${JSON.stringify(url)})</script></head><body><p>This scheme has moved: <a href="${url}">${url}</a></p></body></html>\n`, "utf8");
    }
    forwarded++;
  }
  if (forwarded) console.log(`✓ ${forwarded} merged-duplicate addresses forward to their main scheme page`);

  // ── Write sitemap.xml ──────────────────────────────────────────────────────
  // Only real dates: a page's lastmod is when its official link was last
  // checked. The homepage gets none (Google works it out itself).
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"), sitemapXml, "utf8");

  console.log(`✓ Generated ${count} schemes × 2 languages = ${count * 2} static pages`);
  console.log(`✓ ${hubs.length} state/central list pages × 2 languages`);
  console.log(`✓ ${CAT_HUBS.length} category pages × 2 languages · 3 trust pages`);
  console.log(`✓ ${indexed} schemes offered to Google (index + sitemap); ${count - indexed} kept noindex until their data is fuller`);
  console.log(`✓ sitemap.xml updated with ${sitemapEntries.length} URLs`);
}

main();
