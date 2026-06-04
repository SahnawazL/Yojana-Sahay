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

  {
    id: "pm_kusum",
    icon: "☀️", color: "#D97706", scope: "national",
    ministry: { en: "Ministry of New & Renewable Energy", hi: "नवीन एवं नवीकरणीय ऊर्जा मंत्रालय" },
    name:    { en: "PM KUSUM (Solar Pump Scheme)",                     hi: "पीएम कुसुम (सौर पंप योजना)" },
    benefit: { en: "90% subsidy on solar pump (up to 7.5 HP) for irrigation", hi: "सिंचाई के लिए सोलर पंप (7.5 HP तक) पर 90% सब्सिडी" },
    tag:     { en: "Farmer / Solar", hi: "किसान / सौर" },
    annual: 0,
    apply:   { en: "pmkusum.mnre.gov.in", hi: "pmkusum.mnre.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra)","Bank Account","Electricity Bill (if any)","Passport Photo"],
               hi: ["आधार कार्ड","जमीन के कागज़ (खसरा)","बैंक खाता","बिजली बिल (यदि हो)","पासपोर्ट फोटो"] },
    // Eligibility: farmer with own agricultural land
    match: (a) => a.who === "farmer",
  },

  {
    id: "surya_ghar",
    icon: "🌞", color: "#F59E0B", scope: "national",
    ministry: { en: "Ministry of New & Renewable Energy", hi: "नवीन एवं नवीकरणीय ऊर्जा मंत्रालय" },
    name:    { en: "PM Surya Ghar Muft Bijli Yojana",                  hi: "पीएम सूर्य घर मुफ्त बिजली योजना" },
    benefit: { en: "300 units free electricity/month via rooftop solar + subsidy up to ₹78,000", hi: "रूफटॉप सोलर से 300 यूनिट मुफ्त बिजली/माह + ₹78,000 तक सब्सिडी" },
    tag:     { en: "Solar / Electricity", hi: "सौर / बिजली" },
    annual: 36000,
    apply:   { en: "pmsuryaghar.gov.in", hi: "pmsuryaghar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Electricity Consumer Number","Bank Account","Passport Photo","Roof Ownership Proof"],
               hi: ["आधार कार्ड","बिजली उपभोक्ता नंबर","बैंक खाता","पासपोर्ट फोटो","छत का स्वामित्व प्रमाण"] },
    // Eligibility: residential consumer with own roof and electricity connection
    match: (a) => a.house === "yes" || ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "nikshay_poshan",
    icon: "🩺", color: "#059669", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "Nikshay Poshan Yojana (TB Nutritional Support)",   hi: "निक्षय पोषण योजना (टीबी पोषण सहायता)" },
    benefit: { en: "₹500/month nutritional support directly to bank account during TB treatment", hi: "टीबी उपचार के दौरान ₹500/माह सीधे बैंक में पोषण सहायता" },
    tag:     { en: "Health / TB", hi: "स्वास्थ्य / टीबी" },
    annual: 6000,
    apply:   { en: "nikshay.in", hi: "nikshay.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","TB Notification / NIKSHAY ID (from doctor)","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","डॉक्टर से टीबी अधिसूचना / NIKSHAY ID","बैंक खाता (आधार लिंक)"] },
    // Eligibility: any TB patient registered under NIKSHAY portal (all incomes)
    match: (a) => true,
  },

  {
    id: "pm_svamitva",
    icon: "📜", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Panchayati Raj", hi: "पंचायती राज मंत्रालय" },
    name:    { en: "PM SVAMITVA Yojana (Property Card)",               hi: "पीएम स्वामित्व योजना (संपत्ति कार्ड)" },
    benefit: { en: "Free legal property card for rural households · Enables using property as loan collateral", hi: "ग्रामीण घरों को मुफ्त कानूनी संपत्ति कार्ड · संपत्ति पर बैंक लोन लेने योग्य" },
    tag:     { en: "Rural / Property", hi: "ग्रामीण / संपत्ति" },
    annual: 0,
    apply:   { en: "svamitva.nic.in", hi: "svamitva.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Existing Land / House Records","Village Abadi Land Proof","Bank Account"],
               hi: ["आधार कार्ड","मौजूदा भूमि/घर के कागज़","ग्राम आबादी भूमि प्रमाण","बैंक खाता"] },
    // Eligibility: any rural household resident
    match: (a) => a.area === "rural",
  },

  {
    id: "igndps",
    icon: "♿", color: "#6366F1", scope: "national",
    ministry: { en: "Ministry of Rural Development (NSAP)", hi: "ग्रामीण विकास मंत्रालय (NSAP)" },
    name:    { en: "Indira Gandhi National Disability Pension (IGNDPS)", hi: "इंदिरा गांधी राष्ट्रीय विकलांगता पेंशन" },
    benefit: { en: "₹300/month pension for BPL persons with 80%+ disability (age 18–79 years)", hi: "80%+ विकलांगता वाले BPL व्यक्तियों (18–79 वर्ष) को ₹300/माह पेंशन" },
    tag:     { en: "Disability / Pension", hi: "विकलांगता / पेंशन" },
    annual: 3600,
    apply:   { en: "nsap.nic.in", hi: "nsap.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Disability Certificate (80%+)","BPL Certificate","Age Proof","Bank Account"],
               hi: ["आधार कार्ड","विकलांगता प्रमाण पत्र (80%+)","BPL प्रमाण","आयु प्रमाण","बैंक खाता"] },
    // Eligibility: BPL, 80%+ disability, age 18-79
    match: (a) => ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "one_stop_centre",
    icon: "🆘", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "One Stop Centre – Sakhi (Women in Distress)",      hi: "वन स्टॉप सेंटर – सखी (संकट में महिलाएं)" },
    benefit: { en: "Free legal aid, medical help, shelter & psychological support for women in distress · Call 181", hi: "संकट में महिलाओं को मुफ्त कानूनी सहायता, चिकित्सा, आश्रय व मनोवैज्ञानिक समर्थन · 181 पर कॉल करें" },
    tag:     { en: "Women / Legal Aid", hi: "महिला / कानूनी सहायता" },
    annual: 0,
    apply:   { en: "181 Helpline (call or walk-in)", hi: "181 हेल्पलाइन (कॉल या सीधे जाएं)" }, applyType: "offline",
    docs:    { en: ["No documents required in emergency","Aadhaar Card (preferred)"],
               hi: ["आपातकाल में कोई दस्तावेज़ नहीं","आधार कार्ड (बेहतर)"] },
    // Eligibility: any woman in distress, no income/age restriction
    match: (a) => a.who === "women",
  },

  {
    id: "daynulm",
    icon: "🏘️", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Housing & Urban Affairs", hi: "आवासन और शहरी कार्य मंत्रालय" },
    name:    { en: "DAY-NULM (Urban Livelihoods Mission)",             hi: "डीएवाई-एनयूएलएम (शहरी आजीविका मिशन)" },
    benefit: { en: "₹10,000–₹2 Lakh loan at 5–7% interest + free skill training for urban poor", hi: "शहरी गरीबों के लिए ₹10,000–₹2 लाख 5–7% ब्याज पर लोन + मुफ्त कौशल प्रशिक्षण" },
    tag:     { en: "Business / Urban", hi: "व्यापार / शहरी" },
    annual: 0,
    apply:   { en: "nulm.gov.in", hi: "nulm.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL / EWS Certificate","Bank Account","Address Proof","Business Activity Proof"],
               hi: ["आधार कार्ड","BPL/EWS प्रमाण","बैंक खाता","पता प्रमाण","व्यापार गतिविधि प्रमाण"] },
    // Eligibility: urban poor, BPL/EWS, seeking self-employment
    match: (a) => ["urban","semi"].includes(a.area) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_internship",
    icon: "🏢", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Corporate Affairs", hi: "कॉर्पोरेट मामलों का मंत्रालय" },
    name:    { en: "PM Internship Scheme",                             hi: "पीएम इंटर्नशिप योजना" },
    benefit: { en: "₹5,000/month stipend + ₹6,000 one-time grant · 12-month internship in top 500 companies", hi: "₹5,000/माह स्टाइपेंड + ₹6,000 एकमुश्त अनुदान · शीर्ष 500 कंपनियों में 12 माह इंटर्नशिप" },
    tag:     { en: "Youth / Internship", hi: "युवा / इंटर्नशिप" },
    annual: 60000,
    apply:   { en: "pminternship.mca.gov.in", hi: "pminternship.mca.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Educational Certificates (Class 10/12/Diploma/Degree)","Bank Account (Aadhaar-linked)","Passport Photo"],
               hi: ["आधार कार्ड","शैक्षणिक प्रमाण (कक्षा 10/12/डिप्लोमा/डिग्री)","बैंक खाता (आधार लिंक)","पासपोर्ट फोटो"] },
    // Eligibility: youth aged 21-24, family income below ₹8 Lakh, not in full-time education/employment
    match: (a) => a.who === "student" && a.age === "18to35" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "annapurna",
    icon: "🍚", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of Rural Development (NSAP)", hi: "ग्रामीण विकास मंत्रालय (NSAP)" },
    name:    { en: "Annapurna Scheme (Free Food for Destitute Seniors)", hi: "अन्नपूर्णा योजना (निराश्रित वरिष्ठों के लिए मुफ्त अनाज)" },
    benefit: { en: "10 kg free food grain per month for destitute senior citizens (65+) not covered under NOAPS", hi: "NOAPS में शामिल न होने वाले निराश्रित बुजुर्गों (65+) को 10 किलो मुफ्त अनाज/माह" },
    tag:     { en: "Senior / Food", hi: "वरिष्ठ / भोजन" },
    annual: 6000,
    apply:   { en: "nsap.nic.in", hi: "nsap.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (65+ years)","BPL Certificate","Proof of No Pension","Bank Account"],
               hi: ["आधार कार्ड","आयु प्रमाण (65+ वर्ष)","BPL प्रमाण","पेंशन न होने का प्रमाण","बैंक खाता"] },
    // Eligibility: destitute senior (65+), BPL, not receiving any other pension
    match: (a) => (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_vidyalaxmi",
    icon: "📖", color: "#6D28D9", scope: "national",
    ministry: { en: "Ministry of Education & Ministry of Finance", hi: "शिक्षा मंत्रालय एवं वित्त मंत्रालय" },
    name:    { en: "PM Vidyalaxmi (Education Loan Scheme)",            hi: "पीएम विद्यालक्ष्मी (शिक्षा ऋण योजना)" },
    benefit: { en: "Education loan up to ₹10 Lakh · 3% interest subvention (1% for girls) · No collateral", hi: "₹10 लाख तक शिक्षा ऋण · 3% ब्याज सब्सिडी (बेटियों को 1%) · बिना गारंटी" },
    tag:     { en: "Student / Education Loan", hi: "छात्र / शिक्षा ऋण" },
    annual: 0,
    apply:   { en: "vidyalaxmi.ac.in", hi: "vidyalaxmi.ac.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","PAN Card","Admission Letter from Institute","10th/12th/Graduation Mark Sheets","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","पैन कार्ड","संस्था का प्रवेश पत्र","10वीं/12वीं/स्नातक मार्कशीट","आय प्रमाण पत्र","बैंक खाता"] },
    // Eligibility: student admitted to recognised higher education institution, family income below ₹8L
    match: (a) => a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "jsy",
    icon: "🏥", color: "#EC4899", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "Janani Suraksha Yojana (JSY)",                     hi: "जननी सुरक्षा योजना (JSY)" },
    benefit: { en: "₹1,400 cash (rural) or ₹700 (urban) for safe institutional delivery", hi: "सरकारी अस्पताल में प्रसव पर ₹1,400 (ग्रामीण) या ₹700 (शहरी) नकद सहायता" },
    tag:     { en: "Maternity / Women", hi: "मातृत्व / महिला" },
    annual: 1400,
    apply:   { en: "nhm.gov.in / Nearest PHC or Hospital", hi: "nhm.gov.in / नजदीकी PHC या अस्पताल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","MCH Card / MCP Card","BPL / SC / ST Certificate","Bank Account","Address Proof"],
               hi: ["आधार कार्ड","MCH कार्ड / MCP कार्ड","BPL/SC/ST प्रमाण पत्र","बैंक खाता","पता प्रमाण"] },
    // Eligibility: BPL / SC / ST pregnant women for institutional delivery
    match: (a) => a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "mission_indradhanush",
    icon: "💉", color: "#0891B2", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "Mission Indradhanush (Free Vaccination)",          hi: "मिशन इंद्रधनुष (मुफ्त टीकाकरण)" },
    benefit: { en: "Free vaccines for children under 2 yrs & pregnant women · 12 diseases covered (polio, TB, hepatitis B, etc.)", hi: "2 वर्ष से कम बच्चों और गर्भवती महिलाओं को मुफ्त टीकाकरण · 12 बीमारियाँ (पोलियो, TB, हेपेटाइटिस B आदि)" },
    tag:     { en: "Health / Child", hi: "स्वास्थ्य / बच्चे" },
    annual: 0,
    apply:   { en: "nhm.gov.in / Nearest Anganwadi or PHC", hi: "nhm.gov.in / नजदीकी आंगनवाड़ी या PHC" }, applyType: "offline",
    docs:    { en: ["Child's Birth Certificate","MCH Card (Mother & Child Health Card)","Aadhaar Card (parent)"],
               hi: ["बच्चे का जन्म प्रमाण पत्र","MCH कार्ड (माँ और बच्चा स्वास्थ्य कार्ड)","आधार कार्ड (माता-पिता)"] },
    // Eligibility: children under 2 years and pregnant women, all incomes
    match: (a) => a.who === "women",
  },

  {
    id: "pmvvy",
    icon: "💰", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Finance (LIC of India)", hi: "वित्त मंत्रालय (भारतीय जीवन बीमा निगम)" },
    name:    { en: "PM Vaya Vandana Yojana (PMVVY)",                   hi: "प्रधानमंत्री वय वंदना योजना (PMVVY)" },
    benefit: { en: "7.4% guaranteed pension · Invest up to ₹15 Lakh · Min. ₹1,000/month pension guaranteed for 10 years", hi: "7.4% गारंटीड पेंशन · ₹15 लाख तक निवेश · 10 वर्ष के लिए न्यूनतम ₹1,000/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 12000,
    apply:   { en: "licindia.in", hi: "licindia.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (60+ years)","PAN Card","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","आयु प्रमाण (60+ वर्ष)","पैन कार्ड","बैंक खाता","पासपोर्ट फोटो"] },
    // Eligibility: senior citizens 60 years and above
    match: (a) => a.who === "senior" || a.age === "above60",
  },

  {
    id: "pmmsy",
    icon: "🐟", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Fisheries, Animal Husbandry & Dairying", hi: "मत्स्य पालन, पशुपालन एवं डेयरी मंत्रालय" },
    name:    { en: "PM Matsya Sampada Yojana (PMMSY)",                hi: "पीएम मत्स्य संपदा योजना (PMMSY)" },
    benefit: { en: "40–60% subsidy on boats, nets & fish farm units (80% for SC/ST/Women)", hi: "नाव, जाल और मछली फार्म पर 40–60% सब्सिडी (SC/ST/महिलाओं को 80%)" },
    tag:     { en: "Fisherman / Farmer", hi: "मछुआरा / किसान" },
    annual: 0,
    apply:   { en: "pmmsy.dof.gov.in", hi: "pmmsy.dof.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC/ST if applicable)","Bank Account","Land / Water Body Lease Proof","Fisherman Registration Certificate"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC/ST हो तो)","बैंक खाता","जमीन/जल निकाय पट्टा","मछुआरा पंजीकरण प्रमाण"] },
    // Eligibility: fishermen, fish farmers, aquaculture workers
    match: (a) => a.who === "farmer" || (a.area === "rural" && ["below1","1to3"].includes(a.income)),
  },

  {
    id: "startup_india",
    icon: "🚀", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Commerce & Industry (DPIIT)", hi: "वाणिज्य एवं उद्योग मंत्रालय (DPIIT)" },
    name:    { en: "Startup India – Seed Fund & Recognition",          hi: "स्टार्टअप इंडिया – बीज निधि एवं मान्यता" },
    benefit: { en: "Up to ₹50 Lakh seed funding · 3-year income-tax exemption · DPIIT recognition certificate", hi: "₹50 लाख तक बीज निधि · 3 साल आयकर छूट · DPIIT मान्यता प्रमाण पत्र" },
    tag:     { en: "Business / Startup", hi: "व्यापार / स्टार्टअप" },
    annual: 0,
    apply:   { en: "startupindia.gov.in", hi: "startupindia.gov.in" }, applyType: "online",
    docs:    { en: ["Company / LLP / Partnership Registration Proof","Founders' Aadhaar & PAN","Business / Innovation Proof","Pitch Deck or Business Plan","Bank Account"],
               hi: ["कंपनी/LLP/साझेदारी पंजीकरण प्रमाण","संस्थापकों का आधार व पैन","व्यापार/नवाचार प्रमाण","पिच डेक या व्यापार योजना","बैंक खाता"] },
    // Eligibility: registered startup, business age < 10 years, innovative product or service
    match: (a) => a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "pms_sc_st",
    icon: "📕", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Social Justice & Ministry of Tribal Affairs", hi: "सामाजिक न्याय मंत्रालय एवं जनजातीय कार्य मंत्रालय" },
    name:    { en: "Post Matric Scholarship – SC / ST Students",       hi: "पोस्ट मैट्रिक छात्रवृत्ति – SC/ST छात्र" },
    benefit: { en: "Full tuition fee reimbursement + maintenance allowance ₹230–₹1,200/month · All post-Class 10 courses", hi: "पूरी ट्यूशन फीस + ₹230–₹1,200/माह रखरखाव भत्ता · Class 10 के बाद सभी कोर्स" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 14400,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC / ST Caste Certificate","Income Certificate (≤₹2.5L/year)","Previous Year Mark Sheet","Institution Admission Letter","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","SC/ST जाति प्रमाण पत्र","आय प्रमाण (≤₹2.5 लाख/वर्ष)","पिछले वर्ष की मार्कशीट","संस्था प्रवेश पत्र","बैंक खाता (आधार लिंक)"] },
    // Eligibility: SC/ST student post Class 10, family income ≤ ₹2.5L
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "poshan_abhiyaan",
    icon: "🥗", color: "#16A34A", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "POSHAN Abhiyaan 2.0 (National Nutrition Mission)", hi: "पोषण अभियान 2.0 (राष्ट्रीय पोषण मिशन)" },
    benefit: { en: "Free take-home ration + nutrition supplements + counselling for children (0–6 yrs) & pregnant/lactating women via Anganwadi", hi: "आंगनवाड़ी से बच्चों (0–6 वर्ष) और गर्भवती/धात्री महिलाओं को मुफ्त राशन, पोषण आहार और परामर्श" },
    tag:     { en: "Nutrition / Women", hi: "पोषण / महिला" },
    annual: 6000,
    apply:   { en: "poshan.gov.in / Nearest Anganwadi Centre", hi: "poshan.gov.in / नजदीकी आंगनवाड़ी केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Child's Birth Certificate (if applicable)","MCH Card","Address Proof"],
               hi: ["आधार कार्ड","बच्चे का जन्म प्रमाण पत्र (लागू हो तो)","MCH कार्ड","पता प्रमाण"] },
    // Eligibility: pregnant/lactating women and children 0–6 years, any income
    match: (a) => a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pkvy",
    icon: "🌿", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "Paramparagat Krishi Vikas Yojana (PKVY)",          hi: "परंपरागत कृषि विकास योजना (PKVY)" },
    benefit: { en: "₹50,000/hectare over 3 years for switching to organic farming · Free training & organic certification", hi: "जैविक खेती अपनाने पर 3 वर्षों में ₹50,000/हेक्टेयर · मुफ्त प्रशिक्षण और जैविक प्रमाणीकरण" },
    tag:     { en: "Farmer / Organic", hi: "किसान / जैविक" },
    annual: 16667,
    apply:   { en: "pgsindia.net / Local Krishi Vigyan Kendra (KVK)", hi: "pgsindia.net / स्थानीय कृषि विज्ञान केंद्र (KVK)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records (minimum 0.4 hectare)","Bank Account","Group Formation Proof (cluster of 50 farmers preferred)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (न्यूनतम 0.4 हेक्टेयर)","बैंक खाता","समूह गठन प्रमाण (50 किसानों का समूह बेहतर)"] },
    // Eligibility: farmer willing to convert to organic farming with min 0.4 ha
    match: (a) => a.who === "farmer" && a.area === "rural",
  },

  {
    id: "naps",
    icon: "🔧", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Skill Development & Entrepreneurship", hi: "कौशल विकास एवं उद्यमिता मंत्रालय" },
    name:    { en: "National Apprenticeship Promotion Scheme (NAPS)", hi: "राष्ट्रीय शिक्षुता प्रोत्साहन योजना (NAPS)" },
    benefit: { en: "Govt. pays 25% of stipend (up to ₹1,500/month) · 1–3 year on-the-job trade training with a certificate", hi: "सरकार 25% स्टाइपेंड देती है (₹1,500/माह तक) · 1–3 वर्ष नौकरी-आधारित व्यापार प्रशिक्षण + प्रमाण पत्र" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 18000,
    apply:   { en: "apprenticeshipindia.gov.in", hi: "apprenticeshipindia.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Educational Certificate (Class 8 / 10 / 12 / ITI)","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","शैक्षणिक प्रमाण (कक्षा 8/10/12/ITI)","बैंक खाता","पासपोर्ट फोटो"] },
    // Eligibility: youth 14+ years, at least Class 5 pass, registered on portal
    match: (a) => a.age === "18to35" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "adip",
    icon: "🦽", color: "#6366F1", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "Assistance to Disabled Persons (ADIP) Scheme",    hi: "विकलांग व्यक्तियों की सहायता (ADIP) योजना" },
    benefit: { en: "Free assistive devices: wheelchair, hearing aid, artificial limb, braille kit, tricycle & more", hi: "मुफ्त सहायक उपकरण: व्हीलचेयर, श्रवण यंत्र, कृत्रिम अंग, ब्रेल किट, ट्राईसाइकिल आदि" },
    tag:     { en: "Disability / Aids", hi: "विकलांगता / सहायक उपकरण" },
    annual: 0,
    apply:   { en: "alimco.in / Nearest District Social Welfare Office", hi: "alimco.in / नजदीकी जिला समाज कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Disability Certificate (≥40% disability)","Income Certificate (≤₹2L/year)","Passport Photo","Bank Account"],
               hi: ["आधार कार्ड","विकलांगता प्रमाण पत्र (≥40% विकलांगता)","आय प्रमाण (≤₹2 लाख/वर्ष)","पासपोर्ट फोटो","बैंक खाता"] },
    // Eligibility: person with ≥40% disability, family income ≤ ₹2L/year
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  // ── NEW NATIONAL SCHEMES ──────────────────────────────────────────────────

  {
    id: "pmkmy_kisan",
    icon: "🧑‍🌾", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "PM Kisan Maan Dhan Yojana (PMKMY)",             hi: "पीएम किसान मान-धन योजना (PMKMY)" },
    benefit: { en: "₹3,000/month guaranteed pension after age 60 for small/marginal farmers · Govt. matches your contribution", hi: "छोटे/सीमांत किसानों को 60 वर्ष के बाद ₹3,000/माह पेंशन · सरकार बराबर अंशदान देती है" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 36000,
    apply:   { en: "maandhan.in", hi: "maandhan.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (up to 2 hectares)","Bank Account (Aadhaar-linked)","Mobile Number"],
               hi: ["आधार कार्ड","जमीन के कागज़ (2 हेक्टेयर तक)","बैंक खाता (आधार लिंक)","मोबाइल नंबर"] },
    match: (a) => a.who === "farmer" && ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmksy",
    icon: "💧", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "PM Krishi Sinchai Yojana – Per Drop More Crop", hi: "पीएम कृषि सिंचाई योजना – प्रति बूंद अधिक फसल" },
    benefit: { en: "55% subsidy (80% for SC/ST) on drip & sprinkler irrigation systems", hi: "ड्रिप और स्प्रिंकलर सिंचाई पर 55% सब्सिडी (SC/ST को 80%)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "pmksy.gov.in", hi: "pmksy.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra/Khatauni)","Bank Account","Caste Certificate (SC/ST if applicable)","Electricity Bill"],
               hi: ["आधार कार्ड","जमीन के कागज़ (खसरा/खतौनी)","बैंक खाता","जाति प्रमाण (SC/ST हो तो)","बिजली बिल"] },
    match: (a) => a.who === "farmer" && a.area === "rural",
  },

  {
    id: "nfbs",
    icon: "💸", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Rural Development (NSAP)", hi: "ग्रामीण विकास मंत्रालय (NSAP)" },
    name:    { en: "National Family Benefit Scheme (NFBS)",          hi: "राष्ट्रीय परिवार लाभ योजना (NFBS)" },
    benefit: { en: "₹20,000 one-time lump sum to BPL family on death of primary breadwinner (age 18–59)", hi: "BPL परिवार के मुखिया (18–59 वर्ष) की मृत्यु पर एकमुश्त ₹20,000" },
    tag:     { en: "Labour / General", hi: "श्रमिक / सामान्य" },
    annual: 0,
    apply:   { en: "nsap.nic.in / District Social Welfare Office", hi: "nsap.nic.in / जिला समाज कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Death Certificate of Breadwinner","BPL Certificate","Age Proof of Deceased","Bank Account","Relationship Proof"],
               hi: ["आधार कार्ड","मुखिया का मृत्यु प्रमाण पत्र","BPL प्रमाण","मृतक का आयु प्रमाण","बैंक खाता","संबंध प्रमाण"] },
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "jan_aushadhi",
    icon: "💊", color: "#059669", scope: "national",
    ministry: { en: "Ministry of Chemicals & Fertilizers", hi: "रसायन एवं उर्वरक मंत्रालय" },
    name:    { en: "PM Bharatiya Janaushadhi Pariyojana",            hi: "पीएम भारतीय जनऔषधि परियोजना" },
    benefit: { en: "Generic medicines at 50–90% lower price than branded drugs at Jan Aushadhi Kendras", hi: "Jan Aushadhi केंद्र पर ब्रांडेड दवाओं से 50–90% सस्ती जेनेरिक दवाएं" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 12000,
    apply:   { en: "janaushadhi.gov.in / Nearest Jan Aushadhi Kendra", hi: "janaushadhi.gov.in / नजदीकी जन औषधि केंद्र" }, applyType: "offline",
    docs:    { en: ["Doctor's Prescription (for Rx medicines)","No registration required"],
               hi: ["डॉक्टर का पर्चा (Rx दवाओं के लिए)","पंजीकरण की आवश्यकता नहीं"] },
    match: (a) => true,
  },

  {
    id: "rvy",
    icon: "🦯", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "Rashtriya Vayoshri Yojana (RVY)",                hi: "राष्ट्रीय वयोश्री योजना (RVY)" },
    benefit: { en: "Free assistive devices for BPL senior citizens 60+: walking stick, elbow crutches, wheelchair, hearing aid, spectacles", hi: "BPL वरिष्ठ नागरिकों (60+) को मुफ्त सहायक उपकरण: छड़ी, बैसाखी, व्हीलचेयर, श्रवण यंत्र, चश्मा" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 0,
    apply:   { en: "alimco.in / District Social Welfare Office", hi: "alimco.in / जिला समाज कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Age Proof (60+ years)","BPL Certificate","Medical Certificate (disability/age-related infirmity)","Passport Photo"],
               hi: ["आधार कार्ड","आयु प्रमाण (60+ वर्ष)","BPL प्रमाण","चिकित्सा प्रमाण पत्र","पासपोर्ट फोटो"] },
    match: (a) => (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "saubhagya",
    icon: "⚡", color: "#D97706", scope: "national",
    ministry: { en: "Ministry of Power", hi: "विद्युत मंत्रालय" },
    name:    { en: "Saubhagya – Pradhan Mantri Sahaj Bijli Har Ghar Yojana", hi: "सौभाग्य – पीएम सहज बिजली हर घर योजना" },
    benefit: { en: "Free electricity connection for BPL households · Free wiring & meter installation", hi: "BPL परिवारों को मुफ्त बिजली कनेक्शन · मुफ्त वायरिंग और मीटर" },
    tag:     { en: "Solar / Electricity", hi: "सौर / बिजली" },
    annual: 0,
    apply:   { en: "saubhagya.gov.in / State DISCOM office", hi: "saubhagya.gov.in / राज्य DISCOM कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card / BPL Certificate","Address Proof","Passport Photo"],
               hi: ["आधार कार्ड","राशन कार्ड / BPL प्रमाण","पता प्रमाण","पासपोर्ट फोटो"] },
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "icds",
    icon: "👶", color: "#EC4899", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "Integrated Child Development Services (ICDS) – Anganwadi", hi: "समेकित बाल विकास सेवाएं (ICDS) – आंगनवाड़ी" },
    benefit: { en: "Free supplementary nutrition, immunization, health checkup & pre-school education for children (0–6 yrs) and pregnant/nursing mothers", hi: "बच्चों (0–6 वर्ष) और गर्भवती/धात्री माताओं को मुफ्त पूरक पोषण, टीकाकरण, स्वास्थ्य जांच और पूर्व-स्कूली शिक्षा" },
    tag:     { en: "Health / Child", hi: "स्वास्थ्य / बच्चे" },
    annual: 6000,
    apply:   { en: "Nearest Anganwadi Centre (no online registration needed)", hi: "नजदीकी आंगनवाड़ी केंद्र (ऑनलाइन पंजीकरण जरूरी नहीं)" }, applyType: "offline",
    docs:    { en: ["Child's Birth Certificate","Aadhaar Card (parent)","MCH Card","Address Proof"],
               hi: ["बच्चे का जन्म प्रमाण पत्र","आधार कार्ड (माता-पिता)","MCH कार्ड","पता प्रमाण"] },
    match: (a) => a.who === "women" || (a.age === "below18" && ["below1","1to3"].includes(a.income)),
  },

  {
    id: "premat_st_scholarship",
    icon: "📗", color: "#065F46", scope: "national",
    ministry: { en: "Ministry of Tribal Affairs", hi: "जनजातीय कार्य मंत्रालय" },
    name:    { en: "Pre-Matric Scholarship for ST Students (Class 9–10)", hi: "ST छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति (कक्षा 9–10)" },
    benefit: { en: "₹150/month (day scholar) to ₹350/month (hosteller) + full tuition & fees reimbursement", hi: "₹150/माह (डे स्कॉलर) से ₹350/माह (छात्रावास) + पूर्ण ट्यूशन और शुल्क प्रतिपूर्ति" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 4200,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","ST Caste Certificate","Income Certificate (≤₹2.5L/year)","Class 8 Mark Sheet","School Enrollment Certificate","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","ST जाति प्रमाण पत्र","आय प्रमाण (≤₹2.5 लाख/वर्ष)","कक्षा 8 मार्कशीट","स्कूल नामांकन प्रमाण","बैंक खाता (आधार लिंक)"] },
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmgdisha",
    icon: "💻", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Electronics & Information Technology", hi: "इलेक्ट्रॉनिक्स एवं सूचना प्रौद्योगिकी मंत्रालय" },
    name:    { en: "PM Gramin Digital Saksharta Abhiyan (PMGDISHA)",  hi: "पीएम ग्रामीण डिजिटल साक्षरता अभियान (PMGDISHA)" },
    benefit: { en: "Free 15-hour digital literacy training: internet, mobile banking, govt. e-services for rural households", hi: "ग्रामीण परिवारों के लिए मुफ्त 15 घंटे का डिजिटल साक्षरता प्रशिक्षण: इंटरनेट, मोबाइल बैंकिंग, सरकारी ई-सेवाएं" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 0,
    apply:   { en: "pmgdisha.in / CSC Centre (Common Service Centre)", hi: "pmgdisha.in / CSC केंद्र (कॉमन सर्विस सेंटर)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Address Proof (rural)","Mobile Number"],
               hi: ["आधार कार्ड","पता प्रमाण (ग्रामीण)","मोबाइल नंबर"] },
    match: (a) => a.area === "rural" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "national_creche",
    icon: "🍼", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "National Creche Scheme (Palna)",                  hi: "राष्ट्रीय क्रेच योजना (पालना)" },
    benefit: { en: "Free/subsidized daycare for children 6 months–6 years of working mothers · Nutrition, healthcare & early education", hi: "कामकाजी माताओं के 6 माह–6 वर्ष के बच्चों के लिए मुफ्त/सब्सिडीयुक्त डेकेयर · पोषण, स्वास्थ्य देखभाल और प्रारंभिक शिक्षा" },
    tag:     { en: "Women / SHG", hi: "महिला / SHG" },
    annual: 9600,
    apply:   { en: "wcd.gov.in / State WCD Department / Nearest Creche", hi: "wcd.gov.in / राज्य WCD विभाग / नजदीकी क्रेच" }, applyType: "offline",
    docs:    { en: ["Child's Birth Certificate","Mother's Work Certificate / Aadhaar","Income Certificate (≤₹12,000/month)","Address Proof"],
               hi: ["बच्चे का जन्म प्रमाण पत्र","माँ का कार्य प्रमाण पत्र / आधार","आय प्रमाण (≤₹12,000/माह)","पता प्रमाण"] },
    match: (a) => a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmlvmy",
    icon: "🛍️", color: "#6B21A8", scope: "national",
    ministry: { en: "Ministry of Labour & Employment", hi: "श्रम एवं रोजगार मंत्रालय" },
    name:    { en: "PM Laghu Vyapari Maan-dhan Yojana (PMLVMY)",     hi: "पीएम लघु व्यापारी मान-धन योजना (PMLVMY)" },
    benefit: { en: "₹3,000/month pension after age 60 for shopkeepers, retail traders & self-employed persons · Govt. matches contribution", hi: "दुकानदारों, खुदरा व्यापारियों और स्व-नियोजित लोगों को 60 वर्ष बाद ₹3,000/माह पेंशन · सरकार बराबर अंशदान देती है" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 36000,
    apply:   { en: "maandhan.in", hi: "maandhan.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Bank Account (Aadhaar-linked)","GST Registration / Shop Registration Proof","Self-Declaration of Annual Turnover < ₹1.5 Crore","Mobile Number"],
               hi: ["आधार कार्ड","बैंक खाता (आधार लिंक)","GST/दुकान पंजीकरण प्रमाण","वार्षिक टर्नओवर < ₹1.5 करोड़ स्व-घोषणा","मोबाइल नंबर"] },
    match: (a) => a.who === "business" && ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "seekho_kamao",
    icon: "🎓", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Minority Affairs", hi: "अल्पसंख्यक कार्य मंत्रालय" },
    name:    { en: "Seekho aur Kamao (Learn & Earn)",                 hi: "सीखो और कमाओ (Learn & Earn)" },
    benefit: { en: "Free market-driven skill training (3–12 months) for minority youth + placement assistance · Stipend during training", hi: "अल्पसंख्यक युवाओं के लिए मुफ्त कौशल प्रशिक्षण (3–12 माह) + रोजगार सहायता · प्रशिक्षण के दौरान वजीफा" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 18000,
    apply:   { en: "seekhoaurkamao.nic.in", hi: "seekhoaurkamao.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate (Muslim/Christian/Sikh/Buddhist/Jain/Parsi)","Educational Certificate","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र","शैक्षणिक प्रमाण","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pm_daksh",
    icon: "🔩", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "PM DAKSH Yojana (Skill Training for SC/OBC/EBC)", hi: "पीएम दक्ष योजना (SC/OBC/EBC हेतु कौशल प्रशिक्षण)" },
    benefit: { en: "Free skill training (short-term & long-term) for SC/OBC/EBC · ₹1,000–₹1,500/month stipend + placement support", hi: "SC/OBC/EBC के लिए मुफ्त कौशल प्रशिक्षण · ₹1,000–₹1,500/माह वजीफा + रोजगार सहायता" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 18000,
    apply:   { en: "pmdaksh.gov.in", hi: "pmdaksh.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC / OBC / EBC Caste Certificate","Income Certificate","Educational Certificate (Class 8/10/12 as applicable)","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","SC/OBC/EBC जाति प्रमाण पत्र","आय प्रमाण","शैक्षणिक प्रमाण","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  // ══════════════════════ STATE SCHEMES ════════════════════════════════════════
  // All state schemes live in stateSchemes.js — edit that file to add/change them.
  ...STATE_SCHEMES,

];

export const CATEGORIES = {
  en: [
    { icon: "🌾", label: "Farmer",       color: "#138808", bg: "#f0fdf4", filterKey: "farmer"    },
    { icon: "📚", label: "Student",      color: "#003580", bg: "#eff6ff", filterKey: "student"   },
    { icon: "👩", label: "Women",        color: "#BE185D", bg: "#fdf2f8", filterKey: "women"     },
    { icon: "👴", label: "Senior",       color: "#FF9933", bg: "#fff7ed", filterKey: "senior"    },
    { icon: "💼", label: "Business",     color: "#6B21A8", bg: "#faf5ff", filterKey: "business"  },
    { icon: "🏠", label: "Housing",      color: "#0F766E", bg: "#f0fdfa", filterKey: "housing"   },
    { icon: "🏥", label: "Health",       color: "#0369A1", bg: "#f0f9ff", filterKey: "health"    },
    { icon: "🛡️", label: "Insurance",   color: "#DC2626", bg: "#fff1f2", filterKey: "insurance" },
    { icon: "🏛️", label: "Pension",      color: "#7C3AED", bg: "#f5f3ff", filterKey: "pension"   },
    { icon: "🆓", label: "Free Benefits",color: "#15803D", bg: "#f0fdf4", filterKey: "free"      },
    { icon: "🎯", label: "Skill & Youth",color: "#D97706", bg: "#fffbeb", filterKey: "skill"     },
    { icon: "👶", label: "Child & Girl", color: "#EC4899", bg: "#fdf4ff", filterKey: "child"     },
    { icon: "⚒️", label: "Labour",       color: "#92400E", bg: "#fef3c7", filterKey: "labour"    },
    { icon: "🍱", label: "Food",         color: "#B45309", bg: "#fef9c3", filterKey: "food"      },
    { icon: "🌿", label: "Rural",        color: "#065F46", bg: "#ecfdf5", filterKey: "rural"     },
    { icon: "🦽", label: "Disability",   color: "#4F46E5", bg: "#eef2ff", filterKey: "disability"},
    { icon: "☀️", label: "Solar",        color: "#CA8A04", bg: "#fefce8", filterKey: "solar"     },
    { icon: "🤱", label: "Maternity",    color: "#9D174D", bg: "#fff1f2", filterKey: "maternity" },
  ],
  hi: [
    { icon: "🌾", label: "किसान",          color: "#138808", bg: "#f0fdf4", filterKey: "farmer"    },
    { icon: "📚", label: "छात्र",           color: "#003580", bg: "#eff6ff", filterKey: "student"   },
    { icon: "👩", label: "महिला",          color: "#BE185D", bg: "#fdf2f8", filterKey: "women"     },
    { icon: "👴", label: "वरिष्ठ",         color: "#FF9933", bg: "#fff7ed", filterKey: "senior"    },
    { icon: "💼", label: "व्यापार",        color: "#6B21A8", bg: "#faf5ff", filterKey: "business"  },
    { icon: "🏠", label: "आवास",           color: "#0F766E", bg: "#f0fdfa", filterKey: "housing"   },
    { icon: "🏥", label: "स्वास्थ्य",      color: "#0369A1", bg: "#f0f9ff", filterKey: "health"    },
    { icon: "🛡️", label: "बीमा",           color: "#DC2626", bg: "#fff1f2", filterKey: "insurance" },
    { icon: "🏛️", label: "पेंशन",          color: "#7C3AED", bg: "#f5f3ff", filterKey: "pension"   },
    { icon: "🆓", label: "मुफ़्त लाभ",     color: "#15803D", bg: "#f0fdf4", filterKey: "free"      },
    { icon: "🎯", label: "कौशल व युवा",    color: "#D97706", bg: "#fffbeb", filterKey: "skill"     },
    { icon: "👶", label: "बच्चे व बालिका", color: "#EC4899", bg: "#fdf4ff", filterKey: "child"     },
    { icon: "⚒️", label: "श्रमिक",         color: "#92400E", bg: "#fef3c7", filterKey: "labour"    },
    { icon: "🍱", label: "खाद्य",          color: "#B45309", bg: "#fef9c3", filterKey: "food"      },
    { icon: "🌿", label: "ग्रामीण",        color: "#065F46", bg: "#ecfdf5", filterKey: "rural"     },
    { icon: "🦽", label: "विकलांगता",      color: "#4F46E5", bg: "#eef2ff", filterKey: "disability"},
    { icon: "☀️", label: "सौर ऊर्जा",      color: "#CA8A04", bg: "#fefce8", filterKey: "solar"     },
    { icon: "🤱", label: "मातृत्व",         color: "#9D174D", bg: "#fff1f2", filterKey: "maternity" },
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

  // ── New category filters ──────────────────────────────────────────────────
  if (filterKey === "skill") {
    const kws = ["skill", "youth", "internship", "apprentice", "training", "kaushal", "rozgar"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "child") {
    const kws = ["child", "girl", "beti", "balika", "sukanya", "anganwadi", "nutrition", "poshan"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "labour") {
    const kws = ["labour", "labor", "worker", "shramik", "mazdoor", "mgnrega", "nrega", "employment"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "food") {
    const kws = ["food", "ration", "nutrition", "annapoorna", "annapurna", "midday", "mid-day", "poshan"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "rural") {
    const kws = ["rural", "gram", "village", "panchayat", "gramin", "pradhan mantri gram", "jal jeevan", "swajal"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "disability") {
    const kws = ["disability", "disabled", "divyang", "handicap", "viklang", "adip", "assistive"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "solar") {
    const kws = ["solar", "electricity", "energy", "bijli", "surya", "pm kusum", "rooftop", "ujala"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }

  if (filterKey === "maternity") {
    const kws = ["maternity", "maternal", "pregnancy", "pradhan mantri matru", "pmmvy", "janani", "delivery"];
    return SCHEME_DB.filter(s => kws.some(kw =>
      s.tag.en.toLowerCase().includes(kw) || s.name.en.toLowerCase().includes(kw)
    ));
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Tag keywords used to match state schemes, which can't use s.match()
  // (state schemes require a.state === "X", so match() always returns false with state:"")
  const STATE_TAG_KEYWORDS = {
    farmer:     ["farmer", "kisan", "rythu", "shetkari", "kalia", "krishi"],
    student:    ["student", "education", "scholarship", "merit"],
    women:      ["women", "girl", "widow", "maternity", "shg", "naari", "marriage"],
    senior:     ["senior", "pension", "old age"],
    business:   ["business", "artisan", "vendor", "entrepreneur"],
    skill:      ["skill", "youth", "internship", "apprentice", "training"],
    child:      ["child", "girl", "balika", "sukanya", "nutrition", "poshan"],
    labour:     ["labour", "labor", "worker", "shramik", "nrega", "employment"],
    food:       ["food", "ration", "nutrition", "annapoorna", "midday"],
    rural:      ["rural", "gram", "village", "gramin", "jal"],
    disability: ["disability", "disabled", "divyang", "viklang", "adip"],
    solar:      ["solar", "electricity", "energy", "surya", "ujala"],
    maternity:  ["maternity", "maternal", "pregnancy", "janani", "pmmvy"],
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
