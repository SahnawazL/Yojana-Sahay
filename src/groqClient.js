// groqClient.js — Yojana Sahay AI · Groq API handler
// UPDATED: System prompt now tells the AI it has web search capability.
// Everything else is unchanged — same two-tier context, same key rotation,
// same CHIPS parsing. Web search execution happens entirely in chat.js (backend).

import { SCHEME_DB as ALL_SCHEMES } from "./schemesData.js";
import { whoCanApply } from "./eligibilityText.js";
import { benefitSummary, benefitKind } from "./benefitMath.js";
import { cleanLinks, officialSchemeLink } from "./schemeMatch.js";
import { eligibilityLine, nearMisses } from "./eligibilityExplain.js";

// Duplicate listings (duplicateOf) are the same scheme listed twice — the AI
// sees each scheme once, and counts match the app's home screen.
const SCHEME_DB = ALL_SCHEMES.filter(s => !s.duplicateOf);

// ─── MODEL SELECTION ─────────────────────────────────────────────────────────
// llama-3.3-70b-versatile was deprecated by Groq (announced June 17, 2026) and
// is being decommissioned — migrated to openai/gpt-oss-120b, Groq's recommended
// replacement for this exact model.
//
// openai/gpt-oss-120b → free tier, hosted directly on Groq's LPU hardware
//   • Free-tier limits per key: 30 RPM / 1K RPD / 8K TPM / 200K TPD
//     (2x the daily token budget vs the old model's 100K TPD — better fit
//      for our 6-key rotation pool and real daily traffic)
//   • Strong JSON adherence, multi-turn conversation, and Hindi support
//
// Alternatives (swap MODEL string if needed):
//   "llama-3.1-8b-instant" → fastest, lowest quality, same free-tier limits
//   "openai/gpt-oss-120b"  → best quality on free tier ← CURRENT CHOICE
//   "qwen/qwen3-32b"       → higher RPM (60) but lower TPM (6K)
//
const MODEL = "openai/gpt-oss-120b";

// ─── DEVELOPER & APP IDENTITY ────────────────────────────────────────────────
// Single source of truth — update here to update AI knowledge everywhere.
const DEVELOPER = {
  name:      "Sahnawaz Ahmed Laskar",
  alias:     "The Digital Alchemist / SHZ",
  role:      "Full Stack Developer & UI/UX Designer",
  location:  "Silchar, Assam, India",
  education: "MCA, Yenepoya University, Bangalore",
  portfolio: "https://sahnawaz-portfolio.vercel.app",
  email:     "shzthedigitalalchemist@gmail.com",
  instagram: "https://instagram.com/sahnawaz.ui.dev",
  clients:   "Flipkart, Xiaomi India, Rapido",
  skills:    "React.js, Node.js, JavaScript, Python, PHP, Tailwind CSS, Figma, Firebase, Groq AI",
};

const APP = {
  name:        "Yojana Sahay",
  tagline:     "Aid for citizens to find government schemes",
  url:         "https://yojanasahay.vercel.app",
  description: "A mobile-first web app that helps Indian citizens (especially rural) discover, check eligibility for, and apply to Central and State government schemes in Hindi and English.",
  features: [
    "Eligibility check: 8–12 short questions (who you are, income, state, house, category, age, area, gender, disability, special groups like construction worker / fisherman) → schemes you qualify for with an honest yearly estimate",
    "Scheme page: documents checklist, Apply button, 'I've applied — track it' (date + reference number + status)",
    "Home: 'My Applications' card with 30-day status-check reminders; 'Family Benefits' card to find schemes for wife, children, parents",
    "Phone reminders (signed-in users): deadline closing soon, time to check an application, new matching scheme — at most one a day",
    "Share my result as an image on WhatsApp",
    "Home screen with popular schemes and category tiles",
    "Search tab to browse and filter all schemes",
    "Schemes tab: browse ALL schemes with category filter pills (🌾Farmer · 📚Student · 👩Women · 👴Senior · 💼Business · 🏠Housing) and state selector (top-right); the All(N) pill shows the live total count",
    "AI Help tab — this AI assistant (Hindi + English)",
    "Profile tab for personalized scheme recommendations",
    "Eligibility quiz: asks about occupation, income, state, housing, age, area",
    "Suggested follow-up chips after each AI response",
    "Reading-time cooldown for rural users (10–15s after each reply)",
    "Light / dark mode, Ashok Chakra animation in header",
    "Powered by Groq AI (openai/gpt-oss-120b) via Vercel serverless API",
    "Web search powered by Tavily for real-time scheme updates",
  ],
  tech: "React.js, Vercel, Groq API, Tavily Search, Vite",
  builtBy: DEVELOPER.name,
};


// ─── KEYWORD MAP ──────────────────────────────────────────────────────────────
const KEYWORD_MAP = {
  farmer:   ["farmer","kisan","farming","agriculture","crop","kheti","khet","krishi","ryot","shetkari","annadata","fasal","bima","rythu","kalia"],
  housing:  ["house","housing","home","awas","ghar","shelter","makaan","flat","room","plot","construction","build","pmay","gramin","abua"],
  women:    ["women","woman","female","girl","mahila","beti","widow","vidhwa","maternity","shg","ladki","nari","stri","sakhi","lakshmi","bahin","orunodoi"],
  student:  ["student","scholarship","education","study","college","school","padhai","chhatravritti","shiksha","university","degree","merit","nsp","vidyarthi","tablet","smartphone","nijut","moina","pragyan"],
  business: ["business","loan","mudra","startup","entrepreneur","shop","vyapar","udyog","msme","self employ","trade","dukaan","rozgar","vendor","artisan","vishwakarma","svanidhi","standup","atmanirbhar"],
  health:   ["health","hospital","medical","ayushman","treatment","doctor","swasthya","bimari","insurance","pmjay","dawai","ilaaj","chiranjeevi","amrutum","karunya","mohalla","sahara","atal amrit"],
  senior:   ["senior","pension","old age","elderly","budhapa","vridha","vridh","aged","retire","widow pension","60 year","bujurg","apy","atal pension"],
  ration:   ["ration","food","ration card","bpl","poverty","apl","pds","anaj","gehu","chawal","subsidy","antyodaya","nfsa"],
  insurance:["insurance","bima","jeevan","suraksha","pmjjby","pmsby","accident"],
  skill:    ["skill","training","kaushal","pmkvy","ddu","rozgar","employment","job","saksham","yuva"],
  water:    ["water","jal","jeevan","piped","toilet","swachh","sanitation","shauchalay"],
};

