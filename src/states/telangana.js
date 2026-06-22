// Telangana — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "telangana_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const TELANGANA_SCHEMES = [

  // ── 1. Rythu Bandhu (Farmer Investment Support) ────────────────────────────
  {
    id: "ts_rythu_bandhu",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Agriculture Dept.", hi: "तेलंगाना कृषि विभाग" },
    name:    { en: "Rythu Bandhu Scheme (Telangana)",                 hi: "रायतु बंधु योजना (तेलंगाना)" },
    benefit: { en: "₹10,000/acre per season (2 seasons/year) investment support", hi: "₹10,000/एकड़ प्रति सीजन (2 सीजन/वर्ष) निवेश सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 20000,
    apply:   { en: "https://rythubharosa.telangana.gov.in", hi: "rythubandhu.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Pattadar Passbook / Land Records", "Bank Account"],
               hi: ["आधार कार्ड", "पट्टादार पासबुक / जमीन के कागज़", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "farmer",
  },

  // ── 2. Rythu Bima (Farmer Life Insurance) ─────────────────────────────────
  {
    id: "ts_rythu_bima",
    icon: "🛡️", color: "#15803D", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Agriculture & Cooperation Dept.", hi: "तेलंगाना कृषि एवं सहकारिता विभाग" },
    name:    { en: "Rythu Bima — Farmer Life Insurance (Telangana)",  hi: "रायतु बीमा — किसान जीवन बीमा (तेलंगाना)" },
    benefit: { en: "₹5 Lakh life insurance for all Pattadar farmers (18–59 years); premium fully paid by state govt", hi: "सभी पट्टादार किसानों (18–59 वर्ष) के लिए ₹5 लाख जीवन बीमा; प्रीमियम राज्य सरकार द्वारा पूरी तरह भुगतान" },
    tag:     { en: "Farmer Insurance", hi: "किसान बीमा" },
    annual: 0,
    apply:   { en: "agriculture.telangana.gov.in / Nearest VRO Office", hi: "agriculture.telangana.gov.in / नजदीकी VRO कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pattadar Passbook / Land Records", "Bank Account", "Age Proof (18–59 years)"],
               hi: ["आधार कार्ड", "पट्टादार पासबुक / जमीन के कागज़", "बैंक खाता", "आयु प्रमाण (18–59 वर्ष)"] },
    match: (a) => a.state === "Telangana" && a.who === "farmer" && ["18to35", "35to60"].includes(a.age),
  },

  // ── 3. Aasara Pension — Old Age ────────────────────────────────────────────
  {
    id: "ts_aasara_old_age",
    icon: "👴", color: "#D97706", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Social Welfare Dept.", hi: "तेलंगाना सामाजिक कल्याण विभाग" },
    name:    { en: "Aasara Old Age Pension (Telangana)",              hi: "आसरा वृद्धावस्था पेंशन (तेलंगाना)" },
    benefit: { en: "₹3,016/month pension for BPL senior citizens aged 60+ years", hi: "60+ वर्ष के BPL वरिष्ठ नागरिकों को ₹3,016/माह पेंशन" },
    tag:     { en: "Senior Pension", hi: "वरिष्ठ पेंशन" },
    annual: 36192,
    apply:   { en: "meeseva.telangana.gov.in / Nearest Village Secretary", hi: "meeseva.telangana.gov.in / नजदीकी ग्राम सचिव" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+ years)", "BPL / White Ration Card", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+ वर्ष)", "BPL / सफेद राशन कार्ड", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Telangana" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  // ── 4. Aasara Pension — Widow ──────────────────────────────────────────────
  {
    id: "ts_aasara_widow",
    icon: "🕊️", color: "#6B7280", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Women Development & Child Welfare Dept.", hi: "तेलंगाना महिला विकास एवं बाल कल्याण विभाग" },
    name:    { en: "Aasara Widow Pension (Telangana)",                 hi: "आसरा विधवा पेंशन (तेलंगाना)" },
    benefit: { en: "₹3,016/month pension for BPL widows aged 18+ years", hi: "18+ वर्ष की BPL विधवाओं को ₹3,016/माह पेंशन" },
    tag:     { en: "Women / Widow", hi: "महिला / विधवा" },
    annual: 36192,
    apply:   { en: "meeseva.telangana.gov.in / Nearest Village Secretary", hi: "meeseva.telangana.gov.in / नजदीकी ग्राम सचिव" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Age Proof (18+)", "BPL / White Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "आयु प्रमाण (18+)", "BPL / सफेद राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ── 5. Aasara Pension — Disabled ───────────────────────────────────────────
  {
    id: "ts_aasara_disabled",
    icon: "♿", color: "#6366F1", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Disabled Welfare Dept.", hi: "तेलंगाना दिव्यांग कल्याण विभाग" },
    name:    { en: "Aasara Disability Pension (Telangana)",            hi: "आसरा विकलांगता पेंशन (तेलंगाना)" },
    benefit: { en: "₹3,016/month pension for persons with 40%+ disability from BPL families", hi: "BPL परिवारों में 40%+ विकलांगता वाले व्यक्तियों को ₹3,016/माह पेंशन" },
    tag:     { en: "Disability Pension", hi: "विकलांगता पेंशन" },
    annual: 36192,
    apply:   { en: "meeseva.telangana.gov.in / Nearest Village Secretary", hi: "meeseva.telangana.gov.in / नजदीकी ग्राम सचिव" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ from District Medical Board)", "BPL / White Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+ जिला चिकित्सा बोर्ड से)", "BPL / सफेद राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && ["below1", "1to3"].includes(a.income),
  },

  // ── 6. Aarogyasri Health Care Trust ───────────────────────────────────────
  {
    id: "ts_aarogyasri",
    icon: "🏥", color: "#1E40AF", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Health, Medical & Family Welfare Dept.", hi: "तेलंगाना स्वास्थ्य, चिकित्सा एवं परिवार कल्याण विभाग" },
    name:    { en: "Aarogyasri Health Care Trust (Telangana)",         hi: "आरोग्यश्री हेल्थ केयर ट्रस्ट (तेलंगाना)" },
    benefit: { en: "₹5 Lakh/year free cashless treatment for 1,044+ medical procedures at 350+ empanelled govt & pvt hospitals", hi: "350+ पैनलबद्ध सरकारी व निजी अस्पतालों में 1,044+ प्रक्रियाओं के लिए ₹5 लाख/वर्ष मुफ्त कैशलेस इलाज" },
    tag:     { en: "Health Insurance", hi: "स्वास्थ्य बीमा" },
    annual: 500000,
    apply:   { en: "https://aarogyasri.telangana.gov.in", hi: "aarogyasri.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["White Ration Card (BPL)", "Aadhaar Card", "Aarogyasri Health Card (issued at hospital)"],
               hi: ["सफेद राशन कार्ड (BPL)", "आधार कार्ड", "आरोग्यश्री स्वास्थ्य कार्ड (अस्पताल में जारी)"] },
    match: (a) => a.state === "Telangana" && ["below1", "1to3"].includes(a.income),
  },

  // ── 7. KCR Kit — Maternity Support ────────────────────────────────────────
  {
    id: "ts_kcr_kit",
    icon: "🤱", color: "#BE185D", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Health & Family Welfare Dept.", hi: "तेलंगाना स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "KCR Kit — Maternity Support Scheme (Telangana)",  hi: "KCR किट — मातृत्व सहायता योजना (तेलंगाना)" },
    benefit: { en: "Free maternity kit (clothes, nutrition, medicines) + ₹12,000 cash for girl / ₹10,000 for boy on institutional delivery at govt hospital", hi: "सरकारी अस्पताल में प्रसव पर मुफ्त किट (कपड़े, पोषण, दवाएं) + बेटी के लिए ₹12,000 / बेटे के लिए ₹10,000 नकद" },
    tag:     { en: "Maternity / Women", hi: "मातृत्व / महिला" },
    annual: 12000,
    apply:   { en: "Nearest Govt. Hospital / PHC at time of delivery", hi: "प्रसव के समय नजदीकी सरकारी अस्पताल / PHC" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "White Ration Card", "MCP Card (Mother & Child Protection)", "Bank Account", "Address Proof"],
               hi: ["आधार कार्ड", "सफेद राशन कार्ड", "MCP कार्ड", "बैंक खाता", "पता प्रमाण"] },
    match: (a) => a.state === "Telangana" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ── 8. Kalyana Lakshmi — SC/ST/BC Marriage Assistance ─────────────────────
  {
    id: "ts_kalyana_lakshmi",
    icon: "💍", color: "#DB2777", scope: "state", state: "Telangana",
    ministry: { en: "Telangana BC Welfare Dept. / SC Development Dept.", hi: "तेलंगाना BC कल्याण विभाग / SC विकास विभाग" },
    name:    { en: "Kalyana Lakshmi — Marriage Assistance for SC/ST/BC (Telangana)", hi: "कल्याण लक्ष्मी — SC/ST/BC विवाह सहायता (तेलंगाना)" },
    benefit: { en: "₹1,00,116 one-time financial assistance for first marriage of SC/ST/BC (Hindu) girls aged 18+", hi: "18+ वर्ष की SC/ST/BC (हिंदू) बेटियों के पहले विवाह पर ₹1,00,116 एकमुश्त सहायता" },
    tag:     { en: "Women / Marriage", hi: "महिला / विवाह" },
    annual: 100116,
    apply:   { en: "https://telanganaepass.cgg.gov.in/KalyanaLakshmiLinks.jsp", hi: "kalyanalakshmi.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/BC)", "Age Proof (bride 18+)", "Marriage Registration Certificate", "White Ration Card", "Bank Account (bride's name)"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/BC)", "आयु प्रमाण (वधू 18+)", "विवाह पंजीकरण प्रमाण पत्र", "सफेद राशन कार्ड", "बैंक खाता (वधू के नाम)"] },
    match: (a) => a.state === "Telangana" && a.who === "women" && ["below1", "1to3"].includes(a.income) && ["18to35"].includes(a.age),
  },

  // ── 9. Shaadi Mubarak — Minority Marriage Assistance ──────────────────────
  {
    id: "ts_shaadi_mubarak",
    icon: "🌙", color: "#15803D", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Minority Welfare Dept.", hi: "तेलंगाना अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Shaadi Mubarak — Minority Marriage Assistance (Telangana)", hi: "शादी मुबारक — अल्पसंख्यक विवाह सहायता (तेलंगाना)" },
    benefit: { en: "₹1,00,116 one-time financial assistance for first marriage of Muslim / Christian / Sikh / other minority girls aged 18+", hi: "18+ वर्ष की मुस्लिम / ईसाई / सिख / अन्य अल्पसंख्यक बेटियों के पहले विवाह पर ₹1,00,116 एकमुश्त सहायता" },
    tag:     { en: "Women / Minority", hi: "महिला / अल्पसंख्यक" },
    annual: 100116,
    apply:   { en: "https://www.myscheme.gov.in/schemes/sms", hi: "shaadimubarak.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Religion Certificate / Affidavit", "Age Proof (bride 18+)", "Marriage Registration Certificate", "White Ration Card", "Bank Account (bride's name)"],
               hi: ["आधार कार्ड", "अल्पसंख्यक धर्म प्रमाण पत्र / शपथ पत्र", "आयु प्रमाण (वधू 18+)", "विवाह पंजीकरण प्रमाण पत्र", "सफेद राशन कार्ड", "बैंक खाता (वधू के नाम)"] },
    match: (a) => a.state === "Telangana" && a.who === "women" && ["below1", "1to3"].includes(a.income) && ["18to35"].includes(a.age),
  },

  // ── 10. 2BHK Dignity Housing Scheme ───────────────────────────────────────
  {
    id: "ts_2bhk_housing",
    icon: "🏠", color: "#0369A1", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Housing Dept. / TSISC", hi: "तेलंगाना आवास विभाग / TSISC" },
    name:    { en: "2BHK Dignity Housing Scheme (Telangana)",          hi: "2BHK डिग्निटी हाउसिंग योजना (तेलंगाना)" },
    benefit: { en: "Free 2-bedroom house (560 sq ft) with all civic amenities for homeless / kutcha house families", hi: "बेघर / कच्चे मकान वाले परिवारों को सभी नागरिक सुविधाओं सहित मुफ्त 2 बेडरूम घर (560 वर्ग फुट)" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "tsisc.gov.in / Nearest Municipal / Gram Panchayat Office", hi: "tsisc.gov.in / नजदीकी नगरपालिका / ग्राम पंचायत कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "White Ration Card (BPL)", "No House / Kutcha House Declaration", "Income Certificate", "Residence Proof", "Passport Photo"],
               hi: ["आधार कार्ड", "सफेद राशन कार्ड (BPL)", "घर न होने / कच्चे मकान की घोषणा", "आय प्रमाण पत्र", "निवास प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Telangana" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income),
  },

  // ── 11. TS ePASS — Fee Reimbursement for SC/ST/BC/Minority Students ────────
  {
    id: "ts_epass_fee",
    icon: "📚", color: "#7C3AED", scope: "state", state: "Telangana",
    ministry: { en: "Telangana SC/BC/Minority Welfare Depts.", hi: "तेलंगाना SC/BC/अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "TS ePASS — Fee Reimbursement for SC/ST/BC Students (Telangana)", hi: "TS ePASS — SC/ST/BC छात्रों के लिए शुल्क प्रतिपूर्ति (तेलंगाना)" },
    benefit: { en: "Full tuition fee + special fee reimbursed by govt for SC/ST/BC/EBC/Minority students pursuing degree, engineering, medicine & other professional courses", hi: "SC/ST/BC/EBC/अल्पसंख्यक छात्रों की डिग्री, इंजीनियरिंग, मेडिसिन और अन्य प्रोफेशनल कोर्सों की पूरी ट्यूशन फीस सरकार भरती है" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 50000,
    apply:   { en: "https://telanganaepass.cgg.gov.in", hi: "telanganaepass.cgg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/BC/EBC/Minority)", "Income Certificate (≤₹2L/year)", "Previous Year Mark Sheet", "College Admission & Fee Receipt", "Bank Account (student's name)"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/BC/EBC/अल्पसंख्यक)", "आय प्रमाण पत्र (≤₹2 लाख/वर्ष)", "पिछले वर्ष की मार्कशीट", "कॉलेज प्रवेश और शुल्क रसीद", "बैंक खाता (छात्र के नाम)"] },
    match: (a) => a.state === "Telangana" && a.who === "student" && ["below1", "1to3"].includes(a.income) && ["18to35"].includes(a.age),
  },

  // ── 12. Bathukamma Saree Scheme ────────────────────────────────────────────
  {
    id: "ts_bathukamma_saree",
    icon: "🌸", color: "#EC4899", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Women Development & Child Welfare Dept.", hi: "तेलंगाना महिला विकास एवं बाल कल्याण विभाग" },
    name:    { en: "Bathukamma Saree Scheme (Telangana)",              hi: "बथुकम्मा साड़ी योजना (तेलंगाना)" },
    benefit: { en: "Free festival saree (handloom) to all women every year during Bathukamma festival; supports women & handloom weavers", hi: "बथुकम्मा त्योहार पर प्रतिवर्ष सभी महिलाओं को निःशुल्क उत्सव साड़ी (हथकरघा); महिलाओं और बुनकरों दोनों को लाभ" },
    tag:     { en: "Women / Festival", hi: "महिला / उत्सव" },
    annual: 600,
    apply:   { en: "Distributed via MeeSeva / Fair Price Shop — no separate application", hi: "MeeSeva / उचित मूल्य दुकान के माध्यम से वितरण — अलग आवेदन नहीं" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "White / Pink Ration Card", "Any Govt. ID (proof of gender)"],
               hi: ["आधार कार्ड", "सफेद / गुलाबी राशन कार्ड", "कोई भी सरकारी पहचान पत्र"] },
    match: (a) => a.state === "Telangana" && a.who === "women",
  },

  // ── 13. Mission Bhagiratha — Free Tap Water ────────────────────────────────
  {
    id: "ts_mission_bhagiratha",
    icon: "💧", color: "#0891B2", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Mission Bhagiratha / TWDB", hi: "तेलंगाना मिशन भागीरथ / TWDB" },
    name:    { en: "Mission Bhagiratha — Free Tap Water (Telangana)",  hi: "मिशन भागीरथ — निःशुल्क नल जल (तेलंगाना)" },
    benefit: { en: "Safe drinking water via tap connection to every rural & urban household; 100 litres/person/day guaranteed", hi: "हर ग्रामीण और शहरी घर को नल कनेक्शन से सुरक्षित पेयजल; प्रति व्यक्ति 100 लीटर/दिन की गारंटी" },
    tag:     { en: "Drinking Water", hi: "पेयजल" },
    annual: 0,
    apply:   { en: "missionbhagiratha.telangana.gov.in / Nearest Gram Panchayat", hi: "missionbhagiratha.telangana.gov.in / नजदीकी ग्राम पंचायत" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Address / Residence Proof", "Ration Card"],
               hi: ["आधार कार्ड", "पता / निवास प्रमाण", "राशन कार्ड"] },
    match: (a) => a.state === "Telangana" && ["no", "kutcha"].includes(a.house),
  },

  // ── 14. T-PRIDE — SC Entrepreneur Loan Scheme ─────────────────────────────
  {
    id: "ts_t_pride",
    icon: "🚀", color: "#1D4ED8", scope: "state", state: "Telangana",
    ministry: { en: "Telangana SC Development Dept. / TSSCFDC", hi: "तेलंगाना SC विकास विभाग / TSSCFDC" },
    name:    { en: "T-PRIDE — SC Entrepreneur Loan Scheme (Telangana)", hi: "T-PRIDE — SC उद्यमी लोन योजना (तेलंगाना)" },
    benefit: { en: "Loan ₹10 Lakh – ₹5 Crore at 3% interest + 20% subsidy for SC entrepreneurs to start businesses", hi: "SC उद्यमियों को व्यवसाय शुरू करने के लिए 3% ब्याज पर ₹10 लाख–₹5 करोड़ लोन + 20% सब्सिडी" },
    tag:     { en: "Business / SC", hi: "व्यापार / SC" },
    annual: 0,
    apply:   { en: "https://schemesinindia.in/schemes/telangana/telangana-t-pride-bc-entrepreneur-loan", hi: "https://schemesinindia.in/schemes/telangana/telangana-t-pride-bc-entrepreneur-loan" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "Business / Project Report", "Educational Certificate", "Bank Account", "Income Certificate"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "व्यापार / प्रोजेक्ट रिपोर्ट", "शैक्षिक प्रमाण पत्र", "बैंक खाता", "आय प्रमाण पत्र"] },
    match: (a) => a.state === "Telangana" && a.who === "business" && ["18to35", "35to60"].includes(a.age),
  },

  // ── 15. Cheyuta — SC/ST Self-Employment Loan ──────────────────────────────
  {
    id: "ts_cheyuta",
    icon: "🤝", color: "#0F766E", scope: "state", state: "Telangana",
    ministry: { en: "Telangana SC Development & Tribal Welfare Dept.", hi: "तेलंगाना SC विकास एवं जनजातीय कल्याण विभाग" },
    name:    { en: "Cheyuta — SC/ST Self-Employment Scheme (Telangana)", hi: "चेयूता — SC/ST स्वरोजगार योजना (तेलंगाना)" },
    benefit: { en: "₹75,000 loan at low interest + 20% subsidy for SC/ST persons to start small businesses or trades", hi: "SC/ST व्यक्तियों को छोटा व्यवसाय शुरू करने के लिए कम ब्याज पर ₹75,000 लोन + 20% सब्सिडी" },
    tag:     { en: "Business / SC-ST", hi: "व्यापार / SC-ST" },
    annual: 0,
    apply:   { en: "tsscfdc.com / Nearest DRDA / ITDA Office", hi: "tsscfdc.com / नजदीकी DRDA / ITDA कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SC/ST Caste Certificate", "Income Certificate (BPL)", "Business / Trade Plan", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "SC/ST जाति प्रमाण पत्र", "आय प्रमाण पत्र (BPL)", "व्यापार / व्यवसाय योजना", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Telangana" && a.who === "business" && ["below1", "1to3"].includes(a.income),
  },

  // ── 16. BC Welfare Corporation — Self-Employment Loan ─────────────────────
  {
    id: "ts_bc_welfare_loan",
    icon: "💼", color: "#92400E", scope: "state", state: "Telangana",
    ministry: { en: "Telangana BC Welfare Dept. / TSBCWDCL", hi: "तेलंगाना BC कल्याण विभाग / TSBCWDCL" },
    name:    { en: "BC Welfare Corporation Self-Employment Loan (Telangana)", hi: "BC कल्याण निगम स्वरोजगार लोन (तेलंगाना)" },
    benefit: { en: "Loans ₹1 Lakh – ₹10 Lakh at 3–5% interest + 25% subsidy for BC community entrepreneurs", hi: "BC समुदाय के उद्यमियों को 3–5% ब्याज पर ₹1 लाख–₹10 लाख लोन + 25% सब्सिडी" },
    tag:     { en: "Business / BC", hi: "व्यापार / BC" },
    annual: 0,
    apply:   { en: "bcwelfare.telangana.gov.in / Nearest Dist. BC Welfare Office", hi: "bcwelfare.telangana.gov.in / नजदीकी जिला BC कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BC Caste Certificate", "Income Certificate (≤₹3L/year)", "Business Plan", "Bank Account", "Educational Certificate"],
               hi: ["आधार कार्ड", "BC जाति प्रमाण पत्र", "आय प्रमाण पत्र (≤₹3 लाख/वर्ष)", "व्यापार योजना", "बैंक खाता", "शैक्षिक प्रमाण पत्र"] },
    match: (a) => a.state === "Telangana" && a.who === "business" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── 17. Telangana Pre-Matric Scholarship for SC/ST Students ───────────────
  {
    id: "ts_prematric_scholarship",
    icon: "🎓", color: "#B45309", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Social Welfare / Tribal Welfare Dept.", hi: "तेलंगाना सामाजिक कल्याण / जनजातीय कल्याण विभाग" },
    name:    { en: "Pre-Matric Scholarship for SC/ST Students (Telangana)", hi: "SC/ST छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति (तेलंगाना)" },
    benefit: { en: "Monthly stipend ₹100–₹350 + boarding allowance ₹700–₹1,000/month for SC/ST students in Class 1–10 (day scholars & hostellers)", hi: "SC/ST छात्रों को कक्षा 1–10 के लिए ₹100–₹350 मासिक वजीफा + ₹700–₹1,000/माह छात्रावास भत्ता" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 12000,
    apply:   { en: "https://telanganaepass.cgg.gov.in", hi: "telanganaepass.cgg.gov.in / स्कूल प्रधानाचार्य" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC/ST Caste Certificate", "Previous Year Mark Sheet", "Income Certificate (≤₹2.5L/year)", "Bank Account (student/parent)", "School Enrollment Certificate"],
               hi: ["आधार कार्ड", "SC/ST जाति प्रमाण पत्र", "पिछले वर्ष की मार्कशीट", "आय प्रमाण पत्र (≤₹2.5 लाख/वर्ष)", "बैंक खाता (छात्र/माता-पिता)", "स्कूल नामांकन प्रमाण"] },
    match: (a) => a.state === "Telangana" && a.who === "student" && ["below1", "1to3"].includes(a.income) && a.age === "below18",
  },

  // ── 18. Telangana Construction Workers Welfare Scheme ─────────────────────
  {
    id: "ts_construction_workers",
    icon: "🏗️", color: "#374151", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Building & Other Construction Workers Welfare Board (BOCW)", hi: "तेलंगाना भवन एवं अन्य निर्माण श्रमिक कल्याण बोर्ड (BOCW)" },
    name:    { en: "Construction Workers Welfare Scheme (Telangana)",  hi: "निर्माण श्रमिक कल्याण योजना (तेलंगाना)" },
    benefit: { en: "Maternity ₹3,000 · Accident death ₹2 Lakh · Disability ₹1 Lakh · Education aid ₹3,000–₹20,000 · Tool grant ₹2,000 for registered construction workers", hi: "पंजीकृत निर्माण श्रमिकों को मातृत्व ₹3,000 · दुर्घटना मृत्यु ₹2 लाख · विकलांगता ₹1 लाख · शिक्षा सहायता ₹3,000–₹20,000 · उपकरण अनुदान ₹2,000" },
    tag:     { en: "Construction Worker", hi: "निर्माण श्रमिक" },
    annual: 3000,
    apply:   { en: "labour.telangana.gov.in / Nearest BOCW District Office", hi: "labour.telangana.gov.in / नजदीकी BOCW जिला कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BOCW Worker Registration Card", "90-Day Work Certificate from Employer / Engineer", "Bank Account", "Passport Photo"],
               hi: ["आधार कार्ड", "BOCW श्रमिक पंजीकरण कार्ड", "नियोक्ता / अभियंता से 90 दिन कार्य प्रमाण पत्र", "बैंक खाता", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Telangana" && a.who === "general" && ["below1", "1to3"].includes(a.income),
  },

  // ── 19. Indiramma Illu — Rural Housing (Rajiv Swagruha) ───────────────────
  {
    id: "ts_indiramma_illu",
    icon: "🏡", color: "#EA580C", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Rural Development & Panchayat Raj Dept.", hi: "तेलंगाना ग्रामीण विकास एवं पंचायत राज विभाग" },
    name:    { en: "Indiramma Illu — Rural Housing Scheme (Telangana)", hi: "इंदिरम्मा इल्लू — ग्रामीण आवास योजना (तेलंगाना)" },
    benefit: { en: "Free pucca house for homeless / kutcha house rural BPL families; grant ₹1.5 Lakh + additional state top-up over PMAY Gramin", hi: "बेघर / कच्चे मकान वाले ग्रामीण BPL परिवारों को मुफ्त पक्का मकान; PMAY ग्रामीण से अधिक ₹1.5 लाख अनुदान + राज्य सहायता" },
    tag:     { en: "Rural Housing", hi: "ग्रामीण आवास" },
    annual: 150000,
    apply:   { en: "Nearest Village Secretary / Gram Panchayat Office", hi: "नजदीकी ग्राम सचिव / ग्राम पंचायत कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "White Ration Card (BPL)", "No Pucca House Declaration", "Land Ownership / Assigned Land Proof", "Bank Account", "Residence Proof"],
               hi: ["आधार कार्ड", "सफेद राशन कार्ड (BPL)", "पक्का मकान न होने की घोषणा", "भूमि स्वामित्व / असाइन भूमि प्रमाण", "बैंक खाता", "निवास प्रमाण"] },
    match: (a) => a.state === "Telangana" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  // ── 20. Dalit Bandhu — SC Family Investment Support ───────────────────────
  {
    id: "ts_dalit_bandhu",
    icon: "💰", color: "#B45309", scope: "state", state: "Telangana",
    ministry: { en: "Telangana SC Development Dept.", hi: "तेलंगाना SC विकास विभाग" },
    name:    { en: "Dalit Bandhu — SC Family Support Scheme (Telangana)", hi: "दलित बंधु — SC परिवार सहायता योजना (तेलंगाना)" },
    benefit: { en: "₹10 Lakh one-time direct investment to every SC family for livelihood; no repayment · No intermediary", hi: "प्रत्येक SC परिवार को आजीविका के लिए ₹10 लाख एकमुश्त प्रत्यक्ष निवेश; कोई वापसी नहीं · कोई बिचौलिया नहीं" },
    tag:     { en: "SC Welfare", hi: "SC कल्याण" },
    annual: 1000000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/dalit-bandhu", hi: "dalitbandhu.telangana.gov.in / नजदीकी जिला कलेक्टर कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "Sadar / Land / Business Activity Proof", "Bank Account (Aadhaar-linked)", "Income Certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "सदर / भूमि / व्यापार गतिविधि प्रमाण", "बैंक खाता (आधार लिंक)", "आय प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Telangana" && ["below1", "1to3"].includes(a.income),
  },

  // ── 21. Stree Nidhi — Women SHG Credit Cooperative ────────────────────────
  {
    id: "ts_stree_nidhi",
    icon: "👩‍👩‍👧", color: "#9D174D", scope: "state", state: "Telangana",
    ministry: { en: "Telangana MEPMA / Women SHG Dept.", hi: "तेलंगाना MEPMA / महिला SHG विभाग" },
    name:    { en: "Stree Nidhi — Women SHG Credit Cooperative (Telangana)", hi: "स्त्री निधि — महिला SHG क्रेडिट सहकारी (तेलंगाना)" },
    benefit: { en: "Emergency loan ₹1 Lakh within 24 hrs + project loan up to ₹10 Lakh at 3% interest for SHG women groups", hi: "SHG महिला समूहों को 24 घंटे में ₹1 लाख आपातकालीन लोन + 3% ब्याज पर ₹10 लाख तक प्रोजेक्ट लोन" },
    tag:     { en: "Women / SHG", hi: "महिला / SHG" },
    annual: 0,
    apply:   { en: "https://ibpsreg.ibps.in/snccflapr26/uploads/loadpdf.php?file=k7m5p+fQ15e7yM7Wx9XG2tuYoJS+pdGTpaeV6Kqlcg%3D%3D&t=xa3HneXVzdutx9Dh1ZfVzs8%3D", hi: "streenidhi.telangana.gov.in / नजदीकी मंडल SHG समन्वयक" }, applyType: "online",
    docs:    { en: ["SHG Registration Certificate", "Group Passbook & Meeting Records (min. 6 months)", "Bank Account (SHG group)", "Members' Aadhaar Cards"],
               hi: ["SHG पंजीकरण प्रमाण पत्र", "समूह पासबुक और बैठक रिकॉर्ड (न्यूनतम 6 माह)", "बैंक खाता (SHG समूह)", "सदस्यों के आधार कार्ड"] },
    match: (a) => a.state === "Telangana" && a.who === "women",
  },

  // ── 22. Sheep / Goat Distribution — SC Shepherds ──────────────────────────
  {
    id: "ts_sheep_distribution",
    icon: "🐑", color: "#78350F", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Animal Husbandry / SC Development Dept.", hi: "तेलंगाना पशुपालन / SC विकास विभाग" },
    name:    { en: "Free Sheep / Goat Distribution for SC Shepherds (Telangana)", hi: "SC चरवाहों को निःशुल्क भेड़ / बकरी वितरण (तेलंगाना)" },
    benefit: { en: "10 sheep + 1 ram unit (worth ₹1 Lakh+) with 85% govt subsidy for SC shepherd community; free veterinary support", hi: "SC चरवाहा समुदाय को 85% सरकारी सब्सिडी पर 10 भेड़ + 1 मेढ़ा की इकाई (₹1 लाख+ मूल्य); निःशुल्क पशु चिकित्सा सहायता" },
    tag:     { en: "Animal Husbandry / SC", hi: "पशुपालन / SC" },
    annual: 100000,
    apply:   { en: "Nearest District Animal Husbandry / DRDA Office", hi: "नजदीकी जिला पशुपालन / DRDA कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SC Caste Certificate", "White / Pink Ration Card", "Bank Account", "Income Certificate", "Grazing / Residence Proof"],
               hi: ["आधार कार्ड", "SC जाति प्रमाण पत्र", "सफेद / गुलाबी राशन कार्ड", "बैंक खाता", "आय प्रमाण पत्र", "चराई / निवास प्रमाण"] },
    match: (a) => a.state === "Telangana" && a.area === "rural" && ["below1", "1to3"].includes(a.income),
  },

  // ── 23. Telangana Micro Irrigation Scheme (TMIS) ──────────────────────────
  {
    id: "ts_micro_irrigation",
    icon: "💦", color: "#0369A1", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Agriculture & Cooperation Dept. / TMIS", hi: "तेलंगाना कृषि एवं सहकारिता विभाग / TMIS" },
    name:    { en: "Telangana Micro Irrigation Scheme — TMIS (Drip/Sprinkler)", hi: "तेलंगाना माइक्रो सिंचाई योजना — TMIS (ड्रिप/स्प्रिंकलर)" },
    benefit: { en: "90–100% subsidy on drip & sprinkler irrigation systems for small & marginal farmers (≤5 acres); SC/ST get 100%", hi: "लघु एवं सीमांत किसानों (≤5 एकड़) को ड्रिप और स्प्रिंकलर सिंचाई पर 90–100% सब्सिडी; SC/ST को 100%" },
    tag:     { en: "Farmer / Irrigation", hi: "किसान / सिंचाई" },
    annual: 0,
    apply:   { en: "https://www.india.gov.in/services/details/telangana-micro-irrigation-project-farmer-registration-application-form", hi: "tmis.telangana.gov.in / नजदीकी कृषि विस्तार अधिकारी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Pattadar Passbook / Land Records (≤5 acres)", "Bank Account", "Caste Certificate (for SC/ST 100% subsidy)", "Electricity Connection Proof"],
               hi: ["आधार कार्ड", "पट्टादार पासबुक / जमीन के कागज़ (≤5 एकड़)", "बैंक खाता", "जाति प्रमाण पत्र (SC/ST 100% सब्सिडी)", "बिजली कनेक्शन प्रमाण"] },
    match: (a) => a.state === "Telangana" && a.who === "farmer",
  },

  // ── 24. Anna Canteen — ₹5 Meal for Urban Poor ─────────────────────────────
  {
    id: "ts_anna_canteen",
    icon: "🍱", color: "#92400E", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Greater Hyderabad Municipal Corporation / ULBs", hi: "तेलंगाना ग्रेटर हैदराबाद नगर निगम / ULBs" },
    name:    { en: "Anna Canteen — ₹5 Nutritious Meal Scheme (Telangana)",   hi: "अन्ना कैंटीन — ₹5 पौष्टिक भोजन योजना (तेलंगाना)" },
    benefit: { en: "Full nutritious meal (rice, dal, sambar, vegetable) at just ₹5/plate at govt canteens across urban Telangana", hi: "शहरी तेलंगाना में सरकारी कैंटीनों पर केवल ₹5/थाली में पूर्ण पौष्टिक भोजन (चावल, दाल, सांभर, सब्जी)" },
    tag:     { en: "Food / General", hi: "भोजन / सामान्य" },
    annual: 1825,
    apply:   { en: "Walk-in at nearest Anna Canteen — no registration required", hi: "निकटतम अन्ना कैंटीन में सीधे जाएं — पंजीकरण आवश्यक नहीं" }, applyType: "offline",
    docs:    { en: ["No documents required · Walk-in service"],
               hi: ["कोई दस्तावेज़ नहीं · सीधे सेवा"] },
    match: (a) => a.state === "Telangana" && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── 25. Basthi Dawakhana — Free Urban Health Clinics ──────────────────────
  {
    id: "ts_basthi_dawakhana",
    icon: "🩺", color: "#065F46", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Health & Family Welfare Dept. / GHMC", hi: "तेलंगाना स्वास्थ्य एवं परिवार कल्याण विभाग / GHMC" },
    name:    { en: "Basthi Dawakhana — Free Urban Health Clinics (Telangana)", hi: "बस्ती दवाखाना — निःशुल्क शहरी स्वास्थ्य क्लिनिक (तेलंगाना)" },
    benefit: { en: "Free OPD consultation, medicines & diagnostics at 270+ Basthi Dawakhana clinics in urban slums & low-income colonies daily", hi: "शहरी झुग्गियों और कम आय वाली कॉलोनियों में 270+ बस्ती दवाखाना क्लिनिकों पर प्रतिदिन निःशुल्क OPD परामर्श, दवाएं और जांच" },
    tag:     { en: "Health / Urban", hi: "स्वास्थ्य / शहरी" },
    annual: 0,
    apply:   { en: "Walk-in at nearest Basthi Dawakhana clinic — health.telangana.gov.in", hi: "निकटतम बस्ती दवाखाना क्लिनिक में जाएं — health.telangana.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card or any Govt. ID", "Ration Card (preferred)"],
               hi: ["आधार कार्ड या कोई भी सरकारी पहचान पत्र", "राशन कार्ड (बेहतर)"] },
    match: (a) => a.state === "Telangana" && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── 26. Free Dialysis Scheme — Kidney Patients ────────────────────────────
  {
    id: "ts_free_dialysis",
    icon: "🏥", color: "#1E3A5F", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Health & Family Welfare Dept.", hi: "तेलंगाना स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Free Dialysis Scheme for BPL Kidney Patients (Telangana)", hi: "BPL गुर्दा रोगियों के लिए निःशुल्क डायलिसिस योजना (तेलंगाना)" },
    benefit: { en: "3 free dialysis sessions/week at govt. hospitals under Pradhan Mantri National Dialysis Programme for BPL patients; medicines & transport reimbursement also covered", hi: "BPL रोगियों को PMNDP के तहत सरकारी अस्पतालों में सप्ताह में 3 निःशुल्क डायलिसिस सत्र; दवाएं और परिवहन प्रतिपूर्ति भी शामिल" },
    tag:     { en: "Health / Kidney", hi: "स्वास्थ्य / गुर्दा" },
    annual: 0,
    apply:   { en: "Nearest Govt. District Hospital / Civil Hospital", hi: "नजदीकी सरकारी जिला अस्पताल / सिविल अस्पताल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "White Ration Card (BPL)", "Nephrologist / Doctor Prescription", "Dialysis Eligibility Certificate from hospital", "Bank Account"],
               hi: ["आधार कार्ड", "सफेद राशन कार्ड (BPL)", "नेफ्रोलॉजिस्ट / डॉक्टर का पर्चा", "अस्पताल से डायलिसिस पात्रता प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && ["below1", "1to3"].includes(a.income),
  },

  // ── 27. Overseas Scholarship for SC/ST Students ────────────────────────────
  {
    id: "ts_overseas_scholarship",
    icon: "✈️", color: "#1D4ED8", scope: "state", state: "Telangana",
    ministry: { en: "Telangana SC Development & Tribal Welfare Dept.", hi: "तेलंगाना SC विकास एवं जनजातीय कल्याण विभाग" },
    name:    { en: "Telangana Overseas Scholarship for SC/ST Students",   hi: "तेलंगाना SC/ST छात्रों के लिए विदेश छात्रवृत्ति" },
    benefit: { en: "Full scholarship covering tuition fee + living allowance up to ₹25 Lakh/year for SC/ST students pursuing Masters / PhD at top foreign universities", hi: "विदेश के शीर्ष विश्वविद्यालयों में Masters / PhD करने वाले SC/ST छात्रों के लिए ट्यूशन फीस + ₹25 लाख/वर्ष तक जीवन भत्ता की पूरी छात्रवृत्ति" },
    tag:     { en: "Student / SC-ST Overseas", hi: "छात्र / SC-ST विदेश" },
    annual: 2500000,
    apply:   { en: "https://telanganaepass.cgg.gov.in", hi: "telanganaepass.cgg.gov.in / SC विकास विभाग" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SC/ST Caste Certificate", "Graduation Mark Sheet (min. 60%)", "Admission Offer Letter from Foreign University (ranked top 500)", "Income Certificate (≤₹6L/year)", "Valid Passport", "Bank Account"],
               hi: ["आधार कार्ड", "SC/ST जाति प्रमाण पत्र", "स्नातक मार्कशीट (न्यूनतम 60%)", "विदेशी विश्वविद्यालय से प्रवेश पत्र (शीर्ष 500 रैंक)", "आय प्रमाण पत्र (≤₹6 लाख/वर्ष)", "वैध पासपोर्ट", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "student" && ["below1", "1to3", "3to6"].includes(a.income) && a.age === "18to35",
  },

  // ── 28. Minority Post-Matric Scholarship ──────────────────────────────────
  {
    id: "ts_minority_scholarship",
    icon: "🖊️", color: "#7C3AED", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Minority Welfare Dept.", hi: "तेलंगाना अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Minority Post-Matric Scholarship (Telangana)",        hi: "अल्पसंख्यक पोस्ट-मैट्रिक छात्रवृत्ति (तेलंगाना)" },
    benefit: { en: "Full tuition fee + maintenance allowance ₹230–₹1,200/month for Muslim, Christian, Sikh, Buddhist, Jain students studying after Class 10", hi: "Class 10 के बाद मुस्लिम, ईसाई, सिख, बौद्ध, जैन छात्रों के लिए पूरी ट्यूशन फीस + ₹230–₹1,200/माह रखरखाव भत्ता" },
    tag:     { en: "Student / Minority", hi: "छात्र / अल्पसंख्यक" },
    annual: 14400,
    apply:   { en: "https://telanganaepass.cgg.gov.in", hi: "https://telanganaepass.cgg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Religion Certificate / Affidavit", "Class 10 Mark Sheet", "College / Institution Admission Letter", "Income Certificate (≤₹2L/year)", "Bank Account (student's name)"],
               hi: ["आधार कार्ड", "अल्पसंख्यक धर्म प्रमाण पत्र / शपथ पत्र", "कक्षा 10 मार्कशीट", "कॉलेज / संस्था प्रवेश पत्र", "आय प्रमाण पत्र (≤₹2 लाख/वर्ष)", "बैंक खाता (छात्र के नाम)"] },
    match: (a) => a.state === "Telangana" && a.who === "student" && ["below1", "1to3"].includes(a.income) && ["18to35"].includes(a.age),
  },

  // ── 29. Chenetha Mitra — Handloom Weavers Welfare ─────────────────────────
  {
    id: "ts_chenetha_mitra",
    icon: "🧵", color: "#7E22CE", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Handlooms & Textiles Dept.", hi: "तेलंगाना हथकरघा एवं वस्त्र विभाग" },
    name:    { en: "Chenetha Mitra — Handloom Weavers Welfare (Telangana)", hi: "चेनेथा मित्र — हथकरघा बुनकर कल्याण (तेलंगाना)" },
    benefit: { en: "₹2,000/month income support + free yarn + ₹2 Lakh accident insurance + subsidised loans for handloom weavers", hi: "हथकरघा बुनकरों को ₹2,000/माह आय सहायता + निःशुल्क धागा + ₹2 लाख दुर्घटना बीमा + रियायती लोन" },
    tag:     { en: "Artisan / Weaver", hi: "कारीगर / बुनकर" },
    annual: 24000,
    apply:   { en: "handlooms.telangana.gov.in / Nearest Weavers Co-op / District Office", hi: "handlooms.telangana.gov.in / नजदीकी बुनकर सहकारी / जिला कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Weaver Identity Card / Co-op Membership", "Bank Account", "Caste Certificate (if SC/ST/BC)", "Loom Ownership Proof"],
               hi: ["आधार कार्ड", "बुनकर पहचान पत्र / सहकारी सदस्यता", "बैंक खाता", "जाति प्रमाण पत्र (SC/ST/BC हो तो)", "करघा स्वामित्व प्रमाण"] },
    match: (a) => a.state === "Telangana" && a.who === "business" && ["below1", "1to3"].includes(a.income),
  },

  // ── 30. Telangana Fishermen Welfare Scheme ────────────────────────────────
  {
    id: "ts_fishermen_welfare",
    icon: "🐟", color: "#0C4A6E", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Fisheries Dept.", hi: "तेलंगाना मत्स्य पालन विभाग" },
    name:    { en: "Telangana Fishermen Welfare Scheme",                  hi: "तेलंगाना मछुआरा कल्याण योजना" },
    benefit: { en: "₹10,000/year support + ₹5,000 seasonal fishing ban compensation + ₹2 Lakh accident insurance + free fishing nets for registered fishermen", hi: "पंजीकृत मछुआरों को ₹10,000/वर्ष सहायता + ₹5,000 मौसमी मछली पकड़ प्रतिबंध मुआवजा + ₹2 लाख दुर्घटना बीमा + निःशुल्क मछली जाल" },
    tag:     { en: "Fishermen", hi: "मछुआरा" },
    annual: 10000,
    apply:   { en: "fisheries.telangana.gov.in / Nearest Fisheries Extension Officer", hi: "fisheries.telangana.gov.in / नजदीकी मत्स्य विस्तार अधिकारी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Fisherman Registration Card", "Boat / Equipment Registration Certificate", "Bank Account", "Community Certificate (BC-E / Fishermen category)"],
               hi: ["आधार कार्ड", "मछुआरा पंजीकरण कार्ड", "नाव / उपकरण पंजीकरण प्रमाण पत्र", "बैंक खाता", "समुदाय प्रमाण पत्र (BC-E / मछुआरा वर्ग)"] },
    match: (a) => a.state === "Telangana" && a.who === "general" && a.area !== "urban",
  },

  // ── 31. TASK — Free IT / Skill Training for Youth ─────────────────────────
  {
    id: "ts_task_skill",
    icon: "💻", color: "#0891B2", scope: "state", state: "Telangana",
    ministry: { en: "Telangana IT & Electronics Dept. / TASK", hi: "तेलंगाना IT एवं इलेक्ट्रॉनिक्स विभाग / TASK" },
    name:    { en: "TASK — Free IT & Skill Training for Youth (Telangana)", hi: "TASK — युवाओं के लिए निःशुल्क IT और कौशल प्रशिक्षण (तेलंगाना)" },
    benefit: { en: "Free industry-ready IT, software & communication skills training + placement support for engineering & diploma graduates; 3–6 month courses", hi: "इंजीनियरिंग और डिप्लोमा स्नातकों के लिए निःशुल्क उद्योग-अनुकूल IT, सॉफ्टवेयर और संचार कौशल प्रशिक्षण + प्लेसमेंट सहायता; 3–6 माह के कोर्स" },
    tag:     { en: "Youth / IT Skills", hi: "युवा / IT कौशल" },
    annual: 0,
    apply:   { en: "https://hyderabad.telangana.gov.in/scheme/task", hi: "task.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Engineering / Diploma / Degree Certificate", "College ID or Passing Certificate", "Passport Photo", "Bank Account"],
               hi: ["आधार कार्ड", "इंजीनियरिंग / डिप्लोमा / डिग्री प्रमाण पत्र", "कॉलेज ID या उत्तीर्ण प्रमाण पत्र", "पासपोर्ट फोटो", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "student" && a.age === "18to35",
  },

  // ── 32. Rythu Rinamafi — Crop Loan Waiver ─────────────────────────────────
  {
    id: "ts_rythu_rinamafi",
    icon: "📋", color: "#166534", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Agriculture & Cooperation Dept.", hi: "तेलंगाना कृषि एवं सहकारिता विभाग" },
    name:    { en: "Rythu Rinamafi — Crop Loan Waiver Scheme (Telangana)", hi: "रायतु रिणमाफी — फसल लोन माफी योजना (तेलंगाना)" },
    benefit: { en: "Crop loan waiver up to ₹2 Lakh per farmer for eligible outstanding agricultural loans from cooperative & commercial banks", hi: "सहकारी और वाणिज्यिक बैंकों से बकाया कृषि लोन के लिए प्रति किसान ₹2 लाख तक फसल लोन माफी" },
    tag:     { en: "Farmer / Loan Waiver", hi: "किसान / लोन माफी" },
    annual: 200000,
    apply:   { en: "rythubandhu.telangana.gov.in / Nearest Cooperative Bank / Agriculture Dept.", hi: "rythubandhu.telangana.gov.in / नजदीकी सहकारी बैंक / कृषि विभाग" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pattadar Passbook / Land Records", "Loan Passbook / Bank Statement showing outstanding crop loan", "Bank Account"],
               hi: ["आधार कार्ड", "पट्टादार पासबुक / जमीन के कागज़", "लोन पासबुक / बैंक स्टेटमेंट (बकाया फसल लोन)", "बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "farmer" && ["below1", "1to3"].includes(a.income),
  },

  // ── 33. T-Fiber — Free Broadband Internet ─────────────────────────────────
  {
    id: "ts_t_fiber",
    icon: "📡", color: "#374151", scope: "state", state: "Telangana",
    ministry: { en: "Telangana IT & Electronics Dept. / TSRTC / T-Fiber", hi: "तेलंगाना IT एवं इलेक्ट्रॉनिक्स विभाग / T-Fiber" },
    name:    { en: "T-Fiber — Free Broadband Internet for All Households (Telangana)", hi: "T-Fiber — सभी परिवारों के लिए निःशुल्क ब्रॉडबैंड इंटरनेट (तेलंगाना)" },
    benefit: { en: "1 GB free internet per day (10 Mbps speed) for every household in Telangana; targeted at 67 lakh homes via FTTH fibre", hi: "तेलंगाना के प्रत्येक परिवार को 1 GB निःशुल्क इंटरनेट/दिन (10 Mbps स्पीड); FTTH फाइबर के माध्यम से 67 लाख घरों तक लक्ष्य" },
    tag:     { en: "Digital / Internet", hi: "डिजिटल / इंटरनेट" },
    annual: 0,
    apply:   { en: "https://tfiber.telangana.gov.in", hi: "tfiber.telangana.gov.in / नजदीकी MeeSeva केंद्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Address Proof", "Electricity Bill (for property verification)"],
               hi: ["आधार कार्ड", "पता प्रमाण", "बिजली बिल (संपत्ति सत्यापन के लिए)"] },
    match: (a) => a.state === "Telangana",
  },

  // ── 34. Rajiv Yuva Vikasam — Youth Employment Scheme ──────────────────────
  {
    id: "ts_rajiv_yuva_vikasam",
    icon: "🎯", color: "#0F766E", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Skill Development & Employment Dept.", hi: "तेलंगाना कौशल विकास एवं रोजगार विभाग" },
    name:    { en: "Rajiv Yuva Vikasam — Youth Employment Scheme (Telangana)", hi: "राजीव युवा विकासम — युवा रोजगार योजना (तेलंगाना)" },
    benefit: { en: "₹3,000/month financial assistance for unemployed educated youth (18–35 yrs) while they seek employment + free skill training linkage", hi: "रोजगार खोजते समय बेरोजगार शिक्षित युवाओं (18–35 वर्ष) को ₹3,000/माह वित्तीय सहायता + निःशुल्क कौशल प्रशिक्षण" },
    tag:     { en: "Youth / Unemployment", hi: "युवा / बेरोजगारी" },
    annual: 36000,
    apply:   { en: "https://www.etnownews.com/about/government-schemes/rajiv-yuva-vikasam-scheme", hi: "employment.telangana.gov.in / नजदीकी जिला रोजगार कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Certificates (min. Class 10)", "Unemployment / No Job Declaration", "Bank Account (Aadhaar-linked)", "Residence Proof", "Passport Photo"],
               hi: ["आधार कार्ड", "शैक्षिक प्रमाण पत्र (न्यूनतम कक्षा 10)", "बेरोजगारी / नौकरी न होने की घोषणा", "बैंक खाता (आधार लिंक)", "निवास प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Telangana" && a.age === "18to35" && ["below1", "1to3"].includes(a.income),
  },

  // ADD MORE TELANGANA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "telangana_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Telangana",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Telangana",
  // },

];
