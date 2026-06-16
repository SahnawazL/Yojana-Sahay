// Mizoram — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "mizoram_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const MIZORAM_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "mizoram_nlup",
    icon: "🌿", color: "#15803D", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram New Land Use Policy (NLUP) Board / Agriculture Dept.", hi: "मिजोरम न्यू लैंड यूज पॉलिसी (NLUP) बोर्ड / कृषि विभाग" },
    name:    { en: "New Land Use Policy (NLUP) — Mizoram",
               hi: "न्यू लैंड यूज पॉलिसी (NLUP) — मिजोरम" },
    benefit: { en: "₹1 lakh per household financial assistance (released in 3 installments) to shift from traditional jhum (slash-and-burn) cultivation to alternative settled livelihoods — covers horticulture, plantation crops, aquaculture, sericulture, animal husbandry, and micro-enterprises; also includes free training, technical support, and supply of quality planting material; primary beneficiaries are rural farming families in jhum-practising villages across all 8 districts",
               hi: "पारंपरिक झूम (स्लैश-एंड-बर्न) खेती से वैकल्पिक स्थायी आजीविका में बदलाव के लिए प्रति परिवार ₹1 लाख सहायता (3 किस्तों में) — बागवानी, बागान फसलें, मछली पालन, रेशम उत्पादन, पशुपालन और सूक्ष्म उद्यम शामिल; निःशुल्क प्रशिक्षण, तकनीकी सहायता और गुणवत्तापूर्ण रोपण सामग्री; सभी 8 जिलों के झूम-अभ्यासी गांवों के ग्रामीण कृषि परिवार प्राथमिक लाभार्थी" },
    tag:     { en: "Farmer / Livelihood / NLUP", hi: "किसान / आजीविका / NLUP" },
    annual: 100000,
    apply:   { en: "mizoram.gov.in/nlup / District NLUP Implementation Unit (offline)", hi: "mizoram.gov.in/nlup / जिला NLUP कार्यान्वयन इकाई (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Residence Proof (Mizoram village)", "Land Holding / Village Land Record (Ramhual/Hnam)", "Proof of Jhum Cultivation (Village Council Certificate)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "निवास प्रमाण (मिजोरम गांव)", "भूमि धारण / ग्राम भूमि अभिलेख (रामहुआल/हनाम)", "झूम खेती का प्रमाण (ग्राम परिषद प्रमाण पत्र)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Mizoram" && (a.who === "farmer" || a.area === "rural"),
  },

  {
    id: "mizoram_agri_intensification",
    icon: "🌾", color: "#D97706", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Agriculture Dept.", hi: "मिजोरम कृषि विभाग" },
    name:    { en: "Chief Minister's Agriculture Intensification Programme (Mizoram)",
               hi: "मुख्यमंत्री कृषि गहनता कार्यक्रम (मिजोरम)" },
    benefit: { en: "Subsidised supply of high-yielding variety (HYV) seeds, organic and chemical fertilisers, micro-irrigation equipment, and farm tools to registered farmers; 50–75% subsidy on inputs; additional 10% subsidy for ST/women farmers; free soil health testing at block level; promotes terrace farming, horticulture, and spice cultivation (ginger, turmeric, chilli) suited to Mizoram's hilly terrain",
               hi: "पंजीकृत किसानों को उच्च उपज वाले (HYV) बीज, जैविक व रासायनिक उर्वरक, सूक्ष्म सिंचाई उपकरण और कृषि औजारों की सब्सिडी आपूर्ति; इनपुट पर 50–75% सब्सिडी; ST/महिला किसानों को अतिरिक्त 10% सब्सिडी; ब्लॉक स्तर पर मुफ्त मृदा स्वास्थ्य परीक्षण; मिजोरम की पहाड़ी भूमि के अनुकूल सीढ़ीदार खेती, बागवानी और मसाला खेती (अदरक, हल्दी, मिर्च) को बढ़ावा" },
    tag:     { en: "Farmer / Input Subsidy", hi: "किसान / इनपुट सब्सिडी" },
    annual: 0,
    apply:   { en: "agri.mizoram.gov.in / District Agriculture Officer (offline)", hi: "agri.mizoram.gov.in / जिला कृषि अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Land Record / Village Council Land Certificate", "Caste Certificate (ST for higher subsidy)", "Bank Passbook", "Passport Photo"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "भूमि अभिलेख / ग्राम परिषद भूमि प्रमाण पत्र", "जाति प्रमाण पत्र (ST अधिक सब्सिडी के लिए)", "बैंक पासबुक", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Mizoram" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "mizoram_msrlm_shg",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram State Rural Livelihood Mission (MSRLM) / Rural Development Dept.", hi: "मिजोरम राज्य ग्रामीण आजीविका मिशन (MSRLM) / ग्रामीण विकास विभाग" },
    name:    { en: "Mizoram State Rural Livelihood Mission — SHG Loan & Livelihood (Mizoram)",
               hi: "मिजोरम राज्य ग्रामीण आजीविका मिशन — SHG ऋण एवं आजीविका (मिजोरम)" },
    benefit: { en: "Interest-free revolving fund of ₹15,000 for newly formed women SHGs; low-interest community investment fund (CIF) loans up to ₹2.5 lakh per SHG for income-generating activities; skill development and vocational training in handloom, food processing, tailoring, and bamboo craft; market linkage support through state MSRLM network; covers rural women in all 8 districts of Mizoram",
               hi: "नए गठित महिला SHGs के लिए ₹15,000 ब्याज-मुक्त रिवॉल्विंग फंड; आय-सृजन गतिविधियों के लिए प्रति SHG ₹2.5 लाख तक कम-ब्याज सामुदायिक निवेश फंड (CIF) ऋण; हथकरघा, खाद्य प्रसंस्करण, सिलाई और बांस शिल्प में कौशल विकास व व्यावसायिक प्रशिक्षण; राज्य MSRLM नेटवर्क के माध्यम से बाजार संपर्क; मिजोरम के सभी 8 जिलों की ग्रामीण महिलाएं लाभार्थी" },
    tag:     { en: "Women / SHG / Livelihood", hi: "महिला / SHG / आजीविका" },
    annual: 0,
    apply:   { en: "msrlm.mizoram.gov.in / Block Development Office (offline)", hi: "msrlm.mizoram.gov.in / ब्लॉक विकास कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG Passbook", "Bank Account (SHG joint account)", "Residence Proof (Mizoram)", "Village Council Certificate (confirming membership)", "Passport Photo"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG संयुक्त खाता)", "निवास प्रमाण (मिजोरम)", "ग्राम परिषद प्रमाण पत्र (सदस्यता की पुष्टि)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Mizoram" && a.who === "women",
  },

  {
    id: "mizoram_maternal_nutrition",
    icon: "🤱", color: "#9333EA", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Social Welfare Dept. / ICDS", hi: "मिजोरम समाज कल्याण विभाग / ICDS" },
    name:    { en: "Mizoram Maternity Benefit & Nutrition Support Scheme",
               hi: "मिजोरम मातृत्व लाभ एवं पोषण सहायता योजना" },
    benefit: { en: "Monthly nutritional supplement kit (value ~₹700–₹900) provided free to pregnant and lactating women for up to 6 months through Anganwadi centres; includes fortified food items, iron-folic acid tablets, calcium supplements, and health education material; state supplement over and above PMMVY central benefit; covers all districts including remote Lawngtlai and Mamit",
               hi: "गर्भवती एवं स्तनपान कराने वाली महिलाओं को आंगनवाड़ी केंद्रों के माध्यम से 6 महीने तक मासिक पोषण किट (~₹700–₹900 मूल्य) निःशुल्क; फोर्टिफाइड खाद्य, आयरन-फोलिक एसिड गोलियां, कैल्शियम सप्लीमेंट और स्वास्थ्य शिक्षा सामग्री; केंद्रीय PMMVY के अतिरिक्त राज्य पूरक; लावंगतलाई और मामित जैसे दूरदराज जिलों सहित सभी जिलों में लागू" },
    tag:     { en: "Women / Maternal / Nutrition", hi: "महिला / मातृत्व / पोषण" },
    annual: 10800,
    apply:   { en: "Nearest Anganwadi Centre / District Social Welfare Office (offline)", hi: "निकटतम आंगनवाड़ी केंद्र / जिला समाज कल्याण कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Registration Certificate / MCP Card", "Residence Proof (Mizoram)", "BPL / NFSA Ration Card (if applicable)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "गर्भावस्था पंजीकरण प्रमाण पत्र / MCP कार्ड", "निवास प्रमाण (मिजोरम)", "BPL / NFSA राशन कार्ड (यदि लागू हो)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Mizoram" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "mizoram_health_insurance",
    icon: "🏥", color: "#DC2626", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Health & Family Welfare Dept.", hi: "मिजोरम स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Mizoram State Health Care Scheme (MSHCS)",
               hi: "मिजोरम राज्य स्वास्थ्य देखभाल योजना (MSHCS)" },
    benefit: { en: "Cashless health cover of up to ₹4 lakh per family per year at empanelled government and private hospitals for secondary and tertiary care; supplements Ayushman Bharat PM-JAY for state-resident BPL/EWS families; covers pre- and post-hospitalisation expenses up to 30 days; no premium for BPL cardholders; special provisions for cancer, renal failure, and cardiac conditions requiring referral to outside-state hospitals",
               hi: "सूचीबद्ध सरकारी व निजी अस्पतालों में द्वितीयक और तृतीयक देखभाल के लिए प्रति परिवार ₹4 लाख/वर्ष तक नकद-रहित स्वास्थ्य कवर; राज्य के BPL/EWS परिवारों के लिए आयुष्मान भारत PM-JAY का पूरक; 30 दिन तक अस्पताल भर्ती से पहले व बाद का खर्च शामिल; BPL कार्डधारकों के लिए कोई प्रीमियम नहीं; राज्य से बाहर रेफरल की आवश्यकता वाले कैंसर, गुर्दे की विफलता और हृदय रोगों के लिए विशेष प्रावधान" },
    tag:     { en: "Health / Insurance / BPL", hi: "स्वास्थ्य / बीमा / BPL" },
    annual: 400000,
    apply:   { en: "https://health.mizoram.gov.in", hi: "health.mizoram.gov.in / निकटतम सूचीबद्ध अस्पताल आयुष्मान डेस्क" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL / NFSA Ration Card", "Ayushman Bharat / State Health Card", "Residence Proof (Mizoram)", "Family Composition Certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL / NFSA राशन कार्ड", "आयुष्मान भारत / राज्य स्वास्थ्य कार्ड", "निवास प्रमाण (मिजोरम)", "परिवार संरचना प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Mizoram" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "mizoram_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Higher & Technical Education Dept.", hi: "मिजोरम उच्च एवं तकनीकी शिक्षा विभाग" },
    name:    { en: "Mizoram Chief Minister's Merit Scholarship Scheme",
               hi: "मिजोरम मुख्यमंत्री मेधा छात्रवृत्ति योजना" },
    benefit: { en: "Annual scholarship of ₹10,000–₹24,000 for meritorious Mizoram domicile students scoring 60%+ in MBSE Class 10 or Class 12 board exams; amount by level — ₹10,000/year for Class 11–12, ₹16,000/year for undergraduate, ₹24,000/year for postgraduate courses; credited directly to student's Aadhaar-linked bank account; renewable annually on maintaining 55%+ in each academic year; priority to ST students and those from remote districts",
               hi: "MBSE कक्षा 10 या 12 परीक्षा में 60%+ अंक लाने वाले मिजोरम अधिवास छात्रों को ₹10,000–₹24,000 वार्षिक छात्रवृत्ति; स्तर के अनुसार — कक्षा 11–12: ₹10,000/वर्ष, स्नातक: ₹16,000/वर्ष, स्नातकोत्तर: ₹24,000/वर्ष; सीधे आधार-लिंक्ड बैंक खाते में; प्रत्येक वर्ष 55%+ बनाए रखने पर नवीनीकरण; ST छात्रों और दूरदराज जिलों के छात्रों को प्राथमिकता" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 24000,
    apply:   { en: "https://dhe.mizoram.gov.in", hi: "dhe.mizoram.gov.in / स्कूल या कॉलेज कार्यालय (ऑनलाइन + ऑफलाइन)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "MBSE Class 10 / 12 Marksheet", "Income Certificate (family income below threshold)", "ST / OBC Certificate (if applicable)", "Admission / Enrollment Certificate from current institution", "Bank Account (Aadhaar-linked, student's name)", "Residence / Domicile Certificate (Mizoram)", "Passport Photo"],
               hi: ["आधार कार्ड", "MBSE कक्षा 10 / 12 अंकसूची", "आय प्रमाण पत्र (पारिवारिक आय सीमा से कम)", "ST / OBC प्रमाण पत्र (यदि लागू हो)", "वर्तमान संस्थान से प्रवेश / नामांकन प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास / अधिवास प्रमाण पत्र (मिजोरम)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Mizoram" && a.who === "student",
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "mizoram_social_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Social Welfare Dept.", hi: "मिजोरम समाज कल्याण विभाग" },
    name:    { en: "Mizoram State Social Security Pension Scheme",
               hi: "मिजोरम राज्य सामाजिक सुरक्षा पेंशन योजना" },
    benefit: { en: "Monthly pension (state top-up combined with NSAP central share) — Elderly (60–79 years): ₹1,500/month; Elderly (80+ years): ₹2,000/month; Widows (40–59 years): ₹1,500/month; Persons with Disability (40%+): ₹1,500/month; paid directly to Aadhaar-linked bank account every month; covers BPL and low-income households across all 8 districts of Mizoram; no application fee",
               hi: "मासिक पेंशन (NSAP केंद्रीय अंश + राज्य टॉप-अप) — वृद्ध (60–79 वर्ष): ₹1,500/माह; वृद्ध (80+ वर्ष): ₹2,000/माह; विधवाएं (40–59 वर्ष): ₹1,500/माह; दिव्यांगजन (40%+): ₹1,500/माह; सीधे आधार-लिंक्ड बैंक खाते में मासिक; मिजोरम के सभी 8 जिलों के BPL व कम आय वाले परिवार लाभार्थी; कोई आवेदन शुल्क नहीं" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 24000,
    apply:   { en: "socialwelfare.mizoram.gov.in / SDO or BDO office (offline)", hi: "socialwelfare.mizoram.gov.in / SDO या BDO कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, from Medical Board) — for disabled", "BPL Ration Card / Income Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Mizoram)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "BPL राशन कार्ड / आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मिजोरम)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Mizoram" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "mizoram_cm_awas",
    icon: "🏠", color: "#B45309", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Urban Development & Poverty Alleviation Dept.", hi: "मिजोरम नगर विकास एवं गरीबी उन्मूलन विभाग" },
    name:    { en: "Chief Minister's Comprehensive Housing Scheme (Mizoram)",
               hi: "मुख्यमंत्री समग्र आवास योजना (मिजोरम)" },
    benefit: { en: "₹1.2 lakh–₹1.5 lakh one-time financial assistance for construction or renovation of pucca house for BPL/EWS/LIG households; supplementary to PMAY-Gramin and PMAY-Urban; paid in 2–3 installments linked to construction milestones; mandatory inclusion of functional toilet and kitchen; priority to households headed by women, ST beneficiaries, and persons with disability; applicable in both rural and urban areas of Mizoram",
               hi: "BPL/EWS/LIG परिवारों के लिए पक्के मकान के निर्माण या नवीनीकरण हेतु ₹1.2 लाख–₹1.5 लाख एकमुश्त सहायता; PMAY-ग्रामीण और PMAY-शहरी का पूरक; निर्माण मील के पत्थर से जुड़ी 2–3 किस्तों में भुगतान; कार्यात्मक शौचालय व रसोई अनिवार्य; महिला-प्रमुख परिवारों, ST लाभार्थियों और दिव्यांगजनों को प्राथमिकता; मिजोरम के ग्रामीण और शहरी दोनों क्षेत्रों में लागू" },
    tag:     { en: "Housing / BPL / EWS", hi: "आवास / BPL / EWS" },
    annual: 150000,
    apply:   { en: "Nearest BDO / ULB (Urban Local Body) office (offline)", hi: "निकटतम BDO / ULB (शहरी स्थानीय निकाय) कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS / LIG Income Certificate", "Land / Plot Ownership Document or Village Council Land Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Mizoram)", "Passport Photo", "ST Certificate (for priority)", "Photograph of existing house / site"],
               hi: ["आधार कार्ड", "BPL / EWS / LIG आय प्रमाण पत्र", "भूमि / भूखंड स्वामित्व दस्तावेज़ या ग्राम परिषद भूमि प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (मिजोरम)", "पासपोर्ट फोटो", "ST प्रमाण पत्र (प्राथमिकता के लिए)", "मौजूदा मकान / स्थल की तस्वीर"] },
    match: (a) => a.state === "Mizoram" && ["below1","1to3"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "mizoram_sedp",
    icon: "💼", color: "#0F766E", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Industries Dept. / Mizoram Industrial Development Corporation (MIDC)", hi: "मिजोरम उद्योग विभाग / मिजोरम औद्योगिक विकास निगम (MIDC)" },
    name:    { en: "Socio-Economic Development Programme (SEDP) — Mizoram",
               hi: "सामाजिक-आर्थिक विकास कार्यक्रम (SEDP) — मिजोरम" },
    benefit: { en: "Collateral-free loan of ₹50,000–₹10 lakh for educated unemployed youth (18–45 years) and first-generation entrepreneurs to start micro and small enterprises; 20–30% capital subsidy on project cost (higher for women / ST applicants); free entrepreneurship development training through MIDC and government ITIs; covers manufacturing, services, trade, and agro-processing sectors; targeted at youth in rural and semi-urban areas",
               hi: "18–45 वर्ष के शिक्षित बेरोजगार युवाओं और पहली पीढ़ी के उद्यमियों को सूक्ष्म व लघु उद्यम शुरू करने के लिए ₹50,000–₹10 लाख गारंटी-मुक्त ऋण; परियोजना लागत पर 20–30% पूंजी सब्सिडी (महिला/ST आवेदकों के लिए अधिक); MIDC और सरकारी ITIs के माध्यम से निःशुल्क उद्यमिता विकास प्रशिक्षण; विनिर्माण, सेवाएं, व्यापार और कृषि-प्रसंस्करण क्षेत्र; ग्रामीण व अर्ध-शहरी क्षेत्रों के युवाओं पर केंद्रित" },
    tag:     { en: "Youth / Self-Employment / Entrepreneur", hi: "युवा / स्वरोजगार / उद्यमी" },
    annual: 0,
    apply:   { en: "industries.mizoram.gov.in / District Industries Centre (DIC) office", hi: "industries.mizoram.gov.in / जिला उद्योग केंद्र (DIC) कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID)", "Educational Qualification Certificate", "Residence / Domicile Certificate (Mizoram)", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "ST / OBC Certificate (for higher subsidy)", "Passport Photo", "Inner Line Permit (ILP) — for verification if required"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "शैक्षिक योग्यता प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (मिजोरम)", "परियोजना रिपोर्ट / व्यवसाय योजना", "बैंक खाता (आधार-लिंक्ड)", "ST / OBC प्रमाण पत्र (अधिक सब्सिडी के लिए)", "पासपोर्ट फोटो", "इनर लाइन परमिट (ILP) — यदि आवश्यक हो सत्यापन के लिए"] },
    match: (a) => a.state === "Mizoram" && (a.who === "unemployed" || a.who === "business" || a.who === "general") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── TRIBAL WELFARE ────────────────────────────────────────────────────────

  {
    id: "mizoram_tribal_welfare",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Mizoram",
    ministry: { en: "Mizoram Tribal Welfare Dept. / District Council (LADC / CADC / MDC)", hi: "मिजोरम जनजातीय कल्याण विभाग / जिला परिषद (LADC / CADC / MDC)" },
    name:    { en: "Mizoram Tribal Development & District Council Welfare Schemes",
               hi: "मिजोरम जनजातीय विकास एवं जिला परिषद कल्याण योजनाएं" },
    benefit: { en: "Cluster of ST-targeted welfare benefits administered by the Mizoram Tribal Welfare Dept. and three Autonomous District Councils (Lai Autonomous District Council, Chakma Autonomous District Council, Mara Autonomous District Council) — includes free textbooks, uniforms, and hostel stipends for tribal students (Class 1–12); ₹5,000 one-time grant for tribal women starting micro-enterprises; livelihood support for bamboo crafts, handloom weavers, and traditional fishermen; vocational training grants up to ₹10,000 for youth in remote tribal areas",
               hi: "मिजोरम जनजातीय कल्याण विभाग और तीन स्वायत्त जिला परिषदों (लाई, चकमा, मारा) द्वारा प्रशासित ST-लक्षित कल्याण लाभों का समूह — जनजातीय छात्रों (कक्षा 1–12) के लिए निःशुल्क पाठ्यपुस्तक, वर्दी और छात्रावास वजीफा; सूक्ष्म उद्यम शुरू करने वाली जनजातीय महिलाओं को ₹5,000 एकमुश्त अनुदान; बांस शिल्पकारों, हथकरघा बुनकरों और पारंपरिक मछुआरों को आजीविका सहायता; दूरदराज जनजातीय क्षेत्रों के युवाओं के लिए ₹10,000 तक व्यावसायिक प्रशिक्षण अनुदान" },
    tag:     { en: "Tribal / ST / District Council", hi: "जनजातीय / ST / जिला परिषद" },
    annual: 10000,
    apply:   { en: "mizoram.gov.in/tribal / nearest District Council Office (offline)", hi: "mizoram.gov.in/tribal / निकटतम जिला परिषद कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST (Scheduled Tribe) Certificate issued by Mizoram Govt.", "Residence / Domicile Certificate (Mizoram)", "Income Certificate (BPL preferred)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Village Council Certificate", "For students: School Enrollment Certificate"],
               hi: ["आधार कार्ड", "मिजोरम सरकार द्वारा जारी ST (अनुसूचित जनजाति) प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (मिजोरम)", "आय प्रमाण पत्र (BPL प्राथमिक)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "ग्राम परिषद प्रमाण पत्र", "छात्रों के लिए: विद्यालय नामांकन प्रमाण पत्र"] },
    match: (a) => a.state === "Mizoram" && (a.caste === "st" || a.caste === "sc"),
  },

  // ADD MORE MIZORAM SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "mizoram_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Mizoram",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Mizoram",
  // },

];
