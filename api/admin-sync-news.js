/**
 * /api/admin-sync-news.js  —  Yojana Sahay
 *
 * Secure proxy: lets AdminDashboard trigger a news sync without exposing
 * CRON_SECRET to the browser bundle.
 *
 * Flow:
 *   1. Client sends Firebase ID token as  Authorization: Bearer <idToken>
 *   2. Verifies token via Firebase Admin Auth
 *   3. Checks caller has  role === "admin"  in Firestore  users/<uid>
 *   4. Calls  /api/refresh-news?force=true  with server-side CRON_SECRET
 *   5. Returns the response JSON as-is
 *
 * No new env vars needed — reuses FIREBASE_* + CRON_SECRET already set.
 */

import refreshNewsHandler from "./refresh-news.js";
import { getAdminDb, getAdminAuth } from "./_lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // ── 1. Extract Firebase ID token ─────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const idToken    = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!idToken) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // ── 2. Verify token ───────────────────────────────────────────────────────
  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(idToken);
  } catch (err) {
    console.error("[admin-sync-news] Token verification failed:", err.code ?? err.message);
    return res.status(401).json({ error: "Invalid or expired auth token" });
  }

  // ── 3. Check admin role in Firestore ─────────────────────────────────────
  try {
    const db       = getAdminDb();
    const userSnap = await db.collection("users").doc(decodedToken.uid).get();

    if (!userSnap.exists) {
      return res.status(403).json({ error: "User not found" });
    }

    const data    = userSnap.data() ?? {};
    const isAdmin = data.role === "admin" || data.isAdmin === true;

    if (!isAdmin) {
      console.warn("[admin-sync-news] Non-admin attempted sync:", decodedToken.email);
      return res.status(403).json({ error: "Forbidden — admin access required" });
    }
  } catch (err) {
    console.error("[admin-sync-news] Firestore role check failed:", err.message);
    return res.status(500).json({ error: "Role verification failed" });
  }

  // ── 4. Call /api/refresh-news with server-side CRON_SECRET ───────────────
  const cronSecret = process.env.CRON_SECRET ?? "";
  if (!cronSecret) {
    console.error("[admin-sync-news] CRON_SECRET env var is not set");
    return res.status(500).json({ error: "Server misconfiguration: missing CRON_SECRET" });
  }

  // Run the refresh in-process instead of fetch()-ing our own URL. The old
  // code built that URL from the request's Host header and sent CRON_SECRET
  // to it — a spoofed Host would have received the secret.
  let status = 200, payload = null;
  const fakeRes = {
    status(code) { status = code; return this; },
    json(body)   { payload = body; return this; },
    setHeader()  { return this; },
  };
  try {
    await refreshNewsHandler(
      { method: "GET", headers: { authorization: `Bearer ${cronSecret}` }, query: { force: "true" } },
      fakeRes
    );
  } catch (err) {
    console.error("[admin-sync-news] refresh-news failed:", err.message);
    return res.status(500).json({ error: `News refresh failed: ${err.message}` });
  }

  return res.status(status).json(payload ?? { message: "Sync finished — no details returned" });
}
