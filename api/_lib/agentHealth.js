// api/_lib/agentHealth.js — Yojana Sahay · Watchdog health check
// ─────────────────────────────────────────────────────────────────────────────
// One call answers "is every automatic job actually doing its job?":
//
//   JOBS      — did each scheduled job run recently, and did it succeed?
//               verify batch · deadline e-mails · auto-fix/URL repair · news
//   SERVICES  — are the keys behind them still valid? (Groq keys are tested
//               with the free /models endpoint; GitHub with a repo read;
//               the rest are checked for presence + budget)
//
// Each item: { id, name, kind, status: "ok"|"warn"|"fail", detail,
//              lastRunAt, rerun: "verifyBatch"|"deadlineAlerts"|"autoFix"|"news"|null }
//
// `rerun` tells the watchdog (scripts/agent-watchdog.mjs, run by GitHub
// Actions every 6 h) which job to re-trigger itself. Problems a re-run can't
// fix (bad key, missing env var) get rerun:null and are reported as a GitHub
// issue instead.
//
// The snapshot is saved to Firestore appMeta/agentHealth so the admin Agents
// tab can show it.
// ─────────────────────────────────────────────────────────────────────────────

import { getTavilyCallsThisMonth, TAVILY_MONTHLY_HARD_LIMIT } from "./tavilyBudget.js";

const HOUR = 3600 * 1000;
const DAILY_GRACE_H = 30;      // daily jobs: > 30 h without a run = missed
const NEWS_GRACE_H  = 4 * 24;  // news cron runs every 3 days

const toMs = v => {
  if (!v) return null;
  if (typeof v.toMillis === "function") return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string" || typeof v === "number") { const t = new Date(v).getTime(); return Number.isNaN(t) ? null : t; }
  if (typeof v._seconds === "number") return v._seconds * 1000;
  return null;
};
const ageH = ms => (ms == null ? Infinity : (Date.now() - ms) / HOUR);
const fmtAge = ms => {
  if (ms == null) return "never";
  const h = ageH(ms);
  return h < 1 ? `${Math.round(h * 60)} min ago` : h < 48 ? `${Math.round(h)} h ago` : `${Math.round(h / 24)} days ago`;
};

// ── Jobs ──────────────────────────────────────────────────────────────────────

export function judgeVerifyBatch(run) {
  const base = { id: "verifyBatch", name: "Background Verifier", kind: "job" };
  if (!run) return { ...base, status: "fail", detail: "Has never run.", lastRunAt: null, rerun: "verifyBatch" };
  const at = toMs(run.runAt);
  const stop = String(run.stopReason ?? "");
  const r = { ...base, lastRunAt: at ? new Date(at).toISOString() : null };
  if (ageH(at) > DAILY_GRACE_H) return { ...r, status: "fail", detail: `Last run ${fmtAge(at)} — the daily run was missed.`, rerun: "verifyBatch" };
  if (run.crashed) return { ...r, status: "fail", detail: `Last run crashed: ${stop.replace(/^crash:\s*/, "")}`, rerun: "verifyBatch" };
  if (/^config/i.test(stop)) return { ...r, status: "fail", detail: `Needs setup: ${stop.replace(/^config:\s*/, "")}`, rerun: null };
  if (run.commitSuccess === false) return { ...r, status: "fail", detail: `Results not saved to GitHub: ${run.commitError ?? "unknown error"}`, rerun: "verifyBatch" };
  if (run.skipped || /budget/i.test(stop)) return { ...r, status: "warn", detail: "Monthly Tavily budget used up — resumes on the 1st.", rerun: null };
  if (/^rate_limit/i.test(stop)) return { ...r, status: "warn", detail: "Stopped early: Groq rate limit. Will be re-run.", rerun: "verifyBatch" };
  const errRatio = run.withResults ? (run.errorCount ?? 0) / Math.max(1, run.withResults) : 0;
  if (errRatio > 0.5) return { ...r, status: "warn", detail: `${run.errorCount} of ${run.withResults} checks failed (${(run.errorSamples ?? [])[0] ?? "see logs"}).`, rerun: null };
  return { ...r, status: "ok", detail: `Checked ${run.checked ?? 0} schemes, ${run.datesFound ?? 0} deadlines found, ${fmtAge(at)}.`, rerun: null };
}

