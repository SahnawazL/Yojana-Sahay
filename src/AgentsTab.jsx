/**
 * AgentsTab.jsx — YojanaSahay Admin · Agent Presence Monitor
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Features:
 *  - Live online/offline presence for human sub-admins (Firestore heartbeat)
 *  - AI agent status from adminMeta/aiStatus
 *  - NIC-style scrolling activity ticker
 *  - Government notice board with auto-cycling highlights + "NEW" badges
 *  - Session duration, active tab, device type, allowed tabs
 *  - Timeline activity log (day-browsable, own per-day query — not capped at 30 all-time)
 *
 * Firestore collections used:
 *  - adminPresence/{uid}        — human admin heartbeat docs
 *  - adminMeta/aiStatus         — { groqLastActive, tavilyLastActive } timestamps
 *  - adminActivity              — { agentId, agentName, action, tab, type, time }
 *  - agentTimeLogs/{uid}_{date} — daily worked-seconds per agent, for attendance/salary
 *
 * Exports:
 *  - default AgentsTab          (render in AdminDashboard for activeSection==="agents")
 *  - useAgentPresence(...)      (call inside AdminDashboard to write your own heartbeat)
 *  - useDailyTimeTracking(...)  (call inside AdminDashboard to log daily active time)
 *  - logAdminActivity(...)      (call anywhere to record an action to the feed)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  collection, doc, setDoc, getDoc, getDocs, onSnapshot,
  query, where, orderBy, limit, serverTimestamp, addDoc, increment,
  writeBatch, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase.js";

// ─── THEME (mirrors AdminDashboard) ──────────────────────────────────────────
const THEME = {
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e",
  },
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#fff",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";
const VIOLET     = "#8B5CF6";
const CYAN       = "#06B6D4";
const IDLE_AMBER = "#F59E0B";   // three-state presence: idle = amber

// ─── TAB LABELS ───────────────────────────────────────────────────────────────
const TAB_LABELS = {
  home:"Home", overview:"Overview", users:"Users",
  analytics:"Analytics", activity:"Activity", usage:"Usage",
  schemes:"Schemes", reports:"Reports", cleanup:"Cleanup",
  verify:"Verify", export:"Export", agents:"Agents",
  aichat:"AI Chat",
};

// ─── ACTIVITY TYPE → COLOR ────────────────────────────────────────────────────
const ACT_COLORS = {
  verify:  IND_GREEN,
  resolve: SAFFRON,
  cleanup: "#EC4899",
  view:    "#4285F4",
  ai:      VIOLET,
  login:   IND_GREEN,
  logout:  "#888",
  export:  "#F59E0B",
  reply:   CYAN,
  update:  "#F97316",
};

// ─── AGENT IDENTITY PALETTE ───────────────────────────────────────────────────
// Curated, not random hue-from-hash — reuses the same accent colors already
// used for activity types elsewhere in this file, so an agent's avatar tint
// always reads as "one of ours" rather than an arbitrary rainbow.
const AVATAR_PALETTE = [SAFFRON, NAVY, IND_GREEN, VIOLET, CYAN, "#EC4899", "#F97316", "#3B82F6"];

// ─── ICONS (inline SVG, stroke-based, inherits color via currentColor) ───────
function IconUsers({ size = 14, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="7" r="3.5" stroke={color} strokeWidth="1.8"/>
      <path d="M19.5 21v-2a3.5 3.5 0 0 0-2.4-3.3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M15 4.1a3.5 3.5 0 0 1 0 6.8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconPulse({ size = 14, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 12h4l2-7 4 14 2-9 2 2h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconUserCheck({ size = 14, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="9" cy="7.5" r="3.5" stroke={color} strokeWidth="1.8"/>
      <path d="M2.5 21v-1.5A4.5 4.5 0 0 1 7 15h4a4.5 4.5 0 0 1 4.5 4.5V21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 11.5l1.7 1.7L21 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCpu({ size = 14, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="6" y="6" width="12" height="12" rx="2" stroke={color} strokeWidth="1.8"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke={color} strokeWidth="1.8"/>
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconRadio({ size = 12, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.8"/>
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconMegaphone({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M16 8.5a4 4 0 0 1 0 7M19.5 5.5a8 8 0 0 1 0 13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconClockHistory({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <path d="M12 7v5l3.5 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconInfo({ size = 11, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <path d="M12 11v5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="7.7" r="0.9" fill={color}/>
    </svg>
  );
}
function IconAlert({ size = 11, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.9" fill={color}/>
    </svg>
  );
}
function IconChevronLeft({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconChevronRight({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M9 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconSmartphone({ size = 10, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" stroke={color} strokeWidth="1.8"/>
      <path d="M11 18.5h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconMonitor({ size = 10, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" stroke={color} strokeWidth="1.8"/>
      <path d="M8.5 21h7M12 17v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconRadar({ size = 14, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.6"/>
      <path d="M12 12L12 4.5A7.5 7.5 0 0 1 19.5 12Z" fill={color} opacity="0.35"/>
      <circle cx="12" cy="12" r="1.4" fill={color}/>
    </svg>
  );
}
function IconTrash({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconCheck({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconX({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M5 5l14 14M19 5L5 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconDownload({ size = 13, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Skeleton — shimmering loading placeholder
// Used wherever an empty Firestore listener result is ambiguous ("zero docs"
// vs "haven't heard back yet"), so the first paint doesn't flash a false
// "No agents yet" / "No notices" before the real snapshot arrives.
// ═════════════════════════════════════════════════════════════════════════════
function Skeleton({ width = "100%", height = 12, radius = 4, dark, style }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: dark
        ? "linear-gradient(90deg, #232325 25%, #2e2e31 37%, #232325 63%)"
        : "linear-gradient(90deg, #ececec 25%, #f6f6f6 37%, #ececec 63%)",
      backgroundSize: "400% 100%",
      animation: "agnt-shimmer 1.4s ease-in-out infinite",
      ...style,
    }}/>
  );
}

// ─── STATIC AI AGENTS ─────────────────────────────────────────────────────────
// Human admins are tracked dynamically via Firestore. AI agents are defined here.
const AI_AGENTS = [
  {
    id:          "groq-ai",
    name:        "Groq AI",
    role:        "YojanaSahay AI Chat",
    type:        "ai",
    allowedTabs: ["aichat"],
    model:       "llama-3.3-70b-versatile",
    firestoreKey:"groqLastActive",
    sessionStart: null,
  },
  {
    id:          "tavily-api",
    name:        "Tavily Extract",
    role:        "YojanaSahay AI Chat · Search",
    type:        "ai",
    allowedTabs: ["aichat"],
    model:       "tavily-extract-v2",
    firestoreKey:"tavilyLastActive",
    sessionStart: null,
  },
  {
    id:          "groq-verify",
    name:        "Groq Verify",
    role:        "SchemeVerifier · AI Insights",
    type:        "ai",
    allowedTabs: ["verify"],
    model:       "8b-instant + 70b-versatile",
    firestoreKey:"groqVerifyLastActive",
    sessionStart: null,
  },
  {
    id:          "tavily-verify",
    name:        "Tavily Verify",
    role:        "SchemeVerifier · Page Extractor",
    type:        "ai",
    allowedTabs: ["verify"],
    model:       "tavily-extract-v2",
    firestoreKey:"tavilyVerifyLastActive",
    sessionStart: null,
  },
];

// Which AI_AGENTS ids belong to which agent-grid section. Two separate Groq
// pools (different keys, different Firestore fields) means two separate
// sections — otherwise it's easy to misread one pool's health as the other's.
const CHAT_AI_IDS   = new Set(["groq-ai", "tavily-api"]);       // main app — chat.js, GROQ_API_KEY_1..5
const VERIFY_AI_IDS = new Set(["groq-verify", "tavily-verify"]); // admin SchemeVerifier — GROQ_VERIFY_KEY*

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

function timeAgo(ts) {
  const d = toDate(ts);
  if (!d) return "—";
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sessionDuration(start, end) {
  const s = toDate(start);
  if (!s) return "—";
  const e = end ? (toDate(end) || new Date()) : new Date();
  const totalSec = Math.max(0, Math.floor((e - s) / 1000));
  const h   = Math.floor(totalSec / 3600);
  const m   = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

// Renders a live, self-ticking session duration without forcing the whole
// AgentsTab to re-render every second (that tab already re-renders on its
// own 30s presence tick — piggybacking a 1s tick onto it would re-run every
// listener/effect up the tree). This component owns its own 1s interval and
// only re-renders itself, so per-second precision stays cheap even with
// several online agents on screen at once.
function LiveSessionDuration({ start }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return sessionDuration(start, null);
}

// ─── PRESENCE TIMING CONSTANTS ────────────────────────────────────────────────
// Single source of truth for the thresholds documented below, and for the
// re-render cadence used by both the live-tick effect and the heartbeat writer.
const PRESENCE_TICK_MS  = 30000; // re-render cadence: keeps "Xm ago" / online-state fresh
const HUMAN_ONLINE_MINS = 2;
const HUMAN_IDLE_MINS   = 5;
const AI_ONLINE_MINS    = 15;

function isOnline(lastSeen, thresholdMins = HUMAN_ONLINE_MINS) {
  const d = toDate(lastSeen);
  if (!d) return false;
  return (Date.now() - d.getTime()) < thresholdMins * 60 * 1000;
}

// Three-state presence: "online" | "idle" | "offline"
// Human : online = <HUMAN_ONLINE_MINS · idle = HUMAN_ONLINE_MINS–HUMAN_IDLE_MINS · offline = beyond
// AI    : online = <AI_ONLINE_MINS    · offline = beyond
function getPresenceState(lastSeen, type = "human") {
  const d = toDate(lastSeen);
  if (!d) return "offline";
  const minsAgo = (Date.now() - d.getTime()) / 60000;
  if (type === "ai") return minsAgo < AI_ONLINE_MINS ? "online" : "offline";
  if (minsAgo < HUMAN_ONLINE_MINS) return "online";
  if (minsAgo < HUMAN_IDLE_MINS)   return "idle";
  return "offline";
}

// ─── DESKTOP TYPE SCALE ───────────────────────────────────────────────────────
// Mobile font sizes were tuned for a ~375px viewport; on a desktop monitor the
// same px values read as cramped. fs() nudges sizes up ~12% on desktop only,
// rounded to the nearest 0.5px so the existing fractional scale (9.5, 11.5...)
// stays tidy. Pass the mobile-first size as authored everywhere else in the file.
function fs(px, isDesktop) {
  return isDesktop ? Math.round(px * 1.125 * 2) / 2 : px;
}

// ─── ANOMALY DETECTION ────────────────────────────────────────────────────────
const ANOMALY_AI_SILENT_MINS = 120;        // AI silent for 2h+ → red flag
const ANOMALY_OVERTIME_S     = 10 * 3600; // human >10h today  → amber flag
const ANOMALY_UNDER_S        =  1 * 3600; // human <1h today (if logged in) → amber flag

// Returns { label, detail, color } or null
function getAnomalyFlag(agent, todayLog) {
  if (agent.type === "ai") {
    const d = toDate(agent.lastSeen);
    if (!d) return null; // never pinged — not an anomaly, just unconfigured
    const minsAgo = (Date.now() - d.getTime()) / 60000;
    if (minsAgo > ANOMALY_AI_SILENT_MINS)
      return { label: "Silent 2h+", detail: `No ping for ${Math.floor(minsAgo / 60)}h ${Math.floor(minsAgo % 60)}m`, color: "#EF4444" };
    return null;
  }
  // Human — only flag if there is a log entry today
  if (!todayLog?.firstActive) return null;
  const secs = todayLog.secondsActive || 0;
  if (secs > ANOMALY_OVERTIME_S)
    return { label: "Overtime", detail: `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m logged today`, color: "#F59E0B" };
  if (secs < ANOMALY_UNDER_S)
    return { label: "Under 1h", detail: `Only ${Math.floor(secs / 60)}m logged today`, color: "#F59E0B" };
  return null;
}

function isNew(ts, thresholdMins = 5) {
  const d = toDate(ts);
  if (!d) return false;
  return (Date.now() - d.getTime()) < thresholdMins * 60 * 1000;
}

// ─── A11Y: keyboard activation for div-as-button elements ────────────────────
// Spreads role="button" + tabIndex + onKeyDown(Enter/Space) so plain <div onClick>
// elements are reachable and operable via keyboard, not just mouse/touch.
function activatable(onActivate, label) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}

// ─── Stable identity key for an agent (human doc id === uid; AI uses its id) ──
function agentKey(ag) {
  return ag.uid || ag.id;
}

// ─── Deterministic avatar color — same agent always gets the same palette
// slot (keyed on uid/id, falling back to name), so the roster reads as a set
// of distinct identities at a glance instead of identical gray squares. ──────
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // force 32-bit int
  }
  return Math.abs(h);
}
function avatarColorFor(agent) {
  const key = agentKey(agent) || agent.name || "?";
  return AVATAR_PALETTE[hashStr(String(key)) % AVATAR_PALETTE.length];
}

// ─── ALERT CHIME — two-tone beep via Web Audio API, no external asset ────────
let _alertAudioCtx = null;
function playAlertChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!_alertAudioCtx) _alertAudioCtx = new Ctx();
    const ctx = _alertAudioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    [880, 660].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = now + i * 0.14;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.13);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.14);
    });
  } catch (e) {
    // Audio unavailable (autoplay policy / unsupported) — fail silently
  }
}

// ─── EXPORTED: LOG ACTIVITY ───────────────────────────────────────────────────
// Call this from AdminDashboard wherever a notable action happens.
// e.g. await logAdminActivity(uid, "Sahnawaz", "Resolved report #R-042", "reports", "resolve")
export async function logAdminActivity(agentId, agentName, action, tab, type = "view") {
  try {
    await addDoc(collection(db, "adminActivity"), {
      agentId,
      agentName: agentName || "Admin",
      action,
      tab: tab || "unknown",
      type,
      time: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[AgentsTab] logAdminActivity failed:", e);
  }
}

// ─── EXPORTED: PRESENCE HOOK ─────────────────────────────────────────────────
// Add this to AdminDashboard:
//   import AgentsTab, { useAgentPresence } from "./AgentsTab.jsx";
//   // inside AdminDashboard function body (allowedTabs is the existing login-gate prop):
//   useAgentPresence(sessionUser?.uid, sessionUser?.displayName, sessionUser?.email, activeSection, isDesktop, allowedTabs);
export function useAgentPresence(uid, name, email, activeTab, isDesktop, allowedTabs = null) {
  const mountedRef = useRef(false);
  const intervalRef = useRef(null);
  // Local mirror of this session's start time. serverTimestamp() resolves
  // asynchronously server-side and can't be read back client-side, so we
  // can't use the Firestore `sessionStart` field to compute a duration when
  // the session ends — this ref is what lets the offline write below include
  // an actual lastSessionDuration instead of leaving it unset forever.
  const sessionStartRef = useRef(null);

  const beat = useCallback(async (data = {}) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "adminPresence", uid), {
        uid,
        name:       name  || "Admin",
        email:      email || "",
        type:       "human",
        allowedTabs,                // null = full admin · array = restricted to those tabs
        isOnline:   true,
        lastSeen:   serverTimestamp(),
        activeTab:  activeTab || "home",
        deviceType: isDesktop ? "desktop" : "mobile",
        ...data,
      }, { merge: true });
    } catch (e) {
      console.warn("[useAgentPresence] heartbeat failed:", e);
    }
  }, [uid, name, email, activeTab, isDesktop, allowedTabs]);

  // The setup effect below only re-runs when `uid` changes, so the interval
  // it creates would otherwise close over this one render's `beat` forever —
  // permanently frozen with whatever activeTab/isDesktop/allowedTabs were at
  // mount. Routing every tick through this ref means the periodic heartbeat
  // always calls the *latest* beat, not a stale one from setup time.
  const beatRef = useRef(beat);
  useEffect(() => { beatRef.current = beat; }, [beat]);

  // Mount: write sessionStart, kick off 30s heartbeat
  useEffect(() => {
    if (!uid) return;
    sessionStartRef.current = new Date(); // local clock for this session, see note above
    if (!mountedRef.current) {
      mountedRef.current = true;
      // First write — also sets sessionStart
      setDoc(doc(db, "adminPresence", uid), {
        uid,
        name:        name  || "Admin",
        email:       email || "",
        type:        "human",
        allowedTabs,
        isOnline:    true,
        lastSeen:    serverTimestamp(),
        activeTab:   activeTab || "home",
        deviceType:  isDesktop ? "desktop" : "mobile",
        sessionStart: serverTimestamp(),
      }, { merge: false }).catch(() => {});
    }
    intervalRef.current = setInterval(() => beatRef.current(), PRESENCE_TICK_MS);
    return () => {
      clearInterval(intervalRef.current);
      // Mark offline + record how long this session lasted (best-effort —
      // won't fire on a hard browser close/crash, same as isOnline below).
      setDoc(doc(db, "adminPresence", uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
        lastSessionDuration: sessionDuration(sessionStartRef.current, null),
      }, { merge: true }).catch(() => {});
    };
  }, [uid]); // only on uid change

  // Update activeTab on every tab navigation (fast)
  useEffect(() => {
    beat();
  }, [activeTab]);
}

// ─── DAILY TIME TRACKING (attendance / salary — 8h target per calendar day) ──
// "Active" = dashboard open AND the agent interacted (tap/click/scroll/key)
// within the last IDLE_THRESHOLD_MS. Day boundary is IST (Asia/Kolkata),
// matching where the team is based, regardless of each device's local clock.
const IDLE_THRESHOLD_MS    = 3 * 60 * 1000;   // no interaction in 3 min → not counted
const TICK_MS              = 30 * 1000;       // how often we check + credit time
const MAX_CREDIT_MS        = 90 * 1000;       // cap per tick — guards against laptop
                                               // sleep / backgrounded-tab time jumps
export const DAILY_TARGET_SECONDS = 8 * 60 * 60; // 8h

export function getISTDateStr(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d); // → "YYYY-MM-DD"
}

export function timeLogId(uid, dateStr) {
  return `${uid}_${dateStr}`;
}

// ─── DATA RETENTION (manual cleanup — Activity Log / Attendance history) ─────
// `adminActivity` keys off the `time` Timestamp field; `agentTimeLogs` keys
// off the `date` string field ("YYYY-MM-DD", IST) — lexicographic comparison
// on that format sorts chronologically, so a plain string range query works
// without needing a Timestamp on that collection.
function monthsAgoDate(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

// Best-effort count for the confirmation prompt. getCountFromServer is an
// aggregation query (no document reads billed for the matched docs), so it's
// cheap to call even for large ranges. Returns null on failure so the UI can
// fall back to a count-less confirmation instead of blocking the action.
async function countOlderThan(collectionName, field, cutoffValue) {
  try {
    const q = query(collection(db, collectionName), where(field, "<", cutoffValue));
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (e) {
    console.warn(`[retention] count failed for ${collectionName}:`, e);
    return null;
  }
}

// Deletes in pages of 400 (safely under Firestore's 500-writes-per-batch
// cap) and keeps paging until nothing older than the cutoff remains, so this
// works correctly even for collections with thousands of stale docs instead
// of silently only deleting the first page.
// opts.onBatch, if provided, fires after every committed batch with
// { collectionName, batchIndex, totalBatches, deletedInBatch, totalDeleted } —
// this is what powers the live terminal log + progress bar in the purge modal.
async function deleteOlderThan(collectionName, field, cutoffValue, opts = {}) {
  const { estimatedBatches = null, onBatch } = opts;
  let totalDeleted = 0;
  let batchIndex = 0;
  for (;;) {
    const q = query(
      collection(db, collectionName),
      where(field, "<", cutoffValue),
      orderBy(field, "asc"),
      limit(400),
    );
    const snap = await getDocs(q);
    if (snap.empty) break;
    batchIndex += 1;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    totalDeleted += snap.docs.length;
    onBatch?.({
      collectionName, batchIndex,
      totalBatches: estimatedBatches || batchIndex,
      deletedInBatch: snap.docs.length, totalDeleted,
    });
    if (snap.docs.length < 400) break;
  }
  return totalDeleted;
}

// Call this once in AdminDashboard, alongside useAgentPresence:
//   useDailyTimeTracking(sessionUser?.uid, sessionUser?.displayName || sessionUser?.email, sessionUser?.email);
export function useDailyTimeTracking(uid, name, email) {
  const lastInteractionRef = useRef(Date.now());
  const lastTickRef        = useRef(Date.now());
  const dateStrRef         = useRef(getISTDateStr());

  // Track real interaction — ref only, no re-renders
  useEffect(() => {
    if (!uid) return;
    const mark = () => { lastInteractionRef.current = Date.now(); };
    const events = ["mousemove", "mousedown", "touchstart", "keydown", "scroll", "click"];
    events.forEach(ev => window.addEventListener(ev, mark, { passive: true }));
    mark(); // count the moment they land on the dashboard as activity
    return () => events.forEach(ev => window.removeEventListener(ev, mark));
  }, [uid]);

  // Ensure today's log doc exists once (so firstActive is only ever set once)
  useEffect(() => {
    if (!uid) return;
    const dateStr = getISTDateStr();
    dateStrRef.current = dateStr;
    (async () => {
      try {
        const ref  = doc(db, "agentTimeLogs", timeLogId(uid, dateStr));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid, name: name || "Agent", email: email || "",
            date: dateStr,
            secondsActive: 0,
            firstActive: serverTimestamp(),
            lastActive:  serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn("[useDailyTimeTracking] init failed:", e);
      }
    })();
  }, [uid]);

  // Heartbeat: every TICK_MS, credit elapsed time only if recently active
  useEffect(() => {
    if (!uid) return;
    lastTickRef.current = Date.now();

    const tick = async () => {
      const now       = Date.now();
      const elapsedMs = now - lastTickRef.current;
      lastTickRef.current = now;

      const idle = (now - lastInteractionRef.current) > IDLE_THRESHOLD_MS;
      if (idle) return; // dashboard open but untouched — don't count it

      const creditSec = Math.max(0, Math.round(Math.min(elapsedMs, MAX_CREDIT_MS) / 1000));
      if (creditSec <= 0) return;

      const todayStr = getISTDateStr();
      try {
        // Midnight rollover mid-session — make sure the new day's doc exists first
        if (todayStr !== dateStrRef.current) {
          dateStrRef.current = todayStr;
          const ref  = doc(db, "agentTimeLogs", timeLogId(uid, todayStr));
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              uid, name: name || "Agent", email: email || "",
              date: todayStr, secondsActive: 0,
              firstActive: serverTimestamp(), lastActive: serverTimestamp(),
            });
          }
        }

        await setDoc(doc(db, "agentTimeLogs", timeLogId(uid, todayStr)), {
          uid, name: name || "Agent", email: email || "",
          date: todayStr,
          secondsActive: increment(creditSec),
          lastActive: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.warn("[useDailyTimeTracking] tick failed:", e);
      }
    };

    const t = setInterval(tick, TICK_MS);
    return () => clearInterval(t);
  }, [uid, name, email]);
}

// ═════════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Live Feed — stable, crossfading single-event rotator
// (previously a horizontally-scrolling marquee — replaced because continuous
// scrolling text reads as dated/low-trust; a fixed-position rotator gives the
// same "live, real-time" signal with a calmer, more premium feel.)
// ═════════════════════════════════════════════════════════════════════════════
function ActivityTicker({ activities, todayStr, dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  const [paused, setPaused] = useState(false);
  const [idx,    setIdx]    = useState(0);

  // LIVE FEED should mean "happening today," not just "most recent 30 ever
  // logged." On a quiet day that all-time cap can leave a day-old event
  // pinned here looking like it's still live. Filtering to today's IST date
  // keeps that honest — anything older belongs in Activity Log's
  // day-browsable history instead.
  const todayActivities = useMemo(
    () => activities.filter(a => getISTDateStr(toDate(a.time)) === todayStr),
    [activities, todayStr]
  );

  useEffect(() => {
    if (paused || todayActivities.length <= 1) return;
    const t = setInterval(() => {
      setIdx(i => (i + 1) % todayActivities.length);
    }, 3800);
    return () => clearInterval(t);
  }, [paused, todayActivities.length]);

  // Clamp index if the activities list shrinks (e.g. after a refresh)
  useEffect(() => {
    if (idx >= todayActivities.length) setIdx(0);
  }, [todayActivities.length, idx]);

  const act    = todayActivities[idx];
  const accent = act ? (ACT_COLORS[act.type] || "#aaa") : th.textSub;

  return (
    <div style={{
      position:     "relative",
      border:       `1px solid ${th.border}`,
      borderRadius: 12,
      overflow:     "hidden",
      background:   dark ? "rgba(28,28,30,0.75)" : "rgba(255,255,255,0.8)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      marginBottom: 14,
      boxShadow:    dark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.06)",
    }}>
      {/* top accent — tints to the live event's color, fading off to the right */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${accent}, ${accent}00 85%)`,
        boxShadow: `0 0 8px ${accent}80`,
        transition: "background 0.4s ease",
      }}/>

      {/* Header bar */}
      <div style={{
        padding:    "5px 12px",
        display:    "flex", alignItems: "center", gap: 7,
        borderBottom: `1px solid ${th.border}`,
      }}>
        <IconRadio size={11} color={th.textSub} style={{ flexShrink:0 }} />
        <span style={{
          fontFamily:"monospace", fontSize: fs(9, isDesktop), fontWeight: 800,
          color: th.textMid, letterSpacing: 1.8, textTransform: "uppercase",
        }}>
          LIVE FEED
        </span>
        <div style={{ position:"relative", width:6, height:6, flexShrink:0 }}>
          <div style={{ position:"absolute", inset:-3, borderRadius:"50%", background:`${IND_GREEN}35`, animation:"agnt-pulse 1.6s ease-in-out infinite" }}/>
          <div style={{ width:6, height:6, borderRadius:"50%", background:IND_GREEN, position:"relative" }}/>
        </div>
        <span style={{ marginLeft:"auto", fontSize: fs(9, isDesktop), color: th.textSub, fontFamily:"monospace" }}>
          {act ? `${idx + 1}/${todayActivities.length} · hover to pause` : "today"}
        </span>
      </div>

      {/* Stable single-event display — crossfades on rotation, no horizontal motion */}
      <div
        style={{ position:"relative", height: 38, padding: "0 14px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(p => !p)}
      >
        {act ? (
          <div
            key={act.id ?? idx}
            style={{
              display:"flex", alignItems:"center", gap: 7,
              height: "100%", whiteSpace:"nowrap", overflow:"hidden",
              animation: "agnt-fade-in 0.4s ease both",
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius:"50%", flexShrink: 0,
              background: accent,
              boxShadow: `0 0 6px ${accent}aa`,
            }}/>
            <span style={{ fontWeight: 700, color: th.text, fontSize: fs(12, isDesktop) }}>{act.agentName}</span>
            <span style={{ color: th.textSub }}>·</span>
            <span style={{ color: th.textMid, fontSize: fs(12, isDesktop), overflow:"hidden", textOverflow:"ellipsis" }}>{act.action}</span>
            <span style={{
              padding:"1px 5px", borderRadius: 4, fontSize: fs(8, isDesktop),
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              color: accent,
              fontFamily:"monospace", fontWeight: 700, flexShrink: 0,
            }}>
              {TAB_LABELS[act.tab] || act.tab}
            </span>
            <span style={{ color: th.textSub, fontSize: fs(9, isDesktop), fontFamily:"monospace", marginLeft:"auto", flexShrink: 0 }}>
              {timeAgo(act.time)}
            </span>
          </div>
        ) : (
          <div style={{
            display:"flex", alignItems:"center", height:"100%",
            color: th.textSub, fontSize: fs(11.5, isDesktop),
          }}>
            Quiet so far today — activity will show up here live.
          </div>
        )}

        {/* Progress dots — replaces scroll motion as the "things are moving" cue */}
        {todayActivities.length > 1 && (
          <div style={{ position:"absolute", bottom: 3, left: 14, display:"flex", gap: 3 }}>
            {todayActivities.slice(0, 8).map((_, i) => (
              <div key={i} style={{
                width: i === idx ? 10 : 4, height: 3, borderRadius: 2,
                background: i === idx ? accent : th.border,
                boxShadow: i === idx ? `0 0 5px ${accent}99` : "none",
                transition: "width 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
              }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Government/College-style Notice Board
// ═════════════════════════════════════════════════════════════════════════════
function NoticeBoard({ activities, humanAgents, dark, isDesktop, loading }) {
  const th = THEME[dark ? "dark" : "light"];
  const [activeIdx, setActiveIdx] = useState(0);

  // Build notice list: online agents first, then recent activities
  const notices = [
    ...humanAgents
      .filter(a => getPresenceState(a.lastSeen, "human") !== "offline")
      .map(a => ({
        id:    `presence-${a.uid || a.id}`,
        text:  `${a.name || "Admin"} is currently active`,
        sub:   TAB_LABELS[a.activeTab] ? `Viewing: ${TAB_LABELS[a.activeTab]}` : "",
        time:  a.lastSeen,
        color: IND_GREEN,
        type:  "presence",
        fresh: isNew(a.lastSeen, 10),
      })),
    ...activities.slice(0, 12).map(a => ({
      id:    a.id || Math.random(),
      text:  `${a.agentName}: ${a.action}`,
      sub:   TAB_LABELS[a.tab] ? `@ ${TAB_LABELS[a.tab]}` : "",
      time:  a.time,
      color: ACT_COLORS[a.type] || "#4285F4",
      type:  a.type,
      fresh: isNew(a.time, 5),
    })),
  ].slice(0, 14);

  // Auto-cycle highlight every 4 s
  useEffect(() => {
    if (notices.length < 2) return;
    const t = setInterval(() =>
      setActiveIdx(i => (i + 1) % notices.length), 4000
    );
    return () => clearInterval(t);
  }, [notices.length]);

  return (
    <div style={{
      border:    `1px solid ${th.border}`,
      borderRadius: 13,
      overflow:  "hidden",
      background: th.card,
      height: "100%",
    }}>
      {/* Board header — neutral instrument-panel bar, no gradient/tricolor/pulse */}
      <div style={{
        display:    "flex", alignItems: "center", gap: 8,
        padding:    "8px 14px",
        borderBottom: `1px solid ${th.border}`,
        background: dark ? "#252527" : "#f8f9fa",
      }}>
        <IconMegaphone size={12} color={th.textSub} style={{ flexShrink:0 }} />
        <span style={{
          fontFamily:"monospace", fontSize: fs(9, isDesktop), fontWeight: 800,
          color: th.textMid, letterSpacing: 1.8, textTransform: "uppercase",
        }}>
          [ NOTICE_BOARD ]
        </span>
        <span style={{
          marginLeft:"auto", fontSize:fs(9, isDesktop), color: th.textSub, fontFamily:"monospace",
        }}>
          {notices.length} active
        </span>
      </div>

      {/* Notice rows */}
      <div style={{
        background: th.card,
        padding: "8px 0",
        minHeight: isDesktop ? 100 : 80,
      }}>
        {loading ? (
          <div style={{ padding: "2px 14px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display:"flex", gap:10, padding:"6px 0" }}>
                <Skeleton width={6} height={6} radius={1.5} dark={dark} style={{ marginTop:5, flexShrink:0 }} />
                <Skeleton width={`${78 - i * 14}%`} height={11} dark={dark} />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div style={{
            padding:"20px 14px", textAlign:"center",
            color: th.textSub, fontSize: fs(11, isDesktop),
          }}>
            No notices at this time. Activity will appear here as agents work.
          </div>
        ) : (
          notices.map((n, i) => (
            <div
              key={n.id}
              onClick={() => setActiveIdx(i)}
              {...activatable(() => setActiveIdx(i), `Notice: ${n.text}`)}
              aria-current={i === activeIdx}
              style={{
                display:"flex", gap:10, alignItems:"flex-start",
                padding: "6px 14px",
                background: i === activeIdx
                  ? (dark ? `${n.color}14` : `${n.color}0d`)
                  : "transparent",
                transition:"background 0.35s",
                cursor:"pointer",
                borderLeft: `3px solid ${i === activeIdx ? n.color : "transparent"}`,
              }}
            >
              {/* Type chip — squared, static (functional color, not decorative) */}
              <div style={{
                width:6, height:6, borderRadius:1.5, flexShrink:0,
                background: n.color, marginTop: 5,
              }}/>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{
                  fontSize: fs(11, isDesktop),
                  fontWeight: i === activeIdx ? 700 : 400,
                  color: i === activeIdx ? th.text : th.textMid,
                  lineHeight: 1.45,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  transition:"color 0.3s, font-weight 0.3s",
                }}>
                  {n.text}
                </div>
                {n.sub && (
                  <div style={{
                    fontSize:fs(9, isDesktop), color: th.textSub, fontFamily:"monospace", marginTop:1,
                  }}>
                    {n.sub}
                  </div>
                )}
              </div>

              {/* Right: "NEW" badge + time */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", flexShrink:0, gap:2 }}>
                {n.fresh && (
                  <span style={{
                    padding:"1px 5px", borderRadius:3,
                    background: `${n.color}1f`, color:n.color,
                    fontSize:fs(8, isDesktop), fontWeight:800, fontFamily:"monospace",
                    letterSpacing:0.5,
                  }}>
                    [NEW]
                  </span>
                )}
                <span style={{ fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace" }}>
                  {timeAgo(n.time)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination dots */}
      {notices.length > 1 && (
        <div style={{
          display:"flex", gap:4, justifyContent:"center",
          padding:"6px 0 10px",
          background: dark ? "#252527" : "#f8f9fa",
          borderTop: `1px solid ${th.border}`,
        }}>
          {notices.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveIdx(i)}
              {...activatable(() => setActiveIdx(i), `Go to notice ${i + 1}`)}
              aria-current={i === activeIdx}
              style={{
              width: i === activeIdx ? 18 : 5, height:5, borderRadius:2,
              background: i === activeIdx ? th.textMid : th.border,
              transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
              cursor:"pointer",
            }}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Groq Key Health Grid
// Shows K1–K5 pills: green+pulse = currently active, amber = 429'd today,
// gray = untouched today. Data comes from enriched AI agent fields.
// ═════════════════════════════════════════════════════════════════════════════
function GroqKeyGrid({ activeKeyIdx, keys429Today, keyCount = 5, dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>
      {Array.from({ length: keyCount }, (_, i) => {
        const isActive = activeKeyIdx === i;
        const was429   = (keys429Today || []).includes(i);
        const col = isActive ? IND_GREEN : was429 ? IDLE_AMBER : th.textSub;
        const bg  = isActive
          ? `${IND_GREEN}16`
          : was429
            ? `${IDLE_AMBER}14`
            : "transparent";
        const bd = isActive
          ? `${IND_GREEN}50`
          : was429
            ? `${IDLE_AMBER}50`
            : th.border;
        return (
          <div key={i} title={
            isActive ? `K${i+1} — currently active`
            : was429  ? `K${i+1} — 429'd today`
            : `K${i+1} — not used today`
          } style={{
            padding: "3px 8px", borderRadius: 4,
            background: bg, border: `1px solid ${bd}`,
            fontSize: fs(9, isDesktop), fontWeight: 700, fontFamily: "monospace",
            color: col, display: "flex", alignItems: "center", gap: 5,
            userSelect: "none", cursor: "default",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: col, flexShrink: 0 }} />
            K{i + 1}
            {isActive && (
              <span style={{ fontSize: fs(6.5, isDesktop), letterSpacing: 0.5, opacity: 0.75 }}>ACTIVE</span>
            )}
            {!isActive && was429 && (
              <span style={{ fontSize: fs(6.5, isDesktop), letterSpacing: 0.5, opacity: 0.75 }}>429</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Section Label
// Small header used to group the agent grid into Team / AI Chat / Verify
// Pipeline sections so the two separate Groq+Tavily key pools never read as
// one blended thing.
// ═════════════════════════════════════════════════════════════════════════════
function SectionLabel({ label, sublabel, color, dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:9, flexWrap:"wrap" }}>
      <div style={{
        display:"flex", alignItems:"center", gap:7,
        fontSize:fs(11, isDesktop), fontWeight:800, color:th.text,
        letterSpacing:1.4, textTransform:"uppercase", fontFamily:"monospace",
      }}>
        <span style={{ width:3, height:11, background:color, flexShrink:0, borderRadius:1 }} />
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace" }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Section Frame
// Wraps a card grid in a HUD-style group-box: glowing top accent rule, corner
// brackets, faint schematic grid texture in the header. Used for Team / AI
// Chat / Verify Pipeline so each pool reads as one bordered instrument panel.
// ═════════════════════════════════════════════════════════════════════════════
function SectionFrame({ label, sublabel, color, dark, isDesktop, children }) {
  const th = THEME[dark ? "dark" : "light"];
  const corner = (pos) => (
    <div style={{
      position:"absolute", width:9, height:9,
      [pos.includes("top") ? "top" : "bottom"]: -1,
      [pos.includes("left") ? "left" : "right"]: -1,
      borderTop:    pos.includes("top")    ? `1.5px solid ${color}90` : "none",
      borderBottom: pos.includes("bottom") ? `1.5px solid ${color}90` : "none",
      borderLeft:   pos.includes("left")   ? `1.5px solid ${color}90` : "none",
      borderRight:  pos.includes("right")  ? `1.5px solid ${color}90` : "none",
      pointerEvents:"none",
    }}/>
  );
  return (
    <div style={{
      position:"relative",
      marginBottom:16,
      border:`1px solid ${th.border}`,
      borderRadius:11,
      overflow:"hidden",
      background: th.card,
      boxShadow:`0 0 24px ${color}0c`,
    }}>
      {/* top accent rule — static glow, no animation */}
      <div style={{ height:2, background:color, boxShadow:`0 0 9px ${color}90` }}/>

      {/* header — faint grid texture + HUD corner brackets */}
      <div style={{
        position:"relative",
        padding:"11px 14px",
        borderBottom:`1px solid ${th.border}`,
        background: dark ? "#1a1a1c" : "#f8f9fa",
        backgroundImage:
          `linear-gradient(${dark?"#ffffff09":"#00000007"} 1px, transparent 1px),` +
          `linear-gradient(90deg, ${dark?"#ffffff09":"#00000007"} 1px, transparent 1px)`,
        backgroundSize:"13px 13px",
      }}>
        {corner("topleft")}{corner("topright")}
        <SectionLabel
          label={`[ ${label.toUpperCase().replace(/ /g, "_")} ]`}
          sublabel={sublabel ? `// ${sublabel}` : null}
          color={color}
          dark={dark}
          isDesktop={isDesktop}
        />
      </div>

      <div style={{ padding:"14px" }}>
        {children}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Agent Card
// ═════════════════════════════════════════════════════════════════════════════
// AgentCard is rendered per-agent across three grids and the whole tree
// re-renders on every Firestore snapshot + the 30s tick — memo it so a card
// only re-renders when its own `agent` object or `dark` actually changes.
const AgentCard = React.memo(function AgentCard({ agent, dark, isDesktop }) {
  const th      = THEME[dark ? "dark" : "light"];
  const [hovered, setHovered] = useState(false);
  const state   = getPresenceState(agent.lastSeen, agent.type);
  const online  = state === "online";
  const idle    = state === "idle";
  const present = online || idle;           // border/shimmer shown for both
  const SC      = online ? IND_GREEN : idle ? IDLE_AMBER : th.textSub;
  const stateBg     = online ? `${IND_GREEN}18`
                    : idle   ? `${IDLE_AMBER}15`
                    : `${th.textSub}14`;
  const stateBorder = online ? `${IND_GREEN}45`
                    : idle   ? `${IDLE_AMBER}55`
                    : th.border;
  const stateLabel  = online ? "ONLINE" : idle ? "IDLE" : "OFFLINE";
  const AVC         = avatarColorFor(agent); // deterministic per-agent identity color

  // Presence glow (left edge) and hover lift (drop shadow) are independent
  // and can stack — a present + hovered card shows both at once.
  const liftShadow = hovered
    ? (dark ? "0 10px 22px -10px rgba(0,0,0,0.55)" : "0 10px 22px -12px rgba(0,0,0,0.22)")
    : null;
  const glowShadow = present ? `-6px 0 14px -10px ${SC}` : null;
  const combinedShadow = [liftShadow, glowShadow].filter(Boolean).join(", ") || "none";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:  th.card,
        border:      `1px solid ${hovered && present ? `${SC}50` : th.border}`,
        borderLeft:  `2px solid ${present ? SC : th.border}`,
        borderRadius: 10,
        padding:     "10px 12px",
        position:    "relative",
        boxShadow:   combinedShadow,
        transform:   hovered ? "translateY(-3px)" : "translateY(0)",
        transition:  "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}>
      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {/* Avatar + status dot — tinted with the agent's identity color */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{
            width:26, height:26, borderRadius:6,
            background: `${AVC}1f`,
            border:`1px solid ${AVC}55`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, fontFamily:"monospace", color:AVC,
          }}>
            {agent.avatar || (agent.name||"?").charAt(0).toUpperCase()}
          </div>
          {online && (
            <div style={{
              position:"absolute", bottom:-1, right:-1,
              width:7, height:7, borderRadius:"50%",
              background: `${SC}40`,
              animation:"agnt-pulse 1.6s ease-in-out infinite",
            }}/>
          )}
          <div style={{
            position:"absolute", bottom:-1, right:-1,
            width:7, height:7, borderRadius:"50%",
            background: SC,
            border:`1.5px solid ${th.card}`,
          }}/>
        </div>

        {/* Name / role — single line */}
        <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"baseline", gap:6 }}>
          <span style={{
            fontSize:fs(12.5, isDesktop), fontWeight:700, color:th.text,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {agent.name}
          </span>
          <span style={{
            fontSize:fs(9.5, isDesktop), color:th.textSub,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:1,
          }}>
            {agent.role}
          </span>
        </div>

        {/* Status badge — pill with a small glow dot */}
        <div style={{
          display:"flex", alignItems:"center", gap:4,
          padding:"2px 7px", borderRadius:20, flexShrink:0,
          background: stateBg,
          border:`1px solid ${stateBorder}`,
        }}>
          <span style={{
            width:5, height:5, borderRadius:"50%", background:SC, flexShrink:0,
            boxShadow: present ? `0 0 5px ${SC}99` : "none",
          }}/>
          <span style={{
            fontFamily:"monospace", fontSize:fs(7.5, isDesktop), fontWeight:800,
            color: SC, letterSpacing:0.8,
          }}>
            {stateLabel}
          </span>
        </div>
      </div>

      {/* ── Stats line — inline, terminal-style, no boxes ── */}
      <div style={{
        marginTop:7, paddingTop:7, borderTop:`1px solid ${th.border}`,
        display:"flex", alignItems:"center", gap:5,
        fontFamily:"monospace", fontSize:fs(9.5, isDesktop), flexWrap:"wrap",
      }}>
        <span style={{ color:th.textSub }}>LAST_SEEN</span>
        <span style={{ color:th.text, fontWeight:700 }}>{timeAgo(agent.lastSeen)}</span>
        <span style={{ color:th.border }}>│</span>
        <span style={{ color:th.textSub }}>{online ? "SESSION" : "LAST_SESSION"}</span>
        <span style={{ color:th.text, fontWeight:700 }}>
          {online ? <LiveSessionDuration start={agent.sessionStart} /> : (agent.lastSessionDuration || "—")}
        </span>
      </div>

      {/* ── AI Health Panel — Groq key grid + daily stats ── */}
      {agent.type === "ai" && (agent.id === "groq-ai" || agent.id === "groq-verify") && (
        <div style={{
          marginTop: 9, padding: "10px 11px",
          background: dark ? "#161618" : "#f7f7f9",
          border: `1px solid ${th.border}`,
          borderLeft: `2px solid ${VIOLET}60`,
          borderRadius: 8,
        }}>
          {/* Key grid header */}
          <div style={{
            fontSize: fs(8, isDesktop), fontFamily: "monospace", fontWeight: 700,
            color: th.textSub, letterSpacing: 1.1,
          }}>
            [ KEY_HEALTH ] · {agent.keyCount} keys configured
          </div>
          <GroqKeyGrid
            activeKeyIdx={agent.activeKeyIdx}
            keys429Today={agent.keys429Today}
            keyCount={agent.keyCount || 5}
            dark={dark}
            isDesktop={isDesktop}
          />

          {/* Stats row — groq-verify has no "web search trigger" concept (Tavily
              always runs first there, deterministically), so it gets 2 boxes */}
          <div style={{
            display: "grid",
            gridTemplateColumns: agent.id === "groq-ai" ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: 6, marginTop: 9,
          }}>
            {[
              {
                label: "CALLS TODAY",
                value: agent.callsToday ?? "—",
                color: VIOLET,
              },
              {
                label: "429s TODAY",
                value: agent.i429Today ?? 0,
                color: (agent.i429Today || 0) > 0 ? "#EF4444" : th.textSub,
              },
              ...(agent.id === "groq-ai" ? [{
                label: "WEB SEARCHES",
                value: agent.webSearchesToday ?? 0,
                color: CYAN,
              }] : []),
            ].map(s => (
              <div key={s.label} style={{
                background: dark ? "#1c1c1e" : "#fff",
                borderRadius: 6, padding: "6px 7px", textAlign: "center",
                border: `1px solid ${th.border}`,
              }}>
                <div style={{
                  fontSize: fs(15, isDesktop), fontWeight: 800, color: s.color, fontFamily: "monospace",
                  lineHeight: 1.1,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: fs(6.5, isDesktop), color: th.textSub, fontFamily: "monospace",
                  fontWeight: 700, letterSpacing: 0.4, marginTop: 2,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Last 429 row / health line — text only, no icons */}
          {agent.last429At ? (
            <div style={{
              marginTop: 8, fontSize: fs(9, isDesktop), color: th.textSub, fontFamily: "monospace",
              display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
            }}>
              <span style={{ color: IDLE_AMBER }}>last_429</span>
              <span style={{ color: IDLE_AMBER, fontWeight: 700 }}>
                {timeAgo(agent.last429At)}
              </span>
              {agent.activeKeyIdx >= 0 && (
                <span style={{ color: th.textSub }}>
                  · now on K{agent.activeKeyIdx + 1}
                </span>
              )}
            </div>
          ) : agent.activeKeyIdx >= 0 ? (
            <div style={{
              marginTop: 7, fontSize: fs(9, isDesktop), color: IND_GREEN, fontFamily: "monospace",
            }}>
              no_429s_today · running on K{agent.activeKeyIdx + 1}
            </div>
          ) : (
            <div style={{
              marginTop: 7, fontSize: fs(9, isDesktop), color: th.textSub, fontFamily: "monospace",
            }}>
              no calls recorded yet today
            </div>
          )}
        </div>
      )}

      {/* ── AI Health Panel — Tavily daily stats ── */}
      {agent.type === "ai" && (agent.id === "tavily-api" || agent.id === "tavily-verify") && (
        <div style={{
          marginTop: 9, padding: "10px 11px",
          background: dark ? "#161618" : "#f7f7f9",
          border: `1px solid ${th.border}`,
          borderLeft: `2px solid ${CYAN}60`,
          borderRadius: 8,
        }}>
          <div style={{
            fontSize: fs(8, isDesktop), fontFamily: "monospace", fontWeight: 700,
            color: th.textSub, letterSpacing: 1.1,
          }}>
            [ SEARCHES_TODAY ]
          </div>
          <div style={{
            fontSize: fs(19, isDesktop), fontWeight: 800, color: CYAN, fontFamily: "monospace", marginTop: 3,
            lineHeight: 1,
          }}>
            {agent.callsToday ?? 0}
          </div>
        </div>
      )}

      {/* ── Anomaly flag — slim line, not a boxed banner ── */}
      {agent.anomaly && (
        <div style={{
          marginTop:6, display:"flex", alignItems:"center", gap:5,
          fontFamily:"monospace", fontSize:fs(9, isDesktop),
        }}>
          <IconAlert size={9} color={agent.anomaly.color} style={{ flexShrink:0 }} />
          <span style={{ color:agent.anomaly.color, fontWeight:700 }}>
            {agent.anomaly.label}
          </span>
          {agent.anomaly.detail && (
            <span style={{ color:agent.anomaly.color, opacity:0.7 }}>
              · {agent.anomaly.detail}
            </span>
          )}
        </div>
      )}

      {/* ── Active tab (only when truly online) — slim line, static dot ── */}
      {online && agent.activeTab && (
        <div style={{
          marginTop:5, display:"flex", alignItems:"center", gap:5,
          fontFamily:"monospace", fontSize:fs(9, isDesktop),
        }}>
          <span style={{ color: dark ? "#6fa3ff" : NAVY }}>›</span>
          <span style={{ color: th.textSub }}>viewing:</span>
          <span style={{ color: dark ? "#6fa3ff" : NAVY, fontWeight:700 }}>
            {TAB_LABELS[agent.activeTab] || agent.activeTab}
          </span>
        </div>
      )}

      {/* ── Idle notice — slim line, static dot ── */}
      {idle && agent.type === "human" && (
        <div style={{
          marginTop:5, display:"flex", alignItems:"center", gap:5,
          fontFamily:"monospace", fontSize:fs(9, isDesktop),
        }}>
          <span style={{ color:IDLE_AMBER }}>›</span>
          <span style={{ color:IDLE_AMBER, fontWeight:700 }}>
            idle — no interaction for 2+ min
          </span>
        </div>
      )}

      {/* ── Allowed tabs ── */}
      <div style={{ marginTop:6, display:"flex", flexWrap:"wrap", gap:3 }}>
        {agent.allowedTabs === null
          ? (
            <span style={{
              padding:"1.5px 5px", borderRadius:3,
              background:`${SAFFRON}14`, color:SAFFRON,
              fontSize:fs(7.5, isDesktop), fontWeight:700, fontFamily:"monospace",
            }}>
              ALL_TABS
            </span>
          )
          : (agent.allowedTabs || []).map(tab => (
            <span key={tab} style={{
              padding:"1.5px 5px", borderRadius:3,
              background: dark ? "#252527" : "#f0f0f0",
              fontSize:fs(7.5, isDesktop), color:th.textSub, fontWeight:600, fontFamily:"monospace",
            }}>
              {TAB_LABELS[tab] || tab}
            </span>
          ))
        }
      </div>

      {/* ── Metadata footer ── */}
      <div style={{
        marginTop:6, paddingTop:6, borderTop:`1px solid ${th.border}`,
        display:"flex", gap:7, alignItems:"center",
        fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace",
      }}>
        {agent.type === "human" && (
          <>
            <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
              {agent.deviceType === "mobile"
                ? <IconSmartphone size={10} color={th.textSub} />
                : <IconMonitor size={10} color={th.textSub} />}
              {agent.deviceType ? (agent.deviceType === "mobile" ? "Mobile" : "Desktop") : "Unknown device"}
            </span>
            {agent.email && (
              <span style={{ opacity:0.55, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                {agent.email}
              </span>
            )}
          </>
        )}
        {agent.type === "ai" && agent.model && (
          <span style={{ color:VIOLET, fontWeight:700 }}>{agent.model}</span>
        )}
      </div>
    </div>
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Stat Card (with tap/hover tooltip)
// ═════════════════════════════════════════════════════════════════════════════
const StatCard = React.memo(function StatCard({ label, value, color, Icon, tooltip, dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  const [tipOpen, setTipOpen] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <div
      {...activatable(() => setTipOpen(v => !v), tooltip ? `${label}: ${value} — ${tooltip}` : `${label}: ${value}`)}
      style={{
        position: "relative",
        background: th.card,
        border: `1px solid ${hover ? color + "55" : th.border}`,
        borderRadius: 12, padding: "11px 13px",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        transform: hover ? "translateY(-1px)" : "none",
        boxShadow: hover
          ? (dark ? `0 8px 20px rgba(0,0,0,0.45), 0 0 16px ${color}22` : `0 8px 20px rgba(0,0,0,0.10), 0 0 16px ${color}1a`)
          : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}
      onClick={() => setTipOpen(v => !v)}
      onMouseEnter={() => { setTipOpen(true); setHover(true); }}
      onMouseLeave={() => { setTipOpen(false); setHover(false); }}
      onFocus={() => setTipOpen(true)}
      onBlur={() => setTipOpen(false)}
    >
      {/* gradient glow top accent — replaces the flat 2.5px border */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2.5,
        background:`linear-gradient(90deg, ${color}, ${color}40)`,
        boxShadow:`0 0 8px ${color}80`,
      }}/>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div style={{
          fontSize:fs(22, isDesktop), fontWeight:800, color:th.text, lineHeight:1.2,
          fontFamily:"monospace", fontVariantNumeric:"tabular-nums", letterSpacing:-0.5,
        }}>
          {value}
        </div>
        <div style={{
          width:24, height:24, borderRadius:7, flexShrink:0,
          background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Icon size={13} color={color} />
        </div>
      </div>
      <div style={{ fontSize:fs(9, isDesktop), color:th.textSub, marginTop:3, fontWeight:700, letterSpacing:0.3, textTransform:"uppercase" }}>
        {label}
      </div>
      {/* Tooltip — appears below the card so it's never clipped on mobile */}
      {tipOpen && tooltip && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 7px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: dark ? "#18181b" : "#1a1a1a",
          color: "#f0f0f0",
          padding: "5px 11px",
          borderRadius: 7,
          fontSize: fs(10, isDesktop), lineHeight: 1.5, fontWeight: 500,
          whiteSpace: "nowrap",
          zIndex: 60,
          boxShadow: `0 4px 18px rgba(0,0,0,0.4), 0 0 14px ${color}33`,
          border: `1px solid ${color}40`,
          pointerEvents: "none",
        }}>
          {/* Caret pointing up */}
          <div style={{
            position: "absolute", bottom: "100%", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: `5px solid ${dark ? "#18181b" : "#1a1a1a"}`,
          }}/>
          {tooltip}
        </div>
      )}
    </div>
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Activity Timeline Row
// ═════════════════════════════════════════════════════════════════════════════
const ActivityRow = React.memo(function ActivityRow({ act, dark, isLast, isDesktop }) {
  const th    = THEME[dark ? "dark" : "light"];
  const color = ACT_COLORS[act.type] || "#4285F4";
  return (
    <div style={{
      display:"flex", gap:10, alignItems:"flex-start", padding:"9px 0",
      borderBottom: isLast ? "none" : `1px solid ${th.border}`,
    }}>
      {/* Timeline spine */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        flexShrink:0, paddingTop:3,
      }}>
        <div style={{
          width:8, height:8, borderRadius:"50%", background:color,
          boxShadow: isNew(act.time) ? `0 0 6px ${color}` : "none",
        }}/>
        {!isLast && (
          <div style={{ width:1, flex:1, minHeight:14, background:th.border, marginTop:3 }}/>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:fs(11, isDesktop), fontWeight:700, color:th.text }}>
            {act.agentName}
          </span>
          <span style={{
            padding:"1px 5px", borderRadius:4, fontSize:fs(8, isDesktop),
            background:`${color}18`, color, fontWeight:700, fontFamily:"monospace",
          }}>
            {(act.type || "action").toUpperCase()}
          </span>
          {isNew(act.time) && (
            <span style={{
              padding:"1px 5px", borderRadius:4, fontSize:fs(8, isDesktop),
              background:`${IND_GREEN}18`, color:IND_GREEN,
              fontWeight:800, fontFamily:"monospace",
              animation:"agnt-pulse 1.5s ease-in-out infinite",
            }}>
              NEW
            </span>
          )}
          <span style={{
            marginLeft:"auto", fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace",
          }}>
            {timeAgo(act.time)}
          </span>
        </div>
        <div style={{ fontSize:fs(11, isDesktop), color:th.textMid, marginTop:2, lineHeight:1.5 }}>
          {act.action}
        </div>
        {act.tab && (
          <div style={{ fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace", marginTop:1 }}>
            @ {TAB_LABELS[act.tab] || act.tab}
          </div>
        )}
      </div>
    </div>
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Daily Attendance (8h target — for salary calculation)
// ═════════════════════════════════════════════════════════════════════════════
function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = n => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

// Stopwatch-style live seconds for today's attendance row. The Firestore
// `secondsActive` value only advances in ~30s heartbeat credits (see
// useDailyTimeTracking above), so displaying it raw would visibly "jump"
// every 30s instead of counting up — not premium. This re-anchors to the
// synced value every time it changes, then ticks locally once a second in
// between syncs so the readout counts up smoothly, and freezes the instant
// the agent goes offline/idle (via the `live` flag) instead of drifting
// ahead of what's actually been credited.
function LiveAttendanceClock({ seconds, live }) {
  const [display, setDisplay]   = useState(seconds);
  const baseSecRef              = useRef(seconds);
  const baseAtRef                = useRef(Date.now());

  useEffect(() => {
    baseSecRef.current = seconds;
    baseAtRef.current  = Date.now();
    setDisplay(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - baseAtRef.current) / 1000);
      setDisplay(baseSecRef.current + elapsed);
    }, 1000);
    return () => clearInterval(t);
  }, [live]);

  return fmtClock(display);
}

function fmtClockIST(ts) {
  const d = toDate(ts);
  if (!d) return null;
  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
  });
}

function navBtnStyle(th) {
  return {
    width: 22, height: 22, borderRadius: 6, border: `1px solid ${th.border}`,
    background: "transparent", color: th.text, fontSize: 13, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}

function AttendanceSection({ humanAgents, dark, isDesktop, loading }) {
  const th = THEME[dark ? "dark" : "light"];
  const todayStr = getISTDateStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [logs, setLogs] = useState([]);
  const [logsError, setLogsError] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    const q = query(collection(db, "agentTimeLogs"), where("date", "==", selectedDate));
    const unsub = onSnapshot(
      q,
      snap => {
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLogsError(false);
      },
      err => {
        console.warn("[AttendanceSection] agentTimeLogs listener failed:", err);
        setLogsError(true);
      }
    );
    return unsub;
  }, [selectedDate]);

  const shiftDate = (deltaDays) => {
    const d = new Date(`${selectedDate}T00:00:00+05:30`);
    d.setDate(d.getDate() + deltaDays);
    const next = getISTDateStr(d);
    if (next > todayStr) return; // no peeking into the future
    setSelectedDate(next);
  };

  // Every known human admin gets a row, even with 0 logged time that day
  const rows = humanAgents.map(ag => {
    const uid = ag.uid || ag.id;
    const log = logs.find(l => l.uid === uid);
    return {
      uid,
      name: ag.name || "Admin",
      seconds: log?.secondsActive || 0,
      firstActive: log?.firstActive || null,
      lastActive: log?.lastActive || null,
      lastSeen: ag.lastSeen || null,
    };
  });

  const dateLabel = new Date(`${selectedDate}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{
      background: th.card, border: `1px solid ${th.border}`,
      borderRadius: 14, overflow: "hidden", height: "100%",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: `1px solid ${th.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: dark ? "#252527" : "#f8f9fa",
      }}>
        <div>
          <div style={{ fontSize: fs(12, isDesktop), fontWeight: 700, color: th.text }}>
            Daily Attendance
          </div>
          <div style={{ fontSize: fs(9, isDesktop), color: th.textSub, marginTop: 1 }}>
            Auto-tracked · 8h target · resets at midnight IST
            {logsError && <span style={{ color: "#EF4444", fontWeight: 700 }}> · live data unavailable</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => shiftDate(-1)} style={{ ...navBtnStyle(th), cursor: "pointer" }}>
            <IconChevronLeft size={12} color={th.text} />
          </button>
          <div style={{
            fontSize: fs(10, isDesktop), fontWeight: 700, color: th.text, fontFamily: "monospace",
            minWidth: 92, textAlign: "center",
          }}>
            {isToday ? "Today" : dateLabel}
          </div>
          <button
            onClick={() => shiftDate(1)}
            disabled={isToday}
            style={{ ...navBtnStyle(th), opacity: isToday ? 0.3 : 1, cursor: isToday ? "default" : "pointer" }}
          >
            <IconChevronRight size={12} color={th.text} />
          </button>
        </div>
      </div>

      <div style={{ padding: "6px 14px 12px" }}>
        {loading ? (
          <div>
            {[0, 1].map(i => (
              <div key={i} style={{ padding: "9px 0", borderBottom: `1px solid ${th.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Skeleton width={90} height={11} dark={dark} />
                  <Skeleton width={50} height={11} dark={dark} />
                </div>
                <Skeleton width="100%" height={5} radius={3} dark={dark} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: th.textSub, fontSize: fs(11, isDesktop) }}>
            No agents yet.
          </div>
        ) : rows.map(r => {
          const pct = Math.min(100, Math.round((r.seconds / DAILY_TARGET_SECONDS) * 100));
          const complete = r.seconds >= DAILY_TARGET_SECONDS;
          const inAt  = fmtClockIST(r.firstActive);
          const lastAt = fmtClockIST(r.lastActive);
          const live = isToday && isOnline(r.lastSeen);
          return (
            <div key={r.uid} style={{ padding: "9px 0", borderBottom: `1px solid ${th.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ fontSize: fs(11.5, isDesktop), fontWeight: 700, color: th.text }}>{r.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {live && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: IND_GREEN, boxShadow: `0 0 5px ${IND_GREEN}99`,
                      animation: "agnt-pulse 1.5s ease-in-out infinite",
                      flexShrink: 0,
                    }}/>
                  )}
                  <span style={{
                    fontSize: fs(11, isDesktop), fontWeight: 800, fontFamily: "monospace",
                    letterSpacing: 0.4, fontVariantNumeric: "tabular-nums",
                    color: complete ? IND_GREEN : th.text,
                  }}>
                    <LiveAttendanceClock seconds={r.seconds} live={live} />
                  </span>
                  <span style={{
                    fontSize: fs(8, isDesktop), fontWeight: 700, padding: "2px 6px", borderRadius: 5,
                    background: complete ? `${IND_GREEN}18` : `${SAFFRON}18`,
                    color: complete ? IND_GREEN : SAFFRON,
                  }}>
                    {complete ? "8H DONE" : `${pct}%`}
                  </span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: dark ? "#2c2c2e" : "#eee", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: complete ? IND_GREEN : `linear-gradient(90deg, ${SAFFRON}, #ffb866)`,
                  transition: "width 0.4s ease",
                }} />
              </div>
              {(inAt || lastAt) && (
                <div style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, fontFamily: "monospace", marginTop: 4 }}>
                  {inAt && <>in {inAt}{" "}</>}
                  {lastAt && <>· last active {lastAt}</>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Export — payroll-style PDF/print report, separate from the live
          single-day view above (this fetches its own date range on demand). */}
      <div style={{ padding: "10px 14px 12px", borderTop: `1px solid ${th.border}` }}>
        <button
          onClick={() => setShowExport(true)}
          disabled={loading || rows.length === 0}
          style={{
            width: "100%", padding: "9px 12px", borderRadius: 9,
            border: `1px solid ${th.border}`, background: "transparent",
            color: th.text, fontSize: fs(11, isDesktop), fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            cursor: (loading || rows.length === 0) ? "default" : "pointer",
            opacity: (loading || rows.length === 0) ? 0.5 : 1,
          }}
        >
          <IconDownload size={12} color={dark ? "#6fa3ff" : NAVY} />
          Export Attendance Report
        </button>
      </div>

      {showExport && (
        <AttendanceExportModal
          humanAgents={humanAgents}
          dark={dark}
          isDesktop={isDesktop}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Attendance Report Export — payroll-style PDF (salary calculation)
// ═════════════════════════════════════════════════════════════════════════════
// Builds a printable, payroll-register-style report straight from the same
// `agentTimeLogs` data the live Daily Attendance view above reads from, then
// hands off to the browser's native print → "Save as PDF" flow. Deliberately
// no PDF library/dependency — the report is just styled HTML opened in a new
// tab, so there's nothing extra to install or keep in sync, and it behaves
// identically on phone and desktop.
const FULL_DAY_HOURS = DAILY_TARGET_SECONDS / 3600; // 8 — same target as the live view
const HALF_DAY_HOURS  = FULL_DAY_HOURS / 2;          // 4

function shiftISTDateStr(dateStr, deltaDays) {
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  d.setDate(d.getDate() + deltaDays);
  return getISTDateStr(d);
}

function firstOfMonthISTStr(dateStr) {
  return `${dateStr.slice(0, 7)}-01`;
}

// "Day-0 of next month" trick: new Date's month param is 0-indexed, so
// passing the 1-indexed target month `pm` as that param means day 0 of it
// resolves to the last day of the *previous* (target) month.
function prevMonthRangeISTStr(dateStr) {
  const [y, m] = dateStr.split("-").map(Number);
  let py = y, pm = m - 1;
  if (pm === 0) { pm = 12; py -= 1; }
  const start = `${py}-${String(pm).padStart(2, "0")}-01`;
  const lastDay = new Date(py, pm, 0).getDate();
  const end = `${py}-${String(pm).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

function fmtReportDate(dateStr) {
  return new Date(`${dateStr}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Inclusive array of "YYYY-MM-DD" strings from start to end (IST calendar days).
function dateRangeArray(startStr, endStr) {
  const out = [];
  let cur = startStr;
  let guard = 0;
  while (cur <= endStr && guard < 1000) {
    out.push(cur);
    cur = shiftISTDateStr(cur, 1);
    guard += 1;
  }
  return out;
}

// One-off fetch (not a listener) for a date range — `date` is a plain string
// field, so both inequalities resolve to a single-field range query; no extra
// Firestore composite index is needed beyond what already exists for `date`.
async function fetchAttendanceLogsRange(startStr, endStr) {
  const q = query(
    collection(db, "agentTimeLogs"),
    where("date", ">=", startStr),
    where("date", "<=", endStr),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function escHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function effectiveDays(row) {
  return row.totalHours / FULL_DAY_HOURS;
}

// perHour: straight hours × rate.
// perDay:  pro-rated against the daily target, so e.g. 4h logged pays half a
//          day instead of either a full day or nothing — fairer for partial
//          days than a flat "present = full day's pay" rule.
function computePay(row, payMode, payRate) {
  if (!payMode || payMode === "none" || !payRate || payRate <= 0) return 0;
  if (payMode === "perHour") return row.totalHours * payRate;
  return effectiveDays(row) * payRate;
}

// Aggregates raw `agentTimeLogs` docs into one payroll-ready row per agent
// (plus the full daily breakdown each row needs for its register page).
//
// Rows come from the UNION of currently-known admins and any uid that has
// logs in this period but isn't (or no longer is) in `humanAgents` — e.g.
// someone whose admin access was later revoked. Without this, running a
// report for a past period could silently drop someone who actually worked
// those days.
function buildAttendanceReport(humanAgents, logs, startStr, endStr) {
  const days = dateRangeArray(startStr, endStr);
  const totalCalendarDays = days.length;
  const logMap = new Map(logs.map(l => [timeLogId(l.uid, l.date), l]));

  const agentMap = new Map();
  humanAgents.forEach(ag => {
    const uid = ag.uid || ag.id;
    agentMap.set(uid, { uid, name: ag.name || "Admin", email: ag.email || "" });
  });
  logs.forEach(l => {
    if (!agentMap.has(l.uid)) agentMap.set(l.uid, { uid: l.uid, name: l.name || "Admin", email: l.email || "" });
  });

  const rows = Array.from(agentMap.values()).map(ag => {
    const dayRows = days.map(dateStr => {
      const log = logMap.get(timeLogId(ag.uid, dateStr));
      const seconds = log?.secondsActive || 0;
      const hours = seconds / 3600;
      const status = seconds === 0 ? "Absent"
        : hours >= FULL_DAY_HOURS ? "Full Day"
        : hours >= HALF_DAY_HOURS ? "Half Day"
        : "Short";
      return {
        date: dateStr, seconds, hours, status,
        inTime: fmtClockIST(log?.firstActive) || "—",
        lastTime: fmtClockIST(log?.lastActive) || "—",
      };
    });

    const totalSeconds   = dayRows.reduce((s, d) => s + d.seconds, 0);
    const totalHours     = totalSeconds / 3600;
    const daysPresent    = dayRows.filter(d => d.seconds > 0).length;
    const daysFull       = dayRows.filter(d => d.hours >= FULL_DAY_HOURS).length;
    const daysHalf       = daysPresent - daysFull;
    const daysAbsent     = totalCalendarDays - daysPresent;
    const overtimeHours  = dayRows.reduce((s, d) => s + Math.max(0, d.hours - FULL_DAY_HOURS), 0);
    const shortfallHours = dayRows.reduce((s, d) => s + (d.seconds > 0 ? Math.max(0, FULL_DAY_HOURS - d.hours) : 0), 0);
    const attendancePct  = totalCalendarDays > 0 ? (daysPresent / totalCalendarDays) * 100 : 0;
    const avgHoursPerDay = daysPresent > 0 ? totalHours / daysPresent : 0;

    return {
      uid: ag.uid, name: ag.name, email: ag.email, days: dayRows,
      totalSeconds, totalHours, daysPresent, daysFull, daysHalf, daysAbsent,
      attendancePct, overtimeHours, shortfallHours, avgHoursPerDay,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return { rows, totalCalendarDays, startStr, endStr };
}

// Builds the full printable HTML document — letterhead, a summary table (the
// salary calculation sheet) and a per-agent daily register, each starting on
// its own page. Returned as a string; the modal below turns it into a blob
// URL so it can be opened as a real page in a new tab.
function buildAttendanceReportHTML({ report, payMode, payRate }) {
  const { rows, totalCalendarDays, startStr, endStr } = report;
  const showPay = payMode !== "none" && payRate > 0;

  const generatedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const periodLabel = `${fmtReportDate(startStr)} – ${fmtReportDate(endStr)}`;
  const reportRef = `ATT-${startStr.replace(/-/g, "")}-${endStr.replace(/-/g, "")}`;

  const totalHoursAll    = rows.reduce((s, r) => s + r.totalHours, 0);
  const totalPresentAll  = rows.reduce((s, r) => s + r.daysPresent, 0);
  const totalFullAll     = rows.reduce((s, r) => s + r.daysFull, 0);
  const totalOTAll       = rows.reduce((s, r) => s + r.overtimeHours, 0);
  const totalShortAll    = rows.reduce((s, r) => s + r.shortfallHours, 0);
  const avgAttendanceAll = rows.length ? rows.reduce((s, r) => s + r.attendancePct, 0) / rows.length : 0;
  const totalEffDaysAll  = rows.reduce((s, r) => s + effectiveDays(r), 0);
  const totalPayAll      = showPay ? rows.reduce((s, r) => s + computePay(r, payMode, payRate), 0) : 0;

  const payCaption = showPay
    ? `Salary calculated at ₹${Number(payRate).toLocaleString("en-IN")} per ${payMode === "perDay" ? "day" : "hour"}`
      + (payMode === "perDay" ? `, pro-rated by hours logged against the ${FULL_DAY_HOURS}h daily target.` : ".")
    : null;

  const summaryRows = rows.map((r, i) => `<tr>
      <td class="num">${i + 1}</td>
      <td class="name">${escHtml(r.name)}</td>
      <td class="num">${r.daysPresent}/${totalCalendarDays}</td>
      <td class="num">${r.attendancePct.toFixed(1)}%</td>
      <td class="num">${r.totalHours.toFixed(1)}</td>
      <td class="num">${r.avgHoursPerDay.toFixed(1)}</td>
      <td class="num">${r.daysFull}</td>
      <td class="num">${r.overtimeHours.toFixed(1)}</td>
      <td class="num">${r.shortfallHours.toFixed(1)}</td>
      ${showPay ? `<td class="num">${effectiveDays(r).toFixed(2)}</td><td class="num strong">${fmtINR(computePay(r, payMode, payRate))}</td>` : ""}
    </tr>`).join("");

  const summaryFoot = `<tr>
      <td colspan="2">TOTAL / AVERAGE</td>
      <td class="num">${totalPresentAll}/${totalCalendarDays * rows.length}</td>
      <td class="num">${avgAttendanceAll.toFixed(1)}%</td>
      <td class="num">${totalHoursAll.toFixed(1)}</td>
      <td class="num">—</td>
      <td class="num">${totalFullAll}</td>
      <td class="num">${totalOTAll.toFixed(1)}</td>
      <td class="num">${totalShortAll.toFixed(1)}</td>
      ${showPay ? `<td class="num">${totalEffDaysAll.toFixed(2)}</td><td class="num strong">${fmtINR(totalPayAll)}</td>` : ""}
    </tr>`;

  const registerSections = rows.map(r => {
    const dayRows = r.days.map(d => {
      const weekday = new Date(`${d.date}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short" });
      return `<tr class="${d.status === "Absent" ? "absent-row" : ""}">
        <td>${fmtReportDate(d.date)}</td>
        <td>${weekday}</td>
        <td class="num">${d.inTime}</td>
        <td class="num">${d.lastTime}</td>
        <td class="num">${d.hours.toFixed(2)}</td>
        <td><span class="status-badge status-${d.status.replace(" ", "")}">${d.status}</span></td>
      </tr>`;
    }).join("");

    return `<section class="agent-page">
      <div class="agent-header">
        <div>
          <div class="agent-name">${escHtml(r.name)}</div>
          ${r.email ? `<div class="agent-email">${escHtml(r.email)}</div>` : ""}
        </div>
        <div class="agent-quickstats">
          <div><span>Days Present</span><b>${r.daysPresent}/${totalCalendarDays}</b></div>
          <div><span>Total Hours</span><b>${r.totalHours.toFixed(1)}h</b></div>
          ${showPay ? `<div><span>Gross Pay</span><b>${fmtINR(computePay(r, payMode, payRate))}</b></div>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Day</th><th>Time In</th><th>Last Active</th><th>Hours</th><th>Status</th></tr></thead>
        <tbody>${dayRows}</tbody>
      </table>
    </section>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Attendance Report — ${periodLabel}</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 16mm 14mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a; margin:0; background:#eee; font-size:11px; line-height:1.45; }
  .toolbar { position: sticky; top:0; background:#003580; color:#fff; display:flex; justify-content:space-between; align-items:center; padding:11px 16px; z-index:10; gap:10px; }
  .toolbar-title { font-size:13px; font-weight:700; }
  .toolbar button { background:#fff; color:#003580; border:none; border-radius:7px; padding:8px 16px; font-weight:700; font-size:12.5px; cursor:pointer; flex-shrink:0; }
  .doc { max-width:800px; margin:0 auto; background:#fff; padding:26px 26px 36px; }
  .letterhead { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2.5px solid #003580; padding-bottom:12px; margin-bottom:16px; gap:10px; flex-wrap:wrap; }
  .brand-name { font-size:18px; font-weight:800; color:#003580; letter-spacing:0.3px; }
  .brand-sub { font-size:9.5px; color:#666; margin-top:2px; }
  .report-meta { text-align:right; }
  .report-title { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; }
  .report-period { font-size:10.5px; color:#333; margin-top:3px; font-weight:700; }
  .report-gen { font-size:8.5px; color:#999; margin-top:2px; }
  .stat-strip { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
  .stat-box { flex:1; min-width:110px; border:1px solid #ddd; border-radius:7px; padding:8px 10px; background:#fafafa; }
  .stat-box .lbl { font-size:8px; color:#888; text-transform:uppercase; letter-spacing:0.4px; }
  .stat-box .val { font-size:15px; font-weight:800; color:#003580; margin-top:2px; }
  .section-title { font-size:10.5px; font-weight:800; color:#003580; text-transform:uppercase; letter-spacing:0.4px; margin:18px 0 4px; padding-bottom:4px; border-bottom:1px solid #ddd; }
  .caption { font-size:9px; color:#777; margin-bottom:8px; font-style:italic; }
  table { width:100%; border-collapse:collapse; font-size:9.5px; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tr { break-inside: avoid; }
  th { background:#003580; color:#fff; font-weight:700; text-align:left; padding:6px 7px; font-size:8.5px; letter-spacing:0.2px; white-space:nowrap; }
  td { padding:5px 7px; border-bottom:1px solid #eee; white-space:nowrap; }
  td.num { text-align:right; font-family:'SF Mono',Consolas,monospace; }
  td.name { font-weight:700; white-space:normal; }
  td.strong { font-weight:800; color:#003580; }
  tbody tr:nth-child(even) { background:#fafafa; }
  tfoot td { border-top:2px solid #003580; border-bottom:none; font-weight:800; padding-top:7px; background:#fff; font-size:9px; }
  .status-badge { display:inline-block; padding:1.5px 7px; border-radius:4px; font-size:8px; font-weight:700; white-space:nowrap; }
  .status-FullDay { background:#DCFCE7; color:#138808; }
  .status-HalfDay { background:#FEF3C7; color:#B45309; }
  .status-Short   { background:#FFEDD5; color:#C2410C; }
  .status-Absent  { background:#FEE2E2; color:#DC2626; }
  .absent-row td  { color:#aaa; }
  .agent-page { page-break-before: always; padding-top:4px; }
  .agent-header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1.5px solid #003580; padding-bottom:8px; margin-bottom:10px; flex-wrap:wrap; gap:8px; }
  .agent-name { font-size:13px; font-weight:800; }
  .agent-email { font-size:8.5px; color:#888; margin-top:1px; }
  .agent-quickstats { display:flex; gap:16px; }
  .agent-quickstats div { text-align:right; }
  .agent-quickstats span { display:block; font-size:7.5px; color:#888; text-transform:uppercase; }
  .agent-quickstats b { font-size:11px; color:#003580; }
  .disclaimer { margin-top:22px; padding:10px 12px; background:#f7f7f7; border-left:3px solid #003580; font-size:8.5px; color:#555; line-height:1.6; }
  .signoff { display:flex; justify-content:space-between; margin-top:40px; }
  .signoff .line { width:42%; }
  .signoff .blank { border-bottom:1px solid #999; height:30px; }
  .signoff .label { font-size:8.5px; color:#666; margin-top:4px; }
  .footer-note { text-align:center; font-size:7.5px; color:#aaa; margin-top:18px; }
  @media print {
    .no-print { display:none !important; }
    body { background:#fff; }
    .doc { padding:0; max-width:none; }
  }
</style>
</head>
<body>
  <div class="toolbar no-print">
    <div class="toolbar-title">Attendance &amp; Salary Report</div>
    <button onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="doc">
    <div class="letterhead">
      <div>
        <div class="brand-name">YOJANA SAHAY</div>
        <div class="brand-sub">Government Scheme Discovery Platform · Admin Office</div>
      </div>
      <div class="report-meta">
        <div class="report-title">Agent Attendance &amp; Salary Report</div>
        <div class="report-period">${periodLabel}</div>
        <div class="report-gen">Generated ${generatedAt} IST · Ref ${reportRef}</div>
      </div>
    </div>

    <div class="stat-strip">
      <div class="stat-box"><div class="lbl">Agents</div><div class="val">${rows.length}</div></div>
      <div class="stat-box"><div class="lbl">Period Days</div><div class="val">${totalCalendarDays}</div></div>
      <div class="stat-box"><div class="lbl">Total Hours Logged</div><div class="val">${totalHoursAll.toFixed(1)}h</div></div>
      ${showPay
        ? `<div class="stat-box"><div class="lbl">Total Gross Pay</div><div class="val">${fmtINR(totalPayAll)}</div></div>`
        : `<div class="stat-box"><div class="lbl">Avg. Attendance</div><div class="val">${avgAttendanceAll.toFixed(1)}%</div></div>`}
    </div>

    <div class="section-title">Attendance &amp; Salary Summary</div>
    ${payCaption ? `<div class="caption">${escHtml(payCaption)}</div>` : ""}
    <table>
      <thead>
        <tr>
          <th>#</th><th>Agent</th><th>Days Present</th><th>Attend. %</th><th>Hours</th><th>Avg Hrs/Day</th>
          <th>Full Days</th><th>O.T. (hrs)</th><th>Short (hrs)</th>
          ${showPay ? `<th>Eff. Days</th><th>Gross Pay</th>` : ""}
        </tr>
      </thead>
      <tbody>${summaryRows}</tbody>
      <tfoot>${summaryFoot}</tfoot>
    </table>

    <div class="section-title">Daily Attendance Register</div>
    <div class="caption">Per-agent day-by-day log. Each agent's register starts on a new page for clean filing.</div>
    ${registerSections}

    <div class="disclaimer">
      <b>Note:</b> This report is generated automatically from system-tracked active dashboard time
      (<code>agentTimeLogs</code>) and reflects time the agent was actively interacting with the dashboard only.
      It does not account for approved leave, manual time corrections, or work done outside the dashboard.
      Attendance % is measured against total calendar days in the selected period and is not adjusted for
      weekly offs or holidays. Please verify against manual records before finalizing payroll.
    </div>

    <div class="signoff">
      <div class="line"><div class="blank"></div><div class="label">Prepared by (Admin)</div></div>
      <div class="line"><div class="blank"></div><div class="label">Verified / Approved by</div></div>
    </div>

    <div class="footer-note">YojanaSahay Admin Dashboard · Auto-generated on ${generatedAt} IST</div>
  </div>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 500);
    });
  </script>
</body>
</html>`;
}

function AttendanceExportModal({ humanAgents, dark, isDesktop, onClose }) {
  const th = THEME[dark ? "dark" : "light"];
  const todayStr = getISTDateStr();

  const [rangeMode, setRangeMode]     = useState("thisMonth"); // thisMonth | lastMonth | last7 | custom
  const [customStart, setCustomStart] = useState(todayStr);
  const [customEnd, setCustomEnd]     = useState(todayStr);
  const [payMode, setPayMode]         = useState("none"); // none | perDay | perHour
  const [payRate, setPayRate]         = useState("");

  const [stage, setStage]   = useState("config"); // config | generating | ready | error
  const [report, setReport] = useState(null);
  const [error, setError]   = useState(null);
  const [reportUrl, setReportUrl] = useState(null);

  // Revoke the previous blob URL whenever a new one replaces it / on unmount
  // — these aren't huge, but no reason to leak them across repeated exports.
  useEffect(() => {
    return () => { if (reportUrl) URL.revokeObjectURL(reportUrl); };
  }, [reportUrl]);

  const canClose = stage !== "generating";
  useEffect(() => {
    if (!canClose) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canClose, onClose]);

  const resolvedRange = rangeMode === "thisMonth" ? { start: firstOfMonthISTStr(todayStr), end: todayStr }
    : rangeMode === "lastMonth" ? prevMonthRangeISTStr(todayStr)
    : rangeMode === "last7"     ? { start: shiftISTDateStr(todayStr, -6), end: todayStr }
    : { start: customStart, end: customEnd };

  const rangeValid = !!resolvedRange.start && !!resolvedRange.end
    && resolvedRange.start <= resolvedRange.end
    && resolvedRange.end <= todayStr;
  const rateValid = payMode === "none" || Number(payRate) > 0;
  const periodLabel = rangeValid ? `${fmtReportDate(resolvedRange.start)} – ${fmtReportDate(resolvedRange.end)}` : "—";

  const generate = async () => {
    if (!rangeValid || !rateValid) return;
    setStage("generating");
    setError(null);
    try {
      const logs = await fetchAttendanceLogsRange(resolvedRange.start, resolvedRange.end);
      const rpt  = buildAttendanceReport(humanAgents, logs, resolvedRange.start, resolvedRange.end);
      const html = buildAttendanceReportHTML({ report: rpt, payMode, payRate: Number(payRate) || 0 });
      const url  = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      setReport(rpt);
      setReportUrl(url);
      setStage("ready");
    } catch (e) {
      console.warn("[AttendanceExportModal] generate failed:", e);
      setError(e.message || "Couldn't fetch attendance logs — check your connection.");
      setStage("error");
    }
  };

  const backToConfig = () => {
    if (reportUrl) URL.revokeObjectURL(reportUrl);
    setReportUrl(null);
    setReport(null);
    setStage("config");
  };

  const totalHoursAll = report ? report.rows.reduce((s, r) => s + r.totalHours, 0) : 0;
  const showPay = payMode !== "none" && Number(payRate) > 0;
  const totalPayAll = report && showPay
    ? report.rows.reduce((s, r) => s + computePay(r, payMode, Number(payRate)), 0)
    : 0;

  return createPortal(
    <div className="agnt-export-overlay" onClick={() => canClose && onClose()}>
      <div
        className="agnt-export-panel"
        onClick={e => e.stopPropagation()}
        style={{
          background: dark ? "#151517" : "#fff",
          border: `1px solid ${NAVY}40`,
          boxShadow: `0 0 0 1px ${NAVY}20, 0 24px 60px -12px ${NAVY}30`,
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${NAVY}, ${NAVY}00 85%)` }} />

        {/* Header */}
        <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${th.border}`, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: `${NAVY}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconDownload size={14} color={dark ? "#6fa3ff" : NAVY} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: fs(12, isDesktop), fontWeight: 800, color: th.text }}>Export Attendance Report</div>
            <div style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, marginTop: 1 }}>
              {stage === "config"     && "Pick a period — add a pay rate for salary calculation"}
              {stage === "generating" && "Fetching logs…"}
              {stage === "ready"      && "Report ready"}
              {stage === "error"      && "Something went wrong"}
            </div>
          </div>
          {canClose && (
            <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 7, border: `1px solid ${th.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <IconX size={11} color={th.textSub} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px", overflowY: "auto", flex: 1 }}>

          {stage === "config" && (
            <div>
              <div style={{ fontSize: fs(9.5, isDesktop), fontWeight: 700, color: th.textSub, marginBottom: 8, letterSpacing: 0.3 }}>PERIOD</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {[
                  { id: "thisMonth", label: "This Month" },
                  { id: "lastMonth", label: "Last Month" },
                  { id: "last7",     label: "Last 7 Days" },
                  { id: "custom",    label: "Custom" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setRangeMode(opt.id)}
                    style={{
                      padding: "7px 12px", borderRadius: 8,
                      border: `1px solid ${rangeMode === opt.id ? NAVY : th.border}`,
                      background: rangeMode === opt.id ? `${NAVY}14` : "transparent",
                      color: rangeMode === opt.id ? (dark ? "#6fa3ff" : NAVY) : th.text,
                      fontSize: fs(10.5, isDesktop), fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {rangeMode === "custom" && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="date" value={customStart} max={todayStr}
                    onChange={e => setCustomStart(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${th.border}`, background: th.inputBg, color: th.text, fontSize: fs(10.5, isDesktop) }}
                  />
                  <input
                    type="date" value={customEnd} max={todayStr}
                    onChange={e => setCustomEnd(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${th.border}`, background: th.inputBg, color: th.text, fontSize: fs(10.5, isDesktop) }}
                  />
                </div>
              )}

              <div style={{ fontSize: fs(9.5, isDesktop), color: th.textSub, fontFamily: "monospace", marginBottom: 16 }}>
                {rangeValid ? periodLabel : "Pick a valid date range"}
              </div>

              <div style={{ fontSize: fs(9.5, isDesktop), fontWeight: 700, color: th.textSub, marginBottom: 8, letterSpacing: 0.3 }}>SALARY CALCULATION (OPTIONAL)</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[
                  { id: "none",    label: "No Pay Calc" },
                  { id: "perDay",  label: "₹ / Day" },
                  { id: "perHour", label: "₹ / Hour" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPayMode(opt.id)}
                    style={{
                      flex: 1, padding: "7px 8px", borderRadius: 8,
                      border: `1px solid ${payMode === opt.id ? NAVY : th.border}`,
                      background: payMode === opt.id ? `${NAVY}14` : "transparent",
                      color: payMode === opt.id ? (dark ? "#6fa3ff" : NAVY) : th.text,
                      fontSize: fs(10, isDesktop), fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {payMode !== "none" && (
                <input
                  type="number" inputMode="decimal" min="0" step="0.01"
                  value={payRate} onChange={e => setPayRate(e.target.value)}
                  placeholder={payMode === "perDay" ? "Rate per day, e.g. 500" : "Rate per hour, e.g. 65"}
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: `1px solid ${th.border}`, background: th.inputBg, color: th.text, fontSize: fs(11, isDesktop), marginBottom: 4 }}
                />
              )}
              {payMode === "perDay" && (
                <div style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, lineHeight: 1.5 }}>
                  Pro-rated against the {FULL_DAY_HOURS}h target — e.g. 4h logged pays half a day.
                </div>
              )}
            </div>
          )}

          {stage === "generating" && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <IconCpu size={20} color={NAVY} style={{ animation: "agnt-spin 2s linear infinite" }} />
              <div style={{ fontSize: fs(10.5, isDesktop), color: th.textSub, marginTop: 10 }}>
                Fetching {periodLabel}…
              </div>
            </div>
          )}

          {stage === "ready" && report && (
            <div>
              <div style={{ border: `1px solid ${th.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                <StatRow label="Period" value={periodLabel} th={th} isDesktop={isDesktop} />
                <StatRow label="Agents" value={report.rows.length} th={th} isDesktop={isDesktop} />
                <StatRow label="Total Hours Logged" value={`${totalHoursAll.toFixed(1)} h`} th={th} isDesktop={isDesktop} last={!showPay} />
                {showPay && <StatRow label="Total Gross Pay" value={fmtINR(totalPayAll)} th={th} isDesktop={isDesktop} last />}
              </div>

              <div style={{ fontSize: fs(9.5, isDesktop), fontWeight: 700, color: th.textSub, marginBottom: 6, letterSpacing: 0.3 }}>PER AGENT</div>
              <div style={{ border: `1px solid ${th.border}`, borderRadius: 10, overflow: "hidden", maxHeight: 180, overflowY: "auto" }}>
                {report.rows.map((r, i) => (
                  <div
                    key={r.uid}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", borderBottom: i === report.rows.length - 1 ? "none" : `1px solid ${th.border}`,
                    }}
                  >
                    <div style={{ fontSize: fs(10.5, isDesktop), fontWeight: 700, color: th.text }}>{r.name}</div>
                    <div style={{ fontSize: fs(9.5, isDesktop), color: th.textSub, fontFamily: "monospace", textAlign: "right" }}>
                      {r.daysPresent}/{report.totalCalendarDays}d · {r.totalHours.toFixed(1)}h
                      {showPay && (
                        <span style={{ color: th.text, fontWeight: 700 }}> · {fmtINR(computePay(r, payMode, Number(payRate)))}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === "error" && (
            <div style={{ padding: "10px 12px", borderRadius: 10, background: dark ? `${IDLE_AMBER}14` : `${IDLE_AMBER}0c`, border: `1px solid ${IDLE_AMBER}40`, fontSize: fs(10.5, isDesktop), color: th.text, lineHeight: 1.6 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 18px 16px", display: "flex", gap: 8, flexShrink: 0, borderTop: `1px solid ${th.border}` }}>
          {stage === "config" && (
            <>
              <ModalButton onClick={onClose} th={th} isDesktop={isDesktop}>Cancel</ModalButton>
              <ModalButton onClick={generate} disabled={!rangeValid || !rateValid} primary color={NAVY} th={th} isDesktop={isDesktop} style={{ flex: 1 }}>
                Generate Report
              </ModalButton>
            </>
          )}
          {stage === "generating" && (
            <div style={{ fontSize: fs(9, isDesktop), color: th.textSub, textAlign: "center", width: "100%" }}>
              Don't close this window…
            </div>
          )}
          {stage === "ready" && (
            <>
              <ModalButton onClick={backToConfig} th={th} isDesktop={isDesktop}>Back</ModalButton>
              <a
                href={reportUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 9, fontWeight: 700,
                  fontSize: fs(11, isDesktop), textAlign: "center", textDecoration: "none",
                  background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <IconDownload size={12} color="#fff" /> Open Report
              </a>
            </>
          )}
          {stage === "error" && (
            <ModalButton onClick={backToConfig} primary color={IDLE_AMBER} th={th} isDesktop={isDesktop} style={{ flex: 1 }}>
              Try Again
            </ModalButton>
          )}
        </div>

        {stage === "ready" && (
          <div style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, textAlign: "center", padding: "0 18px 14px" }}>
            Opens in a new tab — tap "Print / Save as PDF" there to save it.
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Activity Log — day-browsable history (own listener, own date nav)
// ═════════════════════════════════════════════════════════════════════════════
// Previously this rendered straight from the shared `activities` state, which
// is just "the most recent 30 adminActivity docs ever logged" — no concept of
// "today" at all. On a quiet day that left a day-old event pinned at the top
// looking current, and there was no way to reach anything past that 30-doc
// cap. This runs its own per-day range query instead — Today by default,
// Prev/Next to browse — same pattern as Daily Attendance, so "today" always
// starts clean and older history is always reachable instead of silently
// falling off the end of a fixed-size cap.
function istDayRange(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+05:30`);
  const end   = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function ActivityLogSection({ dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  const todayStr = getISTDateStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dayActivities, setDayActivities] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [logError, setLogError] = useState(false);

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    setLoaded(false);
    const { start, end } = istDayRange(selectedDate);
    const q = query(
      collection(db, "adminActivity"),
      where("time", ">=", start),
      where("time", "<", end),
      orderBy("time", "desc"),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setDayActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoaded(true);
        setLogError(false);
      },
      err => {
        console.warn("[ActivityLogSection] adminActivity listener failed:", err);
        setLoaded(true);
        setLogError(true);
      }
    );
    return unsub;
  }, [selectedDate]);

  const shiftDate = (deltaDays) => {
    const d = new Date(`${selectedDate}T00:00:00+05:30`);
    d.setDate(d.getDate() + deltaDays);
    const next = getISTDateStr(d);
    if (next > todayStr) return; // no peeking into the future
    setSelectedDate(next);
  };

  const dateLabel = new Date(`${selectedDate}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{
      background:th.card, border:`1px solid ${th.border}`,
      borderRadius:14, overflow:"hidden", marginTop:14,
    }}>
      {/* Header */}
      <div style={{
        padding:"10px 14px",
        borderBottom:`1px solid ${th.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: dark ? "#252527" : "#f8f9fa",
      }}>
        <div>
          <div style={{ fontSize:fs(12, isDesktop), fontWeight:700, color:th.text, display:"flex", alignItems:"center", gap:6 }}>
            <IconClockHistory size={13} color={th.textMid} />
            Activity Log
          </div>
          <div style={{ fontSize:fs(9, isDesktop), color:th.textSub, marginTop:1, fontFamily:"monospace" }}>
            {loaded ? `${dayActivities.length} event${dayActivities.length === 1 ? "" : "s"}` : "loading…"}
            {logError && <span style={{ color: "#EF4444", fontWeight: 700 }}> · live data unavailable</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => shiftDate(-1)} style={{ ...navBtnStyle(th), cursor: "pointer" }}>
            <IconChevronLeft size={12} color={th.text} />
          </button>
          <div style={{
            fontSize: fs(10, isDesktop), fontWeight: 700, color: th.text, fontFamily: "monospace",
            minWidth: 92, textAlign: "center",
          }}>
            {isToday ? "Today" : dateLabel}
          </div>
          <button
            onClick={() => shiftDate(1)}
            disabled={isToday}
            style={{ ...navBtnStyle(th), opacity: isToday ? 0.3 : 1, cursor: isToday ? "default" : "pointer" }}
          >
            <IconChevronRight size={12} color={th.text} />
          </button>
        </div>
      </div>

      <div style={{ padding:"0 14px" }}>
        {!loaded ? (
          <div style={{ padding: "9px 0" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom: i < 2 ? `1px solid ${th.border}` : "none" }}>
                <Skeleton width={8} height={8} radius={4} dark={dark} style={{ marginTop:3, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <Skeleton width={`${60 - i * 10}%`} height={11} dark={dark} style={{ marginBottom:6 }} />
                  <Skeleton width={`${40 - i * 6}%`} height={9} dark={dark} />
                </div>
              </div>
            ))}
          </div>
        ) : dayActivities.length === 0 ? (
          <div style={{
            padding:"24px 0", textAlign:"center",
            color:th.textSub, fontSize:fs(12, isDesktop),
          }}>
            {isToday
              ? "No activity recorded yet. Activity will appear here as agents work."
              : "No activity recorded on this day."}
          </div>
        ) : (
          dayActivities.slice(0, 30).map((act, i) => (
            <ActivityRow
              key={act.id}
              act={act}
              dark={dark}
              isLast={i === Math.min(dayActivities.length, 30) - 1}
              isDesktop={isDesktop}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PURGE PROTOCOL — premium multi-stage data-deletion modal
// ═════════════════════════════════════════════════════════════════════════════
// A deliberately distinct "control room" surface, not a reuse of the
// dashboard's tricolor identity (SAFFRON/NAVY/IND_GREEN/RED). Four stages:
//   scan        — aggregation-only count query, no documents touched yet
//   confirm     — irreversibility warning + typed "DELETE" authorization
//   processing  — real per-batch terminal log + progress bar (deleteOlderThan
//                 reports actual batches as they commit — nothing here is a
//                 fake animation)
//   complete    — final stats; or `error` if a batch commit throws
// ─────────────────────────────────────────────────────────────────────────────
const PURGE_VIOLET  = VIOLET;     // primary accent — header glow, primary action
const PURGE_CYAN    = CYAN;       // scan-stage accent, terminal/progress accent
const PURGE_AMBER   = IDLE_AMBER; // caution copy on the confirm + error stages
const PURGE_EMERALD = "#10B981";  // success state on the complete stage
const PURGE_BATCH_SIZE = 400;

// rAF count-up — the numbers it lands on are always the real fetched counts;
// only the *reveal* is animated, so the scan/confirm stages feel alive
// without ever showing a fabricated number.
function animateCountTo(setter, target, duration = 650) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    setter(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function ReadoutRow({ label, value, th, isDesktop }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0",
      borderBottom: `1px dashed ${th.border}`,
    }}>
      <span style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, fontFamily: "monospace", letterSpacing: 0.4, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: fs(9.5, isDesktop), color: th.text, fontFamily: "monospace", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, sub, count, color, th, isDesktop, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 12px", borderBottom: last ? "none" : `1px solid ${th.border}`,
    }}>
      <div>
        <div style={{ fontSize: fs(10.5, isDesktop), fontWeight: 700, color: th.text }}>{label}</div>
        <div style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, fontFamily: "monospace", marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ fontSize: fs(15, isDesktop), fontWeight: 800, color, fontFamily: "monospace" }}>
        {count.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function StatRow({ label, value, th, isDesktop, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", padding: "8px 12px",
      borderBottom: last ? "none" : `1px solid ${th.border}`, fontSize: fs(10.5, isDesktop),
    }}>
      <span style={{ color: th.textSub }}>{label}</span>
      <span style={{ color: th.text, fontWeight: 700, fontFamily: "monospace" }}>
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </span>
    </div>
  );
}

function ModalButton({ children, onClick, disabled, primary, color, th, isDesktop, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 16px", borderRadius: 9, fontWeight: 700,
        fontSize: fs(11, isDesktop), cursor: disabled ? "default" : "pointer",
        border: primary ? "none" : `1px solid ${th.border}`,
        background: primary ? (disabled ? `${color}55` : color) : "transparent",
        color: primary ? "#fff" : th.text,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function PurgeModal({
  dark, isDesktop, stage, cutoffLabel,
  includeActivity, includeAttendance,
  animCounts, confirmText, setConfirmText,
  logLines, progressPct, deletedSoFar, totalToDelete,
  result, error, onCancel, onConfirm, onClose, logBoxRef,
}) {
  const th = THEME[dark ? "dark" : "light"];
  const canClose = stage !== "processing";
  const canConfirm = confirmText.trim().toUpperCase() === "DELETE";

  useEffect(() => {
    if (!canClose) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canClose, onClose]);

  const stageMeta = {
    scan:       { label: "SCANNING",       color: PURGE_CYAN },
    confirm:    { label: "CONFIRM PURGE",  color: PURGE_AMBER },
    processing: { label: "PURGING DATA",   color: PURGE_VIOLET },
    complete:   { label: "PURGE COMPLETE", color: PURGE_EMERALD },
    error:      { label: "PURGE FAILED",   color: PURGE_AMBER },
  }[stage];

  return createPortal(
    <div className="agnt-purge-overlay" onClick={() => canClose && onClose()}>
      <div
        className="agnt-purge-panel"
        onClick={e => e.stopPropagation()}
        style={{
          background: dark ? "#151517" : "#fff",
          border: `1px solid ${stageMeta.color}40`,
          boxShadow: `0 0 0 1px ${stageMeta.color}20, 0 24px 60px -12px ${stageMeta.color}30, 0 0 40px ${stageMeta.color}14`,
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${stageMeta.color}, ${stageMeta.color}00 85%)`,
          boxShadow: `0 0 10px ${stageMeta.color}90`,
        }}/>

        {/* Header */}
        <div style={{
          padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 10,
          borderBottom: `1px solid ${th.border}`, flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0, position: "relative",
            background: `${stageMeta.color}18`, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {stage === "scan"       && <IconRadar size={15} color={stageMeta.color} style={{ animation: "agnt-spin 1.4s linear infinite" }} />}
            {stage === "confirm"    && <IconAlert size={14} color={stageMeta.color} />}
            {stage === "processing" && <IconCpu   size={14} color={stageMeta.color} style={{ animation: "agnt-spin 2s linear infinite" }} />}
            {stage === "complete"   && <IconCheck size={14} color={stageMeta.color} />}
            {stage === "error"      && <IconAlert size={14} color={stageMeta.color} />}
            <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: `${stageMeta.color}22`, animation: "agnt-pulse 1.8s ease-in-out infinite" }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: fs(12, isDesktop), fontWeight: 800, color: stageMeta.color, fontFamily: "monospace", letterSpacing: 0.6 }}>
              {stageMeta.label}
            </div>
            <div style={{ fontSize: fs(8.5, isDesktop), color: th.textSub, marginTop: 1, fontFamily: "monospace" }}>
              cutoff &lt; {cutoffLabel}
            </div>
          </div>
          {canClose && (
            <button onClick={onClose} style={{
              width: 24, height: 24, borderRadius: 7, border: `1px solid ${th.border}`,
              background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}>
              <IconX size={11} color={th.textSub} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px", overflowY: "auto", flex: 1 }}>

          {stage === "scan" && (
            <div>
              <div style={{ fontSize: fs(10.5, isDesktop), color: th.textMid, lineHeight: 1.6, marginBottom: 12 }}>
                Running an aggregation query for records older than the cutoff. No documents are touched at this stage — this only counts.
              </div>
              <ReadoutRow
                label="TARGET COLLECTIONS"
                value={[includeActivity && "adminActivity", includeAttendance && "agentTimeLogs"].filter(Boolean).join(", ") || "none"}
                th={th} isDesktop={isDesktop}
              />
              <ReadoutRow
                label="QUERY"
                value={[includeActivity && "time < cutoff", includeAttendance && "date < cutoff"].filter(Boolean).join("   ")}
                th={th} isDesktop={isDesktop}
              />
              <ReadoutRow label="BATCH SIZE" value={`${PURGE_BATCH_SIZE} writes / commit`} th={th} isDesktop={isDesktop} />
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginTop: 14,
                color: PURGE_CYAN, fontFamily: "monospace", fontSize: fs(10, isDesktop), fontWeight: 700,
              }}>
                <span className="agnt-purge-cursor">█</span> scanning…
              </div>
            </div>
          )}

          {stage === "confirm" && (
            <div>
              <div style={{
                display: "flex", gap: 8, padding: "10px 12px", borderRadius: 10, marginBottom: 12,
                background: dark ? `${PURGE_AMBER}14` : `${PURGE_AMBER}0c`, border: `1px solid ${PURGE_AMBER}40`,
              }}>
                <IconAlert size={13} color={PURGE_AMBER} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: fs(10.5, isDesktop), color: th.text, lineHeight: 1.55 }}>
                  This action is <b style={{ color: PURGE_AMBER }}>irreversible</b>. Records are permanently removed from Firestore — there's no undo.
                </div>
              </div>

              <div style={{ border: `1px solid ${th.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                {includeActivity && (
                  <SummaryRow label="Activity Log" sub="adminActivity · time field" count={animCounts.activity} color={PURGE_CYAN} th={th} isDesktop={isDesktop} />
                )}
                {includeAttendance && (
                  <SummaryRow label="Daily Attendance" sub="agentTimeLogs · date field" count={animCounts.attendance} color={PURGE_VIOLET} th={th} isDesktop={isDesktop} last />
                )}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  padding: "10px 12px", background: dark ? "#1f1f22" : "#f4f4f6",
                }}>
                  <span style={{ fontSize: fs(9.5, isDesktop), color: th.textSub, fontWeight: 700, letterSpacing: 0.4 }}>TOTAL</span>
                  <span style={{ fontSize: fs(15, isDesktop), fontWeight: 800, color: th.text, fontFamily: "monospace" }}>
                    {(animCounts.activity + animCounts.attendance).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: fs(9.5, isDesktop), color: th.textSub, marginBottom: 6, fontFamily: "monospace" }}>
                Type <b style={{ color: th.text }}>DELETE</b> to authorize
              </div>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 9, boxSizing: "border-box",
                  border: `1px solid ${canConfirm ? PURGE_EMERALD : th.border}`,
                  background: th.inputBg, color: th.text,
                  fontFamily: "monospace", fontSize: fs(12, isDesktop), fontWeight: 700,
                  letterSpacing: 1.5, outline: "none",
                }}
              />
            </div>
          )}

          {stage === "processing" && (
            <div>
              <div
                ref={logBoxRef}
                style={{
                  background: "#0b0b0d", borderRadius: 10, padding: "10px 12px",
                  fontFamily: "monospace", fontSize: fs(9.5, isDesktop), color: "#9be9a8",
                  height: 150, overflowY: "auto", lineHeight: 1.7,
                }}
              >
                {logLines.length === 0 ? (
                  <div style={{ color: "#666" }}>&gt; initializing…</div>
                ) : logLines.map((line, i) => (
                  <div key={i} style={{ animation: "agnt-fade-in 0.25s ease both", wordBreak: "break-all" }}>{line}</div>
                ))}
                <span className="agnt-purge-cursor" style={{ color: "#9be9a8" }}>█</span>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", fontSize: fs(9.5, isDesktop),
                  color: th.textSub, fontFamily: "monospace", marginBottom: 6,
                }}>
                  <span>{deletedSoFar.toLocaleString("en-IN")} / {totalToDelete.toLocaleString("en-IN")} deleted</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: th.border, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progressPct}%`, borderRadius: 4,
                    background: `linear-gradient(90deg, ${PURGE_VIOLET}, ${PURGE_CYAN})`,
                    transition: "width 0.3s ease",
                  }}/>
                </div>
              </div>
            </div>
          )}

          {stage === "complete" && result && (
            <div>
              <div style={{ textAlign: "center", padding: "6px 0 16px" }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%", margin: "0 auto 10px",
                  background: `${PURGE_EMERALD}18`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconCheck size={20} color={PURGE_EMERALD} />
                </div>
                <div style={{ fontSize: fs(18, isDesktop), fontWeight: 800, color: th.text, fontFamily: "monospace" }}>
                  {(result.activity + result.attendance).toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: fs(9.5, isDesktop), color: th.textSub, marginTop: 2 }}>records permanently removed</div>
              </div>
              <div style={{ border: `1px solid ${th.border}`, borderRadius: 10, overflow: "hidden" }}>
                {result.includeActivity   && <StatRow label="Activity Log"     value={result.activity}    th={th} isDesktop={isDesktop} />}
                {result.includeAttendance && <StatRow label="Daily Attendance" value={result.attendance}  th={th} isDesktop={isDesktop} />}
                <StatRow label="Cutoff"     value={cutoffLabel}                          th={th} isDesktop={isDesktop} />
                <StatRow label="Time taken" value={`${(result.timeMs / 1000).toFixed(1)}s`} th={th} isDesktop={isDesktop} last />
              </div>
            </div>
          )}

          {stage === "error" && (
            <div style={{
              padding: "10px 12px", borderRadius: 10,
              background: dark ? `${PURGE_AMBER}14` : `${PURGE_AMBER}0c`, border: `1px solid ${PURGE_AMBER}40`,
              fontSize: fs(10.5, isDesktop), color: th.text, lineHeight: 1.6,
            }}>
              {error || "Something went wrong. Check the console / Firestore rules."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px 16px", display: "flex", gap: 8, flexShrink: 0,
          borderTop: stage === "processing" ? "none" : `1px solid ${th.border}`,
        }}>
          {stage === "scan" && (
            <ModalButton onClick={onCancel} th={th} isDesktop={isDesktop} style={{ flex: 1 }}>Cancel</ModalButton>
          )}
          {stage === "confirm" && (
            <>
              <ModalButton onClick={onCancel} th={th} isDesktop={isDesktop}>Cancel</ModalButton>
              <ModalButton onClick={onConfirm} disabled={!canConfirm} primary color={PURGE_VIOLET} th={th} isDesktop={isDesktop} style={{ flex: 1 }}>
                Confirm &amp; Purge
              </ModalButton>
            </>
          )}
          {stage === "processing" && (
            <div style={{ fontSize: fs(9, isDesktop), color: th.textSub, textAlign: "center", width: "100%" }}>
              Don't close this window while purging…
            </div>
          )}
          {(stage === "complete" || stage === "error") && (
            <ModalButton
              onClick={onClose} primary
              color={stage === "complete" ? PURGE_EMERALD : PURGE_AMBER}
              th={th} isDesktop={isDesktop} style={{ flex: 1 }}
            >
              Close
            </ModalButton>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Data Retention — manual cleanup for Activity Log + Attendance
// ═════════════════════════════════════════════════════════════════════════════
// Neither adminActivity nor agentTimeLogs has any TTL — both just grow
// forever. This gives a deliberate, multi-stage-confirmed way to prune old
// records on demand via the PurgeModal above: scan (count via aggregation
// query — no per-document reads billed) → confirm (typed authorization) →
// processing (real batch-by-batch terminal log) → complete.
function DataRetentionPanel({ dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];

  const [includeActivity,   setIncludeActivity]   = useState(true);
  const [includeAttendance, setIncludeAttendance] = useState(true);

  const [stage,  setStage]  = useState(null); // null | scan | confirm | processing | complete | error
  const [months, setMonths] = useState(null);
  const [counts, setCounts] = useState({ activity: 0, attendance: 0 });
  const [animActivity,   setAnimActivity]   = useState(0);
  const [animAttendance, setAnimAttendance] = useState(0);
  const [confirmText, setConfirmText] = useState("");
  const [logLines,    setLogLines]    = useState([]);
  const [deletedSoFar, setDeletedSoFar] = useState(0);
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState(null);

  const logBoxRef = useRef(null);
  useEffect(() => {
    if (logBoxRef.current) logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
  }, [logLines]);

  const noneSelected = !includeActivity && !includeAttendance;

  const cutoffLabel = (m = months) => monthsAgoDate(m).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const openPurge = async (m) => {
    setMonths(m);
    setStage("scan");
    setConfirmText("");
    setResult(null);
    setError(null);
    setCounts({ activity: 0, attendance: 0 });
    setAnimActivity(0);
    setAnimAttendance(0);

    const cutoffDate    = monthsAgoDate(m);
    const cutoffDateStr = getISTDateStr(cutoffDate);
    const startedAt = Date.now();
    const [activityCount, attendanceCount] = await Promise.all([
      includeActivity   ? countOlderThan("adminActivity", "time", cutoffDate)     : Promise.resolve(0),
      includeAttendance ? countOlderThan("agentTimeLogs",  "date", cutoffDateStr) : Promise.resolve(0),
    ]);

    // Floor the scan stage at ~850ms so it always reads as a deliberate
    // pass over the data rather than a flash — the numbers themselves are
    // never delayed beyond what Firestore actually took to answer.
    const MIN_SCAN_MS = 850;
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_SCAN_MS) await new Promise(r => setTimeout(r, MIN_SCAN_MS - elapsed));

    const finalCounts = { activity: activityCount ?? 0, attendance: attendanceCount ?? 0 };
    setCounts(finalCounts);
    animateCountTo(setAnimActivity, finalCounts.activity);
    animateCountTo(setAnimAttendance, finalCounts.attendance);
    setStage("confirm");
  };

  const closeModal = () => {
    setStage(null);
    setMonths(null);
    setConfirmText("");
    setLogLines([]);
    setDeletedSoFar(0);
  };

  const runPurge = async () => {
    setStage("processing");
    setLogLines([`> cutoff ${cutoffLabel()} — starting purge`]);
    setDeletedSoFar(0);
    const startedAt     = Date.now();
    const cutoffDate    = monthsAgoDate(months);
    const cutoffDateStr = getISTDateStr(cutoffDate);

    let running = 0;
    const onBatch = ({ collectionName, batchIndex, totalBatches, deletedInBatch }) => {
      running += deletedInBatch;
      setDeletedSoFar(running);
      setLogLines(prev => [...prev, `> Batch ${batchIndex}/${totalBatches} — deleting ${deletedInBatch} docs from ${collectionName}`]);
    };

    try {
      let activityDeleted = 0, attendanceDeleted = 0;
      if (includeActivity && counts.activity > 0) {
        activityDeleted = await deleteOlderThan("adminActivity", "time", cutoffDate, {
          estimatedBatches: Math.max(1, Math.ceil(counts.activity / 400)), onBatch,
        });
      }
      if (includeAttendance && counts.attendance > 0) {
        attendanceDeleted = await deleteOlderThan("agentTimeLogs", "date", cutoffDateStr, {
          estimatedBatches: Math.max(1, Math.ceil(counts.attendance / 400)), onBatch,
        });
      }
      setLogLines(prev => [...prev, `> done — ${activityDeleted + attendanceDeleted} records purged`]);
      setResult({
        activity: activityDeleted, attendance: attendanceDeleted, months,
        includeActivity, includeAttendance, timeMs: Date.now() - startedAt,
      });
      setStage("complete");
    } catch (e) {
      console.warn("[DataRetentionPanel] purge failed:", e);
      setError(e.message || "Purge failed — check console / Firestore rules.");
      setStage("error");
    }
  };

  const totalToDelete = (includeActivity ? counts.activity : 0) + (includeAttendance ? counts.attendance : 0);
  const progressPct   = totalToDelete > 0 ? Math.min(100, (deletedSoFar / totalToDelete) * 100) : 100;

  return (
    <div style={{
      background: th.card, border: `1px solid ${th.border}`,
      borderRadius: 14, overflow: "hidden", marginTop: 14,
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: `1px solid ${th.border}`,
        background: dark ? "#252527" : "#f8f9fa",
      }}>
        <div style={{ fontSize: fs(12, isDesktop), fontWeight: 700, color: th.text, display: "flex", alignItems: "center", gap: 6 }}>
          <IconTrash size={13} color={th.textMid} />
          Data Retention
        </div>
        <div style={{ fontSize: fs(9, isDesktop), color: th.textSub, marginTop: 1 }}>
          Permanently remove old records — this can't be undone.
        </div>
      </div>

      <div style={{ padding: "12px 14px" }}>
        {/* Which collections */}
        <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: fs(11, isDesktop),
            color: th.text, cursor: stage === null ? "pointer" : "default",
            opacity: stage === null ? 1 : 0.6,
          }}>
            <input
              type="checkbox" checked={includeActivity} disabled={stage !== null}
              onChange={e => setIncludeActivity(e.target.checked)} style={{ accentColor: PURGE_VIOLET }}
            />
            Activity Log
          </label>
          <label style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: fs(11, isDesktop),
            color: th.text, cursor: stage === null ? "pointer" : "default",
            opacity: stage === null ? 1 : 0.6,
          }}>
            <input
              type="checkbox" checked={includeAttendance} disabled={stage !== null}
              onChange={e => setIncludeAttendance(e.target.checked)} style={{ accentColor: PURGE_VIOLET }}
            />
            Daily Attendance
          </label>
        </div>

        {/* Threshold triggers */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[3, 6].map(m => (
            <button
              key={m}
              onClick={() => openPurge(m)}
              disabled={noneSelected || stage !== null}
              style={{
                padding: "7px 12px", borderRadius: 8,
                border: `1px solid ${th.border}`,
                background: "transparent", color: (noneSelected || stage !== null) ? th.textSub : th.text,
                fontSize: fs(11, isDesktop), fontWeight: 700,
                cursor: (noneSelected || stage !== null) ? "default" : "pointer",
                opacity: (noneSelected || stage !== null) ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <IconTrash size={11} color={(noneSelected || stage !== null) ? th.textSub : PURGE_VIOLET} />
              Older than {m} months
            </button>
          ))}
        </div>

        {/* Persisted summary after the modal is closed */}
        {stage === null && result && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 8,
            background: `${PURGE_EMERALD}14`, border: `1px solid ${PURGE_EMERALD}40`,
            fontSize: fs(11, isDesktop), color: th.text,
          }}>
            Deleted
            {result.includeActivity ? ` ${result.activity} activity event${result.activity === 1 ? "" : "s"}` : ""}
            {result.includeActivity && result.includeAttendance ? " and" : ""}
            {result.includeAttendance ? ` ${result.attendance} attendance day${result.attendance === 1 ? "" : "s"}` : ""}
            {" "}older than {result.months} months.
          </div>
        )}
        {stage === null && error && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 8,
            background: `${PURGE_AMBER}14`, border: `1px solid ${PURGE_AMBER}40`,
            fontSize: fs(11, isDesktop), color: th.text,
          }}>
            {error}
          </div>
        )}
      </div>

      {stage && (
        <PurgeModal
          dark={dark} isDesktop={isDesktop} stage={stage}
          cutoffLabel={cutoffLabel()}
          includeActivity={includeActivity} includeAttendance={includeAttendance}
          animCounts={{ activity: animActivity, attendance: animAttendance }}
          confirmText={confirmText} setConfirmText={setConfirmText}
          logLines={logLines} progressPct={progressPct} deletedSoFar={deletedSoFar} totalToDelete={totalToDelete}
          result={result} error={error}
          onCancel={closeModal} onConfirm={runPurge} onClose={closeModal}
          logBoxRef={logBoxRef}
        />
      )}
    </div>
  );
}

// ─── PRESENCE SORT RANK (module-level constant, not re-created per render) ────
const STATE_RANK = { online: 0, idle: 1, offline: 2 };

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Anomaly Toast — auto-dismissing pop-up for a newly-detected issue
// ═════════════════════════════════════════════════════════════════════════════
function AnomalyToast({ toast, onDismiss, dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  const DURATION = 8000;
  const [progress, setProgress] = useState(100); // 100 → 0, drives the bar width
  const [paused, setPaused] = useState(false);
  const rafRef       = useRef(null);
  const startRef     = useRef(null);
  const remainingRef = useRef(DURATION);
  const progressRef  = useRef(100);

  useEffect(() => {
    if (paused) return;
    function tick(now) {
      if (startRef.current == null) startRef.current = now;
      const elapsed = now - startRef.current;
      const left = Math.max(0, remainingRef.current - elapsed);
      const pct = (left / DURATION) * 100;
      progressRef.current = pct;
      setProgress(pct);
      if (left <= 0) { onDismiss(toast.id); return; }
      rafRef.current = requestAnimationFrame(tick);
    }
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, toast.id, onDismiss]);

  function handlePause() {
    remainingRef.current = (progressRef.current / 100) * DURATION;
    setPaused(true);
  }

  return (
    <div
      onMouseEnter={handlePause}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 320,
        background: dark ? "rgba(28,28,30,0.86)" : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        border: `1px solid ${toast.color}40`,
        borderRadius: 12,
        padding: "11px 12px 9px",
        boxShadow: dark
          ? `0 10px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 18px ${toast.color}22`
          : `0 10px 28px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 0 18px ${toast.color}1a`,
        animation: "agnt-toast-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
        pointerEvents: "auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* corner brackets — HUD framing accent */}
      <div style={{ position:"absolute", top:0, left:0, width:10, height:10, borderTop:`1.5px solid ${toast.color}99`, borderLeft:`1.5px solid ${toast.color}99`, borderTopLeftRadius:12 }} />
      <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderBottom:`1.5px solid ${toast.color}55`, borderRight:`1.5px solid ${toast.color}55`, borderBottomRightRadius:12 }} />

      {/* scanline sweep — reuses the dashboard's agnt-scan beam for a techy pulse */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{
          position:"absolute", top:0, left:0, width:"40%", height:"100%",
          background:`linear-gradient(90deg, transparent, ${toast.color}14, transparent)`,
          animation: "agnt-scan 3.2s ease-in-out infinite",
        }}/>
      </div>

      <div style={{ display:"flex", alignItems:"flex-start", gap:8, position:"relative" }}>
        <div style={{ position:"relative", width:18, height:18, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{
            position:"absolute", width:18, height:18, borderRadius:"50%",
            background: `${toast.color}22`, animation: "agnt-pulse 1.6s ease-in-out infinite",
          }}/>
          <IconAlert size={11} color={toast.color} style={{ position:"relative" }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize:fs(8, isDesktop), fontWeight:800, color:toast.color, fontFamily:"monospace",
            letterSpacing:1, textTransform:"uppercase", opacity:0.85, marginBottom:2,
          }}>
            Anomaly · Live
          </div>
          <div style={{ fontSize:fs(10.5, isDesktop), fontWeight:800, color:th.text, fontFamily:"monospace", letterSpacing:-0.1 }}>
            {toast.agentName} <span style={{ color:toast.color }}>— {toast.label}</span>
          </div>
          {toast.detail && (
            <div style={{ fontSize:fs(9, isDesktop), color:th.textSub, marginTop:2, fontFamily:"monospace" }}>
              {toast.detail}
            </div>
          )}
        </div>
        <div
          onClick={() => onDismiss(toast.id)}
          {...activatable(() => onDismiss(toast.id), "Dismiss alert")}
          style={{ cursor:"pointer", color:th.textSub, fontSize:13, lineHeight:1, padding:2, flexShrink:0 }}
        >
          ×
        </div>
      </div>

      <div style={{ height:2.5, marginTop:8, borderRadius:1, background: dark?"#2c2c2e":"#eee", overflow:"hidden", position:"relative" }}>
        <div style={{
          height:"100%",
          background: `linear-gradient(90deg, ${toast.color}99, ${toast.color})`,
          boxShadow: `0 0 6px ${toast.color}99`,
          width: `${progress}%`,
        }}/>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Connection Error Banner — surfaces Firestore listener failures
// (permission errors, dropped connections) instead of letting them fail
// silently into what looks like "everyone's offline". onSnapshot retries
// automatically in the background, so this is informational, not actionable.
// ═════════════════════════════════════════════════════════════════════════════
function ConnErrorBanner({ errors, dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  const count = Object.keys(errors).length;
  if (count === 0) return null;
  const RED = "#EF4444";
  return (
    <div style={{
      position: "relative",
      marginBottom: 14,
      border: `1px solid ${RED}40`,
      borderRadius: 12,
      overflow: "hidden",
      padding: "10px 12px",
      display: "flex", alignItems: "center", gap: 9,
      background: dark ? "rgba(28,28,30,0.8)" : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      boxShadow: dark ? `0 6px 18px rgba(0,0,0,0.3), 0 0 16px ${RED}1a` : `0 6px 18px rgba(0,0,0,0.06), 0 0 16px ${RED}14`,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${RED}, ${RED}00 85%)`, boxShadow:`0 0 8px ${RED}80` }}/>

      <div style={{ position:"relative", width:18, height:18, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"absolute", width:18, height:18, borderRadius:"50%", background:`${RED}22`, animation:"agnt-pulse 1.6s ease-in-out infinite" }}/>
        <IconAlert size={12} color={RED} style={{ position:"relative" }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:fs(11.5, isDesktop), fontWeight:800, color:RED, fontFamily:"monospace", letterSpacing:0.2 }}>
          Live data unavailable
        </div>
        <div style={{ fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace", marginTop:1, display:"flex", alignItems:"center", gap:5 }}>
          <span>{count} feed{count > 1 ? "s" : ""} disconnected</span>
          <span style={{ width:4, height:4, borderRadius:"50%", background:RED, animation:"agnt-pulse 1s ease-in-out infinite", flexShrink:0 }}/>
          <span>reconnecting automatically</span>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Anomaly Banner — persistent summary of currently-active issues
// ═════════════════════════════════════════════════════════════════════════════
function AnomalyBanner({ anomalies, dark, isDesktop, muted, onToggleMute, notifPermission, onRequestDesktop, onJump }) {
  const th = THEME[dark ? "dark" : "light"];
  const [expanded, setExpanded] = useState(false);
  if (anomalies.length === 0) return null;

  const hasCritical = anomalies.some(a => a.anomaly.color === "#EF4444");
  const headColor   = hasCritical ? "#EF4444" : SAFFRON;

  return (
    <div style={{
      position: "relative",
      marginBottom: 14,
      border: `1px solid ${headColor}40`,
      borderRadius: 12,
      overflow: "hidden",
      background: dark ? "rgba(28,28,30,0.8)" : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      boxShadow: dark ? `0 6px 18px rgba(0,0,0,0.3), 0 0 16px ${headColor}1a` : `0 6px 18px rgba(0,0,0,0.06), 0 0 16px ${headColor}14`,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${headColor}, ${headColor}00 85%)`, boxShadow:`0 0 8px ${headColor}80`, zIndex:1 }}/>

      <div
        onClick={() => setExpanded(e => !e)}
        {...activatable(() => setExpanded(e => !e), `${anomalies.length} active alerts, ${expanded ? "collapse" : "expand"}`)}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", cursor:"pointer" }}
      >
        <div style={{ position:"relative", width:18, height:18, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", width:18, height:18, borderRadius:"50%", background:`${headColor}22`, animation:"agnt-pulse 1.6s ease-in-out infinite" }}/>
          <IconAlert size={12} color={headColor} style={{ position:"relative" }} />
        </div>
        <div style={{ fontSize:fs(11.5, isDesktop), fontWeight:800, color:headColor, fontFamily:"monospace", flex:1 }}>
          {anomalies.length} active alert{anomalies.length > 1 ? "s" : ""}
        </div>
        <div
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          {...activatable(onToggleMute, muted ? "Unmute alert sound" : "Mute alert sound")}
          style={{
            fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace",
            padding:"3px 8px", borderRadius:20, border:`1px solid ${th.border}`,
            cursor:"pointer", flexShrink:0,
          }}
        >
          {muted ? "🔇 muted" : "🔔 sound on"}
        </div>
        <div style={{
          fontSize:13, color:headColor, flexShrink:0,
          transform: expanded ? "rotate(180deg)" : "none", transition:"transform 0.2s",
        }}>
          ▾
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop:`1px solid ${headColor}30` }}>
          {anomalies.map(ag => {
            const key = agentKey(ag);
            return (
              <div
                key={key}
                onClick={() => onJump(key)}
                {...activatable(() => onJump(key), `Jump to ${ag.name}`)}
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"7px 12px", borderBottom:`1px solid ${th.border}`,
                  cursor:"pointer",
                }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:ag.anomaly.color, boxShadow:`0 0 5px ${ag.anomaly.color}99`, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0, overflow:"hidden" }}>
                  <span style={{ fontSize:fs(10.5, isDesktop), fontWeight:700, color:th.text }}>{ag.name}</span>
                  <span style={{ fontSize:fs(9, isDesktop), color:ag.anomaly.color, fontFamily:"monospace", marginLeft:6, fontWeight:700 }}>
                    {ag.anomaly.label}
                  </span>
                </div>
                <span style={{
                  fontSize:fs(8.5, isDesktop), color:th.textSub, fontFamily:"monospace", flexShrink:0,
                  maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>
                  {ag.anomaly.detail}
                </span>
              </div>
            );
          })}
          {notifPermission === "default" && (
            <div
              onClick={onRequestDesktop}
              {...activatable(onRequestDesktop, "Enable desktop notifications")}
              style={{
                padding:"7px 12px", fontSize:fs(9.5, isDesktop), color: dark?"#6fa3ff":NAVY,
                fontFamily:"monospace", cursor:"pointer", textDecoration:"underline",
              }}
            >
              → enable desktop notifications for alerts outside this tab
            </div>
          )}
          {notifPermission === "denied" && (
            <div style={{ padding:"7px 12px", fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace" }}>
              Desktop notifications blocked — enable in browser site settings.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: AgentsTab
// ═════════════════════════════════════════════════════════════════════════════
export default function AgentsTab({ dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];

  const [humanAgents, setHumanAgents] = useState([]);
  const [aiStatus,    setAiStatus]    = useState({});
  const [activities,  setActivities]  = useState([]);
  const [todayLogs,   setTodayLogs]   = useState([]);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [, forceRender]               = useState(0); // 30-s tick
  // IST date string as state (not a plain render-time variable) so the
  // agentTimeLogs listener below can resubscribe when the day rolls over —
  // otherwise a dashboard left open past midnight keeps querying yesterday's
  // date forever and anomaly detection silently goes stale.
  const [todayStr, setTodayStr] = useState(() => getISTDateStr());

  // ── Live-data health: per-listener errors + first-payload flags ──────────
  // Firestore's onSnapshot fails silently by default (no error callback means
  // a permissions/network drop just looks like "zero data"). connErrors keys
  // a listener name to its latest error so the banner can say *something* is
  // wrong without claiming to know which; *Loaded flags gate the "no X yet"
  // empty states so a slow first payload doesn't flash a false-empty message.
  const [connErrors,     setConnErrors]     = useState({});
  const [presenceLoaded, setPresenceLoaded] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);

  const setListenerError = useCallback((source, err) => {
    setConnErrors(prev => {
      if (!err) {
        if (!(source in prev)) return prev; // no-op, avoids an extra render
        const next = { ...prev };
        delete next[source];
        return next;
      }
      return { ...prev, [source]: err.message || String(err) };
    });
  }, []);

  // ── Proactive anomaly alerts: toast queue, mute pref, desktop-notif perm ──
  const [toasts,          setToasts]          = useState([]);
  const [muted,           setMuted]           = useState(() => {
    try { return localStorage.getItem("agt_alert_muted") === "true"; } catch { return false; }
  });
  const [notifPermission, setNotifPermission] = useState(() =>
    (typeof Notification !== "undefined") ? Notification.permission : "unsupported"
  );
  const [highlightedId,   setHighlightedId]   = useState(null);
  const prevAnomalyMapRef = useRef(null); // null = baseline not yet captured
  const originalTitleRef  = useRef(typeof document !== "undefined" ? document.title : "");

  const toggleMuted = useCallback(() => {
    setMuted(m => {
      const next = !m;
      try { localStorage.setItem("agt_alert_muted", String(next)); } catch {}
      return next;
    });
  }, []);

  const requestDesktopAlerts = useCallback(() => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(perm => setNotifPermission(perm));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const jumpToAgent = useCallback((key) => {
    const el = typeof document !== "undefined" ? document.getElementById(`agent-card-${key}`) : null;
    if (el) el.scrollIntoView({ behavior:"smooth", block:"center" });
    setHighlightedId(key);
    setTimeout(() => setHighlightedId(h => (h === key ? null : h)), 1800);
  }, []);

  // ── 30-second re-render tick (keeps "X m ago" and online status fresh) ────
  // Also re-derives todayStr so a day rollover propagates to the time-logs
  // listener below without needing a page reload.
  useEffect(() => {
    const t = setInterval(() => {
      forceRender(n => n + 1);
      setTodayStr(prev => {
        const now = getISTDateStr();
        return now !== prev ? now : prev;
      });
    }, PRESENCE_TICK_MS);
    return () => clearInterval(t);
  }, []);

  // ── Listen: adminPresence → human agents ──────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "adminPresence"),
      snap => {
        setHumanAgents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPresenceLoaded(true);
        setListenerError("presence", null);
      },
      err => {
        console.warn("[AgentsTab] adminPresence listener failed:", err);
        setPresenceLoaded(true); // stop showing skeletons — show the error banner instead
        setListenerError("presence", err);
      }
    );
    return unsub;
  }, [setListenerError]);

  // ── Listen: adminMeta/aiStatus → AI agent last-active timestamps ──────────
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "adminMeta", "aiStatus"),
      snap => {
        if (snap.exists()) setAiStatus(snap.data());
        setListenerError("aiStatus", null);
      },
      err => {
        console.warn("[AgentsTab] aiStatus listener failed:", err);
        setListenerError("aiStatus", err);
      }
    );
    return unsub;
  }, [setListenerError]);

  // ── Listen: adminActivity (last 30 events) ────────────────────────────────
  useEffect(() => {
    const q    = query(collection(db, "adminActivity"), orderBy("time","desc"), limit(30));
    const unsub = onSnapshot(
      q,
      snap => {
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setActivityLoaded(true);
        setListenerError("activity", null);
      },
      err => {
        console.warn("[AgentsTab] adminActivity listener failed:", err);
        setActivityLoaded(true);
        setListenerError("activity", err);
      }
    );
    return unsub;
  }, [setListenerError]);

  // ── Listen: today's time logs (for anomaly detection) ────────────────────
  // Depends on todayStr (state, refreshed by the 30s tick above) so this
  // resubscribes with the new date automatically at midnight IST instead of
  // silently querying a stale date until the page is reloaded.
  useEffect(() => {
    const q = query(collection(db, "agentTimeLogs"), where("date", "==", todayStr));
    const unsub = onSnapshot(
      q,
      snap => {
        setTodayLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setListenerError("timeLogs", null);
      },
      err => {
        console.warn("[AgentsTab] agentTimeLogs listener failed:", err);
        setListenerError("timeLogs", err);
      }
    );
    return unsub;
  }, [todayStr, setListenerError]);

  // ── Enrich AI agents with live status + health stats ─────────────────────
  // todayStr is state now (see above) — refreshed by the 30s tick, so this
  // memo and the listener above both pick up a midnight rollover automatically.
  const enrichedAI = useMemo(() =>
    AI_AGENTS.map(ag => {
      if (ag.id === "groq-ai") {
        const sameDay = (field) => aiStatus[field] === todayStr;
        return {
          ...ag,
          lastSeen:         aiStatus.groqLastActive              || null,
          activeKeyIdx:     aiStatus.groqActiveKeyIdx            ?? -1,
          callsToday:       sameDay("groqCallsDate")      ? (aiStatus.groqCallsToday        || 0) : 0,
          i429Today:        sameDay("groq429Date")         ? (aiStatus.groq429Today          || 0) : 0,
          keys429Today:     sameDay("groq429KeysDate")     ? (aiStatus.groq429KeysToday      || []) : [],
          last429At:        aiStatus.groqLast429At                || null,
          webSearchesToday: sameDay("groqWebSearchesDate") ? (aiStatus.groqWebSearchesToday  || 0) : 0,
          keyCount:         5,   // GROQ_API_KEY_1 … GROQ_API_KEY_5
        };
      }
      if (ag.id === "tavily-api") {
        return {
          ...ag,
          lastSeen:   aiStatus.tavilyLastActive                           || null,
          callsToday: aiStatus.tavilyCallsDate === todayStr ? (aiStatus.tavilyCallsToday || 0) : 0,
        };
      }
      if (ag.id === "groq-verify") {
        const sameDay = (field) => aiStatus[field] === todayStr;
        return {
          ...ag,
          lastSeen:     aiStatus.groqVerifyLastActive          || null,
          activeKeyIdx: aiStatus.groqVerifyActiveKeyIdx         ?? -1,
          callsToday:   sameDay("groqVerifyCallsDate")  ? (aiStatus.groqVerifyCallsToday   || 0) : 0,
          i429Today:    sameDay("groqVerify429Date")     ? (aiStatus.groqVerify429Today     || 0) : 0,
          keys429Today: sameDay("groqVerify429KeysDate") ? (aiStatus.groqVerify429KeysToday || []) : [],
          last429At:    aiStatus.groqVerifyLast429At           || null,
          keyCount:     3,   // GROQ_VERIFY_KEY, GROQ_VERIFY_KEY_1, GROQ_VERIFY_KEY_2
        };
      }
      if (ag.id === "tavily-verify") {
        return {
          ...ag,
          lastSeen:   aiStatus.tavilyVerifyLastActive                                  || null,
          callsToday: aiStatus.tavilyVerifyCallsDate === todayStr ? (aiStatus.tavilyVerifyCallsToday || 0) : 0,
        };
      }
      return { ...ag, lastSeen: aiStatus[ag.firestoreKey] || null };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [aiStatus, todayStr]);

  // ── Merge all agents + attach anomaly flags ───────────────────────────────
  const allAgents = useMemo(() => [
    ...humanAgents.map(ag => {
      const uid      = ag.uid || ag.id;
      const todayLog = todayLogs.find(l => l.uid === uid) || null;
      return { ...ag, anomaly: getAnomalyFlag(ag, todayLog) };
    }),
    ...enrichedAI.map(ag => ({ ...ag, anomaly: getAnomalyFlag(ag, null) })),
  ], [humanAgents, enrichedAI, todayLogs]);

  // ── Currently-active anomalies (for the persistent banner) ───────────────
  const activeAnomalies = useMemo(() => allAgents.filter(a => a.anomaly), [allAgents]);

  // ── Proactive alerts: diff against last snapshot, toast + chime + notify
  //    only for NEW or CHANGED anomalies — never re-fires for steady-state
  //    issues that were already there before this session opened the tab. ──
  useEffect(() => {
    const currentMap = {};
    allAgents.forEach(ag => {
      const key = agentKey(ag);
      if (key) currentMap[key] = ag.anomaly ? ag.anomaly.label : null;
    });

    // First run after mount — capture baseline only, don't toast pre-existing issues
    if (prevAnomalyMapRef.current === null) {
      prevAnomalyMapRef.current = currentMap;
      return;
    }

    const prevMap = prevAnomalyMapRef.current;
    const fresh = [];
    allAgents.forEach(ag => {
      const key = agentKey(ag);
      if (!key || !ag.anomaly) return;
      if (prevMap[key] !== ag.anomaly.label) {
        fresh.push({
          id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          agentKey: key,
          agentName: ag.name || "Agent",
          label: ag.anomaly.label,
          detail: ag.anomaly.detail,
          color: ag.anomaly.color,
        });
      }
    });

    if (fresh.length > 0) {
      setToasts(ts => [...ts, ...fresh].slice(-5)); // cap visible stack
      if (!muted) playAlertChime();
      if (notifPermission === "granted" && typeof document !== "undefined" && document.hidden) {
        fresh.forEach(t => {
          try {
            new Notification(`⚠ ${t.agentName}: ${t.label}`, {
              body: t.detail || "Agent Monitor — YojanaSahay Admin",
              tag: t.agentKey, // collapses repeat notifications per agent
            });
          } catch {}
        });
      }
    }

    prevAnomalyMapRef.current = currentMap;
  }, [allAgents, muted, notifPermission]);

  // ── Background-tab title flash — catches attention if admin alt-tabbed ───
  useEffect(() => {
    if (typeof document === "undefined") return;
    const updateTitle = () => {
      document.title = (document.hidden && activeAnomalies.length > 0)
        ? `(${activeAnomalies.length}) ⚠ ${originalTitleRef.current}`
        : originalTitleRef.current;
    };
    updateTitle();
    document.addEventListener("visibilitychange", updateTitle);
    return () => {
      document.removeEventListener("visibilitychange", updateTitle);
      document.title = originalTitleRef.current;
    };
  }, [activeAnomalies.length]);

  // ── Summary counts ────────────────────────────────────────────────────────
  const onlineCount = useMemo(() =>
    allAgents.filter(a => getPresenceState(a.lastSeen, a.type) !== "offline").length,
  [allAgents]);

  // ── Filter + Sort (online → idle → offline, then by lastSeen desc) ──────
  // Also applies name search; STATE_RANK is hoisted to module scope above.
  const displayAgents = useMemo(() =>
    allAgents
      .filter(ag => {
        if (filter === "online") return getPresenceState(ag.lastSeen, ag.type) !== "offline";
        if (filter === "human")  return ag.type === "human";
        if (filter === "ai")     return ag.type === "ai";
        return true;
      })
      .filter(ag =>
        !search.trim() ||
        (ag.name || "").toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort((a, b) => {
        const rankA = STATE_RANK[getPresenceState(a.lastSeen, a.type)];
        const rankB = STATE_RANK[getPresenceState(b.lastSeen, b.type)];
        if (rankA !== rankB) return rankA - rankB;
        const tA = toDate(a.lastSeen)?.getTime() || 0;
        const tB = toDate(b.lastSeen)?.getTime() || 0;
        return tB - tA;
      }),
  [allAgents, filter, search]);

  // ── Split into sections: Team (humans) / AI Chat (main app pool) /
  //    Verify Pipeline (admin SchemeVerifier pool) — keeps the two separate
  //    Groq+Tavily key pools visually distinct instead of one blended grid.
  const teamAgents   = useMemo(() => displayAgents.filter(a => a.type === "human"), [displayAgents]);
  const chatAgents   = useMemo(() => displayAgents.filter(a => CHAT_AI_IDS.has(a.id)),   [displayAgents]);
  const verifyAgents = useMemo(() => displayAgents.filter(a => VERIFY_AI_IDS.has(a.id)), [displayAgents]);

  // Renders one section's grid of cards — shared by all three sections below.
  // auto-fit (not auto-fill): auto-fill reserves empty 280px+ column tracks
  // even when a section has fewer cards than fit in a row (e.g. AI Chat and
  // Verify Pipeline only have 2 each), which starves the real cards down to
  // minimum width and truncates names while leaving dead space on the right.
  // auto-fit collapses those empty tracks so the real cards' 1fr can stretch
  // to fill the row.
  const renderAgentGrid = (list) => (
    <div style={{
      display:"grid",
      gridTemplateColumns: isDesktop ? "repeat(auto-fit, minmax(280px, 1fr))" : "1fr",
      gap:10,
    }}>
      {list.map(ag => {
        const key = agentKey(ag);
        return (
          <div
            key={key}
            id={`agent-card-${key}`}
            style={{
              borderRadius:14,
              transition:"box-shadow 0.3s, transform 0.3s",
              boxShadow: highlightedId === key ? `0 0 0 3px ${ag.anomaly?.color || NAVY}66` : "none",
              transform: highlightedId === key ? "scale(1.015)" : "scale(1)",
            }}
          >
            <AgentCard agent={ag} dark={dark} isDesktop={isDesktop} />
          </div>
        );
      })}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isDesktop ? "20px 32px" : "14px 14px 40px" }}>

      {/* ── Keyframes ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes agnt-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.72)} }
        @keyframes agnt-scan     { 0%{transform:translateX(-100%)} 100%{transform:translateX(600%)} }
        @keyframes agnt-fade-in  { 0%{opacity:0;transform:translateY(3px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes agnt-toast-in { 0%{opacity:0;transform:translateY(-8px) scale(0.97)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes agnt-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes agnt-spin     { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes agnt-modal-in { 0%{opacity:0;transform:scale(0.94) translateY(10px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes agnt-cursor   { 0%,50%{opacity:1} 51%,100%{opacity:0} }

        /* Purge modal — fixed full-screen overlay, deliberately its own
           "control room" surface (violet/cyan/amber/emerald) rather than
           a reuse of the dashboard's tricolor identity. */
        .agnt-purge-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px) saturate(140%);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: agnt-fade-in 0.18s ease both;
        }
        .agnt-purge-panel {
          position: relative;
          width: 100%; max-width: 420px; max-height: 88vh;
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          animation: agnt-modal-in 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        .agnt-purge-cursor { animation: agnt-cursor 1s steps(1) infinite; }

        /* Attendance export modal — same structural pattern as the purge
           modal above, kept as its own class so the two stay conceptually
           separate (navy "official report" vs violet "control room"). */
        .agnt-export-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px) saturate(140%);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: agnt-fade-in 0.18s ease both;
        }
        .agnt-export-panel {
          position: relative;
          width: 100%; max-width: 420px; max-height: 88vh;
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          animation: agnt-modal-in 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Toast wrap: width is CSS-driven (not the isDesktop JS flag) so it stays
           compact on desktop even if that flag is stale during resize/hydration. */
        .agnt-toast-wrap {
          position: fixed;
          top: 16px;
          right: 16px;
          left: auto;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
          pointer-events: none;
          width: 320px;
          max-width: calc(100vw - 32px);
        }
        @media (max-width: 640px) {
          .agnt-toast-wrap {
            top: 54px;
            right: 10px;
            left: 10px;
            width: auto;
            align-items: stretch;
          }
        }
      `}</style>

      {/* ── Proactive alert toasts — fixed overlay, newest at bottom of stack ── */}
      {toasts.length > 0 && (
        <div className="agnt-toast-wrap">
          {toasts.map(t => (
            <AnomalyToast key={t.id} toast={t} onDismiss={dismissToast} dark={dark} isDesktop={isDesktop} />
          ))}
        </div>
      )}

      {/* ── Page title ───────────────────────────────────────────────── */}
      <div style={{ marginBottom:16, display:"flex", alignItems:"flex-start", gap:9 }}>
        <div style={{
          width:30, height:30, borderRadius:9, flexShrink:0, marginTop:1,
          background:`${NAVY}16`, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <IconRadar size={16} color={dark ? "#6fa3ff" : NAVY} />
        </div>
        <div>
          <div style={{ fontSize:fs(15, isDesktop), fontWeight:800, color:th.text, letterSpacing:-0.2 }}>
            Agent Monitor
          </div>
          <div style={{ fontSize:fs(11, isDesktop), color:th.textSub, marginTop:3 }}>
            Live presence · session tracking · activity feed · access control
          </div>
        </div>
      </div>

      {/* ── Live-data connection banner — surfaces listener failures ────── */}
      <ConnErrorBanner errors={connErrors} dark={dark} isDesktop={isDesktop} />

      {/* ── Active anomaly banner — persistent, not just a toast ────────── */}
      <AnomalyBanner
        anomalies={activeAnomalies}
        dark={dark}
        isDesktop={isDesktop}
        muted={muted}
        onToggleMute={toggleMuted}
        notifPermission={notifPermission}
        onRequestDesktop={requestDesktopAlerts}
        onJump={jumpToAgent}
      />

      {/* ── Summary stat row ─────────────────────────────────────────── */}
      <div style={{
        display:"grid",
        gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)",
        gap:8, marginBottom:14,
      }}>
        {[
          { label:"Total Agents",  value:allAgents.length,    color:NAVY,      Icon:IconUsers,     tooltip:"All agents (human + AI) tracked by this dashboard" },
          { label:"Online Now",    value:onlineCount,          color:IND_GREEN, Icon:IconPulse,     tooltip:"Active in last 2 min (humans) or 15 min (AI agents)" },
          { label:"Human Admins",  value:humanAgents.length,  color:SAFFRON,   Icon:IconUserCheck, tooltip:"Sub-admins connected via Firestore heartbeat" },
          { label:"AI Agents",     value:enrichedAI.length,   color:VIOLET,    Icon:IconCpu,       tooltip:"Groq & Tavily — updated per API call" },
        ].map(s => (
          <StatCard key={s.label} {...s} dark={dark} isDesktop={isDesktop} />
        ))}
      </div>

      {/* ── NIC-style scrolling ticker ───────────────────────────────── */}
      <ActivityTicker activities={activities} todayStr={todayStr} dark={dark} isDesktop={isDesktop} />

      {/* ── Search + Filter row ──────────────────────────────────────── */}
      {/* Search input */}
      <div style={{
        position: "relative", marginBottom: 8,
      }}>
        <svg
          width={13} height={13} viewBox="0 0 24 24" fill="none"
          style={{
            position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
            color: th.textSub,
          }}
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M16.5 16.5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search agents by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "7px 32px 7px 30px",
            background: th.inputBg,
            border: `1px solid ${search ? NAVY + "70" : th.border}`,
            borderRadius: 9,
            color: th.text, fontSize: fs(12, isDesktop),
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />
        {search && (
          <div
            onClick={() => setSearch("")}
            style={{
              position: "absolute", right: 9, top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer", color: th.textSub,
              fontSize: 14, lineHeight: 1, padding: 2,
              userSelect: "none",
            }}
          >
            ✕
          </div>
        )}
      </div>

      {/* ── Filter chips ─────────────────────────────────────────────── */}
      <div style={{
        display:"flex", gap:6, flexWrap:"wrap", marginBottom:12, alignItems:"center",
      }}>
        {[
          { key:"all",    label:"All" },
          { key:"online", label:"Online" },
          { key:"human",  label:"Human" },
          { key:"ai",     label:"AI" },
        ].map(f => (
          <div
            key={f.key}
            onClick={() => setFilter(f.key)}
            {...activatable(() => setFilter(f.key), `Filter: ${f.label}`)}
            aria-pressed={filter === f.key}
            style={{
            padding:"4px 12px", borderRadius:20, cursor:"pointer",
            background:filter===f.key ? NAVY : (dark?"#252527":"#f0f0f0"),
            color:filter===f.key ? "#fff" : th.textMid,
            fontSize:fs(11, isDesktop), fontWeight:700,
            border:`1px solid ${filter===f.key ? NAVY : th.border}`,
            transition:"all 0.15s",
            userSelect:"none",
          }}>
            {f.label}
          </div>
        ))}
        <div style={{
          marginLeft:"auto", fontSize:fs(9, isDesktop), color:th.textSub, fontFamily:"monospace",
        }}>
          auto-refresh 30s
        </div>
      </div>

      {/* ── Agent Cards — sectioned: Team / AI Chat / Verify Pipeline ──── */}
      {displayAgents.length === 0 ? (
        <div style={{
          background:th.card,
          border:`1px dashed ${th.border}`,
          borderRadius:12, padding:"28px",
          textAlign:"center", color:th.textSub, fontSize:fs(12, isDesktop),
        }}>
          {search
            ? `No agents named "${search}" — try a different search.`
            : "No agents match this filter."}
        </div>
      ) : (
        <>
          {teamAgents.length > 0 && (
            <SectionFrame
              label="Team"
              sublabel="human sub-admins · firestore heartbeat"
              color={SAFFRON}
              dark={dark}
              isDesktop={isDesktop}
            >
              {renderAgentGrid(teamAgents)}
            </SectionFrame>
          )}

          {chatAgents.length > 0 && (
            <SectionFrame
              label="AI Chat"
              sublabel="groq k1–k5 · tavily — in-app assistant pool"
              color={VIOLET}
              dark={dark}
              isDesktop={isDesktop}
            >
              {renderAgentGrid(chatAgents)}
            </SectionFrame>
          )}

          {verifyAgents.length > 0 && (
            <SectionFrame
              label="Verify Pipeline"
              sublabel="dedicated groq_verify_key · tavily_verify_key — admin schemeverifier + ai insights"
              color={IND_GREEN}
              dark={dark}
              isDesktop={isDesktop}
            >
              {renderAgentGrid(verifyAgents)}
            </SectionFrame>
          )}
        </>
      )}

      {/* ── Attendance + Notice Board — two-column row on desktop ───────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
        gap: 14, marginTop: 14,
      }}>
        <AttendanceSection humanAgents={humanAgents} dark={dark} isDesktop={isDesktop} loading={!presenceLoaded} />
        <NoticeBoard activities={activities} humanAgents={humanAgents} dark={dark} isDesktop={isDesktop} loading={!presenceLoaded || !activityLoaded} />
      </div>

      {/* ── Activity Log ─────────────────────────────────────────────── */}
      <ActivityLogSection dark={dark} isDesktop={isDesktop} />

      {/* ── Data Retention ───────────────────────────────────────────── */}
      <DataRetentionPanel dark={dark} isDesktop={isDesktop} />

      {/* ── Firestore info footer ─────────────────────────────────────── */}
      <div style={{
        marginTop:14, padding:"10px 12px",
        background: dark ? "#0a0c14" : "#f4f5fb",
        border:`1px solid ${th.border}`,
        borderRadius:10,
        fontFamily:"monospace", fontSize:fs(9, isDesktop), color:th.textSub, lineHeight:1.7,
        display:"flex", gap:7,
      }}>
        <IconInfo size={12} color={dark?"#6fa3ff":NAVY} style={{ flexShrink:0, marginTop:1 }} />
        <span>
          <span style={{ color: dark?"#6fa3ff":NAVY, fontWeight:800, letterSpacing:0.5 }}>NOTE:</span>
          {" "}Human admins appear automatically when they open the dashboard.
          AI agents update via <span style={{ color:th.text }}>adminMeta/aiStatus</span> (written
          by serverless routes). Log custom events with{" "}
          <span style={{ color:VIOLET }}>logAdminActivity(uid, name, action, tab, type)</span>.
        </span>
      </div>
    </div>
  );
}
