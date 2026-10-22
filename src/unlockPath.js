// src/unlockPath.js — Yojana Sahay · "Your next best steps"
// ─────────────────────────────────────────────────────────────────────────────
// Works backwards from the eligibility rules: for each thing the person could
// honestly tell us or get (an unanswered question, a special group we never
// asked about, a priority ration card), it re-runs the SAME rules the checker
// uses and counts the schemes that would newly open up — and how much money
// they add (benefitMath's honest totals, so a second scholarship or pension
// adds nothing). The steps that open the most come first.
//
// Never suggests changing a fact (income, caste, age…) — only answering a
// question we haven't asked, or a real-world step the person can take.
// Pure functions, no UI.
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB } from "./schemesData.js";
import { safeMatch } from "./eligibility.js";
import { audienceApplies } from "./audience.js";
import { benefitSummary } from "./benefitMath.js";

// Questions the quiz may not have asked. Options use the quiz's own values.
export const UNLOCK_QUESTIONS = {
  gender: {
    en: "Are you female or male?", hi: "आप महिला हैं या पुरुष?",
    options: [["female", "Female", "महिला"], ["male", "Male", "पुरुष"], ["other", "Transgender / Other", "ट्रांसजेंडर / अन्य"]],
  },
  disability: {
    en: "Do you have a disability?", hi: "क्या आपको कोई दिव्यांगता है?",
    options: [["yes", "Yes", "हां"], ["none", "No", "नहीं"]],
  },
  rationCard: {
    en: "Which ration card does your family have?", hi: "आपके परिवार के पास कौन सा राशन कार्ड है?",
    options: [["bpl", "BPL / Priority", "BPL / प्राथमिकता"], ["aay", "Antyodaya (AAY)", "अंत्योदय (AAY)"], ["apl", "APL", "APL"], ["none", "None", "कोई नहीं"]],
  },
  educationLevel: {
    en: "What are you studying now?", hi: "आप अभी क्या पढ़ रहे हैं?",
    options: [["class1to8", "Class 1–8", "कक्षा 1–8"], ["class9to12", "Class 9–12", "कक्षा 9–12"], ["undergrad", "Graduation / Diploma", "स्नातक / डिप्लोमा"], ["postgrad", "Post-graduation", "स्नातकोत्तर"]],
  },
  landHolding: {
    en: "How much farm land do you own?", hi: "आपके पास कितनी खेती की ज़मीन है?",
    options: [["below1", "Below 1 acre", "1 एकड़ से कम"], ["1to2", "1–2 acres", "1–2 एकड़"], ["2to5", "2–5 acres", "2–5 एकड़"], ["5plus", "5+ acres", "5+ एकड़"]],
  },
};

