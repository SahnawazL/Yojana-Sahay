// api/_lib/schemeDiscovery.js — Yojana Sahay · Scheme Discovery agent
// ─────────────────────────────────────────────────────────────────────────────
// Finds Indian government welfare schemes that are NOT yet in the app,
// researches each one on its official page and adds it — automatically when
// it is certain, otherwise as a draft for one-tap approval in the Agents tab.
//
// One run (daily, GitHub Actions → POST /api/agent-auto-fix {action:"discover"},
// or admin "▶ Run"):
//
//   1. REGIONS   2 regions per run in rotation: Central govt + every state/UT
//   2. SEARCH    Serper news + web search for new / current schemes there
//   3. PICK      Groq (gpt-oss-20b) lists the specific, named schemes for
//                individuals in those results that aren't in the app yet
//   4. DEDUPE    fuzzy name match against all schemes in the app, earlier
//                drafts and earlier rejections
//   5. RESEARCH  official page (Serper → prefer .gov.in/.nic.in) read via
//                Tavily; Groq (gpt-oss-120b) fills a STRICT form in English +
//                Hindi: benefit, documents, apply link, eligibility …
//   6. RULE      eligibility answers (fixed vocabulary = the app's own profile
//                options) are compiled into the scheme's match() rule by code.
//                The AI never writes code.
//   7. DECIDE    auto-publish only if every check passes (official .gov.in /
//                .nic.in source, page names the scheme, confidence ≥ 0.85,
//                currently running, valid Hindi, sensible rule, not a
//                duplicate). Anything else → draft for review.
//   8. PUBLISH   inserted into the right state file (or schemesData.js for
//                Central schemes) between <auto-scheme> markers and committed
//                to GitHub → Vercel redeploys. "Remove" deletes exactly that
//                block again.
//
// Budget per run (MAX_NEW_PER_RUN = 3): ≤ 2–5 Serper searches, ≤ 3 Tavily
// page reads (counted in the shared monthly Tavily budget), 1 + 3 Groq calls.
//
// Firestore (Admin SDK only — no client rules needed):
//   schemeDrafts/{schemeId}   status: pending | published | rejected | removed
//   appMeta/discoveryState    rotation cursor + recently seen candidate names
// ─────────────────────────────────────────────────────────────────────────────

import { SCHEME_DB, INDIA_STATES, CATEGORIES } from "../../src/schemesData.js";
import { loadGroqKeys, callGroq, fetchPageText, parseModelJson } from "../verify-scheme.js";
import { serperSearch, domainScore, JUNK_HOSTS } from "./urlFinder.js";
import { nameTokens } from "./urlRepairAgent.js";
import { readRepoFile, updateRepoFile } from "./githubCommit.js";
import { getUrlIssueFilePath } from "./urlIssues.js";
import { isPublicHttpUrl } from "./urlTools.js";
import { checkTavilyBudget, noteTavilyCall } from "./tavilyBudget.js";
import { recordAiCall } from "./firebaseAdmin.js";
import { logApiCallToHistory } from "./apiCallHistory.js";
import { createProgress } from "./agentProgress.js";

export const MAX_NEW_PER_RUN  = Math.max(0, Number(process.env.DISCOVERY_PER_RUN ?? 3) || 0);
const REGIONS_PER_RUN         = 2;
const AUTO_PUBLISH_CONFIDENCE = 0.85;
const PICK_MODEL              = "openai/gpt-oss-20b";
const DRAFT_MODEL             = "openai/gpt-oss-120b";
const MAX_RUNTIME_MS          = 240_000;

export const REGIONS = ["national", ...INDIA_STATES];

// ── The app's own profile vocabulary (App.jsx questions + adaptive questions) ──
export const VOCAB = {
  who:            ["farmer", "student", "women", "senior", "business", "general"],
  income:         ["below1", "1to3", "3to6", "above6"],
  age:            ["below18", "18to35", "35to60", "above60"],
  area:           ["rural", "urban", "semi"],
  house:          ["yes", "no", "kutcha"],
  caste:          ["general", "obc", "sc", "st", "ews"],
  educationLevel: ["class1to8", "class9to12", "undergrad", "postgrad"],
  rationCard:     ["none", "apl", "bpl", "aay"],
  landHolding:    ["below1", "1to2", "2to5", "5plus"],
};
const LIST_FIELDS = Object.keys(VOCAB);
const KEYWORDS    = ["class10", "class12", "iti", "polytechnic", "skill", "dropout"];

// Category → icon/colour, from the app's own CATEGORIES (+ a few extras).
const CATEGORY_STYLE = Object.fromEntries((CATEGORIES?.en ?? []).map(c => [c.label.split(" ")[0].toLowerCase(), { icon: c.icon, color: c.color }]));
const CATEGORY_LIST  = ["Farmer", "Student", "Women", "Senior", "Business", "Housing", "Health", "Insurance", "Pension", "Skill / Youth", "Child", "Labour", "Food", "Rural", "Disability", "Solar", "Maternity", "Employment", "General"];
function styleFor(category) {
  const key = String(category || "").split(/[ /]/)[0].toLowerCase();
  return CATEGORY_STYLE[key] ?? { employment: { icon: "💼", color: "#0E7490" }, general: { icon: "📋", color: "#334155" } }[key] ?? { icon: "📋", color: "#334155" };
}

const DEVANAGARI = /[ऀ-ॿ]/;
const istToday = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