// ─── HINGLISH, HINDI & LOOSE SPELLINGS → topic words ─────────────────────────
// People type "budhape ki pension", "kisan wala paisa", "ladki ki padhai",
// "skolarship" or plain Hindi. Each pattern adds the English words our scheme
// data uses, so the right schemes are found. Applied to the question only.
const QUERY_EXPANSIONS = [
  [/budh?ap[ae]|budh?e\b|boodh|bujurg|buzurg|vridh|vriddh|बुढ़ाप|बुजुर्ग|वृद्ध|बूढ़/, "senior old age pension elderly"],
  [/pen[st]ion|penshan|penson|पेंशन/, "pension"],
  [/vidhwa|vidhava|bewa|widow|pati (ki )?(maut|death|nahi)|विधवा/, "widow pension women"],
  [/kisan wala|kisan ka paisa|kisan ki kist|6 ?000 wala|6 ?hazar|किसान सम्मान|किसान का पैसा/, "pm kisan samman nidhi farmer"],
  [/kisaan|kisan|kheti|khet|फसल|किसान|खेती/, "farmer kisan agriculture"],
  [/fasal (kharab|barbad|nuksan|nuksaan)|crop (loss|damage)|फसल (खराब|बर्बाद|नुकसान)/, "crop insurance fasal bima farmer"],
  [/ladki|ladkiyon|beti|bitiya|kanya|लड़की|बेटी|कन्या/, "girl beti women"],
  [/padhai|padhna|padhne|school fees|college fees|vazifa|wazifa|chatravritti|chhatravriti|skolar|scolar|schlor|scholer|पढ़ाई|छात्रवृत्ति|स्कॉलरशिप/, "scholarship student education"],
  [/ghar banan|ghar ke liye|pakka ghar|pakka makan|makaan|makan|मकान|घर बनान|पक्का घर|आवास/, "housing awas house"],
  [/ilaa?j|bimari|beemari|dawai|\bdava\b|aspatal|hospital|ऑपरेशन|operation|इलाज|बीमारी|अस्पताल|दवा/, "health hospital treatment ayushman"],
  [/ayushmaa?n|ayusman|aayushman|आयुष्मान/, "ayushman pmjay health"],
  [/gas (cylinder|connection|chulha)|cylinder|chulha|lpg|गैस|सिलेंडर/, "lpg gas ujjwala"],
  [/viklang|vikalang|divyang|handicap|apahij|apaahij|disabled|दिव्यांग|विकलांग/, "disability divyang"],
  [/berozgar|naukri|nokri|rozgar|rojgar|kaam chahiye|job|नौकरी|रोज़गार|रोजगार|बेरोज़गार/, "employment job skill rozgar"],
  [/shaadi|shadi|vivah|byah|marriage|शादी|विवाह/, "marriage vivah"],
  [/garbh|pregnan|delivery|janani|matritva|prasav|गर्भ|प्रसव|मातृत्व/, "maternity pregnant women"],
  [/karz|karj|karza|qarz|udhar|lone\b|loan|ऋण|कर्ज|लोन/, "loan"],
  [/dukaan|dukan|dhanda|dhandha|vyapar|byapar|business|दुकान|व्यापार|धंधा/, "business loan self employed"],
  [/bijli|light bill|electricity|solar|बिजली|सोलर/, "electricity solar"],
  [/rashan|ration|anaj|anaaj|राशन|अनाज/, "ration food"],
  [/mazdoor|majdoor|shramik|labour|labor|मजदूर|श्रमिक/, "worker labour shramik"],
  [/machhuar|machhli|machli|मछुआर|मछली/, "fisherman fisheries"],
  [/bunkar|karigar|kareegar|kaarigar|बुनकर|कारीगर/, "artisan weaver"],
  [/anath|orphan|अनाथ/, "orphan child"],
  [/shauchalay|toilet|शौचालय/, "toilet sanitation"],
  [/bima|beema|insurance|बीमा/, "insurance"],
  [/mahila|aurat|\bstree\b|\bstri\b|महिला|औरत/, "women mahila"],
  [/pashu|gaay|\bgai\b|bhains|dairy|पशु|गाय|भैंस/, "animal husbandry dairy livestock farmer"],
];
function expandQuery(q) {
  const add = [];
  for (const [re, words] of QUERY_EXPANSIONS) if (re.test(q)) add.push(words);
  return add.length ? `${q} ${add.join(" ")}` : q;
}

const ALL_STATES = [
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa",
  "gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala",
  "madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland",
  "odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura",
  "uttar pradesh","uttarakhand","west bengal","delhi","jammu","kashmir",
  "ladakh","puducherry","chandigarh","andaman",
];
// Short forms → full state name. Matched as whole words only — the old
// substring check read "apply" as Andhra Pradesh and "support" as UP.
const STATE_ABBR = {
  up:"uttar pradesh", mp:"madhya pradesh", wb:"west bengal", ap:"andhra pradesh", tn:"tamil nadu",
  hp:"himachal pradesh", uk:"uttarakhand", mh:"maharashtra", ka:"karnataka", rj:"rajasthan",
  gj:"gujarat", pb:"punjab", hr:"haryana", jk:"jammu", "j&k":"jammu", orissa:"odisha", bengal:"west bengal",
};
const hasWord = (text, w) => new RegExp(`(^|[^a-z0-9\u0900-\u097F])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9\u0900-\u097F])`, "i").test(text);
function detectState(text) {
  const full = ALL_STATES.find(s => text.includes(s));
  if (full) return full;
  for (const [ab, st] of Object.entries(STATE_ABBR)) if (hasWord(text, ab)) return st;
  return null;
}

// ─── TIER 1: COMPACT INDEX OF ALL SCHEMES ────────────────────────────────────
// Gives the AI awareness of EVERY scheme name + count — tiny token footprint.
// Format: "🌾 PM Kisan Samman Nidhi | 🏠 PM Awas Yojana (Gramin) | ..."
function buildAllSchemesIndex() {
  const national = SCHEME_DB.filter(s => s.scope === "national");
  const byState  = {};

  SCHEME_DB.filter(s => s.scope === "state").forEach(s => {
    if (!byState[s.state]) byState[s.state] = [];
    byState[s.state].push(s);
  });

  const natList = national.map(s => `${s.icon} ${s.name.en}`).join(" | ");
  const stateList = Object.entries(byState)
    .map(([state, schemes]) =>
      `  ${state}: ${schemes.map(s => `${s.icon} ${s.name.en}`).join(", ")}`
    ).join("\n");

  return (
    `NATIONAL SCHEMES (${national.length}):\n${natList}\n\n` +
    `STATE SCHEMES (${Object.values(byState).flat().length}) — grouped by state:\n${stateList}`
  );
}

// ─── STOP WORDS ───────────────────────────────────────────────────────────────
// Generic words that appear in almost every query but should NOT boost any scheme's score.
// Without this, "how many scheme record you have" matches every scheme because "scheme"
// appears in every scheme name → all 70+ schemes score > 0 → chaos.
const STOP_WORDS = new Set([
  "scheme","yojana","yojna","total","many","have","give","show","list","about",
  "what","which","tell","please","karo","batao","dikha","kitne","kitni","kuch",
  "aapke","aapki","your","you","this","that","with","from","more","also","just",
  "know","want","need","find","help","info","data","record","database","much",
  "each","every","some","only","here","does","when","where",
]);

// ─── PER-STATE SCHEME COUNT BUILDER ──────────────────────────────────────────
// Returns exact per-state counts derived from SCHEME_DB — never hallucinated.
function buildStateBreakdown() {
  const byState = {};
  SCHEME_DB.filter(s => s.scope === "state").forEach(s => {
    const key = s.state ?? "Unknown";
    byState[key] = (byState[key] ?? 0) + 1;
  });
  return Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .map(([state, count]) => `  ${state}: ${count} scheme${count > 1 ? "s" : ""}`)
    .join("\n");
}


