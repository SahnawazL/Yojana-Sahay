// Tripura — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "tripura_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const TRIPURA_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "tripura_cm_krishak_samridhi",
    icon: "🌾", color: "#15803D", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Agriculture & Farmers Welfare Dept.", hi: "त्रिपुरा कृषि एवं किसान कल्याण विभाग" },
    name:    { en: "Mukhyamantri Krishak Samridhi Yojana (Tripura)",
               hi: "मुख्यमंत्री कृषक समृद्धि योजना (त्रिपुरा)" },
    benefit: { en: "₹4,000/year (2 installments of ₹2,000 each in Rabi & Kharif seasons) for small and marginal farmers — direct bank transfer (DBT); supplementary to PM-KISAN; covers landholding farmers registered on state agri-portal",
               hi: "छोटे व सीमांत किसानों को ₹4,000/वर्ष (रबी व खरीफ में ₹2,000–₹2,000 किस्त) — सीधे बैंक खाते में DBT; PM-KISAN के अतिरिक्त; राज्य कृषि पोर्टल पर पंजीकृत भूमिधारक किसानों के लिए" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 4000,
    apply:   { en: "https://agri.tripura.gov.in", hi: "agri.tripura.gov.in / निकटतम ब्लॉक कृषि अधिकारी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Patta (RoR)", "Farmer Registration on State Agri Portal", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / पट्टा (RoR)", "राज्य कृषि पोर्टल पर किसान पंजीकरण", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Tripura" && (a.who === "farmer" || ["below1","1to3"].includes(a.income)),
  },

  {
    id: "tripura_unnato_krishi",
    icon: "🌱", color: "#D97706", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Agriculture & Farmers Welfare Dept.", hi: "त्रिपुरा कृषि एवं किसान कल्याण विभाग" },
    name:    { en: "Mukhyamantri Unnato Krishi Yojana (Tripura)",
               hi: "मुख्यमंत्री उन्नत कृषि योजना (त्रिपुरा)" },
    benefit: { en: "Subsidised supply of improved seeds, fertilisers, pesticides, and farm equipment to small & marginal farmers; 50–90% subsidy on inputs depending on crop and category (SC/ST farmers get higher subsidy); training and demonstration camps at block level to promote crop diversification and modern techniques",
               hi: "छोटे व सीमांत किसानों को उन्नत बीज, उर्वरक, कीटनाशक और कृषि उपकरणों की सब्सिडी युक्त आपूर्ति; फसल और श्रेणी के अनुसार 50–90% सब्सिडी (SC/ST किसानों को अधिक); फसल विविधीकरण व आधुनिक तकनीक को प्रोत्साहित करने के लिए ब्लॉक स्तर पर प्रशिक्षण व प्रदर्शन शिविर" },
    tag:     { en: "Farmer / Input Subsidy", hi: "किसान / इनपुट सब्सिडी" },
    annual: 0,
    apply:   { en: "agri.tripura.gov.in / Block Agriculture Office (offline)", hi: "agri.tripura.gov.in / ब्लॉक कृषि कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Patta", "Farmer Registration Certificate", "Caste Certificate (SC/ST for higher subsidy)", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / पट्टा", "किसान पंजीकरण प्रमाण पत्र", "जाति प्रमाण पत्र (SC/ST अधिक सब्सिडी के लिए)", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Tripura" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "tripura_matripushti_uphaar",
    icon: "🤱", color: "#BE185D", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Social Welfare & Social Education Dept.", hi: "त्रिपुरा समाज कल्याण एवं सामाजिक शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Matripushti Uphaar Yojana — MMU (Tripura)",
               hi: "मुख्यमंत्री मातृपुष्टि उपहार योजना — MMU (त्रिपुरा)" },
    benefit: { en: "Monthly nutritional supplement kit (value ~₹800–₹1,000) provided free to pregnant and lactating women for 6 months; kit includes fortified food items, iron-folic acid tablets, calcium supplements, and health materials; delivered through Anganwadi centres; aims to reduce maternal and infant malnutrition across Tripura",
               hi: "गर्भवती एवं स्तनपान कराने वाली महिलाओं को 6 महीने तक मासिक पोषण किट (~₹800–₹1,000 मूल्य) निःशुल्क; किट में फोर्टिफाइड खाद्य सामग्री, आयरन-फोलिक एसिड गोलियां, कैल्शियम सप्लीमेंट और स्वास्थ्य सामग्री; आंगनवाड़ी केंद्रों के माध्यम से वितरण; मातृ एवं शिशु कुपोषण कम करने का लक्ष्य" },
    tag:     { en: "Women / Maternal Nutrition", hi: "महिला / मातृ पोषण" },
    annual: 9600,
    apply:   { en: "Nearest Anganwadi Centre / ICDS office (offline)", hi: "निकटतम आंगनवाड़ी केंद्र / ICDS कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Registration Certificate / MCP Card (Mother & Child Protection)", "Residence Proof (Tripura)", "BPL / NFSA Ration Card (if applicable)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "गर्भावस्था पंजीकरण प्रमाण पत्र / MCP कार्ड", "निवास प्रमाण (त्रिपुरा)", "BPL / NFSA राशन कार्ड (यदि लागू हो)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Tripura" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "tripura_trlm_shg",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Rural Livelihood Mission (TRLM) / Panchayati Raj Dept.", hi: "त्रिपुरा ग्रामीण आजीविका मिशन (TRLM) / पंचायती राज विभाग" },
    name:    { en: "Tripura Rural Livelihood Mission — SHG Loan & Support (Tripura)",
               hi: "त्रिपुरा ग्रामीण आजीविका मिशन — SHG ऋण एवं सहायता (त्रिपुरा)" },
    benefit: { en: "Interest-free or subsidised loans up to ₹3 lakh for women Self-Help Group (SHG) members to start or scale small enterprises; seed money of ₹15,000 for new SHGs; revolving fund support; capacity-building, skill training, and market linkage through TRLM; helps women engage in agro-processing, handloom, handicrafts, and retail businesses",
               hi: "महिला स्वयं सहायता समूह (SHG) सदस्यों को छोटे उद्यम शुरू/विस्तार हेतु ₹3 लाख तक ब्याज-मुक्त या सब्सिडी ऋण; नए SHGs के लिए ₹15,000 बीज राशि; रिवॉल्विंग फंड सहायता; TRLM के माध्यम से क्षमता निर्माण, कौशल प्रशिक्षण और बाजार संपर्क; कृषि प्रसंस्करण, हथकरघा, हस्तशिल्प और खुदरा व्यवसाय में सहयोग" },
    tag:     { en: "Women / SHG / Entrepreneurship", hi: "महिला / SHG / उद्यमिता" },
    annual: 0,
    apply:   { en: "trlm.tripura.gov.in / Block TRLM office (offline)", hi: "trlm.tripura.gov.in / ब्लॉक TRLM कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG Passbook", "Bank Account (SHG joint account)", "Residence Proof (Tripura)", "Passport Photo", "Business plan / Project report (for larger loans)"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG संयुक्त खाता)", "निवास प्रमाण (त्रिपुरा)", "पासपोर्ट फोटो", "व्यवसाय योजना / परियोजना रिपोर्ट (बड़े ऋण के लिए)"] },
    match: (a) => a.state === "Tripura" && a.who === "women",
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "tripura_mukhyamantri_swasthya",
    icon: "🏥", color: "#DC2626", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Health & Family Welfare Dept.", hi: "त्रिपुरा स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Mukhyamantri Swasthya Bima Yojana (Tripura)",
               hi: "मुख्यमंत्री स्वास्थ्य बीमा योजना (त्रिपुरा)" },
    benefit: { en: "Cashless health insurance cover of ₹5 lakh/family/year for secondary and tertiary hospitalisation at empanelled government and private hospitals; covers BPL and low-income families across Tripura; supplements Ayushman Bharat PM-JAY for state-specific needs; includes pre- and post-hospitalisation expenses; family floater basis",
               hi: "BPL और कम आय वाले परिवारों को सूचीबद्ध सरकारी व निजी अस्पतालों में द्वितीयक और तृतीयक अस्पताल भर्ती के लिए ₹5 लाख/परिवार/वर्ष नकद-रहित स्वास्थ्य बीमा; राज्य-विशिष्ट आवश्यकताओं के लिए आयुष्मान भारत PM-JAY का पूरक; अस्पताल भर्ती से पहले और बाद का खर्च शामिल; परिवार फ्लोटर आधार पर" },
    tag:     { en: "Health / Insurance / BPL", hi: "स्वास्थ्य / बीमा / BPL" },
    annual: 500000,
    apply:   { en: "https://health.tripura.gov.in", hi: "health.tripura.gov.in / सूचीबद्ध अस्पताल में निकटतम आयुष्मान मित्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "NFSA / BPL Ration Card", "Ayushman Bharat / State Health Card (if issued)", "Residence Proof (Tripura)", "Family composition certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "NFSA / BPL राशन कार्ड", "आयुष्मान भारत / राज्य स्वास्थ्य कार्ड (यदि जारी हो)", "निवास प्रमाण (त्रिपुरा)", "परिवार संरचना प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Tripura" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "tripura_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Education (Higher) Dept.", hi: "त्रिपुरा शिक्षा (उच्च) विभाग" },
    name:    { en: "Mukhyamantri Meritorious Student Scholarship (Tripura)",
               hi: "मुख्यमंत्री मेधावी छात्र छात्रवृत्ति (त्रिपुरा)" },
    benefit: { en: "Annual scholarship of ₹12,000–₹30,000 for meritorious students from SC/ST/OBC/EWS and general BPL families scoring 60%+ in Class 10 or 12 board exams; amount varies by level — ₹12,000/year for Class 11–12, ₹18,000/year for UG, ₹30,000/year for PG; paid directly to student's Aadhaar-linked bank account",
               hi: "कक्षा 10 या 12 बोर्ड परीक्षा में 60%+ अंक लाने वाले SC/ST/OBC/EWS और सामान्य BPL परिवार के मेधावी छात्रों को ₹12,000–₹30,000 वार्षिक छात्रवृत्ति; स्तर के अनुसार राशि — कक्षा 11–12 के लिए ₹12,000/वर्ष, UG के लिए ₹18,000/वर्ष, PG के लिए ₹30,000/वर्ष; सीधे छात्र के आधार-लिंक्ड बैंक खाते में" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 30000,
    apply:   { en: "https://scholarships.tripura.gov.in", hi: "scholarships.tripura.gov.in / स्कूल या कॉलेज कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 10 / 12 Marksheet (TBSE / TBHSE)", "Income Certificate (family income below threshold)", "Caste Certificate (SC/ST/OBC)", "Admission / Enrollment Certificate from current institution", "Bank Account (Aadhaar-linked, student's name)", "Residence Proof (Tripura)", "Passport Photo"],
               hi: ["आधार कार्ड", "कक्षा 10 / 12 अंकसूची (TBSE / TBHSE)", "आय प्रमाण पत्र (पारिवारिक आय सीमा से कम)", "जाति प्रमाण पत्र (SC/ST/OBC)", "वर्तमान संस्थान से प्रवेश / नामांकन प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास प्रमाण (त्रिपुरा)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Tripura" && a.who === "student",
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "tripura_social_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Social Welfare & Social Education Dept.", hi: "त्रिपुरा समाज कल्याण एवं सामाजिक शिक्षा विभाग" },
    name:    { en: "Tripura State Social Security Pension Scheme",
               hi: "त्रिपुरा राज्य सामाजिक सुरक्षा पेंशन योजना" },
    benefit: { en: "Monthly pension (state component combined with NSAP central share) — Elderly (60–79 years): ₹2,000/month; Elderly (80+ years): ₹2,500/month; Widows (40–59 years): ₹2,000/month; Persons with Disability (40%+): ₹2,000/month; paid directly to Aadhaar-linked bank account every month; no application fee",
               hi: "मासिक पेंशन (NSAP केंद्रीय अंश + राज्य घटक) — वृद्ध (60–79 वर्ष): ₹2,000/माह; वृद्ध (80+ वर्ष): ₹2,500/माह; विधवाएं (40–59 वर्ष): ₹2,000/माह; दिव्यांगजन (40%+): ₹2,000/माह; सीधे आधार-लिंक्ड बैंक खाते में; कोई आवेदन शुल्क नहीं" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 30000,
    apply:   { en: "socialwelfare.tripura.gov.in / SDM or BDO office (offline)", hi: "socialwelfare.tripura.gov.in / SDM या BDO कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, from Medical Board) — for disabled", "BPL Ration Card / Income Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Tripura)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "BPL राशन कार्ड / आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (त्रिपुरा)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Tripura" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "tripura_cm_awas",
    icon: "🏠", color: "#B45309", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Urban Development & Municipal Affairs Dept.", hi: "त्रिपुरा नगर विकास एवं नगर पालिका कार्य विभाग" },
    name:    { en: "Mukhyamantri Awas Yojana — Urban (Tripura)",
               hi: "मुख्यमंत्री आवास योजना — शहरी (त्रिपुरा)" },
    benefit: { en: "₹1.5 lakh one-time financial assistance for construction or upgrade of pucca house for urban BPL/EWS/LIG households; complements PMAY-Urban (Beneficiary-Led Construction component); paid in 3 installments — at foundation, lintel, and roof completion stage; must include functional toilet and kitchen; prioritises SC/ST, widows, and differently abled applicants",
               hi: "शहरी BPL/EWS/LIG परिवारों के लिए पक्के मकान के निर्माण या उन्नयन हेतु ₹1.5 लाख एकमुश्त सहायता; PMAY-शहरी (लाभार्थी-नेतृत्व निर्माण घटक) का पूरक; 3 किस्तों में — नींव, लिंटेल और छत पूर्णता पर; कार्यात्मक शौचालय व रसोई अनिवार्य; SC/ST, विधवाओं और दिव्यांगजनों को प्राथमिकता" },
    tag:     { en: "Housing / Urban / BPL / EWS", hi: "आवास / शहरी / BPL / EWS" },
    annual: 150000,
    apply:   { en: "Nearest ULB (Urban Local Body) / Municipality office (offline)", hi: "निकटतम ULB (शहरी स्थानीय निकाय) / नगरपालिका कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS / LIG Income Certificate (annual income ≤ ₹3 lakh for EWS)", "Land / Plot Ownership Document or Allotment Letter", "Bank Account (Aadhaar-linked)", "Residence Proof (Tripura urban area)", "Passport Photo", "Caste Certificate (SC/ST for priority)", "Photograph of existing house / site"],
               hi: ["आधार कार्ड", "BPL / EWS / LIG आय प्रमाण पत्र (EWS के लिए वार्षिक आय ≤ ₹3 लाख)", "भूमि / भूखंड स्वामित्व दस्तावेज़ या आवंटन पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (त्रिपुरा शहरी क्षेत्र)", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST प्राथमिकता के लिए)", "मौजूदा मकान / स्थल की तस्वीर"] },
    match: (a) => a.state === "Tripura" && a.area === "urban" && ["below1","1to3"].includes(a.income),
  },

  // ── TRIBAL WELFARE ────────────────────────────────────────────────────────

  {
    id: "tripura_adc_tribal_welfare",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Tribal Welfare Dept. / Tripura Tribal Areas Autonomous District Council (TTAADC)", hi: "त्रिपुरा जनजातीय कल्याण विभाग / त्रिपुरा जनजातीय क्षेत्र स्वायत्त जिला परिषद (TTAADC)" },
    name:    { en: "TTAADC Tribal Development & Welfare Schemes (Tripura)",
               hi: "TTAADC जनजातीय विकास एवं कल्याण योजनाएं (त्रिपुरा)" },
    benefit: { en: "Cluster of welfare benefits administered by the Tripura Tribal Areas Autonomous District Council — includes free textbooks and uniforms for tribal students (Class 1–12), residential school support (hostels), livelihood assistance for traditional occupational groups (fishing, bamboo crafts, weaving), and ₹5,000 one-time grant for tribal women starting micro-enterprises under TTAADC jurisdiction",
               hi: "त्रिपुरा जनजातीय क्षेत्र स्वायत्त जिला परिषद द्वारा प्रशासित कल्याण लाभों का समूह — जनजातीय छात्रों (कक्षा 1–12) के लिए निःशुल्क पाठ्यपुस्तक व वर्दी, आवासीय स्कूल सहायता (छात्रावास), पारंपरिक व्यावसायिक समूहों (मछली पालन, बांस शिल्प, बुनाई) के लिए आजीविका सहायता, और TTAADC क्षेत्र में सूक्ष्म उद्यम शुरू करने वाली जनजातीय महिलाओं को ₹5,000 एकमुश्त अनुदान" },
    tag:     { en: "Tribal / SC-ST / Welfare", hi: "जनजातीय / SC-ST / कल्याण" },
    annual: 5000,
    apply:   { en: "ttaadc.nic.in / nearest TTAADC Block Development Office", hi: "ttaadc.nic.in / निकटतम TTAADC ब्लॉक विकास कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST (Scheduled Tribe) Certificate issued by Tripura Govt.", "Residence Proof within TTAADC area", "Income Certificate (BPL preferred)", "Bank Account (Aadhaar-linked)", "Passport Photo", "For students: School Enrollment Certificate"],
               hi: ["आधार कार्ड", "त्रिपुरा सरकार द्वारा जारी ST (अनुसूचित जनजाति) प्रमाण पत्र", "TTAADC क्षेत्र के अंदर निवास प्रमाण", "आय प्रमाण पत्र (BPL प्राथमिक)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "छात्रों के लिए: विद्यालय नामांकन प्रमाण पत्र"] },
    match: (a) => a.state === "Tripura" && (a.caste === "ST" || a.caste === "SC"),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "tripura_cm_yuva_karyasuchi",
    icon: "👷", color: "#0F766E", scope: "state", state: "Tripura",
    ministry: { en: "Tripura Industries & Commerce Dept. / TRIBE (Tripura Industrial Development Corporation)", hi: "त्रिपुरा उद्योग एवं वाणिज्य विभाग / TRIBE" },
    name:    { en: "Mukhyamantri Yuva Udyami Yojana (Tripura)",
               hi: "मुख्यमंत्री युवा उद्यमी योजना (त्रिपुरा)" },
    benefit: { en: "Collateral-free loan of ₹2 lakh–₹25 lakh for educated unemployed youth (18–40 years) to start new micro/small enterprises; 25–35% capital subsidy on project cost (higher for SC/ST/women/ex-servicemen); free skill training through TRIBE and ITIs; mentoring, incubation, and market linkage support; priority to youth from rural and tribal areas",
               hi: "18–40 वर्ष के शिक्षित बेरोजगार युवाओं को नया सूक्ष्म/लघु उद्यम शुरू करने हेतु ₹2 लाख–₹25 लाख गारंटी-मुक्त ऋण; परियोजना लागत पर 25–35% पूंजी सब्सिडी (SC/ST/महिला/पूर्व सैनिकों के लिए अधिक); TRIBE और ITIs के माध्यम से निःशुल्क कौशल प्रशिक्षण; मेंटरिंग, इनक्यूबेशन और बाजार संपर्क सहायता; ग्रामीण व जनजातीय क्षेत्रों के युवाओं को प्राथमिकता" },
    tag:     { en: "Youth / Self-Employment / Entrepreneur", hi: "युवा / स्वरोजगार / उद्यमी" },
    annual: 0,
    apply:   { en: "industry.tripura.gov.in / District Industries Centre (DIC) office", hi: "industry.tripura.gov.in / जिला उद्योग केंद्र (DIC) कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID)", "Educational Qualification Certificate (min. Class 8 pass for some components)", "Residence Proof (Tripura)", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "Caste Certificate (SC/ST/OBC for higher subsidy)", "Passport Photo", "No Objection Certificate (if applicable)"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "शैक्षिक योग्यता प्रमाण पत्र (कुछ घटकों के लिए न्यूनतम कक्षा 8 उत्तीर्ण)", "निवास प्रमाण (त्रिपुरा)", "परियोजना रिपोर्ट / व्यवसाय योजना", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (SC/ST/OBC अधिक सब्सिडी के लिए)", "पासपोर्ट फोटो", "अनापत्ति प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Tripura" && (a.who === "unemployed" || a.who === "youth") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE TRIPURA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "tripura_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Tripura",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Tripura",
  // },

];