// ── Names & duplicates ───────────────────────────────────────────────────────
function tokensOf(name) { return nameTokens(name).filter(t => !/^\d+$/.test(t)); }

export function sameScheme(a, b) {
  const ta = tokensOf(a), tb = tokensOf(b);
  if (!ta.length || !tb.length) return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  const sa = new Set(ta), sb = new Set(tb);
  const inter = ta.filter(t => sb.has(t)).length;
  const [short, long] = sa.size <= sb.size ? [sa, sb] : [sb, sa];
  if ([...short].every(t => long.has(t))) return true;          // one name contains the other
  return inter / new Set([...sa, ...sb]).size >= 0.6;          // mostly the same words
}

function seenKey(region, name) {
  return `${region}|${tokensOf(name).join(" ") || String(name).trim().toLowerCase()}`;
}

function regionSchemes(region, schemes = SCHEME_DB) {
  return region === "national"
    ? schemes.filter(s => s.scope === "national")
    : schemes.filter(s => s.scope === "national" || s.state === region);
}

export function findDuplicate(name, region, schemes = SCHEME_DB) {
  return regionSchemes(region, schemes).find(s => sameScheme(name, s.name?.en ?? "") || (s.name?.hi && sameScheme(name, s.name.hi))) ?? null;
}

// ── Eligibility → match() source ─────────────────────────────────────────────
export function cleanEligibility(e = {}) {
  const out = {};
  for (const f of LIST_FIELDS) {
    const vals = Array.isArray(e[f]) ? [...new Set(e[f].filter(v => VOCAB[f].includes(v)))] : [];
    if (vals.length && vals.length < VOCAB[f].length) out[f] = vals; // "all values" = no restriction
  }
  if (e.gender === "female" || e.gender === "male") out.gender = e.gender;
  if (e.disability === true) out.disability = true;
  return out;
}

export function compileMatch(elig, scope, state) {
  const parts = [];
  if (scope === "state") parts.push(`a.state === ${JSON.stringify(state)}`);
  const list = (f, vals) => vals.length === 1 ? `a.${f} === ${JSON.stringify(vals[0])}` : `${JSON.stringify(vals)}.includes(a.${f})`;
  for (const f of LIST_FIELDS) if (elig[f]) parts.push(list(f, elig[f]));
  if (elig.gender === "female" && !(elig.who?.length === 1 && elig.who[0] === "women")) parts.push(`(a.who === "women" || a.gender === "female")`);
  if (elig.gender === "male") parts.push(`a.gender === "male"`);
  if (elig.disability) parts.push(`(!!a.disability && a.disability !== "none")`);
  return parts.length ? parts.join(" && ") : "true";
}

// Proves a rule can match a real profile (rules are AND-ed field limits, so a
// "witness" built from the first allowed value of every field must pass), and
// estimates how broad it is over the main checker answers.
export function ruleStats(matchSrc, state, elig = {}) {
  // matchSrc is built only from whitelisted vocabulary + JSON.stringify'd literals.
  const fn = new Function("a", `return (${matchSrc});`);
  const witness = { state: state || "Bihar", who: "general", income: "below1", age: "18to35", area: "rural", caste: "general", house: "no", gender: "female", disability: "none", educationLevel: "undergrad", rationCard: "bpl", landHolding: "below1" };
  for (const f of LIST_FIELDS) if (elig[f]?.length) witness[f] = elig[f][0];
  if (elig.gender) witness.gender = elig.gender;
  if (elig.disability) witness.disability = "locomotor";
  const reachable = !!fn(witness);
  let hit = 0, total = 0;
  for (const who of VOCAB.who) for (const income of VOCAB.income) for (const age of VOCAB.age)
    for (const area of VOCAB.area) for (const caste of VOCAB.caste) for (const house of VOCAB.house) {
      total++;
      if (fn({ ...witness, who, income, age, area, caste, house })) hit++;
    }
  return { reachable, hit, total, share: hit / total };
}

// ── Page excerpt for drafting ────────────────────────────────────────────────
const DRAFT_KEYWORDS = /(eligib|benefit|assistance|amount|₹|rs\.?\s*\d|documents?\s*required|how to apply|apply online|objective|who can apply|beneficiar|last date|पात्रता|लाभ|दस्तावेज|आवेदन)/gi;
export function draftExcerpt(raw, maxChars = 7000) {
  const text = String(raw || "").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  let out = text.slice(0, 2500);
  DRAFT_KEYWORDS.lastIndex = 0;
  let m, lastEnd = 2500;
  while ((m = DRAFT_KEYWORDS.exec(text)) && out.length < maxChars) {
    const from = Math.max(lastEnd, m.index - 200), to = Math.min(text.length, m.index + 500);
    if (to > from) { out += " … " + text.slice(from, to); lastEnd = to; }
  }
  return out.slice(0, maxChars);
}

