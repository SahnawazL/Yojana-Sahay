// src/schemeMatch.js — Yojana Sahay · find schemes named in text, keep links official
// ─────────────────────────────────────────────────────────────────────────────
// Used by the AI chat:
//   • findSchemesInText(text) → the schemes an answer talks about (cards, actions)
//   • cleanLinks(text)        → every link in an AI answer is either an official
//     government site or the scheme's own link from our database. A blog / NGO /
//     news link next to a scheme is swapped for that scheme's official link;
//     any other unofficial link is removed.
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB } from "./schemesData.js";

// ─── SCHEME CARDS: find the schemes an answer talks about ───────────────────
// Built once: every unique scheme's English + Hindi name, plus a short form
// ("PM Awas Yojana" from "PM Awas Yojana (Gramin)") and its acronym ("PMJAY")
// — but only when that short form belongs to ONE scheme, so a card never
// opens the wrong scheme. Longest keys are tried first.
let SCHEME_NAME_INDEX = null;
function schemeNameIndex() {
  if (SCHEME_NAME_INDEX) return SCHEME_NAME_INDEX;
  const raw = [];
  for (const s of SCHEME_DB) {
    if (s.duplicateOf || !s.name) continue;
    const en = (s.name.en || "").trim(), hi = (s.name.hi || "").trim();
    if (en.length >= 8) raw.push({ key: en.toLowerCase(), s, full: true });
    if (hi.length >= 6) raw.push({ key: hi, s, full: true });
    const base = en.split(/\s+[—–-]\s+|\s*\(/)[0].trim();
    if (base && base !== en && base.length >= 10) raw.push({ key: base.toLowerCase(), s });
    const acr = en.match(/\(([A-Z][A-Z0-9-]{3,})\)/);
    if (acr) raw.push({ key: acr[1], s, word: true });
  }
  const owners = new Map();
  for (const r of raw) {
    if (!owners.has(r.key)) owners.set(r.key, new Set());
    owners.get(r.key).add(r.s.id);
  }
  const seen = new Set();
  SCHEME_NAME_INDEX = raw
    .filter(r => (r.full || owners.get(r.key).size === 1) && !seen.has(r.key) && seen.add(r.key))
    .sort((a, b) => b.key.length - a.key.length);
  return SCHEME_NAME_INDEX;
}

// Up to `max` schemes named in `text`, in the order they first appear.
export function findSchemesInText(text, max = 4) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const hits = [], taken = [];
  for (const r of schemeNameIndex()) {
    let at;
    if (r.word) {
      const m = new RegExp(`(^|[^A-Za-z0-9])${r.key.replace(/[-]/g, "\\-")}(?![A-Za-z0-9])`).exec(text);
      at = m ? m.index + m[1].length : -1;
    } else {
      at = (/[a-z]/.test(r.key) ? lower : text).indexOf(r.key);
    }
    if (at < 0 || hits.some(h => h.s.id === r.s.id)) continue;
    const end = at + r.key.length;
    if (taken.some(([a, b]) => at < b && end > a)) continue; // part of a longer name already matched
    hits.push({ s: r.s, at });
    taken.push([at, end]);
  }
  return hits.sort((a, b) => a.at - b.at).slice(0, max).map(h => h.s);
}

// ─── OFFICIAL LINKS ──────────────────────────────────────────────────────────
// The scheme's apply link, only when it is a real web address.
export function schemeLink(s) {
  const raw = String(s?.apply?.en ?? "").trim();
  if (/^https?:\/\/[^\s]+\.[^\s]+/i.test(raw)) return raw;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(raw)) return `https://${raw}`;
  return null;
}

// The scheme's link only when it is an official site (else null).
export function officialSchemeLink(s) {
  const l = schemeLink(s);
  if (l && isOfficialUrl(l)) return l;
  const hi = schemeLink({ apply: { en: s?.apply?.hi } }); // some entries keep the portal in the Hindi field
  return hi && isOfficialUrl(hi) ? hi : null;
}

