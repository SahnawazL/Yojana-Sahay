/**
 * /api/deadline-alerts.js  —  Yojana Sahay
 *
 * Merged endpoint — replaces the old separate
 * api/send-deadline-alerts.js (cron) + api/admin-send-deadline-alerts.js (admin),
 * combined into ONE file to save a Serverless Function slot on the Vercel
 * Hobby plan (max 12 functions per deployment).
 *
 * GET  → admin-only: returns the last 20 runs from deadlineAlertRuns
 *         (requires Authorization: Bearer <Firebase ID token>, role === "admin")
 *
 * POST → triggers a run immediately. Two ways in:
 *   1. Vercel Cron (automatic daily) — identified by the "x-vercel-cron" header
 *      or a matching CRON_SECRET bearer token. Runs as trigger: "cron".
 *   2. Admin manual trigger from the Deadlines tab — identified by a valid
 *      Firebase ID token belonging to an admin. Runs as trigger: "manual".
 *
 * vercel.json cron entry should point here:
 *   { "path": "/api/deadline-alerts", "schedule": "0 5 * * *" }
 *
 * No new env vars needed — reuses FIREBASE_*, GMAIL_USER, GMAIL_APP_PASSWORD,
 * and (optionally) CRON_SECRET for manual cron testing via curl.
 */

import { getAdminDb, getAdminAuth }        from "./_lib/firebaseAdmin.js";
import { runDeadlineAlerts, DAILY_EMAIL_LIMIT } from "./_lib/deadlineAlerts.js";

// ── Verify the caller is an admin via Firebase ID token ────────────────────
async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"] ?? "";
  const idToken    = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!idToken) return { ok: false, status: 401, error: "Missing Authorization header" };

  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(idToken);
  } catch (err) {
    console.error("[deadline-alerts] Token verification failed:", err.code ?? err.message);
    return { ok: false, status: 401, error: "Invalid or expired auth token" };
  }

  try {
    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(decodedToken.uid).get();
    if (!userSnap.exists) return { ok: false, status: 403, error: "User not found" };

    const data    = userSnap.data() ?? {};
    const isAdmin = data.role === "admin" || data.isAdmin === true;
    if (!isAdmin) {
      console.warn("[deadline-alerts] Non-admin attempted access:", decodedToken.email);
      return { ok: false, status: 403, error: "Forbidden — admin access required" };
    }
    return { ok: true, db, email: decodedToken.email ?? decodedToken.uid };
  } catch (err) {
    console.error("[deadline-alerts] Firestore role check failed:", err.message);
    return { ok: false, status: 500, error: "Role verification failed" };
  }
}

// ── Is this a legitimate Vercel Cron invocation? ────────────────────────────
function isCronRequest(req) {
  const isVercelCron  = req.headers["x-vercel-cron"] === "1";
  const cronSecret    = process.env.CRON_SECRET?.trim();
  const authHeader     = req.headers["authorization"] ?? "";
  const secretMatches  = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;
  return isVercelCron || secretMatches;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
  }

  // ── GET — admin-only run history ──────────────────────────────────────────
  if (req.method === "GET") {
    const auth = await verifyAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    try {
      const snap = await auth.db.collection("deadlineAlertRuns")
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
          quotaUsed:   data.quotaUsed ?? null,
          quotaLimit:  data.quotaLimit ?? null,
          quotaHit:    data.quotaHit ?? false,
        };
      });

      // Live daily quota — independent of any single run, so the admin tab can
      // show "X / 450 sent today" even between runs.
      const todayKey  = new Date().toISOString().slice(0, 10);
      const quotaSnap = await auth.db.collection("emailQuota").doc(todayKey).get();
      const todayQuota = {
        used:  quotaSnap.exists ? (quotaSnap.data().count || 0) : 0,
        limit: DAILY_EMAIL_LIMIT,
      };

      return res.status(200).json({ runs, todayQuota });
    } catch (err) {
      console.error("[deadline-alerts] Failed to fetch history:", err.message);
      return res.status(500).json({ error: "Could not load run history" });
    }
  }

  // ── POST — trigger a run: cron (automatic) or admin (manual) ────────────
  if (isCronRequest(req)) {
    try {
      const result = await runDeadlineAlerts({ trigger: "cron", triggeredBy: null });
      return res.status(200).json(result);
    } catch (err) {
      console.error("[deadline-alerts] Cron run failed:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Not a cron request — must be an authenticated admin manual trigger
  const auth = await verifyAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  try {
    const result = await runDeadlineAlerts({ trigger: "manual", triggeredBy: auth.email });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[deadline-alerts] Manual run failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
