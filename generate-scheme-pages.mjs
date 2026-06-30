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
const { SCHEME_DB } = await import("../src/schemesData.js");

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

// ── Page template ───────────────────────────────────────────────────────────────
function renderPage(scheme, lang) {
  const isHindi = lang === "hi";
  const name     = scheme.name[lang]     || scheme.name.en;
  const benefit  = scheme.benefit[lang]  || scheme.benefit.en;
  const ministry = scheme.ministry?.[lang] || scheme.ministry?.en || "";
  const tag      = scheme.tag[lang]      || scheme.tag.en;
  const docs     = scheme.docs?.[lang]   || scheme.docs?.en || [];
  const applyUrl = scheme.apply?.[lang]  || scheme.apply?.en || "";
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

  const docsListItems = docs.map(d => `        <li>${esc(d)}</li>`).join("\n");

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
    <span class="badge">${esc(stateLabel)} · ${esc(tag)}</span>
    <h1>${esc(name)}</h1>
    ${ministry ? `<div class="ministry">${esc(ministry)}</div>` : ""}

    <div class="benefit-card">
      <div class="label">${isHindi ? "लाभ" : "Benefit"}</div>
      <div class="value">${esc(benefit)}</div>
    </div>

    ${docs.length ? `
    <h2>${isHindi ? "आवश्यक दस्तावेज़" : "Required Documents"}</h2>
    <ul>
${docsListItems}
    </ul>` : ""}

    <a class="cta" href="${deepLink}">
      ${isHindi ? "YojanaSahay ऐप में खोलें और पात्रता जांचें →" : "Open in YojanaSahay App & Check Eligibility →"}
    </a>
    <a class="cta-sub" href="${SITE_URL}/">
      ${isHindi ? "या सभी योजनाएं ब्राउज़ करें" : "or browse all schemes"}
    </a>

    ${applyUrl ? `<a class="official" href="https://${applyUrl.replace(/^https?:\/\//,"")}" rel="nofollow noopener" target="_blank">
      ${isHindi ? "आधिकारिक वेबसाइट पर जाएं ↗" : "Visit Official Government Website ↗"}
    </a>` : ""}

    <footer>
      ${isHindi ? "YojanaSahay भारत सरकार से संबद्ध नहीं है। यह एक स्वतंत्र नागरिक तकनीक मंच है।" : "YojanaSahay is an independent civic-tech platform, not affiliated with the Government of India."}
      <br/><a href="${SITE_URL}/">yojanasahay.vercel.app</a>
    </footer>
  </div>
</body>
</html>`;
}

// ── Run generator ────────────────────────────────────────────────────────────
function main() {
  const schemesDir = path.join(ROOT, "public", "schemes");
  const yojanaDir   = path.join(ROOT, "public", "yojana");
  fs.mkdirSync(schemesDir, { recursive: true });
  fs.mkdirSync(yojanaDir,   { recursive: true });

  const sitemapEntries = [];

  // Homepage entry first
  sitemapEntries.push({
    loc: `${SITE_URL}/`,
    priority: "1.0",
    changefreq: "weekly",
  });

  let count = 0;
  for (const scheme of SCHEME_DB) {
    if (!scheme?.id || !scheme?.name?.en) continue; // skip malformed entries safely
    const slug = slugify(scheme.id);

    const enHtml = renderPage(scheme, "en");
    const hiHtml = renderPage(scheme, "hi");

    fs.writeFileSync(path.join(schemesDir, `${slug}.html`), enHtml, "utf8");
    fs.writeFileSync(path.join(yojanaDir,   `${slug}.html`), hiHtml, "utf8");

    sitemapEntries.push({ loc: `${SITE_URL}/schemes/${slug}.html`, priority: "0.8", changefreq: "monthly" });
    sitemapEntries.push({ loc: `${SITE_URL}/yojana/${slug}.html`,  priority: "0.8", changefreq: "monthly" });

    count++;
  }

  // ── Write sitemap.xml ──────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"), sitemapXml, "utf8");

  console.log(`✓ Generated ${count} schemes × 2 languages = ${count * 2} static pages`);
  console.log(`✓ sitemap.xml updated with ${sitemapEntries.length} URLs`);
}

main();
