/**
 * ResolvedReportsCleaner.jsx — Yojana Sahay Admin Dashboard
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar · SPDX-License-Identifier: MIT
 *
 * Deletes old resolved reports from Firestore with age-based filters.
 * Password-protected, terminal-styled admin utility — mirrors UsageDataCleaner aesthetic.
 *
 * Usage:
 *   import ResolvedReportsCleaner from "./ResolvedReportsCleaner";
 *   <ResolvedReportsCleaner dark={dark} lang="en" onDeleteDone={callback} />
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  collection, query, where, getDocs,
  deleteDoc, doc, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

// ── Design tokens (mirrors UsageDataCleaner) ────────────────────────────────
const NAVY      = "#003580";
const SAFFRON   = "#FF9933";
const IND_GREEN = "#138808";
const DANGER    = "#DC2626";

const THEME = {
  light: {
    card: "#fff", card2: "#f8f9fa",
    text: "#1a1a1a", textMid: "#555", textSub: "#888",
    border: "#e8e8e8", inputBg: "#f8f9fa",
  },
  dark: {
    card: "#1c1c1e", card2: "#252527",
    text: "#f0f0f0", textMid: "#aaa", textSub: "#666",
    border: "#2c2c2e", inputBg: "#1a1a1e",
  },
};

// ── Constants ────────────────────────────────────────────────────────────────
const CLEANUP_PWD_HASH = "051f67acb3b4d3ed6e7ef098a9afc184b90e8337742097030960b89a7f2ce190";

async function hashStr(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
}

const AGE_FILTERS = [
  { key: "1m",  label: "Older than 1 Month",  labelHi: "1 महीने से पुरानी",  icon: "📅", months: 1,  color: SAFFRON,    risk: "low"    },
  { key: "3m",  label: "Older than 3 Months", labelHi: "3 महीने से पुरानी",  icon: "🗓️",  months: 3,  color: "#D97706",  risk: "low"    },
  { key: "6m",  label: "Older than 6 Months", labelHi: "6 महीने से पुरानी",  icon: "📆", months: 6,  color: "#EA580C",  risk: "medium" },
  { key: "1y",  label: "Older than 1 Year",   labelHi: "1 साल से पुरानी",   icon: "🗄️",  months: 12, color: DANGER,     risk: "medium" },
  { key: "all", label: "All Resolved Reports", labelHi: "सभी हल हुई रिपोर्ट", icon: "🧹", months: 0,  color: "#7C3AED",  risk: "high"   },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCutoffDate(months) {
  if (months === 0) return null;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return Timestamp.fromDate(d);
}
function formatCount(n) {
  if (n === 0) return "No reports";
  if (n === 1) return "1 report";
  return `${n} reports`;
}
function formatBytes(bytes) {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
const AVG_DOC_BYTES = 1200;

// ── Keyframes (rrc- prefix to avoid conflicts with udc-) ─────────────────────
const KEYFRAMES = `
  @keyframes rrc-shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
  @keyframes rrc-in      { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rrc-spin    { to{transform:rotate(360deg)} }
  @keyframes rrc-blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes rrc-glow-a  { 0%,100%{box-shadow:0 0 0 0 rgba(255,153,51,0)} 50%{box-shadow:0 0 22px 2px rgba(255,153,51,0.35)} }
  @keyframes rrc-glow-g  { 0%,100%{box-shadow:0 0 0 0 rgba(19,136,8,0)}   50%{box-shadow:0 0 22px 2px rgba(19,136,8,0.4)}  }
  @keyframes rrc-glow-r  { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}  50%{box-shadow:0 0 20px 2px rgba(220,38,38,0.38)} }
  @keyframes rrc-shimmer { 0%{opacity:0.4} 50%{opacity:0.9} 100%{opacity:0.4} }
  @keyframes rrc-line-in { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes rrc-slide-up{ from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes rrc-success { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.25) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
`;

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function ResolvedReportsCleaner({ dark = false, lang = "en", onDeleteDone }) {
  const th    = THEME[dark ? "dark" : "light"];
  const isHi  = lang === "hi";

  // ── Auth state ────────────────────────────────────────────────────────────
  const [locked,      setLocked]    = useState(true);
  const [pwInput,     setPwInput]   = useState("");
  const [pwShake,     setPwShake]   = useState(false);
  const [pwError,     setPwError]   = useState("");
  const [showPw,      setShowPw]    = useState(false);
  const [checking,    setChecking]  = useState(false);

  // ── Operation state ───────────────────────────────────────────────────────
  const [selected,       setSelected]       = useState(null);
  const [counts,         setCounts]         = useState({});
  const [loadingCounts,  setLoadingCounts]  = useState(true);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [progress,       setProgress]       = useState({ done: 0, total: 0 });
  const [result,         setResult]         = useState(null);
  const [lastDeleted,    setLastDeleted]    = useState(null);

  // ── Unlock (SHA-256 verified) ─────────────────────────────────────────────
  async function handleUnlock() {
    if (!pwInput.trim()) return;
    setChecking(true);
    setPwError("");
    try {
      const h = await hashStr(pwInput);
      if (h === CLEANUP_PWD_HASH) {
        setLocked(false);
        setPwInput("");
      } else {
        setPwError(isHi ? "गलत पासवर्ड। दोबारा कोशिश करें।" : "Access denied — invalid credentials.");
        setPwShake(true);
        setPwInput("");
        setTimeout(() => setPwShake(false), 550);
      }
    } finally {
      setChecking(false);
    }
  }

  // ── Fetch counts for all filters ──────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const newCounts = {};
      for (const f of AGE_FILTERS) {
        let q;
        if (f.months === 0) {
          q = query(collection(db, "reports"), where("status", "==", "resolved"));
        } else {
          const cutoff = getCutoffDate(f.months);
          q = query(
            collection(db, "reports"),
            where("status", "==", "resolved"),
            where("createdAt", "<=", cutoff),
          );
        }
        const snap = await getDocs(q);
        newCounts[f.key] = snap.size;
      }
      setCounts(newCounts);
    } catch (err) {
      console.error("RRC count fetch error:", err);
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => { if (!locked) fetchCounts(); }, [locked, fetchCounts]);

  // ── Delete handler ────────────────────────────────────────────────────────
  async function handleDelete() {
    const filter = AGE_FILTERS.find(f => f.key === selected);
    if (!filter) return;
    setDeleting(true);
    setProgress({ done: 0, total: 0 });
    try {
      let q;
      if (filter.months === 0) {
        q = query(collection(db, "reports"), where("status", "==", "resolved"));
      } else {
        const cutoff = getCutoffDate(filter.months);
        q = query(
          collection(db, "reports"),
          where("status", "==", "resolved"),
          where("createdAt", "<=", cutoff),
        );
      }
      const snap = await getDocs(q);
      const docs = snap.docs;
      setProgress({ done: 0, total: docs.length });

      // Delete in batches of 10 (avoids overwhelming Firestore free tier)
      const BATCH = 10;
      let done = 0;
      for (let i = 0; i < docs.length; i += BATCH) {
        const chunk = docs.slice(i, i + BATCH);
        await Promise.all(chunk.map(d => deleteDoc(doc(db, "reports", d.id))));
        done += chunk.length;
        setProgress({ done, total: docs.length });
        await new Promise(r => setTimeout(r, 120));
      }

      setLastDeleted(new Date());
      setShowConfirm(false);
      setSelected(null);
      setResult({
        type: "success",
        title: isHi
          ? `${docs.length} रिपोर्ट सफलतापूर्वक हटाई गईं`
          : `${formatCount(docs.length)} deleted successfully`,
        sub: `~${formatBytes(docs.length * AVG_DOC_BYTES)} freed from Firestore`,
      });
      fetchCounts();
      onDeleteDone?.();
    } catch (err) {
      console.error("RRC delete error:", err);
      setShowConfirm(false);
      setResult({
        type: "error",
        title: isHi ? "हटाने में त्रुटि" : "Deletion Failed",
        sub: "Check console for details",
      });
    } finally {
      setDeleting(false);
    }
  }

  const selectedFilter = AGE_FILTERS.find(f => f.key === selected);
  const selectedCount  = selected ? (counts[selected] ?? 0) : 0;
  const totalResolved  = counts["all"] ?? 0;

  // ── Phase-derived visuals (mirrors UsageDataCleaner's phase machine) ───────
  const phase =
    locked            ? "locked"   :
    loadingCounts     ? "scanning" :
    deleting          ? "cleaning" :
    result?.type === "success" ? "success" :
    (selected && selectedCount > 0) ? "danger" :
    "unlocked";

  const PHASE_STATUS = {
    locked:   { label: "LOCKED",   color: "#ff5f57", bg: "rgba(220,38,38,0.22)",  border: "rgba(220,38,38,0.4)"   },
    unlocked: { label: "UNLOCKED", color: SAFFRON,   bg: "rgba(255,153,51,0.2)",  border: "rgba(255,153,51,0.45)" },
    scanning: { label: "SCANNING", color: "#60a5fa", bg: "rgba(96,165,250,0.18)", border: "rgba(96,165,250,0.4)"  },
    danger:   { label: "DANGER",   color: "#ff5f57", bg: "rgba(220,38,38,0.22)",  border: "rgba(220,38,38,0.4)"   },
    cleaning: { label: "PURGING",  color: SAFFRON,   bg: "rgba(255,153,51,0.2)",  border: "rgba(255,153,51,0.45)" },
    success:  { label: "DONE",     color: "#4ade80", bg: "rgba(19,136,8,0.22)",   border: "rgba(19,136,8,0.5)"    },
  };
  const ps = PHASE_STATUS[phase] || PHASE_STATUS.locked;

  const PHASE_SUBTITLE = {
    locked:   isHi ? "पासवर्ड आवश्यक — प्रतिबंधित ऑपरेशन"       : "Password required — restricted admin operation",
    unlocked: isHi ? `कुल ${totalResolved} हल हुई रिपोर्ट · साफ करने के लिए तैयार` : `Total ${totalResolved} resolved · Ready to clean`,
    scanning: isHi ? "Firestore से डेटा लोड हो रहा है…"            : "Loading report counts from Firestore…",
    danger:   isHi ? `${selectedCount} रिपोर्ट स्थायी हटाने के लिए चुनी गईं` : `${selectedCount} report${selectedCount !== 1 ? "s" : ""} flagged for permanent deletion`,
    cleaning: isHi ? "रिपोर्ट हटाई जा रही हैं…"                   : "Deleting reports from Firestore…",
    success:  isHi ? "सफाई पूरी — रिकॉर्ड सफलतापूर्वक हटाए गए"   : "Cleanup complete — records successfully removed",
  };
  const PHASE_ICON = {
    locked: "🔒", unlocked: "🗑️", scanning: "🔍",
    danger: "⚠️", cleaning: "⚙️", success:  "✅",
  };

  const BORDER_COLOR =
    phase === "success"  ? "rgba(19,136,8,0.5)"   :
    phase === "danger"   ? "rgba(220,38,38,0.4)"  :
    phase === "locked"   ? (dark ? "#2a2a2e" : "#e0e0e0") :
    "rgba(255,153,51,0.35)";

  const GLOW_ANIM =
    phase === "unlocked" || phase === "scanning" || phase === "cleaning" ? "rrc-glow-a 2.5s ease-in-out infinite" :
    phase === "success"  ? "rrc-glow-g 2.2s ease-in-out infinite" :
    phase === "danger"   ? "rrc-glow-r 2s ease-in-out infinite"   :
    "none";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={{
        margin: "14px 14px 0",
        borderRadius: 20,
        overflow: "hidden",
        border: `1.5px solid ${BORDER_COLOR}`,
        transition: "border-color 0.5s ease",
        animation: GLOW_ANIM,
      }}>

        {/* ── Header strip ────────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg, #07111f 0%, #0d1f3c 55%, #122040 100%)",
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
          position: "relative", overflow: "hidden",
        }}>
          {/* Subtle grid texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.045,
            backgroundImage: [
              "repeating-linear-gradient(0deg,  rgba(255,255,255,.8) 0,rgba(255,255,255,.8) 1px,transparent 1px,transparent 22px)",
              "repeating-linear-gradient(90deg, rgba(255,255,255,.8) 0,rgba(255,255,255,.8) 1px,transparent 1px,transparent 22px)",
            ].join(","),
          }} />
          {/* Saffron top edge accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${SAFFRON}bb 40%, ${SAFFRON} 55%, transparent 100%)`,
            opacity: phase === "locked" ? 0.35 : 0.7,
            transition: "opacity 0.4s ease",
          }} />

          {/* Icon badge */}
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 19,
            ...(phase === "cleaning" ? { animation: "rrc-spin 1.3s linear infinite" } : {}),
          }}>
            {PHASE_ICON[phase]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.15,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {isHi ? "हल हुई रिपोर्ट क्लीनर" : "Resolved Reports Cleaner"}
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: 0.8,
                color: "rgba(255,153,51,0.6)", fontFamily: "monospace",
              }}>v1.2.0</span>
            </div>
            <div style={{
              color: "rgba(255,255,255,0.48)", fontSize: 10, marginTop: 3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {PHASE_SUBTITLE[phase]}
            </div>
          </div>

          {/* Status pill */}
          <div style={{
            padding: "4px 10px", borderRadius: 20,
            fontSize: 9, fontWeight: 800, flexShrink: 0, letterSpacing: 1,
            background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`,
            fontFamily: "monospace",
          }}>
            {ps.label}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{
          background: dark ? "#0f0f11" : "#ffffff",
          padding: "18px 16px 20px",
        }}>

          {/* ═══════════════════════════════════════════
              PHASE: LOCKED
          ═══════════════════════════════════════════ */}
          {locked && (
            <div style={{ animation: "rrc-in 0.3s ease forwards" }}>

              {/* Warning banner */}
              <div style={{
                background: dark ? "rgba(220,38,38,0.08)" : "#fff5f5",
                border: "1px solid rgba(220,38,38,0.28)",
                borderRadius: 12, padding: "11px 14px", marginBottom: 20,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", marginBottom: 3 }}>
                    {isHi ? "प्रतिबंधित ऑपरेशन" : "Restricted Admin Operation"}
                  </div>
                  <div style={{ fontSize: 10, color: dark ? "#888" : "#999", lineHeight: 1.6 }}>
                    {isHi
                      ? "केवल 'Resolved' स्टेटस वाली रिपोर्ट हटाई जाती हैं। यह पूर्ववत नहीं होगा।"
                      : <>Permanently removes resolved reports from{" "}
                        <span style={{ fontFamily: "monospace", color: dark ? "#aaa" : "#555", fontWeight: 700 }}>
                          reports
                        </span>. Cannot be undone.</>}
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div style={{ animation: pwShake ? "rrc-shake 0.5s ease" : "none" }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  color: dark ? "#666" : "#aaa", marginBottom: 8, fontFamily: "monospace",
                }}>
                  ● ADMIN AUTHENTICATION
                </div>

                <div style={{ position: "relative", marginBottom: 14 }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwInput}
                    onChange={e => { setPwInput(e.target.value); setPwError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleUnlock()}
                    placeholder={isHi ? "पासवर्ड डालें…" : "Enter cleanup password"}
                    autoComplete="off"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "13px 46px 13px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${pwError ? DANGER : (dark ? "#2a2a2e" : "#e0e0e0")}`,
                      background: dark ? "#141416" : "#f8f9fa",
                      color: dark ? "#f0f0f0" : "#1a1a1a",
                      fontSize: 14, outline: "none",
                      fontFamily: "monospace",
                      letterSpacing: pwInput && !showPw ? 5 : 1,
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = SAFFRON;
                      e.target.style.boxShadow   = "0 0 0 3px rgba(255,153,51,0.12)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = pwError ? DANGER : (dark ? "#2a2a2e" : "#e0e0e0");
                      e.target.style.boxShadow   = "none";
                    }}
                  />
                  <div
                    onClick={() => setShowPw(s => !s)}
                    style={{
                      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                      fontSize: 15, cursor: "pointer", opacity: 0.45,
                      userSelect: "none", transition: "opacity 0.15s",
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = "0.75")}
                    onMouseOut={e  => (e.currentTarget.style.opacity = "0.45")}
                  >
                    {showPw ? "🙈" : "👁"}
                  </div>
                </div>

                {pwError && (
                  <div style={{
                    fontSize: 11, color: DANGER, fontWeight: 700,
                    marginBottom: 14, display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "monospace",
                  }}>
                    ✕ {pwError}
                  </div>
                )}

                <div
                  onClick={checking ? undefined : handleUnlock}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: 12,
                    textAlign: "center",
                    background: checking
                      ? (dark ? "#222" : "#e8e8e8")
                      : "linear-gradient(135deg, #06122b 0%, #0d2254 50%, #003580 100%)",
                    color: checking ? (dark ? "#555" : "#aaa") : "#fff",
                    fontSize: 13, fontWeight: 800,
                    cursor: checking ? "default" : "pointer", letterSpacing: 0.9,
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: checking ? "none" : "0 5px 20px rgba(0,53,128,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "opacity 0.15s, transform 0.15s",
                  }}
                  onMouseOver={e => {
                    if (!checking) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {checking
                    ? (isHi ? "⏳ जाँच हो रही है…" : "⏳ VERIFYING…")
                    : (isHi ? "🔓 अनलॉक करें"       : "🔓 UNLOCK ACCESS")}
                </div>

                {/* SHA-256 security note */}
                <div style={{
                  marginTop: 12, fontSize: 9, fontFamily: "monospace",
                  color: dark ? "#444" : "#bbb", textAlign: "center",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                  <span>🛡️</span>
                  <span>
                    {isHi
                      ? "SHA-256 सुरक्षित · यह session के बाद reset हो जाएगा"
                      : "SHA-256 protected · session-only unlock"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE: UNLOCKED
          ═══════════════════════════════════════════ */}
          {!locked && (
            <div style={{ animation: "rrc-in 0.3s ease forwards", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Access granted banner */}
              <div style={{
                background: dark ? "rgba(19,136,8,0.1)" : "#f0fdf4",
                border: "1px solid rgba(19,136,8,0.32)",
                borderRadius: 11, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: IND_GREEN, flexShrink: 0,
                  boxShadow: `0 0 8px ${IND_GREEN}`,
                  animation: "rrc-blink 2s ease-in-out infinite",
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: IND_GREEN }}>
                    {isHi ? "एक्सेस मिली — SHZ Admin" : "Access Granted — SHZ Admin"}
                  </span>
                  <div style={{ fontSize: 10, color: dark ? "#888" : "#999", marginTop: 1 }}>
                    {isHi
                      ? "फ़िल्टर चुनें और पुरानी रिपोर्ट हटाएं"
                      : "Select a filter to preview & delete old resolved reports"}
                  </div>
                </div>
                <div
                  onClick={() => {
                    setLocked(true);
                    setSelected(null); setShowConfirm(false);
                    setPwInput(""); setPwError("");
                  }}
                  style={{
                    fontSize: 10, color: dark ? "#555" : "#bbb", cursor: "pointer",
                    fontWeight: 700, flexShrink: 0, padding: "3px 8px",
                    border: `1px solid ${dark ? "#333" : "#e0e0e0"}`,
                    borderRadius: 7,
                  }}
                >
                  🔒 Lock
                </div>
              </div>

              {/* ── Total resolved strip ──────────────────────────────────── */}
              <div style={{
                background: dark ? "#141416" : "#f8f9fa",
                border: `1.5px solid ${dark ? "#272729" : "#e8e8e8"}`,
                borderRadius: 13, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                    fontFamily: "monospace", color: dark ? "#555" : "#aaa", marginBottom: 6,
                  }}>
                    ● TOTAL RESOLVED REPORTS
                  </div>
                  <div style={{
                    height: 5, borderRadius: 5,
                    background: dark ? "#222226" : "#e8e8e8", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 5,
                      width: loadingCounts ? "30%" : "100%",
                      background: `linear-gradient(90deg, ${IND_GREEN}, ${IND_GREEN}bb)`,
                      transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                      ...(loadingCounts ? { animation: "rrc-shimmer 1.4s infinite" } : {}),
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontSize: 20, fontWeight: 900, fontFamily: "monospace",
                    color: loadingCounts ? (dark ? "#333" : "#ddd") : IND_GREEN,
                    textShadow: !loadingCounts ? "0 0 10px rgba(19,136,8,0.35)" : "none",
                  }}>
                    {loadingCounts ? "—" : totalResolved}
                  </div>
                  <div style={{ fontSize: 9, color: dark ? "#444" : "#ccc", marginTop: 1 }}>
                    {loadingCounts ? "loading…" : `~${formatBytes(totalResolved * AVG_DOC_BYTES)}`}
                  </div>
                </div>
                {/* Refresh */}
                <div
                  onClick={() => !loadingCounts && fetchCounts()}
                  style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: dark ? "#1e1e20" : "#efefef",
                    border: `1.5px solid ${dark ? "#2c2c2e" : "#e0e0e0"}`,
                    cursor: loadingCounts ? "default" : "pointer",
                    fontSize: 16, opacity: loadingCounts ? 0.45 : 1,
                    transition: "opacity 0.15s",
                    ...(loadingCounts ? { animation: "rrc-spin 1s linear infinite" } : {}),
                  }}
                  onMouseOver={e => { if (!loadingCounts) e.currentTarget.style.opacity = "0.7"; }}
                  onMouseOut={e  => { if (!loadingCounts) e.currentTarget.style.opacity = "1"; }}
                  title={isHi ? "रिफ्रेश" : "Refresh counts"}
                >
                  ↻
                </div>
              </div>

              {/* Last cleanup badge */}
              {lastDeleted && (
                <div style={{
                  fontSize: 10, fontFamily: "monospace", fontWeight: 700,
                  color: IND_GREEN,
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 11px",
                  background: dark ? "rgba(19,136,8,0.08)" : "#f0fdf4",
                  border: "1px solid rgba(19,136,8,0.25)",
                  borderRadius: 9,
                  animation: "rrc-line-in 0.25s ease",
                }}>
                  ✅ {isHi ? "अंतिम सफाई:" : "Last cleanup:"}{" "}
                  {lastDeleted.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}

              {/* ── Filter section label ───────────────────────────────────── */}
              <div style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                fontFamily: "monospace", color: dark ? "#555" : "#aaa",
              }}>
                ● {isHi ? "फ़िल्टर चुनें — केवल हल हुई रिपोर्ट" : "SELECT FILTER — RESOLVED REPORTS ONLY"}
              </div>

              {/* ── Filter rows (DataPreviewRow style) ────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AGE_FILTERS.map((filter, idx) => {
                  const count  = counts[filter.key] ?? 0;
                  const active = selected === filter.key;
                  const pct    = totalResolved > 0 ? Math.round((count / totalResolved) * 100) : 0;
                  return (
                    <div
                      key={filter.key}
                      onClick={() => setSelected(active ? null : filter.key)}
                      style={{
                        background: dark ? "#141416" : "#f8f9fa",
                        border: `1.5px solid ${active ? filter.color : (dark ? "#272729" : "#e8e8e8")}`,
                        borderRadius: 11, padding: "10px 13px",
                        display: "flex", alignItems: "center", gap: 11,
                        cursor: "pointer",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        boxShadow: active ? `0 4px 16px ${filter.color}28` : "none",
                        animation: `rrc-in 0.3s ${idx * 55}ms ease both`,
                        position: "relative", overflow: "hidden",
                      }}
                    >
                      {/* Active top stripe */}
                      {active && (
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, height: 2,
                          background: filter.color,
                          borderRadius: "11px 11px 0 0",
                        }} />
                      )}

                      <span style={{ fontSize: 17, flexShrink: 0 }}>{filter.icon}</span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: active ? 800 : 700,
                          color: active ? filter.color : (dark ? "#e0e0e0" : "#1a1a1a"),
                          marginBottom: 6,
                        }}>
                          {isHi ? filter.labelHi : filter.label}
                        </div>
                        <div style={{
                          height: 5, borderRadius: 5,
                          background: dark ? "#222226" : "#e8e8e8",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", borderRadius: 5,
                            width: loadingCounts ? "22%" : `${pct}%`,
                            background: `linear-gradient(90deg, ${filter.color}, ${filter.color}bb)`,
                            transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                            minWidth: !loadingCounts && count > 0 ? 4 : 0,
                            ...(loadingCounts ? { animation: "rrc-shimmer 1.4s infinite" } : {}),
                          }} />
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 900, fontFamily: "monospace",
                          color: loadingCounts
                            ? (dark ? "#333" : "#ddd")
                            : (count > 0 ? filter.color : (dark ? "#444" : "#ccc")),
                          textShadow: count > 0 && !loadingCounts ? `0 0 10px ${filter.color}44` : "none",
                        }}>
                          {loadingCounts ? "—" : count}
                        </div>
                        <div style={{ fontSize: 9, color: dark ? "#444" : "#ccc", marginTop: 1 }}>
                          {loadingCounts ? "…" : `~${formatBytes(count * AVG_DOC_BYTES)}`}
                        </div>
                      </div>

                      {/* CAUTION badge for "all" */}
                      {filter.risk === "high" && (
                        <div style={{
                          fontSize: 8, fontWeight: 800, letterSpacing: 0.6,
                          background: dark ? "rgba(124,58,237,0.2)" : "#F5F3FF",
                          color: "#7C3AED", border: "1px solid #7C3AED44",
                          borderRadius: 6, padding: "2px 6px", flexShrink: 0,
                          fontFamily: "monospace",
                        }}>
                          {isHi ? "सावधान" : "CAUTION"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Action panel (appears when filter selected) ───────────── */}
              {selected && (
                <div style={{
                  background: dark ? "#141416" : "#f8f9fa",
                  border: `1.5px solid ${selectedCount > 0 ? (selectedFilter?.color ?? SAFFRON) : (dark ? "#272729" : "#e8e8e8")}`,
                  borderRadius: 13, padding: "14px",
                  animation: "rrc-in 0.25s ease",
                }}>
                  {selectedCount === 0 ? (
                    /* Nothing to delete */
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                      <div style={{ fontSize: 30, marginBottom: 8 }}>✨</div>
                      <div style={{
                        fontSize: 13, fontWeight: 800,
                        color: dark ? "#e0e0e0" : "#1a1a1a",
                      }}>
                        {isHi ? "कोई रिपोर्ट नहीं मिली" : "Nothing to Delete"}
                      </div>
                      <div style={{ fontSize: 10, color: dark ? "#555" : "#bbb", marginTop: 4 }}>
                        {isHi
                          ? "इस फ़िल्टर में कोई पुरानी हल हुई रिपोर्ट नहीं है।"
                          : "No resolved reports match this filter."}
                      </div>
                    </div>
                  ) : (
                    /* Ready to delete */
                    <>
                      {/* Summary row (mirrors SuccessResultRow style) */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
                      }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{selectedFilter?.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12, fontWeight: 800,
                            color: dark ? "#e0e0e0" : "#1a1a1a",
                          }}>
                            {formatCount(selectedCount)} {isHi ? "हटाई जाएंगी" : "will be deleted"}
                          </div>
                          <div style={{ fontSize: 10, color: dark ? "#555" : "#bbb", marginTop: 2 }}>
                            {isHi ? selectedFilter?.labelHi : selectedFilter?.label}
                            {" · ~"}{formatBytes(selectedCount * AVG_DOC_BYTES)}
                          </div>
                        </div>
                        <div style={{
                          padding: "4px 12px", borderRadius: 8, flexShrink: 0,
                          fontSize: 12, fontWeight: 900, fontFamily: "monospace",
                          background: dark ? "rgba(220,38,38,0.1)" : "#fff5f5",
                          color: DANGER,
                          border: "1px solid rgba(220,38,38,0.28)",
                          textShadow: `0 0 10px rgba(220,38,38,0.3)`,
                        }}>
                          −{selectedCount}
                        </div>
                      </div>

                      {/* Tip notice */}
                      <div style={{
                        background: dark ? "rgba(255,153,51,0.08)" : "#FFFBEB",
                        border: `1px solid ${SAFFRON}44`,
                        borderRadius: 10, padding: "9px 12px", marginBottom: 12,
                        fontSize: 10, color: dark ? SAFFRON : "#92400E", lineHeight: 1.7,
                      }}>
                        ⚠️ {isHi
                          ? "सुनिश्चित करें कि आपने ज़रूरी रिपोर्ट export कर लिया है।"
                          : "Tip: Export important reports as CSV before deleting."}
                      </div>

                      {/* Delete CTA */}
                      <div
                        onClick={() => setShowConfirm(true)}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: 12,
                          textAlign: "center",
                          background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #DC2626 100%)",
                          color: "#fff", fontSize: 13, fontWeight: 800,
                          cursor: "pointer", letterSpacing: 0.9,
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 5px 20px rgba(220,38,38,0.4)",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          transition: "opacity 0.15s, transform 0.15s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseOut={e  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        🗑️ {isHi
                          ? `${selectedCount} रिपोर्ट हटाएं`
                          : `DELETE ${selectedCount} REPORT${selectedCount !== 1 ? "S" : ""}`}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Info footer ───────────────────────────────────────────── */}
              <div style={{
                background: dark ? "#141416" : "#f8f9fa",
                border: `1.5px solid ${dark ? "#272729" : "#e8e8e8"}`,
                borderRadius: 13, padding: "12px 14px",
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  fontFamily: "monospace", color: dark ? "#555" : "#aaa", marginBottom: 10,
                }}>
                  ● {isHi ? "ध्यान रखें" : "IMPORTANT NOTES"}
                </div>
                {[
                  isHi ? "केवल 'Resolved' स्टेटस वाली रिपोर्ट हटाई जाती हैं।"         : "Only reports with status = 'Resolved' are deleted.",
                  isHi ? "Open या In Progress रिपोर्ट कभी नहीं हटाई जाएंगी।"           : "Open & In Progress reports are never touched.",
                  isHi ? "हटाने के बाद डेटा वापस नहीं आता।"                           : "Deletion is permanent and cannot be undone.",
                  isHi ? "एक बार में 1,000+ रिपोर्ट हटाने में कुछ सेकंड लग सकते हैं।"  : "Deleting 1,000+ reports may take a few seconds.",
                ].map((note, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8,
                    marginBottom: i < 3 ? 6 : 0,
                    fontSize: 10, color: dark ? "#555" : "#999", lineHeight: 1.5,
                  }}>
                    <span style={{ flexShrink: 0, color: IND_GREEN, fontWeight: 900 }}>✓</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>

              {/* Lock & Close */}
              <div
                onClick={() => {
                  setLocked(true);
                  setPwInput(""); setPwError(""); setShowPw(false);
                  setSelected(null); setResult(null); setShowConfirm(false);
                }}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: 12, textAlign: "center",
                  background: dark ? "#141416" : "#f8f9fa",
                  border: `1.5px solid ${dark ? "#272729" : "#e0e0e0"}`,
                  color: dark ? "#888" : "#666", fontSize: 12, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "opacity 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.72")}
                onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
              >
                🔒 Lock &amp; Close
              </div>
            </div>
          )}

        </div>{/* /body */}
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      {showConfirm && selectedFilter && (
        <ConfirmModal
          filter={selectedFilter}
          count={selectedCount}
          dark={dark}
          isHi={isHi}
          deleting={deleting}
          progress={progress}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setShowConfirm(false)}
        />
      )}

      {/* ── Result Toast ──────────────────────────────────────────────────── */}
      {result && (
        <ResultToast result={result} dark={dark} onDismiss={() => setResult(null)} />
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// ── Confirm modal — mirrors UsageDataCleaner header style ─────────────────────
function ConfirmModal({ filter, count, dark, isHi, deleting, progress, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: dark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.52)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(6px)",
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.34)",
        border: `1.5px solid rgba(220,38,38,0.4)`,
        animation: "rrc-in 0.25s ease",
      }}>
        {/* Header strip — same navy gradient as main card */}
        <div style={{
          background: "linear-gradient(135deg, #07111f 0%, #0d1f3c 55%, #122040 100%)",
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
          position: "relative", overflow: "hidden",
        }}>
          {/* Grid texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
            backgroundImage: [
              "repeating-linear-gradient(0deg,  rgba(255,255,255,.8) 0,rgba(255,255,255,.8) 1px,transparent 1px,transparent 22px)",
              "repeating-linear-gradient(90deg, rgba(255,255,255,.8) 0,rgba(255,255,255,.8) 1px,transparent 1px,transparent 22px)",
            ].join(","),
          }} />
          {/* Red top accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${DANGER}bb 40%, ${DANGER} 55%, transparent 100%)`,
          }} />
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: "rgba(220,38,38,0.16)",
            border: "1px solid rgba(220,38,38,0.38)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            {deleting ? "⏳" : "⚠️"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.15 }}>
              {isHi ? "क्या आप निश्चित हैं?" : "Confirm Deletion"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>
              {isHi ? "यह क्रिया पूर्ववत नहीं की जा सकती" : "This action cannot be undone"}
            </div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 20,
            fontSize: 9, fontWeight: 800, letterSpacing: 1,
            background: "rgba(220,38,38,0.22)", color: "#ff5f57",
            border: "1px solid rgba(220,38,38,0.4)", fontFamily: "monospace",
          }}>
            DANGER
          </div>
        </div>

        {/* Body */}
        <div style={{
          background: dark ? "#0f0f11" : "#fff",
          padding: "16px 16px 20px",
        }}>
          {/* What will be deleted */}
          <div style={{
            background: dark ? "rgba(220,38,38,0.08)" : "#fff5f5",
            border: "1px solid rgba(220,38,38,0.28)",
            borderRadius: 11, padding: "11px 13px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{filter.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 900,
                color: dark ? "#f0f0f0" : "#1a1a1a",
              }}>
                {formatCount(count)}
              </div>
              <div style={{ fontSize: 10, color: dark ? "#666" : "#888", marginTop: 2 }}>
                {isHi ? filter.labelHi : filter.label}
              </div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, fontFamily: "monospace",
              color: dark ? "#555" : "#bbb", flexShrink: 0,
            }}>
              ~{formatBytes(count * AVG_DOC_BYTES)}
            </div>
          </div>

          {/* Progress bar during deletion */}
          {deleting && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 10, fontFamily: "monospace",
                color: dark ? "#888" : "#666", marginBottom: 6,
              }}>
                <span>{isHi ? "हटाया जा रहा है…" : "Deleting…"}</span>
                <span style={{ fontWeight: 700, color: DANGER }}>
                  {progress.done} / {progress.total}
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 5, overflow: "hidden",
                background: dark ? "#222226" : "#e8e8e8",
              }}>
                <div style={{
                  height: "100%", borderRadius: 5,
                  width: `${progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                  background: `linear-gradient(90deg, ${DANGER}, ${DANGER}bb)`,
                  transition: "width 0.2s ease",
                }} />
              </div>
            </div>
          )}

          {/* CAUTION notice for "all" */}
          {filter.risk === "high" && !deleting && (
            <div style={{
              background: dark ? "rgba(124,58,237,0.12)" : "#F5F3FF",
              border: "1px solid #7C3AED44",
              borderRadius: 10, padding: "9px 12px", marginBottom: 14,
              fontSize: 10, color: "#7C3AED", fontWeight: 600, lineHeight: 1.6,
            }}>
              ⚡ {isHi
                ? "आप सभी हल हुई रिपोर्ट हटा रहे हैं। सुनिश्चित करें कि ज़रूरी डेटा export हो चुका है।"
                : "You're deleting ALL resolved reports. Make sure you've exported any needed data."}
            </div>
          )}

          {/* Buttons */}
          {!deleting ? (
            <div style={{ display: "flex", gap: 10 }}>
              <div
                onClick={onCancel}
                style={{
                  flex: 1, padding: "12px", borderRadius: 11, textAlign: "center",
                  background: dark ? "#141416" : "#f8f9fa",
                  border: `1.5px solid ${dark ? "#2a2a2e" : "#e0e0e0"}`,
                  color: dark ? "#888" : "#666", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.72")}
                onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </div>
              <div
                onClick={onConfirm}
                style={{
                  flex: 1, padding: "12px", borderRadius: 11, textAlign: "center",
                  background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #DC2626 100%)",
                  color: "#fff", fontSize: 13, fontWeight: 800,
                  cursor: "pointer", letterSpacing: 0.6,
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 5px 18px rgba(220,38,38,0.4)",
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
              >
                🗑️ {isHi ? "हाँ, हटाएं" : "Yes, Delete"}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "10px 0 2px",
              fontSize: 10, fontFamily: "monospace",
              color: dark ? "#555" : "#aaa",
            }}>
              {isHi
                ? "कृपया प्रतीक्षा करें — स्क्रीन बंद न करें…"
                : "Please wait — do not close this screen…"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Result toast ──────────────────────────────────────────────────────────────
function ResultToast({ result, dark, onDismiss }) {
  const success = result.type === "success";

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      zIndex: 9998, minWidth: 260, maxWidth: 340,
      background: success
        ? (dark ? "rgba(19,136,8,0.97)" : "#166534")
        : (dark ? "rgba(220,38,38,0.97)" : "#991B1B"),
      color: "#fff",
      borderRadius: 16, padding: "14px 18px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "rrc-slide-up 0.3s ease",
      border: `1px solid ${success ? "rgba(19,136,8,0.5)" : "rgba(220,38,38,0.5)"}`,
    }}>
      <span style={{
        fontSize: 22,
        animation: success ? "rrc-success 0.5s ease forwards" : "none",
      }}>
        {success ? "✅" : "❌"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>{result.title}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{result.sub}</div>
      </div>
      <div
        onClick={onDismiss}
        style={{
          cursor: "pointer", opacity: 0.7, fontSize: 16,
          transition: "opacity 0.15s", flexShrink: 0,
        }}
        onMouseOver={e => (e.currentTarget.style.opacity = "1")}
        onMouseOut={e  => (e.currentTarget.style.opacity = "0.7")}
      >
        ✕
      </div>
    </div>
  );
}
