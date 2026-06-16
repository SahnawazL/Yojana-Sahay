// ═══════════════════════════════════════════════════════════════════════════════
// kerala.js  —  Kerala State Schemes for YojanaSetu
// Place this file at:  src/data/states/kerala.js
//
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "kerala_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ═══════════════════════════════════════════════════════════════════════════════

export const KERALA_SCHEMES = [

  // ─── 1. HEALTH ──────────────────────────────────────────────────────────────

  {
    id: "kerala_karunya",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Health Dept.", hi: "केरल स्वास्थ्य विभाग" },
    name:    { en: "Karunya Arogya Suraksha Padhathi (KASP)",            hi: "करुण्य आरोग्य सुरक्षा पद्धति (KASP)" },
    benefit: { en: "₹5 Lakh/year cashless treatment at empanelled hospitals", hi: "₹5 लाख/वर्ष सूचीबद्ध अस्पतालों में कैशलेस इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "https://sha.kerala.gov.in?page_id=2&lang=en", hi: "kasp.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Income Certificate", "Kerala Residence Proof"],
               hi: ["आधार कार्ड", "राशन कार्ड", "आय प्रमाण", "केरल निवास प्रमाण"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  {
    id: "kerala_karunya_benevolent",
    icon: "🩺", color: "#0D9488", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Health Dept.", hi: "केरल स्वास्थ्य विभाग" },
    name:    { en: "Karunya Benevolent Fund (KBF)",             hi: "करुण्य बेनेवोलेंट फंड (KBF)" },
    benefit: { en: "Up to ₹2 Lakh assistance for catastrophic illness & rare diseases", hi: "गंभीर बीमारी व दुर्लभ रोगों के लिए ₹2 लाख तक सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 200000,
    apply:   { en: "kerala.gov.in/karunya", hi: "kerala.gov.in/karunya" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Medical Certificate from Govt. Doctor", "Income Certificate", "Bank Account", "Kerala Residence Proof"],
               hi: ["आधार कार्ड", "सरकारी डॉक्टर का मेडिकल सर्टिफिकेट", "आय प्रमाण", "बैंक खाता", "केरल निवास प्रमाण"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 2. HOUSING ─────────────────────────────────────────────────────────────

  {
    id: "kerala_life_mission",
    icon: "🏠", color: "#1D4ED8", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Local Self Govt. Dept.", hi: "केरल स्थानीय स्वशासन विभाग" },
    name:    { en: "LIFE Mission (Livelihood & Inclusion for Families)",   hi: "LIFE मिशन (भूमिहीन-बेघर परिवार आवास)" },
    benefit: { en: "Free house worth ₹4 – ₹6 Lakh for landless / homeless families", hi: "भूमिहीन/बेघर परिवारों को ₹4–₹6 लाख का मुफ्त मकान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 500000,
    apply:   { en: "lifemission.kerala.gov.in", hi: "lifemission.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "No Land / No House Certificate from Village Officer", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "राशन कार्ड", "ग्राम अधिकारी से भूमिहीन/बेघर प्रमाण पत्र", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income),
  },

  // ─── 3. WOMEN & SELF-HELP ────────────────────────────────────────────────────

  {
    id: "kerala_kudumbashree",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Kerala",
    ministry: { en: "Kudumbashree Mission, Kerala", hi: "कुदुम्बश्री मिशन, केरल" },
    name:    { en: "Kudumbashree Women Micro-Enterprise Scheme",         hi: "कुदुम्बश्री महिला सूक्ष्म-उद्यम योजना" },
    benefit: { en: "Subsidized loans ₹15,000–₹5 Lakh + livelihood training for women SHGs", hi: "महिला SHG को ₹15,000–₹5 लाख सब्सिडी ऋण + आजीविका प्रशिक्षण" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "kudumbashree.org", hi: "kudumbashree.org" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "women",
  },

  // ─── 4. SOCIAL SECURITY / SENIOR / WIDOW / DISABLED ─────────────────────────

  {
    id: "kerala_social_security_pension",
    icon: "👴", color: "#7C3AED", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Social Justice Dept.", hi: "केरल सामाजिक न्याय विभाग" },
    name:    { en: "Kerala Social Security Pension (Old Age / Widow / Disability)", hi: "केरल सामाजिक सुरक्षा पेंशन (वृद्धावस्था / विधवा / विकलांगता)" },
    benefit: { en: "₹1,600/month for eligible senior citizens, widows & persons with disability", hi: "पात्र वृद्ध, विधवा और दिव्यांगजन को ₹1,600/माह" },
    tag:     { en: "Senior / Pension", hi: "वृद्ध / पेंशन" },
    annual: 19200,
    apply:   { en: "sjd.kerala.gov.in", hi: "sjd.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Age/Widow/Disability Certificate", "Income Certificate (below ₹1 Lakh/year)", "Bank Account"],
               hi: ["आधार कार्ड", "राशन कार्ड", "आयु/विधवा/विकलांगता प्रमाण पत्र", "आय प्रमाण (₹1 लाख/वर्ष से कम)", "बैंक खाता"] },
    match: (a) =>
      a.state === "Kerala" &&
      ["below1", "1to3"].includes(a.income) &&
      (a.age === "above60" || a.who === "senior" || a.who === "women"),
  },

  // ─── 5. AGRICULTURE / FARMER ────────────────────────────────────────────────

  {
    id: "kerala_karshaka_welfare",
    icon: "🌿", color: "#15803D", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Agriculture Dept.", hi: "केरल कृषि विभाग" },
    name:    { en: "Kerala Karshaka Welfare Fund Scheme",              hi: "केरल कर्षक कल्याण निधि योजना" },
    benefit: { en: "Accident/death insurance ₹1 Lakh + pension ₹1,200/month for registered farmers", hi: "पंजीकृत किसानों को दुर्घटना बीमा ₹1 लाख + ₹1,200/माह पेंशन" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 14400,
    apply:   { en: "keralaagriculture.gov.in", hi: "keralaagriculture.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Land Records / Tenancy Agreement", "Bank Account"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "जमीन के कागज़ / किरायेदारी अनुबंध", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "farmer",
  },

  {
    id: "kerala_fishermen_welfare",
    icon: "🎣", color: "#0369A1", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Fisheries Dept.", hi: "केरल मत्स्य विभाग" },
    name:    { en: "Kerala Matsyafed / Fishermen Welfare Scheme",      hi: "केरल मत्स्यफेड / मछुआरा कल्याण योजना" },
    benefit: { en: "Accident insurance ₹2 Lakh + saving-cum-relief of ₹600/month during lean season", hi: "दुर्घटना बीमा ₹2 लाख + बंद मौसम में ₹600/माह राहत" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 7200,
    apply:   { en: "fisheries.kerala.gov.in", hi: "fisheries.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Fisherman Identity Card (FIDS)", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "मछुआरा पहचान पत्र (FIDS)", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "farmer" && a.area !== "urban",
  },

  // ─── 6. EDUCATION / STUDENTS ────────────────────────────────────────────────

  {
    id: "kerala_snehapoorvam",
    icon: "🎓", color: "#92400E", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Social Justice Dept.", hi: "केरल सामाजिक न्याय विभाग" },
    name:    { en: "Snehapoorvam Scholarship (Orphan / Single Parent)",   hi: "स्नेहपूर्वम छात्रवृत्ति (अनाथ / एकल अभिभावक)" },
    benefit: { en: "₹3,000 – ₹14,000/year for children of widows, widowers, or orphans", hi: "विधवा, विधुर या अनाथ बच्चों को ₹3,000–₹14,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 8000,
    apply:   { en: "sjd.kerala.gov.in", hi: "sjd.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Death Certificate of Parent", "Income Certificate (below ₹2 Lakh)", "School / College Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "अभिभावक का मृत्यु प्रमाण पत्र", "आय प्रमाण (₹2 लाख से कम)", "विद्यालय/महाविद्यालय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "kerala_merit_scholarship",
    icon: "📖", color: "#1E40AF", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Higher Education Dept.", hi: "केरल उच्च शिक्षा विभाग" },
    name:    { en: "Kerala State Merit-cum-Means Scholarship",           hi: "केरल राज्य मेरिट-कम-मीन्स छात्रवृत्ति" },
    benefit: { en: "₹4,000 – ₹12,000/year for meritorious students from low-income families", hi: "मेधावी और आर्थिक रूप से कमज़ोर छात्रों को ₹4,000–₹12,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 8000,
    apply:   { en: "http://nmmse.kerala.gov.in", hi: "dcescholarship.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Mark Sheet (Last Exam)", "Income Certificate", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "पिछली परीक्षा की मार्कशीट", "आय प्रमाण", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  {
    id: "kerala_asap",
    icon: "🛠️", color: "#C2410C", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Higher Education Dept.", hi: "केरल उच्च शिक्षा विभाग" },
    name:    { en: "ASAP Kerala — Additional Skill Acquisition Programme", hi: "ASAP केरल — अतिरिक्त कौशल अर्जन कार्यक्रम" },
    benefit: { en: "Free skill certification in IT, communication & soft skills for Class 8–Degree students", hi: "कक्षा 8 से डिग्री के छात्रों के लिए IT, संचार व सॉफ्ट स्किल में मुफ्त सर्टिफिकेशन" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "https://universitycollege.ac.in?page_id=781", hi: "asapkerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "School / College ID Card", "Kerala Residence Proof"],
               hi: ["आधार कार्ड", "विद्यालय/महाविद्यालय पहचान पत्र", "केरल निवास प्रमाण"] },
    match: (a) => a.state === "Kerala" && a.who === "student",
  },

  // ─── 7. WORKERS / LABOUR ────────────────────────────────────────────────────

  {
    id: "kerala_construction_welfare",
    icon: "🏗️", color: "#B45309", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Labour Dept. — BOCW Board", hi: "केरल श्रम विभाग — BOCW बोर्ड" },
    name:    { en: "Kerala Building & Construction Workers Welfare (BOCW)", hi: "केरल निर्माण श्रमिक कल्याण (BOCW)" },
    benefit: { en: "Pension ₹1,500/month + ₹20,000 maternity + scholarship for children + ₹2 Lakh accident cover", hi: "पेंशन ₹1,500/माह + प्रसूति ₹20,000 + बच्चों की छात्रवृत्ति + ₹2 लाख दुर्घटना बीमा" },
    tag:     { en: "Labour", hi: "श्रम" },
    annual: 18000,
    apply:   { en: "bocwkerala.gov.in", hi: "bocwkerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BOCW Registration Certificate", "Ration Card", "Bank Account", "90-day Work Certificate from Contractor"],
               hi: ["आधार कार्ड", "BOCW पंजीकरण प्रमाण पत्र", "राशन कार्ड", "बैंक खाता", "ठेकेदार से 90 दिन का कार्य प्रमाण पत्र"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3"].includes(a.income) && a.who === "general",
  },

  {
    id: "kerala_labour_welfare",
    icon: "👷", color: "#92400E", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Labour Welfare Fund Board", hi: "केरल श्रम कल्याण निधि बोर्ड" },
    name:    { en: "Kerala Labour Welfare Fund Board Scheme",             hi: "केरल श्रम कल्याण निधि बोर्ड योजना" },
    benefit: { en: "Education grant ₹4,000–₹25,000 + housing loan ₹2 Lakh + medical assistance for workers", hi: "शिक्षा अनुदान ₹4,000–₹25,000 + आवास ऋण ₹2 लाख + कर्मचारियों को चिकित्सा सहायता" },
    tag:     { en: "Labour", hi: "श्रम" },
    annual: 10000,
    apply:   { en: "klwb.kerala.gov.in", hi: "klwb.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Labour Welfare Fund Membership Card", "Employer Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "श्रम कल्याण निधि सदस्यता कार्ड", "नियोक्ता प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3", "3to6"].includes(a.income) && a.who === "general",
  },

  {
    id: "kerala_unemployment_allowance",
    icon: "💼", color: "#4338CA", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Employment Dept.", hi: "केरल रोजगार विभाग" },
    name:    { en: "Kerala Unemployment Assistance Scheme (Karmasena)", hi: "केरल बेरोजगारी सहायता योजना (कर्मसेना)" },
    benefit: { en: "₹500–₹1,000/month allowance for educated unemployed youth registered in employment exchange", hi: "रोजगार कार्यालय में पंजीकृत शिक्षित बेरोजगार युवाओं को ₹500–₹1,000/माह भत्ता" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 9000,
    apply:   { en: "https://employment.kerala.gov.in", hi: "employment.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Certificates (10th / ITI / Degree)", "Employment Exchange Registration Card", "Income Certificate (below ₹1 Lakh)", "Bank Account"],
               hi: ["आधार कार्ड", "शैक्षिक प्रमाण पत्र (10वीं/ITI/डिग्री)", "रोजगार कार्यालय पंजीकरण कार्ड", "आय प्रमाण (₹1 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  // ─── 8. BUSINESS / ENTREPRENEURSHIP ─────────────────────────────────────────

  {
    id: "kerala_startup_mission",
    icon: "🚀", color: "#6D28D9", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Startup Mission (KSUM)", hi: "केरल स्टार्टअप मिशन (KSUM)" },
    name:    { en: "KSUM Startup Seed Fund & Incubation Support",        hi: "KSUM स्टार्टअप सीड फंड व इन्क्यूबेशन सहायता" },
    benefit: { en: "Seed funding up to ₹10 Lakh + free co-working space + mentoring for tech startups", hi: "टेक स्टार्टअप के लिए ₹10 लाख तक सीड फंड + मुफ्त को-वर्किंग स्पेस + मेंटरिंग" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://startupmission.kerala.gov.in", hi: "startupmission.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN", "Business Registration / DPIIT Certificate", "Business Plan / Pitch Deck", "Bank Account"],
               hi: ["आधार और पैन", "व्यापार पंजीकरण / DPIIT प्रमाण पत्र", "बिजनेस प्लान / पिच डेक", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "business",
  },

  {
    id: "kerala_sc_dev_corp",
    icon: "🤝", color: "#1E3A5F", scope: "state", state: "Kerala",
    ministry: { en: "Kerala State SC / ST Development Corp (KSCDC)", hi: "केरल राज्य SC/ST विकास निगम (KSCDC)" },
    name:    { en: "KSCDC Subsidized Loan for SC/ST Entrepreneurs",      hi: "KSCDC — SC/ST उद्यमियों को सब्सिडी ऋण" },
    benefit: { en: "Loans ₹50,000–₹5 Lakh at 4–6% interest for self-employment and business for SC/ST", hi: "SC/ST स्व-रोजगार/व्यापार के लिए ₹50,000–₹5 लाख, 4–6% ब्याज पर ऋण" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "kscdc.net", hi: "kscdc.net" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST)", "Income Certificate (below ₹3 Lakh)", "Business Plan", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST)", "आय प्रमाण (₹3 लाख से कम)", "बिजनेस प्लान", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && (a.who === "business" || a.who === "general") && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ─── 9. WOMEN — ADDITIONAL ──────────────────────────────────────────────────

  {
    id: "kerala_kswdc_loan",
    icon: "💰", color: "#9D174D", scope: "state", state: "Kerala",
    ministry: { en: "Kerala State Women's Dev. Corp (KSWDC)", hi: "केरल राज्य महिला विकास निगम (KSWDC)" },
    name:    { en: "KSWDC Women Entrepreneur Loan & Training",           hi: "KSWDC महिला उद्यमी ऋण एवं प्रशिक्षण योजना" },
    benefit: { en: "Loans ₹50,000–₹3 Lakh at 4% interest + free entrepreneurship training for women", hi: "महिलाओं के लिए 4% ब्याज पर ₹50,000–₹3 लाख ऋण + मुफ्त उद्यमिता प्रशिक्षण" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "kswdc.org", hi: "kswdc.org" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income Certificate (below ₹4 Lakh)", "Business / Project Report", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "आय प्रमाण (₹4 लाख से कम)", "व्यापार / परियोजना रिपोर्ट", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "women" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  {
    id: "kerala_maternity_benefit",
    icon: "🤱", color: "#DB2777", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Labour Dept.", hi: "केरल श्रम विभाग" },
    name:    { en: "Kerala Maternity Benefit Scheme (Shops & Establishments)", hi: "केरल प्रसूति लाभ योजना (दुकान और प्रतिष्ठान)" },
    benefit: { en: "26 weeks paid maternity leave + ₹3,500 medical bonus for women in organised sector", hi: "महिला कर्मचारियों को 26 सप्ताह की सवेतन प्रसूति छुट्टी + ₹3,500 चिकित्सा बोनस" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 3500,
    apply:   { en: "labour.kerala.gov.in", hi: "labour.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Employer Certificate", "Medical Certificate (pregnancy)", "Bank Account"],
               hi: ["आधार कार्ड", "नियोक्ता प्रमाण पत्र", "मेडिकल सर्टिफिकेट (गर्भावस्था)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "women" && ["18to35", "35to60"].includes(a.age),
  },

  // ─── 10. DISABILITY / DIFFERENTLY-ABLED ────────────────────────────────────

  {
    id: "kerala_vidyakiranam",
    icon: "🌟", color: "#0891B2", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Social Justice Dept.", hi: "केरल सामाजिक न्याय विभाग" },
    name:    { en: "Vidyakiranam Scholarship (Differently-Abled Students)", hi: "विद्याकिरणम छात्रवृत्ति (दिव्यांग छात्र)" },
    benefit: { en: "₹400–₹700/month scholarship for students with ≥40% disability studying in Govt. schools", hi: "सरकारी स्कूल में पढ़ने वाले ≥40% दिव्यांग छात्रों को ₹400–₹700/माह छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 7200,
    apply:   { en: "sjd.kerala.gov.in", hi: "sjd.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (≥40%)", "School Enrollment Certificate", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (≥40%)", "विद्यालय नामांकन प्रमाण", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 11. MINORITY WELFARE ───────────────────────────────────────────────────

  {
    id: "kerala_minority_scholarship",
    icon: "🕌", color: "#065F46", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Minority Welfare Dept.", hi: "केरल अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Kerala State Minority Welfare Scholarship",          hi: "केरल राज्य अल्पसंख्यक कल्याण छात्रवृत्ति" },
    benefit: { en: "₹10,000–₹24,000/year for Muslim, Christian, Sikh, Jain & Zoroastrian students", hi: "मुस्लिम, ईसाई, सिख, जैन और पारसी छात्रों को ₹10,000–₹24,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 15000,
    apply:   { en: "https://www.india.gov.in/services/details/apply-for-mother-teresa-scholarship-department-of-minority-welfare-kerala", hi: "minoritywelfare.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Religion Certificate", "Mark Sheet (Last Exam)", "Income Certificate (below ₹2 Lakh)", "Bank Account"],
               hi: ["आधार कार्ड", "अल्पसंख्यक धर्म प्रमाण पत्र", "पिछली परीक्षा मार्कशीट", "आय प्रमाण (₹2 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 12. AGRICULTURE — ADDITIONAL ──────────────────────────────────────────

  {
    id: "kerala_haritha_keralam",
    icon: "🌱", color: "#166534", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Agriculture Dept. — Haritha Keralam Mission", hi: "केरल कृषि विभाग — हरिता केरलम मिशन" },
    name:    { en: "Haritha Keralam Mission (Organic Farming Support)",  hi: "हरिता केरलम मिशन (जैविक खेती सहायता)" },
    benefit: { en: "₹15,000/hectare incentive for organic farming + free organic inputs + training", hi: "जैविक खेती के लिए ₹15,000/हेक्टेयर प्रोत्साहन + मुफ्त जैविक इनपुट + प्रशिक्षण" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 15000,
    apply:   { en: "harithakeram.kerala.gov.in", hi: "harithakeram.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Possession Certificate", "Farmer Registration (eKrishi)", "Bank Account"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / कब्जा प्रमाण पत्र", "किसान पंजीकरण (eKrishi)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "farmer",
  },

  // ─── 13. TRIBAL / SCHEDULED TRIBE WELFARE ──────────────────────────────────

  {
    id: "kerala_st_welfare_scholarship",
    icon: "🌄", color: "#78350F", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Scheduled Tribes Development Dept.", hi: "केरल अनुसूचित जनजाति विकास विभाग" },
    name:    { en: "Kerala ST Welfare Scholarship & Free Hostel Scheme",  hi: "केरल ST कल्याण छात्रवृत्ति एवं मुफ्त छात्रावास योजना" },
    benefit: { en: "₹500–₹1,500/month scholarship + free hostel for Scheduled Tribe students", hi: "अनुसूचित जनजाति छात्रों को ₹500–₹1,500/माह छात्रवृत्ति + मुफ्त छात्रावास" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "stdd.kerala.gov.in", hi: "stdd.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST Community Certificate", "School / College Enrollment Proof", "Income Certificate (below ₹2 Lakh)", "Bank Account"],
               hi: ["आधार कार्ड", "ST जाति प्रमाण पत्र", "विद्यालय/महाविद्यालय नामांकन प्रमाण", "आय प्रमाण (₹2 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 14. EDUCATION — ABROAD SCHOLARSHIP ─────────────────────────────────────

  {
    id: "kerala_cmss_abroad",
    icon: "✈️", color: "#1E40AF", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Higher Education Dept.", hi: "केरल उच्च शिक्षा विभाग" },
    name:    { en: "Chief Minister's Special Scholarship (Foreign Studies)", hi: "मुख्यमंत्री विशेष छात्रवृत्ति (विदेश अध्ययन)" },
    benefit: { en: "Up to ₹10 Lakh one-time grant for meritorious BPL/low-income students to study abroad", hi: "BPL/कम आय के मेधावी छात्रों को विदेश पढ़ाई के लिए एकमुश्त ₹10 लाख तक अनुदान" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 1000000,
    apply:   { en: "https://hcikl.gov.in/pages?id=6&subid=155&nextid=202", hi: "hed.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Mark Sheets (All Exams)", "Admission Letter from Foreign University", "Income Certificate (below ₹3 Lakh)", "Bank Account"],
               hi: ["आधार कार्ड", "सभी परीक्षाओं की मार्कशीट", "विदेशी विश्वविद्यालय का प्रवेश पत्र", "आय प्रमाण (₹3 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "kerala_pratibha_scholarship",
    icon: "🏅", color: "#D97706", scope: "state", state: "Kerala",
    ministry: { en: "Kerala SCERT / General Education Dept.", hi: "केरल SCERT / सामान्य शिक्षा विभाग" },
    name:    { en: "Pratibha Scholarship (Class 10 State Toppers)",       hi: "प्रतिभा छात्रवृत्ति (कक्षा 10 राज्य टॉपर)" },
    benefit: { en: "₹1,000/month for Class 11–12 and ₹1,200/month for Degree for top SSLC scorers", hi: "SSLC टॉपर को कक्षा 11–12 में ₹1,000/माह और डिग्री में ₹1,200/माह" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "education.kerala.gov.in", hi: "education.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SSLC Mark Sheet (A+ in all subjects)", "School Headmaster Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "SSLC मार्कशीट (सभी विषयों में A+)", "विद्यालय प्रधानाचार्य प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "student",
  },

  // ─── 15. AGRICULTURE — RUBBER & COCONUT ─────────────────────────────────────

  {
    id: "kerala_rubber_replanting",
    icon: "🌳", color: "#3F6212", scope: "state", state: "Kerala",
    ministry: { en: "Rubber Board of India (Kerala Region)", hi: "रबर बोर्ड ऑफ इंडिया (केरल क्षेत्र)" },
    name:    { en: "Rubber Replanting Subsidy Scheme (RRSS)",             hi: "रबर रीप्लांटिंग सब्सिडी योजना (RRSS)" },
    benefit: { en: "₹20,000–₹27,000/hectare subsidy for replanting aged rubber trees + free planting material", hi: "पुराने रबर के पेड़ों को बदलने पर ₹20,000–₹27,000/हेक्टेयर सब्सिडी + मुफ्त रोपण सामग्री" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 27000,
    apply:   { en: "rubberboard.gov.in", hi: "rubberboard.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records with Rubber Cultivation Proof", "Rubber Board Registration", "Bank Account"],
               hi: ["आधार कार्ड", "रबर खेती प्रमाण सहित भूमि अभिलेख", "रबर बोर्ड पंजीकरण", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "farmer",
  },

  {
    id: "kerala_coconut_dev",
    icon: "🥥", color: "#854D0E", scope: "state", state: "Kerala",
    ministry: { en: "Coconut Development Board (CDB)", hi: "नारियल विकास बोर्ड (CDB)" },
    name:    { en: "CDB Coconut Replanting & Rejuvenation Scheme",        hi: "CDB नारियल रीप्लांटिंग एवं पुनरुज्जीवन योजना" },
    benefit: { en: "₹75/palm seedling subsidy + ₹4,000 input assistance per hectare for replanting old coconut palms", hi: "प्रत्येक नारियल पौध पर ₹75 सब्सिडी + पुराने पेड़ बदलने पर ₹4,000/हेक्टेयर इनपुट सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 4000,
    apply:   { en: "coconutboard.gov.in", hi: "coconutboard.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (coconut cultivation)", "Farmer Passbook / eKrishi ID", "Bank Account"],
               hi: ["आधार कार्ड", "नारियल खेती सहित भूमि अभिलेख", "किसान पासबुक / eKrishi ID", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "farmer",
  },

  {
    id: "kerala_agri_workers_welfare",
    icon: "🌾", color: "#4D7C0F", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Agricultural Workers Welfare Fund Board", hi: "केरल कृषि श्रमिक कल्याण निधि बोर्ड" },
    name:    { en: "Kerala Agricultural Workers Welfare Fund (KGLPS)",   hi: "केरल कृषि श्रमिक कल्याण निधि (KGLPS)" },
    benefit: { en: "Pension ₹1,150/month + gratuity ₹50,000 + medical ₹5,000/year for farm labourers", hi: "खेत मजदूरों को ₹1,150/माह पेंशन + ₹50,000 ग्रेच्युटी + ₹5,000/वर्ष चिकित्सा सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 13800,
    apply:   { en: "kerala.gov.in/agriworkers", hi: "kerala.gov.in/agriworkers" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "KGLPS Membership Card", "Employer (Landowner) Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "KGLPS सदस्यता कार्ड", "नियोक्ता (भूस्वामी) प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "general" && a.area !== "urban" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 16. NORKA — NON-RESIDENT KERALITES ─────────────────────────────────────

  {
    id: "kerala_norka_pravasi",
    icon: "🌏", color: "#0C4A6E", scope: "state", state: "Kerala",
    ministry: { en: "NORKA ROOTS, Kerala", hi: "NORKA ROOTS, केरल" },
    name:    { en: "NORKA Pravasi Welfare Fund & Rehabilitation Loan",   hi: "NORKA प्रवासी कल्याण निधि एवं पुनर्वास ऋण" },
    benefit: { en: "Loan up to ₹2 Lakh at 7% + pension ₹2,000/month for returned NR Keralites in distress", hi: "लौटे प्रवासी केरलवासियों को 7% पर ₹2 लाख तक ऋण + ₹2,000/माह पेंशन" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 24000,
    apply:   { en: "norkaroots.org", hi: "norkaroots.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Passport with UAE/Gulf Visa Stamps", "Pravasi Certificate from NORKA", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "UAE/खाड़ी वीज़ा स्टैम्प के साथ पासपोर्ट", "NORKA से प्रवासी प्रमाण पत्र", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  // ─── 17. ARTISAN / HANDLOOM WELFARE ─────────────────────────────────────────

  {
    id: "kerala_artisan_welfare",
    icon: "🧵", color: "#7E22CE", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Khadi & Village Industries Board (KVIB)", hi: "केरल खादी एवं ग्रामोद्योग बोर्ड (KVIB)" },
    name:    { en: "KVIB Artisan & Handloom Worker Welfare Scheme",      hi: "KVIB कारीगर एवं हथकरघा श्रमिक कल्याण योजना" },
    benefit: { en: "Insurance ₹2 Lakh + pension ₹1,000/month + tool kit grant ₹5,000 for registered artisans", hi: "पंजीकृत कारीगरों को ₹2 लाख बीमा + ₹1,000/माह पेंशन + ₹5,000 टूल किट अनुदान" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 12000,
    apply:   { en: "kvib.kerala.gov.in", hi: "kvib.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "KVIB / Artisan Registration Certificate", "Craft Skill Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "KVIB / कारीगर पंजीकरण प्रमाण पत्र", "शिल्प कौशल प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "business" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ─── 18. WOMEN — WIDOW ASSISTANCE ──────────────────────────────────────────

  {
    id: "kerala_widow_assistance",
    icon: "💛", color: "#A21CAF", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Social Justice Dept.", hi: "केरल सामाजिक न्याय विभाग" },
    name:    { en: "Kerala Destitute / Widow Financial Assistance Scheme", hi: "केरल विधवा / निराश्रित महिला वित्तीय सहायता योजना" },
    benefit: { en: "One-time ₹30,000 marriage assistance for widows + ₹500/month relief to destitute women", hi: "विधवाओं को एकमुश्त ₹30,000 विवाह सहायता + निराश्रित महिलाओं को ₹500/माह राहत" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 36000,
    apply:   { en: "sjd.kerala.gov.in", hi: "sjd.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Death Certificate of Husband", "Income Certificate (below ₹1 Lakh)", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "आय प्रमाण (₹1 लाख से कम)", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 19. HEALTH — PALLIATIVE CARE ───────────────────────────────────────────

  {
    id: "kerala_palliative_care",
    icon: "🫀", color: "#9F1239", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Health Dept. — Aardram Mission", hi: "केरल स्वास्थ्य विभाग — आर्द्रम मिशन" },
    name:    { en: "Kerala Palliative Home Care Programme",               hi: "केरल प्रशामक गृह देखभाल कार्यक्रम" },
    benefit: { en: "Free home-based nursing, medicines & physiotherapy for bedridden / cancer / chronic illness patients", hi: "शय्याग्रस्त / कैंसर / दीर्घकालिक रोगियों को मुफ्त घर-आधारित नर्सिंग, दवाइयाँ व फिजियोथेरेपी" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "aardram.kerala.gov.in", hi: "aardram.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Medical Certificate from Doctor (chronic/terminal illness)", "Ration Card", "Kerala Residence Proof"],
               hi: ["आधार कार्ड", "डॉक्टर से मेडिकल प्रमाण पत्र (दीर्घकालिक/अंतिम अवस्था रोग)", "राशन कार्ड", "केरल निवास प्रमाण"] },
    match: (a) => a.state === "Kerala" && (a.age === "above60" || a.who === "senior" || ["below1", "1to3"].includes(a.income)),
  },

  // ─── 20. HOUSING — EWS LOAN ─────────────────────────────────────────────────

  {
    id: "kerala_kshb_ews_loan",
    icon: "🏘️", color: "#1E3A8A", scope: "state", state: "Kerala",
    ministry: { en: "Kerala State Housing Board (KSHB)", hi: "केरल राज्य आवास बोर्ड (KSHB)" },
    name:    { en: "KSHB EWS / LIG Housing Loan Scheme",                 hi: "KSHB EWS / LIG आवास ऋण योजना" },
    benefit: { en: "Home loans at 5–7% interest up to ₹10 Lakh for EWS/LIG families with no collateral", hi: "EWS/LIG परिवारों को बिना गारंटी 5–7% ब्याज पर ₹10 लाख तक आवास ऋण" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "kshb.kerala.gov.in", hi: "kshb.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income Certificate (EWS: below ₹3 Lakh / LIG: ₹3–6 Lakh)", "Land Documents or Site Plan", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "आय प्रमाण (EWS: ₹3 लाख से कम / LIG: ₹3–6 लाख)", "भूमि दस्तावेज़ या साइट प्लान", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ─── 21. ELDERLY CARE ───────────────────────────────────────────────────────

  {
    id: "kerala_vayomithram",
    icon: "👵", color: "#7C3AED", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Health Dept. — Social Justice Dept.", hi: "केरल स्वास्थ्य एवं सामाजिक न्याय विभाग" },
    name:    { en: "Vayomithram — Mobile Geriatric Health Clinic",        hi: "वयोमित्रम — मोबाइल वृद्धावस्था स्वास्थ्य क्लिनिक" },
    benefit: { en: "Free home-visit health checkups, medicines & physiotherapy for senior citizens aged 60+", hi: "60+ वर्ष के वृद्धजनों को मुफ्त घर-पर स्वास्थ्य जांच, दवाइयाँ व फिजियोथेरेपी" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "Local LSG / Ward Member Office", hi: "स्थानीय LSG / वार्ड सदस्य कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+ years)", "Ration Card", "Kerala Residence Proof"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+ वर्ष)", "राशन कार्ड", "केरल निवास प्रमाण"] },
    match: (a) => a.state === "Kerala" && (a.age === "above60" || a.who === "senior"),
  },

  // ─── 22. HEAD LOAD & TRANSPORT WORKERS ──────────────────────────────────────

  {
    id: "kerala_headload_workers",
    icon: "🧑‍🏭", color: "#92400E", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Head Load Workers Welfare Fund Board", hi: "केरल हेड लोड श्रमिक कल्याण निधि बोर्ड" },
    name:    { en: "Kerala Head Load Workers Welfare Fund Scheme",        hi: "केरल हेड लोड श्रमिक कल्याण निधि योजना" },
    benefit: { en: "Pension ₹1,200/month + accident benefit ₹2 Lakh + gratuity ₹60,000 for registered head load workers", hi: "पंजीकृत हेड लोड मजदूरों को ₹1,200/माह पेंशन + ₹2 लाख दुर्घटना लाभ + ₹60,000 ग्रेच्युटी" },
    tag:     { en: "Labour", hi: "श्रम" },
    annual: 14400,
    apply:   { en: "hlwb.kerala.gov.in", hi: "hlwb.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Head Load Worker Registration Card (HLWB)", "Employer / Market Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "हेड लोड श्रमिक पंजीकरण कार्ड (HLWB)", "नियोक्ता / बाज़ार प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "general" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "kerala_motor_transport_workers",
    icon: "🚌", color: "#0369A1", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Motor Transport Workers Welfare Fund Board", hi: "केरल मोटर परिवहन श्रमिक कल्याण निधि बोर्ड" },
    name:    { en: "Kerala Motor Transport Workers Welfare Scheme",       hi: "केरल मोटर परिवहन श्रमिक कल्याण योजना" },
    benefit: { en: "Pension ₹1,500/month + housing loan ₹2 Lakh + accident benefit ₹2 Lakh for auto/taxi/bus workers", hi: "ऑटो/टैक्सी/बस चालकों को ₹1,500/माह पेंशन + ₹2 लाख आवास ऋण + ₹2 लाख दुर्घटना लाभ" },
    tag:     { en: "Labour", hi: "श्रम" },
    annual: 18000,
    apply:   { en: "mtwwfb.kerala.gov.in", hi: "mtwwfb.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "MTWWFB Membership Card", "Driving Licence", "Vehicle RC / Permit Copy", "Bank Account"],
               hi: ["आधार कार्ड", "MTWWFB सदस्यता कार्ड", "ड्राइविंग लाइसेंस", "वाहन RC / परमिट कॉपी", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "general" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 23. CASHEW INDUSTRY WORKERS ────────────────────────────────────────────

  {
    id: "kerala_cashew_workers",
    icon: "🥜", color: "#B45309", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Cashew Workers Welfare Fund Board", hi: "केरल काजू श्रमिक कल्याण निधि बोर्ड" },
    name:    { en: "Kerala Cashew Workers Welfare Fund Scheme",           hi: "केरल काजू श्रमिक कल्याण निधि योजना" },
    benefit: { en: "Pension ₹1,200/month + gratuity ₹75,000 + medical ₹5,000/year for cashew factory workers", hi: "काजू कारखाना कर्मचारियों को ₹1,200/माह पेंशन + ₹75,000 ग्रेच्युटी + ₹5,000/वर्ष चिकित्सा" },
    tag:     { en: "Labour", hi: "श्रम" },
    annual: 14400,
    apply:   { en: "cashewindia.org / Local Factory Office", hi: "cashewindia.org / स्थानीय कारखाना कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Cashew Workers Welfare Board Card", "Factory / Employer Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "काजू श्रमिक कल्याण बोर्ड कार्ड", "कारखाना / नियोक्ता प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "general" && ["below1", "1to3"].includes(a.income),
  },

  // ─── 24. AGRICULTURE — VEGETABLE DEVELOPMENT ────────────────────────────────

  {
    id: "kerala_vegetable_dev",
    icon: "🥦", color: "#15803D", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Horticulture Mission / VFPCK", hi: "केरल बागवानी मिशन / VFPCK" },
    name:    { en: "Kerala Vegetable Development Programme (VDP)",        hi: "केरल सब्जी विकास कार्यक्रम (VDP)" },
    benefit: { en: "Subsidy ₹15,000–₹50,000 on drip irrigation, poly-house, seeds & tools for vegetable growers", hi: "सब्जी उत्पादकों को ड्रिप सिंचाई, पॉलीहाउस, बीज और औजारों पर ₹15,000–₹50,000 सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 30000,
    apply:   { en: "vfpck.com / Local Krishi Bhavan", hi: "vfpck.com / स्थानीय कृषि भवन" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Possession Certificate", "Farmer Passbook (eKrishi)", "Bank Account"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / कब्जा प्रमाण पत्र", "किसान पासबुक (eKrishi)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && a.who === "farmer",
  },

  // ─── 25. DISABILITY — MARRIAGE ASSISTANCE ───────────────────────────────────

  {
    id: "kerala_disability_marriage",
    icon: "💍", color: "#0891B2", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Social Justice Dept.", hi: "केरल सामाजिक न्याय विभाग" },
    name:    { en: "Kerala Differently-Abled Persons Marriage Assistance", hi: "केरल दिव्यांगजन विवाह सहायता योजना" },
    benefit: { en: "₹25,000 one-time grant when a differently-abled person marries; ₹50,000 if both partners have disability", hi: "दिव्यांग व्यक्ति के विवाह पर एकमुश्त ₹25,000; दोनों दिव्यांग हों तो ₹50,000" },
    tag:     { en: "Social Welfare", hi: "सामाजिक कल्याण" },
    annual: 25000,
    apply:   { en: "sjd.kerala.gov.in", hi: "sjd.kerala.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (≥40%)", "Marriage Certificate / Invitation", "Income Certificate (below ₹3 Lakh)", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (≥40%)", "विवाह प्रमाण पत्र / निमंत्रण पत्र", "आय प्रमाण (₹3 लाख से कम)", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ─── 26. EMERGENCY RELIEF ───────────────────────────────────────────────────

  {
    id: "kerala_cm_distress_relief",
    icon: "🆘", color: "#DC2626", scope: "state", state: "Kerala",
    ministry: { en: "Chief Minister's Distress Relief Fund (CMDRF)", hi: "मुख्यमंत्री आपदा राहत कोष (CMDRF)" },
    name:    { en: "Chief Minister's Distress Relief Fund (CMDRF)",      hi: "मुख्यमंत्री आपदा राहत कोष (CMDRF)" },
    benefit: { en: "Emergency financial assistance for flood / fire / accident / serious illness — up to ₹2 Lakh", hi: "बाढ़/आग/दुर्घटना/गंभीर बीमारी के लिए आपातकालीन वित्तीय सहायता — ₹2 लाख तक" },
    tag:     { en: "Social Welfare", hi: "सामाजिक कल्याण" },
    annual: 200000,
    apply:   { en: "https://donation.cmdrf.kerala.gov.in/index.php/Settings/transparency", hi: "cmdrf.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Proof of Calamity (FIR / Hospital Bills / Revenue Officer Certificate)", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "आपदा का प्रमाण (FIR / अस्पताल बिल / राजस्व अधिकारी प्रमाण पत्र)", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Kerala" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ─── 27. FREE TEXTBOOKS & UNIFORMS ──────────────────────────────────────────

  {
    id: "kerala_free_textbook_uniform",
    icon: "📚", color: "#1D4ED8", scope: "state", state: "Kerala",
    ministry: { en: "Kerala General Education Dept. / KITE", hi: "केरल सामान्य शिक्षा विभाग / KITE" },
    name:    { en: "Kerala Free Textbook & School Uniform Scheme",        hi: "केरल मुफ्त पाठ्यपुस्तक एवं स्कूल यूनिफॉर्म योजना" },
    benefit: { en: "Free textbooks for all + ₹400 uniform allowance per year for Class 1–12 in Govt. schools", hi: "सरकारी स्कूल कक्षा 1–12 के सभी छात्रों को मुफ्त पाठ्यपुस्तकें + ₹400 वार्षिक यूनिफॉर्म भत्ता" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 400,
    apply:   { en: "School Headmaster Office (auto-enrolled)", hi: "विद्यालय प्रधानाचार्य कार्यालय (स्वतः नामांकित)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "School Admission / Enrollment Certificate"],
               hi: ["आधार कार्ड", "विद्यालय प्रवेश / नामांकन प्रमाण पत्र"] },
    match: (a) => a.state === "Kerala" && a.who === "student",
  },

  // ADD MORE KERALA SCHEMES ABOVE THIS LINE ↑
  // {
  //   id: "kerala_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Kerala",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Kerala",
  // },

];
