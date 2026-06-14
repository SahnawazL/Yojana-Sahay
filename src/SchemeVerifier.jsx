/**
 * SchemeVerifier.jsx — Yojana Sahay Admin Dashboard · Scheme URL Verifier Tab
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Consumed by AdminDashboard.jsx as: <SchemeVerifier dark={dark} isDesktop={isDesktop} />
 *
 * Features:
 *   · Scope filter  — All / National / By State  (pill buttons, not native select)
 *   · Priority filter — All / Has Deadline / Never Verified / Stale 30d+
 *   · Tier selector — Tier 1 (dead-link ping) / Tier 2 (AI date extract) / Both
 *   · Preview count before run
 *   · Checkpoint detection with Resume / Dismiss
 *   · Progress bar + live scheme label + elapsed time + ETA + scan speed
 *   · Live mini stat cards with count-up animation during run
 *   · Full 8-card summary post-run
 *   · Filterable + searchable + paginated results (numbered pages)
 *   · Color-coded HTTP status badge (2xx green / 3xx amber / 4xx red)
 *   · Copy URL to clipboard from expanded result row
 *   · Export results as print-ready PDF (post-run) — Claude AI-uploadable report
 *   · Auto-save scan results to localStorage once per scope (national / state)
 *   · Saved Scans panel — export PDF from a previous scan without re-running
 *   · Stop / Pause mid-run via AbortController
 *   · New Run reset
 *
 * PDF Report Structure (for uploading to Claude AI):
 *   Cover → AI Usage Hint → 8-stat Summary →
 *   Issues Requiring Fixes (grouped: critical / warnings / config) →
 *   No Response (India-bound domains) →
 *   Active Schemes (reference table)
 *
 *   Each issue card shows: scheme ID · file path (schemesData.js / state/xxx.js) ·
 *   current apply URL · HTTP code · error text · exact fix instruction +
 *   "search for <id> in <file>" hint so Claude can locate it instantly.
 *
 * localStorage keys:  "ys_scan_national" | "ys_scan_all" | "ys_scan_state_<name>"
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
  getDBStats,
  writeSchemeResults,
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


// ─── COUNT-UP HOOK ────────────────────────────────────────────────────────────
// Animates a number from its previous value to `target` over `duration` ms.
// Used in MiniCard and TechStatCard for satisfying live updates.

function useCountUp(target, duration = 500) {
  const [display, setDisplay] = useState(target ?? 0);
  const prevRef = useRef(target ?? 0);
  const rafRef  = useRef(null);

  useEffect(() => {
    if (target == null) return;
    const start = prevRef.current;
    const end   = target;
    if (start === end) return;

    const startTime = performance.now();
    const animate   = (now) => {
      const t       = Math.min((now - startTime) / duration, 1);
      const eased   = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}


// ─── ROLLING DIGITS (odometer-style number) ──────────────────────────────────
// Renders a number as a row of independently-rolling digit reels, each sliding
// vertically through 0-9 to land on its new value. Pairs nicely with
// useCountUp's rapid value changes for a smooth, "techy" tachometer feel.

function RollingDigit({ digit }) {
  return (
    <span
      style={{
        display:       "inline-block",
        position:      "relative",
        width:         "0.62em",
        height:        "1em",
        overflow:      "hidden",
        verticalAlign: "top",
      }}
    >
      <span
        style={{
          position:   "absolute",
          left:       0,
          top:        0,
          width:      "100%",
          transform:  `translateY(${-digit * 10}%)`,
          transition: "transform 0.4s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span
            key={d}
            style={{
              display:    "block",
              height:     "1em",
              lineHeight: "1em",
              textAlign:  "center",
            }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function RollingNumber({ value }) {
  const str = String(Math.max(0, Math.round(value ?? 0)));
  return (
    <span style={{ display: "inline-flex" }}>
      {str.split("").map((ch, i) =>
        /[0-9]/.test(ch)
          ? <RollingDigit key={i} digit={Number(ch)} />
          : <span key={i} style={{ display: "inline-block" }}>{ch}</span>
      )}
    </span>
  );
}


// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Human-readable duration from milliseconds: "2m 34s", "47s", etc. */
function fmtDuration(ms) {
  if (!ms || ms <= 0) return "--";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r > 0 ? `${m}m ${r}s` : `${m}m`;
}

/** Fuzzy scheme name / ID / URL search */
function matchesSearch(result, query) {
  if (!query) return true;
  const q  = query.toLowerCase().trim();
  const s  = result.scheme;
  return (
    s.name?.en?.toLowerCase().includes(q) ||
    s.name?.hi?.toLowerCase().includes(q) ||
    s.id?.toLowerCase().includes(q)        ||
    s.apply?.en?.toLowerCase().includes(q)
  );
}

/**
 * Spread onto a clickable <div> to make it keyboard- and screen-reader-
 * accessible: adds role="button", tabIndex, Enter/Space activation, and
 * (when `disabled` is true) removes it from the tab order and announces
 * it as disabled. `pressed`, when provided, sets aria-pressed for toggles.
 */
function a11yClickable(onClick, { disabled = false, pressed, label } = {}) {
  if (disabled || !onClick) {
    return {
      role: "button",
      "aria-disabled": true,
      tabIndex: -1,
      ...(label ? { "aria-label": label } : {}),
    };
  }
  return {
    role: "button",
    tabIndex: 0,
    onClick,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(e);
      }
    },
    ...(pressed !== undefined ? { "aria-pressed": pressed } : {}),
    ...(label ? { "aria-label": label } : {}),
  };
}

/** Build numbered pagination range (max `maxVisible` pages shown). */
function getPaginationRange(page, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const half  = Math.floor(maxVisible / 2);
  let start   = Math.max(1, page - half);
  let end     = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Resolve a result's status label (used by PDF export and status badges). */
function getResultStatus(r) {
  if (r.error && r.alive === null) return "Error";
  if (r.alive === true)            return "Active";
  if (r.alive === false)           return "Dead";
  return "No Response";
}

// ─── LOCALSTORAGE SAVE / LOAD SYSTEM ─────────────────────────────────────────
// Saves one scan result set per scope (national / all / state:<name>).
// Key format: "ys_scan_national" | "ys_scan_all" | "ys_scan_state_assam"
// Stores a slim version of results (no full SCHEME_DB objects) to keep size
// well under localStorage's 5 MB limit even for 400+ scheme runs.

/** Convert scopeFilter string to a stable localStorage key. */
function getScanStorageKey(scopeFilter) {
  if (scopeFilter === "national") return "ys_scan_national";
  if (scopeFilter === "all")      return "ys_scan_all";
  const state = scopeFilter.replace("state:", "").trim().toLowerCase().replace(/\s+/g, "_");
  return `ys_scan_state_${state}`;
}

/**
 * Strip a full result (with giant scheme object) down to only what the PDF
 * report and getFixSuggestion need.  Saves ~70% space vs. the raw array.
 */
function slimifyResults(results) {
  return results.map(r => ({
    // ── scheme fields ──
    id:       r.scheme?.id,
    nameEn:   r.scheme?.name?.en,
    nameHi:   r.scheme?.name?.hi,
    scope:    r.scheme?.scope,
    state:    r.scheme?.state,
    applyUrl: r.scheme?.apply?.en,
    lastDate: r.scheme?.lastDate,
    // ── result fields ──
    alive:      r.alive,
    httpStatus: r.httpStatus,
    tier:       r.tier,
    aiLastDate: r.lastDate,
    isActive:   r.isActive,
    confidence: r.confidence,
    error:      r.error,
    linkAlive:  r.linkAlive,
  }));
}

/**
 * Rebuild a result-shaped object from a slim entry.
 * Compatible with getFixSuggestion(), getSchemeFilePath(), and the PDF renderer.
 */
function reconstituteResult(entry) {
  return {
    alive:      entry.alive,
    httpStatus: entry.httpStatus,
    tier:       entry.tier,
    lastDate:   entry.aiLastDate,
    isActive:   entry.isActive,
    confidence: entry.confidence,
    error:      entry.error,
    linkAlive:  entry.linkAlive,
    scheme: {
      id:       entry.id,
      name:     { en: entry.nameEn, hi: entry.nameHi },
      scope:    entry.scope,
      state:    entry.state,
      apply:    { en: entry.applyUrl },
      lastDate: entry.lastDate,
    },
  };
}

/** Persist a completed scan to localStorage (overwrites the same scope key). */
function saveScanResults(scopeFilter, priorityFilter, tier, results, summary) {
  try {
    const key     = getScanStorageKey(scopeFilter);
    const payload = {
      scopeFilter,
      priorityFilter,
      tier,
      savedAt:     new Date().toISOString(),
      schemeCount: results.length,
      summary,
      results:     slimifyResults(results),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    // localStorage full or disabled — non-fatal
    console.warn("[SchemeVerifier] Save to localStorage failed:", err.message);
  }
}

/** Return metadata for all saved scans (no result payload — lightweight). */
function loadAllSavedScans() {
  const scans  = [];
  const prefix = "ys_scan_";
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(prefix)) continue;
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      scans.push({
        key:           k,
        scopeFilter:   obj.scopeFilter,
        priorityFilter: obj.priorityFilter,
        tier:          obj.tier,
        savedAt:       obj.savedAt,
        schemeCount:   obj.schemeCount,
        summary:       obj.summary,
      });
    } catch { /* skip corrupt entry */ }
  }
  // Most-recent first
  return scans.sort((a, b) => (b.savedAt ?? "").localeCompare(a.savedAt ?? ""));
}

/** Load the full reconstituted result array for a given storage key. */
function loadFullScan(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return {
      ...obj,
      results: (obj.results || []).map(reconstituteResult),
    };
  } catch (err) {
    console.warn("[SchemeVerifier] Failed to load scan:", err.message);
    return null;
  }
}

/** Remove one saved scan entry. */
function clearSavedScan(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}


// ─── SOURCE FILE PATH RESOLVER ────────────────────────────────────────────────
// National → src/schemesData.js
// State   → src/state/<statename>.js   (matches actual folder structure)

function getSchemeFilePath(result) {
  if (result.scheme?.scope === "national") return "src/SchemeData/schemesData.js";
  const st = result.scheme?.state;
  if (!st) return "src/SchemeData/schemesData.js";
  const fname = st.toLowerCase().replace(/\s*&\s*/g, " ").replace(/\s+/g, "_");
  return `src/SchemeData/states/${fname}.js`;
}


// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
// Generates a print-ready HTML report in a new tab.
// Designed to be uploaded to Claude AI with the scheme source file so Claude
// can locate and fix each broken scheme automatically.
//
// Report sections:
//   1. Cover (scope / tier / date)
//   2. "How to use with Claude AI" hint
//   3. 8-stat summary grid
//   4. ISSUES REQUIRING FIXES — grouped by severity
//      Each card: scheme ID · file path · current URL · HTTP code · error · fix detail
//   5. No Response (India-bound domains — not necessarily broken)
//   6. Active schemes (reference table)

