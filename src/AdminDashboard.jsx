/**
 * Yojana Sahay — AdminDashboard.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * See the LICENSE file in the project root for full license terms.
 */

// AdminDashboard.jsx — Yojana Sahay Admin Panel (Advanced)
// Enhanced with: Analytics tab, donut charts, user detail drawer,
// sorting, pagination, filtered CSV export, refresh, more metrics,
// and Cleanup tab for purging old resolved reports.

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { collection, getDocs, updateDoc, doc, serverTimestamp, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SCHEME_DB, INDIA_STATES } from "./schemesData.js";
import emailjs from "@emailjs/browser";
import ResolvedReportsCleaner from "./ResolvedReportsCleaner.jsx";
import UsageDataCleaner from "./UsageDataCleaner.jsx";
import SchemeVerifier from "./SchemeVerifier.jsx";
import AgentsTab, { useAgentPresence, useDailyTimeTracking, logAdminActivity } from "./AgentsTab.jsx";
import NewsTab from "./NewsTab.jsx";
import FAQFeedbackTab from "./FAQFeedbackTab.jsx";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#fff", overlay:"rgba(0,0,0,0.45)",
    drawerBg:"#fff",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e", overlay:"rgba(0,0,0,0.65)",
    drawerBg:"#1c1c1e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";
const PINK      = "#EC4899";
const GOOGLE_B  = "#4285F4";

// ── Shared latency → color ramp — single source of truth so every ping
// readout in the dashboard (Home telemetry card + both Control Centre bars)
// agrees on what counts as fast/slow instead of each using its own thresholds.
function latencyColorFor(ms) {
  return ms < 200 ? IND_GREEN : ms < 600 ? SAFFRON : "#E53E3E";
}

// ─── EMAILJS + AI CONFIG ──────────────────────────────────────────────────────
const EJS_SERVICE_ID  = "service_j0cvqgf";
const EJS_REPLY_TID   = "template_xvl9ir3";   // Admin → User reply template
const EJS_PUBLIC_KEY  = "aV7SknFp6qPFayUkX";
// Groq calls go through the Vercel serverless route /api/chat (same as groqClient.js)
// — API keys live in Vercel env vars, never in frontend code.
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── ADMIN BUILD INFO ─────────────────────────────────────────────────────────
const ADMIN_BUILD_VERSION = "2.6.0";
const ADMIN_BUILD_ENV     = "PROD";

const OCC_LABELS = {
  farmer:"Farmer", student:"Student", women:"Homemaker",
  senior:"Senior Citizen", business:"Business Owner", general:"General",
};
const OCC_EMOJI = {
  farmer:"🌾", student:"📚", women:"👩", senior:"👴", business:"💼", general:"👤",
};
const INC_LABELS = {
  below1:"< ₹1L", "1to3":"₹1–3L", "3to6":"₹3–6L", above6:"> ₹6L",
};
const AGE_LABELS = {
  below18:"< 18", "18to35":"18–35", "35to60":"35–60", above60:"60+",
};
const AREA_LABELS     = { rural:"Rural", urban:"Urban", semi:"Semi-Urban" };
const GENDER_LABELS   = { male:"Male 👨", female:"Female 👩", other:"Other 🧑" };
const RATION_LABELS   = { none:"None / N/A 🚫", apl:"APL", bpl:"BPL 🟡", aay:"AAY — Antyodaya 🔴" };
const MARITAL_LABELS  = { single:"Single", married:"Married 💍", widowed:"Widowed 🕊️", divorced:"Divorced" };
const HOUSE_LABELS    = { yes:"Owns House ✅", no:"Needs Housing ❌", kutcha:"Kutcha / Temporary" };
const DISAB_LABELS    = { none:"No Disability ✅", physical:"Physical 🦽", visual:"Visual 👁", hearing:"Hearing 🦻", intellectual:"Intellectual 🧠" };
const CHILDREN_LABELS = { "0":"No children", "1":"1 child", "2":"2 children", "3plus":"3 or more" };
const LAND_LABELS     = { below1:"< 1 Acre", "1to2":"1–2 Acres", "2to5":"2–5 Acres", "5plus":"5+ Acres" };
const KISAN_LABELS    = { yes:"Has KCC ✅", no:"No KCC" };
const EDUC_LABELS     = { class1to8:"Class 1–8", class9to12:"Class 9–12", undergrad:"Undergraduate", postgrad:"Postgraduate" };
const INST_LABELS     = { government:"Government 🏛️", private:"Private 🏫" };

const DONUT_COLORS = [NAVY, SAFFRON, IND_GREEN, VIOLET, PINK, GOOGLE_B, "#F59E0B", "#10B981"];

// ─── TAB ICONS ────────────────────────────────────────────────────────────────
const TAB_ICONS = {
  home: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  overview: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  users: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  analytics: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  activity: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  usage: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  schemes: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  reports: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  cleanup: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  verify: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  export: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  agents: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  news: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
      <line x1="16" y1="3" x2="16" y2="21"/>
      <line x1="2" y1="9" x2="22" y2="9"/>
      <line x1="8" y1="14" x2="13" y2="14"/>
      <line x1="8" y1="18" x2="11" y2="18"/>
    </svg>
  ),
  faq: (color="currentColor", size=12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  ),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" });
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ data, size = 120, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color:th.textSub, fontSize:12 }}>No data</div>;

  const r = 44; const cx = 60; const cy = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const el = (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
        strokeWidth={14}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition:"stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink:0 }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={th.border} strokeWidth={14} />
        {slices}
        {/* Center label */}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={18}
          fontWeight={800} fill={th.text}>{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9}
          fill={th.textSub}>total</text>
      </svg>
      {/* Legend */}
      <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, minWidth:0 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              width:8, height:8, borderRadius:2, flexShrink:0,
              background: DONUT_COLORS[i % DONUT_COLORS.length],
            }} />
            <div style={{
              fontSize:11, color:th.textMid, flex:1,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              {d.label}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:th.text, flexShrink:0 }}>
              {Math.round((d.value / total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
function BarChart({ data, color, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {data.map(({ label, value }) => (
        <div key={label} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:88, flexShrink:0, fontSize:11, color:th.textMid,
            textAlign:"right", fontWeight:500, overflow:"hidden",
            textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {label}
          </div>
          <div style={{
            flex:1, height:20, background:th.border,
            borderRadius:6, overflow:"hidden", position:"relative",
          }}>
            <div style={{
              height:"100%", borderRadius:6,
              width:`${(value / max) * 100}%`,
              background:`linear-gradient(90deg,${color},${color}cc)`,
              transition:"width 0.6s cubic-bezier(0.22,1,0.36,1)",
              minWidth:value > 0 ? 24 : 0,
              display:"flex", alignItems:"center", justifyContent:"flex-end",
              paddingRight:6,
            }}>
              <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>
                {value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SPARKLINE (7-day trend) ───────────────────────────────────────────────────
function Sparkline({ points, color, width = 80, height = 28 }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = width; const h = height;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(v => h - ((v - min) / range) * (h - 4) - 2);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow:"visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r={3} fill={color} />
    </svg>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, dark, trend, sparkline }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      background: th.card,
      border:`1.5px solid ${th.border}`,
      borderRadius:14, padding:"13px 14px",
      flex:1, minWidth:0,
      borderTop:`3px solid ${color}`,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:18 }}>{icon}</div>
        {sparkline && <Sparkline points={sparkline} color={color} />}
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:th.text, lineHeight:1, marginTop:4 }}>
        {value}
      </div>
      <div style={{ fontSize:10, color:th.textSub, marginTop:3, fontWeight:500 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize:9, color, marginTop:2, fontWeight:600 }}>
          {sub}
        </div>
      )}
      {trend !== undefined && (
        <div style={{
          fontSize:9, marginTop:3, fontWeight:700,
          color: trend >= 0 ? IND_GREEN : "#E53E3E",
        }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 7px", borderRadius:8,
      fontSize:9, fontWeight:700, color, background:bg || `${color}18`,
    }}>
      {label}
    </span>
  );
}

// ─── USER DETAIL DRAWER ───────────────────────────────────────────────────────
function UserDrawer({ user, dark, onClose, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];
  if (!user) return null;
  const initial = (user.name || "?").charAt(0).toUpperCase();

  const isFarmer  = user.occupation === "farmer";
  const isStudent = user.occupation === "student";

  const fields = [
    // ── Contact ──────────────────────────────────────────────────────────
    { label:"📱 Phone",      value: user.phone  ? `+91 ${user.phone}` : "—",  highlight: !!user.phone },
    { label:"✉️ Email",      value: user.email  || "—" },
    // ── Personal ─────────────────────────────────────────────────────────
    { label:"⚧ Gender",     value: GENDER_LABELS[user.gender]  || user.gender  || "—" },
    { label:"🎂 Age Group",  value: AGE_LABELS[user.age]        || user.age     || "—" },
    { label:"💍 Marital",   value: MARITAL_LABELS[user.marital] || user.marital || "—" },
    // ── Location ─────────────────────────────────────────────────────────
    { label:"📍 State",      value: user.state  || "—" },
    { label:"🏘️ Area",       value: AREA_LABELS[user.area]     || user.area    || "—" },
    // ── Socio-economic ───────────────────────────────────────────────────
    { label:"💼 Occupation", value: OCC_LABELS[user.occupation] || user.occupation || "—" },
    { label:"💰 Income",     value: INC_LABELS[user.income]     || user.income     || "—" },
    { label:"🏠 Housing",    value: HOUSE_LABELS[user.house]    || user.house      || "—" },
    { label:"🪪 Ration Card",value: RATION_LABELS[user.ration]  || user.ration     || "—" },
    // ── Welfare ──────────────────────────────────────────────────────────
    { label:"♿ Disability",  value: DISAB_LABELS[user.disability]  || user.disability  || "—" },
    // ── Family ───────────────────────────────────────────────────────────
    { label:"👨‍👩‍👧 Children",   value: CHILDREN_LABELS[user.numChildren] || user.numChildren || "—" },
    ...(user.numChildren && user.numChildren !== "0"
      ? [{ label:"👧 Girl Child", value: user.hasGirls === "yes" ? "Yes ✅" : user.hasGirls === "no" ? "No" : "—" }]
      : []),
    // ── Farmer-specific ──────────────────────────────────────────────────
    ...(isFarmer ? [
      { label:"🌾 Land Holding", value: LAND_LABELS[user.landHolding]  || user.landHolding  || "—" },
      { label:"💳 Kisan Card",   value: KISAN_LABELS[user.kisanCard]   || user.kisanCard    || "—" },
    ] : []),
    // ── Student-specific ─────────────────────────────────────────────────
    ...(isStudent ? [
      { label:"🎓 Education",    value: EDUC_LABELS[user.educationLevel]  || user.educationLevel  || "—" },
      { label:"🏫 Institution",  value: INST_LABELS[user.institutionType] || user.institutionType || "—" },
    ] : []),
    // ── Account ──────────────────────────────────────────────────────────
    { label:"🗓 Joined",     value: formatDate(user.createdAt) },
    { label:"🟢 Last Seen",  value: formatDate(user.lastSeen)  },
  ];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, zIndex:10000,
        background:th.overlay,
      }} />
      {/* Drawer — bottom sheet on mobile, centered dialog on desktop */}
      <div style={
        isDesktop
          ? {
              position:"fixed",
              top:"50%", left:"50%",
              transform:"translate(-50%, -50%)",
              zIndex:10001,
              background:th.drawerBg,
              borderRadius:20,
              padding:"0 0 32px 0",
              boxShadow:"0 24px 80px rgba(0,0,0,0.35)",
              width:520, maxWidth:"90vw",
              maxHeight:"85vh",
              overflowY:"auto",
            }
          : {
              position:"fixed", bottom:0, left:0, right:0, zIndex:10001,
              background:th.drawerBg,
              borderRadius:"20px 20px 0 0",
              padding:"0 0 40px 0",
              boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",
              maxHeight:"80vh",
              overflowY:"auto",
            }
      }>
        {/* Handle */}
        <div style={{
          width:36, height:4, borderRadius:2,
          background:th.border, margin:"12px auto 0",
        }} />

        {/* Avatar + Name */}
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          padding:"20px 20px 16px",
          borderBottom:`1px solid ${th.border}`,
        }}>
          {user.photo ? (
            <img src={user.photo} alt={initial} referrerPolicy="no-referrer"
              style={{ width:64, height:64, borderRadius:"50%", objectFit:"cover" }} />
          ) : (
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, fontWeight:800, color:"#fff",
            }}>
              {initial}
            </div>
          )}
          <div style={{ fontSize:17, fontWeight:800, color:th.text, marginTop:10 }}>
            {user.name || "Unknown"}
          </div>
          <div style={{ fontSize:11, color:th.textSub, marginTop:3 }}>
            UID: {user.id}
          </div>
          <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap", justifyContent:"center" }}>
            {user.photo && <Badge label="Google Account" color={GOOGLE_B} />}
            {user.occupation && <Badge label={OCC_LABELS[user.occupation] || user.occupation} color={SAFFRON} />}
            {user.area && <Badge label={AREA_LABELS[user.area] || user.area} color={IND_GREEN} />}
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:0 }}>
          {fields.map(({ label, value, highlight }) => (
            <div key={label} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 0",
              borderBottom:`1px solid ${th.border}`,
              background: highlight ? (dark?"rgba(255,153,51,0.07)":"rgba(255,153,51,0.05)") : "transparent",
              marginLeft: highlight ? -8 : 0,
              marginRight: highlight ? -8 : 0,
              paddingLeft: highlight ? 8 : 0,
              paddingRight: highlight ? 8 : 0,
              borderRadius: highlight ? 8 : 0,
            }}>
              <div style={{ fontSize:12, color:th.textSub }}>{label}</div>
              <div style={{
                fontSize:12, fontWeight: highlight ? 700 : 600,
                color: highlight ? SAFFRON : th.text,
                textAlign:"right", maxWidth:"60%",
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div onClick={onClose} style={{
          margin:"12px 20px 0", padding:"12px",
          background:th.border, borderRadius:12,
          textAlign:"center", fontSize:13, fontWeight:700,
          color:th.textMid, cursor:"pointer",
        }}>
          Close
        </div>
      </div>
    </>
  );
}

// ─── USER ROW ─────────────────────────────────────────────────────────────────
function UserRow({ user, dark, onTap }) {
  const th = THEME[dark ? "dark" : "light"];
  const initial = (user.name || "?").charAt(0).toUpperCase();
  return (
    <div onClick={() => onTap(user)} style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 0", borderBottom:`1px solid ${th.border}`,
      cursor:"pointer",
    }}>
      {user.photo ? (
        <img src={user.photo} alt={initial} referrerPolicy="no-referrer"
          style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
      ) : (
        <div style={{
          width:36, height:36, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, fontWeight:800, color:"#fff",
        }}>
          {initial}
        </div>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:13, fontWeight:700, color:th.text,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          {user.name || "—"}
        </div>
        <div style={{ fontSize:10, color:th.textSub, marginTop:1 }}>
          {OCC_EMOJI[user.occupation] || "👤"} {OCC_LABELS[user.occupation] || user.occupation || "—"}
          {" · "}{user.state || "—"}
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontSize:10, color:th.textMid, fontWeight:600 }}>
          {user.phone ? `📱 ${user.phone}` : user.email ? `✉ ${user.email.split("@")[0]}` : "—"}
        </div>
        <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>
          {timeAgo(user.lastSeen)}
        </div>
      </div>
      <div style={{ fontSize:14, color:th.textSub, flexShrink:0 }}>›</div>
    </div>
  );
}

// ─── SORT ICON ────────────────────────────────────────────────────────────────
function SortBtn({ field, current, dir, onClick, label, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const active = current === field;
  return (
    <div onClick={() => onClick(field)} style={{
      padding:"6px 10px", borderRadius:8,
      fontSize:11, fontWeight:700, cursor:"pointer",
      background: active ? NAVY : th.border,
      color: active ? "#fff" : th.textMid,
      display:"flex", alignItems:"center", gap:4,
      flexShrink:0,
    }}>
      {label}
      {active && <span>{dir === "asc" ? " ↑" : " ↓"}</span>}
    </div>
  );
}

// ─── CROSS-TAB TABLE ──────────────────────────────────────────────────────────
function CrossTab({ data, rowKey, colKey, rowLabels, colLabels, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const rows = Object.keys(rowLabels);
  const cols = Object.keys(colLabels);
  const table = {};
  rows.forEach(r => { table[r] = {}; cols.forEach(c => { table[r][c] = 0; }); });
  data.forEach(u => {
    const r = u[rowKey]; const c = u[colKey];
    if (table[r] !== undefined && c !== undefined) {
      table[r][c] = (table[r][c] || 0) + 1;
    }
  });
  const cellStyle = {
    padding:"6px 8px", fontSize:11, textAlign:"center",
    borderBottom:`1px solid ${th.border}`,
  };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign:"left", color:th.textSub, fontWeight:600 }}></th>
            {cols.map(c => (
              <th key={c} style={{ ...cellStyle, color:th.textSub, fontWeight:600 }}>
                {colLabels[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r}>
              <td style={{ ...cellStyle, textAlign:"left", fontWeight:700, color:th.textMid }}>
                {rowLabels[r]}
              </td>
              {cols.map(c => {
                const v = table[r][c] || 0;
                const rowTotal = cols.reduce((s, cc) => s + (table[r][cc] || 0), 0);
                const pct = rowTotal ? Math.round((v / rowTotal) * 100) : 0;
                return (
                  <td key={c} style={{
                    ...cellStyle,
                    background: v > 0
                      ? `rgba(0,53,128,${0.05 + (pct / 100) * 0.3})`
                      : "transparent",
                    color: th.text,
                    fontWeight: v > 0 ? 700 : 400,
                  }}>
                    {v > 0 ? `${v}` : "·"}
                    {v > 0 && <span style={{ fontSize:8, color:th.textSub, marginLeft:2 }}>{pct}%</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed({ users, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [actPage, setActPage] = React.useState(1);
  const ACT_PER_PAGE = 10;

  const allRecent = [...users]
    .filter(u => u.lastSeen)
    .sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0));

  const totalPages = Math.max(1, Math.ceil(allRecent.length / ACT_PER_PAGE));
  const recent     = allRecent.slice((actPage - 1) * ACT_PER_PAGE, actPage * ACT_PER_PAGE);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {recent.map((u, i) => {
        const initial = (u.name || "?").charAt(0).toUpperCase();
        return (
          <div key={u.id} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"9px 0",
            borderBottom: i < recent.length - 1 ? `1px solid ${th.border}` : "none",
            position:"relative",
          }}>
            {/* Timeline line */}
            {i < recent.length - 1 && (
              <div style={{
                position:"absolute", left:16, top:40, width:2,
                height:"calc(100% - 16px)",
                background:th.border, borderRadius:1,
              }} />
            )}
            {u.photo ? (
              <img src={u.photo} alt={initial} referrerPolicy="no-referrer"
                style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0, zIndex:1 }} />
            ) : (
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0, zIndex:1,
                background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800, color:"#fff",
              }}>
                {initial}
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:th.text }}>
                {u.name || "Unknown"}
              </div>
              <div style={{ fontSize:10, color:th.textSub, marginTop:1 }}>
                {u.state || "?"} · {OCC_LABELS[u.occupation] || "?"}
              </div>
            </div>
            <div style={{ fontSize:9, color:th.textSub, flexShrink:0 }}>
              {timeAgo(u.lastSeen)}
            </div>
          </div>
        );
      })}

      {/* Paginator */}
      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:10 }}>
          <div
            onClick={() => actPage > 1 && setActPage(p => p - 1)}
            style={{
              padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
              cursor: actPage > 1 ? "pointer" : "default",
              opacity: actPage > 1 ? 1 : 0.35,
              background: th.card2, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >‹</div>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const isActive = p === actPage;
            const nearby = Math.abs(p - actPage) <= 1 || p === 1 || p === totalPages;
            if (!nearby) {
              if (p === actPage - 2 || p === actPage + 2)
                return <span key={p} style={{ color:th.textSub, fontSize:10 }}>…</span>;
              return null;
            }
            return (
              <div key={p} onClick={() => setActPage(p)} style={{
                minWidth:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer",
                background: isActive ? NAVY : th.card2,
                color:      isActive ? "#fff" : th.textMid,
                border:`1.5px solid ${isActive ? NAVY : th.border}`,
                transition:"all 0.15s", userSelect:"none",
              }}>{p}</div>
            );
          })}
          <div
            onClick={() => actPage < totalPages && setActPage(p => p + 1)}
            style={{
              padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
              cursor: actPage < totalPages ? "pointer" : "default",
              opacity: actPage < totalPages ? 1 : 0.35,
              background: th.card2, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >›</div>
        </div>
      )}
    </div>
  );
}

// ─── JOINED THIS WEEK ────────────────────────────────────────────────────────
function JoinedThisWeek({ users, dark, onTap }) {
  const th = THEME[dark ? "dark" : "light"];
  const [joinedPage, setJoinedPage] = React.useState(1);
  const JOINED_PER_PAGE = 10;

  // Scroll to top of dashboard whenever page changes
  React.useEffect(() => {
    document.querySelector("[data-admin-scroll]")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [joinedPage]);

  const allJoined = users
    .filter(u =>
      u.createdAt?.seconds &&
      (Date.now() - u.createdAt.seconds * 1000) < 7 * 86400000
    )
    .sort((a, b) => (b.createdAt.seconds || 0) - (a.createdAt.seconds || 0));

  const totalPages = Math.max(1, Math.ceil(allJoined.length / JOINED_PER_PAGE));
  const paged      = allJoined.slice((joinedPage - 1) * JOINED_PER_PAGE, joinedPage * JOINED_PER_PAGE);

  if (allJoined.length === 0) {
    return (
      <div style={{ fontSize:12, color:th.textSub, padding:"12px 0" }}>
        No new users this week yet
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {paged.map(u => (
        <UserRow key={u.id} user={u} dark={dark} onTap={onTap} />
      ))}

      {/* Paginator — same style as ActivityFeed */}
      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:10 }}>
          <div
            onClick={() => joinedPage > 1 && setJoinedPage(p => p - 1)}
            style={{
              padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
              cursor: joinedPage > 1 ? "pointer" : "default",
              opacity: joinedPage > 1 ? 1 : 0.35,
              background: th.card2, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >‹</div>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const isActive = p === joinedPage;
            const nearby   = Math.abs(p - joinedPage) <= 1 || p === 1 || p === totalPages;
            if (!nearby) {
              if (p === joinedPage - 2 || p === joinedPage + 2)
                return <span key={p} style={{ color:th.textSub, fontSize:10 }}>…</span>;
              return null;
            }
            return (
              <div key={p} onClick={() => setJoinedPage(p)} style={{
                minWidth:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer",
                background: isActive ? NAVY : th.card2,
                color:      isActive ? "#fff" : th.textMid,
                border:`1.5px solid ${isActive ? NAVY : th.border}`,
                transition:"all 0.15s", userSelect:"none",
              }}>{p}</div>
            );
          })}
          <div
            onClick={() => joinedPage < totalPages && setJoinedPage(p => p + 1)}
            style={{
              padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
              cursor: joinedPage < totalPages ? "pointer" : "default",
              opacity: joinedPage < totalPages ? 1 : 0.35,
              background: th.card2, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >›</div>
        </div>
      )}
    </div>
  );
}

// ─── DORMANT USERS ───────────────────────────────────────────────────────────
function DormantUsers({ users, dark, onTap }) {
  const th = THEME[dark ? "dark" : "light"];
  const [dormantPage, setDormantPage] = React.useState(1);
  const DORMANT_PER_PAGE = 10;

  // Scroll to top of dashboard whenever page changes
  React.useEffect(() => {
    document.querySelector("[data-admin-scroll]")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [dormantPage]);

  // Sort longest-inactive first so worst offenders appear on page 1
  const allDormant = users
    .filter(u =>
      u.lastSeen?.seconds &&
      (Date.now() - u.lastSeen.seconds * 1000) > 30 * 86400000
    )
    .sort((a, b) => (a.lastSeen.seconds || 0) - (b.lastSeen.seconds || 0));

  const totalPages = Math.max(1, Math.ceil(allDormant.length / DORMANT_PER_PAGE));
  const paged      = allDormant.slice((dormantPage - 1) * DORMANT_PER_PAGE, dormantPage * DORMANT_PER_PAGE);

  if (allDormant.length === 0) {
    return (
      <div style={{ fontSize:12, color:th.textSub, padding:"12px 0", textAlign:"center" }}>
        🎉 No dormant users — great retention!
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {paged.map(u => (
        <UserRow key={u.id} user={u} dark={dark} onTap={onTap} />
      ))}

      {/* Paginator — same style as ActivityFeed / JoinedThisWeek */}
      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:10 }}>
          <div
            onClick={() => dormantPage > 1 && setDormantPage(p => p - 1)}
            style={{
              padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
              cursor: dormantPage > 1 ? "pointer" : "default",
              opacity: dormantPage > 1 ? 1 : 0.35,
              background: th.card2, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >‹</div>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const isActive = p === dormantPage;
            const nearby   = Math.abs(p - dormantPage) <= 1 || p === 1 || p === totalPages;
            if (!nearby) {
              if (p === dormantPage - 2 || p === dormantPage + 2)
                return <span key={p} style={{ color:th.textSub, fontSize:10 }}>…</span>;
              return null;
            }
            return (
              <div key={p} onClick={() => setDormantPage(p)} style={{
                minWidth:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer",
                background: isActive ? "#F59E0B" : th.card2,
                color:      isActive ? "#fff"    : th.textMid,
                border:`1.5px solid ${isActive ? "#F59E0B" : th.border}`,
                transition:"all 0.15s", userSelect:"none",
              }}>{p}</div>
            );
          })}
          <div
            onClick={() => dormantPage < totalPages && setDormantPage(p => p + 1)}
            style={{
              padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
              cursor: dormantPage < totalPages ? "pointer" : "default",
              opacity: dormantPage < totalPages ? 1 : 0.35,
              background: th.card2, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >›</div>
        </div>
      )}
    </div>
  );
}

