/**
 * SchemeVerifier.jsx — Yojana Sahay Admin Dashboard · Scheme URL Verifier Tab
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Consumed by AdminDashboard.jsx as: <SchemeVerifier dark={dark} isDesktop={isDesktop} />
 *
 * Features:
 *   · Scope filter  — All / National / By State
 *   · Priority filter — All / Has Deadline / Never Verified / Stale 30d+
 *   · Tier selector — Tier 1 (dead-link ping) / Tier 2 (AI date extract) / Both
 *   · Preview count before run
 *   · Checkpoint detection with Resume / Dismiss
 *   · Progress bar + live current-scheme label
 *   · Live mini stat cards during run
 *   · Full 8-card summary post-run
 *   · Filterable, paginated results list with expand-to-detail rows
 *   · Stop mid-run via AbortController
 *   · New Run reset
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import {
  runVerification,
  buildSummary,
  loadCheckpoint,
  clearCheckpoint,
  getVerifiableCount,
  getStatesInDB,
} from "./verifySchemes.js";

// ─── THEME ────────────────────────────────────────────────────────────────────
// Mirrors AdminDashboard.jsx THEME exactly so the tab blends in.
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#fff",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";
const PINK      = "#EC4899";
const RED       = "#DC2626";
const AMBER     = "#F59E0B";

const PAGE_SIZE     = 20;
const THIRTY_DAYS   = 30 * 24 * 60 * 60 * 1000;

// ─── MINI STAT CARD ───────────────────────────────────────────────────────────
function MiniCard({ icon, label, value, color, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      background: th.card,
      border: `1.5px solid ${th.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: 12,
      padding: "10px 11px",
      flex: "1 1 70px",
      minWidth: 70,
    }}>
      <div style={{ fontSize: 14 }}>{icon}</div>
      <div style={{
        fontSize: 18, fontWeight: 800, color: th.text,
        lineHeight: 1, marginTop: 4,
      }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: 9, color: th.textSub, marginTop: 2, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ value, total, color, dark }) {
  const th  = THEME[dark ? "dark" : "light"];
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 6,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: th.text }}>
          {value} / {total} schemes
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>
          {pct}%
        </span>
      </div>
      <div style={{
        height: 8, background: th.border,
        borderRadius: 6, overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 6,
          transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)",
          minWidth: value > 0 ? 8 : 0,
        }} />
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ result }) {
  if (!result) return null;
  let dot, label, color, bg;

  if (result.error && result.alive === null) {
    [dot, label, color, bg] = ["🟣", "Error",       VIOLET,    "rgba(139,92,246,0.12)"];
  } else if (result.alive === true) {
    [dot, label, color, bg] = ["🟢", "Active",      IND_GREEN, "rgba(19,136,8,0.12)"];
  } else if (result.alive === false) {
    [dot, label, color, bg] = ["🔴", "Dead",        RED,       "rgba(220,38,38,0.12)"];
  } else {
    [dot, label, color, bg] = ["🟡", "No Response", AMBER,     "rgba(245,158,11,0.12)"];
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "2px 8px", borderRadius: 8,
      fontSize: 9, fontWeight: 700,
      color, background: bg,
      whiteSpace: "nowrap",
    }}>
      {dot} {label}
    </span>
  );
}

// ─── RESULT ROW ───────────────────────────────────────────────────────────────
function ResultRow({ result, dark }) {
  const th     = THEME[dark ? "dark" : "light"];
  const scheme = result.scheme;
  const [expanded, setExpanded] = useState(false);

  const now = Date.now();
  const ld  = scheme.lastDate ? new Date(scheme.lastDate).getTime() : null;
  const isExpired      = ld && ld < now;
  const isExpiringSoon = ld && !isExpired && (ld - now < THIRTY_DAYS);

  const accentColor =
    result.alive === true  ? IND_GREEN :
    result.alive === false ? RED :
    result.error           ? VIOLET : AMBER;

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        padding: "10px 14px",
        borderBottom: `1px solid ${th.border}`,
        borderLeft: `3px solid ${accentColor}`,
        cursor: "pointer",
      }}
    >
      {/* ── Row header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>

        {/* Left: name + URL + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: th.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: "100%",
            }}>
              {scheme.name?.en || scheme.id}
            </span>
            {isExpired && (
              <span style={{
                fontSize: 8, fontWeight: 800, color: RED,
                background: "rgba(220,38,38,0.1)",
                padding: "1px 5px", borderRadius: 4, flexShrink: 0,
              }}>
                EXPIRED
              </span>
            )}
            {isExpiringSoon && (
              <span style={{
                fontSize: 8, fontWeight: 800, color: AMBER,
                background: "rgba(245,158,11,0.1)",
                padding: "1px 5px", borderRadius: 4, flexShrink: 0,
              }}>
                EXPIRING SOON
              </span>
            )}
          </div>

          <div style={{
            fontSize: 9, color: th.textSub, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {scheme.apply?.en || "—"}
          </div>

          {scheme.lastDate && (
            <div style={{
              fontSize: 9, marginTop: 2,
              color: isExpired ? RED : isExpiringSoon ? AMBER : th.textSub,
              fontWeight: isExpired || isExpiringSoon ? 700 : 400,
            }}>
              📅 Deadline: {scheme.lastDate}
            </div>
          )}
        </div>

        {/* Right: badge + HTTP + chevron */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "flex-end", gap: 4, flexShrink: 0,
        }}>
          <StatusBadge result={result} />
          {result.httpStatus > 0 && (
            <span style={{ fontSize: 9, color: th.textSub }}>
              HTTP {result.httpStatus}
            </span>
          )}
          <span style={{ fontSize: 9, color: th.textSub, lineHeight: 1 }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{
          marginTop: 8, padding: "10px 12px",
          background: th.card2, borderRadius: 8,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {[
            ["Scheme ID",    scheme.id],
            ["Scope",        `${scheme.scope}${scheme.state ? ` · ${scheme.state}` : ""}`],
            ["Check Tier",   `Tier ${result.tier}`],
            ["HTTP Status",  result.httpStatus != null ? String(result.httpStatus) : "—"],
            ["AI lastDate",  result.lastDate || "—"],
            ["AI isActive",  result.isActive === true ? "Yes ✅" : result.isActive === false ? "No ❌" : "—"],
            ["Confidence",   result.confidence != null ? `${Math.round(result.confidence * 100)}%` : "—"],
            ["Scheme lastDate", scheme.lastDate || "—"],
            ["Error",        result.error || "None"],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: "flex", gap: 8, fontSize: 10, padding: "1px 0",
            }}>
              <span style={{ color: th.textSub, width: 100, flexShrink: 0 }}>{k}</span>
              <span style={{
                color: th.text, fontWeight: 600, wordBreak: "break-all",
              }}>
                {v}
              </span>
            </div>
          ))}

          {scheme.apply?.en && (
            <a
              href={scheme.apply.en}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: "block", marginTop: 6,
                fontSize: 10, color: NAVY,
                textDecoration: "none",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              🔗 Open URL →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ message, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      padding: "28px 16px", textAlign: "center",
      color: th.textSub, fontSize: 12,
    }}>
      {message}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SchemeVerifier({ dark, isDesktop }) {
  const th = THEME[dark ? "dark" : "light"];

  // ── Config ────────────────────────────────────────────────────────────────
  const [scopeMode,      setScopeMode]      = useState("all");  // "all" | "national" | "state"
  const [selectedState,  setSelectedState]  = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tier,           setTier]           = useState(1);      // 1 | 2 | "both"

  // ── DB metadata ───────────────────────────────────────────────────────────
  const [availableStates,  setAvailableStates]  = useState([]);
  const [previewCount,     setPreviewCount]     = useState(0);
  const [checkpoint,       setCheckpoint]       = useState(null);
  const [checkpointLoaded, setCheckpointLoaded] = useState(false);

  // ── Run state ─────────────────────────────────────────────────────────────
  const [running,       setRunning]       = useState(false);
  const [progress,      setProgress]      = useState(null);   // { index, total }
  const [currentScheme, setCurrentScheme] = useState(null);
  const [results,       setResults]       = useState([]);
  const [summary,       setSummary]       = useState(null);
  const [runDone,       setRunDone]       = useState(false);
  const [wasAborted,    setWasAborted]    = useState(false);

  // ── Results view ──────────────────────────────────────────────────────────
  const [resultFilter, setResultFilter] = useState("all");
  const [page,         setPage]         = useState(1);

  const abortRef      = useRef(null);
  const accResultsRef = useRef([]);  // avoids stale-closure issue in onProgress

  // ── Computed scope filter string ──────────────────────────────────────────
  const scopeFilter = useMemo(() => {
    if (scopeMode === "state") {
      return selectedState ? `state:${selectedState}` : "all";
    }
    return scopeMode;
  }, [scopeMode, selectedState]);

  // ── Can the Start button be pressed? ─────────────────────────────────────
  const canStart = previewCount > 0 && !(scopeMode === "state" && !selectedState);

  // ── Init: load states + checkpoint ───────────────────────────────────────
  useEffect(() => {
    setAvailableStates(getStatesInDB());
    loadCheckpoint().then(cp => {
      // Only surface checkpoint if it's a real in-progress run, not cleared / completed
      const valid = cp && !cp.cleared && !cp.isComplete && cp.completedIndex > 0;
      setCheckpoint(valid ? cp : null);
      setCheckpointLoaded(true);
    });
  }, []);

  // ── Update preview count whenever filters change ──────────────────────────
  useEffect(() => {
    setPreviewCount(getVerifiableCount(scopeFilter, priorityFilter));
  }, [scopeFilter, priorityFilter]);

  // ── START / RESUME ────────────────────────────────────────────────────────
  const handleStart = useCallback(async (resumeFrom = 0) => {
    if (running) return;

    if (resumeFrom === 0) {
      // Fresh run — wipe previous results
      accResultsRef.current = [];
      setResults([]);
      setSummary(null);
      setRunDone(false);
      setWasAborted(false);
      setProgress(null);
      await clearCheckpoint();
    }

    setRunning(true);
    setPage(1);
    setResultFilter("all");

    const controller = new AbortController();
    abortRef.current  = controller;

    try {
      await runVerification({
        scopeFilter,
        priorityFilter,
        tier,
        resumeFrom,
        signal: controller.signal,

        onProgress: ({ index, total, scheme, result }) => {
          accResultsRef.current.push(result);
          const snap = [...accResultsRef.current];
          setProgress({ index, total });
          setCurrentScheme(scheme?.name?.en || scheme?.id || "…");
          setResults(snap);
          setSummary(buildSummary(snap));
        },

        onBatchSaved: (cp) => {
          setCheckpoint(cp);
        },
      });
    } catch (err) {
      console.error("[SchemeVerifier] Unexpected run error:", err);
    }

    setWasAborted(controller.signal.aborted);
    setRunning(false);
    setCurrentScheme(null);
    setRunDone(true);
  }, [running, scopeFilter, priorityFilter, tier]);

  // ── STOP ──────────────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── RESET to config screen ────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    accResultsRef.current = [];
    setResults([]);
    setSummary(null);
    setProgress(null);
    setRunDone(false);
    setWasAborted(false);
    setPage(1);
    setResultFilter("all");
  }, []);

  // ── Filtered + paginated results ──────────────────────────────────────────
  const filteredResults = useMemo(() => {
    switch (resultFilter) {
      case "active":     return results.filter(r => r.alive === true);
      case "dead":       return results.filter(r => r.alive === false);
      case "noResponse": return results.filter(r => r.alive === null && !r.error);
      case "error":      return results.filter(r => !!r.error);
      default:           return results;
    }
  }, [results, resultFilter]);

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
  const pageSlice  = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Shared select style ───────────────────────────────────────────────────
  const selectSt = {
    flex: 1, padding: "8px 10px", borderRadius: 10,
    border: `1.5px solid ${th.border}`,
    background: th.inputBg, color: th.text,
    fontSize: 11, fontFamily: "inherit", outline: "none",
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      padding:       isDesktop ? "24px 40px 40px" : "14px 14px 32px",
      display:       "flex",
      flexDirection: "column",
      gap:           14,
      maxWidth:      isDesktop ? 900 : "100%",
      margin:        isDesktop ? "0 auto" : undefined,
      width:         "100%",
      boxSizing:     "border-box",
    }}>

      {/* ══ HEADER ═══════════════════════════════════════════════════════════ */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: th.text }}>
          🔍 Scheme URL Verifier
        </div>
        <div style={{ fontSize: 11, color: th.textSub, marginTop: 3 }}>
          Ping apply URLs · Detect dead links · Extract deadlines via AI
        </div>
      </div>

      {/* ══ CHECKPOINT BANNER ════════════════════════════════════════════════ */}
      {checkpointLoaded && checkpoint && !running && results.length === 0 && (
        <div style={{
          background: dark ? "rgba(255,153,51,0.07)" : "rgba(255,153,51,0.09)",
          border:     `1.5px solid ${SAFFRON}50`,
          borderRadius: 12,
          padding: "12px 14px",
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <div style={{ fontSize: 20, flexShrink: 0 }}>⏸️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: th.text }}>
              Previous run paused
            </div>
            <div style={{ fontSize: 10, color: th.textMid, marginTop: 2 }}>
              {checkpoint.completedIndex} / {checkpoint.total} done
              {checkpoint.scopeFilter && ` · ${checkpoint.scopeFilter}`}
              {checkpoint.priorityFilter && checkpoint.priorityFilter !== "all"
                && ` · priority: ${checkpoint.priorityFilter}`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <div
              onClick={() => handleStart(checkpoint.completedIndex)}
              style={{
                padding: "6px 12px", borderRadius: 8,
                fontSize: 11, fontWeight: 700,
                background: SAFFRON, color: "#fff", cursor: "pointer",
              }}
            >
              Resume
            </div>
            <div
              onClick={async () => { await clearCheckpoint(); setCheckpoint(null); }}
              style={{
                padding: "6px 12px", borderRadius: 8,
                fontSize: 11, fontWeight: 700,
                background: th.border, color: th.textMid, cursor: "pointer",
              }}
            >
              Dismiss
            </div>
          </div>
        </div>
      )}

      {/* ══ CONFIG PANEL — hidden once run has results ════════════════════════ */}
      {!running && results.length === 0 && (
        <div style={{
          background: th.card,
          border: `1.5px solid ${th.border}`,
          borderRadius: 16,
          padding: "16px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
            ⚙️ Verification Settings
          </div>

          {/* Scope + Priority */}
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={scopeMode}
              onChange={e => { setScopeMode(e.target.value); setSelectedState(""); }}
              style={selectSt}
            >
              <option value="all">🌍 All Schemes</option>
              <option value="national">🏛️ National Only</option>
              <option value="state">📍 By State</option>
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={selectSt}
            >
              <option value="all">⭐ All Priority</option>
              <option value="hasDate">📅 Has Deadline</option>
              <option value="neverVerified">🆕 Never Verified</option>
              <option value="stale">🕰️ Stale (30d+)</option>
            </select>
          </div>

          {/* State picker — only when scope=state */}
          {scopeMode === "state" && (
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={selectSt}
            >
              <option value="">— Select a State —</option>
              {availableStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Tier toggle */}
          <div style={{ display: "flex", gap: 6 }}>
            {[
              [1,      "Tier 1",  "Dead-link ping · fast"],
              [2,      "Tier 2",  "AI date extract · slow"],
              ["both", "Both",    "Full check · thorough"],
            ].map(([val, label, sub]) => {
              const active = tier === val;
              return (
                <div
                  key={val}
                  onClick={() => setTier(val)}
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: 10,
                    cursor: "pointer",
                    border: `1.5px solid ${active ? NAVY : th.border}`,
                    background: active
                      ? (dark ? "rgba(0,53,128,0.2)" : "rgba(0,53,128,0.07)")
                      : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: active ? NAVY : th.text,
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 9, color: th.textSub, marginTop: 2 }}>
                    {sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview count pill */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 13px",
            background: th.card2, borderRadius: 9,
          }}>
            <span style={{ fontSize: 11, color: th.textMid }}>Schemes in queue:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>
              {scopeMode === "state" && !selectedState
                ? <span style={{ fontSize: 11, color: th.textSub }}>← pick a state first</span>
                : previewCount}
            </span>
          </div>

          {/* Tier 2 / Both warning */}
          {(tier === 2 || tier === "both") && (
            <div style={{
              padding: "8px 12px", borderRadius: 8,
              background: dark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${AMBER}30`,
              fontSize: 10, color: th.textMid, lineHeight: 1.5,
            }}>
              ⚠️ Tier 2 calls <strong style={{ color: th.text }}>/api/verify-scheme</strong> for
              each priority scheme — uses Groq credits. Tier 1 is free and much faster.
            </div>
          )}

          {/* Start button */}
          <div
            onClick={canStart ? () => handleStart(0) : undefined}
            style={{
              padding: "13px", borderRadius: 12, textAlign: "center",
              background: canStart
                ? `linear-gradient(135deg, ${NAVY} 0%, #004db3 100%)`
                : th.border,
              color:      canStart ? "#fff" : th.textSub,
              fontWeight: 800, fontSize: 13,
              cursor:     canStart ? "pointer" : "default",
              opacity:    canStart ? 1 : 0.5,
              transition: "all 0.2s",
              boxShadow:  canStart ? "0 4px 18px rgba(0,53,128,0.3)" : "none",
              userSelect: "none",
            }}
          >
            🚀 Start Verification
            {canStart && (
              <span style={{ fontWeight: 500, opacity: 0.85, marginLeft: 6 }}>
                · {previewCount} scheme{previewCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ══ RUNNING PANEL ════════════════════════════════════════════════════ */}
      {running && (
        <div style={{
          background: th.card,
          border: `1.5px solid ${NAVY}40`,
          borderRadius: 16,
          padding: "16px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Running header + Stop */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, fontWeight: 800, color: th.text,
            }}>
              <span style={{
                display: "inline-block",
                width: 8, height: 8, borderRadius: "50%",
                background: IND_GREEN,
                boxShadow: `0 0 0 3px ${IND_GREEN}30`,
                animation: "sv-pulse 1.4s ease infinite",
              }} />
              Verifying…
            </div>
            <div
              onClick={handleStop}
              style={{
                padding: "6px 14px", borderRadius: 8,
                fontSize: 11, fontWeight: 700,
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.28)",
                color: RED, cursor: "pointer",
              }}
            >
              ⏹ Stop
            </div>
          </div>

          <ProgressBar
            value={progress?.index || 0}
            total={progress?.total || previewCount}
            color={NAVY}
            dark={dark}
          />

          {currentScheme && (
            <div style={{
              fontSize: 10, color: th.textMid,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              ▶ {currentScheme}
            </div>
          )}

          {/* Live mini cards */}
          {summary && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <MiniCard icon="✅" label="Active"    value={summary.active}     color={IND_GREEN} dark={dark} />
              <MiniCard icon="❌" label="Dead"      value={summary.dead}       color={RED}       dark={dark} />
              <MiniCard icon="🟡" label="No Resp."  value={summary.noResponse} color={AMBER}     dark={dark} />
              <MiniCard icon="🐛" label="Errors"    value={summary.errors}     color={VIOLET}    dark={dark} />
            </div>
          )}
        </div>
      )}

      {/* ══ DONE BANNER ══════════════════════════════════════════════════════ */}
      {runDone && !running && results.length > 0 && (
        <div style={{
          background: wasAborted
            ? (dark ? "rgba(220,38,38,0.07)" : "rgba(220,38,38,0.06)")
            : (dark ? "rgba(19,136,8,0.07)"  : "rgba(19,136,8,0.06)"),
          border: `1.5px solid ${(wasAborted ? RED : IND_GREEN)}40`,
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>{wasAborted ? "🛑" : "✅"}</span>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: th.text }}>
            {wasAborted ? "Run stopped" : "Run complete"}
            <span style={{ fontWeight: 500, color: th.textMid, marginLeft: 6 }}>
              · {results.length} scheme{results.length !== 1 ? "s" : ""} checked
            </span>
          </div>
          <div
            onClick={handleReset}
            style={{
              padding: "5px 12px", borderRadius: 8,
              fontSize: 11, fontWeight: 700,
              background: th.border, color: th.textMid, cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ↺ New Run
          </div>
        </div>
      )}

      {/* ══ FULL SUMMARY CARDS — post-run only ═══════════════════════════════ */}
      {summary && !running && (
        <div style={{
          background: th.card,
          border: `1.5px solid ${th.border}`,
          borderRadius: 16,
          padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
            📊 Summary
          </div>

          {/* Row 1 — link health */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <MiniCard icon="🔍" label="Checked"     value={summary.total}      color={NAVY}      dark={dark} />
            <MiniCard icon="✅" label="Active"       value={summary.active}     color={IND_GREEN} dark={dark} />
            <MiniCard icon="❌" label="Dead"         value={summary.dead}       color={RED}       dark={dark} />
            <MiniCard icon="🟡" label="No Response"  value={summary.noResponse} color={AMBER}     dark={dark} />
          </div>

          {/* Row 2 — deadline / quality */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <MiniCard icon="⏰" label="Expired"       value={summary.expired}      color={RED}     dark={dark} />
            <MiniCard icon="⚠️" label="Expiring Soon" value={summary.expiringSoon} color={SAFFRON} dark={dark} />
            <MiniCard icon="🆕" label="Never Checked" value={summary.neverChecked} color={VIOLET}  dark={dark} />
            <MiniCard icon="🐛" label="Errors"        value={summary.errors}       color={PINK}    dark={dark} />
          </div>
        </div>
      )}

      {/* ══ RESULTS LIST ═════════════════════════════════════════════════════ */}
      {results.length > 0 && (
        <div style={{
          background: th.card,
          border: `1.5px solid ${th.border}`,
          borderRadius: 16,
          overflow: "hidden",
        }}>
          {/* Header + filter pills */}
          <div style={{
            padding: "10px 14px",
            borderBottom: `1px solid ${th.border}`,
            display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
              Results
            </span>
            <span style={{ fontSize: 10, color: th.textSub }}>
              ({filteredResults.length})
            </span>
            <div style={{ flex: 1 }} />

            {[
              ["all",        "All",         th.textMid, th.border],
              ["active",     "✅ Active",    IND_GREEN,  `${IND_GREEN}40`],
              ["dead",       "❌ Dead",      RED,        `${RED}40`],
              ["noResponse", "🟡 No Resp.",  AMBER,      `${AMBER}40`],
              ["error",      "🐛 Errors",    VIOLET,     `${VIOLET}40`],
            ].map(([key, label, color, bg]) => (
              <div
                key={key}
                onClick={() => { setResultFilter(key); setPage(1); }}
                style={{
                  padding: "3px 9px", borderRadius: 10,
                  fontSize: 9, fontWeight: 700,
                  color,
                  background: resultFilter === key ? bg : "transparent",
                  border: `1.5px solid ${resultFilter === key ? color : th.border}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div>
            {pageSlice.length === 0 ? (
              <EmptyState message="No results in this category" dark={dark} />
            ) : (
              pageSlice.map((r, i) => (
                <ResultRow
                  key={`${r.scheme?.id ?? i}-${(page - 1) * PAGE_SIZE + i}`}
                  result={r}
                  dark={dark}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: "10px 14px",
              borderTop: `1px solid ${th.border}`,
              display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
            }}>
              <div
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 11, fontWeight: 700,
                  background: th.border,
                  color: page <= 1 ? th.textSub : th.text,
                  cursor: page <= 1 ? "default" : "pointer",
                }}
              >
                ← Prev
              </div>
              <div style={{ fontSize: 11, color: th.textMid }}>
                {page} / {totalPages}
              </div>
              <div
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 11, fontWeight: 700,
                  background: th.border,
                  color: page >= totalPages ? th.textSub : th.text,
                  cursor: page >= totalPages ? "default" : "pointer",
                }}
              >
                Next →
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pulse keyframe — scoped inline */}
      <style>{`
        @keyframes sv-pulse {
          0%,100% { opacity: 1; box-shadow: 0 0 0 3px rgba(19,136,8,0.3); }
          50%      { opacity: 0.6; box-shadow: 0 0 0 6px rgba(19,136,8,0.1); }
        }
      `}</style>

    </div>
  );
}
