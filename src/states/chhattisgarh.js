// Chhattisgarh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "chhattisgarh_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const CHHATTISGARH_SCHEMES = [

  // ── Agriculture & Farmers ──────────────────────────────────────────────────

  {
    id: "cg_dr_khoobasuram",
    icon: "🌾", color: "#15803D", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Agriculture Dept.", hi: "छत्तीसगढ़ कृषि विभाग" },
    name:    { en: "Rajiv Gandhi Kisan Nyay Yojana (CG)",             hi: "राजीव गांधी किसान न्याय योजना (छत्तीसगढ़)" },
    benefit: { en: "₹9,000–₹13,000/acre input subsidy for paddy & other crops", hi: "धान व अन्य फसलों पर ₹9,000–₹13,000/एकड़ इनपुट सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 13000,
    apply:   { en: "https://kisan.cg.gov.in", hi: "kisan.cg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (B1/P2)","Bank Passbook","Farmer Registration"],
               hi: ["आधार कार्ड","भूमि अभिलेख (B1/P2)","बैंक पासबुक","किसान पंजीकरण"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer",
  },

  {
    id: "cg_godhan_nyay",
    icon: "🐄", color: "#16A34A", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Agriculture Dept.", hi: "छत्तीसगढ़ कृषि विभाग" },
    name:    { en: "Godhan Nyay Yojana",                           hi: "गोधन न्याय योजना" },
    benefit: { en: "₹2/kg for cow dung sold to Gauthans (govt collection centres)", hi: "गोबर बेचने पर ₹2/किलो — सरकारी गौठान केन्द्रों पर" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 7300,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Cattle Ownership Proof","Bank Passbook"],
               hi: ["आधार कार्ड","पशु स्वामित्व प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "farmer" || a.area === "rural"),
  },

  {
    id: "cg_kisan_samridhi",
    icon: "🌱", color: "#22C55E", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Agriculture Dept.", hi: "छत्तीसगढ़ कृषि विभाग" },
    name:    { en: "Mukhyamantri Kisan Samridhi Yojana",           hi: "मुख्यमंत्री किसान समृद्धि योजना" },
    benefit: { en: "Free soil health card + subsidised seeds & fertiliser kit", hi: "मुफ्त मिट्टी स्वास्थ्य कार्ड + सब्सिडी युक्त बीज व खाद किट" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 5000,
    apply:   { en: "agri.cg.gov.in", hi: "agri.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Record (B1)","Farmer Registration","Bank Passbook"],
               hi: ["आधार कार्ड","भूमि अभिलेख (B1)","किसान पंजीकरण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  // ── Women & Children ───────────────────────────────────────────────────────

  {
    id: "cg_mahtari_vandan",
    icon: "👩", color: "#DB2777", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Women & Child Dept.", hi: "छत्तीसगढ़ महिला एवं बाल विकास विभाग" },
    name:    { en: "Mahtari Vandan Yojana",                        hi: "महतारी वंदन योजना" },
    benefit: { en: "₹1,000/month (₹12,000/year) direct benefit to married women", hi: "विवाहित महिलाओं को ₹1,000/माह (₹12,000/वर्ष) सीधे बैंक में" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 12000,
    apply:   { en: "https://mahtarivandan.cgstate.gov.in", hi: "mahtarivandan.cgstate.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Marriage Certificate","Bank Passbook","Domicile Certificate"],
               hi: ["आधार कार्ड","विवाह प्रमाण पत्र","बैंक पासबुक","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women",
  },

  {
    id: "cg_nouni_suraksha",
    icon: "👶", color: "#EC4899", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Women & Child Dept.", hi: "छत्तीसगढ़ महिला एवं बाल विकास विभाग" },
    name:    { en: "Noni Suraksha Yojana",                         hi: "नोनी सुरक्षा योजना" },
    benefit: { en: "₹1 Lakh fixed deposit at birth of a girl child in BPL family", hi: "बीपीएल परिवार की बेटी के जन्म पर ₹1 लाख एफडी" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 100000,
    apply:   { en: "cgwcd.gov.in", hi: "cgwcd.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Birth Certificate (Girl)","BPL Ration Card","Bank Account"],
               hi: ["आधार कार्ड","बालिका का जन्म प्रमाण","बीपीएल राशन कार्ड","बैंक खाता"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "cg_sukanya_cg",
    icon: "🎓", color: "#C026D3", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh School Education Dept.", hi: "छत्तीसगढ़ स्कूल शिक्षा विभाग" },
    name:    { en: "Saraswati Cycle Yojana",                       hi: "सरस्वती साइकिल योजना" },
    benefit: { en: "Free bicycle for girl students of Class 9 in government schools", hi: "सरकारी स्कूल की कक्षा 9 की छात्राओं को मुफ्त साइकिल" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 3500,
    apply:   { en: "schooleducation.cg.gov.in", hi: "schooleducation.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","School Enrollment Proof","Caste/Income Certificate"],
               hi: ["आधार कार्ड","विद्यालय नामांकन प्रमाण","जाति/आय प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && (a.age === "below18" || a.who === "student"),
  },

  // ── Housing ────────────────────────────────────────────────────────────────

  {
    id: "cg_ram_van_gaman",
    icon: "🏠", color: "#EA580C", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Housing & Environment Dept.", hi: "छत्तीसगढ़ आवास एवं पर्यावरण विभाग" },
    name:    { en: "Mukhyamantri Awas Yojana (CG)",                hi: "मुख्यमंत्री आवास योजना (छत्तीसगढ़)" },
    benefit: { en: "₹1.20 Lakh – ₹1.30 Lakh for pucca house construction (state top-up)", hi: "पक्का मकान निर्माण के लिए ₹1.20–₹1.30 लाख (राज्य टॉप-अप सहित)" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 130000,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL/Income Certificate","Land Documents","Bank Passbook","Photograph"],
               hi: ["आधार कार्ड","बीपीएल/आय प्रमाण","जमीन के कागज","बैंक पासबुक","फोटो"] },
    match: (a) => a.state === "Chhattisgarh" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income) && a.area === "rural",
  },

  // ── Health ─────────────────────────────────────────────────────────────────

  {
    id: "cg_dr_khoobasuram_health",
    icon: "🏥", color: "#0EA5E9", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Health & Family Welfare Dept.", hi: "छत्तीसगढ़ स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Mukhyamantri Swasthya Bima Yojana (CG)",      hi: "मुख्यमंत्री स्वास्थ्य बीमा योजना (छत्तीसगढ़)" },
    benefit: { en: "₹5 Lakh/year cashless treatment at govt & empanelled private hospitals", hi: "₹5 लाख/वर्ष सरकारी व सूचीबद्ध निजी अस्पतालों में कैशलेस इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "https://https://dkbssy.cg.gov.in", hi: "dkbssy.cg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Income Certificate","Domicile Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण पत्र","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "cg_sanjeevani_sahayata",
    icon: "💊", color: "#2563EB", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Health & Family Welfare Dept.", hi: "छत्तीसगढ़ स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Sanjeevani Sahayata Kosh",                     hi: "संजीवनी सहायता कोष" },
    benefit: { en: "Up to ₹20,000 financial aid for critical illness (cancer, kidney, heart)", hi: "गंभीर बीमारी (कैंसर, किडनी, हृदय) के लिए ₹20,000 तक सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 20000,
    apply:   { en: "health.cg.gov.in", hi: "health.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Medical Certificate","BPL/Income Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","चिकित्सा प्रमाण पत्र","बीपीएल/आय प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  // ── Education & Youth ──────────────────────────────────────────────────────

  {
    id: "cg_swami_atmanand",
    icon: "📚", color: "#7C3AED", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh School Education Dept.", hi: "छत्तीसगढ़ स्कूल शिक्षा विभाग" },
    name:    { en: "Swami Atmanand English Medium School Yojana",  hi: "स्वामी आत्मानंद अंग्रेजी माध्यम स्कूल योजना" },
    benefit: { en: "Free quality English-medium education (Classes 1–12) at state-run schools", hi: "राज्य संचालित अंग्रेजी माध्यम स्कूलों में कक्षा 1–12 की मुफ्त पढ़ाई" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 30000,
    apply:   { en: "schooleducation.cg.gov.in", hi: "schooleducation.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Previous Class Marksheet","Domicile Certificate","Caste Certificate (if applicable)"],
               hi: ["आधार कार्ड","पिछली कक्षा की मार्कशीट","निवास प्रमाण पत्र","जाति प्रमाण (यदि लागू हो)"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "student" || a.age === "below18"),
  },

  {
    id: "cg_higher_ed_scholarship",
    icon: "🎓", color: "#4F46E5", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Higher Education Dept.", hi: "छत्तीसगढ़ उच्च शिक्षा विभाग" },
    name:    { en: "CG State Scholarship for Higher Education",    hi: "छत्तीसगढ़ उच्च शिक्षा छात्रवृत्ति" },
    benefit: { en: "₹5,000 – ₹15,000/year for SC/ST/OBC students in colleges", hi: "SC/ST/OBC कॉलेज छात्रों को ₹5,000–₹15,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 15000,
    apply:   { en: "https://https://scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate","Income Certificate","Marksheet","College ID","Bank Passbook"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र","आय प्रमाण पत्र","मार्कशीट","कॉलेज ID","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Senior Citizens ────────────────────────────────────────────────────────

  {
    id: "cg_social_security_pension",
    icon: "👴", color: "#B45309", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Social Welfare Dept.", hi: "छत्तीसगढ़ समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Pension Yojana (Old Age)",        hi: "मुख्यमंत्री पेंशन योजना (वृद्धावस्था)" },
    benefit: { en: "₹650/month pension for senior citizens aged 60+ (BPL)", hi: "60 वर्ष से अधिक बीपीएल वरिष्ठ नागरिकों को ₹650/माह पेंशन" },
    tag:     { en: "Senior", hi: "वरिष्ठ नागरिक" },
    annual: 7800,
    apply:   { en: "sw.cg.gov.in", hi: "sw.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Age Proof","BPL/Income Certificate","Bank Passbook","Domicile Certificate"],
               hi: ["आधार कार्ड","आयु प्रमाण","बीपीएल/आय प्रमाण पत्र","बैंक पासबुक","निवास प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "cg_disability_pension",
    icon: "♿", color: "#92400E", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Social Welfare Dept.", hi: "छत्तीसगढ़ समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Divyang Pension Yojana",          hi: "मुख्यमंत्री दिव्यांग पेंशन योजना" },
    benefit: { en: "₹500–₹1,000/month for persons with 40%+ disability", hi: "40% से अधिक दिव्यांगता पर ₹500–₹1,000/माह पेंशन" },
    tag:     { en: "Senior", hi: "दिव्यांग" },
    annual: 12000,
    apply:   { en: "sw.cg.gov.in", hi: "sw.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Disability Certificate (40%+)","Income Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","दिव्यांगता प्रमाण पत्र (40%+)","आय प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  // ── Employment & Business ──────────────────────────────────────────────────

  {
    id: "cg_yuva_mitan",
    icon: "💼", color: "#0369A1", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Skill Development Dept.", hi: "छत्तीसगढ़ कौशल विकास विभाग" },
    name:    { en: "Mukhyamantri Yuva Swarojgar Yojana",          hi: "मुख्यमंत्री युवा स्वरोजगार योजना" },
    benefit: { en: "Loan up to ₹2 Lakh at 5% interest for youth self-employment ventures", hi: "युवाओं को स्वरोजगार के लिए 5% ब्याज पर ₹2 लाख तक ऋण" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 200000,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Age Proof (18–35 years)","Education Certificate","Project Report","Domicile Certificate","Bank Account"],
               hi: ["आधार कार्ड","आयु प्रमाण (18–35 वर्ष)","शिक्षा प्रमाण पत्र","प्रोजेक्ट रिपोर्ट","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "business" || a.age === "18to35"),
  },

  {
    id: "cg_van_dhan_vikas",
    icon: "🌿", color: "#166534", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Minor Forest Produce Federation", hi: "छत्तीसगढ़ राज्य लघु वनोपज संघ" },
    name:    { en: "Van Dhan Vikas Kendra Scheme (CG)",            hi: "वन धन विकास केन्द्र योजना (छत्तीसगढ़)" },
    benefit: { en: "Tribal forest produce collectors get processing units + MSP support", hi: "आदिवासी वनोपज संग्राहकों को प्रसंस्करण इकाई + न्यूनतम समर्थन मूल्य" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 15000,
    apply:   { en: "cgmfpfed.org", hi: "cgmfpfed.org" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Tribal (ST) Certificate","Village Residence Proof","Bank Passbook"],
               hi: ["आधार कार्ड","जनजाति (ST) प्रमाण पत्र","ग्राम निवास प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "business" || a.who === "farmer") && a.area === "rural",
  },

  // ── Food & Ration ──────────────────────────────────────────────────────────

  {
    id: "cg_mukhyamantri_suposhan",
    icon: "🍱", color: "#CA8A04", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Food & Civil Supplies Dept.", hi: "छत्तीसगढ़ खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Mukhyamantri Suposhan Abhiyan",               hi: "मुख्यमंत्री सुपोषण अभियान" },
    benefit: { en: "Hot cooked meals + nutrition kits to prevent malnutrition in children & pregnant women", hi: "बच्चों और गर्भवती महिलाओं को पौष्टिक भोजन व किट — कुपोषण रोकने हेतु" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 3000,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card","Child/Pregnancy Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","बच्चे का प्रमाण/गर्भावस्था प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "women" || ["below1","1to3"].includes(a.income)),
  },

  {
    id: "cg_rice_2rs",
    icon: "🍚", color: "#D97706", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Food & Civil Supplies Dept.", hi: "छत्तीसगढ़ खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "CG ₹2 Rice Scheme (Khadya Suraksha)",         hi: "छत्तीसगढ़ ₹2 चावल योजना (खाद्य सुरक्षा)" },
    benefit: { en: "35 kg rice/month at ₹2/kg for BPL/AAY ration card holders", hi: "बीपीएल/अंत्योदय राशन कार्ड धारकों को ₹2/किलो में 35 किलो चावल/माह" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 840,
    apply:   { en: "khadya.cg.gov.in", hi: "khadya.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL/AAY Ration Card","Domicile Certificate"],
               hi: ["आधार कार्ड","बीपीएल/अंत्योदय राशन कार्ड","निवास प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  // ── Widow & Social Security ────────────────────────────────────────────────

  {
    id: "cg_widow_pension",
    icon: "🤲", color: "#7C3AED", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Social Welfare Dept.", hi: "छत्तीसगढ़ समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Vidhwa Pension Yojana",           hi: "मुख्यमंत्री विधवा पेंशन योजना" },
    benefit: { en: "₹650/month pension for widows from BPL families", hi: "बीपीएल परिवार की विधवा महिलाओं को ₹650/माह पेंशन" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 7800,
    apply:   { en: "sw.cg.gov.in", hi: "sw.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Husband's Death Certificate","BPL/Income Certificate","Bank Passbook","Domicile Certificate"],
               hi: ["आधार कार्ड","पति का मृत्यु प्रमाण पत्र","बीपीएल/आय प्रमाण","बैंक पासबुक","निवास प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "cg_nirashrit_pension",
    icon: "🧓", color: "#6D28D9", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Social Welfare Dept.", hi: "छत्तीसगढ़ समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Nirashrit Pension Yojana",        hi: "मुख्यमंत्री निराश्रित पेंशन योजना" },
    benefit: { en: "₹650/month for destitute persons with no income or family support", hi: "कोई आय या परिवार का सहारा न होने पर ₹650/माह" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 7800,
    apply:   { en: "sw.cg.gov.in", hi: "sw.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Income Certificate (nil)","Domicile Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","शून्य आय प्रमाण पत्र","निवास प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.income === "below1",
  },

  // ── Electricity & Energy ───────────────────────────────────────────────────

  {
    id: "cg_half_bijli",
    icon: "⚡", color: "#F59E0B", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Energy Dept.", hi: "छत्तीसगढ़ ऊर्जा विभाग" },
    name:    { en: "Mukhyamantri Adha Bijli Bill Mafi Yojana",     hi: "मुख्यमंत्री आधा बिजली बिल माफी योजना" },
    benefit: { en: "50% electricity bill waiver for domestic consumers using up to 400 units/month", hi: "400 यूनिट/माह तक घरेलू उपभोक्ताओं को 50% बिजली बिल माफी" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 3600,
    apply:   { en: "cspdcl.co.in", hi: "cspdcl.co.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Electricity Bill (consumer number)","Domicile Certificate"],
               hi: ["आधार कार्ड","बिजली बिल (उपभोक्ता क्रमांक)","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "cg_solar_suryashakti",
    icon: "☀️", color: "#EAB308", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Renewable Energy Dept.", hi: "छत्तीसगढ़ नवीन एवं नवीकरणीय ऊर्जा विभाग" },
    name:    { en: "CG Solar Suryashakti Yojana",                  hi: "छत्तीसगढ़ सूर्यशक्ति योजना" },
    benefit: { en: "Subsidy up to 40% on rooftop solar panel installation for rural households", hi: "ग्रामीण घरों को रूफटॉप सोलर पैनल पर 40% तक सब्सिडी" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 20000,
    apply:   { en: "https://https://creda.in", hi: "creda.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Electricity Connection Proof","Land/House Ownership Proof","Bank Passbook"],
               hi: ["आधार कार्ड","बिजली कनेक्शन प्रमाण","जमीन/मकान स्वामित्व प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.area === "rural",
  },

  // ── Water & Sanitation ─────────────────────────────────────────────────────

  {
    id: "cg_nal_jal_yojana",
    icon: "🚰", color: "#0891B2", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Public Health Engineering Dept.", hi: "छत्तीसगढ़ लोक स्वास्थ्य यांत्रिकी विभाग" },
    name:    { en: "Jal Jeevan Mission – CG (Nal Se Jal)",         hi: "जल जीवन मिशन – छत्तीसगढ़ (नल से जल)" },
    benefit: { en: "Free tap water connection (piped potable water) to every rural household", hi: "प्रत्येक ग्रामीण घर को मुफ्त नल जल कनेक्शन (पाइप से शुद्ध पानी)" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 5000,
    apply:   { en: "phed.cg.gov.in", hi: "phed.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Domicile Certificate","House Ownership/Residency Proof"],
               hi: ["आधार कार्ड","निवास प्रमाण पत्र","मकान स्वामित्व/निवास प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && a.area === "rural",
  },

  {
    id: "cg_shauchalay_nirman",
    icon: "🚻", color: "#0E7490", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Panchayat & Rural Dev. Dept.", hi: "छत्तीसगढ़ पंचायत एवं ग्रामीण विकास विभाग" },
    name:    { en: "Swachh Bharat Mission – CG (Toilet Construction)", hi: "स्वच्छ भारत मिशन – छत्तीसगढ़ (शौचालय निर्माण)" },
    benefit: { en: "₹12,000 incentive for construction of household toilet (ODF mission)", hi: "घरेलू शौचालय निर्माण पर ₹12,000 प्रोत्साहन राशि" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 12000,
    apply:   { en: "https://https://sbm.gov.in", hi: "sbm.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL/APL Ration Card","Land/House Proof","Bank Passbook","Gram Panchayat Letter"],
               hi: ["आधार कार्ड","बीपीएल/एपीएल राशन कार्ड","जमीन/मकान प्रमाण","बैंक पासबुक","ग्राम पंचायत पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── Skill Development & Labour ─────────────────────────────────────────────

  {
    id: "cg_kaushal_vikas",
    icon: "🛠️", color: "#1D4ED8", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Skill Development Authority", hi: "छत्तीसगढ़ कौशल विकास प्राधिकरण" },
    name:    { en: "Mukhyamantri Kaushal Vikas Yojana (CG)",       hi: "मुख्यमंत्री कौशल विकास योजना (छत्तीसगढ़)" },
    benefit: { en: "Free vocational skill training (ITI/NSQF) + ₹1,000/month stipend during training", hi: "मुफ्त व्यावसायिक कौशल प्रशिक्षण (ITI/NSQF) + प्रशिक्षण के दौरान ₹1,000/माह वजीफा" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 12000,
    apply:   { en: "https://https://cgskills.com", hi: "cgskills.com" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (18–35 years)","Education Certificate (Class 8+)","Domicile Certificate","Bank Account"],
               hi: ["आधार कार्ड","आयु प्रमाण (18–35 वर्ष)","शिक्षा प्रमाण (कक्षा 8+)","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Chhattisgarh" && (a.age === "18to35" || a.who === "student") && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "cg_labour_card",
    icon: "👷", color: "#374151", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Labour Dept.", hi: "छत्तीसगढ़ श्रम विभाग" },
    name:    { en: "CG Building & Construction Workers Welfare Scheme", hi: "छत्तीसगढ़ भवन एवं सन्निर्माण कर्मकार कल्याण योजना" },
    benefit: { en: "Registered workers get ₹5,000 accident aid, tool kit, scholarship for children & maternity benefit", hi: "पंजीकृत मजदूरों को ₹5,000 दुर्घटना सहायता, टूल किट, बच्चों की छात्रवृत्ति व प्रसूति लाभ" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 10000,
    apply:   { en: "https://https://cglabour.nic.in", hi: "cglabour.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Labour Card / Registration","90-day Work Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","श्रमिक कार्ड/पंजीयन","90 दिवस कार्य प्रमाण पत्र","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income) && (a.who === "general" || a.area === "rural"),
  },

  // ── Tribal Welfare ─────────────────────────────────────────────────────────

  {
    id: "cg_tribal_ashram_school",
    icon: "🏫", color: "#92400E", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Tribal Welfare Dept.", hi: "छत्तीसगढ़ आदिम जाति तथा अनुसूचित जाति विकास विभाग" },
    name:    { en: "Eklavya Adarsh Ashram Vidyalay Scheme",        hi: "एकलव्य आदर्श आश्रम विद्यालय योजना" },
    benefit: { en: "Free residential schooling (Classes 6–12) for ST students with hostel, meals & books", hi: "ST छात्रों को कक्षा 6–12 मुफ्त आवासीय विद्यालय — छात्रावास, भोजन व पुस्तकें" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 40000,
    apply:   { en: "tribal.cg.gov.in", hi: "tribal.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Tribal (ST) Caste Certificate","Previous Marksheet","Domicile Certificate"],
               hi: ["आधार कार्ड","जनजाति (ST) जाति प्रमाण पत्र","पिछली मार्कशीट","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "student" && a.area === "rural",
  },

  {
    id: "cg_pre_matric_tribal",
    icon: "📖", color: "#78350F", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Tribal Welfare Dept.", hi: "छत्तीसगढ़ आदिम जाति तथा अनुसूचित जाति विकास विभाग" },
    name:    { en: "Pre-Matric Scholarship for SC/ST Students (CG)", hi: "अनुसूचित जाति/जनजाति प्री-मैट्रिक छात्रवृत्ति (छत्तीसगढ़)" },
    benefit: { en: "₹500–₹1,000/month scholarship + free books for SC/ST students (Class 1–10)", hi: "SC/ST छात्रों को ₹500–₹1,000/माह छात्रवृत्ति + मुफ्त पाठ्य पुस्तकें (कक्षा 1–10)" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "https://https://scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC/ST)","Previous Marksheet","Income Certificate","School Enrollment Proof"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC/ST)","पिछली मार्कशीट","आय प्रमाण पत्र","स्कूल नामांकन प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── Maternity & Child Health ───────────────────────────────────────────────

  {
    id: "cg_maternity_sahayata",
    icon: "🤰", color: "#BE185D", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Health & Family Welfare Dept.", hi: "छत्तीसगढ़ स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Mukhyamantri Surakshit Matritva Yojana (CG)",  hi: "मुख्यमंत्री सुरक्षित मातृत्व योजना (छत्तीसगढ़)" },
    benefit: { en: "₹1,000 incentive + free ante-natal check-ups & institutional delivery support", hi: "₹1,000 प्रोत्साहन + मुफ्त प्रसव पूर्व जांच एवं संस्थागत प्रसव सहायता" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 5000,
    apply:   { en: "health.cg.gov.in", hi: "health.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Pregnancy Registration Card","BPL/Income Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","गर्भावस्था पंजीयन कार्ड","बीपीएल/आय प्रमाण","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Micro-Enterprise & SHG ─────────────────────────────────────────────────

  {
    id: "cg_saur_sujala",
    icon: "💧", color: "#0284C7", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Renewable Energy Dept.", hi: "छत्तीसगढ़ नवीन एवं नवीकरणीय ऊर्जा विभाग" },
    name:    { en: "Saur Sujala Yojana",                           hi: "सौर सुजला योजना" },
    benefit: { en: "Subsidised solar-powered irrigation pump (3–5 HP) for farmers at ₹7,000–₹10,000 (vs ₹3–4 Lakh actual cost)", hi: "किसानों को 3–5 HP सौर सिंचाई पंप ₹7,000–₹10,000 में (वास्तविक लागत ₹3–4 लाख)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 300000,
    apply:   { en: "https://https://creda.in", hi: "creda.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Record (B1/P2)","Farmer Registration","Bank Passbook","Caste Certificate (if applicable)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (B1/P2)","किसान पंजीयन","बैंक पासबुक","जाति प्रमाण (यदि लागू)"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer",
  },

  {
    id: "cg_shg_loan",
    icon: "🤝", color: "#0F766E", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Rural Livelihood Mission (Bihan)", hi: "छत्तीसगढ़ ग्रामीण आजीविका मिशन (बिहान)" },
    name:    { en: "Bihan SHG Revolving Fund & Bank Linkage",      hi: "बिहान स्वयं सहायता समूह रिवॉल्विंग फंड एवं बैंक लिंकेज" },
    benefit: { en: "₹10,000–₹15,000 revolving fund + bank loan linkage at 3% interest for women SHGs", hi: "महिला SHG को ₹10,000–₹15,000 रिवॉल्विंग फंड + 3% ब्याज पर बैंक ऋण" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 15000,
    apply:   { en: "cgrlm.gov.in", hi: "cgrlm.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SHG Registration Certificate","Group Meeting Register","Bank Account (Group)"],
               hi: ["आधार कार्ड","SHG पंजीयन प्रमाण पत्र","समूह बैठक रजिस्टर","बैंक खाता (समूह)"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && (a.area === "rural" || a.area === "semi"),
  },

  {
    id: "cg_mukhyamantri_hastshilp",
    icon: "🏺", color: "#B45309", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Handicraft & Handloom Dept.", hi: "छत्तीसगढ़ हस्तशिल्प एवं हथकरघा विभाग" },
    name:    { en: "Mukhyamantri Hastshilp Protsahan Yojana",      hi: "मुख्यमंत्री हस्तशिल्प प्रोत्साहन योजना" },
    benefit: { en: "Artisans get tool kits worth ₹5,000, design training & marketing linkage with GI-tagged CG crafts", hi: "कारीगरों को ₹5,000 के टूल किट, डिजाइन प्रशिक्षण व GI-टैग छत्तीसगढ़ शिल्प के लिए बाजार लिंकेज" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 10000,
    apply:   { en: "cghandicraft.gov.in", hi: "cghandicraft.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Artisan Identity Card","Caste/Income Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","कारीगर पहचान पत्र","जाति/आय प्रमाण पत्र","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "business" || a.who === "general") && ["below1","1to3"].includes(a.income),
  },

  // ── Marriage Assistance ────────────────────────────────────────────────────

  {
    id: "cg_mukhyamantri_vivah",
    icon: "💍", color: "#DB2777", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Women & Child Dept.", hi: "छत्तीसगढ़ महिला एवं बाल विकास विभाग" },
    name:    { en: "Mukhyamantri Kanyadan Yojana",                 hi: "मुख्यमंत्री कन्यादान योजना" },
    benefit: { en: "₹25,000 one-time marriage assistance to BPL families for daughter's wedding", hi: "बेटी की शादी पर बीपीएल परिवारों को ₹25,000 एकमुश्त विवाह सहायता" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 25000,
    apply:   { en: "cgwcd.gov.in", hi: "cgwcd.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Girl's Birth Certificate","Income Certificate","Marriage Invitation Card","Bank Passbook"],
               hi: ["आधार कार्ड","बीपीएल राशन कार्ड","बालिका का जन्म प्रमाण","आय प्रमाण पत्र","विवाह निमंत्रण पत्र","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "cg_mukhyamantri_samuhik_vivah",
    icon: "🎊", color: "#9D174D", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Women & Child Dept.", hi: "छत्तीसगढ़ महिला एवं बाल विकास विभाग" },
    name:    { en: "Mukhyamantri Samuhik Vivah Yojana",            hi: "मुख्यमंत्री सामूहिक विवाह योजना" },
    benefit: { en: "₹35,000 assistance (₹25k cash + ₹10k household goods) at mass wedding events for BPL families", hi: "सामूहिक विवाह आयोजन में बीपीएल परिवारों को ₹35,000 (₹25k नकद + ₹10k गृहस्थी सामान)" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 35000,
    apply:   { en: "cgwcd.gov.in", hi: "cgwcd.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (Bride & Groom)","BPL Ration Card","Age Proof","Domicile Certificate","Bank Passbook"],
               hi: ["आधार कार्ड (वर-वधू दोनों)","बीपीएल राशन कार्ड","आयु प्रमाण","निवास प्रमाण पत्र","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Sports & Youth ─────────────────────────────────────────────────────────

  {
    id: "cg_khelo_india_cg",
    icon: "🏆", color: "#DC2626", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Sports & Youth Welfare Dept.", hi: "छत्तीसगढ़ खेल एवं युवा कल्याण विभाग" },
    name:    { en: "Mukhyamantri Khiladi Protsahan Yojana",        hi: "मुख्यमंत्री खिलाड़ी प्रोत्साहन योजना" },
    benefit: { en: "₹10,000–₹5 Lakh cash prize + govt job preference for national/international medal winners from CG", hi: "राष्ट्रीय/अंतरराष्ट्रीय पदक विजेता खिलाड़ियों को ₹10,000–₹5 लाख नकद पुरस्कार + सरकारी नौकरी में प्राथमिकता" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 500000,
    apply:   { en: "sports.cg.gov.in", hi: "sports.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Sports Certificate (National/International)","Domicile Certificate","Bank Passbook","Medal/Certificate of Achievement"],
               hi: ["आधार कार्ड","खेल प्रमाण पत्र (राष्ट्रीय/अंतरराष्ट्रीय)","निवास प्रमाण पत्र","बैंक पासबुक","पदक/उपलब्धि प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && (a.age === "18to35" || a.age === "below18"),
  },

  // ── Fisheries ──────────────────────────────────────────────────────────────

  {
    id: "cg_matsya_palan",
    icon: "🐟", color: "#0369A1", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Fisheries Dept.", hi: "छत्तीसगढ़ मत्स्य पालन विभाग" },
    name:    { en: "Mukhyamantri Matsya Palan Protsahan Yojana",  hi: "मुख्यमंत्री मत्स्य पालन प्रोत्साहन योजना" },
    benefit: { en: "50% subsidy (up to ₹50,000) on pond construction, fish seed & equipment for fish farmers", hi: "मत्स्य पालकों को तालाब निर्माण, मछली बीज व उपकरणों पर 50% सब्सिडी (₹50,000 तक)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 50000,
    apply:   { en: "fisheries.cg.gov.in", hi: "fisheries.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Record / Pond Ownership Proof","Caste Certificate (if applicable)","Bank Passbook","Fish Farmer Registration"],
               hi: ["आधार कार्ड","भूमि अभिलेख/तालाब स्वामित्व प्रमाण","जाति प्रमाण (यदि लागू)","बैंक पासबुक","मत्स्य पालक पंजीयन"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "farmer" || a.area === "rural"),
  },

  // ── Forest Rights ──────────────────────────────────────────────────────────

  {
    id: "cg_van_adhikar_patta",
    icon: "🌳", color: "#15803D", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Forest Dept.", hi: "छत्तीसगढ़ वन विभाग" },
    name:    { en: "Van Adhikar Patta Yojana (Forest Rights Act)",  hi: "वन अधिकार पट्टा योजना (वन अधिकार अधिनियम)" },
    benefit: { en: "Individual/community forest land title (patta) up to 4 hectares for tribal forest dwellers", hi: "जनजाति वन निवासियों को 4 हेक्टेयर तक व्यक्तिगत/सामुदायिक वन भूमि पट्टा" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 200000,
    apply:   { en: "forest.cg.gov.in", hi: "forest.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Tribal (ST) Caste Certificate","Proof of Forest Land Occupation (pre-2005)","Gram Sabha Resolution","Witness Statements"],
               hi: ["आधार कार्ड","जनजाति (ST) जाति प्रमाण पत्र","वन भूमि पर कब्जे का प्रमाण (2005 से पूर्व)","ग्राम सभा प्रस्ताव","गवाहों के बयान"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer" && a.area === "rural",
  },

  // ── Legal Aid & Grievance ──────────────────────────────────────────────────

  {
    id: "cg_lok_adalat",
    icon: "⚖️", color: "#1E3A5F", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh State Legal Services Authority", hi: "छत्तीसगढ़ राज्य विधिक सेवा प्राधिकरण" },
    name:    { en: "Free Legal Aid Scheme (CG SLSA)",              hi: "निःशुल्क विधिक सहायता योजना (CG SLSA)" },
    benefit: { en: "Free lawyer, court representation & legal advice for BPL, SC/ST, women, disabled & children", hi: "बीपीएल, SC/ST, महिला, दिव्यांग व बच्चों को मुफ्त वकील, अदालत प्रतिनिधित्व व कानूनी सलाह" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 15000,
    apply:   { en: "cgslsa.gov.in", hi: "cgslsa.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL/Caste/Disability Certificate (any applicable)","Case Details / FIR Copy (if any)"],
               hi: ["आधार कार्ड","बीपीएल/जाति/दिव्यांगता प्रमाण (जो लागू हो)","मामले का विवरण/FIR की प्रति (यदि हो)"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  // ── Animal Husbandry ───────────────────────────────────────────────────────

  {
    id: "cg_pashu_bima",
    icon: "🐄", color: "#065F46", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Animal Husbandry Dept.", hi: "छत्तीसगढ़ पशुपालन विभाग" },
    name:    { en: "Mukhyamantri Pashu Swasthya Evam Bima Yojana", hi: "मुख्यमंत्री पशु स्वास्थ्य एवं बीमा योजना" },
    benefit: { en: "Free veterinary treatment + livestock insurance up to ₹40,000/animal for cattle, goat & poultry", hi: "मवेशी, बकरी व मुर्गीपालन के लिए मुफ्त पशु चिकित्सा + ₹40,000/पशु बीमा" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 40000,
    apply:   { en: "ahvs.cg.gov.in", hi: "ahvs.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Animal Tag/Ear Tag Number","Bank Passbook","Domicile Certificate","BPL/Income Certificate"],
               hi: ["आधार कार्ड","पशु टैग/कान का नम्बर","बैंक पासबुक","निवास प्रमाण पत्र","बीपीएल/आय प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "farmer" || a.area === "rural"),
  },

  {
    id: "cg_backyard_poultry",
    icon: "🐔", color: "#92400E", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Animal Husbandry Dept.", hi: "छत्तीसगढ़ पशुपालन विभाग" },
    name:    { en: "Mukhyamantri Backyard Poultry Scheme",         hi: "मुख्यमंत्री बाड़ी कुक्कुट पालन योजना" },
    benefit: { en: "BPL tribal families get 40 improved-breed chicks + feed + cage free of cost", hi: "बीपीएल जनजाति परिवारों को 40 उन्नत नस्ल के चूजे + दाना + पिंजरा निःशुल्क" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 8000,
    apply:   { en: "ahvs.cg.gov.in", hi: "ahvs.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Tribal (ST) Certificate","Domicile Certificate"],
               hi: ["आधार कार्ड","बीपीएल राशन कार्ड","जनजाति (ST) प्रमाण पत्र","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── Road & Transport ───────────────────────────────────────────────────────

  {
    id: "cg_mahtari_dular",
    icon: "🚌", color: "#1D4ED8", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Transport Dept.", hi: "छत्तीसगढ़ परिवहन विभाग" },
    name:    { en: "Mahtari Dular Yojana (Free Bus Pass)",         hi: "महतारी दुलार योजना (निःशुल्क बस पास)" },
    benefit: { en: "Free state roadways bus pass for school children (orphans/COVID-affected families)", hi: "अनाथ / COVID-प्रभावित परिवारों के स्कूली बच्चों को निःशुल्क राज्य बस पास" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 6000,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Death Certificate of Parent (COVID/any)","School Enrollment Proof","Domicile Certificate"],
               hi: ["आधार कार्ड","माता/पिता का मृत्यु प्रमाण पत्र","स्कूल नामांकन प्रमाण","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "student" || a.age === "below18"),
  },

  // ── Herbal & Organic Farming ───────────────────────────────────────────────

  {
    id: "cg_herbal_village",
    icon: "🌿", color: "#4D7C0F", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Ayush Dept.", hi: "छत्तीसगढ़ आयुष विभाग" },
    name:    { en: "Chhattisgarh Herbal Village Yojana",           hi: "छत्तीसगढ़ हर्बल ग्राम योजना" },
    benefit: { en: "Villages get free medicinal plant saplings + cultivation training + MSP buyback for herbal produce", hi: "गांवों को मुफ्त औषधीय पौधे + खेती प्रशिक्षण + हर्बल उत्पाद की MSP पर खरीद" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 20000,
    apply:   { en: "cgayush.gov.in", hi: "cgayush.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Record","Village Gram Sabha Certificate","Bank Passbook"],
               hi: ["आधार कार्ड","भूमि अभिलेख","ग्राम सभा प्रमाण पत्र","बैंक पासबुक"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "cg_organic_farming",
    icon: "🥦", color: "#365314", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Agriculture Dept.", hi: "छत्तीसगढ़ कृषि विभाग" },
    name:    { en: "Paramparagat Krishi Vikas Yojana – CG (PKVY)", hi: "परम्परागत कृषि विकास योजना – छत्तीसगढ़ (PKVY)" },
    benefit: { en: "₹50,000/hectare over 3 years for certified organic farming clusters", hi: "प्रमाणित जैविक खेती समूहों को 3 वर्षों में ₹50,000/हेक्टेयर सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 16667,
    apply:   { en: "https://https://agri.cg.gov.in", hi: "agri.cg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Record (B1/P2)","Farmer Registration","Bank Passbook","Cluster Group Registration"],
               hi: ["आधार कार्ड","भूमि अभिलेख (B1/P2)","किसान पंजीयन","बैंक पासबुक","क्लस्टर समूह पंजीयन"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer",
  },

  // ── Micro-Finance & Insurance ──────────────────────────────────────────────

  {
    id: "cg_jeevan_jyoti_cg",
    icon: "🛡️", color: "#1E40AF", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Finance Dept.", hi: "छत्तीसगढ़ वित्त विभाग" },
    name:    { en: "Mukhyamantri Jan Dhan Jeevan Bima (CG)",       hi: "मुख्यमंत्री जन धन जीवन बीमा (छत्तीसगढ़)" },
    benefit: { en: "₹2 Lakh life insurance coverage at just ₹12/year premium for BPL/APL families", hi: "बीपीएल/एपीएल परिवारों को मात्र ₹12/वर्ष प्रीमियम पर ₹2 लाख जीवन बीमा" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 200000,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Bank Account (Jan Dhan)","Ration Card","Domicile Certificate"],
               hi: ["आधार कार्ड","बैंक खाता (जन धन)","राशन कार्ड","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && ["below1","1to3"].includes(a.income),
  },

  // ── Urban Poor & Slum ──────────────────────────────────────────────────────

  {
    id: "cg_slum_upgradation",
    icon: "🏘️", color: "#7C3AED", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Urban Administration Dept.", hi: "छत्तीसगढ़ नगरीय प्रशासन विभाग" },
    name:    { en: "Mukhyamantri Slum Swasthya Evam Suvidha Yojana", hi: "मुख्यमंत्री स्लम स्वास्थ्य एवं सुविधा योजना" },
    benefit: { en: "Free mobile health unit visits + sanitation infrastructure + skill training for slum dwellers", hi: "झुग्गी बस्ती निवासियों को मुफ्त मोबाइल स्वास्थ्य यूनिट + स्वच्छता अधोसंरचना + कौशल प्रशिक्षण" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 10000,
    apply:   { en: "cgurban.gov.in", hi: "cgurban.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Slum/Urban Residence Proof","Income Certificate","Ration Card"],
               hi: ["आधार कार्ड","झुग्गी/शहरी निवास प्रमाण","आय प्रमाण पत्र","राशन कार्ड"] },
    match: (a) => a.state === "Chhattisgarh" && a.area === "urban" && ["below1","1to3"].includes(a.income),
  },

  // ── Accident & Emergency ───────────────────────────────────────────────────

  {
    id: "cg_108_ambulance",
    icon: "🚑", color: "#B91C1C", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Health & Family Welfare Dept.", hi: "छत्तीसगढ़ स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "108 Emergency Ambulance & 102 Maternity Service (CG)", hi: "108 आपातकालीन एम्बुलेंस और 102 जननी एक्सप्रेस (छत्तीसगढ़)" },
    benefit: { en: "Free 24×7 emergency ambulance (108) + free maternity transport (102) to hospital anywhere in CG", hi: "छत्तीसगढ़ में कहीं भी 24×7 मुफ्त आपात एम्बुलेंस (108) + प्रसव हेतु जननी एक्सप्रेस (102)" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "Call 108 / 102", hi: "108 / 102 डायल करें" }, applyType: "offline",
    docs:    { en: ["No documents required — call 108 or 102"],
               hi: ["कोई दस्तावेज नहीं — बस 108 या 102 डायल करें"] },
    match: (a) => a.state === "Chhattisgarh",
  },

  // ── Micro-Irrigation ───────────────────────────────────────────────────────

  {
    id: "cg_drip_sprinkler",
    icon: "💦", color: "#0369A1", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Agriculture Dept.", hi: "छत्तीसगढ़ कृषि विभाग" },
    name:    { en: "Pradhan Mantri Krishi Sinchai Yojana – CG (Drip/Sprinkler)", hi: "प्रधानमंत्री कृषि सिंचाई योजना – छत्तीसगढ़ (ड्रिप/स्प्रिंकलर)" },
    benefit: { en: "55–75% subsidy on drip & sprinkler irrigation systems for small & marginal farmers", hi: "लघु व सीमांत किसानों को ड्रिप/स्प्रिंकलर सिंचाई पर 55–75% सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 75000,
    apply:   { en: "https://https://agri.cg.gov.in", hi: "agri.cg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Record (B1/P2)","Farmer Registration","Bank Passbook","Water Source Proof"],
               hi: ["आधार कार्ड","भूमि अभिलेख (B1/P2)","किसान पंजीयन","बैंक पासबुक","जल स्रोत प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer",
  },

  // ── SC/ST Housing ──────────────────────────────────────────────────────────

  {
    id: "cg_sc_aawas",
    icon: "🏡", color: "#7E22CE", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh SC/ST Welfare Dept.", hi: "छत्तीसगढ़ अनुसूचित जाति/जनजाति विकास विभाग" },
    name:    { en: "Dr. B.R. Ambedkar Aawas Yojana (CG)",          hi: "डॉ. भीमराव अम्बेडकर आवास योजना (छत्तीसगढ़)" },
    benefit: { en: "₹1.20 Lakh housing grant for SC families without a pucca house", hi: "पक्का मकान न होने पर SC परिवारों को ₹1.20 लाख आवास अनुदान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 120000,
    apply:   { en: "tribal.cg.gov.in", hi: "tribal.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","BPL Ration Card","Land Document","Bank Passbook","No Pucca House Declaration"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","बीपीएल राशन कार्ड","जमीन के कागज","बैंक पासबुक","पक्का मकान न होने का घोषणा पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  },

  // ── Mid-Day Meal & Nutrition ───────────────────────────────────────────────

  {
    id: "cg_mid_day_meal",
    icon: "🍛", color: "#CA8A04", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh School Education Dept.", hi: "छत्तीसगढ़ स्कूल शिक्षा विभाग" },
    name:    { en: "PM Poshan Abhiyan (Mid-Day Meal) – CG",         hi: "PM पोषण अभियान (मध्याह्न भोजन) – छत्तीसगढ़" },
    benefit: { en: "Free hot cooked meal every school day for all students (Class 1–8) in govt schools", hi: "सरकारी स्कूल के कक्षा 1–8 के सभी छात्रों को हर विद्यालय दिवस मुफ्त गर्म भोजन" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 3000,
    apply:   { en: "schooleducation.cg.gov.in", hi: "schooleducation.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["School Enrollment Proof","Aadhaar Card (student)"],
               hi: ["विद्यालय नामांकन प्रमाण","आधार कार्ड (छात्र)"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "student" || a.age === "below18"),
  },

  // ── Bee-Keeping & Sericulture ──────────────────────────────────────────────

  {
    id: "cg_madhumakhi_palan",
    icon: "🐝", color: "#D97706", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Horticulture Dept.", hi: "छत्तीसगढ़ उद्यानिकी विभाग" },
    name:    { en: "Mukhyamantri Madhumakhi Palan Yojana",          hi: "मुख्यमंत्री मधुमक्खी पालन योजना" },
    benefit: { en: "Free bee-boxes (10 units), tool kit & training to rural families for honey production", hi: "ग्रामीण परिवारों को 10 मधुमक्खी बक्से, उपकरण किट व प्रशिक्षण — शहद उत्पादन हेतु" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 15000,
    apply:   { en: "agri.cg.gov.in", hi: "agri.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Domicile Certificate","Bank Passbook","Income Certificate"],
               hi: ["आधार कार्ड","निवास प्रमाण पत्र","बैंक पासबुक","आय प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "farmer" || a.area === "rural"),
  },

  {
    id: "cg_resham_utpadan",
    icon: "🪡", color: "#9D4EDD", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Sericulture Dept.", hi: "छत्तीसगढ़ रेशम विभाग" },
    name:    { en: "Mukhyamantri Resham Utpadan Yojana",            hi: "मुख्यमंत्री रेशम उत्पादन योजना" },
    benefit: { en: "Free mulberry saplings + silkworm seed + ₹10,000 subsidy for sericulture farmers", hi: "रेशम किसानों को मुफ्त शहतूत पौधे + रेशम कीट बीज + ₹10,000 सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 10000,
    apply:   { en: "cgsericulture.gov.in", hi: "cgsericulture.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Record","Bank Passbook","Domicile Certificate"],
               hi: ["आधार कार्ड","भूमि अभिलेख","बैंक पासबुक","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer" && a.area === "rural",
  },

  // ── MSME & Startup ─────────────────────────────────────────────────────────

  {
    id: "cg_msme_subsidy",
    icon: "🏭", color: "#1D4ED8", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Commerce & Industry Dept.", hi: "छत्तीसगढ़ वाणिज्य एवं उद्योग विभाग" },
    name:    { en: "CG Industrial Policy MSME Capital Subsidy",     hi: "छत्तीसगढ़ औद्योगिक नीति MSME पूंजी सब्सिडी" },
    benefit: { en: "25–40% capital investment subsidy (up to ₹40 Lakh) + 5-year electricity duty exemption for new MSME units", hi: "नई MSME इकाइयों को 25–40% पूंजी निवेश सब्सिडी (₹40 लाख तक) + 5 वर्ष बिजली शुल्क छूट" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 400000,
    apply:   { en: "https://https://industries.cg.gov.in", hi: "industries.cg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","MSME Registration (Udyam)","Project Report","Land/Shed Documents","CA Certificate","Bank Loan Sanction Letter"],
               hi: ["आधार कार्ड","MSME पंजीयन (उद्यम)","प्रोजेक्ट रिपोर्ट","जमीन/शेड दस्तावेज","CA प्रमाण पत्र","बैंक ऋण स्वीकृति पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "business",
  },

  {
    id: "cg_startup_niti",
    icon: "🚀", color: "#6D28D9", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Commerce & Industry Dept.", hi: "छत्तीसगढ़ वाणिज्य एवं उद्योग विभाग" },
    name:    { en: "Chhattisgarh Startup Policy 2021",              hi: "छत्तीसगढ़ स्टार्टअप नीति 2021" },
    benefit: { en: "₹25 Lakh seed fund + mentorship + co-working space + tax exemption for recognized CG startups", hi: "मान्यता प्राप्त CG स्टार्टअप को ₹25 लाख बीज निधि + मेंटरशिप + को-वर्किंग स्पेस + कर छूट" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 2500000,
    apply:   { en: "https://https://startupindia.gov.in", hi: "startupindia.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Company/LLP Registration","Startup India Recognition","Business Plan","Bank Account"],
               hi: ["आधार कार्ड","कंपनी/LLP पंजीयन","स्टार्टअप इंडिया मान्यता","बिजनेस प्लान","बैंक खाता"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  // ── Drug De-addiction & Mental Health ─────────────────────────────────────

  {
    id: "cg_nasha_mukti",
    icon: "🧠", color: "#0F766E", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Social Welfare Dept.", hi: "छत्तीसगढ़ समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Nasha Mukti Yojana",               hi: "मुख्यमंत्री नशा मुक्ति योजना" },
    benefit: { en: "Free residential de-addiction treatment (28-day program) + counselling + post-care support", hi: "मुफ्त आवासीय नशा मुक्ति उपचार (28 दिन) + काउंसलिंग + देखभाल सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 20000,
    apply:   { en: "sw.cg.gov.in", hi: "sw.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Domicile Certificate","Doctor Referral (if any)"],
               hi: ["आधार कार्ड","निवास प्रमाण पत्र","डॉक्टर रेफरल (यदि हो)"] },
    match: (a) => a.state === "Chhattisgarh",
  },

  // ── Road Accident Victim Relief ────────────────────────────────────────────

  {
    id: "cg_road_accident_relief",
    icon: "🩹", color: "#DC2626", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Transport Dept.", hi: "छत्तीसगढ़ परिवहन विभाग" },
    name:    { en: "Mukhyamantri Sadak Durghatna Sahayata Yojana", hi: "मुख्यमंत्री सड़क दुर्घटना सहायता योजना" },
    benefit: { en: "₹1 Lakh ex-gratia to family of road accident fatality; ₹50,000 for permanent disability", hi: "सड़क दुर्घटना में मृत्यु पर परिजनों को ₹1 लाख; स्थायी विकलांगता पर ₹50,000 अनुग्रह राशि" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 100000,
    apply:   { en: "cgstate.gov.in", hi: "cgstate.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","FIR Copy","Post-Mortem / Medical Certificate","Bank Passbook","Domicile Certificate"],
               hi: ["आधार कार्ड","FIR प्रति","पोस्टमार्टम/चिकित्सा प्रमाण पत्र","बैंक पासबुक","निवास प्रमाण"] },
    match: (a) => a.state === "Chhattisgarh",
  },

  // ── Eco-Tourism ────────────────────────────────────────────────────────────

  {
    id: "cg_eco_tourism",
    icon: "🦋", color: "#166534", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Forest Dept. / Tourism Board", hi: "छत्तीसगढ़ वन विभाग / पर्यटन बोर्ड" },
    name:    { en: "CG Eco-Tourism Development Scheme",             hi: "छत्तीसगढ़ इको-पर्यटन विकास योजना" },
    benefit: { en: "Tribal & rural communities get training + infrastructure grants to run forest homestays & eco-camps", hi: "जनजातीय व ग्रामीण समुदायों को वन होमस्टे व इको-कैंप चलाने हेतु प्रशिक्षण + अधोसंरचना अनुदान" },
    tag:     { en: "Business", hi: "व्यवसाय" },
    annual: 50000,
    apply:   { en: "cgtourism.in", hi: "cgtourism.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land/House Ownership Proof","Tribal/Domicile Certificate","Bank Passbook","Gram Sabha NOC"],
               hi: ["आधार कार्ड","जमीन/मकान स्वामित्व प्रमाण","जनजाति/निवास प्रमाण पत्र","बैंक पासबुक","ग्राम सभा NOC"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "business" || a.who === "farmer") && a.area === "rural",
  },

  // ── Rural Connectivity ─────────────────────────────────────────────────────

  {
    id: "cg_wifi_chhattisgarh",
    icon: "📶", color: "#0EA5E9", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh IT & Electronics Dept.", hi: "छत्तीसगढ़ सूचना प्रौद्योगिकी एवं इलेक्ट्रॉनिक्स विभाग" },
    name:    { en: "Mukhyamantri Gramin Internet Seva Yojana",      hi: "मुख्यमंत्री ग्रामीण इंटरनेट सेवा योजना" },
    benefit: { en: "Free Wi-Fi hotspot access at Gram Panchayat offices + subsidised broadband for BPL families in rural CG", hi: "ग्राम पंचायत कार्यालयों पर मुफ्त Wi-Fi + ग्रामीण BPL परिवारों को सब्सिडी वाला ब्रॉडबैंड" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 3600,
    apply:   { en: "chips.gov.in", hi: "chips.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Domicile Certificate"],
               hi: ["आधार कार्ड","बीपीएल राशन कार्ड","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && a.area === "rural",
  },

  // ── CM Relief Fund ─────────────────────────────────────────────────────────

  {
    id: "cg_cm_relief_fund",
    icon: "🆘", color: "#B91C1C", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Chief Minister's Office", hi: "छत्तीसगढ़ मुख्यमंत्री कार्यालय" },
    name:    { en: "Mukhyamantri Sahayata Kosh (CM Relief Fund)",  hi: "मुख्यमंत्री सहायता कोष (CM राहत निधि)" },
    benefit: { en: "Emergency financial aid (₹5,000–₹2 Lakh) for natural calamity, serious illness or fire accident victims", hi: "प्राकृतिक आपदा, गंभीर बीमारी या अग्निकांड पीड़ितों को ₹5,000–₹2 लाख आपात सहायता" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 200000,
    apply:   { en: "cmrelief.cg.gov.in", hi: "cmrelief.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Application Letter (to CM)","Proof of Loss (Medical/Calamity Certificate)","Bank Passbook","Domicile Certificate"],
               hi: ["आधार कार्ड","आवेदन पत्र (मुख्यमंत्री को)","नुकसान का प्रमाण (चिकित्सा/आपदा प्रमाण पत्र)","बैंक पासबुक","निवास प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh",
  },

  // ── Old Age Home & Destitute Care ──────────────────────────────────────────

  {
    id: "cg_vriddha_ashram",
    icon: "🏠", color: "#78350F", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Social Welfare Dept.", hi: "छत्तीसगढ़ समाज कल्याण विभाग" },
    name:    { en: "Vriddha Ashram Yojana (Old Age Home – CG)",    hi: "वृद्धाश्रम योजना (वृद्ध आश्रम – छत्तीसगढ़)" },
    benefit: { en: "Free residential care (food, shelter, medical) for destitute senior citizens at state-run old age homes", hi: "राज्य संचालित वृद्धाश्रमों में निराश्रित वरिष्ठ नागरिकों को मुफ्त आवास, भोजन व चिकित्सा" },
    tag:     { en: "Senior", hi: "वरिष्ठ नागरिक" },
    annual: 36000,
    apply:   { en: "sw.cg.gov.in", hi: "sw.cg.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Age Proof (60+ years)","No Family Support Declaration","Income Certificate (nil/low)","Medical Certificate"],
               hi: ["आधार कार्ड","आयु प्रमाण (60+ वर्ष)","परिवार सहारा न होने का घोषणा पत्र","आय प्रमाण (शून्य/कम)","चिकित्सा प्रमाण पत्र"] },
    match: (a) => a.state === "Chhattisgarh" && (a.who === "senior" || a.age === "above60") && a.income === "below1",
  },

];