const hostOf = (url) => {
  try { return new URL(/^https?:/i.test(url) ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return ""; }
};

// Government-run sites that don't end in .gov.in / .nic.in — central bodies,
// public-sector banks, and state boards / corporations / power companies.
// (Links in our scheme data are NOT trusted automatically: ~60 of them point
// to blogs, news sites or private companies.)
const EXTRA_OFFICIAL = [
  "vikaspedia.in", "mahadiscom.in", "pspcl.in", "creda.in", "kudumbashree.org", "kswdc.org", "kscdc.net",
  "norkaroots.org", "hsfdc.org.in", "tiic.org", "guvnl.in", "jreda.com", "hpsebl.org", "cspdcl.co.in",
  "cgmfpfed.org", "hptdc.in", "cgtourism.in", "karnatakatourism.org", "investkarnataka.co.in",
  "krishakbandhu.net", "cmchistn.com", "nikshay.in", "pmgdisha.in", "mavim.org.in", "mahabocw.in",
  "rajmahilanidhi.org", "dslsa.org", "ayushmanuttarakhand.org", "ibps.in", "chbonline.in", "sfacindia.com",
  "sebexam.org", "orpgujarat.com", "pgrkam.com", "pwdc.co.in", "missionvatsalyaup.in", "icici.bank.in",
  "bankofbaroda.in", "pnbindia.in", "canarabank.com", "unionbankofindia.co.in", "indiapost.gov.in",
  "mygov.in", "india.gov.in", "rbi.org.in", "npci.org.in", "nabard.org", "sidbi.in", "licindia.in",
  "sbi.co.in", "onlinesbi.sbi", "pfrda.org.in", "nsdcindia.org", "ncs.gov.in", "uidai.gov.in",
  "digilocker.gov.in", "umang.gov.in", "jansamarth.in", "standupmitra.in", "udyamregistration.gov.in",
  "kviconline.gov.in", "epfindia.gov.in", "esic.gov.in", "pmjay.gov.in", "nhm.gov.in",
];
let OFFICIAL_HOSTS = null;
function officialHosts() {
  if (OFFICIAL_HOSTS) return OFFICIAL_HOSTS;
  OFFICIAL_HOSTS = new Set(EXTRA_OFFICIAL);
  return OFFICIAL_HOSTS;
}
// The app's own links (developer portfolio / Instagram) — the AI shares these
// when asked who built the app.
const OWN_LINKS = [/^sahnawaz-portfolio\.vercel\.app$/, /^yojanasahay\.vercel\.app$/];
const OWN_PATHS = [/^(?:www\.)?instagram\.com\/sahnawaz\.ui\.dev\/?$/i];
export function isAllowedUrl(url) {
  if (isOfficialUrl(url)) return true;
  const h = hostOf(url);
  if (OWN_LINKS.some(re => re.test(h))) return true;
  const bare = String(url).replace(/^https?:\/\//i, "").replace(/[?#].*$/, "");
  return OWN_PATHS.some(re => re.test(bare));
}

export function isOfficialUrl(url) {
  const h = hostOf(url);
  if (!h) return false;
  if (/(^|\.)(gov|nic)\.in$/.test(h) || /\.gov$/.test(h) || /\.(ac|edu|res)\.in$/.test(h)) return true;
  const set = officialHosts();
  if (set.has(h)) return true;
  for (const o of set) if (h.endsWith("." + o)) return true;
  return false;
}

// [text](url) | https://… | www.…
const LINK_RE = /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()"'`]+|\bwww\.[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>()"'`]*)?)/gi;
const LINK_ONLY_LINE = /^\s*(?:[-•*]\s*)?(?:🔗|🌐|👉)?\s*(?:\*\*)?\s*(?:official\s+)?(?:link|website|portal|apply(?:\s+(?:here|online|at))?|source|sources|read more|more info|लिंक|वेबसाइट|पोर्टल|स्रोत)?\s*(?:\*\*)?\s*[:：\-–]?\s*[.,;]?\s*$/i;
const lineCache = new Map();
function schemesInLine(line) {
  if (lineCache.has(line)) return lineCache.get(line);
  const r = findSchemesInText(line, 1)[0] || null;
  if (lineCache.size > 400) lineCache.clear();
  lineCache.set(line, r);
  return r;
}

export function cleanLinks(text) {
  if (!text || !/https?:\/\/|www\./i.test(text)) return text;
  let ctx = null;
  const out = [];
  for (const line of text.split("\n")) {
    const named = schemesInLine(line);
    if (named) ctx = named;
    else if (/^\s*\d+\.\s/.test(line)) ctx = null; // a new list item about something else
    let changed = false, offline = false;
    // "Source: <news link>" is a citation, not a scheme link — never swap it.
    const isSource = /^\s*(?:[-•*]\s*)?(?:\*\*)?\s*(?:source|sources|स्रोत)/i.test(line);
    const next = line.replace(LINK_RE, (m, mdText, mdUrl, bare) => {
      let url = mdUrl || bare, trail = "";
      if (bare) { const t = url.match(/[.,;:!?)\]'"]+$/); if (t) { trail = t[0]; url = url.slice(0, -trail.length); } }
      if (isAllowedUrl(url)) return m;
      changed = true;
      const sc = isSource ? null : (named || ctx);
      const good = sc ? officialSchemeLink(sc) : null;
      if (good) return mdText ? `[${mdText}](${good})` : good + trail;
      if (sc && !good) offline = true;
      return mdText ? mdText : trail;
    });
    // "• Portfolio:" left with nothing after its link was removed → drop the line.
    if (changed && /^\s*(?:[-•*]\s*)?(?:\*\*)?[^:\n]{1,30}(?:\*\*)?\s*[:：]\s*(?:\*\*)?\s*$/.test(next) && !LINK_ONLY_LINE.test(next)) continue;
    if (changed && LINK_ONLY_LINE.test(next)) {
      // The line was only "🔗 <unofficial link>".
      const msg = /[ऀ-ॿ]/.test(text) ? "🔗 नज़दीकी सरकारी कार्यालय में आवेदन करें" : "🔗 Apply at nearest govt. office";
      if (offline && out[out.length - 1] !== msg) out.push(msg);
      continue;
    }
    out.push(changed ? next.replace(/\s{2,}/g, " ").replace(/\(\s*\)/g, "").trimEnd() : next);
  }
  return out.join("\n");
}
