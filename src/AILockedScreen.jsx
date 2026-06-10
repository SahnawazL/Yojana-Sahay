/**
 * Yojana Sahay — AILockedScreen.jsx  (v2 · Premium Compact)
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Shown in the AI Help tab when the user is NOT signed in.
 * Shows a smart eligibility snapshot if the checker has been completed,
 * otherwise invites the user to run the eligibility check first.
 * Provides a "Sign In with Google" CTA that navigates to the Profile tab.
 */

import { useState, useEffect } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    appBg: "#f4f4f7", card: "#fff",
    text: "#0d0d12", textMid: "#444", textSub: "#888",
    border: "#ebebf0", border2: "#e0e0e8",
    glass: "rgba(255,255,255,0.70)", glassBorder: "rgba(0,0,0,0.07)",
  },
  dark: {
    appBg: "#09090f", card: "#0f0e1a",
    text: "#eeeef4", textMid: "#999", textSub: "#4a4a5a",
    border: "#1a1a28", border2: "#22223a",
    glass: "rgba(255,255,255,0.03)", glassBorder: "rgba(255,255,255,0.08)",
  },
};

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

// ─── ELIGIBILITY DATA ─────────────────────────────────────────────────────────
const STORAGE_KEY     = "yojana_eligibility_answers";
const BRIEF_CACHE_KEY = "yojana_brief_cache";

function readEligibilityData() {
  try {
    const rawSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const rawBrief = JSON.parse(localStorage.getItem(BRIEF_CACHE_KEY) || "null");
    if (!rawSaved) return { status: "none" };
    const answers = (rawSaved.answers && typeof rawSaved.step === "number")
      ? rawSaved.answers : rawSaved;
    const coreComplete = !!(answers.state && answers.who && answers.income && answers.age && answers.area);
    if (!coreComplete) return { status: "none" };
    return { status: "ready", answers, brief: rawBrief?.brief || null };
  } catch {
    return { status: "none" };
  }
}

// ─── LABEL MAPS ───────────────────────────────────────────────────────────────
const WHO_LABELS = {
  en: { farmer:"Farmer", student:"Student", women:"Woman", senior:"Senior", business:"Business", general:"Citizen" },
  hi: { farmer:"किसान", student:"छात्र", women:"महिला", senior:"वरिष्ठ", business:"व्यापारी", general:"नागरिक" },
};
const AGE_LABELS = {
  en: { below18:"<18 yrs", "18to35":"18–35", "35to60":"35–60", above60:"60+" },
  hi: { below18:"<18", "18to35":"18–35", "35to60":"35–60", above60:"60+" },
};
const INCOME_LABELS = {
  en: { below1:"<₹1L", "1to3":"₹1–3L", "3to6":"₹3–6L", above6:"₹6L+" },
  hi: { below1:"<₹1L", "1to3":"₹1–3L", "3to6":"₹3–6L", above6:"₹6L+" },
};
const AREA_LABELS = {
  en: { rural:"Rural", urban:"Urban", semi:"Semi-urban" },
  hi: { rural:"ग्रामीण", urban:"शहरी", semi:"अर्ध-शहरी" },
};

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = {
  en: [
    { icon:"⚡", label:"Personalised answers based on your exact profile" },
    { icon:"🔍", label:"Live web search for latest scheme updates & deadlines" },
    { icon:"🌐", label:"Chat in Hindi or English — replies in your language" },
    { icon:"💬", label:"Smart follow-up chips auto-generated after every reply" },
    { icon:"📚", label:"3,000+ Central & State scheme database" },
    { icon:"💾", label:"Conversation history saved across sessions" },
  ],
  hi: [
    { icon:"⚡", label:"आपकी प्रोफाइल के अनुसार पर्सनल AI जवाब" },
    { icon:"🔍", label:"नई योजनाओं और डेडलाइन के लिए Live वेब सर्च" },
    { icon:"🌐", label:"हिंदी या English — जिस भाषा में पूछें, उसी में जवाब" },
    { icon:"💬", label:"हर जवाब के बाद Smart Follow-up Chips अपने आप" },
    { icon:"📚", label:"3,000+ केंद्रीय और राज्य योजनाओं का डेटाबेस" },
    { icon:"💾", label:"अकाउंट में चैट हिस्ट्री सेव रहती है" },
  ],
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

function AshokaChakra({ size = 20, color = "#06038D", spinning = false }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  const cx = size / 2, cy = size / 2, r = size / 2 - 1, innerR = r * 0.28;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, animation: spinning ? "chakra-spin 5s linear infinite" : "none" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.055} />
      <circle cx={cx} cy={cy} r={innerR} fill={color} />
      {spokes.map(i => {
        const a = (i * 360 / 24) * Math.PI / 180;
        return <line key={i}
          x1={cx + innerR * Math.cos(a)} y1={cy + innerR * Math.sin(a)}
          x2={cx + r * 0.78 * Math.cos(a)} y2={cy + r * 0.78 * Math.sin(a)}
          stroke={color} strokeWidth={size * 0.042} />;
      })}
    </svg>
  );
}

