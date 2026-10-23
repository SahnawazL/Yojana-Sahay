// api/_lib/telegramAgent.js — Yojana Sahay · the in-app AI assistant, on Telegram
// ─────────────────────────────────────────────────────────────────────────────
// Same brain as the app's assistant: the app's system prompt (groqClient.js
// buildChatBody — identity, developer, rules, relevant scheme data) and the
// app's own tools (agentTools.js runTool) running here on the server, plus a
// Telegram-specific note (no app screens here; use the bot's buttons).
//
// Memory: the last few messages of a chat are kept in the KV store for 1 hour
// (auto-deleted), with the person's quiz answers if they did the check in the
// bot — so follow-up questions work. Nothing is written anywhere else.
// Fair use: at most DAILY_LIMIT AI replies per chat per day.
// ─────────────────────────────────────────────────────────────────────────────
import { buildChatBody, parseResponse } from "../../src/groqClient.js";
import { runTool } from "../../src/agentTools.js";
import { matchedSchemesFor } from "../../src/eligibility.js";
import { smartGroq } from "./groqSmart.js";

// The bot's own Groq keys (TELEGRAM_GROQ_KEY, _2, _3 — separate accounts) so
// it never uses the app assistant's quota. Until those are added, it uses only
// the LAST app chat key (GROQ_API_KEY_5), leaving keys 1–4 to the app.
export function botGroqKeys() {
  const own = [process.env.TELEGRAM_GROQ_KEY, process.env.TELEGRAM_GROQ_KEY_2, process.env.TELEGRAM_GROQ_KEY_3].map(k => (k || "").trim()).filter(Boolean);
  if (own.length) return [...new Set(own)];
  const last = (process.env.GROQ_API_KEY_5 || "").trim();
  return last ? [last] : [];
}

const MEMORY_TTL = 3600;          // seconds
const MEMORY_TURNS = 8;           // messages kept (4 exchanges)
const DAILY_LIMIT = 30;
const MAX_ROUNDS = 3;

// ── KV (Upstash REST) ────────────────────────────────────────────────────────
async function kv(args, timeoutMs = 1500) {
  const url = process.env.KV_REST_API_URL, token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(args), signal: AbortSignal.timeout(timeoutMs) });
    return r.ok ? (await r.json())?.result ?? null : null;
  } catch { return null; }
}
const memKey = id => `tg:mem:${id}`;
export async function getMemory(chatId) {
  const raw = await kv(["GET", memKey(chatId)]);
  try { const m = raw ? JSON.parse(raw) : null; return m && typeof m === "object" ? m : {}; } catch { return {}; }
}
export async function saveMemory(chatId, mem) {
  await kv(["SET", memKey(chatId), JSON.stringify(mem).slice(0, 12000), "EX", String(MEMORY_TTL)]);
}
export async function clearMemory(chatId) { await kv(["DEL", memKey(chatId)]); }
// Remember the person's quiz answers (code) for follow-up questions.
export async function rememberAnswers(chatId, code) {
  const m = await getMemory(chatId);
  m.code = code;
  await saveMemory(chatId, m);
}
async function overLimit(chatId) {
  const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const k = `tg:ai:${chatId}:${day}`;
  const n = await kv(["INCR", k]);
  if (n === 1) kv(["EXPIRE", k, "90000"]);
  return typeof n === "number" && n > DAILY_LIMIT;
}