// Special groups. `how` = the real registration that opens these schemes.
export const UNLOCK_GROUPS = {
  construct: { en: "Do you work in construction?", hi: "क्या आप निर्माण (कंस्ट्रक्शन) का काम करते हैं?",
    how: { en: "Register with your state's Building & Other Construction Workers Welfare Board — usually needs 90 days of construction work in the last year. Apply at the labour office or your state labour portal.",
           hi: "अपने राज्य के भवन एवं अन्य निर्माण श्रमिक कल्याण बोर्ड में पंजीकरण कराएं — आम तौर पर पिछले साल में 90 दिन का निर्माण कार्य ज़रूरी। श्रम कार्यालय या राज्य के श्रम पोर्टल पर आवेदन करें।" } },
  artisan: { en: "Are you a weaver, artisan or craftsperson?", hi: "क्या आप बुनकर, कारीगर या शिल्पकार हैं?",
    how: { en: "Traditional artisans can register under PM Vishwakarma at a Common Service Centre (CSC). Weavers can get a Pehchan card from the handloom office.",
           hi: "पारंपरिक कारीगर कॉमन सर्विस सेंटर (CSC) पर पीएम विश्वकर्मा में पंजीकरण करा सकते हैं। बुनकर हथकरघा कार्यालय से पहचान कार्ड बनवा सकते हैं।" },
    link: "https://pmvishwakarma.gov.in/" },
  fisher: { en: "Are you a fisherman or fish farmer?", hi: "क्या आप मछुआरे या मछली पालक हैं?",
    how: { en: "Register with your district Fisheries office — most fisher schemes need this registration.",
           hi: "अपने ज़िले के मत्स्य विभाग कार्यालय में पंजीकरण कराएं — ज़्यादातर मछुआरा योजनाओं के लिए यह ज़रूरी है।" } },
  tea:      { en: "Do you work in a tea garden?", hi: "क्या आप चाय बागान में काम करते हैं?" },
  widow:    { en: "Are you a widow or single woman?", hi: "क्या आप विधवा या एकल महिला हैं?" },
  minority: { en: "Are you from a minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)?", hi: "क्या आप अल्पसंख्यक समुदाय (मुस्लिम, ईसाई, सिख, बौद्ध, जैन, पारसी) से हैं?" },
  sports:   { en: "Are you a sportsperson?", hi: "क्या आप खिलाड़ी हैं?" },
  artist:   { en: "Are you an artist or folk performer?", hi: "क्या आप कलाकार या लोक कलाकार हैं?" },
  defence:  { en: "Are you an ex-serviceman or from a defence family?", hi: "क्या आप पूर्व सैनिक हैं या सैनिक परिवार से हैं?" },
  merit:    { en: "Did you score high marks (75%+) or top your class?", hi: "क्या आपके अच्छे अंक (75%+) आए या आप टॉपर हैं?" },
  graduate: { en: "Are you a fresh graduate looking for an internship or apprenticeship?", hi: "क्या आप इंटर्नशिप या अप्रेंटिसशिप ढूंढ रहे नए स्नातक हैं?" },
  abroad:   { en: "Are you planning to study abroad?", hi: "क्या आप विदेश में पढ़ने की योजना बना रहे हैं?" },
};

// Groups only make sense for some people — don't ask a 50-year-old farmer
// about internships just because a scheme's rules don't check age.
const adult = a => a.age !== "below18";
const young = a => a.age === "below18" || a.age === "18to35";
const GROUP_FITS = {
  construct: adult, artisan: adult, fisher: adult, tea: adult, artist: adult, defence: () => true,
  widow: a => adult(a) && a.gender !== "male", minority: () => true,
  sports: a => a.age !== "above60",
  merit: a => a.who === "student" || young(a),
  graduate: a => a.age === "18to35" && a.who !== "senior",
  abroad: a => a.who === "student" || a.age === "18to35",
};

const RATION_HOW = {
  en: "If your family's income is low, you may qualify for a priority (BPL / PHH) ration card under the National Food Security Act. Apply at your state food department's website or the ration office with Aadhaar, an income certificate and family details.",
  hi: "अगर परिवार की आमदनी कम है, तो राष्ट्रीय खाद्य सुरक्षा कानून के तहत आपको प्राथमिकता (BPL / PHH) राशन कार्ड मिल सकता है। आधार, आय प्रमाण पत्र और परिवार के विवरण के साथ राज्य खाद्य विभाग की वेबसाइट या राशन कार्यालय में आवेदन करें।",
};
const RATION_LINK = "https://nfsa.gov.in/";

const poolCache = new Map();
function pool(state) {
  const k = state || "";
  if (!poolCache.has(k)) poolCache.set(k, SCHEME_DB.filter(s => !s.closed && !s.duplicateOf && (s.scope !== "state" || (state && s.state === state))));
  return poolCache.get(k);
}

// Honest money the new schemes ADD on top of what the person already gets.
function addedValue(baseSchemes, newSchemes) {
  const b = benefitSummary(baseSchemes), a = benefitSummary([...baseSchemes, ...newSchemes]);
  return { yearly: Math.max(0, a.yearly - b.yearly), oneTime: Math.max(0, a.oneTime - b.oneTime), health: Math.max(0, a.health - b.health) };
}
const score = (n, v) => n * 600 + v.yearly + v.oneTime * 0.2 + v.health * 0.02;

function gainFor(answers, patch, baseIds, baseSchemes) {
  const next = { ...answers, ...patch };
  const schemes = pool(answers.state).filter(s => !baseIds.has(s.id) && safeMatch(s, next));
  if (!schemes.length) return null;
  const value = addedValue(baseSchemes, schemes);
  return { schemes, value, score: score(schemes.length, value) };
}

