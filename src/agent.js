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
import { findSchemesInText } from "./schemeMatch.js";

// The model sometimes SAYS it added a scheme to My Applications without
// calling the tool. Catch that: save it for real when the user clearly asked
// and the scheme is unambiguous — otherwise say honestly that it isn't saved.
const CLAIMS_TRACKED = /(added|saved|tracked|tracking)[^.\n]{0,70}my applications|my applications[^.\n]{0,40}\b(added|saved)|मेरे आवेदन[^।\n]{0,50}(जोड़|सेव|जुड़)|(जोड़|सेव|जुड़)[^।\n]{0,50}मेरे आवेदन/i;
const ASKS_TRACK = /\b(add|track|save|put|mark)\b[^.\n]{0,80}\b(my applications?|tracker|applied)\b|i(?:'ve| have)? applied|maine apply|मेरे आवेदन में|आवेदन कर दिया|अप्लाई कर/i;

const MAX_ROUNDS = 4;

// One streamed call. Returns { text, calls, error }.
// Watchdog: the server answers {"t":"ph","p":"ack"} at once, so silence
// means a dead connection (common right after a phone wakes up). Then the
// request is retried once on a fresh connection instead of hanging.
const FIRST_BYTE_MS = 9000;   // no reply at all within 9 s → stalled
const IDLE_MS       = 30000;  // nothing for 30 s mid-answer → stalled
async function streamRound(body, { onText, onPhase, signal }, attempt = 0) {
  const ctrl = new AbortController();
  const onOuterAbort = () => ctrl.abort();
  if (signal) { if (signal.aborted) ctrl.abort(); else signal.addEventListener("abort", onOuterAbort, { once: true }); }
  let stalled = false, timer = null;
  const arm = (ms) => { clearTimeout(timer); timer = setTimeout(() => { stalled = true; ctrl.abort(); }, ms); };
  let text = "", calls = [], error = "";
  arm(FIRST_BYTE_MS);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    arm(IDLE_MS);
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
    let buf = "";
    const handle = (line) => {
      if (!line.trim()) return;
      let ev; try { ev = JSON.parse(line); } catch { return; }
      if (ev.t === "d" && typeof ev.c === "string") { text += ev.c; onText?.(text); }
      else if (ev.t === "tc" && Array.isArray(ev.calls)) calls = ev.calls;
      else if (ev.t === "ph" && ev.p) { if (ev.p !== "ack") onPhase?.({ p: ev.p, n: ev.n }); }
      else if (ev.t === "e") error = ev.m || "AI error";
    };
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      arm(IDLE_MS);
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
    }
    buf += dec.decode();
    if (buf) handle(buf);
    return { text, calls, error };
  } catch (e) {
    if (stalled && !signal?.aborted) {
      // Nothing shown yet → quietly try once more on a fresh connection.
      if (attempt < 1 && !text) { onPhase?.({ p: "retry" }); return streamRound(body, { onText, onPhase, signal }, attempt + 1); }
      throw new Error("The connection is too slow right now. Please check your internet and try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.("abort", onOuterAbort);
  }
}

/**
 * runAgent(history, query, lang, profile, extras, { onDelta, onStep, onStatus, signal })
 *   onDelta(visibleText) — the answer as it streams
 *   onStep(steps)        — the list of steps so far: [{ icon, label, done }]
 * Resolves to { reply, followUps, actions, steps, ui, schemeIds }.
 */
export async function runAgent(history, query, lang = "en", profile = null, extras = {}, hooks = {}) {
  const { onDelta, onStep, onPhase, signal } = hooks;
  const ctx = { lang, profile, answers: extras.answers || null, matched: extras.matched || [], signal };
  const base = buildChatBody(history, query, lang, profile, { ...extras, agent: true });
  const messages = [...base.messages];
  const steps = [];
  const ui = { checklist: null, open: [], tracked: [], quiz: null };
  const schemeIds = [];
  const pushStep = (s) => { steps.push(s); onStep?.(steps.map(x => ({ ...x }))); };

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const final = round === MAX_ROUNDS - 1;
      let shown = false;
      // Live activity: first round = reading the question; later rounds =
      // reviewing what the tools found.
      onPhase?.({ p: round === 0 ? "send" : "review" });
      const { text, calls, error } = await streamRound(
        { ...base, messages, stream: true, agent: true, final },
        {
          signal,
          onPhase,
          // Shown live; if this round ends in tool calls instead, it was the
          // model "thinking out loud" and is cleared below.
          onText: (t) => { shown = true; onDelta?.(visibleStreamText(t)); },
        },
      );
      if (!calls.length) {
        if (!text.trim()) throw new Error(error || "Empty response from AI. Please try again.");
        const parsed = parseResponse(text.trim());
        if (!ui.tracked.length && CLAIMS_TRACKED.test(parsed.reply)) {
          const fromQuery = findSchemesInText(query, 2);
          const pick = fromQuery.length === 1 ? fromQuery[0] : (fromQuery.length === 0 ? (findSchemesInText(parsed.reply, 2).length === 1 ? findSchemesInText(parsed.reply, 2)[0] : null) : null);
          if (ASKS_TRACK.test(query) && pick) {
            const meta = TOOL_META.track_application;
            const step = { icon: meta.icon, label: lang === "hi" ? meta.hi : meta.en, done: false };
            pushStep(step);
            const out = await runTool("track_application", JSON.stringify({ scheme: pick.name?.en || pick.id }), ctx);
            step.label = out.step || step.label; step.done = true;
            onStep?.(steps.map(x => ({ ...x })));
            if (out.ui?.tracked) ui.tracked.push(out.ui.tracked);
            for (const id of out.schemeIds || []) if (!schemeIds.includes(id)) schemeIds.push(id);
          } else {
            parsed.reply += lang === "hi"
              ? "\n\n⚠️ यह अभी सेव नहीं हुआ है — योजना खोलें और \"मैंने आवेदन किया\" दबाएं, या मुझे योजना का पूरा नाम बताएं।"
              : "\n\n⚠️ This isn't saved yet — open the scheme and tap \"I've applied — track it\", or tell me the scheme's full name.";
          }
        }
        return { ...parsed, steps: steps.map(({ icon, label }) => ({ icon, label })), ui, schemeIds };
      }
      if (shown) onDelta?.(""); // it was thinking out loud — clear it, tools come next

      messages.push({
        role: "assistant",
        content: text || "",
        tool_calls: calls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.args || "{}" } })),
      });
      onPhase?.({ p: "tools", n: calls.length });
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
        if (out.ui?.quiz) ui.quiz = out.ui.quiz;
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
