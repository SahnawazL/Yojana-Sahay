// src/SchemeNewsTicker.jsx — Yojana Sahay · Live Scheme News Card
// ─────────────────────────────────────────────────────────────────────────────
// Professional card-style news display. Auto-advances every 8s.
// Swipe left/right to navigate manually. Tap "Read ↗" to open article.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useCallback, useRef, memo,
} from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

const SAFFRON  = "#FF9933";
const LIVE_RED = "#ef4444";
const GREEN    = "#138808";
const ADVANCE_MS = 8000;

const CSS = `
  @keyframes ys-live-pulse {
    0%,100%{ opacity:1; transform:scale(1); }
    50%    { opacity:0.3; transform:scale(0.72); }
  }
  @keyframes ys-card-in {
    from { opacity:0; transform:translateY(7px); }
    to   { opacity:1; transform:translateY(0);   }
  }
  @keyframes ys-progress {
    from { width:0%; }
    to   { width:100%; }
  }
  @keyframes ys-new-glow {
    0%,100%{ opacity:1; }
    50%    { opacity:0.65; }
  }
  @keyframes ys-speak-ring {
    0%  { transform:scale(1);   opacity:0.9; }
    100%{ transform:scale(1.8); opacity:0;   }
  }
`;

const haptic = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };

// ── Relative time from Firestore Timestamp or pubDate string ─────────────────
function relativeTime(item) {
  let ms = item.createdAt?.toMillis?.()
    ?? (item.pubDate ? new Date(item.pubDate).getTime() : null);
  if (!ms || isNaN(ms)) return null;
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m  <  2) return "Just now";
  if (m  < 60) return `${m}m ago`;
  if (h  < 24) return `${h}h ago`;
  if (d  <  7) return `${d}d ago`;
  return null;
}

// ── Is the item fresh (< 48 h)? ──────────────────────────────────────────────
function isFresh(item) {
  const ms = item.createdAt?.toMillis?.()
    ?? (item.pubDate ? new Date(item.pubDate).getTime() : null);
  return ms ? (Date.now() - ms) < 48 * 3600000 : false;
}

