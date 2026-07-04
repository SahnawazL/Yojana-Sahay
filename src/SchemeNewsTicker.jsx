// src/SchemeNewsTicker.jsx — Yojana Sahay · Live Scheme News Card
import React, {
  useState, useEffect, useCallback, useRef, memo,
} from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

const SAFFRON    = "#FF9933";
const NAVY       = "#06038D";
const LIVE_RED   = "#ef4444";
const GREEN      = "#138808";
const ADVANCE_MS = 8000;
const BODY_MAX_H = 84; // px — body text scrolls internally past this height

// Mirrors THEME in App.jsx so this card never drifts from the app's palette
const THEME = {
  light: {
    card: "#fff", card2: "#f8f9fa",
    text: "#1a1a1a", textSub: "#888",
    border: "#f0f0f0", border2: "#e8e8e8",
  },
  dark: {
    card: "#1c1c1e", card2: "#252527",
    text: "#f0f0f0", textSub: "#888",
    border: "#2c2c2e", border2: "#3a3a3c",
  },
};

const CSS = `
  @keyframes ys-live-pulse {
    0%,100%{ opacity:1; transform:scale(1); }
    50%    { opacity:0.3; transform:scale(0.72); }
  }
  @keyframes ys-progress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes ys-new-glow {
    0%,100%{ opacity:1; }
    50%    { opacity:0.6; }
  }
  @keyframes ys-speak-ring {
    0%  { transform:scale(1);   opacity:0.9; }
    100%{ transform:scale(1.8); opacity:0;   }
  }
  .ys-body-scroll::-webkit-scrollbar { width: 3px; }
  .ys-body-scroll::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.35); border-radius: 99px; }
  .ys-body-scroll::-webkit-scrollbar-track { background: transparent; }
`;

const haptic = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };

function isFresh(item) {
  const ms = item.createdAt?.toMillis?.()
    ?? (item.pubDate ? new Date(item.pubDate).getTime() : null);
  return ms ? (Date.now() - ms) < 48 * 3600000 : false;
}

// ── Inline icons (replace emoji — crisper, theme-colored, matches stat-icon style) ──
const IconSpeaker = ({ size = 14, color, active }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 9 7 9 12 4 12 20 7 15 3 15 3 9" fill={color} stroke="none" />
    {active ? (
      <>
        <path d="M16 8a5 5 0 0 1 0 8" />
        <path d="M19 5a9 9 0 0 1 0 14" />
      </>
    ) : (
      <path d="M16.5 11.5 L21 16.5 M21 11.5 L16.5 16.5" />
    )}
  </svg>
);

