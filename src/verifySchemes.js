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
  serverTimestamp,
} from "firebase/firestore";
import schemesMeta from "./schemes-meta.json";


// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BATCH_SIZE       = 10;
const PING_TIMEOUT_MS  = 12000;  // 12 s — Vercel function makes direct request, gov sites can be slow
const CHECKPOINT_PATH  = ["adminMeta", "verifyCheckpoint"];  // Firestore path
const THIRTY_DAYS_MS   = 30 * 24 * 60 * 60 * 1000;

// Domains known to block direct pings from Vercel's server IPs.
// Pinging these always returns a timeout or connection error, NOT because
// the site is dead — but because NIC/government infrastructure firewalls
// non-Indian server IPs. Short-circuiting these to alive:null ("No Response")
// prevents valid scheme URLs from being falsely labelled "Dead" in the admin UI.
// Tavily (Tier 2) can still reach these fine via its own crawler.
const INDIA_ONLY_DOMAINS = [
  "nic.in",       // National Informatics Centre — all subdomains (e.g. services.india.gov.in on nic infra)
  "india.gov.in", // National Portal of India (NIC-hosted)
];


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

async function pingUrl(url, signal = null) {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return { httpStatus: 0, alive: false, error: "invalid URL" };
  }

  // Fix A — India-bound domains: NIC and similar government infrastructure
  // blocks direct pings from Vercel's US-based IPs. Rather than returning
  // alive:false ("Dead"), return alive:null ("No Response") so the admin UI
  // correctly shows these as unchecked, not broken. Tier 2 (Tavily) handles
  // them fine and will fill in real status when it runs.
  if (isIndiaBoundDomain(normalized)) {
    return {
      httpStatus: 0,
      alive:      null,
      error:      "India-bound domain — Vercel IP blocked by NIC infrastructure (skipped)",
    };
  }

  try {
    const res = await fetch("/api/ping-url", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: normalized }),
      signal,                                        // ← abort immediately on Stop/Pause
    });

    if (!res.ok) {
      return { httpStatus: 0, alive: false, error: `ping-url API error ${res.status}` };
    }

    const pingResult = await res.json(); // { httpStatus, alive, error }

    // Fix B — 403 reclassify: a 403 means the server IS reachable and responded.
    // It's only rejecting Vercel's bot/IP — the URL itself is live. Marking it
    // "Dead" (alive:false) is wrong. Flip to alive:true so the admin sees
    // "Active" with an explanatory note, not a false "Dead" badge.
    if (pingResult.httpStatus === 403 && pingResult.alive === false) {
      return {
        ...pingResult,
        alive: true,
        error: "403 — server is live but blocks Vercel bot requests",
      };
    }

    return pingResult;

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

