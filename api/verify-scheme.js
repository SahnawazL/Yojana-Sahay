// api/verify-scheme.js — Yojana Sahay · Tier 2 AI Date Extraction
// ─────────────────────────────────────────────────────────────────────────────
//
// Called by verifySchemes.js → extractDateViaAI() for each priority scheme.
//
// Flow:
//   1. Receive POST { id, url, name, state, scope }  (admin-only — see _lib/adminAuth.js)
//   2. Fetch page content via Tavily Extract API (bypasses .gov.in IP blocks)
//   3. Strip tags → deadline-focused excerpt (buildPageExcerpt, MAX_PAGE_CHARS)
//   4. Send to Groq with a tightly-scoped JSON-only extraction prompt
//   5. Return { lastDate: "YYYY-MM-DD" | null, isActive: bool | null, confidence: 0–1,
//               httpStatus: number }   ← Fix 2: real page status (0/200/4xx/5xx)
//
// KEY ROTATION: identical to chat.js — up to 6 Groq keys, round-robin,
//               skip on 429.
//
// WHY TAVILY: Direct fetch from Vercel and allorigins.win proxy are both
//             blocked by .gov.in / .nic.in sites. Tavily has its own crawler
//             infrastructure that can access these pages reliably.
//
// ERRORS: always return HTTP 200 with { error } field so verifySchemes.js
//         can handle them gracefully without crashing the run.
// ─────────────────────────────────────────────────────────────────────────────

import { recordAiCall, getAdminDb } from "./_lib/firebaseAdmin.js";
import { getNextStartIdx } from "./_lib/groqRotation.js";
import { logApiCallToHistory } from "./_lib/apiCallHistory.js";
import { requireAdmin } from "./_lib/adminAuth.js";
import { isPublicHttpUrl } from "./_lib/urlTools.js";
import { checkTavilyBudget, noteTavilyCall } from "./_lib/tavilyBudget.js";

const GROQ_URL       = "https://api.groq.com/openai/v1/chat/completions";
const TAVILY_EXTRACT = "https://api.tavily.com/extract";
const MODEL          = "openai/gpt-oss-20b"; // migrated from llama-3.1-8b-instant (Groq deprecated it June 17, 2026) — sufficient for JSON extraction, free tier, 200K TPD
const FETCH_TIMEOUT  = 20000;   // 20 s — Tavily crawls slow .gov.in pages; 10 s timed out often
const MAX_PAGE_CHARS = 4000;    // text sent to Groq — keeps each call ~1.5K tokens (free tier is ~8K TPM per key)

// gpt-oss is a REASONING model: its hidden reasoning tokens count against the
// completion limit. The old max_tokens: 80 was used up by reasoning alone, so
// Groq returned an empty message and almost every scheme failed with
// "JSON parse failed". Low effort + a realistic ceiling fixes that.
const MAX_COMPLETION_TOKENS = 700;


// ── Key loader — dedicated Verify keys (separate from chat pool) ─────────────
// Uses GROQ_VERIFY_KEY_* env vars so SchemeVerifier batch runs never consume
// the chat pool's daily quota. Add these in Vercel → Settings → Environment
// Variables alongside the existing GROQ_API_KEY_* chat keys.
//
// Vercel env vars to add:
//   GROQ_VERIFY_KEY    — primary verify key  (required)
//   GROQ_VERIFY_KEY_1  — second verify key   (optional, recommended)
//
// Falls back to the shared GROQ_API_KEY pool only if no verify-specific
// keys are configured — so the app degrades gracefully during initial setup.

function loadGroqKeys() {
  const seen = new Set();
  const keys = [];

  // Dedicated verify keys — checked first
  const verifyCandidates = [
    process.env.GROQ_VERIFY_KEY,
    process.env.GROQ_VERIFY_KEY_1,
    process.env.GROQ_VERIFY_KEY_2,
  ];

  for (const k of verifyCandidates) {
    const t = k && k.trim();
    if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
  }

  // Fallback to shared chat pool if no verify keys configured yet
  if (keys.length === 0) {
    console.warn("[verify-scheme] No GROQ_VERIFY_KEY found — falling back to shared GROQ_API_KEY pool.");
    const fallback = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
      process.env.GROQ_API_KEY_5,
    ];
    for (const k of fallback) {
      const t = k && k.trim();
      if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
    }
  }

  return keys;
}


