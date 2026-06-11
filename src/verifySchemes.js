// verifySchemes.js — Yojana Sahay Scheme Verification Engine
// ─────────────────────────────────────────────────────────────────────────────
//
// Two-tier verification for 1000+ government schemes.
//
// TIER 1 — Dead Link Check  (all online schemes · fast · free · no AI)
//   Calls /api/ping-url (Vercel serverless) which makes a direct HEAD/GET
//   request to each scheme URL from the server — bypasses browser CORS and
//   avoids the allorigins.win proxy which is blocked by .gov.in domains.
//   Batches of 10 run in parallel → ~2-3 min for 444 schemes.
//
// TIER 2 — AI Date Extraction  (priority schemes only · ~150-200)
//   Calls /api/verify-scheme (Vercel serverless, same key-rotation as chat.js)
//   to extract lastDate + active/closed status from the live page.
//   Only fires for: schemes with lastDate set  OR  failed Tier 1  OR  stale 30d+
//   NOTE: /api/verify-scheme endpoint is scaffolded here — build next session.
//
// FILTERS (applied before the run):
//   scopeFilter:    "national" | "state:<state_name>" | "all"
//   priorityFilter: "all" | "hasDate" | "neverVerified" | "stale"
//
// PRIORITY QUEUE (inside each filtered set, automatically sorted):
//   0 → lastDate already past (expired?)
//   1 → lastDate within 30 days (expiring soon)
//   2 → never verified before
//   3 → last verified 30+ days ago (stale)
//   4 → recently verified (lowest urgency)
//
// RESUME SYSTEM:
//   After every batch of BATCH_SIZE schemes, progress is saved to Firestore
//   (adminMeta / verifyCheckpoint). If the tab crashes at scheme #47, the
//   next run detects the checkpoint and can resume from #47.
//
// EXPORTS (consumed by SchemeVerifier.jsx):
//   buildVerificationQueue(scopeFilter, priorityFilter) → scheme[]
//   runVerification(options)                            → result[]
//   buildSummary(results)                               → stats object
//   saveCheckpoint(payload)                             → void
//   loadCheckpoint()                                    → checkpoint | null
//   clearCheckpoint()                                   → void
//   getVerifiableCount(scopeFilter, priorityFilter)     → number
//   getStatesInDB()                                     → string[]
//
// ─────────────────────────────────────────────────────────────────────────────

import { SCHEME_DB } from "./schemesData.js";
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";


// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BATCH_SIZE       = 10;
const PING_TIMEOUT_MS  = 12000;  // 12 s — Vercel function makes direct request, gov sites can be slow
const CHECKPOINT_PATH  = ["adminMeta", "verifyCheckpoint"];  // Firestore path
const THIRTY_DAYS_MS   = 30 * 24 * 60 * 60 * 1000;


// ─── URL NORMALISER ───────────────────────────────────────────────────────────
// schemesData.js stores bare domains (e.g. "pmkisan.gov.in").
// Prepend https:// so fetch() can handle them correctly.
// Returns null for non-URL values like "Nearest bank branch".

function normalizeUrl(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  // Reject plain-text descriptions (contain spaces or no dot)
  if (trimmed.includes(" ") || !trimmed.includes(".")) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}


// ─── PRIORITY SCORE ───────────────────────────────────────────────────────────
// Lower = more urgent.  Used to sort the queue before running.

function getPriorityScore(scheme) {
  const now  = Date.now();
  const last = scheme.lastDate   ? new Date(scheme.lastDate).getTime()   : null;
  const veri = scheme.lastVerified ? new Date(scheme.lastVerified).getTime() : null;

  if (last && last < now)                         return 0; // already past lastDate
  if (last && last - now < THIRTY_DAYS_MS)        return 1; // expiring within 30 d
  if (!veri)                                      return 2; // never verified
  if (veri && now - veri > THIRTY_DAYS_MS)        return 3; // stale 30 d+
  return 4;                                                  // recently verified
}


// ─── QUEUE BUILDER ────────────────────────────────────────────────────────────
// Returns a sorted array of schemes that have an online apply URL,
// filtered by scope + priority, ordered by urgency.

export function buildVerificationQueue(
  scopeFilter    = "all",
  priorityFilter = "all"
) {
  const now = Date.now();

  // 1. Only schemes with a real online URL to ping
  // Note: schemesData.js stores bare domains (e.g. "pmkisan.gov.in") — no https:// prefix.
  // normalizeUrl() handles this; returns null for plain-text values like "Nearest bank branch".
  let schemes = SCHEME_DB.filter(
    s => s.applyType === "online" && !!normalizeUrl(s.apply?.en)
  );

  // 2. Scope filter
  if (scopeFilter === "national") {
    schemes = schemes.filter(s => s.scope === "national");
  } else if (scopeFilter.startsWith("state:")) {
    const stateName = scopeFilter.slice(6).trim().toLowerCase();
    schemes = schemes.filter(
      s => s.scope === "state" && (s.state ?? "").toLowerCase() === stateName
    );
  }
  // "all" → no further scope filter

  // 3. Priority filter (narrows the set further)
  if (priorityFilter === "hasDate") {
    schemes = schemes.filter(s => !!s.lastDate);

  } else if (priorityFilter === "neverVerified") {
    schemes = schemes.filter(s => !s.lastVerified);

  } else if (priorityFilter === "stale") {
    schemes = schemes.filter(s => {
      if (!s.lastVerified) return false;
      return now - new Date(s.lastVerified).getTime() > THIRTY_DAYS_MS;
    });
  }
  // "all" → no further priority filter

  // 4. Sort by urgency
  return [...schemes].sort(
    (a, b) => getPriorityScore(a) - getPriorityScore(b)
  );
}


