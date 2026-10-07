// api/_lib/githubCommit.js — Yojana Sahay · Shared GitHub read/patch/commit
// ─────────────────────────────────────────────────────────────────────────────
// Single implementation used by:
//   · api/batch-patch-urls.js   — admin "Apply All Fixes"
//   · api/agent-auto-fix.js     — daily NO_HTTPS auto-fix agent
//   · api/update-schemes-meta.js — schemes-meta.json writes (readRepoFile/writeRepoFile)
//
// Safety rules:
//   · Only a FULL quoted value is ever replaced, never a raw substring
//     (the old substring fallback produced "https://https://…" URLs).
//   · The replacement is confined to THIS scheme's own `apply: { … }` block.
//     The old code searched everything after the scheme id, so when a scheme
//     no longer held the old URL it silently patched the NEXT scheme that
//     happened to share it (e.g. scholarships.gov.in) — and the apply.hi pass
//     could do the same.
//   · Patches are grouped by file → ONE commit per file.
//   · Stale patches (already applied) are reported as success without a commit.
//   · A 409/422 "sha does not match" (another commit landed in between — e.g.
//     the background verifier) is retried against the fresh file.
// ─────────────────────────────────────────────────────────────────────────────

const FILE_PATH_RE = /^src\/(?:states\/)?[a-z0-9_]+\.js$/;
const MAX_ATTEMPTS = 3;

function ghConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN or GITHUB_REPO not configured. Check Vercel → Environment Variables.");
  }
  return {
    repo,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  };
}

function contentsUrl(repo, path) {
  return `https://api.github.com/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
}

// Returns { text, sha } or { text: null, sha: null, missing: true } for 404.
// Throws on any other failure — callers must never treat an auth/network
// error as "file is empty" (that is how schemes-meta.json could be wiped).
export async function readRepoFile(path) {
  const { repo, headers } = ghConfig();
  const res = await fetch(contentsUrl(repo, path), { headers });
  if (res.status === 404) return { text: null, sha: null, missing: true };
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub read failed for ${path} (HTTP ${res.status}): ${err.message ?? "unknown error"}`);
  }
  const info = await res.json();
  let text;
  if (info.content && info.encoding === "base64") {
    text = Buffer.from(info.content, "base64").toString("utf8");
  } else {
    // Files over 1 MB come back without inline content — fetch the raw blob.
    const raw = await fetch(contentsUrl(repo, path), { headers: { ...headers, Accept: "application/vnd.github.raw" } });
    if (!raw.ok) throw new Error(`GitHub raw read failed for ${path} (HTTP ${raw.status})`);
    text = await raw.text();
  }
  return { text, sha: info.sha };
}

// Returns { sha, commitUrl } or throws. err.conflict === true on a sha race.
export async function writeRepoFile(path, text, sha, message) {
  const { repo, headers } = ghConfig();
  const res = await fetch(contentsUrl(repo, path), {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(text, "utf8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(`GitHub commit failed for ${path} (HTTP ${res.status}): ${err.message ?? JSON.stringify(err).slice(0, 200)}`);
    e.conflict = res.status === 409 || (res.status === 422 && /sha/i.test(err.message ?? ""));
    throw e;
  }
  const data = await res.json();
  return { sha: data.commit?.sha ?? "", commitUrl: data.commit?.html_url ?? "" };
}

// Read → transform → write, retrying on a sha conflict.
// transform(text) returns { text, changed } (or null to abort the write).
export async function updateRepoFile(path, transform, message) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const file = await readRepoFile(path);
    const out  = await transform(file.text, file);
    if (!out || !out.changed) return { committed: false, result: out };
    try {
      const commit = await writeRepoFile(path, out.text, file.sha, typeof message === "function" ? message(out) : message);
      return { committed: true, result: out, ...commit };
    } catch (err) {
      lastErr = err;
      if (!err.conflict || attempt === MAX_ATTEMPTS) throw err;
      await new Promise(r => setTimeout(r, 400 * attempt));
    }
  }
  throw lastErr;
}


