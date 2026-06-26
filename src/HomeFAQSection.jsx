/**
 * YojanaSahay — HomeFAQSection.jsx  (v8 · Premium)
 * Collapsible bilingual FAQ · Home Tab
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Usage: <HomeFAQSection lang={lang} dark={dark} />
 *
 * v8 changes vs v7:
 *   · Feature: "Was this helpful?" 👍/👎 feedback bar
 *     – Appears at the bottom of every open answer panel
 *     – Optimistic UI: vote registers instantly in local state
 *     – Logs to Firestore `faqFeedback/{faqId}__{uid}` (merge: true)
 *       so each user's vote is idempotent and updatable
 *     – Anonymous users write with uid = 'anon'
 *     – After voting: both buttons fade, chosen one stays highlighted
 *       with category colour + scale(1.15), label changes to "Thanks!"
 *     – Firestore doc fields: faqId, cat, vote, lang, uid, updatedAt
 *   · Bug fix: hardware back-button history stacking
 *     – Old code called pushState on EVERY openIdx change, so switching
 *       between open rows (A open -> tap B) pushed a new history entry
 *       each time. Users had to press back several extra times to leave
 *       the screen. Now pushes exactly one entry per "open" session via
 *       a ref, and pops it again if the row is closed by tapping instead
 *       of via the back button.
 *   · Bug fix: accordion content clipping
 *     – Old code used a hardcoded `maxHeight: 700`, silently clipping any
 *       answer (esp. ones with a `note` block, or longer Hindi text) that
 *       rendered taller than 700px, with no scroll affordance. Now
 *       measures each item's real height via ref + scrollHeight instead.
 *
 * v6 changes vs v5:
 *   · Premium visual redesign
 *     – Tiranga-inspired 3 px gradient top bar on main card
 *     – Dot-grid CSS header background
 *     – Gradient clip-text card title (NAVY→steel in light; saffron in dark)
 *     – Left category-colour accent stripe (3 px) on open accordion rows
 *     – Category pills: gradient active fill, faint glow, larger hit area
 *     – "A" answer badge: circle monogram with category gradient ring
 *     – Note block: left border stripe + tighter icon row
 *     – Shield header icon: soft glow ring on dark mode
 *     – Footer: Tiranga tint gradient + stronger CTA hierarchy
 *     – Section label: left accent bar + gradient shimmer
 *   · Bug fix: renderAnswer now receives `dark` as explicit 6th param
 *     (was resolving to module-scope undefined in v5 — always falsy)
 */

import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ─── THEME ────────────────────────────────────────────────────────────────────
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
const VIOLET  = "#7C3AED";

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CAT_CONFIG = {
  about:   { en: "About the App",  hi: "ऐप के बारे में", color: NAVY,      darkColor: "#6B90FF"  },
  privacy: { en: "Privacy & Data", hi: "गोपनीयता",        color: GREEN,     darkColor: "#4ADE80"  },
  schemes: { en: "Schemes",        hi: "योजनाएं",          color: "#C97400", darkColor: SAFFRON    },
  ai:      { en: "AI Assistant",   hi: "AI सहायक",        color: VIOLET,    darkColor: "#A78BFA"  },
  account: { en: "Account",        hi: "अकाउंट",          color: "#0284C7", darkColor: "#38BDF8"  },
};

