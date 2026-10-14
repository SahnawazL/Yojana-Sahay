/**
 * Yojana Sahay — UserReportsTab.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * See the LICENSE file in the project root for full license terms.
 */

// UserReportsTab.jsx — Yojana Sahay
// User-facing "My Reports" tab shown inside their profile screen.
// Reads from Firestore: collection("reports") where uid == currentUser.uid
// Shows: full conversation thread, status, admin replies, timestamps.

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "./firebase.js";
import {
  collection, query, where, orderBy, getDocs,
  doc, updateDoc, arrayUnion, serverTimestamp,
} from "firebase/firestore";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#f8f9fa",
    divider:"#f0f0f0",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e",
    divider:"#2c2c2e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";

// ─── METADATA ────────────────────────────────────────────────────────────────
const TYPE_META = {
  issue:          { icon:"🐛", color:"#DC2626" },
  scheme_request: { icon:"📋", color:NAVY      },
  query:          { icon:"❓", color:IND_GREEN },
  feedback:       { icon:"💡", color:SAFFRON   },
};

const STATUS_META = {
  open:        { emoji:"🔴", color:"#DC2626", bg:"#FEF2F2", darkBg:"rgba(220,38,38,0.15)"  },
  in_progress: { emoji:"🟡", color:"#D97706", bg:"#FFFBEB", darkBg:"rgba(217,119,6,0.15)"  },
  resolved:    { emoji:"✅", color:IND_GREEN,  bg:"#F0FDF4", darkBg:"rgba(19,136,8,0.15)"  },
};

// ─── STRINGS (bilingual) ──────────────────────────────────────────────────────
const STRINGS = {
  en: {
    title:         "My Reports",
    sub:           "Track your submitted reports & admin responses",
    refresh:       "Refresh",
    loading:       "Loading your reports…",
    empty:         "No reports yet",
    emptySub:      "You haven't submitted any reports or queries yet.",
    newReport:     "+ New Report",
    statusLabel:   { open:"Open", in_progress:"In Progress", resolved:"Resolved" },
    typeLabel:     {
      issue:"Bug / Issue", scheme_request:"Scheme Request",
      query:"Query", feedback:"Feedback",
    },
    thread:        "Conversation",
    you:           "You",
    admin:         "Yojana Sahay Team",
    noReply:       "Waiting for admin response…",
    submitted:     "Submitted",
    replied:       "Replied",
    filterAll:     "All",
    filterOpen:    "Open",
    filterProg:    "In Progress",
    filterDone:    "Resolved",
    errLoad:       "Failed to load reports. Tap refresh to try again.",
    awaitingTip:   "We'll notify you by email once the team responds.",
    resolvedTip:   "This report has been resolved. Tap below to submit a new one if needed.",
    inProgTip:     "Our team is actively working on this.",
    addInfoTitle:    "Add More Information",
    addInfoSub:      "The team needs specific details — please add them below.",
    addInfoPh:       "Add the specific details requested by the team… (required)",
    addInfoBtn:      "Submit Information →",
    addInfoSending:  "Submitting…",
    addInfoDone:     "Information Submitted ✓",
    addInfoDoneSub:  "Our team will review your details and update the report.",
    addInfoLocked:   "Information Already Submitted",
    addInfoLockedSub:"You've already added information to this report.",
    addInfoMinChars: (n) => `Minimum ${n} characters required`,
  },
  hi: {
    title:         "मेरी रिपोर्ट",
    sub:           "अपनी रिपोर्ट और एडमिन के जवाब यहाँ देखें",
    refresh:       "रिफ्रेश",
    loading:       "रिपोर्ट लोड हो रही हैं…",
    empty:         "कोई रिपोर्ट नहीं",
    emptySub:      "आपने अभी तक कोई रिपोर्ट या सवाल नहीं भेजा।",
    newReport:     "+ नई रिपोर्ट",
    statusLabel:   { open:"खुली", in_progress:"प्रगति में", resolved:"हल हो गई" },
    typeLabel:     {
      issue:"बग / समस्या", scheme_request:"योजना अनुरोध",
      query:"सवाल", feedback:"सुझाव",
    },
    thread:        "बातचीत",
    you:           "आप",
    admin:         "Yojana Sahay टीम",
    noReply:       "एडमिन के जवाब का इंतज़ार है…",
    submitted:     "भेजी गई",
    replied:       "जवाब मिला",
    filterAll:     "सभी",
    filterOpen:    "खुली",
    filterProg:    "प्रगति में",
    filterDone:    "हल हुई",
    errLoad:       "रिपोर्ट लोड नहीं हुई। रिफ्रेश करें।",
    awaitingTip:   "जवाब मिलने पर आपको ईमेल से सूचित किया जाएगा।",
    resolvedTip:   "यह रिपोर्ट हल हो गई है। ज़रूरत हो तो नई रिपोर्ट भेजें।",
    inProgTip:     "हमारी टीम इस पर काम कर रही है।",
    addInfoTitle:    "अतिरिक्त जानकारी जोड़ें",
    addInfoSub:      "टीम को कुछ विशेष जानकारी चाहिए — नीचे लिखें।",
    addInfoPh:       "टीम द्वारा मांगी गई विशेष जानकारी यहाँ लिखें… (अनिवार्य)",
    addInfoBtn:      "जानकारी भेजें →",
    addInfoSending:  "भेजा जा रहा है…",
    addInfoDone:     "जानकारी भेजी गई ✓",
    addInfoDoneSub:  "हमारी टीम जल्द ही आपकी रिपोर्ट अपडेट करेगी।",
    addInfoLocked:   "जानकारी पहले ही भेजी जा चुकी है",
    addInfoLockedSub:"आपने इस रिपोर्ट में पहले ही जानकारी जोड़ी है।",
    addInfoMinChars: (n) => `कम से कम ${n} अक्षर अनिवार्य`,
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(ts, lang = "en") {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day:"numeric", month:"short", year:"numeric",
  });
}

