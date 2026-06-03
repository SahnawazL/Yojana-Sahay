// ═══════════════════════════════════════════════════════════════════════════════
// schemesData.js  —  Single source of truth for Yojana Sahay
// Import this file in App.jsx instead of defining data inline.
//
// Exports:
//   INDIA_STATES   — array of all state/UT names
//   SCHEME_DB      — full scheme list with eligibility match() functions
//   CATEGORIES     — category tiles (home page) with filterKey for filtering
//   HOME_SCHEMES   — popular schemes shown on home page (references SCHEME_DB ids)
// ═══════════════════════════════════════════════════════════════════════════════


import { STATE_SCHEMES } from "./states/stateSchemes.js";

// ─── INDIA STATES ──────────────────────────────────────────────────────────────
export const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Puducherry","Chandigarh","Andaman & Nicobar",
];


// ─── SCHEME DATABASE ───────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any existing block below.
//   2. Give it a unique id (e.g. "my_new_scheme").
//   3. Set scope: "national"  →  available in all states.
//              scope: "state"   →  add  state: "State Name"  matching INDIA_STATES.
//   4. Write the match() function:  (answers) => boolean
//      answers has keys: who, income, state, house, age, area
//      who     : "farmer" | "student" | "women" | "senior" | "business" | "general"
//      income  : "below1" | "1to3" | "3to6" | "above6"
//      state   : any value from INDIA_STATES
//      house   : "yes" | "no" | "kutcha"
//      age     : "below18" | "18to35" | "35to60" | "above60"
//      area    : "rural" | "urban" | "semi"
//   5. Save. The app picks it up automatically — no other file needs editing.
// ──────────────────────────────────────────────────────────────────────────────

