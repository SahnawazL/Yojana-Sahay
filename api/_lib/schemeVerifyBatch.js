// api/_lib/schemeVerifyBatch.js — Yojana Sahay · Automatic Rotating Scheme Verifier
// ─────────────────────────────────────────────────────────────────────────────
// Runs a small, FIXED-SIZE batch of Tier-2 AI verification checks (deadline +
// link-health) each time it's called, sized so a full lap across the catalog
// takes ~CYCLE_DAYS days — keeping Tavily usage well under its 1000/month
// cap. A hard monthly budget guard (reading the existing apiCallHistory
// collection) skips the run entirely if usage is already near the cap, no
// matter what caused it.
//
// Progress is tracked by a rotating cursor stored in Firestore
// (appMeta/verifyCursor), so each invocation picks up exactly where the last
// one left off, and wraps back to 0 after the last scheme — a continuous,
// budget-safe freshness sweep across the whole ~1100+ scheme catalog.
//
// Triggered via api/deadline-alerts.js's `action: "verifyBatch"` cron branch,
// which an external scheduler (GitHub Actions) calls ONCE A DAY — see
// verify-schemes-cron.yml for the schedule and the cycle-time math.
//
// No new serverless function: this file lives under api/_lib/, which Vercel
// does not count as a route — it's just a module imported by the existing
// api/deadline-alerts.js function.
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminDb }        from "./firebaseAdmin.js";
import { SCHEME_DB }         from "../../src/schemesData.js";
import { verifySchemeCore }  from "../verify-scheme.js";
import { commitSchemesMeta } from "../update-schemes-meta.js";

// Safety margin under whatever the real configured max duration turns out to
// be. The Vercel dashboard shows 300s configured — this stops at 240s (60s of
// buffer) so a batch never risks getting hard-killed mid-write. With the
// count-based cap below, a normal run finishes in well under a minute — this
// time cap is now purely a fallback safety valve, not the normal stopping
// condition.
const MAX_RUNTIME_MS   = 240_000;
const DELAY_BETWEEN_MS = 3500; // same pacing as the browser-side verifier — stays under Groq's free-tier rate limit

// ── Cycle math — spreads the whole catalog across ~2 months ─────────────────
// Tavily's free tier caps out at 1000 calls/month. A full sweep of the
// catalog costs roughly 1 Tavily call per scheme (schemes with no checkable
// URL are skipped for free). At CYCLE_DAYS=60, a ~1100-scheme catalog uses
// about ceil(1100/60)=19 calls/day → ~570/month, leaving real headroom for
// manual "Verify Now" runs in the admin dashboard, which draw from the same
// budget. Raise CYCLE_DAYS to slow it down further, or lower it if the
// Tavily plan is upgraded later.
const CYCLE_DAYS = 60;

// Hard stop, independent of the cycle math above: even if something is
// miscounted or the admin dashboard has been heavily used this month, never
// let an automated run push total Tavily usage past this line. Reads the
// existing apiCallHistory/{YYYY-MM-DD} docs (already written by
// logApiCallToHistory("tavilyVerifyCalls") in verify-scheme.js) and sums the
// current calendar month to date.
const MONTHLY_TAVILY_BUDGET = 900; // stay under Tavily's 1000/month cap with margin

// Matches apiCallHistory.js's exact date logic — that file keys its docs by
// IST calendar date, not server-local time. Vercel's serverless runtime is
// UTC, so naively using `new Date().getDate()` etc. here would read the
// wrong day's doc for ~5.5 hours around every midnight IST and undercount
// this month's usage during that window. Must stay byte-for-byte consistent
// with how apiCallHistory.js derives its doc IDs.
function getISTDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { year: get("year"), month: get("month"), day: Number(get("day")) };
}