function exportResultsPDF(results, summary, scopeFilter, priorityFilter, tier) {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const timeStr  = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const scopeLabel =
    scopeFilter === "national"          ? "National (Central) Schemes"
    : scopeFilter.startsWith("state:")  ? `${scopeFilter.replace("state:", "")} State Schemes`
    : "All Schemes";

  const tierLabel =
    tier === 1     ? "Tier 1 — Dead-link Ping"
    : tier === 2   ? "Tier 2 — AI Date Extraction"
    : "Tier 1+2 — Full Check";

  const priorityLabel =
    priorityFilter === "all"             ? "All Priority"
    : priorityFilter === "hasDate"       ? "Has Deadline"
    : priorityFilter === "neverVerified" ? "Never Verified"
    : "Stale 30d+";

  // ── Categorise results ────────────────────────────────────────────────────
  const issues     = results.filter(r => r.alive === false || (r.alive === null && r.error));
  const noResponse = results.filter(r => r.alive === null && !r.error);
  const active     = results.filter(r => r.alive === true);

  // ── Fix-suggestion colours (hardcoded hex for standalone HTML) ────────────
  const C_RED    = "#DC2626";
  const C_AMBER  = "#B45309";
  const C_VIOLET = "#6D28D9";
  const C_GREEN  = "#138808";
  const C_NAVY   = "#003580";

  // ── Issue card renderer ───────────────────────────────────────────────────
  // getFixSuggestion() uses the module-level RED/AMBER/VIOLET constants, so
  // we map its returned color to the PDF-safe hex strings above.
  const fixColorToPdf = (fixColor) =>
    fixColor === RED    ? C_RED
    : fixColor === AMBER  ? C_AMBER
    : C_VIOLET;

  const renderIssueCard = (r, i) => {
    const fix      = getFixSuggestion(r);
    const filePath = getSchemeFilePath(r);
    const urlVal   = r.scheme?.apply?.en || "(none)";
    const stateName = r.scheme?.state || "National";
    const http     = r.httpStatus > 0 ? r.httpStatus : "—";
    const errText  = r.error ? r.error.slice(0, 200) : "—";

    const catColor = fix ? fixColorToPdf(fix.color) : C_VIOLET;
    const catBg    =
      catColor === C_RED    ? "#FEF2F2"
      : catColor === C_AMBER  ? "#FFFBEB"
      : "#F5F3FF";
    const catIcon  =
      catColor === C_RED    ? "✕"
      : catColor === C_AMBER  ? "△"
      : "◆";

    // ── Smart fix instruction (field + search hint) ───────────────────────
    let fieldHint = "";
    const label = fix?.label ?? "";
    if (label === "Update URL" || label === "Fix URL Format" || label === "Check Domain") {
      fieldHint = `
        <div class="field-hint">
          <strong>Field to update:</strong>
          <code>apply: { en: "NEW_URL_HERE" }</code><br/>
          <strong>To find it:</strong> Search for
          <code>"${r.scheme?.id ?? ""}"</code> in <code>${filePath}</code>
          and update the <code>apply.en</code> value.
        </div>`;
    } else if (label === "Manual Check") {
      fieldHint = `
        <div class="field-hint">
          <strong>Action:</strong> Open the URL in a browser to confirm it's actually live before editing the file.
          If confirmed dead, search for <code>"${r.scheme?.id ?? ""}"</code> in <code>${filePath}</code>
          and update <code>apply.en</code>.<br/>
          Current URL: <code>${urlVal}</code>
        </div>`;
    } else if (label === "Retry Later") {
      fieldHint = `
        <div class="field-hint">
          <strong>Action:</strong> No file edits needed yet — wait 24 h and re-run the verifier.
          If the error persists after multiple runs, treat it as a dead link and update <code>apply.en</code>
          in <code>${filePath}</code>.<br/>
          Search for <code>"${r.scheme?.id ?? ""}"</code> to locate it.
        </div>`;
    } else {
      fieldHint = `
        <div class="field-hint">
          <strong>To find it:</strong> Search for
          <code>"${r.scheme?.id ?? ""}"</code> in <code>${filePath}</code>.
        </div>`;
    }

    return `
      <div class="issue-card" style="border-left-color:${catColor}; background:${catBg};">

        <div class="issue-header" style="border-bottom-color:${catColor}22;">
          <span class="issue-num">#${i + 1}</span>
          <span class="issue-cat" style="color:${catColor};">${catIcon} ${label || "Unknown Issue"}</span>
          ${r.httpStatus > 0
            ? `<span class="http-badge" style="color:${catColor};border-color:${catColor}55;">${r.httpStatus}</span>`
            : ""}
        </div>

        <table class="dtable">
          <tr><td class="dk">Scheme ID</td>
              <td class="dv mono" style="color:${C_NAVY}; font-weight:800;">${r.scheme?.id || "—"}</td></tr>
          <tr><td class="dk">Name (EN)</td>
              <td class="dv">${r.scheme?.name?.en || "—"}</td></tr>
          <tr><td class="dk">File to Edit</td>
              <td class="dv fp">${filePath}</td></tr>
          <tr><td class="dk">State / Scope</td>
              <td class="dv">${stateName} · ${r.scheme?.scope || "—"}</td></tr>
          <tr><td class="dk">Current URL</td>
              <td class="dv url">${urlVal}</td></tr>
          ${r.scheme?.lastDate
            ? `<tr><td class="dk">Deadline</td><td class="dv">${r.scheme.lastDate}</td></tr>`
            : ""}
          <tr><td class="dk">HTTP Status</td>
              <td class="dv mono">${http}</td></tr>
          ${r.error
            ? `<tr><td class="dk">Error Detail</td><td class="dv err">${errText}</td></tr>`
            : ""}
        </table>

        <div class="fix-block" style="border-top-color:${catColor}22;">
          <strong style="color:${catColor};">WHAT TO FIX:</strong>
          <p>${fix?.detail || "Check the URL manually and update if needed."}</p>
        </div>

        ${fieldHint}
      </div>`;
  };

  const renderActiveRow = (r, i) => {
    const url  = r.scheme?.apply?.en || "—";
    const http = r.httpStatus > 0 ? r.httpStatus : "";
    return `
      <tr>
        <td class="ti">${i + 1}</td>
        <td class="tn">${r.scheme?.name?.en || r.scheme?.id || "—"}</td>
        <td class="tu">${url}</td>
        <td class="ts">${r.scheme?.state || "National"}</td>
        <td class="th" style="color:${C_GREEN};">${http}</td>
      </tr>`;
  };

  const renderNoRespRow = (r, i) => {
    const url = r.scheme?.apply?.en || "—";
    const err = r.error ? r.error.slice(0, 55) : "";
    return `
      <tr>
        <td class="ti">${i + 1}</td>
        <td class="tn">${r.scheme?.name?.en || r.scheme?.id || "—"}</td>
        <td class="tu">${url}</td>
        <td class="ts">${r.scheme?.state || "National"}</td>
        <td class="th" style="color:#9CA3AF;font-size:7.5pt;">${err}</td>
      </tr>`;
  };

  // ── Count issue groups for sub-headings ───────────────────────────────────
  const critIssues = issues.filter(r => { const f = getFixSuggestion(r); return f?.color === RED; });
  const warnIssues = issues.filter(r => { const f = getFixSuggestion(r); return f?.color === AMBER; });
  const cfgIssues  = issues.filter(r => { const f = getFixSuggestion(r); return f?.color === VIOLET; });

  // ── HTML ──────────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Yojana Sahay — Verification Report — ${dateStr}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 10.5pt;
  color: #111827;
  background: #fff;
  padding: 20px 24px 32px;
  max-width: 860px;
  margin: 0 auto;
}
@page { size: A4; margin: 14mm 12mm; }
@media print {
  body { padding: 0; max-width: none; }
  .no-print { display: none !important; }
  .issue-card { page-break-inside: avoid; }
  .page-break { page-break-before: always; }
}

