// api/update-schemes-meta.js — Yojana Sahay
// ─────────────────────────────────────────────────────────────────────────────
// commitSchemesMeta() is the GitHub read-merge-commit logic for
// src/schemes-meta.json, called two ways: (1) over HTTP by the handler below
// (browser SchemeVerifier, admin-only) and (2) in-process by the background
// batch verifier in _lib/schemeVerifyBatch.js.
//
// Merge rules per field (new value → stored value):
//   lastVerified        always overwritten
//   lastDate, linkAlive, explicit null CLEARS the stored value (the caller
//   isActive            read the page and it no longer states a deadline /
//                       a "closed" status); undefined/missing keeps it
//   everything else     null/undefined keeps the stored value
//
// Safety:
//   · A failed GitHub read now aborts instead of continuing with {} — the old
//     code would then commit a file containing ONLY this run's entries,
//     silently wiping every other scheme's verified data.
//   · Concurrent writers (background batch + browser run) are handled by
//     retrying on a sha conflict against the freshly-read file.
// ─────────────────────────────────────────────────────────────────────────────

import { requireAdmin } from "./_lib/adminAuth.js";
import { updateRepoFile } from "./_lib/githubCommit.js";

const FILE_PATH = "src/schemes-meta.json";
const ALLOWED_FIELDS = new Set(["lastVerified", "lastDate", "linkAlive", "httpStatus", "isActive", "confidence"]);
const CLEAR_ON_NULL  = new Set(["lastDate", "linkAlive", "isActive"]);
const MAX_ENTRIES    = 3000;

export function mergeSchemesMeta(currentData, results) {
  const merged = { ...currentData };
  let updated = 0;
  for (const [id, newEntry] of Object.entries(results)) {
    if (!/^[A-Za-z0-9_\-]+$/.test(id) || !newEntry || typeof newEntry !== "object") continue;
    const entry = { ...(currentData[id] || {}) };
    for (const [k, v] of Object.entries(newEntry)) {
      if (!ALLOWED_FIELDS.has(k) || v === undefined) continue;
      if (k === "lastVerified") {
        if (typeof v === "string") entry[k] = v;
      } else if (CLEAR_ON_NULL.has(k) && v === null) {
        delete entry[k];
      } else if (v !== null) {
        entry[k] = v;
      }
    }
    merged[id] = entry;
    updated++;
  }
  return { merged, updated };
}

export async function commitSchemesMeta(results) {
  if (!results || typeof results !== "object" || Object.keys(results).length === 0) {
    return { success: true, updated: 0 }; // nothing to do — not an error
  }

  let updated = 0;
  const out = await updateRepoFile(
    FILE_PATH,
    (text) => {
      let currentData = {};
      if (text != null) {
        try {
          currentData = JSON.parse(text);
        } catch (err) {
          throw new Error(`schemes-meta.json in the repo is not valid JSON (${err.message}) — fix it before saving new results.`);
        }
      }
      const r = mergeSchemesMeta(currentData, results);
      updated = r.updated;
      const next = JSON.stringify(r.merged, null, 2);
      return { text: next, changed: next !== text };
    },
    `chore: update schemes-meta [${new Date().toISOString()}]`
  );

  return { success: true, updated, committed: out.committed, sha: out.sha ?? null };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req, res, "verify");
  if (!auth) return;

  const { results } = req.body ?? {};
  if (!results || typeof results !== "object" || Array.isArray(results)) {
    return res.status(400).json({ error: "Invalid results payload" });
  }
  if (Object.keys(results).length > MAX_ENTRIES) {
    return res.status(400).json({ error: `Too many entries (${Object.keys(results).length}).` });
  }

  try {
    const result = await commitSchemesMeta(results);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[update-schemes-meta] failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
