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
import { canSpeak, speak, stopSpeaking, voiceLabel } from "./voice.js";
import { findSchemesInText } from "./schemeMatch.js";
import { useApplications, daysSince, trackApplication } from "./applications.js";
import { track } from "./track.js";
import { SCHEME_DB } from "./schemesData.js";
import aiAvatar from "./ai-avatar.webp";

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

// ─── READING TIME: dynamic cooldown based on reply length ─────────────────────
// Slower rural readers → ~2.5 words/sec. Min 10s, Max 15s.
function calcReadingTime(replyText) {
  const words = replyText.trim().split(/\s+/).length;
  const secs  = Math.round(words / 2.5);
  return Math.max(10, Math.min(15, secs));
}

// ─── MESSAGE TIMESTAMP FORMATTER ─────────────────────────────────────────────
// Returns a localized, human-readable timestamp for each chat message.
// • Today        → "2:34 PM"
// • Yesterday    → "Yesterday · 2:34 PM"
// • This year    → "May 21 · 2:34 PM"
// • Older        → "May 21, 2024 · 2:34 PM"
function formatMsgTime(ts, lang) {
  if (!ts) return null;
  const d   = new Date(ts);
  const now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay    = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays  = Math.round((today - msgDay) / 86400000);

  const locale  = lang === "hi" ? "hi-IN" : "en-IN";
  const timeStr = d.toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit", hour12:true });

  if (diffDays === 0) return timeStr;
  if (diffDays === 1) return lang === "hi" ? `कल · ${timeStr}` : `Yesterday · ${timeStr}`;

  const isThisYear = d.getFullYear() === now.getFullYear();
  const dateStr = d.toLocaleDateString(locale, {
    day:"numeric", month:"short",
    ...(isThisYear ? {} : { year:"numeric" }),
  });
  return `${dateStr} · ${timeStr}`;
}

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
function AshokChakra({ size = 44, duration = "10s" }) {
  const n     = 24;
  const cx    = 50, cy = 50;
  const toRad = d => (d * Math.PI) / 180;
  const navy  = "#003580"; // exact Indian-flag chakra navy

  // Geometry (SVG viewBox 100×100)
  const rimOuter  = 46;
  const rimInner  = 37;
  const hubR      = 7;
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

  const border    = 3.5;           // tricolor ring thickness in px
  const innerSize = size - border * 2; // SVG fits inside the white disc

  return (
    // ── Outer ring: Indian tricolor conic gradient ──────────────────────────
    // Saffron(0°) → White(120°) → Green(240°) → Saffron(360°) — smoothly
    // connected. Rotating this div makes the colours appear to flow around.
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "conic-gradient(from 0deg, #FF9933 0deg, #FFFFFF 120deg, #138808 240deg, #FF9933 360deg)",
      padding: border,
      boxShadow: "0 0 16px rgba(255,153,51,0.6), 0 0 32px rgba(19,136,8,0.3), 0 2px 8px rgba(0,0,0,0.25)",
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
            fill="none" stroke={navy} strokeWidth="7" />
          {/* Inner rim line */}
          <circle cx={cx} cy={cy} r={rimInner}
            fill="none" stroke={navy} strokeWidth="1.8" />
          {/* Solid hub */}
          <circle cx={cx} cy={cy} r={hubR} fill={navy} />
          {/* 24 spokes */}
          {spokes.map((s, i) => (
            <line key={i}
              x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke={navy} strokeWidth="2.4" strokeLinecap="round"
            />
          ))}
          {/* 24 lens-shaped arrowheads between spokes */}
          {leaves.map((l, i) => (
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

function TypingIndicator({ dark, status, lang, steps }) {
  const th = THEME[dark ? "dark" : "light"];
  const shimmerBg = dark
    ? "linear-gradient(90deg, #2c2c2e 25%, #3a3a3c 50%, #2c2c2e 75%)"
    : "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)";
  const shimmerBase = {
    backgroundSize: "300% 100%",
    animation: "shimmer 1.6s ease-in-out infinite",
    borderRadius: 6,
  };
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
      <div style={{
        background: th.card,
        border:`1.5px solid ${th.border2}`,
        borderRadius:"18px 18px 18px 4px",
        padding:"14px 18px",
        boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
        display:"flex", flexDirection:"column", gap:9,
        minWidth:160,
      }}>
        {status && (
          <div style={{ fontSize:11.5, fontWeight:600, color:th.textMid, fontFamily:fontFamily(lang), animation:"fade-in 0.25s ease-out", maxWidth:230 }}>
            {status}
          </div>
        )}
        {steps?.length > 0 && <div style={{ maxWidth:260 }}><AgentSteps steps={steps} dark={dark} lang={lang} /></div>}
        <div style={{ height:11, width:"72%", background:shimmerBg, ...shimmerBase }} />
        <div style={{ height:11, width:"45%", background:shimmerBg, ...shimmerBase,
          animationDelay:"0.2s" }} />
      </div>
    </div>
  );
}

// ─── READING TIME BAR ─────────────────────────────────────────────────────────
// Replaces the normal input UI while cooldown is active
function ReadingTimeBar({ secondsLeft, totalSeconds, dark, lang, onSkip }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  // pct goes from 100 → 0 as secondsLeft decreases
  const pct = (secondsLeft / totalSeconds) * 100;

  // Colour shifts orange → green as it nears completion
  const r  = Math.round(255 * (pct / 100));
  const g  = Math.round(200 * (1 - pct / 100)) + 55;
  const barColor = `rgb(${r},${g},51)`;

  const label = isHindi
    ? `📖 जवाब पढ़ें — ${secondsLeft}s बाद टाइप कर सकते हैं`
    : `📖 Read the answer — you can type in ${secondsLeft}s`;

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
        ) : dark ? (
          <a key={`l-${lineIdx}-${match.index}`} href={href} target="_blank" rel="noopener noreferrer"
            style={{
              display:"inline-flex", alignItems:"center", gap:3,
              background:"rgba(100,160,255,0.15)",
              border:"1px solid rgba(100,160,255,0.35)",
              borderRadius:5, padding:"1px 7px",
              color:"#7bb8ff", textDecoration:"none",
              fontWeight:600, fontSize:"0.88em",
              wordBreak:"break-all", verticalAlign:"middle", lineHeight:1.5,
            }}>
            {raw}
            <span style={{ fontSize:9, opacity:0.7, flexShrink:0 }}>↗</span>
          </a>
        ) : (
          <a key={`l-${lineIdx}-${match.index}`} href={href} target="_blank" rel="noopener noreferrer"
            style={{
              display:"inline-flex", alignItems:"center", gap:3,
              background:"rgba(0,53,128,0.08)",
              border:"1px solid rgba(0,53,128,0.22)",
              borderRadius:5, padding:"1px 7px",
              color:"#003580", textDecoration:"none",
              fontWeight:600, fontSize:"0.88em",
              wordBreak:"break-all", verticalAlign:"middle", lineHeight:1.5,
            }}>
            {raw}
            <span style={{ fontSize:9, opacity:0.55, flexShrink:0 }}>↗</span>
          </a>
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
            background: isUser ? "rgba(255,255,255,0.22)" : "linear-gradient(135deg,#FF9933 0%,#F97316 100%)",
            color:"#fff",
            boxShadow: isUser ? "none" : "0 1px 3px rgba(234,88,12,0.35)",
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
      result.push(<div key={`line-${li}`} style={{ height:5 }} />);
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

function shareText(text, title) {
  const body = `${text}\n\n— Yojana Sahay · https://yojanasahay.vercel.app`;
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

function AnswerActions({ msg, schemes, lang, dark, trackedApps, onChecklist, onOpenChecker, onOpenDetail }) {
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
        onClick={() => { shareText(plainText(msg.content), "Yojana Sahay"); track("share_result", { k: "ai" }); }} />
      {onOpenChecker && !opens.some(o => o.screen === "eligibility_checker") && (
        <ActionPill dark={dark} icon="🧮" label={isHindi ? "पात्रता दोबारा जांचें" : "Re-check eligibility"} onClick={onOpenChecker} />
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
    shareText(text, "Documents checklist");
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

function ChatBubble({ msg, lang, dark, isNew, live = false, onOpenDetail, eligibleIds, trackedApps, onChecklist, onOpenChecker }) {
  const th     = THEME[dark ? "dark" : "light"];
  const bf     = fontFamily(lang);
  const isUser = msg.role === "user";

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

  // ── Feature 1 + 6: Gradient border + Glassmorphism on AI bubbles ─────────
  const glassCard = dark
    ? "rgba(28,28,30,0.68)"
    : "rgba(255,255,255,0.68)";
  const aiBubbleStyle = !isUser ? {
    border: "1.5px solid transparent",
    background: `linear-gradient(${glassCard}, ${glassCard}) padding-box,
                 linear-gradient(135deg, #FF9933 0%, #6366f1 50%, #003580 100%) border-box`,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: dark
      ? "0 4px 20px rgba(255,153,51,0.14), 0 1px 8px rgba(0,0,0,0.45)"
      : "0 4px 20px rgba(255,153,51,0.11), 0 1px 8px rgba(0,0,0,0.09)",
  } : {};

  const userGlass = dark ? "rgba(30,58,138,0.65)" : "rgba(219,234,254,0.82)";
  const userBubbleStyle = isUser ? {
    border: "1.5px solid transparent",
    background: `linear-gradient(${userGlass}, ${userGlass}) padding-box,
                 linear-gradient(135deg,#FF9933 0%,#6366f1 50%,#003580 100%) border-box`,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: dark
      ? "0 4px 20px rgba(255,153,51,0.18), 0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)"
      : "0 4px 16px rgba(255,153,51,0.15), 0 2px 6px rgba(0,53,128,0.13), inset 0 1px 0 rgba(255,255,255,0.65)",
  } : {};

  // ── Formatted timestamp — null when no ts stored (legacy msgs) ────────────
  const timeLabel = formatMsgTime(msg.timestamp, lang);

  return (
    <div style={{ marginBottom:14 }}>
      {/* ── Bubble row (avatar + bubble) ─────────────────────────────────── */}
      <div className={isUser ? "ai-msg-bubble-user" : (msg.streamed && isNew ? "" : "ai-msg-bubble-ai")}
        style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", alignItems:"flex-end", gap:6 }}>
        {!isUser && (
          <div style={{
            width:28, height:28, borderRadius:"50%", flexShrink:0,
            overflow:"hidden",
          }}>
            <img src={aiAvatar} alt="AI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        )}
        <div style={{
          maxWidth:"88%",
          background: isUser ? undefined : th.card,
          color: isUser ? (dark ? "#dde8ff" : "#1e3a8a") : th.text,
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding:"11px 15px", fontSize:13.5, lineHeight:1.65, fontFamily:bf,
          whiteSpace:"pre-wrap", wordBreak:"break-word",
          transition:"box-shadow 0.3s",
          ...aiBubbleStyle,
          ...userBubbleStyle,
        }}>
          {/* ── Feature 5: AI bubble sender header ───────────────────────── */}
          {!isUser && (
            <div style={{
              display:"flex", alignItems:"center", gap:5, marginBottom:7,
              animation: msg.streamed && isNew ? "none" : "header-fade 0.22s ease-out",
            }}>
              <span style={{
                fontSize:9.5, fontWeight:800, letterSpacing:0.55,
                textTransform:"uppercase",
                color: dark ? "rgba(255,153,51,0.9)" : "#FF8000",
                fontFamily:"'Noto Sans',sans-serif",
              }}>
                Yojana Sahay AI
              </span>
              {/* Verified checkmark badge */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                width:14, height:14, borderRadius:"50%",
                background:"#22c55e",
                flexShrink:0,
              }}>
                <span style={{ fontSize:8, color:"#fff", fontWeight:900, lineHeight:1 }}>✓</span>
              </div>
            </div>
          )}

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
          {!isUser && isDone && !live && (
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
      {isDone && !live && !isUser && (schemes.length > 0 || msg.actions?.length > 0 || msg.ui) && (
        <AnswerActions msg={msg} schemes={schemes} lang={lang} dark={dark} trackedApps={trackedApps} onChecklist={onChecklist} onOpenChecker={isNew || msg.ui?.open?.length ? onOpenChecker : null} onOpenDetail={onOpenDetail} />
      )}

      {/* ── Timestamp row — below bubble, matches side alignment ─────────── */}
      {timeLabel && !live && (
        <div style={{
          display:"flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          paddingLeft: isUser ? 0 : 36,   // align with bubble (avatar 28px + gap 6px + 2px)
          paddingRight: isUser ? 2 : 0,
          marginTop: 4,
          animation: "fade-in 0.4s ease-out",
        }}>
          <span style={{
            fontSize: 9.5,
            fontFamily: "'Noto Sans', sans-serif",
            color: dark ? "rgba(160,160,170,0.6)" : "rgba(100,100,120,0.52)",
            fontWeight: 500,
            letterSpacing: 0.15,
            userSelect: "none",
            // Subtle frosted pill so it sits cleanly on any bg
            background: dark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
            borderRadius: 10,
            padding: "2px 7px",
            // Tiny left/right border accent matching the bubble's gradient edges
            borderLeft: isUser ? "none" : `1.5px solid rgba(255,153,51,0.22)`,
            borderRight: isUser ? `1.5px solid rgba(0,53,128,0.18)` : "none",
          }}>
            {timeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Occupation & field label maps (used by WelcomeScreen + handleSend) ─────
const OCC_EN  = { farmer:"Farmer",student:"Student",women:"Homemaker",senior:"Senior Citizen",business:"Business Owner",general:"General Citizen" };
const OCC_HI  = { farmer:"किसान",student:"छात्र",women:"गृहिणी",senior:"वरिष्ठ नागरिक",business:"व्यापारी",general:"नागरिक" };
const INC_MAP = { below1:"below ₹1 Lakh/yr","1to3":"₹1–3 Lakh/yr","3to6":"₹3–6 Lakh/yr",above6:"above ₹6 Lakh/yr" };
const AGE_MAP = { below18:"below 18 yrs","18to35":"18–35 yrs","35to60":"35–60 yrs",above60:"above 60 yrs" };
const AREA_MAP= { rural:"rural/village",urban:"urban/city",semi:"semi-urban town" };

function WelcomeScreen({ lang, dark, onSuggest, profile }) {
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

      {/* Suggested chips label */}
      <div style={{ fontSize:10, fontWeight:700, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase", marginBottom:10, paddingLeft:40, fontFamily:bf }}>
        {isHindi ? "यह पूछें" : "Try asking"}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, paddingLeft:40 }}>
        {SUGGESTED[lang].map((s, i) => (
          <div key={i} className="ai-suggested" onClick={() => onSuggest(s.text)}
            style={{
              background:th.card, border:`1.5px solid ${th.border2}`, borderRadius:13,
              padding:"10px 14px", fontSize:13, fontFamily:bf, color:th.text,
              cursor:"pointer", display:"flex", alignItems:"center", gap:9,
              boxShadow: dark ? "0 1px 5px rgba(0,0,0,0.2)" : "0 1px 5px rgba(0,0,0,0.05)",
              transition:"opacity 0.15s, transform 0.15s",
            }}>
            <span style={{ fontSize:16 }}>{s.icon}</span>
            <span>{s.text}</span>
            <span style={{ marginLeft:"auto", color:th.textSub, fontSize:14 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AIChat({ lang="en", dark=false, profile=null, uid=null, matchedSchemes=[], onOpenDetail=null, eligAnswers=null, onOpenChecker=null }) {
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
  const liveTextRef    = useRef("");
  const liveFrameRef   = useRef(0);
  const abortRef       = useRef(null);
  const eligibleIds    = useMemo(() => new Set((matchedSchemes || []).map(s => s?.id).filter(Boolean)), [matchedSchemes]);

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
  const isCoolingDown = secondsLeft > 0;
  useEffect(() => {
    const box = scrollBoxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, loading, chips, isCoolingDown]);
  // While an answer streams in, follow it — unless the user scrolled up to read.
  useEffect(() => {
    if (!live?.text) return;
    const box = scrollBoxRef.current;
    if (!box) return;
    if (box.scrollHeight - box.scrollTop - box.clientHeight < 140) box.scrollTop = box.scrollHeight;
  }, [live?.text]);

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

  // ── Start reading-time cooldown ──────────────────────────────────────────────
  const startCooldown = useCallback((replyText, incomingChips, alreadyReadSecs = 0) => {
    clearInterval(cooldownRef.current);
    // A streamed answer was being read while it arrived — count that time.
    const secs = Math.max(alreadyReadSecs ? 4 : 10, calcReadingTime(replyText) - Math.round(alreadyReadSecs));
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    pendingChipsRef.current = incomingChips;  // FIX Bug 4: ref instead of state
    setChips([]);                             // hide any previous chips immediately

    cooldownRef.current = setInterval(() => {
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
    setLive({ text:"", status:"" });
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
            { role:"user", content:`[Profile context for personalization — Name: "${profile.name}", Gender: "${profile.gender==="female"?"Female":profile.gender==="male"?"Male":profile.gender==="other"?"Other":"not specified"}", State: "${profile.state}", Occupation: "${(OCC_EN[profile.occupation]||profile.occupation)}", Age group: "${(AGE_MAP[profile.age]||profile.age)}", Income: "${(INC_MAP[profile.income]||profile.income)}", Area: "${(AREA_MAP[profile.area]||profile.area)}", Housing: "${profile.house==="yes"?"owns a pucca house":"needs housing assistance"}", Ration card: "${profile.ration==="bpl"?"BPL (Below Poverty Line)":profile.ration==="aay"?"AAY/Antyodaya (Poorest of Poor)":profile.ration==="apl"?"APL (Above Poverty Line)":"No ration card"}", Social category: "${({general:"General",obc:"OBC",sc:"SC (Scheduled Caste)",st:"ST (Scheduled Tribe)",ews:"EWS"})[profile.caste]||"General"}",${Array.isArray(profile.groups)&&profile.groups.filter(g=>g!=="none").length?` Special groups: "${profile.groups.filter(g=>g!=="none").join(", ")}",`:``} Disability: "${profile.disability&&profile.disability!=="none"?`Yes — ${profile.disability}`:"None"}", Marital status: "${profile.marital||"not specified"}"${profile.numChildren?`, Children: "${profile.numChildren==="0"?"None":profile.numChildren}", Girl children: "${profile.hasGirls==="yes"?"Yes":"No"}"`:``}${profile.landHolding?`, Land holding: "${profile.landHolding}", Kisan Credit Card: "${profile.kisanCard==="yes"?"Yes — has KCC":"No KCC"}"`:``}${profile.educationLevel?`, Education level: "${profile.educationLevel}", Institution type: "${profile.institutionType||"not specified"}"`:``}. Address rule — derive title from profile: Male→"Mr. [FirstName]", Female+married→"Mrs. [FirstName]", Female+other→"Ms. [FirstName]", Other/unspecified→"[FirstName]", Hindi→"[FirstName] जी". Use the address when: (1) first reply in the conversation, (2) opening a personalized recommendation, (3) delivering important news like eligibility confirmed/denied or a key action. Max once per response. Do NOT use in every message — that feels robotic. ALL fields above are already known — NEVER ask the user about income, occupation, housing, state, area, age, disability, marital status, children, land, ration card, or education. Go straight to scheme recommendations using this profile. Do not mention this context block to the user.]` },
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
          matched: matchedSchemes,
          // Their tracked applications ("I've applied").
          applications: Object.entries(trackedApps || {}).map(([id, a]) => {
            const sc = SCHEME_BY_ID_CHAT.get(id);
            return sc ? { name: sc.name?.[lang] || sc.name?.en, appliedAt: a.appliedAt, ref: a.ref, status: a.status, daysWaiting: daysSince(a.appliedAt) } : null;
          }).filter(Boolean),
          // Previous answer — lets "documents for the first one?" find the scheme.
          lastReply: [...messages].reverse().find(m => m.role === "assistant")?.content || "",
          // Their eligibility answers → the AI can say exactly why a scheme
          // is or isn't for them, and what's missing.
          answers: eligAnswers,
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
          onStatus: (kind, q) => {
            if (kind === "search") setLive(l => l && { ...l, status: isHindi ? "🔍 वेब पर ताज़ा जानकारी खोज रहे हैं…" : `🔍 Checking the web for the latest${q ? `: “${q.slice(0, 60)}”` : "…"}` });
          },
        },
      );
      if (ctrl && abortRef.current !== ctrl) return; // chat was cleared meanwhile
      cancelAnimationFrame(liveFrameRef.current); liveFrameRef.current = 0;
      const hasUi = ui && (ui.checklist || ui.open?.length || ui.tracked?.length);
      setMessages(prev => [...prev, {
        role:"assistant", content:reply, timestamp: Date.now(), streamed: true,
        ...(actions?.length ? { actions } : {}),
        ...(steps?.length ? { steps } : {}),
        ...(hasUi ? { ui } : {}),
      }]);
      setLive(null);
      playReceiveSound(); // 🔊 receive chime
      const freshChips = aiChips.filter(c => !nextUsedChips.has(c));
      startCooldown(reply, freshChips, firstTextAt ? (Date.now() - firstTextAt) / 1000 : 0);
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
  }, [input, messages, loading, isHindi, lang, usedChips, startCooldown, profile, matchedSchemes, trackedApps, eligAnswers]);

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

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(135deg,rgba(255,153,51,0.82) 0%,rgba(255,128,0,0.78) 35%,rgba(0,53,128,0.85) 100%)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        padding:"18px 20px 22px", flexShrink:0,
        boxShadow:"0 4px 24px rgba(0,53,128,0.22)",
        borderBottom:"1px solid rgba(255,255,255,0.12)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          <div
            onClick={() => setAvatarPreview(true)}
            style={{
              width:46, height:46, borderRadius:14, flexShrink:0,
              overflow:"hidden",
              border:"1.5px solid rgba(255,255,255,0.35)",
              boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
              cursor:"pointer",
              transition:"transform 0.15s, box-shadow 0.15s",
            }}
            onPointerDown={e => e.currentTarget.style.transform="scale(0.93)"}
            onPointerUp={e => e.currentTarget.style.transform="scale(1)"}
            onPointerLeave={e => e.currentTarget.style.transform="scale(1)"}
          >
            <img src={aiAvatar} alt="AI" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800, lineHeight:1.2 }}>
              {isHindi ? "AI सहायक" : "AI Assistant"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11, marginTop:3 }}>
              🟢 {isHindi ? "ऑनलाइन · हिंदी / English" : "Online · Hindi / English"}
            </div>
            {profile && (
              <div style={{
                display:"inline-flex", alignItems:"center", gap:5, marginTop:5,
                background:"rgba(255,255,255,0.16)", border:"1px solid rgba(255,255,255,0.28)",
                borderRadius:20, padding:"3px 10px 3px 7px",
                animation:"badge-pop 0.35s ease-out",
              }}>
                <span style={{ fontSize:10 }}>🎯</span>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.95)", fontFamily:bf }}>
                  {isHindi
                    ? `${profile.name.split(" ")[0]} के लिए पर्सनल`
                    : `Personalized for ${profile.name.split(" ")[0]}`}
                </span>
              </div>
            )}
          </div>
          {/* Ashok Chakra — between title and Clear button */}
          <AshokChakra size={44} duration="10s" />
          {messages.length > 0 && (
            <div onClick={() => {
                try { abortRef.current?.abort(); } catch {}
                abortRef.current = null;
                cancelAnimationFrame(liveFrameRef.current); liveFrameRef.current = 0;
                setLive(null); setLoading(false);
                if (canSpeak()) stopSpeaking();
                setMessages([]); setError(""); setChips([]);
                pendingChipsRef.current = [];              // FIX Bug 4
                setUsedChips(new Set()); setSecondsLeft(0);
                clearInterval(cooldownRef.current);
                clearTimeout(justUnlockedTimerRef.current); // FIX Bug 3
                try { localStorage.removeItem(chatKey); } catch {}
              }}
              style={{
                background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)",
                borderRadius:10, padding:"5px 11px",
                color:"rgba(255,255,255,0.9)", fontSize:11, fontWeight:600, cursor:"pointer",
              }}>
              {isHindi ? "साफ करें" : "Clear"}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div ref={scrollBoxRef} data-keep-nav="" style={{ flex:1, overflowY:"auto", overscrollBehavior:"contain", padding:"18px 10px 6px", WebkitOverflowScrolling:"touch" }}>
        {messages.length === 0 && !loading && (
          <WelcomeScreen lang={lang} dark={dark} onSuggest={handleSend} profile={profile} />
        )}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            lang={lang}
            dark={dark}
            isNew={msg.role === "assistant" && i === messages.length - 1}
            onOpenDetail={onOpenDetail}
            eligibleIds={eligibleIds}
            trackedApps={trackedApps}
            onChecklist={setChecklist}
            onOpenChecker={onOpenChecker}
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

        {loading && !live?.text && <TypingIndicator dark={dark} lang={lang} status={live?.status} steps={live?.steps} />}
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

      {/* BOTTOM BAR — swaps between reading-time and normal input */}
      {isLocked ? (
        <ReadingTimeBar
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          dark={dark}
          lang={lang}
          onSkip={() => { clearInterval(cooldownRef.current); setSecondsLeft(0); }}
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