function LockIcon({ size = 14, color = "#888" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ZapIcon({ size = 12, color = "#A78BFA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} />
    </svg>
  );
}

function ChevronRightIcon({ size = 12, color = "#888" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ScanIcon({ size = 13, color = "#888" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2" />
      <path d="M17 3h2a2 2 0 012 2v2" />
      <path d="M21 17v2a2 2 0 01-2 2h-2" />
      <path d="M7 21H5a2 2 0 01-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

// ─── PROFILE PILL ─────────────────────────────────────────────────────────────
function ProfilePill({ label, color }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 99,
      background: `${color}14`, border: `1px solid ${color}2e`,
      fontSize: 10.5, fontWeight: 700, color,
      whiteSpace: "nowrap", letterSpacing: 0.1, flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

// ─── ELIGIBILITY STATUS ROW (SINGLE LINE) ─────────────────────────────────────
function EligibilityRow({ lang, dark, isHindi, bf, th, eligData, onGoToChecker }) {
  const [pressed, setPressed] = useState(false);

  if (eligData.status === "none") {
    const skyC = dark ? "#38BDF8" : "#0284C7";
    return (
      <div
        onClick={() => { setPressed(false); onGoToChecker?.(); }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 13px", borderRadius: 11,
          background: dark ? `${skyC}0c` : `${skyC}08`,
          border: `1px solid ${skyC}26`,
          cursor: "pointer", userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          transform: pressed ? "scale(0.985)" : "scale(1)",
          transition: "transform 0.1s",
          marginBottom: 12,
        }}>
        <ScanIcon size={13} color={skyC} />
        <span style={{
          flex: 1, fontSize: 12, fontWeight: 600,
          color: th.text, fontFamily: bf,
        }}>
          {isHindi ? "60 सेकंड में पात्रता जांच करें" : "Run 60-second eligibility check"}
        </span>
        <span style={{
          fontSize: 10, color: th.textSub, fontFamily: bf, marginRight: 2,
        }}>
          {isHindi ? "लॉगिन नहीं चाहिए" : "No login needed"}
        </span>
        <ChevronRightIcon size={12} color={skyC} />
      </div>
    );
  }

  // status === "ready" — single-line row of profile pills
  const { answers } = eligData;
  const whoLabel    = WHO_LABELS[lang]?.[answers.who]       || answers.who;
  const ageLabel    = AGE_LABELS[lang]?.[answers.age]       || answers.age;
  const incomeLabel = INCOME_LABELS[lang]?.[answers.income] || answers.income;
  const areaLabel   = AREA_LABELS[lang]?.[answers.area]     || answers.area;

  const pills = [
    answers.state && { label: answers.state, color: dark ? "#60A5FA" : "#2563EB" },
    whoLabel      && { label: whoLabel,      color: dark ? "#A78BFA" : "#7C3AED" },
    incomeLabel   && { label: incomeLabel,   color: dark ? "#34D399" : "#059669" },
    areaLabel     && { label: areaLabel,     color: dark ? "#F0ABFC" : "#9333EA" },
    ageLabel      && { label: ageLabel,      color: dark ? "#38BDF8" : "#0284C7" },
  ].filter(Boolean);

  const purpleC = dark ? "#A78BFA" : "#7C3AED";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "7px 12px", borderRadius: 11,
      background: dark ? `${purpleC}09` : `${purpleC}06`,
      border: `1px solid ${purpleC}1e`,
      flexWrap: "wrap", marginBottom: 12,
    }}>
      {/* AI READY badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "2px 8px", borderRadius: 99,
        background: `${purpleC}18`, border: `1px solid ${purpleC}30`,
        flexShrink: 0,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: dark ? "#34D399" : "#059669",
          boxShadow: `0 0 5px ${dark ? "#34D399" : "#059669"}`,
          animation: "ai-pulse 2.2s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: 9, fontWeight: 800, color: purpleC,
          letterSpacing: 0.7, textTransform: "uppercase",
        }}>
          AI Ready
        </span>
      </div>
      {pills.map((p, i) => <ProfilePill key={i} label={p.label} color={p.color} />)}
    </div>
  );
}

// ─── PREMIUM AI BRIEF CARD ────────────────────────────────────────────────────
function AIBriefCard({ dark, isHindi, bf, th, brief }) {
  const purpleC = dark ? "#A78BFA" : "#7C3AED";
  const blueC   = dark ? "#60A5FA" : "#2563EB";

  const cardBg = dark
    ? "linear-gradient(155deg,#0c0b1c 0%,#0d0b20 55%,#0a0d22 100%)"
    : "linear-gradient(155deg,#fefcff 0%,#faf7ff 55%,#f5f0ff 100%)";

  const fadeBg = dark
    ? "linear-gradient(to top,#0c0b1c 0%,transparent 100%)"
    : "linear-gradient(to top,#fefcff 0%,transparent 100%)";

  return (
    <div style={{
      background: cardBg,
      borderRadius: 16, padding: "14px 14px 0",
      border: `1px solid ${purpleC}1e`,
      boxShadow: dark
        ? `0 4px 28px rgba(124,58,237,0.18), 0 0 0 1px ${purpleC}0d`
        : `0 4px 22px rgba(124,58,237,0.09)`,
      marginBottom: 12, position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow orb */}
      <div style={{
        position: "absolute", top: -24, right: -16,
        width: 90, height: 90, borderRadius: "50%",
        background: `radial-gradient(circle,${purpleC}1c 0%,transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 11,
      }}>
        {/* Avatar */}
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: `linear-gradient(135deg,${purpleC} 0%,${blueC} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ZapIcon size={12} color="#fff" />
        </div>
        {/* Label */}
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: purpleC,
            letterSpacing: 0.3, fontFamily: bf,
          }}>
            Yojana AI
          </span>
          <span style={{
            fontSize: 10, color: th.textSub,
            fontFamily: bf, marginLeft: 5,
          }}>
            {isHindi ? "· पूर्वावलोकन" : "· Preview"}
          </span>
        </div>
        {/* Live dot */}
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#34D399", boxShadow: "0 0 7px #34D399",
          animation: "ai-pulse 2.2s ease-in-out infinite",
          flexShrink: 0,
        }} />
      </div>

      {/* Brief text */}
      <div style={{
        fontSize: 12.5, color: th.text, fontFamily: bf,
        lineHeight: 1.85, paddingBottom: 46, letterSpacing: 0.1,
      }}>
        {brief}
      </div>

      {/* Gradient fade + lock pill */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
        background: fadeBg,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        paddingBottom: 11,
        pointerEvents: "none",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 11px", borderRadius: 99,
          background: dark ? "rgba(12,11,28,0.96)" : "rgba(254,252,255,0.96)",
          border: `1px solid ${purpleC}25`,
          backdropFilter: "blur(10px)",
          pointerEvents: "auto",
        }}>
          <LockIcon size={9} color={purpleC} />
          <span style={{
            fontSize: 9, fontWeight: 700, color: purpleC,
            fontFamily: bf, letterSpacing: 0.5, textTransform: "uppercase",
          }}>
            {isHindi ? "पूरी चैट के लिए साइन इन करें" : "Sign in to unlock full AI chat"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── AI BRIEF SKELETON ────────────────────────────────────────────────────────
function AIBriefSkeleton({ dark, isHindi, bf, th }) {
  const purpleC = dark ? "#A78BFA" : "#7C3AED";
  const blueC   = dark ? "#60A5FA" : "#2563EB";

  return (
    <div style={{
      borderRadius: 14, padding: "12px 14px",
      background: dark ? `${purpleC}09` : `${purpleC}06`,
      border: `1px solid ${purpleC}18`,
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: `linear-gradient(135deg,${purpleC} 0%,${blueC} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ZapIcon size={11} color="#fff" />
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: purpleC,
          fontFamily: bf, letterSpacing: 0.3,
        }}>
          Yojana AI · {isHindi ? "पूर्वावलोकन" : "Preview"}
        </span>
      </div>
      {[92, 100, 82, 58].map((w, i) => (
        <div key={i} style={{
          height: 9, borderRadius: 5, marginBottom: 7,
          width: `${w}%`,
          background: dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.08)",
          animation: `ai-shimmer 1.7s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
      <div style={{
        fontSize: 10.5, color: th.textSub, fontFamily: bf, marginTop: 3,
      }}>
        {isHindi
          ? "साइन इन के बाद AI विश्लेषण उपलब्ध होगा।"
          : "AI analysis available after you sign in."}
      </div>
    </div>
  );
}

// ─── FEATURE ROW (compact) ────────────────────────────────────────────────────
function FeatureRow({ icon, label, dark, th, bf, delay, visible }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 12px", borderRadius: 9,
      background: dark ? "rgba(255,255,255,0.022)" : "rgba(0,0,0,0.018)",
      border: `1px solid ${dark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.038)"}`,
      opacity: visible ? 1 : 0,
      animation: visible ? `ai-fade-in 0.30s ease ${delay}s both` : "none",
    }}>
      <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: 11.5, color: th.textMid, fontFamily: bf,
        fontWeight: 500, lineHeight: 1.35, flex: 1,
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── AI BRIEF TEASER (State A — hint to complete check) ──────────────────────
/**
 * Shown when eligibility check hasn't been done yet.
 * Renders a blurred ghost of the AI brief card so the user can see
 * exactly what they'll unlock — with a hint overlay showing the 3-step flow.
 */
function AIBriefTeaser({ dark, isHindi, bf, th, onGoToChecker }) {
  const [pressed, setPressed] = useState(false);
  const purpleC = dark ? "#A78BFA" : "#7C3AED";
  const blueC   = dark ? "#60A5FA" : "#2563EB";

  // Overlay gradient — fades from transparent (top) to card bg (bottom)
  const overlayBg = dark
    ? "linear-gradient(to bottom,rgba(9,9,15,0.08) 0%,rgba(9,9,15,0.78) 38%,rgba(9,9,15,0.98) 100%)"
    : "linear-gradient(to bottom,rgba(244,244,247,0.08) 0%,rgba(244,244,247,0.78) 38%,rgba(244,244,247,0.98) 100%)";

  const cardBg = dark
    ? "linear-gradient(155deg,#0c0b1c 0%,#0d0b20 55%,#0a0d22 100%)"
    : "linear-gradient(155deg,#fefcff 0%,#faf7ff 55%,#f5f0ff 100%)";

  return (
    <div style={{
      borderRadius: 16,
      border: `1px solid ${purpleC}18`,
      overflow: "hidden",
      marginBottom: 12,
      position: "relative",
      background: cardBg,
    }}>

      {/* ── GHOST CONTENT (blurred behind overlay) ── */}
      <div style={{
        padding: "14px 14px 16px",
        filter: "blur(2.5px)",
        opacity: 0.38,
        userSelect: "none",
        pointerEvents: "none",
      }}>
        {/* Ghost AI header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: `linear-gradient(135deg,${purpleC}80 0%,${blueC}60 100%)`,
          }} />
          <div style={{ width: 72, height: 10, borderRadius: 5, background: `${purpleC}60` }} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
        </div>
        {/* Ghost text lines */}
        {[96, 100, 88, 76, 82, 64].map((w, i) => (
          <div key={i} style={{
            height: 9, borderRadius: 5, marginBottom: 7,
            width: `${w}%`,
            background: dark ? "rgba(255,255,255,0.16)" : "rgba(124,58,237,0.14)",
          }} />
        ))}
        {/* Ghost profile pills row */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[52, 44, 58, 40].map((w, i) => (
            <div key={i} style={{
              height: 20, borderRadius: 99,
              width: w, background: `${purpleC}28`,
            }} />
          ))}
        </div>
      </div>

      {/* ── OVERLAY with hint ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: overlayBg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end",
        padding: "0 16px 16px",
      }}>
        {/* Lock + label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 7,
        }}>
          <LockIcon size={11} color={purpleC} />
          <span style={{
            fontSize: 11.5, fontWeight: 800,
            color: dark ? "rgba(255,255,255,0.80)" : th.text,
            fontFamily: bf, letterSpacing: 0.2,
          }}>
            {isHindi ? "आपकी AI रिपोर्ट यहाँ दिखेगी" : "Your AI report will appear here"}
          </span>
        </div>

        {/* 3-step flow hint */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          marginBottom: 13,
        }}>
          {[
            { label: isHindi ? "जांच करें" : "Check",      active: false },
            null,
            { label: isHindi ? "वापस आएं" : "Come back",   active: false },
            null,
            { label: isHindi ? "AI रिपोर्ट" : "AI Report", active: true  },
          ].map((s, i) =>
            s === null ? (
              <svg key={i} width={14} height={10} viewBox="0 0 14 10" fill="none"
                style={{ flexShrink: 0, margin: "0 1px" }}>
                <path d="M1 5h10M8 2l3 3-3 3" stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)"}
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center",
                padding: "3px 9px", borderRadius: 99,
                background: s.active
                  ? `${purpleC}22`
                  : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                border: `1px solid ${s.active ? purpleC + "35" : (dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)")}`,
              }}>
                <span style={{
                  fontSize: 9.5, fontWeight: 700,
                  color: s.active ? purpleC : th.textSub,
                  letterSpacing: 0.2, whiteSpace: "nowrap",
                  fontFamily: bf,
                }}>
                  {s.label}
                </span>
              </div>
            )
          )}
        </div>

        {/* CTA tappable */}
        <div
          onClick={() => { setPressed(false); onGoToChecker?.(); }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 99,
            background: pressed
              ? `linear-gradient(135deg,${purpleC}d0 0%,${blueC}c0 100%)`
              : `linear-gradient(135deg,${purpleC} 0%,${blueC} 100%)`,
            boxShadow: pressed
              ? `0 2px 8px ${purpleC}40`
              : `0 4px 16px ${purpleC}50`,
            cursor: "pointer", userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            transform: pressed ? "scale(0.96)" : "scale(1)",
            transition: "transform 0.11s, box-shadow 0.11s",
          }}>
          <ScanIcon size={12} color="rgba(255,255,255,0.90)" />
          <span style={{
            fontSize: 12, fontWeight: 800,
            color: "#fff", fontFamily: bf, letterSpacing: 0.2,
          }}>
            {isHindi ? "पात्रता जांच करें" : "Start eligibility check"}
          </span>
          <ChevronRightIcon size={12} color="rgba(255,255,255,0.75)" />
        </div>

        <div style={{
          marginTop: 8, fontSize: 9.5,
          color: dark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.28)",
          fontFamily: bf, letterSpacing: 0.3,
        }}>
          {isHindi ? "60 सेकंड · लॉगिन जरूरी नहीं" : "60 seconds · no login required"}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AILockedScreen({
  lang = "en", dark = false,
  onGoToProfile, onGoToChecker, activeTab,
}) {
  const th       = THEME[dark ? "dark" : "light"];
  const bf       = fontFamily(lang);
  const isHindi  = lang === "hi";
  const features = FEATURES[lang] || FEATURES.en;

  const [eligData, setEligData] = useState(() => readEligibilityData());
  useEffect(() => {
    if (activeTab === "ai") setEligData(readEligibilityData());
  }, [activeTab]);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const [btnPressed, setBtnPressed] = useState(false);

  // Palette
  const purpleC = dark ? "#A78BFA" : "#7C3AED";
  const blueC   = dark ? "#60A5FA" : "#2563EB";

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: th.appBg, overflow: "hidden", fontFamily: bf,
    }}>
      <style>{`
        @keyframes chakra-spin {
          from { transform-box:fill-box; transform-origin:center; transform:rotate(0deg); }
          to   { transform-box:fill-box; transform-origin:center; transform:rotate(360deg); }
        }
        @keyframes ai-pulse {
          0%, 100% { opacity:1; transform:scale(1); }
          50%       { opacity:0.45; transform:scale(0.78); }
        }
        @keyframes ai-shimmer {
          0%, 100% { opacity:0.35; }
          50%       { opacity:0.9; }
        }
        @keyframes ai-fade-in {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ai-btn-shine {
          0%   { transform:translateX(-200%); }
          100% { transform:translateX(400%); }
        }
        @keyframes ai-hdr-breathe {
          0%, 100% { opacity:0.35; }
          50%       { opacity:0.60; }
        }
      `}</style>

      {/* ── SLIM HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg,#0b081e 0%,#0d0a22 50%,#080d22 100%)"
          : "linear-gradient(135deg,#140930 0%,#0f0838 50%,#06038D 100%)",
        padding: "13px 18px",
        flexShrink: 0,
        boxShadow: `0 2px 18px ${dark ? "rgba(124,58,237,0.22)" : "rgba(6,3,141,0.30)"}`,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient pulse behind title */}
        <div style={{
          position: "absolute", top: -18, left: "28%",
          width: 140, height: 64, borderRadius: "50%",
          background: `radial-gradient(ellipse,${purpleC}1c 0%,transparent 70%)`,
          animation: "ai-hdr-breathe 4.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          position: "relative",
        }}>
          {/* AI · Assistant badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 11px 5px 9px", borderRadius: 99,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "rgba(255,255,255,0.38)", flexShrink: 0,
            }} />
            <span style={{
              fontSize: 13, fontWeight: 800,
              color: "rgba(255,255,255,0.90)",
              letterSpacing: 0.2, fontFamily: bf,
            }}>
              {isHindi ? "AI सहायक" : "AI Assistant"}
            </span>
          </div>

          {/* Locked pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 9px", borderRadius: 99,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}>
            <LockIcon size={10} color="rgba(255,255,255,0.45)" />
            <span style={{
              fontSize: 9.5, fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 0.7, textTransform: "uppercase",
            }}>
              {isHindi ? "लॉक" : "Locked"}
            </span>
          </div>

          <div style={{ flex: 1 }} />
          <AshokaChakra size={26} color="rgba(255,255,255,0.20)" spinning />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
        padding: "16px 16px 44px",
      }}>

        {/* ── SIGN-IN CARD (compact dark glass) ── */}
        <div style={{
          background: dark
            ? "linear-gradient(155deg,#0d0b1e 0%,#0c0a1c 55%,#080c20 100%)"
            : "linear-gradient(155deg,#0f0830 0%,#0c0838 55%,#06038D 100%)",
          borderRadius: 18, padding: "17px 16px",
          marginBottom: 12,
          border: `1px solid ${purpleC}22`,
          boxShadow: dark
            ? `0 8px 32px rgba(124,58,237,0.22), 0 0 0 1px ${purpleC}0e`
            : `0 8px 36px rgba(6,3,141,0.30)`,
          position: "relative", overflow: "hidden",
        }}>
          {/* Orbs */}
          <div style={{
            position: "absolute", right: -18, top: -18,
            width: 80, height: 80, borderRadius: "50%",
            background: `radial-gradient(circle,${purpleC}22 0%,transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", left: -10, bottom: -10,
            width: 60, height: 60, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(56,189,248,0.16) 0%,transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Title + sub */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 12, position: "relative",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg,${purpleC}70 0%,${blueC}50 100%)`,
              border: `1px solid ${purpleC}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ZapIcon size={15} color="#fff" />
            </div>
            <div>
              <div style={{
                color: "rgba(255,255,255,0.95)", fontSize: 15.5,
                fontWeight: 900, lineHeight: 1.2, letterSpacing: -0.4,
                fontFamily: bf,
              }}>
                {isHindi ? "AI सुविधा अनलॉक करें" : "Unlock AI Assistant"}
              </div>
              <div style={{
                color: "rgba(255,255,255,0.40)", fontSize: 10.5,
                marginTop: 2, fontFamily: bf,
              }}>
                {isHindi
                  ? "3,000+ सरकारी योजनाएं · पर्सनल जवाब"
                  : "3,000+ govt. schemes · personalised for you"}
              </div>
            </div>
          </div>

          {/* 3 stat pills */}
          <div style={{
            display: "flex", gap: 7, marginBottom: 14, position: "relative",
          }}>
            {[
              { v: "3K+",  l: isHindi ? "योजनाएं"  : "Schemes"   },
              { v: "24/7", l: isHindi ? "उपलब्ध"   : "Available" },
              { v: "Free", l: isHindi ? "मुफ़्त"    : "Forever"   },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center",
                padding: "7px 4px", borderRadius: 9,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 900,
                  color: "rgba(255,255,255,0.88)",
                  letterSpacing: -0.3, fontFamily: bf,
                }}>
                  {s.v}
                </div>
                <div style={{
                  fontSize: 9, color: "rgba(255,255,255,0.35)",
                  letterSpacing: 0.3, marginTop: 1, fontFamily: bf,
                }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div
            onClick={() => { setBtnPressed(false); onGoToProfile?.(); }}
            onPointerDown={() => setBtnPressed(true)}
            onPointerUp={() => setBtnPressed(false)}
            onPointerLeave={() => setBtnPressed(false)}
            style={{
              position: "relative", overflow: "hidden",
              background: btnPressed ? "rgba(245,244,255,0.93)" : "#f5f4ff",
              borderRadius: 12, padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              cursor: "pointer",
              boxShadow: btnPressed
                ? "0 2px 8px rgba(0,0,0,0.18)"
                : `0 4px 18px rgba(124,58,237,0.32), 0 1px 0 rgba(255,255,255,0.12)`,
              transform: btnPressed ? "scale(0.97)" : "scale(1)",
              transition: "transform 0.12s, box-shadow 0.12s",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}>
            {/* Shine */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, width: "50%",
              background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.48) 50%,transparent 100%)",
              animation: "ai-btn-shine 2.6s ease-in-out 1.3s infinite",
              pointerEvents: "none",
            }} />
            <GoogleIcon size={18} />
            <span style={{
              fontSize: 13.5, fontWeight: 800, color: "#1a1a1a",
              letterSpacing: 0.1, position: "relative", fontFamily: bf,
            }}>
              {isHindi ? "Google से जारी रखें" : "Continue with Google"}
            </span>
            <ChevronRightIcon size={13} color="#444" />
          </div>

          <div style={{
            textAlign: "center", marginTop: 9, position: "relative",
            color: "rgba(255,255,255,0.26)", fontSize: 10,
            letterSpacing: 0.4, fontFamily: bf,
          }}>
            {isHindi ? "बिल्कुल मुफ़्त · 10 सेकंड में" : "Completely free · Takes 10 seconds"}
          </div>
        </div>

        {/* ── ELIGIBILITY STATUS (single-line) ── */}
        <EligibilityRow
          lang={lang} dark={dark} isHindi={isHindi} bf={bf} th={th}
          eligData={eligData}
          onGoToChecker={onGoToChecker}
        />

        {/* ── AI BRIEF TEASER (State A — no check done yet) ── */}
        {eligData.status === "none" && (
          <AIBriefTeaser
            dark={dark} isHindi={isHindi} bf={bf} th={th}
            onGoToChecker={onGoToChecker}
          />
        )}

        {/* ── AI BRIEF (premium, only if brief exists) ── */}
        {eligData.status === "ready" && eligData.brief && (
          <AIBriefCard
            dark={dark} isHindi={isHindi} bf={bf} th={th}
            brief={eligData.brief}
          />
        )}

        {/* ── AI BRIEF SKELETON (ready, no brief yet) ── */}
        {eligData.status === "ready" && !eligData.brief && (
          <AIBriefSkeleton dark={dark} isHindi={isHindi} bf={bf} th={th} />
        )}

        {/* ── FEATURES HEADER ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          marginBottom: 8, paddingLeft: 2,
        }}>
          <AshokaChakra size={13} color={dark ? "#A78BFA" : "#7C3AED"} />
          <span style={{
            fontSize: 9.5, fontWeight: 700, color: th.textSub,
            letterSpacing: 0.9, textTransform: "uppercase", fontFamily: bf,
          }}>
            {isHindi ? "AI सुविधाएं जो मिलेंगी" : "What you unlock"}
          </span>
        </div>

        {/* ── FEATURE ROWS (ultra-compact) ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>
          {features.map((f, i) => (
            <FeatureRow
              key={i} icon={f.icon} label={f.label}
              dark={dark} th={th} bf={bf}
              delay={i * 0.05} visible={visible}
            />
          ))}
        </div>

        {/* ── COMING SOON STRIP ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 13px", borderRadius: 11,
          background: dark ? `${purpleC}09` : `${purpleC}06`,
          border: `1px dashed ${purpleC}22`,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            padding: "1px 8px", borderRadius: 99,
            background: `${purpleC}18`, border: `1px solid ${purpleC}28`,
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 9, fontWeight: 800, color: purpleC,
              letterSpacing: 0.6, textTransform: "uppercase",
            }}>
              {isHindi ? "जल्द" : "Soon"}
            </span>
          </div>
          <span style={{
            fontSize: 11.5, color: th.textMid, fontFamily: bf, flex: 1,
          }}>
            {isHindi
              ? "YojanaSahay Pro — जल्द आ रहा है"
              : "YojanaSahay Pro — launching soon"}
          </span>
          <ChevronRightIcon size={11} color={th.textSub} />
        </div>

      </div>
    </div>
  );
}
