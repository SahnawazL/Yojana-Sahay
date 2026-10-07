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
import { verifySchemeCore, getVerifyKeyCount } from "../verify-scheme.js";
import { commitSchemesMeta } from "../update-schemes-meta.js";
import { normalizeSchemeUrl } from "./urlTools.js";
import { getTavilyCallsThisMonth, TAVILY_BACKGROUND_BUDGET } from "./tavilyBudget.js";

// Safety margin under whatever the real configured max duration turns out to
// be. The Vercel dashboard shows 300s configured — this stops at 240s (60s of
// buffer) so a batch never risks getting hard-killed mid-write. With the
// count-based cap below, a normal run finishes in well under a minute — this
// time cap is now purely a fallback safety valve, not the normal stopping
// condition.
const MAX_RUNTIME_MS   = 240_000;
// Groq's free tier allows roughly 8K tokens/minute per key for gpt-oss-20b and
// each check costs ~1.5K tokens, i.e. ~5 checks/minute/key. The old fixed
// 3.5 s gap (17/min) tripped 429s on every run. Spread calls by key count.
const PER_KEY_GAP_MS = 12_500;
const MIN_GAP_MS     = 3_500;

// ── Cycle math — spreads the whole catalog across ~2 months ─────────────────
// Tavily's free tier caps out at 1000 calls/month. A full sweep of the
// catalog costs roughly 1 Tavily call per scheme (schemes with no checkable
// URL are skipped for free). At CYCLE_DAYS=60, a ~1100-scheme catalog uses
// about ceil(1100/60)=19 calls/day → ~570/month, leaving real headroom for
// manual "Verify Now" runs in the admin dashboard, which draw from the same
// budget. Raise CYCLE_DAYS to slow it down further, or lower it if the
// Tavily plan is upgraded later.
const CYCLE_DAYS = 60;

// Hard stop, independent of the cycle math above: never let an automated run
// push this month's Tavily usage past the background budget (90% of the
// monthly limit — the rest is reserved for manual checks). Shared with the
// per-call guard in verify-scheme.js via _lib/tavilyBudget.js.
const MONTHLY_TAVILY_BUDGET = TAVILY_BACKGROUND_BUDGET;

// Stop the run early after this many consecutive rate-limit / config errors —
// hammering an exhausted key pool just produces a page of identical failures.
const MAX_CONSECUTIVE_SERVICE_ERRORS = 3;

// Same "is there a checkable URL" rule as the browser verifier
// (buildVerificationQueue): online schemes whose apply.en contains a domain.
// The old check required a literal "https://" prefix, so every scheme stored
// as a bare domain ("pmkisan.gov.in") was skipped by the background job.
export function getCheckableUrl(scheme) {
  if (!scheme || scheme.applyType !== "online") return null;
  return normalizeSchemeUrl(scheme.apply?.en);
}

// Turn one verifySchemeCore() outcome into a schemes-meta.json entry.
// Only facts we actually learned are written — an error must never look like
// "deadline removed" or "link dead".
export function outcomeToMetaEntry(outcome, nowIso = new Date().toISOString()) {
  const entry = { lastVerified: nowIso };
  const http  = outcome.httpStatus || 0;

  if (http > 0) entry.httpStatus = http;
  if (http >= 200 && http < 400) entry.linkAlive = true;
  else if (http === 404 || http === 410) entry.linkAlive = false;
  // anything else (0 / 403 / 5xx via Tavily) is inconclusive → leave linkAlive untouched

  if (!outcome.errorKind) {
    entry.confidence = outcome.confidence ?? 0;
    if (outcome.isActive != null) entry.isActive = outcome.isActive;
    if (outcome.lastDate) entry.lastDate = outcome.lastDate;
    else if ((outcome.confidence ?? 0) >= 0.5) entry.lastDate = null; // page clearly read, no deadline any more
  }
  return entry;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function runSchemeVerificationBatch() {
  const db = getAdminDb();
  const startedAt = Date.now();
  if (!db) throw new Error("Firebase Admin is not configured (FIREBASE_* env vars) — cannot run the verify batch.");

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
      errorCount: 0,
      errorSamples: [],
      stopReason: "monthly_tavily_budget_reached",
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
  let lastCallAt = 0;
  const gapMs = Math.max(MIN_GAP_MS, Math.ceil(PER_KEY_GAP_MS / Math.max(1, getVerifyKeyCount())));
  let errorCount = 0;
  let consecutiveServiceErrors = 0;
  let stopReason = null;
  const errorSamples = [];

  while (Date.now() - startedAt < MAX_RUNTIME_MS) {
    if (checkedCount >= total) break;   // completed a full lap within a single run (small catalogs only)
    if (tavilyCallsMade >= runCap) break; // hit today's slice of the cycle — stop here, resume tomorrow

    const id     = allIds[index];
    const scheme = schemeById.get(id);
    index = (index + 1) % total;
    checkedCount++;

    if (!scheme) continue; // shouldn't happen, but never let one bad id crash the whole run

    const url = getCheckableUrl(scheme);
    if (!url) {
      skippedNoUrl++;
      continue; // offline / text-only scheme — nothing to check, don't spend a call
    }

    // Pace real checks only — skipping an offline scheme costs no API call.
    const wait = lastCallAt ? gapMs - (Date.now() - lastCallAt) : 0;
    if (wait > 0) {
      if (Date.now() - startedAt + wait > MAX_RUNTIME_MS) {
        index = (index - 1 + total) % total; // not checked — retry it first next run
        checkedCount--;
        break;
      }
      await sleep(wait);
    }
    lastCallAt = Date.now();

    let outcome;
    try {
      outcome = await verifySchemeCore({
        url,
        name:  scheme.name?.en || scheme.id,
        state: scheme.scope === "national" ? "national" : (scheme.state || "state"),
        budgetLimit: MONTHLY_TAVILY_BUDGET,
      });
    } catch (err) {
      console.error(`[schemeVerifyBatch] verifySchemeCore threw for "${id}":`, err.message);
      outcome = { errorKind: "ai", error: err.message, httpStatus: 0 };
    }

    // Config / budget problems affect every scheme equally — stop the run
    // and DON'T advance past this scheme, so nothing is silently skipped.
    if (outcome.errorKind === "config" || outcome.errorKind === "budget") {
      index = (index - 1 + total) % total;
      checkedCount--;
      stopReason = `${outcome.errorKind}: ${outcome.error}`;
      break;
    }
    if (outcome.errorKind === "rate_limit") {
      consecutiveServiceErrors++;
      if (consecutiveServiceErrors >= MAX_CONSECUTIVE_SERVICE_ERRORS) {
        index = (index - 1 + total) % total;
        checkedCount--;
        stopReason = `rate_limit: ${outcome.error}`;
        break;
      }
    } else {
      consecutiveServiceErrors = 0;
    }

    tavilyCallsMade++; // the page fetch happened (Groq rate limits come after it)
    if (outcome.errorKind) {
      errorCount++;
      if (errorSamples.length < 10) errorSamples.push({ id, kind: outcome.errorKind, error: String(outcome.error).slice(0, 160) });
    }
    // A rate-limited AI call taught us nothing — don't stamp lastVerified.
    if (outcome.errorKind !== "rate_limit") results[id] = outcomeToMetaEntry(outcome);
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
    errorCount,
    errorSamples,
    stopReason,
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
