// Delhi — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "delhi_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const DELHI_SCHEMES = [

  // ── HEALTH ──────────────────────────────────────────────────────────────────

  {
    id: "delhi_mohalla",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept.", hi: "दिल्ली स्वास्थ्य विभाग" },
    name:    { en: "Mohalla Clinic Scheme (Delhi)",            hi: "मोहल्ला क्लिनिक योजना (दिल्ली)" },
    benefit: { en: "Free OPD, medicines & tests near home",   hi: "घर के पास मुफ्त OPD, दवाएं और टेस्ट" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5629869", hi: "health.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi",
  },

  {
    id: "delhi_sanjeevani",
    icon: "👴", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept.", hi: "दिल्ली स्वास्थ्य विभाग" },
    name:    { en: "Sanjeevani Scheme (Delhi)",                        hi: "संजीवनी योजना (दिल्ली)" },
    benefit: { en: "Free OPD, medicines & diagnostics for seniors 60+", hi: "60+ वरिष्ठ नागरिकों को मुफ्त OPD, दवाएं व जांच" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 8000,
    apply:   { en: "health.delhi.gov.in", hi: "health.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.who === "senior" || a.age === "above60"),
  },

  // ── WOMEN WELFARE ────────────────────────────────────────────────────────────

  {
    id: "delhi_mahila_samman",
    icon: "👩", color: "#BE185D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept.", hi: "दिल्ली महिला एवं बाल विकास विभाग" },
    name:    { en: "Mukhyamantri Mahila Samman Yojana",            hi: "मुख्यमंत्री महिला सम्मान योजना" },
    benefit: { en: "₹1,000/month honorarium for women aged 18+",   hi: "18+ वर्ष की महिलाओं को ₹1,000 प्रतिमाह सम्मान राशि" },
    tag:     { en: "Women Welfare", hi: "महिला कल्याण" },
    annual: 12000,
    apply:   { en: "https://www.govtschemes.in/delhi-mukhyamantri-mahila-samman-yojana", hi: "wcd.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Voter ID / Address Proof", "Bank Account Passbook"],
               hi: ["आधार कार्ड", "दिल्ली मतदाता पहचान पत्र / पता प्रमाण", "बैंक खाता पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "women",
  },

  {
    id: "delhi_free_bus_women",
    icon: "🚌", color: "#7C3AED", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept.", hi: "दिल्ली परिवहन विभाग" },
    name:    { en: "Free DTC Bus Travel for Women (Delhi)",      hi: "महिलाओं के लिए मुफ्त DTC बस यात्रा (दिल्ली)" },
    benefit: { en: "Free travel on all DTC & cluster buses for women", hi: "सभी DTC व क्लस्टर बसों में महिलाओं की मुफ्त यात्रा" },
    tag:     { en: "Transport", hi: "परिवहन" },
    annual: 3600,
    apply:   { en: "transport.delhi.gov.in", hi: "transport.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Any valid ID Proof (Aadhaar / Voter ID)"],
               hi: ["कोई भी मान्य पहचान पत्र (आधार / मतदाता पहचान)"] },
    match: (a) => a.state === "Delhi" && a.who === "women",
  },

  {
    id: "delhi_vidhwa_pension",
    icon: "🤝", color: "#9D174D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Vidhwa Pension Yojana (Delhi)",               hi: "विधवा पेंशन योजना (दिल्ली)" },
    benefit: { en: "₹2,500/month pension for widows from low-income families", hi: "कम आय वाली विधवाओं को ₹2,500 प्रतिमाह पेंशन" },
    tag:     { en: "Women Welfare", hi: "महिला कल्याण" },
    annual: 30000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Income Certificate", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "आय प्रमाण पत्र", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.income === "below1" || a.income === "1to3"),
  },

  {
    id: "delhi_ladli",
    icon: "👧", color: "#DB2777", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept.", hi: "दिल्ली महिला एवं बाल विकास विभाग" },
    name:    { en: "Ladli Scheme (Delhi)",                              hi: "लाड़ली योजना (दिल्ली)" },
    benefit: { en: "Cash deposits for girl child at birth, Class 1, 6, 9, 10 & 12", hi: "बालिका के जन्म, कक्षा 1, 6, 9, 10 व 12 पर नकद जमा" },
    tag:     { en: "Girl Child", hi: "बालिका कल्याण" },
    annual: 5000,
    apply:   { en: "https://www.govtschemes.in/delhi-ladli-scheme", hi: "wcd.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card of Parent", "Girl Child's Birth Certificate", "Income Certificate", "Delhi Domicile Certificate"],
               hi: ["माता-पिता का आधार कार्ड", "बालिका का जन्म प्रमाण पत्र", "आय प्रमाण पत्र", "दिल्ली अधिवास प्रमाण पत्र"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── SENIOR CITIZEN ───────────────────────────────────────────────────────────

  {
    id: "delhi_tirth_yatra",
    icon: "🛕", color: "#B45309", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Tirath Yatra Prabandhak Samiti", hi: "दिल्ली तीर्थ यात्रा प्रबंधक समिति" },
    name:    { en: "Mukhyamantri Tirth Yatra Yojana (Delhi)",        hi: "मुख्यमंत्री तीर्थ यात्रा योजना (दिल्ली)" },
    benefit: { en: "Free all-inclusive pilgrimage trip for seniors 60+ to major religious sites", hi: "60+ वरिष्ठ नागरिकों के लिए प्रमुख तीर्थस्थलों की मुफ्त यात्रा" },
    tag:     { en: "Senior Welfare", hi: "वरिष्ठ नागरिक कल्याण" },
    annual: 0,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Delhi Voter ID", "Medical Fitness Certificate"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "दिल्ली मतदाता पहचान पत्र", "स्वास्थ्य प्रमाण पत्र"] },
    match: (a) => a.state === "Delhi" && (a.who === "senior" || a.age === "above60"),
  },

  {
    id: "delhi_old_age_pension",
    icon: "💰", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Vriddhjan Pension Yojana (Delhi)",              hi: "वृद्धजन पेंशन योजना (दिल्ली)" },
    benefit: { en: "₹2,000/month old-age pension for BPL seniors 60+", hi: "BPL वरिष्ठ नागरिकों को ₹2,000 प्रतिमाह पेंशन" },
    tag:     { en: "Pension", hi: "पेंशन" },
    annual: 24000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "BPL / Income Certificate", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "BPL / आय प्रमाण पत्र", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.who === "senior" || a.age === "above60") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── DISABILITY ───────────────────────────────────────────────────────────────

  {
    id: "delhi_divyang_pension",
    icon: "♿", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Divyang Pension Yojana (Delhi)",                        hi: "दिव्यांग पेंशन योजना (दिल्ली)" },
    benefit: { en: "₹2,500/month pension for persons with 40%+ disability", hi: "40%+ दिव्यांगता वाले व्यक्तियों को ₹2,500 प्रतिमाह पेंशन" },
    tag:     { en: "Disability", hi: "दिव्यांग कल्याण" },
    annual: 30000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "Delhi Address Proof", "Income Certificate", "Bank Passbook"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+)", "दिल्ली पता प्रमाण", "आय प्रमाण पत्र", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi",
  },

  // ── UTILITIES ────────────────────────────────────────────────────────────────

  {
    id: "delhi_free_electricity",
    icon: "⚡", color: "#CA8A04", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Power Dept. / DERC", hi: "दिल्ली ऊर्जा विभाग / DERC" },
    name:    { en: "Free Electricity Subsidy (Delhi)",                  hi: "मुफ्त बिजली सब्सिडी (दिल्ली)" },
    benefit: { en: "0–200 units/month free; 201–400 units at 50% subsidy", hi: "0–200 यूनिट/माह मुफ्त; 201–400 यूनिट पर 50% सब्सिडी" },
    tag:     { en: "Electricity", hi: "बिजली" },
    annual: 2400,
    apply:   { en: "bsesrajdhani.co.in / tatapower-ddl.com", hi: "bsesrajdhani.co.in / tatapower-ddl.com" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Electricity Consumer Number", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "बिजली उपभोक्ता नंबर", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi",
  },

  {
    id: "delhi_free_water",
    icon: "💧", color: "#0284C7", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Jal Board", hi: "दिल्ली जल बोर्ड" },
    name:    { en: "Free Water Scheme — 20 KL/Month (Delhi)",     hi: "मुफ्त पानी योजना — 20 KL/माह (दिल्ली)" },
    benefit: { en: "20 kilolitres of water free per month for metered households", hi: "मीटर वाले घरों को प्रतिमाह 20 किलोलीटर पानी मुफ्त" },
    tag:     { en: "Water & Sanitation", hi: "जल एवं स्वच्छता" },
    annual: 1800,
    apply:   { en: "delhijalboard.nic.in", hi: "delhijalboard.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "DJB Water Meter Connection", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "DJB वाटर मीटर कनेक्शन", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi",
  },

  // ── HOUSING ──────────────────────────────────────────────────────────────────

  {
    id: "delhi_pm_uday",
    icon: "🏠", color: "#B45309", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Development Authority (DDA)", hi: "दिल्ली विकास प्राधिकरण (DDA)" },
    name:    { en: "PM-UDAY — Unauthorized Colony Regularization (Delhi)", hi: "PM-UDAY — अनधिकृत कॉलोनी नियमितीकरण (दिल्ली)" },
    benefit: { en: "Property rights & land ownership for 1,731 unauthorized colonies in Delhi", hi: "दिल्ली की 1,731 अनधिकृत कॉलोनियों के निवासियों को संपत्ति अधिकार" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "http://dda.gov.in/pm_uday/scheme", hi: "pmay-uday.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Property Documents / Possession Proof", "Delhi Domicile", "Passport-size Photo"],
               hi: ["आधार कार्ड", "संपत्ति दस्तावेज / कब्जा प्रमाण", "दिल्ली अधिवास", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.house === "kutcha" || a.house === "no"),
  },

  // ── EDUCATION ────────────────────────────────────────────────────────────────

  {
    id: "delhi_sc_scholarship",
    icon: "📚", color: "#4338CA", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept.", hi: "दिल्ली SC/ST कल्याण विभाग" },
    name:    { en: "SC Post-Matric Scholarship (Delhi)",               hi: "SC मैट्रिकोत्तर छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹8,000–₹12,000/year scholarship for SC students after Class 10", hi: "SC छात्रों को कक्षा 10 के बाद ₹8,000–₹12,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmsfssd", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC)", "Class 10 Marksheet", "Income Certificate", "Bank Passbook", "Institution Bonafide"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC)", "कक्षा 10 अंकतालिका", "आय प्रमाण पत्र", "बैंक पासबुक", "संस्थान बोनाफाइड"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "sc",
  },

  {
    id: "delhi_st_scholarship",
    icon: "📖", color: "#065F46", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept.", hi: "दिल्ली SC/ST कल्याण विभाग" },
    name:    { en: "ST Post-Matric Scholarship (Delhi)",               hi: "ST मैट्रिकोत्तर छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹7,000–₹10,000/year scholarship for ST students after Class 10", hi: "ST छात्रों को कक्षा 10 के बाद ₹7,000–₹10,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 10000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmsfssd", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (ST)", "Class 10 Marksheet", "Income Certificate", "Bank Passbook", "Institution Bonafide"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (ST)", "कक्षा 10 अंकतालिका", "आय प्रमाण पत्र", "बैंक पासबुक", "संस्थान बोनाफाइड"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "st",
  },

  {
    id: "delhi_obc_scholarship",
    icon: "🎓", color: "#1E40AF", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Backward Classes Welfare Dept.", hi: "दिल्ली पिछड़ा वर्ग कल्याण विभाग" },
    name:    { en: "OBC Post-Matric Scholarship (Delhi)",              hi: "OBC मैट्रिकोत्तर छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹5,000–₹8,000/year for OBC students from low-income families", hi: "कम आय OBC परिवारों के छात्रों को ₹5,000–₹8,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 8000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pm-yasasvipmsobcebcdnts", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "OBC Certificate (Non-Creamy Layer)", "Class 10 Marksheet", "Income Certificate", "Bank Passbook"],
               hi: ["आधार कार्ड", "OBC प्रमाण पत्र (नॉन-क्रीमी लेयर)", "कक्षा 10 अंकतालिका", "आय प्रमाण पत्र", "बैंक पासबुक"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "obc" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── LABOUR & EMPLOYMENT ──────────────────────────────────────────────────────

  {
    id: "delhi_bocw",
    icon: "🔨", color: "#D97706", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Building & Other Construction Workers Welfare Board", hi: "दिल्ली भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड" },
    name:    { en: "BOCW Welfare Scheme (Delhi Construction Workers)",        hi: "BOCW कल्याण योजना (दिल्ली निर्माण कामगार)" },
    benefit: { en: "Pension, insurance, education & maternity benefits for registered construction workers", hi: "पंजीकृत निर्माण कामगारों को पेंशन, बीमा, शिक्षा व मातृत्व लाभ" },
    tag:     { en: "Labour Welfare", hi: "श्रम कल्याण" },
    annual: 6000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pchcw", hi: "labourcis.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "90-day Employment Proof from Contractor", "Bank Passbook", "Passport-size Photo"],
               hi: ["आधार कार्ड", "ठेकेदार से 90 दिन रोजगार प्रमाण", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women") && (a.income === "below1" || a.income === "1to3"),
  },

  {
    id: "delhi_kaushal_vikas",
    icon: "🛠️", color: "#0D9488", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Skill & Entrepreneurship University (DSEU)", hi: "दिल्ली कौशल एवं उद्यमिता विश्वविद्यालय (DSEU)" },
    name:    { en: "Delhi Skill Mission — Free Vocational Training",     hi: "दिल्ली कौशल मिशन — मुफ्त व्यावसायिक प्रशिक्षण" },
    benefit: { en: "Free industry-linked skill training with placement support for youth 18–45", hi: "18–45 वर्ष युवाओं को उद्योग-संबद्ध मुफ्त कौशल प्रशिक्षण व नियोजन सहायता" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 5000,
    apply:   { en: "https://dseu.ac.in", hi: "https://dseu.ac.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof", "Class 8/10 Marksheet", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण", "कक्षा 8/10 अंकतालिका", "पासपोर्ट फोटो"] },
    keywords: ["class10","skill","dropout"],
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "student") && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── SC/ST ENTREPRENEURSHIP ───────────────────────────────────────────────────

  {
    id: "delhi_dsidc_sc_loan",
    icon: "🏢", color: "#7C3AED", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Development Corp. (DSCSTFDC)", hi: "दिल्ली SC/ST विकास निगम (DSCSTFDC)" },
    name:    { en: "SC/ST Entrepreneur Loan Scheme (Delhi)",                hi: "SC/ST उद्यमी ऋण योजना (दिल्ली)" },
    benefit: { en: "Subsidised loans up to ₹20 lakh at 4–6% interest for SC/ST entrepreneurs", hi: "SC/ST उद्यमियों को ₹20 लाख तक 4–6% ब्याज पर सब्सिडाइज्ड ऋण" },
    tag:     { en: "Entrepreneurship", hi: "उद्यमिता" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/sui", hi: "dscstfdc.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC/ST Certificate", "Business Plan", "Delhi Address Proof", "Income Certificate", "Bank Statement"],
               hi: ["आधार कार्ड", "SC/ST प्रमाण पत्र", "व्यवसाय योजना", "दिल्ली पता प्रमाण", "आय प्रमाण पत्र", "बैंक विवरण"] },
    match: (a) => a.state === "Delhi" && (a.caste === "sc" || a.caste === "st") && (a.who === "business" || a.who === "general"),
  },

  // ── FOOD SECURITY ────────────────────────────────────────────────────────────

  {
    id: "delhi_ghar_ghar_ration",
    icon: "🛒", color: "#15803D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Food & Civil Supplies Dept.", hi: "दिल्ली खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Mukhyamantri Ghar Ghar Ration Yojana (Delhi)",    hi: "मुख्यमंत्री घर घर राशन योजना (दिल्ली)" },
    benefit: { en: "Pre-packed ration (wheat flour, rice, sugar) delivered to BPL/AAY doorstep", hi: "BPL/AAY लाभार्थियों को घर पर पैक्ड राशन (आटा, चावल, चीनी) की डिलीवरी" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 12000,
    apply:   { en: "nfs.delhi.gov.in", hi: "nfs.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / AAY Ration Card", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "BPL / AAY राशन कार्ड", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.rationCard === "bpl" || a.rationCard === "aay"),
  },

  {
    id: "delhi_aam_aadmi_canteen",
    icon: "🍱", color: "#16A34A", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Food & Civil Supplies Dept.", hi: "दिल्ली खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Aam Aadmi Canteen (Delhi)",                          hi: "आम आदमी कैंटीन (दिल्ली)" },
    benefit: { en: "Subsidised nutritious meals at ₹10–₹15 for workers & low-income residents", hi: "श्रमिकों व कम आय वाले लोगों को ₹10–₹15 में पौष्टिक भोजन" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 3600,
    apply:   { en: "food.delhi.gov.in", hi: "food.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["No registration required — walk in at any canteen location"],
               hi: ["कोई पंजीकरण नहीं — किसी भी कैंटीन पर सीधे आएं"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── EDUCATION (NEW) ──────────────────────────────────────────────────────────

  {
    id: "delhi_pre_matric_sc_st",
    icon: "✏️", color: "#7C3AED", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept.", hi: "दिल्ली SC/ST कल्याण विभाग" },
    name:    { en: "Pre-Matric Scholarship for SC/ST Students (Delhi)",   hi: "SC/ST छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹2,500–₹3,500/year for SC/ST students in Class 1–10", hi: "कक्षा 1–10 के SC/ST छात्रों को ₹2,500–₹3,500 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 3500,
    apply:   { en: "https://scholarlify.com/e/PMSSCSD", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST)", "Previous Class Marksheet", "Income Certificate", "School Bonafide"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST)", "पिछली कक्षा की अंकतालिका", "आय प्रमाण पत्र", "विद्यालय बोनाफाइड"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.caste === "sc" || a.caste === "st") && (a.educationLevel === "class1to8" || a.educationLevel === "class9to12"),
  },

  {
    id: "delhi_ews_scholarship",
    icon: "🏅", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Education Dept.", hi: "दिल्ली शिक्षा विभाग" },
    name:    { en: "EWS Student Scholarship (Delhi)",                    hi: "EWS छात्र छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹6,000–₹8,000/year for EWS students pursuing higher education", hi: "उच्च शिक्षा प्राप्त EWS छात्रों को ₹6,000–₹8,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 8000,
    apply:   { en: "https://www.edudel.nic.in", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "EWS Certificate", "Class 10/12 Marksheet", "Income Certificate (below ₹8 lakh)", "Bank Passbook"],
               hi: ["आधार कार्ड", "EWS प्रमाण पत्र", "कक्षा 10/12 अंकतालिका", "आय प्रमाण पत्र (₹8 लाख से कम)", "बैंक पासबुक"] },
    keywords: ["class10","class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "ews",
  },

  {
    id: "delhi_free_coaching",
    icon: "🎯", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare & Minority Dept.", hi: "दिल्ली SC/ST कल्याण एवं अल्पसंख्यक विभाग" },
    name:    { en: "Free Coaching for Competitive Exams (Delhi)",        hi: "प्रतियोगी परीक्षाओं के लिए मुफ्त कोचिंग (दिल्ली)" },
    benefit: { en: "Free coaching for UPSC, SSC, banking & state exams for SC/ST/OBC/EWS students", hi: "SC/ST/OBC/EWS छात्रों को UPSC, SSC, बैंकिंग व राज्य परीक्षाओं की मुफ्त कोचिंग" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 20000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/fcssos", hi: "scstwelfare.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste / EWS Certificate", "Class 12 / Graduation Marksheet", "Income Certificate", "Delhi Domicile"],
               hi: ["आधार कार्ड", "जाति / EWS प्रमाण पत्र", "कक्षा 12 / स्नातक अंकतालिका", "आय प्रमाण पत्र", "दिल्ली अधिवास"] },
    keywords: ["class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.caste === "sc" || a.caste === "st" || a.caste === "obc" || a.caste === "ews") && (a.age === "18to35"),
  },

  {
    id: "delhi_student_bus_pass",
    icon: "🎫", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept.", hi: "दिल्ली परिवहन विभाग" },
    name:    { en: "DTC Subsidised Student Bus Pass (Delhi)",            hi: "DTC सब्सिडाइज्ड छात्र बस पास (दिल्ली)" },
    benefit: { en: "Heavily discounted monthly DTC bus pass for school & college students", hi: "स्कूल व कॉलेज छात्रों के लिए भारी छूट पर मासिक DTC बस पास" },
    tag:     { en: "Transport", hi: "परिवहन" },
    annual: 1800,
    apply:   { en: "transport.delhi.gov.in", hi: "transport.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "School / College ID Card", "School Bonafide Certificate"],
               hi: ["आधार कार्ड", "विद्यालय / महाविद्यालय पहचान पत्र", "स्कूल बोनाफाइड प्रमाण पत्र"] },
    match: (a) => a.state === "Delhi" && a.who === "student",
  },

  {
    id: "delhi_disability_scholarship",
    icon: "🎗️", color: "#6D28D9", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Scholarship for Disabled Students (Delhi)",          hi: "दिव्यांग छात्रों के लिए छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹6,000–₹8,000/year for students with 40%+ disability pursuing education", hi: "40%+ दिव्यांग छात्रों को शिक्षा हेतु ₹6,000–₹8,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 8000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "School / College Bonafide", "Marksheet", "Bank Passbook"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+)", "विद्यालय / महाविद्यालय बोनाफाइड", "अंकतालिका", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "student",
  },

  // ── YOUTH ENTREPRENEURSHIP ───────────────────────────────────────────────────

  {
    id: "delhi_muva",
    icon: "🚀", color: "#EA580C", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Skill & Entrepreneurship University (DSEU)", hi: "दिल्ली कौशल एवं उद्यमिता विश्वविद्यालय (DSEU)" },
    name:    { en: "Mukhyamantri Yuva Udyami Vikas Abhiyan — MUVA (Delhi)", hi: "मुख्यमंत्री युवा उद्यमी विकास अभियान — MUVA (दिल्ली)" },
    benefit: { en: "Zero-collateral business loans up to ₹25 lakh + mentorship for young entrepreneurs", hi: "युवा उद्यमियों को ₹25 लाख तक शून्य-जमानत व्यापार ऋण + मार्गदर्शन" },
    tag:     { en: "Entrepreneurship", hi: "उद्यमिता" },
    annual: 0,
    apply:   { en: "https://dseu.ac.in/muva", hi: "https://dseu.ac.in/muva" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Domicile Certificate", "Business Plan / Idea Pitch", "Class 12 Marksheet", "Bank Statement"],
               hi: ["आधार कार्ड", "दिल्ली अधिवास प्रमाण पत्र", "व्यवसाय योजना / आइडिया पिच", "कक्षा 12 अंकतालिका", "बैंक विवरण"] },
    match: (a) => a.state === "Delhi" && a.who === "business" && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── ARTISAN & COTTAGE INDUSTRY ───────────────────────────────────────────────

  {
    id: "delhi_kvib_artisan",
    icon: "🧵", color: "#B45309", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Khadi & Village Industries Board (DKVIB)", hi: "दिल्ली खादी एवं ग्रामोद्योग बोर्ड (DKVIB)" },
    name:    { en: "Artisan & Cottage Industry Support (DKVIB Delhi)",   hi: "कारीगर एवं कुटीर उद्योग सहायता (DKVIB दिल्ली)" },
    benefit: { en: "Subsidised loans, tools & training for artisans and home-based cottage workers", hi: "कारीगरों व घरेलू उद्योग श्रमिकों को सब्सिडाइज्ड ऋण, औजार व प्रशिक्षण" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 5000,
    apply:   { en: "dkvib.delhi.gov.in", hi: "dkvib.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof", "Artisan / Craft Skill Proof", "Bank Passbook", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण", "कारीगरी / शिल्प कौशल प्रमाण", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── LEGAL AID ────────────────────────────────────────────────────────────────

  {
    id: "delhi_legal_aid",
    icon: "⚖️", color: "#374151", scope: "state", state: "Delhi",
    ministry: { en: "Delhi State Legal Services Authority (DSLSA)", hi: "दिल्ली राज्य विधिक सेवा प्राधिकरण (DSLSA)" },
    name:    { en: "Free Legal Aid — DSLSA (Delhi)",                     hi: "मुफ्त कानूनी सहायता — DSLSA (दिल्ली)" },
    benefit: { en: "Free legal representation, advice & Lok Adalat access for BPL, SC/ST, women & seniors", hi: "BPL, SC/ST, महिलाओं व वरिष्ठ नागरिकों को मुफ्त कानूनी प्रतिनिधित्व व लोक अदालत सेवा" },
    tag:     { en: "Legal Aid", hi: "कानूनी सहायता" },
    annual: 5000,
    apply:   { en: "dslsa.org", hi: "dslsa.org" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income / BPL Certificate or Caste Certificate (SC/ST)"],
               hi: ["आधार कार्ड", "आय / BPL प्रमाण पत्र या जाति प्रमाण पत्र (SC/ST)"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3" || a.caste === "sc" || a.caste === "st" || a.who === "women" || a.who === "senior"),
  },

  // ── WOMEN WELFARE (NEW) ──────────────────────────────────────────────────────

  {
    id: "delhi_widow_remarriage",
    icon: "💐", color: "#BE185D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept.", hi: "दिल्ली महिला एवं बाल विकास विभाग" },
    name:    { en: "Widow Remarriage Incentive Scheme (Delhi)",          hi: "विधवा पुनर्विवाह प्रोत्साहन योजना (दिल्ली)" },
    benefit: { en: "One-time financial grant of ₹50,000 to widows upon remarriage", hi: "पुनर्विवाह पर विधवाओं को ₹50,000 एकमुश्त वित्तीय अनुदान" },
    tag:     { en: "Women Welfare", hi: "महिला कल्याण" },
    annual: 50000,
    apply:   { en: "wcd.delhi.gov.in", hi: "wcd.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "First Husband's Death Certificate", "Remarriage Certificate / Court Affidavit", "Income Certificate", "Bank Passbook"],
               hi: ["आधार कार्ड", "पहले पति का मृत्यु प्रमाण पत्र", "पुनर्विवाह प्रमाण पत्र / कोर्ट हलफनामा", "आय प्रमाण पत्र", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── HEALTH INSURANCE ─────────────────────────────────────────────────────────

  {
    id: "delhi_ayushman_arogya",
    icon: "🏨", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health & Family Welfare Dept.", hi: "दिल्ली स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Ayushman Bharat — Mukhyamantri Aarogya Delhi (AB-MAD)", hi: "आयुष्मान भारत — मुख्यमंत्री आरोग्य दिल्ली (AB-MAD)" },
    benefit: { en: "Free cashless hospitalisation up to ₹10 lakh/year at empanelled hospitals", hi: "सूचीबद्ध अस्पतालों में ₹10 लाख/वर्ष तक मुफ्त कैशलेस इलाज" },
    tag:     { en: "Health Insurance", hi: "स्वास्थ्य बीमा" },
    annual: 500000,
    apply:   { en: "https://aam.mohfw.gov.in", hi: "health.delhi.gov.in/ayushman" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Ration Card / Address Proof", "Income Certificate (if applicable)", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिल्ली राशन कार्ड / पता प्रमाण", "आय प्रमाण पत्र (यदि लागू हो)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3" || a.caste === "sc" || a.caste === "st"),
  },

  // ── MATERNITY ────────────────────────────────────────────────────────────────

  {
    id: "delhi_jsy_maternity",
    icon: "🤱", color: "#DB2777", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept. (NHM)", hi: "दिल्ली स्वास्थ्य विभाग (NHM)" },
    name:    { en: "Janani Suraksha Yojana — JSY (Delhi)",               hi: "जननी सुरक्षा योजना — JSY (दिल्ली)" },
    benefit: { en: "₹1,000 cash for institutional delivery + free delivery at govt hospitals for BPL women", hi: "BPL महिलाओं को सरकारी अस्पताल में प्रसव पर ₹1,000 नकद + मुफ्त डिलीवरी" },
    tag:     { en: "Maternity", hi: "मातृत्व" },
    annual: 6000,
    apply:   { en: "nrhm.delhi.gov.in", hi: "nrhm.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate", "Pregnancy Registration Card (MCH Card)", "Bank Passbook"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र", "प्रेगनेंसी पंजीकरण कार्ड (MCH कार्ड)", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.income === "below1" || a.income === "1to3") && (a.age === "18to35" || a.age === "35to60"),
  },

  {
    id: "delhi_icds_anganwadi",
    icon: "👶", color: "#F59E0B", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept. (ICDS)", hi: "दिल्ली महिला एवं बाल विकास विभाग (ICDS)" },
    name:    { en: "ICDS Anganwadi Benefits — Delhi",                    hi: "ICDS आंगनवाड़ी लाभ — दिल्ली" },
    benefit: { en: "Free supplementary nutrition, health check-ups & preschool education for children 0–6 & pregnant/lactating mothers", hi: "0–6 वर्ष बच्चों व गर्भवती/धात्री माताओं को मुफ्त पोषण, स्वास्थ्य जांच व प्री-स्कूल शिक्षा" },
    tag:     { en: "Child Welfare", hi: "बाल कल्याण" },
    annual: 6000,
    apply:   { en: "wcd.delhi.gov.in", hi: "wcd.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Child's Birth Certificate", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "बच्चे का जन्म प्रमाण पत्र", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── HOUSING (NEW) ────────────────────────────────────────────────────────────

  {
    id: "delhi_ews_dda_flat",
    icon: "🏗️", color: "#92400E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Development Authority (DDA)", hi: "दिल्ली विकास प्राधिकरण (DDA)" },
    name:    { en: "DDA EWS / LIG Housing Scheme (Delhi)",               hi: "DDA EWS / LIG आवास योजना (दिल्ली)" },
    benefit: { en: "Affordable flats for EWS & LIG applicants at below-market prices via DDA housing draws", hi: "DDA आवास ड्रॉ के माध्यम से EWS व LIG को बाजार से कम कीमत पर किफायती फ्लैट" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "https://dda.gov.in", hi: "https://dda.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "EWS / Income Certificate (below ₹3L p.a.)", "Delhi Domicile (3+ years)", "No Existing Property Affidavit", "Bank Statement"],
               hi: ["आधार कार्ड", "EWS / आय प्रमाण पत्र (₹3L प्रति वर्ष से कम)", "दिल्ली अधिवास (3+ वर्ष)", "कोई संपत्ति नहीं का शपथपत्र", "बैंक विवरण"] },
    match: (a) => a.state === "Delhi" && (a.house === "no" || a.house === "kutcha") && (a.caste === "ews" || a.income === "below1" || a.income === "1to3"),
  },

  // ── SOCIAL WELFARE (NEW) ─────────────────────────────────────────────────────

  {
    id: "delhi_transgender_pension",
    icon: "🌈", color: "#7C3AED", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Social Security Pension for Transgender Persons (Delhi)", hi: "ट्रांसजेंडर व्यक्तियों के लिए सामाजिक सुरक्षा पेंशन (दिल्ली)" },
    benefit: { en: "₹2,500/month pension for transgender persons registered with Delhi Social Welfare", hi: "दिल्ली समाज कल्याण में पंजीकृत ट्रांसजेंडर व्यक्तियों को ₹2,500 प्रतिमाह पेंशन" },
    tag:     { en: "Transgender Welfare", hi: "ट्रांसजेंडर कल्याण" },
    annual: 30000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Transgender Identity Certificate (TG Card)", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "ट्रांसजेंडर पहचान प्रमाण पत्र (TG कार्ड)", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi",
  },

  {
    id: "delhi_inter_caste_marriage",
    icon: "💍", color: "#BE185D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Inter-Caste Marriage Incentive Scheme (Delhi)",       hi: "अंतरजातीय विवाह प्रोत्साहन योजना (दिल्ली)" },
    benefit: { en: "One-time ₹50,000 grant to couples where one partner belongs to SC/ST community", hi: "SC/ST समुदाय के एक साथी वाले दम्पत्तियों को ₹50,000 एकमुश्त अनुदान" },
    tag:     { en: "Social Welfare", hi: "सामाजिक कल्याण" },
    annual: 50000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Cards of Both Spouses", "Marriage Certificate", "Caste Certificate of SC/ST Spouse", "Bank Passbook", "Delhi Address Proof"],
               hi: ["दोनों पति-पत्नी के आधार कार्ड", "विवाह प्रमाण पत्र", "SC/ST पति/पत्नी का जाति प्रमाण पत्र", "बैंक पासबुक", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.caste === "sc" || a.caste === "st"),
  },

  {
    id: "delhi_cm_relief_medical",
    icon: "🆘", color: "#DC2626", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Chief Minister's Relief Fund", hi: "दिल्ली मुख्यमंत्री राहत कोष" },
    name:    { en: "Chief Minister's Relief Fund — Medical Aid (Delhi)",  hi: "मुख्यमंत्री राहत कोष — चिकित्सा सहायता (दिल्ली)" },
    benefit: { en: "Emergency financial assistance up to ₹1.5 lakh for serious illness / accident for BPL families", hi: "BPL परिवारों को गंभीर बीमारी / दुर्घटना पर ₹1.5 लाख तक की आपातकालीन वित्तीय सहायता" },
    tag:     { en: "Emergency Relief", hi: "आपातकालीन राहत" },
    annual: 150000,
    apply:   { en: "delhi.gov.in/cmrf", hi: "delhi.gov.in/cmrf" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate", "Doctor's Certificate / Hospital Estimate", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र", "डॉक्टर प्रमाण पत्र / अस्पताल अनुमान", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── STREET VENDOR ────────────────────────────────────────────────────────────

  {
    id: "delhi_svnidhi_vendor",
    icon: "🛍️", color: "#D97706", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Urban Development / South MCD", hi: "दिल्ली शहरी विकास / दक्षिण MCD" },
    name:    { en: "PM SVANidhi — Street Vendor Working Capital Loan (Delhi)", hi: "PM SVANidhi — स्ट्रीट वेंडर कार्यशील पूंजी ऋण (दिल्ली)" },
    benefit: { en: "Collateral-free loans of ₹10,000–₹50,000 at 7% interest with digital incentives for street vendors", hi: "स्ट्रीट वेंडरों को ₹10,000–₹50,000 बिना जमानत 7% ब्याज पर ऋण व डिजिटल प्रोत्साहन" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pm-svanidhi", hi: "pmsvanidhi.mohua.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Vendor Certificate / Letter of Recommendation from ULB", "Bank / Jan Dhan Account", "Mobile Number linked to Aadhaar"],
               hi: ["आधार कार्ड", "वेंडर प्रमाण पत्र / ULB से अनुशंसा पत्र", "बैंक / जन धन खाता", "आधार से जुड़ा मोबाइल नंबर"] },
    match: (a) => a.state === "Delhi" && a.who === "business" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── SPORTS ───────────────────────────────────────────────────────────────────

  {
    id: "delhi_sports_scholarship",
    icon: "🏅", color: "#059669", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Directorate of Sports", hi: "दिल्ली खेल निदेशालय" },
    name:    { en: "Delhi Sports Scholarship Scheme",                    hi: "दिल्ली खेल छात्रवृत्ति योजना" },
    benefit: { en: "₹10,000–₹15,000/year scholarship for sportspersons representing Delhi at national / state level", hi: "राज्य / राष्ट्रीय स्तर पर दिल्ली का प्रतिनिधित्व करने वाले खिलाड़ियों को ₹10,000–₹15,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Sports", hi: "खेल" },
    annual: 12000,
    apply:   { en: "https://sports.delhigovt.nic.in", hi: "https://sports.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Sports Achievement Certificate (State / National level)", "School / College Bonafide", "Delhi Domicile", "Bank Passbook"],
               hi: ["आधार कार्ड", "खेल उपलब्धि प्रमाण पत्र (राज्य / राष्ट्रीय स्तर)", "स्कूल / कॉलेज बोनाफाइड", "दिल्ली अधिवास", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.who === "student" || a.who === "general") && (a.age === "below18" || a.age === "18to35"),
  },

  // ── APPRENTICESHIP ───────────────────────────────────────────────────────────

  {
    id: "delhi_apprenticeship",
    icon: "🔧", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Directorate of Training & Technical Education (DTTE)", hi: "दिल्ली प्रशिक्षण एवं तकनीकी शिक्षा निदेशालय (DTTE)" },
    name:    { en: "Mukhyamantri Apprenticeship Scheme (Delhi)",          hi: "मुख्यमंत्री अप्रेंटिसशिप योजना (दिल्ली)" },
    benefit: { en: "Monthly stipend of ₹6,000–₹9,000 during industry apprenticeship + certification for Delhi youth", hi: "दिल्ली युवाओं को उद्योग अप्रेंटिसशिप के दौरान ₹6,000–₹9,000 मासिक वजीफा + प्रमाणीकरण" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 9000,
    apply:   { en: "https://drdo.gov.in/drdo/sites/default/files/vacancy/advtDESIDOC10062026.pdf", hi: "dtte.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 8 / 10 / 12 Marksheet", "Delhi Domicile Certificate", "Bank Passbook", "Passport-size Photo"],
               hi: ["आधार कार्ड", "कक्षा 8 / 10 / 12 अंकतालिका", "दिल्ली अधिवास प्रमाण पत्र", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.who === "student" || a.who === "general") && (a.age === "18to35"),
  },

  // ── STUDENT WELFARE ──────────────────────────────────────────────────────────

  {
    id: "delhi_sc_st_girl_hostel",
    icon: "🏫", color: "#4338CA", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept.", hi: "दिल्ली SC/ST कल्याण विभाग" },
    name:    { en: "Free Hostel Facility for SC/ST Girl Students (Delhi)", hi: "SC/ST छात्राओं के लिए मुफ्त छात्रावास (दिल्ली)" },
    benefit: { en: "Free residential hostel with meals & study room for SC/ST girl students pursuing higher education", hi: "उच्च शिक्षा में SC/ST छात्राओं को भोजन व अध्ययन कक्ष सहित मुफ्त आवासीय छात्रावास" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 15000,
    apply:   { en: "scstwelfare.delhi.gov.in", hi: "scstwelfare.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST)", "Class 10/12 Marksheet", "College Admission Proof", "Income Certificate", "Delhi Domicile"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST)", "कक्षा 10/12 अंकतालिका", "कॉलेज प्रवेश प्रमाण", "आय प्रमाण पत्र", "दिल्ली अधिवास"] },
    keywords: ["class10","class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.caste === "sc" || a.caste === "st"),
  },

  // ── GOVERNANCE ───────────────────────────────────────────────────────────────

  {
    id: "delhi_doorstep_services",
    icon: "🚪", color: "#374151", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Dept. of IT (Doorstep Delivery of Services)", hi: "दिल्ली IT विभाग (सेवाओं की द्वार पर डिलीवरी)" },
    name:    { en: "Doorstep Delivery of Govt. Services (Delhi)",         hi: "सरकारी सेवाओं की द्वार पर डिलीवरी (दिल्ली)" },
    benefit: { en: "40+ govt services (income, caste, domicile certificates etc.) delivered at home at ₹50 fee via mobile sahayak", hi: "₹50 शुल्क पर मोबाइल सहायक द्वारा 40+ सरकारी सेवाएं (आय, जाति, अधिवास प्रमाण पत्र आदि) घर पर" },
    tag:     { en: "Governance", hi: "शासन" },
    annual: 600,
    apply:   { en: "https://dmsouthwest.delhi.gov.in/event/doorstep-delivery-of-40-government-services-in-delhi", hi: "delhi.gov.in/doorstep" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Documents specific to the service requested"],
               hi: ["आधार कार्ड", "मांगी गई सेवा के अनुसार दस्तावेज़"] },
    match: (a) => a.state === "Delhi",
  },

  // ── CHILD CARE ───────────────────────────────────────────────────────────────

  {
    id: "delhi_palna_creche",
    icon: "🍼", color: "#F59E0B", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept. (ICDS)", hi: "दिल्ली महिला एवं बाल विकास विभाग (ICDS)" },
    name:    { en: "Palna Free Crèche Scheme (Delhi)",                      hi: "पालना मुफ्त क्रेश योजना (दिल्ली)" },
    benefit: { en: "Free day-care, nutrition & early education for children 6 months–6 years of working mothers", hi: "कामकाजी माताओं के 6 माह–6 वर्ष के बच्चों को मुफ्त डे-केयर, पोषण व प्रारंभिक शिक्षा" },
    tag:     { en: "Child Welfare", hi: "बाल कल्याण" },
    annual: 18000,
    apply:   { en: "wcd.delhi.gov.in", hi: "wcd.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card of Mother", "Child's Birth Certificate", "Employment Proof of Mother", "Delhi Address Proof"],
               hi: ["माता का आधार कार्ड", "बच्चे का जन्म प्रमाण पत्र", "माता का रोजगार प्रमाण", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── ENVIRONMENT / GREEN TRANSPORT ────────────────────────────────────────────

  {
    id: "delhi_ev_subsidy",
    icon: "⚡", color: "#16A34A", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept. / Delhi EV Cell", hi: "दिल्ली परिवहन विभाग / दिल्ली EV सेल" },
    name:    { en: "Delhi EV Policy — Electric Vehicle Purchase Subsidy",   hi: "दिल्ली EV नीति — इलेक्ट्रिक वाहन खरीद सब्सिडी" },
    benefit: { en: "Up to ₹30,000 subsidy on e-two-wheelers; ₹30,000 on e-autos; ₹1.5 lakh on e-cars; road tax & registration fee waiver", hi: "ई-दोपहिया पर ₹30,000; ई-ऑटो पर ₹30,000; ई-कार पर ₹1.5 लाख सब्सिडी; रोड टैक्स व पंजीकरण शुल्क माफ" },
    tag:     { en: "Green Transport", hi: "हरित परिवहन" },
    annual: 30000,
    apply:   { en: "http://ev.delhi.gov.in/brands-dealers", hi: "ev.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Vehicle Purchase Invoice", "Delhi Address Proof", "Bank Account Details"],
               hi: ["आधार कार्ड", "वाहन खरीद चालान", "दिल्ली पता प्रमाण", "बैंक खाता विवरण"] },
    match: (a) => a.state === "Delhi",
  },

  // ── MINORITY WELFARE ─────────────────────────────────────────────────────────

  {
    id: "delhi_minority_scholarship",
    icon: "📚", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Minority Financial & Development Corporation (DMFC)", hi: "दिल्ली अल्पसंख्यक वित्त एवं विकास निगम (DMFC)" },
    name:    { en: "Minority Community Post-Matric Scholarship (Delhi)",    hi: "अल्पसंख्यक समुदाय मैट्रिकोत्तर छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹7,000–₹11,000/year for Muslim, Christian, Sikh, Buddhist, Parsi & Jain students from low-income families", hi: "मुस्लिम, ईसाई, सिख, बौद्ध, पारसी व जैन समुदाय के कम आय छात्रों को ₹7,000–₹11,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 11000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmsfssd", hi: "minorities.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "Class 10 Marksheet", "Income Certificate (below ₹2L)", "Bank Passbook", "College Bonafide"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "कक्षा 10 अंकतालिका", "आय प्रमाण पत्र (₹2L से कम)", "बैंक पासबुक", "कॉलेज बोनाफाइड"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "minority" && (a.income === "below1" || a.income === "1to3"),
  },

  {
    id: "delhi_minority_loan",
    icon: "💼", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Minority Financial & Development Corporation (DMFC)", hi: "दिल्ली अल्पसंख्यक वित्त एवं विकास निगम (DMFC)" },
    name:    { en: "DMFC Livelihood / Business Loan for Minorities (Delhi)", hi: "DMFC अल्पसंख्यक आजीविका / व्यापार ऋण (दिल्ली)" },
    benefit: { en: "Concessional business & self-employment loans up to ₹20 lakh at 6% interest for minority communities", hi: "अल्पसंख्यक समुदायों को ₹20 लाख तक 6% ब्याज पर रियायती व्यापार व स्व-रोजगार ऋण" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 0,
    apply:   { en: "minorities.delhi.gov.in", hi: "minorities.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "Business Plan", "Delhi Domicile", "Income Certificate", "Bank Statement"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "व्यवसाय योजना", "दिल्ली अधिवास", "आय प्रमाण पत्र", "बैंक विवरण"] },
    match: (a) => a.state === "Delhi" && a.caste === "minority" && (a.who === "business" || a.who === "general") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── URBAN HOMELESS ───────────────────────────────────────────────────────────

  {
    id: "delhi_dusib_night_shelter",
    icon: "🏠", color: "#374151", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Urban Shelter Improvement Board (DUSIB)", hi: "दिल्ली शहरी आश्रय सुधार बोर्ड (DUSIB)" },
    name:    { en: "Aasra Night Shelter for Urban Homeless (DUSIB Delhi)",  hi: "शहरी बेघर लोगों के लिए आसरा रैन बसेरा (DUSIB दिल्ली)" },
    benefit: { en: "Free shelter, bedding, toilet & drinking water at 200+ night shelters across Delhi for homeless persons", hi: "दिल्ली भर में 200+ रैन बसेरों में बेघर व्यक्तियों को मुफ्त आश्रय, बिस्तर, शौचालय व पेयजल" },
    tag:     { en: "Social Welfare", hi: "सामाजिक कल्याण" },
    annual: 0,
    apply:   { en: "dusib.gov.in", hi: "dusib.gov.in" }, applyType: "offline",
    docs:    { en: ["No documents required — walk-in basis"],
               hi: ["कोई दस्तावेज नहीं — सीधे प्रवेश आधार पर"] },
    match: (a) => a.state === "Delhi" && (a.house === "no" || a.income === "below1"),
  },

  // ── STARTUP & INNOVATION ─────────────────────────────────────────────────────

  {
    id: "delhi_startup_policy",
    icon: "🚀", color: "#7C3AED", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Innovation Bureau / DTIC", hi: "दिल्ली इनोवेशन ब्यूरो / DTIC" },
    name:    { en: "Delhi Startup Policy — Seed Fund & Incubation Support",  hi: "दिल्ली स्टार्टअप नीति — सीड फंड व इनक्यूबेशन सहायता" },
    benefit: { en: "Seed grants up to ₹50 lakh, free co-working space, mentorship & fast-track regulatory support for Delhi-based startups", hi: "दिल्ली स्थित स्टार्टअप को ₹50 लाख तक सीड ग्रांट, मुफ्त को-वर्किंग, मेंटरशिप व त्वरित नियामक सहायता" },
    tag:     { en: "Entrepreneurship", hi: "उद्यमिता" },
    annual: 0,
    apply:   { en: "https://seedfund.startupindia.gov.in", hi: "startup.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "DPIIT Startup Recognition Certificate", "Delhi Business Address Proof", "Pitch Deck / Business Plan", "Bank Statement"],
               hi: ["आधार कार्ड", "DPIIT स्टार्टअप मान्यता प्रमाण पत्र", "दिल्ली व्यापार पता प्रमाण", "पिच डेक / व्यवसाय योजना", "बैंक विवरण"] },
    match: (a) => a.state === "Delhi" && a.who === "business" && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── AUTO / TAXI DRIVER WELFARE ────────────────────────────────────────────────

  {
    id: "delhi_auto_taxi_welfare",
    icon: "🚕", color: "#D97706", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept. — Auto/TSR Welfare Board", hi: "दिल्ली परिवहन विभाग — ऑटो/TSR कल्याण बोर्ड" },
    name:    { en: "Auto / Taxi Driver Welfare Scheme (Delhi)",              hi: "ऑटो / टैक्सी चालक कल्याण योजना (दिल्ली)" },
    benefit: { en: "Accident insurance, children's education aid, medical assistance & funeral grant for registered auto-rickshaw & taxi drivers", hi: "पंजीकृत ऑटो-रिक्शा व टैक्सी चालकों को दुर्घटना बीमा, बच्चों की शिक्षा सहायता, चिकित्सा व अंत्येष्टि अनुदान" },
    tag:     { en: "Labour Welfare", hi: "श्रम कल्याण" },
    annual: 5000,
    apply:   { en: "transport.delhi.gov.in", hi: "transport.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Commercial Driving Licence", "Vehicle Registration Certificate (Auto/Taxi)", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "व्यावसायिक वाहन चालक लाइसेंस", "वाहन पंजीकरण प्रमाण पत्र (ऑटो/टैक्सी)", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "general" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── REMEDIAL EDUCATION ───────────────────────────────────────────────────────

  {
    id: "delhi_mission_buniyaad",
    icon: "✏️", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Directorate of Education, Delhi", hi: "शिक्षा निदेशालय, दिल्ली" },
    name:    { en: "Mission Buniyaad — Foundational Learning Programme (Delhi)", hi: "मिशन बुनियाद — बुनियादी शिक्षा कार्यक्रम (दिल्ली)" },
    benefit: { en: "Free remedial coaching in numeracy & literacy for Class 3–8 govt school students lagging in foundational skills", hi: "कक्षा 3–8 के सरकारी स्कूल छात्रों को अंकगणित व साक्षरता में मुफ्त रेमेडियल कोचिंग" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "edudel.nic.in", hi: "edudel.nic.in" }, applyType: "offline",
    docs:    { en: ["Delhi Govt School Enrollment Proof", "Parent's Aadhaar Card"],
               hi: ["दिल्ली सरकारी विद्यालय नामांकन प्रमाण", "माता-पिता का आधार कार्ड"] },
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.educationLevel === "class1to8"),
  },

  // ── OBC WELFARE ──────────────────────────────────────────────────────────────

  {
    id: "delhi_obc_loan",
    icon: "🏦", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Backward Classes Financial Development Corporation (DBCFDC)", hi: "दिल्ली पिछड़ा वर्ग वित्त एवं विकास निगम (DBCFDC)" },
    name:    { en: "OBC Business & Self-Employment Loan (Delhi — DBCFDC)",   hi: "OBC व्यापार व स्व-रोजगार ऋण (दिल्ली — DBCFDC)" },
    benefit: { en: "Subsidised loans up to ₹5 lakh at 6% interest for OBC (Non-Creamy Layer) entrepreneurs & self-employed persons", hi: "OBC (नॉन-क्रीमी लेयर) उद्यमियों व स्व-रोजगार व्यक्तियों को ₹5 लाख तक 6% ब्याज पर सब्सिडाइज्ड ऋण" },
    tag:     { en: "Entrepreneurship", hi: "उद्यमिता" },
    annual: 0,
    apply:   { en: "dbcfdc.delhi.gov.in", hi: "dbcfdc.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "OBC Certificate (Non-Creamy Layer)", "Business Plan", "Income Certificate", "Delhi Domicile", "Bank Statement"],
               hi: ["आधार कार्ड", "OBC प्रमाण पत्र (नॉन-क्रीमी लेयर)", "व्यवसाय योजना", "आय प्रमाण पत्र", "दिल्ली अधिवास", "बैंक विवरण"] },
    match: (a) => a.state === "Delhi" && a.caste === "obc" && (a.who === "business" || a.who === "general") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── DOMESTIC WORKERS ─────────────────────────────────────────────────────────

  {
    id: "delhi_domestic_workers",
    icon: "🧹", color: "#6B7280", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Labour Dept. — Unorganised Workers Board", hi: "दिल्ली श्रम विभाग — असंगठित कामगार बोर्ड" },
    name:    { en: "Domestic Workers Welfare Scheme (Delhi)",                hi: "घरेलू कामगार कल्याण योजना (दिल्ली)" },
    benefit: { en: "Registration, accident insurance (₹1 lakh), hospitalisation cover, maternity benefit & children's education aid for domestic workers", hi: "घरेलू कामगारों को पंजीकरण, ₹1 लाख दुर्घटना बीमा, अस्पताल कवर, मातृत्व लाभ व बच्चों की शिक्षा सहायता" },
    tag:     { en: "Labour Welfare", hi: "श्रम कल्याण" },
    annual: 6000,
    apply:   { en: "labourcis.delhi.gov.in", hi: "labourcis.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Employer's Reference Letter or Work Proof", "Delhi Address Proof", "Bank Passbook", "Passport-size Photo"],
               hi: ["आधार कार्ड", "नियोक्ता का संदर्भ पत्र या कार्य प्रमाण", "दिल्ली पता प्रमाण", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── MARRIAGE ASSISTANCE ──────────────────────────────────────────────────────

  {
    id: "delhi_marriage_assistance",
    icon: "💒", color: "#BE185D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Marriage Assistance Scheme for BPL Families (Delhi)",      hi: "BPL परिवारों के लिए विवाह सहायता योजना (दिल्ली)" },
    benefit: { en: "One-time grant of ₹51,000 for marriage of daughters from BPL / EWS families", hi: "BPL / EWS परिवारों की बेटियों के विवाह पर ₹51,000 की एकमुश्त सहायता" },
    tag:     { en: "Marriage Aid", hi: "विवाह सहायता" },
    annual: 51000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card of Parents & Bride", "BPL / Income Certificate", "Marriage Card / Invitation", "Delhi Address Proof (3+ years)", "Bank Passbook"],
               hi: ["माता-पिता व वधू का आधार कार्ड", "BPL / आय प्रमाण पत्र", "विवाह कार्ड / निमंत्रण पत्र", "दिल्ली पता प्रमाण (3+ वर्ष)", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── SANITATION WORKER WELFARE ─────────────────────────────────────────────────

  {
    id: "delhi_safai_karamchari",
    icon: "🧹", color: "#52525B", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Safai Karamchari Commission / MCD", hi: "दिल्ली सफाई कर्मचारी आयोग / MCD" },
    name:    { en: "Safai Karamchari Welfare Scheme (Delhi)",                  hi: "सफाई कर्मचारी कल्याण योजना (दिल्ली)" },
    benefit: { en: "Health insurance, protective gear, children's scholarship (₹5,000/yr), housing priority & rehabilitation loans for sanitation workers", hi: "सफाई कर्मचारियों को स्वास्थ्य बीमा, सुरक्षा उपकरण, बच्चों की छात्रवृत्ति (₹5,000/वर्ष), आवास प्राथमिकता व पुनर्वास ऋण" },
    tag:     { en: "Sanitation Worker Welfare", hi: "सफाई कर्मचारी कल्याण" },
    annual: 8000,
    apply:   { en: "delhi.gov.in/safai-karamchari", hi: "delhi.gov.in/safai-karamchari" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Employment Proof (MCD / NDMC / EDMC)", "Caste Certificate (if SC/ST)", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "रोजगार प्रमाण (MCD / NDMC / EDMC)", "जाति प्रमाण पत्र (यदि SC/ST)", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "general" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── WELLNESS ─────────────────────────────────────────────────────────────────

  {
    id: "delhi_dilli_yogshala",
    icon: "🧘", color: "#0D9488", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Dept. of Art, Culture & Languages", hi: "दिल्ली कला, संस्कृति एवं भाषा विभाग" },
    name:    { en: "Dilli Ki Yogshala — Free Yoga Classes (Delhi)",            hi: "दिल्ली की योगशाला — मुफ्त योग कक्षाएं (दिल्ली)" },
    benefit: { en: "Free daily yoga classes by trained instructors at parks, community centres & schools across Delhi for all residents", hi: "दिल्ली के सभी निवासियों के लिए पार्क, सामुदायिक केंद्र व स्कूलों में प्रशिक्षित प्रशिक्षकों द्वारा मुफ्त योग कक्षाएं" },
    tag:     { en: "Wellness", hi: "स्वास्थ्य एवं योग" },
    annual: 0,
    apply:   { en: "https://freeyogadelhi.vercel.app", hi: "dillikiyogshala.com" }, applyType: "online",
    docs:    { en: ["Mobile Number for Registration (online / missed call 9013585858)", "No physical documents required"],
               hi: ["पंजीकरण के लिए मोबाइल नंबर (ऑनलाइन / मिस्ड कॉल 9013585858)", "कोई भौतिक दस्तावेज नहीं"] },
    match: (a) => a.state === "Delhi",
  },

  // ── OBC PRE-MATRIC ───────────────────────────────────────────────────────────

  {
    id: "delhi_obc_prematric",
    icon: "✏️", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Backward Classes Welfare Dept.", hi: "दिल्ली पिछड़ा वर्ग कल्याण विभाग" },
    name:    { en: "OBC Pre-Matric Scholarship (Delhi)",                       hi: "OBC प्री-मैट्रिक छात्रवृत्ति (दिल्ली)" },
    benefit: { en: "₹1,500–₹2,500/year for OBC students in Class 1–10 from families with income below ₹2.5 lakh", hi: "₹2.5 लाख से कम आय वाले OBC परिवारों के कक्षा 1–10 छात्रों को ₹1,500–₹2,500 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 2500,
    apply:   { en: "https://www.myscheme.gov.in/schemes/smstomsssfc", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "OBC Certificate (Non-Creamy Layer)", "Previous Class Marksheet", "Income Certificate (below ₹2.5L)", "School Bonafide"],
               hi: ["आधार कार्ड", "OBC प्रमाण पत्र (नॉन-क्रीमी लेयर)", "पिछली कक्षा की अंकतालिका", "आय प्रमाण पत्र (₹2.5L से कम)", "विद्यालय बोनाफाइड"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "obc" && (a.educationLevel === "class1to8" || a.educationLevel === "class9to12") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── CYCLE RICKSHAW ────────────────────────────────────────────────────────────

  {
    id: "delhi_cycle_rickshaw",
    icon: "🚲", color: "#92400E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept. / South Delhi Municipal Corp.", hi: "दिल्ली परिवहन विभाग / दक्षिण दिल्ली नगर निगम" },
    name:    { en: "Subsidised Rickshaw & Welfare for Cycle Rickshaw Pullers (Delhi)", hi: "साइकिल रिक्शा चालकों के लिए सब्सिडाइज्ड रिक्शा व कल्याण (दिल्ली)" },
    benefit: { en: "Subsidised / free modern cycle rickshaw, annual accidental insurance of ₹1 lakh, free licence & registration for rickshaw pullers", hi: "रिक्शा चालकों को सब्सिडाइज्ड / मुफ्त आधुनिक साइकिल रिक्शा, ₹1 लाख वार्षिक दुर्घटना बीमा, मुफ्त लाइसेंस व पंजीकरण" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 5000,
    apply:   { en: "transport.delhi.gov.in", hi: "transport.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof (3+ years)", "Income Certificate (below ₹1L)", "Passport-size Photo", "Rickshaw Licence (if existing)"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण (3+ वर्ष)", "आय प्रमाण पत्र (₹1L से कम)", "पासपोर्ट फोटो", "रिक्शा लाइसेंस (यदि है)"] },
    match: (a) => a.state === "Delhi" && a.who === "general" && a.income === "below1",
  },

  // ── SLUM REHABILITATION ──────────────────────────────────────────────────────

  {
    id: "delhi_jhuggi_rehab",
    icon: "🏘️", color: "#B45309", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Urban Shelter Improvement Board (DUSIB)", hi: "दिल्ली शहरी आश्रय सुधार बोर्ड (DUSIB)" },
    name:    { en: "DUSIB In-Situ Slum Rehabilitation Scheme (Delhi)",         hi: "DUSIB स्व-स्थाने झुग्गी पुनर्वास योजना (दिल्ली)" },
    benefit: { en: "Free / affordable permanent flat (25 sq m) for jhuggi-jhopri dwellers under in-situ redevelopment", hi: "झुग्गी-झोपड़ी निवासियों को स्व-स्थाने पुनर्विकास में मुफ्त / किफायती स्थायी फ्लैट (25 वर्ग मी)" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "dusib.gov.in", hi: "dusib.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jhuggi Biometric Survey Token / DUSIB Survey Slip", "Delhi Address Proof (2002 cut-off)", "Ration Card", "Passport-size Photo"],
               hi: ["आधार कार्ड", "झुग्गी बायोमेट्रिक सर्वेक्षण टोकन / DUSIB सर्वे पर्ची", "दिल्ली पता प्रमाण (2002 कट-ऑफ)", "राशन कार्ड", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.house === "kutcha" || a.house === "no"),
  },

  // ── MINORITY FREE COACHING ────────────────────────────────────────────────────

  {
    id: "delhi_minority_coaching",
    icon: "🎯", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Minority Financial & Development Corporation (DMFC)", hi: "दिल्ली अल्पसंख्यक वित्त एवं विकास निगम (DMFC)" },
    name:    { en: "Free Coaching for Minority Students — Competitive Exams (Delhi)", hi: "अल्पसंख्यक छात्रों के लिए मुफ्त कोचिंग — प्रतियोगी परीक्षाएं (दिल्ली)" },
    benefit: { en: "Free coaching for UPSC, SSC, banking & entrance exams + ₹1,500/month stipend for minority students", hi: "अल्पसंख्यक छात्रों को UPSC, SSC, बैंकिंग व प्रवेश परीक्षाओं की मुफ्त कोचिंग + ₹1,500/माह वजीफा" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 18000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/freecoach", hi: "minorities.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "Class 12 / Graduation Marksheet", "Income Certificate (below ₹6L)", "Delhi Domicile"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "कक्षा 12 / स्नातक अंकतालिका", "आय प्रमाण पत्र (₹6L से कम)", "दिल्ली अधिवास"] },
    keywords: ["class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "minority" && (a.age === "18to35"),
  },

  // ── ROAD ACCIDENT RELIEF ─────────────────────────────────────────────────────

  {
    id: "delhi_farishte",
    icon: "🚑", color: "#DC2626", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept.", hi: "दिल्ली स्वास्थ्य विभाग" },
    name:    { en: "Farishte Dilli Ke — Free Trauma Care for Road Accident Victims", hi: "फरिश्ते दिल्ली के — सड़क दुर्घटना पीड़ितों का मुफ्त इलाज" },
    benefit: { en: "Free emergency treatment up to ₹1.5 lakh at any empanelled private hospital for road accident victims; Good Samaritans protected from legal hassle", hi: "सड़क दुर्घटना पीड़ितों को किसी भी सूचीबद्ध निजी अस्पताल में ₹1.5 लाख तक मुफ्त आपातकालीन इलाज; मदद करने वालों को कानूनी परेशानी से सुरक्षा" },
    tag:     { en: "Emergency Relief", hi: "आपातकालीन राहत" },
    annual: 150000,
    apply:   { en: "health.delhi.gov.in/farishte", hi: "health.delhi.gov.in/farishte" }, applyType: "offline",
    docs:    { en: ["No prior documents needed — emergency walk-in at any empanelled hospital", "Aadhaar (for post-treatment claim processing)"],
               hi: ["कोई पूर्व दस्तावेज नहीं — किसी भी सूचीबद्ध अस्पताल में आपातकालीन प्रवेश", "आधार (उपचार के बाद दावा प्रक्रिया के लिए)"] },
    match: (a) => a.state === "Delhi",
  },

  // ── DENOTIFIED TRIBES ────────────────────────────────────────────────────────

  {
    id: "delhi_denotified_tribes",
    icon: "🤲", color: "#6B7280", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept. — Denotified & Nomadic Tribes Cell", hi: "दिल्ली समाज कल्याण विभाग — विमुक्त एवं घुमंतू जनजाति प्रकोष्ठ" },
    name:    { en: "Welfare Scheme for Denotified & Nomadic Tribes (Delhi)",    hi: "विमुक्त एवं घुमंतू जनजातियों के लिए कल्याण योजना (दिल्ली)" },
    benefit: { en: "Monthly financial assistance of ₹1,800, free skill training, school scholarships & priority in housing for DNT/NT communities", hi: "DNT/NT समुदायों को ₹1,800 मासिक वित्तीय सहायता, मुफ्त कौशल प्रशिक्षण, स्कूल छात्रवृत्ति व आवास में प्राथमिकता" },
    tag:     { en: "Tribal Welfare", hi: "जनजातीय कल्याण" },
    annual: 21600,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "DNT / Nomadic Tribe Community Certificate", "Delhi Address Proof", "Income Certificate", "Bank Passbook"],
               hi: ["आधार कार्ड", "DNT / घुमंतू जनजाति समुदाय प्रमाण पत्र", "दिल्ली पता प्रमाण", "आय प्रमाण पत्र", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── CRITICAL ILLNESS ─────────────────────────────────────────────────────────

  {
    id: "delhi_cancer_care",
    icon: "🎗️", color: "#9D174D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health & Family Welfare Dept.", hi: "दिल्ली स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Delhi Cancer Patient Aid Fund & Free Screening Programme",  hi: "दिल्ली कैंसर रोगी सहायता कोष एवं मुफ्त स्क्रीनिंग कार्यक्रम" },
    benefit: { en: "Free cancer screening (oral, cervical, breast) at govt hospitals + financial aid up to ₹1 lakh for treatment of BPL cancer patients", hi: "सरकारी अस्पतालों में मुफ्त कैंसर जांच (मुख, गर्भाशय ग्रीवा, स्तन) + BPL कैंसर रोगियों को ₹1 लाख तक इलाज सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 100000,
    apply:   { en: "health.delhi.gov.in", hi: "health.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate", "Doctor's Diagnosis Certificate (if treatment aid)", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र", "चिकित्सक निदान प्रमाण पत्र (इलाज सहायता हेतु)", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── MERIT SCHOLARSHIP ────────────────────────────────────────────────────────

  {
    id: "delhi_vigyan_pratibha",
    icon: "🔬", color: "#0E7490", scope: "state", state: "Delhi",
    ministry: { en: "Directorate of Education, Delhi", hi: "शिक्षा निदेशालय, दिल्ली" },
    name:    { en: "Mukhyamantri Vigyan Pratibha Pariksha (Delhi)",              hi: "मुख्यमंत्री विज्ञान प्रतिभा परीक्षा (दिल्ली)" },
    benefit: { en: "₹5,000/year merit scholarship for top 1,000 Class 9 students in Delhi govt schools selected via science aptitude exam", hi: "विज्ञान प्रतिभा परीक्षा द्वारा चुने गए दिल्ली सरकारी स्कूलों के कक्षा 9 के शीर्ष 1,000 छात्रों को ₹5,000 वार्षिक छात्रवृत्ति" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 5000,
    apply:   { en: "edudel.nic.in", hi: "edudel.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Govt School Enrollment Proof", "Class 8 Marksheet", "School Bonafide Certificate"],
               hi: ["आधार कार्ड", "दिल्ली सरकारी स्कूल नामांकन प्रमाण", "कक्षा 8 अंकतालिका", "स्कूल बोनाफाइड प्रमाण पत्र"] },
    match: (a) => a.state === "Delhi" && a.who === "student" && a.educationLevel === "class9to12",
  },

  // ── WOMEN IN DISTRESS ────────────────────────────────────────────────────────

  {
    id: "delhi_sakhi_osc",
    icon: "🛡️", color: "#9D174D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept. / MoWCD", hi: "दिल्ली महिला एवं बाल विकास विभाग / MoWCD" },
    name:    { en: "Sakhi One-Stop Centre — Women in Distress (Delhi)",          hi: "सखी वन-स्टॉप सेंटर — संकटग्रस्त महिलाएं (दिल्ली)" },
    benefit: { en: "Free emergency shelter (up to 5 days), medical aid, legal assistance, police facilitation & counselling for women facing violence or distress", hi: "हिंसा या संकट में महिलाओं को 5 दिन तक मुफ्त आपातकालीन आश्रय, चिकित्सा, कानूनी व पुलिस सहायता तथा परामर्श" },
    tag:     { en: "Women Welfare", hi: "महिला कल्याण" },
    annual: 0,
    apply:   { en: "wcd.delhi.gov.in (Helpline: 181)", hi: "wcd.delhi.gov.in (हेल्पलाइन: 181)" }, applyType: "offline",
    docs:    { en: ["No documents required for emergency admission", "Aadhaar (if available)"],
               hi: ["आपातकालीन प्रवेश के लिए कोई दस्तावेज आवश्यक नहीं", "आधार (यदि उपलब्ध हो)"] },
    match: (a) => a.state === "Delhi" && a.who === "women",
  },

  // ── ADOLESCENT GIRL WELFARE ──────────────────────────────────────────────────

  {
    id: "delhi_kishori_shakti",
    icon: "🌸", color: "#DB2777", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept. (ICDS)", hi: "दिल्ली महिला एवं बाल विकास विभाग (ICDS)" },
    name:    { en: "Kishori Shakti Yojana — Adolescent Girl Empowerment (Delhi)", hi: "किशोरी शक्ति योजना — किशोरी सशक्तिकरण (दिल्ली)" },
    benefit: { en: "Free nutrition supplementation, health check-ups, life skills training & vocational guidance for adolescent girls aged 11–18 through Anganwadi centres", hi: "आंगनवाड़ी केंद्रों के माध्यम से 11–18 वर्ष की किशोरियों को मुफ्त पोषण पूरक, स्वास्थ्य जांच, जीवन कौशल प्रशिक्षण व व्यावसायिक मार्गदर्शन" },
    tag:     { en: "Girl Child", hi: "बालिका कल्याण" },
    annual: 3000,
    apply:   { en: "wcd.delhi.gov.in", hi: "wcd.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (11–18 years)", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "आयु प्रमाण (11–18 वर्ष)", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && a.age === "below18",
  },

  // ── FOOD SECURITY (PDS) ──────────────────────────────────────────────────────

  {
    id: "delhi_nfsa_pds",
    icon: "🌾", color: "#15803D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Food & Civil Supplies Dept. (NFSA)", hi: "दिल्ली खाद्य एवं नागरिक आपूर्ति विभाग (NFSA)" },
    name:    { en: "NFSA Free Food Grains via PDS (Delhi)",                       hi: "NFSA — PDS द्वारा मुफ्त खाद्यान्न (दिल्ली)" },
    benefit: { en: "5 kg food grains (wheat/rice) free per person/month for PHH ration card holders; AAY families get 35 kg/month free", hi: "PHH राशन कार्ड धारकों को 5 किग्रा खाद्यान्न (गेहूं/चावल) प्रति व्यक्ति/माह मुफ्त; AAY परिवारों को 35 किग्रा/माह मुफ्त" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 6000,
    apply:   { en: "nfs.delhi.gov.in", hi: "nfs.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Ration Card (PHH / AAY)", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "दिल्ली राशन कार्ड (PHH / AAY)", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.rationCard === "phh" || a.rationCard === "bpl" || a.rationCard === "aay"),
  },

  // ── SENIOR RESIDENTIAL CARE ───────────────────────────────────────────────────

  {
    id: "delhi_old_age_home",
    icon: "🏡", color: "#1E40AF", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept.", hi: "दिल्ली समाज कल्याण विभाग" },
    name:    { en: "Varishtha Nagrik Bhavan — Free Residential Care for Elderly (Delhi)", hi: "वरिष्ठ नागरिक भवन — मुफ्त वृद्धाश्रम (दिल्ली)" },
    benefit: { en: "Free residential accommodation, meals, healthcare & recreation for destitute / homeless seniors 60+ with no family support", hi: "परिवार-विहीन / बेघर 60+ वरिष्ठ नागरिकों को मुफ्त आवास, भोजन, स्वास्थ्य देखभाल व मनोरंजन सुविधाएं" },
    tag:     { en: "Senior Welfare", hi: "वरिष्ठ नागरिक कल्याण" },
    annual: 60000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "https://edistrict.delhigovt.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "No Family / Destitute Certificate", "Delhi Address Proof (if any)", "Medical Fitness Certificate"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "परिवार रहित / निराश्रित प्रमाण पत्र", "दिल्ली पता प्रमाण (यदि हो)", "चिकित्सा प्रमाण पत्र"] },
    match: (a) => a.state === "Delhi" && (a.who === "senior" || a.age === "above60") && (a.income === "below1" || a.house === "no"),
  },

  // ── SC MERIT — PREMIER INSTITUTES ────────────────────────────────────────────

  {
    id: "delhi_sc_premier_institute_award",
    icon: "🏛️", color: "#4338CA", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept.", hi: "दिल्ली SC/ST कल्याण विभाग" },
    name:    { en: "SC Meritorious Student Award — Premier Institutes (Delhi)",   hi: "SC मेधावी छात्र पुरस्कार — प्रतिष्ठित संस्थान (दिल्ली)" },
    benefit: { en: "One-time grant of ₹10,000–₹25,000 + annual fee support for SC students admitted to IIT, IIM, AIIMS, NIT & central universities", hi: "IIT, IIM, AIIMS, NIT व केंद्रीय विश्वविद्यालयों में प्रवेश पाने वाले SC छात्रों को ₹10,000–₹25,000 एकमुश्त अनुदान + वार्षिक शुल्क सहायता" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 25000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/smstomsssfc", hi: "scstwelfare.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "IIT / IIM / AIIMS / NIT Admission Letter", "Class 12 Marksheet", "Income Certificate", "Delhi Domicile"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "IIT / IIM / AIIMS / NIT प्रवेश पत्र", "कक्षा 12 अंकतालिका", "आय प्रमाण पत्र", "दिल्ली अधिवास"] },
    keywords: ["class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "sc",
  },

  // ── DE-ADDICTION ─────────────────────────────────────────────────────────────

  {
    id: "delhi_de_addiction",
    icon: "💊", color: "#047857", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept. — Drug De-Addiction Programme", hi: "दिल्ली स्वास्थ्य विभाग — नशा मुक्ति कार्यक्रम" },
    name:    { en: "Free Drug De-Addiction & Rehabilitation Programme (Delhi)",   hi: "मुफ्त नशा मुक्ति एवं पुनर्वास कार्यक्रम (दिल्ली)" },
    benefit: { en: "Free counselling, detoxification & in-patient rehabilitation at government de-addiction centres for persons with substance use disorder", hi: "नशे की लत से पीड़ित व्यक्तियों को सरकारी नशा मुक्ति केंद्रों में मुफ्त परामर्श, डिटॉक्सिफिकेशन व इन-पेशेंट पुनर्वास" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "health.delhi.gov.in (Helpline: 011-22307145)", hi: "health.delhi.gov.in (हेल्पलाइन: 011-22307145)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof", "Doctor's Referral (if available)"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण", "चिकित्सक रेफरल (यदि उपलब्ध हो)"] },
    match: (a) => a.state === "Delhi",
  },

  // ── INFORMAL WASTE WORKER ─────────────────────────────────────────────────────

  {
    id: "delhi_ragpicker_welfare",
    icon: "♻️", color: "#16A34A", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Urban Development / MCD / Unorganised Workers Board", hi: "दिल्ली शहरी विकास / MCD / असंगठित कामगार बोर्ड" },
    name:    { en: "Rag Picker & Informal Waste Worker Welfare Scheme (Delhi)",   hi: "रैग पिकर एवं अनौपचारिक कचरा कामगार कल्याण योजना (दिल्ली)" },
    benefit: { en: "Registration, ID card, accident insurance (₹1 lakh), health check-ups & skill training for rag pickers and informal waste collectors", hi: "रैग पिकर व अनौपचारिक कचरा संग्रहकर्ताओं को पंजीकरण, पहचान पत्र, ₹1 लाख दुर्घटना बीमा, स्वास्थ्य जांच व कौशल प्रशिक्षण" },
    tag:     { en: "Labour Welfare", hi: "श्रम कल्याण" },
    annual: 5000,
    apply:   { en: "south.mcd.gov.in / labourcis.delhi.gov.in", hi: "south.mcd.gov.in / labourcis.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof", "Income Certificate (below ₹1L)", "Passport-size Photo", "Work Proof (Supervisor Reference Letter)"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण", "आय प्रमाण पत्र (₹1L से कम)", "पासपोर्ट फोटो", "कार्य प्रमाण (सुपरवाइजर संदर्भ पत्र)"] },
    match: (a) => a.state === "Delhi" && a.who === "general" && a.income === "below1",
  },

  // ── FREE SCHOOL KITS ─────────────────────────────────────────────────────────

  {
    id: "delhi_free_school_kits",
    icon: "🎒", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Directorate of Education, Delhi", hi: "शिक्षा निदेशालय, दिल्ली" },
    name:    { en: "Free School Uniform, Books & Stationery (Delhi Govt Schools)",  hi: "मुफ्त स्कूल यूनिफॉर्म, पुस्तकें एवं स्टेशनरी (दिल्ली सरकारी स्कूल)" },
    benefit: { en: "Free school uniform sets (2), shoes, school bag, textbooks & stationery for all students in Classes 1–12 in Delhi govt schools", hi: "दिल्ली सरकारी स्कूलों में कक्षा 1–12 के सभी छात्रों को 2 यूनिफॉर्म सेट, जूते, स्कूल बैग, पाठ्यपुस्तकें व स्टेशनरी मुफ्त" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 3000,
    apply:   { en: "edudel.nic.in (school-based enrollment)", hi: "edudel.nic.in (विद्यालय आधारित नामांकन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Govt School Enrollment Proof", "Parent's / Guardian's Aadhaar Card"],
               hi: ["आधार कार्ड", "दिल्ली सरकारी स्कूल नामांकन प्रमाण", "माता-पिता / अभिभावक का आधार कार्ड"] },
    match: (a) => a.state === "Delhi" && a.who === "student",
  },

  // ── FREE DIALYSIS ─────────────────────────────────────────────────────────────

  {
    id: "delhi_free_dialysis",
    icon: "🩺", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health & Family Welfare Dept.", hi: "दिल्ली स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Mukhyamantri Free Dialysis Yojana (Delhi)",                      hi: "मुख्यमंत्री मुफ्त डायलिसिस योजना (दिल्ली)" },
    benefit: { en: "Free haemodialysis sessions (3×/week) at Delhi govt hospitals for kidney failure patients from BPL / low-income families", hi: "BPL / कम आय परिवारों के किडनी फेल्योर रोगियों को दिल्ली सरकारी अस्पतालों में सप्ताह में 3 बार मुफ्त डायलिसिस" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 120000,
    apply:   { en: "health.delhi.gov.in", hi: "health.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate", "Nephrologist's Prescription / Dialysis Referral", "Delhi Address Proof", "Bank Passbook"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र", "नेफ्रोलॉजिस्ट का नुस्खा / डायलिसिस रेफरल", "दिल्ली पता प्रमाण", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── TRADITIONAL ARTISANS ──────────────────────────────────────────────────────

  {
    id: "delhi_pm_vishwakarma",
    icon: "🔨", color: "#B45309", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of MSME (implemented in Delhi via DIC)", hi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (दिल्ली में DIC द्वारा)" },
    name:    { en: "PM Vishwakarma Yojana (Delhi)",                                  hi: "PM विश्वकर्मा योजना (दिल्ली)" },
    benefit: { en: "Free skill training (5–15 days) + toolkit grant ₹15,000 + collateral-free loan ₹1–3 lakh at 5% for 18 traditional trades (blacksmith, carpenter, potter, tailor, weaver etc.)", hi: "18 परंपरागत व्यवसायों (लोहार, बढ़ई, कुम्हार, दर्जी, बुनकर आदि) को मुफ्त कौशल प्रशिक्षण + ₹15,000 टूलकिट अनुदान + ₹1–3 लाख 5% ब्याज पर ऋण" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 15000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/pmv", hi: "pmvishwakarma.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Mobile Number linked to Aadhaar", "Ration Card / Delhi Address Proof", "Proof of Trade (Self-Declaration or Reference)", "Bank Account Details"],
               hi: ["आधार कार्ड", "आधार से जुड़ा मोबाइल नंबर", "राशन कार्ड / दिल्ली पता प्रमाण", "व्यापार प्रमाण (स्व-घोषणा या संदर्भ)", "बैंक खाता विवरण"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "business") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── URBAN LIVELIHOODS (DAY-NULM) ─────────────────────────────────────────────

  {
    id: "delhi_day_nulm",
    icon: "🤝", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Urban Development Dept. (DAY-NULM / MoHUA)", hi: "दिल्ली शहरी विकास विभाग (DAY-NULM / MoHUA)" },
    name:    { en: "DAY-NULM — Urban Poor SHG & Self-Employment (Delhi)",            hi: "DAY-NULM — शहरी गरीब SHG एवं स्व-रोजगार (दिल्ली)" },
    benefit: { en: "Self-Help Group formation for urban poor women + revolving fund ₹10,000 per SHG + self-employment micro-loans up to ₹2 lakh + free skill training", hi: "शहरी गरीब महिलाओं के लिए SHG गठन + ₹10,000 रिवॉल्विंग फंड + ₹2 लाख तक स्व-रोजगार माइक्रो-लोन + मुफ्त कौशल प्रशिक्षण" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 10000,
    apply:   { en: "nulm.gov.in / urban.delhi.gov.in", hi: "nulm.gov.in / urban.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi BPL / SECC Survey Inclusion or Income Certificate", "Ration Card", "Bank Passbook (Jan Dhan preferred)", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिल्ली BPL / SECC सर्वे समावेश या आय प्रमाण पत्र", "राशन कार्ड", "बैंक पासबुक (जन धन प्राथमिक)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.who === "women" || a.who === "general") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── MINORITY GIRLS HOSTEL ─────────────────────────────────────────────────────

  {
    id: "delhi_minority_girls_hostel",
    icon: "🏫", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Minority Financial & Development Corporation (DMFC)", hi: "दिल्ली अल्पसंख्यक वित्त एवं विकास निगम (DMFC)" },
    name:    { en: "DMFC Subsidised Hostel for Minority Girl Students (Delhi)",      hi: "DMFC अल्पसंख्यक छात्राओं के लिए सब्सिडाइज्ड छात्रावास (दिल्ली)" },
    benefit: { en: "Highly subsidised hostel accommodation at ₹500–₹1,000/month for minority girl students pursuing higher education in Delhi", hi: "दिल्ली में उच्च शिक्षा प्राप्त अल्पसंख्यक छात्राओं को ₹500–₹1,000 प्रतिमाह पर अत्यधिक सब्सिडाइज्ड छात्रावास आवास" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "minorities.delhi.gov.in", hi: "minorities.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "College / University Admission Letter", "Income Certificate (below ₹6L)", "Delhi Domicile", "Passport-size Photo"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "कॉलेज / विश्वविद्यालय प्रवेश पत्र", "आय प्रमाण पत्र (₹6L से कम)", "दिल्ली अधिवास", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "minority",
  },

  // ── WINTER RELIEF ─────────────────────────────────────────────────────────────

  {
    id: "delhi_winter_relief",
    icon: "🧥", color: "#374151", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Revenue Dept. / Delhi Urban Shelter Improvement Board (DUSIB)", hi: "दिल्ली राजस्व विभाग / DUSIB" },
    name:    { en: "Delhi Winter Relief — Free Blankets & Warm Clothing Distribution",  hi: "दिल्ली शीतकालीन राहत — मुफ्त कंबल व गर्म वस्त्र वितरण" },
    benefit: { en: "Free blankets, quilts & warm clothing distributed to homeless, pavement dwellers & BPL families at night shelters and distribution camps (Nov–Feb)", hi: "नवंबर–फरवरी में रैन बसेरों व वितरण शिविरों में बेघर, फुटपाथवासी व BPL परिवारों को मुफ्त कंबल, रजाई व गर्म वस्त्र वितरण" },
    tag:     { en: "Social Welfare", hi: "सामाजिक कल्याण" },
    annual: 0,
    apply:   { en: "dusib.gov.in / nearest night shelter (walk-in)", hi: "dusib.gov.in / नजदीकी रैन बसेरा (सीधे प्रवेश)" }, applyType: "offline",
    docs:    { en: ["No documents required — distributed at night shelters and camps on walk-in basis"],
               hi: ["कोई दस्तावेज नहीं — रैन बसेरों व शिविरों में सीधे वितरण"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.house === "no"),
  },

  // ── E-RICKSHAW LOAN ───────────────────────────────────────────────────────────

  {
    id: "delhi_erickshaw_loan",
    icon: "🛺", color: "#16A34A", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept. / DSCSTFDC / Delhi EV Cell", hi: "दिल्ली परिवहन विभाग / DSCSTFDC / दिल्ली EV सेल" },
    name:    { en: "Delhi E-Rickshaw Purchase Loan & Subsidy Scheme",                hi: "दिल्ली ई-रिक्शा खरीद ऋण एवं सब्सिडी योजना" },
    benefit: { en: "Subsidised loan of ₹50,000–₹1.2 lakh at low interest for purchasing e-rickshaw; 25% additional subsidy for SC/ST, women & BPL applicants; includes free e-rickshaw training & badge", hi: "ई-रिक्शा खरीद के लिए ₹50,000–₹1.2 लाख कम ब्याज पर सब्सिडाइज्ड ऋण; SC/ST, महिला व BPL आवेदकों को 25% अतिरिक्त सब्सिडी; मुफ्त ई-रिक्शा प्रशिक्षण व बैज" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 0,
    apply:   { en: "transport.delhi.gov.in / ev.delhi.gov.in", hi: "transport.delhi.gov.in / ev.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof (3+ years)", "Driving Licence (or willingness to undergo training)", "Income Certificate (below ₹3L)", "BPL / Caste Certificate (if applicable)", "Bank Passbook"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण (3+ वर्ष)", "ड्राइविंग लाइसेंस (या प्रशिक्षण की इच्छा)", "आय प्रमाण पत्र (₹3L से कम)", "BPL / जाति प्रमाण पत्र (यदि लागू)", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && a.who === "general" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── ASSISTIVE DEVICES FOR DIVYANG ────────────────────────────────────────────

  {
    id: "delhi_divyang_assistive_devices",
    icon: "🦽", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept. / ALIMCO Empanelled Camps", hi: "दिल्ली समाज कल्याण विभाग / ALIMCO सूचीबद्ध शिविर" },
    name:    { en: "Free Assistive Devices for Persons with Disabilities (Delhi)",   hi: "दिव्यांग व्यक्तियों को मुफ्त सहायक उपकरण (दिल्ली)" },
    benefit: { en: "Free wheelchairs, crutches, tricycles, hearing aids, calipers, braille kits & prosthetic limbs for BPL / low-income persons with disability via ALIMCO camps", hi: "ALIMCO शिविरों के माध्यम से BPL / कम आय दिव्यांग व्यक्तियों को मुफ्त व्हीलचेयर, बैसाखी, ट्राइसाइकिल, श्रवण यंत्र, कैलिपर, ब्रेल किट व कृत्रिम अंग" },
    tag:     { en: "Disability", hi: "दिव्यांग कल्याण" },
    annual: 15000,
    apply:   { en: "edistrict.delhigovt.nic.in / ALIMCO camp registration", hi: "edistrict.delhigovt.nic.in / ALIMCO शिविर पंजीकरण" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "BPL / Income Certificate", "Delhi Address Proof", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+)", "BPL / आय प्रमाण पत्र", "दिल्ली पता प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── FIRST CHILD MATERNITY BENEFIT ────────────────────────────────────────────

  {
    id: "delhi_pmmvy",
    icon: "🤱", color: "#BE185D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept. / MoWCD (PMMVY)", hi: "दिल्ली महिला एवं बाल विकास विभाग / MoWCD (PMMVY)" },
    name:    { en: "PM Matru Vandana Yojana — PMMVY (Delhi)",                        hi: "प्रधानमंत्री मातृ वंदना योजना — PMMVY (दिल्ली)" },
    benefit: { en: "₹5,000 maternity benefit in 3 installments for first live birth: ₹1,000 on early pregnancy registration, ₹2,000 after first antenatal check-up, ₹2,000 after delivery & immunisation", hi: "पहले जीवित बच्चे के जन्म पर 3 किश्तों में ₹5,000 मातृत्व लाभ: ₹1,000 गर्भावस्था पंजीकरण पर, ₹2,000 पहली ANC जांच पर, ₹2,000 प्रसव व टीकाकरण पर" },
    tag:     { en: "Maternity", hi: "मातृत्व" },
    annual: 5000,
    apply:   { en: "pmmvy.nic.in / nearest Anganwadi centre", hi: "pmmvy.nic.in / नजदीकी आंगनवाड़ी केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "MCP Card (Mother & Child Protection Card)", "Bank Passbook", "Mobile Number linked to Aadhaar", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "MCP कार्ड (माता एवं शिशु संरक्षण कार्ड)", "बैंक पासबुक", "आधार से जुड़ा मोबाइल नंबर", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── EYE CARE ─────────────────────────────────────────────────────────────────

  {
    id: "delhi_free_cataract",
    icon: "👁️", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept. — National Programme for Control of Blindness", hi: "दिल्ली स्वास्थ्य विभाग — राष्ट्रीय अंधता नियंत्रण कार्यक्रम" },
    name:    { en: "Free Cataract Surgery Programme (Delhi)",                         hi: "मुफ्त मोतियाबिंद ऑपरेशन कार्यक्रम (दिल्ली)" },
    benefit: { en: "Free cataract surgery with IOL (intraocular lens) implant at Delhi govt hospitals + free post-op medicines & transport assistance for BPL / senior patients", hi: "BPL / वरिष्ठ रोगियों को दिल्ली सरकारी अस्पतालों में IOL के साथ मुफ्त मोतियाबिंद ऑपरेशन + मुफ्त दवाएं व परिवहन सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 10000,
    apply:   { en: "health.delhi.gov.in / Ophthalmology OPD at any Delhi govt hospital", hi: "health.delhi.gov.in / किसी भी दिल्ली सरकारी अस्पताल की नेत्र OPD" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate or Age Proof (60+ for senior quota)", "Ophthalmologist Referral Slip", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र या आयु प्रमाण (वरिष्ठ कोटे के लिए 60+)", "नेत्र चिकित्सक रेफरल पर्ची", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3" || a.who === "senior" || a.age === "above60"),
  },

  // ── HIV / AIDS ────────────────────────────────────────────────────────────────

  {
    id: "delhi_art_hiv",
    icon: "🎗️", color: "#DC2626", scope: "state", state: "Delhi",
    ministry: { en: "Delhi State AIDS Control Society (DSACS) / NACO", hi: "दिल्ली राज्य एड्स नियंत्रण सोसाइटी (DSACS) / NACO" },
    name:    { en: "Delhi HIV/AIDS Free ART & Care Programme",                        hi: "दिल्ली HIV/AIDS मुफ्त ART एवं देखभाल कार्यक्रम" },
    benefit: { en: "Free antiretroviral therapy (ART), CD4 / viral load testing, opportunistic infection treatment & nutrition support for all PLHIV at Delhi ART centres", hi: "दिल्ली ART केंद्रों पर सभी HIV पीड़ितों (PLHIV) को मुफ्त एंटीरेट्रोवायरल दवाएं (ART), CD4 / वायरल लोड टेस्ट, अवसरवादी संक्रमण उपचार व पोषण सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 36000,
    apply:   { en: "dsacs.in / nearest ART centre (LNJP, GTB, Safdarjung, RML)", hi: "dsacs.in / नजदीकी ART केंद्र (LNJP, GTB, सफदरजंग, RML)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "HIV Positive Confirmation Report", "Delhi Address Proof (for linkage to nearest ART centre)"],
               hi: ["आधार कार्ड", "HIV पॉजिटिव पुष्टि रिपोर्ट", "दिल्ली पता प्रमाण (नजदीकी ART केंद्र से जुड़ाव के लिए)"] },
    match: (a) => a.state === "Delhi",
  },

  // ── CONSTRUCTION WORKER CHILDREN'S EDUCATION ─────────────────────────────────

  {
    id: "delhi_bocw_children_edu",
    icon: "📗", color: "#4338CA", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Building & Other Construction Workers Welfare Board", hi: "दिल्ली भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड" },
    name:    { en: "BOCW Children's Education Scholarship (Delhi Construction Workers)",  hi: "BOCW बच्चों की शिक्षा छात्रवृत्ति (दिल्ली निर्माण कामगार)" },
    benefit: { en: "Annual scholarships of ₹3,000–₹8,000 for children of registered construction workers (Class 1 to graduation); also covers exam fees & stationery allowance", hi: "पंजीकृत निर्माण कामगारों के बच्चों को कक्षा 1 से स्नातक तक ₹3,000–₹8,000 वार्षिक छात्रवृत्ति; परीक्षा शुल्क व स्टेशनरी भत्ता भी शामिल" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 8000,
    apply:   { en: "labourcis.delhi.gov.in", hi: "labourcis.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card of Child", "Parent's BOCW Registration Certificate", "School / College Bonafide & Marksheet", "Bank Passbook of Child / Parent", "Delhi Address Proof"],
               hi: ["बच्चे का आधार कार्ड", "माता-पिता का BOCW पंजीकरण प्रमाण पत्र", "विद्यालय / महाविद्यालय बोनाफाइड व अंकतालिका", "बच्चे / माता-पिता की बैंक पासबुक", "दिल्ली पता प्रमाण"] },
    keywords: ["class10","class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── FREE SCHOOL BREAKFAST ─────────────────────────────────────────────────────

  {
    id: "delhi_free_school_breakfast",
    icon: "🍳", color: "#F59E0B", scope: "state", state: "Delhi",
    ministry: { en: "Directorate of Education — Delhi Breakfast Scheme", hi: "शिक्षा निदेशालय — दिल्ली नाश्ता योजना" },
    name:    { en: "Free Morning Breakfast in Delhi Govt Schools",                    hi: "दिल्ली सरकारी स्कूलों में मुफ्त सुबह का नाश्ता" },
    benefit: { en: "Free daily nutritious breakfast (poha, daliya, banana, bread-butter etc.) served before first period for all students in Delhi govt schools (Classes 1–12)", hi: "दिल्ली सरकारी स्कूलों (कक्षा 1–12) के सभी छात्रों को पहली कक्षा से पहले मुफ्त दैनिक पौष्टिक नाश्ता (पोहा, दलिया, केला, ब्रेड-बटर आदि)" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 1800,
    apply:   { en: "edudel.nic.in (automatic for enrolled students)", hi: "edudel.nic.in (नामांकित छात्रों के लिए स्वतः लागू)" }, applyType: "offline",
    docs:    { en: ["Delhi Govt School Enrollment — no separate application needed"],
               hi: ["दिल्ली सरकारी स्कूल नामांकन — कोई अलग आवेदन नहीं"] },
    match: (a) => a.state === "Delhi" && a.who === "student",
  },

  // ── PENSION FOR UNORGANISED WORKERS ──────────────────────────────────────────

  {
    id: "delhi_pm_sym",
    icon: "🏦", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Labour & Employment (Delhi Labour Dept.)", hi: "श्रम एवं रोजगार मंत्रालय (दिल्ली श्रम विभाग)" },
    name:    { en: "PM Shram Yogi Maandhan — PM-SYM (Delhi)",                        hi: "प्रधानमंत्री श्रम योगी मानधन — PM-SYM (दिल्ली)" },
    benefit: { en: "₹3,000/month guaranteed pension on reaching age 60; monthly contribution ₹55–₹200 matched equally by govt; for unorganised workers earning below ₹15,000/month", hi: "60 वर्ष की आयु पर ₹3,000 प्रतिमाह गारंटीड पेंशन; ₹55–₹200 प्रतिमाह अंशदान जो सरकार भी समान रूप से जमा करती है; ₹15,000/माह से कम कमाने वाले असंगठित कामगारों के लिए" },
    tag:     { en: "Pension", hi: "पेंशन" },
    annual: 36000,
    apply:   { en: "https://web.umang.gov.in/landing/department/maandhan.html", hi: "maandhan.in / नजदीकी CSC (कॉमन सर्विस सेंटर)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Mobile Number linked to Aadhaar", "Savings / Jan Dhan Bank Account", "Age Proof (18–40 years at entry)", "Income Self-Declaration (below ₹15,000/month)"],
               hi: ["आधार कार्ड", "आधार से जुड़ा मोबाइल नंबर", "बचत / जन धन बैंक खाता", "आयु प्रमाण (प्रवेश के समय 18–40 वर्ष)", "आय स्व-घोषणा (₹15,000/माह से कम)"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women") && (a.income === "below1" || a.income === "1to3") && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── SC / ST HOUSE REPAIR ──────────────────────────────────────────────────────

  {
    id: "delhi_sc_st_house_repair",
    icon: "🔧", color: "#92400E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept.", hi: "दिल्ली SC/ST कल्याण विभाग" },
    name:    { en: "SC/ST House Repair & Upgradation Grant (Delhi)",                 hi: "SC/ST आवास मरम्मत एवं उन्नयन अनुदान (दिल्ली)" },
    benefit: { en: "Financial grant of ₹50,000–₹1 lakh for repairing or upgrading kutcha / dilapidated houses owned by SC/ST families; covers roof, walls, flooring & sanitation", hi: "SC/ST परिवारों के कच्चे / जर्जर मकानों की मरम्मत या उन्नयन के लिए ₹50,000–₹1 लाख का वित्तीय अनुदान; छत, दीवार, फर्श व शौचालय शामिल" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 100000,
    apply:   { en: "scstwelfare.delhi.gov.in", hi: "scstwelfare.delhi.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SC / ST Caste Certificate", "House Ownership Proof (Patta / Lease Deed)", "BPL / Income Certificate", "Delhi Address Proof", "Photographs of Dilapidated Structure"],
               hi: ["आधार कार्ड", "SC / ST जाति प्रमाण पत्र", "घर स्वामित्व प्रमाण (पट्टा / लीज डीड)", "BPL / आय प्रमाण पत्र", "दिल्ली पता प्रमाण", "जर्जर संरचना की फोटो"] },
    match: (a) => a.state === "Delhi" && (a.caste === "sc" || a.caste === "st") && (a.house === "kutcha" || a.house === "no") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── MENTAL HEALTH ─────────────────────────────────────────────────────────────

  {
    id: "delhi_kiran_mental_health",
    icon: "🧠", color: "#0D9488", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Social Justice & Empowerment / Delhi DMHP (NHM)", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय / दिल्ली DMHP (NHM)" },
    name:    { en: "KIRAN Mental Health Helpline & Free Counselling (Delhi)",        hi: "किरण मानसिक स्वास्थ्य हेल्पलाइन एवं मुफ्त परामर्श (दिल्ली)" },
    benefit: { en: "Free 24/7 crisis support via KIRAN helpline (1800-599-0019) + free in-person counselling & psychiatric consultation at Delhi govt hospitals under DMHP", hi: "KIRAN हेल्पलाइन (1800-599-0019) पर 24/7 मुफ्त संकट सहायता + DMHP के तहत दिल्ली सरकारी अस्पतालों में मुफ्त व्यक्तिगत परामर्श व मनोचिकित्सा जांच" },
    tag:     { en: "Mental Health", hi: "मानसिक स्वास्थ्य" },
    annual: 0,
    apply:   { en: "1800-599-0019 (toll-free, 24/7) / nearest Delhi govt hospital psychiatry OPD", hi: "1800-599-0019 (टोल-फ्री, 24/7) / नजदीकी दिल्ली सरकारी अस्पताल मनोरोग OPD" }, applyType: "offline",
    docs:    { en: ["No documents required for helpline", "Aadhaar Card (for in-person OPD registration)"],
               hi: ["हेल्पलाइन के लिए कोई दस्तावेज नहीं", "आधार कार्ड (व्यक्तिगत OPD पंजीकरण के लिए)"] },
    match: (a) => a.state === "Delhi",
  },

  // ── AFFORDABLE MEDICINES ──────────────────────────────────────────────────────

  {
    id: "delhi_jan_aushadhi",
    icon: "💊", color: "#0284C7", scope: "state", state: "Delhi",
    ministry: { en: "Pharmaceuticals & Medical Devices Bureau of India (PMBI) / Delhi Health Dept.", hi: "फार्मास्यूटिकल्स एंड मेडिकल डिवाइसेज ब्यूरो ऑफ इंडिया (PMBI) / दिल्ली स्वास्थ्य विभाग" },
    name:    { en: "PM Bharatiya Jan Aushadhi Pariyojana — Jan Aushadhi Kendra (Delhi)", hi: "प्रधानमंत्री भारतीय जन औषधि परियोजना — जन औषधि केंद्र (दिल्ली)" },
    benefit: { en: "Generic medicines, nutraceuticals & surgical consumables at 50–90% lower prices than branded equivalents at 100+ Jan Aushadhi Kendras across Delhi; no registration required", hi: "दिल्ली के 100+ जन औषधि केंद्रों पर ब्रांडेड दवाओं से 50–90% कम कीमत पर जेनेरिक दवाएं, न्यूट्रास्यूटिकल व सर्जिकल सामग्री; कोई पंजीकरण नहीं" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "janaushadhi.gov.in / nearest Jan Aushadhi Kendra (walk-in)", hi: "janaushadhi.gov.in / नजदीकी जन औषधि केंद्र (सीधे जाएं)" }, applyType: "offline",
    docs:    { en: ["Valid Doctor's Prescription (for Rx medicines only)", "No registration needed — purchase over counter"],
               hi: ["वैध डॉक्टर पर्चा (प्रिस्क्रिप्शन दवाओं के लिए)", "कोई पंजीकरण नहीं — काउंटर पर सीधे खरीद"] },
    match: (a) => a.state === "Delhi",
  },

  // ── CLEAN COOKING FUEL ────────────────────────────────────────────────────────

  {
    id: "delhi_pmuy_lpg",
    icon: "🔥", color: "#F97316", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Petroleum & Natural Gas / IOC / HPCL / BPCL Delhi Distributors", hi: "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय / IOC / HPCL / BPCL दिल्ली वितरक" },
    name:    { en: "PM Ujjwala Yojana 2.0 — Free LPG Connection for BPL Women (Delhi)", hi: "प्रधानमंत्री उज्ज्वला योजना 2.0 — BPL महिलाओं को मुफ्त LPG कनेक्शन (दिल्ली)" },
    benefit: { en: "Free LPG connection with first refill cylinder & gas stove for women from BPL / SC/ST / AAY / migrant households; subsequent cylinders at DBT-subsidised market rates", hi: "BPL / SC/ST / AAY / प्रवासी परिवारों की महिलाओं को मुफ्त LPG कनेक्शन, पहला सिलेंडर व गैस चूल्हा; आगे के सिलेंडर DBT सब्सिडी दर पर" },
    tag:     { en: "Energy", hi: "ऊर्जा" },
    annual: 1200,
    apply:   { en: "pmuy.gov.in / nearest IOC / HPCL / BPCL LPG distributor", hi: "pmuy.gov.in / नजदीकी IOC / HPCL / BPCL LPG वितरक" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card of Woman Applicant", "BPL / AAY Ration Card or Caste Certificate (SC/ST)", "Delhi Address Proof", "Bank Passbook (for DBT subsidy)", "Declaration of no existing LPG connection"],
               hi: ["महिला आवेदक का आधार कार्ड", "BPL / AAY राशन कार्ड या जाति प्रमाण पत्र (SC/ST)", "दिल्ली पता प्रमाण", "बैंक पासबुक (DBT सब्सिडी के लिए)", "कोई LPG कनेक्शन नहीं की घोषणा"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── LEGAL AID ─────────────────────────────────────────────────────────────────

  {
    id: "delhi_dslsa_legal_aid",
    icon: "⚖️", color: "#374151", scope: "state", state: "Delhi",
    ministry: { en: "Delhi State Legal Services Authority (DSLSA)", hi: "दिल्ली राज्य विधिक सेवा प्राधिकरण (DSLSA)" },
    name:    { en: "Free Legal Aid & Representation — DSLSA (Delhi)",                   hi: "मुफ्त कानूनी सहायता एवं प्रतिनिधित्व — DSLSA (दिल्ली)" },
    benefit: { en: "Free legal representation, advice, Lok Adalat & mediation for BPL persons, SC/ST, women, children, senior citizens 65+, road accident victims & persons with 40%+ disability", hi: "BPL व्यक्तियों, SC/ST, महिलाओं, बच्चों, 65+ वरिष्ठ नागरिकों, सड़क दुर्घटना पीड़ितों व 40%+ दिव्यांग व्यक्तियों को मुफ्त कानूनी प्रतिनिधित्व, परामर्श, लोक अदालत व मध्यस्थता" },
    tag:     { en: "Legal Aid", hi: "कानूनी सहायता" },
    annual: 0,
    apply:   { en: "dslsa.gov.in / NALSA Helpline: 15100 / nearest District Legal Services Authority", hi: "dslsa.gov.in / NALSA हेल्पलाइन: 15100 / नजदीकी जिला विधिक सेवा प्राधिकरण" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate or Caste / Disability / Age proof (whichever applicable)", "Delhi Address Proof", "Brief description of legal matter"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र या जाति / दिव्यांगता / आयु प्रमाण (जो लागू हो)", "दिल्ली पता प्रमाण", "कानूनी मामले का संक्षिप्त विवरण"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3" || a.caste === "sc" || a.caste === "st" || a.who === "women" || a.who === "senior" || a.age === "above60"),
  },

  // ── SC PRE-MATRIC SCHOLARSHIP ──────────────────────────────────────────────────

  {
    id: "delhi_sc_prematric",
    icon: "📝", color: "#4F46E5", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept. / Ministry of Social Justice & Empowerment", hi: "दिल्ली SC/ST कल्याण विभाग / सामाजिक न्याय एवं अधिकारिता मंत्रालय" },
    name:    { en: "SC Pre-Matric Scholarship (Classes 9–10) — Delhi",                  hi: "SC प्री-मैट्रिक छात्रवृत्ति (कक्षा 9–10) — दिल्ली" },
    benefit: { en: "₹3,500/year (day scholar) or ₹7,000/year (hosteller) for SC students in Classes 9–10 from families with income below ₹2.5 lakh; also covers maintenance allowance", hi: "₹2.5 लाख से कम आय वाले SC परिवारों के कक्षा 9–10 छात्रों को ₹3,500 (दिवा छात्र) / ₹7,000 (छात्रावासी) वार्षिक; रखरखाव भत्ता भी शामिल" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 7000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/smstomsssfc", hi: "scholarships.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "Class 8 Marksheet", "Income Certificate (below ₹2.5L)", "School Bonafide", "Bank Passbook"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "कक्षा 8 अंकतालिका", "आय प्रमाण पत्र (₹2.5L से कम)", "विद्यालय बोनाफाइड", "बैंक पासबुक"] },
    keywords: ["class10"],
    match: (a) => a.state === "Delhi" && a.who === "student" && a.caste === "sc" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── FREE SKILL TRAINING ───────────────────────────────────────────────────────

  {
    id: "delhi_pmkvy_skill",
    icon: "🛠️", color: "#D97706", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Skill & Entrepreneurship University (DSEU) / National Skill Development Corporation (NSDC)", hi: "दिल्ली कौशल एवं उद्यमिता विश्वविद्यालय (DSEU) / राष्ट्रीय कौशल विकास निगम (NSDC)" },
    name:    { en: "PMKVY / Delhi Skill Training — Free Certification (Delhi)",          hi: "PMKVY / दिल्ली कौशल प्रशिक्षण — मुफ्त प्रमाणीकरण (दिल्ली)" },
    benefit: { en: "Free short-term skill training (100–300 hours) in 200+ trades (IT, hospitality, beauty, construction, retail, healthcare etc.) with government-recognised NSQF certificate and ₹500 post-placement incentive", hi: "200+ ट्रेडों (IT, आतिथ्य, सौंदर्य, निर्माण, खुदरा, स्वास्थ्य आदि) में 100–300 घंटे का मुफ्त कौशल प्रशिक्षण, NSQF मान्यता प्राप्त सरकारी प्रमाण पत्र व ₹500 पोस्ट-प्लेसमेंट प्रोत्साहन" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 15000,
    apply:   { en: "https://www.skillindiadigital.gov.in/pmkvy-landing", hi: "dseu.ac.in / skillindia.gov.in / नजदीकी PMKVY प्रशिक्षण केंद्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Address Proof", "Class 8 / 10 Marksheet (minimum)", "Passport-size Photo", "Bank Passbook"],
               hi: ["आधार कार्ड", "दिल्ली पता प्रमाण", "कक्षा 8 / 10 अंकतालिका (न्यूनतम)", "पासपोर्ट फोटो", "बैंक पासबुक"] },
    keywords: ["class10","skill","dropout"],
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women" || a.who === "student") && (a.age === "18to35" || a.age === "below18"),
  },

  // ── BOCW MATERNITY BENEFIT ────────────────────────────────────────────────────

  {
    id: "delhi_bocw_maternity",
    icon: "🤱", color: "#9D174D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Building & Other Construction Workers Welfare Board", hi: "दिल्ली भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड" },
    name:    { en: "BOCW Maternity & Delivery Benefit (Delhi Female Construction Workers)", hi: "BOCW मातृत्व एवं प्रसव लाभ (दिल्ली महिला निर्माण कामगार)" },
    benefit: { en: "₹10,000 lump sum maternity benefit for registered female construction workers for up to 2 deliveries; ₹5,000 additional for girl child delivery; free medical check-up camp access", hi: "पंजीकृत महिला निर्माण कामगारों को 2 प्रसव तक ₹10,000 एकमुश्त मातृत्व लाभ; बालिका जन्म पर ₹5,000 अतिरिक्त; मुफ्त स्वास्थ्य जांच शिविर" },
    tag:     { en: "Maternity", hi: "मातृत्व" },
    annual: 10000,
    apply:   { en: "labourcis.delhi.gov.in / Delhi BOCW Board office", hi: "labourcis.delhi.gov.in / दिल्ली BOCW बोर्ड कार्यालय" }, applyType: "offline",
    docs:    { en: ["BOCW Registration Certificate (active, min. 1 year)", "Aadhaar Card", "Hospital Delivery Certificate", "Bank Passbook", "Delhi Address Proof"],
               hi: ["BOCW पंजीकरण प्रमाण पत्र (सक्रिय, न्यूनतम 1 वर्ष)", "आधार कार्ड", "अस्पताल प्रसव प्रमाण पत्र", "बैंक पासबुक", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && a.who === "women" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── FREE TOILET CONSTRUCTION ───────────────────────────────────────────────────

  {
    id: "delhi_sbm_ihhl",
    icon: "🚽", color: "#059669", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Urban Development Dept. / South MCD / NDMC (Swachh Bharat Mission Urban)", hi: "दिल्ली शहरी विकास विभाग / दक्षिण MCD / NDMC (स्वच्छ भारत मिशन शहरी)" },
    name:    { en: "Swachh Bharat Mission — Free Household Toilet Construction (Delhi Urban)", hi: "स्वच्छ भारत मिशन — मुफ्त घरेलू शौचालय निर्माण (दिल्ली शहरी)" },
    benefit: { en: "₹12,000 grant (central ₹10,000 + state ₹2,000) for construction of a new individual household toilet for BPL / slum households with no existing toilet in Delhi", hi: "दिल्ली में BPL / झुग्गी परिवारों के लिए नया घरेलू शौचालय निर्माण पर ₹12,000 अनुदान (केंद्र ₹10,000 + राज्य ₹2,000)" },
    tag:     { en: "Water & Sanitation", hi: "जल एवं स्वच्छता" },
    annual: 12000,
    apply:   { en: "sbmurban.org / nearest Ward Office or DUSIB office", hi: "sbmurban.org / नजदीकी वार्ड कार्यालय या DUSIB कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate or Ration Card", "Delhi Address Proof / Lease Document", "Property / House Proof (patta, allotment letter etc.)", "No Toilet Declaration", "Bank Passbook"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र या राशन कार्ड", "दिल्ली पता प्रमाण / लीज दस्तावेज", "संपत्ति / घर प्रमाण (पट्टा, आवंटन पत्र आदि)", "शौचालय नहीं होने की घोषणा", "बैंक पासबुक"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3") && (a.house === "kutcha" || a.house === "no"),
  },

  // ── LED BULB SUBSIDY ──────────────────────────────────────────────────────────

  {
    id: "delhi_ujala_led",
    icon: "💡", color: "#F59E0B", scope: "state", state: "Delhi",
    ministry: { en: "Energy Efficiency Services Ltd. (EESL) / Delhi Power Dept. (UJALA Scheme)", hi: "एनर्जी एफिशिएंसी सर्विसेज लिमिटेड (EESL) / दिल्ली ऊर्जा विभाग (उजाला योजना)" },
    name:    { en: "UJALA — Unnat Jyoti Affordable LEDs for All (Delhi)",                hi: "उजाला — सभी के लिए किफायती LED बल्ब (दिल्ली)" },
    benefit: { en: "Energy-efficient LED bulbs at ₹10–70/bulb (vs. market ₹200–400) via distribution at DISCOM offices and empanelled outlets; up to 5 bulbs per household; saves ₹1,200+/year on electricity bills", hi: "DISCOM कार्यालयों व सूचीबद्ध आउटलेट पर ₹10–70/बल्ब पर LED बल्ब (बाजार ₹200–400); प्रति घर 5 बल्ब तक; बिजली बिल में ₹1,200+ वार्षिक बचत" },
    tag:     { en: "Electricity", hi: "बिजली" },
    annual: 1200,
    apply:   { en: "ujala.gov.in / BSES / Tata Power DDL DISCOM office (in-person)", hi: "ujala.gov.in / BSES / Tata Power DDL DISCOM कार्यालय (सीधे)" }, applyType: "offline",
    docs:    { en: ["Electricity Consumer Number (for verification)", "Aadhaar Card or Voter ID"],
               hi: ["बिजली उपभोक्ता नंबर (सत्यापन के लिए)", "आधार कार्ड या मतदाता पहचान पत्र"] },
    match: (a) => a.state === "Delhi",
  },

  // ── HOUSING LOAN INTEREST SUBSIDY ─────────────────────────────────────────────

  {
    id: "delhi_pmay_clss",
    icon: "🏦", color: "#1E40AF", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Housing & Urban Affairs (PMAY-U CLSS) / Delhi NHB-linked Banks", hi: "आवास एवं शहरी मामलों के मंत्रालय (PMAY-U CLSS) / दिल्ली NHB-लिंक्ड बैंक" },
    name:    { en: "PMAY Urban — Credit-Linked Subsidy Scheme (CLSS) for EWS / LIG (Delhi)", hi: "PMAY शहरी — EWS / LIG के लिए क्रेडिट-लिंक्ड सब्सिडी योजना (CLSS) दिल्ली" },
    benefit: { en: "6.5% interest subsidy on home loans up to ₹6 lakh (EWS/LIG); NPV benefit of ~₹2.67 lakh; for first-time homebuyers in Delhi with household income up to ₹6 lakh/year", hi: "₹6 लाख तक के गृह ऋण पर 6.5% ब्याज सब्सिडी (EWS/LIG); लगभग ₹2.67 लाख NPV लाभ; ₹6 लाख/वर्ष तक आय वाले दिल्ली के पहली बार घर खरीदने वालों के लिए" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 26700,
    apply:   { en: "https://pmay-urban.gov.in/credit-linked-subsidy-scheme", hi: "pmaymis.gov.in / दिल्ली में किसी भी सूचीबद्ध बैंक या HFC" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (EWS: below ₹3L; LIG: ₹3L–₹6L p.a.)", "No Pucca House Affidavit (self or spouse)", "Delhi Domicile Proof", "Property Purchase Agreement / Sale Deed", "Bank Account Statement"],
               hi: ["आधार कार्ड", "आय प्रमाण पत्र (EWS: ₹3L से कम; LIG: ₹3L–₹6L)", "पक्का मकान नहीं होने का शपथपत्र (स्वयं या पति/पत्नी)", "दिल्ली अधिवास प्रमाण", "संपत्ति खरीद अनुबंध / विक्रय विलेख", "बैंक खाता विवरण"] },
    match: (a) => a.state === "Delhi" && (a.house === "no" || a.house === "kutcha") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── GIRL CHILD SAVINGS ────────────────────────────────────────────────────────

  {
    id: "delhi_sukanya_samriddhi",
    icon: "🌸", color: "#BE185D", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Finance — India Post / Nationalised Banks (Delhi)", hi: "वित्त मंत्रालय — इंडिया पोस्ट / राष्ट्रीयकृत बैंक (दिल्ली)" },
    name:    { en: "Sukanya Samriddhi Yojana — Girl Child Savings Account (Delhi)",     hi: "सुकन्या समृद्धि योजना — बालिका बचत खाता (दिल्ली)" },
    benefit: { en: "High-interest savings account (currently ~8.2% p.a.) for girl child (under 10 years); tax-free maturity amount for higher education or marriage at age 21; minimum deposit ₹250/year, maximum ₹1.5 lakh/year; deposits eligible for 80C tax deduction", hi: "बालिका (10 वर्ष से कम) के लिए उच्च ब्याज बचत खाता (वर्तमान ~8.2% प्रति वर्ष); उच्च शिक्षा/विवाह (21 वर्ष) पर कर-मुक्त परिपक्वता राशि; न्यूनतम ₹250/वर्ष, अधिकतम ₹1.5 लाख/वर्ष; 80C कर छूट" },
    tag:     { en: "Girl Child", hi: "बालिका कल्याण" },
    annual: 0,
    apply:   { en: "Post Office / any nationalized bank / private bank in Delhi (in-person account opening)", hi: "दिल्ली में डाकघर / कोई भी राष्ट्रीयकृत बैंक / निजी बैंक (सीधे खाता खोलें)" }, applyType: "offline",
    docs:    { en: ["Girl Child's Birth Certificate", "Parent / Guardian's Aadhaar Card", "Parent / Guardian's PAN Card", "Delhi Address Proof", "Passport-size Photo of Parent & Girl Child"],
               hi: ["बालिका का जन्म प्रमाण पत्र", "माता-पिता / अभिभावक का आधार कार्ड", "माता-पिता / अभिभावक का PAN कार्ड", "दिल्ली पता प्रमाण", "माता-पिता व बालिका की पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.age === "below18"),
  },

  // ── STREET VENDOR MICRO-CREDIT ───────────────────────────────────────────────

  {
    id: "delhi_svnidhi",
    icon: "🛒", color: "#F59E0B", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Housing & Urban Affairs — PM SVANidhi (Delhi MCD)", hi: "आवास एवं शहरी मामलों का मंत्रालय — PM SVANidhi (दिल्ली MCD)" },
    name:    { en: "PM SVANidhi — Street Vendor Micro-Credit Scheme (Delhi)",         hi: "PM SVANidhi — पथ विक्रेता माइक्रो-क्रेडिट योजना (दिल्ली)" },
    benefit: { en: "Collateral-free working capital loan ₹10,000 (1st), ₹20,000 (2nd), ₹50,000 (3rd tranche) at 7% interest; 7% interest subsidy via DBT; digital transactions rewarded up to ₹1,200/year cashback", hi: "बिना जमानत कार्यशील ऋण ₹10,000 (1st), ₹20,000 (2nd), ₹50,000 (3rd) 7% ब्याज; DBT से 7% ब्याज सब्सिडी; डिजिटल लेनदेन पर ₹1,200/वर्ष तक कैशबैक" },
    tag:     { en: "Livelihood", hi: "आजीविका" },
    annual: 10000,
    apply:   { en: "https://web.umang.gov.in/landing/scheme/detail/pm-street-vendors-atmanirbhar-nidhi-pm-svanidhi_pm-svanidhi.html", hi: "pmsvanidhi.mohua.gov.in / नजदीकी MCD / शहरी स्थानीय निकाय कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Vending Certificate / Letter of Recommendation from TVC or ULB", "Delhi Address Proof", "Bank Passbook / Jan Dhan Account", "Mobile Number linked to Aadhaar"],
               hi: ["आधार कार्ड", "विक्रय प्रमाण पत्र / TVC या ULB की सिफारिश पत्र", "दिल्ली पता प्रमाण", "बैंक पासबुक / जन धन खाता", "आधार से जुड़ा मोबाइल नंबर"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women" || a.who === "business") && (a.income === "below1" || a.income === "1to3"),
  },

  // ── LIFE INSURANCE (PMJJBY) ───────────────────────────────────────────────────

  {
    id: "delhi_pmjjby",
    icon: "🛡️", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Finance — Banks / India Post (PMJJBY Delhi)", hi: "वित्त मंत्रालय — बैंक / इंडिया पोस्ट (PMJJBY दिल्ली)" },
    name:    { en: "PM Jeevan Jyoti Bima Yojana — PMJJBY (Delhi)",                 hi: "प्रधानमंत्री जीवन ज्योति बीमा योजना — PMJJBY (दिल्ली)" },
    benefit: { en: "₹2 lakh life insurance cover for death from any cause; annual premium only ₹436 (auto-debited from bank account); for age 18–50 with a savings bank account", hi: "किसी भी कारण से मृत्यु पर ₹2 लाख जीवन बीमा; वार्षिक प्रीमियम मात्र ₹436 (बैंक खाते से स्वतः कटौती); 18–50 वर्ष के बचत खाताधारकों के लिए" },
    tag:     { en: "Insurance", hi: "बीमा" },
    annual: 200000,
    apply:   { en: "jansuraksha.gov.in / any bank / India Post branch in Delhi", hi: "jansuraksha.gov.in / दिल्ली में कोई भी बैंक / इंडिया पोस्ट शाखा" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Active Savings Bank Account", "Mobile Number linked to Aadhaar", "PMJJBY Consent-cum-Declaration Form"],
               hi: ["आधार कार्ड", "सक्रिय बचत बैंक खाता", "आधार से जुड़ा मोबाइल नंबर", "PMJJBY सहमति-सह-घोषणा फॉर्म"] },
    match: (a) => a.state === "Delhi" && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── ACCIDENT INSURANCE (PMSBY) ────────────────────────────────────────────────

  {
    id: "delhi_pmsby",
    icon: "🏥", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Finance — Banks / India Post (PMSBY Delhi)", hi: "वित्त मंत्रालय — बैंक / इंडिया पोस्ट (PMSBY दिल्ली)" },
    name:    { en: "PM Suraksha Bima Yojana — PMSBY (Delhi)",                      hi: "प्रधानमंत्री सुरक्षा बीमा योजना — PMSBY (दिल्ली)" },
    benefit: { en: "₹2 lakh accidental death & total disability cover; ₹1 lakh for partial disability; annual premium only ₹20; for age 18–70 with a savings bank account", hi: "आकस्मिक मृत्यु व पूर्ण दिव्यांगता पर ₹2 लाख; आंशिक दिव्यांगता पर ₹1 लाख; वार्षिक प्रीमियम मात्र ₹20; 18–70 वर्ष के बचत खाताधारकों के लिए" },
    tag:     { en: "Insurance", hi: "बीमा" },
    annual: 200000,
    apply:   { en: "jansuraksha.gov.in / any bank / India Post branch in Delhi", hi: "jansuraksha.gov.in / दिल्ली में कोई भी बैंक / इंडिया पोस्ट शाखा" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Active Savings Bank Account", "Mobile Number linked to Aadhaar", "PMSBY Consent-cum-Declaration Form"],
               hi: ["आधार कार्ड", "सक्रिय बचत बैंक खाता", "आधार से जुड़ा मोबाइल नंबर", "PMSBY सहमति-सह-घोषणा फॉर्म"] },
    match: (a) => a.state === "Delhi",
  },

  // ── PENSION FOR UNORGANISED SECTOR ────────────────────────────────────────────

  {
    id: "delhi_apy",
    icon: "💰", color: "#7C3AED", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Finance — PFRDA / Banks (Atal Pension Yojana Delhi)", hi: "वित्त मंत्रालय — PFRDA / बैंक (अटल पेंशन योजना दिल्ली)" },
    name:    { en: "Atal Pension Yojana — APY (Delhi Unorganised Workers)",            hi: "अटल पेंशन योजना — APY (दिल्ली असंगठित कामगार)" },
    benefit: { en: "Guaranteed monthly pension of ₹1,000–₹5,000 after age 60; government co-contributes 50% of premium (up to ₹1,000/year) for 5 years for eligible subscribers; spouse also covered on subscriber's death", hi: "60 वर्ष के बाद ₹1,000–₹5,000 मासिक गारंटीड पेंशन; पात्र सदस्यों को 5 वर्ष तक 50% प्रीमियम (अधिकतम ₹1,000/वर्ष) सरकार देती है; सदस्य की मृत्यु पर पति/पत्नी को भी पेंशन" },
    tag:     { en: "Pension", hi: "पेंशन" },
    annual: 12000,
    apply:   { en: "npscra.nsdl.co.in / any bank in Delhi (in-person or net banking)", hi: "npscra.nsdl.co.in / दिल्ली में कोई भी बैंक (सीधे या नेट बैंकिंग)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Active Savings Bank Account (not income-tax payer)", "Mobile Number", "Date of Birth Proof"],
               hi: ["आधार कार्ड", "सक्रिय बचत बैंक खाता (आयकर दाता नहीं)", "मोबाइल नंबर", "जन्म तिथि प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3") && (a.age === "18to35" || a.age === "35to60"),
  },

  // ── WOMEN IN DISTRESS (ONE-STOP CENTRE) ──────────────────────────────────────

  {
    id: "delhi_sakhi_centre",
    icon: "🤲", color: "#9D174D", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Women & Child Development Dept. (Sakhi One-Stop Centre / 181 Helpline)", hi: "दिल्ली महिला एवं बाल विकास विभाग (सखी वन-स्टॉप सेंटर / 181 हेल्पलाइन)" },
    name:    { en: "Sakhi One-Stop Centre & Mahila Helpline 181 (Delhi)",              hi: "सखी वन-स्टॉप सेंटर एवं महिला हेल्पलाइन 181 (दिल्ली)" },
    benefit: { en: "Free 24/7 crisis support via helpline 181; in-person support at Sakhi Centres — emergency shelter (5 days), medical aid, police facilitation, psychosocial counselling, legal aid & video-conferencing with court for women facing violence, trafficking or distress", hi: "हेल्पलाइन 181 पर 24/7 मुफ्त संकट सहायता; सखी केंद्रों पर — हिंसा, तस्करी या संकट में फंसी महिलाओं को 5 दिन आपातकालीन आश्रय, चिकित्सा, पुलिस सहायता, मनोसामाजिक परामर्श, कानूनी सहायता व वीडियो कोर्ट सुविधा" },
    tag:     { en: "Women Welfare", hi: "महिला कल्याण" },
    annual: 0,
    apply:   { en: "Call 181 (toll-free, 24/7) / wcd.delhi.gov.in / nearest Sakhi One-Stop Centre", hi: "181 (टोल-फ्री, 24/7) पर कॉल करें / wcd.delhi.gov.in / नजदीकी सखी वन-स्टॉप सेंटर" }, applyType: "offline",
    docs:    { en: ["No documents required for helpline or walk-in crisis support"],
               hi: ["हेल्पलाइन या सीधे आने पर कोई दस्तावेज जरूरी नहीं"] },
    match: (a) => a.state === "Delhi" && a.who === "women",
  },

  // ── BOCW CHILDREN EDUCATION SUPPORT ─────────────────────────────────────────

  {
    id: "delhi_bocw_education",
    icon: "📖", color: "#1E40AF", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Building & Other Construction Workers Welfare Board (BOCW)", hi: "दिल्ली भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड (BOCW)" },
    name:    { en: "BOCW Children Education Scholarship (Delhi Construction Workers)",  hi: "BOCW बाल शिक्षा छात्रवृत्ति (दिल्ली निर्माण कामगार)" },
    benefit: { en: "₹5,000–₹15,000/year scholarship for children of registered construction workers from Class 1 to graduation; ₹15,000 for professional degree courses; free stationery kit annually", hi: "पंजीकृत निर्माण कामगारों के बच्चों को कक्षा 1 से स्नातक तक ₹5,000–₹15,000 वार्षिक छात्रवृत्ति; व्यावसायिक डिग्री हेतु ₹15,000; वार्षिक मुफ्त स्टेशनरी किट" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 15000,
    apply:   { en: "labourcis.delhi.gov.in / Delhi BOCW Board office", hi: "labourcis.delhi.gov.in / दिल्ली BOCW बोर्ड कार्यालय" }, applyType: "offline",
    docs:    { en: ["Parent's BOCW Registration Certificate (active, min. 1 year)", "Aadhaar Card of Parent & Child", "School / College Enrollment / Bonafide Certificate", "Previous Year Marksheet", "Bank Passbook"],
               hi: ["माता-पिता का BOCW पंजीकरण प्रमाण पत्र (सक्रिय, न्यूनतम 1 वर्ष)", "माता-पिता व बच्चे का आधार कार्ड", "विद्यालय / महाविद्यालय नामांकन / बोनाफाइड प्रमाण पत्र", "पिछले वर्ष की अंकतालिका", "बैंक पासबुक"] },
    keywords: ["class10","class12"],
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── SENIOR CITIZEN BUS PASS ───────────────────────────────────────────────────

  {
    id: "delhi_senior_bus_pass",
    icon: "🚌", color: "#B45309", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept.", hi: "दिल्ली परिवहन विभाग" },
    name:    { en: "Free DTC Bus Travel for Senior Citizens 60+ (Delhi)",              hi: "वरिष्ठ नागरिकों (60+) के लिए मुफ्त DTC बस यात्रा (दिल्ली)" },
    benefit: { en: "Free unlimited travel on all DTC and cluster buses for Delhi residents aged 60 and above; no monthly pass required — show age proof on boarding", hi: "दिल्ली के 60 वर्ष व उससे अधिक आयु के निवासियों को सभी DTC व क्लस्टर बसों में मुफ्त असीमित यात्रा; कोई मासिक पास जरूरी नहीं — बोर्डिंग पर आयु प्रमाण दिखाएं" },
    tag:     { en: "Transport", hi: "परिवहन" },
    annual: 3600,
    apply:   { en: "transport.delhi.gov.in (no registration — direct boarding with age proof)", hi: "transport.delhi.gov.in (कोई पंजीकरण नहीं — आयु प्रमाण के साथ सीधे बोर्डिंग)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card / Voter ID / Any valid photo ID showing age 60+"],
               hi: ["आधार कार्ड / मतदाता पहचान पत्र / कोई भी वैध फोटो पहचान पत्र जिस पर आयु 60+ हो"] },
    match: (a) => a.state === "Delhi" && (a.who === "senior" || a.age === "above60"),
  },

  // ── SC/ST BUSINESS LOAN (DSCSTFDC) ───────────────────────────────────────────

  {
    id: "delhi_dscstfdc_loan",
    icon: "🏦", color: "#065F46", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST/OBC/Minority Financial Development Corporation (DSCSTFDC)", hi: "दिल्ली SC/ST/OBC/अल्पसंख्यक वित्त एवं विकास निगम (DSCSTFDC)" },
    name:    { en: "DSCSTFDC Business & Self-Employment Loan for SC/ST (Delhi)",       hi: "DSCSTFDC SC/ST व्यापार एवं स्व-रोजगार ऋण (दिल्ली)" },
    benefit: { en: "Concessional loans up to ₹15 lakh at 5–6% interest for SC/ST entrepreneurs & self-employed persons; ₹2 lakh micro-credit for SC/ST women at 4% interest; includes free entrepreneurship training at DSCSTFDC centres", hi: "SC/ST उद्यमियों व स्व-रोजगार व्यक्तियों को ₹15 लाख तक 5–6% ब्याज पर रियायती ऋण; SC/ST महिलाओं को ₹2 लाख माइक्रो-क्रेडिट 4% पर; DSCSTFDC केंद्रों पर मुफ्त उद्यमिता प्रशिक्षण" },
    tag:     { en: "Entrepreneurship", hi: "उद्यमिता" },
    annual: 0,
    apply:   { en: "dscstfdc.delhi.gov.in / DSCSTFDC head office, New Delhi", hi: "dscstfdc.delhi.gov.in / DSCSTFDC मुख्यालय, नई दिल्ली" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SC or ST Caste Certificate", "Delhi Domicile (3+ years)", "Business Plan / Self-Employment Proof", "Income Certificate", "Bank Statement (6 months)", "Passport-size Photo"],
               hi: ["आधार कार्ड", "SC या ST जाति प्रमाण पत्र", "दिल्ली अधिवास (3+ वर्ष)", "व्यवसाय योजना / स्व-रोजगार प्रमाण", "आय प्रमाण पत्र", "बैंक विवरण (6 माह)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.caste === "sc" || a.caste === "st") && (a.who === "business" || a.who === "general") && (a.income === "below1" || a.income === "1to3" || a.income === "3to6"),
  },

  // ── ASSISTIVE DEVICES FOR PERSONS WITH DISABILITY ────────────────────────────

  {
    id: "delhi_adip_assistive",
    icon: "♿", color: "#0369A1", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Social Justice & Empowerment — ADIP Scheme (Delhi ALIMCO camps)", hi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय — ADIP योजना (दिल्ली ALIMCO शिविर)" },
    name:    { en: "ADIP Scheme — Free Assistive Devices for Persons with Disability (Delhi)",  hi: "ADIP योजना — दिव्यांगजनों को मुफ्त सहायक उपकरण (दिल्ली)" },
    benefit: { en: "Free or highly subsidised assistive devices — wheelchair, tricycle, hearing aid, white cane, artificial limb (Jaipur foot), DAISY player, Braille kit — distributed at ALIMCO camps for PwD with 40%+ disability and income below ₹15,000/month", hi: "40%+ दिव्यांगता व ₹15,000/माह से कम आय वाले दिव्यांगजनों को ALIMCO शिविरों में मुफ्त / अत्यधिक सब्सिडाइज्ड उपकरण — व्हीलचेयर, ट्राइसाइकिल, श्रवण यंत्र, सफेद छड़ी, कृत्रिम अंग, ब्रेल किट" },
    tag:     { en: "Disability", hi: "दिव्यांग कल्याण" },
    annual: 16000,
    apply:   { en: "alimco.in / socialjustice.nic.in / nearest ADIP camp or DSWB office", hi: "alimco.in / socialjustice.nic.in / नजदीकी ADIP शिविर या DSWB कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ from CMO)", "Income Certificate (below ₹15,000/month)", "Age Proof", "Passport-size Photo", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (CMO से 40%+)", "आय प्रमाण पत्र (₹15,000/माह से कम)", "आयु प्रमाण", "पासपोर्ट फोटो", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi",
  },

  // ── FREE BUS PASS FOR PERSONS WITH DISABILITY ─────────────────────────────────

  {
    id: "delhi_disability_bus_pass",
    icon: "🚌", color: "#6D28D9", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Transport Dept.", hi: "दिल्ली परिवहन विभाग" },
    name:    { en: "Free DTC Bus Pass for Persons with Disability (Delhi)",              hi: "दिव्यांगजनों के लिए मुफ्त DTC बस पास (दिल्ली)" },
    benefit: { en: "Free unlimited travel on all DTC & cluster buses for persons with 40%+ disability in Delhi; one escort also travels free if disability is 80%+", hi: "दिल्ली में 40%+ दिव्यांगजनों को सभी DTC व क्लस्टर बसों में मुफ्त असीमित यात्रा; 80%+ दिव्यांगता पर एक सहायक को भी मुफ्त यात्रा" },
    tag:     { en: "Transport", hi: "परिवहन" },
    annual: 4800,
    apply:   { en: "transport.delhi.gov.in / DTC bus pass counters", hi: "transport.delhi.gov.in / DTC बस पास काउंटर" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ from CMO / DSWB)", "Delhi Address Proof", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (CMO / DSWB से 40%+)", "दिल्ली पता प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi",
  },

  // ── CHILD HELPLINE ────────────────────────────────────────────────────────────

  {
    id: "delhi_childline",
    icon: "🧒", color: "#EA580C", scope: "state", state: "Delhi",
    ministry: { en: "Ministry of Women & Child Development — CHILDLINE India Foundation (Delhi)", hi: "महिला एवं बाल विकास मंत्रालय — CHILDLINE इंडिया फाउंडेशन (दिल्ली)" },
    name:    { en: "CHILDLINE 1098 — 24/7 Child Helpline (Delhi)",                     hi: "CHILDLINE 1098 — 24/7 बाल हेल्पलाइन (दिल्ली)" },
    benefit: { en: "Free 24/7 emergency helpline (call 1098) for children in distress — rescue from abuse, trafficking, missing children, child labour, street children; immediate shelter, medical care, legal aid & rehabilitation", hi: "संकट में बच्चों के लिए 1098 पर मुफ्त 24/7 आपातकालीन हेल्पलाइन — दुर्व्यवहार, तस्करी, लापता बच्चे, बाल श्रम, सड़क बच्चे; तत्काल आश्रय, चिकित्सा, कानूनी सहायता व पुनर्वास" },
    tag:     { en: "Child Welfare", hi: "बाल कल्याण" },
    annual: 0,
    apply:   { en: "Call 1098 (toll-free, 24/7) — no registration needed", hi: "1098 (टोल-फ्री, 24/7) पर कॉल करें — कोई पंजीकरण नहीं" }, applyType: "offline",
    docs:    { en: ["No documents required — call 1098 directly"],
               hi: ["कोई दस्तावेज नहीं — सीधे 1098 पर कॉल करें"] },
    match: (a) => a.state === "Delhi" && (a.who === "student" || a.age === "below18"),
  },

  // ── FREE MID-DAY MEAL ─────────────────────────────────────────────────────────

  {
    id: "delhi_pm_poshan",
    icon: "🍱", color: "#16A34A", scope: "state", state: "Delhi",
    ministry: { en: "Directorate of Education, Delhi (PM POSHAN — erstwhile Mid-Day Meal)", hi: "शिक्षा निदेशालय, दिल्ली (PM POSHAN — पूर्व मध्याह्न भोजन योजना)" },
    name:    { en: "PM POSHAN — Free Hot Cooked Mid-Day Meal (Delhi Govt Schools)",    hi: "PM POSHAN — मुफ्त गर्म पका भोजन (दिल्ली सरकारी स्कूल)" },
    benefit: { en: "Free nutritious hot cooked meal every school day for all students in Classes 1–8 in government schools; calorie & protein norms set by Centre; includes egg/fruit supplement in Delhi", hi: "सरकारी स्कूलों में कक्षा 1–8 के सभी छात्रों को हर स्कूली दिन मुफ्त पौष्टिक गर्म भोजन; दिल्ली में अंडा/फल पूरक भी शामिल" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 2400,
    apply:   { en: "edudel.nic.in (automatic for enrolled students — no separate application)", hi: "edudel.nic.in (नामांकित छात्रों को स्वतः — अलग आवेदन नहीं)" }, applyType: "offline",
    docs:    { en: ["Delhi Govt School Enrollment Proof (automatic benefit — no separate application needed)"],
               hi: ["दिल्ली सरकारी स्कूल नामांकन प्रमाण (स्वतः लाभ — अलग आवेदन नहीं)"] },
    match: (a) => a.state === "Delhi" && a.who === "student" && (a.educationLevel === "class1to8"),
  },

  // ── FREE EYE CARE & SPECTACLES ────────────────────────────────────────────────

  {
    id: "delhi_free_eye_care",
    icon: "👁️", color: "#0891B2", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept. — National Programme for Control of Blindness (NPCB)", hi: "दिल्ली स्वास्थ्य विभाग — राष्ट्रीय अंधत्व नियंत्रण कार्यक्रम (NPCB)" },
    name:    { en: "Free Eye Check-up, Cataract Surgery & Spectacles (Delhi — NPCB)",  hi: "मुफ्त आंख जांच, मोतियाबिंद ऑपरेशन एवं चश्मा (दिल्ली — NPCB)" },
    benefit: { en: "Free eye screening & spectacles for school children and BPL adults; free cataract surgery at empanelled hospitals; free low-vision aids; held at Delhi govt hospitals and mobile eye camps across the city", hi: "स्कूली बच्चों व BPL वयस्कों को मुफ्त आंख जांच व चश्मा; सूचीबद्ध अस्पतालों में मुफ्त मोतियाबिंद ऑपरेशन; मुफ्त लो-विजन सहायक उपकरण; दिल्ली सरकारी अस्पतालों व मोबाइल नेत्र शिविरों में" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 3000,
    apply:   { en: "health.delhi.gov.in / nearest Delhi govt hospital eye OPD or mobile camp", hi: "health.delhi.gov.in / नजदीकी दिल्ली सरकारी अस्पताल नेत्र OPD या मोबाइल शिविर" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Income Certificate (for adults)", "School ID (for children)", "Delhi Address Proof"],
               hi: ["आधार कार्ड", "BPL / आय प्रमाण पत्र (वयस्कों के लिए)", "स्कूल पहचान पत्र (बच्चों के लिए)", "दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3" || a.who === "student"),
  },

  // ── FREE CANCER TREATMENT ─────────────────────────────────────────────────────

  {
    id: "delhi_free_cancer_treatment",
    icon: "🏨", color: "#047857", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept. — Delhi State Cancer Institute (DSCI) & Rajiv Gandhi Cancer Institute", hi: "दिल्ली स्वास्थ्य विभाग — दिल्ली राज्य कैंसर संस्थान (DSCI) व राजीव गांधी कैंसर संस्थान" },
    name:    { en: "Free Cancer Diagnosis, Chemotherapy & Surgery — DSCI (Delhi)",     hi: "मुफ्त कैंसर निदान, कीमोथेरेपी एवं सर्जरी — DSCI (दिल्ली)" },
    benefit: { en: "Free cancer diagnosis (biopsy, PET-CT, MRI), chemotherapy, radiation therapy & surgery at Delhi State Cancer Institute (Dilshad Garden) and LNJP / GTB / Safdarjung hospitals for BPL & EWS patients", hi: "BPL व EWS मरीजों को दिल्ली राज्य कैंसर संस्थान (दिलशाद गार्डन) व LNJP / GTB / सफदरजंग अस्पतालों में मुफ्त कैंसर निदान, कीमोथेरेपी, रेडियोथेरेपी व सर्जरी" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 200000,
    apply:   { en: "dsci.nic.in / LNJP Hospital, Delhi (OPD walk-in with referral)", hi: "dsci.nic.in / LNJP अस्पताल, दिल्ली (रेफरल के साथ OPD में सीधे)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Delhi Address Proof", "Oncologist Referral or Biopsy Report", "Previous treatment records (if any)"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण पत्र", "दिल्ली पता प्रमाण", "ऑन्कोलॉजिस्ट रेफरल या बायोप्सी रिपोर्ट", "पिछले उपचार का रिकॉर्ड (यदि हो)"] },
    match: (a) => a.state === "Delhi" && (a.income === "below1" || a.income === "1to3"),
  },

  // ── SC HOUSE RENOVATION ────────────────────────────────────────────────────────

  {
    id: "delhi_ambedkar_awas",
    icon: "🏠", color: "#1D4ED8", scope: "state", state: "Delhi",
    ministry: { en: "Delhi SC/ST Welfare Dept. (Ambedkar Awas Navinikaran Yojana)", hi: "दिल्ली SC/ST कल्याण विभाग (अम्बेडकर आवास नवीनीकरण योजना)" },
    name:    { en: "Ambedkar Awas Navinikaran Yojana — SC House Renovation Grant (Delhi)", hi: "अम्बेडकर आवास नवीनीकरण योजना — SC घर मरम्मत अनुदान (दिल्ली)" },
    benefit: { en: "One-time grant of ₹80,000 for renovation, repair or extension of a dilapidated pucca / semi-pucca house for SC BPL families residing in Delhi for 3+ years", hi: "3+ वर्षों से दिल्ली में रह रहे SC BPL परिवारों के जीर्ण-शीर्ण पक्के / अर्ध-पक्के मकान की मरम्मत, नवीनीकरण या विस्तार के लिए ₹80,000 एकमुश्त अनुदान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 80000,
    apply:   { en: "https://web.umang.gov.in/landing/scheme/detail/dr-br-ambedkar-awas-navinikarn-yojna_braany.html", hi: "https://web.umang.gov.in/landing/scheme/detail/dr-br-ambedkar-awas-navinikarn-yojna_braany.html" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "BPL / Income Certificate (below ₹1L p.a.)", "Delhi Domicile (3+ years)", "House Ownership Proof / Lease Document", "Bank Passbook", "Passport-size Photo"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "BPL / आय प्रमाण पत्र (₹1L प्रति वर्ष से कम)", "दिल्ली अधिवास (3+ वर्ष)", "घर स्वामित्व प्रमाण / लीज दस्तावेज", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && a.caste === "sc" && (a.income === "below1") && (a.house === "kutcha" || a.house === "no"),
  },

  // ── NATIONAL FAMILY BENEFIT SCHEME ────────────────────────────────────────────

  {
    id: "delhi_nfbs",
    icon: "🤝", color: "#374151", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Social Welfare Dept. (National Family Benefit Scheme — NFBS)", hi: "दिल्ली समाज कल्याण विभाग (राष्ट्रीय परिवार लाभ योजना — NFBS)" },
    name:    { en: "National Family Benefit Scheme — NFBS (Delhi)",                    hi: "राष्ट्रीय परिवार लाभ योजना — NFBS (दिल्ली)" },
    benefit: { en: "One-time ₹20,000 lump-sum assistance to BPL families upon death of the primary breadwinner (age 18–59) due to any cause — natural or accidental", hi: "किसी भी कारण से (प्राकृतिक या आकस्मिक) 18–59 वर्ष के मुख्य कमाऊ सदस्य की मृत्यु पर BPL परिवारों को ₹20,000 एकमुश्त सहायता" },
    tag:     { en: "Social Welfare", hi: "सामाजिक कल्याण" },
    annual: 20000,
    apply:   { en: "https://edistrict.delhigovt.nic.in", hi: "edistrict.delhigovt.nic.in / दिल्ली समाज कल्याण विभाग कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card of Applicant", "Death Certificate of Breadwinner", "BPL / Income Certificate", "Age Proof of Deceased (18–59)", "Delhi Address Proof (3+ years)", "Bank Passbook", "Relationship Proof"],
               hi: ["आवेदक का आधार कार्ड", "कमाऊ सदस्य का मृत्यु प्रमाण पत्र", "BPL / आय प्रमाण पत्र", "मृतक का आयु प्रमाण (18–59)", "दिल्ली पता प्रमाण (3+ वर्ष)", "बैंक पासबुक", "संबंध प्रमाण"] },
    match: (a) => a.state === "Delhi" && a.income === "below1",
  },

  // ── SPORTS EXCELLENCE ─────────────────────────────────────────────────────────

  {
    id: "delhi_sports_excellence",
    icon: "🏅", color: "#DC2626", scope: "state", state: "Delhi",
    ministry: { en: "Directorate of Sports, Delhi / Delhi Sports University", hi: "खेल निदेशालय, दिल्ली / दिल्ली खेल विश्वविद्यालय" },
    name:    { en: "Delhi Sports Excellence Scheme — Stipend & Free Coaching for Athletes", hi: "दिल्ली खेल उत्कृष्टता योजना — एथलीटों के लिए वजीफा एवं मुफ्त कोचिंग" },
    benefit: { en: "Monthly stipend ₹5,000–₹15,000 + free professional coaching + free sports kit + free hostel for selected Delhi athletes in 30+ disciplines; additional cash awards for national & international medals (₹25,000–₹5 lakh)", hi: "30+ खेल विधाओं में चयनित दिल्ली एथलीटों को ₹5,000–₹15,000 मासिक वजीफा + मुफ्त कोचिंग + मुफ्त किट + मुफ्त छात्रावास; राष्ट्रीय व अंतरराष्ट्रीय पदक पर ₹25,000–₹5 लाख नकद पुरस्कार" },
    tag:     { en: "Sports", hi: "खेल" },
    annual: 60000,
    apply:   { en: "https://www.edudel.nic.in/mis/misadmin/SportBranchCircular.aspx", hi: "dssportsindia.com / दिल्ली खेल विश्वविद्यालय पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Delhi Domicile Certificate", "Age Proof", "Sport Achievement Certificate (district/state/national level)", "School / College Enrollment Proof", "Passport-size Photo"],
               hi: ["आधार कार्ड", "दिल्ली अधिवास प्रमाण पत्र", "आयु प्रमाण", "खेल उपलब्धि प्रमाण पत्र (जिला/राज्य/राष्ट्रीय स्तर)", "विद्यालय / महाविद्यालय नामांकन प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Delhi" && (a.age === "below18" || a.age === "18to35") && (a.who === "student" || a.who === "general"),
  },

  // ── BOCW MEDICAL ASSISTANCE ───────────────────────────────────────────────────

  {
    id: "delhi_bocw_medical",
    icon: "🩺", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Building & Other Construction Workers Welfare Board (BOCW)", hi: "दिल्ली भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड (BOCW)" },
    name:    { en: "BOCW Medical Assistance & Accident Relief (Delhi Construction Workers)", hi: "BOCW चिकित्सा सहायता एवं दुर्घटना राहत (दिल्ली निर्माण कामगार)" },
    benefit: { en: "Medical reimbursement ₹3,000–₹15,000/year for registered construction workers; ₹1 lakh accident relief for serious injuries; ₹50,000 ex-gratia on accidental death; funeral grant ₹5,000; free health check-up camps", hi: "पंजीकृत निर्माण कामगारों को ₹3,000–₹15,000 वार्षिक चिकित्सा प्रतिपूर्ति; गंभीर चोट पर ₹1 लाख दुर्घटना राहत; आकस्मिक मृत्यु पर ₹50,000 अनुग्रह राशि; ₹5,000 अंत्येष्टि अनुदान; मुफ्त स्वास्थ्य जांच शिविर" },
    tag:     { en: "Labour Welfare", hi: "श्रम कल्याण" },
    annual: 15000,
    apply:   { en: "labourcis.delhi.gov.in / Delhi BOCW Board office, Patparganj", hi: "labourcis.delhi.gov.in / दिल्ली BOCW बोर्ड कार्यालय, पटपड़गंज" }, applyType: "offline",
    docs:    { en: ["BOCW Registration Certificate (active, min. 90 days)", "Aadhaar Card", "Hospital Bills / Discharge Summary", "Delhi Address Proof", "Bank Passbook", "Accident FIR (for accident claims)"],
               hi: ["BOCW पंजीकरण प्रमाण पत्र (सक्रिय, न्यूनतम 90 दिन)", "आधार कार्ड", "अस्पताल बिल / डिस्चार्ज सारांश", "दिल्ली पता प्रमाण", "बैंक पासबुक", "दुर्घटना FIR (दुर्घटना दावे के लिए)"] },
    match: (a) => a.state === "Delhi" && (a.who === "general" || a.who === "women") && (a.income === "below1" || a.income === "1to3"),
  },

  // ADD MORE DELHI SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "delhi_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Delhi",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Delhi",
  // },

];