function declined(key, a) {
  if (key === "widow" && a.marital && a.marital !== "widowed" && !a.groups?.includes("widow")) return true;
  return Array.isArray(a.groupsAsked) && a.groupsAsked.includes(key);
}

// → [{ id, kind: "question"|"group"|"ration", field?, group?, count, value, schemes, best? }]
//   sorted by impact. `answers` = eligibility answers (buildProfileAnswers / quiz).
export function unlockSteps(answers, limit = 4) {
  if (!answers || !answers.state || !answers.who) return [];
  const baseSchemes = pool(answers.state).filter(s => safeMatch(s, answers));
  const baseIds = new Set(baseSchemes.map(s => s.id));
  const steps = [];

  // 1. Questions we never asked — "up to" the best answer.
  for (const [field, q] of Object.entries(UNLOCK_QUESTIONS)) {
    if (answers[field]) continue;
    if (field === "educationLevel" && answers.who !== "student") continue;
    if (field === "landHolding" && answers.who !== "farmer") continue;
    let best = null;
    for (const [v] of q.options) {
      const g = gainFor(answers, { [field]: v }, baseIds, baseSchemes);
      if (g && (!best || g.score > best.score)) best = { ...g, v };
    }
    if (best) steps.push({ id: `q:${field}`, kind: "question", field, best: best.v, count: best.schemes.length, value: best.value, schemes: best.schemes, score: best.score * 0.9 });
  }

  // 2. A priority ration card — only suggested when income is low enough to
  //    plausibly qualify, and they don't already have BPL / AAY.
  if ((answers.rationCard === "none" || answers.rationCard === "apl") && (answers.income === "below1" || answers.income === "1to3")) {
    const g = gainFor(answers, { rationCard: "bpl" }, baseIds, baseSchemes);
    if (g) steps.push({ id: "ration", kind: "ration", count: g.schemes.length, value: g.value, schemes: g.schemes, score: g.score, how: RATION_HOW, link: RATION_LINK });
  }

  // 3. Special groups never asked about.
  for (const [key, meta] of Object.entries(UNLOCK_GROUPS)) {
    if (audienceApplies(key, answers) || declined(key, answers)) continue;
    if (GROUP_FITS[key] && !GROUP_FITS[key](answers)) continue;
    const g = gainFor(answers, { groups: [...(answers.groups || []), key] }, baseIds, baseSchemes);
    if (g) steps.push({ id: `g:${key}`, kind: "group", group: key, count: g.schemes.length, value: g.value, schemes: g.schemes, how: meta.how || null, link: meta.link || null,
      // A registration they can go and do ranks above a plain "is this you?"
      score: g.score * (meta.how ? 0.8 : 0.6) });
  }

  // A step must be worth it: two or more schemes, or real money.
  const worth = steps.filter(x => x.count >= 2 || x.value.yearly + x.value.oneTime > 0);
  worth.sort((a, b) => b.score - a.score);
  return worth.slice(0, limit);
}

// The answers change a step makes when the person replies.
//   question → { [field]: value }
//   group    → yes: add to groups (and groupsAsked); no: only groupsAsked
//   ration   → { rationCard: value } once they have the card
export function patchFor(step, answers, reply) {
  if (step.kind === "group") {
    const asked = Array.from(new Set([...(answers.groupsAsked || []), step.group]));
    const groups = (answers.groups || []).filter(g => g !== step.group);
    if (reply === "yes") groups.push(step.group);
    return { groups, groupsAsked: asked };
  }
  if (step.kind === "question") return { [step.field]: reply };
  if (step.kind === "ration") return { rationCard: reply };
  return {};
}

// Schemes the person qualifies for that pay money straight into a bank account
// — for "make sure your money can reach you" (Aadhaar linked to the bank).
const DBT_RE = /aadhaar[- ](?:seeded|linked)|seeded (?:bank|with aadhaar)|\bdbt\b|direct benefit transfer|bank account/;
export function dbtSchemes(matched = []) {
  return matched.filter(s => {
    const t = `${(s.docs?.en || []).join(" ")} ${JSON.stringify(s.eligibilityText?.en ?? "")} ${s.benefit?.en ?? ""}`.toLowerCase();
    return DBT_RE.test(t);
  });
}
