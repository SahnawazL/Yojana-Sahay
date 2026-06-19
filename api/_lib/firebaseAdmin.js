// api/_lib/firebaseAdmin.js — Yojana Sahay · Shared Firebase Admin SDK
// ─────────────────────────────────────────────────────────────────────────────
// Server-side Firestore access for Vercel functions. Uses a service account
// (NOT the client SDK in src/firebase.js) — Admin SDK writes bypass Firestore
// security rules entirely, so this works regardless of your rules.
//
// REQUIRED Vercel env vars (Settings → Environment Variables):
//   FIREBASE_PROJECT_ID    — e.g. "yojanasetu-xxxxx"
//   FIREBASE_CLIENT_EMAIL  — e.g. "firebase-adminsdk-xxxxx@yojanasetu-xxxxx.iam.gserviceaccount.com"
//   FIREBASE_PRIVATE_KEY   — the full private key, including BEGIN/END lines
//
// HOW TO GET THESE:
//   Firebase Console → ⚙️ Project Settings → Service Accounts tab
//   → "Generate new private key" → downloads a JSON file with all 3 values.
//
// NOTE on FIREBASE_PRIVATE_KEY: when you paste it into Vercel, the literal
// "\n" characters in the JSON become real newlines once Vercel stores it —
// the .replace(/\\n/g, "\n") below handles both cases safely either way.
//
// Used by: verify-scheme.js, chat.js, find-new-url.js, ai-insights.js
//
// Exports:
//   markAiActive(field)     — legacy: just write a lastActive timestamp
//   recordAiCall(options)   — full stats: key index, 429s, web searches, daily reset
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

let cachedDb = null;

function getAdminDb() {
  if (cachedDb) return cachedDb;

  if (getApps().length === 0) {
    const projectId   = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      console.warn(
        "[firebaseAdmin] Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / " +
        "FIREBASE_PRIVATE_KEY env vars — AI presence tracking will silently no-op."
      );
      return null;
    }

    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }

  cachedDb = getFirestore();
  return cachedDb;
}

// IST date string ("2026-06-20") — used for daily counter resets
function getISTDateStr() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

// ── Mark an AI agent as active right now (legacy, kept for backward compat) ──
// field: "groqLastActive" | "tavilyLastActive"
// Prefer recordAiCall() for new routes — it does everything markAiActive does
// plus per-key stats. markAiActive() is kept so older routes keep working
// without any changes.
export async function markAiActive(field) {
  try {
    const db = getAdminDb();
    if (!db) return;
    await db.doc("adminMeta/aiStatus").set(
      { [field]: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.warn(`[markAiActive] failed to write "${field}":`, e.message);
  }
}

// ── Record a completed AI API call with full telemetry ───────────────────────
//
// options:
//   service          "groq" | "tavily"
//   keyIdx           0-based index of the Groq key that ultimately succeeded.
//                    Pass -1 if ALL keys were exhausted (total failure).
//   count429         How many keys were 429'd before the successful key.
//                    e.g. keys[0] 429 → keys[1] succeeds → count429 = 1
//   triggeredSearch  true when this Groq call was the SECOND call in a
//                    web-search flow (i.e. Tavily was invoked before this).
//                    Increments groqWebSearchesToday.
//
// Writes atomically (Firestore transaction) so concurrent calls never
// corrupt the counters. Day-resets at midnight IST automatically.
//
// Always swallows errors — telemetry must NEVER break the real feature.
//
// Firestore fields written to adminMeta/aiStatus:
//   groqLastActive          Timestamp  — updated on every Groq call
//   groqActiveKeyIdx        number     — index (0-based) of the currently active key
//   groqCallsToday          number     — resets at midnight IST
//   groqCallsDate           string     — IST date string, e.g. "2026-06-20"
//   groq429Today            number     — total 429s today (across all keys)
//   groq429Date             string     — IST date for 429 reset
//   groq429KeysToday        number[]   — which key indices (0-based) got 429'd today
//   groq429KeysDate         string     — IST date for key-429 array reset
//   groqLast429At           Timestamp  — when the last 429 happened
//   groqWebSearchesToday    number     — Tavily-triggered Groq calls today
//   groqWebSearchesDate     string     — IST date for web-search reset
//   tavilyLastActive        Timestamp  — updated on every Tavily call
//   tavilyCallsToday        number     — resets at midnight IST
//   tavilyCallsDate         string     — IST date for Tavily reset
export async function recordAiCall({
  service         = "groq",
  keyIdx          = 0,
  count429        = 0,
  triggeredSearch = false,
} = {}) {
  try {
    const db = getAdminDb();
    if (!db) return;

    const today = getISTDateStr();
    const ref   = db.doc("adminMeta/aiStatus");

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const d    = snap.exists ? snap.data() : {};
      const upd  = {};

      // ── GROQ ──────────────────────────────────────────────────────────────
      if (service === "groq") {
        upd.groqLastActive = FieldValue.serverTimestamp();

        // Active key — only update if a key actually succeeded
        if (keyIdx >= 0) upd.groqActiveKeyIdx = keyIdx;

        // Calls today (day-reset if IST date rolled over)
        if (d.groqCallsDate === today) {
          upd.groqCallsToday = (d.groqCallsToday || 0) + 1;
        } else {
          upd.groqCallsDate  = today;
          upd.groqCallsToday = 1;
        }

        // 429s today
        if (count429 > 0) {
          upd.groqLast429At = FieldValue.serverTimestamp();

          // Which key INDICES got 429'd: keys 0 … count429-1 all failed
          const freshKeys = Array.from({ length: count429 }, (_, i) => i);

          if (d.groq429Date === today) {
            upd.groq429Today = (d.groq429Today || 0) + count429;
            // Merge into existing array, deduplicating
            const prev   = Array.isArray(d.groq429KeysToday) ? d.groq429KeysToday : [];
            upd.groq429KeysToday = [...new Set([...prev, ...freshKeys])];
            upd.groq429KeysDate  = today; // keep in sync
          } else {
            upd.groq429Date      = today;
            upd.groq429Today     = count429;
            upd.groq429KeysDate  = today;
            upd.groq429KeysToday = freshKeys;
          }
        }

        // Web searches today
        if (triggeredSearch) {
          if (d.groqWebSearchesDate === today) {
            upd.groqWebSearchesToday = (d.groqWebSearchesToday || 0) + 1;
          } else {
            upd.groqWebSearchesDate  = today;
            upd.groqWebSearchesToday = 1;
          }
        }
      }

      // ── TAVILY ────────────────────────────────────────────────────────────
      if (service === "tavily") {
        upd.tavilyLastActive = FieldValue.serverTimestamp();

        if (d.tavilyCallsDate === today) {
          upd.tavilyCallsToday = (d.tavilyCallsToday || 0) + 1;
        } else {
          upd.tavilyCallsDate  = today;
          upd.tavilyCallsToday = 1;
        }
      }

      tx.set(ref, upd, { merge: true });
    });
  } catch (e) {
    console.warn(`[recordAiCall] failed (${service}):`, e.message);
  }
}
