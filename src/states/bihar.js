// Bihar — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "bihar_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const BIHAR_SCHEMES = [

  // ── GIRL CHILD / WOMEN ────────────────────────────────────────────────────

  {
    id: "bihar_kanya_utthan",
    icon: "👧", color: "#DC2626", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Women Development Corporation", hi: "बिहार महिला विकास निगम" },
    name:    { en: "Mukhyamantri Kanya Utthan Yojana (Bihar)",
               hi: "मुख्यमंत्री कन्या उत्थान योजना (बिहार)" },
    benefit: { en: "₹50,000 total disbursed in installments from birth to graduation — ₹2,000 at birth, ₹1,000 at vaccination, ₹2,000 at Class 1, ₹10,000 at Class 12 and ₹25,000 at graduation; for girls of all castes",
               hi: "जन्म से स्नातक तक कुल ₹50,000 किस्तों में — जन्म पर ₹2,000, टीकाकरण पर ₹1,000, कक्षा 1 पर ₹2,000, कक्षा 12 पर ₹10,000, स्नातक पर ₹25,000; सभी जातियों की बालिकाओं के लिए" },
    tag:     { en: "Girl Child / Education", hi: "बालिका / शिक्षा" },
    annual: 50000,
    apply:   { en: "https://medhasoft.bih.nic.in", hi: "medhasoft.bih.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (girl's)","Birth Certificate","Parent's Bank Account (Aadhaar-linked)","Income Certificate","Caste Certificate (if SC/ST)","School Enrollment Certificate (for Class 12 / graduation installment)","Parent's Aadhaar Card"],
               hi: ["आधार कार्ड (बालिका का)","जन्म प्रमाण पत्र","माता-पिता का बैंक खाता (आधार-लिंक्ड)","आय प्रमाण पत्र","जाति प्रमाण पत्र (SC/ST हेतु)","स्कूल नामांकन प्रमाण पत्र (कक्षा 12 / स्नातक किस्त के लिए)","माता-पिता का आधार कार्ड"] },
    match: (a) => a.state === "Bihar" && a.who === "student",
  },

  {
    id: "bihar_medhavritti",
    icon: "🎓", color: "#BE185D", scope: "state", state: "Bihar",
    ministry: { en: "Bihar SC/ST Welfare Dept.", hi: "बिहार अनुसूचित जाति/जनजाति कल्याण विभाग" },
    name:    { en: "Mukhyamantri Medhavritti Yojana (Bihar)",
               hi: "मुख्यमंत्री मेधावृत्ति योजना (बिहार)" },
    benefit: { en: "₹15,000 scholarship for SC/ST girls passing Class 12 in First Division; ₹10,000 for Second Division — direct bank transfer to encourage higher education",
               hi: "कक्षा 12 में प्रथम श्रेणी से उत्तीर्ण SC/ST छात्राओं को ₹15,000; द्वितीय श्रेणी के लिए ₹10,000 — उच्च शिक्षा प्रोत्साहन हेतु सीधे बैंक में" },
    tag:     { en: "Girl Student / SC-ST", hi: "छात्रा / SC-ST" },
    annual: 15000,
    apply:   { en: "https://medhasoft.bih.nic.in", hi: "medhasoft.bih.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 12 Marksheet (First / Second Division)","SC/ST Caste Certificate","Bank Account (girl's name, Aadhaar-linked)","School / Board Registration Certificate","Passport Photo","Domicile Certificate (Bihar)"],
               hi: ["आधार कार्ड","कक्षा 12 अंकसूची (प्रथम/द्वितीय श्रेणी)","SC/ST जाति प्रमाण पत्र","बैंक खाता (छात्रा के नाम, आधार-लिंक्ड)","स्कूल/बोर्ड पंजीकरण प्रमाण पत्र","पासपोर्ट फोटो","अधिवास प्रमाण पत्र (बिहार)"] },
    match: (a) => a.state === "Bihar" && a.who === "student" && ["sc","st"].includes(a.caste),
  },

  {
    id: "bihar_mahila_udyami",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Industries Dept. / Bihar Startup", hi: "बिहार उद्योग विभाग / बिहार स्टार्टअप" },
    name:    { en: "Mukhyamantri Mahila Udyami Yojana (Bihar)",
               hi: "मुख्यमंत्री महिला उद्यमी योजना (बिहार)" },
    benefit: { en: "₹10 lakh per woman entrepreneur: ₹5 lakh as outright grant (no repayment) + ₹5 lakh as interest-free loan repayable over 84 months; for starting a new manufacturing or service enterprise",
               hi: "महिला उद्यमी को ₹10 लाख: ₹5 लाख अनुदान (वापसी नहीं) + ₹5 लाख ब्याज-मुक्त ऋण 84 महीनों में चुकाने योग्य; नई विनिर्माण या सेवा इकाई शुरू करने के लिए" },
    tag:     { en: "Women / Entrepreneurship", hi: "महिला / उद्यमिता" },
    annual: 500000,
    apply:   { en: "udyami.bihar.gov.in", hi: "udyami.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","PAN Card","Bank Account (Aadhaar-linked)","10th Pass Certificate (minimum qualification)","Caste Certificate (if applicable)","Project Report / Business Plan","Residence Proof (Bihar domicile)","Passport Photo"],
               hi: ["आधार कार्ड","पैन कार्ड","बैंक खाता (आधार-लिंक्ड)","10वीं पास प्रमाण पत्र (न्यूनतम योग्यता)","जाति प्रमाण पत्र (यदि लागू हो)","प्रोजेक्ट रिपोर्ट / व्यापार योजना","निवास प्रमाण (बिहार अधिवास)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && a.who === "women",
  },

  // ── ENTREPRENEURSHIP ──────────────────────────────────────────────────────

  {
    id: "bihar_sc_st_udyami",
    icon: "🏭", color: "#0369A1", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Industries Dept.", hi: "बिहार उद्योग विभाग" },
    name:    { en: "Mukhyamantri SC/ST Udyami Yojana (Bihar)",
               hi: "मुख्यमंत्री SC/ST उद्यमी योजना (बिहार)" },
    benefit: { en: "₹10 lakh per SC/ST entrepreneur: ₹5 lakh outright grant + ₹5 lakh interest-free loan (repayable over 84 months); for setting up a new manufacturing/service/trade enterprise",
               hi: "SC/ST उद्यमी को ₹10 लाख: ₹5 लाख अनुदान + ₹5 लाख ब्याज-मुक्त ऋण (84 माह में); नई विनिर्माण/सेवा/व्यापार इकाई स्थापित करने के लिए" },
    tag:     { en: "SC/ST / Entrepreneurship", hi: "SC/ST / उद्यमिता" },
    annual: 500000,
    apply:   { en: "udyami.bihar.gov.in", hi: "udyami.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","PAN Card","SC/ST Caste Certificate","10th Pass Certificate","Bank Account (Aadhaar-linked)","Project Report","Residence Proof (Bihar)","Passport Photo"],
               hi: ["आधार कार्ड","पैन कार्ड","SC/ST जाति प्रमाण पत्र","10वीं पास प्रमाण पत्र","बैंक खाता (आधार-लिंक्ड)","प्रोजेक्ट रिपोर्ट","निवास प्रमाण (बिहार)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && ["sc","st"].includes(a.caste),
  },

  {
    id: "bihar_yuva_udyami",
    icon: "💼", color: "#D97706", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Industries Dept.", hi: "बिहार उद्योग विभाग" },
    name:    { en: "Mukhyamantri Yuva Udyami Yojana (Bihar)",
               hi: "मुख्यमंत्री युवा उद्यमी योजना (बिहार)" },
    benefit: { en: "₹10 lakh for General/OBC/EWS youth entrepreneurs (aged 18–50): ₹5 lakh grant + ₹5 lakh loan at 1% interest; for starting a new enterprise in manufacturing or service sector",
               hi: "सामान्य/OBC/EWS युवा उद्यमियों (18–50 वर्ष) के लिए ₹10 लाख: ₹5 लाख अनुदान + ₹5 लाख ऋण 1% ब्याज पर; विनिर्माण या सेवा क्षेत्र में नई इकाई शुरू करने के लिए" },
    tag:     { en: "Youth / Entrepreneurship", hi: "युवा / उद्यमिता" },
    annual: 500000,
    apply:   { en: "udyami.bihar.gov.in", hi: "udyami.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","PAN Card","Caste Certificate (OBC/EWS)","10th Pass Certificate","Bank Account (Aadhaar-linked)","Project Report","Residence Proof (Bihar)","Passport Photo"],
               hi: ["आधार कार्ड","पैन कार्ड","जाति प्रमाण पत्र (OBC/EWS)","10वीं पास प्रमाण पत्र","बैंक खाता (आधार-लिंक्ड)","प्रोजेक्ट रिपोर्ट","निवास प्रमाण (बिहार)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "bihar_laghu_udyami",
    icon: "🛒", color: "#15803D", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Industries Dept.", hi: "बिहार उद्योग विभाग" },
    name:    { en: "Bihar Laghu Udyami Yojana (Bihar)",
               hi: "बिहार लघु उद्यमी योजना (बिहार)" },
    benefit: { en: "₹2 lakh outright grant (no repayment) to one member of each BPL household to start a micro enterprise; covers 94 lakh poor families across Bihar; 3 installments of ₹25,000 / ₹50,000 / ₹1.25 lakh",
               hi: "प्रत्येक BPL परिवार के एक सदस्य को सूक्ष्म उद्यम शुरू करने के लिए ₹2 लाख अनुदान (वापसी नहीं); बिहार के 94 लाख गरीब परिवार पात्र; 3 किस्तों में: ₹25,000 / ₹50,000 / ₹1.25 लाख" },
    tag:     { en: "BPL / Micro Enterprise", hi: "BPL / सूक्ष्म उद्यम" },
    annual: 200000,
    apply:   { en: "udyami.bihar.gov.in", hi: "udyami.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card (showing BPL status)","Bank Account (Aadhaar-linked)","Caste Certificate (if applicable)","10th Pass / Literacy Certificate","Residence Proof (Bihar)","Passport Photo"],
               hi: ["आधार कार्ड","राशन कार्ड (BPL दर्शाने वाला)","बैंक खाता (आधार-लिंक्ड)","जाति प्रमाण पत्र (यदि लागू)","10वीं पास / साक्षरता प्रमाण पत्र","निवास प्रमाण (बिहार)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && ["below1","1to3"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "bihar_student_credit_card",
    icon: "💳", color: "#1D4ED8", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Education Dept. / Bihar Student Credit Card Cell", hi: "बिहार शिक्षा विभाग / बिहार छात्र क्रेडिट कार्ड सेल" },
    name:    { en: "Bihar Student Credit Card Scheme (7 Nischay)",
               hi: "बिहार स्टूडेंट क्रेडिट कार्ड योजना (सात निश्चय)" },
    benefit: { en: "Education loan up to ₹4 lakh at 4% simple interest (1% for girls, disabled & transgender) for higher education after Class 12; no collateral; moratorium till 1 year after course completion; covers tuition, hostel, books, laptop",
               hi: "कक्षा 12 के बाद उच्च शिक्षा के लिए ₹4 लाख तक का शिक्षा ऋण 4% साधारण ब्याज पर (लड़कियों/दिव्यांग/ट्रांसजेंडर के लिए 1%); कोई गारंटी नहीं; कोर्स पूरा होने के 1 वर्ष बाद तक ब्याज नहीं; ट्यूशन, हॉस्टल, किताब, लैपटॉप सब कवर" },
    tag:     { en: "Student / Education Loan", hi: "छात्र / शिक्षा ऋण" },
    annual: 400000,
    apply:   { en: "7nishchay-yuvaupmission.bihar.gov.in", hi: "7nishchay-yuvaupmission.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 12 Pass Certificate & Marksheet","Admission Letter from College / University","Bank Account (Aadhaar-linked)","Income Certificate (parents')","Residence Proof (Bihar domicile)","2 Passport Photos","Fee Structure from Institution"],
               hi: ["आधार कार्ड","कक्षा 12 उत्तीर्ण प्रमाण पत्र व अंकसूची","कॉलेज/विश्वविद्यालय का प्रवेश पत्र","बैंक खाता (आधार-लिंक्ड)","आय प्रमाण पत्र (माता-पिता का)","निवास प्रमाण (बिहार अधिवास)","2 पासपोर्ट फोटो","संस्थान से शुल्क संरचना"] },
    match: (a) => a.state === "Bihar" && a.who === "student",
  },

  {
    id: "bihar_cycle_yojana",
    icon: "🚲", color: "#0891B2", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Education Dept.", hi: "बिहार शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Cycle Yojana (Bihar)",
               hi: "मुख्यमंत्री साइकिल योजना (बिहार)" },
    benefit: { en: "Free cycle worth ₹3,000 for Class 9 students enrolled in govt. schools in rural Bihar; helps reduce dropout by enabling access to distant schools",
               hi: "ग्रामीण बिहार में सरकारी स्कूलों में कक्षा 9 में नामांकित छात्रों को ₹3,000 की मुफ्त साइकिल; दूरस्थ स्कूलों तक पहुंच आसान बनाकर ड्रॉपआउट घटाने में सहायक" },
    tag:     { en: "Student / Rural", hi: "छात्र / ग्रामीण" },
    annual: 3000,
    apply:   { en: "Apply via government school / District Education Officer",
               hi: "सरकारी स्कूल / जिला शिक्षा अधिकारी के माध्यम से आवेदन" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","School Enrollment Certificate (Class 9, Govt. School)","Residence Proof (Bihar rural area)","Parent's Aadhaar","Bank Account (for DBT in some districts)"],
               hi: ["आधार कार्ड","स्कूल नामांकन प्रमाण पत्र (कक्षा 9, सरकारी स्कूल)","निवास प्रमाण (बिहार ग्रामीण क्षेत्र)","माता-पिता का आधार","बैंक खाता (कुछ जिलों में DBT के लिए)"] },
    match: (a) => a.state === "Bihar" && a.who === "student" && a.area === "rural",
  },

  {
    id: "bihar_poshak_yojana",
    icon: "👕", color: "#7C3AED", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Education Dept.", hi: "बिहार शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Poshak Yojana (Bihar)",
               hi: "मुख्यमंत्री पोशाक योजना (बिहार)" },
    benefit: { en: "Annual uniform allowance for govt. school students: ₹600 (Class 1–2), ₹700 (Class 3–5), ₹1,000 (Class 6–8), ₹1,500 (Class 9–12); credited directly to student's bank account",
               hi: "सरकारी स्कूल के छात्रों को वार्षिक पोशाक भत्ता: ₹600 (कक्षा 1–2), ₹700 (कक्षा 3–5), ₹1,000 (कक्षा 6–8), ₹1,500 (कक्षा 9–12); सीधे बैंक खाते में" },
    tag:     { en: "Student / Uniform", hi: "छात्र / पोशाक" },
    annual: 1500,
    apply:   { en: "Apply via government school (no separate form — auto-enrolled)",
               hi: "सरकारी स्कूल के माध्यम से (अलग आवेदन नहीं — स्वतः नामांकित)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (student)","School Enrollment Certificate (Govt. School)","Bank Account (student/parent, Aadhaar-linked)"],
               hi: ["आधार कार्ड (छात्र का)","स्कूल नामांकन प्रमाण पत्र (सरकारी स्कूल)","बैंक खाता (छात्र/अभिभावक, आधार-लिंक्ड)"] },
    match: (a) => a.state === "Bihar" && a.who === "student",
  },

  // ── YOUTH EMPLOYMENT ──────────────────────────────────────────────────────

  {
    id: "bihar_swayam_bhatta",
    icon: "📋", color: "#EA580C", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Labour Resources Dept. / 7 Nischay Cell", hi: "बिहार श्रम संसाधन विभाग / सात निश्चय सेल" },
    name:    { en: "Mukhyamantri Swayam Sahayata Bhatta Yojana (Bihar)",
               hi: "मुख्यमंत्री स्वयं सहायता भत्ता योजना (बिहार)" },
    benefit: { en: "₹1,000/month for up to 2 years for unemployed youth aged 20–25 who have passed Class 12 from Bihar and are actively seeking employment; linked with skill training under Kushal Yuva Program",
               hi: "बिहार से कक्षा 12 पास, 20–25 वर्ष के बेरोजगार युवाओं को 2 वर्ष तक ₹1,000/माह; कुशल युवा कार्यक्रम के तहत कौशल प्रशिक्षण से जुड़ा" },
    tag:     { en: "Youth / Unemployment Allowance", hi: "युवा / बेरोजगारी भत्ता" },
    annual: 12000,
    apply:   { en: "7nishchay-yuvaupmission.bihar.gov.in", hi: "7nishchay-yuvaupmission.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 12 Pass Certificate","Bank Account (Aadhaar-linked)","Residence Proof (Bihar)","Employment Registration Certificate (from Rozgar Karyalay)","Affidavit of unemployment","Passport Photo"],
               hi: ["आधार कार्ड","कक्षा 12 उत्तीर्ण प्रमाण पत्र","बैंक खाता (आधार-लिंक्ड)","निवास प्रमाण (बिहार)","रोजगार कार्यालय पंजीकरण प्रमाण पत्र","बेरोजगारी का शपथ-पत्र","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && a.age === "18to35",
  },

  {
    id: "bihar_kushal_yuva",
    icon: "🔧", color: "#0F766E", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Skill Development Mission (BSDM)", hi: "बिहार कौशल विकास मिशन (BSDM)" },
    name:    { en: "Kushal Yuva Program — Bihar Skill Mission",
               hi: "कुशल युवा कार्यक्रम — बिहार कौशल मिशन" },
    benefit: { en: "Free 3–6 month skill training for youth aged 15–28: communication skills, basic IT (computer), and life skills; certificate on completion; linked to job placement; conducted at registered KYP centres across Bihar",
               hi: "15–28 वर्ष के युवाओं के लिए 3–6 माह का मुफ्त कौशल प्रशिक्षण: संचार कौशल, बेसिक IT (कंप्यूटर), जीवन कौशल; पूर्णता पर प्रमाण पत्र; नौकरी प्लेसमेंट से जुड़ा; पंजीकृत KYP केंद्रों पर" },
    tag:     { en: "Youth / Skill Training", hi: "युवा / कौशल प्रशिक्षण" },
    annual: 0,
    apply:   { en: "skillmissionbihar.org", hi: "skillmissionbihar.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 10 Pass Certificate (minimum)","Bank Account","Residence Proof (Bihar)","Passport Photo"],
               hi: ["आधार कार्ड","कक्षा 10 उत्तीर्ण प्रमाण पत्र (न्यूनतम)","बैंक खाता","निवास प्रमाण (बिहार)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && a.age === "18to35",
  },

  // ── FARMER ────────────────────────────────────────────────────────────────

  {
    id: "bihar_fasal_sahayata",
    icon: "🌾", color: "#15803D", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Co-operative Dept. / Fasal Sahayata Cell", hi: "बिहार सहकारिता विभाग / फसल सहायता सेल" },
    name:    { en: "Bihar Rajya Fasal Sahayata Yojana (Bihar)",
               hi: "बिहार राज्य फसल सहायता योजना (बिहार)" },
    benefit: { en: "Crop loss compensation: ₹7,500/hectare for up to 20% crop loss; ₹10,000/hectare for more than 20% loss; covers Kharif & Rabi crops; all registered farmers eligible; no premium required — fully state-funded",
               hi: "फसल नुकसान मुआवज़ा: 20% तक नुकसान पर ₹7,500/हेक्टेयर; 20% से अधिक नुकसान पर ₹10,000/हेक्टेयर; खरीफ व रबी दोनों फसलें कवर; सभी पंजीकृत किसान पात्र; कोई प्रीमियम नहीं — पूर्णतः राज्य-वित्तपोषित" },
    tag:     { en: "Farmer / Crop Insurance", hi: "किसान / फसल बीमा" },
    annual: 10000,
    apply:   { en: "pacsonline.bih.nic.in", hi: "pacsonline.bih.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khatian / Khesra)","Bank Account (Aadhaar-linked)","Farmer Registration Certificate","Mobile Number linked to Aadhaar","Passport Photo"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खतियान / खेसरा)","बैंक खाता (आधार-लिंक्ड)","किसान पंजीकरण प्रमाण पत्र","आधार से जुड़ा मोबाइल नंबर","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && a.who === "farmer",
  },

  {
    id: "bihar_krishi_input",
    icon: "🌱", color: "#4D7C0F", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Agriculture Dept.", hi: "बिहार कृषि विभाग" },
    name:    { en: "Bihar Krishi Input Anudan Yojana (Bihar)",
               hi: "बिहार कृषि इनपुट अनुदान योजना (बिहार)" },
    benefit: { en: "Agriculture input subsidy for crop loss due to natural calamity: ₹13,500/hectare for irrigated land; ₹6,800/hectare for rain-fed land; ₹12,000/hectare for perennial crop damage; DBT to farmer's bank account",
               hi: "प्राकृतिक आपदा से फसल नुकसान पर कृषि इनपुट अनुदान: सिंचित भूमि पर ₹13,500/हेक्टेयर; वर्षाश्रित भूमि पर ₹6,800/हेक्टेयर; बारहमासी फसल नुकसान पर ₹12,000/हेक्टेयर; DBT से किसान के बैंक खाते में" },
    tag:     { en: "Farmer / Natural Calamity", hi: "किसान / प्राकृतिक आपदा" },
    annual: 13500,
    apply:   { en: "https://dbtagriculture.bihar.gov.in", hi: "dbtagriculture.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khatian / Khesra number)","Bank Account (Aadhaar-linked)","Farmer Registration on DBT Agriculture Portal","Affidavit of crop loss (self-declaration)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खतियान / खेसरा नंबर)","बैंक खाता (आधार-लिंक्ड)","DBT कृषि पोर्टल पर किसान पंजीकरण","फसल नुकसान का स्व-घोषणा शपथ-पत्र"] },
    match: (a) => a.state === "Bihar" && a.who === "farmer",
  },

  {
    id: "bihar_diesel_anudan",
    icon: "⛽", color: "#B45309", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Agriculture Dept.", hi: "बिहार कृषि विभाग" },
    name:    { en: "Bihar Diesel Anudan Yojana (Bihar)",
               hi: "बिहार डीज़ल अनुदान योजना (बिहार)" },
    benefit: { en: "Diesel subsidy of ₹50/litre (up to 400 litres/acre, max 8 acres) for farmers using diesel pump irrigation during drought/dry spells on Kharif crops; directly credited to bank account",
               hi: "खरीफ फसलों के दौरान सूखे/शुष्क अवधि में डीज़ल पंप सिंचाई के लिए ₹50/लीटर (अधिकतम 400 लीटर/एकड़, 8 एकड़ तक) की सब्सिडी; सीधे बैंक खाते में" },
    tag:     { en: "Farmer / Irrigation", hi: "किसान / सिंचाई" },
    annual: 20000,
    apply:   { en: "https://dbtagriculture.bihar.gov.in", hi: "dbtagriculture.bihar.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khesra / Khatian)","Bank Account (Aadhaar-linked)","Farmer Registration on DBT Portal","Diesel purchase receipt / pump operator certificate","Mobile number (Aadhaar-linked)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (खेसरा / खतियान)","बैंक खाता (आधार-लिंक्ड)","DBT पोर्टल पर किसान पंजीकरण","डीज़ल खरीद रसीद / पंप ऑपरेटर प्रमाण पत्र","मोबाइल नंबर (आधार-लिंक्ड)"] },
    match: (a) => a.state === "Bihar" && a.who === "farmer",
  },

  // ── TRANSPORT / RURAL ─────────────────────────────────────────────────────

  {
    id: "bihar_gram_parivahan",
    icon: "🚕", color: "#DC2626", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Transport Dept.", hi: "बिहार परिवहन विभाग" },
    name:    { en: "Mukhyamantri Gram Parivahan Yojana (Bihar)",
               hi: "मुख्यमंत्री ग्राम परिवहन योजना (बिहार)" },
    benefit: { en: "50% subsidy (up to ₹1 lakh) on purchase of 4-wheeler commercial vehicle (auto, e-rickshaw, mini van) to provide public transport in rural Bihar; for SC/ST/EWS individuals aged 21–45 from villages without vehicle owners",
               hi: "ग्रामीण बिहार में सार्वजनिक परिवहन के लिए 4-पहिया वाणिज्यिक वाहन (ऑटो, ई-रिक्शा, मिनी वैन) खरीद पर 50% सब्सिडी (₹1 लाख तक); 21–45 वर्ष SC/ST/EWS के लोगों के लिए जिनके गांव में वाहन मालिक नहीं हैं" },
    tag:     { en: "SC/ST/EWS / Transport", hi: "SC/ST/EWS / परिवहन" },
    annual: 100000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/mmppy", hi: "state.bihar.gov.in/transport" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC/ST/EWS)","Age Proof","Residence Proof (Bihar rural village)","Driving Licence","Bank Account (Aadhaar-linked)","Income Certificate (annual income < ₹3 lakh)","Passport Photo"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC/ST/EWS)","आयु प्रमाण","निवास प्रमाण (बिहार ग्रामीण गांव)","ड्राइविंग लाइसेंस","बैंक खाता (आधार-लिंक्ड)","आय प्रमाण पत्र (वार्षिक ₹3 लाख से कम)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && a.area === "rural" && ["sc","st","ews"].includes(a.caste),
  },

  // ── SENIOR CITIZEN ────────────────────────────────────────────────────────

  {
    id: "bihar_vridhjan_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Social Welfare Dept.", hi: "बिहार समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Vridhjan Pension Yojana (Bihar)",
               hi: "मुख्यमंत्री वृद्धजन पेंशन योजना (बिहार)" },
    benefit: { en: "₹400/month pension for all senior citizens aged 60–79 years; ₹500/month for those aged 80 and above; universal — no income bar, no caste condition; directly credited to bank account every month",
               hi: "60–79 वर्ष के सभी वृद्धजनों को ₹400/माह पेंशन; 80 वर्ष व उससे अधिक आयु के लिए ₹500/माह; सार्वभौमिक — कोई आय सीमा नहीं, कोई जाति शर्त नहीं; हर माह बैंक खाते में सीधे" },
    tag:     { en: "Senior Citizen / Pension", hi: "वृद्धजन / पेंशन" },
    annual: 6000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/mvpy-bihar", hi: "sspmis.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (Birth Certificate / Voter ID)","Bank Account (Aadhaar-linked)","Residence Proof (Bihar)","Two Passport Photos"],
               hi: ["आधार कार्ड","आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)","बैंक खाता (आधार-लिंक्ड)","निवास प्रमाण (बिहार)","दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Bihar" && (a.who === "senior" || a.age === "above60"),
  },

  // ── SOCIAL SUPPORT ────────────────────────────────────────────────────────

  {
    id: "bihar_kabir_antyeshti",
    icon: "🕊️", color: "#475569", scope: "state", state: "Bihar",
    ministry: { en: "Bihar SC/ST Welfare Dept.", hi: "बिहार अनुसूचित जाति/जनजाति कल्याण विभाग" },
    name:    { en: "Kabir Antyeshti Anudan Yojana (Bihar)",
               hi: "कबीर अंत्येष्टि अनुदान योजना (बिहार)" },
    benefit: { en: "₹3,000 one-time financial assistance to BPL families for funeral / last rites expenses; available for all castes and religions across Bihar; paid within 48 hours of application through Block / Panchayat office",
               hi: "BPL परिवारों को अंतिम संस्कार / अंत्येष्टि खर्च के लिए ₹3,000 एकमुश्त सहायता; बिहार में सभी जातियों और धर्मों के लिए; Block/Pंचायत कार्यालय से आवेदन के 48 घंटे के अंदर भुगतान" },
    tag:     { en: "BPL / Funeral Assistance", hi: "BPL / अंत्येष्टि सहायता" },
    annual: 3000,
    apply:   { en: "Apply at Block / Panchayat office (offline — within 7 days of death)",
               hi: "Block / Pंचायत कार्यालय पर आवेदन (ऑफलाइन — मृत्यु के 7 दिनों के भीतर)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (deceased and applicant)","BPL Ration Card","Death Certificate / Death report","Bank Account of applicant (Aadhaar-linked)","Residence Proof"],
               hi: ["आधार कार्ड (मृतक और आवेदक का)","BPL राशन कार्ड","मृत्यु प्रमाण पत्र / मृत्यु रिपोर्ट","आवेदक का बैंक खाता (आधार-लिंक्ड)","निवास प्रमाण"] },
    match: (a) => a.state === "Bihar" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "bihar_minority_scholarship",
    icon: "📖", color: "#0369A1", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Minority Welfare Dept.", hi: "बिहार अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "Mukhyamantri Alpsankhyak Chhatrvrikti Yojana (Bihar)",
               hi: "मुख्यमंत्री अल्पसंख्यक छात्रवृत्ति योजना (बिहार)" },
    benefit: { en: "Post-Matric scholarship for minority students (Muslim, Sikh, Christian, Buddhist, Jain, Parsi) in higher education: ₹1,000–₹3,000/month stipend + tuition and admission fee reimbursement at govt./aided institutions",
               hi: "उच्च शिक्षा में अल्पसंख्यक छात्रों (मुस्लिम, सिख, ईसाई, बौद्ध, जैन, पारसी) के लिए पोस्ट-मैट्रिक छात्रवृत्ति: ₹1,000–₹3,000/माह वजीफा + सरकारी/सहायता प्राप्त संस्थान में ट्यूशन व प्रवेश शुल्क प्रतिपूर्ति" },
    tag:     { en: "Student / Minority", hi: "छात्र / अल्पसंख्यक" },
    annual: 36000,
    apply:   { en: "https://pfms.nic.in", hi: "pfms.nic.in / राज्य अल्पसंख्यक कल्याण पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate (e.g. Muslim, Sikh etc.)","Class 10 / 12 Marksheet","College/University Admission Certificate","Family Income Certificate (annual income < ₹2 lakh)","Bank Account (Aadhaar-linked)","Domicile Certificate (Bihar)"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र (जैसे मुस्लिम, सिख आदि)","कक्षा 10/12 अंकसूची","कॉलेज/विश्वविद्यालय प्रवेश प्रमाण पत्र","पारिवारिक आय प्रमाण पत्र (वार्षिक ₹2 लाख से कम)","बैंक खाता (आधार-लिंक्ड)","अधिवास प्रमाण पत्र (बिहार)"] },
    match: (a) => a.state === "Bihar" && a.who === "student",
  },

  // ADD MORE BIHAR SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "bihar_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Bihar",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Bihar",
  // },

];
