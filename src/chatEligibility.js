// src/chatEligibility.js — Yojana Sahay · eligibility check inside the chat
// ─────────────────────────────────────────────────────────────────────────────
// Instead of the 12-step form, the chat asks ONLY what it doesn't know yet —
// one tap-to-answer question at a time — then shows the result right there.
// Same rules as the main checker (each scheme's match() + special-group gating).
//
// Works for the user ("self") or a family member ("family": household answers
// like state, income, caste and ration card are carried over from the user).
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB, INDIA_STATES } from "./schemesData.js";
import { nicheAudience } from "./audience.js";
import { benefitSummary, benefitKind } from "./benefitMath.js";

const BY_ID = new Map(SCHEME_DB.map(s => [s.id, s]));

const O = (value, en, hi) => ({ value, en, hi });
export const QUESTIONS = {
  who: { icon: "👤", en: "Who are you?", hi: "आप कौन हैं?", enOther: "Who is this person?", hiOther: "यह व्यक्ति कौन है?", options: [
    O("farmer", "Farmer 🌾", "किसान 🌾"), O("student", "Student 📚", "विद्यार्थी 📚"), O("women", "Woman / homemaker 👩", "महिला / गृहिणी 👩"),
    O("senior", "Senior citizen 👴", "वरिष्ठ नागरिक 👴"), O("business", "Business / self-employed 💼", "व्यापार / स्वरोज़गार 💼"), O("general", "Other / salaried 🧑", "अन्य / नौकरी 🧑")] },
  state: { icon: "🗺️", en: "Which state do you live in?", hi: "आप किस राज्य में रहते हैं?", type: "state" },
  age: { icon: "🎂", en: "Age?", hi: "उम्र?", options: [
    O("below18", "Below 18", "18 से कम"), O("18to35", "18–35", "18–35"), O("35to60", "35–60", "35–60"), O("above60", "60 or above", "60 या अधिक")] },
  gender: { icon: "🧑", en: "Gender?", hi: "लिंग?", options: [
    O("female", "Female 👩", "महिला 👩"), O("male", "Male 👨", "पुरुष 👨"), O("other", "Transgender / other", "ट्रांसजेंडर / अन्य")] },
  income: { icon: "💰", en: "Total family income per year?", hi: "परिवार की सालाना कुल आय?", options: [
    O("below1", "Below ₹1 lakh", "₹1 लाख से कम"), O("1to3", "₹1–3 lakh", "₹1–3 लाख"), O("3to6", "₹3–6 lakh", "₹3–6 लाख"), O("above6", "Above ₹6 lakh", "₹6 लाख से अधिक")] },
  area: { icon: "🏞️", en: "Where do you live?", hi: "आप कहां रहते हैं?", options: [
    O("rural", "Village 🏡", "गांव 🏡"), O("semi", "Small town 🏘️", "कस्बा 🏘️"), O("urban", "City 🏙️", "शहर 🏙️")] },
  house: { icon: "🏠", en: "Do you have a pucca house?", hi: "क्या आपका पक्का मकान है?", options: [
    O("yes", "Yes, pucca house", "हां, पक्का मकान"), O("kutcha", "Kutcha / temporary", "कच्चा / अस्थायी"), O("no", "No house", "मकान नहीं")] },
  caste: { icon: "🪪", en: "Social category?", hi: "सामाजिक श्रेणी?", options: [
    O("general", "General", "सामान्य"), O("obc", "OBC", "OBC"), O("sc", "SC", "SC"), O("st", "ST", "ST"), O("ews", "EWS", "EWS")] },
  rationCard: { icon: "🍚", en: "Ration card?", hi: "राशन कार्ड?", options: [
    O("bpl", "BPL (yellow)", "BPL (पीला)"), O("aay", "Antyodaya (AAY)", "अंत्योदय (AAY)"), O("apl", "APL", "APL"), O("none", "No ration card", "राशन कार्ड नहीं")] },
  disability: { icon: "♿", en: "Any disability (40%+)?", hi: "कोई दिव्यांगता (40%+)?", options: [
    O("none", "No", "नहीं"), O("yes", "Yes ♿", "हां ♿")] },
  landHolding: { icon: "🌾", en: "How much farm land?", hi: "कितनी खेती की ज़मीन?", options: [
    O("below1", "Below 1 acre", "1 एकड़ से कम"), O("1to2", "1–2 acres", "1–2 एकड़"), O("2to5", "2–5 acres", "2–5 एकड़"), O("5plus", "5+ acres", "5+ एकड़")] },
  educationLevel: { icon: "📚", en: "Which class / course?", hi: "कौन सी कक्षा / कोर्स?", options: [
    O("class1to8", "Class 1–8", "कक्षा 1–8"), O("class9to12", "Class 9–12", "कक्षा 9–12"), O("undergrad", "Graduation / diploma", "स्नातक / डिप्लोमा"), O("postgrad", "Post-graduation", "स्नातकोत्तर")] },
  groups: { icon: "🧩", en: "Does any of this apply? (tick all)", hi: "क्या इनमें से कुछ लागू होता है? (सभी चुनें)", type: "multi", options: [
    O("construct", "Construction worker 👷", "निर्माण श्रमिक 👷"), O("fisher", "Fisherman 🎣", "मछुआरा 🎣"), O("artisan", "Weaver / artisan 🧵", "बुनकर / कारीगर 🧵"),
    O("minority", "Minority community", "अल्पसंख्यक समुदाय"), O("tea", "Tea garden worker 🍃", "चाय बागान श्रमिक 🍃"), O("patient", "Serious illness (TB, cancer…) 🏥", "गंभीर बीमारी (TB, कैंसर…) 🏥"),
    O("defence", "Ex-serviceman family 🎖️", "पूर्व सैनिक परिवार 🎖️"), O("sports", "Sportsperson 🏅", "खिलाड़ी 🏅"), O("orphan", "Lost a parent (child) 🕊️", "माता-पिता खो चुका बच्चा 🕊️")] },
};
const HOUSEHOLD = ["state", "income", "area", "house", "caste", "rationCard"];
const ORDER = ["who", "state", "age", "gender", "income", "area", "house", "caste", "rationCard", "disability"];