export function getVerifyKeyCount() {
  return loadGroqKeys().length;
}

// ── Detect key/account-level failures (vs. request-specific failures) ───────
// Same key is broken for ANY request — skip to the next one, same as a 429.
function isKeyLevelFailure(status, errData) {
  if (status === 401) return true;
  const code = errData?.error?.code;
  return code === "organization_restricted" || code === "invalid_api_key";
}

// ── Groq caller with key rotation (now uses shared KV counter via getNextStartIdx) ──

async function callGroq(keys, bodyObject) {
  let lastError = null;
  let count429  = 0; // how many keys 429'd before a success (or before exhaustion)
  const failedKeys = []; // REAL indices of the keys that 429'd — the old telemetry assumed 0..count429-1
  const n = keys.length;
  const startIdx = await getNextStartIdx(n); // shared KV counter — spreads load across all Vercel instances

  for (let offset = 0; offset < n; offset++) {
    const i   = (startIdx + offset) % n;
    const key = keys[i];
    try {
      const res = await fetch(GROQ_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify(bodyObject),
      });

      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        lastError = errData;
        count429++;
        failedKeys.push(i);
        console.warn(`[verify-scheme] Key #${i + 1} → 429. Trying next key…`);
        continue;
      }

      const data = await res.json();

      if (isKeyLevelFailure(res.status, data)) {
        lastError = data;
        console.warn(
          `[verify-scheme] Key #${i + 1} → ${data?.error?.code || res.status} ` +
          `(key-level failure). Trying next key…`
        );
        continue;
      }

      if (res.status === 200) {
        console.log(`[verify-scheme] ✓ Groq Key #${i + 1} succeeded.`);
      } else {
        console.error(
          `[verify-scheme] Groq error ${res.status} on Key #${i + 1}:`,
          JSON.stringify(data).slice(0, 200)
        );
      }
      return { status: res.status, data, keyIdx: i, count429, failedKeys };

    } catch (err) {
      console.error(`[verify-scheme] Network error on Key #${i + 1}:`, err.message);
      lastError = { message: err.message };
    }
  }

  const allRateLimited = count429 === n;
  const msg = allRateLimited
    ? (n > 1 ? `All ${n} Groq verify keys are rate-limited. Try again in a minute.` : "Groq verify key is rate-limited. Try again in a minute.")
    : `Groq verify key(s) unavailable (invalid, restricted or unreachable): ${lastError?.error?.message ?? lastError?.message ?? "unknown error"}`;

  console.error(`[verify-scheme] ✗ All ${keys.length} Groq key(s) exhausted.`);
  return { status: 429, data: { error: { message: msg, details: lastError } }, keyIdx: -1, count429, failedKeys, rateLimited: count429 > 0 };
}


// ── Extract an HTTP status code from a Tavily failure message ────────────────
// Tavily's failed_results[].error is a free-text string (Tavily doesn't give a
// structured status code for the *target* page). When the target itself
// returned 404/403/5xx, that code is often embedded in the message
// (e.g. "...404 Client Error...", "...status code: 403..."). Best-effort
// regex pull so Tier 2 can surface real codes even when Tier 1's direct ping
// timed out / was blocked and returned 0. If nothing 4xx/5xx-shaped is found,
// returns 0 (unknown).
function extractHttpStatusFromError(message) {
  if (!message) return 0;
  // Only trust a code that is clearly labelled as one ("status 404",
  // "HTTP 503", "404 Client Error") — not any 3-digit number in the text.
  const match =
    message.match(/(?:status(?:\s*code)?|http|response)\s*[:=]?\s*([45]\d{2})\b/i) ||
    message.match(/\b([45]\d{2})\s+(?:client|server)\s+error/i) ||
    message.match(/\b(404|410|403|500|502|503|504)\b\s*(?:not found|gone|forbidden|internal|bad gateway|service unavailable|gateway timeout)/i);
  return match ? Number(match[1]) : 0;
}




