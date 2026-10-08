// src/benefitMath.js — Yojana Sahay · honest benefit totals
// ─────────────────────────────────────────────────────────────────────────────
// Adding every scheme's `annual` value together produced numbers like "₹50 lakh
// a year" — health-insurance cover, one-time house grants and emergency funds
// were counted as if they were cash every year. Here each scheme's money is put
// in one bucket:
//   yearly   — money / support you can actually expect every year (pensions,
//              cash transfers, scholarships, stipends, free ration…) → summed
//   health   — free / cashless treatment cover → shown as the LARGEST cover,
//              never summed (covers don't stack)
//   oneTime  — one-off grants (house, toilet, livestock, solar…) → summed,
//              shown separately, never mixed into the yearly figure
//   other    — loans, insurance payouts, salaries → not counted at all
// ─────────────────────────────────────────────────────────────────────────────

export function benefitKind(s) {
  if (s?.benefitKind) return s.benefitKind; // explicit override on a scheme
  const tag = String(s?.tag?.en ?? "").toLowerCase();
  const t = `${s?.name?.en ?? ""} ${tag} ${s?.benefit?.en ?? ""}`.toLowerCase();
  if (/\bloan\b|credit card|collateral|interest subvention/.test(t)) return "other";
  if (/recruitment|agniveer|salary/.test(t)) return "other";
  if (/after (the )?age (of )?60|maan-?dhan|atal pension/.test(t)) return "other"; // you pay in now, the pension comes after 60
  if (/life-threatening|rare disease|critical illness|transplant|compensation|ex-gratia|acid attack/.test(t)) return "other"; // emergency funds — only if it happens
  if (/^health|^medical/.test(tag) || /cashless|hospital|treatment|medical (cover|insurance|assistance)|health (cover|insurance)|dialysis|free (opd|medicines|surgery)|generic medicines/.test(t)) return "health";
  if (/(life|accident|crop|livestock|pashu)\s*(insurance|cover)|\bbima\b|insurance/.test(t)) return "other";
  if (/capital (investment )?subsidy|subsidy on (setting|purchase|loom|tourism)|seed (fund|grant)|equity grant|startup|cash (award|prize)|\bprize\b|\baward\b|emergency|distress relief|relief fund|fixed deposit|total support|in \d+ (milestone|instal)|sheep|vehicle|patta|land title|outright grant/.test(t)) return "oneTime";
  if (/house construction|build (a |your )?(pucca )?house|pucca house|housing|\btoilet|one-time|one time|marriage|vivah|shagun|free goat|goat unit|tractor|\bpump\b|rooftop|solar|cycle|scooty|smartphone|tablet|laptop/.test(t)) return "oneTime";
  return "yearly";
}

// People normally get ONE scholarship, ONE pension and ONE training stipend at
// a time — so within each of these groups only the largest counts.
export function exclusiveGroup(s) {
  const t = `${s?.name?.en ?? ""} ${s?.tag?.en ?? ""}`.toLowerCase();
  if (/scholarship|fellowship|chhatravritti|chatravritti/.test(t) || /tuition|residential (education|school)|free hostel/.test(String(s?.benefit?.en ?? "").toLowerCase())) return "scholarship";
  if (/house|housing|awas|gharkul|pmay|indiramma|kanavu/.test(t)) return "housing";
  if (/pension/.test(t)) return "pension";
  if (/skill|training|apprentice|internship|coaching|kaushal/.test(t)) return "training";
  return null;
}

export function benefitSummary(schemes = []) {
  let yearly = 0, health = 0, oneTime = 0, houseMax = 0;
  const groupMax = {};
  for (const s of schemes) {
    const v = Number(s?.annual) || 0;
    if (!v) continue;
    const k = benefitKind(s);
    if (k === "yearly") {
      // No single scheme can dominate the estimate (e.g. a ₹25 lakh study-abroad
      // scholarship): each counts at most ₹2 lakh a year.
      const capped = Math.min(v, 200000);
      const g = exclusiveGroup(s);
      if (g) groupMax[g] = Math.max(groupMax[g] ?? 0, capped);
      else yearly += capped;
    } else if (k === "health") health = Math.max(health, v);
    else if (k === "oneTime") {
      if (exclusiveGroup(s) === "housing") houseMax = Math.max(houseMax, v); // one house, not five
      else oneTime += v;
    }
  }
  yearly += Object.entries(groupMax).filter(([g]) => g !== "housing").reduce((a, [, b]) => a + b, 0);
  oneTime += houseMax;
  return { yearly, health, oneTime };
}

// Biggest benefits for display, each labelled by what kind of money it is.
export function topBenefits(schemes = [], n = 5) {
  return schemes
    .filter(s => (Number(s?.annual) || 0) > 0 && benefitKind(s) !== "other")
    .map(s => ({ s, kind: benefitKind(s) }))
    .sort((a, b) => (a.kind === "yearly" ? 0 : 1) - (b.kind === "yearly" ? 0 : 1) || (b.s.annual - a.s.annual))
    .slice(0, n);
}
