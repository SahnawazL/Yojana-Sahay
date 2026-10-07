// api/find-new-url.js — Yojana Sahay · Dead-Link URL Finder
// ─────────────────────────────────────────────────────────────────────────────
//
// Given a dead scheme URL + metadata, searches for a live replacement URL.
//
// Flow:
//   1. POST { id, name, ministry, oldUrl, state }
//   2. Two parallel Serper Search queries — targeted + broad fallback
//   3. Deduplicate + normalise candidates
//   4. Ping each (HEAD → GET fallback, mirrors ping-url.js)
//   5. Score: domain quality × liveness
//   6. Return top 5 sorted: [{ url, title, domain, alive, httpStatus, confidence }]
//
// Keys: SERPER_API_KEY in Vercel → Settings → Environment Variables
// Search + ranking live in _lib/urlFinder.js (shared with the autonomous
// URL Repair agent in _lib/urlRepairAgent.js).
// NOTE: verify-scheme.js still uses TAVILY_VERIFY_KEY for page content
//       extraction (Tavily Extract bypasses .gov.in IP blocks — Serper cannot).
// ─────────────────────────────────────────────────────────────────────────────

import { requireAdmin } from "./_lib/adminAuth.js";
import { findUrlCandidates } from "./_lib/urlFinder.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req, res, "verify");
  if (!auth) return;

  const { name, ministry, oldUrl, state = "national" } = req.body ?? {};
  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  console.log(`[find-new-url] Searching for: "${name}" (${state}) — dead: ${oldUrl}`);
  const { candidates, searchError, config } = await findUrlCandidates({ name, ministry, oldUrl, state });

  if (config && !process.env.SERPER_API_KEY?.trim()) {
    return res.status(500).json({ error: searchError });
  }
  if (searchError) {
    console.warn(`[find-new-url] Search failed for "${name}": ${searchError}`);
    return res.status(200).json({ candidates: [], searchError });
  }

  console.log(
    `[find-new-url] ✓ "${name}" — ${candidates.length} candidates. ` +
    `Top: ${candidates[0]?.url} (alive: ${candidates[0]?.alive}, conf: ${candidates[0]?.confidence})`
  );
  return res.status(200).json({ candidates });
}
