// api/_lib/telegramBot.js — Yojana Sahay · eligibility checker on Telegram
// ─────────────────────────────────────────────────────────────────────────────
// Reached at /api/telegram (vercel.json rewrites it to /api/stats?via=telegram
// so it doesn't need a function of its own).
//
//   POST from Telegram (webhook)  — header X-Telegram-Bot-Api-Secret-Token
//   POST from the admin dashboard — Authorization: Bearer <admin token>,
//                                   body { op: "status" | "connect" | "disconnect" }
//
// The whole quiz lives in the buttons' data (src/quizCode.js): nothing the
// person answers is stored on our server — only anonymous counters.
// Uses the app's own rules (eligibility.js, benefitMath.js, unlockPath.js) so
// the bot and the app always give the same answer.
// Needs one env var: TELEGRAM_BOT_TOKEN (from @BotFather).
// ─────────────────────────────────────────────────────────────────────────────
import crypto from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebaseAdmin.js";
import { verifyAdminRequest } from "./adminAuth.js";
import { matchedSchemesFor } from "../../src/eligibility.js";
import { benefitSummary, topBenefits, valueLabel } from "../../src/benefitMath.js";
import { schemePageUrl, officialSchemeLink, SITE_URL } from "../../src/schemeMatch.js";
import { SCHEME_DB } from "../../src/schemesData.js";
import { scoreSchemes } from "../../src/groqClient.js";
import { whoCanApply } from "../../src/eligibilityText.js";
import { unlockSteps, UNLOCK_QUESTIONS, UNLOCK_GROUPS } from "../../src/unlockPath.js";
import { QUIZ, decodeQuiz, encodeAnswer, nextQuizQuestion } from "../../src/quizCode.js";

const WEBHOOK_URL = `${SITE_URL}/api/telegram`;
const BOT_LINK = `https://t.me/${(process.env.TELEGRAM_BOT_USERNAME || "YojanaSahayBot").replace(/^@/, "")}`;
const BY_ID = new Map(SCHEME_DB.map(s => [s.id, s]));
const token = () => (process.env.TELEGRAM_BOT_TOKEN || "").trim();
// The webhook secret is derived from the bot token — no second env var.
const secret = () => crypto.createHash("sha256").update(`ys-telegram:${token()}`).digest("hex").slice(0, 48);

async function tg(method, body) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}), signal: ctl.signal,
    });
    const d = await r.json().catch(() => ({}));
    if (!d.ok) console.warn(`[telegram] ${method} failed:`, d.description || r.status);
    return d;
  } catch (e) {
    console.warn(`[telegram] ${method} error:`, e.message);
    return { ok: false, description: e.message };
  } finally { clearTimeout(t); }
}

// ── Text ─────────────────────────────────────────────────────────────────────
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rs = n => "₹" + Math.round(n).toLocaleString("en-IN");

