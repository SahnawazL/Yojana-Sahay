// api/chat.js — Vercel Serverless Function · Yojana Sahay
// ─────────────────────────────────────────────────────────────────────────────
// Flow:
//   1. Send user message to Groq WITH a web_search tool definition.
//   2. If Groq decides to search → call Tavily API → get real-time results.
//   3. Send results back to Groq (tools omitted) → get final polished answer.
//   4. If Groq does NOT search → return first response directly (same as before).
//
// KEY ROTATION: up to 6 Groq keys (GROQ_API_KEY … GROQ_API_KEY_5), round-robin,
//               skip on 429.
// TAVILY KEY:   add TAVILY_API_KEY in Vercel → Settings → Environment Variables.
//
// TELEMETRY: recordAiCall() writes per-key health stats (active key index,
//            429 counts, web-search counts) to adminMeta/aiStatus in Firestore
//            so the AgentsTab AI Health Panel can show live data.
// ─────────────────────────────────────────────────────────────────────────────

import { recordAiCall } from "./_lib/firebaseAdmin.js";

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const TAVILY_URL = "https://api.tavily.com/search";

// ── Web search tool definition sent to Groq ───────────────────────────────────
// Groq reads this description to decide WHEN to trigger a search.
// Kept specific so it only fires for truly live / unknown queries.
const WEB_SEARCH_TOOL = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the web for REAL-TIME information about Indian government schemes. " +
      "Use this ONLY when the user asks about: new or recently launched schemes, " +
      "current deadlines or last dates, latest news or updates, schemes you are " +
      "unsure about, or anything that may have changed recently. " +
      "Do NOT use for questions already answered by the local database.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A clear, specific search query in English (e.g. 'PM Kisan 2026 installment date')",
        },
      },
      required: ["query"],
    },
  },
};

// ── Load all Groq API keys from env ──────────────────────────────────────────
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

