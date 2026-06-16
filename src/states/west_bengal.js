// West Bengal — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "wb_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const WEST_BENGAL_SCHEMES = [

  // ── WOMEN ─────────────────────────────────────────────────────────────────

  {
    id: "wb_lakshmir_bhandar",
    icon: "👩", color: "#BE185D", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Women & Child Development Dept.", hi: "पश्चिम बंगाल महिला एवं बाल विकास विभाग" },
    name:    { en: "Lakshmir Bhandar Scheme (West Bengal)",
               hi: "लक्ष्मीर भंडार योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹1,000/month for SC/ST women household heads; ₹500/month for General/OBC women household heads; aged 25–60; no income bar — over 2 crore women benefited across WB",
               hi: "SC/ST महिला परिवार मुखियाओं को ₹1,000/माह; सामान्य/OBC को ₹500/माह; आयु 25–60 वर्ष; कोई आय सीमा नहीं — पश्चिम बंगाल में 2 करोड़ से अधिक महिलाएं लाभान्वित" },
    tag:     { en: "Women / Direct Cash", hi: "महिला / नकद सहायता" },
    annual: 12000,
    apply:   { en: "socialsecurity.wb.gov.in · also via Duare Sarkar camps", hi: "socialsecurity.wb.gov.in · दुआरे सरकार कैम्प से भी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Voter ID (West Bengal)","Ration Card","Bank Account (woman's name, Aadhaar-linked)","SC/ST Caste Certificate (for ₹1,000 slab)","Passport Photo"],
               hi: ["आधार कार्ड","मतदाता पहचान पत्र (पश्चिम बंगाल)","राशन कार्ड","बैंक खाता (महिला के नाम, आधार-लिंक्ड)","SC/ST जाति प्रमाण पत्र (₹1,000 स्लैब के लिए)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.who === "women",
  },

  {
    id: "wb_kanyashree",
    icon: "📚", color: "#9333EA", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Women & Child Development Dept.", hi: "पश्चिम बंगाल महिला एवं बाल विकास विभाग" },
    name:    { en: "Kanyashree Prakalpa (West Bengal)",
               hi: "कन्याश्री प्रकल्प (पश्चिम बंगाल)" },
    benefit: { en: "K1: ₹1,000/year annual scholarship for unmarried girls aged 13–18 in Class 8–12 (family income < ₹1.2 lakh/year); K2: ₹25,000 one-time grant when girl turns 18 and remains unmarried in education; UN award-winning scheme",
               hi: "K1: कक्षा 8–12 में पढ़ रही 13–18 वर्ष की अविवाहित छात्राओं को ₹1,000/वर्ष वार्षिक छात्रवृत्ति (पारिवारिक आय ₹1.2 लाख/वर्ष से कम); K2: 18 वर्ष होने पर अविवाहित व शिक्षा में रहने पर ₹25,000 एकमुश्त; UN पुरस्कार प्राप्त योजना" },
    tag:     { en: "Girl Student / Anti-Child Marriage", hi: "छात्रा / बाल विवाह विरोधी" },
    annual: 25000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/wbkanyashree", hi: "wbkanyashree.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate / Age Proof","School Enrollment Certificate (Class 8–12)","Income Certificate (family income < ₹1.2 lakh/year)","Bank Account (girl's name)","Unmarried Declaration (self-attested)","Passport Photo"],
               hi: ["आधार कार्ड","जन्म प्रमाण पत्र / आयु प्रमाण","स्कूल नामांकन प्रमाण पत्र (कक्षा 8–12)","आय प्रमाण पत्र (पारिवारिक आय ₹1.2 लाख/वर्ष से कम)","बैंक खाता (छात्रा के नाम)","अविवाहित घोषणा (स्व-सत्यापित)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.who === "student",
  },

  {
    id: "wb_rupashree",
    icon: "💍", color: "#E11D48", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Women & Child Development Dept.", hi: "पश्चिम बंगाल महिला एवं बाल विकास विभाग" },
    name:    { en: "Rupashree Prakalpa (West Bengal)",
               hi: "रूपश्री प्रकल्प (पश्चिम बंगाल)" },
    benefit: { en: "₹25,000 one-time financial grant for marriage of girls aged 18+ from families with annual income below ₹1.5 lakh; paid directly to bride's bank account before the marriage date",
               hi: "₹1.5 लाख/वर्ष से कम आय वाले परिवारों की 18+ वर्षीय लड़की के विवाह के लिए ₹25,000 एकमुश्त अनुदान; विवाह तिथि से पहले दुल्हन के बैंक खाते में सीधे" },
    tag:     { en: "Women / Marriage Grant", hi: "महिला / विवाह अनुदान" },
    annual: 25000,
    apply:   { en: "https://wbrupashree.gov.in", hi: "wbrupashree.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (bride)","Birth Certificate (girl aged 18+)","Income Certificate (family income < ₹1.5 lakh/year)","Bank Account (bride's name)","Marriage Invitation / Proof of marriage date","Voter ID / Domicile Certificate (West Bengal)","Passport Photo"],
               hi: ["आधार कार्ड (दुल्हन का)","जन्म प्रमाण पत्र (18+ वर्षीय लड़की)","आय प्रमाण पत्र (पारिवारिक आय ₹1.5 लाख/वर्ष से कम)","बैंक खाता (दुल्हन के नाम)","विवाह निमंत्रण / विवाह तिथि का प्रमाण","मतदाता ID / अधिवास प्रमाण पत्र (पश्चिम बंगाल)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "wb_swasthya_sathi",
    icon: "🏥", color: "#0369A1", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Health & Family Welfare Dept.", hi: "पश्चिम बंगाल स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Swasthya Sathi Scheme (West Bengal)",
               hi: "स्वास्थ्य साथी योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹5 lakh/year cashless hospitalization for the entire family; smart card issued in woman's name; covers 1,600+ empanelled hospitals (govt + pvt); no premium; covers pre-existing illnesses; available to all WB families except central govt employees",
               hi: "पूरे परिवार के लिए ₹5 लाख/वर्ष कैशलेस अस्पताल भर्ती; महिला के नाम पर स्मार्ट कार्ड; 1,600+ सूचीबद्ध अस्पताल (सरकारी + निजी); कोई प्रीमियम नहीं; पहले से बीमारियां भी कवर; केंद्रीय सरकारी कर्मचारियों को छोड़ सभी WB परिवारों के लिए" },
    tag:     { en: "Health / Cashless Treatment", hi: "स्वास्थ्य / कैशलेस इलाज" },
    annual: 500000,
    apply:   { en: "swasthyasathi.gov.in · also via Duare Sarkar camps", hi: "swasthyasathi.gov.in · दुआरे सरकार कैम्प से भी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (family members)","Ration Card / Voter ID","Bank Account (woman's name)","Family Photo","Residence Proof (West Bengal)"],
               hi: ["आधार कार्ड (परिवार के सदस्यों का)","राशन कार्ड / मतदाता ID","बैंक खाता (महिला के नाम)","पारिवारिक फोटो","निवास प्रमाण (पश्चिम बंगाल)"] },
    match: (a) => a.state === "West Bengal",
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "wb_sabuj_sathi",
    icon: "🚲", color: "#15803D", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal School Education Dept.", hi: "पश्चिम बंगाल स्कूल शिक्षा विभाग" },
    name:    { en: "Sabuj Sathi Scheme (West Bengal)",
               hi: "সবুজ সাথী / सबुज साथी योजना (पश्चिम बंगाल)" },
    benefit: { en: "Free bicycle for all students enrolled in Class 9–12 in govt., govt.-aided schools and madrasas across West Bengal; gender-neutral; over 1 crore bicycles distributed since launch",
               hi: "पश्चिम बंगाल के सरकारी, सरकारी-सहायता प्राप्त स्कूलों और मदरसों में कक्षा 9–12 के सभी छात्रों को मुफ्त साइकिल; लिंग-तटस्थ; लॉन्च के बाद से 1 करोड़ से अधिक साइकिलें वितरित" },
    tag:     { en: "Student / Free Bicycle", hi: "छात्र / मुफ्त साइकिल" },
    annual: 5000,
    apply:   { en: "Apply via government school (auto-enrolled — no separate form needed)",
               hi: "सरकारी स्कूल के माध्यम से (स्वतः नामांकित — अलग फॉर्म की ज़रूरत नहीं)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","School Enrollment Certificate (Class 9–12, Govt./Aided school)","Residence Proof (West Bengal)"],
               hi: ["आधार कार्ड","स्कूल नामांकन प्रमाण पत्र (कक्षा 9–12, सरकारी/सहायता प्राप्त स्कूल)","निवास प्रमाण (पश्चिम बंगाल)"] },
    match: (a) => a.state === "West Bengal" && a.who === "student",
  },

  {
    id: "wb_student_credit_card",
    icon: "💳", color: "#1D4ED8", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Higher Education Dept.", hi: "पश्चिम बंगाल उच्च शिक्षा विभाग" },
    name:    { en: "West Bengal Student Credit Card Scheme",
               hi: "पश्चिम बंगाल स्टूडेंट क्रेडिट कार्ड योजना" },
    benefit: { en: "Education loan up to ₹10 lakh at 4% simple interest (0% for women, disabled & transgender students) for higher education after Class 12; no collateral; no income limit; repayment begins 1 year after getting a job; covers tuition, hostel, books, laptop",
               hi: "कक्षा 12 के बाद उच्च शिक्षा के लिए ₹10 लाख तक का शिक्षा ऋण 4% साधारण ब्याज पर (महिलाओं, दिव्यांग और ट्रांसजेंडर के लिए 0%); कोई गारंटी नहीं; कोई आय सीमा नहीं; नौकरी मिलने के 1 वर्ष बाद चुकाना शुरू; ट्यूशन, हॉस्टल, किताब, लैपटॉप सब कवर" },
    tag:     { en: "Student / Education Loan", hi: "छात्र / शिक्षा ऋण" },
    annual: 1000000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/wbsccs", hi: "wbscc.wb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 12 Pass Certificate & Marksheet","Admission Letter from College / University","Bank Account (Aadhaar-linked)","Residence Proof (West Bengal domicile)","Fee Structure from Institution","2 Passport Photos"],
               hi: ["आधार कार्ड","कक्षा 12 उत्तीर्ण प्रमाण पत्र व अंकसूची","कॉलेज/विश्वविद्यालय का प्रवेश पत्र","बैंक खाता (आधार-लिंक्ड)","निवास प्रमाण (पश्चिम बंगाल अधिवास)","संस्थान से शुल्क संरचना","2 पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.who === "student",
  },

  {
    id: "wb_shikshashree",
    icon: "📖", color: "#7C3AED", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal SC/ST Welfare Dept.", hi: "पश्चिम बंगाल SC/ST कल्याण विभाग" },
    name:    { en: "Shikshashree Scholarship (West Bengal)",
               hi: "শিক্ষাশ্রী / शिक्षाश्री छात्रवृत्ति (पश्चिम बंगाल)" },
    benefit: { en: "Annual scholarship for SC/ST students in Class 5–8 in govt./govt.-aided schools: ₹800/year (Class 5–6); ₹1,000/year (Class 7–8); ₹1,300/year (Class 9–10); paid directly to student's bank account",
               hi: "सरकारी/सरकारी-सहायता प्राप्त स्कूलों में कक्षा 5–8 के SC/ST छात्रों के लिए वार्षिक छात्रवृत्ति: ₹800/वर्ष (कक्षा 5–6); ₹1,000/वर्ष (कक्षा 7–8); ₹1,300/वर्ष (कक्षा 9–10); सीधे बैंक खाते में" },
    tag:     { en: "Student / SC-ST", hi: "छात्र / SC-ST" },
    annual: 1300,
    apply:   { en: "https://oasis.wb.gov.in", hi: "oasis.wb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SC/ST Caste Certificate","School Enrollment Certificate","Bank Account (student / parent, Aadhaar-linked)","Income Certificate (family income < ₹2.5 lakh/year)","Previous Year Marksheet"],
               hi: ["आधार कार्ड","SC/ST जाति प्रमाण पत्र","स्कूल नामांकन प्रमाण पत्र","बैंक खाता (छात्र/अभिभावक, आधार-लिंक्ड)","आय प्रमाण पत्र (पारिवारिक आय ₹2.5 लाख/वर्ष से कम)","पिछले वर्ष की अंकसूची"] },
    match: (a) => a.state === "West Bengal" && a.who === "student" && ["sc","st"].includes(a.caste),
  },

  {
    id: "wb_aikyashree",
    icon: "🕌", color: "#0F766E", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Minority Affairs & Madrasha Education Dept.", hi: "पश्चिम बंगाल अल्पसंख्यक मामले एवं मदरसा शिक्षा विभाग" },
    name:    { en: "Aikyashree Scholarship (West Bengal)",
               hi: "ঐক্যশ্রী / ऐक्यश्री छात्रवृत्ति (पश्चिम बंगाल)" },
    benefit: { en: "Pre-matric & Post-matric scholarship for minority students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi): ₹1,000–₹3,000/month stipend for post-matric + admission & tuition fee reimbursement; family income < ₹2 lakh/year",
               hi: "अल्पसंख्यक छात्रों (मुस्लिम, ईसाई, सिख, बौद्ध, जैन, पारसी) के लिए प्री-मैट्रिक और पोस्ट-मैट्रिक छात्रवृत्ति: पोस्ट-मैट्रिक के लिए ₹1,000–₹3,000/माह वजीफा + प्रवेश व ट्यूशन शुल्क प्रतिपूर्ति; पारिवारिक आय ₹2 लाख/वर्ष से कम" },
    tag:     { en: "Student / Minority", hi: "छात्र / अल्पसंख्यक" },
    annual: 36000,
    apply:   { en: "https://www.govtschemes.in/west-bengal-aikyashree-scheme", hi: "wbmdfcscholar.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate","Class 10 / 12 Marksheet","College / University Admission Certificate","Family Income Certificate (< ₹2 lakh/year)","Bank Account (Aadhaar-linked)","Domicile Certificate (West Bengal)"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र","कक्षा 10/12 अंकसूची","कॉलेज/विश्वविद्यालय प्रवेश प्रमाण पत्र","पारिवारिक आय प्रमाण पत्र (₹2 लाख/वर्ष से कम)","बैंक खाता (आधार-लिंक्ड)","अधिवास प्रमाण पत्र (पश्चिम बंगाल)"] },
    match: (a) => a.state === "West Bengal" && a.who === "student",
  },

  {
    id: "wb_taruner_swapna",
    icon: "💻", color: "#0891B2", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal School Education Dept.", hi: "पश्चिम बंगाल स्कूल शिक्षा विभाग" },
    name:    { en: "Taruner Swapna — Free Tablet Scheme (West Bengal)",
               hi: "তরুণের স্বপ্ন / तरुणेर स्वप्न — मुफ्त टैबलेट योजना (पश्चिम बंगाल)" },
    benefit: { en: "Free Android tablet to Class 12 students who appeared in the WB Board (WBCHSE / Madrasah Board) examinations from govt./govt.-aided schools; digital learning tool to bridge the digital divide",
               hi: "सरकारी/सरकारी-सहायता प्राप्त स्कूलों से WB बोर्ड (WBCHSE/मदरसा बोर्ड) कक्षा 12 परीक्षा में शामिल छात्रों को मुफ्त Android टैबलेट; डिजिटल खाई पाटने के लिए डिजिटल शिक्षा उपकरण" },
    tag:     { en: "Student / Digital Learning", hi: "छात्र / डिजिटल शिक्षा" },
    annual: 10000,
    apply:   { en: "Distributed via school / WBCHSE Board — no separate application",
               hi: "स्कूल / WBCHSE बोर्ड के माध्यम से वितरण — अलग आवेदन नहीं" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Class 12 Board Admit Card","School Enrollment Certificate (Govt./Aided School)","Residence Proof (West Bengal)"],
               hi: ["आधार कार्ड","कक्षा 12 बोर्ड प्रवेश पत्र","स्कूल नामांकन प्रमाण पत्र (सरकारी/सहायता प्राप्त स्कूल)","निवास प्रमाण (पश्चिम बंगाल)"] },
    match: (a) => a.state === "West Bengal" && a.who === "student",
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "wb_yuvashree",
    icon: "📋", color: "#EA580C", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Labour Dept. / Employment Bank", hi: "पश्चिम बंगाल श्रम विभाग / रोजगार बैंक" },
    name:    { en: "Yuvashree Arpan Scheme (West Bengal)",
               hi: "যুবশ্রী আরপণ / युवश्री अर्पण योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹1,500/month for up to 3 years for educated unemployed youth aged 18–45 from BPL/SEGY families who have passed Class 8 minimum; linked with training/apprenticeship; registered on Employment Bank of WB",
               hi: "BPL/SEGY परिवारों के 18–45 वर्ष के शिक्षित बेरोजगार युवाओं को 3 वर्ष तक ₹1,500/माह; न्यूनतम कक्षा 8 उत्तीर्ण; WB रोजगार बैंक में पंजीकरण और प्रशिक्षण/शिक्षुता से जुड़ा" },
    tag:     { en: "Youth / Unemployment Allowance", hi: "युवा / बेरोजगारी भत्ता" },
    annual: 18000,
    apply:   { en: "https://employmentbankwb.gov.in", hi: "employmentbankwb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 8 Pass Certificate (minimum)","BPL / SEGY Certificate (or Ration Card)","Employment Bank Registration Certificate","Bank Account (Aadhaar-linked)","Residence Proof (West Bengal)","Passport Photo"],
               hi: ["आधार कार्ड","कक्षा 8 उत्तीर्ण प्रमाण पत्र (न्यूनतम)","BPL/SEGY प्रमाण पत्र (या राशन कार्ड)","रोजगार बैंक पंजीकरण प्रमाण पत्र","बैंक खाता (आधार-लिंक्ड)","निवास प्रमाण (पश्चिम बंगाल)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.age === "18to35" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "wb_utkarsh_bangla",
    icon: "🔧", color: "#D97706", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Technical Education & Training Dept.", hi: "पश्चिम बंगाल तकनीकी शिक्षा एवं प्रशिक्षण विभाग" },
    name:    { en: "Utkarsh Bangla — Skill Training (West Bengal)",
               hi: "উৎকর্ষ বাংলা / उत्कर्ष बांग्ला — कौशल प्रशिक्षण (पश्चिम बंगाल)" },
    benefit: { en: "Free short-term skill training (3–6 months) in 200+ trades (electrical, plumbing, IT, beauty, hospitality, garments etc.) for youth aged 14–45; stipend during training; certificate from NSDC/State Board; placement support",
               hi: "14–45 वर्ष के युवाओं के लिए 200+ ट्रेडों (इलेक्ट्रिकल, प्लंबिंग, IT, ब्यूटी, आतिथ्य, वस्त्र आदि) में 3–6 माह का मुफ्त अल्पकालिक कौशल प्रशिक्षण; प्रशिक्षण के दौरान वजीफा; NSDC/राज्य बोर्ड से प्रमाण पत्र; प्लेसमेंट सहायता" },
    tag:     { en: "Youth / Skill Training", hi: "युवा / कौशल प्रशिक्षण" },
    annual: 0,
    apply:   { en: "https://jalpaiguri.gov.in/pbssd-utkarsh-bangla", hi: "utkarshbangla.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 8 Pass Certificate (minimum)","Bank Account","Residence Proof (West Bengal)","Passport Photo"],
               hi: ["आधार कार्ड","कक्षा 8 उत्तीर्ण प्रमाण पत्र (न्यूनतम)","बैंक खाता","निवास प्रमाण (पश्चिम बंगाल)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && ["18to35","35to60"].includes(a.age),
  },

  // ── FARMER ────────────────────────────────────────────────────────────────

  {
    id: "wb_krishak_bandhu",
    icon: "🌾", color: "#15803D", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Agriculture Dept.", hi: "पश्चिम बंगाल कृषि विभाग" },
    name:    { en: "Krishak Bandhu Scheme (West Bengal)",
               hi: "কৃষক বন্ধু / कृषक बंधु योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹10,000/year for farmers owning ≥1 acre: paid in 2 installments of ₹5,000 (Kharif + Rabi); ₹4,000/year for farmers owning < 1 acre; PLUS ₹2 lakh life insurance coverage for the farmer; all registered farmers in WB eligible",
               hi: "1 एकड़ या अधिक भूमि वाले किसानों को ₹10,000/वर्ष: 2 किस्तों में (₹5,000 खरीफ + ₹5,000 रबी); 1 एकड़ से कम के लिए ₹4,000/वर्ष; साथ में ₹2 लाख का जीवन बीमा; WB के सभी पंजीकृत किसान पात्र" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 10000,
    apply:   { en: "https://krishakbandhu.net", hi: "krishakbandhu.net" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Parcha / Khatian)","Bank Account (Aadhaar-linked)","Voter ID (West Bengal)","Mobile Number (Aadhaar-linked)","Passport Photo"],
               hi: ["आधार कार्ड","भूमि अभिलेख (परचा / खतियान)","बैंक खाता (आधार-लिंक्ड)","मतदाता ID (पश्चिम बंगाल)","मोबाइल नंबर (आधार-लिंक्ड)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.who === "farmer",
  },

  {
    id: "wb_bangla_shasya_bima",
    icon: "🌱", color: "#4D7C0F", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Agriculture Dept.", hi: "पश्चिम बंगाल कृषि विभाग" },
    name:    { en: "Bangla Shasya Bima — Crop Insurance (West Bengal)",
               hi: "বাংলা শস্য বীমা / बांग्ला शस्य बीमा — फसल बीमा (पश्चिम बंगाल)" },
    benefit: { en: "State-funded crop insurance for Kharif and Rabi: premium fully paid by WB Govt. (farmer pays nothing); compensation based on actual area yield shortfall; covers paddy, jute, maize, vegetables and other notified crops",
               hi: "खरीफ और रबी के लिए राज्य-वित्तपोषित फसल बीमा: प्रीमियम पूर्णतः WB सरकार देती है (किसान को कुछ नहीं देना); वास्तविक क्षेत्र उपज कमी के आधार पर मुआवज़ा; धान, जूट, मक्का, सब्जियां और अन्य अधिसूचित फसलें कवर" },
    tag:     { en: "Farmer / Crop Insurance", hi: "किसान / फसल बीमा" },
    annual: 0,
    apply:   { en: "Apply via Block Agriculture Office or krishakbandhu.net",
               hi: "Block कृषि कार्यालय या krishakbandhu.net के माध्यम से आवेदन" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records (Parcha / Khatian showing notified crop area)","Bank Account (Aadhaar-linked)","Farmer Registration Certificate","Sowing Certificate (from Block Ag. Officer)"],
               hi: ["आधार कार्ड","भूमि अभिलेख (अधिसूचित फसल क्षेत्र दर्शाने वाला परचा/खतियान)","बैंक खाता (आधार-लिंक्ड)","किसान पंजीकरण प्रमाण पत्र","बुवाई प्रमाण पत्र (Block कृषि अधिकारी से)"] },
    match: (a) => a.state === "West Bengal" && a.who === "farmer",
  },

  // ── SENIOR CITIZEN / PENSION ──────────────────────────────────────────────

  {
    id: "wb_jai_bangla_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Social Welfare Dept.", hi: "पश्चिम बंगाल समाज कल्याण विभाग" },
    name:    { en: "Jai Bangla — Social Security Pension (West Bengal)",
               hi: "জয় বাংলা / जय बांग्ला — सामाजिक सुरक्षा पेंशन (पश्चिम बंगाल)" },
    benefit: { en: "₹1,000/month pension for eligible beneficiaries under 3 categories: (1) Old Age (60+) from BPL/SEGY families; (2) Widows aged 18–60 from BPL families; (3) Disabled persons with 40%+ disability; direct bank transfer monthly",
               hi: "3 श्रेणियों के पात्र लाभार्थियों को ₹1,000/माह पेंशन: (1) BPL/SEGY परिवारों के 60+ वृद्धजन; (2) BPL परिवारों की 18–60 वर्षीय विधवाएं; (3) 40%+ दिव्यांग; हर माह सीधे बैंक में" },
    tag:     { en: "Senior / Widow / Disabled — Pension", hi: "वृद्धजन / विधवा / दिव्यांग — पेंशन" },
    annual: 12000,
    apply:   { en: "jaibangla.wb.gov.in · also via Duare Sarkar camps", hi: "jaibangla.wb.gov.in · दुआरे सरकार कैम्प से भी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof / Voter ID (for Old Age category)","Death Certificate of Husband (for Widow category)","Disability Certificate 40%+ (for Disabled category)","BPL / SEGY Certificate","Bank Account (Aadhaar-linked)","Residence Proof (West Bengal)","Passport Photo"],
               hi: ["आधार कार्ड","आयु प्रमाण / मतदाता ID (वृद्धजन श्रेणी के लिए)","पति का मृत्यु प्रमाण पत्र (विधवा श्रेणी के लिए)","दिव्यांगता प्रमाण पत्र 40%+ (दिव्यांग श्रेणी के लिए)","BPL/SEGY प्रमाण पत्र","बैंक खाता (आधार-लिंक्ड)","निवास प्रमाण (पश्चिम बंगाल)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && (a.who === "senior" || a.age === "above60"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "wb_banglar_bari",
    icon: "🏘️", color: "#CA8A04", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Panchayats & Rural Development Dept.", hi: "पश्चिम बंगाल पंचायत एवं ग्रामीण विकास विभाग" },
    name:    { en: "Banglar Bari / Bangla Awas Yojana (West Bengal)",
               hi: "বাংলার বাড়ি / बांग्लार बाड़ी — बांग्ला आवास योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹1.2 lakh housing grant for rural homeless/kutcha house dwellers in plain areas; ₹1.3 lakh in hilly & coastal areas; includes toilet construction, electricity connection and water tap; paid in 3 installments via DBT",
               hi: "मैदानी क्षेत्रों में ग्रामीण बेघर/कच्चे घर में रहने वालों को ₹1.2 लाख आवास अनुदान; पहाड़ी और तटीय क्षेत्रों में ₹1.3 लाख; शौचालय निर्माण, बिजली कनेक्शन और पानी की टोंटी शामिल; DBT के माध्यम से 3 किस्तों में" },
    tag:     { en: "Rural / Housing", hi: "ग्रामीण / आवास" },
    annual: 120000,
    apply:   { en: "Apply via Gram Panchayat / BDO office",
               hi: "ग्राम पंचायत / BDO कार्यालय के माध्यम से आवेदन" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card (BPL/SEGY)","Bank Account (Aadhaar-linked)","Land Ownership Proof or Govt. Land Allotment Letter","Income Certificate","Residence Proof (West Bengal rural area)","Voter ID","Passport Photo"],
               hi: ["आधार कार्ड","राशन कार्ड (BPL/SEGY)","बैंक खाता (आधार-लिंक्ड)","भूमि स्वामित्व प्रमाण या सरकारी भूमि आवंटन पत्र","आय प्रमाण पत्र","निवास प्रमाण (पश्चिम बंगाल ग्रामीण क्षेत्र)","मतदाता ID","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── ARTISAN / SELF-EMPLOYED ───────────────────────────────────────────────

  {
    id: "wb_bhabishyat_credit",
    icon: "🏦", color: "#0369A1", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Finance Dept. / Backward Classes Welfare Dept.", hi: "पश्चिम बंगाल वित्त विभाग / पिछड़ा वर्ग कल्याण विभाग" },
    name:    { en: "Bhabishyat Credit Card Scheme (West Bengal)",
               hi: "ভবিষ্যৎ ক্রেডিট কার্ড / भविष्यत् क्रेडिट कार्ड योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹2 lakh overdraft credit facility at 7% interest for SC/ST/OBC artisans and self-employed persons; WB Govt. pays 3% interest subsidy (net cost to beneficiary: 4%); no collateral; enables working capital for micro-enterprises",
               hi: "SC/ST/OBC कारीगरों और स्वरोजगार व्यक्तियों को 7% ब्याज पर ₹2 लाख ओवरड्राफ्ट क्रेडिट सुविधा; WB सरकार 3% ब्याज सब्सिडी देती है (लाभार्थी को शुद्ध लागत: 4%); कोई गारंटी नहीं; सूक्ष्म उद्यमों के लिए कार्यशील पूंजी" },
    tag:     { en: "SC/ST/OBC / Self-Employed Credit", hi: "SC/ST/OBC / स्वरोजगार क्रेडिट" },
    annual: 200000,
    apply:   { en: "Apply at nearest bank (nationalized) with WB Backward Classes Welfare Dept. referral",
               hi: "WB पिछड़ा वर्ग कल्याण विभाग के संदर्भ के साथ नजदीकी राष्ट्रीयकृत बैंक में आवेदन" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SC/ST/OBC Caste Certificate","Residence Proof (West Bengal)","Income Certificate","Trade / Occupation Proof","Bank Account (Aadhaar-linked)","Passport Photo"],
               hi: ["आधार कार्ड","SC/ST/OBC जाति प्रमाण पत्र","निवास प्रमाण (पश्चिम बंगाल)","आय प्रमाण पत्र","व्यापार / व्यवसाय का प्रमाण","बैंक खाता (आधार-लिंक्ड)","पासपोर्ट फोटो"] },
    match: (a) => a.state === "West Bengal" && ["sc","st","obc"].includes(a.caste),
  },

  // ADD MORE WEST BENGAL SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "wb_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "West Bengal",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "West Bengal",
  // },

];
