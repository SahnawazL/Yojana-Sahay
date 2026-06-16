// Odisha — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "odisha_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const ODISHA_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "odisha_cm_kisan",
    icon: "🌾", color: "#15803D", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Agriculture & Farmers Empowerment Dept.", hi: "ओडिशा कृषि एवं किसान सशक्तिकरण विभाग" },
    name:    { en: "CM Kisan Yojana (Odisha)",
               hi: "सीएम किसान योजना (ओडिशा)" },
    benefit: { en: "₹4,000/year (2 installments of ₹2,000 each in Rabi & Kharif seasons) for small and marginal farmers; ₹12,500/year (3 installments) for landless agricultural households not covered under PM-KISAN — direct bank transfer",
               hi: "छोटे व सीमांत किसानों को ₹4,000/वर्ष (रबी व खरीफ में ₹2,000–₹2,000 किस्त); भूमिहीन कृषि परिवारों को ₹12,500/वर्ष (3 किस्तों में) — PM-KISAN में शामिल न होने वाले किसानों के लिए — सीधे बैंक खाते में" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 12500,
    apply:   { en: "https://www.govtschemes.in/odisha-cm-kisan-yojana", hi: "cmkisan.odisha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Khatian (for small/marginal farmers)", "Farmer Registration on Krushak Portal", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Proof of landlessness (for landless category)"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / खतियान (छोटे/सीमांत किसानों के लिए)", "कृषक पोर्टल पर किसान पंजीकरण", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "भूमिहीनता का प्रमाण (भूमिहीन श्रेणी के लिए)"] },
    match: (a) => a.state === "Odisha" && (a.who === "farmer" || ["below1","1to3"].includes(a.income)),
  },

  {
    id: "odisha_kalia",
    icon: "🌱", color: "#D97706", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Agriculture Dept.", hi: "ओडिशा कृषि विभाग" },
    name:    { en: "KALIA Scheme (Odisha) — Superseded by CM Kisan",
               hi: "कालिया योजना (ओडिशा) — CM किसान द्वारा प्रतिस्थापित" },
    benefit: { en: "₹10,000/year + life insurance + crop assistance for farmers; Note: KALIA has been replaced by CM Kisan Yojana (September 2024) — existing beneficiaries may be migrated automatically",
               hi: "₹10,000/वर्ष + जीवन बीमा + फसल सहायता; ध्यान दें: KALIA को CM किसान योजना (सितंबर 2024) से बदला गया है — मौजूदा लाभार्थियों को स्वतः स्थानांतरित किया जा सकता है" },
    tag:     { en: "Farmer (Legacy Scheme)", hi: "किसान (पुरानी योजना)" },
    annual: 10000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/kalia", hi: "kalia.odisha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records", "Bank Passbook", "Farmer ID"],
               hi: ["आधार कार्ड", "जमीन के कागज़", "बैंक पासबुक", "किसान आईडी"] },
    match: (a) => a.state === "Odisha" && a.who === "farmer",
  },

  {
    id: "odisha_samrudha_krushak",
    icon: "🌾", color: "#78350F", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Agriculture & Farmers Empowerment Dept.", hi: "ओडिशा कृषि एवं किसान सशक्तिकरण विभाग" },
    name:    { en: "Samrudha Krushak Yojana (Odisha)",
               hi: "समृद्ध कृषक योजना (ओडिशा)" },
    benefit: { en: "Government purchases paddy directly from farmers at ₹3,100 per quintal — higher than MSP of ₹2,300/quintal — eliminating middlemen; ₹5,000 crore allocated; payment directly credited to farmers' bank accounts",
               hi: "सरकार किसानों से सीधे ₹3,100 प्रति क्विंटल पर धान खरीदती है — MSP ₹2,300/क्विंटल से अधिक — बिचौलिए समाप्त; ₹5,000 करोड़ आवंटित; भुगतान सीधे किसानों के बैंक खाते में" },
    tag:     { en: "Farmer / Paddy MSP", hi: "किसान / धान MSP" },
    annual: 0,
    apply:   { en: "https://agriodisha.gov.in", hi: "agriodisha.gov.in / निकटतम मो सेवा केंद्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Khatian", "Farmer Registration Certificate", "Bank Account (Aadhaar-linked)", "Paddy cultivation proof / Crop registration"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / खतियान", "किसान पंजीकरण प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "धान खेती प्रमाण / फसल पंजीकरण"] },
    match: (a) => a.state === "Odisha" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "odisha_subhadra",
    icon: "👩", color: "#BE185D", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Women & Child Development Dept.", hi: "ओडिशा महिला एवं बाल विकास विभाग" },
    name:    { en: "Subhadra Yojana (Odisha)",
               hi: "सुभद्रा योजना (ओडिशा)" },
    benefit: { en: "₹50,000 total over 5 years (2024–2029) for women aged 21–60 — ₹10,000 per year in two installments of ₹5,000 each (on Raksha Bandhan and International Women's Day); paid via DBT to Aadhaar-linked bank account; a Subhadra Debit Card is also issued; top 100 women per village making digital transactions get an extra ₹500 bonus",
               hi: "21–60 वर्ष की महिलाओं को 5 साल (2024–2029) में कुल ₹50,000 — प्रति वर्ष ₹10,000 दो किस्तों में (रक्षा बंधन व अंतर्राष्ट्रीय महिला दिवस पर ₹5,000–₹5,000); आधार-लिंक्ड बैंक खाते में DBT; सुभद्रा डेबिट कार्ड भी जारी; प्रत्येक गांव में डिजिटल लेनदेन करने वाली शीर्ष 100 महिलाओं को ₹500 अतिरिक्त" },
    tag:     { en: "Women / Financial Empowerment", hi: "महिला / वित्तीय सशक्तिकरण" },
    annual: 10000,
    apply:   { en: "https://subhadra.odisha.gov.in", hi: "subhadra.odisha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (mandatory)", "Aadhaar-linked Bank Account (single-holder, DBT-enabled)", "NFSA / SFSS Ration Card OR Income Certificate (family income < ₹2.5 lakh)", "Mobile Number (Aadhaar-linked)", "e-KYC completion on the portal"],
               hi: ["आधार कार्ड (अनिवार्य)", "आधार-लिंक्ड बैंक खाता (एकल धारक, DBT-सक्षम)", "NFSA / SFSS राशन कार्ड या आय प्रमाण पत्र (पारिवारिक आय ₹2.5 लाख से कम)", "मोबाइल नंबर (आधार-लिंक्ड)", "पोर्टल पर e-KYC पूर्ण"] },
    match: (a) => a.state === "Odisha" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "odisha_mission_shakti",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Mission Shakti Dept.", hi: "ओडिशा मिशन शक्ति विभाग" },
    name:    { en: "Mission Shakti — SHG Loan Scheme (Odisha)",
               hi: "मिशन शक्ति — SHG ऋण योजना (ओडिशा)" },
    benefit: { en: "Interest-free loans up to ₹10 lakh for women SHG members to start or expand small businesses; seed money of ₹15,000 for new SHGs; revolving funds and capacity-building support; uniforms & blazers provided; Mission Shakti Bazaar platform for selling products",
               hi: "महिला SHG सदस्यों को छोटे व्यवसाय शुरू/विस्तार हेतु ₹10 लाख तक ब्याज-मुक्त ऋण; नए SHGs के लिए ₹15,000 बीज राशि; रिवॉल्विंग फंड व क्षमता निर्माण सहायता; वर्दी व ब्लेज़र; उत्पाद बेचने के लिए मिशन शक्ति बाजार मंच" },
    tag:     { en: "Women / SHG / Entrepreneurship", hi: "महिला / SHG / उद्यमिता" },
    annual: 0,
    apply:   { en: "https://missionshakti.odisha.gov.in/en/programme/mission-shakti-loan-state-interest-subvention", hi: "missionshakti.odisha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG passbook", "Bank Account (SHG account, Aadhaar-linked)", "Residence Proof (Odisha)", "Passport Photo", "Business plan / Project report (for larger loans)"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG खाता, आधार-लिंक्ड)", "निवास प्रमाण (ओडिशा)", "पासपोर्ट फोटो", "व्यवसाय योजना / परियोजना रिपोर्ट (बड़े ऋण के लिए)"] },
    match: (a) => a.state === "Odisha" && a.who === "women",
  },

  {
    id: "odisha_mamata",
    icon: "🤱", color: "#EC4899", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Women & Child Development Dept. (ICDS)", hi: "ओडिशा महिला एवं बाल विकास विभाग (ICDS)" },
    name:    { en: "Mamata Scheme (Odisha)",
               hi: "ममता योजना (ओडिशा)" },
    benefit: { en: "₹10,000 total financial assistance for pregnant and lactating women — ₹6,000 after 6 months of pregnancy + ₹4,000 after delivery; paid via DBT to promote institutional delivery, nutrition and rest; for women aged 19+ who are not government employees",
               hi: "गर्भवती और स्तनपान कराने वाली महिलाओं को ₹10,000 कुल सहायता — गर्भावस्था के 6 माह बाद ₹6,000 + प्रसव के बाद ₹4,000; DBT के माध्यम से; संस्थागत प्रसव, पोषण और आराम को बढ़ावा देने के लिए; 19 वर्ष से अधिक आयु की महिलाओं के लिए जो सरकारी कर्मचारी नहीं हैं" },
    tag:     { en: "Women / Maternal Health", hi: "महिला / मातृ स्वास्थ्य" },
    annual: 10000,
    apply:   { en: "Register at Anganwadi Centre / CDPO office (offline + online)", hi: "आंगनवाड़ी केंद्र / CDPO कार्यालय पर पंजीकरण (ऑफलाइन + ऑनलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Certificate (from PHC/Hospital)", "Bank Account (Aadhaar-linked)", "Anganwadi Registration Card", "Age Proof (minimum 19 years)", "Non-government employment declaration"],
               hi: ["आधार कार्ड", "गर्भावस्था प्रमाण पत्र (PHC/अस्पताल से)", "बैंक खाता (आधार-लिंक्ड)", "आंगनवाड़ी पंजीकरण कार्ड", "आयु प्रमाण (न्यूनतम 19 वर्ष)", "गैर-सरकारी रोजगार घोषणा पत्र"] },
    match: (a) => a.state === "Odisha" && a.who === "women",
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "odisha_gjay",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Health & Family Welfare Dept.", hi: "ओडिशा स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Gopabandhu Jan Arogya Yojana — GJAY (Odisha)",
               hi: "गोपबंधु जन आरोग्य योजना — GJAY (ओडिशा)" },
    benefit: { en: "Cashless health coverage up to ₹5 lakh per family per year at 27,000+ empanelled hospitals across India; ₹7 lakh if the family has female members; covers cancer, heart & kidney diseases (income < ₹3 lakh); free treatment at all govt. health facilities from sub-centre to district hospital; conveyance of ₹2,000 for referrals outside Odisha; formerly called BSKY — renamed in 2024",
               hi: "परिवार को प्रति वर्ष ₹5 लाख तक कैशलेस उपचार 27,000+ सूचीबद्ध अस्पतालों में; महिला सदस्य वाले परिवार को ₹7 लाख; कैंसर, हृदय व किडनी रोग कवर (आय ₹3 लाख से कम); सभी सरकारी स्वास्थ्य केंद्रों पर निःशुल्क उपचार; ओडिशा से बाहर रेफरल पर ₹2,000 आवागमन सहायता; पूर्व में BSKY — 2024 में नाम बदला" },
    tag:     { en: "Health / Insurance", hi: "स्वास्थ्य / बीमा" },
    annual: 500000,
    apply:   { en: "https://gjay.odisha.gov.in", hi: "gjay.odisha.gov.in / निकटतम सरकारी अस्पताल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "GJAY / BSKY Card (or NFSA Ration Card)", "Residence Proof (Odisha)", "Income Certificate (for cancer/heart/kidney coverage above ₹5 lakh)", "Referral letter (for treatment outside Odisha)"],
               hi: ["आधार कार्ड", "GJAY / BSKY कार्ड (या NFSA राशन कार्ड)", "निवास प्रमाण (ओडिशा)", "आय प्रमाण पत्र (₹5 लाख से अधिक कैंसर/हृदय/किडनी उपचार के लिए)", "रेफरल पत्र (ओडिशा से बाहर उपचार के लिए)"] },
    match: (a) => a.state === "Odisha" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "odisha_godabarisha_laptop",
    icon: "💻", color: "#7C3AED", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Higher Education Dept.", hi: "ओडिशा उच्च शिक्षा विभाग" },
    name:    { en: "Godabarisha Vidyarthi Protsahana Yojana — Laptop DBT (Odisha)",
               hi: "गोदाबरीश विद्यार्थी प्रोत्साहन योजना — लैपटॉप DBT (ओडिशा)" },
    benefit: { en: "₹30,000 one-time financial assistance directly credited to bank account (DBT) for 12th pass meritorious students to purchase a laptop; 15,000 scholarships distributed per year; open to SC/ST/OBC/General/SBC/EBC students; formerly called Biju Yuva Sashaktikaran Yojana — renamed in 2024",
               hi: "कक्षा 12 उत्तीर्ण मेधावी छात्रों को लैपटॉप खरीदने के लिए ₹30,000 एकमुश्त DBT; प्रति वर्ष 15,000 छात्रवृत्तियां; SC/ST/OBC/सामान्य/SBC/EBC सभी वर्गों के छात्र पात्र; पूर्व में बीजू युवा सशक्तिकरण योजना — 2024 में नाम बदला" },
    tag:     { en: "Student / Technology", hi: "छात्र / तकनीक" },
    annual: 30000,
    apply:   { en: "https://www.govtschemes.in/odisha-godabarisha-vidyarthi-protsahana-yojana-laptop-dbt", hi: "scholarship.odisha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 12 Marksheet / Certificate (CHSE Odisha)", "Bank Account (Aadhaar-linked, student's name)", "Residence Proof (Odisha)", "Caste Certificate (if SC/ST/OBC)", "Student ID Card", "Class 12 Admit Card", "Passport Photo", "Mobile number and email"],
               hi: ["आधार कार्ड", "कक्षा 12 अंकसूची / प्रमाण पत्र (CHSE ओडिशा)", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास प्रमाण (ओडिशा)", "जाति प्रमाण पत्र (SC/ST/OBC के लिए)", "छात्र पहचान पत्र", "कक्षा 12 प्रवेश पत्र", "पासपोर्ट फोटो", "मोबाइल नंबर व ईमेल"] },
    match: (a) => a.state === "Odisha" && a.who === "student",
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "odisha_madhu_babu_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Social Security & Empowerment of Persons with Disabilities Dept.", hi: "ओडिशा सामाजिक सुरक्षा एवं दिव्यांगजन सशक्तिकरण विभाग" },
    name:    { en: "Madhu Babu Pension Yojana — MBPY (Odisha)",
               hi: "मधु बाबू पेंशन योजना — MBPY (ओडिशा)" },
    benefit: { en: "Monthly pension for vulnerable groups (as per 2024-25 budget revision) — Elderly (60+ years): ₹1,000/month; Widows: ₹1,200/month; Persons with Disability (40%+): ₹1,400/month; paid directly to bank account; ~47 lakh beneficiaries across Odisha; no income bar for those above 80 years",
               hi: "कमजोर वर्गों को मासिक पेंशन (2024-25 बजट संशोधन के अनुसार) — वृद्ध (60+ वर्ष): ₹1,000/माह; विधवाएं: ₹1,200/माह; दिव्यांगजन (40%+): ₹1,400/माह; सीधे बैंक खाते में; ओडिशा में ~47 लाख लाभार्थी; 80 वर्ष से अधिक के लिए कोई आय सीमा नहीं" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 16800,
    apply:   { en: "ssepd.odisha.gov.in / BDO or Municipality office (offline)", hi: "ssepd.odisha.gov.in / BDO या नगरपालिका कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, issued by Medical Board) — for disabled", "Bank Account (Aadhaar-linked)", "Residence Proof (Odisha)", "BPL Ration Card (if applicable)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (ओडिशा)", "BPL राशन कार्ड (यदि लागू हो)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Odisha" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "odisha_biju_pakka_ghar",
    icon: "🏠", color: "#B45309", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Rural Housing Dept. / Panchayati Raj", hi: "ओडिशा ग्रामीण आवास विभाग / पंचायती राज" },
    name:    { en: "Biju Pakka Ghar Yojana (Odisha)",
               hi: "बीजू पक्का घर योजना (ओडिशा)" },
    benefit: { en: "₹1.20 lakh financial assistance in installments for construction of a pucca house in plain areas; ₹1.30 lakh in hilly/tribal areas; for rural BPL/houseless families living in kutcha or dilapidated houses; paid in 4 installments — ₹20,000 at order, subsequent stages at lintel level, roof, and completion; must include sanitary latrine",
               hi: "मैदानी क्षेत्रों में पक्के मकान निर्माण के लिए ₹1.20 लाख किस्तों में सहायता; पहाड़ी/जनजातीय क्षेत्रों में ₹1.30 लाख; कच्चे या जीर्ण मकानों में रहने वाले ग्रामीण BPL/बेघर परिवारों के लिए; 4 किस्तों में — आदेश पर ₹20,000, फिर लिंटेल स्तर, छत, और पूर्णता पर; शौचालय अनिवार्य" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 120000,
    apply:   { en: "rhd.odisha.gov.in / Gram Panchayat office", hi: "rhd.odisha.gov.in / ग्राम पंचायत कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card / Houseless Certificate", "Land Ownership / Patta document", "Bank Account (Aadhaar-linked)", "Residence Proof (Odisha rural)", "Passport Photo", "Caste Certificate (if SC/ST for priority)"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड / बेघर प्रमाण पत्र", "भूमि स्वामित्व / पट्टा दस्तावेज़", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (ओडिशा ग्रामीण)", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST प्राथमिकता के लिए)"] },
    match: (a) => a.state === "Odisha" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── RURAL TRANSPORT ───────────────────────────────────────────────────────

  {
    id: "odisha_gramanchal_parivahan",
    icon: "🚌", color: "#1D4ED8", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Commerce & Transport Dept.", hi: "ओडिशा वाणिज्य एवं परिवहन विभाग" },
    name:    { en: "Gramanchal Paribahan Yojana (Odisha)",
               hi: "ग्रामांचल परिवहन योजना (ओडिशा)" },
    benefit: { en: "Affordable and reliable bus/transport connectivity for rural and remote habitations — government-subsidised last-mile transport service connecting unconnected villages to block headquarters and markets; ₹1,085 crore budget in 2024-25; formerly known as LAccMI Scheme (Location Accessible Multi-modal Initiative) — renamed in 2024",
               hi: "ग्रामीण और दूरदराज बस्तियों के लिए किफायती और भरोसेमंद बस/परिवहन — सरकार सब्सिडी युक्त अंतिम-मील परिवहन सेवा जो असंपर्कित गांवों को ब्लॉक मुख्यालय और बाजार से जोड़ती है; 2024-25 में ₹1,085 करोड़ बजट; पूर्व में LAccMI योजना — 2024 में नाम बदला" },
    tag:     { en: "Rural / Transport Connectivity", hi: "ग्रामीण / परिवहन संपर्क" },
    annual: 0,
    apply:   { en: "Contact BDO / Block office for route information", hi: "मार्ग जानकारी के लिए BDO / ब्लॉक कार्यालय से संपर्क करें" }, applyType: "offline",
    docs:    { en: ["No documents required — scheme is a public transport service; available to all rural residents of Odisha"],
               hi: ["कोई दस्तावेज़ आवश्यक नहीं — यह एक सार्वजनिक परिवहन सेवा है; ओडिशा के सभी ग्रामीण निवासियों के लिए उपलब्ध"] },
    match: (a) => a.state === "Odisha" && a.area === "rural",
  },

  // ADD MORE ODISHA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "odisha_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Odisha",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Odisha",
  // },

];
