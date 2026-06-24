/**
 * YojanaSahay — HomeFAQSection.jsx
 * Collapsible bilingual FAQ · Home Tab
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Usage (add wherever you want it in the home tab):
 *   <HomeFAQSection lang={lang} dark={dark} />
 *
 * Covers Play Store reviewer requirements:
 *   free · data safety · accuracy · govt affiliation · languages · account · AI
 */

import { useState } from "react";

// ─── MIRRORS App.jsx THEME exactly ────────────────────────────────────────────
const THEME = {
  light: {
    card:    "#fff",
    card2:   "#f8f9fa",
    text:    "#1a1a1a",
    textMid: "#555",
    textSub: "#888",
    border:  "#f0f0f0",
    divider: "#f3f3f3",
  },
  dark: {
    card:    "#1c1c1e",
    card2:   "#252527",
    text:    "#f0f0f0",
    textMid: "#aaa",
    textSub: "#888",
    border:  "#2c2c2e",
    divider: "#2c2c2e",
  },
};

// ─── MIRRORS App.jsx fontFamily() ─────────────────────────────────────────────
const fontFamily = (lang) =>
  lang === "hi"
    ? "'Noto Sans Devanagari',sans-serif"
    : "'Noto Sans',sans-serif";

// ─── BILINGUAL FAQ DATA ────────────────────────────────────────────────────────
// No hardcoded scheme counts — nothing to patch later.
const FAQ_DATA = {
  en: [
    {
      q: "Is this app free?",
      a: "Yes — completely free, forever. No ads, no subscriptions, no hidden charges. YojanaSahay is an independent civic platform built to ensure every Indian citizen can discover and access the government benefits they are entitled to.",
      icon: "💰",
    },
    {
      q: "Is my data safe?",
      a: "Yes. All data is stored on Firebase (Google Cloud), encrypted at rest (AES-256) and in transit (TLS 1.2+). We never sell, share, or use your data for advertising — ever. You can request permanent deletion at any time by emailing yojanasahayofficial@gmail.com.",
      icon: "🔒",
    },
    {
      q: "How accurate is the scheme information?",
      a: "All scheme data is sourced directly from official Central and State Government portals and is regularly verified by our team. We recommend confirming details on the official portal before applying — a direct government link is provided on every scheme page.",
      icon: "✅",
    },
    {
      q: "Is this an official government app?",
      a: "No. YojanaSahay is an independent civic technology platform. We are not affiliated with, endorsed by, or representative of any government ministry or department. We simply help citizens discover the schemes they are rightfully entitled to.",
      icon: "🏛️",
    },
    {
      q: "Which languages are supported?",
      a: "English and Hindi (हिंदी). Switch at any time using the EN / हिं toggle on the home screen. More regional languages are planned for future releases.",
      icon: "🌐",
    },
    {
      q: "Do I need an account to use this?",
      a: "No account is required. You can browse schemes and run the eligibility checker without signing in. Signing in (free) saves your profile, personalises your results, lets you track support requests, and unlocks the AI assistant.",
      icon: "👤",
    },
    {
      q: "How does the AI assistant work?",
      a: "The AI assistant is powered by Groq and answers questions about any scheme in Hindi or English. It uses your saved profile to give personalised guidance. Free accounts get 10 messages per day. Your conversations are private and never shared.",
      icon: "🤖",
    },
  ],
  hi: [
    {
      q: "क्या यह ऐप मुफ़्त है?",
      a: "हाँ — पूरी तरह मुफ़्त, हमेशा के लिए। कोई विज्ञापन नहीं, कोई सदस्यता शुल्क नहीं, कोई छुपा खर्च नहीं। योजना सहाय एक स्वतंत्र नागरिक प्लेटफ़ॉर्म है जो हर भारतीय नागरिक को उनके अधिकार की योजनाएं खोजने में मदद करता है।",
      icon: "💰",
    },
    {
      q: "क्या मेरा डेटा सुरक्षित है?",
      a: "हाँ। आपका डेटा Firebase (Google Cloud) पर AES-256 एन्क्रिप्शन के साथ सुरक्षित है। हम आपका डेटा कभी नहीं बेचते, साझा नहीं करते, और विज्ञापन के लिए उपयोग नहीं करते। yojanasahayofficial@gmail.com पर लिखकर आप कभी भी डेटा स्थायी रूप से हटवा सकते हैं।",
      icon: "🔒",
    },
    {
      q: "योजना जानकारी कितनी सटीक है?",
      a: "सभी योजना डेटा केंद्र और राज्य सरकार के आधिकारिक पोर्टलों से लिया गया है और हमारी टीम नियमित रूप से सत्यापित करती है। आवेदन से पहले आधिकारिक सरकारी पोर्टल पर विवरण की पुष्टि करें — हर योजना पर सरकारी लिंक दिया गया है।",
      icon: "✅",
    },
    {
      q: "क्या यह कोई सरकारी ऐप है?",
      a: "नहीं। योजना सहाय एक स्वतंत्र नागरिक प्रौद्योगिकी मंच है। हम किसी भी सरकारी मंत्रालय या विभाग से संबद्ध, अनुमोदित या प्रतिनिधि नहीं हैं। हम केवल नागरिकों को उनकी पात्र योजनाएं खोजने में सहायता करते हैं।",
      icon: "🏛️",
    },
    {
      q: "कौन-सी भाषाएं समर्थित हैं?",
      a: "English और हिंदी। होम स्क्रीन पर EN / हिं टॉगल से कभी भी भाषा बदलें। भविष्य के अपडेट में और क्षेत्रीय भाषाएं जोड़ी जाएंगी।",
      icon: "🌐",
    },
    {
      q: "क्या अकाउंट बनाना ज़रूरी है?",
      a: "नहीं। बिना लॉगिन के भी योजनाएं देख सकते हैं और पात्रता जांच सकते हैं। मुफ़्त अकाउंट से प्रोफाइल सेव होती है, परिणाम व्यक्तिगत मिलते हैं, सपोर्ट अनुरोध ट्रैक होते हैं और AI सहायक का उपयोग होता है।",
      icon: "👤",
    },
    {
      q: "AI सहायक कैसे काम करता है?",
      a: "AI सहायक Groq द्वारा संचालित है और हिंदी या English में किसी भी योजना के बारे में जवाब देता है। यह आपके प्रोफाइल के अनुसार व्यक्तिगत मार्गदर्शन देता है। फ्री अकाउंट में प्रतिदिन 10 संदेश मिलते हैं। आपकी बातचीत पूरी तरह निजी है।",
      icon: "🤖",
    },
  ],
};

