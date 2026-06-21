// api/batch-patch-urls.js — Yojana Sahay · Batch Source-File URL Patcher
// ─────────────────────────────────────────────────────────────────────────────
//
// Accepts a QUEUE of URL fixes, groups them by source file, and commits each
// file ONCE — applying every patch for that file in a single commit. This is
// the fix for "Problem 2": handleCommitFix used to be 1 fix → 1 commit → 1
// Vercel deploy. 5 dead links across 2 files now triggers 2 deploys instead
// of 5.
//
// POST body: { patches: [{ id, oldUrl, newUrl, file }, ...] }
//   id     — scheme id (e.g. "pmkisan")
//   oldUrl — current broken value as stored in the JS file (may be bare domain)
//   newUrl — confirmed live replacement URL
//   file   — repo-relative path (e.g. "src/schemesData.js", "src/states/assam.js")
//
// Response (200): {
//   success: true,
//   results: [ { id, file, success, sha?, commitUrl?, error? }, ... ],
//   commits: [ { file, sha, commitUrl, count } ]
// }
//
// Per-patch safety checks (same as patch-scheme-url.js, but applied
// individually so ONE bad patch doesn't block the rest of that file's batch):
//   · file path must start with "src/" and end with ".js"
//   · newUrl must differ from oldUrl
//   · scheme id must exist in file content
//   · oldUrl must appear in the file after the scheme id
//   · patched content must differ from original
//
// Patch strategy: safeReplaceUrl() below replaces only a FULL quoted value
// — never a raw substring — so a bare oldUrl can never get matched *inside*
// an already-https:// value and stack another "https://" on top (the
// "https://https://" corruption bug). If the file has already drifted past
// what the client thinks oldUrl is (e.g. a stale tab re-sending a fix that
// already landed), and the file already contains newUrl, the patch is
// reported as an already-correct success instead of being forced through.
// Patches for the same file are applied SEQUENTIALLY against the running
// `content` string, so each patch sees the result of the previous one.
//
// Uses GITHUB_TOKEN + GITHUB_REPO env vars (same as patch-scheme-url.js).
// ─────────────────────────────────────────────────────────────────────────────