// Keep only valid values (the AI may pass things it guessed).
export function cleanAnswers(raw = {}) {
  const out = {};
  for (const [k, q] of Object.entries(QUESTIONS)) {
    const v = raw?.[k];
    if (v == null || v === "") continue;
    if (q.type === "state") {
      const st = INDIA_STATES.find(s => s.toLowerCase() === String(v).toLowerCase().trim());
      if (st) out.state = st;
    } else if (q.type === "multi") {
      const arr = (Array.isArray(v) ? v : [v]).filter(x => q.options.some(o => o.value === x));
      out.groups = arr;
    } else if (q.options.some(o => o.value === v)) out[k] = v;
  }
  return out;
}

// Which questions still need asking, given what we know.
export function questionQueue(known) {
  const q = ORDER.filter(k => known[k] == null &&
    !(k === "gender" && known.who === "women") &&      // "woman" already says it
    !(k === "age" && known.who === "senior"));          // senior citizen = 60+
  if (known.who === "farmer" && known.landHolding == null) q.push("landHolding");
  if (known.who === "student" && known.educationLevel == null) q.push("educationLevel");
  if (known.groups == null) q.push("groups");
  return q;
}
// Recomputed after each answer (who → adds land / class question).
export const nextQuestion = (answers) => questionQueue(answers)[0] || null;

// Facts implied by an answer (woman → female, senior citizen → 60+).
export function withImplied(a) {
  const out = { ...a };
  if (out.who === "women" && !out.gender) out.gender = "female";
  if (out.who === "senior" && !out.age) out.age = "above60";
  return out;
}

// Starting answers: for yourself, everything we already know; for a family
// member, only household facts (state, income, caste, ration card…).
export function startingAnswers(own = null, known = {}, forSelf = true) {
  const base = {};
  if (own) for (const k of (forSelf ? Object.keys(QUESTIONS) : HOUSEHOLD)) if (own[k] != null) base[k] = own[k];
  return { ...cleanAnswers(base), ...cleanAnswers(known) };
}

function audienceApplies(key, a) {
  if (key === "disability") return !!a.disability && a.disability !== "none";
  if (key === "trans") return a.gender === "other";
  return Array.isArray(a.groups) && a.groups.includes(key);
}
function eligible(s, a) {
  if (s.duplicateOf) return false;
  if (s.scope === "state" && s.state && a.state && s.state !== a.state) return false;
  const aud = nicheAudience(s);
  if (aud && !audienceApplies(aud.key, a)) return false;
  try { return !!s.match(a); } catch { return false; }
}

// The result card: count, money, best schemes first.
export function eligibilityResult(answers) {
  const a = { ...answers, ...(answers.rationCard === "none" ? { rationCard: undefined } : {}) };
  const list = SCHEME_DB.filter(s => eligible(s, a));
  const KIND = { yearly: 0, oneTime: 1, health: 2, other: 3 };
  // Money in hand (pensions, instalments, scholarships) first; loans,
  // investments, training and insurance after — they're useful but not income.
  const soft = (s) => /loan|invest|training|skill|insurance|bima|sapling|plant|subsidy on|interest|sadak|road|mission\b/i.test(`${s.name?.en} ${s.benefit?.en}`) ? 2 : 0;
  const rank = (s) => KIND[benefitKind(s)] + soft(s);
  const top = [...list].sort((x, y) => (rank(x) - rank(y)) || ((y.annual || 0) - (x.annual || 0)));
  return { count: list.length, summary: benefitSummary(list), top: top.slice(0, 6), ids: list.map(s => s.id) };
}

export const schemeById = (id) => BY_ID.get(id);
export const STATES = INDIA_STATES;
