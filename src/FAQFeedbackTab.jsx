/**
 * Yojana Sahay — FAQFeedbackTab.jsx
 * Admin panel tab: FAQ helpfulness votes analytics
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Props:
 *   dark  {boolean}  — dark mode flag passed from AdminDashboard
 *
 * Data source: Firestore `faqFeedback` collection
 *   Each doc: { faqId, q, cat, vote ("up"|"down"), lang, uid, updatedAt }
 *
 * Extracted from AdminDashboard.jsx (was inline function FAQFeedbackTab)
 * so the dashboard file stays manageable and this tab can be iterated
 * independently.
 */

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:      "#f5f5f0",
    card:    "#fff",
    card2:   "#f8f9fa",
    text:    "#1a1a1a",
    textMid: "#555",
    textSub: "#888",
    border:  "#e8e8e8",
  },
  dark: {
    bg:      "#111111",
    card:    "#1c1c1e",
    card2:   "#252527",
    text:    "#f0f0f0",
    textMid: "#aaa",
    textSub: "#666",
    border:  "#2c2c2e",
  },
};

// ─── BRAND COLOURS ────────────────────────────────────────────────────────────
const NAVY      = "#003580";
const SAFFRON   = "#FF9933";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";

// Category accent — light vs dark variants.
// Light: rich brand colours. Dark: bright variants that stay readable on
// dark cards (#1c1c1e) — same palette as HomeFAQSection CAT_CONFIG.darkColor.
const CAT_COLOR = {
  about:   NAVY,
  privacy: IND_GREEN,
  schemes: "#C97400",   // darker saffron for light-bg legibility
  ai:      VIOLET,
  account: "#0284C7",
};
const CAT_COLOR_DARK = {
  about:   "#6B90FF",   // bright blue
  privacy: "#4ADE80",   // bright green
  schemes: "#FBBF24",   // bright amber
  ai:      "#A78BFA",   // bright violet
  account: "#38BDF8",   // bright sky-blue
};

