// Nagaland — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "nagaland_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const NAGALAND_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "nagaland_cmam",
    icon: "🌾", color: "#15803D", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Agriculture Dept. / Chief Minister's Agriculture Mission (CMAM)", hi: "नागालैंड कृषि विभाग / मुख्यमंत्री कृषि मिशन (CMAM)" },
    name:    { en: "Chief Minister's Agriculture Mission (CMAM) — Nagaland",
               hi: "मुख्यमंत्री कृषि मिशन (CMAM) — नागालैंड" },
    benefit: { en: "Flagship state agricultural scheme providing registered farmers with: 50–75% subsidised supply of improved seeds (paddy, maize, millet, pulses), bio-fertilisers, and farm implements; free soil health card and testing at district agriculture office; demonstration plots and farmer-field schools at village level; coverage of all 16 districts with priority to small and marginal farmers; aims to increase per-hectare crop yield and reduce dependence on jhum (slash-and-burn) cultivation through improved settled farming techniques",
               hi: "प्रमुख राज्य कृषि योजना जो पंजीकृत किसानों को देती है: उन्नत बीज (धान, मक्का, बाजरा, दलहन), जैव-उर्वरक और कृषि उपकरणों की 50–75% सब्सिडी आपूर्ति; जिला कृषि कार्यालय में निःशुल्क मृदा स्वास्थ्य कार्ड और परीक्षण; ग्राम स्तर पर प्रदर्शन भूखंड और किसान-क्षेत्र विद्यालय; सभी 16 जिलों में कवरेज, छोटे व सीमांत किसानों को प्राथमिकता; उन्नत स्थायी खेती तकनीकों से प्रति हेक्टेयर फसल उपज बढ़ाने और झूम खेती पर निर्भरता कम करने का लक्ष्य" },
    tag:     { en: "Farmer / Input Subsidy / CMAM", hi: "किसान / इनपुट सब्सिडी / CMAM" },
    annual: 0,
    apply:   { en: "agri.nagaland.gov.in / District Agriculture Officer (offline)", hi: "agri.nagaland.gov.in / जिला कृषि अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Village Council Land Certificate (proof of land use)", "ST Certificate (Nagaland)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "ग्राम परिषद भूमि प्रमाण पत्र (भूमि उपयोग का प्रमाण)", "ST प्रमाण पत्र (नागालैंड)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Nagaland" && a.who === "farmer",
  },

  {
    id: "nagaland_organic_mission",
    icon: "🌱", color: "#D97706", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Agriculture Dept. / State Organic Mission", hi: "नागालैंड कृषि विभाग / राज्य जैविक मिशन" },
    name:    { en: "Nagaland State Organic Farming Mission",
               hi: "नागालैंड राज्य जैविक खेती मिशन" },
    benefit: { en: "Financial assistance and input support to farmers transitioning to certified organic farming — covers vermi-composting unit setup (₹15,000 subsidy per unit), organic certification charges (fully reimbursed for small farmers), supply of organic seeds and bio-pesticides at 60% subsidy; premium market linkage support through state-level Organic Nagaland brand to fetch 20–40% higher price; training camps on organic practices at village level; priority given to women farmers and farmers in remote Eastern Nagaland (Mon, Tuensang, Kiphire, Longleng districts)",
               hi: "प्रमाणित जैविक खेती में स्थानांतरित होने वाले किसानों को वित्तीय सहायता और इनपुट सहायता — वर्मी-कम्पोस्ट यूनिट स्थापना (₹15,000 सब्सिडी प्रति यूनिट), जैविक प्रमाणन शुल्क (छोटे किसानों को पूरी प्रतिपूर्ति), जैविक बीज और जैव-कीटनाशकों की 60% सब्सिडी आपूर्ति; राज्य स्तरीय ऑर्गेनिक नागालैंड ब्रांड के माध्यम से 20–40% अधिक मूल्य हेतु प्रीमियम बाजार संपर्क; ग्राम स्तर पर जैविक पद्धतियों पर प्रशिक्षण; महिला किसानों और पूर्वी नागालैंड (मोन, तुएनसांग, किफिरे, लोंगलेंग) के दूरदराज किसानों को प्राथमिकता" },
    tag:     { en: "Farmer / Organic / Subsidy", hi: "किसान / जैविक / सब्सिडी" },
    annual: 15000,
    apply:   { en: "agri.nagaland.gov.in / Block Agriculture Office (offline)", hi: "agri.nagaland.gov.in / ब्लॉक कृषि कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Village Council Land Use Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Existing cultivation details / crop plan"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "ग्राम परिषद भूमि उपयोग प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मौजूदा खेती विवरण / फसल योजना"] },
    match: (a) => a.state === "Nagaland" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "nagaland_nrlm_shg",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland State Rural Livelihoods Mission (NSRLM) / Rural Development Dept.", hi: "नागालैंड राज्य ग्रामीण आजीविका मिशन (NSRLM) / ग्रामीण विकास विभाग" },
    name:    { en: "Nagaland State Rural Livelihoods Mission — SHG Loan & Support (Nagaland)",
               hi: "नागालैंड राज्य ग्रामीण आजीविका मिशन — SHG ऋण एवं सहायता (नागालैंड)" },
    benefit: { en: "Interest-free revolving fund of ₹15,000 for newly formed women Self-Help Groups (SHGs); community investment fund (CIF) loans up to ₹2 lakh per SHG at subsidised rates for income-generating activities; skill development training in Naga handloom weaving, food processing, tailoring, and bamboo-cane craft; market linkage support under the 'Naga Handloom & Handicrafts' brand; group insurance coverage; covers rural women across all 16 districts; priority to women from remote Eastern Nagaland villages",
               hi: "नए गठित महिला SHGs के लिए ₹15,000 ब्याज-मुक्त रिवॉल्विंग फंड; आय-सृजन गतिविधियों के लिए प्रति SHG ₹2 लाख तक सब्सिडी दर पर सामुदायिक निवेश फंड (CIF) ऋण; नागा हथकरघा बुनाई, खाद्य प्रसंस्करण, सिलाई और बांस-बेंत शिल्प में कौशल विकास प्रशिक्षण; 'नागा हैंडलूम एंड हैंडीक्राफ्ट्स' ब्रांड के तहत बाजार संपर्क; समूह बीमा कवरेज; सभी 16 जिलों की ग्रामीण महिलाएं; पूर्वी नागालैंड के दूरदराज गांवों की महिलाओं को प्राथमिकता" },
    tag:     { en: "Women / SHG / Livelihood", hi: "महिला / SHG / आजीविका" },
    annual: 0,
    apply:   { en: "nsrlm.nagaland.gov.in / Block Development Office (offline)", hi: "nsrlm.nagaland.gov.in / ब्लॉक विकास कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG Passbook", "Bank Account (SHG joint account)", "Residence Proof (Nagaland)", "Village Council Certificate (confirming group formation)", "Passport Photo"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG संयुक्त खाता)", "निवास प्रमाण (नागालैंड)", "ग्राम परिषद प्रमाण पत्र (समूह गठन की पुष्टि)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Nagaland" && a.who === "women",
  },

  {
    id: "nagaland_maternal_support",
    icon: "🤱", color: "#9333EA", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Social Welfare Dept. / ICDS", hi: "नागालैंड समाज कल्याण विभाग / ICDS" },
    name:    { en: "Nagaland Maternity Benefit & Nutrition Support Scheme",
               hi: "नागालैंड मातृत्व लाभ एवं पोषण सहायता योजना" },
    benefit: { en: "Monthly nutritional supplement kit (value ~₹700–₹900) provided free to pregnant and lactating women for up to 6 months through Anganwadi centres; kit includes fortified food items, iron-folic acid tablets, calcium supplements, and health education materials; state supplement over and above PMMVY central benefit; special focus on reducing maternal anaemia and infant malnutrition in remote districts (Mon, Tuensang, Kiphire); Anganwadi delivery at village level avoids need to travel to district headquarters",
               hi: "गर्भवती एवं स्तनपान कराने वाली महिलाओं को आंगनवाड़ी केंद्रों के माध्यम से 6 महीने तक मासिक पोषण किट (~₹700–₹900 मूल्य) निःशुल्क; किट में फोर्टिफाइड खाद्य, आयरन-फोलिक एसिड गोलियां, कैल्शियम सप्लीमेंट और स्वास्थ्य शिक्षा सामग्री; केंद्रीय PMMVY के अतिरिक्त राज्य पूरक; दूरदराज जिलों (मोन, तुएनसांग, किफिरे) में मातृ रक्ताल्पता और शिशु कुपोषण कम करने पर विशेष ध्यान; ग्राम स्तर पर आंगनवाड़ी वितरण" },
    tag:     { en: "Women / Maternal / Nutrition", hi: "महिला / मातृत्व / पोषण" },
    annual: 10800,
    apply:   { en: "Nearest Anganwadi Centre / District Social Welfare Office (offline)", hi: "निकटतम आंगनवाड़ी केंद्र / जिला समाज कल्याण कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Registration Certificate / MCP Card", "Residence Proof (Nagaland)", "BPL / NFSA Ration Card (if applicable)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "गर्भावस्था पंजीकरण प्रमाण पत्र / MCP कार्ड", "निवास प्रमाण (नागालैंड)", "BPL / NFSA राशन कार्ड (यदि लागू हो)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Nagaland" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "nagaland_health_scheme",
    icon: "🏥", color: "#DC2626", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Health & Family Welfare Dept.", hi: "नागालैंड स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Nagaland Universal Health Coverage & State Health Insurance Scheme",
               hi: "नागालैंड सार्वभौमिक स्वास्थ्य कवरेज एवं राज्य स्वास्थ्य बीमा योजना" },
    benefit: { en: "Cashless health insurance cover of up to ₹4 lakh per family per year at empanelled government and private hospitals for secondary and tertiary hospitalisation; supplements Ayushman Bharat PM-JAY for Nagaland-resident BPL/EWS families; covers pre- and post-hospitalisation expenses (up to 30 days); referral support for high-cost treatments (cancer, cardiac, renal) at Dimapur, Kohima, or outside-state hospitals; mobile health units deployed in remote Eastern Nagaland for primary care",
               hi: "सूचीबद्ध सरकारी व निजी अस्पतालों में द्वितीयक और तृतीयक अस्पताल भर्ती के लिए प्रति परिवार ₹4 लाख/वर्ष नकद-रहित बीमा; नागालैंड निवासी BPL/EWS परिवारों के लिए आयुष्मान भारत PM-JAY का पूरक; 30 दिन तक अस्पताल भर्ती पूर्व व पश्चात का खर्च; दीमापुर, कोहिमा या राज्य बाहर उच्च-लागत उपचार (कैंसर, हृदय, गुर्दे) के लिए रेफरल सहायता; पूर्वी नागालैंड के दूरदराज क्षेत्रों में प्राथमिक देखभाल हेतु मोबाइल स्वास्थ्य इकाइयां" },
    tag:     { en: "Health / Insurance / BPL", hi: "स्वास्थ्य / बीमा / BPL" },
    annual: 400000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/cmhisn", hi: "health.nagaland.gov.in / निकटतम सूचीबद्ध अस्पताल आयुष्मान डेस्क" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL / NFSA Ration Card", "Ayushman Bharat / State Health Card", "Residence Proof (Nagaland)", "Family Composition Certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL / NFSA राशन कार्ड", "आयुष्मान भारत / राज्य स्वास्थ्य कार्ड", "निवास प्रमाण (नागालैंड)", "परिवार संरचना प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Nagaland" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "nagaland_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Higher & Technical Education Dept.", hi: "नागालैंड उच्च एवं तकनीकी शिक्षा विभाग" },
    name:    { en: "Nagaland Chief Minister's Merit Scholarship Scheme",
               hi: "नागालैंड मुख्यमंत्री मेधा छात्रवृत्ति योजना" },
    benefit: { en: "Annual scholarship for meritorious Nagaland domicile students scoring 60%+ in NBSE (Nagaland Board of School Education) Class 10 or Class 12 exams — ₹10,000/year for Class 11–12, ₹15,000/year for undergraduate, ₹22,000/year for postgraduate and professional courses; credited directly to student's Aadhaar-linked bank account; renewable annually on maintaining 55%+ marks; priority to ST students, first-generation learners, and students from remote Eastern Nagaland (Mon, Tuensang, Kiphire, Longleng)",
               hi: "NBSE (नागालैंड बोर्ड ऑफ स्कूल एजुकेशन) कक्षा 10 या 12 परीक्षा में 60%+ अंक लाने वाले नागालैंड अधिवास छात्रों को वार्षिक छात्रवृत्ति — कक्षा 11–12: ₹10,000/वर्ष, स्नातक: ₹15,000/वर्ष, स्नातकोत्तर/व्यावसायिक: ₹22,000/वर्ष; सीधे आधार-लिंक्ड बैंक खाते में; प्रत्येक वर्ष 55%+ बनाए रखने पर नवीनीकरण; ST छात्रों, प्रथम पीढ़ी के शिक्षार्थियों और पूर्वी नागालैंड (मोन, तुएनसांग, किफिरे, लोंगलेंग) के छात्रों को प्राथमिकता" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 22000,
    apply:   { en: "https://www.myscheme.gov.in/search/state/Nagaland", hi: "dhe.nagaland.gov.in / स्कूल या कॉलेज कार्यालय (ऑनलाइन + ऑफलाइन)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "NBSE Class 10 / 12 Marksheet", "Income Certificate (family income below threshold)", "ST Certificate (Nagaland)", "Admission / Enrollment Certificate from current institution", "Bank Account (Aadhaar-linked, student's name)", "Residence / Domicile Certificate (Nagaland)", "Passport Photo"],
               hi: ["आधार कार्ड", "NBSE कक्षा 10 / 12 अंकसूची", "आय प्रमाण पत्र (पारिवारिक आय सीमा से कम)", "ST प्रमाण पत्र (नागालैंड)", "वर्तमान संस्थान से प्रवेश / नामांकन प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास / अधिवास प्रमाण पत्र (नागालैंड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Nagaland" && a.who === "student",
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "nagaland_social_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Social Welfare Dept.", hi: "नागालैंड समाज कल्याण विभाग" },
    name:    { en: "Nagaland State Social Security Pension Scheme",
               hi: "नागालैंड राज्य सामाजिक सुरक्षा पेंशन योजना" },
    benefit: { en: "Monthly pension (state top-up combined with NSAP central component) — Elderly (60–79 years): ₹1,500/month; Elderly (80+ years): ₹2,000/month; Widows (40–59 years): ₹1,500/month; Persons with Disability (40%+ disability): ₹1,500/month; paid directly to Aadhaar-linked bank account monthly; covers BPL and low-income households across all 16 districts; no application fee; applications accepted at District Social Welfare Office or through Village Development Board (VDB)",
               hi: "मासिक पेंशन (NSAP केंद्रीय घटक + राज्य टॉप-अप) — वृद्ध (60–79 वर्ष): ₹1,500/माह; वृद्ध (80+ वर्ष): ₹2,000/माह; विधवाएं (40–59 वर्ष): ₹1,500/माह; दिव्यांगजन (40%+ दिव्यांगता): ₹1,500/माह; मासिक आधार-लिंक्ड बैंक खाते में सीधे; सभी 16 जिलों के BPL व कम आय वाले परिवार; कोई आवेदन शुल्क नहीं; जिला समाज कल्याण कार्यालय या ग्राम विकास बोर्ड (VDB) के माध्यम से आवेदन" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 24000,
    apply:   { en: "socialwelfare.nagaland.gov.in / District Social Welfare Office or VDB (offline)", hi: "socialwelfare.nagaland.gov.in / जिला समाज कल्याण कार्यालय या VDB (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, from Medical Board) — for disabled", "BPL Ration Card / Income Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Nagaland)", "Village Council / VDB Recommendation Letter", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "BPL राशन कार्ड / आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (नागालैंड)", "ग्राम परिषद / VDB अनुशंसा पत्र", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Nagaland" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "nagaland_cm_housing",
    icon: "🏠", color: "#B45309", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Housing & Urban Development Dept.", hi: "नागालैंड आवास एवं नगर विकास विभाग" },
    name:    { en: "Chief Minister's Rural & Urban Housing Scheme (Nagaland)",
               hi: "मुख्यमंत्री ग्रामीण एवं शहरी आवास योजना (नागालैंड)" },
    benefit: { en: "₹1.2 lakh–₹1.5 lakh one-time financial assistance for construction or renovation of pucca house for BPL/EWS households; released in 2–3 installments tied to construction milestones (foundation, lintel, roof); mandatory inclusion of functional toilet, safe drinking water connection, and smokeless kitchen; supplementary to PMAY-Gramin and PMAY-Urban; priority to ST households, female-headed families, persons with disability, and households in remote Eastern Nagaland (ENPO area)",
               hi: "BPL/EWS परिवारों के लिए पक्के मकान के निर्माण या नवीनीकरण हेतु ₹1.2 लाख–₹1.5 लाख एकमुश्त सहायता; निर्माण मील के पत्थर (नींव, लिंटेल, छत) से जुड़ी 2–3 किस्तों में; कार्यात्मक शौचालय, सुरक्षित पेयजल कनेक्शन और धुआं-रहित रसोई अनिवार्य; PMAY-ग्रामीण और PMAY-शहरी का पूरक; ST परिवारों, महिला-प्रमुख परिवारों, दिव्यांगजनों और पूर्वी नागालैंड (ENPO क्षेत्र) के परिवारों को प्राथमिकता" },
    tag:     { en: "Housing / BPL / EWS", hi: "आवास / BPL / EWS" },
    annual: 150000,
    apply:   { en: "Nearest BDO / ULB / District Deputy Commissioner Office (offline)", hi: "निकटतम BDO / ULB / जिला उपायुक्त कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Village Council Land Certificate (proof of plot ownership)", "Bank Account (Aadhaar-linked)", "Residence Proof (Nagaland)", "ST Certificate (for priority)", "Passport Photo", "Photograph of existing house / site"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण पत्र", "ग्राम परिषद भूमि प्रमाण पत्र (भूखंड स्वामित्व का प्रमाण)", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (नागालैंड)", "ST प्रमाण पत्र (प्राथमिकता के लिए)", "पासपोर्ट फोटो", "मौजूदा मकान / स्थल की तस्वीर"] },
    match: (a) => a.state === "Nagaland" && ["below1","1to3"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "nagaland_cmse",
    icon: "💼", color: "#0F766E", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Industries & Commerce Dept. / NBCC (Nagaland Business Creation Centre)", hi: "नागालैंड उद्योग एवं वाणिज्य विभाग / NBCC" },
    name:    { en: "Chief Minister's Self-Employment Scheme (CMSE) — Nagaland",
               hi: "मुख्यमंत्री स्वरोजगार योजना (CMSE) — नागालैंड" },
    benefit: { en: "Collateral-free loans of ₹50,000–₹10 lakh for educated unemployed youth (18–45 years) and first-generation entrepreneurs to start micro and small enterprises; 25–35% capital subsidy on project cost (higher for women / ST applicants); free entrepreneurship development training through DIC and government polytechnics; priority sectors include agro-processing, food & beverage, tourism, handloom, IT services, and bamboo products aligned with Nagaland's economic strengths; special window for ex-servicemen and differently-abled applicants",
               hi: "18–45 वर्ष के शिक्षित बेरोजगार युवाओं और पहली पीढ़ी के उद्यमियों को सूक्ष्म व लघु उद्यम शुरू करने के लिए ₹50,000–₹10 लाख गारंटी-मुक्त ऋण; परियोजना लागत पर 25–35% पूंजी सब्सिडी (महिला/ST आवेदकों के लिए अधिक); DIC और सरकारी पॉलिटेक्निक के माध्यम से निःशुल्क उद्यमिता विकास प्रशिक्षण; प्राथमिक क्षेत्र: कृषि-प्रसंस्करण, खाद्य व पेय, पर्यटन, हथकरघा, IT सेवाएं और बांस उत्पाद; पूर्व सैनिकों और दिव्यांगजनों के लिए विशेष विंडो" },
    tag:     { en: "Youth / Self-Employment / Entrepreneur", hi: "युवा / स्वरोजगार / उद्यमी" },
    annual: 0,
    apply:   { en: "industries.nagaland.gov.in / District Industries Centre (DIC) (offline)", hi: "industries.nagaland.gov.in / जिला उद्योग केंद्र (DIC) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID)", "Educational Qualification Certificate", "Residence / Domicile Certificate (Nagaland)", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "ST Certificate (for higher subsidy)", "Passport Photo", "Inner Line Permit (ILP) — for verification if required"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "शैक्षिक योग्यता प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (नागालैंड)", "परियोजना रिपोर्ट / व्यवसाय योजना", "बैंक खाता (आधार-लिंक्ड)", "ST प्रमाण पत्र (अधिक सब्सिडी के लिए)", "पासपोर्ट फोटो", "इनर लाइन परमिट (ILP) — यदि आवश्यक हो सत्यापन के लिए"] },
    match: (a) => a.state === "Nagaland" && (a.who === "unemployed" || a.who === "business" || a.who === "general") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── TRIBAL WELFARE / VDB ─────────────────────────────────────────────────

  {
    id: "nagaland_vdb_tribal",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Nagaland",
    ministry: { en: "Nagaland Rural Development Dept. / Village Development Boards (VDB)", hi: "नागालैंड ग्रामीण विकास विभाग / ग्राम विकास बोर्ड (VDB)" },
    name:    { en: "Village Development Board (VDB) Tribal Welfare & Development Schemes (Nagaland)",
               hi: "ग्राम विकास बोर्ड (VDB) जनजातीय कल्याण एवं विकास योजनाएं (नागालैंड)" },
    benefit: { en: "Cluster of welfare and development benefits administered through Nagaland's unique VDB (Village Development Board) system — includes: free textbooks, school bags, and uniforms for tribal students (Class 1–10); village-level infrastructure grants (₹2–5 lakh per village annually for roads, water, community halls); ₹5,000 one-time livelihood start-up grant for tribal youth starting micro-enterprises; handloom weaver identity card + ₹3,000 annual tool kit grant for registered Naga weavers; hostel stipend for ST students studying outside their home district; priority to ENPO (Eastern Nagaland Peoples' Organisation) area villages",
               hi: "नागालैंड की अनूठी VDB (ग्राम विकास बोर्ड) प्रणाली के माध्यम से प्रशासित कल्याण व विकास लाभों का समूह — शामिल: जनजातीय छात्रों (कक्षा 1–10) के लिए निःशुल्क पाठ्यपुस्तक, स्कूल बैग और वर्दी; ग्राम स्तरीय अवसंरचना अनुदान (सड़क, जल, सामुदायिक हॉल हेतु ₹2–5 लाख प्रति वर्ष); सूक्ष्म उद्यम शुरू करने वाले जनजातीय युवाओं को ₹5,000 एकमुश्त आजीविका स्टार्ट-अप अनुदान; पंजीकृत नागा बुनकरों को हथकरघा पहचान पत्र + ₹3,000 वार्षिक टूल किट; अपने गृह जिले से बाहर पढ़ने वाले ST छात्रों को छात्रावास वजीफा; ENPO क्षेत्र के गांवों को प्राथमिकता" },
    tag:     { en: "Tribal / ST / VDB / Village Welfare", hi: "जनजातीय / ST / VDB / ग्राम कल्याण" },
    annual: 5000,
    apply:   { en: "nagaland.gov.in/rural / Village Council or VDB Secretary (offline)", hi: "nagaland.gov.in/rural / ग्राम परिषद या VDB सचिव (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST (Scheduled Tribe) Certificate issued by Nagaland Govt.", "Residence / Domicile Certificate (Nagaland village)", "Tribe Certificate / Village Council Membership Certificate", "Income Certificate (BPL preferred)", "Bank Account (Aadhaar-linked)", "Passport Photo", "For students: School Enrollment Certificate", "For weavers: Handloom Registration Card / Tribe Craft Certificate"],
               hi: ["आधार कार्ड", "नागालैंड सरकार द्वारा जारी ST (अनुसूचित जनजाति) प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (नागालैंड गांव)", "जनजाति प्रमाण पत्र / ग्राम परिषद सदस्यता प्रमाण पत्र", "आय प्रमाण पत्र (BPL प्राथमिक)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "छात्रों के लिए: विद्यालय नामांकन प्रमाण पत्र", "बुनकरों के लिए: हथकरघा पंजीकरण कार्ड / जनजाति शिल्प प्रमाण पत्र"] },
    match: (a) => a.state === "Nagaland" && (a.caste === "st" || a.caste === "sc"),
  },

  // ADD MORE NAGALAND SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "nagaland_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Nagaland",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Nagaland",
  // },

];
