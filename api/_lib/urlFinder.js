// api/_lib/urlFinder.js — Yojana Sahay · replacement-URL search (shared)
// ─────────────────────────────────────────────────────────────────────────────
// Used by /api/find-new-url (admin "Find New URL" button) AND by the
// autonomous URL Repair agent (_lib/urlRepairAgent.js), so both rank
// candidates identically.
//
//   findUrlCandidates({ name, ministry, oldUrl, state })
//     → { candidates: [{ url, title, domain, alive, httpStatus, confidence }],
//         searchError: string | null }
// ─────────────────────────────────────────────────────────────────────────────

import { recordAiCall } from "./firebaseAdmin.js";
import { logApiCallToHistory } from "./apiCallHistory.js";
import { isPublicHttpUrl, normalizeSchemeUrl } from "./urlTools.js";
import { pingUrlServer } from "../ping-url.js";

const SERPER_SEARCH  = "https://google.serper.dev/search";
const MAX_CANDIDATES = 5;

// 0.1–1.0 — how official the domain looks. .gov.in / .nic.in are the gold standard.
export function domainScore(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.endsWith(".gov.in"))       return 1.0;
    if (host.endsWith(".nic.in"))       return 0.9;
    if (host === "india.gov.in" || host.endsWith(".india.gov.in")) return 0.9;
    if (host.endsWith(".org.in"))       return 0.6;
    if (host.includes("gov"))           return 0.5;
    if (host.endsWith(".in"))           return 0.3;
    return 0.1;
  } catch {
    return 0;
  }
}

export function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

// "pmkisan.gov.in", "scholarships.gov.in", "example.com" — the part of the
// hostname a site owner controls (approximation good enough for Indian
// government sites: *.gov.in / *.nic.in / *.co.in / *.org.in keep 3 labels).
export function registrableDomain(url) {
  try {
    const parts = new URL(url).hostname.toLowerCase().replace(/^www\./, "").split(".");
    const twoLevelTld = /^(gov|nic|co|org|net|ac|edu|res|gen|firm|ind)$/.test(parts[parts.length - 2] ?? "")
      && parts[parts.length - 1] === "in";
    return parts.slice(twoLevelTld ? -3 : -2).join(".");
  } catch {
    return null;
  }
}

// Compare URLs ignoring protocol, "www.", trailing slash, query and case.
export function sameUrl(a, b) {
  const canon = u => String(u || "").trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[#?].*$/, "").replace(/\/+$/, "");
  return !!a && !!b && canon(a) === canon(b);
}

// Search results that can never be a scheme's apply page.
export const JUNK_HOSTS = /(^|\.)(youtube\.com|facebook\.com|twitter\.com|x\.com|instagram\.com|linkedin\.com|wikipedia\.org|quora\.com|reddit\.com|scribd\.com)$/i;

export async function serperSearch(query, serperKey, maxResults = 7, { type = "search" } = {}) {
  try {
    const res = await fetch(type === "news" ? "https://google.serper.dev/news" : SERPER_SEARCH, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": serperKey },
      body: JSON.stringify({ q: query, num: maxResults, gl: "in", hl: "en" }),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        const msg  = body?.message ?? body?.error ?? null;
        if (msg) detail = `HTTP ${res.status}: ${msg}`;
      } catch { /* not JSON */ }
      console.warn(`[urlFinder] Serper HTTP ${res.status} for query: ${query}`);
      return { results: [], error: { status: res.status, message: detail } };
    }

    const data = await res.json();
    recordAiCall({ service: "serper-verify" }).catch(() => {});
    logApiCallToHistory("serperCalls").catch(() => {});
    return {
      results: (type === "news" ? (data.news ?? []) : (data.organic ?? []))
        .map(r => ({ url: r.link?.trim() ?? "", title: r.title ?? "", snippet: r.snippet ?? "", date: r.date ?? null }))
        .filter(r => r.url),
      error: null,
    };
  } catch (err) {
    console.warn("[urlFinder] Serper search error:", err.message);
    return { results: [], error: { status: 0, message: err.message } };
  }
}

function describeSearchError(e) {
  if (e.status === 401 || e.status === 403) return "Serper API key invalid or out of credits — check SERPER_API_KEY in Vercel.";
  if (e.status === 429) return "Serper is rate-limiting requests — wait a bit and retry.";
  if (e.status >= 500)  return "Serper service is currently unavailable (server error).";
  if (e.status === 0)   return `Serper request failed: ${e.message}`;
  return `Serper error: ${e.message}`;
}

export async function findUrlCandidates({ name, ministry, oldUrl: rawOldUrl, state = "national" } = {}) {
  const serperKey = process.env.SERPER_API_KEY?.trim();
  if (!serperKey) {
    return { candidates: [], searchError: "No Serper key configured. Add SERPER_API_KEY in Vercel → Settings → Environment Variables.", config: true };
  }
  const oldUrl      = normalizeSchemeUrl(rawOldUrl) ?? rawOldUrl ?? null;
  const ministryStr = ministry ?? "";
  const stateStr    = state && state !== "national" ? ` ${state}` : "";

  const [q1, q2] = await Promise.all([
    serperSearch(`"${name}"${ministryStr ? ` "${ministryStr}"` : ""}${stateStr} India official apply`, serperKey, 7),
    serperSearch(`${name}${stateStr} India government scheme portal apply`, serperKey, 6),
  ]);

  const seen = new Set();
  const raw  = [];
  for (const r of [...q1.results, ...q2.results]) {
    if (!r.url || seen.has(r.url))  continue;
    if (sameUrl(r.url, oldUrl))     continue;
    if (!isPublicHttpUrl(r.url))    continue;
    try { if (JUNK_HOSTS.test(new URL(r.url).hostname)) continue; } catch { continue; }
    if (/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(r.url)) continue;
    seen.add(r.url);
    raw.push(r);
  }

  if (raw.length === 0) {
    const errors = [q1.error, q2.error].filter(Boolean);
    if (errors.length === 2) {
      const e = errors[0];
      return { candidates: [], searchError: describeSearchError(e), config: e.status === 401 || e.status === 403 };
    }
    return { candidates: [], searchError: null };
  }

  const pings = await Promise.all(raw.map(r => pingUrlServer(r.url).catch(() => ({ alive: null, httpStatus: 0 }))));

  // confidence = (domain quality × 0.6) + (alive bonus × 0.4)
  const scored = raw.map((r, i) => {
    const { alive, httpStatus } = pings[i];
    const ds   = domainScore(r.url);
    const conf = Math.min(1, ds * 0.6 + (alive === true ? 0.4 : alive === null ? 0.2 : 0));
    return {
      url: r.url, title: r.title, domain: extractDomain(r.url),
      alive, httpStatus, confidence: Math.round(conf * 100) / 100,
    };
  });

  const aliveRank = a => (a === true ? 0 : a === null ? 1 : 2);
  scored.sort((a, b) =>
    aliveRank(a.alive) !== aliveRank(b.alive) ? aliveRank(a.alive) - aliveRank(b.alive) : b.confidence - a.confidence
  );

  return { candidates: scored.slice(0, MAX_CANDIDATES), searchError: null };
}
