/**
 * POST /api/log-checker-run
 *
 * Writes ALL "appStats/usage" analytics — eligibility-checker runs, search
 * tracking, and state-filter tracking — for BOTH guests and logged-in users.
 * The write type is selected via the `type` field in the POST body:
 *   type: "checker" (default, backward-compatible) | "search" | "state"
 *
 * WHY THIS EXISTS:
 * The old approach had the browser write directly to Firestore. For
 * logged-in users that's simple (they already have a real auth session),
 * but for guests it required silently signing them into an invisible
 * second Firebase Auth session just so Firestore's security rules would
 * accept the write. That extra hop turned out to be fragile in practice —
 * permission-denied errors even with valid anonymous sessions, hard to
 * debug, dependent on Firebase Console settings.
 *
 * This endpoint sidesteps all of that: it runs on the server using
 * firebase-admin, which always has full access and is never subject to
 * client security rules. The browser just POSTs the event details here;
 * no login of any kind is required on the client side for this to work.
 *
 * WHY ONE FILE, NOT THREE:
 * Vercel's free tier caps a project at 12 serverless functions. This file
 * was already the 12th. Rather than add log-search.js / log-state.js and
 * blow past the limit, checker/search/state all share this single handler,
 * dispatched by the `type` field.
 *
 * REQUIRED SETUP: none beyond what /api/stats.js already needs — this
 * reuses the same FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL /
 * FIREBASE_PRIVATE_KEY environment variables already configured in Vercel.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin credentials in environment variables");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

// Only these fields are ever trusted from the client for a checker run —
// anything else in the request body is ignored, so a malicious guest can't
// inject arbitrary fields into appStats/usage through this endpoint.
const ALLOWED_RUN_FIELDS = [
  "uid", "matchedCount", "state", "who", "income", "age", "area", "gender", "ration",
];

// appStats/usage is ONE Firestore document and every event used to be
// arrayUnion()-ed onto it forever. Firestore caps a document at 1 MiB, so
// after a few thousand events every write — including the checkerTotal
// counter the home screen shows — would start failing permanently. The
// detail arrays now keep only the most recent entries (totals are separate
// counters and keep counting).
const MAX_ENTRIES = { checkerRuns: 1500, schemeSearches: 1500, stateSelections: 1000 };

async function appendCapped(db, ref, arrayField, record, extraUpdates) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const prev = Array.isArray(data[arrayField]) ? data[arrayField] : [];
    const next = prev.concat([record]).slice(-MAX_ENTRIES[arrayField]);
    tx.set(ref, { [arrayField]: next, ...extraUpdates }, { merge: true });
    return data;
  });
}

function safeUid(uid) {
  return typeof uid === "string" && uid.length > 0 && uid.length <= 100 ? uid : "guest_unknown";
}

// A dynamic Firestore field name (stateCount_<state>) is built from client
// input, so it's whitelisted down to letters/digits/underscore only — this
// stops a guest from smuggling a "." or other path-altering character into
// appStats/usage's top-level field list via the state name.
function safeStateKey(state) {
  if (typeof state !== "string") return null;
  const cleaned = state.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "");
  if (!cleaned || cleaned.length > 40) return null;
  return cleaned;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    // Unrecognized/missing type falls back to "checker" — this is what keeps
    // the original client call (which never sent a `type` field) working
    // completely unchanged.
    const type = ["checker", "search", "state"].includes(body.type) ? body.type : "checker";

    const app = getAdminApp();
    const db = getFirestore(app);
    const ref = db.collection("appStats").doc("usage");

    // ── Eligibility checker run ──────────────────────────────────────────
    if (type === "checker") {
      const runRecord = {};
      for (const key of ALLOWED_RUN_FIELDS) {
        runRecord[key] = key in body ? body[key] : null;
      }
      for (const key of ALLOWED_RUN_FIELDS) {
        const v = runRecord[key];
        if (v != null && typeof v !== "number") runRecord[key] = String(v).slice(0, 60);
      }
      runRecord.uid = safeUid(runRecord.uid);
      runRecord.matchedCount = Number.isFinite(Number(runRecord.matchedCount)) ? Math.max(0, Math.min(5000, Number(runRecord.matchedCount))) : 0;
      runRecord.ts = new Date().toISOString();

      const before = await appendCapped(db, ref, "checkerRuns", runRecord, {
        checkerTotal: FieldValue.increment(1),
        lastRun: runRecord.ts,
      });
      const checkerTotal = typeof before.checkerTotal === "number" ? before.checkerTotal + 1 : null;

      res.status(200).json({ ok: true, checkerTotal });
      return;
    }

    // ── Search query tracking ────────────────────────────────────────────
    if (type === "search") {
      const q = typeof body.q === "string" ? body.q.trim().slice(0, 200) : "";
      if (!q) {
        res.status(200).json({ ok: true, skipped: true });
        return;
      }
      const record = { q, uid: safeUid(body.uid), ts: new Date().toISOString() };

      await appendCapped(db, ref, "schemeSearches", record, { searchTotal: FieldValue.increment(1) });

      res.status(200).json({ ok: true });
      return;
    }

    // ── State-filter selection tracking ──────────────────────────────────
    if (type === "state") {
      const stateKey = safeStateKey(body.state);
      if (!stateKey) {
        res.status(200).json({ ok: true, skipped: true });
        return;
      }
      const record = { state: String(body.state).slice(0, 60), uid: safeUid(body.uid), ts: new Date().toISOString() };

      await appendCapped(db, ref, "stateSelections", record, { [`stateCount_${stateKey}`]: FieldValue.increment(1) });

      res.status(200).json({ ok: true });
      return;
    }
  } catch (err) {
    console.error("[/api/log-checker-run] failed:", err?.message || err);
    res.status(500).json({ ok: false, error: "log failed" });
  }
}
