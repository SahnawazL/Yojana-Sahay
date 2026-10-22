// api/_lib/discoveryInsights.js — Yojana Sahay · Scheme Discovery "insights"
// ─────────────────────────────────────────────────────────────────────────────
// Three things that make the Scheme Discovery agent work on what matters:
//
//  1. DEMAND   What people looked for and didn't find: searches in the app
//              that returned 0 schemes + "Request a scheme" reports. One small
//              AI call turns them into scheme names (+ state) → appMeta/
//              discoveryDemand. The daily run researches the top one first;
//              the admin can research any of them in one tap. When it is
//              published, the person who asked gets a reply in their report.
//  2. GAPS     Official list check: finds the state's own schemes list (a
//              government page, else the Wikipedia list), reads it once and
//              compares every scheme on it with the app →
//              discoveryGaps/{region}: what's missing, plus categories the
//              state has no scheme for at all (e.g. no senior pension).
//  3. UPDATES  The Background Verifier already re-reads every official page
//              on its lap. It now also notices when the page states a
//              DIFFERENT benefit amount → schemeUpdates/{id}. Nothing changes
//              until the admin taps Apply (exact-text edit committed to GitHub).
//
// Admin endpoints: api/deadline-alerts.js action "discoveryInsights".
// ─────────────────────────────────────────────────────────────────────────────

import { SCHEME_DB, INDIA_STATES } from "../../src/schemesData.js";
import { serperSearch } from "./urlFinder.js";
import { updateRepoFile } from "./githubCommit.js";
import { fetchPageText } from "../verify-scheme.js";
import { checkTavilyBudget, noteTavilyCall } from "./tavilyBudget.js";
import { recordAiCall } from "./firebaseAdmin.js";
import { logApiCallToHistory } from "./apiCallHistory.js";
import { getUrlIssueFilePath } from "./urlIssues.js";
import { findDuplicate, sameScheme, groqJson, regionDocId, REGIONS } from "./schemeDiscovery.js";

const DAY = 86_400_000;
const AI_MODEL = "openai/gpt-oss-20b";

// ── 1. DEMAND ────────────────────────────────────────────────────────────────
const SCHEME_WORDS = /yojana|yojna|scheme|schem|yojona|पेंशन|योजना|scholarship|pension|bhatta|nidhi|samman|card|awas|kisan|ladli|ladki|vandan|bima|insurance|subsidy|loan|anudan|sahay/i;
const normQ = q => String(q || "").toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ").trim();
const scrub = t => String(t || "").replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]").replace(/\+?\d[\d\s-]{6,}\d/g, "[number]").replace(/\s+/g, " ").trim();
const stateIn = t => {
  const low = String(t || "").toLowerCase();
  return INDIA_STATES.find(s => low.includes(s.toLowerCase()) || (s === "Jammu & Kashmir" && /jammu|kashmir/.test(low)) || (s === "Andaman & Nicobar" && /andaman/.test(low))) ?? null;
};
const knownAnywhere = (name, region) => {
  if (region) return !!findDuplicate(name, region);
  return SCHEME_DB.some(s => !s.duplicateOf && (sameScheme(s.name?.en ?? "", name) || (s.name?.hi && s.name.hi === name)));
};