/* ── Print button ── */
.print-btn {
  position: fixed; top: 14px; right: 16px;
  background: #003580; color: #fff;
  border: none; border-radius: 8px;
  padding: 9px 18px; font-size: 11pt; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(0,53,128,0.3);
  z-index: 999; transition: background 0.15s;
}
.print-btn:hover { background: #0047b3; }

/* ── Cover ── */
.cover {
  background: linear-gradient(135deg, #001f5b 0%, #003580 60%, #004db3 100%);
  color: #fff; border-radius: 10px;
  padding: 22px 26px 18px; margin-bottom: 18px;
}
.cover h1 { font-size: 17pt; font-weight: 900; letter-spacing: -0.5px; }
.cover .sub { font-size: 9.5pt; opacity: 0.75; margin-top: 3px; }
.cover .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.cover .chip {
  background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.22);
  border-radius: 4px; padding: 3px 10px;
  font-size: 8.5pt; font-weight: 700; white-space: nowrap;
}

/* ── AI hint ── */
.ai-hint {
  background: #EFF6FF; border: 1.5px solid #BFDBFE;
  border-left: 5px solid #2563EB; border-radius: 7px;
  padding: 11px 14px; margin-bottom: 18px;
  font-size: 9.5pt; color: #1E3A5F; line-height: 1.65;
}
.ai-hint strong { color: #1D4ED8; }

/* ── Summary grid ── */
.stat-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 8px; margin-bottom: 22px;
}
.stat-card {
  border: 1.5px solid #E5E7EB; border-radius: 8px;
  padding: 10px 8px; text-align: center;
}
.stat-card .num { font-size: 20pt; font-weight: 900; line-height: 1; }
.stat-card .lbl {
  font-size: 7pt; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; color: #6B7280; margin-top: 4px;
}

/* ── Section header ── */
.sec-head {
  display: flex; align-items: center; gap: 10px;
  font-size: 12.5pt; font-weight: 900; color: #111827;
  padding-bottom: 7px; border-bottom: 2.5px solid #003580;
  margin-bottom: 10px; margin-top: 22px;
}
.sec-head .badge {
  font-size: 8.5pt; font-weight: 700; padding: 2px 9px;
  border-radius: 12px; margin-left: auto; white-space: nowrap;
}
.sec-sub {
  font-size: 8.5pt; color: #6B7280; margin-bottom: 12px; line-height: 1.55;
}

/* ── Sub-group header ── */
.grp-head {
  font-size: 9pt; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; padding: 5px 0 4px;
  margin-top: 12px; margin-bottom: 6px;
  border-top: 1px solid #E5E7EB; color: #374151;
  display: flex; align-items: center; gap: 6px;
}

/* ── Issue card ── */
.issue-card {
  border: 1px solid #E5E7EB; border-left: 4.5px solid #DC2626;
  border-radius: 7px; margin-bottom: 12px; overflow: hidden;
  break-inside: avoid;
}
.issue-header {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 12px; border-bottom: 1px solid;
}
.issue-num {
  font-family: monospace; font-size: 8pt; font-weight: 800;
  color: #6B7280; background: rgba(0,0,0,0.07);
  padding: 2px 6px; border-radius: 4px; flex-shrink: 0;
}
.issue-cat { font-size: 9.5pt; font-weight: 800; flex: 1; }
.http-badge {
  font-family: monospace; font-size: 8.5pt; font-weight: 800;
  padding: 2px 7px; border: 1.5px solid; border-radius: 4px;
  flex-shrink: 0;
}

/* ── Detail table ── */
.dtable { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
.dtable tr td { padding: 3.5px 12px; vertical-align: top; }
.dtable tr:nth-child(even) { background: rgba(0,0,0,0.025); }
.dk { width: 100px; color: #6B7280; font-weight: 700; white-space: nowrap; }
.dv { color: #1a1a1a; word-break: break-all; }
.mono { font-family: monospace; font-size: 8pt; }
.fp { font-family: monospace; font-size: 8pt; color: #003580; font-weight: 800; }
.url { font-family: monospace; font-size: 7.5pt; color: #374151; }
.err { color: #DC2626; font-size: 8pt; }

/* ── Fix block ── */
.fix-block {
  padding: 8px 12px; border-top: 1px solid;
  font-size: 8.5pt; line-height: 1.6;
  background: rgba(255,255,255,0.55);
}
.fix-block p { margin-top: 3px; color: #374151; }

/* ── Field hint ── */
.field-hint {
  padding: 6px 12px 8px;
  background: rgba(0,0,0,0.04);
  border-top: 1px dashed rgba(0,0,0,0.12);
  font-size: 8pt; color: #374151; line-height: 1.7;
}
.field-hint code {
  font-family: monospace; background: rgba(0,53,128,0.08);
  padding: 1px 5px; border-radius: 3px; font-size: 7.5pt; color: #003580;
}

/* ── Scheme table ── */
.stbl { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 4px; }
.stbl thead tr { background: #F9FAFB; }
.stbl th {
  padding: 5px 8px; text-align: left;
  font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: #6B7280;
}
.stbl td { padding: 4px 8px; border-bottom: 1px solid #F3F4F6; }
.ti { width: 26px; color: #9CA3AF; font-family: monospace; font-size: 8pt; }
.tn { font-weight: 600; color: #111827; }
.tu { font-family: monospace; font-size: 7.5pt; color: #374151; word-break: break-all; }
.ts { width: 80px; color: #6B7280; font-size: 8pt; }
.th { width: 46px; font-family: monospace; font-size: 8pt; text-align: right; }

/* ── Footer ── */
.footer {
  margin-top: 28px; padding-top: 10px;
  border-top: 1px solid #E5E7EB;
  font-size: 7.5pt; color: #9CA3AF; text-align: center;
}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">⬇ Save as PDF</button>

<!-- COVER -->
<div class="cover">
  <div style="font-size:8pt;opacity:0.6;letter-spacing:1.5px;font-weight:700;margin-bottom:6px;">YOJANA SAHAY · ADMIN DASHBOARD</div>
  <h1>🇮🇳 Scheme Verification Report</h1>
  <div class="sub">Scheme URL Verifier · ${scopeLabel}</div>
  <div class="chips">
    <div class="chip">📅 ${dateStr} · ${timeStr}</div>
    <div class="chip">🎯 ${scopeLabel}</div>
    <div class="chip">⚙ ${tierLabel}</div>
    <div class="chip">🔢 Priority: ${priorityLabel}</div>
    <div class="chip">📋 ${results.length} schemes verified</div>
  </div>
</div>

<!-- AI USAGE HINT -->
<div class="ai-hint">
  <strong>📌 HOW TO USE THIS REPORT WITH CLAUDE AI:</strong><br/>
  1. Upload this PDF to Claude AI.<br/>
  2. Also upload the scheme source file — <code>src/schemesData.js</code> (for national) or
     <code>src/state/statename.js</code> (for state schemes).<br/>
  3. Tell Claude: <em>"Fix all the issues listed in the verification report.
     For each issue the Scheme ID and File to Edit are shown — find that scheme and
     update the <code>apply.en</code> field (or follow the WHAT TO FIX instruction)."</em><br/>
  <strong>Focus Claude on the "ISSUES REQUIRING FIXES" section below.</strong>
</div>

<!-- SUMMARY -->
<div class="stat-grid">
  <div class="stat-card"><div class="num" style="color:${C_NAVY};">${summary?.total ?? results.length}</div><div class="lbl">Total</div></div>
  <div class="stat-card"><div class="num" style="color:${C_GREEN};">${summary?.active ?? 0}</div><div class="lbl">Active</div></div>
  <div class="stat-card"><div class="num" style="color:${C_RED};">${summary?.dead ?? 0}</div><div class="lbl">Dead Links</div></div>
  <div class="stat-card"><div class="num" style="color:#B45309;">${summary?.noResponse ?? 0}</div><div class="lbl">No Response</div></div>
  <div class="stat-card"><div class="num" style="color:#6D28D9;">${summary?.errors ?? 0}</div><div class="lbl">Errors</div></div>
  <div class="stat-card"><div class="num" style="color:${C_RED};">${summary?.expired ?? 0}</div><div class="lbl">Expired</div></div>
  <div class="stat-card"><div class="num" style="color:#FF9933;">${summary?.expiringSoon ?? 0}</div><div class="lbl">Expiring Soon</div></div>
  <div class="stat-card"><div class="num" style="color:#6B7280;">${summary?.neverChecked ?? 0}</div><div class="lbl">Never Checked</div></div>
</div>

${issues.length > 0 ? `
<!-- ISSUES SECTION -->
<div class="sec-head">
  ✕ ISSUES REQUIRING FIXES
  <span class="badge" style="background:#FEF2F2;color:${C_RED};border:1px solid #FECACA;">${issues.length} schemes need attention</span>
</div>
<div class="sec-sub">
  Each card below shows the exact <strong>File to Edit</strong>, <strong>Scheme ID</strong>, and
  <strong>WHAT TO FIX</strong> instruction. Upload the corresponding source file alongside this
  PDF to Claude AI for automated fixes.
</div>

${critIssues.length > 0 ? `
<div class="grp-head" style="color:${C_RED};">
  ✕ CRITICAL — Update URL in Source File
  <span style="margin-left:auto;font-size:8.5pt;font-weight:700;background:#FEF2F2;color:${C_RED};padding:2px 8px;border-radius:10px;">${critIssues.length}</span>
</div>
${critIssues.map(renderIssueCard).join("")}
` : ""}

${warnIssues.length > 0 ? `
<div class="grp-head" style="color:${C_AMBER};">
  △ WARNINGS — Manual Check or Retry
  <span style="margin-left:auto;font-size:8.5pt;font-weight:700;background:#FFFBEB;color:${C_AMBER};padding:2px 8px;border-radius:10px;">${warnIssues.length}</span>
</div>
${warnIssues.map(renderIssueCard).join("")}
` : ""}

${cfgIssues.length > 0 ? `
<div class="grp-head" style="color:${C_VIOLET};">
  ◆ CONFIGURATION / FORMAT ISSUES
  <span style="margin-left:auto;font-size:8.5pt;font-weight:700;background:#F5F3FF;color:${C_VIOLET};padding:2px 8px;border-radius:10px;">${cfgIssues.length}</span>
</div>
${cfgIssues.map(renderIssueCard).join("")}
` : ""}

` : `
<div class="sec-head">✓ No Issues Found</div>
<div style="padding:16px;text-align:center;color:${C_GREEN};font-weight:700;font-size:12pt;">
  All verified schemes have active links! 🎉
</div>
`}

${noResponse.length > 0 ? `
<!-- NO RESPONSE -->
<div class="sec-head page-break">
  △ NO RESPONSE (India-Bound Domains)
  <span class="badge" style="background:#FFFBEB;color:${C_AMBER};border:1px solid #FDE68A;">${noResponse.length} schemes</span>
</div>
<div class="sec-sub">
  These schemes did not respond from Vercel's US servers — typically NIC / nic.in / india.gov.in
  domains that block non-Indian IPs. <strong>This does NOT mean the URL is broken.</strong>
  Open each URL in a browser to confirm before making any edits to the source file.
</div>
<table class="stbl">
  <thead><tr>
    <th class="ti">#</th><th class="tn">Scheme Name</th>
    <th class="tu">Apply URL</th><th class="ts">State</th><th class="th">Note</th>
  </tr></thead>
  <tbody>${noResponse.map(renderNoRespRow).join("")}</tbody>
</table>
` : ""}

${active.length > 0 ? `
<!-- ACTIVE SCHEMES -->
<div class="sec-head page-break">
  ✓ ACTIVE SCHEMES — No Action Needed
  <span class="badge" style="background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0;">${active.length} schemes</span>
</div>
<table class="stbl">
  <thead><tr>
    <th class="ti">#</th><th class="tn">Scheme Name</th>
    <th class="tu">Apply URL</th><th class="ts">State</th><th class="th">HTTP</th>
  </tr></thead>
  <tbody>${active.map(renderActiveRow).join("")}</tbody>
</table>
` : ""}

<div class="footer">
  Yojana Sahay Admin Dashboard · Scheme Verification Report ·
  Generated ${dateStr} ${timeStr} · ${results.length} schemes verified ·
  Scope: ${scopeLabel} · Mode: ${tierLabel}
</div>

</body>
</html>`;

  // Open in new tab and trigger print dialog
  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    try { win.print(); } catch { /* user may have closed the tab */ }
  }, 700);
}


// ─── INJECT KEYFRAMES ONCE ───────────────────────────────────────────────────
// Called once at module import — React doesn't deduplicate <style> tags injected
// inside a component's render, so we do it here instead.
(function injectSVKeyframes() {
  const id = "sv-keyframes";
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes sv-pulse {
      0%,100% { opacity: 1; box-shadow: 0 0 0 3px rgba(19,136,8,0.3); }
      50%      { opacity: 0.6; box-shadow: 0 0 0 6px rgba(19,136,8,0.1); }
    }
    @keyframes sv-scan-line {
      0%   { top: -3px; opacity: 0; }
      8%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes sv-card-glow {
      0%,100% { box-shadow: 0 0 0 0 transparent; }
      50%     { box-shadow: 0 0 22px 2px rgba(0,53,128,0.18); }
    }
    @keyframes sv-scheme-fly-in {
      0%   { opacity: 0; transform: translateX(18px) scale(0.97); filter: blur(3px); }
      100% { opacity: 1; transform: translateX(0)    scale(1);    filter: blur(0);   }
    }
    @keyframes sv-result-fly-in {
      0%   { opacity: 0; transform: translateY(-14px) scale(0.97); }
      65%  { transform: translateY(2px)  scale(1.005); }
      100% { opacity: 1; transform: translateY(0)    scale(1); }
    }
    @keyframes sv-done-pop {
      0%   { opacity: 0; transform: scale(0.93) translateY(-6px); }
      60%  { transform: scale(1.025) translateY(0); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes sv-progress-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes sv-mini-ping {
      0%   { box-shadow: 0 0 0 0 currentColor; opacity: 0.9; }
      70%  { box-shadow: 0 0 0 7px currentColor; opacity: 0; }
      100% { box-shadow: 0 0 0 7px transparent;  opacity: 0; }
    }
    @keyframes sv-mini-sheen {
      0%   { transform: translateX(-120%) skewX(-15deg); }
      100% { transform: translateX(220%)  skewX(-15deg); }
    }
    @keyframes sv-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(s);
}());


function MiniCard({ label, value, color, dark }) {
  const th      = THEME[dark ? "dark" : "light"];
  const display = useCountUp(value ?? 0, 420);

  // Flash a glow/pulse pulse for ~500ms every time the value ticks up.
  const [flash, setFlash]   = useState(false);
  const prevValRef          = useRef(value ?? 0);

  useEffect(() => {
    if (value == null) return;
    if (value !== prevValRef.current) {
      prevValRef.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 520);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div style={{
      position:     "relative",
      flex:         "1 1 76px",
      minWidth:     78,
      borderRadius: 14,
      padding:      "11px 12px 9px",
      overflow:     "hidden",
      background:   dark
        ? `linear-gradient(150deg, ${th.card2} 0%, ${th.card} 75%)`
        : `linear-gradient(150deg, #ffffff 0%, ${th.card2} 100%)`,
      border:       `1px solid ${flash ? `${color}aa` : th.border}`,
      boxShadow:    flash
        ? `0 0 0 1px ${color}33, 0 6px 20px -6px ${color}66, inset 0 0 16px -4px ${color}40`
        : `0 1px 2px rgba(0,0,0,${dark ? 0.35 : 0.04})`,
      transform:    flash ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
      transition:   "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1)",
    }}>
      {/* top accent strip — brightens on tick */}
      <div style={{
        position:   "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}99, ${color}, ${color}99)`,
        boxShadow:  flash ? `0 0 12px 1px ${color}` : "none",
        opacity:    flash ? 1 : 0.85,
        transition: "box-shadow 0.3s ease, opacity 0.3s ease",
      }} />

      {/* diagonal sheen sweep on tick */}
      {flash && (
        <div style={{
          position:   "absolute", top: 0, left: 0,
          width:      "40%", height: "100%",
          background: `linear-gradient(100deg, transparent, ${color}30, transparent)`,
          animation:  "sv-mini-sheen 0.55s ease-out",
          pointerEvents: "none",
        }} />
      )}

      {/* big number */}
      <div style={{
        position:   "relative",
        fontSize:   22,
        fontWeight: 800,
        color:      th.text,
        lineHeight: 1,
        fontFamily: "'SF Mono','Roboto Mono','Courier New',monospace",
        letterSpacing: -0.5,
        textShadow: flash ? `0 0 14px ${color}90` : "none",
        transition: "text-shadow 0.3s ease",
      }}>
        <RollingNumber value={display} />
      </div>

      {/* label + live status dot */}
      <div style={{
        position:      "relative",
        display:       "flex",
        alignItems:    "center",
        gap:           5,
        marginTop:     4,
        fontSize:      9,
        fontWeight:    700,
        letterSpacing: 0.7,
        textTransform: "uppercase",
        color:         th.textSub,
      }}>
        <span style={{ position: "relative", width: 6, height: 6, flexShrink: 0 }}>
          <span style={{
            position:     "absolute", inset: 0,
            borderRadius: "50%",
            background:   color,
          }} />
          {flash && (
            <span style={{
              position:     "absolute", inset: 0,
              borderRadius: "50%",
              color,
              animation:    "sv-mini-ping 0.55s ease-out",
            }} />
          )}
        </span>
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
  let label, color, bg;

  if (result.error && result.alive === null) {
    [label, color, bg] = ["Error",       VIOLET,    "rgba(139,92,246,0.12)"];
  } else if (result.alive === true) {
    [label, color, bg] = ["Active",      IND_GREEN, "rgba(19,136,8,0.12)"];
  } else if (result.alive === false) {
    [label, color, bg] = ["Dead",        RED,       "rgba(220,38,38,0.12)"];
  } else {
    [label, color, bg] = ["No Response", AMBER,     "rgba(245,158,11,0.12)"];
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 8,
      fontSize: 9, fontWeight: 700,
      color, background: bg,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: color, flexShrink: 0,
      }} />
      {label}
    </span>
  );
}


// ─── HTTP STATUS BADGE ────────────────────────────────────────────────────────
// Color-coded HTTP code chip — green 2xx, amber 3xx, red 4xx+.

function HttpBadge({ status }) {
  if (!status || status <= 0) return null;

  const color =
    status >= 200 && status < 300 ? IND_GREEN :
    status >= 300 && status < 400 ? AMBER     :
    status >= 400                  ? RED       : VIOLET;

  return (
    <span style={{
      fontSize:    8,
      fontWeight:  800,
      fontFamily:  "monospace",
      padding:     "1px 6px",
      borderRadius: 4,
      color,
      background:  `${color}15`,
      border:      `1px solid ${color}35`,
      whiteSpace:  "nowrap",
    }}>
      {status}
    </span>
  );
}


// ─── FIX SUGGESTION RESOLVER ─────────────────────────────────────────────────
// Returns { label, detail, color } for Dead / Error results, null otherwise.
// Logic mirrors exactly what ping-url.js and verifySchemes.js produce:
//   httpStatus 0 + error "timeout"  → site too slow / down
//   httpStatus 0 + other error      → DNS / network failure
//   httpStatus 403 / 401            → bot-blocking (might be live)
//   httpStatus 404                  → URL is broken / moved
//   httpStatus 5xx                  → server error (temporary)
//   error "invalid URL"             → schemesData.js has plain-text, not a URL
//   error "ping-url API error N"    → Vercel function itself failed
//   error starts with "AI:"         → Tier 2 extraction failed

function getFixSuggestion(result) {
  const { alive, httpStatus, error } = result;
  const err = (error ?? "").toLowerCase();

  // ── Dead link (alive === false) ──────────────────────────────────────────
  if (alive === false) {
    if (httpStatus === 404)
      return {
        label:  "Update URL",
        detail: "Page not found (404) — the URL has moved or the scheme page was removed. Find the new link on the official portal and update schemesData.js.",
        color:  RED,
      };
    if (httpStatus === 403 || httpStatus === 401)
      return {
        label:  "Manual Check",
        detail: `Server returned ${httpStatus} — it may be blocking automated requests. Open the URL in a browser to confirm it's actually live before updating.`,
        color:  AMBER,
      };
    if (httpStatus >= 500)
      return {
        label:  "Retry Later",
        detail: `Server error (${httpStatus}) — the site is likely temporarily down. Wait 24h and re-run the verifier before making any changes.`,
        color:  AMBER,
      };
    if (httpStatus === 0 && err.includes("timeout"))
      return {
        label:  "Retry Later",
        detail: "Request timed out (10s) — the server is very slow or under load. Retry the verifier. If it times out repeatedly, manually check the URL.",
        color:  AMBER,
      };
    if (httpStatus === 0 && err.includes("ping-url api error"))
      return {
        label:  "Check Vercel Logs",
        detail: "The /api/ping-url serverless function itself returned an error. Go to Vercel → Functions → ping-url and inspect the logs for this deployment.",
        color:  VIOLET,
      };
    if (httpStatus === 0 && err.length > 0)
      return {
        label:  "Check Domain",
        detail: "URL is unreachable — the domain may have been deactivated or renamed. Search the scheme on the official ministry site and update the URL in schemesData.js.",
        color:  RED,
      };
    // Generic dead fallback
    return {
      label:  "Update URL",
      detail: "Dead link detected — find the updated apply URL on the official government portal and update schemesData.js.",
      color:  RED,
    };
  }

  // ── Error (alive === null, error string present) ──────────────────────────
  if (alive === null && error) {
    if (err.includes("invalid url"))
      return {
        label:  "Fix URL Format",
        detail: "The apply.en value in schemesData.js is not a valid URL — it likely contains spaces or is a plain-text description (e.g. 'Nearest CSC center'). Replace it with the actual scheme portal URL.",
        color:  VIOLET,
      };
    if (err.includes("ping-url api error"))
      return {
        label:  "Check Vercel Logs",
        detail: "The /api/ping-url serverless function returned an error. Go to Vercel → Functions → ping-url and inspect the logs for this deployment.",
        color:  VIOLET,
      };
    if (err.includes("endpoint not yet built") || err.startsWith("ai:"))
      return {
        label:  "Tier 2 Config",
        detail: "AI date extraction failed — confirm /api/verify-scheme is deployed and that GROQ_API_KEY is set in Vercel → Settings → Environment Variables.",
        color:  VIOLET,
      };
    // Generic error fallback
    return {
      label:  "Inspect & Retry",
      detail: `Verification failed — error: "${(error ?? "").slice(0, 100)}". Check the URL manually and retry the verifier.`,
      color:  VIOLET,
    };
  }

  return null; // Active / No Response → no fix needed
}


// ─── FILTER PILL ──────────────────────────────────────────────────────────────
// Separate component so useCountUp hook can animate the count smoothly.
function FilterPill({ label, count, color, bg, active, th, onClick }) {
  const animCount = useCountUp(count ?? 0, 400);
  return (
    <div
      {...a11yClickable(onClick, {
        pressed: active,
        label:   `Filter results: ${label}`,
      })}
      style={{
        padding:      "3px 9px",
        borderRadius: 10,
        fontSize:     9,
        fontWeight:   700,
        color,
        background:   active ? bg : "transparent",
        border:       `1.5px solid ${active ? color : th.border}`,
        cursor:       "pointer",
        transition:   "all 0.15s",
        whiteSpace:   "nowrap",
      }}
    >
      {label}{animCount > 0 ? ` (${animCount})` : ""}
    </div>
  );
}


// ─── RESULT ROW ───────────────────────────────────────────────────────────────
function ResultRow({ result, dark, expandAll = false }) {
  const th     = THEME[dark ? "dark" : "light"];
  const scheme = result.scheme;
  const [localExpanded, setLocalExpanded] = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [urlSearch,   setUrlSearch]   = useState(null);
  // urlSearch shape:
  //   null                            → not started
  //   "loading"                       → API call in progress
  //   { candidates: [...] }           → results ready
  //   "patching"                      → GitHub commit in progress
  //   { done: true, sha, commitUrl }  → committed successfully
  //   { error: "..." }                → something went wrong
  const [selectedUrl, setSelectedUrl] = useState(null);

  // Fix 7: expandAll overrides local state when active
  const expanded = expandAll || localExpanded;

  const now = Date.now();
  const ld  = scheme.lastDate ? new Date(scheme.lastDate).getTime() : null;
  const isExpired      = ld && ld < now;
  const isExpiringSoon = ld && !isExpired && (ld - now < THIRTY_DAYS);

  const accentColor =
    result.alive === true  ? IND_GREEN :
    result.alive === false ? RED :
    result.error           ? VIOLET : AMBER;

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    const url = scheme.apply?.en;
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {
      setCopied("error");
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Only shown for confirmed dead links (alive === false) with fix label
  // "Update URL" or "Check Domain" — i.e. the URL is genuinely gone.
  const fix = getFixSuggestion(result);
  const showFindNewUrl =
    result.alive === false &&
    fix != null &&
    (fix.label === "Update URL" || fix.label === "Check Domain");

  const handleFindNewUrl = async (e) => {
    e.stopPropagation();
    setUrlSearch("loading");
    setSelectedUrl(null);
    try {
      const res = await fetch("/api/find-new-url", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:       scheme.id,
          name:     scheme.name?.en,
          ministry: scheme.ministry?.en ?? null,
          oldUrl:   scheme.apply?.en,
          state:    scheme.state ?? "national",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUrlSearch({ candidates: data.candidates ?? [] });
      if (data.candidates?.length > 0) setSelectedUrl(data.candidates[0].url);
    } catch (err) {
      setUrlSearch({ error: err.message });
    }
  };

  const handleCommitFix = async (e) => {
    e.stopPropagation();
    if (!selectedUrl) return;
    setUrlSearch("patching");
    try {
      const res = await fetch("/api/patch-scheme-url", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:     scheme.id,
          oldUrl: scheme.apply?.en,
          newUrl: selectedUrl,
          file:   getSchemeFilePath(result),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUrlSearch({ done: true, sha: data.sha, commitUrl: data.commitUrl });
    } catch (err) {
      setUrlSearch({ error: err.message });
    }
  };

  const handleCancelSearch = (e) => {
    e.stopPropagation();
    setUrlSearch(null);
    setSelectedUrl(null);
  };

  return (
    <div
      {...a11yClickable(() => setLocalExpanded(e => !e), {
        pressed: expanded,
        label: `${scheme.name?.en || scheme.id} — ${expanded ? "collapse" : "expand"} details`,
      })}
      style={{
        padding:      "10px 14px",
        borderBottom: `1px solid ${th.border}`,
        borderLeft:   `3px solid ${accentColor}`,
        cursor:       "pointer",
        animation:    "sv-result-fly-in 0.42s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* ── Row header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>

        {/* Left: name + URL + deadline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{
              fontSize:      12,
              fontWeight:    700,
              color:         th.text,
              overflow:      "hidden",
              textOverflow:  "ellipsis",
              whiteSpace:    "nowrap",
              maxWidth:      "100%",
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
            fontSize:     9,
            color:        th.textSub,
            marginTop:    2,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}>
            {scheme.apply?.en || "—"}
          </div>

          {/* ── Fix card — always visible, single source of truth ── */}
          {(() => {
            const fix = getFixSuggestion(result);
            if (!fix) return null;
            const icon     = fix.color === RED ? "✕" : fix.color === AMBER ? "△" : "◆";
            const httpCode = result.httpStatus > 0 ? result.httpStatus : null;
            const errCode  = !httpCode && result.error
              ? result.error.replace(/^ai:\s*/i, "").slice(0, 28).toUpperCase()
              : null;
            return (
              <div style={{
                marginTop:    6,
                borderRadius: 7,
                border:       `1px solid ${fix.color}22`,
                borderLeft:   `3px solid ${fix.color}`,
                background:   `linear-gradient(120deg, ${fix.color}08 0%, transparent 80%)`,
                overflow:     "hidden",
              }}>
                {/* ── Header: icon · label · code badge ── */}
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          6,
                  padding:      "5px 9px 4px",
                  borderBottom: `1px solid ${fix.color}14`,
                }}>
                  <span style={{
                    fontSize:   8,
                    fontWeight: 900,
                    color:      fix.color,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}>
                    {icon}
                  </span>
                  <span style={{
                    flex:          1,
                    fontSize:      7.5,
                    fontWeight:    800,
                    letterSpacing: 0.9,
                    color:         fix.color,
                    textTransform: "uppercase",
                  }}>
                    {fix.label}
                  </span>
                  {(httpCode || errCode) && (
                    <span style={{
                      fontFamily:    "monospace",
                      fontSize:      8,
                      fontWeight:    700,
                      letterSpacing: 0.4,
                      color:         th.textMid,
                      background:    th.card2,
                      border:        `1px solid ${th.border}`,
                      padding:       "1px 6px",
                      borderRadius:  4,
                      flexShrink:    0,
                    }}>
                      {httpCode ?? errCode}
                    </span>
                  )}
                </div>
                {/* ── Detail body ── */}
                <div style={{
                  padding:    "5px 9px 6px",
                  fontSize:   8.5,
                  color:      th.textMid,
                  lineHeight: 1.6,
                  wordBreak:  "break-word",
                }}>
                  {fix.detail}
                </div>
              </div>
            );
          })()}

          {scheme.lastDate && (
            <div style={{
              fontSize:   9,
              marginTop:  2,
              color:      isExpired ? RED : isExpiringSoon ? AMBER : th.textSub,
              fontWeight: isExpired || isExpiringSoon ? 700 : 400,
            }}>
              Deadline: {scheme.lastDate}
            </div>
          )}
        </div>

        {/* Right: status badge + HTTP badge + chevron */}
        <div style={{
          display:       "flex",
          flexDirection: "column",
          alignItems:    "flex-end",
          gap:           4,
          flexShrink:    0,
        }}>
          <StatusBadge result={result} />
          <HttpBadge status={result.httpStatus} />
          <span style={{ fontSize: 9, color: th.textSub, lineHeight: 1 }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          style={{
            marginTop:     8,
            padding:       "10px 12px",
            background:    th.card2,
            borderRadius:  8,
            display:       "flex",
            flexDirection: "column",
            gap:           4,
          }}
        >
          {[
            ["Scheme ID",       scheme.id],
            ["Scope",           `${scheme.scope}${scheme.state ? ` · ${scheme.state}` : ""}`],
            ["Check Tier",      `Tier ${result.tier}`],
            ["HTTP Status",     result.httpStatus != null ? String(result.httpStatus) : "—"],
            ["AI lastDate",     result.lastDate || "—"],
            ["AI isActive",     result.isActive === true ? "Yes" : result.isActive === false ? "No" : "—"],
            ["Confidence",      result.confidence != null ? `${Math.round(result.confidence * 100)}%` : "—"],
            ["Scheme lastDate", scheme.lastDate || "—"],
            ["Error",           result.error || "None"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, fontSize: 10, padding: "1px 0" }}>
              <span style={{ color: th.textSub, width: 110, flexShrink: 0 }}>{k}</span>
              <span style={{ color: th.text, fontWeight: 600, wordBreak: "break-all" }}>
                {v}
              </span>
            </div>
          ))}

          {/* URL row with Open + Copy buttons */}
          {scheme.apply?.en && (
            <div style={{
              display:    "flex",
              gap:        6,
              marginTop:  6,
              alignItems: "center",
            }}>
              <a
                href={scheme.apply.en}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex:         1,
                  fontSize:     10,
                  color:        NAVY,
                  textDecoration: "none",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}
              >
                Open URL →
              </a>
              <button
                onClick={handleCopyUrl}
                style={{
                  padding:      "3px 9px",
                  borderRadius: 6,
                  fontSize:     9,
                  fontWeight:   700,
                  cursor:       "pointer",
                  border:       `1px solid ${copied === "error" ? RED : copied ? IND_GREEN : th.border}`,
                  background:   copied === "error" ? `${RED}15` : copied ? `${IND_GREEN}15` : th.card,
                  color:        copied === "error" ? RED : copied ? IND_GREEN : th.textMid,
                  transition:   "all 0.2s",
                  flexShrink:   0,
                  fontFamily:   "inherit",
                }}
              >
                {copied === "error" ? "Failed" : copied ? "Copied" : "Copy URL"}
              </button>
            </div>
          )}

          {/* ── Find New URL — only for confirmed dead links ── */}
          {showFindNewUrl && (
            <div
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              style={{ marginTop: 8 }}
            >

              {/* ── Initial button ── */}
              {urlSearch === null && (
                <button
                  onClick={handleFindNewUrl}
                  style={{
                    width:        "100%",
                    padding:      "6px 12px",
                    borderRadius: 7,
                    fontSize:     10,
                    fontWeight:   700,
                    cursor:       "pointer",
                    border:       `1.5px solid ${NAVY}`,
                    background:   `${NAVY}12`,
                    color:        NAVY,
                    fontFamily:   "inherit",
                    transition:   "all 0.15s",
                  }}
                >
                  🔍 Find New URL
                </button>
              )}

              {/* ── Loading ── */}
              {urlSearch === "loading" && (
                <div style={{
                  padding:      "8px 10px",
                  borderRadius: 7,
                  background:   th.card2,
                  border:       `1px solid ${th.border}`,
                  fontSize:     9,
                  color:        th.textSub,
                  display:      "flex",
                  alignItems:   "center",
                  gap:          6,
                }}>
                  <span style={{
                    display:        "inline-block",
                    width:          10,
                    height:         10,
                    borderRadius:   "50%",
                    border:         `2px solid ${NAVY}`,
                    borderTopColor: "transparent",
                    animation:      "sv-spin 0.7s linear infinite",
                    flexShrink:     0,
                  }}/>
                  Searching official portals…
                </div>
              )}

              {/* ── Patching ── */}
              {urlSearch === "patching" && (
                <div style={{
                  padding:      "8px 10px",
                  borderRadius: 7,
                  background:   th.card2,
                  border:       `1px solid ${th.border}`,
                  fontSize:     9,
                  color:        th.textSub,
                  display:      "flex",
                  alignItems:   "center",
                  gap:          6,
                }}>
                  <span style={{
                    display:        "inline-block",
                    width:          10,
                    height:         10,
                    borderRadius:   "50%",
                    border:         `2px solid ${IND_GREEN}`,
                    borderTopColor: "transparent",
                    animation:      "sv-spin 0.7s linear infinite",
                    flexShrink:     0,
                  }}/>
                  Committing to GitHub…
                </div>
              )}

              {/* ── Candidates list ── */}
              {urlSearch?.candidates && (
                <div style={{
                  borderRadius: 7,
                  border:       `1px solid ${th.border}`,
                  background:   th.card2,
                  overflow:     "hidden",
                }}>

                  {/* Header */}
                  <div style={{
                    padding:        "6px 10px",
                    borderBottom:   `1px solid ${th.border}`,
                    fontSize:       9,
                    fontWeight:     700,
                    color:          th.textMid,
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                  }}>
                    <span>
                      {urlSearch.candidates.length === 0
                        ? "No candidates found"
                        : `${urlSearch.candidates.length} candidate${urlSearch.candidates.length !== 1 ? "s" : ""} found`}
                    </span>
                    <button
                      onClick={handleCancelSearch}
                      style={{
                        background: "none",
                        border:     "none",
                        cursor:     "pointer",
                        color:      th.textSub,
                        fontSize:   10,
                        padding:    "0 2px",
                        fontFamily: "inherit",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Candidate rows */}
                  {urlSearch.candidates.map((c, idx) => {
                    const isSelected = c.url === selectedUrl;
                    return (
                      <div
                        key={c.url}
                        onClick={e => { e.stopPropagation(); setSelectedUrl(c.url); }}
                        style={{
                          padding:      "7px 10px",
                          borderBottom: idx < urlSearch.candidates.length - 1
                            ? `1px solid ${th.border}` : "none",
                          cursor:       "pointer",
                          background:   isSelected ? `${NAVY}10` : "transparent",
                          borderLeft:   `3px solid ${isSelected ? NAVY : "transparent"}`,
                          transition:   "all 0.1s",
                        }}
                      >
                        {/* Domain + alive dot */}
                        <div style={{
                          display:      "flex",
                          alignItems:   "center",
                          gap:          6,
                          marginBottom: 2,
                        }}>
                          <span style={{
                            width:        6,
                            height:       6,
                            borderRadius: "50%",
                            background:   c.alive ? IND_GREEN : RED,
                            flexShrink:   0,
                          }}/>
                          <span style={{
                            fontSize:   9,
                            fontWeight: 700,
                            color:      isSelected ? NAVY : th.text,
                          }}>
                            {c.domain}
                          </span>
                          {/* Confidence pill */}
                          <span style={{
                            fontSize:     7.5,
                            fontWeight:   700,
                            padding:      "1px 5px",
                            borderRadius: 4,
                            background:   c.confidence >= 0.7
                              ? `${IND_GREEN}18`
                              : c.confidence >= 0.4
                              ? `${AMBER}18`
                              : `${th.border}`,
                            color: c.confidence >= 0.7
                              ? IND_GREEN
                              : c.confidence >= 0.4
                              ? AMBER
                              : th.textSub,
                            marginLeft: "auto",
                            flexShrink: 0,
                          }}>
                            {Math.round(c.confidence * 100)}%
                          </span>
                        </div>
                        {/* Full URL */}
                        <div style={{
                          fontSize:     8,
                          color:        th.textSub,
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace:   "nowrap",
                        }}>
                          {c.url}
                        </div>
                        {/* Page title */}
                        {c.title && (
                          <div style={{
                            fontSize:     7.5,
                            color:        th.textSub,
                            marginTop:    2,
                            overflow:     "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                            opacity:      0.75,
                          }}>
                            {c.title}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Action row: Commit Fix + Preview */}
                  {urlSearch.candidates.length > 0 && selectedUrl && (
                    <div style={{
                      padding:    "7px 10px",
                      borderTop:  `1px solid ${th.border}`,
                      display:    "flex",
                      gap:        6,
                      alignItems: "center",
                    }}>
                      <button
                        onClick={handleCommitFix}
                        style={{
                          flex:         1,
                          padding:      "5px 10px",
                          borderRadius: 6,
                          fontSize:     9,
                          fontWeight:   700,
                          cursor:       "pointer",
                          border:       `1.5px solid ${IND_GREEN}`,
                          background:   `${IND_GREEN}15`,
                          color:        IND_GREEN,
                          fontFamily:   "inherit",
                          transition:   "all 0.15s",
                        }}
                      >
                        ✓ Commit Fix
                      </button>
                      <a
                        href={selectedUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding:        "5px 9px",
                          borderRadius:   6,
                          fontSize:       9,
                          fontWeight:     600,
                          color:          NAVY,
                          border:         `1px solid ${th.border}`,
                          background:     th.card,
                          textDecoration: "none",
                          whiteSpace:     "nowrap",
                          flexShrink:     0,
                        }}
                      >
                        Preview ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* ── Committed ── */}
              {urlSearch?.done && (
                <div style={{
                  padding:      "8px 10px",
                  borderRadius: 7,
                  background:   `${IND_GREEN}10`,
                  border:       `1px solid ${IND_GREEN}40`,
                  fontSize:     9,
                }}>
                  <div style={{
                    fontWeight:   700,
                    color:        IND_GREEN,
                    marginBottom: 3,
                  }}>
                    ✓ Committed — Vercel deploying (~1–2 min)
                  </div>
                  <div style={{
                    fontFamily:   "monospace",
                    color:        th.textSub,
                    fontSize:     8,
                    marginBottom: 4,
                  }}>
                    {urlSearch.sha?.slice(0, 7)}
                  </div>
                  {urlSearch.commitUrl && (
                    <a
                      href={urlSearch.commitUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize:       8,
                        color:          NAVY,
                        textDecoration: "none",
                      }}
                    >
                      View commit on GitHub ↗
                    </a>
                  )}
                </div>
              )}

              {/* ── Error ── */}
              {urlSearch?.error && (
                <div style={{
                  padding:      "8px 10px",
                  borderRadius: 7,
                  background:   `${RED}08`,
                  border:       `1px solid ${RED}30`,
                  fontSize:     9,
                }}>
                  <div style={{ fontWeight: 700, color: RED, marginBottom: 3 }}>
                    Failed
                  </div>
                  <div style={{ color: th.textMid, wordBreak: "break-word" }}>
                    {urlSearch.error}
                  </div>
                  <button
                    onClick={handleCancelSearch}
                    style={{
                      marginTop:  6,
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                      color:      th.textSub,
                      fontSize:   8,
                      padding:    0,
                      fontFamily: "inherit",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

            </div>
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
      padding:   "28px 16px",
      textAlign: "center",
      color:     th.textSub,
      fontSize:  12,
    }}>
      {message}
    </div>
  );
}


// ─── DB COVERAGE CARD ─────────────────────────────────────────────────────────
// Shows full breakdown of all schemes vs what the verifier can actually ping.
// Answers the question: "why only 444 out of 1100+?"

function DBCoverageCard({ stats, dark }) {
  const th    = THEME[dark ? "dark" : "light"];
  const [showStates, setShowStates] = useState(false);

  const verifiablePct = stats.total > 0
    ? Math.round((stats.verifiable / stats.total) * 100)
    : 0;

  const Row = ({ label, value, color, sub }) => (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      padding:        "5px 0",
      borderBottom:   `1px solid ${th.border}`,
    }}>
      <span style={{ fontSize: 11, color: th.textMid }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: color || th.text }}>
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: 9, color: th.textSub, marginLeft: 5 }}>{sub}</span>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      background:   th.card,
      border:       `1.5px solid ${th.border}`,
      borderRadius: 16,
      overflow:     "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:        "12px 14px 10px",
        borderBottom:   `1px solid ${th.border}`,
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
            DB Coverage
          </div>
          <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>
            Why {stats.verifiable} are queued out of {stats.total} total
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>
          {verifiablePct}%
        </div>
      </div>

      {/* Segmented progress bar */}
      <div style={{ padding: "10px 14px 4px" }}>
        <div style={{
          height:       10,
          borderRadius: 6,
          background:   th.border,
          overflow:     "hidden",
          display:      "flex",
        }}>
          <div style={{
            width:      `${stats.total > 0 ? (stats.verifiable / stats.total) * 100 : 0}%`,
            background: IND_GREEN,
            transition: "width 0.4s",
          }} />
          <div style={{
            width:      `${stats.total > 0 ? (stats.onlineNoUrl / stats.total) * 100 : 0}%`,
            background: AMBER,
          }} />
          <div style={{
            width:      `${stats.total > 0 ? (stats.offline / stats.total) * 100 : 0}%`,
            background: `${RED}60`,
          }} />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
          {[
            [IND_GREEN,    `Verifiable (${stats.verifiable})`],
            [AMBER,        `Online/No URL (${stats.onlineNoUrl})`],
            [`${RED}99`,   `Offline (${stats.offline})`],
          ].map(([color, label]) => (
            <div key={label} style={{
              display:    "flex",
              alignItems: "center",
              gap:        4,
              fontSize:   9,
              color:      th.textMid,
            }}>
              <div style={{
                width:        8,
                height:       8,
                borderRadius: 2,
                background:   color,
                flexShrink:   0,
              }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Stat rows */}
      <div style={{ padding: "4px 14px 6px" }}>
        <Row label="Total schemes in DB"              value={stats.total}          color={th.text}  />
        <Row label="Verifiable (online + valid URL)" value={stats.verifiable}    color={IND_GREEN} sub="← what gets queued"         />
        <Row label="Online but plain-text apply"    value={stats.onlineNoUrl}   color={AMBER}    sub="e.g. 'Nearest CSC center'"    />
        <Row label="Offline (bank / in-person / CSC)" value={stats.offline}     color={RED}      sub="nothing to ping"              />
        <Row label="National schemes"              value={stats.national}        color={NAVY}     sub={`${stats.nationalOnline} verifiable`} />
        <Row label="State schemes"                 value={stats.state}           color={VIOLET}   sub={`${stats.stateOnline} verifiable`}    />
      </div>

      {/* Per-state breakdown toggle */}
      {stats.byState.length > 0 && (
        <div>
          <div
            {...a11yClickable(() => setShowStates(s => !s), {
              pressed: showStates,
              label: "Per-state breakdown",
            })}
            style={{
              padding:        "8px 14px",
              borderTop:      `1px solid ${th.border}`,
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              cursor:         "pointer",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: th.text }}>
              Per-state breakdown
            </span>
            <span style={{ fontSize: 10, color: th.textSub }}>
              {showStates ? "▲ Hide" : `▼ Show ${stats.byState.length} states`}
            </span>
          </div>

          {showStates && (
            <div style={{
              maxHeight: 220, overflowY: "auto",
              borderTop: `1px solid ${th.border}`,
            }}>
              {/* Table header */}
              <div style={{
                display:             "grid",
                gridTemplateColumns: "1fr 52px 52px 52px",
                padding:             "5px 14px",
                background:          th.card2,
                position:            "sticky",
                top:                 0,
              }}>
                {["State", "Total", "Online", "Offline"].map(h => (
                  <div key={h} style={{
                    fontSize:   9,
                    fontWeight: 800,
                    color:      th.textSub,
                    textAlign:  h === "State" ? "left" : "center",
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {stats.byState.map(({ name, total: st, online: so }) => {
                const offline = st - so;
                return (
                  <div
                    key={name}
                    style={{
                      display:             "grid",
                      gridTemplateColumns: "1fr 52px 52px 52px",
                      padding:             "5px 14px",
                      borderBottom:        `1px solid ${th.border}`,
                      alignItems:          "center",
                    }}
                  >
                    <div style={{ fontSize: 10, color: th.text, fontWeight: 600 }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: th.text, textAlign: "center" }}>
                      {st}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: IND_GREEN, textAlign: "center" }}>
                      {so}
                    </div>
                    <div style={{
                      fontSize:  11,
                      fontWeight: 700,
                      color:     offline > 0 ? RED : th.textSub,
                      textAlign: "center",
                    }}>
                      {offline}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── TECH STAT CARD ───────────────────────────────────────────────────────────
// Single terminal-style cell used inside RunSummaryCard.

function TechStatCard({ label, value, color, dark }) {
  const th      = THEME[dark ? "dark" : "light"];
  const display = useCountUp(value ?? 0);
  const hot     = (value ?? 0) > 0;

  return (
    <div style={{
      flex:         "1 1 0",
      minWidth:     0,
      background:   dark
        ? hot ? `${color}14` : "#1c2128"
        : hot ? `${color}08` : th.card2,
      border:       `1px solid ${hot ? color + "38" : (dark ? "#30363d" : th.border)}`,
      borderBottom: `2px solid ${hot ? color        : (dark ? "#2d333b" : th.border)}`,
      borderRadius: 8,
      padding:      "8px 6px 6px",
      textAlign:    "center",
    }}>
      <div style={{
        fontSize:   18,
        fontWeight: 900,
        lineHeight: 1,
        color:      hot ? color : th.textSub,
        fontFamily: "monospace",
      }}>
        <RollingNumber value={display} />
      </div>
      <div style={{
        fontSize:   7,
        fontWeight: 800,
        letterSpacing: 0.8,
        marginTop:  3,
        color:      th.textSub,
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        overflow:   "hidden",
        textOverflow: "ellipsis",
      }}>
        {label}
      </div>
    </div>
  );
}


// ─── RUN SUMMARY CARD ─────────────────────────────────────────────────────────
// Terminal-style post-run report.
// Shows run metadata (scope / priority / tier) + health bar + 2-section stat grid.

function RunSummaryCard({ summary, scopeFilter, priorityFilter, tier, wasAborted, dark }) {
  const th = THEME[dark ? "dark" : "light"];

  const scopeLabel =
    scopeFilter === "all"      ? "All Schemes"
    : scopeFilter === "national" ? "National"
    : scopeFilter.replace("state:", "");

  const priorityLabel =
    priorityFilter === "all"             ? "All Priority"
    : priorityFilter === "hasDate"       ? "Has Deadline"
    : priorityFilter === "neverVerified" ? "Never Verified"
    : "Stale 30d+";

  const tierLabel =
    tier === 1   ? "T1 · Ping"
    : tier === 2 ? "T2 · AI Extract"
    :              "T1+2 · Full";

  const healthPct = summary.total > 0
    ? Math.round((summary.active / summary.total) * 100)
    : 0;
  const healthColor =
    healthPct >= 70 ? IND_GREEN : healthPct >= 40 ? AMBER : RED;

  const segments = [
    { value: summary.active,     color: IND_GREEN, label: "Active"  },
    { value: summary.dead,       color: RED,        label: "Dead"    },
    { value: summary.noResponse, color: AMBER,      label: "No Resp" },
    { value: summary.errors,     color: VIOLET,     label: "Errors"  },
  ];

  const cfgItems = [
    ["SCOPE",    scopeLabel],
    ["PRIORITY", priorityLabel],
    ["MODE",     tierLabel],
    ["TOTAL",    `${summary.total} schemes`],
  ];

  return (
    <div style={{
      background:   dark
        ? "linear-gradient(145deg, #0d1117 0%, #161b22 100%)"
        : th.card,
      border:       `1.5px solid ${dark ? "#30363d" : th.border}`,
      borderRadius: 16,
      overflow:     "hidden",
      animation:    "sv-done-pop 0.5s cubic-bezier(0.22,1,0.36,1) both",
    }}>

      {/* ── Terminal title bar ── */}
      <div style={{
        background:   dark ? "#161b22" : `${NAVY}09`,
        borderBottom: `1px solid ${dark ? "#30363d" : th.border}`,
        padding:      "9px 14px",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* macOS-style traffic dots */}
          <div style={{ display: "flex", gap: 4 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{
            fontSize:      8,
            fontWeight:    800,
            letterSpacing: 2.5,
            color:         dark ? "#6e7681" : th.textSub,
            fontFamily:    "monospace",
          }}>
            RUN_REPORT.LOG
          </span>
        </div>
        <span style={{
          fontSize:      8,
          fontWeight:    800,
          letterSpacing: 1.5,
          padding:       "2px 8px",
          borderRadius:  4,
          background:    wasAborted ? `${RED}22`      : `${IND_GREEN}22`,
          color:         wasAborted ? RED             : IND_GREEN,
          border:        `1px solid ${wasAborted ? RED : IND_GREEN}45`,
          fontFamily:    "monospace",
        }}>
          {wasAborted ? "● STOPPED" : "● COMPLETE"}
        </span>
      </div>

      {/* ── Run config key-value strip ── */}
      <div style={{ padding: "10px 14px 0", display: "flex", gap: 5, flexWrap: "wrap" }}>
        {cfgItems.map(([key, val]) => (
          <div key={key} style={{
            display:    "inline-flex",
            alignItems: "stretch",
            border:     `1px solid ${dark ? "#30363d" : th.border}`,
            borderRadius: 5,
            overflow:   "hidden",
            fontSize:   8,
          }}>
            <span style={{
              padding:       "2px 5px",
              background:    dark ? "#2d333b" : `${NAVY}14`,
              color:         dark ? "#6e7681" : th.textSub,
              fontFamily:    "monospace",
              fontWeight:    800,
              letterSpacing: 0.5,
            }}>
              {key}
            </span>
            <span style={{
              padding:    "2px 7px",
              background: dark ? "#21262d" : `${NAVY}05`,
              color:      dark ? "#cdd9e5" : th.text,
              fontWeight: 700,
            }}>
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* ── Link health bar ── */}
      <div style={{ padding: "12px 14px 10px" }}>
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   6,
        }}>
          <span style={{
            fontSize:      8,
            fontWeight:    800,
            letterSpacing: 2,
            color:         dark ? "#6e7681" : th.textSub,
            fontFamily:    "monospace",
          }}>
            LINK_HEALTH
          </span>
          <span style={{
            fontSize:   13,
            fontWeight: 900,
            color:      healthColor,
            fontFamily: "monospace",
          }}>
            {healthPct}%
          </span>
        </div>

        {/* Segmented bar */}
        <div style={{
          height:       10,
          borderRadius: 6,
          overflow:     "hidden",
          background:   dark ? "#21262d" : th.border,
          display:      "flex",
        }}>
          {segments.map(({ value, color }) => {
            const w = summary.total > 0 ? (value / summary.total) * 100 : 0;
            return w > 0 ? (
              <div key={color} style={{
                width:      `${w}%`,
                background: color,
                transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
              }} />
            ) : null;
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 10, marginTop: 7, flexWrap: "wrap" }}>
          {segments.map(({ value, color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: th.textMid }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: "monospace", fontWeight: 800, color }}>{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: dark ? "#21262d" : th.border, margin: "0 14px" }} />

      {/* ── LINK_HEALTH stat section ── */}
      <div style={{ padding: "10px 14px 4px" }}>
        <div style={{
          fontSize:      7,
          fontWeight:    800,
          letterSpacing: 2.5,
          marginBottom:  7,
          color:         dark ? "#6e7681" : th.textSub,
          fontFamily:    "monospace",
        }}>
          ▸ LINK_HEALTH
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <TechStatCard label="TOTAL"   value={summary.total}      color={NAVY}      dark={dark} />
          <TechStatCard label="ACTIVE"  value={summary.active}     color={IND_GREEN} dark={dark} />
          <TechStatCard label="DEAD"    value={summary.dead}       color={RED}       dark={dark} />
          <TechStatCard label="NO_RESP" value={summary.noResponse} color={AMBER}     dark={dark} />
        </div>
      </div>

      {/* ── DEADLINE_INTEL stat section ── */}
      <div style={{ padding: "8px 14px 12px" }}>
        <div style={{
          fontSize:      7,
          fontWeight:    800,
          letterSpacing: 2.5,
          marginBottom:  7,
          color:         dark ? "#6e7681" : th.textSub,
          fontFamily:    "monospace",
        }}>
          ▸ DEADLINE_INTEL
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <TechStatCard label="EXPIRED"  value={summary.expired}      color={RED}     dark={dark} />
          <TechStatCard label="EXP_SOON" value={summary.expiringSoon} color={SAFFRON} dark={dark} />
          <TechStatCard label="NO_HIST"  value={summary.neverChecked} color={VIOLET}  dark={dark} />
          <TechStatCard label="ERRORS"   value={summary.errors}       color={PINK}    dark={dark} />
        </div>
      </div>
    </div>
  );
}


// ─── LIVE SCANNER CARD ────────────────────────────────────────────────────────
// Premium scanning UI shown during an active verification run.
// The scheme name re-animates via `key` every time the scheme changes.
// Displays real-time elapsed time, scan speed, and estimated time remaining.

function LiveSchemeCard({
  schemeName, index, total, dark,
  scopeFilter, priorityFilter, tier,
  elapsed, speed, eta,
}) {
  const th  = THEME[dark ? "dark" : "light"];
  const pct = total > 0 ? Math.round((index / total) * 100) : 0;

  return (
    <div style={{
      position:  "relative",
      background: dark
        ? "linear-gradient(140deg, #06101e 0%, #0b1a2e 100%)"
        : "linear-gradient(140deg, #eef3ff 0%, #e4eeff 100%)",
      border:       `1.5px solid ${NAVY}50`,
      borderRadius: 16,
      padding:      "16px",
      overflow:     "hidden",
      animation:    "sv-card-glow 3s ease infinite",
    }}>

      {/* Grid texture overlay */}
      <div style={{
        position:         "absolute",
        inset:            0,
        pointerEvents:    "none",
        backgroundImage:  `
          linear-gradient(${NAVY}09 1px, transparent 1px),
          linear-gradient(90deg, ${NAVY}09 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }} />

      {/* Horizontal scan line */}
      <div style={{
        position:      "absolute",
        left:          0,
        right:         0,
        height:        2,
        background:    `linear-gradient(90deg,
          transparent 0%, ${NAVY}50 15%,
          ${IND_GREEN}dd 50%,
          ${NAVY}50 85%, transparent 100%)`,
        animation:     "sv-scan-line 2.2s ease-in-out infinite",
        pointerEvents: "none",
        zIndex:        2,
      }} />

      {/* Corner tier tag */}
      <div style={{
        position:      "absolute",
        top:           10,
        right:         12,
        fontSize:      8,
        fontWeight:    800,
        letterSpacing: 2,
        color:         `${NAVY}70`,
        fontFamily:    "monospace",
      }}>
        {tier === "both" ? "TIER·1+2" : `TIER·${tier}`}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* SCANNING label + live % */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width:      7,
              height:     7,
              borderRadius: "50%",
              background: IND_GREEN,
              animation:  "sv-pulse 1.4s ease infinite",
              boxShadow:  `0 0 0 3px ${IND_GREEN}30`,
            }} />
            <span style={{
              fontSize:      9,
              fontWeight:    800,
              letterSpacing: 2.5,
              color:         IND_GREEN,
              fontFamily:    "monospace",
            }}>
              SCANNING
            </span>
            <span style={{
              fontSize:      8,
              color:         `${IND_GREEN}80`,
              fontFamily:    "monospace",
              letterSpacing: 1,
            }}>
              ▸▸
            </span>
          </div>
          <span style={{
            fontSize:      13,
            fontWeight:    900,
            color:         NAVY,
            fontFamily:    "monospace",
            letterSpacing: 1,
          }}>
            {pct}%
          </span>
        </div>

        {/* Active settings pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {[
            scopeFilter === "all"        ? "All Schemes"
            : scopeFilter === "national" ? "National"
            : `${scopeFilter.replace("state:", "")}`,

            priorityFilter === "all"             ? "All Priority"
            : priorityFilter === "hasDate"       ? "Has Deadline"
            : priorityFilter === "neverVerified" ? "Never Verified"
            : "Stale 30d+",

            tier === 1 ? "Tier 1 · Ping" : tier === 2 ? "Tier 2 · AI" : "Tier 1+2",
          ].map(label => (
            <span key={label} style={{
              fontSize:      8,
              fontWeight:    700,
              padding:       "2px 7px",
              borderRadius:  5,
              background:    dark ? `${NAVY}25` : `${NAVY}12`,
              color:         dark ? `#7da8e8`   : NAVY,
              border:        `1px solid ${NAVY}25`,
              letterSpacing: 0.2,
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* Current scheme name — re-animates on change */}
        <div
          key={schemeName}
          style={{
            fontSize:   14,
            fontWeight: 800,
            color:      dark ? "#f0f0f0" : "#0d1b2e",
            lineHeight: 1.3,
            marginBottom: 6,
            animation:  "sv-scheme-fly-in 0.38s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {schemeName || "Initializing…"}
        </div>

        {/* Progress bar with shimmer */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            height:       4,
            borderRadius: 4,
            background:   `${NAVY}25`,
            overflow:     "hidden",
          }}>
            <div style={{
              height:     "100%",
              width:      `${pct}%`,
              borderRadius: 4,
              transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
              minWidth:   index > 0 ? 6 : 0,
              background: `linear-gradient(
                105deg,
                ${NAVY} 0%, ${NAVY} 30%,
                #5b9bd5 50%,
                ${NAVY} 70%, ${NAVY} 100%
              )`,
              backgroundSize: "200% 100%",
              animation:  "sv-progress-shimmer 1.6s ease-in-out infinite",
            }} />
          </div>
        </div>

        {/* Bottom row: index counter + timing strip + mini segment dots */}
        <div style={{
          display:     "flex",
          alignItems:  "center",
          justifyContent: "space-between",
          gap:         6,
        }}>
          {/* Index counter */}
          <span style={{ fontSize: 9, color: th.textSub, fontFamily: "monospace" }}>
            <span style={{ color: NAVY, fontWeight: 700 }}>
              #{String(index).padStart(3, "0")}
            </span>
            {" "}/ {total}
          </span>

          {/* Live timing strip: elapsed · speed · ETA */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {elapsed > 0 && (
              <span style={{
                fontSize:      8,
                fontFamily:    "monospace",
                color:         dark ? "#5b7fa6" : `${NAVY}80`,
                letterSpacing: 0.5,
              }}>
                {fmtDuration(elapsed)}
              </span>
            )}
            {speed > 0 && (
              <span style={{
                fontSize:      8,
                fontFamily:    "monospace",
                color:         dark ? `${IND_GREEN}cc` : IND_GREEN,
                fontWeight:    700,
                letterSpacing: 0.5,
              }}>
                {speed}/min
              </span>
            )}
            {eta != null && eta > 3000 && (
              <span style={{
                fontSize:      8,
                fontFamily:    "monospace",
                color:         dark ? "#5b7fa6" : `${NAVY}80`,
                letterSpacing: 0.5,
              }}>
                ETA {fmtDuration(eta)}
              </span>
            )}
          </div>

          {/* Mini segment dots */}
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: Math.min(total, 10) }).map((_, i) => {
              const filled = i < Math.round((index / total) * 10);
              return (
                <div key={i} style={{
                  width:        5,
                  height:       5,
                  borderRadius: 1.5,
                  background:   filled ? NAVY : `${NAVY}25`,
                  transition:   "background 0.3s",
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── PAGE BUTTON STYLE HELPER ─────────────────────────────────────────────────
function pageBtn(active, th, activeColor = th?.text) {
  return {
    minWidth:     28,
    padding:      "5px 7px",
    borderRadius: 7,
    textAlign:    "center",
    fontSize:     11,
    fontWeight:   active ? 800 : 600,
    cursor:       active ? "default" : "pointer",
    background:   active ? (activeColor ?? th.text) : th.border,
    color:        active ? "#fff" : th.textMid,
    userSelect:   "none",
    transition:   "background 0.12s",
  };
}


// ─── SAVED SCANS PANEL ───────────────────────────────────────────────────────
// Shows all saved scan results stored in localStorage.
// Each row: scope label · scheme count · issue count · save timestamp.
// Buttons: "Export PDF" (loads full results + generates report) · "✕" (clear).
// Renders null if no saved scans exist yet.

function SavedScansSection({ dark, savedScans, onScanCleared }) {
  const th = THEME[dark ? "dark" : "light"];

  if (!savedScans || savedScans.length === 0) return null;

  const handleExportScan = (key) => {
    const scan = loadFullScan(key);
    if (!scan || !scan.results?.length) {
      alert("Saved scan data not found or is empty.");
      return;
    }
    exportResultsPDF(scan.results, scan.summary, scan.scopeFilter, scan.priorityFilter, scan.tier);
  };

  const handleClear = (key) => {
    clearSavedScan(key);
    onScanCleared();
  };

  const formatDate = (iso) => {
    if (!iso) return "Unknown date";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  const getScopeLabel = (scopeFilter) => {
    if (scopeFilter === "national") return "National";
    if (scopeFilter === "all")      return "All Schemes";
    return scopeFilter.replace("state:", "");
  };

  return (
    <div style={{
      background:   th.card,
      border:       `1.5px solid ${th.border}`,
      borderRadius: 16,
      overflow:     "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:        "10px 14px 9px",
        borderBottom:   `1px solid ${th.border}`,
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
            Saved Scan Results
          </div>
          <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>
            Export PDF from a previous scan — no need to re-run
          </div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, color: th.textSub,
          padding: "2px 8px", background: th.card2,
          border: `1px solid ${th.border}`, borderRadius: 8,
        }}>
          {savedScans.length} saved
        </span>
      </div>

      {/* Scan rows */}
      {savedScans.map((scan, idx) => {
        const s          = scan.summary || {};
        const issues     = (s.dead || 0) + (s.errors || 0);
        const scopeLabel = getScopeLabel(scan.scopeFilter || "all");
        const isLast     = idx === savedScans.length - 1;

        return (
          <div
            key={scan.key}
            style={{
              padding:      "10px 14px",
              borderBottom: isLast ? "none" : `1px solid ${th.border}`,
              display:      "flex",
              gap:          10,
              alignItems:   "center",
            }}
          >
            {/* Left: scope badge + info */}
            <div style={{
              width:        32, height: 32, borderRadius: 8, flexShrink: 0,
              background:   dark ? `${NAVY}25` : `${NAVY}10`,
              border:       `1px solid ${NAVY}30`,
              display:      "flex", alignItems: "center", justifyContent: "center",
              fontSize:     13, fontWeight: 900, color: NAVY,
            }}>
              {scan.scopeFilter === "national" ? "🇮🇳"
               : scan.scopeFilter?.startsWith("state:") ? "📍"
               : "📋"}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: th.text }}>
                  {scopeLabel}
                </span>
                <span style={{ fontSize: 9, color: th.textSub }}>
                  · {scan.schemeCount} schemes
                </span>
                {issues > 0 && (
                  <span style={{
                    fontSize: 8, fontWeight: 800, padding: "1px 6px",
                    borderRadius: 8,
                    background: "rgba(220,38,38,0.1)", color: RED,
                  }}>
                    {issues} issue{issues !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 9, color: th.textSub, marginTop: 1 }}>
                Saved {formatDate(scan.savedAt)}
              </div>

              {s.total > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {[
                    [IND_GREEN, `${s.active     || 0} active`],
                    [RED,       `${s.dead        || 0} dead`],
                    [AMBER,     `${s.noResponse  || 0} no resp.`],
                    [VIOLET,    `${s.errors      || 0} errors`],
                  ].map(([color, label]) => (
                    <span key={label} style={{ fontSize: 9, color, fontWeight: 700 }}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: actions */}
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <div
                {...a11yClickable(() => handleExportScan(scan.key), {
                  label: `Export PDF for ${scopeLabel} scan`,
                })}
                style={{
                  padding:      "5px 11px",
                  borderRadius: 8,
                  fontSize:     10,
                  fontWeight:   700,
                  background:   dark ? `${NAVY}22` : `${NAVY}09`,
                  border:       `1.5px solid ${NAVY}45`,
                  color:        NAVY,
                  cursor:       "pointer",
                  whiteSpace:   "nowrap",
                  transition:   "background 0.13s",
                }}
              >
                Export PDF
              </div>
              <div
                {...a11yClickable(() => handleClear(scan.key), {
                  label: `Clear ${scopeLabel} saved scan`,
                })}
                style={{
                  padding:      "5px 8px",
                  borderRadius: 8,
                  fontSize:     10,
                  fontWeight:   700,
                  background:   "transparent",
                  border:       `1.5px solid ${th.border}`,
                  color:        th.textSub,
                  cursor:       "pointer",
                  transition:   "border-color 0.13s",
                }}
              >
                ✕
              </div>
            </div>
          </div>
        );
      })}
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
  const dbStats           = useMemo(() => getDBStats(), []);
  const [availableStates,  setAvailableStates]  = useState([]);
  const [checkpoint,       setCheckpoint]       = useState(null);
  const [checkpointLoaded, setCheckpointLoaded] = useState(false);

  // ── Run state ─────────────────────────────────────────────────────────────
  const [running,       setRunning]       = useState(false);
  const [progress,      setProgress]      = useState(null);   // { index, total }
  const [currentScheme, setCurrentScheme] = useState(null);
  const [results,       setResults]       = useState([]);
  const [summary,       setSummary]       = useState(null);
  const [liveStats,     setLiveStats]     = useState(null);  // { active, dead, noResponse, errors } — updates every scheme
  const [runDone,       setRunDone]       = useState(false);
  const [wasAborted,    setWasAborted]    = useState(false);
  const [saveStatus,    setSaveStatus]    = useState(null); // null | "saving" | "saved" | "error"

  // ── Saved scans (localStorage) ────────────────────────────────────────────
  const [savedScans, setSavedScans] = useState(() => loadAllSavedScans());

  // ── Timing (elapsed / speed / ETA) ───────────────────────────────────────
  const startTimeRef = useRef(null);
  const [elapsed,    setElapsed]    = useState(0);  // ms since run started

  // ── Results view ──────────────────────────────────────────────────────────
  const [resultFilter, setResultFilter] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,         setPage]         = useState(1);
  const [expandAll,    setExpandAll]    = useState(false);  // Fix 7: expand all rows
  const [isPendingStop, setIsPendingStop] = useState(false); // Fix 3: confirm-before-stop

  const abortRef        = useRef(null);
  const accResultsRef   = useRef([]);  // avoids stale-closure issue in onProgress
  const endTimeRef      = useRef(null); // Fix 8: accurate final elapsed
  const lastUpdateRef   = useRef(0);   // Fix 4: throttle onProgress state updates

  // ── Computed scope filter string ──────────────────────────────────────────
  const scopeFilter = useMemo(() => {
    if (scopeMode === "state") {
      return selectedState ? `state:${selectedState}` : "all";
    }
    return scopeMode;
  }, [scopeMode, selectedState]);

  // Fix 5: synchronous pure function — no need for useEffect+setState
  const previewCount = useMemo(
    () => getVerifiableCount(scopeFilter, priorityFilter),
    [scopeFilter, priorityFilter]
  );

  // ── Can the Start button be pressed? ─────────────────────────────────────
  const canStart = previewCount > 0 && !(scopeMode === "state" && !selectedState);

  // ── Live timing ticker ────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - (startTimeRef.current || Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // ── Derived speed + ETA ───────────────────────────────────────────────────
  const speed = useMemo(() => {
    if (!progress?.index || elapsed < 2000) return 0;
    return Math.round(progress.index / (elapsed / 60000));
  }, [progress?.index, elapsed]);

  const eta = useMemo(() => {
    if (!speed || !progress) return null;
    return Math.round(((progress.total - progress.index) / speed) * 60000);
  }, [speed, progress]);

  // ── Init: load states + checkpoint ───────────────────────────────────────
  useEffect(() => {
    setAvailableStates(getStatesInDB());
    loadCheckpoint().then(cp => {
      const valid = cp && !cp.cleared && !cp.isComplete && cp.completedIndex > 0 && cp.completedIndex < cp.total;
      setCheckpoint(valid ? cp : null);
      setCheckpointLoaded(true);
    });
  }, []);

  // Fix 6: debounce search to avoid re-filtering 400+ results on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 150);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // ── START / RESUME ────────────────────────────────────────────────────────
  const handleStart = useCallback(async (resumeFrom = 0) => {
    if (running) return;

    if (resumeFrom === 0) {
      accResultsRef.current = [];
      setResults([]);
      setSummary(null);
      setLiveStats({ active: 0, dead: 0, noResponse: 0, errors: 0 });
      setRunDone(false);
      setWasAborted(false);
      setSaveStatus(null);
      setProgress(null);
      setCurrentScheme(null);   // prevent stale scheme name flash on new run
      await clearCheckpoint();
    } else {
      // Resuming: seed liveStats from whatever's already accumulated so the
      // mini cards continue from the correct counts instead of resetting to 0.
      const seed = buildSummary(accResultsRef.current);
      setLiveStats({
        active:     seed.active     ?? 0,
        dead:       seed.dead       ?? 0,
        noResponse: seed.noResponse ?? 0,
        errors:     seed.errors     ?? 0,
      });
    }

    startTimeRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    setPage(1);
    setResultFilter("all");
    setSearchQuery("");

    const controller  = new AbortController();
    abortRef.current  = controller;
    lastUpdateRef.current = 0;  // reset throttle clock

    try {
      await runVerification({
        scopeFilter,
        priorityFilter,
        tier,
        resumeFrom,
        signal: controller.signal,

        onProgress: ({ index, total, scheme, result }) => {
          accResultsRef.current.push(result);
          // Fix 4: always update the live label + counter (cheap),
          // but only spread the array and rebuild summary every 500ms or on the final scheme.
          const now     = Date.now();
          const isFinal = index === total;
          setProgress({ index, total });
          setCurrentScheme(scheme?.name?.en || scheme?.id || "…");

          // liveStats: bump exactly one bucket per scheme — O(1), no array
          // spread — so MiniCards count up smoothly +1 at a time regardless
          // of the 500ms throttle below.
          const status = getResultStatus(result);
          setLiveStats(prev => {
            const base = prev || { active: 0, dead: 0, noResponse: 0, errors: 0 };
            return {
              active:     base.active     + (status === "Active"      ? 1 : 0),
              dead:       base.dead       + (status === "Dead"         ? 1 : 0),
              noResponse: base.noResponse + (status === "No Response"  ? 1 : 0),
              errors:     base.errors     + (status === "Error"        ? 1 : 0),
            };
          });

          if (isFinal || now - lastUpdateRef.current > 500) {
            lastUpdateRef.current = now;
            const snap = [...accResultsRef.current];
            setResults(snap);
            setSummary(buildSummary(snap));
          }
        },

        onBatchSaved: (cp) => {
          setCheckpoint(cp);
        },
      });
    } catch (err) {
      console.error("[SchemeVerifier] Unexpected run error:", err);
    }

    // Fix 8: capture exact end time before React state flush so done banner is accurate
    endTimeRef.current = Date.now();
    setWasAborted(controller.signal.aborted);
    // Fix 4: ensure the final batch is always flushed even if throttle didn't fire
    const finalSnap = [...accResultsRef.current];
    setResults(finalSnap);
    setSummary(buildSummary(finalSnap));
    setRunning(false);
    setCurrentScheme(null);
    setRunDone(true);

    // ── Auto-save results to GitHub repo via /api/update-schemes-meta ──────────
    // Runs even on abort — partial data is still useful. Fires asynchronously so
    // it doesn't block the done banner from appearing.
    if (finalSnap.length > 0) {
      setSaveStatus("saving");
      writeSchemeResults(finalSnap)
        .then(() => setSaveStatus("saved"))
        .catch(err => {
          console.error("[SchemeVerifier] Save to repo failed:", err);
          setSaveStatus("error");
        });

      // ── Auto-save to localStorage for later PDF export ──────────────────
      // Runs synchronously (before the async repo write) — localStorage is fast.
      // Overwrites any previous scan for the same scope, keeping one slot per
      // national / all / state:<name> combination.
      const finalSummary = buildSummary(finalSnap);
      saveScanResults(scopeFilter, priorityFilter, tier, finalSnap, finalSummary);
      setSavedScans(loadAllSavedScans());
    }
  }, [running, scopeFilter, priorityFilter, tier]);

  // ── PAUSE — abort but keep checkpoint so Resume banner appears ────────────
  const handlePause = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── STOP & DISCARD — confirm first, then abort + wipe checkpoint ─────────
  const handleStop = useCallback(async () => {
    if (!isPendingStop) {
      setIsPendingStop(true);
      setTimeout(() => setIsPendingStop(false), 3000);
      return;
    }
    setIsPendingStop(false);
    abortRef.current?.abort();
    await clearCheckpoint();
    setCheckpoint(null);
  }, [isPendingStop]);

  // ── RESET to config screen ────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    accResultsRef.current = [];
    setResults([]);
    setSummary(null);
    setLiveStats(null);
    setProgress(null);
    setRunDone(false);
    setWasAborted(false);
    setElapsed(0);
    setPage(1);
    setResultFilter("all");
    setSearchQuery("");
  }, []);

  // ── EXPORT PDF ────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (results.length > 0) {
      exportResultsPDF(results, summary, scopeFilter, priorityFilter, tier);
    }
  }, [results, summary, scopeFilter, priorityFilter, tier]);

  // ── Filtered + searched + paginated results ───────────────────────────────
  const filteredResults = useMemo(() => {
    let base = results;

    // Status filter
    switch (resultFilter) {
      case "active":     base = base.filter(r => r.alive === true);                    break;
      case "dead":       base = base.filter(r => r.alive === false);                   break;
      case "noResponse": base = base.filter(r => r.alive === null && !r.error);        break;
      case "error":      base = base.filter(r => !!r.error);                           break;
      default: break;
    }

    // Fix 6: use debouncedSearch to avoid re-filtering on every keystroke
    if (debouncedSearch.trim()) {
      base = base.filter(r => matchesSearch(r, debouncedSearch));
    }

    return base;
  }, [results, resultFilter, debouncedSearch]);

  // Fix 1: counts per status pill — derived from full results (not filtered slice)
  const filterCounts = useMemo(() => ({
    all:        results.length,
    active:     summary?.active     ?? 0,
    dead:       summary?.dead       ?? 0,
    noResponse: summary?.noResponse ?? 0,
    error:      summary?.errors     ?? 0,
  }), [results.length, summary]);

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
  const pageSlice  = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageRange  = getPaginationRange(page, totalPages);

  // ── Shared select style ───────────────────────────────────────────────────
  const selectSt = {
    flex:       1,
    padding:    "8px 10px",
    borderRadius: 10,
    border:     `1.5px solid ${th.border}`,
    background: th.inputBg,
    color:      th.text,
    fontSize:   11,
    fontFamily: "inherit",
    outline:    "none",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.text }}>
            Scheme URL Verifier
          </div>
          <div style={{ fontSize: 11, color: th.textSub, marginTop: 3 }}>
            Ping apply URLs · Detect dead links · Extract deadlines via AI
          </div>
        </div>
        {/* Quick DB stat */}
        {!running && results.length === 0 && (
          <div style={{
            textAlign:  "right",
            fontSize:   10,
            color:      th.textSub,
            lineHeight: 1.6,
          }}>
            <span style={{ fontWeight: 800, color: NAVY, fontSize: 13 }}>
              {dbStats.verifiable}
            </span>
            {" "}verifiable<br />
            <span style={{ fontSize: 9 }}>of {dbStats.total} total</span>
          </div>
        )}
      </div>

      {/* ══ CHECKPOINT BANNER ════════════════════════════════════════════════ */}
      {checkpointLoaded && checkpoint && !running && results.length === 0 && (
        <div style={{
          background:   dark ? "rgba(255,153,51,0.07)" : "rgba(255,153,51,0.09)",
          border:       `1.5px solid ${SAFFRON}50`,
          borderRadius: 12,
          padding:      "12px 14px",
          display:      "flex",
          gap:          10,
          alignItems:   "center",
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: SAFFRON, flexShrink: 0,
          }} />
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
              {...a11yClickable(() => handleStart(checkpoint.completedIndex))}
              style={{
                padding:      "6px 12px",
                borderRadius: 8,
                fontSize:     11,
                fontWeight:   700,
                background:   SAFFRON,
                color:        "#fff",
                cursor:       "pointer",
              }}
            >
              Resume
            </div>
            <div
              {...a11yClickable(async () => { await clearCheckpoint(); setCheckpoint(null); })}
              style={{
                padding:      "6px 12px",
                borderRadius: 8,
                fontSize:     11,
                fontWeight:   700,
                background:   th.border,
                color:        th.textMid,
                cursor:       "pointer",
              }}
            >
              Dismiss
            </div>
          </div>
        </div>
      )}

      {/* ══ DB COVERAGE CARD — idle only ═════════════════════════════════════ */}
      {!running && results.length === 0 && (
        <DBCoverageCard stats={dbStats} dark={dark} />
      )}

      {/* ══ SAVED SCANS — idle only ══════════════════════════════════════════ */}
      {!running && results.length === 0 && (
        <SavedScansSection
          dark={dark}
          savedScans={savedScans}
          onScanCleared={() => setSavedScans(loadAllSavedScans())}
        />
      )}

      {/* ══ CONFIG PANEL — hidden once run has results ════════════════════════ */}
      {!running && results.length === 0 && (
        <div style={{
          background:    th.card,
          border:        `1.5px solid ${th.border}`,
          borderRadius:  16,
          padding:       "16px",
          display:       "flex",
          flexDirection: "column",
          gap:           10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
            Verification Settings
          </div>

          {/* ── Scope: pill button group (cleaner than native select for 3 options) ── */}
          <div>
            <div style={{ fontSize: 10, color: th.textSub, marginBottom: 5, fontWeight: 600 }}>
              Scope
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["all",      "All"],
                ["national", "National"],
                ["state",    "By State"],
              ].map(([val, label]) => {
                const active = scopeMode === val;
                return (
                  <div
                    key={val}
                    {...a11yClickable(() => { setScopeMode(val); setSelectedState(""); }, {
                      pressed: active,
                      label: `Scope: ${label}`,
                    })}
                    style={{
                      flex:       1,
                      padding:    "7px 6px",
                      borderRadius: 9,
                      textAlign:  "center",
                      fontSize:   11,
                      fontWeight: 700,
                      cursor:     "pointer",
                      border:     `1.5px solid ${active ? NAVY : th.border}`,
                      background: active
                        ? (dark ? "rgba(0,53,128,0.22)" : "rgba(0,53,128,0.08)")
                        : "transparent",
                      color:      active ? NAVY : th.textMid,
                      transition: "all 0.14s",
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* State picker — only when scope = state */}
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

          {/* Priority filter (kept as select — has 4 options) */}
          <div>
            <div style={{ fontSize: 10, color: th.textSub, marginBottom: 5, fontWeight: 600 }}>
              Priority
            </div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{ ...selectSt, flex: "none", width: "100%" }}
            >
              <option value="all">All Priority</option>
              <option value="hasDate">Has Deadline</option>
              <option value="neverVerified">Never Verified</option>
              <option value="stale">Stale (30d+)</option>
            </select>
          </div>

          {/* Tier toggle */}
          <div>
            <div style={{ fontSize: 10, color: th.textSub, marginBottom: 5, fontWeight: 600 }}>
              Check Mode
            </div>
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
                    {...a11yClickable(() => setTier(val), {
                      pressed: active,
                      label: `Check mode: ${label} — ${sub}`,
                    })}
                    style={{
                      flex:       1,
                      padding:    "8px 10px",
                      borderRadius: 10,
                      cursor:     "pointer",
                      border:     `1.5px solid ${active ? NAVY : th.border}`,
                      background: active
                        ? (dark ? "rgba(0,53,128,0.2)" : "rgba(0,53,128,0.07)")
                        : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      fontSize:   11,
                      fontWeight: 700,
                      color:      active ? NAVY : th.text,
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
          </div>

          {/* Preview count pill */}
          <div style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            padding:        "9px 13px",
            background:     th.card2,
            borderRadius:   9,
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
              padding:      "8px 12px",
              borderRadius: 8,
              background:   dark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.08)",
              border:       `1px solid ${AMBER}30`,
              fontSize:     10,
              color:        th.textMid,
              lineHeight:   1.5,
            }}>
              Tier 2 calls <strong style={{ color: th.text }}>/api/verify-scheme</strong> for
              each priority scheme — uses Groq credits. Tier 1 is free and much faster.
            </div>
          )}

          {/* Start button */}
          <div
            {...a11yClickable(() => handleStart(0), { disabled: !canStart })}
            style={{
              padding:      "13px",
              borderRadius: 12,
              textAlign:    "center",
              background:   canStart
                ? `linear-gradient(135deg, ${NAVY} 0%, #004db3 100%)`
                : th.border,
              color:      canStart ? "#fff" : th.textSub,
              fontWeight: 800,
              fontSize:   13,
              cursor:     canStart ? "pointer" : "default",
              opacity:    canStart ? 1 : 0.5,
              transition: "all 0.2s",
              boxShadow:  canStart ? "0 4px 18px rgba(0,53,128,0.3)" : "none",
              userSelect: "none",
            }}
          >
            Start Verification
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Live scanner card */}
          <LiveSchemeCard
            schemeName={currentScheme}
            index={progress?.index || 0}
            total={progress?.total || previewCount}
            dark={dark}
            scopeFilter={scopeFilter}
            priorityFilter={priorityFilter}
            tier={tier}
            elapsed={elapsed}
            speed={speed}
            eta={eta}
          />

          {/* Pause + Stop buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              {...a11yClickable(handlePause)}
              style={{
                flex:           1,
                padding:        "10px",
                borderRadius:   10,
                textAlign:      "center",
                fontSize:       12,
                fontWeight:     700,
                background:     dark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)",
                border:         `1.5px solid ${AMBER}50`,
                color:          AMBER,
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            6,
              }}
            >
              Pause & Save
            </div>
            <div
              {...a11yClickable(handleStop)}
              style={{
                flex:           1,
                padding:        "10px",
                borderRadius:   10,
                textAlign:      "center",
                fontSize:       12,
                fontWeight:     700,
                background:     isPendingStop
                  ? "rgba(220,38,38,0.18)"
                  : "rgba(220,38,38,0.08)",
                border:         `1.5px solid ${isPendingStop ? RED : `${RED}40`}`,
                color:          RED,
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            6,
                transition:     "all 0.2s",
              }}
            >
              {isPendingStop ? "Confirm? Tap again" : "Stop & Discard"}
            </div>
          </div>

          {/* Live mini stat cards */}
          {liveStats && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <MiniCard label="Active"   value={liveStats.active}     color={IND_GREEN} dark={dark} />
              <MiniCard label="Dead"     value={liveStats.dead}       color={RED}       dark={dark} />
              <MiniCard label="No Resp." value={liveStats.noResponse} color={AMBER}     dark={dark} />
              <MiniCard label="Errors"   value={liveStats.errors}     color={VIOLET}    dark={dark} />
            </div>
          )}
        </div>
      )}

      {/* ══ DONE BANNER ══════════════════════════════════════════════════════ */}
      {runDone && !running && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* ── Main done row ── */}
          <div style={{
            background: wasAborted
              ? (dark ? "rgba(220,38,38,0.07)" : "rgba(220,38,38,0.06)")
              : (dark ? "rgba(19,136,8,0.07)"  : "rgba(19,136,8,0.06)"),
            border:       `1.5px solid ${(wasAborted ? RED : IND_GREEN)}40`,
            borderRadius: 12,
            padding:      "10px 14px",
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            animation:    "sv-done-pop 0.5s cubic-bezier(0.22,1,0.36,1) both",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: wasAborted ? RED : IND_GREEN, flexShrink: 0,
            }} />
            <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: th.text }}>
              {wasAborted ? "Run stopped" : "Run complete"}
              <span style={{ fontWeight: 500, color: th.textMid, marginLeft: 6 }}>
                · {results.length} scheme{results.length !== 1 ? "s" : ""} checked
              </span>
              {endTimeRef.current && startTimeRef.current && (
                <span style={{ fontWeight: 400, color: th.textSub, marginLeft: 6, fontSize: 11 }}>
                  in {fmtDuration(endTimeRef.current - startTimeRef.current)}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {/* Export PDF */}
              <div
                {...a11yClickable(handleExport)}
                style={{
                  padding:      "5px 10px",
                  borderRadius: 8,
                  fontSize:     11,
                  fontWeight:   700,
                  background:   dark ? `${NAVY}18` : `${NAVY}09`,
                  border:       `1px solid ${NAVY}45`,
                  color:        NAVY,
                  cursor:       "pointer",
                  flexShrink:   0,
                }}
              >
                Export PDF
              </div>
              {/* New Run */}
              <div
                {...a11yClickable(handleReset)}
                style={{
                  padding:      "5px 12px",
                  borderRadius: 8,
                  fontSize:     11,
                  fontWeight:   700,
                  background:   th.border,
                  color:        th.textMid,
                  cursor:       "pointer",
                  flexShrink:   0,
                }}
              >
                New Run
              </div>
            </div>
          </div>

          {/* ── Save-to-repo status row ── */}
          {saveStatus && (
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              padding:      "7px 12px",
              borderRadius: 10,
              fontSize:     11,
              fontWeight:   600,
              background:
                saveStatus === "saved" ? (dark ? "rgba(19,136,8,0.08)"  : "rgba(19,136,8,0.06)")  :
                saveStatus === "error" ? (dark ? "rgba(220,38,38,0.08)" : "rgba(220,38,38,0.06)") :
                (dark ? "rgba(0,53,128,0.10)" : "rgba(0,53,128,0.06)"),
              border: `1px solid ${
                saveStatus === "saved" ? `${IND_GREEN}40` :
                saveStatus === "error" ? `${RED}40`       :
                `${NAVY}35`}`,
              color:
                saveStatus === "saved" ? IND_GREEN :
                saveStatus === "error" ? RED        :
                NAVY,
            }}>
              {saveStatus === "saving" && (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: "sv-spin 0.9s linear infinite", flexShrink: 0 }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Saving to repo…
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>✓</span>
                  Saved to repo · Deploying (~1–2 min)
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>⚠</span>
                  Save failed — check Vercel logs or GITHUB_TOKEN env var
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ RUN REPORT — post-run only ═════════════════════════════════════════ */}
      {summary && !running && (
        <RunSummaryCard
          summary={summary}
          scopeFilter={scopeFilter}
          priorityFilter={priorityFilter}
          tier={tier}
          wasAborted={wasAborted}
          dark={dark}
        />
      )}

      {/* ══ RESULTS LIST ═════════════════════════════════════════════════════ */}
      {results.length > 0 && (
        <div style={{
          background:   th.card,
          border:       `1.5px solid ${th.border}`,
          borderRadius: 16,
          overflow:     "hidden",
        }}>
          {/* Header: title + search + filter pills */}
          <div style={{
            padding:      "10px 14px",
            borderBottom: `1px solid ${th.border}`,
            display:      "flex",
            gap:          8,
            flexWrap:     "wrap",
            alignItems:   "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: th.text }}>
              Results
            </span>
            <span style={{ fontSize: 10, color: th.textSub }}>
              ({filteredResults.length}
              {debouncedSearch && ` of ${results.length}`})
            </span>

            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search name, ID, URL…"
              style={{
                flex:         "1 1 110px",
                minWidth:     80,
                maxWidth:     200,
                padding:      "4px 9px",
                borderRadius: 8,
                border:       `1.5px solid ${searchQuery ? NAVY : th.border}`,
                background:   th.inputBg,
                color:        th.text,
                fontSize:     10,
                fontFamily:   "inherit",
                outline:      "none",
              }}
            />

            <div style={{ flex: 1 }} />

            {/* Fix 7: Expand All toggle — only shown for dead/error filters */}
            {(resultFilter === "dead" || resultFilter === "error") && filteredResults.length > 0 && (
              <div
                {...a11yClickable(() => setExpandAll(v => !v), {
                  pressed: expandAll,
                  label:   expandAll ? "Collapse all rows" : "Expand all rows",
                })}
                style={{
                  padding:      "3px 9px",
                  borderRadius: 10,
                  fontSize:     9,
                  fontWeight:   700,
                  color:        expandAll ? NAVY : th.textMid,
                  background:   expandAll ? `${NAVY}15` : "transparent",
                  border:       `1.5px solid ${expandAll ? NAVY : th.border}`,
                  cursor:       "pointer",
                  whiteSpace:   "nowrap",
                  transition:   "all 0.15s",
                }}
              >
                {expandAll ? "Collapse All" : "Expand All"}
              </div>
            )}

            {/* Fix 1 + animated counts: Status filter pills */}
            {[
              ["all",        "All",        filterCounts.all,        th.textMid, th.border],
              ["active",     "Active",     filterCounts.active,     IND_GREEN,  `${IND_GREEN}40`],
              ["dead",       "Dead",       filterCounts.dead,       RED,        `${RED}40`],
              ["noResponse", "No Resp.",   filterCounts.noResponse, AMBER,      `${AMBER}40`],
              ["error",      "Errors",     filterCounts.error,      VIOLET,     `${VIOLET}40`],
            ].map(([key, label, count, color, bg]) => (
              <FilterPill
                key={key}
                label={label}
                count={count}
                color={color}
                bg={bg}
                active={resultFilter === key}
                th={th}
                onClick={() => { setResultFilter(key); setExpandAll(false); setPage(1); }}
              />
            ))}
          </div>

          {/* Rows */}
          <div>
            {pageSlice.length === 0 ? (
              <EmptyState
                message={searchQuery ? `No results for "${searchQuery}"` : "No results in this category"}
                dark={dark}
              />
            ) : (
              pageSlice.map((r, i) => (
                <ResultRow
                  key={`${r.scheme?.id ?? i}-${(page - 1) * PAGE_SIZE + i}`}
                  result={r}
                  dark={dark}
                  expandAll={expandAll}
                />
              ))
            )}
          </div>

          {/* Numbered pagination */}
          {totalPages > 1 && (
            <div style={{
              padding:        "10px 14px",
              borderTop:      `1px solid ${th.border}`,
              display:        "flex",
              justifyContent: "center",
              alignItems:     "center",
              gap:            4,
              flexWrap:       "wrap",
            }}>
              {/* Prev */}
              <div
                {...a11yClickable(() => setPage(p => p - 1), {
                  disabled: page <= 1,
                  label: "Previous page",
                })}
                style={{
                  padding:      "5px 10px",
                  borderRadius: 7,
                  fontSize:     11,
                  fontWeight:   700,
                  background:   th.border,
                  color:        page <= 1 ? th.textSub : th.text,
                  cursor:       page <= 1 ? "default" : "pointer",
                  userSelect:   "none",
                }}
              >
                ←
              </div>

              {/* Numbered page buttons */}
              {pageRange[0] > 1 && (
                <>
                  <div
                    {...a11yClickable(() => setPage(1), { disabled: 1 === page, label: "Page 1" })}
                    style={pageBtn(1 === page, th)}
                  >
                    1
                  </div>
                  {pageRange[0] > 2 && (
                    <span style={{ fontSize: 10, color: th.textSub, padding: "0 2px" }}>…</span>
                  )}
                </>
              )}
              {pageRange.map(p => (
                <div
                  key={p}
                  {...a11yClickable(() => setPage(p), { disabled: p === page, label: `Page ${p}` })}
                  style={pageBtn(p === page, th, NAVY)}
                >
                  {p}
                </div>
              ))}
              {pageRange[pageRange.length - 1] < totalPages && (
                <>
                  {pageRange[pageRange.length - 1] < totalPages - 1 && (
                    <span style={{ fontSize: 10, color: th.textSub, padding: "0 2px" }}>…</span>
                  )}
                  <div
                    {...a11yClickable(() => setPage(totalPages), { disabled: totalPages === page, label: `Page ${totalPages}` })}
                    style={pageBtn(totalPages === page, th)}
                  >
                    {totalPages}
                  </div>
                </>
              )}

              {/* Next */}
              <div
                {...a11yClickable(() => setPage(p => p + 1), {
                  disabled: page >= totalPages,
                  label: "Next page",
                })}
                style={{
                  padding:      "5px 10px",
                  borderRadius: 7,
                  fontSize:     11,
                  fontWeight:   700,
                  background:   th.border,
                  color:        page >= totalPages ? th.textSub : th.text,
                  cursor:       page >= totalPages ? "default" : "pointer",
                  userSelect:   "none",
                }}
              >
                →
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
