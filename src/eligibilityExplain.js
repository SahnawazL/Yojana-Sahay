// src/eligibilityExplain.js — Yojana Sahay · "why am I (not) eligible?"
// ─────────────────────────────────────────────────────────────────────────────
// Uses each scheme's own match() rules with the person's answers — the same
// rules the eligibility checker uses — so the AI can say EXACTLY what is
// missing ("family income must be up to ₹3 lakh; you said ₹3–6 lakh")
// instead of guessing.
//
// explainEligibility(scheme, answers) →
//   { status: "eligible" }
//   { status: "other_state", state }               scheme is for another state
//   { status: "group", group }                     only for a special group they haven't said applies
//   { status: "no", fixes: [{ field, need, have }] } one answer that would change the result
//   { status: "no", fixes: [] }                    several conditions don't fit
// ─────────────────────────────────────────────────────────────────────────────
import { nicheAudience } from "./audience.js";
import { SCHEME_DB } from "./schemesData.js";

const BY_ID = new Map(SCHEME_DB.map(s => [s.id, s]));

const TRY = {
  who:            ["farmer", "student", "women", "senior", "business", "general"],
  income:         ["below1", "1to3", "3to6", "above6"],
  age:            ["below18", "18to35", "35to60", "above60"],
  area:           ["rural", "semi", "urban"],
  house:          ["no", "kutcha", "yes"],
  caste:          ["general", "obc", "sc", "st", "ews"],
  gender:         ["female", "male", "other"],
  rationCard:     ["bpl", "aay", "phh", "apl"],
  educationLevel: ["class1to8", "class9to12", "undergrad", "postgrad"],
  landHolding:    ["below1", "1to2", "2to5", "5plus"],
  disability:     ["yes"],
};

const LABEL = {
  who: { farmer: "farmer", student: "student", women: "woman / homemaker", senior: "senior citizen", business: "self-employed / business", general: "general citizen" },
  income: { below1: "below ₹1 lakh a year", "1to3": "₹1–3 lakh a year", "3to6": "₹3–6 lakh a year", above6: "above ₹6 lakh a year" },
  age: { below18: "below 18", "18to35": "18–35", "35to60": "35–60", above60: "60 or above" },
  area: { rural: "village (rural)", semi: "small town", urban: "city (urban)" },
  house: { no: "no house", kutcha: "kutcha house", yes: "pucca house" },
  caste: { general: "General", obc: "OBC", sc: "SC", st: "ST", ews: "EWS" },
  gender: { female: "female", male: "male", other: "transgender / other" },
  rationCard: { bpl: "BPL ration card", aay: "Antyodaya (AAY) card", phh: "priority household (PHH) card", apl: "APL card" },
  educationLevel: { class1to8: "Class 1–8", class9to12: "Class 9–12", undergrad: "graduation", postgrad: "post-graduation" },
  landHolding: { below1: "below 1 acre", "1to2": "1–2 acres", "2to5": "2–5 acres", "5plus": "5+ acres" },
  disability: { yes: "a disability (with certificate)", none: "no disability" },
};
const FIELD_NAME = {
  who: "who you are", income: "family income", age: "age", area: "where you live", house: "house",
  caste: "category", gender: "gender", rationCard: "ration card", educationLevel: "class / course",
  landHolding: "farm land", disability: "disability",
};
const lab = (f, v) => (v == null || v === "" ? "not given" : LABEL[f]?.[v] ?? String(v));

function audienceApplies(key, a) {
  if (key === "disability") return !!a.disability && a.disability !== "none";
  if (key === "trans") return a.gender === "other";
  return Array.isArray(a.groups) && a.groups.includes(key);
}
function rawMatch(s, a) {
  try {
    if (s.duplicateOf) { const m = BY_ID.get(s.duplicateOf); if (m && m !== s) { try { if (m.match(a)) return true; } catch {} } }
    return !!s.match(a);
  } catch { return false; }
}

