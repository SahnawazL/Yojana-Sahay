/**
 * YojanaSahay — AboutTab.jsx
 * Premium Civic About Screen · v2.0
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Drop-in component: <AboutTab lang={lang} dark={dark} />
 * See the LICENSE file in the project root for full license terms.
 */

import { useState, useEffect } from "react";
import appLogo from "./logo.webp";
import shzLogo from "./shzLogo.png";

// ─── SECURITY HELPER ──────────────────────────────────────────────────────────
// Prevents reverse tabnapping: sets noopener+noreferrer and nullifies opener
const safeOpen = (url) => {
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) win.opener = null;
};

// ─── BRAND COLORS ─────────────────────────────────────────────────────────────
const SAFFRON     = "#FF9933";
const NAVY        = "#003580";
const IND_GREEN   = "#138808";
const ASHOKA_BLUE = "#06038D";
const PRO_GOLD    = "#C9A84C";   // Prestige gold
const PRO_GOLD_LT = "#F0D87A";   // Champagne highlight
const PRO_GOLD_DK = "#7A5C1E";   // Deep aged gold

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const R = { sm: 10, md: 14, lg: 20, xl: 26 };
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

// ─── NON-TRANSLATED CONSTANTS ─────────────────────────────────────────────────
const PLATFORM_ID   = "Platform ID: YSH-2026-IND · MIT Licensed · Beta";
const DEV_WEBSITE   = "https://sahnawaz-portfolio.vercel.app";
const CONTACT_EMAIL = "yojanasahayofficial@gmail.com";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    appBg:    "#EEF1FA",
    card:     "#FFFFFF",
    card2:    "#F6F8FE",
    text:     "#0A1230",
    textMid:  "#334170",
    textSub:  "#7A88A8",
    textLight:"#C0CCDE",
    border:   "#DDE4F4",
    border2:  "#CAD5EB",
    divider:  "#ECF0FA",
    shadowSm: "0 1px 3px rgba(10,18,48,0.06)",
    shadowMd: "0 2px 8px rgba(10,18,48,0.05), 0 12px 32px rgba(10,18,48,0.05)",
    shadowLg: "0 4px 16px rgba(10,18,48,0.07), 0 24px 56px rgba(10,18,48,0.07)",
  },
  dark: {
    appBg:    "#060C1C",
    card:     "#0C1528",
    card2:    "#111E35",
    text:     "#EBF0FF",
    textMid:  "#8696BE",
    textSub:  "#4A5A7A",
    textLight:"#1A2840",
    border:   "#172038",
    border2:  "#1E2E4C",
    divider:  "#0F1A2E",
    shadowSm: "none",
    shadowMd: "none",
    shadowLg: "none",
  },
};

const fontFamily = (lang) =>
  lang === "hi"
    ? "'Noto Sans Devanagari', 'DM Sans', sans-serif"
    : "'DM Sans', 'Noto Sans', sans-serif";

