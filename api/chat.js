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
import { getNextStartIdx } from "./_lib/groqRotation.js";
import { logApiCallToHistory } from "./_lib/apiCallHistory.js";

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
      // Tavily authenticates with a Bearer header (body api_key is no longer documented).
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tavilyKey.trim()}` },
      signal:  AbortSignal.timeout(15000),
      body: JSON.stringify({
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

// ── Detect key/account-level failures (vs. request-specific failures) ───────
// These mean THIS KEY is broken — every request through it will fail the same
// way regardless of prompt. Should skip to the next key, same as a 429.
// (Contrast: "tool_use_failed" is about THIS prompt, not the key — retrying
// with a different key would just fail again. Handled separately below.)
function isKeyLevelFailure(status, errData) {
  if (status === 401) return true; // invalid/revoked key
  const code = errData?.error?.code;
  return code === "organization_restricted" || code === "invalid_api_key";
}

// ── Call Groq with key rotation ───────────────────────────────────────────────
// Tries each key starting from a shared, cross-instance counter (wrapping
// around); skips on 429.
// Returns { status, data, keyIdx, count429 }:
//   keyIdx   — 0-based index of the key that succeeded (-1 if all exhausted)
//   count429 — how many keys were 429'd before success
async function callGroq(keys, bodyObject) {
  let lastError = null;
  let count429  = 0; // number of keys that returned 429 before a success
  const failedKeys = []; // real indices of the keys that 429'd (for the AgentsTab key grid)
  const n = keys.length;
  const startIdx = await getNextStartIdx(n);

  for (let offset = 0; offset < n; offset++) {
    const i   = (startIdx + offset) % n;
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
        failedKeys.push(i);
        console.warn(`[Yojana Sahay] Key #${i + 1} → 429 rate limited. Trying next key…`);
        continue;
      }

      const data = await groqRes.json();

      // Key/account-level failure — this key is dead for ANY request, not
      // just this one. Skip it instead of surfacing a dead-key error to the
      // user when other keys might be perfectly healthy.
      if (isKeyLevelFailure(groqRes.status, data)) {
        lastError = data;
        console.warn(
          `[Yojana Sahay] Key #${i + 1} → ${data?.error?.code || groqRes.status} ` +
          `(key-level failure). Trying next key…`
        );
        continue;
      }

      if (groqRes.status === 200) {
        console.log(`[Yojana Sahay] ✓ Key #${i + 1} succeeded.`);
      } else {
        console.error(
          `[Yojana Sahay] Groq error ${groqRes.status} on Key #${i + 1}:`,
          JSON.stringify(data).slice(0, 200)
        );
      }
      return { status: groqRes.status, data, keyIdx: i, count429, failedKeys };

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
    failedKeys,
  };
}

