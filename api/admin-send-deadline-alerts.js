/**
 * /api/admin-send-deadline-alerts.js  —  Yojana Sahay
 *
 * Secure proxy for the AdminDashboard "Deadlines" tab.
 *
 * GET  → returns the last 20 runs from Firestore deadlineAlertRuns (for the
 *         stats cards + send log table)
 * POST → triggers a deadline-alert run immediately (the "Send Alerts Now" button)
 *
 * Flow (same pattern as admin-sync-news.js):
 *   1. Client sends Firebase ID token as  Authorization: Bearer <idToken>
 *   2. Verifies token via Firebase Admin Auth
 *   3. Checks caller has  role === "admin"  in Firestore  users/<uid>
 *   4. GET  → reads deadlineAlertRuns history
 *      POST → calls runDeadlineAlerts({ trigger: "manual", triggeredBy: adminEmail })
 *
 * No new env vars needed — reuses FIREBASE_*, GMAIL_USER, GMAIL_APP_PASSWORD.
 */

import { getAdminDb, getAdminAuth } from "./_lib/firebaseAdmin.js";
import { runDeadlineAlerts }        from "./_lib/deadlineAlerts.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
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
    console.error("[admin-send-deadline-alerts] Token verification failed:", err.code ?? err.message);
    return res.status(401).json({ error: "Invalid or expired auth token" });
  }

  // ── 3. Check admin role in Firestore ─────────────────────────────────────
  let db;
  try {
    db = getAdminDb();
    const userSnap = await db.collection("users").doc(decodedToken.uid).get();

    if (!userSnap.exists) {
      return res.status(403).json({ error: "User not found" });
    }

    const data    = userSnap.data() ?? {};
    const isAdmin = data.role === "admin" || data.isAdmin === true;

    if (!isAdmin) {
      console.warn("[admin-send-deadline-alerts] Non-admin attempted access:", decodedToken.email);
      return res.status(403).json({ error: "Forbidden — admin access required" });
    }
  } catch (err) {
    console.error("[admin-send-deadline-alerts] Firestore role check failed:", err.message);
    return res.status(500).json({ error: "Role verification failed" });
  }

  // ── 4a. GET — return recent run history ──────────────────────────────────
  if (req.method === "GET") {
    try {
      const snap = await db.collection("deadlineAlertRuns")
        .orderBy("runAt", "desc")
        .limit(20)
        .get();

      const runs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          trigger:     data.trigger,
          triggeredBy: data.triggeredBy,
          runAt:       data.runAt?.toDate?.().toISOString() ?? null,
          checked:     data.checked,
          sent:        data.sent,
          skipped:     data.skipped,
          recipients:  data.recipients ?? [],
        };
      });

      return res.status(200).json({ runs });
    } catch (err) {
      console.error("[admin-send-deadline-alerts] Failed to fetch history:", err.message);
      return res.status(500).json({ error: "Could not load run history" });
    }
  }

  // ── 4b. POST — trigger a run immediately ─────────────────────────────────
  try {
    const result = await runDeadlineAlerts({
      trigger:     "manual",
      triggeredBy: decodedToken.email ?? decodedToken.uid,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[admin-send-deadline-alerts] Manual run failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