// ── Page text → compact, deadline-focused excerpt ───────────────────────────
// The old code kept only the first 4000 characters of the page, which on most
// portals is navigation menus — the "Last date" line further down was cut
// off, so the AI reported "no deadline" and the stale date got wiped. Now we
// keep the top of the page (scheme title / intro) plus windows around every
// date-ish keyword, within the same token budget.
const DATE_KEYWORDS = /(last\s*date|deadline|closing\s*date|apply\s*(?:before|by|till|until)|application\s*(?:period|window|closes?|ends?)|due\s*date|extended|portal\s*(?:is\s*)?(?:open|closed)|applications?\s*(?:are\s*)?(?:open|closed|invited)|अंतिम\s*तिथि|अंतिम\s*तारीख|आवेदन\s*की\s*तिथि)/gi;

export function buildPageExcerpt(rawText, maxChars = MAX_PAGE_CHARS) {
  const text = String(rawText || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi,   " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")        // markdown images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")      // markdown links → their text
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxChars) return text;

  const head = text.slice(0, Math.floor(maxChars * 0.35));
  const windows = [];
  const WIN = 260;
  DATE_KEYWORDS.lastIndex = 0;
  let m;
  while ((m = DATE_KEYWORDS.exec(text)) !== null) {
    const from = Math.max(0, m.index - WIN);
    const to   = Math.min(text.length, m.index + m[0].length + WIN);
    const last = windows[windows.length - 1];
    if (last && from <= last[1]) last[1] = Math.max(last[1], to);
    else windows.push([from, to]);
    if (windows.length > 12) break;
  }

  let out = head;
  for (const [from, to] of windows) {
    if (to <= head.length) continue;
    const chunk = text.slice(Math.max(from, head.length), to);
    if (out.length + chunk.length + 5 > maxChars) break;
    out += " … " + chunk;
  }
  if (windows.length === 0) return text.slice(0, maxChars); // no keywords → plain top-of-page
  // Fill any leftover budget with more of the page so context isn't lost.
  if (out.length < maxChars - 200) {
    const rest = text.slice(head.length, head.length + (maxChars - out.length - 5));
    if (!out.includes(rest.slice(0, 40))) out += " … " + rest;
  }
  return out.slice(0, maxChars);
}

function isRealDate(ymd) {
  if (typeof ymd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== ymd) return false;
  const year = d.getUTCFullYear();
  return year >= 2015 && year <= new Date().getUTCFullYear() + 5;
}


// ── Page fetcher via Tavily Extract ──────────────────────────────────────────
// Tavily's crawler bypasses the IP blocks that stop direct Vercel → .gov.in
// fetches. Returns { text, httpStatus, error, billed }.
//   billed — true when Tavily actually extracted the page (failed URLs are
//            not charged by Tavily, so they don't count against the budget).

async function fetchPageText(url, tavilyKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(TAVILY_EXTRACT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  controller.signal,
      body: JSON.stringify({ api_key: tavilyKey, urls: [url] }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = body?.detail?.error || body?.detail || body?.error || "";
      const hint =
        res.status === 401 ? " (Tavily key invalid — check TAVILY_VERIFY_KEY)" :
        res.status === 429 ? " (Tavily rate limit)" :
        res.status === 432 || res.status === 433 ? " (Tavily plan/credit limit reached)" : "";
      return { text: null, httpStatus: 0, billed: false, serviceError: true,
               error: `Tavily HTTP ${res.status}${hint}${detail ? `: ${String(detail).slice(0, 120)}` : ""}` };
    }

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) {
      const failed = data.failed_results?.[0];
      const errMsg = failed?.error ?? "Tavily: no result returned";
      return { text: null, httpStatus: extractHttpStatusFromError(errMsg), billed: false, error: errMsg };
    }

    const excerpt = buildPageExcerpt(result.raw_content ?? "");
    if (!excerpt) {
      return { text: null, httpStatus: 200, billed: true, error: "page has no readable text" };
    }
    return { text: excerpt, httpStatus: 200, billed: true, error: null };

  } catch (err) {
    clearTimeout(timer);
    return {
      text: null, httpStatus: 0, billed: false,
      error: err.name === "AbortError" ? "Tavily timeout" : err.message,
    };
  }
}


