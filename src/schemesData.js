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
    apply:   { en: "https://pmkisan.gov.in", hi: "pmkisan.gov.in" }, applyType: "online",
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
    apply:   { en: "https://rdd.maharashtra.gov.in/en/scheme/pradhan-mantri-awas-yojana-rural", hi: "pmayg.nic.in" }, applyType: "online",
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
    apply:   { en: "https://pmaymis.gov.in", hi: "pmaymis.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmjay.gov.in", hi: "pmjay.gov.in" }, applyType: "online",
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
    apply:   { en: "https://web.umang.gov.in/landing/department/national-scholarship-portal.html", hi: "scholarships.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmmy", hi: "udyamimitra.in" }, applyType: "online",
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
    apply:   { en: "https://pmuy.gov.in", hi: "pmuy.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.india.gov.in/category/benefits-social-development/subcategory/women-children/details/beti-bachao-beti-padhao-scheme-ministry-of-women-child-development", hi: "wcd.gov.in" }, applyType: "online",
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
    apply:   { en: "https://web.umang.gov.in/landing/scheme/detail/nsap-indira-gandhi-national-old-age-pension-scheme_nsap-ignoaps.html", hi: "nsap.nic.in" }, applyType: "online",
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
    apply:   { en: "https://www.pmjdy.gov.in/scheme", hi: "pmjdy.gov.in" }, applyType: "online",
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
    apply:   { en: "https://financialservices.gov.in/pradhan-mantri-jeevan-jyoti-bima-yojana-pmjjby", hi: "jansuraksha.gov.in" }, applyType: "online",
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
    apply:   { en: "https://financialservices.gov.in/pradhan-mantri-suraksha-bima-yojana-pmsby", hi: "jansuraksha.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/apy", hi: "jansuraksha.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmv", hi: "pmvishwakarma.gov.in" }, applyType: "online",
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
    apply:   { en: "https://web.umang.gov.in/landing/scheme/detail/pm-street-vendors-atmanirbhar-nidhi-pm-svanidhi_pm-svanidhi.html", hi: "pmsvanidhi.mohua.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.icici.bank.in/personal-banking/investments/sukanya-samriddhi-yojana-account", hi: "nsiindia.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmmvy.wcd.gov.in", hi: "pmmvy.wcd.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmfby.gov.in", hi: "pmfby.gov.in" }, applyType: "online",
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
    apply:   { en: "https://nrega.nic.in", hi: "nrega.nic.in" }, applyType: "online",
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
    apply:   { en: "https://skillindiadigital.gov.in", hi: "skillindiadigital.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.airtel.in/blog/personal-loan/pmegp-loan-scheme-your-complete-guide", hi: "kviconline.gov.in/pmegpeportal" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/sui", hi: "standupmitra.in" }, applyType: "online",
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
    apply:   { en: "https://nfsa.gov.in", hi: "nfsa.gov.in" }, applyType: "online",
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
    apply:   { en: "https://sbm.gov.in", hi: "sbm.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/day-nrlm", hi: "aajeevika.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmsma", hi: "pmsma.mohfw.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmjay.gov.in", hi: "pmjay.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmgsy", hi: "pmgsy.nic.in" }, applyType: "online",
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
    apply:   { en: "https://jaljeevanmission.gov.in", hi: "jaljeevanmission.gov.in" }, applyType: "online",
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
    apply:   { en: "https://kaushal.rural.gov.in", hi: "kaushal.rural.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmaymis.gov.in", hi: "pmaymis.gov.in" }, applyType: "online",
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
    apply:   { en: "https://bdokhargram.in/page/department/pm-poshan", hi: "pmposhan.education.gov.in" }, applyType: "online",
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
    apply:   { en: "https://sjsa.maharashtra.gov.in/en/scheme/indira-gandhi-national-widow-pension-scheme", hi: "nsap.nic.in" }, applyType: "online",
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
    apply:   { en: "https://soilhealth.dac.gov.in", hi: "soilhealth.dac.gov.in" }, applyType: "online",
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
    apply:   { en: "https://eshram.gov.in", hi: "eshram.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/pm-sym", hi: "maandhan.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/nmmss", hi: "scholarships.gov.in" }, applyType: "online",
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
    apply:   { en: "https://socialjustice.gov.in/schemes/101", hi: "scholarships.gov.in" }, applyType: "online",
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
    apply:   { en: "https://mnre.gov.in/en/pradhan-mantri-kisan-urja-suraksha-evam-utthaan-mahabhiyaan-pm-kusum", hi: "pmkusum.mnre.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmsuryaghar.gov.in", hi: "pmsuryaghar.gov.in" }, applyType: "online",
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
    apply:   { en: "https://indbiz.gov.in/pm-modi-launches-property-cards-under-svamitva-scheme", hi: "svamitva.nic.in" }, applyType: "online",
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
    apply:   { en: "https://web.umang.gov.in/landing/scheme/detail/nsap-indira-gandhi-national-old-age-pension-scheme_nsap-ignoaps.html", hi: "nsap.nic.in" }, applyType: "online",
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
    apply:   { en: "https://mybharat.gov.in/pages/event_detail?event_name=Prime-Minister-Internship-Scheme&key=110157394110", hi: "pminternship.mca.gov.in" }, applyType: "online",
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
    apply:   { en: "https://web.umang.gov.in/landing/department/national-social-assistance-programme-nsap.html", hi: "nsap.nic.in" }, applyType: "online",
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
    apply:   { en: "https://indianembassypanama.gov.in/eoipa_listview/MjQ,", hi: "vidyalaxmi.ac.in" }, applyType: "online",
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
    apply:   { en: "https://web.umang.gov.in/landing/department/pmvvy.html", hi: "licindia.in" }, applyType: "online",
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
    apply:   { en: "https://www.startupindia.gov.in/content/sih/en/home-page.html", hi: "startupindia.gov.in" }, applyType: "online",
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
    apply:   { en: "https://oasis.wb.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/naps", hi: "apprenticeshipindia.gov.in" }, applyType: "online",
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
    apply:   { en: "https://pmkisan.gov.in", hi: "maandhan.in" }, applyType: "online",
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
    apply:   { en: "https://www.myscheme.gov.in/schemes/pre-st", hi: "scholarships.gov.in" }, applyType: "online",
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
    apply:   { en: "https://www.govtschemes.in/pradhan-mantri-laghu-vyapari-mandhan-yojanapmlvmy", hi: "maandhan.in" }, applyType: "online",
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
    apply:   { en: "https://my.msme.gov.in/MyMsmeMob/MsmeScheme/Pages/8_2.html", hi: "seekhoaurkamao-moma.gov.in" }, applyType: "online",
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
    apply:   { en: "https://nbcfdc.gov.in/nbcfdc/web/skills-schemes-flyer", hi: "pmdaksh.dosje.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC / OBC / EBC Caste Certificate","Income Certificate","Educational Certificate (Class 8/10/12 as applicable)","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","SC/OBC/EBC जाति प्रमाण पत्र","आय प्रमाण","शैक्षणिक प्रमाण","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "csss",
    icon: "🏆", color: "#1E40AF", scope: "national",
    ministry: { en: "Ministry of Education (Dept. of Higher Education)", hi: "शिक्षा मंत्रालय (उच्च शिक्षा विभाग)" },
    name:    { en: "Central Sector Scholarship Scheme (CSSS)",          hi: "केंद्रीय क्षेत्र छात्रवृत्ति योजना (CSSS)" },
    benefit: { en: "₹12,000/year (UG 1st–3rd year) · ₹20,000/year (PG) for Class 12 toppers", hi: "कक्षा 12 टॉपर्स को ₹12,000/वर्ष (UG 1–3 वर्ष) · ₹20,000/वर्ष (PG)" },
    tag:     { en: "Student / Merit", hi: "छात्र / मेधा" },
    annual: 12000,
    apply:   { en: "https://socialjustice.gov.in/schemes/27", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 12 Mark Sheet (above 80th percentile in Board exam)","Income Certificate (≤₹4.5L/year)","College Admission Letter","Bank Account (Aadhaar-linked)","Passport Photo"],
               hi: ["आधार कार्ड","कक्षा 12 मार्कशीट (बोर्ड परीक्षा में 80वीं प्रतिशत से ऊपर)","आय प्रमाण (≤₹4.5 लाख/वर्ष)","कॉलेज प्रवेश पत्र","बैंक खाता (आधार लिंक)","पासपोर्ट फोटो"] },
    // Eligibility: students above 80th percentile in Class 12 Board, family income ≤ ₹4.5L, in regular UG/PG (not distance/open)
    match: (a) => a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "nlm",
    icon: "🐄", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of Fisheries, Animal Husbandry & Dairying", hi: "मत्स्य पालन, पशुपालन एवं डेयरी मंत्रालय" },
    name:    { en: "National Livestock Mission (NLM)",                   hi: "राष्ट्रीय पशुधन मिशन (NLM)" },
    benefit: { en: "50% subsidy (max ₹50 Lakh; 60% for SC/ST/Women) on poultry, goat, sheep, cattle & fodder enterprises", hi: "मुर्गी पालन, बकरी, भेड़, मवेशी व चारा इकाइयों पर 50% सब्सिडी (अधिकतम ₹50 लाख; SC/ST/महिलाओं को 60%)" },
    tag:     { en: "Farmer / Animal Husbandry", hi: "किसान / पशुपालन" },
    annual: 0,
    apply:   { en: "nlm.udyamimitra.in / State Animal Husbandry Dept.", hi: "nlm.udyamimitra.in / राज्य पशुपालन विभाग" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records / Shed Lease Deed","Project Report","Bank Statement (6 months)","Caste Certificate (SC/ST if applicable)","Bank Account"],
               hi: ["आधार कार्ड","जमीन के कागज़ / शेड पट्टा","प्रोजेक्ट रिपोर्ट","6 महीने बैंक स्टेटमेंट","जाति प्रमाण (SC/ST हो तो)","बैंक खाता"] },
    // Eligibility: farmers, SHGs, cooperatives, FPOs engaged in livestock/poultry rearing
    match: (a) => a.who === "farmer" || (a.area === "rural" && ["below1","1to3"].includes(a.income)),
  },

  {
    id: "pm_aasha",
    icon: "⚖️", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "PM AASHA (Price Support Scheme for Farmers)",        hi: "पीएम आशा (किसानों के लिए मूल्य समर्थन योजना)" },
    benefit: { en: "Govt. procures oilseeds, pulses & copra at MSP when market price falls below MSP · Direct payment to bank", hi: "बाज़ार भाव MSP से नीचे जाने पर सरकार तिलहन, दलहन व खोपरा MSP पर खरीदती है · सीधे बैंक में भुगतान" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "agmarknet.gov.in / State Agri Marketing Board / Nearest PACS", hi: "agmarknet.gov.in / राज्य कृषि विपणन बोर्ड / नजदीकी PACS" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra / Khatauni)","Bank Account","Farmer Registration on State Agri Portal or e-NAM"],
               hi: ["आधार कार्ड","जमीन के कागज़ (खसरा/खतौनी)","बैंक खाता","राज्य कृषि पोर्टल/e-NAM पर किसान पंजीकरण"] },
    // Eligibility: farmers growing notified oilseeds (mustard, soybean, groundnut etc.), pulses & copra
    match: (a) => a.who === "farmer",
  },

  {
    id: "mcm_minority",
    icon: "📘", color: "#6D28D9", scope: "national",
    ministry: { en: "Ministry of Minority Affairs", hi: "अल्पसंख्यक कार्य मंत्रालय" },
    name:    { en: "Merit-cum-Means Scholarship for Minorities (MCM)",  hi: "अल्पसंख्यकों के लिए मेरिट-कम-मीन्स छात्रवृत्ति (MCM)" },
    benefit: { en: "₹25,000/year (technical/professional) · ₹10,000/year (general degree) + course fee reimbursement up to ₹20,000", hi: "तकनीकी/व्यावसायिक: ₹25,000/वर्ष · सामान्य डिग्री: ₹10,000/वर्ष + ₹20,000 तक कोर्स फीस प्रतिपूर्ति" },
    tag:     { en: "Student / Minority", hi: "छात्र / अल्पसंख्यक" },
    annual: 25000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/nmmss", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate (Muslim/Christian/Sikh/Buddhist/Jain/Parsi)","Income Certificate (≤₹2.5L/year)","Previous Year Mark Sheet (min 50%)","Admission Letter","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र","आय प्रमाण (≤₹2.5 लाख/वर्ष)","पिछले वर्ष मार्कशीट (न्यूनतम 50%)","प्रवेश पत्र","बैंक खाता (आधार लिंक)"] },
    // Eligibility: minority student in Class 11 to PG technical/professional/general degree, income ≤ ₹2.5L
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "free_coaching_sc",
    icon: "📝", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "Free Coaching Scheme for SC & OBC Students",        hi: "SC और OBC छात्रों के लिए नि:शुल्क कोचिंग योजना" },
    benefit: { en: "Free coaching for UPSC, SSC, Banking, Railways, NEET, JEE & PSU exams · ₹3,000/month living allowance during coaching", hi: "UPSC, SSC, बैंकिंग, रेलवे, NEET, JEE और PSU परीक्षाओं की मुफ्त कोचिंग · कोचिंग के दौरान ₹3,000/माह भत्ता" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 36000,
    apply:   { en: "https://socialjustice.gov.in/schemes/30", hi: "coaching.dosje.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC / OBC Caste Certificate","Income Certificate (≤₹8L/year)","Educational Certificate (Class 12 / Graduation)","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","SC/OBC जाति प्रमाण पत्र","आय प्रमाण (≤₹8 लाख/वर्ष)","शैक्षणिक प्रमाण (कक्षा 12/स्नातक)","बैंक खाता","पासपोर्ट फोटो"] },
    // Eligibility: SC/OBC student, family income ≤ ₹8L, targeting national competitive exams
    match: (a) => a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmfme",
    icon: "🥘", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Food Processing Industries", hi: "खाद्य प्रसंस्करण उद्योग मंत्रालय" },
    name:    { en: "PM Formalisation of Micro Food Processing Enterprises (PM-FME)", hi: "पीएम सूक्ष्म खाद्य प्रसंस्करण उद्यम औपचारिकीकरण (PM-FME)" },
    benefit: { en: "35% credit-linked capital subsidy (max ₹10 Lakh) for micro food processing units · Free FSSAI registration & branding support + skill training", hi: "सूक्ष्म खाद्य प्रसंस्करण इकाइयों को 35% सब्सिडी (अधिकतम ₹10 लाख) · मुफ्त FSSAI पंजीकरण, ब्रांडिंग और कौशल प्रशिक्षण" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmfmpe", hi: "pmfme.mofpi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN Card","Business Registration / FSSAI Licence (or applied for)","Project Report","Bank Statement (6 months)","Land / Shed Ownership or Lease Proof","Caste Certificate (SC/ST/OBC if applicable)"],
               hi: ["आधार और पैन कार्ड","व्यापार पंजीकरण / FSSAI लाइसेंस","प्रोजेक्ट रिपोर्ट","6 महीने बैंक स्टेटमेंट","जमीन/शेड स्वामित्व या पट्टा","जाति प्रमाण (SC/ST/OBC हो तो)"] },
    // Eligibility: individual micro food entrepreneurs, SHGs, FPOs in food processing; monthly turnover < ₹1 Crore
    match: (a) => (a.who === "business" || a.who === "women") && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "ab_hwc",
    icon: "🩺", color: "#059669", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare (NHM)", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय (NHM)" },
    name:    { en: "Ayushman Arogya Mandir – Health & Wellness Centres (AB-HWC)", hi: "आयुष्मान आरोग्य मंदिर – स्वास्थ्य एवं आरोग्य केंद्र (AB-HWC)" },
    benefit: { en: "FREE walk-in OPD + 12 health services (mental health, oral, vision, ENT, physiotherapy) + free medicines & diagnostics at nearest HWC", hi: "नजदीकी HWC पर मुफ्त OPD + 12 स्वास्थ्य सेवाएं (मानसिक स्वास्थ्य, दांत, नेत्र, ENT, फिजियोथेरेपी) + मुफ्त दवाएं व जांच" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 12000,
    apply:   { en: "Nearest Ayushman Arogya Mandir / HWC — no prior registration needed", hi: "नजदीकी आयुष्मान आरोग्य मंदिर / HWC — पूर्व पंजीकरण जरूरी नहीं" }, applyType: "offline",
    docs:    { en: ["No documents required for walk-in","Aadhaar Card (preferred)","Ayushman Card (if PMJAY beneficiary)"],
               hi: ["वॉक-इन के लिए कोई दस्तावेज़ नहीं","आधार कार्ड (बेहतर)","आयुष्मान कार्ड (PMJAY लाभार्थी हो तो)"] },
    // Eligibility: all citizens, no income or age restriction
    match: (a) => true,
  },

  {
    id: "pm_cares_children",
    icon: "👧", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "PM CARES for Children (COVID Orphan Scheme)",        hi: "पीएम केयर्स फॉर चिल्ड्रन (कोविड अनाथ योजना)" },
    benefit: { en: "₹10 Lakh corpus at age 18 · Monthly stipend up to age 23 · Free school education · Ayushman Bharat ₹5L health cover", hi: "18 वर्ष पर ₹10 लाख कोष · 23 वर्ष तक मासिक स्टाइपेंड · मुफ्त स्कूल शिक्षा · आयुष्मान भारत ₹5 लाख स्वास्थ्य बीमा" },
    tag:     { en: "Health / Child", hi: "स्वास्थ्य / बच्चे" },
    annual: 60000,
    apply:   { en: "pmcaresforchildren.in / District Magistrate / District Collector", hi: "pmcaresforchildren.in / जिला मजिस्ट्रेट / जिला कलेक्टर" }, applyType: "offline",
    docs:    { en: ["Child's Aadhaar & Birth Certificate","Both Parents' Death Certificates (COVID-19 mentioned)","COVID-19 Test / Death Summary Report","Guardian's Aadhaar","Bank Account (child/guardian)","District Welfare Officer Referral"],
               hi: ["बच्चे का आधार और जन्म प्रमाण पत्र","दोनों माता-पिता के मृत्यु प्रमाण (COVID-19 उल्लेख सहित)","कोविड टेस्ट/मृत्यु सारांश रिपोर्ट","अभिभावक का आधार","बैंक खाता (बच्चे/अभिभावक)","जिला कल्याण अधिकारी का संदर्भ"] },
    // Eligibility: children under 18 who lost both parents (or sole surviving parent) to COVID-19
    match: (a) => a.age === "below18" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "premat_sc",
    icon: "📙", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "Pre-Matric Scholarship for SC Students (Class 9–10)", hi: "SC छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति (कक्षा 9–10)" },
    benefit: { en: "₹150–₹350/month maintenance allowance + full tuition & school fee reimbursement for SC students in Class 9–10", hi: "कक्षा 9–10 के SC छात्रों को ₹150–₹350/माह रखरखाव भत्ता + पूरी ट्यूशन और स्कूल फीस प्रतिपूर्ति" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 4200,
    apply:   { en: "https://socialjustice.gov.in/schemes", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","Income Certificate (≤₹2.5L/year)","Class 8 Mark Sheet","School Enrollment Certificate","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","आय प्रमाण (≤₹2.5 लाख/वर्ष)","कक्षा 8 मार्कशीट","स्कूल नामांकन प्रमाण","बैंक खाता (आधार लिंक)"] },
    // Eligibility: SC student in Class 9–10 in govt/govt-aided school, family income ≤ ₹2.5L
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "ujala",
    icon: "💡", color: "#D97706", scope: "national",
    ministry: { en: "Ministry of Power (EESL – Energy Efficiency Services Ltd.)", hi: "विद्युत मंत्रालय (EESL – ऊर्जा दक्षता सेवाएं लि.)" },
    name:    { en: "UJALA Scheme (Subsidised LED Bulbs & Appliances)",   hi: "उजाला योजना (सब्सिडीयुक्त LED बल्ब और उपकरण)" },
    benefit: { en: "LED bulbs at ₹70 (market ₹600) · LED tube lights, fans & pumps also subsidised · Up to 80% electricity bill savings", hi: "LED बल्ब ₹70 में (बाज़ार में ₹600) · LED ट्यूब लाइट, पंखे और पंप भी सब्सिडी पर · बिजली बिल में 80% तक बचत" },
    tag:     { en: "Solar / Electricity", hi: "सौर / बिजली" },
    annual: 3600,
    apply:   { en: "ujala.gov.in / Nearest DISCOM Office or EESL outlet", hi: "ujala.gov.in / नजदीकी DISCOM कार्यालय या EESL आउटलेट" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Electricity Bill / Consumer Number","Ration Card (for BPL priority)"],
               hi: ["आधार कार्ड","बिजली बिल / उपभोक्ता नंबर","राशन कार्ड (BPL प्राथमिकता के लिए)"] },
    // Eligibility: all electricity consumers; BPL/low-income households get priority
    match: (a) => true,
  },

  {
    id: "rgnf",
    icon: "🔬", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment (UGC)", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय (UGC)" },
    name:    { en: "Rajiv Gandhi National Fellowship for SC Students (RGNF)", hi: "राजीव गांधी राष्ट्रीय अध्येतावृत्ति – SC छात्र (RGNF)" },
    benefit: { en: "₹31,000/month (JRF, first 2 yrs) · ₹35,000/month (SRF, yrs 3–5) + HRA + contingency grant for M.Phil/PhD", hi: "M.Phil/PhD के लिए ₹31,000/माह (JRF, पहले 2 वर्ष) · ₹35,000/माह (SRF, वर्ष 3–5) + HRA + आकस्मिक अनुदान" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 420000,
    apply:   { en: "ugc.ac.in / scholarships.gov.in", hi: "ugc.ac.in / scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","Admission Letter for M.Phil / PhD","NET / JRF Score Card (or UGC-exempted category proof)","Bank Account (Aadhaar-linked)","Passport Photo"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","M.Phil/PhD प्रवेश पत्र","NET/JRF स्कोर कार्ड (या UGC-छूट श्रेणी)","बैंक खाता (आधार लिंक)","पासपोर्ट फोटो"] },
    // Eligibility: SC student admitted to M.Phil/PhD in UGC-recognised university; no income restriction
    match: (a) => a.who === "student" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "nfobc",
    icon: "🔭", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment (UGC)", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय (UGC)" },
    name:    { en: "National Fellowship for OBC Students (NFOBC)",       hi: "OBC छात्रों के लिए राष्ट्रीय अध्येतावृत्ति (NFOBC)" },
    benefit: { en: "₹31,000/month (JRF) · ₹35,000/month (SRF) + HRA + contingency for OBC M.Phil/PhD students", hi: "OBC M.Phil/PhD छात्रों को ₹31,000/माह (JRF) · ₹35,000/माह (SRF) + HRA + आकस्मिक अनुदान" },
    tag:     { en: "Student / OBC", hi: "छात्र / OBC" },
    annual: 420000,
    apply:   { en: "ugc.ac.in / scholarships.gov.in", hi: "ugc.ac.in / scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","OBC (Non-Creamy Layer) Certificate","Admission Letter for M.Phil / PhD","NET / JRF Score Card","Income Certificate (family income ≤₹8L/year)","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","OBC (गैर-क्रीमी लेयर) प्रमाण पत्र","M.Phil/PhD प्रवेश पत्र","NET/JRF स्कोर कार्ड","आय प्रमाण (परिवार आय ≤₹8 लाख/वर्ष)","बैंक खाता (आधार लिंक)"] },
    // Eligibility: OBC (non-creamy layer) student admitted to M.Phil/PhD, income ≤ ₹8L
    match: (a) => a.who === "student" && ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pms_obc",
    icon: "📒", color: "#D97706", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "Post-Matric Scholarship for OBC Students",           hi: "OBC छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति" },
    benefit: { en: "Maintenance allowance ₹700–₹1,200/month + full tuition & fee reimbursement · All post-Class 10 courses", hi: "₹700–₹1,200/माह रखरखाव भत्ता + पूरी ट्यूशन और शुल्क प्रतिपूर्ति · कक्षा 10 के बाद सभी कोर्स" },
    tag:     { en: "Student / OBC", hi: "छात्र / OBC" },
    annual: 14400,
    apply:   { en: "https://oasis.wb.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","OBC (Non-Creamy Layer) Caste Certificate","Income Certificate (≤₹1.5L/year)","Previous Year Mark Sheet","Institution Admission Letter","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","OBC (गैर-क्रीमी लेयर) जाति प्रमाण पत्र","आय प्रमाण (≤₹1.5 लाख/वर्ष)","पिछले वर्ष की मार्कशीट","संस्था प्रवेश पत्र","बैंक खाता (आधार लिंक)"] },
    // Eligibility: OBC (non-creamy layer) student post Class 10, family income ≤ ₹1.5L
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "working_women_hostel",
    icon: "🏠", color: "#9D174D", scope: "national",
    ministry: { en: "Ministry of Women & Child Development (Mission SAMARTHYA)", hi: "महिला एवं बाल विकास मंत्रालय (मिशन सामर्थ्य)" },
    name:    { en: "Working Women's Hostel Scheme",                      hi: "कामकाजी महिला छात्रावास योजना" },
    benefit: { en: "Subsidised hostel accommodation at ₹1,000–₹1,500/month for working women & students in cities · Children (0–18 yrs) of residents also accommodated", hi: "शहरों में कामकाजी महिलाओं और छात्राओं को ₹1,000–₹1,500/माह सब्सिडी पर छात्रावास · निवासियों के बच्चे (0–18 वर्ष) भी रह सकते हैं" },
    tag:     { en: "Women / SHG", hi: "महिला / SHG" },
    annual: 18000,
    apply:   { en: "wcd.gov.in / State WCD Department / Nearest working women's hostel", hi: "wcd.gov.in / राज्य WCD विभाग / नजदीकी कामकाजी महिला छात्रावास" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Work / Employment Certificate or College Admission Letter","Income Certificate (≤₹50,000/month metros; ≤₹35,000/month other cities)","Address Proof (home town)","Passport Photo"],
               hi: ["आधार कार्ड","कार्य/रोजगार प्रमाण पत्र या कॉलेज प्रवेश पत्र","आय प्रमाण (मेट्रो: ≤₹50,000/माह; अन्य शहर: ≤₹35,000/माह)","गृहनगर का पता प्रमाण","पासपोर्ट फोटो"] },
    // Eligibility: women working/studying away from home in urban/semi-urban areas
    match: (a) => a.who === "women" && ["urban","semi"].includes(a.area),
  },

  {
    id: "swadhar_greh",
    icon: "🆘", color: "#DC2626", scope: "national",
    ministry: { en: "Ministry of Women & Child Development (Mission SAMBAL)", hi: "महिला एवं बाल विकास मंत्रालय (मिशन संबल)" },
    name:    { en: "Swadhar Greh (Shelter for Women in Distress)",       hi: "स्वाधार गृह (कठिन परिस्थितियों में महिलाओं के लिए आश्रय)" },
    benefit: { en: "Free shelter, food, clothing, medical care, legal aid, counselling & skill training for women in difficult circumstances (up to 1 year, extendable)", hi: "कठिन परिस्थितियों में महिलाओं को मुफ्त आश्रय, भोजन, वस्त्र, चिकित्सा, कानूनी सहायता, परामर्श और कौशल प्रशिक्षण (1 वर्ष तक, विस्तारयोग्य)" },
    tag:     { en: "Women / Legal Aid", hi: "महिला / कानूनी सहायता" },
    annual: 0,
    apply:   { en: "181 Helpline / Nearest WCD Office / District Collector", hi: "181 हेल्पलाइन / नजदीकी WCD कार्यालय / जिला कलेक्टर" }, applyType: "offline",
    docs:    { en: ["No documents required in emergency","Aadhaar Card (preferred if available)","Police FIR / Medical Report (if applicable)"],
               hi: ["आपातकाल में कोई दस्तावेज़ जरूरी नहीं","आधार कार्ड (उपलब्ध हो तो)","पुलिस FIR / चिकित्सा रिपोर्ट (लागू हो तो)"] },
    // Eligibility: women victims of trafficking, domestic violence, disaster, released prisoners, destitute — any income/age
    match: (a) => a.who === "women",
  },

  {
    id: "ndp",
    icon: "💉", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare (NHM)", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय (NHM)" },
    name:    { en: "National Dialysis Programme (NDP) – Free Kidney Dialysis", hi: "राष्ट्रीय डायलिसिस कार्यक्रम (NDP) – मुफ्त किडनी डायलिसिस" },
    benefit: { en: "Free dialysis sessions at empanelled district hospitals + ₹500/session transport allowance for BPL patients (saves ₹15,000–₹20,000/month)", hi: "पंजीकृत जिला अस्पतालों में मुफ्त डायलिसिस + BPL मरीजों को ₹500/सत्र यातायात भत्ता (₹15,000–₹20,000/माह की बचत)" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 180000,
    apply:   { en: "nhm.gov.in / Nearest District Hospital with NDP facility", hi: "nhm.gov.in / NDP सुविधा वाले नजदीकी जिला अस्पताल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL / EWS Certificate","Medical Certificate (CKD / kidney failure requiring dialysis)","Doctor's Referral","Bank Account"],
               hi: ["आधार कार्ड","BPL/EWS प्रमाण","चिकित्सा प्रमाण पत्र (CKD/डायलिसिस की आवश्यकता)","डॉक्टर का रेफरल","बैंक खाता"] },
    // Eligibility: all patients requiring dialysis; transport allowance for BPL patients
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "ran",
    icon: "🏥", color: "#B91C1C", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "Rashtriya Arogya Nidhi (RAN) – Life-Threatening Disease Fund", hi: "राष्ट्रीय आरोग्य निधि (RAN) – जानलेवा बीमारी सहायता कोष" },
    benefit: { en: "Financial assistance up to ₹15 Lakh (₹20 Lakh for rare diseases) for BPL patients with life-threatening illness treated at central govt hospitals / AIIMS", hi: "AIIMS/केंद्रीय सरकारी अस्पतालों में जानलेवा बीमारी के BPL मरीजों को ₹15 लाख तक (दुर्लभ बीमारी में ₹20 लाख) वित्तीय सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 1500000,
    apply:   { en: "Through hospital Medical Superintendent / Social Worker at AIIMS / Central Govt. Hospital", hi: "AIIMS/केंद्रीय सरकारी अस्पताल के मेडिकल सुपरिटेंडेंट / सामाजिक कार्यकर्ता के माध्यम से" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL Certificate","Medical Certificate (life-threatening diagnosis)","Treating Doctor's Referral Letter","Estimated Treatment Cost Certificate","Bank Account"],
               hi: ["आधार कार्ड","BPL प्रमाण पत्र","चिकित्सा प्रमाण पत्र (जानलेवा बीमारी)","इलाज करने वाले डॉक्टर का रेफरल पत्र","अनुमानित उपचार लागत प्रमाण पत्र","बैंक खाता"] },
    // Eligibility: BPL patient with life-threatening disease requiring treatment at central govt hospital
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "aif",
    icon: "🏗️", color: "#065F46", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "Agriculture Infrastructure Fund (AIF)",               hi: "कृषि अवसंरचना कोष (AIF)" },
    benefit: { en: "3% interest subvention for 7 years on loans up to ₹2 Crore for post-harvest infra: cold storage, warehouse, sorting/grading, primary processing, assaying labs", hi: "शीत भंडारण, गोदाम, छंटाई/श्रेणीकरण, प्राथमिक प्रसंस्करण केंद्र हेतु ₹2 करोड़ तक के ऋण पर 7 वर्ष के लिए 3% ब्याज सब्सिडी" },
    tag:     { en: "Farmer / Organic", hi: "किसान / जैविक" },
    annual: 0,
    apply:   { en: "agriinfra.dac.gov.in / Nearest NABARD or Scheduled Commercial Bank", hi: "agriinfra.dac.gov.in / नजदीकी NABARD या अनुसूचित वाणिज्यिक बैंक" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN Card","Land Records / Lease Deed","Detailed Project Report (DPR)","Bank Statement (6 months)","Farmer / FPO / SHG Registration Proof","Environmental Clearance (if applicable)"],
               hi: ["आधार और पैन कार्ड","जमीन के कागज़ / पट्टा","विस्तृत परियोजना रिपोर्ट (DPR)","6 महीने बैंक स्टेटमेंट","किसान/FPO/SHG पंजीकरण प्रमाण","पर्यावरण अनुमति (यदि लागू)"] },
    // Eligibility: individual farmers, FPOs, SHGs, cooperatives, agri-entrepreneurs building post-harvest infra
    match: (a) => a.who === "farmer" || (a.who === "business" && ["35to60","18to35"].includes(a.age)),
  },

  {
    id: "khelo_india",
    icon: "🏅", color: "#EA580C", scope: "national",
    ministry: { en: "Ministry of Youth Affairs & Sports (SAI)", hi: "युवा कार्यक्रम एवं खेल मंत्रालय (SAI)" },
    name:    { en: "Khelo India Scholarship (Young Athlete Scheme)",     hi: "खेलो इंडिया छात्रवृत्ति (युवा एथलीट योजना)" },
    benefit: { en: "₹5 Lakh/year for 5 years · Free training at SAI centres + coaching, nutrition, equipment, travel & insurance support", hi: "5 वर्षों के लिए ₹5 लाख/वर्ष · SAI केंद्रों पर मुफ्त प्रशिक्षण + कोचिंग, पोषण, उपकरण, यात्रा और बीमा सहायता" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 500000,
    apply:   { en: "kheloindia.gov.in / State Sports Authority / District Sports Officer", hi: "kheloindia.gov.in / राज्य खेल प्राधिकरण / जिला खेल अधिकारी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof","State / National Level Sports Performance Certificate","School or College Enrollment Certificate","Bank Account (Aadhaar-linked)","Passport Photo","Coach Recommendation Letter"],
               hi: ["आधार कार्ड","आयु प्रमाण","राज्य/राष्ट्रीय स्तर का खेल प्रदर्शन प्रमाण पत्र","स्कूल/कॉलेज नामांकन प्रमाण","बैंक खाता (आधार लिंक)","पासपोर्ट फोटो","कोच अनुशंसा पत्र"] },
    // Eligibility: young athletes under 18 (school) or under 21 (college) with state/national sports achievement
    match: (a) => a.age === "18to35" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "nai_manzil",
    icon: "🌅", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Minority Affairs", hi: "अल्पसंख्यक कार्य मंत्रालय" },
    name:    { en: "Nai Manzil Scheme (Education & Livelihood for Minority Dropouts)", hi: "नई मंजिल योजना (अल्पसंख्यक स्कूल छोड़ने वालों के लिए शिक्षा व रोजगार)" },
    benefit: { en: "Bridge education (Class 10 / 12 equivalent via NIOS) + skill training (9–12 months) · ₹2,500–₹3,000/month stipend + placement support", hi: "ब्रिज शिक्षा (NIOS से कक्षा 10/12 समकक्ष) + कौशल प्रशिक्षण (9–12 माह) · ₹2,500–₹3,000/माह वजीफा + नौकरी सहायता" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 36000,
    apply:   { en: "naimanzil.gov.in / Nearest empanelled NGO or Training Centre", hi: "naimanzil.gov.in / नजदीकी पंजीकृत NGO या प्रशिक्षण केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate (Muslim/Christian/Sikh/Buddhist/Jain/Parsi)","Age Proof (17–35 years)","Last School Certificate (Class 5/8/9 dropout proof)","Bank Account"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र","आयु प्रमाण (17–35 वर्ष)","अंतिम स्कूल प्रमाण पत्र (कक्षा 5/8/9 ड्रॉपआउट प्रमाण)","बैंक खाता"] },
    // Eligibility: minority youth aged 17–35 who dropped out before Class 10, seeking education + livelihood
    match: (a) => ["18to35"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_smile",
    icon: "🌈", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "PM SMILE – Support for Marginalised Individuals for Livelihood & Enterprise", hi: "पीएम SMILE – आजीविका और उद्यम के लिए हाशिए के व्यक्तियों का समर्थन" },
    benefit: { en: "Comprehensive welfare for transgender persons: ABHA / Aadhaar support, free education, PMKVY skill training, PM SVANidhi loan, Ayushman Bharat ₹5L health cover, shelter & livelihood rehabilitation", hi: "ट्रांसजेंडर व्यक्तियों के लिए व्यापक कल्याण: ABHA/आधार सहायता, मुफ्त शिक्षा, PMKVY प्रशिक्षण, PM स्वनिधि लोन, आयुष्मान ₹5 लाख स्वास्थ्य बीमा, आश्रय और आजीविका पुनर्वास" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "smilecdo.dosje.gov.in / District Social Welfare Office / State Transgender Welfare Board", hi: "smilecdo.dosje.gov.in / जिला समाज कल्याण कार्यालय / राज्य ट्रांसजेंडर कल्याण बोर्ड" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Self-identification as Transgender (or District Screening Committee Certificate)","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","ट्रांसजेंडर स्व-पहचान (या जिला स्क्रीनिंग समिति प्रमाण पत्र)","बैंक खाता","पासपोर्ट फोटो"] },
    // Eligibility: transgender persons and persons engaged in begging seeking rehabilitation
    match: (a) => a.who === "general" || ["below1","1to3"].includes(a.income),
  },

  {
    id: "nfsm",
    icon: "🌱", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "National Food Security Mission (NFSM)",              hi: "राष्ट्रीय खाद्य सुरक्षा मिशन (NFSM)" },
    benefit: { en: "Free certified seeds (50% subsidy) + subsidised micronutrients, farm machinery (50%) & irrigation tools for rice, wheat, pulses, oilseeds & commercial crop farmers", hi: "धान, गेहूं, दलहन, तिलहन और व्यावसायिक फसल किसानों को मुफ्त प्रमाणित बीज (50% सब्सिडी) + सब्सिडी पर सूक्ष्म पोषक तत्व, कृषि मशीनरी (50%) और सिंचाई उपकरण" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 5000,
    apply:   { en: "nfsm.gov.in / State Agriculture Department / Local Krishi Vigyan Kendra (KVK)", hi: "nfsm.gov.in / राज्य कृषि विभाग / स्थानीय कृषि विज्ञान केंद्र (KVK)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra / Khatauni)","Bank Account","Farmer Registration (on State Agri Portal)","Caste Certificate (SC/ST for priority)"],
               hi: ["आधार कार्ड","जमीन के कागज़ (खसरा/खतौनी)","बैंक खाता","किसान पंजीकरण (राज्य कृषि पोर्टल पर)","जाति प्रमाण (SC/ST प्राथमिकता के लिए)"] },
    // Eligibility: farmers growing rice, wheat, pulses, oilseeds, or commercial crops; small/marginal farmers prioritised
    match: (a) => a.who === "farmer",
  },

  // ── NEW NATIONAL SCHEMES (added June 2026) ────────────────────────────────

  {
    id: "pmgkay",
    icon: "🆓", color: "#16A34A", scope: "national",
    ministry: { en: "Ministry of Consumer Affairs, Food & Public Distribution", hi: "उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय" },
    name:    { en: "PM Garib Kalyan Anna Yojana (PMGKAY)",               hi: "पीएम गरीब कल्याण अन्न योजना (PMGKAY)" },
    benefit: { en: "5 kg FREE grain per person per month for all NFSA ration card holders · Extended through December 2028", hi: "सभी NFSA राशन कार्ड धारकों को 5 किलो मुफ्त अनाज/व्यक्ति/माह · दिसंबर 2028 तक विस्तारित" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 6000,
    apply:   { en: "Nearest Fair Price Shop (Ration Shop) — automatic for NFSA card holders", hi: "नजदीकी उचित मूल्य की दुकान — NFSA कार्ड धारकों के लिए स्वचालित" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (eKYC seeded)","Ration Card (NFSA / AAY / PHH)"],
               hi: ["आधार कार्ड (eKYC लिंक)","राशन कार्ड (NFSA / AAY / PHH)"] },
    // Eligibility: all NFSA ration card holders (priority households & Antyodaya)
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_janman",
    icon: "🏕️", color: "#065F46", scope: "national",
    ministry: { en: "Ministry of Tribal Affairs", hi: "जनजातीय कार्य मंत्रालय" },
    name:    { en: "PM JANMAN – Janjati Adivasi Nyaya Maha Abhiyan",     hi: "पीएम JANMAN – जनजाति आदिवासी न्याय महा अभियान" },
    benefit: { en: "11 critical interventions for 75 PVTG communities: ₹2.39 Lakh housing, road, piped water, electricity, mobile medical units, Anganwadi centres, livelihood & telecom support", hi: "75 PVTG जनजातीय समुदायों के लिए 11 हस्तक्षेप: ₹2.39 लाख आवास, सड़क, पाइप जल, बिजली, मोबाइल चिकित्सा, आंगनवाड़ी, आजीविका और दूरसंचार सहायता" },
    tag:     { en: "Rural / Housing", hi: "ग्रामीण / आवास" },
    annual: 239000,
    apply:   { en: "tribal.gov.in / State Tribal Welfare Department / District Tribal Officer", hi: "tribal.gov.in / राज्य जनजातीय कल्याण विभाग / जिला जनजातीय अधिकारी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Tribal Caste Certificate (PVTG community)","Ration Card","Land / Residence Proof"],
               hi: ["आधार कार्ड","जनजाति जाति प्रमाण पत्र (PVTG समुदाय)","राशन कार्ड","भूमि / निवास प्रमाण"] },
    // Eligibility: residents of 75 Particularly Vulnerable Tribal Groups in notified tribal sub-plan areas
    match: (a) => a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "nat_bamboo",
    icon: "🎋", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "National Bamboo Mission (NBM)",                       hi: "राष्ट्रीय बांस मिशन (NBM)" },
    benefit: { en: "50% subsidy on bamboo plantation, nurseries & value-addition units · Free planting material + skill training for farmers", hi: "बांस रोपण, नर्सरी और मूल्य वर्धन इकाइयों पर 50% सब्सिडी · मुफ्त पौध सामग्री + किसानों के लिए प्रशिक्षण" },
    tag:     { en: "Farmer / Organic", hi: "किसान / जैविक" },
    annual: 0,
    apply:   { en: "nbm.nic.in / State Nodal Agency / Local Krishi Vigyan Kendra (KVK)", hi: "nbm.nic.in / राज्य नोडल एजेंसी / स्थानीय कृषि विज्ञान केंद्र (KVK)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records (min 0.2 ha)","Bank Account","Farmer Registration (State Agri Portal)","Caste Certificate (SC/ST for priority)"],
               hi: ["आधार कार्ड","जमीन के कागज़ (न्यूनतम 0.2 हेक्टेयर)","बैंक खाता","किसान पंजीकरण (राज्य कृषि पोर्टल)","जाति प्रमाण (SC/ST प्राथमिकता के लिए)"] },
    // Eligibility: farmers with suitable land; SHGs, FPOs and entrepreneurs for processing units
    match: (a) => a.who === "farmer" && a.area === "rural",
  },

  {
    id: "aicte_pragati",
    icon: "👩‍💻", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Education (AICTE)", hi: "शिक्षा मंत्रालय (AICTE)" },
    name:    { en: "AICTE Pragati Scholarship – Girl Students in Technical Education", hi: "AICTE प्रगति छात्रवृत्ति – तकनीकी शिक्षा में छात्राएं" },
    benefit: { en: "₹50,000/year + ₹2,000 contingency for girl students in AICTE-approved diploma/degree programmes", hi: "AICTE-अनुमोदित डिप्लोमा/डिग्री में छात्राओं को ₹50,000/वर्ष + ₹2,000 आकस्मिक अनुदान" },
    tag:     { en: "Student / Women", hi: "छात्र / महिला" },
    annual: 50000,
    apply:   { en: "aicte-india.org / scholarships.gov.in", hi: "aicte-india.org / scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Income Certificate (family income ≤₹8L/year)","AICTE-institution Admission Letter","Class 10 & 12 Mark Sheets","Bank Account (Aadhaar-linked)","Passport Photo"],
               hi: ["आधार कार्ड","आय प्रमाण (पारिवारिक आय ≤₹8 लाख/वर्ष)","AICTE संस्था प्रवेश पत्र","कक्षा 10 और 12 की मार्कशीट","बैंक खाता (आधार लिंक)","पासपोर्ट फोटो"] },
    // Eligibility: girl student in AICTE-approved technical diploma/degree, family income ≤ ₹8L
    match: (a) => (a.who === "women" || a.who === "student") && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "aicte_saksham",
    icon: "🦾", color: "#6366F1", scope: "national",
    ministry: { en: "Ministry of Education (AICTE)", hi: "शिक्षा मंत्रालय (AICTE)" },
    name:    { en: "AICTE Saksham Scholarship – Differently-Abled Students in Technical Education", hi: "AICTE सक्षम छात्रवृत्ति – तकनीकी शिक्षा में दिव्यांग छात्र" },
    benefit: { en: "₹50,000/year + ₹2,000 contingency for differently-abled students (≥40% disability) in AICTE-approved technical diploma/degree programmes", hi: "AICTE-अनुमोदित तकनीकी पाठ्यक्रमों में दिव्यांग छात्रों (≥40% विकलांगता) को ₹50,000/वर्ष + ₹2,000 आकस्मिक अनुदान" },
    tag:     { en: "Student / Disability", hi: "छात्र / दिव्यांगता" },
    annual: 50000,
    apply:   { en: "aicte-india.org / scholarships.gov.in", hi: "aicte-india.org / scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Disability Certificate (≥40% disability)","Income Certificate (family income ≤₹8L/year)","AICTE-institution Admission Letter","Mark Sheets","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","विकलांगता प्रमाण पत्र (≥40%)","आय प्रमाण (≤₹8 लाख/वर्ष)","AICTE संस्था प्रवेश पत्र","मार्कशीट","बैंक खाता (आधार लिंक)"] },
    // Eligibility: student with ≥40% disability in AICTE-approved technical programme, income ≤ ₹8L
    match: (a) => a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "agniveer",
    icon: "🎖️", color: "#374151", scope: "national",
    ministry: { en: "Ministry of Defence", hi: "रक्षा मंत्रालय" },
    name:    { en: "Agnipath – Agniveer Recruitment Scheme",              hi: "अग्निपथ – अग्निवीर भर्ती योजना" },
    benefit: { en: "4-year defence service: ₹30,000–₹40,000/month · ₹11.71 Lakh Seva Nidhi corpus on exit · 25% retained permanently · Priority in central govt. jobs & entrepreneur support on exit", hi: "4 वर्ष की रक्षा सेवा: ₹30,000–₹40,000/माह · बाहर निकलने पर ₹11.71 लाख सेवा निधि · 25% स्थायी · केंद्र सरकार की नौकरियों में प्राथमिकता" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 360000,
    apply:   { en: "joinindianarmy.nic.in / joinindiannavy.gov.in / agnipathvayu.cdac.in", hi: "joinindianarmy.nic.in / joinindiannavy.gov.in / agnipathvayu.cdac.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 10 & 12 Mark Sheet + Certificate","Medical Fitness Certificate","Age Proof (17.5–21 years)","Physical Fitness Certificate","Character Certificate","Bank Account"],
               hi: ["आधार कार्ड","कक्षा 10/12 मार्कशीट और प्रमाण पत्र","चिकित्सा स्वास्थ्य प्रमाण पत्र","आयु प्रमाण (17.5–21 वर्ष)","शारीरिक फिटनेस प्रमाण पत्र","चरित्र प्रमाण पत्र","बैंक खाता"] },
    // Eligibility: Indian youth aged 17.5–21 years, physically & medically fit, Class 10/12 pass
    match: (a) => a.age === "18to35" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "sbm_urban2",
    icon: "🧹", color: "#0284C7", scope: "national",
    ministry: { en: "Ministry of Housing & Urban Affairs", hi: "आवासन और शहरी कार्य मंत्रालय" },
    name:    { en: "Swachh Bharat Mission – Urban 2.0 (Individual Toilet Grant)", hi: "स्वच्छ भारत मिशन – शहरी 2.0 (व्यक्तिगत शौचालय अनुदान)" },
    benefit: { en: "₹12,000–₹25,000 grant for toilet construction / renovation at urban households · ODF++ & Garbage-Free City certification for qualifying cities", hi: "शहरी घरों में शौचालय निर्माण/नवीनीकरण के लिए ₹12,000–₹25,000 अनुदान · ODF++ और कचरा-मुक्त शहर प्रमाणन" },
    tag:     { en: "Sanitation", hi: "स्वच्छता" },
    annual: 12000,
    apply:   { en: "sbmurban.gov.in / Nearest Urban Local Body (ULB / Municipal Corporation / Nagar Palika)", hi: "sbmurban.gov.in / नजदीकी शहरी स्थानीय निकाय (ULB / नगर निगम / नगर पालिका)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card","Property Documents / Rent Agreement","No-Toilet Declaration","Bank Account"],
               hi: ["आधार कार्ड","राशन कार्ड","संपत्ति दस्तावेज़ / किराया समझौता","शौचालय न होने की स्व-घोषणा","बैंक खाता"] },
    // Eligibility: urban households without functional toilet, BPL/EWS priority
    match: (a) => ["urban","semi"].includes(a.area) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "ntmhp",
    icon: "🧠", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare (NIMHANS)", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय (NIMHANS)" },
    name:    { en: "Tele-MANAS – National Tele Mental Health Programme",  hi: "Tele-MANAS – राष्ट्रीय टेली मानसिक स्वास्थ्य कार्यक्रम" },
    benefit: { en: "FREE 24×7 mental health support · Call 14416 or 1800-599-0019 · Tele-counselling by psychiatrists & psychologists via 53 national centres", hi: "मुफ्त 24×7 मानसिक स्वास्थ्य सहायता · 14416 या 1800-599-0019 पर कॉल करें · 53 राष्ट्रीय केंद्रों द्वारा मनोचिकित्सकों/मनोवैज्ञानिकों से परामर्श" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "Call 14416 or 1800-599-0019 (free, 24×7) · nimhans.ac.in", hi: "14416 या 1800-599-0019 पर कॉल करें (मुफ्त, 24×7) · nimhans.ac.in" }, applyType: "offline",
    docs:    { en: ["No registration required — just call the helpline","Aadhaar (optional, only for referral follow-up)"],
               hi: ["पंजीकरण की आवश्यकता नहीं — बस हेल्पलाइन पर कॉल करें","आधार (वैकल्पिक, रेफरल फॉलो-अप के लिए)"] },
    // Eligibility: any person in need of mental health support — no income or age restriction
    match: (a) => true,
  },

  {
    id: "usttad",
    icon: "🧵", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Minority Affairs", hi: "अल्पसंख्यक कार्य मंत्रालय" },
    name:    { en: "USTTAD – Upgrading Skills & Training in Traditional Arts/Crafts (Minority Artisans)", hi: "उस्ताद – पारंपरिक कलाओं/शिल्पों में कौशल उन्नयन (अल्पसंख्यक कारीगर)" },
    benefit: { en: "Free 3–6 month skill upgrade training in traditional crafts for minority artisans · ₹1,000–₹1,500/month stipend + free tool kit + certification + market linkage support", hi: "अल्पसंख्यक कारीगरों के लिए मुफ्त 3–6 माह का पारंपरिक शिल्प कौशल उन्नयन · ₹1,000–₹1,500/माह वजीफा + मुफ्त टूल किट + प्रमाण पत्र + बाज़ार लिंकेज" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 18000,
    apply:   { en: "usttad.amitsha.gov.in / State Minorities Commission / Nearest empanelled NGO or Training Centre", hi: "usttad.amitsha.gov.in / राज्य अल्पसंख्यक आयोग / नजदीकी पंजीकृत NGO या प्रशिक्षण केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate (Muslim/Christian/Sikh/Buddhist/Jain/Parsi)","Age Proof (14–45 years)","Educational Certificate (Class 5 minimum)","Bank Account","Proof of Craft/Trade Involvement"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र","आयु प्रमाण (14–45 वर्ष)","शैक्षणिक प्रमाण (न्यूनतम कक्षा 5)","बैंक खाता","पारंपरिक शिल्प/व्यापार में संलग्नता का प्रमाण"] },
    // Eligibility: minority community artisan aged 14–45, engaged in traditional craft/trade
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "emrs",
    icon: "🏫", color: "#065F46", scope: "national",
    ministry: { en: "Ministry of Tribal Affairs", hi: "जनजातीय कार्य मंत्रालय" },
    name:    { en: "Eklavya Model Residential Schools (EMRS)",             hi: "एकलव्य मॉडल आवासीय विद्यालय (EMRS)" },
    benefit: { en: "FREE quality residential education (Class 6–12) for tribal students · Free food, accommodation, uniforms, books, sports facilities & digital access", hi: "जनजातीय छात्रों के लिए मुफ्त गुणवत्ता आवासीय शिक्षा (कक्षा 6–12) · मुफ्त भोजन, आवास, वर्दी, किताबें, खेल सुविधाएं और डिजिटल पहुंच" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 120000,
    apply:   { en: "emrs.tribal.gov.in / Nearest EMRS / District Tribal Welfare Officer", hi: "emrs.tribal.gov.in / नजदीकी EMRS / जिला जनजातीय कल्याण अधिकारी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","ST Caste Certificate","Class 5 Mark Sheet (for Class 6 admission)","Domicile Certificate (Tribal Sub-Plan area)","BPL / Income Certificate","Passport Photo"],
               hi: ["आधार कार्ड","ST जाति प्रमाण पत्र","कक्षा 5 की मार्कशीट (कक्षा 6 प्रवेश के लिए)","अधिवास प्रमाण पत्र (जनजातीय उप-योजना क्षेत्र)","BPL/आय प्रमाण पत्र","पासपोर्ट फोटो"] },
    // Eligibility: ST student in Class 5 (for Class 6 entry), resident of tribal sub-plan area
    match: (a) => a.who === "student" && a.area === "rural" && ["below1","1to3"].includes(a.income),
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