// Summary pill value colours — bright enough on dark cards
const PILL_COLOR = {
  responses:  { light: NAVY,      dark: "#6B90FF" },
  helpful:    { light: IND_GREEN, dark: "#4ADE80" },
  notHelpful: { light: "#E53E3E", dark: "#F87171" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
/** Green / amber / red — tuned per mode so they're readable on any background */
function satisfactionColor(pct, dark = false) {
  if (dark) return pct >= 70 ? "#4ADE80" : pct >= 40 ? "#FBBF24" : "#F87171";
  return      pct >= 70 ? IND_GREEN : pct >= 40 ? SAFFRON   : "#E53E3E";
}

/** Pick the correct category accent for the current mode */
function catColor(cat, dark) {
  return dark ? (CAT_COLOR_DARK[cat] || "#6B90FF") : (CAT_COLOR[cat] || NAVY);
}

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

/** Four-pill summary row at the top */
function SummaryRow({ total, totalUp, totalDown, overallPct, dark, th }) {
  const bf = "'DM Sans',sans-serif";
  const pills = [
    {
      label: "Responses",
      value: total,
      color: dark ? PILL_COLOR.responses.dark  : PILL_COLOR.responses.light,
    },
    {
      label: "Helpful 👍",
      value: totalUp,
      color: dark ? PILL_COLOR.helpful.dark    : PILL_COLOR.helpful.light,
    },
    {
      label: "Not helpful 👎",
      value: totalDown,
      color: dark ? PILL_COLOR.notHelpful.dark : PILL_COLOR.notHelpful.light,
    },
    {
      label: "Satisfaction",
      value: `${overallPct}%`,
      color: satisfactionColor(overallPct, dark),
    },
  ];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {pills.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            flex:         1,
            background:   th.card,
            borderRadius: 12,
            textAlign:    "center",
            border:       `1.5px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
            padding:      "10px 6px 9px",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: bf }}>
            {value}
          </div>
          <div style={{ fontSize: 8.5, color: th.textSub, fontFamily: bf, marginTop: 2, lineHeight: 1.3 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bar breakdown per FAQ category */
function CategoryBreakdown({ catStats, dark, th }) {
  const bf = "'DM Sans',sans-serif";
  return (
    <div style={{
      background:   th.card,
      borderRadius: 14,
      padding:      "12px 13px",
      border:       `1.5px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: th.textSub,
        letterSpacing: 0.7, textTransform: "uppercase",
        marginBottom: 10, fontFamily: bf,
      }}>
        By Category
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {Object.entries(catStats).map(([cat, { up, down }]) => {
          const pct = Math.round((up / (up + down)) * 100);
          const cc  = catColor(cat, dark);
          return (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {/* Category label */}
              <div style={{
                width: 58, fontSize: 10, fontWeight: 700,
                color: cc, fontFamily: bf, textTransform: "capitalize",
              }}>
                {cat}
              </div>

              {/* Progress track */}
              <div style={{
                flex: 1, height: 6, borderRadius: 3,
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: cc }} />
              </div>

              {/* Pct */}
              <div style={{
                fontSize: 10, fontWeight: 800, width: 30,
                textAlign: "right", fontFamily: bf,
                color: satisfactionColor(pct, dark),
              }}>
                {pct}%
              </div>

              {/* Raw counts */}
              <div style={{ fontSize: 9, color: th.textSub, fontFamily: bf, whiteSpace: "nowrap" }}>
                👍{up} 👎{down}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Sort button strip */
function SortBar({ sortBy, setSortBy, count, dark, th }) {
  const bf = "'DM Sans',sans-serif";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 13px",
      borderBottom: `1px solid ${th.border}`,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: th.textSub,
        letterSpacing: 0.7, textTransform: "uppercase", fontFamily: bf,
      }}>
        All Questions · {count}
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        {[
          ["worst",   "⬇ Worst"],
          ["best",    "⬆ Best"],
          ["popular", "🔥 Most voted"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSortBy(id)}
            style={{
              fontSize:     9,
              fontWeight:   700,
              fontFamily:   bf,
              padding:      "3px 7px",
              borderRadius: 20,
              cursor:       "pointer",
              margin:       0,
              background:   sortBy === id ? NAVY : "transparent",
              color:        sortBy === id ? "#fff" : th.textSub,
              border:       `1px solid ${
                sortBy === id
                  ? NAVY
                  : dark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.14)"
              }`,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Filter bar — category, language, satisfaction chips */
function FilterBar({
  filterCat,  setFilterCat,
  filterLang, setFilterLang,
  filterSat,  setFilterSat,
  availableCats, availableLangs,
  dark, th,
}) {
  const bf = "'DM Sans',sans-serif";
  const activeCount = [
    filterCat  !== "all",
    filterLang !== "all",
    filterSat  !== "all",
  ].filter(Boolean).length;

  const pillStyle = (active, accentColor) => ({
    fontSize:     9,
    fontWeight:   700,
    fontFamily:   bf,
    padding:      "3px 8px",
    borderRadius: 20,
    cursor:       "pointer",
    border:       active
      ? `1px solid ${accentColor || NAVY}`
      : `1px solid ${dark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.12)"}`,
    background:   active ? (accentColor || NAVY) : "transparent",
    color:        active ? "#fff" : (accentColor && !active ? accentColor : th.textSub),
    transition:   "background 0.15s, color 0.15s, border-color 0.15s",
    WebkitTapHighlightColor: "transparent",
    margin:       0,
  });

  const rowLabel = (text) => (
    <div style={{
      fontSize: 9, fontWeight: 700, color: th.textSub,
      fontFamily: bf, minWidth: 52, flexShrink: 0,
    }}>
      {text}
    </div>
  );

  return (
    <div style={{
      background:    th.card2,
      borderRadius:  14,
      padding:       "11px 13px",
      border:        `1.5px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
      display:       "flex",
      flexDirection: "column",
      gap:           9,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: th.textSub,
          letterSpacing: 0.7, textTransform: "uppercase", fontFamily: bf,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          Filter
          {activeCount > 0 && (
            <span style={{
              background:   NAVY,
              color:        "#fff",
              borderRadius: 10,
              fontSize:     8,
              fontWeight:   800,
              padding:      "1px 5px",
            }}>
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setFilterCat("all");
              setFilterLang("all");
              setFilterSat("all");
            }}
            style={{
              fontSize:   9,
              fontWeight: 700,
              fontFamily: bf,
              color:      dark ? "#F87171" : "#E53E3E",
              background: "transparent",
              border:     "none",
              cursor:     "pointer",
              padding:    "2px 0",
            }}
          >
            Clear all ×
          </button>
        )}
      </div>

      {/* Category row */}
      {availableCats.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          {rowLabel("Category")}
          <button type="button" style={pillStyle(filterCat === "all")} onClick={() => setFilterCat("all")}>
            All
          </button>
          {availableCats.map(cat => {
            const cc = catColor(cat, dark);
            return (
              <button
                key={cat}
                type="button"
                style={pillStyle(filterCat === cat, cc)}
                onClick={() => setFilterCat(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>
      )}

      {/* Language row — only when >1 lang exists in the data */}
      {availableLangs.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          {rowLabel("Language")}
          <button type="button" style={pillStyle(filterLang === "all")} onClick={() => setFilterLang("all")}>
            All
          </button>
          {availableLangs.map(lang => (
            <button
              key={lang}
              type="button"
              style={pillStyle(filterLang === lang)}
              onClick={() => setFilterLang(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Satisfaction tier row */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        {rowLabel("Rating")}
        {[
          ["all",  "All",          null],
          ["high", "✅ High ≥70%", IND_GREEN],
          ["mid",  "🟡 Mid 50–69%", dark ? "#FBBF24" : "#C97400"],
          ["low",  "🔴 Low <50%",  dark ? "#F87171" : "#E53E3E"],
        ].map(([id, label, color]) => (
          <button
            key={id}
            type="button"
            style={pillStyle(filterSat === id, filterSat === id ? (color || NAVY) : null)}
            onClick={() => setFilterSat(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Single question row — tap header to expand voter list */
function QuestionRow({ row, isLast, dark, th, votes, userMap, expanded, onToggle }) {
  const bf    = "'DM Sans',sans-serif";
  const t     = row.up + row.down;
  const pct   = t > 0 ? Math.round((row.up / t) * 100) : 0;
  const cc    = catColor(row.cat, dark);
  const satC  = satisfactionColor(pct, dark);
  const isLow = pct < 50;

  function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
  }

  function initials(name) {
    const parts = (name || "?").trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (name || "?").slice(0, 2).toUpperCase();
  }

  return (
    <div style={{
      background:   isLow
        ? (dark ? "rgba(229,62,62,0.05)" : "rgba(229,62,62,0.03)")
        : "transparent",
      borderBottom: !isLast
        ? `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
        : "none",
    }}>

      {/* ── Clickable header ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onToggle()}
        style={{ padding: "10px 13px", cursor: "pointer" }}
      >
        {/* Top row: cat pill + question + pct + chevron */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
          <div style={{
            fontSize:      8.5,
            fontWeight:    800,
            color:         cc,
            background:    `${cc}20`,
            border:        `1px solid ${cc}38`,
            borderRadius:  5,
            padding:       "1px 5px",
            flexShrink:    0,
            marginTop:     1,
            fontFamily:    bf,
            textTransform: "capitalize",
          }}>
            {row.cat}
          </div>

          <div style={{
            fontSize:   11.5,
            fontWeight: 600,
            color:      th.text,
            fontFamily: bf,
            lineHeight: 1.4,
            flex:       1,
          }}>
            {row.q}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, fontFamily: bf, color: satC }}>
              {pct}%
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={th.textSub} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* Progress bar + raw counts */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: satC }} />
          </div>
          <div style={{ fontSize: 9, color: th.textSub, fontFamily: bf, whiteSpace: "nowrap" }}>
            👍 {row.up} &nbsp;👎 {row.down} &nbsp;· {t} votes
          </div>
        </div>
      </div>

      {/* ── Expanded voter list ── */}
      {expanded && (
        <div style={{
          borderTop:     `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
          background:    dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
          padding:       "8px 13px 10px",
          display:       "flex",
          flexDirection: "column",
          gap:           0,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: th.textSub,
            letterSpacing: 0.6, textTransform: "uppercase",
            fontFamily: bf, marginBottom: 7,
          }}>
            Individual votes · {(votes || []).length}
          </div>

          {(votes || []).map((v, i) => {
            const name       = userMap[v.uid] || (v.uid ? v.uid.slice(0, 8) + "…" : "Anonymous");
            const ini        = initials(name);
            const isUp       = v.vote === "up";
            const voteColor  = isUp
              ? (dark ? "#4ADE80" : IND_GREEN)
              : (dark ? "#F87171" : "#E53E3E");

            return (
              <div key={v.id || i} style={{
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                padding:      "5px 0",
                borderBottom: i < votes.length - 1
                  ? `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`
                  : "none",
              }}>
                {/* Initials avatar */}
                <div style={{
                  width:          26,
                  height:         26,
                  borderRadius:   "50%",
                  background:     `${voteColor}1A`,
                  border:         `1.5px solid ${voteColor}50`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  fontSize:       8.5,
                  fontWeight:     800,
                  color:          voteColor,
                  fontFamily:     bf,
                }}>
                  {ini}
                </div>

                {/* Display name */}
                <div style={{
                  flex:         1,
                  fontSize:     10.5,
                  fontWeight:   600,
                  color:        th.text,
                  fontFamily:   bf,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {name}
                </div>

                {/* Vote badge */}
                <div style={{
                  fontSize:     9,
                  fontWeight:   800,
                  fontFamily:   bf,
                  padding:      "2px 6px",
                  borderRadius: 10,
                  background:   `${voteColor}18`,
                  color:        voteColor,
                  flexShrink:   0,
                  whiteSpace:   "nowrap",
                }}>
                  {isUp ? "👍 Helpful" : "👎 Not helpful"}
                </div>

                {/* Lang badge */}
                {v.lang && (
                  <div style={{
                    fontSize:     8.5,
                    fontWeight:   700,
                    fontFamily:   bf,
                    padding:      "1px 5px",
                    borderRadius: 8,
                    background:   dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                    color:        th.textSub,
                    flexShrink:   0,
                  }}>
                    {v.lang.toUpperCase()}
                  </div>
                )}

                {/* Date */}
                <div style={{
                  fontSize:   8.5,
                  color:      th.textSub,
                  fontFamily: bf,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>
                  {formatDate(v.updatedAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PAGINATION ──────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, perPage, total, onPrev, onNext, onPage, dark, th }) {
  const bf = "'DM Sans',sans-serif";

  // Build page number array — show at most 5 slots with ellipsis
  function pageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)       return [1, 2, 3, 4, "…", totalPages];
    if (page >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  const btnBase = {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    minWidth:       28,
    height:         28,
    borderRadius:   8,
    border:         "none",
    fontFamily:     bf,
    fontSize:       11,
    fontWeight:     700,
    cursor:         "pointer",
    padding:        "0 6px",
    transition:     "background 0.15s, color 0.15s",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "9px 13px 10px",
      borderTop:      `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    }}>

      {/* Range label: "1–5 of 25" */}
      <div style={{ fontSize: 10, color: th.textSub, fontFamily: bf, whiteSpace: "nowrap" }}>
        {from}–{to} of {total}
      </div>

      {/* Page number buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {/* Prev chevron */}
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrev}
          style={{
            ...btnBase,
            background: "transparent",
            color:      page === 1
              ? (dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)")
              : th.textMid,
            cursor: page === 1 ? "default" : "pointer",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Numbered pages */}
        {pageNumbers().map((n, i) =>
          n === "…" ? (
            <div key={`ellipsis-${i}`} style={{
              minWidth: 22, textAlign: "center",
              fontSize: 11, color: th.textSub, fontFamily: bf,
            }}>
              …
            </div>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              style={{
                ...btnBase,
                background: n === page
                  ? NAVY
                  : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                color: n === page
                  ? "#fff"
                  : th.textMid,
                border: n === page
                  ? "none"
                  : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              {n}
            </button>
          )
        )}

        {/* Next chevron */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          style={{
            ...btnBase,
            background: "transparent",
            color:      page === totalPages
              ? (dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)")
              : th.textMid,
            cursor: page === totalPages ? "default" : "pointer",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function FAQFeedbackTab({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = "'DM Sans',sans-serif";

  const [votes,      setVotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [userMap,    setUserMap]    = useState({}); // { [uid]: displayName }
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [sortBy,     setSortBy]     = useState("worst"); // "worst" | "best" | "popular"
  const [page,       setPage]       = useState(1);
  const [filterCat,  setFilterCat]  = useState("all");
  const [filterLang, setFilterLang] = useState("all");
  const [filterSat,  setFilterSat]  = useState("all"); // "all" | "high" | "mid" | "low"

  const PER_PAGE = 5;

  // ── Fetch all FAQ feedback votes from Firestore ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "faqFeedback"));
        if (!cancelled) {
          setVotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.warn("FAQFeedbackTab: fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch display names for all unique voters ─────────────────────────────
  useEffect(() => {
    const uids = [...new Set(votes.map(v => v.uid).filter(Boolean))];
    if (uids.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const snaps = await Promise.all(uids.map(uid => getDoc(doc(db, "users", uid))));
        if (cancelled) return;
        const map = {};
        snaps.forEach((snap, i) => {
          const uid = uids[i];
          if (snap.exists()) {
            const d = snap.data();
            map[uid] = d.displayName || d.name || d.email || uid.slice(0, 8) + "…";
          } else {
            map[uid] = uid.slice(0, 8) + "…";
          }
        });
        setUserMap(map);
      } catch (e) {
        console.warn("FAQFeedbackTab: userMap fetch error:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [votes]);
  const availableCats  = useMemo(
    () => [...new Set(votes.map(v => v.cat).filter(Boolean))].sort(),
    [votes],
  );
  const availableLangs = useMemo(
    () => [...new Set(votes.map(v => v.lang).filter(Boolean))].sort(),
    [votes],
  );

  // ── Language filter — applied at vote level so summary stats reflect it ───
  const filteredVotes = useMemo(() => {
    if (filterLang === "all") return votes;
    return votes.filter(v => (v.lang || "en") === filterLang);
  }, [votes, filterLang]);

  // ── Aggregate per-question totals (from lang-filtered votes) ──────────────
  const grouped = useMemo(() => {
    const map = {};
    filteredVotes.forEach(v => {
      if (!map[v.faqId]) {
        map[v.faqId] = { faqId: v.faqId, cat: v.cat || "?", q: v.q || v.faqId, up: 0, down: 0 };
      }
      if (v.vote === "up") map[v.faqId].up++;
      else                 map[v.faqId].down++;
    });
    return Object.values(map);
  }, [filteredVotes]);

  // ── Category + satisfaction filters — applied at question-row level ────────
  const filteredGrouped = useMemo(() => {
    return grouped.filter(row => {
      if (filterCat !== "all" && row.cat !== filterCat) return false;
      if (filterSat !== "all") {
        const pct = (row.up / ((row.up + row.down) || 1)) * 100;
        if (filterSat === "high" && pct <  70)          return false;
        if (filterSat === "mid"  && (pct < 50 || pct >= 70)) return false;
        if (filterSat === "low"  && pct >= 50)          return false;
      }
      return true;
    });
  }, [grouped, filterCat, filterSat]);

  // ── Global totals (from lang-filtered votes) ───────────────────────────────
  const totalUp    = filteredVotes.filter(v => v.vote === "up").length;
  const totalDown  = filteredVotes.filter(v => v.vote === "down").length;
  const total      = totalUp + totalDown;
  const overallPct = total > 0 ? Math.round((totalUp / total) * 100) : 0;

  // ── Per-category totals (from lang-filtered votes) ─────────────────────────
  const catStats = useMemo(() => {
    const map = {};
    filteredVotes.forEach(v => {
      if (!map[v.cat]) map[v.cat] = { up: 0, down: 0 };
      if (v.vote === "up") map[v.cat].up++;
      else                 map[v.cat].down++;
    });
    return map;
  }, [filteredVotes]);

  // ── Individual votes per question (for the expanded voter list) ───────────
  const votesByFaqId = useMemo(() => {
    const map = {};
    filteredVotes.forEach(v => {
      if (!map[v.faqId]) map[v.faqId] = [];
      map[v.faqId].push(v);
    });
    // Sort newest first inside each group
    Object.values(map).forEach(arr => arr.sort((a, b) => {
      const ta = a.updatedAt?.toDate?.() ?? new Date(a.updatedAt ?? 0);
      const tb = b.updatedAt?.toDate?.() ?? new Date(b.updatedAt ?? 0);
      return tb - ta;
    }));
    return map;
  }, [filteredVotes]);

  // ── Sort the filtered question list ───────────────────────────────────────
  const sorted = useMemo(() => {
    const rows = [...filteredGrouped];
    const sat  = r => r.up / ((r.up + r.down) || 1);
    if (sortBy === "worst")   return rows.sort((a, b) => sat(a) - sat(b));
    if (sortBy === "best")    return rows.sort((a, b) => sat(b) - sat(a));
    if (sortBy === "popular") return rows.sort((a, b) => (b.up + b.down) - (a.up + a.down));
    return rows;
  }, [filteredGrouped, sortBy]);

  // Reset to page 1 whenever sort or any filter changes
  useEffect(() => { setPage(1); }, [sortBy, filterCat, filterLang, filterSat]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 60, color: th.textSub, fontSize: 12, fontFamily: bf,
      }}>
        Loading feedback…
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (total === 0 && votes.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 60, gap: 8,
      }}>
        <div style={{ fontSize: 30 }}>💬</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: th.text, fontFamily: bf }}>
          No feedback yet
        </div>
        <div style={{ fontSize: 11, color: th.textSub, fontFamily: bf, textAlign: "center", maxWidth: 260 }}>
          FAQ Yes / No votes will appear here once users start rating answers.
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "14px 14px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Summary pills */}
      <SummaryRow
        total={total}
        totalUp={totalUp}
        totalDown={totalDown}
        overallPct={overallPct}
        dark={dark}
        th={th}
      />

      {/* Category breakdown */}
      {Object.keys(catStats).length > 0 && (
        <CategoryBreakdown catStats={catStats} dark={dark} th={th} />
      )}

      {/* Filter bar */}
      <FilterBar
        filterCat={filterCat}   setFilterCat={setFilterCat}
        filterLang={filterLang} setFilterLang={setFilterLang}
        filterSat={filterSat}   setFilterSat={setFilterSat}
        availableCats={availableCats}
        availableLangs={availableLangs}
        dark={dark}
        th={th}
      />

      {/* Per-question list */}
      <div style={{
        background:   th.card,
        borderRadius: 14,
        overflow:     "hidden",
        border:       `1.5px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
      }}>
        <SortBar sortBy={sortBy} setSortBy={setSortBy} count={sorted.length} dark={dark} th={th} />

        {sorted.length === 0 ? (
          <div style={{
            padding:    "28px 20px",
            textAlign:  "center",
            color:      th.textSub,
            fontSize:   11,
            fontFamily: bf,
          }}>
            No questions match the current filters.
          </div>
        ) : (
          paginated.map((row, i) => (
            <QuestionRow
              key={row.faqId}
              row={row}
              isLast={i === paginated.length - 1}
              dark={dark}
              th={th}
              votes={votesByFaqId[row.faqId] || []}
              userMap={userMap}
              expanded={expandedFaqId === row.faqId}
              onToggle={() => setExpandedFaqId(id => id === row.faqId ? null : row.faqId)}
            />
          ))
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            perPage={PER_PAGE}
            total={sorted.length}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            onPage={setPage}
            dark={dark}
            th={th}
          />
        )}
      </div>

    </div>
  );
}