// ── Groq prompt builder ───────────────────────────────────────────────────────

function buildPrompt(schemeName, state, pageText) {
  const today = new Date().toISOString().slice(0, 10);
  const systemPrompt =
    "You extract facts about Indian government welfare schemes from webpage text. " +
    "Respond ONLY with a JSON object: " +
    '{"lastDate":"YYYY-MM-DD" or null,"isActive":true|false|null,"confidence":0.0-1.0}\n' +
    `Today is ${today}.\n` +
    "lastDate — the CURRENT application closing / last date to apply for THIS scheme, as YYYY-MM-DD. " +
    "Ignore dates of news items, notifications, circulars, copyright footers and other schemes. " +
    "If several cycles are listed, use the latest one. null if no closing date is stated.\n" +
    "isActive — true ONLY if the text clearly says applications are currently open; " +
    "false ONLY if it clearly says the scheme or its applications are closed, discontinued or expired; " +
    "otherwise null. Do NOT return false just because the page does not say 'open'.\n" +
    "confidence — 1.0 if the date/status is stated explicitly, 0.5 if inferred, 0.0 if nothing relevant " +
    "(then isActive MUST be null).";

  const userPrompt =
    `Scheme: ${schemeName}\n` +
    `State / Scope: ${state}\n\n` +
    `Webpage text:\n${pageText}`;

  return { systemPrompt, userPrompt };
}

function parseModelJson(raw) {
  const clean = String(raw || "").replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch { /* fall through */ }
  const m = clean.match(/\{[\s\S]*\}/); // tolerate stray text around the object
  if (m) { try { return JSON.parse(m[0]); } catch { /* ignore */ } }
  return null;
}


