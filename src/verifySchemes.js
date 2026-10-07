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
// TIER 2 — AI Date Extraction  (all schemes with a URL in "both"/2 — Fix 1)
//   Calls /api/verify-scheme (Vercel serverless, same key-rotation as chat.js)
//   to extract lastDate + active/closed status from the live page.
//   Runs for every scheme in the queue when tier is "both" or 2.
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
//   saveUrlFix(schemeId, candidates)                    → void
//   loadUrlFixes()                                      → { [schemeId]: fix }
//   queueUrlFix(schemeId, payload)                      → void
//   unqueueUrlFix(schemeId, candidates)                 → void
//   commitQueuedFixes(queue)                            → { results, commits }
//   markUrlFixCommitted(id, url, sha, commitUrl)        → void
//   getKnownDeadLinks()                                 → result[] (persisted)
//
// ─────────────────────────────────────────────────────────────────────────────


import { SCHEME_DB } from "./schemesData.js";
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import schemesMeta from "./schemes-meta.json";
import { adminJson } from "./adminFetch.js";


// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BATCH_SIZE       = 10;
const PING_TIMEOUT_MS  = 12000;  // 12 s — Vercel function makes direct request, gov sites can be slow
const CHECKPOINT_PATH  = ["adminMeta", "verifyCheckpoint"];  // Firestore path
const THIRTY_DAYS_MS   = 30 * 24 * 60 * 60 * 1000;

// ── Rate-guard delays ──────────────────────────────────────────────────────
// Tier 1 (URL ping) never hits Groq — no delay needed.
// Tier 2 (AI extract): Groq's free tier for gpt-oss-20b is limited by TOKENS
// per minute (~8K/key), not just requests, and each check is ~1.5K tokens.
// The delay starts at TIER2_DELAY_MS and adapts: it doubles (up to
// TIER2_MAX_DELAY_MS) whenever Groq reports a rate limit — and that scheme is
// retried once — then eases back down after successful calls.
const TIER1_DELAY_MS     = 0;      // ping-only: no Groq involved
const TIER2_DELAY_MS     = 4000;   // starting gap between AI calls
const TIER2_MAX_DELAY_MS = 60000;  // ceiling for the adaptive back-off

// Domains known to block direct pings from Vercel's server IPs.
// Pinging these always returns a timeout or connection error, NOT because
// the site is dead — but because NIC/government infrastructure firewalls
// non-Indian server IPs. Short-circuiting these to alive:null ("No Response")
// prevents valid scheme URLs from being falsely labelled "Dead" in the admin UI.
// Tavily (Tier 2) can still reach these fine via its own crawler.
const INDIA_ONLY_DOMAINS = [
  "nic.in",          // National Informatics Centre — all subdomains (e.g. services.india.gov.in on nic infra)
  "india.gov.in",    // National Portal of India (NIC-hosted)
  "nesdr.gov.in",    // NE Space & Disaster Research — blocks non-Indian IPs (e.g. mobileapp.nesdr.gov.in)
  "assam.gov.in",    // Assam state portal — all subdomains (e.g. dids, aeda, cmcovidsupport, etc.)
  "mygov.in",        // MyGov India — citizen engagement platform
];


// ─── SLEEP UTILITY ───────────────────────────────────────────────────────────
// Resolves after `ms` milliseconds. Respects AbortSignal — if the run is
// stopped/paused mid-delay it resolves immediately so the abort check in
// the main loop fires on the very next iteration, not after the full delay.

function sleep(ms, signal) {
  return new Promise((resolve) => {
    if (!ms || ms <= 0 || signal?.aborted) { resolve(); return; }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); resolve(); }, { once: true });
  });
}


// ─── URL NORMALISER ───────────────────────────────────────────────────────────
// schemesData.js stores bare domains (e.g. "pmkisan.gov.in").
// Prepend https:// so fetch() can handle them correctly.
// Returns null for non-URL values like "Nearest bank branch".

