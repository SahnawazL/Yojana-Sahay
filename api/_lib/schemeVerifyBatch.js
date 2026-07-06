// api/_lib/schemeVerifyBatch.js — Yojana Sahay · Automatic Rotating Scheme Verifier
// ─────────────────────────────────────────────────────────────────────────────
// Runs a small batch of Tier-2 AI verification checks (deadline + link-health)
// each time it's called, self-limiting by WALL-CLOCK TIME rather than a fixed
// scheme count — so it safely adapts to whatever the real configured function
// timeout turns out to be in practice, without needing to trust that number
// blindly. It always stops itself with a safety margin to spare.
//
// Progress is tracked by a rotating cursor stored in Firestore
// (appMeta/verifyCursor), so each invocation picks up exactly where the last
// one left off, and wraps back to 0 after the last scheme — a continuous,
// never-ending freshness sweep across the whole ~1100+ scheme catalog.
//
// Triggered via api/deadline-alerts.js's `action: "verifyBatch"` cron branch,
// which an external scheduler (GitHub Actions) calls every ~15-20 minutes —
// NOT via Vercel's own once-a-day cron, which is far too infrequent to keep
// up with a catalog this size.
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
// buffer) so a batch never risks getting hard-killed mid-write. If that 300s
// limit is later confirmed to reliably hold in production, this can be raised
// to check more schemes per run.
const MAX_RUNTIME_MS   = 240_000;
const DELAY_BETWEEN_MS = 3500; // same pacing as the browser-side verifier — stays under Groq's free-tier rate limit

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function runSchemeVerificationBatch() {
  const db = getAdminDb();
  const startedAt = Date.now();

  // Stable, deterministic order so the cursor means the same position every
  // run, even though SCHEME_DB itself isn't sorted and can grow over time.
  const allIds = SCHEME_DB.map(s => s.id).sort();
  const total  = allIds.length;
  const schemeById = new Map(SCHEME_DB.map(s => [s.id, s]));

  const cursorRef   = db.collection("appMeta").doc("verifyCursor");
  const cursorSnap  = await cursorRef.get();
  const cursorBefore = cursorSnap.exists ? (cursorSnap.data().index || 0) : 0;
  let index = cursorBefore >= total ? 0 : cursorBefore; // catalog may have shrunk since last run

  const results = {};
  let checkedCount = 0;
  let skippedNoUrl = 0;
  let firstIteration = true;

  while (Date.now() - startedAt < MAX_RUNTIME_MS) {
    if (checkedCount >= total) break; // completed a full lap within a single run (small catalogs only)

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
      continue; // no real checkable URL — don't waste a Groq call, just advance past it
    }

    try {
      const outcome = await verifySchemeCore({
        url,
        name:  scheme.name?.en || scheme.id,
        state: scheme.scope || "national",
      });
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
    skippedNoUrl,
    withResults:  Object.keys(results).length,
    cursorBefore,
    cursorAfter:  index,
    totalSchemes: total,
    durationMs:   Date.now() - startedAt,
    commitResult,
    commitError,
    results, // scheme ids + what was found, for logging/debugging in the run history
  };
}
