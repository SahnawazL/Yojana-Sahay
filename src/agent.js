// src/agent.js — Yojana Sahay · the chat as an AGENT
// ─────────────────────────────────────────────────────────────────────────────
// Loop:  ask the model (with the app's tools) → if it wants tools, run them in
// the app (agentTools.js) → send the results back → repeat (max 4 rounds) →
// the final answer streams to the screen word by word.
// The user sees each step live ("✅ Checking your eligibility…").
// If agent mode fails for any reason, falls back to the normal chat.
// ─────────────────────────────────────────────────────────────────────────────
import { buildChatBody, parseResponse, visibleStreamText, sendMessageStream } from "./groqClient.js";
import { runTool, TOOL_META } from "./agentTools.js";

const MAX_ROUNDS = 4;

// One streamed call. Returns { text, calls, error }.
async function streamRound(body, { onText, signal }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err?.error?.message || `API error (${res.status})`);
    e.status = res.status;
    throw e;
  }
  if (!(res.headers.get("content-type") || "").includes("ndjson") || !res.body?.getReader) {
    const e = new Error("Agent mode not available"); e.fallback = true; throw e;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", text = "", calls = [], error = "";
  const handle = (line) => {
    if (!line.trim()) return;
    let ev; try { ev = JSON.parse(line); } catch { return; }
    if (ev.t === "d" && typeof ev.c === "string") { text += ev.c; onText?.(text); }
    else if (ev.t === "tc" && Array.isArray(ev.calls)) calls = ev.calls;
    else if (ev.t === "e") error = ev.m || "AI error";
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
  }
  buf += dec.decode();
  if (buf) handle(buf);
  return { text, calls, error };
}

/**
 * runAgent(history, query, lang, profile, extras, { onDelta, onStep, onStatus, signal })
 *   onDelta(visibleText) — the answer as it streams
 *   onStep(steps)        — the list of steps so far: [{ icon, label, done }]
 * Resolves to { reply, followUps, actions, steps, ui, schemeIds }.
 */
export async function runAgent(history, query, lang = "en", profile = null, extras = {}, hooks = {}) {
  const { onDelta, onStep, signal } = hooks;
  const ctx = { lang, profile, answers: extras.answers || null, matched: extras.matched || [], signal };
  const base = buildChatBody(history, query, lang, profile, { ...extras, agent: true });
  const messages = [...base.messages];
  const steps = [];
  const ui = { checklist: null, open: [], tracked: [] };
  const schemeIds = [];
  const pushStep = (s) => { steps.push(s); onStep?.(steps.map(x => ({ ...x }))); };

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const final = round === MAX_ROUNDS - 1;
      let shown = false;
      const { text, calls, error } = await streamRound(
        { ...base, messages, stream: true, agent: true, final },
        {
          signal,
          // Shown live; if this round ends in tool calls instead, it was the
          // model "thinking out loud" and is cleared below.
          onText: (t) => { shown = true; onDelta?.(visibleStreamText(t)); },
        },
      );
      if (!calls.length) {
        if (!text.trim()) throw new Error(error || "Empty response from AI. Please try again.");
        const parsed = parseResponse(text.trim());
        return { ...parsed, steps: steps.map(({ icon, label }) => ({ icon, label })), ui, schemeIds };
      }
      if (shown) onDelta?.(""); // it was thinking out loud — clear it, tools come next

      messages.push({
        role: "assistant",
        content: text || "",
        tool_calls: calls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args || "{}" } })),
      });
      // Independent lookups run together.
      const results = await Promise.all(calls.map(async (c) => {
        const meta = TOOL_META[c.name] || { icon: "⚙️", en: c.name, hi: c.name };
        const step = { icon: meta.icon, label: lang === "hi" ? meta.hi : meta.en, done: false };
        pushStep(step);
        const out = await runTool(c.name, c.args, ctx);
        step.label = out.step || step.label;
        step.done = true;
        onStep?.(steps.map(x => ({ ...x })));
        if (out.ui?.checklist) ui.checklist = out.ui.checklist;
        if (out.ui?.open) ui.open.push(out.ui.open);
        if (out.ui?.tracked) ui.tracked.push(out.ui.tracked);
        for (const id of out.schemeIds || []) if (!schemeIds.includes(id)) schemeIds.push(id);
        return { id: c.id, content: JSON.stringify(out.result ?? {}).slice(0, 6500) };
      }));
      for (const r of results) messages.push({ role: "tool", tool_call_id: r.id, content: r.content });
    }
    throw new Error("The assistant took too many steps. Please ask again more simply.");
  } catch (e) {
    if (e?.name === "AbortError") throw e;
    // Agent mode unavailable (old server, tools rejected…) → normal chat, if nothing ran yet.
    if (!steps.length && (e.fallback || e.status === 400)) {
      return { ...(await sendMessageStream(history, query, lang, profile, extras, hooks)), steps: [], ui, schemeIds };
    }
    throw e;
  }
}
