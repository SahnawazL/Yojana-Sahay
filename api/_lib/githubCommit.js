// api/_lib/githubCommit.js — Yojana Sahay · Shared GitHub Commit Logic
// ─────────────────────────────────────────────────────────────────────────────
// Adapted from api/batch-patch-urls.js (kept there untouched — it's proven
// and already fixes the "https://https://" stacking bug). This copy is used
// by the automated agent (api/agent-auto-fix.js) so the agent never has to
// make an HTTP round-trip to another one of your own functions.
//
// Same safety rules as batch-patch-urls.js:
//   · Only replaces a FULL quoted value, never a raw substring
//   · Groups patches by file → ONE commit per file, not one per scheme
//   · Stale/no-op patches (already fixed by an earlier run) are reported as
//     success without a wasted commit
// Uses GITHUB_TOKEN + GITHUB_REPO env vars — same ones batch-patch-urls.js uses.
// ─────────────────────────────────────────────────────────────────────────────

export function safeReplaceUrl(text, oldUrl, newUrl) {
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

// patches: [{ id, oldUrl, newUrl, file }, ...]
// Returns: { results: [...], commits: [...] }  — same shape as batch-patch-urls.js
export async function commitPatches(patches) {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN or GITHUB_REPO not configured. Check Vercel → Environment Variables.");
  }

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept:        "application/vnd.github+json",
  };

  const results = [];
  const byFile = {};

  for (const p of patches) {
    const { id, oldUrl, newUrl, file } = p ?? {};
    if (!id || !oldUrl || !newUrl || !file) {
      results.push({ id: id ?? "?", file: file ?? "?", success: false, error: "Missing required fields." });
      continue;
    }
    if (newUrl === oldUrl) {
      results.push({ id, file, success: false, error: "newUrl identical to oldUrl." });
      continue;
    }
    if (!file.startsWith("src/") || !file.endsWith(".js")) {
      results.push({ id, file, success: false, error: `Invalid file path "${file}".` });
      continue;
    }
    if (!byFile[file]) byFile[file] = [];
    byFile[file].push({ id, oldUrl, newUrl });
  }

  const commits = [];

  for (const [file, filePatches] of Object.entries(byFile)) {
    const apiBase = `https://api.github.com/repos/${repo}/contents/${file}`;

    try {
      const getRes = await fetch(apiBase, { headers: ghHeaders });
      if (!getRes.ok) {
        const err = await getRes.json().catch(() => ({}));
        const msg = `GitHub read failed (HTTP ${getRes.status}): ${err.message ?? "unknown error"}`;
        filePatches.forEach(p => results.push({ id: p.id, file, success: false, error: msg }));
        continue;
      }

      const fileInfo = await getRes.json();
      const sha = fileInfo.sha;
      let content = Buffer.from(fileInfo.content, "base64").toString("utf8");

      const applied = [];
      const noops = [];

      for (const { id, oldUrl, newUrl } of filePatches) {
        const idStr = `"${id}"`;
        const idPos = content.indexOf(idStr);

        if (idPos === -1) {
          results.push({ id, file, success: false, error: `Scheme id "${id}" not found in ${file}.` });
          continue;
        }

        const beforeId = content.slice(0, idPos);
        const afterId = content.slice(idPos);

        const pass1 = safeReplaceUrl(afterId, oldUrl, newUrl);
        if (!pass1.changed) {
          if (pass1.alreadyCorrect) {
            noops.push({ id, oldUrl, newUrl });
          } else {
            results.push({ id, file, success: false, error: `Old URL not found near "${id}" — data drifted, skipping.` });
          }
          continue;
        }

        const pass2 = safeReplaceUrl(pass1.text, oldUrl, newUrl);
        const finalAfter = pass2.changed ? pass2.text : pass1.text;
        const patchedContent = beforeId + finalAfter;

        if (patchedContent === content) {
          results.push({ id, file, success: false, error: "Patch produced no change." });
          continue;
        }

        content = patchedContent;
        applied.push({ id, oldUrl, newUrl });
      }

      noops.forEach(n => results.push({ id: n.id, file, success: true, sha: null, commitUrl: null }));
      if (applied.length === 0) continue;

      const encoded = Buffer.from(content).toString("base64");
      const commitMsg =
        `fix: auto-add https:// to ${applied.length} URL${applied.length !== 1 ? "s" : ""} in ${file}\n\n` +
        applied.map(a => `[${a.id}] ${a.oldUrl} → ${a.newUrl}`).join("\n") +
        `\n\nPatched automatically by the agent-auto-fix cron job.`;

      const putRes = await fetch(apiBase, {
        method: "PUT",
        headers: { ...ghHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMsg, content: encoded, sha }),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        const msg = `GitHub commit failed (HTTP ${putRes.status}): ${err.message ?? JSON.stringify(err).slice(0, 200)}`;
        applied.forEach(a => results.push({ id: a.id, file, success: false, error: msg }));
        continue;
      }

      const putData = await putRes.json();
      const commitSha = putData.commit?.sha ?? "";
      const commitUrl = putData.commit?.html_url ?? "";

      applied.forEach(a => results.push({ id: a.id, file, success: true, sha: commitSha, commitUrl }));
      commits.push({ file, sha: commitSha, commitUrl, count: applied.length });
    } catch (err) {
      filePatches.forEach(p => results.push({ id: p.id, file, success: false, error: err.message }));
    }
  }

  return { results, commits };
}
