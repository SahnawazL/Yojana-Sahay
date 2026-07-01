// api/send-deadline-alerts.js — Yojana Sahay · Scheme Deadline Alert Emails (Cron)
// ─────────────────────────────────────────────────────────────────────────────
//
// Fulfils the promise shown on the Login page, Profile signup benefits card,
// and the "SMS alerts" phone-number hint: users who are logged in get notified
// when a scheme they qualify for has a deadline coming up.
//
// This is the AUTOMATIC entrypoint — runs once daily via Vercel Cron.
// The MANUAL entrypoint (AdminDashboard → Deadlines tab → "Send Alerts Now")
// is api/admin-send-deadline-alerts.js — both call the same shared logic in
// api/_lib/deadlineAlerts.js so behaviour is always identical.
//
// Vercel Cron — add to vercel.json:
//   { "path": "/api/send-deadline-alerts", "schedule": "0 5 * * *" }
//   (05:00 UTC daily = 10:30 AM IST)
//
// Security: same pattern as refresh-news.js (Vercel cron header or CRON_SECRET)
// ─────────────────────────────────────────────────────────────────────────────

import { runDeadlineAlerts } from "./_lib/deadlineAlerts.js";

export default async function handler(req, res) {
  const isVercelCron  = req.headers["x-vercel-cron"] === "1";
  const cronSecret    = process.env.CRON_SECRET?.trim();
  const authHeader    = req.headers["authorization"] ?? "";
  const secretMatches = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;

  if (!isVercelCron && !secretMatches) {
    console.warn("[send-deadline-alerts] Unauthorised request — missing cron header / secret.");
    return res.status(401).json({ error: "Unauthorised" });
  }

  try {
    const result = await runDeadlineAlerts({ trigger: "cron", triggeredBy: null });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[send-deadline-alerts] Fatal error:", err);
    return res.status(500).json({ error: err.message });
  }
}
