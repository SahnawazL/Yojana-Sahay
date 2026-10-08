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
const { whoCanApply } = await import("../src/eligibilityText.js");
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
  const applyUrl = officialUrl(scheme.apply?.en) || officialUrl(scheme.apply?.[lang]) || "";
  const slug     = slugify(scheme.id);
  const langPath = isHindi ? "yojana" : "schemes";
  const pageUrl  = `${SITE_URL}/${langPath}/${slug}.html`;
  const deepLink = `${SITE_URL}/?scheme=${encodeURIComponent(scheme.id)}`;
  const stateLabel = scheme.scope === "state" ? scheme.state : (isHindi ? "संपूर्ण भारत" : "All India");

  const title = isHindi
    ? `${name} – पात्रता, लाभ और आवेदन कैसे करें | YojanaSahay`
    : `${name} – Eligibility, Benefits & How to Apply | YojanaSahay`;

  const description = isHindi
    ? `${name}: ${benefit}. ${ministry ? ministry + " द्वारा। " : ""}पात्रता जांचें और मुफ्त में आवेदन करने का तरीका जानें।`
    : `${name}: ${benefit}. ${ministry ? "By " + ministry + ". " : ""}Check eligibility and learn how to apply for free.`;
  // (who-can-apply lines are added to the page body below)

  const docsListItems = docs.map(d => `        <li>${esc(d)}</li>`).join("\n");
  const checked  = checkedDate(scheme.id);
  const whoLines = whoCanApply(scheme, lang) ?? [];
  const hub      = HUBS.get(hubFile(scheme));
  const hubName  = hub?.state ? hub.state : (isHindi ? "केंद्र सरकार" : "Central Government");
  const hubHref  = `/${langPath}/${hubFile(scheme)}.html`;
  const related  = (hub?.schemes ?? []).filter(x => x.id !== scheme.id).slice(0, 8);
  const applyText = scheme.applyType === "offline" || !applyUrl
    ? (scheme.apply?.[lang] || scheme.apply?.en || "")
    : (isHindi ? "आधिकारिक सरकारी वेबसाइट पर ऑनलाइन आवेदन करें (नीचे लिंक)।" : "Apply online on the official government website (link below).");

  // GovernmentService structured data — helps Google understand this is an
  // official-style benefit page, distinct from a generic article.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": name,
    "description": description,
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
<meta name="robots" content="index, follow" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${SITE_URL}/og-image.png" />
<meta property="og:locale" content="${isHindi ? "hi_IN" : "en_IN"}" />

<link rel="icon" href="/favicon.ico" />
<script type="application/ld+json">${jsonLd}</script>

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
  footer{ margin-top:40px; font-size:12px; color:#a8a29e; text-align:center; }
  footer a{ color:#a8a29e; }
  @media (prefers-color-scheme: dark){
    body{ background:#111111; color:#f5f5f4; }
    .benefit-card{ background:#1c1917; border-color:#292524; }
    .benefit-card .value{ color:#f5f5f4; }
    li{ color:#d6d3d1; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <nav class="crumbs"><a href="/">YojanaSahay</a> › <a href="${hubHref}">${esc(hubName)}</a></nav>
    <span class="badge">${esc(stateLabel)} · ${esc(tag)}</span>
    <h1>${esc(name)}</h1>
    ${ministry ? `<div class="ministry">${esc(ministry)}</div>` : ""}

    <div class="benefit-card">
      <div class="label">${isHindi ? "लाभ" : "Benefit"}</div>
      <div class="value">${esc(benefit)}</div>
    </div>

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

    ${checked ? `<p class="checked">${isHindi ? "आधिकारिक लिंक अंतिम बार जांचा गया" : "Official link last checked"}: ${checked}</p>` : ""}

    <footer>
      ${isHindi ? "YojanaSahay भारत सरकार से संबद्ध नहीं है। यह एक स्वतंत्र नागरिक तकनीक मंच है।" : "YojanaSahay is an independent civic-tech platform, not affiliated with the Government of India."}
      <br/><a href="${SITE_URL}/">yojanasahay.vercel.app</a>
    </footer>
  </div>
</body>
</html>`;
}

// ── State / Central list pages ───────────────────────────────────────────────
function renderHub(hub, lang, allHubs) {
  const isHindi = lang === "hi";
  const langPath = isHindi ? "yojana" : "schemes";
  const place = hub.state ?? (isHindi ? "केंद्र सरकार" : "Central Government");
  const title = isHindi
    ? `${place} की सरकारी योजनाएं (${hub.schemes.length}) – पात्रता और आवेदन | YojanaSahay`
    : `${place} Government Schemes List (${hub.schemes.length}) – Eligibility & Apply | YojanaSahay`;
  const desc = isHindi
    ? `${place} की ${hub.schemes.length} सरकारी योजनाओं की सूची — लाभ, ज़रूरी दस्तावेज़ और आवेदन का तरीका। मुफ्त में पात्रता जांचें।`
    : `List of ${hub.schemes.length} ${place} government schemes — benefits, required documents and how to apply. Check your eligibility free.`;
  const url = `${SITE_URL}/${langPath}/${hub.key}.html`;
  const items = hub.schemes.map(x => `      <li><a href="/${langPath}/${slugify(x.id)}.html">${esc(x.name[lang] || x.name.en)}</a><span> — ${esc(x.benefit?.[lang] || x.benefit?.en || "")}</span></li>`).join("\n");
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
<meta name="robots" content="index, follow" />
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
  @media (prefers-color-scheme: dark){ body{background:#111;color:#f5f5f4;} li,li span{color:#d6d3d1;} p.lead{color:#a8a29e;} }
</style>
</head>
<body><div class="wrap">
  <nav class="crumbs"><a href="/">YojanaSahay</a> › ${esc(place)}</nav>
  <h1>${esc(isHindi ? `${place} की सरकारी योजनाएं` : `${place} Government Schemes`)}</h1>
  <p class="lead">${esc(desc)}</p>
  <a class="cta" href="${SITE_URL}/">${isHindi ? "ऐप में अपनी पात्रता जांचें →" : "Check which ones you qualify for →"}</a>
  <ul>
${items}
  </ul>
  <h2 style="font-size:15px">${isHindi ? "अन्य राज्य" : "Other states"}</h2>
  <p class="others">${others}</p>
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

  let count = 0;
  for (const scheme of SCHEME_DB) {
    if (!scheme?.id || !scheme?.name?.en) continue; // skip malformed entries safely
    const slug = slugify(scheme.id);

    const enHtml = renderPage(scheme, "en");
    const hiHtml = renderPage(scheme, "hi");

    fs.writeFileSync(path.join(schemesDir, `${slug}.html`), enHtml, "utf8");
    fs.writeFileSync(path.join(yojanaDir,   `${slug}.html`), hiHtml, "utf8");

    const lastmod = checkedDate(scheme.id);
    sitemapEntries.push({ loc: `${SITE_URL}/schemes/${slug}.html`, lastmod });
    sitemapEntries.push({ loc: `${SITE_URL}/yojana/${slug}.html`,  lastmod });

    count++;
  }

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
  console.log(`✓ sitemap.xml updated with ${sitemapEntries.length} URLs`);
}

main();