// ── Tavily web search ─────────────────────────────────────────────────────────
// Returns a clean formatted string of results, or a fallback message on failure.
async function searchWeb(query) {
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!tavilyKey) {
    console.warn("[Yojana Sahay] TAVILY_API_KEY not set — skipping web search.");
    return "Web search is unavailable. Please answer using your existing knowledge.";
  }

  try {
    const res = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:             tavilyKey,
        query,
        max_results:         3,       // 3 results = enough context, low token cost
        search_depth:        "basic", // "basic" is free tier; "advanced" costs 2 credits
        include_answer:      true,    // Tavily's own summary — very useful for AI
        include_raw_content: false,   // raw HTML is too noisy and wastes tokens
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Yojana Sahay] Tavily error ${res.status}: ${errText.slice(0, 200)}`);
      return "Web search returned no results. Please answer using your existing knowledge.";
    }

    const data = await res.json();

    // Build a clean, readable block for the AI to consume
    const resultLines = (data.results || []).map((r, i) =>
      `[Result ${i + 1}]\nTitle: ${r.title}\nContent: ${r.content}\nSource: ${r.url}`
    ).join("\n\n");

    if (!resultLines && !data.answer) {
      return "Web search returned no useful results. Answer using your existing knowledge.";
    }

    return [
      data.answer ? `Quick Summary: ${data.answer}` : "",
      resultLines,
    ]
      .filter(Boolean)
      .join("\n\n");

  } catch (err) {
    console.error("[Yojana Sahay] Tavily fetch error:", err.message);
    return "Web search failed due to a network error. Please answer using your existing knowledge.";
  }
}

// ── Call Groq with key rotation ───────────────────────────────────────────────
// Tries each key in order; skips on 429.
// Returns { status, data, keyIdx, count429 }:
//   keyIdx   — 0-based index of the key that succeeded (-1 if all exhausted)
//   count429 — how many keys were 429'd before success (= keyIdx on success)
async function callGroq(keys, bodyObject) {
  let lastError = null;
  let count429  = 0; // number of keys that returned 429 before a success

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify(bodyObject),
      });

      // 429 → rate limited, try next key
      if (groqRes.status === 429) {
        const errData = await groqRes.json().catch(() => ({}));
        lastError = errData;
        count429++;
        console.warn(`[Yojana Sahay] Key #${i + 1} → 429 rate limited. Trying next key…`);
        continue;
      }

      const data = await groqRes.json();
      if (groqRes.status === 200) {
        console.log(`[Yojana Sahay] ✓ Key #${i + 1} succeeded.`);
      } else {
        console.error(
          `[Yojana Sahay] Groq error ${groqRes.status} on Key #${i + 1}:`,
          JSON.stringify(data).slice(0, 200)
        );
      }
      return { status: groqRes.status, data, keyIdx: i, count429 };

    } catch (err) {
      console.error(`[Yojana Sahay] Network error on Key #${i + 1}:`, err.message);
      lastError = { message: err.message };
    }
  }

  // All keys exhausted
  const msg = keys.length > 1
    ? `All ${keys.length} API keys are rate-limited or unavailable. Please wait a moment and try again.`
    : "API key is rate-limited or unavailable. Please wait a moment and try again.";

  console.error(`[Yojana Sahay] ✗ All ${keys.length} key(s) exhausted.`);
  return {
    status: 429,
    data: { error: { message: msg, details: lastError } },
    keyIdx: -1,
    count429,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const keys = loadKeys();
  if (keys.length === 0) {
    return res.status(500).json({
      error: {
        message:
          "No API keys configured. Add GROQ_API_KEY_1 in " +
          "Vercel → Settings → Environment Variables, then redeploy.",
      },
    });
  }

  const requestBody = req.body;

  // ── STEP 1: First Groq call — WITH web_search tool ──────────────────────────
  const firstCallBody = {
    ...requestBody,
    tools:       [WEB_SEARCH_TOOL],
    tool_choice: "auto", // Groq decides when to search — not every message
  };

  const {
    status: firstStatus,
    data:   firstData,
    keyIdx: firstKeyIdx,
    count429: firstCount429,
  } = await callGroq(keys, firstCallBody);

  // If first call failed, record the failure and return
  if (firstStatus !== 200) {
    // Fire-and-forget — telemetry must not delay the error response
    recordAiCall({ service: "groq", keyIdx: -1, count429: firstCount429 }).catch(() => {});
    return res.status(firstStatus).json(firstData);
  }

  const firstChoice = firstData.choices?.[0];

  // ── STEP 2: Did Groq call the web_search tool? ───────────────────────────────
  if (firstChoice?.finish_reason === "tool_calls") {
    const toolCall = firstChoice.message?.tool_calls?.[0];

    if (toolCall?.function?.name === "web_search") {

      // Parse the search query Groq chose
      let searchQuery = "Indian government scheme latest news 2026";
      try {
        searchQuery = JSON.parse(toolCall.function.arguments).query;
      } catch {
        console.warn("[Yojana Sahay] Could not parse tool arguments — using fallback query.");
      }

      console.log(`[Yojana Sahay] 🔍 Web search triggered: "${searchQuery}"`);

      // Record first Groq call (it decided to search but didn't return text yet)
      recordAiCall({ service: "groq", keyIdx: firstKeyIdx, count429: firstCount429, triggeredSearch: false }).catch(() => {});

      // Call Tavily
      const searchResult = await searchWeb(searchQuery);

      // Record the Tavily search
      recordAiCall({ service: "tavily" }).catch(() => {});

      // ── STEP 3: Second Groq call — with Tavily results injected ─────────────
      const secondCallBody = {
        ...requestBody,
        // tools intentionally omitted — Groq won't attempt a second search
        max_tokens: 1600,
        messages: [
          ...requestBody.messages,
          firstChoice.message,
          {
            role:         "tool",
            tool_call_id: toolCall.id,
            content:      searchResult,
          },
        ],
      };

      const {
        status:   secondStatus,
        data:     secondData,
        keyIdx:   secondKeyIdx,
        count429: secondCount429,
      } = await callGroq(keys, secondCallBody);

      // Record second Groq call — triggeredSearch:true increments groqWebSearchesToday
      recordAiCall({ service: "groq", keyIdx: secondKeyIdx, count429: secondCount429, triggeredSearch: true }).catch(() => {});

      return res.status(secondStatus).json(secondData);
    }
  }

  // ── No tool call → record first response and return directly ──────────────
  recordAiCall({ service: "groq", keyIdx: firstKeyIdx, count429: firstCount429 }).catch(() => {});
  return res.status(firstStatus).json(firstData);
}
