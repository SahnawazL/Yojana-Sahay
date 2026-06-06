/**
 * UsageDataCleaner.jsx — Yojana Sahay Admin Dashboard
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar · SPDX-License-Identifier: MIT
 *
 * Cleans old entries from appStats/usage in Firestore.
 * Password-protected, terminal-styled admin utility.
 */

import React, { useState, useRef, useEffect } from "react";
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js";

// ── Design tokens (mirrors AdminDashboard) ──────────────────────────────────
const NAVY      = "#003580";
const SAFFRON   = "#FF9933";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";
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
const PASSWORD = "SHZ@home2026";

const RANGE_OPTIONS = [
  { label: "3 Months",  months: 3  },
  { label: "6 Months",  months: 6  },
  { label: "12 Months", months: 12 },
];

const KEYFRAMES = `
  @keyframes udc-shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
  @keyframes udc-in      { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes udc-spin    { to{transform:rotate(360deg)} }
  @keyframes udc-blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes udc-scan    { 0%{top:-3px} 100%{top:calc(100% + 3px)} }
  @keyframes udc-glow-a  { 0%,100%{box-shadow:0 0 0 0 rgba(255,153,51,0)} 50%{box-shadow:0 0 22px 2px rgba(255,153,51,0.35)} }
  @keyframes udc-glow-g  { 0%,100%{box-shadow:0 0 0 0 rgba(19,136,8,0)}   50%{box-shadow:0 0 22px 2px rgba(19,136,8,0.4)}  }
  @keyframes udc-glow-r  { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}  50%{box-shadow:0 0 20px 2px rgba(220,38,38,0.38)} }
  @keyframes udc-success { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.25) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes udc-line-in { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes udc-pulse-r { 0%,100%{border-color:rgba(220,38,38,0.3)} 50%{border-color:rgba(220,38,38,0.75)} }
`;

