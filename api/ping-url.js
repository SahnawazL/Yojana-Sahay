// api/ping-url.js — Yojana Sahay · Tier 1 URL Health Check
// ─────────────────────────────────────────────────────────────────────────────
//
// Called by verifySchemes.js → pingUrl() for every scheme in a Tier 1 run.
//
// Why this exists:
//   Browser → allorigins.win proxy → .gov.in  =  BLOCKED (proxy IPs blacklisted)
//   Browser → /api/ping-url (Vercel) → .gov.in  =  WORKS  (server-to-server)
//
// Flow:
//   1. Receive POST { url: "https://pmkisan.gov.in" }   (admin-only)
//   2. HEAD request from the Vercel server (falls back to GET when the server
//      rejects HEAD or answers HEAD with an error code)
//   3. Return { httpStatus, alive, error }
//        alive: true  — 2xx/3xx, or 401/403/429 (server is up, just blocking bots)
//        alive: false — definitive failure: 404/410/5xx-after-GET, DNS miss, refused
//        alive: null  — inconclusive: timeout / connection reset. Slow or
//                       geo-blocking government servers are NOT dead links.
//
// ERRORS: always HTTP 200 with { error } so the verifier never crashes.
// ─────────────────────────────────────────────────────────────────────────────

import { requireAdmin } from "./_lib/adminAuth.js";
import { isPublicHttpUrl, classifyFetchError } from "./_lib/urlTools.js";

const FETCH_TIMEOUT_MS = 10000; // 10 s per attempt — gov sites are often slow

// Mimic a real browser to avoid bot-detection blocks on some portals
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";

async function attempt(url, method) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      signal:   controller.signal,
      redirect: "follow",
      headers:  {
        "User-Agent":      USER_AGENT,
        "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
      },
    });
    // Never download the body — we only need the status code.
    try { await res.body?.cancel(); } catch { /* ignore */ }
    return { status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

export function classifyStatus(httpStatus) {
  if (httpStatus >= 200 && httpStatus < 400) return { alive: true,  error: null };
  if (httpStatus === 401 || httpStatus === 403 || httpStatus === 429) {
    return { alive: true, error: null, note: `${httpStatus} — server is up but blocks automated requests` };
  }
  return { alive: false, error: `HTTP ${httpStatus}` };
}

export async function pingUrlServer(url) {
  try {
    let { status } = await attempt(url, "HEAD");

    // Many government servers mis-handle HEAD (405/501, or a bogus 404/5xx/403)
    // while serving GET fine — confirm any non-success with a real GET.
    if (status >= 400) {
      try {
        ({ status } = await attempt(url, "GET"));
      } catch { /* keep the HEAD status */ }
    }

    return { httpStatus: status, ...classifyStatus(status) };
  } catch (err) {
    const { definitive, message } = classifyFetchError(err);
    return { httpStatus: 0, alive: definitive ? false : null, error: message };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  const { url } = req.body ?? {};
  if (!url || typeof url !== "string" || !isPublicHttpUrl(url.trim())) {
    return res.status(400).json({ error: "Missing or invalid url field (must be a public http(s) URL)" });
  }

  const result = await pingUrlServer(url.trim());
  console.log(`[ping-url] ${url} → ${result.httpStatus || result.error} (alive: ${result.alive})`);
  return res.status(200).json(result);
}
