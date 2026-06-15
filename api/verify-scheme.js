// api/verify-scheme.js — Yojana Sahay · Tier 2 AI Date Extraction
// ─────────────────────────────────────────────────────────────────────────────
//
// Called by verifySchemes.js → extractDateViaAI() for each priority scheme.
//
// Flow:
//   1. Receive POST { id, url, name, state, scope }
//   2. Fetch page content via Tavily Extract API (bypasses .gov.in IP blocks)
//   3. Strip tags → clean readable text (truncated to MAX_PAGE_CHARS)
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

const GROQ_URL       = "https://api.groq.com/openai/v1/chat/completions";
const TAVILY_EXTRACT = "https://api.tavily.com/extract";
const MODEL          = "llama-3.3-70b-versatile";
const FETCH_TIMEOUT  = 10000;   // 10 s — Tavily is fast but allow some headroom
const MAX_PAGE_CHARS = 4000;    // truncate stripped text to keep tokens low


// ── Key loader — Groq (identical to chat.js) ──────────────────────────────────

function loadGroqKeys() {
  const seen = new Set();
  const keys = [];
  const candidates = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ];
  for (const k of candidates) {
    const t = k && k.trim();
    if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
  }
  return keys;
}


// ── Groq caller with key rotation (identical to chat.js) ─────────────────────

async function callGroq(keys, bodyObject) {
  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
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
        console.warn(`[verify-scheme] Key #${i + 1} → 429. Trying next key…`);
        continue;
      }

      const data = await res.json();
      if (res.status === 200) {
        console.log(`[verify-scheme] ✓ Groq Key #${i + 1} succeeded.`);
      } else {
        console.error(
          `[verify-scheme] Groq error ${res.status} on Key #${i + 1}:`,
          JSON.stringify(data).slice(0, 200)
        );
      }
      return { status: res.status, data };

    } catch (err) {
      console.error(`[verify-scheme] Network error on Key #${i + 1}:`, err.message);
      lastError = { message: err.message };
    }
  }

  const msg = keys.length > 1
    ? `All ${keys.length} Groq keys are rate-limited. Try again later.`
    : "Groq key is rate-limited. Try again later.";

  console.error(`[verify-scheme] ✗ All ${keys.length} Groq key(s) exhausted.`);
  return { status: 429, data: { error: { message: msg, details: lastError } } };
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
  const match = message.match(/\b([45]\d{2})\b/);
  return match ? Number(match[1]) : 0;
}


// ── Page fetcher via Tavily Extract ──────────────────────────────────────────
// Tavily's crawler bypasses the IP blocks that stop direct Vercel → .gov.in
// and allorigins → .gov.in fetches.
// Returns { text, httpStatus, error }

