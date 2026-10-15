// api/_lib/groqSmart.js — Yojana Sahay · smarter Groq calls for the agents
// ─────────────────────────────────────────────────────────────────────────────
// The background agents used to stop the moment their one Groq key hit a rate
// limit. This caller tries, in order, before giving up:
//
//   1. every key in the pool (round-robin, same as before)
//   2. a short wait + one retry when Groq says "try again in N s"
//      (per-minute limits only — a per-DAY limit never clears by waiting)
//   3. backup models on the same keys — Groq counts limits PER MODEL, so a
//      second model has its own fresh quota
//   4. optionally one "borrowed" key from another pool (the agents borrow only
//      the LAST chat key, so the user-facing chat keeps the other four)
//
// It also remembers the rate-limit headers Groq sends back (requests / tokens
// left) in the KV store, so the admin Agents tab can show how much of each
// key's quota is used before it runs out.
//
// Return shape is the same as the old callGroq() helpers:
//   { status, data, keyIdx, count429, failedKeys, rateLimited }
// plus: { modelUsed, fallbackModel, borrowed, waited }
// ─────────────────────────────────────────────────────────────────────────────

import { getNextStartIdx } from "./groqRotation.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// Backups for the agents' default model (openai/gpt-oss-20b). Same list the
// Scheme Discovery agent already uses.
export const AGENT_FALLBACK_MODELS = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"];

// Models whose quota the Agents tab reports on.
export const QUOTA_MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"];

const isReasoningModel = m => /^openai\/gpt-oss/.test(String(m));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Reasoning-only parameters are rejected by non-reasoning models.
export function bodyForModel(body, model) {
  const b = { ...body, model };
  if (!isReasoningModel(model)) {
    delete b.reasoning_effort;
    delete b.include_reasoning;
  }
  return b;
}

function isKeyLevelFailure(status, errData) {
  if (status === 401 || status === 403) return true;
  const code = errData?.error?.code;
  return code === "organization_restricted" || code === "invalid_api_key";
}

// A per-day limit (tokens or requests per day) won't clear by waiting.
function isDailyLimit(errData) {
  return /per day|\(TPD\)|\(RPD\)/i.test(String(errData?.error?.message ?? ""));
}

// How long Groq asks us to wait: Retry-After header, else "try again in 1m2.5s".
function retryAfterMs(res, errData) {
  const h = Number(res?.headers?.get?.("retry-after"));
  if (Number.isFinite(h) && h > 0) return Math.ceil(h * 1000);
  const m = /try again in\s+(?:(\d+)m)?\s*([\d.]+)\s*(ms|s)/i.exec(String(errData?.error?.message ?? ""));
  if (!m) return null;
  const mins = Number(m[1] || 0);
  const val = Number(m[2] || 0);
  return Math.ceil(mins * 60000 + (m[3].toLowerCase() === "ms" ? val : val * 1000));
}

// ── Quota memory (KV) ────────────────────────────────────────────────────────

const quotaKey = (pool, idx, model) => `groq_quota:${pool}:${idx}:${model}`;
const lastNoted = new Map(); // throttle KV writes per instance

async function kvCommand(args) {
  if (!KV_URL || !KV_TOKEN) return null;
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  return (await res.json())?.result ?? null;
}

// Fire-and-forget: never slows down or breaks a Groq call.
export function noteGroqQuota(pool, idx, model, headers, { limited = false } = {}) {
  try {
    if (!KV_URL || !KV_TOKEN || !headers?.get || idx < 0) return;
    const k = quotaKey(pool, idx, model);
    const now = Date.now();
    if (!limited && now - (lastNoted.get(k) ?? 0) < 2 * 60 * 1000) return;
    lastNoted.set(k, now);
    const num = n => { const v = Number(headers.get(n)); return Number.isFinite(v) ? v : null; };
    const snap = {
      reqLimit: num("x-ratelimit-limit-requests"),       // requests per day
      reqLeft:  num("x-ratelimit-remaining-requests"),
      reqReset: headers.get("x-ratelimit-reset-requests") || null,
      tokLimit: num("x-ratelimit-limit-tokens"),         // tokens per minute
      tokLeft:  num("x-ratelimit-remaining-tokens"),
      limited,
      at: new Date(now).toISOString(),
    };
    if (snap.reqLimit == null && snap.tokLimit == null && !limited) return;
    kvCommand(["SET", k, JSON.stringify(snap), "EX", "172800"]).catch(() => {});
  } catch { /* telemetry only */ }
}

// For the Agents tab: [{ pool, idx, model, reqLimit, reqLeft, ... }]
export async function readGroqQuota(pools) {
  try {
    const keys = [];
    const meta = [];
    for (const [pool, count] of Object.entries(pools)) {
      for (let idx = 0; idx < count; idx++) {
        for (const model of QUOTA_MODELS) { keys.push(quotaKey(pool, idx, model)); meta.push({ pool, idx, model }); }
      }
    }
    if (!keys.length) return [];
    const vals = await kvCommand(["MGET", ...keys]);
    if (!Array.isArray(vals)) return [];
    const out = [];
    vals.forEach((v, i) => {
      if (!v) return;
      try {
        const snap = JSON.parse(v);
        // Day counters reset; anything older than 26 h no longer says much.
        if (Date.now() - new Date(snap.at).getTime() > 26 * 3600 * 1000) return;
        out.push({ ...meta[i], ...snap });
      } catch { /* skip */ }
    });
    return out;
  } catch {
    return [];
  }
}