async function getTavilyCallsThisMonth(db) {
  const { year, month, day: today } = getISTDateParts();

  const reads = [];
  for (let d = 1; d <= today; d++) {
    const dateStr = `${year}-${month}-${String(d).padStart(2, "0")}`;
    reads.push(db.collection("apiCallHistory").doc(dateStr).get());
  }
  const snaps = await Promise.all(reads);

  let total = 0;
  for (const snap of snaps) {
    if (snap.exists) total += Number(snap.data()?.tavilyVerifyCalls || 0);
  }
  return total;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function runSchemeVerificationBatch() {
  const db = getAdminDb();
  const startedAt = Date.now();

  // ── Hard budget guard — checked first, before touching the cursor ─────────
  const tavilyUsedThisMonth = await getTavilyCallsThisMonth(db);
  if (tavilyUsedThisMonth >= MONTHLY_TAVILY_BUDGET) {
    console.warn(
      `[schemeVerifyBatch] Skipping run — ${tavilyUsedThisMonth} Tavily calls already used this month ` +
      `(budget: ${MONTHLY_TAVILY_BUDGET}).`
    );
    // IMPORTANT: this shape must include every field deadline-alerts.js reads
    // when it logs a run to schemeVerifyRuns (checked, skippedNoUrl,
    // withResults, cursorBefore, cursorAfter, totalSchemes, commitError,
    // results) — Firestore throws on `undefined` field values, and a
    // budget-skip is exactly the run you most want visible in the dashboard,
    // not one that silently fails to log.
    return {
      skipped: true,
      reason: "monthly_tavily_budget_reached",
      tavilyUsedThisMonth,
      monthlyBudget: MONTHLY_TAVILY_BUDGET,
      checked: 0,
      tavilyCallsMade: 0,
      skippedNoUrl: 0,
      withResults: 0,
      cursorBefore: null,
      cursorAfter: null,
      totalSchemes: null,
      schemesPerRun: null,
      runCap: 0,
      cycleDays: CYCLE_DAYS,
      durationMs: Date.now() - startedAt,
      commitResult: null,
      commitError: null,
      results: {},
    };
  }

  // Stable, deterministic order so the cursor means the same position every
  // run, even though SCHEME_DB itself isn't sorted and can grow over time.
  const allIds = SCHEME_DB.map(s => s.id).sort();
  const total  = allIds.length;
  const schemeById = new Map(SCHEME_DB.map(s => [s.id, s]));

  // How many schemes with a REAL Tavily-billable check this run should do,
  // so a full lap over `total` schemes takes ~CYCLE_DAYS days.
  const schemesPerRun = Math.max(1, Math.ceil(total / CYCLE_DAYS));
  // Extra ceiling so one run can never eat more than a comfortable slice of
  // whatever budget is left this month, even right after a cycle-size change.
  const runCap = Math.max(1, Math.min(schemesPerRun, MONTHLY_TAVILY_BUDGET - tavilyUsedThisMonth));

  const cursorRef   = db.collection("appMeta").doc("verifyCursor");
  const cursorSnap  = await cursorRef.get();
  const cursorBefore = cursorSnap.exists ? (cursorSnap.data().index || 0) : 0;
  let index = cursorBefore >= total ? 0 : cursorBefore; // catalog may have shrunk since last run

  const results = {};
  let checkedCount = 0;      // total iterations, including skipped no-URL entries
  let tavilyCallsMade = 0;   // actual billable checks this run — this is what we cap against
  let skippedNoUrl = 0;
  let firstIteration = true;

  while (Date.now() - startedAt < MAX_RUNTIME_MS) {
    if (checkedCount >= total) break;   // completed a full lap within a single run (small catalogs only)
    if (tavilyCallsMade >= runCap) break; // hit today's slice of the cycle — stop here, resume tomorrow

    if (!firstIteration) await sleep(DELAY_BETWEEN_MS); // pace calls, but don't delay before the very first one
    firstIteration = false;

    const id     = allIds[index];
    const scheme = schemeById.get(id);
    index = (index + 1) % total;
    checkedCount++;

    if (!scheme) continue; // shouldn't happen, but never let one bad id crash the whole run

    const url = scheme.apply?.en;
    if (!url || !/^https?:\/\//i.test(url)) {
      skippedNoUrl++;
      continue; // no real checkable URL — don't waste a Groq/Tavily call, just advance past it
    }

    try {
      const outcome = await verifySchemeCore({
        url,
        name:  scheme.name?.en || scheme.id,
        state: scheme.scope || "national",
      });
      tavilyCallsMade++;
      results[id] = {
        lastDate:     outcome.lastDate,
        isActive:     outcome.isActive,
        confidence:   outcome.confidence,
        httpStatus:   outcome.httpStatus,
        linkAlive:    outcome.httpStatus > 0 && outcome.httpStatus < 400,
        lastVerified: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`[schemeVerifyBatch] verifySchemeCore threw for "${id}":`, err.message);
      // Record nothing for this scheme — leave its existing meta untouched
      // rather than writing a false failure signal from a transient error.
    }
  }

  // Persist the new cursor position regardless of how many schemes actually
  // had a checkable URL, so URL-less entries don't get revisited every run.
  await cursorRef.set(
    { index, updatedAt: new Date().toISOString(), totalSchemes: total },
    { merge: true }
  );

  let commitResult = { success: true, updated: 0 };
  let commitError  = null;
  if (Object.keys(results).length > 0) {
    try {
      commitResult = await commitSchemesMeta(results);
    } catch (err) {
      console.error("[schemeVerifyBatch] GitHub commit failed:", err.message);
      commitError = err.message;
      // Cursor has already advanced and results were computed correctly —
      // only the GitHub write failed. Surface the error but don't throw,
      // so the caller (api/deadline-alerts.js) still returns a clean 200
      // with diagnostic info instead of a scary 500 for a transient GitHub issue.
    }
  }

  return {
    checked:      checkedCount,
    tavilyCallsMade,
    skippedNoUrl,
    withResults:  Object.keys(results).length,
    cursorBefore,
    cursorAfter:  index,
    totalSchemes: total,
    schemesPerRun,
    runCap,
    cycleDays:    CYCLE_DAYS,
    tavilyUsedThisMonth: tavilyUsedThisMonth + tavilyCallsMade,
    monthlyBudget: MONTHLY_TAVILY_BUDGET,
    durationMs:   Date.now() - startedAt,
    commitResult,
    commitError,
    results, // scheme ids + what was found, for logging/debugging in the run history
  };
}