export const SCHEME_DB = [

  // ══════════════════════ NATIONAL SCHEMES ════════════════════════════════════

  {
    id: "pmkisan",
    icon: "🌾", color: "#138808", scope: "national",
    ministry: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    name:    { en: "PM Kisan Samman Nidhi",   hi: "पीएम किसान सम्मान निधि" },
    benefit: { en: "₹6,000/year · 3 installments of ₹2,000", hi: "₹6,000/वर्ष · ₹2,000 की 3 किस्तें" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 6000,
    apply:   { en: "pmkisan.gov.in", hi: "pmkisan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra)","Bank Passbook"],
               hi: ["आधार कार्ड","जमीन के कागज़","बैंक पासबुक"] },
    // Eligibility: farmer + income below ₹6 lakh
    match: (a) => a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmawas_rural",
    icon: "🏠", color: "#FF9933", scope: "national",
    ministry: { en: "Ministry of Housing", hi: "आवास मंत्रालय" },
    name:    { en: "PM Awas Yojana (Gramin)",          hi: "पीएम आवास योजना (ग्रामीण)" },
    benefit: { en: "₹1.20 Lakh for house construction", hi: "मकान निर्माण के लिए ₹1.20 लाख" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 120000,
    apply:   { en: "pmayg.nic.in", hi: "pmayg.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Certificate","Land Documents","Bank Account"],
               hi: ["आधार कार्ड","बीपीएल प्रमाण पत्र","जमीन के कागज़","बैंक खाता"] },
    // Eligibility: no/kutcha house + low income + rural
    match: (a) => ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "pmawas_urban",
    icon: "🏙️", color: "#FF8C00", scope: "national",
    ministry: { en: "Ministry of Housing", hi: "आवास मंत्रालय" },
    name:    { en: "PM Awas Yojana (Urban)",         hi: "पीएम आवास योजना (शहरी)" },
    benefit: { en: "₹2.50 Lakh subsidy on home loan", hi: "होम लोन पर ₹2.50 लाख सब्सिडी" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 250000,
    apply:   { en: "pmaymis.gov.in", hi: "pmaymis.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Income Proof","Bank Statement","No Property Certificate"],
               hi: ["आधार कार्ड","आय प्रमाण","बैंक स्टेटमेंट","संपत्ति न होने का प्रमाण"] },
    match: (a) => ["no","kutcha"].includes(a.house) && ["below1","1to3","3to6"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  {
    id: "ayushman",
    icon: "🏥", color: "#003580", scope: "national",
    ministry: { en: "Ministry of Health", hi: "स्वास्थ्य मंत्रालय" },
    name:    { en: "Ayushman Bharat (PMJAY)",            hi: "आयुष्मान भारत (पीएमजेएवाई)" },
    benefit: { en: "₹5 Lakh/year free hospital treatment", hi: "₹5 लाख/वर्ष मुफ्त अस्पताल इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "beneficiary.nha.gov.in", hi: "beneficiary.nha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Income Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण पत्र"] },
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "scholarship",
    icon: "📚", color: "#8B0000", scope: "national",
    ministry: { en: "Ministry of Education", hi: "शिक्षा मंत्रालय" },
    name:    { en: "National Scholarship (NSP)",          hi: "राष्ट्रीय छात्रवृत्ति (NSP)" },
    benefit: { en: "₹10,000 – ₹50,000/year for studies", hi: "₹10,000 – ₹50,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 25000,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Mark Sheets","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","मार्कशीट","आय प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "mudra",
    icon: "💼", color: "#6B21A8", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Mudra Yojana",                          hi: "पीएम मुद्रा योजना" },
    benefit: { en: "Loan ₹50,000 – ₹10 Lakh · No collateral", hi: "₹50,000 से ₹10 लाख · बिना गारंटी" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "mudra.org.in", hi: "mudra.org.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN","Business Plan","Bank Statement 6 months","Photo"],
               hi: ["आधार और पैन","व्यापार योजना","6 महीने बैंक स्टेटमेंट","फोटो"] },
    match: (a) => a.who === "business" || ["18to35","35to60"].includes(a.age),
  },

  {
    id: "ujjwala",
    icon: "🔥", color: "#EA580C", scope: "national",
    ministry: { en: "Ministry of Petroleum", hi: "पेट्रोलियम मंत्रालय" },
    name:    { en: "PM Ujjwala Yojana",                        hi: "पीएम उज्ज्वला योजना" },
    benefit: { en: "Free LPG connection + first refill free", hi: "मुफ्त एलपीजी + पहली रिफिल मुफ्त" },
    tag:     { en: "Women / BPL", hi: "महिला / बीपीएल" },
    annual: 1600,
    apply:   { en: "pmuy.gov.in", hi: "pmuy.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","BPL Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","बीपीएल प्रमाण"] },
    match: (a) => a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "betibachao",
    icon: "👩", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child", hi: "महिला एवं बाल विकास" },
    name:    { en: "Beti Bachao Beti Padhao",       hi: "बेटी बचाओ बेटी पढ़ाओ" },
    benefit: { en: "₹5,000 support + free education", hi: "₹5,000 सहायता + मुफ्त शिक्षा" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 5000,
    apply:   { en: "wcd.gov.in", hi: "wcd.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Bank Account"],
               hi: ["आधार कार्ड","जन्म प्रमाण","बैंक खाता"] },
    match: (a) => a.who === "women",
  },

  {
    id: "vriddhapension",
    icon: "👴", color: "#D97706", scope: "national",
    ministry: { en: "Ministry of Rural Development (NSAP)", hi: "ग्रामीण विकास मंत्रालय (NSAP)" },
    name:    { en: "Indira Gandhi National Old Age Pension (IGNOAPS)", hi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन" },
    benefit: { en: "₹200–₹500/month pension for BPL senior citizens (60+)", hi: "BPL वरिष्ठ नागरिकों (60+) को ₹200–₹500/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 3600,
    apply:   { en: "nsap.nic.in", hi: "nsap.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (60+)","BPL Certificate","Bank Account"],
               hi: ["आधार कार्ड","आयु प्रमाण (60+)","बीपीएल प्रमाण","बैंक खाता"] },
    match: (a) => (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "kisancredit",
    icon: "💳", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    name:    { en: "Kisan Credit Card (KCC)",             hi: "किसान क्रेडिट कार्ड (KCC)" },
    benefit: { en: "Crop loan at 4% interest (subsidised)", hi: "4% ब्याज पर फसल लोन" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "Nearest bank branch", hi: "नज़दीकी बैंक शाखा" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records","Bank Passbook","Photo"],
               hi: ["आधार कार्ड","जमीन के कागज़","पासबुक","फोटो"] },
    match: (a) => a.who === "farmer",
  },

  {
    id: "pmjdy",
    icon: "🏦", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Jan Dhan Yojana (PMJDY)",            hi: "पीएम जन धन योजना (PMJDY)" },
    benefit: { en: "Zero-balance account + RuPay card + ₹2L accident cover", hi: "जीरो बैलेंस खाता + RuPay कार्ड + ₹2 लाख दुर्घटना बीमा" },
    tag:     { en: "Banking", hi: "बैंकिंग" },
    annual: 0,
    apply:   { en: "pmjdy.gov.in", hi: "pmjdy.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (or Voter ID / Passport)", "Passport Photo"],
               hi: ["आधार कार्ड (या मतदाता पहचान पत्र / पासपोर्ट)", "पासपोर्ट फोटो"] },
    // Eligibility: any unbanked Indian, targeted at low-income households
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmjjby",
    icon: "🛡️", color: "#DC2626", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Jeevan Jyoti Bima Yojana (PMJJBY)", hi: "पीएम जीवन ज्योति बीमा योजना" },
    benefit: { en: "₹2 lakh life insurance · Only ₹330/year premium", hi: "₹2 लाख जीवन बीमा · केवल ₹330/वर्ष प्रीमियम" },
    tag:     { en: "Insurance", hi: "बीमा" },
    annual: 0,
    apply:   { en: "jansuraksha.gov.in", hi: "jansuraksha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account", "Mobile Number"],
               hi: ["आधार कार्ड", "बचत बैंक खाता", "मोबाइल नंबर"] },
    // Eligibility: age 18–50, any savings bank account holder
    match: (a) => ["18to35","35to60"].includes(a.age),
  },

  {
    id: "pmsby",
    icon: "🦺", color: "#EA580C", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Suraksha Bima Yojana (PMSBY)", hi: "पीएम सुरक्षा बीमा योजना" },
    benefit: { en: "₹2 lakh accident insurance · Only ₹20/year premium", hi: "₹2 लाख दुर्घटना बीमा · केवल ₹20/वर्ष प्रीमियम" },
    tag:     { en: "Insurance", hi: "बीमा" },
    annual: 0,
    apply:   { en: "jansuraksha.gov.in", hi: "jansuraksha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account"],
               hi: ["आधार कार्ड", "बचत बैंक खाता"] },
    // Eligibility: age 18–70, savings bank account holder
    match: (a) => ["18to35","35to60","above60"].includes(a.age),
  },

  {
    id: "apy",
    icon: "🏛️", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Finance (PFRDA)", hi: "वित्त मंत्रालय (PFRDA)" },
    name:    { en: "Atal Pension Yojana (APY)",                         hi: "अटल पेंशन योजना (APY)" },
    benefit: { en: "Guaranteed ₹1,000–₹5,000/month pension after age 60", hi: "60 वर्ष बाद ₹1,000–₹5,000/माह गारंटीड पेंशन" },
    tag:     { en: "Pension", hi: "पेंशन" },
    annual: 0,
    apply:   { en: "jansuraksha.gov.in", hi: "jansuraksha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Bank Account (Aadhaar-linked)", "Mobile Number"],
               hi: ["आधार कार्ड", "बैंक खाता (आधार से लिंक)", "मोबाइल नंबर"] },
    // Eligibility: age 18–40, unorganised sector, not an income-tax payer
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmvishwakarma",
    icon: "🔨", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of MSME", hi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय" },
    name:    { en: "PM Vishwakarma Yojana",                                hi: "पीएम विश्वकर्मा योजना" },
    benefit: { en: "₹15,000 toolkit grant + loan up to ₹3L at 5% · Free skill training", hi: "₹15,000 टूलकिट अनुदान + 5% पर ₹3 लाख तक लोन · मुफ्त कौशल प्रशिक्षण" },
    tag:     { en: "Artisan / Craftsman", hi: "कारीगर / शिल्पकार" },
    annual: 15000,
    apply:   { en: "pmvishwakarma.gov.in", hi: "pmvishwakarma.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Bank Account", "Proof of Trade / Occupation"],
               hi: ["आधार कार्ड", "राशन कार्ड", "बैंक खाता", "व्यापार / व्यवसाय का प्रमाण"] },
    // Eligibility: traditional artisan/craftsman, age 18+, self-employed
    match: (a) => a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "pmsvanidhi",
    icon: "🛒", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Housing & Urban Affairs", hi: "आवासन और शहरी कार्य मंत्रालय" },
    name:    { en: "PM SVANidhi (Street Vendor Loan)",             hi: "पीएम स्वनिधि (स्ट्रीट वेंडर लोन)" },
    benefit: { en: "Loan ₹10,000–₹50,000 · 7% interest subsidy · No collateral", hi: "₹10,000–₹50,000 लोन · 7% ब्याज सब्सिडी · बिना गारंटी" },
    tag:     { en: "Street Vendor", hi: "रेहड़ी-पटरी" },
    annual: 0,
    apply:   { en: "pmsvanidhi.mohua.gov.in", hi: "pmsvanidhi.mohua.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Bank Account", "Vending Certificate / Letter of Recommendation from ULB"],
               hi: ["आधार कार्ड", "बैंक खाता", "वेंडिंग प्रमाण पत्र / नगर निकाय से अनुशंसा पत्र"] },
    // Eligibility: street vendor / small trader (business), any area
    match: (a) => a.who === "business",
  },

  {
    id: "sukanya",
    icon: "🌸", color: "#DB2777", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "Sukanya Samriddhi Yojana (SSY)",                        hi: "सुकन्या समृद्धि योजना (SSY)" },
    benefit: { en: "8.2% interest p.a. · Tax-free savings for girl's education & marriage", hi: "8.2% वार्षिक ब्याज · बेटी की पढ़ाई व शादी के लिए कर-मुक्त बचत" },
    tag:     { en: "Girl Child / Savings", hi: "बालिका / बचत" },
    annual: 0,
    apply:   { en: "nsiindia.gov.in", hi: "nsiindia.gov.in" }, applyType: "online",
    docs:    { en: ["Girl's Birth Certificate", "Parent / Guardian Aadhaar & PAN", "Passport Size Photos"],
               hi: ["बच्ची का जन्म प्रमाण पत्र", "माता-पिता का आधार व पैन कार्ड", "पासपोर्ट साइज़ फोटो"] },
    // Eligibility: parents/guardians of girl child below age 10 years
    match: (a) => a.who === "women",
  },

  {
    id: "pmmvy",
    icon: "🤱", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "PM Matru Vandana Yojana (PMMVY)",                        hi: "पीएम मातृ वंदना योजना (PMMVY)" },
    benefit: { en: "₹5,000 for 1st child · ₹6,000 for 2nd girl child · Direct to bank", hi: "पहले बच्चे पर ₹5,000 · दूसरी बेटी पर ₹6,000 · बैंक में सीधे" },
    tag:     { en: "Maternity", hi: "मातृत्व" },
    annual: 5000,
    apply:   { en: "pmmvy.wcd.gov.in", hi: "pmmvy.wcd.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Bank Account", "MCP Card (Mother & Child Protection)", "Marriage Certificate"],
               hi: ["आधार कार्ड", "बैंक खाता", "MCP कार्ड (माँ और बच्चा सुरक्षा)", "विवाह प्रमाण पत्र"] },
    // Eligibility: pregnant/lactating women for first live birth (or 2nd if girl child)
    match: (a) => a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmfby",
    icon: "🌧️", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    name:    { en: "PM Fasal Bima Yojana (PMFBY)",                   hi: "पीएम फसल बीमा योजना (PMFBY)" },
    benefit: { en: "Full crop loss insurance at just 1.5–2% premium", hi: "केवल 1.5–2% प्रीमियम पर पूरी फसल बीमा" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "pmfby.gov.in", hi: "pmfby.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra)","Bank Passbook","Sowing Certificate"],
               hi: ["आधार कार्ड","खसरा/जमीन के कागज़","बैंक पासबुक","बुवाई प्रमाण पत्र"] },
    match: (a) => a.who === "farmer",
  },

  {
    id: "mgnrega",
    icon: "⛏️", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "MGNREGA (Job Guarantee Scheme)",                  hi: "मनरेगा (रोजगार गारंटी योजना)" },
    benefit: { en: "100 days guaranteed wage employment/year · ₹220–₹357/day", hi: "100 दिन का गारंटीड रोजगार · ₹220–₹357/दिन" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 22000,
    apply:   { en: "nrega.nic.in", hi: "nrega.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Job Card (from Gram Panchayat)","Bank / Post Office Account"],
               hi: ["आधार कार्ड","जॉब कार्ड (ग्राम पंचायत से)","बैंक / डाकघर खाता"] },
    match: (a) => a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmkvy",
    icon: "🎓", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Skill Development", hi: "कौशल विकास मंत्रालय" },
    name:    { en: "PM Kaushal Vikas Yojana (PMKVY)",                hi: "पीएम कौशल विकास योजना (PMKVY)" },
    benefit: { en: "Free skill training + ₹8,000 reward + placement help", hi: "मुफ्त कौशल प्रशिक्षण + ₹8,000 पुरस्कार + नौकरी सहायता" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 8000,
    apply:   { en: "skillindiadigital.gov.in", hi: "skillindiadigital.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Educational Certificates","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","शैक्षणिक प्रमाण पत्र","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmegp",
    icon: "🏭", color: "#6B21A8", scope: "national",
    ministry: { en: "Ministry of MSME", hi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय" },
    name:    { en: "PM Employment Generation Programme (PMEGP)",      hi: "पीएम रोजगार सृजन कार्यक्रम (PMEGP)" },
    benefit: { en: "15–35% subsidy on loan up to ₹50 Lakh to start business", hi: "व्यापार शुरू करने पर ₹50 लाख तक 15–35% सब्सिडी" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "kviconline.gov.in/pmegpeportal", hi: "kviconline.gov.in/pmegpeportal" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Project Report","Educational Certificate","Caste Certificate (if SC/ST/OBC)"],
               hi: ["आधार कार्ड","प्रोजेक्ट रिपोर्ट","शैक्षणिक प्रमाण","जाति प्रमाण पत्र (SC/ST/OBC के लिए)"] },
    match: (a) => a.who === "business" || (["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income)),
  },

  {
    id: "standup_india",
    icon: "🤝", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Finance (SIDBI)", hi: "वित्त मंत्रालय (SIDBI)" },
    name:    { en: "Stand-Up India Scheme",                           hi: "स्टैंड-अप इंडिया योजना" },
    benefit: { en: "Bank loan ₹10 Lakh–₹1 Crore for SC/ST & Women entrepreneurs", hi: "SC/ST और महिला उद्यमियों को ₹10 लाख–₹1 करोड़ लोन" },
    tag:     { en: "Business / Women", hi: "व्यापार / महिला" },
    annual: 0,
    apply:   { en: "standupmitra.in", hi: "standupmitra.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN Card","Caste/Gender Proof","Business Plan","Bank Statement"],
               hi: ["आधार और पैन कार्ड","जाति/लिंग प्रमाण","व्यापार योजना","बैंक स्टेटमेंट"] },
    match: (a) => a.who === "business" || a.who === "women",
  },

  {
    id: "nfsa_pds",
    icon: "🌾", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Consumer Affairs & Food", hi: "उपभोक्ता मामले और खाद्य मंत्रालय" },
    name:    { en: "National Food Security Act (Ration Card / PDS)",  hi: "राष्ट्रीय खाद्य सुरक्षा अधिनियम (राशन कार्ड)" },
    benefit: { en: "5 kg grain/person/month at ₹1–₹3 · Free under PMGKAY", hi: "5 किलो अनाज/व्यक्ति/माह ₹1–₹3 में · PMGKAY के तहत मुफ्त" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 3600,
    apply:   { en: "nfsa.gov.in", hi: "nfsa.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Existing Ration Card","Income Certificate","Address Proof"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण पत्र","पता प्रमाण"] },
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "sbm_gramin",
    icon: "🚽", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Jal Shakti", hi: "जल शक्ति मंत्रालय" },
    name:    { en: "Swachh Bharat Mission – Gramin (Toilet Scheme)",  hi: "स्वच्छ भारत मिशन – ग्रामीण (शौचालय योजना)" },
    benefit: { en: "₹12,000 grant to build toilet at home",           hi: "घर में शौचालय निर्माण के लिए ₹12,000 अनुदान" },
    tag:     { en: "Sanitation", hi: "स्वच्छता" },
    annual: 12000,
    apply:   { en: "sbm.gov.in", hi: "sbm.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","No-Toilet Proof","Bank Account"],
               hi: ["आधार कार्ड","राशन कार्ड","शौचालय न होने का प्रमाण","बैंक खाता"] },
    match: (a) => a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "daynrlm",
    icon: "👩‍👩‍👧", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "DAY-NRLM (Self Help Group – Women)",              hi: "डीएवाई-एनआरएलएम (महिला स्वयं सहायता समूह)" },
    benefit: { en: "₹10,000–₹15 Lakh loan for SHG + interest subsidy + training", hi: "SHG को ₹10,000–₹15 लाख लोन + ब्याज सब्सिडी + प्रशिक्षण" },
    tag:     { en: "Women / SHG", hi: "महिला / SHG" },
    annual: 0,
    apply:   { en: "aajeevika.gov.in", hi: "aajeevika.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SHG Registration Document","Bank Account (Group)","Address Proof"],
               hi: ["आधार कार्ड","SHG पंजीकरण दस्तावेज़","बैंक खाता (समूह)","पता प्रमाण"] },
    match: (a) => a.who === "women" && a.area === "rural",
  },

  {
    id: "pmpsmy",
    icon: "🩺", color: "#0891B2", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "PM Surakshit Matritva Abhiyan (PMSMA)",           hi: "पीएम सुरक्षित मातृत्व अभियान (PMSMA)" },
    benefit: { en: "Free antenatal checkup on 9th of every month at govt. facilities", hi: "हर माह की 9 तारीख को मुफ्त प्रसव पूर्व जांच" },
    tag:     { en: "Maternity / Health", hi: "मातृत्व / स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "pmsma.mohfw.gov.in", hi: "pmsma.mohfw.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","MCP Card","Pregnancy Proof"],
               hi: ["आधार कार्ड","MCP कार्ड","गर्भावस्था प्रमाण"] },
    match: (a) => a.who === "women",
  },

  {
    id: "pmjay_senior",
    icon: "🏥", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "Ayushman Bharat – Senior Citizens (70+)",         hi: "आयुष्मान भारत – वरिष्ठ नागरिक (70+)" },
    benefit: { en: "₹5 Lakh/year free health cover for all citizens 70 years & above", hi: "70+ वर्ष के सभी नागरिकों को ₹5 लाख/वर्ष मुफ्त स्वास्थ्य कवर" },
    tag:     { en: "Senior / Health", hi: "वरिष्ठ / स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "beneficiary.nha.gov.in", hi: "beneficiary.nha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (70+ years)","Any ID Proof"],
               hi: ["आधार कार्ड","आयु प्रमाण (70+ वर्ष)","कोई भी पहचान पत्र"] },
    match: (a) => a.who === "senior" || a.age === "above60",
  },

  {
    id: "pmgsy",
    icon: "🛣️", color: "#78350F", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "PM Gram Sadak Yojana (PMGSY)",                    hi: "पीएम ग्राम सड़क योजना (PMGSY)" },
    benefit: { en: "All-weather road connectivity to unconnected villages · Free", hi: "असंपर्कित गांवों को हर मौसम में सड़क संपर्क · मुफ्त" },
    tag:     { en: "Rural Infrastructure", hi: "ग्रामीण बुनियादी ढांचा" },
    annual: 0,
    apply:   { en: "pmgsy.nic.in", hi: "pmgsy.nic.in" }, applyType: "online",
    docs:    { en: ["Village Connectivity Application (via Panchayat)","Population Proof"],
               hi: ["ग्राम संपर्क आवेदन (पंचायत के माध्यम से)","जनसंख्या प्रमाण"] },
    match: (a) => a.area === "rural",
  },

  {
    id: "jjm",
    icon: "💧", color: "#0891B2", scope: "national",
    ministry: { en: "Ministry of Jal Shakti", hi: "जल शक्ति मंत्रालय" },
    name:    { en: "Jal Jeevan Mission (Har Ghar Jal)",               hi: "जल जीवन मिशन (हर घर जल)" },
    benefit: { en: "Free piped drinking water connection to every rural household", hi: "हर ग्रामीण घर को मुफ्त नल जल कनेक्शन" },
    tag:     { en: "Water / Rural", hi: "जल / ग्रामीण" },
    annual: 0,
    apply:   { en: "jaljeevanmission.gov.in", hi: "jaljeevanmission.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Address Proof","Ration Card"],
               hi: ["आधार कार्ड","पता प्रमाण","राशन कार्ड"] },
    match: (a) => a.area === "rural" && ["no","kutcha"].includes(a.house),
  },

  {
    id: "ddu_gky",
    icon: "🏗️", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "DDU-Grameen Kaushalya Yojana (DDU-GKY)",          hi: "दीन दयाल उपाध्याय ग्रामीण कौशल्या योजना" },
    benefit: { en: "Free placement-linked skill training + ₹1,000–₹1,500/month stipend during training", hi: "मुफ्त कौशल प्रशिक्षण + प्रशिक्षण के दौरान ₹1,000–₹1,500/माह वजीफा" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 18000,
    apply:   { en: "kaushal.rural.gov.in", hi: "kaushal.rural.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (15–35 years)","Educational Certificate","Bank Account","BPL/Ration Card"],
               hi: ["आधार कार्ड","आयु प्रमाण (15–35 वर्ष)","शैक्षणिक प्रमाण","बैंक खाता","BPL/राशन कार्ड"] },
    match: (a) => a.area === "rural" && ["18to35"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmay_urban2",
    icon: "🏢", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Housing & Urban Affairs", hi: "आवासन और शहरी कार्य मंत्रालय" },
    name:    { en: "PM Awas Yojana 2.0 (Urban)",                      hi: "पीएम आवास योजना 2.0 (शहरी)" },
    benefit: { en: "₹2.5 Lakh central subsidy for EWS/LIG house construction or purchase", hi: "EWS/LIG को मकान निर्माण/खरीद पर ₹2.5 लाख केंद्रीय सब्सिडी" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 250000,
    apply:   { en: "pmaymis.gov.in", hi: "pmaymis.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Income Proof (EWS/LIG)","No Property Certificate","Bank Statement","Marriage Certificate"],
               hi: ["आधार कार्ड","आय प्रमाण (EWS/LIG)","संपत्ति न होने का प्रमाण","बैंक स्टेटमेंट","विवाह प्रमाण"] },
    match: (a) => ["no","kutcha"].includes(a.house) && ["below1","1to3","3to6"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  {
    id: "pm_poshan",
    icon: "🍱", color: "#16A34A", scope: "national",
    ministry: { en: "Ministry of Education", hi: "शिक्षा मंत्रालय" },
    name:    { en: "PM POSHAN (Mid-Day Meal Scheme)",                  hi: "पीएम पोषण (मध्याह्न भोजन योजना)" },
    benefit: { en: "Free nutritious mid-day meal daily to children in Govt. schools (Class 1–8)", hi: "सरकारी स्कूलों में कक्षा 1–8 के बच्चों को मुफ्त पौष्टिक भोजन" },
    tag:     { en: "Student / Child", hi: "छात्र / बच्चे" },
    annual: 3600,
    apply:   { en: "pmposhan.education.gov.in", hi: "pmposhan.education.gov.in" }, applyType: "online",
    docs:    { en: ["School Enrollment Certificate","Aadhaar Card (child)"],
               hi: ["स्कूल नामांकन प्रमाण पत्र","आधार कार्ड (बच्चे का)"] },
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "ignwps",
    icon: "👩‍🦳", color: "#9D174D", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "Indira Gandhi National Widow Pension (IGNWPS)",   hi: "इंदिरा गांधी राष्ट्रीय विधवा पेंशन" },
    benefit: { en: "₹300/month pension for BPL widows aged 40–79 years", hi: "40–79 वर्ष की BPL विधवाओं को ₹300/माह पेंशन" },
    tag:     { en: "Women / Widow", hi: "महिला / विधवा" },
    annual: 3600,
    apply:   { en: "nsap.nic.in", hi: "nsap.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Certificate","Husband's Death Certificate","Age Proof","Bank Account"],
               hi: ["आधार कार्ड","BPL प्रमाण पत्र","पति का मृत्यु प्रमाण पत्र","आयु प्रमाण","बैंक खाता"] },
    match: (a) => a.who === "women" && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "soil_health_card",
    icon: "🧪", color: "#65A30D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "Soil Health Card Scheme",                          hi: "मृदा स्वास्थ्य कार्ड योजना" },
    benefit: { en: "Free soil testing + personalised crop & fertiliser recommendations", hi: "मुफ्त मिट्टी जांच + फसल और खाद की व्यक्तिगत सिफारिश" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "soilhealth.dac.gov.in", hi: "soilhealth.dac.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records","Soil Sample (collected by govt. officer)"],
               hi: ["आधार कार्ड","जमीन के कागज़","मिट्टी का नमूना (सरकारी अधिकारी द्वारा संग्रहित)"] },
    match: (a) => a.who === "farmer",
  },

  {
    id: "e_shram",
    icon: "🪪", color: "#374151", scope: "national",
    ministry: { en: "Ministry of Labour & Employment", hi: "श्रम एवं रोजगार मंत्रालय" },
    name:    { en: "e-SHRAM Card (Unorganised Workers Portal)",        hi: "ई-श्रम कार्ड (असंगठित श्रमिक पोर्टल)" },
    benefit: { en: "₹2 Lakh accident insurance + access to all labour welfare schemes", hi: "₹2 लाख दुर्घटना बीमा + सभी श्रम कल्याण योजनाओं तक पहुंच" },
    tag:     { en: "Labour / General", hi: "श्रमिक / सामान्य" },
    annual: 0,
    apply:   { en: "eshram.gov.in", hi: "eshram.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (Aadhaar-linked mobile)","Bank Account"],
               hi: ["आधार कार्ड (आधार से लिंक मोबाइल)","बैंक खाता"] },
    match: (a) => ["below1","1to3"].includes(a.income) && a.who !== "student",
  },

  {
    id: "pmkmy",
    icon: "⚙️", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Labour & Employment", hi: "श्रम एवं रोजगार मंत्रालय" },
    name:    { en: "PM Shram Yogi Maan-dhan (PM-SYM)",                hi: "पीएम श्रम योगी मान-धन (PM-SYM)" },
    benefit: { en: "₹3,000/month pension after age 60 for unorganised workers", hi: "असंगठित श्रमिकों को 60 वर्ष बाद ₹3,000/माह पेंशन" },
    tag:     { en: "Labour / Pension", hi: "श्रमिक / पेंशन" },
    annual: 36000,
    apply:   { en: "maandhan.in", hi: "maandhan.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Bank Account (Aadhaar-linked)","Mobile Number","Self-declaration of unorganised worker"],
               hi: ["आधार कार्ड","बैंक खाता (आधार लिंक)","मोबाइल नंबर","असंगठित श्रमिक स्व-घोषणा"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income) && a.who === "general",
  },

  {
    id: "nmmss",
    icon: "🎯", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Education", hi: "शिक्षा मंत्रालय" },
    name:    { en: "National Means-cum-Merit Scholarship (NMMSS)", hi: "राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति (NMMSS)" },
    benefit: { en: "₹12,000/year (₹1,000/month) for Class 9 to 12 students", hi: "कक्षा 9 से 12 के छात्रों को ₹12,000/वर्ष (₹1,000/माह)" },
    tag:     { en: "Student / Merit", hi: "छात्र / मेधा" },
    annual: 12000,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 7/8 Mark Sheet (min. 55%)","Income Certificate (≤₹3.5L/year)","Caste Certificate (if SC/ST)","Passport Size Photos","Address Proof"],
               hi: ["आधार कार्ड","कक्षा 7/8 की मार्कशीट (न्यूनतम 55%)","आय प्रमाण पत्र (≤₹3.5 लाख/वर्ष)","जाति प्रमाण पत्र (SC/ST के लिए)","पासपोर्ट साइज़ फोटो","पता प्रमाण"] },
    // Eligibility: student in govt/govt-aided school, family income ≤ ₹3.5L, min 55% in Class 7/8
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_yasasvi",
    icon: "🏅", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय और अधिकारिता मंत्रालय" },
    name:    { en: "PM YASASVI Scholarship (OBC/EBC/DNT)",           hi: "पीएम यशस्वी छात्रवृत्ति (OBC/EBC/DNT)" },
    benefit: { en: "₹75,000/year (Class 9) · ₹1,25,000/year (Class 11) via DBT", hi: "कक्षा 9: ₹75,000/वर्ष · कक्षा 11: ₹1,25,000/वर्ष · DBT से सीधे बैंक में" },
    tag:     { en: "Student / OBC", hi: "छात्र / OBC" },
    annual: 75000,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","OBC/EBC/DNT Caste Certificate","Income Certificate (≤₹2.5L/year)","Previous Year Mark Sheet","School Enrollment Certificate","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","OBC/EBC/DNT जाति प्रमाण पत्र","आय प्रमाण पत्र (≤₹2.5 लाख/वर्ष)","पिछले वर्ष की मार्कशीट","स्कूल नामांकन प्रमाण","बैंक खाता (आधार लिंक)"] },
    // Eligibility: OBC/EBC/DNT student in Class 9 or 11, family income ≤ ₹2.5L, merit-based selection
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ADD MORE NATIONAL SCHEMES HERE ↓
  // { id: "new_national_scheme", icon: "🆕", color: "#123456", scope: "national", ... }

  // ══════════════════════ STATE SCHEMES ════════════════════════════════════════
  // All state schemes live in stateSchemes.js — edit that file to add/change them.
  ...STATE_SCHEMES,

];