function formatDateTime(ts, lang = "en") {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
    day:"numeric", month:"short", year:"2-digit",
    hour:"2-digit", minute:"2-digit",
  });
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── STATUS PROGRESS — PREMIUM ANIMATED ──────────────────────────────────────
function StatusProgress({ status, dark, lang }) {
  const th = THEME[dark ? "dark" : "light"];

  // Per-status color palette
  const CFG = {
    open:        { c1:"#DC2626", c2:"#ff6b6b", glow:"220,38,38",   label:lang==="hi"?"खुली":"Open"        },
    in_progress: { c1:"#D97706", c2:"#FBBF24", glow:"217,119,6",   label:lang==="hi"?"प्रगति में":"In Progress" },
    resolved:    { c1:"#059669", c2:"#34d399", glow:"5,150,105",    label:lang==="hi"?"हल हुई":"Resolved"  },
  };
  const cfg = CFG[status] || CFG.open;
  const activeIdx = status==="resolved" ? 2 : status==="in_progress" ? 1 : 0;

  const steps = [
    { key:"submitted",   iconDone:"✓",  iconPend:"📬", labelEn:"Submitted",  labelHi:"भेजी गई"     },
    { key:"in_progress", iconDone:"✓",  iconPend:"🔍", labelEn:"In Review",  labelHi:"समीक्षा में"  },
    { key:"resolved",    iconDone:"✓",  iconPend:"🏁", labelEn:"Resolved",   labelHi:"हल हुई"      },
  ];

  // Track fill: each step center at 16.67%, 50%, 83.33%.
  // Track runs left=16.67% → right=16.67% (width=66.66%).
  // Fill covers 0, 1, or 2 of those 33.33%-wide segments.
  const fillPct = ["0%","33.33%","66.66%"][activeIdx];

  const css = `
    @keyframes sp-pulse {
      0%,100% { box-shadow: 0 0 0 0px rgba(${cfg.glow},0.55), 0 0 0 6px rgba(${cfg.glow},0.18); }
      50%      { box-shadow: 0 0 0 5px rgba(${cfg.glow},0.22), 0 0 0 11px rgba(${cfg.glow},0.07); }
    }
    @keyframes sp-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes sp-pop {
      0%   { transform: scale(0.55); opacity:0; }
      60%  { transform: scale(1.18); }
      80%  { transform: scale(0.94); }
      100% { transform: scale(1);    opacity:1; }
    }
    @keyframes sp-fadein {
      from { opacity:0; transform:translateY(4px); }
      to   { opacity:1; transform:translateY(0);   }
    }
    @keyframes sp-spin {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }
    .sp-active-ring {
      animation: sp-pulse 2.2s ease-in-out infinite;
    }
    .sp-icon-pop {
      animation: sp-pop 0.45s cubic-bezier(0.22,1,0.36,1) both;
    }
    .sp-label-in {
      animation: sp-fadein 0.4s ease both;
    }
  `;

  return (
    <>
      <style>{css}</style>

      {/* ── Outer card ── */}
      <div style={{
        borderRadius: 18,
        padding: "18px 16px 16px",
        background: dark
          ? `linear-gradient(145deg,rgba(${cfg.glow},0.10),rgba(${cfg.glow},0.04))`
          : `linear-gradient(145deg,rgba(${cfg.glow},0.06),rgba(${cfg.glow},0.01))`,
        border: `1.5px solid rgba(${cfg.glow},0.22)`,
        boxShadow: `0 4px 24px rgba(${cfg.glow},0.10)`,
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}>

        {/* Subtle top shimmer line */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"18px 18px 0 0",
          background:`linear-gradient(90deg,transparent,${cfg.c1},${cfg.c2},transparent)`,
          opacity: 0.7,
        }} />

        {/* Header row: icon + label + badge */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom: 20,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{
              width:28, height:28, borderRadius:8,
              background:`linear-gradient(135deg,${cfg.c1},${cfg.c2})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, boxShadow:`0 3px 10px rgba(${cfg.glow},0.4)`,
            }}>
              {status==="resolved" ? "✅" : status==="in_progress" ? "⏳" : "📬"}
            </div>
            <span style={{
              fontSize:11, fontWeight:800, color:th.text,
              letterSpacing:0.5, textTransform:"uppercase",
            }}>
              {lang==="hi" ? "स्थिति" : "Status"}
            </span>
          </div>

          {/* Live badge */}
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"4px 10px", borderRadius:20,
            background:`linear-gradient(135deg,${cfg.c1},${cfg.c2})`,
            boxShadow:`0 3px 12px rgba(${cfg.glow},0.35)`,
          }}>
            {status==="in_progress" && (
              <div style={{
                width:6, height:6, borderRadius:"50%", background:"#fff",
                animation:"sp-spin 1s linear infinite",
                flexShrink:0,
              }} />
            )}
            <span style={{ fontSize:10, fontWeight:800, color:"#fff", letterSpacing:0.3 }}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* ── Stepper row ── */}
        <div style={{ position:"relative" }}>

          {/* Grey track */}
          <div style={{
            position:"absolute", top:20, left:"16.67%", right:"16.67%",
            height:5, borderRadius:99,
            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }} />

          {/* Filled track with shimmer */}
          <div style={{
            position:"absolute", top:20, left:"16.67%",
            width: fillPct,
            height:5, borderRadius:99,
            background:`linear-gradient(90deg,${cfg.c1} 0%,${cfg.c2} 50%,${cfg.c1} 100%)`,
            backgroundSize:"200% 100%",
            animation: activeIdx > 0 ? "sp-shimmer 2.5s linear infinite" : "none",
            boxShadow:`0 0 10px rgba(${cfg.glow},0.5), 0 0 3px rgba(${cfg.glow},0.8)`,
            transition:"width 0.9s cubic-bezier(0.22,1,0.36,1)",
          }} />

          {/* Step nodes */}
          <div style={{ display:"flex", position:"relative", zIndex:2 }}>
            {steps.map((step, i) => {
              const done    = i <= activeIdx;
              const current = i === activeIdx;
              const future  = i > activeIdx;
              const label   = lang==="hi" ? step.labelHi : step.labelEn;

              return (
                <div key={step.key} style={{
                  flex:1, display:"flex", flexDirection:"column",
                  alignItems:"center", gap:8,
                }}>
                  {/* Node circle */}
                  <div
                    className={current ? "sp-active-ring" : ""}
                    style={{
                      width:40, height:40, borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0,
                      background: future
                        ? (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")
                        : `linear-gradient(135deg,${cfg.c1},${cfg.c2})`,
                      border: future
                        ? `2px dashed ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`
                        : `2px solid rgba(255,255,255,0.3)`,
                      boxShadow: done && !current
                        ? `0 3px 12px rgba(${cfg.glow},0.35)`
                        : "none",
                      transition:"all 0.5s cubic-bezier(0.22,1,0.36,1)",
                      position:"relative",
                    }}
                  >
                    {/* Inner content */}
                    {future ? (
                      /* Hollow ring */
                      <div style={{
                        width:10, height:10, borderRadius:"50%",
                        border:`2px solid ${dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
                      }} />
                    ) : current && status==="in_progress" ? (
                      /* Spinning ring for active in-progress */
                      <div style={{
                        width:18, height:18, borderRadius:"50%",
                        border:`3px solid rgba(255,255,255,0.3)`,
                        borderTopColor:"#fff",
                        animation:"sp-spin 0.9s linear infinite",
                      }} />
                    ) : (
                      /* Check mark */
                      <span className="sp-icon-pop" style={{
                        fontSize: 18, color:"#fff", fontWeight:900, lineHeight:1,
                      }}>
                        {current && status==="open" ? "●" : "✓"}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="sp-label-in" style={{
                    fontSize:10,
                    fontWeight: current ? 800 : done ? 600 : 400,
                    color: future
                      ? (dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)")
                      : current
                        ? cfg.c1
                        : (dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)"),
                    textAlign:"center",
                    lineHeight:1.3,
                    letterSpacing: current ? 0.2 : 0,
                  }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Congrats message for resolved ── */}
        {status === "resolved" && (
          <div className="sp-icon-pop" style={{
            marginTop:16,
            padding:"10px 14px",
            borderRadius:12,
            background: dark ? "rgba(5,150,105,0.15)" : "rgba(5,150,105,0.08)",
            border:`1px solid rgba(${cfg.glow},0.25)`,
            display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{ fontSize:18 }}>🎉</span>
            <span style={{ fontSize:11, fontWeight:700, color:cfg.c1, lineHeight:1.4 }}>
              {lang==="hi"
                ? "आपकी रिपोर्ट सफलतापूर्वक हल हो गई है!"
                : "Your report has been successfully resolved!"}
            </span>
          </div>
        )}

        {/* ── In Progress live message ── */}
        {status === "in_progress" && (
          <div style={{
            marginTop:16, padding:"10px 14px", borderRadius:12,
            background: dark ? "rgba(217,119,6,0.12)" : "rgba(217,119,6,0.07)",
            border:`1px solid rgba(${cfg.glow},0.22)`,
            display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{ fontSize:16, animation:"sp-spin 2s linear infinite", display:"inline-block" }}>⚙️</span>
            <span style={{ fontSize:11, fontWeight:700, color:cfg.c1, lineHeight:1.4 }}>
              {lang==="hi"
                ? "हमारी टीम इस पर सक्रिय रूप से काम कर रही है।"
                : "Our team is actively working on this."}
            </span>
          </div>
        )}

        {/* ── Open awaiting message ── */}
        {status === "open" && (
          <div style={{
            marginTop:16, padding:"10px 14px", borderRadius:12,
            background: dark ? "rgba(220,38,38,0.10)" : "rgba(220,38,38,0.05)",
            border:`1px solid rgba(${cfg.glow},0.20)`,
            display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{ fontSize:16 }}>📩</span>
            <span style={{ fontSize:11, fontWeight:700, color:cfg.c1, lineHeight:1.4 }}>
              {lang==="hi"
                ? "टीम का जवाब मिलने पर आपको ईमेल से सूचित किया जाएगा।"
                : "You'll be notified by email once our team responds."}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SINGLE CONVERSATION BUBBLE ───────────────────────────────────────────────
function ChatBubble({ who, text, time, statusTag, isReopen, dark, lang }) {
  const th    = THEME[dark ? "dark" : "light"];
  const isMe  = who === "user";
  const smeta = statusTag ? STATUS_META[statusTag] : null;

  // Reopen messages get special amber styling
  if (isReopen) {
    return (
      <div style={{ display:"flex", flexDirection:"row-reverse", gap:8, alignItems:"flex-end" }}>
        {/* Amber avatar */}
        <div style={{
          width:28, height:28, borderRadius:"50%", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13,
          background:"linear-gradient(135deg,#D97706,#FBBF24)",
          boxShadow:"0 2px 6px rgba(217,119,6,0.35)",
        }}>🔄</div>

        {/* Amber bubble */}
        <div style={{
          maxWidth:"78%",
          background: dark ? "rgba(217,119,6,0.14)" : "#FFFBEB",
          border:"1.5px dashed rgba(217,119,6,0.5)",
          borderRadius:"16px 4px 16px 16px",
          padding:"10px 13px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#D97706" }}>
              {lang === "hi" ? "आप" : "You"}
            </span>
            <span style={{
              fontSize:9, fontWeight:700, color:"#D97706",
              background: dark ? "rgba(217,119,6,0.2)" : "#FEF3C7",
              border:"1px solid rgba(217,119,6,0.4)",
              borderRadius:5, padding:"1px 6px",
            }}>
              🔄 {lang === "hi" ? "पुनः खोला" : "REOPENED BY YOU"}
            </span>
          </div>
          <div style={{ fontSize:10, color: dark ? "rgba(255,255,255,0.45)" : "#78350F", marginBottom:4, fontWeight:600 }}>
            {lang === "hi" ? "पुनः खोलने का कारण:" : "Reason for reopening:"}
          </div>
          <div style={{ fontSize:13, color:th.text, lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
            {text}
          </div>
          <div style={{ fontSize:9, color:th.textSub, marginTop:5, fontWeight:500, textAlign:"left" }}>
            {time}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display:"flex",
      flexDirection: isMe ? "row-reverse" : "row",
      gap:8, alignItems:"flex-end",
    }}>
      {/* Avatar */}
      <div style={{
        width:28, height:28, borderRadius:"50%", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:13,
        background: isMe
          ? `linear-gradient(135deg,${SAFFRON},#f97316)`
          : `linear-gradient(135deg,${NAVY},#1a56db)`,
        boxShadow:"0 2px 6px rgba(0,0,0,0.15)",
      }}>
        {isMe ? "👤" : "🛡️"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth:"78%",
        background: isMe
          ? (dark ? "rgba(255,153,51,0.18)" : "#FFF7ED")
          : (dark ? "rgba(0,53,128,0.22)"   : "#EFF6FF"),
        border:`1.5px solid ${isMe ? SAFFRON+"44" : NAVY+"33"}`,
        borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        padding:"10px 13px",
      }}>
        {/* Sender label + status tag */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
          <span style={{
            fontSize:10, fontWeight:800,
            color: isMe ? SAFFRON : NAVY,
          }}>
            {isMe
              ? (lang === "hi" ? "आप" : "You")
              : (lang === "hi" ? "Yojana Sahay टीम" : "Yojana Sahay Team")}
          </span>
          {smeta && (
            <span style={{
              fontSize:9, fontWeight:700, color:smeta.color,
              background: dark ? smeta.darkBg : smeta.bg,
              border:`1px solid ${smeta.color}55`,
              borderRadius:5, padding:"1px 6px",
            }}>
              {smeta.emoji} {STATUS_META[statusTag] ? (
                lang === "hi"
                  ? { open:"खुली", in_progress:"प्रगति में", resolved:"हल हुई" }[statusTag]
                  : { open:"Open", in_progress:"In Progress", resolved:"Resolved" }[statusTag]
              ) : statusTag}
            </span>
          )}
        </div>

        {/* Message text */}
        <div style={{
          fontSize:13, color:th.text, lineHeight:1.65,
          whiteSpace:"pre-wrap", wordBreak:"break-word",
        }}>
          {text}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize:9, color:th.textSub, marginTop:5,
          textAlign: isMe ? "left" : "right", fontWeight:500,
        }}>
          {time}
        </div>
      </div>
    </div>
  );
}

// ─── FULL CONVERSATION THREAD ─────────────────────────────────────────────────
function ConversationThread({ report, dark, lang }) {
  const th  = THEME[dark ? "dark" : "light"];
  const s   = STRINGS[lang] || STRINGS.en;
  const thread = [];

  // Original user message
  thread.push({
    key:    "original",
    who:    "user",
    text:   String(report.message || "").split(/\n*\[Auto-check\]/)[0].trim() || "—",
    time:   formatDateTime(report.createdAt, lang),
    status: null,
  });

  // All replies from replyHistory (admin OR user reopen entries)
  const history = Array.isArray(report.replyHistory) ? report.replyHistory : [];
  history.forEach((r, i) => {
    thread.push({
      key:      `reply-${i}`,
      who:      r.who === "user" ? "user" : "admin",
      text:     r.text || "—",
      time:     r.sentAt
                  ? formatDateTime({ seconds: new Date(r.sentAt).getTime() / 1000 }, lang)
                  : "—",
      status:   r.status || null,
      isReopen: r.isReopen || false,
    });
  });

  // If adminReply exists but replyHistory is empty (legacy data)
  if (history.length === 0 && report.adminReply) {
    thread.push({
      key:    "legacy-reply",
      who:    "admin",
      text:   report.adminReply,
      time:   formatDateTime(report.repliedAt, lang),
      status: "resolved",
    });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{
        fontSize:10, fontWeight:800, color:th.textSub,
        letterSpacing:0.5, marginBottom:2,
      }}>
        💬 {s.thread} ({thread.length})
      </div>

      {thread.map(msg => (
        <ChatBubble
          key={msg.key}
          who={msg.who}
          text={msg.text}
          time={msg.time}
          statusTag={msg.status}
          isReopen={msg.isReopen}
          dark={dark}
          lang={lang}
        />
      ))}

      {/* Awaiting reply indicator */}
      {history.length === 0 && !report.adminReply && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background: dark ? "rgba(255,255,255,0.04)" : th.card2,
          border:`1px dashed ${th.border}`,
          borderRadius:10, padding:"9px 12px",
          marginTop:2,
        }}>
          <div style={{ fontSize:16 }}>⏳</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:th.textMid, fontWeight:600 }}>
              {s.noReply}
            </div>
            <div style={{ fontSize:10, color:th.textSub, marginTop:2 }}>
              {s.awaitingTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORT CARD ──────────────────────────────────────────────────────────────
function ReportCard({ report, dark, lang, isExpanded, onToggle, onReopen }) {
  const th       = THEME[dark ? "dark" : "light"];
  const s        = STRINGS[lang] || STRINGS.en;
  const typeMeta = TYPE_META[report.type]   || { icon:"📝", color:NAVY };
  const stMeta   = STATUS_META[report.status] || STATUS_META.open;
  const typeLabel= s.typeLabel[report.type]  || report.type;
  const stLabel  = s.statusLabel[report.status] || report.status;
  const hasReply = !!(report.adminReply || (report.replyHistory?.length > 0));
  const replyCount = report.replyHistory?.length || (report.adminReply ? 1 : 0);
  const isReopened = report.replyHistory?.some(r => r.isReopen);

  // ── Reopen state ──
  const [showReopen,  setShowReopen]  = useState(false);
  const [reopenMsg,   setReopenMsg]   = useState("");
  const [reopening,   setReopening]   = useState(false);
  const [reopenDone,  setReopenDone]  = useState(false);
  const [reopenError, setReopenError] = useState("");
  const MIN_CHARS = 20;

  // ── Add-info state (open reports where admin requested more details) ──
  const [infoText,    setInfoText]    = useState("");
  const [infoSending, setInfoSending] = useState(false);
  const [infoDone,    setInfoDone]    = useState(false);
  const [infoError,   setInfoError]   = useState("");
  const INFO_MIN = 20;

  // Admin replied with open status (requesting more info)?
  const adminRequestedMoreInfo = report.replyHistory?.some(
    r => r.status === "open" && !r.isReopen
  ) ?? false;
  // User already submitted additional info once?
  const userAlreadyAddedInfo = report.replyHistory?.some(
    r => r.who === "user" && r.isInfoRequest === true
  ) ?? false;
  // Show the add-info section when open + admin replied + not yet done
  const canAddInfo = report.status === "open" && adminRequestedMoreInfo;

  async function handleAddInfo() {
    if (infoText.trim().length < INFO_MIN) {
      setInfoError(s.addInfoMinChars(INFO_MIN));
      return;
    }
    setInfoError("");
    setInfoSending(true);
    try {
      await updateDoc(doc(db, "reports", report.id), {
        replyHistory: arrayUnion({
          who:           "user",
          userName:      auth.currentUser?.displayName || "User",
          text:          infoText.trim(),
          sentAt:        new Date().toISOString(),
          isInfoRequest: true,
        }),
      });
      setInfoDone(true);
      setInfoText("");
      setTimeout(() => { onReopen?.(); }, 1600);
    } catch (err) {
      console.error("Add info failed:", err);
      setInfoError(lang === "hi"
        ? "कुछ गलत हुआ। दोबारा कोशिश करें।"
        : "Something went wrong. Please try again.");
    } finally {
      setInfoSending(false);
    }
  }

  async function handleReopen() {
    if (reopenMsg.trim().length < MIN_CHARS) {
      setReopenError(lang === "hi"
        ? `कम से कम ${MIN_CHARS} अक्षर लिखें।`
        : `Please write at least ${MIN_CHARS} characters.`);
      return;
    }
    setReopenError("");
    setReopening(true);
    try {
      await updateDoc(doc(db, "reports", report.id), {
        status:     "open",
        reopenedAt: serverTimestamp(),
        replyHistory: arrayUnion({
          who:      "user",
          userName: auth.currentUser?.displayName || "User",
          text:     reopenMsg.trim(),
          sentAt:   new Date().toISOString(),
          isReopen: true,
        }),
      });
      setReopenDone(true);
      setTimeout(() => {
        setShowReopen(false);
        setReopenDone(false);
        setReopenMsg("");
        onReopen?.();
      }, 1800);
    } catch (err) {
      console.error("Reopen failed:", err);
      setReopenError(lang === "hi"
        ? "कुछ गलत हुआ। दोबारा कोशिश करें।"
        : "Something went wrong. Please try again.");
    } finally {
      setReopening(false);
    }
  }

  return (
    <div style={{
      background: th.card,
      border:`1.5px solid ${isExpanded ? typeMeta.color : th.border}`,
      borderRadius:16, overflow:"hidden",
      boxShadow: isExpanded ? `0 6px 24px ${typeMeta.color}22` : "0 1px 4px rgba(0,0,0,0.06)",
      transition:"all 0.22s",
    }}>
      {/* ── Card Header ── */}
      <div
        onClick={onToggle}
        style={{
          padding:"14px 16px", cursor:"pointer",
          display:"flex", gap:12, alignItems:"flex-start",
        }}
      >
        {/* Type icon */}
        <div style={{
          width:40, height:40, borderRadius:12, flexShrink:0,
          background: dark ? `${typeMeta.color}22` : `${typeMeta.color}12`,
          border:`1.5px solid ${typeMeta.color}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18,
        }}>
          {typeMeta.icon}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Type + Status badges */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{
              fontSize:10, fontWeight:700, color:typeMeta.color,
              background: dark ? `${typeMeta.color}22` : `${typeMeta.color}12`,
              border:`1px solid ${typeMeta.color}33`,
              borderRadius:6, padding:"2px 7px",
            }}>
              {typeLabel}
            </span>
            <span style={{
              fontSize:10, fontWeight:700, color:stMeta.color,
              background: dark ? stMeta.darkBg : stMeta.bg,
              border:`1px solid ${stMeta.color}44`,
              borderRadius:6, padding:"2px 7px",
            }}>
              {stMeta.emoji} {stLabel}
            </span>
            {hasReply && (
              <span style={{
                fontSize:9, fontWeight:700, color:VIOLET,
                background: dark ? "rgba(139,92,246,0.15)" : "#F5F3FF",
                border:`1px solid ${VIOLET}44`,
                borderRadius:6, padding:"2px 7px",
              }}>
                💬 {replyCount} {lang === "hi" ? "जवाब" : replyCount === 1 ? "reply" : "replies"}
              </span>
            )}
            {isReopened && (
              <span style={{
                fontSize:9, fontWeight:700, color:"#D97706",
                background: dark ? "rgba(217,119,6,0.18)" : "#FFFBEB",
                border:"1px solid rgba(217,119,6,0.35)",
                borderRadius:6, padding:"2px 7px",
              }}>
                🔄 {lang === "hi" ? "पुनः खोला" : "Reopened"}
              </span>
            )}
          </div>

          {/* Subject / preview */}
          <div style={{
            fontSize:13, fontWeight:700, color:th.text,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            marginBottom:3,
          }}>
            {report.subject || report.message?.slice(0, 60) || "—"}
          </div>

          {/* Time */}
          <div style={{ fontSize:10, color:th.textSub }}>
            🕐 {timeAgo(report.createdAt)} · {formatDate(report.createdAt, lang)}
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{
          color:th.textSub, fontSize:16, flexShrink:0,
          transition:"transform 0.22s",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
        }}>›</div>
      </div>

      {/* ── Expanded Panel ── */}
      {isExpanded && (
        <div style={{
          borderTop:`1px solid ${th.border}`,
          padding:"14px 16px",
          display:"flex", flexDirection:"column", gap:14,
        }}>

          {/* Status progress bar */}
          <StatusProgress status={report.status} dark={dark} lang={lang} />

          {/* ── REOPEN SECTION (resolved only) ── */}
          {report.status === "resolved" && (
            <div>
              {isReopened ? (
                /* ── Already reopened once — permanently locked ── */
                <div style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"13px 16px", borderRadius:14,
                  background: dark ? "rgba(255,255,255,0.04)" : "#f8f9fa",
                  border:`1.5px solid ${dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background: dark ? "rgba(255,255,255,0.06)" : "#f0f0f0",
                    border:`1.5px solid ${dark ? "rgba(255,255,255,0.1)" : "#e0e0e0"}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
                  }}>🔒</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:800, color: dark ? "rgba(255,255,255,0.45)" : "#888" }}>
                      {lang === "hi" ? "पुनः खोलना उपलब्ध नहीं" : "Reopen Not Available"}
                    </div>
                    <div style={{ fontSize:11, color: dark ? "rgba(255,255,255,0.3)" : "#aaa", marginTop:3, lineHeight:1.5 }}>
                      {lang === "hi"
                        ? "यह रिपोर्ट पहले ही एक बार पुनः खोली जा चुकी है। नई समस्या के लिए नई रिपोर्ट दर्ज करें।"
                        : "This report has already been reopened once. For a new or related issue, please submit a new report."}
                    </div>
                  </div>
                </div>
              ) : !showReopen ? (
                /* Reopen trigger button */
                <div
                  onClick={() => { setShowReopen(true); setReopenMsg(""); setReopenError(""); }}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    padding:"11px 16px", borderRadius:14, cursor:"pointer",
                    border:"1.5px dashed rgba(217,119,6,0.5)",
                    background: dark ? "rgba(217,119,6,0.08)" : "rgba(217,119,6,0.05)",
                    transition:"all 0.18s",
                  }}
                >
                  <span style={{ fontSize:16 }}>🔄</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#D97706" }}>
                    {lang === "hi" ? "इस रिपोर्ट को पुनः खोलें" : "Reopen this Report"}
                  </span>
                </div>
              ) : reopenDone ? (
                /* Success state */
                <div style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"14px 16px", borderRadius:14,
                  background: dark ? "rgba(5,150,105,0.15)" : "#f0fdf4",
                  border:"1.5px solid rgba(5,150,105,0.3)",
                }}>
                  <span style={{ fontSize:22 }}>✅</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#059669" }}>
                      {lang === "hi" ? "रिपोर्ट पुनः खोली गई!" : "Report Reopened!"}
                    </div>
                    <div style={{ fontSize:11, color: dark ? "rgba(255,255,255,0.5)" : "#555", marginTop:2 }}>
                      {lang === "hi" ? "हमारी टीम जल्द ही जवाब देगी।" : "Our team will respond shortly."}
                    </div>
                  </div>
                </div>
              ) : (
                /* Reopen form */
                <div style={{
                  borderRadius:16,
                  border:"1.5px solid rgba(217,119,6,0.4)",
                  background: dark
                    ? "linear-gradient(145deg,rgba(217,119,6,0.10),rgba(217,119,6,0.04))"
                    : "linear-gradient(145deg,rgba(255,251,235,1),rgba(255,247,220,1))",
                  overflow:"hidden",
                  boxShadow:"0 4px 20px rgba(217,119,6,0.12)",
                }}>
                  {/* Form header */}
                  <div style={{
                    padding:"13px 16px 10px",
                    borderBottom:`1px solid rgba(217,119,6,0.18)`,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{
                        width:30, height:30, borderRadius:9,
                        background:"linear-gradient(135deg,#D97706,#FBBF24)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:15, boxShadow:"0 3px 10px rgba(217,119,6,0.35)",
                      }}>🔄</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:800, color: dark ? "#FBBF24" : "#92400E" }}>
                          {lang === "hi" ? "रिपोर्ट पुनः खोलें" : "Reopen Report"}
                        </div>
                        <div style={{ fontSize:10, color: dark ? "rgba(255,255,255,0.45)" : "#78350F", marginTop:1 }}>
                          {lang === "hi"
                            ? `कम से कम ${MIN_CHARS} अक्षर अनिवार्य`
                            : `Minimum ${MIN_CHARS} characters required`}
                        </div>
                      </div>
                    </div>
                    {/* Close */}
                    <div
                      onClick={() => { setShowReopen(false); setReopenError(""); }}
                      style={{
                        width:28, height:28, borderRadius:8, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:14, color: dark ? "rgba(255,255,255,0.4)" : "#78350F",
                        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      }}
                    >✕</div>
                  </div>

                  {/* Textarea */}
                  <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ position:"relative" }}>
                      <textarea
                        value={reopenMsg}
                        onChange={e => { setReopenMsg(e.target.value); setReopenError(""); }}
                        placeholder={lang === "hi"
                          ? "बताएं कि आप इस रिपोर्ट को क्यों पुनः खोलना चाहते हैं… (अनिवार्य)"
                          : "Explain why you want to reopen this report… (required)"}
                        rows={4}
                        maxLength={500}
                        style={{
                          width:"100%", boxSizing:"border-box",
                          padding:"12px 14px",
                          borderRadius:12,
                          border:`1.5px solid ${reopenError
                            ? "#DC2626"
                            : reopenMsg.length >= MIN_CHARS
                              ? "rgba(5,150,105,0.5)"
                              : "rgba(217,119,6,0.3)"}`,
                          background: dark ? "rgba(255,255,255,0.05)" : "#fff",
                          color: dark ? "#f0f0f0" : "#1a1a1a",
                          fontSize:13, lineHeight:1.65, resize:"none",
                          outline:"none",
                          transition:"border-color 0.18s",
                          fontFamily:"inherit",
                        }}
                      />
                      {/* Char counter */}
                      <div style={{
                        position:"absolute", bottom:10, right:12,
                        fontSize:10, fontWeight:600,
                        color: reopenMsg.length < MIN_CHARS
                          ? "#D97706"
                          : reopenMsg.length > 450
                            ? "#DC2626"
                            : "#059669",
                      }}>
                        {reopenMsg.length}/500
                      </div>
                    </div>

                    {/* Progress bar showing min char progress */}
                    <div style={{ height:3, borderRadius:99, background: dark ? "rgba(255,255,255,0.08)" : "#e5e7eb", overflow:"hidden" }}>
                      <div style={{
                        height:"100%", borderRadius:99,
                        width:`${Math.min((reopenMsg.trim().length / MIN_CHARS) * 100, 100)}%`,
                        background: reopenMsg.trim().length >= MIN_CHARS
                          ? "linear-gradient(90deg,#059669,#34d399)"
                          : "linear-gradient(90deg,#D97706,#FBBF24)",
                        transition:"width 0.2s, background 0.3s",
                      }} />
                    </div>

                    {/* Error */}
                    {reopenError && (
                      <div style={{
                        fontSize:11, color:"#DC2626", fontWeight:600,
                        display:"flex", alignItems:"center", gap:5,
                      }}>
                        ⚠️ {reopenError}
                      </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display:"flex", gap:10 }}>
                      <div
                        onClick={() => { setShowReopen(false); setReopenError(""); setReopenMsg(""); }}
                        style={{
                          flex:1, padding:"11px", borderRadius:12, textAlign:"center",
                          fontSize:12, fontWeight:700, cursor:"pointer",
                          border:`1.5px solid rgba(217,119,6,0.3)`,
                          color:"#D97706",
                          background: dark ? "rgba(217,119,6,0.08)" : "rgba(217,119,6,0.06)",
                        }}
                      >
                        {lang === "hi" ? "रद्द करें" : "Cancel"}
                      </div>
                      <div
                        onClick={!reopening ? handleReopen : undefined}
                        style={{
                          flex:2, padding:"11px", borderRadius:12, textAlign:"center",
                          fontSize:12, fontWeight:800, cursor: reopening ? "not-allowed" : "pointer",
                          background: reopenMsg.trim().length >= MIN_CHARS && !reopening
                            ? "linear-gradient(135deg,#D97706,#FBBF24)"
                            : dark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
                          color: reopenMsg.trim().length >= MIN_CHARS && !reopening
                            ? "#fff"
                            : dark ? "rgba(255,255,255,0.3)" : "#aaa",
                          boxShadow: reopenMsg.trim().length >= MIN_CHARS && !reopening
                            ? "0 4px 14px rgba(217,119,6,0.4)" : "none",
                          transition:"all 0.2s",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        }}
                      >
                        {reopening ? (
                          <>
                            <div style={{
                              width:12, height:12, borderRadius:"50%",
                              border:"2px solid rgba(255,255,255,0.4)",
                              borderTopColor:"#fff",
                              animation:"sp-spin 0.8s linear infinite",
                            }} />
                            {lang === "hi" ? "भेजा जा रहा है…" : "Submitting…"}
                          </>
                        ) : (
                          `🔄 ${lang === "hi" ? "पुनः खोलें" : "Reopen Report"}`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full conversation thread */}
          <ConversationThread report={report} dark={dark} lang={lang} />

          {/* ── ADD MORE INFO SECTION (open + admin replied with open status) ── */}
          {canAddInfo && (
            <div style={{
              borderRadius:16,
              border:`1.5px solid ${userAlreadyAddedInfo ? th.border : NAVY + "55"}`,
              background: userAlreadyAddedInfo
                ? (dark ? "rgba(255,255,255,0.03)" : th.card2)
                : (dark ? "rgba(0,53,128,0.12)" : "#EFF6FF"),
              overflow:"hidden",
            }}>
              {/* Header */}
              <div style={{
                padding:"12px 16px 10px",
                borderBottom:`1px solid ${userAlreadyAddedInfo ? th.border : NAVY + "22"}`,
                display:"flex", alignItems:"center", gap:10,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:10, flexShrink:0,
                  background: userAlreadyAddedInfo
                    ? (dark ? "rgba(255,255,255,0.07)" : "#e5e7eb")
                    : `linear-gradient(135deg,${NAVY},#1a56db)`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15,
                  boxShadow: userAlreadyAddedInfo ? "none" : `0 3px 10px ${NAVY}44`,
                }}>
                  {userAlreadyAddedInfo ? "🔒" : "📎"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontSize:13, fontWeight:800,
                    color: userAlreadyAddedInfo
                      ? (dark ? "rgba(255,255,255,0.35)" : "#888")
                      : (dark ? "#93c5fd" : NAVY),
                  }}>
                    {userAlreadyAddedInfo ? s.addInfoLocked : s.addInfoTitle}
                  </div>
                  <div style={{
                    fontSize:10, marginTop:2,
                    color: userAlreadyAddedInfo
                      ? (dark ? "rgba(255,255,255,0.22)" : "#aaa")
                      : (dark ? "rgba(147,197,253,0.7)" : "#3b82f6"),
                  }}>
                    {userAlreadyAddedInfo ? s.addInfoLockedSub : s.addInfoSub}
                  </div>
                </div>
              </div>

              {/* Body — form or locked */}
              {!userAlreadyAddedInfo && (
                <div style={{ padding:"12px 16px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                  {infoDone ? (
                    /* Success flash */
                    <div style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"12px 14px", borderRadius:12,
                      background: dark ? "rgba(5,150,105,0.15)" : "#f0fdf4",
                      border:"1.5px solid rgba(5,150,105,0.3)",
                    }}>
                      <span style={{ fontSize:22 }}>✅</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:800, color:"#059669" }}>
                          {s.addInfoDone}
                        </div>
                        <div style={{ fontSize:11, color: dark ? "rgba(255,255,255,0.5)" : "#555", marginTop:2 }}>
                          {s.addInfoDoneSub}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Textarea */}
                      <div style={{ position:"relative" }}>
                        <textarea
                          value={infoText}
                          onChange={e => { setInfoText(e.target.value); setInfoError(""); }}
                          placeholder={s.addInfoPh}
                          rows={4}
                          maxLength={600}
                          style={{
                            width:"100%", boxSizing:"border-box",
                            padding:"12px 14px", borderRadius:12,
                            border:`1.5px solid ${infoError
                              ? "#DC2626"
                              : infoText.length >= INFO_MIN
                                ? NAVY + "66"
                                : th.border}`,
                            background: dark ? "rgba(255,255,255,0.05)" : "#fff",
                            color: dark ? "#f0f0f0" : "#1a1a1a",
                            fontSize:13, lineHeight:1.65, resize:"none",
                            outline:"none", fontFamily:"inherit",
                            transition:"border-color 0.18s",
                          }}
                          onFocus={e => (e.target.style.borderColor = NAVY)}
                          onBlur={e  => (e.target.style.borderColor = infoError ? "#DC2626" : infoText.length >= INFO_MIN ? NAVY+"66" : th.border)}
                        />
                        <div style={{
                          position:"absolute", bottom:10, right:12,
                          fontSize:10, fontWeight:600,
                          color: infoText.length < INFO_MIN ? "#D97706" : infoText.length > 550 ? "#DC2626" : "#059669",
                        }}>
                          {infoText.length}/600
                        </div>
                      </div>

                      {/* Min-char progress bar */}
                      <div style={{ height:3, borderRadius:99, background: dark ? "rgba(255,255,255,0.08)" : "#e5e7eb", overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:99,
                          width:`${Math.min((infoText.trim().length / INFO_MIN) * 100, 100)}%`,
                          background: infoText.trim().length >= INFO_MIN
                            ? `linear-gradient(90deg,${NAVY},#3b82f6)`
                            : "linear-gradient(90deg,#D97706,#FBBF24)",
                          transition:"width 0.2s, background 0.3s",
                        }} />
                      </div>

                      {/* Error */}
                      {infoError && (
                        <div style={{ fontSize:11, color:"#DC2626", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                          ⚠️ {infoError}
                        </div>
                      )}

                      {/* Submit button */}
                      <div
                        onClick={!infoSending ? handleAddInfo : undefined}
                        style={{
                          padding:"12px 16px", borderRadius:12, textAlign:"center",
                          fontSize:13, fontWeight:800,
                          cursor: infoSending ? "not-allowed" : "pointer",
                          background: infoText.trim().length >= INFO_MIN && !infoSending
                            ? `linear-gradient(135deg,${NAVY},rgba(0,53,128,0.85))`
                            : dark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
                          color: infoText.trim().length >= INFO_MIN && !infoSending
                            ? "#fff"
                            : dark ? "rgba(255,255,255,0.3)" : "#aaa",
                          boxShadow: infoText.trim().length >= INFO_MIN && !infoSending
                            ? `0 4px 16px ${NAVY}44` : "none",
                          transition:"all 0.2s",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        }}
                      >
                        {infoSending ? (
                          <>
                            <div style={{
                              width:12, height:12, borderRadius:"50%",
                              border:"2px solid rgba(255,255,255,0.4)",
                              borderTopColor:"#fff",
                              animation:"sp-spin 0.8s linear infinite",
                            }} />
                            {s.addInfoSending}
                          </>
                        ) : s.addInfoBtn}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Meta: submission details */}
          <div style={{
            background: dark ? "rgba(255,255,255,0.03)" : th.card2,
            border:`1px solid ${th.border}`,
            borderRadius:12, padding:"10px 14px",
            display:"flex", flexDirection:"column", gap:4,
          }}>
            <div style={{ fontSize:9, fontWeight:800, color:th.textSub, letterSpacing:0.4, marginBottom:2 }}>
              📋 {lang === "hi" ? "रिपोर्ट विवरण" : "REPORT DETAILS"}
            </div>
            {[
              { label: lang === "hi" ? "🆔 रिपोर्ट ID" : "🆔 Report ID", value: report.id, mono:true },
              { label: lang === "hi" ? "🗓 भेजी गई"   : "🗓 Submitted",  value: formatDateTime(report.createdAt, lang) },
              report.repliedAt && {
                label: lang === "hi" ? "💬 जवाब मिला" : "💬 Last Reply",
                value: formatDateTime(report.repliedAt, lang),
              },
              { label: lang === "hi" ? "🌐 भाषा" : "🌐 Language", value: report.lang === "hi" ? "हिंदी" : "English" },
            ].filter(Boolean).map(({ label, value, mono }) => (
              <div key={label} style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", gap:8,
                paddingBottom:4, borderBottom:`1px solid ${th.divider}`,
              }}>
                <span style={{ fontSize:10, color:th.textSub, flexShrink:0 }}>{label}</span>
                <span style={{
                  fontSize:10, fontWeight:600, color:th.text,
                  fontFamily: mono ? "monospace" : "inherit",
                  wordBreak:"break-all", textAlign:"right",
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserReportsTab({
  lang        = "en",
  dark        = false,
  onNewReport,          // () => void — opens ReportIssueSheet
  userProfile,          // optional { name, email, phone }
}) {
  const s  = STRINGS[lang] || STRINGS.en;
  const th = THEME[dark ? "dark" : "light"];
  const bf = lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState("");
  const [expanded,   setExpanded]   = useState(null);
  const [filter,     setFilter]     = useState("all"); // "all"|"open"|"in_progress"|"resolved"

  const user = auth.currentUser;

  // ── Fetch user's reports ───────────────────────────────────────────────────
  const fetchReports = useCallback(async (isRefresh = false) => {
    if (!user) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "reports"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(data);
    } catch (err) {
      console.error("UserReportsTab fetch error:", err);
      // Fallback: try without orderBy in case index isn't created yet
      try {
        const q2 = query(collection(db, "reports"), where("uid", "==", user.uid));
        const snap2 = await getDocs(q2);
        const data2 = snap2.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReports(data2);
      } catch (err2) {
        setError(s.errLoad);
        console.error("Fallback fetch also failed:", err2);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, s.errLoad]);

  useEffect(() => { fetchReports(); }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    all:         reports.length,
    open:        reports.filter(r => r.status === "open").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved:    reports.filter(r => r.status === "resolved").length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:0,
      fontFamily:bf, background:th.bg, minHeight:"100%",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding:"18px 16px 14px",
        background:th.card,
        borderBottom:`1px solid ${th.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{ fontSize:17, fontWeight:800, color:th.text }}>
            📬 {s.title}
          </div>
          <div style={{ fontSize:11, color:th.textSub, marginTop:2 }}>{s.sub}</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Refresh */}
          <div
            onClick={() => !refreshing && fetchReports(true)}
            style={{
              padding:"7px 12px", borderRadius:10,
              fontSize:11, fontWeight:700, cursor:"pointer",
              background:th.inputBg, border:`1.5px solid ${th.border}`,
              color: refreshing ? th.textSub : th.textMid,
              display:"flex", alignItems:"center", gap:5,
              opacity: refreshing ? 0.7 : 1,
              transition:"all 0.18s",
            }}
          >
            <span style={{
              display:"inline-block",
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}>↻</span>
            {s.refresh}
          </div>
        </div>
      </div>

      {/* ── Summary pills ── */}
      {!loading && reports.length > 0 && (
        <div style={{
          display:"flex", gap:8, padding:"12px 14px",
          background:th.card, borderBottom:`1px solid ${th.border}`,
          overflowX:"auto",
        }}>
          {[
            { v:"all",         l:s.filterAll,  c:NAVY,      count:counts.all         },
            { v:"open",        l:s.filterOpen, c:"#DC2626", count:counts.open        },
            { v:"in_progress", l:s.filterProg, c:"#D97706", count:counts.in_progress },
            { v:"resolved",    l:s.filterDone, c:IND_GREEN, count:counts.resolved    },
          ].map(({ v, l, c, count }) => (
            <div
              key={v}
              onClick={() => { setFilter(v); setExpanded(null); }}
              style={{
                padding:"6px 13px", borderRadius:20, flexShrink:0,
                fontSize:11, fontWeight:700, cursor:"pointer",
                background: filter === v ? c : th.inputBg,
                color:      filter === v ? "#fff" : th.textMid,
                border:`1.5px solid ${filter === v ? c : th.border}`,
                transition:"all 0.18s",
                display:"flex", alignItems:"center", gap:5,
              }}
            >
              {l}
              <span style={{
                fontSize:10, fontWeight:800,
                background: filter === v ? "rgba(255,255,255,0.25)" : th.border,
                borderRadius:8, padding:"1px 6px",
                color: filter === v ? "#fff" : th.textSub,
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex:1, padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* Loading */}
        {loading && (
          <div style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:12, padding:"60px 0",
          }}>
            <div style={{ fontSize:30 }}>⏳</div>
            <div style={{ fontSize:13, color:th.textSub }}>{s.loading}</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: dark ? "rgba(220,38,38,0.15)" : "#FEF2F2",
            border:"1.5px solid #DC262655",
            borderRadius:14, padding:"16px",
            textAlign:"center",
          }}>
            <div style={{ fontSize:24, marginBottom:8 }}>⚠️</div>
            <div style={{ fontSize:13, color:"#DC2626", fontWeight:600 }}>{error}</div>
            <div
              onClick={() => fetchReports(true)}
              style={{
                marginTop:12, display:"inline-block",
                padding:"8px 18px", borderRadius:10,
                background:"#DC2626", color:"#fff",
                fontSize:12, fontWeight:700, cursor:"pointer",
              }}
            >
              ↻ {s.refresh}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reports.length === 0 && (
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:20, padding:"44px 28px",
            textAlign:"center", display:"flex",
            flexDirection:"column", alignItems:"center", gap:10,
          }}>
            <div style={{ fontSize:52 }}>📭</div>
            <div style={{ fontSize:16, fontWeight:800, color:th.text }}>
              {s.empty}
            </div>
            <div style={{ fontSize:12, color:th.textSub, lineHeight:1.6, maxWidth:260 }}>
              {s.emptySub}
            </div>
            {onNewReport && (
              <div
                onClick={onNewReport}
                style={{
                  marginTop:8,
                  background:`linear-gradient(135deg,${NAVY},rgba(0,53,128,0.85))`,
                  color:"#fff", borderRadius:14,
                  padding:"12px 24px", fontSize:14, fontWeight:800,
                  cursor:"pointer", boxShadow:`0 6px 20px ${NAVY}44`,
                }}
              >
                {s.newReport}
              </div>
            )}
          </div>
        )}

        {/* No results for current filter */}
        {!loading && !error && reports.length > 0 && filtered.length === 0 && (
          <div style={{
            background:th.card, border:`1.5px dashed ${th.border}`,
            borderRadius:14, padding:"28px", textAlign:"center",
          }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
            <div style={{ fontSize:13, color:th.textSub }}>
              {lang === "hi" ? "इस फ़िल्टर में कोई रिपोर्ट नहीं।" : "No reports match this filter."}
            </div>
          </div>
        )}

        {/* Report cards */}
        {!loading && !error && filtered.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            dark={dark}
            lang={lang}
            isExpanded={expanded === report.id}
            onToggle={() => setExpanded(expanded === report.id ? null : report.id)}
            onReopen={() => fetchReports(true)}
          />
        ))}

        {/* New report CTA (when list is not empty) */}
        {!loading && !error && reports.length > 0 && onNewReport && (
          <div
            onClick={onNewReport}
            style={{
              marginTop:4,
              background: dark
                ? `linear-gradient(135deg,rgba(0,53,128,0.3),rgba(255,153,51,0.15))`
                : `linear-gradient(135deg,${NAVY}0f,${SAFFRON}0c)`,
              border:`1.5px dashed ${NAVY}55`,
              borderRadius:14, padding:"14px",
              textAlign:"center", cursor:"pointer",
              fontSize:13, fontWeight:700, color:NAVY,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.18s",
            }}
          >
            <span style={{ fontSize:18 }}>📝</span>
            {s.newReport}
          </div>
        )}

        <div style={{ height:20 }} />
      </div>

      {/* Spin keyframes injected once */}
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