async function extractDateViaAI(scheme, signal = null) {
  try {
    const url = normalizeUrl(scheme.apply?.en);
    if (!url) return { lastDate: null, isActive: null, confidence: 0, httpStatus: 0, error: "invalid URL" };
    const res = await fetch("/api/verify-scheme", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal,                                        // ← abort immediately on Stop/Pause
      body: JSON.stringify({
        id:    scheme.id,
        url,
        name:  scheme.name.en,
        state: scheme.state  ?? "national",
        scope: scheme.scope,
      }),
    });

    if (!res.ok) {
      return { lastDate: null, isActive: null, confidence: 0, httpStatus: 0, error: `API ${res.status}` };
    }

    const data = await res.json();
    return {
      lastDate:   data.lastDate   ?? null,
      isActive:   data.isActive   ?? null,
      confidence: data.confidence ?? 0,
      // Fix 2: HTTP status of the scheme's page as seen by Tier 2's fetch
      // (via Tavily). 0 = unknown/timeout, 200 = reachable, 4xx/5xx = real
      // error codes that Tavily's crawler surfaced for the target page.
      httpStatus: data.httpStatus ?? 0,
      error:      null,
    };

  } catch (err) {
    return { lastDate: null, isActive: null, confidence: 0, httpStatus: 0, error: err.message };
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
//                      "both" → Tier 1 AND Tier 2 for every scheme (Fix 1)
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
//     alive,          — true | false | null  (display-only; for live summary UI)
//     linkAlive,      — true | false | null  (Tier 1 only — pure URL-liveness, persisted)
//     httpStatus,     — HTTP status code (0 if timeout/error)
//     lastDate,       — "YYYY-MM-DD" or null (Tier 2 only)
//     isActive,       — boolean or null     (Tier 2 only — "applications open?")
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
  // Fix 1: previously "both" only ran AI on priority schemes (had a deadline,
  // or never verified) to save Groq credits — but that left ~70-80% of
  // schemes without lastDate/confidence after a "both" run. Now every scheme
  // with a real URL gets a Groq call in both "2" and "both" modes. Slower
  // (every scheme = a Groq call), but the JSON is genuinely complete after
  // one full run.
  const needsAI = (scheme) => tier !== 1;

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
      linkAlive:  null,  // Fix 3: pure Tier-1 URL-liveness, kept separate from
                          // Tier-2's "is the scheme accepting applications" verdict
      httpStatus: null,
      lastDate:   null,
      isActive:   null,
      confidence: null,
      error:      null,
    };

    // ── Tier 1: Dead link ping ─────────────────────────────────────────────────
    if (tier !== 2) {
      const ping      = await pingUrl(scheme.apply?.en, signal);
      if (signal?.aborted) break;   // ← stop immediately; don't push half-baked result
      result.alive      = ping.alive;
      result.linkAlive  = ping.alive;
      result.httpStatus = ping.httpStatus;
      result.error      = ping.error;
    }

    // ── Tier 2: AI date extraction ────────────────────────────────────────────
    if (needsAI(scheme)) {
      result.tier = 2;
      const ai = await extractDateViaAI(scheme, signal);
      if (signal?.aborted) break;   // ← same guard for AI call
      result.lastDate   = ai.lastDate;
      result.isActive   = ai.isActive;
      result.confidence = ai.confidence;

      // Fix 2: if Tier 1 didn't run (T2-only) or its ping returned 0
      // (timeout/blocked/no-response — ambiguous), but Tier 2's page fetch
      // via Tavily got a real status code, use that. Tavily's crawler often
      // reaches .gov.in pages that direct pings/proxies can't, so a 404/403/5xx
      // here is more informative than a bare 0.
      if ((result.httpStatus === null || result.httpStatus === 0) && ai.httpStatus) {
        result.httpStatus = ai.httpStatus;
      }

      // Sync alive from T2 isActive so buildSummary shows correct Active/Dead/NoResp
      // in T2-only runs where Tier 1 ping is skipped (alive would otherwise stay null).
      // Display-only — does NOT affect the persisted `linkAlive` field (Fix 3),
      // which stays null whenever Tier 1 didn't actually run.
      if (result.alive === null) {
        result.alive = ai.isActive; // true / false / null (null = page unreachable)
      }

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
  if (!Array.isArray(results) || results.length === 0) return;

  const now     = new Date().toISOString();
  const payload = {};

  for (const r of results) {
    const id = r.scheme?.id;
    if (!id) continue;

    const entry = { lastVerified: now };

    // httpStatus — written whenever we have one, whether from Tier 1's ping or
    // (Fix 2) Tier 2's page fetch filling in a real 404/403/5xx that Tier 1's
    // ping reported as 0/ambiguous.
    if (r.httpStatus !== null) {
      entry.httpStatus = r.httpStatus;
    }

    // linkAlive — Tier 1's pure URL-liveness (Fix 3: separate from isActive).
    // Only meaningful if Tier 1 actually ran for this scheme.
    if (r.linkAlive !== null) {
      entry.linkAlive = r.linkAlive;
    }

    // Tier 2 ran → AI-extracted deadline + application status.
    // lastDate is written even when null so a confirmed "no deadline on page"
    // result can clear a stale date (Fix 4). isActive/confidence are only
    // written when the AI gave a real answer, so an "unclear" read doesn't
    // wipe out a previously good value.
    if (r.tier === 2) {
      entry.lastDate = r.lastDate; // "YYYY-MM-DD" or null (explicit — see Fix 4)
      if (r.isActive   != null) entry.isActive   = r.isActive;
      if (r.confidence != null) entry.confidence = r.confidence;
    }

    payload[id] = entry;
  }

  const res = await fetch("/api/update-schemes-meta", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ results: payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return await res.json();  // { success: true, updated: N }
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
      .filter(s => s.scope === "state" && s.state && s.applyType === "online" && s.apply?.en)
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
        },
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[markUrlFixCommitted] Firestore write failed:", err.message);
  }
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

  const res = await fetch("/api/batch-patch-urls", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ patches: queue }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
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