// ── Request sanitising ───────────────────────────────────────────────────────
// This endpoint is public (the citizen chat uses it), and it used to forward
// req.body to Groq untouched — any site could use it as a free proxy for any
// model, any max_tokens and any tools on these keys. Only the fields the app
// actually sends are passed through now, with sane limits.
const ALLOWED_MODELS = new Set(["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);
const DEFAULT_MODEL  = "openai/gpt-oss-120b";
// Models Groq has shut down → their official replacement, so an old cached
// client bundle keeps working instead of failing with "model not found".
const MODEL_REPLACEMENTS = {
  "llama-3.3-70b-versatile": "openai/gpt-oss-120b",
  "llama-3.1-8b-instant":    "openai/gpt-oss-20b",
  "qwen/qwen3-32b":          "openai/gpt-oss-120b",
};
const MAX_MESSAGES      = 24;
const MAX_MESSAGE_CHARS = 8000;
const MAX_SYSTEM_CHARS  = 24000;
const MAX_OUTPUT_TOKENS = 1600;
// gpt-oss models spend hidden reasoning tokens out of the same completion
// budget; without headroom, answers were cut off mid-sentence.
const REASONING_HEADROOM = 1024;

function sanitizeChatRequest(body) {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };
  const requested = typeof body.model === "string" ? body.model : DEFAULT_MODEL;
  const mapped    = MODEL_REPLACEMENTS[requested] ?? requested;
  const model     = ALLOWED_MODELS.has(mapped) ? mapped : DEFAULT_MODEL;

  if (!Array.isArray(body.messages) || body.messages.length === 0) return { error: "messages must be a non-empty array" };
  const messages = body.messages.slice(-MAX_MESSAGES).map(m => {
    const role = ["system", "user", "assistant"].includes(m?.role) ? m.role : "user";
    // The app's own system prompt carries the scheme context (~8–10K chars).
    const cap  = role === "system" ? MAX_SYSTEM_CHARS : MAX_MESSAGE_CHARS;
    return { role, content: String(m?.content ?? "").slice(0, cap) };
  }).filter(m => m.content.trim());
  if (messages.length === 0) return { error: "messages are empty" };

  const wanted = Number(body.max_tokens ?? body.max_completion_tokens) || 800;
  const outTokens = Math.min(MAX_OUTPUT_TOKENS, Math.max(64, wanted));
  const temperature = Math.min(1.5, Math.max(0, Number(body.temperature ?? 0.5) || 0));

  const isReasoning = model.startsWith("openai/gpt-oss");
  return {
    stream: body.stream === true,
    body: {
      model,
      messages,
      temperature,
      ...(isReasoning
        ? { max_completion_tokens: outTokens + REASONING_HEADROOM, reasoning_effort: "low" }
        : { max_tokens: outTokens }),
    },
  };
}

// Light per-IP limit using the existing Vercel KV store (skipped when KV is
// not configured). 30 requests per minute is far above normal chat use.
const RATE_LIMIT_PER_MIN = 30;
async function isRateLimited(req) {
  const url = process.env.KV_REST_API_URL, token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;
  const ip = String(req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown").split(",")[0].trim();
  const key = `chat_rl:${ip}:${Math.floor(Date.now() / 60000)}`;
  try {
    const r = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, "90"]]),
    });
    if (!r.ok) return false;
    const out = await r.json();
    const count = Number(out?.[0]?.result ?? 0);
    return count > RATE_LIMIT_PER_MIN;
  } catch {
    return false; // never block chat because the limiter is down
  }
}

// Assistant messages echoed back to Groq after a tool call must only carry
// fields Groq accepts — gpt-oss replies include a `reasoning` field that
// Groq rejects when sent back.
function cleanAssistantMessage(msg) {
  return {
    role: "assistant",
    content: msg?.content ?? "",
    ...(Array.isArray(msg?.tool_calls) ? { tool_calls: msg.tool_calls } : {}),
  };
}

// ── STREAMING (live answers) ──────────────────────────────────────────────────
// When the app sends {stream:true}, the answer is sent piece by piece as Groq
// writes it, so people see words within a second instead of waiting for the
// whole reply. The response is newline-delimited JSON:
//   {"t":"d","c":"text"}   — next piece of the answer
//   {"t":"s","q":"query"}  — searching the web for this
//   {"t":"e","m":"message"} — error
//   {"t":"done"}           — finished
// Same key rotation, web-search tool and telemetry as the normal path.

