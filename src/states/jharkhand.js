// Jharkhand — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "jharkhand_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const JHARKHAND_SCHEMES = [

  // ── 1. HOUSING ──────────────────────────────────────────────────────────────
  {
    id: "jharkhand_abua_awas",
    icon: "🏠", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Rural Dev. Dept.", hi: "झारखंड ग्रामीण विकास विभाग" },
    name:    { en: "Abua Awas Yojana (Jharkhand)",                    hi: "अबुआ आवास योजना (झारखंड)" },
    benefit: { en: "₹2 Lakh grant for 3-room pucca house construction", hi: "3 कमरों के पक्के मकान के लिए ₹2 लाख अनुदान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 200000,
    apply:   { en: "https://abuaawasyojana.jharkhand.gov.in", hi: "abuaawasyojana.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Land Ownership Proof", "Bank Account", "No-Pucca House Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड", "जमीन का प्रमाण", "बैंक खाता", "पक्का मकान न होने का प्रमाण"] },
    match: (a) => a.state === "Jharkhand" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  },

  // ── 2. WOMEN ────────────────────────────────────────────────────────────────
  {
    id: "jharkhand_maiya_samman",
    icon: "👩", color: "#BE185D", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Women & Child Dev. Dept.", hi: "झारखंड महिला एवं बाल विकास विभाग" },
    name:    { en: "Mukhyamantri Maiya Samman Yojana",                         hi: "मुख्यमंत्री मैया सम्मान योजना" },
    benefit: { en: "₹2,500/month direct bank transfer to women aged 18–50 years", hi: "18–50 आयु की महिलाओं को ₹2,500/माह सीधे बैंक में" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 30000,
    apply:   { en: "https://jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof (18–50)", "Bank Account (Aadhaar-linked)", "Ration Card"],
               hi: ["आधार कार्ड", "आयु प्रमाण (18–50)", "बैंक खाता (आधार से लिंक)", "राशन कार्ड"] },
    match: (a) => a.state === "Jharkhand" && a.who === "women" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "jharkhand_widow_pension",
    icon: "🤝", color: "#6B21A8", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Social Welfare", hi: "झारखंड समाज कल्याण विभाग" },
    name:    { en: "Jharkhand Widow Pension Yojana",                      hi: "झारखंड विधवा पेंशन योजना" },
    benefit: { en: "₹600/month pension for widows from BPL/low-income families", hi: "BPL/निम्न आय परिवार की विधवाओं को ₹600/माह पेंशन" },
    tag:     { en: "Women / Pension", hi: "महिला / पेंशन" },
    annual: 7200,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "BPL Ration Card", "Bank Account", "Age Proof"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "बीपीएल राशन कार्ड", "बैंक खाता", "आयु प्रमाण"] },
    match: (a) => a.state === "Jharkhand" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "jharkhand_phulo_jhano",
    icon: "🌺", color: "#DB2777", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Women & Child Dev. Dept.", hi: "झारखंड महिला एवं बाल विकास विभाग" },
    name:    { en: "Phulo Jhano Ashirwad Yojana",                                         hi: "फूलो झानो आशीर्वाद योजना" },
    benefit: { en: "Self-employment loan + skill training for women leaving liquor trade", hi: "हड़िया-दारू व्यापार छोड़ने वाली महिलाओं को स्वरोजगार ऋण व कौशल प्रशिक्षण" },
    tag:     { en: "Women / Livelihood", hi: "महिला / आजीविका" },
    annual: 0,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Bank Account", "Self-Declaration Letter", "Village Panchayat Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड", "बैंक खाता", "स्व-घोषणा पत्र", "ग्राम पंचायत प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && a.who === "women" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── 3. EDUCATION ────────────────────────────────────────────────────────────
  {
    id: "jharkhand_savitribai_kishori",
    icon: "📚", color: "#7C3AED", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Women & Child Dev. Dept.", hi: "झारखंड महिला एवं बाल विकास विभाग" },
    name:    { en: "Savitribai Phule Kishori Samridhi Yojana",                                          hi: "सावित्रीबाई फुले किशोरी समृद्धि योजना" },
    benefit: { en: "₹2,500–₹20,000 in installments for girl students from Class 8 through college", hi: "कक्षा 8 से स्नातक तक बालिकाओं को ₹2,500–₹20,000 की किस्तों में सहायता" },
    tag:     { en: "Education / Girl Child", hi: "शिक्षा / बालिका" },
    annual: 10000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "School / College Enrollment Proof", "Bank Account", "Ration Card", "Caste Certificate (if applicable)"],
               hi: ["आधार कार्ड", "विद्यालय / कॉलेज नामांकन प्रमाण", "बैंक खाता", "राशन कार्ड", "जाति प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && ["below18","18to35"].includes(a.age),
  },

  {
    id: "jharkhand_sarthi",
    icon: "🎓", color: "#1D4ED8", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Higher & Technical Education", hi: "झारखंड उच्च एवं तकनीकी शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Sarthi Yojana",                                             hi: "मुख्यमंत्री सारथी योजना" },
    benefit: { en: "Free coaching for JPSC, JSSC, UPSC & banking exams for Jharkhand youth", hi: "JPSC, JSSC, UPSC व बैंकिंग परीक्षाओं की निःशुल्क कोचिंग" },
    tag:     { en: "Education / Youth", hi: "शिक्षा / युवा" },
    annual: 0,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jharkhand Domicile Certificate", "Educational Certificates", "Income Certificate"],
               hi: ["आधार कार्ड", "झारखंड स्थायी निवास प्रमाण", "शैक्षिक प्रमाण पत्र", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && a.age === "18to35",
  },

  // ── 4. FARMER / LIVELIHOOD ──────────────────────────────────────────────────
  {
    id: "jharkhand_mmkay",
    icon: "🌾", color: "#15803D", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Agriculture", hi: "झारखंड कृषि विभाग" },
    name:    { en: "Mukhyamantri Krishi Ashirwad Yojana (MMKAY)",                          hi: "मुख्यमंत्री कृषि आशीर्वाद योजना (MMKAY)" },
    benefit: { en: "₹5,000/acre/year for small & marginal farmers (up to 5 acres)", hi: "छोटे व सीमांत किसानों को ₹5,000/एकड़/वर्ष (5 एकड़ तक)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 25000,
    apply:   { en: "https://mmkay.jharkhand.gov.in", hi: "mmkay.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (Khatiyan / Khasra)", "Bank Account (Aadhaar-linked)", "Ration Card"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (खतियान / खसरा)", "बैंक खाता (आधार से लिंक)", "राशन कार्ड"] },
    match: (a) => a.state === "Jharkhand" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "jharkhand_birsa_harit_gram",
    icon: "🌳", color: "#166534", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Rural Dev. & MGNREGA Dept.", hi: "झारखंड ग्रामीण विकास एवं मनरेगा विभाग" },
    name:    { en: "Birsa Harit Gram Yojana",                                         hi: "बिरसा हरित ग्राम योजना" },
    benefit: { en: "100 fruit-bearing plants per rural household + MGNREGA wage employment", hi: "ग्रामीण परिवारों को 100 फलदार पौधे + मनरेगा मजदूरी" },
    tag:     { en: "Livelihood / Farmer", hi: "आजीविका / किसान" },
    annual: 10000,
    apply:   { en: "mgnrega.nic.in", hi: "mgnrega.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "MGNREGA Job Card", "Ration Card", "Land / Private Land Proof"],
               hi: ["आधार कार्ड", "मनरेगा जॉब कार्ड", "राशन कार्ड", "जमीन का प्रमाण"] },
    match: (a) => a.state === "Jharkhand" && a.area === "rural" && ["farmer","general"].includes(a.who) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "jharkhand_pashudhan",
    icon: "🐄", color: "#92400E", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Animal Husbandry", hi: "झारखंड पशुपालन विभाग" },
    name:    { en: "Mukhyamantri Pashudhan Vikas Yojana",                           hi: "मुख्यमंत्री पशुधन विकास योजना" },
    benefit: { en: "50%–75% subsidy on purchase of cattle / goat / poultry + free livestock insurance", hi: "पशु (गाय/बकरी/मुर्गी) खरीद पर 50%–75% सब्सिडी + निःशुल्क पशु बीमा" },
    tag:     { en: "Livestock / Farmer", hi: "पशुपालन / किसान" },
    annual: 30000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Bank Account", "Caste Certificate", "Land / Village Domicile Proof"],
               hi: ["आधार कार्ड", "राशन कार्ड", "बैंक खाता", "जाति प्रमाण पत्र", "जमीन / गाँव का निवास प्रमाण"] },
    match: (a) => a.state === "Jharkhand" && ["farmer","general"].includes(a.who) && a.area === "rural" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── 5. HEALTH ───────────────────────────────────────────────────────────────
  {
    id: "jharkhand_abjkay",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Health & Family Welfare", hi: "झारखंड स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Ayushman Bharat – Jharkhand Kranti Arogya Yojana (AB-JKAY)", hi: "आयुष्मान भारत – झारखंड क्रांति आरोग्य योजना (AB-JKAY)" },
    benefit: { en: "₹5 Lakh/year free hospital treatment · 740+ empanelled hospitals in Jharkhand",  hi: "₹5 लाख/वर्ष मुफ्त अस्पताल उपचार · 740+ सूचीबद्ध अस्पताल" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "https://abjkay.jharkhand.gov.in", hi: "abjkay.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card / Family ID", "Income Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड / परिवार पहचान पत्र", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && ["below1","1to3"].includes(a.income),
  },

  // ── 6. SENIOR / PENSION ─────────────────────────────────────────────────────
  {
    id: "jharkhand_state_pension",
    icon: "👴", color: "#D97706", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Social Welfare", hi: "झारखंड समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Rajya Vriddhawastha Pension Yojana",               hi: "मुख्यमंत्री राज्य वृद्धावस्था पेंशन योजना" },
    benefit: { en: "₹1,000/month state pension for senior citizens (60+) not covered under NSAP", hi: "NSAP से बाहर के वरिष्ठ नागरिकों (60+) को ₹1,000/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 12000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Ration Card", "Bank Account", "Jharkhand Domicile Certificate"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "राशन कार्ड", "बैंक खाता", "झारखंड निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  // ── 7. YOUTH / EMPLOYMENT ───────────────────────────────────────────────────
  {
    id: "jharkhand_protsahan_yojana",
    icon: "💼", color: "#0F766E", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Labour, Employment & Training", hi: "झारखंड श्रम, नियोजन एवं प्रशिक्षण विभाग" },
    name:    { en: "Mukhyamantri Protsahan Yojana (Berojgari Bhatta)",                          hi: "मुख्यमंत्री प्रोत्साहन योजना (बेरोजगारी भत्ता)" },
    benefit: { en: "₹5,000/month allowance for educated unemployed youth registered with Employment Exchange", hi: "रोजगार कार्यालय में पंजीकृत शिक्षित बेरोजगार युवाओं को ₹5,000/माह भत्ता" },
    tag:     { en: "Youth / Employment", hi: "युवा / रोजगार" },
    annual: 60000,
    apply:   { en: "https://rojgar.jharkhand.gov.in", hi: "rojgar.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jharkhand Domicile Certificate", "12th / Graduation Certificate", "Employment Exchange Registration", "Bank Account", "Income Certificate"],
               hi: ["आधार कार्ड", "झारखंड स्थायी निवास प्रमाण", "12वीं / स्नातक प्रमाण पत्र", "रोजगार कार्यालय पंजीकरण", "बैंक खाता", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && ["student","general"].includes(a.who) && a.age === "18to35" && ["below1","1to3"].includes(a.income),
  },

  // ── 8. CROP INSURANCE ───────────────────────────────────────────────────────
  {
    id: "jharkhand_jrfry",
    icon: "🌧️", color: "#065F46", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Agriculture", hi: "झारखंड कृषि विभाग" },
    name:    { en: "Jharkhand Rajya Fasal Rahat Yojana (JRFRY)",                               hi: "झारखंड राज्य फसल राहत योजना (JRFRY)" },
    benefit: { en: "Compensation for crop loss due to drought, flood or natural calamity · No premium from farmer", hi: "सूखा, बाढ़ या प्राकृतिक आपदा से फसल नुकसान पर मुआवज़ा · किसान से कोई प्रीमियम नहीं" },
    tag:     { en: "Farmer / Crop Insurance", hi: "किसान / फसल बीमा" },
    annual: 0,
    apply:   { en: "https://jrfry.jharkhand.gov.in", hi: "jrfry.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (Khatiyan / Khasra)", "Bank Account (Aadhaar-linked)", "Ration Card", "Sowing Certificate from Patwari"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (खतियान / खसरा)", "बैंक खाता (आधार से लिंक)", "राशन कार्ड", "पटवारी से बुवाई प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && a.who === "farmer",
  },

  // ── 9. DISABILITY ───────────────────────────────────────────────────────────
  {
    id: "jharkhand_viklang_pension",
    icon: "♿", color: "#475569", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Social Welfare", hi: "झारखंड समाज कल्याण विभाग" },
    name:    { en: "Jharkhand Viklang Pension Yojana",                            hi: "झारखंड विकलांग पेंशन योजना" },
    benefit: { en: "₹600/month pension for persons with 40%+ disability from BPL families", hi: "40% या अधिक विकलांगता वाले BPL परिवार के व्यक्तियों को ₹600/माह पेंशन" },
    tag:     { en: "Disability / Pension", hi: "विकलांगता / पेंशन" },
    annual: 7200,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+) from CMO", "BPL Ration Card", "Bank Account", "Jharkhand Domicile Certificate"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+) CMO से", "बीपीएल राशन कार्ड", "बैंक खाता", "झारखंड निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && ["below1","1to3"].includes(a.income),
  },

  // ── 10. SC / ST SCHOLARSHIP ─────────────────────────────────────────────────
  {
    id: "jharkhand_ekalyan_scholarship",
    icon: "🎓", color: "#8B0000", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Welfare Dept. (SC / ST / BC / Minority)", hi: "झारखंड कल्याण विभाग (SC / ST / BC / अल्पसंख्यक)" },
    name:    { en: "Jharkhand E-Kalyan Post-Matric Scholarship",                               hi: "झारखंड ई-कल्याण पोस्ट-मैट्रिक छात्रवृत्ति" },
    benefit: { en: "₹15,000–₹38,000/year covering tuition, hostel & maintenance for SC/ST/BC students", hi: "SC/ST/BC छात्रों के लिए ट्यूशन, छात्रावास व रख-रखाव हेतु ₹15,000–₹38,000/वर्ष" },
    tag:     { en: "Education / SC ST", hi: "शिक्षा / SC ST" },
    annual: 25000,
    apply:   { en: "ekalyan.jharkhand.gov.in", hi: "ekalyan.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/BC)", "10th Mark Sheet", "College / Institution Admission Proof", "Income Certificate (below ₹2.5L)", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/BC)", "10वीं अंकपत्र", "कॉलेज / संस्था प्रवेश प्रमाण", "आय प्रमाण पत्र (₹2.5 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── 11. WOMEN / SHG ─────────────────────────────────────────────────────────
  {
    id: "jharkhand_didi_badi",
    icon: "🥦", color: "#4D7C0F", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Rural Dev. Dept. (JSLPS)", hi: "झारखंड ग्रामीण विकास विभाग (JSLPS)" },
    name:    { en: "Didi Badi Yojana",                                                         hi: "दीदी बाड़ी योजना" },
    benefit: { en: "Free vegetable seeds, saplings & training for kitchen garden at home · Improves family nutrition", hi: "घर पर पोषण वाटिका के लिए मुफ्त सब्जी बीज, पौधे व प्रशिक्षण · परिवार के पोषण में सुधार" },
    tag:     { en: "Women / Nutrition", hi: "महिला / पोषण" },
    annual: 0,
    apply:   { en: "jslps.jharkhand.gov.in", hi: "jslps.jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "SHG Membership Proof (preferred)", "Bank Account"],
               hi: ["आधार कार्ड", "राशन कार्ड", "SHG सदस्यता प्रमाण (प्राथमिकता)", "बैंक खाता"] },
    match: (a) => a.state === "Jharkhand" && a.who === "women" && a.area === "rural",
  },

  // ── 12. TRIBAL LIVELIHOOD ───────────────────────────────────────────────────
  {
    id: "jharkhand_johar",
    icon: "🤲", color: "#B45309", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Rural Dev. Dept. (JSLPS)", hi: "झारखंड ग्रामीण विकास विभाग (JSLPS)" },
    name:    { en: "Jharkhand Opportunities for Harnessing Rural Growth (JOHAR)",                         hi: "झारखंड ऑपर्च्यूनिटीज़ फॉर हार्नेसिंग रूरल ग्रोथ (JOHAR)" },
    benefit: { en: "₹15,000 seed capital per SHG + skill training + market linkage for tribal & rural women", hi: "SHG को ₹15,000 बीज पूंजी + कौशल प्रशिक्षण + बाज़ार से जोड़ाव · आदिवासी व ग्रामीण महिलाओं के लिए" },
    tag:     { en: "Tribal / Livelihood", hi: "आदिवासी / आजीविका" },
    annual: 15000,
    apply:   { en: "jslps.jharkhand.gov.in", hi: "jslps.jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "SHG Registration Certificate", "Bank Account (SHG)", "Caste Certificate (ST preferred)"],
               hi: ["आधार कार्ड", "राशन कार्ड", "SHG पंजीकरण प्रमाण पत्र", "बैंक खाता (SHG)", "जाति प्रमाण पत्र (ST प्राथमिकता)"] },
    match: (a) => a.state === "Jharkhand" && a.who === "women" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── 13. MARRIAGE ASSISTANCE ─────────────────────────────────────────────────
  {
    id: "jharkhand_kanyadan",
    icon: "💐", color: "#BE185D", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Social Welfare", hi: "झारखंड समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Kanyadan Yojana",                                        hi: "मुख्यमंत्री कन्यादान योजना" },
    benefit: { en: "₹30,000 one-time marriage assistance for daughters of BPL families",  hi: "BPL परिवार की बेटी के विवाह के लिए ₹30,000 एकमुश्त सहायता" },
    tag:     { en: "Women / Marriage", hi: "महिला / विवाह" },
    annual: 30000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (bride & groom)", "BPL Ration Card", "Age Proof of Bride (18+)", "Bank Account", "Marriage Registration Certificate", "Income Certificate"],
               hi: ["आधार कार्ड (वर-वधू)", "बीपीएल राशन कार्ड", "वधू का आयु प्रमाण (18+)", "बैंक खाता", "विवाह पंजीकरण प्रमाण पत्र", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && a.who === "women" && ["18to35"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  // ── 14. CONSTRUCTION WORKERS ────────────────────────────────────────────────
  {
    id: "jharkhand_bocw",
    icon: "🏗️", color: "#EA580C", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Building & Other Construction Workers Welfare Board", hi: "झारखंड भवन एवं अन्य निर्माण श्रमिक कल्याण बोर्ड" },
    name:    { en: "Jharkhand Nirman Shramik Welfare Scheme (BOCW)",                                              hi: "झारखंड निर्माण श्रमिक कल्याण योजना (BOCW)" },
    benefit: { en: "₹5,000 tool grant + children's scholarship + ₹20,000 maternity benefit for registered construction workers", hi: "पंजीकृत निर्माण मजदूरों को ₹5,000 औज़ार अनुदान + बच्चों की छात्रवृत्ति + ₹20,000 प्रसूति लाभ" },
    tag:     { en: "Labour / Construction", hi: "श्रमिक / निर्माण" },
    annual: 5000,
    apply:   { en: "bocboard.jharkhand.gov.in", hi: "bocboard.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BOCW Registration Card (Labour Card)", "90-day Work Certificate from Contractor", "Bank Account", "Passport Photo"],
               hi: ["आधार कार्ड", "BOCW पंजीकरण कार्ड (लेबर कार्ड)", "ठेकेदार से 90 दिन कार्य प्रमाण पत्र", "बैंक खाता", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jharkhand" && ["general","business"].includes(a.who) && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── 15. IRRIGATION ──────────────────────────────────────────────────────────
  {
    id: "jharkhand_nalkoop",
    icon: "💧", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Agriculture (Minor Irrigation)", hi: "झारखंड कृषि विभाग (लघु सिंचाई)" },
    name:    { en: "Jharkhand Mukhyamantri Niji Nalkoop Yojana",                          hi: "मुख्यमंत्री निजी नलकूप योजना" },
    benefit: { en: "50% subsidy (up to ₹36,000) on shallow tubewell / borewell installation for irrigation", hi: "सिंचाई के लिए उथले नलकूप / बोरवेल पर 50% सब्सिडी (₹36,000 तक)" },
    tag:     { en: "Farmer / Irrigation", hi: "किसान / सिंचाई" },
    annual: 36000,
    apply:   { en: "agri.jharkhand.gov.in", hi: "agri.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (Khatiyan)", "Bank Account", "Geo-tagged Photo of Land", "Income Certificate"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (खतियान)", "बैंक खाता", "जमीन की जियो-टैग फोटो", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── 16. SKILL TRAINING ──────────────────────────────────────────────────────
  {
    id: "jharkhand_ddugky",
    icon: "🔧", color: "#1D4ED8", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Skill Development Mission (DDU-GKY)", hi: "झारखंड कौशल विकास मिशन (DDU-GKY)" },
    name:    { en: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (Jharkhand)",           hi: "दीन दयाल उपाध्याय ग्रामीण कौशल्या योजना (झारखंड)" },
    benefit: { en: "Free residential skill training (3–12 months) + guaranteed placement · ₹1,000/month stipend during training", hi: "3–12 माह का मुफ्त आवासीय कौशल प्रशिक्षण + गारंटीड नौकरी · प्रशिक्षण के दौरान ₹1,000/माह वजीफा" },
    tag:     { en: "Skill Training / Youth", hi: "कौशल प्रशिक्षण / युवा" },
    annual: 12000,
    apply:   { en: "jsdm.jharkhand.gov.in", hi: "jsdm.jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jharkhand Domicile Certificate", "BPL / MGNREGA Job Card (preferred)", "8th Pass Certificate (minimum)", "Bank Account", "Passport Photo"],
               hi: ["आधार कार्ड", "झारखंड निवास प्रमाण", "BPL / मनरेगा जॉब कार्ड (प्राथमिकता)", "8वीं उत्तीर्ण प्रमाण पत्र (न्यूनतम)", "बैंक खाता", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jharkhand" && ["student","general"].includes(a.who) && ["18to35"].includes(a.age) && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── 17. FOREST RIGHTS / TRIBAL ──────────────────────────────────────────────
  {
    id: "jharkhand_abua_bir_dishom",
    icon: "🌲", color: "#065F46", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Scheduled Tribe, SC & Minority Welfare", hi: "झारखंड अनुसूचित जनजाति, SC एवं अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Abua Bir Dishom Abhiyan (Forest Rights)",                                              hi: "अबुआ बीर दिशोम अभियान (वन अधिकार)" },
    benefit: { en: "Individual & community forest land titles (pattas) + forest produce rights for tribal families under FRA 2006", hi: "FRA 2006 के तहत आदिवासी परिवारों को व्यक्तिगत व सामुदायिक वन भूमि पट्टे + वन उपज अधिकार" },
    tag:     { en: "Tribal / Land Rights", hi: "आदिवासी / भूमि अधिकार" },
    annual: 0,
    apply:   { en: "tribal.jharkhand.gov.in", hi: "tribal.jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST Caste Certificate", "Proof of Forest Land Occupation (pre-2005)", "Village Gram Sabha Resolution", "Passport Photo", "Ration Card"],
               hi: ["आधार कार्ड", "ST जाति प्रमाण पत्र", "वन भूमि पर काबिज़गी का प्रमाण (2005 से पूर्व)", "ग्राम सभा का प्रस्ताव", "पासपोर्ट फोटो", "राशन कार्ड"] },
    match: (a) => a.state === "Jharkhand" && ["farmer","general"].includes(a.who) && a.area === "rural",
  },

  // ── 18. DISASTER RELIEF ─────────────────────────────────────────────────────
  {
    id: "jharkhand_sukhad_rahat",
    icon: "🌦️", color: "#0F766E", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Agriculture & Farmers Welfare", hi: "झारखंड कृषि एवं किसान कल्याण विभाग" },
    name:    { en: "Mukhyamantri Sukhad Rahat Yojana",                                              hi: "मुख्यमंत्री सुखाड़ राहत योजना" },
    benefit: { en: "₹3,500/acre compensation to farmers for crop loss due to drought or flood", hi: "सूखा या बाढ़ से फसल नष्ट होने पर किसानों को ₹3,500/एकड़ मुआवज़ा" },
    tag:     { en: "Farmer / Disaster Relief", hi: "किसान / आपदा राहत" },
    annual: 3500,
    apply:   { en: "msry.jharkhand.gov.in", hi: "msry.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (Khatiyan / Khasra)", "Bank Account (Aadhaar-linked)", "Ration Card", "Crop Loss Verification by Patwari"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (खतियान / खसरा)", "बैंक खाता (आधार से लिंक)", "राशन कार्ड", "पटवारी द्वारा फसल नुकसान सत्यापन"] },
    match: (a) => a.state === "Jharkhand" && a.who === "farmer",
  },

  // ── 19. SUBSIDISED SEEDS ────────────────────────────────────────────────────
  {
    id: "jharkhand_beej_vitran",
    icon: "🌱", color: "#15803D", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Agriculture (JSAMB)", hi: "झारखंड कृषि विभाग (JSAMB)" },
    name:    { en: "Jharkhand Rajya Beej Vitran Yojana",                                   hi: "झारखंड राज्य बीज वितरण योजना" },
    benefit: { en: "50% subsidy on certified seeds (paddy, wheat, pulses, oilseeds) supplied through govt. outlets", hi: "सरकारी केंद्रों से धान, गेहूं, दलहन, तिलहन के प्रमाणित बीजों पर 50% सब्सिडी" },
    tag:     { en: "Farmer / Seeds", hi: "किसान / बीज" },
    annual: 5000,
    apply:   { en: "agri.jharkhand.gov.in", hi: "agri.jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (Khatiyan)", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (खतियान)", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Jharkhand" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── 20. FISHERMEN WELFARE ───────────────────────────────────────────────────
  {
    id: "jharkhand_matsyajivi",
    icon: "🐟", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Animal Husbandry & Fisheries", hi: "झारखंड पशुपालन एवं मत्स्य विभाग" },
    name:    { en: "Jharkhand Matsyajivi Kalyan Yojana",                                      hi: "झारखंड मत्स्यजीवी कल्याण योजना" },
    benefit: { en: "50% subsidy on fishing nets, boats & equipment + accident insurance for registered fishermen", hi: "पंजीकृत मछुआरों को मछली पकड़ने के जाल, नाव और उपकरण पर 50% सब्सिडी + दुर्घटना बीमा" },
    tag:     { en: "Fishermen / Livelihood", hi: "मछुआरे / आजीविका" },
    annual: 10000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Fisherman Registration Certificate", "Ration Card", "Bank Account", "Passport Photo"],
               hi: ["आधार कार्ड", "मछुआरा पंजीकरण प्रमाण पत्र", "राशन कार्ड", "बैंक खाता", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jharkhand" && ["farmer","general"].includes(a.who) && ["below1","1to3"].includes(a.income),
  },

  // ── 21. MINORITY SCHOLARSHIP ────────────────────────────────────────────────
  {
    id: "jharkhand_minority_scholarship",
    icon: "📖", color: "#7C3AED", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Minority Welfare Dept.", hi: "झारखंड अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Jharkhand Minority Post-Matric Scholarship",                                          hi: "झारखंड अल्पसंख्यक पोस्ट-मैट्रिक छात्रवृत्ति" },
    benefit: { en: "₹10,000–₹30,000/year for Muslim, Christian, Sikh, Buddhist & Parsi students (Class 11 to PG)", hi: "कक्षा 11 से स्नातकोत्तर तक मुस्लिम, ईसाई, सिख, बौद्ध व पारसी छात्रों को ₹10,000–₹30,000/वर्ष" },
    tag:     { en: "Education / Minority", hi: "शिक्षा / अल्पसंख्यक" },
    annual: 15000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "10th Mark Sheet", "College / Institution Admission Proof", "Income Certificate (below ₹2L)", "Bank Account"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "10वीं अंकपत्र", "कॉलेज / संस्था प्रवेश प्रमाण", "आय प्रमाण पत्र (₹2 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── 22. MERIT SCHOLARSHIP ───────────────────────────────────────────────────
  {
    id: "jharkhand_medha_chatravriti",
    icon: "🏅", color: "#D97706", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of School Education & Literacy", hi: "झारखंड स्कूली शिक्षा एवं साक्षरता विभाग" },
    name:    { en: "Mukhyamantri Medha Chatravriti Yojana",                                         hi: "मुख्यमंत्री मेधा छात्रवृत्ति योजना" },
    benefit: { en: "₹12,000/year merit scholarship for Class 9–12 students from low-income families (selected via state exam)", hi: "राज्य परीक्षा से चयनित कक्षा 9–12 के निम्न आय वर्ग के मेधावी छात्रों को ₹12,000/वर्ष" },
    tag:     { en: "Education / Merit", hi: "शिक्षा / मेधा" },
    annual: 12000,
    apply:   { en: "jac.jharkhand.gov.in", hi: "jac.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 8 Mark Sheet (60%+ marks)", "Income Certificate (below ₹1.5L/year)", "School Enrollment Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "कक्षा 8 अंकपत्र (60% या अधिक)", "आय प्रमाण पत्र (₹1.5 लाख/वर्ष से कम)", "विद्यालय नामांकन प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && a.age === "below18" && ["below1","1to3"].includes(a.income),
  },

  // ── 23. SOLAR / ENERGY ──────────────────────────────────────────────────────
  {
    id: "jharkhand_solar_jreda",
    icon: "☀️", color: "#CA8A04", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Renewable Energy Development Agency (JREDA)", hi: "झारखंड नवीकरणीय ऊर्जा विकास एजेंसी (JREDA)" },
    name:    { en: "JREDA Solar Home Light & Rooftop Solar Scheme",                                              hi: "JREDA सोलर होम लाइट एवं रूफटॉप सोलर योजना" },
    benefit: { en: "90% subsidy on solar home light system for BPL rural households · Rooftop solar at 30–40% subsidy", hi: "BPL ग्रामीण परिवारों को सोलर होम लाइट सिस्टम पर 90% सब्सिडी · रूफटॉप सोलर पर 30–40% सब्सिडी" },
    tag:     { en: "Energy / Solar", hi: "ऊर्जा / सौर" },
    annual: 0,
    apply:   { en: "jreda.com", hi: "jreda.com" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card (for 90% subsidy)", "Electricity Bill or No-Grid Connection Certificate", "Bank Account", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड (90% सब्सिडी हेतु)", "बिजली बिल या ग्रिड कनेक्शन न होने का प्रमाण", "बैंक खाता", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jharkhand" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── 24. SELF-EMPLOYMENT LOAN ────────────────────────────────────────────────
  {
    id: "jharkhand_rojgar_srijan",
    icon: "🏪", color: "#6B21A8", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of SC / ST / OBC & Minority Welfare", hi: "झारखंड SC / ST / OBC एवं अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Mukhyamantri Rojgar Srijan Yojana",                                                          hi: "मुख्यमंत्री रोजगार सृजन योजना" },
    benefit: { en: "Up to ₹25 Lakh loan for business setup · 40% subsidy (max ₹5L) for SC/ST/OBC/Minority/Women/Divyang", hi: "व्यवसाय स्थापना के लिए ₹25 लाख तक ऋण · SC/ST/OBC/अल्पसंख्यक/महिला/दिव्यांग को 40% सब्सिडी (अधिकतम ₹5 लाख)" },
    tag:     { en: "Business / Self-Employment", hi: "व्यापार / स्वरोजगार" },
    annual: 0,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/OBC)", "Jharkhand Domicile Certificate", "Business Plan", "Bank Account", "Income Certificate", "Educational Certificate"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/OBC)", "झारखंड निवास प्रमाण", "व्यापार योजना", "बैंक खाता", "आय प्रमाण पत्र", "शैक्षणिक प्रमाण पत्र"] },
    match: (a) => a.state === "Jharkhand" && a.who === "business" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── 25. OBC SCHOLARSHIP ─────────────────────────────────────────────────────
  {
    id: "jharkhand_obc_scholarship",
    icon: "📝", color: "#1D4ED8", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of BC & OBC Welfare", hi: "झारखंड पिछड़ा वर्ग एवं OBC कल्याण विभाग" },
    name:    { en: "Jharkhand OBC / BC Post-Matric Scholarship",                                       hi: "झारखंड OBC / BC पोस्ट-मैट्रिक छात्रवृत्ति" },
    benefit: { en: "₹8,000–₹20,000/year covering tuition & maintenance for OBC/BC students (Class 11 to PG)", hi: "कक्षा 11 से स्नातकोत्तर तक OBC/BC छात्रों को ₹8,000–₹20,000/वर्ष शुल्क व रख-रखाव सहायता" },
    tag:     { en: "Education / OBC", hi: "शिक्षा / OBC" },
    annual: 12000,
    apply:   { en: "ekalyan.jharkhand.gov.in", hi: "ekalyan.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "OBC / BC Caste Certificate", "10th Mark Sheet", "College Admission Proof", "Income Certificate (below ₹1.5L/year)", "Bank Account"],
               hi: ["आधार कार्ड", "OBC / BC जाति प्रमाण पत्र", "10वीं अंकपत्र", "कॉलेज प्रवेश प्रमाण", "आय प्रमाण पत्र (₹1.5 लाख/वर्ष से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── 26. MICRO-IRRIGATION ────────────────────────────────────────────────────
  {
    id: "jharkhand_micro_irrigation",
    icon: "💦", color: "#0891B2", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Agriculture (PMKSY State Component)", hi: "झारखंड कृषि विभाग (PMKSY राज्य घटक)" },
    name:    { en: "Jharkhand Micro-Irrigation (Drip & Sprinkler) Yojana",                          hi: "झारखंड सूक्ष्म सिंचाई (ड्रिप एवं स्प्रिंकलर) योजना" },
    benefit: { en: "90% subsidy for SC/ST · 75% for general farmers on drip & sprinkler irrigation systems", hi: "SC/ST किसानों को ड्रिप व स्प्रिंकलर सिंचाई पर 90% · सामान्य किसानों को 75% सब्सिडी" },
    tag:     { en: "Farmer / Irrigation", hi: "किसान / सिंचाई" },
    annual: 50000,
    apply:   { en: "agri.jharkhand.gov.in", hi: "agri.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (Khatiyan / Khasra)", "Caste Certificate (for SC/ST rate)", "Bank Account", "Geo-tagged Photo of Farm", "Quotation from Empanelled Vendor"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (खतियान / खसरा)", "जाति प्रमाण पत्र (SC/ST दर हेतु)", "बैंक खाता", "खेत की जियो-टैग फोटो", "पंजीकृत विक्रेता से कोटेशन"] },
    match: (a) => a.state === "Jharkhand" && a.who === "farmer",
  },

  // ── 27. DRINKING WATER ──────────────────────────────────────────────────────
  {
    id: "jharkhand_har_ghar_nal",
    icon: "🚰", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Drinking Water & Sanitation (JJM)", hi: "झारखंड पेयजल एवं स्वच्छता विभाग (JJM)" },
    name:    { en: "Har Ghar Nal Yojana – Jharkhand (Jal Jeevan Mission)",            hi: "हर घर नल योजना – झारखंड (जल जीवन मिशन)" },
    benefit: { en: "Free functional tap water connection to every rural household · 55 litres/person/day assured supply", hi: "हर ग्रामीण घर को निःशुल्क नल कनेक्शन · प्रति व्यक्ति 55 लीटर/दिन आश्वासित जलापूर्ति" },
    tag:     { en: "Drinking Water", hi: "पेयजल" },
    annual: 0,
    apply:   { en: "phed.jharkhand.gov.in", hi: "phed.jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Proof of Rural Residence", "Application to Village Water & Sanitation Committee (VWSC)"],
               hi: ["आधार कार्ड", "राशन कार्ड", "ग्रामीण निवास का प्रमाण", "ग्राम जल एवं स्वच्छता समिति (VWSC) को आवेदन"] },
    match: (a) => a.state === "Jharkhand" && a.area === "rural",
  },

  // ── 28. DIVYANG SCHOLARSHIP ─────────────────────────────────────────────────
  {
    id: "jharkhand_divyang_scholarship",
    icon: "🎓", color: "#475569", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Dept. of Social Welfare (Divyang Cell)", hi: "झारखंड समाज कल्याण विभाग (दिव्यांग प्रकोष्ठ)" },
    name:    { en: "Jharkhand Divyang Scholarship Yojana",                                                hi: "झारखंड दिव्यांग छात्रवृत्ति योजना" },
    benefit: { en: "₹5,000–₹15,000/year scholarship for students with 40%+ disability from Class 1 to PG", hi: "40% या अधिक विकलांगता वाले कक्षा 1 से स्नातकोत्तर तक के छात्रों को ₹5,000–₹15,000/वर्ष छात्रवृत्ति" },
    tag:     { en: "Education / Disability", hi: "शिक्षा / दिव्यांग" },
    annual: 10000,
    apply:   { en: "jharkhand.gov.in", hi: "jharkhand.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+) from CMO", "School / College Enrollment Proof", "Income Certificate", "Bank Account", "Passport Photo"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+) CMO से", "विद्यालय / कॉलेज नामांकन प्रमाण", "आय प्रमाण पत्र", "बैंक खाता", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jharkhand" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

];
