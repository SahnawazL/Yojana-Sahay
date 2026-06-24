// src/SchemeNewsTicker.jsx — Yojana Sahay · Live Scheme News Ticker
// ─────────────────────────────────────────────────────────────────────────────
//
// Reads from Firestore `schemeNews` collection (active items only).
// Auto-scrolls items as a horizontal marquee, with Read Aloud + tap-to-open.
// Populated automatically by api/refresh-news.js every Monday, and manually
// via the Admin Dashboard "News" tab.
//
// Props:
//   lang  "en" | "hi"   — matches app-level language toggle
//   dark  boolean        — matches app-level dark mode state
//
// Usage in App.jsx — drop inside the home tab section, between stats and categories:
//   import SchemeNewsTicker from "./SchemeNewsTicker.jsx";
//   ...
//   <SchemeNewsTicker lang={lang} dark={dark} />
//
// Returns null silently if schemeNews collection is empty or not yet loaded
// — zero layout impact until there is real data to show.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useCallback, memo,
} from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

// ── India flag colours (same constants as App.jsx) ────────────────────────────
const SAFFRON  = "#FF9933";
const LIVE_RED = "#ef4444";

// ── CSS injected once ─────────────────────────────────────────────────────────
const TICKER_CSS = `
  @keyframes ys-ticker-scroll {
    0%   { transform: translateX(100vw);  }
    100% { transform: translateX(-110%); }
  }
  @keyframes ys-live-pulse {
    0%, 100% { opacity: 1;    transform: scale(1);    }
    50%       { opacity: 0.3; transform: scale(0.72); }
  }
  @keyframes ys-speak-ring {
    0%   { transform: scale(1);   opacity: 0.9; }
    100% { transform: scale(1.8); opacity: 0;   }
  }
  @keyframes ys-ticker-fadein {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
`;

// ── Minimal haptic (same pattern as App.jsx) ──────────────────────────────────
const haptic = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };

// ── SchemeNewsTicker ──────────────────────────────────────────────────────────
function SchemeNewsTicker({ lang = "en", dark = false }) {

  const [items,      setItems]      = useState([]);
  const [idx,        setIdx]        = useState(0);
  const [animKey,    setAnimKey]    = useState(0);  // forces animation restart per item
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loaded,     setLoaded]     = useState(false);

  // ── Firestore real-time listener ─────────────────────────────────────────────
  // Fetches only active items; sorts client-side (avoids composite index requirement).
  // Manual items (order > 0) surface above auto-fetched items (order = 0).
  useEffect(() => {
    const q = query(
      collection(db, "schemeNews"),
      where("active", "==", true)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const orderDiff = (b.order || 0) - (a.order || 0);
            if (orderDiff !== 0) return orderDiff;
            const aMs = a.createdAt?.toMillis?.() ?? 0;
            const bMs = b.createdAt?.toMillis?.() ?? 0;
            return bMs - aMs;
          });
        setItems(docs);
        setLoaded(true);
      },
      (err) => {
        console.warn("[SchemeNewsTicker] Firestore error:", err.message);
        setLoaded(true); // still mark loaded so we don't block indefinitely
      }
    );

    return () => unsub();
  }, []);

  // ── Stop speech synthesis on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // ── Reset idx to 0 when item list refreshes (new Firestore snapshot) ─────────
  // Prevents idx from pointing past the end of a shorter list.
  useEffect(() => {
    setIdx(0);
    setAnimKey((k) => k + 1);
  }, [items.length]);

  // ── Advance to next item when scrolling animation ends ───────────────────────
  const handleAnimEnd = useCallback(() => {
    if (!items.length) return;
    setIdx((prev) => (prev + 1) % items.length);
    setAnimKey((k) => k + 1);
    // Cancel any ongoing speech when item changes
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [items.length]);

  // ── Read Aloud ────────────────────────────────────────────────────────────────
  const handleSpeak = useCallback((text) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      haptic(10);
      return;
    }

    const utt    = new SpeechSynthesisUtterance(text);
    utt.lang     = lang === "hi" ? "hi-IN" : "en-IN";
    utt.rate     = 0.88;
    utt.pitch    = 1;
    utt.onend    = () => setIsSpeaking(false);
    utt.onerror  = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // clear queue
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
    haptic(10);
  }, [isSpeaking, lang]);

  // ── Open URL on tap ───────────────────────────────────────────────────────────
  const handleTap = useCallback((url) => {
    if (!url) return;
    haptic(15);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // ── Guard: render nothing until loaded + at least 1 item ────────────────────
  if (!loaded || !items.length) return null;

  // ── Current item ──────────────────────────────────────────────────────────────
  const item      = items[idx % items.length];
  if (!item) return null;

  const text      = (lang === "hi" && item.text_hi) ? item.text_hi : item.text_en;
  const hasUrl    = Boolean(item.url);
  const fontFace  = lang === "hi"
    ? "'Noto Sans Devanagari', 'Noto Sans', sans-serif"
    : "'Noto Sans', sans-serif";

  // Duration: ~0.088s per char — short text min 11s, long text capped 24s
  const scrollSec = Math.min(24, Math.max(11, Math.ceil(text.length * 0.088)));
  const animDur   = `${scrollSec}s`;

  // ── Theme colours ─────────────────────────────────────────────────────────────
  const stripBg       = dark ? "rgba(255,153,51,0.07)"   : "rgba(255,153,51,0.05)";
  const stripBorderC  = dark ? "rgba(255,153,51,0.20)"   : "rgba(255,153,51,0.18)";
  const textColor     = dark ? "#f0f0f0"                 : "#1a1a1a";
  const badgeDivider  = dark ? "rgba(255,153,51,0.18)"   : "rgba(255,153,51,0.18)";
  const fadeColor     = dark ? "#111111"                 : "#f5f5f0"; // matches THEME appBg
  const speakColor    = isSpeaking ? SAFFRON : (dark ? "#555" : "#c0c0c0");

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: "100%",
        animation: "ys-ticker-fadein 0.4s ease both",
      }}
    >
      {/* Inject keyframe CSS once */}
      <style>{TICKER_CSS}</style>

      {/* ── Ticker strip ── */}
      <div
        style={{
          display:       "flex",
          alignItems:    "center",
          height:        44,
          background:    stripBg,
          borderTop:     `1px solid ${stripBorderC}`,
          borderBottom:  `1px solid ${stripBorderC}`,
          borderLeft:    `3.5px solid ${SAFFRON}`,
          overflow:      "hidden",
          position:      "relative",
          userSelect:    "none",
          WebkitUserSelect: "none",
        }}
      >

        {/* ── LIVE badge ── */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          5,
            padding:      "0 10px",
            flexShrink:   0,
            borderRight:  `1px solid ${badgeDivider}`,
            height:       "100%",
          }}
        >
          {/* Pulsing red dot */}
          <div
            style={{
              width:        7,
              height:       7,
              borderRadius: "50%",
              background:   LIVE_RED,
              flexShrink:   0,
              animation:    "ys-live-pulse 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize:      9,
              fontWeight:    700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color:         LIVE_RED,
              fontFamily:    "'Noto Sans', sans-serif",
            }}
          >
            LIVE
          </span>
        </div>

        {/* ── Scrolling text area ── */}
        <div
          style={{
            flex:       1,
            overflow:   "hidden",
            position:   "relative",
            height:     "100%",
            cursor:     hasUrl ? "pointer" : "default",
          }}
          onClick={() => handleTap(item.url)}
          role={hasUrl ? "link" : undefined}
          aria-label={hasUrl ? `Open news: ${text}` : undefined}
          tabIndex={hasUrl ? 0 : undefined}
          onKeyDown={hasUrl
            ? (e) => { if (e.key === "Enter" || e.key === " ") handleTap(item.url); }
            : undefined
          }
        >
          {/* Scrolling text — key forces React to remount on item change, restarting animation */}
          <div
            key={animKey}
            onAnimationEnd={handleAnimEnd}
            style={{
              display:     "inline-flex",
              alignItems:  "center",
              height:      "100%",
              whiteSpace:  "nowrap",
              willChange:  "transform",
              animation:   `ys-ticker-scroll ${animDur} linear forwards`,
            }}
          >
            <span
              style={{
                fontSize:   13,
                fontWeight: 500,
                color:      textColor,
                fontFamily: fontFace,
                lineHeight: 1.3,
              }}
            >
              {text}
            </span>

            {/* Small arrow if URL present — signals tappability */}
            {hasUrl && (
              <span
                style={{
                  marginLeft: 7,
                  fontSize:   11,
                  opacity:    0.45,
                  color:      SAFFRON,
                  fontFamily: "sans-serif",
                }}
              >
                ↗
              </span>
            )}

            {/* Spacer so next item doesn't crowd the tail */}
            <span style={{ display: "inline-block", width: 60 }} />
          </div>

          {/* Right-edge gradient fade — prevents text clipping abruptly at speaker button */}
          <div
            style={{
              position:       "absolute",
              right:          0,
              top:            0,
              bottom:         0,
              width:          28,
              background:     `linear-gradient(to right, transparent, ${fadeColor})`,
              pointerEvents:  "none",
            }}
          />
        </div>

        {/* ── Read Aloud button ── */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSpeak(text);
          }}
          style={{
            flexShrink:      0,
            width:           42,
            height:          44,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            background:      "transparent",
            border:          "none",
            borderLeft:      `1px solid ${badgeDivider}`,
            cursor:          "pointer",
            color:           speakColor,
            fontSize:        15,
            position:        "relative",
            padding:         0,
            transition:      "color 0.2s",
            outline:         "none",
          }}
          aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
          title={isSpeaking ? "Stop" : "Read aloud"}
        >
          {/* Ripple ring when speaking */}
          {isSpeaking && (
            <span
              style={{
                position:     "absolute",
                width:        26,
                height:       26,
                borderRadius: "50%",
                border:       `1.5px solid ${SAFFRON}`,
                animation:    "ys-speak-ring 1.1s ease-out infinite",
                pointerEvents:"none",
              }}
            />
          )}
          {isSpeaking ? "🔊" : "🔈"}
        </button>

      </div>

      {/* ── Item position dots ── */}
      {items.length > 1 && (
        <div
          style={{
            display:        "flex",
            justifyContent: "center",
            alignItems:     "center",
            gap:            4,
            paddingTop:     5,
            paddingBottom:  2,
          }}
        >
          {items.map((_, i) => (
            <div
              key={i}
              style={{
                width:        i === idx ? 14 : 5,
                height:       5,
                borderRadius: 99,
                background:   i === idx
                  ? SAFFRON
                  : (dark ? "rgba(255,153,51,0.22)" : "rgba(255,153,51,0.28)"),
                transition:   "width 0.3s ease, background 0.3s ease",
                flexShrink:   0,
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default memo(SchemeNewsTicker);