// Opens a streaming Groq request, rotating keys on 429 / dead keys.
async function openGroqStream(keys, bodyObject) {
  let lastError = null, count429 = 0;
  const failedKeys = [];
  const n = keys.length;
  const startIdx = await getNextStartIdx(n);
  for (let offset = 0; offset < n; offset++) {
    const i = (startIdx + offset) % n;
    try {
      const r = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys[i]}` },
        body: JSON.stringify({ ...bodyObject, stream: true }),
      });
      if (r.status === 429) { count429++; failedKeys.push(i); lastError = await r.json().catch(() => ({})); continue; }
      if (r.status !== 200) {
        const data = await r.json().catch(() => ({}));
        if (isKeyLevelFailure(r.status, data)) { lastError = data; continue; }
        return { ok: false, status: r.status, data, keyIdx: i, count429, failedKeys };
      }
      return { ok: true, res: r, keyIdx: i, count429, failedKeys };
    } catch (err) {
      lastError = { message: err.message };
    }
  }
  return { ok: false, status: 429, data: { error: { message: "All AI keys are busy right now. Please try again in a minute.", details: lastError } }, keyIdx: -1, count429, failedKeys };
}

// Reads Groq's SSE stream; calls onText for answer text, collects tool calls.
async function pumpGroqStream(r, onText) {
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "", finish = null, error = null;
  const tools = {}; // index → {id, name, args}
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      let j; try { j = JSON.parse(payload); } catch { continue; }
      if (j.error) { error = j.error; continue; } // e.g. tool_use_failed arrives inside the stream
      const ch = j.choices?.[0];
      if (!ch) continue;
      const d = ch.delta || {};
      if (d.content) onText(d.content);
      for (const tc of d.tool_calls || []) {
        const k = tc.index ?? 0;
        tools[k] = tools[k] || { id: "", name: "", args: "" };
        if (tc.id) tools[k].id = tc.id;
        if (tc.function?.name) tools[k].name += tc.function.name;
        if (tc.function?.arguments) tools[k].args += tc.function.arguments;
      }
      if (ch.finish_reason) finish = ch.finish_reason;
    }
  }
  return { finish, error, toolCall: tools[0] || null };
}

async function handleStream(req, res, keys, requestBody) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  const send = obj => { try { res.write(JSON.stringify(obj) + "\n"); } catch {} };
  let sentText = false;
  const onText = c => { sentText = true; send({ t: "d", c }); };

  try {
    let first = await openGroqStream(keys, { ...requestBody, tools: [WEB_SEARCH_TOOL], tool_choice: "auto" });
    // The model couldn't format a tool call for this prompt → answer without the tool.
    if (!first.ok && first.data?.error?.code === "tool_use_failed") first = await openGroqStream(keys, requestBody);
    if (!first.ok) {
      recordAiCall({ service: "groq", keyIdx: -1, count429: first.count429, failedKeys: first.failedKeys }).catch(() => {});
      send({ t: "e", m: first.data?.error?.message || "The AI is busy. Please try again." });
      return res.end();
    }
    let out = await pumpGroqStream(first.res, onText);
    recordAiCall({ service: "groq", keyIdx: first.keyIdx, count429: first.count429, failedKeys: first.failedKeys }).catch(() => {});
    logApiCallToHistory("groqCalls").catch(() => {});
    // Tool-call formatting failed mid-stream before any text → answer once more without the tool.
    if (out.error && !sentText) {
      const again = await openGroqStream(keys, requestBody);
      if (!again.ok) {
        send({ t: "e", m: again.data?.error?.message || "The AI is busy. Please try again." });
        return res.end();
      }
      out = await pumpGroqStream(again.res, onText);
      recordAiCall({ service: "groq", keyIdx: again.keyIdx, count429: again.count429, failedKeys: again.failedKeys }).catch(() => {});
      logApiCallToHistory("groqCalls").catch(() => {});
    }

    if (out.finish === "tool_calls" && out.toolCall?.name === "web_search") {
      let q = "Indian government scheme latest news";
      try { q = JSON.parse(out.toolCall.args || "{}").query || q; } catch {}
      send({ t: "s", q });
      const searchResult = await searchWeb(q);
      recordAiCall({ service: "tavily" }).catch(() => {});
      logApiCallToHistory("tavilyCalls").catch(() => {});
      const second = await openGroqStream(keys, {
        ...requestBody,
        messages: [
          ...requestBody.messages,
          { role: "assistant", content: "", tool_calls: [{ id: out.toolCall.id || "call_0", type: "function", function: { name: "web_search", arguments: out.toolCall.args || "{}" } }] },
          { role: "tool", tool_call_id: out.toolCall.id || "call_0", content: searchResult },
        ],
      });
      if (!second.ok) {
        send({ t: "e", m: second.data?.error?.message || "The AI is busy. Please try again." });
        return res.end();
      }
      await pumpGroqStream(second.res, onText);
      recordAiCall({ service: "groq", keyIdx: second.keyIdx, count429: second.count429, failedKeys: second.failedKeys, triggeredSearch: true }).catch(() => {});
      logApiCallToHistory("groqCalls").catch(() => {});
    }
    if (!sentText) send({ t: "e", m: "Empty answer from the AI. Please try again." });
    send({ t: "done" });
  } catch (err) {
    console.error("[Yojana Sahay] stream error:", err?.message);
    send({ t: "e", m: "Connection to the AI was interrupted. Please try again." });
  }
  return res.end();
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

  if (await isRateLimited(req)) {
    return res.status(429).json({ error: { message: "Too many messages — please wait a minute and try again." } });
  }

  const sanitized = sanitizeChatRequest(req.body);
  if (sanitized.error) {
    return res.status(400).json({ error: { message: sanitized.error } });
  }
  const requestBody = sanitized.body;

  // Live streaming for the chat screen (the results brief still uses JSON).
  if (sanitized.stream) return handleStream(req, res, keys, requestBody);

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
    failedKeys: firstFailedKeys,
  } = await callGroq(keys, firstCallBody);

  // tool_use_failed isn't a key problem — the model failed to format a valid
  // function call for THIS prompt, and would fail the same way on every key.
  // Retry once without the web_search tool so the user still gets an answer
  // instead of a raw "failed_generation" error.
  if (firstStatus !== 200 && firstData?.error?.code === "tool_use_failed") {
    console.warn("[Yojana Sahay] tool_use_failed — retrying without web_search tool.");
    const retry = await callGroq(keys, requestBody); // no tools this round
    recordAiCall({
      service:  "groq",
      keyIdx:   retry.status === 200 ? retry.keyIdx : -1,
      count429: retry.count429,
      failedKeys: retry.failedKeys,
    }).catch(() => {});
    if (retry.status === 200) logApiCallToHistory("groqCalls").catch(() => {});
    return res.status(retry.status).json(retry.data);
  }

  // If first call failed, record the failure and return
  if (firstStatus !== 200) {
    // Fire-and-forget — telemetry must not delay the error response
    recordAiCall({ service: "groq", keyIdx: -1, count429: firstCount429, failedKeys: firstFailedKeys }).catch(() => {});
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
      recordAiCall({ service: "groq", keyIdx: firstKeyIdx, count429: firstCount429, failedKeys: firstFailedKeys, triggeredSearch: false }).catch(() => {});
      logApiCallToHistory("groqCalls").catch(() => {});

      // Call Tavily
      const searchResult = await searchWeb(searchQuery);

      // Record the Tavily search
      recordAiCall({ service: "tavily" }).catch(() => {});
      logApiCallToHistory("tavilyCalls").catch(() => {});

      // ── STEP 3: Second Groq call — with Tavily results injected ─────────────
      const secondCallBody = {
        ...requestBody,
        // tools intentionally omitted — Groq won't attempt a second search
        messages: [
          ...requestBody.messages,
          cleanAssistantMessage(firstChoice.message),
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
        failedKeys: secondFailedKeys,
      } = await callGroq(keys, secondCallBody);

      // Record second Groq call — triggeredSearch:true increments groqWebSearchesToday
      recordAiCall({ service: "groq", keyIdx: secondKeyIdx, count429: secondCount429, failedKeys: secondFailedKeys, triggeredSearch: true }).catch(() => {});
      if (secondStatus === 200) logApiCallToHistory("groqCalls").catch(() => {});

      return res.status(secondStatus).json(secondData);
    }
  }

  // ── No tool call → record first response and return directly ──────────────
  recordAiCall({ service: "groq", keyIdx: firstKeyIdx, count429: firstCount429, failedKeys: firstFailedKeys }).catch(() => {});
  logApiCallToHistory("groqCalls").catch(() => {});
  return res.status(firstStatus).json(firstData);
}
