// api/agent-auto-fix.js — Yojana Sahay · Autonomous URL Auto-Fix Agent
// ─────────────────────────────────────────────────────────────────────────────
// Runs on a Vercel Cron schedule (see vercel.json) with ZERO admin interaction.
//
// What it does, every run (core logic: _lib/autoFixAgent.js):
//   1. Loads SCHEME_DB (national + all states — already merged in schemesData.js)
//   2. Detects all 4 URL issue types using the same rules as SchemeVerifier.jsx
//   3. Auto-fixes ONLY "NO_HTTPS" issues (bare domain → add https://) — this is
//      the one issue type with zero ambiguity, so it's safe to commit without
//      a human looking at it first.
//   4. MULTI_URL / TEXT_ONLY / NO_URL are NEVER auto-fixed — they need a human
//      to pick a URL / mark offline / find a URL. These are logged to
//      Firestore under `agentRuns/{runId}.needsReview` so they show up for
//      you to handle manually in SchemeVerifier.jsx — the agent flags, it
//      doesn't guess.
//   5. URL REPAIR (_lib/urlRepairAgent.js): dead links are re-pinged, and
//      still-dead ones get a replacement searched for and auto-committed only
//      when it is unambiguous (same site / official site + title match).
//   6. Writes a full run summary to Firestore (`agentRuns` collection) so you
//      have a history of every autonomous run, what it fixed, and what it
//      skipped.
//
// No Groq / Tavily calls. URL repair spends at most URL_REPAIR_PER_RUN (default 3)
// Serper searches a day.
//
// POST { action: "discover" } (same CRON_SECRET) → Scheme Discovery agent,
// see _lib/schemeDiscovery.js. Called daily by verify-schemes-cron.yml.
// POST { action: "health" } (same CRON_SECRET) → Watchdog health check, see
// _lib/agentHealth.js. Called by .github/workflows/agents-watchdog.yml.
//
// SECURITY: protected by CRON_SECRET so only Vercel's own cron scheduler (or
// you, manually, with the header) can trigger it.
//   Vercel → Settings → Environment Variables → add CRON_SECRET (any random
//   16+ char string). Vercel automatically sends it as the Authorization
//   header on cron invocations — see https://vercel.com/docs/cron-jobs/manage-cron-jobs
// ─────────────────────────────────────────────────────────────────────────────

import { runAutoFixAgent } from "./_lib/autoFixAgent.js";
import { getAgentHealth, saveAgentHealth } from "./_lib/agentHealth.js";
import { getAdminDb } from "./_lib/firebaseAdmin.js";
import { runAndLogDiscovery } from "./_lib/schemeDiscovery.js";

export default async function handler(req, res) {
  // ── Auth: only Vercel Cron / the GitHub watchdog (CRON_SECRET) ────────────
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers["authorization"] ?? "";
  const isVercelCronUA = /vercel-cron/i.test(req.headers["user-agent"] ?? "");
  const authorized = cronSecret ? authHeader === `Bearer ${cronSecret}` : isVercelCronUA;
  if (!authorized) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  // ── Watchdog health check ────────────────────────────────────────────────
  if (req.method === "POST" && req.body?.action === "health") {
    try {
      const db = getAdminDb();
      const health = await getAgentHealth(db);
      const report = req.body?.report && typeof req.body.report === "object" ? req.body.report : {};
      const extra = {};
      if (Array.isArray(report.reruns)) extra.reruns = report.reruns.slice(0, 10);
      if (report.issue && typeof report.issue === "object") extra.issue = { url: String(report.issue.url ?? ""), state: String(report.issue.state ?? "") };
      if (report.reviewIssue && typeof report.reviewIssue === "object") extra.reviewIssue = { url: String(report.reviewIssue.url ?? ""), state: String(report.reviewIssue.state ?? "") };
      if (report.source) extra.source = String(report.source).slice(0, 40);
      await saveAgentHealth(db, health, extra).catch(err => console.warn("[watchdog] save failed:", err.message));
      return res.status(200).json(health);
    } catch (err) {
      console.error("[watchdog] health check failed:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Scheme Discovery (daily, GitHub Actions) ─────────────────────────────
  if (req.method === "POST" && req.body?.action === "discover") {
    try {
      const result = await runAndLogDiscovery({ db: getAdminDb(), trigger: req.body?.trigger === "watchdog" ? "watchdog" : "cron" });
      return res.status(200).json({ success: true, result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  try {
    const summary = await runAutoFixAgent({ trigger: req.body?.trigger === "watchdog" ? "watchdog" : "cron" });
    return res.status(200).json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
