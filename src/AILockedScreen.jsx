/**
 * Yojana Sahay — AILockedScreen.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Shown in the AI Help tab when the user is NOT signed in.
 * Shows a smart eligibility snapshot if the checker has been completed,
 * otherwise invites the user to run the eligibility check first.
 * Provides a "Sign In with Google" CTA that navigates to the Profile tab.
 */

import { useState, useEffect } from "react";

// ─── THEME (mirrors App.jsx / AIChat.jsx) ────────────────────────────────────
const THEME = {
  light: {
    appBg: "#f5f5f0", card: "#fff",
    text: "#1a1a1a", textMid: "#555", textSub: "#888",
    border: "#f0f0f0", border2: "#e8e8e8",
    inputBg: "#fff", navBg: "#fff",
  },
  dark: {
    appBg: "#111111", card: "#1c1c1e",
    text: "#f0f0f0", textMid: "#aaa", textSub: "#666",
    border: "#2c2c2e", border2: "#3a3a3c",
    inputBg: "#2c2c2e", navBg: "#1c1c1e",
  },
};

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

// ─── ELIGIBILITY DATA ─────────────────────────────────────────────────────────
const STORAGE_KEY     = "yojana_eligibility_answers";
const BRIEF_CACHE_KEY = "yojana_brief_cache";

/**
 * Reads eligibility answers + cached brief from localStorage.
 * Returns { status: "none" | "ready", answers, brief }
 * "ready" = at least the 5 core fields (state, who, income, age, area) are present.
 */
function readEligibilityData() {
  try {
    const rawSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const rawBrief = JSON.parse(localStorage.getItem(BRIEF_CACHE_KEY) || "null");
    if (!rawSaved) return { status: "none" };

    // Stored as {answers:{…},step:N} or as the raw answers object directly
    const answers = (rawSaved.answers && typeof rawSaved.step === "number")
      ? rawSaved.answers
      : rawSaved;

    const coreComplete = !!(answers.state && answers.who && answers.income && answers.age && answers.area);
    if (!coreComplete) return { status: "none" };

    return {
      status: "ready",
      answers,
      brief: rawBrief?.brief || null,
    };
  } catch {
    return { status: "none" };
  }
}

// ─── PROFILE LABEL MAPS ───────────────────────────────────────────────────────
const WHO_LABELS = {
  en: { farmer:"Farmer", student:"Student", women:"Woman", senior:"Senior Citizen", business:"Business Owner", general:"General Citizen" },
  hi: { farmer:"किसान", student:"छात्र", women:"महिला", senior:"वरिष्ठ नागरिक", business:"व्यापारी", general:"सामान्य नागरिक" },
};
const AGE_LABELS = {
  en: { below18:"Under 18", "18to35":"18–35 yrs", "35to60":"35–60 yrs", above60:"60+ yrs" },
  hi: { below18:"18 से कम", "18to35":"18–35 वर्ष", "35to60":"35–60 वर्ष", above60:"60+ वर्ष" },
};
const INCOME_LABELS = {
  en: { below1:"Below ₹1L/yr", "1to3":"₹1–3L/yr", "3to6":"₹3–6L/yr", above6:"₹6L+/yr" },
  hi: { below1:"₹1 लाख से कम", "1to3":"₹1–3 लाख/वर्ष", "3to6":"₹3–6 लाख/वर्ष", above6:"₹6 लाख+/वर्ष" },
};
const AREA_LABELS = {
  en: { rural:"Rural", urban:"Urban", semi:"Semi-urban" },
  hi: { rural:"ग्रामीण", urban:"शहरी", semi:"अर्ध-शहरी" },
};