const Q_TEXT = {
  who:    { en: "Who are you?", hi: "आप कौन हैं?",
            opts: { farmer: ["Farmer 🌾", "किसान 🌾"], student: ["Student 📚", "छात्र 📚"], women: ["Woman / homemaker 👩", "महिला / गृहिणी 👩"], senior: ["Senior citizen 👴", "वरिष्ठ नागरिक 👴"], business: ["Self-employed / business 💼", "स्वरोज़गार / व्यापार 💼"], general: ["Other / general 🧑", "अन्य / सामान्य 🧑"] } },
  state:  { en: "Which state do you live in?", hi: "आप किस राज्य में रहते हैं?" },
  age:    { en: "Your age?", hi: "आपकी उम्र?",
            opts: { below18: ["Below 18", "18 से कम"], "18to35": ["18–35", "18–35"], "35to60": ["35–60", "35–60"], above60: ["60 or above", "60 या ज़्यादा"] } },
  gender: { en: "Are you female or male?", hi: "आप महिला हैं या पुरुष?",
            opts: { female: ["Female 👩", "महिला 👩"], male: ["Male 👨", "पुरुष 👨"], other: ["Transgender / Other", "ट्रांसजेंडर / अन्य"] } },
  income: { en: "Total family income in a year?", hi: "परिवार की कुल सालाना आय?",
            opts: { below1: ["Below ₹1 lakh", "₹1 लाख से कम"], "1to3": ["₹1–3 lakh", "₹1–3 लाख"], "3to6": ["₹3–6 lakh", "₹3–6 लाख"], above6: ["Above ₹6 lakh", "₹6 लाख से ज़्यादा"] } },
  caste:  { en: "Your category?", hi: "आपकी श्रेणी?",
            opts: { general: ["General", "सामान्य"], obc: ["OBC", "OBC"], sc: ["SC", "SC"], st: ["ST", "ST"], ews: ["EWS", "EWS"] } },
  area:   { en: "Where do you live?", hi: "आप कहां रहते हैं?",
            opts: { rural: ["Village 🏡", "गांव 🏡"], semi: ["Small town 🏘️", "कस्बा 🏘️"], urban: ["City 🏙️", "शहर 🏙️"] } },
  house:  { en: "Do you own a pucca house?", hi: "क्या आपके पास पक्का मकान है?",
            opts: { no: ["No house", "मकान नहीं"], kutcha: ["Kutcha house", "कच्चा मकान"], yes: ["Yes, pucca", "हां, पक्का"] } },
  educationLevel: { en: "What are you studying now?", hi: "आप अभी क्या पढ़ रहे हैं?",
            opts: { class1to8: ["Class 1–8", "कक्षा 1–8"], class9to12: ["Class 9–12", "कक्षा 9–12"], undergrad: ["Graduation / Diploma", "स्नातक / डिप्लोमा"], postgrad: ["Post-graduation", "स्नातकोत्तर"] } },
  landHolding: { en: "How much farm land do you own?", hi: "आपके पास कितनी खेती की ज़मीन है?",
            opts: { below1: ["Below 1 acre", "1 एकड़ से कम"], "1to2": ["1–2 acres", "1–2 एकड़"], "2to5": ["2–5 acres", "2–5 एकड़"], "5plus": ["5+ acres", "5+ एकड़"] } },
};
const L = (lang, en, hi) => (lang === "h" ? hi : en);
const NOTE = {
  e: "ℹ️ YojanaSahay is a free, independent guide — not a government service. Always apply on the official website or office. Never pay anyone or share an OTP to get a scheme.\n🔒 Your answers are not saved.",
  h: "ℹ️ YojanaSahay एक मुफ़्त, स्वतंत्र गाइड है — सरकारी सेवा नहीं। आवेदन हमेशा आधिकारिक वेबसाइट या कार्यालय में करें। योजना के लिए किसी को पैसे या OTP न दें।\n🔒 आपके जवाब सेव नहीं किए जाते।",
};

// ── Quiz state <-> button data ───────────────────────────────────────────────
// "L:e" choose language · "A:<l><code>:<n>" answer · "P:<l><code>:<page>" state page
// "B:<l><code>" back · "R:<l>" restart
function encodeAll(answers) {
  let s = "";
  for (const q of QUIZ) {
    if (q.when && !q.when(answers)) continue;
    if (answers[q.id] == null) break;
    s += encodeAnswer(q, q.values.indexOf(answers[q.id]));
  }
  return s;
}
function withoutLast(answers) {
  const asked = QUIZ.filter(q => answers[q.id] != null);
  const a = { ...answers };
  if (asked.length) delete a[asked[asked.length - 1].id];
  return a;
}