export async function scanDemand(db) {
  const since = Date.now() - 60 * DAY;
  // a) searches that found nothing
  const usage = (await db.collection("appStats").doc("usage").get()).data() ?? {};
  const agg = new Map();
  for (const r of Array.isArray(usage.schemeSearches) ? usage.schemeSearches : []) {
    if (r?.n !== 0 || !r.q) continue;
    if (r.ts && Date.parse(r.ts) < since) continue;
    const k = normQ(r.q);
    if (k.length < 4 || k.length > 80) continue;
    const a = agg.get(k) ?? { text: String(r.q).trim().slice(0, 80), searches: 0, last: r.ts ?? null };
    a.searches++; if (r.ts && (!a.last || r.ts > a.last)) a.last = r.ts;
    agg.set(k, a);
  }
  const searches = [...agg.values()]
    .filter(a => a.searches >= 2 || SCHEME_WORDS.test(a.text))
    .sort((a, b) => b.searches - a.searches).slice(0, 40);
  // b) "Request a scheme" reports still open
  let reports = [];
  try {
    const snap = await db.collection("reports").where("type", "==", "scheme_request").limit(80).get();
    reports = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.status !== "resolved" && r.status !== "closed")
      .map(r => ({ id: r.id, text: scrub(`${r.subject ?? ""} — ${r.message ?? ""}`).slice(0, 300), at: r.createdAt?.toDate?.()?.toISOString?.() ?? null }))
      .filter(r => r.text.replace(/[—\s]/g, "").length >= 4)
      .slice(0, 30);
  } catch { /* no index / no reports */ }

  if (!searches.length && !reports.length) {
    const doc = { at: new Date().toISOString(), items: [], scanned: { searches: 0, reports: 0 } };
    await db.collection("appMeta").doc("discoveryDemand").set(doc);
    return doc;
  }

  // c) one AI call: which of these are real scheme names, and which state?
  const lines = [
    ...searches.map((s, i) => `S${i}: ${s.text}`),
    ...reports.map((r, i) => `R${i}: ${r.text}`),
  ];
  const system =
    "You read short texts from an Indian government-scheme app: searches that found nothing (S…) and user requests to add a scheme (R…). " +
    'Respond ONLY with JSON: {"items":[{"id":"S0","scheme":true|false,"name":"official scheme name in English","state":"exact Indian state/UT name" or "Central" or null}]}. ' +
    "scheme=true ONLY when the text names (or clearly describes) one specific government welfare scheme / yojana. " +
    "Generic words (\"pension\", \"farmer scheme\", \"loan\"), greetings, personal problems and app feedback → scheme=false. " +
    "name: the scheme's proper English name (fix spelling, transliterate Hindi). state: only if the text or the scheme itself is clearly from one state; " +
    "\"Central\" for central government schemes; null if unsure. Include every id once.";
  const ai = await groqJson(AI_MODEL, system, lines.join("\n").slice(0, 9000), 1800);
  const verdicts = Array.isArray(ai.data?.items) ? ai.data.items : [];

  const items = new Map();
  for (const v of verdicts) {
    if (v?.scheme !== true || typeof v.name !== "string") continue;
    const name = v.name.replace(/\s+/g, " ").trim().slice(0, 120);
    if (name.length < 4) continue;
    const id = String(v.id || "");
    const src = id.startsWith("S") ? searches[+id.slice(1)] : id.startsWith("R") ? reports[+id.slice(1)] : null;
    if (!src) continue;
    let region = v.state === "Central" ? "national" : INDIA_STATES.includes(v.state) ? v.state : stateIn(src.text);
    if (region && !REGIONS.includes(region)) region = null;
    if (knownAnywhere(name, region)) continue;            // already in the app
    const key = [...items.keys()].find(k => sameScheme(k, name)) ?? name;
    const it = items.get(key) ?? { name, region, searches: 0, requests: 0, reportIds: [], examples: [], last: null };
    if (!it.region && region) it.region = region;
    if (id.startsWith("S")) { it.searches += src.searches; it.last = [it.last, src.last].filter(Boolean).sort().pop() ?? null; }
    else { it.requests++; it.reportIds.push(src.id); it.last = [it.last, src.at].filter(Boolean).sort().pop() ?? null; }
    if (it.examples.length < 3) it.examples.push(src.text.slice(0, 90));
    items.set(key, it);
  }
  // keep earlier "dismissed" marks
  let prev = {};
  try { prev = (await db.collection("appMeta").doc("discoveryDemand").get()).data() ?? {}; } catch { /* ignore */ }
  const dismissed = new Set((prev.dismissed ?? []).map(String));
  const list = [...items.values()]
    .filter(it => !dismissed.has(it.name.toLowerCase()))
    .sort((a, b) => (b.requests * 3 + b.searches) - (a.requests * 3 + a.searches))
    .slice(0, 30);
  const doc = { at: new Date().toISOString(), items: list, dismissed: [...dismissed].slice(-200), scanned: { searches: searches.length, reports: reports.length }, ...(ai.error ? { aiError: String(ai.error).slice(0, 160) } : {}) };
  await db.collection("appMeta").doc("discoveryDemand").set(doc);
  return doc;
}

