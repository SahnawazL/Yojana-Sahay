# YojanaSahay and the Digital Public Goods Standard

This page explains how YojanaSahay meets each indicator of the [Digital Public Goods Standard](https://digitalpublicgoods.net/standard/). It is written for reviewers and for anyone who wants to reuse the project.

**Project:** YojanaSahay (योजना सहाय) — helps people in India find the Central and State government welfare schemes they may qualify for.
**Type:** Open-source software and open data
**Website:** https://yojanasahay.vercel.app
**Source code:** https://github.com/SahnawazL/Yojana-Sahay
**Owner and authorised representative:** Sahnawaz Ahmed Laskar, founder and developer — yojanasahayofficial@gmail.com

---

## 1. Relevance to the Sustainable Development Goals

Millions of eligible families in India never receive the welfare support meant for them, mostly because they don't know a scheme exists, whether they qualify, or how to apply. YojanaSahay closes that information gap, for free, in Hindi and English.

| SDG | How YojanaSahay contributes |
|---|---|
| **1 · No Poverty** (target 1.3, social protection) | Matches people to pensions, cash transfers, food security and housing schemes, and helps them fix failed payments ("Why didn't my money come?") |
| **2 · Zero Hunger** | Farmer income support, crop and input subsidies, ration card (NFSA) schemes |
| **3 · Good Health** | Health cover schemes such as Ayushman Bharat and state health insurance |
| **4 · Quality Education** | Central and State scholarships for school and college students |
| **5 · Gender Equality** | Schemes for women, widows and girls, surfaced when relevant |
| **10 · Reduced Inequalities** | Schemes for SC/ST/OBC, minorities, persons with disabilities and transgender persons; free and usable on low-end phones and in Hindi |
| **16 · Peace, Justice and Strong Institutions** (target 16.10, public access to information) | Plain-language, verified information about public entitlements, with official links only |

## 2. Open licence

- **Software:** [MIT License](../LICENSE) (OSI-approved).
- **Data:** the scheme dataset is published under the [Open Data Commons Attribution License (ODC-By) v1.0](https://opendatacommons.org/licenses/by/1-0/) — see [Open data](#6-mechanism-for-extracting-data-and-content).
- **Name and logo:** the code is free to reuse, but the YojanaSahay name and logo may not be used to present another service as YojanaSahay ([Terms of Service](https://yojanasahay.vercel.app/terms.html), point 8).

## 3. Clear ownership

YojanaSahay is created, owned and maintained by **Sahnawaz Ahmed Laskar** (India).
- Copyright notice: [LICENSE](../LICENSE) and [README](../README.md#-license)
- Public pages: [About](https://yojanasahay.vercel.app/about.html) · [Press kit](https://yojanasahay.vercel.app/press.html) · [Contact](https://yojanasahay.vercel.app/contact.html)

## 4. Platform independence

The core of YojanaSahay has **no closed dependency**:
- The scheme database (`src/schemesData.js`, `src/states/`) and the eligibility rules (`src/eligibility.js`, `src/benefitMath.js`, `src/unlockPath.js`) are plain JavaScript. The eligibility checker runs entirely in the browser and works offline once loaded.
- The front end is React + Vite and builds to a static site that any web host can serve.

Optional services, and their open alternatives:

| Used for | Service today | Open alternative |
|---|---|---|
| Sign-in and saving a profile (optional — the checker works without an account) | Firebase Auth + Firestore | Supabase or Appwrite (both open source, self-hostable) |
| Server functions | Vercel serverless functions (standard Node.js handlers) | Any Node.js host, e.g. a self-hosted Node server or Netlify / Cloudflare functions |
| AI assistant | Groq, serving open-weight models through the OpenAI-compatible chat API | Any OpenAI-compatible server running open-weight models (e.g. vLLM or Ollama) — change the endpoint URL |
| Finding and checking official scheme pages | Tavily / Serper search APIs | SearXNG (open source) or plain page fetching |
| E-mail | Gmail SMTP (Nodemailer) / EmailJS | Any SMTP server |
| Telegram bot (optional channel) | Telegram Bot API | — (an extra channel; the app does not depend on it) |

## 5. Documentation

- [README](../README.md) — what the project does, how to install, configure (`.env.example`), run and build it
- Code comments at the top of every module explain its purpose and the rules it follows
- [How we verify information](https://yojanasahay.vercel.app/how-we-verify.html) — how scheme data is collected, checked and corrected
- [FAQ](https://yojanasahay.vercel.app/faq.html)

## 6. Mechanism for extracting data and content

The full scheme dataset is published in open, non-proprietary formats and refreshed on every update:
- **JSON:** https://yojanasahay.vercel.app/data/schemes.json
- **CSV:** https://yojanasahay.vercel.app/data/schemes.csv

Fields: id, names (English and Hindi), Central/State, state, ministry, benefit, yearly or one-time value and its kind, category, who can apply, documents needed, how to apply, official link, open/closed status and the page on YojanaSahay. The dataset contains **no personal data**.

Each scheme also has a public page in English (`/schemes/<id>.html`) and Hindi (`/yojana/<id>.html`), and a free embeddable widget is available at `/add-widget.html`.

## 7. Privacy and applicable laws

YojanaSahay is designed to follow India's **Digital Personal Data Protection Act, 2023** and the **Information Technology Act, 2000** and its rules.
- [Privacy Policy](https://yojanasahay.vercel.app/privacy.html) (English and Hindi summary) — what is collected, why, which service providers process it, and how long it is kept
- No sign-in is needed to use the eligibility checker, search or scheme pages
- Users can **delete their account and data inside the app**, or by e-mail ([account deletion](https://yojanasahay.vercel.app/contact.html))
- No advertising, no sale of data, no tracking for marketing
- A grievance contact is listed in the app (About → Grievance) as required by the IT Rules

## 8. Standards and best practices

- **Web:** installable Progressive Web App (Web App Manifest, service worker with offline support), responsive layout for small phones, dark mode
- **Android:** distributed as a Trusted Web Activity with Digital Asset Links
- **Search and data:** schema.org structured data (JSON-LD), XML sitemap, `hreflang` English/Hindi pages; open data in JSON and CSV (UTF-8)
- **Security:** secrets kept server-side only (environment variables); Firestore security rules with least-privilege access; HTTPS with HSTS; `frame-ancestors` protection; admin actions verified on the server
- **Information quality:** official government links only (`.gov.in`, `.nic.in` and similar); automatic link checks and source re-verification; visible "last verified" dates; users can report wrong information
- **Principles for Digital Development:** designed with the user (Hindi-first, low-literacy friendly, voice read-aloud), built for sustainability on free tiers, open data and open source, privacy by design

## 9. Do no harm by design

### 9A. Data privacy and security
- Personal data is minimal and optional (a profile only if the person signs in); the eligibility answers on the Telegram bot are never stored
- Data is protected by Firebase security rules; each user can read and change only their own data; admin access is limited to authorised YojanaSahay personnel who are bound to keep it confidential
- Accounts and data can be deleted by the user at any time
- No payment, OTP, Aadhaar number or bank details are ever asked for; the app warns users never to pay agents or share an OTP
- The app never presents itself as a government service, and repeatedly tells users to apply only on official websites — protecting them from look-alike scam sites. A built-in **"Is this message real?"** tool helps people spot fake scheme messages and links

### 9B. Inappropriate and illegal content
- Users do not publish content to other users. Text people send (problem reports, scheme requests) is private and reviewed only by YojanaSahay
- AI answers are clearly labelled as AI, limited to government-scheme topics, and can be reported by any user (long-press → Report); reports are reviewed in the admin dashboard and fixed or removed
- The [Terms of Service](https://yojanasahay.vercel.app/terms.html) prohibit misuse, false reports and impersonation; accounts that break them can be suspended
- Any illegal content, including child sexual abuse material, would be removed immediately and reported to the authorities as required by Indian law

### 9C. Protection from harassment
- There is no user-to-user messaging, comments or public profiles, so users cannot contact or harass each other through YojanaSahay
- The service is meant for adults; minors may use it under a parent's or guardian's supervision (Terms of Service, point 10). No content is targeted at children and no data about children is sought
- Concerns can be raised at yojanasahayofficial@gmail.com or through the in-app grievance contact

---

*Last reviewed: October 2026. Questions: yojanasahayofficial@gmail.com*