const STATE_PAGE = 12;
function questionView(lang, answers, page = 0) {
  const q = nextQuizQuestion(answers);
  const code = encodeAll(answers);
  const total = QUIZ.filter(x => !x.when || x.when(answers)).length;
  const n = QUIZ.filter(x => answers[x.id] != null).length + 1;
  const T = Q_TEXT[q.id];
  const head = `<b>${answers.who ? L(lang, `Question ${n} of ${total}`, `सवाल ${n} / ${total}`) : L(lang, `Question ${n}`, `सवाल ${n}`)}</b>\n\n${esc(lang === "h" ? T.hi : T.en)}`;
  const rows = [];
  if (q.wide) {
    const pages = Math.ceil(q.values.length / STATE_PAGE);
    const p = Math.max(0, Math.min(page, pages - 1));
    const slice = q.values.slice(p * STATE_PAGE, (p + 1) * STATE_PAGE);
    for (let i = 0; i < slice.length; i += 2) {
      rows.push(slice.slice(i, i + 2).map((v, j) => ({ text: v, callback_data: `A:${lang}${code}:${p * STATE_PAGE + i + j}` })));
    }
    const nav = [];
    if (p > 0) nav.push({ text: L(lang, "◀ Back", "◀ पीछे"), callback_data: `P:${lang}${code}:${p - 1}` });
    nav.push({ text: `${p + 1}/${pages}`, callback_data: `P:${lang}${code}:${p}` });
    if (p < pages - 1) nav.push({ text: L(lang, "More ▶", "और ▶"), callback_data: `P:${lang}${code}:${p + 1}` });
    rows.push(nav);
  } else {
    const btns = q.values.map((v, i) => ({ text: (T.opts[v] || [v, v])[lang === "h" ? 1 : 0], callback_data: `A:${lang}${code}:${i}` }));
    for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  }
  if (code) rows.push([{ text: L(lang, "↩ Change last answer", "↩ पिछला जवाब बदलें"), callback_data: `B:${lang}${code}` }]);
  return { text: head, reply_markup: { inline_keyboard: rows } };
}

function resultView(lang, answers) {
  const hi = lang === "h";
  const all = matchedSchemesFor({ ...answers });
  const sum = benefitSummary(all);
  const top = topBenefits(all, 8);
  const shownIds = new Set(top.map(x => x.s.id));
  const rest = all.filter(s => !shownIds.has(s.id)).slice(0, Math.max(0, 10 - top.length));
  const lines = [];
  lines.push(`✅ <b>${L(lang, `You may qualify for ${all.length} schemes`, `आप ${all.length} योजनाओं के पात्र हो सकते हैं`)}</b>`);
  const money = [];
  if (sum.yearly > 0) money.push(L(lang, `about ${rs(sum.yearly)} a year`, `लगभग ${rs(sum.yearly)} सालाना`));
  if (sum.oneTime > 0) money.push(L(lang, `${rs(sum.oneTime)} one-time support`, `${rs(sum.oneTime)} एकमुश्त मदद`));
  if (sum.health > 0) money.push(L(lang, `health cover up to ${rs(sum.health)}`, `${rs(sum.health)} तक इलाज कवर`));
  if (money.length) lines.push(`💰 ${money.join(" · ")}`);
  lines.push("");
  const item = (s, i) => {
    const v = valueLabel(s, hi ? "hi" : "en");
    return `${i + 1}. <a href="${schemePageUrl(s, hi ? "hi" : "en")}">${esc(s.name?.[hi ? "hi" : "en"] || s.name?.en)}</a>${v ? ` — ${esc(v)}` : ""}`;
  };
  if (top.length || rest.length) {
    lines.push(`<b>${L(lang, "Top schemes for you:", "आपके लिए मुख्य योजनाएं:")}</b>`);
    [...top.map(x => x.s), ...rest].forEach((s, i) => lines.push(item(s, i)));
  } else {
    lines.push(L(lang, "No exact matches with these answers — try the full check in the app, it asks a few more questions.", "इन जवाबों से कोई सटीक योजना नहीं मिली — ऐप में पूरी जांच करें, उसमें कुछ और सवाल हैं।"));
  }
  // The single step that opens the most schemes next.
  try {
    const step = unlockSteps(answers, 1)[0];
    if (step) {
      const title = step.kind === "question" ? UNLOCK_QUESTIONS[step.field]?.[hi ? "hi" : "en"]
        : step.kind === "group" ? UNLOCK_GROUPS[step.group]?.[hi ? "hi" : "en"]
        : L(lang, "Get a priority (BPL) ration card", "प्राथमिकता (BPL) राशन कार्ड बनवाएं");
      if (title) { lines.push(""); lines.push(`🔓 <b>${L(lang, "Next step:", "अगला कदम:")}</b> ${esc(title)} ${L(lang, `— could open ${step.count} more schemes. Answer it in the app.`, `— ${step.count} और योजनाएं खुल सकती हैं। ऐप में जवाब दें।`)}`); }
    }
  } catch {}
  if (top.length || rest.length) { lines.push(""); lines.push(L(lang, "👇 Tap a number for that scheme's details.", "👇 किसी योजना का पूरा विवरण देखने के लिए उसका नंबर दबाएं।")); }
  lines.push("");
  lines.push(NOTE[lang] || NOTE.e);
  const code = encodeAll(answers);
  return {
    text: lines.join("\n"),
    reply_markup: { inline_keyboard: [
      ...detailRows(lang, [...top.map(x => x.s), ...rest]),
      [{ text: L(lang, `📱 See all ${all.length} in the app`, `📱 सभी ${all.length} ऐप में देखें`), url: `${SITE_URL}/?quiz=${code}` }],
      [{ text: L(lang, "🔄 Check again", "🔄 फिर से जांचें"), callback_data: `R:${lang}` }, { text: hi ? "English" : "हिंदी", callback_data: `A:${hi ? "e" : "h"}${code}:x` }],
      [shareButton(lang)],
    ] },
  };
}

