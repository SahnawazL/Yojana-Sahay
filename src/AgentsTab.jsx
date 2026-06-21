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
 *  - Timeline activity log (last 30 events)
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
import {
  collection, doc, setDoc, getDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp, addDoc, increment,
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
  const mins = Math.floor((e - s) / 60000);
  if (mins < 1)  return "< 1m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), r = mins % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}

function isOnline(lastSeen, thresholdMins = 2) {
  const d = toDate(lastSeen);
  if (!d) return false;
  return (Date.now() - d.getTime()) < thresholdMins * 60 * 1000;
}

// Three-state presence: "online" | "idle" | "offline"
// Human : online = <2 min · idle = 2–5 min · offline = >5 min
// AI    : online = <15 min                 · offline = >15 min
function getPresenceState(lastSeen, type = "human") {
  const d = toDate(lastSeen);
  if (!d) return "offline";
  const minsAgo = (Date.now() - d.getTime()) / 60000;
  if (type === "ai") return minsAgo < 15 ? "online" : "offline";
  if (minsAgo < 2)  return "online";
  if (minsAgo < 5)  return "idle";
  return "offline";
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

  // Mount: write sessionStart, kick off 30s heartbeat
  useEffect(() => {
    if (!uid) return;
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
    intervalRef.current = setInterval(() => beat(), 30000);
    return () => {
      clearInterval(intervalRef.current);
      // Mark offline on unmount (best-effort)
      setDoc(doc(db, "adminPresence", uid), {
        isOnline: false, lastSeen: serverTimestamp(),
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
function ActivityTicker({ activities, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [paused, setPaused] = useState(false);
  const [idx,    setIdx]    = useState(0);

  useEffect(() => {
    if (paused || activities.length <= 1) return;
    const t = setInterval(() => {
      setIdx(i => (i + 1) % activities.length);
    }, 3800);
    return () => clearInterval(t);
  }, [paused, activities.length]);

  // Clamp index if the activities list shrinks (e.g. after a refresh)
  useEffect(() => {
    if (idx >= activities.length) setIdx(0);
  }, [activities.length, idx]);

  if (!activities.length) return null;
  const act = activities[idx];

  return (
    <div style={{
      border:       `1px solid ${th.border}`,
      borderRadius: 10,
      overflow:     "hidden",
      background:   th.card,
      marginBottom: 14,
    }}>
      {/* Header bar — neutral, no accent color, no pulse */}
      <div style={{
        padding:    "5px 12px",
        display:    "flex", alignItems: "center", gap: 8,
        borderBottom: `1px solid ${th.border}`,
      }}>
        <IconRadio size={11} color={th.textSub} style={{ flexShrink:0 }} />
        <span style={{
          fontFamily:"monospace", fontSize: 9, fontWeight: 800,
          color: th.textMid, letterSpacing: 1.8, textTransform: "uppercase",
        }}>
          LIVE FEED
        </span>
        <span style={{ marginLeft:"auto", fontSize: 9, color: th.textSub, fontFamily:"monospace" }}>
          {idx + 1}/{activities.length} · hover to pause
        </span>
      </div>

      {/* Stable single-event display — crossfades on rotation, no horizontal motion */}
      <div
        style={{ position:"relative", height: 38, padding: "0 14px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(p => !p)}
      >
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
            background: ACT_COLORS[act.type] || "#aaa",
          }}/>
          <span style={{ fontWeight: 700, color: th.text, fontSize: 12 }}>{act.agentName}</span>
          <span style={{ color: th.textSub }}>·</span>
          <span style={{ color: th.textMid, fontSize: 12, overflow:"hidden", textOverflow:"ellipsis" }}>{act.action}</span>
          <span style={{
            padding:"1px 5px", borderRadius: 4, fontSize: 8,
            background: `${ACT_COLORS[act.type] || "#aaa"}18`,
            color: ACT_COLORS[act.type] || "#aaa",
            fontFamily:"monospace", fontWeight: 700, flexShrink: 0,
          }}>
            {TAB_LABELS[act.tab] || act.tab}
          </span>
          <span style={{ color: th.textSub, fontSize: 9, fontFamily:"monospace", marginLeft:"auto", flexShrink: 0 }}>
            {timeAgo(act.time)}
          </span>
        </div>

        {/* Progress dots — replaces scroll motion as the "things are moving" cue */}
        {activities.length > 1 && (
          <div style={{ position:"absolute", bottom: 3, left: 14, display:"flex", gap: 3 }}>
            {activities.slice(0, 8).map((_, i) => (
              <div key={i} style={{
                width: i === idx ? 10 : 4, height: 3, borderRadius: 2,
                background: i === idx ? th.textMid : th.border,
                transition: "width 0.3s ease, background 0.3s ease",
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
function NoticeBoard({ activities, humanAgents, dark }) {
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
      marginTop: 14,
      border:    `1px solid ${th.border}`,
      borderRadius: 13,
      overflow:  "hidden",
      background: th.card,
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
          fontFamily:"monospace", fontSize: 9, fontWeight: 800,
          color: th.textMid, letterSpacing: 1.8, textTransform: "uppercase",
        }}>
          [ NOTICE_BOARD ]
        </span>
        <span style={{
          marginLeft:"auto", fontSize:9, color: th.textSub, fontFamily:"monospace",
        }}>
          {notices.length} active
        </span>
      </div>

      {/* Notice rows */}
      <div style={{
        background: th.card,
        padding: "8px 0",
        minHeight: 80,
      }}>
        {notices.length === 0 ? (
          <div style={{
            padding:"20px 14px", textAlign:"center",
            color: th.textSub, fontSize: 11,
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
                  fontSize: 11,
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
                    fontSize:9, color: th.textSub, fontFamily:"monospace", marginTop:1,
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
                    fontSize:8, fontWeight:800, fontFamily:"monospace",
                    letterSpacing:0.5,
                  }}>
                    [NEW]
                  </span>
                )}
                <span style={{ fontSize:9, color:th.textSub, fontFamily:"monospace" }}>
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
function GroqKeyGrid({ activeKeyIdx, keys429Today, keyCount = 5, dark }) {
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
            fontSize: 9, fontWeight: 700, fontFamily: "monospace",
            color: col, display: "flex", alignItems: "center", gap: 5,
            userSelect: "none", cursor: "default",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: col, flexShrink: 0 }} />
            K{i + 1}
            {isActive && (
              <span style={{ fontSize: 6.5, letterSpacing: 0.5, opacity: 0.75 }}>ACTIVE</span>
            )}
            {!isActive && was429 && (
              <span style={{ fontSize: 6.5, letterSpacing: 0.5, opacity: 0.75 }}>429</span>
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
function SectionLabel({ label, sublabel, color, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:9, flexWrap:"wrap" }}>
      <div style={{
        display:"flex", alignItems:"center", gap:7,
        fontSize:11, fontWeight:800, color:th.text,
        letterSpacing:1.4, textTransform:"uppercase", fontFamily:"monospace",
      }}>
        <span style={{ width:3, height:11, background:color, flexShrink:0, borderRadius:1 }} />
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize:9, color:th.textSub, fontFamily:"monospace" }}>
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
function SectionFrame({ label, sublabel, color, dark, children }) {
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
function AgentCard({ agent, dark }) {
  const th      = THEME[dark ? "dark" : "light"];
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

  return (
    <div style={{
      background:  th.card,
      border:      `1px solid ${th.border}`,
      borderLeft:  `2px solid ${present ? SC : th.border}`,
      borderRadius: 8,
      padding:     "10px 12px",
      position:    "relative",
      boxShadow:   present ? `-6px 0 14px -10px ${SC}` : "none",
    }}>
      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {/* Avatar + status dot — small square, static */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{
            width:26, height:26, borderRadius:5,
            background: dark ? "#252527" : "#f0f0f0",
            border:`1px solid ${th.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, fontFamily:"monospace", color:th.textMid,
          }}>
            {agent.avatar || (agent.name||"?").charAt(0).toUpperCase()}
          </div>
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
            fontSize:12.5, fontWeight:700, color:th.text,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {agent.name}
          </span>
          <span style={{
            fontSize:9.5, color:th.textSub,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:1,
          }}>
            {agent.role}
          </span>
        </div>

        {/* Status badge — square chip, not a pill */}
        <div style={{
          padding:"2px 6px", borderRadius:3, flexShrink:0,
          background: stateBg,
          border:`1px solid ${stateBorder}`,
          fontFamily:"monospace", fontSize:7.5, fontWeight:800,
          color: SC, letterSpacing:0.8,
        }}>
          {stateLabel}
        </div>
      </div>

      {/* ── Stats line — inline, terminal-style, no boxes ── */}
      <div style={{
        marginTop:7, paddingTop:7, borderTop:`1px solid ${th.border}`,
        display:"flex", alignItems:"center", gap:5,
        fontFamily:"monospace", fontSize:9.5, flexWrap:"wrap",
      }}>
        <span style={{ color:th.textSub }}>LAST_SEEN</span>
        <span style={{ color:th.text, fontWeight:700 }}>{timeAgo(agent.lastSeen)}</span>
        <span style={{ color:th.border }}>│</span>
        <span style={{ color:th.textSub }}>{online ? "SESSION" : "LAST_SESSION"}</span>
        <span style={{ color:th.text, fontWeight:700 }}>
          {online ? sessionDuration(agent.sessionStart, null) : (agent.lastSessionDuration || "—")}
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
            fontSize: 8, fontFamily: "monospace", fontWeight: 700,
            color: th.textSub, letterSpacing: 1.1,
          }}>
            [ KEY_HEALTH ] · {agent.keyCount} keys configured
          </div>
          <GroqKeyGrid
            activeKeyIdx={agent.activeKeyIdx}
            keys429Today={agent.keys429Today}
            keyCount={agent.keyCount || 5}
            dark={dark}
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
                  fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "monospace",
                  lineHeight: 1.1,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: 6.5, color: th.textSub, fontFamily: "monospace",
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
              marginTop: 8, fontSize: 9, color: th.textSub, fontFamily: "monospace",
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
              marginTop: 7, fontSize: 9, color: IND_GREEN, fontFamily: "monospace",
            }}>
              no_429s_today · running on K{agent.activeKeyIdx + 1}
            </div>
          ) : (
            <div style={{
              marginTop: 7, fontSize: 9, color: th.textSub, fontFamily: "monospace",
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
            fontSize: 8, fontFamily: "monospace", fontWeight: 700,
            color: th.textSub, letterSpacing: 1.1,
          }}>
            [ SEARCHES_TODAY ]
          </div>
          <div style={{
            fontSize: 19, fontWeight: 800, color: CYAN, fontFamily: "monospace", marginTop: 3,
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
          fontFamily:"monospace", fontSize:9,
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
          fontFamily:"monospace", fontSize:9,
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
          fontFamily:"monospace", fontSize:9,
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
              fontSize:7.5, fontWeight:700, fontFamily:"monospace",
            }}>
              ALL_TABS
            </span>
          )
          : (agent.allowedTabs || []).map(tab => (
            <span key={tab} style={{
              padding:"1.5px 5px", borderRadius:3,
              background: dark ? "#252527" : "#f0f0f0",
              fontSize:7.5, color:th.textSub, fontWeight:600, fontFamily:"monospace",
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
        fontSize:9, color:th.textSub, fontFamily:"monospace",
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
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Stat Card (with tap/hover tooltip)
// ═════════════════════════════════════════════════════════════════════════════
function StatCard({ label, value, color, Icon, tooltip, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [tipOpen, setTipOpen] = useState(false);
  return (
    <div
      style={{
        background: th.card,
        border: `1px solid ${th.border}`,
        borderTop: `2.5px solid ${color}`,
        borderRadius: 11, padding: "10px 13px",
        position: "relative", cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => setTipOpen(v => !v)}
      onMouseEnter={() => setTipOpen(true)}
      onMouseLeave={() => setTipOpen(false)}
    >
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:22, fontWeight:800, color:th.text, lineHeight:1.2 }}>
          {value}
        </div>
        <Icon size={15} color={color} />
      </div>
      <div style={{ fontSize:9, color:th.textSub, marginTop:2, fontWeight:600 }}>
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
          fontSize: 10, lineHeight: 1.5, fontWeight: 500,
          whiteSpace: "nowrap",
          zIndex: 60,
          boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
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
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Activity Timeline Row
// ═════════════════════════════════════════════════════════════════════════════
function ActivityRow({ act, dark, isLast }) {
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
          <span style={{ fontSize:11, fontWeight:700, color:th.text }}>
            {act.agentName}
          </span>
          <span style={{
            padding:"1px 5px", borderRadius:4, fontSize:8,
            background:`${color}18`, color, fontWeight:700, fontFamily:"monospace",
          }}>
            {(act.type || "action").toUpperCase()}
          </span>
          {isNew(act.time) && (
            <span style={{
              padding:"1px 5px", borderRadius:4, fontSize:8,
              background:`${IND_GREEN}18`, color:IND_GREEN,
              fontWeight:800, fontFamily:"monospace",
              animation:"agnt-pulse 1.5s ease-in-out infinite",
            }}>
              NEW
            </span>
          )}
          <span style={{
            marginLeft:"auto", fontSize:9, color:th.textSub, fontFamily:"monospace",
          }}>
            {timeAgo(act.time)}
          </span>
        </div>
        <div style={{ fontSize:11, color:th.textMid, marginTop:2, lineHeight:1.5 }}>
          {act.action}
        </div>
        {act.tab && (
          <div style={{ fontSize:9, color:th.textSub, fontFamily:"monospace", marginTop:1 }}>
            @ {TAB_LABELS[act.tab] || act.tab}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Daily Attendance (8h target — for salary calculation)
// ═════════════════════════════════════════════════════════════════════════════
function fmtHM(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h <= 0 && m <= 0) return "0m";
  return h ? `${h}h ${m}m` : `${m}m`;
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

function AttendanceSection({ humanAgents, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const todayStr = getISTDateStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [logs, setLogs] = useState([]);

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    const q = query(collection(db, "agentTimeLogs"), where("date", "==", selectedDate));
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
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
    };
  });

  const dateLabel = new Date(`${selectedDate}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{
      marginTop: 14, background: th.card, border: `1px solid ${th.border}`,
      borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: `1px solid ${th.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: dark ? "#252527" : "#f8f9fa",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: th.text }}>
            Daily Attendance
          </div>
          <div style={{ fontSize: 9, color: th.textSub, marginTop: 1 }}>
            Auto-tracked · 8h target · resets at midnight IST
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => shiftDate(-1)} style={{ ...navBtnStyle(th), cursor: "pointer" }}>
            <IconChevronLeft size={12} color={th.text} />
          </button>
          <div style={{
            fontSize: 10, fontWeight: 700, color: th.text, fontFamily: "monospace",
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
        {rows.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: th.textSub, fontSize: 11 }}>
            No agents yet.
          </div>
        ) : rows.map(r => {
          const pct = Math.min(100, Math.round((r.seconds / DAILY_TARGET_SECONDS) * 100));
          const complete = r.seconds >= DAILY_TARGET_SECONDS;
          const inAt  = fmtClockIST(r.firstActive);
          const lastAt = fmtClockIST(r.lastActive);
          return (
            <div key={r.uid} style={{ padding: "9px 0", borderBottom: `1px solid ${th.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: th.text }}>{r.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, fontFamily: "monospace",
                    color: complete ? IND_GREEN : th.text,
                  }}>
                    {fmtHM(r.seconds)}
                  </span>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 5,
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
                <div style={{ fontSize: 8.5, color: th.textSub, fontFamily: "monospace", marginTop: 4 }}>
                  {inAt && <>in {inAt}{" "}</>}
                  {lastAt && <>· last active {lastAt}</>}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const startT    = setTimeout(() => setShrink(true), 50); // next tick → CSS transition fires
    const dismissT  = setTimeout(() => onDismiss(toast.id), 8000);
    return () => { clearTimeout(startT); clearTimeout(dismissT); };
  }, [toast.id, onDismiss]);

  return (
    <div style={{
      width: isDesktop ? 280 : "100%",
      maxWidth: isDesktop ? 280 : 420,
      background: dark ? "#1c1c1e" : "#fff",
      border: `1px solid ${toast.color}55`,
      borderLeft: `3px solid ${toast.color}`,
      borderRadius: 10,
      padding: "10px 11px 8px",
      boxShadow: dark ? "0 6px 20px rgba(0,0,0,0.5)" : "0 6px 20px rgba(0,0,0,0.15)",
      animation: "agnt-toast-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
      pointerEvents: "auto",
      boxSizing: "border-box",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
        <IconAlert size={12} color={toast.color} style={{ flexShrink:0, marginTop:1 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:10.5, fontWeight:800, color:toast.color, fontFamily:"monospace" }}>
            {toast.agentName} — {toast.label}
          </div>
          {toast.detail && (
            <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>
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
      <div style={{ height:2, marginTop:8, borderRadius:1, background: dark?"#2c2c2e":"#eee", overflow:"hidden" }}>
        <div style={{
          height:"100%", background:toast.color,
          width: shrink ? "0%" : "100%",
          transition: "width 7.8s linear",
        }}/>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT: Anomaly Banner — persistent summary of currently-active issues
// ═════════════════════════════════════════════════════════════════════════════
function AnomalyBanner({ anomalies, dark, muted, onToggleMute, notifPermission, onRequestDesktop, onJump }) {
  const th = THEME[dark ? "dark" : "light"];
  const [expanded, setExpanded] = useState(false);
  if (anomalies.length === 0) return null;

  const hasCritical = anomalies.some(a => a.anomaly.color === "#EF4444");
  const headColor   = hasCritical ? "#EF4444" : SAFFRON;

  return (
    <div style={{
      marginBottom: 14,
      border: `1.5px solid ${headColor}55`,
      borderRadius: 12,
      overflow: "hidden",
      background: dark ? `${headColor}10` : `${headColor}0a`,
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        {...activatable(() => setExpanded(e => !e), `${anomalies.length} active alerts, ${expanded ? "collapse" : "expand"}`)}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", cursor:"pointer" }}
      >
        <IconAlert size={14} color={headColor} style={{ flexShrink:0 }} />
        <div style={{ fontSize:11.5, fontWeight:800, color:headColor, flex:1 }}>
          {anomalies.length} active alert{anomalies.length > 1 ? "s" : ""}
        </div>
        <div
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          {...activatable(onToggleMute, muted ? "Unmute alert sound" : "Mute alert sound")}
          style={{
            fontSize:9, color:th.textSub, fontFamily:"monospace",
            padding:"3px 7px", borderRadius:6, border:`1px solid ${th.border}`,
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
                <div style={{ width:6, height:6, borderRadius:"50%", background:ag.anomaly.color, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0, overflow:"hidden" }}>
                  <span style={{ fontSize:10.5, fontWeight:700, color:th.text }}>{ag.name}</span>
                  <span style={{ fontSize:9, color:ag.anomaly.color, fontFamily:"monospace", marginLeft:6, fontWeight:700 }}>
                    {ag.anomaly.label}
                  </span>
                </div>
                <span style={{
                  fontSize:8.5, color:th.textSub, fontFamily:"monospace", flexShrink:0,
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
                padding:"7px 12px", fontSize:9.5, color: dark?"#6fa3ff":NAVY,
                fontFamily:"monospace", cursor:"pointer", textDecoration:"underline",
              }}
            >
              → enable desktop notifications for alerts outside this tab
            </div>
          )}
          {notifPermission === "denied" && (
            <div style={{ padding:"7px 12px", fontSize:9, color:th.textSub, fontFamily:"monospace" }}>
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
  useEffect(() => {
    const t = setInterval(() => forceRender(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Listen: adminPresence → human agents ──────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "adminPresence"), snap => {
      setHumanAgents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // ── Listen: adminMeta/aiStatus → AI agent last-active timestamps ──────────
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "adminMeta", "aiStatus"), snap => {
      if (snap.exists()) setAiStatus(snap.data());
    });
    return unsub;
  }, []);

  // ── Listen: adminActivity (last 30 events) ────────────────────────────────
  useEffect(() => {
    const q    = query(collection(db, "adminActivity"), orderBy("time","desc"), limit(30));
    const unsub = onSnapshot(q, snap => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // ── Listen: today's time logs (for anomaly detection) ────────────────────
  useEffect(() => {
    const todayStr = getISTDateStr();
    const q = query(collection(db, "agentTimeLogs"), where("date", "==", todayStr));
    const unsub = onSnapshot(q, snap => {
      setTodayLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // ── Enrich AI agents with live status + health stats ─────────────────────
  const todayStr  = getISTDateStr(); // stable within a day; 30s tick keeps renders fresh
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
  const renderAgentGrid = (list) => (
    <div style={{
      display:"grid",
      gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr",
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
            <AgentCard agent={ag} dark={dark} />
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
      `}</style>

      {/* ── Proactive alert toasts — fixed overlay, newest at bottom of stack ── */}
      {toasts.length > 0 && (
        <div style={{
          position:"fixed",
          top: isDesktop ? 16 : 54,
          right: isDesktop ? 16 : 10,
          left: isDesktop ? "auto" : 10,
          zIndex:9999,
          display:"flex", flexDirection:"column", gap:8,
          alignItems: isDesktop ? "flex-end" : "stretch",
          pointerEvents:"none",
        }}>
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
          <div style={{ fontSize:15, fontWeight:800, color:th.text, letterSpacing:-0.2 }}>
            Agent Monitor
          </div>
          <div style={{ fontSize:11, color:th.textSub, marginTop:3 }}>
            Live presence · session tracking · activity feed · access control
          </div>
        </div>
      </div>

      {/* ── Active anomaly banner — persistent, not just a toast ────────── */}
      <AnomalyBanner
        anomalies={activeAnomalies}
        dark={dark}
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
          <StatCard key={s.label} {...s} dark={dark} />
        ))}
      </div>

      {/* ── NIC-style scrolling ticker ───────────────────────────────── */}
      <ActivityTicker activities={activities} dark={dark} />

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
            color: th.text, fontSize: 12,
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
            fontSize:11, fontWeight:700,
            border:`1px solid ${filter===f.key ? NAVY : th.border}`,
            transition:"all 0.15s",
            userSelect:"none",
          }}>
            {f.label}
          </div>
        ))}
        <div style={{
          marginLeft:"auto", fontSize:9, color:th.textSub, fontFamily:"monospace",
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
          textAlign:"center", color:th.textSub, fontSize:12,
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
            >
              {renderAgentGrid(verifyAgents)}
            </SectionFrame>
          )}
        </>
      )}

      {/* ── Daily Attendance (8h target — salary tracking) ─────────────── */}
      <AttendanceSection humanAgents={humanAgents} dark={dark} />

      {/* ── Government Notice Board ───────────────────────────────────── */}
      <NoticeBoard activities={activities} humanAgents={humanAgents} dark={dark} />

      {/* ── Activity Log ─────────────────────────────────────────────── */}
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
          <div style={{ fontSize:12, fontWeight:700, color:th.text, display:"flex", alignItems:"center", gap:6 }}>
            <IconClockHistory size={13} color={th.textMid} />
            Activity Log
          </div>
          <div style={{
            fontSize:9, color:th.textSub, fontFamily:"monospace",
          }}>
            last {activities.length} events
          </div>
        </div>

        <div style={{ padding:"0 14px" }}>
          {activities.length === 0 ? (
            <div style={{
              padding:"24px 0", textAlign:"center",
              color:th.textSub, fontSize:12,
            }}>
              No activity recorded yet. Activity will appear here as agents work.
            </div>
          ) : (
            activities.slice(0, 15).map((act, i) => (
              <ActivityRow
                key={act.id}
                act={act}
                dark={dark}
                isLast={i === Math.min(activities.length, 15) - 1}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Firestore info footer ─────────────────────────────────────── */}
      <div style={{
        marginTop:14, padding:"10px 12px",
        background: dark ? "#0a0c14" : "#f4f5fb",
        border:`1px solid ${th.border}`,
        borderRadius:10,
        fontFamily:"monospace", fontSize:9, color:th.textSub, lineHeight:1.7,
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