const IconArrowRight = ({ size = 10, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="8 7 17 7 17 16" />
  </svg>
);

// ── Voice picker — prefers natural Google / Apple voices over the robotic
//    system default. getVoices() is async on first call so we cache via the
//    voiceschanged event and fall back gracefully if none match. ─────────────
const VOICE_PRIORITY = {
  hi: [
    "Google हिन्दी",        // Android — natural Hindi
    "Microsoft Hemant",      // Windows Hindi
  ],
  en: [
    "Google UK English Female",  // Android — most natural
    "Google UK English Male",
    "Google US English",
    "Rishi",                     // iOS Indian-English (iOS 16+)
    "Samantha",                  // iOS English fallback
    "Microsoft Zira",            // Windows
    "Microsoft David",
  ],
};

function pickVoice(voices, lang) {
  const priority = lang === "hi" ? VOICE_PRIORITY.hi : VOICE_PRIORITY.en;
  for (const name of priority) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  // Fallback: first voice whose lang code matches
  const code = lang === "hi" ? "hi" : "en";
  return voices.find((x) => x.lang?.startsWith(code)) ?? null;
}

function SchemeNewsTicker({ lang = "en", dark = false }) {

  const [items,       setItems]       = useState([]);
  const [idx,         setIdx]         = useState(0);
  const [displayIdx,  setDisplayIdx]  = useState(0);  // lags idx — swaps only once faded out, for a true crossfade
  const [textVisible, setTextVisible] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [loaded,      setLoaded]      = useState(false);

  const wrapRef   = useRef(null);
  const idxRef    = useRef(0);
  const itemsRef  = useRef([]);
  const timerRef  = useRef(null);
  const advanceRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const uttRef       = useRef(null);
  const voicesRef    = useRef([]);

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

  useEffect(() => {
    // Warm up the TTS engine on mount so the first real speak() fires
    // instantly. Without this the browser cold-starts the engine on the
    // first tap, causing a noticeable 1-2 s delay.
    const w = window.speechSynthesis;
    if (w) { const u = new SpeechSynthesisUtterance(""); w.speak(u); w.cancel(); }
    return () => w?.cancel();
  }, []);

  // Cache voices as soon as the browser loads them (async on first render)
  useEffect(() => {
    const load = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() ?? [];
    };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => {
    setIdx(0);
    setDisplayIdx(0);
    setTextVisible(true);
    setProgressKey(k => k + 1);
  }, [items.length]);

  // ── Crossfade — fade the old headline out, swap content while invisible,
  //    then fade the new one in. Swapping mid-fade (instead of on a remount)
  //    is what makes this a smooth dissolve instead of a flicker/pop. ───────
  useEffect(() => {
    if (idx === displayIdx) return;
    setTextVisible(false);
    clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setDisplayIdx(idx);
      setProgressKey(k => k + 1);
      setTextVisible(true);
    }, 160);
    return () => clearTimeout(fadeTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // ── Navigate ───────────────────────────────────────────────────────────────
  const goTo = useCallback((next) => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIdx(next);
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

  // ── Native touch (non-passive) — fully isolates this card from the app's
  //    tab-swipe gesture. Previously only touchmove was guarded, so a swipe
  //    that ended (touchend) still leaked through and switched tabs. Now every
  //    phase of a touch that starts on this card is stopped from bubbling, so
  //    neither a horizontal swipe (navigate news) nor a vertical drag (scroll
  //    the body text / page) can ever be reinterpreted by the app as a tab
  //    change. Native scrolling itself is untouched since we only stop
  //    React-level propagation, never preventDefault on vertical moves. ──────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let sx = 0, sy = 0, isH = false;

    const onStart = (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      isH = false;
      e.stopPropagation();
    };
    const onMove = (e) => {
      const dx = Math.abs(e.touches[0].clientX - sx);
      const dy = Math.abs(e.touches[0].clientY - sy);
      if (dx > dy + 3) { isH = true; e.preventDefault(); }
      e.stopPropagation();
    };
    const onEnd = (e) => {
      if (isH) {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = Math.abs(e.changedTouches[0].clientY - sy);
        if (Math.abs(dx) > 40 && Math.abs(dx) > dy) advanceRef.current(dx < 0 ? 1 : -1);
      }
      e.stopPropagation();
    };

    el.addEventListener("touchstart", onStart, { passive: true  });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true  });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, [
    // Re-run whenever the card actually mounts. Before items load, this
    // component returns null (no DOM), so wrapRef.current is null on the
    // very first render. With an empty dep array this effect fired once
    // against that null ref and never again — so once the real card
    // appeared after Firestore loaded, no listeners were ever attached to
    // it, and every touch fell straight through to the app's tab-swipe
    // handler untouched. Depending on items.length re-attaches once the
    // real DOM node exists.
    items.length,
  ]);

  // ── Read Aloud ─────────────────────────────────────────────────────────────
  const handleSpeak = useCallback((speakText) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      haptic(10);
      return;
    }
    uttRef.current = new SpeechSynthesisUtterance(speakText);
    uttRef.current.lang  = lang === "hi" ? "hi-IN" : "en-IN";
    uttRef.current.rate  = 0.88;
    const voice = pickVoice(voicesRef.current, lang);
    if (voice) uttRef.current.voice = voice;

    // iOS pause workaround — speechSynthesis silently stalls after a few
    // seconds on Safari; pulsing pause/resume every 10 s keeps it alive.
    let iosTimer;
    uttRef.current.onstart = () => {
      iosTimer = setInterval(() => {
        if (!window.speechSynthesis.speaking) { clearInterval(iosTimer); return; }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
    };
    uttRef.current.onend   = () => { clearInterval(iosTimer); setIsSpeaking(false); };
    uttRef.current.onerror = () => { clearInterval(iosTimer); setIsSpeaking(false); };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(uttRef.current);
    setIsSpeaking(true);
    haptic(10);
  }, [isSpeaking, lang]);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!loaded || !items.length) return null;
  const item = items[displayIdx % items.length];
  if (!item) return null;

  const text     = (lang === "hi" && item.text_hi) ? item.text_hi : item.text_en;
  const descText = (lang === "hi" && item.desc_hi) ? item.desc_hi : item.desc_en;
  const hasUrl   = Boolean(item.url);
  const fresh    = isFresh(item);
  const fontFace = lang === "hi"
    ? "'Noto Sans Devanagari','Noto Sans',sans-serif"
    : "'Noto Sans',sans-serif";

  // Theme — pulled directly from the app's own THEME tokens, so this card
  // never drifts a shade off from every other card on the screen.
  const th       = dark ? THEME.dark : THEME.light;
  const cardBg   = th.card;
  const borderC  = th.border;
  const headBg   = th.card2;
  const divC     = th.border2;
  const textMain = th.text;
  const textSub  = th.textSub;
  const speakClr = isSpeaking ? SAFFRON : (dark ? "#555" : "#c8c8c8");
  const shadow   = dark
    ? "0 4px 24px rgba(0,0,0,0.25)"
    : "0 4px 24px rgba(0,53,128,0.10)";

  return (
    <div
      ref={wrapRef}
      style={{ width: "auto", margin: "0 14px 14px", touchAction: "pan-y" }}
    >
      <style>{CSS}</style>

      {/* ── Card ── */}
      <div
        style={{
          background:   cardBg,
          border:       `1.5px solid ${borderC}`,
          borderRadius: 16,
          overflow:     "hidden",
          boxShadow:    shadow,
          position:     "relative",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "9px 13px",
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
            {items.length > 1 && (
              <span style={{
                fontSize:9, color:textSub,
                fontFamily:"'Noto Sans',sans-serif",
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                padding:"2px 6px", borderRadius:99,
              }}>{displayIdx + 1}/{items.length}</span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"13px 14px 12px" }}>
          {/* Only this inner block remounts on rotation — keeps the entrance
              animation on the headline/description without flickering the
              card's border, shadow, header, or the Speak/Read buttons below. */}
          <div style={{
            opacity:   textVisible ? 1 : 0,
            transform: textVisible ? "translateY(0)" : "translateY(3px)",
            transition: "opacity 0.16s ease, transform 0.16s ease",
          }}>
            {/* Scope badge — Central (navy) or state name (green) */}
            {item.scope ? (
              <div style={{ marginBottom:7 }}>
                <span style={{
                  display:"inline-block",
                  fontSize:9, fontWeight:700, letterSpacing:0.7,
                  textTransform:"uppercase",
                  background: item.scope === "Central" ? NAVY : GREEN,
                  color:"#fff",
                  padding:"2px 9px", borderRadius:99,
                  fontFamily:"'Noto Sans',sans-serif",
                }}>
                  {item.scope === "Central" ? "Central" : `State · ${item.scope}`}
                </span>
              </div>
            ) : null}
            {/* line-clamp on each <p> independently — headline always visible
                (3 lines max), description always visible below it (2 lines max).
                No shared scroll container means no "desc hidden below maxHeight"
                bug when the headline itself is long. */}
            <p style={{
              margin:0, fontSize:14, fontWeight:600,
              lineHeight:1.45, color:textMain, fontFamily:fontFace,
              display:"-webkit-box",
              WebkitLineClamp:3,
              WebkitBoxOrient:"vertical",
              overflow:"hidden",
            }}>
              {text}
            </p>
            {descText && (
              <p style={{
                margin:"6px 0 0", fontSize:12, fontWeight:400,
                lineHeight:1.5, color:textSub, fontFamily:fontFace,
                display:"-webkit-box",
                WebkitLineClamp:2,
                WebkitBoxOrient:"vertical",
                overflow:"hidden",
              }}>
                {descText}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            marginTop:11, paddingTop:10,
            borderTop:`1px solid ${divC}`,
          }}>

            {/* Left — source badge */}
            <div style={{ display:"flex", alignItems:"center", gap:3 }}>
              {item.autoFetched ? (
                <>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                    stroke={textSub} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  <span style={{
                    fontSize:8.5, color:textSub,
                    fontFamily:"'Noto Sans',sans-serif", letterSpacing:0.2,
                  }}>Google News · 3d</span>
                </>
              ) : (
                <>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                    stroke={GREEN} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <span style={{
                    fontSize:8.5, color:GREEN,
                    fontFamily:"'Noto Sans',sans-serif", letterSpacing:0.2,
                  }}>Admin verified</span>
                </>
              )}
            </div>

            {/* Right — speaker + read buttons */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Speak */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(text); }}
                style={{
                  background:"transparent", border:"none", padding:0,
                  cursor:"pointer", width:28, height:28,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative", outline:"none",
                  WebkitTapHighlightColor:"transparent",
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
                <IconSpeaker size={15} color={speakClr} active={isSpeaking} />
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
                    display:"flex", alignItems:"center", gap:4,
                    boxShadow:`0 2px 8px ${SAFFRON}44`,
                    WebkitTapHighlightColor:"transparent",
                  }}
                >
                  Read <IconArrowRight size={9} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Progress bar (auto-advance countdown) ──
             Uses transform:scaleX (compositor-only) instead of animating
             width, so there's no reflow and no sub-pixel edge poking past
             the card's rounded corners at 100%. A small side inset + pill
             radius keeps it looking like a neat floating track rather than
             a bar flush with the card edge. */}
        <div style={{
          margin: "0 8px 8px", height:3, borderRadius:99, overflow:"hidden",
          background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
        }}>
          <div
            key={progressKey}
            style={{
              height:"100%", width:"100%", borderRadius:99,
              background: SAFFRON,
              transformOrigin: "left",
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
                width:      i === displayIdx ? 18 : 5,
                height:     5,
                borderRadius: 99,
                background: i === displayIdx
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
