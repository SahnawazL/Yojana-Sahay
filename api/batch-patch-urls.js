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
// Patch strategy: identical to patch-scheme-url.js — String.replace
// (non-regex) on content after the scheme's id, replacing only the first
// occurrence past that point. Patches for the same file are applied
// SEQUENTIALLY against the running `content` string, so each patch sees the
// result of the previous one (positions naturally shift, but indexOf() is
// re-run fresh each time so this is safe).
//
// Uses GITHUB_TOKEN + GITHUB_REPO env vars (same as patch-scheme-url.js).
// ─────────────────────────────────────────────────────────────────────────────

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

      const applied = []; // patches that actually changed `content`

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

        // ── EXACT-VALUE MATCHING ────────────────────────────────────────────
        // BUG PREVENTION: String.replace(oldUrl, newUrl) does substring matching.
        // If oldUrl = "udyami.bihar.gov.in" but file has "https://udyami.bihar.gov.in",
        // replace finds the bare domain *inside* the https:// URL and turns it into
        // "https://https://udyami.bihar.gov.in" — stacking https:// on every patch run.
        //
        // Fix: prefer matching the QUOTED exact value ("oldUrl") which won't
        // substring-match inside a longer URL. Fall back to raw replace only if
        // the quoted form isn't found (handles edge cases like unquoted values).
        const quotedOld = `"${oldUrl}"`;
        const quotedNew = `"${newUrl}"`;
        const useQuoted = afterId.includes(quotedOld);

        if (!useQuoted && !afterId.includes(oldUrl)) {
          results.push({
            id, file, success: false,
            error: `Old URL "${oldUrl}" not found near scheme "${id}" in ${file}. The file may have changed already, or the stored URL differs from what the verifier saw.`,
          });
          continue;
        }

        // First pass → apply.en  |  Second pass → apply.hi (same-value match)
        // Quoted form prevents partial-string corruption; raw is safe fallback.
        let patchedAfter = useQuoted
          ? afterId.replace(quotedOld, quotedNew)           // → apply.en (exact)
          : afterId.replace(oldUrl, newUrl);                 // → apply.en (raw fallback)
        // apply.hi pass: only needed when hi has the identical value as oldUrl.
        // Always use raw here since hi values are often bare domains without quotes
        // in a separate field, and the quoted en was already consumed above.
        patchedAfter = patchedAfter.replace(quotedOld, quotedNew); // → apply.hi (exact)
        const patchedContent = beforeId + patchedAfter;

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
