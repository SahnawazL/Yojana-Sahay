// api/_lib/keyMap.js — Yojana Sahay · which API keys are really the same
// ─────────────────────────────────────────────────────────────────────────────
// Several jobs use several env vars, but two env vars can hold the SAME key,
// and different keys can belong to the SAME account. Limits are per account:
//   • Groq  — limits are per organization (account) + model, not per key.
//   • Tavily — credits are per account (plan_usage / plan_limit).
// Counting each env var as its own fresh limit would over-promise. This
// module works out the real picture without ever exposing a key:
//   • fingerprints (SHA-256, first 12 hex) spot identical keys across env vars
//   • Tavily's own GET /usage gives the real, account-wide credit count
//   • Groq 429 messages name the organization — remembered per key in KV,
//     so keys from the same account are grouped once a limit has been hit
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

export const fingerprint = k => createHash("sha256").update(String(k).trim()).digest("hex").slice(0, 12);

const GROQ_CHAT   = ["GROQ_API_KEY", "GROQ_API_KEY_1", "GROQ_API_KEY_2", "GROQ_API_KEY_3", "GROQ_API_KEY_4", "GROQ_API_KEY_5"];
const GROQ_VERIFY = ["GROQ_VERIFY_KEY", "GROQ_VERIFY_KEY_1", "GROQ_VERIFY_KEY_2"];
const TAVILY      = ["TAVILY_VERIFY_KEY", "TAVILY_API_KEY"];

// Friendly labels for the admin screen.
const LABEL = {
  GROQ_API_KEY: "chat key 0", GROQ_API_KEY_1: "chat key 1", GROQ_API_KEY_2: "chat key 2", GROQ_API_KEY_3: "chat key 3",
  GROQ_API_KEY_4: "chat key 4", GROQ_API_KEY_5: "chat key 5",
  GROQ_VERIFY_KEY: "agents key", GROQ_VERIFY_KEY_1: "agents key 2", GROQ_VERIFY_KEY_2: "agents key 3",
  TAVILY_VERIFY_KEY: "Tavily agents key", TAVILY_API_KEY: "Tavily chat key",
};
export const labelOf = name => LABEL[name] ?? name;

function present(names) {
  return names.map(n => ({ name: n, key: process.env[n]?.trim() })).filter(x => x.key);
}

// Env vars that hold the exact same key → [["GROQ_VERIFY_KEY", "GROQ_API_KEY_3"], …]
export function duplicateKeys(names = [...GROQ_CHAT, ...GROQ_VERIFY, ...TAVILY]) {
  const byFp = new Map();
  for (const { name, key } of present(names)) {
    const f = fingerprint(key);
    byFp.set(f, [...(byFp.get(f) ?? []), name]);
  }
  return [...byFp.values()].filter(g => g.length > 1);
}

// ── KV helpers ───────────────────────────────────────────────────────────────
async function kv(args) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(KV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok ? (await res.json())?.result ?? null : null;
  } catch { return null; }
}

// ── Groq: remember which account (organization) each key belongs to ─────────
const orgNoted = new Set();
export function noteGroqOrg(key, message) {
  try {
    const m = /organization\s+`?(org_[A-Za-z0-9]+)`?/i.exec(String(message ?? ""));
    if (!m || !key) return;
    const f = fingerprint(key);
    const org = fingerprint(m[1]).slice(0, 8); // never store the raw org id
    if (orgNoted.has(f + org)) return;
    orgNoted.add(f + org);
    kv(["SET", `groq_org:${f}`, org, "EX", String(60 * 24 * 3600)]).catch(() => {});
  } catch { /* telemetry only */ }
}

// [{ org, names: [...] }] — only keys whose account is known.
export async function groqAccountGroups() {
  const keys = present([...GROQ_CHAT, ...GROQ_VERIFY]);
  if (!keys.length) return [];
  const vals = await kv(["MGET", ...keys.map(k => `groq_org:${fingerprint(k.key)}`)]);
  if (!Array.isArray(vals)) return [];
  const byOrg = new Map();
  vals.forEach((org, i) => { if (org) byOrg.set(org, [...new Set([...(byOrg.get(org) ?? []), keys[i].name])]); });
  return [...byOrg.entries()].map(([org, names]) => ({ org, names }));
}

// Do these two key lists share a Groq account (as far as we know)?
export async function sameGroqAccount(keysA, keysB) {
  const a = keysA.map(fingerprint), b = keysB.map(fingerprint);
  if (a.some(f => b.includes(f))) return true;
  const vals = await kv(["MGET", ...[...a, ...b].map(f => `groq_org:${f}`)]);
  if (!Array.isArray(vals)) return false;
  const orgA = new Set(vals.slice(0, a.length).filter(Boolean));
  return vals.slice(a.length).some(o => o && orgA.has(o));
}

// ── Tavily: real account usage from Tavily itself ───────────────────────────
const tavilyCache = new Map(); // fingerprint → { at, data }
const TAVILY_CACHE_MS = 10 * 60 * 1000;

export async function tavilyUsage(key) {
  if (!key) return null;
  const f = fingerprint(key);
  const hit = tavilyCache.get(f);
  if (hit && Date.now() - hit.at < TAVILY_CACHE_MS) return hit.data;
  try {
    const res = await fetch("https://api.tavily.com/usage", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) { tavilyCache.set(f, { at: Date.now(), data: null }); return null; }
    const d = await res.json();
    const num = v => (v == null || !Number.isFinite(Number(v)) ? null : Number(v));
    const data = {
      keyUsed: num(d?.key?.usage),
      keyLimit: num(d?.key?.limit),
      accountUsed: num(d?.account?.plan_usage),
      accountLimit: num(d?.account?.plan_limit),
      plan: d?.account?.current_plan ?? null,
      searchUsed: num(d?.account?.search_usage),
      extractUsed: num(d?.account?.extract_usage),
    };
    tavilyCache.set(f, { at: Date.now(), data });
    return data;
  } catch {
    return null; // never block anything because the usage call failed
  }
}

// Agents' Tavily key + whether the chat key draws from the same account.
export async function tavilyPicture() {
  const agents = (process.env.TAVILY_VERIFY_KEY ?? process.env.TAVILY_API_KEY)?.trim();
  const chat = process.env.TAVILY_API_KEY?.trim();
  if (!agents) return null;
  const [a, c] = await Promise.all([tavilyUsage(agents), chat && chat !== agents ? tavilyUsage(chat) : null]);
  let shared = "no";
  if (!chat || chat === agents) shared = "same-key";
  else if (a && c && a.accountLimit != null && a.accountUsed > 0 && a.accountUsed === c.accountUsed && a.accountLimit === c.accountLimit && a.plan === c.plan) shared = "same-account";
  return { agents: a, chat: c, shared };
}
