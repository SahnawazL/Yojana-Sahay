// src/SchemeNewsTicker.jsx — Yojana Sahay · Live Scheme News Card
import React, {
  useState, useEffect, useCallback, useRef, memo,
} from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

const SAFFRON    = "#FF9933";
const LIVE_RED   = "#ef4444";
const GREEN      = "#138808";
const ADVANCE_MS = 8000;

const CSS = `
  @keyframes ys-live-pulse {
    0%,100%{ opacity:1; transform:scale(1); }
    50%    { opacity:0.3; transform:scale(0.72); }
  }
  @keyframes ys-card-in {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0);   }
  }
  @keyframes ys-progress {
    from { width:0%; }
    to   { width:100%; }
  }
  @keyframes ys-new-glow {
    0%,100%{ opacity:1; }
    50%    { opacity:0.6; }
  }
  @keyframes ys-speak-ring {
    0%  { transform:scale(1);   opacity:0.9; }
    100%{ transform:scale(1.8); opacity:0;   }
  }
`;

const haptic = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };

function relativeTime(item) {
  const ms = item.createdAt?.toMillis?.()
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

function isFresh(item) {
  const ms = item.createdAt?.toMillis?.()
    ?? (item.pubDate ? new Date(item.pubDate).getTime() : null);
  return ms ? (Date.now() - ms) < 48 * 3600000 : false;
}

function SchemeNewsTicker({ lang = "en", dark = false }) {

  const [items,       setItems]       = useState([]);
  const [idx,         setIdx]         = useState(0);
  const [animKey,     setAnimKey]     = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [loaded,      setLoaded]      = useState(false);

  const wrapRef   = useRef(null);
  const idxRef    = useRef(0);
  const itemsRef  = useRef([]);
  const timerRef  = useRef(null);
  const advanceRef = useRef(null);

  useEffect(() => { idxRef.current  = idx;   }, [idx]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ── Firestore ──────────────────────────────────────────────────────────────
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
    }, () => setLoaded(true));
    return () => unsub();
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  useEffect(() => {
    setIdx(0);
    setAnimKey(k => k + 1);
    setProgressKey(k => k + 1);
  }, [items.length]);

  // ── Navigate ───────────────────────────────────────────────────────────────
  const goTo = useCallback((next) => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIdx(next);
    setAnimKey(k => k + 1);
    setProgressKey(k => k + 1);
  }, []);

  advanceRef.current = (dir) => {
    const len = itemsRef.current.length;
    if (!len) return;
    goTo((idxRef.current + dir + len) % len);
    haptic(6);
  };

  // ── Auto-advance ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!items.length) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => advanceRef.current(1), ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [idx, items.length]);

  // ── Native touch (non-passive) — blocks tab-switch on horizontal swipe ─────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let sx = 0, sy = 0, isH = false;

    const onStart = (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      isH = false;
    };
    const onMove = (e) => {
      const dx = Math.abs(e.touches[0].clientX - sx);
      const dy = Math.abs(e.touches[0].clientY - sy);
      if (dx > dy + 3) { isH = true; e.preventDefault(); e.stopPropagation(); }
    };
    const onEnd = (e) => {
      if (!isH) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = Math.abs(e.changedTouches[0].clientY - sy);
      if (Math.abs(dx) > 40 && Math.abs(dx) > dy) advanceRef.current(dx < 0 ? 1 : -1);
    };

    el.addEventListener("touchstart", onStart, { passive: true  });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true  });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, []);

  // ── Read Aloud ─────────────────────────────────────────────────────────────
  const handleSpeak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      haptic(10);
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = lang === "hi" ? "hi-IN" : "en-IN";
    utt.rate  = 0.88;
    utt.onend = utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
    haptic(10);
  }, [isSpeaking, lang]);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!loaded || !items.length) return null;
  const item = items[idx % items.length];
  if (!item) return null;

  const text     = (lang === "hi" && item.text_hi) ? item.text_hi : item.text_en;
  const hasUrl   = Boolean(item.url);
  const timeAgo  = relativeTime(item);
  const fresh    = isFresh(item);
  const fontFace = lang === "hi"
    ? "'Noto Sans Devanagari','Noto Sans',sans-serif"
    : "'Noto Sans',sans-serif";

  // Theme — clean, no colour overload
  const cardBg   = dark ? "#1a1a1a"                 : "#ffffff";
  const borderC  = dark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.09)";
  const headBg   = dark ? "rgba(255,255,255,0.03)"  : "#fafafa";
  const divC     = dark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.06)";
  const textMain = dark ? "#e8e8e8"                  : "#111111";
  const textSub  = dark ? "#666666"                  : "#999999";
  const speakClr = isSpeaking ? SAFFRON : (dark ? "#444" : "#c8c8c8");
  const shadow   = dark
    ? "0 4px 20px rgba(0,0,0,0.5)"
    : "0 2px 12px rgba(0,0,0,0.08)";

  return (
    <div ref={wrapRef} style={{ width:"100%", touchAction:"pan-y" }}>
      <style>{CSS}</style>

      {/* ── Card ── */}
      <div
        key={animKey}
        style={{
          background:   cardBg,
          border:       `1px solid ${borderC}`,
          borderRadius: 14,
          overflow:     "hidden",
          boxShadow:    shadow,
          animation:    "ys-card-in 0.3s cubic-bezier(.22,.68,0,1.15) both",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "8px 13px",
          background:     headBg,
          borderBottom:   `1px solid ${divC}`,
        }}>
          {/* LIVE indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background: LIVE_RED, flexShrink:0,
              animation: "ys-live-pulse 1.5s ease-in-out infinite",
            }}/>
            <span style={{
              fontSize:9, fontWeight:800, letterSpacing:1.3,
              color: LIVE_RED, textTransform:"uppercase",
              fontFamily:"'Noto Sans',sans-serif",
            }}>LIVE</span>
            <span style={{
              width:1, height:10, display:"inline-block",
              background: divC, margin:"0 1px",
            }}/>
            <span style={{
              fontSize:9.5, fontWeight:600, letterSpacing:0.3,
              color: textSub, textTransform:"uppercase",
              fontFamily:"'Noto Sans',sans-serif",
            }}>Scheme Update</span>
          </div>

          {/* Right — NEW + time + counter */}
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            {fresh && (
              <span style={{
                fontSize:8, fontWeight:800, letterSpacing:0.7,
                background: GREEN, color:"#fff",
                padding:"2px 7px", borderRadius:99,
                textTransform:"uppercase",
                fontFamily:"'Noto Sans',sans-serif",
                animation:"ys-new-glow 2s ease-in-out infinite",
              }}>NEW</span>
            )}
            {timeAgo && (
              <span style={{
                fontSize:10, color:textSub,
                fontFamily:"'Noto Sans',sans-serif",
              }}>{timeAgo}</span>
            )}
            {items.length > 1 && (
              <span style={{
                fontSize:9, color:textSub,
                fontFamily:"'Noto Sans',sans-serif",
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                padding:"2px 6px", borderRadius:99,
              }}>{idx + 1}/{items.length}</span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"13px 14px 12px" }}>
          <p style={{
            margin:0, fontSize:14, fontWeight:600,
            lineHeight:1.55, color:textMain, fontFamily:fontFace,
          }}>
            {text}
          </p>

          {/* Footer */}
          <div style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            marginTop:11, paddingTop:10,
            borderTop:`1px solid ${divC}`,
          }}>
            <span style={{
              fontSize:10, color:textSub,
              fontFamily:"'Noto Sans',sans-serif",
              display:"flex", alignItems:"center", gap:4,
            }}>
              📡 {item.source || "Google News"}
            </span>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Speak */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(text); }}
                style={{
                  background:"transparent", border:"none", padding:0,
                  cursor:"pointer", color:speakClr, fontSize:15,
                  width:30, height:30,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative", outline:"none", transition:"color 0.2s",
                }}
                aria-label={isSpeaking ? "Stop" : "Read aloud"}
              >
                {isSpeaking && (
                  <span style={{
                    position:"absolute", width:22, height:22,
                    borderRadius:"50%", border:`1.5px solid ${SAFFRON}`,
                    animation:"ys-speak-ring 1.1s ease-out infinite",
                    pointerEvents:"none",
                  }}/>
                )}
                {isSpeaking ? "🔊" : "🔈"}
              </button>

              {/* Read more */}
              {hasUrl && (
                <button
                  onClick={() => {
                    haptic(15);
                    window.open(item.url, "_blank", "noopener,noreferrer");
                  }}
                  style={{
                    background: SAFFRON,
                    border: "none", color:"#fff",
                    fontSize:10, fontWeight:700,
                    padding:"5px 12px", borderRadius:99,
                    cursor:"pointer", outline:"none",
                    fontFamily:"'Noto Sans',sans-serif",
                    letterSpacing:0.4,
                    display:"flex", alignItems:"center", gap:3,
                    boxShadow:`0 2px 8px ${SAFFRON}44`,
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
        <div style={{ height:2, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }}>
          <div
            key={progressKey}
            style={{
              height:"100%",
              background: SAFFRON,
              animation:`ys-progress ${ADVANCE_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>

      {/* ── Dots ── */}
      {items.length > 1 && (
        <div style={{
          display:"flex", justifyContent:"center",
          alignItems:"center", gap:5, paddingTop:8,
        }}>
          {items.map((_, i) => (
            <div
              key={i}
              onClick={() => { goTo(i); haptic(6); }}
              style={{
                width:      i === idx ? 18 : 5,
                height:     5,
                borderRadius: 99,
                background: i === idx
                  ? SAFFRON
                  : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"),
                transition: "width 0.3s ease, background 0.3s ease",
                cursor:"pointer", flexShrink:0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(SchemeNewsTicker);
