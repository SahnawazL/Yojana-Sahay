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
import { collection, getDocs, updateDoc, doc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "./firebase.js";
import { SCHEME_DB, INDIA_STATES } from "./schemesData.js";
import emailjs from "@emailjs/browser";
import ResolvedReportsCleaner from "./ResolvedReportsCleaner.jsx";

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

// ─── EMAILJS + AI CONFIG ──────────────────────────────────────────────────────
const EJS_SERVICE_ID  = "service_j0cvqgf";
const EJS_REPLY_TID   = "template_xvl9ir3";   // Admin → User reply template
const EJS_PUBLIC_KEY  = "aV7SknFp6qPFayUkX";
// Groq calls go through the Vercel serverless route /api/chat (same as groqClient.js)
// — API keys live in Vercel env vars, never in frontend code.
const GROQ_MODEL = "llama-3.3-70b-versatile";

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
function UserDrawer({ user, dark, onClose }) {
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
      {/* Drawer */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:10001,
        background:th.drawerBg,
        borderRadius:"20px 20px 0 0",
        padding:"0 0 40px 0",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",
        maxHeight:"80vh",
        overflowY:"auto",
      }}>
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
  // Sort by lastSeen, take top 15
  const recent = [...users]
    .filter(u => u.lastSeen)
    .sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0))
    .slice(0, 15);

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
    </div>
  );
}

