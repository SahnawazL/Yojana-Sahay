/**
 * Yojana Sahay — AIChat.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * See the LICENSE file in the project root for full license terms.
 */

// AIChat.jsx — Yojana Sahay AI Assistant Chat Screen
// UPDATED: unified "Reading Time" cooldown gates both input + chips together
// FIXED (5 bugs): anti-pattern in updater, memory leaks, dead state, stale closure

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { runAgent } from "./agent.js";
import { QUESTIONS, nextQuestion, questionQueue, withImplied, eligibilityResult, startingAnswers, STATES } from "./chatEligibility.js";
import { canSpeak, speak, stopSpeaking, voiceLabel } from "./voice.js";
import { findSchemesInText, schemePageUrl, SITE_URL } from "./schemeMatch.js";
import { useApplications, daysSince, trackApplication } from "./applications.js";
import { track } from "./track.js";
import { SCHEME_DB } from "./schemesData.js";
import aiAvatar from "./ai-avatar.webp";
import { TOOL_META } from "./agentTools.js";
import { auth } from "./firebase.js";

// ─── SOUND EFFECTS (Web Audio API — no files, no loading) ────────────────────
// Each function creates a one-shot AudioContext, plays a tone, then closes it.
// Safe to call even if the browser blocks autoplay — errors are silently caught.

function playSendSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Short ascending "whoosh" — iMessage-style send
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  } catch (_) {}
}

function playReceiveSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    // Two-tone soft chime — pleasant "ding ding" descending
    [[880, 0, 0.14], [660, 0.16, 0.3]].forEach(([freq, start, end]) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.13, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + end);
      osc.onended = () => { try { ctx.close(); } catch(_) {} };
    });
  } catch (_) {}
}

// C major arpeggio — 3 chips, 3 ascending notes (C5 → E5 → G5)
// Timed to match each chip's animation delay (i * 0.22s) + pop peak (~0.15s in)
const CHIP_FREQS = [523, 659, 784]; // C5, E5, G5

function playChipSounds(count) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);

    Array.from({ length: count }).forEach((_, i) => {
      const freq  = CHIP_FREQS[i] ?? CHIP_FREQS[CHIP_FREQS.length - 1];
      const delay = i * 0.22 + 0.15; // sync with chip-in animation + pop peak

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      osc.type = "sine";
      osc.frequency.value = freq;

      // Quick soft bell: fade in → fade out
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.11, ctx.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.22);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });

    // Close context after all sounds finish
    setTimeout(() => { try { ctx.close(); } catch(_) {} }, (count * 0.22 + 0.5) * 1000);
  } catch (_) {}
}

// ─── CHAT HISTORY PERSISTENCE ────────────────────────────────────────────────
// Key is per-user so each account gets its own isolated chat history
const SCHEME_BY_ID_CHAT = new Map(SCHEME_DB.map(s => [s.id, s]));
const chatStorageKey = (uid) => uid ? `yojana_chat_${uid}` : "yojana_chat_guest";

const THEME = {
  light: {
    appBg:"#f5f5f0", card:"#fff",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#f0f0f0", border2:"#e8e8e8",
    inputBg:"#fff", navBg:"#fff",
  },
  dark: {
    appBg:"#111111", card:"#1c1c1e",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", border2:"#3a3a3c",
    inputBg:"#2c2c2e", navBg:"#1c1c1e",
  },
};

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

const SUGGESTED = {
  en: [
    { icon:"🌾", text:"Schemes for farmers" },
    { icon:"📚", text:"Student scholarships available" },
    { icon:"🏠", text:"Housing schemes for poor families" },
    { icon:"👩", text:"Schemes for women welfare" },
    { icon:"💼", text:"Business loan schemes" },
    { icon:"👴", text:"Senior citizen pension schemes" },
  ],
  hi: [
    { icon:"🌾", text:"किसानों के लिए योजनाएं" },
    { icon:"📚", text:"छात्रवृत्ति योजनाएं" },
    { icon:"🏠", text:"गरीबों के लिए आवास योजना" },
    { icon:"👩", text:"महिला कल्याण योजनाएं" },
    { icon:"💼", text:"व्यापार लोन योजनाएं" },
    { icon:"👴", text:"वरिष्ठ नागरिक पेंशन" },
  ],
};

// ─── WHAT THE ASSISTANT CAN DO ───────────────────────────────────────────────
// Shown on the welcome screen, in the "✨ What can I do?" sheet, and in the
// one-time "New" banner — so people discover the smart features.
// action: "quiz" = start the in-chat check · "send" = ask it now ·
//         "fill" = put a starter in the box for the user to finish.
const CAPABILITIES = [
  { id:"quiz",    icon:"✅", action:"quiz",
    en:{ t:"Find schemes for me",        s:"A few taps — I ask only what I don't know" },
    hi:{ t:"मेरे लिए योजनाएं खोजें",        s:"कुछ टैप — सिर्फ़ वही पूछूंगा जो नहीं पता" } },
  { id:"family",  icon:"👨‍👩‍👧", action:"fill",
    en:{ t:"Check for family",            s:"Mother, father, son, wife…", x:"Check schemes for my mother, she is " },
    hi:{ t:"परिवार के लिए जांचें",           s:"मां, पिता, बेटा, पत्नी…",      x:"मेरी मां के लिए योजनाएं देखें, उनकी उम्र " } },
  { id:"scam",    icon:"🛡️", action:"fill",
    en:{ t:"Is this message real?",       s:"Paste a forward or link — I check for scams", x:"Is this real? " },
    hi:{ t:"क्या यह मैसेज असली है?",        s:"फॉरवर्ड या लिंक पेस्ट करें — धोखा जांचूंगा",   x:"क्या यह असली है? " } },
  { id:"why",     icon:"❓", action:"fill",
    en:{ t:"Why am I not eligible?",      s:"Exact reason + how to fix it", x:"Why am I not eligible for " },
    hi:{ t:"मैं पात्र क्यों नहीं?",            s:"सही कारण + क्या करें",          x:"मैं इस योजना के लिए पात्र क्यों नहीं हूं: " } },
  { id:"almost",  icon:"🎯", action:"send",
    en:{ t:"Almost eligible",             s:"Schemes one step away",        x:"Which schemes am I almost eligible for?" },
    hi:{ t:"लगभग पात्र",                   s:"बस एक कदम दूर वाली योजनाएं",     x:"मैं किन योजनाओं के लिए लगभग पात्र हूं?" } },
  { id:"compare", icon:"⚖️", action:"fill",
    en:{ t:"Compare schemes",             s:"Side by side, which is better", x:"Compare PM Kisan and " },
    hi:{ t:"योजनाओं की तुलना",              s:"कौन सी बेहतर है",                x:"पीएम किसान और इस योजना की तुलना करें: " } },
  { id:"docs",    icon:"📋", action:"fill",
    en:{ t:"Documents checklist",         s:"One list for many schemes",    x:"What documents do I need for " },
    hi:{ t:"दस्तावेज़ सूची",                 s:"कई योजनाओं की एक सूची",          x:"इन योजनाओं के लिए कौन से दस्तावेज़ चाहिए: " } },
  { id:"track",   icon:"📌", action:"fill",
    en:{ t:"Track my application",        s:"Tell me — I'll save & remind", x:"I applied for " },
    hi:{ t:"मेरा आवेदन ट्रैक करें",           s:"बताइए — सेव करके याद दिलाऊंगा",   x:"मैंने इस योजना में आवेदन किया है: " } },
  { id:"status",  icon:"🗂️", action:"send",
    en:{ t:"My applications",             s:"What's pending, what to do",   x:"What's the status of my applications? What should I do next?" },
    hi:{ t:"मेरे आवेदन",                    s:"क्या बाकी है, आगे क्या करें",       x:"मेरे आवेदनों की स्थिति क्या है? आगे क्या करूं?" } },
  { id:"news",    icon:"🌐", action:"send",
    en:{ t:"Latest news & deadlines",     s:"I search the web live",        x:"Any new schemes, installments or deadlines this month for me?" },
    hi:{ t:"ताज़ा खबर और आखिरी तारीख",       s:"वेब पर लाइव खोज",                x:"इस महीने मेरे लिए कोई नई योजना, किस्त या आखिरी तारीख?" } },
];
const CAP_TIPS = {
  en: [["mic", "Speak — Hindi or English"], ["volume", "Tap Listen to hear any answer"], ["pen", "Type the way you talk — “budhape ki pension”"], ["file", "Tap a scheme card for its full page"]],
  hi: [["mic", "बोलकर पूछें — हिंदी या English"], ["volume", "किसी भी जवाब पर “सुनें” दबाएं"], ["pen", "जैसे बोलते हैं वैसे लिखें — “बुढ़ापे की पेंशन”"], ["file", "योजना कार्ड पर टैप करें — पूरी जानकारी"]],
};

// Clean line icons (24×24, stroke) — one visual language instead of emoji.
const CAP_ICON_PATHS = {
  quiz:    ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "m20 20-4-4", "m8.5 11 2 2 3.5-3.5"],
  family:  ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5", "M16 4.3a3.5 3.5 0 0 1 0 6.4", "M18 14.8c2 .7 3.2 2.5 3.5 5.2"],
  scam:    ["M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z", "m9 12 2 2 4-4"],
  why:     ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M9.6 9.2a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.3-2.4 3.9", "M12 17h.01"],
  almost:  ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z", "M12 12h.01"],
  compare: ["M12 4v16", "M7 20h10", "M5 8h14", "m5 8-2.5 6a3 3 0 0 0 5 0L5 8Z", "m19 8-2.5 6a3 3 0 0 0 5 0L19 8Z"],
  docs:    ["M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z", "M16 5h1.5A1.5 1.5 0 0 1 19 6.5v13A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-13A1.5 1.5 0 0 1 6.5 5H8", "M9 11h6", "M9 15h4"],
  track:   ["M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z", "M12 7v6", "M9 10h6"],
  status:  ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z", "M8 14h3", "M8 11h8"],
  news:    ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M3 12h18", "M12 3c2.5 2.5 3.7 5.5 3.7 9s-1.2 6.5-3.7 9c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3Z"],
  mic:     ["M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z", "M5.5 11a6.5 6.5 0 0 0 13 0", "M12 17.5V21"],
  volume:  ["M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5Z", "M15.5 9a4 4 0 0 1 0 6", "M18 6.5a7.5 7.5 0 0 1 0 11"],
  pen:     ["m15 5 4 4", "M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5 4 20Z"],
  file:    ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z", "M14 3v5h5", "M9 13h6", "M9 17h6"],
  spark:   ["M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2l5.5 1.8-5.5 1.8a2 2 0 0 0-1.2 1.2L12 20.5 10.2 15A2 2 0 0 0 9 13.8L3.5 12 9 10.2A2 2 0 0 0 10.2 9L12 3.5Z", "M19 3v3", "M17.5 4.5h3"],
};
function CapIcon({ name, size = 18, color = "currentColor", stroke = 1.9 }) {
  const paths = CAP_ICON_PATHS[name] || CAP_ICON_PATHS.spark;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink:0, display:"block" }}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
// Each capability: a calm tint for its icon tile (light / dark).
const CAP_TINT = {
  quiz:    ["#2563EB", "#93C5FD"], family: ["#7C3AED", "#C4B5FD"], scam:  ["#059669", "#6EE7B7"],
  why:     ["#D97706", "#FCD34D"], almost: ["#DB2777", "#F9A8D4"], compare: ["#0891B2", "#67E8F9"],
  docs:    ["#4F46E5", "#A5B4FC"], track:  ["#EA580C", "#FDBA74"], status: ["#0D9488", "#5EEAD4"], news: ["#2563EB", "#93C5FD"],
};
const capTint = (id, dark) => (CAP_TINT[id] || ["#475569", "#CBD5E1"])[dark ? 1 : 0];
function CapTile({ id, dark, size = 36 }) {
  const c = capTint(id, dark);
  return (
    <span style={{ width:size, height:size, borderRadius:size * 0.3, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center",
      background: dark ? `${c}1F` : `${c}14`, boxShadow:`inset 0 0 0 1px ${c}${dark ? "33" : "22"}` }}>
      <CapIcon name={id} size={Math.round(size * 0.5)} color={c} />
    </span>
  );
}
const CAP_GROUPS = [
  { en:"Find schemes",          hi:"योजनाएं खोजें",         ids:["quiz", "almost", "why", "family"] },
  { en:"Check & compare",       hi:"जांचें और तुलना करें",    ids:["scam", "compare", "docs"] },
  { en:"Track & stay updated",  hi:"ट्रैक करें, अपडेट रहें",   ids:["track", "status", "news"] },
];

function CapabilityGrid({ items, lang, dark, onPick }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const L = lang === "hi" ? "hi" : "en";
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      {items.map(c => (
        <div key={c.id} role="button" tabIndex={0} className="ai-suggested" onClick={() => onPick(c)}
          onKeyDown={e => { if (e.key === "Enter") onPick(c); }}
          style={{ background: dark ? "#1A1B1F" : "#FFFFFF", border:`1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}`, borderRadius:14, padding:"11px 12px",
            cursor:"pointer", fontFamily:bf, boxShadow: dark ? "none" : "0 1px 2px rgba(15,23,42,0.05)",
            transition:"opacity 0.15s, transform 0.15s", minWidth:0 }}>
          <CapTile id={c.id} dark={dark} size={30} />
          <div style={{ fontSize:12.5, fontWeight:700, color:th.text, marginTop:8, lineHeight:1.25 }}>{c[L].t}</div>
          <div style={{ fontSize:10.5, color:th.textMid, marginTop:3, lineHeight:1.35 }}>{c[L].s}</div>
        </div>
      ))}
    </div>
  );
}

