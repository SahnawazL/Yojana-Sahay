// Haryana — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "haryana_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const HARYANA_SCHEMES = [

  {
    id: "haryana_saksham",
    icon: "💼", color: "#4338CA", scope: "state", state: "Haryana",
    ministry: { en: "Haryana Employment Dept.", hi: "हरियाणा रोजगार विभाग" },
    name:    { en: "Saksham Yuva Scheme (Haryana)",       hi: "सक्षम युवा योजना (हरियाणा)" },
    benefit: { en: "₹9,000/month allowance for graduates", hi: "स्नातक युवाओं को ₹9,000/माह भत्ता" },
    tag:     { en: "Youth / Student", hi: "युवा / छात्र" },
    annual: 108000,
    apply:   { en: "https://hreyahs.gov.in", hi: "hreyahs.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Graduation Certificate","Domicile Certificate","Bank Account"],
               hi: ["आधार कार्ड","स्नातक प्रमाण","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Haryana" && (a.who === "student" || a.who === "general") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_mmpsy",
    icon: "🛡️", color: "#0F766E", scope: "state", state: "Haryana",
    ministry: { en: "Haryana Govt. / Finance Dept.", hi: "हरियाणा सरकार / वित्त विभाग" },
    name:    { en: "Mukhyamantri Parivar Samridhi Yojana",    hi: "मुख्यमंत्री परिवार समृद्धि योजना" },
    benefit: { en: "₹6,000/year · Social security (insurance + pension) for EWS families", hi: "₹6,000/वर्ष · ईडब्ल्यूएस परिवारों को बीमा + पेंशन सुरक्षा" },
    tag:     { en: "Social Security / Insurance", hi: "सामाजिक सुरक्षा / बीमा" },
    annual: 6000,
    apply:   { en: "cm-psy.haryana.gov.in", hi: "cm-psy.haryana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Parivar Pehchan Patra (PPP)","Income Certificate (≤₹1.80 Lakh/year)","Bank Account"],
               hi: ["आधार कार्ड","परिवार पहचान पत्र (PPP)","आय प्रमाण (≤₹1.80 लाख/वर्ष)","बैंक खाता"] },
    // Eligibility: Haryana resident, family income ≤ ₹1.80 lakh/year, age 18–50
    match: (a) => a.state === "Haryana" && ["below1"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "haryana_old_age_allowance",
    icon: "👴", color: "#FF9933", scope: "state", state: "Haryana",
    ministry: { en: "Social Justice & Empowerment Dept., Haryana", hi: "सामाजिक न्याय एवं अधिकारिता विभाग, हरियाणा" },
    name:    { en: "Haryana Old Age Samman Allowance",    hi: "हरियाणा वृद्धावस्था सम्मान भत्ता" },
    benefit: { en: "₹3,000/month pension for senior citizens 60+", hi: "60+ वरिष्ठ नागरिकों को ₹3,000/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 36000,
    apply:   { en: "socialjusticehry.gov.in", hi: "socialjusticehry.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (birth certificate / voter ID)","Parivar Pehchan Patra","Bank Account","Income Certificate"],
               hi: ["आधार कार्ड","आयु प्रमाण (जन्म प्रमाण / मतदाता पहचान पत्र)","परिवार पहचान पत्र","बैंक खाता","आय प्रमाण पत्र"] },
    // Eligibility: Haryana resident, age 60+, family income ≤ ₹3 lakh/year
    match: (a) => a.state === "Haryana" && a.age === "above60" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_widow_allowance",
    icon: "👩", color: "#BE185D", scope: "state", state: "Haryana",
    ministry: { en: "Social Justice & Empowerment Dept., Haryana", hi: "सामाजिक न्याय एवं अधिकारिता विभाग, हरियाणा" },
    name:    { en: "Haryana Widow & Destitute Women Allowance",    hi: "हरियाणा विधवा एवं निराश्रित महिला भत्ता" },
    benefit: { en: "₹3,000/month financial assistance for widows/destitute women", hi: "विधवा/निराश्रित महिलाओं को ₹3,000/माह सहायता" },
    tag:     { en: "Women / Widow Pension", hi: "महिला / विधवा पेंशन" },
    annual: 36000,
    apply:   { en: "socialjusticehry.gov.in", hi: "socialjusticehry.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Husband's Death Certificate (for widow)","Parivar Pehchan Patra","Bank Account","Income Certificate"],
               hi: ["आधार कार्ड","पति का मृत्यु प्रमाण पत्र (विधवा के लिए)","परिवार पहचान पत्र","बैंक खाता","आय प्रमाण पत्र"] },
    // Eligibility: Haryana resident widow/destitute woman, income ≤ ₹3 lakh/year
    match: (a) => a.state === "Haryana" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_vivah_shagun",
    icon: "💍", color: "#DB2777", scope: "state", state: "Haryana",
    ministry: { en: "Welfare of SC & BC Dept., Haryana", hi: "अनुसूचित जाति एवं पिछड़ा वर्ग कल्याण विभाग, हरियाणा" },
    name:    { en: "Mukhyamantri Vivah Shagun Yojana",    hi: "मुख्यमंत्री विवाह शगुन योजना" },
    benefit: { en: "₹71,000 marriage grant for SC/ST/BPL girls · ₹31,000 for general poor families", hi: "SC/ST/BPL लड़कियों को ₹71,000 विवाह अनुदान · सामान्य गरीब को ₹31,000" },
    tag:     { en: "Women / Marriage Grant", hi: "महिला / विवाह अनुदान" },
    annual: 71000,
    apply:   { en: "haryanascbc.gov.in", hi: "haryanascbc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC/ST/OBC)","BPL Certificate (if applicable)","Age Proof of Bride (18+)","Marriage Certificate","Bank Account"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC/ST/OBC)","बीपीएल प्रमाण (यदि लागू हो)","दुल्हन का आयु प्रमाण (18+)","विवाह प्रमाण पत्र","बैंक खाता"] },
    // Eligibility: Haryana resident, girl from SC/ST/BPL/general poor family, bride age ≥ 18
    match: (a) => a.state === "Haryana" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_bhavantar",
    icon: "🌽", color: "#15803D", scope: "state", state: "Haryana",
    ministry: { en: "Agriculture & Farmers Welfare Dept., Haryana", hi: "कृषि एवं किसान कल्याण विभाग, हरियाणा" },
    name:    { en: "Bhavantar Bharpai Yojana (Haryana)",    hi: "भावांतर भरपाई योजना (हरियाणा)" },
    benefit: { en: "Price deficiency compensation when market price falls below MSP for vegetables/fruits", hi: "सब्जी/फल का बाजार मूल्य MSP से कम होने पर मूल्य अंतर मुआवजा" },
    tag:     { en: "Farmer / Price Support", hi: "किसान / मूल्य समर्थन" },
    annual: 0,
    apply:   { en: "ekharid.haryana.gov.in", hi: "ekharid.haryana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra/Girdawari)","Parivar Pehchan Patra","Bank Account","Meri Fasal Mera Byora Registration"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खसरा/गिरदावरी)","परिवार पहचान पत्र","बैंक खाता","मेरी फसल मेरा ब्यौरा पंजीकरण"] },
    // Eligibility: Haryana farmer registered on Meri Fasal Mera Byora portal
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_chirayu",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Haryana",
    ministry: { en: "Health Dept., Haryana", hi: "स्वास्थ्य विभाग, हरियाणा" },
    name:    { en: "Chirayu Ayushman Haryana Yojana",    hi: "चिरायु आयुष्मान हरियाणा योजना" },
    benefit: { en: "₹5 Lakh/year free health coverage · Extends Ayushman Bharat to families earning ₹1.80–₹3 Lakh", hi: "₹5 लाख/वर्ष मुफ्त स्वास्थ्य बीमा · ₹1.80–₹3 लाख आय परिवारों तक आयुष्मान का विस्तार" },
    tag:     { en: "Health / Insurance", hi: "स्वास्थ्य / बीमा" },
    annual: 500000,
    apply:   { en: "chirayuhry.com", hi: "chirayuhry.com" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Parivar Pehchan Patra (PPP)","Income Certificate (₹1.80L–₹3L/year)","Ration Card"],
               hi: ["आधार कार्ड","परिवार पहचान पत्र (PPP)","आय प्रमाण (₹1.80–₹3 लाख/वर्ष)","राशन कार्ड"] },
    // Eligibility: Haryana resident, family income ₹1.80L–₹3L/year (above PMJAY cut-off)
    match: (a) => a.state === "Haryana" && ["1to3"].includes(a.income),
  },

  {
    id: "haryana_ambedkar_awas",
    icon: "🏠", color: "#7C3AED", scope: "state", state: "Haryana",
    ministry: { en: "Welfare of SC & BC Dept., Haryana", hi: "अनुसूचित जाति एवं पिछड़ा वर्ग कल्याण विभाग, हरियाणा" },
    name:    { en: "Dr. Ambedkar Awas Navinikaran Yojana",    hi: "डॉ. अम्बेडकर आवास नवीनीकरण योजना" },
    benefit: { en: "₹80,000 grant for house repair/renovation for SC families", hi: "SC परिवारों को घर की मरम्मत/नवीनीकरण के लिए ₹80,000 अनुदान" },
    tag:     { en: "Housing / SC Welfare", hi: "आवास / SC कल्याण" },
    annual: 80000,
    apply:   { en: "haryanascbc.gov.in", hi: "haryanascbc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","Land/House Ownership Proof","Parivar Pehchan Patra","Bank Account","Income Certificate (≤₹1.80 Lakh/year)"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","भूमि/घर का स्वामित्व प्रमाण","परिवार पहचान पत्र","बैंक खाता","आय प्रमाण (≤₹1.80 लाख/वर्ष)"] },
    // Eligibility: Haryana SC family, owns land/house but it needs repair, income ≤ ₹1.80 lakh
    match: (a) => a.state === "Haryana" && ["below1"].includes(a.income) && ["yes","kutcha"].includes(a.house),
  },

  {
    id: "haryana_disability_allowance",
    icon: "🦽", color: "#6366F1", scope: "state", state: "Haryana",
    ministry: { en: "Social Justice & Empowerment Dept., Haryana", hi: "सामाजिक न्याय एवं अधिकारिता विभाग, हरियाणा" },
    name:    { en: "Haryana Disability Allowance",    hi: "हरियाणा दिव्यांग भत्ता" },
    benefit: { en: "₹3,000/month for persons with ≥ 60% disability", hi: "≥60% दिव्यांगता वाले व्यक्तियों को ₹3,000/माह" },
    tag:     { en: "Disability / Allowance", hi: "दिव्यांगता / भत्ता" },
    annual: 36000,
    apply:   { en: "socialjusticehry.gov.in", hi: "socialjusticehry.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Disability Certificate (≥60% from CMO/Civil Surgeon)","Parivar Pehchan Patra","Bank Account","Income Certificate"],
               hi: ["आधार कार्ड","दिव्यांगता प्रमाण पत्र (≥60% CMO/सिविल सर्जन से)","परिवार पहचान पत्र","बैंक खाता","आय प्रमाण पत्र"] },
    // Eligibility: Haryana resident, ≥60% disability, income ≤ ₹3 lakh/year
    match: (a) => a.state === "Haryana" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_pashudhan_bima",
    icon: "🐄", color: "#92400E", scope: "state", state: "Haryana",
    ministry: { en: "Animal Husbandry & Dairying Dept., Haryana", hi: "पशुपालन एवं डेयरी विभाग, हरियाणा" },
    name:    { en: "Pashudhan Bima Yojana (Haryana)",    hi: "पशुधन बीमा योजना (हरियाणा)" },
    benefit: { en: "Livestock insurance at 50% subsidised premium (70% for SC/ST/BPL farmers)", hi: "50% सब्सिडी पर पशुधन बीमा (SC/ST/BPL को 70% सब्सिडी)" },
    tag:     { en: "Farmer / Livestock Insurance", hi: "किसान / पशुधन बीमा" },
    annual: 0,
    apply:   { en: "pashudhanharyana.gov.in", hi: "pashudhanharyana.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Livestock Ownership Proof","Parivar Pehchan Patra","Bank Account","Caste Certificate (SC/ST for higher subsidy)","Passport Photo of Animal (ear-tagged)"],
               hi: ["आधार कार्ड","पशु स्वामित्व प्रमाण","परिवार पहचान पत्र","बैंक खाता","जाति प्रमाण पत्र (SC/ST अधिक सब्सिडी के लिए)","पशु की कान-टैग फोटो"] },
    // Eligibility: Haryana farmer owning cattle/buffalo/sheep/goat
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_antyodaya",
    icon: "🌟", color: "#D97706", scope: "state", state: "Haryana",
    ministry: { en: "Development & Panchayats Dept., Haryana", hi: "विकास एवं पंचायत विभाग, हरियाणा" },
    name:    { en: "Antyodaya Parivar Utthan Yojana (Haryana)",    hi: "अंत्योदय परिवार उत्थान योजना (हरियाणा)" },
    benefit: { en: "Skill training + livelihood support targeting poorest 1 lakh families (income < ₹1 Lakh/year)", hi: "सबसे गरीब 1 लाख परिवारों को कौशल प्रशिक्षण + आजीविका सहायता (आय <₹1 लाख/वर्ष)" },
    tag:     { en: "Livelihood / Skill", hi: "आजीविका / कौशल" },
    annual: 0,
    apply:   { en: "antyodaya.haryana.gov.in", hi: "antyodaya.haryana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Parivar Pehchan Patra (PPP)","Income Certificate (< ₹1 Lakh/year)","Bank Account"],
               hi: ["आधार कार्ड","परिवार पहचान पत्र (PPP)","आय प्रमाण (<₹1 लाख/वर्ष)","बैंक खाता"] },
    // Eligibility: Haryana resident, identified as poorest family via PPP, income < ₹1 lakh/year
    match: (a) => a.state === "Haryana" && ["below1"].includes(a.income),
  },

  {
    id: "haryana_meri_fasal",
    icon: "🌾", color: "#166534", scope: "state", state: "Haryana",
    ministry: { en: "Agriculture & Farmers Welfare Dept., Haryana", hi: "कृषि एवं किसान कल्याण विभाग, हरियाणा" },
    name:    { en: "Meri Fasal Mera Byora (Haryana)",    hi: "मेरी फसल मेरा ब्यौरा (हरियाणा)" },
    benefit: { en: "₹10/quintal bonus on registered crop sale + eligibility for crop damage compensation & MSP procurement", hi: "पंजीकृत फसल बिक्री पर ₹10/क्विंटल बोनस + फसल नुकसान मुआवजे और MSP खरीद की पात्रता" },
    tag:     { en: "Farmer / Crop Registration", hi: "किसान / फसल पंजीकरण" },
    annual: 0,
    apply:   { en: "fasal.haryana.gov.in", hi: "fasal.haryana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra/Jamabandi)","Bank Account","Mobile Number linked to Aadhaar"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खसरा/जमाबंदी)","बैंक खाता","आधार से जुड़ा मोबाइल नंबर"] },
    // Eligibility: Any Haryana farmer who wants to sell crop at MSP or claim crop damage compensation
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_mahila_samridhi",
    icon: "👩‍💼", color: "#9D174D", scope: "state", state: "Haryana",
    ministry: { en: "Haryana SC & BC Finance & Dev. Corp. (HSFDC)", hi: "हरियाणा अनुसूचित जाति एवं पिछड़ा वर्ग वित्त एवं विकास निगम (HSFDC)" },
    name:    { en: "Mahila Samridhi Yojana (Haryana)",    hi: "महिला समृद्धि योजना (हरियाणा)" },
    benefit: { en: "Loan up to ₹60,000 at 5% interest/year for SC women self-employment", hi: "SC महिलाओं को स्वरोजगार के लिए 5% ब्याज पर ₹60,000 तक का ऋण" },
    tag:     { en: "Women / SC Self-Employment", hi: "महिला / SC स्वरोजगार" },
    annual: 0,
    apply:   { en: "hsfdc.org.in", hi: "hsfdc.org.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","Business/Activity Plan","Parivar Pehchan Patra","Bank Account","Income Certificate (≤₹3 Lakh/year)","Passport Photo"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","व्यवसाय/गतिविधि योजना","परिवार पहचान पत्र","बैंक खाता","आय प्रमाण (≤₹3 लाख/वर्ष)","पासपोर्ट फोटो"] },
    // Eligibility: Haryana SC woman, age 18–55, income ≤ ₹3 lakh/year
    match: (a) => a.state === "Haryana" && a.who === "women" && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "haryana_pratibha",
    icon: "🏆", color: "#1D4ED8", scope: "state", state: "Haryana",
    ministry: { en: "Welfare of SC & BC Dept., Haryana", hi: "अनुसूचित जाति एवं पिछड़ा वर्ग कल्याण विभाग, हरियाणा" },
    name:    { en: "Pratibha Protsahan Yojana (Haryana)",    hi: "प्रतिभा प्रोत्साहन योजना (हरियाणा)" },
    benefit: { en: "₹8,000 (Class 10) · ₹10,000 (Class 12) · Up to ₹1,00,000 for IIT/Medical admission — for SC/BC meritorious students", hi: "SC/BC मेधावी छात्रों को ₹8,000 (कक्षा 10) · ₹10,000 (कक्षा 12) · IIT/मेडिकल प्रवेश पर ₹1,00,000 तक" },
    tag:     { en: "Student / Merit Scholarship", hi: "छात्र / मेरिट छात्रवृत्ति" },
    annual: 10000,
    apply:   { en: "haryanascbc.gov.in", hi: "haryanascbc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC/BC Caste Certificate","Mark Sheet (Class 10 / 12 Board)","Admission Letter (for IIT/Medical)","Bank Account","Domicile Certificate"],
               hi: ["आधार कार्ड","SC/BC जाति प्रमाण पत्र","मार्कशीट (कक्षा 10/12 बोर्ड)","प्रवेश पत्र (IIT/मेडिकल के लिए)","बैंक खाता","निवास प्रमाण पत्र"] },
    // Eligibility: Haryana SC/BC student with 60%+ in board exams or admitted to IIT/Medical college
    match: (a) => a.state === "Haryana" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "haryana_e_karma",
    icon: "💻", color: "#0E7490", scope: "state", state: "Haryana",
    ministry: { en: "Higher Education Dept., Haryana", hi: "उच्च शिक्षा विभाग, हरियाणा" },
    name:    { en: "E-Karma Scheme (Haryana)",    hi: "ई-कर्मा योजना (हरियाणा)" },
    benefit: { en: "Free 4–6 week freelancing & IT skills training at college + ₹3,000/month stipend during training", hi: "कॉलेज में 4–6 सप्ताह मुफ्त फ्रीलांसिंग और IT कौशल प्रशिक्षण + ₹3,000/माह वजीफा" },
    tag:     { en: "Youth / IT Skills", hi: "युवा / IT कौशल" },
    annual: 9000,
    apply:   { en: "ekarmaindia.com", hi: "ekarmaindia.com" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","College Enrollment Certificate","Bank Account","Domicile Certificate (Haryana)"],
               hi: ["आधार कार्ड","कॉलेज नामांकन प्रमाण पत्र","बैंक खाता","निवास प्रमाण पत्र (हरियाणा)"] },
    // Eligibility: Haryana college student (UG/PG), enrolled in affiliated college
    match: (a) => a.state === "Haryana" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income) && ["18to35"].includes(a.age),
  },

  {
    id: "haryana_solar_pump",
    icon: "☀️", color: "#B45309", scope: "state", state: "Haryana",
    ministry: { en: "Haryana Renewable Energy Dev. Agency (HAREDA)", hi: "हरियाणा नवीकरणीय ऊर्जा विकास एजेंसी (HAREDA)" },
    name:    { en: "Solar Pump Yojana (Haryana)",    hi: "सोलर पंप योजना (हरियाणा)" },
    benefit: { en: "75% subsidy on solar water pump (90% for SC/ST farmers) under PM-KUSUM component-B", hi: "सोलर वाटर पंप पर 75% सब्सिडी (SC/ST किसानों को 90%) PM-KUSUM कंपोनेंट-B अंतर्गत" },
    tag:     { en: "Farmer / Solar Energy", hi: "किसान / सौर ऊर्जा" },
    annual: 0,
    apply:   { en: "hareda.gov.in", hi: "hareda.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra)","Electricity Bill (existing pump connection)","Bank Account","Caste Certificate (SC/ST for higher subsidy)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खसरा)","बिजली बिल (मौजूदा पंप कनेक्शन)","बैंक खाता","जाति प्रमाण पत्र (SC/ST अधिक सब्सिडी के लिए)"] },
    // Eligibility: Haryana farmer with agricultural land & existing pump connection
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_manohar_jyoti",
    icon: "🔆", color: "#CA8A04", scope: "state", state: "Haryana",
    ministry: { en: "Haryana Renewable Energy Dev. Agency (HAREDA)", hi: "हरियाणा नवीकरणीय ऊर्जा विकास एजेंसी (HAREDA)" },
    name:    { en: "Manohar Jyoti Yojana (Haryana)",    hi: "मनोहर ज्योति योजना (हरियाणा)" },
    benefit: { en: "₹15,000 subsidy on solar home lighting system (80W panel + 40Ah battery + 3 LED lights)", hi: "सोलर होम लाइटिंग सिस्टम पर ₹15,000 सब्सिडी (80W पैनल + 40Ah बैटरी + 3 LED बल्ब)" },
    tag:     { en: "Energy / Solar Subsidy", hi: "ऊर्जा / सोलर सब्सिडी" },
    annual: 15000,
    apply:   { en: "hareda.gov.in", hi: "hareda.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Parivar Pehchan Patra","Domicile Certificate (Haryana)","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","परिवार पहचान पत्र","निवास प्रमाण पत्र (हरियाणा)","बैंक खाता","पासपोर्ट फोटो"] },
    // Eligibility: Haryana resident household, priority to BPL/rural without grid electricity
    match: (a) => a.state === "Haryana" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_swarna_jayanti",
    icon: "🥇", color: "#7C2D12", scope: "state", state: "Haryana",
    ministry: { en: "Welfare of SC & BC Dept., Haryana", hi: "अनुसूचित जाति एवं पिछड़ा वर्ग कल्याण विभाग, हरियाणा" },
    name:    { en: "Swarna Jayanti Anusuchit Jaati Utthan Yojana",    hi: "स्वर्ण जयंती अनुसूचित जाति उत्थान योजना" },
    benefit: { en: "Interest-free loan up to ₹5 Lakh for SC youth to start new business/enterprise", hi: "SC युवाओं को नया व्यवसाय शुरू करने के लिए ₹5 लाख तक ब्याज मुक्त ऋण" },
    tag:     { en: "Business / SC Youth Loan", hi: "व्यापार / SC युवा ऋण" },
    annual: 0,
    apply:   { en: "haryanascbc.gov.in", hi: "haryanascbc.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","Business Project Report","Parivar Pehchan Patra","Bank Account","Income Certificate (≤₹3 Lakh/year)","Educational Certificate"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","व्यवसाय परियोजना रिपोर्ट","परिवार पहचान पत्र","बैंक खाता","आय प्रमाण (≤₹3 लाख/वर्ष)","शैक्षणिक प्रमाण पत्र"] },
    // Eligibility: Haryana SC youth, age 18–45, income ≤ ₹3 lakh/year
    match: (a) => a.state === "Haryana" && (a.who === "business" || a.who === "general") && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "haryana_ladli",
    icon: "👧", color: "#C026D3", scope: "state", state: "Haryana",
    ministry: { en: "Women & Child Development Dept., Haryana", hi: "महिला एवं बाल विकास विभाग, हरियाणा" },
    name:    { en: "Ladli Social Security Allowance (Haryana)",    hi: "लाड़ली सामाजिक सुरक्षा भत्ता (हरियाणा)" },
    benefit: { en: "₹3,000/month to women aged 45+ who have no son (to support girl child & women with daughters only)", hi: "बिना बेटे वाली 45+ वर्ष की महिलाओं को ₹3,000/माह (बालिका संरक्षण हेतु)" },
    tag:     { en: "Women / Girl Child Support", hi: "महिला / बालिका सहायता" },
    annual: 36000,
    apply:   { en: "socialjusticehry.gov.in", hi: "socialjusticehry.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof","Parivar Pehchan Patra","Bank Account","Affidavit (no male child)","Income Certificate (≤₹2 Lakh/year)"],
               hi: ["आधार कार्ड","आयु प्रमाण","परिवार पहचान पत्र","बैंक खाता","शपथ पत्र (पुत्र न होने का)","आय प्रमाण (≤₹2 लाख/वर्ष)"] },
    // Eligibility: Haryana woman aged 45+, no male child, income ≤ ₹2 lakh/year
    match: (a) => a.state === "Haryana" && a.who === "women" && ["below1","1to3"].includes(a.income) && ["35to60","above60"].includes(a.age),
  },

  {
    id: "haryana_farm_equipment",
    icon: "🚜", color: "#365314", scope: "state", state: "Haryana",
    ministry: { en: "Agriculture & Farmers Welfare Dept., Haryana", hi: "कृषि एवं किसान कल्याण विभाग, हरियाणा" },
    name:    { en: "Krishi Yantra Anudan Yojana (Haryana)",    hi: "कृषि यंत्र अनुदान योजना (हरियाणा)" },
    benefit: { en: "40–50% subsidy on farm equipment (tractor, harvester, rotavator, seed drill, laser leveller & more)", hi: "कृषि यंत्रों पर 40–50% सब्सिडी (ट्रैक्टर, हार्वेस्टर, रोटावेटर, सीड ड्रिल, लेजर लेवलर आदि)" },
    tag:     { en: "Farmer / Equipment Subsidy", hi: "किसान / यंत्र अनुदान" },
    annual: 0,
    apply:   { en: "agriharyana.gov.in", hi: "agriharyana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra/Jamabandi)","Tractor RC (for tractor-drawn implements)","Bank Account","Parivar Pehchan Patra","Caste Certificate (SC/ST for higher subsidy)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खसरा/जमाबंदी)","ट्रैक्टर RC (ट्रैक्टर चालित यंत्रों के लिए)","बैंक खाता","परिवार पहचान पत्र","जाति प्रमाण पत्र (SC/ST को अधिक सब्सिडी)"] },
    // Eligibility: Haryana farmer, priority to small/marginal farmers & SC/ST
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_micro_irrigation",
    icon: "💧", color: "#0C4A6E", scope: "state", state: "Haryana",
    ministry: { en: "Agriculture Dept. / Horticulture Dept., Haryana", hi: "कृषि विभाग / बागवानी विभाग, हरियाणा" },
    name:    { en: "Micro Irrigation Scheme (Haryana)",    hi: "सूक्ष्म सिंचाई योजना (हरियाणा)" },
    benefit: { en: "80–85% subsidy on drip & sprinkler irrigation systems (90% for SC/ST/small farmers)", hi: "ड्रिप और स्प्रिंकलर सिंचाई प्रणाली पर 80–85% सब्सिडी (SC/ST/लघु किसानों को 90%)" },
    tag:     { en: "Farmer / Irrigation Subsidy", hi: "किसान / सिंचाई सब्सिडी" },
    annual: 0,
    apply:   { en: "agriharyana.gov.in", hi: "agriharyana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra/Jamabandi)","Water Source Proof (borewell/canal)","Bank Account","Parivar Pehchan Patra","Caste Certificate (if SC/ST)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खसरा/जमाबंदी)","जल स्रोत प्रमाण (बोरवेल/नहर)","बैंक खाता","परिवार पहचान पत्र","जाति प्रमाण पत्र (SC/ST के लिए)"] },
    // Eligibility: Haryana farmer with own land & irrigation source, priority to small/marginal
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_bocw",
    icon: "👷", color: "#78350F", scope: "state", state: "Haryana",
    ministry: { en: "Labour Dept. — Building & Other Construction Workers Welfare Board, Haryana", hi: "श्रम विभाग — भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड, हरियाणा" },
    name:    { en: "BOCW Welfare Board Schemes (Haryana)",    hi: "BOCW कल्याण बोर्ड योजनाएं (हरियाणा)" },
    benefit: { en: "Multiple benefits for registered construction workers — maternity ₹36,000 · marriage ₹51,000 · education scholarship · medical aid · tool kit · pension", hi: "पंजीकृत निर्माण श्रमिकों के लिए — मातृत्व ₹36,000 · विवाह ₹51,000 · शिक्षा छात्रवृत्ति · चिकित्सा · औजार किट · पेंशन" },
    tag:     { en: "Labour / Construction Worker", hi: "श्रमिक / निर्माण मजदूर" },
    annual: 36000,
    apply:   { en: "bocwharyana.gov.in", hi: "bocwharyana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BOCW Registration Certificate","Employer Certificate (90 days work proof)","Bank Account","Parivar Pehchan Patra"],
               hi: ["आधार कार्ड","BOCW पंजीकरण प्रमाण पत्र","नियोक्ता प्रमाण पत्र (90 दिन कार्य प्रमाण)","बैंक खाता","परिवार पहचान पत्र"] },
    // Eligibility: Construction worker registered with BOCW Board, 90+ days worked/year
    match: (a) => a.state === "Haryana" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "haryana_sc_postmatric",
    icon: "🎓", color: "#1E3A5F", scope: "state", state: "Haryana",
    ministry: { en: "Welfare of SC & BC Dept., Haryana", hi: "अनुसूचित जाति एवं पिछड़ा वर्ग कल्याण विभाग, हरियाणा" },
    name:    { en: "SC/BC Post-Matric Scholarship (Haryana)",    hi: "SC/BC पोस्ट-मैट्रिक छात्रवृत्ति (हरियाणा)" },
    benefit: { en: "Full tuition fee reimbursement + maintenance allowance ₹380–₹1,200/month for SC/BC students (Class 11 & above)", hi: "SC/BC छात्रों के लिए पूर्ण शुल्क प्रतिपूर्ति + ₹380–₹1,200/माह रखरखाव भत्ता (कक्षा 11 से ऊपर)" },
    tag:     { en: "Student / SC BC Scholarship", hi: "छात्र / SC BC छात्रवृत्ति" },
    annual: 14400,
    apply:   { en: "haryanascbc.gov.in", hi: "haryanascbc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC/BC Caste Certificate","Previous Year Mark Sheet","Institution Admission Letter","Income Certificate (≤₹2.5 Lakh/year for BC, no limit for SC)","Bank Account","Domicile Certificate"],
               hi: ["आधार कार्ड","SC/BC जाति प्रमाण पत्र","पिछले वर्ष की मार्कशीट","संस्था प्रवेश पत्र","आय प्रमाण (BC के लिए ≤₹2.5 लाख, SC के लिए कोई सीमा नहीं)","बैंक खाता","निवास प्रमाण पत्र"] },
    // Eligibility: Haryana SC student (no income limit) / BC student (income ≤ ₹2.5 lakh), studying Class 11 or above
    match: (a) => a.state === "Haryana" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "haryana_pashu_credit",
    icon: "🐃", color: "#44403C", scope: "state", state: "Haryana",
    ministry: { en: "Animal Husbandry & Dairying Dept., Haryana", hi: "पशुपालन एवं डेयरी विभाग, हरियाणा" },
    name:    { en: "Pashu Kisan Credit Card (Haryana)",    hi: "पशु किसान क्रेडिट कार्ड (हरियाणा)" },
    benefit: { en: "Livestock loan — ₹40,783/cattle · ₹60,249/buffalo · ₹4,063/sheep/goat · at 4% interest with state interest subvention", hi: "पशु ऋण — ₹40,783/गाय · ₹60,249/भैंस · ₹4,063/भेड़/बकरी · 4% ब्याज पर राज्य अनुदान सहित" },
    tag:     { en: "Farmer / Livestock Loan", hi: "किसान / पशुधन ऋण" },
    annual: 0,
    apply:   { en: "pashudhanharyana.gov.in", hi: "pashudhanharyana.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records or Livestock Ownership Proof","Parivar Pehchan Patra","Bank Account","Passport Photo","Veterinary Health Certificate of Animal"],
               hi: ["आधार कार्ड","भूमि अभिलेख या पशु स्वामित्व प्रमाण","परिवार पहचान पत्र","बैंक खाता","पासपोर्ट फोटो","पशु का पशु चिकित्सा स्वास्थ्य प्रमाण पत्र"] },
    // Eligibility: Haryana farmer/livestock owner, applied via bank or Pashudhan Dept.
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_kisan_suraksha",
    icon: "🛡️", color: "#15803D", scope: "state", state: "Haryana",
    ministry: { en: "Agriculture & Farmers Welfare Dept., Haryana", hi: "कृषि एवं किसान कल्याण विभाग, हरियाणा" },
    name:    { en: "Mukhyamantri Kisan & Khetihar Mazdoor Jeevan Suraksha Yojana",    hi: "मुख्यमंत्री किसान एवं खेतिहर मजदूर जीवन सुरक्षा योजना" },
    benefit: { en: "₹5 Lakh accident insurance for farmers & farm workers · ₹10 Lakh in case of accidental death", hi: "किसानों और खेतिहर मजदूरों को ₹5 लाख दुर्घटना बीमा · मृत्यु पर ₹10 लाख" },
    tag:     { en: "Farmer / Accident Insurance", hi: "किसान / दुर्घटना बीमा" },
    annual: 0,
    apply:   { en: "agriharyana.gov.in", hi: "agriharyana.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records (for farmer) or Employment Proof (farm worker)","Parivar Pehchan Patra","Bank Account","FIR / Hospital Report (at claim time)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (किसान) या रोजगार प्रमाण (खेतिहर)","परिवार पहचान पत्र","बैंक खाता","FIR / अस्पताल रिपोर्ट (दावे के समय)"] },
    // Eligibility: Haryana farmer or farm labourer; auto-enrolled via Meri Fasal Mera Byora / Parivar Pehchan Patra
    match: (a) => a.state === "Haryana" && a.who === "farmer",
  },

  {
    id: "haryana_ddjay",
    icon: "🏙️", color: "#1D4ED8", scope: "state", state: "Haryana",
    ministry: { en: "Town & Country Planning Dept., Haryana", hi: "नगर एवं ग्राम नियोजन विभाग, हरियाणा" },
    name:    { en: "Deen Dayal Jan Awas Yojana (Haryana)",    hi: "दीन दयाल जन आवास योजना (हरियाणा)" },
    benefit: { en: "Affordable residential plots & flats for EWS/LIG urban families at subsidised rates in licensed colonies", hi: "लाइसेंस प्राप्त कॉलोनियों में EWS/LIG शहरी परिवारों को सब्सिडी दर पर आवासीय प्लॉट एवं फ्लैट" },
    tag:     { en: "Housing / Urban EWS", hi: "आवास / शहरी EWS" },
    annual: 0,
    apply:   { en: "tcpharyana.gov.in", hi: "tcpharyana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Parivar Pehchan Patra","Income Certificate (EWS ≤₹3L / LIG ≤₹6L per year)","No Property Certificate","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","परिवार पहचान पत्र","आय प्रमाण (EWS ≤₹3 लाख / LIG ≤₹6 लाख)","संपत्ति न होने का प्रमाण","बैंक खाता","पासपोर्ट फोटो"] },
    // Eligibility: Haryana urban resident, no pucca house, income EWS or LIG category
    match: (a) => a.state === "Haryana" && ["no","kutcha"].includes(a.house) && ["below1","1to3","3to6"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  {
    id: "haryana_sports_award",
    icon: "🏅", color: "#B45309", scope: "state", state: "Haryana",
    ministry: { en: "Sports & Youth Affairs Dept., Haryana", hi: "खेल एवं युवा मामले विभाग, हरियाणा" },
    name:    { en: "Haryana Sports Awards & Cash Incentive Policy",    hi: "हरियाणा खेल पुरस्कार एवं नकद प्रोत्साहन नीति" },
    benefit: { en: "Cash awards for medal winners — Olympic Gold ₹6 Cr · Silver ₹4 Cr · Bronze ₹2.5 Cr · National Gold ₹15 Lakh · also government job & pension", hi: "पदक विजेताओं को — ओलंपिक गोल्ड ₹6 करोड़ · सिल्वर ₹4 करोड़ · ब्रॉन्ज ₹2.5 करोड़ · राष्ट्रीय गोल्ड ₹15 लाख + सरकारी नौकरी एवं पेंशन" },
    tag:     { en: "Youth / Sports Excellence", hi: "युवा / खेल उत्कृष्टता" },
    annual: 0,
    apply:   { en: "haryanasports.gov.in", hi: "haryanasports.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Domicile Certificate (Haryana)","Medal / Certificate from Sports Federation","Bank Account","Passport Photo","NOC from Sports Federation"],
               hi: ["आधार कार्ड","निवास प्रमाण पत्र (हरियाणा)","खेल संघ से पदक/प्रमाण पत्र","बैंक खाता","पासपोर्ट फोटो","खेल संघ का NOC"] },
    // Eligibility: Haryana domicile athlete who has won medal at national/international competition
    match: (a) => a.state === "Haryana" && (a.who === "general" || a.who === "student") && ["18to35","35to60"].includes(a.age),
  },

  // ADD MORE HARYANA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "haryana_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Haryana",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Haryana",
  // },

];
