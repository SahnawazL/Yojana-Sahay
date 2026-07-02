// api/agent-auto-fix.js — Yojana Sahay · Autonomous URL Auto-Fix Agent
// ─────────────────────────────────────────────────────────────────────────────
// Runs on a Vercel Cron schedule (see vercel.json) with ZERO admin interaction.
//
// What it does, every run:
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
//   5. Writes a full run summary to Firestore (`agentRuns` collection) so you
//      have a history of every autonomous run, what it fixed, and what it
//      skipped.
//
// No Groq / Tavily calls at all — pure data validation + GitHub commit, so
// this costs nothing against your AI rate limits and is safe to run daily.
//
// SECURITY: protected by CRON_SECRET so only Vercel's own cron scheduler (or
// you, manually, with the header) can trigger it.
//   Vercel → Settings → Environment Variables → add CRON_SECRET (any random
//   16+ char string). Vercel automatically sends it as the Authorization
//   header on cron invocations — see https://vercel.com/docs/cron-jobs/manage-cron-jobs
// ─────────────────────────────────────────────────────────────────────────────

import { SCHEME_DB } from "../src/schemesData.js";
import { detectUrlIssues, getUrlIssueFilePath } from "./_lib/urlIssues.js";
import { commitPatches } from "./_lib/githubCommit.js";
import { getAdminDb } from "./_lib/firebaseAdmin.js";

export default async function handler(req, res) {
  // ── Auth: only Vercel Cron (or you, manually, with the secret) may trigger this ──
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers["authorization"];
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const startedAt = new Date().toISOString();

  try {
    // ── Step 1: detect every URL issue across the whole DB ──────────────────
    const issues = detectUrlIssues(SCHEME_DB, "all");

    const noHttps  = issues.filter(i => i.type === "NO_HTTPS");
    const needsReview = issues
      .filter(i => i.type !== "NO_HTTPS")
      .map(i => ({
        id: i.scheme.id,
        name: i.scheme.name?.en ?? i.scheme.id,
        scope: i.scheme.scope,
        state: i.scheme.state ?? null,
        type: i.type,
        rawUrl: i.rawUrl ?? null,
      }));

    // ── Step 2: build patch list for the SAFE issue type only ───────────────
    const patches = noHttps.map(i => ({
      id: i.scheme.id,
      oldUrl: i.rawUrl,
      newUrl: i.suggestedUrl,
      file: getUrlIssueFilePath(i.scheme),
    }));

    let commitResult = { results: [], commits: [] };
    if (patches.length > 0) {
      commitResult = await commitPatches(patches);
    }

    const fixedCount  = commitResult.results.filter(r => r.success).length;
    const failedCount = commitResult.results.filter(r => !r.success).length;

    const summary = {
      startedAt,
      finishedAt: new Date().toISOString(),
      totalSchemesScanned: SCHEME_DB.length,
      totalIssuesFound: issues.length,
      autoFixed: fixedCount,
      autoFixFailed: failedCount,
      commits: commitResult.commits,
      needsReviewCount: needsReview.length,
      needsReview, // full list so the admin dashboard can render it directly
      failures: commitResult.results.filter(r => !r.success),
    };

    // ── Step 3: log the run to Firestore (best-effort — never blocks the response) ──
    try {
      const db = getAdminDb();
      if (db) {
        await db.collection("agentRuns").add({
          agent: "agent-auto-fix",
          ...summary,
          createdAt: new Date(),
        });
      }
    } catch (logErr) {
      console.error("[agent-auto-fix] Firestore log failed:", logErr.message);
    }

    console.log(
      `[agent-auto-fix] Scanned ${summary.totalSchemesScanned} schemes · ` +
      `${summary.autoFixed} auto-fixed · ${summary.needsReviewCount} need review · ` +
      `${summary.autoFixFailed} failed.`
    );

    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("[agent-auto-fix] Run failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
