// src/scamCheck.js — Yojana Sahay · "Is this message real?"
// ─────────────────────────────────────────────────────────────────────────────
// Looks at a pasted WhatsApp forward / SMS / link and finds the signs that
// matter: where its links really go (official .gov.in / .nic.in or not, link
// shorteners, look-alike "gov" sites, risky domain endings, app downloads),
// classic scam wording (fee, OTP, urgency, "forward to 10 groups", free gifts),
// and which REAL schemes it talks about (with their official link).
// The AI assistant (agentTools.js → check_message) turns this into a verdict.
// Rule-based and offline — no data leaves the phone for this part.
// ─────────────────────────────────────────────────────────────────────────────
import { isOfficialUrl, findSchemesInText, officialSchemeLink } from "./schemeMatch.js";

const SHORTENERS = /^(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|rb\.gy|is\.gd|shorturl\.at|tiny\.cc|goo\.gl|ow\.ly|s\.id|v\.gd|t\.ly|shorturl\.asia|rebrand\.ly|bitly\.ws|surl\.li|u\.to)$/i;
const RISKY_TLD = /\.(xyz|top|online|site|click|info|live|buzz|shop|club|icu|cyou|monster|rest|fun|space|website|work|link|win|loan|today|store|in\.net|co\.in\.[a-z]+)$/i;
const CHAT_LINKS = /^(wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com|t\.me|telegram\.me)$/i;
const FREE_HOSTS = /(\.blogspot\.|\.wordpress\.com$|\.weebly\.com$|\.wixsite\.com$|\.000webhostapp\.com$|\.netlify\.app$|\.vercel\.app$|\.web\.app$|\.firebaseapp\.com$|sites\.google\.com$|forms\.gle$|docs\.google\.com$)/i;

const FLAGS = [
  { k: "fee",      re: /(registration|processing|form|application|verification|activation)\s*(fee|charge|charges)|pay\s*(₹|rs\.?|inr)?\s*\d+|₹\s*\d+\s*(fee|pay|jama|bhare|bharo|bhejo)|fee\s*(jama|bharo|bhare)|शुल्क|फीस\s*(जमा|भरें|भरो)|पैसे\s*(जमा|भेजें|भेजो)|upi\s*(id|pe|par)|gpay|phonepe\s*(kare|karo|number)/i,
    en: "asks you to pay a fee or send money — real government schemes never charge to register", hi: "पैसे या फीस मांगता है — असली सरकारी योजनाएं पंजीकरण के पैसे नहीं लेतीं" },
  { k: "otp",      re: /\botp\b|one[\s-]?time password|\bpin\b|\bcvv\b|password|atm\s*(card)?\s*(number|details)|bank\s*(details|account number)|aadhaar\s*(number|no\.?)?\s*(aur|and|\+|&)\s*otp|ओटीपी|पासवर्ड|पिन नंबर/i,
    en: "asks for an OTP, PIN, password or bank details — never share these with anyone", hi: "OTP, PIN, पासवर्ड या बैंक जानकारी मांगता है — ये कभी किसी को न दें" },
  { k: "urgency",  re: /only today|today only|last (date|day) today|hurry|limited (seats|time|offer)|expires? (today|tonight|in \d+)|within \d+ (hours|hrs|minutes)|aaj hi|jaldi (karo|kare|karein)|sirf aaj|आज ही|जल्दी करें|सिर्फ आज|अंतिम मौका|last chance/i,
    en: "pushes you to hurry (\"only today\", \"last chance\") — a common pressure trick", hi: "जल्दी करने का दबाव डालता है (\"सिर्फ आज\", \"अंतिम मौका\") — यह धोखेबाज़ों की आम चाल है" },
  { k: "forward",  re: /(forward|share|send)\s*(this|it|to)?\s*(to)?\s*\d+\s*(groups?|people|friends|contacts)|\d+\s*(groups?|logon?|dosto)\s*(me|mein|ko)\s*(share|forward|bhejo|bheje)|आगे भेजें|फॉरवर्ड करें|\d+\s*ग्रुप/i,
    en: "asks you to forward it to many groups — official schemes never need that", hi: "कई ग्रुप में आगे भेजने को कहता है — असली योजनाओं में ऐसा नहीं होता" },
  { k: "giveaway", re: /free\s*(laptop|mobile|phone|smartphone|tablet|scooty|bike|recharge|data|internet|gas cylinder|solar panel|tractor)\b|(sabhi|sab|har)\s*(ko|kisi ko)\s*(₹|rs\.?)?\s*\d+|everyone (gets|will get)|lottery|you (have )?won|winner|kbc|lucky draw|इनाम|लॉटरी|मुफ्त\s*(लैपटॉप|मोबाइल|स्कूटी|रिचार्ज)|सभी को\s*₹/i,
    en: "promises a free gift or money to everyone — the most common fake-scheme pattern", hi: "सबको मुफ्त सामान या पैसे का वादा करता है — फर्जी योजनाओं का सबसे आम तरीका" },
  { k: "apk",      re: /\.apk\b|download (this|the)? ?app (from|via) (this )?link|install (this|the) app from|ऐप डाउनलोड करें.*लिंक/i,
    en: "asks you to install an app from a link — this can steal your bank details", hi: "लिंक से ऐप डाउनलोड करने को कहता है — इससे बैंक जानकारी चोरी हो सकती है" },
];