// ─── BILINGUAL STRINGS ────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    appName:      "YojanaSahay",
    tagline:      "India's Free Scheme Discovery App",
    madeInIndia:  "Made in India 🇮🇳",
    version:      "Current Release · Beta",

    missionTitle: "Our Mission",
    missionBody:
      "YojanaSahay is dedicated to bridging the gap between Indian citizens and the government welfare ecosystem. Our platform ensures that every eligible citizen — regardless of location, language, or literacy level — can discover, understand, and access the schemes and benefits they rightfully deserve.",

    statsTitle: "Platform at a Glance",
    stats: [
      { number:"28+",  label:"States & UTs\nCovered" },
      { number:"50L+", label:"Citizens\nGuided" },
      { number:"2",    label:"Languages\nSupported" },
      { number:"100%", label:"Free to\nUse" },
    ],

    dbTitle: "Comprehensive Scheme Database",
    dbBody:
      "YojanaSahay indexes an extensive and continuously expanding catalogue of Central Government and State Government welfare schemes spanning across every state and union territory of India. Our dedicated team actively curates and updates scheme data to ensure accuracy, coverage, and relevance for citizens nationwide.",

    featuresTitle: "Core Capabilities",
    features: [
      {
        icon:"🔍", color:NAVY,
        title:"Smart Scheme Discovery",
        desc:"Search and browse across Central and State government schemes, filtered by category, state, and beneficiary type. Instant results with detailed eligibility, benefits, and application guidance.",
      },
      {
        icon:"🎯", color:SAFFRON,
        title:"Eligibility Checker",
        desc:"A smart adaptive questionnaire that reads your occupation, income, and state — then instantly surfaces every scheme you qualify for, eliminating guesswork. Backed by AI guidance so you know exactly what to do next.",
      },
      {
        icon:"🤖", color:"#8B5CF6",
        title:"AI Assistant",
        desc:"A real-time AI-powered assistant for scheme queries in Hindi and English. Provides personalised guidance, scheme comparisons, eligibility clarification, and actionable next steps.",
      },
      {
        icon:"📬", color:IND_GREEN,
        title:"Report & Resolution Centre",
        desc:"An in-app support system for submitting bugs, scheme requests, general queries, and feedback. Every submission is reviewed by the YojanaSahay team with status tracking and direct team response.",
      },
    ],

    aiTitle:    "AI Assistant — Powered by Groq",
    aiSubtitle: "Intelligent · Bilingual · Personalised",
    aiPoints: [
      { icon:"🌐", text:"Fully bilingual — converse in Hindi or English, naturally" },
      { icon:"🎯", text:"Personalised responses based on your saved profile and state" },
      { icon:"💡", text:"Smart follow-up suggestions to guide deeper discovery" },
      { icon:"📖", text:"Designed for reading-friendly pacing for all users" },
      { icon:"🔒", text:"Per-account conversation history — private and isolated" },
      { icon:"⚡", text:"Powered by Groq AI for high-speed, accurate responses" },
      { icon:"📊", text:"Get AI-powered guidance on your eligibility checker results — understand why you qualify and what to do next" },
    ],

    proTitle:    "YojanaSahay Pro",
    proEyebrow:  "COMING SOON",
    proSubtitle: "Launching with Play Store & App Store",
    proBody:
      "YojanaSahay is currently free for all users. A Pro tier is coming for power users who rely on the AI assistant daily — with unlimited AI messages and premium features designed for serious scheme hunters.",
    proFeatures: [
      { icon:"🤖", title:"AI Messages",              desc:"Daily limit for the AI Chat assistant.",                                                                                        free:"10 / day",   pro:"Unlimited" },
      { icon:"📄", title:"PDF Export",                desc:"Download your eligibility results as a ready-to-use PDF for offline use and CSC visits.",                                     free:"✗",          pro:"✓" },
      { icon:"👨‍👩‍👧‍👦", title:"Family Profiles",           desc:"Add family members and check eligibility for each one separately.",                                                        free:"1 profile",  pro:"Unlimited" },
      { icon:"🎯", title:"Deep Eligibility Matching", desc:"Precision match using all 15+ parameters — ration card, disability, kisan card, land holding, and more.",                    free:"✗",          pro:"✓" },
      { icon:"📋", title:"Application Tracker",       desc:"Mark schemes as Interested → Applied → Received and track progress.",                                                         free:"✗",          pro:"✓" },
      { icon:"📦", title:"Document Checklist",        desc:"One consolidated list of every document you need across all matched schemes.",                                                 free:"Basic",      pro:"Advanced" },
      { icon:"🔔", title:"Deadline Alerts",           desc:"Real email and push notifications for approaching scheme deadlines, filtered by your state and category.",                    free:"Basic",      pro:"Real alerts" },
      { icon:"⭐", title:"Priority Support",          desc:"Pro reports get a Priority badge and are reviewed first — your queries go to the top of the queue.",                          free:"Standard",   pro:"Priority" },
    ],
    proPricingTitle: "Pricing",
    proMonthly:      "₹49 / month",
    proYearly:       "₹399 / year",
    proSaveLabel:    "Save 32%",
    proPricingNote:  "Pricing and payment options will be announced at launch. Payments via UPI, cards, and net banking.",
    proLoginTitle:   "Login Required for AI Chat",
    proLoginNotice:
      "Once YojanaSahay Pro launches, signing in with Google will be mandatory to access the AI Chat tab. This links your daily usage count and Pro benefits directly to your account — ensuring fair access for free users and full access for Pro.",

    signInTitle: "Benefits of Signing In",
    signInSub:   "Creating an account unlocks the full YojanaSahay experience.",
    signInPoints: [
      { icon:"🎯", title:"Personalised Scheme Matching",    desc:"The eligibility checker and AI use your profile to surface schemes most relevant to you." },
      { icon:"🤖", title:"Profile-Aware AI Responses",      desc:"The AI assistant tailors every recommendation based on your age, income, state, and occupation." },
      { icon:"📬", title:"Report Tracking & Admin Replies", desc:"Track the status of your submissions — Open, In Progress, or Resolved — with full conversation threads." },
      { icon:"✅", title:"Verified Identity Submissions",   desc:"Your reports carry a verified badge, ensuring priority handling by the support team." },
      { icon:"📩", title:"Email Confirmation & Alerts",     desc:"Receive automatic email confirmation on submission and be notified when the team responds." },
    ],

    reportTitle:    "Report, Query & Resolution",
    reportSubtitle: "Every Submission is Accounted For",
    reportBody:
      "YojanaSahay maintains a built-in, end-to-end support and resolution system directly within the app. Citizens and users may submit any of the following:",
    reportTypes: [
      { icon:"🐛", color:"#DC2626", label:"Bug / Issue Report",     desc:"Report technical issues or unexpected behaviour in the app." },
      { icon:"📋", color:NAVY,      label:"Scheme Addition Request", desc:"Request the addition of a scheme not yet listed on the platform." },
      { icon:"❓", color:IND_GREEN, label:"General Query",           desc:"Submit a question or request for assistance regarding any scheme or feature." },
      { icon:"💡", color:SAFFRON,   label:"Feedback & Suggestions",  desc:"Share suggestions to improve the platform for citizens across India." },
    ],
    reportFlow:
      "All submissions are stored securely and reviewed by the YojanaSahay priority support team. Logged-in users receive automatic email confirmation upon submission and are notified when the team provides a full response. Status transitions — Open → In Progress → Resolved — are visible in real time within the app.",

    legalTitle:  "Legal & Disclaimer",
    legalPoints: [
      "YojanaSahay is an independent digital platform for government scheme discovery and is not affiliated with, endorsed by, or representative of any Central or State Government body or ministry.",
      "All scheme data is sourced from publicly available official government portals and communications. While we strive for accuracy, users are advised to verify scheme details directly from the respective government sources before applying.",
      "YojanaSahay does not facilitate direct scheme applications, financial transactions, or document processing. The platform serves solely as an informational and discovery service.",
    ],

    techTitle: "Technology & Infrastructure",
    techBody:  "YojanaSahay is engineered on a production-grade, security-first technology stack — combining proven cloud infrastructure, globally distributed deployment, and version-controlled development to ensure reliability, transparency, and performance for every citizen across India.",
    techStack: [
      { icon:"🔥", name:"Firebase",  role:"Authentication, Cloud Firestore Database & Real-time Sync",                                                     badge:null },
      { icon:"⚡", name:"Groq AI",   role:"AI Assistant — High-speed, Low-latency Inference Engine",                                                       badge:null },
      { icon:"📧", name:"EmailJS",   role:"Automated Email Confirmations & Support Alerts",                                                                 badge:null },
      { icon:"▲",  name:"Vercel",    role:"Global Deployment & Hosting — Edge Network ensures fast, secure delivery across India",                          badge:"Global Edge" },
      { icon:"🐙", name:"GitHub",    role:"Source Code & Version Control — Full development history, issue tracking, and secure build pipeline",            badge:"Open Dev" },
    ],

    privacyTitle:   "Privacy Policy",
    privacyEyebrow: "YOUR DATA & RIGHTS",
    privacyIntro:
      "YojanaSahay is committed to protecting your privacy. This policy explains how your data is collected, used, and safeguarded.",
    privacyPoints: [
      { icon:"🔒", text:"Data Collection & Purpose — We collect only the minimum data necessary: your name, email address, state, age range, income range, and occupation category. This information is used exclusively to power personalised eligibility results, AI recommendations, and scheme discovery within the app. We never collect data beyond what is required for your experience." },
      { icon:"🚫", text:"No Third-Party Sharing — We do not sell, rent, license, share, or disclose your personal information to any third-party individual, company, or organisation — under any circumstances, including commercial partnerships or advertising. YojanaSahay is, and will always remain, an entirely ad-free platform." },
      { icon:"☁️",  text:"Secure Cloud Storage — All user data is stored on Firebase, a Google Cloud platform that implements AES-256 encryption at rest and TLS 1.2+ encryption in transit. Firebase complies with major international security standards including ISO 27001, SOC 1, SOC 2, and SOC 3, and undergoes regular independent security audits." },
      { icon:"💬", text:"AI Conversation Privacy — Your conversations with the AI Assistant are stored securely in your private Firestore account, fully isolated from all other users. Your conversations are never shared with third parties, never disclosed publicly, and never used to train, fine-tune, or evaluate any external AI model or service." },
      { icon:"📧", text:"Email Usage Policy — Your email address is used strictly for: (a) account authentication via Firebase Auth, (b) automatic submission confirmations when you file a report or query, and (c) direct replies from the support team. We do not send newsletters, promotional campaigns, or any unsolicited marketing communications — ever." },
      { icon:"🛡️", text:"Data Access Controls — Access to your personal data is restricted exclusively to authorised platform administrators, and only when required to investigate or resolve a support request you have submitted. All administrative access is logged. Your data is never accessed, analysed, or processed for commercial, advertising, or profiling purposes." },
      { icon:"⚖️", text:"Your Rights, Protections & Compliance — YojanaSahay never uses tracking cookies, retargeting pixels, or behavioural profiling tools. The platform never collects sensitive identifiers such as Aadhaar numbers, PAN cards, bank account details, or biometric data — citizens are strongly advised never to share such information within the app. You have the right to access, correct, export, or permanently delete your data at any time by contacting yojanasahayofficial@gmail.com; all verified deletion requests are fulfilled within 30 calendar days. Any updates to this policy will be communicated within the app before taking effect. This policy is governed by the laws of India, including the Digital Personal Data Protection Act, 2023 (DPDPA), and any disputes shall be subject to the exclusive jurisdiction of competent courts in India." },
    ],

    devTitle:    "About the Developer",
    devName:     "Sahnawaz Ahmed Laskar",
    devRole:     "Full Stack Developer · UI/UX Designer",
    devLocation: "Silchar, Assam · India",
    devTagline:  "Conceived, architected, and deployed end-to-end — from cloud schema to the last animation frame. Every system design, every UI decision, every production release: owned by a single developer. Built to production standards. Built with the conviction that civic technology deserves nothing less than craft.",
    devTags:     ["React PWA", "Firebase", "Groq AI", "Vercel Edge", "UI/UX"],
    devLink:     "sahnawaz-portfolio.vercel.app →",

    contactTitle: "YojanaSahay Support",
    contactNote:  "For platform-related inquiries only. For scheme-specific support, please use the in-app Report & Query feature.",

    lastUpdated: "Last Updated · May 2026",

    whatsNewTitle: "What's New",
    whatsNew: [
      { version:"v1.3", date:"May 2026",   note:"Email & Google sign-in · Dark mode · Vercel edge deployment" },
      { version:"v1.2", date:"Mar 2026",   note:"Report & Resolution Centre · Admin dashboard · Email alerts" },
      { version:"v1.1", date:"Jan 2026",   note:"AI Assistant (Groq) · Bilingual support · Profile-aware responses" },
      { version:"v1.0", date:"Nov 2025",   note:"Initial public Beta · Eligibility checker · 3,000+ schemes indexed" },
    ],

    shareTitle: "Share YojanaSahay",
    shareBody:  "Know someone who could benefit from government schemes? Share this platform with them.",
    shareBtn:   "Share with Someone",

    ackTitle: "Acknowledgements",
    ackBody:  "YojanaSahay is built on open-source tools and publicly available resources. We gratefully acknowledge the following:",
    ackItems: [
      { icon:"⚛️",  name:"React",                note:"UI library — Meta Open Source" },
      { icon:"🇮🇳", name:"Digital India Spirit", note:"Built in the spirit of making government services more accessible to every Indian citizen" },
      { icon:"📖",  name:"Open Source Community",note:"The libraries and tools that power this platform, freely available to all developers" },
    ],

    grievanceTitle:   "User Support & Complaints",
    grievanceBody:    "YojanaSahay is committed to resolving every user concern promptly and transparently. Every submission made through the in-app Report & Query system receives an automatic confirmation email instantly. The platform administrator is notified immediately upon each submission and personally reviews every concern.",
    grievanceNote:    "Platform Administrator: Sahnawaz Ahmed Laskar",

    copyright:  "© 2026 Sahnawaz Ahmed Laskar · Open source under MIT License",
    footerNote: "YojanaSahay · An independent civic technology platform · India",
    platformId: PLATFORM_ID,
  },

  hi: {
    appName:      "योजना सहाय",
    tagline:      "निःशुल्क योजना सहायक",
    madeInIndia:  "मेड इन इंडिया 🇮🇳",
    version:      "वर्तमान संस्करण · Beta",

    missionTitle: "हमारा उद्देश्य",
    missionBody:
      "योजना सहाय भारत के नागरिकों और सरकारी कल्याण योजनाओं के बीच की दूरी को मिटाने के लिए समर्पित है। हमारा मंच यह सुनिश्चित करता है कि हर पात्र नागरिक — चाहे वह किसी भी स्थान, भाषा या शिक्षा स्तर का हो — अपने अधिकार की योजनाओं तक सरलता से पहुँच सके।",

    statsTitle: "प्लेटफ़ॉर्म एक नज़र में",
    stats: [
      { number:"28+",  label:"राज्य और\nकेंद्र शासित" },
      { number:"50L+", label:"नागरिक\nलाभान्वित" },
      { number:"2",    label:"भाषाएं\nउपलब्ध" },
      { number:"100%", label:"बिल्कुल\nनिःशुल्क" },
    ],

    dbTitle: "विस्तृत योजना डेटाबेस",
    dbBody:
      "योजना सहाय केंद्र सरकार और सभी राज्य सरकारों की कल्याण योजनाओं का एक व्यापक और निरंतर विस्तारित होता डेटाबेस बनाए रखता है। हमारी टीम नागरिकों के लिए सटीक, प्रासंगिक और अद्यतन जानकारी सुनिश्चित करने हेतु लगातार कार्यरत रहती है।",

    featuresTitle: "मुख्य क्षमताएं",
    features: [
      { icon:"🔍", color:NAVY,      title:"स्मार्ट योजना खोज",       desc:"केंद्र और राज्य सरकार की योजनाओं को श्रेणी, राज्य और लाभार्थी प्रकार के अनुसार खोजें। पात्रता, लाभ और आवेदन मार्गदर्शन सहित तत्काल परिणाम।" },
      { icon:"🎯", color:SAFFRON,   title:"पात्रता जांचक",            desc:"एक स्मार्ट अनुकूलित प्रश्नावली जो आपके व्यवसाय, आय और राज्य को समझकर तुरंत आपकी सभी पात्र योजनाएं सामने रख देती है — बिना अनुमान लगाए। AI मार्गदर्शन के साथ ताकि आगे का हर कदम बिल्कुल स्पष्ट हो।" },
      { icon:"🤖", color:"#8B5CF6", title:"AI सहायक",                 desc:"हिंदी और अंग्रेजी में योजना संबंधी प्रश्नों के लिए वास्तविक समय AI सहायक। व्यक्तिगत मार्गदर्शन, योजना तुलना और अगले कदमों की जानकारी।" },
      { icon:"📬", color:IND_GREEN, title:"रिपोर्ट और समाधान केंद्र", desc:"बग, योजना अनुरोध, सामान्य प्रश्न और सुझाव सबमिट करने की इन-ऐप सुविधा। टीम द्वारा हर सबमिशन की समीक्षा और सीधा उत्तर।" },
    ],

    aiTitle:    "AI सहायक — Groq द्वारा संचालित",
    aiSubtitle: "बुद्धिमान · द्विभाषी · व्यक्तिगत",
    aiPoints: [
      { icon:"🌐", text:"पूरी तरह द्विभाषी — हिंदी या अंग्रेजी में स्वाभाविक रूप से बात करें" },
      { icon:"🎯", text:"आपकी प्रोफाइल और राज्य के आधार पर व्यक्तिगत सुझाव" },
      { icon:"💡", text:"गहरी जानकारी के लिए स्मार्ट फॉलो-अप सुझाव" },
      { icon:"📖", text:"सभी उपयोगकर्ताओं के लिए पठन-अनुकूल गति से डिज़ाइन" },
      { icon:"🔒", text:"प्रति-खाता चैट इतिहास — निजी और सुरक्षित" },
      { icon:"⚡", text:"Groq AI द्वारा संचालित — तेज़ और सटीक उत्तर" },
      { icon:"📊", text:"पात्रता जांच के परिणामों पर AI मार्गदर्शन पाएं — जानें आप क्यों पात्र हैं और आगे क्या करें" },
    ],

    proTitle:    "योजनासहाय Pro",
    proEyebrow:  "जल्द आ रहा है",
    proSubtitle: "Play Store और App Store पर लॉन्च होगा",
    proBody:
      "योजनासहाय अभी सभी उपयोगकर्ताओं के लिए निःशुल्क है। उन पावर यूज़र्स के लिए Pro टियर आ रहा है जो रोज़ाना AI सहायक का उपयोग करते हैं — असीमित AI संदेश और प्रीमियम सुविधाओं के साथ।",
    proFeatures: [
      { icon:"🤖", title:"AI संदेश",                 desc:"AI Chat सहायक के लिए दैनिक सीमा।",                                                                                           free:"10 / दिन",   pro:"असीमित" },
      { icon:"📄", title:"PDF निर्यात",               desc:"ऑफलाइन उपयोग और CSC विज़िट के लिए पात्रता परिणामों की PDF डाउनलोड करें।",                                                  free:"✗",          pro:"✓" },
      { icon:"👨‍👩‍👧‍👦", title:"परिवार प्रोफाइल",          desc:"परिवार के सदस्य जोड़ें और हर एक के लिए अलग पात्रता जांचें।",                                                              free:"1 प्रोफाइल", pro:"असीमित" },
      { icon:"🎯", title:"गहन पात्रता मिलान",          desc:"15+ पैरामीटर — राशन कार्ड, विकलांगता, किसान कार्ड, भूमि धारण — का उपयोग करके सटीक मिलान।",                              free:"✗",          pro:"✓" },
      { icon:"📋", title:"आवेदन ट्रैकर",              desc:"योजनाओं को Interested → Applied → Received के रूप में चिह्नित करें।",                                                       free:"✗",          pro:"✓" },
      { icon:"📦", title:"दस्तावेज़ चेकलिस्ट",         desc:"सभी मिलान योजनाओं के लिए एक समेकित दस्तावेज़ सूची।",                                                                        free:"Basic",      pro:"Advanced" },
      { icon:"🔔", title:"समय-सीमा अलर्ट",            desc:"आपके राज्य और श्रेणी के अनुसार योजना की अंतिम तिथि पर ईमेल और पुश नोटिफिकेशन।",                                          free:"सामान्य",    pro:"रियल अलर्ट" },
      { icon:"⭐", title:"प्राथमिकता सपोर्ट",          desc:"Pro रिपोर्ट को Priority बैज मिलता है और पहले समीक्षा की जाती है।",                                                          free:"सामान्य",    pro:"प्राथमिकता" },
    ],
    proPricingTitle: "मूल्य निर्धारण",
    proMonthly:      "₹49 / माह",
    proYearly:       "₹399 / वर्ष",
    proSaveLabel:    "32% बचत",
    proPricingNote:  "मूल्य और भुगतान विकल्प लॉन्च पर घोषित होंगे। UPI, कार्ड और नेट बैंकिंग के माध्यम से भुगतान।",
    proLoginTitle:   "AI Chat के लिए लॉगिन आवश्यक",
    proLoginNotice:
      "जब YojanaSahay Pro लॉन्च होगा, तब AI Chat टैब तक पहुँचने के लिए Google से साइन इन करना अनिवार्य होगा। इससे आपकी दैनिक उपयोग सीमा और Pro सुविधाएं सीधे आपके खाते से जुड़ी रहेंगी।",

    signInTitle: "साइन इन के लाभ",
    signInSub:   "खाता बनाकर YojanaSahay का पूरा अनुभव प्राप्त करें।",
    signInPoints: [
      { icon:"🎯", title:"व्यक्तिगत योजना मिलान",       desc:"पात्रता जांचक और AI आपकी प्रोफाइल के अनुसार सर्वाधिक प्रासंगिक योजनाएं दिखाते हैं।" },
      { icon:"🤖", title:"प्रोफाइल-आधारित AI उत्तर",    desc:"AI सहायक आपकी आयु, आय, राज्य और व्यवसाय के अनुसार हर सुझाव तैयार करता है।" },
      { icon:"📬", title:"रिपोर्ट ट्रैकिंग और उत्तर",   desc:"अपनी सबमिशन की स्थिति — Open, In Progress, Resolved — पूर्ण बातचीत थ्रेड के साथ देखें।" },
      { icon:"✅", title:"सत्यापित पहचान सबमिशन",       desc:"आपकी रिपोर्ट पर Verified बैज लगता है जिससे सपोर्ट टीम प्राथमिकता से कार्य करती है।" },
      { icon:"📩", title:"ईमेल पुष्टि और सूचनाएं",      desc:"सबमिशन पर स्वचालित ईमेल पुष्टि और टीम के उत्तर पर अधिसूचना प्राप्त करें।" },
    ],

    reportTitle:    "रिपोर्ट, प्रश्न और समाधान",
    reportSubtitle: "हर सबमिशन का पूरा जवाब",
    reportBody:     "योजना सहाय में एक पूर्ण अंत-से-अंत सपोर्ट और समाधान प्रणाली उपलब्ध है। नागरिक निम्नलिखित में से कोई भी सबमिट कर सकते हैं:",
    reportTypes: [
      { icon:"🐛", color:"#DC2626", label:"बग / समस्या रिपोर्ट",   desc:"ऐप में तकनीकी समस्या या अनुचित व्यवहार की जानकारी दें।" },
      { icon:"📋", color:NAVY,      label:"योजना जोड़ने का अनुरोध", desc:"प्लेटफ़ॉर्म पर अनुपस्थित किसी योजना को जोड़ने का अनुरोध करें।" },
      { icon:"❓", color:IND_GREEN, label:"सामान्य प्रश्न",          desc:"किसी योजना या सुविधा के बारे में सहायता या प्रश्न सबमिट करें।" },
      { icon:"💡", color:SAFFRON,   label:"सुझाव और प्रतिक्रिया",   desc:"देशभर के नागरिकों के लिए प्लेटफ़ॉर्म सुधार के सुझाव साझा करें।" },
    ],
    reportFlow:
      "सभी सबमिशन सुरक्षित रूप से संग्रहीत होते हैं और योजना सहाय की प्राथमिक सपोर्ट टीम द्वारा समीक्षा की जाती है। लॉगिन उपयोगकर्ताओं को सबमिशन पर स्वचालित ईमेल पुष्टि और टीम के उत्तर पर सूचना मिलती है। स्थिति — Open → In Progress → Resolved — ऐप में वास्तविक समय में दिखाई देती है।",

    legalTitle:  "कानूनी एवं अस्वीकरण",
    legalPoints: [
      "योजना सहाय सरकारी योजना खोज के लिए एक स्वतंत्र डिजिटल प्लेटफ़ॉर्म है और किसी भी केंद्र या राज्य सरकार निकाय या मंत्रालय से संबद्ध, अनुमोदित या प्रतिनिधि नहीं है।",
      "सभी योजना डेटा सार्वजनिक रूप से उपलब्ध आधिकारिक सरकारी पोर्टलों से प्राप्त किया गया है। सटीकता के प्रयास के बावजूद, उपयोगकर्ताओं को आवेदन से पूर्व संबंधित सरकारी स्रोतों से विवरण सत्यापित करने की सलाह दी जाती है।",
      "योजना सहाय सीधे आवेदन, वित्तीय लेनदेन या दस्तावेज़ प्रसंस्करण की सुविधा नहीं देता। यह प्लेटफ़ॉर्म केवल सूचना और खोज सेवा के रूप में कार्य करता है।",
    ],

    techTitle: "प्रौद्योगिकी और अवसंरचना",
    techBody:  "योजना सहाय एक उत्पादन-स्तरीय, सुरक्षा-प्रथम तकनीकी स्टैक पर निर्मित है — जिसमें विश्वसनीय क्लाउड अवसंरचना, वैश्विक वितरित डिप्लॉयमेंट और संस्करण-नियंत्रित विकास का संयोजन है।",
    techStack: [
      { icon:"🔥", name:"Firebase",  role:"प्रमाणीकरण, क्लाउड डेटाबेस और रियल-टाइम सिंक",                                                         badge:null },
      { icon:"⚡", name:"Groq AI",   role:"AI सहायक — हाई-स्पीड, लो-लेटेंसी इनफेरेंस इंजन",                                                        badge:null },
      { icon:"📧", name:"EmailJS",   role:"स्वचालित ईमेल पुष्टि और सपोर्ट अलर्ट",                                                                   badge:null },
      { icon:"▲",  name:"Vercel",    role:"वैश्विक डिप्लॉयमेंट और होस्टिंग — एज नेटवर्क द्वारा भारत में तेज़ और सुरक्षित डिलीवरी",               badge:"Global Edge" },
      { icon:"🐙", name:"GitHub",    role:"सोर्स कोड और संस्करण नियंत्रण — पूर्ण विकास इतिहास, इश्यू ट्रैकिंग और सुरक्षित बिल्ड पाइपलाइन",     badge:"Open Dev" },
    ],

    privacyTitle:   "गोपनीयता नीति",
    privacyEyebrow: "आपका डेटा और अधिकार",
    privacyIntro:
      "योजना सहाय आपकी गोपनीयता की रक्षा के लिए प्रतिबद्ध है। यह नीति बताती है कि आपका डेटा कैसे एकत्र, उपयोग और सुरक्षित किया जाता है।",
    privacyPoints: [
      { icon:"🔒", text:"डेटा संग्रह और उद्देश्य — हम केवल न्यूनतम आवश्यक डेटा एकत्र करते हैं: आपका नाम, ईमेल पता, राज्य, आयु वर्ग, आय वर्ग और व्यवसाय श्रेणी। यह जानकारी विशेष रूप से ऐप में व्यक्तिगत पात्रता परिणाम, AI सुझाव और योजना खोज को बेहतर बनाने के लिए उपयोग की जाती है। हम आपके अनुभव के लिए आवश्यकता से अधिक डेटा कभी नहीं लेते।" },
      { icon:"🚫", text:"तृतीय पक्ष के साथ साझाकरण नहीं — हम किसी भी परिस्थिति में — किसी भी व्यावसायिक साझेदारी या विज्ञापन उद्देश्य सहित — आपकी व्यक्तिगत जानकारी को किसी भी तृतीय पक्ष को नहीं बेचते, किराए पर नहीं देते, लाइसेंस नहीं देते, साझा नहीं करते या प्रकट नहीं करते। योजना सहाय एक पूर्ण विज्ञापन-मुक्त प्लेटफ़ॉर्म है और सदा रहेगा।" },
      { icon:"☁️",  text:"सुरक्षित क्लाउड स्टोरेज — सभी उपयोगकर्ता डेटा Firebase पर संग्रहीत है — एक Google Cloud प्लेटफ़ॉर्म जो AES-256 एन्क्रिप्शन (डेटा स्थिरता में) और TLS 1.2+ एन्क्रिप्शन (डेटा प्रसारण में) लागू करता है। Firebase ISO 27001, SOC 1, SOC 2 और SOC 3 सहित प्रमुख अंतर्राष्ट्रीय सुरक्षा मानकों का अनुपालन करता है।" },
      { icon:"💬", text:"AI बातचीत की गोपनीयता — AI सहायक के साथ आपकी बातचीत आपके निजी Firestore खाते में सुरक्षित रूप से संग्रहीत होती है और अन्य सभी उपयोगकर्ताओं से पूरी तरह अलग रहती है। आपकी बातचीत कभी साझा नहीं की जाती, सार्वजनिक नहीं की जाती और किसी भी बाहरी AI मॉडल को प्रशिक्षित या बेहतर बनाने के लिए उपयोग नहीं की जाती।" },
      { icon:"📧", text:"ईमेल उपयोग नीति — आपका ईमेल पता केवल इन उद्देश्यों के लिए उपयोग किया जाता है: (क) Firebase Auth के माध्यम से खाता प्रमाणीकरण, (ख) रिपोर्ट या प्रश्न सबमिट करने पर स्वचालित पुष्टि ईमेल, और (ग) प्लेटफ़ॉर्म सपोर्ट टीम के आधिकारिक उत्तर। हम न्यूज़लेटर, प्रचार अभियान या कोई भी अवांछित मार्केटिंग संदेश कभी नहीं भेजते।" },
      { icon:"🛡️", text:"डेटा पहुंच नियंत्रण — आपके व्यक्तिगत डेटा तक पहुंच केवल अधिकृत प्लेटफ़ॉर्म प्रशासकों तक सीमित है, और केवल तभी जब आपके द्वारा सबमिट किए गए सपोर्ट अनुरोध की जांच या समाधान के लिए आवश्यक हो। सभी प्रशासनिक पहुंच लॉग की जाती है। आपका डेटा कभी भी व्यावसायिक, विज्ञापन या प्रोफाइलिंग उद्देश्यों के लिए उपयोग नहीं किया जाता।" },
      { icon:"⚖️", text:"आपके अधिकार, सुरक्षाएं और अनुपालन — योजना सहाय कभी भी ट्रैकिंग कुकी, रिटार्गेटिंग पिक्सेल या व्यवहार प्रोफाइलिंग टूल का उपयोग नहीं करता। प्लेटफ़ॉर्म आधार नंबर, PAN कार्ड, बैंक खाता विवरण या बायोमेट्रिक डेटा जैसी संवेदनशील पहचान कभी एकत्र नहीं करता — नागरिकों को दृढ़ता से सलाह दी जाती है कि ऐसी जानकारी ऐप में कभी साझा न करें। आप किसी भी समय yojanasahayofficial@gmail.com पर संपर्क करके अपना डेटा देख सकते हैं, सुधार सकते हैं, निर्यात कर सकते हैं या स्थायी रूप से हटा सकते हैं; सभी सत्यापित अनुरोध 30 कैलेंडर दिनों में पूरे किए जाते हैं। इस नीति में कोई भी बदलाव लागू होने से पहले ऐप के भीतर सूचित किया जाएगा। यह नीति भारत के कानूनों, विशेष रूप से डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDPA) द्वारा शासित है।" },
    ],

    devTitle:    "डेवलपर के बारे में",
    devName:     "Sahnawaz Ahmed Laskar",
    devRole:     "Full Stack Developer · UI/UX Designer",
    devLocation: "सिलचर, असम · भारत",
    devTagline:  "YojanaSahay के एकल निर्माता — हर कम्पोनेंट, API, डेटाबेस और डिज़ाइन निर्णय स्वतंत्र रूप से विकसित।",
    devTags:     ["React PWA", "Firebase", "Groq AI", "Vercel Edge", "UI/UX"],
    devLink:     "sahnawaz-portfolio.vercel.app →",

    contactTitle: "YojanaSahay सपोर्ट",
    contactNote:  "केवल प्लेटफ़ॉर्म संबंधी पूछताछ के लिए। योजना-विशिष्ट सहायता के लिए इन-ऐप Report & Query सुविधा का उपयोग करें।",

    lastUpdated: "अंतिम अपडेट · मई 2026",

    whatsNewTitle: "नया क्या है",
    whatsNew: [
      { version:"v1.3", date:"मई 2026",    note:"ईमेल & Google साइन-इन · डार्क मोड · Vercel एज डिप्लॉयमेंट" },
      { version:"v1.2", date:"मार्च 2026", note:"रिपोर्ट & समाधान केंद्र · एडमिन डैशबोर्ड · ईमेल अलर्ट" },
      { version:"v1.1", date:"जनवरी 2026", note:"AI सहायक (Groq) · द्विभाषी समर्थन · प्रोफाइल-आधारित उत्तर" },
      { version:"v1.0", date:"नवंबर 2025", note:"पहला सार्वजनिक Beta · पात्रता जांचक · 3,000+ योजनाएं" },
    ],

    shareTitle: "योजना सहाय साझा करें",
    shareBody:  "क्या आप किसी ऐसे व्यक्ति को जानते हैं जो सरकारी योजनाओं से लाभ उठा सकता है? यह प्लेटफ़ॉर्म उनके साथ साझा करें।",
    shareBtn:   "किसी के साथ साझा करें",

    ackTitle: "आभार",
    ackBody:  "योजना सहाय ओपन-सोर्स टूल्स और सार्वजनिक रूप से उपलब्ध संसाधनों पर निर्मित है। हम निम्नलिखित का कृतज्ञतापूर्वक उल्लेख करते हैं:",
    ackItems: [
      { icon:"⚛️",  name:"React",                note:"UI लाइब्रेरी — Meta ओपन सोर्स" },
      { icon:"🇮🇳", name:"डिजिटल इंडिया भावना", note:"हर भारतीय नागरिक तक सरकारी सेवाएं सुलभ बनाने की भावना से निर्मित" },
      { icon:"📖",  name:"ओपन सोर्स समुदाय",   note:"इस प्लेटफ़ॉर्म को शक्ति देने वाले टूल्स और लाइब्रेरी, सभी डेवलपर्स के लिए निःशुल्क" },
    ],

    grievanceTitle:   "उपयोगकर्ता सहायता और शिकायत",
    grievanceBody:    "योजना सहाय हर उपयोगकर्ता की समस्या को शीघ्र और पारदर्शी तरीके से हल करने के लिए प्रतिबद्ध है। इन-ऐप Report & Query के माध्यम से सबमिट की गई हर शिकायत पर तुरंत स्वचालित पुष्टि ईमेल भेजी जाती है। प्लेटफ़ॉर्म प्रशासक को प्रत्येक सबमिशन की तत्काल सूचना मिलती है और वे व्यक्तिगत रूप से हर समस्या की समीक्षा करते हैं।",
    grievanceNote:    "प्लेटफ़ॉर्म प्रशासक: Sahnawaz Ahmed Laskar",

    copyright:  "© 2026 Sahnawaz Ahmed Laskar · MIT License के अंतर्गत ओपन सोर्स",
    footerNote: "योजना सहाय · एक स्वतंत्र नागरिक प्रौद्योगिकी प्लेटफ़ॉर्म · भारत",
    platformId: PLATFORM_ID,
  },
};

