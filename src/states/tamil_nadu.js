// ═══════════════════════════════════════════════════════════════════════════════
// tamil_nadu.js  —  Tamil Nadu State Schemes for YojanaSahay
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "tn_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ═══════════════════════════════════════════════════════════════════════════════

export const TAMIL_NADU_SCHEMES = [

  // ── 1. Pudhumai Penn (Girl Student Monthly Stipend) ────────────────────────
  {
    id: "tn_pudhumai_penn",
    icon: "📚", color: "#B45309", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu School Education Dept.", hi: "तमिलनाडु स्कूल शिक्षा विभाग" },
    name:    { en: "Pudhumai Penn Scheme (TN)",                    hi: "पुधुमई पेन योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month stipend for girl students Std 6–12", hi: "कक्षा 6–12 की छात्राओं को ₹1,000/माह" },
    tag:     { en: "Girl Student",  hi: "छात्रा" },
    annual:  12000,
    apply:   { en: "pudumaipenn.tn.gov.in", hi: "pudumaipenn.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "School Enrollment Certificate", "Bank Account (girl's name)"],
               hi: ["आधार कार्ड", "स्कूल नामांकन प्रमाण पत्र", "बैंक खाता (छात्रा के नाम पर)"] },
    // Eligibility: TN girl student in Std 6-12 in govt school
    match: (a) => a.state === "Tamil Nadu" && a.who === "student",
  },

  // ── 2. Kalaignar Magalir Urimai Thittam (Women's Rights Scheme) ───────────
  {
    id: "tn_magalir_urimai",
    icon: "👩", color: "#9D174D", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Dept. of Social Welfare & Women's Rights", hi: "सामाजिक कल्याण और महिला अधिकार विभाग" },
    name:    { en: "Kalaignar Magalir Urimai Thittam (TN)",    hi: "कलैगनार मगलिर उरिमई थिट्टम (तमिलनाडु)" },
    benefit: { en: "₹1,000/month direct cash transfer to women heads of household", hi: "परिवार की महिला मुखिया को ₹1,000/माह प्रत्यक्ष नकद" },
    tag:     { en: "Women", hi: "महिला" },
    annual:  12000,
    apply:   { en: "magalurimai.tn.gov.in", hi: "magalurimai.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Bank Account", "Income Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड", "बैंक खाता", "आय प्रमाण पत्र"] },
    // Eligibility: TN women (18–60), income below ₹3 lakh
    match: (a) => a.state === "Tamil Nadu" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ── 3. Chief Minister's Breakfast Scheme (Students) ───────────────────────
  {
    id: "tn_cm_breakfast",
    icon: "🍱", color: "#065F46", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu School Education Dept.", hi: "तमिलनाडु स्कूल शिक्षा विभाग" },
    name:    { en: "Chief Minister's Breakfast Scheme (TN)",    hi: "मुख्यमंत्री नाश्ता योजना (तमिलनाडु)" },
    benefit: { en: "Free nutritious breakfast for Std 1–5 govt school students daily", hi: "Std 1–5 के सरकारी स्कूल छात्रों को प्रतिदिन निःशुल्क नाश्ता" },
    tag:     { en: "Student Nutrition", hi: "छात्र पोषण" },
    annual:  0,
    apply:   { en: "Automatic enrollment via school", hi: "स्कूल के माध्यम से स्वतः नामांकन" }, applyType: "offline",
    docs:    { en: ["School Enrollment (no separate application needed)"],
               hi: ["स्कूल नामांकन (अलग आवेदन आवश्यक नहीं)"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student" && a.age === "below18",
  },

  // ── 4. Tamil Nadu Chief Minister's Comprehensive Health Insurance ──────────
  {
    id: "tn_chief_minister_health",
    icon: "🏥", color: "#1E40AF", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Health & Family Welfare Dept.", hi: "तमिलनाडु स्वास्थ्य और परिवार कल्याण विभाग" },
    name:    { en: "CM Comprehensive Health Insurance Scheme (TN)", hi: "मुख्यमंत्री व्यापक स्वास्थ्य बीमा योजना (तमिलनाडु)" },
    benefit: { en: "₹5 Lakh/year free treatment for 1,370+ procedures at govt & pvt hospitals", hi: "सरकारी व निजी अस्पतालों में 1,370+ प्रक्रियाओं के लिए ₹5 लाख/वर्ष मुफ्त इलाज" },
    tag:     { en: "Health Insurance", hi: "स्वास्थ्य बीमा" },
    annual:  500000,
    apply:   { en: "cmchistn.com", hi: "cmchistn.com" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card (Kith & Kin Card)", "Income Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड (किथ एंड किन कार्ड)", "आय प्रमाण पत्र"] },
    // Eligibility: TN residents with annual income ≤ ₹72,000 (below1 bracket)
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 5. Tamil Nadu Farmers' Relief Fund (Uzhavar Pathukappu) ───────────────
  {
    id: "tn_uzhavar_pathukappu",
    icon: "🌾", color: "#166534", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Agriculture Dept.", hi: "तमिलनाडु कृषि विभाग" },
    name:    { en: "Uzhavar Pathukappu (Farmer Relief Fund, TN)", hi: "उझवर पाथुकाप्पु (किसान राहत कोष, तमिलनाडु)" },
    benefit: { en: "₹3,000–₹20,000 relief per acre for crop loss due to natural calamity", hi: "प्राकृतिक आपदा से फसल हानि पर प्रति एकड़ ₹3,000–₹20,000 राहत" },
    tag:     { en: "Farmer Relief", hi: "किसान राहत" },
    annual:  20000,
    apply:   { en: "agri.tn.gov.in", hi: "agri.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Patta / Land Record (Chitta)", "Bank Account", "Crop Loss Certificate from VAO"],
               hi: ["आधार कार्ड", "पट्टा / भूमि रिकॉर्ड", "बैंक खाता", "VAO से फसल हानि प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "farmer",
  },

  // ── 6. Moovalur Ramamirtham Ammaiyar Scholarship (Higher Education) ────────
  {
    id: "tn_moovalur_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Adi Dravidar & Tribal Welfare Dept.", hi: "तमिलनाडु आदि द्रविड़ एवं जनजातीय कल्याण विभाग" },
    name:    { en: "Moovalur Ramamirtham Ammaiyar Scholarship (TN)", hi: "मूवलूर रामामिर्थम अम्मैयार छात्रवृत्ति (तमिलनाडु)" },
    benefit: { en: "₹1,000/month + free education for SC/ST first-generation girl students in college", hi: "कॉलेज में SC/ST प्रथम पीढ़ी की छात्राओं को ₹1,000/माह + निःशुल्क शिक्षा" },
    tag:     { en: "Girl Scholarship", hi: "छात्रा छात्रवृत्ति" },
    annual:  12000,
    apply:   { en: "tnscholarships.gov.in", hi: "tnscholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Community Certificate (SC/ST)", "Mark Sheet (Class 12)", "College Admission Letter", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST)", "कक्षा 12 मार्कशीट", "कॉलेज प्रवेश पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student" && a.age === "18to35" && ["below1", "1to3"].includes(a.income),
  },

  // ── 7. Tamil Nadu Unorganised Workers' Welfare Scheme ─────────────────────
  {
    id: "tn_unorganised_workers",
    icon: "🔨", color: "#92400E", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Labour Welfare Board", hi: "तमिलनाडु श्रम कल्याण बोर्ड" },
    name:    { en: "Unorganised Workers' Welfare Scheme (TN)",      hi: "असंगठित श्रमिक कल्याण योजना (तमिलनाडु)" },
    benefit: { en: "₹3,000–₹10,000 assistance for death, disability, marriage & education of workers", hi: "मृत्यु, विकलांगता, विवाह और शिक्षा के लिए ₹3,000–₹10,000 सहायता" },
    tag:     { en: "Worker Welfare", hi: "श्रमिक कल्याण" },
    annual:  10000,
    apply:   { en: "tnlabour.gov.in", hi: "tnlabour.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Labour Card / Worker Registration", "Bank Account", "Application Form"],
               hi: ["आधार कार्ड", "श्रमिक कार्ड / पंजीकरण", "बैंक खाता", "आवेदन पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "general" && ["below1", "1to3"].includes(a.income),
  },

  // ── 8. Anaithu Grama Anna Marumalarchi Scheme (Rural Road & Infrastructure) ─
  {
    id: "tn_anna_marumalarchi",
    icon: "🛣️", color: "#374151", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Rural Development Dept.", hi: "तमिलनाडु ग्रामीण विकास विभाग" },
    name:    { en: "Anaithu Grama Anna Marumalarchi Thittam (TN)",  hi: "अनैत्थु ग्राम अन्ना मरुमलार्ची थिट्टम (तमिलनाडु)" },
    benefit: { en: "Village-level road, drain, and infrastructure development; employment & wages for rural workers", hi: "गांव स्तर पर सड़क, नाली और बुनियादी ढांचा विकास; ग्रामीण श्रमिकों को रोजगार व मजदूरी" },
    tag:     { en: "Rural Development", hi: "ग्रामीण विकास" },
    annual:  0,
    apply:   { en: "tnrd.gov.in", hi: "tnrd.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Job Card (MGNREGS)", "Residence Proof"],
               hi: ["आधार कार्ड", "जॉब कार्ड (मनरेगा)", "निवास प्रमाण"] },
    match: (a) => a.state === "Tamil Nadu" && a.area === "rural",
  },

  // ── 9. Kalaignar Kanakku Thittam (Free Bus Pass for Women) ────────────────
  {
    id: "tn_free_bus_pass",
    icon: "🚌", color: "#0369A1", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Transport Dept.", hi: "तमिलनाडु परिवहन विभाग" },
    name:    { en: "Free Bus Travel for Women (TN)",               hi: "महिलाओं के लिए निःशुल्क बस यात्रा (तमिलनाडु)" },
    benefit: { en: "Free travel on all Tamil Nadu State Transport Corporation (TNSTC) buses for women", hi: "सभी TNSTC बसों में महिलाओं को निःशुल्क यात्रा" },
    tag:     { en: "Women Transport", hi: "महिला परिवहन" },
    annual:  0,
    apply:   { en: "No application needed — board any TNSTC bus", hi: "कोई आवेदन आवश्यक नहीं — कोई भी TNSTC बस में चढ़ें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card or any Govt. ID with photo (as proof of gender)"],
               hi: ["आधार कार्ड या कोई भी सरकारी फोटो पहचान पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "women",
  },

  // ── 10. Tamil Nadu Chief Minister's Solar Powered Green House Scheme ───────
  {
    id: "tn_solar_green_house",
    icon: "☀️", color: "#D97706", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Energy Dept. / TANGEDCO", hi: "तमिलनाडु ऊर्जा विभाग / TANGEDCO" },
    name:    { en: "CM Solar Powered Green House Scheme (TN)",      hi: "मुख्यमंत्री सौर ऊर्जा हरित गृह योजना (तमिलनाडु)" },
    benefit: { en: "Subsidised rooftop solar panels (up to 3 kW) for BPL households; ₹18,000–₹54,000 subsidy", hi: "BPL परिवारों के लिए सब्सिडी पर रूफटॉप सोलर पैनल (3 kW तक); ₹18,000–₹54,000 सब्सिडी" },
    tag:     { en: "Solar Energy", hi: "सौर ऊर्जा" },
    annual:  54000,
    apply:   { en: "tangedco.gov.in", hi: "tangedco.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Electricity Bill", "Property Document / NOC"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "बिजली बिल", "संपत्ति दस्तावेज / NOC"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 11. Tamil Nadu Fishermen Welfare Scheme (Meenavar Nala Thittam) ────────
  {
    id: "tn_meenavar_nala",
    icon: "🐟", color: "#0C4A6E", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Fisheries Dept.", hi: "तमिलनाडु मत्स्य पालन विभाग" },
    name:    { en: "Meenavar Nala Thittam — Fishermen Welfare (TN)",   hi: "मीनावर नाला थिट्टम — मछुआरा कल्याण (तमिलनाडु)" },
    benefit: { en: "₹5,000 annual assistance + ₹2 Lakh accident insurance + free safety kits for fishermen", hi: "मछुआरों को ₹5,000 वार्षिक सहायता + ₹2 लाख दुर्घटना बीमा + निःशुल्क सुरक्षा किट" },
    tag:     { en: "Fishermen Welfare", hi: "मछुआरा कल्याण" },
    annual:  5000,
    apply:   { en: "fisheries.tn.gov.in", hi: "fisheries.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Fisherman Identity Card", "Bank Account", "Boat Registration Certificate"],
               hi: ["आधार कार्ड", "मछुआरा पहचान पत्र", "बैंक खाता", "नाव पंजीकरण प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "general" && a.area !== "urban",
  },

  // ── 12. Differently Abled Welfare Scheme (Mazhalaiyar Nala Thittam) ────────
  {
    id: "tn_differently_abled",
    icon: "♿", color: "#4338CA", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Differently Abled Welfare Dept.", hi: "तमिलनाडु दिव्यांग कल्याण विभाग" },
    name:    { en: "Differently Abled Welfare Scheme (TN)",            hi: "दिव्यांग कल्याण योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month pension + free assistive devices + education scholarship for persons with disability", hi: "विकलांग व्यक्तियों को ₹1,000/माह पेंशन + निःशुल्क सहायक उपकरण + शिक्षा छात्रवृत्ति" },
    tag:     { en: "Disability Welfare", hi: "दिव्यांग कल्याण" },
    annual:  12000,
    apply:   { en: "swd.tn.gov.in", hi: "swd.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ disability)", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+ विकलांगता)", "आय प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 13. Tamil Nadu Self-Help Group (SHG) Revolving Fund ───────────────────
  {
    id: "tn_shg_revolving_fund",
    icon: "🤝", color: "#BE185D", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Rural Development & Panchayat Raj Dept.", hi: "तमिलनाडु ग्रामीण विकास एवं पंचायत राज विभाग" },
    name:    { en: "Makkalai Thedi Maruthuvam SHG Revolving Fund (TN)", hi: "SHG रिवॉल्विंग फंड योजना (तमिलनाडु)" },
    benefit: { en: "₹25,000 revolving fund per SHG group + bank linkage up to ₹5 Lakh at low interest", hi: "प्रति SHG समूह ₹25,000 रिवॉल्विंग फंड + कम ब्याज पर ₹5 लाख बैंक लिंकेज" },
    tag:     { en: "Women SHG", hi: "महिला SHG" },
    annual:  25000,
    apply:   { en: "tnrd.gov.in", hi: "tnrd.gov.in" }, applyType: "offline",
    docs:    { en: ["SHG Registration Certificate", "Group Meeting Records (Passbook)", "Bank Account (SHG)", "Members' Aadhaar Cards"],
               hi: ["SHG पंजीकरण प्रमाण पत्र", "समूह बैठक रिकॉर्ड", "बैंक खाता (SHG)", "सदस्यों के आधार कार्ड"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "women",
  },

  // ── 14. Tamil Nadu Handloom Weavers Welfare Scheme ────────────────────────
  {
    id: "tn_handloom_weavers",
    icon: "🧵", color: "#7E22CE", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Handlooms & Textiles Dept.", hi: "तमिलनाडु हथकरघा और वस्त्र विभाग" },
    name:    { en: "Handloom Weavers Welfare Scheme (TN)",            hi: "हथकरघा बुनकर कल्याण योजना (तमिलनाडु)" },
    benefit: { en: "₹3,000 tool kit grant + ₹2 Lakh insurance + margin money subsidy for weavers' co-ops", hi: "बुनकरों को ₹3,000 टूल किट अनुदान + ₹2 लाख बीमा + सहकारी संस्थाओं के लिए मार्जिन मनी सब्सिडी" },
    tag:     { en: "Artisan / Weaver", hi: "कारीगर / बुनकर" },
    annual:  3000,
    apply:   { en: "handlooms.tn.gov.in", hi: "handlooms.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Weaver Identity Card / Co-op Membership", "Bank Account", "Caste Certificate (if applicable)"],
               hi: ["आधार कार्ड", "बुनकर पहचान पत्र / सहकारी सदस्यता", "बैंक खाता", "जाति प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "business" && ["below1", "1to3"].includes(a.income),
  },

  // ── 15. Chief Minister's Old Age Pension Scheme (Innuyir Kaathu Thittam) ──
  {
    id: "tn_old_age_pension",
    icon: "👴", color: "#78350F", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Social Welfare Dept.", hi: "तमिलनाडु सामाजिक कल्याण विभाग" },
    name:    { en: "CM Old Age Pension Scheme (TN)",                   hi: "मुख्यमंत्री वृद्धावस्था पेंशन योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month pension for senior citizens aged 60+ with no regular income", hi: "नियमित आय के बिना 60+ वर्ष के वरिष्ठ नागरिकों को ₹1,000/माह पेंशन" },
    tag:     { en: "Senior Pension", hi: "वरिष्ठ पेंशन" },
    annual:  12000,
    apply:   { en: "tnlc.gov.in", hi: "tnlc.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / School TC)", "Income Certificate", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / TC)", "आय प्रमाण पत्र", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "senior" && ["below1", "1to3"].includes(a.income) && a.age === "above60",
  },

  // ── 16. Tamil Nadu Housing Board — EWS / LIG Housing Scheme ───────────────
  {
    id: "tn_housing_board_ews",
    icon: "🏠", color: "#B45309", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Housing Board (TNHB)", hi: "तमिलनाडु हाउसिंग बोर्ड (TNHB)" },
    name:    { en: "TNHB EWS/LIG Housing Scheme (TN)",                hi: "TNHB EWS/LIG आवास योजना (तमिलनाडु)" },
    benefit: { en: "Subsidised flat/house allotment for EWS & LIG; ₹2–₹4 Lakh subsidy on home cost", hi: "EWS और LIG के लिए सब्सिडी पर फ्लैट/मकान; गृह मूल्य पर ₹2–₹4 लाख सब्सिडी" },
    tag:     { en: "Housing", hi: "आवास" },
    annual:  200000,
    apply:   { en: "tnhb.gov.in", hi: "tnhb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (EWS ≤ ₹3L / LIG ≤ ₹6L)", "No Property Certificate", "Bank Account", "Community Certificate"],
               hi: ["आधार कार्ड", "आय प्रमाण पत्र", "संपत्ति न होने का प्रमाण", "बैंक खाता", "जाति प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── 17. Jal Jeevan Mission Tamil Nadu (Rural Drinking Water) ──────────────
  {
    id: "tn_jal_jeevan_rural",
    icon: "💧", color: "#0369A1", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Rural Water Supply & Sanitation Dept.", hi: "तमिलनाडु ग्रामीण जल आपूर्ति एवं स्वच्छता विभाग" },
    name:    { en: "Jal Jeevan Mission — Har Ghar Jal (TN)",          hi: "जल जीवन मिशन — हर घर जल (तमिलनाडु)" },
    benefit: { en: "Free tap water connection to every rural household; target 55 litres/person/day", hi: "प्रत्येक ग्रामीण परिवार को निःशुल्क नल जल कनेक्शन; प्रति व्यक्ति 55 लीटर/दिन लक्ष्य" },
    tag:     { en: "Drinking Water", hi: "पेयजल" },
    annual:  0,
    apply:   { en: "twad.gov.in", hi: "twad.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Residence Proof", "No Existing Connection Certificate from Panchayat"],
               hi: ["आधार कार्ड", "निवास प्रमाण", "पंचायत से कनेक्शन न होने का प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.area === "rural",
  },

  // ── 18. SC/ST Free Coaching & Competitive Exam Assistance (TN) ────────────
  {
    id: "tn_scst_free_coaching",
    icon: "🖊️", color: "#1D4ED8", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Adi Dravidar & Tribal Welfare Dept.", hi: "तमिलनाडु आदि द्रविड़ एवं जनजातीय कल्याण विभाग" },
    name:    { en: "SC/ST Free Coaching for Competitive Exams (TN)",  hi: "SC/ST प्रतियोगी परीक्षा निःशुल्क कोचिंग (तमिलनाडु)" },
    benefit: { en: "Free coaching for UPSC, TNPSC, bank & other exams + ₹500/month stipend for SC/ST students", hi: "SC/ST छात्रों को UPSC, TNPSC, बैंक परीक्षाओं के लिए निःशुल्क कोचिंग + ₹500/माह स्टाइपेंड" },
    tag:     { en: "SC/ST Education", hi: "SC/ST शिक्षा" },
    annual:  6000,
    apply:   { en: "adwelfare.tn.gov.in", hi: "adwelfare.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Community Certificate (SC/ST)", "Educational Qualification Proof", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST)", "शैक्षिक योग्यता प्रमाण", "आय प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── 19. Tamil Nadu New Entrepreneur cum Enterprise Development Scheme (NEEDS)
  {
    id: "tn_needs_entrepreneur",
    icon: "🚀", color: "#059669", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Industries Dept. / TIIC", hi: "तमिलनाडु उद्योग विभाग / TIIC" },
    name:    { en: "NEEDS — New Entrepreneur Scheme (TN)",            hi: "NEEDS — नया उद्यमी योजना (तमिलनाडु)" },
    benefit: { en: "25% capital subsidy (max ₹75 Lakh) + soft loan at 3% interest for first-generation entrepreneurs", hi: "प्रथम पीढ़ी के उद्यमियों को 25% पूंजी सब्सिडी (अधिकतम ₹75 लाख) + 3% ब्याज पर सॉफ्ट लोन" },
    tag:     { en: "Entrepreneurship", hi: "उद्यमिता" },
    annual:  750000,
    apply:   { en: "tiic.org", hi: "tiic.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Certificate (Graduate/Diploma)", "Project Report", "Community Certificate (if SC/ST/OBC)", "Bank Account"],
               hi: ["आधार कार्ड", "शैक्षिक प्रमाण पत्र (स्नातक/डिप्लोमा)", "प्रोजेक्ट रिपोर्ट", "जाति प्रमाण पत्र (SC/ST/OBC)", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "business" && a.age === "18to35",
  },

  // ── 20. Tamil Nadu Drought Relief Assistance for Farmers ──────────────────
  {
    id: "tn_drought_relief",
    icon: "🌵", color: "#D97706", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Revenue & Disaster Management Dept.", hi: "तमिलनाडु राजस्व एवं आपदा प्रबंधन विभाग" },
    name:    { en: "Drought Relief Assistance for Farmers (TN)",      hi: "किसानों के लिए सूखा राहत सहायता (तमिलनाडु)" },
    benefit: { en: "₹6,800/acre relief for rain-fed crop loss + free seeds & fertilisers during declared drought", hi: "घोषित सूखे के दौरान वर्षा आधारित फसल हानि पर ₹6,800/एकड़ राहत + निःशुल्क बीज एवं उर्वरक" },
    tag:     { en: "Farmer Drought Relief", hi: "किसान सूखा राहत" },
    annual:  6800,
    apply:   { en: "tnrevenue.gov.in", hi: "tnrevenue.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Patta / Chitta (Land Record)", "Bank Account", "Revenue Inspector Certificate for Crop Loss"],
               hi: ["आधार कार्ड", "पट्टा / चिट्टा (भूमि रिकॉर्ड)", "बैंक खाता", "फसल हानि के लिए राजस्व निरीक्षक प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "farmer" && a.area !== "urban",
  },

  // ── 21. Widow Pension Scheme (Kalaignar Vidiyal Thittam) ──────────────────
  {
    id: "tn_widow_pension",
    icon: "🕊️", color: "#6B7280", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Social Welfare Dept.", hi: "तमिलनाडु सामाजिक कल्याण विभाग" },
    name:    { en: "Kalaignar Vidiyal Widow Pension Scheme (TN)",     hi: "कलैगनार विदियल विधवा पेंशन योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month pension for widows with no regular income source", hi: "नियमित आय के बिना विधवाओं को ₹1,000/माह पेंशन" },
    tag:     { en: "Widow Welfare", hi: "विधवा कल्याण" },
    annual:  12000,
    apply:   { en: "tnlc.gov.in", hi: "tnlc.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Income Certificate", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "आय प्रमाण पत्र", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ── 22. Tamil Nadu Construction Workers Welfare Board Scheme ──────────────
  {
    id: "tn_construction_workers",
    icon: "🏗️", color: "#92400E", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Construction Workers Welfare Board", hi: "तमिलनाडु निर्माण श्रमिक कल्याण बोर्ड" },
    name:    { en: "Construction Workers Welfare Scheme (TN)",        hi: "निर्माण श्रमिक कल्याण योजना (तमिलनाडु)" },
    benefit: { en: "₹3,000 tool grant + ₹3 Lakh accident insurance + ₹500/month pension after 60 for registered construction workers", hi: "पंजीकृत निर्माण श्रमिकों को ₹3,000 उपकरण अनुदान + ₹3 लाख दुर्घटना बीमा + 60 के बाद ₹500/माह पेंशन" },
    tag:     { en: "Construction Worker", hi: "निर्माण श्रमिक" },
    annual:  3000,
    apply:   { en: "tnbocw.tn.gov.in", hi: "tnbocw.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Construction Worker Registration Card (BOCW)", "90-day Work Certificate from Employer", "Bank Account"],
               hi: ["आधार कार्ड", "निर्माण श्रमिक पंजीकरण कार्ड (BOCW)", "नियोक्ता से 90 दिन कार्य प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "general" && ["below1", "1to3"].includes(a.income),
  },

  // ── 23. Tamil Nadu Street Vendors Livelihood Scheme (PM SVANidhi + State) ─
  {
    id: "tn_street_vendor",
    icon: "🛒", color: "#0F766E", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Urban Local Bodies / TNSULB", hi: "तमिलनाडु शहरी स्थानीय निकाय / TNSULB" },
    name:    { en: "Street Vendors Livelihood Support Scheme (TN)",   hi: "स्ट्रीट वेंडर आजीविका सहायता योजना (तमिलनाडु)" },
    benefit: { en: "₹10,000 working capital loan at 0% interest + vendor ID card + designated vending zones", hi: "0% ब्याज पर ₹10,000 कार्यशील पूंजी ऋण + विक्रेता पहचान पत्र + निर्धारित वेंडिंग क्षेत्र" },
    tag:     { en: "Street Vendor", hi: "स्ट्रीट वेंडर" },
    annual:  10000,
    apply:   { en: "tnulb.gov.in", hi: "tnulb.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Vendor Certificate / Vending License from ULB", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "ULB से वेंडर प्रमाण पत्र / लाइसेंस", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "business" && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── 24. Free Legal Aid Scheme — Tamil Nadu State Legal Services Authority ──
  {
    id: "tn_free_legal_aid",
    icon: "⚖️", color: "#1E3A5F", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu State Legal Services Authority (TNSLSA)", hi: "तमिलनाडु राज्य विधिक सेवा प्राधिकरण (TNSLSA)" },
    name:    { en: "Free Legal Aid Scheme — TNSLSA (TN)",              hi: "निःशुल्क कानूनी सहायता योजना — TNSLSA (तमिलनाडु)" },
    benefit: { en: "Free legal representation, counselling & court assistance for BPL, SC/ST, women & senior citizens", hi: "BPL, SC/ST, महिलाओं और वरिष्ठ नागरिकों को निःशुल्क कानूनी प्रतिनिधित्व, परामर्श और न्यायालय सहायता" },
    tag:     { en: "Legal Aid", hi: "कानूनी सहायता" },
    annual:  0,
    apply:   { en: "tnslsa.gov.in", hi: "tnslsa.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income / BPL Certificate", "Community Certificate (if SC/ST)", "Case / Legal Document Details"],
               hi: ["आधार कार्ड", "आय / BPL प्रमाण पत्र", "जाति प्रमाण पत्र (SC/ST)", "मामले / कानूनी दस्तावेज विवरण"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 25. Chief Minister's Marriage Assistance Scheme ───────────────────────
  {
    id: "tn_marriage_assistance",
    icon: "💍", color: "#BE185D", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Social Welfare Dept.", hi: "तमिलनाडु सामाजिक कल्याण विभाग" },
    name:    { en: "CM Marriage Assistance Scheme (TN)",               hi: "मुख्यमंत्री विवाह सहायता योजना (तमिलनाडु)" },
    benefit: { en: "₹50,000 cash + 8 gram gold coin for daughters of BPL/low-income families at marriage", hi: "BPL/कम आय परिवारों की बेटियों के विवाह पर ₹50,000 नकद + 8 ग्राम सोने का सिक्का" },
    tag:     { en: "Women Marriage", hi: "महिला विवाह" },
    annual:  50000,
    apply:   { en: "tnlc.gov.in", hi: "tnlc.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income / BPL Certificate", "Birth Certificate of Bride", "Community Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "आय / BPL प्रमाण पत्र", "वधू का जन्म प्रमाण पत्र", "जाति प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "women" && ["below1", "1to3"].includes(a.income) && a.age === "18to35",
  },

  // ── 26. Tamil Nadu Animal Husbandry Subsidy Scheme ────────────────────────
  {
    id: "tn_animal_husbandry",
    icon: "🐄", color: "#78350F", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Animal Husbandry, Dairying & Fisheries Dept.", hi: "तमिलनाडु पशुपालन, डेयरी एवं मत्स्य पालन विभाग" },
    name:    { en: "Animal Husbandry Subsidy Scheme (TN)",             hi: "पशुपालन सब्सिडी योजना (तमिलनाडु)" },
    benefit: { en: "50% subsidy (up to ₹50,000) for purchasing milch cattle, goats & poultry units for rural farmers", hi: "ग्रामीण किसानों के लिए दुधारू पशु, बकरी और मुर्गी पालन इकाई खरीद पर 50% सब्सिडी (अधिकतम ₹50,000)" },
    tag:     { en: "Animal Husbandry", hi: "पशुपालन" },
    annual:  50000,
    apply:   { en: "tnvfa.gov.in", hi: "tnvfa.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Patta / Land Record or Rental Agreement", "Income Certificate", "Bank Account", "Caste Certificate (if applicable)"],
               hi: ["आधार कार्ड", "पट्टा / भूमि रिकॉर्ड या किरायेदारी अनुबंध", "आय प्रमाण पत्र", "बैंक खाता", "जाति प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "farmer" && a.area !== "urban",
  },

  // ── 27. Tamil Nadu Cradle Baby Scheme (Girl Child Protection) ─────────────
  {
    id: "tn_cradle_baby",
    icon: "👶", color: "#DB2777", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Social Welfare & Women's Rights Dept.", hi: "तमिलनाडु सामाजिक कल्याण और महिला अधिकार विभाग" },
    name:    { en: "Cradle Baby / Girl Child Protection Scheme (TN)",  hi: "पालना शिशु / बालिका सुरक्षा योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month + free education up to graduation + ₹1 Lakh FD at age 18 for abandoned girl children", hi: "परित्यक्त बालिकाओं को ₹1,000/माह + स्नातक तक निःशुल्क शिक्षा + 18 वर्ष पर ₹1 लाख FD" },
    tag:     { en: "Girl Child Welfare", hi: "बालिका कल्याण" },
    annual:  12000,
    apply:   { en: "swwrh.tn.gov.in", hi: "swwrh.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Child's Aadhaar Card", "Birth Certificate", "Guardian / Adoptive Parent ID", "Income Certificate"],
               hi: ["बच्चे का आधार कार्ड", "जन्म प्रमाण पत्र", "अभिभावक / दत्तक माता-पिता का पहचान पत्र", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "women" && a.age === "below18",
  },

  // ── 28. Makkalai Thedi Maruthuvam (Doorstep Health Services) ──────────────
  {
    id: "tn_doorstep_health",
    icon: "🩺", color: "#065F46", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Health & Family Welfare Dept.", hi: "तमिलनाडु स्वास्थ्य और परिवार कल्याण विभाग" },
    name:    { en: "Makkalai Thedi Maruthuvam — Doorstep Health (TN)", hi: "मक्कलई थेदी मरुत्तुवम — घर पर स्वास्थ्य सेवाएं (तमिलनाडु)" },
    benefit: { en: "Free health screening, medicines & follow-up care delivered at home for senior, disabled & bedridden patients", hi: "वरिष्ठ, दिव्यांग और शय्याग्रस्त रोगियों के लिए घर पर निःशुल्क स्वास्थ्य जांच, दवाएं और अनुवर्ती देखभाल" },
    tag:     { en: "Doorstep Health", hi: "घर पर स्वास्थ्य" },
    annual:  0,
    apply:   { en: "health.tn.gov.in", hi: "health.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Health/Medical Records (existing conditions)", "Residence Proof"],
               hi: ["आधार कार्ड", "स्वास्थ्य / चिकित्सा रिकॉर्ड", "निवास प्रमाण"] },
    match: (a) => a.state === "Tamil Nadu" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  // ── 29. Tamil Nadu Urban Poor Housing Scheme (TNSCB) ─────────────────────
  {
    id: "tn_urban_poor_housing",
    icon: "🏘️", color: "#1D4ED8", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Slum Clearance Board (TNSCB)", hi: "तमिलनाडु स्लम क्लीयरेंस बोर्ड (TNSCB)" },
    name:    { en: "Urban Poor Housing Scheme — TNSCB (TN)",          hi: "शहरी गरीब आवास योजना — TNSCB (तमिलनाडु)" },
    benefit: { en: "Free / heavily subsidised tenement flat for slum dwellers relocated from unsafe areas in urban TN", hi: "शहरी TN में असुरक्षित क्षेत्रों से पुनर्वासित झुग्गी निवासियों के लिए निःशुल्क / अत्यधिक सब्सिडी युक्त फ्लैट" },
    tag:     { en: "Urban Housing", hi: "शहरी आवास" },
    annual:  0,
    apply:   { en: "tnscb.tn.gov.in", hi: "tnscb.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Slum Residence Proof (10+ years)", "Income Certificate", "No Other Property Certificate", "Ration Card"],
               hi: ["आधार कार्ड", "झुग्गी निवास प्रमाण (10+ वर्ष)", "आय प्रमाण पत्र", "अन्य संपत्ति न होने का प्रमाण", "राशन कार्ड"] },
    match: (a) => a.state === "Tamil Nadu" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── 30. Tamil Nadu Farmer Producer Organisation (FPO) Support Scheme ──────
  {
    id: "tn_fpo_support",
    icon: "🌱", color: "#166534", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Agriculture Dept. / TNSCARD", hi: "तमिलनाडु कृषि विभाग / TNSCARD" },
    name:    { en: "Farmer Producer Organisation (FPO) Support Scheme (TN)", hi: "किसान उत्पादक संगठन (FPO) सहायता योजना (तमिलनाडु)" },
    benefit: { en: "₹15 Lakh equity grant + ₹25 Lakh credit guarantee per FPO + market linkage & cold storage support", hi: "प्रति FPO ₹15 लाख इक्विटी अनुदान + ₹25 लाख क्रेडिट गारंटी + बाजार लिंकेज और शीत भंडारण सहायता" },
    tag:     { en: "Farmer FPO", hi: "किसान FPO" },
    annual:  1500000,
    apply:   { en: "agri.tn.gov.in", hi: "agri.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["FPO Registration Certificate (under Companies Act)", "Members' Aadhaar Cards & Land Records", "Bank Account (FPO)", "Board Resolution"],
               hi: ["FPO पंजीकरण प्रमाण पत्र (कंपनी अधिनियम के तहत)", "सदस्यों के आधार कार्ड और भूमि रिकॉर्ड", "बैंक खाता (FPO)", "बोर्ड प्रस्ताव"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "farmer",
  },


  // ════════════════ RECENTLY LAUNCHED SCHEMES (2025) ══════════════════════════

  // ── 31. Kalaignar Kanavu Illam — Rural Hut-Free Housing (Launched 2025) ────
  {
    id: "tn_kanavu_illam",
    icon: "🏡", color: "#92400E", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Rural Development & Panchayat Raj Dept.", hi: "तमिलनाडु ग्रामीण विकास एवं पंचायत राज विभाग" },
    name:    { en: "Kalaignar Kanavu Illam Scheme (TN) — 2025",       hi: "कलैगनार कनवु इल्लम योजना (तमिलनाडु) — 2025" },
    benefit: { en: "₹3.5 Lakh grant per household + cement & steel to build a 360 sq ft pucca house; target: TN hut-free by 2030", hi: "360 वर्ग फुट पक्का घर बनाने के लिए प्रति परिवार ₹3.5 लाख अनुदान + सीमेंट व स्टील; लक्ष्य: 2030 तक TN को झुग्गी मुक्त बनाना" },
    tag:     { en: "Rural Housing", hi: "ग्रामीण आवास" },
    annual:  350000,
    apply:   { en: "tnrd.gov.in", hi: "tnrd.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Residence Proof", "Voter ID", "Passport-size Photo", "No Existing House Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड", "निवास प्रमाण", "वोटर ID", "पासपोर्ट साइज फोटो", "मकान न होने का प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  // ── 32. Vetri Nichayam — Free Skill Training for Youth (Launched Aug 2025) ─
  {
    id: "tn_vetri_nichayam",
    icon: "🎯", color: "#0369A1", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Skill Development Corporation (TNSDC)", hi: "तमिलनाडु कौशल विकास निगम (TNSDC)" },
    name:    { en: "Vetri Nichayam — Free Skill Training Scheme (TN) — 2025", hi: "वेट्री निचयम — निःशुल्क कौशल प्रशिक्षण योजना (TN) — 2025" },
    benefit: { en: "Free short-term industry-ready skill training for unemployed youth aged 18–35, with job placement support", hi: "18–35 वर्ष के बेरोजगार युवाओं को निःशुल्क अल्पकालिक उद्योग-अनुकूल कौशल प्रशिक्षण, नौकरी प्लेसमेंट सहायता के साथ" },
    tag:     { en: "Youth Skill Training", hi: "युवा कौशल प्रशिक्षण" },
    annual:  0,
    apply:   { en: "tnsdc.in", hi: "tnsdc.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof", "Educational Certificate", "Residence Proof", "Passport-size Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण", "शैक्षिक प्रमाण पत्र", "निवास प्रमाण", "पासपोर्ट साइज फोटो"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student" && a.age === "18to35",
  },

  // ── 33. Gig Workers Group Insurance & E-Scooter Subsidy (Budget 2025–26) ───
  {
    id: "tn_gig_worker_insurance",
    icon: "🛵", color: "#059669", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Platform-Based Gig Workers Welfare Board", hi: "तमिलनाडु प्लेटफॉर्म-आधारित गिग वर्कर्स कल्याण बोर्ड" },
    name:    { en: "Gig Workers Group Insurance & E-Scooter Subsidy (TN) — 2025", hi: "गिग वर्कर्स समूह बीमा एवं ई-स्कूटर सब्सिडी (TN) — 2025" },
    benefit: { en: "Group insurance for accidental death & disability for 1.5 lakh gig workers + ₹20,000 e-scooter subsidy for 2,000 registered workers", hi: "1.5 लाख गिग वर्कर्स के लिए दुर्घटना मृत्यु व विकलांगता बीमा + 2,000 पंजीकृत कर्मचारियों को ₹20,000 ई-स्कूटर सब्सिडी" },
    tag:     { en: "Gig Worker Welfare", hi: "गिग वर्कर कल्याण" },
    annual:  20000,
    apply:   { en: "gigworkers.tn.gov.in", hi: "gigworkers.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Gig Worker Registration (Welfare Board)", "Platform Employment Proof (Swiggy/Zomato/Ola etc.)", "Bank Account"],
               hi: ["आधार कार्ड", "गिग वर्कर पंजीकरण (कल्याण बोर्ड)", "प्लेटफॉर्म रोजगार प्रमाण (Swiggy/Zomato/Ola आदि)", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "general" && ["below1", "1to3", "3to6"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── 34. Free Laptop / Tablet for College Students (Launched Jan 2026) ──────
  {
    id: "tn_free_laptop_2025",
    icon: "💻", color: "#1D4ED8", scope: "state", state: "Tamil Nadu",
    ministry: { en: "ELCOT / Tamil Nadu Higher Education Dept.", hi: "ELCOT / तमिलनाडु उच्च शिक्षा विभाग" },
    name:    { en: "Free Laptop / Tablet Scheme for College Students (TN) — 2025", hi: "कॉलेज छात्रों के लिए निःशुल्क लैपटॉप / टैबलेट योजना (TN) — 2025" },
    benefit: { en: "Free laptop or tablet (student's choice) with pre-installed MS Office 365 for 20 lakh govt college students over 2 years; Phase 1 launched Jan 2026", hi: "2 वर्षों में 20 लाख सरकारी कॉलेज छात्रों को MS Office 365 सहित निःशुल्क लैपटॉप या टैबलेट; चरण 1 जनवरी 2026 में शुरू" },
    tag:     { en: "Student Digital", hi: "छात्र डिजिटल" },
    annual:  0,
    apply:   { en: "Distributed via college — no separate application needed", hi: "कॉलेज के माध्यम से वितरण — अलग आवेदन आवश्यक नहीं" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "College Enrollment Proof", "Student ID Card"],
               hi: ["आधार कार्ड", "कॉलेज नामांकन प्रमाण", "छात्र पहचान पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student" && a.age === "18to35",
  },

  // ── 35. Orphan Child Monthly Stipend Scheme — ₹2,000/month (Budget 2025–26)
  {
    id: "tn_orphan_stipend",
    icon: "🧒", color: "#7C3AED", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Social Welfare Dept.", hi: "तमिलनाडु सामाजिक कल्याण विभाग" },
    name:    { en: "Orphan Child Monthly Stipend Scheme (TN) — 2025",  hi: "अनाथ बाल मासिक वजीफा योजना (TN) — 2025" },
    benefit: { en: "₹2,000/month stipend for children who have lost both parents, to support education and basic needs", hi: "दोनों माता-पिता को खो चुके बच्चों की शिक्षा और बुनियादी जरूरतों के लिए ₹2,000/माह वजीफा" },
    tag:     { en: "Orphan Welfare", hi: "अनाथ कल्याण" },
    annual:  24000,
    apply:   { en: "swwrh.tn.gov.in", hi: "swwrh.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Child's Aadhaar Card", "Death Certificates of Both Parents", "Birth Certificate", "Guardian's ID & Address Proof", "Bank Account (Guardian/Child)"],
               hi: ["बच्चे का आधार कार्ड", "दोनों माता-पिता का मृत्यु प्रमाण पत्र", "जन्म प्रमाण पत्र", "अभिभावक का पहचान व पता प्रमाण", "बैंक खाता (अभिभावक/बच्चा)"] },
    match: (a) => a.state === "Tamil Nadu" && a.age === "below18",
  },

  // ── 36. Mudhalvarin Kakkum Karangal — Ex-Servicemen Business Scheme (Aug 2025)
  {
    id: "tn_kakkum_karangal",
    icon: "🎖️", color: "#1E3A5F", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Dept. of Ex-Servicemen's Welfare, Tamil Nadu", hi: "तमिलनाडु भूतपूर्व सैनिक कल्याण विभाग" },
    name:    { en: "Mudhalvarin Kakkum Karangal — Ex-Servicemen Scheme (TN) — Aug 2025", hi: "मुधलवरिन काक्कुम करंगल — भूतपूर्व सैनिक योजना (TN) — अगस्त 2025" },
    benefit: { en: "Business loan up to ₹1 Crore + 30% capital subsidy + 3% interest subsidy for ex-servicemen & their families (including martyrs' families) to start ventures", hi: "भूतपूर्व सैनिकों और उनके परिजनों (शहीद परिवारों सहित) को व्यवसाय शुरू करने के लिए ₹1 करोड़ ऋण + 30% पूंजी सब्सिडी + 3% ब्याज सब्सिडी" },
    tag:     { en: "Ex-Servicemen", hi: "भूतपूर्व सैनिक" },
    annual:  10000000,
    apply:   { en: "exwel.tn.gov.in", hi: "exwel.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ex-Servicemen Discharge Certificate / PPO", "Business Project Report", "Bank Account", "Dependent Relationship Proof (for family members)"],
               hi: ["आधार कार्ड", "भूतपूर्व सैनिक डिस्चार्ज प्रमाण पत्र / PPO", "व्यापार प्रोजेक्ट रिपोर्ट", "बैंक खाता", "पारिवारिक संबंध प्रमाण (परिजनों के लिए)"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "business",
  },

  // ── 37. Nalam Kakkum Stalin — Free Medical Camps (Launched Aug 2025) ────────
  {
    id: "tn_nalam_kakkum_stalin",
    icon: "🏕️", color: "#065F46", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Health & Family Welfare Dept.", hi: "तमिलनाडु स्वास्थ्य और परिवार कल्याण विभाग" },
    name:    { en: "Nalam Kakkum Stalin — Medical Camps Scheme (TN) — Aug 2025", hi: "नलम काक्कुम स्टालिन — चिकित्सा शिविर योजना (TN) — अगस्त 2025" },
    benefit: { en: "Free health screening, diagnosis & medicines at 1,250+ camps across all 38 districts; covers diabetes, BP, cancer, eye & dental screenings", hi: "सभी 38 जिलों में 1,250+ शिविरों में निःशुल्क स्वास्थ्य जांच, निदान और दवाएं; मधुमेह, BP, कैंसर, नेत्र और दंत जांच शामिल" },
    tag:     { en: "Free Health Camp", hi: "निःशुल्क स्वास्थ्य शिविर" },
    annual:  0,
    apply:   { en: "health.tn.gov.in — attend nearest camp, no prior application needed", hi: "health.tn.gov.in — निकटतम शिविर में जाएं, पूर्व आवेदन आवश्यक नहीं" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (for records)", "Any Govt. ID"],
               hi: ["आधार कार्ड (रिकॉर्ड के लिए)", "कोई भी सरकारी पहचान पत्र"] },
    match: (a) => a.state === "Tamil Nadu",
  },

  // ── 38. Agriculture Value Addition Centres Subsidy (Launched Sep 2025) ─────
  {
    id: "tn_agri_value_addition",
    icon: "🏭", color: "#78350F", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Agriculture & Farmers' Welfare Dept.", hi: "तमिलनाडु कृषि एवं किसान कल्याण विभाग" },
    name:    { en: "Agriculture Value Addition Centres Subsidy (TN) — Sep 2025", hi: "कृषि मूल्य संवर्धन केंद्र सब्सिडी (TN) — सितंबर 2025" },
    benefit: { en: "25% subsidy (max ₹2.5 Cr) on setting up agri-processing units for crops like tomato, mango, millets; SC/ST & women entrepreneurs get extra 10% (total 35%)", hi: "टमाटर, आम, मिलेट आदि फसलों की प्रसंस्करण इकाइयों पर 25% सब्सिडी (अधिकतम ₹2.5 करोड़); SC/ST और महिला उद्यमियों को अतिरिक्त 10% (कुल 35%)" },
    tag:     { en: "Agri Entrepreneur", hi: "कृषि उद्यमी" },
    annual:  2500000,
    apply:   { en: "agri.tn.gov.in", hi: "agri.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Bank-Approved Project Report", "Land / Lease Documents for Unit", "GST Registration", "Community Certificate (SC/ST/Women, if applicable)"],
               hi: ["आधार कार्ड", "बैंक-अनुमोदित प्रोजेक्ट रिपोर्ट", "इकाई के लिए भूमि/पट्टा दस्तावेज", "GST पंजीकरण", "जाति/श्रेणी प्रमाण पत्र (SC/ST/महिला, यदि लागू हो)"] },
    match: (a) => a.state === "Tamil Nadu" && (a.who === "farmer" || a.who === "business"),
  },


  // ════════════════ ADDITIONAL NEW SCHEMES (2025) ══════════════════════════════

  // ── 39. CM Thayumanavar Scheme — Doorstep PDS Ration Delivery (Aug 2025) ───
  {
    id: "tn_thayumanavar_pds",
    icon: "🛵", color: "#065F46", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Civil Supplies & Consumer Protection Dept.", hi: "तमिलनाडु नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग" },
    name:    { en: "CM Thayumanavar Doorstep PDS Scheme (TN) — Aug 2025",  hi: "मुख्यमंत्री थायुमनावर घरद्वार PDS योजना (TN) — अगस्त 2025" },
    benefit: { en: "Monthly PDS ration (rice, sugar, wheat, oil, toor dal) delivered at home on 2nd weekend of every month for senior citizens 70+ and differently-abled persons; 21.7 lakh beneficiaries", hi: "70+ वर्ष के बुजुर्गों और दिव्यांगजनों को प्रति माह के दूसरे सप्ताहांत घर पर PDS राशन (चावल, चीनी, गेहूं, तेल, तूर दाल) की डिलीवरी; 21.7 लाख लाभार्थी" },
    tag:     { en: "Senior / Disabled Welfare", hi: "वरिष्ठ / दिव्यांग कल्याण" },
    annual:  0,
    apply:   { en: "Automatic via ration card list — contact nearest fair price shop or visit tnpds.gov.in", hi: "राशन कार्ड सूची के माध्यम से स्वतः — निकटतम उचित मूल्य दुकान से संपर्क करें या tnpds.gov.in देखें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (linked to ration card)", "Valid TN Ration Card", "Age Proof (70+) or Disability Certificate"],
               hi: ["आधार कार्ड (राशन कार्ड से लिंक)", "वैध TN राशन कार्ड", "आयु प्रमाण (70+) या विकलांगता प्रमाण पत्र"] },
    match: (a) => a.state === "Tamil Nadu" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  // ── 40. Mudhalvar Marundhagam — CM's Pharmacy Cheap Medicines (Feb 2025) ───
  {
    id: "tn_mudhalvar_marundhagam",
    icon: "💊", color: "#0369A1", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Health & Family Welfare Dept. / Cooperative Societies", hi: "तमिलनाडु स्वास्थ्य विभाग / सहकारी समितियां" },
    name:    { en: "Mudhalvar Marundhagam — CM's Pharmacy Scheme (TN) — Feb 2025", hi: "मुधलवर मरुन्धगम — मुख्यमंत्री दवा योजना (TN) — फरवरी 2025" },
    benefit: { en: "Generic & essential medicines at significantly reduced rates through 1,000+ govt-run pharmacy outlets across TN; pharmacists & co-ops get ₹3 lakh subsidy to set up stores", hi: "TN भर में 1,000+ सरकारी फार्मेसी आउटलेट से जेनेरिक और जरूरी दवाएं काफी कम कीमत पर; फार्मासिस्ट और सहकारी समितियों को स्टोर स्थापित करने पर ₹3 लाख सब्सिडी" },
    tag:     { en: "Cheap Medicines", hi: "सस्ती दवाएं" },
    annual:  0,
    apply:   { en: "mudhalvarmarundhagam.tn.gov.in — walk in to any outlet", hi: "mudhalvarmarundhagam.tn.gov.in — कोई भी आउटलेट पर जाएं" }, applyType: "online",
    docs:    { en: ["Aadhaar Card or Govt. ID", "Doctor's Prescription (for prescription medicines)"],
               hi: ["आधार कार्ड या सरकारी पहचान पत्र", "डॉक्टर का नुस्खा (प्रिस्क्रिप्शन दवाओं के लिए)"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 41. Conservancy Workers Welfare Package — 6 Schemes (Aug 2025) ──────────
  {
    id: "tn_conservancy_workers",
    icon: "🧹", color: "#374151", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Municipal Administration & Urban Development Dept.", hi: "तमिलनाडु नगरपालिका प्रशासन और शहरी विकास विभाग" },
    name:    { en: "Conservancy Workers Comprehensive Welfare Package (TN) — Aug 2025", hi: "सफाई कर्मचारी व्यापक कल्याण पैकेज (TN) — अगस्त 2025" },
    benefit: { en: "₹10 Lakh on-duty death compensation + 30,000 houses for homeless workers + free breakfast + disease detection & treatment + education scholarships for children + 35% entrepreneurship subsidy up to ₹3.5 Lakh", hi: "ड्यूटी पर मृत्यु पर ₹10 लाख मुआवजा + बेघर कर्मचारियों के लिए 30,000 मकान + निःशुल्क नाश्ता + रोग पहचान एवं उपचार + बच्चों के लिए शिक्षा छात्रवृत्ति + 35% उद्यमिता सब्सिडी (अधिकतम ₹3.5 लाख)" },
    tag:     { en: "Sanitation Worker", hi: "सफाई कर्मचारी" },
    annual:  350000,
    apply:   { en: "Apply via employer (ULB/GCC) or tnlabour.gov.in", hi: "नियोक्ता (ULB/GCC) या tnlabour.gov.in के माध्यम से आवेदन करें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Conservancy/Cleanliness Worker Employment Proof", "Welfare Board Registration Card", "Bank Account"],
               hi: ["आधार कार्ड", "सफाई कर्मचारी रोजगार प्रमाण", "कल्याण बोर्ड पंजीकरण कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "general" && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── 42. Ungaludan Stalin — Citizen Grievance & Services Camps (Jul 2025) ───
  {
    id: "tn_ungaludan_stalin",
    icon: "🏕️", color: "#1D4ED8", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Chief Minister's Office / All Departments", hi: "तमिलनाडु मुख्यमंत्री कार्यालय / सभी विभाग" },
    name:    { en: "Ungaludan Stalin — Citizen Services & Grievance Camps (TN) — Jul 2025", hi: "उंगलुडन स्टालिन — नागरिक सेवा और शिकायत शिविर (TN) — जुलाई 2025" },
    benefit: { en: "10,000 camps across all TN districts delivering 44 government services (patta transfer, pensions, ration cards etc.) at your doorstep; complaints resolved within 30 days", hi: "सभी TN जिलों में 10,000 शिविरों में 44 सरकारी सेवाएं (पट्टा हस्तांतरण, पेंशन, राशन कार्ड आदि) घर के पास; शिकायतें 30 दिनों में हल" },
    tag:     { en: "Citizen Services", hi: "नागरिक सेवाएं" },
    annual:  0,
    apply:   { en: "Attend nearest camp — check camp schedule at tn.gov.in", hi: "निकटतम शिविर में जाएं — शिविर कार्यक्रम tn.gov.in पर देखें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Relevant documents for the specific service needed"],
               hi: ["आधार कार्ड", "आवश्यक सेवा के लिए संबंधित दस्तावेज"] },
    match: (a) => a.state === "Tamil Nadu",
  },

  // ── 43. Transgender Monthly Assistance Enhanced to ₹1,500 (2025) ──────────
  {
    id: "tn_transgender_pension",
    icon: "🏳️‍🌈", color: "#7C3AED", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Social Welfare & Women's Rights Dept.", hi: "तमिलनाडु सामाजिक कल्याण और महिला अधिकार विभाग" },
    name:    { en: "Transgender Welfare Pension Scheme (TN) — Enhanced 2025",  hi: "तृतीय लिंग कल्याण पेंशन योजना (TN) — 2025 में बढ़ाई गई" },
    benefit: { en: "₹1,500/month pension for destitute transgender persons aged 40+; budget 2025-26 also includes transgender persons under Pudhumai Penn & Tamil Puthalvan scholarship schemes", hi: "40+ आयु के निराश्रित तृतीय लिंग व्यक्तियों को ₹1,500/माह पेंशन; बजट 2025-26 में पुधुमई पेन और तमिल पुतलवन छात्रवृत्ति में भी शामिल" },
    tag:     { en: "Transgender Welfare", hi: "तृतीय लिंग कल्याण" },
    annual:  18000,
    apply:   { en: "tnsocialwelfare.tn.gov.in", hi: "tnsocialwelfare.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Transgender Identity Certificate", "Age Proof (40+)", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "तृतीय लिंग पहचान प्रमाण पत्र", "आयु प्रमाण (40+)", "आय प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 44. Tamil Nadu Sports Pension Scheme (2025) ───────────────────────────
  {
    id: "tn_sports_pension",
    icon: "🏅", color: "#92400E", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Youth Welfare & Sports Development Dept.", hi: "तमिलनाडु युवा कल्याण और खेल विकास विभाग" },
    name:    { en: "Sports Pension Scheme for Former Sportspersons (TN) — 2025", hi: "भूतपूर्व खिलाड़ियों के लिए खेल पेंशन योजना (TN) — 2025" },
    benefit: { en: "₹6,000/month pension for former distinguished sportspersons who represented TN or India at national / international level and have no regular income", hi: "राष्ट्रीय / अंतर्राष्ट्रीय स्तर पर TN या भारत का प्रतिनिधित्व करने वाले भूतपूर्व खिलाड़ियों को ₹6,000/माह पेंशन, जिनकी कोई नियमित आय नहीं" },
    tag:     { en: "Sports Welfare", hi: "खेल कल्याण" },
    annual:  72000,
    apply:   { en: "tnpsc.gov.in / sports.tn.gov.in", hi: "tnpsc.gov.in / sports.tn.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sports Achievement Certificate (National/International)", "No Regular Income Declaration", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "खेल उपलब्धि प्रमाण पत्र (राष्ट्रीय/अंतर्राष्ट्रीय)", "नियमित आय न होने का घोषणा पत्र", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income) && ["35to60", "above60"].includes(a.age),
  },

  // ── 45. Pongal Gift Package — Ration Card Holders (Annual, Jan 2025) ────────
  {
    id: "tn_pongal_gift",
    icon: "🎁", color: "#D97706", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Civil Supplies & Consumer Protection Dept.", hi: "तमिलनाडु नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग" },
    name:    { en: "Pongal Gift Package for Ration Card Holders (TN) — Annual", hi: "राशन कार्ड धारकों के लिए पोंगल उपहार पैकेज (TN) — वार्षिक" },
    benefit: { en: "Annual Pongal hamper: ₹1,000 cash + 1 kg sugar + 1 kg rice + 1 sugarcane + additional items announced yearly for all 2.27 crore ration card families", hi: "सभी 2.27 करोड़ राशन कार्ड परिवारों के लिए वार्षिक पोंगल हैम्पर: ₹1,000 नकद + 1 किलो चीनी + 1 किलो चावल + 1 गन्ना + प्रतिवर्ष घोषित अतिरिक्त वस्तुएं" },
    tag:     { en: "Festival Gift", hi: "त्योहार उपहार" },
    annual:  1000,
    apply:   { en: "Automatic via ration card — no separate application; collect from fair price shop around Pongal (Jan)", hi: "राशन कार्ड के माध्यम से स्वतः — अलग आवेदन नहीं; पोंगल (जनवरी) के आसपास उचित मूल्य दुकान से लें" }, applyType: "offline",
    docs:    { en: ["Valid TN Ration Card", "Aadhaar Card (for biometric verification)"],
               hi: ["वैध TN राशन कार्ड", "आधार कार्ड (बायोमेट्रिक सत्यापन के लिए)"] },
    match: (a) => a.state === "Tamil Nadu" && ["below1", "1to3"].includes(a.income),
  },

  // ── 46. Stamp Duty Concession for Women Property Registration (Budget 2025) ─
  {
    id: "tn_stamp_duty_women",
    icon: "📝", color: "#BE185D", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu Registration Dept.", hi: "तमिलनाडु पंजीकरण विभाग" },
    name:    { en: "Stamp Duty Concession for Women Buyers — 1% Reduction (TN) — 2025", hi: "महिला खरीदारों के लिए स्टांप शुल्क छूट — 1% कमी (TN) — 2025" },
    benefit: { en: "1% reduction in stamp duty for women registering property up to ₹10 Lakh value; encourages women's property ownership across Tamil Nadu", hi: "₹10 लाख तक की संपत्ति पंजीकृत कराने वाली महिलाओं के लिए स्टांप शुल्क में 1% कमी; तमिलनाडु में महिलाओं के संपत्ति स्वामित्व को प्रोत्साहन" },
    tag:     { en: "Women Property", hi: "महिला संपत्ति" },
    annual:  10000,
    apply:   { en: "tnreginet.gov.in — automatic at time of property registration", hi: "tnreginet.gov.in — संपत्ति पंजीकरण के समय स्वतः लागू" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Sale Deed / Property Documents", "PAN Card", "Encumbrance Certificate", "Bank Account for payment"],
               hi: ["आधार कार्ड", "बिक्री विलेख / संपत्ति दस्तावेज", "PAN कार्ड", "एन्कम्ब्रेंस प्रमाण पत्र", "भुगतान के लिए बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "women",
  },

];