// ── Scheme details, search, sharing ──────────────────────────────────────────
function shareButton(lang) {
  const text = L(lang, "Check which government schemes you may qualify for — free, in Hindi & English:", "जानें आप किन सरकारी योजनाओं के पात्र हो सकते हैं — मुफ़्त, हिंदी और English में:");
  return { text: L(lang, "📤 Share with family & friends", "📤 परिवार और दोस्तों को भेजें"), url: `https://t.me/share/url?url=${encodeURIComponent(BOT_LINK)}&text=${encodeURIComponent(text)}` };
}
// Number buttons 1…n that open each listed scheme's details.
function detailRows(lang, list) {
  const btns = list.slice(0, 10).filter(s => s.id.length <= 50).map((s, i) => ({ text: String(i + 1), callback_data: `S:${lang}:${s.id}` }));
  const rows = [];
  for (let i = 0; i < btns.length; i += 5) rows.push(btns.slice(i, i + 5));
  return rows;
}
function detailView(lang, s) {
  const hi = lang === "h", k = hi ? "hi" : "en";
  const lines = [`<b>${esc(s.name?.[k] || s.name?.en)}</b>`];
  if (s.closed) lines.push(L(lang, "⛔ This scheme is closed for new applications.", "⛔ इस योजना में अभी नए आवेदन बंद हैं।"));
  if (s.benefit?.[k] || s.benefit?.en) lines.push(`🎁 ${esc(s.benefit?.[k] || s.benefit?.en)}`);
  const v = valueLabel(s, k); if (v) lines.push(`💰 ${esc(v)}`);
  lines.push(`📍 ${s.scope === "national" ? L(lang, "Central Government — all of India", "केंद्र सरकार — पूरे भारत में") : esc(s.state || "")}`);
  let who = []; try { const w = whoCanApply(s, k); who = Array.isArray(w) ? w : w ? [String(w)] : []; } catch {}
  if (who.length) { lines.push(""); lines.push(`<b>${L(lang, "Who can apply", "कौन आवेदन कर सकता है")}</b>`); who.slice(0, 6).forEach(x => lines.push(`• ${esc(x)}`)); }
  const docs = s.docs?.[k] || s.docs?.en || [];
  if (docs.length) { lines.push(""); lines.push(`<b>${L(lang, "Documents needed", "ज़रूरी दस्तावेज़")}</b>`); docs.slice(0, 8).forEach(x => lines.push(`• ${esc(x)}`)); }
  lines.push("");
  lines.push(`<b>${L(lang, "How to apply", "आवेदन कैसे करें")}:</b> ${s.applyType === "online" ? L(lang, "online, on the official website", "ऑनलाइन, आधिकारिक वेबसाइट पर") : L(lang, "at the office or a Common Service Centre (CSC)", "कार्यालय या कॉमन सर्विस सेंटर (CSC) पर")}`);
  lines.push(L(lang, "⚠️ Applying is free. Never pay an agent or share an OTP.", "⚠️ आवेदन मुफ़्त है। किसी एजेंट को पैसे या OTP न दें।"));
  const official = officialSchemeLink(s);
  const rows = [];
  if (official) rows.push([{ text: L(lang, "🏛️ Official website", "🏛️ आधिकारिक वेबसाइट"), url: official }]);
  rows.push([{ text: L(lang, "📄 Full details", "📄 पूरा विवरण"), url: schemePageUrl(s, k) }, { text: L(lang, "✅ Do I qualify?", "✅ क्या मैं पात्र हूं?"), callback_data: `L:${lang}` }]);
  return { text: lines.join("\n"), reply_markup: { inline_keyboard: rows } };
}