// ─── ASHOKA CHAKRA (24-spoke SVG, same geometry as original) ─────────────────
function AshokaChakra({ size = 18, color = ASHOKA_BLUE, spinning = false }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  const cx = size / 2, cy = size / 2, r = size / 2 - 1, innerR = r * 0.28;
  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, animation: spinning ? "ys-chakra-spin 14s linear infinite" : "none" }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.055} />
      <circle cx={cx} cy={cy} r={innerR} fill={color} />
      {spokes.map(i => {
        const a = (i * 360 / 24) * Math.PI / 180;
        return (
          <line key={i}
            x1={cx + innerR * Math.cos(a)} y1={cy + innerR * Math.sin(a)}
            x2={cx + r * 0.78 * Math.cos(a)} y2={cy + r * 0.78 * Math.sin(a)}
            stroke={color} strokeWidth={size * 0.042}
          />
        );
      })}
    </svg>
  );
}

// ─── PREMIUM SECTION HEADER ───────────────────────────────────────────────────
function SectionHeader({ title, accent = NAVY, dark, bf, eyebrow }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && (
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1.8,
          textTransform: "uppercase", color: accent,
          marginBottom: 6, fontFamily: bf,
          opacity: 0.85,
        }}>
          {eyebrow}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 4, height: 20, borderRadius: 4, flexShrink: 0,
          background: `linear-gradient(180deg, ${accent}, ${accent}88)`,
        }} />
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: th.text, letterSpacing: 0.1, fontFamily: bf,
        }}>
          {title}
        </div>
      </div>
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function Card({ dark, children, accentColor, style = {} }) {
  const th = THEME[dark ? "dark" : "light"];
  const borderColor = accentColor ? `${accentColor}30` : th.border;
  return (
    <div style={{
      background: th.card,
      borderRadius: R.xl,
      padding: "24px 20px",
      border: `1px solid ${borderColor}`,
      boxShadow: dark ? "none" : th.shadowMd,
      transition: `box-shadow 0.2s ${EASE}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── INLINE DIVIDER ───────────────────────────────────────────────────────────
function Divider({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(to right, transparent, ${th.border2}80, transparent)`,
      margin: "14px 0",
    }} />
  );
}

