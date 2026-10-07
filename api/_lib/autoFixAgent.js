// api/_lib/autoFixAgent.js — Yojana Sahay · daily Auto-Fix agent (core)
// ─────────────────────────────────────────────────────────────────────────────
// Called by api/agent-auto-fix.js (Vercel cron, the GitHub watchdog) and by
// the admin "Run now" button (api/deadline-alerts.js, action "runAgent").
//
//   Step 1  NO_HTTPS fixes — bare domain → https:// (zero ambiguity, committed)
//   Step 2  URL repair     — dead links re-pinged / replaced (_lib/urlRepairAgent.js)
//   Step 3  run log        — Firestore agentRuns (agent: "agent-auto-fix")
//   Step 4  activity feed  — adminActivity, only when something happened
// ─────────────────────────────────────────────────────────────────────────────

import { SCHEME_DB } from "../../src/schemesData.js";
import { detectUrlIssues, getUrlIssueFilePath } from "./urlIssues.js";
import { commitPatches } from "./githubCommit.js";
import { getAdminDb } from "./firebaseAdmin.js";
import { runUrlRepair } from "./urlRepairAgent.js";
import { createProgress } from "./agentProgress.js";

export async function runAutoFixAgent({ trigger = "cron" } = {}) {
  const startedAt = new Date().toISOString();
  const db = getAdminDb();
  const progress = createProgress(db, "autoFix", { trigger });
  try {
    progress.step(`Scanning all ${SCHEME_DB.length} schemes for badly formatted apply links…`);
    const issues = detectUrlIssues(SCHEME_DB, "all");
    const noHttps = issues.filter(i => i.type === "NO_HTTPS");
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

    const patches = noHttps.map(i => ({
      id: i.scheme.id,
      oldUrl: i.rawUrl,
      newUrl: i.suggestedUrl,
      file: getUrlIssueFilePath(i.scheme),
    }));

    progress.step(`${noHttps.length} link(s) missing https:// · ${needsReview.length} need a human (several URLs / text instead of a link)`);
    let commitResult = { results: [], commits: [] };
    if (patches.length > 0) {
      progress.step(`Adding https:// to ${patches.length} link(s) and saving to GitHub…`);
      commitResult = await commitPatches(patches, { source: "agent" });
    }

    // Step 2 — dead-link repair. Its own failure must not lose step 1's work.
    let repair = null;
    try {
      progress.step("Dead-link repair: re-checking links marked dead…");
      repair = await runUrlRepair({ db, progress });
    } catch (err) {
      console.error("[agent-auto-fix] URL repair failed:", err.message);
      repair = { error: String(err.message).slice(0, 300), stopReason: `crashed: ${String(err.message).slice(0, 200)}`, fixed: [], recovered: [], needsReview: [] };
    }

    const fixedCount  = commitResult.results.filter(r => r.success).length;
    const failedCount = commitResult.results.filter(r => !r.success).length;
    const allReview   = [...needsReview, ...(repair?.needsReview ?? [])];

    const summary = {
      trigger,
      startedAt,
      finishedAt: new Date().toISOString(),
      totalSchemesScanned: SCHEME_DB.length,
      totalIssuesFound: issues.length,
      autoFixed: fixedCount,
      autoFixFailed: failedCount,
      commits: commitResult.commits,
      needsReviewCount: allReview.length,
      needsReview: allReview,
      failures: commitResult.results.filter(r => !r.success),
      repair: repair && {
        deadFound:   repair.deadFound ?? 0,
        recovered:   repair.recovered ?? [],
        fixed:       repair.fixed ?? [],
        reviewCount: repair.needsReview?.length ?? 0,
        searchesUsed: repair.searchesUsed ?? 0,
        skippedCooldown: repair.skippedCooldown ?? 0,
        errors:      (repair.errors ?? []).slice(0, 10),
        stopReason:  repair.stopReason ?? null,
      },
    };

    try {
      if (db) await db.collection("agentRuns").add({ agent: "agent-auto-fix", ...JSON.parse(JSON.stringify(summary)), createdAt: new Date() });
    } catch (logErr) {
      console.error("[agent-auto-fix] Firestore log failed:", logErr.message);
    }

    const repaired  = summary.repair?.fixed?.length ?? 0;
    const recovered = summary.repair?.recovered?.length ?? 0;
    if (db && (fixedCount > 0 || repaired > 0 || recovered > 0 || allReview.length > 0)) {
      const parts = [];
      if (fixedCount > 0) parts.push(`added https to ${fixedCount} URL${fixedCount !== 1 ? "s" : ""}`);
      if (repaired > 0)   parts.push(`replaced ${repaired} dead link${repaired !== 1 ? "s" : ""}`);
      if (recovered > 0)  parts.push(`${recovered} link${recovered !== 1 ? "s" : ""} back online`);
      if (allReview.length > 0) parts.push(`flagged ${allReview.length} for review`);
      try {
        await db.collection("adminActivity").add({
          agentId: "agent-auto-fix", agentName: "Auto-Fix Agent",
          action: `Daily scan: ${parts.join(", ")}`, tab: "agents", type: "auto", time: new Date(),
        });
      } catch (tickerErr) {
        console.error("[agent-auto-fix] Activity ticker post failed:", tickerErr.message);
      }
    }

    await progress.done({ httpsFixed: fixedCount, repaired, recovered, review: allReview.length });
    console.log(
      `[agent-auto-fix] ${summary.totalSchemesScanned} schemes · ${fixedCount} https fixes · ` +
      `${repaired} links repaired · ${recovered} recovered · ${allReview.length} need review.`
    );
    return summary;
  } catch (err) {
    console.error("[agent-auto-fix] Run failed:", err);
    await progress.fail(err);
    try {
      await db?.collection("agentRuns").add({
        agent: "agent-auto-fix", trigger, startedAt,
        finishedAt: new Date().toISOString(),
        crashed: true,
        error: String(err.message).slice(0, 500),
        totalSchemesScanned: 0, totalIssuesFound: 0, autoFixed: 0, autoFixFailed: 0,
        commits: [], needsReviewCount: 0, needsReview: [], failures: [],
        createdAt: new Date(),
      });
    } catch { /* ignore */ }
    throw err;
  }
}