// ── Utility ──────────────────────────────────────────────────────────────────
function cutoffMs(months) {
  return Date.now() - months * 30 * 24 * 60 * 60 * 1000;
}
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
function pad(n, width = 3) {
  return String(n).padStart(width);
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function UsageDataCleaner({ dark = false, onDeleteDone }) {
  const th = THEME[dark ? "dark" : "light"];

  // ── Phase machine ─────────────────────────────────────────────────────────
  // locked → unlocked → scanning → confirm → cleaning → success
  const [phase,    setPhase]    = useState("locked");
  const [pwInput,  setPwInput]  = useState("");
  const [pwShake,  setPwShake]  = useState(false);
  const [pwError,  setPwError]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [range,    setRange]    = useState(3);
  const [logLines, setLogLines] = useState([]);
  const [preview,  setPreview]  = useState(null);
  const [progress, setProgress] = useState(0);
  const [result,   setResult]   = useState(null);

  const addLog = (line) => setLogLines(prev => [...prev, line]);

  // ── Unlock ────────────────────────────────────────────────────────────────
  function handleUnlock() {
    if (pwInput.trim() === PASSWORD) {
      setPwError("");
      setPwInput("");
      setPhase("unlocked");
    } else {
      setPwError("Access denied — invalid credentials.");
      setPwShake(true);
      setPwInput("");
      setTimeout(() => setPwShake(false), 550);
    }
  }

  // ── Scan ──────────────────────────────────────────────────────────────────
  async function handleScan() {
    setPhase("scanning");
    setLogLines([]);
    setPreview(null);

    addLog("> INITIALIZING scanner v2.3.1...");
    await delay(300);
    addLog("> AUTH: SHZ Admin session active");
    await delay(220);
    addLog("> TARGET: Firestore → appStats/usage");
    await delay(280);
    addLog("> CONNECTING...");

    let data;
    try {
      const snap = await getDoc(doc(db, "appStats", "usage"));
      data = snap.exists() ? snap.data() : {};
    } catch (err) {
      addLog(`> ❌ FIRESTORE ERROR: ${err.message}`);
      await delay(1600);
      setPhase("unlocked");
      return;
    }

    await delay(200);
    addLog("> DOCUMENT FETCHED — analyzing arrays...");
    await delay(320);

    const cut        = cutoffMs(range);
    const runs       = Array.isArray(data.checkerRuns)     ? data.checkerRuns     : [];
    const searches   = Array.isArray(data.schemeSearches)  ? data.schemeSearches  : [];
    const selections = Array.isArray(data.stateSelections) ? data.stateSelections : [];

    // Checker runs
    addLog(`>`);
    await delay(160);
    addLog(`> SCANNING checker_runs      [${pad(runs.length)} entries]`);
    await delay(420);
    const oldRuns = runs.filter(r => r.ts && new Date(r.ts).getTime() < cut);
    addLog(`> FLAGGED  ${pad(oldRuns.length)} entries exceed ${range}-month threshold`);
    await delay(260);

    // Scheme searches
    addLog(`>`);
    await delay(160);
    addLog(`> SCANNING scheme_searches   [${pad(searches.length)} entries]`);
    await delay(420);
    const oldSearches = searches.filter(r => r.ts && new Date(r.ts).getTime() < cut);
    addLog(`> FLAGGED  ${pad(oldSearches.length)} entries exceed ${range}-month threshold`);
    await delay(260);

    // State selections
    addLog(`>`);
    await delay(160);
    addLog(`> SCANNING state_selections  [${pad(selections.length)} entries]`);
    await delay(420);
    const oldSelections = selections.filter(r => r.ts && new Date(r.ts).getTime() < cut);
    addLog(`> FLAGGED  ${pad(oldSelections.length)} entries exceed ${range}-month threshold`);
    await delay(320);

    const total = oldRuns.length + oldSearches.length + oldSelections.length;
    addLog(`> ─────────────────────────────────────────`);
    await delay(220);
    addLog(`> SCAN COMPLETE — ${total} entr${total === 1 ? "y" : "ies"} flagged for deletion`);

    setPreview({
      runs:            oldRuns.length,
      searches:        oldSearches.length,
      selections:      oldSelections.length,
      total,
      totalRuns:       runs.length,
      totalSearches:   searches.length,
      totalSelections: selections.length,
    });

    await delay(500);
    setPhase("confirm");
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    setPhase("cleaning");
    setProgress(0);

    const cut = cutoffMs(range);

    await delay(260);
    setProgress(15);

    let data;
    try {
      const snap = await getDoc(doc(db, "appStats", "usage"));
      data = snap.exists() ? snap.data() : {};
    } catch (err) {
      setPhase("confirm");
      return;
    }

    await delay(320);
    setProgress(35);

    const runs       = Array.isArray(data.checkerRuns)     ? data.checkerRuns     : [];
    const searches   = Array.isArray(data.schemeSearches)  ? data.schemeSearches  : [];
    const selections = Array.isArray(data.stateSelections) ? data.stateSelections : [];

    const newRuns       = runs.filter(r       => !r.ts   || new Date(r.ts).getTime()   >= cut);
    const newSearches   = searches.filter(r   => !r.ts   || new Date(r.ts).getTime()   >= cut);
    const newSelections = selections.filter(r => !r.ts   || new Date(r.ts).getTime()   >= cut);

    await delay(360);
    setProgress(62);

    try {
      // checkerTotal & searchTotal are all-time counters — intentionally NOT updated
      await updateDoc(doc(db, "appStats", "usage"), {
        checkerRuns:     newRuns,
        schemeSearches:  newSearches,
        stateSelections: newSelections,
      });
    } catch (err) {
      setPhase("confirm");
      return;
    }

    await delay(380);
    setProgress(88);
    await delay(280);
    setProgress(100);
    await delay(340);

    setResult({
      removed: {
        runs:       runs.length       - newRuns.length,
        searches:   searches.length   - newSearches.length,
        selections: selections.length - newSelections.length,
      },
      remaining: {
        runs:       newRuns.length,
        searches:   newSearches.length,
        selections: newSelections.length,
      },
    });

    setPhase("success");
    if (onDeleteDone) onDeleteDone();
  }

  // ── Phase helpers ─────────────────────────────────────────────────────────
  const totalRemoved = result
    ? result.removed.runs + result.removed.searches + result.removed.selections
    : 0;

  const PHASE_STATUS = {
    locked:   { label: "LOCKED",   color: "#ff5f57",  bg: "rgba(220,38,38,0.22)",  border: "rgba(220,38,38,0.4)"  },
    unlocked: { label: "UNLOCKED", color: SAFFRON,    bg: "rgba(255,153,51,0.2)",  border: "rgba(255,153,51,0.45)" },
    scanning: { label: "SCANNING", color: "#60a5fa",  bg: "rgba(96,165,250,0.18)", border: "rgba(96,165,250,0.4)" },
    confirm:  { label: "DANGER",   color: "#ff5f57",  bg: "rgba(220,38,38,0.22)",  border: "rgba(220,38,38,0.4)"  },
    cleaning: { label: "PURGING",  color: SAFFRON,    bg: "rgba(255,153,51,0.2)",  border: "rgba(255,153,51,0.45)" },
    success:  { label: "DONE",     color: "#4ade80",  bg: "rgba(19,136,8,0.22)",   border: "rgba(19,136,8,0.5)"   },
  };
  const ps = PHASE_STATUS[phase] || PHASE_STATUS.locked;

  const PHASE_SUBTITLE = {
    locked:   "Password required — restricted admin operation",
    unlocked: `Time range: ${range} months · Ready to scan`,
    scanning: "Live-scanning Firestore arrays…",
    confirm:  `${preview?.total ?? 0} entries flagged for permanent deletion`,
    cleaning: "Filtering arrays and rewriting document…",
    success:  "Cleanup complete — document successfully rewritten",
  };

  const PHASE_ICON = {
    locked:   "🔒",
    unlocked: "🗂️",
    scanning: "🔍",
    confirm:  "⚠️",
    cleaning: "⚙️",
    success:  "✅",
  };

  const BORDER_COLOR =
    phase === "success"  ? "rgba(19,136,8,0.5)" :
    phase === "confirm"  ? "rgba(220,38,38,0.4)" :
    phase === "locked"   ? (dark ? "#2a2a2e" : "#e0e0e0") :
    "rgba(255,153,51,0.35)";

  const GLOW_ANIM =
    phase === "unlocked" || phase === "scanning" || phase === "cleaning" ? "udc-glow-a 2.5s ease-in-out infinite" :
    phase === "success"  ? "udc-glow-g 2.2s ease-in-out infinite" :
    phase === "confirm"  ? "udc-glow-r 2s ease-in-out infinite" :
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
          background: `linear-gradient(135deg, #07111f 0%, #0d1f3c 55%, #122040 100%)`,
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
          position: "relative", overflow: "hidden",
        }}>
          {/* Subtle grid texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            opacity: 0.045,
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
            ...(phase === "cleaning" ? { animation: "udc-spin 1.3s linear infinite" } : {}),
          }}>
            {PHASE_ICON[phase]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.15,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              Usage Data Cleaner
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: 0.8,
                color: "rgba(255,153,51,0.6)", fontFamily: "monospace",
              }}>
                v2.3.1
              </span>
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
            fontSize: 9, fontWeight: 800, flexShrink: 0,
            letterSpacing: 1,
            background: ps.bg,
            color: ps.color,
            border: `1px solid ${ps.border}`,
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
          {phase === "locked" && (
            <div style={{ animation: "udc-in 0.3s ease forwards" }}>

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
                    Restricted Admin Operation
                  </div>
                  <div style={{ fontSize: 10, color: dark ? "#888" : "#999", lineHeight: 1.6 }}>
                    Permanently removes old log entries from{" "}
                    <span style={{ fontFamily: "monospace", color: dark ? "#aaa" : "#555", fontWeight: 700 }}>
                      appStats/usage
                    </span>
                    . All-time counters are preserved. Cannot be undone.
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div style={{ animation: pwShake ? "udc-shake 0.5s ease" : "none" }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  color: dark ? "#666" : "#aaa", marginBottom: 8,
                  fontFamily: "monospace",
                }}>
                  ● ADMIN AUTHENTICATION
                </div>

                <div style={{ position: "relative", marginBottom: 14 }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwInput}
                    onChange={e => { setPwInput(e.target.value); setPwError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleUnlock()}
                    placeholder="Enter admin password"
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
                      e.target.style.boxShadow   = `0 0 0 3px rgba(255,153,51,0.12)`;
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
                  onClick={handleUnlock}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: 12,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #06122b 0%, #0d2254 50%, #003580 100%)",
                    color: "#fff", fontSize: 13, fontWeight: 800,
                    cursor: "pointer", letterSpacing: 0.9,
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: `0 5px 20px rgba(0,53,128,0.45)`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "opacity 0.15s, transform 0.15s",
                  }}
                  onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseOut={e  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  🔓 UNLOCK ACCESS
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE: UNLOCKED — configure
          ═══════════════════════════════════════════ */}
          {phase === "unlocked" && (
            <div style={{ animation: "udc-in 0.3s ease forwards", display: "flex", flexDirection: "column", gap: 16 }}>

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
                  animation: "udc-blink 2s ease-in-out infinite",
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: IND_GREEN }}>
                    Access Granted — SHZ Admin
                  </span>
                  <div style={{ fontSize: 10, color: dark ? "#888" : "#999", marginTop: 1 }}>
                    Select deletion window, then scan to preview affected entries
                  </div>
                </div>
                <div
                  onClick={() => { setPhase("locked"); setPwInput(""); setPwError(""); }}
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

              {/* Time range selector */}
              <div>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  color: dark ? "#666" : "#aaa", marginBottom: 10,
                  fontFamily: "monospace",
                }}>
                  ● DELETE ENTRIES OLDER THAN
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {RANGE_OPTIONS.map(({ label, months }) => {
                    const active = range === months;
                    return (
                      <div
                        key={months}
                        onClick={() => setRange(months)}
                        style={{
                          flex: 1, padding: "13px 8px", borderRadius: 12,
                          textAlign: "center", cursor: "pointer",
                          border: `1.5px solid ${active ? SAFFRON : (dark ? "#272729" : "#e8e8e8")}`,
                          background: active
                            ? (dark ? "rgba(255,153,51,0.1)" : "rgba(255,153,51,0.07)")
                            : (dark ? "#141416" : "#f8f9fa"),
                          boxShadow: active ? `0 0 14px rgba(255,153,51,0.22), inset 0 0 0 1px rgba(255,153,51,0.1)` : "none",
                          transition: "all 0.2s cubic-bezier(0.22,1,0.36,1)",
                          position: "relative", overflow: "hidden",
                        }}
                      >
                        {/* Active shine */}
                        {active && (
                          <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                            background: "linear-gradient(180deg, rgba(255,153,51,0.08) 0%, transparent 100%)",
                            borderRadius: "10px 10px 0 0",
                            pointerEvents: "none",
                          }} />
                        )}
                        <div style={{
                          fontSize: 18, fontWeight: 900,
                          color: active ? SAFFRON : (dark ? "#555" : "#bbb"),
                          fontFamily: "monospace", lineHeight: 1,
                          transition: "color 0.2s",
                        }}>
                          {months}
                          <span style={{ fontSize: 10 }}>M</span>
                        </div>
                        <div style={{
                          fontSize: 9, fontWeight: 700, marginTop: 4,
                          color: active ? (dark ? "rgba(255,153,51,0.8)" : "#d97706") : (dark ? "#444" : "#ccc"),
                          transition: "color 0.2s",
                        }}>
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{
                  fontSize: 10, color: dark ? "#555" : "#bbb", marginTop: 8,
                  textAlign: "center", fontStyle: "italic",
                }}>
                  Will remove entries with timestamps older than {range} months
                </div>
              </div>

              {/* Scan button */}
              <div
                onClick={handleScan}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "13px 16px", borderRadius: 12,
                  textAlign: "center", cursor: "pointer",
                  background: "linear-gradient(135deg, #1a0840 0%, #2d1060 45%, #3b1a7a 100%)",
                  color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.8,
                  border: `1px solid ${VIOLET}55`,
                  boxShadow: `0 5px 22px rgba(139,92,246,0.35)`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ fontSize: 15 }}>🔍</span> SCAN USAGE DATA
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE: SCANNING
          ═══════════════════════════════════════════ */}
          {phase === "scanning" && (
            <div style={{ animation: "udc-in 0.25s ease forwards" }}>
              <TerminalBox lines={logLines} scanning />
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE: CONFIRM
          ═══════════════════════════════════════════ */}
          {phase === "confirm" && preview && (
            <div style={{ animation: "udc-in 0.3s ease forwards", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Terminal output */}
              <TerminalBox lines={logLines} done />

              {/* Preview data rows */}
              <div>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  color: dark ? "#666" : "#aaa", marginBottom: 10,
                  fontFamily: "monospace",
                }}>
                  ● ENTRIES FLAGGED FOR DELETION
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { label: "Checker Runs",     icon: "🧮", old: preview.runs,       total: preview.totalRuns,       color: NAVY    },
                    { label: "Scheme Searches",  icon: "🔍", old: preview.searches,   total: preview.totalSearches,   color: VIOLET  },
                    { label: "State Selections", icon: "📍", old: preview.selections, total: preview.totalSelections, color: SAFFRON },
                  ].map((row, i) => (
                    <DataPreviewRow key={row.label} {...row} dark={dark} delay={i * 80} />
                  ))}
                </div>
              </div>

              {/* Danger summary */}
              <div style={{
                background: dark ? "rgba(220,38,38,0.08)" : "#fff5f5",
                border: `1.5px solid rgba(220,38,38,0.32)`,
                borderRadius: 13, padding: "13px 14px",
                animation: preview.total > 0 ? "udc-pulse-r 2s ease-in-out infinite" : "none",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: DANGER, marginBottom: 4 }}>
                    {preview.total === 0 ? "✅ Nothing to Delete" : "⚠️ Permanent Deletion Warning"}
                  </div>
                  <div style={{ fontSize: 10, color: dark ? "#888" : "#999", lineHeight: 1.55 }}>
                    {preview.total === 0
                      ? "No entries fall outside the selected time range. Try a shorter window."
                      : `${preview.total} log entr${preview.total === 1 ? "y" : "ies"} will be permanently removed from Firestore. This action cannot be undone.`}
                  </div>
                </div>
                {preview.total > 0 && (
                  <div style={{
                    fontSize: 26, fontWeight: 900, color: DANGER,
                    fontFamily: "monospace", flexShrink: 0,
                    textShadow: `0 0 12px rgba(220,38,38,0.4)`,
                  }}>
                    {preview.total}
                  </div>
                )}
              </div>

              {/* Action row */}
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  onClick={() => { setPhase("unlocked"); setPreview(null); setLogLines([]); }}
                  style={{
                    flex: 1, padding: "11px", borderRadius: 12, textAlign: "center",
                    background: dark ? "#141416" : "#f8f9fa",
                    border: `1.5px solid ${dark ? "#272729" : "#e0e0e0"}`,
                    color: dark ? "#888" : "#666", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "opacity 0.15s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = "0.72")}
                  onMouseOut={e  => (e.currentTarget.style.opacity = "1")}
                >
                  ← Change Range
                </div>

                {preview.total > 0 ? (
                  <div
                    onClick={handleDelete}
                    style={{
                      flex: 2.2, padding: "11px 14px", borderRadius: 12, textAlign: "center",
                      background: "linear-gradient(135deg, #6b0f0f 0%, #991b1b 50%, #DC2626 100%)",
                      color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: 0.6,
                      cursor: "pointer",
                      border: "1px solid rgba(220,38,38,0.45)",
                      boxShadow: "0 5px 18px rgba(220,38,38,0.32)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "opacity 0.15s, transform 0.15s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseOut={e  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    🗑️ PURGE {preview.total} ENTR{preview.total === 1 ? "Y" : "IES"}
                  </div>
                ) : (
                  <div style={{
                    flex: 2.2, padding: "11px", borderRadius: 12, textAlign: "center",
                    background: dark ? "#141416" : "#f8f9fa",
                    border: `1.5px solid ${dark ? "#272729" : "#e0e0e0"}`,
                    color: dark ? "#444" : "#ccc", fontSize: 12, fontWeight: 700,
                  }}>
                    Nothing to delete
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE: CLEANING
          ═══════════════════════════════════════════ */}
          {phase === "cleaning" && (
            <div style={{ animation: "udc-in 0.25s ease forwards" }}>
              <div style={{
                background: dark ? "#141416" : "#f8f9fa",
                border: `1.5px solid ${dark ? "#272729" : "#e8e8e8"}`,
                borderRadius: 16, padding: "26px 18px",
                textAlign: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* Scan sweep line */}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2, pointerEvents: "none",
                  background: `linear-gradient(90deg, transparent 0%, ${SAFFRON}aa 30%, ${SAFFRON} 50%, ${SAFFRON}aa 70%, transparent 100%)`,
                  animation: "udc-scan 1.6s linear infinite",
                }} />

                <div style={{
                  fontSize: 30, marginBottom: 12,
                  display: "inline-block",
                  animation: "udc-spin 1.3s linear infinite",
                }}>
                  ⚙️
                </div>

                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: dark ? "#f0f0f0" : "#1a1a1a",
                  marginBottom: 6, letterSpacing: 0.2,
                }}>
                  Rewriting Firestore Document
                </div>
                <div style={{
                  fontSize: 10, color: dark ? "#555" : "#bbb",
                  marginBottom: 22, fontFamily: "monospace",
                }}>
                  Filtering arrays · committing changes…
                </div>

                {/* Progress bar */}
                <div style={{
                  height: 7, borderRadius: 10,
                  background: dark ? "#222226" : "#e8e8e8",
                  overflow: "hidden", position: "relative",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 10,
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${NAVY} 0%, #1a56db 50%, ${SAFFRON} 100%)`,
                    transition: "width 0.42s cubic-bezier(0.22,1,0.36,1)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
                      animation: "udc-scan 1.2s linear infinite",
                    }} />
                  </div>
                </div>

                <div style={{
                  fontSize: 12, fontWeight: 800,
                  color: progress === 100 ? IND_GREEN : SAFFRON,
                  marginTop: 10, fontFamily: "monospace",
                  transition: "color 0.3s",
                }}>
                  {progress}%
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE: SUCCESS
          ═══════════════════════════════════════════ */}
          {phase === "success" && result && (
            <div style={{ animation: "udc-in 0.35s ease forwards", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Hero success card */}
              <div style={{
                background: dark ? "rgba(19,136,8,0.08)" : "#f0fdf4",
                border: "1.5px solid rgba(19,136,8,0.32)",
                borderRadius: 16, padding: "22px 16px",
                textAlign: "center",
                animation: "udc-glow-g 2.2s ease-in-out infinite",
                position: "relative", overflow: "hidden",
              }}>
                {/* Success shimmer */}
                <div style={{
                  position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(19,136,8,0.06), transparent)",
                  animation: "udc-scan 3s linear infinite",
                  transform: "skewX(-20deg)",
                  pointerEvents: "none",
                }} />

                <div style={{
                  fontSize: 36, marginBottom: 10,
                  display: "inline-block",
                  animation: "udc-success 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards",
                }}>
                  ✅
                </div>

                <div style={{
                  fontSize: 16, fontWeight: 900,
                  color: IND_GREEN, marginBottom: 5, letterSpacing: 0.2,
                }}>
                  Purge Complete
                </div>
                <div style={{ fontSize: 11, color: dark ? "#888" : "#999" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, color: dark ? "#f0f0f0" : "#1a1a1a" }}>
                    {totalRemoved}
                  </span>{" "}
                  entr{totalRemoved === 1 ? "y" : "ies"} removed ·{" "}
                  <span style={{ fontWeight: 700 }}>{range}-month</span> window applied
                </div>
              </div>

              {/* Breakdown table */}
              <div>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                  color: dark ? "#666" : "#aaa", marginBottom: 10,
                  fontFamily: "monospace",
                }}>
                  ● DELETION SUMMARY
                </div>
                {[
                  { label: "Checker Runs",     icon: "🧮", removed: result.removed.runs,       remaining: result.remaining.runs,       color: NAVY    },
                  { label: "Scheme Searches",  icon: "🔍", removed: result.removed.searches,   remaining: result.remaining.searches,   color: VIOLET  },
                  { label: "State Selections", icon: "📍", removed: result.removed.selections, remaining: result.remaining.selections, color: SAFFRON },
                ].map((row, i) => (
                  <SuccessResultRow key={row.label} {...row} dark={dark} delayMs={i * 90} />
                ))}
              </div>

              {/* Info footer */}
              <div style={{
                background: dark ? "#141416" : "#f8f9fa",
                border: `1px solid ${dark ? "#272729" : "#e8e8e8"}`,
                borderRadius: 10, padding: "10px 13px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
                <div style={{
                  fontSize: 10, color: dark ? "#555" : "#aaa",
                  fontFamily: "monospace",
                }}>
                  <span style={{ color: dark ? "#aaa" : "#555", fontWeight: 700 }}>
                    checkerTotal
                  </span>{" "}
                  &amp;{" "}
                  <span style={{ color: dark ? "#aaa" : "#555", fontWeight: 700 }}>
                    searchTotal
                  </span>{" "}
                  preserved — all-time counters untouched
                </div>
              </div>

              {/* Lock button */}
              <div
                onClick={() => {
                  setPhase("locked");
                  setPwInput(""); setPwError(""); setShowPw(false);
                  setPreview(null); setResult(null);
                  setLogLines([]); setProgress(0);
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
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// ── Terminal log box ─────────────────────────────────────────────────────────
function TerminalBox({ lines, scanning, done }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines]);

  function lineColor(line) {
    if (line.startsWith("> ❌"))                 return "#ff5f57";
    if (line.startsWith("> SCAN COMPLETE"))       return "#4ade80";
    if (line.startsWith("> AUTH") || line.startsWith("> TARGET")) return "rgba(255,153,51,0.9)";
    if (line.startsWith("> FLAGGED"))             return "#fbbf24";
    if (line.startsWith("> ─"))                   return "rgba(255,255,255,0.15)";
    if (line === ">")                              return "rgba(255,255,255,0.08)";
    return "#a3c4f3";
  }

  return (
    <div style={{
      background: "#070d14",
      border: "1.5px solid rgba(255,255,255,0.07)",
      borderRadius: 13, padding: "14px 14px 12px",
      minHeight: 130, maxHeight: 210, overflowY: "auto",
      position: "relative",
      scrollbarWidth: "none",
    }}>
      {/* macOS-style dots */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
      }}>
        {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
          <div key={c} style={{
            width: 9, height: 9, borderRadius: "50%",
            background: done ? c : `${c}55`,
            transition: "background 0.3s",
          }} />
        ))}
        <span style={{
          fontSize: 8, color: "rgba(255,255,255,0.18)",
          marginLeft: 6, letterSpacing: 1, fontFamily: "monospace",
        }}>
          FIRESTORE SCANNER
        </span>
      </div>

      {/* Log lines */}
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize: 10, lineHeight: 1.9,
            fontFamily: "'SF Mono','Fira Code','Courier New',monospace",
            color: lineColor(line),
            animation: "udc-line-in 0.18s ease forwards",
          }}
        >
          {line}
        </div>
      ))}

      {/* Blinking cursor while scanning */}
      {scanning && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          marginTop: 2,
        }}>
          <span style={{
            fontSize: 10, color: "rgba(255,255,255,0.2)",
            fontFamily: "monospace",
          }}>$</span>
          <span style={{
            fontSize: 12, color: "rgba(255,153,51,0.7)",
            animation: "udc-blink 1s step-end infinite",
            fontFamily: "monospace",
          }}>█</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

