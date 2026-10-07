// src/eligibilityText.js — Yojana Sahay · plain-language "Who can apply"
// ─────────────────────────────────────────────────────────────────────────────
// Every scheme carries a match(profile) rule. Instead of writing eligibility
// text by hand for 1,100+ schemes, we ASK the rule: try it on every
// combination of the main profile answers, see which answers ever pass, and
// turn that into short sentences ("Family income up to ₹3 lakh a year").
//
// Used by the app (scheme card) and by scripts/generate-scheme-pages.mjs (SEO
// pages), so both always say the same thing. Pure JS, no imports.
// Results are cached per scheme id.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY = {
  who:    ["farmer", "student", "women", "senior", "business", "general"],
  income: ["below1", "1to3", "3to6", "above6"],
  age:    ["below18", "18to35", "35to60", "above60"],
  area:   ["rural", "urban", "semi"],
  caste:  ["general", "obc", "sc", "st", "ews"],
};
const SECONDARY = {
  house:          ["yes", "no", "kutcha"],
  gender:         ["female", "male"],
  disability:     ["none", "locomotor"],
  educationLevel: ["class1to8", "class9to12", "undergrad", "postgrad"],
  rationCard:     ["none", "apl", "bpl", "aay"],
  landHolding:    ["below1", "1to2", "2to5", "5plus"],
};
const DEFAULTS = { house: "no", gender: "female", disability: "none", educationLevel: "undergrad", rationCard: "bpl", landHolding: "below1" };
// Alternative secondary answers to try when nothing passes with the defaults
// (e.g. disability-only or men-only schemes).
const FALLBACKS = [
  {}, { disability: "locomotor" }, { gender: "male" }, { house: "kutcha" }, { house: "yes" },
  { educationLevel: "class9to12" }, { educationLevel: "postgrad" }, { educationLevel: "class1to8" },
  { rationCard: "aay" }, { rationCard: "apl" }, { rationCard: "none" }, { landHolding: "1to2" }, { landHolding: "2to5" },
  { disability: "locomotor", educationLevel: "class1to8" }, { disability: "locomotor", educationLevel: "class9to12" },
  { disability: "locomotor", educationLevel: "postgrad" }, { gender: "male", house: "kutcha" },
];
const STATES = ["Andaman & Nicobar","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

const L = {
  en: {
    resident: s => `Resident of ${s}`,
    allIndia: "Indian citizens",
    who: { farmer: "Farmers", student: "Students", women: "Women", senior: "Senior citizens", business: "Self-employed / business owners", general: "General public" },
    whoLine: list => `For: ${list}`,
    incomeUpTo: v => `Family income up to ${v} a year`,
    incomeAbove: v => `Family income above ${v} a year`,
    incomeBetween: (a, b) => `Family income ${a}–${b} a year`,
    incomeV: ["₹1 lakh", "₹3 lakh", "₹6 lakh"],
    age: { below18: "under 18", "18to35": "18–35", "35to60": "35–60", above60: "60+" },
    ageLine: list => `Age: ${list}`,
    area: { rural: "villages (rural)", urban: "cities (urban)", semi: "small towns" },
    areaLine: list => `Lives in ${list}`,
    caste: { general: "General", obc: "OBC", sc: "SC", st: "ST", ews: "EWS" },
    casteLine: list => `Category: ${list}`,
    house: { yes: "owns a pucca house", no: "has no house of their own", kutcha: "lives in a kutcha house" },
    houseNone: "No pucca house of your own",
    women: "Girls / women only",
    men: "Men only",
    disability: "Persons with disability",
    edu: { class1to8: "Class 1–8", class9to12: "Class 9–12", undergrad: "Graduation", postgrad: "Post-graduation" },
    eduLine: list => `Studying / passed: ${list}`,
    ration: { none: "no ration card", apl: "APL", bpl: "BPL", aay: "Antyodaya (AAY)" },
    rationLine: list => `Ration card: ${list}`,
    land: { below1: "under 1 acre", "1to2": "1–2 acres", "2to5": "2–5 acres", "5plus": "5+ acres" },
    landLine: list => `Land: ${list}`,
    or: " or ",
  },
  hi: {
    resident: s => `${s} के निवासी`,
    allIndia: "भारत के नागरिक",
    who: { farmer: "किसान", student: "विद्यार्थी", women: "महिलाएं", senior: "वरिष्ठ नागरिक", business: "स्वरोज़गार / व्यवसायी", general: "आम नागरिक" },
    whoLine: list => `किसके लिए: ${list}`,
    incomeUpTo: v => `परिवार की सालाना आय ${v} तक`,
    incomeAbove: v => `परिवार की सालाना आय ${v} से अधिक`,
    incomeBetween: (a, b) => `परिवार की सालाना आय ${a}–${b}`,
    incomeV: ["₹1 लाख", "₹3 लाख", "₹6 लाख"],
    age: { below18: "18 से कम", "18to35": "18–35", "35to60": "35–60", above60: "60+" },
    ageLine: list => `आयु: ${list} वर्ष`,
    area: { rural: "गाँव (ग्रामीण)", urban: "शहर", semi: "कस्बे" },
    areaLine: list => `रहते हैं: ${list}`,
    caste: { general: "सामान्य", obc: "OBC", sc: "SC", st: "ST", ews: "EWS" },
    casteLine: list => `वर्ग: ${list}`,
    house: { yes: "पक्का मकान है", no: "अपना मकान नहीं है", kutcha: "कच्चे मकान में रहते हैं" },
    houseNone: "अपना पक्का मकान नहीं होना चाहिए",
    women: "केवल बालिकाएं / महिलाएं",
    men: "केवल पुरुष",
    disability: "दिव्यांगजन",
    edu: { class1to8: "कक्षा 1–8", class9to12: "कक्षा 9–12", undergrad: "स्नातक", postgrad: "स्नातकोत्तर" },
    eduLine: list => `पढ़ाई: ${list}`,
    ration: { none: "राशन कार्ड नहीं", apl: "APL", bpl: "BPL", aay: "अंत्योदय (AAY)" },
    rationLine: list => `राशन कार्ड: ${list}`,
    land: { below1: "1 एकड़ से कम", "1to2": "1–2 एकड़", "2to5": "2–5 एकड़", "5plus": "5+ एकड़" },
    landLine: list => `ज़मीन: ${list}`,
    or: " या ",
  },
};

const cache = new Map();

function safe(fn, p) { try { return !!fn(p); } catch { return false; } }

// Which answers can ever pass the rule? → { dim: [allowed values] } or null.
export function eligibilityProfile(scheme) {
  if (!scheme || typeof scheme.match !== "function") return null;
  if (cache.has(scheme.id)) return cache.get(scheme.id);
  const isState = scheme.scope === "state" && scheme.state;
  // Central schemes are tried in a few states first; some are limited to a region.
  const tryStates = isState ? [scheme.state] : ["Bihar", ...STATES.filter(x => x !== "Bihar")];
  let result = null;
  outer: for (const state of tryStates) for (const fb of FALLBACKS) {
    const base = { state, ...DEFAULTS, ...fb };
    const seen = Object.fromEntries(Object.keys(PRIMARY).map(k => [k, new Set()]));
    let witness = null;
    for (const who of PRIMARY.who) for (const income of PRIMARY.income) for (const age of PRIMARY.age)
      for (const area of PRIMARY.area) for (const caste of PRIMARY.caste) {
        const p = { ...base, who, income, age, area, caste };
        if (safe(scheme.match, p)) {
          witness ??= p;
          seen.who.add(who); seen.income.add(income); seen.age.add(age); seen.area.add(area); seen.caste.add(caste);
        }
      }
    if (!witness) continue;
    result = {};
    for (const [k, vals] of Object.entries(PRIMARY)) result[k] = vals.filter(v => seen[k].has(v));
    for (const [k, vals] of Object.entries(SECONDARY)) result[k] = vals.filter(v => safe(scheme.match, { ...witness, [k]: v }));
    result.states = isState ? null : STATES.filter(st => safe(scheme.match, { ...witness, state: st }));
    break outer;
  }
  cache.set(scheme.id, result);
  return result;
}

// Contiguous range text for ordered scales (income/age/land). Falls back to a list.
function rangeText(vals, order) {
  const idx = vals.map(v => order.indexOf(v)).sort((a, b) => a - b);
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return { idx, contiguous };
}

// → array of short lines in the chosen language, or null when unknown.
export function whoCanApply(scheme, lang = "en") {
  // Hand-checked official criteria win over the estimate from the rule.
  const custom = scheme?.eligibilityText?.[lang] ?? scheme?.eligibilityText?.en;
  if (Array.isArray(custom) && custom.length) {
    const t = L[lang] ?? L.en;
    const saysState = (scheme.eligibilityText.en ?? []).join(" ").includes(scheme.state ?? "\u0000");
    return scheme.scope === "state" && scheme.state && !saysState ? [t.resident(scheme.state), ...custom] : [...custom];
  }
  const e = eligibilityProfile(scheme);
  if (!e) return null;
  const t = L[lang] ?? L.en;
  const full = (k, set) => e[k].length === set[k].length;
  const lines = [];

  if (scheme.scope === "state" && scheme.state) lines.push(t.resident(scheme.state));
  else if (e.states && e.states.length < STATES.length) lines.push(t.resident(e.states.join(", ")));
  else lines.push(t.allIndia);

  if (e.gender.length === 1) lines.push(e.gender[0] === "female" ? t.women : t.men);
  if (e.disability.length === 1 && e.disability[0] === "locomotor") lines.push(t.disability);

  if (!full("who", PRIMARY) && e.who.length) {
    const who = e.who.filter(w => !(w === "women" && e.gender.length === 1));
    if (who.length) lines.push(t.whoLine(who.map(w => t.who[w]).join(", ")));
  }
  if (!full("income", PRIMARY) && e.income.length) {
    const { idx, contiguous } = rangeText(e.income, PRIMARY.income);
    const last = PRIMARY.income.length - 1;
    if (contiguous && idx[0] === 0) lines.push(t.incomeUpTo(t.incomeV[idx[idx.length - 1]]));
    else if (contiguous && idx[idx.length - 1] === last) lines.push(t.incomeAbove(t.incomeV[idx[0] - 1]));
    else if (contiguous) lines.push(t.incomeBetween(t.incomeV[idx[0] - 1], t.incomeV[idx[idx.length - 1]]));
  }
  if (!full("age", PRIMARY) && e.age.length) {
    const { idx, contiguous } = rangeText(e.age, PRIMARY.age);
    const bounds = [0, 18, 35, 60];
    const txt = contiguous && e.age.length > 1
      ? (idx[idx.length - 1] === 3 ? `${bounds[idx[0]]}+` : idx[0] === 0 ? (lang === "hi" ? `${bounds[idx[idx.length - 1] + 1]} से कम` : `under ${bounds[idx[idx.length - 1] + 1]}`) : `${bounds[idx[0]]}–${bounds[idx[idx.length - 1] + 1]}`)
      : e.age.map(a => t.age[a]).join(t.or);
    lines.push(t.ageLine(txt));
  }
  if (!full("area", PRIMARY) && e.area.length) lines.push(t.areaLine(e.area.map(a => t.area[a]).join(t.or)));
  if (!full("caste", PRIMARY) && e.caste.length) lines.push(t.casteLine(e.caste.map(c => t.caste[c]).join(", ")));
  if (!full("house", SECONDARY) && e.house.length) {
    lines.push(e.house.length === 2 && !e.house.includes("yes") ? t.houseNone : e.house.map(h => t.house[h]).join(t.or).replace(/^./, c => c.toUpperCase()));
  }
  if (!full("educationLevel", SECONDARY) && e.educationLevel.length) lines.push(t.eduLine(e.educationLevel.map(x => t.edu[x]).join(", ")));
  if (!full("rationCard", SECONDARY) && e.rationCard.length) lines.push(t.rationLine(e.rationCard.map(x => t.ration[x]).join(t.or)));
  if (!full("landHolding", SECONDARY) && e.landHolding.length) lines.push(t.landLine(e.landHolding.map(x => t.land[x]).join(t.or)));
  return lines;
}
