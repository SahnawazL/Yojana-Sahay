// api/find-new-url.js — Yojana Sahay · Dead-Link URL Finder
// ─────────────────────────────────────────────────────────────────────────────
//
// Given a dead scheme URL + metadata, searches for a live replacement URL.
//
// Flow:
//   1. POST { id, name, ministry, oldUrl, state }
//   2. Two parallel Tavily Search queries — targeted + broad fallback
//   3. Deduplicate + normalise candidates
//   4. Ping each (HEAD → GET fallback, mirrors ping-url.js)
//   5. Score: domain quality × liveness
//   6. Return top 5 sorted: [{ url, title, domain, alive, httpStatus, confidence }]
//
// Reuses: TAVILY_API_KEY env var (already set for verify-scheme.js)
// ─────────────────────────────────────────────────────────────────────────────

import { markAiActive } from "./_lib/firebaseAdmin.js";

const TAVILY_SEARCH   = "https://api.tavily.com/search";
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


// ── Tavily Search ─────────────────────────────────────────────────────────────
// Returns raw [{url, title}] array.  No include_domains filter so we don't
// miss schemes that moved to a non-.gov.in portal — domain scoring handles it.

async function tavilySearch(query, tavilyKey, maxResults = 7) {
  try {
    const res = await fetch(TAVILY_SEARCH, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:      tavilyKey,
        query,
        search_depth: "basic",
        max_results:  maxResults,
      }),
    });

    if (!res.ok) {
      console.warn(`[find-new-url] Tavily HTTP ${res.status} for query: ${query}`);
      return [];
    }

    const data = await res.json();
    await markAiActive("tavilyLastActive"); // Tavily search just succeeded
    return (data.results ?? []).map(r => ({
      url:   r.url?.trim() ?? "",
      title: r.title ?? "",
    })).filter(r => r.url);

  } catch (err) {
    console.warn("[find-new-url] Tavily search error:", err.message);
    return [];
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

  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  if (!tavilyKey) {
    return res.status(500).json({
      error: "TAVILY_API_KEY not configured. Add it in Vercel → Settings → Environment Variables.",
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
    tavilySearch(
      `"${name}"${ministryStr ? ` "${ministryStr}"` : ""}${stateStr} India official apply`,
      tavilyKey, 7
    ),
    tavilySearch(
      `${name}${stateStr} India government scheme portal apply`,
      tavilyKey, 6
    ),
  ]);

  // ── Step 2: Deduplicate ───────────────────────────────────────────────────
  const seen = new Set();
  const raw  = [];

  for (const r of [...q1, ...q2]) {
    if (!r.url || seen.has(r.url)) continue;
    if (r.url === oldUrl)          continue;   // never suggest the dead URL back
    seen.add(r.url);
    raw.push(r);
  }

  if (raw.length === 0) {
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
