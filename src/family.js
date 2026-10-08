// src/family.js — Yojana Sahay · Family mode
// ─────────────────────────────────────────────────────────────────────────────
// Add the people you live with (wife, son, mother…) with a few details each.
// Household facts — state, income, caste, area, house, ration card — come from
// your own answers; each member adds age, gender, occupation, education and
// disability. We then find the schemes each member qualifies for.
//
// Counting honestly: a household scheme (house, ration, LPG, farmer support,
// family health cover…) is counted once for the whole family. A personal one
// (scholarship, pension, girl-child, maternity, training…) counts for every
// member who qualifies.
// Saved on this device only (localStorage, per account).
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import { benefitSummary, exclusiveGroup } from "./benefitMath.js";

export const MAX_MEMBERS = 8;
export const RELATIONS = [
  { key: "wife",     en: "Wife",     hi: "पत्नी", icon: "👩", gender: "female", adult: true },
  { key: "husband",  en: "Husband",  hi: "पति",   icon: "👨", gender: "male",   adult: true },
  { key: "daughter", en: "Daughter", hi: "बेटी",  icon: "👧", gender: "female" },
  { key: "son",      en: "Son",      hi: "बेटा",  icon: "👦", gender: "male" },
  { key: "mother",   en: "Mother",   hi: "माता",  icon: "👵", gender: "female", adult: true },
  { key: "father",   en: "Father",   hi: "पिता",  icon: "👴", gender: "male",   adult: true },
  { key: "other",    en: "Other",    hi: "अन्य",  icon: "🧑", gender: null },
];
export const REL_BY_KEY = Object.fromEntries(RELATIONS.map(r => [r.key, r]));

// The household facts shared by everyone.
const HOUSEHOLD = ["state", "income", "caste", "area", "house", "rationCard"];

export function defaultWho({ age, gender }) {
  if (age === "below18") return "student";
  if (age === "above60") return "senior";
  if (gender === "female") return "women";
  return "general";
}

export function memberAnswers(base = {}, m = {}) {
  const ans = {};
  for (const k of HOUSEHOLD) if (base[k] != null) ans[k] = base[k];
  ans.age = m.age;
  ans.gender = m.gender || REL_BY_KEY[m.relation]?.gender || undefined;
  ans.who = m.who || defaultWho({ age: m.age, gender: ans.gender });
  if (ans.who === "student" && m.educationLevel) ans.educationLevel = m.educationLevel;
  if (ans.who === "farmer" && base.landHolding) ans.landHolding = base.landHolding;
  ans.disability = m.disability === "yes" ? "yes" : "none";
  return ans;
}

const PERSONAL_RE = /scholar|fellowship|student|girl|daughter|beti|kanya|ladli|ladki|child|balika|pension|old age|senior|widow|vidhwa|disab|divyang|maternity|pregnan|matru|mother|youth|yuva|skill|training|apprentice|internship|stipend|marriage|vivah|kanyadan|shadi|coaching|hostel|cycle|scooty|laptop|tablet/;

// Many scheme rules only say "women" or "student", so in the main quiz a mother
// sees girl-child schemes and an adult sees scholarships. In family mode we know
// who is who, so each scheme goes to the member it is really for.
const STUDY_RE = /scholar|fellowship|student|coaching|hostel|school|pragati|incentive to girls|education loan/;
const GIRL_CHILD_RE = /kanya|ladli|ladki|beti|balika|girl child|girl's|sukanya|rajshri|dikri|nanhi|nanda gaura|daughter|delivers? a girl/;
const MARRIAGE_RE = /marriage|vivah|kanyadan|shagun|nikah|shadi|shaadi/;
export function fitsMember(s, m, answers) {
  const t = `${s?.name?.en ?? ""} ${s?.tag?.en ?? ""}`.toLowerCase();
  const rel = m.relation;
  const young = answers.age === "below18" || answers.age === "18to35";
  const girl = rel === "daughter" || (rel === "other" && answers.gender === "female" && young);
  if (STUDY_RE.test(t) && answers.who !== "student") return false;
  if (GIRL_CHILD_RE.test(t) && !girl) return false;
  if (MARRIAGE_RE.test(t) && !(rel === "daughter" || rel === "son" || (rel === "other" && young))) return false;
  if (/widow|vidhwa|nirashrit mahila/.test(t) && (rel === "wife" || rel === "husband")) return false; // spouse is alive
  return true;
}
export function isPersonal(s) {
  if (["scholarship", "pension", "training"].includes(exclusiveGroup(s))) return true;
  return PERSONAL_RE.test(`${s?.name?.en ?? ""} ${s?.tag?.en ?? ""}`.toLowerCase());
}

// → { members: [{member, answers, schemes, benefit}], familyYearly, familyCount }
// `selfSchemes` = what the main person already qualifies for.
export function familyResults(base, members, selfSchemes, matchFn, db) {
  const seen = new Set(selfSchemes.map(s => s.id)); // household schemes already counted
  const out = [];
  let yearly = benefitSummary(selfSchemes).yearly;
  const all = new Set(selfSchemes.map(s => s.id));
  for (const m of members) {
    const answers = memberAnswers(base, m);
    const matched = db.filter(s => matchFn(s, answers) && fitsMember(s, m, answers));
    // Personal schemes count for this member even if someone else also gets
    // them; household ones only if nobody in the family was counted yet.
    const mine = matched.filter(s => isPersonal(s) || !seen.has(s.id));
    for (const s of mine) { if (!isPersonal(s)) seen.add(s.id); all.add(s.id); }
    const benefit = benefitSummary(mine);
    yearly += benefit.yearly;
    out.push({ member: m, answers, schemes: mine.sort((a, b) => (b.annual || 0) - (a.annual || 0)), benefit });
  }
  return { members: out, familyYearly: yearly, familyCount: all.size };
}

// ── Storage (this device, per account) ───────────────────────────────────────
const key = uid => `yojana_family_${uid || "guest"}`;
let state = { uid: null, members: [] };
const subs = new Set();
function read(uid) {
  try { const v = JSON.parse(localStorage.getItem(key(uid)) || "[]"); return Array.isArray(v) ? v.slice(0, MAX_MEMBERS) : []; }
  catch { return []; }
}
function save(members) {
  state = { uid: state.uid, members };
  try { localStorage.setItem(key(state.uid), JSON.stringify(members)); } catch {}
  for (const l of subs) l();
}
export function initFamily(uid) {
  let members = read(uid);
  if (uid && !members.length) {
    const guest = read(null);
    if (guest.length) { members = guest; try { localStorage.removeItem(key(null)); localStorage.setItem(key(uid), JSON.stringify(members)); } catch {} }
  }
  state = { uid: uid || null, members };
  for (const l of subs) l();
}
export function saveMember(m) {
  const id = m.id || `m${Date.now().toString(36)}`;
  const next = state.members.some(x => x.id === id)
    ? state.members.map(x => (x.id === id ? { ...m, id } : x))
    : [...state.members, { ...m, id }].slice(0, MAX_MEMBERS);
  save(next);
}
export function removeMember(id) { save(state.members.filter(x => x.id !== id)); }
const subscribe = l => { subs.add(l); return () => subs.delete(l); };
const snap = () => state.members;
export function useFamily() { return useSyncExternalStore(subscribe, snap, snap); }
try { if (typeof localStorage !== "undefined") state = { uid: null, members: read(null) }; } catch {}
