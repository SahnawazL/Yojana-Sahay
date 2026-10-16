// api/_lib/tavilyBudget.js — Yojana Sahay · Monthly Tavily Extract budget
// ─────────────────────────────────────────────────────────────────────────────
// Tavily's free plan allows ~1000 Extract credits a month, shared by the
// background verify batch AND manual Tier 2 runs from the admin dashboard.
// Before this guard existed, one "Tier 2 · All schemes" run could spend the
// whole month's budget, after which every background run was skipped and
// every manual check failed with an opaque Tavily error.
//
// Usage is the sum of apiCallHistory/{YYYY-MM-DD}.tavilyVerifyCalls for the
// current IST calendar month — the same docs logApiCallToHistory() writes.
// ─────────────────────────────────────────────────────────────────────────────

import { tavilyUsage } from "./keyMap.js";

// Hard ceiling for ANY Tavily verify call (manual or background). Override
// with TAVILY_MONTHLY_LIMIT if the plan is upgraded.
export const TAVILY_MONTHLY_HARD_LIMIT =
  Number(process.env.TAVILY_MONTHLY_LIMIT) > 0 ? Number(process.env.TAVILY_MONTHLY_LIMIT) : 980;

// The background batch stops earlier, leaving headroom for manual checks.
export const TAVILY_BACKGROUND_BUDGET = Math.max(1, Math.floor(TAVILY_MONTHLY_HARD_LIMIT * 0.9));

// Tavily credits are per ACCOUNT. If the chat's web search uses the same
// account, our own counter (agents only) under-counts — so every budget check
// also asks Tavily for the real account usage (GET /usage, cached 10 min) and
// keeps a small reserve so the chat's web search never runs dry.
export const CHAT_RESERVE_CREDITS = 40;

export async function realTavilyRemaining() {
  const key = (process.env.TAVILY_VERIFY_KEY ?? process.env.TAVILY_API_KEY)?.trim();
  const u = await tavilyUsage(key);
  if (!u || u.accountLimit == null || u.accountUsed == null) return null;
  return { remaining: u.accountLimit - u.accountUsed, used: u.accountUsed, limit: u.accountLimit, plan: u.plan };
}

export function getISTDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const get = t => parts.find(p => p.type === t).value;
  return { year: get("year"), month: get("month"), day: Number(get("day")) };
}

export async function getTavilyCallsThisMonth(db) {
  if (!db) return 0;
  const { year, month, day: today } = getISTDateParts();
  const refs = [];
  for (let d = 1; d <= today; d++) {
    refs.push(db.collection("apiCallHistory").doc(`${year}-${month}-${String(d).padStart(2, "0")}`));
  }
  const snaps = await db.getAll(...refs);
  let total = 0;
  for (const snap of snaps) {
    if (snap.exists) total += Number(snap.data()?.tavilyVerifyCalls || 0);
  }
  return total;
}

// Warm serverless instances serve many consecutive verify calls during a
// browser run — cache the monthly total briefly so each call doesn't re-read
// up to 31 docs. Calls made by this instance are added on top locally.
let cache = { month: null, value: 0, at: 0, localAdds: 0 };
const CACHE_MS = 60_000;

// Tavily's OWN numbers are the truth: its billing cycle doesn't start on the
// 1st, and it counts the chat's searches too. Our calendar-month counter is
// only the fallback when Tavily's /usage can't be reached.
//   share = this caller's slice of the plan (background 0.9, manual 0.98)
export function budgetFromReal(real, share) {
  const cap = Math.floor(real.limit * share);
  const left = Math.min(cap - real.used, real.remaining - CHAT_RESERVE_CREDITS);
  return { used: real.used, limit: cap, left, source: "tavily" };
}

export async function checkTavilyBudget(db, limit = TAVILY_MONTHLY_HARD_LIMIT) {
  const real = await realTavilyRemaining().catch(() => null);
  if (real) {
    const b = budgetFromReal(real, Math.min(0.98, limit / 1000));
    const realLow = real.remaining <= CHAT_RESERVE_CREDITS;
    return { ok: b.left > 0, used: b.used, limit: b.limit, real, source: "tavily", ...(realLow ? { realLow: true } : {}) };
  }
  const { year, month } = getISTDateParts();
  const key = `${year}-${month}`;
  try {
    if (cache.month !== key || Date.now() - cache.at > CACHE_MS) {
      cache = { month: key, value: await getTavilyCallsThisMonth(db), at: Date.now(), localAdds: 0 };
    }
  } catch (err) {
    // Never block verification because the usage read failed.
    console.warn("[tavilyBudget] usage read failed:", err.message);
    return { ok: true, used: null, limit };
  }
  const used = cache.value + cache.localAdds;
  return { ok: used < limit, used, limit, real: null, source: "own" };
}

export function noteTavilyCall() {
  cache.localAdds += 1;
}