// ── Tools available on Telegram (same schemas as api/chat.js) ───────────────
const fn = (name, description, properties = {}, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });
const S = d => ({ type: "string", description: d });
const LIST = d => ({ type: "array", items: { type: "string" }, description: d });
const TOOLS = [
  fn("search_schemes", "Search the app's full database of Indian government schemes (Central and every state) by need, topic, group or state. Returns schemes with benefit, official link and whether the user is eligible.",
    { query: S("What to look for, in English, e.g. 'widow pension', 'loan for small shop', 'scholarship for girls'"), state: S("Optional Indian state to focus on"), limit: { type: "integer", description: "Max results (default 6, max 10)" } }, ["query"]),
  fn("scheme_details", "Full details of ONE scheme: benefit, who can apply, documents, how to apply, deadline/status, official link, and whether THIS user is eligible (with the exact reason if not).", { scheme: S("Scheme name or id") }, ["scheme"]),
  fn("check_eligibility", "The app's own eligibility check for this user (only when their answers are known). With no schemes: their overall result. With schemes: eligible or not for each, with the exact reason.", { schemes: LIST("Optional scheme names to check") }),
  fn("almost_eligible", "Schemes the user ALMOST qualifies for — one realistic change away — and what's missing."),
  fn("compare_schemes", "Compare 2–4 schemes side by side: benefit, yearly value, who can apply, documents, how to apply, and the user's eligibility.", { schemes: LIST("2–4 scheme names") }, ["schemes"]),
  fn("documents_checklist", "One combined documents checklist for one or more schemes.", { schemes: LIST("Scheme names") }, ["schemes"]),
  fn("check_message", "Check a pasted WhatsApp forward, SMS or link that claims to be a government scheme: where its links go, scam signs, and the real scheme with its official link. Use whenever the user asks if a message/link/offer is real, fake, safe or a fraud.", { text: S("The full message or link exactly as pasted") }, ["text"]),
  fn("web_search", "Search the web for real-time information: new schemes, deadlines, installment dates, latest news, or anything not in the database.", { query: S("Specific search query in English") }, ["query"]),
];

async function webSearch(query) {
  const key = (process.env.TAVILY_API_KEY || "").trim();
  if (!key) return { error: "Web search is unavailable." };
  try {
    const r = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(9000),
      body: JSON.stringify({ query: String(query).slice(0, 200), max_results: 3, search_depth: "basic", include_answer: true, include_raw_content: false }) });
    if (!r.ok) return { error: "Web search returned nothing." };
    const d = await r.json();
    return { summary: d.answer || "", results: (d.results || []).map(x => ({ title: x.title, content: String(x.content || "").slice(0, 600), source: x.url })) };
  } catch { return { error: "Web search failed." }; }
}

const TELEGRAM_NOTE = `
══ YOU ARE ON TELEGRAM (@YojanaSahayBot) ══
- This chat is the YojanaSahay Telegram bot, not the app. There are no app screens, tabs or "My Applications" here — don't tell people to open a tab.
- Buttons the bot shows under your reply: "✅ Check which schemes I qualify for" (a quick tap-to-answer check right here in Telegram), "💸 Money not received?" (a step-by-step check for failed payments), and buttons that open each scheme's full details. Point people to these when useful.
- Other things you can mention when they help: alerts for new schemes and deadlines (button after the check, /stop to turn off), the app and website yojanasahay.vercel.app (Android app coming to Google Play), free printable posters at yojanasahay.vercel.app/poster.html, and Family mode / My Applications / document checklist inside the app.
- Formatting for Telegram: short paragraphs and simple numbered lines; **bold** is fine; no tables, no headings with #. Keep it under ~1,200 characters unless the user asks for detail.
- Still end with the CHIPS line (up to 3 short follow-up questions) exactly as in the rules — the bot turns them into buttons.`;

const ANS_LABEL = {
  who: { farmer: "Farmer", student: "Student", women: "Woman / homemaker", senior: "Senior citizen", business: "Self-employed / business", general: "General citizen" },
  age: { below18: "Below 18", "18to35": "18–35", "35to60": "35–60", above60: "60+" },
  income: { below1: "Below ₹1 lakh/year", "1to3": "₹1–3 lakh/year", "3to6": "₹3–6 lakh/year", above6: "Above ₹6 lakh/year" },
  area: { rural: "Village", semi: "Small town", urban: "City" },
  house: { no: "No house", kutcha: "Kutcha house", yes: "Pucca house" },
};