export const CATEGORIES = {
  en: [
    { icon: "🌾", label: "Farmer",    color: "#138808", bg: "#f0fdf4", filterKey: "farmer"    },
    { icon: "📚", label: "Student",   color: "#003580", bg: "#eff6ff", filterKey: "student"   },
    { icon: "👩", label: "Women",     color: "#BE185D", bg: "#fdf2f8", filterKey: "women"     },
    { icon: "👴", label: "Senior",    color: "#FF9933", bg: "#fff7ed", filterKey: "senior"    },
    { icon: "💼", label: "Business",  color: "#6B21A8", bg: "#faf5ff", filterKey: "business"  },
    { icon: "🏠", label: "Housing",   color: "#0F766E", bg: "#f0fdfa", filterKey: "housing"   },
    { icon: "🏥", label: "Health",    color: "#0369A1", bg: "#f0f9ff", filterKey: "health"    },
    { icon: "🛡️", label: "Insurance", color: "#DC2626", bg: "#fff1f2", filterKey: "insurance" },
    { icon: "🏛️", label: "Pension",   color: "#7C3AED", bg: "#f5f3ff", filterKey: "pension"   },
    { icon: "🆓", label: "Free Benefits", color: "#15803D", bg: "#f0fdf4", filterKey: "free"  },
  ],
  hi: [
    { icon: "🌾", label: "किसान",        color: "#138808", bg: "#f0fdf4", filterKey: "farmer"    },
    { icon: "📚", label: "छात्र",         color: "#003580", bg: "#eff6ff", filterKey: "student"   },
    { icon: "👩", label: "महिला",        color: "#BE185D", bg: "#fdf2f8", filterKey: "women"     },
    { icon: "👴", label: "वरिष्ठ",       color: "#FF9933", bg: "#fff7ed", filterKey: "senior"    },
    { icon: "💼", label: "व्यापार",      color: "#6B21A8", bg: "#faf5ff", filterKey: "business"  },
    { icon: "🏠", label: "आवास",         color: "#0F766E", bg: "#f0fdfa", filterKey: "housing"   },
    { icon: "🏥", label: "स्वास्थ्य",    color: "#0369A1", bg: "#f0f9ff", filterKey: "health"    },
    { icon: "🛡️", label: "बीमा",         color: "#DC2626", bg: "#fff1f2", filterKey: "insurance" },
    { icon: "🏛️", label: "पेंशन",        color: "#7C3AED", bg: "#f5f3ff", filterKey: "pension"   },
    { icon: "🆓", label: "मुफ़्त लाभ",   color: "#15803D", bg: "#f0fdf4", filterKey: "free"      },
  ],
};