// ── Core verification ────────────────────────────────────────────────────────
// verifySchemeCore() is called two ways: (1) over HTTP by the handler below
// (admin "Verify Now" / browser bulk verifier) and (2) in-process by the
// background rotating batch in _lib/schemeVerifyBatch.js.
//
// Returns { lastDate, isActive, confidence, httpStatus, error, errorKind }
//   errorKind — null on success, otherwise one of:
//     "config"       missing keys / env — retrying won't help
//     "budget"       monthly Tavily budget reached — stop Tier 2 runs
//     "rate_limit"   Groq keys rate-limited — back off and retry later
//     "page"         the scheme page couldn't be fetched / read
//     "ai"           Groq replied but the reply was unusable
//   Callers must treat lastDate/isActive as "no new information" whenever
//   errorKind is set — never as "the deadline was removed".
export async function verifySchemeCore({ url, name, state = "national", budgetLimit } = {}) {
  const fail = (error, errorKind, httpStatus = 0) =>
    ({ lastDate: null, isActive: null, confidence: 0, httpStatus, error, errorKind });

  const groqKeys = loadGroqKeys();
  if (groqKeys.length === 0) {
    return fail("No Groq API keys configured. Add GROQ_VERIFY_KEY in Vercel → Settings → Environment Variables, then redeploy.", "config");
  }

  const tavilyKey = (process.env.TAVILY_VERIFY_KEY ?? process.env.TAVILY_API_KEY)?.trim();
  if (!tavilyKey) {
    return fail("No Tavily API key configured. Add TAVILY_VERIFY_KEY (or TAVILY_API_KEY) in Vercel → Settings → Environment Variables, then redeploy.", "config");
  }

  if (!url || !name) return fail("Missing required fields: url, name", "config");
  if (!isPublicHttpUrl(url)) return fail(`Not a valid public http(s) URL: ${String(url).slice(0, 80)}`, "page");

  const budget = await checkTavilyBudget(getAdminDb(), budgetLimit);
  if (!budget.ok) {
    return fail(`Monthly Tavily budget reached (${budget.used}/${budget.limit} extract calls this month). Tier 2 checks resume on the 1st.`, "budget");
  }

  console.log(`[verify-scheme] Checking: "${name}" (${state}) → ${url}`);

  // ── Step 1: Fetch page via Tavily Extract ─────────────────────────────────
  const page = await fetchPageText(url, tavilyKey);
  if (page.billed) {
    noteTavilyCall();
    recordAiCall({ service: "tavily-verify" }).catch(() => {});
    logApiCallToHistory("tavilyVerifyCalls").catch(() => {});
  }

  if (!page.text) {
    console.warn(`[verify-scheme] Page fetch failed for "${name}": ${page.error}`);
    // A 404/5xx page says the LINK is broken, not that the scheme closed —
    // so isActive stays null (the old code returned isActive:false, which
    // made the public site show "Apply Closed" for every broken link).
    return fail(page.error ?? "no page content", page.serviceError ? "config" : "page", page.httpStatus);
  }

  // ── Step 2: AI extraction ─────────────────────────────────────────────────
  const { systemPrompt, userPrompt } = buildPrompt(name, state, page.text);

  const groq = await callGroq(groqKeys, {
    model:                 MODEL,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    reasoning_effort:      "low",
    temperature:           0.1,
    response_format:       { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
  });

  recordAiCall({
    service:   "groq-verify",
    keyIdx:    groq.status === 200 ? groq.keyIdx : -1,
    count429:  groq.count429,
    failedKeys: groq.failedKeys,
  }).catch(() => {});

  if (groq.status !== 200) {
    const msg = groq.data?.error?.message ?? `Groq error ${groq.status}`;
    console.error(`[verify-scheme] Groq failed for "${name}":`, msg);
    return fail(msg, groq.rateLimited || groq.status === 429 ? "rate_limit" : "ai", page.httpStatus);
  }
  logApiCallToHistory("groqVerifyCalls").catch(() => {});

  // ── Step 3: Parse Groq's JSON reply ──────────────────────────────────────
  const choice = groq.data?.choices?.[0];
  const raw    = choice?.message?.content ?? "";
  const parsed = parseModelJson(raw);
  if (!parsed || typeof parsed !== "object") {
    const why = !raw && choice?.finish_reason === "length"
      ? "model ran out of tokens before answering"
      : `unreadable reply: ${raw.slice(0, 80) || "(empty)"}`;
    console.warn(`[verify-scheme] JSON parse failed for "${name}" — ${why}`);
    return fail(`AI ${why}`, "ai", page.httpStatus);
  }

  // ── Step 4: Sanitize + return ─────────────────────────────────────────────
  const confidence = typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
    ? Math.min(1, Math.max(0, parsed.confidence))
    : 0;

  let isActive = typeof parsed.isActive === "boolean" ? parsed.isActive : null;
  // Enforce "confidence 0 → isActive null" in code; models don't always obey.
  if (isActive !== null && confidence < 0.3) isActive = null;

  const result = {
    lastDate:   isRealDate(parsed.lastDate) ? parsed.lastDate : null,
    isActive,
    confidence,
    httpStatus: page.httpStatus,
    error:      null,
    errorKind:  null,
  };

  console.log(
    `[verify-scheme] ✓ "${name}" → lastDate: ${result.lastDate ?? "none"}, ` +
    `isActive: ${result.isActive ?? "unclear"}, confidence: ${result.confidence}`
  );
  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req, res, "verify");
  if (!auth) return;

  const { url, name, state = "national" } = req.body ?? {};
  if (!url || !name) {
    return res.status(400).json({ error: "Missing required fields: url, name" });
  }

  try {
    const result = await verifySchemeCore({ url, name, state });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[verify-scheme] unexpected failure:", err);
    return res.status(200).json({
      lastDate: null, isActive: null, confidence: 0, httpStatus: 0,
      error: `Server error: ${err.message}`, errorKind: "ai",
    });
  }
}