// ── Groq helpers ─────────────────────────────────────────────────────────────
async function groqJson(model, system, user, maxTokens) {
  const keys = loadGroqKeys();
  if (!keys.length) return { error: "No Groq keys configured", config: true };
  const r = await callGroq(keys, {
    model, max_completion_tokens: maxTokens, reasoning_effort: "low", include_reasoning: false,
    temperature: 0.1, response_format: { type: "json_object" },
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  recordAiCall({ service: "groq-verify", keyIdx: r.status === 200 ? r.keyIdx : -1, count429: r.count429, failedKeys: r.failedKeys }).catch(() => {});
  if (r.status !== 200) return { error: r.data?.error?.message ?? `Groq ${r.status}`, rateLimited: !!r.rateLimited || r.status === 429 };
  logApiCallToHistory("groqVerifyCalls").catch(() => {});
  const parsed = parseModelJson(r.data?.choices?.[0]?.message?.content ?? "");
  return parsed ? { data: parsed } : { error: "AI reply was not valid JSON" };
}

function pickPrompt(region, existingNames, results) {
  const where = region === "national" ? "the Central Government of India (national schemes)" : `the state/UT of ${region}`;
  const system =
    "You find Indian government welfare schemes in web search results. " +
    'Respond ONLY with JSON: {"candidates":[{"name":"official scheme name in English","region":"national" or exact state name,"url":"result url","reason":"short"}]}.\n' +
    `Region: ${where}.\n` +
    "Include ONLY specific, named schemes / yojanas that give a direct benefit to individuals or families " +
    "(cash, subsidy, scholarship, pension, insurance, loan, free service, training). " +
    "Exclude: infrastructure projects, policies, missions without an individual benefit, events, exams, recruitment / job notices, " +
    "schemes of other states, discontinued schemes, and anything in the 'Already in the app' list (even if spelled differently). " +
    "At most 5 candidates. Empty list if none.";
  const user =
    `Already in the app (${existingNames.length}):\n${existingNames.slice(0, 220).join("; ")}\n\n` +
    "Search results:\n" + results.map((r, i) => `${i + 1}. ${r.title} — ${r.snippet || ""} — ${r.url}`).join("\n");
  return { system, user };
}

function draftPrompt(candidate, region, pageText, sourceUrl) {
  const system =
    "You turn an official Indian government scheme webpage into a structured entry for a citizen app. " +
    `Today is ${istToday()}. Use ONLY facts in the page text — never invent amounts, dates or rules.\n` +
    "Respond ONLY with JSON:\n" +
    '{"isWelfareScheme":bool,"isCurrent":bool,"confidence":0.0-1.0,' +
    '"scope":"national"|"state","state":"exact state name or null",' +
    '"name":{"en":"","hi":""},"ministry":{"en":"","hi":""},"benefit":{"en":"","hi":""},' +
    `"category":one of ${JSON.stringify(CATEGORY_LIST)},"tag":{"en":"Category / Sub","hi":""},` +
    '"annual":number,"applyType":"online"|"offline","applyUrl":"url or null",' +
    '"docs":{"en":[],"hi":[]},"lastDate":"YYYY-MM-DD" or null,' +
    `"keywords":subset of ${JSON.stringify(KEYWORDS)},` +
    '"eligibility":{' + LIST_FIELDS.map(f => `"${f}":subset of ${JSON.stringify(VOCAB[f])}`).join(",") +
    ',"gender":"female"|"male"|null,"disability":bool},' +
    '"evidence":"one short quote from the page"}\n' +
    "Rules:\n" +
    "- isWelfareScheme: a scheme giving a direct benefit to individuals/families. isCurrent: running now (not closed down / replaced).\n" +
    "- name.hi, ministry.hi, benefit.hi, tag.hi, docs.hi: natural Hindi in Devanagari. docs.en and docs.hi same length (1–6 items).\n" +
    "- benefit: concrete, ≤ 90 characters (e.g. \"₹6,000/year in 3 instalments to small farmers\").\n" +
    "- annual: rough ₹ value per year to one beneficiary (one-time grants count once); 0 if not money.\n" +
    "- eligibility: list ONLY what the page restricts; [] means no restriction. income is yearly family income: " +
    "below1 = under ₹1 lakh, 1to3 = ₹1–3 lakh, 3to6 = ₹3–6 lakh, above6 = over ₹6 lakh. " +
    "who: farmer, student, women, senior (60+), business (self-employed/entrepreneur), general (anyone else). " +
    "age: below18, 18to35, 35to60, above60. house: yes = owns pucca house, no = no house, kutcha = kutcha house. " +
    "rationCard: bpl/aay/apl/none. landHolding in acres.\n" +
    "- confidence: 1.0 only if the page clearly describes this exact scheme, its benefit and eligibility.";
  const user =
    `Scheme to describe: ${candidate.name}\nRegion: ${region === "national" ? "Central Government (national)" : region}\n` +
    `Source page: ${sourceUrl}\n\nPage text:\n${pageText}`;
  return { system, user };
}

// ── Find the official page for a candidate ──────────────────────────────────
async function findSourceUrl(candidate, region, serperKey, out) {
  const direct = candidate.url && isPublicHttpUrl(candidate.url) ? candidate.url : null;
  if (direct && domainScore(direct) >= 0.9) return direct;
  if (!serperKey) return direct;
  out.serperCalls++;
  const where = region === "national" ? "India" : region;
  const r = await serperSearch(`"${candidate.name}" ${where} official site scheme eligibility`, serperKey, 8);
  const ok = (r.results ?? []).filter(x => isPublicHttpUrl(x.url) && !/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(x.url) && !JUNK_HOSTS.test(safeHost(x.url)));
  return ok.find(x => domainScore(x.url) >= 0.9)?.url ?? direct ?? ok[0]?.url ?? null;
}
function safeHost(u) { try { return new URL(u).hostname; } catch { return ""; } }

// ── Validate an AI draft → scheme object + problems ──────────────────────────
function slugify(name, region = "") {
  const regionWords = new Set(String(region).toLowerCase().split(/[^a-z]+/).filter(Boolean));
  const words = tokensOf(name).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w && !regionWords.has(w));
  return (words.slice(0, 3).join("_") || "scheme").slice(0, 32);
}
function idPrefixFor(region, schemes = SCHEME_DB) {
  if (region === "national") return "";
  const counts = {};
  for (const s of schemes) if (s.state === region) { const p = String(s.id).split("_")[0]; counts[p] = (counts[p] || 0) + 1; }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 3 ? `${best[0]}_` : `${region.toLowerCase().replace(/[^a-z]+/g, "")}_`;
}
const str = (v, max = 160) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export function buildScheme(ai, { candidate, region, sourceUrl, pageText, schemes = SCHEME_DB, takenIds = new Set() }) {
  const problems = [];
  const hard = [];
  const scope = region === "national" ? "national" : "state";
  const state = scope === "state" ? region : null;

  if (ai.isWelfareScheme !== true) hard.push("not a welfare scheme for individuals");
  const conf = typeof ai.confidence === "number" ? Math.max(0, Math.min(1, ai.confidence)) : 0;
  if (ai.isCurrent === false) (conf >= 0.7 ? hard : problems).push("scheme looks discontinued / not running");
  if (ai.scope && ai.scope !== scope) problems.push(`AI says scope "${ai.scope}" but it was found under ${region}`);
  if (scope === "state" && ai.state && ai.state !== state) problems.push(`AI says state "${ai.state}"`);

  const name = { en: str(ai.name?.en, 120), hi: str(ai.name?.hi, 120) };
  if (!name.en) hard.push("no scheme name");
  const dup = name.en ? findDuplicate(name.en, region, schemes) : null;
  if (dup) hard.push(`already in the app as "${dup.name?.en}" (${dup.id})`);

  const ministry = { en: str(ai.ministry?.en, 90) || (scope === "national" ? "Government of India" : `Government of ${state}`), hi: str(ai.ministry?.hi, 90) || (scope === "national" ? "भारत सरकार" : `${state} सरकार`) };
  const benefit  = { en: str(ai.benefit?.en, 110), hi: str(ai.benefit?.hi, 110) };
  const category = CATEGORY_LIST.includes(ai.category) ? ai.category : "General";
  const tag      = { en: str(ai.tag?.en, 60) || category, hi: str(ai.tag?.hi, 60) };
  const docsEn   = (Array.isArray(ai.docs?.en) ? ai.docs.en : []).map(d => str(d, 60)).filter(Boolean).slice(0, 6);
  const docsHi   = (Array.isArray(ai.docs?.hi) ? ai.docs.hi : []).map(d => str(d, 60)).filter(Boolean).slice(0, 6);
  const docs     = docsEn.length && docsEn.length === docsHi.length ? { en: docsEn, hi: docsHi } : { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] };
  if (!(docsEn.length && docsEn.length === docsHi.length)) problems.push("documents list missing or English/Hindi mismatch — set to Aadhaar only");

  if (!benefit.en) problems.push("no benefit text");
  for (const [k, v] of [["name", name.hi], ["benefit", benefit.hi], ["tag", tag.hi]]) if (!v || !DEVANAGARI.test(v)) problems.push(`Hindi ${k} missing`);
  if (!name.hi) name.hi = name.en;
  if (!benefit.hi) benefit.hi = benefit.en;
  if (!tag.hi) tag.hi = tag.en;

  const annual = Number.isFinite(Number(ai.annual)) ? Math.max(0, Math.min(10_000_000, Math.round(Number(ai.annual)))) : 0;
  const applyUrlAi = typeof ai.applyUrl === "string" && isPublicHttpUrl(ai.applyUrl.trim()) ? ai.applyUrl.trim() : null;
  const applyUrl = applyUrlAi && domainScore(applyUrlAi) >= 0.9 ? applyUrlAi : sourceUrl;
  const applyType = ai.applyType === "offline" ? "offline" : "online";
  const official = domainScore(sourceUrl) >= 0.9;
  if (!official) problems.push("source is not an official .gov.in / .nic.in page");

  let lastDate = typeof ai.lastDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ai.lastDate) ? ai.lastDate : null;
  if (lastDate && lastDate < istToday()) lastDate = null; // a past date isn't useful for a new entry

  const keywords = Array.isArray(ai.keywords) ? [...new Set(ai.keywords.filter(k => KEYWORDS.includes(k)))] : [];

  const elig = cleanEligibility(ai.eligibility);
  const matchSrc = compileMatch(elig, scope, state);
  let stats = { share: 0, reachable: false };
  try { stats = ruleStats(matchSrc, state, elig); } catch (e) { hard.push(`rule error: ${e.message}`); }
  if (!stats.reachable) hard.push("eligibility rule matches nobody");
  if (scope === "national" && matchSrc === "true") problems.push("rule matches everyone in India — check eligibility");

  // The page must actually be about this scheme.
  const pageLower = String(pageText || "").toLowerCase();
  const toks = tokensOf(name.en);
  const present = toks.length ? toks.filter(t => pageLower.includes(t)).length / toks.length : 0;
  if (present < 0.6 && !(name.hi && pageText.includes(name.hi))) problems.push("scheme name not clearly found on the source page");

  if (conf < AUTO_PUBLISH_CONFIDENCE) problems.push(`AI confidence ${conf.toFixed(2)} (< ${AUTO_PUBLISH_CONFIDENCE})`);

  let id = idPrefixFor(region, schemes) + slugify(name.en, region);
  const allIds = new Set([...schemes.map(s => s.id), ...takenIds]);
  for (let n = 2; allIds.has(id); n++) id = `${idPrefixFor(region, schemes)}${slugify(name.en, region)}_${n}`;

  const style = styleFor(category);
  const scheme = {
    id, icon: style.icon, color: style.color, scope, ...(state ? { state } : {}),
    ministry, name, benefit, tag, annual,
    apply: { en: applyUrl, hi: applyUrl }, applyType, docs,
    ...(keywords.length ? { keywords } : {}),
    ...(lastDate ? { lastDate } : {}),
    autoAdded: istToday(), source: sourceUrl,
  };
  return {
    scheme, matchSrc, eligibility: elig, confidence: conf, ruleShare: Math.round(stats.share * 1000) / 1000,
    hardReject: hard.length ? hard : null, problems, autoPublish: !hard.length && problems.length === 0,
    evidence: str(ai.evidence, 240), file: getUrlIssueFilePath({ scope, state }),
  };
}

