// src/audience.js — Yojana Sahay · schemes for special groups
// ─────────────────────────────────────────────────────────────────────────────
// Some schemes depend on something the quiz never asks — being a government
// employee, a registered construction worker, a TB patient, an athlete, from a
// minority community… Their rules can't check that, so they used to match
// everyone and inflate "You qualify for 73 schemes · ₹50 lakh".
// They are kept OUT of the main list and totals and shown in a separate
// "if this applies to you" section instead — nobody loses them.
// Detection uses the scheme's name + tag only. A scheme can set
// `audience: null` to opt out, or `audience: "key"` to opt in explicitly.
// ─────────────────────────────────────────────────────────────────────────────

export const AUDIENCES = [
  { key: "govt",      re: /government employee|govt\.? employee|state employee|lok sevak|employees'? (health|welfare)/, en: "Government employees & pensioners", hi: "सरकारी कर्मचारी व पेंशनभोगी" },
  { key: "defence",   re: /ex-servicem|veteran|sainik kalyan|defence personnel|soldier|agniveer|agnipath|armed forces/,      en: "Defence personnel, ex-servicemen & recruits",      hi: "सैनिक, पूर्व सैनिक व भर्ती" },
  { key: "sports",    re: /sportsperson|athlete|khelo|sports (scholarship|award|person|talent)|medal|\bplayers?\b/,           en: "Sportspersons",                    hi: "खिलाड़ी" },
  { key: "disability", re: /disab|divyang|viklang|handicap|differently.abled|nishakt|\bpwd\b|assistive device/,                   en: "Persons with disabilities",        hi: "दिव्यांगजन" },
  { key: "abroad",    re: /overseas|study abroad|foreign (univers|stud)/,                                                     en: "Students going abroad to study",    hi: "विदेश में पढ़ने वाले विद्यार्थी" },
  { key: "graduate",  re: /tulip|national apprenticeship training|\bnats\b|internship|graduate apprentice/,                    en: "Fresh graduates (internships & apprenticeships)", hi: "नए स्नातक (इंटर्नशिप व अप्रेंटिसशिप)" },
  { key: "merit",     re: /top class|inspire|topper|meritorious|medhavi|pratibha|prathibha|super ?\d+\b|rank holder|premier institut/, en: "Toppers & students at premier institutes", hi: "टॉपर व प्रमुख संस्थानों के विद्यार्थी" },
  { key: "construct", re: /construction worker|\bbocw\b|building (and other )?construction/,                                  en: "Registered construction workers",   hi: "पंजीकृत निर्माण श्रमिक" },
  { key: "tea",       re: /tea (garden|tribe|worker|estate)|chah bagicha/,                                                     en: "Tea garden workers",               hi: "चाय बागान श्रमिक" },
  { key: "artisan",   re: /weaver|handloom|artisan|craftsm|vishwakarma|bunkar|handicraft/,                                     en: "Weavers, artisans & craftspeople", hi: "बुनकर, कारीगर व शिल्पकार" },
  { key: "fisher",    re: /fisher|matsya|fishing|fish farm/,                                                                    en: "Fishermen & fish farmers",         hi: "मछुआरे व मत्स्य पालक" },
  { key: "artist",    re: /\bartists?\b|artiste|folk|kalakar|film worker|cine worker/,                                         en: "Artists & performers",             hi: "कलाकार" },
  { key: "media",     re: /journalist|patrakar|\badvocate|lawyer/,                                                              en: "Journalists & lawyers",            hi: "पत्रकार व वकील" },
  { key: "patient",   re: /\btb\b|tuberculosis|nikshay|dialysis|kidney|cancer|\bhiv\b|leprosy|thalass|haemophilia|life-threatening|rare disease|critical illness/, en: "Patients with specific illnesses", hi: "विशेष बीमारियों के मरीज़" },
  { key: "orphan",    re: /covid|orphan|lost (both )?parents/,                                                                  en: "Children who lost a parent",       hi: "माता-पिता खो चुके बच्चे" },
  { key: "minority",  re: /minority|minorities|muslim|christian|\bsikh|buddhist|parsi|\bjain\b/,                               en: "Minority communities",             hi: "अल्पसंख्यक समुदाय" },
  { key: "trans",     re: /transgender/,                                                                                        en: "Transgender persons",              hi: "ट्रांसजेंडर व्यक्ति" },
  { key: "victim",    re: /acid attack|victim|survivor|atrocit/,                                                                en: "Survivors of crime or atrocities", hi: "अपराध / अत्याचार पीड़ित" },
];
const BY_KEY = Object.fromEntries(AUDIENCES.map(a => [a.key, a]));
const cache = new Map();

// → audience object or null
export function nicheAudience(s) {
  if (!s) return null;
  if (s.audience === null) return null;
  if (typeof s.audience === "string") return BY_KEY[s.audience] ?? null;
  if (cache.has(s.id)) return cache.get(s.id);
  const t = `${s.name?.en ?? ""} ${s.tag?.en ?? ""}`.toLowerCase();
  let a = AUDIENCES.find(x => x.re.test(t)) ?? null;
  // Marks-based rewards (distinction, first division, 75%+…) are for toppers.
  if (!a && /distinction|first division|scoring \d{2}%|\d{2}%\+ (in|marks)|\d{2}% or (above|more)|top \d+ ?%|toppers?\b|rank holders?/.test(String(s.benefit?.en ?? "").toLowerCase())) a = BY_KEY.merit;
  cache.set(s.id, a);
  return a;
}

// Group matched niche schemes by audience, biggest groups first.
export function groupByAudience(schemes = []) {
  const m = new Map();
  for (const s of schemes) {
    const a = nicheAudience(s);
    if (!a) continue;
    if (!m.has(a.key)) m.set(a.key, { audience: a, schemes: [] });
    m.get(a.key).schemes.push(s);
  }
  return [...m.values()].sort((x, y) => y.schemes.length - x.schemes.length);
}
