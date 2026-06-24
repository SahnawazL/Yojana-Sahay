/**
 * YojanaSahay — HomeFAQSection.jsx  (v3 · Expanded & Categorised)
 * Collapsible bilingual FAQ · Home Tab
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Usage: <HomeFAQSection lang={lang} dark={dark} />
 *
 * v2 changes vs v1:
 *   · 21 Q&A pairs (up from 7) across 5 categories
 *   · Scrollable category filter pills (All / About / Privacy / Schemes / AI / Account)
 *   · Category section-header dividers shown in "All" view
 *   · Open-state colours adapt per category (not always navy)
 *   · "A" badge, chevron, icon box, and answer bg all adopt category colour
 *   · Covers Play Store reviewer requirements + extra depth for citizens
 *
 * v3 changes vs v2:
 *   · Removed the unverified "3,000+ Central Government schemes" claim
 *     (EN + HI) — replaced with accurate "manually verified against
 *     official government portals" framing
 */

import { useState } from "react";

// ─── THEME (mirrors App.jsx exactly) ─────────────────────────────────────────
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

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

// ─── BRAND COLOURS ────────────────────────────────────────────────────────────
const NAVY    = "#003580";
const SAFFRON = "#FF9933";
const GREEN   = "#138808";

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
// dark-safe colours: each has a light-mode and dark-mode active text/border colour
const CAT_CONFIG = {
  about:   { en: "About the App",         hi: "ऐप के बारे में",    icon: "🏠", color: NAVY,      darkColor: "#6B90FF" },
  privacy: { en: "Privacy & Data",        hi: "गोपनीयता",          icon: "🔒", color: GREEN,     darkColor: "#4ADE80" },
  schemes: { en: "Schemes",               hi: "योजनाएं",           icon: "📋", color: "#C97400", darkColor: SAFFRON   },
  ai:      { en: "AI Assistant",          hi: "AI सहायक",          icon: "🤖", color: "#7C3AED", darkColor: "#A78BFA" },
  account: { en: "Account",               hi: "अकाउंट",            icon: "👤", color: "#0284C7", darkColor: "#38BDF8" },
};