// ─── INFO ROW (icon + title + desc) ──────────────────────────────────────────
function InfoRow({ icon, iconBg, title, desc, dark, bf, last }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: R.md, flexShrink: 0,
          background: iconBg || (dark ? "rgba(255,255,255,0.06)" : "#F0F3FA"),
          border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 3, fontFamily: bf }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.7, fontFamily: bf }}>
            {desc}
          </div>
        </div>
      </div>
      {!last && <Divider dark={dark} />}
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AboutTab({ lang: propLang = "en", dark = false, toggleLang: externalToggle }) {
  // Mirrors the global lang — stays in sync when parent changes it
  // (e.g. user toggles from the home screen header while About is mounted).
  const [lang, setLang]     = useState(propLang);
  const [fading, setFading] = useState(false);

  // Keep local state in sync whenever the parent prop changes
  useEffect(() => { setLang(propLang); }, [propLang]);

  const toggleLang = () => {
    setFading(true);                           // 1 — fade out
    setTimeout(() => {
      if (externalToggle) externalToggle();    // 2a — call global toggle (syncs whole app)
      else setLang(l => l === "en" ? "hi" : "en"); // 2b — fallback if no prop
      setFading(false);                        // 3 — fade back in
    }, 160);
  };

  const th = THEME[dark ? "dark" : "light"];
  const s  = STRINGS[lang] || STRINGS.en;
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";

  // ── Google Fonts + keyframes ──────────────────────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');

    @keyframes ys-chakra-spin {
      from { transform-origin: center; transform: rotate(0deg); }
      to   { transform-origin: center; transform: rotate(360deg); }
    }
    @keyframes ys-fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ys-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes ys-pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.6; transform: scale(0.85); }
    }
    @keyframes ys-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes ys-pro-sweep {
      0%   { background-position: -250% center; }
      100% { background-position:  250% center; }
    }
    @keyframes ys-overlay-sweep {
      0%   { transform: translateX(-200%); }
      100% { transform: translateX(400%); }
    }
    @keyframes shz-sweep {
      0%   { transform: translateX(-140px); opacity: 0; }
      8%   { opacity: 1; }
      28%  { transform: translateX(160px); opacity: 0; }
      100% { transform: translateX(160px); opacity: 0; }
    }
    @keyframes shz-badge-sweep {
      0%   { transform: translateX(-160%); }
      100% { transform: translateX(320%); }
    }
    @keyframes shz-border-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .ys-coming-pill {
      position: relative;
      overflow: hidden;
    }
    .ys-coming-pill::after {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 45%; height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255,245,160,0.24) 50%, transparent 100%);
      animation: ys-overlay-sweep 2.8s ease-in-out infinite;
      pointer-events: none;
    }
    .ys-coming-text {
      background: linear-gradient(90deg,
        #7A5C1E 0%, #C9A84C 18%, #F5E090 38%,
        #FFF0A8 50%, #F5E090 62%, #C9A84C 82%, #7A5C1E 100%
      );
      background-size: 250% 100%;
      animation: ys-pro-sweep 2.8s ease-in-out infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
    }

    .ys-card {
      animation: ys-fade-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
    }
    .ys-card:nth-child(1)  { animation-delay: 0.05s; }
    .ys-card:nth-child(2)  { animation-delay: 0.10s; }
    .ys-card:nth-child(3)  { animation-delay: 0.15s; }
    .ys-card:nth-child(4)  { animation-delay: 0.20s; }
    .ys-card:nth-child(5)  { animation-delay: 0.25s; }
    .ys-card:nth-child(6)  { animation-delay: 0.30s; }
    .ys-card:nth-child(7)  { animation-delay: 0.35s; }
    .ys-card:nth-child(8)  { animation-delay: 0.40s; }
    .ys-card:nth-child(9)  { animation-delay: 0.45s; }
    .ys-card:nth-child(10) { animation-delay: 0.50s; }
    .ys-card:nth-child(11) { animation-delay: 0.55s; }
    .ys-card:nth-child(12) { animation-delay: 0.60s; }
    .ys-card:nth-child(13) { animation-delay: 0.65s; }
    .ys-card:nth-child(14) { animation-delay: 0.70s; }
    .ys-card:nth-child(15) { animation-delay: 0.75s; }

    .ys-link-row {
      transition: opacity 0.18s cubic-bezier(0.4,0,0.2,1),
                  transform 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .ys-link-row:active { opacity: 0.75; transform: scale(0.985); }

    .ys-share-btn {
      transition: opacity 0.18s cubic-bezier(0.4,0,0.2,1),
                  transform 0.18s cubic-bezier(0.4,0,0.2,1),
                  box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .ys-share-btn:active { opacity: 0.85; transform: scale(0.97); }

    .ys-lang-toggle {
      transition: transform 0.2s cubic-bezier(0.4,0,0.2,1),
                  opacity   0.2s cubic-bezier(0.4,0,0.2,1);
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .ys-lang-toggle:active { transform: scale(0.93); opacity: 0.78; }
    .ys-lang-seg { transition: color 0.26s cubic-bezier(0.4,0,0.2,1); }
  `;

  const statColors = [SAFFRON, "#4ADE80", "#60A5FA", "#F9FAFB"];

  return (
    <div style={{
      background: th.appBg,
      minHeight: "100%",
      fontFamily: bf,
      overflowX: "hidden",
      opacity: fading ? 0 : 1,
      transition: "opacity 0.16s ease",
    }}>
      <style>{STYLES}</style>

      {/* ════════════════════════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(155deg, #002060 0%, ${NAVY} 35%, #04206A 65%, #001538 100%)`,
        padding: "40px 22px 36px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Atmospheric glow blobs */}
        <div style={{
          position: "absolute", top: -80, right: -60, width: 260, height: 260,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${SAFFRON}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -40, width: 200, height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${IND_GREEN}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Large watermark Chakra */}
        <div style={{
          position: "absolute", top: "50%", right: -30,
          transform: "translateY(-50%)",
          opacity: 0.04, pointerEvents: "none",
        }}>
          <AshokaChakra size={200} color="#FFFFFF" spinning />
        </div>

        {/* Subtle dot-grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          opacity: 0.5,
        }} />

        {/* Top row — Made in India badge  ↔  Language toggle */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 28,
          animation: "ys-fade-in 0.5s ease both",
          position: "relative",
        }}>
          {/* Left — Made in India */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 20, padding: "5px 14px",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.88)",
              letterSpacing: 0.5, fontFamily: bf,
            }}>
              {s.madeInIndia}
            </span>
          </div>

          {/* Right — Language segmented pill */}
          <div
            className="ys-lang-toggle"
            onClick={toggleLang}
            role="button" tabIndex={0}
            aria-label={isHindi ? "Switch to English" : "हिंदी में बदलें"}
            onKeyDown={e => e.key === "Enter" && toggleLang()}
            style={{
              position: "relative",
              display: "flex", alignItems: "center",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 22, padding: "3px",
              cursor: "pointer", height: 32, width: 86,
              backdropFilter: "blur(10px)",
              flexShrink: 0,
            }}>
            {/* Sliding white pill — glides left↔right */}
            <div style={{
              position: "absolute",
              top: 3, bottom: 3,
              left: isHindi ? "calc(50% + 1px)" : 3,
              width: "calc(50% - 4px)",
              background: "#ffffff",
              borderRadius: 16,
              transition: "left 0.28s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              zIndex: 0,
            }} />
            {/* EN segment */}
            <span className="ys-lang-seg" style={{
              flex: 1, textAlign: "center",
              fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
              color: !isHindi ? NAVY : "rgba(255,255,255,0.60)",
              position: "relative", zIndex: 1,
            }}>EN</span>
            {/* हिं segment */}
            <span className="ys-lang-seg" style={{
              flex: 1, textAlign: "center",
              fontSize: 11, fontWeight: 700,
              color: isHindi ? NAVY : "rgba(255,255,255,0.60)",
              position: "relative", zIndex: 1,
              fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}>हिं</span>
          </div>
        </div>

        {/* App identity */}
        <div style={{ animation: "ys-fade-up 0.55s cubic-bezier(0.4,0,0.2,1) 0.1s both", position: "relative" }}>

          {/* App icon */}
          <div style={{
            width: 76, height: 76, borderRadius: 22,
            overflow: "hidden", marginBottom: 20, flexShrink: 0,
            boxShadow: "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.25)",
          }}>
            <img src={appLogo} alt="Yojana Sahay"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>

          {/* App name */}
          <div style={{
            fontSize: 30, fontWeight: 800, color: "#FFFFFF",
            letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 10, fontFamily: bf,
          }}>
            {s.appName}
          </div>

          {/* Tricolour accent bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
            <div style={{ height: 3, width: 36, borderRadius: 3, background: SAFFRON }} />
            <div style={{ height: 3, width: 3, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
            <div style={{ height: 3, width: 16, borderRadius: 3, background: "rgba(255,255,255,0.9)" }} />
            <div style={{ height: 3, width: 3, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
            <div style={{ height: 3, width: 36, borderRadius: 3, background: IND_GREEN }} />
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)",
            letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 22, fontFamily: bf,
          }}>
            {s.tagline}
          </div>

          {/* Version + Last Updated */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: R.sm, padding: "6px 12px",
              backdropFilter: "blur(6px)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", flexShrink: 0,
                animation: "ys-pulse-dot 2.2s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: bf }}>
                {s.version}
              </span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: `${SAFFRON}18`,
              border: `1px solid ${SAFFRON}35`,
              borderRadius: R.sm, padding: "6px 12px",
              backdropFilter: "blur(6px)",
            }}>
              <span style={{ fontSize: 10 }}>🕐</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,200,100,0.92)", fontFamily: bf }}>
                {s.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CONTENT BODY
      ════════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "22px 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── MISSION ─────────────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={NAVY}>
            <SectionHeader title={s.missionTitle} accent={NAVY} dark={dark} bf={bf} />
            <div style={{ fontSize: 13, color: th.textMid, lineHeight: 1.85, fontFamily: bf }}>
              {s.missionBody}
            </div>
          </Card>
        </div>

        {/* ── WHAT'S NEW ───────────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={ASHOKA_BLUE}>
            <SectionHeader title={s.whatsNewTitle} accent={ASHOKA_BLUE} dark={dark} bf={bf} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {s.whatsNew.map((item, i) => (
                <div key={i}>
                  {i > 0 && <Divider dark={dark} />}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {/* Version pill */}
                    <div style={{
                      minWidth: 38, height: 22, borderRadius: 7, flexShrink: 0,
                      background: i === 0
                        ? `linear-gradient(135deg, ${SAFFRON}, #D97706)`
                        : dark ? "rgba(255,255,255,0.06)" : "#EEF1FB",
                      border: i === 0 ? "none" : `1px solid ${th.border2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 8px",
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
                        color: i === 0 ? "#fff" : th.textSub,
                        fontFamily: "monospace",
                      }}>{item.version}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 7,
                        marginBottom: 3,
                      }}>
                        <span style={{ fontSize: 10, color: th.textSub, fontFamily: bf }}>
                          {item.date}
                        </span>
                        {i === 0 && (
                          <span style={{
                            fontSize: 8, fontWeight: 700,
                            background: IND_GREEN, color: "#fff",
                            borderRadius: 4, padding: "1px 6px", letterSpacing: 0.5,
                          }}>LATEST</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.6, fontFamily: bf }}>
                        {item.note}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── STATS ────────────────────────────────────────────────────── */}
        <div className="ys-card">
          <div style={{
            background: `linear-gradient(140deg, #002060 0%, ${NAVY} 50%, #04206A 100%)`,
            borderRadius: R.xl,
            padding: "26px 20px",
            boxShadow: "0 8px 32px rgba(0,53,128,0.32)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Background texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }} />
            <div style={{
              fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)",
              letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 20,
              fontFamily: bf, position: "relative",
            }}>
              {s.statsTitle}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 0, position: "relative",
            }}>
              {s.stats.map((stat, i) => (
                <div key={i} style={{
                  textAlign: "center", padding: "0 4px",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.10)" : "none",
                }}>
                  <div style={{
                    fontSize: 22, fontWeight: 800, lineHeight: 1.05,
                    color: statColors[i],
                    fontFamily: bf,
                    textShadow: `0 0 20px ${statColors[i]}40`,
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: 9, color: "rgba(255,255,255,0.50)", marginTop: 6,
                    lineHeight: 1.45, fontFamily: bf, whiteSpace: "pre-line",
                    letterSpacing: 0.2,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SCHEME DATABASE ──────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={IND_GREEN}>
            <SectionHeader title={s.dbTitle} accent={IND_GREEN} dark={dark} bf={bf} />
            <div style={{ fontSize: 13, color: th.textMid, lineHeight: 1.85, fontFamily: bf }}>
              {s.dbBody}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginTop: 16,
              background: dark ? `${IND_GREEN}15` : `${IND_GREEN}09`,
              border: `1px solid ${IND_GREEN}28`,
              borderRadius: R.md, padding: "11px 14px",
            }}>
              <div style={{ fontSize: 15 }}>🔄</div>
              <div style={{ fontSize: 11, color: IND_GREEN, fontWeight: 700, fontFamily: bf, lineHeight: 1.4 }}>
                {isHindi
                  ? "डेटाबेस सक्रिय रूप से विस्तारित हो रहा है · टीम नियमित रूप से अपडेट करती है"
                  : "Database actively expanding · Team regularly curates & updates"}
              </div>
            </div>
          </Card>
        </div>

        {/* ── CORE CAPABILITIES ────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark}>
            <SectionHeader title={s.featuresTitle} accent={SAFFRON} dark={dark} bf={bf} />
            {s.features.map((f, i) => (
              <div key={i}>
                {i > 0 && <Divider dark={dark} />}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: R.md, flexShrink: 0,
                    background: `linear-gradient(135deg, ${f.color}22, ${f.color}0C)`,
                    border: `1.5px solid ${f.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                    boxShadow: `0 4px 12px ${f.color}18`,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 5, fontFamily: bf }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.75, fontFamily: bf }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* ── AI ASSISTANT ─────────────────────────────────────────────── */}
        <div className="ys-card">
          <div style={{
            background: dark
              ? "linear-gradient(135deg, rgba(109,40,217,0.14) 0%, rgba(0,53,128,0.18) 100%)"
              : "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(0,53,128,0.04) 100%)",
            borderRadius: R.xl,
            padding: "24px 20px",
            border: "1.5px solid rgba(139,92,246,0.22)",
            boxShadow: dark ? "none" : "0 4px 20px rgba(139,92,246,0.08)",
          }}>
            {/* AI header */}
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
              <div style={{
                width: 46, height: 46, borderRadius: R.md, flexShrink: 0,
                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, boxShadow: "0 6px 18px rgba(139,92,246,0.38)",
              }}>🤖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.text, fontFamily: bf }}>
                  {s.aiTitle}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: "#A78BFA",
                  letterSpacing: 0.6, marginTop: 3, fontFamily: bf,
                }}>
                  {s.aiSubtitle}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(139,92,246,0.20)", marginBottom: 16 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.aiPoints.map((pt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    background: "rgba(139,92,246,0.14)",
                    border: "1px solid rgba(139,92,246,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>
                    {pt.icon}
                  </div>
                  <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.65, fontFamily: bf, paddingTop: 6 }}>
                    {pt.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── YOJANASAHAY PRO — COMING SOON ───────────────────────────── */}
        <div className="ys-card">
          <div style={{
            borderRadius: R.xl,
            padding: "26px 20px 24px",
            background: "linear-gradient(155deg, #08091C 0%, #0D0F26 45%, #060818 100%)",
            border: `1.5px solid rgba(201,168,76,0.28)`,
            boxShadow: `0 0 0 1px rgba(201,168,76,0.08), 0 4px 24px rgba(0,0,0,0.65), 0 20px 60px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,245,180,0.06)`,
            position: "relative",
            overflow: "hidden",
          }}>

            {/* Gold ambient top glow */}
            <div style={{
              position: "absolute", top: -120, left: "50%",
              transform: "translateX(-50%)",
              width: 380, height: 240,
              background: "radial-gradient(ellipse at center, rgba(201,168,76,0.14) 0%, transparent 68%)",
              pointerEvents: "none",
            }} />

            {/* Secondary corner glow */}
            <div style={{
              position: "absolute", bottom: -60, right: -40,
              width: 220, height: 180,
              background: "radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Subtle gold dot-grid texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "radial-gradient(circle, rgba(201,168,76,0.07) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.75,
            }} />

            {/* ── HEADER ── */}
            <div style={{ position: "relative", marginBottom: 20 }}>

              {/* Eyebrow pill — shimmer sweep */}
              <div className="ys-coming-pill" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(201,168,76,0.11)",
                border: "1.5px solid rgba(201,168,76,0.52)",
                borderRadius: 20, padding: "4px 14px 4px 10px",
                marginBottom: 14,
                boxShadow: "0 0 18px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,245,180,0.10)",
              }}>
                {/* Pulsing live dot */}
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #F0D87A, #C9A84C)",
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(201,168,76,0.65)",
                  animation: "ys-pulse-dot 1.6s ease-in-out infinite",
                }} />
                <span className="ys-coming-text" style={{
                  fontSize: 8.5, fontWeight: 800, letterSpacing: 2,
                  textTransform: "uppercase", fontFamily: bf,
                }}>
                  {s.proEyebrow}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontSize: 22, fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: -0.5, lineHeight: 1.1,
                fontFamily: bf, marginBottom: 6,
              }}>
                {s.proTitle}
              </div>

              {/* Subtitle */}
              <div style={{
                fontSize: 11, fontWeight: 500,
                color: "rgba(201,168,76,0.60)",
                fontFamily: bf, marginBottom: 17,
              }}>
                {s.proSubtitle}
              </div>

              {/* Gradient rule */}
              <div style={{
                height: 1,
                background: "linear-gradient(to right, rgba(201,168,76,0.55), rgba(201,168,76,0.18), transparent)",
              }} />
            </div>

            {/* Body text */}
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.85,
              marginBottom: 22, fontFamily: bf, position: "relative",
            }}>
              {s.proBody}
            </div>

            {/* ── COMPARISON TABLE ── */}
            <div style={{
              borderRadius: R.md,
              border: "1px solid rgba(201,168,76,0.18)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "inset 0 1px 0 rgba(255,245,180,0.04), 0 4px 20px rgba(0,0,0,0.32)",
            }}>

              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 76px 76px" }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.32)", fontFamily: bf,
                  letterSpacing: 0.8, textTransform: "uppercase", padding: "9px 10px",
                  background: "rgba(255,255,255,0.025)",
                  borderBottom: "1px solid rgba(201,168,76,0.12)",
                }}>
                  {isHindi ? "सुविधा" : "Feature"}
                </div>
                <div style={{
                  textAlign: "center", fontSize: 9.5, fontWeight: 800,
                  letterSpacing: 0.5, color: "rgba(255,255,255,0.32)", fontFamily: bf, padding: "9px 4px",
                  background: "rgba(255,255,255,0.025)",
                  borderLeft: "1px solid rgba(201,168,76,0.12)",
                  borderBottom: "1px solid rgba(201,168,76,0.12)",
                }}>
                  {isHindi ? "निःशुल्क" : "Free"}
                </div>
                <div style={{
                  textAlign: "center", fontSize: 9.5, fontWeight: 800,
                  letterSpacing: 1.2, fontFamily: bf, padding: "9px 4px",
                  background: `linear-gradient(160deg, ${PRO_GOLD_DK} 0%, ${PRO_GOLD} 55%, #B08030 100%)`,
                  borderLeft: "1px solid rgba(201,168,76,0.35)",
                  borderBottom: "1px solid rgba(201,168,76,0.35)",
                  color: "#FFF8E1",
                  textShadow: "0 1px 4px rgba(0,0,0,0.40)",
                }}>
                  PRO
                </div>
              </div>

              {/* Rows */}
              {s.proFeatures.map((f, i) => {
                const isLast = i === s.proFeatures.length - 1;
                const isEven = i % 2 === 0;
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 76px 76px",
                    borderBottom: isLast ? "none" : "1px solid rgba(201,168,76,0.07)",
                  }}>
                    {/* Feature label */}
                    <div style={{
                      padding: "11px 10px",
                      background: isEven ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.025)",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.80)", fontFamily: bf, lineHeight: 1.3 }}>
                        {f.title}
                      </div>
                      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", fontFamily: bf, marginTop: 2, lineHeight: 1.4 }}>
                        {f.desc}
                      </div>
                    </div>

                    {/* Free cell */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "11px 4px",
                      borderLeft: "1px solid rgba(201,168,76,0.08)",
                      background: "rgba(255,255,255,0.01)",
                    }}>
                      <span style={{
                        fontSize: f.free === "✗" ? 13 : 10,
                        fontWeight: 700,
                        color: f.free === "✗" ? "rgba(255,255,255,0.14)"
                          : f.free === "✓" ? "#4ADE80"
                          : "rgba(255,255,255,0.42)",
                        fontFamily: bf, textAlign: "center", lineHeight: 1.3,
                      }}>
                        {f.free}
                      </span>
                    </div>

                    {/* Pro cell */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "11px 4px",
                      borderLeft: `1px solid rgba(201,168,76,0.20)`,
                      background: "rgba(201,168,76,0.07)",
                    }}>
                      <span style={{
                        fontSize: f.pro === "✓" ? 13 : 10,
                        fontWeight: 700,
                        color: f.pro === "✓" ? "#4ADE80" : PRO_GOLD,
                        fontFamily: bf, textAlign: "center", lineHeight: 1.3,
                      }}>
                        {f.pro}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── PRICING ── */}
            <div style={{ marginTop: 24, position: "relative" }}>
              <div style={{
                fontSize: 9, fontWeight: 700,
                color: "rgba(201,168,76,0.58)",
                letterSpacing: 1.6, textTransform: "uppercase",
                marginBottom: 12, fontFamily: bf,
              }}>
                {s.proPricingTitle}
              </div>

              <div style={{ display: "flex", gap: 10 }}>

                {/* Monthly */}
                <div style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid rgba(201,168,76,0.22)`,
                  borderRadius: R.md, padding: "15px 12px", textAlign: "center",
                  backdropFilter: "blur(10px)",
                  boxShadow: "inset 0 1px 0 rgba(255,245,180,0.04), 0 2px 12px rgba(0,0,0,0.32)",
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.32)",
                    letterSpacing: 0.9, textTransform: "uppercase",
                    marginBottom: 6, fontFamily: bf,
                  }}>
                    {isHindi ? "मासिक" : "Monthly"}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: PRO_GOLD, fontFamily: bf, letterSpacing: -0.3 }}>
                    {s.proMonthly}
                  </div>
                </div>

                {/* Yearly — highlighted */}
                <div style={{
                  flex: 1, position: "relative",
                  background: "linear-gradient(145deg, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.07) 100%)",
                  border: `1.5px solid rgba(201,168,76,0.48)`,
                  borderRadius: R.md, padding: "15px 12px", textAlign: "center",
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 0 0 1px rgba(201,168,76,0.10), 0 4px 20px rgba(201,168,76,0.14), inset 0 1px 0 rgba(255,245,180,0.08)`,
                }}>
                  {/* Save badge */}
                  <div style={{
                    position: "absolute", top: -10, right: 10,
                    background: `linear-gradient(135deg, ${IND_GREEN} 0%, #0A5C04 100%)`,
                    borderRadius: 20, padding: "2px 9px",
                    boxShadow: `0 3px 10px ${IND_GREEN}38`,
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#fff", fontFamily: bf, letterSpacing: 0.3 }}>
                      {s.proSaveLabel}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.32)",
                    letterSpacing: 0.9, textTransform: "uppercase",
                    marginBottom: 6, fontFamily: bf,
                  }}>
                    {isHindi ? "वार्षिक" : "Yearly"}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: PRO_GOLD, fontFamily: bf, letterSpacing: -0.3 }}>
                    {s.proYearly}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)", marginTop: 11, lineHeight: 1.65, fontFamily: bf }}>
                {s.proPricingNote}
              </div>
            </div>

            {/* ── LOGIN NOTICE ── */}
            <div style={{
              marginTop: 18, position: "relative",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(201,168,76,0.20)",
              borderLeft: "3px solid rgba(201,168,76,0.72)",
              borderRadius: `0 ${R.md}px ${R.md}px 0`,
              padding: "13px 15px",
              boxShadow: "inset 0 1px 0 rgba(255,245,180,0.04)",
            }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: PRO_GOLD,
                marginBottom: 5, fontFamily: bf, letterSpacing: 0.1,
              }}>
                {s.proLoginTitle}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", lineHeight: 1.75, fontFamily: bf }}>
                {s.proLoginNotice}
              </div>
            </div>

          </div>
        </div>

        {/* ── SIGN-IN BENEFITS ─────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={SAFFRON}>
            <SectionHeader title={s.signInTitle} accent={SAFFRON} dark={dark} bf={bf} />
            <div style={{ fontSize: 12, color: th.textSub, marginBottom: 16, fontFamily: bf }}>
              {s.signInSub}
            </div>
            {s.signInPoints.map((pt, i) => (
              <InfoRow
                key={i}
                icon={pt.icon}
                iconBg={dark ? `${SAFFRON}15` : `${SAFFRON}0E`}
                title={pt.title}
                desc={pt.desc}
                dark={dark} bf={bf}
                last={i === s.signInPoints.length - 1}
              />
            ))}
          </Card>
        </div>

        {/* ── REPORT & RESOLUTION ──────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark}>
            <SectionHeader title={s.reportTitle} accent={NAVY} dark={dark} bf={bf} />

            {/* Subtitle — quiet eyebrow */}
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              textTransform: "uppercase",
              color: dark ? "rgba(255,255,255,0.26)" : th.textSub,
              marginBottom: 12, fontFamily: bf,
            }}>
              {s.reportSubtitle}
            </div>

            {/* Body */}
            <div style={{ fontSize: 13, color: th.textMid, lineHeight: 1.8, marginBottom: 20, fontFamily: bf }}>
              {s.reportBody}
            </div>

            {/* Report type list — numbered, no emojis, unified */}
            <div style={{
              background: dark ? "rgba(255,255,255,0.025)" : th.card2,
              border: `1px solid ${th.border}`,
              borderRadius: R.lg,
              overflow: "hidden",
              marginBottom: 16,
            }}>
              {s.reportTypes.map((rt, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "15px 16px",
                  borderBottom: i < s.reportTypes.length - 1
                    ? `1px solid ${th.divider}`
                    : "none",
                }}>
                  {/* Number pill */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    background: dark
                      ? "rgba(255,255,255,0.07)"
                      : "linear-gradient(145deg, #fff 0%, #EEF2FC 100%)",
                    border: `1px solid ${th.border2}`,
                    boxShadow: dark ? "none" : "inset 0 1px 0 rgba(255,255,255,0.9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800,
                    color: dark ? "rgba(255,255,255,0.35)" : th.textSub,
                    fontFamily: "monospace", letterSpacing: 0.4,
                    marginTop: 1,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Label + desc */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: 700,
                      color: th.text, fontFamily: bf, lineHeight: 1.3,
                    }}>
                      {rt.label}
                    </div>
                    <div style={{
                      fontSize: 11, color: th.textMid, lineHeight: 1.65, fontFamily: bf,
                    }}>
                      {rt.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Flow note — left-accent info block */}
            <div style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              background: dark ? "rgba(255,255,255,0.03)" : th.card2,
              border: `1px solid ${th.border}`,
              borderRadius: R.md, padding: "14px 16px",
            }}>
              <div style={{
                width: 3, borderRadius: 99, flexShrink: 0, alignSelf: "stretch",
                minHeight: 20,
                background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY}44 100%)`,
              }} />
              <div style={{ fontSize: 11, color: th.textMid, lineHeight: 1.85, fontFamily: bf }}>
                {s.reportFlow}
              </div>
            </div>
          </Card>
        </div>

        {/* ── LEGAL & DISCLAIMER ───────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark}>
            <SectionHeader title={s.legalTitle} accent="#DC2626" dark={dark} bf={bf} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.legalPoints.map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    background: dark ? "rgba(220,38,38,0.12)" : "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: "#DC2626", marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 11, color: th.textMid, lineHeight: 1.8, fontFamily: bf }}>
                    {pt}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── USER SUPPORT & COMPLAINTS ────────────────────────────────── */}
        <div className="ys-card">
          <div style={{
            background: dark ? `${NAVY}18` : `${NAVY}07`,
            borderRadius: R.xl, padding: "24px 20px",
            border: `1px solid ${NAVY}2A`,
          }}>
            <SectionHeader title={s.grievanceTitle} accent={NAVY} dark={dark} bf={bf} />
            <div style={{ fontSize: 13, color: th.textMid, lineHeight: 1.85, marginBottom: 16, fontFamily: bf }}>
              {s.grievanceBody}
            </div>

            {/* Admin identity badge */}
            <div style={{
              background: dark
                ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)"
                : "linear-gradient(135deg, #FFFFFF 0%, #F4F7FF 100%)",
              border: `1px solid ${dark ? `${NAVY}35` : `${NAVY}18`}`,
              borderRadius: R.md, padding: "14px 16px",
              display: "flex", flexDirection: "column", gap: 10,
              boxShadow: dark ? "none" : `0 2px 8px ${NAVY}0C`,
            }}>

              {/* Administrator row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: dark ? `${NAVY}30` : `${NAVY}0E`,
                  border: `1px solid ${dark ? `${NAVY}50` : `${NAVY}20`}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15,
                }}>🪪</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1.1,
                    textTransform: "uppercase",
                    color: dark ? `rgba(180,200,255,0.50)` : `${NAVY}88`,
                    fontFamily: bf,
                  }}>
                    {isHindi ? "प्लेटफ़ॉर्म प्रशासक" : "Platform Administrator"}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: dark ? "rgba(220,232,255,0.90)" : th.text,
                    fontFamily: bf, letterSpacing: -0.1,
                  }}>
                    Sahnawaz Ahmed Laskar
                  </div>
                </div>
              </div>

              {/* Thin divider */}
              <div style={{
                height: 1,
                background: dark
                  ? `linear-gradient(90deg, transparent, ${NAVY}40, transparent)`
                  : `linear-gradient(90deg, transparent, ${NAVY}18, transparent)`,
              }} />

              {/* Email + SLA row */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: 11.5, fontWeight: 600,
                  color: dark ? "rgba(180,210,255,0.70)" : NAVY,
                  fontFamily: bf,
                }}>
                  <span style={{ fontSize: 13 }}>📧</span>
                  {CONTACT_EMAIL}
                </div>
                <div style={{
                  fontSize: 10, color: th.textSub, fontFamily: bf, lineHeight: 1.6,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>⚡</span>
                  <span>
                    {isHindi
                      ? "तत्काल पुष्टि ईमेल  ·  72 घंटे में समाधान"
                      : "Instant confirmation email  ·  Resolution within 72 hours"}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── TECHNOLOGY & INFRASTRUCTURE ──────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={ASHOKA_BLUE}>
            <SectionHeader title={s.techTitle} accent={ASHOKA_BLUE} dark={dark} bf={bf} />
            <div style={{ fontSize: 12, color: th.textSub, marginBottom: 18, lineHeight: 1.75, fontFamily: bf }}>
              {s.techBody}
            </div>
            {s.techStack.map((t, i) => (
              <div key={i}>
                {i > 0 && <Divider dark={dark} />}
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: R.md, flexShrink: 0,
                    background: dark ? "rgba(255,255,255,0.06)" : "#EEF1FB",
                    border: `1px solid ${th.border2}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: t.name === "Vercel" ? 13 : 17,
                    fontWeight: 900,
                    color: t.name === "Vercel"
                      ? (dark ? "#fff" : "#000")
                      : t.name === "GitHub"
                      ? (dark ? "#ccc" : "#1a1a1a")
                      : "inherit",
                  }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: th.text, fontFamily: bf }}>
                        {t.name}
                      </div>
                      {t.badge && (
                        <span style={{
                          fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
                          background: dark ? "rgba(255,255,255,0.10)" : `${ASHOKA_BLUE}12`,
                          color: dark ? "rgba(255,255,255,0.60)" : ASHOKA_BLUE,
                          borderRadius: 5, padding: "2px 7px",
                          border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : `${ASHOKA_BLUE}22`}`,
                        }}>
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: th.textSub, lineHeight: 1.5, fontFamily: bf }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* ── ACKNOWLEDGEMENTS ─────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark}>
            <SectionHeader title={s.ackTitle} accent={IND_GREEN} dark={dark} bf={bf} />
            <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.7, marginBottom: 16, fontFamily: bf }}>
              {s.ackBody}
            </div>
            {s.ackItems.map((item, i) => (
              <div key={i}>
                {i > 0 && <Divider dark={dark} />}
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: R.md, flexShrink: 0,
                    background: dark ? "rgba(255,255,255,0.06)" : "#F0F3FA",
                    border: `1px solid ${th.border2}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 3, fontFamily: bf }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: th.textSub, lineHeight: 1.55, fontFamily: bf }}>
                      {item.note}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* ── PRIVACY POLICY ───────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={NAVY}>
            <SectionHeader
              title={s.privacyTitle}
              accent={NAVY}
              dark={dark}
              bf={bf}
              eyebrow={s.privacyEyebrow}
            />

            {/* Intro */}
            <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.75, marginBottom: 16, fontFamily: bf }}>
              {s.privacyIntro}
            </div>

            {/* Policy points */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {s.privacyPoints.map((pt, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  background: dark ? `${NAVY}18` : `${NAVY}05`,
                  border: `1px solid ${NAVY}18`,
                  borderRadius: R.md, padding: "11px 13px",
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    background: dark ? `${NAVY}30` : `${NAVY}0D`,
                    border: `1px solid ${NAVY}22`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>
                    {pt.icon}
                  </div>
                  <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.75, fontFamily: bf, paddingTop: 5 }}>
                    {pt.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Effective date badge */}
            <div style={{
              marginTop: 16,
              display: "flex", alignItems: "center", gap: 8,
              background: dark ? "rgba(255,255,255,0.04)" : th.card2,
              border: `1px solid ${th.border}`,
              borderRadius: R.md, padding: "9px 13px",
            }}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span style={{ fontSize: 10, color: th.textSub, fontFamily: bf, lineHeight: 1.5 }}>
                {isHindi
                  ? "यह गोपनीयता नीति · मई 2026 से प्रभावी · प्लेटफ़ॉर्म अपडेट के साथ संशोधित की जा सकती है"
                  : "This Privacy Policy · Effective May 2026 · Subject to revision with platform updates"}
              </span>
            </div>
          </Card>
        </div>

        {/* ── ABOUT THE DEVELOPER ──────────────────────────────────────── */}
        <div className="ys-card">
          <div style={{
            borderRadius: R.xl,
            overflow: "hidden",
            border: "1.5px solid rgba(201,168,76,0.62)",
            boxShadow: dark
              ? "0 0 0 1px rgba(201,168,76,0.14), 0 0 20px rgba(201,168,76,0.14), 0 8px 40px rgba(0,0,0,0.55)"
              : "0 4px 32px rgba(0,53,128,0.10), 0 0 0 1px rgba(201,168,76,0.14), 0 0 16px rgba(201,168,76,0.12)",
            position: "relative",
          }}>

            {/* ── Rotating gold border glow (conic gradient pseudo-element via div) ── */}
            <div style={{
              position: "absolute", inset: -1, borderRadius: R.xl + 1,
              background: "conic-gradient(from 0deg, transparent 0deg, rgba(201,168,76,0.55) 60deg, rgba(255,228,130,0.80) 90deg, rgba(201,168,76,0.55) 120deg, transparent 180deg, transparent 360deg)",
              animation: "shz-border-spin 6s linear infinite",
              zIndex: 0,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: 1,
              pointerEvents: "none",
            }} />

            {/* ── Header band ── */}
            <div style={{
              background: "linear-gradient(135deg, #010B1F 0%, #021236 35%, #031850 65%, #010D28 100%)",
              padding: "22px 20px 18px",
              position: "relative", overflow: "hidden",
              zIndex: 1,
            }}>
              {/* Gold ambient glow top-right */}
              <div style={{
                position: "absolute", right: -40, top: -40,
                width: 160, height: 160, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              {/* Gold ambient glow bottom-left */}
              <div style={{
                position: "absolute", left: -20, bottom: -20,
                width: 100, height: 100, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              {/* Subtle dot grid texture */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }} />
              {/* Glassy top sheen */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "45%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>

                {/* ── SHZ Premium Avatar Card — DO NOT TOUCH ── */}
                <div style={{ flexShrink: 0 }}>
                  {/* Outer glow ring */}
                  <div style={{
                    padding: 2,
                    borderRadius: 20,
                    background: "linear-gradient(135deg, rgba(255,228,130,0.80) 0%, rgba(201,168,76,0.40) 40%, rgba(255,244,192,0.70) 70%, rgba(201,168,76,0.30) 100%)",
                    boxShadow: "0 0 20px rgba(201,168,76,0.35), 0 0 40px rgba(201,168,76,0.15)",
                    display: "inline-block",
                  }}>
                    {/* Inner container — clips logo area + HYPER ZENITH band */}
                    <div style={{
                      width: 120,
                      borderRadius: 18,
                      overflow: "hidden",
                      background: "#020810",
                      position: "relative",
                    }}>

                      {/* ── Logo area — wide & short for horizontal logo ── */}
                      <div style={{
                        width: 120, height: 56,
                        position: "relative",
                        background: "radial-gradient(ellipse at 42% 32%, #17254E 0%, #0A1530 58%, #020810 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                      }}>
                        {/* Dot-grid texture */}
                        <div style={{
                          position: "absolute", inset: 0, pointerEvents: "none",
                          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
                          backgroundSize: "14px 14px",
                        }} />

                        {/* Real SHZ logo image — cover fills box edge to edge */}
                        <img
                          src={shzLogo}
                          alt="SHZ"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                            display: "block",
                            zIndex: 2,
                            filter: [
                              "drop-shadow(0 0 5px rgba(201,168,76,0.70))",
                              "drop-shadow(0 0 12px rgba(245,211,106,0.45))",
                              "drop-shadow(0 0 22px rgba(201,168,76,0.25))",
                            ].join(" "),
                          }}
                        />

                        {/* Premium gold light sweep — wide, soft, slow */}
                        <div style={{
                          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 3,
                        }}>
                          <div style={{
                            position: "absolute",
                            top: "-10%",
                            left: 0,
                            width: 90,
                            height: "120%",
                            background: "linear-gradient(105deg, transparent 0%, rgba(201,168,76,0.04) 20%, rgba(255,244,192,0.13) 40%, rgba(255,255,255,0.18) 50%, rgba(255,244,192,0.13) 60%, rgba(201,168,76,0.04) 80%, transparent 100%)",
                            animation: "shz-sweep 5s ease-in-out infinite",
                          }} />
                        </div>

                        {/* Permanent glassy top sheen */}
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                          background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,244,192,0.04) 60%, transparent 100%)",
                          pointerEvents: "none", zIndex: 4,
                        }} />
                        {/* Permanent soft bottom shadow */}
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
                          background: "linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 100%)",
                          pointerEvents: "none", zIndex: 4,
                        }} />


                      </div>

                      {/* ── HYPER ZENITH footer band ── */}
                      <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "5px 0 6px",
                        background: "linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(255,228,130,0.08) 50%, rgba(201,168,76,0.14) 100%)",
                        borderTop: "1px solid rgba(201,168,76,0.35)",
                        overflow: "hidden",
                      }}>
                        {/* Shimmer sweep */}
                        <div style={{
                          position: "absolute", top: 0, bottom: 0, left: 0, width: "50%",
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,228,130,0.28) 50%, transparent 100%)",
                          animation: "shz-badge-sweep 4s ease-in-out infinite",
                          pointerEvents: "none",
                        }} />
                        {/* Left gold dot */}
                        <span style={{
                          display: "block", width: 3, height: 3, borderRadius: "50%", flexShrink: 0,
                          background: "linear-gradient(135deg, #FFE285 0%, #C9A84C 100%)",
                          boxShadow: "0 0 4px rgba(201,168,76,0.70)",
                        }} />
                        {/* Gold gradient text — static, no animation on text itself */}
                        <span style={{
                          fontSize: 7.5, fontWeight: 800, letterSpacing: 2.2,
                          textTransform: "uppercase",
                          background: "linear-gradient(90deg, #C9A84C 0%, #FFE285 35%, #FFF4C0 50%, #FFE285 65%, #C9A84C 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          fontFamily: "'DM Sans', sans-serif",
                          lineHeight: 1,
                          userSelect: "none",
                          position: "relative",
                        }}>
                          HYPER ZENITH
                        </span>
                        {/* Right gold dot */}
                        <span style={{
                          display: "block", width: 3, height: 3, borderRadius: "50%", flexShrink: 0,
                          background: "linear-gradient(135deg, #FFE285 0%, #C9A84C 100%)",
                          boxShadow: "0 0 4px rgba(201,168,76,0.70)",
                        }} />
                      </div>

                    </div>
                  </div>
                </div>
                {/* ── end SHZ avatar ── */}

                {/* ── Right info panel ── */}
                <div style={{
                  flex: 1, minWidth: 0,
                  display: "flex", flexDirection: "column",
                  alignSelf: "stretch",
                  justifyContent: "space-between",
                }}>

                  {/* Top row — DEVELOPER label + INDIE DEV corner badge */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}>
                    {/* DEVELOPER eyebrow with left line */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 16, height: 1,
                        background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.60))",
                      }} />
                      <span style={{
                        fontSize: 7.5, fontWeight: 700, letterSpacing: 2.2,
                        textTransform: "uppercase",
                        background: "linear-gradient(90deg, #C9A84C 0%, #FFE285 50%, #C9A84C 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontFamily: bf,
                        userSelect: "none",
                      }}>DEVELOPER</span>
                      <div style={{
                        width: 16, height: 1,
                        background: "linear-gradient(90deg, rgba(201,168,76,0.60), transparent)",
                      }} />
                    </div>

                    {/* INDIE DEV — tiny top-right corner */}
                    <div style={{
                      background: "rgba(201,168,76,0.08)",
                      border: "1px solid rgba(201,168,76,0.25)",
                      borderRadius: 5, padding: "2px 6px",
                    }}>
                      <span style={{
                        fontSize: 6.5, fontWeight: 700,
                        letterSpacing: 1.2, textTransform: "uppercase",
                        color: "rgba(201,168,76,0.70)",
                        fontFamily: bf,
                      }}>INDIE DEV</span>
                    </div>
                  </div>

                  {/* Thin gold divider */}
                  <div style={{
                    height: 1, marginBottom: 10,
                    background: "linear-gradient(90deg, rgba(201,168,76,0.35), rgba(201,168,76,0.08), transparent)",
                  }} />

                  {/* Name */}
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: "#fff",
                    letterSpacing: -0.2, fontFamily: bf, lineHeight: 1.25,
                    marginBottom: 6,
                  }}>
                    {s.devName}
                  </div>

                  {/* Role */}
                  <div style={{
                    fontSize: 9.5, fontWeight: 600,
                    color: "rgba(255,255,255,0.50)",
                    letterSpacing: 0.3, fontFamily: bf,
                    lineHeight: 1.4,
                  }}>
                    {s.devRole}
                  </div>

                </div>

              </div>
            </div>

            {/* ── Body ── */}
            <div style={{
              background: dark
                ? "linear-gradient(180deg, #07111F 0%, #050D1A 100%)"
                : "linear-gradient(180deg, #F5F8FF 0%, #EEF2FB 100%)",
              padding: "18px 20px 20px",
              position: "relative",
              zIndex: 1,
            }}>
              {/* Subtle gold top border */}
              <div style={{
                position: "absolute", top: 0, left: 20, right: 20, height: 1,
                background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.20), transparent)",
              }} />

              {/* Tagline — Premium 3D bordered box */}
              <div style={{
                position: "relative",
                background: dark
                  ? "linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(5,10,22,0.70) 100%)"
                  : "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(230,236,252,0.80) 100%)",
                border: "1px solid rgba(201,168,76,0.30)",
                borderRadius: 10,
                padding: "11px 13px 11px 16px",
                marginBottom: 16,
                boxShadow: dark
                  ? "0 4px 16px rgba(0,0,0,0.40), 0 1px 0 rgba(201,168,76,0.18) inset, 0 -1px 0 rgba(0,0,0,0.30) inset"
                  : "0 3px 10px rgba(10,18,48,0.09), 0 1px 0 rgba(201,168,76,0.20) inset",
              }}>
                {/* Left gold accent bar */}
                <div style={{
                  position: "absolute",
                  left: 0, top: 8, bottom: 8, width: 2.5,
                  borderRadius: "0 2px 2px 0",
                  background: "linear-gradient(180deg, transparent 0%, #F0D87A 35%, #C9A84C 65%, transparent 100%)",
                  boxShadow: "0 0 6px rgba(201,168,76,0.50)",
                }} />
                {/* Top-right corner shimmer dot */}
                <div style={{
                  position: "absolute", top: 6, right: 8,
                  width: 3, height: 3, borderRadius: "50%",
                  background: "rgba(201,168,76,0.40)",
                  boxShadow: "0 0 4px rgba(201,168,76,0.50)",
                }} />
                <p style={{
                  fontSize: 11, fontStyle: "italic", fontWeight: 400,
                  color: th.textMid, lineHeight: 1.9,
                  margin: 0, fontFamily: bf,
                }}>
                  {s.devTagline}
                </p>
              </div>

              {/* Tech stack chips — unified glassy */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
                {s.devTags.map((tag, i) => (
                  <span key={i} style={{
                    position: "relative",
                    display: "inline-flex", alignItems: "center",
                    fontSize: 10.5, fontWeight: 650,
                    letterSpacing: 0.25,
                    fontFamily: "'DM Sans', sans-serif",
                    color: dark ? "rgba(210,228,255,0.88)" : "rgba(20,45,110,0.82)",
                    background: dark
                      ? "linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)"
                      : "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(230,240,255,0.72) 100%)",
                    border: `1px solid ${dark ? "rgba(201,168,76,0.38)" : "rgba(201,168,76,0.42)"}`,
                    borderRadius: 999,
                    padding: "5px 13px",
                    backdropFilter: "blur(10px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(10px) saturate(1.4)",
                    boxShadow: dark
                      ? "0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.20)"
                      : "0 2px 8px rgba(60,100,200,0.12), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(160,190,240,0.22)",
                    textShadow: dark
                      ? "0 1px 4px rgba(0,0,0,0.50)"
                      : "0 1px 1px rgba(255,255,255,0.90)",
                    overflow: "hidden",
                  }}>
                    {/* Top glass sheen */}
                    <span style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      height: "50%", borderRadius: "999px 999px 50% 50%",
                      background: dark
                        ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, transparent 100%)",
                      pointerEvents: "none",
                    }} />
                    <span style={{ position: "relative" }}>{tag}</span>
                  </span>
                ))}
              </div>

              {/* Website CTA — water glass premium 3D */}
              <div
                className="ys-link-row"
                onClick={() => safeOpen(DEV_WEBSITE)}
                role="link"
                tabIndex={0}
                aria-label="Visit developer portfolio"
                onKeyDown={e => e.key === "Enter" && safeOpen(DEV_WEBSITE)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: dark
                    ? "linear-gradient(145deg, rgba(12,25,60,0.78) 0%, rgba(7,16,42,0.88) 60%, rgba(5,13,36,0.82) 100%)"
                    : "linear-gradient(145deg, rgba(255,255,255,0.84) 0%, rgba(238,246,255,0.74) 55%, rgba(222,238,255,0.68) 100%)",
                  border: "1.5px solid rgba(201,168,76,0.62)",
                  borderRadius: R.md,
                  padding: "13px 16px",
                  cursor: "pointer",
                  boxShadow: dark
                    ? "0 8px 28px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.40), 0 0 0 1px rgba(201,168,76,0.14), 0 0 14px rgba(201,168,76,0.14), inset 0 1.5px 0 rgba(255,255,255,0.11), inset 0 -1px 0 rgba(0,0,0,0.28)"
                    : "0 6px 24px rgba(60,100,200,0.16), 0 2px 6px rgba(60,100,200,0.09), 0 0 0 1px rgba(201,168,76,0.10), 0 0 12px rgba(201,168,76,0.10), inset 0 1.5px 0 rgba(255,255,255,0.96), inset 0 -1px 0 rgba(160,190,240,0.28)",
                  position: "relative", overflow: "hidden",
                  backdropFilter: "blur(18px) saturate(1.5)",
                  WebkitBackdropFilter: "blur(18px) saturate(1.5)",
                }}>

                {/* 3D top-edge glass sheen */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "50%",
                  background: dark
                    ? "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.18) 65%, transparent 100%)",
                  borderRadius: `${R.md}px ${R.md}px 60% 60% / ${R.md}px ${R.md}px 10px 10px`,
                  pointerEvents: "none",
                }} />

                {/* Premium shimmer sweep */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0, left: 0, width: "55%",
                  background: dark
                    ? "linear-gradient(90deg, transparent 0%, rgba(255,244,192,0.01) 15%, rgba(255,244,192,0.07) 35%, rgba(255,248,215,0.15) 50%, rgba(255,244,192,0.07) 65%, rgba(255,244,192,0.01) 85%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.01) 15%, rgba(255,228,130,0.11) 35%, rgba(255,236,150,0.20) 50%, rgba(255,228,130,0.11) 65%, rgba(201,168,76,0.01) 85%, transparent 100%)",
                  animation: "shz-badge-sweep 5s ease-in-out infinite",
                  pointerEvents: "none",
                }} />

                {/* Bottom depth shadow */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "28%",
                  background: dark
                    ? "linear-gradient(0deg, rgba(0,0,0,0.22) 0%, transparent 100%)"
                    : "linear-gradient(0deg, rgba(140,175,235,0.18) 0%, transparent 100%)",
                  pointerEvents: "none",
                }} />

                {/* Icon + URL */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: dark
                      ? "linear-gradient(145deg, rgba(80,140,240,0.22) 0%, rgba(50,90,190,0.16) 100%)"
                      : "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(210,230,255,0.76) 100%)",
                    border: `1px solid ${dark ? "rgba(120,180,255,0.22)" : "rgba(180,215,255,0.65)"}`,
                    boxShadow: dark
                      ? "inset 0 1.5px 0 rgba(255,255,255,0.14), 0 4px 10px rgba(0,0,0,0.32)"
                      : "inset 0 1.5px 0 rgba(255,255,255,1.0), 0 3px 8px rgba(80,130,220,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>🌐</div>
                  <div style={{
                    fontSize: 11.5, fontWeight: 700,
                    color: dark ? "rgba(215,232,255,0.92)" : "#1A3572",
                    fontFamily: bf,
                    textShadow: dark
                      ? "0 1px 5px rgba(0,0,0,0.55)"
                      : "0 1px 2px rgba(255,255,255,0.95)",
                  }}>
                    {s.devLink}
                  </div>
                </div>

                {/* Chevron */}
                <div style={{
                  position: "relative", zIndex: 1,
                  color: dark ? "rgba(170,215,255,0.82)" : "#2254B0",
                  fontSize: 20,
                  filter: dark
                    ? "drop-shadow(0 0 5px rgba(100,170,255,0.38))"
                    : "drop-shadow(0 1px 3px rgba(80,130,220,0.28))",
                }}>›</div>
              </div>

              {/* ── Platform ID Footer Strip ── */}
              <div style={{ marginTop: 18, marginLeft: -20, marginRight: -20 }}>
                {/* Gold divider */}
                <div style={{ position: "relative", height: 1, marginBottom: 11 }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.45) 25%, rgba(240,216,122,0.70) 50%, rgba(201,168,76,0.45) 75%, transparent 100%)",
                  }} />
                  {/* Centre diamond */}
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%) rotate(45deg)",
                    width: 5, height: 5,
                    background: "linear-gradient(135deg, #F0D87A, #C9A84C)",
                    boxShadow: "0 0 6px rgba(201,168,76,0.70)",
                  }} />
                </div>
                {/* ID row */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 7,
                  paddingBottom: 4,
                }}>
                  {/* Lock icon */}
                  <svg width="8" height="9" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(201,168,76,0.60)" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  <span style={{
                    fontSize: 8.5,
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    background: "linear-gradient(90deg, #C9A84C 0%, #F0D87A 50%, #C9A84C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    userSelect: "none",
                  }}>
                    {PLATFORM_ID}
                  </span>
                  {/* Lock icon right */}
                  <svg width="8" height="9" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(201,168,76,0.60)" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── DEVELOPER CONTACT ─────────────────────────────────────────── */}
        <div className="ys-card">
          <Card dark={dark} accentColor={SAFFRON}>
            <SectionHeader title={s.contactTitle} accent={SAFFRON} dark={dark} bf={bf} />
            {/* Email row */}
            <div
              className="ys-link-row"
              onClick={() => safeOpen(`mailto:${CONTACT_EMAIL}`)}
              role="link"
              tabIndex={0}
              aria-label={`Email ${CONTACT_EMAIL}`}
              onKeyDown={e => e.key === "Enter" && safeOpen(`mailto:${CONTACT_EMAIL}`)}
              style={{
                display: "flex", alignItems: "center", gap: 13,
                background: dark ? `${SAFFRON}12` : `${SAFFRON}07`,
                border: `1px solid ${SAFFRON}28`,
                borderRadius: R.lg, padding: "14px 15px",
                cursor: "pointer", marginBottom: 12,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: R.md, flexShrink: 0,
                background: `${SAFFRON}18`, border: `1.5px solid ${SAFFRON}28`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>📧</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: SAFFRON,
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", fontFamily: bf,
                }}>
                  {CONTACT_EMAIL}
                </div>
                <div style={{ fontSize: 10, color: th.textSub, marginTop: 2, fontFamily: bf }}>
                  {isHindi ? "सपोर्ट ईमेल" : "Official Support Email"}
                </div>
              </div>
              <div style={{ color: th.textSub, fontSize: 16 }}>›</div>
            </div>
            <div style={{
              background: dark ? "rgba(255,255,255,0.03)" : th.card2,
              border: `1px solid ${th.border}`,
              borderRadius: R.md, padding: "10px 13px",
            }}>
              <div style={{ fontSize: 10, color: th.textSub, lineHeight: 1.7, fontFamily: bf }}>
                ⚠️ {s.contactNote}
              </div>
            </div>
          </Card>
        </div>

        {/* ── SHARE ────────────────────────────────────────────────────── */}
        <div className="ys-card">
          <div style={{
            background: dark
              ? "linear-gradient(135deg, rgba(19,136,8,0.10) 0%, rgba(0,53,128,0.14) 100%)"
              : "linear-gradient(135deg, rgba(19,136,8,0.05) 0%, rgba(0,53,128,0.04) 100%)",
            borderRadius: R.xl, padding: "28px 20px 24px",
            border: dark
              ? `1.5px solid rgba(19,136,8,0.32)`
              : `1.5px solid rgba(19,136,8,0.22)`,
            boxShadow: dark
              ? "0 0 0 1px rgba(255,255,255,0.04) inset"
              : "0 0 0 1px rgba(255,255,255,0.70) inset, 0 4px 16px rgba(19,136,8,0.08)",
            textAlign: "center",
          }}>

            {/* Premium share icon — circular gradient badge */}
            <div style={{
              width: 54, height: 54, borderRadius: "50%", margin: "0 auto 14px",
              background: `linear-gradient(135deg, ${IND_GREEN} 0%, #0D6A06 100%)`,
              boxShadow: "0 8px 24px rgba(19,136,8,0.36), 0 2px 8px rgba(19,136,8,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* Share / broadcast SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6"  cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
              </svg>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 8, fontFamily: bf }}>
              {s.shareTitle}
            </div>
            <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.7, marginBottom: 20, fontFamily: bf }}>
              {s.shareBody}
            </div>
            <div
              className="ys-share-btn"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({
                    title: "YojanaSahay — India's Free Scheme Discovery",
                    text: "Find government schemes you qualify for. Free, bilingual, and made in India 🇮🇳",
                    url: "https://yojanasahay.vercel.app",
                  }).catch(() => {/* user cancelled or not supported — silent fail */});
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Share YojanaSahay"
              onKeyDown={e => e.key === "Enter" && e.currentTarget.click()}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
                background: `linear-gradient(135deg, ${IND_GREEN} 0%, #0D6A06 100%)`,
                borderRadius: R.md, padding: "13px 28px",
                fontSize: 13, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: bf,
                boxShadow: "0 8px 24px rgba(19,136,8,0.34)",
                letterSpacing: 0.2,
              }}>
              {/* Inline share arrow icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {s.shareBtn}
            </div>

            {/* ── App Store & Play Store — Coming Soon ── */}
            <div style={{
              marginTop: 20,
              display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
            }}>
              {/* Apple App Store pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                border: dark ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${th.border2}`,
                borderRadius: 10, padding: "7px 13px",
                backdropFilter: "blur(8px)",
              }}>
                <svg width="13" height="16" viewBox="0 0 814 1000" fill={dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)"}>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.4 269-317.4 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.8-49.1 190.5-49.1zm-3.2-161.7c32.4-38.4 56.3-91.4 56.3-144.4 0-7.4-.6-14.9-1.9-21.7-53.5 2-117.4 35.5-155.5 79.9-31.1 35.5-59.9 88.5-59.9 142.1 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.4 1.3 13.6 1.3 48.4 0 109.1-32.4 145.5-76.4z"/>
                </svg>
                <div>
                  <div style={{
                    fontSize: 7.5, fontWeight: 600,
                    color: dark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)",
                    letterSpacing: 1, textTransform: "uppercase", fontFamily: bf,
                  }}>
                    Coming Soon
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: dark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.75)",
                    fontFamily: bf, lineHeight: 1.2,
                  }}>
                    App Store
                  </div>
                </div>
              </div>

              {/* Google Play pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                border: dark ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${th.border2}`,
                borderRadius: 10, padding: "7px 13px",
                backdropFilter: "blur(8px)",
              }}>
                <svg width="13" height="14" viewBox="0 0 512 512" fill={dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)"}>
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l232.6-232.6L47 0zm442.1 221.9l-60.7-35.1-67.8 67.8 67.8 67.8 61.4-35.4c17.4-10 17.4-35.1-.7-45.1zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div>
                  <div style={{
                    fontSize: 7.5, fontWeight: 600,
                    color: dark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)",
                    letterSpacing: 1, textTransform: "uppercase", fontFamily: bf,
                  }}>
                    Coming Soon
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: dark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.75)",
                    fontFamily: bf, lineHeight: 1.2,
                  }}>
                    Google Play
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 14,
          marginLeft: -16, marginRight: -16, marginBottom: -48,
          overflow: "hidden",
        }}>

          {/* ── Premium divider — double-line with center glow ── */}
          <div style={{ position: "relative", height: 5, marginBottom: 0 }}>
            {/* Outer faint rule */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: dark
                ? "rgba(255,255,255,0.07)"
                : "rgba(10,18,48,0.09)",
            }} />
            {/* Inner glowing rule */}
            <div style={{
              position: "absolute", top: 3, left: 0, right: 0, height: 1,
              background: dark
                ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.18) 70%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(10,18,48,0.14) 30%, rgba(10,18,48,0.22) 50%, rgba(10,18,48,0.14) 70%, transparent 100%)",
            }} />
            {/* Centre diamond dot */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 5, height: 5,
              background: dark ? "rgba(255,255,255,0.32)" : "rgba(10,18,48,0.28)",
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }} />
          </div>

          {/* ── Main footer body ── */}
          <div style={{
            background: dark
              ? "linear-gradient(180deg, #05091C 0%, #040818 100%)"
              : "linear-gradient(180deg, #D6DFEF 0%, #CDD7EB 100%)",
            padding: "28px 20px 0",
            textAlign: "center",
          }}>

            {/* Brand mark — Chakra + wordmark */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 6 }}>
              <AshokaChakra size={20} color={ASHOKA_BLUE} spinning />
              <span style={{
                fontSize: 13, fontWeight: 800, letterSpacing: 1.8,
                textTransform: "uppercase", fontFamily: bf,
                color: dark ? "rgba(255,255,255,0.88)" : "#0A1230",
              }}>
                YojanaSahay
              </span>
            </div>

            {/* Tagline */}
            <div style={{
              fontSize: 10.5, fontWeight: 500, letterSpacing: 0.3,
              color: dark ? "rgba(255,255,255,0.38)" : "#4A5E82",
              fontFamily: bf, marginBottom: 20, lineHeight: 1.5,
            }}>
              {s.footerNote}
            </div>

            {/* Badge row — MIT · Made in India · Beta */}
            <div style={{
              display: "flex", justifyContent: "center",
              gap: 7, flexWrap: "wrap", marginBottom: 24,
            }}>

              {/* MIT Licensed */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 11px", borderRadius: 20,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(10,18,48,0.06)",
                border: dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(10,18,48,0.11)",
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                  stroke={dark ? "rgba(255,255,255,0.50)" : "#334170"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                  color: dark ? "rgba(255,255,255,0.50)" : "#334170", fontFamily: bf,
                }}>MIT Licensed</span>
              </div>

              {/* Made in India */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 11px", borderRadius: 20,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(10,18,48,0.06)",
                border: dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(10,18,48,0.11)",
              }}>
                {/* Map pin / location SVG */}
                <svg width="8" height="10" viewBox="0 0 24 30" fill="none"
                  stroke={dark ? "rgba(255,255,255,0.50)" : "#334170"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 6 8 18 8 18s8-12 8-18c0-4.42-3.58-8-8-8z"/>
                  <circle cx="12" cy="10" r="2.5" fill={dark ? "rgba(255,255,255,0.50)" : "#334170"} stroke="none"/>
                </svg>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                  color: dark ? "rgba(255,255,255,0.50)" : "#334170", fontFamily: bf,
                }}>Made in India</span>
              </div>

              {/* v1.3 Beta */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 11px", borderRadius: 20,
                background: dark ? "rgba(6,3,141,0.18)" : "rgba(6,3,141,0.06)",
                border: dark ? "1px solid rgba(100,120,255,0.28)" : "1px solid rgba(6,3,141,0.13)",
              }}>
                {/* Code / terminal icon */}
                <svg width="10" height="9" viewBox="0 0 24 24" fill="none"
                  stroke={dark ? "#7B9EFF" : ASHOKA_BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                  color: dark ? "#7B9EFF" : ASHOKA_BLUE, fontFamily: bf,
                }}>v1.3 Beta</span>
              </div>

            </div>

            {/* Full-width section divider */}
            <div style={{
              height: 1, marginLeft: -20, marginRight: -20,
              background: dark
                ? "rgba(255,255,255,0.06)"
                : "rgba(10,18,48,0.09)",
            }} />

            {/* Copyright strip */}
            <div style={{
              background: dark ? "#030610" : "#C2CEDF",
              margin: "0 -20px",
              padding: "13px 20px 22px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: dark ? "rgba(255,255,255,0.40)" : "#3A4C6A",
                letterSpacing: 0.2, fontFamily: bf,
              }}>
                {s.copyright}
              </div>
              <div style={{
                fontSize: 8, fontWeight: 500,
                color: dark ? "rgba(255,255,255,0.42)" : "rgba(10,18,48,0.26)",
                letterSpacing: 1.1, fontFamily: "monospace",
              }}>
                {s.platformId}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