// ─────────────────────────────────────────────────────────────────────────────
function SchemeNewsTicker({ lang = "en", dark = false }) {

  const [items,       setItems]       = useState([]);
  const [idx,         setIdx]         = useState(0);
  const [animKey,     setAnimKey]     = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [loaded,      setLoaded]      = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const timerRef    = useRef(null);

  // ── Firestore real-time listener ─────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "schemeNews"), where("active", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const od = (b.order || 0) - (a.order || 0);
          if (od !== 0) return od;
          return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
        });
      setItems(docs);
      setLoaded(true);
    }, (err) => {
      console.warn("[SchemeNewsTicker]", err.message);
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  // ── Cleanup speech on unmount ─────────────────────────────────────────────────
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // ── Reset when list length changes ───────────────────────────────────────────
  useEffect(() => {
    setIdx(0);
    setAnimKey(k => k + 1);
    setProgressKey(k => k + 1);
  }, [items.length]);

  // ── Navigate to item ─────────────────────────────────────────────────────────
  const goTo = useCallback((next) => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIdx(next);
    setAnimKey(k => k + 1);
    setProgressKey(k => k + 1);
  }, []);

  const advance = useCallback((dir = 1) => {
    if (!items.length) return;
    goTo((idx + dir + items.length) % items.length);
    haptic(6);
  }, [idx, items.length, goTo]);

  // ── Auto-advance timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!items.length) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => advance(1), ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [idx, items.length, advance]);

  // ── Read Aloud ────────────────────────────────────────────────────────────────
  const handleSpeak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      haptic(10);
      return;
    }
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = lang === "hi" ? "hi-IN" : "en-IN";
    utt.rate   = 0.88;
    utt.onend  = utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
    haptic(10);
  }, [isSpeaking, lang]);

  // ── Swipe gesture ─────────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy) e.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) advance(dx < 0 ? 1 : -1);
  }, [advance]);

  // ── Guard ─────────────────────────────────────────────────────────────────────
  if (!loaded || !items.length) return null;
  const item = items[idx % items.length];
  if (!item) return null;

  const text      = (lang === "hi" && item.text_hi) ? item.text_hi : item.text_en;
  const hasUrl    = Boolean(item.url);
  const timeAgo   = relativeTime(item);
  const fresh     = isFresh(item);
  const fontFace  = lang === "hi"
    ? "'Noto Sans Devanagari','Noto Sans',sans-serif"
    : "'Noto Sans',sans-serif";

  // ── Theme ─────────────────────────────────────────────────────────────────────
  const cardBg    = dark ? "rgba(255,255,255,0.035)" : "#ffffff";
  const borderC   = dark ? "rgba(255,153,51,0.18)"   : "rgba(255,153,51,0.25)";
  const headBg    = dark ? "rgba(255,153,51,0.07)"   : "rgba(255,153,51,0.05)";
  const textMain  = dark ? "#eeeeee"                  : "#111111";
  const textSub   = dark ? "#888888"                  : "#888888";
  const speakClr  = isSpeaking ? SAFFRON : (dark ? "#555" : "#c0c0c0");
  const shadowVal = dark
    ? "0 4px 20px rgba(0,0,0,0.35)"
    : "0 2px 14px rgba(0,0,0,0.08)";

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ width:"100%", touchAction:"pan-y", userSelect:"none", WebkitUserSelect:"none" }}
    >
      <style>{CSS}</style>

      {/* ── News Card ── */}
      <div
        key={animKey}
        style={{
          background:   cardBg,
          border:       `1px solid ${borderC}`,
          borderLeft:   `4px solid ${SAFFRON}`,
          borderRadius: 16,
          overflow:     "hidden",
          animation:    "ys-card-in 0.32s cubic-bezier(.22,.68,0,1.2) both",
          boxShadow:    shadowVal,
        }}
      >

        {/* ── Header ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "7px 13px",
          background:     headBg,
          borderBottom:   `1px solid ${borderC}`,
        }}>
          {/* Left — LIVE + label */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              width:8, height:8, borderRadius:"50%",
              background:LIVE_RED, flexShrink:0,
              animation:"ys-live-pulse 1.5s ease-in-out infinite",
            }}/>
            <span style={{
              fontSize:9, fontWeight:800, letterSpacing:1.2,
              color:LIVE_RED, textTransform:"uppercase",
              fontFamily:"'Noto Sans',sans-serif",
            }}>LIVE</span>
            <span style={{
              fontSize:9, fontWeight:700, letterSpacing:0.6,
              color:SAFFRON, textTransform:"uppercase",
              fontFamily:"'Noto Sans',sans-serif",
            }}>Scheme News</span>
          </div>

          {/* Right — NEW badge + time */}
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {fresh && (
              <span style={{
                fontSize:8, fontWeight:800, letterSpacing:0.8,
                background:GREEN, color:"#fff",
                padding:"2px 7px", borderRadius:99,
                textTransform:"uppercase",
                animation:"ys-new-glow 2s ease-in-out infinite",
                fontFamily:"'Noto Sans',sans-serif",
              }}>NEW</span>
            )}
            {timeAgo && (
              <span style={{
                fontSize:10, color:textSub,
                fontFamily:"'Noto Sans',sans-serif",
              }}>{timeAgo}</span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"12px 14px 10px" }}>

          {/* News text */}
          <p style={{
            margin:0,
            fontSize:13.5,
            fontWeight:600,
            lineHeight:1.55,
            color:textMain,
            fontFamily:fontFace,
          }}>
            {text}
          </p>

          {/* Source + actions row */}
          <div style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            marginTop:10,
          }}>
            {/* Source */}
            <span style={{
              fontSize:10, color:textSub,
              fontFamily:"'Noto Sans',sans-serif",
              display:"flex", alignItems:"center", gap:4,
            }}>
              📡 {item.source || "Google News"}
            </span>

            {/* Actions */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>

              {/* Read aloud button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(text); }}
                style={{
                  background:"transparent", border:"none",
                  padding:0, cursor:"pointer",
                  color:speakClr, fontSize:15,
                  width:30, height:30,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative", outline:"none",
                  transition:"color 0.2s",
                }}
                aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
              >
                {isSpeaking && (
                  <span style={{
                    position:"absolute",
                    width:24, height:24,
                    borderRadius:"50%",
                    border:`1.5px solid ${SAFFRON}`,
                    animation:"ys-speak-ring 1.1s ease-out infinite",
                    pointerEvents:"none",
                  }}/>
                )}
                {isSpeaking ? "🔊" : "🔈"}
              </button>

              {/* Read more button */}
              {hasUrl && (
                <button
                  onClick={() => {
                    haptic(15);
                    window.open(item.url, "_blank", "noopener,noreferrer");
                  }}
                  style={{
                    background:  "transparent",
                    border:      `1.5px solid ${SAFFRON}`,
                    color:       SAFFRON,
                    fontSize:    10,
                    fontWeight:  700,
                    padding:     "4px 11px",
                    borderRadius:99,
                    cursor:      "pointer",
                    outline:     "none",
                    fontFamily:  "'Noto Sans',sans-serif",
                    letterSpacing:0.4,
                    display:     "flex",
                    alignItems:  "center",
                    gap:         3,
                    transition:  "background 0.2s, color 0.2s",
                    WebkitTapHighlightColor:"transparent",
                  }}
                >
                  Read ↗
                </button>
              )}

            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{
          height:3,
          background: dark ? "rgba(255,153,51,0.08)" : "rgba(255,153,51,0.08)",
        }}>
          <div
            key={progressKey}
            style={{
              height:"100%",
              background:`linear-gradient(to right, ${SAFFRON}, #ffb347)`,
              animation:`ys-progress ${ADVANCE_MS}ms linear forwards`,
            }}
          />
        </div>

      </div>

      {/* ── Navigation dots + count ── */}
      {items.length > 1 && (
        <div style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          gap:4,
          paddingTop:7,
        }}>
          {items.map((_, i) => (
            <div
              key={i}
              onClick={() => { goTo(i); haptic(6); }}
              style={{
                width:      i === idx ? 18 : 5,
                height:     5,
                borderRadius:99,
                background: i === idx
                  ? SAFFRON
                  : (dark ? "rgba(255,153,51,0.2)" : "rgba(255,153,51,0.25)"),
                transition: "width 0.3s ease, background 0.3s ease",
                cursor:     "pointer",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Swipe hint ── */}
      <p style={{
        textAlign:"center",
        fontSize:9,
        color:textSub,
        margin:"4px 0 0",
        fontFamily:"'Noto Sans',sans-serif",
        letterSpacing:0.4,
        opacity:0.7,
      }}>
        swipe or tap dots to navigate
      </p>

    </div>
  );
}

export default memo(SchemeNewsTicker);