export function judgeDeadlineAlerts(run) {
  const base = { id: "deadlineAlerts", name: "Deadline Alert E-mails", kind: "job" };
  if (!run) return { ...base, status: "fail", detail: "Has never run.", lastRunAt: null, rerun: "deadlineAlerts" };
  const at = toMs(run.runAt);
  const r = { ...base, lastRunAt: at ? new Date(at).toISOString() : null };
  if (ageH(at) > DAILY_GRACE_H) return { ...r, status: "fail", detail: `Last run ${fmtAge(at)} — the daily run was missed.`, rerun: "deadlineAlerts" };
  if (run.quotaHit) return { ...r, status: "warn", detail: `Daily e-mail quota reached (${run.quotaUsed}/${run.quotaLimit}).`, rerun: null };
  const people = Array.isArray(run.recipients) ? run.recipients.length : (run.recipients ?? 0);
  return { ...r, status: "ok", detail: `Checked ${run.checked ?? 0} user(s), sent ${run.sent ?? 0} alert${run.sent === 1 ? "" : "s"} to ${people}, ${fmtAge(at)}.`, rerun: null };
}

export function judgeAutoFix(run) {
  const base = { id: "autoFix", name: "Auto-Fix + URL Repair", kind: "job" };
  if (!run) return { ...base, status: "fail", detail: "Has never run.", lastRunAt: null, rerun: "autoFix" };
  const at = toMs(run.createdAt) ?? toMs(run.finishedAt);
  const r = { ...base, lastRunAt: at ? new Date(at).toISOString() : null };
  if (ageH(at) > DAILY_GRACE_H) return { ...r, status: "fail", detail: `Last run ${fmtAge(at)} — the daily run was missed.`, rerun: "autoFix" };
  if (run.crashed) return { ...r, status: "fail", detail: `Last run crashed: ${run.error ?? "unknown error"}`, rerun: "autoFix" };
  const rep = run.repair ?? null;
  if (rep?.stopReason) return { ...r, status: "warn", detail: `URL repair stopped: ${rep.stopReason}`, rerun: null };
  if (run.autoFixFailed > 0) return { ...r, status: "warn", detail: `${run.autoFixFailed} fix(es) could not be committed.`, rerun: null };
  const bits = [`${run.autoFixed ?? 0} https fixes`];
  if (rep) bits.push(`${rep.fixed?.length ?? 0} dead links repaired`, `${rep.recovered?.length ?? 0} came back online`);
  return { ...r, status: "ok", detail: `${bits.join(", ")}, ${fmtAge(at)}.`, rerun: null };
}

export function judgeNews(cfg) {
  const base = { id: "news", name: "Scheme News Refresh", kind: "job" };
  const at = toMs(cfg?.lastAttemptAt) ?? toMs(cfg?.lastRunAt);
  const r = { ...base, lastRunAt: at ? new Date(at).toISOString() : null };
  if (at == null) return { ...r, status: "fail", detail: "Has never run.", rerun: "news" };
  if (ageH(at) > NEWS_GRACE_H) return { ...r, status: "fail", detail: `Last run ${fmtAge(at)} — the scheduled refresh was missed.`, rerun: "news" };
  if (cfg?.lastAttemptOk === false) return { ...r, status: "fail", detail: `Last run failed: ${cfg.lastAttemptMessage ?? "unknown error"}`, rerun: "news" };
  return { ...r, status: "ok", detail: `${cfg?.lastAttemptMessage ?? "Ran"} (${fmtAge(at)}).`, rerun: null };
}