// ─── CHEVRON SVG ──────────────────────────────────────────────────────────────
function Chevron({ color, open }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round"
      style={{
        flexShrink:  0,
        transition:  "transform 0.24s cubic-bezier(0.4,0,0.2,1)",
        transform:   open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomeFAQSection({ lang, dark }) {
  const [openIdx, setOpenIdx] = useState(null);

  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const faqs    = FAQ_DATA[lang] || FAQ_DATA.en;

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  // Colours consistent with App.jsx accent palette
  const NAVY    = "#003580";
  const SAFFRON = "#FF9933";

  return (
    <div style={{ marginBottom: 14 }}>

      {/* ── Section label — same style as "How It Works", "Categories" ── */}
      <div style={{
        fontSize:      12,
        fontWeight:    700,
        color:         th.textSub,
        marginBottom:  9,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        fontFamily:    bf,
      }}>
        {isHindi ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
      </div>

      {/* ── Main card ── */}
      <div style={{
        background:   th.card,
        borderRadius: 16,
        overflow:     "hidden",
        border:       `1.5px solid ${th.border}`,
        boxShadow:    dark
          ? "0 2px 12px rgba(0,0,0,0.20)"
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}>

        {/* ── Card header ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          gap:            10,
          padding:        "13px 15px 12px",
          borderBottom:   `1px solid ${th.divider}`,
          background:     dark
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,53,128,0.025)",
        }}>
          {/* Shield icon */}
          <div style={{
            width:          32,
            height:         32,
            borderRadius:   9,
            background:     dark ? "rgba(0,53,128,0.22)" : "rgba(0,53,128,0.07)",
            border:         `1px solid ${dark ? "rgba(0,53,128,0.38)" : "rgba(0,53,128,0.13)"}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill={dark ? "#6B90FF" : NAVY} opacity="0.9"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize:   12.5,
              fontWeight: 700,
              color:      th.text,
              fontFamily: bf,
              lineHeight: 1.2,
            }}>
              {isHindi ? "आपके सवाल, हमारे जवाब" : "Your Questions, Answered"}
            </div>
            <div style={{
              fontSize:   10.5,
              color:      th.textSub,
              marginTop:  2,
              fontFamily: bf,
              lineHeight: 1.3,
            }}>
              {isHindi
                ? "Firebase Auth · डेटा नहीं बेचा जाता · MIT लाइसेंस · सरकारी लिंक"
                : "Firebase Auth · No data sold · MIT Licensed · Govt links only"}
            </div>
          </div>

          {/* Item count pill */}
          <div style={{
            background:   dark ? "rgba(255,153,51,0.18)" : "rgba(255,153,51,0.12)",
            border:       `1px solid ${dark ? "rgba(255,153,51,0.35)" : "rgba(255,153,51,0.28)"}`,
            borderRadius: 20,
            padding:      "3px 9px",
            fontSize:     10,
            fontWeight:   800,
            color:        SAFFRON,
            fontFamily:   bf,
            flexShrink:   0,
          }}>
            {faqs.length} {isHindi ? "सवाल" : "Q&A"}
          </div>
        </div>

        {/* ── Accordion items ── */}
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          const isLast = i === faqs.length - 1;

          return (
            <div key={i}>

              {/* Question row */}
              <div
                onClick={() => toggle(i)}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     11,
                  padding:                 "13px 15px",
                  cursor:                  "pointer",
                  background:              isOpen
                    ? (dark ? "rgba(0,53,128,0.10)" : "rgba(0,53,128,0.03)")
                    : "transparent",
                  borderBottom:            !isOpen && !isLast
                    ? `1px solid ${th.divider}`
                    : "none",
                  WebkitTapHighlightColor: "transparent",
                  userSelect:              "none",
                  transition:              "background 0.18s",
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = dark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.025)";
                }}
                onTouchEnd={(e)    => {
                  e.currentTarget.style.background = isOpen
                    ? (dark ? "rgba(0,53,128,0.10)" : "rgba(0,53,128,0.03)")
                    : "transparent";
                }}
                onTouchCancel={(e) => {
                  e.currentTarget.style.background = isOpen
                    ? (dark ? "rgba(0,53,128,0.10)" : "rgba(0,53,128,0.03)")
                    : "transparent";
                }}
              >
                {/* Emoji icon */}
                <div style={{
                  width:          30,
                  height:         30,
                  borderRadius:   8,
                  flexShrink:     0,
                  background:     dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  border:         `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       14,
                }}>
                  {faq.icon}
                </div>

                {/* Question text */}
                <div style={{
                  flex:       1,
                  fontSize:   12.5,
                  fontWeight: isOpen ? 700 : 600,
                  color:      isOpen ? th.text : th.textMid,
                  fontFamily: bf,
                  lineHeight: 1.35,
                  transition: "color 0.18s",
                }}>
                  {faq.q}
                </div>

                <Chevron color={isOpen ? NAVY : th.textSub} open={isOpen} />
              </div>

              {/* Answer — maxHeight CSS accordion, no JS animation */}
              <div style={{
                maxHeight:  isOpen ? 600 : 0,
                overflow:   "hidden",
                transition: "max-height 0.30s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{
                  display:      "flex",
                  gap:          10,
                  padding:      "0 15px 13px 15px",
                  borderBottom: !isLast ? `1px solid ${th.divider}` : "none",
                  background:   isOpen
                    ? (dark ? "rgba(0,53,128,0.10)" : "rgba(0,53,128,0.03)")
                    : "transparent",
                }}>
                  {/* "A" label */}
                  <div style={{
                    width:          30,
                    height:         20,
                    borderRadius:   6,
                    flexShrink:     0,
                    marginTop:      1,
                    background:     dark ? "rgba(19,136,8,0.18)" : "rgba(19,136,8,0.08)",
                    border:         `1px solid ${dark ? "rgba(19,136,8,0.35)" : "rgba(19,136,8,0.18)"}`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       10,
                    fontWeight:     800,
                    color:          "#138808",
                    fontFamily:     bf,
                  }}>
                    A
                  </div>

                  {/* Answer text */}
                  <div style={{
                    flex:       1,
                    fontSize:   12,
                    color:      th.textSub,
                    lineHeight: 1.7,
                    fontFamily: bf,
                    paddingTop: 1,
                  }}>
                    {faq.a}
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {/* ── Footer — contact prompt ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          gap:            8,
          padding:        "11px 15px",
          background:     dark ? "rgba(255,255,255,0.02)" : "rgba(0,53,128,0.02)",
          borderTop:      `1px solid ${th.divider}`,
        }}>
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={th.textSub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <div style={{
            fontSize:   11,
            color:      th.textSub,
            fontFamily: bf,
            lineHeight: 1.4,
          }}>
            {isHindi
              ? "और सवाल हैं? "
              : "Still have questions? "}
            <span style={{
              color:      dark ? "#6B90FF" : NAVY,
              fontWeight: 700,
            }}>
              yojanasahayofficial@gmail.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
