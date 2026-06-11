// api/verify-scheme.js — Yojana Sahay · Tier 2 AI Date Extraction
// ─────────────────────────────────────────────────────────────────────────────
//
// Called by verifySchemes.js → extractDateViaAI() for each priority scheme.
//
// Flow:
//   1. Receive POST { id, url, name, state, scope }
//   2. Fetch the live page via allorigins CORS proxy → get raw HTML
//   3. Strip tags → clean readable text (truncated to MAX_PAGE_CHARS)
//   4. Send to Groq with a tightly-scoped JSON-only extraction prompt
//   5. Return { lastDate: "YYYY-MM-DD" | null, isActive: bool | null, confidence: 0–1 }
//
// KEY ROTATION: identical to chat.js — up to 6 Groq keys, round-robin,
//               skip on 429.
//
// ERRORS: always return HTTP 200 with { error } field so verifySchemes.js
//         can handle them gracefully without crashing the run.
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_URL       = "https://api.groq.com/openai/v1/chat/completions";
const ALLORIGINS_GET = "https://api.allorigins.win/get?url=";
const MODEL          = "llama-3.3-70b-versatile";
const FETCH_TIMEOUT  = 12000;   // 12 s — gov sites are often slow
const MAX_PAGE_CHARS = 4000;    // truncate stripped text to keep tokens low


// ── Key loader (identical to chat.js) ────────────────────────────────────────

function loadKeys() {
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
        console.log(`[verify-scheme] ✓ Key #${i + 1} succeeded.`);
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

  console.error(`[verify-scheme] ✗ All ${keys.length} key(s) exhausted.`);
  return { status: 429, data: { error: { message: msg, details: lastError } } };
}


// ── Page fetcher + HTML stripper ──────────────────────────────────────────────
// Uses the same allorigins proxy as Tier 1 in verifySchemes.js.
// Returns { text, httpStatus, error }

async function fetchPageText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const proxyUrl = `${ALLORIGINS_GET}${encodeURIComponent(url)}`;
    const res      = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return { text: null, httpStatus: 0, error: `allorigins ${res.status}` };
    }

    const json       = await res.json();
    const httpStatus = json?.status?.http_code ?? 0;
    const raw        = json?.contents ?? "";

    if (!raw) {
      return { text: null, httpStatus, error: "empty page content" };
    }

    // Strip scripts + styles first (they contain the most noise), then all tags.
    const stripped = raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi,   " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_PAGE_CHARS);

    return { text: stripped, httpStatus, error: null };

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
// Tightly-scoped: JSON only, no explanation, near-zero temperature.

function buildPrompt(schemeName, state, pageText) {
  const systemPrompt =
    "You are a data extraction assistant for Indian government welfare schemes. " +
    "Read the webpage text and extract exactly two facts. " +
    "Respond ONLY with a valid JSON object — no explanation, no markdown fences. " +
    'Format: {"lastDate":"YYYY-MM-DD or null","isActive":true/false/null,"confidence":0.0-1.0}\n\n' +
    "Field rules:\n" +
    "  lastDate   — the application closing / last date to apply in YYYY-MM-DD format. " +
                   "null if no date found.\n" +
    "  isActive   — true if scheme is open/accepting applications, " +
                   "false if closed/expired/ended, null if unclear.\n" +
    "  confidence — your confidence in the extraction: " +
                   "1.0 = date/status found explicitly, " +
                   "0.5 = inferred from context, " +
                   "0.0 = no relevant information found.";

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

  // Keys
  const keys = loadKeys();
  if (keys.length === 0) {
    return res.status(500).json({
      error:
        "No Groq API keys configured. " +
        "Add GROQ_API_KEY in Vercel → Settings → Environment Variables, then redeploy.",
    });
  }

  // Input
  const { url, name, state = "national", scope } = req.body ?? {};

  if (!url || !name) {
    return res.status(400).json({ error: "Missing required fields: url, name" });
  }

  console.log(`[verify-scheme] Checking: "${name}" (${state}) → ${url}`);

  // ── Step 1: Fetch the live page ───────────────────────────────────────────
  const { text, httpStatus, error: fetchError } = await fetchPageText(url);

  // If page is dead (4xx/5xx) or unreachable, skip the AI call and return early.
  // isActive:false with confidence:0.7 for definite 4xx; null/0 for network issues.
  if (!text) {
    console.warn(`[verify-scheme] Page fetch failed for "${name}": ${fetchError}`);
    return res.status(200).json({
      lastDate:   null,
      isActive:   httpStatus >= 400 ? false : null,
      confidence: httpStatus >= 400 ? 0.7   : 0,
      error:      fetchError ?? "no page content",
    });
  }

  // ── Step 2: AI extraction ─────────────────────────────────────────────────
  const { systemPrompt, userPrompt } = buildPrompt(name, state, text);

  const { status: groqStatus, data: groqData } = await callGroq(keys, {
    model:       MODEL,
    max_tokens:  80,    // {"lastDate":"2026-03-31","isActive":true,"confidence":0.9} fits in ~25 tokens
    temperature: 0.1,   // near-deterministic — extraction, not generation
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
      error:      msg,
    });
  }

  // ── Step 3: Parse Groq's JSON reply ──────────────────────────────────────
  const raw = groqData?.choices?.[0]?.message?.content ?? "";

  let parsed = null;
  try {
    // Strip any accidental markdown fences before parsing
    const clean = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.warn(`[verify-scheme] JSON parse failed for "${name}". Raw:`, raw.slice(0, 200));
    return res.status(200).json({
      lastDate:   null,
      isActive:   null,
      confidence: 0,
      error:      "JSON parse failed — raw: " + raw.slice(0, 100),
    });
  }

  // ── Step 4: Sanitize + return ─────────────────────────────────────────────
  // Enforce correct types — never trust the model blindly.
  const result = {
    lastDate:
      typeof parsed.lastDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.lastDate)
        ? parsed.lastDate
        : null,
    isActive:
      typeof parsed.isActive === "boolean" ? parsed.isActive : null,
    confidence:
      typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0,
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
