// Andhra Pradesh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "ap_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const ANDHRA_PRADESH_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "ap_ysr_rythu_bharosa",
    icon: "🌾", color: "#15803D", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Agriculture Dept. / YSR Rythu Bharosa — PM-KISAN State Top-Up", hi: "AP कृषि विभाग / YSR रैतु भरोसा — PM-KISAN राज्य टॉप-अप" },
    name:    { en: "YSR Rythu Bharosa — Farmer Investment Support (Andhra Pradesh)",
               hi: "YSR रैतु भरोसा — किसान निवेश सहायता (आंध्र प्रदेश)" },
    benefit: { en: "Flagship AP farmer investment support scheme providing ₹13,500 per year per farm household — structured as: ₹6,000 from PM-KISAN (Central) + ₹7,500 additional state top-up from the AP government; credited directly to the farmer's bank account in a single annual installment; eligible for all landowning farmers and tenant farmers with valid cultivation certificate (LCC); benefits also extended to agricultural labourers separately under YSR Rythu Bharosa for input assistance; complements free crop insurance through Rythu Bharosa Kendras (RBKs) at village level — one RBK per two villages providing doorstep soil testing, seed distribution, and extension services; covers all 26 districts of Andhra Pradesh",
               hi: "AP की प्रमुख किसान निवेश सहायता योजना जो प्रति कृषि परिवार प्रति वर्ष ₹13,500 प्रदान करती है — संरचना: PM-KISAN (केंद्र) से ₹6,000 + AP सरकार से ₹7,500 अतिरिक्त राज्य टॉप-अप; किसान के बैंक खाते में एकल वार्षिक किस्त में सीधे जमा; सभी भूमि-स्वामी किसानों और वैध खेती प्रमाण पत्र (LCC) वाले किरायेदार किसानों के लिए पात्र; ग्राम स्तर पर RBK (प्रति दो गांव एक RBK) के माध्यम से निःशुल्क फसल बीमा, मृदा परीक्षण, बीज वितरण और विस्तार सेवाएं; आंध्र प्रदेश के सभी 26 जिलों में कवरेज" },
    tag:     { en: "Farmer / Direct Benefit / PM-KISAN Top-Up", hi: "किसान / प्रत्यक्ष लाभ / PM-KISAN टॉप-अप" },
    annual: 13500,
    apply:   { en: "apagrisnet.gov.in / Rythu Bharosa Kendra (RBK) at village level (offline)", hi: "apagrisnet.gov.in / ग्राम स्तर पर रैतु भरोसा केंद्र (RBK) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (Pahani / Adangal — proof of ownership or tenancy)", "Caste Certificate (if applicable)", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Tenant Farmer — Land Cultivation Certificate (LCC) from RBK / Village Revenue Officer"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (पहानी / अडांगल — स्वामित्व या किरायेदारी का प्रमाण)", "जाति प्रमाण पत्र (यदि लागू हो)", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "किरायेदार किसान — RBK / ग्राम राजस्व अधिकारी से भूमि खेती प्रमाण पत्र (LCC)"] },
    match: (a) => a.state === "Andhra Pradesh" && a.who === "farmer",
  },

  {
    id: "ap_rbk_free_crop_insurance",
    icon: "🌱", color: "#D97706", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Agriculture Dept. / Rythu Bharosa Kendra (RBK) — Free Crop Insurance", hi: "AP कृषि विभाग / रैतु भरोसा केंद्र (RBK) — निःशुल्क फसल बीमा" },
    name:    { en: "AP Free Crop Insurance Scheme via Rythu Bharosa Kendras",
               hi: "रैतु भरोसा केंद्रों के माध्यम से AP निःशुल्क फसल बीमा योजना" },
    benefit: { en: "Andhra Pradesh provides 100% premium-free crop insurance to all registered farmers through Pradhan Mantri Fasal Bima Yojana (PMFBY) — the entire farmer-share premium is borne by the AP state government; coverage includes: paddy, cotton, groundnut, maize, red gram, bengal gram, and horticultural crops; insured against crop loss due to drought, flood, cyclone, hailstorm, pest/disease attack; compensation paid directly to bank account within 2 months of crop damage assessment; enrolment done automatically through RBK at village level — farmer need not visit any office; additional benefit: free Rythu Bharosa Kendra services include soil health card (every 2 years), free quality seeds and pesticides supply at subsidised rates, and drone-based crop monitoring in select districts",
               hi: "आंध्र प्रदेश सभी पंजीकृत किसानों को PMFBY के माध्यम से 100% प्रीमियम-मुक्त फसल बीमा प्रदान करता है — संपूर्ण किसान-हिस्सा प्रीमियम AP राज्य सरकार द्वारा वहन किया जाता है; कवरेज: धान, कपास, मूंगफली, मक्का, अरहर, चना और बागवानी फसलें; सूखा, बाढ़, चक्रवात, ओलावृष्टि, कीट/रोग हमले से फसल हानि पर बीमा; फसल नुकसान आकलन के 2 महीने के भीतर बैंक खाते में सीधे मुआवजा; RBK के माध्यम से स्वचालित नामांकन; अतिरिक्त लाभ: मृदा स्वास्थ्य कार्ड (हर 2 वर्ष), गुणवत्तापूर्ण बीज और सब्सिडी दर पर कीटनाशक, चयनित जिलों में ड्रोन आधारित फसल निगरानी" },
    tag:     { en: "Farmer / Crop Insurance / Free Premium", hi: "किसान / फसल बीमा / निःशुल्क प्रीमियम" },
    annual: 0,
    apply:   { en: "Rythu Bharosa Kendra (RBK) — auto-enrolled at village level (offline)", hi: "रैतु भरोसा केंद्र (RBK) — ग्राम स्तर पर स्वतः नामांकन (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (Pahani / Adangal)", "Bank Account (Aadhaar-linked)", "Sowing certificate (if required by RBK)", "Mobile Number"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (पहानी / अडांगल)", "बैंक खाता (आधार-लिंक्ड)", "बुआई प्रमाण पत्र (यदि RBK द्वारा आवश्यक हो)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Andhra Pradesh" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "ap_ysr_cheyutha",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Women Development & Child Welfare Dept. / YSR Cheyutha", hi: "AP महिला विकास एवं बाल कल्याण विभाग / YSR चेयुथा" },
    name:    { en: "YSR Cheyutha — Women's Economic Empowerment Scheme (Andhra Pradesh)",
               hi: "YSR चेयुथा — महिला आर्थिक सशक्तिकरण योजना (आंध्र प्रदेश)" },
    benefit: { en: "Direct financial assistance of ₹18,750 per year to women aged 45–60 years from BC (Backward Class), SC, ST, and minority communities to support self-employment and livelihoods — paid in 4 quarterly installments of ₹4,687 directly to the beneficiary's bank account; no conditionality on how the money is spent — designed to provide economic autonomy to women in the vulnerable 45–60 age group who are often excluded from other schemes; covers approximately 23 lakh women across AP; combined with convergence benefits including free health check-ups under Aarogyasri, enrollment in SHG groups under APCNF, and skill training opportunities",
               hi: "स्वरोजगार और आजीविका सहायता के लिए BC, SC, ST और अल्पसंख्यक समुदायों की 45–60 वर्ष की महिलाओं को प्रति वर्ष ₹18,750 सीधी वित्तीय सहायता — ₹4,687 की 4 तिमाही किस्तों में सीधे बैंक खाते में; धन के उपयोग पर कोई शर्त नहीं; AP में लगभग 23 लाख महिलाओं को कवर करती है; Aarogyasri के तहत निःशुल्क स्वास्थ्य जांच, APCNF के तहत SHG नामांकन और कौशल प्रशिक्षण के साथ अभिसरण लाभ" },
    tag:     { en: "Women / Direct Benefit / BC-SC-ST", hi: "महिला / प्रत्यक्ष लाभ / BC-SC-ST" },
    annual: 18750,
    apply:   { en: "navasakam.ap.gov.in / Ward/Village Secretariat (offline)", hi: "navasakam.ap.gov.in / वार्ड/ग्राम सचिवालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID — must be 45–60 yrs)", "Caste Certificate (BC / SC / ST / Minority Certificate)", "Bank Account (Aadhaar-linked)", "Residence Proof (Andhra Pradesh)", "Mobile Number", "Passport Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID — 45–60 वर्ष होना अनिवार्य)", "जाति प्रमाण पत्र (BC / SC / ST / अल्पसंख्यक प्रमाण पत्र)", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (आंध्र प्रदेश)", "मोबाइल नंबर", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Andhra Pradesh" && a.who === "women" && (a.caste === "obc" || a.caste === "sc" || a.caste === "st") && (a.age === "35to60" || a.age === "above60"),
  },

  {
    id: "ap_jagananna_amma_vodi",
    icon: "🤱", color: "#9333EA", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP School Education Dept. / Jagananna Amma Vodi", hi: "AP स्कूल शिक्षा विभाग / जगनान्ना अम्मा वोडी" },
    name:    { en: "Jagananna Amma Vodi — Mother's Education Support Scheme (Andhra Pradesh)",
               hi: "जगनान्ना अम्मा वोडी — माँ की शिक्षा सहायता योजना (आंध्र प्रदेश)" },
    benefit: { en: "Annual financial assistance of ₹15,000 per year to mothers/guardians of school-going children (Class 1–12 in government and aided schools) to support their children's education — paid in a single annual installment directly to the mother's bank account; applicable for all income groups with children enrolled in government/aided schools; encourages mothers to ensure 75%+ attendance and keep children in school; can be used for school uniforms, books, stationery, transport, or any educational need; women who are not the biological mother but are the primary caregiver/guardian are also eligible; approximately 42 lakh mothers benefited annually across AP; also includes free textbooks, mid-day meal, and school uniforms for enrolled students under converging schemes",
               hi: "सरकारी व सहायता प्राप्त स्कूलों में पढ़ने वाले बच्चों (कक्षा 1–12) की माताओं/अभिभावकों को बच्चों की शिक्षा सहायता हेतु प्रति वर्ष ₹15,000 — एकल वार्षिक किस्त में माँ के बैंक खाते में सीधे; सभी आय वर्गों के लिए लागू; माताओं को 75%+ उपस्थिति सुनिश्चित करने के लिए प्रोत्साहित करती है; जैविक माँ न होने पर भी प्राथमिक देखभालकर्ता/अभिभावक महिला पात्र; AP में प्रतिवर्ष लगभग 42 लाख माताएं लाभान्वित; निःशुल्क पाठ्यपुस्तक, मध्याह्न भोजन और स्कूल वर्दी का अभिसरण लाभ" },
    tag:     { en: "Women / Education / Mother Support", hi: "महिला / शिक्षा / माँ सहायता" },
    annual: 15000,
    apply:   { en: "ammavodi.ap.gov.in / Village/Ward Secretariat or School HM (offline)", hi: "ammavodi.ap.gov.in / ग्राम/वार्ड सचिवालय या स्कूल प्रधानाध्यापक (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (Mother's)", "Child's School Enrollment Certificate (from HM)", "Child's Aadhaar Card", "Bank Account (Mother's — Aadhaar-linked)", "Residence Proof (Andhra Pradesh)", "Mobile Number", "Passport Photo (Mother's)"],
               hi: ["आधार कार्ड (माँ का)", "बच्चे का विद्यालय नामांकन प्रमाण पत्र (प्रधानाध्यापक से)", "बच्चे का आधार कार्ड", "बैंक खाता (माँ का — आधार-लिंक्ड)", "निवास प्रमाण (आंध्र प्रदेश)", "मोबाइल नंबर", "पासपोर्ट फोटो (माँ का)"] },
    keywords: ["class10"],
    match: (a) => a.state === "Andhra Pradesh" && a.who === "women",
  },

  {
    id: "ap_ysr_aasara",
    icon: "🤝", color: "#0891B2", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Rural Development Dept. / SERP (Society for Elimination of Rural Poverty)", hi: "AP ग्रामीण विकास विभाग / SERP (ग्रामीण गरीबी उन्मूलन सोसायटी)" },
    name:    { en: "YSR Aasara — Women SHG Loan Waiver & Support (Andhra Pradesh)",
               hi: "YSR आसरा — महिला SHG ऋण माफी एवं सहायता (आंध्र प्रदेश)" },
    benefit: { en: "Two-pronged support for women Self-Help Group (SHG) members in Andhra Pradesh — (1) Loan Waiver Component: one-time waiver of SHG loans up to ₹1 lakh per SHG member from micro-finance institutions (MFIs) and commercial banks for women from BPL/poor households who are unable to repay; (2) Fresh Credit Support: interest-free or subsidised loans up to ₹1 lakh per SHG member for income-generating activities through APCNF/SERP network; skill development training linked to ZBF (Zero Budget Farming), organic agriculture, animal husbandry, and micro-enterprise; market linkage through 'Apni Mandi' and state-level fairs; covers rural women SHG members across all 26 districts; priority to Dalit and tribal women-led SHGs",
               hi: "आंध्र प्रदेश में महिला SHG सदस्यों के लिए दो-आयामी सहायता — (1) ऋण माफी घटक: BPL/गरीब परिवारों की महिलाओं के लिए MFIs और वाणिज्यिक बैंकों से प्रति SHG सदस्य ₹1 लाख तक के SHG ऋण की एकमुश्त माफी; (2) नया ऋण सहायता: APCNF/SERP नेटवर्क के माध्यम से आय-सृजन गतिविधियों के लिए प्रति सदस्य ₹1 लाख तक ब्याज-मुक्त/सब्सिडी ऋण; ZBF, जैविक कृषि, पशुपालन और सूक्ष्म उद्यम से जुड़ा कौशल प्रशिक्षण; 'अपनी मंडी' और राज्य मेलों के माध्यम से बाजार संपर्क; सभी 26 जिलों में ग्रामीण महिला SHG सदस्यों को कवरेज; दलित और जनजातीय महिला-नेतृत्व SHGs को प्राथमिकता" },
    tag:     { en: "Women / SHG / Loan Waiver", hi: "महिला / SHG / ऋण माफी" },
    annual: 0,
    apply:   { en: "serp.ap.gov.in / Village Organisation (VO) / Mandal Samakhya (offline)", hi: "serp.ap.gov.in / ग्राम संगठन (VO) / मंडल समाख्या (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Passbook / SHG Membership Certificate", "Bank Account (SHG joint account)", "BPL / Income Certificate", "Loan Documents from MFI / Bank (for waiver component)", "Residence Proof (Andhra Pradesh)", "Caste Certificate (for priority)", "Passport Photo"],
               hi: ["आधार कार्ड", "SHG पासबुक / SHG सदस्यता प्रमाण पत्र", "बैंक खाता (SHG संयुक्त खाता)", "BPL / आय प्रमाण पत्र", "MFI / बैंक से ऋण दस्तावेज (माफी घटक के लिए)", "निवास प्रमाण (आंध्र प्रदेश)", "जाति प्रमाण पत्र (प्राथमिकता के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Andhra Pradesh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "ap_jagananna_colony",
    icon: "🏠", color: "#B45309", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Housing Corporation / Jagananna Colonies (PMAY State Top-Up)", hi: "AP हाउसिंग कॉर्पोरेशन / जगनान्ना कॉलोनियां (PMAY राज्य टॉप-अप)" },
    name:    { en: "Jagananna Colony — Housing Scheme for Poor (Andhra Pradesh)",
               hi: "जगनान्ना कॉलोनी — गरीबों के लिए आवास योजना (आंध्र प्रदेश)" },
    benefit: { en: "One of the largest housing schemes in India — provides free house site (3 cents of land) plus financial assistance for construction to BPL/EWS households across AP — key benefits: ₹1.80 lakh total construction assistance per household (Central PMAY-G ₹1.2 lakh + AP state top-up ₹60,000); released in 4 installments tied to construction milestones; free house site (patta/land title deed) in Jagananna Colonies — government-developed township layouts with basic amenities (internal roads, drainage, electricity, water); house design is 323 sq ft (2 BHK standard plan) with earthquake and cyclone-resistant construction; mandatory functional toilet and drinking water tap; priority to SC/ST, fisherfolk, weaver households, and families displaced by natural disasters; covers all 13 original districts (now 26 districts post reorganisation); additional ₹10,000 incentive for timely completion",
               hi: "भारत की सबसे बड़ी आवास योजनाओं में से एक — AP के BPL/EWS परिवारों को निःशुल्क भूखंड (3 सेंट भूमि) + निर्माण सहायता — मुख्य लाभ: प्रति परिवार ₹1.80 लाख कुल निर्माण सहायता (केंद्रीय PMAY-G ₹1.2 लाख + AP राज्य टॉप-अप ₹60,000); निर्माण मील के पत्थर से जुड़ी 4 किस्तों में; जगनान्ना कॉलोनियों में निःशुल्क भूखंड (पट्टा/भूमि स्वामित्व विलेख) — बुनियादी सुविधाओं (सड़क, नाली, बिजली, पानी) सहित सरकारी टाउनशिप; 323 वर्ग फीट (2 BHK) भूकंप एवं चक्रवात-प्रतिरोधी मकान; कार्यात्मक शौचालय और नल का पानी अनिवार्य; SC/ST, मछुआरे, बुनकर परिवारों और प्राकृतिक आपदा प्रभावित परिवारों को प्राथमिकता; समय पर पूरा होने पर ₹10,000 अतिरिक्त प्रोत्साहन" },
    tag:     { en: "Housing / Free Site / BPL-EWS", hi: "आवास / निःशुल्क भूखंड / BPL-EWS" },
    annual: 180000,
    apply:   { en: "jaganannaaasara.ap.gov.in / Ward/Village Secretariat (offline)", hi: "jaganannaaasara.ap.gov.in / वार्ड/ग्राम सचिवालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Caste Certificate (SC/ST for priority)", "Residence Proof (Andhra Pradesh)", "Bank Account (Aadhaar-linked)", "Proof of no existing pucca house (self-declaration)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण पत्र", "जाति प्रमाण पत्र (SC/ST प्राथमिकता के लिए)", "निवास प्रमाण (आंध्र प्रदेश)", "बैंक खाता (आधार-लिंक्ड)", "पक्के मकान न होने का प्रमाण (स्व-घोषणा)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Andhra Pradesh" && ["below1","1to3"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT / BUSINESS ────────────────────────────────────────

  {
    id: "ap_jagananna_thodu",
    icon: "💼", color: "#0F766E", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP BC Welfare Dept. / Jagananna Thodu — Working Capital Support", hi: "AP BC कल्याण विभाग / जगनान्ना थोडू — कार्यशील पूंजी सहायता" },
    name:    { en: "Jagananna Thodu — Working Capital Loan for Petty Traders (Andhra Pradesh)",
               hi: "जगनान्ना थोडू — छोटे व्यापारियों के लिए कार्यशील पूंजी ऋण (आंध्र प्रदेश)" },
    benefit: { en: "Interest-free working capital loan of ₹10,000 per year for small street vendors, petty traders, and self-employed individuals from BC, SC, ST, minority, and Kapu communities — loan disbursed directly to beneficiary's bank account; repayment at zero interest; next year's loan disbursed after repayment of current year; covers shopkeepers, vegetable vendors, auto drivers, cobblers, tailors, barbers, flower sellers, small kiosk owners, and other self-employed informal sector workers; registration through Ward/Village Secretariat system; linked to APSSDC skill upgradation programmes; approximately 25 lakh beneficiaries annually; no collateral required",
               hi: "BC, SC, ST, अल्पसंख्यक और कापू समुदायों के छोटे पथ विक्रेताओं, छोटे व्यापारियों और स्वरोजगारित व्यक्तियों को प्रति वर्ष ₹10,000 ब्याज-मुक्त कार्यशील पूंजी ऋण — लाभार्थी के बैंक खाते में सीधे; शून्य ब्याज पर चुकौती; वर्तमान वर्ष की चुकौती के बाद अगले वर्ष का ऋण; दुकानदार, सब्जी विक्रेता, ऑटो चालक, मोची, दर्जी, नाई, फूल विक्रेता, छोटे कियोस्क मालिक और अन्य; वार्ड/ग्राम सचिवालय प्रणाली के माध्यम से पंजीकरण; APSSDC कौशल उन्नयन कार्यक्रमों से जुड़ाव; लगभग 25 लाख वार्षिक लाभार्थी; कोई संपार्श्विक नहीं" },
    tag:     { en: "Business / Petty Trade / Interest-Free Loan", hi: "व्यवसाय / छोटा व्यापार / ब्याज-मुक्त ऋण" },
    annual: 0,
    apply:   { en: "jaganannathodu.ap.gov.in / Ward/Village Secretariat (offline)", hi: "jaganannathodu.ap.gov.in / वार्ड/ग्राम सचिवालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (BC / SC / ST / Minority / Kapu)", "Proof of Trade / Self-Employment (shop photo, vendor ID, or self-declaration)", "Bank Account (Aadhaar-linked)", "Residence Proof (Andhra Pradesh)", "Mobile Number", "Passport Photo"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (BC / SC / ST / अल्पसंख्यक / कापू)", "व्यापार / स्वरोजगार का प्रमाण (दुकान फोटो, विक्रेता ID या स्व-घोषणा)", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (आंध्र प्रदेश)", "मोबाइल नंबर", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Andhra Pradesh" && (a.who === "business" || a.who === "general" || a.who === "unemployed") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── SENIOR / PENSION ──────────────────────────────────────────────────────

  {
    id: "ap_ysr_pension_kanuka",
    icon: "👴", color: "#7C3AED", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Social Welfare Dept. / YSR Pension Kanuka", hi: "AP समाज कल्याण विभाग / YSR पेंशन कानुका" },
    name:    { en: "YSR Pension Kanuka — Social Security Pension (Andhra Pradesh)",
               hi: "YSR पेंशन कानुका — सामाजिक सुरक्षा पेंशन (आंध्र प्रदेश)" },
    benefit: { en: "Monthly social security pension for vulnerable groups in Andhra Pradesh delivered door-to-door by volunteers on the 1st of every month — pension amounts: ₹2,750/month for old-age pensioners (60+ years, BPL), widows, and deserted women; ₹3,000/month for persons with disability (40%+ disability); ₹3,000/month for weavers, toddy tappers, fishermen, and single women (dhobi, barber community); ₹3,500/month for persons with 100% disability; ₹10,000/month for HIV-positive persons; home delivery of pension cash by Village/Ward Volunteer directly at doorstep — no need to visit a bank or government office; covers approximately 65 lakh pensioners across AP; no family income ceiling for disability pensioners; all pensioners also entitled to free Aarogyasri health insurance",
               hi: "आंध्र प्रदेश में कमजोर वर्गों को स्वयंसेवकों द्वारा हर महीने की 1 तारीख को घर-घर पहुंचाई जाने वाली मासिक सामाजिक सुरक्षा पेंशन — पेंशन राशि: वृद्धावस्था पेंशनधारकों (60+ वर्ष, BPL), विधवाओं और परित्यक्त महिलाओं को ₹2,750/माह; 40%+ दिव्यांगजनों को ₹3,000/माह; बुनकरों, तोड़ी टैपर्स, मछुआरों और अकेली महिलाओं को ₹3,000/माह; 100% दिव्यांगजनों को ₹3,500/माह; HIV-पॉजिटिव व्यक्तियों को ₹10,000/माह; ग्राम/वार्ड स्वयंसेवक द्वारा दरवाजे पर नकद डिलीवरी; AP में लगभग 65 लाख पेंशनधारक; दिव्यांग पेंशनधारकों के लिए कोई आय सीमा नहीं; सभी पेंशनधारकों को निःशुल्क आरोग्यश्री स्वास्थ्य बीमा" },
    tag:     { en: "Senior / Pension / Disability / Widow", hi: "वरिष्ठ / पेंशन / दिव्यांग / विधवा" },
    annual: 33000,
    apply:   { en: "navasakam.ap.gov.in / Ward/Village Secretariat or Village Volunteer (offline)", hi: "navasakam.ap.gov.in / वार्ड/ग्राम सचिवालय या ग्राम स्वयंसेवक (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID — for old age pension)", "BPL / Income Certificate", "Widowhood / Desertion Certificate (for widow/deserted category)", "Disability Certificate (for disability pension — issued by Medical Board)", "Caste Certificate (if applicable)", "Bank Account (Aadhaar-linked)", "Residence Proof (Andhra Pradesh)", "Passport Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID — वृद्धावस्था पेंशन के लिए)", "BPL / आय प्रमाण पत्र", "विधवापन / परित्याग प्रमाण पत्र (विधवा/परित्यक्त श्रेणी के लिए)", "दिव्यांगता प्रमाण पत्र (दिव्यांग पेंशन के लिए — चिकित्सा बोर्ड द्वारा जारी)", "जाति प्रमाण पत्र (यदि लागू हो)", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (आंध्र प्रदेश)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Andhra Pradesh" && (a.who === "senior" || (a.who === "women" && a.age === "above60")) && ["below1","1to3"].includes(a.income),
  },

  // ── SC / ST WELFARE ───────────────────────────────────────────────────────

  {
    id: "ap_sc_st_corporation",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP SC Corporation (APSCFC) & ST Corporation (TRICOR) / Welfare Dept.", hi: "AP SC कॉर्पोरेशन (APSCFC) एवं ST कॉर्पोरेशन (TRICOR) / कल्याण विभाग" },
    name:    { en: "AP SC/ST Corporation — Welfare & Livelihood Schemes (Andhra Pradesh)",
               hi: "AP SC/ST कॉर्पोरेशन — कल्याण एवं आजीविका योजनाएं (आंध्र प्रदेश)" },
    benefit: { en: "Cluster of targeted welfare schemes administered through APSCFC (for SC) and TRICOR (for ST) covering multiple needs — key benefits: (1) Unit Assistance: ₹1 lakh–₹5 lakh loan at 4% interest for SC/ST entrepreneurs to start micro-enterprises (with 30–50% subsidy component); (2) Education: pre-matric and post-matric scholarships at ₹550–₹1,200 per month for SC/ST students in government and aided institutions; free residential school hostel seats in Gurukul schools across AP; (3) Land Distribution: allotment of ceiling surplus / government land to landless SC/ST agricultural labourers; (4) Scheduled Areas: special ITDA (Integrated Tribal Development Agency) programmes for ST in scheduled areas covering free seeds, tools, health camps, and PESA-based governance support; (5) AMBEDKAR OVERSEAS: scholarship for SC/ST students for higher education abroad",
               hi: "APSCFC (SC के लिए) और TRICOR (ST के लिए) के माध्यम से प्रशासित लक्षित कल्याण योजनाओं का समूह — मुख्य लाभ: (1) इकाई सहायता: SC/ST उद्यमियों को सूक्ष्म उद्यम शुरू करने के लिए 4% ब्याज पर ₹1 लाख–₹5 लाख ऋण (30–50% सब्सिडी घटक); (2) शिक्षा: सरकारी व सहायता प्राप्त संस्थानों में SC/ST छात्रों को ₹550–₹1,200/माह प्री-मैट्रिक और पोस्ट-मैट्रिक छात्रवृत्ति; गुरुकुल विद्यालयों में निःशुल्क आवासीय सीटें; (3) भूमि वितरण: भूमिहीन SC/ST कृषि श्रमिकों को अधिशेष/सरकारी भूमि आवंटन; (4) अनुसूचित क्षेत्र: निःशुल्क बीज, औजार, स्वास्थ्य शिविर और PESA आधारित शासन सहायता; (5) अंबेडकर ओवरसीज: विदेश में उच्च शिक्षा के लिए SC/ST छात्रवृत्ति" },
    tag:     { en: "SC / ST / Scholarship / Livelihood", hi: "SC / ST / छात्रवृत्ति / आजीविका" },
    annual: 14400,
    apply:   { en: "apscorporation.ap.gov.in / tricor.ap.gov.in / District Welfare Officer (offline)", hi: "apscorporation.ap.gov.in / tricor.ap.gov.in / जिला कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SC or ST Caste Certificate (issued by AP Revenue Dept.)", "Income Certificate (family annual income)", "Residence Proof (Andhra Pradesh)", "Bank Account (Aadhaar-linked)", "For Education: School/College Enrollment Certificate & Mark Sheet", "For Enterprise: Project Report / Business Plan", "For Land: Agricultural Labour Certificate from VRO", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "SC या ST जाति प्रमाण पत्र (AP राजस्व विभाग द्वारा जारी)", "आय प्रमाण पत्र (पारिवारिक वार्षिक आय)", "निवास प्रमाण (आंध्र प्रदेश)", "बैंक खाता (आधार-लिंक्ड)", "शिक्षा के लिए: विद्यालय/महाविद्यालय नामांकन प्रमाण पत्र एवं अंकतालिका", "उद्यम के लिए: परियोजना रिपोर्ट / व्यवसाय योजना", "भूमि के लिए: VRO से कृषि श्रमिक प्रमाण पत्र", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Andhra Pradesh" && (a.caste === "sc" || a.caste === "st"),
  },

  // ADD MORE ANDHRA PRADESH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "ap_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Andhra Pradesh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Andhra Pradesh",
  // },

];
