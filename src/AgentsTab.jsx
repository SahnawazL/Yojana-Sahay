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

import React, { useState, useEffect, useRef, useCallback } from "react";
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
const VIOLET    = "#8B5CF6";
const CYAN      = "#06B6D4";

// ─── TAB LABELS ───────────────────────────────────────────────────────────────
const TAB_LABELS = {
  home:"Home", overview:"Overview", users:"Users",
  analytics:"Analytics", activity:"Activity", usage:"Usage",
  schemes:"Schemes", reports:"Reports", cleanup:"Cleanup",
  verify:"Verify", export:"Export", agents:"Agents",
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
    role:        "Scheme Verifier · Chat Assistant",
    type:        "ai",
    allowedTabs: ["verify", "reports"],
    model:       "llama-3.3-70b-versatile",
    firestoreKey:"groqLastActive",
    sessionStart: null,
  },
  {
    id:          "tavily-api",
    name:        "Tavily Extract",
    role:        "URL Health Inspector",
    type:        "ai",
    allowedTabs: ["verify"],
    model:       "tavily-extract-v2",
    firestoreKey:"tavilyLastActive",
    sessionStart: null,
  },
];

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

function isNew(ts, thresholdMins = 5) {
  const d = toDate(ts);
  if (!d) return false;
  return (Date.now() - d.getTime()) < thresholdMins * 60 * 1000;
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
// COMPONENT: NIC-style scrolling ticker
// ═════════════════════════════════════════════════════════════════════════════
function ActivityTicker({ activities, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [paused, setPaused] = useState(false);
  if (!activities.length) return null;
  // Duplicate list so the scroll loops seamlessly
  const items = [...activities, ...activities];
  const speed = Math.max(activities.length * 5, 28);

  return (
    <div style={{
      border:       `1px solid ${SAFFRON}50`,
      borderLeft:   `3px solid ${SAFFRON}`,
      borderRadius: 10,
      overflow:     "hidden",
      background:   dark ? "#120d00" : "#fffbf0",
      marginBottom: 14,
    }}>
      {/* Ticker header bar */}
      <div style={{
        background: `linear-gradient(90deg, ${SAFFRON}22, transparent)`,
        padding:    "5px 12px",
        display:    "flex", alignItems: "center", gap: 8,
        borderBottom: `1px solid ${SAFFRON}20`,
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%", background: SAFFRON,
          animation: "agnt-pulse 1.5s ease-in-out infinite", flexShrink: 0,
        }}/>
        <IconRadio size={11} color={SAFFRON} style={{ flexShrink:0 }} />
        <span style={{
          fontFamily:"monospace", fontSize: 9, fontWeight: 800,
          color: SAFFRON, letterSpacing: 1.8, textTransform: "uppercase",
        }}>
          LIVE FEED
        </span>
        <span style={{ marginLeft:"auto", fontSize: 9, color: th.textSub, fontFamily:"monospace" }}>
          {activities.length} events · hover to pause
        </span>
      </div>

      {/* Scrolling track */}
      <div
        style={{ overflow:"hidden", position:"relative", height: 38 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(p => !p)}
      >
        <div style={{
          display:    "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          paddingLeft:"100%",
          animation:  paused ? "none" : `agnt-ticker ${speed}s linear infinite`,
        }}>
          {items.map((act, i) => (
            <span key={i} style={{
              display:"inline-flex", alignItems:"center", gap: 7,
              padding:"0 26px", fontSize: 11,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius:"50%", flexShrink: 0,
                background: ACT_COLORS[act.type] || "#aaa",
              }}/>
              <span style={{ fontWeight: 700, color: th.text }}>{act.agentName}</span>
              <span style={{ color: th.textSub }}>·</span>
              <span style={{ color: th.textMid }}>{act.action}</span>
              <span style={{
                padding:"1px 5px", borderRadius: 4, fontSize: 8,
                background: `${ACT_COLORS[act.type] || "#aaa"}18`,
                color: ACT_COLORS[act.type] || "#aaa",
                fontFamily:"monospace", fontWeight: 700,
              }}>
                {TAB_LABELS[act.tab] || act.tab}
              </span>
              <span style={{ color: th.textSub, fontSize: 9, fontFamily:"monospace" }}>
                {timeAgo(act.time)}
              </span>
              <span style={{ color: th.border, fontSize: 16, marginLeft: 4 }}>|</span>
            </span>
          ))}
        </div>
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
      .filter(a => isOnline(a.lastSeen, 2))
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
      border:    `1.5px solid ${NAVY}45`,
      borderRadius: 13,
      overflow:  "hidden",
    }}>
      {/* Board header — tri-color stripe, navy body */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, #001f5c 0%, #002f80 100%)`,
        padding: "9px 14px",
      }}>
        {/* Tricolour top strip */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:3,
          background:`linear-gradient(90deg, ${SAFFRON} 33%, #fff 33% 66%, ${IND_GREEN} 66%)`,
        }}/>
        <div style={{
          display:"flex", alignItems:"center", gap:8, paddingTop: 4,
        }}>
          <div style={{
            width:8, height:8, borderRadius:"50%", background:SAFFRON,
            animation:"agnt-pulse 1.5s ease-in-out infinite", flexShrink:0,
          }}/>
          <IconMegaphone size={13} color="#fff" style={{ flexShrink:0, opacity:0.9 }} />
          <span style={{
            fontFamily:"monospace", fontSize: 10, fontWeight: 800,
            color:"#fff", letterSpacing: 2.5, textTransform:"uppercase",
          }}>
            Notice Board
          </span>
          <span style={{
            marginLeft:"auto", fontSize:8.5, color:"rgba(255,255,255,0.45)",
            fontFamily:"monospace",
          }}>
            Yojana Sahay Admin
          </span>
        </div>
      </div>

      {/* Notice rows */}
      <div style={{
        background: dark ? "#08100a" : "#f0f9f1",
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
              {/* Dot */}
              <div style={{
                width:6, height:6, borderRadius:"50%", flexShrink:0,
                background: n.color, marginTop: 5,
                animation: i === activeIdx ? "agnt-pulse 1.5s ease-in-out infinite" : "none",
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
                    padding:"1px 5px", borderRadius:4,
                    background: `${n.color}22`, color:n.color,
                    fontSize:8, fontWeight:800, fontFamily:"monospace",
                    letterSpacing:0.8, animation:"agnt-pulse 1.5s ease-in-out infinite",
                  }}>
                    NEW
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
          background: dark ? "#08100a" : "#f0f9f1",
          borderTop: `1px solid ${th.border}`,
        }}>
          {notices.map((_, i) => (
            <div key={i} onClick={() => setActiveIdx(i)} style={{
              width: i === activeIdx ? 18 : 5, height:5, borderRadius:3,
              background: i === activeIdx ? NAVY : th.border,
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
// COMPONENT: Agent Card
// ═════════════════════════════════════════════════════════════════════════════
function AgentCard({ agent, dark }) {
  const th    = THEME[dark ? "dark" : "light"];
  const threshold = agent.type === "ai" ? 15 : 2;
  const online    = isOnline(agent.lastSeen, threshold);
  const SC        = online ? IND_GREEN : th.textSub;

  return (
    <div style={{
      background:  th.card,
      border:      `1.5px solid ${online ? IND_GREEN + "40" : th.border}`,
      borderTop:   `3px solid ${online ? IND_GREEN : th.border}`,
      borderRadius:14,
      padding:     "14px",
      position:    "relative",
      overflow:    "hidden",
      transition:  "border-color 0.3s",
    }}>
      {/* Online shimmer line */}
      {online && (
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${IND_GREEN}55,transparent)`,
          animation:"agnt-scan 3.5s linear infinite",
        }}/>
      )}

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        {/* Avatar + status dot */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{
            width:42, height:42, borderRadius:12,
            background: dark ? "#252527" : "#f0f0f0",
            border:`1.5px solid ${online ? IND_GREEN + "55" : th.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20,
          }}>
            {agent.avatar || (agent.name||"?").charAt(0).toUpperCase()}
          </div>
          <div style={{
            position:"absolute", bottom:-2, right:-2,
            width:11, height:11, borderRadius:"50%",
            background: SC,
            border:`2px solid ${th.card}`,
            animation: online ? "agnt-pulse 2s ease-in-out infinite" : "none",
          }}/>
        </div>

        {/* Name / role */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize:13, fontWeight:700, color:th.text,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {agent.name}
          </div>
          <div style={{
            fontSize:10, color:th.textSub, marginTop:1,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {agent.role}
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          padding:"2px 8px", borderRadius:20, flexShrink:0,
          background: online ? `${IND_GREEN}18` : `${th.textSub}14`,
          border:`1px solid ${online ? IND_GREEN + "45" : th.border}`,
          fontFamily:"monospace", fontSize:8, fontWeight:800,
          color: SC, letterSpacing:1,
        }}>
          {online ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:6, marginTop:12,
      }}>
        {[
          {
            label:"LAST SEEN",
            value: timeAgo(agent.lastSeen),
          },
          {
            label: online ? "SESSION TIME" : "LAST SESSION",
            value: online
              ? sessionDuration(agent.sessionStart, null)
              : (agent.lastSessionDuration || "—"),
          },
        ].map(s => (
          <div key={s.label} style={{
            background: dark ? "#252527" : "#f8f9fa",
            borderRadius:8, padding:"7px 9px",
          }}>
            <div style={{
              fontSize:7.5, color:th.textSub,
              fontFamily:"monospace", letterSpacing:0.6, textTransform:"uppercase",
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize:12, fontWeight:700, color:th.text, marginTop:2,
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Active tab pill ── */}
      {online && agent.activeTab && (
        <div style={{
          marginTop:8, padding:"5px 9px",
          background:`${NAVY}1a`, border:`1px solid ${NAVY}35`,
          borderRadius:7, display:"flex", alignItems:"center", gap:6,
        }}>
          <div style={{
            width:5, height:5, borderRadius:"50%", background:"#6fa3ff",
            flexShrink:0, animation:"agnt-pulse 1.5s ease-in-out infinite",
          }}/>
          <span style={{
            fontSize:9, color:"#6fa3ff",
            fontFamily:"monospace", fontWeight:700, letterSpacing:0.5,
          }}>
            VIEWING: {TAB_LABELS[agent.activeTab] || agent.activeTab}
          </span>
        </div>
      )}

      {/* ── Allowed tabs ── */}
      <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:4 }}>
        {agent.allowedTabs === null
          ? (
            <span style={{
              padding:"2px 7px", borderRadius:5,
              background:`${SAFFRON}18`, color:SAFFRON,
              fontSize:8, fontWeight:700, fontFamily:"monospace",
            }}>
              ALL TABS
            </span>
          )
          : (agent.allowedTabs || []).map(tab => (
            <span key={tab} style={{
              padding:"2px 6px", borderRadius:5,
              background: dark ? "#2c2c2e" : "#f0f0f0",
              fontSize:8, color:th.textSub, fontWeight:600, fontFamily:"monospace",
            }}>
              {TAB_LABELS[tab] || tab}
            </span>
          ))
        }
      </div>

      {/* ── Metadata footer ── */}
      <div style={{
        marginTop:7, display:"flex", gap:8, alignItems:"center",
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

// ═════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: AgentsTab
// ═════════════════════════════════════════════════════════════════════════════
export default function AgentsTab({ dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];

  const [humanAgents, setHumanAgents] = useState([]);
  const [aiStatus,    setAiStatus]    = useState({});
  const [activities,  setActivities]  = useState([]);
  const [filter,      setFilter]      = useState("all");
  const [, forceRender]               = useState(0); // 30-s tick

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

  // ── Enrich AI agents with live status ────────────────────────────────────
  const enrichedAI = AI_AGENTS.map(ag => ({
    ...ag,
    lastSeen: aiStatus[ag.firestoreKey] || null,
  }));

  // ── Merge all agents ──────────────────────────────────────────────────────
  const allAgents = [...humanAgents, ...enrichedAI];

  // ── Summary counts ────────────────────────────────────────────────────────
  const onlineCount = allAgents.filter(a =>
    isOnline(a.lastSeen, a.type === "ai" ? 15 : 2)
  ).length;

  // ── Filter ────────────────────────────────────────────────────────────────
  const displayAgents = allAgents.filter(ag => {
    if (filter === "online") return isOnline(ag.lastSeen, ag.type === "ai" ? 15 : 2);
    if (filter === "human")  return ag.type === "human";
    if (filter === "ai")     return ag.type === "ai";
    return true;
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isDesktop ? "20px 32px" : "14px 14px 40px" }}>

      {/* ── Keyframes ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes agnt-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.72)} }
        @keyframes agnt-scan   { 0%{transform:translateX(-100%)} 100%{transform:translateX(600%)} }
        @keyframes agnt-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>

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

      {/* ── Summary stat row ─────────────────────────────────────────── */}
      <div style={{
        display:"grid",
        gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "repeat(2,1fr)",
        gap:8, marginBottom:14,
      }}>
        {[
          { label:"Total Agents",  value:allAgents.length,    color:NAVY,      Icon:IconUsers },
          { label:"Online Now",    value:onlineCount,          color:IND_GREEN, Icon:IconPulse },
          { label:"Human Admins",  value:humanAgents.length,  color:SAFFRON,   Icon:IconUserCheck },
          { label:"AI Agents",     value:enrichedAI.length,   color:VIOLET,    Icon:IconCpu },
        ].map(s => (
          <div key={s.label} style={{
            background:th.card,
            border:`1px solid ${th.border}`,
            borderTop:`2.5px solid ${s.color}`,
            borderRadius:11, padding:"10px 13px",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{
                fontSize:22, fontWeight:800, color:th.text, lineHeight:1.2,
              }}>
                {s.value}
              </div>
              <s.Icon size={15} color={s.color} />
            </div>
            <div style={{ fontSize:9, color:th.textSub, marginTop:2, fontWeight:600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── NIC-style scrolling ticker ───────────────────────────────── */}
      <ActivityTicker activities={activities} dark={dark} />

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
          <div key={f.key} onClick={() => setFilter(f.key)} style={{
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

      {/* ── Agent Cards ──────────────────────────────────────────────── */}
      {displayAgents.length === 0 ? (
        <div style={{
          background:th.card,
          border:`1px dashed ${th.border}`,
          borderRadius:12, padding:"28px",
          textAlign:"center", color:th.textSub, fontSize:12,
        }}>
          No agents match this filter.
        </div>
      ) : (
        <div style={{
          display:"grid",
          gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr",
          gap:10, marginBottom:16,
        }}>
          {displayAgents.map(ag => (
            <AgentCard key={ag.id || ag.uid} agent={ag} dark={dark} />
          ))}
        </div>
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