// Helper: get schemes matching a category filterKey
// Usage: getSchemesForCategory("farmer")
export function getSchemesForCategory(filterKey) {
  // Housing: both national and state schemes matched by tag
  if (filterKey === "housing") {
    return SCHEME_DB.filter(s =>
      s.tag.en.toLowerCase().includes("housing") ||
      s.tag.en.toLowerCase().includes("awas")
    );
  }

  // ── New cross-cutting filters ────────────────────────────────────────────────
  if (filterKey === "health") {
    const kws = ["health", "medical", "hospital", "ayushman", "swasthya", "treatment"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "insurance") {
    const kws = ["insurance", "bima", "suraksha", "jeevan", "jivan"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "pension") {
    const kws = ["pension", "maan-dhan", "maandhan", "retirement", "old age", "vridha"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "free") {
    // Schemes that give direct cash transfers or free services (annual benefit > 0)
    return SCHEME_DB.filter(s => (s.annual || 0) > 0);
  }
  // ────────────────────────────────────────────────────────────────────────────

  // Tag keywords used to match state schemes, which can't use s.match()
  // (state schemes require a.state === "X", so match() always returns false with state:"")
  const STATE_TAG_KEYWORDS = {
    farmer:   ["farmer", "kisan", "rythu", "shetkari", "kalia", "krishi"],
    student:  ["student", "education", "scholarship", "merit"],
    women:    ["women", "girl", "widow", "maternity", "shg", "naari", "marriage"],
    senior:   ["senior", "pension", "old age"],
    business: ["business", "artisan", "vendor", "entrepreneur"],
  };
  const stateKeywords = STATE_TAG_KEYWORDS[filterKey] || [];

  if (filterKey === "senior") {
    return SCHEME_DB.filter(s => {
      if (s.scope === "national") {
        return s.match({ who: "senior", income: "below1", age: "above60", area: "rural", house: "yes", state: "" });
      }
      const tagLower = s.tag.en.toLowerCase();
      return stateKeywords.some(kw => tagLower.includes(kw));
    });
  }

  return SCHEME_DB.filter(s => {
    if (s.scope === "national") {
      return s.match({ who: filterKey, income: "below1", age: "18to35", area: "rural", house: "yes", state: "" });
    }
    // State schemes: match by tag keyword instead of s.match()
    const tagLower = s.tag.en.toLowerCase();
    return stateKeywords.some(kw => tagLower.includes(kw));
  });
}


// ─── HOME SCHEMES (popular schemes shown on home page) ────────────────────────
// These reference ids from SCHEME_DB so there is ONE source of truth.
// The app looks up full details from SCHEME_DB by id.
// ──────────────────────────────────────────────────────────────────────────────
export const HOME_SCHEME_IDS = [
  "pmkisan",
  "ayushman",
  "pmawas_rural",
  "scholarship",
  "mudra",
  "ujjwala",
];

// Helper: get home scheme display objects from SCHEME_DB
// Returns array of { id, icon, name, benefit, tag, color, scope }
export function getHomeSchemes(lang = "en") {
  return HOME_SCHEME_IDS.map(id => {
    const s = SCHEME_DB.find(x => x.id === id);
    if (!s) return null;
    return {
      id:      s.id,
      icon:    s.icon,
      color:   s.color,
      scope:   s.scope,
      name:    s.name[lang],
      benefit: s.benefit[lang],
      tag:     s.tag[lang],
    };
  }).filter(Boolean);
}
