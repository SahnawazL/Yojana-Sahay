// Meghalaya — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "meghalaya_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const MEGHALAYA_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "meghalaya_cm_kisan_samman",
    icon: "🌾", color: "#15803D", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Agriculture & Farmers' Welfare Dept.", hi: "मेघालय कृषि एवं किसान कल्याण विभाग" },
    name:    { en: "Chief Minister's Kisan Samman Yojana (Meghalaya)",
               hi: "मुख्यमंत्री किसान सम्मान योजना (मेघालय)" },
    benefit: { en: "₹4,000/year state income support (2 installments of ₹2,000 each — Kharif & Rabi) for small and marginal farmers; credited directly to Aadhaar-linked bank account via DBT; supplements PM-KISAN; covers registered landholding farmers across all 12 districts of Meghalaya including hill areas",
               hi: "छोटे व सीमांत किसानों को ₹4,000/वर्ष राज्य आय सहायता (खरीफ व रबी में ₹2,000–₹2,000 किस्त); आधार-लिंक्ड बैंक खाते में DBT से सीधे; PM-KISAN का पूरक; मेघालय के सभी 12 जिलों में पहाड़ी क्षेत्रों सहित पंजीकृत भूमिधारक किसानों के लिए" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 4000,
    apply:   { en: "https://agri.meghalaya.gov.in", hi: "agri.meghalaya.gov.in / निकटतम ब्लॉक कृषि अधिकारी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Patta / Chieftainship document", "Farmer Registration on State Agri Portal", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / पट्टा / मुखिया दस्तावेज़", "राज्य कृषि पोर्टल पर किसान पंजीकरण", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && (a.who === "farmer" || ["below1","1to3"].includes(a.income)),
  },

  {
    id: "meghalaya_mgnregs_plus",
    icon: "🌿", color: "#D97706", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Rural Development Dept.", hi: "मेघालय ग्रामीण विकास विभाग" },
    name:    { en: "MGNREGS — Meghalaya State Enhancement (Meghalaya)",
               hi: "MGNREGS — मेघालय राज्य संवर्धन (मेघालय)" },
    benefit: { en: "100 days of guaranteed wage employment per rural household per year at ₹254/day (Meghalaya MGNREGS notified wage rate 2024–25); state provides additional 50 days of employment for Scheduled Tribe households in notified blocks; wages paid directly to bank/post-office account within 15 days; focus on land development, watershed management, and rural road connectivity",
               hi: "प्रत्येक ग्रामीण परिवार को प्रति वर्ष ₹254/दिन (मेघालय MGNREGS अधिसूचित मजदूरी दर 2024-25) पर 100 दिन की गारंटीशुदा मजदूरी रोजगार; अधिसूचित ब्लॉकों में अनुसूचित जनजाति परिवारों को राज्य द्वारा 50 अतिरिक्त दिन; 15 दिनों के भीतर सीधे बैंक/डाकघर खाते में मजदूरी; भूमि विकास, जलग्रहण प्रबंधन और ग्रामीण सड़क संपर्क पर ध्यान" },
    tag:     { en: "Rural / Employment / Wage Labour", hi: "ग्रामीण / रोजगार / मजदूरी" },
    annual: 38100,
    apply:   { en: "Gram Panchayat / Dorbar Shnong (village council) office (offline)", hi: "ग्राम पंचायत / दरबार श्नोंग (ग्राम परिषद) कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Job Card (MGNREGS) — issued by Gram Panchayat", "Bank Account or Post Office Account (Aadhaar-linked)", "Residence Proof (Meghalaya rural)", "Passport Photo"],
               hi: ["आधार कार्ड", "जॉब कार्ड (MGNREGS) — ग्राम पंचायत द्वारा जारी", "बैंक खाता या डाकघर खाता (आधार-लिंक्ड)", "निवास प्रमाण (मेघालय ग्रामीण)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "meghalaya_cm_maternity_benefit",
    icon: "🤱", color: "#BE185D", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Social Welfare Dept. / Health & Family Welfare Dept.", hi: "मेघालय समाज कल्याण विभाग / स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Chief Minister's Maternity Benefit Scheme (Meghalaya)",
               hi: "मुख्यमंत्री प्रसूति लाभ योजना (मेघालय)" },
    benefit: { en: "₹12,000 one-time financial assistance to pregnant women in BPL/EWS households for the first two live births — ₹6,000 at 8 months of pregnancy (on institutional registration) and ₹6,000 after institutional delivery; supplements Pradhan Mantri Matru Vandana Yojana (PMMVY); paid via DBT to mother's Aadhaar-linked bank account; additional ₹1,000 incentive for early ANC registration before 12 weeks",
               hi: "BPL/EWS परिवारों की गर्भवती महिलाओं को पहले दो जीवित जन्मों के लिए ₹12,000 एकमुश्त सहायता — गर्भावस्था के 8वें माह में ₹6,000 (संस्थागत पंजीकरण पर) और संस्थागत प्रसव के बाद ₹6,000; प्रधानमंत्री मातृ वंदना योजना (PMMVY) का पूरक; DBT से माँ के आधार-लिंक्ड बैंक खाते में; 12 सप्ताह से पहले ANC पंजीकरण पर ₹1,000 अतिरिक्त प्रोत्साहन" },
    tag:     { en: "Women / Maternity / DBT", hi: "महिला / प्रसूति / DBT" },
    annual: 12000,
    apply:   { en: "Nearest PHC / CHC / Sub-Centre or Anganwadi Centre (offline)", hi: "निकटतम PHC / CHC / उप-केंद्र या आंगनवाड़ी केंद्र (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Registration / MCP Card (Mother & Child Protection)", "BPL / NFSA Ration Card or Income Certificate", "Bank Account (Aadhaar-linked, mother's name)", "Delivery Certificate / Birth Certificate (for 2nd installment)", "Residence Proof (Meghalaya)", "Passport Photo"],
               hi: ["आधार कार्ड", "गर्भावस्था पंजीकरण / MCP कार्ड", "BPL / NFSA राशन कार्ड या आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, माँ के नाम)", "प्रसव प्रमाण पत्र / जन्म प्रमाण पत्र (दूसरी किस्त के लिए)", "निवास प्रमाण (मेघालय)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "meghalaya_srlm_shg",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya State Rural Livelihoods Society (MSRLS) / Rural Development Dept.", hi: "मेघालय राज्य ग्रामीण आजीविका सोसायटी (MSRLS) / ग्रामीण विकास विभाग" },
    name:    { en: "Meghalaya State Rural Livelihoods Society — SHG Support (Meghalaya)",
               hi: "मेघालय राज्य ग्रामीण आजीविका सोसायटी — SHG सहायता (मेघालय)" },
    benefit: { en: "Revolving fund of ₹15,000 per SHG + Community Investment Fund up to ₹3 lakh for women's Self-Help Groups active for 6+ months; subsidised loans up to ₹5 lakh at 7% interest for income-generating activities — weaving, food processing, bamboo & cane crafts, and agro-based enterprises; market linkage through Meghalaya Basin Development Authority (MBDA) fairs and e-commerce; capacity-building and digital literacy training",
               hi: "6+ महीने से सक्रिय महिला SHGs के लिए ₹15,000 रिवॉल्विंग फंड + ₹3 लाख तक सामुदायिक निवेश निधि; बुनाई, खाद्य प्रसंस्करण, बांस व बेंत शिल्प और कृषि-आधारित उद्यमों के लिए 7% ब्याज पर ₹5 लाख तक सब्सिडी ऋण; MBDA मेलों और ई-कॉमर्स के माध्यम से बाजार संपर्क; क्षमता-निर्माण और डिजिटल साक्षरता प्रशिक्षण" },
    tag:     { en: "Women / SHG / Rural Livelihood", hi: "महिला / SHG / ग्रामीण आजीविका" },
    annual: 0,
    apply:   { en: "msrls.meghalaya.gov.in / Block MSRLS office (offline)", hi: "msrls.meghalaya.gov.in / ब्लॉक MSRLS कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Registration Certificate / SHG Passbook", "SHG Bank Account (joint account, Aadhaar-linked)", "Residence Proof (Meghalaya)", "Meeting minutes (6+ months of activity)", "Passport Photo"],
               hi: ["आधार कार्ड", "SHG पंजीकरण प्रमाण पत्र / SHG पासबुक", "SHG बैंक खाता (संयुक्त खाता, आधार-लिंक्ड)", "निवास प्रमाण (मेघालय)", "बैठक कार्यवृत्त (6+ महीने की गतिविधि)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && a.who === "women",
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "meghalaya_mhis",
    icon: "🏥", color: "#DC2626", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Health & Family Welfare Dept.", hi: "मेघालय स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Meghalaya Health Insurance Scheme — MHIS (Meghalaya)",
               hi: "मेघालय स्वास्थ्य बीमा योजना — MHIS (मेघालय)" },
    benefit: { en: "Cashless health cover of ₹5 lakh/family/year at empanelled government and private hospitals for BPL and low-income families; covers 1,500+ medical packages including surgery, hospitalisation, cancer treatment, dialysis, and neonatal care; supplements Ayushman Bharat PM-JAY; State Health Card issued for cashless access; extends to family members including dependent parents",
               hi: "BPL और कम आय वाले परिवारों को सूचीबद्ध सरकारी व निजी अस्पतालों में ₹5 लाख/परिवार/वर्ष नकद-रहित स्वास्थ्य कवर; 1,500+ चिकित्सा पैकेज — सर्जरी, अस्पताल भर्ती, कैंसर उपचार, डायलिसिस, नवजात देखभाल सहित; आयुष्मान भारत PM-JAY का पूरक; नकद-रहित पहुंच के लिए राज्य स्वास्थ्य कार्ड; आश्रित माता-पिता सहित परिवार के सदस्यों तक विस्तारित" },
    tag:     { en: "Health / Insurance / BPL", hi: "स्वास्थ्य / बीमा / BPL" },
    annual: 500000,
    apply:   { en: "https://meghalayahealthinsurance.gov.in", hi: "meghalayahealthinsurance.gov.in / निकटतम सूचीबद्ध अस्पताल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "NFSA / BPL Ration Card", "State Health / MHIS Card (if issued)", "Residence Proof (Meghalaya)", "Family composition certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "NFSA / BPL राशन कार्ड", "राज्य स्वास्थ्य / MHIS कार्ड (यदि जारी हो)", "निवास प्रमाण (मेघालय)", "परिवार संरचना प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "meghalaya_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Education Dept.", hi: "मेघालय शिक्षा विभाग" },
    name:    { en: "Chief Minister's Scholarship Scheme (Meghalaya)",
               hi: "मुख्यमंत्री छात्रवृत्ति योजना (मेघालय)" },
    benefit: { en: "Annual scholarship of ₹10,000–₹25,000 for meritorious students from ST/SC/OBC/EWS and general BPL families — ₹10,000/year for Class 11–12; ₹16,000/year for UG; ₹25,000/year for PG / professional courses; students must score 60%+ in MBOSE / SSLC board exams; paid via DBT to Aadhaar-linked bank account; renewable annually on maintaining 50%+ marks",
               hi: "ST/SC/OBC/EWS और सामान्य BPL परिवार के मेधावी छात्रों को ₹10,000–₹25,000 वार्षिक छात्रवृत्ति — कक्षा 11–12 के लिए ₹10,000/वर्ष; UG के लिए ₹16,000/वर्ष; PG/व्यावसायिक पाठ्यक्रम के लिए ₹25,000/वर्ष; MBOSE / SSLC बोर्ड परीक्षा में 60%+ अंक आवश्यक; DBT से आधार-लिंक्ड बैंक खाते में; 50%+ अंक बनाए रखने पर वार्षिक नवीनीकरण" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 25000,
    apply:   { en: "https://scholarships.meghalaya.gov.in", hi: "scholarships.meghalaya.gov.in / स्कूल या कॉलेज कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 10 / 12 Marksheet (MBOSE / SSLC)", "Income Certificate (family income below threshold)", "ST / SC / OBC Certificate (if applicable)", "Admission / Enrollment Certificate from current institution", "Bank Account (Aadhaar-linked, student's name)", "Residence Proof (Meghalaya)", "Passport Photo"],
               hi: ["आधार कार्ड", "कक्षा 10 / 12 अंकसूची (MBOSE / SSLC)", "आय प्रमाण पत्र (पारिवारिक आय सीमा से कम)", "ST / SC / OBC प्रमाण पत्र (यदि लागू हो)", "वर्तमान संस्थान से प्रवेश / नामांकन प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास प्रमाण (मेघालय)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && a.who === "student",
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "meghalaya_social_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Social Welfare Dept.", hi: "मेघालय समाज कल्याण विभाग" },
    name:    { en: "Meghalaya State Social Security Pension Scheme",
               hi: "मेघालय राज्य सामाजिक सुरक्षा पेंशन योजना" },
    benefit: { en: "Monthly pension (NSAP central share + state top-up) — Elderly (60–79 years): ₹1,000/month; Elderly (80+ years): ₹1,500/month; Widows (40–59 years): ₹1,000/month; Persons with Disability (40%+): ₹1,000/month; paid directly to Aadhaar-linked bank account; no application fee; beneficiaries verified annually through Jeevan Pramaan (life certificate)",
               hi: "मासिक पेंशन (NSAP केंद्रीय अंश + राज्य टॉप-अप) — वृद्ध (60–79 वर्ष): ₹1,000/माह; वृद्ध (80+ वर्ष): ₹1,500/माह; विधवाएं (40–59 वर्ष): ₹1,000/माह; दिव्यांगजन (40%+): ₹1,000/माह; आधार-लिंक्ड बैंक खाते में सीधे; कोई आवेदन शुल्क नहीं; जीवन प्रमाण (जीवन प्रमाण पत्र) के माध्यम से वार्षिक सत्यापन" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 18000,
    apply:   { en: "socialwelfare.meghalaya.gov.in / BDO or SDO office (offline)", hi: "socialwelfare.meghalaya.gov.in / BDO या SDO कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / Church record) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, from Medical Board) — for disabled", "BPL Ration Card / Income Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Meghalaya)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / चर्च रिकॉर्ड) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "BPL राशन कार्ड / आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मेघालय)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "meghalaya_cm_grih_nirman",
    icon: "🏠", color: "#B45309", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Urban Affairs Dept. / Rural Development Dept.", hi: "मेघालय नगर मामले विभाग / ग्रामीण विकास विभाग" },
    name:    { en: "Chief Minister's Grih Nirman Yojana (Meghalaya)",
               hi: "मुख्यमंत्री गृह निर्माण योजना (मेघालय)" },
    benefit: { en: "₹1.30 lakh financial assistance for construction of pucca house in hilly/rural areas; ₹1.20 lakh for plain areas — for BPL/EWS/houseless families; paid in 3 installments (foundation, lintel, and roof stage); complements PMAY-Gramin and PMAY-Urban; must include functional toilet (linked with SBM-G); SC/ST, widows, disabled, and single-women households given priority; supplemented by 90 days MGNREGS labour",
               hi: "पहाड़ी/ग्रामीण क्षेत्रों में पक्के मकान निर्माण के लिए ₹1.30 लाख; मैदानी क्षेत्रों में ₹1.20 लाख — BPL/EWS/बेघर परिवारों के लिए; 3 किस्तों में (नींव, लिंटेल और छत); PMAY-ग्रामीण और PMAY-शहरी का पूरक; कार्यात्मक शौचालय अनिवार्य (SBM-G से जुड़ा); SC/ST, विधवाओं, दिव्यांग और एकल महिला परिवारों को प्राथमिकता; 90 दिन MGNREGS श्रम से पूरक" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 130000,
    apply:   { en: "Gram Panchayat / Dorbar Shnong / BDO office (offline)", hi: "ग्राम पंचायत / दरबार श्नोंग / BDO कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card / Houseless Certificate", "Land / Plot Ownership Document or Chieftain allocation letter", "Bank Account (Aadhaar-linked)", "Residence Proof (Meghalaya)", "Passport Photo", "ST Certificate (for priority)", "Disability Certificate (if applicable)"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड / बेघर प्रमाण पत्र", "भूमि / भूखंड स्वामित्व दस्तावेज़ या मुखिया आवंटन पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मेघालय)", "पासपोर्ट फोटो", "ST प्रमाण पत्र (प्राथमिकता के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Meghalaya" && ["below1","1to3"].includes(a.income),
  },

  // ── TRIBAL WELFARE ────────────────────────────────────────────────────────

  {
    id: "meghalaya_khadc_jhadc_welfare",
    icon: "🏔️", color: "#0369A1", scope: "state", state: "Meghalaya",
    ministry: { en: "Khasi Hills Autonomous District Council (KHADC) / Jaintia Hills ADC (JHADC) / Garo Hills ADC (GHADC)", hi: "खासी हिल्स स्वायत्त जिला परिषद (KHADC) / जयंतिया हिल्स ADC / गारो हिल्स ADC" },
    name:    { en: "Autonomous District Council Tribal Welfare Schemes (Meghalaya)",
               hi: "स्वायत्त जिला परिषद जनजातीय कल्याण योजनाएं (मेघालय)" },
    benefit: { en: "Package of welfare benefits administered by Meghalaya's three Autonomous District Councils (KHADC, JHADC, GHADC) — free textbooks and uniforms for ST students (Class 1–12); hostel stipend of ₹2,000–₹3,000/month for residential students; livelihood grants of ₹10,000–₹15,000 for traditional craftspeople (weaving, cane & bamboo, pottery, sericulture); legal aid for customary land rights; health camps in remote habitations",
               hi: "मेघालय की तीन स्वायत्त जिला परिषदों (KHADC, JHADC, GHADC) द्वारा प्रशासित कल्याण लाभों का पैकेज — ST छात्रों (कक्षा 1–12) के लिए निःशुल्क पाठ्यपुस्तक व वर्दी; आवासीय छात्रों के लिए ₹2,000–₹3,000/माह छात्रावास वजीफा; पारंपरिक शिल्पकारों (बुनाई, बेंत व बांस, मिट्टी के बर्तन, रेशम पालन) के लिए ₹10,000–₹15,000 आजीविका अनुदान; प्रथागत भूमि अधिकारों के लिए कानूनी सहायता; दूरदराज बस्तियों में स्वास्थ्य शिविर" },
    tag:     { en: "Tribal / ST / ADC / Welfare", hi: "जनजातीय / ST / ADC / कल्याण" },
    annual: 36000,
    apply:   { en: "khadc.nic.in / jhadc.nic.in / ghadc.nic.in — respective ADC office", hi: "khadc.nic.in / jhadc.nic.in / ghadc.nic.in — संबंधित ADC कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST Certificate (Khasi / Jaintia / Garo / other recognised tribe of Meghalaya)", "Residence Proof within ADC jurisdiction", "Income Certificate / BPL Card", "Bank Account (Aadhaar-linked)", "For students: School / College Enrollment Certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "ST प्रमाण पत्र (खासी / जयंतिया / गारो / मेघालय की अन्य मान्यता प्राप्त जनजाति)", "ADC क्षेत्राधिकार में निवास प्रमाण", "आय प्रमाण पत्र / BPL कार्ड", "बैंक खाता (आधार-लिंक्ड)", "छात्रों के लिए: विद्यालय / महाविद्यालय नामांकन प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && (a.caste === "ST" || a.caste === "SC"),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "meghalaya_msy_entrepreneur",
    icon: "🚀", color: "#0F766E", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Basin Development Authority (MBDA) / Industries & Commerce Dept.", hi: "मेघालय बेसिन विकास प्राधिकरण (MBDA) / उद्योग एवं वाणिज्य विभाग" },
    name:    { en: "Meghalaya Start-Up & Youth Entrepreneurship Scheme (Meghalaya)",
               hi: "मेघालय स्टार्ट-अप एवं युवा उद्यमिता योजना (मेघालय)" },
    benefit: { en: "Seed grant of ₹2 lakh–₹10 lakh for first-generation entrepreneurs aged 18–40 years in sectors including agri-processing, eco-tourism, IT, handloom, and handicrafts; 30% capital subsidy (max ₹3 lakh) on project cost; ST/SC/women entrepreneurs receive additional 5% subsidy; free incubation at MBDA-supported centres in Shillong; mentoring, IPR support, and market linkage through Meghalaya Artfed; applicant must be a resident of Meghalaya",
               hi: "कृषि-प्रसंस्करण, इको-टूरिज्म, IT, हथकरघा और हस्तशिल्प क्षेत्रों में 18–40 वर्ष के प्रथम पीढ़ी के उद्यमियों के लिए ₹2 लाख–₹10 लाख बीज अनुदान; परियोजना लागत पर 30% पूंजी सब्सिडी (अधिकतम ₹3 लाख); ST/SC/महिला उद्यमियों को अतिरिक्त 5%; शिलांग में MBDA-समर्थित केंद्रों पर निःशुल्क इनक्यूबेशन; मेघालय आर्टफेड के माध्यम से मेंटरिंग, IPR सहायता और बाजार संपर्क; मेघालय का निवासी होना अनिवार्य" },
    tag:     { en: "Youth / Start-Up / Entrepreneur", hi: "युवा / स्टार्ट-अप / उद्यमी" },
    annual: 0,
    apply:   { en: "https://mbda.gov.in", hi: "mbda.gov.in / जिला उद्योग केंद्र (DIC) शिलांग या जिला कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof", "Educational Qualification Certificate", "Business Plan / Project Report", "Residence Proof (Meghalaya)", "Bank Account (Aadhaar-linked)", "ST / SC / OBC Certificate (for additional subsidy)", "Passport Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण", "शैक्षिक योग्यता प्रमाण पत्र", "व्यवसाय योजना / परियोजना रिपोर्ट", "निवास प्रमाण (मेघालय)", "बैंक खाता (आधार-लिंक्ड)", "ST / SC / OBC प्रमाण पत्र (अतिरिक्त सब्सिडी के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Meghalaya" && (a.who === "unemployed" || a.who === "youth") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── RURAL CONNECTIVITY ────────────────────────────────────────────────────

  {
    id: "meghalaya_mplads_dorbar",
    icon: "🚌", color: "#1D4ED8", scope: "state", state: "Meghalaya",
    ministry: { en: "Meghalaya Public Works Dept. / Transport Dept.", hi: "मेघालय लोक निर्माण विभाग / परिवहन विभाग" },
    name:    { en: "Meghalaya Rural Transport & Connectivity Scheme (Meghalaya)",
               hi: "मेघालय ग्रामीण परिवहन एवं संपर्क योजना (मेघालय)" },
    benefit: { en: "Subsidised and regulated bus/taxi connectivity for remote hill villages to district headquarters, markets, and hospitals; government-subsidised last-mile transport covering unconnected habitations in Khasi, Jaintia, and Garo Hills; route planning done in coordination with Dorbar Shnong (village councils); no fare cap — fares regulated by the state transport authority; priority routes serve weekly markets (haats)",
               hi: "खासी, जयंतिया और गारो हिल्स में असंपर्कित बस्तियों को जिला मुख्यालय, बाजार और अस्पतालों से जोड़ने के लिए सब्सिडी युक्त और नियमित बस/टैक्सी सेवा; दरबार श्नोंग (ग्राम परिषदों) के सहयोग से मार्ग नियोजन; किराया राज्य परिवहन प्राधिकरण द्वारा नियंत्रित; साप्ताहिक बाजारों (हाटों) को प्राथमिकता" },
    tag:     { en: "Rural / Transport / Connectivity", hi: "ग्रामीण / परिवहन / संपर्क" },
    annual: 0,
    apply:   { en: "Contact BDO / Block Transport Office or Dorbar Shnong for route information", hi: "मार्ग जानकारी के लिए BDO / ब्लॉक परिवहन कार्यालय या दरबार श्नोंग से संपर्क करें" }, applyType: "offline",
    docs:    { en: ["No documents required — this is a public transport service available to all Meghalaya residents"],
               hi: ["कोई दस्तावेज़ आवश्यक नहीं — यह मेघालय के सभी निवासियों के लिए उपलब्ध एक सार्वजनिक परिवहन सेवा है"] },
    match: (a) => a.state === "Meghalaya" && a.area === "rural",
  },

  // ADD MORE MEGHALAYA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "meghalaya_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Meghalaya",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Meghalaya",
  // },

];
