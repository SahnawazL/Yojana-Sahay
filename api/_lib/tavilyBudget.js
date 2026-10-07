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

// Hard ceiling for ANY Tavily verify call (manual or background). Override
// with TAVILY_MONTHLY_LIMIT if the plan is upgraded.
export const TAVILY_MONTHLY_HARD_LIMIT =
  Number(process.env.TAVILY_MONTHLY_LIMIT) > 0 ? Number(process.env.TAVILY_MONTHLY_LIMIT) : 980;

// The background batch stops earlier, leaving headroom for manual checks.
export const TAVILY_BACKGROUND_BUDGET = Math.max(1, Math.floor(TAVILY_MONTHLY_HARD_LIMIT * 0.9));

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

export async function checkTavilyBudget(db, limit = TAVILY_MONTHLY_HARD_LIMIT) {
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
  return { ok: used < limit, used, limit };
}

export function noteTavilyCall() {
  cache.localAdds += 1;
}