// "What can I do?" bottom sheet — grouped actions + quick tips.
function CapabilitiesSheet({ lang, dark, onPick, onClose }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  const L = isHindi ? "hi" : "en";
  const byId = Object.fromEntries(CAPABILITIES.map(c => [c.id, c]));
  const line = dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)";
  const card = dark ? "#1A1B1F" : "#FFFFFF";
  const sub = dark ? "rgba(203,213,225,0.6)" : "#64748B";
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const pick = (c) => { onClose(); onPick(c); };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(2,6,23,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fade-in 0.2s ease-out" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-label={isHindi ? "मैं क्या कर सकता हूं" : "What I can do"}
        style={{ width:"100%", maxWidth:560, maxHeight:"86vh", background: dark ? "#111214" : "#F6F7F9", borderRadius:"22px 22px 0 0", display:"flex", flexDirection:"column", fontFamily:bf,
          animation:"chips-reveal 0.25s ease-out", boxShadow:"0 -10px 40px rgba(2,6,23,0.3)" }}>
        {/* grab handle */}
        <div style={{ display:"flex", justifyContent:"center", paddingTop:8 }}>
          <span style={{ width:38, height:4, borderRadius:4, background: dark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.15)" }} />
        </div>
        {/* header */}
        <div style={{ padding:"12px 16px 10px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg,#FF9933 0%,#6366F1 100%)", boxShadow:"0 6px 16px -6px rgba(99,102,241,0.55)" }}>
            <CapIcon name="spark" size={21} color="#FFFFFF" stroke={2} />
          </span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:16.5, fontWeight:800, color:th.text, letterSpacing:-0.2 }}>{isHindi ? "मैं क्या कर सकता हूं" : "What I can do"}</div>
            <div style={{ fontSize:12, color:sub, marginTop:2, lineHeight:1.4 }}>
              {isHindi ? "पात्रता जांच, आवेदन ट्रैक करना और काम पूरे करना" : "Check eligibility, track applications and get things done"}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={isHindi ? "बंद करें" : "Close"}
            style={{ width:32, height:32, borderRadius:"50%", border:"none", flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              background: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)", color:th.textMid }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div style={{ overflowY:"auto", padding:"2px 14px calc(18px + env(safe-area-inset-bottom))" }}>
          {CAP_GROUPS.map(g => (
            <div key={g.en} style={{ marginTop:12 }}>
              <div style={{ fontSize:10.5, fontWeight:800, color:sub, letterSpacing:0.8, textTransform:"uppercase", margin:"0 4px 7px" }}>{g[L]}</div>
              <div style={{ background:card, border:`1px solid ${line}`, borderRadius:16, overflow:"hidden" }}>
                {g.ids.map((id, i) => {
                  const c = byId[id]; if (!c) return null;
                  return (
                    <div key={id} role="button" tabIndex={0} onClick={() => pick(c)} onKeyDown={e => { if (e.key === "Enter") pick(c); }}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 12px", cursor:"pointer", borderTop: i ? `1px solid ${line}` : "none", WebkitTapHighlightColor:"transparent" }}>
                      <CapTile id={id} dark={dark} size={36} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13.5, fontWeight:700, color:th.text, lineHeight:1.3 }}>{c[L].t}</div>
                        <div style={{ fontSize:11.5, color:sub, marginTop:2, lineHeight:1.35 }}>{c[L].s}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink:0 }}><path d="m9 6 6 6-6 6" /></svg>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ fontSize:10.5, fontWeight:800, color:sub, letterSpacing:0.8, textTransform:"uppercase", margin:"18px 4px 7px" }}>
            {isHindi ? "टिप्स" : "Tips"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {CAP_TIPS[L].map(([ic, t]) => (
              <div key={t} style={{ display:"flex", alignItems:"flex-start", gap:8, background:card, border:`1px solid ${line}`, borderRadius:12, padding:"9px 10px" }}>
                <span style={{ marginTop:1, color: dark ? "#FDBA74" : "#C2410C" }}><CapIcon name={ic} size={15} /></span>
                <span style={{ fontSize:11.5, color:th.textMid, lineHeight:1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SMART READING TIME ─────────────────────────────────────────────────────
// How long a careful (often first-time, rural) reader needs for THIS reply:
//  • counts only words people read — links, markdown and list markers removed
//  • Hindi is read slower than English (≈2.2 vs 3 words/sec)
//  • extra time for numbers/amounts, separate lines and scheme cards below
//  • time already spent reading while the answer streamed in is counted
//  • short replies ("Namaste! How can I help?") and tap-to-answer cards get
//    no pause at all; nothing waits longer than 25s
// Returns { secs, kind, words, schemes } — kind picks the bar's wording.
function readingPlan(text, ctx = {}) {
  const clean = String(text || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_#>`|~]/g, " ")
    .replace(/^\s*(?:[-•]|\d+[.)])\s+/gm, "");
  const tokens = clean.match(/[\p{L}\p{N}₹][\p{L}\p{M}\p{N}₹,.\/%-]*/gu) || [];
  const words = tokens.length;
  const hindiWords = tokens.filter(w => /[\u0900-\u097F]/.test(w)).length;
  const wps = hindiWords > words * 0.3 ? 2.2 : 3;
  const numbers = (clean.match(/₹\s?[\d,]+|\b\d[\d,]*(?:\.\d+)?\b/g) || []).length;
  const lines = clean.split(/\n+/).filter(l => l.trim()).length;
  const schemes = Math.min(ctx.schemes || 0, 6);
  const kind = ctx.quiz ? "quiz" : ctx.checklist ? "docs" : schemes > 1 ? "schemes" : schemes === 1 ? "scheme" : words > 140 ? "long" : "answer";
  if (ctx.quiz || (words <= 12 && !schemes)) return { secs: 0, kind, words, schemes };
  let secs = words / wps + Math.min(numbers, 8) * 0.4 + Math.min(Math.max(lines - 1, 0), 10) * 0.3 + schemes;
  secs -= (ctx.alreadyRead || 0) * 0.85;
  return { secs: Math.round(Math.max(3, Math.min(25, secs))), kind, words, schemes };
}

// ─── MESSAGE TIMESTAMP FORMATTER ─────────────────────────────────────────────
// Returns a localized, human-readable timestamp for each chat message.
// • Today        → "2:34 PM"
// • Yesterday    → "Yesterday · 2:34 PM"
// • This year    → "May 21 · 2:34 PM"
// • Older        → "May 21, 2024 · 2:34 PM"

// Day separators ("Today", "Yesterday", "14 Oct") + time-only labels, so each
// bubble doesn't repeat the date.
const dayKeyOf = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
function dayLabelOf(ts, lang) {
  const d = new Date(ts), now = new Date();
  const diff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  if (diff === 0) return lang === "hi" ? "आज" : "Today";
  if (diff === 1) return lang === "hi" ? "कल" : "Yesterday";
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day:"numeric", month:"short", ...(d.getFullYear() === now.getFullYear() ? {} : { year:"numeric" }) });
}
const clockOf = (ts, lang) => (ts ? new Date(ts).toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-IN", { hour:"numeric", minute:"2-digit", hour12:true }) : null);

const GLOBAL_CSS = `
@keyframes bubble-in {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes bubble-in-user {
  0%   { opacity:0; transform:translateX(16px) scale(0.91); }
  55%  { opacity:1; transform:translateX(-4px) scale(1.025); }
  78%  { transform:translateX(2px) scale(0.988); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes bubble-in-ai {
  0%   { opacity:0; transform:translateX(-16px) scale(0.91); }
  55%  { opacity:1; transform:translateX(4px) scale(1.025); }
  78%  { transform:translateX(-2px) scale(0.988); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes fade-in {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes chip-out {
  0%   { opacity:1;   transform:scale(1); }
  55%  { opacity:0.2; transform:scale(0.82); }
  100% { opacity:0;   transform:scale(0.68); }
}
@keyframes chip-in {
  0%   { opacity:0;   transform:translateY(20px) scale(0.75); }
  55%  { opacity:1;   transform:translateY(-6px) scale(1.07); }
  75%  { opacity:1;   transform:translateY(2px)  scale(0.97); }
  100% { opacity:1;   transform:translateY(0)    scale(1);    }
}
@keyframes shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}
@keyframes ys-activity-sweep {
  0%   { transform: translateX(-110%); }
  100% { transform: translateX(290%); }
}
@keyframes focus-glow {
  0%,100% { box-shadow: 0 0 0 3px rgba(255,153,51,0.15); }
  50%      { box-shadow: 0 0 0 4px rgba(255,153,51,0.28); }
}
@keyframes avatar-pulse {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
}
@keyframes chips-reveal {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes unlock-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.18); }
  70%  { transform: scale(0.93); }
  100% { transform: scale(1); }
}
/* Long-press opens the answer menu (Copy is in it), so phones don't start a
   text selection or show the browser's own callout on the answer. */
@media (pointer: coarse) {
  .ai-answer-press { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
}
@keyframes typing-cursor {
  0%,100% { opacity: 1; }
  50%      { opacity: 0; }
}
@keyframes gradient-border-breathe {
  0%,100% { opacity: 0.75; }
  50%      { opacity: 1; }
}
@keyframes badge-pop {
  0%   { opacity:0; transform:scale(0.7) translateY(3px); }
  65%  { opacity:1; transform:scale(1.08) translateY(-1px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes header-fade {
  from { opacity:0; transform:translateY(-4px); }
  to   { opacity:1; transform:translateY(0); }
}
.ai-msg-bubble      { animation: bubble-in 0.22s ease-out; }
.ai-msg-bubble-user { animation: bubble-in-user 0.38s ease-out; }
.ai-msg-bubble-ai   { animation: bubble-in-ai 0.38s ease-out; }
.ai-suggested:active { opacity:0.7; transform:scale(0.98); }
.ai-send-btn:active  { opacity:0.85; transform:scale(0.95); }
.ai-textarea:focus   { outline:none; box-shadow: 0 0 0 3px rgba(255,153,51,0.2); animation: focus-glow 2s ease-in-out infinite; }
.ai-avatar-pulse     { animation: avatar-pulse 1.4s ease-in-out infinite; }
.chips-container     { animation: chips-reveal 0.3s ease-out; }
.unlock-bounce       { animation: unlock-bounce 0.4s ease-out; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes avatar-preview-in {
  0%   { opacity:0; transform:scale(0.55) translateY(20px); }
  60%  { opacity:1; transform:scale(1.04) translateY(-4px); }
  80%  { transform:scale(0.97) translateY(2px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes avatar-preview-out {
  0%   { opacity:1; transform:scale(1); }
  100% { opacity:0; transform:scale(0.6) translateY(16px); }
}
@keyframes avatar-overlay-in {
  from { opacity:0; backdrop-filter:blur(0px); }
  to   { opacity:1; backdrop-filter:blur(18px); }
}
@keyframes avatar-overlay-out {
  from { opacity:1; }
  to   { opacity:0; }
}
@keyframes border-rotate {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}
@keyframes mic-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.55); }
  100% { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
}
.ai-scheme-card:active { transform:scale(0.985); opacity:0.9; }
@keyframes avatar-hint-pulse {
  0%,100% { opacity:0.55; transform:scale(1); }
  50%     { opacity:0.9;  transform:scale(1.06); }
}
`;

// ─── AVATAR PREVIEW MODAL ────────────────────────────────────────────────────
// Tap the avatar in the header → centered modal with animated rainbow border.
// Tap or hold anywhere (overlay or image) to dismiss.
function AvatarPreviewModal({ onClose }) {
  const [closing, setClosing] = useState(false);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 260);
  }, [closing, onClose]);

  // Long-press / hold also dismisses (pointerup after pointerdown)
  const holdTimer = useRef(null);
  const onPointerDown = () => {
    holdTimer.current = setTimeout(dismiss, 400);
  };
  const onPointerUp = () => {
    clearTimeout(holdTimer.current);
  };

  return (
    <div
      onClick={dismiss}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        position:"fixed", inset:0, zIndex:9999,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(0,0,0,0.62)",
        animation: closing ? "avatar-overlay-out 0.26s ease-out forwards"
                           : "avatar-overlay-in 0.28s ease-out forwards",
        WebkitBackdropFilter:"blur(18px)",
        backdropFilter:"blur(18px)",
        cursor:"pointer",
      }}
    >
      {/* Outer rotating rainbow ring */}
      <div style={{
        position:"relative",
        animation: closing ? "avatar-preview-out 0.26s ease-in forwards"
                           : "avatar-preview-in 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        {/* Spinning gradient ring behind the image */}
        <div style={{
          position:"absolute", inset:-5, borderRadius:"50%",
          background:"conic-gradient(from 0deg, #FF9933, #fff, #138808, #003580, #6366f1, #FF9933)",
          animation:"border-rotate 2.4s linear infinite",
          zIndex:0,
        }} />
        {/* White halo separating ring from image */}
        <div style={{
          position:"absolute", inset:-2, borderRadius:"50%",
          background:"rgba(255,255,255,0.18)",
          zIndex:1,
        }} />
        {/* Avatar image */}
        <div style={{
          position:"relative", zIndex:2,
          width:240, height:240, borderRadius:"50%",
          overflow:"hidden",
          background:"#0a1628",
          boxShadow:"0 8px 48px rgba(0,0,0,0.55), 0 0 0 3px rgba(255,255,255,0.25)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <img src={aiAvatar} alt="AI Avatar"
            style={{
              width:"92%", height:"92%",
              objectFit:"contain",
              objectPosition:"center center",
              display:"block",
            }}
          />
        </div>
        {/* "Hold to dismiss" hint */}
        <div style={{
          position:"absolute", bottom:-38, left:"50%", transform:"translateX(-50%)",
          color:"rgba(255,255,255,0.7)", fontSize:12, whiteSpace:"nowrap",
          animation:"avatar-hint-pulse 1.8s ease-in-out infinite",
          letterSpacing:0.4,
        }}>
          Tap anywhere to close
        </div>
      </div>
    </div>
  );
}

// ─── ASHOK CHAKRA SVG ────────────────────────────────────────────────────────
// Real 24-spoke Dharma Chakra — navy blue on white, exactly like the Indian flag.
// Outer ring uses a conic gradient cycling through India's tricolor (saffron →
// white → green) so the border colours change smoothly as the wheel spins.
// compact: for small sizes (header) — same 24 spokes, drawn bolder with a
// cleaner rim and a lighter glow, so it stays crisp instead of a blur.
function AshokChakra({ size = 44, duration = "10s", compact = false }) {
  const n     = 24;
  const cx    = 50, cy = 50;
  const toRad = d => (d * Math.PI) / 180;
  const navy  = "#003580"; // exact Indian-flag chakra navy

  // Geometry (SVG viewBox 100×100)
  const rimOuter  = compact ? 47 : 46;
  const rimInner  = compact ? 40 : 37;
  const hubR      = compact ? 9 : 7;
  const spokeFrom = hubR + 2.5;

  // 24 spokes
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = toRad(i * (360 / n) - 90);
    return {
      x1: cx + spokeFrom * Math.cos(a),
      y1: cy + spokeFrom * Math.sin(a),
      x2: cx + rimInner  * Math.cos(a),
      y2: cy + rimInner  * Math.sin(a),
    };
  });

  // 24 lens/leaf arrowheads between spokes, inside the rim band
  const leaves = Array.from({ length: n }, (_, i) => {
    const angleDeg = i * (360 / n) + (360 / n / 2) - 90;
    const a  = toRad(angleDeg);
    const tr = (rimInner + rimOuter) / 2;
    return {
      cx:  cx + tr * Math.cos(a),
      cy:  cy + tr * Math.sin(a),
      rot: angleDeg + 90,
    };
  });

  const border    = compact ? 2.5 : 3.5; // tricolor ring thickness in px
  const innerSize = size - border * 2; // SVG fits inside the white disc

  return (
    // ── Outer ring: Indian tricolor conic gradient ──────────────────────────
    // Saffron(0°) → White(120°) → Green(240°) → Saffron(360°) — smoothly
    // connected. Rotating this div makes the colours appear to flow around.
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "conic-gradient(from 0deg, #FF9933 0deg, #FFFFFF 120deg, #138808 240deg, #FF9933 360deg)",
      padding: border,
      boxShadow: compact
        ? "0 0 0 1px rgba(0,53,128,0.10), 0 2px 6px rgba(255,153,51,0.35)"
        : "0 0 16px rgba(255,153,51,0.6), 0 0 32px rgba(19,136,8,0.3), 0 2px 8px rgba(0,0,0,0.25)",
      animation: `spin ${duration} linear infinite`,
    }}>
      {/* ── White disc — chakra sits on white, exactly like the Indian flag ── */}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <svg width={innerSize} height={innerSize} viewBox="0 0 100 100">
          {/* Outer rim */}
          <circle cx={cx} cy={cy} r={rimOuter}
            fill="none" stroke={navy} strokeWidth={compact ? 6 : 7} />
          {/* Inner rim line */}
          {!compact && <circle cx={cx} cy={cy} r={rimInner}
            fill="none" stroke={navy} strokeWidth="1.8" />}
          {/* Solid hub */}
          <circle cx={cx} cy={cy} r={hubR} fill={navy} />
          {/* 24 spokes */}
          {spokes.map((s, i) => (
            <line key={i}
              x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke={navy} strokeWidth={compact ? 3.6 : 2.4} strokeLinecap="round"
            />
          ))}
          {/* 24 lens-shaped arrowheads between spokes */}
          {!compact && leaves.map((l, i) => (
            <g key={i} transform={`translate(${l.cx},${l.cy}) rotate(${l.rot})`}>
              <path d="M 0,-5.5 Q 4,0 0,5.5 Q -4,0 0,-5.5 Z" fill={navy} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── AGENT STEPS — what the assistant is doing / did ──────────────────────────
function AgentSteps({ steps, dark, lang, compact = false }) {
  if (!steps?.length) return null;
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: compact ? 3 : 5, fontFamily:fontFamily(lang) }}>
      {steps.map((st, i) => (
        <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, fontSize: compact ? 11 : 11.5, lineHeight:1.4, color: st.done === false ? th.text : th.textMid, animation:"fade-in 0.25s ease-out" }}>
          <span style={{ width:16, flexShrink:0, textAlign:"center" }}>
            {st.done === false
              ? <span style={{ display:"inline-block", width:10, height:10, border:"2px solid #F97316", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", verticalAlign:"middle" }} />
              : st.icon}
          </span>
          <span style={{ flex:1, minWidth:0, fontWeight: st.done === false ? 700 : 500 }}>{st.label}{st.done === false ? "…" : ""}</span>
          {st.done === true && <span style={{ color:"#16a34a", fontWeight:800, flexShrink:0 }}>✓</span>}
        </div>
      ))}
    </div>
  );
}

// Collapsed "Did 3 steps" row inside a finished answer.
function StepsSummary({ steps, dark, lang }) {
  const [open, setOpen] = useState(false);
  if (!steps?.length) return null;
  const isHindi = lang === "hi";
  return (
    <div style={{ marginBottom:8 }}>
      <span role="button" onClick={() => setOpen(o => !o)}
        style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:10.5, fontWeight:700, cursor:"pointer", userSelect:"none",
          color: dark ? "#cfe0ff" : "#003580", background: dark ? "rgba(20,40,80,0.5)" : "rgba(255,255,255,0.85)",
          border:`1px solid ${dark ? "rgba(120,170,255,0.3)" : "rgba(0,53,128,0.18)"}`, borderRadius:12, padding:"2px 9px" }}>
        ⚙️ {isHindi ? `${steps.length} कदम उठाए` : `Did ${steps.length} step${steps.length === 1 ? "" : "s"}`} <span style={{ fontSize:9 }}>{open ? "▲" : "▼"}</span>
      </span>
      {open && <div style={{ marginTop:7, whiteSpace:"normal" }}><AgentSteps steps={steps.map(x => ({ ...x, done: true }))} dark={dark} lang={lang} compact /></div>}
    </div>
  );
}

// ─── LIVE ACTIVITY — what the assistant is really doing right now ──────────
// Built from real events: the app sending the question, the server saying
// the model started reasoning / picked a tool / switched to the backup
// model, the app running each tool (with its actual result), and the model
// reviewing those results. Finished stages stay listed with how long they
// took; a timer shows the total wait.
const PHASE_TEXT = {
  send:    { icon: "📨", en: "Reading your question",              hi: "आपका सवाल पढ़ रहे हैं" },
  think:   { icon: "🧠", en: "Thinking it through",                hi: "सोच-विचार कर रहे हैं" },
  plan:    { icon: "🧭", en: "Choosing what to check",             hi: "तय कर रहे हैं क्या जांचना है" },
  tools:   { icon: "⚙️", en: "Looking it up in the app",           hi: "ऐप में जानकारी देख रहे हैं" },
  review:  { icon: "🔎", en: "Reviewing what I found",             hi: "मिली जानकारी जांच रहे हैं" },
  backup:  { icon: "⚡", en: "Main AI is busy — using the fast backup", hi: "मुख्य AI व्यस्त — तेज़ बैकअप से जवाब" },
  search:  { icon: "🌐", en: "Checking the web for the latest",    hi: "वेब पर ताज़ा जानकारी खोज रहे हैं" },
  retry:   { icon: "🔄", en: "Slow connection — trying again",     hi: "कनेक्शन धीमा — दोबारा कोशिश कर रहे हैं" },
};
function phaseLabel(ph, lang) {
  if (!ph) return "";
  const hi = lang === "hi";
  if (ph.p === "plan" && ph.n) {
    const m = TOOL_META[ph.n];
    if (m) return hi ? `अगला कदम: ${m.hi}` : `Next: ${m.en.charAt(0).toLowerCase()}${m.en.slice(1)}`;
  }
  if (ph.p === "search" && ph.n) return hi ? `वेब पर खोज: “${ph.n}”` : `Searching the web: “${ph.n}”`;
  const t = PHASE_TEXT[ph.p];
  return t ? (hi ? t.hi : t.en) : "";
}
const phaseIcon = (ph) => (ph?.p === "plan" && TOOL_META[ph.n]?.icon) || PHASE_TEXT[ph?.p]?.icon || "✨";
const fmtSecs = (ms) => (ms < 10000 ? (ms / 1000).toFixed(1) : Math.round(ms / 1000)) + "s";

function LiveClock({ since }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);
  return <>{fmtSecs(Math.max(0, now - (since || now)))}</>;
}

function TypingIndicator({ dark, status, lang, steps, phase, trail, startedAt }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  const [slow, setSlow] = useState(false);
  // "Taking longer than usual" only when the CURRENT stage is genuinely slow.
  useEffect(() => {
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(t);
  }, [phase?.p, phase?.n, steps?.length]);
  const current = phase ? phaseLabel(phase, lang) : (status || (isHindi ? "जवाब तैयार कर रहे हैं" : "Preparing your answer"));
  const accent = "#FF9933";
  const done = (trail || []).slice(-5);
  return (
    <div className="ai-msg-bubble"
      style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:14 }}>
      <div className="ai-avatar-pulse" style={{
        width:32, height:32, borderRadius:"50%", flexShrink:0,
        background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
        overflow:"hidden",
      }}>
        <img src={aiAvatar} alt="AI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      </div>
      <div role="status" aria-live="polite" style={{
        background: th.card,
        border:`1px solid ${th.border2}`,
        borderRadius:"16px 16px 16px 4px",
        padding:"11px 14px 12px",
        boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
        display:"flex", flexDirection:"column", gap:7,
        minWidth:210, maxWidth:"min(300px, 78vw)", fontFamily:bf, position:"relative", overflow:"hidden",
      }}>
        {/* Finished stages (tool stages show their real results) */}
        {done.map((d, i) => d.p === "tools" ? (
          steps?.slice(d.from ?? 0, d.to).length > 0 && (
            <div key={`tools-${i}`} style={{ maxWidth:280 }}><AgentSteps steps={steps.slice(d.from ?? 0, d.to)} dark={dark} lang={lang} compact /></div>
          )
        ) : (
          <div key={`${d.p}-${d.n ?? ""}-${i}`} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:th.textMid, animation:"fade-in 0.25s ease-out" }}>
            <span style={{ width:16, textAlign:"center", color:"#16a34a", fontWeight:800 }}>✓</span>
            <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{phaseLabel(d, lang)}</span>
            {d.ms >= 100 && <span style={{ fontSize:10, color:th.textSub, fontVariantNumeric:"tabular-nums" }}>{fmtSecs(d.ms)}</span>}
          </div>
        ))}
        {/* Tools running right now */}
        {phase?.p === "tools" && steps?.slice(phase.from ?? 0).length > 0 && (
          <div style={{ maxWidth:280 }}><AgentSteps steps={steps.slice(phase.from ?? 0)} dark={dark} lang={lang} compact /></div>
        )}
        {/* Old servers send no stages — still show the tool steps */}
        {!phase && steps?.length > 0 && <div style={{ maxWidth:280 }}><AgentSteps steps={steps} dark={dark} lang={lang} compact /></div>}
        {/* Current stage */}
        <div key={`${phase?.p}-${phase?.n ?? ""}`} style={{ display:"flex", alignItems:"center", gap:7, animation:"fade-in 0.25s ease-out" }}>
          <span style={{ width:16, height:16, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <span style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid ${accent}`, borderTopColor:"transparent", animation:"spin 0.9s linear infinite" }} />
            <span style={{ fontSize:8.5 }}>{phaseIcon(phase)}</span>
          </span>
          <span style={{ flex:1, minWidth:0, fontSize:12, fontWeight:700, color:th.text, lineHeight:1.35 }}>{current}…</span>
          <span style={{ fontSize:10.5, fontWeight:600, color:th.textSub, fontVariantNumeric:"tabular-nums" }}><LiveClock since={startedAt} /></span>
        </div>
        {slow && (
          <div style={{ fontSize:10.5, color:th.textSub, paddingLeft:23, animation:"fade-in 0.3s ease-out" }}>
            {isHindi ? "सामान्य से थोड़ा ज़्यादा समय लग रहा है — बस कुछ पल" : "Taking a little longer than usual — almost there"}
          </div>
        )}
        {/* Progress sheen */}
        <div style={{ height:2, borderRadius:2, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", overflow:"hidden", marginTop:1 }}>
          <div style={{ height:"100%", width:"38%", borderRadius:2, background:`linear-gradient(90deg, transparent, ${accent}, #6366F1, transparent)`, animation:"ys-activity-sweep 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

// ─── READING TIME BAR ─────────────────────────────────────────────────────────
// Replaces the normal input UI while cooldown is active
function ReadingTimeBar({ secondsLeft, totalSeconds, dark, lang, onSkip, queued, onCancelQueued, plan, listening, upNext = [], onPickNext }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  // pct goes from 100 → 0 as secondsLeft decreases
  const pct = (secondsLeft / totalSeconds) * 100;

  // Colour shifts orange → green as it nears completion
  const r  = Math.round(255 * (pct / 100));
  const g  = Math.round(200 * (1 - pct / 100)) + 55;
  const barColor = `rgb(${r},${g},51)`;

  const n = plan?.schemes || 0;
  const K = {
    schemes: [`📖 Read about the ${n} schemes`, `📖 ${n} योजनाओं के बारे में पढ़ें`],
    scheme:  ["📖 Read about this scheme", "📖 इस योजना के बारे में पढ़ें"],
    docs:    ["📋 Look over the documents", "📋 दस्तावेज़ देख लें"],
    long:    ["📖 Detailed answer — take your time", "📖 विस्तृत जवाब — आराम से पढ़ें"],
    answer:  ["📖 Read the answer", "📖 जवाब पढ़ें"],
  }[plan?.kind] || ["📖 Read the answer", "📖 जवाब पढ़ें"];
  const label = listening
    ? (isHindi ? "🔊 सुन रहे हैं — टाइमर रुका है" : "🔊 Listening — timer paused")
    : `${K[isHindi ? 1 : 0]} · ${isHindi ? `${secondsLeft}s में तैयार` : `ready in ${secondsLeft}s`}`;

  return (
    <div style={{
      background: th.navBg,
      borderTop:`1.5px solid ${th.border}`,
      padding:"10px 14px 16px",
      flexShrink:0,
      boxShadow: dark
        ? "0 -4px 20px rgba(0,0,0,0.3)"
        : "0 -4px 20px rgba(0,0,0,0.07)",
    }}>
      {/* Label row */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:9,
      }}>
        <span style={{
          fontSize:12, fontFamily:bf, color:th.textMid,
          fontWeight:500,
        }}>
          {label}
        </span>
        {/* Big countdown ring — tap to skip the wait */}
        <div onClick={onSkip} role="button" aria-label={isHindi ? "इंतज़ार छोड़ें" : "Skip wait"} title={isHindi ? "टाइप करने के लिए टैप करें" : "Tap to type now"} style={{
          cursor: onSkip ? "pointer" : "default",
          width:38, height:38, borderRadius:"50%", flexShrink:0,
          border:`3px solid ${th.border2}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800,
          color: secondsLeft <= 3 ? "#22c55e" : "#FF9933",
          background: th.card,
          boxShadow: secondsLeft <= 3
            ? "0 0 0 2px rgba(34,197,94,0.25)"
            : "0 0 0 2px rgba(255,153,51,0.15)",
          transition:"color 0.4s, box-shadow 0.4s",
          fontFamily: "monospace",
        }}>
          {secondsLeft}
        </div>
      </div>

      {/* What comes next — tap to line it up (runs when the pause ends) */}
      {!queued && upNext.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:6, margin:"-2px 0 9px", overflow:"hidden" }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:th.textSub, fontFamily:bf, flexShrink:0 }}>{isHindi ? "आगे:" : "Up next:"}</span>
          {upNext.slice(0, 2).map(c => (
            <span key={c} role="button" onClick={() => onPickNext?.(c)} style={{ fontSize:11, fontWeight:600, color:"#C2410C", fontFamily:bf, cursor:"pointer",
              padding:"4px 9px", borderRadius:99, border:`1px solid ${dark ? "rgba(255,153,51,0.3)" : "#FED7AA"}`, background: dark ? "rgba(255,153,51,0.08)" : "#FFF7ED",
              minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c}</span>
          ))}
        </div>
      )}

      {/* Something tapped during the pause waits here and runs when it ends */}
      {queued && (
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"-2px 0 9px", padding:"7px 10px", borderRadius:10,
          background: dark ? "rgba(255,153,51,0.10)" : "#FFF7ED", border:`1px solid ${dark ? "rgba(255,153,51,0.25)" : "#FED7AA"}` }}>
          <span style={{ flex:1, minWidth:0, fontSize:11.5, fontFamily:bf, color:th.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            ⏭ {isHindi ? "अगला" : "Next"}: <b>“{queued}”</b> {isHindi ? "— टाइमर खत्म होते ही" : "— starts when the timer ends"}
          </span>
          <span role="button" onClick={onCancelQueued} style={{ fontSize:11, fontWeight:700, color:th.textSub, cursor:"pointer", fontFamily:bf, flexShrink:0 }}>
            {isHindi ? "रद्द करें" : "Cancel"}
          </span>
        </div>
      )}

      {/* Draining progress bar */}
      <div style={{
        height:5, background:th.border2, borderRadius:6, overflow:"hidden",
      }}>
        <div style={{
          height:"100%",
          width:`${pct}%`,
          background:`linear-gradient(90deg, ${barColor}, #FF9933)`,
          borderRadius:6,
          transition:"width 0.95s linear, background 0.5s",
        }} />
      </div>

      <div style={{
        fontSize:10, color:th.textSub, textAlign:"center",
        marginTop:7, fontFamily:bf, lineHeight:1.5,
      }}>
        {onSkip && (
          <span onClick={onSkip} style={{ color:"#FF9933", fontWeight:700, cursor:"pointer", marginRight:6 }}>
            {isHindi ? "अभी टाइप करें ›" : "Type now ›"}
          </span>
        )}
        {isHindi
          ? "AI गलती कर सकता है · हमेशा सरकारी वेबसाइट से पुष्टि करें"
          : "AI may make mistakes · Always verify on official government websites"}
      </div>
    </div>
  );
}

// ─── NORMAL INPUT BAR ─────────────────────────────────────────────────────────
const SpeechRec = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

function InputBar({ input, setInput, onSend, onKeyDown, loading, dark, lang, textareaRef, justUnlocked }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const canSend = input.trim().length > 0 && !loading;

  // ── Voice input: speak in Hindi or English, words fill the box live, and
  // the question is sent when you stop talking. Only shown where supported.
  const [listening, setListening] = useState(false);
  const [micNote,   setMicNote]   = useState("");
  const recRef  = useRef(null);
  const heardRef = useRef("");
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;
  useEffect(() => () => { try { recRef.current?.abort(); } catch {} }, []);

  const startMic = () => {
    if (!SpeechRec || loading) return;
    try {
      const rec = new SpeechRec();
      rec.lang = isHindi ? "hi-IN" : "en-IN";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      heardRef.current = "";
      rec.onresult = (e) => {
        let txt = "";
        for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        heardRef.current = txt.trim();
        setInput(heardRef.current);
      };
      rec.onerror = (e) => {
        setMicNote(e.error === "not-allowed" || e.error === "service-not-allowed"
          ? (isHindi ? "माइक की अनुमति दें" : "Allow microphone access to speak")
          : e.error === "no-speech" ? (isHindi ? "कुछ सुनाई नहीं दिया" : "Didn't catch that — try again") : "");
      };
      rec.onend = () => {
        setListening(false);
        recRef.current = null;
        const said = heardRef.current;
        heardRef.current = "";
        if (said) onSendRef.current(said);
      };
      recRef.current = rec;
      setMicNote("");
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };
  const stopMic = () => { try { recRef.current?.stop(); } catch {} };
  const showMic = !!SpeechRec && (listening || (!input.trim() && !loading));

  return (
    <div style={{
      background: th.navBg,
      borderTop:`1.5px solid ${th.border}`,
      padding:"10px 14px 16px",
      flexShrink:0,
      boxShadow: dark
        ? "0 -4px 20px rgba(0,0,0,0.3)"
        : "0 -4px 20px rgba(0,0,0,0.07)",
    }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
        <textarea
          ref={textareaRef}
          className="ai-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={listening
            ? (isHindi ? "सुन रहे हैं… बोलिए" : "Listening… speak now")
            : micNote || (isHindi ? "कोई भी सवाल पूछें..." : "Ask anything about schemes...")}
          rows={1}
          style={{
            flex:1,
            border:`1.5px solid ${input ? "#FF9933" : th.border2}`,
            borderRadius:14,
            padding:"11px 14px",
            fontSize:14, fontFamily:bf, color:th.text,
            background:th.inputBg,
            outline:"none", resize:"none",
            lineHeight:1.5,
            maxHeight:100, overflowY:"auto",
            transition:"border-color 0.2s, box-shadow 0.2s",
            display:"block",
          }}
        />
        {showMic ? (
          <div
            role="button"
            aria-label={listening ? (isHindi ? "रोकें" : "Stop listening") : (isHindi ? "बोलकर पूछें" : "Ask by voice")}
            className={`ai-send-btn${justUnlocked ? " unlock-bounce" : ""}`}
            onClick={listening ? stopMic : startMic}
            style={{
              width:46, height:46, borderRadius:14, flexShrink:0,
              background: listening ? "#ef4444" : "linear-gradient(135deg,#FF9933,#FF8000)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer",
              boxShadow: listening ? "0 0 0 0 rgba(239,68,68,0.5)" : "0 4px 16px rgba(255,153,51,0.45)",
              animation: listening ? "mic-pulse 1.3s ease-out infinite" : "none",
              transition:"background 0.2s",
            }}>
            {listening
              ? <span style={{ width:14, height:14, borderRadius:3, background:"#fff" }} />
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>}
          </div>
        ) : (
        <div
          className={`ai-send-btn${justUnlocked ? " unlock-bounce" : ""}`}
          onClick={() => onSend()}
          style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background: canSend
              ? "linear-gradient(135deg,#FF9933,#FF8000)"
              : th.border2,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor: canSend ? "pointer" : "default",
            boxShadow: canSend ? "0 4px 16px rgba(255,153,51,0.45)" : "none",
            transition:"all 0.2s",
            fontSize:18,
          }}>
          {loading
            ? <span style={{ fontSize:14 }}>⏳</span>
            : <span style={{ color: canSend ? "#fff" : th.textSub, fontWeight:700 }}>➤</span>
          }
        </div>
        )}
      </div>
      <div style={{
        fontSize:10, color:th.textSub, textAlign:"center",
        marginTop:7, fontFamily:bf, lineHeight:1.5,
      }}>
        {isHindi
          ? "AI गलती कर सकता है · हमेशा सरकारी वेबसाइट से पुष्टि करें"
          : "AI may make mistakes · Always verify on official government websites"}
      </div>
    </div>
  );
}

// ─── Feature 10: Markdown renderer ───────────────────────────────────────────
// renderInline handles bold (**text**) and clickable links within a single line.
// Answer links as clean one-line chips: just the site name (full address in
// the tooltip and the tap), with a 🏛 mark for official government sites.
const isGovHost = (h) => /(?:^|\.)(?:gov\.in|nic\.in|gov)$/i.test(h);
function linkHost(href) {
  try { return new URL(href).hostname.replace(/^www\./i, ""); } catch { return href.replace(/^https?:\/\//i, "").split(/[/?#]/)[0]; }
}
function LinkChip({ href, dark, block = false }) {
  const host = linkHost(href);
  const gov = isGovHost(host);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={href}
      style={{
        display: block ? "flex" : "inline-flex", alignItems:"center", gap:6, maxWidth:"100%", boxSizing:"border-box",
        width: block ? "fit-content" : undefined,
        background: dark ? "rgba(100,160,255,0.10)" : "rgba(0,53,128,0.06)",
        border:`1px solid ${dark ? "rgba(100,160,255,0.28)" : "rgba(0,53,128,0.18)"}`,
        borderRadius:8, padding: block ? "4px 10px" : "1px 8px",
        color: dark ? "#8EC1FF" : "#003580", textDecoration:"none",
        fontWeight:600, fontSize:"0.86em", lineHeight:1.5, verticalAlign:"middle",
        margin: block ? "4px 0 2px" : 0,
      }}>
      <span aria-hidden="true" style={{ fontSize:"0.95em", flexShrink:0 }}>{gov ? "🏛" : "🌐"}</span>
      <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{host}</span>
      <span aria-hidden="true" style={{ fontSize:9, opacity:0.65, flexShrink:0 }}>↗</span>
    </a>
  );
}

function renderInline(line, lineIdx, isUser, th, dark) {
  const parts = [];
  // Group 1: **bold**
  // Group 2: email address (must come BEFORE url group so user@gmail.com is caught whole)
  // Group 3: full https URL or domain with whitelisted TLD only
  //   — whitelist prevents React.js / Node.js / file.ts etc. from becoming links
  // Also: [text](https://link) markdown links and *italic* (the AI uses both;
  // they used to show up as raw brackets / asterisks).
  const regex = /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]+)\)|(?<![*\w])\*(?![\s*])([^*\n]+?)(?<!\s)\*(?![*\w])|\*\*(.*?)\*\*|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9.-]*\.(?:com|org|net|io|dev|app|in|gov|edu|co|info|biz|me)(?:[/?#][^\s]*)?)/g;
  let last = 0; let m0;
  while ((m0 = regex.exec(line)) !== null) {
    if (m0.index > last) parts.push(line.slice(last, m0.index));
    // [0]=full, then: mdText, mdUrl, italic, bold, email, url → keep old indexes for bold/email/url
    const match = [m0[0], m0[4], m0[5], m0[6]];
    match.index = m0.index;
    let consumed = m0[0].length;

    if (m0[1] !== undefined) {
      parts.push(
        <a key={`m-${lineIdx}-${m0.index}`} href={m0[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: isUser ? "#ffe0a0" : dark ? "#7bb8ff" : "#003580", fontWeight:600, textDecoration:"underline", textUnderlineOffset:2, wordBreak:"break-word" }}>
          {m0[1]}<span style={{ fontSize:"0.75em", opacity:0.6, marginLeft:2 }}>↗</span>
        </a>
      );
    } else if (m0[3] !== undefined) {
      parts.push(<em key={`i-${lineIdx}-${m0.index}`}>{renderInline(m0[3], `${lineIdx}i${m0.index}`, isUser, th, dark)}</em>);
    } else if (match[1] !== undefined) {
      // ── Bold ──────────────────────────────────────────────────────────────
      parts.push(
        <strong key={`b-${lineIdx}-${match.index}`} style={{ fontWeight:700 }}>
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      // ── Email address ─────────────────────────────────────────────────────
      const email = match[2];
      parts.push(
        <a key={`e-${lineIdx}-${match.index}`} href={`mailto:${email}`}
          style={
            isUser
              ? { color:"#ffe0a0", textDecoration:"underline", wordBreak:"break-all" }
              : dark
              ? {
                  display:"inline-flex", alignItems:"center", gap:3,
                  background:"rgba(100,160,255,0.15)",
                  border:"1px solid rgba(100,160,255,0.35)",
                  borderRadius:5, padding:"1px 7px",
                  color:"#7bb8ff", textDecoration:"none",
                  fontWeight:600, fontSize:"0.88em",
                  wordBreak:"break-all", verticalAlign:"middle", lineHeight:1.5,
                }
              : {
                  display:"inline-flex", alignItems:"center", gap:3,
                  background:"rgba(0,53,128,0.08)",
                  border:"1px solid rgba(0,53,128,0.22)",
                  borderRadius:5, padding:"1px 7px",
                  color:"#003580", textDecoration:"none",
                  fontWeight:600, fontSize:"0.88em",
                  wordBreak:"break-all", verticalAlign:"middle", lineHeight:1.5,
                }
          }>
          {email}
          {!isUser && <span style={{ fontSize:9, opacity:0.55, flexShrink:0 }}>✉</span>}
        </a>
      );
    } else {
      // ── URL / domain ──────────────────────────────────────────────────────
      // Trailing punctuation belongs to the sentence, not the link.
      let raw  = match[3];
      const trail = raw.match(/[.,;:!?)\]'"]+$/);
      if (trail) { raw = raw.slice(0, -trail[0].length); consumed -= trail[0].length; }
      const href = raw.startsWith("http") ? raw : `https://${raw}`;
      parts.push(
        isUser ? (
          <a key={`l-${lineIdx}-${match.index}`} href={href} target="_blank" rel="noopener noreferrer"
            style={{ color:"#ffe0a0", textDecoration:"underline", wordBreak:"break-all" }}>
            {raw}
          </a>
        ) : (
          <LinkChip key={`l-${lineIdx}-${match.index}`} href={href} dark={dark} />
        )
      );
    }
    last = m0.index + consumed;
    regex.lastIndex = last;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

// renderContent handles block-level structure: numbered lists, bullet lists,
// empty-line spacers, and falls back to inline rendering for regular text.
function renderContent(text, isUser, th, dark) {
  const lines  = text.split("\n");
  const result = [];

  lines.forEach((line, li) => {
    // "---" divider → thin line (it was printed as raw dashes)
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      if (li > 0 && li < lines.length - 1) result.push(<div key={`line-${li}`} style={{ height:1, margin:"8px 0", background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />);
      return;
    }
    // "## Heading" → bold line
    const headMatch = line.match(/^#{1,4}\s+(.*)/);
    if (headMatch) {
      result.push(<div key={`line-${li}`} style={{ fontWeight:800, marginTop: li === 0 ? 0 : 6 }}>{renderInline(headMatch[1].replace(/\*\*/g, ""), li, isUser, th, dark)}</div>);
      return;
    }
    // "🔗 https://…" line → one clean link row (the chip carries its own icon)
    const linkLine = !isUser && line.match(/^\s*🔗\s*(https?:\/\/\S+?)[.,;)]*\s*$/u);
    if (linkLine) {
      result.push(<div key={`line-${li}`}><LinkChip href={linkLine[1]} dark={dark} block /></div>);
      return;
    }
    const numberedMatch = line.match(/^(\d+)\.\s+([\s\S]*)/);
    const bulletMatch   = line.match(/^(\s*)[-•*]\s+([\s\S]*)/);
    const isLast        = li === lines.length - 1;

    // ── Numbered list item ─────────────────────────────────────────────────
    if (numberedMatch) {
      const [, num, content] = numberedMatch;
      result.push(
        <div key={`line-${li}`} style={{
          display:"flex", gap:9, alignItems:"flex-start",
          marginTop: li === 0 ? 0 : 6,
          marginBottom: isLast ? 0 : 1,
        }}>
          {/* Circle number badge */}
          <span style={{
            minWidth:20, height:20, borderRadius:"50%", flexShrink:0,
            background: isUser ? "rgba(255,255,255,0.22)" : "#F97316",
            color:"#fff",
            fontSize:10.5, fontWeight:800, lineHeight:1,
            display:"flex", alignItems:"center", justifyContent:"center",
            marginTop:3,
          }}>
            {num}
          </span>
          <span style={{ flex:1, lineHeight:1.65 }}>
            {renderInline(content, li, isUser, th, dark)}
          </span>
        </div>
      );
      return;
    }

    // ── Bullet list item ───────────────────────────────────────────────────
    if (bulletMatch) {
      const [, indent, content] = bulletMatch;
      const nested = indent.length >= 2;
      result.push(
        <div key={`line-${li}`} style={{
          display:"flex", gap:9, alignItems:"flex-start",
          paddingLeft: nested ? 29 : 0,
          marginTop: li === 0 ? 0 : 5,
          marginBottom: isLast ? 0 : 1,
        }}>
          {/* Dot */}
          <span style={{
            color: isUser ? "rgba(255,255,255,0.65)" : "#EA580C",
            fontSize:15, lineHeight:1, flexShrink:0, marginTop:4,
          }}>
            •
          </span>
          <span style={{ flex:1, lineHeight:1.65 }}>
            {renderInline(content, li, isUser, th, dark)}
          </span>
        </div>
      );
      return;
    }

    // ── Empty line → small spacer ──────────────────────────────────────────
    if (line.trim() === "") {
      result.push(<div key={`line-${li}`} style={{ height:8 }} />);
      return;
    }

    // ── Regular text line ──────────────────────────────────────────────────
    result.push(
      <span key={`line-${li}`}>
        {renderInline(line, li, isUser, th, dark)}
        {!isLast && "\n"}
      </span>
    );
  });

  return result;
}

function FollowUpChips({ chips, onTap, lang, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const [exitingIdx, setExitingIdx] = useState(null);

  // Play ascending arpeggio timed to each chip's pop-in animation
  useEffect(() => {
    if (chips.length > 0) playChipSounds(chips.length);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Match the same glass surface used by AI bubbles so chips
  // blend with appBg instead of popping out as solid white cards.
  const glassCard = dark
    ? "rgba(28,28,30,0.72)"
    : "rgba(255,255,255,0.72)";

  const handleChipTap = (chip, i) => {
    if (exitingIdx !== null) return;
    setExitingIdx(i);
    setTimeout(() => onTap(chip), 270);
  };

  return (
    <div className="chips-container" style={{
      display:"flex", flexWrap:"wrap", gap:8,
      paddingLeft:34, marginTop:-6, marginBottom:14,
    }}>
      {chips.map((chip, i) => (
        <div key={i} onClick={() => handleChipTap(chip, i)}
          style={{
            // FIX 1: Match AI bubble gradient border (orange → purple → navy)
            // instead of the previous plain solid #FF9933 border.
            background: `linear-gradient(${glassCard}, ${glassCard}) padding-box,
                         linear-gradient(135deg,#FF9933 0%,#6366f1 50%,#003580 100%) border-box`,
            border: "1.5px solid transparent",

            // FIX 2: Glass blur so the chip surface matches the bubble's
            // glassmorphism and sits naturally on the cream appBg (#f5f5f0).
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",

            borderRadius: 20,
            padding: "7px 13px",
            fontSize: 12, fontFamily: bf,

            // FIX 2: Theme-aware color instead of hardcoded #FF9933,
            // consistent with how the AI bubble header text is coloured.
            // Deep navy in light (matches bubble gradient endpoint #003580),
            // soft indigo in dark (readable against dark card surface).
            color: dark ? "#a5b4fc" : "#003580",

            cursor: exitingIdx !== null ? "default" : "pointer",
            fontWeight: 600,
            boxShadow: dark
              ? "0 2px 10px rgba(255,153,51,0.18), 0 1px 4px rgba(0,0,0,0.35)"
              : "0 2px 8px rgba(255,153,51,0.18), 0 1px 4px rgba(0,0,0,0.07)",
            animation: exitingIdx === i
              ? "chip-out 0.27s ease-in forwards"
              : `chip-in 0.52s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.22}s both`,
            opacity: exitingIdx !== null && exitingIdx !== i ? 0.35 : 1,
            transition: exitingIdx !== null && exitingIdx !== i
              ? "opacity 0.22s ease-out"
              : "opacity 0.15s, transform 0.15s",
          }}>
          {chip}
        </div>
      ))}
    </div>
  );
}

// ─── SCHEME CARDS under an answer ─────────────────────────────────────────────
// Every scheme the answer names becomes a tappable card that opens its full
// detail page (documents, how to apply, official link).
function SchemeCards({ schemes, lang, dark, onOpen, eligibleIds, trackedApps }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  if (!schemes.length || !onOpen) return null;
  return (
    <div style={{ paddingLeft:34, marginTop:8, display:"flex", flexDirection:"column", gap:6, animation:"chips-reveal 0.3s ease-out" }}>
      {schemes.map(s => {
        const tracked = trackedApps?.[s.id];
        const eligible = eligibleIds?.has(s.id);
        return (
          <div key={s.id} className="ai-scheme-card" role="button"
            onClick={() => onOpen(s.id)}
            style={{
              display:"flex", alignItems:"center", gap:10,
              background: th.card,
              border:`1px solid ${dark ? "rgba(255,153,51,0.22)" : "rgba(255,153,51,0.28)"}`,
              borderRadius:12, padding:"8px 10px", cursor:"pointer",
              boxShadow: dark ? "0 1px 6px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.05)",
              transition:"transform 0.12s",
              maxWidth:"88%",
            }}>
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:`${s.color || "#FF9933"}1f`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
              {s.icon || "📋"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:th.text, fontFamily:bf, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {s.name?.[lang] || s.name?.en}
              </div>
              <div style={{ fontSize:11, color:th.textMid, fontFamily:bf, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1 }}>
                {tracked
                  ? <span style={{ color:"#16a34a", fontWeight:700 }}>{isHindi ? "✓ आवेदन किया · " : "✓ Applied · "}</span>
                  : eligible ? <span style={{ color:"#16a34a", fontWeight:700 }}>{isHindi ? "✓ आप पात्र हैं · " : "✓ You qualify · "}</span> : null}
                {s.benefit?.[lang] || s.benefit?.en}
              </div>
            </div>
            <span style={{ fontSize:11.5, fontWeight:700, color:"#FF8000", flexShrink:0, fontFamily:bf }}>
              {isHindi ? "खोलें ›" : "Open ›"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── ANSWER ACTIONS ───────────────────────────────────────────────────────────
// Buttons under an answer that DO something: track an application the user
// says they've made, build one documents checklist for the schemes named,
// share the answer, or re-run the eligibility check.
const plainText = (md) => md
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/(^|\s)\*([^*\n]+)\*/g, "$1$2")
  .replace(/^\s*-{3,}\s*$/gm, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

// link: the scheme's own page when the shared text is about one scheme
// (WhatsApp shows its preview), otherwise the app.
function shareText(text, title, link = `${SITE_URL}/`) {
  const body = `${text}\n\n— Yojana Sahay · ${link}`;
  try {
    if (navigator.share) { navigator.share({ title, text: body }).catch(() => {}); return; }
  } catch {}
  window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, "_blank", "noopener");
}

function ActionPill({ icon, label, onClick, done, dark, primary }) {
  return (
    <button type="button" onClick={onClick} disabled={done}
      style={{
        display:"inline-flex", alignItems:"center", gap:5,
        fontSize:11.5, fontWeight:700, lineHeight:1.2,
        padding:"6px 11px", borderRadius:20, cursor: done ? "default" : "pointer",
        fontFamily:"inherit",
        color: done ? "#15803d" : primary ? "#fff" : (dark ? "#e5e7eb" : "#1f2937"),
        background: done ? (dark ? "rgba(34,197,94,0.15)" : "#dcfce7")
          : primary ? "linear-gradient(135deg,#FF9933,#F97316)"
          : (dark ? "#2c2c2e" : "#fff"),
        border: `1px solid ${done ? "rgba(34,197,94,0.45)" : primary ? "transparent" : (dark ? "#3a3a3c" : "#e5e7eb")}`,
        boxShadow: primary && !done ? "0 2px 8px rgba(249,115,22,0.3)" : (dark ? "none" : "0 1px 2px rgba(0,0,0,0.05)"),
      }}>
      <span aria-hidden="true">{icon}</span>{label}
    </button>
  );
}

function AnswerActions({ msg, schemes, lang, dark, trackedApps, onChecklist, onOpenChecker, onOpenDetail, onRecheck }) {
  const isHindi = lang === "hi";
  // Schemes the AI says the user has applied to → "Track it" buttons.
  const applied = useMemo(() => {
    const out = [];
    for (const a of msg.actions || []) {
      if (a.type !== "applied") continue;
      const sc = findSchemesInText(a.name, 1)[0];
      if (sc && !out.some(x => x.id === sc.id)) out.push(sc);
    }
    return out;
  }, [msg.actions]);
  const withDocs = schemes.filter(s => (s.docs?.[lang] || s.docs?.en || []).length);
  // What the agent prepared: a checklist, screen shortcuts, tracked applications.
  const agentChecklist = (msg.ui?.checklist || []).map(id => SCHEME_BY_ID_CHAT.get(id)).filter(Boolean);
  const opens = msg.ui?.open || [];
  const trackedNow = (msg.ui?.tracked || []).map(id => SCHEME_BY_ID_CHAT.get(id)).filter(Boolean);
  const shortName = (sc) => (sc.name?.[lang] || sc.name?.en || "").replace(/\s*\(.*?\)\s*/g, " ").trim().slice(0, 28);
  if (!applied.length && !withDocs.length && !agentChecklist.length && !opens.length && !trackedNow.length) return null;
  return (
    <div style={{ paddingLeft:34, marginTop:8, display:"flex", flexWrap:"wrap", gap:6, animation:"chips-reveal 0.3s ease-out" }}>
      {trackedNow.map(sc => (
        <ActionPill key={"t" + sc.id} dark={dark} done icon="✓"
          label={isHindi ? `${shortName(sc)} मेरे आवेदन में जुड़ा` : `${shortName(sc)} added to My Applications`} />
      ))}
      {agentChecklist.length > 0 && (
        <ActionPill dark={dark} primary icon="📋"
          label={isHindi ? "दस्तावेज़ सूची खोलें" : "Open documents checklist"}
          onClick={() => onChecklist?.(agentChecklist)} />
      )}
      {opens.map((o, i) => {
        if (o.screen === "scheme_page") {
          const sc = SCHEME_BY_ID_CHAT.get(o.id);
          return sc && onOpenDetail ? <ActionPill key={"o" + i} dark={dark} primary icon="📄" label={isHindi ? `${shortName(sc)} खोलें` : `Open ${shortName(sc)}`} onClick={() => onOpenDetail(sc.id)} /> : null;
        }
        return onOpenChecker ? <ActionPill key={"o" + i} dark={dark} primary icon="🧮" label={isHindi ? "पात्रता जांच खोलें" : "Open eligibility checker"} onClick={onOpenChecker} /> : null;
      })}
      {applied.map(sc => {
        const done = !!trackedApps?.[sc.id];
        const short = (sc.name?.[lang] || sc.name?.en || "").replace(/\s*\(.*?\)\s*/g, " ").trim().slice(0, 28);
        return (
          <ActionPill key={sc.id} dark={dark} primary done={done}
            icon={done ? "✓" : "📌"}
            label={done ? (isHindi ? `${short} — ट्रैक हो रहा है` : `Tracking ${short}`) : (isHindi ? `${short} को ट्रैक करें` : `Track ${short} in My Applications`)}
            onClick={() => { trackApplication(sc.id); track("app_track", { s: sc.id }); }} />
        );
      })}
      {withDocs.length > 0 && !agentChecklist.length && (
        <ActionPill dark={dark} icon="📋"
          label={isHindi ? (withDocs.length > 1 ? `${withDocs.length} योजनाओं की दस्तावेज़ सूची` : "दस्तावेज़ सूची") : (withDocs.length > 1 ? `Documents for all ${withDocs.length}` : "Documents checklist")}
          onClick={() => onChecklist?.(withDocs)} />
      )}
      <ActionPill dark={dark} icon="📤" label={isHindi ? "शेयर करें" : "Share"}
        onClick={() => {
          const one = schemes?.length ? schemes : findSchemesInText(msg.content);
          shareText(plainText(msg.content), "Yojana Sahay", one.length === 1 ? schemePageUrl(one[0], lang) : undefined);
          track("share_result", { k: "ai" });
        }} />
      {onRecheck && !opens.some(o => o.screen === "eligibility_checker") && (
        <ActionPill dark={dark} icon="🧮" label={isHindi ? "पात्रता दोबारा जांचें" : "Re-check eligibility"} onClick={onRecheck} />
      )}
    </div>
  );
}

// ─── ELIGIBILITY CHECK INSIDE THE CHAT ───────────────────────────────────────
// Asks only what isn't known yet, one tap-to-answer question at a time, then
// shows the result in place. quiz = { forSelf, label, start, prefill, done }.
function EligibilityFlow({ quiz, lang, dark, onDone, onAsk, onOpenDetail, onRestart }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  const [answers, setAnswers] = useState(() => quiz.done || withImplied(quiz.start || {}));
  const [history, setHistory] = useState([]);           // previous answer states, for Back
  const [multi, setMulti] = useState([]);
  const [stateSel, setStateSel] = useState(quiz.prefill?.state || "");
  const done = quiz.done ? quiz.done : null;
  const current = done ? null : nextQuestion(answers);
  const answeredCount = history.length;
  const total = answeredCount + questionQueue(answers).length;
  const who = quiz.forSelf ? null : (quiz.label || (isHindi ? "परिवार के सदस्य" : "family member"));

  // Finished (no question left) → report once.
  useEffect(() => {
    if (!done && !current) onDone?.(answers);
  }, [done, current]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (key, value) => {
    setHistory(h => [...h, answers]);
    setAnswers(a => withImplied({ ...a, [key]: value }));
    setMulti([]);
  };
  const back = () => {
    setHistory(h => { const prev = h[h.length - 1]; if (prev) setAnswers(prev); return h.slice(0, -1); });
    setMulti([]);
  };

  const card = {
    marginLeft:34, marginTop:8, maxWidth:"88%", background: th.card, borderRadius:16, padding:"12px 14px",
    border:`1.5px solid ${dark ? "rgba(255,153,51,0.35)" : "rgba(249,115,22,0.35)"}`,
    boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.35)" : "0 4px 16px rgba(249,115,22,0.10)", fontFamily:bf,
    animation:"chips-reveal 0.3s ease-out",
  };
  const titleTxt = who
    ? (isHindi ? `✅ ${who} की पात्रता जांच` : `✅ Eligibility check for your ${who}`)
    : (isHindi ? "✅ झटपट पात्रता जांच" : "✅ Quick eligibility check");

  // ── Result ──
  if (done) {
    const r = eligibilityResult(done);
    const fmt = n => `₹${Math.round(n).toLocaleString("en-IN")}`;
    const nm = s => s.name?.[lang] || s.name?.en;
    const head = who
      ? (isHindi ? `🎉 आपके ${who} ${r.count} योजनाओं के लिए पात्र हैं` : `🎉 Your ${who} qualifies for ${r.count} schemes`)
      : (isHindi ? `🎉 आप ${r.count} योजनाओं के लिए पात्र हैं` : `🎉 You qualify for ${r.count} schemes`);
    const money = [
      r.summary.yearly ? (isHindi ? `लगभग ${fmt(r.summary.yearly)} सालाना` : `about ${fmt(r.summary.yearly)} a year`) : "",
      r.summary.health ? (isHindi ? `${fmt(r.summary.health)} तक मुफ़्त इलाज` : `free treatment up to ${fmt(r.summary.health)}`) : "",
    ].filter(Boolean).join(" · ");
    const askText = who
      ? (isHindi ? `मेरे ${who} के लिए सबसे अच्छी योजनाएं समझाएं: ${r.top.slice(0, 4).map(nm).join(", ")}` : `Explain the best schemes for my ${who}: ${r.top.slice(0, 4).map(nm).join(", ")}`)
      : (isHindi ? "मैंने पात्रता जांच पूरी की। मेरी सबसे अच्छी योजनाएं समझाएं और पहले क्या करूं बताएं।" : "I finished the eligibility check. Explain my best schemes and what I should do first.");
    return (
      <div style={card}>
        <div style={{ fontSize:11, fontWeight:800, color:"#C2410C", letterSpacing:0.3, textTransform:"uppercase" }}>{titleTxt}</div>
        <div style={{ fontSize:16, fontWeight:800, color:th.text, marginTop:6 }}>{head}</div>
        {money && <div style={{ fontSize:12.5, color:"#15803d", fontWeight:700, marginTop:3 }}>{money}</div>}
        <div style={{ fontSize:10.5, color:th.textSub, marginTop:3 }}>
          {isHindi ? "अनुमान — लाभ आवेदन और मंज़ूरी के बाद ही मिलता है" : "An estimate — benefits come after applying and approval"}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:10 }}>
          {r.top.map(s => (
            <div key={s.id} role="button" className="ai-scheme-card" onClick={() => onOpenDetail?.(s.id)}
              style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 9px", borderRadius:10, cursor:"pointer",
                background: dark ? "rgba(255,255,255,0.04)" : "#FFF8F1", border:`1px solid ${dark ? "#3a3a3c" : "#FDE3CC"}` }}>
              <span style={{ fontSize:17 }}>{s.icon || "📋"}</span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:700, color:th.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{nm(s)}</span>
                <span style={{ display:"block", fontSize:10.5, color:th.textMid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.benefit?.[lang] || s.benefit?.en}</span>
              </span>
              <span style={{ fontSize:11, fontWeight:700, color:"#EA580C" }}>›</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
          {r.count > 0 && <ActionPill dark={dark} primary icon="💬" label={isHindi ? "AI से समझें" : "Explain these"} onClick={() => onAsk?.(askText)} />}
          <ActionPill dark={dark} icon="✏️" label={isHindi ? "जवाब बदलें" : "Change answers"} onClick={() => onRestart?.(done)} />
        </div>
      </div>
    );
  }

  if (!current) return null;
  const q = QUESTIONS[current];
  const qText = (!quiz.forSelf && q.enOther) ? (isHindi ? q.hiOther : q.enOther) : (isHindi ? q.hi : q.en);
  const pre = quiz.prefill?.[current];
  const btn = (selected) => ({
    padding:"9px 10px", borderRadius:11, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit", textAlign:"left", lineHeight:1.25,
    color: selected ? "#fff" : th.text,
    background: selected ? "linear-gradient(135deg,#FF9933,#F97316)" : (dark ? "#2c2c2e" : "#fff"),
    border:`1.5px solid ${selected ? "transparent" : (dark ? "#3a3a3c" : "#F3D9C2")}`,
  });
  return (
    <div style={card}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, fontSize:11, fontWeight:800, color:"#C2410C", letterSpacing:0.3, textTransform:"uppercase" }}>{titleTxt}</div>
        <div style={{ fontSize:10.5, fontWeight:700, color:th.textSub }}>{answeredCount + 1} / {Math.max(total, answeredCount + 1)}</div>
      </div>
      <div style={{ height:4, borderRadius:4, background: dark ? "#2c2c2e" : "#FDECDC", marginTop:6, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${Math.round((answeredCount / Math.max(total, 1)) * 100)}%`, background:"linear-gradient(90deg,#FF9933,#F97316)", transition:"width 0.3s" }} />
      </div>
      <div key={current} style={{ fontSize:14.5, fontWeight:800, color:th.text, margin:"12px 0 10px", animation:"fade-in 0.25s ease-out" }}>
        <span style={{ marginRight:6 }}>{q.icon}</span>{qText}
      </div>
      {q.type === "state" ? (
        <div style={{ display:"flex", gap:8 }}>
          <select value={stateSel} onChange={e => setStateSel(e.target.value)}
            style={{ flex:1, minWidth:0, padding:"10px", borderRadius:11, fontSize:13, fontFamily:"inherit", color:th.text, background: dark ? "#2c2c2e" : "#fff", border:`1.5px solid ${dark ? "#3a3a3c" : "#F3D9C2"}` }}>
            <option value="">{isHindi ? "राज्य चुनें" : "Select state"}</option>
            {STATES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <button type="button" disabled={!stateSel} onClick={() => answer("state", stateSel)} style={{ ...btn(!!stateSel), textAlign:"center", opacity: stateSel ? 1 : 0.5 }}>
            {isHindi ? "आगे ›" : "Next ›"}
          </button>
        </div>
      ) : q.type === "multi" ? (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {q.options.map(o => {
              const on = multi.includes(o.value);
              return <button key={o.value} type="button" onClick={() => setMulti(m => on ? m.filter(x => x !== o.value) : [...m, o.value])} style={btn(on)}>{on ? "✓ " : ""}{isHindi ? o.hi : o.en}</button>;
            })}
          </div>
          <div style={{ display:"flex", gap:7, marginTop:8 }}>
            <button type="button" onClick={() => answer("groups", [])} style={{ ...btn(false), flex:1, textAlign:"center" }}>{isHindi ? "इनमें से कोई नहीं" : "None of these"}</button>
            <button type="button" disabled={!multi.length} onClick={() => answer("groups", multi)} style={{ ...btn(multi.length > 0), flex:1, textAlign:"center", opacity: multi.length ? 1 : 0.5 }}>{isHindi ? "आगे ›" : "Next ›"}</button>
          </div>
        </>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: q.options.length <= 3 ? `repeat(${q.options.length},1fr)` : "1fr 1fr", gap:7 }}>
          {q.options.map(o => (
            <button key={o.value} type="button" onClick={() => answer(current, o.value)} style={btn(pre === o.value)}>
              {isHindi ? o.hi : o.en}
            </button>
          ))}
        </div>
      )}
      {answeredCount > 0 && (
        <button type="button" onClick={back} style={{ marginTop:10, border:"none", background:"transparent", color:th.textSub, fontSize:12, fontWeight:700, cursor:"pointer", padding:0, fontFamily:"inherit" }}>
          ‹ {isHindi ? "पीछे" : "Back"}
        </button>
      )}
    </div>
  );
}

// ─── ONE DOCUMENTS CHECKLIST for several schemes ─────────────────────────────
// Same document needed by three schemes is listed once ("for 3 schemes").
const docKey = (d) => String(d).toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9ऀ-ॿ]+/g, " ").replace(/\b(card|copy|certificate|details|of|the|a)\b/g, "").replace(/\s+/g, " ").trim();
function ChecklistSheet({ schemes, lang, dark, onClose }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  const items = useMemo(() => {
    const map = new Map();
    for (const s of schemes) {
      for (const d of (s.docs?.[lang] || s.docs?.en || [])) {
        const k = docKey(d) || d;
        if (!map.has(k)) map.set(k, { doc: d, schemes: [] });
        const it = map.get(k);
        if (!it.schemes.includes(s)) it.schemes.push(s);
      }
    }
    return [...map.values()].sort((a, b) => b.schemes.length - a.schemes.length);
  }, [schemes, lang]);
  const [have, setHave] = useState(() => new Set());
  const toggle = (i) => setHave(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const nameOf = (s) => s.name?.[lang] || s.name?.en;
  const share = () => {
    const text = (isHindi ? "📋 दस्तावेज़ सूची — " : "📋 Documents checklist — ") + schemes.map(nameOf).join(", ") + "\n\n" +
      items.map((it, i) => `${have.has(i) ? "✅" : "⬜"} ${it.doc}${it.schemes.length > 1 ? (isHindi ? ` (${it.schemes.length} योजनाओं के लिए)` : ` (for ${it.schemes.length} schemes)`) : ""}`).join("\n");
    shareText(text, "Documents checklist", schemes.length === 1 ? schemePageUrl(schemes[0], lang) : undefined);
    track("share_checklist", { k: "ai" });
  };
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fade-in 0.2s ease-out" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-label="Documents checklist"
        style={{ width:"100%", maxWidth:560, maxHeight:"82vh", background:th.card, borderRadius:"20px 20px 0 0", display:"flex", flexDirection:"column", fontFamily:bf, animation:"chips-reveal 0.25s ease-out", boxShadow:"0 -8px 30px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"16px 18px 10px", borderBottom:`1px solid ${th.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontSize:16, fontWeight:800, color:th.text, flex:1 }}>{isHindi ? "📋 दस्तावेज़ सूची" : "📋 Documents checklist"}</div>
            <button type="button" onClick={onClose} aria-label="Close" style={{ border:"none", background:"transparent", fontSize:20, color:th.textSub, cursor:"pointer", padding:4 }}>✕</button>
          </div>
          <div style={{ fontSize:11.5, color:th.textMid, marginTop:4, lineHeight:1.45 }}>
            {isHindi ? "इन योजनाओं के लिए: " : "For: "}{schemes.map(nameOf).join(" · ")}
          </div>
          <div style={{ fontSize:11.5, fontWeight:700, color:"#16a34a", marginTop:6 }}>
            {isHindi ? `${have.size} / ${items.length} तैयार` : `${have.size} of ${items.length} ready`}
          </div>
        </div>
        <div style={{ overflowY:"auto", padding:"8px 12px" }}>
          {items.map((it, i) => (
            <label key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"9px 6px", borderBottom:`1px solid ${th.border}`, cursor:"pointer" }}>
              <input type="checkbox" checked={have.has(i)} onChange={() => toggle(i)} style={{ width:18, height:18, marginTop:1, accentColor:"#F97316", flexShrink:0 }} />
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ fontSize:13.5, color:th.text, textDecoration: have.has(i) ? "line-through" : "none", opacity: have.has(i) ? 0.6 : 1 }}>{it.doc}</span>
                {schemes.length > 1 && (
                  <span style={{ display:"block", fontSize:10.5, color:th.textSub, marginTop:2 }}>
                    {it.schemes.length === schemes.length
                      ? (isHindi ? "सभी योजनाओं के लिए" : "Needed for all")
                      : it.schemes.map(s => nameOf(s).replace(/\s*\(.*?\)\s*/g, " ").trim()).join(", ")}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        <div style={{ padding:"10px 14px calc(12px + env(safe-area-inset-bottom))", display:"flex", gap:8, borderTop:`1px solid ${th.border}` }}>
          <button type="button" onClick={share} style={{ flex:1, padding:"11px 12px", borderRadius:12, border:"none", fontWeight:800, fontSize:13, color:"#fff", background:"linear-gradient(135deg,#FF9933,#F97316)", cursor:"pointer", fontFamily:"inherit" }}>
            {isHindi ? "📤 शेयर करें (WhatsApp)" : "📤 Share (WhatsApp)"}
          </button>
          <button type="button" onClick={onClose} style={{ padding:"11px 16px", borderRadius:12, border:`1px solid ${th.border2}`, fontWeight:700, fontSize:13, color:th.text, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
            {isHindi ? "बंद करें" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

// While streaming, an unclosed **bold** would show raw asterisks — drop the
// dangling marker until its pair arrives.
function tidyPartial(t) {
  const n = (t.match(/\*\*/g) || []).length;
  if (n % 2 === 1) { const i = t.lastIndexOf("**"); t = t.slice(0, i) + t.slice(i + 2); }
  return t;
}

// ─── REPORT AN AI ANSWER ───────────────────────────────────────────────────────
// Google Play (generative AI policy): people must be able to flag wrong,
// harmful or offensive AI answers without leaving the app.
const AI_REPORT_REASONS = [
  { id:"wrong",     en:"Wrong or outdated information", hi:"गलत या पुरानी जानकारी" },
  { id:"harmful",   en:"Harmful or unsafe advice",       hi:"नुकसानदेह या असुरक्षित सलाह" },
  { id:"offensive", en:"Offensive or inappropriate",     hi:"आपत्तिजनक या अनुचित" },
  { id:"other",     en:"Something else",                 hi:"कुछ और" },
];
function AiReportSheet({ answer, question, lang, dark, onClose, onDone }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const hi = lang === "hi";
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState({ busy:false, done:false, error:"" });
  const send = async () => {
    if (!reason || state.busy) return;
    setState({ busy:true, done:false, error:"" });
    try {
      const token = await auth?.currentUser?.getIdToken?.().catch(() => null);
      const r = await fetch("/api/log-checker-run", { method:"POST",
        headers:{ "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify({ type:"ai_report", reason, note, answer:String(answer || "").slice(0, 2000), question:String(question || "").slice(0, 500), lang }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || (hi ? "भेजा नहीं जा सका। दोबारा कोशिश करें।" : "Couldn't send. Please try again."));
      setState({ busy:false, done:true, error:"" });
      onDone?.();
      setTimeout(onClose, 1400);
    } catch (e) { setState({ busy:false, done:false, error:e.message }); }
  };
  const line = dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  return (
    <div onClick={() => !state.busy && onClose()} style={{ position:"fixed", inset:0, zIndex:9100, background:"rgba(2,6,23,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fade-in 0.2s ease-out" }}>
      <div role="dialog" aria-modal="true" aria-label={hi ? "जवाब की रिपोर्ट करें" : "Report this answer"} onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:520, background: dark ? "#111214" : "#F6F7F9", borderRadius:"20px 20px 0 0", padding:"16px 16px calc(16px + env(safe-area-inset-bottom))", fontFamily:bf, animation:"chips-reveal 0.25s ease-out" }}>
        {state.done ? (
          <div style={{ textAlign:"center", padding:"18px 8px" }}>
            <div style={{ fontSize:28 }}>✓</div>
            <div style={{ fontSize:15, fontWeight:800, color:th.text, marginTop:4 }}>{hi ? "धन्यवाद — हम इसे जांचेंगे" : "Thank you — we'll review it"}</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:16, fontWeight:800, color:th.text }}>{hi ? "इस जवाब की रिपोर्ट करें" : "Report this answer"}</div>
            <div style={{ fontSize:12, color:th.textSub, marginTop:3 }}>{hi ? "क्या गलत था? आपकी रिपोर्ट AI को बेहतर बनाती है।" : "What was wrong? Your report helps improve the assistant."}</div>
            <div style={{ marginTop:12, background: dark ? "#1A1B1F" : "#fff", border:`1px solid ${line}`, borderRadius:14, overflow:"hidden" }}>
              {AI_REPORT_REASONS.map((r, i) => (
                <div key={r.id} role="radio" aria-checked={reason === r.id} tabIndex={0} onClick={() => setReason(r.id)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setReason(r.id); } }}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 13px", cursor:"pointer", borderTop: i ? `1px solid ${line}` : "none" }}>
                  <span style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, border:`2px solid ${reason === r.id ? "#EA580C" : (dark ? "#555" : "#cbd5e1")}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {reason === r.id && <span style={{ width:8, height:8, borderRadius:"50%", background:"#EA580C" }} />}
                  </span>
                  <span style={{ fontSize:13.5, color:th.text, fontWeight: reason === r.id ? 700 : 500 }}>{hi ? r.hi : r.en}</span>
                </div>
              ))}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value.slice(0, 400))} rows={2}
              placeholder={hi ? "चाहें तो बताएं क्या गलत था (वैकल्पिक)" : "Tell us more (optional)"}
              style={{ width:"100%", boxSizing:"border-box", marginTop:10, borderRadius:12, border:`1px solid ${line}`, background: dark ? "#1A1B1F" : "#fff", color:th.text, padding:"10px 12px", fontSize:13, fontFamily:bf, resize:"none", outline:"none" }} />
            {state.error && <div style={{ fontSize:12, color:"#DC2626", marginTop:6 }}>{state.error}</div>}
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <button type="button" onClick={onClose} disabled={state.busy}
                style={{ flex:1, padding:12, borderRadius:12, border:`1px solid ${line}`, background:"transparent", color:th.text, fontWeight:700, fontSize:13.5, cursor:"pointer", fontFamily:bf }}>{hi ? "रद्द करें" : "Cancel"}</button>
              <button type="button" onClick={send} disabled={!reason || state.busy}
                style={{ flex:1, padding:12, borderRadius:12, border:"none", background: reason ? "#EA580C" : (dark ? "#333" : "#e2e8f0"), color: reason ? "#fff" : th.textSub, fontWeight:800, fontSize:13.5, cursor: reason ? "pointer" : "default", fontFamily:bf }}>
                {state.busy ? (hi ? "भेज रहे हैं…" : "Sending…") : (hi ? "रिपोर्ट भेजें" : "Send report")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Answer menu — long-press an AI answer (or tap ⋯ under it) ───────────────
// Copy · Listen · Share · Report a problem. Report lives here instead of a
// visible button on every answer (Play's AI policy only needs it reachable
// in-app; a "Report" label on each answer made every reply look doubtful).
const menuPlain = (t) => String(t || "")
  .replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*\*/g, "")
  .replace(/^\s*[*-] /gm, "• ").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)").trim();

function MenuIcon({ name }) {
  const p = { width:18, height:18, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.9, strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":true };
  if (name === "copy")   return <svg {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>;
  if (name === "listen") return <svg {...p}><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>;
  if (name === "stop")   return <svg {...p}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>;
  if (name === "share")  return <svg {...p}><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>;
  if (name === "flag")   return <svg {...p}><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>;
  if (name === "check")  return <svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>;
  return null;
}

function AnswerMenu({ text, lang, dark, speaking, onListen, reported, onReport, onClose, fromPress = false }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const hi = lang === "hi";
  const [copied, setCopied] = useState(false);
  // Opened by a long-press: the finger is still down, and lifting it fires a
  // click on whatever now sits under it (the backdrop or a row). Ignore taps
  // until shortly after the finger lifts.
  const armed = useRef(!fromPress);
  useEffect(() => {
    if (!fromPress) return;
    let t1 = null;
    const arm = () => { clearTimeout(t1); t1 = setTimeout(() => { armed.current = true; }, 350); };
    const fallback = setTimeout(() => { armed.current = true; }, 1500);
    const evs = ["pointerup", "pointercancel", "touchend"];
    evs.forEach(e => window.addEventListener(e, arm, true));
    return () => { clearTimeout(t1); clearTimeout(fallback); evs.forEach(e => window.removeEventListener(e, arm, true)); };
  }, [fromPress]);
  const guard = (fn) => (e) => { if (!armed.current) { e?.preventDefault?.(); return; } fn(e); };
  const line = dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const copy = async () => {
    const t = menuPlain(text);
    try { await navigator.clipboard.writeText(t); }
    catch {
      try { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); } catch {}
    }
    setCopied(true); setTimeout(onClose, 650);
  };
  const share = async () => {
    try { await navigator.share({ text: menuPlain(text) + "\n\n— Yojana Sahay · yojanasahay.vercel.app" }); } catch {}
    onClose();
  };
  const rows = [
    { id:"copy",   icon: copied ? "check" : "copy", label: copied ? (hi ? "कॉपी हो गया" : "Copied") : (hi ? "जवाब कॉपी करें" : "Copy answer"), run: copy },
    canSpeak() && { id:"listen", icon: speaking ? "stop" : "listen", label: speaking ? (hi ? "सुनना रोकें" : "Stop listening") : (hi ? "सुनें" : "Listen"), run: () => { onListen(); onClose(); } },
    typeof navigator !== "undefined" && navigator.share && { id:"share", icon:"share", label: hi ? "शेयर करें" : "Share", run: share },
    { id:"report", icon: reported ? "check" : "flag", label: reported ? (hi ? "रिपोर्ट भेजी जा चुकी है" : "Problem reported") : (hi ? "समस्या बताएं" : "Report a problem"), run: () => { if (!reported) onReport(); else onClose(); }, muted: true },
  ].filter(Boolean);
  return (
    <div onClick={guard(onClose)} style={{ position:"fixed", inset:0, zIndex:9090, background:"rgba(2,6,23,0.42)", display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"fade-in 0.15s ease-out" }}>
      <div role="menu" aria-label={hi ? "जवाब के विकल्प" : "Answer options"} onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:520, background: dark ? "#111214" : "#F6F7F9", borderRadius:"20px 20px 0 0", padding:"8px 12px calc(12px + env(safe-area-inset-bottom))", fontFamily:bf, animation:"chips-reveal 0.2s ease-out" }}>
        <div style={{ width:36, height:4, borderRadius:2, background: dark ? "#3a3b40" : "#d4d7dd", margin:"2px auto 10px" }} />
        <div style={{ background: dark ? "#1A1B1F" : "#fff", border:`1px solid ${line}`, borderRadius:14, overflow:"hidden" }}>
          {rows.map((r, i) => (
            <div key={r.id} role="menuitem" tabIndex={0} onClick={guard(r.run)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); r.run(); } }}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", cursor:"pointer", borderTop: i ? `1px solid ${line}` : "none",
                color: r.muted ? th.textSub : th.text, fontSize:14, fontWeight:600 }}>
              <span style={{ display:"inline-flex", color: r.id === "copy" && copied ? "#16a34a" : (r.muted ? th.textSub : (dark ? "#FFB366" : "#C2410C")) }}><MenuIcon name={r.icon} /></span>
              {r.label}
            </div>
          ))}
        </div>
        <button type="button" onClick={guard(onClose)}
          style={{ width:"100%", marginTop:8, padding:12, borderRadius:14, border:`1px solid ${line}`, background: dark ? "#1A1B1F" : "#fff", color:th.text, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:bf }}>
          {hi ? "बंद करें" : "Close"}
        </button>
      </div>
    </div>
  );
}

// Long-press (touch) / right-click (mouse) → onOpen. A small move or scroll
// cancels it so normal scrolling never opens the menu.
function useLongPress(onOpen, enabled) {
  const t = useRef(null); const start = useRef(null); const fired = useRef(false);
  const clear = () => { if (t.current) { clearTimeout(t.current); t.current = null; } };
  if (!enabled) return {};
  return {
    onPointerDown: (e) => {
      if (e.pointerType === "mouse") return;
      fired.current = false; start.current = { x:e.clientX, y:e.clientY };
      clear(); t.current = setTimeout(() => { fired.current = true; onOpen(); }, 480);
    },
    onPointerMove: (e) => { if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) clear(); },
    onPointerUp: clear, onPointerCancel: clear, onPointerLeave: clear,
    onContextMenu: (e) => { e.preventDefault(); clear(); if (!fired.current) onOpen(); fired.current = false; },
    onClickCapture: (e) => { if (fired.current) { e.preventDefault(); e.stopPropagation(); fired.current = false; } },
  };
}

function ChatBubble({ msg, lang, dark, isNew, live = false, question = "", showAvatar = true, showTime = true, dayLabel = null, isLatest = false, onOpenDetail, eligibleIds, trackedApps, onChecklist, onOpenChecker, onQuizDone, onAsk, onQuizRestart, onRecheck }) {
  const th     = THEME[dark ? "dark" : "light"];
  const bf     = fontFamily(lang);
  const isUser = msg.role === "user";
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Read-aloud
  const [speaking, setSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const speakingRef = useRef(false);
  speakingRef.current = speaking;
  // Leaving the chat (or clearing it) stops this bubble's voice — only if it's the one talking.
  useEffect(() => () => { if (speakingRef.current) stopSpeaking(); }, []);
  const speakRunRef = useRef(0);
  const toggleSpeak = async () => {
    if (!canSpeak()) return;
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    const run = ++speakRunRef.current;
    setSpeaking(true);
    const v = await speak(msg.content, lang, { onEnd: () => { if (speakRunRef.current === run) setSpeaking(false); } });
    if (speakRunRef.current === run) setVoiceName(voiceLabel(v));
  };

  // Schemes this answer names → cards
  const schemes = useMemo(
    () => (!isUser && !live && onOpenDetail ? findSchemesInText(msg.content) : []),
    [msg.content, isUser, live, onOpenDetail]
  );

  // ── Feature 2: Typewriter animation for new AI messages ───────────────────
  // Streamed answers already appeared word by word — no second animation.
  const shouldAnimate = isNew && !isUser && !live && !msg.streamed;
  const [displayed, setDisplayed] = useState(shouldAnimate ? "" : msg.content);
  const [isDone,    setIsDone]    = useState(!shouldAnimate);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) return;
    const text = msg.content;
    let i = 0;
    // ~18ms/char ≈ 55 chars/sec — fast & premium feeling
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current);
        setIsDone(true);
      }
    }, 18);
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Strip markdown so raw symbols never flash during typewriter animation:
  // 1. Complete **bold** pairs → plain text
  // 2. Orphaned ** (closing pair hasn't been typed yet) → remove
  // 3. * bullet at line start → replace with • so list lines look clean mid-type
  const stripMd = (t) => t
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/^\* /gm, "• ");

  const pressProps = useLongPress(() => setMenuOpen("press"), !isUser && isDone && !live);

  // ── Calm, readable bubbles ───────────────────────────────────────────────
  // Answers sit on a plain card with a hairline border (no glow, no blur —
  // blur on every bubble also slowed scrolling on phones). Colour lives on
  // the user's own messages.
  const aiBubbleStyle = !isUser ? {
    background: dark ? "#1A1B1F" : "#FFFFFF",
    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}`,
    boxShadow: dark ? "none" : "0 1px 2px rgba(15,23,42,0.05)",
  } : {};
  const userBubbleStyle = isUser ? {
    background: "linear-gradient(135deg, #2F4BB8 0%, #4F46E5 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: dark ? "0 2px 10px -4px rgba(79,70,229,0.55)" : "0 2px 10px -4px rgba(47,75,184,0.45)",
  } : {};

  // ── Formatted timestamp — null when no ts stored (legacy msgs) ────────────
  const timeLabel = showTime ? clockOf(msg.timestamp, lang) : null;

  return (
    <div style={{ marginBottom: showAvatar ? 14 : 4 }}>
      {dayLabel && (
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 6px 14px", fontFamily:bf }}>
          <span style={{ flex:1, height:1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)" }} />
          <span style={{ fontSize:10.5, fontWeight:600, letterSpacing:0.3, color: dark ? "rgba(200,200,210,0.55)" : "rgba(71,85,105,0.7)" }}>{dayLabel}</span>
          <span style={{ flex:1, height:1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)" }} />
        </div>
      )}
      {/* ── Bubble row (avatar + bubble) ─────────────────────────────────── */}
      <div className={isUser ? "ai-msg-bubble-user" : (msg.streamed && isNew ? "" : "ai-msg-bubble-ai")}
        style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", alignItems:"flex-end", gap:6 }}>
        {!isUser && (showAvatar ? (
          <div style={{
            width:28, height:28, borderRadius:"50%", flexShrink:0,
            overflow:"hidden",
          }}>
            <img src={aiAvatar} alt="AI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        ) : <div style={{ width:28, flexShrink:0 }} />)}
        <div {...pressProps} className={!isUser ? "ai-answer-press" : undefined} style={{
          maxWidth:"88%",
          color: isUser ? "#FFFFFF" : th.text,
          borderRadius: isUser ? (showAvatar ? "18px 18px 5px 18px" : "18px") : (showAvatar ? "18px 18px 18px 5px" : "18px"),
          padding: isUser ? "9px 14px" : "11px 15px", fontSize:13.5, lineHeight:1.62, fontFamily:bf,
          whiteSpace:"pre-wrap", wordBreak:"break-word",
          transition:"box-shadow 0.3s",
          ...aiBubbleStyle,
          ...userBubbleStyle,
        }}>
          {!isUser && msg.steps?.length > 0 && isDone && !live && <StepsSummary steps={msg.steps} dark={dark} lang={lang} />}
          {live ? (
              <>
                {renderContent(tidyPartial(msg.content), false, th, dark)}
                <span style={{
                  display:"inline-block", width:2, height:"1em",
                  background:"#FF9933", marginLeft:2, borderRadius:1,
                  animation:"typing-cursor 0.7s step-end infinite",
                  verticalAlign:"text-bottom",
                }} />
              </>
            ) : isDone
            ? renderContent(msg.content, isUser, th, dark)
            : (
              <>
                {stripMd(displayed)}
                {/* Blinking cursor while typing */}
                <span style={{
                  display:"inline-block", width:2, height:"1em",
                  background:"#FF9933", marginLeft:2, borderRadius:1,
                  animation:"typing-cursor 0.7s step-end infinite",
                  verticalAlign:"text-bottom",
                }} />
              </>
            )
          }

          {/* ── Footer: official-source seal + Listen ────────────────────────
               The brand name is already in the header, so the footer carries
               the "official" note instead of repeating it. Solid colours so it
               stays readable on the tinted glass bubble. */}
          {!isUser && isDone && !live && isLatest && (
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              justifyContent: schemes.length ? "flex-start" : "flex-end",
              marginTop:10, paddingTop:8,
              borderTop: dark
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(0,53,128,0.12)",
              animation: msg.streamed && isNew ? "none" : "badge-pop 0.32s ease-out",
              whiteSpace:"normal",
            }}>
              {/* The "official data" seal only on answers about schemes —
                  not on greetings, app or developer questions. */}
              {schemes.length > 0 && <div style={{
                display:"inline-flex", alignItems:"center", gap:5, minWidth:0,
                background: dark ? "rgba(20,40,80,0.55)" : "rgba(255,255,255,0.92)",
                border:`1px solid ${dark ? "rgba(120,170,255,0.35)" : "rgba(0,53,128,0.22)"}`,
                borderRadius:8, padding:"3px 8px 3px 6px",
                boxShadow: dark ? "none" : "0 1px 2px rgba(0,53,128,0.08)",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" style={{ flexShrink:0 }} aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={dark ? "#3b82f6" : "#003580"} />
                  <path d="m8.5 12.2 2.4 2.4 4.8-5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:0.15, lineHeight:1.25,
                  color: dark ? "#cfe0ff" : "#003580",
                  fontFamily:bf,
                }}>
                  {lang === "hi" ? "आधिकारिक योजना डेटा पर आधारित" : "Based on official scheme data"}
                </span>
              </div>}
              {canSpeak() && (
                <span role="button" onClick={toggleSpeak}
                  aria-label={speaking ? "Stop" : "Listen"}
                  style={{
                    marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:4,
                    fontSize:10.5, fontWeight:700, cursor:"pointer", userSelect:"none", flexShrink:0,
                    color: speaking ? "#fff" : (dark ? "#FFB366" : "#C2410C"),
                    background: speaking ? "#dc2626" : (dark ? "rgba(28,28,30,0.85)" : "#fff"),
                    border:`1px solid ${speaking ? "#dc2626" : (dark ? "rgba(255,153,51,0.45)" : "rgba(194,65,12,0.35)")}`,
                    borderRadius:20, padding:"3px 10px",
                    boxShadow: dark ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
                  }}>
                  {speaking ? "■ " : "🔊 "}{speaking ? (lang === "hi" ? "रोकें" : "Stop") : (lang === "hi" ? "सुनें" : "Listen")}
                  {speaking && voiceName && <span style={{ fontWeight:500, opacity:0.75, maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>· {voiceName}</span>}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Scheme cards — every scheme this answer names, one tap away ───── */}
      {isDone && !live && schemes.length > 0 && (
        <SchemeCards schemes={schemes} lang={lang} dark={dark} onOpen={onOpenDetail} eligibleIds={eligibleIds} trackedApps={trackedApps} />
      )}
      {isDone && !live && !isUser && msg.ui?.quiz && (
        <EligibilityFlow quiz={msg.ui.quiz} lang={lang} dark={dark} onDone={onQuizDone} onAsk={onAsk} onOpenDetail={onOpenDetail} onRestart={onQuizRestart} />
      )}
      {isDone && !live && !isUser && !msg.ui?.quiz && (schemes.length > 0 || msg.actions?.length > 0 || msg.ui) && (
        <AnswerActions msg={msg} schemes={schemes} lang={lang} dark={dark} trackedApps={trackedApps} onChecklist={onChecklist} onOpenChecker={msg.ui?.open?.length ? onOpenChecker : null} onRecheck={isNew ? onRecheck : null} onOpenDetail={onOpenDetail} />
      )}

      {/* ── Time + (older answers) a quiet listen button ─────────────────── */}
      {!live && (timeLabel || (!isUser && isDone)) && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          justifyContent: isUser ? "flex-end" : "flex-start",
          paddingLeft: isUser ? 0 : 36,
          paddingRight: isUser ? 4 : 0,
          marginTop: 4,
        }}>
          {timeLabel && (
            <span style={{
              fontSize: 10, fontFamily: "'Noto Sans', sans-serif", fontWeight: 500, letterSpacing: 0.15,
              color: dark ? "rgba(170,170,180,0.55)" : "rgba(100,116,139,0.75)", userSelect: "none",
            }}>{timeLabel}</span>
          )}
          {!isUser && isDone && !isLatest && canSpeak() && (
            <span role="button" tabIndex={0} onClick={toggleSpeak}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSpeak(); } }}
              aria-label={speaking ? (lang === "hi" ? "रोकें" : "Stop") : (lang === "hi" ? "सुनें" : "Listen")}
              title={speaking ? (lang === "hi" ? "रोकें" : "Stop") : (lang === "hi" ? "सुनें" : "Listen")}
              style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center", width:24, height:22, borderRadius:7, cursor:"pointer",
                fontSize:11, color: speaking ? "#fff" : (dark ? "rgba(255,179,102,0.85)" : "#C2410C"),
                background: speaking ? "#dc2626" : "transparent",
                border:`1px solid ${speaking ? "#dc2626" : (dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)")}`,
              }}>
              {speaking ? "■" : "🔊"}
            </span>
          )}
          {!isUser && isDone && (
            <span role="button" tabIndex={0} onClick={() => setMenuOpen(true)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenuOpen(true); } }}
              aria-label={lang === "hi" ? "और विकल्प" : "More options"}
              title={lang === "hi" ? "और विकल्प (या जवाब को दबाकर रखें)" : "More options (or long-press the answer)"}
              style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center", width:26, height:22, borderRadius:7, cursor:"pointer",
                color: dark ? "rgba(170,170,180,0.6)" : "rgba(100,116,139,0.7)", userSelect:"none",
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
            </span>
          )}
        </div>
      )}
      {menuOpen && <AnswerMenu fromPress={menuOpen === "press"} text={msg.content} lang={lang} dark={dark} speaking={speaking} onListen={toggleSpeak} reported={reported}
        onReport={() => { setMenuOpen(false); setReportOpen(true); }} onClose={() => setMenuOpen(false)} />}
      {reportOpen && <AiReportSheet answer={msg.content} question={question} lang={lang} dark={dark} onClose={() => setReportOpen(false)} onDone={() => setReported(true)} />}
    </div>
  );
}

// ─── Occupation & field label maps (used by WelcomeScreen + handleSend) ─────
const OCC_EN  = { farmer:"Farmer",student:"Student",women:"Homemaker",senior:"Senior Citizen",business:"Business Owner",general:"General Citizen" };
const OCC_HI  = { farmer:"किसान",student:"छात्र",women:"गृहिणी",senior:"वरिष्ठ नागरिक",business:"व्यापारी",general:"नागरिक" };
const INC_MAP = { below1:"below ₹1 Lakh/yr","1to3":"₹1–3 Lakh/yr","3to6":"₹3–6 Lakh/yr",above6:"above ₹6 Lakh/yr" };
const AGE_MAP = { below18:"below 18 yrs","18to35":"18–35 yrs","35to60":"35–60 yrs",above60:"above 60 yrs" };
const AREA_MAP= { rural:"rural/village",urban:"urban/city",semi:"semi-urban town" };

function WelcomeScreen({ lang, dark, onSuggest, profile, onPick, onShowAll }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";

  // Build welcome message — personalized when profile exists
  const firstName  = profile?.name?.split(" ")[0] || "";
  const occLabel   = profile ? ((isHindi ? OCC_HI : OCC_EN)[profile.occupation] || profile.occupation) : "";

  // FIX Bug 3: derive title exactly as the AI prompt instructs, so the static
  // welcome bubble ("Namaste Mr. Rahul!") is consistent with what the AI says.
  const titledName = (() => {
    if (!profile) return "";
    if (isHindi) return `${firstName} जी`; // [Name] जी for everyone in Hindi
    if (profile.gender === "male") return `Mr. ${firstName}`;
    if (profile.gender === "female") {
      const married = profile.marital === "married";
      return married ? `Mrs. ${firstName}` : `Ms. ${firstName}`;
    }
    return firstName; // "other" / unspecified → no title
  })();

  const welcomeMsg = profile
    ? (isHindi
        ? `नमस्ते ${titledName}! 🙏\nमैं आपकी प्रोफाइल देख सकता हूं — ${occLabel}, ${profile.state}।\nआपके लिए एकदम सटीक योजनाएं बताऊंगा, हिंदी या English में।`
        : `Namaste ${titledName}! 🙏\nI can see your profile — ${occLabel} from ${profile.state}.\nI'll give you tailored scheme recommendations. Ask anything!`)
    : (isHindi
        ? "नमस्ते! 🙏 मैं Yojana Sahay का AI सहायक हूं।\nआपको सरकारी योजनाएं खोजने और समझने में मदद करूंगा।\nहिंदी या English — जो भी आसान हो, पूछें!"
        : "Namaste! 🙏 I'm Yojana Sahay's AI Assistant.\nI'll help you find and understand government schemes.\nAsk me anything in Hindi or English!");

  return (
    <div style={{ animation:"fade-in 0.3s ease-out", paddingBottom:8 }}>

      {/* Welcome bubble */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:12 }}>
        <div style={{
          width:32, height:32, borderRadius:"50%", flexShrink:0,
          overflow:"hidden",
        }}>
          <img src={aiAvatar} alt="AI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        </div>
        <div style={{
          background:th.card, border:`1.5px solid ${th.border2}`,
          borderRadius:"18px 18px 18px 4px", padding:"13px 15px",
          fontSize:13.5, lineHeight:1.65, fontFamily:bf, color:th.text,
          boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
          maxWidth:"82%", whiteSpace:"pre-wrap",
        }}>
          {welcomeMsg}
        </div>
      </div>

      {/* ── Profile active badge — only when logged in ── */}
      {profile && (
        <div style={{
          marginLeft:40, marginBottom:14,
          display:"inline-flex", alignItems:"center", gap:7,
          background: dark ? "rgba(19,136,8,0.18)" : "rgba(19,136,8,0.09)",
          border:"1.5px solid rgba(19,136,8,0.32)",
          borderRadius:20, padding:"5px 13px 5px 8px",
          animation:"badge-pop 0.35s ease-out",
        }}>
          <div style={{
            width:18, height:18, borderRadius:"50%", background:"#138808",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <span style={{ fontSize:9, color:"#fff", fontWeight:900 }}>✓</span>
          </div>
          <span style={{ fontSize:10.5, fontWeight:700, color:"#138808", fontFamily:bf }}>
            {isHindi ? "प्रोफाइल सक्रिय" : "Profile Active"} · {profile.state}
          </span>
        </div>
      )}

      {/* What I can do — tap to try */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:10, paddingLeft:40, fontFamily:bf }}>
        <div style={{ flex:1, fontSize:10, fontWeight:800, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase" }}>
          {isHindi ? "मैं यह कर सकता हूं — टैप करें" : "What I can do — tap to try"}
        </div>
        <span role="button" onClick={onShowAll} style={{ fontSize:11.5, fontWeight:700, color:"#EA580C", cursor:"pointer" }}>
          {isHindi ? "सब देखें ›" : "See all ›"}
        </span>
      </div>
      <div style={{ paddingLeft:40 }}>
        <CapabilityGrid items={CAPABILITIES.slice(0, 6)} lang={lang} dark={dark} onPick={onPick} />
      </div>

      {/* Popular topics */}
      <div style={{ fontSize:10, fontWeight:800, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase", margin:"16px 0 8px", paddingLeft:40, fontFamily:bf }}>
        {isHindi ? "या कोई विषय पूछें" : "Or ask about a topic"}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7, paddingLeft:40 }}>
        {SUGGESTED[lang].map((s, i) => (
          <div key={i} className="ai-suggested" onClick={() => onSuggest(s.text)}
            style={{
              background:th.card, border:`1.5px solid ${th.border2}`, borderRadius:20,
              padding:"7px 12px", fontSize:12, fontFamily:bf, color:th.text,
              cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6,
              transition:"opacity 0.15s, transform 0.15s",
            }}>
            <span style={{ fontSize:14 }}>{s.icon}</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AIChat({ lang="en", dark=false, profile=null, uid=null, matchedSchemes=[], onOpenDetail=null, eligAnswers=null, onOpenChecker=null, isPro=false }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const chatKey = chatStorageKey(uid);   // unique per user

  const [messages,     setMessages]     = useState(() => {
    try {
      const saved = localStorage.getItem(chatKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input,        setInput]        = useState("");
  const trackedApps = useApplications(); // "I've applied" entries → the AI can answer "what's my application status?"
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [chips,        setChips]        = useState([]);
  const [usedChips,    setUsedChips]    = useState(new Set());
  // The answer being written right now: { text, status }. Kept out of
  // `messages` so half-written text is never saved to history.
  const [live,         setLive]         = useState(null);
  const [checklist,    setChecklist]    = useState(null); // schemes for the documents sheet
  const [showCaps,     setShowCaps]     = useState(false); // "✨ What can I do?" sheet
  // One-time "New" banner for people who already have a chat history.
  const [newsSeen, setNewsSeen] = useState(() => { try { return localStorage.getItem("ys_ai_features_v1") === "1"; } catch { return true; } });
  const dismissNews = () => { setNewsSeen(true); try { localStorage.setItem("ys_ai_features_v1", "1"); } catch {} };
  // Answers from the in-chat eligibility check (newest wins over the profile).
  const chatAnsKey = `yojana_chat_answers_${uid || "guest"}`;
  const [chatAnswers, setChatAnswers] = useState(() => { try { return JSON.parse(localStorage.getItem(chatAnsKey) || "null"); } catch { return null; } });
  const effAnswers = chatAnswers || eligAnswers;
  const effMatched = useMemo(() => {
    if (!chatAnswers) return matchedSchemes;
    return eligibilityResult(chatAnswers).ids.map(id => SCHEME_BY_ID_CHAT.get(id)).filter(Boolean);
  }, [chatAnswers, matchedSchemes]);
  const eligibleIds = useMemo(() => new Set((effMatched || []).map(s => s?.id).filter(Boolean)), [effMatched]);

  // Start the in-chat check without calling the AI (instant, free).
  const startQuiz = useCallback((prefill = null) => {
    const start = prefill ? {} : startingAnswers(chatAnswers || eligAnswers, {}, true);
    setMessages(prev => [...prev,
      { role:"user", content: isHindi ? "मेरी पात्रता जांचें" : "Check my eligibility", timestamp: Date.now() },
      { role:"assistant", streamed:true, timestamp: Date.now(),
        content: prefill
          ? (isHindi ? "ठीक है — अपने जवाब दोबारा चुनें। पहले वाले जवाब हाइलाइट हैं।" : "Sure — pick your answers again. Your previous answers are highlighted.")
          : (isHindi ? "चलिए जांचते हैं — नीचे जवाब पर टैप करें। मैं वही पूछूंगा जो मुझे अभी नहीं पता।" : "Let's check — tap your answers below. I'll only ask what I don't know yet."),
        ui: { quiz: { forSelf: true, start, ...(prefill ? { prefill } : {}) } } },
    ]);
  }, [chatAnswers, eligAnswers, isHindi]);
  const liveTextRef    = useRef("");
  const liveFrameRef   = useRef(0);
  const abortRef       = useRef(null);
  // (eligibleIds is defined below, once the in-chat answers are known)

  // ── Unified Reading-Time cooldown ────────────────────────────────────────────
  const [secondsLeft,  setSecondsLeft]  = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(false);

  const cooldownRef          = useRef(null);
  const bottomRef            = useRef(null);
  const scrollBoxRef         = useRef(null);
  const textareaRef          = useRef(null);

  // FIX Bug 4: pendingChips was state but never read in JSX → convert to ref
  // to avoid unnecessary re-renders on every startCooldown call.
  const pendingChipsRef      = useRef([]);

  // FIX Bug 5: secondsLeft in handleSend's dep array caused it (and handleKeyDown)
  // to be recreated every second as the countdown ticks. Use a ref instead.
  const secondsLeftRef       = useRef(0);

  // Pro users skip the reading pause (read via a ref so startCooldown stays stable).
  const isProRef             = useRef(isPro);
  isProRef.current           = isPro;

  // Something tapped during the reading pause (✨ option, answer button,
  // re-check…) waits here instead of skipping the pause, and runs as soon as
  // the pause ends — or right away if the user taps "Type now".
  const [queued, setQueued]  = useState(null);   // { label, run }
  const [readPlan, setReadPlan]   = useState(null); // readingPlan() of the last reply
  const [listening, setListening] = useState(false); // "Listen" playing → timer waits

  // FIX Bug 3: store the justUnlocked setTimeout handle so it can be cleared on
  // unmount, preventing "setState on unmounted component" errors.
  const justUnlockedTimerRef = useRef(null);

  // ── Persist chat history to localStorage ────────────────────────────────────
  // Capped at 100 messages to avoid bloating storage. Restored on next load.
  useEffect(() => {
    try {
      localStorage.setItem(chatKey, JSON.stringify(messages.slice(-100)));
    } catch {}
  }, [messages]);

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  // Scrolls only the chat box — scrollIntoView also nudged the whole page,
  // and ran on every countdown tick, which made the screen jump each second.
  // Smart follow: the chat stays pinned to the latest message while you're at
  // the bottom. If you scroll up to read an older answer, new content never
  // yanks you down — a "Latest" button appears instead (with a count of new
  // replies). Sending a message always brings you back down.
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmClearTimer = useRef(null);
  useEffect(() => () => clearTimeout(confirmClearTimer.current), []);
  const isCoolingDown = secondsLeft > 0;
  // Extras (official seal, Listen pill) only on the newest answer.
  let lastAiIdx = -1;
  for (let k = messages.length - 1; k >= 0; k--) if (messages[k].role === "assistant") { lastAiIdx = k; break; }
  const stickRef      = useRef(true);              // user is at (or near) the bottom
  const lastLenRef    = useRef(messages.length);
  const [jump, setJump] = useState({ show: false, unseen: 0 });
  const distFromBottom = (box) => box.scrollHeight - box.scrollTop - box.clientHeight;
  const scrollToLatest = useCallback((behavior = "smooth") => {
    const box = scrollBoxRef.current;
    if (!box) return;
    stickRef.current = true;
    setJump(j => (j.show || j.unseen ? { show: false, unseen: 0 } : j));
    box.scrollTo({ top: box.scrollHeight, behavior });
  }, []);
  const onChatScroll = useCallback(() => {
    const box = scrollBoxRef.current;
    if (!box) return;
    if (box.clientHeight === 0) return; // tab just got hidden — not a real scroll
    savedTopRef.current = box.scrollTop;
    const d = distFromBottom(box);
    stickRef.current = d < 160;
    const show = d > Math.max(320, box.clientHeight * 0.6);
    setJump(j => {
      const unseen = stickRef.current ? 0 : j.unseen;
      return j.show === show && j.unseen === unseen ? j : { show, unseen };
    });
  }, []);
  const firstFollowRef = useRef(true);
  useEffect(() => {
    const box = scrollBoxRef.current;
    if (!box) return;
    if (firstFollowRef.current) { // opening the chat: land on the latest message, no long glide
      firstFollowRef.current = false;
      box.scrollTop = box.scrollHeight;
      return;
    }
    const grew = messages.length > lastLenRef.current;
    lastLenRef.current = messages.length;
    const last = messages[messages.length - 1];
    if (stickRef.current || (grew && last?.role === "user")) {
      box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
      stickRef.current = true;
    } else if (grew && last?.role === "assistant") {
      setJump(j => ({ show: true, unseen: j.unseen + 1 }));
    }
  }, [messages, loading, chips, isCoolingDown]);
  // While an answer streams in, follow it — unless the user scrolled up to read.
  useEffect(() => {
    if (!live?.text) return;
    const box = scrollBoxRef.current;
    if (!box) return;
    if (stickRef.current || distFromBottom(box) < 140) box.scrollTop = box.scrollHeight;
  }, [live?.text]);
  // The tab is hidden with display:none when you switch away, and browsers
  // reset its scroll position then. When it shows again (from any button,
  // not only the nav), put you back where you were: on the latest message,
  // or on the older answer you were reading.
  const savedTopRef = useRef(null);
  useEffect(() => {
    const box = scrollBoxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    let lastH = box.clientHeight;
    const ro = new ResizeObserver(() => {
      const h = box.clientHeight;
      if (lastH === 0 && h > 0) {
        if (stickRef.current || savedTopRef.current == null) box.scrollTop = box.scrollHeight;
        else box.scrollTop = savedTopRef.current;
      }
      lastH = h;
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, []);
  // Home search → "Ask AI: …" sends the question; "Is this message real?"
  // puts a starter in the box for the user to finish. Works even if the chat
  // wasn't open yet (the request waits in window.__ysPendingChat).
  const pendingRunRef = useRef(null);
  pendingRunRef.current = (p) => {
    if (!p) return;
    if (p.kind === "ai" && p.text) whenFree(p.text, () => handleSend(p.text));
    else if (p.kind === "ai-draft") { setInput(p.text || ""); setTimeout(() => { try { textareaRef.current?.focus(); } catch {} }, 250); }
  };
  useEffect(() => {
    const take = () => {
      const p = window.__ysPendingChat;
      if (!p) return;
      window.__ysPendingChat = undefined;
      if (p.at && Date.now() - p.at > (p.ttl || 120000)) return; // stale (e.g. had to sign in first) — don't surprise them
      setTimeout(() => pendingRunRef.current?.(p), 120);
    };
    take();
    window.addEventListener("ys-chat-pending", take);
    return () => window.removeEventListener("ys-chat-pending", take);
  }, []);
  // The bottom nav's AI button asks for the latest message (App.jsx).
  useEffect(() => {
    const onLatest = (e) => scrollToLatest(e.detail?.instant ? "auto" : "smooth");
    window.addEventListener("ys-chat-latest", onLatest);
    return () => window.removeEventListener("ys-chat-latest", onLatest);
  }, [scrollToLatest]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, [input]);

  // FIX Bug 2: cleanup the interval (and the setTimeout) when the component
  // unmounts, preventing the interval from firing after navigation away.
  useEffect(() => {
    return () => {
      clearInterval(cooldownRef.current);
      clearTimeout(justUnlockedTimerRef.current);
      cancelAnimationFrame(liveFrameRef.current);
      try { abortRef.current?.abort(); } catch {}
    };
  }, []);

  // FIX Bug 5: keep the ref in sync so handleSend can read it without being
  // listed as a dependency that changes every second.
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  // FIX Bug 1: unlock side-effects (setChips, setJustUnlocked, setTimeout) were
  // previously called INSIDE the setSecondsLeft updater function. React's
  // StrictMode / Concurrent Mode can invoke updaters multiple times, so chips
  // could have appeared twice and justUnlocked could have fired erratically.
  // Moving them into a useEffect that watches secondsLeft is the correct pattern.
  useEffect(() => {
    if (secondsLeft === 0 && pendingChipsRef.current.length > 0) {
      setChips(pendingChipsRef.current);
      pendingChipsRef.current = [];
      setJustUnlocked(true);
      clearTimeout(justUnlockedTimerRef.current);           // FIX Bug 3
      justUnlockedTimerRef.current = setTimeout(
        () => setJustUnlocked(false), 500
      );
    }
  }, [secondsLeft]);

  useEffect(() => {
    if (!queued || loading || secondsLeft > 0) return;
    const job = queued;
    setQueued(null);
    secondsLeftRef.current = 0;
    job.run();
  }, [queued, loading, secondsLeft]);

  // ── Start reading-time cooldown ──────────────────────────────────────────────
  const startCooldown = useCallback((replyText, incomingChips, alreadyReadSecs = 0, ctx = {}) => {
    clearInterval(cooldownRef.current);
    const plan = readingPlan(replyText, { ...ctx, alreadyRead: alreadyReadSecs });
    setReadPlan(plan);
    // Pro, or nothing worth pausing for (short reply, tap-to-answer card):
    // no reading pause — follow-up chips show straight away.
    if (isProRef.current || plan.secs <= 0) {
      setSecondsLeft(0); setTotalSeconds(0); secondsLeftRef.current = 0;
      pendingChipsRef.current = [];
      setChips(incomingChips || []);
      return;
    }
    const secs = plan.secs;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    pendingChipsRef.current = incomingChips;  // FIX Bug 4: ref instead of state
    setChips([]);                             // hide any previous chips immediately

    cooldownRef.current = setInterval(() => {
      // While the answer is being read aloud ("Listen"), the timer waits.
      const talking = typeof window !== "undefined" && !!window.speechSynthesis?.speaking;
      setListening(talking);
      if (talking) return;
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          // FIX Bug 1: NO side-effects here — the useEffect above handles unlock.
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSend = useCallback(async (overrideText) => {
    const query = (overrideText ?? input).trim();
    // FIX Bug 5: read from ref — no longer a dep that changes every second
    if (!query || loading || secondsLeftRef.current > 0) return;

    setInput("");
    setError("");
    setChips([]);
    pendingChipsRef.current = [];             // FIX Bug 4: ref instead of state
    setSecondsLeft(0);
    clearInterval(cooldownRef.current);

    const nextUsedChips = overrideText
      ? new Set([...usedChips, overrideText])
      : usedChips;
    if (overrideText) setUsedChips(nextUsedChips);

    const userMsg      = { role:"user", content:query, timestamp: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    playSendSound();   // 🔊 send whoosh
    setLoading(true);
    setLive({ text:"", status:"", phase:null, trail:[], startedAt: Date.now() });
    liveTextRef.current = "";
    try { abortRef.current?.abort(); } catch {}
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    abortRef.current = ctrl;
    let firstTextAt = 0;

    try {
      const { reply, followUps: aiChips, actions, steps, ui } = await runAgent(
        [
          // ── Profile context prefix — invisible in UI, sent to API only ──────
          // Provides the AI with the user's profile so it can personalize responses.
          ...(profile ? [
            { role:"user", content:`[Profile context for personalization — Name: "${profile.name}", Gender: "${profile.gender==="female"?"Female":profile.gender==="male"?"Male":profile.gender==="other"?"Other":"not specified"}", State: "${profile.state}", Occupation: "${(OCC_EN[profile.occupation]||profile.occupation)}", Age group: "${(AGE_MAP[profile.age]||profile.age)}", Income: "${(INC_MAP[profile.income]||profile.income)}", Area: "${(AREA_MAP[profile.area]||profile.area)}", Housing: "${profile.house==="yes"?"owns a pucca house":"needs housing assistance"}", Ration card: "${profile.ration==="bpl"?"BPL (Below Poverty Line)":profile.ration==="aay"?"AAY/Antyodaya (Poorest of Poor)":profile.ration==="apl"?"APL (Above Poverty Line)":"No ration card"}", Social category: "${({general:"General",obc:"OBC",sc:"SC (Scheduled Caste)",st:"ST (Scheduled Tribe)",ews:"EWS"})[profile.caste]||"General"}",${Array.isArray(profile.groups)&&profile.groups.filter(g=>g!=="none").length?` Special groups: "${profile.groups.filter(g=>g!=="none").join(", ")}",`:``} Disability: "${profile.disability&&profile.disability!=="none"?`Yes — ${profile.disability}`:"None"}", Marital status: "${profile.marital||"not specified"}"${profile.numChildren?`, Children: "${profile.numChildren==="0"?"None":profile.numChildren}", Girl children: "${profile.hasGirls==="yes"?"Yes":"No"}"`:``}${profile.landHolding?`, Land holding: "${profile.landHolding}", Kisan Credit Card: "${profile.kisanCard==="yes"?"Yes — has KCC":"No KCC"}"`:``}${profile.educationLevel?`, Education level: "${profile.educationLevel}", Institution type: "${profile.institutionType||"not specified"}"`:``}. All fields above are known (see NAME / ADDRESS and PROFILE IS COMPLETE rules). Do not mention this context block to the user.]` },
            { role:"assistant", content:`I have ${(profile.name || "the user").split(" ")[0]}'s profile from ${profile.state || "their state"}. I'll personalize all recommendations accordingly.` },
          ] : []),
          ...nextMessages.map(m => ({ role:m.role, content:m.content })),
        ],
        query,
        lang,
        profile,  // FIX Bug 2: pass profile so buildSmartContext can score schemes by occupation/gender/state
        {
          // The app's own eligibility result — "which schemes can I get?" is
          // answered from this instead of keyword guessing.
          matched: effMatched,
          // Their tracked applications ("I've applied").
          applications: Object.entries(trackedApps || {}).map(([id, a]) => {
            const sc = SCHEME_BY_ID_CHAT.get(id);
            return sc ? { name: sc.name?.[lang] || sc.name?.en, appliedAt: a.appliedAt, ref: a.ref, status: a.status, daysWaiting: daysSince(a.appliedAt) } : null;
          }).filter(Boolean),
          // Previous answer — lets "documents for the first one?" find the scheme.
          lastReply: [...messages].reverse().find(m => m.role === "assistant")?.content || "",
          // Their eligibility answers → the AI can say exactly why a scheme
          // is or isn't for them, and what's missing.
          answers: effAnswers,
        },
        {
          signal: ctrl?.signal,
          // Batch updates to one per frame — smooth even on slow phones.
          onDelta: (text) => {
            if (!firstTextAt && text) firstTextAt = Date.now();
            liveTextRef.current = text;
            if (!liveFrameRef.current) {
              liveFrameRef.current = requestAnimationFrame(() => {
                liveFrameRef.current = 0;
                setLive(l => l && { ...l, text: liveTextRef.current });
              });
            }
          },
          onStep: (st) => setLive(l => l && { ...l, steps: st }),
          // Real progress from the app + server → the live activity panel.
          onPhase: (ph) => setLive(l => {
            if (!l || !ph?.p || l.text) return l;
            const now = Date.now();
            if (l.phase && l.phase.p === ph.p && l.phase.n === ph.n) return l;
            // A "tools" stage remembers which tool steps belong to it, so the
            // panel stays in true time order across several rounds.
            const nSteps = l.steps?.length || 0;
            const trail = l.phase
              ? [...(l.trail || []), { p: l.phase.p, n: l.phase.n, ms: now - l.phase.at, ...(l.phase.p === "tools" ? { from: l.phase.from, to: nSteps } : {}) }]
              : (l.trail || []);
            return { ...l, trail, phase: { p: ph.p, n: ph.n, at: now, ...(ph.p === "tools" ? { from: nSteps } : {}) } };
          }),
          onStatus: (kind, q) => {
            if (kind === "search") setLive(l => {
              if (!l) return l;
              const now = Date.now();
              const trail = l.phase ? [...(l.trail || []), { p: l.phase.p, n: l.phase.n, ms: now - l.phase.at }] : (l.trail || []);
              return { ...l, trail, phase: { p: "search", n: q ? q.slice(0, 50) : undefined, at: now } };
            });
          },
        },
      );
      if (ctrl && abortRef.current !== ctrl) return; // chat was cleared meanwhile
      cancelAnimationFrame(liveFrameRef.current); liveFrameRef.current = 0;
      const hasUi = ui && (ui.checklist || ui.open?.length || ui.tracked?.length || ui.quiz);
      setMessages(prev => [...prev, {
        role:"assistant", content:reply, timestamp: Date.now(), streamed: true,
        ...(actions?.length ? { actions } : {}),
        ...(steps?.length ? { steps } : {}),
        ...(hasUi ? { ui } : {}),
      }]);
      setLive(null);
      playReceiveSound(); // 🔊 receive chime
      const freshChips = aiChips.filter(c => !nextUsedChips.has(c));
      startCooldown(reply, freshChips, firstTextAt ? (Date.now() - firstTextAt) / 1000 : 0, {
        schemes: findSchemesInText(reply).length,
        quiz: !!ui?.quiz,
        checklist: !!ui?.checklist,
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      cancelAnimationFrame(liveFrameRef.current); liveFrameRef.current = 0;
      setLive(null);
      setError(`❌ ${err.message || (isHindi ? "जवाब नहीं मिला। दोबारा कोशिश करें।" : "Could not get response. Please try again.")}`);
    } finally {
      if (!ctrl || abortRef.current === ctrl) { setLoading(false); abortRef.current = null; }
    }
  // FIX Bug 5: secondsLeft removed from deps — secondsLeftRef.current is used instead
  // profile must be a dependency: without it the memoised handler kept the
  // profile from the first render, so after the user edited their profile
  // the AI kept personalising answers with the OLD state/occupation/income.
  }, [input, messages, loading, isHindi, lang, usedChips, startCooldown, profile, effMatched, trackedApps, effAnswers]);

  // Run now if the chat is free; during the reading pause or while an answer
  // is coming, line it up instead (shown in the timer bar, runs when it ends).
  const loadingRef = useRef(false);
  loadingRef.current = loading;
  const whenFree = useCallback((label, run) => {
    if (secondsLeftRef.current > 0 || loadingRef.current) setQueued({ label: String(label || "").slice(0, 60), run });
    else run();
  }, []);

  // A feature card was tapped.
  const pickCapability = useCallback((c) => {
    dismissNews();
    const L = isHindi ? "hi" : "en";
    const label = c[L]?.t || c[L]?.x || "";
    if (c.action === "quiz") { whenFree(label, () => startQuiz()); return; }
    if (c.action === "send") { whenFree(label, () => handleSend(c[L].x)); return; }
    whenFree(label, () => {
      setInput(c[L].x);
      setTimeout(() => {
        const el = textareaRef.current;
        if (el) { el.focus(); const n = el.value.length; try { el.setSelectionRange(n, n); } catch {} }
      }, 60);
    });
  }, [isHindi, startQuiz, handleSend, whenFree]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const isLocked = secondsLeft > 0;

  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      background:th.appBg, overflow:"hidden", fontFamily:bf,
    }}>
      <style>{GLOBAL_CSS}</style>
      {avatarPreview && (
        <AvatarPreviewModal onClose={() => setAvatarPreview(false)} />
      )}
      {checklist && (
        <ChecklistSheet schemes={checklist} lang={lang} dark={dark} onClose={() => setChecklist(null)} />
      )}
      {showCaps && (
        <CapabilitiesSheet lang={lang} dark={dark} onPick={pickCapability} onClose={() => setShowCaps(false)} />
      )}

      {/* HEADER — slim, calm bar; brand accent line at the bottom */}
      <div style={{
        position:"relative", flexShrink:0,
        background: dark ? "#141519" : "#FFFFFF",
        borderBottom:`1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)"}`,
        padding:"9px 12px 10px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div
            role="button" aria-label={isHindi ? "AI सहायक की तस्वीर" : "AI assistant picture"}
            onClick={() => setAvatarPreview(true)}
            style={{
              width:36, height:36, borderRadius:11, flexShrink:0, overflow:"hidden", position:"relative",
              boxShadow: dark ? "0 0 0 1px rgba(255,255,255,0.1)" : "0 0 0 1px rgba(15,23,42,0.08)",
              cursor:"pointer", transition:"transform 0.15s",
            }}
            onPointerDown={e => e.currentTarget.style.transform="scale(0.93)"}
            onPointerUp={e => e.currentTarget.style.transform="scale(1)"}
            onPointerLeave={e => e.currentTarget.style.transform="scale(1)"}
          >
            <img src={aiAvatar} alt="AI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:th.text, fontSize:15, fontWeight:800, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:bf }}>
              {isHindi ? "AI सहायक" : "AI Assistant"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2, fontSize:11, color:th.textSub, whiteSpace:"nowrap", overflow:"hidden", fontFamily:bf }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background: loading ? "#F59E0B" : "#22C55E", flexShrink:0, marginLeft:3,
                boxShadow:`0 0 0 3px ${loading ? "rgba(245,158,11,0.18)" : "rgba(34,197,94,0.16)"}`, transition:"background .3s" }} />
              <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>
                {loading ? (isHindi ? "जवाब तैयार कर रहा है…" : "Working on your answer…") : (isHindi ? "ऑनलाइन" : "Online")}
                {!loading && profile?.name ? (isHindi ? ` · ${(profile.name || "").split(" ")[0]} के लिए पर्सनल` : ` · Personalized for ${(profile.name || "").split(" ")[0]}`) : ""}
              </span>
            </div>
          </div>
          <AshokChakra size={34} duration="9s" compact />
          <div role="button" tabIndex={0} aria-label={isHindi ? "मैं क्या कर सकता हूं" : "What can I do?"} title={isHindi ? "मैं क्या कर सकता हूं" : "What can I do?"}
            onClick={() => { dismissNews(); setShowCaps(true); }}
            onKeyDown={e => { if (e.key === "Enter") { dismissNews(); setShowCaps(true); } }}
            style={{ width:32, height:32, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
              border:`1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}`, cursor:"pointer", color: dark ? "#FDBA74" : "#EA580C" }}>
            <CapIcon name="spark" size={17} stroke={2} />
          </div>
          {messages.length > 0 && (
            <div role="button" tabIndex={0}
              onClick={() => {
                // Two taps: the first asks "Sure?", so a mis-tap never wipes the chat.
                if (!confirmClear) {
                  setConfirmClear(true);
                  clearTimeout(confirmClearTimer.current);
                  confirmClearTimer.current = setTimeout(() => setConfirmClear(false), 3000);
                  return;
                }
                clearTimeout(confirmClearTimer.current); setConfirmClear(false);
                try { abortRef.current?.abort(); } catch {}
                abortRef.current = null;
                cancelAnimationFrame(liveFrameRef.current); liveFrameRef.current = 0;
                setLive(null); setLoading(false);
                if (canSpeak()) stopSpeaking();
                setMessages([]); setError(""); setChips([]);
                setChatAnswers(null); try { localStorage.removeItem(chatAnsKey); } catch {}
                pendingChipsRef.current = [];              // FIX Bug 4
                setUsedChips(new Set()); setSecondsLeft(0); setQueued(null);
                clearInterval(cooldownRef.current);
                clearTimeout(justUnlockedTimerRef.current); // FIX Bug 3
                try { localStorage.removeItem(chatKey); } catch {}
              }}
              style={{
                height:32, display:"flex", alignItems:"center", borderRadius:10, padding:"0 11px", flexShrink:0,
                background: confirmClear ? "#DC2626" : (dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)"),
                border:`1px solid ${confirmClear ? "#DC2626" : (dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)")}`,
                color: confirmClear ? "#fff" : th.textMid, fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:bf,
                transition:"background .2s, color .2s, border-color .2s",
              }}>
              {confirmClear ? (isHindi ? "पक्का?" : "Sure?") : (isHindi ? "साफ करें" : "Clear")}
            </div>
          )}
        </div>
        <div aria-hidden="true" style={{ position:"absolute", left:0, right:0, bottom:-1, height:2,
          background:"linear-gradient(90deg, #FF9933 0%, #FF9933 30%, rgba(255,255,255,0.6) 50%, #138808 70%, #138808 100%)", opacity: dark ? 0.55 : 0.7 }} />
      </div>

      {/* MESSAGES AREA */}
      <div ref={scrollBoxRef} data-keep-nav="" data-chat-scroll="" onScroll={onChatScroll} style={{ flex:1, overflowY:"auto", overscrollBehavior:"contain", padding:"18px 10px 6px", WebkitOverflowScrolling:"touch" }}>
        {messages.length === 0 && !loading && (
          <WelcomeScreen lang={lang} dark={dark} onSuggest={handleSend} profile={profile} onPick={pickCapability} onShowAll={() => setShowCaps(true)} />
        )}
        {messages.length > 0 && !newsSeen && (
          <div style={{ marginBottom:14, padding:"11px 12px", borderRadius:14, display:"flex", gap:10, alignItems:"flex-start",
            background: dark ? "linear-gradient(135deg,rgba(255,153,51,0.16),rgba(99,102,241,0.14))" : "linear-gradient(135deg,#FFF3E6,#EEF0FF)",
            border:`1px solid ${dark ? "rgba(255,153,51,0.35)" : "#FBD9B5"}`, fontFamily:bf, animation:"fade-in 0.3s ease-out" }}>
            <span style={{ fontSize:20 }}>✨</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text }}>{isHindi ? "नया: आपका AI सहायक अब काम भी करता है" : "New: your assistant can now do things for you"}</div>
              <div style={{ fontSize:11.5, color:th.textMid, marginTop:3, lineHeight:1.45 }}>
                {isHindi ? "पात्रता जांच, परिवार के लिए योजनाएं, आवेदन ट्रैक करना, तुलना, दस्तावेज़ सूची और ताज़ा खबर।" : "Eligibility checks, schemes for family, tracking applications, comparisons, document checklists and live news."}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <ActionPill dark={dark} primary icon="✨" label={isHindi ? "देखें क्या नया है" : "See what's new"} onClick={() => { dismissNews(); setShowCaps(true); }} />
                <ActionPill dark={dark} icon="" label={isHindi ? "बाद में" : "Later"} onClick={dismissNews} />
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            lang={lang}
            dark={dark}
            isNew={msg.role === "assistant" && i === messages.length - 1}
            isLatest={msg.role === "assistant" && i === lastAiIdx}
            question={msg.role === "assistant" && messages[i - 1]?.role === "user" ? messages[i - 1].content : ""}
            showAvatar={messages[i + 1]?.role !== msg.role}
            showTime={!messages[i + 1]?.timestamp || !msg.timestamp
              || messages[i + 1].timestamp - msg.timestamp > 5 * 60000
              || dayKeyOf(messages[i + 1].timestamp) !== dayKeyOf(msg.timestamp)}
            dayLabel={msg.timestamp && (!messages[i - 1]?.timestamp || dayKeyOf(messages[i - 1].timestamp) !== dayKeyOf(msg.timestamp)) ? dayLabelOf(msg.timestamp, lang) : null}
            onOpenDetail={onOpenDetail}
            eligibleIds={eligibleIds}
            trackedApps={trackedApps}
            onChecklist={setChecklist}
            onOpenChecker={onOpenChecker}
            onRecheck={() => whenFree(isHindi ? "पात्रता दोबारा जांचें" : "Re-check eligibility", () => startQuiz(effAnswers || {}))}
            onAsk={(t) => whenFree(t, () => handleSend(t))}
            onQuizRestart={(prev) => whenFree(isHindi ? "पात्रता दोबारा जांचें" : "Re-check eligibility", () => startQuiz(prev || {}))}
            onQuizDone={(ans) => {
              setMessages(prev => prev.map((m, j) => j === i && m.ui?.quiz ? { ...m, ui: { ...m.ui, quiz: { ...m.ui.quiz, done: ans } } } : m));
              if (msg.ui?.quiz?.forSelf) {
                setChatAnswers(ans);
                try {
                  localStorage.setItem(chatAnsKey, JSON.stringify(ans));
                  // Same shape the eligibility quiz saves (finished → shows results),
                  // and tell Home so its cards update without a reload.
                  localStorage.setItem("yojana_eligibility_answers", JSON.stringify({ answers: ans, step: 999, v: 2 }));
                  window.dispatchEvent(new Event("ys-quiz-saved"));
                } catch {}
              }
            }}
          />
        ))}

        {/* The answer as it is being written */}
        {loading && live?.text && live?.steps?.length > 0 && (
          <div style={{ paddingLeft:34, marginBottom:6 }}><AgentSteps steps={live.steps} dark={dark} lang={lang} compact /></div>
        )}
        {live?.text && (
          <ChatBubble msg={{ role:"assistant", content: live.text }} lang={lang} dark={dark} live />
        )}

        {/* Chips — only shown after cooldown ends */}
        {!loading && chips.length > 0 && (
          <FollowUpChips chips={chips} onTap={handleSend} lang={lang} dark={dark} />
        )}

        {loading && !live?.text && <TypingIndicator dark={dark} lang={lang} status={live?.status} steps={live?.steps} phase={live?.phase} trail={live?.trail} startedAt={live?.startedAt} />}
        {error && (
          <div style={{
            textAlign:"center", marginBottom:12,
            padding:"10px 16px", fontSize:12, fontFamily:bf,
            color:"#c53030", background:"#FFF5F5",
            border:"1px solid #FED7D7", borderRadius:12,
            animation:"fade-in 0.2s ease-out",
          }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} style={{ height:4 }} />
      </div>

      {/* JUMP TO LATEST — appears only when scrolled up; anchored just above the input */}
      <div style={{ position:"relative", height:0, zIndex:5 }}>
        <button
          type="button"
          onClick={() => scrollToLatest("smooth")}
          aria-label={isHindi ? "नवीनतम संदेश पर जाएं" : "Jump to latest message"}
          tabIndex={jump.show ? 0 : -1}
          style={{
            position:"absolute", left:"50%", bottom:12,
            transform:`translate(-50%, ${jump.show ? "0" : "14px"}) scale(${jump.show ? 1 : 0.92})`,
            opacity: jump.show ? 1 : 0, pointerEvents: jump.show ? "auto" : "none",
            transition:"opacity .22s ease, transform .28s cubic-bezier(.2,.9,.3,1.2)",
            display:"flex", alignItems:"center", gap:7, padding:"7px 14px 7px 9px", borderRadius:999, cursor:"pointer",
            fontFamily:bf, fontSize:12, fontWeight:700, whiteSpace:"nowrap",
            color: dark ? "#F8FAFC" : "#1B2A4A",
            background: dark ? "rgba(23,28,48,0.82)" : "rgba(255,255,255,0.9)",
            border:`1px solid ${jump.unseen ? "rgba(255,153,51,0.7)" : dark ? "rgba(148,163,184,0.28)" : "rgba(27,42,74,0.14)"}`,
            boxShadow: jump.unseen
              ? "0 8px 24px -8px rgba(255,153,51,0.55), 0 0 0 3px rgba(255,153,51,0.12)"
              : dark ? "0 8px 24px -10px rgba(0,0,0,0.7)" : "0 8px 22px -10px rgba(27,42,74,0.35)",
            backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
          }}>
          <span style={{ width:22, height:22, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg,#FF9933,#6366F1)", color:"#fff", fontSize:13, lineHeight:1 }}>↓</span>
          {jump.unseen
            ? (isHindi ? `${jump.unseen} नया जवाब` : `${jump.unseen} new ${jump.unseen === 1 ? "reply" : "replies"}`)
            : (isHindi ? "नवीनतम संदेश" : "Latest message")}
        </button>
      </div>

      {/* BOTTOM BAR — swaps between reading-time and normal input */}
      {isLocked ? (
        <ReadingTimeBar
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          dark={dark}
          lang={lang}
          onSkip={() => { clearInterval(cooldownRef.current); setSecondsLeft(0); }}
          queued={queued?.label}
          onCancelQueued={() => setQueued(null)}
          plan={readPlan}
          listening={listening}
          upNext={pendingChipsRef.current}
          onPickNext={(c) => whenFree(c, () => handleSend(c))}
        />
      ) : (
        <InputBar
          input={input}
          setInput={(v) => { setInput(v); if (error) setError(""); }}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          loading={loading}
          dark={dark}
          lang={lang}
          textareaRef={textareaRef}
          justUnlocked={justUnlocked}
        />
      )}
    </div>
  );
}
