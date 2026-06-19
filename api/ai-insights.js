// api/ai-insights.js — Yojana Sahay Admin Dashboard · AI Smart Insights
// ─────────────────────────────────────────────────────────────────────────────
//
// Proxies AI insight requests from SmartInsightsPanel (SchemeVerifier.jsx) to
// the Groq API server-side — direct browser → api.groq.com calls are blocked
// by CORS, same reason all AI calls in this project go through Vercel functions.
//
// POST  { prompt: string }
// → 200 { text: string }        ← raw JSON string from the AI (parsed by caller)
// → 400 { error: string }       ← missing prompt
// → 500 { error: string }       ← Groq failure or env var missing
//
// Uses the same GROQ_API_KEY env var (and numbered fallbacks GROQ_API_KEY_1,
// GROQ_API_KEY_2, ...) as chat.js and verify-scheme.js.
//
// Model: llama-3.3-70b-versatile — best JSON adherence in Groq's lineup.
// Temperature 0.2 — low randomness for deterministic structured output.
// max_tokens 800 — enough for the 4-field JSON shape SmartInsightsPanel expects.
//
// ─────────────────────────────────────────────────────────────────────────────

import { recordAiCall } from "./_lib/firebaseAdmin.js";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL         = "llama-3.3-70b-versatile";
const MAX_TOKENS    = 800;
const TEMPERATURE   = 0.2;

// ── Load ALL Groq keys (identical to chat.js) ────────────────────────────────
// Deduplicates, preserves order. Returns empty array if none configured.
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

// ── Detect key/account-level failures (vs. request-specific failures) ───────
// Same key is broken for ANY request — skip to the next one, same as a 429.
function isKeyLevelFailure(status, errData) {
  if (status === 401) return true;
  const code = errData?.error?.code;
  return code === "organization_restricted" || code === "invalid_api_key";
}

// ── Call Groq with key rotation (identical to chat.js) ───────────────────────
// Tries each key in order; skips on 429. Returns { status, data }.
async function callGroq(keys, bodyObject) {
  let lastError = null;
  let count429  = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const groqRes = await fetch(GROQ_ENDPOINT, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify(bodyObject),
      });

      if (groqRes.status === 429) {
        const errData = await groqRes.json().catch(() => ({}));
        lastError = errData;
        count429++;
        console.warn(`[ai-insights] Key #${i + 1} → 429 rate limited. Trying next key…`);
        continue;
      }

      const data = await groqRes.json();

      if (isKeyLevelFailure(groqRes.status, data)) {
        lastError = data;
        console.warn(
          `[ai-insights] Key #${i + 1} → ${data?.error?.code || groqRes.status} ` +
          `(key-level failure). Trying next key…`
        );
        continue;
      }

      if (groqRes.status === 200) {
        console.log(`[ai-insights] ✓ Key #${i + 1} succeeded.`);
      } else {
        console.error(`[ai-insights] Groq error ${groqRes.status} on Key #${i + 1}:`,
          JSON.stringify(data).slice(0, 200));
      }
      return { status: groqRes.status, data, keyIdx: i, count429 };

    } catch (err) {
      console.error(`[ai-insights] Network error on Key #${i + 1}:`, err.message);
      lastError = { message: err.message };
    }
  }

  const msg = keys.length > 1
    ? `All ${keys.length} Groq keys are rate-limited. Try again in a moment.`
    : "Groq key is rate-limited. Try again in a moment.";
  console.error(`[ai-insights] ✗ All ${keys.length} key(s) exhausted.`);
  return { status: 429, data: { error: { message: msg, details: lastError } }, keyIdx: -1, count429 };
}

export default async function handler(req, res) {
  // ── Method guard ───────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
    return res.status(400).json({ error: "Missing or invalid 'prompt' in request body." });
  }

  // ── Load all Groq keys ─────────────────────────────────────────────────────
  const keys = loadGroqKeys();
  if (keys.length === 0) {
    return res.status(500).json({
      error: "No Groq API key configured. Add GROQ_API_KEY to Vercel → Environment Variables.",
    });
  }

  // ── Call Groq with key rotation ────────────────────────────────────────────
  try {
    const { status, data, keyIdx, count429 } = await callGroq(keys, {
      model:       MODEL,
      max_tokens:  MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role:    "system",
          content: "You are a data analyst specialising in Indian government scheme compliance. Respond only with a valid JSON object — no markdown, no backticks, no explanation before or after.",
        },
        {
          role:    "user",
          content: prompt.trim(),
        },
      ],
    });

    if (status !== 200) {
      const msg = data?.error?.message || `Groq HTTP ${status}`;
      console.error("[ai-insights] Groq error:", msg);
      recordAiCall({ service: "groq", keyIdx: -1, count429 }).catch(() => {});
      return res.status(status === 429 ? 429 : 502).json({ error: `Groq API error: ${msg}` });
    }

    recordAiCall({ service: "groq", keyIdx, count429 }).catch(() => {}); // Groq call above returned 200

    const text = data?.choices?.[0]?.message?.content ?? "";

    if (!text) {
      return res.status(502).json({ error: "Groq returned an empty response." });
    }

    // Strip any accidental markdown fences before returning to the client
    const cleaned = text.replace(/```json|```/g, "").trim();

    return res.status(200).json({ text: cleaned });

  } catch (err) {
    console.error("[ai-insights] Unexpected error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
}