// ─── BENEFIT ITEMS ────────────────────────────────────────────────────────────
const BENEFITS = {
  en: [
    { icon:"🤖", color:"#FF7A00", darkColor:"#FFA040", bg:"rgba(255,122,0,0.09)", darkBg:"rgba(255,160,64,0.16)",
      title:"Personalized AI Answers",
      sub:"AI reads your profile — gives scheme recommendations tailored exactly to your age, income, state & occupation." },
    { icon:"🌾", color:"#138808", darkColor:"#34D058", bg:"rgba(19,136,8,0.07)", darkBg:"rgba(52,208,88,0.14)",
      title:"Ask in Hindi or English",
      sub:"Chat naturally in your language. Get replies in Hindi (हिंदी) or English — whichever you prefer." },
    { icon:"🔍", color:"#06038D", darkColor:"#6B90FF", bg:"rgba(6,3,141,0.07)", darkBg:"rgba(107,144,255,0.16)",
      title:"Real-Time Web Search",
      sub:"AI fetches live scheme updates, deadlines & new launches via web search — always up-to-date information." },
    { icon:"💬", color:"#8B5CF6", darkColor:"#A78BFA", bg:"rgba(139,92,246,0.07)", darkBg:"rgba(167,139,250,0.16)",
      title:"Smart Follow-Up Chips",
      sub:"After every reply, get 3 tap-to-ask follow-up questions so you never get stuck mid-conversation." },
    { icon:"📚", color:"#0EA5E9", darkColor:"#38BDF8", bg:"rgba(14,165,233,0.07)", darkBg:"rgba(56,189,248,0.14)",
      title:"3,000+ Scheme Database",
      sub:"Covers all Central & State schemes — PM Kisan, Ayushman Bharat, housing, scholarships & hundreds more." },
    { icon:"💾", color:"#F59E0B", darkColor:"#FCD34D", bg:"rgba(245,158,11,0.08)", darkBg:"rgba(252,211,77,0.14)",
      title:"Chat History Saved",
      sub:"Your conversations are saved per account. Pick up exactly where you left off — even after closing the app." },
  ],
  hi: [
    { icon:"🤖", color:"#FF7A00", darkColor:"#FFA040", bg:"rgba(255,122,0,0.09)", darkBg:"rgba(255,160,64,0.16)",
      title:"पर्सनल AI जवाब",
      sub:"AI आपकी प्रोफाइल पढ़ता है — आपकी उम्र, आय, राज्य और पेशे के अनुसार सटीक योजनाएं बताता है।" },
    { icon:"🌾", color:"#138808", darkColor:"#34D058", bg:"rgba(19,136,8,0.07)", darkBg:"rgba(52,208,88,0.14)",
      title:"हिंदी या English में पूछें",
      sub:"जिस भाषा में चाहें — हिंदी या English में बात करें। जवाब भी उसी भाषा में मिलेगा।" },
    { icon:"🔍", color:"#06038D", darkColor:"#6B90FF", bg:"rgba(6,3,141,0.07)", darkBg:"rgba(107,144,255,0.16)",
      title:"Real-Time वेब सर्च",
      sub:"AI इंटरनेट से नई योजनाएं, डेडलाइन और अपडेट खोजता है — हमेशा ताज़ी जानकारी।" },
    { icon:"💬", color:"#8B5CF6", darkColor:"#A78BFA", bg:"rgba(139,92,246,0.07)", darkBg:"rgba(167,139,250,0.16)",
      title:"Smart Follow-Up Chips",
      sub:"हर जवाब के बाद 3 तैयार सवाल मिलेंगे — बस टैप करें और अगला सवाल पूछें।" },
    { icon:"📚", color:"#0EA5E9", darkColor:"#38BDF8", bg:"rgba(14,165,233,0.07)", darkBg:"rgba(56,189,248,0.14)",
      title:"3,000+ योजनाओं का डेटाबेस",
      sub:"PM किसान, आयुष्मान भारत, आवास, छात्रवृत्ति — सभी केंद्रीय और राज्य योजनाएं।" },
    { icon:"💾", color:"#F59E0B", darkColor:"#FCD34D", bg:"rgba(245,158,11,0.08)", darkBg:"rgba(252,211,77,0.14)",
      title:"चैट हिस्ट्री सेव",
      sub:"आपकी बातचीत अकाउंट में सेव रहती है। ऐप बंद करने के बाद भी वहीं से शुरू करें।" },
  ],
};

// ─── SVG COMPONENTS ───────────────────────────────────────────────────────────