const URL_RE = /\bhttps?:\/\/[^\s<>()"'`]+|\bwww\.[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s<>()"'`]*|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:gov\.in|nic\.in|in|com|org|net|xyz|top|online|site|click|info|live|buzz|shop|club|icu|ly|gl|me|co|app)\b(?:\/[^\s<>()"'`]*)?/gi;

function hostOf(u) {
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

export function checkMessage(raw, lang = "en") {
  const text = String(raw || "").slice(0, 4000);
  const isHi = lang === "hi";
  const seen = new Set();
  const links = [];
  for (const m of text.match(URL_RE) || []) {
    const url = m.replace(/[.,;:!?)\]]+$/, "");
    const host = hostOf(url);
    if (!host || seen.has(host) || /^\d+(\.\d+)*$/.test(host)) continue;
    if (/\.(jpg|png|pdf)$/i.test(host)) continue;
    seen.add(host);
    const official = isOfficialUrl(`https://${host}`);
    const lookalike = !official && /(gov|govt|sarkar|yojana|yojna|pmkisan|pm-kisan|aadhaar|uidai|ayushman|scheme)/i.test(host);
    const kind = official ? "official"
      : SHORTENERS.test(host) ? "shortener"
      : CHAT_LINKS.test(host) ? "chat_group"
      : lookalike ? "lookalike"
      : RISKY_TLD.test(host) ? "risky_domain"
      : FREE_HOSTS.test(host) ? "free_website"
      : "unofficial";
    links.push({ host, kind });
  }
  const flags = FLAGS.filter(f => f.re.test(text)).map(f => ({ key: f.k, why: isHi ? f.hi : f.en }));
  for (const l of links) {
    const why = {
      shortener: [`"${l.host}" is a link shortener that hides where it really goes`, `"${l.host}" छोटा किया हुआ लिंक है — असली पता छिपाता है`],
      lookalike: [`"${l.host}" pretends to be a government site but is not .gov.in / .nic.in`, `"${l.host}" सरकारी साइट जैसा दिखता है पर .gov.in / .nic.in नहीं है`],
      risky_domain: [`"${l.host}" uses a domain ending often used by scam sites`, `"${l.host}" ऐसा डोमेन है जो अक्सर धोखेबाज़ साइटें इस्तेमाल करती हैं`],
      chat_group: [`the link opens a WhatsApp/Telegram chat, not a government website`, `लिंक WhatsApp/Telegram चैट खोलता है, सरकारी वेबसाइट नहीं`],
      free_website: [`"${l.host}" is a free website/form anyone can make`, `"${l.host}" मुफ्त वेबसाइट/फॉर्म है जिसे कोई भी बना सकता है`],
    }[l.kind];
    if (why) flags.push({ key: `link_${l.kind}`, why: why[isHi ? 1 : 0] });
  }
  const schemes = findSchemesInText(text, 3).map(s => ({
    id: s.id, name: s.name?.[lang] || s.name?.en, benefit: s.benefit?.[lang] || s.benefit?.en,
    official_link: officialSchemeLink(s) || null, closed: !!s.closed,
    scope: s.scope === "state" ? s.state : "All India",
  }));
  const strong = flags.some(f => ["fee", "otp", "apk", "link_shortener", "link_lookalike", "link_risky_domain"].includes(f.key));
  const officialOnly = links.length > 0 && links.every(l => l.kind === "official");
  const verdict = strong || flags.length >= 2 ? "likely_fake"
    : officialOnly && !flags.length ? "looks_real"
    : "unverified";
  return {
    verdict,
    links,
    red_flags: flags.map(f => f.why),
    real_schemes_mentioned: schemes,
    note: verdict === "looks_real"
      ? "All links are official government websites and no scam signs were found. Still apply only on the official site."
      : schemes.length
        ? "Compare the message with the real scheme details below; the official link is the only safe place to apply."
        : "No scheme in the app matches this message — a scheme nobody has heard of is a warning sign. A web search can confirm.",
  };
}