export async function refreshDemandIfStale(db, maxAgeHours = 20) {
  try {
    const d = (await db.collection("appMeta").doc("discoveryDemand").get()).data();
    if (d?.at && Date.now() - Date.parse(d.at) < maxAgeHours * 3600e3) return d;
    return await scanDemand(db);
  } catch (err) {
    console.warn("[discoveryInsights] demand scan failed:", err.message);
    return null;
  }
}

export async function dismissDemand(db, name) {
  const ref = db.collection("appMeta").doc("discoveryDemand");
  const d = (await ref.get()).data() ?? {};
  const n = String(name || "").trim().toLowerCase();
  if (!n) throw new Error("name required");
  const dismissed = [...new Set([...(d.dismissed ?? []), n])].slice(-200);
  await ref.set({ dismissed, items: (d.items ?? []).filter(it => it.name.toLowerCase() !== n) }, { merge: true });
  return { ok: true };
}

// ── 2. GAPS ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "women",      label: "Women",            re: /women|girl|maternity|widow|mahila/i },
  { key: "farmers",    label: "Farmers",          re: /farmer|fisher|animal|livestock|agri|dairy/i },
  { key: "students",   label: "Students",         re: /student|education|scholarship/i },
  { key: "senior",     label: "Senior citizens",  re: /senior|old age|pension/i },
  { key: "health",     label: "Health",           re: /health|medic|wellness|medicine|insurance/i },
  { key: "housing",    label: "Housing",          re: /housing|awas/i },
  { key: "workers",    label: "Workers & jobs",   re: /labour|worker|employment|skill|unemploy|construction/i },
  { key: "disability", label: "Disability",       re: /disab|divyang/i },
];
export function categoryGaps(region) {
  if (region === "national") return [];
  const mine = SCHEME_DB.filter(s => !s.duplicateOf && s.scope === "state" && s.state === region);
  // Categories with no scheme, or only one, in this state — worth a focused search.
  return CATEGORIES.map(c => ({ key: c.key, label: c.label, count: mine.filter(s => c.re.test(`${s.tag?.en ?? ""} ${s.category ?? ""} ${s.name?.en ?? ""}`)).length }))
    .filter(c => c.count <= 1);
}

const GENERIC_TITLE = /check eligibility|पात्रता|^myscheme|myscheme\.gov\.in|^schemes?$|^home$|search/i;
const regionWords = r => r === "Jammu & Kashmir" ? ["jammu", "kashmir"] : r === "Andaman & Nicobar" ? ["andaman"] : [r.toLowerCase()];