// ─── SCHEME COVERAGE TAB ──────────────────────────────────────────────────────
function SchemeCoverageTab({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [query, setQuery]         = useState("");
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
    const q = query.toLowerCase();
    let list = q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows;
    // Tier filter
    if (tierFilter !== "all") {
      list = list.filter(r => coverageTier(r.count) === tierFilter);
    }
    return [...list].sort((a, b) =>
      sortMode === "count" ? b.count - a.count : a.name.localeCompare(b.name)
    );
  }, [rows, query, sortMode, tierFilter]);

  // Summary buckets
  const withSchemes  = rows.filter(r => r.count > 0).length;
  const noSchemes    = rows.filter(r => r.count === 0).length;
  const highCoverage = rows.filter(r => r.count > 200).length;
  const lowCount     = rows.filter(r => r.count > 0   && r.count <= 100).length;
  const medCount     = rows.filter(r => r.count > 100 && r.count <= 200).length;

  function coverageTier(count) {
    if (count === 0)   return "none";
    if (count <= 100)  return "low";
    if (count <= 200)  return "medium";
    return "good";
  }
  function coverageColor(count) {
    if (count === 0)   return "#E53E3E";
    if (count <= 100)  return SAFFRON;
    if (count <= 200)  return "#F59E0B";
    return IND_GREEN;
  }
  function coverageLabel(count) {
    if (count === 0)   return "None";
    if (count <= 100)  return "Low";
    if (count <= 200)  return "Medium";
    return "Good";
  }

  // Gap to next tier
  function gapToNext(count) {
    if (count === 0)         return { gap: 1,       label: "+1 to Low" };
    if (count <= 100)        return { gap: 101 - count, label: `+${101 - count} to Medium` };
    if (count <= 200)        return { gap: 201 - count, label: `+${201 - count} to Good` };
    return null; // already Good
  }

  // Podium accent colors for top 3
  const podiumColors = ["#F5A623", "#A8A9AD", "#CD7F32"];

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
    { id:"medium", label:"Medium", color:"#F59E0B",   count: medCount     },
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
            { count:medCount,     color:"#F59E0B" },
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
            { label:"Medium", count:medCount,     color:"#F59E0B" },
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
          { label:"None (0)",         color:"#E53E3E" },
          { label:"Low (1–100)",      color:SAFFRON   },
          { label:"Medium (101–200)", color:"#F59E0B" },
          { label:"Good (200+)",      color:IND_GREEN },
        ].map(({ label, color }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />
            <span style={{ fontSize:10, color:th.textMid }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Search + sort controls */}
      <div style={{ display:"flex", gap:8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍  Search state…"
          style={{
            flex:1, padding:"9px 12px", borderRadius:10,
            border:`1.5px solid ${th.border}`, background:th.inputBg,
            color:th.text, fontSize:12, outline:"none", fontFamily:"inherit",
          }}
        />
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

      {/* Results count */}
      <div style={{ fontSize:11, color:th.textSub, fontWeight:600, marginTop:-4 }}>
        Showing {filtered.length} of {rows.length} states
      </div>

      {/* State rows */}
      <div style={{
        background:th.card, border:`1.5px solid ${th.border}`,
        borderRadius:16, overflow:"hidden",
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding:"24px 0", textAlign:"center", color:th.textSub, fontSize:13 }}>
            No states match your filter
          </div>
        ) : (
          filtered.map(({ name, count }, idx) => {
            const color       = coverageColor(count);
            const pct         = Math.round((count / maxCount) * 100);
            const isTopThree  = sortMode === "count" && tierFilter === "all" && idx < 3;
            const podiumColor = isTopThree ? podiumColors[idx] : null;
            const gap         = gapToNext(count);
            return (
              <div key={name} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${th.border}` : "none",
                borderLeft: podiumColor ? `3px solid ${podiumColor}` : "3px solid transparent",
                background: isTopThree
                  ? (dark ? `${podiumColor}0f` : `${podiumColor}08`)
                  : "transparent",
              }}>

                {/* Rank or pin */}
                <div style={{
                  width:20, flexShrink:0, textAlign:"center",
                  fontSize: sortMode === "count" ? 10 : 13,
                  fontWeight:800,
                  color: podiumColor || th.textSub,
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
                    background: podiumColor
                      ? `linear-gradient(90deg,${podiumColor},${podiumColor}bb)`
                      : `linear-gradient(90deg,${color},${color}cc)`,
                    transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>

                {/* Count */}
                <div style={{
                  width:38, flexShrink:0, textAlign:"right",
                  fontSize:13, fontWeight:800,
                  color: podiumColor || color,
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

function ReportsSection({ reports, loading, dark, onRefresh, onStatusChange }) {
  const th = THEME[dark ? "dark" : "light"];
  const [filter, setFilter] = useState("all");      // "all" | "open" | "in_progress" | "resolved"
  const [typeFilter, setTypeFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);   // expanded report id

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
    const list = reports.filter(r => {
      const matchStatus = filter === "all" || r.status === filter;
      const matchType   = typeFilter === "all" || r.type === typeFilter;
      return matchStatus && matchType;
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
  }, [reports, filter, typeFilter]);

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
    <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Summary stats */}
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

      {/* Refresh button */}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <div onClick={onRefresh} style={{
          padding:"7px 14px", borderRadius:10, fontSize:11,
          fontWeight:700, cursor:"pointer",
          background:th.card, border:`1.5px solid ${th.border}`, color:th.textMid,
          display:"flex", alignItems:"center", gap:5,
        }}>
          ↻ Refresh
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
            {filter === "all" ? "Users haven't submitted any reports yet." : `No ${filter} reports.`}
          </div>
        </div>
      )}

      {/* Report cards — grouped by status */}
      {filtered.map((report, idx) => {
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
        const prevReport   = filtered[idx - 1];
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
              <div style={{ borderTop:`1px solid ${th.border}`, padding:"14px 16px", display:"flex", flexDirection:"column", gap:12 }}>

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
              </div>
            )}
          </div>
          </React.Fragment>
        );
      })}

      <div style={{ height:8 }} />
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function AdminDashboard({ onClose, dark = false }) {
  const th = THEME[dark ? "dark" : "light"];

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
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [exportModal,   setExportModal]   = useState(false);
  const [exportStep,    setExportStep]    = useState(-1);
  const [exportDone,    setExportDone]    = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0));
      setUsers(data);
    } catch (err) {
      setError("Failed to load users. Check Firestore rules.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  // ── Fetch Reports ─────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const snap = await getDocs(collection(db, "reports"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReports(data);
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

    const occData = Object.entries(byOcc).sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: `${OCC_EMOJI[key] || ""} ${OCC_LABELS[key] || key}`, value,
      }));

    const incData = Object.entries(byInc)
      .map(([key, value]) => ({ label: INC_LABELS[key] || key, value }));

    const areaData = Object.entries(byArea)
      .map(([key, value]) => ({ label: AREA_LABELS[key] || key, value }));

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

    return {
      topStates, occData, incData, areaData, ageData,
      occDonut, areaDonut,
      activeToday, activeWeek, newThisWeek, weekGrowth,
      googleUsers, withPhone, statesCount, housedUsers, needHousing, spark,
      genderData, rationData, maritalData, disabData,
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

  // ── Full Dashboard PDF Export (all sections, single button) ───────────────
  const exportAllPDF = useCallback(() => {
    const date = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
    const now  = Date.now();

    // ── Helpers ───────────────────────────────────────────────────────────
    function summaryTable(rows) {
      return `<table class="sum-tbl"><tbody>
        ${rows.map(([k, v]) =>
          `<tr><td class="sum-key">${k}</td><td class="sum-val">${v}</td></tr>`
        ).join("")}
      </tbody></table>`;
    }

    function dataTable(headers, rows) {
      return `<table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((r, i) =>
            `<tr style="background:${i % 2 === 0 ? "#fff" : "#f8f9fa"}">
              ${r.map(v => `<td>${v ?? "—"}</td>`).join("")}
            </tr>`
          ).join("")}
        </tbody>
      </table>`;
    }

    function breakdownBlock(title, entries) {
      const total = entries.reduce((s, [, v]) => s + v, 0);
      return `<div class="breakdown">
        <div class="bd-title">${title}</div>
        <table>
          <thead><tr><th>Category</th><th>Count</th><th>%</th></tr></thead>
          <tbody>
            ${entries.sort((a, b) => b[1] - a[1]).map(([k, v], i) =>
              `<tr style="background:${i % 2 === 0 ? "#fff" : "#f8f9fa"}">
                <td>${k}</td><td>${v}</td>
                <td>${total ? Math.round(v / total * 100) + "%" : "—"}</td>
              </tr>`
            ).join("")}
          </tbody>
        </table>
      </div>`;
    }

    // ── SECTION 1: Overview ───────────────────────────────────────────────
    const activeToday = users.filter(u => u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < 86400000).length;
    const activeWeek  = users.filter(u => u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < 7 * 86400000).length;
    const newThisWeek = users.filter(u => u.createdAt?.seconds && (now - u.createdAt.seconds * 1000) < 7 * 86400000).length;
    const withPhone   = users.filter(u => u.phone).length;
    const withEmail   = users.filter(u => u.email).length;
    const openRep     = reports.filter(r => r.status === "open").length;
    const inProgRep   = reports.filter(r => r.status === "in_progress").length;
    const resolvedRep = reports.filter(r => r.status === "resolved").length;

    const overviewHTML = `
      <div class="section">
        <div class="section-title">📊 Overview — Key Metrics</div>
        <div class="two-col">
          ${summaryTable([
            ["👥 Total Users",        users.length],
            ["🟢 Active Today",        activeToday],
            ["📅 Active This Week",    activeWeek],
            ["🆕 Joined This Week",    newThisWeek],
            ["📱 Users with Phone",    withPhone],
            ["✉️ Users with Email",    withEmail],
          ])}
          ${summaryTable([
            ["📬 Total Reports",       reports.length],
            ["🔴 Open",                openRep],
            ["🟡 In Progress",         inProgRep],
            ["✅ Resolved",             resolvedRep],
          ])}
        </div>
      </div>`;

    // ── SECTION 2: Analytics ──────────────────────────────────────────────
    const byOcc     = groupBy(users, "occupation");
    const byInc     = groupBy(users, "income");
    const byAge     = groupBy(users, "age");
    const byArea    = groupBy(users, "area");
    const byGender  = groupBy(users, "gender");
    const byRation  = groupBy(users, "ration");
    const byMarital = groupBy(users, "marital");
    const byDisab   = groupBy(users, "disability");
    const byState   = groupBy(users, "state");

    const analyticsHTML = `
      <div class="section page-break">
        <div class="section-title">🧮 Analytics Breakdown</div>
        <div class="two-col">
          ${breakdownBlock("💼 Occupation",    Object.entries(byOcc).map(([k, v])    => [OCC_LABELS[k]    || k, v]))}
          ${breakdownBlock("💰 Income Range",  Object.entries(byInc).map(([k, v])    => [INC_LABELS[k]    || k, v]))}
        </div>
        <div class="two-col">
          ${breakdownBlock("🎂 Age Group",     Object.entries(byAge).map(([k, v])    => [AGE_LABELS[k]    || k, v]))}
          ${breakdownBlock("🏘️ Area Type",     Object.entries(byArea).map(([k, v])   => [AREA_LABELS[k]   || k, v]))}
        </div>
        <div class="two-col">
          ${breakdownBlock("⚧ Gender",         Object.entries(byGender).map(([k, v]) => [GENDER_LABELS[k]?.replace(/[👨👩🧑]/gu,"").trim()   || k, v]))}
          ${breakdownBlock("🪪 Ration Card",    Object.entries(byRation).map(([k, v]) => [RATION_LABELS[k]?.replace(/[🚫🟡🔴]/gu,"").trim()   || k, v]))}
        </div>
        <div class="two-col">
          ${breakdownBlock("💍 Marital Status", Object.entries(byMarital).map(([k, v])=> [MARITAL_LABELS[k]?.replace(/[💍🕊️]/gu,"").trim()    || k, v]))}
          ${breakdownBlock("♿ Disability",      Object.entries(byDisab).map(([k, v])  => [DISAB_LABELS[k]?.replace(/[✅🦽👁🦻🧠]/gu,"").trim() || k, v]))}
        </div>
        <div class="sub-title" style="margin-top:10px">📍 All States Distribution</div>
        ${dataTable(
          ["State", "Users", "%"],
          Object.entries(byState).sort((a, b) => b[1] - a[1]).map(([st, cnt]) =>
            [st, cnt, users.length ? Math.round(cnt / users.length * 100) + "%" : "—"]
          )
        )}
      </div>`;

    // ── SECTION 3: All Users ──────────────────────────────────────────────
    const uHeaders = [
      "Name","Phone","Email","Gender","Age","Marital",
      "State","Area","Occupation","Income","House","Ration","Disability","Children","Joined","Last Seen",
    ];
    const uRows = users.map(u => [
      u.name    || "—",
      u.phone   || "—",
      u.email   || "—",
      GENDER_LABELS[u.gender]?.replace(/[👨👩🧑]/gu,"").trim()         || u.gender      || "—",
      AGE_LABELS[u.age]                                                  || u.age         || "—",
      MARITAL_LABELS[u.marital]?.replace(/[💍🕊️]/gu,"").trim()        || u.marital     || "—",
      u.state   || "—",
      AREA_LABELS[u.area]                                                || u.area        || "—",
      OCC_LABELS[u.occupation]                                           || u.occupation  || "—",
      INC_LABELS[u.income]                                               || u.income      || "—",
      HOUSE_LABELS[u.house]?.replace(/[✅❌]/gu,"").trim()              || u.house       || "—",
      RATION_LABELS[u.ration]?.replace(/[🚫🟡🔴]/gu,"").trim()        || u.ration      || "—",
      DISAB_LABELS[u.disability]?.replace(/[✅🦽👁🦻🧠]/gu,"").trim()  || u.disability  || "—",
      CHILDREN_LABELS[u.numChildren]                                     || u.numChildren || "—",
      formatDate(u.createdAt),
      formatDate(u.lastSeen),
    ]);

    const usersHTML = `
      <div class="section page-break">
        <div class="section-title">👥 All Users <span class="badge">${users.length}</span></div>
        ${dataTable(uHeaders, uRows)}
      </div>`;

    // ── SECTION 4: Activity ───────────────────────────────────────────────
    const recentActive = [...users]
      .filter(u => u.lastSeen?.seconds)
      .sort((a, b) => (b.lastSeen.seconds || 0) - (a.lastSeen.seconds || 0))
      .slice(0, 20);
    const newWeekUsers = users.filter(u => u.createdAt?.seconds &&
      (now - u.createdAt.seconds * 1000) < 7 * 86400000);

    const activityHTML = `
      <div class="section page-break">
        <div class="section-title">🕐 Activity</div>
        <div class="sub-title">Recent Activity — Last 20 Active Users</div>
        ${dataTable(
          ["Name", "State", "Occupation", "Last Seen"],
          recentActive.map(u => [
            u.name || "—", u.state || "—",
            OCC_LABELS[u.occupation] || u.occupation || "—",
            formatDate(u.lastSeen),
          ])
        )}
        <div class="sub-title" style="margin-top:14px">🆕 Joined This Week <span class="badge">${newWeekUsers.length}</span></div>
        ${newWeekUsers.length === 0
          ? `<div style="color:#999;padding:8px 0">No new users this week.</div>`
          : dataTable(
              ["Name", "State", "Occupation", "Joined"],
              newWeekUsers.map(u => [
                u.name || "—", u.state || "—",
                OCC_LABELS[u.occupation] || u.occupation || "—",
                formatDate(u.createdAt),
              ])
            )
        }
      </div>`;

    // ── SECTION 5: Schemes Coverage ───────────────────────────────────────
    const allSchemes   = Array.isArray(SCHEME_DB) ? SCHEME_DB : Object.values(SCHEME_DB || {});
    const centralCnt   = allSchemes.filter(s => s.scope === "national").length;
    const stSchCounts  = {};
    allSchemes.forEach(s => {
      if (s.scope === "state" && s.state) stSchCounts[s.state] = (stSchCounts[s.state] || 0) + 1;
    });
    const stateList = Array.isArray(INDIA_STATES) ? INDIA_STATES : Object.values(INDIA_STATES || {});
    const schemeRows = stateList
      .map(st => {
        const cnt   = stSchCounts[st] || 0;
        const level = cnt === 0 ? "None" : cnt <= 2 ? "Low" : cnt <= 5 ? "Medium" : "Good";
        return [st, cnt, level];
      })
      .sort((a, b) => b[1] - a[1]);

    const schemesHTML = `
      <div class="section page-break">
        <div class="section-title">🗺️ Schemes Coverage</div>
        ${summaryTable([
          ["🇮🇳 Central Schemes",       centralCnt],
          ["📋 Total Schemes",           allSchemes.length],
          ["✅ States with Schemes",     stateList.filter(s => stSchCounts[s]).length],
          ["🔴 States with 0 Schemes",  stateList.filter(s => !stSchCounts[s]).length],
        ])}
        <div class="sub-title" style="margin-top:12px">State-wise Scheme Count</div>
        ${dataTable(["State", "Schemes", "Coverage Level"], schemeRows)}
      </div>`;

    // ── SECTION 6: Reports ────────────────────────────────────────────────
    const rRows = reports.map(r => [
      r.userName || r.userEmail || "—",
      TYPE_META[r.type]?.label    || r.type   || "—",
      STATUS_META[r.status]?.label || r.status || "—",
      (r.message || "—").slice(0, 100) + ((r.message || "").length > 100 ? "…" : ""),
      formatDate(r.createdAt),
      formatDate(r.updatedAt || r.createdAt),
    ]);

    const reportsHTML = `
      <div class="section page-break">
        <div class="section-title">📬 Reports / Queries <span class="badge">${reports.length}</span></div>
        ${dataTable(["User","Type","Status","Message (preview)","Submitted","Updated"], rRows)}
      </div>`;

    // ── Assemble ──────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Yojana Sahay — Full Admin Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 9px; color: #111; padding: 16px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; border-bottom:3px solid #003580; padding-bottom:10px; }
    .brand { font-size:20px; font-weight:900; color:#003580; }
    .brand span { color:#FF9933; }
    .meta { font-size:9px; color:#666; text-align:right; line-height:1.7; }
    .section { margin-bottom:22px; }
    .section-title { font-size:12px; font-weight:800; color:#003580; margin-bottom:8px; border-left:4px solid #FF9933; padding-left:8px; }
    .sub-title { font-size:10px; font-weight:700; color:#444; margin-bottom:6px; }
    .badge { display:inline-block; background:#003580; color:#fff; font-size:8px; font-weight:700; padding:2px 8px; border-radius:10px; margin-left:6px; vertical-align:middle; }
    .two-col { display:flex; gap:14px; margin-bottom:10px; }
    .two-col > * { flex:1; min-width:0; }
    .breakdown { margin-bottom:4px; }
    .bd-title { font-size:9px; font-weight:700; color:#444; margin-bottom:4px; }
    .sum-tbl { width:100%; border-collapse:collapse; margin-bottom:4px; }
    .sum-key { font-size:9px; color:#666; padding:4px 6px; border-bottom:1px solid #eee; }
    .sum-val { font-size:10px; font-weight:800; color:#003580; padding:4px 6px; border-bottom:1px solid #eee; text-align:right; }
    table { width:100%; border-collapse:collapse; margin-bottom:6px; }
    th { background:#003580; color:#fff; padding:5px 4px; text-align:left; font-size:8px; font-weight:700; white-space:nowrap; }
    td { padding:4px 4px; border-bottom:1px solid #eee; vertical-align:top; word-break:break-word; font-size:8px; }
    .footer { margin-top:16px; font-size:8px; color:#999; text-align:center; border-top:1px solid #eee; padding-top:8px; }
    .page-break { page-break-before: always; }
    @media print {
      body { padding:8px; }
      @page { size: A4 landscape; margin:10mm; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Yojana<span>Setu</span></div>
      <div style="font-size:9px;color:#666;margin-top:3px;">Admin Full Report — Confidential</div>
    </div>
    <div class="meta">
      <div><strong>Generated:</strong> ${date}</div>
      <div><strong>Users:</strong> ${users.length} &nbsp;·&nbsp; <strong>Reports:</strong> ${reports.length}</div>
      <div style="color:#DC2626;font-weight:700;margin-top:2px;">Confidential — Do not share</div>
    </div>
  </div>

  ${overviewHTML}
  ${analyticsHTML}
  ${usersHTML}
  ${activityHTML}
  ${schemesHTML}
  ${reportsHTML}

  <div class="footer">
    Yojana Sahay Admin Dashboard &nbsp;·&nbsp; ${date} &nbsp;·&nbsp;
    Sections: Overview · Analytics · Users · Activity · Schemes · Reports
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type:"text/html;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `yojanasetu_full_report_${new Date().toISOString().slice(0,10)}.html`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [users, reports]);

  // ── Export steps definition ────────────────────────────────────────────────
  const EXPORT_STEPS = useMemo(() => [
    { label: "Initializing export engine",               dur: 340 },
    { label: `Collecting ${users.length} user profiles`, dur: 520 },
    { label: "Building analytics breakdowns",            dur: 640 },
    { label: "Processing occupation & income data",      dur: 520 },
    { label: "Rendering full users table",               dur: 720 },
    { label: "Compiling activity feed",                  dur: 440 },
    { label: "Processing schemes coverage",              dur: 480 },
    { label: `Formatting ${reports.length} report${reports.length !== 1 ? "s" : ""}`, dur: 500 },
    { label: "Generating PDF structure & layout",        dur: 820 },
    { label: "Finalizing & compressing document",        dur: 580 },
  ], [users.length, reports.length]);

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
    exportAllPDF();

    // Reset state after a short delay
    setTimeout(() => { setExportStep(-1); setExportDone(false); }, 600);
  }, [EXPORT_STEPS, exportAllPDF]);

  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    ["overview",  "📊 Overview"],
    ["users",     "👥 Users"],
    ["analytics", "🧮 Analytics"],
    ["activity",  "🕐 Activity"],
    ["schemes",   "🗺️ Schemes"],
    ["reports",   "📬 Reports"],
    ["cleanup",   "🗑️ Cleanup"],
  ];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:th.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'Noto Sans',sans-serif",
      overflowY:"auto",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background:`linear-gradient(135deg,${NAVY} 0%,rgba(0,53,128,0.92) 60%,rgba(255,153,51,0.85) 100%)`,
        padding:"18px 18px 0", flexShrink:0,
        boxShadow:"0 4px 20px rgba(0,53,128,0.3)",
        position:"sticky", top:0, zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div onClick={onClose} style={{
            width:36, height:36, borderRadius:10,
            background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:16, flexShrink:0,
          }}>←</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800 }}>
              🛡️ Admin Dashboard
            </div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:2 }}>
              Yojana Sahay · {loading ? "Loading…" : `${users.length} users`}
            </div>
          </div>
          {/* Refresh */}
          <div onClick={() => fetchUsers(true)} style={{
            background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)",
            borderRadius:10, padding:"7px 10px",
            color:"#fff", fontSize:12, cursor:"pointer",
            opacity: refreshing ? 0.5 : 1,
          }}>
            {refreshing ? "…" : "↻"}
          </div>
          {/* Export All — single button for full dashboard PDF */}
          {!loading && (users.length > 0 || reports.length > 0) && (
            <div onClick={handleExportAll} style={{
              background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)",
              borderRadius:10, padding:"7px 12px",
              color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
              opacity: exportModal ? 0.5 : 1,
              pointerEvents: exportModal ? "none" : "auto",
              transition:"opacity 0.2s",
            }}>
              📄 Export All
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginTop:14, overflowX:"auto", paddingBottom:1 }}>
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
              <div key={id} onClick={() => setActiveSection(id)} style={{
                padding: STATUS_HINTS.length > 0 ? "7px 13px 20px" : "7px 13px",
                borderRadius:"20px 20px 0 0",
                fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0,
                background: activeSection === id
                  ? "rgba(255,255,255,0.22)"
                  : "rgba(255,255,255,0.08)",
                borderTop: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                borderLeft: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                borderRight: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                color: activeSection === id ? "#fff" : "rgba(255,255,255,0.6)",
                transition:"all 0.2s",
                marginBottom: activeSection === id ? -1 : 0,
                position:"relative",
              }}>
                {label}
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
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:12,
        }}>
          <div style={{ fontSize:32, animation:"spin 1s linear infinite" }}>⏳</div>
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

      {/* ══ OVERVIEW ══ */}
      {!loading && !error && activeSection === "overview" && (
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
              <div onClick={() => setActiveSection("users")} style={{
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
                Use "📄 Export All" in the header to download the full PDF.
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

          {/* Quick metrics */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard icon="🟢" label="Active Today" value={stats.activeToday} color={IND_GREEN} dark={dark} />
            <StatCard icon="📅" label="Active This Week" value={stats.activeWeek} color={VIOLET} dark={dark} />
          </div>

          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🕐 Recent Activity (last 15 active users)
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
            {users
              .filter(u => u.createdAt?.seconds &&
                (Date.now() - u.createdAt.seconds * 1000) < 7 * 86400000)
              .slice(0, 20)
              .map(u => <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />)
            }
            {stats.newThisWeek === 0 && (
              <div style={{ fontSize:12, color:th.textSub, padding:"12px 0" }}>
                No new users this week yet
              </div>
            )}
          </div>
        </div>
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
          onRefresh={fetchReports}
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
              } catch (err) {
                console.error("Status update failed:", err);
              }
            }
          }}
        />
      )}

      {/* ══ CLEANUP — Delete old resolved reports ══ */}
      {activeSection === "cleanup" && (
        <ResolvedReportsCleaner
          dark={dark}
          onDeleteDone={fetchReports}
        />
      )}

      {/* User Detail Drawer */}
      {selectedUser && (
        <UserDrawer user={selectedUser} dark={dark} onClose={() => setSelectedUser(null)} />
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

      <div style={{ height:32, flexShrink:0 }} />
    </div>
  );
}