// ─── TIER 1: DEAD LINK PING ───────────────────────────────────────────────────
// Calls /api/ping-url (Vercel serverless) which makes a direct server-to-server
// HEAD/GET request to the scheme URL.
//
// Why NOT using allorigins.win proxy anymore:
//   Browser → allorigins proxy → .gov.in = BLOCKED (proxy IPs blacklisted by govt)
//   Browser → /api/ping-url (Vercel) → .gov.in = WORKS (server-to-server)

async function pingUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return { httpStatus: 0, alive: false, error: "invalid URL" };
  }

  try {
    const res = await fetch("/api/ping-url", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: normalized }),
    });

    if (!res.ok) {
      return { httpStatus: 0, alive: false, error: `ping-url API error ${res.status}` };
    }

    return await res.json(); // { httpStatus, alive, error }

  } catch (err) {
    return { httpStatus: 0, alive: false, error: err.message };
  }
}


// ─── TIER 2: AI DATE EXTRACTION (SCAFFOLDED) ──────────────────────────────────
// /api/verify-scheme is built in the NEXT session (same key-rotation as chat.js).
// It receives scheme metadata, fetches the live page, and returns:
//   { lastDate: "YYYY-MM-DD" | null, isActive: boolean | null, confidence: 0-1 }
//
// This function is already wired up — once the endpoint exists it works
// automatically.  Until then it returns { error: "endpoint not yet built" }.

async function extractDateViaAI(scheme) {
  try {
    const url = normalizeUrl(scheme.apply?.en);
    if (!url) return { lastDate: null, isActive: null, confidence: 0, error: "invalid URL" };
    const res = await fetch("/api/verify-scheme", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id:    scheme.id,
        url,
        name:  scheme.name.en,
        state: scheme.state  ?? "national",
        scope: scheme.scope,
      }),
    });

    if (!res.ok) {
      return { lastDate: null, isActive: null, confidence: 0, error: `API ${res.status}` };
    }

    const data = await res.json();
    return {
      lastDate:   data.lastDate   ?? null,
      isActive:   data.isActive   ?? null,
      confidence: data.confidence ?? 0,
      error:      null,
    };

  } catch (err) {
    return { lastDate: null, isActive: null, confidence: 0, error: err.message };
  }
}


// ─── CHECKPOINT: SAVE ─────────────────────────────────────────────────────────
// Firestore: adminMeta / verifyCheckpoint
// Called automatically after every BATCH_SIZE schemes.