// ── Safe, drift-tolerant, non-substring URL replacement ──────────────────────
// THE BUG THIS FIXES:
//   The old code tried an exact `"oldUrl"` match first, but if the file's
//   value had already drifted (e.g. a previous successful patch already
//   turned bare "dkbssy.cg.gov.in" into "https://dkbssy.cg.gov.in", but the
//   browser tab was stale and re-sent the original bare oldUrl), the exact
//   match failed and the code fell back to `afterId.replace(oldUrl, newUrl)`
//   — a raw SUBSTRING search. Since "dkbssy.cg.gov.in" is literally a
//   substring of "https://dkbssy.cg.gov.in", that fallback found it INSIDE
//   the already-correct value and replaced it in place, stacking another
//   "https://" in front: "https://https://dkbssy.cg.gov.in". Every repeated
//   "fix" on a stale page added one more.
//
// THE FIX:
//   Only ever replace a FULL quoted value, never a substring. We try the
//   value exactly as given, then the same bare domain wrapped in https:// /
//   http:// (covers protocol drift). If none of those match but the file
//   ALREADY contains the new URL, this scheme was already fixed by an
//   earlier commit — report it as already-correct instead of corrupting it.
//   If nothing matches at all, we fail loudly instead of guessing.
function safeReplaceUrl(text, oldUrl, newUrl) {
  const bare = oldUrl.replace(/^https?:\/\//, "");
  const candidates = [...new Set([
    `"${oldUrl}"`,
    `"https://${bare}"`,
    `"http://${bare}"`,
  ])];

  for (const quotedOld of candidates) {
    const idx = text.indexOf(quotedOld);
    if (idx !== -1) {
      const quotedNew = `"${newUrl}"`;
      if (quotedOld === quotedNew) {
        // The matched value is already byte-identical to the target — a
        // stale duplicate click, not a real fix. Report as already-correct
        // instead of doing a same-value "replace" that the caller's
        // no-real-diff check would otherwise misreport as an error.
        return { text, changed: false, alreadyCorrect: true };
      }
      return {
        text: text.slice(0, idx) + quotedNew + text.slice(idx + quotedOld.length),
        changed: true,
        alreadyCorrect: false,
      };
    }
  }

  if (text.includes(`"${newUrl}"`)) {
    return { text, changed: false, alreadyCorrect: true };
  }

  return { text, changed: false, alreadyCorrect: false };
}


export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { patches } = req.body ?? {};

  if (!Array.isArray(patches) || patches.length === 0) {
    return res.status(400).json({ error: "Missing or empty 'patches' array." });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return res.status(500).json({
      error: "GITHUB_TOKEN or GITHUB_REPO not configured. Check Vercel → Environment Variables.",
    });
  }

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept:        "application/vnd.github+json",
  };

  const results = [];

  // ── Step 1: Validate every patch + group by file ──────────────────────────
  // Invalid patches are recorded as failures immediately and never reach the
  // GitHub round-trip — they don't block other patches for the same file.
  const byFile = {}; // { [file]: [{ id, oldUrl, newUrl }, ...] }

  for (const p of patches) {
    const { id, oldUrl, newUrl, file } = p ?? {};

    if (!id || !oldUrl || !newUrl || !file) {
      results.push({
        id: id ?? "?", file: file ?? "?", success: false,
        error: "Missing required fields: id, oldUrl, newUrl, file",
      });
      continue;
    }
    if (newUrl === oldUrl) {
      results.push({
        id, file, success: false,
        error: "newUrl is identical to oldUrl — nothing to patch.",
      });
      continue;
    }
    if (!file.startsWith("src/") || !file.endsWith(".js")) {
      results.push({
        id, file, success: false,
        error: `Invalid file path "${file}". Must be under src/ and end with .js.`,
      });
      continue;
    }

    if (!byFile[file]) byFile[file] = [];
    byFile[file].push({ id, oldUrl, newUrl });
  }

  const commits = [];

  // ── Step 2: One GitHub read + one GitHub write per FILE ───────────────────
  for (const [file, filePatches] of Object.entries(byFile)) {
    const apiBase = `https://api.github.com/repos/${repo}/contents/${file}`;

    try {
      // Fetch the file ONCE, regardless of how many schemes inside it changed.
      const getRes = await fetch(apiBase, { headers: ghHeaders });

      if (!getRes.ok) {
        const err = await getRes.json().catch(() => ({}));
        const msg = `GitHub read failed (HTTP ${getRes.status}): ${err.message ?? "unknown error"} — tried path: "${file}"`;
        filePatches.forEach(p => results.push({ id: p.id, file, success: false, error: msg }));
        continue;
      }

      const fileInfo = await getRes.json();
      const sha      = fileInfo.sha;
      let content    = Buffer.from(fileInfo.content, "base64").toString("utf8");

      const applied = []; // patches that actually changed `content` (real diffs)
      const noops   = [];  // patches already correct in the file — stale re-fix

      // Apply every patch for this file sequentially against the running content.
      for (const { id, oldUrl, newUrl } of filePatches) {
        const idStr = `"${id}"`;
        const idPos = content.indexOf(idStr);

        if (idPos === -1) {
          results.push({
            id, file, success: false,
            error: `Scheme id "${id}" not found in ${file}. Verify the id field matches exactly (case-sensitive).`,
          });
          continue;
        }

        const beforeId = content.slice(0, idPos);
        const afterId  = content.slice(idPos);

        // Pass 1 → apply.en. Never does a raw substring replace — see
        // safeReplaceUrl() above for why that corrupted URLs.
        const pass1 = safeReplaceUrl(afterId, oldUrl, newUrl);

        if (!pass1.changed) {
          if (pass1.alreadyCorrect) {
            // A previous commit already fixed this — the client just sent a
            // stale oldUrl. Nothing to patch, but it's not a failure.
            noops.push({ id, oldUrl, newUrl });
          } else {
            results.push({
              id, file, success: false,
              error: `Old URL "${oldUrl}" not found near scheme "${id}" in ${file}, and the file doesn't already contain the new URL either. The stored value has drifted from what the verifier saw — re-scan this scheme and try again.`,
            });
          }
          continue;
        }

        // Pass 2 → apply.hi, only if it still holds the old value too
        // (most schemes mirror the same URL in en/hi). Same safe matching.
        const pass2 = safeReplaceUrl(pass1.text, oldUrl, newUrl);
        const finalAfter = pass2.changed ? pass2.text : pass1.text;

        const patchedContent = beforeId + finalAfter;

        if (patchedContent === content) {
          results.push({
            id, file, success: false,
            error: "Patch produced no change — old/new URL mismatch.",
          });
          continue;
        }

        content = patchedContent;
        applied.push({ id, oldUrl, newUrl });
      }

      // Stale re-fixes that were already correct: report as success so the
      // frontend clears them from "Known Dead Links" too, but they don't
      // need a commit since nothing in the file actually changed for them.
      noops.forEach(n =>
        results.push({ id: n.id, file, success: true, sha: null, commitUrl: null })
      );

      // Nothing in this file actually changed → skip the commit entirely.
      if (applied.length === 0) continue;

      // ── One commit for the whole file ───────────────────────────────────
      const encoded = Buffer.from(content).toString("base64");
      const commitMsg =
        `fix: ${applied.length} dead link${applied.length !== 1 ? "s" : ""} in ${file}\n\n` +
        applied.map(a => `[${a.id}] ${a.oldUrl} → ${a.newUrl}`).join("\n") +
        `\n\nPatched automatically by SchemeVerifier admin tool (batch commit).`;

      const putRes = await fetch(apiBase, {
        method:  "PUT",
        headers: { ...ghHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMsg, content: encoded, sha }),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        const msg = `GitHub commit failed (HTTP ${putRes.status}): ${err.message ?? JSON.stringify(err).slice(0, 200)}`;
        applied.forEach(a => results.push({ id: a.id, file, success: false, error: msg }));
        continue;
      }

      const putData   = await putRes.json();
      const commitSha = putData.commit?.sha ?? "";
      const commitUrl = putData.commit?.html_url ?? "";

      applied.forEach(a =>
        results.push({ id: a.id, file, success: true, sha: commitSha, commitUrl })
      );
      commits.push({ file, sha: commitSha, commitUrl, count: applied.length });

      console.log(`[batch-patch-urls] ✓ Committed ${commitSha.slice(0, 7)} — ${applied.length} fix(es) in ${file}`);
      applied.forEach(a => console.log(`[batch-patch-urls]   [${a.id}] ${a.oldUrl} → ${a.newUrl}`));

    } catch (err) {
      filePatches.forEach(p => results.push({ id: p.id, file, success: false, error: err.message }));
    }
  }

  return res.status(200).json({ success: true, results, commits });
}