// ── JS block for the scheme file ─────────────────────────────────────────────
export function schemeBlock(scheme, matchSrc) {
  const J = v => JSON.stringify(v);
  const lines = [
    `  // <auto-scheme id=${J(scheme.id)}> added by Scheme Discovery agent on ${scheme.autoAdded} · source: ${scheme.source}`,
    "  {",
    `    id: ${J(scheme.id)},`,
    `    icon: ${J(scheme.icon)}, color: ${J(scheme.color)}, scope: ${J(scheme.scope)},${scheme.state ? ` state: ${J(scheme.state)},` : ""}`,
    `    ministry: { en: ${J(scheme.ministry.en)}, hi: ${J(scheme.ministry.hi)} },`,
    `    name:    { en: ${J(scheme.name.en)}, hi: ${J(scheme.name.hi)} },`,
    `    benefit: { en: ${J(scheme.benefit.en)}, hi: ${J(scheme.benefit.hi)} },`,
    `    tag:     { en: ${J(scheme.tag.en)}, hi: ${J(scheme.tag.hi)} },`,
    `    annual: ${Number(scheme.annual) || 0},`,
    `    apply:   { en: ${J(scheme.apply.en)}, hi: ${J(scheme.apply.hi)} }, applyType: ${J(scheme.applyType)},`,
    `    docs:    { en: ${J(scheme.docs.en)},`,
    `               hi: ${J(scheme.docs.hi)} },`,
    ...(scheme.keywords?.length ? [`    keywords: ${J(scheme.keywords)},`] : []),
    ...(scheme.lastDate ? [`    lastDate: ${J(scheme.lastDate)},`] : []),
    `    autoAdded: ${J(scheme.autoAdded)}, source: ${J(scheme.source)},`,
    `    match: (a) => ${matchSrc},`,
    "  },",
    `  // </auto-scheme id=${J(scheme.id)}>`,
    "",
  ];
  return lines.join("\n");
}