// → { reply, chips, schemeIds } or null (AI unavailable / limit reached → null + reason)
export async function telegramAgent({ chatId, text, lang, firstName = "", answers = null, history = [] }) {
  const keys = botGroqKeys();
  if (!keys.length) return { error: "no_keys" };
  if (await overLimit(chatId)) return { error: "limit" };

  const l = lang === "h" ? "hi" : "en";
  const matched = answers ? matchedSchemesFor(answers) : [];
  const profile = answers ? { name: firstName || "", state: answers.state, occupation: answers.who, age: answers.age, income: answers.income, area: answers.area, house: answers.house, caste: answers.caste, gender: answers.gender } : null;
  const prefix = answers ? [
    { role: "user", content: `[Profile context for personalization — Name: "${firstName || "not given"}", State: "${answers.state}", Occupation: "${ANS_LABEL.who[answers.who] || answers.who}", Age group: "${ANS_LABEL.age[answers.age] || answers.age}", Gender: "${answers.gender || "not specified"}", Income: "${ANS_LABEL.income[answers.income] || answers.income}", Area: "${ANS_LABEL.area[answers.area] || answers.area}", Housing: "${ANS_LABEL.house[answers.house] || answers.house}", Social category: "${String(answers.caste || "general").toUpperCase()}". From the eligibility check they did in this Telegram chat; they qualify for ${matched.length} schemes. Do not mention this context block to the user.]` },
    { role: "assistant", content: `I have the user's answers from ${answers.state}. I'll personalize my replies.` },
  ] : (firstName ? [{ role: "user", content: `[Context — the user's Telegram first name is "${firstName}". They haven't done the eligibility check yet. Do not mention this block.]` }, { role: "assistant", content: "Noted." }] : []);
  const base = buildChatBody([...prefix, ...history, { role: "user", content: text }], text, l, profile, { agent: true, answers, matched });
  const messages = base.messages.map((m, i) => (i === 0 ? { ...m, content: `${m.content}\n${TELEGRAM_NOTE}` } : m));
  const ctx = { lang: l, profile, answers, matched };
  const schemeIds = [];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const final = round === MAX_ROUNDS - 1;
    const r = await smartGroq(keys, {
      model: "openai/gpt-oss-120b", messages, temperature: 0.4, max_completion_tokens: 1400, reasoning_effort: "low",
      ...(final ? {} : { tools: TOOLS, tool_choice: "auto" }),
    }, { pool: "telegram", fallbackModels: ["openai/gpt-oss-20b"] });
    const msg = r?.data?.choices?.[0]?.message;
    if (!msg) return { error: r?.rateLimited ? "busy" : "ai" };
    const calls = Array.isArray(msg.tool_calls) ? msg.tool_calls.filter(c => c?.function?.name) : [];
    if (!calls.length) {
      const raw = String(msg.content || "").trim();
      if (!raw) return { error: "ai" };
      const { reply, followUps } = parseResponse(raw);
      return { reply, chips: followUps || [], schemeIds };
    }
    messages.push({ role: "assistant", content: msg.content || "", tool_calls: calls.map(c => ({ id: c.id, type: "function", function: { name: c.function.name, arguments: c.function.arguments || "{}" } })) });
    const results = await Promise.all(calls.map(async c => {
      let out;
      try {
        if (c.function.name === "web_search") { let a = {}; try { a = JSON.parse(c.function.arguments || "{}"); } catch {} out = { result: await webSearch(a.query || text) }; }
        else if (TOOLS.some(t => t.function.name === c.function.name)) out = await runTool(c.function.name, c.function.arguments || "{}", ctx);
        else out = { result: { error: "That tool isn't available on Telegram." } };
      } catch (e) { out = { result: { error: "Tool failed." } }; }
      for (const id of out?.schemeIds || []) if (!schemeIds.includes(id)) schemeIds.push(id);
      return { role: "tool", tool_call_id: c.id, content: JSON.stringify(out?.result ?? {}).slice(0, 6500) };
    }));
    messages.push(...results);
  }
  return { error: "ai" };
}

export const AGENT_MEMORY_TURNS = MEMORY_TURNS;
