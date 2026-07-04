<div align="center">

<img src="assets/banner.jpg" alt="Yojana Sahay Banner" width="100%">

# 🇮🇳 Yojana Sahay
### Government Scheme Discovery Platform

**Helping every Indian citizen find the welfare schemes available to them**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-yojanasahay.vercel.app-blue?style=for-the-badge&logo=vercel)](https://yojanasahay.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange?style=for-the-badge)](#)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)](https://vitejs.dev)

</div>

---

## 📖 About

**Yojana Sahay** (योजना सहाय — *"Scheme Aid"*) is an independent civic technology platform built to help citizens of India discover and check their eligibility for government welfare schemes — schemes they may otherwise never find out about.

The platform closes the information gap between citizens and the government welfare ecosystem — regardless of location, language, or literacy level — through smart search, an AI-powered assistant, and a personalized eligibility checker.

> ⚠️ **Yojana Sahay is an independent platform.** It is **not affiliated with, endorsed by, sponsored by, or representative of** any Central or State Government body, ministry, or department of India. All scheme information is aggregated from publicly available government sources for informational purposes only.

---

## ✨ Features

### 🔍 Smart Scheme Discovery
Search and browse a constantly expanding database of Central and State government schemes, filtered by category, state, and beneficiary type. Instant results with detailed eligibility criteria, benefits, and application guidance.

### 🎯 Eligibility Checker
A 6-step guided questionnaire that analyses your profile and instantly matches the schemes you qualify for — no guesswork, no wasted time.

### 🤖 AI Assistant (Bilingual)
A real-time AI-powered assistant for scheme queries in **Hindi and English**. Provides personalised guidance, scheme comparisons, eligibility clarification, and actionable next steps — powered by **Groq AI**.

### 📬 Report & Resolution Centre
An in-app support system for submitting bug reports, scheme addition requests, general queries, and feedback. Every submission is reviewed by the Yojana Sahay team with real-time status tracking (Open → In Progress → Resolved) and email responses.

### 🛡️ Admin Dashboard
An internal, access-controlled panel for platform operations — scheme coverage tracking, usage analytics, and content management. Restricted to authorised administrators only.

### 🌙 Dark Mode & Bilingual UI
Full dark/light theme toggle and seamless Hindi ↔ English language switching throughout the entire app.

---

## 📊 Platform Stats

| Metric | Value |
|--------|-------|
| Government Schemes Indexed | Growing weekly 📈 |
| States & UTs Covered | 28+ |
| Languages Supported | 2 (Hindi & English) |
| Cost to Citizens | Free |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | UI framework & build tool |
| **Auth & Database** | Firebase (Auth + Firestore) | Authentication, user data, real-time sync |
| **AI** | Groq AI (`llama-3.3-70b-versatile`) | Bilingual AI assistant |
| **Email** | EmailJS | Report confirmations & admin replies |
| **Deployment** | Vercel | Hosting & serverless API routes |
| **Fonts** | Noto Sans / Noto Sans Devanagari | Hindi & English typography |

---

## 📁 Project Structure

```
yojana-sahay/
├── api/                    # Vercel serverless functions (Groq API proxy)
├── src/
│   ├── App.jsx             # Main app — home, search, schemes, profile tabs
│   ├── AIChat.jsx          # Bilingual AI assistant chat screen
│   ├── AdminDashboard.jsx  # Admin panel with analytics & user management
│   ├── AboutTab.jsx        # About screen with mission, features & legal info
│   ├── ReportIssueSheet.jsx
│   ├── UserReportsTab.jsx
│   ├── ResolvedReportsCleaner.jsx
│   ├── schemesData.js      # Scheme database & categories
│   ├── groqClient.js       # Groq AI API client
│   └── firebase.js         # Firebase config & initialization
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (Auth + Firestore enabled)
- A Groq API key
- A Vercel account (for deployment)
- An EmailJS account (for report email notifications)

### Installation

```bash
# Clone the repository
git clone https://github.com/SahnawazL/yojana-sahay.git
cd yojana-sahay

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

A `.env.example` file is included in the repo. Copy it and fill in your values:

```bash
cp .env.example .env
```

Key variables you need to set:

```env
# Groq API keys — Yojana Sahay rotates across 5 keys to stay within free-tier limits
# Get yours from: https://console.groq.com
GROQ_API_KEY_1=your_groq_api_key_1
GROQ_API_KEY_2=your_groq_api_key_2
GROQ_API_KEY_3=your_groq_api_key_3
GROQ_API_KEY_4=your_groq_api_key_4
GROQ_API_KEY_5=your_groq_api_key_5

# Vercel KV / Redis — auto-populated when you add a KV database in Vercel dashboard
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
REDIS_URL=your_redis_url
```

> ⚠️ All Groq and KV keys must be set as **Vercel environment variables** only — they are used server-side via `/api/chat` and never exposed in client-side code.

### Build for Production

```bash
npm run build
```

---

## 🔐 Authentication

Yojana Sahay supports three sign-in methods:

- 📱 **Phone OTP** — via Firebase Phone Auth
- 🔵 **Google Sign-In** — via Firebase Google Provider
- 📧 **Email & Password** — via Firebase Email Auth, with **forgot password** recovery support

Scheme search and browsing are available without an account. Signing in unlocks personalized scheme matching, profile-aware AI responses, report tracking, and email notifications.

> 🔒 Authentication is handled entirely via Firebase. Credentials and personal data are never shared with third parties — see the **No Third-Party Sharing** policy in the in-app About section for full details.

---

## 🤖 AI Assistant — How It Works

The AI assistant uses **Groq's `llama-3.3-70b-versatile`** model via a secure Vercel serverless route (`/api/chat`). Key behaviours:

- Full conversation history is sent with each request for context continuity
- If the user has a saved profile, it is injected as a context prefix so the AI personalises every response without asking repeated questions
- A **reading-time cooldown** is applied after each AI reply (10–15 seconds based on reply length) to promote healthy reading pacing
- Follow-up suggestion chips are AI-generated and filtered to avoid repetition
- Chat history is persisted per user in `localStorage` (keyed by Firebase UID)

---

## 📬 Report System

Citizens can submit four types of reports directly from the app:

| Type | Description |
|------|-------------|
| 🐛 Bug / Issue Report | Technical issues or unexpected app behaviour |
| 📋 Scheme Addition Request | Request for a missing scheme to be added |
| ❓ General Query | Questions about any scheme or feature |
| 💡 Feedback & Suggestions | Suggestions to improve the platform |

Logged-in users receive **automatic email confirmation** on submission and are **notified by email** when the admin team responds.

---

## ⚖️ Legal & Disclaimer

- Yojana Sahay is an **independent** digital platform and is **not affiliated with, endorsed by, sponsored by, or representative of** any Central or State Government body, ministry, or department of India.
- All scheme data is sourced from publicly available official government portals and is provided for **informational purposes only**.
- Eligibility results shown in-app are **estimates based on user-provided answers** — they do not constitute legal entitlement, approval, or a guarantee of benefit.
- Users are advised to **verify scheme details directly from official government sources** before applying.
- Yojana Sahay does not facilitate direct applications, financial transactions, or document processing. It is solely an informational and discovery service, and accepts no liability for decisions made based on information shown in the app.

---

## 📄 License

Copyright © 2026 **Sahnawaz Ahmed Laskar**

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ in India 🇮🇳**

[Live App](https://yojanasahay.vercel.app) · [Report an Issue](https://yojanasahay.vercel.app) · [Request a Scheme](https://yojanasahay.vercel.app)

</div>
