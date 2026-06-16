// Maharashtra — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "maharashtra_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const MAHARASHTRA_SCHEMES = [

  {
    id: "maha_health",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Health Dept.", hi: "महाराष्ट्र स्वास्थ्य विभाग" },
    name:    { en: "Mahatma Phule Jan Arogya Yojana",             hi: "महात्मा फुले जन आरोग्य योजना" },
    benefit: { en: "₹1.5 Lakh/year cashless hospital treatment", hi: "₹1.5 लाख/वर्ष कैशलेस अस्पताल" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 150000,
    apply:   { en: "https://https://jeevandayee.maharashtra.gov.in", hi: "jeevandayee.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Yellow/Orange Ration Card","Income Certificate"],
               hi: ["आधार कार्ड","पीला/नारंगी राशन कार्ड","आय प्रमाण पत्र"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_shetkari",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept.", hi: "महाराष्ट्र कृषि विभाग" },
    name:    { en: "Shetkari Sanman Yojana (Maha)",           hi: "शेतकरी सन्मान योजना (महाराष्ट्र)" },
    benefit: { en: "₹6,000/year additional to PM Kisan",     hi: "पीएम किसान के अतिरिक्त ₹6,000/वर्ष" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 6000,
    apply:   { en: "https://https://krishi.maharashtra.gov.in", hi: "krishi.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","7/12 Land Extract","Bank Passbook"],
               hi: ["आधार कार्ड","7/12 जमीन उतारा","बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_majhi_ladki_bahin",
    icon: "👧", color: "#C026D3", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Dev. Dept.", hi: "महाराष्ट्र महिला एवं बाल विकास विभाग" },
    name:    { en: "Majhi Ladki Bahin Yojana (Maharashtra)",          hi: "माझी लाडकी बहीण योजना (महाराष्ट्र)" },
    benefit: { en: "₹1,500/month to women aged 21–65 with income below ₹2.5 Lakh/year", hi: "21–65 वर्ष की महिलाओं को ₹1,500/माह (वार्षिक आय ₹2.5 लाख से कम)" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 18000,
    apply:   { en: "https://https://ladakibahin.maharashtra.gov.in", hi: "ladakibahin.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Bank Account (women's name)","Income Certificate","Maharashtra Domicile"],
               hi: ["आधार कार्ड","राशन कार्ड","बैंक खाता (महिला के नाम)","आय प्रमाण","महाराष्ट्र अधिवास प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_annasaheb_patil",
    icon: "🏦", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra MAVIM / Annasaheb Patil Corp.", hi: "महाराष्ट्र अण्णासाहेब पाटील महामंडळ" },
    name:    { en: "Annasaheb Patil Loan Scheme",                          hi: "अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळ योजना" },
    benefit: { en: "Interest-free/subsidised loan up to ₹10 Lakh for OBC entrepreneurs", hi: "OBC उद्यमियों को ₹10 लाख तक ब्याजमुक्त/सब्सिडी लोन" },
    tag:     { en: "Business / OBC", hi: "व्यापार / OBC" },
    annual: 0,
    apply:   { en: "https://https://mahaswayam.gov.in", hi: "mahaswayam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (OBC)", "Business Plan", "Income Certificate", "Bank Passbook"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (OBC)", "व्यापार योजना", "आय प्रमाण पत्र", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "business" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_baliraja_sinchana",
    icon: "💧", color: "#0891B2", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Water Resources Dept.", hi: "महाराष्ट्र जल संसाधन विभाग" },
    name:    { en: "Baliraja Chaitanya Sinchana Yojana",              hi: "बळीराजा चेतना सिंचन योजना" },
    benefit: { en: "Free drip/sprinkler irrigation installation for small & marginal farmers", hi: "लघु व सीमांत किसानों को मुफ्त ड्रिप/स्प्रिंकलर सिंचाई" },
    tag:     { en: "Farmer / Irrigation", hi: "किसान / सिंचाई" },
    annual: 45000,
    apply:   { en: "https://https://mahaagri.gov.in", hi: "mahaagri.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Caste Certificate (if SC/ST)", "Bank Passbook"],
               hi: ["आधार कार्ड", "7/12 जमीन उतारा", "जाति प्रमाण (SC/ST के लिए)", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_sant_rohidas",
    icon: "🧰", color: "#B45309", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra SC/OBC Finance Corp.", hi: "महाराष्ट्र अनुसूचित जाति वित्त व विकास महामंडळ" },
    name:    { en: "Sant Rohidas Charmakar Artisan Scheme",           hi: "संत रोहिदास चर्मकार योजना" },
    benefit: { en: "Subsidised loan up to ₹5 Lakh for leather artisans (SC community)", hi: "चमड़ा कारीगरों (SC) को ₹5 लाख तक सब्सिडी लोन" },
    tag:     { en: "Artisan / SC", hi: "कारीगर / SC" },
    annual: 0,
    apply:   { en: "mahasamajkalyan.gov.in", hi: "mahasamajkalyan.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC)", "Income Certificate", "Trade Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC)", "आय प्रमाण पत्र", "व्यवसाय प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "business" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_rajarshi_shahu",
    icon: "📚", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Higher & Tech. Education Dept.", hi: "महाराष्ट्र उच्च व तंत्र शिक्षण विभाग" },
    name:    { en: "Rajarshi Chhatrapati Shahu Maharaj Shishyavrutti", hi: "राजर्षी छत्रपती शाहू महाराज शिष्यवृत्ती" },
    benefit: { en: "₹5,000–₹8,000/year scholarship for OBC students in higher education", hi: "OBC छात्रों को उच्च शिक्षा के लिए ₹5,000–₹8,000/वर्ष छात्रवृत्ति" },
    tag:     { en: "Student / OBC", hi: "छात्र / OBC" },
    annual: 8000,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "OBC Caste Certificate", "Income Certificate (≤₹8L/year)", "Previous Year Mark Sheet", "College Bonafide", "Bank Passbook"],
               hi: ["आधार कार्ड", "OBC जाति प्रमाण पत्र", "आय प्रमाण (≤₹8 लाख/वर्ष)", "पिछले वर्ष की मार्कशीट", "कॉलेज बोनाफाइड", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_swadhar_gruh",
    icon: "🏠", color: "#9D174D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice Dept.", hi: "महाराष्ट्र सामाजिक न्याय विभाग" },
    name:    { en: "Swadhar Gruh Scheme (SC Girls Hostel)",           hi: "स्वाधार गृह योजना (SC बालिका छात्रावास)" },
    benefit: { en: "Free hostel + ₹51,000/year living & education expenses for SC girls studying away from home", hi: "SC छात्राओं को मुफ्त हॉस्टल + ₹51,000/वर्ष शिक्षा व जीवन व्यय" },
    tag:     { en: "Student / Women / SC", hi: "छात्र / महिला / SC" },
    annual: 51000,
    apply:   { en: "https://sjsa.maharashtra.gov.in", hi: "sjsa.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "Income Certificate", "College Admission Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "आय प्रमाण पत्र", "कॉलेज प्रवेश प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && a.who === "women" || (a.state === "Maharashtra" && a.who === "women" && ["below1","1to3"].includes(a.income)),
  },

  {
    id: "maha_gharkul",
    icon: "🏡", color: "#15803D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Housing Dept. (PMAY-G State Top-up)", hi: "महाराष्ट्र गृहनिर्माण विभाग" },
    name:    { en: "Ramai Gharkul Yojana (Maharashtra)",              hi: "रमाई घरकुल योजना (महाराष्ट्र)" },
    benefit: { en: "₹1.20 Lakh housing grant for SC/Nav-Buddhist BPL families (state top-up to PMAY)", hi: "SC/नव-बौद्ध BPL परिवारों को ₹1.20 लाख आवास अनुदान" },
    tag:     { en: "Housing / SC", hi: "आवास / SC" },
    annual: 120000,
    apply:   { en: "https://rhgrhay.maharashtra.gov.in", hi: "rhgrhay.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC / Nav-Buddhist Caste Certificate", "BPL Certificate", "7/12 Land Extract or Plot Allotment Letter", "Bank Passbook"],
               hi: ["आधार कार्ड", "SC/नव-बौद्ध जाति प्रमाण पत्र", "BPL प्रमाण पत्र", "7/12 उतारा या भूखंड आवंटन पत्र", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_sanjay_gandhi",
    icon: "👴", color: "#D97706", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice & Special Assistance Dept.", hi: "महाराष्ट्र सामाजिक न्याय व विशेष सहाय्य विभाग" },
    name:    { en: "Sanjay Gandhi Niradhar Anudan Yojana",            hi: "संजय गांधी निराधार अनुदान योजना" },
    benefit: { en: "₹600/month pension for destitute, disabled, widows & orphans not covered by other pensions", hi: "अन्य पेंशन से वंचित असहाय, विकलांग, विधवा व अनाथों को ₹600/माह" },
    tag:     { en: "Pension / Senior", hi: "पेंशन / वरिष्ठ" },
    annual: 7200,
    apply:   { en: "https://aaplesarkar.mahaonline.gov.in", hi: "aaplesarkar.mahaonline.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (≤₹21,000/year)", "Disability / Widow / Destitute Proof", "Bank Passbook", "Maharashtra Domicile"],
               hi: ["आधार कार्ड", "आय प्रमाण (≤₹21,000/वर्ष)", "विकलांगता/विधवा/निराधार प्रमाण", "बैंक पासबुक", "महाराष्ट्र अधिवास प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && ["below1"].includes(a.income) && (a.who === "senior" || a.who === "women" || a.age === "above60"),
  },

  {
    id: "maha_shravan_bal",
    icon: "🧓", color: "#92400E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice Dept.", hi: "महाराष्ट्र सामाजिक न्याय विभाग" },
    name:    { en: "Shravan Bal Seva Rajya Pension Yojana",           hi: "श्रवण बाळ सेवा राज्य निवृत्ती वेतन योजना" },
    benefit: { en: "₹600/month state pension for senior citizens (65+) not covered by IGNOAPS", hi: "IGNOAPS से वंचित 65+ वरिष्ठ नागरिकों को ₹600/माह राज्य पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 7200,
    apply:   { en: "https://aaplesarkar.mahaonline.gov.in", hi: "aaplesarkar.mahaonline.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof (65+)", "Income Certificate", "Bank Passbook", "Maharashtra Domicile (15+ years)"],
               hi: ["आधार कार्ड", "आयु प्रमाण (65+)", "आय प्रमाण पत्र", "बैंक पासबुक", "महाराष्ट्र अधिवास (15+ वर्ष)"] },
    match: (a) => a.state === "Maharashtra" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_yellow_ration",
    icon: "🍚", color: "#CA8A04", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Food, Civil Supplies & Consumer Protection Dept.", hi: "महाराष्ट्र अन्न, नागरी पुरवठा व ग्राहक संरक्षण विभाग" },
    name:    { en: "Maharashtra Yellow Ration Card Scheme",           hi: "महाराष्ट्र पीला राशन कार्ड योजना" },
    benefit: { en: "Subsidised grain (35 kg/family/month) at ₹1–₹3/kg + free LPG connection eligibility", hi: "35 किलो अनाज/माह ₹1–₹3/किलो + मुफ्त LPG कनेक्शन पात्रता" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 5040,
    apply:   { en: "https://rcms.mahafood.gov.in", hi: "rcms.mahafood.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (BPL / ≤₹15,000/month)", "Address Proof", "Family Photo"],
               hi: ["आधार कार्ड", "आय प्रमाण (BPL / ≤₹15,000/माह)", "पता प्रमाण", "पारिवारिक फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_yuva_karya",
    icon: "💼", color: "#0F766E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Skill Development Dept.", hi: "महाराष्ट्र कौशल विकास विभाग" },
    name:    { en: "Mahaswayam – Yuva Karya Prashikshan Yojana",     hi: "महास्वयं – युवा कार्य प्रशिक्षण योजना" },
    benefit: { en: "Free skill training + ₹2,000–₹5,000/month stipend during apprenticeship for youth", hi: "युवाओं को मुफ्त कौशल प्रशिक्षण + अप्रेंटिसशिप में ₹2,000–₹5,000/माह" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 60000,
    apply:   { en: "https://mahaswayam.gov.in", hi: "mahaswayam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Certificate (Min. SSC)", "Maharashtra Domicile", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "शैक्षणिक प्रमाण (न्यूनतम SSC)", "महाराष्ट्र अधिवास प्रमाण", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["18to35"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Disability ───────────────────────────────────────────────────────────────

  {
    id: "maha_divyang_pension",
    icon: "♿", color: "#6B21A8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice & Special Assistance Dept.", hi: "महाराष्ट्र सामाजिक न्याय व विशेष सहाय्य विभाग" },
    name:    { en: "Indira Gandhi National Disability Pension (Maha Top-up)",  hi: "इंदिरा गांधी राष्ट्रीय दिव्यांग पेंशन (महाराष्ट्र टॉप-अप)" },
    benefit: { en: "₹600/month state pension for persons with 80%+ disability (BPL)", hi: "80%+ दिव्यांग BPL व्यक्तियों को ₹600/माह राज्य पेंशन" },
    tag:     { en: "Disability / Pension", hi: "दिव्यांग / पेंशन" },
    annual: 7200,
    apply:   { en: "https://aaplesarkar.mahaonline.gov.in", hi: "aaplesarkar.mahaonline.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (80%+, from Civil Surgeon)", "BPL / Income Certificate", "Bank Passbook", "Maharashtra Domicile"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (80%+, सिविल सर्जन से)", "BPL/आय प्रमाण", "बैंक पासबुक", "महाराष्ट्र अधिवास प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_divyang_vehicle",
    icon: "🛵", color: "#7C3AED", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice Dept.", hi: "महाराष्ट्र सामाजिक न्याय विभाग" },
    name:    { en: "Divyang Motorised Tricycle / Assistive Device Scheme",     hi: "दिव्यांग मोटराइज्ड ट्रायसिकल / सहाय्यक उपकरण योजना" },
    benefit: { en: "Free motorised tricycle or assistive device (up to ₹45,000) for physically disabled persons", hi: "शारीरिक दिव्यांग व्यक्तियों को मुफ्त मोटराइज्ड ट्रायसिकल या ₹45,000 तक उपकरण" },
    tag:     { en: "Disability / Assistive Aid", hi: "दिव्यांग / सहाय्यक उपकरण" },
    annual: 45000,
    apply:   { en: "sjsa.maharashtra.gov.in", hi: "sjsa.maharashtra.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "Income Certificate (≤₹3L/year)", "Passport Photo", "Bank Passbook"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+)", "आय प्रमाण (≤₹3 लाख/वर्ष)", "पासपोर्ट फोटो", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Tribal / Adivasi ─────────────────────────────────────────────────────────

  {
    id: "maha_tribal_ashram",
    icon: "🏫", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Tribal Development Dept.", hi: "महाराष्ट्र आदिवासी विकास विभाग" },
    name:    { en: "Ashram School Scheme (ST Students)",                       hi: "आश्रमशाळा योजना (ST विद्यार्थी)" },
    benefit: { en: "Free residential schooling + food, clothing & books for ST children (Class 1–12)", hi: "ST बच्चों को कक्षा 1–12 तक मुफ्त निवासी शिक्षा, भोजन, वस्त्र व पुस्तकें" },
    tag:     { en: "Student / Tribal / ST", hi: "छात्र / आदिवासी / ST" },
    annual: 30000,
    apply:   { en: "tribal.maharashtra.gov.in", hi: "tribal.maharashtra.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST Caste Certificate", "Birth Certificate", "Previous School Leaving Certificate", "Parent's Income Certificate"],
               hi: ["आधार कार्ड", "ST जाति प्रमाण पत्र", "जन्म प्रमाण पत्र", "पिछली शाला छोड़ने का प्रमाण", "माता-पिता का आय प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_tribal_scholarship",
    icon: "🎓", color: "#92400E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Tribal Development Dept.", hi: "महाराष्ट्र आदिवासी विकास विभाग" },
    name:    { en: "Post-Matric Scholarship for ST Students (Maharashtra)",    hi: "मॅट्रिकोत्तर छात्रवृत्ती योजना (ST, महाराष्ट्र)" },
    benefit: { en: "Full tuition fee + ₹380–₹1,200/month maintenance allowance for ST students in college", hi: "ST कॉलेज छात्रों को पूरी ट्यूशन फीस + ₹380–₹1,200/माह भत्ता" },
    tag:     { en: "Student / Tribal / ST", hi: "छात्र / आदिवासी / ST" },
    annual: 14400,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "ST Caste Certificate", "Income Certificate (≤₹2.5L/year)", "Previous Year Mark Sheet", "College Fee Receipt", "Bank Passbook"],
               hi: ["आधार कार्ड", "ST जाति प्रमाण पत्र", "आय प्रमाण (≤₹2.5 लाख/वर्ष)", "पिछले वर्ष की मार्कशीट", "कॉलेज शुल्क रसीद", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── Women – Self-Employment & Safety ─────────────────────────────────────────

  {
    id: "maha_mahila_arthik",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Development Dept.", hi: "महाराष्ट्र महिला व बाल विकास विभाग" },
    name:    { en: "Mahila Arthik Vikas Mahamandal (MAVIM) Loan",             hi: "महिला आर्थिक विकास महामंडळ (MAVIM) लोन" },
    benefit: { en: "Low-interest loan ₹1–₹5 Lakh through SHG for women entrepreneurs", hi: "SHG के माध्यम से महिला उद्यमियों को ₹1–₹5 लाख कम ब्याज लोन" },
    tag:     { en: "Women / Business / SHG", hi: "महिला / व्यापार / SHG" },
    annual: 0,
    apply:   { en: "mavim.org.in", hi: "mavim.org.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate", "Business Plan", "Income Certificate", "Bank Passbook (SHG account)"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र", "व्यापार योजना", "आय प्रमाण", "बैंक पासबुक (SHG खाता)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_manodairya",
    icon: "🆘", color: "#DC2626", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Development Dept.", hi: "महाराष्ट्र महिला व बाल विकास विभाग" },
    name:    { en: "Manodhairya Scheme (Rape / Acid Attack Survivors)",        hi: "मनोधैर्य योजना (बलात्कार / एसिड हमले की पीड़िता)" },
    benefit: { en: "Immediate compensation ₹3 Lakh (rape) / ₹5 Lakh (acid attack) + free medical & legal aid", hi: "बलात्कार पीड़िता को ₹3 लाख / एसिड हमले पर ₹5 लाख तत्काल मुआवजा + मुफ्त चिकित्सा व कानूनी सहायता" },
    tag:     { en: "Women / Safety / Relief", hi: "महिला / सुरक्षा / राहत" },
    annual: 300000,
    apply:   { en: "District Legal Services Authority (DLSA) / nearest police station", hi: "जिला कानूनी सेवा प्राधिकरण (DLSA) / नजदीकी पुलिस थाना" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "FIR / Medico-Legal Case (MLC) Report", "Medical Treatment Records", "Bank Passbook"],
               hi: ["आधार कार्ड", "FIR / MLC रिपोर्ट", "चिकित्सा उपचार रिकॉर्ड", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women",
  },

  // ── Farmer – Additional ───────────────────────────────────────────────────────

  {
    id: "maha_gopinath_munde",
    icon: "🚜", color: "#15803D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept.", hi: "महाराष्ट्र कृषि विभाग" },
    name:    { en: "Gopinath Munde Shetkari Apghat Vima Yojana",              hi: "गोपीनाथ मुंडे शेतकरी अपघात विमा योजना" },
    benefit: { en: "₹2 Lakh accidental death insurance + ₹1 Lakh partial disability cover for all registered farmers", hi: "सभी पंजीकृत किसानों को ₹2 लाख आकस्मिक मृत्यु बीमा + ₹1 लाख आंशिक दिव्यांगता कवर" },
    tag:     { en: "Farmer / Insurance", hi: "किसान / बीमा" },
    annual: 0,
    apply:   { en: "krishi.maharashtra.gov.in", hi: "krishi.maharashtra.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract (in farmer's name)", "Bank Passbook", "Nominee's Aadhaar (for death claim)"],
               hi: ["आधार कार्ड", "7/12 उतारा (किसान के नाम)", "बैंक पासबुक", "नॉमिनी का आधार (मृत्यु दावे के लिए)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_nanaji_deshmukh",
    icon: "🌱", color: "#16A34A", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture & Horticulture Dept.", hi: "महाराष्ट्र कृषि व फलोत्पादन विभाग" },
    name:    { en: "Nanaji Deshmukh Krishi Sanjivani Prakalp (PoCRA)",        hi: "नानाजी देशमुख कृषि संजीवनी प्रकल्प (PoCRA)" },
    benefit: { en: "Subsidy up to 50% on climate-resilient farming inputs, farm ponds & micro-irrigation for drought-prone villages", hi: "सूखाग्रस्त गांवों में जलवायु-अनुकूल खेती इनपुट, फार्म पॉन्ड व सूक्ष्म सिंचाई पर 50% तक सब्सिडी" },
    tag:     { en: "Farmer / Climate Resilience", hi: "किसान / जलवायु अनुकूलन" },
    annual: 25000,
    apply:   { en: "https://https://pocramaharashtra.gov.in", hi: "pocramaharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Soil & Water Test Report", "Bank Passbook", "Village Inclusion Certificate (PoCRA village list)"],
               hi: ["आधार कार्ड", "7/12 उतारा", "मिट्टी व पानी जांच रिपोर्ट", "बैंक पासबुक", "ग्राम समावेश प्रमाण (PoCRA ग्राम सूची)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Urban Poor / Employment ───────────────────────────────────────────────────

  {
    id: "maha_pmay_slum",
    icon: "🏙️", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Housing & Area Development Authority (MHADA)", hi: "महाराष्ट्र गृहनिर्माण व क्षेत्र विकास प्राधिकरण (MHADA)" },
    name:    { en: "MHADA Slum Rehabilitation Scheme (SRA)",                  hi: "MHADA झोपडपट्टी पुनर्वास योजना (SRA)" },
    benefit: { en: "Free permanent pucca house (269 sq ft carpet) for eligible slum dwellers in Maharashtra", hi: "पात्र झुग्गीवासियों को मुफ्त पक्का मकान (269 वर्ग फुट कार्पेट)" },
    tag:     { en: "Housing / Urban Poor", hi: "आवास / शहरी गरीब" },
    annual: 500000,
    apply:   { en: "https://https://sra.gov.in", hi: "sra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Slum Identity Card / Electoral Roll (pre-2000 residence proof)", "Ration Card", "Passport Photo", "Bank Passbook"],
               hi: ["आधार कार्ड", "स्लम पहचान पत्र / मतदाता सूची (2000 से पहले निवास प्रमाण)", "राशन कार्ड", "पासपोर्ट फोटो", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["no","kutcha"].includes(a.house) && ["urban","semi"].includes(a.area) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_rojgar_hami",
    icon: "⛏️", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Employment Guarantee Dept.", hi: "महाराष्ट्र रोजगार हमी विभाग" },
    name:    { en: "Maharashtra Employment Guarantee Scheme (EGS)",           hi: "महाराष्ट्र रोजगार हमी योजना (EGS)" },
    benefit: { en: "Guaranteed 365-day unskilled employment @ ₹309/day for rural job-seekers (pre-dates MGNREGA)", hi: "ग्रामीण बेरोजगारों को ₹309/दिन पर 365 दिन गारंटीड रोजगार" },
    tag:     { en: "Employment / Rural", hi: "रोजगार / ग्रामीण" },
    annual: 37000,
    apply:   { en: "https://https://egs.mahaonline.gov.in", hi: "egs.mahaonline.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Maharashtra Domicile", "Job Card (from Gram Panchayat)", "Bank / Post Office Account"],
               hi: ["आधार कार्ड", "महाराष्ट्र अधिवास", "जॉब कार्ड (ग्राम पंचायत से)", "बैंक / डाकघर खाता"] },
    match: (a) => a.state === "Maharashtra" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── Minority ─────────────────────────────────────────────────────────────────

  {
    id: "maha_minority_scholarship",
    icon: "🕌", color: "#0F766E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Minority Development Dept.", hi: "महाराष्ट्र अल्पसंख्यक विकास विभाग" },
    name:    { en: "Maharashtra Minority Post-Matric Scholarship",             hi: "महाराष्ट्र अल्पसंख्यक मॅट्रिकोत्तर छात्रवृत्ती" },
    benefit: { en: "₹10,000–₹20,000/year scholarship for Muslim, Christian, Buddhist, Sikh, Jain & Parsi students in higher education", hi: "मुस्लिम, ईसाई, बौद्ध, सिख, जैन व पारसी छात्रों को उच्च शिक्षा में ₹10,000–₹20,000/वर्ष छात्रवृत्ती" },
    tag:     { en: "Student / Minority", hi: "छात्र / अल्पसंख्यक" },
    annual: 20000,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "Income Certificate (≤₹8L/year)", "Previous Year Mark Sheet", "College Bonafide", "Bank Passbook"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "आय प्रमाण (≤₹8 लाख/वर्ष)", "पिछले वर्ष की मार्कशीट", "कॉलेज बोनाफाइड", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── NEW / LATEST SCHEMES (2024–2026) ─────────────────────────────────────────

  {
    id: "maha_karjmafi_2026",
    icon: "🏦", color: "#15803D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Finance & Co-operation Dept.", hi: "महाराष्ट्र वित्त व सहकार विभाग" },
    name:    { en: "Punyashlok Ahilyadevi Holkar Shetkari Karjmafi Yojana (2026)", hi: "पुण्यश्लोक अहिल्यादेवी होळकर शेतकरी कर्जमाफी योजना (2026)" },
    benefit: { en: "Complete crop loan waiver up to ₹2 Lakh for defaulting farmers (loans Apr 2019–Mar 2025, overdue as of Sep 2025) + ₹50,000 incentive for regular repayers", hi: "अप्रैल 2019–मार्च 2025 के बकाया फसल लोन पर ₹2 लाख तक पूर्ण कर्जमाफी + नियमित चुकाने वाले किसानों को ₹50,000 प्रोत्साहन" },
    tag:     { en: "Farmer / Loan Waiver", hi: "किसान / कर्जमाफी" },
    annual: 200000,
    apply:   { en: "https://krishi.maharashtra.gov.in", hi: "krishi.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Farmer Registry Registration Number", "Crop Loan Account Details (Bank Passbook)", "7/12 Land Extract", "Mobile Number (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "शेतकरी नोंदणी क्रमांक", "फसल लोन खाता विवरण (बैंक पासबुक)", "7/12 उतारा", "मोबाइल नंबर (आधार से लिंक)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_namo_shetkari",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept.", hi: "महाराष्ट्र कृषि विभाग" },
    name:    { en: "Namo Shetkari Maha Samman Nidhi Yojana",                   hi: "नमो शेतकरी महासन्मान निधी योजना" },
    benefit: { en: "₹6,000/year additional state top-up (₹2,000 × 3 instalments) on top of PM Kisan — total ₹12,000/year for eligible farmers", hi: "PM किसान के ऊपर राज्य से अतिरिक्त ₹6,000/वर्ष (₹2,000 × 3 किस्तें) — कुल ₹12,000/वर्ष" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 6000,
    apply:   { en: "https://nsmny.mahait.org", hi: "nsmny.mahait.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (Aadhaar-linked mobile)", "7/12 Land Extract", "PM Kisan Registration Number", "Bank Passbook"],
               hi: ["आधार कार्ड (मोबाइल लिंक)", "7/12 उतारा", "PM किसान पंजीकरण क्रमांक", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_magel_tyala_solar_pump",
    icon: "☀️", color: "#CA8A04", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Energy Dept. / MSEDCL", hi: "महाराष्ट्र ऊर्जा विभाग / MSEDCL" },
    name:    { en: "Magel Tyala Saur Krushi Pump Yojana (Solar Irrigation Pump)", hi: "मागेल त्याला सौर कृषी पंप योजना" },
    benefit: { en: "90% subsidy (95% for SC/ST) on solar irrigation pump (3–7.5 HP) + 5-year repair guarantee & insurance. Farmer pays only 5–10%", hi: "सिंचाई सौर पंप (3–7.5 HP) पर 90% सब्सिडी (SC/ST को 95%) + 5 वर्ष मरम्मत गारंटी व बीमा। किसान केवल 5–10% भुगतान करे" },
    tag:     { en: "Farmer / Solar / Irrigation", hi: "किसान / सौर / सिंचाई" },
    annual: 90000,
    apply:   { en: "https://mahadiscom.in", hi: "mahadiscom.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Proof of Water Source (borewell/well/pond)", "Caste Certificate (SC/ST for extra subsidy)", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "7/12 उतारा", "जल स्रोत का प्रमाण (बोरवेल/कुआं/तालाब)", "जाति प्रमाण (SC/ST अतिरिक्त सब्सिडी हेतु)", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_smart_solar",
    icon: "🔆", color: "#F59E0B", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Energy Dept. / MSEDCL", hi: "महाराष्ट्र ऊर्जा विभाग / MSEDCL" },
    name:    { en: "Maharashtra SMART Solar Scheme 2025 (Rooftop Solar)",       hi: "महाराष्ट्र SMART सोलर योजना 2025 (रूफटॉप सोलर)" },
    benefit: { en: "Up to 95% subsidy on 1 kW rooftop solar panel (BPL pays only ₹2,500 for a ₹50,000 system) generating ~120 units/month free electricity", hi: "BPL परिवारों को 1 kW रूफटॉप सोलर पर 95% सब्सिडी — ₹50,000 के सिस्टम पर केवल ₹2,500 भुगतान, हर माह ~120 यूनिट मुफ्त बिजली" },
    tag:     { en: "Solar / Energy / BPL", hi: "सोलर / ऊर्जा / BPL" },
    annual: 12000,
    apply:   { en: "https://mahadiscom.in", hi: "msedcl.in / mahadiscom.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Electricity Bill (consumer number)", "Yellow / Saffron Ration Card (for BPL subsidy)", "Bank Passbook", "Roof Ownership Proof or NOC from owner"],
               hi: ["आधार कार्ड", "बिजली बिल (उपभोक्ता क्रमांक)", "पीला/केसरी राशन कार्ड (BPL सब्सिडी हेतु)", "बैंक पासबुक", "छत स्वामित्व प्रमाण या NOC"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_annapurna_lpg",
    icon: "🔥", color: "#EA580C", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Food, Civil Supplies & Consumer Protection Dept.", hi: "महाराष्ट्र अन्न, नागरी पुरवठा व ग्राहक संरक्षण विभाग" },
    name:    { en: "Mukhyamantri Annapurna Yojana (Free LPG Cylinders)",        hi: "मुख्यमंत्री अन्नपूर्णा योजना (मुफ्त LPG सिलेंडर)" },
    benefit: { en: "3 free LPG cylinders per year for families holding yellow or saffron ration cards (~52 lakh families covered)", hi: "पीला या केसरी राशन कार्ड धारक परिवारों को प्रतिवर्ष 3 मुफ्त LPG सिलेंडर (~52 लाख परिवार)" },
    tag:     { en: "LPG / Women / BPL", hi: "LPG / महिला / BPL" },
    annual: 2400,
    apply:   { en: "https://mahafood.gov.in", hi: "mahafood.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Yellow / Saffron Ration Card", "LPG Connection Details (existing connection)", "Bank Passbook"],
               hi: ["आधार कार्ड", "पीला/केसरी राशन कार्ड", "LPG कनेक्शन विवरण (मौजूदा कनेक्शन)", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_one_rupee_fasal_bima",
    icon: "🌧️", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept.", hi: "महाराष्ट्र कृषि विभाग" },
    name:    { en: "One Rupee Crop Insurance Scheme (Maharashtra)",             hi: "एक रुपया पीक विमा योजना (महाराष्ट्र)" },
    benefit: { en: "Full PMFBY crop insurance coverage at just ₹1 premium — state pays entire farmer's share of premium", hi: "केवल ₹1 प्रीमियम पर पूर्ण PMFBY फसल बीमा — किसान के हिस्से का पूरा प्रीमियम राज्य सरकार भरती है" },
    tag:     { en: "Farmer / Crop Insurance", hi: "किसान / फसल बीमा" },
    annual: 0,
    apply:   { en: "https://aaplesarkar.mahaonline.gov.in", hi: "aaplesarkar.mahaonline.gov.in / नजदीकी बैंक या CSC" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Sowing Certificate", "Bank Passbook", "₹1 payment receipt"],
               hi: ["आधार कार्ड", "7/12 उतारा", "बुवाई प्रमाण पत्र", "बैंक पासबुक", "₹1 भुगतान रसीद"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_ahilyadevi_mahila_startup",
    icon: "🚀", color: "#7C3AED", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Development Dept.", hi: "महाराष्ट्र महिला व बाल विकास विभाग" },
    name:    { en: "Punyashlok Ahilya Devi Holkar Mahila Startup Yojana",       hi: "पुण्यश्लोक अहिल्यादेवी होळकर महिला स्टार्टअप योजना" },
    benefit: { en: "Seed funding ₹25 Lakh + incubation & mentorship support for women-led startups in Maharashtra", hi: "महाराष्ट्र की महिला नेतृत्व वाली स्टार्टअप को ₹25 लाख सीड फंडिंग + इनक्यूबेशन व मार्गदर्शन" },
    tag:     { en: "Women / Startup / Business", hi: "महिला / स्टार्टअप / व्यापार" },
    annual: 0,
    apply:   { en: "https://wcd.maharashtra.gov.in", hi: "wcd.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Business / Startup Registration Certificate", "Pitch Deck / Business Plan", "Bank Account", "Maharashtra Domicile", "Incorporation / GST Certificate (if applicable)"],
               hi: ["आधार कार्ड", "व्यापार/स्टार्टअप पंजीकरण प्रमाण पत्र", "पिच डेक/व्यापार योजना", "बैंक खाता", "महाराष्ट्र अधिवास", "निगमन/GST प्रमाण (यदि लागू)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && (a.who === "business" || ["18to35","35to60"].includes(a.age)),
  },

  {
    id: "maha_mukhyamantri_vaidyakiya",
    icon: "🏥", color: "#0891B2", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Medical Education & Drugs Dept.", hi: "महाराष्ट्र वैद्यकीय शिक्षण व औषध विभाग" },
    name:    { en: "Mukhyamantri Vaidyakiya Sahayata Nidhi (CM Medical Relief Fund)", hi: "मुख्यमंत्री वैद्यकीय सहायता निधी" },
    benefit: { en: "Up to ₹5 Lakh financial assistance for catastrophic illness (cancer, organ transplant, rare diseases) for APL/BPL families not covered under MJPJAY/Ayushman", hi: "MJPJAY/आयुष्मान से वंचित APL/BPL परिवारों को कैंसर, अंग प्रत्यारोपण, दुर्लभ रोग पर ₹5 लाख तक वित्तीय सहायता" },
    tag:     { en: "Health / Medical Relief", hi: "स्वास्थ्य / चिकित्सा राहत" },
    annual: 500000,
    apply:   { en: "Apply via Dean/Medical Superintendent of Govt. Hospital", hi: "सरकारी अस्पताल के डीन/मेडिकल सुपरिंटेंडेंट के माध्यम से आवेदन करें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Medical Certificate & Estimated Cost from treating hospital", "Income Certificate", "Ration Card", "Bank Passbook"],
               hi: ["आधार कार्ड", "उपचार अस्पताल का मेडिकल सर्टिफिकेट व अनुमानित लागत", "आय प्रमाण पत्र", "राशन कार्ड", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_gems_jewellery_skill",
    icon: "💎", color: "#BE185D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Skills, Employment, Entrepreneurship & Innovation Dept.", hi: "महाराष्ट्र कौशल, रोजगार, उद्योजकता व नवोपक्रम विभाग" },
    name:    { en: "Certificate Course in Gems & Jewellery Sector (Maharashtra 2025)", hi: "रत्न व आभूषण क्षेत्र प्रमाणपत्र अभ्यासक्रम (महाराष्ट्र 2025)" },
    benefit: { en: "Free 3–6 month certified skill training in gems, jewellery design & manufacturing at Maharashtra State Skills University centres", hi: "महाराष्ट्र राज्य कौशल विद्यापीठ केंद्रों पर रत्न, आभूषण डिजाइन व निर्माण में 3–6 माह मुफ्त प्रमाणित प्रशिक्षण" },
    tag:     { en: "Skill / Youth / Artisan", hi: "कौशल / युवा / कारीगर" },
    annual: 30000,
    apply:   { en: "mss.edu.in (Maharashtra State Skills University)", hi: "mss.edu.in (महाराष्ट्र राज्य कौशल विद्यापीठ)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SSC / 10th Pass Certificate (min.)", "Maharashtra Domicile", "Passport Photo", "Bank Passbook"],
               hi: ["आधार कार्ड", "SSC / 10वीं पास प्रमाण पत्र (न्यूनतम)", "महाराष्ट्र अधिवास", "पासपोर्ट फोटो", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_mukhyamantri_saur_krishi_vahini",
    icon: "⚡", color: "#16A34A", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Energy Dept. / MSEDCL", hi: "महाराष्ट्र ऊर्जा विभाग / MSEDCL" },
    name:    { en: "Mukhyamantri Solar Krishi Vahini Yojana 2.0",              hi: "मुख्यमंत्री सौर कृषी वाहिनी योजना 2.0" },
    benefit: { en: "Daytime solar-powered agricultural electricity to farmers — eliminates night-time load shedding for irrigation; 119+ solar feeders commissioned (147 MW)", hi: "किसानों को दिन के समय सौर ऊर्जा से कृषि बिजली — सिंचाई के लिए रात की लोड शेडिंग समाप्त; 119+ सौर फीडर चालू (147 MW)" },
    tag:     { en: "Farmer / Solar / Electricity", hi: "किसान / सौर / बिजली" },
    annual: 15000,
    apply:   { en: "https://msedcl.in", hi: "msedcl.in / कृषि फीडर सोलराइजेशन पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Agricultural Electricity Connection Number (meter details)", "Bank Passbook"],
               hi: ["आधार कार्ड", "7/12 उतारा", "कृषि बिजली कनेक्शन क्रमांक (मीटर विवरण)", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && a.area === "rural",
  },

  // ── Construction Workers (MAHABOCW) ──────────────────────────────────────────

  {
    id: "maha_bandhkam_kamgar",
    icon: "🧱", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Building & Other Construction Workers Welfare Board (MAHABOCW)", hi: "महाराष्ट्र इमारत व इतर बांधकाम कामगार कल्याण मंडळ (MAHABOCW)" },
    name:    { en: "Bandhkam Kamgar Yojana – Construction Worker Welfare",      hi: "बांधकाम कामगार योजना – निर्माण कामगार कल्याण" },
    benefit: { en: "Bundle: ₹5L accidental death, ₹2L natural death, ₹15,000 maternity, ₹1L critical illness, ₹51,000 daughter marriage grant, ₹2,500–₹25,000/yr children scholarship, ₹10,000 tool grant, ₹2L housing aid", hi: "₹5L दुर्घटना मृत्यु, ₹2L स्वाभाविक मृत्यु, ₹15,000 मातृत्व, ₹1L गंभीर बीमारी, ₹51,000 बेटी विवाह, बच्चों की छात्रवृत्ति ₹2,500–₹25,000/वर्ष, ₹10,000 टूल अनुदान, ₹2L आवास सहायता" },
    tag:     { en: "Labour / Construction Worker", hi: "श्रमिक / बांधकाम कामगार" },
    annual: 15000,
    apply:   { en: "https://mahabocw.in", hi: "mahabocw.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Proof of 90 days construction work in last 12 months (employer certificate)", "Bank Passbook", "Passport Photo", "Age Proof", "Address Proof"],
               hi: ["आधार कार्ड", "पिछले 12 महीनों में 90 दिन बांधकाम कार्य प्रमाण (नियोक्ता प्रमाण पत्र)", "बैंक पासबुक", "पासपोर्ट फोटो", "आयु प्रमाण", "पता प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Fishermen ────────────────────────────────────────────────────────────────

  {
    id: "maha_matsyavyavasay_vima",
    icon: "🎣", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Fisheries Dept.", hi: "महाराष्ट्र मत्स्यव्यवसाय विभाग" },
    name:    { en: "Maharashtra Fishermen Group Accidental Insurance Scheme",   hi: "महाराष्ट्र मच्छीमार समूह अपघात विमा योजना" },
    benefit: { en: "₹5 Lakh accidental death + ₹2.5 Lakh partial disability insurance for registered marine/inland fishermen; state pays the premium", hi: "पंजीकृत समुद्री/अंतर्देशीय मच्छीमारों को ₹5 लाख दुर्घटना मृत्यु + ₹2.5 लाख आंशिक दिव्यांगता बीमा; प्रीमियम राज्य भरता है" },
    tag:     { en: "Fishermen / Insurance", hi: "मच्छीमार / बीमा" },
    annual: 0,
    apply:   { en: "fisheries.maharashtra.gov.in", hi: "fisheries.maharashtra.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Fishermen Identity Card / Registration Certificate", "Boat Registration Certificate (if applicable)", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "मच्छीमार पहचान पत्र / पंजीकरण प्रमाण पत्र", "बोट पंजीकरण प्रमाण (यदि लागू)", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_matsya_vikas",
    icon: "🐟", color: "#0891B2", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Fisheries Dept. (under PMMSY)", hi: "महाराष्ट्र मत्स्यव्यवसाय विभाग (PMMSY अंतर्गत)" },
    name:    { en: "Maharashtra Fisheries Development Scheme (PMMSY State Component)", hi: "महाराष्ट्र मत्स्यव्यवसाय विकास योजना (PMMSY राज्य घटक)" },
    benefit: { en: "40–60% subsidy on fishing boats, nets, aquaculture ponds, ice plants & fish kiosks; SC/ST/women fishers get up to 60% subsidy", hi: "मछली नाव, जाल, जलकृषि तालाब, बर्फ संयंत्र व मछली कियोस्क पर 40–60% सब्सिडी; SC/ST/महिला को 60% तक" },
    tag:     { en: "Fishermen / Aquaculture", hi: "मच्छीमार / जलकृषि" },
    annual: 75000,
    apply:   { en: "https://fisheries.maharashtra.gov.in", hi: "pmmsy.dof.gov.in / fisheries.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Fishermen / Aquaculture Farmer Registration", "Project Report / Cost Estimate", "Land / Water Body Documents", "Bank Passbook", "Caste Certificate (SC/ST for higher subsidy)"],
               hi: ["आधार कार्ड", "मच्छीमार / जलकृषि किसान पंजीकरण", "परियोजना रिपोर्ट / लागत अनुमान", "भूमि / जलाशय दस्तावेज", "बैंक पासबुक", "जाति प्रमाण (SC/ST अधिक सब्सिडी हेतु)"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Water Conservation ────────────────────────────────────────────────────────

  {
    id: "maha_jalyukt_shivar",
    icon: "💧", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Water Conservation Dept.", hi: "महाराष्ट्र जलसंधारण विभाग" },
    name:    { en: "Jalyukt Shivar Abhiyan 2.0 (Drought-Free Village Programme)", hi: "जलयुक्त शिवार अभियान 2.0 (दुष्काळमुक्त गाव कार्यक्रम)" },
    benefit: { en: "Free water conservation works (farm ponds, check dams, canal deepening) for drought-prone villages — improves irrigation & groundwater recharge for farmers", hi: "दुष्काळग्रस्त गांवों में मुफ्त जल संरक्षण कार्य (शेततळे, साखळी बंधारे, कालवा खोलीकरण) — किसानों के लिए सिंचाई व भूजल पुनर्भरण" },
    tag:     { en: "Farmer / Water Conservation", hi: "किसान / जलसंधारण" },
    annual: 0,
    apply:   { en: "Gram Panchayat / Panchayat Samiti / District Water Conservation Office", hi: "ग्राम पंचायत / पंचायत समिती / जिला जलसंधारण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Gram Panchayat Resolution", "Village Water Scarcity Report", "Land & Water Body Survey Map", "Aadhaar Card (applicant farmer)"],
               hi: ["ग्राम पंचायत ठराव", "गांव जल टंचाई रिपोर्ट", "भूमि व जलाशय सर्वे नक्शा", "आधार कार्ड (आवेदक किसान)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && a.area === "rural",
  },

  // ── Women – Girl Child & Marriage ─────────────────────────────────────────────

  {
    id: "maha_mazi_kanya_bhagyashree",
    icon: "👧", color: "#DB2777", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Development Dept.", hi: "महाराष्ट्र महिला व बाल विकास विभाग" },
    name:    { en: "Mazi Kanya Bhagyashree Yojana",                             hi: "माझी कन्या भाग्यश्री योजना" },
    benefit: { en: "₹50,000 FD in girl's name at birth (family income ≤₹7.5L); interest paid for education at key milestones + ₹1L at age 18 for higher education or marriage", hi: "जन्म पर बालिका के नाम ₹50,000 FD (परिवार आय ≤₹7.5 लाख); शिक्षा हेतु समय-समय पर ब्याज + 18 वर्ष पर ₹1 लाख" },
    tag:     { en: "Women / Girl Child / Savings", hi: "महिला / बालिका / बचत" },
    annual: 0,
    apply:   { en: "https://womenchild.maharashtra.gov.in", hi: "womenchild.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (parent)", "Girl Child's Birth Certificate", "Income Certificate (≤₹7.5L/year)", "Bank Account in girl's name", "Maharashtra Domicile", "Family Planning Certificate"],
               hi: ["आधार कार्ड (माता-पिता)", "बालिका का जन्म प्रमाण पत्र", "आय प्रमाण (≤₹7.5 लाख/वर्ष)", "बालिका के नाम बैंक खाता", "महाराष्ट्र अधिवास", "परिवार नियोजन प्रमाण पत्र"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_mukhyamantri_kanya_vivah",
    icon: "💍", color: "#9D174D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice & Special Assistance Dept.", hi: "महाराष्ट्र सामाजिक न्याय व विशेष सहाय्य विभाग" },
    name:    { en: "Mukhyamantri Kanya Vivah Yojana (Mass Marriage Scheme)",    hi: "मुख्यमंत्री कन्या विवाह योजना (सामूहिक विवाह योजना)" },
    benefit: { en: "₹10,000 cash gift to bride + ₹2,000 household items for BPL families marrying daughters at government-organised mass marriage events", hi: "सरकारी सामूहिक विवाह कार्यक्रम के माध्यम से BPL परिवारों की बेटी की शादी पर ₹10,000 नकद + ₹2,000 गृहस्थी सामान" },
    tag:     { en: "Women / Marriage / BPL", hi: "महिला / विवाह / BPL" },
    annual: 12000,
    apply:   { en: "aaplesarkar.mahaonline.gov.in / District Social Welfare Office", hi: "aaplesarkar.mahaonline.gov.in / जिला समाज कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (bride & groom)", "BPL / Income Certificate", "Age Proof (bride min. 18, groom min. 21)", "Ration Card", "Bank Passbook (bride's name)", "Caste Certificate (SC/ST/OBC)"],
               hi: ["आधार कार्ड (वधू और वर)", "BPL / आय प्रमाण पत्र", "आयु प्रमाण (वधू न्यूनतम 18, वर न्यूनतम 21)", "राशन कार्ड", "बैंक पासबुक (वधू के नाम)", "जाति प्रमाण (SC/ST/OBC के लिए)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Education – Overseas & Professional ──────────────────────────────────────

  {
    id: "maha_ambedkar_overseas_scholarship",
    icon: "✈️", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice Dept.", hi: "महाराष्ट्र सामाजिक न्याय विभाग" },
    name:    { en: "Dr. Babasaheb Ambedkar Overseas Scholarship (SC Students)", hi: "डॉ. बाबासाहेब आंबेडकर परदेशी शिष्यवृत्ती (SC विद्यार्थी)" },
    benefit: { en: "Full scholarship for SC students to study abroad — tuition + living + travel (up to ₹12 Lakh/year) for Master's / PhD at top global universities", hi: "SC छात्रों के विदेशी उच्च शिक्षा के लिए पूर्ण छात्रवृत्ति — ट्यूशन + जीवनयापन + यात्रा (₹12 लाख/वर्ष तक), मास्टर्स/PhD" },
    tag:     { en: "Student / SC / Overseas", hi: "छात्र / SC / विदेशी शिक्षा" },
    annual: 1200000,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "Income Certificate (family ≤₹6L/year)", "Admission Letter from QS Top-500 Foreign University", "Degree Marksheet (min. 60%)", "Bank Passbook", "Passport"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "आय प्रमाण (परिवार ≤₹6 लाख/वर्ष)", "QS Top-500 विदेशी विश्वविद्यालय का प्रवेश पत्र", "डिग्री मार्कशीट (न्यूनतम 60%)", "बैंक पासबुक", "पासपोर्ट"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_women_professional_fee",
    icon: "🎓", color: "#4F46E5", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Higher & Technical Education Dept.", hi: "महाराष्ट्र उच्च व तंत्र शिक्षण विभाग" },
    name:    { en: "100% Fee Reimbursement for Women in Professional Courses",  hi: "महिला छात्रांसाठी व्यावसायिक अभ्यासक्रम 100% शुल्क परतावा" },
    benefit: { en: "Full tuition & exam fee reimbursement for women enrolled in engineering, medical, pharmacy, law, MBA & other professional courses (Budget 2025 announcement)", hi: "इंजीनियरिंग, मेडिकल, फार्मसी, कानून, MBA व अन्य व्यावसायिक पाठ्यक्रमों में नामांकित महिलाओं को 100% ट्यूशन व परीक्षा शुल्क वापसी (बजट 2025)" },
    tag:     { en: "Student / Women / Professional", hi: "छात्र / महिला / व्यावसायिक" },
    annual: 150000,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "College Admission Letter & Fee Receipt", "Gender Certificate", "Income Certificate", "Maharashtra Domicile", "Previous Marksheet", "Bank Passbook"],
               hi: ["आधार कार्ड", "कॉलेज प्रवेश पत्र व शुल्क रसीद", "लिंग प्रमाण पत्र", "आय प्रमाण", "महाराष्ट्र अधिवास", "पिछले वर्ष की मार्कशीट", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && ["18to35"].includes(a.age),
  },

  // ── Poultry / Animal Husbandry ────────────────────────────────────────────────

  {
    id: "maha_kukut_palan_karj",
    icon: "🐔", color: "#B45309", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Animal Husbandry & Dairy Development Dept.", hi: "महाराष्ट्र पशुसंवर्धन व दुग्धव्यवसाय विभाग" },
    name:    { en: "Maharashtra Kukut Palan Karj Yojana (Poultry Farming Loan)", hi: "महाराष्ट्र कुक्कुटपालन कर्ज योजना" },
    benefit: { en: "Subsidised loan ₹1–₹10 Lakh at 4% interest to start or expand poultry farm; SC/ST/women/BPL get higher subsidy; NABARD-linked", hi: "कुक्कुटपालन शुरू या विस्तार हेतु 4% ब्याज पर ₹1–₹10 लाख लोन; SC/ST/महिला/BPL को अधिक सब्सिडी; NABARD से जुड़ा" },
    tag:     { en: "Farmer / Poultry / Animal Husbandry", hi: "किसान / कुक्कुटपालन / पशुसंवर्धन" },
    annual: 0,
    apply:   { en: "https://ahdmaharashtra.gov.in", hi: "ahdmaharashtra.gov.in / नजदीकी बैंक" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land / Shed Ownership Proof", "Project Report (bird count, breed, feed plan)", "Bank Passbook", "Caste Certificate (SC/ST for higher subsidy)", "Income Certificate"],
               hi: ["आधार कार्ड", "जमीन/शेड स्वामित्व प्रमाण", "परियोजना रिपोर्ट (पक्षी संख्या, नस्ल, चारा योजना)", "बैंक पासबुक", "जाति प्रमाण (SC/ST अधिक सब्सिडी हेतु)", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Sports ────────────────────────────────────────────────────────────────────

  {
    id: "maha_shiv_chhatrapati_sports",
    icon: "🏅", color: "#D97706", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Sports & Youth Welfare Dept.", hi: "महाराष्ट्र क्रीडा व युवक कल्याण विभाग" },
    name:    { en: "Shiv Chhatrapati Sports Award & Sports Nursery Scheme",     hi: "शिव छत्रपती क्रीडा पुरस्कार व क्रीडा रोपवाटिका योजना" },
    benefit: { en: "₹5 Lakh cash award + trophy for outstanding sportspersons + free coaching & kit under Sports Nursery Scheme for rural youth aged 8–19", hi: "उत्कृष्ट खिलाड़ियों को ₹5 लाख नकद + ट्रॉफी + क्रीडा रोपवाटिका के तहत 8–19 वर्ष ग्रामीण युवाओं को मुफ्त कोचिंग व किट" },
    tag:     { en: "Sports / Youth", hi: "क्रीडा / युवा" },
    annual: 500000,
    apply:   { en: "https://sports.maharashtra.gov.in", hi: "sports.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof", "Sports Achievement Certificates (district/state/national level)", "Maharashtra Domicile", "Photo", "Bank Passbook", "NOC from School / Club"],
               hi: ["आधार कार्ड", "आयु प्रमाण", "खेल उपलब्धि प्रमाण पत्र (जिला/राज्य/राष्ट्रीय स्तर)", "महाराष्ट्र अधिवास", "फोटो", "बैंक पासबुक", "स्कूल/क्लब से NOC"] },
    match: (a) => a.state === "Maharashtra" && ["18to35","below18"].includes(a.age),
  },

  // ── Senior Citizens ────────────────────────────────────────────────────────────

  {
    id: "maha_senior_citizen_cooperation",
    icon: "🤝", color: "#92400E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice Dept.", hi: "महाराष्ट्र सामाजिक न्याय विभाग" },
    name:    { en: "Maharashtra Senior Citizens Cooperation Scheme (Vriddhashram & Welfare)", hi: "महाराष्ट्र ज्येष्ठ नागरिक सहयोग योजना (वृद्धाश्रम व कल्याण)" },
    benefit: { en: "Free / subsidised old-age home + legal aid + helpline (1800) for ~1.25 crore senior citizens; maintenance allowance for destitute seniors not covered by other pensions", hi: "~1.25 करोड़ वरिष्ठ नागरिकों के लिए मुफ्त/रियायती वृद्धाश्रम + कानूनी सहायता + हेल्पलाइन (1800); अन्य पेंशन से वंचित असहाय वरिष्ठों को भत्ता" },
    tag:     { en: "Senior / Old Age Care", hi: "वरिष्ठ / वृद्धसेवा" },
    annual: 7200,
    apply:   { en: "aaplesarkar.mahaonline.gov.in / District Social Welfare Office", hi: "aaplesarkar.mahaonline.gov.in / जिला समाज कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Income Certificate", "Maharashtra Domicile (15+ years)", "No Pension / Family Support Declaration", "Bank Passbook"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "आय प्रमाण पत्र", "महाराष्ट्र अधिवास (15+ वर्ष)", "पेंशन/परिवार सहायता न होने का घोषणापत्र", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  // ── Dairy / Animal Husbandry ──────────────────────────────────────────────────

  {
    id: "maha_milch_animal_distribution",
    icon: "🐄", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Animal Husbandry & Dairy Development Dept.", hi: "महाराष्ट्र पशुसंवर्धन व दुग्धव्यवसाय विभाग" },
    name:    { en: "Milch Animal Distribution Scheme (2 Cows / Buffaloes)",    hi: "दुधाळ जनावरे वाटप योजना (2 गाय / म्हैस)" },
    benefit: { en: "50% subsidy (75% for SC/ST) on 2 crossbred milch cows or 2 buffaloes (unit value ₹1.57L–₹1.79L) to boost rural milk income for small farmers & SHG women", hi: "लघु किसानों व SHG महिलाओं को 2 दुधाळ गाय या म्हैस पर 50% सब्सिडी (SC/ST को 75%), एकक मूल्य ₹1.57L–₹1.79L" },
    tag:     { en: "Farmer / Dairy / Animal Husbandry", hi: "किसान / दुग्धव्यवसाय / पशुसंवर्धन" },
    annual: 0,
    apply:   { en: "ahdmaharashtra.gov.in / Zilla Parishad Animal Husbandry Office", hi: "ahdmaharashtra.gov.in / जिला परिषद पशुसंवर्धन कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract or BPL Certificate", "Caste Certificate (SC/ST for higher subsidy)", "SHG Certificate (if applicable)", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "7/12 उतारा या BPL प्रमाण पत्र", "जाति प्रमाण (SC/ST अधिक सब्सिडी हेतु)", "SHG प्रमाण पत्र (यदि लागू)", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_sheli_mendhi_palan",
    icon: "🐐", color: "#92400E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Animal Husbandry & Dairy Development Dept.", hi: "महाराष्ट्र पशुसंवर्धन व दुग्धव्यवसाय विभाग" },
    name:    { en: "Goat & Sheep Rearing Scheme (Sheli-Mendhi Gat Vatap)",     hi: "शेळी-मेंढी गट वाटप योजना" },
    benefit: { en: "50% subsidy (75% SC/ST) on a unit of 10 goats/sheep + 1 buck/ram (Osmanabadi/Sangamaneri breed); unit value ₹78,000–₹1.29L for supplementary farm income", hi: "10 शेळी/मेंढी + 1 बोकड/बकरा (ओसमानाबादी/सांगमनेरी नस्ल) के एकक पर 50% सब्सिडी (SC/ST को 75%), एकक मूल्य ₹78,000–₹1.29L" },
    tag:     { en: "Farmer / Goat / Sheep / Animal Husbandry", hi: "किसान / शेळी / मेंढी / पशुसंवर्धन" },
    annual: 0,
    apply:   { en: "ahdmaharashtra.gov.in / Zilla Parishad Animal Husbandry Office", hi: "ahdmaharashtra.gov.in / जिला परिषद पशुसंवर्धन कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract / BPL Certificate", "Caste Certificate (SC/ST for 75% subsidy)", "Income Certificate", "Bank Passbook", "Shed/Grazing Land Proof"],
               hi: ["आधार कार्ड", "7/12 उतारा / BPL प्रमाण", "जाति प्रमाण (SC/ST 75% सब्सिडी हेतु)", "आय प्रमाण पत्र", "बैंक पासबुक", "शेड/चराई भूमि प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  // ── Street Vendors & Urban Informal Workers ───────────────────────────────────

  {
    id: "maha_pm_svanidhi",
    icon: "🛒", color: "#D97706", scope: "state", state: "Maharashtra",
    ministry: { en: "Ministry of Housing & Urban Affairs (implemented by Maharashtra ULBs)", hi: "आवासन व शहरी कार्य मंत्रालय (महाराष्ट्र नगरपालिकाओं द्वारा क्रियान्वित)" },
    name:    { en: "PM SVANidhi – Street Vendor Micro-Credit Scheme (2025 Revamp)", hi: "PM SVANidhi – पथविक्रेता सूक्ष्म ऋण योजना (2025 पुनर्गठन)" },
    benefit: { en: "Collateral-free loans: ₹15,000 (1st), ₹25,000 (2nd), ₹50,000 (3rd tranche) + 7% interest subsidy + UPI-linked RuPay credit card (₹30,000 limit) + ₹1,200/yr cashback on digital payments", hi: "बिना गारंटी लोन: ₹15,000 (1ली), ₹25,000 (2री), ₹50,000 (3री किस्त) + 7% ब्याज सब्सिडी + UPI-लिंक्ड RuPay क्रेडिट कार्ड (₹30,000 सीमा) + डिजिटल भुगतान पर ₹1,200/वर्ष कैशबैक" },
    tag:     { en: "Street Vendor / Urban / Micro Credit", hi: "पथविक्रेता / शहरी / सूक्ष्म ऋण" },
    annual: 1200,
    apply:   { en: "https://pmsvanidhi.mohua.gov.in", hi: "pmsvanidhi.mohua.gov.in / नजदीकी नगरपालिका कार्यालय या बैंक" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Vending Certificate / Letter of Recommendation from ULB / Town Vending Committee", "Bank Passbook", "Passport Photo", "Mobile Number (for UPI)"],
               hi: ["आधार कार्ड", "वेंडिंग प्रमाण पत्र / ULB/टाउन वेंडिंग कमेटी से अनुशंसा पत्र", "बैंक पासबुक", "पासपोर्ट फोटो", "मोबाइल नंबर (UPI हेतु)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "business" && ["urban","semi"].includes(a.area) && ["below1","1to3"].includes(a.income),
  },

  // ── Handloom Weavers ──────────────────────────────────────────────────────────

  {
    id: "maha_handloom_weaver_welfare",
    icon: "🧵", color: "#4F46E5", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Textile & Handloom Dept.", hi: "महाराष्ट्र वस्त्रोद्योग व हातमाग विभाग" },
    name:    { en: "Handloom Weavers Comprehensive Welfare Scheme (Maharashtra)", hi: "हातमाग विणकर सर्वसमावेशक कल्याण योजना (महाराष्ट्र)" },
    benefit: { en: "Life & accident insurance (PMJJBY + PMSBY) + ₹15,000 health package + 90% subsidy on new loom/accessories (Hathkargha Samvardhan Sahayata) for registered handloom weavers", hi: "पंजीकृत हातमाग विणकरों को PMJJBY + PMSBY बीमा + ₹15,000 स्वास्थ्य पैकेज + नया करघा/सहायक उपकरण पर 90% सब्सिडी (हस्तकरघा समवर्धन सहायता)" },
    tag:     { en: "Artisan / Handloom / Weaver", hi: "कारीगर / हातमाग / विणकर" },
    annual: 15000,
    apply:   { en: "handloom.maharashtra.gov.in / nearest District Handloom Office", hi: "handloom.maharashtra.gov.in / नजदीकी जिला हातमाग कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Handloom Weaver Identity Card / Registration", "Loom Ownership Proof", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "हातमाग विणकर पहचान पत्र / पंजीकरण", "करघा स्वामित्व प्रमाण", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Horticulture ─────────────────────────────────────────────────────────────

  {
    id: "maha_sant_savata_mali_horticulture",
    icon: "🌿", color: "#15803D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Horticulture Dept. (NHM component)", hi: "महाराष्ट्र फलोत्पादन विभाग (NHM घटक)" },
    name:    { en: "Sant Savata Mali Horticulture Scheme (Fruit & Vegetable Cultivation)", hi: "संत सावता माळी फलोत्पादन योजना (फळबाग व भाजीपाला लागवड)" },
    benefit: { en: "50% subsidy on fruit orchard establishment (mango, banana, pomegranate, grapes) + drip irrigation + protected cultivation (polyhouse) under National Horticulture Mission", hi: "राष्ट्रीय फलोत्पादन मिशन के तहत फळबाग लागवड (आम, केला, डाळिंब, द्राक्षे) + ठिबक सिंचन + संरक्षित शेती (पॉलीहाउस) पर 50% सब्सिडी" },
    tag:     { en: "Farmer / Horticulture", hi: "किसान / फलोत्पादन" },
    annual: 35000,
    apply:   { en: "https://horticulture.maharashtra.gov.in", hi: "horticulture.maharashtra.gov.in / MahaDBT पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Soil & Water Test Report", "Bank Passbook", "Photograph of Farm Land", "Caste Certificate (SC/ST for higher subsidy)"],
               hi: ["आधार कार्ड", "7/12 उतारा", "मिट्टी व पानी जांच रिपोर्ट", "बैंक पासबुक", "खेत की फोटो", "जाति प्रमाण (SC/ST अधिक सब्सिडी हेतु)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  // ── VJNT / Nomadic Tribes ──────────────────────────────────────────────────────

  {
    id: "maha_vjnt_scholarship",
    icon: "📖", color: "#B45309", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra VJNT, OBC & SBC Welfare Dept.", hi: "महाराष्ट्र VJNT, OBC व SBC कल्याण विभाग" },
    name:    { en: "Post-Matric Scholarship for VJNT / NT / SBC Students",     hi: "VJNT / NT / SBC विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती" },
    benefit: { en: "Full tuition fee + ₹250–₹550/month maintenance allowance for VJNT/NT/SBC students in degree & diploma courses (income ≤₹2.5L/year)", hi: "VJNT/NT/SBC छात्रों को डिग्री व डिप्लोमा पाठ्यक्रमों में पूर्ण ट्यूशन शुल्क + ₹250–₹550/माह भत्ता (आय ≤₹2.5 लाख/वर्ष)" },
    tag:     { en: "Student / VJNT / Nomadic Tribe", hi: "छात्र / VJNT / भटक्या जाती" },
    annual: 6600,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "VJNT / NT / SBC Caste Certificate", "Income Certificate (≤₹2.5L/year)", "Previous Year Mark Sheet", "College Bonafide & Fee Receipt", "Bank Passbook"],
               hi: ["आधार कार्ड", "VJNT / NT / SBC जाति प्रमाण पत्र", "आय प्रमाण (≤₹2.5 लाख/वर्ष)", "पिछले वर्ष की मार्कशीट", "कॉलेज बोनाफाइड व शुल्क रसीद", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "maha_vjnt_housing",
    icon: "🏠", color: "#92400E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra VJNT, OBC & SBC Welfare Dept.", hi: "महाराष्ट्र VJNT, OBC व SBC कल्याण विभाग" },
    name:    { en: "Yashwantrao Chavan Mukta Vasahat Yojana (VJNT Housing)",   hi: "यशवंतराव चव्हाण मुक्त वसाहत योजना (VJNT आवास)" },
    benefit: { en: "Free permanent settlement (plot + pucca house construction grant ₹1.5L) for de-notified & nomadic tribe families currently living in temporary shelters", hi: "अस्थायी आश्रयस्थान में रहने वाले विमुक्त व भटक्या जाती परिवारों को मुफ्त स्थायी वसाहत (प्लॉट + ₹1.5 लाख पक्का मकान अनुदान)" },
    tag:     { en: "Housing / VJNT / Nomadic Tribe", hi: "आवास / VJNT / भटक्या जाती" },
    annual: 150000,
    apply:   { en: "vjnt.maharashtra.gov.in / District VJNT Welfare Office", hi: "vjnt.maharashtra.gov.in / जिला VJNT कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "VJNT / NT Caste Certificate", "No Permanent House Declaration", "Ration Card / BPL Certificate", "Maharashtra Domicile", "Bank Passbook"],
               hi: ["आधार कार्ड", "VJNT / NT जाति प्रमाण पत्र", "स्थायी मकान न होने का घोषणापत्र", "राशन कार्ड / BPL प्रमाण पत्र", "महाराष्ट्र अधिवास", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  },

  // ── Migrant / Inter-State Workers ─────────────────────────────────────────────

  {
    id: "maha_sthalantar_kamgar",
    icon: "🚌", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Labour Dept.", hi: "महाराष्ट्र कामगार विभाग" },
    name:    { en: "Maharashtra Sthalantar Kamgar Kalyan Scheme (Migrant Worker Welfare)", hi: "महाराष्ट्र स्थलांतर कामगार कल्याण योजना" },
    benefit: { en: "Registration + helpline support + access to food, shelter & medical aid for inter-state migrant workers employed in Maharashtra; state-level nodal centres in 6 major cities", hi: "महाराष्ट्र में कार्यरत अंतर-राज्यीय प्रवासी कामगारों का पंजीकरण + हेल्पलाइन सहायता + भोजन, आश्रय व चिकित्सा सहायता; 6 प्रमुख शहरों में नोडल केंद्र" },
    tag:     { en: "Labour / Migrant Worker", hi: "श्रमिक / स्थलांतर कामगार" },
    annual: 0,
    apply:   { en: "https://mahalabour.gov.in", hi: "mahalabour.gov.in / e-Shram पोर्टल (eshram.gov.in)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "e-Shram UAN Card", "Employer Contract / Letter", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "e-Shram UAN कार्ड", "नियोक्ता अनुबंध / पत्र", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Urban Sanitation ──────────────────────────────────────────────────────────

  {
    id: "maha_slum_sanitation",
    icon: "🚿", color: "#0891B2", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Urban Development Dept. / Swachh Bharat Mission (Urban)", hi: "महाराष्ट्र नगरविकास विभाग / स्वच्छ भारत मिशन (शहरी)" },
    name:    { en: "Individual Household Toilet (IHHL) Construction Scheme – SBM Urban", hi: "वैयक्तिक घरगुती शौचालय बांधकाम योजना – SBM शहरी" },
    benefit: { en: "₹15,000 grant for BPL / EWS urban households to construct individual toilets + ODF+ certification support for slum communities", hi: "BPL / EWS शहरी परिवारों को वैयक्तिक शौचालय बांधणीसाठी ₹15,000 अनुदान + झोपडपट्टी समुदायांना ODF+ प्रमाणपत्र सहाय्य" },
    tag:     { en: "Sanitation / Urban Poor / BPL", hi: "स्वच्छता / शहरी गरीब / BPL" },
    annual: 15000,
    apply:   { en: "https://swachhbharaturban.gov.in", hi: "swachhbharaturban.gov.in / स्थानीय नगरपालिका वार्ड कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Ration Card", "House Ownership / Tenancy Proof", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण", "राशन कार्ड", "मकान स्वामित्व / किरायेदारी प्रमाण", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["urban","semi"].includes(a.area) && ["below1","1to3"].includes(a.income),
  },

  // ── Journalist Welfare ────────────────────────────────────────────────────────

  {
    id: "maha_patrakar_arogya",
    icon: "📰", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Information & Public Relations Dept.", hi: "महाराष्ट्र माहिती व जनसंपर्क विभाग" },
    name:    { en: "Patrakar Arogya Vima Yojana (Journalist Health Insurance Scheme)", hi: "पत्रकार आरोग्य विमा योजना" },
    benefit: { en: "₹5 Lakh health insurance (cashless hospitalisation) + ₹10 Lakh accident cover for accredited journalists and their dependents; state pays premium", hi: "मान्यताप्राप्त पत्रकारों और उनके परिजनों को ₹5 लाख स्वास्थ्य बीमा (कॅशलेस उपचार) + ₹10 लाख अपघात विमा; प्रीमियम राज्य सरकार भरते" },
    tag:     { en: "Journalist / Health Insurance", hi: "पत्रकार / आरोग्य विमा" },
    annual: 0,
    apply:   { en: "mahainfo.maharashtra.gov.in / District Information Office", hi: "mahainfo.maharashtra.gov.in / जिला माहिती कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Press Accreditation Card (Maharashtra Government)", "Employer Certificate (newspaper/channel)", "Dependent Details (family)", "Bank Passbook"],
               hi: ["आधार कार्ड", "प्रेस अभिस्वीकृती कार्ड (महाराष्ट्र सरकार)", "नियोक्ता प्रमाण पत्र (अखबार/चैनल)", "परिजनों का विवरण", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra",
  },

  // ── Entrepreneur / Startup ────────────────────────────────────────────────────

  {
    id: "maha_mukhyamantri_udyojak",
    icon: "🏭", color: "#0F766E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Industries, Energy & Labour Dept.", hi: "महाराष्ट्र उद्योग, ऊर्जा व कामगार विभाग" },
    name:    { en: "Mukhyamantri Rojgar Nirman Karyakram (CMEGP) – Micro Enterprise",  hi: "मुख्यमंत्री रोजगार निर्मिती कार्यक्रम (CMEGP) – सूक्ष्म उद्योग" },
    benefit: { en: "15–35% subsidy on project cost (₹5L–₹50L) to set up micro enterprises in manufacturing or service sector; urban 15%, rural 25%, SC/ST/women/disabled 35%", hi: "सूक्ष्म उद्योग (₹5L–₹50L) स्थापनेसाठी परियोजना लागत पर 15–35% सब्सिडी; शहरी 15%, ग्रामीण 25%, SC/ST/महिला/दिव्यांग 35%" },
    tag:     { en: "Business / Entrepreneur / Micro Enterprise", hi: "व्यापार / उद्योजक / सूक्ष्म उद्योग" },
    annual: 0,
    apply:   { en: "https://maha-cmegp.gov.in", hi: "maha-cmegp.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "8th Pass Certificate (minimum)", "Business / Project Report", "Quotations for Machinery", "Caste / Disability / Domicile Certificate (as applicable)", "Bank Passbook"],
               hi: ["आधार कार्ड", "8वीं पास प्रमाण पत्र (न्यूनतम)", "व्यापार / परियोजना रिपोर्ट", "मशीनरी की कोटेशन", "जाति / दिव्यांगता / अधिवास प्रमाण (यदि लागू)", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "business" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Senior Citizens – Pilgrimage ──────────────────────────────────────────────

  {
    id: "maha_teerth_darshan",
    icon: "🛕", color: "#B45309", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Tourism Dept. / IRCTC (MoU 2024)", hi: "महाराष्ट्र पर्यटन विभाग / IRCTC (MoU 2024)" },
    name:    { en: "Mukhyamantri Teerth Darshan Yojana (Free Senior Pilgrimage)", hi: "मुख्यमंत्री तीर्थ दर्शन योजना (वरिष्ठांसाठी मुफ्त तीर्थयात्रा)" },
    benefit: { en: "Free once-in-a-lifetime pilgrimage to 139 religious sites across India (all faiths) for senior citizens aged 60+. Covers train travel, food, accommodation. ₹30,000 per person borne by state. Citizens above 75 may bring one caretaker.", hi: "60+ वर्ष वरिष्ठ नागरिकों को भारत के 139 तीर्थस्थलों (सभी धर्म) की जीवनकाल में एक बार मुफ्त यात्रा — ट्रेन, भोजन, आवास सहित। राज्य ₹30,000/व्यक्ति वहन करता है। 75+ वर्ष के नागरिक एक सहायक साथ ले सकते हैं।" },
    tag:     { en: "Senior / Pilgrimage / Free Travel", hi: "वरिष्ठ / तीर्थयात्रा / मुफ्त प्रवास" },
    annual: 30000,
    apply:   { en: "https://aaplesarkar.mahaonline.gov.in", hi: "aaplesarkar.mahaonline.gov.in / जिला कलेक्टर कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Income Certificate (≤₹2.5L/year)", "Maharashtra Domicile", "Passport-size Photo", "Caretaker Aadhaar (if 75+)"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "आय प्रमाण (≤₹2.5 लाख/वर्ष)", "महाराष्ट्र अधिवास", "पासपोर्ट फोटो", "सहायक का आधार (75+ वर्ष के लिए)"] },
    match: (a) => a.state === "Maharashtra" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  // ── Girl Child ────────────────────────────────────────────────────────────────

  {
    id: "maha_lek_ladki",
    icon: "👶", color: "#DB2777", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Development Dept.", hi: "महाराष्ट्र महिला व बाल विकास विभाग" },
    name:    { en: "Lek Ladki Yojana (Girl Child Financial Empowerment)",       hi: "लेक लाडकी योजना (बालिका आर्थिक सक्षमीकरण)" },
    benefit: { en: "₹1,01,000 total in 5 instalments from birth to age 18: ₹5,000 at birth → ₹6,000 (Class 1) → ₹7,000 (Class 6) → ₹8,000 (Class 11) → ₹75,000 lump-sum at 18. For yellow/orange ration card families.", hi: "जन्म से 18 वर्ष तक 5 किश्तों में कुल ₹1,01,000: जन्म पर ₹5,000 → कक्षा 1 में ₹6,000 → कक्षा 6 में ₹7,000 → कक्षा 11 में ₹8,000 → 18 वर्ष पर ₹75,000 एकमुश्त। पीले/नारंगी राशन कार्ड धारक परिवारों के लिए।" },
    tag:     { en: "Women / Girl Child / Education", hi: "महिला / बालिका / शिक्षा" },
    annual: 0,
    apply:   { en: "https://womenchild.maharashtra.gov.in", hi: "womenchild.maharashtra.gov.in / अंगणवाडी केंद्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (parent)", "Girl Child's Birth Certificate (born after Apr 1, 2023)", "Yellow / Orange Ration Card", "Bank Account in girl's name", "Maharashtra Domicile"],
               hi: ["आधार कार्ड (माता-पिता)", "बालिका का जन्म प्रमाण पत्र (1 अप्रैल 2023 के बाद जन्म)", "पीला/नारंगी राशन कार्ड", "बालिका के नाम बैंक खाता", "महाराष्ट्र अधिवास"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Health – MJPJAY Expansion ─────────────────────────────────────────────────

  {
    id: "maha_mjpjay",
    icon: "🏥", color: "#0891B2", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Health Dept. (State + Ayushman Bharat integration)", hi: "महाराष्ट्र आरोग्य विभाग (राज्य + आयुष्मान भारत एकत्रीकरण)" },
    name:    { en: "Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY) 2025",    hi: "महात्मा जोतिबा फुले जन आरोग्य योजना (MJPJAY) 2025" },
    benefit: { en: "Cashless hospitalisation up to ₹1.5L/year (₹2.5L for renal transplants) across 1,000+ empanelled hospitals. Since July 2024, integrated with AB-PMJAY covering all Maharashtra families. 1,000+ surgeries & therapies covered.", hi: "1,000+ सूचीबद्ध अस्पतालों में ₹1.5L/वर्ष तक कॅशलेस उपचार (गुर्दा प्रत्यारोपण ₹2.5L)। जुलाई 2024 से AB-PMJAY के साथ एकत्रित — महाराष्ट्र के सभी परिवार पात्र।" },
    tag:     { en: "Health / Cashless Treatment", hi: "आरोग्य / कॅशलेस उपचार" },
    annual: 150000,
    apply:   { en: "https://jeevandayee.gov.in", hi: "jeevandayee.gov.in / नजदीकी सूचीबद्ध अस्पताल आरोग्यमित्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Yellow / Orange / Antyodaya / Annapurna Ration Card", "Ayushman Card (if available)", "Income Certificate (for non-ration card holders)"],
               hi: ["आधार कार्ड", "पीला/नारंगी/अंत्योदय/अन्नपूर्णा राशन कार्ड", "आयुष्मान कार्ड (यदि उपलब्ध)", "आय प्रमाण पत्र (राशन कार्ड न होने पर)"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Beekeeping / Apiculture ───────────────────────────────────────────────────

  {
    id: "maha_madhmakhi_palan",
    icon: "🐝", color: "#CA8A04", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture / Horticulture Dept. (National Beekeeping & Honey Mission)", hi: "महाराष्ट्र कृषि / फलोत्पादन विभाग (राष्ट्रीय मधुमक्खी पालन व मध अभियान)" },
    name:    { en: "National Beekeeping & Honey Mission – Maharashtra Component",  hi: "राष्ट्रीय मधुमक्खी पालन व मध अभियान – महाराष्ट्र घटक" },
    benefit: { en: "80% subsidy on beehive boxes, equipment & training to start/expand beekeeping units. Up to 50 boxes per farmer; SC/ST/women get priority. Supports honey production & crop pollination income.", hi: "मधुमक्खी पालन सुरू/विस्तारसाठी मधुपेटी, उपकरणे व प्रशिक्षणावर 80% सब्सिडी। प्रति शेतकरी 50 पेटी पर्यंत; SC/ST/महिलांना प्राधान्य। मध उत्पादन व परागीभवन उत्पन्नास मदत।" },
    tag:     { en: "Farmer / Beekeeping / Apiculture", hi: "किसान / मधुमक्खी पालन / मधुपालन" },
    annual: 20000,
    apply:   { en: "https://horticulture.maharashtra.gov.in", hi: "horticulture.maharashtra.gov.in / mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract or Farm Land Proof", "Caste Certificate (SC/ST for priority)", "Bank Passbook", "Passport Photo", "Training Certificate (if completed)"],
               hi: ["आधार कार्ड", "7/12 उतारा या खेत प्रमाण", "जाति प्रमाण (SC/ST प्राधान्यासाठी)", "बैंक पासबुक", "पासपोर्ट फोटो", "प्रशिक्षण प्रमाण पत्र (पूर्ण झाल्यास)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Agri Cold Storage / Processing ────────────────────────────────────────────

  {
    id: "maha_agri_infra_fund",
    icon: "🏗️", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept. / NABARD (AIF – Agriculture Infrastructure Fund)", hi: "महाराष्ट्र कृषि विभाग / NABARD (कृषी पायाभूत सुविधा निधी)" },
    name:    { en: "Agriculture Infrastructure Fund (AIF) – Maharashtra",         hi: "कृषी पायाभूत सुविधा निधी (AIF) – महाराष्ट्र" },
    benefit: { en: "3% interest subvention on loans up to ₹2 Crore for post-harvest infrastructure (cold storage, warehouses, processing units, primary processing centres) for farmers, FPOs & agri-entrepreneurs", hi: "किसान, FPO व कृषी उद्योजकांसाठी कापणीपश्चात पायाभूत सुविधा (शीतगृह, गोदाम, प्रक्रिया युनिट) साठी ₹2 कोटींपर्यंत कर्जावर 3% व्याज सवलत" },
    tag:     { en: "Farmer / Agri Processing / Cold Storage", hi: "किसान / कृषी प्रक्रिया / शीतगृह" },
    annual: 0,
    apply:   { en: "https://agriinfra.dac.gov.in", hi: "agriinfra.dac.gov.in / mahadbt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card / Company PAN", "Project Report / DPR", "Land Ownership / Lease Deed", "Bank Loan Sanction Letter", "7/12 Land Extract (farmers)", "FPO / Society Registration (if applicable)"],
               hi: ["आधार कार्ड / कंपनी PAN", "परियोजना रिपोर्ट / DPR", "भूमि स्वामित्व / लीज डीड", "बैंक लोन स्वीकृति पत्र", "7/12 उतारा (किसानों के लिए)", "FPO / सोसायटी पंजीकरण (यदि लागू)"] },
    match: (a) => a.state === "Maharashtra" && (a.who === "farmer" || a.who === "business") && ["3to6","6to10","above10"].includes(a.income),
  },

  // ── Sericulture ───────────────────────────────────────────────────────────────

  {
    id: "maha_resham_udyog",
    icon: "🪱", color: "#7C3AED", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Sericulture Dept. / Central Silk Board", hi: "महाराष्ट्र रेशीम संचालनालय / केंद्रीय रेशीम बोर्ड" },
    name:    { en: "Maharashtra Sericulture Development Scheme (Mulberry Silk Farming)", hi: "महाराष्ट्र रेशीम विकास योजना (तुती रेशीम शेती)" },
    benefit: { en: "50–75% subsidy on mulberry plantation, rearing equipment & silk reeling units; free training + ₹10,000 startup support for new sericulture farmers in Marathwada & Vidarbha", hi: "तुती लागवड, संगोपन उपकरणे व सूत काढण्याच्या युनिटवर 50–75% सब्सिडी; मराठवाडा व विदर्भातील नवीन रेशीम शेतकऱ्यांना मुफ्त प्रशिक्षण + ₹10,000 प्रारंभ सहाय्य" },
    tag:     { en: "Farmer / Sericulture / Silk", hi: "किसान / रेशीम शेती / सिल्क" },
    annual: 25000,
    apply:   { en: "silkmMaharashtra.gov.in / District Sericulture Officer", hi: "silkmMaharashtra.gov.in / जिला रेशीम अधिकारी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract (min. 0.5 acre for mulberry)", "Bank Passbook", "Caste Certificate (SC/ST for higher subsidy)", "Training Completion Certificate (if available)"],
               hi: ["आधार कार्ड", "7/12 उतारा (न्यूनतम 0.5 एकड़ तुती लागवडीसाठी)", "बैंक पासबुक", "जाति प्रमाण (SC/ST अधिक सब्सिडी हेतु)", "प्रशिक्षण पूर्णता प्रमाण पत्र (उपलब्ध असल्यास)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Digital / AI Agriculture ──────────────────────────────────────────────────

  {
    id: "maha_ai_agriculture_policy",
    icon: "🤖", color: "#0F766E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept. / IT Dept.", hi: "महाराष्ट्र कृषि विभाग / माहिती तंत्रज्ञान विभाग" },
    name:    { en: "Maharashtra AI Agriculture Policy & Digital Farm Scheme 2025", hi: "महाराष्ट्र AI कृषी धोरण व डिजिटल शेती योजना 2025" },
    benefit: { en: "India's first state AI Agriculture Policy (₹500 Cr budget) — free AI-based soil & crop advisory via WhatsApp/app, digital farmer ID, smart farm schools, satellite crop monitoring & precision farming tools for 50,000+ farmers", hi: "भारताचे पहिले राज्य AI कृषी धोरण (₹500 कोटी बजेट) — WhatsApp/ॲपद्वारे मुफ्त AI आधारित माती व पीक सल्ला, डिजिटल शेतकरी ओळखपत्र, स्मार्ट शेती शाळा व उपग्रह पीक निरीक्षण" },
    tag:     { en: "Farmer / Digital / AI Agriculture", hi: "किसान / डिजिटल / AI शेती" },
    annual: 0,
    apply:   { en: "https://mahadbt.gov.in", hi: "mahadbt.gov.in / CropSAP ॲप / WhatsApp हेल्पलाइन 14447" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Farmer Registry / Digital Farmer ID", "7/12 Land Extract", "Mobile Number (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "शेतकरी नोंदणी / डिजिटल शेतकरी ओळखपत्र", "7/12 उतारा", "मोबाइल नंबर (आधार से लिंक)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  // ── Youth – Employment ────────────────────────────────────────────────────────

  {
    id: "maha_ladka_bhau",
    icon: "👨‍🎓", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Skills, Employment, Entrepreneurship & Innovation Dept.", hi: "महाराष्ट्र कौशल, रोजगार, उद्योजकता व नवोपक्रम विभाग" },
    name:    { en: "Mukhyamantri Majha Ladka Bhau Yojana (Youth Employment Stipend)", hi: "मुख्यमंत्री माझा लाडका भाऊ योजना (युवा रोजगार वेतन)" },
    benefit: { en: "Monthly stipend ₹6,000–₹10,000 for unemployed youth (18–35) during vocational training/apprenticeship + job placement support; complements Ladki Bahin scheme", hi: "व्यावसायिक प्रशिक्षण/अप्रेंटिसशिप दरम्यान 18–35 वर्षांच्या बेरोजगार युवकांना ₹6,000–₹10,000/माह वेतन + रोजगार प्लेसमेंट सहाय्य" },
    tag:     { en: "Youth / Employment / Stipend", hi: "युवा / रोजगार / वेतन" },
    annual: 120000,
    apply:   { en: "https://rojgar.mahaswayam.gov.in", hi: "rojgar.mahaswayam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Certificate (12th/ITI/Diploma/Graduate)", "Maharashtra Domicile", "Unemployment Registration Certificate", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "शैक्षणिक प्रमाण पत्र (12वीं/ITI/डिप्लोमा/ग्रेजुएट)", "महाराष्ट्र अधिवास", "बेरोजगारी पंजीकरण प्रमाण पत्र", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["18to35"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Unorganised Workers ───────────────────────────────────────────────────────

  {
    id: "maha_pm_shram_yogi",
    icon: "👷", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Labour Dept. (PM-SYM – Central scheme implemented in Maharashtra)", hi: "महाराष्ट्र कामगार विभाग (PM-SYM – महाराष्ट्रात राबवण्यात आलेली केंद्रीय योजना)" },
    name:    { en: "PM Shram Yogi Maandhan Yojana (PM-SYM) – Unorganised Worker Pension", hi: "PM श्रम योगी मानधन योजना (PM-SYM) – असंघटित कामगार पेंशन" },
    benefit: { en: "₹3,000/month guaranteed pension at age 60 for unorganised workers. Contribution ₹55–₹200/month (age 18–40); central govt contributes equal matching amount. Spouse also eligible at same contribution.", hi: "असंघटित कामगारांना 60 वर्षांनंतर ₹3,000/माह गॅरंटीड पेंशन। 18–40 वयोगटात ₹55–₹200/माह योगदान; केंद्र सरकार समान रक्कम योगदान देते। पती/पत्नी देखील पात्र।" },
    tag:     { en: "Labour / Pension / Unorganised Worker", hi: "श्रमिक / पेंशन / असंघटित कामगार" },
    annual: 36000,
    apply:   { en: "https://maandhan.in", hi: "maandhan.in / CSC / eshram.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account (Aadhaar-linked)", "Mobile Number", "Age Proof", "e-Shram UAN Card (recommended)", "Self-declaration of monthly income ≤₹15,000"],
               hi: ["आधार कार्ड", "बचत बैंक खाता (आधार लिंक)", "मोबाइल नंबर", "आयु प्रमाण", "e-Shram UAN कार्ड (अनुशंसित)", "मासिक आय ≤₹15,000 का स्व-घोषणापत्र"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Minorities – Self Employment ──────────────────────────────────────────────

  {
    id: "maha_minority_self_employment",
    icon: "🕌", color: "#0F766E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Minority Development Dept. / MSDFC", hi: "महाराष्ट्र अल्पसंख्याक विकास विभाग / MSDFC" },
    name:    { en: "Maharashtra State Minorities Finance & Development Corporation Loan Scheme", hi: "महाराष्ट्र राज्य अल्पसंख्याक वित्त व विकास महामंडळ कर्ज योजना" },
    benefit: { en: "Soft loan ₹50,000–₹5 Lakh at 4–6% interest for self-employment / small business for minorities (Muslim, Christian, Buddhist, Sikh, Jain, Parsi); income ≤₹3L/year", hi: "मुस्लिम, ख्रिश्चन, बौद्ध, शीख, जैन, पारसी अल्पसंख्याकांसाठी स्वयंरोजगार / छोटा व्यवसायासाठी ₹50,000–₹5 लाख 4–6% व्याजावर सॉफ्ट लोन; उत्पन्न ≤₹3 लाख/वर्ष" },
    tag:     { en: "Business / Minority / Self Employment", hi: "व्यापार / अल्पसंख्याक / स्वयंरोजगार" },
    annual: 0,
    apply:   { en: "msdfc.maharashtra.gov.in / District Minority Welfare Office", hi: "msdfc.maharashtra.gov.in / जिला अल्पसंख्याक कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "Income Certificate (≤₹3L/year)", "Business Plan", "Bank Passbook", "Two Guarantors"],
               hi: ["आधार कार्ड", "अल्पसंख्याक समुदाय प्रमाण पत्र", "आय प्रमाण (≤₹3 लाख/वर्ष)", "व्यापार योजना", "बैंक पासबुक", "दो जमानतदार"] },
    match: (a) => a.state === "Maharashtra" && a.who === "business" && ["below1","1to3"].includes(a.income),
  },

  // ── Child Welfare ─────────────────────────────────────────────────────────────

  {
    id: "maha_bal_sangopan",
    icon: "🧒", color: "#9D174D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Development Dept.", hi: "महाराष्ट्र महिला व बाल विकास विभाग" },
    name:    { en: "Bal Sangopan Yojana (Foster Care & Child Support Scheme)",   hi: "बाल संगोपन योजना (पालकत्व व बाल सहाय्य योजना)" },
    benefit: { en: "₹1,125/month per child support for orphans, children of single parents, or families in crisis placed in foster care; covers nutrition, clothing & education costs", hi: "अनाथ, एकल पालक, संकटग्रस्त कुटुंबातील मुलांना पालकत्व सेवेत ठेवण्यासाठी ₹1,125/माह प्रति बालक सहाय्य; पोषण, कपडे व शिक्षण खर्च समाविष्ट" },
    tag:     { en: "Child Welfare / Orphan / Foster Care", hi: "बाल कल्याण / अनाथ / पालकत्व" },
    annual: 13500,
    apply:   { en: "womenchild.maharashtra.gov.in / Child Development Project Officer (CDPO)", hi: "womenchild.maharashtra.gov.in / बाल विकास प्रकल्प अधिकारी (CDPO)" }, applyType: "offline",
    docs:    { en: ["Child's Aadhaar Card / Birth Certificate", "Orphan / Single Parent Certificate or Crisis Proof", "Foster Parent's Aadhaar & Income Certificate", "Bank Passbook (foster parent)", "Maharashtra Domicile"],
               hi: ["बच्चे का आधार कार्ड / जन्म प्रमाण पत्र", "अनाथ / एकल पालक प्रमाण या संकट प्रमाण", "पालक माता-पिता का आधार व आय प्रमाण", "बैंक पासबुक (पालक माता-पिता)", "महाराष्ट्र अधिवास"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Farmer Market Access ──────────────────────────────────────────────────────

  {
    id: "maha_enam_maharashtra",
    icon: "📊", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept. / APMC (e-NAM integration)", hi: "महाराष्ट्र कृषि विभाग / APMC (e-NAM एकत्रीकरण)" },
    name:    { en: "e-NAM & One Taluka One APMC Market Scheme (Maharashtra)",    hi: "e-NAM व एक तालुका एक कृषी बाजार समिती योजना (महाराष्ट्र)" },
    benefit: { en: "Free registration on e-NAM digital mandi + transparent online price discovery + direct payment to farmer's bank account within 3 days; 'One Taluka One APMC' ensures every taluka has an accessible market committee", hi: "e-NAM डिजिटल मंडीवर मुफ्त नोंदणी + पारदर्शी ऑनलाइन भाव शोध + 3 दिवसात शेतकऱ्याच्या बैंक खात्यात थेट पेमेंट; 'एक तालुका एक APMC' प्रत्येक तालुक्याला बाजार समिती सुनिश्चित करते" },
    tag:     { en: "Farmer / Market Access / Digital Mandi", hi: "किसान / बाजार प्रवेश / डिजिटल मंडी" },
    annual: 0,
    apply:   { en: "https://enam.gov.in", hi: "enam.gov.in / नजदीकी APMC / शेतकरी नोंदणी पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Farmer Registry / Digital Farmer ID", "7/12 Land Extract", "Bank Passbook (Aadhaar-linked)", "Mobile Number"],
               hi: ["आधार कार्ड", "शेतकरी नोंदणी / डिजिटल शेतकरी ID", "7/12 उतारा", "बैंक पासबुक (आधार लिंक)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  // ADD MORE MAHARASHTRA SCHEMES ABOVE THIS LINE ↓
  // {
  // ── Electric Vehicle (EV) Subsidy ──────────────────────────────────────────────

  {
    id: "maha_ev_policy_2025",
    icon: "⚡", color: "#0F766E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Transport Dept. (EV Policy 2025–2030)", hi: "महाराष्ट्र परिवहन विभाग (EV धोरण 2025–2030)" },
    name:    { en: "Maharashtra Electric Vehicle Policy 2025–2030 (EV Purchase Subsidy)", hi: "महाराष्ट्र इलेक्ट्रिक वाहन धोरण 2025–2030 (EV खरेदी अनुदान)" },
    benefit: { en: "Purchase subsidies: ₹10,000 on e-2 wheelers, ₹30,000 on e-auto rickshaws, up to ₹2L on EV taxis, 15% on e-tractors & agri EVs. 100% exemption from road tax & registration fees on all EVs (2025–2030). ₹11,373 Cr total allocation.", hi: "खरेदी अनुदान: e-दुचाकी ₹10,000, e-ऑटो रिक्षा ₹30,000, EV टॅक्सी ₹2L पर्यंत, e-ट्रॅक्टर व कृषी EV वर 15%. सर्व EV वर रोड टॅक्स व नोंदणी शुल्क 100% माफ (2025–2030). एकूण ₹11,373 कोटी तरतूद." },
    tag:     { en: "Transport / EV / Green Energy", hi: "परिवहन / EV / हरित ऊर्जा" },
    annual: 30000,
    apply:   { en: "https://transport.maharashtra.gov.in", hi: "transport.maharashtra.gov.in / अधिकृत डीलरमार्फत RTO नोंदणीवेळी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Vehicle Purchase Invoice (approved EV model)", "Maharashtra Address Proof", "Bank Passbook", "Vehicle Registration Certificate (RC)"],
               hi: ["आधार कार्ड", "वाहन खरेदी चलान (मंजूर EV मॉडेल)", "महाराष्ट्र पता प्रमाण", "बैंक पासबुक", "वाहन नोंदणी प्रमाणपत्र (RC)"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6","6to10"].includes(a.income),
  },

  // ── Farm Machinery ────────────────────────────────────────────────────────────

  {
    id: "maha_krishi_yantra_subsidy",
    icon: "🚜", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept. (Sub-Mission on Agricultural Mechanisation – SMAM)", hi: "महाराष्ट्र कृषि विभाग (कृषी यांत्रिकीकरण उप-अभियान – SMAM)" },
    name:    { en: "State Agriculture Mechanisation Scheme – Farm Machinery Subsidy (MahaDBT)", hi: "राज्य कृषी यांत्रिकीकरण योजना – शेती यंत्र अनुदान (MahaDBT)" },
    benefit: { en: "40–50% subsidy (higher for SC/ST/women) on tractors, rotavators, seed drills, sprayers, threshers & sugarcane harvesters via MahaDBT portal. Up to ₹35L on sugarcane harvester. First-come-first-served from 2025–26.", hi: "MahaDBT पोर्टलमार्फत ट्रॅक्टर, रोटाव्हेटर, सीड ड्रिल, फवारणी यंत्र, थ्रेशर व ऊस तोडणी यंत्रावर 40–50% अनुदान (SC/ST/महिलांना अधिक). ऊस तोडणी यंत्रावर ₹35L पर्यंत. 2025–26 पासून 'प्रथम अर्ज प्रथम प्राधान्य'." },
    tag:     { en: "Farmer / Farm Machinery / Mechanisation", hi: "किसान / शेती यंत्रे / यांत्रिकीकरण" },
    annual: 0,
    apply:   { en: "mahadbt.maharashtra.gov.in (Farmer portal)", hi: "mahadbt.maharashtra.gov.in (शेतकरी पोर्टल)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract & 8A", "Caste Certificate (SC/ST for higher subsidy)", "Income Certificate", "Quotations for Machinery (from authorised dealer)", "Bank Passbook"],
               hi: ["आधार कार्ड", "7/12 उतारा व 8अ", "जाति प्रमाण (SC/ST अधिक सब्सिडी हेतु)", "आय प्रमाण", "यंत्राचे कोटेशन (अधिकृत डीलरकडून)", "बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  // ── Auto / Taxi Driver Welfare ────────────────────────────────────────────────

  {
    id: "maha_auto_taxi_welfare",
    icon: "🛺", color: "#B45309", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Transport Dept. / Auto-Taxi Driver Welfare Board (₹50 Cr, GR 2024)", hi: "महाराष्ट्र परिवहन विभाग / ऑटो-टॅक्सी चालक कल्याण मंडळ (₹50 कोटी, GR 2024)" },
    name:    { en: "Maharashtra Auto & Taxi Driver Welfare Board Scheme",        hi: "महाराष्ट्र ऑटो व टॅक्सी चालक कल्याण मंडळ योजना" },
    benefit: { en: "Health insurance, accidental death benefit, children's education scholarship, pension support & financial assistance for registered auto-rickshaw and taxi drivers & their families (₹50 Cr GR issued Mar 2024)", hi: "नोंदणीकृत ऑटो-रिक्षा व टॅक्सी चालकांना व त्यांच्या कुटुंबाला आरोग्य विमा, अपघात मृत्यू लाभ, मुलांची शिष्यवृत्ती, निवृत्तीवेतन व आर्थिक सहाय्य (मार्च 2024 GR, ₹50 कोटी)" },
    tag:     { en: "Transport / Auto-Taxi Driver", hi: "परिवहन / ऑटो-टॅक्सी चालक" },
    annual: 0,
    apply:   { en: "transport.maharashtra.gov.in / Regional Transport Office (RTO)", hi: "transport.maharashtra.gov.in / प्रादेशिक परिवहन कार्यालय (RTO)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Valid Driving Licence (commercial badge)", "Vehicle Registration Certificate (auto/taxi)", "Permit Copy", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "वैध वाहन चालन परवाना (व्यावसायिक बॅज)", "वाहन नोंदणी प्रमाणपत्र (ऑटो/टॅक्सी)", "परवाना प्रत", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Urban Housing – PMAY-U 2.0 ───────────────────────────────────────────────

  {
    id: "maha_pmay_urban_2",
    icon: "🏘️", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Housing Dept. / MoHUA (PMAY-U 2.0)", hi: "महाराष्ट्र गृहनिर्माण विभाग / MoHUA (PMAY-U 2.0)" },
    name:    { en: "Pradhan Mantri Awas Yojana – Urban 2.0 (PMAY-U 2.0)",       hi: "प्रधानमंत्री आवास योजना – शहरी 2.0 (PMAY-U 2.0)" },
    benefit: { en: "Up to ₹2.5L central grant + state top-up for EWS/LIG urban families to buy/construct pucca house. Special priority for widows, single women, transgender, disabled & minorities. Affordable Rental Housing for urban migrants.", hi: "EWS/LIG शहरी परिवारांना पक्के घर खरेदी/बांधणीसाठी ₹2.5L केंद्रीय अनुदान + राज्य टॉप-अप. विधवा, एकल महिला, ट्रान्सजेंडर, दिव्यांग व अल्पसंख्याकांना विशेष प्राधान्य. शहरी स्थलांतरितांसाठी परवडणारी भाड्याची घरे." },
    tag:     { en: "Housing / Urban / EWS", hi: "आवास / शहरी / EWS" },
    annual: 250000,
    apply:   { en: "https://pmaymis.gov.in", hi: "pmaymis.gov.in / नगरपालिका / वार्ड कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (EWS ≤₹3L/yr, LIG ≤₹6L/yr)", "No Pucca House Declaration (self & spouse)", "Address Proof", "Ration Card", "Bank Passbook", "Caste Certificate (if SC/ST/OBC/Minority)"],
               hi: ["आधार कार्ड", "आय प्रमाण (EWS ≤₹3L/वर्ष, LIG ≤₹6L/वर्ष)", "पक्के घर नसल्याचे घोषणापत्र (स्वतः व पती/पत्नी)", "पता प्रमाण", "राशन कार्ड", "बैंक पासबुक", "जाति प्रमाण (SC/ST/OBC/अल्पसंख्याक)"] },
    match: (a) => a.state === "Maharashtra" && ["no","kutcha"].includes(a.house) && ["urban","semi"].includes(a.area) && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Soil Health ───────────────────────────────────────────────────────────────

  {
    id: "maha_soil_health_card",
    icon: "🌱", color: "#16A34A", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept. (Soil Health Card Scheme)", hi: "महाराष्ट्र कृषि विभाग (माती आरोग्य पत्रिका योजना)" },
    name:    { en: "Soil Health Card Scheme – Maharashtra",                      hi: "माती आरोग्य पत्रिका योजना – महाराष्ट्र" },
    benefit: { en: "Free soil testing every 2 years + personalised Soil Health Card with crop-wise fertiliser & amendment recommendations → reduces input costs by 15–20% and boosts yield", hi: "दर 2 वर्षांनी मोफत माती परीक्षण + पिकनिहाय खत व सुधारणा शिफारशींसह माती आरोग्य पत्रिका → इनपुट खर्च 15–20% कमी, उत्पन्न वाढ" },
    tag:     { en: "Farmer / Soil Health / Input Subsidy", hi: "किसान / माती आरोग्य / निविष्ठा अनुदान" },
    annual: 3000,
    apply:   { en: "soilhealth.dac.gov.in / nearest Krishi Sevak / Agriculture Dept. office", hi: "soilhealth.dac.gov.in / नजदीकी कृषी सेवक / कृषी विभाग कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Soil Sample (collected by Krishi Sevak)", "Mobile Number"],
               hi: ["आधार कार्ड", "7/12 उतारा", "माती नमुना (कृषी सेवकाने गोळा केलेला)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  // ── Women's Safety ────────────────────────────────────────────────────────────

  {
    id: "maha_nirbhaya_sakhi",
    icon: "🛡️", color: "#DC2626", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Home Dept. / Women & Child Development Dept. (Nirbhaya Fund)", hi: "महाराष्ट्र गृह विभाग / महिला व बाल विकास विभाग (निर्भया निधी)" },
    name:    { en: "Sakhi – One Stop Centre Scheme (Maharashtra)",               hi: "सखी – वन स्टॉप सेंटर योजना (महाराष्ट्र)" },
    benefit: { en: "Free integrated support for women facing violence: medical aid, police assistance, legal counsel, psychosocial counselling & temporary shelter under one roof at 36 district centres (24×7). Funded by Nirbhaya Fund.", hi: "हिंसाग्रस्त महिलांसाठी 36 जिल्हा केंद्रांवर एकाच छताखाली मोफत वैद्यकीय सहाय्य, पोलीस मदत, कायदेशीर सल्ला, समुपदेशन व तात्पुरते आश्रय (24×7). निर्भया निधीतून अर्थसहाय्य." },
    tag:     { en: "Women / Safety / One Stop Centre", hi: "महिला / सुरक्षा / वन स्टॉप सेंटर" },
    annual: 0,
    apply:   { en: "Call 181 (Women Helpline) / visit nearest Sakhi One Stop Centre", hi: "181 (महिला हेल्पलाइन) वर कॉल करा / नजदीकचे सखी वन स्टॉप सेंटर गाठा" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (if available)", "Any proof of identity", "Police complaint / medical record (if available — not mandatory for emergency walk-in)"],
               hi: ["आधार कार्ड (उपलब्ध असल्यास)", "कोणतेही ओळखपत्र", "पोलीस तक्रार / वैद्यकीय रेकॉर्ड (उपलब्ध असल्यास — आपत्कालीन प्रवेशासाठी अनिवार्य नाही)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women",
  },

  // ── Farmer Producer Organisations ────────────────────────────────────────────

  {
    id: "maha_fpo_support",
    icon: "🤝", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept. / NABARD / SFAC (10,000 FPO Scheme)", hi: "महाराष्ट्र कृषि विभाग / NABARD / SFAC (10,000 FPO योजना)" },
    name:    { en: "Formation & Promotion of Farmer Producer Organisations (FPOs) – Maharashtra", hi: "शेतकरी उत्पादक संघटना (FPO) स्थापना व संवर्धन – महाराष्ट्र" },
    benefit: { en: "₹18L per FPO over 3 years (₹15L handholding + ₹3L matching equity grant) to register & run farmer collectives; plus ₹10–50L credit guarantee cover and market linkage support for 500–1000 member FPOs", hi: "3 वर्षांत प्रति FPO ₹18L (₹15L हँडहोल्डिंग + ₹3L समतुल्य इक्विटी अनुदान); तसेच 500–1000 सदस्य FPO साठी ₹10–50L क्रेडिट गॅरंटी कव्हर व बाजारपेठ जोडणी सहाय्य" },
    tag:     { en: "Farmer / FPO / Collective Farming", hi: "किसान / FPO / सामूहिक शेती" },
    annual: 60000,
    apply:   { en: "https://sfacindia.com", hi: "sfacindia.com / nabard.org / mahadbt.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (all promoter farmers)", "7/12 Land Extract (members)", "FPO Registration Certificate (Companies Act / Cooperative Society)", "Business Plan", "Bank Account in FPO's name"],
               hi: ["आधार कार्ड (सर्व प्रवर्तक शेतकरी)", "7/12 उतारा (सदस्य)", "FPO नोंदणी प्रमाणपत्र (कंपनी कायदा/सहकारी संस्था)", "व्यापार योजना", "FPO च्या नावे बैंक खाते"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer" && ["1to3","3to6","6to10"].includes(a.income),
  },

  // ── Disability – Employment ───────────────────────────────────────────────────

  {
    id: "maha_divyang_rojgar",
    icon: "💼", color: "#6B21A8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Social Justice & Special Assistance Dept.", hi: "महाराष्ट्र सामाजिक न्याय व विशेष सहाय्य विभाग" },
    name:    { en: "Maharashtra Divyang Rojgar Guarantee Scheme (3% Reservation & Self-Employment Loan)", hi: "महाराष्ट्र दिव्यांग रोजगार हमी योजना (3% आरक्षण व स्वयंरोजगार कर्ज)" },
    benefit: { en: "3% reservation in all govt jobs for persons with disabilities + self-employment loan up to ₹5L at 4% interest + free skill training through NHFDC for 40%+ disability certificate holders", hi: "सर्व सरकारी नोकऱ्यांमध्ये दिव्यांगांसाठी 3% आरक्षण + 40%+ दिव्यांगता प्रमाणपत्रधारकांसाठी 4% व्याजावर ₹5L स्वयंरोजगार कर्ज + NHFDC मार्फत मोफत कौशल्य प्रशिक्षण" },
    tag:     { en: "Disability / Employment / Self Employment", hi: "दिव्यांग / रोजगार / स्वयंरोजगार" },
    annual: 0,
    apply:   { en: "sjsa.maharashtra.gov.in / District Social Welfare Office / nhfdc.nic.in", hi: "sjsa.maharashtra.gov.in / जिला समाज कल्याण कार्यालय / nhfdc.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ from Civil Surgeon)", "Income Certificate", "Educational Qualification Certificate", "Bank Passbook", "Business Plan (for self-employment loan)"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+, सिविल सर्जनकडून)", "आय प्रमाण पत्र", "शैक्षणिक पात्रता प्रमाण पत्र", "बैंक पासबुक", "व्यापार योजना (स्वयंरोजगार कर्जासाठी)"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Rural Roads ───────────────────────────────────────────────────────────────

  {
    id: "maha_pmgsy_rural_roads",
    icon: "🛣️", color: "#78350F", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Rural Development Dept. (PMGSY – Rural Roads)", hi: "महाराष्ट्र ग्रामविकास विभाग (PMGSY – ग्रामीण रस्ते)" },
    name:    { en: "Pradhan Mantri Gram Sadak Yojana (PMGSY) – Maharashtra Component", hi: "प्रधानमंत्री ग्राम सडक योजना (PMGSY) – महाराष्ट्र घटक" },
    benefit: { en: "All-weather pucca road connectivity to unconnected villages (population 250+ in plains, 100+ in tribal/hilly areas). Enables market access, school & hospital reach for rural communities", hi: "मैदानी भागातील 250+ लोकसंख्येच्या व आदिवासी/डोंगरी भागातील 100+ लोकसंख्येच्या जोडलेल्या नसलेल्या गावांना सर्व हवामान पक्के रस्ते जोडणी. ग्रामीण समुदायांसाठी बाजार, शाळा व रुग्णालय सुलभ" },
    tag:     { en: "Rural / Infrastructure / Road", hi: "ग्रामीण / पायाभूत सुविधा / रस्ता" },
    annual: 0,
    apply:   { en: "pmgsy.nic.in / District Rural Development Agency (DRDA)", hi: "pmgsy.nic.in / जिला ग्रामीण विकास अभिकरण (DRDA)" }, applyType: "offline",
    docs:    { en: ["Gram Panchayat Resolution (requesting road)", "Village Population Certificate", "Land Map / Survey", "No Objection Certificate from landowners on alignment"],
               hi: ["ग्राम पंचायत ठराव (रस्त्याची मागणी)", "गावाचे लोकसंख्या प्रमाण", "जमीन नकाशा / सर्वेक्षण", "मार्गावरील जमीनमालकांकडून ना-हरकत प्रमाणपत्र"] },
    match: (a) => a.state === "Maharashtra" && a.area === "rural",
  },

  // ── Beedi / Unorganised Sector Workers ───────────────────────────────────────

  {
    id: "maha_beedi_worker_welfare",
    icon: "🏭", color: "#92400E", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Labour Dept. / Ministry of Labour (Beedi Workers Welfare Fund)", hi: "महाराष्ट्र कामगार विभाग / श्रम मंत्रालय (बिडी कामगार कल्याण निधी)" },
    name:    { en: "Beedi Workers Welfare Fund Scheme – Maharashtra",             hi: "बिडी कामगार कल्याण निधी योजना – महाराष्ट्र" },
    benefit: { en: "Free housing, medical aid (ESI hospitals), children's scholarship (₹1,500–₹7,500/yr), maternity benefit ₹1,000, group insurance & drinking water facilities for registered beedi workers and families", hi: "नोंदणीकृत बिडी कामगार व कुटुंबाला मोफत घर, वैद्यकीय सहाय्य (ESI रुग्णालय), मुलांची शिष्यवृत्ती (₹1,500–₹7,500/वर्ष), मातृत्व लाभ ₹1,000, सामूहिक विमा व पिण्याचे पाणी सुविधा" },
    tag:     { en: "Labour / Beedi Worker / Welfare", hi: "श्रमिक / बिडी कामगार / कल्याण" },
    annual: 7500,
    apply:   { en: "labour.maharashtra.gov.in / Beedi Workers Welfare Commissioner office", hi: "labour.maharashtra.gov.in / बिडी कामगार कल्याण आयुक्त कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Beedi Worker Identity Card / Registration Certificate", "Employer Certificate (beedi factory)", "Bank Passbook", "Family Details"],
               hi: ["आधार कार्ड", "बिडी कामगार ओळखपत्र / नोंदणी प्रमाणपत्र", "नियोक्ता प्रमाणपत्र (बिडी कारखाना)", "बैंक पासबुक", "कुटुंब तपशील"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Legal Aid ─────────────────────────────────────────────────────────────────

  {
    id: "maha_legal_aid_services",
    icon: "⚖️", color: "#1D4ED8", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra State Legal Services Authority (MSLSA)", hi: "महाराष्ट्र राज्य विधी सेवा प्राधिकरण (MSLSA)" },
    name:    { en: "Maharashtra Free Legal Aid & Lok Adalat Scheme",             hi: "महाराष्ट्र मोफत कायदेशीर सहाय्य व लोक अदालत योजना" },
    benefit: { en: "Completely free legal representation, advice & drafting services for BPL, SC/ST, women, children, disabled, victims of disasters and those with income ≤₹3L/year. Lok Adalats settle disputes quickly with no court fee.", hi: "BPL, SC/ST, महिला, बालके, दिव्यांग, आपत्तीग्रस्त व ₹3L/वर्षापर्यंत उत्पन्न असलेल्यांसाठी पूर्णपणे मोफत कायदेशीर प्रतिनिधित्व, सल्ला व मसुदा सेवा. लोक अदालत न्यायालय शुल्काशिवाय वाद जलद निकाली काढते." },
    tag:     { en: "Legal Aid / Access to Justice", hi: "कायदेशीर सहाय्य / न्यायापर्यंत प्रवेश" },
    annual: 0,
    apply:   { en: "mslsa.gov.in / District Legal Services Authority (DLSA) / Taluka Legal Services Committee", hi: "mslsa.gov.in / जिला विधी सेवा प्राधिकरण (DLSA) / तालुका विधी सेवा समिती" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income Certificate (≤₹3L/year for income criterion)", "Caste Certificate (SC/ST)", "Disability Certificate (if applicable)", "Case/Dispute Details"],
               hi: ["आधार कार्ड", "आय प्रमाण (≤₹3L/वर्ष, आय निकषासाठी)", "जाति प्रमाण (SC/ST)", "दिव्यांगता प्रमाण (लागू असल्यास)", "खटला/वाद तपशील"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3"].includes(a.income),
  },

  // ── Sugarcane ─────────────────────────────────────────────────────────────────

  {
    id: "maha_sugarcane_frp",
    icon: "🌾", color: "#15803D", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Sugar Commissionerate (Co-operation, Marketing & Textiles Dept.)", hi: "महाराष्ट्र साखर आयुक्तालय (सहकार, पणन व वस्त्रोद्योग विभाग)" },
    name:    { en: "Fair & Remunerative Price (FRP) Enforcement + State Advisory Price (SAP) – Sugarcane Farmers", hi: "ऊस उत्पादकांसाठी उचित व लाभदायक मूल्य (FRP) अंमलबजावणी + राज्य सल्लागार मूल्य (SAP)" },
    benefit: { en: "Legally guaranteed FRP (₹340/quintal for 2024–25 season + premium for higher recovery) paid within 14 days of cane supply, with interest for delay. Sugar factories penalised for non-payment. Ethanol-linked bonus payments.", hi: "ऊस पुरवठ्याच्या 14 दिवसांत FRP (2024–25 हंगाम ₹340/क्विंटल + जास्त उताऱ्यासाठी प्रीमियम) कायदेशीर हमी; विलंबावर व्याज, कारखान्यांवर दंड. इथेनॉल-लिंक्ड बोनस देयके." },
    tag:     { en: "Farmer / Sugarcane / FRP", hi: "किसान / ऊस / FRP" },
    annual: 85000,
    apply:   { en: "sugarcommissioner.maharashtra.gov.in / co-operative sugar factory", hi: "sugarcommissioner.maharashtra.gov.in / सहकारी साखर कारखाना" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "7/12 Land Extract", "Sugarcane Supply Slip / Cane Registration with Factory", "Bank Passbook (linked to factory payment)"],
               hi: ["आधार कार्ड", "7/12 उतारा", "ऊस पुरवठा चिठ्ठी / कारखान्याकडे ऊस नोंदणी", "बैंक पासबुक (कारखाना देयकाशी जोडलेले)"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

];
