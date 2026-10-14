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
    name:    { en: "Annadata Sukhibhava (Andhra Pradesh) — formerly YSR Rythu Bharosa",
               hi: "अन्नदाता सुखीभव (आंध्र प्रदेश) — पहले YSR रैतु भरोसा" },
    benefit: { en: "₹20,000 a year per farmer family — ₹14,000 from the state + ₹6,000 PM-Kisan — paid in instalments",
               hi: "प्रति किसान परिवार ₹20,000 प्रति वर्ष — राज्य से ₹14,000 + PM-किसान से ₹6,000 — किस्तों में" },
    tag:     { en: "Farmer / Direct Benefit / PM-KISAN Top-Up", hi: "किसान / प्रत्यक्ष लाभ / PM-KISAN टॉप-अप" },
    annual: 20000,
    apply:   { en: "apagrisnet.gov.in / Rythu Bharosa Kendra (RBK) at village level (offline)", hi: "apagrisnet.gov.in / ग्राम स्तर पर रैतु भरोसा केंद्र (RBK) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (Pahani / Adangal — proof of ownership or tenancy)", "Caste Certificate (if applicable)", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Tenant Farmer — Land Cultivation Certificate (LCC) from RBK / Village Revenue Officer"],
               hi: ["आधार कार्ड", "भूमि अभिलेख (पहानी / अडांगल — स्वामित्व या किरायेदारी का प्रमाण)", "जाति प्रमाण पत्र (यदि लागू हो)", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "किरायेदार किसान — RBK / ग्राम राजस्व अधिकारी से भूमि खेती प्रमाण पत्र (LCC)"] },
    eligibilityText: { en: ["Farmer families in Andhra Pradesh with cultivable land", "Must be registered with e-KYC at the Rythu Seva Kendram (village secretariat)", "Not for income-tax payers or government employees (same exclusions as PM-Kisan)"],
                       hi: ["आंध्र प्रदेश के खेती योग्य ज़मीन वाले किसान परिवार", "रैतु सेवा केंद्र (ग्राम सचिवालय) पर e-KYC के साथ पंजीकरण ज़रूरी", "आयकर दाता या सरकारी कर्मचारी पात्र नहीं (PM-किसान जैसे नियम)"] },
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
    icon: "👩‍💼", color: "#BE185D", scope: "state", closed: true, state: "Andhra Pradesh",
    ministry: { en: "AP Women Development & Child Welfare Dept. / YSR Cheyutha", hi: "AP महिला विकास एवं बाल कल्याण विभाग / YSR चेयुथा" },
    name:    { en: "YSR Cheyutha — Women's Economic Empowerment Scheme (Andhra Pradesh)",
               hi: "YSR चेयुथा — महिला आर्थिक सशक्तिकरण योजना (आंध्र प्रदेश)" },
    benefit: { en: "Ended — its 4 yearly instalments were paid 2020–2024; no new instalments since. Direct financial assistance of ₹18,750 per year to women aged 45–60 years from BC (Backward Class), SC, ST, and minority communities to support self-employment and livelihoods — paid in 4 quarterly installments of ₹4,687 directly to the beneficiary's bank account; no conditionality on how the money is spent — designed to provide economic autonomy to women in the vulnerable 45–60 age group who are often excluded from other schemes; covers approximately 23 lakh women across AP; combined with convergence benefits including free health check-ups under Aarogyasri, enrollment in SHG groups under APCNF, and skill training opportunities",
               hi: "समाप्त — इसकी 4 वार्षिक किस्तें 2020–2024 में दी गईं; उसके बाद कोई नई किस्त नहीं। स्वरोजगार और आजीविका सहायता के लिए BC, SC, ST और अल्पसंख्यक समुदायों की 45–60 वर्ष की महिलाओं को प्रति वर्ष ₹18,750 सीधी वित्तीय सहायता — ₹4,687 की 4 तिमाही किस्तों में सीधे बैंक खाते में; धन के उपयोग पर कोई शर्त नहीं; AP में लगभग 23 लाख महिलाओं को कवर करती है; Aarogyasri के तहत निःशुल्क स्वास्थ्य जांच, APCNF के तहत SHG नामांकन और कौशल प्रशिक्षण के साथ अभिसरण लाभ" },
    tag:     { en: "Women / Direct Benefit / BC-SC-ST", hi: "महिला / प्रत्यक्ष लाभ / BC-SC-ST" },
    annual: 18750,
    apply:   { en: "navasakam.ap.gov.in / Ward/Village Secretariat (offline)", hi: "navasakam.ap.gov.in / वार्ड/ग्राम सचिवालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID — must be 45–60 yrs)", "Caste Certificate (BC / SC / ST / Minority Certificate)", "Bank Account (Aadhaar-linked)", "Residence Proof (Andhra Pradesh)", "Mobile Number", "Passport Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID — 45–60 वर्ष होना अनिवार्य)", "जाति प्रमाण पत्र (BC / SC / ST / अल्पसंख्यक प्रमाण पत्र)", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (आंध्र प्रदेश)", "मोबाइल नंबर", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Andhra Pradesh" && a.who === "women" && (a.caste === "obc" || a.caste === "sc" || a.caste === "st") && (a.age === "35to60" || a.age === "above60"),
  },

  {
    id: "ap_jagananna_amma_vodi",
    icon: "🤱", color: "#9333EA", scope: "state", closed: true, state: "Andhra Pradesh",
    ministry: { en: "AP School Education Dept. / Jagananna Amma Vodi", hi: "AP स्कूल शिक्षा विभाग / जगनान्ना अम्मा वोडी" },
    name:    { en: "Jagananna Amma Vodi — Mother's Education Support Scheme (Andhra Pradesh)",
               hi: "जगनान्ना अम्मा वोडी — माँ की शिक्षा सहायता योजना (आंध्र प्रदेश)" },
    benefit: { en: "Replaced by Talliki Vandanam (₹15,000 per child) from June 2025. Annual financial assistance of ₹15,000 per year to mothers/guardians of school-going children (Class 1–12 in government and aided schools) to support their children's education — paid in a single annual installment directly to the mother's bank account; applicable for all income groups with children enrolled in government/aided schools; encourages mothers to ensure 75%+ attendance and keep children in school; can be used for school uniforms, books, stationery, transport, or any educational need; women who are not the biological mother but are the primary caregiver/guardian are also eligible; approximately 42 lakh mothers benefited annually across AP; also includes free textbooks, mid-day meal, and school uniforms for enrolled students under converging schemes",
               hi: "जून 2025 से तल्लिकी वंदनम (प्रति बच्चा ₹15,000) ने इसकी जगह ली। सरकारी व सहायता प्राप्त स्कूलों में पढ़ने वाले बच्चों (कक्षा 1–12) की माताओं/अभिभावकों को बच्चों की शिक्षा सहायता हेतु प्रति वर्ष ₹15,000 — एकल वार्षिक किस्त में माँ के बैंक खाते में सीधे; सभी आय वर्गों के लिए लागू; माताओं को 75%+ उपस्थिति सुनिश्चित करने के लिए प्रोत्साहित करती है; जैविक माँ न होने पर भी प्राथमिक देखभालकर्ता/अभिभावक महिला पात्र; AP में प्रतिवर्ष लगभग 42 लाख माताएं लाभान्वित; निःशुल्क पाठ्यपुस्तक, मध्याह्न भोजन और स्कूल वर्दी का अभिसरण लाभ" },
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
    icon: "🤝", color: "#0891B2", scope: "state", closed: true, state: "Andhra Pradesh",
    ministry: { en: "AP Rural Development Dept. / SERP (Society for Elimination of Rural Poverty)", hi: "AP ग्रामीण विकास विभाग / SERP (ग्रामीण गरीबी उन्मूलन सोसायटी)" },
    name:    { en: "YSR Aasara — Women SHG Loan Waiver & Support (Andhra Pradesh)",
               hi: "YSR आसरा — महिला SHG ऋण माफी एवं सहायता (आंध्र प्रदेश)" },
    benefit: { en: "Ended — its 4 instalments were paid 2020–2024; no new instalments since. Two-pronged support for women Self-Help Group (SHG) members in Andhra Pradesh — (1) Loan Waiver Component: one-time waiver of SHG loans up to ₹1 lakh per SHG member from micro-finance institutions (MFIs) and commercial banks for women from BPL/poor households who are unable to repay; (2) Fresh Credit Support: interest-free or subsidised loans up to ₹1 lakh per SHG member for income-generating activities through APCNF/SERP network; skill development training linked to ZBF (Zero Budget Farming), organic agriculture, animal husbandry, and micro-enterprise; market linkage through 'Apni Mandi' and state-level fairs; covers rural women SHG members across all 26 districts; priority to Dalit and tribal women-led SHGs",
               hi: "समाप्त — इसकी 4 किस्तें 2020–2024 में दी गईं; उसके बाद कोई नई किस्त नहीं। आंध्र प्रदेश में महिला SHG सदस्यों के लिए दो-आयामी सहायता — (1) ऋण माफी घटक: BPL/गरीब परिवारों की महिलाओं के लिए MFIs और वाणिज्यिक बैंकों से प्रति SHG सदस्य ₹1 लाख तक के SHG ऋण की एकमुश्त माफी; (2) नया ऋण सहायता: APCNF/SERP नेटवर्क के माध्यम से आय-सृजन गतिविधियों के लिए प्रति सदस्य ₹1 लाख तक ब्याज-मुक्त/सब्सिडी ऋण; ZBF, जैविक कृषि, पशुपालन और सूक्ष्म उद्यम से जुड़ा कौशल प्रशिक्षण; 'अपनी मंडी' और राज्य मेलों के माध्यम से बाजार संपर्क; सभी 26 जिलों में ग्रामीण महिला SHG सदस्यों को कवरेज; दलित और जनजातीय महिला-नेतृत्व SHGs को प्राथमिकता" },
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
    ministry: { en: "AP Housing Corporation (PMAY Urban & Gramin)", hi: "AP हाउसिंग कॉर्पोरेशन (PMAY शहरी एवं ग्रामीण)" },
    name:    { en: "PMAY-NTR Nagar Housing — Pucca House for the Poor (Andhra Pradesh, formerly Jagananna Colonies)",
               hi: "PMAY-NTR नगर आवास — गरीबों के लिए पक्का मकान (आंध्र प्रदेश, पहले जगनान्ना कॉलोनी)" },
    description: { en: "Andhra Pradesh builds pucca houses for poor families without one, under PM Awas Yojana (Urban and Gramin) with state support. The old Jagananna Colonies were renamed PMAY-NTR Nagar in January 2025.", hi: "आंध्र प्रदेश बिना पक्के मकान वाले गरीब परिवारों के लिए PM आवास योजना (शहरी और ग्रामीण) के तहत राज्य की मदद से पक्के मकान बनाता है। पुरानी जगनान्ना कॉलोनियों का नाम जनवरी 2025 में PMAY-NTR नगर किया गया।" },
    benefit: { en: "Help to build a pucca house — PMAY gives ₹1.2 lakh in villages and up to ₹2.5 lakh in towns, released in stages as construction progresses; Andhra Pradesh adds extra help for SC, ST and other weaker families.",
               hi: "पक्का मकान बनाने के लिए सहायता — PMAY से गांव में ₹1.2 लाख और शहर में ₹2.5 लाख तक, निर्माण के चरणों के साथ किस्तों में; आंध्र प्रदेश SC, ST और अन्य कमज़ोर परिवारों को अतिरिक्त मदद देता है।" },
    tag:     { en: "Housing / PMAY / BPL-EWS", hi: "आवास / PMAY / BPL-EWS" },
    benefitKind: "oneTime",
    annual: 120000,
    apply:   { en: "https://pmay-urban.gov.in", hi: "ग्राम / वार्ड सचिवालय (गांव में PMAY-G सर्वे से)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Rice card / income certificate", "Caste certificate (for SC / ST extra help)", "House site / land document", "Self-declaration of no pucca house anywhere in India", "Aadhaar-linked bank account"],
               hi: ["आधार कार्ड", "राइस कार्ड / आय प्रमाण पत्र", "जाति प्रमाण पत्र (SC / ST अतिरिक्त मदद के लिए)", "मकान का प्लॉट / ज़मीन का कागज़", "भारत में कहीं पक्का मकान न होने का स्व-घोषणा पत्र", "आधार से जुड़ा बैंक खाता"] },
    eligibilityText: { en: ["Poor families of Andhra Pradesh (rice card holders / EWS) with no pucca house anywhere in India", "Apply at your village or ward secretariat; houses are sanctioned in phases by the Centre and the state"],
                       hi: ["आंध्र प्रदेश के गरीब परिवार (राइस कार्ड / EWS) जिनके पास भारत में कहीं पक्का मकान नहीं है", "अपने ग्राम या वार्ड सचिवालय में आवेदन करें; मकान केंद्र और राज्य द्वारा चरणों में स्वीकृत होते हैं"] },
    match: (a) => a.state === "Andhra Pradesh" && ["below1", "1to3"].includes(a.income) && (a.house == null || ["no", "kutcha"].includes(a.house)),
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
    ministry: { en: "AP Rural Development Dept. / SERP — NTR Bharosa Pensions", hi: "AP ग्रामीण विकास विभाग / SERP — NTR भरोसा पेंशन" },
    name:    { en: "NTR Bharosa — Social Security Pension (Andhra Pradesh, formerly YSR Pension Kanuka)",
               hi: "NTR भरोसा — सामाजिक सुरक्षा पेंशन (आंध्र प्रदेश, पहले YSR पेंशन कानुका)" },
    description: { en: "Andhra Pradesh's monthly pension for the elderly, widows, single women, persons with disabilities and some traditional workers — raised to ₹4,000 a month from July 2024 and handed over at home on the 1st of the month.", hi: "बुज़ुर्गों, विधवाओं, एकल महिलाओं, दिव्यांगजनों और कुछ पारंपरिक कामगारों के लिए आंध्र प्रदेश की मासिक पेंशन — जुलाई 2024 से ₹4,000 महीना, हर महीने की 1 तारीख को घर पर दी जाती है।" },
    benefit: { en: "₹4,000/month for old age (60+), widows, single women, weavers, fishermen, toddy tappers, cobblers, Dappu artists and transgender persons; ₹6,000/month for persons with disability (40%+); ₹10,000/month for some serious illnesses; ₹15,000/month for fully disabled / bedridden persons.",
               hi: "वृद्धावस्था (60+), विधवा, एकल महिला, बुनकर, मछुआरे, ताड़ी निकालने वाले, मोची, डप्पू कलाकार और ट्रांसजेंडर व्यक्तियों को ₹4,000/माह; दिव्यांगजन (40%+) को ₹6,000/माह; कुछ गंभीर बीमारियों में ₹10,000/माह; पूर्ण दिव्यांग / बिस्तर पर रहने वालों को ₹15,000/माह।" },
    tag:     { en: "Senior / Pension / Disability / Widow", hi: "वरिष्ठ / पेंशन / दिव्यांग / विधवा" },
    annual: 48000,
    apply:   { en: "https://sspensions.ap.gov.in", hi: "sspensions.ap.gov.in / ग्राम या वार्ड सचिवालय (नए आवेदन के समय)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (age proof for old-age pension)", "Rice card or income certificate", "Husband's death certificate (widows)", "SADAREM certificate, 40%+ (disability)", "Divorce decree / Tahsildar's unmarried certificate (single women)", "Department certificate (weavers, fishermen, toddy tappers, cobblers, Dappu artists)", "Bank account"],
               hi: ["आधार कार्ड (वृद्धावस्था पेंशन के लिए आयु प्रमाण)", "राइस कार्ड या आय प्रमाण पत्र", "पति का मृत्यु प्रमाण पत्र (विधवा)", "SADAREM प्रमाण पत्र, 40%+ (दिव्यांग)", "तलाक का आदेश / तहसीलदार का अविवाहित प्रमाण पत्र (एकल महिला)", "विभाग का प्रमाण पत्र (बुनकर, मछुआरे, ताड़ी, मोची, डप्पू कलाकार)", "बैंक खाता"] },
    eligibilityText: { en: ["Residents of Andhra Pradesh in one of the pension groups: old age, widow, single woman, disability, weaver, fisherman, toddy tapper, cobbler, Dappu artist, transgender person and others", "Family income up to ₹10,000 a month (village) or ₹12,000 a month (town)", "Not getting another government pension; new applications open in rounds at village / ward secretariats"],
                       hi: ["आंध्र प्रदेश के निवासी जो किसी पेंशन वर्ग में आते हों: वृद्ध, विधवा, एकल महिला, दिव्यांग, बुनकर, मछुआरा, ताड़ी, मोची, डप्पू कलाकार, ट्रांसजेंडर आदि", "परिवार की आय ₹10,000 महीना (गांव) या ₹12,000 महीना (शहर) तक", "कोई अन्य सरकारी पेंशन न मिलती हो; नए आवेदन चरणों में ग्राम / वार्ड सचिवालय पर खुलते हैं"] },
    match: (a) => a.state === "Andhra Pradesh" && ["below1", "1to3"].includes(a.income) && (a.who === "senior" || a.age === "above60" || (a.disability && a.disability !== "none") || a.marital === "widowed" || (Array.isArray(a.groups) && a.groups.some(g => ["widow", "fisher", "artisan"].includes(g)))),
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

  // <auto-scheme id="ap_deepam_free_lpg"> researched + verified on 2026-10-07 · source: https://westgodavari.ap.gov.in/civil-supplies/
  {
    id: "ap_deepam_free_lpg",
    icon: "👩", color: "#BE185D", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "Consumer Affairs, Food & Civil Supplies Department", hi: "उपभोक्ता मामले, खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Deepam 2.0 — 3 Free LPG Cylinders a Year", hi: "दीपम 2.0 — साल में 3 मुफ़्त एलपीजी सिलेंडर" },
    benefit: { en: "3 free LPG refills a year; cylinder cost refunded to your bank account within 48 hrs", hi: "साल में 3 मुफ़्त एलपीजी रिफ़िल; सिलेंडर की कीमत 48 घंटे में बैंक खाते में वापस" },
    tag:     { en: "Women / Free LPG", hi: "महिला / मुफ़्त एलपीजी" },
    annual: 2500,
    apply:   { en: "https://westgodavari.ap.gov.in/civil-supplies/", hi: "https://westgodavari.ap.gov.in/civil-supplies/" }, applyType: "offline",
    docs:    { en: ["Rice card","LPG connection (consumer number)","Aadhaar card","Aadhaar-linked bank account"],
               hi: ["राइस कार्ड","एलपीजी कनेक्शन (उपभोक्ता संख्या)","आधार कार्ड","आधार से जुड़ा बैंक खाता"] },
    autoAdded: "2026-10-07", source: "https://westgodavari.ap.gov.in/civil-supplies/",
    match: (a) => a.state === "Andhra Pradesh" && ["bpl","aay"].includes(a.rationCard),
  },
  // </auto-scheme id="ap_deepam_free_lpg">

  // <auto-scheme id="ap_ntr_vaidya_seva"> researched + verified on 2026-10-07 · source: https://spsnellore.ap.gov.in/dr-nandamuri-taraka-rama-rao-vaidyaseva-trust/
  {
    id: "ap_ntr_vaidya_seva",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "Health, Medical & Family Welfare Dept (Dr. NTR Vaidya Seva Trust)", hi: "स्वास्थ्य, चिकित्सा एवं परिवार कल्याण विभाग (डॉ. एनटीआर वैद्य सेवा ट्रस्ट)" },
    name:    { en: "Dr. NTR Vaidya Seva — Cashless Health Scheme", hi: "डॉ. एनटीआर वैद्य सेवा — कैशलेस स्वास्थ्य योजना" },
    benefit: { en: "Cashless treatment up to ₹25 lakh per family per year for 3,255 procedures", hi: "3,255 प्रक्रियाओं के लिए प्रति परिवार प्रति वर्ष ₹25 लाख तक कैशलेस इलाज" },
    tag:     { en: "Health / Insurance", hi: "स्वास्थ्य / बीमा" },
    annual: 500000,
    apply:   { en: "https://spsnellore.ap.gov.in/dr-nandamuri-taraka-rama-rao-vaidyaseva-trust/", hi: "https://spsnellore.ap.gov.in/dr-nandamuri-taraka-rama-rao-vaidyaseva-trust/" }, applyType: "offline",
    docs:    { en: ["White ration card (rice card)","Aadhaar card"],
               hi: ["सफ़ेद राशन कार्ड (राइस कार्ड)","आधार कार्ड"] },
    autoAdded: "2026-10-07", source: "https://spsnellore.ap.gov.in/dr-nandamuri-taraka-rama-rao-vaidyaseva-trust/",
    eligibilityText: { en: ["Families in Andhra Pradesh with a rice (white) ration card", "Or families with income up to ₹5 lakh a year who meet the scheme's land limits", "Show the health card or rice card with Aadhaar at an empanelled hospital"],
                       hi: ["चावल (सफ़ेद) राशन कार्ड वाले आंध्र प्रदेश के परिवार", "या ₹5 लाख तक सालाना आय वाले परिवार जो ज़मीन की सीमा पूरी करते हों", "सूचीबद्ध अस्पताल में आधार के साथ हेल्थ कार्ड या राइस कार्ड दिखाएं"] },
    match: (a) => a.state === "Andhra Pradesh" && ["bpl","aay"].includes(a.rationCard),
  },
  // </auto-scheme id="ap_ntr_vaidya_seva">

  // <auto-scheme id="ap_matsyakarula_sevalo_fishermen"> researched + verified on 2026-10-07 · source: https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf
  {
    id: "ap_matsyakarula_sevalo_fishermen",
    icon: "🌾", color: "#138808", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "Fisheries Department", hi: "मत्स्य विभाग" },
    name:    { en: "Matsyakarula Sevalo — Fishermen Financial Assistance", hi: "मत्स्यकारुला सेवलो — मछुआरा आर्थिक सहायता" },
    benefit: { en: "₹20,000 aid to fishermen families (raised from ₹10,000) for the fishing-ban period", hi: "मछली पकड़ने पर प्रतिबंध की अवधि के लिए मछुआरा परिवारों को ₹20,000 की सहायता (₹10,000 से बढ़ाकर)" },
    tag:     { en: "Farmer / Fishermen", hi: "किसान / मछुआरे" },
    annual: 20000,
    apply:   { en: "https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf", hi: "https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf" }, applyType: "offline",
    docs:    { en: ["Aadhaar card","Fisherman registration / ID proof","Boat / crew details","Bank account details"],
               hi: ["आधार कार्ड","मछुआरा पंजीकरण / पहचान प्रमाण","नाव / चालक दल का विवरण","बैंक खाते का विवरण"] },
    autoAdded: "2026-10-07", source: "https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf",
    match: (a) => a.state === "Andhra Pradesh",
  },
  // </auto-scheme id="ap_matsyakarula_sevalo_fishermen">

  // <auto-scheme id="ap_post_matric_scholarship"> researched + verified on 2026-10-07 · source: https://jnanabhumi.ap.gov.in/Aboutus.jsp
  {
    id: "ap_post_matric_scholarship",
    icon: "📚", color: "#003580", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "BC, Social, Tribal & Minority Welfare Departments", hi: "पिछड़ा वर्ग, समाज, जनजातीय एवं अल्पसंख्यक कल्याण विभाग" },
    name:    { en: "AP Post-Matric Scholarship & Tuition Fee Reimbursement (Jnanabhumi)", hi: "आंध्र प्रदेश पोस्ट-मैट्रिक छात्रवृत्ति एवं ट्यूशन फ़ीस प्रतिपूर्ति (ज्ञानभूमि)" },
    benefit: { en: "Full tuition fee reimbursement plus maintenance allowance for post-matric students", hi: "पोस्ट-मैट्रिक छात्रों को पूरी ट्यूशन फ़ीस की प्रतिपूर्ति और भरण-पोषण भत्ता" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 0,
    apply:   { en: "https://jnanabhumi.ap.gov.in/Aboutus.jsp", hi: "https://jnanabhumi.ap.gov.in/Aboutus.jsp" }, applyType: "online",
    docs:    { en: ["Aadhaar card","Caste / community certificate","Income certificate","Previous exam marks memo","College admission / bonafide certificate","Bank account details"],
               hi: ["आधार कार्ड","जाति / समुदाय प्रमाण पत्र","आय प्रमाण पत्र","पिछली परीक्षा की अंकतालिका","कॉलेज प्रवेश / बोनाफ़ाइड प्रमाण पत्र","बैंक खाते का विवरण"] },
    autoAdded: "2026-10-07", source: "https://jnanabhumi.ap.gov.in/Aboutus.jsp",
    match: (a) => a.state === "Andhra Pradesh" && a.who === "student" && ["class9to12","undergrad","postgrad"].includes(a.educationLevel),
  },
  // </auto-scheme id="ap_post_matric_scholarship">

  // <auto-scheme id="ap_free_power_handloom"> researched + verified on 2026-10-07 · source: https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf
  {
    id: "ap_free_power_handloom",
    icon: "💼", color: "#6B21A8", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "Handlooms & Textiles Department", hi: "हथकरघा एवं वस्त्र विभाग" },
    name:    { en: "Free Power for Handloom & Power Loom Weavers", hi: "हथकरघा एवं पावरलूम बुनकरों के लिए मुफ़्त बिजली" },
    benefit: { en: "Free electricity: up to 200 units/month for handlooms, 500 units/month for power looms", hi: "मुफ़्त बिजली: हथकरघा के लिए 200 यूनिट/माह तक, पावरलूम के लिए 500 यूनिट/माह तक" },
    tag:     { en: "Business / Weavers", hi: "व्यवसाय / बुनकर" },
    annual: 0,
    apply:   { en: "https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf", hi: "https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf" }, applyType: "offline",
    docs:    { en: ["Weaver identity card","Electricity service connection number","Aadhaar card"],
               hi: ["बुनकर पहचान पत्र","बिजली सर्विस कनेक्शन नंबर","आधार कार्ड"] },
    autoAdded: "2026-10-07", source: "https://apfinance.gov.in/...Bud@et26-27/documents/SpeechEnglish.pdf",
    match: (a) => a.state === "Andhra Pradesh",
  },
  // </auto-scheme id="ap_free_power_handloom">

  // <auto-scheme id="ap_motorized_three_wheelers"> researched + verified on 2026-10-07 · source: https://apdascac.ap.gov.in/Schemes/motorized-three-wheelers
  {
    id: "ap_motorized_three_wheelers",
    icon: "🦽", color: "#4F46E5", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Differently Abled & Senior Citizens Assistance Corporation (APDASCAC)", hi: "आंध्र प्रदेश दिव्यांग एवं वरिष्ठ नागरिक सहायता निगम (APDASCAC)" },
    name:    { en: "Motorized Three-Wheelers for Persons with Disabilities", hi: "दिव्यांगजनों के लिए मोटर चालित तिपहिया वाहन" },
    benefit: { en: "Motorized three-wheeler sanctioned once in a lifetime to persons with 70%+ disability", hi: "70% या अधिक दिव्यांगता वाले व्यक्तियों को जीवन में एक बार मोटर चालित तिपहिया वाहन" },
    tag:     { en: "Disability / Mobility Aid", hi: "दिव्यांगता / गतिशीलता सहायता" },
    annual: 0,
    apply:   { en: "https://apdascac.ap.gov.in/Schemes/motorized-three-wheelers", hi: "https://apdascac.ap.gov.in/Schemes/motorized-three-wheelers" }, applyType: "online",
    docs:    { en: ["Disability certificate","Aadhaar card","SSC certificate","Income certificate","Caste certificate (SC/ST/BC)","Bonafide or employment certificate"],
               hi: ["दिव्यांगता प्रमाण पत्र","आधार कार्ड","एसएससी (10वीं) प्रमाण पत्र","आय प्रमाण पत्र","जाति प्रमाण पत्र (एससी/एसटी/बीसी)","बोनाफ़ाइड या रोज़गार प्रमाण पत्र"] },
    autoAdded: "2026-10-07", source: "https://apdascac.ap.gov.in/Schemes/motorized-three-wheelers",
    match: (a) => a.state === "Andhra Pradesh" && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age) && (a.disability == null || a.disability !== "none"),
  },
  // </auto-scheme id="ap_motorized_three_wheelers">

  // ══ Added Oct 2026 — the NDA government's schemes (from June 2024), checked
  //    against AP government orders / portals (gsws-nbm.ap.gov.in,
  //    sspensions.ap.gov.in) and 2025–26 news ══

  {
    id: "ap_talliki_vandanam",
    icon: "👩‍👧", color: "#DB2777", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP School Education Dept.", hi: "AP स्कूल शिक्षा विभाग" },
    name:    { en: "Talliki Vandanam — ₹15,000 per School Child (Andhra Pradesh)", hi: "तल्लिकी वंदनम — प्रति स्कूली बच्चा ₹15,000 (आंध्र प्रदेश)" },
    description: { en: "Every year, mothers of children in Class 1 to 12 (Intermediate) get ₹15,000 per child — for every school-going child, not just one. It replaced Amma Vodi in June 2025.", hi: "हर साल कक्षा 1 से 12 (इंटरमीडिएट) में पढ़ने वाले बच्चों की माताओं को प्रति बच्चा ₹15,000 — हर स्कूली बच्चे के लिए, केवल एक के लिए नहीं। जून 2025 से अम्मा वोडी की जगह।" },
    benefit: { en: "₹15,000 a year for each child in Class 1–12 — ₹13,000 goes to the mother's bank account and ₹2,000 is kept for school toilets and upkeep; usually paid around June–July.", hi: "कक्षा 1–12 के हर बच्चे के लिए ₹15,000 सालाना — ₹13,000 माता के बैंक खाते में और ₹2,000 स्कूल के शौचालय व रखरखाव के लिए; आमतौर पर जून–जुलाई के आसपास।" },
    tag:     { en: "Education / Mothers", hi: "शिक्षा / माताएं" },
    benefitKind: "yearly",
    annual: 13000,
    apply:   { en: "https://gsws-nbm.ap.gov.in", hi: "अपने आप — स्थिति: gsws-nbm.ap.gov.in / ग्राम या वार्ड सचिवालय, स्कूल प्रधानाध्यापक" }, applyType: "offline",
    docs:    { en: ["Aadhaar of mother / guardian and child", "Rice card", "Mother's Aadhaar-seeded (NPCI-mapped) bank account", "Child's school enrolment details", "Mobile number linked to Aadhaar"],
               hi: ["माता / अभिभावक और बच्चे का आधार", "राइस कार्ड", "माता का आधार-सीडेड (NPCI मैप्ड) बैंक खाता", "बच्चे के स्कूल नामांकन का विवरण", "आधार से जुड़ा मोबाइल नंबर"] },
    eligibilityText: { en: ["Mothers / guardians in Andhra Pradesh with children in Class 1–12 (government, aided or private school, or junior college) with 75%+ attendance", "Family has a rice card; income up to ₹10,000 a month (village) or ₹12,000 (town); land, four-wheeler and government-job limits apply", "No form — eligible families are picked from state records; check the list at your secretariat"],
                       hi: ["आंध्र प्रदेश की माताएं / अभिभावक जिनके बच्चे कक्षा 1–12 (सरकारी, सहायता प्राप्त या निजी स्कूल, या जूनियर कॉलेज) में 75%+ उपस्थिति के साथ पढ़ते हैं", "परिवार के पास राइस कार्ड; आय ₹10,000 महीना (गांव) या ₹12,000 (शहर) तक; ज़मीन, चार-पहिया और सरकारी नौकरी की सीमाएं लागू", "कोई फॉर्म नहीं — पात्र परिवार राज्य के रिकॉर्ड से चुने जाते हैं; सूची अपने सचिवालय पर देखें"] },
    match: (a) => a.state === "Andhra Pradesh" && ["below1", "1to3"].includes(a.income) && ((a.who === "women" && ["18to35", "35to60"].includes(a.age)) || (a.who === "student" && (!a.educationLevel || ["class1to8", "class9to12"].includes(a.educationLevel)))),
  },

  {
    id: "ap_auto_driver_sevalo",
    icon: "🛺", color: "#EAB308", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Transport Dept.", hi: "AP परिवहन विभाग" },
    name:    { en: "Auto Driver Sevalo — ₹15,000 for Auto & Cab Drivers (Andhra Pradesh)", hi: "ऑटो ड्राइवर सेवलो — ऑटो व कैब चालकों को ₹15,000 (आंध्र प्रदेश)" },
    description: { en: "Yearly help for auto-rickshaw, cab and maxi-cab drivers who own their vehicle — for insurance, fitness and repairs. It replaced the old Vahana Mitra in 2025.", hi: "अपना वाहन रखने वाले ऑटो-रिक्शा, कैब और मैक्सी-कैब चालकों को सालाना मदद — बीमा, फिटनेस और मरम्मत के लिए। 2025 में पुरानी वाहन मित्र योजना की जगह।" },
    benefit: { en: "₹15,000 a year straight to the bank account of owner-drivers of passenger autos, cabs and maxi cabs registered in Andhra Pradesh (first paid October 2025).", hi: "आंध्र प्रदेश में पंजीकृत यात्री ऑटो, कैब और मैक्सी कैब के मालिक-चालकों के बैंक खाते में ₹15,000 सालाना (पहली बार अक्टूबर 2025 में)।" },
    tag:     { en: "Drivers / Livelihood", hi: "चालक / आजीविका" },
    annual: 15000,
    apply:   { en: "https://gsws-nbm.ap.gov.in", hi: "ग्राम / वार्ड सचिवालय (आवेदन खुलने पर) / स्थिति: gsws-nbm.ap.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "White rice card", "Valid AP driving licence", "Vehicle RC in your name", "Fitness certificate (cabs; autos within a month)", "Bank passbook", "Proof of no pending challans"],
               hi: ["आधार कार्ड", "सफेद राइस कार्ड", "वैध AP ड्राइविंग लाइसेंस", "अपने नाम पर वाहन RC", "फिटनेस प्रमाण पत्र (कैब; ऑटो एक महीने में)", "बैंक पासबुक", "कोई बकाया चालान न होने का प्रमाण"] },
    eligibilityText: { en: ["Drivers who own a passenger auto, cab or maxi cab registered in Andhra Pradesh (goods vehicles and rented vehicles not covered); one vehicle per family", "Not an income-tax payer or government employee / pensioner; electricity use under 300 units a month; land up to 3 acres wet or 10 acres dry", "Applications open once a year at village / ward secretariats (2025 round closed 19 September)"],
                       hi: ["आंध्र प्रदेश में पंजीकृत यात्री ऑटो, कैब या मैक्सी कैब के मालिक-चालक (मालवाहक और किराए के वाहन नहीं); प्रति परिवार एक वाहन", "आयकर दाता या सरकारी कर्मचारी / पेंशनभोगी न हों; बिजली खपत 300 यूनिट महीना से कम; ज़मीन 3 एकड़ गीली या 10 एकड़ सूखी तक", "आवेदन साल में एक बार ग्राम / वार्ड सचिवालय पर खुलते हैं (2025 का दौर 19 सितंबर को बंद हुआ)"] },
    match: (a) => a.state === "Andhra Pradesh" && ["business", "general"].includes(a.who) && ["18to35", "35to60"].includes(a.age) && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "ap_stree_shakti",
    icon: "🚌", color: "#E11D48", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Transport Dept. / APSRTC", hi: "AP परिवहन विभाग / APSRTC" },
    name:    { en: "Stree Shakti — Free Bus Travel for Women (Andhra Pradesh)", hi: "स्त्री शक्ति — महिलाओं के लिए मुफ्त बस यात्रा (आंध्र प्रदेश)" },
    description: { en: "Girls, women and transgender persons living in Andhra Pradesh travel free in APSRTC ordinary and express buses inside the state, with a zero-fare ticket. Started 15 August 2025.", hi: "आंध्र प्रदेश में रहने वाली लड़कियां, महिलाएं और ट्रांसजेंडर व्यक्ति राज्य के अंदर APSRTC की साधारण और एक्सप्रेस बसों में ज़ीरो-किराया टिकट से मुफ्त यात्रा करते हैं। 15 अगस्त 2025 से शुरू।" },
    benefit: { en: "Free travel (zero-fare ticket) within Andhra Pradesh in Pallevelugu, Ultra Pallevelugu, City Ordinary, Metro Express and Express buses; not in AC, Ultra Deluxe, Super Luxury, non-stop or interstate buses.", hi: "आंध्र प्रदेश के अंदर पल्लेवेलुगु, अल्ट्रा पल्लेवेलुगु, सिटी ऑर्डिनरी, मेट्रो एक्सप्रेस और एक्सप्रेस बसों में मुफ्त यात्रा (ज़ीरो-किराया टिकट); AC, अल्ट्रा डीलक्स, सुपर लग्ज़री, नॉन-स्टॉप या अंतरराज्यीय बसों में नहीं।" },
    tag:     { en: "Women / Free Bus", hi: "महिला / मुफ्त बस" },
    benefitKind: "other",
    annual: 0,
    apply:   { en: "No registration — show an ID with an AP address to the conductor in an eligible APSRTC bus", hi: "पंजीकरण नहीं — पात्र APSRTC बस में कंडक्टर को AP पते वाला पहचान पत्र दिखाएं" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (or another ID with an Andhra Pradesh address)", "Transgender persons: any valid ID", "Nothing to submit — just show the ID while travelling"],
               hi: ["आधार कार्ड (या आंध्र प्रदेश के पते वाला कोई अन्य पहचान पत्र)", "ट्रांसजेंडर व्यक्ति: कोई भी वैध पहचान पत्र", "कुछ जमा नहीं करना — यात्रा में केवल पहचान पत्र दिखाएं"] },
    eligibilityText: { en: ["All girls, women and transgender persons who live in Andhra Pradesh — no income limit", "Only for trips inside Andhra Pradesh in the bus types listed"],
                       hi: ["आंध्र प्रदेश में रहने वाली सभी लड़कियां, महिलाएं और ट्रांसजेंडर व्यक्ति — कोई आय सीमा नहीं", "केवल आंध्र प्रदेश के अंदर, बताई गई बसों में"] },
    match: (a) => a.state === "Andhra Pradesh" && (a.gender === "female" || a.gender === "other" || (a.gender == null && a.who === "women")),
  },

  {
    id: "ap_anna_canteen",
    icon: "🍛", color: "#EA580C", scope: "state", state: "Andhra Pradesh",
    ministry: { en: "AP Municipal Administration & Urban Development Dept.", hi: "AP नगर प्रशासन एवं शहरी विकास विभाग" },
    name:    { en: "Anna Canteen — ₹5 Meals (Andhra Pradesh)", hi: "अन्ना कैंटीन — ₹5 में भोजन (आंध्र प्रदेश)" },
    description: { en: "Hygienic meals for just ₹5 at Anna Canteens in towns and cities across Andhra Pradesh — reopened in August 2024 for workers and anyone who needs a cheap meal.", hi: "आंध्र प्रदेश के कस्बों और शहरों की अन्ना कैंटीनों में सिर्फ ₹5 में साफ-सुथरा भोजन — अगस्त 2024 में मज़दूरों और सस्ते भोजन की ज़रूरत वाले हर व्यक्ति के लिए फिर खोली गईं।" },
    benefit: { en: "Meals for ₹5 a plate at 200+ Anna Canteens across Andhra Pradesh — open to everyone, no card or registration needed.", hi: "आंध्र प्रदेश की 200+ अन्ना कैंटीनों में ₹5 प्रति थाली भोजन — सभी के लिए, कोई कार्ड या पंजीकरण नहीं।" },
    tag:     { en: "Food / Subsidised Meals", hi: "भोजन / सस्ता खाना" },
    benefitKind: "other",
    annual: 0,
    apply:   { en: "Walk in to the nearest Anna Canteen (no registration)", hi: "नजदीकी अन्ना कैंटीन में जाएं (कोई पंजीकरण नहीं)" }, applyType: "offline",
    docs:    { en: ["No documents needed", "Pay ₹5 at the counter", "Ask your municipality for the nearest canteen"],
               hi: ["कोई दस्तावेज़ ज़रूरी नहीं", "काउंटर पर ₹5 दें", "नजदीकी कैंटीन के लिए अपनी नगरपालिका से पूछें"] },
    eligibilityText: { en: ["Anyone — aimed at daily-wage workers, labourers and the poor", "Canteens are mostly in towns and cities"],
                       hi: ["कोई भी — दिहाड़ी मज़दूरों, श्रमिकों और गरीबों के लिए", "कैंटीन ज़्यादातर कस्बों और शहरों में हैं"] },
    match: (a) => a.state === "Andhra Pradesh" && a.income !== "above6" && (a.area == null || ["urban", "semi"].includes(a.area)),
  },

];
