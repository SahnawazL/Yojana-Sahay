// Uttarakhand — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "uttarakhand_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const UTTARAKHAND_SCHEMES = [

  {
    id: "uk_vatsalya",
    icon: "👶", color: "#BE185D", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Women Empowerment & Child Dev.", hi: "उत्तराखंड महिला सशक्तिकरण एवं बाल विकास" },
    name:    { en: "Mukhyamantri Vatsalya Yojana (Uttarakhand)",      hi: "मुख्यमंत्री वात्सल्य योजना (उत्तराखंड)" },
    benefit: { en: "₹3,000/month + free education & healthcare for children orphaned by COVID/any cause", hi: "COVID/किसी कारण से अनाथ बच्चों को ₹3,000/माह + मुफ्त शिक्षा व स्वास्थ्य" },
    tag:     { en: "Child / Women", hi: "बच्चे / महिला" },
    annual: 36000,
    apply:   { en: "wecd.uk.gov.in", hi: "wecd.uk.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Parents' Death Certificate","Child's Birth Certificate","Guardian ID","Bank Account"],
               hi: ["आधार कार्ड","माता-पिता का मृत्यु प्रमाण","बच्चे का जन्म प्रमाण","अभिभावक पहचान पत्र","बैंक खाता"] },
    match: (a) => a.state === "Uttarakhand" && ["below1","1to3"].includes(a.income),
  },

  // ── WOMEN / GIRL CHILD ────────────────────────────────────────────────────

  {
    id: "uk_nanda_gaura",
    icon: "👧", color: "#DB2777", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Women Empowerment & Child Dev. Dept.", hi: "उत्तराखंड महिला सशक्तिकरण एवं बाल विकास विभाग" },
    name:    { en: "Nanda Gaura Devi Kanya Dhan Yojana (Uttarakhand)",
               hi: "नंदा गौरा देवी कन्या धन योजना (उत्तराखंड)" },
    benefit: { en: "₹51,000 one-time grant deposited as FD in the girl child's name on passing Class 12 from a government/aided school in Uttarakhand; for SC/ST/OBC/EWS/BPL families with annual income ≤ ₹72,000 (rural) / ≤ ₹96,000 (urban); girl must be unmarried and aged ≤ 25 at the time of application; amount released on reaching age 18",
               hi: "उत्तराखंड के सरकारी/सहायता प्राप्त विद्यालय से कक्षा 12 उत्तीर्ण करने पर बालिका के नाम ₹51,000 एकमुश्त FD; SC/ST/OBC/EWS/BPL परिवार जिनकी वार्षिक आय ₹72,000 (ग्रामीण) / ₹96,000 (शहरी) तक; आवेदन के समय बालिका अविवाहित व आयु ≤ 25 वर्ष; 18 वर्ष होने पर राशि जारी" },
    tag:     { en: "Women / Girl Child / Education", hi: "महिला / बालिका / शिक्षा" },
    annual: 0,
    apply:   { en: "escholarship.uk.gov.in / school principal's office", hi: "escholarship.uk.gov.in / विद्यालय प्राचार्य कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (girl and parent)", "Class 12 Marksheet (govt./aided school)", "Income Certificate (≤ ₹72,000 rural / ≤ ₹96,000 urban)", "Caste Certificate (SC/ST/OBC) or BPL/EWS certificate", "Uttarakhand Domicile Certificate", "Bank Account (girl's name, Aadhaar-linked)", "Unmarried Status Certificate", "Passport Photo"],
               hi: ["आधार कार्ड (बालिका व अभिभावक)", "कक्षा 12 अंकसूची (सरकारी/सहायता प्राप्त विद्यालय)", "आय प्रमाण पत्र (ग्रामीण ₹72,000 / शहरी ₹96,000 तक)", "जाति प्रमाण पत्र (SC/ST/OBC) या BPL/EWS प्रमाण पत्र", "उत्तराखंड डोमिसाइल प्रमाण पत्र", "बैंक खाता (बालिका के नाम, आधार-लिंक्ड)", "अविवाहित स्थिति प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttarakhand" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "uk_old_age_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Social Welfare", hi: "उत्तराखंड समाज कल्याण विभाग" },
    name:    { en: "Uttarakhand Social Pension Scheme — Old Age / Widow / Disabled",
               hi: "उत्तराखंड सामाजिक पेंशन योजना — वृद्धावस्था / विधवा / दिव्यांग" },
    benefit: { en: "Monthly pension paid directly to bank account — Old Age (60+ years): ₹1,200/month; Widow/Destitute Women: ₹1,200/month; Differently-abled (40%+): ₹1,200/month; beneficiaries above 80 years receive ₹1,500/month; combined with central IGNOAPS/IGNDPS/IGNWPS where eligible; ~23 lakh beneficiaries in Uttarakhand",
               hi: "सीधे बैंक खाते में मासिक पेंशन — वृद्धावस्था (60+ वर्ष): ₹1,200/माह; विधवा/निराश्रित महिला: ₹1,200/माह; दिव्यांगजन (40%+): ₹1,200/माह; 80 वर्ष से अधिक को ₹1,500/माह; पात्र होने पर केंद्रीय IGNOAPS/IGNDPS/IGNWPS के साथ संयुक्त; उत्तराखंड में ~23 लाख लाभार्थी" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 14400,
    apply:   { en: "ssp.uk.gov.in / BDO or Tehsil office (offline)", hi: "ssp.uk.gov.in / BDO या तहसील कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID) — for elderly", "Husband's Death Certificate + Marriage Certificate — for widows", "Disability Certificate (40%+, from Chief Medical Officer) — for disabled", "Uttarakhand Domicile / Residence Proof", "BPL Ration Card (if applicable)", "Bank Account (Aadhaar-linked)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, मुख्य चिकित्सा अधिकारी से) — दिव्यांग के लिए", "उत्तराखंड डोमिसाइल / निवास प्रमाण", "BPL राशन कार्ड (यदि लागू)", "बैंक खाता (आधार-लिंक्ड)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttarakhand" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "uk_atal_ayushman",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Health & Family Welfare", hi: "उत्तराखंड स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Atal Ayushman Uttarakhand Yojana — AAUY",
               hi: "अटल आयुष्मान उत्तराखंड योजना — AAUY" },
    benefit: { en: "₹5 lakh per family per year cashless treatment at government and empanelled private hospitals for all Uttarakhand domicile families; covers all residents including those not covered under PM-AYAN / PMJAY; Golden Card issued; 1,500+ treatment packages covered including cancer, heart surgery, kidney transplant, orthopaedics; no income ceiling — universal coverage for Uttarakhand residents",
               hi: "सभी उत्तराखंड डोमिसाइल परिवारों को सरकारी और सूचीबद्ध निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख कैशलेस उपचार; PM-AYAN/PMJAY में शामिल न होने वाले सभी निवासी भी पात्र; गोल्डन कार्ड जारी; कैंसर, हृदय शल्य चिकित्सा, किडनी प्रत्यारोपण, अस्थि रोग सहित 1,500+ उपचार पैकेज; कोई आय सीमा नहीं — उत्तराखंड निवासियों के लिए सार्वभौमिक कवरेज" },
    tag:     { en: "Health / Cashless Treatment / Universal", hi: "स्वास्थ्य / कैशलेस उपचार / सार्वभौमिक" },
    annual: 500000,
    apply:   { en: "ayushmanuttarakhand.org / nearest govt. hospital / CSC (Common Service Centre)", hi: "ayushmanuttarakhand.org / निकटतम सरकारी अस्पताल / CSC (कॉमन सर्विस सेंटर)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (all family members)", "Uttarakhand Domicile / Residence Proof (Ration Card / Voter ID)", "Family Register copy (Pariwar Register)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड (सभी परिवार के सदस्य)", "उत्तराखंड डोमिसाइल / निवास प्रमाण (राशन कार्ड / मतदाता ID)", "परिवार रजिस्टर की नकल", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Uttarakhand",
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "uk_medhavi_chhatravriti",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Higher Education", hi: "उत्तराखंड उच्च शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Medhavi Chhatravriti Yojana (Uttarakhand)",
               hi: "मुख्यमंत्री मेधावी छात्रवृत्ति योजना (उत्तराखंड)" },
    benefit: { en: "Merit scholarship for students scoring 70%+ in Class 10 (Uttarakhand Board) — ₹600/month for Class 11–12 students; ₹1,000–₹2,000/month for undergraduate students; ₹2,500/month for postgraduate students; paid directly to bank account for academic year duration; open to all categories with family income ≤ ₹6 lakh",
               hi: "उत्तराखंड बोर्ड की कक्षा 10 में 70%+ अंक लाने वाले छात्रों के लिए मेरिट छात्रवृत्ति — कक्षा 11–12: ₹600/माह; स्नातक: ₹1,000–₹2,000/माह; स्नातकोत्तर: ₹2,500/माह; पूरे शैक्षणिक वर्ष सीधे बैंक खाते में; सभी वर्गों के लिए, पारिवारिक आय ₹6 लाख तक" },
    tag:     { en: "Student / Merit Scholarship", hi: "छात्र / मेरिट छात्रवृत्ति" },
    annual: 24000,
    apply:   { en: "https://he.uk.gov.in/scholarship-portal", hi: "escholarship.uk.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 10 Marksheet (Uttarakhand Board, 70%+)", "Income Certificate (family ≤ ₹6 lakh)", "Uttarakhand Domicile Certificate", "Current Admission / College ID", "Bank Account (student's, Aadhaar-linked)", "Caste Certificate (if SC/ST/OBC)", "Passport Photo", "Mobile Number & Email"],
               hi: ["आधार कार्ड", "कक्षा 10 अंकसूची (उत्तराखंड बोर्ड, 70%+)", "आय प्रमाण पत्र (परिवार ₹6 लाख तक)", "उत्तराखंड डोमिसाइल प्रमाण पत्र", "वर्तमान प्रवेश / कॉलेज ID", "बैंक खाता (छात्र का, आधार-लिंक्ड)", "जाति प्रमाण पत्र (SC/ST/OBC के लिए)", "पासपोर्ट फोटो", "मोबाइल नंबर व ईमेल"] },
    match: (a) => a.state === "Uttarakhand" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "uk_post_matric_scholarship",
    icon: "📚", color: "#1D4ED8", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Social Welfare / Tribal Welfare", hi: "उत्तराखंड समाज कल्याण / जनजातीय कल्याण विभाग" },
    name:    { en: "Post-Matric Scholarship — SC/ST/OBC (Uttarakhand)",
               hi: "पोस्ट-मैट्रिक छात्रवृत्ति — SC/ST/OBC (उत्तराखंड)" },
    benefit: { en: "Full tuition fee reimbursement + maintenance allowance for SC/ST/OBC students pursuing Class 11 and above (including professional courses — Engineering, Medical, Law, MBA) in Uttarakhand; maintenance allowance ₹300–₹1,200/month based on course level and hosteller/day scholar status; funded jointly by central and state governments",
               hi: "उत्तराखंड में SC/ST/OBC छात्रों को कक्षा 11 और उससे ऊपर (इंजीनियरिंग, चिकित्सा, कानून, MBA सहित) की पूर्ण ट्यूशन फीस प्रतिपूर्ति + रखरखाव भत्ता; पाठ्यक्रम स्तर व हॉस्टलर/दिन-विद्वान के अनुसार ₹300–₹1,200/माह; केंद्र व राज्य सरकार द्वारा संयुक्त वित्त पोषण" },
    tag:     { en: "Student / SC-ST-OBC / Scholarship", hi: "छात्र / SC-ST-OBC / छात्रवृत्ति" },
    annual: 14400,
    apply:   { en: "scholarships.gov.in (National Scholarship Portal)", hi: "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/OBC — issued by Uttarakhand govt.)", "Income Certificate (OBC: ≤ ₹2.5 lakh / SC/ST: ≤ ₹6 lakh)", "Class 10 Marksheet", "Current Course Admission Proof / Fee Receipt", "Bank Account (student's, Aadhaar-linked)", "Uttarakhand Domicile Certificate", "Passport Photo", "Mobile Number & Email"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/OBC — उत्तराखंड सरकार द्वारा जारी)", "आय प्रमाण पत्र (OBC: ₹2.5 लाख तक / SC/ST: ₹6 लाख तक)", "कक्षा 10 अंकसूची", "वर्तमान पाठ्यक्रम प्रवेश प्रमाण / फीस रसीद", "बैंक खाता (छात्र का, आधार-लिंक्ड)", "उत्तराखंड डोमिसाइल प्रमाण पत्र", "पासपोर्ट फोटो", "मोबाइल नंबर व ईमेल"] },
    match: (a) => a.state === "Uttarakhand" && a.who === "student" && ["sc","st","obc"].includes(a.caste),
  },

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "uk_parvatiya_krishi",
    icon: "🌾", color: "#15803D", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Agriculture / Horticulture", hi: "उत्तराखंड कृषि / उद्यान विभाग" },
    name:    { en: "Parvatiya Krishi Unnati Yojana — Hill Farming Support (Uttarakhand)",
               hi: "पर्वतीय कृषि उन्नति योजना — हिल फार्मिंग सपोर्ट (उत्तराखंड)" },
    benefit: { en: "Up to 75% subsidy on certified seeds, organic fertilisers, and agricultural tools for hill/terrace farmers in Uttarakhand; additional support for horticulture (apple, pear, kiwi, off-season vegetables) — 50% subsidy on plant material and drip irrigation; ₹2,000 crop incentive per farmer per season; direct bank transfer; priority to SC/ST/small/marginal farmers",
               hi: "उत्तराखंड के पहाड़ी/सीढ़ीदार खेती करने वाले किसानों को प्रमाणित बीज, जैविक उर्वरक और कृषि उपकरण पर 75% तक सब्सिडी; बागवानी (सेब, नाशपाती, कीवी, ऑफ-सीजन सब्जियां) पर 50% सब्सिडी; प्रति किसान प्रति सीजन ₹2,000 फसल प्रोत्साहन; सीधे बैंक में; SC/ST/छोटे/सीमांत किसानों को प्राथमिकता" },
    tag:     { en: "Farmer / Hill Farming / Subsidy", hi: "किसान / पहाड़ी खेती / सब्सिडी" },
    annual: 4000,
    apply:   { en: "agriculture.uk.gov.in / nearest Block Agriculture Office", hi: "agriculture.uk.gov.in / निकटतम ब्लॉक कृषि कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Khasra-Khatauni (Uttarakhand)", "Farmer Registration Certificate", "Bank Account (Aadhaar-linked)", "Uttarakhand Domicile Certificate", "Caste Certificate (SC/ST for priority subsidy)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / खसरा-खतौनी (उत्तराखंड)", "किसान पंजीकरण प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "उत्तराखंड डोमिसाइल प्रमाण पत्र", "जाति प्रमाण पत्र (SC/ST प्राथमिकता सब्सिडी के लिए)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Uttarakhand" && a.who === "farmer",
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "uk_saur_swarojgar",
    icon: "☀️", color: "#D97706", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Renewable Energy Dev. Agency (UREDA) / Labour Dept.", hi: "उत्तराखंड अक्षय ऊर्जा विकास एजेंसी (UREDA) / श्रम विभाग" },
    name:    { en: "Mukhyamantri Saur Swarojgar Yojana (Uttarakhand)",
               hi: "मुख्यमंत्री सौर स्वरोजगार योजना (उत्तराखंड)" },
    benefit: { en: "25 kW solar plant set up on lease land with 70% bank loan + 25% state subsidy (only 5% own contribution); beneficiary earns by selling electricity to UPCL at ₹4.07/unit; estimated income ₹1–1.5 lakh/year; targeted at migrant workers, unemployed youth, and farmers of Uttarakhand; 10,000 units planned; 25-year agreement with UPCL",
               hi: "पट्टे की भूमि पर 25 kW सोलर प्लांट — 70% बैंक ऋण + 25% राज्य सब्सिडी (केवल 5% स्वयं का योगदान); लाभार्थी UPCL को ₹4.07/यूनिट पर बिजली बेचकर कमाता है; अनुमानित आय ₹1–1.5 लाख/वर्ष; उत्तराखंड के प्रवासी मजदूरों, बेरोजगार युवाओं और किसानों के लिए; 10,000 यूनिट नियोजित; UPCL के साथ 25 वर्ष का करार" },
    tag:     { en: "Youth / Solar / Self-Employment", hi: "युवा / सौर / स्वरोजगार" },
    annual: 100000,
    apply:   { en: "ureda.uk.gov.in / District Industries Centre", hi: "ureda.uk.gov.in / जिला उद्योग केंद्र" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Uttarakhand Domicile Certificate", "Age Proof (18–45 years)", "Land Lease Agreement (for solar plant site)", "Bank Account details (for loan processing)", "Income Certificate", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "उत्तराखंड डोमिसाइल प्रमाण पत्र", "आयु प्रमाण (18–45 वर्ष)", "भूमि पट्टा करार (सोलर प्लांट स्थल के लिए)", "बैंक खाता विवरण (ऋण प्रसंस्करण के लिए)", "आय प्रमाण पत्र", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Uttarakhand" && (a.who === "farmer" || a.who === "business" || a.who === "general") && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "uk_swarozgar_yojana",
    icon: "💼", color: "#0369A1", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Industry / MSME", hi: "उत्तराखंड उद्योग / MSME विभाग" },
    name:    { en: "Mukhyamantri Swarozgar Yojana (Uttarakhand)",
               hi: "मुख्यमंत्री स्वरोजगार योजना (उत्तराखंड)" },
    benefit: { en: "Loans up to ₹25 lakh for service/trade sector and ₹50 lakh for manufacturing sector for Uttarakhand domicile youth (18–45 years); 25% margin money subsidy (max ₹6.25 lakh) for general category; 35% subsidy for SC/ST/Women/disabled/ex-servicemen (max ₹12.5 lakh); covers new ventures in manufacturing, handicrafts, tourism, IT, and service industries",
               hi: "उत्तराखंड डोमिसाइल युवाओं (18–45 वर्ष) के लिए सेवा/व्यापार में ₹25 लाख और विनिर्माण में ₹50 लाख तक ऋण; सामान्य वर्ग के लिए 25% मार्जिन मनी सब्सिडी (अधिकतम ₹6.25 लाख); SC/ST/महिला/दिव्यांग/भूतपूर्व सैनिक के लिए 35% सब्सिडी (अधिकतम ₹12.5 लाख); विनिर्माण, हस्तशिल्प, पर्यटन, IT और सेवा उद्योग शामिल" },
    tag:     { en: "Youth / Self-Employment / MSME Loan", hi: "युवा / स्वरोजगार / MSME ऋण" },
    annual: 0,
    apply:   { en: "msy.uk.gov.in / District Industries Centre (DIC)", hi: "msy.uk.gov.in / जिला उद्योग केंद्र (DIC)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Uttarakhand Domicile Certificate (3 years)", "Age Proof (18–45 years)", "Educational Qualification Certificate", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "Income Certificate (family)", "Caste Certificate (if SC/ST)", "Disability / Ex-serviceman Certificate (if applicable)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "उत्तराखंड डोमिसाइल प्रमाण पत्र (3 वर्ष)", "आयु प्रमाण (18–45 वर्ष)", "शैक्षिक योग्यता प्रमाण पत्र", "प्रोजेक्ट रिपोर्ट / व्यापार योजना", "बैंक खाता (आधार-लिंक्ड)", "आय प्रमाण पत्र (परिवार)", "जाति प्रमाण पत्र (SC/ST के लिए)", "दिव्यांगता / भूतपूर्व सैनिक प्रमाण पत्र (यदि लागू)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttarakhand" && (a.who === "business" || a.who === "general") && ["18to35","35to60"].includes(a.age),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "uk_awas_yojana",
    icon: "🏠", color: "#B45309", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Dept. of Rural Development / Housing", hi: "उत्तराखंड ग्रामीण विकास / आवास विभाग" },
    name:    { en: "Mukhyamantri Awas Yojana — Rural Housing (Uttarakhand)",
               hi: "मुख्यमंत्री आवास योजना — ग्रामीण आवास (उत्तराखंड)" },
    benefit: { en: "₹1.30 lakh financial assistance in installments for construction of a pucca house for rural BPL/houseless families (plain areas: ₹1.20 lakh; hilly/tribal areas: ₹1.30 lakh); supplemented with PMAY-G assistance where applicable; beneficiary list prepared through Awaas+ survey; priority to SC/ST/women-headed/disabled households; toilet construction mandatory",
               hi: "ग्रामीण BPL/बेघर परिवारों के लिए पक्के मकान निर्माण हेतु किस्तों में वित्तीय सहायता (मैदानी क्षेत्र: ₹1.20 लाख; पहाड़ी/जनजातीय क्षेत्र: ₹1.30 लाख); जहां लागू हो PMAY-G सहायता से पूरक; आवास+ सर्वेक्षण से लाभार्थी सूची; SC/ST/महिला-मुखिया/दिव्यांग परिवारों को प्राथमिकता; शौचालय निर्माण अनिवार्य" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 0,
    apply:   { en: "pmayg.nic.in / Gram Panchayat / Block Development Office", hi: "pmayg.nic.in / ग्राम पंचायत / ब्लॉक विकास कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / Awaas+ Survey Registration", "Land Ownership Proof / Patta document", "Bank Account (Aadhaar-linked)", "Uttarakhand Domicile / Residence Proof", "Passport Photo", "Caste Certificate (SC/ST for priority)", "Disability Certificate (if applicable)"],
               hi: ["आधार कार्ड", "BPL / आवास+ सर्वेक्षण पंजीकरण", "भूमि स्वामित्व प्रमाण / पट्टा दस्तावेज़", "बैंक खाता (आधार-लिंक्ड)", "उत्तराखंड डोमिसाइल / निवास प्रमाण", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST प्राथमिकता के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू)"] },
    match: (a) => a.state === "Uttarakhand" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ADD MORE UTTARAKHAND SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "uttarakhand_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Uttarakhand",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Uttarakhand",
  // },

];