// ── Scheme-scoped, full-value URL replacement ────────────────────────────────

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// [start, end) of the scheme object whose id is `id`, or null.
export function findSchemeBlock(text, id) {
  const idRe = new RegExp(`(?:^|[\\s{,])["']?id["']?\\s*:\\s*["']${escapeRe(id)}["']`, "m");
  const m = idRe.exec(text);
  if (!m) return null;
  const start = m.index;
  const nextRe = /(?:^|[\s{,])["']?id["']?\s*:\s*["']/gm;
  nextRe.lastIndex = start + m[0].length;
  const next = nextRe.exec(text);
  return [start, next ? next.index : text.length];
}

// [start, end) of the `apply: { … }` object inside a scheme block, or null.
function findApplyObject(block) {
  const m = /\bapply\s*:\s*\{/.exec(block);
  if (!m) return null;
  const close = block.indexOf("}", m.index + m[0].length);
  return close === -1 ? null : [m.index, close + 1];
}

function replaceQuotedValue(text, oldUrl, newUrl) {
  const bare = oldUrl.replace(/^https?:\/\//, "");
  const quotedNew = `"${newUrl}"`;
  // The bare form is safe to match now that replacement is confined to the
  // scheme's own apply object (apply.hi often holds the bare domain).
  for (const quotedOld of new Set([`"${oldUrl}"`, `"https://${bare}"`, `"http://${bare}"`, `"${bare}"`])) {
    const idx = text.indexOf(quotedOld);
    if (idx === -1) continue;
    if (quotedOld === quotedNew) return { text, changed: false, alreadyCorrect: true };
    return { text: text.slice(0, idx) + quotedNew + text.slice(idx + quotedOld.length), changed: true, alreadyCorrect: false };
  }
  return { text, changed: false, alreadyCorrect: text.includes(quotedNew) };
}

// Kept for backwards compatibility with older imports.
export function safeReplaceUrl(text, oldUrl, newUrl) {
  return replaceQuotedValue(text, oldUrl, newUrl);
}

// Applies one URL patch to one scheme inside `content`.
// Returns { content, status: "applied" | "noop" | "error", error? }.
export function applySchemeUrlPatch(content, { id, oldUrl, newUrl }) {
  const block = findSchemeBlock(content, id);
  if (!block) return { content, status: "error", error: `Scheme id "${id}" not found.` };

  const [bStart, bEnd] = block;
  const schemeText = content.slice(bStart, bEnd);
  const applyRange = findApplyObject(schemeText) ?? [0, schemeText.length];
  const [aStart, aEnd] = applyRange;
  let target = schemeText.slice(aStart, aEnd);

  // apply.en first, then apply.hi if it still mirrors the old value.
  const pass1 = replaceQuotedValue(target, oldUrl, newUrl);
  if (!pass1.changed) {
    return pass1.alreadyCorrect
      ? { content, status: "noop" }
      : { content, status: "error", error: `Old URL "${oldUrl}" not found in scheme "${id}" and the new URL isn't there either — the stored value has drifted. Re-scan this scheme and try again.` };
  }
  target = pass1.text;
  const pass2 = replaceQuotedValue(target, oldUrl, newUrl);
  if (pass2.changed) target = pass2.text;

  const newScheme = schemeText.slice(0, aStart) + target + schemeText.slice(aEnd);
  return { content: content.slice(0, bStart) + newScheme + content.slice(bEnd), status: "applied" };
}


// patches: [{ id, oldUrl, newUrl, file }, ...]
// options.source: "admin" | "agent" — only changes the commit message.
// Returns { results: [{ id, file, success, sha?, commitUrl?, error?, noop? }], commits: [...] }
export async function commitPatches(patches, { source = "agent" } = {}) {
  ghConfig(); // fail fast with a clear message when env is missing

  const results = [];
  const byFile  = new Map();

  for (const p of patches ?? []) {
    const { id, oldUrl, newUrl, file } = p ?? {};
    if (!id || !oldUrl || !newUrl || !file) {
      results.push({ id: id ?? "?", file: file ?? "?", success: false, error: "Missing required fields: id, oldUrl, newUrl, file" });
      continue;
    }
    if (typeof newUrl !== "string" || !/^https?:\/\/[^\s"'<>\\]+$/i.test(newUrl.trim())) {
      results.push({ id, file, success: false, error: `New URL "${newUrl}" is not a valid http(s) URL.` });
      continue;
    }
    if (/^https?:\/\/https?:\/\//i.test(newUrl.trim())) {
      results.push({ id, file, success: false, error: `New URL "${newUrl}" has a doubled protocol.` });
      continue;
    }
    if (newUrl.trim() === String(oldUrl).trim()) {
      results.push({ id, file, success: false, error: "New URL is identical to the old URL — nothing to patch." });
      continue;
    }
    if (!FILE_PATH_RE.test(file)) {
      results.push({ id, file, success: false, error: `Invalid file path "${file}".` });
      continue;
    }
    if (!byFile.has(file)) byFile.set(file, []);
    // Last patch for a scheme wins if the queue somehow holds duplicates.
    const list = byFile.get(file).filter(x => x.id !== id);
    list.push({ id, oldUrl: String(oldUrl).trim(), newUrl: newUrl.trim() });
    byFile.set(file, list);
  }

  const commits = [];

  for (const [file, filePatches] of byFile) {
    let perPatch = [];
    try {
      const out = await updateRepoFile(
        file,
        (text) => {
          perPatch = [];
          if (text == null) {
            perPatch = filePatches.map(p => ({ ...p, status: "error", error: `File ${file} not found in the repo.` }));
            return null;
          }
          let content = text;
          for (const p of filePatches) {
            const r = applySchemeUrlPatch(content, p);
            content = r.content;
            perPatch.push({ ...p, status: r.status, error: r.error });
          }
          return { text: content, changed: content !== text };
        },
        () => {
          const applied = perPatch.filter(p => p.status === "applied");
          const header = source === "admin"
            ? `fix: ${applied.length} scheme URL${applied.length !== 1 ? "s" : ""} in ${file}`
            : `fix: auto-add https:// to ${applied.length} URL${applied.length !== 1 ? "s" : ""} in ${file}`;
          return `${header}\n\n${applied.map(a => `[${a.id}] ${a.oldUrl} → ${a.newUrl}`).join("\n")}\n\n` +
            (source === "admin"
              ? "Patched by the SchemeVerifier admin tool (batch commit)."
              : "Patched automatically by the agent-auto-fix cron job.");
        }
      );

      const appliedCount = perPatch.filter(p => p.status === "applied").length;
      for (const p of perPatch) {
        if (p.status === "applied") results.push({ id: p.id, file, success: true, sha: out.sha ?? null, commitUrl: out.commitUrl ?? null });
        else if (p.status === "noop") results.push({ id: p.id, file, success: true, sha: null, commitUrl: null, noop: true });
        else results.push({ id: p.id, file, success: false, error: p.error });
      }
      if (out.committed && appliedCount > 0) {
        commits.push({ file, sha: out.sha, commitUrl: out.commitUrl, count: appliedCount });
        console.log(`[githubCommit] ✓ ${out.sha?.slice(0, 7)} — ${appliedCount} fix(es) in ${file}`);
      }
    } catch (err) {
      filePatches.forEach(p => results.push({ id: p.id, file, success: false, error: err.message }));
    }
  }

  return { results, commits };
}
