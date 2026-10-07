// api/batch-patch-urls.js — Yojana Sahay · Batch Source-File URL Patcher
// ─────────────────────────────────────────────────────────────────────────────
//
// Accepts a QUEUE of URL fixes, groups them by source file, and commits each
// file ONCE — N fixes across M files = M commits / Vercel deploys, not N.
//
// POST body: { patches: [{ id, oldUrl, newUrl, file }, ...] }   (admin-only)
//   id     — scheme id (e.g. "pmkisan")
//   oldUrl — current value as stored in the JS file (may be a bare domain)
//   newUrl — confirmed replacement URL (must be a full http(s) URL)
//   file   — repo-relative path ("src/schemesData.js", "src/states/assam.js")
//
// Response (200): {
//   success: true,
//   results: [ { id, file, success, sha?, commitUrl?, noop?, error? }, ... ],
//   commits: [ { file, sha, commitUrl, count } ]
// }
//
// All patch logic (scheme-scoped full-value replacement, sha-conflict retry,
// path/URL validation) lives in _lib/githubCommit.js and is shared with the
// auto-fix agent, so both behave identically.
// ─────────────────────────────────────────────────────────────────────────────

import { requireAdmin } from "./_lib/adminAuth.js";
import { commitPatches } from "./_lib/githubCommit.js";

const MAX_PATCHES = 200;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req, res, "verify");
  if (!auth) return;

  const { patches } = req.body ?? {};
  if (!Array.isArray(patches) || patches.length === 0) {
    return res.status(400).json({ error: "Missing or empty 'patches' array." });
  }
  if (patches.length > MAX_PATCHES) {
    return res.status(400).json({ error: `Too many patches in one batch (${patches.length}). Max ${MAX_PATCHES}.` });
  }

  try {
    const { results, commits } = await commitPatches(patches, { source: "admin" });
    console.log(
      `[batch-patch-urls] ${auth.email}: ${results.filter(r => r.success).length} ok · ` +
      `${results.filter(r => !r.success).length} failed · ${commits.length} commit(s)`
    );
    return res.status(200).json({ success: true, results, commits });
  } catch (err) {
    console.error("[batch-patch-urls] failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
