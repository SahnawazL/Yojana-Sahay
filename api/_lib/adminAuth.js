// api/_lib/adminAuth.js — Yojana Sahay · Shared admin gate for API routes
// ─────────────────────────────────────────────────────────────────────────────
// Every SchemeVerifier endpoint (ping-url, verify-scheme, find-new-url,
// update-schemes-meta, batch-patch-urls) used to be completely open: anyone
// who found the URL could burn the Groq/Tavily/Serper quota or — worse —
// commit arbitrary edits to the GitHub repo. They are now admin-only.
//
// Accepted credentials (Authorization: Bearer <token>):
//   1. A Firebase ID token for a user whose users/{uid} doc has
//      isAdmin === true or role === "admin"  (the admin dashboard sends this
//      automatically via src/adminFetch.js)
//   2. CRON_SECRET — for scripts / manual curl testing
//
// Usage inside a handler:
//   const auth = await requireAdmin(req, res);
//   if (!auth) return;               // response already sent (401/403/500)
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminAuth, getAdminDb } from "./firebaseAdmin.js";

export async function verifyAdminRequest(req) {
  const header = req.headers?.authorization ?? req.headers?.Authorization ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Missing Authorization header — sign in to the admin dashboard again." };

  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret && token === cronSecret) return { ok: true, uid: "cron", email: "cron" };

  const db = getAdminDb();
  if (!db) {
    return { ok: false, status: 500, error: "Server misconfigured: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are not set." };
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch (err) {
    console.warn("[adminAuth] token verification failed:", err.code ?? err.message);
    return { ok: false, status: 401, error: "Invalid or expired session — refresh the admin dashboard." };
  }

  try {
    const snap = await db.collection("users").doc(decoded.uid).get();
    const data = snap.exists ? (snap.data() ?? {}) : {};
    if (data.isAdmin === true || data.role === "admin") {
      return { ok: true, uid: decoded.uid, email: decoded.email ?? decoded.uid };
    }
    return { ok: false, status: 403, error: "Forbidden — admin access required." };
  } catch (err) {
    console.error("[adminAuth] role lookup failed:", err.message);
    return { ok: false, status: 500, error: "Role verification failed." };
  }
}

export async function requireAdmin(req, res) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return null;
  }
  return auth;
}
