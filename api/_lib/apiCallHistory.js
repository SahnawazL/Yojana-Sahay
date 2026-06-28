// api/_lib/apiCallHistory.js — YojanaSahay · API Call History Logger
// ─────────────────────────────────────────────────────────────────────────────
//
// Increments the correct field in apiCallHistory/{YYYY-MM-DD} (IST date) so
// the AgentsTab API Call Tracker panel can show 30-day running totals.
//
// This is SEPARATE from the midnight-reset counters in adminMeta/aiStatus —
// those reset daily; these accumulate forever so history is preserved.
//
// Uses getFirestore() from the modular firebase-admin SDK — safe to call after
// the default app has been initialized by _lib/firebaseAdmin.js.
//
// Import this in any serverless route:
//   import { logApiCallToHistory } from "./_lib/apiCallHistory.js";
//
// Then call it fire-and-forget after each successful API call:
//   logApiCallToHistory("groqCalls").catch(() => {});
//   logApiCallToHistory("tavilyCalls").catch(() => {});
//   logApiCallToHistory("groqVerifyCalls").catch(() => {});
//   logApiCallToHistory("tavilyVerifyCalls").catch(() => {});
//   logApiCallToHistory("serperCalls").catch(() => {});       // find-new-url.js
// ─────────────────────────────────────────────────────────────────────────────

import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * @param {"groqCalls"|"tavilyCalls"|"groqVerifyCalls"|"tavilyVerifyCalls"|"serperCalls"} service
 * @param {number} [count=1]  — pass a higher number if you batch calls
 */
export async function logApiCallToHistory(service, count = 1) {
  // IST date string → "YYYY-MM-DD", matches the key format used in AgentsTab
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  try {
    await getFirestore()
      .collection("apiCallHistory")
      .doc(dateStr)
      .set(
        {
          date:      dateStr,
          [service]: FieldValue.increment(count),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }  // create doc on day-1, increment thereafter
      );
  } catch (err) {
    // Non-fatal — never let a history write failure break the API response
    console.warn("[logApiCallToHistory] failed:", err.message);
  }
}