export async function saveCheckpoint(payload) {
  try {
    await setDoc(
      doc(db, ...CHECKPOINT_PATH),
      { ...payload, savedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    // Non-fatal — log and continue.  Verification still runs; resume just won't work.
    console.warn("[verifySchemes] Checkpoint save failed:", err.message);
  }
}


// ─── CHECKPOINT: LOAD ─────────────────────────────────────────────────────────
// Returns checkpoint object or null if none exists.

export async function loadCheckpoint() {
  try {
    const snap = await getDoc(doc(db, ...CHECKPOINT_PATH));
    if (snap.exists()) return snap.data();
  } catch (err) {
    console.warn("[verifySchemes] Checkpoint load failed:", err.message);
  }
  return null;
}


// ─── CHECKPOINT: CLEAR ────────────────────────────────────────────────────────
// Call this when starting a fresh run (user chooses not to resume).

export async function clearCheckpoint() {
  try {
    await setDoc(
      doc(db, ...CHECKPOINT_PATH),
      { cleared: true, savedAt: serverTimestamp() }
    );
  } catch (err) {
    console.warn("[verifySchemes] Checkpoint clear failed:", err.message);
  }
}


// ─── SUMMARY BUILDER ──────────────────────────────────────────────────────────
// Aggregates a results array into the stat cards shown in SchemeVerifier.jsx.
// Safe to call mid-run for a live summary.

export function buildSummary(results) {
  const now = Date.now();

  return results.reduce(
    (acc, r) => {
      acc.total++;

      if (r.alive === true)  acc.active++;
      if (r.alive === false) acc.dead++;
      if (r.alive === null)  acc.noResponse++;

      if (r.error && r.error !== null) acc.errors++;

      const ld = r.scheme.lastDate ? new Date(r.scheme.lastDate).getTime() : null;
      if (ld) {
        if (ld < now)                    acc.expired++;
        else if (ld - now < THIRTY_DAYS_MS) acc.expiringSoon++;
      }

      if (!r.scheme.lastVerified) acc.neverChecked++;

      return acc;
    },
    {
      total:        0,
      active:       0,
      dead:         0,
      noResponse:   0,
      errors:       0,
      expired:      0,
      expiringSoon: 0,
      neverChecked: 0,
    }
  );
}


// ─── MAIN RUNNER ──────────────────────────────────────────────────────────────
//
// options:
//   scopeFilter    — "national" | "state:<name>" | "all"        (default: "all")
//   priorityFilter — "all" | "hasDate" | "neverVerified" | "stale" (default: "all")
//   tier           — 1 | 2 | "both"                             (default: 1)
//                      1    → Tier 1 dead-link ping only
//                      2    → Tier 2 AI extraction only (skips Tier 1 ping)
//                      "both" → Tier 1 for all + Tier 2 for priority schemes
//   resumeFrom     — queue index to start from (0 = fresh run)   (default: 0)
//   onProgress     — ({ index, total, scheme, result }) → void
//                      called after EACH scheme completes
//   onBatchSaved   — (checkpoint) → void
//                      called after each batch of BATCH_SIZE is saved to Firestore
//   signal         — AbortSignal — call controller.abort() to stop mid-run
//
// Returns: Promise<result[]>
//   Each result: {
//     scheme,         — original scheme object from SCHEME_DB
//     tier,           — 1 or 2 (which tier produced the primary result)
//     alive,          — true | false | null
//     httpStatus,     — HTTP status code (0 if timeout/error)
//     lastDate,       — "YYYY-MM-DD" or null (Tier 2 only)
//     isActive,       — boolean or null     (Tier 2 only)
//     confidence,     — 0–1                 (Tier 2 only)
//     error,          — error string or null
//   }

export async function runVerification({
  scopeFilter    = "all",
  priorityFilter = "all",
  tier           = 1,
  resumeFrom     = 0,
  onProgress     = () => {},
  onBatchSaved   = () => {},
  signal,
} = {}) {

  const queue   = buildVerificationQueue(scopeFilter, priorityFilter);
  const total   = queue.length;
  const results = [];

  // Which schemes also need Tier 2 AI extraction?
  const needsAI = (scheme) => {
    if (tier === 2)     return true;   // explicit Tier 2 run
    if (tier === 1)     return false;  // Tier 1 only — skip AI
    // tier === "both": only run AI on priority schemes (saves Groq credits)
    return (
      !!scheme.lastDate          ||   // has a deadline to monitor
      !scheme.lastVerified            // never been checked before
    );
  };

  for (let i = resumeFrom; i < total; i++) {

    // ── Abort check ───────────────────────────────────────────────────────────
    if (signal?.aborted) {
      console.log("[verifySchemes] Run cancelled at scheme", i + 1, "of", total);
      break;
    }

    const scheme = queue[i];
    const result = {
      scheme,
      tier:       1,
      alive:      null,
      httpStatus: null,
      lastDate:   null,
      isActive:   null,
      confidence: null,
      error:      null,
    };

    // ── Tier 1: Dead link ping ─────────────────────────────────────────────────
    if (tier !== 2) {
      const ping      = await pingUrl(scheme.apply?.en);
      result.alive      = ping.alive;
      result.httpStatus = ping.httpStatus;
      result.error      = ping.error;
    }

    // ── Tier 2: AI date extraction ────────────────────────────────────────────
    if (needsAI(scheme)) {
      result.tier = 2;
      const ai = await extractDateViaAI(scheme);
      result.lastDate   = ai.lastDate;
      result.isActive   = ai.isActive;
      result.confidence = ai.confidence;

      // Append AI error (if any) without overwriting ping error
      if (ai.error) {
        result.error = result.error
          ? `${result.error} | AI: ${ai.error}`
          : `AI: ${ai.error}`;
      }
    }

    results.push(result);

    // ── Progress callback (live updates for SchemeVerifier.jsx) ───────────────
    onProgress({ index: i + 1, total, scheme, result });

    // ── Save checkpoint every BATCH_SIZE or on final scheme ───────────────────
    if ((i + 1) % BATCH_SIZE === 0 || i + 1 === total) {
      const checkpoint = {
        scopeFilter,
        priorityFilter,
        tier,
        completedIndex: i + 1,
        total,
        isComplete:     i + 1 === total,
        summary:        buildSummary(results),
      };
      await saveCheckpoint(checkpoint);
      onBatchSaved(checkpoint);
    }
  }

  return results;
}


// ─── HELPERS ─────────────────────────────────────────────────────────────────

// How many schemes will a given filter set produce?
// Used by SchemeVerifier.jsx to preview the run size before starting.
export function getVerifiableCount(
  scopeFilter    = "all",
  priorityFilter = "all"
) {
  return buildVerificationQueue(scopeFilter, priorityFilter).length;
}

// Unique list of states that have verifiable (online) schemes in SCHEME_DB.
// Used to populate the state dropdown in SchemeVerifier.jsx.
export function getStatesInDB() {
  const stateSet = new Set(
    SCHEME_DB
      .filter(s => s.scope === "state" && s.state && s.applyType === "online" && s.apply?.en)
      .map(s => s.state)
  );
  return [...stateSet].sort();
}