// ── One pass over a key pool with one model ──────────────────────────────────

async function passOverPool(keys, body, pool, idxBase = 0) {
  const r = { ok: null, count429: 0, failedKeys: [], lastError: null, retryMs: null, daily: false, keyFailures: 0 };
  const n = keys.length;
  if (!n) return r;
  const startIdx = await getNextStartIdx(n);
  for (let offset = 0; offset < n; offset++) {
    const i = (startIdx + offset) % n;
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys[i]}` },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        r.lastError = errData;
        r.count429++;
        r.failedKeys.push(i);
        if (isDailyLimit(errData)) r.daily = true;
        const w = retryAfterMs(res, errData);
        if (w != null) r.retryMs = r.retryMs == null ? w : Math.min(r.retryMs, w);
        noteGroqQuota(pool, idxBase + i, body.model, res.headers, { limited: true });
        continue;
      }
      const data = await res.json().catch(() => ({}));
      if (isKeyLevelFailure(res.status, data)) { r.lastError = data; r.keyFailures++; continue; }
      if (res.status === 200) noteGroqQuota(pool, idxBase + i, body.model, res.headers);
      r.ok = { status: res.status, data, keyIdx: i };
      return r;
    } catch (err) {
      r.lastError = { message: err.message };
    }
  }
  return r;
}

/**
 * @param {string[]} keys        main key pool
 * @param {object}   body        Groq request body (body.model = preferred model)
 * @param {object}   opts
 *   pool            name for quota tracking ("verify" | "chat")
 *   fallbackModels  models to try when the preferred one is rate-limited
 *   maxWaitMs       longest single wait for a per-minute limit (0 = never wait)
 *   borrowKeys      last-resort keys from another pool (tried after all models)
 *   borrowPool      quota-tracking name for borrowed keys
 *   borrowIdxBase   their real index inside that pool (for the quota display)
 */
export async function smartGroq(keys, body, opts = {}) {
  const {
    pool = "verify",
    fallbackModels = [],
    maxWaitMs = 0,
    borrowKeys = [],
    borrowPool = "chat",
    borrowIdxBase = 0,
  } = opts;
  const models = [body.model, ...fallbackModels.filter(m => m && m !== body.model)];
  let count429 = 0;
  const failedKeys = [];
  let lastError = null;
  let waited = false;

  const done = (r, model, borrowed) => ({
    ...r.ok,
    keyIdx: borrowed ? -1 : r.ok.keyIdx,
    count429,
    failedKeys,
    rateLimited: false,
    modelUsed: model,
    fallbackModel: model !== body.model,
    borrowed,
    waited,
  });

  for (const model of models) {
    let r = await passOverPool(keys, bodyForModel(body, model), pool);
    count429 += r.count429; failedKeys.push(...r.failedKeys); lastError = r.lastError ?? lastError;
    if (r.ok) return done(r, model, false);

    // Per-minute limit with a short wait → wait once and retry this model.
    if (r.count429 > 0 && !r.daily && !waited && maxWaitMs > 0 && r.retryMs != null && r.retryMs <= maxWaitMs) {
      waited = true;
      await sleep(r.retryMs + 300);
      r = await passOverPool(keys, bodyForModel(body, model), pool);
      count429 += r.count429; failedKeys.push(...r.failedKeys); lastError = r.lastError ?? lastError;
      if (r.ok) return done(r, model, false);
    }
    // Every key rejected (bad / restricted key) → another model won't help.
    if (r.keyFailures === keys.length && keys.length > 0) break;
  }

  // Last resort: borrowed key(s), preferred model first.
  if (borrowKeys.length) {
    for (const model of models) {
      const r = await passOverPool(borrowKeys, bodyForModel(body, model), borrowPool, borrowIdxBase);
      count429 += r.count429; lastError = r.lastError ?? lastError;
      if (r.ok) return done(r, model, true);
    }
  }

  const rateLimited = count429 > 0;
  const msg = rateLimited
    ? "All Groq keys and backup models are rate-limited — try again later."
    : `Groq key(s) unavailable (invalid, restricted or unreachable): ${lastError?.error?.message ?? lastError?.message ?? "unknown error"}`;
  return {
    status: rateLimited ? 429 : 503,
    data: { error: { message: msg, details: lastError } },
    keyIdx: -1, count429, failedKeys, rateLimited,
    modelUsed: null, fallbackModel: false, borrowed: false, waited,
  };
}

// The last chat key, lent to background agents as a last resort.
export function borrowedChatKey(exclude = []) {
  const k = (process.env.GROQ_API_KEY_5 || "").trim();
  return k && !exclude.includes(k) ? [k] : [];
}
