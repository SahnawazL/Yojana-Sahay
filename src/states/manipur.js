// Manipur — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "manipur_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const MANIPUR_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "manipur_cm_kisan_samman",
    icon: "🌾", color: "#15803D", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Agriculture Dept.", hi: "मणिपुर कृषि विभाग" },
    name:    { en: "Chief Minister Kisan Samman Nidhi — State Top-Up (Manipur)",
               hi: "मुख्यमंत्री किसान सम्मान निधि — राज्य टॉप-अप (मणिपुर)" },
    benefit: { en: "₹4,000/year state top-up (2 installments of ₹2,000 each — Kharif & Rabi) credited directly to bank account for small and marginal farmers registered under PM-KISAN; combined with PM-KISAN, a farmer receives up to ₹10,000/year; covers landholding farmers of Manipur valley and hill districts",
               hi: "PM-KISAN में पंजीकृत छोटे व सीमांत किसानों को ₹4,000/वर्ष राज्य टॉप-अप (खरीफ व रबी में ₹2,000–₹2,000 किस्त) सीधे बैंक खाते में; PM-KISAN के साथ मिलाकर किसान को ₹10,000/वर्ष तक; मणिपुर के घाटी व पहाड़ी जिलों के भूमिधारक किसानों के लिए" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 4000,
    apply:   { en: "https://pmkisan.gov.in/Rpt_BeneficiaryStatus_pub.aspx", hi: "agri.manipur.gov.in / निकटतम ब्लॉक कृषि अधिकारी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Patta (RoR)", "PM-KISAN Registration Number", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / पट्टा (RoR)", "PM-KISAN पंजीकरण संख्या", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && (a.who === "farmer" || ["below1","1to3"].includes(a.income)),
  },

  {
    id: "manipur_organic_mission",
    icon: "🌿", color: "#D97706", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Agriculture Dept. / Manipur Organic Mission Agency (MOMA)", hi: "मणिपुर कृषि विभाग / मणिपुर जैविक मिशन एजेंसी (MOMA)" },
    name:    { en: "Manipur Organic Mission (MOM) — Farmer Support",
               hi: "मणिपुर ऑर्गेनिक मिशन (MOM) — किसान सहायता" },
    benefit: { en: "Free organic input kits (bio-fertiliser, vermicompost, bio-pesticides) worth ₹3,000–₹5,000 per acre per season for certified or transitioning organic farmers; financial assistance up to ₹10,000/year per farmer for organic certification costs; training and cluster-based farmer producer group support; aims to make Manipur a fully organic state by 2025",
               hi: "प्रमाणित या जैविक खेती में स्थानांतरित हो रहे किसानों को ₹3,000–₹5,000 प्रति एकड़ प्रति सीजन मूल्य के जैविक इनपुट किट (जैव-उर्वरक, वर्मीकम्पोस्ट, जैव-कीटनाशक) निःशुल्क; जैविक प्रमाणन लागत के लिए ₹10,000/वर्ष तक सहायता; प्रशिक्षण और क्लस्टर-आधारित किसान उत्पादक समूह; 2025 तक मणिपुर को पूर्णतः जैविक राज्य बनाने का लक्ष्य" },
    tag:     { en: "Farmer / Organic / Input Subsidy", hi: "किसान / जैविक / इनपुट सब्सिडी" },
    annual: 10000,
    apply:   { en: "agri.manipur.gov.in / MOMA District Office (offline)", hi: "agri.manipur.gov.in / MOMA जिला कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Patta", "Farmer Registration Certificate", "Organic Certification (if already certified) or Intent to transition letter", "Bank Account (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / पट्टा", "किसान पंजीकरण प्रमाण पत्र", "जैविक प्रमाणन (यदि पहले से प्रमाणित) या स्थानांतरण आशय पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "manipur_ima_keithel_support",
    icon: "🛒", color: "#BE185D", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Commerce & Industries Dept.", hi: "मणिपुर वाणिज्य एवं उद्योग विभाग" },
    name:    { en: "Ima Keithel Vendor Support Scheme (Manipur)",
               hi: "इमा कैथेल विक्रेता सहायता योजना (मणिपुर)" },
    benefit: { en: "Financial and infrastructure support for women vendors of the historic all-women Ima Keithel (Mothers' Market) in Imphal — one of Asia's largest all-women markets; includes stall renovation grants up to ₹25,000, working capital loans up to ₹50,000 at 4% interest through state cooperative banks, and free skill-upgrade workshops on digital payments, inventory, and market linkage; priority to BPL/EWS women vendors",
               hi: "इम्फाल के ऐतिहासिक इमा कैथेल (माताओं के बाजार) — एशिया के सबसे बड़े महिला बाजारों में से एक — की महिला विक्रेताओं को वित्तीय एवं बुनियादी ढांचा सहायता; स्टॉल नवीकरण अनुदान ₹25,000 तक, राज्य सहकारी बैंकों के माध्यम से 4% ब्याज पर ₹50,000 तक कार्यशील पूंजी ऋण, डिजिटल भुगतान, इन्वेंटरी और बाजार संपर्क पर निःशुल्क कौशल-उन्नयन कार्यशाला; BPL/EWS महिला विक्रेताओं को प्राथमिकता" },
    tag:     { en: "Women / Entrepreneurship / Market", hi: "महिला / उद्यमिता / बाजार" },
    annual: 25000,
    apply:   { en: "Manipur Commerce & Industries Dept. / Ima Keithel Management Committee (offline)", hi: "मणिपुर वाणिज्य एवं उद्योग विभाग / इमा कैथेल प्रबंधन समिति (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ima Keithel Vendor Registration / Stall Allotment Certificate", "Income Certificate / BPL Card", "Bank Account (Aadhaar-linked)", "Residence Proof (Manipur)", "Passport Photo"],
               hi: ["आधार कार्ड", "इमा कैथेल विक्रेता पंजीकरण / स्टॉल आवंटन प्रमाण पत्र", "आय प्रमाण पत्र / BPL कार्ड", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मणिपुर)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && a.who === "women",
  },

  {
    id: "manipur_sangai_mahila_shg",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Manipur",
    ministry: { en: "Manipur State Rural Livelihoods Mission (MSRLM) / Rural Development Dept.", hi: "मणिपुर राज्य ग्रामीण आजीविका मिशन (MSRLM) / ग्रामीण विकास विभाग" },
    name:    { en: "Manipur State Rural Livelihoods Mission — SHG Support (Manipur)",
               hi: "मणिपुर राज्य ग्रामीण आजीविका मिशन — SHG सहायता (मणिपुर)" },
    benefit: { en: "Revolving fund of ₹15,000 per SHG + Community Investment Fund of up to ₹2.5 lakh for women's Self-Help Groups; interest-free or subsidised loans up to ₹5 lakh per SHG for income-generating activities — handloom, food processing, bamboo products, tailoring; skill training through DDU-GKY; market linkage via state craft fairs and e-commerce platforms",
               hi: "महिला स्वयं सहायता समूहों के लिए ₹15,000 रिवॉल्विंग फंड + ₹2.5 लाख तक सामुदायिक निवेश निधि; आय-सृजन गतिविधियों — हथकरघा, खाद्य प्रसंस्करण, बांस उत्पाद, सिलाई — के लिए ₹5 लाख तक ब्याज-मुक्त या सब्सिडी ऋण; DDU-GKY के माध्यम से कौशल प्रशिक्षण; राज्य शिल्प मेलों और ई-कॉमर्स प्लेटफॉर्म से बाजार संपर्क" },
    tag:     { en: "Women / SHG / Rural Livelihood", hi: "महिला / SHG / ग्रामीण आजीविका" },
    annual: 0,
    apply:   { en: "msrlm.manipur.gov.in / Block MSRLM office (offline)", hi: "msrlm.manipur.gov.in / ब्लॉक MSRLM कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Registration Certificate / SHG Passbook", "SHG Bank Account (joint account, Aadhaar-linked)", "Residence Proof (Manipur)", "Meeting minutes showing SHG activity for 6+ months", "Passport Photo"],
               hi: ["आधार कार्ड", "SHG पंजीकरण प्रमाण पत्र / SHG पासबुक", "SHG बैंक खाता (संयुक्त खाता, आधार-लिंक्ड)", "निवास प्रमाण (मणिपुर)", "6+ महीने की SHG गतिविधि दर्शाने वाले बैठक कार्यवृत्त", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && a.who === "women",
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "manipur_cm_health_insurance",
    icon: "🏥", color: "#DC2626", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Health & Family Welfare Dept.", hi: "मणिपुर स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Chief Minister's Health for All Scheme (Manipur)",
               hi: "मुख्यमंत्री स्वास्थ्य सबके लिए योजना (मणिपुर)" },
    benefit: { en: "Cashless health insurance cover of ₹5 lakh/family/year at empanelled government and private hospitals; covers BPL and low-income families of Manipur including hill districts; supplements Ayushman Bharat PM-JAY for state-specific beneficiaries; includes pre- and post-hospitalisation, day-care procedures, and maternity; State Health Card issued for cashless access",
               hi: "BPL और कम आय वाले मणिपुर परिवारों (पहाड़ी जिलों सहित) को सूचीबद्ध सरकारी व निजी अस्पतालों में ₹5 लाख/परिवार/वर्ष नकद-रहित स्वास्थ्य बीमा; राज्य-विशिष्ट लाभार्थियों के लिए आयुष्मान भारत PM-JAY का पूरक; अस्पताल भर्ती से पहले व बाद, डे-केयर प्रक्रिया और प्रसूति शामिल; नकद-रहित पहुंच के लिए राज्य स्वास्थ्य कार्ड जारी" },
    tag:     { en: "Health / Insurance / BPL", hi: "स्वास्थ्य / बीमा / BPL" },
    annual: 500000,
    apply:   { en: "https://churachandpur.nic.in/scheme-category/cm-schemes", hi: "health.manipur.gov.in / सूचीबद्ध अस्पताल में निकटतम आयुष्मान मित्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "NFSA / BPL Ration Card", "State Health Card (if issued)", "Residence Proof (Manipur)", "Family composition certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "NFSA / BPL राशन कार्ड", "राज्य स्वास्थ्य कार्ड (यदि जारी हो)", "निवास प्रमाण (मणिपुर)", "परिवार संरचना प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "manipur_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Education (Higher & Technical) Dept.", hi: "मणिपुर शिक्षा (उच्च एवं तकनीकी) विभाग" },
    name:    { en: "Chief Minister's Scholarship Scheme (Manipur)",
               hi: "मुख्यमंत्री छात्रवृत्ति योजना (मणिपुर)" },
    benefit: { en: "Annual scholarship of ₹10,000–₹25,000 for meritorious students from BPL/EWS and SC/ST/OBC families scoring 60%+ in Class 10 or 12 board exams — ₹10,000/year for Class 11–12; ₹15,000/year for UG; ₹25,000/year for PG / professional courses; paid via DBT to student's Aadhaar-linked bank account; fresh + renewal basis each academic year",
               hi: "BPL/EWS और SC/ST/OBC परिवार के कक्षा 10 या 12 में 60%+ अंक लाने वाले मेधावी छात्रों को ₹10,000–₹25,000 वार्षिक छात्रवृत्ति — कक्षा 11–12 के लिए ₹10,000/वर्ष; UG के लिए ₹15,000/वर्ष; PG / व्यावसायिक पाठ्यक्रम के लिए ₹25,000/वर्ष; DBT से छात्र के आधार-लिंक्ड बैंक खाते में; प्रत्येक शैक्षणिक वर्ष में नया + नवीनीकरण" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 25000,
    apply:   { en: "https://highereducationmanipur.gov.in/scholarship", hi: "scholarships.manipur.gov.in / स्कूल या कॉलेज कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 10 / 12 Marksheet (BSEM / COHSEM)", "Income Certificate (family income below threshold)", "Caste Certificate (SC/ST/OBC if applicable)", "Admission / Enrollment Certificate from current institution", "Bank Account (Aadhaar-linked, student's name)", "Residence Proof (Manipur)", "Passport Photo"],
               hi: ["आधार कार्ड", "कक्षा 10 / 12 अंकसूची (BSEM / COHSEM)", "आय प्रमाण पत्र (पारिवारिक आय सीमा से कम)", "जाति प्रमाण पत्र (SC/ST/OBC यदि लागू हो)", "वर्तमान संस्थान से प्रवेश / नामांकन प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास प्रमाण (मणिपुर)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && a.who === "student",
  },

  {
    id: "manipur_free_coaching",
    icon: "📚", color: "#0369A1", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Social Welfare Dept. / SC & OBC Development Dept.", hi: "मणिपुर समाज कल्याण विभाग / SC और OBC विकास विभाग" },
    name:    { en: "Free Coaching for Competitive Exams — SC/ST/OBC/Minority (Manipur)",
               hi: "प्रतियोगी परीक्षाओं के लिए निःशुल्क कोचिंग — SC/ST/OBC/अल्पसंख्यक (मणिपुर)" },
    benefit: { en: "Free coaching for UPSC, SSC, Banking, NDA, and state PSC exams for SC/ST/OBC/Minority students; stipend of ₹1,500–₹2,500/month during coaching period; free study material and mock tests; residential facility for outstation students at select centres in Imphal; family income must be below ₹8 lakh/year",
               hi: "SC/ST/OBC/अल्पसंख्यक छात्रों के लिए UPSC, SSC, बैंकिंग, NDA और राज्य PSC परीक्षाओं की निःशुल्क कोचिंग; कोचिंग अवधि के दौरान ₹1,500–₹2,500/माह वजीफा; निःशुल्क अध्ययन सामग्री और मॉक टेस्ट; इंफाल के चुनिंदा केंद्रों पर बाहरी छात्रों के लिए आवासीय सुविधा; पारिवारिक आय ₹8 लाख/वर्ष से कम होनी चाहिए" },
    tag:     { en: "Student / Competitive Exam / Coaching", hi: "छात्र / प्रतियोगी परीक्षा / कोचिंग" },
    annual: 30000,
    apply:   { en: "socialwelfare.manipur.gov.in / Directorate of SC & OBC Development (offline)", hi: "socialwelfare.manipur.gov.in / SC और OBC विकास निदेशालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/OBC/Minority)", "Class 12 Marksheet / Graduation Certificate", "Income Certificate (family income < ₹8 lakh/year)", "Residence Proof (Manipur)", "Bank Account (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/OBC/अल्पसंख्यक)", "कक्षा 12 अंकसूची / स्नातक प्रमाण पत्र", "आय प्रमाण पत्र (पारिवारिक आय < ₹8 लाख/वर्ष)", "निवास प्रमाण (मणिपुर)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && a.who === "student" && (a.caste === "ST" || a.caste === "SC" || a.caste === "OBC"),
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "manipur_social_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Social Welfare Dept.", hi: "मणिपुर समाज कल्याण विभाग" },
    name:    { en: "Manipur State Social Security Pension Scheme",
               hi: "मणिपुर राज्य सामाजिक सुरक्षा पेंशन योजना" },
    benefit: { en: "Monthly pension combining NSAP central share and state top-up — Elderly (60–79 years): ₹1,000/month; Elderly (80+ years): ₹1,500/month; Widows (40–59 years): ₹1,000/month; Persons with Disability (40%+): ₹1,000/month; Destitute women: ₹1,000/month; paid directly to Aadhaar-linked bank account; no application fee",
               hi: "NSAP केंद्रीय अंश + राज्य टॉप-अप मिलाकर मासिक पेंशन — वृद्ध (60–79 वर्ष): ₹1,000/माह; वृद्ध (80+ वर्ष): ₹1,500/माह; विधवाएं (40–59 वर्ष): ₹1,000/माह; दिव्यांगजन (40%+): ₹1,000/माह; निराश्रित महिलाएं: ₹1,000/माह; आधार-लिंक्ड बैंक खाते में सीधे; कोई आवेदन शुल्क नहीं" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 18000,
    apply:   { en: "socialwelfare.manipur.gov.in / SDO or BDO office (offline)", hi: "socialwelfare.manipur.gov.in / SDO या BDO कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, from Medical Board) — for disabled", "BPL Ration Card / Income Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Manipur)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "BPL राशन कार्ड / आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मणिपुर)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "manipur_cm_awas_gramin",
    icon: "🏠", color: "#B45309", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Rural Development & Panchayati Raj Dept.", hi: "मणिपुर ग्रामीण विकास एवं पंचायती राज विभाग" },
    name:    { en: "Chief Minister's Awas Yojana — Rural (Manipur)",
               hi: "मुख्यमंत्री आवास योजना — ग्रामीण (मणिपुर)" },
    benefit: { en: "₹1.30 lakh financial assistance for construction of pucca house in hill districts; ₹1.20 lakh in valley districts — for rural BPL/houseless families; paid in 3 installments — at foundation, lintel, and roof completion stage; complements PMAY-Gramin; must include functional toilet; SC/ST, widows, disabled, and landless beneficiaries given priority; 90 days of unskilled labour from MGNREGS provided additionally",
               hi: "पहाड़ी जिलों में पक्के मकान निर्माण के लिए ₹1.30 लाख; घाटी जिलों में ₹1.20 लाख — ग्रामीण BPL/बेघर परिवारों के लिए; 3 किस्तों में — नींव, लिंटेल और छत पूर्णता पर; PMAY-ग्रामीण का पूरक; कार्यात्मक शौचालय अनिवार्य; SC/ST, विधवाएं, दिव्यांग और भूमिहीन लाभार्थियों को प्राथमिकता; MGNREGS से 90 दिन का अकुशल श्रम अतिरिक्त" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 130000,
    apply:   { en: "Gram Panchayat office / BDO office (offline)", hi: "ग्राम पंचायत कार्यालय / BDO कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card / Houseless Certificate", "Land Ownership / Patta document", "Bank Account (Aadhaar-linked)", "Residence Proof (Manipur rural)", "Passport Photo", "Caste Certificate (SC/ST for priority)", "Disability Certificate (if applicable)"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड / बेघर प्रमाण पत्र", "भूमि स्वामित्व / पट्टा दस्तावेज़", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मणिपुर ग्रामीण)", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST प्राथमिकता के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Manipur" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── TRIBAL WELFARE ────────────────────────────────────────────────────────

  {
    id: "manipur_hill_tribal_welfare",
    icon: "🏔️", color: "#0F766E", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Hill Areas Dept. / Tribal Affairs & Hills Dept.", hi: "मणिपुर पहाड़ी क्षेत्र विभाग / जनजातीय मामले एवं पहाड़ी विभाग" },
    name:    { en: "Hill Areas Tribal Welfare & Development Schemes (Manipur)",
               hi: "पहाड़ी क्षेत्र जनजातीय कल्याण एवं विकास योजनाएं (मणिपुर)" },
    benefit: { en: "Package of welfare benefits for ST communities in Manipur hill districts — free textbooks and uniforms for tribal students (Class 1–12), hostel scholarships of ₹2,500–₹3,500/month for residential school students, livelihood grants of ₹10,000–₹20,000 for traditional craft-based self-employment (weaving, bamboo, pottery), and health camps in remote villages; administered through Hill Area Committees (HAC)",
               hi: "मणिपुर के पहाड़ी जिलों में ST समुदायों के लिए कल्याण लाभों का पैकेज — जनजातीय छात्रों (कक्षा 1–12) के लिए निःशुल्क पाठ्यपुस्तक व वर्दी, आवासीय विद्यालय छात्रों के लिए ₹2,500–₹3,500/माह छात्रावास छात्रवृत्ति, पारंपरिक शिल्प-आधारित स्वरोजगार (बुनाई, बांस, मिट्टी के बर्तन) के लिए ₹10,000–₹20,000 आजीविका अनुदान, और दूरदराज गांवों में स्वास्थ्य शिविर; पहाड़ी क्षेत्र समितियों (HAC) द्वारा प्रशासित" },
    tag:     { en: "Tribal / ST / Hill Areas / Welfare", hi: "जनजातीय / ST / पहाड़ी क्षेत्र / कल्याण" },
    annual: 20000,
    apply:   { en: "hillareas.manipur.gov.in / nearest Sub-Divisional Office in hill district", hi: "hillareas.manipur.gov.in / पहाड़ी जिले में निकटतम उपमंडल कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST Certificate issued by Manipur Govt.", "Residence Proof within hill district", "Income Certificate / BPL Card", "Bank Account (Aadhaar-linked)", "For students: School Enrollment Certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "मणिपुर सरकार द्वारा जारी ST प्रमाण पत्र", "पहाड़ी जिले के अंदर निवास प्रमाण", "आय प्रमाण पत्र / BPL कार्ड", "बैंक खाता (आधार-लिंक्ड)", "छात्रों के लिए: विद्यालय नामांकन प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && (a.caste === "ST" || a.caste === "SC"),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "manipur_startup_manipur",
    icon: "🚀", color: "#1D4ED8", scope: "state", state: "Manipur",
    ministry: { en: "Manipur Industries & Commerce Dept. / MANPRAC", hi: "मणिपुर उद्योग एवं वाणिज्य विभाग / MANPRAC" },
    name:    { en: "Start-Up Manipur Scheme",
               hi: "स्टार्ट-अप मणिपुर योजना" },
    benefit: { en: "Seed funding of ₹2 lakh–₹10 lakh as equity grant for first-generation entrepreneurs (18–40 years) in technology, food processing, handicrafts, and services sectors; 30% capital subsidy on project cost (max ₹3 lakh); free incubation space, mentoring, and legal / IPR support through MANPRAC and empanelled incubators; women and ST/SC entrepreneurs get additional 5% subsidy; must be resident of Manipur",
               hi: "प्रौद्योगिकी, खाद्य प्रसंस्करण, हस्तशिल्प और सेवा क्षेत्रों में प्रथम पीढ़ी के उद्यमियों (18–40 वर्ष) के लिए ₹2 लाख–₹10 लाख बीज वित्त पोषण इक्विटी अनुदान; परियोजना लागत पर 30% पूंजी सब्सिडी (अधिकतम ₹3 लाख); MANPRAC और अनुमोदित इनक्यूबेटरों के माध्यम से निःशुल्क इनक्यूबेशन स्थान, मेंटरिंग और कानूनी/IPR सहायता; महिला और ST/SC उद्यमियों को अतिरिक्त 5% सब्सिडी; मणिपुर का निवासी होना अनिवार्य" },
    tag:     { en: "Youth / Start-Up / Entrepreneur", hi: "युवा / स्टार्ट-अप / उद्यमी" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/strtupmpr", hi: "startup.manipur.gov.in / जिला उद्योग केंद्र (DIC)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof", "Educational Qualification Certificate", "Business Plan / Project Report", "Residence Proof (Manipur)", "Bank Account (Aadhaar-linked)", "Caste Certificate (ST/SC/OBC for additional subsidy)", "Passport Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण", "शैक्षिक योग्यता प्रमाण पत्र", "व्यवसाय योजना / परियोजना रिपोर्ट", "निवास प्रमाण (मणिपुर)", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (ST/SC/OBC अतिरिक्त सब्सिडी के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Manipur" && (a.who === "unemployed" || a.who === "youth") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE MANIPUR SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "manipur_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Manipur",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Manipur",
  // },

];