// ── Data preview row (confirm phase) ────────────────────────────────────────
function DataPreviewRow({ icon, label, old, total, color, dark, delay: delayMs = 0 }) {
  const pct = total > 0 ? Math.round((old / total) * 100) : 0;
  return (
    <div style={{
      background: dark ? "#141416" : "#f8f9fa",
      border: `1.5px solid ${dark ? "#272729" : "#e8e8e8"}`,
      borderRadius: 11, padding: "10px 13px",
      display: "flex", alignItems: "center", gap: 11,
      animation: `udc-in 0.3s ${delayMs}ms ease both`,
    }}>
      <span style={{ fontSize: 17, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: dark ? "#e0e0e0" : "#1a1a1a",
          marginBottom: 6,
        }}>
          {label}
        </div>
        <div style={{
          height: 5, borderRadius: 5,
          background: dark ? "#222226" : "#e8e8e8",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 5,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
            minWidth: old > 0 ? 4 : 0,
          }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 900,
          color: old > 0 ? DANGER : (dark ? "#444" : "#ccc"),
          fontFamily: "monospace",
          textShadow: old > 0 ? `0 0 10px rgba(220,38,38,0.3)` : "none",
        }}>
          {old > 0 ? `−${old}` : "0"}
        </div>
        <div style={{ fontSize: 9, color: dark ? "#444" : "#ccc", marginTop: 1 }}>
          of {total}
        </div>
      </div>
    </div>
  );
}

// ── Success result row ────────────────────────────────────────────────────────
function SuccessResultRow({ icon, label, removed, remaining, color, dark, delayMs = 0 }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0",
      borderBottom: `1px solid ${dark ? "#1e1e20" : "#f0f0f0"}`,
      animation: `udc-in 0.3s ${delayMs}ms ease both`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: dark ? "#e0e0e0" : "#1a1a1a" }}>
          {label}
        </div>
        <div style={{ fontSize: 9, color: dark ? "#555" : "#bbb", marginTop: 2 }}>
          {remaining} entries remaining
        </div>
      </div>
      <div style={{
        padding: "4px 12px", borderRadius: 8, flexShrink: 0,
        fontSize: 12, fontWeight: 900, fontFamily: "monospace",
        background: removed > 0
          ? (dark ? "rgba(220,38,38,0.1)" : "#fff5f5")
          : (dark ? "#141416" : "#f8f9fa"),
        color: removed > 0 ? "#DC2626" : (dark ? "#444" : "#ccc"),
        border: `1px solid ${removed > 0 ? "rgba(220,38,38,0.28)" : (dark ? "#272729" : "#e0e0e0")}`,
      }}>
        {removed > 0 ? `−${removed}` : "—"}
      </div>
    </div>
  );
}