// ── Services ─────────────────────────────────────────────────────────────────

function envKeys(names) {
  const seen = new Set();
  return names.map(n => process.env[n]?.trim()).filter(k => k && !seen.has(k) && seen.add(k));
}

async function testGroqKey(key) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok || res.status === 429) return "ok"; // 429 = valid key, just busy
    if (res.status === 401 || res.status === 403) return "invalid";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function judgeGroqPool(id, name, keys, rerunHint) {
  const base = { id, name, kind: "service", lastRunAt: null, rerun: null };
  if (keys.length === 0) return { ...base, status: "fail", detail: `No keys configured (${rerunHint}).` };
  const results = await Promise.all(keys.map(testGroqKey));
  const bad = results.map((r, i) => (r === "invalid" ? `#${i + 1}` : null)).filter(Boolean);
  if (bad.length === keys.length) return { ...base, status: "fail", detail: `All ${keys.length} key(s) rejected by Groq — replace them in Vercel.` };
  if (bad.length) return { ...base, status: "warn", detail: `Key ${bad.join(", ")} rejected by Groq — replace in Vercel (others still work).` };
  return { ...base, status: "ok", detail: `${keys.length} key(s) valid.` };
}

async function judgeGitHub() {
  const base = { id: "github", name: "GitHub (save results / fixes)", kind: "service", lastRunAt: null, rerun: null };
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo  = process.env.GITHUB_REPO?.trim();
  if (!token || !repo) return { ...base, status: "fail", detail: "GITHUB_TOKEN or GITHUB_REPO missing in Vercel." };
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "yojana-sahay-watchdog" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401) return { ...base, status: "fail", detail: "GITHUB_TOKEN is invalid or expired — create a new token and update it in Vercel." };
    if (res.status === 404) return { ...base, status: "fail", detail: `Repo "${repo}" not found with this token — check GITHUB_REPO.` };
    if (!res.ok) return { ...base, status: "warn", detail: `GitHub answered HTTP ${res.status}.` };
    const info = await res.json();
    if (info.permissions && info.permissions.push === false) return { ...base, status: "fail", detail: "Token can read but not write — give it Contents: write access." };
    return { ...base, status: "ok", detail: `Connected to ${info.full_name}.` };
  } catch (err) {
    return { ...base, status: "warn", detail: `Could not reach GitHub: ${err.message}` };
  }
}

async function judgeTavily(db) {
  const base = { id: "tavily", name: "Tavily (page reader)", kind: "service", lastRunAt: null, rerun: null };
  if (!envKeys(["TAVILY_VERIFY_KEY", "TAVILY_API_KEY"]).length) return { ...base, status: "fail", detail: "TAVILY_VERIFY_KEY missing in Vercel." };
  let used = null;
  try { used = await getTavilyCallsThisMonth(db); } catch { /* ignore */ }
  if (used == null) return { ...base, status: "ok", detail: "Key configured." };
  const pct = Math.round((used / TAVILY_MONTHLY_HARD_LIMIT) * 100);
  if (pct >= 100) return { ...base, status: "warn", detail: `Monthly budget used up (${used}/${TAVILY_MONTHLY_HARD_LIMIT}).` };
  return { ...base, status: pct >= 85 ? "warn" : "ok", detail: `${used}/${TAVILY_MONTHLY_HARD_LIMIT} page reads used this month (${pct}%).` };
}