// ─── FAQ DATA — 25 bilingual Q&A pairs ───────────────────────────────────────
const FAQ_DATA = {
  en: [
    // ── About the App (5 Q) ───────────────────────────────────────────────────
    {
      cat: "about",
      q: "What is YojanaSahay?",
      a: "YojanaSahay is an independent, AI-powered civic technology platform built on a structured, growing database of government welfare schemes, each tagged with eligibility metadata and benefit details, that helps every Indian citizen discover schemes they are legally entitled to — all in one place, with core features completely free. A live Scheme Update ticker keeps the database fresh with the latest government scheme news. We are not affiliated with any government body.",
    },
    {
      cat: "about",
      q: "Is this app free?",
      a: "Core features are completely free, forever — scheme discovery, the Eligibility Checker, and all scheme data. No ads, no hidden charges. The AI assistant is free with 10 messages per day, tracked server-side per account and reset at midnight IST. YojanaSahay Pro is coming soon with higher AI limits and priority support, but scheme discovery will always remain free for every Indian citizen.",
    },
    {
      cat: "about",
      q: "Is this an official government app?",
      a: "No. YojanaSahay is an independent platform — not affiliated with, endorsed by, or representative of any government ministry or department. We simply help citizens discover the schemes they are rightfully entitled to.",
    },
    {
      cat: "about",
      q: "Which states and schemes are covered?",
      a: "We cover Central Government schemes and state-level schemes across all major Indian states including Assam, Karnataka, Maharashtra, Madhya Pradesh, Delhi, UP, and more. Every scheme is manually added and verified against official government portals, then stored as a structured bilingual record in our database — with coverage expanding every app update.",
    },
    {
      cat: "about",
      q: "Can I apply for schemes directly from this app?",
      a: "No — YojanaSahay is a discovery and guidance platform. Every scheme page provides a direct link to the official government application portal. We never intercept, hold, or process applications on your behalf.",
    },

    // ── Privacy & Data (4 Q) ─────────────────────────────────────────────────
    {
      cat: "privacy",
      q: "Is my data safe?",
      a: "Yes. All data is stored on Firebase (Google Cloud), encrypted at rest (AES-256) and in transit (TLS 1.2+), with Firestore security rules restricting every document to its owning account UID — no other user or unauthenticated client can read it. We never sell, share, or use your personal data for advertising — ever.",
    },
    {
      cat: "privacy",
      q: "What personal data does the app collect?",
      a: "We store your profile answers (state, income, age, occupation, caste category) under your Firebase Authentication UID in Firestore, to personalise scheme results. If you sign in with Google, your name and email are also stored. No payment data, biometrics, or Aadhaar numbers are ever collected.",
    },
    {
      cat: "privacy",
      q: "Does the app access my camera, microphone, or location?",
      a: "Never. YojanaSahay does not request camera, microphone, GPS, or contacts permissions. The only system permission used is internet access — plain HTTPS calls to fetch scheme data from Firestore and sync via our Vercel-hosted endpoints.",
    },
    {
      cat: "privacy",
      q: "How do I delete my account and all my data?",
      a: "Email yojanasahayofficial@gmail.com with subject 'Data Deletion Request'. Within 7 business days, your Firestore user document and any linked subcollections — saved profile, chat history — are permanently deleted, with a confirmation email sent to you.",
    },

    // ── Schemes & Eligibility (8 Q) ──────────────────────────────────────────
    {
      cat: "schemes",
      q: "How accurate is the scheme information?",
      a: {
        text: "All scheme data is sourced from official Central and State Government portals and regularly re-verified by our team, with each record carrying a last-verified date visible on the scheme page.",
        note: "Always confirm details on the official portal before applying — every scheme page includes a direct government link.",
      },
    },
    {
      cat: "schemes",
      q: "How does the Eligibility Checker work?",
      a: "The Eligibility Checker asks 7–10 questions covering state, income, age, occupation, caste category, land holding, and ration card. Your answers build a profile object that's evaluated client-side against each scheme's own eligibility rule in our database, and results are ranked by relevance. All matching runs on-device — no profile data is sent to external servers to compute it.",
    },
    {
      cat: "schemes",
      q: "What if a scheme link is broken or shows 'No Response'?",
      a: {
        text: "Go to the Profile tab and tap 'Report Issue' (you'll need to be signed in). Our verification pipeline runs periodic automated HTTP reachability checks on every scheme link, and our team manually reviews anything flagged.",
        note: "'No Response' on .nic.in links is expected behaviour — Indian government servers commonly block international traffic, so our verification servers cannot reach them even though the link works fine for users browsing from India.",
      },
    },
    {
      cat: "schemes",
      q: "Why am I not matched to a scheme I expected?",
      a: "Eligibility depends on your saved profile — it's re-evaluated against each scheme's eligibility rule every time you run the checker. Run the Eligibility Checker again and update your profile for more accurate results. Some schemes also have very narrow criteria defined by the government — we can only reflect what the official guidelines state.",
    },
    {
      cat: "schemes",
      q: "What is the Scheme News Ticker on the home screen?",
      a: "The Scheme News Ticker is a live scrolling banner backed by a real-time Firestore listener — new government scheme updates, launches, and deadline reminders push to your screen automatically, with no manual refresh or polling needed.",
    },
    {
      cat: "schemes",
      q: "How accurate is the 'Govt. Money You Can Receive' estimate?",
      a: {
        text: "This figure is computed by summing the declared benefit field — monthly stipends, one-time grants, and in-kind benefits — across every scheme object your profile currently matches.",
        note: "This is an indicative ceiling, not a guaranteed amount. Actual disbursement depends on your approved application and the government's disbursement schedule. Always verify on the official scheme portal.",
      },
    },
    {
      cat: "schemes",
      q: "What is the Document Checklist?",
      a: "The Document Checklist is built by merging and deduplicating the document-requirement arrays across every scheme your profile matches — so you gather every document once instead of checking scheme by scheme. A basic checklist is available free. YojanaSahay Pro (coming soon) includes an advanced checklist with document-level guidance and priority grouping.",
    },
    {
      cat: "schemes",
      q: "How are new schemes added and verified?",
      a: "Each scheme is added manually after reviewing the official government notification or portal page — never auto-scraped or bulk-imported. Once published, it enters a continuous two-tier verification pipeline: an automated crawler periodically checks that the official link is still reachable, while a Groq AI pass cross-checks the scheme's stated dates against the live notification to catch ones that have quietly expired, been extended, or changed. Anything flagged by either check is routed to a manual review queue for correction or removal — so accuracy keeps improving even after a scheme goes live.",
    },

    // ── AI Assistant (4 Q) ───────────────────────────────────────────────────
    {
      cat: "ai",
      q: "How does the AI assistant work?",
      a: "The AI is powered by Groq (LLaMA model) and answers questions about any scheme in Hindi or English, using your saved profile object as context to give personalised guidance. It can also trigger a real-time web search for the latest deadlines and updates beyond our stored database.",
    },
    {
      cat: "ai",
      q: "How many AI messages do I get per day?",
      a: "Free accounts get 10 AI messages per day, tracked server-side per account with a rolling counter that resets at midnight IST. YojanaSahay Pro (coming soon) will offer higher limits and priority AI responses.",
    },
    {
      cat: "ai",
      q: "Can the AI help me fill application forms?",
      a: "Yes — the AI provides step-by-step document guidance and explains exactly how to fill out forms. It cannot submit forms on your behalf. All applications must be submitted through the official government portal.",
    },
    {
      cat: "ai",
      q: "Does the AI search the internet?",
      a: "Yes. The AI uses Tavily's live web search API to fetch real-time information on scheme deadlines, application windows, and recent government updates — going beyond our static database to give you the freshest available information.",
    },

    // ── Account & Support (4 Q) ──────────────────────────────────────────────
    {
      cat: "account",
      q: "Do I need an account to use YojanaSahay?",
      a: "No account required. You can browse schemes and run the Eligibility Checker without signing in. Signing in (free, via Google through Firebase Authentication) stores your profile against your account UID in Firestore, personalises results, tracks support requests, and unlocks the AI assistant.",
    },
    {
      cat: "account",
      q: "Which languages are supported?",
      a: "English and Hindi (हिंदी). Every scheme record and UI string is stored as a bilingual field pair in our database rather than machine-translated at runtime, so switching with the EN / हिं toggle is instant. More regional languages are planned for future releases.",
    },
    {
      cat: "account",
      q: "Is there a Pro version coming?",
      a: "Yes! YojanaSahay Pro is in development — featuring higher AI message limits, priority support, advanced scheme tracking, and more. Sign in now to be among the first notified when it launches.",
    },
    {
      cat: "account",
      q: "How do I report a bug or wrong scheme data?",
      a: "Use the 'Report Issue' button in the Profile tab (sign-in required), or email yojanasahayofficial@gmail.com. Reports are logged to our support queue with device and browser metadata attached automatically, to help us reproduce issues faster. Bug reports receive a reply within 48 hours; verified scheme data corrections typically go live within 24 hours.",
    },
  ],

  hi: [
    // ── About (5) ─────────────────────────────────────────────────────────────
    {
      cat: "about",
      q: "योजना सहाय क्या है?",
      a: "योजना सहाय एक स्वतंत्र, AI-संचालित नागरिक तकनीक मंच है, जो सरकारी कल्याण योजनाओं के एक संरचित और निरंतर बढ़ते डेटाबेस पर बना है — हर योजना के साथ पात्रता और लाभ की जानकारी टैग की गई है। यह हर भारतीय नागरिक को उनकी पात्र योजनाओं को एक ही जगह खोजने में मदद करता है — मुख्य सुविधाएं पूरी तरह मुफ़्त। एक लाइव योजना अपडेट टिकर डेटाबेस को नवीनतम सरकारी योजना समाचार के साथ ताज़ा रखता है। हम किसी सरकारी संस्था से संबद्ध नहीं हैं।",
    },
    {
      cat: "about",
      q: "क्या यह ऐप मुफ़्त है?",
      a: "मुख्य सुविधाएं हमेशा के लिए मुफ़्त हैं — योजना खोज, पात्रता जाँच और सभी योजना डेटा। कोई विज्ञापन नहीं, कोई छुपा खर्च नहीं। AI सहायक फ्री में प्रतिदिन 10 संदेश देता है — यह सीमा हर अकाउंट के लिए सर्वर-साइड ट्रैक होती है और मध्यरात्रि IST पर रीसेट होती है। YojanaSahay Pro जल्द आ रहा है — अधिक AI सीमा और प्राथमिकता सहायता के साथ। लेकिन योजना खोज हर भारतीय नागरिक के लिए हमेशा मुफ़्त रहेगी।",
    },
    {
      cat: "about",
      q: "क्या यह कोई सरकारी ऐप है?",
      a: "नहीं। योजना सहाय एक स्वतंत्र मंच है — हम किसी भी सरकारी मंत्रालय या विभाग से संबद्ध, अनुमोदित या प्रतिनिधि नहीं हैं। हम केवल नागरिकों को उनकी पात्र योजनाएं खोजने में सहायता करते हैं।",
    },
    {
      cat: "about",
      q: "कौन से राज्य और योजनाएं शामिल हैं?",
      a: "हम केंद्र सरकार की योजनाएं और असम, कर्नाटक, महाराष्ट्र, मध्यप्रदेश, दिल्ली, UP सहित सभी प्रमुख राज्यों की योजनाएं कवर करते हैं। हर योजना आधिकारिक सरकारी पोर्टलों पर सत्यापित करने के बाद ही जोड़ी जाती है, और फिर हमारे डेटाबेस में एक संरचित द्विभाषी रिकॉर्ड के रूप में सेव होती है। हर ऐप अपडेट के साथ कवरेज बढ़ती है।",
    },
    {
      cat: "about",
      q: "क्या मैं इस ऐप से सीधे आवेदन कर सकता हूँ?",
      a: "नहीं — योजना सहाय एक खोज और मार्गदर्शन मंच है। हर योजना पृष्ठ पर आधिकारिक सरकारी आवेदन पोर्टल का सीधा लिंक दिया जाता है। हम कोई आवेदन संसाधित नहीं करते।",
    },

    // ── Privacy (4) ───────────────────────────────────────────────────────────
    {
      cat: "privacy",
      q: "क्या मेरा डेटा सुरक्षित है?",
      a: "हाँ। आपका डेटा Firebase (Google Cloud) पर AES-256 एन्क्रिप्शन (रेस्ट में) और TLS 1.2+ (ट्रांज़िट में) के साथ सुरक्षित है, और Firestore सिक्योरिटी रूल्स हर दस्तावेज़ को सिर्फ उसके मालिक अकाउंट UID तक सीमित रखते हैं — कोई अन्य उपयोगकर्ता या असत्यापित क्लाइंट उसे नहीं पढ़ सकता। हम आपका डेटा कभी नहीं बेचते, साझा नहीं करते, और विज्ञापन के लिए उपयोग नहीं करते।",
    },
    {
      cat: "privacy",
      q: "ऐप कौन सा व्यक्तिगत डेटा इकट्ठा करता है?",
      a: "हम आपकी प्रोफाइल जानकारी (राज्य, आय, आयु, व्यवसाय, जाति वर्ग) को आपके Firebase Authentication UID के अंतर्गत Firestore में सेव करते हैं, ताकि योजना परिणाम व्यक्तिगत किए जा सकें। Google से साइन इन पर नाम और ईमेल भी सेव होते हैं। कोई भुगतान डेटा, बायोमेट्रिक्स या आधार नंबर कभी नहीं लिया जाता।",
    },
    {
      cat: "privacy",
      q: "क्या ऐप कैमरा, माइक्रोफोन या लोकेशन एक्सेस करता है?",
      a: "कभी नहीं। योजना सहाय कभी भी कैमरा, माइक्रोफोन, GPS, या संपर्कों की अनुमति नहीं माँगता। केवल एक सिस्टम परमिशन उपयोग होती है — इंटरनेट एक्सेस, यानी Firestore से डेटा लाने और हमारे Vercel-होस्टेड एंडपॉइंट्स से सिंक करने के लिए साधारण HTTPS कॉल्स।",
    },
    {
      cat: "privacy",
      q: "मैं अपना अकाउंट और सभी डेटा कैसे हटाऊं?",
      a: "yojanasahayofficial@gmail.com पर 'Data Deletion Request' विषय से ईमेल करें। 7 कार्य दिवसों में आपका Firestore यूज़र दस्तावेज़ और उससे जुड़ी सभी सब-कलेक्शन्स — सेव की गई प्रोफाइल, चैट हिस्ट्री — स्थायी रूप से हटा दी जाती हैं, और पुष्टि ईमेल भेजी जाती है।",
    },

    // ── Schemes (8) ───────────────────────────────────────────────────────────
    {
      cat: "schemes",
      q: "योजना जानकारी कितनी सटीक है?",
      a: {
        text: "सभी योजना डेटा केंद्र और राज्य सरकार के आधिकारिक पोर्टलों से लिया गया है और हमारी टीम नियमित रूप से दोबारा सत्यापित करती है — हर रिकॉर्ड पर योजना पृष्ठ पर दिखने वाली 'अंतिम सत्यापन तिथि' होती है।",
        note: "आवेदन से पहले आधिकारिक पोर्टल पर विवरण की पुष्टि ज़रूर करें — हर योजना पर सरकारी लिंक दिया गया है।",
      },
    },
    {
      cat: "schemes",
      q: "पात्रता जाँचकर्ता कैसे काम करता है?",
      a: "पात्रता जाँचकर्ता 7–10 सवाल पूछता है — राज्य, आय, आयु, व्यवसाय, जाति वर्ग, भूमि और राशन कार्ड। आपके जवाबों से एक प्रोफाइल ऑब्जेक्ट बनता है, जिसे डिवाइस पर ही हर योजना के अपने पात्रता नियम के विरुद्ध जांचा जाता है, और परिणाम प्रासंगिकता के अनुसार दिखाए जाते हैं। सारी गणना डिवाइस पर ही होती है — आपकी प्रोफाइल का डेटा गणना के लिए बाहरी सर्वर पर नहीं भेजा जाता।",
    },
    {
      cat: "schemes",
      q: "यदि कोई योजना लिंक टूटा हो या 'कोई प्रतिक्रिया नहीं' दिखे?",
      a: {
        text: "प्रोफाइल टैब में जाकर 'समस्या रिपोर्ट करें' पर टैप करें (इसके लिए लॉगिन आवश्यक है)। हमारी सत्यापन पाइपलाइन हर योजना लिंक पर समय-समय पर स्वचालित HTTP जांच चलाती है, और फ़्लैग किए गए लिंक की मैन्युअल समीक्षा होती है।",
        note: ".nic.in लिंक पर 'कोई प्रतिक्रिया नहीं' सामान्य है — भारतीय सरकारी सर्वर अक्सर अंतरराष्ट्रीय ट्रैफिक को ब्लॉक करते हैं, इसलिए हमारे सत्यापन सर्वर उन तक नहीं पहुँच पाते, भले ही भारत से ब्राउज़ कर रहे उपयोगकर्ताओं के लिए लिंक ठीक से काम करता हो।",
      },
    },
    {
      cat: "schemes",
      q: "मुझे अपेक्षित योजना में मैच क्यों नहीं मिला?",
      a: "पात्रता आपकी सेव की गई प्रोफाइल पर निर्भर करती है — हर बार जाँचकर्ता चलाने पर इसे हर योजना के पात्रता नियम के विरुद्ध फिर से जांचा जाता है। बेहतर परिणामों के लिए पात्रता जाँचकर्ता फिर से चलाएं और प्रोफाइल अपडेट करें। कुछ योजनाओं में सरकार द्वारा परिभाषित बहुत संकीर्ण मानदंड होते हैं — हम केवल आधिकारिक दिशा-निर्देशों को ही दर्शा सकते हैं।",
    },
    {
      cat: "schemes",
      q: "होम स्क्रीन पर योजना न्यूज़ टिकर क्या है?",
      a: "योजना न्यूज़ टिकर एक लाइव स्क्रॉलिंग बैनर है, जो एक रीयल-टाइम Firestore लिसनर पर आधारित है — नई सरकारी योजनाएं, अपडेट और डेडलाइन अनुस्मारक बिना मैन्युअल रीफ्रेश या पोलिंग के सीधे आपकी स्क्रीन पर आ जाते हैं।",
    },
    {
      cat: "schemes",
      q: "'सरकारी धन जो आप पा सकते हैं' अनुमान कितना सटीक है?",
      a: {
        text: "यह राशि आपकी प्रोफाइल से मेल खाने वाली हर योजना के घोषित लाभ फ़ील्ड — मासिक वृत्ति, एकमुश्त अनुदान और अन्य लाभ — को जोड़कर निकाली जाती है।",
        note: "यह एक संकेतक राशि है, गारंटीकृत राशि नहीं। वास्तविक वितरण आपके स्वीकृत आवेदन और सरकारी कार्यक्रम पर निर्भर करता है। कृपया आधिकारिक पोर्टल पर सत्यापित करें।",
      },
    },
    {
      cat: "schemes",
      q: "दस्तावेज़ चेकलिस्ट क्या है?",
      a: "दस्तावेज़ चेकलिस्ट आपकी प्रोफाइल से मेल खाने वाली हर योजना की दस्तावेज़-आवश्यकता सूचियों को मिलाकर और दोहराव हटाकर बनाई जाती है — ताकि आप हर दस्तावेज़ एक बार में इकट्ठा करें, योजना-दर-योजना जांचने के बजाय। बेसिक चेकलिस्ट मुफ़्त में उपलब्ध है। YojanaSahay Pro (जल्द आ रहा है) में उन्नत चेकलिस्ट दस्तावेज़-स्तरीय मार्गदर्शन के साथ मिलेगी।",
    },
    {
      cat: "schemes",
      q: "नई योजनाएं कैसे जोड़ी और सत्यापित की जाती हैं?",
      a: "हर योजना आधिकारिक सरकारी अधिसूचना या पोर्टल की जांच के बाद मैन्युअल रूप से जोड़ी जाती है — कभी ऑटो-स्क्रैप या बल्क-इम्पोर्ट नहीं होती। प्रकाशित होने के बाद यह एक निरंतर दो-स्तरीय सत्यापन पाइपलाइन से गुज़रती है: एक ऑटोमेटेड क्रॉलर समय-समय पर जांचता है कि आधिकारिक लिंक अभी काम कर रहा है, जबकि Groq AI की एक प्रक्रिया योजना की तारीखों की लाइव अधिसूचना से तुलना करके उन योजनाओं को पकड़ती है जो चुपचाप समाप्त हो गई, बढ़ाई गई या बदल गई हैं। किसी भी जांच में फ़्लैग की गई योजना सुधार या हटाने के लिए मैन्युअल समीक्षा कतार में भेज दी जाती है — इस तरह डेटा की सटीकता लाइव होने के बाद भी सुधरती रहती है।",
    },

    // ── AI (4) ────────────────────────────────────────────────────────────────
    {
      cat: "ai",
      q: "AI सहायक कैसे काम करता है?",
      a: "AI सहायक Groq (LLaMA मॉडल) द्वारा संचालित है और हिंदी या English में किसी भी योजना के बारे में जवाब देता है, आपकी सेव की गई प्रोफाइल ऑब्जेक्ट को संदर्भ के रूप में उपयोग करते हुए व्यक्तिगत मार्गदर्शन देता है। यह नवीनतम डेडलाइन और अपडेट के लिए हमारे स्टोर किए गए डेटाबेस से आगे जाकर रीयल-टाइम वेब सर्च भी ट्रिगर कर सकता है।",
    },
    {
      cat: "ai",
      q: "प्रतिदिन कितने AI संदेश मिलते हैं?",
      a: "फ्री अकाउंट में प्रतिदिन 10 AI संदेश मिलते हैं — यह हर अकाउंट के लिए सर्वर-साइड ट्रैक होने वाला एक रोलिंग काउंटर है, जो मध्यरात्रि IST पर रीसेट होता है। YojanaSahay Pro (जल्द आ रहा है) में अधिक सीमा और प्राथमिकता जवाब होंगे।",
    },
    {
      cat: "ai",
      q: "क्या AI आवेदन फॉर्म भरने में मदद करता है?",
      a: "हाँ — AI आवश्यक दस्तावेज और फॉर्म भरने के चरण चरण-दर-चरण समझाता है। फॉर्म जमा करना आपको आधिकारिक सरकारी पोर्टल पर करना होगा — AI आपकी ओर से जमा नहीं कर सकता।",
    },
    {
      cat: "ai",
      q: "क्या AI इंटरनेट सर्च करता है?",
      a: "हाँ। AI Tavily के लाइव वेब सर्च API का उपयोग करके योजना की डेडलाइन, आवेदन विंडो और हालिया सरकारी अपडेट की रीयल-टाइम जानकारी लाता है — हमारे स्थिर डेटाबेस से भी आगे।",
    },

    // ── Account (4) ───────────────────────────────────────────────────────────
    {
      cat: "account",
      q: "क्या अकाउंट बनाना ज़रूरी है?",
      a: "नहीं। बिना साइन इन के भी योजनाएं देख सकते हैं और पात्रता जांच सकते हैं। मुफ़्त Google साइन-इन (Firebase Authentication के ज़रिए) से आपकी प्रोफाइल आपके अकाउंट UID के अंतर्गत Firestore में सेव होती है, परिणाम व्यक्तिगत मिलते हैं, सपोर्ट अनुरोध ट्रैक होते हैं और AI सहायक का उपयोग होता है।",
    },
    {
      cat: "account",
      q: "कौन-सी भाषाएं समर्थित हैं?",
      a: "English और हिंदी। हर योजना रिकॉर्ड और UI टेक्स्ट हमारे डेटाबेस में एक द्विभाषी फ़ील्ड-जोड़े के रूप में सेव है, रनटाइम पर मशीन-अनुवाद नहीं होता — इसलिए EN / हिं टॉगल से भाषा बदलना तुरंत होता है। भविष्य के अपडेट में और क्षेत्रीय भाषाएं जोड़ी जाएंगी।",
    },
    {
      cat: "account",
      q: "क्या Pro संस्करण आ रहा है?",
      a: "हाँ! YojanaSahay Pro विकास में है — अधिक AI संदेश सीमा, प्राथमिकता सहायता, उन्नत योजना ट्रैकिंग और अधिक। अभी साइन इन करें — लॉन्च पर पहले सूचित हों।",
    },
    {
      cat: "account",
      q: "बग या गलत योजना डेटा कैसे रिपोर्ट करें?",
      a: "प्रोफाइल टैब में 'समस्या रिपोर्ट करें' बटन का उपयोग करें (लॉगिन आवश्यक), या yojanasahayofficial@gmail.com पर ईमेल करें। रिपोर्ट हमारी सपोर्ट कतार में डिवाइस और ब्राउज़र मेटाडेटा के साथ स्वचालित रूप से लॉग होती है, जिससे समस्या को दोबारा पहचानना आसान होता है। बग रिपोर्ट पर 48 घंटे में जवाब और सत्यापित योजना डेटा सुधार 24 घंटे में लाइव।",
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
        transition:  "transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        transform:   open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── CATEGORY ICON SVG ────────────────────────────────────────────────────────
function CategoryIcon({ catId, size = 12, color = "currentColor" }) {
  const shared = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: "2",
    strokeLinecap: "round", strokeLinejoin: "round",
    style: { flexShrink: 0, display: "block" },
  };
  if (catId === "about") return (
    <svg {...shared}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
  if (catId === "privacy") return (
    <svg {...shared}>
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
  if (catId === "schemes") return (
    <svg {...shared}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="12" y2="16"/>
    </svg>
  );
  if (catId === "ai") return (
    <svg {...shared}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
  if (catId === "account") return (
    <svg {...shared}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
  return (
    <svg {...shared}>
      <rect x="3"  y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3"  y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

// ─── NOTE ICON SVG ────────────────────────────────────────────────────────────
function NoteIcon({ size = 10, color = "currentColor" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01" strokeWidth="3"/>
    </svg>
  );
}

// ─── ANSWER RENDERER ─────────────────────────────────────────────────────────
// v6: receives `dark` as 6th param (was reading undefined from module scope)
// v6: note block gets a prominent left border stripe instead of top header bar
function renderAnswer(a, cc, th, bf, isHindi, dark) {
  const isObj    = a && typeof a === "object";
  const mainText = isObj ? a.text : a;
  const noteText = isObj ? a.note : null;

  return (
    <div style={{ flex: 1, paddingTop: 1 }}>
      {/* Main answer text */}
      <div style={{
        fontSize:   12.5,
        color:      th.textMid,
        lineHeight: 1.75,
        fontFamily: bf,
        letterSpacing: 0.1,
      }}>
        {mainText}
      </div>

      {/* Note block — v6: left stripe + cleaner layout */}
      {noteText && (
        <div style={{
          marginTop:    12,
          borderRadius: "0 8px 8px 0",
          overflow:     "hidden",
          borderLeft:   `3px solid ${cc}`,
          background:   dark ? `${cc}0D` : `${cc}07`,
          boxShadow:    `inset 0 0 0 1px ${cc}1C`,
        }}>
          {/* Label row */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        5,
            padding:    "5px 10px 4px",
          }}>
            <NoteIcon size={10} color={cc} />
            <span style={{
              fontSize:      9.5,
              fontWeight:    800,
              color:         cc,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              fontFamily:    bf,
            }}>
              {isHindi ? "ध्यान दें" : "Note"}
            </span>
          </div>
          {/* Body */}
          <div style={{
            padding:    "0 10px 9px",
            fontSize:   11.5,
            lineHeight: 1.65,
            color:      th.textMid,
            fontFamily: bf,
          }}>
            {noteText}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomeFAQSection({ lang, dark }) {
  const [openIdx,   setOpenIdx]   = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [feedbackState, setFeedbackState] = useState({});

  // ── FAQ feedback — logs 👍/👎 votes to Firestore faqFeedback collection ──
  const logFeedback = async (faqId, cat, vote) => {
    setFeedbackState(prev => ({ ...prev, [faqId]: vote }));
    try {
      // Signed-in users get their Firebase UID.
      // Guests get a stable "anon_xxxxxxxx" ID for this browser session —
      // stored in sessionStorage so the same guest doesn't double-vote
      // across questions, and clears automatically when the tab closes.
      let uid = getAuth().currentUser?.uid;
      if (!uid) {
        uid = sessionStorage.getItem("ys_anon_faq_id");
        if (!uid) {
          uid = "anon_" + Math.random().toString(36).slice(2, 10);
          sessionStorage.setItem("ys_anon_faq_id", uid);
        }
      }
      const docId = `${faqId}__${uid}`;
      await setDoc(doc(db, "faqFeedback", docId), {
        faqId,
        cat,
        vote,           // 'up' or 'down'
        lang,
        uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn("FAQ feedback log failed:", e);
    }
  };

  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const allFaqs = FAQ_DATA[lang] || FAQ_DATA.en;

  // v7 bugfix: accordion content height was a hardcoded `maxHeight: 700`,
  // which silently clipped any answer (esp. answers with a `note` block, or
  // Hindi text — which runs noticeably longer than English for the same
  // content) that happened to render taller than 700px, with no scroll
  // affordance. Fixed below by measuring each item's real content height via
  // ref + scrollHeight instead of guessing a fixed number.
  const itemRefs = useRef([]);

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

  // Android hardware back button — collapse open item instead of navigating away
  //
  // v7 bugfix: the old version called pushState on every openIdx change, so
  // switching between open FAQ rows (A open -> tap B -> A closes, B opens)
  // pushed a NEW history entry each time. After browsing a few questions,
  // the user had to press back several extra times before it actually left
  // the screen. Fix: push exactly ONE entry for the whole "something is
  // open" session (tracked via a ref, not state, so it doesn't re-trigger
  // renders), and pop it ourselves if the user closes by tapping instead of
  // by pressing back.
  const openIdxRef = useRef(openIdx);
  openIdxRef.current = openIdx;
  const faqHistoryPushed = useRef(false);

  // Single, stable popstate listener — mounted once, not re-subscribed on
  // every openIdx change.
  useEffect(() => {
    const handlePopState = () => {
      if (openIdxRef.current !== null) {
        faqHistoryPushed.current = false;
        setOpenIdx(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Push/pop our single history entry in step with the open/closed boundary.
  useEffect(() => {
    if (openIdx !== null && !faqHistoryPushed.current) {
      faqHistoryPushed.current = true;
      window.history.pushState({ ysFaq: true }, "");
    } else if (openIdx === null && faqHistoryPushed.current) {
      faqHistoryPushed.current = false;
      window.history.back();
    }
  }, [openIdx]);

  // Pill config
  const pills = [
    {
      id:    "all",
      label: isHindi ? `सभी (${allFaqs.length})` : `All (${allFaqs.length})`,
      color: dark ? "#6B90FF" : NAVY,
    },
    ...Object.entries(CAT_CONFIG).map(([id, cfg]) => ({
      id,
      label: isHindi ? cfg.hi : cfg.en,
      color: dark ? cfg.darkColor : cfg.color,
    })),
  ];

  // ── Title gradient string (CSS background-clip trick) ──────────────────────
  const titleGrad = dark
    ? "linear-gradient(135deg, #6B90FF 0%, #A5C0FF 55%, #C8DAFF 100%)"
    : `linear-gradient(135deg, ${NAVY} 0%, #1a5bbf 55%, #2e72d2 100%)`;

  return (
    <div style={{ marginBottom: 14 }}>

      {/* ── Global styles ── */}
      <style>{`
        .ys-faq-pills::-webkit-scrollbar { display: none; }

        /* Accordion entrance */
        @keyframes ys-faq-in {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .ys-faq-item {
          animation: ys-faq-in 0.24s cubic-bezier(0.25,0.46,0.45,0.94) both;
        }

        /* Tiranga stripe shimmer */
        @keyframes ys-stripe-shimmer {
          0%   { opacity: 0.75; }
          50%  { opacity: 1;    }
          100% { opacity: 0.75; }
        }
        .ys-faq-stripe {
          animation: ys-stripe-shimmer 4s ease-in-out infinite;
        }

        /* Touch feedback on rows — the single source of truth for press
           feedback (previously duplicated by onTouchStart/End handlers that
           mutated DOM style directly, fighting this !important rule and
           risking a stuck style if touchend/touchcancel ever didn't fire).
           A flat mid-tone works in both themes, so no light/dark branching
           is needed here. */
        .ys-faq-row:active {
          background: rgba(127,127,127,0.14) !important;
          transform: scale(0.993);
        }

        /* Keyboard focus — buttons have no visible default ring set via
           inline styles, so a11y focus rings are added explicitly here.
           :focus-visible means mouse/touch taps don't show a ring, only
           keyboard (Tab) navigation does. */
        .ys-faq-row:focus-visible,
        .ys-faq-pill:focus-visible {
          outline: 2px solid ${dark ? "#6B90FF" : NAVY};
          outline-offset: 2px;
        }
        .ys-faq-row:focus-visible { outline-offset: -2px; }

        .ys-faq-mail:hover,
        .ys-faq-mail:focus-visible { text-decoration: underline; }
        .ys-faq-mail:focus-visible {
          outline: 2px solid ${dark ? "#6B90FF" : NAVY};
          outline-offset: 2px;
          border-radius: 3px;
        }
      `}</style>

      {/* ── Section label — v6: left accent bar ── */}
      <div style={{
        display:       "flex",
        alignItems:    "center",
        gap:           8,
        marginBottom:  10,
      }}>
        {/* Left accent bar */}
        <div style={{
          width:        3,
          height:       28,
          borderRadius: 2,
          flexShrink:   0,
          background:   dark
            ? `linear-gradient(180deg, #6B90FF 0%, ${SAFFRON} 100%)`
            : `linear-gradient(180deg, ${NAVY} 0%, ${SAFFRON} 100%)`,
        }} />
        <div>
          <div style={{
            fontSize:      11,
            fontWeight:    800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            fontFamily:    bf,
            background:    dark
              ? "linear-gradient(90deg, #6B90FF 0%, #A5BBFF 100%)"
              : `linear-gradient(90deg, ${NAVY} 0%, #2060C8 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>
            {isHindi ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
          </div>
          <div style={{
            fontSize:   9.5,
            color:      th.textSub,
            fontFamily: bf,
            marginTop:  1,
          }}>
            {isHindi
              ? `${allFaqs.length} सवाल · ${Object.keys(CAT_CONFIG).length} श्रेणियां`
              : `${allFaqs.length} answers · ${Object.keys(CAT_CONFIG).length} categories`}
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div style={{
        background:   th.card,
        borderRadius: 18,
        overflow:     "hidden",
        border:       `1.5px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,53,128,0.10)"}`,
        boxShadow:    dark
          ? "0 4px 24px rgba(0,0,0,0.30), 0 1px 4px rgba(0,0,0,0.20)"
          : "0 4px 24px rgba(0,53,128,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      }}>

        {/* ── Tiranga gradient top stripe ── */}
        <div
          className="ys-faq-stripe"
          style={{
            height:     3,
            background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY} 30%, ${SAFFRON} 50%, ${GREEN} 70%, ${GREEN} 100%)`,
          }}
        />

        {/* ── Card header — v6: dot-grid bg, gradient title ── */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          11,
          padding:      "14px 15px 13px",
          borderBottom: `1px solid ${th.divider}`,
          background:   dark
            ? `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px) 0 0 / 18px 18px, rgba(255,255,255,0.015)`
            : `radial-gradient(circle, rgba(0,53,128,0.04) 1px, transparent 1px) 0 0 / 18px 18px, rgba(0,53,128,0.018)`,
        }}>

          {/* Shield icon — v6: glow ring on dark */}
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   11,
            flexShrink:     0,
            background:     dark
              ? "rgba(0,53,128,0.28)"
              : "rgba(0,53,128,0.07)",
            border:         `1.5px solid ${dark ? "rgba(107,144,255,0.35)" : "rgba(0,53,128,0.14)"}`,
            boxShadow:      dark
              ? "0 0 0 3px rgba(107,144,255,0.10), 0 2px 10px rgba(0,53,128,0.40)"
              : "0 2px 8px rgba(0,53,128,0.10)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill={dark ? "#6B90FF" : NAVY}
                opacity="0.92"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Gradient title */}
            <div style={{
              fontSize:             13,
              fontWeight:           800,
              fontFamily:           bf,
              lineHeight:           1.2,
              background:           titleGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}>
              {isHindi ? "आपके सवाल, हमारे जवाब" : "Your Questions, Answered"}
            </div>
            <div style={{
              fontSize:   10,
              color:      th.textSub,
              marginTop:  3,
              fontFamily: bf,
              lineHeight: 1.3,
            }}>
              {isHindi
                ? "Firebase Auth · MIT लाइसेंस · सरकारी लिंक"
                : "Firebase Auth · MIT Licensed · Govt links only"}
            </div>
          </div>

          {/* Count pill */}
          <div style={{
            background:   dark
              ? "rgba(255,153,51,0.18)"
              : "rgba(255,153,51,0.12)",
            border:       `1px solid ${dark ? "rgba(255,153,51,0.40)" : "rgba(255,153,51,0.30)"}`,
            borderRadius: 20,
            padding:      "4px 10px",
            fontSize:     10,
            fontWeight:   800,
            color:        dark ? SAFFRON : "#C97400",
            fontFamily:   bf,
            flexShrink:   0,
            letterSpacing: 0.3,
          }}>
            {filteredFaqs.length} {isHindi ? "सवाल" : "Q&A"}
          </div>
        </div>

        {/* ── Category filter pills — v6: gradient active fill, glow ── */}
        <div
          className="ys-faq-pills"
          role="group"
          aria-label={isHindi ? "श्रेणी फ़िल्टर" : "Category filter"}
          style={{
            display:                 "flex",
            gap:                     6,
            padding:                 "11px 15px",
            overflowX:               "auto",
            WebkitOverflowScrolling: "touch",
            borderBottom:            `1px solid ${th.divider}`,
            msOverflowStyle:         "none",
            scrollbarWidth:          "none",
          }}
        >
          {pills.map((pill) => {
            const active = filterCat === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                className="ys-faq-pill"
                onClick={() => handleFilter(pill.id)}
                aria-pressed={active}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     5,
                  padding:                 "5px 12px",
                  borderRadius:            20,
                  flexShrink:              0,
                  fontSize:                10.5,
                  fontWeight:              700,
                  cursor:                  "pointer",
                  fontFamily:              bf,
                  margin:                  0,
                  appearance:              "none",
                  WebkitAppearance:        "none",
                  background:              active
                    ? `linear-gradient(135deg, ${pill.color}22 0%, ${pill.color}12 100%)`
                    : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.028)"),
                  color:                   active ? pill.color : th.textSub,
                  border:                  `1.5px solid ${active ? `${pill.color}55` : th.border}`,
                  boxShadow:               active
                    ? `0 0 0 3px ${pill.color}10, 0 1px 6px ${pill.color}18`
                    : "none",
                  WebkitTapHighlightColor: "transparent",
                  transition:              "background 0.20s, color 0.20s, border-color 0.20s, box-shadow 0.22s, transform 0.12s",
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.93)"; }}
                onTouchEnd={(e)   => { e.currentTarget.style.transform = "scale(1)";    }}
                onTouchCancel={(e)=> { e.currentTarget.style.transform = "scale(1)";    }}
              >
                <CategoryIcon catId={pill.id} size={10} color={active ? pill.color : th.textSub} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Accordion items ── */}
        {filteredFaqs.map((faq, i, arr) => {
          const isOpen  = openIdx === i;
          const isLast  = i === arr.length - 1;
          const cc      = catColor(faq.cat);
          const showCatHeader =
            filterCat === "all" && (i === 0 || arr[i - 1].cat !== faq.cat);
          const qId = `faq-q-${filterCat}-${faq.cat}-${i}`;
          const aId = `faq-a-${filterCat}-${faq.cat}-${i}`;

          return (
            <div
              key={`${filterCat}-${faq.cat}-${i}`}
              className="ys-faq-item"
              style={{ animationDelay: `${Math.min(i, 6) * 25}ms` }}
            >
              {/* ── Category section divider (All view only) ── */}
              {showCatHeader && (() => {
                const cfg      = CAT_CONFIG[faq.cat];
                const hdrColor = dark ? cfg.darkColor : cfg.color;
                return (
                  <div style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        9,
                    padding:    i === 0 ? "11px 15px 8px" : "16px 15px 8px",
                    background: dark
                      ? `linear-gradient(90deg, ${hdrColor}16 0%, transparent 65%)`
                      : `linear-gradient(90deg, ${hdrColor}0D 0%, transparent 65%)`,
                  }}>
                    <div style={{
                      width:          22,
                      height:         22,
                      borderRadius:   7,
                      flexShrink:     0,
                      background:     `${hdrColor}1E`,
                      border:         `1.5px solid ${hdrColor}32`,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                    }}>
                      <CategoryIcon catId={faq.cat} size={11} color={hdrColor} />
                    </div>
                    <span style={{
                      fontSize:      9.5,
                      fontWeight:    800,
                      color:         hdrColor,
                      letterSpacing: 0.9,
                      textTransform: "uppercase",
                      fontFamily:    bf,
                    }}>
                      {isHindi ? cfg.hi : cfg.en}
                    </span>
                    <div style={{
                      flex:       1,
                      height:     1,
                      background: `linear-gradient(90deg, ${hdrColor}30 0%, transparent 100%)`,
                    }} />
                  </div>
                );
              })()}

              {/* ── Question row — v6: left accent stripe, more padding ── */}
              <button
                type="button"
                className="ys-faq-row"
                id={qId}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={aId}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     11,
                  width:                   "100%",
                  padding:                 "14px 15px 14px 12px",
                  margin:                  0,
                  border:                  "none",
                  appearance:              "none",
                  WebkitAppearance:        "none",
                  textAlign:               "left",
                  font:                    "inherit",
                  color:                   "inherit",
                  cursor:                  "pointer",
                  background:              isOpen
                    ? (dark ? `${cc}14` : `${cc}07`)
                    : "transparent",
                  borderLeft:              isOpen ? `3px solid ${cc}` : "3px solid transparent",
                  borderBottom:            !isOpen && !isLast
                    ? `1px solid ${th.divider}`
                    : "none",
                  WebkitTapHighlightColor: "transparent",
                  userSelect:              "none",
                  transition:              "background 0.22s, border-left-color 0.22s, transform 0.12s",
                }}
              >
                {/* Category icon badge */}
                <div style={{
                  width:          34,
                  height:         34,
                  borderRadius:   10,
                  flexShrink:     0,
                  background:     isOpen
                    ? `${cc}1E`
                    : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                  border:         `1.5px solid ${
                    isOpen
                      ? `${cc}48`
                      : (dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)")
                  }`,
                  boxShadow:      isOpen
                    ? `0 0 0 3px ${cc}12, 0 2px 10px ${cc}1E`
                    : "none",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  transition:     "background 0.22s, border-color 0.22s, box-shadow 0.26s, transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
                  transform:      isOpen ? "scale(1.10)" : "scale(1)",
                }}>
                  <CategoryIcon
                    catId={faq.cat}
                    size={15}
                    color={isOpen ? cc : (dark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.22)")}
                  />
                </div>

                {/* Question text */}
                <div style={{
                  flex:       1,
                  fontSize:   13,
                  fontWeight: isOpen ? 700 : 600,
                  color:      isOpen ? cc : th.text,
                  fontFamily: bf,
                  lineHeight: 1.35,
                  transition: "color 0.22s",
                  letterSpacing: 0.05,
                }}>
                  {faq.q}
                </div>

                <Chevron color={isOpen ? cc : th.textSub} open={isOpen} />
              </button>

              {/* ── Answer panel — maxHeight CSS accordion ── */}
              <div
                id={aId}
                role="region"
                aria-labelledby={qId}
                aria-hidden={!isOpen}
                style={{
                  maxHeight:  isOpen ? `${itemRefs.current[i]?.scrollHeight ?? 2000}px` : "0px",
                  overflow:   "hidden",
                  transition: "max-height 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                <div
                  ref={(el) => { itemRefs.current[i] = el; }}
                  style={{
                  display:        "flex",
                  flexDirection:  "column",
                  borderBottom:   !isLast ? `1px solid ${th.divider}` : "none",
                  background:     dark ? `${cc}0A` : `${cc}05`,
                  opacity:        isOpen ? 1 : 0,
                  transition:     "opacity 0.20s ease 0.10s",
                }}>

                  {/* Badge + Answer row */}
                  <div style={{
                    display: "flex",
                    gap:     10,
                    padding: "2px 15px 12px 15px",
                  }}>

                  {/* "A" badge — v6: circle monogram with gradient ring */}
                  <div style={{
                    width:          26,
                    height:         26,
                    borderRadius:   13,
                    flexShrink:     0,
                    marginTop:      2,
                    background:     `linear-gradient(135deg, ${cc}28 0%, ${cc}14 100%)`,
                    border:         `1.5px solid ${cc}45`,
                    boxShadow:      `0 0 0 2px ${cc}10`,
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
                  {renderAnswer(faq.a, cc, th, bf, isHindi, dark)}
                  </div>

                  {/* ── Was this helpful? feedback bar (v8) ── */}
                  {(() => {
                    const globalIdx = allFaqs.indexOf(faq);
                    const faqId     = `${lang}_${faq.cat}_${globalIdx}`;
                    const voted     = feedbackState[faqId] || null;
                    return (
                      <div style={{
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "space-between",
                        padding:        "7px 15px 11px",
                        borderTop:      `1px solid ${cc}20`,
                      }}>
                        <span style={{
                          fontSize:   10,
                          color:      voted ? cc : th.textSub,
                          fontFamily: bf,
                          fontWeight: voted ? 700 : 600,
                          transition: "color 0.22s",
                        }}>
                          {voted
                            ? (isHindi ? "धन्यवाद! 🙏" : "Thanks for your feedback!")
                            : (isHindi ? "क्या यह उपयोगी था?" : "Was this helpful?")}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          {["up", "down"].map((v) => {
                            const isChosen = voted === v;
                            const emoji    = v === "up" ? "👍" : "👎";
                            return (
                              <button
                                key={v}
                                type="button"
                                disabled={!!voted}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!voted) logFeedback(faqId, faq.cat, v);
                                }}
                                style={{
                                  display:        "flex",
                                  alignItems:     "center",
                                  justifyContent: "center",
                                  width:          30,
                                  height:         30,
                                  borderRadius:   9,
                                  border:         `1.5px solid ${isChosen ? cc : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")}`,
                                  background:     isChosen
                                    ? `${cc}22`
                                    : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)"),
                                  fontSize:       15,
                                  lineHeight:     1,
                                  padding:        0,
                                  margin:         0,
                                  cursor:         voted ? "default" : "pointer",
                                  opacity:        voted && !isChosen ? 0.30 : 1,
                                  transition:     "background 0.18s, border-color 0.18s, opacity 0.22s, transform 0.12s",
                                  WebkitTapHighlightColor: "transparent",
                                  transform:      isChosen ? "scale(1.15)" : "scale(1)",
                                  boxShadow:      isChosen ? `0 0 0 3px ${cc}18` : "none",
                                }}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          );
        })}

        {/* ── Footer — v6: Tiranga tint gradient + cleaner CTA ── */}
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        10,
          padding:    "12px 15px",
          background: dark
            ? `linear-gradient(135deg, rgba(0,53,128,0.14) 0%, rgba(255,153,51,0.07) 100%)`
            : `linear-gradient(135deg, rgba(0,53,128,0.045) 0%, rgba(255,153,51,0.025) 100%)`,
          borderTop:  `1px solid ${th.divider}`,
        }}>
          {/* Mail icon in a pill */}
          <div style={{
            width:          28,
            height:         28,
            borderRadius:   8,
            flexShrink:     0,
            background:     dark ? "rgba(107,144,255,0.14)" : "rgba(0,53,128,0.07)",
            border:         `1px solid ${dark ? "rgba(107,144,255,0.28)" : "rgba(0,53,128,0.12)"}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={dark ? "#6B90FF" : NAVY} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize:   11,
              fontWeight: 600,
              color:      th.textMid,
              fontFamily: bf,
              lineHeight: 1.3,
            }}>
              {isHindi ? "और सवाल हैं?" : "Still have questions?"}
            </div>
            <a
              href="mailto:yojanasahayofficial@gmail.com"
              className="ys-faq-mail"
              style={{
                display:       "inline-block",
                fontSize:      10,
                fontWeight:    700,
                color:         dark ? "#6B90FF" : NAVY,
                fontFamily:    bf,
                marginTop:     2,
                letterSpacing: 0.1,
                textDecoration: "none",
              }}
            >
              yojanasahayofficial@gmail.com
            </a>
          </div>

          {/* Reply-time badge */}
          <div style={{
            background:   dark ? "rgba(19,136,8,0.18)" : "rgba(19,136,8,0.10)",
            border:       `1px solid ${dark ? "rgba(74,222,128,0.30)" : "rgba(19,136,8,0.20)"}`,
            borderRadius: 12,
            padding:      "3px 8px",
            fontSize:     9.5,
            fontWeight:   700,
            color:        dark ? "#4ADE80" : GREEN,
            fontFamily:   bf,
            flexShrink:   0,
            whiteSpace:   "nowrap",
          }}>
            {isHindi ? "48 घंटे में जवाब" : "Reply in 48h"}
          </div>
        </div>

      </div>
    </div>
  );
}