// Throws if the block isn't valid JS (checked before every commit).
export function assertBlockParses(block) {
  const body = block.split("\n").filter(l => !l.trim().startsWith("//")).join("\n").trim().replace(/,\s*$/, "");
  const obj = new Function(`return (${body});`)();
  if (!obj || typeof obj.match !== "function" || !obj.id) throw new Error("generated scheme block is invalid");
  return obj;
}

export function insertBlock(text, block, scope) {
  if (scope === "national") {
    const marker = text.indexOf("  ...STATE_SCHEMES,");
    if (marker === -1) throw new Error("schemesData.js: could not find ...STATE_SCHEMES to insert before");
    return text.slice(0, marker) + block + "\n" + text.slice(marker);
  }
  const close = text.lastIndexOf("];");
  if (close === -1) throw new Error("state file: could not find the closing ];");
  return text.slice(0, close) + block + "\n" + text.slice(close);
}

export function removeBlock(text, id) {
  const J = JSON.stringify(id);
  const start = text.indexOf(`  // <auto-scheme id=${J}>`);
  const endTag = `  // </auto-scheme id=${J}>`;
  const end = text.indexOf(endTag, start);
  if (start === -1 || end === -1) return null;
  let stop = end + endTag.length;
  while (text[stop] === "\n" && text[stop + 1] === "\n") stop++;
  if (text[stop] === "\n") stop++;
  return text.slice(0, start) + text.slice(stop);
}

// ── Publish / remove (GitHub) ────────────────────────────────────────────────
export async function publishSchemes(items) {
  // Group by file → one commit per file.
  const byFile = new Map();
  for (const it of items) { if (!byFile.has(it.file)) byFile.set(it.file, []); byFile.get(it.file).push(it); }
  const results = [];
  for (const [file, list] of byFile) {
    try {
      const out = await updateRepoFile(file, (text) => {
        if (text == null) throw new Error(`${file} not found in the repo`);
        let next = text;
        for (const it of list) {
          if (next.includes(`id: ${JSON.stringify(it.scheme.id)}`)) continue; // already there
          const block = schemeBlock(it.scheme, it.matchSrc);
          assertBlockParses(block);
          next = insertBlock(next, block, it.scheme.scope);
        }
        return { text: next, changed: next !== text };
      }, `feat(schemes): add ${list.map(i => i.scheme.name.en).join(", ").slice(0, 120)} [scheme-discovery]`);
      for (const it of list) results.push({ id: it.scheme.id, ok: true, commitUrl: out.commitUrl ?? null, file });
    } catch (err) {
      for (const it of list) results.push({ id: it.scheme.id, ok: false, error: err.message, file });
    }
  }
  return results;
}

