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
// NOTE: verify-scheme.js still uses TAVILY_VERIFY_KEY for page content
//       extraction (Tavily Extract bypasses .gov.in IP blocks — Serper cannot).
// ─────────────────────────────────────────────────────────────────────────────

import { recordAiCall } from "./_lib/firebaseAdmin.js";

const SERPER_SEARCH   = "https://google.serper.dev/search";
const PING_TIMEOUT_MS = 8000;
const MAX_CANDIDATES  = 5;
const USER_AGENT      =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";


// ── Domain quality scorer ─────────────────────────────────────────────────────
// Returns 0.1–1.0 based on how official the domain looks.
// .gov.in and .nic.in are the gold standard for Indian govt schemes.

function domainScore(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.endsWith(".gov.in"))       return 1.0;  // State / central govt portals
    if (host.endsWith(".nic.in"))       return 0.9;  // NIC-hosted portals
    if (host === "india.gov.in" || host.endsWith(".india.gov.in")) return 0.9;
    if (host.endsWith(".org.in"))       return 0.6;
    if (host.includes("gov"))           return 0.5;  // e.g. upgovt.org, nhm.gov
    if (host.endsWith(".in"))           return 0.3;
    return 0.1;
  } catch {
    return 0;
  }
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}


// ── Serper Search ─────────────────────────────────────────────────────────────
// Calls Google Search via Serper and returns [{url, title}].
// Serper uses X-API-KEY header (not body) and returns data.organic[].link
// (not data.results[].url like Tavily did).

async function serperSearch(query, serperKey, maxResults = 7) {
  try {
    const res = await fetch(SERPER_SEARCH, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY":    serperKey,           // ← Serper auth: header, not body
      },
      body: JSON.stringify({
        q:   query,
        num: maxResults,                     // number of results (max 10 per call)
        gl:  "in",                           // country: India — boosts .gov.in results
        hl:  "en",                           // language: English
      }),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        const msg  = body?.message ?? body?.error ?? null;
        if (msg) detail = `HTTP ${res.status}: ${msg}`;
      } catch { /* body wasn't JSON — keep the bare status */ }

      console.warn(`[find-new-url] Serper HTTP ${res.status} for query: ${query}`);
      return { results: [], error: { status: res.status, message: detail } };
    }

    const data = await res.json();

    // Serper returns organic results under data.organic[]
    // Each item has: { link, title, snippet, position }
    // We map link → url to keep the same shape the rest of the file expects.
    recordAiCall({ service: "serper-verify" }).catch(() => {}); // track in API call history
    return {
      results: (data.organic ?? []).map(r => ({
        url:   r.link?.trim() ?? "",
        title: r.title ?? "",
      })).filter(r => r.url),
      error: null,
    };

  } catch (err) {
    console.warn("[find-new-url] Serper search error:", err.message);
    return { results: [], error: { status: 0, message: err.message } };
  }
}


// ── URL pinger ────────────────────────────────────────────────────────────────
// Mirrors ping-url.js logic inline — HEAD with GET fallback.

async function pingUrl(url) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    let res = await fetch(url, {
      method:   "HEAD",
      signal:   controller.signal,
      headers:  { "User-Agent": USER_AGENT },
      redirect: "follow",
    });

    // Some servers reject HEAD — retry as GET
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method:   "GET",
        signal:   controller.signal,
        headers:  { "User-Agent": USER_AGENT },
        redirect: "follow",
      });
    }

    clearTimeout(timer);
    const httpStatus = res.status;
    return { alive: httpStatus >= 200 && httpStatus < 400, httpStatus };

  } catch {
    clearTimeout(timer);
    return { alive: false, httpStatus: 0 };
  }
}


// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const serperKey = process.env.SERPER_API_KEY?.trim();
  if (!serperKey) {
    return res.status(500).json({
      error: "No Serper key configured. Add SERPER_API_KEY in Vercel → Settings → Environment Variables.",
    });
  }

  const { name, ministry, oldUrl, state = "national" } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: "Missing required field: name" });
  }

  console.log(`[find-new-url] Searching for: "${name}" (${state}) — dead: ${oldUrl}`);

  // ── Step 1: Two parallel searches ────────────────────────────────────────
  // Query 1 — targeted: scheme name + ministry in quotes, India apply
  // Query 2 — broader fallback: no quotes, scheme + portal
  const ministryStr = ministry ?? "";
  const stateStr    = state !== "national" ? ` ${state}` : "";

  const [q1, q2] = await Promise.all([
    serperSearch(
      `"${name}"${ministryStr ? ` "${ministryStr}"` : ""}${stateStr} India official apply`,
      serperKey, 7
    ),
    serperSearch(
      `${name}${stateStr} India government scheme portal apply`,
      serperKey, 6
    ),
  ]);

  // ── Step 2: Deduplicate ───────────────────────────────────────────────────
  const seen = new Set();
  const raw  = [];

  for (const r of [...q1.results, ...q2.results]) {
    if (!r.url || seen.has(r.url)) continue;
    if (r.url === oldUrl)          continue;   // never suggest the dead URL back
    seen.add(r.url);
    raw.push(r);
  }

  if (raw.length === 0) {
    // Both queries actually failed (not just "found nothing") — surface the
    // real reason instead of a misleading "No candidates found".
    const errors = [q1.error, q2.error].filter(Boolean);
    if (errors.length === 2) {
      const e = errors[0];
      let searchError;
      if      (e.status === 401) searchError = "Serper API key invalid or revoked — check SERPER_API_KEY in Vercel.";
      else if (e.status === 429) searchError = "Serper is rate-limiting requests — wait a bit and retry.";
      else if (e.status >= 500)  searchError = "Serper service is currently unavailable (server error).";
      else if (e.status === 0)   searchError = `Serper request failed: ${e.message}`;
      else                       searchError = `Serper error: ${e.message}`;

      console.warn(`[find-new-url] Search failed for "${name}": ${searchError}`);
      return res.status(200).json({ candidates: [], searchError });
    }

    console.warn(`[find-new-url] No results for "${name}"`);
    return res.status(200).json({ candidates: [] });
  }

  // ── Step 3: Ping all candidates in parallel ───────────────────────────────
  const pingResults = await Promise.all(raw.map(r => pingUrl(r.url)));

  // ── Step 4: Score ─────────────────────────────────────────────────────────
  // confidence = (domain quality × 0.6) + (alive bonus × 0.4)
  const scored = raw.map((r, i) => {
    const { alive, httpStatus } = pingResults[i];
    const ds   = domainScore(r.url);
    const conf = Math.min(1, ds * 0.6 + (alive ? 0.4 : 0));
    return {
      url:        r.url,
      title:      r.title,
      domain:     extractDomain(r.url),
      alive,
      httpStatus,
      confidence: Math.round(conf * 100) / 100,
    };
  });

  // Alive first, then by confidence desc
  scored.sort((a, b) =>
    a.alive !== b.alive ? (a.alive ? -1 : 1) : b.confidence - a.confidence
  );

  const candidates = scored.slice(0, MAX_CANDIDATES);

  console.log(
    `[find-new-url] ✓ "${name}" — ${candidates.length} candidates. ` +
    `Top: ${candidates[0]?.url} (alive: ${candidates[0]?.alive}, ` +
    `conf: ${candidates[0]?.confidence})`
  );

  return res.status(200).json({ candidates });
}
