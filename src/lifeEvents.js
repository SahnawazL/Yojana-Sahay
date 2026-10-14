// src/lifeEvents.js — Yojana Sahay · "What's happening in your life?"
// ─────────────────────────────────────────────────────────────────────────────
// Life moments (a baby, a parent turning 60, losing a job…) mapped to the
// schemes that help at each stage. Central schemes + the user's state only.
// Each stage lists hand-picked scheme ids first, then schemes found by
// keyword (name / category / benefit). Pure data + one function — no UI.
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB } from "./schemesData.js";

const S = (en, hi, ids, re, not = null) => ({ en, hi, ids, re, not });

export const LIFE_EVENTS = [
  { id: "baby", icon: "🤰", en: "Pregnancy & new baby", hi: "गर्भावस्था और नवजात", stages: [
    S("During pregnancy", "गर्भावस्था के दौरान", ["pmmvy", "jsy", "pmpsmy"], /matru|maternity|pregnan|janani|prasav|delivery|antenatal/i),
    S("After the baby is born", "बच्चे के जन्म के बाद", ["mission_indradhanush", "icds", "poshan_abhiyaan", "national_creche"], /newborn|infant|immuni[sz]|vaccin|anganwadi|creche|breastfeed|shishu/i, /janman|tribal|pvtg/i),
    S("If it's a girl", "अगर बेटी है", ["sukanya", "betibachao"], /girl child|daughter|kanya|\bbeti\b|ladli laxmi|balika|sumangala|bhagyalakshmi/i, /scholar|single girl|college|class \d|marriage|vivah|matru/i),
  ] },
  { id: "girl_edu", icon: "👧", en: "Daughter's education", hi: "बेटी की पढ़ाई", stages: [
    S("School (Class 1–12)", "स्कूल (कक्षा 1–12)", [], /(girl|daughter|kanya|beti|balika|chhatra).{0,40}(school|class|cycle|bicycle|scooty|uniform)|free cycle|bicycle/i),
    S("College & higher studies", "कॉलेज और उच्च शिक्षा", ["aicte_pragati"], /(girl|women|female|daughter|kanya|single girl).{0,40}(college|graduat|higher|degree|scholar|university|\bpg\b)/i, /lpg|gas|loan/i),
    S("Savings for her future", "उसके भविष्य के लिए बचत", ["sukanya"], /ladli|kanya .{0,15}(dhan|sumangala|vivah)|girl child/i, /matru|maternity|pregnan|scholar/i),
  ] },
  { id: "farming", icon: "🌾", en: "Farming", hi: "खेती-किसानी", stages: [
    S("Money in your account", "खाते में पैसा", ["pmkisan", "pmkmy_kisan"], /kisan.{0,20}(samman|nidhi|bandhu|bharosa|sukhibhava)|farmers?'? income support|input (assistance|support)/i),
    S("Loans & crop insurance", "लोन और फसल बीमा", ["kisancredit", "pmfby"], /crop loan|kisan credit|fasal bima|crop insurance|interest.{0,15}farmer/i),
    S("Seeds, machines & water", "बीज, मशीन और पानी", ["pm_kusum", "soil_health_card", "pmksy"], /tractor|farm machinery|solar pump|drip|sprinkler|irrigation|seed subsidy|krishi yantra/i),
  ] },
  { id: "job", icon: "💼", en: "Lost job / need work", hi: "नौकरी गई / काम चाहिए", stages: [
    S("Work & wages now", "अभी काम और मज़दूरी", ["mgnrega"], /employment guarantee|unemployment allowance|berozgar|rozgar guarantee|job card/i),
    S("Free skill training", "मुफ्त कौशल प्रशिक्षण", ["pmkvy", "ddu_gky", "naps"], /skill|kaushal|training|apprentice/i, /khelo|sport|athlete|scholarship/i),
    S("Start your own work", "अपना काम शुरू करें", ["mudra", "pmegp", "pmsvanidhi", "pmvishwakarma"], /self.?employ|swarozgar|business loan|start.?up|udyam/i),
    S("Safety net", "सुरक्षा", ["e_shram", "nfsa_pds"], /unorganised worker|ration|maan.?dhan|free grain/i, /food process|enterprise|poshan|anganwadi/i),
  ] },
  { id: "senior", icon: "👴", en: "Parent turned 60", hi: "माता-पिता 60 के हुए", stages: [
    S("Monthly pension", "मासिक पेंशन", ["vriddhapension"], /old.?age pension|vridha|vriddha|senior citizen.{0,20}pension|elderly pension|budhapa/i),
    S("Free treatment", "मुफ्त इलाज", ["pmjay_senior", "ayushman"], /senior.{0,25}(health|hospital|treatment)|vayo/i),
    S("Aids & safe savings", "सहायक उपकरण और बचत", ["rvy", "pmvvy", "annapurna"], /senior citizen/i),
  ] },
  { id: "marriage", icon: "💍", en: "Getting married", hi: "शादी", stages: [
    S("Marriage help", "शादी में मदद", [], /marriage|vivah|shaadi|shagun|kalyana? lakshmi|samuhik|kalyanamasthu/i),
    S("Protect the new family", "नए परिवार की सुरक्षा", ["pmjjby", "pmsby", "apy"], null),
  ] },
  { id: "house", icon: "🏠", en: "Building a house", hi: "घर बनाना", stages: [
    S("Help to build or buy", "बनाने या खरीदने में मदद", ["pmawas_rural", "pmay_urban2"], /awas|housing|house construction|pucca house|\bghar\b/i),
    S("Water, toilet & power", "पानी, शौचालय और बिजली", ["sbm_gramin", "jjm", "surya_ghar", "saubhagya"], /toilet|drinking water|electricity connection|rooftop solar/i),
    S("Cooking gas", "रसोई गैस", ["ujjwala"], /\blpg\b|gas connection/i),
  ] },
  { id: "loss", icon: "🕊️", en: "Death of an earning member", hi: "कमाने वाले की मृत्यु", stages: [
    S("Immediate help for the family", "परिवार को तुरंत मदद", ["nfbs"], /family benefit|death of (the )?(bread.?winner|earning)|funeral|antyesti|ex.?gratia|accidental death/i),
    S("Widow pension", "विधवा पेंशन", ["ignwps"], /widow|vidhwa|vidhava/i),
    S("Support for the children", "बच्चों के लिए सहायता", ["pm_cares_children"], /orphan|sponsorship|bal seva|foster/i),
  ] },
  { id: "disability", icon: "♿", en: "Disability in the family", hi: "परिवार में दिव्यांगता", stages: [
    S("Pension & money", "पेंशन और सहायता राशि", ["igndps"], /disab.{0,20}pension|divyang.{0,20}pension|viklang|disability allowance/i),
    S("Aids & devices", "सहायक उपकरण", ["adip"], /assistive|wheelchair|hearing aid|tricycle|artificial limb/i),
    S("Study & work", "पढ़ाई और काम", [], /(disab|divyang).{0,40}(scholar|skill|loan|employ|marriage)/i),
  ] },
  { id: "college", icon: "🎓", en: "Going to college", hi: "कॉलेज की पढ़ाई", stages: [
    S("Scholarships", "छात्रवृत्ति", ["scholarship", "csss"], /post.?matric|college|graduat|higher education|university|degree|merit.{0,15}scholar/i),
    S("Education loan", "शिक्षा ऋण", ["pm_vidyalaxmi"], /education loan|student credit card|vidya.?lakshmi/i),
  ] },
];

const BY_ID = new Map(SCHEME_DB.map(s => [s.id, s]));
const textOf = (s) => `${s.name?.en || ""} ${s.tag?.en || ""} ${s.benefit?.en || ""}`;

// The schemes for one life event, for people living in `state` (Central only
// when the state is unknown). Returns [{ stage, schemes:[scheme…] }].
export function lifeEventPlan(eventId, state = "", perStage = 6) {
  const ev = LIFE_EVENTS.find(e => e.id === eventId);
  if (!ev) return [];
  const ok = (s) => s && !s.duplicateOf && !s.closed && (s.scope !== "state" || (state && s.state === state));
  const pool = SCHEME_DB.filter(ok);
  // Hand-picked schemes belong to their own stage — keyword matches in an
  // earlier stage must not take them.
  const reserved = new Set(ev.stages.flatMap(st => st.ids || []));
  const used = new Set();
  return ev.stages.map(st => {
    const picked = [];
    for (const id of st.ids || []) { const s = BY_ID.get(id); if (ok(s) && !used.has(s.id)) { picked.push(s); used.add(s.id); } }
    if (st.re) {
      const more = pool.filter(s => !used.has(s.id) && !reserved.has(s.id) && st.re.test(textOf(s)) && !(st.not && st.not.test(textOf(s))))
        // your state's schemes first, then by yearly value
        .sort((a, b) => ((b.scope === "state") - (a.scope === "state")) || ((b.annual || 0) - (a.annual || 0)));
      for (const s of more) { if (picked.length >= perStage) break; picked.push(s); used.add(s.id); }
    }
    return { stage: st, schemes: picked.slice(0, perStage) };
  }).filter(x => x.schemes.length);
}