export async function unpublishScheme(id, file) {
  const out = await updateRepoFile(file, (text) => {
    if (text == null) throw new Error(`${file} not found`);
    const next = removeBlock(text, id);
    if (next == null) throw new Error(`auto-added block for ${id} not found in ${file} (only agent-added schemes can be removed here)`);
    return { text: next, changed: true };
  }, `chore(schemes): remove auto-added scheme ${id} [scheme-discovery]`);
  return { ok: true, commitUrl: out.commitUrl ?? null };
}

// ── Live scheme list (the deployed bundle can be a deploy behind) ────────────
function regionForFile(file) {
  if (file.endsWith("schemesData.js")) return "national";
  return INDIA_STATES.find(st => getUrlIssueFilePath({ scope: "state", state: st }) === file) ?? null;
}
async function liveSchemeNames(files) {
  // Names in files changed since this deploy (auto-added blocks) — cheap regex.
  const extra = [];
  for (const f of files) {
    const region = regionForFile(f);
    try {
      const { text } = await readRepoFile(f);
      for (const m of String(text || "").matchAll(/\/\/ <auto-scheme id="([^"]+)">[\s\S]*?name:\s*\{\s*en:\s*("(?:[^"\\]|\\.)*")/g)) {
        extra.push({ id: m[1], name: { en: JSON.parse(m[2]) }, scope: region === "national" ? "national" : "state", state: region === "national" ? null : region });
      }
    } catch { /* ignore */ }
  }
  return extra;
}

