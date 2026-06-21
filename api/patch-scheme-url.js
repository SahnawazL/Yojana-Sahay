// api/patch-scheme-url.js — Yojana Sahay · Source-File URL Patcher
// ─────────────────────────────────────────────────────────────────────────────
//
// Reads a scheme JS source file from GitHub, replaces a dead apply.en URL
// with a confirmed live one, and commits the change back directly to main.
//
// POST body: { id, oldUrl, newUrl, file }
//   id     — scheme id (e.g. "pmkisan")
//   oldUrl — current broken value as stored in the JS file (may be bare domain)
//   newUrl — confirmed live replacement URL
//   file   — repo-relative path (e.g. "src/schemesData.js", "src/state/delhi.js")
//
// Response (success): { success: true, sha: "abc1234", commitUrl: "https://..." }
// Response (failure): { error: "..." }
//
// Safety checks (all must pass before any commit):
//   · file path must start with "src/" and end with ".js"
//   · scheme id must exist in file content
//   · oldUrl must appear in the file after the scheme id
//   · newUrl must differ from oldUrl
//   · patched content must differ from original (confirms replacement happened)
//
// Patch strategy: safeReplaceUrl() below replaces only a FULL quoted value,
//   never a raw substring — see the function for why that matters.
//   → safe even if the same URL appears in another scheme further down.
//
// Uses GITHUB_TOKEN + GITHUB_REPO env vars (same as update-schemes-meta.js).
// ─────────────────────────────────────────────────────────────────────────────

// ── Safe, drift-tolerant, non-substring URL replacement ──────────────────────
// See batch-patch-urls.js for the full writeup. In short: a raw
// `.replace(oldUrl, newUrl)` substring search can find a bare domain
// *inside* an already-fixed "https://domain" value and stack another
// "https://" on top. This only ever replaces a FULL quoted value.
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

  const { id, oldUrl, newUrl, file } = req.body ?? {};

  // ── Input validation ──────────────────────────────────────────────────────
  if (!id || !oldUrl || !newUrl || !file) {
    return res.status(400).json({
      error: "Missing required fields: id, oldUrl, newUrl, file",
    });
  }
  if (newUrl === oldUrl) {
    return res.status(400).json({
      error: "newUrl is identical to oldUrl — nothing to patch.",
    });
  }
  // Only allow patching scheme source files — prevent accidental API misuse
  if (!file.startsWith("src/") || !file.endsWith(".js")) {
    return res.status(400).json({
      error: `Invalid file path "${file}". Must be under src/ and end with .js.`,
    });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return res.status(500).json({
      error: "GITHUB_TOKEN or GITHUB_REPO not configured. Check Vercel → Environment Variables.",
    });
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/${file}`;
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept:        "application/vnd.github+json",
  };

  try {
    // ── Step 1: Fetch current file from GitHub ────────────────────────────
    const getRes = await fetch(apiBase, { headers: ghHeaders });

    if (!getRes.ok) {
      const err = await getRes.json().catch(() => ({}));
      return res.status(500).json({
        error: `GitHub read failed (HTTP ${getRes.status}): ${err.message ?? "unknown error"} — tried path: "${file}"`,
      });
    }

    const fileInfo = await getRes.json();
    const sha      = fileInfo.sha;
    const content  = Buffer.from(fileInfo.content, "base64").toString("utf8");

    // ── Step 2: Locate scheme by id ───────────────────────────────────────
    // Schemes store id as:  id: "pmkisan",  →  look for `"pmkisan"` in content.
    const idStr = `"${id}"`;
    const idPos = content.indexOf(idStr);

    if (idPos === -1) {
      return res.status(422).json({
        error:
          `Scheme id "${id}" not found in ${file}. ` +
          `Verify the id field matches exactly (case-sensitive).`,
      });
    }

    // ── Step 3+4: Locate the current value near the scheme id and patch ────
    // Never a raw substring replace — see safeReplaceUrl() above.
    const afterId = content.slice(idPos);
    const pass = safeReplaceUrl(afterId, oldUrl, newUrl);

    if (!pass.changed) {
      if (pass.alreadyCorrect) {
        // A previous commit already applied this exact fix — the caller
        // just sent a stale oldUrl. Nothing to do, and nothing broken.
        return res.status(200).json({
          success: true,
          sha: null,
          commitUrl: null,
          note: "Already up to date — no commit needed.",
        });
      }
      return res.status(422).json({
        error:
          `Old URL "${oldUrl}" not found near scheme "${id}" in ${file}, and the file doesn't already ` +
          `contain the new URL either. The stored value has drifted from what was reported — re-scan this scheme and try again.`,
      });
    }

    const beforeId       = content.slice(0, idPos);
    const patchedContent = beforeId + pass.text;

    // Sanity check: confirm something actually changed
    if (patchedContent === content) {
      return res.status(422).json({
        error: "Patch produced no change — this should not happen. Check that oldUrl matches the stored value exactly.",
      });
    }

    // ── Step 5: Commit back to GitHub ─────────────────────────────────────
    const encoded   = Buffer.from(patchedContent).toString("base64");
    const commitMsg =
      `fix: dead link [${id}] — update apply.en URL\n\n` +
      `Old: ${oldUrl}\n` +
      `New: ${newUrl}\n\n` +
      `Patched automatically by SchemeVerifier admin tool.`;

    const putRes = await fetch(apiBase, {
      method:  "PUT",
      headers: { ...ghHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: commitMsg,
        content: encoded,
        sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      return res.status(500).json({
        error: `GitHub commit failed (HTTP ${putRes.status}): ${err.message ?? JSON.stringify(err).slice(0, 200)}`,
      });
    }

    const putData   = await putRes.json();
    const commitSha = putData.commit?.sha ?? "";
    const commitUrl = putData.commit?.html_url ?? "";

    console.log(`[patch-scheme-url] ✓ Committed ${commitSha.slice(0, 7)} for "${id}"`);
    console.log(`[patch-scheme-url]   ${oldUrl}  →  ${newUrl}`);

    return res.status(200).json({ success: true, sha: commitSha, commitUrl });

  } catch (err) {
    console.error("[patch-scheme-url] Unexpected error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