// Find the state's own schemes list (a government page first, else the
// Wikipedia "List of schemes of the government of …" page), read it once and
// let the AI list every individual-benefit scheme on it. Cost per state:
// 2 web searches + 1 page read (counted in the Tavily budget) + 1 AI call.
export async function scanOfficialList(db, region) {
  if (!REGIONS.includes(region) || region === "national") throw new Error("Choose a state or UT");
  const serperKey = process.env.SERPER_API_KEY?.trim();
  const tavilyKey = (process.env.TAVILY_VERIFY_KEY ?? process.env.TAVILY_API_KEY)?.trim();
  if (!serperKey) throw new Error("SERPER_API_KEY missing");
  if (!tavilyKey) throw new Error("TAVILY_VERIFY_KEY missing");
  const words = regionWords(region);
  const [gov, wiki] = await Promise.all([
    serperSearch(`${region} government welfare schemes list site:gov.in`, serperKey, 10),
    serperSearch(`List of schemes of the government of ${region}`, serperKey, 6),
  ]);
  const about = r => words.some(w => `${r.title} ${r.snippet} ${r.url}`.toLowerCase().includes(w));
  const host = u => { try { return new URL(u).hostname; } catch { return ""; } };
  const govList = (gov.results ?? []).find(r => /\.(gov|nic)\.in$/.test(host(r.url)) && !/\.pdf(\?|$)/i.test(r.url)
    && /scheme|yojana|योजना/i.test(`${r.title} ${r.url}`) && /list|schemes|all|welfare|yojanas/i.test(`${r.title} ${r.url}`) && about(r));
  const wikiList = (wiki.results ?? []).find(r => /(^|\.)wikipedia\.org$/.test(host(r.url)) && /list_of_schemes|schemes/i.test(r.url) && about(r));
  const pick = govList ?? wikiList ?? null;
  // myScheme results with a real scheme name in the title count too (free).
  const extra = (gov.results ?? []).filter(r => /(^|\.)myscheme\.gov\.in$/.test(host(r.url)) && about(r))
    .map(r => ({ name: String(r.title).replace(/\s*[|\-–—]\s*my\s*scheme.*$/i, "").trim(), url: r.url }))
    .filter(x => x.name.length >= 6 && !GENERIC_TITLE.test(x.name));

  let names = [], listUrl = null, listSource = null, error = null;
  if (pick) {
    const budget = await checkTavilyBudget(db);
    if (!budget.ok) error = "monthly page-read budget reached";
    else {
      const page = await fetchPageText(pick.url, tavilyKey, { excerpt: raw => String(raw || "").replace(/\s+/g, " ").slice(0, 14000) });
      for (let c = 0; c < (page.credits ?? (page.billed ? 1 : 0)); c++) { noteTavilyCall(); recordAiCall({ service: "tavily-verify" }).catch(() => {}); logApiCallToHistory("tavilyVerifyCalls").catch(() => {}); }
      if (!page.text) error = `list page unreadable — ${page.error ?? "no text"}`;
      else {
        listUrl = pick.url; listSource = govList ? "government site" : "Wikipedia list";
        const system =
          `You read a page listing government schemes of ${region}, India. ` +
          'Respond ONLY with JSON: {"schemes":["official scheme name", ...]}. ' +
          `List every specific, named scheme / yojana of the ${region} government on the page that gives a direct benefit to individuals or families ` +
          "(cash, pension, scholarship, subsidy, insurance, free service, loan, training). " +
          "Skip central government schemes, departments, missions without an individual benefit, infrastructure projects, events and discontinued schemes. " +
          "Use the name as written on the page (English). At most 80 names.";
        const ai = await groqJson(AI_MODEL, system, page.text, 2200);
        if (ai.error) error = `AI could not read the list — ${String(ai.error).slice(0, 120)}`;
        names = (Array.isArray(ai.data?.schemes) ? ai.data.schemes : []).filter(n => typeof n === "string")
          .map(n => n.replace(/\s+/g, " ").trim().slice(0, 120)).filter(n => n.length >= 5);
      }
    }
  } else {
    error = "no schemes list page found for this state";
  }
  const all = [];
  for (const n of [...names.map(name => ({ name, url: null })), ...extra]) {
    if (!all.some(a => sameScheme(a.name, n.name))) all.push(n);
  }
  const missing = all.filter(o => !findDuplicate(o.name, region));
  const doc = {
    region, at: new Date().toISOString(),
    officialSeen: all.length, missing: missing.slice(0, 30), inApp: all.length - missing.length,
    appCount: SCHEME_DB.filter(s => !s.duplicateOf && s.scope === "state" && s.state === region).length,
    categoryGaps: categoryGaps(region), listUrl, listSource,
    ...(error ? { error } : {}),
  };
  await db.collection("discoveryGaps").doc(regionDocId(region)).set(doc);
  return doc;
}

