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
//   1. Receive POST { url: "https://pmkisan.gov.in" }
//   2. Send HEAD request from Vercel server directly to the URL
//      (HEAD is faster — no body download; falls back to GET if server rejects HEAD)
//   3. Return { httpStatus, alive, error }
//
// ERRORS: always return HTTP 200 with { error } so verifySchemes.js can
//         handle them gracefully without crashing the run.
// ─────────────────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 10000; // 10 s — gov sites are often slow

// Mimic a real browser to avoid bot-detection blocks on some portals
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";


export default async function handler(req, res) {

  // ── Only POST ─────────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body ?? {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid url field" });
  }

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // ── Step 1: Try HEAD (faster — no body transfer) ──────────────────────
    let response = await fetch(url, {
      method:  "HEAD",
      signal:  controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });

    // ── Step 2: Some servers reject HEAD with 405 — retry as GET ─────────
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method:  "GET",
        signal:  controller.signal,
        headers: { "User-Agent": USER_AGENT },
        redirect: "follow",
      });
    }

    clearTimeout(timer);

    const httpStatus = response.status;
    console.log(`[ping-url] ${url} → HTTP ${httpStatus}`);

    return res.status(200).json({
      httpStatus,
      alive: httpStatus >= 200 && httpStatus < 400,
      error: null,
    });

  } catch (err) {
    clearTimeout(timer);

    const isTimeout = err.name === "AbortError";
    console.warn(`[ping-url] ${url} → ${isTimeout ? "timeout" : err.message}`);

    return res.status(200).json({
      httpStatus: 0,
      alive:      false,
      error:      isTimeout ? "timeout" : err.message,
    });
  }
}
