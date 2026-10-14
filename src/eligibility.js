// src/eligibility.js — Yojana Sahay · ONE definition of "who qualifies"
// ─────────────────────────────────────────────────────────────────────────────
// Profile → eligibility answers, and "does this scheme match these answers",
// shared by the app (Home, Profile, quiz results) and the admin dashboard so
// every number agrees. The server copy in api/_lib/deadlineAlerts.js must stay
// the same as buildProfileAnswers() here.
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB } from "./schemesData.js";
import { nicheAudience, audienceApplies } from "./audience.js";

const BY_ID = new Map(SCHEME_DB.map(s => [s.id, s]));

export function buildProfileAnswers(profile) {
  if (!profile) return null;
  return {
    who: profile.occupation, income: profile.income, house: profile.house,
    age: profile.age, area: profile.area, state: profile.state,
    caste: profile.caste || "general",
    ...(profile.occupation === "farmer" && profile.landHolding ? { landHolding: profile.landHolding } : {}),
    ...(profile.occupation === "farmer" && profile.kisanCard ? { kisanCard: profile.kisanCard } : {}),
    ...(profile.occupation === "student" && profile.educationLevel ? { educationLevel: profile.educationLevel } : {}),
    ...(profile.ration ? { rationCard: profile.ration } : {}), // "none" too — they told us, so the quiz doesn't ask again
    ...(profile.disability ? { disability: profile.disability } : {}),
    ...(profile.gender ? { gender: profile.gender } : {}),
    ...(profile.marital ? { marital: profile.marital } : {}),
    ...(Array.isArray(profile.groups) ? { groups: profile.groups } : {}),
    ...(Array.isArray(profile.groupsAsked) ? { groupsAsked: profile.groupsAsked } : {}),
  };
}

// Rules only (no special-group gate). A single malformed match() must never
// blank a results screen — a throwing matcher counts as "not eligible".
// A duplicate entry (state copy of a central scheme) is hidden when the main
// one already matches. Closed schemes never qualify.
export function safeMatchAny(scheme, answers) {
  if (scheme.closed) return false;
  try {
    if (scheme.duplicateOf) {
      const main = BY_ID.get(scheme.duplicateOf);
      if (main && main !== scheme) { try { if (main.match(answers)) return false; } catch {} }
    }
    return !!scheme.match(answers);
  } catch { return false; }
}

// A special-group scheme (athletes, widows, construction workers…) counts only
// once the person has told us the group applies to them.
export function safeMatch(scheme, answers) {
  const aud = nicheAudience(scheme);
  if (aud && !audienceApplies(aud.key, answers)) return false;
  return safeMatchAny(scheme, answers);
}

export const matchedSchemesFor = (answers) => (answers ? SCHEME_DB.filter(s => safeMatch(s, answers)) : []);
