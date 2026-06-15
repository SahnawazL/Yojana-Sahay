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

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL         = "llama-3.3-70b-versatile";
const MAX_TOKENS    = 800;
const TEMPERATURE   = 0.2;

/**
 * Pick a Groq API key from env vars.
 * Tries GROQ_API_KEY first, then GROQ_API_KEY_1, GROQ_API_KEY_2 … up to 5.
 * Returns null if none are set — caller returns a 500.
 */
function pickGroqKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k) return k;
  }
  return null;
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

  // ── Groq key ───────────────────────────────────────────────────────────────
  const apiKey = pickGroqKey();
  if (!apiKey) {
    return res.status(500).json({
      error: "No Groq API key configured. Add GROQ_API_KEY to Vercel → Environment Variables.",
    });
  }

  // ── Call Groq ──────────────────────────────────────────────────────────────
  try {
    const groqRes = await fetch(GROQ_ENDPOINT, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      const msg = errBody?.error?.message || `Groq HTTP ${groqRes.status}`;
      console.error("[ai-insights] Groq error:", msg);
      return res.status(502).json({ error: `Groq API error: ${msg}` });
    }

    const data    = await groqRes.json();
    const text    = data?.choices?.[0]?.message?.content ?? "";

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
