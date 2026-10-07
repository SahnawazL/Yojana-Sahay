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
import { logApiCallToHistory } from "./_lib/apiCallHistory.js";
import { requireAdmin } from "./_lib/adminAuth.js";
import { isPublicHttpUrl, normalizeSchemeUrl } from "./_lib/urlTools.js";
import { pingUrlServer } from "./ping-url.js";

const SERPER_SEARCH   = "https://google.serper.dev/search";
const MAX_CANDIDATES  = 5;


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
    recordAiCall({ service: "serper-verify" }).catch(() => {});     // track in adminMeta/aiStatus
    logApiCallToHistory("serperCalls").catch(() => {});               // track in apiCallHistory 30-day chart
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
// Same rules as /api/ping-url (shared implementation) — 401/403/429 count as
// "up but blocking bots", timeouts are inconclusive rather than dead.
async function pingUrl(url) {
  if (!isPublicHttpUrl(url)) return { alive: false, httpStatus: 0 };
  const r = await pingUrlServer(url);
  return { alive: r.alive, httpStatus: r.httpStatus };
}

// Compare URLs ignoring protocol, "www.", trailing slash and case — so the
// dead URL is never suggested back as its own "replacement".
function sameUrl(a, b) {
  const canon = u => String(u || "").trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[#?].*$/, "").replace(/\/+$/, "");
  return !!a && !!b && canon(a) === canon(b);
}

// Search results that can never be a scheme's apply page.
const JUNK_HOSTS = /(^|\.)(youtube\.com|facebook\.com|twitter\.com|x\.com|instagram\.com|linkedin\.com|wikipedia\.org|quora\.com|reddit\.com|scribd\.com)$/i;

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  const serperKey = process.env.SERPER_API_KEY?.trim();
  if (!serperKey) {
    return res.status(500).json({
      error: "No Serper key configured. Add SERPER_API_KEY in Vercel → Settings → Environment Variables.",
    });
  }

  const { name, ministry, oldUrl: rawOldUrl, state = "national" } = req.body ?? {};
  const oldUrl = normalizeSchemeUrl(rawOldUrl) ?? rawOldUrl ?? null;

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
    if (!r.url || seen.has(r.url))  continue;
    if (sameUrl(r.url, oldUrl))     continue;   // never suggest the dead URL back
    if (!isPublicHttpUrl(r.url))    continue;
    try { if (JUNK_HOSTS.test(new URL(r.url).hostname)) continue; } catch { continue; }
    if (/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(r.url)) continue; // documents aren't apply pages
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
    const conf = Math.min(1, ds * 0.6 + (alive === true ? 0.4 : alive === null ? 0.2 : 0));
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
  const aliveRank = a => (a === true ? 0 : a === null ? 1 : 2); // live → unknown → dead
  scored.sort((a, b) =>
    aliveRank(a.alive) !== aliveRank(b.alive) ? aliveRank(a.alive) - aliveRank(b.alive) : b.confidence - a.confidence
  );

  const candidates = scored.slice(0, MAX_CANDIDATES);

  console.log(
    `[find-new-url] ✓ "${name}" — ${candidates.length} candidates. ` +
    `Top: ${candidates[0]?.url} (alive: ${candidates[0]?.alive}, ` +
    `conf: ${candidates[0]?.confidence})`
  );

  return res.status(200).json({ candidates });
}