// ─── SCHEME COVERAGE TAB ──────────────────────────────────────────────────────
function SchemeCoverageTab({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [sortMode, setSortMode]   = useState("count"); // "count" | "alpha"
  const [tierFilter, setTierFilter] = useState("all"); // "all"|"none"|"low"|"medium"|"good"

  // Build per-state and central counts from SCHEME_DB
  const { centralCount, stateCounts, totalSchemes } = useMemo(() => {
    const counts = {};
    let central = 0;
    const all = Array.isArray(SCHEME_DB) ? SCHEME_DB : Object.values(SCHEME_DB || {});
    all.forEach(scheme => {
      if (scheme.scope === "national") {
        central++;
      } else if (scheme.scope === "state" && scheme.state) {
        counts[scheme.state] = (counts[scheme.state] || 0) + 1;
      }
    });
    return { centralCount: central, stateCounts: counts, totalSchemes: all.length };
  }, []);

  // Build full list: every state from INDIA_STATES gets a row (even if 0)
  const rows = useMemo(() => {
    const stateList = Array.isArray(INDIA_STATES) ? INDIA_STATES : Object.values(INDIA_STATES || {});
    return stateList.map(state => ({
      name: state,
      count: stateCounts[state] || 0,
    }));
  }, [stateCounts]);

  const maxCount = useMemo(() => Math.max(...rows.map(r => r.count), 1), [rows]);

  // Average schemes per state (only states with at least 1)
  const avgSchemes = useMemo(() => {
    const active = rows.filter(r => r.count > 0);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((s, r) => s + r.count, 0) / active.length);
  }, [rows]);

  const filtered = useMemo(() => {
    let list = [...rows];
    // Tier filter
    if (tierFilter !== "all") {
      list = list.filter(r => coverageTier(r.count) === tierFilter);
    }
    return list.sort((a, b) =>
      sortMode === "count" ? b.count - a.count : a.name.localeCompare(b.name)
    );
  }, [rows, sortMode, tierFilter]);

  // Summary buckets
  const withSchemes  = rows.filter(r => r.count > 0).length;
  const noSchemes    = rows.filter(r => r.count === 0).length;
  const highCoverage = rows.filter(r => r.count > 100).length;
  const lowCount     = rows.filter(r => r.count > 0   && r.count <= 30).length;
  const medCount     = rows.filter(r => r.count > 30  && r.count <= 100).length;

  function coverageTier(count) {
    if (count === 0)   return "none";
    if (count <= 30)   return "low";
    if (count <= 100)  return "medium";
    return "good";
  }
  function coverageColor(count) {
    if (count === 0)   return "#E53E3E";
    if (count <= 30)   return SAFFRON;
    if (count <= 100)  return "#3B82F6";
    return IND_GREEN;
  }
  function coverageLabel(count) {
    if (count === 0)   return "None";
    if (count <= 30)   return "Low";
    if (count <= 100)  return "Medium";
    return "Good";
  }

  // Gap to next tier
  function gapToNext(count) {
    if (count === 0)        return { gap: 1,            label: "+1 to Low" };
    if (count <= 30)        return { gap: 31 - count,   label: `+${31 - count} to Medium` };
    if (count <= 100)       return { gap: 101 - count,  label: `+${101 - count} to Good` };
    return null; // already Good
  }

  // Dynamic insight line
  const insightText = (() => {
    if (noSchemes > 0)
      return `⚠️ ${noSchemes} state${noSchemes > 1 ? "s" : ""} still have 0 schemes — add there first.`;
    if (lowCount > 0)
      return `📈 ${lowCount} state${lowCount > 1 ? "s" : ""} are Low coverage — a good next target.`;
    if (medCount > 0)
      return `🎯 ${medCount} state${medCount > 1 ? "s" : ""} are at Medium — push them to Good!`;
    return `✅ All states have Good coverage. Great work!`;
  })();

  // Tier filter chips config
  const tierChips = [
    { id:"all",    label:"All",    color:th.textMid,  count: rows.length  },
    { id:"none",   label:"None",   color:"#E53E3E",   count: noSchemes    },
    { id:"low",    label:"Low",    color:SAFFRON,     count: lowCount     },
    { id:"medium", label:"Medium", color:"#3B82F6",   count: medCount     },
    { id:"good",   label:"Good",   color:IND_GREEN,   count: highCoverage },
  ];

  return (
    <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>

      {/* Summary pills — now includes Avg */}
      <div style={{ display:"flex", gap:8 }}>
        {[
          { label:"Total Schemes", value:totalSchemes, color:NAVY      },
          { label:"🇮🇳 Central",    value:centralCount, color:VIOLET    },
          { label:"States Active", value:withSchemes,  color:IND_GREEN },
          { label:"States Empty",  value:noSchemes,    color:"#E53E3E" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex:1, background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:12, padding:"10px 8px", textAlign:"center",
            borderTop:`3px solid ${color}`, minWidth:0,
          }}>
            <div style={{ fontSize:18, fontWeight:800, color:th.text }}>{value}</div>
            <div style={{ fontSize:9, color:th.textSub, marginTop:2, lineHeight:1.3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Avg schemes per active state — standalone pill */}
      <div style={{
        background:th.card, border:`1.5px solid ${VIOLET}`,
        borderRadius:12, padding:"10px 14px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:th.textMid }}>
            📐 Avg Schemes per Active State
          </div>
          <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>
            Across {withSchemes} states that have at least 1 scheme
          </div>
        </div>
        <div style={{
          fontSize:26, fontWeight:800, color:VIOLET,
        }}>
          {avgSchemes}
        </div>
      </div>

      {/* Coverage distribution stacked bar */}
      <div style={{
        background:th.card, border:`1.5px solid ${th.border}`,
        borderRadius:14, padding:"12px 14px",
      }}>
        <div style={{ fontSize:11, fontWeight:700, color:th.textMid, marginBottom:8 }}>
          📊 Coverage Distribution — {rows.length} States & UTs
        </div>
        <div style={{ display:"flex", height:12, borderRadius:8, overflow:"hidden", gap:1 }}>
          {[
            { count:noSchemes,    color:"#E53E3E" },
            { count:lowCount,     color:SAFFRON   },
            { count:medCount,     color:"#3B82F6" },
            { count:highCoverage, color:IND_GREEN },
          ].map(({ count: c, color }, i) => {
            const pct = (c / rows.length) * 100;
            return pct > 0 ? (
              <div key={i} style={{
                width:`${pct}%`, background:color,
                transition:"width 0.6s cubic-bezier(0.22,1,0.36,1)",
              }} />
            ) : null;
          })}
        </div>
        <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap" }}>
          {[
            { label:"None",   count:noSchemes,    color:"#E53E3E" },
            { label:"Low",    count:lowCount,     color:SAFFRON   },
            { label:"Medium", count:medCount,     color:"#3B82F6" },
            { label:"Good",   count:highCoverage, color:IND_GREEN },
          ].map(({ label, count: c, color }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }} />
              <span style={{ fontSize:10, color:th.textMid }}>
                {label} <strong style={{ color:th.text }}>{c}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Central schemes banner — now shows % of total */}
      <div style={{
        background:`linear-gradient(135deg,${NAVY},#1a56db)`,
        borderRadius:14, padding:"13px 16px",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{ fontSize:28 }}>🇮🇳</div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontSize:13, fontWeight:800 }}>
            Central Government Schemes
          </div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:2 }}>
            Available to all states · Apply across India
          </div>
          <div style={{ color:"rgba(255,255,255,0.55)", fontSize:10, marginTop:3 }}>
            {totalSchemes > 0
              ? `${Math.round((centralCount / totalSchemes) * 100)}% of all ${totalSchemes} schemes`
              : "—"}
          </div>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.2)", borderRadius:10,
          padding:"7px 13px", color:"#fff", fontSize:20, fontWeight:800,
        }}>
          {centralCount}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background:th.card, border:`1.5px solid ${th.border}`,
        borderRadius:12, padding:"10px 14px",
        display:"flex", gap:12, flexWrap:"wrap", alignItems:"center",
      }}>
        <div style={{ fontSize:11, color:th.textSub, fontWeight:600, flexShrink:0 }}>Coverage:</div>
        {[
          { label:"None (0)",        color:"#E53E3E" },
          { label:"Low (1–30)",      color:SAFFRON   },
          { label:"Medium (31–100)", color:"#3B82F6" },
          { label:"Good (100+)",     color:IND_GREEN },
        ].map(({ label, color }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />
            <span style={{ fontSize:10, color:th.textMid }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div style={{ display:"flex", gap:4 }}>
        {[
          { id:"count", label:"# Count" },
          { id:"alpha", label:"A–Z" },
        ].map(({ id, label }) => (
          <div key={id} onClick={() => setSortMode(id)} style={{
            padding:"8px 11px", borderRadius:10, fontSize:11, fontWeight:700,
            cursor:"pointer", flexShrink:0,
            background: sortMode === id ? NAVY : th.border,
            color: sortMode === id ? "#fff" : th.textMid,
            border: sortMode === id ? `1.5px solid ${NAVY}` : `1.5px solid ${th.border}`,
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Tier filter chips */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {tierChips.map(({ id, label, color, count: c }) => {
          const active = tierFilter === id;
          return (
            <div key={id} onClick={() => setTierFilter(id)} style={{
              display:"flex", alignItems:"center", gap:4,
              padding:"5px 10px", borderRadius:20, cursor:"pointer",
              fontSize:10, fontWeight:700,
              background: active ? color : th.card,
              color: active ? "#fff" : color,
              border: `1.5px solid ${active ? color : th.border}`,
              transition:"all 0.15s ease",
            }}>
              {label}
              <span style={{
                fontSize:9,
                color: active ? "rgba(255,255,255,0.8)" : th.textSub,
              }}>
                {c}
              </span>
            </div>
          );
        })}
      </div>

      {/* Results count — only shown when a tier filter is active */}
      {tierFilter !== "all" && (
        <div style={{ fontSize:11, color:th.textSub, fontWeight:600, marginTop:-4 }}>
          Showing {filtered.length} of {rows.length} states
        </div>
      )}

      {/* State rows */}
      <div style={{
        background:th.card, border:`1.5px solid ${th.border}`,
        borderRadius:16, overflow:"hidden",
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding:"24px 0", textAlign:"center", color:th.textSub, fontSize:13 }}>
            No states in this tier
          </div>
        ) : (
          filtered.map(({ name, count }, idx) => {
            const color       = coverageColor(count);
            const pct         = Math.round((count / maxCount) * 100);
            const gap = gapToNext(count);
            return (
              <div key={name} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${th.border}` : "none",
              }}>

                {/* Rank or pin */}
                <div style={{
                  width:20, flexShrink:0, textAlign:"center",
                  fontSize: sortMode === "count" ? 10 : 13,
                  fontWeight:800,
                  color: th.textSub,
                }}>
                  {sortMode === "count" ? `#${idx + 1}` : "📍"}
                </div>

                {/* State name + gap hint */}
                <div style={{ width:110, flexShrink:0, minWidth:0 }}>
                  <div style={{
                    fontSize:12, fontWeight:600, color:th.text,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>
                    {name}
                  </div>
                  {gap && (
                    <div style={{ fontSize:9, color:th.textSub, marginTop:1, fontWeight:500 }}>
                      {gap.label}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{
                  flex:1, height:18, background:th.border,
                  borderRadius:6, overflow:"hidden",
                }}>
                  <div style={{
                    height:"100%", borderRadius:6,
                    width: count > 0 ? `${pct}%` : "0%",
                    background:`linear-gradient(90deg,${color},${color}cc)`,
                    transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>

                {/* Count */}
                <div style={{
                  width:38, flexShrink:0, textAlign:"right",
                  fontSize:13, fontWeight:800,
                  color: color,
                }}>
                  {count}
                </div>

                {/* Coverage label */}
                <div style={{
                  width:50, flexShrink:0,
                  fontSize:9, fontWeight:700, color,
                  background:`${color}18`,
                  borderRadius:6, padding:"2px 6px",
                  textAlign:"center",
                }}>
                  {coverageLabel(count)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dynamic insight */}
      <div style={{
        background:th.card2, border:`1.5px dashed ${th.border}`,
        borderRadius:12, padding:"12px 14px",
        fontSize:11, color:th.textSub, lineHeight:1.6,
      }}>
        {insightText}
      </div>
    </div>
  );
}

// ─── REPORTS SECTION ─────────────────────────────────────────────────────────
const TYPE_META = {
  issue:          { icon:"🐛", label:"Bug / Issue",       color:"#DC2626" },
  scheme_request: { icon:"📋", label:"Scheme Request",    color:NAVY      },
  query:          { icon:"❓", label:"Query",             color:IND_GREEN },
  feedback:       { icon:"💡", label:"Feedback",          color:SAFFRON   },
};
const STATUS_META = {
  open:        { label:"Open",        color:"#DC2626",  bg:"#FEF2F2",  emoji:"🔴" },
  in_progress: { label:"In Progress", color:"#D97706",  bg:"#FFFBEB",  emoji:"🟡" },
  resolved:    { label:"Resolved",    color:IND_GREEN,  bg:"#F0FDF4",  emoji:"✅" },
};

// ── Conversation Thread component ──────────────────────────────────────────
function ConversationThread({ report, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const thread = [];

  // Original user message
  thread.push({
    key:    "original",
    who:    "user",
    icon:   "👤",
    label:  report.userName || "User",
    text:   report.message || "—",
    time:   report.createdAt?.seconds
              ? new Date(report.createdAt.seconds * 1000).toLocaleString("en-IN",
                  { day:"numeric", month:"short", year:"2-digit", hour:"2-digit", minute:"2-digit" })
              : "—",
    status: null,
  });

  // Admin replies from replyHistory (chronological)
  const history = Array.isArray(report.replyHistory) ? report.replyHistory : [];
  history.forEach((r, i) => {
    thread.push({
      key:      `reply-${i}`,
      who:      r.who === "user" ? "user" : "admin",
      icon:     r.who === "user" ? "👤" : "🛡️",
      label:    r.who === "user" ? (r.userName || report.userName || "User") : "Admin",
      text:     r.text || "—",
      time:     r.sentAt
                  ? new Date(r.sentAt).toLocaleString("en-IN",
                      { day:"numeric", month:"short", year:"2-digit", hour:"2-digit", minute:"2-digit" })
                  : "—",
      status:   r.status || null,
      isReopen: r.isReopen || false,
    });
  });

  if (thread.length === 1 && !report.adminReply) return null; // nothing beyond original message

  return (
    <div style={{
      background: dark ? "rgba(255,255,255,0.03)" : "#F8FAFF",
      border:`1.5px solid ${NAVY}22`,
      borderRadius:14, padding:"12px 14px",
      display:"flex", flexDirection:"column", gap:0,
    }}>
      <div style={{ fontSize:10, fontWeight:800, color:NAVY, letterSpacing:0.5, marginBottom:10 }}>
        💬 CONVERSATION THREAD ({thread.length} message{thread.length !== 1 ? "s" : ""})
      </div>

      {thread.map((msg, idx) => {
        const isAdmin  = msg.who === "admin";
        const isLast   = idx === thread.length - 1;
        const smeta    = msg.status ? STATUS_META[msg.status] : null;

        return (
          <div key={msg.key} style={{ display:"flex", gap:10, position:"relative" }}>
            {/* Vertical connector line */}
            {!isLast && (
              <div style={{
                position:"absolute",
                left:15, top:32,
                width:2, height:"calc(100% - 4px)",
                background: dark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                borderRadius:1,
              }} />
            )}

            {/* Avatar bubble */}
            <div style={{
              width:30, height:30, borderRadius:"50%", flexShrink:0, zIndex:1,
              background: msg.isReopen
                ? "linear-gradient(135deg,#D97706,#FBBF24)"
                : msg.who === "admin"
                  ? `linear-gradient(135deg,${NAVY},#1a56db)`
                  : `linear-gradient(135deg,${SAFFRON},#f97316)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, boxShadow:"0 2px 6px rgba(0,0,0,0.15)",
            }}>
              {msg.isReopen ? "🔄" : msg.icon}
            </div>

            {/* Bubble content */}
            <div style={{
              flex:1, minWidth:0,
              background: msg.isReopen
                ? (dark ? "rgba(217,119,6,0.15)" : "#FFFBEB")
                : msg.who === "admin"
                  ? (dark ? "rgba(0,53,128,0.2)" : "#EFF6FF")
                  : (dark ? "rgba(255,255,255,0.06)" : "#fff"),
              border:`1.5px solid ${msg.isReopen ? "rgba(217,119,6,0.4)" : msg.who === "admin" ? NAVY+"33" : th.border}`,
              borderRadius: msg.who === "admin" ? "4px 14px 14px 14px" : "14px 14px 14px 4px",
              padding:"9px 12px",
              marginBottom: isLast ? 0 : 12,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                <span style={{
                  fontSize:11, fontWeight:800,
                  color: msg.isReopen ? "#D97706" : msg.who === "admin" ? NAVY : SAFFRON,
                }}>
                  {msg.label}
                </span>
                {msg.isReopen && (
                  <span style={{
                    fontSize:9, fontWeight:800, color:"#92400E",
                    background:"rgba(217,119,6,0.18)",
                    border:"1px solid rgba(217,119,6,0.35)",
                    borderRadius:5, padding:"1px 7px",
                    letterSpacing:0.3,
                  }}>
                    🔄 REOPENED BY USER
                  </span>
                )}
                {smeta && !msg.isReopen && (
                  <span style={{
                    fontSize:9, fontWeight:700, color:smeta.color,
                    background: dark ? `${smeta.color}22` : smeta.bg,
                    border:`1px solid ${smeta.color}44`,
                    borderRadius:5, padding:"1px 6px",
                  }}>
                    {smeta.emoji} {smeta.label}
                  </span>
                )}
                <span style={{ fontSize:9, color:th.textSub, marginLeft:"auto" }}>{msg.time}</span>
              </div>
              {msg.isReopen && (
                <div style={{
                  fontSize:10, fontWeight:700, color:"#92400E",
                  marginBottom:5, letterSpacing:0.2,
                }}>
                  Reason for reopening:
                </div>
              )}
              <div style={{ fontSize:12, color:th.text, lineHeight:1.65, whiteSpace:"pre-wrap" }}>
                {msg.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsSection({ reports, loading, dark, onRefresh, onStatusChange, onLogActivity, isDesktop = false }) {
  const th = THEME[dark ? "dark" : "light"];
  const [filter,      setFilter]      = useState("all"); // "all" | "open" | "in_progress" | "resolved"
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [dateFilter,  setDateFilter]  = useState("all"); // "all" | "today" | "7d" | "30d"
  const [searchQuery, setSearchQuery] = useState("");
  const [reportPage,  setReportPage]  = useState(1);
  const REPORTS_PER_PAGE = 10;
  const [expanded,    setExpanded]    = useState(null);  // expanded report id

  // ── Reply state ────────────────────────────────────────────────────────────
  const [replyText,    setReplyText]    = useState("");
  const [replySending, setReplySending] = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [replyDone,    setReplyDone]    = useState(false);
  const [replyError,   setReplyError]   = useState("");

  // ── NEW: targetStatus tracks admin's intent for the next reply ────────────
  // null = keep report's current status; otherwise one of "open"|"in_progress"|"resolved"
  const [targetStatus, setTargetStatus] = useState(null);

  // Reset reply state whenever a different card is expanded
  useEffect(() => {
    setReplyText("");
    setReplySending(false);
    setAiLoading(false);
    setReplyDone(false);
    setReplyError("");
    setTargetStatus(null);
  }, [expanded]);

  // ── AI Suggest — aware of which status button the admin clicked ───────────
  async function handleAiSuggest(report) {
    setAiLoading(true);
    setReplyError("");
    try {
      const typeLabel     = TYPE_META[report.type]?.label || report.type;
      const effectiveStatus = targetStatus || report.status;

      // Status-specific instructions for the AI
      const statusGuide = {
        open:
          "The admin is keeping this report OPEN to request more specific information from the user.\n" +
          "Write a warm, professional message that:\n" +
          "1. Acknowledges we received their report and are reviewing it.\n" +
          "2. Explains that we need more specific details to help them properly.\n" +
          "3. Clearly instructs them: Your report is being kept open — please open the Yojana Sahay app, go to My Reports, open this report, and use the Add Information section to share the specific details we need.\n" +
          "4. Asks one or two specific clarifying questions based on their report content.\n" +
          "Do NOT promise a resolution. Keep the tone warm, helpful, and encouraging.",
        in_progress:
          "The admin has marked this IN PROGRESS — they are actively working on it.\n" +
          "Reassure the user that we are investigating their concern. Give them an " +
          "encouraging update without overpromising. Do NOT say it is resolved.",
        resolved:
          "The admin has RESOLVED this report.\n" +
          "Write a clear, friendly resolution message. Briefly explain what was done or " +
          "what the user should know/do. Thank them for reaching out and close warmly.",
      }[effectiveStatus] || "Write a helpful, warm response.";

      // Summarise prior replies so AI has full context
      const history = Array.isArray(report.replyHistory) ? report.replyHistory : [];
      const historyContext = history.length
        ? "\n\nPrevious admin replies (for context — do NOT repeat them):\n" +
          history.map((r, i) =>
            `Reply ${i + 1} [${r.status || "—"}]: ${r.text}`
          ).join("\n")
        : "";

      const systemPrompt =
        `You are a warm, professional support agent for Yojana Sahay — a government scheme ` +
        `discovery app for Indian citizens.\n` +
        `Reply in plain text only. No markdown, no bullet points, no headers.\n\n` +
        `Current admin action: ${effectiveStatus.replace("_", " ").toUpperCase()}\n` +
        `Instruction: ${statusGuide}`;

      const userPrompt =
        `Report type: ${typeLabel}\n` +
        `User: ${report.userName || "a user"}\n` +
        `Subject: ${report.subject || "(none)"}\n` +
        `Original message: ${report.message}` +
        `${historyContext}\n\n` +
        `Write a concise admin reply (2–4 sentences) matching the admin action above. ` +
        `End with a polite closing from the Yojana Sahay Team.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:       GROQ_MODEL,
          max_tokens:  300,
          temperature: 0.65,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt   },
          ],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error (${res.status})`);
      }
      const data = await res.json();
      const suggestion = data.choices?.[0]?.message?.content?.trim() || "";
      if (suggestion) setReplyText(suggestion);
    } catch (err) {
      console.error("AI suggest failed:", err);
      setReplyError("AI suggest failed. Write your reply manually.");
    } finally {
      setAiLoading(false);
    }
  }

  // ── Send Admin Reply — respects targetStatus, NOT hardcoded "resolved" ────
  async function handleSendReply(report) {
    if (!replyText.trim()) { setReplyError("Please write a reply first."); return; }
    setReplySending(true);
    setReplyError("");

    // Use admin's chosen status; fall back to current report status
    const statusToSave = targetStatus || report.status;
    let firestoreOk = false;

    try {
      // ── Step 1: Save to Firestore ────────────────────────────────────────
      await updateDoc(doc(db, "reports", report.id), {
        adminReply:   replyText.trim(),
        repliedAt:    serverTimestamp(),
        status:       statusToSave,           // ← respect admin's choice
        replyHistory: arrayUnion({
          text:   replyText.trim(),
          sentAt: new Date().toISOString(),
          status: statusToSave,               // ← record what status this reply was sent under
        }),
      });
      firestoreOk = true;
      onStatusChange(report.id, statusToSave, {
        text:   replyText.trim(),
        sentAt: new Date().toISOString(),
        status: statusToSave,
      });
      onLogActivity?.(
        `Replied to ${report.userName || "a user"}'s report — status: ${statusToSave}`,
        "reports",
        statusToSave === "resolved" ? "resolve" : "reply",
      );
    } catch (err) {
      console.error("❌ Firestore write failed:", err);
      setReplyError(`Firestore error: ${err.message}`);
      setReplySending(false);
      return;
    }

    // ── Step 2: Send email (only if user has email) ──────────────────────
    if (firestoreOk && report.userEmail) {
      try {
        await emailjs.send(
          EJS_SERVICE_ID,
          EJS_REPLY_TID,
          {
            email:            report.userEmail,
            user_name:        report.userName  || "User",
            admin_reply:      replyText.trim(),
            original_message: report.message   || "",
          },
          { publicKey: EJS_PUBLIC_KEY }
        );
      } catch (err) {
        console.error("❌ EmailJS send failed:", err);
        setReplyError(`Reply saved ✓ but email failed: ${err?.text || err?.message || "EmailJS error"}`);
        setReplySending(false);
        setReplyDone(true);
        setReplyText("");
        // Auto-clear flash if not resolved so admin can send more replies
        if (statusToSave !== "resolved") setTimeout(() => setReplyDone(false), 3500);
        return;
      }
    }

    // ── Success ───────────────────────────────────────────────────────────
    setReplyDone(true);
    setReplyText("");
    setReplySending(false);
    // If not resolved, auto-clear the success flash so admin can keep replying
    if (statusToSave !== "resolved") setTimeout(() => setReplyDone(false), 3500);
  }

  const filtered = useMemo(() => {
    const q    = searchQuery.trim().toLowerCase();
    const now  = Date.now();
    const cutoffs = { today: 86400000, "7d": 7 * 86400000, "30d": 30 * 86400000 };
    const cutoff  = cutoffs[dateFilter] || null;

    const list = reports.filter(r => {
      const matchStatus = filter === "all" || r.status === filter;
      const matchType   = typeFilter === "all" || r.type === typeFilter;
      const matchSearch = !q
        || r.id?.toLowerCase().includes(q)
        || r.message?.toLowerCase().includes(q)
        || r.userName?.toLowerCase().includes(q);
      const matchDate   = !cutoff || (() => {
        const ts = r.createdAt?.seconds
          ? r.createdAt.seconds * 1000
          : r.createdAt?.toDate?.()?.getTime?.() || 0;
        return now - ts <= cutoff;
      })();
      return matchStatus && matchType && matchSearch && matchDate;
    });

    // Sort: Open (fresh) → In Progress → Reopened → Resolved
    const getPriority = (r) => {
      if (r.status === "resolved")    return 3;
      if (r.status === "in_progress") return 1;
      if (r.replyHistory?.some(h => h.isReopen)) return 2; // reopened
      return 0; // open, never reopened
    };
    list.sort((a, b) => getPriority(a) - getPriority(b));
    return list;
  }, [reports, filter, typeFilter, searchQuery, dateFilter]);

  // Reset to page 1 whenever filters or search changes
  useEffect(() => { setReportPage(1); }, [filter, typeFilter, searchQuery, dateFilter]);

  // Scroll to top of dashboard whenever page changes
  useEffect(() => {
    document.querySelector("[data-admin-scroll]")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [reportPage]);

  const totalPages    = Math.max(1, Math.ceil(filtered.length / REPORTS_PER_PAGE));
  const pagedReports  = filtered.slice((reportPage - 1) * REPORTS_PER_PAGE, reportPage * REPORTS_PER_PAGE);

  const openCount     = reports.filter(r => r.status === "open").length;
  const progressCount = reports.filter(r => r.status === "in_progress").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;
  const reopenedCount = reports.filter(r =>
    r.replyHistory?.some(h => h.isReopen)
  ).length;

  if (loading) {
    return (
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40, flexDirection:"column", gap:12 }}>
        <div style={{ fontSize:28, animation:"spin 1s linear infinite" }}>⏳</div>
        <div style={{ color:th.textMid, fontSize:13 }}>Loading reports…</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: isDesktop ? "24px 40px 40px" : "16px 14px",
      display:"flex", flexDirection:"column", gap:14,
      maxWidth: isDesktop ? 1400 : "100%",
      margin: isDesktop ? "0 auto" : undefined,
      width:"100%", boxSizing:"border-box",
    }}>

      {/* Summary stats */}
      {isDesktop ? (
        /* Desktop: all 5 stat pills in one row */
        <div style={{ display:"flex", gap:12 }}>
          {[
            { label:"Total",       value:reports.length, color:NAVY      },
            { label:"Open",        value:openCount,      color:"#DC2626" },
            { label:"In Progress", value:progressCount,  color:"#D97706" },
            { label:"Resolved",    value:resolvedCount,  color:IND_GREEN },
            { label:"🔄 Reopened", value:reopenedCount,  color:"#A855F7" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              flex:1, background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:14, padding:"16px 18px",
              borderTop:`3px solid ${color}`,
            }}>
              <div style={{ fontSize:26, fontWeight:800, color:th.text }}>{value}</div>
              <div style={{ fontSize:11, color:th.textSub, marginTop:3, fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>
      ) : (
        /* Mobile: original two-row layout */
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {/* Row 1: Total, Open, In Progress, Resolved */}
          <div style={{ display:"flex", gap:8 }}>
            {[
              { label:"Total",       value:reports.length,  color:NAVY      },
              { label:"Open",        value:openCount,       color:"#DC2626" },
              { label:"In Progress", value:progressCount,   color:"#D97706" },
              { label:"Resolved",    value:resolvedCount,   color:IND_GREEN },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                flex:1, background:th.card, border:`1.5px solid ${th.border}`,
                borderRadius:12, padding:"10px 10px 8px",
                borderTop:`3px solid ${color}`,
              }}>
                <div style={{ fontSize:20, fontWeight:800, color:th.text }}>{value}</div>
                <div style={{ fontSize:9, color:th.textSub, marginTop:2, fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
          {/* Row 2: Reopened full-width card */}
          <div style={{
            background:th.card, border:`1.5px solid ${"#A855F7"}33`,
            borderRadius:12, padding:"10px 14px",
            borderTop:`3px solid #A855F7`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:th.text }}>{reopenedCount}</div>
              <div style={{ fontSize:9, color:th.textSub, marginTop:2, fontWeight:500 }}>🔄 Reopened</div>
            </div>
            <div style={{
              fontSize:10, fontWeight:700, color:"#A855F7",
              background: dark ? "rgba(168,85,247,0.15)" : "#F5F3FF",
              border:"1px solid rgba(168,85,247,0.35)",
              borderRadius:8, padding:"4px 10px",
            }}>
              {reopenedCount === 0
                ? "None yet"
                : reopenedCount === 1
                  ? "1 report reopened by user"
                  : `${reopenedCount} reports reopened by users`}
            </div>
          </div>
        </div>
      )}

      {/* Filters + Refresh */}
      {isDesktop ? (
        /* Desktop: all filters + refresh in one compact row */
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {/* Status pills */}
          {[
            { v:"all",         l:"All"              },
            { v:"open",        l:"🔴 Open"          },
            { v:"in_progress", l:"🟡 In Progress"   },
            { v:"resolved",    l:"✅ Resolved"       },
          ].map(({ v, l }) => (
            <div key={v} onClick={() => setFilter(v)} style={{
              padding:"6px 13px", borderRadius:20, fontSize:11, fontWeight:700,
              cursor:"pointer", flexShrink:0,
              background: filter === v ? NAVY : th.border,
              color:      filter === v ? "#fff" : th.textMid,
              border:     filter === v ? `1.5px solid ${NAVY}` : `1.5px solid transparent`,
              transition:"all 0.18s",
            }}>
              {l}
            </div>
          ))}

          {/* Vertical divider */}
          <div style={{ width:1, height:22, background:th.border, flexShrink:0 }} />

          {/* Type pills */}
          <div onClick={() => setTypeFilter("all")} style={{
            padding:"5px 11px", borderRadius:20, fontSize:10, fontWeight:700,
            cursor:"pointer", flexShrink:0,
            background: typeFilter === "all" ? SAFFRON : th.border,
            color:      typeFilter === "all" ? "#fff"   : th.textMid,
            transition:"all 0.18s",
          }}>All Types</div>
          {Object.entries(TYPE_META).map(([v, meta]) => (
            <div key={v} onClick={() => setTypeFilter(v)} style={{
              padding:"5px 11px", borderRadius:20, fontSize:10, fontWeight:700,
              cursor:"pointer", flexShrink:0,
              background: typeFilter === v ? meta.color : th.border,
              color:      typeFilter === v ? "#fff"     : th.textMid,
              transition:"all 0.18s",
            }}>
              {meta.icon} {meta.label}
            </div>
          ))}

          {/* Refresh pushed to right */}
          <div style={{ marginLeft:"auto" }}>
            <div onClick={loading ? undefined : onRefresh} style={{
              padding:"7px 14px", borderRadius:10, fontSize:11,
              fontWeight:700, cursor: loading ? "default" : "pointer",
              background:th.card, border:`1.5px solid ${th.border}`, color:th.textMid,
              display:"flex", alignItems:"center", gap:5,
              opacity: loading ? 0.6 : 1,
            }}>
              <span style={loading ? { display:"inline-block", animation:"ys-spin 0.8s linear infinite" } : {}}>↻</span>
              {loading ? "Refreshing…" : "Refresh"}
            </div>
          </div>
        </div>
      ) : (
        /* Mobile: original separate rows */
        <>
          {/* Refresh button */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div onClick={loading ? undefined : onRefresh} style={{
              padding:"7px 14px", borderRadius:10, fontSize:11,
              fontWeight:700, cursor: loading ? "default" : "pointer",
              background:th.card, border:`1.5px solid ${th.border}`, color:th.textMid,
              display:"flex", alignItems:"center", gap:5,
              opacity: loading ? 0.6 : 1,
            }}>
              <span style={loading ? { display:"inline-block", animation:"ys-spin 0.8s linear infinite" } : {}}>↻</span>
              {loading ? "Refreshing…" : "Refresh"}
            </div>
          </div>

          {/* Status filter pills */}
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {[
              { v:"all",         l:"All"        },
              { v:"open",        l:"🔴 Open"    },
              { v:"in_progress", l:"🟡 In Progress" },
              { v:"resolved",    l:"✅ Resolved" },
            ].map(({ v, l }) => (
              <div key={v} onClick={() => setFilter(v)} style={{
                padding:"6px 13px", borderRadius:20, fontSize:11, fontWeight:700,
                cursor:"pointer", flexShrink:0,
                background: filter === v ? NAVY : th.border,
                color:      filter === v ? "#fff" : th.textMid,
                border:     filter === v ? `1.5px solid ${NAVY}` : `1.5px solid transparent`,
                transition:"all 0.18s",
              }}>
                {l}
              </div>
            ))}
          </div>

          {/* Type filter pills */}
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            <div onClick={() => setTypeFilter("all")} style={{
              padding:"5px 11px", borderRadius:20, fontSize:10, fontWeight:700,
              cursor:"pointer",
              background: typeFilter === "all" ? SAFFRON : th.border,
              color:      typeFilter === "all" ? "#fff"   : th.textMid,
              transition:"all 0.18s",
            }}>All Types</div>
            {Object.entries(TYPE_META).map(([v, meta]) => (
              <div key={v} onClick={() => setTypeFilter(v)} style={{
                padding:"5px 11px", borderRadius:20, fontSize:10, fontWeight:700,
                cursor:"pointer",
                background: typeFilter === v ? meta.color : th.border,
                color:      typeFilter === v ? "#fff"     : th.textMid,
                transition:"all 0.18s",
              }}>
                {meta.icon} {meta.label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Date filter pills */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {[
          { v:"all",  l:"🗓 All time"   },
          { v:"today",l:"📅 Today"      },
          { v:"7d",   l:"📆 Last 7 days"},
          { v:"30d",  l:"🗃 Last 30 days"},
        ].map(({ v, l }) => (
          <div key={v} onClick={() => setDateFilter(v)} style={{
            padding:"5px 11px", borderRadius:20, fontSize:10, fontWeight:700,
            cursor:"pointer", flexShrink:0,
            background: dateFilter === v ? SAFFRON : th.border,
            color:      dateFilter === v ? "#fff"   : th.textMid,
            transition:"all 0.18s",
          }}>
            {l}
          </div>
        ))}
      </div>

      {/* Search box */}
      <div style={{ position:"relative" }}>
        <span style={{
          position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
          fontSize:13, color:th.textSub, pointerEvents:"none",
        }}>🔍</span>
        <input
          className="ys-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by Report ID, message, or user name…"
          style={{
            width:"100%", boxSizing:"border-box",
            padding:"9px 34px 9px 34px",
            background:th.inputBg, border:`1.5px solid ${th.border}`,
            borderRadius:12, fontSize:12, color:th.text,
            outline:"none",
          }}
        />
        {searchQuery && (
          <span
            onClick={() => setSearchQuery("")}
            style={{
              position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              fontSize:14, color:th.textSub, cursor:"pointer", lineHeight:1,
            }}
          >✕</span>
        )}
      </div>

      {/* Results count */}
      {(searchQuery || filter !== "all" || typeFilter !== "all") && filtered.length > 0 && (
        <div style={{ fontSize:11, color:th.textSub, fontWeight:600, marginTop:-4 }}>
          {filtered.length} report{filtered.length !== 1 ? "s" : ""} found
          {totalPages > 1 && ` — page ${reportPage} of ${totalPages}`}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          background:th.card, border:`1.5px solid ${th.border}`,
          borderRadius:16, padding:"36px 20px",
          textAlign:"center",
        }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
          <div style={{ fontSize:14, fontWeight:700, color:th.text }}>No reports found</div>
          <div style={{ fontSize:11, color:th.textSub, marginTop:5 }}>
            {searchQuery
              ? `No results for "${searchQuery}".`
              : filter === "all" ? "Users haven't submitted any reports yet." : `No ${filter} reports.`}
          </div>
        </div>
      )}

      {/* Report cards — grouped by status */}
      {pagedReports.map((report, idx) => {
        const typeMeta   = TYPE_META[report.type]   || { icon:"📝", label:report.type, color:NAVY };
        const statusMeta = STATUS_META[report.status] || STATUS_META.open;
        const isExpanded = expanded === report.id;
        const isReopened = report.replyHistory?.some(r => r.isReopen);

        // Determine this card's status group
        const group = report.status === "resolved"    ? "resolved"
                    : report.status === "in_progress" ? "in_progress"
                    : isReopened                       ? "reopened"
                    : "open";

        const GROUP_META = {
          open:        { label:"🔴 Open",         color:"#DC2626", bg:"rgba(220,38,38,0.08)"  },
          in_progress: { label:"🟡 In Progress",  color:"#D97706", bg:"rgba(245,158,11,0.08)" },
          reopened:    { label:"🔁 Reopened",      color:"#A855F7", bg:"rgba(168,85,247,0.08)" },
          resolved:    { label:"✅ Resolved",      color:IND_GREEN, bg:"rgba(19,136,8,0.06)"   },
        };
        const gMeta = GROUP_META[group];

        // Show a section divider when group changes
        const prevReport   = pagedReports[idx - 1];
        const prevReopened = prevReport?.replyHistory?.some(r => r.isReopen);
        const prevGroup    = !prevReport ? null
                           : prevReport.status === "resolved"    ? "resolved"
                           : prevReport.status === "in_progress" ? "in_progress"
                           : prevReopened                         ? "reopened"
                           : "open";
        const showGroupHeader = group !== prevGroup;

        // Count reports in this group (for header badge)
        const groupCount = filtered.filter(r => {
          const rReopened = r.replyHistory?.some(h => h.isReopen);
          const rGroup = r.status === "resolved"    ? "resolved"
                       : r.status === "in_progress" ? "in_progress"
                       : rReopened                   ? "reopened"
                       : "open";
          return rGroup === group;
        }).length;

        // Status color for left border (reopened overrides open color)
        const statusColor = group === "reopened" ? "#A855F7" : statusMeta.color;

        return (
          <React.Fragment key={report.id}>

            {/* ── Group section header ── */}
            {showGroupHeader && (
              <div style={{
                display:"flex", alignItems:"center", gap:8,
                marginTop: idx > 0 ? 6 : 0,
              }}>
                <div style={{ height:1.5, flex:1, background: gMeta.color + "33", borderRadius:1 }} />
                <div style={{
                  display:"flex", alignItems:"center", gap:5,
                  background: gMeta.bg,
                  border:`1.5px solid ${gMeta.color}44`,
                  borderRadius:20, padding:"3px 10px",
                }}>
                  <span style={{ fontSize:10, fontWeight:800, color: gMeta.color }}>
                    {gMeta.label}
                  </span>
                  <span style={{
                    fontSize:9, fontWeight:800, color:"#fff",
                    background: gMeta.color,
                    borderRadius:8, padding:"1px 6px",
                    minWidth:14, textAlign:"center",
                  }}>
                    {groupCount}
                  </span>
                </div>
                <div style={{ height:1.5, flex:1, background: gMeta.color + "33", borderRadius:1 }} />
              </div>
            )}

            {/* ── Report card ── */}
            <div style={{
              background: th.card,
              borderTop:    `1.5px solid ${isExpanded ? typeMeta.color : th.border}`,
              borderRight:  `1.5px solid ${isExpanded ? typeMeta.color : th.border}`,
              borderBottom: `1.5px solid ${isExpanded ? typeMeta.color : th.border}`,
              borderLeft:   `4px solid ${statusColor}`,
              borderRadius:16, overflow:"hidden",
              transition:"all 0.2s",
              boxShadow: isExpanded ? `0 4px 20px ${typeMeta.color}22` : `inset 3px 0 0 ${statusColor}22`,
            }}>
            {/* Card header — always visible */}
            <div
              onClick={() => setExpanded(isExpanded ? null : report.id)}
              style={{ padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"flex-start" }}
            >
              {/* Type icon */}
              <div style={{
                width:38, height:38, borderRadius:11, flexShrink:0,
                background: dark ? `${typeMeta.color}22` : `${typeMeta.color}12`,
                border:`1.5px solid ${typeMeta.color}44`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
              }}>
                {typeMeta.icon}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                {/* Row: type + status */}
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <span style={{
                    fontSize:10, fontWeight:700, color:typeMeta.color,
                    background: dark ? `${typeMeta.color}22` : `${typeMeta.color}12`,
                    border:`1px solid ${typeMeta.color}33`,
                    borderRadius:6, padding:"2px 7px",
                  }}>
                    {typeMeta.label}
                  </span>
                  <span style={{
                    fontSize:10, fontWeight:700,
                    color: dark ? statusMeta.color : statusMeta.color,
                    background: dark ? `${statusMeta.color}22` : statusMeta.bg,
                    border:`1px solid ${statusMeta.color}44`,
                    borderRadius:6, padding:"2px 7px",
                  }}>
                    {statusMeta.label}
                  </span>
                  {isReopened && (
                    <span style={{
                      fontSize:10, fontWeight:700, color:"#D97706",
                      background: dark ? "rgba(217,119,6,0.18)" : "#FFFBEB",
                      border:"1px solid rgba(217,119,6,0.4)",
                      borderRadius:6, padding:"2px 7px",
                    }}>
                      🔄 Reopened
                    </span>
                  )}
                </div>

                {/* Subject or message preview */}
                <div style={{
                  fontSize:13, fontWeight:700, color:th.text,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  marginBottom:3,
                }}>
                  {report.subject || report.message?.slice(0,60) || "No subject"}
                </div>

                {/* User + time */}
                <div style={{ fontSize:10, color:th.textSub, display:"flex", gap:8 }}>
                  <span>👤 {report.userName || "Anonymous"}</span>
                  <span>🕐 {timeAgo(report.createdAt)}</span>
                  {report.lang && <span>🌐 {report.lang === "hi" ? "Hindi" : "English"}</span>}
                </div>
              </div>

              <div style={{ color:th.textSub, fontSize:16, flexShrink:0, transition:"transform 0.2s", transform:isExpanded?"rotate(90deg)":"rotate(0deg)" }}>›</div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div style={{ borderTop:`1px solid ${th.border}`, padding: isDesktop ? "20px 28px" : "14px 16px", display:"flex", flexDirection: isDesktop ? "row" : "column", gap: isDesktop ? 20 : 12, alignItems:"flex-start" }}>

                {/* ── Left col: message + submitted-by ── */}
                <div style={isDesktop ? { flex:"1 1 0", minWidth:0, display:"flex", flexDirection:"column", gap:12 } : { display:"contents" }}>

                {/* Full message */}
                <div style={{
                  background: dark ? "rgba(255,255,255,0.04)" : "#f8f9fa",
                  border:`1px solid ${th.border}`, borderRadius:12,
                  padding:"12px 14px",
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:th.textSub, marginBottom:6, letterSpacing:0.4 }}>MESSAGE</div>
                  <div style={{ fontSize:13, color:th.text, lineHeight:1.65, whiteSpace:"pre-wrap" }}>
                    {report.message || "—"}
                  </div>
                </div>

                {/* User contact info */}
                <div style={{
                  background: dark ? "rgba(255,255,255,0.04)" : "#f8f9fa",
                  border:`1px solid ${th.border}`, borderRadius:12,
                  padding:"12px 14px", display:"flex", flexDirection:"column", gap:6,
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:th.textSub, marginBottom:2, letterSpacing:0.4 }}>SUBMITTED BY</div>
                  {[
                    { icon:"👤", label:report.userName || "Anonymous" },
                    report.userPhone && { icon:"📱", label:`+91 ${report.userPhone}` },
                    report.userEmail && { icon:"✉️", label:report.userEmail },
                    { icon:"🆔", label:report.uid || "—", mono:true },
                    { icon:"🗓", label:report.createdAt?.seconds
                        ? new Date(report.createdAt.seconds * 1000).toLocaleString("en-IN", {
                            day:"numeric", month:"short", year:"numeric",
                            hour:"2-digit", minute:"2-digit",
                          })
                        : "—"
                    },
                  ].filter(Boolean).map(({ icon, label, mono }, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13, flexShrink:0 }}>{icon}</span>
                      <span style={{
                        fontSize:12, color:th.text, fontWeight:600,
                        fontFamily: mono ? "monospace" : "inherit",
                        wordBreak:"break-all",
                      }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                </div>{/* end left col */}

                {/* ── Right col: report details + status + thread + reply ── */}
                <div style={isDesktop ? { flex:"1.3 1 0", minWidth:0, display:"flex", flexDirection:"column", gap:12 } : { display:"contents" }}>

                {/* ── REPORT DETAILS ── */}
                <div style={{
                  background: dark ? "rgba(255,153,51,0.07)" : "#FFFBEB",
                  border:`1px solid ${SAFFRON}44`, borderRadius:12,
                  padding:"12px 14px", display:"flex", flexDirection:"column", gap:7,
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:SAFFRON, marginBottom:2, letterSpacing:0.4 }}>
                    📋 REPORT DETAILS
                  </div>
                  {[
                    { icon:"🪪", label:"Report ID", value:report.id, mono:true },
                    { icon:"📅", label:"Submitted",  value: report.createdAt?.seconds
                        ? new Date(report.createdAt.seconds * 1000).toLocaleString("en-IN", {
                            day:"numeric", month:"short", year:"numeric",
                            hour:"2-digit", minute:"2-digit",
                          })
                        : "—"
                    },
                    { icon:"💬", label:"Last Reply", value: report.repliedAt?.seconds
                        ? new Date(report.repliedAt.seconds * 1000).toLocaleString("en-IN", {
                            day:"numeric", month:"short", year:"numeric",
                            hour:"2-digit", minute:"2-digit",
                          })
                        : "No reply yet"
                    },
                    { icon:"🌐", label:"Language",   value: report.lang === "hi" ? "Hindi" : "English" },
                  ].map(({ icon, label, value, mono }) => (
                    <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                      <span style={{ fontSize:11, color:th.textSub, display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                        <span>{icon}</span> {label}
                      </span>
                      <span style={{
                        fontSize:11, fontWeight:700, color:th.text,
                        fontFamily: mono ? "monospace" : "inherit",
                        textAlign:"right", wordBreak:"break-all",
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── STATUS CHANGER — also sets AI intent ── */}
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:th.textSub, marginBottom:8, letterSpacing:0.4 }}>
                    UPDATE STATUS
                  </div>
                  <div style={{ display:"flex", gap:7 }}>
                    {Object.entries(STATUS_META).map(([v, meta]) => {
                      const isActive  = report.status === v;
                      const isTarget  = (targetStatus || report.status) === v;
                      return (
                        <div
                          key={v}
                          onClick={() => {
                            onStatusChange(report.id, v);   // update Firestore immediately
                            setTargetStatus(v);             // set AI + send intent
                            setReplyDone(false);
                          }}
                          style={{
                            flex:1, padding:"9px 6px",
                            borderRadius:10, textAlign:"center",
                            fontSize:10, fontWeight:700, cursor:"pointer",
                            background: isTarget
                              ? (dark ? `${meta.color}30` : meta.bg)
                              : th.border,
                            color:  isTarget ? meta.color : th.textMid,
                            border: `1.5px solid ${isTarget ? meta.color : "transparent"}`,
                            transition:"all 0.18s",
                            boxShadow: isTarget ? `0 2px 10px ${meta.color}33` : "none",
                          }}
                        >
                          {meta.emoji} {meta.label}
                          {isActive && !isTarget && (
                            <div style={{ fontSize:8, color:th.textSub, marginTop:1 }}>current</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Intent hint banner */}
                  {targetStatus && (
                    <div style={{
                      marginTop:8,
                      background: dark
                        ? `${STATUS_META[targetStatus].color}18`
                        : `${STATUS_META[targetStatus].bg}`,
                      border:`1px dashed ${STATUS_META[targetStatus].color}66`,
                      borderRadius:8, padding:"6px 10px",
                      fontSize:10, color:STATUS_META[targetStatus].color, fontWeight:600,
                    }}>
                      {STATUS_META[targetStatus].emoji} AI Suggest & Send Reply will use{" "}
                      <strong>{STATUS_META[targetStatus].label}</strong> intent
                    </div>
                  )}
                </div>

                {/* ── CONVERSATION THREAD ── */}
                <ConversationThread report={report} dark={dark} />

                {/* ── ADMIN REPLY SECTION ── */}
                <div style={{
                  background: dark ? "rgba(0,53,128,0.12)" : "#EFF6FF",
                  border: `1.5px solid ${NAVY}33`,
                  borderRadius:14, padding:"14px 14px",
                  display:"flex", flexDirection:"column", gap:10,
                }}>
                  <div style={{ fontSize:10, fontWeight:800, color:NAVY, letterSpacing:0.5 }}>
                    ✉️ {report.status === "resolved" ? "CASE CLOSED — ADD A NOTE" : "REPLY TO USER"}
                  </div>

                  {/* Success flash (auto-clears if not resolved) */}
                  {replyDone && (() => {
                    const s = targetStatus || report.status;
                    const flashMap = {
                      open:        { bg: dark?"rgba(220,38,38,0.15)":"#FEF2F2", border:"#DC262655", color:"#DC2626", text:"✓ Acknowledged — report kept Open" },
                      in_progress: { bg: dark?"rgba(217,119,6,0.15)":"#FFFBEB",  border:"#D9770655", color:"#D97706", text:"✓ Reply sent — marked In Progress" },
                      resolved:    { bg: dark?"rgba(19,136,8,0.2)":"#F0FDF4",    border:`${IND_GREEN}`,  color:IND_GREEN, text:"✅ Reply sent & case Resolved!" },
                    };
                    const f = flashMap[s] || flashMap.resolved;
                    return (
                      <div style={{
                        background:f.bg, border:`1.5px solid ${f.border}`,
                        borderRadius:10, padding:"10px 12px",
                        fontSize:13, fontWeight:700, color:f.color, textAlign:"center",
                      }}>
                        {f.text}
                      </div>
                    );
                  })()}

                  {/* Reply form — stays open UNLESS status is resolved AND replyDone flash is showing */}
                  {!(report.status === "resolved" && replyDone) && (
                    <>
                      <div style={{ position:"relative" }}>
                        <textarea
                          value={replyText}
                          onChange={e => { setReplyText(e.target.value.slice(0, 800)); setReplyError(""); }}
                          placeholder={
                            !targetStatus
                              ? "Select a status above first, then write your reply… or use ✨ AI Suggest"
                              : `Write your reply (${STATUS_META[targetStatus]?.label} intent)… or use ✨ AI Suggest`
                          }
                          rows={4}
                          style={{
                            width:"100%", boxSizing:"border-box",
                            padding:"11px 12px", borderRadius:10,
                            border:`1.5px solid ${replyError ? "#DC2626" : th.border}`,
                            background:th.inputBg, color:th.text,
                            fontSize:13, outline:"none", resize:"none",
                            lineHeight:1.6, fontFamily:"inherit",
                            transition:"border-color 0.18s",
                          }}
                          onFocus={e => (e.target.style.borderColor = NAVY)}
                          onBlur={e  => (e.target.style.borderColor = replyError ? "#DC2626" : th.border)}
                        />
                        <div style={{
                          position:"absolute", bottom:8, right:10,
                          fontSize:9, color:replyText.length >= 700 ? "#DC2626" : th.textSub,
                          fontWeight:600, pointerEvents:"none",
                        }}>
                          {replyText.length} / 800
                        </div>
                      </div>

                      {/* Error */}
                      {replyError && (
                        <div style={{ fontSize:11, color:"#DC2626", fontWeight:600 }}>
                          ⚠️ {replyError}
                        </div>
                      )}

                      {/* Buttons row */}
                      <div style={{ display:"flex", gap:8 }}>
                        {/* AI Suggest */}
                        <div
                          onClick={() => !aiLoading && handleAiSuggest(report)}
                          style={{
                            flex:1, padding:"10px 8px",
                            borderRadius:10, textAlign:"center",
                            fontSize:11, fontWeight:700, cursor: aiLoading ? "default" : "pointer",
                            background: dark ? "rgba(139,92,246,0.15)" : "#F5F3FF",
                            border:`1.5px solid ${VIOLET}55`,
                            color: aiLoading ? th.textSub : VIOLET,
                            transition:"all 0.18s",
                            opacity: aiLoading ? 0.7 : 1,
                          }}
                        >
                          {aiLoading
                            ? "⏳ Thinking…"
                            : targetStatus
                              ? `✨ AI for ${STATUS_META[targetStatus]?.label}`
                              : "✨ AI Suggest"}
                        </div>

                        {/* Send Reply */}
                        <div
                          onClick={() => !replySending && handleSendReply(report)}
                          style={{
                            flex:2, padding:"10px 8px",
                            borderRadius:10, textAlign:"center",
                            fontSize:12, fontWeight:800,
                            cursor: replySending ? "default" : "pointer",
                            background: replySending
                              ? th.border
                              : targetStatus === "resolved"
                                ? `linear-gradient(135deg,${IND_GREEN},#16a34a)`
                                : targetStatus === "in_progress"
                                  ? `linear-gradient(135deg,#D97706,#F59E0B)`
                                  : `linear-gradient(135deg,${NAVY},rgba(0,53,128,0.85))`,
                            color: replySending ? th.textSub : "#fff",
                            boxShadow: replySending ? "none" : `0 4px 16px ${NAVY}44`,
                            transition:"all 0.2s",
                            opacity: replySending ? 0.7 : 1,
                          }}
                        >
                          {replySending
                            ? "Sending…"
                            : report.userEmail
                              ? `📨 Send & ${targetStatus ? STATUS_META[targetStatus]?.label : "Save"}`
                              : `💾 Save & ${targetStatus ? STATUS_META[targetStatus]?.label : "Update"}`}
                        </div>
                      </div>

                      {/* No email warning */}
                      {!report.userEmail && (
                        <div style={{
                          fontSize:10, color:SAFFRON, fontWeight:600,
                          background: dark ? "rgba(255,153,51,0.1)" : "#FFFBEB",
                          border:`1px solid ${SAFFRON}55`,
                          borderRadius:8, padding:"6px 10px",
                        }}>
                          ⚠️ No email on file — reply will be saved to Firestore but not emailed.
                        </div>
                      )}
                    </>
                  )}

                  {/* Resolved & done — locked state */}
                  {report.status === "resolved" && replyDone && (
                    <div style={{
                      textAlign:"center", padding:"8px 0",
                      fontSize:11, color:th.textSub,
                    }}>
                      This report is closed. Reopen it by clicking <strong style={{ color:"#DC2626" }}>Open</strong> or <strong style={{ color:"#D97706" }}>In Progress</strong> above.
                    </div>
                  )}
                </div>

                </div>{/* end right col */}
              </div>
            )}
          </div>
          </React.Fragment>
        );
      })}

      <div style={{ height:8 }} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          gap:6, paddingBottom:8,
        }}>
          {/* Prev */}
          <div
            onClick={() => reportPage > 1 && setReportPage(p => p - 1)}
            style={{
              padding:"6px 13px", borderRadius:20, fontSize:11, fontWeight:700,
              cursor: reportPage > 1 ? "pointer" : "default",
              opacity: reportPage > 1 ? 1 : 0.35,
              background: th.card, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >‹ Prev</div>

          {/* Page pills */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const isActive = p === reportPage;
            const nearby = Math.abs(p - reportPage) <= 1 || p === 1 || p === totalPages;
            if (!nearby) {
              if (p === reportPage - 2 || p === reportPage + 2)
                return <span key={p} style={{ color:th.textSub, fontSize:11 }}>…</span>;
              return null;
            }
            return (
              <div
                key={p}
                onClick={() => setReportPage(p)}
                style={{
                  minWidth:30, height:30, display:"flex", alignItems:"center", justifyContent:"center",
                  borderRadius:10, fontSize:11, fontWeight:700, cursor:"pointer",
                  background: isActive ? NAVY : th.card,
                  color:      isActive ? "#fff" : th.textMid,
                  border:`1.5px solid ${isActive ? NAVY : th.border}`,
                  transition:"all 0.15s", userSelect:"none",
                }}
              >{p}</div>
            );
          })}

          {/* Next */}
          <div
            onClick={() => reportPage < totalPages && setReportPage(p => p + 1)}
            style={{
              padding:"6px 13px", borderRadius:20, fontSize:11, fontWeight:700,
              cursor: reportPage < totalPages ? "pointer" : "default",
              opacity: reportPage < totalPages ? 1 : 0.35,
              background: th.card, border:`1.5px solid ${th.border}`,
              color: th.textMid, userSelect:"none",
            }}
          >Next ›</div>
        </div>
      )}
    </div>
  );
}

// ─── EXPORT MODAL ─────────────────────────────────────────────────────────────
function ExportModal({ steps, currentStep, done, totalUsers, totalReports }) {
  const progress = done ? 100 : currentStep < 0 ? 2
    : Math.round(((currentStep + 1) / steps.length) * 100);

  // Blinking cursor tick
  const [tick, setTick] = React.useState(true);
  React.useEffect(() => {
    if (done) return;
    const id = setInterval(() => setTick(t => !t), 520);
    return () => clearInterval(id);
  }, [done]);

  // Fake PDF skeleton lines
  const LINE_WIDTHS = [88, 62, 80, 44, 74, 56, 84, 40, 70, 64, 50, 80, 36, 90, 60];
  const visibleLines = done
    ? LINE_WIDTHS.length
    : Math.floor((progress / 100) * LINE_WIDTHS.length);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ys-in    { from{opacity:0;transform:scale(.9) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes ys-spin  { to{transform:rotate(360deg)} }
        @keyframes ys-shim  { 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }
        @keyframes ys-ring  { 0%{box-shadow:0 0 0 0 rgba(255,153,51,.45)} 70%{box-shadow:0 0 0 11px rgba(255,153,51,0)} 100%{box-shadow:0 0 0 0 rgba(255,153,51,0)} }
        @keyframes ys-check { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
        @keyframes ys-linein{ from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }
        @keyframes ys-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ys-done  { 0%{transform:scale(0) rotate(-18deg);opacity:0} 60%{transform:scale(1.18) rotate(4deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes ys-glow  { 0%,100%{box-shadow:0 0 14px rgba(19,136,8,.5)} 50%{box-shadow:0 0 30px rgba(19,136,8,.9)} }
        @keyframes ys-fslide{ from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ys-dots  { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
        .ys-card  { animation:ys-in .38s cubic-bezier(.34,1.56,.64,1) forwards }
        .ys-spin  { animation:ys-spin 1.3s linear infinite; display:inline-block }
        .ys-check { animation:ys-check .38s cubic-bezier(.34,1.56,.64,1) forwards }
        .ys-done  { animation:ys-done .5s cubic-bezier(.34,1.56,.64,1) forwards }
        .ys-glow  { animation:ys-glow 1.5s ease-in-out infinite }
        .ys-fslide{ animation:ys-fslide .4s ease forwards }
        .ys-line  { animation:ys-linein .28s ease forwards; transform-origin:left }
        .ys-dot1  { animation:ys-dots 1.2s .0s infinite ease-in-out }
        .ys-dot2  { animation:ys-dots 1.2s .2s infinite ease-in-out }
        .ys-dot3  { animation:ys-dots 1.2s .4s infinite ease-in-out }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position:"fixed", inset:0, zIndex:99998,
        background:"rgba(0,0,0,0.74)",
        backdropFilter:"blur(10px)",
        WebkitBackdropFilter:"blur(10px)",
      }} />

      {/* Card */}
      <div style={{
        position:"fixed", inset:0, zIndex:99999,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20,
      }}>
        <div className="ys-card" style={{
          width:"100%", maxWidth:448,
          background:"linear-gradient(155deg,#0d1117 0%,#131920 55%,#0d1117 100%)",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:24,
          overflow:"hidden",
          boxShadow:"0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,153,51,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>

          {/* Rainbow top strip */}
          <div style={{
            height:3,
            background:`linear-gradient(90deg,${NAVY} 0%,${SAFFRON} 45%,${IND_GREEN} 100%)`,
          }} />

          {/* ── Header ── */}
          <div style={{ padding:"20px 24px 14px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:48, height:48, borderRadius:14, flexShrink:0,
              background:"linear-gradient(135deg,#192240,#0d1830)",
              border:"1.5px solid rgba(255,153,51,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              animation: done ? "none" : "ys-ring 2s ease-in-out infinite",
            }}>
              {done
                ? <span className="ys-done" style={{ fontSize:24 }}>✅</span>
                : <span className="ys-spin" style={{ fontSize:22 }}>⚙️</span>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:"#f0f0f0", fontSize:15, fontWeight:800, letterSpacing:-0.3 }}>
                {done ? "Report Ready!" : "Generating Full Report"}
              </div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:11, marginTop:2 }}>
                {done
                  ? "Opening PDF in a new window…"
                  : `${totalUsers} users · ${totalReports} reports · all sections`}
              </div>
            </div>
            {/* Animated dots (when processing) */}
            {!done && (
              <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                {["ys-dot1","ys-dot2","ys-dot3"].map(cls => (
                  <div key={cls} className={cls} style={{
                    width:6, height:6, borderRadius:"50%",
                    background:SAFFRON,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* ── Progress bar ── */}
          <div style={{ padding:"0 24px 14px" }}>
            <div style={{
              height:7, borderRadius:10,
              background:"rgba(255,255,255,0.06)",
              overflow:"hidden", position:"relative",
            }}>
              <div style={{
                height:"100%", borderRadius:10,
                width:`${progress}%`,
                background:`linear-gradient(90deg,${NAVY},${SAFFRON}${done ? "" : ","+IND_GREEN})`,
                transition:"width 0.55s cubic-bezier(.22,1,.36,1)",
                position:"relative", overflow:"hidden",
              }}>
                {!done && (
                  <div style={{
                    position:"absolute", inset:0,
                    background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.28) 50%,transparent 100%)",
                    animation:"ys-shim 1.6s ease-in-out infinite",
                  }} />
                )}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", fontWeight:600 }}>
                {done ? "✓ All sections complete" : `${steps.length - Math.max(0, currentStep + 1)} steps remaining`}
              </div>
              <div style={{
                fontSize:10, fontWeight:800,
                color: done ? IND_GREEN : SAFFRON,
                transition:"color 0.4s",
              }}>
                {progress}%
              </div>
            </div>
          </div>

          {/* ── Body: Steps + PDF preview ── */}
          <div style={{ padding:"0 24px 16px", display:"flex", gap:14 }}>

            {/* Steps pipeline */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:8, fontWeight:800, letterSpacing:1.2,
                color:"rgba(255,255,255,0.22)", textTransform:"uppercase", marginBottom:8,
              }}>Export Pipeline</div>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {steps.map((step, i) => {
                  const isComplete = i <= currentStep;
                  const isActive   = i === currentStep + 1 && !done;
                  return (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:8,
                      padding:"5px 8px", borderRadius:8,
                      background: done
                        ? "rgba(19,136,8,0.06)"
                        : isActive
                          ? "rgba(255,153,51,0.09)"
                          : isComplete
                            ? "rgba(19,136,8,0.05)"
                            : "transparent",
                      border: done
                        ? "1px solid rgba(19,136,8,0.12)"
                        : isActive
                          ? "1px solid rgba(255,153,51,0.22)"
                          : "1px solid transparent",
                      transition:"all 0.35s ease",
                    }}>
                      {/* Status dot / check */}
                      <div style={{ width:16, height:16, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {(isComplete || done) ? (
                          <span className="ys-check" style={{ fontSize:11, color:IND_GREEN, fontWeight:900 }}>✓</span>
                        ) : isActive ? (
                          <div style={{
                            width:7, height:7, borderRadius:"50%",
                            background:SAFFRON,
                            animation:"ys-ring 1.3s ease-in-out infinite",
                          }} />
                        ) : (
                          <div style={{
                            width:5, height:5, borderRadius:"50%",
                            background:"rgba(255,255,255,0.1)",
                          }} />
                        )}
                      </div>
                      <div style={{
                        fontSize:10, fontWeight:(isActive && !done) ? 700 : 500,
                        color: done
                          ? IND_GREEN
                          : isComplete
                            ? "rgba(19,136,8,0.85)"
                            : isActive
                              ? SAFFRON
                              : "rgba(255,255,255,0.25)",
                        flex:1, overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap",
                        transition:"color 0.35s",
                      }}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fake PDF preview */}
            <div style={{ width:108, flexShrink:0 }}>
              <div style={{
                fontSize:8, fontWeight:800, letterSpacing:1.2,
                color:"rgba(255,255,255,0.22)", textTransform:"uppercase", marginBottom:8,
              }}>Preview</div>
              <div style={{
                background:"#ffffff",
                borderRadius:7,
                padding:"9px 9px 9px",
                boxShadow:"0 6px 24px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.3)",
                minHeight:158,
                position:"relative", overflow:"hidden",
              }}>
                {/* Fake PDF header */}
                <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:7 }}>
                  <div style={{ width:22, height:5, borderRadius:2, background:NAVY }} />
                  <div style={{ width:11, height:5, borderRadius:2, background:SAFFRON }} />
                </div>
                {/* Skeleton lines */}
                {LINE_WIDTHS.slice(0, visibleLines).map((w, i) => (
                  <div
                    key={i}
                    className="ys-line"
                    style={{
                      height: i % 5 === 0 ? 5 : 3,
                      width:`${w}%`,
                      borderRadius:2,
                      background: i % 5 === 0 ? "#c8d4e8" : "#eaecf2",
                      marginBottom: i % 5 === 0 ? 5 : 3,
                      animationDelay:`${i * 28}ms`,
                    }}
                  />
                ))}
                {/* Tiny PDF watermark */}
                <div style={{
                  position:"absolute", bottom:5, right:6,
                  fontSize:7, fontWeight:800,
                  color:"rgba(0,53,128,0.18)",
                }}>PDF</div>
              </div>
            </div>
          </div>

          {/* ── Terminal log ── */}
          <div style={{
            margin:"0 24px 16px",
            background:"rgba(0,0,0,0.45)",
            border:"1px solid rgba(255,255,255,0.05)",
            borderRadius:10, padding:"10px 14px",
            fontFamily:"'SF Mono','Fira Code','Courier New',monospace",
          }}>
            <div style={{
              fontSize:8, fontWeight:700, letterSpacing:1,
              color:"rgba(255,255,255,0.18)", marginBottom:6, textTransform:"uppercase",
            }}>
              ● Terminal
            </div>
            {done ? (
              <div className="ys-fslide" style={{ fontSize:10, color:IND_GREEN, fontWeight:700 }}>
                ✓ &nbsp;yojanasetu_full_report_{today}.pdf &nbsp;— &nbsp;Ready to open
              </div>
            ) : (
              <div style={{
                fontSize:10, color:SAFFRON,
                display:"flex", alignItems:"center", gap:4,
                overflow:"hidden",
              }}>
                <span style={{ color:"rgba(255,255,255,0.22)", flexShrink:0 }}>$&nbsp;</span>
                <span style={{
                  flex:1, overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>
                  {currentStep >= 0 ? steps[currentStep]?.label : "Initializing…"}
                </span>
                <span style={{
                  flexShrink:0,
                  animation:"ys-blink 1s step-end infinite",
                  color:SAFFRON,
                }}>█</span>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            borderTop:"1px solid rgba(255,255,255,0.05)",
            padding:"12px 24px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div style={{ fontSize:8.5, color:"rgba(255,255,255,0.18)", lineHeight:1.6, fontWeight:500 }}>
              Yojana Sahay Admin &nbsp;·&nbsp; Confidential<br />
              {today}
            </div>
            {done ? (
              <div className="ys-glow" style={{
                fontSize:11, fontWeight:800, color:"#fff",
                background:`linear-gradient(135deg,${IND_GREEN},#16a34a)`,
                padding:"8px 18px", borderRadius:10,
                boxShadow:`0 4px 16px rgba(19,136,8,0.4)`,
              }}>
                Opening PDF…
              </div>
            ) : (
              <div style={{
                display:"flex", alignItems:"center", gap:6,
                fontSize:10, color:"rgba(255,255,255,0.22)", fontWeight:600,
              }}>
                <div className="ys-spin" style={{ fontSize:12 }}>⚙️</div>
                Building document
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── USAGE SECTION COMPONENT ──────────────────────────────────────────────────
function UsageSection({ usageData, users, loading, onRefresh, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [activeTab, setActiveTab] = React.useState("runs");
  const [usagePage,  setUsagePage]  = React.useState(1);
  const [usageSort,  setUsageSort]  = React.useState("newest"); // "newest" | "oldest"
  const USAGE_PER_PAGE = 10;

  // O(1) user lookup — avoids O(n²) users.find() inside .map() on paged results
  const usersById = React.useMemo(
    () => Object.fromEntries((users || []).map(u => [u.id, u])),
    [users]
  );

  // Reset to page 1 when switching between Runs / Searches tabs
  React.useEffect(() => { setUsagePage(1); }, [activeTab]);

  // Scroll to top of dashboard whenever page changes
  React.useEffect(() => {
    document.querySelector("[data-admin-scroll]")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [usagePage]);

  if (loading) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: th.textSub, fontSize: 13 }}>
        Loading usage stats…
      </div>
    );
  }

  if (!usageData || Object.keys(usageData).length === 0) {
    return (
      <div style={{ padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 36 }}>📭</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>No usage data yet</div>
        <div style={{ fontSize: 12, color: th.textSub, textAlign: "center", maxWidth: 260 }}>
          Once users run the Eligibility Checker or search for schemes, data will appear here automatically.
        </div>
        <div onClick={onRefresh} style={{
          marginTop: 8, padding: "9px 20px", borderRadius: 12,
          background: NAVY, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>
          🔄 Refresh
        </div>
      </div>
    );
  }

  // ── Compute derived stats ──────────────────────────────────────────────────
  const checkerRuns    = Array.isArray(usageData.checkerRuns)    ? usageData.checkerRuns    : [];
  const schemeSearches = Array.isArray(usageData.schemeSearches) ? usageData.schemeSearches : [];
  const stateSelections = Array.isArray(usageData.stateSelections) ? usageData.stateSelections : [];

  const totalRuns     = usageData.checkerTotal || checkerRuns.length;
  const totalSearches = usageData.searchTotal  || schemeSearches.length;

  const avgMatched = checkerRuns.length > 0
    ? (checkerRuns.reduce((s, r) => s + (r.matchedCount || 0), 0) / checkerRuns.length).toFixed(1)
    : "—";
  const maxMatched = checkerRuns.length > 0
    ? Math.max(...checkerRuns.map(r => r.matchedCount || 0))
    : 0;

  const usersWithChecker = users.filter(u => u.matchedCount != null).length;
  const checkerPct = users.length > 0 ? Math.round(usersWithChecker / users.length * 100) : 0;

  // Top states
  const stateCounts = {};
  checkerRuns.forEach(r => { if (r.state) stateCounts[r.state] = (stateCounts[r.state] || 0) + 1; });
  stateSelections.forEach(r => { if (r.state) stateCounts[r.state] = (stateCounts[r.state] || 0) + 1; });
  const topStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([label, value]) => ({ label, value }));

  // Top search queries
  const queryCounts = {};
  schemeSearches.forEach(r => {
    if (!r.q) return;
    const k = r.q.toLowerCase().trim();
    queryCounts[k] = (queryCounts[k] || 0) + 1;
  });
  const topQueries = Object.entries(queryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Who ran checker
  const whoCounts = {};
  checkerRuns.forEach(r => { if (r.who) whoCounts[r.who] = (whoCounts[r.who] || 0) + 1; });
  const whoData = Object.entries(whoCounts).sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ label: OCC_LABELS[key] || key, value }));

  // 7-day sparkline
  const nowMs = Date.now();
  const ONE_DAY = 86400000;
  const spark7 = Array.from({ length: 7 }, (_, i) => {
    const dayStart = nowMs - (6 - i) * ONE_DAY;
    const dayEnd   = dayStart + ONE_DAY;
    return checkerRuns.filter(r => {
      if (!r.ts) return false;
      const ms = new Date(r.ts).getTime();
      return ms >= dayStart && ms < dayEnd;
    }).length;
  });
  const maxSpark = Math.max(...spark7, 1);
  const dayLabels = ["6d","5d","4d","3d","2d","1d","Today"];

  // Time formatter — dark-mode safe (never use th.textLight)
  const fmtTime = (ts) => ts
    ? new Date(ts).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })
    : "—";

  const cardStyle = {
    background: th.card, border: `1.5px solid ${th.border}`,
    borderRadius: 16, padding: "13px 14px",
  };

  // ── Pagination slices ──────────────────────────────────────────────────────
  const reversedRuns     = usageSort === "newest" ? [...checkerRuns].reverse()    : [...checkerRuns];
  const reversedSearches = usageSort === "newest" ? [...schemeSearches].reverse() : [...schemeSearches];
  const runsTotalPages    = Math.max(1, Math.ceil(reversedRuns.length     / USAGE_PER_PAGE));
  const searchesTotalPages= Math.max(1, Math.ceil(reversedSearches.length / USAGE_PER_PAGE));
  const pagedRuns         = reversedRuns.slice(    (usagePage - 1) * USAGE_PER_PAGE, usagePage * USAGE_PER_PAGE);
  const pagedSearches     = reversedSearches.slice((usagePage - 1) * USAGE_PER_PAGE, usagePage * USAGE_PER_PAGE);
  const activeTotalPages  = activeTab === "runs" ? runsTotalPages : searchesTotalPages;

  // Shared mini-paginator renderer
  function UsagePager() {
    if (activeTotalPages <= 1) return null;
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:8 }}>
        <div
          onClick={() => usagePage > 1 && setUsagePage(p => p - 1)}
          style={{
            padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
            cursor: usagePage > 1 ? "pointer" : "default",
            opacity: usagePage > 1 ? 1 : 0.35,
            background: th.card2, border:`1.5px solid ${th.border}`,
            color: th.textMid, userSelect:"none",
          }}
        >‹</div>

        {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map(p => {
          const isActive = p === usagePage;
          const nearby = Math.abs(p - usagePage) <= 1 || p === 1 || p === activeTotalPages;
          if (!nearby) {
            if (p === usagePage - 2 || p === usagePage + 2)
              return <span key={p} style={{ color:th.textSub, fontSize:10 }}>…</span>;
            return null;
          }
          return (
            <div
              key={p}
              onClick={() => setUsagePage(p)}
              style={{
                minWidth:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer",
                background: isActive ? NAVY : th.card2,
                color:      isActive ? "#fff" : th.textMid,
                border:`1.5px solid ${isActive ? NAVY : th.border}`,
                transition:"all 0.15s", userSelect:"none",
              }}
            >{p}</div>
          );
        })}

        <div
          onClick={() => usagePage < activeTotalPages && setUsagePage(p => p + 1)}
          style={{
            padding:"5px 11px", borderRadius:16, fontSize:10, fontWeight:700,
            cursor: usagePage < activeTotalPages ? "pointer" : "default",
            opacity: usagePage < activeTotalPages ? 1 : 0.35,
            background: th.card2, border:`1.5px solid ${th.border}`,
            color: th.textMid, userSelect:"none",
          }}
        >›</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: th.text }}>📈 Usage Insights</div>
        <div onClick={onRefresh} style={{
          fontSize: 11, color: SAFFRON, fontWeight: 700, cursor: "pointer",
          padding: "5px 10px", background: SAFFRON + "18", borderRadius: 8,
        }}>🔄 Refresh</div>
      </div>

      {/* ── SECTION 1: Key numbers — 4 stats + avg + max in one card ── */}
      <div style={cardStyle}>
        <div style={{ fontSize: 11, fontWeight: 800, color: th.textMid, marginBottom: 10, letterSpacing: 0.3 }}>
          OVERVIEW
        </div>
        {/* Top row: 4 pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[
            { icon: "🎯", label: "Checker Runs",    value: totalRuns,          color: NAVY },
            { icon: "🔍", label: "Searches",         value: totalSearches,      color: IND_GREEN },
            { icon: "👤", label: "Users Checked",    value: usersWithChecker,   color: SAFFRON },
            { icon: "📊", label: "Adoption",         value: checkerPct + "%",   color: VIOLET },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{
              flex: 1, background: color + "12", border: `1px solid ${color}33`,
              borderRadius: 12, padding: "8px 4px", textAlign: "center",
            }}>
              <div style={{ fontSize: 14 }}>{icon}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
              <div style={{ fontSize: 8, color: th.textSub, marginTop: 2, lineHeight: 1.2 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Second row: avg + max + runs count inline */}
        <div style={{
          display: "flex", gap: 8,
          background: th.card2, borderRadius: 10, padding: "9px 12px",
        }}>
          {[
            { label: "Avg Matched", value: avgMatched, color: NAVY },
            { label: "Max Matched", value: maxMatched || "—", color: IND_GREEN },
            { label: "Total Runs",  value: checkerRuns.length, color: VIOLET },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 9, color: th.textSub, marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: 7-day bar + Who (side by side) ── */}
      {checkerRuns.length > 0 && (
        <div style={{ display: "flex", gap: 10 }}>
          {/* 7-day mini bar */}
          <div style={{ ...cardStyle, flex: 1.4 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: th.textMid, marginBottom: 8 }}>
              📅 LAST 7 DAYS
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
              {spark7.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {val > 0 && <div style={{ fontSize: 7, color: th.textSub, fontWeight: 700 }}>{val}</div>}
                  <div style={{
                    width: "100%", borderRadius: "3px 3px 0 0",
                    background: i === 6 ? SAFFRON : NAVY,
                    height: `${Math.round((val / maxSpark) * 36) + 2}px`,
                    opacity: val > 0 ? 1 : 0.2,
                    transition: "height 0.4s ease",
                  }} />
                  <div style={{ fontSize: 6.5, color: th.textSub }}>{dayLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Who ran checker */}
          {whoData.length > 0 && (
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: th.textMid, marginBottom: 8 }}>
                👤 WHO
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {whoData.slice(0, 4).map(({ label, value }) => {
                  const maxVal = whoData[0].value || 1;
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <div style={{ fontSize: 9, color: th.textMid, fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: 9, color: th.text, fontWeight: 800 }}>{value}</div>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: th.border, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          background: VIOLET,
                          width: `${Math.round(value / maxVal * 100)}%`,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 3: States + Top Queries side by side ── */}
      {(topStates.length > 0 || topQueries.length > 0) && (
        <div style={{ display: "flex", gap: 10 }}>
          {topStates.length > 0 && (
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: th.textMid, marginBottom: 8 }}>
                📍 TOP STATES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {topStates.slice(0, 5).map(({ label, value }) => {
                  const maxVal = topStates[0].value || 1;
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <div style={{ fontSize: 9, color: th.textMid, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "78%" }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 9, color: th.text, fontWeight: 800 }}>{value}</div>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: th.border, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2, background: SAFFRON,
                          width: `${Math.round(value / maxVal * 100)}%`,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {topQueries.length > 0 && (
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: th.textMid, marginBottom: 8 }}>
                🔍 TOP SEARCHES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {topQueries.slice(0, 5).map(([q, count], i) => (
                  <div key={q} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                      background: i < 3 ? SAFFRON : th.border,
                      color: i < 3 ? "#fff" : th.textSub,
                      fontSize: 7, fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{i + 1}</div>
                    <div style={{
                      flex: 1, fontSize: 9, color: th.text, fontWeight: 600,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {q}
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 800, color: NAVY,
                      background: NAVY + "18", borderRadius: 5, padding: "1px 5px", flexShrink: 0,
                    }}>
                      {count}×
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 4: Tabbed recent activity (Runs / Searches) ── */}
      {(checkerRuns.length > 0 || schemeSearches.length > 0) && (
        <div style={cardStyle}>
          {/* Tab switcher + sort toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems:"center" }}>
            {[
              { id: "runs",     label: `🕐 Checker Runs (${checkerRuns.length})` },
              { id: "searches", label: `🔍 Searches (${schemeSearches.length})` },
            ].map(({ id, label }) => (
              <div
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1, textAlign: "center",
                  padding: "6px 8px", borderRadius: 10,
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  background: activeTab === id ? NAVY : th.card2,
                  color: activeTab === id ? "#fff" : th.textMid,
                  border: `1.5px solid ${activeTab === id ? NAVY : th.border}`,
                  transition: "all 0.18s",
                }}
              >
                {label}
              </div>
            ))}
            {/* Sort toggle */}
            <div
              onClick={() => { setUsageSort(s => s === "newest" ? "oldest" : "newest"); setUsagePage(1); }}
              style={{
                padding:"6px 10px", borderRadius:10, fontSize:10, fontWeight:700,
                cursor:"pointer", flexShrink:0,
                background: th.card2, border:`1.5px solid ${th.border}`,
                color: th.textMid, transition:"all 0.18s",
              }}
              title={usageSort === "newest" ? "Showing newest first" : "Showing oldest first"}
            >
              {usageSort === "newest" ? "↓ New" : "↑ Old"}
            </div>
          </div>

          {/* Checker Runs list */}
          {activeTab === "runs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {pagedRuns.map((r, i) => {
                const user = usersById[r.uid];
                const userName  = user?.name  || "—";
                const userEmail = user?.email || user?.phone || "—";
                const matched   = r.matchedCount ?? null;
                const matchColor = matched != null ? (matched > 5 ? IND_GREEN : SAFFRON) : th.textSub;
                const tags = [
                  r.state  && { label: r.state,                                                   color: NAVY },
                  r.who    && { label: OCC_LABELS[r.who]    || r.who,                             color: VIOLET },
                  r.income && { label: INC_LABELS[r.income] || r.income,                          color: IND_GREEN },
                  r.area   && { label: AREA_LABELS[r.area]  || r.area,                            color: SAFFRON },
                ].filter(Boolean);
                return (
                  <div key={i} style={{
                    background: th.card2, borderRadius: 10,
                    padding: "9px 11px", border: `1px solid ${th.border}`,
                  }}>
                    {/* Row 1: name + time + match badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: th.text,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{userName}</div>
                        <div style={{
                          fontSize: 9, color: th.textSub, marginTop: 1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{userEmail}</div>
                      </div>
                      {/* Schemes matched badge */}
                      {matched != null && (
                        <div style={{
                          fontSize: 11, fontWeight: 900, color: matchColor,
                          background: matchColor + "18", borderRadius: 8,
                          padding: "2px 8px", flexShrink: 0,
                          border: `1px solid ${matchColor}44`,
                        }}>
                          {matched} <span style={{ fontSize: 8, fontWeight: 600 }}>matched</span>
                        </div>
                      )}
                      {/* Timestamp — fixed dark mode color */}
                      <div style={{
                        fontSize: 9, fontWeight: 600,
                        color: th.textMid,   // ✅ was th.textLight (invisible in dark)
                        flexShrink: 0, textAlign: "right", minWidth: 60,
                      }}>
                        {fmtTime(r.ts)}
                      </div>
                    </div>
                    {/* Row 2: compact tags */}
                    {tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {tags.map(({ label, color }) => (
                          <span key={label} style={{
                            fontSize: 9, fontWeight: 700, color,
                            background: color + "18", borderRadius: 5,
                            padding: "1px 6px",
                          }}>{label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <UsagePager />
            </div>
          )}

          {/* Scheme Searches list */}
          {activeTab === "searches" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pagedSearches.map((s, i) => {
                const user = usersById[s.uid];
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: th.card2, borderRadius: 10,
                    padding: "8px 11px", border: `1px solid ${th.border}`,
                  }}>
                    {/* Query */}
                    <div style={{
                      background: NAVY + "18", color: dark ? "#7ea8e8" : NAVY,
                      borderRadius: 7, padding: "3px 8px",
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                      maxWidth: 110, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      "{s.q}"
                    </div>
                    {/* User */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: th.text,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {user?.name || "—"}
                      </div>
                      <div style={{
                        fontSize: 8.5, color: th.textSub,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {user?.email || user?.phone || "—"}
                      </div>
                    </div>
                    {/* Time — fixed dark mode */}
                    <div style={{
                      fontSize: 9, fontWeight: 600,
                      color: th.textMid,   // ✅ was th.textLight
                      flexShrink: 0, textAlign: "right",
                    }}>
                      {fmtTime(s.ts)}
                    </div>
                  </div>
                );
              })}
              <UsagePager />
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const MONO_FONT = "'SF Mono','Fira Code','Courier New',monospace";

// ── LiveClock: isolated clock — only this tiny node re-renders every second ──
function LiveClock({ dark, th, isDesktop }) {
  const [tick, setTick] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const TIME_STR = tick.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });
  const DATE_STR = tick.toLocaleDateString("en-IN",  { weekday:"short", day:"numeric", month:"short", year:"numeric" });
  return (
    <>
      <div style={{
        fontFamily:MONO_FONT, fontSize: isDesktop?30:26, fontWeight:900, color:SAFFRON,
        letterSpacing:3, lineHeight:1,
        textShadow: dark ? `0 0 16px ${SAFFRON}66, 0 0 32px ${SAFFRON}33` : "none",
      }}>
        {TIME_STR}
      </div>
      <div style={{ fontFamily:MONO_FONT, fontSize:9, color:th.textSub, letterSpacing:0.5, marginTop:5 }}>{DATE_STR}</div>
    </>
  );
}

// ── LiveStatusMeta: isolated LAST SYNC + SESSION — only these cells tick ──
function LiveStatusMeta({ lastSynced, sessionStart, th }) {
  const [tick, setTick] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const syncAgoSec = lastSynced ? Math.max(0, Math.floor((tick - lastSynced.getTime()) / 1000)) : null;
  const syncLabel = lastSynced == null
    ? "syncing…"
    : syncAgoSec < 5  ? "just now"
    : syncAgoSec < 60 ? `${syncAgoSec}s ago`
    : syncAgoSec < 3600 ? `${Math.floor(syncAgoSec/60)}m ${syncAgoSec%60}s ago`
    : `${Math.floor(syncAgoSec/3600)}h ${Math.floor((syncAgoSec%3600)/60)}m ago`;
  const upSec = sessionStart ? Math.max(0, Math.floor((tick - sessionStart) / 1000)) : 0;
  const upH = Math.floor(upSec/3600), upM = Math.floor((upSec%3600)/60), upS = upSec%60;
  const uptimeLabel = upH > 0
    ? `${upH}h ${String(upM).padStart(2,"0")}m`
    : `${String(upM).padStart(2,"0")}m ${String(upS).padStart(2,"0")}s`;
  return (
    <>
      <div style={{ width:1, height:14, background:th.border, flexShrink:0 }} />
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase" }}>LAST SYNC</span>
        <span style={{ fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, color:th.text }}>{syncLabel}</span>
      </div>
      <div style={{ width:1, height:14, background:th.border, flexShrink:0 }} />
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase" }}>SESSION</span>
        <span style={{ fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, color:th.text }}>{uptimeLabel}</span>
      </div>
    </>
  );
}

// ── tiny helper: hex or existing rgba → rgba with new alpha ──
function hsRgba(color, alpha) {
  if (!color) return `rgba(0,0,0,${alpha})`;
  if (color.startsWith("rgba")) return color.replace(/[\d.]+\)$/, `${alpha})`);
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
  const c = color.replace("#","");
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── MiniSparkline for vitals ──
function MiniSpark({ points, color, width = 52, height = 22 }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * width);
  const ys = points.map(v => height - ((v - min) / range) * (height - 4) - 2);
  const d  = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  // filled area
  const area = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow:"visible", flexShrink:0 }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="2.5" fill={color} />
    </svg>
  );
}

// ── Line-icon system (replaces emoji glyphs for a more professional, ──
// ── consistent look — single source of truth, no extra dependency) ──
const ICON_PATHS = {
  overview: <><line x1="6" y1="20" x2="6" y2="16"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/></>,
  users: <><path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19"/><circle cx="9" cy="8" r="3"/><path d="M20 19v-1.2a3 3 0 0 0-2.2-2.9"/><path d="M14.3 4.2a3 3 0 0 1 0 5.8"/></>,
  analytics: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2"/></>,
  activity: <polyline points="22 12 18 12 15 20 9 4 6 12 2 12"/>,
  usage: <><polyline points="3 17 9.5 10.5 14 15 21 7"/><polyline points="15 7 21 7 21 13"/></>,
  schemes: <><path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4z"/><line x1="9" y1="4" x2="9" y2="18"/><line x1="15" y1="6.5" x2="15" y2="20.5"/></>,
  reports: <><polyline points="21 11 15.5 11 13.7 13.7 10.3 13.7 8.5 11 3 11"/><path d="M5.2 5 3 11v6.5A1.8 1.8 0 0 0 4.8 19.3h14.4A1.8 1.8 0 0 0 21 17.5V11l-2.2-6a1.8 1.8 0 0 0-1.7-1.2H6.9A1.8 1.8 0 0 0 5.2 5z"/></>,
  cleanup: <><polyline points="3.5 6 6 6 20 6"/><path d="M18.5 6 17.4 19.4a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5.5 6"/><line x1="9.5" y1="10.5" x2="9.5" y2="16"/><line x1="14.5" y1="10.5" x2="14.5" y2="16"/><path d="M8.5 6V4a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 4v2"/></>,
  verify: <><path d="M12 2.5 4.5 5.5v6.3c0 5.2 4.6 8.2 7.5 9.7 2.9-1.5 7.5-4.5 7.5-9.7V5.5L12 2.5z"/><polyline points="8.7 12 11 14.3 15.3 9.5"/></>,
  export: <><path d="M13.5 2.5h-7A1.8 1.8 0 0 0 4.7 4.3v15.4A1.8 1.8 0 0 0 6.5 21.5h11a1.8 1.8 0 0 0 1.8-1.8V8z"/><polyline points="13.5 2.5 13.5 8 19.3 8"/><line x1="12" y1="11.5" x2="12" y2="17.5"/><polyline points="9 14.5 12 17.5 15 14.5"/></>,
  alert: <><path d="M10.6 4.1 2.8 18a1.8 1.8 0 0 0 1.6 2.7h15.2a1.8 1.8 0 0 0 1.6-2.7L13.4 4.1a1.8 1.8 0 0 0-2.8 0z"/><line x1="12" y1="9.5" x2="12" y2="13.5"/><circle cx="12" cy="16.7" r="0.15" fill="currentColor"/></>,
  refresh: <><polyline points="22 4.5 22 10 16.5 10"/><polyline points="2 19.5 2 14 7.5 14"/><path d="M3.6 9a8.5 8.5 0 0 1 14-3.2L22 10M2 14l4.4 4.2A8.5 8.5 0 0 0 20.4 15"/></>,
  moon: <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5 7 7 0 0 0 20.5 14.2z"/>,
  userplus: <><path d="M14.5 19.5v-1.3a3.5 3.5 0 0 0-3.5-3.5H5.5A3.5 3.5 0 0 0 2 18.2v1.3"/><circle cx="8" cy="7.5" r="3.2"/><line x1="18.5" y1="8" x2="18.5" y2="13"/><line x1="21" y1="10.5" x2="16" y2="10.5"/></>,
  check: <><path d="M20.5 11v.9a9.5 9.5 0 1 1-5.6-8.7"/><polyline points="20.5 4.5 11 14 8 11"/></>,
  login: <><path d="M14.5 3h4A1.8 1.8 0 0 1 20.3 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8h-4"/><polyline points="9.5 16.5 14.5 12 9.5 7.5"/><line x1="14.5" y1="12" x2="2.5" y2="12"/></>,
  phone: <path d="M20.5 16.8v2.5a1.7 1.7 0 0 1-1.85 1.7 16.6 16.6 0 0 1-7.24-2.58 16.4 16.4 0 0 1-5.05-5.05A16.6 16.6 0 0 1 3.78 5.6 1.7 1.7 0 0 1 5.46 3.75h2.5a1.7 1.7 0 0 1 1.7 1.46c.1.8.3 1.6.59 2.35a1.7 1.7 0 0 1-.38 1.79l-1.06 1.06a13.5 13.5 0 0 0 5.06 5.06l1.06-1.06a1.7 1.7 0 0 1 1.79-.38c.75.29 1.55.49 2.35.59a1.7 1.7 0 0 1 1.45 1.7z"/>,
  card: <><rect x="2" y="5.5" width="20" height="13" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
  news: <><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><line x1="16" y1="3" x2="16" y2="21"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="14" x2="13" y2="14"/><line x1="8" y1="18" x2="11" y2="18"/></>,
};

function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.8, style }) {
  const content = ICON_PATHS[name];
  if (!content) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display:"block", flexShrink:0, ...style }}>
      {content}
    </svg>
  );
}

// ── DecryptValue: scrambles through random digits before settling on the ──
// ── real value — a "decrypting" reveal for KPI numbers as data loads ──
const DECRYPT_CHARS = "0123456789";
function DecryptValue({ value, duration = 480 }) {
  const target = String(value);
  const [display, setDisplay]   = React.useState(target);
  const prevTarget               = React.useRef(target);
  const skipAnim                 = !/\d/.test(target); // skip for "—", "…", non-numeric placeholders

  React.useEffect(() => {
    if (target === prevTarget.current || skipAnim) {
      setDisplay(target);
      prevTarget.current = target;
      return;
    }
    let frame = 0;
    const totalFrames = Math.max(6, Math.round(duration / 35));
    const id = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplay(target);
        clearInterval(id);
        prevTarget.current = target;
        return;
      }
      const revealCount = Math.floor((frame / totalFrames) * target.length);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out += i < revealCount ? target[i] : DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)];
      }
      setDisplay(out);
    }, 35);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, skipAnim]);

  return <>{display}</>;
}

// ── BootSequence: terminal-style boot intro, shown once per session ────────
const BOOT_LINES = [
  { t: `BOOT://yojanasahay-admin v${ADMIN_BUILD_VERSION}`,     tag: null    },
  { t: "Verifying admin credentials",                          tag: "OK"    },
  { t: "Mounting Firestore connection",                         tag: "OK"    },
  { t: "Loading scheme database (1000+ entries)",               tag: "OK"    },
  { t: "Decrypting analytics core",                             tag: "OK"    },
  { t: "System ready.",                                         tag: "DONE"  },
];

function BootSequence({ onComplete }) {
  const [lineCount, setLineCount] = React.useState(0);
  const [progress,  setProgress]  = React.useState(0);
  const [fading,    setFading]    = React.useState(false);
  const [glitch,    setGlitch]    = React.useState(false);

  React.useEffect(() => {
    let i = 0;
    const lineTimer = setInterval(() => {
      i += 1;
      setLineCount(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(lineTimer);
        setTimeout(() => setProgress(100), 140);
      }
    }, 210);
    // brief glitch flicker on the logo line shortly after it appears
    const glitchT = setTimeout(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 140);
    }, 260);
    return () => { clearInterval(lineTimer); clearTimeout(glitchT); };
  }, []);

  React.useEffect(() => {
    if (progress !== 100) return;
    const t1 = setTimeout(() => setFading(true), 600);
    const t2 = setTimeout(() => onComplete?.(), 600 + 360);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const allDone = lineCount >= BOOT_LINES.length;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10050,
      background:"radial-gradient(ellipse 90% 70% at 50% 30%, #0c1024 0%, #05060a 65%, #030305 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, overflow:"hidden",
      opacity: fading ? 0 : 1,
      transform: fading ? "scale(1.02)" : "scale(1)",
      transition:"opacity 0.36s ease, transform 0.36s ease",
      pointerEvents: fading ? "none" : "auto",
    }}>
      <style>{`
        @keyframes boot-line-in   { from{opacity:0;transform:translateX(-3px)} to{opacity:1;transform:translateX(0)} }
        @keyframes boot-blink     { 50%{opacity:0} }
        @keyframes boot-scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        @keyframes boot-pulse     { 0%,100%{opacity:0.45} 50%{opacity:1} }
        @keyframes boot-ring-spin { to{transform:rotate(360deg)} }
        @keyframes boot-grid-fade { from{opacity:0} to{opacity:0.5} }
      `}</style>

      {/* faint circuit-grid backdrop */}
      <div style={{
        position:"absolute", inset:0, opacity:0.5,
        backgroundImage:`linear-gradient(${NAVY}22 1px,transparent 1px),linear-gradient(90deg,${NAVY}22 1px,transparent 1px)`,
        backgroundSize:"34px 34px",
        animation:"boot-grid-fade 1.2s ease forwards",
        maskImage:"radial-gradient(ellipse 70% 60% at 50% 35%, black 0%, transparent 75%)",
        WebkitMaskImage:"radial-gradient(ellipse 70% 60% at 50% 35%, black 0%, transparent 75%)",
      }} />

      {/* terminal card */}
      <div style={{
        position:"relative", width:"100%", maxWidth:400,
        background:"linear-gradient(160deg,#0a0d1c 0%,#070912 100%)",
        border:`1px solid ${NAVY}80`,
        borderRadius:16,
        padding:"22px 22px 18px",
        boxShadow:`0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -10px rgba(0,0,0,0.7), 0 0 40px -6px ${NAVY}55`,
        overflow:"hidden",
        fontFamily:MONO_FONT,
      }}>
        {/* scanline sweep */}
        <div style={{
          position:"absolute", left:0, right:0, height:"40%",
          background:`linear-gradient(180deg,transparent,${SAFFRON}0d,transparent)`,
          animation:"boot-scan 2.8s linear infinite",
          pointerEvents:"none",
        }} />

        {/* header row: monogram + status dot */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{
              width:26, height:26, borderRadius:7, flexShrink:0,
              background:`linear-gradient(135deg,${NAVY},${SAFFRON})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:900, color:"#fff",
              boxShadow:`0 0 14px ${SAFFRON}55`,
              filter: glitch ? "hue-rotate(40deg) saturate(1.6)" : "none",
              transform: glitch ? "translateX(1px)" : "none",
            }}>YS</div>
            <span style={{
              fontSize:10.5, fontWeight:700, color:"#9aa3d6", letterSpacing:0.6,
              filter: glitch ? "blur(0.4px)" : "none",
            }}>YOJANA SAHAY <span style={{ color:"#444a6e" }}>· ADMIN CORE</span></span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{
              width:6, height:6, borderRadius:"50%",
              background: allDone ? IND_GREEN : SAFFRON,
              boxShadow:`0 0 8px ${allDone ? IND_GREEN : SAFFRON}`,
              animation: allDone ? "none" : "boot-pulse 1s ease-in-out infinite",
            }} />
            <span style={{ fontSize:8.5, color:"#5a6190", letterSpacing:0.8 }}>
              {allDone ? "LIVE" : "INIT"}
            </span>
          </div>
        </div>

        {/* boot log lines */}
        <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18, minHeight:18*6 }}>
          {BOOT_LINES.slice(0, lineCount).map((line, i) => {
            const isLast = i === BOOT_LINES.length - 1;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:10,
                animation:"boot-line-in 0.24s ease",
              }}>
                <span style={{ fontSize:11, letterSpacing:0.2, color: isLast ? "#d7faea" : "#8891c4" }}>
                  <span style={{ color: isLast ? IND_GREEN : "#4a5694" }}>{isLast ? "❯" : "›"}</span>{" "}{line.t}
                </span>
                {line.tag && (
                  <span style={{
                    fontSize:8.5, fontWeight:800, letterSpacing:0.5, flexShrink:0,
                    color: isLast ? "#04130a" : IND_GREEN,
                    background: isLast ? IND_GREEN : `${IND_GREEN}1a`,
                    border: isLast ? "none" : `1px solid ${IND_GREEN}55`,
                    borderRadius:4, padding: isLast ? "1px 7px" : "1px 6px",
                  }}>{line.tag}</span>
                )}
              </div>
            );
          })}
          {!allDone && (
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ color:"#4a5694", fontSize:11 }}>›</span>
              <span style={{ color:SAFFRON, fontSize:11, animation:"boot-blink 0.9s steps(2) infinite" }}>▌</span>
            </div>
          )}
        </div>

        {/* progress rail */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1, height:4, borderRadius:3, background:"#12152a", overflow:"hidden", position:"relative" }}>
            <div style={{
              height:"100%", width:`${progress}%`, borderRadius:3,
              background:`linear-gradient(90deg,${NAVY},${SAFFRON})`,
              boxShadow: progress > 0 ? `0 0 10px ${SAFFRON}80` : "none",
              transition:"width 0.6s cubic-bezier(0.22,1,0.36,1)",
            }} />
          </div>
          <span style={{ fontSize:9.5, fontWeight:700, color:"#5a6190", letterSpacing:0.5, minWidth:32, textAlign:"right" }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── ModuleCard: Intelligence Module tile with cursor-tracked 3D tilt (desktop) ──
function ModuleCard({ id, fullLabel, meta, isHov, isDesktop, dark, th, onClick, onMouseEnter, onMouseLeave }) {
  const cardRef = React.useRef(null);
  const [tilt, setTilt]   = React.useState({ rx: 0, ry: 0 });
  const [pressed, setPressed] = React.useState(false);

  function handleMouseMove(e) {
    if (!isDesktop || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 9, ry: (px - 0.5) * 9 });
  }
  function handleLeave() {
    setTilt({ rx: 0, ry: 0 });
    setPressed(false);
    onMouseLeave?.();
  }

  const nameParts = fullLabel.trim().split(/\s+/);
  const name = nameParts.filter((p, i) => i > 0 || !p.match(/\p{Emoji}/u)).join(" ") || id;

  const tiltTransform = isDesktop
    ? `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${isHov ? -3 : 0}px) scale(${pressed ? 0.98 : isHov ? 1.012 : 1})`
    : undefined;

  return (
    <div
      ref={cardRef}
      className={isDesktop ? undefined : "hs-module"}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onMouseDown={() => isDesktop && setPressed(true)}
      onMouseUp={() => isDesktop && setPressed(false)}
      style={{
        cursor:"pointer", userSelect:"none", WebkitTapHighlightColor:"transparent",
        transform: tiltTransform,
        transformStyle: isDesktop ? "preserve-3d" : undefined,
        transition: isDesktop
          ? "transform 0.12s ease-out, background 0.22s cubic-bezier(0.22,1,0.36,1), border-color 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s cubic-bezier(0.22,1,0.36,1)"
          : undefined,
        background: isHov
          ? (dark
              ? `linear-gradient(150deg,${hsRgba(meta.accentColor,0.14)} 0%,${hsRgba(meta.accentColor,0.04)} 100%)`
              : `linear-gradient(150deg,${hsRgba(meta.accentColor,0.07)} 0%,rgba(255,255,255,0.98) 100%)`)
          : th.card,
        border:`1.5px solid ${isHov ? hsRgba(meta.accentColor,0.48) : th.border}`,
        borderRadius: isDesktop ? 16 : 13,
        padding: isDesktop ? "17px 15px 13px" : "13px 12px 11px",
        position:"relative", overflow:"hidden",
        boxShadow: isHov
          ? `0 8px 30px ${meta.glow}, 0 0 0 1px ${hsRgba(meta.accentColor,0.16)}`
          : dark ? "0 2px 10px rgba(0,0,0,0.28)" : "0 1px 5px rgba(0,0,0,0.04)",
      }}
    >
      {/* Vertical accent strip */}
      <div style={{
        position:"absolute", top:0, left:0, bottom:0,
        width: isHov ? 4 : 3,
        background: meta.accentColor,
        boxShadow: dark&&isHov ? `0 0 10px ${meta.accentColor}` : "none",
        transition:"all 0.2s ease",
        borderRadius:"0 2px 2px 0",
      }} />

      {/* Corner glow on hover */}
      {isHov && <div style={{ position:"absolute", top:-28, right:-28, width:100, height:100, borderRadius:"50%", background:`radial-gradient(circle,${hsRgba(meta.accentColor,dark?0.14:0.08)} 0%,transparent 70%)`, pointerEvents:"none" }} />}

      <div style={{ paddingLeft: isDesktop?11:9, transform: isDesktop ? "translateZ(18px)" : undefined }}>
        <div style={{
          width: isDesktop?34:29, height: isDesktop?34:29, borderRadius:9,
          marginBottom: isDesktop?10:8,
          display:"flex", alignItems:"center", justifyContent:"center",
          background: hsRgba(meta.accentColor, dark?0.14:0.09),
          border:`1px solid ${hsRgba(meta.accentColor, isHov?0.45:0.22)}`,
          filter: dark&&isHov?`drop-shadow(0 0 6px ${hsRgba(meta.accentColor,0.7)})`:"none",
          transition:"filter 0.2s, border-color 0.2s",
        }}>
          <Icon name={meta.icon} size={isDesktop?17:14} color={isHov?meta.accentColor:th.textSub} strokeWidth={1.7}/>
        </div>
        <div style={{ fontSize: isDesktop?13:11, fontWeight:800, letterSpacing:-0.2, lineHeight:1.2, color: isHov?meta.accentColor:th.text, marginBottom:4, transition:"color 0.18s" }}>{name}</div>
        <div style={{ fontSize: isDesktop?10:9, color:th.textSub, lineHeight:1.5, marginBottom: isDesktop?10:8 }}>{meta.desc}</div>
        {meta.badge && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 7px", background:hsRgba(meta.badge2Color,0.12), border:`1px solid ${hsRgba(meta.badge2Color,0.28)}`, borderRadius:20, fontSize:8.5, fontWeight:700, color:meta.badge2Color, fontFamily:MONO_FONT, maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            <span style={{ display:"inline-block", width:4, height:4, borderRadius:"50%", background:meta.badge2Color, flexShrink:0 }} />
            {meta.badge}
          </div>
        )}
      </div>
      <div style={{ position:"absolute", bottom: isDesktop?13:9, right: isDesktop?13:9, fontSize:15, fontWeight:700, color: isHov?meta.accentColor:(dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)"), transform: isHov?"translateX(3px)":"translateX(0)", transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)" }}>›</div>
    </div>
  );
}

function HomeScreen({ users, reports, loading, dark, isDesktop, TABS, navigateTab, error, refreshing, sessionStart, lastSynced, latencyMs, onRefresh }) {
  const th = THEME[dark ? "dark" : "light"];
  const [hovered, setHovered] = React.useState(null);
  const [newTodayDismissed, setNewTodayDismissed] = React.useState(false);

  const nowMs       = Date.now();
  const openR       = reports.filter(r => r.status === "open").length;
  const inProg      = reports.filter(r => r.status === "in_progress").length;
  const resolvedR   = reports.filter(r => r.status === "resolved").length;
  const actDay      = users.filter(u => u.lastSeen?.seconds && (nowMs - u.lastSeen.seconds * 1000) < 86400000).length;
  const actWeek     = users.filter(u => u.lastSeen?.seconds && (nowMs - u.lastSeen.seconds * 1000) < 7 * 86400000).length;
  const newWk       = users.filter(u => u.createdAt?.seconds && (nowMs - u.createdAt.seconds * 1000) < 7 * 86400000).length;
  const newToday    = users.filter(u => u.createdAt?.seconds && (nowMs - u.createdAt.seconds * 1000) < 86400000).length;
  const googleUsers = users.filter(u => u.photo).length;
  const withPhone   = users.filter(u => u.phone && u.phone.length > 0).length;
  const statesCount = Object.keys(users.reduce((acc, u) => { if (u.state) acc[u.state] = 1; return acc; }, {})).length;
  const dormantCnt  = users.filter(u => u.lastSeen?.seconds && (nowMs - u.lastSeen.seconds * 1000) > 30 * 86400000).length;
  const engPct      = users.length > 0 ? Math.round((actDay / users.length) * 100) : 0;
  const weekEngPct  = users.length > 0 ? Math.round((actWeek / users.length) * 100) : 0;
  const unreplied   = reports.filter(r => r.status === "open" && !r.adminReply && !(r.replyHistory?.length > 0)).length;
  const bplCount    = users.filter(u => u.ration === "bpl" || u.ration === "aay").length;

  // 7-day new-user sparkline
  const ONE_DAY = 86400000;
  const spark7 = Array.from({ length: 7 }, (_, i) => {
    const dayStart = nowMs - (6 - i) * ONE_DAY;
    const dayEnd   = dayStart + ONE_DAY;
    return users.filter(u => u.createdAt?.seconds &&
      u.createdAt.seconds * 1000 >= dayStart &&
      u.createdAt.seconds * 1000 < dayEnd).length;
  });

  // ── Week-over-week delta for KPI cards ──
  const prevWkUsers     = users.filter(u => u.createdAt?.seconds &&
    (nowMs - u.createdAt.seconds * 1000) >= ONE_DAY * 7 &&
    (nowMs - u.createdAt.seconds * 1000) <  ONE_DAY * 14).length;
  const newWkDelta      = newWk - prevWkUsers;
  const newWkDeltaStr   = newWkDelta > 0 ? `▲ +${newWkDelta} vs last wk`
                        : newWkDelta < 0 ? `▼ ${Math.abs(newWkDelta)} vs last wk`
                        : `= same as last wk`;
  const newWkDeltaColor = newWkDelta > 0 ? IND_GREEN : newWkDelta < 0 ? "#E53E3E" : th.textSub;

  const TAB_META = {
    overview:  { desc:"Platform KPIs, welfare metrics & live insights",            badge: loading ? "loading…" : `${actDay} active today`,                                  badge2Color:IND_GREEN, accentColor:NAVY,      glow:"rgba(0,53,128,0.35)",     icon:"overview" },
    users:     { desc:"Browse, filter, search & inspect all user profiles",        badge: loading ? "…" : `${newWk} new this week`,                                        badge2Color:GOOGLE_B,  accentColor:GOOGLE_B,  glow:"rgba(66,133,244,0.35)",   icon:"users" },
    analytics: { desc:"Demographics, donuts, charts & cross-tab matrices",         badge:"8 dimensions",                                                                    badge2Color:VIOLET,    accentColor:VIOLET,    glow:"rgba(139,92,246,0.35)",   icon:"analytics" },
    activity:  { desc:"Eligibility runs, logins & real-time usage feed",           badge: loading ? "…" : `${actDay} active today`,                                        badge2Color:SAFFRON,   accentColor:SAFFRON,   glow:"rgba(255,153,51,0.35)",   icon:"activity" },
    usage:     { desc:"Feature telemetry — AI chat, searches & checker runs",      badge:"live metrics",                                                                    badge2Color:PINK,      accentColor:PINK,      glow:"rgba(236,72,153,0.35)",   icon:"usage" },
    schemes:   { desc:"State-wise scheme coverage, gaps & distribution map",       badge:"all India states",                                                                badge2Color:IND_GREEN, accentColor:IND_GREEN, glow:"rgba(19,136,8,0.35)",     icon:"schemes" },
    reports:   { desc:"User-reported issues, admin replies & status workflow",     badge: loading ? "…" : openR > 0 ? `${openR} open · ${inProg} in prog` : "all clear ✓", badge2Color: openR > 0 ? "#E53E3E" : IND_GREEN, accentColor:"#E53E3E", glow:"rgba(229,62,62,0.35)", icon:"reports" },
    cleanup:   { desc:"Purge resolved reports & flush stale usage data",           badge:"database hygiene",                                                                badge2Color:"#F59E0B", accentColor:"#F59E0B", glow:"rgba(245,158,11,0.35)",   icon:"cleanup" },
    verify:    { desc:"Ping scheme URLs & extract deadlines via AI",               badge:"Tier 1 + Tier 2",                                                                 badge2Color:NAVY,      accentColor:NAVY,      glow:"rgba(0,53,128,0.35)",     icon:"verify" },
    agents:    { desc:"Live presence, session tracking & activity feed for agents", badge:"live · auto-refresh",                                                             badge2Color:IND_GREEN, accentColor:IND_GREEN, glow:"rgba(19,136,8,0.35)",     icon:"agents" },
    news:      { desc:"Manage scheme news ticker — add, toggle & sync live updates",  badge:"live ticker",                                                                     badge2Color:SAFFRON,   accentColor:SAFFRON,   glow:"rgba(255,153,51,0.35)",   icon:"news" },
    faq:       { desc:"👍/👎 helpfulness votes per FAQ — spot confusing answers fast", badge:"user feedback",                                                                   badge2Color:VIOLET,    accentColor:VIOLET,    glow:"rgba(139,92,246,0.35)",   icon:"faq"  },
    export:    { desc:"Compile & download full-dashboard PDF intelligence report",  badge:"landscape A4 · PDF",                                                             badge2Color:"#10B981", accentColor:"#10B981", glow:"rgba(16,185,129,0.35)",   icon:"export" },
  };

  const cols     = isDesktop ? 5 : 2;
  const tabCards = TABS.filter(([id]) => TAB_META[id]);
  const engColor = engPct >= 20 ? IND_GREEN : engPct >= 5 ? SAFFRON : "#E53E3E";

  // ── Attention items for the priority feed ──
  const ALERTS = [
    unreplied > 0 && {
      id:"unreplied", icon:"alert",
      text: `${unreplied} open report${unreplied>1?"s":""} need a reply`,
      color:"#E53E3E", action:"reports",
    },
    inProg > 0 && {
      id:"inprog", icon:"refresh",
      text: `${inProg} report${inProg>1?"s":""} in progress`,
      color:"#D97706", action:"reports",
    },
    dormantCnt > 0 && {
      id:"dormant", icon:"moon",
      text: `${dormantCnt} user${dormantCnt>1?"s":""} dormant 30+ days`,
      color:SAFFRON, action:"activity",
    },
  ].filter(Boolean);

  // ── Digest data for "ALL CLEAR" empty priority feed state ──
  const digestTopUser = users.length > 0
    ? [...users].sort((a,b) => (b.lastSeen?.seconds||0) - (a.lastSeen?.seconds||0))[0]
    : null;
  const digestStateCounts = groupBy(users, "state");
  const digestTopState = users.length > 0
    ? Object.entries(digestStateCounts).sort((a,b) => b[1] - a[1])[0]
    : null;

  // ── System status telemetry (real, derived from actual fetch state) ──
  const dbOnline = !error;
  const dbStateLabel = error ? "ERROR" : refreshing ? "SYNCING" : loading ? "CONNECTING" : "CONNECTED";
  const dbStateColor = error ? "#E53E3E" : (refreshing || loading) ? SAFFRON : IND_GREEN;
  const latencyLabel = latencyMs == null ? "—" : `${latencyMs}ms`;
  const latencyColor = latencyMs == null ? th.textSub : latencyColorFor(latencyMs);

  return (
    <div style={{
      flex:1,
      padding: isDesktop ? "28px 40px 48px" : "14px 13px 36px",
      maxWidth: isDesktop ? 1400 : "100%",
      margin: isDesktop ? "0 auto" : undefined,
      width:"100%", boxSizing:"border-box",
    }}>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes hs-pulse   { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes hs-fadein  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hs-scan    { 0%{top:-2px} 100%{top:102%} }
        @keyframes hs-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes hs-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes hs-cursor  { 0%,55%{opacity:1} 55.01%,100%{opacity:0} }
        @keyframes hs-latency-flash { 0%{opacity:0.35;transform:scale(0.92)} 55%{opacity:1;transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }
        .hs-cursor { display:inline-block; animation:hs-cursor 1.05s steps(1) infinite; }
        .hs-module { transition:all 0.22s cubic-bezier(0.22,1,0.36,1); cursor:pointer; }
        .hs-module:hover { transform:translateY(-3px) scale(1.012); }
        .hs-module:active { transform:translateY(0) scale(0.98); }
        @media (hover: none) { .hs-module:hover { transform:none; } }
        .hs-alert-row { transition:background 0.15s; cursor:pointer; }
        .hs-alert-row:hover { background: rgba(255,255,255,0.04) !important; }
        .hs-refresh-btn:hover { border-color: ${hsRgba(NAVY,0.4)} !important; color: ${NAVY} !important; }
      `}</style>

      {/* ══════════════════════════════════════
          COMMAND HEADER — split layout
      ══════════════════════════════════════ */}
      <div style={{
        display: isDesktop ? "flex" : "block",
        gap:14, marginBottom:14,
        animation:"hs-fadein 0.35s ease both",
      }}>

        {/* ── LEFT: identity + live KPIs ── */}
        <div style={{
          flex: isDesktop ? "1 1 0" : undefined,
          background: dark
            ? "linear-gradient(150deg,#07101f 0%,#0b1830 60%,#0d1128 100%)"
            : "linear-gradient(150deg,#f2f6ff 0%,#fff9f3 100%)",
          border:`1px solid ${dark ? "rgba(0,53,128,0.45)" : "rgba(0,53,128,0.12)"}`,
          borderRadius:18, padding: isDesktop ? "22px 24px 18px" : "16px 15px 14px",
          position:"relative", overflow:"hidden",
          boxShadow: dark
            ? "0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 4px 24px rgba(0,53,128,0.09)",
          marginBottom: isDesktop ? 0 : 10,
        }}>
          {/* India tricolor bar */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:3,
            background:`linear-gradient(90deg,${SAFFRON} 0% 33.3%,#ffffff 33.3% 66.6%,${IND_GREEN} 66.6% 100%)`,
          }} />
          {/* Grid texture */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            backgroundImage:`linear-gradient(${dark?"rgba(255,255,255,0.022)":"rgba(0,53,128,0.035)"} 1px,transparent 1px),linear-gradient(90deg,${dark?"rgba(255,255,255,0.022)":"rgba(0,53,128,0.035)"} 1px,transparent 1px)`,
            backgroundSize:"28px 28px",
          }} />
          {dark && <>
            <div style={{ position:"absolute", top:-90, right:-60, width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,53,128,0.25) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-60, left:-40, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,153,51,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", left:0, right:0, height:1, pointerEvents:"none", background:`linear-gradient(90deg,transparent,${hsRgba(SAFFRON,0.18)} 40%,${hsRgba(IND_GREEN,0.13)} 60%,transparent)`, animation:"hs-scan 8s linear infinite" }} />
          </>}

            <div style={{ position:"relative" }}>
            {/* Status row */}
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9 }}>
              <span style={{
                display:"inline-block", width:6, height:6, borderRadius:"50%",
                background: loading ? SAFFRON : "#00E87A",
                boxShadow: loading
                  ? `0 0 7px ${SAFFRON}cc, 0 0 16px ${SAFFRON}66`
                  : `0 0 8px #00E87Add, 0 0 18px #00E87A77`,
                animation:"hs-pulse 1.8s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, letterSpacing:1.8,
                color: loading ? SAFFRON : "#00E87A", textTransform:"uppercase",
                textShadow: dark ? (loading ? `0 0 10px ${SAFFRON}55` : `0 0 10px #00E87A55`) : "none",
              }}>
                {loading ? "CONNECTING…" : "SYSTEM ONLINE · AUTHORISED ACCESS ONLY"}
                {!loading && <span className="hs-cursor" style={{ color:"#00E87A" }}>▌</span>}
              </span>
            </div>

            {/* Title */}
            <div style={{ fontSize: isDesktop ? 28 : 22, fontWeight:900, letterSpacing:-0.7, lineHeight:1.1, color: dark?"#eef3ff":"#091526" }}>
              Yojana<span style={{ color:SAFFRON }}>Sahay</span>
              <span style={{ fontWeight:400, fontSize: isDesktop ? 15 : 12, letterSpacing:0, color:th.textSub }}>{" "}· Admin Intelligence</span>
            </div>

            <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
              <span style={{ fontFamily:MONO_FONT, fontSize:8.5, color:th.textSub, letterSpacing:0.3 }}>Welfare scheme discovery · India · v2.0</span>
              <span style={{ fontFamily:MONO_FONT, fontSize:8, fontWeight:700, color: dark?"#00E87A":IND_GREEN, background: dark?"rgba(0,232,122,0.09)":"rgba(19,136,8,0.07)", border:`1px solid ${dark?"rgba(0,232,122,0.2)":"rgba(19,136,8,0.16)"}`, borderRadius:5, padding:"2px 7px", letterSpacing:0.4, boxShadow: dark?"0 0 10px rgba(0,232,122,0.18)":"none", textShadow: dark?"0 0 8px rgba(0,232,122,0.4)":"none" }}>✓ AUTHENTICATED</span>
              <span style={{ fontFamily:MONO_FONT, fontSize:8, fontWeight:700, color: dark?"#9fb4e8":NAVY, background: dark?"rgba(0,53,128,0.18)":"rgba(0,53,128,0.06)", border:`1px solid ${dark?"rgba(0,53,128,0.4)":"rgba(0,53,128,0.14)"}`, borderRadius:5, padding:"2px 7px", letterSpacing:0.4 }}>BUILD {ADMIN_BUILD_VERSION} · {ADMIN_BUILD_ENV}</span>
            </div>

            {/* 4-KPI row */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(4,1fr)",
              gap: isDesktop ? 10 : 7,
              marginTop:14,
            }}>
              {[
                { label:"TOTAL USERS",   value: loading?"—":users.length,  color:NAVY,                        sub: loading?"":statesCount+" states",        spark:null,   delta: loading?"": newWk>0?`▲ +${newWk} this wk`:"— no new this wk",     deltaColor: newWk>0?IND_GREEN:th.textSub },
                { label:"ACTIVE TODAY",  value: loading?"—":actDay,        color:IND_GREEN,                   sub: loading?"":engPct+"% engagement",        spark:null,   delta: loading?"": `${actWeek} active this wk`,                          deltaColor: IND_GREEN },
                { label:"OPEN REPORTS",  value: loading?"—":openR,         color: openR>0?"#E53E3E":IND_GREEN, sub: loading?"":resolvedR+" resolved",       spark:null,   delta: loading?"": unreplied>0?`${unreplied} need reply`:"all replied ✓", deltaColor: unreplied>0?"#E53E3E":IND_GREEN },
                { label:"NEW THIS WEEK", value: loading?"—":newWk,         color:SAFFRON,                     sub: loading?"":reports.length+" total rpts", spark:spark7, delta: loading?"":newWkDeltaStr,                                          deltaColor: newWkDeltaColor },
              ].map(({ label, value, color, sub, spark, delta, deltaColor }) => (
                <div key={label} style={{
                  background: dark ? "rgba(0,0,0,0.36)" : "rgba(255,255,255,0.86)",
                  border:`1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(0,53,128,0.09)"}`,
                  borderRadius:10, padding: isDesktop ? "12px 14px" : "9px 10px",
                  position:"relative", overflow:"hidden",
                  backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
                }}>
                  {/* Left color bar */}
                  <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:color, borderRadius:"0 2px 2px 0", boxShadow: dark?`0 0 8px ${color}66`:"none" }} />
                  <div style={{ paddingLeft:8 }}>
                    <div style={{ fontFamily:MONO_FONT, fontSize:7.5, fontWeight:700, color:th.textSub, letterSpacing:1.4, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
                    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:4 }}>
                      <div style={{ fontFamily:MONO_FONT, fontSize: isDesktop?28:22, fontWeight:900, lineHeight:1, letterSpacing:-1, color: dark?"#eef3ff":"#091526" }}><DecryptValue value={value} /></div>
                      {spark && <MiniSpark points={spark} color={color} width={isDesktop?52:40} height={isDesktop?22:18} />}
                    </div>
                    {sub && <div style={{ fontFamily:MONO_FONT, fontSize:7.5, marginTop:4, color, opacity:0.8, letterSpacing:0.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>}
                    {delta && <div style={{ fontFamily:MONO_FONT, fontSize:7, marginTop:2, color:deltaColor, fontWeight:700, letterSpacing:0.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{delta}</div>}
                  </div>
                  <div style={{ position:"absolute", right:-12, top:-12, width:48, height:48, borderRadius:"50%", background:hsRgba(color, dark?0.06:0.05), pointerEvents:"none" }} />
                </div>
              ))}
            </div>

            {/* Engagement bar */}
            <div style={{ marginTop:10, background: dark?"rgba(0,0,0,0.22)":"rgba(255,255,255,0.6)", border:`1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,53,128,0.07)"}`, borderRadius:8, padding:"8px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontFamily:MONO_FONT, fontSize:7.5, fontWeight:700, letterSpacing:1.4, color:th.textSub, textTransform:"uppercase" }}>DAY ENGAGEMENT</span>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:MONO_FONT, fontSize:8, color:th.textSub }}>{loading?"—":`7d: ${weekEngPct}%`}</span>
                  <span style={{ fontFamily:MONO_FONT, fontSize:11, fontWeight:900, color:engColor }}>{loading?"—":`${engPct}%`}</span>
                </div>
              </div>
              <div style={{ height:4, borderRadius:2, background: dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:2, width: loading?"0%":`${Math.min(engPct,100)}%`, background: engPct>=20?`linear-gradient(90deg,${IND_GREEN},#00E87A)`:engPct>=5?`linear-gradient(90deg,${SAFFRON},#FFB84D)`:`linear-gradient(90deg,#DC2626,#F87171)`, transition:"width 1s cubic-bezier(0.22,1,0.36,1)", boxShadow: dark&&!loading?`0 0 5px ${engColor}80`:"none" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub }}>
                <span>{loading?"—":`${actDay} active today`}</span>
                <span>{loading?"—":`of ${users.length} total`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: clock + priority alerts ── */}
        <div style={{ flex: isDesktop ? "0 0 230px" : undefined, display:"flex", flexDirection:"column", gap:10 }}>

          {/* Clock card */}
          <div style={{
            background: dark ? "rgba(6,12,24,0.95)" : "rgba(255,255,255,0.96)",
            border:`1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(0,53,128,0.12)"}`,
            borderRadius:16, padding:"16px 18px",
            backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
            boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)" : "0 4px 20px rgba(0,53,128,0.08)",
            textAlign:"center", position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${NAVY},${SAFFRON},${IND_GREEN})` }} />
            <LiveClock dark={dark} th={th} isDesktop={isDesktop} />
            <div style={{ marginTop:10, display:"flex", gap:5, justifyContent:"center" }}>
              {[
                { label:"USERS",   value: loading?"…":users.length,    color:NAVY     },
                { label:"REPORTS", value: loading?"…":reports.length,  color:SAFFRON  },
                { label:"OPEN",    value: loading?"…":openR,            color: openR>0?"#E53E3E":IND_GREEN },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex:1, background:hsRgba(color,0.08), border:`1px solid ${hsRgba(color,0.2)}`, borderRadius:7, padding:"5px 4px", textAlign:"center" }}>
                  <div style={{ fontFamily:MONO_FONT, fontSize:13, fontWeight:900, color, lineHeight:1 }}><DecryptValue value={value} /></div>
                  <div style={{ fontFamily:MONO_FONT, fontSize:6.5, color:th.textSub, letterSpacing:0.8, marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Feed */}
          <div style={{
            flex:1,
            background: dark?"rgba(10,10,18,0.9)":"rgba(255,255,255,0.96)",
            border:`1px solid ${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)"}`,
            borderRadius:16, overflow:"hidden",
            boxShadow: dark?"0 4px 20px rgba(0,0,0,0.35)":"0 2px 14px rgba(0,0,0,0.05)",
          }}>
            <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${th.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:SAFFRON, animation:"hs-pulse 1.4s ease-in-out infinite" }} />
                <span style={{ fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, letterSpacing:1.6, color:th.textSub, textTransform:"uppercase" }}>PRIORITY FEED</span>
              </div>
              <span style={{ fontFamily:MONO_FONT, fontSize:8, color:th.textSub }}>{ALERTS.length} ITEM{ALERTS.length!==1?"S":""}</span>
            </div>
            {loading ? (
              <div style={{ padding:"20px 14px", fontFamily:MONO_FONT, fontSize:9, color:th.textSub, textAlign:"center" }}>// fetching…</div>
            ) : (
              <>
                {/* ── Celebration banner — floats above the warning feed ── */}
                {newToday > 0 && !newTodayDismissed && (
                  <div style={{
                    margin:"8px 8px 6px",
                    padding:"7px 10px 7px 12px",
                    background: dark ? "rgba(0,232,122,0.08)" : "rgba(19,136,8,0.06)",
                    border:`1px solid ${dark?"rgba(0,232,122,0.22)":"rgba(19,136,8,0.18)"}`,
                    borderRadius:9,
                    display:"flex", alignItems:"center", gap:8,
                    boxShadow: dark ? "0 0 12px rgba(0,232,122,0.1)" : "none",
                  }}>
                    <span style={{ fontSize:14, lineHeight:1, flexShrink:0 }}>🎉</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, color:IND_GREEN, letterSpacing:0.3 }}>
                        {newToday} new sign-up{newToday>1?"s":""} today!
                      </div>
                      <div style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, marginTop:1 }}>
                        → <span style={{ color:IND_GREEN, cursor:"pointer", textDecoration:"underline" }} onClick={() => navigateTab("users")}>view in Users</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setNewTodayDismissed(true)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:th.textSub, fontSize:16, padding:"0 3px", lineHeight:1, flexShrink:0 }}
                    >×</button>
                  </div>
                )}
                {ALERTS.length === 0 ? (
                  <div style={{ padding:"12px 14px 10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, paddingBottom:8, borderBottom:`1px solid ${th.border}`, marginBottom:2 }}>
                      <Icon name="check" size={13} color={IND_GREEN} strokeWidth={2}/>
                      <span style={{ fontFamily:MONO_FONT, fontSize:8, color:IND_GREEN, fontWeight:700, letterSpacing:0.9 }}>ALL CLEAR · PLATFORM DIGEST</span>
                    </div>
                    {[
                      {
                        label: "LAST ACTIVE",
                        value: digestTopUser?.name || "—",
                        sub:   digestTopUser ? timeAgo(digestTopUser.lastSeen) : "—",
                        color: NAVY,
                      },
                      {
                        label: "TOP STATE",
                        value: digestTopState ? (INDIA_STATES[digestTopState[0]] || digestTopState[0]) : "—",
                        sub:   digestTopState ? `${digestTopState[1]} user${digestTopState[1]>1?"s":""}` : "—",
                        color: VIOLET,
                      },
                      {
                        label: "RESOLVED",
                        value: resolvedR,
                        sub:   `${actWeek} active this week`,
                        color: IND_GREEN,
                      },
                    ].map(({ label, value, sub, color }, i, arr) => (
                      <div key={label} style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"7px 0",
                        borderBottom: i < arr.length - 1 ? `1px solid ${th.border}` : "none",
                      }}>
                        <span style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase" }}>{label}</span>
                        <div style={{ textAlign:"right", minWidth:0, maxWidth:"62%" }}>
                          <div style={{ fontFamily:MONO_FONT, fontSize:9.5, fontWeight:700, color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
                          <div style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, marginTop:1 }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ALERTS.map((a, i) => (
                  <div
                    key={a.id}
                    className="hs-alert-row"
                    onClick={() => navigateTab(a.action)}
                    style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"9px 14px",
                      borderBottom: i < ALERTS.length - 1 ? `1px solid ${th.border}` : "none",
                      background:"transparent",
                      cursor:"pointer",
                    }}
                  >
                    <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:hsRgba(a.color,0.1), border:`1px solid ${hsRgba(a.color,0.2)}`, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name={a.icon} size={13} color={a.color} strokeWidth={1.9}/></div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:th.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.text}</div>
                    </div>
                    <div style={{ fontSize:12, color:a.color, flexShrink:0, fontWeight:700 }}>›</div>
                  </div>
                ))}
              </>
            )}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          SYSTEM STATUS BAR
      ══════════════════════════════════════ */}
      <div style={{
        display:"flex", alignItems:"center", flexWrap:"wrap",
        gap: isDesktop ? 18 : 12,
        background: dark ? "rgba(10,10,18,0.9)" : "rgba(255,255,255,0.96)",
        border:`1px solid ${dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)"}`,
        borderRadius:12, padding: isDesktop ? "10px 16px" : "9px 12px",
        marginBottom: isDesktop ? 16 : 12,
        boxShadow: dark?"0 4px 16px rgba(0,0,0,0.3)":"0 1px 8px rgba(0,0,0,0.04)",
        animation:"hs-fadein 0.4s ease both",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:dbStateColor, boxShadow:`0 0 7px ${dbStateColor}cc, 0 0 15px ${dbStateColor}66`, animation: dbOnline ? "hs-pulse 1.8s ease-in-out infinite" : "none" }} />
          <span style={{ fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, letterSpacing:1.2, color:dbStateColor, textTransform:"uppercase", textShadow: dark ? `0 0 9px ${dbStateColor}55` : "none" }}>
            {error ? "DATABASE ERROR" : "ALL SYSTEMS OPERATIONAL"}
          </span>
        </div>

        <div style={{ width:1, height:14, background:th.border, flexShrink:0 }} />

        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase" }}>FIRESTORE</span>
          <span style={{ fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, color:dbStateColor }}>{dbStateLabel}</span>
        </div>

        <div style={{ width:1, height:14, background:th.border, flexShrink:0 }} />

        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase" }}>LATENCY</span>
          <span
            key={latencyMs}
            style={{
              fontFamily:MONO_FONT, fontSize:8.5, fontWeight:700, color:latencyColor,
              textShadow: dark && latencyMs != null ? `0 0 8px ${latencyColor}66` : "none",
              transition: "color 0.5s ease, text-shadow 0.5s ease",
              animation: latencyMs != null ? "hs-latency-flash 0.5s ease" : "none",
              display:"inline-block",
            }}
          >{latencyLabel}</span>
        </div>

        <LiveStatusMeta lastSynced={lastSynced} sessionStart={sessionStart} th={th} />

        <div style={{ flex:1 }} />

      </div>

      {/* ══════════════════════════════════════
          SYSTEM VITALS STRIP
      ══════════════════════════════════════ */}
      <div style={{
        display:"grid",
        gridTemplateColumns: isDesktop ? "repeat(5,1fr)" : "repeat(2,1fr)",
        gap: isDesktop ? 9 : 7,
        marginBottom: isDesktop ? 16 : 12,
        animation:"hs-fadein 0.45s ease both",
      }}>
        {[
          { label:"GOOGLE AUTH",  value: loading?"—":googleUsers,                 color:GOOGLE_B, icon:"login" },
          { label:"PHONE USERS",  value: loading?"—":withPhone,                   color:SAFFRON,  icon:"phone" },
          { label:"WELFARE (BPL)",value: loading?"—":bplCount,                    color:VIOLET,   icon:"card" },
          { label:"DORMANT 30D",  value: loading?"—":dormantCnt,                  color: dormantCnt>0?"#F59E0B":IND_GREEN, icon:"moon" },
          { label:"IN PROGRESS",  value: loading?"—":inProg,                      color: inProg>0?"#D97706":IND_GREEN, icon:"refresh" },
        ].map(({ label, value, color, icon }, vIdx) => (
          <div key={label} style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:11, padding: isDesktop ? "10px 12px" : "8px 10px",
            display:"flex", alignItems:"center", gap:8,
            gridColumn: !isDesktop && vIdx === 4 ? "1 / -1" : undefined,
          }}>
            <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:hsRgba(color,0.1), border:`1px solid ${hsRgba(color,0.2)}`, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name={icon} size={14} color={color} strokeWidth={1.8}/></div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontFamily:MONO_FONT, fontSize: isDesktop?18:16, fontWeight:900, color:th.text, lineHeight:1, letterSpacing:-0.5 }}><DecryptValue value={value} /></div>
              <div style={{ fontFamily:MONO_FONT, fontSize:7, color:th.textSub, marginTop:2, letterSpacing:0.7, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════
          INTELLIGENCE MODULE GRID
      ══════════════════════════════════════ */}
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        marginBottom: isDesktop ? 11 : 9,
        animation:"hs-fadein 0.5s ease both",
      }}>
        <div style={{ flex:1, height:1, background:th.border }} />
        <div style={{ fontFamily:MONO_FONT, fontSize:8, fontWeight:700, letterSpacing:2.2, color:th.textSub, textTransform:"uppercase" }}>INTELLIGENCE MODULES</div>
        <div style={{ flex:1, height:1, background:th.border }} />
        <div style={{ fontFamily:MONO_FONT, fontSize:8, color:th.textSub, letterSpacing:0.5, flexShrink:0 }}>{tabCards.length} ACTIVE</div>
      </div>

      <div style={{
        display:"grid",
        gridTemplateColumns:`repeat(${cols},1fr)`,
        gap: isDesktop ? 12 : 9,
        animation:"hs-fadein 0.55s ease both",
      }}>
        {tabCards.map(([id, fullLabel]) => (
          <ModuleCard
            key={id}
            id={id}
            fullLabel={fullLabel}
            meta={TAB_META[id] || {}}
            isHov={hovered === id}
            isDesktop={isDesktop}
            dark={dark}
            th={th}
            onClick={() => navigateTab(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>


      {/* ── Footer ── */}
      <div style={{ marginTop: isDesktop ? 26 : 18, display:"flex", alignItems:"center", gap:10, animation:"hs-fadein 0.6s ease both" }}>
        <div style={{ flex:1, height:1, background:th.border }} />
        <div style={{ fontFamily:MONO_FONT, fontSize:7.5, color:th.textSub, letterSpacing:1, textTransform:"uppercase" }}>
          YojanaSahay © 2026 · Admin Panel · Authorised Use Only
        </div>
        <div style={{ flex:1, height:1, background:th.border }} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function AdminDashboard({ onClose, dark: darkProp = false, allowedTabs = null }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("admin_dark_mode");
    return saved !== null ? saved === "true" : darkProp;
  });
  const dark = darkMode;
  const th = THEME[dark ? "dark" : "light"];

  function toggleDark() {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("admin_dark_mode", String(next));
      return next;
    });
  }

  const [users,         setUsers]         = useState([]);
  const [reports,       setReports]       = useState([]);
  const [reportsLoading,setReportsLoading]= useState(false);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filterOcc,     setFilterOcc]     = useState("all");
  const [filterState,   setFilterState]   = useState("all");
  const [filterArea,    setFilterArea]    = useState("all");
  const [filterIncome,  setFilterIncome]  = useState("all");
  const [sortField,     setSortField]     = useState("lastSeen");
  const [sortDir,       setSortDir]       = useState("desc");
  const [page,          setPage]          = useState(1);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [exportModal,    setExportModal]   = useState(false);
  const [exportStep,     setExportStep]   = useState(-1);
  const [exportDone,     setExportDone]   = useState(false);
  const [exportSections, setExportSections] = useState(
    () => new Set(["overview","analytics","users","activity","schemes","reports"])
  );
  const [usageData,     setUsageData]     = useState(null);
  const [usageLoading,  setUsageLoading]  = useState(false);

  // ── Scheme News (News tab) ────────────────────────────────────────────────


  // ── Boot sequence intro — once per browser session ──────────────────────
  const [showBoot, setShowBoot] = useState(() => {
    try { return sessionStorage.getItem("ys_admin_booted") !== "true"; }
    catch { return true; }
  });
  const finishBoot = useCallback(() => {
    try { sessionStorage.setItem("ys_admin_booted", "true"); } catch {}
    setShowBoot(false);
  }, []);

  // ── System status telemetry (Home tab) ─────────────────────────────────────
  const [sessionStart]  = useState(() => Date.now());
  const [lastSynced,    setLastSynced]    = useState(null);
  const [latencyMs,     setLatencyMs]     = useState(null);

  // ── Live session uptime clock (header identity chip) ──────────────────────
  const [sessionSecs, setSessionSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmtSession = (s) => {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h
      ? `${h}h ${String(m).padStart(2,"0")}m`
      : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  // ── Responsive: track window width ───────────────────────────────────────
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 375
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isDesktop = windowWidth >= 900;

  // ── Session user (who is logged in to this admin session) ─────────────────
  const [sessionUser, setSessionUser] = useState(null);
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setSessionUser(u));
    return () => unsub();
  }, []);

  // ── Agent presence heartbeat — writes this admin's online status to Firestore ──
  useAgentPresence(
    sessionUser?.uid,
    sessionUser?.displayName || sessionUser?.email,
    sessionUser?.email,
    activeSection,
    isDesktop,
    allowedTabs,
  );

  // ── Daily time tracking — credits real active seconds to agentTimeLogs ─────
  useDailyTimeTracking(
    sessionUser?.uid,
    sessionUser?.displayName || sessionUser?.email,
    sessionUser?.email,
  );

  // ── Log a real admin action to the Agents-tab activity feed ────────────────
  const logActivity = useCallback((action, tab, type = "view") => {
    logAdminActivity(
      sessionUser?.uid,
      sessionUser?.displayName || sessionUser?.email,
      action,
      tab,
      type,
    );
  }, [sessionUser]);

  // ── Smart tab navigation ──────────────────────────────────────────────────
  const tabsBarRef      = useRef(null);
  const swipeTouchStartX = useRef(null);
  const swipeTouchStartY = useRef(null);
  const [tabTransition, setTabTransition] = useState(null); // "fwd-out" | "bwd-out" | "fwd-in" | "bwd-in" | null

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    const t0 = performance.now();
    try {
      const snap = await getDocs(collection(db, "users"));
      setLatencyMs(Math.round(performance.now() - t0));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0));
      setUsers(data);
      setLastSynced(new Date());
    } catch (err) {
      setLatencyMs(null);
      setError("Failed to load users. Check Firestore rules.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  // ── Latency auto-refresh — keeps the LATENCY readout live between manual
  // refreshes. fetchUsers() (the source of latencyMs) only runs on mount and
  // on manual refresh, so without this the number on screen goes stale the
  // moment you stop clicking refresh. Pings a single small doc (cheap — one
  // read) instead of re-fetching the whole users collection, and skips while
  // the tab is backgrounded to avoid burning reads for no reason.
  useEffect(() => {
    let cancelled = false;
    const pingLatency = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const t0 = performance.now();
      try {
        await getDoc(doc(db, "appStats", "usage"));
        if (!cancelled) setLatencyMs(Math.round(performance.now() - t0));
      } catch {
        if (!cancelled) setLatencyMs(null);
      }
    };
    const id = setInterval(pingLatency, 2500);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // ── Fetch Reports ─────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const snap = await getDocs(collection(db, "reports"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReports(data);
      setLastSynced(new Date());
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Fetch reports eagerly on mount so the tab badge shows immediately
  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    if (activeSection === "reports") fetchReports();
  }, [activeSection]);

  // ── Fetch Usage Stats ─────────────────────────────────────────────────────
  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const snap = await getDoc(doc(db, "appStats", "usage"));
      setUsageData(snap.exists() ? snap.data() : {});
    } catch (err) {
      console.error("Failed to load usage stats:", err);
      setUsageData({});
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "usage" && !usageData) fetchUsage();
  }, [activeSection]);




  // ── News: toggle active field ─────────────────────────────────────────────


  // ── News: delete item ─────────────────────────────────────────────────────




  // ── Computed stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = Date.now();
    const ONE_DAY = 86400000;
    const ONE_WEEK = ONE_DAY * 7;
    const TWO_WEEKS = ONE_WEEK * 2;

    const byState = groupBy(users, "state");
    const byOcc   = groupBy(users, "occupation");
    const byInc   = groupBy(users, "income");
    const byAge   = groupBy(users, "age");
    const byArea  = groupBy(users, "area");

    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    const incData = Object.entries(byInc)
      .map(([key, value]) => ({ label: INC_LABELS[key] || key, value }));

    const ageData = Object.entries(byAge)
      .map(([key, value]) => ({ label: AGE_LABELS[key] || key, value }));

    const occDonut = Object.entries(byOcc).sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: `${OCC_EMOJI[key] || ""} ${OCC_LABELS[key] || key}`, value,
      }));

    const areaDonut = Object.entries(byArea)
      .map(([key, value]) => ({ label: AREA_LABELS[key] || key, value }));

    const activeToday = users.filter(u =>
      u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < ONE_DAY
    ).length;

    const activeWeek = users.filter(u =>
      u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < ONE_WEEK
    ).length;

    const newThisWeek = users.filter(u =>
      u.createdAt?.seconds && (now - u.createdAt.seconds * 1000) < ONE_WEEK
    ).length;

    const newLastWeek = users.filter(u =>
      u.createdAt?.seconds &&
      (now - u.createdAt.seconds * 1000) >= ONE_WEEK &&
      (now - u.createdAt.seconds * 1000) < TWO_WEEKS
    ).length;

    const weekGrowth = newLastWeek > 0
      ? Math.round(((newThisWeek - newLastWeek) / newLastWeek) * 100)
      : 0;

    const googleUsers  = users.filter(u => u.photo).length;
    const withPhone    = users.filter(u => u.phone && u.phone.length > 0).length;
    const statesCount  = Object.keys(byState).length;
    const housedUsers  = users.filter(u => u.house === "yes").length;
    const needHousing  = users.filter(u => u.house === "no").length;

    const byGender  = groupBy(users, "gender");
    const byRation  = groupBy(users, "ration");
    const byMarital = groupBy(users, "marital");
    const byDisab   = groupBy(users.map(u => ({...u, disability: u.disability==="none"||!u.disability?"none":u.disability})), "disability");

    const genderData = Object.entries(byGender)
      .map(([key, value]) => ({ label: GENDER_LABELS[key]?.replace(/[👨👩🧑]/gu,"").trim() || key, value }));
    const rationData = Object.entries(byRation)
      .map(([key, value]) => ({ label: RATION_LABELS[key]?.replace(/[🚫🟡🔴]/gu,"").trim() || key, value }));
    const maritalData = Object.entries(byMarital)
      .map(([key, value]) => ({ label: MARITAL_LABELS[key]?.replace(/[💍🕊️]/gu,"").trim() || key, value }));
    const disabData = Object.entries(byDisab)
      .map(([key, value]) => ({ label: DISAB_LABELS[key]?.replace(/[✅🦽👁🦻🧠]/gu,"").trim() || key, value }));

    // 7-day signup sparkline
    const spark = Array.from({ length:7 }, (_, i) => {
      const dayStart = now - (6 - i) * ONE_DAY;
      const dayEnd   = dayStart + ONE_DAY;
      return users.filter(u => {
        if (!u.createdAt?.seconds) return false;
        const ms = u.createdAt.seconds * 1000;
        return ms >= dayStart && ms < dayEnd;
      }).length;
    });

    const dormantCount = users.filter(u =>
      u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) > 30 * ONE_DAY
    ).length;

    return {
      topStates, incData, ageData,
      occDonut, areaDonut,
      activeToday, activeWeek, newThisWeek, weekGrowth,
      googleUsers, withPhone, statesCount, housedUsers, needHousing, spark,
      genderData, rationData, maritalData, disabData,
      dormantCount,
    };
  }, [users]);

  // ── Sort helper ───────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    setSortDir(prev => sortField === field ? (prev === "asc" ? "desc" : "asc") : "desc");
    setSortField(field);
    setPage(1);
  }, [sortField]);

  // ── Filtered + sorted users ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (u.name  || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.state || "").toLowerCase().includes(q);
      const matchOcc    = filterOcc    === "all" || u.occupation === filterOcc;
      const matchState  = filterState  === "all" || u.state      === filterState;
      const matchArea   = filterArea   === "all" || u.area       === filterArea;
      const matchIncome = filterIncome === "all" || u.income     === filterIncome;
      return matchSearch && matchOcc && matchState && matchArea && matchIncome;
    });
    // Sort
    list.sort((a, b) => {
      let va, vb;
      if (sortField === "lastSeen") {
        va = a.lastSeen?.seconds || 0;
        vb = b.lastSeen?.seconds || 0;
      } else if (sortField === "createdAt") {
        va = a.createdAt?.seconds || 0;
        vb = b.createdAt?.seconds || 0;
      } else if (sortField === "name") {
        va = (a.name || "").toLowerCase();
        vb = (b.name || "").toLowerCase();
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return list;
  }, [users, search, filterOcc, filterState, filterArea, filterIncome, sortField, sortDir]);

  // ── Paginated slice ────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Unique values for filter dropdowns ────────────────────────────────────
  const allStates = useMemo(() =>
    [...new Set(users.map(u => u.state).filter(Boolean))].sort()
  , [users]);

  // ── Full Dashboard PDF Export (all sections, all fields) ─────────────────
  const exportAllPDF = useCallback((sectionsToInclude) => {
    // Default to all sections if none specified
    const s = sectionsToInclude instanceof Set && sectionsToInclude.size > 0
      ? sectionsToInclude
      : new Set(["overview","analytics","users","activity","schemes","reports"]);
    const now      = Date.now();
    const dateStr  = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
    const timeStr  = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
    const isoDate  = new Date().toISOString().slice(0, 10);

    // ── Emoji-strip helper (safe for PDF) ────────────────────────────────
    function strip(str) {
      return (str || "").replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
    }

    // ── Mini bar (premium dark style) ────────────────────────────────
    function miniBar(pct, color = "#4f8ef7") {
      const safeW = Math.max(pct, 2);
      return `<span class="bar-track"><span class="bar-fill" style="width:${safeW}px;background:${color};opacity:0.9;"></span></span>`;
    }

    // ── Summary key/value table ───────────────────────────────────────
    function summaryTable(rows, accent = "#4f8ef7") {
      return `<div class="card"><table class="sum-tbl"><tbody>
        ${rows.map(([k, v, sub]) =>
          `<tr>
            <td class="sum-key">${k}</td>
            <td class="sum-val" style="color:${accent}">${v}${sub ? `<span class="sum-sub">${sub}</span>` : ""}</td>
          </tr>`
        ).join("")}
      </tbody></table></div>`;
    }

    // ── Full data table ───────────────────────────────────────────────
    function dataTable(headers, rows, colWidths = []) {
      return `<table>
        <thead><tr>${headers.map((h, i) =>
          `<th${colWidths[i] ? ` style="width:${colWidths[i]}"` : ""}>${h}</th>`
        ).join("")}</tr></thead>
        <tbody>
          ${rows.length === 0
            ? `<tr><td colspan="${headers.length}" style="color:#4a4f6a;padding:10px;text-align:center;font-style:italic">No data available</td></tr>`
            : rows.map((r, i) =>
                `<tr class="${i % 2 === 0 ? "even" : "odd"}">
                  ${r.map(v => `<td>${v ?? "—"}</td>`).join("")}
                </tr>`
              ).join("")
          }
        </tbody>
      </table>`;
    }

    // ── Breakdown block with inline bars ─────────────────────────────
    function breakdownBlock(title, entries, color = "#4f8ef7") {
      const sorted = [...entries].sort((a, b) => b[1] - a[1]);
      const total  = sorted.reduce((s, [, v]) => s + v, 0);
      const max    = sorted[0]?.[1] || 1;
      return `<div class="breakdown">
        <div class="bd-title">${title} <span class="bd-total">(${total} total)</span></div>
        <table>
          <thead><tr><th>Category</th><th style="width:80px">Trend</th><th style="width:36px">Count</th><th style="width:36px">%</th></tr></thead>
          <tbody>
            ${sorted.map(([k, v], i) => {
              const pct = total ? Math.round(v / total * 100) : 0;
              const barW = Math.round((v / max) * 72);
              return `<tr class="${i % 2 === 0 ? "even" : "odd"}">
                <td>${k}</td>
                <td>${miniBar(barW, color)}</td>
                <td style="text-align:right;font-weight:700;color:${color}">${v}</td>
                <td style="text-align:right;color:#4a4f6a">${pct}%</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    }

    // ── Cross-tab matrix ──────────────────────────────────────────────
    function crossTabBlock(title, data, rowKey, colKey, rowLabels, colLabels) {
      const rows = Object.keys(rowLabels);
      const cols = Object.keys(colLabels);
      const matrix = {};
      rows.forEach(r => { matrix[r] = {}; cols.forEach(c => { matrix[r][c] = 0; }); });
      data.forEach(u => {
        const r = u[rowKey]; const c = u[colKey];
        if (matrix[r] !== undefined && c !== undefined) matrix[r][c] = (matrix[r][c] || 0) + 1;
      });
      return `<div class="breakdown">
        <div class="bd-title">${title}</div>
        <table>
          <thead><tr>
            <th></th>
            ${cols.map(c => `<th style="text-align:center">${strip(colLabels[c])}</th>`).join("")}
            <th style="text-align:center">Total</th>
          </tr></thead>
          <tbody>
            ${rows.map((r, i) => {
              const rowTotal = cols.reduce((s, c) => s + (matrix[r][c] || 0), 0);
              return `<tr class="${i % 2 === 0 ? "even" : "odd"}">
                <td style="font-weight:700">${strip(rowLabels[r])}</td>
                ${cols.map(c => {
                  const v = matrix[r][c] || 0;
                  const pct = rowTotal ? Math.round(v / rowTotal * 100) : 0;
                  return `<td style="text-align:center;${v > 0 ? "font-weight:700" : "color:#2a2d40"}">${v > 0 ? `${v}<br><span style="font-size:7px;color:#4a4f6a">${pct}%</span>` : "·"}</td>`;
                }).join("")}
                <td style="text-align:center;font-weight:800;color:#4f8ef7">${rowTotal}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
    }

    // ── Section header ────────────────────────────────────────────────
    function sectionHeader(icon, title, count = null) {
      return `<div class="section-title"><span class="s-icon">${icon}</span>${title}${count !== null ? ` <span class="badge">${count}</span>` : ""}</div>`;
    }

    // ══════════════════════════════════════════════════════════════════
    // SECTION 1 — OVERVIEW
    // ══════════════════════════════════════════════════════════════════
    const activeToday   = users.filter(u => u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < 86400000).length;
    const activeWeek    = users.filter(u => u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < 7 * 86400000).length;
    const activeMonth   = users.filter(u => u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < 30 * 86400000).length;
    const newToday      = users.filter(u => u.createdAt?.seconds && (now - u.createdAt.seconds * 1000) < 86400000).length;
    const newThisWeek   = users.filter(u => u.createdAt?.seconds && (now - u.createdAt.seconds * 1000) < 7 * 86400000).length;
    const newThisMonth  = users.filter(u => u.createdAt?.seconds && (now - u.createdAt.seconds * 1000) < 30 * 86400000).length;
    const withPhone     = users.filter(u => u.phone && u.phone.trim()).length;
    const withEmail     = users.filter(u => u.email && u.email.trim()).length;
    const withBoth      = users.filter(u => u.phone && u.email).length;
    const withNeither   = users.filter(u => !u.phone && !u.email).length;
    const googleUsers   = users.filter(u => u.photo).length;
    const guestUsers    = users.length - googleUsers;
    const openRep       = reports.filter(r => r.status === "open").length;
    const inProgRep     = reports.filter(r => r.status === "in_progress").length;
    const resolvedRep   = reports.filter(r => r.status === "resolved").length;
    const reopenedRep   = reports.filter(r => r.replyHistory?.some(h => h.isReopen) && r.status !== "resolved").length;
    const repliedRep    = reports.filter(r => r.adminReply || r.replyHistory?.length > 0).length;
    const unrepliedOpen = reports.filter(r => r.status === "open" && !r.adminReply && !(r.replyHistory?.length > 0)).length;
    const uniqueStates  = new Set(users.map(u => u.state).filter(Boolean)).size;
    const farmersCount  = users.filter(u => u.occupation === "farmer").length;
    const studentsCount = users.filter(u => u.occupation === "student").length;
    const bplUsers      = users.filter(u => u.ration === "bpl" || u.ration === "aay").length;
    const disabledUsers = users.filter(u => u.disability && u.disability !== "none").length;
    const needHousing   = users.filter(u => u.house === "no" || u.house === "kutcha").length;
    const withGirls     = users.filter(u => u.hasGirls === "yes").length;

    const overviewHTML = `
      <div class="section">
        ${sectionHeader("📊", "Overview — Platform Summary")}
        <div class="three-col">
          ${summaryTable([
            ["👥 Total Registered Users",  users.length],
            ["🟢 Active Today",            activeToday],
            ["📅 Active This Week",        activeWeek],
            ["📆 Active This Month",       activeMonth],
            ["🆕 Joined Today",            newToday],
            ["🆕 Joined This Week",        newThisWeek],
            ["🆕 Joined This Month",       newThisMonth],
          ], "#4f8ef7")}
          ${summaryTable([
            ["📱 Phone Only",              withPhone - withBoth],
            ["✉️ Email Only",              withEmail - withBoth],
            ["📱✉️ Both Phone & Email",    withBoth],
            ["🚫 No Contact Info",         withNeither],
            ["🔵 Google Account",          googleUsers],
            ["👤 Guest / Phone Account",   guestUsers],
            ["📍 States Represented",      uniqueStates],
          ], "#3dd68c")}
          ${summaryTable([
            ["📬 Total Reports",           reports.length],
            ["🔴 Open",                    openRep],
            ["🟡 In Progress",             inProgRep],
            ["✅ Resolved",                resolvedRep],
            ["🔁 Reopened",                reopenedRep],
            ["💬 Admin Replied",           repliedRep],
            ["⚠️ Open & Unreplied",        unrepliedOpen],
          ], "#f87171")}
        </div>
        <div class="info-bar">
          Welfare Snapshot — BPL/AAY Users: <strong>${bplUsers}</strong> (${users.length ? Math.round(bplUsers/users.length*100) : 0}%) &nbsp;|&nbsp;
          Disabled Users: <strong>${disabledUsers}</strong> &nbsp;|&nbsp;
          Need Housing: <strong>${needHousing}</strong> &nbsp;|&nbsp;
          Farmers: <strong>${farmersCount}</strong> &nbsp;|&nbsp;
          Students: <strong>${studentsCount}</strong> &nbsp;|&nbsp;
          Families with Girl Child: <strong>${withGirls}</strong>
        </div>
      </div>`;

    // ══════════════════════════════════════════════════════════════════
    // SECTION 2 — DEMOGRAPHICS & ANALYTICS
    // ══════════════════════════════════════════════════════════════════
    const byOcc     = groupBy(users, "occupation");
    const byInc     = groupBy(users, "income");
    const byAge     = groupBy(users, "age");
    const byArea    = groupBy(users, "area");
    const byGender  = groupBy(users, "gender");
    const byRation  = groupBy(users, "ration");
    const byMarital = groupBy(users, "marital");
    const byDisab   = groupBy(users.map(u => ({...u, disability: u.disability || "none"})), "disability");
    const byHouse   = groupBy(users, "house");
    const byState   = groupBy(users, "state");
    const byKids    = groupBy(users, "numChildren");
    const byLand    = groupBy(users.filter(u => u.occupation === "farmer"), "landHolding");
    const byKisan   = groupBy(users.filter(u => u.occupation === "farmer"), "kisanCard");
    const byEduc    = groupBy(users.filter(u => u.occupation === "student"), "educationLevel");
    const byInst    = groupBy(users.filter(u => u.occupation === "student"), "institutionType");

    const analyticsHTML = `
      <div class="section page-break">
        ${sectionHeader("🧮", "Demographics & Analytics")}
        <div class="two-col">
          ${breakdownBlock("💼 Occupation", Object.entries(byOcc).map(([k,v]) => [OCC_LABELS[k]||k, v]), "#4f8ef7")}
          ${breakdownBlock("💰 Income Range", Object.entries(byInc).map(([k,v]) => [INC_LABELS[k]||k, v]), "#f7824f")}
        </div>
        <div class="two-col">
          ${breakdownBlock("🎂 Age Group", Object.entries(byAge).map(([k,v]) => [AGE_LABELS[k]||k, v]), "#a78bfa")}
          ${breakdownBlock("🏘️ Area Type", Object.entries(byArea).map(([k,v]) => [AREA_LABELS[k]||k, v]), "#3dd68c")}
        </div>
        <div class="two-col">
          ${breakdownBlock("⚧ Gender", Object.entries(byGender).map(([k,v]) => [strip(GENDER_LABELS[k]||k), v]), "#f472b6")}
          ${breakdownBlock("💍 Marital Status", Object.entries(byMarital).map(([k,v]) => [strip(MARITAL_LABELS[k]||k), v]), "#4f8ef7")}
        </div>
        <div class="two-col">
          ${breakdownBlock("🪪 Ration Card", Object.entries(byRation).map(([k,v]) => [strip(RATION_LABELS[k]||k), v]), "#fbbf24")}
          ${breakdownBlock("♿ Disability", Object.entries(byDisab).map(([k,v]) => [strip(DISAB_LABELS[k]||k||"None"), v]), "#3dd68c")}
        </div>
        <div class="two-col">
          ${breakdownBlock("🏠 Housing Status", Object.entries(byHouse).map(([k,v]) => [strip(HOUSE_LABELS[k]||k), v]), "#4f8ef7")}
          ${breakdownBlock("👨‍👩‍👧 No. of Children", Object.entries(byKids).map(([k,v]) => [CHILDREN_LABELS[k]||k, v]), "#a78bfa")}
        </div>
      </div>

      <div class="section page-break">
        ${sectionHeader("🌾", "Farmer-Specific Analytics")} 
        <div style="color:#4a4f6a;font-family:var(--mono);font-size:7.5px;margin-bottom:6px">${farmersCount} farmer${farmersCount!==1?"s":""} registered</div>
        <div class="two-col">
          ${breakdownBlock("🌾 Land Holding (Farmers)", Object.entries(byLand).map(([k,v]) => [LAND_LABELS[k]||k, v]), "#3dd68c")}
          ${breakdownBlock("💳 Kisan Credit Card (Farmers)", Object.entries(byKisan).map(([k,v]) => [strip(KISAN_LABELS[k]||k), v]), "#f7824f")}
        </div>
        ${sectionHeader("🎓", "Student-Specific Analytics")}
        <div style="color:#4a4f6a;font-family:var(--mono);font-size:7.5px;margin-bottom:6px">${studentsCount} student${studentsCount!==1?"s":""} registered</div>
        <div class="two-col">
          ${breakdownBlock("📚 Education Level (Students)", Object.entries(byEduc).map(([k,v]) => [EDUC_LABELS[k]||k, v]), "#a78bfa")}
          ${breakdownBlock("🏫 Institution Type (Students)", Object.entries(byInst).map(([k,v]) => [strip(INST_LABELS[k]||k), v]), "#4f8ef7")}
        </div>
        ${sectionHeader("🔀", "Cross-Tab Analysis")}
        ${crossTabBlock("Income vs Ration Card", users, "income", "ration",
          { below1:"<1L", "1to3":"1-3L", "3to6":"3-6L", above6:">6L" },
          { none:"None", apl:"APL", bpl:"BPL", aay:"AAY" }
        )}
        ${crossTabBlock("Occupation vs Area Type", users, "occupation", "area",
          { farmer:"Farmer", student:"Student", women:"Homemaker", senior:"Senior", business:"Business", general:"General" },
          { rural:"Rural", urban:"Urban", semi:"Semi-Urban" }
        )}
      </div>

      <div class="section page-break">
        ${sectionHeader("📍", "State-wise User Distribution")}
        ${dataTable(
          ["#", "State", "Users", "% of Total", "Active This Week"],
          Object.entries(byState).sort((a,b) => b[1]-a[1]).map(([st, cnt], i) => {
            const activeInState = users.filter(u => u.state === st && u.lastSeen?.seconds && (now - u.lastSeen.seconds*1000) < 7*86400000).length;
            return [i+1, st, cnt, users.length ? Math.round(cnt/users.length*100)+"%" : "—", activeInState];
          }),
          ["20px","","40px","60px","80px"]
        )}
      </div>`;

    // ══════════════════════════════════════════════════════════════════
    // SECTION 3 — ALL USERS (Full Profile)
    // ══════════════════════════════════════════════════════════════════
    const uHeaders = [
      "#","Name","UID","Phone","Email","Account",
      "Gender","Age","Marital","State","Area",
      "Occupation","Income","Housing","Ration","Disability",
      "Children","Girl Child","Land","KCC","Education","Institution",
      "Joined","Last Seen",
    ];
    const uRows = users.map((u, i) => [
      i + 1,
      u.name        || "—",
      u.id          || "—",
      u.phone       ? `+91 ${u.phone}` : "—",
      u.email       || "—",
      u.photo       ? "Google" : "Guest",
      strip(GENDER_LABELS[u.gender]  || u.gender  || "—"),
      AGE_LABELS[u.age]              || u.age      || "—",
      strip(MARITAL_LABELS[u.marital]|| u.marital  || "—"),
      u.state       || "—",
      AREA_LABELS[u.area]            || u.area     || "—",
      OCC_LABELS[u.occupation]       || u.occupation|| "—",
      INC_LABELS[u.income]           || u.income   || "—",
      strip(HOUSE_LABELS[u.house]    || u.house    || "—"),
      strip(RATION_LABELS[u.ration]  || u.ration   || "—"),
      strip(DISAB_LABELS[u.disability]||u.disability||"—"),
      CHILDREN_LABELS[u.numChildren] || u.numChildren|| "—",
      u.numChildren && u.numChildren !== "0"
        ? (u.hasGirls === "yes" ? "Yes" : u.hasGirls === "no" ? "No" : "—")
        : "N/A",
      u.occupation === "farmer" ? (LAND_LABELS[u.landHolding] || u.landHolding || "—") : "N/A",
      u.occupation === "farmer" ? (strip(KISAN_LABELS[u.kisanCard] || u.kisanCard || "—")) : "N/A",
      u.occupation === "student" ? (EDUC_LABELS[u.educationLevel] || u.educationLevel || "—") : "N/A",
      u.occupation === "student" ? (strip(INST_LABELS[u.institutionType] || u.institutionType || "—")) : "N/A",
      formatDate(u.createdAt),
      formatDate(u.lastSeen),
    ]);

    const usersHTML = `
      <div class="section page-break">
        ${sectionHeader("👥", "Complete User Registry", users.length)}
        <div style="color:#4a4f6a;font-family:var(--mono);font-size:7.5px;margin-bottom:6px">All ${users.length} users · All profile fields · Sorted by registration order</div>
        ${dataTable(uHeaders, uRows)}
      </div>`;

    // ══════════════════════════════════════════════════════════════════
    // SECTION 4 — ACTIVITY
    // ══════════════════════════════════════════════════════════════════
    const recentActive  = [...users]
      .filter(u => u.lastSeen?.seconds)
      .sort((a, b) => (b.lastSeen.seconds||0) - (a.lastSeen.seconds||0))
      .slice(0, 30);
    const newWeekUsers  = users.filter(u => u.createdAt?.seconds && (now - u.createdAt.seconds*1000) < 7*86400000);
    const newMonthUsers = users.filter(u => u.createdAt?.seconds && (now - u.createdAt.seconds*1000) < 30*86400000);
    const dormant       = users.filter(u => u.lastSeen?.seconds && (now - u.lastSeen.seconds*1000) > 30*86400000);

    const activityHTML = `
      <div class="section page-break">
        ${sectionHeader("🕐", "Activity & Engagement")}
        <div class="three-col">
          ${summaryTable([
            ["🟢 Active Today",         activeToday],
            ["📅 Active This Week",     activeWeek],
            ["📆 Active This Month",    activeMonth],
          ], "#3dd68c")}
          ${summaryTable([
            ["🆕 Joined Today",         newToday],
            ["🆕 Joined This Week",     newThisWeek],
            ["🆕 Joined This Month",    newThisMonth],
          ], "#4f8ef7")}
          ${summaryTable([
            ["😴 Dormant (30+ days)",   dormant.length],
            ["📊 Engagement Rate",      users.length ? Math.round(activeWeek/users.length*100)+"%" : "—"],
            ["📈 Monthly Retention",    users.length ? Math.round(activeMonth/users.length*100)+"%" : "—"],
          ], "#a78bfa")}
        </div>

        <div class="sub-title" style="margin-top:10px">Recent Activity — Top 30 Most Recently Active Users</div>
        ${dataTable(
          ["#","Name","Phone","Email","State","Occupation","Income","Area","Joined","Last Seen"],
          recentActive.map((u, i) => [
            i+1,
            u.name || "—",
            u.phone ? `+91 ${u.phone}` : "—",
            u.email || "—",
            u.state || "—",
            OCC_LABELS[u.occupation] || u.occupation || "—",
            INC_LABELS[u.income]     || u.income     || "—",
            AREA_LABELS[u.area]      || u.area       || "—",
            formatDate(u.createdAt),
            formatDate(u.lastSeen),
          ])
        )}

        <div class="sub-title" style="margin-top:14px">🆕 Joined This Week <span class="badge">${newWeekUsers.length}</span></div>
        ${newWeekUsers.length === 0
          ? `<div style="color:#4a4f6a;padding:8px 0;font-size:7.5px;font-style:italic">No new users this week.</div>`
          : dataTable(
              ["#","Name","Phone","Email","State","Occupation","Area","Ration","Joined"],
              newWeekUsers.map((u, i) => [
                i+1,
                u.name || "—",
                u.phone ? `+91 ${u.phone}` : "—",
                u.email || "—",
                u.state || "—",
                OCC_LABELS[u.occupation] || u.occupation || "—",
                AREA_LABELS[u.area]      || u.area       || "—",
                strip(RATION_LABELS[u.ration] || u.ration || "—"),
                formatDate(u.createdAt),
              ])
            )
        }

        <div class="sub-title" style="margin-top:14px">😴 Dormant Users (30+ days inactive) <span class="badge">${dormant.length}</span></div>
        ${dormant.length === 0
          ? `<div style="color:#4a4f6a;padding:8px 0;font-size:7.5px;font-style:italic">No dormant users.</div>`
          : dataTable(
              ["#","Name","State","Occupation","Last Seen","Days Inactive"],
              dormant.slice(0,30).map((u, i) => [
                i+1,
                u.name || "—",
                u.state || "—",
                OCC_LABELS[u.occupation] || u.occupation || "—",
                formatDate(u.lastSeen),
                Math.floor((now - u.lastSeen.seconds*1000) / 86400000) + " days",
              ])
            )
        }
      </div>`;

    // ══════════════════════════════════════════════════════════════════
    // SECTION 5 — SCHEMES COVERAGE
    // ══════════════════════════════════════════════════════════════════
    const allSchemes  = Array.isArray(SCHEME_DB) ? SCHEME_DB : Object.values(SCHEME_DB || {});
    const centralCnt  = allSchemes.filter(s => s.scope === "national").length;
    const stSchCounts = {};
    allSchemes.forEach(s => {
      if (s.scope === "state" && s.state) stSchCounts[s.state] = (stSchCounts[s.state] || 0) + 1;
    });
    const stateList = Array.isArray(INDIA_STATES) ? INDIA_STATES : Object.values(INDIA_STATES || {});

    // Tier thresholds matching the UI (0 / ≤30 / ≤100 / >100)
    function schemeTier(n) {
      if (n === 0)    return "None";
      if (n <= 30)    return "Low";
      if (n <= 100)   return "Medium";
      return "Good";
    }
    const schemeRows = stateList
      .map(st => {
        const cnt  = stSchCounts[st] || 0;
        const tier = schemeTier(cnt);
        const userCnt = (byState[st] || 0);
        return [st, cnt, tier, userCnt,
          userCnt > 0 && cnt > 0 ? (cnt / userCnt).toFixed(1) : "—"];
      })
      .sort((a, b) => b[1] - a[1]);

    const tierSummary = {
      None:   stateList.filter(s => (stSchCounts[s]||0) === 0).length,
      Low:    stateList.filter(s => { const n=stSchCounts[s]||0; return n>0  && n<=30;  }).length,
      Medium: stateList.filter(s => { const n=stSchCounts[s]||0; return n>30 && n<=100; }).length,
      Good:   stateList.filter(s => (stSchCounts[s]||0) > 100).length,
    };

    const schemesHTML = `
      <div class="section page-break">
        ${sectionHeader("🗺️", "Schemes Coverage")}
        <div class="two-col">
          ${summaryTable([
            ["🇮🇳 Central / National Schemes",  centralCnt, ` (${allSchemes.length ? Math.round(centralCnt/allSchemes.length*100) : 0}% of total)`],
            ["📋 Total Schemes in DB",           allSchemes.length],
            ["✅ States with Schemes",            stateList.filter(s => stSchCounts[s]).length],
            ["🔴 States with 0 Schemes",         stateList.filter(s => !stSchCounts[s]).length],
          ], "#4f8ef7")}
          ${summaryTable([
            ["⬜ None (0 schemes)",   tierSummary.None,   " states"],
            ["🟡 Low (1–30)",         tierSummary.Low,    " states"],
            ["🔵 Medium (31–100)",    tierSummary.Medium, " states"],
            ["🟢 Good (100+)",        tierSummary.Good,   " states"],
          ], "#3dd68c")}
        </div>
        <div class="sub-title" style="margin-top:8px">State-wise Scheme Coverage (with User Cross-reference)</div>
        ${dataTable(
          ["#","State / UT","Scheme Count","Coverage Tier","Users Registered","Schemes per User"],
          schemeRows.map((r, i) => [i+1, ...r]),
          ["20px","","60px","60px","80px","80px"]
        )}
      </div>`;

    // ══════════════════════════════════════════════════════════════════
    // SECTION 6 — REPORTS (Full Detail)
    // ══════════════════════════════════════════════════════════════════
    const byRepType   = groupBy(reports, "type");
    const byRepStatus = groupBy(reports, "status");
    const avgReplyTime = (() => {
      const replied = reports.filter(r => r.repliedAt?.seconds && r.createdAt?.seconds);
      if (!replied.length) return "—";
      const avg = replied.reduce((s, r) => s + (r.repliedAt.seconds - r.createdAt.seconds), 0) / replied.length;
      const hrs = avg / 3600;
      return hrs < 24 ? `${Math.round(hrs)}h` : `${Math.round(hrs/24)}d`;
    })();

    const reportsHTML = `
      <div class="section page-break">
        ${sectionHeader("📬", "Reports / Queries — Full Detail", reports.length)}
        <div class="three-col">
          ${summaryTable([
            ["📬 Total Reports",    reports.length],
            ["🔴 Open",             openRep],
            ["🟡 In Progress",      inProgRep],
            ["✅ Resolved",          resolvedRep],
            ["🔁 Reopened",          reopenedRep],
          ], "#f87171")}
          ${summaryTable([
            ["💬 Admin Replied",    repliedRep],
            ["⚠️ Unreplied (open)", unrepliedOpen],
            ["⏱️ Avg Reply Time",   avgReplyTime],
          ], "#fbbf24")}
          ${summaryTable(
            Object.entries(byRepType).map(([k, v]) => [strip((TYPE_META[k]?.icon||"")+" "+(TYPE_META[k]?.label||k)), v]),
            "#a78bfa"
          )}
        </div>
        <div class="sub-title" style="margin-top:8px">All Reports — Full Message & Reply History</div>
        ${dataTable(
          ["#","User","Contact","Type","Status","Submitted","Message","Admin Reply","Reply History"],
          reports.map((r, i) => {
            const replyCount = r.replyHistory?.length || 0;
            const lastReply  = r.replyHistory?.[replyCount-1];
            return [
              i+1,
              r.userName    || r.userEmail || "—",
              r.userPhone   ? `+91 ${r.userPhone}` : r.userEmail || "—",
              strip((TYPE_META[r.type]?.icon||"")+" "+(TYPE_META[r.type]?.label||r.type||"—")),
              strip((STATUS_META[r.status]?.icon||"")+" "+(STATUS_META[r.status]?.label||r.status||"—")),
              formatDate(r.createdAt),
              (r.message || "—").slice(0, 200) + ((r.message||"").length > 200 ? "…" : ""),
              r.adminReply
                ? r.adminReply.slice(0, 150) + (r.adminReply.length > 150 ? "…" : "") + ` (${formatDate(r.repliedAt)})`
                : "—",
              replyCount > 0
                ? `${replyCount} exchange${replyCount!==1?"s":""}; last: ${formatDate(lastReply?.sentAt)}`
                : "—",
            ];
          })
        )}
      </div>`;

    // ══════════════════════════════════════════════════════════════════
    // ASSEMBLE
    // ══════════════════════════════════════════════════════════════════
    // ── Build the section list label for the cover header ──────────────────
    const includedLabels = [
      s.has("overview")  && "Overview",
      s.has("analytics") && "Demographics & Analytics",
      s.has("users")     && "User Registry",
      s.has("activity")  && "Activity",
      s.has("schemes")   && "Schemes Coverage",
      s.has("reports")   && "Reports",
    ].filter(Boolean).join(" · ");

    const exportId = `YS-${isoDate.replace(/-/g,"")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>YojanaSahay — Intelligence Report ${isoDate}</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg:       #08090d;
      --surface:  #0e1016;
      --card:     #13151f;
      --card2:    #191c28;
      --border:   #1f2235;
      --border2:  #252840;
      --text:     #eef0f8;
      --textMid:  #8b90b0;
      --textSub:  #4a4f6a;
      --accent1:  #4f8ef7;   /* electric blue */
      --accent2:  #f7824f;   /* saffron glow  */
      --accent3:  #3dd68c;   /* green signal  */
      --accent4:  #a78bfa;   /* violet        */
      --accent5:  #f472b6;   /* pink          */
      --red:      #f87171;
      --amber:    #fbbf24;
      --mono:     'JetBrains Mono', monospace;
      --head:     'Syne', sans-serif;
      --body:     'DM Sans', sans-serif;
    }

    * { margin:0; padding:0; box-sizing:border-box; }

    body {
      font-family: var(--body);
      font-size: 8.5px;
      color: var(--text);
      background: var(--bg);
      padding: 18px 20px;
    }

    /* ────────────────────────────────────────────────
       COVER HEADER
    ──────────────────────────────────────────────── */
    .cover {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border2);
      position: relative;
    }
    .cover::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0;
      width: 120px; height: 2px;
      background: linear-gradient(90deg, var(--accent1), var(--accent2));
    }
    .brand {
      font-family: var(--head);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -1px;
      color: var(--text);
      line-height: 1;
    }
    .brand-accent { color: var(--accent2); }
    .brand-sub {
      font-family: var(--mono);
      font-size: 7px;
      color: var(--textSub);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .cover-meta {
      text-align: right;
      font-family: var(--mono);
      font-size: 7.5px;
      color: var(--textMid);
      line-height: 2;
    }
    .cover-meta .export-id {
      font-size: 9px;
      font-weight: 700;
      color: var(--accent1);
      letter-spacing: 1px;
    }
    .cover-meta .confidential {
      display: inline-block;
      background: rgba(248,113,113,0.12);
      border: 1px solid rgba(248,113,113,0.3);
      color: var(--red);
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .sections-pill {
      display: inline-block;
      background: rgba(79,142,247,0.1);
      border: 1px solid rgba(79,142,247,0.2);
      color: var(--accent1);
      font-size: 7px;
      padding: 2px 8px;
      border-radius: 3px;
      letter-spacing: 0.5px;
      margin-top: 3px;
    }

    /* ────────────────────────────────────────────────
       SECTIONS
    ──────────────────────────────────────────────── */
    .section { margin-bottom: 22px; }

    .section-title {
      font-family: var(--head);
      font-size: 10.5px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: 0.2px;
      margin-bottom: 10px;
      padding: 7px 10px 7px 12px;
      background: var(--card);
      border: 1px solid var(--border2);
      border-left: 3px solid var(--accent1);
      border-radius: 0 5px 5px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title .s-icon {
      font-size: 11px;
      opacity: 0.85;
    }

    .sub-title {
      font-family: var(--mono);
      font-size: 7.5px;
      font-weight: 700;
      color: var(--accent1);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin: 10px 0 6px;
      padding-left: 1px;
    }

    .badge {
      display: inline-block;
      background: rgba(79,142,247,0.15);
      border: 1px solid rgba(79,142,247,0.3);
      color: var(--accent1);
      font-family: var(--mono);
      font-size: 7px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      margin-left: 6px;
      vertical-align: middle;
      letter-spacing: 0.5px;
    }

    /* ────────────────────────────────────────────────
       GRID LAYOUTS
    ──────────────────────────────────────────────── */
    .two-col   { display:flex; gap:10px; margin-bottom:10px; }
    .two-col > * { flex:1; min-width:0; }
    .three-col { display:flex; gap:8px; margin-bottom:10px; }
    .three-col > * { flex:1; min-width:0; }

    /* ────────────────────────────────────────────────
       STAT CARDS (inline summary blocks)
    ──────────────────────────────────────────────── */
    .card {
      background: var(--card);
      border: 1px solid var(--border2);
      border-radius: 6px;
      padding: 8px 10px;
      min-width: 0;
    }

    /* ────────────────────────────────────────────────
       SUMMARY TABLE
    ──────────────────────────────────────────────── */
    .sum-tbl { width:100%; border-collapse:collapse; }
    .sum-key {
      font-size: 7.5px;
      color: var(--textMid);
      padding: 3.5px 6px;
      border-bottom: 1px solid var(--border);
      font-family: var(--body);
    }
    .sum-val {
      font-family: var(--mono);
      font-size: 9px;
      font-weight: 700;
      padding: 3.5px 6px;
      border-bottom: 1px solid var(--border);
      text-align: right;
      white-space: nowrap;
    }
    .sum-sub {
      font-size: 6.5px;
      font-weight: 400;
      color: var(--textSub);
      margin-left: 4px;
    }

    /* ────────────────────────────────────────────────
       DATA TABLES
    ──────────────────────────────────────────────── */
    table { width:100%; border-collapse:collapse; margin-bottom:8px; }
    thead tr {
      background: var(--card2);
      border-bottom: 1px solid var(--accent1);
    }
    th {
      font-family: var(--mono);
      font-size: 7px;
      font-weight: 700;
      color: var(--accent1);
      padding: 5px 5px;
      text-align: left;
      white-space: nowrap;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border2);
    }
    td {
      padding: 4px 5px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      word-break: break-word;
      font-size: 7.5px;
      line-height: 1.5;
      color: var(--textMid);
    }
    tr.even { background: var(--surface); }
    tr.odd  { background: var(--card); }
    td:first-child {
      font-family: var(--mono);
      font-size: 7px;
      color: var(--textSub);
    }

    /* ────────────────────────────────────────────────
       BREAKDOWN BLOCK (bar charts)
    ──────────────────────────────────────────────── */
    .breakdown {
      background: var(--card);
      border: 1px solid var(--border2);
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 0;
    }
    .bd-title {
      font-family: var(--mono);
      font-size: 7.5px;
      font-weight: 700;
      color: var(--textMid);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .bd-total { font-size: 7px; font-weight: 400; color: var(--textSub); margin-left: 4px; }
    .breakdown table { margin-bottom: 0; }
    .breakdown th {
      background: transparent;
      border-bottom: 1px solid var(--border);
      color: var(--textSub);
      font-size: 6.5px;
    }
    .breakdown td { font-size: 7.5px; color: var(--textMid); }
    .breakdown tr.even { background: transparent; }
    .breakdown tr.odd  { background: rgba(255,255,255,0.015); }

    /* SVG bar */
    .bar-track {
      display: inline-block;
      width: 72px;
      height: 6px;
      background: var(--border2);
      border-radius: 3px;
      vertical-align: middle;
      position: relative;
      overflow: hidden;
    }
    .bar-fill {
      display: inline-block;
      height: 6px;
      border-radius: 3px;
      vertical-align: middle;
    }

    /* ────────────────────────────────────────────────
       INFO BAR
    ──────────────────────────────────────────────── */
    .info-bar {
      background: rgba(79,142,247,0.06);
      border: 1px solid rgba(79,142,247,0.15);
      border-radius: 6px;
      padding: 7px 12px;
      font-family: var(--mono);
      font-size: 7.5px;
      color: var(--textMid);
      margin-top: 8px;
      line-height: 2;
    }
    .info-bar strong { color: var(--accent3); font-weight: 700; }

    /* ────────────────────────────────────────────────
       FOOTER
    ──────────────────────────────────────────────── */
    .footer {
      margin-top: 18px;
      font-family: var(--mono);
      font-size: 7px;
      color: var(--textSub);
      text-align: center;
      border-top: 1px solid var(--border);
      padding-top: 8px;
      letter-spacing: 0.5px;
    }

    /* ────────────────────────────────────────────────
       PAGE NUMBERS via CSS counters
    ──────────────────────────────────────────────── */
    @page {
      size: A4 landscape;
      margin: 12mm 10mm 14mm 10mm;

      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'JetBrains Mono', monospace;
        font-size: 7pt;
        color: #4a4f6a;
      }
      @bottom-left {
        content: "YojanaSahay · Confidential";
        font-family: 'JetBrains Mono', monospace;
        font-size: 7pt;
        color: #252840;
      }
      @bottom-center {
        content: "${exportId}";
        font-family: 'JetBrains Mono', monospace;
        font-size: 7pt;
        color: #252840;
      }
    }

    /* CSS-counter page numbers shown in the static footer bar */
    body {
      counter-reset: pagenum;
    }
    .page-break {
      counter-increment: pagenum;
    }

    /* Printed page-number strip */
    .pg-footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 20px;
      border-top: 1px solid var(--border2);
      background: var(--bg);
      font-family: var(--mono);
      font-size: 7px;
      color: var(--textSub);
      letter-spacing: 0.5px;
    }
    .pg-footer .pg-brand { color: var(--accent1); font-weight: 700; }
    .pg-footer .pg-id    { color: var(--textSub); }
    .pg-footer .pg-num   { color: var(--textMid); }

    /* ────────────────────────────────────────────────
       PRINT
    ──────────────────────────────────────────────── */
    @media print {
      body {
        background: #08090d !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
        padding: 8px 10px 22px 10px;
        font-size: 7.5px;
      }
      .page-break { page-break-before: always; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      .cover::after { -webkit-print-color-adjust: exact; }
      .pg-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════════════════
       COVER HEADER
  ═══════════════════════════════════════════ -->
  <div class="cover">
    <div>
      <div class="brand">Yojana<span class="brand-accent">Sahay</span></div>
      <div class="brand-sub">Admin Intelligence Report &nbsp;/&nbsp; Confidential</div>
      <div class="sections-pill">${includedLabels || "—"}</div>
    </div>
    <div class="cover-meta">
      <div class="export-id">${exportId}</div>
      <div>Generated &nbsp;<strong style="color:var(--text)">${dateStr}</strong>&nbsp; at &nbsp;<strong style="color:var(--text)">${timeStr}</strong></div>
      <div>
        <strong style="color:var(--text)">${users.length}</strong> Users &nbsp;·&nbsp;
        <strong style="color:var(--text)">${reports.length}</strong> Reports
      </div>
      <div class="confidential">Confidential — Do Not Share</div>
    </div>
  </div>

  ${s.has("overview")  ? overviewHTML  : ""}
  ${s.has("analytics") ? analyticsHTML : ""}
  ${s.has("users")     ? usersHTML     : ""}
  ${s.has("activity")  ? activityHTML  : ""}
  ${s.has("schemes")   ? schemesHTML   : ""}
  ${s.has("reports")   ? reportsHTML   : ""}

  <!-- ═══════════════════════════════════════════
       FIXED PAGE-NUMBER FOOTER
  ═══════════════════════════════════════════ -->
  <div class="pg-footer">
    <span class="pg-brand">YojanaSahay</span>
    <span class="pg-id">${exportId}</span>
    <span class="pg-num" id="pg-label">Page 1</span>
  </div>

  <div class="footer">
    YojanaSahay Admin Dashboard &nbsp;·&nbsp; ${exportId} &nbsp;·&nbsp;
    ${dateStr} ${timeStr} &nbsp;·&nbsp;
    ${users.length} users &nbsp;/&nbsp; ${reports.length} reports &nbsp;/&nbsp; ${allSchemes.length} schemes &nbsp;·&nbsp;
    Confidential — For Authorised Admin Use Only
  </div>

  <script>
    // Inject real page numbers via browser's beforeprint
    var totalPages = document.querySelectorAll('.page-break').length + 1;

    // Update footer label before print dialog opens
    window.addEventListener('beforeprint', function() {
      var lbl = document.getElementById('pg-label');
      if (lbl) lbl.textContent = 'Page 1 of ' + totalPages;
    });

    // Auto-open print
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`;

    const blob = new Blob([html], { type:"text/html;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `yojanasahay_admin_report_${isoDate}.html`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }, [users, reports]);

  // ── Export steps definition — only steps relevant to selected sections ──────
  const EXPORT_STEPS = useMemo(() => {
    const steps = [
      { label: "Initializing export engine", dur: 300 },
    ];
    if (exportSections.has("overview"))
      steps.push({ label: "Building overview & welfare metrics", dur: 420 });
    if (exportSections.has("analytics")) {
      steps.push({ label: `Collecting ${users.length} full user profiles`, dur: 480 });
      steps.push({ label: "Computing demographics & 8 breakdowns", dur: 560 });
      steps.push({ label: "Generating farmer & student analytics", dur: 400 });
      steps.push({ label: "Building cross-tab matrices", dur: 460 });
    }
    if (exportSections.has("users"))
      steps.push({ label: "Rendering 24-column user registry table", dur: 720 });
    if (exportSections.has("activity"))
      steps.push({ label: "Compiling activity, dormancy & retention data", dur: 440 });
    if (exportSections.has("schemes"))
      steps.push({ label: "Processing schemes coverage & user cross-reference", dur: 500 });
    if (exportSections.has("reports"))
      steps.push({ label: `Formatting ${reports.length} report${reports.length !== 1 ? "s" : ""} with reply history`, dur: 540 });
    steps.push({ label: "Assembling HTML layout & print styles", dur: 780 });
    steps.push({ label: "Finalizing & packaging document", dur: 520 });
    return steps;
  }, [exportSections, users.length, reports.length]);

  // ── Animated export handler ────────────────────────────────────────────────
  const handleExportAll = useCallback(async () => {
    setExportModal(true);
    setExportStep(-1);
    setExportDone(false);

    for (let i = 0; i < EXPORT_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, EXPORT_STEPS[i].dur));
      setExportStep(i);
    }

    await new Promise(r => setTimeout(r, 380));
    setExportDone(true);
    await new Promise(r => setTimeout(r, 1100));
    setExportModal(false);
    await new Promise(r => setTimeout(r, 80));
    exportAllPDF(exportSections);

    // Reset state after a short delay
    setTimeout(() => { setExportStep(-1); setExportDone(false); }, 600);
  }, [EXPORT_STEPS, exportAllPDF, exportSections]);

  // ─────────────────────────────────────────────────────────────────────────
  const ALL_TABS = [
    ["overview",  "Overview"],
    ["users",     "Users"],
    ["analytics", "Analytics"],
    ["activity",  "Activity"],
    ["usage",     "Usage"],
    ["schemes",   "Schemes"],
    ["reports",   "Reports"],
    ["cleanup",   "Cleanup"],
    ["verify",    "Verify"],
    ["agents",    "Agents"],
    ["news",      "News"],
    ["faq",       "FAQ Feedback"],
    ["export",    "Export"],
  ];
  // allowedTabs=null means full admin (show all). Array means restricted — filter to those tabs only.
  const TABS = allowedTabs === null
    ? ALL_TABS
    : ALL_TABS.filter(([id]) => allowedTabs.includes(id));

  // ── navigateTab — direction-aware, animated tab change ───────────────────
  const navigateTab = useCallback((targetId) => {
    if (targetId === activeSection) return;
    // "home" lives at index 0, all TABS follow — use unified index for direction
    const tabIds  = TABS.map(([id]) => id);
    const allIds  = ["home", ...tabIds];
    const currIdx = allIds.indexOf(activeSection);
    const nextIdx = allIds.indexOf(targetId);
    if (nextIdx === -1 || nextIdx === currIdx) return;
    const goFwd = nextIdx > currIdx;

    // Phase 1 — slide current content out
    setTabTransition(goFwd ? "fwd-out" : "bwd-out");

    setTimeout(() => {
      // Phase 2 — swap content + set incoming start offset (no CSS transition yet)
      setActiveSection(targetId);
      setTabTransition(goFwd ? "fwd-in" : "bwd-in");

      // Phase 3 — after browser paints phase 2, animate incoming to rest
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTabTransition(null);
        });
      });
    }, 155);
  }, [activeSection]);

  // Keyboard ← → navigation
  useEffect(() => {
    const tabIds = TABS.map(([id]) => id);
    const handler = (e) => {
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") {
        if (activeSection === "home") { navigateTab(tabIds[0]); return; }
        const curr = tabIds.indexOf(activeSection);
        if (curr < tabIds.length - 1) navigateTab(tabIds[curr + 1]);
      } else if (e.key === "ArrowLeft") {
        if (activeSection === "home") return;
        const curr = tabIds.indexOf(activeSection);
        if (curr === 0) { navigateTab("home"); return; }
        if (curr > 0) navigateTab(tabIds[curr - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeSection, navigateTab]);

  // Auto-scroll tab bar to keep active tab centred
  useEffect(() => {
    if (!tabsBarRef.current) return;
    const bar    = tabsBarRef.current;
    const active = bar.querySelector("[data-active='true']");
    if (!active) return;
    const barRect    = bar.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const offset     = activeRect.left - barRect.left - (barRect.width / 2) + (activeRect.width / 2);
    bar.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeSection]);

  return (
    <div data-admin-scroll="true" style={{
      position:"fixed", inset:0, zIndex:9999,
      background:th.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'Noto Sans',sans-serif",
      overflowY:"auto",
    }}>

      {/* ── HEADER ── */}
      <style>{`
        .ys-input::placeholder{color:#888;opacity:1}
        @keyframes ys-spin{to{transform:rotate(360deg)}}
        @keyframes ys-pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.78)}}
        @keyframes ys-scan{0%{transform:translateX(-100%)}100%{transform:translateX(600%)}}
        @keyframes ys-badge-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes exp-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(1500%)}}
        .ys-ctrl-btn:active{background:rgba(255,255,255,0.09)!important}
        .ys-back-btn:hover{background:rgba(255,255,255,0.16)!important}
        [data-active="false"]:hover{color:rgba(255,255,255,0.82)!important;border-bottom-color:rgba(255,153,51,0.4)!important}
      `}</style>

      {/* ── Outer header shell with dot-grid texture ── */}
      <div style={{
        background:`
          radial-gradient(ellipse 55% 90% at 12% 50%, rgba(255,153,51,0.09) 0%, transparent 60%),
          radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(160deg, #020c20 0%, #001f5c 50%, #020c20 100%)
        `,
        backgroundSize:"100% 100%, 28px 28px, 100% 100%",
        flexShrink:0,
        boxShadow:"0 6px 36px rgba(0,0,0,0.52)",
        position:"sticky", top:0, zIndex:10,
        overflow:"hidden",
      }}>

        {/* Animated scan line — subtle ambient glow sweep */}
        <div style={{
          position:"absolute", top:0, left:0, bottom:0,
          width:"18%", pointerEvents:"none", zIndex:0,
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.025),transparent)",
          animation:"ys-scan 7s linear infinite",
        }}/>

        {/* Bottom accent hairline */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg, transparent 0%, ${SAFFRON}70 20%, rgba(0,53,128,0.55) 65%, transparent 100%)`,
          zIndex:2, pointerEvents:"none",
        }}/>

        {/* ══ DESKTOP — single compact row ══ */}
        {isDesktop && (
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"13px 40px",
            maxWidth:1400, margin:"0 auto",
            position:"relative", zIndex:1,
          }}>

            {/* Back */}
            <div onClick={onClose} className="ys-back-btn" style={{
              width:32, height:32, borderRadius:9, flexShrink:0,
              background:"rgba(255,255,255,0.09)",
              border:"1px solid rgba(255,255,255,0.16)",
              backdropFilter:"blur(10px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", transition:"background 0.15s",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,0.10)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </div>

            {/* Title */}
            <div style={{ display:"flex", flexDirection:"column", gap:2, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" style={{ flexShrink:0 }}>
                  <path d="M9 1L1 4.5V9C1 13.4 4.4 17.5 9 19C13.6 17.5 17 13.4 17 9V4.5L9 1Z"
                    stroke={SAFFRON} strokeWidth="1.5" fill="rgba(255,153,51,0.10)"/>
                  <path d="M6 10L8 12L12 8" stroke={SAFFRON} strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <span style={{
                    fontFamily:"'JetBrains Mono','SF Mono',monospace",
                    fontSize:8, color:SAFFRON, letterSpacing:1.4, opacity:0.9,
                  }}>YS-ADMIN // </span>
                  <span style={{
                    color:"#fff", fontSize:15, fontWeight:800,
                    letterSpacing:0.2, lineHeight:1, whiteSpace:"nowrap",
                  }}>Control Centre</span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{
                  fontFamily:"'JetBrains Mono','SF Mono',monospace",
                  fontSize:8, letterSpacing:0.9, textTransform:"uppercase",
                  background:"linear-gradient(90deg, rgba(0,53,128,0.18) 0%, rgba(0,53,128,0.38) 50%, rgba(0,53,128,0.18) 100%)",
                  backgroundSize:"200% auto",
                  animation:"ys-badge-shimmer 4s linear infinite",
                  color:"rgba(255,255,255,0.38)",
                  border:"1px solid rgba(0,53,128,0.35)",
                  borderRadius:4, padding:"1px 5px",
                }}>v{ADMIN_BUILD_VERSION} · {ADMIN_BUILD_ENV}</span>
                <span style={{ width:2, height:2, borderRadius:"50%", background:SAFFRON, opacity:0.4, flexShrink:0 }}/>
                <span style={{ fontFamily:"'JetBrains Mono','SF Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.38)" }}>
                  {loading ? "SYNCING…" : `${users.length} USERS · ${SCHEME_DB.length} SCHEMES`}
                </span>
                {!loading && latencyMs && (
                  <>
                    <span style={{ width:2, height:2, borderRadius:"50%", background:"rgba(255,255,255,0.2)", flexShrink:0 }}/>
                    <span
                      key={latencyMs}
                      style={{
                        fontFamily:"'JetBrains Mono','SF Mono',monospace", fontSize:8,
                        color: latencyColorFor(latencyMs),
                        textShadow: `0 0 7px ${latencyColorFor(latencyMs)}77`,
                        transition: "color 0.5s ease, text-shadow 0.5s ease",
                        animation: "hs-latency-flash 0.5s ease",
                        fontWeight:700, display:"inline-block",
                      }}
                    >{latencyMs}ms</span>
                  </>
                )}
              </div>
            </div>

            {/* Hairline vertical divider */}
            <div style={{
              width:1, height:32, background:"rgba(255,255,255,0.10)",
              flexShrink:0, marginLeft:6, marginRight:2,
            }}/>

            {/* Identity chip — fixed width, no flex stretch */}
            {sessionUser && (() => {
              const uid         = sessionUser.uid || "";
              const maskedUid   = uid.length >= 8 ? `${uid.slice(0,4)}…${uid.slice(-4)}` : uid;
              const isFullAdmin = allowedTabs === null;
              const dispName    = sessionUser.displayName?.split(" ")?.[0]
                               || sessionUser.email?.split("@")?.[0] || "Admin";
              const photoURL    = sessionUser.photoURL || null;
              const initial     = dispName.charAt(0).toUpperCase();
              return (
                <div style={{
                  display:"flex", alignItems:"center", gap:8,
                  background:"rgba(0,0,0,0.26)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  borderTop:"1px solid rgba(255,255,255,0.18)",
                  borderRadius:10, padding:"6px 11px 6px 6px",
                  backdropFilter:"blur(16px)",
                  flexShrink:0,
                  width:220,
                  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.2)",
                }}>
                  {photoURL ? (
                    <img src={photoURL} alt={initial} referrerPolicy="no-referrer" style={{
                      width:28, height:28, borderRadius:7, objectFit:"cover", flexShrink:0,
                      border:"1.5px solid rgba(255,255,255,0.20)",
                    }}/>
                  ) : (
                    <div style={{
                      width:28, height:28, borderRadius:7, flexShrink:0,
                      background: isFullAdmin ? `linear-gradient(145deg,${SAFFRON},#c55a00)` : `linear-gradient(145deg,${IND_GREEN},#085e04)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, fontWeight:900, color:"#fff",
                      boxShadow: isFullAdmin ? "0 2px 8px rgba(255,153,51,0.38)" : "0 2px 8px rgba(19,136,8,0.38)",
                    }}>{initial}</div>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{
                        fontFamily:"'JetBrains Mono','SF Mono',monospace",
                        fontSize:10.5, fontWeight:800, color:"rgba(255,255,255,0.94)",
                        letterSpacing:0.5, textTransform:"uppercase",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>{dispName}</span>
                      <span style={{
                        fontFamily:"'JetBrains Mono','SF Mono',monospace",
                        fontSize:6.5, fontWeight:700, letterSpacing:0.9,
                        color: isFullAdmin ? SAFFRON : IND_GREEN,
                        background: isFullAdmin ? "rgba(255,153,51,0.13)" : "rgba(19,136,8,0.13)",
                        border:`1px solid ${isFullAdmin ? SAFFRON : IND_GREEN}30`,
                        borderRadius:4, padding:"1.5px 4px", flexShrink:0,
                      }}>{isFullAdmin ? "ADMIN" : "AGENT"}</span>
                    </div>
                    <div style={{
                      fontFamily:"'JetBrains Mono','SF Mono',monospace",
                      fontSize:7, color:"rgba(255,255,255,0.28)", letterSpacing:0.4, marginTop:2,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      display:"flex", alignItems:"center", gap:4,
                    }}>
                      <span>SESSION {fmtSession(sessionSecs)}</span>
                      <span style={{ width:1, height:7, background:"rgba(255,255,255,0.13)", flexShrink:0 }}/>
                      <span style={{
                        color: error ? "#ef4444" : "#22c55e",
                        fontSize:6, letterSpacing:0.9, fontWeight:700,
                      }}>{error ? "ERR" : "SYS OK"}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
                    <div style={{
                      width:6, height:6, borderRadius:"50%", background:"#22c55e",
                      boxShadow:"0 0 5px rgba(34,197,94,0.85)",
                      animation:"ys-pulse-dot 2.2s ease-in-out infinite",
                    }}/>
                    <span style={{
                      fontFamily:"'JetBrains Mono','SF Mono',monospace",
                      fontSize:6, color:"rgba(255,255,255,0.24)", letterSpacing:0.7,
                    }}>LIVE</span>
                  </div>
                </div>
              );
            })()}

            {/* Spacer pushes remaining right */}
            <div style={{ flex:1 }}/>

            {/* Tab navigator pill */}
            {(() => {
              const tabIds = TABS.map(([id]) => id);
              const curr   = tabIds.indexOf(activeSection);
              return (
                <div style={{
                  display:"flex", alignItems:"center", gap:1,
                  background:"rgba(255,255,255,0.11)",
                  border:"1px solid rgba(255,255,255,0.20)",
                  borderRadius:20, padding:"5px 8px",
                  backdropFilter:"blur(10px)",
                  flexShrink:0,
                  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.10)",
                }}>
                  <span onClick={(e) => { e.stopPropagation(); if(activeSection==="home") return; const c2=tabIds.indexOf(activeSection); if(c2===0){navigateTab("home");return;} if(c2>0)navigateTab(tabIds[c2-1]); }}
                    style={{ fontSize:15,color:"rgba(255,255,255,0.65)",cursor:"pointer",lineHeight:1,padding:"0 3px",opacity:activeSection!=="home"?1:0.2,userSelect:"none" }}>‹</span>
                  <span style={{ fontSize:10,fontWeight:800,color:"#fff",letterSpacing:0.2,whiteSpace:"nowrap",minWidth:56,textAlign:"center",padding:"0 2px",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                    {TAB_ICONS[activeSection === "home" ? "home" : activeSection]?.("rgba(255,255,255,0.9)", 10)}
                    {activeSection==="home" ? "Home" : (TABS.find(([id])=>id===activeSection)?.[1]||"")}
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); if(activeSection==="home"){navigateTab(tabIds[0]);return;} const c2=tabIds.indexOf(activeSection); if(c2<tabIds.length-1)navigateTab(tabIds[c2+1]); }}
                    style={{ fontSize:15,color:"rgba(255,255,255,0.65)",cursor:"pointer",lineHeight:1,padding:"0 3px",opacity:(activeSection==="home"||(curr!==-1&&curr<tabIds.length-1))?1:0.2,userSelect:"none" }}>›</span>
                </div>
              );
            })()}

            {/* Controls pill */}
            <div style={{
              display:"flex", alignItems:"center",
              background:"rgba(0,0,0,0.30)",
              border:"1px solid rgba(255,255,255,0.10)",
              borderTop:"1px solid rgba(255,255,255,0.17)",
              borderRadius:10, overflow:"hidden",
              backdropFilter:"blur(16px)",
              boxShadow:"inset 0 1px 0 rgba(255,255,255,0.05)",
              flexShrink:0,
            }}>
              <div className="ys-ctrl-btn" onClick={toggleDark}
                style={{ padding:"7px 11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRight:"1px solid rgba(255,255,255,0.09)",transition:"background 0.15s" }}>
                {dark ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </div>
              <div className="ys-ctrl-btn" onClick={() => { fetchUsers(true); fetchReports(); fetchUsage(); }}
                style={{ padding:"7px 11px",cursor:"pointer",opacity:refreshing?0.4:1,transition:"opacity 0.2s,background 0.15s",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.78)" strokeWidth="2.3"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation:refreshing?"ys-spin 0.75s linear infinite":"none" }}>
                  <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ══ MOBILE — two stacked rows ══ */}
        {!isDesktop && (
          <div style={{ position:"relative", zIndex:1 }}>

            {/* Mobile Row 1: Back · Title · Controls */}
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px 10px" }}>

              {/* Back */}
              <div onClick={onClose} className="ys-back-btn" style={{
                width:32, height:32, borderRadius:9, flexShrink:0,
                background:"rgba(255,255,255,0.09)",
                border:"1px solid rgba(255,255,255,0.16)",
                backdropFilter:"blur(10px)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", transition:"background 0.15s",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.10)",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </div>

              {/* Title */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="15" height="17" viewBox="0 0 18 20" fill="none" style={{ flexShrink:0 }}>
                    <path d="M9 1L1 4.5V9C1 13.4 4.4 17.5 9 19C13.6 17.5 17 13.4 17 9V4.5L9 1Z"
                      stroke={SAFFRON} strokeWidth="1.5" fill="rgba(255,153,51,0.10)"/>
                    <path d="M6 10L8 12L12 8" stroke={SAFFRON} strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <span style={{
                      fontFamily:"'JetBrains Mono','SF Mono',monospace",
                      fontSize:7, color:SAFFRON, letterSpacing:1.2, opacity:0.9,
                    }}>YS-ADMIN // </span>
                    <span style={{ color:"#fff", fontSize:14, fontWeight:800, letterSpacing:0.1, lineHeight:1 }}>
                      Control Centre
                    </span>
                  </div>
                </div>
                <div style={{ marginTop:3, display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{
                    fontFamily:"'JetBrains Mono','SF Mono',monospace",
                    fontSize:8, letterSpacing:0.9, textTransform:"uppercase",
                    background:"linear-gradient(90deg, rgba(0,53,128,0.18) 0%, rgba(0,53,128,0.38) 50%, rgba(0,53,128,0.18) 100%)",
                    backgroundSize:"200% auto",
                    animation:"ys-badge-shimmer 4s linear infinite",
                    color:"rgba(255,255,255,0.38)",
                    border:"1px solid rgba(0,53,128,0.35)",
                    borderRadius:4, padding:"1px 5px",
                  }}>v{ADMIN_BUILD_VERSION} · {ADMIN_BUILD_ENV}</span>
                  <span style={{ width:2, height:2, borderRadius:"50%", background:SAFFRON, opacity:0.4 }}/>
                  <span style={{ fontFamily:"'JetBrains Mono','SF Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.38)" }}>
                    {loading ? "SYNCING…" : `${users.length} USERS`}
                  </span>
                  {!loading && latencyMs && (
                    <>
                      <span style={{ width:2, height:2, borderRadius:"50%", background:"rgba(255,255,255,0.2)", flexShrink:0 }}/>
                      <span
                        key={latencyMs}
                        style={{
                          fontFamily:"'JetBrains Mono','SF Mono',monospace", fontSize:8,
                          color: latencyColorFor(latencyMs),
                          textShadow: `0 0 7px ${latencyColorFor(latencyMs)}77`,
                          transition: "color 0.5s ease, text-shadow 0.5s ease",
                          animation: "hs-latency-flash 0.5s ease",
                          fontWeight:700, display:"inline-block",
                        }}
                      >{latencyMs}ms</span>
                    </>
                  )}
                </div>
              </div>

              {/* Controls pill */}
              <div style={{
                display:"flex", alignItems:"center",
                background:"rgba(0,0,0,0.30)",
                border:"1px solid rgba(255,255,255,0.10)",
                borderTop:"1px solid rgba(255,255,255,0.17)",
                borderRadius:10, overflow:"hidden",
                backdropFilter:"blur(16px)",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.05)",
                flexShrink:0,
              }}>
                <div className="ys-ctrl-btn" onClick={toggleDark}
                  style={{ padding:"7px 11px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRight:"1px solid rgba(255,255,255,0.09)",transition:"background 0.15s" }}>
                  {dark ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </div>
                <div className="ys-ctrl-btn" onClick={() => { fetchUsers(true); fetchReports(); fetchUsage(); }}
                  style={{ padding:"7px 11px",cursor:"pointer",opacity:refreshing?0.4:1,transition:"opacity 0.2s,background 0.15s",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,255,255,0.78)" strokeWidth="2.3"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation:refreshing?"ys-spin 0.75s linear infinite":"none" }}>
                    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Mobile Row 2: Identity chip + Tab navigator */}
            {sessionUser && (() => {
              const uid         = sessionUser.uid || "";
              const maskedUid   = uid.length >= 8 ? `${uid.slice(0,4)}…${uid.slice(-4)}` : uid;
              const isFullAdmin = allowedTabs === null;
              const dispName    = sessionUser.displayName?.split(" ")?.[0]
                               || sessionUser.email?.split("@")?.[0] || "Admin";
              const photoURL    = sessionUser.photoURL || null;
              const initial     = dispName.charAt(0).toUpperCase();
              const tabIds      = TABS.map(([id]) => id);
              const curr        = tabIds.indexOf(activeSection);
              return (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 16px 11px" }}>

                  {/* Identity chip */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:8,
                    background:"rgba(0,0,0,0.26)",
                    border:"1px solid rgba(255,255,255,0.09)",
                    borderTop:"1px solid rgba(255,255,255,0.18)",
                    borderRadius:11, padding:"7px 11px 7px 7px",
                    backdropFilter:"blur(16px)",
                    flex:1, minWidth:0,
                    boxShadow:"inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.2)",
                  }}>
                    {photoURL ? (
                      <img src={photoURL} alt={initial} referrerPolicy="no-referrer" style={{
                        width:30, height:30, borderRadius:8, objectFit:"cover", flexShrink:0,
                        border:"1.5px solid rgba(255,255,255,0.20)",
                        boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
                      }}/>
                    ) : (
                      <div style={{
                        width:30, height:30, borderRadius:8, flexShrink:0,
                        background: isFullAdmin ? `linear-gradient(145deg,${SAFFRON},#c55a00)` : `linear-gradient(145deg,${IND_GREEN},#085e04)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:12, fontWeight:900, color:"#fff",
                        boxShadow: isFullAdmin ? "0 2px 8px rgba(255,153,51,0.38)" : "0 2px 8px rgba(19,136,8,0.38)",
                      }}>{initial}</div>
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{
                          fontFamily:"'JetBrains Mono','SF Mono',monospace",
                          fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.94)",
                          letterSpacing:0.6, textTransform:"uppercase",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        }}>{dispName}</span>
                        <span style={{
                          fontFamily:"'JetBrains Mono','SF Mono',monospace",
                          fontSize:6.5, fontWeight:700, letterSpacing:0.9,
                          color: isFullAdmin ? SAFFRON : IND_GREEN,
                          background: isFullAdmin ? "rgba(255,153,51,0.13)" : "rgba(19,136,8,0.13)",
                          border:`1px solid ${isFullAdmin ? SAFFRON : IND_GREEN}30`,
                          borderRadius:4, padding:"1.5px 4px", flexShrink:0,
                        }}>{isFullAdmin ? "ADMIN" : "AGENT"}</span>
                      </div>
                      <div style={{
                        fontFamily:"'JetBrains Mono','SF Mono',monospace",
                        fontSize:7, color:"rgba(255,255,255,0.28)", letterSpacing:0.4, marginTop:2.5,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        display:"flex", alignItems:"center", gap:4,
                      }}>
                        <span>SESSION {fmtSession(sessionSecs)}</span>
                        <span style={{ width:1, height:7, background:"rgba(255,255,255,0.13)", flexShrink:0 }}/>
                        <span style={{
                          color: error ? "#ef4444" : "#22c55e",
                          fontSize:6, letterSpacing:0.9, fontWeight:700,
                        }}>{error ? "ERR" : "SYS OK"}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
                      <div style={{
                        width:6, height:6, borderRadius:"50%", background:"#22c55e",
                        boxShadow:"0 0 5px rgba(34,197,94,0.85)",
                        animation:"ys-pulse-dot 2.2s ease-in-out infinite",
                      }}/>
                      <span style={{
                        fontFamily:"'JetBrains Mono','SF Mono',monospace",
                        fontSize:6, color:"rgba(255,255,255,0.24)", letterSpacing:0.7,
                      }}>LIVE</span>
                    </div>
                  </div>

                  {/* Tab navigator pill */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:1,
                    background:"rgba(255,255,255,0.11)",
                    border:"1px solid rgba(255,255,255,0.20)",
                    borderRadius:20, padding:"6px 7px",
                    backdropFilter:"blur(10px)",
                    flexShrink:0,
                    boxShadow:"inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}>
                    <span onClick={(e)=>{ e.stopPropagation(); if(activeSection==="home")return; const c2=tabIds.indexOf(activeSection); if(c2===0){navigateTab("home");return;} if(c2>0)navigateTab(tabIds[c2-1]); }}
                      style={{ fontSize:15,color:"rgba(255,255,255,0.65)",cursor:"pointer",lineHeight:1,padding:"0 2px",opacity:activeSection!=="home"?1:0.2,userSelect:"none" }}>‹</span>
                    <span style={{ fontSize:10,fontWeight:800,color:"#fff",letterSpacing:0.2,whiteSpace:"nowrap",minWidth:50,textAlign:"center",padding:"0 1px",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
                      {TAB_ICONS[activeSection === "home" ? "home" : activeSection]?.("rgba(255,255,255,0.9)", 10)}
                      {activeSection==="home" ? "Home" : (TABS.find(([id])=>id===activeSection)?.[1]||"")}
                    </span>
                    <span onClick={(e)=>{ e.stopPropagation(); if(activeSection==="home"){navigateTab(tabIds[0]);return;} const c2=tabIds.indexOf(activeSection); if(c2<tabIds.length-1)navigateTab(tabIds[c2+1]); }}
                      style={{ fontSize:15,color:"rgba(255,255,255,0.65)",cursor:"pointer",lineHeight:1,padding:"0 2px",opacity:(activeSection==="home"||(curr!==-1&&curr<tabIds.length-1))?1:0.2,userSelect:"none" }}>›</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ Tab bar (shared mobile + desktop) ══ */}
        <div ref={tabsBarRef} style={{
          display:"flex", gap:4,
          overflowX:"auto", paddingBottom:0,
          scrollbarWidth:"none",
          WebkitOverflowScrolling:"touch",
          maxWidth: isDesktop ? 1400 : "100%",
          margin: isDesktop ? "6px auto 0" : "4px 0 0",
          paddingLeft: isDesktop ? 40 : 16,
          paddingRight: isDesktop ? 40 : 12,
          position:"relative", zIndex:1,
        }}>
          {/* ─ HOME tab ─ */}
          <div
            onClick={() => navigateTab("home")}
            data-active={activeSection === "home" ? "true" : "false"}
            style={{
              padding:"8px 14px",
              borderRadius:0,
              fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0,
              background:"transparent",
              border:"none",
              borderBottom: activeSection === "home" ? `2px solid ${SAFFRON}` : "2px solid transparent",
              color: activeSection === "home" ? "#fff" : "rgba(255,255,255,0.52)",
              transition:"all 0.2s",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:5, lineHeight:1 }}>
              {TAB_ICONS.home(activeSection === "home" ? "#fff" : "rgba(255,255,255,0.52)")}
              <span>Home</span>
            </div>
          </div>

          {/* ─ Separator: Home vs module tabs ─ */}
          <div style={{
            width:1, background:"rgba(255,255,255,0.14)",
            alignSelf:"stretch", margin:"7px 3px", flexShrink:0,
          }} />

          {TABS.map(([id, label]) => {
            const STATUS_HINTS = id === "reports" ? [
              {
                key: "open",
                // Open but NOT reopened (reopened gets its own pill below)
                count: reports.filter(r =>
                  r.status === "open" &&
                  !r.replyHistory?.some(h => h.isReopen)
                ).length,
                color: "#DC2626",
                bg: "rgba(220,38,38,0.18)",
                dot: "🔴",
              },
              {
                key: "in_progress",
                count: reports.filter(r => r.status === "in_progress").length,
                color: "#F59E0B",
                bg: "rgba(245,158,11,0.18)",
                dot: "🟡",
              },
              {
                key: "reopened",
                // Reopened = has isReopen entry in replyHistory AND not yet resolved
                count: reports.filter(r =>
                  r.replyHistory?.some(h => h.isReopen) &&
                  r.status !== "resolved"
                ).length,
                color: "#A855F7",
                bg: "rgba(168,85,247,0.18)",
                dot: "🔁",
              },
            ].filter(s => s.count > 0) : [];

            return (
              <div key={id} onClick={() => navigateTab(id)}
                data-active={activeSection === id ? "true" : "false"}
                style={{
                padding: STATUS_HINTS.length > 0 ? "8px 14px 20px" : "8px 14px",
                borderRadius:0,
                fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0,
                background:"transparent",
                border:"none",
                borderBottom: activeSection === id ? `2px solid ${SAFFRON}` : "2px solid transparent",
                color: activeSection === id ? "#fff" : "rgba(255,255,255,0.52)",
                transition:"all 0.2s",
                position:"relative",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, lineHeight:1 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    {TAB_ICONS[id]?.(activeSection === id ? "#fff" : "rgba(255,255,255,0.52)")}
                    {id === "reports" && STATUS_HINTS[0]?.count > 0 && (
                      <div style={{
                        position:"absolute", top:-5, right:-5,
                        minWidth:13, height:13, borderRadius:7, padding:"0 2px",
                        background:"#DC2626",
                        border:"1.5px solid #010a18",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:7, fontWeight:900, color:"#fff", lineHeight:1,
                        boxShadow:"0 0 7px rgba(220,38,38,0.75)",
                        animation:"ys-pulse-dot 2.4s ease-in-out infinite",
                      }}>
                        {STATUS_HINTS[0].count > 9 ? "9+" : STATUS_HINTS[0].count}
                      </div>
                    )}
                  </div>
                  <span>{label}</span>
                </div>
                {STATUS_HINTS.length > 0 && (
                  <div style={{
                    position:"absolute", bottom:3, left:"50%",
                    transform:"translateX(-50%)",
                    display:"flex", gap:3, alignItems:"center",
                  }}>
                    {STATUS_HINTS.map(s => (
                      <div key={s.key} style={{
                        display:"flex", alignItems:"center", gap:2,
                        background: s.bg,
                        border:`1px solid ${s.color}`,
                        borderRadius:6,
                        padding:"1px 4px",
                      }}>
                        <span style={{ fontSize:7 }}>{s.dot}</span>
                        <span style={{ fontSize:8, fontWeight:800, color: s.color }}>
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bottom glow strip ── */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent 0%,${SAFFRON}55 20%,#4f8ef7 50%,${SAFFRON}55 80%,transparent 100%)`,
          pointerEvents:"none",
        }}/>
      </div>
      {loading && (
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:12,
          maxWidth: isDesktop ? 1400 : "100%",
          margin: isDesktop ? "0 auto" : undefined,
          width:"100%", boxSizing:"border-box",
        }}>
          <div style={{ fontSize:32, animation:"ys-spin 1s linear infinite" }}>⏳</div>
          <div style={{ color:th.textMid, fontSize:13 }}>Fetching user data…</div>
        </div>
      )}

      {/* ── ERROR ── */}
      {!loading && error && (
        <div style={{ padding:20 }}>
          <div style={{
            background:"#FFF5F5", border:"1px solid #FED7D7",
            borderRadius:12, padding:"14px 16px",
            color:"#c53030", fontSize:13,
          }}>
            ❌ {error}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT — animated tab navigation ── */}
      <div
        onTouchStart={e => {
          swipeTouchStartX.current = e.touches[0].clientX;
          swipeTouchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={e => {
          if (swipeTouchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - swipeTouchStartX.current;
          const dy = e.changedTouches[0].clientY - swipeTouchStartY.current;
          swipeTouchStartX.current = null;
          swipeTouchStartY.current = null;
          // Only fire if horizontal swipe > 52px and more horizontal than vertical
          if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
          const tabIds = TABS.map(([id]) => id);
          if (dx < 0) {
            // Swipe left → go to next tab
            if (activeSection === "home") { navigateTab(tabIds[0]); return; }
            const curr = tabIds.indexOf(activeSection);
            if (curr < tabIds.length - 1) navigateTab(tabIds[curr + 1]);
          } else {
            // Swipe right → go to previous tab
            if (activeSection === "home") return;
            const curr = tabIds.indexOf(activeSection);
            if (curr === 0) { navigateTab("home"); return; }
            if (curr > 0) navigateTab(tabIds[curr - 1]);
          }
        }}
        style={{
          flex:1, display:"flex", flexDirection:"column",
          willChange: tabTransition ? "opacity, transform" : "auto",
          opacity: (tabTransition === "fwd-out" || tabTransition === "bwd-out" ||
                    tabTransition === "fwd-in"  || tabTransition === "bwd-in") ? 0 : 1,
          transform:
            tabTransition === "fwd-out" ? "translateX(-22px)" :
            tabTransition === "bwd-out" ? "translateX(22px)"  :
            tabTransition === "fwd-in"  ? "translateX(22px)"  :
            tabTransition === "bwd-in"  ? "translateX(-22px)" :
            "translateX(0)",
          transition:
            (tabTransition === "fwd-out" || tabTransition === "bwd-out")
              ? "opacity 0.15s ease, transform 0.15s ease"
              : tabTransition === null
                ? "opacity 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1)"
                : "none",
        }}>

      {/* ══ HOME SCREEN ══ */}
      {!loading && !error && activeSection === "home" && (
        <HomeScreen
          users={users}
          reports={reports}
          loading={loading}
          dark={dark}
          isDesktop={isDesktop}
          TABS={TABS}
          navigateTab={navigateTab}
          error={error}
          refreshing={refreshing}
          sessionStart={sessionStart}
          lastSynced={lastSynced}
          latencyMs={latencyMs}
          onRefresh={() => { fetchUsers(true); fetchReports(); fetchUsage(); }}
        />
      )}

      {/* ══ OVERVIEW ══ */}
      {!loading && !error && activeSection === "overview" && (
        isDesktop ? (

          /* ─────────────────────────────────────────────────────────────────
             DESKTOP OVERVIEW LAYOUT
             ───────────────────────────────────────────────────────────────── */
          <div style={{
            padding:"28px 40px 40px",
            display:"flex", flexDirection:"column", gap:20,
            maxWidth:1400, margin:"0 auto", width:"100%", boxSizing:"border-box",
          }}>

            {/* ── Stat Cards: 6 cards, 3-per-row ── */}
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              {[
                { icon:"👥", label:"Total Users",       value:users.length,        color:NAVY,      sparkline:stats.spark },
                { icon:"🆕", label:"New This Week",     value:stats.newThisWeek,   color:IND_GREEN, trend:stats.weekGrowth },
                { icon:"🟢", label:"Active Today",      value:stats.activeToday,   color:SAFFRON,
                  sub:`${users.length ? Math.round(stats.activeToday/users.length*100) : 0}% of users` },
                { icon:"📅", label:"Active This Week",  value:stats.activeWeek,    color:VIOLET,
                  sub:`${users.length ? Math.round(stats.activeWeek/users.length*100) : 0}% of users` },
                { icon:"🗺️", label:"States Covered",    value:stats.statesCount,   color:PINK },
                { icon:"🏠", label:"Needs Housing",     value:stats.needHousing,   color:GOOGLE_B,
                  sub:`${users.length ? Math.round(stats.needHousing/users.length*100) : 0}% of users` },
              ].map(({ icon, label, value, color, sub, trend, sparkline }) => (
                <div key={label} style={{ flex:"1 1 calc(33.3% - 10px)", minWidth:180 }}>
                  <StatCard icon={icon} label={label} value={value} color={color}
                    sub={sub} trend={trend} sparkline={sparkline} dark={dark} />
                </div>
              ))}
            </div>

            {/* ── Main 2-column body ── */}
            <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>

              {/* Left column (wider): By State + Income/Area + Age */}
              <div style={{ flex:"1.5 1 0", display:"flex", flexDirection:"column", gap:16, minWidth:0 }}>

                {/* By State */}
                <div style={{
                  background:th.card, border:`1.5px solid ${th.border}`,
                  borderRadius:16, padding:"16px 20px",
                }}>
                  <div style={{ fontSize:14, fontWeight:800, color:th.text, marginBottom:14 }}>
                    📍 Users by State
                    <span style={{ color:th.textSub, fontWeight:500, fontSize:12, marginLeft:6 }}>(top 8)</span>
                  </div>
                  {stats.topStates.length > 0
                    ? <BarChart data={stats.topStates} color={NAVY} dark={dark} />
                    : <div style={{ fontSize:12, color:th.textSub }}>No data yet</div>}
                </div>

                {/* Income + Area side-by-side */}
                <div style={{ display:"flex", gap:16 }}>
                  <div style={{
                    flex:1, background:th.card, border:`1.5px solid ${th.border}`,
                    borderRadius:16, padding:"16px 18px", minWidth:0,
                  }}>
                    <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
                      💰 Income Breakdown
                    </div>
                    <BarChart data={stats.incData} color={IND_GREEN} dark={dark} />
                  </div>
                  <div style={{
                    flex:1, background:th.card, border:`1.5px solid ${th.border}`,
                    borderRadius:16, padding:"16px 18px", minWidth:0,
                  }}>
                    <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
                      🏘️ Area Distribution
                    </div>
                    <DonutChart data={stats.areaDonut} size={110} dark={dark} />
                  </div>
                </div>

                {/* Age groups */}
                <div style={{
                  background:th.card, border:`1.5px solid ${th.border}`,
                  borderRadius:16, padding:"16px 20px",
                }}>
                  <div style={{ fontSize:14, fontWeight:800, color:th.text, marginBottom:14 }}>
                    🎂 Age Groups
                  </div>
                  <BarChart data={stats.ageData} color={PINK} dark={dark} />
                </div>
              </div>

              {/* Right column (narrower): Occupation donut + Recent sign-ups */}
              <div style={{ flex:"1 1 0", display:"flex", flexDirection:"column", gap:16, minWidth:0 }}>

                {/* Occupation donut */}
                <div style={{
                  background:th.card, border:`1.5px solid ${th.border}`,
                  borderRadius:16, padding:"16px 18px",
                }}>
                  <div style={{ fontSize:14, fontWeight:800, color:th.text, marginBottom:14 }}>
                    💼 Occupation Breakdown
                  </div>
                  <DonutChart data={stats.occDonut} size={130} dark={dark} />
                </div>

                {/* Recent sign-ups */}
                <div style={{
                  background:th.card, border:`1.5px solid ${th.border}`,
                  borderRadius:16, padding:"16px 18px",
                  flex:1,
                }}>
                  <div style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    marginBottom:8,
                  }}>
                    <div style={{ fontSize:14, fontWeight:800, color:th.text }}>🕐 Recent Sign-ups</div>
                    <div onClick={() => navigateTab("users")} style={{
                      fontSize:11, color:SAFFRON, fontWeight:700, cursor:"pointer",
                    }}>
                      See all →
                    </div>
                  </div>
                  {users.slice(0, 8).map(u => (
                    <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />
                  ))}
                </div>
              </div>
            </div>
          </div>

        ) : (

          /* ─────────────────────────────────────────────────────────────────
             MOBILE OVERVIEW LAYOUT (original)
             ───────────────────────────────────────────────────────────────── */
          <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

            {/* Row 1 */}
            <div style={{ display:"flex", gap:10 }}>
              <StatCard icon="👥" label="Total Users" value={users.length}
                color={NAVY} dark={dark} sparkline={stats.spark} />
              <StatCard icon="🆕" label="New This Week" value={stats.newThisWeek}
                color={IND_GREEN} dark={dark} trend={stats.weekGrowth} />
            </div>

            {/* Row 2 */}
            <div style={{ display:"flex", gap:10 }}>
              <StatCard icon="🟢" label="Active Today" value={stats.activeToday}
                sub={`${users.length ? Math.round(stats.activeToday/users.length*100) : 0}% of users`}
                color={SAFFRON} dark={dark} />
              <StatCard icon="📅" label="Active This Week" value={stats.activeWeek}
                sub={`${users.length ? Math.round(stats.activeWeek/users.length*100) : 0}% of users`}
                color={VIOLET} dark={dark} />
            </div>

            {/* Row 3 */}
            <div style={{ display:"flex", gap:10 }}>
              <StatCard icon="🗺️" label="States Covered" value={stats.statesCount}
                color={PINK} dark={dark} />
              <StatCard icon="🏠" label="Needs Housing" value={stats.needHousing}
                sub={`${users.length ? Math.round(stats.needHousing/users.length*100) : 0}% of users`}
                color={GOOGLE_B} dark={dark} />
            </div>

            {/* By State */}
            <div style={{
              background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:16, padding:"14px 16px",
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
                📍 Users by State <span style={{ color:th.textSub, fontWeight:500, fontSize:11 }}>(top 8)</span>
              </div>
              {stats.topStates.length > 0
                ? <BarChart data={stats.topStates} color={NAVY} dark={dark} />
                : <div style={{ fontSize:12, color:th.textSub }}>No data yet</div>}
            </div>

            {/* Occupation donut */}
            <div style={{
              background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:16, padding:"14px 16px",
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
                💼 Occupation Breakdown
              </div>
              <DonutChart data={stats.occDonut} dark={dark} />
            </div>

            {/* 2-col: Income + Area */}
            <div style={{ display:"flex", gap:12 }}>
              <div style={{
                flex:1, background:th.card, border:`1.5px solid ${th.border}`,
                borderRadius:16, padding:"14px 14px",
              }}>
                <div style={{ fontSize:12, fontWeight:800, color:th.text, marginBottom:10 }}>
                  💰 Income
                </div>
                <BarChart data={stats.incData} color={IND_GREEN} dark={dark} />
              </div>
              <div style={{
                flex:1, background:th.card, border:`1.5px solid ${th.border}`,
                borderRadius:16, padding:"14px 14px",
              }}>
                <div style={{ fontSize:12, fontWeight:800, color:th.text, marginBottom:10 }}>
                  🏘️ Area
                </div>
                <DonutChart data={stats.areaDonut} size={90} dark={dark} />
              </div>
            </div>

            {/* Age */}
            <div style={{
              background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:16, padding:"14px 16px",
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
                🎂 Age Groups
              </div>
              <BarChart data={stats.ageData} color={PINK} dark={dark} />
            </div>

            {/* Recent users preview */}
            <div style={{
              background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:16, padding:"14px 16px",
            }}>
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:4,
              }}>
                <div style={{ fontSize:13, fontWeight:800, color:th.text }}>🕐 Recent Sign-ups</div>
                <div onClick={() => navigateTab("users")} style={{
                  fontSize:11, color:SAFFRON, fontWeight:700, cursor:"pointer",
                }}>
                  See all →
                </div>
              </div>
              {users.slice(0, 5).map(u => (
                <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />
              ))}
            </div>
          </div>

        )
      )}

      {/* ══ USERS ══ */}
      {!loading && !error && activeSection === "users" && (
        <div style={{ padding:"14px 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* Search */}
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍  Search by name, phone, email, state…"
            style={{
              width:"100%", padding:"11px 14px", boxSizing:"border-box",
              border:`1.5px solid ${th.border}`, borderRadius:12,
              fontSize:13, color:th.text, background:th.inputBg,
              outline:"none", fontFamily:"inherit",
            }}
          />

          {/* Filters row 1 */}
          <div style={{ display:"flex", gap:8 }}>
            <select value={filterOcc} onChange={e => { setFilterOcc(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All Occupations</option>
              {Object.entries(OCC_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{OCC_EMOJI[k]} {v}</option>
              ))}
            </select>
            <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All States</option>
              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Filters row 2 */}
          <div style={{ display:"flex", gap:8 }}>
            <select value={filterArea} onChange={e => { setFilterArea(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All Areas</option>
              {Object.entries(AREA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterIncome} onChange={e => { setFilterIncome(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All Income</option>
              {Object.entries(INC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Sort row */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ fontSize:11, color:th.textSub, flexShrink:0 }}>Sort:</div>
            <SortBtn field="lastSeen"  current={sortField} dir={sortDir} onClick={handleSort} label="Last Seen" dark={dark} />
            <SortBtn field="createdAt" current={sortField} dir={sortDir} onClick={handleSort} label="Joined"    dark={dark} />
            <SortBtn field="name"      current={sortField} dir={sortDir} onClick={handleSort} label="Name"      dark={dark} />
          </div>

          {/* Count + export filtered */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:11, color:th.textSub, fontWeight:600 }}>
              {filtered.length} of {users.length} users
              {filtered.length < users.length && (
                <span style={{ color:SAFFRON, marginLeft:4 }}>(filtered)</span>
              )}
            </div>
            {filtered.length < users.length && (
              <span style={{ fontSize:10, color:SAFFRON, fontWeight:600 }}>
                Go to the 📄 Export tab to download a custom PDF report.
              </span>
            )}
          </div>

          {/* User list */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"4px 14px",
          }}>
            {pageSlice.length === 0 ? (
              <div style={{ padding:"24px 0", textAlign:"center", color:th.textSub, fontSize:13 }}>
                No users match this filter
              </div>
            ) : (
              pageSlice.map(u => <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />)
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10 }}>
              <div onClick={() => setPage(p => Math.max(1, p - 1))} style={{
                padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
                background:th.border, color:page <= 1 ? th.textSub : th.text,
                cursor:page <= 1 ? "default" : "pointer",
              }}>← Prev</div>
              <div style={{ fontSize:12, color:th.textMid }}>
                {page} / {totalPages}
              </div>
              <div onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{
                padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
                background:th.border, color:page >= totalPages ? th.textSub : th.text,
                cursor:page >= totalPages ? "default" : "pointer",
              }}>Next →</div>
            </div>
          )}
        </div>
      )}

      {/* ══ ANALYTICS ══ */}
      {!loading && !error && activeSection === "analytics" && (
        <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Summary pills */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"Google Sign-ins", value:stats.googleUsers,
                pct: users.length ? Math.round(stats.googleUsers/users.length*100) : 0,
                color:GOOGLE_B },
              { label:"📱 Have Phone", value:stats.withPhone,
                pct: users.length ? Math.round(stats.withPhone/users.length*100) : 0,
                color:IND_GREEN },
              { label:"Own House", value:stats.housedUsers,
                pct: users.length ? Math.round(stats.housedUsers/users.length*100) : 0,
                color:SAFFRON },
              { label:"Need Housing", value:stats.needHousing,
                pct: users.length ? Math.round(stats.needHousing/users.length*100) : 0,
                color:VIOLET },
            ].map(({ label, value, pct, color }) => (
              <div key={label} style={{
                background:th.card, border:`1.5px solid ${th.border}`,
                borderRadius:12, padding:"10px 14px", flex:1, minWidth:90,
                borderLeft:`3px solid ${color}`,
              }}>
                <div style={{ fontSize:18, fontWeight:800, color:th.text }}>{value}</div>
                <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>{label}</div>
                <div style={{ fontSize:9, color, fontWeight:700, marginTop:2 }}>{pct}%</div>
              </div>
            ))}
          </div>

          {/* Gender breakdown */}
          {stats.genderData.length > 0 && (
            <div style={{ background:th.card, border:`1.5px solid ${th.border}`, borderRadius:16, padding:"14px 16px" }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>⚧ Gender Breakdown</div>
              <DonutChart data={stats.genderData} dark={dark} />
            </div>
          )}

          {/* Ration Card breakdown */}
          {stats.rationData.length > 0 && (
            <div style={{ background:th.card, border:`1.5px solid ${th.border}`, borderRadius:16, padding:"14px 16px" }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>🪪 Ration Card Types</div>
              <BarChart data={stats.rationData} color={SAFFRON} dark={dark} />
            </div>
          )}

          {/* Marital + Disability side by side */}
          <div style={{ display:"flex", gap:12 }}>
            {stats.maritalData.length > 0 && (
              <div style={{ flex:1, background:th.card, border:`1.5px solid ${th.border}`, borderRadius:16, padding:"14px 14px" }}>
                <div style={{ fontSize:12, fontWeight:800, color:th.text, marginBottom:10 }}>💍 Marital Status</div>
                <BarChart data={stats.maritalData} color={PINK} dark={dark} />
              </div>
            )}
            {stats.disabData.length > 0 && (
              <div style={{ flex:1, background:th.card, border:`1.5px solid ${th.border}`, borderRadius:16, padding:"14px 14px" }}>
                <div style={{ fontSize:12, fontWeight:800, color:th.text, marginBottom:10 }}>♿ Disability</div>
                <BarChart data={stats.disabData} color={VIOLET} dark={dark} />
              </div>
            )}
          </div>

          {/* Occupation × Area cross-tab */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🔀 Occupation × Area
            </div>
            <CrossTab
              data={users}
              rowKey="occupation" colKey="area"
              rowLabels={OCC_LABELS} colLabels={AREA_LABELS}
              dark={dark}
            />
          </div>

          {/* Income × Area cross-tab */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🔀 Income × Area
            </div>
            <CrossTab
              data={users}
              rowKey="income" colKey="area"
              rowLabels={INC_LABELS} colLabels={AREA_LABELS}
              dark={dark}
            />
          </div>

          {/* Occupation × Income cross-tab */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🔀 Occupation × Income
            </div>
            <CrossTab
              data={users}
              rowKey="occupation" colKey="income"
              rowLabels={OCC_LABELS} colLabels={INC_LABELS}
              dark={dark}
            />
          </div>

          {/* Full state bar */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              📍 All States
            </div>
            <BarChart
              data={Object.entries(groupBy(users, "state"))
                .sort((a, b) => b[1] - a[1])
                .map(([label, value]) => ({ label, value }))}
              color={NAVY} dark={dark}
            />
          </div>
        </div>
      )}

      {/* ══ ACTIVITY FEED ══ */}
      {!loading && !error && activeSection === "activity" && (
        <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Quick metrics — flexWrap so 3rd card drops to its own row on narrow phones */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { icon:"🟢", label:"Active Today",     value:stats.activeToday,  color:IND_GREEN },
              { icon:"📅", label:"Active This Week",  value:stats.activeWeek,   color:VIOLET    },
              { icon:"😴", label:"Dormant 30d+",     value:stats.dormantCount, color:"#F59E0B"  },
            ].map(c => (
              <div key={c.label} style={{ flex:1, minWidth:120 }}>
                <StatCard icon={c.icon} label={c.label} value={c.value} color={c.color} dark={dark} />
              </div>
            ))}
          </div>

          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🕐 Recent Activity ({users.filter(u => u.lastSeen).length} users)
            </div>
            <ActivityFeed users={users} dark={dark} />
          </div>

          {/* New this week list */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:8 }}>
              🆕 Joined This Week ({stats.newThisWeek})
            </div>
            <JoinedThisWeek users={users} dark={dark} onTap={setSelectedUser} />
          </div>

          {/* Dormant users list */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:8 }}>
              😴 Dormant Users — 30+ Days Inactive ({stats.dormantCount})
            </div>
            <DormantUsers users={users} dark={dark} onTap={setSelectedUser} />
          </div>
        </div>
      )}

      {/* ══ USAGE INSIGHTS ══ */}
      {activeSection === "usage" && (
        <>
          <UsageSection
            usageData={usageData}
            users={users}
            loading={usageLoading}
            onRefresh={fetchUsage}
            dark={dark}
          />
          <UsageDataCleaner
            dark={dark}
            onDeleteDone={fetchUsage}
          />
          <div style={{ height: 20 }} />
        </>
      )}

      {/* ══ SCHEMES COVERAGE ══ */}
      {!loading && !error && activeSection === "schemes" && (
        <SchemeCoverageTab dark={dark} />
      )}

      {/* ══ REPORTS / QUERIES ══ */}
      {activeSection === "reports" && (
        <ReportsSection
          reports={reports}
          loading={reportsLoading}
          dark={dark}
          isDesktop={isDesktop}
          onRefresh={fetchReports}
          onLogActivity={logActivity}
          onStatusChange={async (reportId, newStatus, replyData) => {
            if (replyData) {
              // Called after reply already saved to Firestore — just sync local state
              setReports(prev =>
                prev.map(r => r.id === reportId ? {
                  ...r,
                  status:       newStatus,
                  adminReply:   replyData.text,
                  repliedAt:    replyData.sentAt,
                  replyHistory: [...(r.replyHistory || []), replyData],
                } : r)
              );
            } else {
              // Status-button-only change — write to Firestore + sync local state
              try {
                await updateDoc(doc(db, "reports", reportId), {
                  status: newStatus,
                  updatedAt: serverTimestamp(),
                });
                setReports(prev =>
                  prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
                );
                logActivity(
                  `Marked report #${reportId.slice(0, 6)} as ${newStatus}`,
                  "reports",
                  newStatus === "resolved" ? "resolve" : "update",
                );
              } catch (err) {
                console.error("Status update failed:", err);
              }
            }
          }}
        />
      )}

      {/* ══ CLEANUP — Delete old resolved reports ══ */}
      {activeSection === "cleanup" && (
        <>
          <ResolvedReportsCleaner
            dark={dark}
            onDeleteDone={() => {
              fetchReports();
              logActivity("Purged old resolved reports", "cleanup", "cleanup");
            }}
          />
          <div style={{ height: 20 }} />
        </>
      )}

      {/* ══ EXPORT — Selective PDF generator ══ */}
      {activeSection === "export" && (() => {
        // Section catalogue
        const EXPORT_SECTION_CONFIG = [
          { id:"overview",  icon:"📊", label:"Overview",          desc:"Platform summary, welfare snapshot & key metrics" },
          { id:"analytics", icon:"🧮", label:"Demographics",      desc:"Occupation, income, age, gender, cross-tab matrices" },
          { id:"users",     icon:"👥", label:"User Registry",     desc:"Full 24-column table of all registered users" },
          { id:"activity",  icon:"🕐", label:"Activity",          desc:"Recent activity, new joiners & dormant users" },
          { id:"schemes",   icon:"🗺️", label:"Schemes Coverage",  desc:"State-wise coverage table & tier summary" },
          { id:"reports",   icon:"📬", label:"Reports",           desc:"All reports with full reply history" },
        ];
        const selectedCount = exportSections.size;
        const allSelected   = selectedCount === EXPORT_SECTION_CONFIG.length;
        const noneSelected  = selectedCount === 0;

        function toggleSection(id) {
          setExportSections(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
          });
        }
        function selectAll()  { setExportSections(new Set(EXPORT_SECTION_CONFIG.map(s => s.id))); }
        function clearAll()   { setExportSections(new Set()); }

        // ── shared techy tokens ───────────────────────────────────────
        const C = {
          blue:   "#4f8ef7",
          green:  "#3dd68c",
          amber:  "#f7c948",
          red:    "#f87171",
          purple: "#a78bfa",
          border: dark ? "#1a1d2e" : "#dde1f0",
          surf:   dark ? "#0d0f1a" : "#f0f2fa",
          card:   dark ? "#111320" : "#fff",
          text:   dark ? "#c8cde8" : "#1a1d2e",
          sub:    dark ? "#3a3f5c" : "#9094b0",
          mono:   "'JetBrains Mono','Fira Code','Courier New',monospace",
        };

        const SECTION_COLORS = [C.blue, C.green, C.amber, C.purple, C.red, "#f7824f"];

        return (
          <>
            {/* ── Keyframes injected once ── */}
            <style>{`
              @keyframes exp-scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
              @keyframes exp-pulse{ 0%,100%{opacity:1} 50%{opacity:.35} }
              @keyframes exp-glow { 0%,100%{box-shadow:0 0 8px rgba(79,142,247,0)} 50%{box-shadow:0 0 18px rgba(79,142,247,0.45)} }
              @keyframes exp-slide{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
              .exp-row { animation: exp-slide .22s ease forwards; }
            `}</style>

          <div style={{ padding:"14px 12px", display:"flex", flexDirection:"column", gap:12, fontFamily:C.mono }}>

            {/* ── TOP HEADER: terminal banner ───────────────────────── */}
            <div style={{
              background: dark
                ? "linear-gradient(135deg,#090b14 0%,#0d1020 100%)"
                : "linear-gradient(135deg,#0d1020 0%,#1a1f38 100%)",
              border:`1px solid ${C.blue}30`,
              borderRadius:14, padding:"14px 16px",
              position:"relative", overflow:"hidden",
            }}>
              {/* scan line */}
              <div style={{
                position:"absolute", inset:"0 0 auto 0", height:1,
                background:`linear-gradient(90deg,transparent,${C.blue}60,transparent)`,
                animation:"exp-scan 3s linear infinite",
              }} />
              {/* top-left corner accent */}
              <div style={{
                position:"absolute", top:0, left:0,
                width:28, height:28,
                borderTop:`2px solid ${C.blue}`,
                borderLeft:`2px solid ${C.blue}`,
                borderRadius:"14px 0 0 0",
              }} />
              <div style={{
                position:"absolute", bottom:0, right:0,
                width:28, height:28,
                borderBottom:`2px solid ${C.blue}40`,
                borderRight:`2px solid ${C.blue}40`,
                borderRadius:"0 0 14px 0",
              }} />

              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1 }}>
                  {/* prompt line */}
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ color:C.green, fontSize:9, fontWeight:700 }}>ys@admin</span>
                    <span style={{ color:C.sub, fontSize:9 }}>~</span>
                    <span style={{ color:C.sub, fontSize:9 }}>$</span>
                    <span style={{ color:"#e2e8ff", fontSize:9 }}>export --mode=pdf --format=A4-landscape</span>
                    <span style={{ color:C.blue, fontSize:9, animation:"exp-pulse 1.1s ease infinite" }}>▋</span>
                  </div>
                  <div style={{ color:"#fff", fontSize:14, fontWeight:800, letterSpacing:-0.3 }}>
                    Intelligence Report
                  </div>
                  <div style={{ color:C.sub, fontSize:9, marginTop:3 }}>
                    Configure sections · Compile · Export PDF
                  </div>
                </div>
                {/* selected counter */}
                <div style={{
                  background:"rgba(79,142,247,0.1)",
                  border:`1px solid ${C.blue}40`,
                  borderRadius:10, padding:"8px 12px", textAlign:"center", flexShrink:0,
                  animation: selectedCount > 0 ? "exp-glow 2s ease infinite" : "none",
                }}>
                  <div style={{ fontFamily:C.mono, fontSize:22, fontWeight:800, color:C.blue, lineHeight:1 }}>
                    {String(selectedCount).padStart(2,"0")}
                  </div>
                  <div style={{ fontSize:7, color:C.sub, marginTop:2, letterSpacing:1, textTransform:"uppercase" }}>
                    modules
                  </div>
                </div>
              </div>

              {/* data-line stats */}
              <div style={{
                display:"flex", gap:0, marginTop:12,
                borderTop:`1px solid ${C.blue}18`, paddingTop:10,
              }}>
                {[
                  { label:"USERS",    value: String(users.length).padStart(4,"0"), color:C.blue   },
                  { label:"REPORTS",  value: String(reports.length).padStart(4,"0"), color:C.amber  },
                  { label:"SELECTED", value: `${selectedCount}/${EXPORT_SECTION_CONFIG.length}`, color:C.green  },
                ].map(({ label, value, color }, i, arr) => (
                  <div key={label} style={{
                    flex:1, textAlign:"center",
                    borderRight: i < arr.length - 1 ? `1px solid ${C.blue}18` : "none",
                    paddingRight: i < arr.length - 1 ? 0 : 0,
                  }}>
                    <div style={{ fontFamily:C.mono, fontSize:13, fontWeight:800, color, letterSpacing:-0.5 }}>{value}</div>
                    <div style={{ fontSize:7, color:C.sub, letterSpacing:1.2, textTransform:"uppercase", marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── MODULE SELECTOR HEADER ──────────────────────────────── */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:2, height:12, background:C.blue, borderRadius:1 }} />
                <span style={{ fontSize:9, fontWeight:700, color:C.sub, letterSpacing:1.4, textTransform:"uppercase" }}>
                  Report Modules
                </span>
              </div>
              <div onClick={selectAll} style={{
                padding:"4px 10px", borderRadius:6, cursor:"pointer",
                fontSize:9, fontWeight:700, fontFamily:C.mono,
                background: allSelected ? `${C.green}18` : "transparent",
                color: allSelected ? C.green : C.sub,
                border:`1px solid ${allSelected ? C.green+"50" : C.border}`,
                transition:"all 0.15s",
                letterSpacing:0.5,
              }}>
                [ALL]
              </div>
              <div onClick={clearAll} style={{
                padding:"4px 10px", borderRadius:6, cursor:"pointer",
                fontSize:9, fontWeight:700, fontFamily:C.mono,
                background: noneSelected ? `${C.red}18` : "transparent",
                color: noneSelected ? C.red : C.sub,
                border:`1px solid ${noneSelected ? C.red+"50" : C.border}`,
                transition:"all 0.15s",
                letterSpacing:0.5,
              }}>
                [CLR]
              </div>
            </div>

            {/* ── SECTION TOGGLE ROWS ─────────────────────────────────── */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {EXPORT_SECTION_CONFIG.map(({ id, label, desc }, idx) => {
                const on    = exportSections.has(id);
                const color = SECTION_COLORS[idx % SECTION_COLORS.length];
                return (
                  <div
                    key={id}
                    className="exp-row"
                    onClick={() => toggleSection(id)}
                    style={{
                      display:"flex", alignItems:"center", gap:10,
                      background: on
                        ? (dark ? `${color}12` : `${color}0d`)
                        : C.card,
                      border:`1px solid ${on ? color+"55" : C.border}`,
                      borderRadius:10, padding:"10px 12px",
                      cursor:"pointer",
                      transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",
                      animationDelay:`${idx * 40}ms`,
                      position:"relative", overflow:"hidden",
                    }}
                  >
                    {/* left accent bar */}
                    <div style={{
                      position:"absolute", top:0, left:0, bottom:0, width:3,
                      background: on ? color : "transparent",
                      borderRadius:"10px 0 0 10px",
                      transition:"background 0.18s",
                    }} />

                    {/* index number */}
                    <div style={{
                      fontFamily:C.mono, fontSize:9, fontWeight:700,
                      color: on ? color : C.sub, flexShrink:0,
                      width:18, textAlign:"right",
                      transition:"color 0.18s",
                    }}>
                      {String(idx + 1).padStart(2,"0")}
                    </div>

                    {/* text */}
                    <div style={{ flex:1, minWidth:0, paddingLeft:4 }}>
                      <div style={{
                        fontSize:12, fontWeight:800,
                        color: on ? color : C.text,
                        transition:"color 0.18s",
                        fontFamily:C.mono,
                      }}>
                        {label.toUpperCase()}
                      </div>
                      <div style={{
                        fontSize:9, color:C.sub,
                        marginTop:1, lineHeight:1.4,
                        fontFamily:"inherit",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>
                        {desc}
                      </div>
                    </div>

                    {/* checkbox */}
                    <div style={{
                      width:18, height:18, borderRadius:5, flexShrink:0,
                      border:`1.5px solid ${on ? color : C.sub}`,
                      background: on ? color : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.18s",
                    }}>
                      {on && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.8 7L9 1" stroke={dark?"#000":"#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── EXPORT TRIGGER ──────────────────────────────────────── */}
            {noneSelected ? (
              <div style={{
                background:"transparent",
                border:`1px dashed ${C.border}`,
                borderRadius:10, padding:"14px",
                textAlign:"center",
                fontFamily:C.mono, fontSize:10, color:C.sub,
                letterSpacing:0.5,
              }}>
                // select at least one module to compile
              </div>
            ) : !loading && (users.length > 0 || reports.length > 0) ? (
              <div
                onClick={exportModal ? undefined : handleExportAll}
                style={{
                  background: exportModal
                    ? C.surf
                    : dark
                      ? "linear-gradient(135deg,#0d1a3a 0%,#0a1528 100%)"
                      : "linear-gradient(135deg,#0d1a3a 0%,#152040 100%)",
                  border:`1px solid ${exportModal ? C.border : C.blue+"70"}`,
                  borderRadius:12, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:12,
                  cursor: exportModal ? "default" : "pointer",
                  opacity: exportModal ? 0.6 : 1,
                  transition:"all 0.2s",
                  boxShadow: exportModal ? "none" : `0 4px 24px rgba(79,142,247,0.2)`,
                  position:"relative", overflow:"hidden",
                }}
              >
                {/* scan shimmer on hover via animation when not loading */}
                {!exportModal && (
                  <div style={{
                    position:"absolute", inset:"0 auto 0 -60px", width:40,
                    background:"linear-gradient(90deg,transparent,rgba(79,142,247,0.12),transparent)",
                    animation:"exp-shimmer 2.5s linear infinite",
                    pointerEvents:"none",
                  }} />
                )}

                {/* icon */}
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  border:`1px solid ${C.blue}40`,
                  background:"rgba(79,142,247,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {exportModal
                      ? <><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></>
                      : <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>
                    }
                  </svg>
                </div>

                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:C.mono, fontSize:12, fontWeight:800, color:"#e2e8ff", letterSpacing:0.3 }}>
                    {exportModal ? "COMPILING REPORT…" : "COMPILE + EXPORT PDF"}
                  </div>
                  <div style={{ fontFamily:C.mono, fontSize:9, color:C.blue, marginTop:3, opacity:0.8 }}>
                    {exportModal
                      ? "building sections · rendering layout · finalising…"
                      : `${selectedCount} module${selectedCount!==1?"s":""} · landscape A4 · dark theme`}
                  </div>
                </div>

                {!exportModal && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, opacity:0.7 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </div>
            ) : (
              <div style={{
                background:"transparent", border:`1px dashed ${C.border}`,
                borderRadius:10, padding:"14px", textAlign:"center",
                fontFamily:C.mono, fontSize:10, color:C.sub,
              }}>
                {loading ? "// loading data stream…" : "// no data available"}
              </div>
            )}

            {/* ── SYSTEM NOTE ─────────────────────────────────────────── */}
            <div style={{
              background: dark ? "#0a0c14" : "#f4f5fb",
              border:`1px solid ${C.border}`,
              borderRadius:10, padding:"10px 12px",
              fontFamily:C.mono,
            }}>
              <div style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
                <span style={{ color:C.blue, fontSize:10, flexShrink:0, marginTop:0.5 }}>ℹ</span>
                <div style={{ fontSize:9, color:C.sub, lineHeight:1.7 }}>
                  Opens as styled HTML in new tab.{" "}
                  <span style={{ color:C.text }}>Print → Save as PDF</span>
                  {" "}(landscape A4). Document is marked{" "}
                  <span style={{ color:C.red, fontWeight:700 }}>CONFIDENTIAL</span>
                  {" "}— authorised admin use only.
                </div>
              </div>
            </div>

            <div style={{ height:16 }} />
          </div>
          </>
        );
      })()}

      {/* ══ VERIFY — Scheme URL Verifier ══ */}
      {!loading && !error && activeSection === "verify" && (
        <SchemeVerifier dark={dark} isDesktop={isDesktop} />
      )}

      {/* ══ AGENTS — Live Presence Monitor ══ */}
      {!loading && !error && activeSection === "agents" && (
        <AgentsTab dark={dark} isDesktop={isDesktop} />
      )}

      {/* ══ NEWS — Scheme News Manager ══ */}
      {activeSection === "news" && (
        <NewsTab allowedTabs={allowedTabs} dark={dark} isDesktop={isDesktop} />
      )}

      {/* ══ FAQ FEEDBACK — Helpfulness votes per question ══ */}
      {activeSection === "faq" && (
        <FAQFeedbackTab dark={dark} />
      )}

      </div>{/* end animated tab content */}

      {/* ── Bottom Prev/Next nav + position dots ── */}
      {!loading && !error && activeSection !== "home" && (() => {
        const tabIds  = TABS.map(([id]) => id);
        const curr    = tabIds.indexOf(activeSection);
        const hasPrev = curr > 0;
        const hasNext = curr < tabIds.length - 1;
        return (
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 14px 4px", flexShrink:0,
            borderTop:`1px solid ${th.border}`,
          }}>
            {/* Prev */}
            <div onClick={() => hasPrev && navigateTab(tabIds[curr - 1])} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"7px 13px", borderRadius:20,
              background: hasPrev ? (dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)") : "transparent",
              cursor: hasPrev ? "pointer" : "default",
              opacity: hasPrev ? 1 : 0, pointerEvents: hasPrev ? "auto" : "none",
              transition:"all 0.15s", userSelect:"none",
            }}>
              <span style={{ fontSize:13, color:th.textMid }}>‹</span>
              <span style={{ fontSize:10, fontWeight:700, color:th.textMid,
                maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {TABS[curr - 1]?.[1]}
              </span>
            </div>
            {/* Position dots */}
            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
              {tabIds.map((id, i) => (
                <div key={id} onClick={() => navigateTab(id)} style={{
                  width: i === curr ? 18 : 6, height:6, borderRadius:3,
                  background: i === curr ? NAVY : (dark?"#444":"#ddd"),
                  transition:"all 0.25s cubic-bezier(0.22,1,0.36,1)",
                  cursor:"pointer",
                }} />
              ))}
            </div>
            {/* Next */}
            <div onClick={() => hasNext && navigateTab(tabIds[curr + 1])} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"7px 13px", borderRadius:20,
              background: hasNext ? (dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)") : "transparent",
              cursor: hasNext ? "pointer" : "default",
              opacity: hasNext ? 1 : 0, pointerEvents: hasNext ? "auto" : "none",
              transition:"all 0.15s", userSelect:"none",
            }}>
              <span style={{ fontSize:10, fontWeight:700, color:th.textMid,
                maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {TABS[curr + 1]?.[1]}
              </span>
              <span style={{ fontSize:13, color:th.textMid }}>›</span>
            </div>
          </div>
        );
      })()}

      {/* User Detail Drawer */}
      {selectedUser && (
        <UserDrawer user={selectedUser} dark={dark} isDesktop={isDesktop} onClose={() => setSelectedUser(null)} />
      )}

      {/* Export Progress Modal */}
      {exportModal && (
        <ExportModal
          steps={EXPORT_STEPS}
          currentStep={exportStep}
          done={exportDone}
          totalUsers={users.length}
          totalReports={reports.length}
        />
      )}

      {/* Boot Sequence Intro (once per session) */}
      {showBoot && <BootSequence onComplete={finishBoot} />}

      <div style={{ height:32, flexShrink:0 }} />
    </div>
  );
}