// ── Main run ─────────────────────────────────────────────────────────────────
export async function runSchemeDiscovery({ db, maxNew = MAX_NEW_PER_RUN, regions: forcedRegions = null, log = console, progress = { step() {} } } = {}) {
  const startedAt = Date.now();
  const out = {
    regions: [], searched: 0, candidates: 0, duplicates: 0, researched: 0,
    published: [], drafted: [], rejected: [], errors: [], stopReason: null,
    serperCalls: 0, tavilyCalls: 0,
  };
  const serperKey = process.env.SERPER_API_KEY?.trim();
  const tavilyKey = (process.env.TAVILY_VERIFY_KEY ?? process.env.TAVILY_API_KEY)?.trim();
  if (!serperKey) { out.stopReason = "config: SERPER_API_KEY missing"; return out; }
  if (!tavilyKey) { out.stopReason = "config: TAVILY_VERIFY_KEY missing"; return out; }
  if (!loadGroqKeys().length) { out.stopReason = "config: no Groq keys"; return out; }
  if (maxNew <= 0) { out.stopReason = "disabled (DISCOVERY_PER_RUN=0)"; return out; }

  const stateRef = db?.collection("appMeta").doc("discoveryState");
  let st = {};
  try { st = (await stateRef?.get())?.data() ?? {}; } catch { /* ignore */ }
  const cursor = Number.isInteger(st.cursor) ? st.cursor : 0;
  const regions = forcedRegions ?? Array.from({ length: REGIONS_PER_RUN }, (_, i) => REGIONS[(cursor + i) % REGIONS.length]);
  out.regions = regions;
  progress.step(`Regions this run: ${regions.map(r => r === "national" ? "Central government" : r).join(" + ")}`);
  const seen = typeof st.seen === "object" && st.seen ? st.seen : {}; // normName → { at, outcome }

  // Existing drafts count as "known" too.
  let draftNames = [];
  try {
    const snap = await db?.collection("schemeDrafts").orderBy("createdAt", "desc").limit(300).get();
    draftNames = (snap?.docs ?? []).map(d => d.data()).map(d => ({ id: d.id, name: d.scheme?.name ?? { en: d.name }, scope: d.scheme?.scope, state: d.scheme?.state }));
  } catch { /* ignore */ }

  const files = [...new Set(regions.map(r => getUrlIssueFilePath(r === "national" ? { scope: "national" } : { scope: "state", state: r })))];
  const known = [...SCHEME_DB, ...draftNames.filter(d => d.name?.en), ...(await liveSchemeNames(files))];
  const takenIds = new Set(known.map(s => s.id));

  const year = new Date().getUTCFullYear();
  const toResearch = [];

  for (const region of regions) {
    if (toResearch.length >= maxNew) break;
    const where = region === "national" ? "India central government" : `${region} government`;
    progress.step(`Searching news + government sites for ${region === "national" ? "Central" : region} schemes…`);
    // 1. Search (news = newly launched; web = established but missing)
    const [news, web] = await Promise.all([
      serperSearch(`${where} new welfare scheme yojana ${year} launched apply`, serperKey, 10, { type: "news" }),
      serperSearch(`${where} yojana scheme ${year} eligibility apply online site:gov.in`, serperKey, 10),
    ]);
    out.serperCalls += 2; out.searched += 2;
    const results = [...(news.results ?? []), ...(web.results ?? [])].filter(r => r.title).slice(0, 18);
    if (!results.length) {
      const e = news.error || web.error;
      if (e) {
        out.errors.push(`${region}: search failed — ${e.message}`);
        if (e.status === 401 || e.status === 403) { out.stopReason = "config: Serper key rejected / out of credits"; break; }
      }
      continue;
    }

    // 2. Pick candidates
    const existingNames = regionSchemes(region, known).map(s => s.name?.en).filter(Boolean);
    const { system, user } = pickPrompt(region, existingNames, results);
    const pick = await groqJson(PICK_MODEL, system, user, 900);
    if (pick.error) {
      out.errors.push(`${region}: candidate pick failed — ${pick.error}`);
      if (pick.rateLimited) { out.stopReason = "rate_limit: Groq keys busy"; break; }
      continue;
    }
    const cands = (Array.isArray(pick.data?.candidates) ? pick.data.candidates : [])
      .map(c => ({ name: str(c?.name, 120), url: typeof c?.url === "string" ? c.url.trim() : null, region }))
      .filter(c => c.name);
    out.candidates += cands.length;
    progress.step(cands.length ? `AI found ${cands.length} named scheme(s): ${cands.map(c => c.name).join(", ").slice(0, 160)}` : "AI found no specific schemes in these results");

    // 3. Dedupe
    for (const c of cands) {
      if (toResearch.length >= maxNew) break;
      const key = seenKey(region, c.name);
      if (seen[key] || findDuplicate(c.name, region, known) || toResearch.some(t => sameScheme(t.name, c.name))) {
        out.duplicates++;
        progress.step(`  ↳ "${c.name}" — already in the app / seen before, skipped`);
        continue;
      }
      progress.step(`  ↳ "${c.name}" — new! will research it`, "ok");
      toResearch.push(c);
    }
  }

  // 4. Research + draft
  const toPublish = [];
  for (const c of toResearch) {
    if (Date.now() - startedAt > MAX_RUNTIME_MS) { out.stopReason = out.stopReason ?? "time limit"; break; }
    const key = seenKey(c.region, c.name);
    try {
      progress.step(`Researching "${c.name}": finding the official page…`);
      const sourceUrl = await findSourceUrl(c, c.region, serperKey, out);
      if (!sourceUrl) { out.errors.push(`${c.name}: no source page found`); seen[key] = { at: istToday(), outcome: "no-source" }; continue; }

      const budget = await checkTavilyBudget(db);
      if (!budget.ok) { out.stopReason = "budget: monthly Tavily budget reached"; break; }
      progress.step(`  ↳ reading ${sourceUrl}`);
      const page = await fetchPageText(sourceUrl, tavilyKey, { excerpt: draftExcerpt });
      if (page.billed) { out.tavilyCalls++; noteTavilyCall(); recordAiCall({ service: "tavily-verify" }).catch(() => {}); logApiCallToHistory("tavilyVerifyCalls").catch(() => {}); }
      if (!page.text) { out.errors.push(`${c.name}: page unreadable — ${page.error}`); seen[key] = { at: istToday(), outcome: "unreadable" }; continue; }

      progress.step("  ↳ AI is writing the entry in English + Hindi (benefit, documents, eligibility)…");
      const { system, user } = draftPrompt(c, c.region, page.text, sourceUrl);
      const d = await groqJson(DRAFT_MODEL, system, user, 2200);
      if (d.error) {
        out.errors.push(`${c.name}: drafting failed — ${d.error}`);
        if (d.rateLimited) { out.stopReason = "rate_limit: Groq keys busy"; break; }
        continue;
      }
      out.researched++;
      const built = buildScheme(d.data, { candidate: c, region: c.region, sourceUrl, pageText: page.text, schemes: known, takenIds });
      takenIds.add(built.scheme.id);

      progress.step(
        built.hardReject ? `  ↳ dropped: ${built.hardReject.join("; ")}`
          : built.autoPublish ? "  ↳ passed every check — will be added to the app"
          : `  ↳ needs your approval: ${built.problems.join("; ")}`,
        built.hardReject ? "warn" : built.autoPublish ? "ok" : "warn"
      );
      if (built.hardReject) {
        out.rejected.push({ name: built.scheme.name.en || c.name, region: c.region, reasons: built.hardReject });
        seen[key] = { at: istToday(), outcome: "rejected" };
        continue;
      }
      seen[key] = { at: istToday(), outcome: built.autoPublish ? "published" : "draft" };
      known.push(built.scheme);
      const doc = {
        status: built.autoPublish ? "publishing" : "pending",
        scheme: built.scheme, matchSrc: built.matchSrc, eligibility: built.eligibility,
        confidence: built.confidence, ruleShare: built.ruleShare, problems: built.problems,
        evidence: built.evidence, file: built.file, region: c.region, candidateName: c.name,
        createdAt: new Date(),
      };
      try { await db?.collection("schemeDrafts").doc(built.scheme.id).set(doc); } catch (e) { out.errors.push(`${c.name}: could not save draft — ${e.message}`); }
      if (built.autoPublish) toPublish.push({ ...built, doc });
      else out.drafted.push({ id: built.scheme.id, name: built.scheme.name.en, region: c.region, problems: built.problems });
    } catch (err) {
      out.errors.push(`${c.name}: ${err.message}`);
    }
  }

  // 5. Publish the confident ones (one commit per file)
  if (toPublish.length) {
    progress.step(`Publishing ${toPublish.length} scheme(s) to GitHub…`);
    const res = await publishSchemes(toPublish);
    for (const r of res) {
      const it = toPublish.find(t => t.scheme.id === r.id);
      if (r.ok) {
        out.published.push({ id: r.id, name: it.scheme.name.en, region: it.scheme.state ?? "national", commitUrl: r.commitUrl });
        await db?.collection("schemeDrafts").doc(r.id).set({ status: "published", publishedAt: new Date(), publishedBy: "agent", commitUrl: r.commitUrl ?? null }, { merge: true }).catch(() => {});
      } else {
        out.errors.push(`${it.scheme.name.en}: publish failed — ${r.error}`);
        out.drafted.push({ id: r.id, name: it.scheme.name.en, region: it.scheme.state ?? "national", problems: [`auto-publish failed: ${r.error}`] });
        await db?.collection("schemeDrafts").doc(r.id).set({ status: "pending", problems: [...it.problems, `auto-publish failed: ${r.error}`] }, { merge: true }).catch(() => {});
      }
    }
  }

  // 6. Save rotation + seen list (keep the newest 600)
  const seenTrim = Object.fromEntries(Object.entries(seen).sort((a, b) => String(b[1].at).localeCompare(String(a[1].at))).slice(0, 600));
  try {
    await stateRef?.set({ cursor: forcedRegions ? cursor : (cursor + regions.length) % REGIONS.length, seen: seenTrim, updatedAt: new Date() }, { merge: false });
  } catch { /* ignore */ }

  out.durationMs = Date.now() - startedAt;
  log.log?.(`[scheme-discovery] ${regions.join(", ")} · candidates ${out.candidates} · dup ${out.duplicates} · published ${out.published.length} · drafts ${out.drafted.length} · rejected ${out.rejected.length}`);
  return out;
}