async function fetchPageText(url, tavilyKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(TAVILY_EXTRACT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  controller.signal,
      body: JSON.stringify({
        api_key: tavilyKey,
        urls:    [url],
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { text: null, httpStatus: 0, error: `Tavily HTTP ${res.status}` };
    }

    const data = await res.json();

    // Tavily returns results[] for successes and failed_results[] for failures
    const result = data.results?.[0];
    if (!result) {
      const failed = data.failed_results?.[0];
      const errMsg = failed?.error ?? "Tavily: no result returned";
      return {
        text:       null,
        // Fix 2: pull a real 404/403/5xx out of the message when present,
        // so it can land in schemes-meta.json instead of a bare 0.
        httpStatus: extractHttpStatusFromError(errMsg),
        error:      errMsg,
      };
    }

    const raw = result.raw_content ?? "";
    if (!raw) {
      return { text: null, httpStatus: 200, error: "empty page content" };
    }

    // Strip scripts + styles first (most noise), then all remaining tags.
    const stripped = raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi,   " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_PAGE_CHARS);

    if (!stripped) {
      return { text: null, httpStatus: 200, error: "empty after strip" };
    }

    return { text: stripped, httpStatus: 200, error: null };

  } catch (err) {
    clearTimeout(timer);
    return {
      text:       null,
      httpStatus: 0,
      error:      err.name === "AbortError" ? "timeout" : err.message,
    };
  }
}


// ── Groq prompt builder ───────────────────────────────────────────────────────

function buildPrompt(schemeName, state, pageText) {
  const systemPrompt =
    "You are a data extraction assistant for Indian government welfare schemes. " +
    "Read the webpage text and extract exactly two facts. " +
    "Respond ONLY with a valid JSON object — no explanation, no markdown fences. " +
    'Format: {"lastDate":"YYYY-MM-DD or null","isActive":true/false/null,"confidence":0.0-1.0}\n\n' +
    "Field rules:\n" +
    "  lastDate   — the application closing / last date to apply in YYYY-MM-DD format. " +
                   "null if no date found.\n" +
    "  isActive   — true ONLY if the page explicitly states the scheme is open or " +
                   "currently accepting applications. " +
                   "false ONLY if the page explicitly states the scheme is closed, " +
                   "discontinued, expired, or no longer accepting applications. " +
                   "null if the page has no clear open/closed statement, or if you are unsure. " +
                   "CRITICAL: Do NOT return false just because the page does not say 'open'. " +
                   "Most government scheme pages are informational and do not state status — " +
                   "in that case return null. " +
                   "If confidence is 0.0, isActive MUST be null.\n" +
    "  confidence — your confidence in the extraction: " +
                   "1.0 = date/status found explicitly in the text, " +
                   "0.5 = inferred from context (e.g. deadline mentioned), " +
                   "0.0 = no relevant information found — isActive must be null in this case.";

  const userPrompt =
    `Scheme: ${schemeName}\n` +
    `State / Scope: ${state}\n\n` +
    `Webpage text:\n${pageText}`;

  return { systemPrompt, userPrompt };
}


// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Groq keys
  const groqKeys = loadGroqKeys();
  if (groqKeys.length === 0) {
    return res.status(500).json({
      error:
        "No Groq API keys configured. " +
        "Add GROQ_API_KEY in Vercel → Settings → Environment Variables, then redeploy.",
    });
  }

  // Tavily key
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  if (!tavilyKey) {
    return res.status(500).json({
      error:
        "No Tavily API key configured. " +
        "Add TAVILY_API_KEY in Vercel → Settings → Environment Variables, then redeploy.",
    });
  }

  // Input
  const { url, name, state = "national", scope } = req.body ?? {};

  if (!url || !name) {
    return res.status(400).json({ error: "Missing required fields: url, name" });
  }

  console.log(`[verify-scheme] Checking: "${name}" (${state}) → ${url}`);

  // ── Step 1: Fetch page via Tavily Extract ─────────────────────────────────
  const { text, httpStatus, error: fetchError } = await fetchPageText(url, tavilyKey);

  // If page is dead or unreachable, skip the AI call and return early.
  if (!text) {
    console.warn(`[verify-scheme] Page fetch failed for "${name}": ${fetchError}`);
    return res.status(200).json({
      lastDate:   null,
      isActive:   httpStatus >= 400 ? false : null,
      confidence: httpStatus >= 400 ? 0.7   : 0,
      httpStatus, // Fix 2: real 404/403/5xx (or 0 if unknown) for schemes-meta.json
      error:      fetchError ?? "no page content",
    });
  }

  // ── Step 2: AI extraction ─────────────────────────────────────────────────
  const { systemPrompt, userPrompt } = buildPrompt(name, state, text);

  const { status: groqStatus, data: groqData } = await callGroq(groqKeys, {
    model:           MODEL,
    max_tokens:      80,   // full JSON response fits in ~25 tokens
    temperature:     0.1,  // near-deterministic — extraction, not generation
    response_format: { type: "json_object" }, // guarantees valid JSON
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
  });

  if (groqStatus !== 200) {
    const msg = groqData?.error?.message ?? `Groq error ${groqStatus}`;
    console.error(`[verify-scheme] Groq failed for "${name}":`, msg);
    return res.status(200).json({
      lastDate:   null,
      isActive:   null,
      confidence: 0,
      httpStatus, // page fetched fine (we got `text`); this is its real status
      error:      msg,
    });
  }

  // ── Step 3: Parse Groq's JSON reply ──────────────────────────────────────
  const raw = groqData?.choices?.[0]?.message?.content ?? "";

  let parsed = null;
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.warn(`[verify-scheme] JSON parse failed for "${name}". Raw:`, raw.slice(0, 200));
    return res.status(200).json({
      lastDate:   null,
      isActive:   null,
      confidence: 0,
      httpStatus, // page fetched fine (we got `text`); this is its real status
      error:      "JSON parse failed — raw: " + raw.slice(0, 100),
    });
  }

  // ── Step 4: Sanitize + return ─────────────────────────────────────────────
  const confidence =
    typeof parsed.confidence === "number"
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0;

  // Raw isActive from the model
  let isActive = typeof parsed.isActive === "boolean" ? parsed.isActive : null;

  // Safety guard — if the model found no relevant information (confidence < 0.3)
  // a "false" is just the model's default bias, not a real signal. Treat as null
  // so we never wrongly mark a live scheme as closed due to an uninformative page.
  if (isActive === false && confidence < 0.3) {
    console.warn(
      `[verify-scheme] "${name}" → confidence=${confidence} too low to trust isActive=false; overriding to null`
    );
    isActive = null;
  }

  const result = {
    lastDate:
      typeof parsed.lastDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.lastDate)
        ? parsed.lastDate
        : null,
    isActive,
    confidence,
    httpStatus, // Fix 2: page's real HTTP status (200 here, since extraction succeeded)
    error: null,
  };

  console.log(
    `[verify-scheme] ✓ "${name}" → ` +
    `lastDate: ${result.lastDate ?? "none"}, ` +
    `isActive: ${result.isActive ?? "unclear"}, ` +
    `confidence: ${result.confidence}`
  );

  return res.status(200).json(result);
}