// ─── COUNT GUIDANCE BUILDER ───────────────────────────────────────────────────
// Returns a bilingual in-app navigation guide for any count-related question.
// The Schemes tab shows LIVE counts directly from SCHEME_DB — always accurate,
// even after new schemes are added to state files without redeploying the AI.
function buildCountGuidance(lang, context = "total") {
  const isHindi = lang === "hi";

  if (isHindi) {
    const base = `\n\n📱 **ऐप में सटीक गिनती देखें (हमेशा सही रहती है):**
1. नीचे नेविगेशन बार में **"योजनाएं"** टैब पर टैप करें
2. सबसे ऊपर **"सभी योजनाएं"** पिल में लाइव कुल संख्या दिखती है
3. श्रेणी के अनुसार: 🌾 किसान · 📚 छात्र · 👩 महिला · 👴 वरिष्ठ · 💼 व्यापार · 🏠 आवास — किसी भी पिल पर टैप करें
4. अपने राज्य की योजनाएं: ऊपर दाईं ओर **"🇮🇳 सभी राज्य"** बटन → अपना राज्य चुनें`;

    if (context === "state") {
      return base + `\n5. राज्य चुनने के बाद **"सभी योजनाएं"** पिल में केवल उस राज्य की + केंद्रीय योजनाएं दिखेंगी`;
    }
    if (context === "category") {
      return base + `\n   (श्रेणी पिल में टैप करने पर उस श्रेणी की कुल योजनाएं दिखती हैं)`;
    }
    return base;
  }

  const base = `\n\n📱 **Check the exact count live in the app (always accurate):**
1. Tap the **"Schemes"** tab in the bottom navigation bar
2. The **"All Schemes"** pill at the top shows the live total — updates whenever new schemes are added
3. By category: tap 🌾 Farmer · 📚 Student · 👩 Women · 👴 Senior · 💼 Business · 🏠 Housing to see each category's count
4. By state: tap the **"🇮🇳 All States"** button (top-right) → select your state`;

  if (context === "state") {
    return base + `\n5. After selecting a state, the **"All Schemes"** pill shows only that state's schemes + Central schemes`;
  }
  if (context === "category") {
    return base + `\n   (The **"All Schemes"** pill updates as you switch category filters)`;
  }
  return base;
}

// ─── LINK + STATUS HELPERS ───────────────────────────────────────────────────
// Only real web addresses become links. 130+ offline schemes have text like
// "Nearest bank branch" in `apply`, which used to be sent as
// "https://Nearest bank branch" — a fake link the AI then showed to people.
// Only OFFICIAL links reach the AI (see schemeMatch.js) — about 60 entries
// in the data point at blogs/news/private sites, and the AI used to repeat them.
const schemeLink = (s) => officialSchemeLink(s);
// Deadline / open-closed status from the verifier (schemes-meta.json).
function schemeStatus(s) {
  const parts = [];
  if (s?.lastDate) {
    const d = new Date(s.lastDate);
    if (!isNaN(d)) parts.push(`${d < new Date() ? "last date passed" : "last date"}: ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`);
  }
  if (s?.isActive === false) parts.push("currently closed (may reopen)");
  else if (s?.isActive === true) parts.push("applications open");
  return parts.join(" · ");
}