const STOP = new Set(["for", "of", "the", "a", "an", "to", "in", "my", "me", "is", "how", "what", "apply", "scheme", "schemes", "yojana", "ka", "ki", "ke", "ko", "me", "mein", "hai", "kya", "kaise", "kare", "karna", "mujhe", "mera", "meri", "chahiye", "liye", "nahi", "aaya", "paisa", "money", "not", "received", "की", "का", "के", "में", "है", "क्या", "कैसे", "योजना", "मुझे", "लिए"]);
const normq = t => String(t || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function searchSchemes(q) {
  const words = normq(q).split(" ").filter(w => w.length > 1 && !STOP.has(w));
  const live = s => s && !s.closed && !s.duplicateOf;
  const named = words.length ? SCHEME_DB.filter(s => live(s) && words.every(w => normq(`${s.name?.en} ${s.name?.hi}`).includes(w))) : [];
  named.sort((a, b) => (a.scope === "national" ? 0 : 1) - (b.scope === "national" ? 0 : 1) || (a.name?.en || "").length - (b.name?.en || "").length);
  let scored = [];
  try { scored = scoreSchemes(String(q), null, null).scored.filter(x => live(x.scheme)).map(x => ({ s: x.scheme, r: x.score + (x.scheme.scope === "national" ? 6 : 0) })).sort((a, b) => b.r - a.r).map(x => x.s); } catch {}
  const out = [];
  for (const s of [...named, ...scored]) { if (!out.some(x => x.id === s.id)) out.push(s); if (out.length >= 5) break; }
  return out;
}
const looksHindi = t => /[\u0900-\u097F]/.test(t) || /\b(ka|ki|ke|hai|nahi|kaise|mujhe|chahiye|liye|paisa|kya|mera|meri)\b/i.test(t);
const MONEY_RE = /paisa nahi|nahi aaya|nahin aaya|not received|didn'?t (get|receive|come)|not come|stopped coming|पैसा नहीं|नहीं आया|बंद हो गया/i;

async function onSearch(chat_id, text) {
  const lang = looksHindi(text) ? "h" : "e";
  const found = searchSchemes(text);
  const lines = [];
  if (MONEY_RE.test(text)) {
    lines.push(L(lang, "💸 <b>Money not received?</b> Our step-by-step check finds the likely reason (Aadhaar–bank link, e-KYC, name mismatch…) and the fix:", "💸 <b>पैसा नहीं आया?</b> हमारी कदम-दर-कदम जांच संभावित कारण (आधार–बैंक लिंक, e-KYC, नाम में अंतर…) और उसका हल बताती है:"));
    lines.push(`${SITE_URL}/?go=money`);
    lines.push("");
  }
  if (found.length) {
    lines.push(`<b>${L(lang, "Schemes that match:", "मिलती-जुलती योजनाएं:")}</b>`);
    found.forEach((s, i) => lines.push(`${i + 1}. ${esc(s.name?.[lang === "h" ? "hi" : "en"] || s.name?.en)}${s.scope === "national" || String(s.name?.en || "").includes(s.state) ? "" : ` (${esc(s.state)})`}`));
    lines.push("");
    lines.push(L(lang, "👇 Tap a number for details.", "👇 विवरण के लिए नंबर दबाएं।"));
  } else if (!lines.length) {
    lines.push(L(lang, "I couldn't find a scheme for that. Try a scheme name (like \"PM Kisan\") or a need (like \"widow pension\", \"scholarship\") — or check which schemes fit you:", "इसके लिए कोई योजना नहीं मिली। योजना का नाम (जैसे \"पीएम किसान\") या ज़रूरत (जैसे \"विधवा पेंशन\", \"छात्रवृत्ति\") लिखें — या जांचें कि कौन सी योजनाएं आपके लिए हैं:"));
  }
  await tg("sendMessage", { chat_id, parse_mode: "HTML", disable_web_page_preview: true, text: lines.join("\n"),
    reply_markup: { inline_keyboard: [...detailRows(lang, found), [{ text: L(lang, "✅ Check which schemes I qualify for", "✅ जांचें मैं किन योजनाओं का पात्र हूं"), callback_data: `L:${lang}` }]] } });
  await bump("searched");
}

const welcome = (name) => ({
  text: `🙏 <b>${esc(name ? `Namaste ${name}!` : "Namaste!")}</b>\n\nFind the government schemes you may qualify for — a few quick questions, free.\nसरकारी योजनाएं जिनके आप पात्र हो सकते हैं — कुछ आसान सवाल, मुफ़्त।\n\n💬 You can also type a scheme name or a need, like "PM Kisan" or "widow pension".\n💬 आप योजना का नाम या ज़रूरत भी लिख सकते हैं, जैसे "पीएम किसान" या "विधवा पेंशन"।\n\n<b>Choose your language / भाषा चुनें:</b>`,
  reply_markup: { inline_keyboard: [[{ text: "English", callback_data: "L:e" }, { text: "हिंदी", callback_data: "L:h" }], [shareButton("e")]] },
});

// ── Counters (anonymous) ─────────────────────────────────────────────────────
async function bump(field) {
  try {
    const db = getAdminDb(); if (!db) return;
    const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
    await db.collection("appStats").doc("telegram").set({ [field]: FieldValue.increment(1), days: { [day]: { [field]: FieldValue.increment(1) } }, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) { console.warn("[telegram] counter failed:", e.message); }
}

// ── Updates ──────────────────────────────────────────────────────────────────
async function onMessage(m) {
  const chat_id = m.chat?.id;
  if (!chat_id || m.chat?.type !== "private") return; // groups: stay quiet
  const text = String(m.text || "").trim();
  const greeting = /^(hi|hii+|hello|hey|namaste|namaskar|start|नमस्ते|नमस्कार|हेलो)\b[!. ]*$/i.test(text);
  if (text && !text.startsWith("/") && !greeting && text.length >= 2) return onSearch(chat_id, text.slice(0, 200));
  if (/^\/(start|check)/i.test(text) || !text.startsWith("/")) {
    await tg("sendMessage", { chat_id, parse_mode: "HTML", ...welcome(m.from?.first_name) });
    if (/^\/start/i.test(text)) await bump("started");
    return;
  }
  if (/^\/help/i.test(text)) {
    await tg("sendMessage", { chat_id, parse_mode: "HTML", disable_web_page_preview: true,
      text: `${NOTE.e}\n\n${NOTE.h}\n\n/check — start a new check / नई जांच\n\n🌐 ${SITE_URL}\n📧 yojanasahayofficial@gmail.com` });
    return;
  }
  await tg("sendMessage", { chat_id, parse_mode: "HTML", ...welcome(m.from?.first_name) });
}

async function onCallback(cq) {
  const data = String(cq.data || "");
  const chat_id = cq.message?.chat?.id, message_id = cq.message?.message_id;
  await tg("answerCallbackQuery", { callback_query_id: cq.id });
  if (!chat_id || !message_id) return;
  const show = (view) => tg("editMessageText", { chat_id, message_id, parse_mode: "HTML", disable_web_page_preview: true, ...view });

  let m;
  if ((m = /^S:([eh]):([A-Za-z0-9_-]{1,50})$/.exec(data))) {
    const s = BY_ID.get(m[2]);
    if (s) await tg("sendMessage", { chat_id, parse_mode: "HTML", disable_web_page_preview: true, ...detailView(m[1], s) });
    return;
  }
  if ((m = /^L:([eh])$/.exec(data)) || (m = /^R:([eh])$/.exec(data))) return show(questionView(m[1], {}));
  if ((m = /^P:([eh])([0-9a-z]*):(\d{1,2})$/.exec(data))) {
    const { answers, bad } = decodeQuiz(m[2]);
    if (bad || !nextQuizQuestion(answers)) return show(questionView(m[1], {}));
    return show(questionView(m[1], answers, Number(m[3])));
  }
  if ((m = /^B:([eh])([0-9a-z]*)$/.exec(data))) {
    const { answers } = decodeQuiz(m[2]);
    return show(questionView(m[1], withoutLast(answers)));
  }
  if ((m = /^A:([eh])([0-9a-z]*):(\d{1,2}|x)$/.exec(data))) {
    const lang = m[1];
    const { answers, done, bad } = decodeQuiz(m[2]);
    if (bad) return show(questionView(lang, {}));
    if (m[3] === "x") return show(done ? resultView(lang, answers) : questionView(lang, answers)); // language switch
    if (done) return show(resultView(lang, answers));
    const q = nextQuizQuestion(answers);
    const i = Number(m[3]);
    if (!q || !(i >= 0 && i < q.values.length)) return show(questionView(lang, answers));
    const next = { ...answers, [q.id]: q.values[i] };
    if (nextQuizQuestion(next)) return show(questionView(lang, next));
    await show(resultView(lang, next));
    await bump("finished");
    return;
  }
}

// ── Admin: status / connect / disconnect ─────────────────────────────────────
async function adminOp(req, res) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const op = req.body?.op || "status";
  let counters = null;
  try { const snap = await getAdminDb()?.collection("appStats").doc("telegram").get(); counters = snap?.exists ? snap.data() : null; } catch {}
  if (!token()) return res.status(200).json({ configured: false, counters });

  if (op === "connect") {
    const r = await tg("setWebhook", { url: WEBHOOK_URL, secret_token: secret(), allowed_updates: ["message", "callback_query"], drop_pending_updates: true, max_connections: 20 });
    if (!r.ok) return res.status(502).json({ error: r.description || "Telegram did not accept the webhook" });
    await tg("setMyCommands", { commands: [{ command: "check", description: "Check which schemes you qualify for" }, { command: "help", description: "About YojanaSahay" }] });
    await tg("setMyCommands", { language_code: "hi", commands: [{ command: "check", description: "जांचें कि आप किन योजनाओं के पात्र हैं" }, { command: "help", description: "योजना सहाय के बारे में" }] });
    await tg("setMyShortDescription", { short_description: "Free check: which Indian government schemes you may qualify for. Independent guide — not a government service." });
    await tg("setMyDescription", { description: "YojanaSahay finds the Central and State government schemes you may qualify for — a few quick questions, in English or Hindi. Free. An independent guide, not a government service. Your answers are not saved. योजना सहाय — कुछ सवालों में जानें कि आप किन सरकारी योजनाओं के पात्र हो सकते हैं।" });
  }
  if (op === "disconnect") await tg("deleteWebhook", { drop_pending_updates: true });

  const [me, wh] = await Promise.all([tg("getMe"), tg("getWebhookInfo")]);
  return res.status(200).json({
    configured: true,
    bot: me.ok ? { username: me.result.username, name: me.result.first_name } : null,
    tokenError: me.ok ? null : (me.description || "Token not accepted by Telegram"),
    connected: !!(wh.ok && wh.result?.url === WEBHOOK_URL),
    webhook: wh.ok ? { url: wh.result.url || "", pending: wh.result.pending_update_count || 0, lastError: wh.result.last_error_message || null, lastErrorAt: wh.result.last_error_date ? wh.result.last_error_date * 1000 : null } : null,
    counters,
  });
}

export default async function telegramHandler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const header = req.headers["x-telegram-bot-api-secret-token"];
  if (header != null) {
    if (!token() || header !== secret()) return res.status(401).end();
    const u = req.body || {};
    try {
      if (u.message) await onMessage(u.message);
      else if (u.callback_query) await onCallback(u.callback_query);
    } catch (e) { console.error("[telegram] update failed:", e.message); }
    return res.status(200).json({ ok: true }); // always 200 so Telegram doesn't retry forever
  }
  return adminOp(req, res);
}
