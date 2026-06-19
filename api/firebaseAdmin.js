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
// to call markAiActive() after a successful Groq/Tavily call, so the
// Agents tab in AdminDashboard can show live AI presence.
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

// ── Mark an AI agent as active right now ─────────────────────────────────────
// field: "groqLastActive" | "tavilyLastActive"
// Always swallow errors — AI presence tracking must NEVER break the real
// feature (chat reply, scheme verification, etc.) if Firestore hiccups.
export async function markAiActive(field) {
  try {
    const db = getAdminDb();
    if (!db) return; // env vars not configured yet — no-op, don't throw

    await db.doc("adminMeta/aiStatus").set(
      { [field]: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.warn(`[markAiActive] failed to write "${field}":`, e.message);
  }
}