export async function listGaps(db) {
  const snap = await db.collection("discoveryGaps").limit(40).get();
  return snap.docs.map(d => d.data()).sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

// ── 3. UPDATES ───────────────────────────────────────────────────────────────
export const UPDATE_MIN_CONFIDENCE = 0.8;
export async function suggestBenefitUpdate(db, scheme, check, sourceUrl) {
  if (!db || !scheme?.id || !check?.changed || (check.confidence ?? 0) < UPDATE_MIN_CONFIDENCE) return false;
  const oldEn = scheme.benefit?.en ?? "";
  if (!oldEn || check.now.trim() === oldEn.trim()) return false;
  const ref = db.collection("schemeUpdates").doc(String(scheme.id));
  const prev = (await ref.get()).data();
  if (prev && prev.newEn === check.now && (prev.status === "pending" || prev.status === "dismissed")) return false;
  await ref.set({
    schemeId: scheme.id, name: scheme.name?.en ?? scheme.id, state: scheme.scope === "state" ? scheme.state : "Central",
    field: "benefit", oldEn, oldHi: scheme.benefit?.hi ?? "", newEn: check.now, newHi: check.nowHi || "",
    confidence: check.confidence, source: sourceUrl ?? null, status: "pending", createdAt: new Date(),
  });
  return true;
}

export async function listUpdates(db) {
  const snap = await db.collection("schemeUpdates").where("status", "==", "pending").limit(50).get();
  return snap.docs.map(d => {
    const x = d.data();
    return { id: d.id, ...x, createdAt: x.createdAt?.toDate?.()?.toISOString?.() ?? null };
  }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

const countOf = (text, needle) => needle ? text.split(needle).length - 1 : 0;
export async function applyUpdate(db, id, by) {
  const ref = db.collection("schemeUpdates").doc(String(id));
  const u = (await ref.get()).data();
  if (!u || u.status !== "pending") throw new Error("This update is no longer waiting");
  const scheme = SCHEME_DB.find(s => s.id === u.schemeId);
  if (!scheme) throw new Error("Scheme not found in the app any more");
  const path = getUrlIssueFilePath(scheme);
  const oldEn = JSON.stringify(u.oldEn), newEn = JSON.stringify(u.newEn);
  const oldHi = u.oldHi ? JSON.stringify(u.oldHi) : "", newHi = u.newHi ? JSON.stringify(u.newHi) : "";
  let hiDone = false;
  const r = await updateRepoFile(path, text => {
    if (countOf(text, oldEn) !== 1) throw new Error("The current benefit text wasn't found exactly once in the scheme file — it may have been edited already. Please update it by hand.");
    let next = text.replace(oldEn, () => newEn);
    if (oldHi && newHi && countOf(next, oldHi) === 1) { next = next.replace(oldHi, () => newHi); hiDone = true; }
    return { text: next, changed: next !== text };
  }, `Scheme update: ${u.name} — benefit amount (approved by admin)`);
  await ref.set({ status: "applied", appliedAt: new Date(), appliedBy: by ?? "admin", commitUrl: r.commitUrl || null, hindiUpdated: hiDone }, { merge: true });
  return { ok: true, hindiUpdated: hiDone, note: hiDone ? null : "English updated — the Hindi text was not changed automatically; please check it." };
}

export async function dismissUpdate(db, id, by) {
  await db.collection("schemeUpdates").doc(String(id)).set({ status: "dismissed", dismissedAt: new Date(), dismissedBy: by ?? "admin" }, { merge: true });
  return { ok: true };
}

// ── Everything the Agents tab shows in one call ──────────────────────────────
export async function loadInsights(db) {
  const [demand, gaps, updates] = await Promise.all([
    db.collection("appMeta").doc("discoveryDemand").get().then(s => s.data() ?? null).catch(() => null),
    listGaps(db).catch(() => []),
    listUpdates(db).catch(() => []),
  ]);
  return { demand, gaps, updates };
}