// ── Review actions (admin) ───────────────────────────────────────────────────
export async function listSchemeDrafts(db, { limit = 60 } = {}) {
  const snap = await db.collection("schemeDrafts").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map(d => {
    const x = d.data();
    const ts = v => v?.toDate?.().toISOString?.() ?? (v instanceof Date ? v.toISOString() : v ?? null);
    return { id: d.id, ...x, createdAt: ts(x.createdAt), publishedAt: ts(x.publishedAt), removedAt: ts(x.removedAt), reviewedAt: ts(x.reviewedAt) };
  });
}

export async function reviewSchemeDraft(db, { id, op, by }) {
  const ref = db.collection("schemeDrafts").doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Draft not found");
  const d = snap.data();
  if (op === "approve") {
    if (d.status === "published") return { ok: true, already: true };
    // Re-check duplicates against the live file before publishing.
    const live = await liveSchemeNames([d.file]);
    const dup = findDuplicate(d.scheme.name.en, d.region, [...SCHEME_DB, ...live].filter(s => s.id !== d.scheme.id));
    if (dup) throw new Error(`Already in the app as "${dup.name?.en}" (${dup.id})`);
    const [r] = await publishSchemes([{ scheme: d.scheme, matchSrc: d.matchSrc, file: d.file }]);
    if (!r?.ok) throw new Error(r?.error ?? "publish failed");
    await ref.set({ status: "published", publishedAt: new Date(), publishedBy: by ?? "admin", commitUrl: r.commitUrl ?? null }, { merge: true });
    return { ok: true, commitUrl: r.commitUrl ?? null };
  }
  if (op === "reject") {
    await ref.set({ status: "rejected", reviewedAt: new Date(), reviewedBy: by ?? "admin" }, { merge: true });
    return { ok: true };
  }
  if (op === "remove") {
    if (d.status !== "published") throw new Error("Only published schemes can be removed");
    const r = await unpublishScheme(d.scheme.id, d.file);
    await ref.set({ status: "removed", removedAt: new Date(), removedBy: by ?? "admin", removeCommitUrl: r.commitUrl ?? null }, { merge: true });
    return r;
  }
  throw new Error(`Unknown op: ${op}`);
}

// ── Run + log (cron, watchdog, admin "Run") ──────────────────────────────────
export async function runAndLogDiscovery({ db, trigger = "cron" } = {}) {
  const startedAt = new Date().toISOString();
  const progress = createProgress(db, "discover", { trigger });
  let result;
  try {
    result = await runSchemeDiscovery({ db, progress });
    if (result.stopReason) progress.step(`Stopped: ${result.stopReason}`, "warn");
    progress.step(`Done: ${result.published?.length ?? 0} added · ${result.drafted?.length ?? 0} waiting for approval · ${result.duplicates ?? 0} already known`, "ok");
    await progress.done({ added: result.published?.length ?? 0, drafts: result.drafted?.length ?? 0 });
  } catch (err) {
    await progress.fail(err);
    result = { crashed: true, error: String(err.message).slice(0, 400), published: [], drafted: [], rejected: [], errors: [], regions: [] };
  }
  const doc = JSON.parse(JSON.stringify({ agent: "scheme-discovery", trigger, startedAt, finishedAt: new Date().toISOString(), ...result }));
  try { await db?.collection("agentRuns").add({ ...doc, createdAt: new Date() }); } catch { /* ignore */ }
  const p = result.published?.length ?? 0, d = result.drafted?.length ?? 0;
  if (db && (p || d)) {
    const bits = [];
    if (p) bits.push(`added ${p} new scheme${p === 1 ? "" : "s"} (${result.published.map(x => x.name).join(", ").slice(0, 120)})`);
    if (d) bits.push(`${d} waiting for your approval`);
    await db.collection("adminActivity").add({
      agentId: "scheme-discovery", agentName: "Scheme Discovery", action: `Scheme discovery: ${bits.join(" · ")}`,
      tab: "agents", type: "auto", time: new Date(),
    }).catch(() => {});
  }
  if (result.crashed) throw new Error(result.error);
  return result;
}