// ─── SMART CONTEXT BUILDER ───────────────────────────────────────────────────
// Scores every scheme against the query, then auto-picks detail depth:
//   • Total/global count query  → exact totals + per-state breakdown (NO listing)
//   • 1 scheme matched          → full card (docs, annual, link, ministry)
//   • 2–4 matched               → medium (benefit + link per scheme)
//   • 5+ matched / list query   → names only, capped at 6
//   • Nothing matched           → top 5 national, compact
//
// FIX Bug 2: accepts `profile` so implicit attributes (gender, occupation, state)
// boost keyword scoring even when the query itself omits those words.
// "Me / my / can I / eligible / mujhe / मेरे…" → the person is asking about
// THEMSELVES, so answer from the app's own eligibility results.
const PERSONAL_RE = /\b(me|my|mine|myself|i|i'm|im|can i|for me|eligible|eligibility|qualify|mujhe|mujhko|mere|mera|meri|main|hum|hamare|hamein|kaunsi|konsi|kaun si|kya mil)\b|मुझे|मेरे|मेरा|मेरी|मैं|हमें|पात्र|कौन सी/i;
// Short follow-ups that point back at the previous answer.
const FOLLOWUP_RE = /\b(it|its|this|that|these|those|them|first|second|third|1st|2nd|3rd|last one|above|same|uska|iska|iske|uske|ye|yeh|woh|wo|pehla|pehli|doosra|dusra|teesra)\b|इसका|उसका|इसके|उसके|यह|वह|पहला|पहली|दूसरा|तीसरा/i;
const ORDINALS = [
  [/\b(first|1st|pehla|pehli|number 1|no\.? ?1)\b|पहला|पहली/i, 0],
  [/\b(second|2nd|doosra|dusra|number 2|no\.? ?2)\b|दूसरा|दूसरी/i, 1],
  [/\b(third|3rd|teesra|number 3|no\.? ?3)\b|तीसरा|तीसरी/i, 2],
];

function buildSmartContext(query, lang = "en", profile = null, extras = {}) {
  const q0 = query.toLowerCase();
  const q = expandQuery(q0); // Hinglish / Hindi / misspellings → topic words
  // The topic words the question was mapped to ("budhape" → old age pension):
  // a scheme whose NAME carries them is what the person meant.
  const expWords = [...new Set(q.slice(q0.length).split(/\s+/).filter(w => w.length > 3))];

  // ── Build a profile-augmented query string for keyword scoring ───────────────
  // Example: female farmer in Assam asking "what schemes can I get?" now also
  // scores against "farmer kisan women mahila assam" even though none appear in q.
  const profileTokens = [];
  // A question that already names a topic ("scholarship", "pension") is
  // answered on that topic — the profile only adds the state, otherwise a
  // farmer asking about scholarships got farm schemes mixed in.
  const queryHasTopic = Object.values(KEYWORD_MAP).some(kws => kws.some(kw => hasWord(q, kw)));
  if (profile && queryHasTopic) {
    if (profile.state) profileTokens.push(profile.state.toLowerCase());
  } else if (profile) {
    if (profile.occupation) {
      const occMap = { farmer:"farmer kisan kheti", student:"student scholarship padhai", women:"homemaker mahila", senior:"senior elderly pension", business:"business loan udyog", general:"" };
      profileTokens.push(occMap[profile.occupation] ?? profile.occupation);
    }
    if (profile.gender === "female") profileTokens.push("women mahila female girl beti nari");
    if (profile.state)     profileTokens.push(profile.state.toLowerCase());
    if (profile.ration === "bpl" || profile.ration === "aay") profileTokens.push("bpl poverty ration food");
    if (profile.disability && profile.disability !== "none")  profileTokens.push("disability divyang");
    if (profile.income === "below1") profileTokens.push("below poverty poor");
    if (profile.area === "rural")    profileTokens.push("rural gramin village");
  }
  // Merge: original query gets full weight; profile tokens augment it
  const augQ = (q + " " + profileTokens.join(" ")).trim();
  const l = lang === "hi" ? "hi" : "en";

  // ── Detect state & detail-level signals from query ──────────────────────────
  // Use augQ (profile-aware) for state detection so profile.state boosts state schemes
  // The question's own state wins; the profile's state is the fallback.
  const mentionedState = detectState(q) ?? (profile?.state ? profile.state.toLowerCase() : null);
  const wantsCount  = /how many|kitni|kitne|total|count/.test(q);
  const wantsList   = /list|all scheme|sabhi|show all|sab yojna|sab yojana/.test(q);
  const wantsDetail = /document|kagaz|apply|avedan|eligib|yogyta|how to|kaise|kya chahiye|detail|full info|link|website|portal/.test(q);

  // ── Detect "total/overall count" queries (no specific topic) ─────────────────
  // Use q (raw query) so profile tokens don't accidentally suppress total-count detection
  const NO_TOPIC = !detectState(q) &&
    !/farmer|kisan|health|student|women|mahila|housing|awas|business|pension|senior|insurance|ration|water|jal|skill/.test(q);
  const wantsTotalCount = (wantsCount || wantsList) && NO_TOPIC;

  // ── Detect per-state breakdown request ───────────────────────────────────────
  const wantsStateBreakdown = /each state|state.?wise|har state|per state|state mein kitni|state ke liye|every state/.test(q) && (wantsCount || wantsList);

  // ── Score each scheme against the profile-augmented query ───────────────────
  const scored = SCHEME_DB.map(s => {
    const searchText = [
      s.name.en, s.name.hi,
      s.tag.en,  s.tag.hi,
      s.benefit.en, s.benefit.hi,
      s.id,
      s.state ?? "",
      s.ministry?.en ?? "",
    ].join(" ").toLowerCase();

    // 1. The scheme is named in the question itself (query only, not profile).
    let nameScore = 0;
    // Whole words only — the id "ran" used to match inside "insurance" / "ration".
    if (hasWord(q0, s.id.replace(/_/g, " "))) nameScore += 20;
    if (q.includes(s.name.en.toLowerCase()))  nameScore += 15;
    if (s.name.hi && q.includes(s.name.hi.toLowerCase())) nameScore += 15;

    // 2. Schemes of OTHER states are left out entirely — a Kerala question
    //    used to surface a Sikkim scheme whose long text matched many words.
    let stateBonus = 0;
    if (mentionedState) {
      if (s.scope === "state") {
        const st = String(s.state || "").toLowerCase();
        if (st.includes(mentionedState) || mentionedState.includes(st)) stateBonus = 3;
        else if (!nameScore) return { scheme: s, score: -1, nameScore: 0 };
      } else stateBonus = 1; // Central schemes apply everywhere
    }

    // 3. Relevance: each topic counts once; topic words in the scheme's own
    //    name/tag count extra; other words are capped so long descriptions
    //    don't win by sheer length.
    let rel = 0;
    for (const [, kws] of Object.entries(KEYWORD_MAP)) {
      if (kws.some(kw => hasWord(augQ, kw) && searchText.includes(kw))) rel += 4;
    }
    const nameTag = `${s.name.en} ${s.tag.en}`.toLowerCase();
    for (const [, kws] of Object.entries(KEYWORD_MAP)) {
      if (kws.some(kw => hasWord(q, kw) && nameTag.includes(kw))) rel += 3;
    }
    let expHits = 0;
    for (const w of expWords) if (nameTag.includes(w)) expHits++;
    rel += Math.min(expHits * 3, 9);
    const words = augQ.split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    let wordHits = 0;
    for (const w of words) if (searchText.includes(w)) wordHits++;
    rel += Math.min(wordHits, 4);

    // Being in the right state only helps a scheme that is actually relevant.
    const score = nameScore + (rel > 0 ? rel + stateBonus : 0);
    return { scheme: s, score, nameScore };
  })
  .filter(x => x.score >= 2)   // >= 2 prevents spurious matches on generic words
  .sort((a, b) => b.score - a.score);

  // Fallback: top 5 national if nothing scored
  const matched = scored.length > 0
    ? scored.map(x => x.scheme)
    : SCHEME_DB.filter(s => s.scope === "national").slice(0, 5);

  // ── Helper: build official link ──────────────────────────────────────────────
  const getLink = (s) => schemeLink(s);

  // ── Is THIS user eligible? (app's own rules with their answers) ─────────────
  const ans = extras.answers || null;
  const elig = (s) => (ans ? eligibilityLine(s, ans) : "");

  // ── FORMAT FUNCTIONS ─────────────────────────────────────────────────────────
  const formatFull = (s) => {
    const link = getLink(s);
    const docs = (s.docs?.[l] ?? []).join(", ") || "Aadhaar Card";
    const annual = s.annual > 0 ? `₹${s.annual.toLocaleString("en-IN")}/year` : "Non-monetary";
    let who = ""; try { who = whoCanApply(s, l === "hi" ? "hi" : "en") || ""; } catch {}
    const status = schemeStatus(s);
    return (
      `📌 ${s.name[l]} [${s.scope === "state" ? s.state : "Central"}]\n` +
      `  Ministry : ${s.ministry?.[l] ?? "—"}\n` +
      `  Benefit  : ${s.benefit[l]}\n` +
      `  Annual   : ${annual}\n` +
      (who ? `  Who can apply: ${String(who).replace(/\s+/g, " ").slice(0, 400)}\n` : "") +
      (status ? `  Status   : ${status}\n` : "") +
      `  Docs     : ${docs}\n` +
      `  Apply    : ${s.applyType === "online" ? "Online" : `At office — ${/^https?:|www\./i.test(s.apply?.[l] ?? "") ? "nearest government office" : (s.apply?.[l] ?? s.apply?.en ?? "nearest government office")}`}` +
      (link ? `\n  OFFICIAL_LINK: ${link}` : "") +
      (elig(s) ? `\n  ${elig(s)}` : "")
    );
  };

  const formatMedium = (s) => {
    const link = getLink(s);
    return (
      `• ${s.name[l]} [${s.scope === "state" ? s.state : "Central"}]\n` +
      `  ${s.benefit[l]}` +
      (link ? `\n  OFFICIAL_LINK: ${link}` : "") +
      (elig(s) ? `\n  ${elig(s)}` : "")
    );
  };

  const formatName = (s, i) => {
    const link = getLink(s);
    return (
      `${i + 1}. **${s.name[l]}** [${s.scope === "state" ? s.state : "Central"}]` +
      (link ? `\n   OFFICIAL_LINK: ${link}` : "")
    );
  };

  // ── Follow-up about the previous answer ("documents for the first one") ──
  const lastReply = String(extras.lastReply || "");
  const shortAsk = q0.split(/\s+/).length <= 5 && !(scored.length && scored[0].score >= 3) &&
    /document|kagaz|apply|link|eligib|kaise|how|kab|when|deadline|last date|amount|kitna|paisa|benefit|labh|दस्तावेज़|आवेदन|कैसे|कब/.test(q);
  const isFollowUp = lastReply && (FOLLOWUP_RE.test(q) || shortAsk);
  const directHit = scored.some(x => x.nameScore >= 15); // a scheme named in the question itself
  if (isFollowUp && !directHit) {
    const inLast = SCHEME_DB
      .map(sc => ({ sc, at: Math.min(...[sc.name.en, sc.name.hi].filter(Boolean).map(n => { const i = lastReply.indexOf(n); return i < 0 ? Infinity : i; })) }))
      .filter(x => Number.isFinite(x.at))
      .sort((a, b) => a.at - b.at)
      .map(x => x.sc);
    if (inLast.length) {
      const ord = ORDINALS.find(([re]) => re.test(q));
      const pick = ord && inLast[ord[1]] ? [inLast[ord[1]]] : inLast.slice(0, 3);
      return (
        `The user is asking a follow-up about scheme(s) from YOUR PREVIOUS ANSWER (in the order you listed them: ${inLast.slice(0, 8).map((x, i) => `${i + 1}. ${x.name[l]}`).join("; ")}).\n` +
        `Answer about ${pick.length === 1 ? "this scheme" : "these schemes"}:\n\n` + pick.map(formatFull).join("\n\n")
      );
    }
  }

  // ── "Which am I ALMOST eligible for?" / "what's stopping me?" ──────────────
  const wantsNear = /almost|near.?miss|nearly|close to|missing|what.*(stop|block)|kya kami|kami hai|lagbhag|kis wajah|लगभग|कमी/.test(q0);
  if (wantsNear && ans && !directHit) {
    const ids = new Set((Array.isArray(extras.matched) ? extras.matched : []).map(x => x.id));
    const nm = nearMisses(ans, ids, 6);
    if (nm.length) {
      return `SCHEMES THE USER ALMOST QUALIFIES FOR (computed by the app from their answers — ONE realistic change away; TRUST it):\n` +
        nm.map((x, i) => `${i + 1}. **${x.scheme.name[l]}** [${x.scheme.scope === "state" ? x.scheme.state : "Central"}] — ${x.scheme.benefit[l]}\n   What's missing: ${x.line}` +
          (schemeLink(x.scheme) ? `\n   OFFICIAL_LINK: ${schemeLink(x.scheme)}` : "")).join("\n") +
        `\n\nFor each, say plainly what is missing and how they could get it (e.g. apply for a BPL ration card at the Food & Civil Supplies office or a CSC; an income certificate from the tehsil / e-district portal). Never suggest giving false information.`;
    }
  }

  // ── Questions about the person themselves → the app's own eligibility result ──
  const mine = Array.isArray(extras.matched) ? extras.matched.filter(sc => !sc.duplicateOf) : [];
  // "how many schemes can I get" is about them, not the database total.
  const aboutMe = /\b(me|my|i|myself|mujhe|mujhko|mere|mera|meri|main)\b|मुझे|मेरे|मेरा|मेरी|मैं/i.test(query);
  const isPersonal = PERSONAL_RE.test(query) && !directHit && (aboutMe || (!wantsTotalCount && !wantsStateBreakdown));
  if (isPersonal && mine.length) {
    // A topic in the question ("scholarship for me") narrows the list.
    const topical = scored.filter(x => x.score >= 3).map(x => x.scheme.id);
    const topicSet = new Set(topical);
    const hasTopic = /farmer|kisan|student|scholar|padhai|women|mahila|beti|house|awas|ghar|pension|senior|health|ilaaj|hospital|business|loan|skill|job|rozgar|insurance|ration|disab|divyang/.test(q);
    let list = hasTopic ? mine.filter(sc => topicSet.has(sc.id)) : mine;
    if (!list.length) list = mine;
    // Regular yearly money first, then one-time help, then health cover; loans/insurance last.
    const KIND_RANK = { yearly: 0, oneTime: 1, health: 2, other: 3 };
    list = [...list].sort((a, b) => (KIND_RANK[benefitKind(a)] - KIND_RANK[benefitKind(b)]) || ((b.annual || 0) - (a.annual || 0)));
    const sum = benefitSummary(mine);
    const fmtINR = n => `₹${Math.round(n).toLocaleString("en-IN")}`;
    const head =
      `THE USER'S OWN ELIGIBILITY RESULT (from the app's eligibility check — this already applies their state, income, category, age, gender, disability and special groups; TRUST it and do not re-check eligibility rules yourself):\n` +
      `- They qualify for ${mine.length} schemes in total.\n` +
      (sum.yearly ? `- Estimated yearly support: about ${fmtINR(sum.yearly)} a year` : "") +
      (sum.health ? `${sum.yearly ? " · " : "- "}free health cover up to ${fmtINR(sum.health)}` : "") +
      (sum.oneTime ? ` · one-time help about ${fmtINR(sum.oneTime)}` : "") + "\n" +
      `- It is an estimate: money comes only after applying with the right documents and getting approved.\n` +
      (hasTopic && list !== mine ? `- ${list.length} of them match what they asked about.\n` : "") +
      `List the most useful ones (highest value first), say briefly why each fits them, and end with one clear next step.\n\n`;
    const body = list.slice(0, 8).map((sc, i) => formatName(sc, i) + `\n   ${sc.benefit[l]}` + (schemeStatus(sc) ? `\n   Status: ${schemeStatus(sc)}` : "")).join("\n");
    return head + body + (list.length > 8 ? `\n\n(+${list.length - 8} more — they can see all of them in the app's Eligibility results.)` : "");
  }

  // ── A scheme named in the question → full details for it ─────────────────
  if (directHit && !wantsCount && !wantsList) {
    const named = scored.filter(x => x.nameScore >= 15).map(x => x.scheme);
    const others = scored.filter(x => x.nameScore < 15).slice(0, 2).map(x => x.scheme);
    return named.slice(0, 2).map(formatFull).join("\n\n") +
      (others.length ? `\n\nRelated (mention only if useful):\n` + others.map(formatMedium).join("\n\n") : "");
  }

  // ── AUTO-PICK DEPTH based on match count + query signals ─────────────────────

  // CASE B checked first — it is more specific than CASE A.
  // "how many for each state" matches both wantsTotalCount AND wantsStateBreakdown;
  // without this ordering, Case A would fire and swallow the state breakdown query.

  // CASE B: User asks per-state count breakdown
  if (wantsStateBreakdown) {
    const national = SCHEME_DB.filter(s => s.scope === "national").length;
    const stateTotal = SCHEME_DB.filter(s => s.scope === "state").length;
    const breakdown = buildStateBreakdown();
    const guidance = buildCountGuidance(l, "state");
    return (
      `The ${stateTotal} state-specific schemes are distributed as follows (use these EXACT numbers — do not change them):\n` +
      breakdown + "\n\n" +
      `There are also ${national} Central (national) schemes available to all states.\n` +
      `Do NOT invent or modify these numbers.\n\n` +
      `AFTER giving the breakdown, append this navigation tip for the user:` +
      guidance
    );
  }

  // CASE A: User asks total count OR wants to list all schemes (no specific topic)
  // → Give exact numbers + guide user to Schemes tab for live counts.
  if (wantsTotalCount) {
    const national = SCHEME_DB.filter(s => s.scope === "national").length;
    const stateTotal = SCHEME_DB.filter(s => s.scope === "state").length;
    const total = SCHEME_DB.length;
    const guidance = buildCountGuidance(l, "total");

    if (wantsList) {
      // User wants to SEE all schemes — provide full compact index + app guidance
      // The full index of 1,100+ names is ~15K tokens — larger than Groq's
      // free-tier per-minute token limit, so this request always failed
      // ("Request too large") and no answer could list that many anyway.
      // Give the Central list plus per-state counts and point to the tab.
      const centralList = SCHEME_DB.filter(s => s.scope === "national").map(s => `${s.icon} ${s.name.en}`).join(" | ");
      return (
        `EXACT DATABASE TOTAL: ${total} schemes (${national} Central + ${stateTotal} State-specific).\n` +
        `There are too many to list in one chat reply. List the Central schemes below using ONLY these names ` +
        `(do NOT add, remove, or rename any), then give the per-state counts, and tell the user the Schemes tab ` +
        `shows every scheme with filters:\n\nCENTRAL SCHEMES:\n${centralList}\n\nSTATE COUNTS:\n${buildStateBreakdown()}` +
        `\n\nAPPEND THIS GUIDANCE AT THE END OF YOUR REPLY (translate to ${l === "hi" ? "Hindi" : "English"}):` +
        guidance
      );
    }

    // User only wants the COUNT
    const breakdown = buildStateBreakdown();
    return (
      `ANSWER THIS EXACTLY: The database currently has ${total} total schemes — ${national} Central (national) schemes and ${stateTotal} State-specific schemes.\n` +
      `Do NOT list all scheme names unless explicitly asked.\n` +
      `Per-state distribution (use EXACT numbers — do not invent):\n` +
      breakdown +
      `\n\nAFTER giving the count, ALWAYS append this guidance (it helps users see live counts):` +
      guidance
    );
  }

  // CASE C: Count/list for a specific topic (e.g. "how many farmer schemes")
  if (wantsCount || wantsList) {
    if (matched.length === 0) {
      return `No schemes found in the database matching that specific criteria. There are ${SCHEME_DB.length} total schemes (${SCHEME_DB.filter(s=>s.scope==="national").length} Central + ${SCHEME_DB.filter(s=>s.scope==="state").length} State).`;
    }
    // Numbered list with links.
    // Pre-build the opening sentence so AI copies it exactly — never recounts.
    const lines = matched.map((s, i) => formatName(s, i)).join("\n");
    const label = matched.length === 1 ? "scheme" : "schemes";
    const guidance = buildCountGuidance(l, "category");
    return (
      `YOUR FIRST LINE MUST BE EXACTLY THIS (do not include this label in your reply):\n` +
      `There are ${matched.length} ${label} in our database for this.\n\n` +
      `TOTAL: ${matched.length} — do NOT recount, do NOT deduplicate by link.\n\n` +
      lines +
      `\n\nAFTER the numbered list, append this navigation tip for the user:` +
      guidance
    );
  }

  if (matched.length === 1 || wantsDetail) {
    // Full detail — 1 exact match OR user explicitly asked for details
    return matched.slice(0, 3).map(formatFull).join("\n\n");
  }

  if (matched.length <= 4) {
    // Medium — benefit + link per scheme
    return matched.slice(0, 4).map(formatMedium).join("\n\n");
  }

  // Many matches — compact names + benefit + link, cap at 6
  return matched.slice(0, 6).map(formatMedium).join("\n\n");
}


// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
// Built once per request. Contains:
//   • Language rule
//   • Identity (who you are, who built you, what app you live in)
//   • Scheme counts + full index (Tier 1) — AI knows everything
//   • Relevant scheme details (Tier 2) — injected at the end
//   • WEB SEARCH GUIDANCE (NEW) — tells AI when/how to use search results
function buildSystemPrompt(query, lang, profile = null, extras = {}) {
  const isHindi  = lang === "hi";
  const national = SCHEME_DB.filter(s => s.scope === "national").length;
  const state    = SCHEME_DB.filter(s => s.scope === "state").length;
  const total    = SCHEME_DB.length;

  const langRule = isHindi
    ? "- Reply in simple Hindi (हिंदी) by default. If the user writes in Hinglish (Hindi in English letters, e.g. 'mujhe kaunsi yojana milegi'), reply in the same easy Hinglish. If they write in clear English, you may reply in English."
    : "- Reply in simple English by default. If the user writes in Hindi (Devanagari), reply in Hindi; if they write Hinglish (e.g. 'mujhe kaunsi yojana milegi'), reply in the same easy Hinglish.";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const apps = Array.isArray(extras.applications) ? extras.applications : [];
  const appsBlock = apps.length
    ? `\n══ THE USER'S TRACKED APPLICATIONS (from 'I've applied' in the app) ══\n` +
      apps.slice(0, 10).map(a => `- ${a.name}: applied ${a.appliedAt}${a.ref ? `, ref ${a.ref}` : ""}, status: ${a.status}${a.daysWaiting != null ? ` (${a.daysWaiting} days ago)` : ""}`).join("\n") +
      `\nUse this when they ask about their applications or status. If something has waited 30+ days, suggest checking the status on the official site/office and updating it in the app.\n`
    : "";

  const chipsRule = isHindi
    ? `अपने जवाब के एकदम अंत में एक नई लाइन पर लिखें (valid JSON array):
CHIPS:["सवाल 1","सवाल 2","सवाल 3"]
- योजनाओं से संबंधित होने पर ही chips दें; असंबंधित सवालों पर CHIPS:[] लिखें
- हर chip 4–6 शब्द की हो`
    : `At the very END of your reply, on a new line, append (valid JSON array):
CHIPS:["question 1","question 2","question 3"]
- Provide chips ONLY for scheme-related queries; for off-topic messages use CHIPS:[]
- Keep each chip 4–7 words, specific and actionable`;

  // ── Context: only smart-scored relevant schemes for this query ───────────────
  const smartContext = buildSmartContext(query, lang, profile, extras);

  return `You are Yojana Sahay AI — the official AI assistant of the Yojana Sahay app.

TODAY: ${today} (India). Treat anything about dates and deadlines relative to today.

══ YOUR IDENTITY ══
- App: ${APP.name} (${APP.tagline})
- Built by: ${DEVELOPER.name} aka "${DEVELOPER.alias}"
- If asked about the developer, share: Portfolio: ${DEVELOPER.portfolio} | Email: ${DEVELOPER.email} | Instagram: ${DEVELOPER.instagram}

══ DATABASE ══
- EXACT total: ${total} schemes (${national} Central + ${state} State-specific)
- NEVER guess or invent scheme counts — the context below always has the exact numbers
- NEVER invent per-state counts — only use the breakdown provided in the context
- You know what's in our database AND you can search the web for real-time updates

══ WEB SEARCH (NEW) ══
- You have access to a web_search tool that searches the internet in real time.
- USE IT when the user asks about: new or recently launched schemes, deadlines, latest news, installment dates, any scheme you are unsure about, or anything that may have changed recently.
- DO NOT USE IT for: scheme names/details already in your database, eligibility questions answered by the user's profile, count/list queries already handled by the database context.
- When web search results are provided to you (in a tool result message), USE THOSE RESULTS to build your answer. Always mention the source URL if available.
- If search results and database data both exist for the same scheme, PREFER the web search result for dates/deadlines/news, and prefer the database for eligibility and documents.

══ APP NAVIGATION (guide users here for live counts) ══
- Schemes tab (bottom nav): shows ALL schemes with live count in "All (N)" pill
- Category filter pills in Schemes tab: 🌾 Farmer · 📚 Student · 👩 Women · 👴 Senior · 💼 Business · 🏠 Housing
- State selector button (top-right of Schemes tab): filter by state → shows that state's + Central schemes
- Home tab: category tiles show count badges — always live
- Eligibility Checker: Home → "Check Eligibility" → 8–12 quick questions → personal matched schemes + honest yearly estimate
- Scheme page → "I've applied — track it" saves the date & reference number; Home → "My Applications" shows status and 30-day check reminders
- Home → "Family Benefits" → add wife / children / parents to find schemes for each of them
- Home → "Get reminders on your phone" (signed-in users) for deadlines and application checks
- COUNT QUERIES: Always give the number from context, THEN guide user to Schemes tab to verify live

══ RULES ══
${langRule}
- PROFILE CONTEXT: When the conversation history contains a "[Profile context for personalization …]" message, use EVERY field — Gender, Occupation, State, Income, Ration card, Disability, Marital status, Children — to personalize ALL recommendations. Never ignore the profile.
- GENDER AWARENESS: If profile Gender is Female, proactively include women-specific schemes (Mahila, Beti, Maternity, SHG, Widow, Nari schemes) alongside other relevant ones — even if the user's query does not mention "women". If Gender is Male, skip women-only schemes unless the user explicitly asks.
- GREETINGS: When the user's message is ONLY a greeting (hi / hello / hey / namaste / हेलो / नमस्ते / हाय / good morning / good evening) — respond warmly using the respectful address, ask how you can help, and briefly mention what you can assist with. Never dump scheme data as a reply to a pure greeting.
- NAME / ADDRESS RULE:
  Derive the title from profile: Male→"Mr. FirstName", Female+married→"Mrs. FirstName", Female+other→"Ms. FirstName", Other/unspecified→"FirstName", Hindi→"FirstName जी".
  USE the address in these situations — and ONLY these:
    1. First reply in the conversation (greeting or first question).
    2. Opening a direct personalized recommendation ("Mr. Rahul, based on your profile…").
    3. When delivering important news — e.g. confirming eligibility, warning about ineligibility, or giving a key action step.
  DO NOT use the name in: every follow-up reply, mid-scheme-list, routine questions answered, or generic responses.
  Max ONE use per response. Repeating the name in every message feels robotic — use it only when it adds warmth or emphasis.

- PROFILE IS COMPLETE — NEVER ASK WHAT YOU ALREADY KNOW:
  The profile already contains all of the following. Use each field directly — NEVER ask the user to provide it again:
  • Income → use profile income field
  • Occupation → use profile occupation field
  • Housing (pucca/kutcha/no house) → use profile house field
  • State → use profile state field
  • Area type (rural/urban/semi-urban) → use profile area field
  • Age group → use profile age field
  • Gender → use profile gender field
  • Ration card (BPL/APL/AAY/none) → use profile ration field
  • Disability → use profile disability field
  • Marital status → use profile marital field
  • Children / girl children → use profile numChildren and hasGirls fields
  • Land holding / Kisan Credit Card → use profile landHolding and kisanCard fields
  • Education / institution type → use profile educationLevel and institutionType fields
  When user asks "check eligibility" or "what schemes can I get" — go STRAIGHT to recommendations using the full profile. Never list questions back when the profile is filled. Only ask a clarifying question if it covers something genuinely absent from all profile fields.

- Use simple words — many users are rural citizens

FORMATTING (follow strictly):
- When listing multiple schemes: ALWAYS number them as "1. **Scheme Name**" with bold name
- Show each scheme's OFFICIAL_LINK immediately below it as "🔗 https://..." on a new line
- NEVER use plain bullet dots (•) for scheme lists — use numbers
- COUNT RULE: If data has "YOUR FIRST LINE MUST BE EXACTLY THIS", use that sentence as your very first line — do NOT include the label itself. NEVER recount the list yourself — two schemes sharing the same website are still two separate schemes
- NEVER hallucinate links — ONLY use links from the OFFICIAL_LINK field in the data below, or official government sites (.gov.in / .nic.in) from web search results
- NEVER link to blogs, news sites, banks' marketing pages, NGOs or private companies — the app removes such links anyway. Name a news source in words if you used one.
- NEVER show "${APP.url}" as a link — user is already in the app
- If OFFICIAL_LINK is missing for a scheme: write "🔗 Apply at nearest govt. office"
- Full detail (docs, annual, ministry) only when user asks for details/documents/how to apply
- Do NOT use: # headers, backticks, or tables
- Only answer about: government schemes, eligibility, documents, how to apply, app features, developer info
- If off-topic, politely redirect to schemes
${chipsRule}

- Never promise money or approval — say "you may be eligible" and that the final decision is the government office's.
- ELIGIBILITY LINES: When the data has a "FOR THIS USER:" line, that is the app's own check with the user's answers — TRUST IT. If it says NOT ELIGIBLE, say so kindly, give the exact reason from that line, and say what would change it (e.g. a BPL card, an income certificate) — never suggest giving false information. If their real situation differs from what they entered, tell them to update their profile.
- ACTIONS: If the user says they HAVE APPLIED / submitted the form for a specific scheme, add this line just before CHIPS (exact scheme name from the data):
ACTION:applied:<scheme name>
  The app then shows a button to track it. Don't mention this line.
- If the user seems to be in distress or an emergency (no food, medical emergency, violence), give the relevant helpline first (112 emergency, 181 women helpline, 1098 child helpline, 14567 elder helpline) and then schemes.
${appsBlock}
══ RELEVANT SCHEME DATA FOR THIS QUERY ══
${smartContext}
`;
}

// ─── PARSE AI RESPONSE → { reply, followUps } ────────────────────────────────
function parseResponse(raw) {
  const chipsMatch = raw.match(/CHIPS:\s*(\[[\s\S]*?\])/);
  let followUps = [];

  if (chipsMatch) {
    try { followUps = JSON.parse(chipsMatch[1]); } catch { followUps = []; }
  }

  // Strip ALL CHIPS blocks globally — handles mid-reply leaks too
  const actions = parseActions(raw);
  const reply = cleanLinks(stripActions(raw.replace(/\n?CHIPS:\s*\[[\s\S]*?\]/g, "")).trim());

  followUps = [...new Set(followUps.filter(c => typeof c === "string" && c.trim()))].slice(0, 3);
  return { reply, followUps, actions };
}

// ─── AI RESULTS BRIEF ────────────────────────────────────────────────────────
// One-shot call — no conversation history, no scheme index, just the user's
// results. Called automatically when the eligibility checker shows results.
// 4 sentences: benefit + count, top scheme + apply step, near-miss/encouragement,
// then an honest 4th sentence reminding the user the total is an estimate that
// only becomes real after applying, approval, and correct documents per scheme.
const WHO_LABEL    = { farmer:"Farmer", student:"Student", women:"Woman", senior:"Senior Citizen", business:"Business Owner", general:"General Citizen" };
const INCOME_LABEL = { below1:"Below ₹1 Lakh", "1to3":"₹1–3 Lakh", "3to6":"₹3–6 Lakh", above6:"Above ₹6 Lakh" };
const AGE_LABEL    = { below18:"Below 18", "18to35":"18–35 yrs", "35to60":"35–60 yrs", above60:"Above 60 yrs" };

export async function generateResultsBrief(answers, matchedSchemes, nearMissSchemes, totalAnnual, lang = "en") {
  const isHindi = lang === "hi";

  // Build a clean human-readable profile line
  const casteTag = answers.caste && answers.caste !== "general" ? ` · ${answers.caste.toUpperCase()}` : "";
  const profileLine = [
    WHO_LABEL[answers.who] || answers.who,
    answers.state,
    INCOME_LABEL[answers.income] || answers.income,
    AGE_LABEL[answers.age] || answers.age,
    casteTag,
  ].filter(Boolean).join(" · ");

  const totalFormatted = totalAnnual >= 100000
    ? `₹${(totalAnnual / 100000).toFixed(1)} lakh/year`
    : totalAnnual > 0 ? `₹${totalAnnual.toLocaleString("en-IN")}/year` : "various benefits";

  // Top matched schemes — name + annual value
  const topMatched = matchedSchemes.slice(0, 5)
    .map(s => `${s.name.en}${s.annual ? ` (₹${s.annual.toLocaleString("en-IN")}/year)` : ""}`)
    .join(", ");

  // Top near-misses — name + first reason
  const topNearMiss = nearMissSchemes.slice(0, 2)
    .map(s => `${s.scheme?.name?.en || s.name?.en || ""}${s.reasons?.[0] ? ` — needs: ${s.reasons[0]}` : ""}`)
    .filter(Boolean).join(" | ");

  const systemPrompt = isHindi
    ? "आप एक भारतीय सरकारी योजना सलाहकार हैं। सरल, गर्मजोशी भरी हिंदी में लिखें। कोई बुलेट या हेडर नहीं — केवल सादा पैराग्राफ।"
    : "You are a warm Indian welfare advisor. Write in simple, encouraging English. Plain paragraph only — no bullets, no headers, no markdown.";

  const userPrompt = isHindi
    ? `एक नागरिक की पात्रता जांच पूरी हुई। 4 वाक्यों का व्यक्तिगत सारांश लिखें:

प्रोफाइल: ${profileLine}
कुल वार्षिक लाभ: ${totalFormatted}
मिली योजनाएं (${matchedSchemes.length}): ${topMatched || "कोई नहीं"}
${topNearMiss ? `लगभग मिलने वाली: ${topNearMiss}` : ""}

नियम:
- पहले वाक्य में कुल लाभ और योजनाओं की संख्या बताएं
- दूसरे वाक्य में सबसे बड़ी योजना और आवेदन की सलाह दें
- ${topNearMiss ? "तीसरे वाक्य में सबसे अच्छी near-miss और क्या करना है बताएं" : "तीसरे वाक्य में प्रोत्साहन दें"}
- चौथे वाक्य में एक छोटी, सहज लाइन में ईमानदारी से बताएं कि यह कुल राशि एक अनुमान है — असली लाभ तभी मिलेगा जब वे हर योजना के लिए सही दस्तावेज़ों के साथ आवेदन करें और मंज़ूरी मिले। हतोत्साहित किए बिना, भरोसेमंद और सहयोगी लहजे में लिखें — चेतावनी जैसा न लगे।
केवल सादा पैराग्राफ। ठीक 4 वाक्य।`
    : `A citizen just completed the eligibility checker. Write a warm 4-sentence personal brief:

Profile: ${profileLine}
Total annual benefit: ${totalFormatted}
Matched schemes (${matchedSchemes.length}): ${topMatched || "none"}
${topNearMiss ? `Near-misses: ${topNearMiss}` : ""}

Rules:
- Sentence 1: open with the total benefit and scheme count unlocked
- Sentence 2: name the highest-value scheme and give one concrete apply step
- Sentence 3: ${topNearMiss ? "mention the most achievable near-miss and exactly what they need to qualify" : "give an encouraging nudge to apply now"}
- Sentence 4: in one short, honest line, note that this total is an estimate and becomes real only once they apply and get approved for each scheme with the correct documents — write it supportively, like helpful advice, not a warning
Plain paragraph only. Exactly 4 sentences. No markdown.`;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  isHindi ? 900 : 650, // Previously a flat 460 for both languages — still got cut off mid-sentence
                                         // in practice (see screenshot reports) despite the earlier 300→460 bump.
                                         // Hindi (Devanagari) also costs more tokens per word than English for the
                                         // same sentence count, so it needs more headroom, not the same budget —
                                         // matches the ratio sendMessage() already uses below (800 vs 1200).
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Brief API error (${res.status})`);
  const data = await res.json();
  const choice = data?.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error("Empty brief");
  // If the model still hits the token limit despite the headroom above, the
  // API itself tells us via finish_reason — log it so this is easy to spot
  // and re-tune, instead of only ever noticing it from a user screenshot.
  // (App.jsx also has its own text-based safety net that trims a truncated
  // brief to the last complete sentence before ever displaying it.)
  if (choice?.finish_reason === "length") {
    console.warn(`[generateResultsBrief] Response hit max_tokens (${isHindi ? 900 : 650}) and was truncated by the API. Consider raising max_tokens further.`);
  }
  // Strip any accidental CHIPS block or markdown
  return content.replace(/\n?CHIPS:\s*\[[\s\S]*?\]/g, "").replace(/[#*`]/g, "").trim();
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
// Returns { reply: string, followUps: string[] }
// FIX Bug 2: accepts profile so buildSmartContext can score schemes against
// the user's implicit attributes (occupation, gender, state) not just the query.
// extras: { matched: schemes the user qualifies for (app's own result),
//          applications: tracked applications, lastReply: previous AI answer }
export async function sendMessage(conversationHistory, userQuery, lang = "en", profile = null, extras = {}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildChatBody(conversationHistory, userQuery, lang, profile, extras)),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error (${res.status})`);
  }

  const data = await res.json();

  // FIX: Guard against unexpected response shapes (e.g. Groq error after a
  // tool-call round-trip). Without this, data.choices[0] being undefined
  // causes an unhandled crash that shows a cryptic error to the user.
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    const errMsg = data?.error?.message || "Empty response from AI. Please try again.";
    throw new Error(errMsg);
  }

  return parseResponse(content.trim());
}

// Text shown while streaming: hide the CHIPS block (and a half-written
// "CHIPS" / "CHI" at the very end) so the user never sees raw JSON.
export function visibleStreamText(raw) {
  let t = raw;
  const i = t.search(/\n?CHIPS:/);
  if (i >= 0) t = t.slice(0, i);
  else t = t.replace(/\n?C(H(I(P(S)?)?)?)?$/, "");
  t = stripActions(t).replace(/\n?A(C(T(I(O(N)?)?)?)?)?$/, "");
  // Clean links on finished lines; hide a link that is still being written.
  const nl = t.lastIndexOf("\n");
  const done = nl >= 0 ? t.slice(0, nl + 1) : "";
  const tail = (nl >= 0 ? t.slice(nl + 1) : t).replace(/\[[^\]\n]*\]\(https?:[^)\s]*$|https?:\/\/\S*$|www\.\S*$/, "");
  return cleanLinks(done) + tail;
}

// ─── ACTIONS the AI can offer (shown as buttons) ─────────────────────────────
// The model adds a line like  ACTION:applied:PM Kisan Samman Nidhi  when the
// user says they've applied — the app shows "Add to My Applications".
const ACTION_LINE = /^\s*ACTION:\s*([a-z_]+)\s*:?\s*(.*)$/gim;
function parseActions(raw) {
  const out = [];
  for (const m of String(raw).matchAll(ACTION_LINE)) {
    const type = m[1].toLowerCase(), arg = m[2].replace(/CHIPS:.*/, "").trim();
    if (type === "applied" && arg) out.push({ type, name: arg.slice(0, 140) });
  }
  return out.slice(0, 3);
}
function stripActions(t) { return String(t).replace(/^\s*ACTION:.*$\n?/gim, ""); }

// ─── STREAMING EXPORT ────────────────────────────────────────────────────────
// Same request as sendMessage, but the answer arrives word by word.
// onDelta(visibleTextSoFar) is called as text arrives; onStatus("search", q)
// when the AI looks something up on the web. Resolves to { reply, followUps }.
// If the server answers with plain JSON (older deploy), falls back cleanly.
export async function sendMessageStream(conversationHistory, userQuery, lang = "en", profile = null, extras = {}, { onDelta, onStatus, signal } = {}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...buildChatBody(conversationHistory, userQuery, lang, profile, extras), stream: true }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error (${res.status})`);
  }

  const type = res.headers.get("content-type") || "";
  if (!type.includes("ndjson") || !res.body?.getReader) {
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error(data?.error?.message || "Empty response from AI. Please try again.");
    const parsed = parseResponse(content.trim());
    onDelta?.(parsed.reply);
    return parsed;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "", full = "", errMsg = "", lastShown = "";

  const handle = (line) => {
    if (!line.trim()) return;
    let ev; try { ev = JSON.parse(line); } catch { return; }
    if (ev.t === "d" && typeof ev.c === "string") {
      full += ev.c;
      const vis = visibleStreamText(full);
      if (vis !== lastShown) { lastShown = vis; onDelta?.(vis); }
    } else if (ev.t === "s") {
      onStatus?.("search", ev.q || "");
    } else if (ev.t === "e") {
      errMsg = ev.m || "AI error";
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
  }
  buf += decoder.decode();
  if (buf) handle(buf);

  if (!full.trim()) throw new Error(errMsg || "Empty response from AI. Please try again.");
  return parseResponse(full.trim());
}

function buildChatBody(conversationHistory, userQuery, lang, profile, extras) {
  return {
      model:       MODEL,
      max_tokens:  lang === "hi" ? 1200 : 800, // Hindi responses are longer — extra headroom to avoid mid-sentence cutoff
      temperature: 0.5,        // More factual accuracy for scheme data
      messages: (() => {
        // FIX Bug 1: Profile context (positions 0 & 1) must ALWAYS be included.
        // Detect profile prefix by the sentinel text injected in AIChat.jsx.
        // Slice only the actual conversation messages (everything after the 2 profile rows).
        const hasProfile =
          conversationHistory.length >= 2 &&
          conversationHistory[0]?.content?.includes("[Profile context for personalization");
        const profilePart = hasProfile ? conversationHistory.slice(0, 2) : [];
        const chatPart    = (hasProfile ? conversationHistory.slice(2) : conversationHistory).slice(-6);
        return [
          { role: "system", content: buildSystemPrompt(userQuery, lang, profile, extras) },
          ...profilePart,   // always present — never sliced away
          ...chatPart,      // last 6 chat turns (3 exchanges) — fits 70b context easily
        ];
      })(),
  };
}