function normalizeUrl(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  // Already a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  // Mixed text: domain followed by description, e.g.:
  //   "mss.edu.in (Maharashtra State Skills University)"
  //   "mahadbt.maharashtra.gov.in (Farmer portal)"
  //   "mudhalvarmarundhagam.tn.gov.in — walk in to any outlet"
  //   "tnreginet.gov.in — automatic at time of property registration"
  // Extract just the first token (before any space/dash/parenthesis).
  // If it looks like a domain (contains a dot), treat it as the URL.
  if (trimmed.includes(" ")) {
    const firstToken = trimmed.split(/[\s(—–,]/)[0].trim();
    if (firstToken && firstToken.includes(".") && !firstToken.includes("/")) {
      return `https://${firstToken}`;
    }
    return null; // genuine plain text like "Nearest bank branch" or "Nearest CSC center"
  }

  // No dot → plain text description, not a URL
  if (!trimmed.includes(".")) return null;
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
  priorityFilter = "all",
  overlayMap     = null      // optional: pass a custom overlay; defaults to bundled schemesMeta
) {
  const now = Date.now();

  // 1. Only schemes with a real online URL to ping
  // Note: schemesData.js stores bare domains (e.g. "pmkisan.gov.in") — no https:// prefix.
  // normalizeUrl() handles this; returns null for plain-text values like "Nearest bank branch".
  let schemes = SCHEME_DB.filter(
    s => s.applyType === "online" && !!normalizeUrl(s.apply?.en)
  );

  // 2. Merge schemes-meta.json overlay into each scheme so lastDate / lastVerified
  //    actually exist on the objects — filters and priority scoring depend on them.
  const overlay = overlayMap ?? schemesMeta;
  schemes = schemes.map(s => {
    const meta = overlay[s.id];
    return meta ? { ...s, ...meta } : s;
  });

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


// ─── INDIA-BOUND DOMAIN DETECTOR ─────────────────────────────────────────────
// Returns true if the URL's hostname ends with any domain in INDIA_ONLY_DOMAINS.
// Uses URL() for safe parsing — no fragile regex on the raw string.

function isIndiaBoundDomain(normalizedUrl) {
  try {
    const hostname = new URL(normalizedUrl).hostname.toLowerCase();
    return INDIA_ONLY_DOMAINS.some(
      d => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch {
    return false; // malformed URL — let pingUrl's normalizeUrl guard handle it
  }
}


// ─── TIER 1: DEAD LINK PING ───────────────────────────────────────────────────
// Calls /api/ping-url (Vercel serverless) which makes a direct server-to-server
// HEAD/GET request to the scheme URL.
//
// Why NOT using allorigins.win proxy anymore:
//   Browser → allorigins proxy → .gov.in = BLOCKED (proxy IPs blacklisted by govt)
//   Browser → /api/ping-url (Vercel) → .gov.in = WORKS (server-to-server)

export async function pingUrl(url, signal = null) {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return { httpStatus: 0, alive: false, error: "invalid URL" };
  }

  // India-bound domains: NIC and similar government infrastructure blocks
  // pings from Vercel's non-Indian IPs. That says nothing about the link, so
  // it is reported as "No Response" with an informational note — NOT as an
  // error (it used to inflate the Errors counter on every run).
  if (isIndiaBoundDomain(normalized)) {
    return {
      httpStatus: 0,
      alive:      null,
      error:      null,
      note:       "India-only domain — Vercel's servers are geo-blocked, so Tier 1 can't check it (Tier 2 via Tavily can).",
    };
  }

  try {
    // Server rules (api/ping-url.js): 401/403/429 → alive (bot-blocking),
    // timeouts/resets → null (inconclusive), DNS miss / 404 → false.
    const data = await adminJson("/api/ping-url", { url: normalized }, { signal });
    return {
      httpStatus: data.httpStatus ?? 0,
      alive:      data.alive === true ? true : data.alive === false ? false : null,
      error:      data.error ?? null,
      note:       data.note ?? null,
    };
  } catch (err) {
    if (err.name === "AbortError") throw err;
    // Our own API failing is not evidence the scheme's link is dead.
    return { httpStatus: 0, alive: null, error: `ping-url API error: ${err.message}` };
  }
}


// ─── TIER 2: AI DATE EXTRACTION (SCAFFOLDED) ──────────────────────────────────
// /api/verify-scheme is built in the NEXT session (same key-rotation as chat.js).
// It receives scheme metadata, fetches the live page, and returns:
//   { lastDate: "YYYY-MM-DD" | null, isActive: boolean | null, confidence: 0-1 }
//
// This function is already wired up — once the endpoint exists it works
// automatically.  Until then it returns { error: "endpoint not yet built" }.

async function extractDateViaAI(scheme, signal = null) {
  const url = normalizeUrl(scheme.apply?.en);
  if (!url) return { lastDate: null, isActive: null, confidence: null, httpStatus: 0, error: "invalid URL", errorKind: "page" };
  try {
    const data = await adminJson("/api/verify-scheme", {
      id:    scheme.id,
      url,
      name:  scheme.name?.en || scheme.id,
      state: scheme.scope === "national" ? "national" : (scheme.state ?? "state"),
      scope: scheme.scope,
    }, { signal });

    return {
      lastDate:   data.lastDate   ?? null,
      isActive:   data.isActive   ?? null,
      confidence: data.errorKind ? null : (data.confidence ?? 0),
      // HTTP status of the scheme's page as seen by Tavily (0 = unknown).
      httpStatus: data.httpStatus ?? 0,
      // The old version always returned error:null here, hiding every AI
      // failure — and the failed run then wiped good deadlines.
      error:      data.error ?? null,
      errorKind:  data.errorKind ?? (data.error ? "ai" : null),
      note:       data.note ?? null,
    };
  } catch (err) {
    if (err.name === "AbortError") throw err;
    const kind = err.status === 401 || err.status === 403 ? "config" : "ai";
    return { lastDate: null, isActive: null, confidence: null, httpStatus: 0, error: err.message, errorKind: kind };
  }
}


// ─── CHECKPOINT: SAVE ─────────────────────────────────────────────────────────
// Firestore: adminMeta / verifyCheckpoint
// Called automatically after every BATCH_SIZE schemes.

export async function saveCheckpoint(payload) {
  try {
    await setDoc(
      doc(db, ...CHECKPOINT_PATH),
      // cleared:false — clearCheckpoint() leaves cleared:true in the doc and
      // this write MERGES, so without resetting it every later checkpoint
      // stayed "cleared" and the Resume banner never appeared after a reload.
      { ...payload, cleared: false, savedAt: serverTimestamp() },
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

      if (r.error) acc.errors++;

      // Prefer the deadline this run just found over the bundled one.
      const lastDate = r.lastDate || r.scheme?.lastDate;
      const ld = lastDate ? new Date(lastDate).getTime() : null;
      if (ld) {
        if (ld < now)                    acc.expired++;
        else if (ld - now < THIRTY_DAYS_MS) acc.expiringSoon++;
      }

      if (!r.scheme?.lastVerified) acc.neverChecked++;
      if (r.lastDate) acc.datesFound++;

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
      datesFound:   0,
    }
  );
}


// ─── MAIN RUNNER ──────────────────────────────────────────────────────────────
//
// options:
//   scopeFilter    — "national" | "state:<name>" | "all"        (default: "all")
//   priorityFilter — "all" | "hasDate" | "neverVerified" | "stale" (default: "all")
//   tier           — 1 | 2 | "both"                             (default: 1)
//   resumeFrom     — queue index to start from (0 = fresh run)   (default: 0)
//   resumeQueueIds — the exact queue (scheme ids, in order) saved in the
//                    checkpoint. Resuming against a freshly built queue used
//                    to start at the right INDEX of the WRONG list whenever
//                    the filters or schemes-meta.json had changed.
//   onProgress     — ({ index, total, scheme, result }) → void   after EACH scheme
//   onBatchSaved   — (checkpoint) → void                         after each save
//   onThrottle     — ({ delayMs, index, total, reason? }) | null  rate-guard sleep
//   onNotice       — ({ level, message }) → void  run-level problems (budget,
//                    missing keys, rate limits) the admin needs to see
//   shouldSaveOnAbort — () → boolean. On Pause the exact position is saved so
//                    Resume continues with the next scheme (not up to 9 back).
//   signal         — AbortSignal — call controller.abort() to stop mid-run
//
// Returns: Promise<result[]>
//   Each result: {
//     scheme,         — scheme object (with any committed URL fix applied)
//     tier,           — 1 or 2 (2 when Tier 2 ran)
//     alive,          — true | false | null  LINK health for the UI (never the
//                       AI's "applications open" verdict — closed ≠ dead link)
//     linkAlive,      — true | false | null | undefined  (persisted link health)
//     httpStatus,     — HTTP status code (0/null if unknown)
//     lastDate,       — "YYYY-MM-DD" or null (Tier 2 only)
//     isActive,       — boolean or null     (Tier 2 only — "applications open?")
//     confidence,     — 0–1 or null         (Tier 2 only; null = AI failed)
//     aiError,        — Tier 2 error kind or null ("rate_limit" | "budget" | …)
//     aiSkipped,      — true when Tier 2 was skipped (budget / config stop)
//     error,          — error string or null
//     note,           — informational message (not an error) or null
//   }

export async function runVerification({
  scopeFilter    = "all",
  priorityFilter = "all",
  tier           = 1,
  resumeFrom     = 0,
  resumeQueueIds = null,
  onProgress     = () => {},
  onBatchSaved   = () => {},
  onThrottle     = () => {},
  onNotice       = () => {},
  shouldSaveOnAbort = () => true,
  signal,
} = {}) {

  // ── Build the queue (or rebuild the saved one for a resume) ────────────────
  let queue;
  if (Array.isArray(resumeQueueIds) && resumeQueueIds.length > 0) {
    const fresh = buildVerificationQueue("all", "all");
    const byId  = new Map(fresh.map(s => [s.id, s]));
    queue = resumeQueueIds.map(id => byId.get(id)).filter(Boolean);
  } else {
    queue = buildVerificationQueue(scopeFilter, priorityFilter);
  }
  const total    = queue.length;
  const queueIds = queue.map(s => s.id);
  const results  = [];
  let queueIdsSaved = resumeFrom > 0 && Array.isArray(resumeQueueIds);

  // ── Overlay committed URL fixes onto the queue ──────────────────────────────
  // A committed fix only reaches SCHEME_DB after a redeploy; until then the
  // scan must check the NEW URL (the same one the per-row "Re-check" uses),
  // or it reports the already-fixed link as dead again.
  let urlFixes = {};
  try {
    urlFixes = await loadUrlFixes();
  } catch (err) {
    console.warn("[runVerification] couldn't load urlFixes overlay:", err.message);
  }
  const effectiveUrlFor = (scheme) => {
    const fix = urlFixes[scheme.id];
    return (fix?.status === "committed" && fix?.newUrl) ? fix.newUrl : scheme.apply?.en;
  };

  let aiEnabled  = tier !== 1;
  let aiDelayMs  = TIER2_DELAY_MS;
  let completed  = resumeFrom;   // index of the next unprocessed scheme

  const saveProgress = async () => {
    const checkpoint = {
      scopeFilter,
      priorityFilter,
      tier,
      completedIndex: completed,
      total,
      isComplete:     completed >= total,
      summary:        buildSummary(results),
    };
    if (!queueIdsSaved) { checkpoint.queueIds = queueIds; queueIdsSaved = true; }
    await saveCheckpoint(checkpoint);
    onBatchSaved(checkpoint);
  };

  const runAI = async (scheme) => {
    let ai = await extractDateViaAI(scheme, signal);
    if (ai.errorKind === "rate_limit" && !signal?.aborted) {
      // Back off, then retry this scheme once instead of recording a failure.
      aiDelayMs = Math.min(TIER2_MAX_DELAY_MS, Math.max(aiDelayMs * 2, 15000));
      onNotice({ level: "warn", message: `Groq rate limit hit — slowing down to one AI check every ${Math.round(aiDelayMs / 1000)}s.` });
      onThrottle({ delayMs: aiDelayMs, index: completed + 1, total, reason: "rate_limit" });
      await sleep(aiDelayMs, signal);
      onThrottle(null);
      if (signal?.aborted) return ai;
      ai = await extractDateViaAI(scheme, signal);
    } else if (!ai.errorKind) {
      aiDelayMs = Math.max(TIER2_DELAY_MS, Math.round(aiDelayMs * 0.85));
    }
    return ai;
  };

  for (let i = resumeFrom; i < total; i++) {
    if (signal?.aborted) break;

    const rawScheme = queue[i];
    const fixedUrl  = effectiveUrlFor(rawScheme);
    const scheme    = (fixedUrl !== rawScheme.apply?.en)
      ? { ...rawScheme, apply: { ...rawScheme.apply, en: fixedUrl } }
      : rawScheme;

    const result = {
      scheme,
      tier:       1,
      alive:      null,
      linkAlive:  undefined, // undefined = Tier 1 never ran; null = ran but inconclusive
      httpStatus: null,
      lastDate:   null,
      isActive:   null,
      confidence: null,
      aiError:    null,
      aiSkipped:  false,
      error:      null,
      note:       null,
    };

    let aborted = false;
    try {
      // ── Tier 1: Dead link ping ───────────────────────────────────────────
      if (tier !== 2) {
        const ping = await pingUrl(scheme.apply?.en, signal);
        result.alive      = ping.alive;
        result.linkAlive  = ping.alive;
        result.httpStatus = ping.httpStatus;
        result.error      = ping.error ?? null;
        result.note       = ping.note ?? null;
      }

      // ── Tier 2: AI date extraction ───────────────────────────────────────
      if (tier !== 1) {
        result.tier = 2;
        if (!aiEnabled) {
          result.aiSkipped = true;
        } else {
          const ai = await runAI(scheme);
          if (signal?.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });

          result.aiError = ai.errorKind ?? null;
          if (!ai.errorKind) {
            result.lastDate   = ai.lastDate;
            result.isActive   = ai.isActive;
            result.confidence = ai.confidence;
            if (ai.note) result.note = result.note ? `${result.note} · ${ai.note}` : ai.note;
          }

          // Tavily's crawler reaches pages Vercel's direct ping can't — use
          // its status when Tier 1 didn't run or was inconclusive.
          if ((!result.httpStatus) && ai.httpStatus) result.httpStatus = ai.httpStatus;

          // Link health from Tier 2's page fetch (only when Tier 1 gave no
          // answer). NOT from isActive: "applications closed" ≠ "dead link".
          if (result.alive === null) {
            const h = ai.httpStatus || 0;
            if (h >= 200 && h < 400)         result.alive = true;
            else if (h === 404 || h === 410) result.alive = false;
            if (result.alive !== null) result.linkAlive = result.alive;
          }

          if (ai.error) {
            result.error = result.error ? `${result.error} | AI: ${ai.error}` : `AI: ${ai.error}`;
          }

          // Budget / configuration problems affect every remaining scheme:
          // stop spending calls and tell the admin why.
          if (ai.errorKind === "budget" || ai.errorKind === "config") {
            aiEnabled = false;
            onNotice({
              level: "error",
              message: ai.errorKind === "budget"
                ? `Tier 2 stopped: ${ai.error}`
                : `Tier 2 stopped — ${ai.error}`,
            });
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError" || signal?.aborted) aborted = true;
      else result.error = result.error ?? err.message;
    }
    if (aborted) break;   // don't record a half-checked scheme

    results.push(result);
    completed = i + 1;
    onProgress({ index: i + 1, total, scheme, result });

    // Tier 2-only run with AI disabled (budget / keys) has nothing left to
    // do — stop here and keep a checkpoint so it can be resumed later.
    if (tier === 2 && !aiEnabled) {
      if (completed < total) await saveProgress();
      break;
    }

    if (completed % BATCH_SIZE === 0 || completed === total) {
      await saveProgress();
    }

    // ── Rate-guard delay ──────────────────────────────────────────────────
    if (completed < total && !signal?.aborted) {
      const delayMs = (tier !== 1 && aiEnabled) ? aiDelayMs : TIER1_DELAY_MS;
      if (delayMs > 0) {
        onThrottle({ delayMs, index: completed, total });
        await sleep(delayMs, signal);
        onThrottle(null);
      }
    }
  }

  // Save the exact stopping point on Pause (or the final state on skip-out).
  if (completed < total && completed > resumeFrom && signal?.aborted && shouldSaveOnAbort()) {
    await saveProgress();
  }

  return results;
}


// ─── SCHEME OVERLAY LOADER ────────────────────────────────────────────────────
// Returns the statically bundled schemes-meta.json object.
// Used by SchemeVerifier.jsx on mount to pass into buildVerificationQueue,
// and by App.jsx to merge into SCHEME_DB.

export function loadSchemeOverlay() {
  return schemesMeta;
}


// ─── WRITE SCHEME RESULTS ─────────────────────────────────────────────────────
// Called automatically after every verification run to persist results back to
// src/schemes-meta.json in the GitHub repo via /api/update-schemes-meta.
//
// Each result is distilled to an entry keyed by scheme ID:
//   { lastVerified, linkAlive?, httpStatus?, lastDate?, isActive?, confidence? }
//
// Fix 3 — linkAlive vs isActive:
//   `linkAlive`  = Tier 1's pure "is the URL reachable" result.
//   `isActive`   = Tier 2's AI verdict on "is the scheme accepting applications".
//   These used to share one `isActive` field, so a Tier 2 run on a perfectly
//   live URL could overwrite the link-health badge with "Dead" just because the
//   page said applications were closed. Now they're written separately and
//   never clobber each other.
//
// Fix 4 — clearing stale deadlines:
//   `lastDate` is written whenever Tier 2 ran — including as `null` when the AI
//   confirms the page no longer shows a deadline. /api/update-schemes-meta treats
//   an explicit `lastDate: null` as "clear this field" (unlike other fields,
//   where null means "no new info, keep existing"), so a scheme that becomes
//   ongoing/perpetual stops showing a stale "Apply Closed" badge.
//
// Fix 2 — httpStatus from Tier 2:
//   `httpStatus` can now come from either tier: Tier 1's direct ping, or (when
//   that returned 0 / no Tier 1 ran) Tier 2's Tavily page fetch. This lets real
//   404/403/5xx codes surface for T2-only and "both" runs, not just T1 runs.
//
// The Vercel API merges this into the existing JSON and commits — triggering an
// auto-redeploy (1-2 min).

export async function writeSchemeResults(results) {
  if (!Array.isArray(results) || results.length === 0) return { success: true, updated: 0 };

  const now     = new Date().toISOString();
  const payload = {};

  for (const r of results) {
    const id = r.scheme?.id;
    if (!id) continue;

    const entry = { lastVerified: now };

    // httpStatus — only a real code is worth storing (0 = "unknown").
    if (r.httpStatus > 0) entry.httpStatus = r.httpStatus;

    // linkAlive — only a definitive answer is written. An inconclusive check
    // (timeout, geo-blocked India-only domain, our own API hiccup) must not
    // overwrite what an earlier, successful check found.
    if (r.linkAlive === true || r.linkAlive === false) entry.linkAlive = r.linkAlive;

    // Tier 2 facts — only when the AI step actually succeeded. A failed or
    // rate-limited call used to write lastDate:null, which the server treats
    // as "deadline removed", wiping good deadlines on every bad run.
    if (r.tier === 2 && !r.aiSkipped && !r.aiError && r.confidence != null) {
      entry.confidence = r.confidence;
      if (r.isActive != null) entry.isActive = r.isActive;
      // Page clearly read but it no longer says "closed" → clear an old
      // isActive:false, or the scheme shows "Closed" forever (e.g. after it
      // reopens with a new deadline).
      else if (r.confidence >= 0.5) entry.isActive = null;
      if (r.lastDate) entry.lastDate = r.lastDate;
      else if (r.confidence >= 0.5) entry.lastDate = null; // page clearly read, no deadline any more
    }

    // Nothing learned at all (e.g. Tier 2 rate-limited, Tier 1 skipped)?
    // Don't stamp lastVerified on a scheme we didn't actually verify.
    if (Object.keys(entry).length === 1 && (r.aiError || r.aiSkipped) && r.linkAlive === undefined) continue;

    payload[id] = entry;
  }

  if (Object.keys(payload).length === 0) return { success: true, updated: 0 };
  return adminJson("/api/update-schemes-meta", { results: payload });  // { success, updated }
}


// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Full DB coverage stats — used by SchemeVerifier.jsx to show why only N schemes
// are in the verification queue vs the total DB size.
//
// Returns:
//   total          — every scheme in SCHEME_DB (national + all states)
//   verifiable     — has applyType:"online" AND a valid URL → what the verifier pings
//   onlineNoUrl    — applyType:"online" but apply.en is plain-text (e.g. "Nearest CSC")
//   offline        — applyType:"offline" (bank/CSC/in-person — nothing to ping)
//   otherType      — any other applyType value
//   national       — scope:"national" schemes
//   state          — scope:"state" schemes
//   nationalOnline — national schemes that are verifiable
//   stateOnline    — state schemes that are verifiable
//   byState        — { "Assam": { total, online }, ... } sorted by total desc

export function getDBStats() {
  const total      = SCHEME_DB.length;
  const online     = SCHEME_DB.filter(s => s.applyType === "online");
  const verifiable = online.filter(s => !!normalizeUrl(s.apply?.en));

  const national       = SCHEME_DB.filter(s => s.scope === "national");
  const stateSchemes   = SCHEME_DB.filter(s => s.scope === "state");
  const nationalOnline = national.filter(s => s.applyType === "online" && !!normalizeUrl(s.apply?.en));
  const stateOnline    = stateSchemes.filter(s => s.applyType === "online" && !!normalizeUrl(s.apply?.en));

  // Per-state breakdown
  const byStateMap = {};
  stateSchemes.forEach(s => {
    if (!s.state) return;
    if (!byStateMap[s.state]) byStateMap[s.state] = { total: 0, online: 0 };
    byStateMap[s.state].total++;
    if (s.applyType === "online" && !!normalizeUrl(s.apply?.en)) {
      byStateMap[s.state].online++;
    }
  });
  const byState = Object.entries(byStateMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, counts]) => ({ name, ...counts }));

  return {
    total,
    verifiable:  verifiable.length,
    online:      online.length,
    onlineNoUrl: online.length - verifiable.length,
    offline:     SCHEME_DB.filter(s => s.applyType === "offline").length,
    otherType:   SCHEME_DB.filter(s => !s.applyType).length,
    national:    national.length,
    state:       stateSchemes.length,
    nationalOnline: nationalOnline.length,
    stateOnline:    stateOnline.length,
    byState,
  };
}


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
      .filter(s => s.scope === "state" && s.state && s.applyType === "online" && !!normalizeUrl(s.apply?.en))
      .map(s => s.state)
  );
  return [...stateSet].sort();
}


// ─── URL FIX PERSISTENCE ──────────────────────────────────────────────────────
// Saves discovered URL candidates for dead-link schemes to Firestore so the
// "Find New URL" results survive tab switches, page refreshes, and session closes.
//
// Doc path: adminMeta/urlFixes
// Shape:    { [schemeId]: { candidates, status, newUrl?, oldUrl?, file?,
//                            commitSha?, commitUrl?, discoveredAt?,
//                            queuedAt?, committedAt? } }
//
// status lifecycle:
//   "pending"   — candidates found, not yet queued      (saveUrlFix)
//   "queued"    — selected for the next batch commit    (queueUrlFix)
//   "committed" — patched + committed to GitHub         (markUrlFixCommitted)
//
// "Apply All Fixes" (commitQueuedFixes) sends every "queued" entry to
// /api/batch-patch-urls in ONE request, which groups them by file and
// commits each file once — turning N fixes into ~1-2 Vercel deploys.
//
// Covered by existing Firestore rule:
//   match /adminMeta/{docId} { allow read, write: if isAdmin(); }
// ─────────────────────────────────────────────────────────────────────────────

const URL_FIXES_PATH = ["adminMeta", "urlFixes"];

/**
 * Save discovered URL candidates for a dead-link scheme.
 * Called automatically after /api/find-new-url returns results.
 * Uses merge:true so other schemes' entries are never overwritten.
 */
export async function saveUrlFix(schemeId, candidates) {
  try {
    await setDoc(
      doc(db, ...URL_FIXES_PATH),
      {
        [schemeId]: {
          candidates,
          discoveredAt: new Date().toISOString(),
          status: "pending",
        },
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[saveUrlFix] Firestore write failed:", err.message);
  }
}

/**
 * Mark a fix as committed after a commit succeeds (single or batch).
 * Stores the chosen URL, commit SHA, and GitHub commit link for the audit trail.
 */
export async function markUrlFixCommitted(schemeId, newUrl, commitSha, commitUrl = null) {
  try {
    await setDoc(
      doc(db, ...URL_FIXES_PATH),
      {
        [schemeId]: {
          status:      "committed",
          newUrl,
          commitSha,
          commitUrl,
          committedAt: new Date().toISOString(),
          // A new commit invalidates any previous re-check result.
          verified:          deleteField(),
          verifiedAt:        deleteField(),
          lastCheckedStatus: deleteField(),
        },
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[markUrlFixCommitted] Firestore write failed:", err.message);
  }
}

/**
 * Re-ping a fix's new URL directly and record whether it's actually live —
 * a real check, not just trust in the GitHub commit having succeeded.
 *
 * THE BUG THIS FIXES: previously, once a fix hit status:"committed", the
 * UI showed a permanent "✓ Committed — Vercel deploying (~1-2 min)" badge
 * with zero follow-up — no timer, no expiry, no actual re-check. Reloading
 * the page also re-read the OLD bundled schemes-meta.json (a static import,
 * only refreshed by a full redeploy), so the scheme kept reappearing in
 * "Known Dead Links" forever even after a successful fix. Two disconnected,
 * never-reconciled "truths" shown at once, indefinitely.
 *
 * This writes `verified` + `verifiedAt` + `lastCheckedStatus` onto the same
 * urlFixes/<schemeId> doc so the UI can show a real outcome — "Verified
 * live" or "Still unreachable" — instead of a static message that never
 * changes. Safe to call multiple times (e.g. a manual "Re-check" button).
 */
export async function verifyCommittedFix(schemeId, url) {
  if (!schemeId || !url) return { alive: null, httpStatus: 0 };
  // Same rules as a full scan (403 = live but bot-blocking, timeouts and
  // India-only domains = can't tell) — the old version treated all of those
  // as "Still unreachable".
  const ping = await pingUrl(url).catch(() => ({ alive: null, httpStatus: 0 }));
  if (ping.alive === null) return { alive: null, httpStatus: ping.httpStatus ?? 0, note: ping.note ?? ping.error ?? null };

  try {
    await setDoc(
      doc(db, ...URL_FIXES_PATH),
      {
        [schemeId]: {
          verified:          ping.alive,
          verifiedAt:        new Date().toISOString(),
          lastCheckedStatus: ping.httpStatus ?? 0,
        },
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[verifyCommittedFix] Firestore write failed:", err.message);
  }
  return { alive: ping.alive, httpStatus: ping.httpStatus ?? 0 };
}

/**
 * Add a confirmed replacement URL to the local "Apply All Fixes" queue.
 * Persists status:"queued" plus the exact payload /api/batch-patch-urls needs
 * (oldUrl, newUrl, file) — so the queue survives tab switches and page
 * refreshes until the batch commit runs.
 */
export async function queueUrlFix(schemeId, { newUrl, oldUrl, file, candidates }) {
  try {
    await setDoc(
      doc(db, ...URL_FIXES_PATH),
      {
        [schemeId]: {
          status: "queued",
          newUrl,
          oldUrl,
          file,
          candidates: candidates ?? [],
          queuedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[queueUrlFix] Firestore write failed:", err.message);
  }
}

/**
 * Move a queued fix back to "pending" — keeps the discovered candidates but
 * removes it from the next "Apply All Fixes" batch. Reuses saveUrlFix's shape.
 */
export async function unqueueUrlFix(schemeId, candidates) {
  return saveUrlFix(schemeId, candidates ?? []);
}

/**
 * Permanently remove one or more scheme IDs from the urlFixes document.
 * Use this to clear stale / corrupted queue entries that can never apply
 * successfully (e.g. oldUrl has stacked https:// prefixes from a prior bug).
 *
 * After calling this, reload urlFixes (loadUrlFixes()) to sync the UI.
 *
 * @param {string[]} schemeIds  — array of scheme IDs to delete
 */
export async function deleteUrlFixes(schemeIds) {
  if (!Array.isArray(schemeIds) || schemeIds.length === 0) return;
  try {
    const fields = {};
    schemeIds.forEach(id => { fields[id] = deleteField(); });
    await updateDoc(doc(db, ...URL_FIXES_PATH), fields);
  } catch (err) {
    console.warn("[deleteUrlFixes] Firestore write failed:", err.message);
    throw err; // re-throw so the UI can show the error
  }
}

/**
 * Send every queued fix to /api/batch-patch-urls in ONE request.
 * The endpoint groups patches by file and commits each file once — turning
 * N queued fixes into roughly 1-2 Vercel deploys instead of N.
 *
 * Returns { success, results: [{id, file, success, sha?, commitUrl?, error?}],
 * commits: [{file, sha, commitUrl, count}] }.
 *
 * Caller (SchemeVerifier.jsx) is responsible for calling markUrlFixCommitted()
 * for each successful result.
 */
export async function commitQueuedFixes(queue) {
  if (!Array.isArray(queue) || queue.length === 0) {
    return { success: true, results: [], commits: [] };
  }

  const data = await adminJson("/api/batch-patch-urls", { patches: queue });
  if (data.error) throw new Error(data.error);
  return data;
}

/**
 * Load the full urlFixes map on SchemeVerifier mount.
 * Returns { [schemeId]: { candidates, status, ... } } or {} on failure.
 */
export async function loadUrlFixes() {
  try {
    const snap = await getDoc(doc(db, ...URL_FIXES_PATH));
    return snap.exists() ? snap.data() : {};
  } catch (err) {
    console.warn("[loadUrlFixes] Firestore read failed:", err.message);
    return {};
  }
}


// ─── KNOWN DEAD LINKS ──────────────────────────────────────────────────────────
// Persistent (no-rescan-needed) list of every scheme whose LAST verification
// run marked the link dead — read straight from the bundled schemes-meta.json
// overlay (written by writeSchemeResults → /api/update-schemes-meta → commit
// → Vercel redeploy).
//
// This is what makes "Find New URL" / "Queue Fix" available for a dead scheme
// at ANY time — even after the tab that found it was closed, with no
// verification run, no Firestore read, and no network call. The "Known Dead
// Links" panel in SchemeVerifier.jsx renders this list directly on mount.
//
// Returns result-shaped objects compatible with ResultRow / getFixSuggestion:
//   { scheme, alive: false, httpStatus, error: null, lastDate, isActive,
//     confidence, lastVerified }
//
// Sorted: national schemes first, then alphabetically by state, then by name —
// so results from the same scan ("scan a state or central schemes") cluster
// together.
export function getKnownDeadLinks() {
  const out = [];

  for (const scheme of SCHEME_DB) {
    const meta = schemesMeta[scheme.id];
    if (!meta || meta.linkAlive !== false) continue;

    // Skip India-bound domains — Vercel's US IPs can't reach these, so any
    // linkAlive:false written for them is a false positive. Filter immediately
    // without needing a re-scan or schemes-meta.json redeploy cycle.
    const url = normalizeUrl(scheme.apply?.en);
    if (url && isIndiaBoundDomain(url)) continue;

    out.push({
      scheme,
      alive:        false,
      httpStatus:   meta.httpStatus ?? 0,
      error:        null,
      lastDate:     meta.lastDate ?? scheme.lastDate ?? null,
      isActive:     meta.isActive ?? null,
      confidence:   meta.confidence ?? 0,
      lastVerified: meta.lastVerified ?? null,
    });
  }

  out.sort((a, b) => {
    const sa = a.scheme.scope === "national" ? "" : (a.scheme.state ?? "");
    const sb = b.scheme.scope === "national" ? "" : (b.scheme.state ?? "");
    if (sa !== sb) return sa.localeCompare(sb);
    return (a.scheme.name?.en ?? "").localeCompare(b.scheme.name?.en ?? "");
  });

  return out;
}