function judgePresence(id, name, names, missingMsg) {
  const ok = envKeys(names).length > 0;
  return { id, name, kind: "service", lastRunAt: null, rerun: null, status: ok ? "ok" : "fail", detail: ok ? "Configured." : missingMsg };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function latest(db, coll, field, filter = null) {
  const snap = await db.collection(coll).orderBy(field, "desc").limit(filter ? 15 : 1).get();
  const docs = snap.docs.map(d => d.data());
  return (filter ? docs.filter(filter) : docs)[0] ?? null;
}

export async function getAgentHealth(db) {
  if (!db) throw new Error("Firebase Admin is not configured (FIREBASE_* env vars) — cannot read agent run logs.");

  const safe = async (fn, fallback) => { try { return await fn(); } catch (err) { return fallback(err); } };
  const readFail = (id, name) => err => ({ id, name, kind: "job", status: "warn", detail: `Could not read run log: ${err.message}`, lastRunAt: null, rerun: null });

  let autoFixRun = null;
  const [verify, alerts, autoFix, news, groqVerify, groqChat, github, tavily] = await Promise.all([
    safe(async () => judgeVerifyBatch(await latest(db, "schemeVerifyRuns", "runAt")), readFail("verifyBatch", "Background Verifier")),
    safe(async () => judgeDeadlineAlerts(await latest(db, "deadlineAlertRuns", "runAt")), readFail("deadlineAlerts", "Deadline Alert E-mails")),
    safe(async () => judgeAutoFix(autoFixRun = await latest(db, "agentRuns", "createdAt", d => !d.agent || d.agent === "agent-auto-fix")), readFail("autoFix", "Auto-Fix + URL Repair")),
    safe(async () => judgeNews((await db.collection("_config").doc("news").get()).data() ?? null), readFail("news", "Scheme News Refresh")),
    judgeGroqPool("groqVerify", "Groq verify keys", envKeys(["GROQ_VERIFY_KEY", "GROQ_VERIFY_KEY_1", "GROQ_VERIFY_KEY_2"]).length
      ? envKeys(["GROQ_VERIFY_KEY", "GROQ_VERIFY_KEY_1", "GROQ_VERIFY_KEY_2"])
      : envKeys(["GROQ_API_KEY", "GROQ_API_KEY_1", "GROQ_API_KEY_2", "GROQ_API_KEY_3", "GROQ_API_KEY_4", "GROQ_API_KEY_5"]), "GROQ_VERIFY_KEY"),
    judgeGroqPool("groqChat", "Groq chat keys", envKeys(["GROQ_API_KEY", "GROQ_API_KEY_1", "GROQ_API_KEY_2", "GROQ_API_KEY_3", "GROQ_API_KEY_4", "GROQ_API_KEY_5"]), "GROQ_API_KEY"),
    judgeGitHub(),
    judgeTavily(db),
  ]);

  const items = [
    verify, alerts, autoFix, news,
    groqVerify, groqChat, github, tavily,
    judgePresence("serper", "Serper (URL search)", ["SERPER_API_KEY"], "SERPER_API_KEY missing — dead links can't be repaired automatically."),
    judgePresence("gmail", "Gmail (alert sender)", ["GMAIL_APP_PASSWORD"], "GMAIL_USER / GMAIL_APP_PASSWORD missing — deadline e-mails can't be sent."),
  ];

  const overall = items.some(i => i.status === "fail") ? "fail" : items.some(i => i.status === "warn") ? "warn" : "ok";
  // Links a human has to decide on (from the latest Auto-Fix run) — the
  // watchdog keeps a GitHub issue in sync with this list.
  const review = autoFixRun && !autoFixRun.crashed
    ? (autoFixRun.needsReview ?? []).slice(0, 100).map(r => ({
        id: r.id, name: r.name, state: r.state ?? null, type: r.type, rawUrl: r.rawUrl ?? null,
        candidates: (r.candidates ?? []).slice(0, 3),
      }))
    : null;
  return { checkedAt: new Date().toISOString(), overall, items, review };
}

// Persist the snapshot (+ anything the watchdog script reports back).
export async function saveAgentHealth(db, health, extra = {}) {
  if (!db) return;
  const clean = JSON.parse(JSON.stringify({ ...health, ...extra }));
  await db.collection("appMeta").doc("agentHealth").set({ ...clean, savedAt: new Date() });
}