// ─── FAQ DATA — 21 bilingual Q&A pairs ───────────────────────────────────────
const FAQ_DATA = {
  en: [
    // ── About the App (5 Q) ───────────────────────────────────────────────────
    {
      cat: "about", icon: "💡",
      q: "What is YojanaSahay?",
      a: "YojanaSahay is an independent civic technology platform that helps every Indian citizen discover government welfare schemes they are legally entitled to — all in one place, with core features completely free. We are not affiliated with any government body.",
    },
    {
      cat: "about", icon: "💰",
      q: "Is this app free?",
      a: "Core features are completely free, forever — scheme discovery, the Eligibility Checker, and all scheme data. No ads, no hidden charges. The AI assistant is free with 10 messages per day (resets at midnight IST). YojanaSahay Pro is coming soon with higher AI limits and priority support, but scheme discovery will always remain free for every Indian citizen.",
    },
    {
      cat: "about", icon: "🏛️",
      q: "Is this an official government app?",
      a: "No. YojanaSahay is an independent platform — not affiliated with, endorsed by, or representative of any government ministry or department. We simply help citizens discover the schemes they are rightfully entitled to.",
    },
    {
      cat: "about", icon: "🗺️",
      q: "Which states and schemes are covered?",
      a: "We cover Central Government schemes and state-level schemes across all major Indian states including Assam, Karnataka, Maharashtra, Madhya Pradesh, Delhi, UP, and more. Every scheme is manually added and verified by our team against official government portals, with coverage expanding every app update.",
    },
    {
      cat: "about", icon: "📲",
      q: "Can I apply for schemes directly from this app?",
      a: "No — YojanaSahay is a discovery and guidance platform. Every scheme page provides a direct link to the official government application portal. We never intercept, hold, or process applications on your behalf.",
    },

    // ── Privacy & Data (4 Q) ─────────────────────────────────────────────────
    {
      cat: "privacy", icon: "🔒",
      q: "Is my data safe?",
      a: "Yes. All data is stored on Firebase (Google Cloud), encrypted at rest (AES-256) and in transit (TLS 1.2+). We never sell, share, or use your personal data for advertising — ever.",
    },
    {
      cat: "privacy", icon: "📋",
      q: "What personal data does the app collect?",
      a: "We store your profile answers (state, income, age, occupation, caste category) to personalise scheme results. If you sign in with Google, your name and email are also stored. No payment data, biometrics, or Aadhaar numbers are ever collected.",
    },
    {
      cat: "privacy", icon: "📷",
      q: "Does the app access my camera, microphone, or location?",
      a: "Never. YojanaSahay does not request camera, microphone, GPS, or contacts permissions. The only system permission used is internet access to fetch scheme data and sync with Firebase.",
    },
    {
      cat: "privacy", icon: "🗑️",
      q: "How do I delete my account and all my data?",
      a: "Email yojanasahayofficial@gmail.com with subject 'Data Deletion Request'. Your account and all associated data will be permanently deleted within 7 business days, with a confirmation email sent to you.",
    },

    // ── Schemes & Eligibility (4 Q) ──────────────────────────────────────────
    {
      cat: "schemes", icon: "✅",
      q: "How accurate is the scheme information?",
      a: "All scheme data is sourced from official Central and State Government portals and regularly verified by our team. We recommend confirming details on the official portal before applying — every scheme page includes a direct government link.",
    },
    {
      cat: "schemes", icon: "🔍",
      q: "How does the Eligibility Checker work?",
      a: "The Eligibility Checker asks 7–10 questions covering state, income, age, occupation, caste category, land holding, and ration card. Your answers are matched against our scheme database and results are ranked by relevance. All matching runs on-device — no data is sent to external servers.",
    },
    {
      cat: "schemes", icon: "🔗",
      q: "What if a scheme link is broken or shows 'No Response'?",
      a: "Tap 'Report Issue' on any scheme card. Our team verifies and updates links regularly. Note: 'No Response' on .nic.in links is expected behaviour — Indian government servers block international traffic, so our verification servers cannot reach them.",
    },
    {
      cat: "schemes", icon: "❓",
      q: "Why am I not matched to a scheme I expected?",
      a: "Eligibility depends on your saved profile. Run the Eligibility Checker and update your profile for more accurate results. Some schemes also have very narrow criteria defined by the government — we can only reflect what the official guidelines state.",
    },
    {
      cat: "schemes", icon: "📰",
      q: "What is the Scheme News Ticker on the home screen?",
      a: "The Scheme News Ticker is a live scrolling banner that displays the latest government scheme updates, new launches, and deadline reminders. It keeps you informed of time-sensitive opportunities without requiring you to manually check for updates.",
    },
    {
      cat: "schemes", icon: "💰",
      q: "How accurate is the 'Govt. Money You Can Receive' estimate?",
      a: "This figure adds up the maximum financial benefit across all schemes you are matched to — including monthly stipends, one-time grants, and in-kind benefits. It is an indicative ceiling, not a guaranteed amount. Actual disbursement depends on your approved application and the government's disbursement schedule. Always verify on the official scheme portal.",
    },
    {
      cat: "schemes", icon: "📁",
      q: "What is the Document Checklist?",
      a: "The Document Checklist automatically consolidates every document you need across all your matched schemes — so you gather them in one go instead of checking scheme by scheme. A basic checklist is available free. YojanaSahay Pro (coming soon) includes an advanced checklist with document-level guidance and priority grouping.",
    },

    // ── AI Assistant (4 Q) ───────────────────────────────────────────────────
    {
      cat: "ai", icon: "🤖",
      q: "How does the AI assistant work?",
      a: "The AI is powered by Groq (LLaMA model) and answers questions about any scheme in Hindi or English. It uses your saved profile to give personalised guidance and can search the web in real time for the latest deadlines and updates.",
    },
    {
      cat: "ai", icon: "💬",
      q: "How many AI messages do I get per day?",
      a: "Free accounts get 10 AI messages per day. The limit resets at midnight IST. YojanaSahay Pro (coming soon) will offer higher limits and priority AI responses.",
    },
    {
      cat: "ai", icon: "📝",
      q: "Can the AI help me fill application forms?",
      a: "Yes — the AI provides step-by-step document guidance and explains exactly how to fill out forms. It cannot submit forms on your behalf. All applications must be submitted through the official government portal.",
    },
    {
      cat: "ai", icon: "🌐",
      q: "Does the AI search the internet?",
      a: "Yes. The AI uses Tavily live web search to fetch real-time information on scheme deadlines, application windows, and recent government updates — going beyond our static database to give you the freshest available information.",
    },

    // ── Account & Support (4 Q) ──────────────────────────────────────────────
    {
      cat: "account", icon: "👤",
      q: "Do I need an account to use YojanaSahay?",
      a: "No account required. You can browse schemes and run the Eligibility Checker without signing in. Signing in (free, via Google) saves your profile, personalises results, tracks support requests, and unlocks the AI assistant.",
    },
    {
      cat: "account", icon: "🌐",
      q: "Which languages are supported?",
      a: "English and Hindi (हिंदी). Switch at any time using the EN / हिं toggle at the top of the home screen. More regional languages are planned for future releases.",
    },
    {
      cat: "account", icon: "🚀",
      q: "Is there a Pro version coming?",
      a: "Yes! YojanaSahay Pro is in development — featuring higher AI message limits, priority support, advanced scheme tracking, and more. Sign in now to be among the first notified when it launches.",
    },
    {
      cat: "account", icon: "🐛",
      q: "How do I report a bug or wrong scheme data?",
      a: "Use the 'Report Issue' button on any scheme card, or email yojanasahayofficial@gmail.com. Bug reports receive a reply within 48 hours. Verified scheme data corrections typically go live within 24 hours.",
    },
  ],

  hi: [
    // ── About (5) ─────────────────────────────────────────────────────────────
    {
      cat: "about", icon: "💡",
      q: "योजना सहाय क्या है?",
      a: "योजना सहाय एक स्वतंत्र नागरिक तकनीक मंच है जो हर भारतीय नागरिक को उनकी पात्र सरकारी कल्याण योजनाओं को एक ही जगह खोजने में मदद करता है — मुख्य सुविधाएं पूरी तरह मुफ़्त। हम किसी सरकारी संस्था से संबद्ध नहीं हैं।",
    },
    {
      cat: "about", icon: "💰",
      q: "क्या यह ऐप मुफ़्त है?",
      a: "मुख्य सुविधाएं हमेशा के लिए मुफ़्त हैं — योजना खोज, पात्रता जाँच और सभी योजना डेटा। कोई विज्ञापन नहीं, कोई छुपा खर्च नहीं। AI सहायक फ्री में प्रतिदिन 10 संदेश देता है (मध्यरात्रि IST पर रीसेट)। YojanaSahay Pro जल्द आ रहा है — अधिक AI सीमा और प्राथमिकता सहायता के साथ। लेकिन योजना खोज हर भारतीय नागरिक के लिए हमेशा मुफ़्त रहेगी।",
    },
    {
      cat: "about", icon: "🏛️",
      q: "क्या यह कोई सरकारी ऐप है?",
      a: "नहीं। योजना सहाय एक स्वतंत्र मंच है — हम किसी भी सरकारी मंत्रालय या विभाग से संबद्ध, अनुमोदित या प्रतिनिधि नहीं हैं। हम केवल नागरिकों को उनकी पात्र योजनाएं खोजने में सहायता करते हैं।",
    },
    {
      cat: "about", icon: "🗺️",
      q: "कौन से राज्य और योजनाएं शामिल हैं?",
      a: "हम केंद्र सरकार की योजनाएं और असम, कर्नाटक, महाराष्ट्र, मध्यप्रदेश, दिल्ली, UP सहित सभी प्रमुख राज्यों की योजनाएं कवर करते हैं। हर योजना हमारी टीम द्वारा आधिकारिक सरकारी पोर्टलों पर सत्यापित करने के बाद ही जोड़ी जाती है। हर ऐप अपडेट के साथ कवरेज बढ़ती है।",
    },
    {
      cat: "about", icon: "📲",
      q: "क्या मैं इस ऐप से सीधे आवेदन कर सकता हूँ?",
      a: "नहीं — योजना सहाय एक खोज और मार्गदर्शन मंच है। हर योजना पृष्ठ पर आधिकारिक सरकारी आवेदन पोर्टल का सीधा लिंक दिया जाता है। हम कोई आवेदन संसाधित नहीं करते।",
    },

    // ── Privacy (4) ───────────────────────────────────────────────────────────
    {
      cat: "privacy", icon: "🔒",
      q: "क्या मेरा डेटा सुरक्षित है?",
      a: "हाँ। आपका डेटा Firebase (Google Cloud) पर AES-256 एन्क्रिप्शन के साथ सुरक्षित है। हम आपका डेटा कभी नहीं बेचते, साझा नहीं करते, और विज्ञापन के लिए उपयोग नहीं करते।",
    },
    {
      cat: "privacy", icon: "📋",
      q: "ऐप कौन सा व्यक्तिगत डेटा इकट्ठा करता है?",
      a: "हम आपकी प्रोफाइल जानकारी (राज्य, आय, आयु, व्यवसाय, जाति वर्ग) को योजना परिणाम व्यक्तिगत करने के लिए सेव करते हैं। Google से साइन इन पर नाम और ईमेल भी सेव होते हैं। कोई भुगतान डेटा, बायोमेट्रिक्स या आधार नंबर कभी नहीं लिया जाता।",
    },
    {
      cat: "privacy", icon: "📷",
      q: "क्या ऐप कैमरा, माइक्रोफोन या लोकेशन एक्सेस करता है?",
      a: "कभी नहीं। योजना सहाय कभी भी कैमरा, माइक्रोफोन, GPS, या संपर्कों की अनुमति नहीं माँगता। केवल इंटरनेट एक्सेस का उपयोग होता है — डेटा लाने और Firebase से सिंक करने के लिए।",
    },
    {
      cat: "privacy", icon: "🗑️",
      q: "मैं अपना अकाउंट और सभी डेटा कैसे हटाऊं?",
      a: "yojanasahayofficial@gmail.com पर 'Data Deletion Request' विषय से ईमेल करें। 7 कार्य दिवसों में आपका अकाउंट और सभी संबंधित डेटा स्थायी रूप से हटा दिया जाएगा और पुष्टि ईमेल भेजी जाएगी।",
    },

    // ── Schemes (4) ───────────────────────────────────────────────────────────
    {
      cat: "schemes", icon: "✅",
      q: "योजना जानकारी कितनी सटीक है?",
      a: "सभी योजना डेटा केंद्र और राज्य सरकार के आधिकारिक पोर्टलों से लिया गया है और हमारी टीम नियमित रूप से सत्यापित करती है। आवेदन से पहले आधिकारिक पोर्टल पर विवरण की पुष्टि करें — हर योजना पर सरकारी लिंक दिया गया है।",
    },
    {
      cat: "schemes", icon: "🔍",
      q: "पात्रता जाँचकर्ता कैसे काम करता है?",
      a: "पात्रता जाँचकर्ता 7–10 सवाल पूछता है — राज्य, आय, आयु, व्यवसाय, जाति वर्ग, भूमि और राशन कार्ड। आपके जवाबों के आधार पर प्रासंगिकता के अनुसार योजनाएं दिखाई जाती हैं। सब कुछ डिवाइस पर ही होता है — कोई डेटा बाहरी सर्वर को नहीं जाता।",
    },
    {
      cat: "schemes", icon: "🔗",
      q: "यदि कोई योजना लिंक टूटा हो या 'कोई प्रतिक्रिया नहीं' दिखे?",
      a: "किसी भी योजना कार्ड पर 'समस्या रिपोर्ट करें' टैप करें। हमारी टीम नियमित रूप से लिंक सत्यापित करती है। .nic.in लिंक पर 'कोई प्रतिक्रिया नहीं' सामान्य है — भारतीय सरकारी सर्वर अंतरराष्ट्रीय ट्रैफिक को ब्लॉक करते हैं।",
    },
    {
      cat: "schemes", icon: "❓",
      q: "मुझे अपेक्षित योजना में मैच क्यों नहीं मिला?",
      a: "पात्रता आपकी सेव की गई प्रोफाइल पर निर्भर करती है। बेहतर परिणामों के लिए पात्रता जाँचकर्ता चलाएं और प्रोफाइल अपडेट करें। कुछ योजनाओं में सरकार द्वारा परिभाषित बहुत संकीर्ण मानदंड होते हैं — हम केवल आधिकारिक दिशा-निर्देशों को ही दर्शा सकते हैं।",
    },
    {
      cat: "schemes", icon: "📰",
      q: "होम स्क्रीन पर योजना न्यूज़ टिकर क्या है?",
      a: "योजना न्यूज़ टिकर एक लाइव स्क्रॉलिंग बैनर है जो नई सरकारी योजनाओं, अपडेट और डेडलाइन अनुस्मारक दिखाता है। यह आपको समय-संवेदनशील अवसरों से अवगत रखता है — बिना मैन्युअल रूप से जाँचे।",
    },
    {
      cat: "schemes", icon: "💰",
      q: "'सरकारी धन जो आप पा सकते हैं' अनुमान कितना सटीक है?",
      a: "यह राशि आपकी सभी मिलान योजनाओं के अधिकतम वित्तीय लाभ को जोड़ती है — मासिक वृत्ति, एकमुश्त अनुदान और अन्य लाभ सहित। यह एक संकेतक राशि है, गारंटीकृत राशि नहीं। वास्तविक वितरण आपके स्वीकृत आवेदन और सरकारी कार्यक्रम पर निर्भर करता है। कृपया आधिकारिक पोर्टल पर सत्यापित करें।",
    },
    {
      cat: "schemes", icon: "📁",
      q: "दस्तावेज़ चेकलिस्ट क्या है?",
      a: "दस्तावेज़ चेकलिस्ट आपकी सभी मिलान योजनाओं के लिए आवश्यक हर दस्तावेज़ की एक स्वचालित सूची बनाती है — ताकि आप एक बार में सभी इकट्ठा कर सकें। बेसिक चेकलिस्ट मुफ़्त में उपलब्ध है। YojanaSahay Pro (जल्द आ रहा है) में उन्नत चेकलिस्ट दस्तावेज़-स्तरीय मार्गदर्शन के साथ मिलेगी।",
    },

    // ── AI (4) ────────────────────────────────────────────────────────────────
    {
      cat: "ai", icon: "🤖",
      q: "AI सहायक कैसे काम करता है?",
      a: "AI सहायक Groq (LLaMA मॉडल) द्वारा संचालित है और हिंदी या English में किसी भी योजना के बारे में जवाब देता है। यह आपकी प्रोफाइल के अनुसार व्यक्तिगत मार्गदर्शन देता है और रीयल-टाइम वेब सर्च भी कर सकता है।",
    },
    {
      cat: "ai", icon: "💬",
      q: "प्रतिदिन कितने AI संदेश मिलते हैं?",
      a: "फ्री अकाउंट में प्रतिदिन 10 AI संदेश मिलते हैं। सीमा मध्यरात्रि IST पर रीसेट होती है। YojanaSahay Pro (जल्द आ रहा है) में अधिक सीमा और प्राथमिकता जवाब होंगे।",
    },
    {
      cat: "ai", icon: "📝",
      q: "क्या AI आवेदन फॉर्म भरने में मदद करता है?",
      a: "हाँ — AI आवश्यक दस्तावेज और फॉर्म भरने के चरण चरण-दर-चरण समझाता है। फॉर्म जमा करना आपको आधिकारिक सरकारी पोर्टल पर करना होगा — AI आपकी ओर से जमा नहीं कर सकता।",
    },
    {
      cat: "ai", icon: "🌐",
      q: "क्या AI इंटरनेट सर्च करता है?",
      a: "हाँ। AI Tavily लाइव वेब सर्च का उपयोग करके योजना की डेडलाइन, आवेदन विंडो और हालिया सरकारी अपडेट की रीयल-टाइम जानकारी लाता है — हमारे स्थिर डेटाबेस से भी आगे।",
    },

    // ── Account (4) ───────────────────────────────────────────────────────────
    {
      cat: "account", icon: "👤",
      q: "क्या अकाउंट बनाना ज़रूरी है?",
      a: "नहीं। बिना साइन इन के भी योजनाएं देख सकते हैं और पात्रता जांच सकते हैं। मुफ़्त Google अकाउंट से प्रोफाइल सेव होती है, परिणाम व्यक्तिगत मिलते हैं, सपोर्ट अनुरोध ट्रैक होते हैं और AI सहायक का उपयोग होता है।",
    },
    {
      cat: "account", icon: "🌐",
      q: "कौन-सी भाषाएं समर्थित हैं?",
      a: "English और हिंदी। होम स्क्रीन पर EN / हिं टॉगल से कभी भी भाषा बदलें। भविष्य के अपडेट में और क्षेत्रीय भाषाएं जोड़ी जाएंगी।",
    },
    {
      cat: "account", icon: "🚀",
      q: "क्या Pro संस्करण आ रहा है?",
      a: "हाँ! YojanaSahay Pro विकास में है — अधिक AI संदेश सीमा, प्राथमिकता सहायता, उन्नत योजना ट्रैकिंग और अधिक। अभी साइन इन करें — लॉन्च पर पहले सूचित हों।",
    },
    {
      cat: "account", icon: "🐛",
      q: "बग या गलत योजना डेटा कैसे रिपोर्ट करें?",
      a: "किसी भी योजना कार्ड पर 'समस्या रिपोर्ट करें' बटन का उपयोग करें, या yojanasahayofficial@gmail.com पर ईमेल करें। बग रिपोर्ट पर 48 घंटे में जवाब और सत्यापित योजना डेटा सुधार 24 घंटे में लाइव।",
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
  const [openIdx,    setOpenIdx]    = useState(null);
  const [filterCat,  setFilterCat]  = useState("all");

  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const allFaqs = FAQ_DATA[lang] || FAQ_DATA.en;

  // Resolve category colour accounting for dark-mode readability
  const catColor = (catId) => {
    const cfg = CAT_CONFIG[catId];
    return dark ? cfg.darkColor : cfg.color;
  };

  const filteredFaqs = filterCat === "all"
    ? allFaqs
    : allFaqs.filter((f) => f.cat === filterCat);

  const handleFilter = (catId) => {
    setFilterCat(catId);
    setOpenIdx(null);
  };

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  // ── Pill data: "All" + each category ───────────────────────────────────────
  const pills = [
    {
      id:    "all",
      icon:  "⚡",
      label: isHindi ? `सभी (${allFaqs.length})` : `All (${allFaqs.length})`,
      color: dark ? "#6B90FF" : NAVY,
    },
    ...Object.entries(CAT_CONFIG).map(([id, cfg]) => ({
      id,
      icon:  cfg.icon,
      label: isHindi ? cfg.hi : cfg.en,
      color: dark ? cfg.darkColor : cfg.color,
    })),
  ];

  return (
    <div style={{ marginBottom: 14 }}>

      {/* Hide webkit scrollbar on the pills row */}
      <style>{`.ys-faq-pills::-webkit-scrollbar { display: none; }`}</style>

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
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          padding:      "13px 15px 12px",
          borderBottom: `1px solid ${th.divider}`,
          background:   dark
            ? "rgba(255,255,255,0.02)"
            : "rgba(0,53,128,0.025)",
        }}>
          {/* Shield icon */}
          <div style={{
            width:          32,
            height:         32,
            borderRadius:   9,
            flexShrink:     0,
            background:     dark ? "rgba(0,53,128,0.22)" : "rgba(0,53,128,0.07)",
            border:         `1px solid ${dark ? "rgba(0,53,128,0.38)" : "rgba(0,53,128,0.13)"}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill={dark ? "#6B90FF" : NAVY} opacity="0.9"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"
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

          {/* Count pill — updates when filter is active */}
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
            {filteredFaqs.length} {isHindi ? "सवाल" : "Q&A"}
          </div>
        </div>

        {/* ── Category filter pills ── */}
        <div
          className="ys-faq-pills"
          style={{
            display:                   "flex",
            gap:                       6,
            padding:                   "10px 15px",
            overflowX:                 "auto",
            WebkitOverflowScrolling:   "touch",
            borderBottom:              `1px solid ${th.divider}`,
            msOverflowStyle:           "none",
            scrollbarWidth:            "none",
          }}
        >
          {pills.map((pill) => {
            const active = filterCat === pill.id;
            return (
              <div
                key={pill.id}
                onClick={() => handleFilter(pill.id)}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     4,
                  padding:                 "5px 11px",
                  borderRadius:            20,
                  flexShrink:              0,
                  fontSize:                10.5,
                  fontWeight:              700,
                  cursor:                  "pointer",
                  fontFamily:              bf,
                  background:              active
                    ? `${pill.color}1A`
                    : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                  color:                   active ? pill.color : th.textSub,
                  border:                  `1px solid ${active ? `${pill.color}50` : th.border}`,
                  WebkitTapHighlightColor: "transparent",
                  transition:              "background 0.15s, color 0.15s, border-color 0.15s",
                }}
                onTouchStart={(e) => { e.currentTarget.style.opacity = "0.72"; }}
                onTouchEnd={(e)   => { e.currentTarget.style.opacity = "1";    }}
                onTouchCancel={(e)=> { e.currentTarget.style.opacity = "1";    }}
              >
                <span style={{ fontSize: 10 }}>{pill.icon}</span>
                <span>{pill.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Accordion items ── */}
        {filteredFaqs.map((faq, i, arr) => {
          const isOpen  = openIdx === i;
          const isLast  = i === arr.length - 1;
          const cc      = catColor(faq.cat);             // category accent colour
          const showCatHeader =
            filterCat === "all" && (i === 0 || arr[i - 1].cat !== faq.cat);

          return (
            <div key={`${faq.cat}-${i}`}>

              {/* ── Category section divider (shown only in "All" view) ── */}
              {showCatHeader && (() => {
                const cfg = CAT_CONFIG[faq.cat];
                const hdrColor = dark ? cfg.darkColor : cfg.color;
                return (
                  <div style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        8,
                    padding:    i === 0 ? "11px 15px 7px" : "14px 15px 7px",
                    background: dark ? "rgba(0,0,0,0.10)" : `${hdrColor}06`,
                  }}>
                    {/* Coloured left bar */}
                    <div style={{
                      width:        3,
                      height:       12,
                      borderRadius: 99,
                      background:   hdrColor,
                      flexShrink:   0,
                    }} />
                    {/* Category label */}
                    <span style={{
                      fontSize:      9.5,
                      fontWeight:    800,
                      color:         hdrColor,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                      fontFamily:    bf,
                    }}>
                      {cfg.icon} {isHindi ? cfg.hi : cfg.en}
                    </span>
                    {/* Hairline separator */}
                    <div style={{ flex: 1, height: 1, background: th.divider }} />
                  </div>
                );
              })()}

              {/* ── Question row ── */}
              <div
                onClick={() => toggle(i)}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     11,
                  padding:                 "13px 15px",
                  cursor:                  "pointer",
                  background:              isOpen
                    ? (dark ? `${cc}16` : `${cc}08`)
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
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = isOpen
                    ? (dark ? `${cc}16` : `${cc}08`)
                    : "transparent";
                }}
                onTouchCancel={(e) => {
                  e.currentTarget.style.background = isOpen
                    ? (dark ? `${cc}16` : `${cc}08`)
                    : "transparent";
                }}
              >
                {/* Emoji icon — category-tinted when open */}
                <div style={{
                  width:          30,
                  height:         30,
                  borderRadius:   8,
                  flexShrink:     0,
                  background:     isOpen
                    ? `${cc}18`
                    : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                  border:         `1px solid ${
                    isOpen
                      ? `${cc}40`
                      : (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)")
                  }`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       14,
                  transition:     "background 0.18s, border-color 0.18s",
                }}>
                  {faq.icon}
                </div>

                {/* Question text */}
                <div style={{
                  flex:       1,
                  fontSize:   12.5,
                  fontWeight: isOpen ? 700 : 600,
                  color:      isOpen ? cc : th.textMid,
                  fontFamily: bf,
                  lineHeight: 1.35,
                  transition: "color 0.18s",
                }}>
                  {faq.q}
                </div>

                <Chevron color={isOpen ? cc : th.textSub} open={isOpen} />
              </div>

              {/* ── Answer panel — maxHeight CSS accordion, no JS height calc ── */}
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
                    ? (dark ? `${cc}0C` : `${cc}06`)
                    : "transparent",
                }}>
                  {/* "A" badge — adopts category colour */}
                  <div style={{
                    width:          30,
                    height:         20,
                    borderRadius:   6,
                    flexShrink:     0,
                    marginTop:      1,
                    background:     `${cc}18`,
                    border:         `1px solid ${cc}38`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       10,
                    fontWeight:     800,
                    color:          cc,
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
          display:     "flex",
          alignItems:  "center",
          gap:         8,
          padding:     "11px 15px",
          background:  dark ? "rgba(255,255,255,0.02)" : "rgba(0,53,128,0.02)",
          borderTop:   `1px solid ${th.divider}`,
        }}>
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={th.textSub} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
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
            {isHindi ? "और सवाल हैं? " : "Still have questions? "}
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