export function explainEligibility(scheme, answers) {
  if (!scheme || !answers) return null;
  if (scheme.scope === "state" && scheme.state && answers.state && scheme.state !== answers.state) {
    return { status: "other_state", state: scheme.state };
  }
  const aud = nicheAudience(scheme);
  const okBase = rawMatch(scheme, answers);
  if (okBase && (!aud || audienceApplies(aud.key, answers))) return { status: "eligible" };
  if (okBase && aud) return { status: "group", group: aud.en };

  const fixes = [];
  for (const [field, vals] of Object.entries(TRY)) {
    const have = answers[field];
    const need = vals.filter(v => v !== have && rawMatch(scheme, { ...answers, [field]: v }));
    if (need.length && need.length < vals.length) fixes.push({ field, need, have });
  }
  // Fixable things first (ration card, income, house…), then the rest.
  const RANK = { rationCard: 0, income: 1, house: 2, educationLevel: 3, landHolding: 4, who: 5, disability: 6, area: 7, age: 8, caste: 9, gender: 10 };
  fixes.sort((x, y) => (RANK[x.field] ?? 9) - (RANK[y.field] ?? 9));
  return { status: "no", fixes: fixes.slice(0, 3), group: aud?.en };
}

// One short line for the AI's context.
export function eligibilityLine(scheme, answers) {
  const r = explainEligibility(scheme, answers);
  if (!r) return "";
  if (r.status === "eligible") return "FOR THIS USER: ✅ ELIGIBLE (app's eligibility check with their answers)";
  if (r.status === "other_state") return `FOR THIS USER: ❌ NOT ELIGIBLE — this is a ${r.state} scheme; they live in ${answers.state}.`;
  if (r.status === "group") return `FOR THIS USER: ⚠️ Fits their answers, but it is only for ${r.group} — they haven't said this applies to them.`;
  if (!r.fixes.length) return `FOR THIS USER: ❌ NOT ELIGIBLE — more than one condition doesn't match their answers${r.group ? ` (and it's meant for ${r.group})` : ""}; explain using the "Who can apply" rules.`;
  const parts = r.fixes.map(f => `${FIELD_NAME[f.field] || f.field} must be ${f.need.map(v => lab(f.field, v)).join(" or ")} (they said: ${lab(f.field, f.have)})`);
  return `FOR THIS USER: ❌ NOT ELIGIBLE — ${parts.length > 1 ? "any ONE of these would make them eligible: " : ""}${parts.join("; ")}.`;
}

// Schemes they ALMOST get — one realistic change away (ration card, income
// proof, house, class/course, land). Their state + central schemes only.
export function nearMisses(answers, matchedIds = new Set(), limit = 6) {
  if (!answers) return [];
  const FIXABLE = new Set(["rationCard", "income", "house", "educationLevel", "landHolding"]);
  const out = [];
  for (const s of SCHEME_DB) {
    if (s.duplicateOf || matchedIds.has(s.id)) continue;
    if (s.scope === "state" && s.state !== answers.state) continue;
    if (nicheAudience(s)) continue;
    const r = explainEligibility(s, answers);
    const f = r?.status === "no" && r.fixes.find(x => FIXABLE.has(x.field));
    if (!f) continue;
    if (f.field === "income") {
      const order = TRY.income;
      if (Math.max(...f.need.map(v => order.indexOf(v))) >= order.indexOf(f.have)) continue; // only "income too high"
    }
    out.push({ scheme: s, fix: f });
  }
  out.sort((a, b) => (b.scheme.annual || 0) - (a.scheme.annual || 0));
  return out.slice(0, limit).map(({ scheme, fix }) => ({
    scheme,
    line: `${FIELD_NAME[fix.field]} must be ${fix.need.map(v => lab(fix.field, v)).join(" or ")} (they said: ${lab(fix.field, fix.have)})`,
  }));
}
