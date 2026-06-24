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

  const host     = req.headers["host"] ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const syncUrl  = `${protocol}://${host}/api/refresh-news?force=true`;

  let refreshRes;
  try {
    refreshRes = await fetch(syncUrl, {
      headers: { "Authorization": `Bearer ${cronSecret}` },
    });
  } catch (err) {
    console.error("[admin-sync-news] Failed to reach /api/refresh-news:", err.message);
    return res.status(502).json({ error: "Could not reach refresh-news endpoint" });
  }

  // ── 5. Forward response to client ─────────────────────────────────────────
  let payload;
  try {
    payload = await refreshRes.json();
  } catch {
    payload = { message: "Sync triggered — no JSON response" };
  }

  return res.status(refreshRes.status).json(payload);
}