function AshokaChakra({ size = 20, color = "#06038D", spinning = false }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  const cx = size / 2, cy = size / 2, r = size / 2 - 1, innerR = r * 0.28;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink:0, animation:spinning ? "chakra-spin 4s linear infinite" : "none" }}>
      <style>{`@keyframes chakra-spin{from{transform-box:fill-box;transform-origin:center;transform:rotate(0deg)}to{transform-box:fill-box;transform-origin:center;transform:rotate(360deg)}}`}</style>
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

function LockIcon({ size = 28, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// Clipboard-check icon — for unchecked state
function ClipboardCheckIcon({ size = 26, color = "#FF7A00" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// Zap / spark — for AI preview header
function ZapIcon({ size = 14, color = "#8B5CF6" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} />
    </svg>
  );
}

// Chevron right — inline arrow
function ChevronRight({ size = 14, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── PROFILE TAG ─────────────────────────────────────────────────────────────
function ProfileTag({ label, color, dark }) {
  const bg  = `${color}1a`;
  const bdr = `${color}3a`;
  return (
    <div style={{
      display:"inline-flex", alignItems:"center",
      padding:"3px 9px", borderRadius:99,
      background:bg, border:`1px solid ${bdr}`,
      fontSize:11, fontWeight:700, color,
      whiteSpace:"nowrap", letterSpacing:0.2,
      flexShrink:0,
    }}>
      {label}
    </div>
  );
}

// ─── UNCHECKED STATE CARD ─────────────────────────────────────────────────────
function UncheckedCard({ lang, dark, isHindi, bf, th, onGoToChecker }) {
  const [pressed, setPressed] = useState(false);
  const accentColor = dark ? "#FFA040" : "#FF7A00";
  const bgGrad = dark
    ? "linear-gradient(145deg,#1e1a14 0%,#201c16 100%)"
    : "linear-gradient(145deg,#fffbf5 0%,#fff8ef 100%)";

  return (
    <div style={{
      background: bgGrad,
      borderRadius:20, padding:"20px 16px",
      border:`1.5px solid ${accentColor}30`,
      boxShadow: dark
        ? "0 4px 20px rgba(0,0,0,0.28)"
        : "0 4px 20px rgba(255,122,0,0.08)",
      marginBottom:20,
    }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{
          width:44, height:44, borderRadius:13, flexShrink:0,
          background:`${accentColor}18`,
          border:`1.5px solid ${accentColor}38`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <ClipboardCheckIcon size={22} color={accentColor} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:th.text, fontFamily:bf, lineHeight:1.2 }}>
            {isHindi ? "पहले पात्रता जांच करें" : "Complete Eligibility Check First"}
          </div>
          <div style={{ fontSize:11, color:th.textSub, fontFamily:bf, marginTop:2 }}>
            {isHindi ? "AI को आपकी जानकारी चाहिए" : "AI needs your profile to personalise"}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontSize:12.5, color:th.textMid, fontFamily:bf,
        lineHeight:1.65, marginBottom:16,
      }}>
        {isHindi
          ? "60 सेकंड की जांच पूरी करें — AI आपके लिए एक स्मार्ट सारांश तैयार करेगा जिसमें बताएगा कि आप 3,000+ सरकारी योजनाओं में से किन-किन के पात्र हैं।"
          : "Take the 60-second check and AI will generate a smart personal report showing exactly which of 3,000+ government schemes you qualify for — then sign in to chat."}
      </div>

      {/* 3-step mini flow */}
      <div style={{
        display:"flex", alignItems:"center", gap:0,
        marginBottom:18, padding:"10px 12px",
        background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        borderRadius:12,
      }}>
        {[
          { num:"1", label:isHindi ? "जांच करें" : "Check eligibility" },
          { num:"→", label:null },
          { num:"2", label:isHindi ? "AI रिपोर्ट" : "AI report ready" },
          { num:"→", label:null },
          { num:"3", label:isHindi ? "AI से चैट" : "Chat with AI" },
        ].map((s, i) => s.label ? (
          <div key={i} style={{ flex:1, textAlign:"center" }}>
            <div style={{
              width:22, height:22, borderRadius:"50%", margin:"0 auto 4px",
              background:`${accentColor}22`, border:`1.5px solid ${accentColor}50`,
              fontSize:10, fontWeight:800, color:accentColor,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {s.num}
            </div>
            <div style={{ fontSize:9.5, color:th.textSub, fontFamily:bf, lineHeight:1.3, fontWeight:600 }}>
              {s.label}
            </div>
          </div>
        ) : (
          <div key={i} style={{
            fontSize:11, color: dark ? "#555" : "#ccc",
            fontWeight:700, padding:"0 2px", marginBottom:14,
          }}>→</div>
        ))}
      </div>

      {/* CTA Button */}
      <div
        onClick={() => { setPressed(false); onGoToChecker?.(); }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          background: pressed
            ? `linear-gradient(135deg,#e8700a 0%,#d06000 100%)`
            : `linear-gradient(135deg,#FF9933 0%,#FF7A00 50%,#e85d00 100%)`,
          borderRadius:14, padding:"13px 20px",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          cursor:"pointer", userSelect:"none",
          WebkitTapHighlightColor:"transparent",
          boxShadow: pressed ? "0 2px 8px rgba(255,122,0,0.3)" : "0 4px 16px rgba(255,122,0,0.38)",
          transform: pressed ? "scale(0.97)" : "scale(1)",
          transition:"transform 0.12s, box-shadow 0.12s",
        }}>
        <ClipboardCheckIcon size={17} color="#fff" />
        <span style={{ color:"#fff", fontSize:13.5, fontWeight:800, fontFamily:bf }}>
          {isHindi ? "पात्रता जांच शुरू करें" : "Start Eligibility Check"}
        </span>
        <ChevronRight size={13} color="rgba(255,255,255,0.8)" />
      </div>

      {/* Hint */}
      <div style={{
        textAlign:"center", marginTop:9,
        fontSize:10, color:th.textSub, fontFamily:bf, letterSpacing:0.2,
      }}>
        {isHindi ? "लॉगिन जरूरी नहीं · सिर्फ 60 सेकंड" : "No login required · Takes 60 seconds"}
      </div>
    </div>
  );
}

// ─── CHECKED STATE CARD ───────────────────────────────────────────────────────
function CheckedCard({ lang, dark, isHindi, bf, th, answers, brief, onGoToProfile }) {
  const [pressed, setPressed] = useState(false);

  // Build profile tags
  const whoLabel    = WHO_LABELS[lang]?.[answers.who]    || answers.who;
  const ageLabel    = AGE_LABELS[lang]?.[answers.age]    || answers.age;
  const incomeLabel = INCOME_LABELS[lang]?.[answers.income] || answers.income;
  const areaLabel   = AREA_LABELS[lang]?.[answers.area]  || answers.area;

  const tags = [
    answers.state  && { label: answers.state,   color: dark ? "#6B90FF" : "#06038D" },
    whoLabel       && { label: whoLabel,          color: dark ? "#FFA040" : "#FF7A00" },
    incomeLabel    && { label: incomeLabel,        color: dark ? "#34D058" : "#138808" },
    areaLabel      && { label: areaLabel,          color: dark ? "#A78BFA" : "#8B5CF6" },
    ageLabel       && { label: ageLabel,           color: dark ? "#38BDF8" : "#0EA5E9" },
  ].filter(Boolean);

  const purpleAccent = dark ? "#A78BFA" : "#8B5CF6";
  const bgGrad = dark
    ? "linear-gradient(145deg,#15101f 0%,#1a1128 50%,#1e1535 100%)"
    : "linear-gradient(145deg,#faf8ff 0%,#f5f0ff 100%)";

  return (
    <div style={{
      background: bgGrad,
      borderRadius:20, padding:"18px 16px",
      border:`1.5px solid ${purpleAccent}30`,
      boxShadow: dark
        ? "0 4px 24px rgba(139,92,246,0.18)"
        : "0 4px 20px rgba(139,92,246,0.08)",
      marginBottom:20,
    }}>
      {/* Card header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          padding:"4px 10px", borderRadius:99,
          background:`${purpleAccent}20`,
          border:`1px solid ${purpleAccent}40`,
        }}>
          <ZapIcon size={12} color={purpleAccent} />
          <span style={{ fontSize:10, fontWeight:800, color:purpleAccent, letterSpacing:0.5 }}>
            {isHindi ? "AI स्नैपशॉट तैयार है" : "AI SNAPSHOT READY"}
          </span>
        </div>
        {/* Live dot */}
        <div style={{
          width:7, height:7, borderRadius:"50%",
          background: dark ? "#34D058" : "#138808",
          boxShadow: `0 0 6px ${dark ? "#34D058" : "#138808"}`,
          animation:"ai-snap-pulse 2s ease-in-out infinite",
          flexShrink:0,
        }} />
      </div>

      {/* Profile label */}
      <div style={{
        fontSize:10, fontWeight:700, color:th.textSub,
        letterSpacing:0.6, textTransform:"uppercase", fontFamily:bf,
        marginBottom:8,
      }}>
        {isHindi ? "आपकी प्रोफाइल" : "Your Profile"}
      </div>

      {/* Profile tags row */}
      <div style={{
        display:"flex", flexWrap:"wrap", gap:6, marginBottom:16,
      }}>
        {tags.map((t, i) => (
          <ProfileTag key={i} label={t.label} color={t.color} dark={dark} />
        ))}
      </div>

      {/* AI Brief — message bubble */}
      <div style={{
        position:"relative",
        background: dark ? "rgba(139,92,246,0.10)" : "rgba(139,92,246,0.06)",
        border:`1px solid ${purpleAccent}28`,
        borderRadius:16, padding:"14px 14px 0",
        marginBottom:14, overflow:"hidden",
      }}>
        {/* AI indicator dot */}
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
          <div style={{
            width:24, height:24, borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg,${purpleAccent} 0%,#06038D 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <ZapIcon size={11} color="#fff" />
          </div>
          <span style={{ fontSize:10.5, fontWeight:700, color:purpleAccent, fontFamily:bf, letterSpacing:0.3 }}>
            {isHindi ? "Yojana AI · पूर्वावलोकन" : "Yojana AI · Preview"}
          </span>
        </div>

        {/* Brief text / placeholder */}
        {brief ? (
          <div style={{
            fontSize:12.5, color:th.text, fontFamily:bf,
            lineHeight:1.75, paddingBottom:40,
          }}>
            {brief}
          </div>
        ) : (
          <div style={{ paddingBottom:36 }}>
            {/* Skeleton shimmer lines */}
            {[90, 100, 85, 60].map((w, i) => (
              <div key={i} style={{
                height:11, borderRadius:6, marginBottom:8,
                width:`${w}%`,
                background: dark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(139,92,246,0.10)",
                animation:`ai-shimmer 1.6s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
            <div style={{
              fontSize:11, color:th.textSub, fontFamily:bf, marginTop:4,
            }}>
              {isHindi
                ? "AI विश्लेषण साइन इन करने के बाद उपलब्ध होगा।"
                : "AI analysis will be generated after you sign in."}
            </div>
          </div>
        )}

        {/* Gradient fade + lock overlay */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:brief ? 56 : 28,
          background: dark
            ? `linear-gradient(to top, #15101f 0%, transparent 100%)`
            : `linear-gradient(to top, #faf8ff 0%, transparent 100%)`,
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          paddingBottom:10,
        }}>
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"3px 10px", borderRadius:99,
            background: dark ? "rgba(20,16,31,0.92)" : "rgba(250,248,255,0.92)",
            border:`1px solid ${purpleAccent}30`,
          }}>
            <LockIcon size={10} color={purpleAccent} />
            <span style={{ fontSize:9.5, fontWeight:700, color:purpleAccent, fontFamily:bf, letterSpacing:0.4 }}>
              {isHindi ? "पूरी चैट के लिए साइन इन करें" : "Sign in to unlock full AI chat"}
            </span>
          </div>
        </div>
      </div>

      {/* Sign in CTA */}
      <div
        onClick={() => { setPressed(false); onGoToProfile?.(); }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          background: pressed
            ? "rgba(255,255,255,0.88)" : "#fff",
          borderRadius:14, padding:"13px 18px",
          display:"flex", alignItems:"center", justifyContent:"center", gap:9,
          cursor:"pointer", userSelect:"none",
          WebkitTapHighlightColor:"transparent",
          boxShadow: pressed
            ? "0 2px 8px rgba(0,0,0,0.12)"
            : "0 4px 18px rgba(139,92,246,0.22), 0 1px 0 rgba(255,255,255,0.1)",
          transform: pressed ? "scale(0.97)" : "scale(1)",
          transition:"transform 0.12s, box-shadow 0.12s",
          position:"relative", overflow:"hidden",
        }}>
        {/* Shine sweep */}
        <div style={{
          position:"absolute", top:0, bottom:0, width:"50%",
          background:"linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.55) 50%,transparent 100%)",
          animation:"ai-btn-shine 2.8s ease-in-out 1.4s infinite",
          pointerEvents:"none",
        }} />
        <GoogleIcon size={18} />
        <span style={{ fontSize:13.5, fontWeight:800, color:"#1a1a1a", fontFamily:bf, letterSpacing:0.1, position:"relative" }}>
          {isHindi ? "साइन इन करें · AI अनलॉक करें" : "Sign in · Unlock full AI chat"}
        </span>
        <ChevronRight size={13} color="#555" />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AILockedScreen({ lang = "en", dark = false, onGoToProfile, onGoToChecker, activeTab }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  const benefits = BENEFITS[lang] || BENEFITS.en;

  // Re-read localStorage every time the AI tab becomes active.
  // Component stays mounted with visibility:hidden so useState lazy init
  // only fires once — we must re-read on each tab switch.
  const [eligData, setEligData] = useState(() => readEligibilityData());
  useEffect(() => {
    if (activeTab === "ai") setEligData(readEligibilityData());
  }, [activeTab]);

  // Staggered reveal for benefit cards
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Sign-in hero button state
  const [btnPressed, setBtnPressed] = useState(false);

  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      background:th.appBg, overflow:"hidden", fontFamily:bf,
    }}>
      <style>{`
        @keyframes ai-lock-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes ai-lock-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,122,0,0); }
          50%       { box-shadow: 0 0 28px 8px rgba(255,122,0,0.28); }
        }
        @keyframes ai-benefit-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ai-btn-shine {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        @keyframes ai-snap-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes ai-shimmer {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes chakra-spin {
          from { transform-box: fill-box; transform-origin: center; transform: rotate(0deg); }
          to   { transform-box: fill-box; transform-origin: center; transform: rotate(360deg); }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background:"linear-gradient(135deg,rgba(255,153,51,0.82) 0%,rgba(255,128,0,0.78) 35%,rgba(0,53,128,0.85) 100%)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        padding:"18px 20px 22px", flexShrink:0,
        boxShadow:"0 4px 24px rgba(0,53,128,0.22)",
        borderBottom:"1px solid rgba(255,255,255,0.12)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          {/* Lock avatar */}
          <div style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background:"rgba(255,255,255,0.18)",
            border:"1.5px solid rgba(255,255,255,0.35)",
            boxShadow:"0 4px 12px rgba(0,0,0,0.18)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <LockIcon size={22} color="rgba(255,255,255,0.92)" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800, lineHeight:1.2 }}>
              {isHindi ? "AI सहायक" : "AI Assistant"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11, marginTop:3 }}>
              {isHindi ? "लॉक है · साइन इन करें" : "Locked · Sign in to unlock"}
            </div>
          </div>
          <AshokaChakra size={44} color="rgba(255,255,255,0.55)" spinning />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{
        flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch",
        padding:"20px 16px 36px",
      }}>

        {/* ── HERO SIGN-IN CARD ── */}
        <div style={{
          background: dark
            ? "linear-gradient(145deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)"
            : "linear-gradient(145deg,#0c1445 0%,#0f2a5c 45%,#1a3d7c 100%)",
          borderRadius:24, padding:"28px 20px 24px",
          marginBottom:20, position:"relative", overflow:"hidden",
          boxShadow:"0 12px 40px rgba(6,3,141,0.30), 0 2px 8px rgba(0,0,0,0.2)",
          border:"1px solid rgba(255,255,255,0.08)", textAlign:"center",
        }}>
          {/* Decorative orbs */}
          <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,153,51,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", left:-20, bottom:-20, width:100, height:100, borderRadius:"50%", background:"radial-gradient(circle,rgba(19,136,8,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />

          {/* Floating lock icon */}
          <div style={{
            width:72, height:72, borderRadius:22, margin:"0 auto 16px",
            background:"linear-gradient(135deg,rgba(255,122,0,0.30) 0%,rgba(255,80,0,0.20) 100%)",
            border:"1.5px solid rgba(255,122,0,0.45)",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"ai-lock-float 3s ease-in-out infinite, ai-lock-glow 3s ease-in-out infinite",
          }}>
            <LockIcon size={34} color="#FF7A00" />
          </div>

          {/* Title */}
          <div style={{
            color:"#fff", fontSize:20, fontWeight:900, lineHeight:1.25,
            letterSpacing:-0.4, marginBottom:8, fontFamily:bf,
          }}>
            {isHindi ? "AI सुविधा लॉक है" : "AI Feature is Locked"}
          </div>

          {/* Sub */}
          <div style={{
            color:"rgba(255,255,255,0.6)", fontSize:13, lineHeight:1.6,
            maxWidth:280, margin:"0 auto 18px", fontFamily:bf,
          }}>
            {isHindi
              ? "Google से साइन इन करें और पर्सनल AI सहायक पाएं।"
              : "Sign in with Google to unlock your personal AI assistant for 3,000+ government schemes."}
          </div>

          {/* Tri-color strip */}
          <div style={{
            display:"flex", margin:"0 auto 20px", width:56, height:2.5,
            borderRadius:99, overflow:"hidden",
          }}>
            <div style={{ flex:1, background:"#FF9933" }} />
            <div style={{ flex:1, background:"rgba(255,255,255,0.65)" }} />
            <div style={{ flex:1, background:"#138808" }} />
          </div>

          {/* CTA Button */}
          <div
            onClick={() => { setBtnPressed(false); onGoToProfile?.(); }}
            onPointerDown={() => setBtnPressed(true)}
            onPointerUp={() => setBtnPressed(false)}
            onPointerLeave={() => setBtnPressed(false)}
            style={{
              position:"relative", overflow:"hidden",
              background: btnPressed ? "rgba(255,255,255,0.88)" : "#fff",
              borderRadius:16, padding:"14px 20px",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              cursor:"pointer",
              boxShadow: btnPressed
                ? "0 2px 8px rgba(0,0,0,0.15)"
                : "0 4px 18px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.12)",
              transform: btnPressed ? "scale(0.97)" : "scale(1)",
              transition:"transform 0.12s, box-shadow 0.12s",
              WebkitTapHighlightColor:"transparent",
              userSelect:"none",
            }}>
            <div style={{
              position:"absolute", top:0, bottom:0, width:"50%",
              background:"linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.55) 50%,transparent 100%)",
              animation:"ai-btn-shine 2.6s ease-in-out 1.2s infinite",
              pointerEvents:"none",
            }} />
            <GoogleIcon size={20} />
            <span style={{
              fontSize:14, fontWeight:800, color:"#1a1a1a",
              fontFamily:bf, letterSpacing:0.1, position:"relative",
            }}>
              {isHindi ? "Google से साइन इन करें" : "Continue with Google"}
            </span>
            <ChevronRight size={14} color="#555" />
          </div>

          {/* Free hint */}
          <div style={{
            marginTop:10, color:"rgba(255,255,255,0.35)", fontSize:10,
            fontFamily:bf, letterSpacing:0.3,
          }}>
            {isHindi ? "बिल्कुल मुफ़्त · 10 सेकंड में" : "Completely free · Takes 10 seconds"}
          </div>
        </div>

        {/* ── SMART ELIGIBILITY PANEL (THE KEY NEW SECTION) ── */}
        {/* Section label */}
        <div style={{
          display:"flex", alignItems:"center", gap:7,
          marginBottom:12, paddingLeft:2,
        }}>
          <div style={{ width:3, height:14, borderRadius:2, background: dark ? "#FFA040" : "#FF7A00", flexShrink:0 }} />
          <span style={{
            fontSize:11, fontWeight:700,
            color: dark ? "#FFA040" : "#FF7A00",
            letterSpacing:0.7, textTransform:"uppercase", fontFamily:bf,
          }}>
            {isHindi ? "AI के लिए आपकी तैयारी" : "Your AI readiness"}
          </span>
        </div>

        {eligData.status === "none" ? (
          <UncheckedCard
            lang={lang} dark={dark} isHindi={isHindi} bf={bf} th={th}
            onGoToChecker={onGoToChecker}
          />
        ) : (
          <CheckedCard
            lang={lang} dark={dark} isHindi={isHindi} bf={bf} th={th}
            answers={eligData.answers}
            brief={eligData.brief}
            onGoToProfile={onGoToProfile}
          />
        )}

        {/* ── BENEFITS SECTION HEADER ── */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          marginBottom:12, paddingLeft:2,
        }}>
          <AshokaChakra size={16} color={dark ? "#FF9933" : "#FF7A00"} />
          <span style={{
            fontSize:11, fontWeight:700, color:th.textSub,
            letterSpacing:0.7, textTransform:"uppercase", fontFamily:bf,
          }}>
            {isHindi ? "AI सुविधाएं जो मिलेंगी" : "What you unlock"}
          </span>
        </div>

        {/* ── BENEFIT CARDS ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {benefits.map((b, i) => {
            const fc  = dark ? b.darkColor : b.color;
            const fbg = dark ? b.darkBg    : b.bg;
            return (
              <div key={i} style={{
                background:th.card, borderRadius:16, padding:"13px 14px",
                display:"flex", alignItems:"flex-start", gap:12,
                border:`1.5px solid ${fc}28`,
                boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.22)" : "0 2px 12px rgba(0,0,0,0.05)",
                opacity: visible ? 1 : 0,
                animation: visible ? `ai-benefit-in 0.38s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both` : "none",
              }}>
                {/* Icon bubble */}
                <div style={{
                  width:40, height:40, borderRadius:12, flexShrink:0,
                  background:fbg, border:`1.5px solid ${fc}38`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                }}>
                  {b.icon}
                </div>
                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:th.text, fontFamily:bf, lineHeight:1.3, marginBottom:4 }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize:11.5, color:th.textSub, lineHeight:1.55, fontFamily:bf }}>
                    {b.sub}
                  </div>
                </div>
                {/* Checkmark */}
                <div style={{
                  width:22, height:22, borderRadius:"50%", flexShrink:0,
                  background:fbg, border:`1.5px solid ${fc}50`,
                  display:"flex", alignItems:"center", justifyContent:"center", marginTop:1,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke={fc} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM CTA ── */}
        <div style={{
          marginTop:24,
          background: dark ? th.card : "#fff",
          borderRadius:20, padding:"18px 16px",
          border:`1.5px solid ${dark ? "rgba(255,122,0,0.18)" : "rgba(255,122,0,0.22)"}`,
          boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 20px rgba(255,122,0,0.10)",
          textAlign:"center",
        }}>
          <div style={{ fontSize:13, fontWeight:700, color:th.text, fontFamily:bf, marginBottom:4 }}>
            {isHindi ? "YojanaSahay Pro जल्द आ रहा है" : "YojanaSahay Pro — Coming Soon"}
          </div>
          <div style={{ fontSize:11, color:th.textSub, fontFamily:bf, marginBottom:14, lineHeight:1.55 }}>
            {isHindi
              ? "अभी Google से साइन इन करें और Pro लॉन्च पर सबसे पहले नोटिफिकेशन पाएं।"
              : "Sign in now with Google — be first to know when Pro launches with premium features."}
          </div>
          <div
            onClick={() => onGoToProfile?.()}
            onPointerDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onPointerUp={e => e.currentTarget.style.transform = "scale(1)"}
            onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
            style={{
              background:"linear-gradient(135deg,#FF9933 0%,#FF7A00 50%,#e85d00 100%)",
              borderRadius:14, padding:"13px 20px",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              cursor:"pointer", boxShadow:"0 4px 16px rgba(255,122,0,0.38)",
              WebkitTapHighlightColor:"transparent", userSelect:"none",
            }}>
            <GoogleIcon size={18} />
            <span style={{ color:"#fff", fontSize:14, fontWeight:800, fontFamily:bf }}>
              {isHindi ? "साइन इन → प्रोफाइल" : "Sign In → Go to Profile"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
