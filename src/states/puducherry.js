// Puducherry — YojanaSetu State/UT Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "puducherry_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const PUDUCHERRY_SCHEMES = [

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "puducherry_innuyir_kaapom",
    icon: "🤱", color: "#EC4899", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Health & Family Welfare", hi: "पुदुच्चेरी स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Innuyir Kaapom — Safe Motherhood Scheme (Puducherry)",
               hi: "इन्नुयिर काप्पोम — सुरक्षित मातृत्व योजना (पुदुच्चेरी)" },
    benefit: { en: "₹18,000 total financial assistance for pregnant women — ₹6,000 at first antenatal registration, ₹6,000 after institutional delivery, ₹6,000 on completion of full immunisation of infant; for women who deliver at government hospitals in Puducherry; also includes free ante-natal check-ups, iron/folic acid tablets, and free delivery services",
               hi: "गर्भवती महिलाओं को कुल ₹18,000 वित्तीय सहायता — पहले प्रसव पूर्व पंजीकरण पर ₹6,000, संस्थागत प्रसव के बाद ₹6,000, शिशु का पूर्ण टीकाकरण पूरा होने पर ₹6,000; पुदुच्चेरी के सरकारी अस्पतालों में प्रसव करने वाली महिलाओं के लिए; निःशुल्क प्रसव पूर्व जांच, आयरन/फोलिक एसिड गोलियां और निःशुल्क प्रसव सेवाएं भी शामिल" },
    tag:     { en: "Women / Maternal Health", hi: "महिला / मातृ स्वास्थ्य" },
    annual: 18000,
    apply:   { en: "Register at nearest Govt. Hospital / PHC in Puducherry", hi: "पुदुच्चेरी के निकटतम सरकारी अस्पताल / PHC पर पंजीकरण करें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Registration Certificate (from PHC/Govt. Hospital)", "Residence Proof (Puducherry domicile)", "Bank Account (Aadhaar-linked)", "Immunisation card (for 3rd instalment)", "Hospital delivery certificate"],
               hi: ["आधार कार्ड", "गर्भावस्था पंजीकरण प्रमाण पत्र (PHC/सरकारी अस्पताल से)", "निवास प्रमाण (पुदुच्चेरी)", "बैंक खाता (आधार-लिंक्ड)", "टीकाकरण कार्ड (तीसरी किस्त के लिए)", "अस्पताल प्रसव प्रमाण पत्र"] },
    match: (a) => a.state === "Puducherry" && a.who === "women",
  },

  {
    id: "puducherry_women_shg_loan",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Industries & Commerce / AAJEEVIKA", hi: "पुदुच्चेरी उद्योग एवं वाणिज्य विभाग / आजीविका" },
    name:    { en: "Women SHG Loan & Livelihood Support (Puducherry)",
               hi: "महिला SHG ऋण एवं आजीविका सहायता (पुदुच्चेरी)" },
    benefit: { en: "Interest-free / subsidised loans up to ₹5 lakh for women Self Help Group (SHG) members to start or expand micro-enterprises; seed capital of ₹10,000 for new SHGs; revolving fund support; skill training in tailoring, food processing, handicrafts, and agarbatti making; marketing support via government exhibitions and Pondicherry Agro Service & Industries Corporation (PASIC)",
               hi: "महिला स्वयं सहायता समूह (SHG) सदस्यों को सूक्ष्म उद्यम शुरू/विस्तार के लिए ₹5 लाख तक ब्याज-मुक्त / सब्सिडी ऋण; नए SHGs के लिए ₹10,000 बीज पूंजी; रिवॉल्विंग फंड सहायता; सिलाई, खाद्य प्रसंस्करण, हस्तशिल्प और अगरबत्ती निर्माण में कौशल प्रशिक्षण; सरकारी प्रदर्शनियों और PASIC के माध्यम से विपणन सहायता" },
    tag:     { en: "Women / SHG / Entrepreneurship", hi: "महिला / SHG / उद्यमिता" },
    annual: 0,
    apply:   { en: "Dept. of Industries & Commerce, Puducherry / nearest DRDA office", hi: "उद्योग एवं वाणिज्य विभाग, पुदुच्चेरी / निकटतम DRDA कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Registration Certificate / SHG passbook", "Bank Account (SHG account, Aadhaar-linked)", "Residence Proof (Puducherry domicile)", "Passport Photo", "Business plan / Project report (for loans above ₹1 lakh)"],
               hi: ["आधार कार्ड", "SHG पंजीकरण प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG खाता, आधार-लिंक्ड)", "निवास प्रमाण (पुदुच्चेरी)", "पासपोर्ट फोटो", "व्यवसाय योजना / परियोजना रिपोर्ट (₹1 लाख से अधिक ऋण के लिए)"] },
    match: (a) => a.state === "Puducherry" && a.who === "women",
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "puducherry_old_age_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Social Welfare", hi: "पुदुच्चेरी समाज कल्याण विभाग" },
    name:    { en: "Old Age Pension Scheme (Puducherry)",
               hi: "वृद्धावस्था पेंशन योजना (पुदुच्चेरी)" },
    benefit: { en: "₹2,000/month pension for senior citizens aged 60 years and above who are below poverty line (BPL) or destitute; ₹2,500/month for those above 80 years; paid directly via DBT to Aadhaar-linked bank account; for Puducherry residents with minimum 5 years domicile; no other government pension should be availed",
               hi: "गरीबी रेखा से नीचे (BPL) या असहाय 60 वर्ष और उससे अधिक आयु के वरिष्ठ नागरिकों को ₹2,000/माह पेंशन; 80 वर्ष से अधिक के लिए ₹2,500/माह; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; न्यूनतम 5 वर्ष के अधिवास वाले पुदुच्चेरी निवासियों के लिए; कोई अन्य सरकारी पेंशन नहीं होनी चाहिए" },
    tag:     { en: "Senior Citizen / Pension", hi: "वरिष्ठ नागरिक / पेंशन" },
    annual: 24000,
    apply:   { en: "Dept. of Social Welfare, Puducherry (offline application)", hi: "समाज कल्याण विभाग, पुदुच्चेरी (ऑफलाइन आवेदन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate)", "Residence Proof (Puducherry domicile — minimum 5 years)", "BPL Ration Card or Destitution Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo", "Self-declaration of no other pension"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र)", "निवास प्रमाण (पुदुच्चेरी — न्यूनतम 5 वर्ष)", "BPL राशन कार्ड या असहायता प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो", "किसी अन्य पेंशन का न होने की स्व-घोषणा"] },
    match: (a) => a.state === "Puducherry" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "puducherry_widow_pension",
    icon: "👩", color: "#BE185D", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Social Welfare", hi: "पुदुच्चेरी समाज कल्याण विभाग" },
    name:    { en: "Widow Pension Scheme (Puducherry)",
               hi: "विधवा पेंशन योजना (पुदुच्चेरी)" },
    benefit: { en: "₹2,000/month financial assistance for widows aged 18 years and above who are destitute or BPL; paid via DBT to Aadhaar-linked bank account; for Puducherry residents with minimum 5 years domicile; remarried widows are not eligible; beneficiary must not be in receipt of any other government pension or assistance",
               hi: "18 वर्ष और उससे अधिक आयु की देstitute या BPL विधवाओं को ₹2,000/माह वित्तीय सहायता; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; न्यूनतम 5 वर्ष के अधिवास वाले पुदुच्चेरी निवासियों के लिए; पुनर्विवाहित विधवाएं पात्र नहीं; लाभार्थी को किसी अन्य सरकारी पेंशन या सहायता का लाभ नहीं मिलना चाहिए" },
    tag:     { en: "Women / Widow / Pension", hi: "महिला / विधवा / पेंशन" },
    annual: 24000,
    apply:   { en: "Dept. of Social Welfare, Puducherry (offline application)", hi: "समाज कल्याण विभाग, पुदुच्चेरी (ऑफलाइन आवेदन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Marriage Certificate", "Residence Proof (Puducherry domicile — minimum 5 years)", "BPL Ration Card or Income Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "विवाह प्रमाण पत्र", "निवास प्रमाण (पुदुच्चेरी — न्यूनतम 5 वर्ष)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Puducherry" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "puducherry_disability_pension",
    icon: "♿", color: "#0891B2", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Social Welfare", hi: "पुदुच्चेरी समाज कल्याण विभाग" },
    name:    { en: "Disability Pension Scheme (Puducherry)",
               hi: "दिव्यांगजन पेंशन योजना (पुदुच्चेरी)" },
    benefit: { en: "₹2,000/month pension for persons with 40% or more disability (visual, hearing, locomotor, mental) who are BPL or destitute; paid via DBT to Aadhaar-linked bank account; for Puducherry residents with at least 5 years domicile; disability certificate from the Medical Board is mandatory",
               hi: "40% या उससे अधिक दिव्यांगता (दृष्टि, श्रवण, गतिशीलता, मानसिक) वाले BPL या असहाय व्यक्तियों को ₹2,000/माह पेंशन; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; कम से कम 5 वर्ष के अधिवास वाले पुदुच्चेरी निवासियों के लिए; मेडिकल बोर्ड से दिव्यांगता प्रमाण पत्र अनिवार्य" },
    tag:     { en: "Disabled / Pension", hi: "दिव्यांग / पेंशन" },
    annual: 24000,
    apply:   { en: "Dept. of Social Welfare, Puducherry (offline application)", hi: "समाज कल्याण विभाग, पुदुच्चेरी (ऑफलाइन आवेदन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ — issued by Medical Board, Puducherry)", "Residence Proof (Puducherry domicile — minimum 5 years)", "BPL Ration Card or Income Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+ — पुदुच्चेरी मेडिकल बोर्ड द्वारा जारी)", "निवास प्रमाण (पुदुच्चेरी — न्यूनतम 5 वर्ष)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Puducherry" && a.who === "disabled" && ["below1","1to3"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "puducherry_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of School Education / Social Welfare", hi: "पुदुच्चेरी स्कूल शिक्षा / समाज कल्याण विभाग" },
    name:    { en: "Chief Minister's Scholarship Scheme (Puducherry)",
               hi: "मुख्यमंत्री छात्रवृत्ति योजना (पुदुच्चेरी)" },
    benefit: { en: "Scholarship for meritorious students studying in Class 11 to post-graduation in Puducherry institutions — ₹500–₹1,500/month based on course; full tuition fee reimbursement for SC/ST/OBC students; one-time laptop/tablet grant of ₹15,000 for students securing above 85% in Class 10 and 12; for students with family income below ₹3 lakh/year",
               hi: "पुदुच्चेरी के संस्थानों में कक्षा 11 से स्नातकोत्तर तक पढ़ने वाले मेधावी छात्रों को छात्रवृत्ति — पाठ्यक्रम के आधार पर ₹500–₹1,500/माह; SC/ST/OBC छात्रों के लिए पूर्ण ट्यूशन शुल्क प्रतिपूर्ति; कक्षा 10 और 12 में 85% से अधिक अंक प्राप्त करने वाले छात्रों को ₹15,000 एकमुश्त लैपटॉप/टैबलेट अनुदान; ₹3 लाख/वर्ष से कम पारिवारिक आय वाले छात्रों के लिए" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 18000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/asdaps", hi: "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल) / स्कूल शिक्षा विभाग, पुदुच्चेरी" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Previous Marksheet (10th / last qualifying exam)", "Income Certificate (family income < ₹3 lakh/year)", "Caste Certificate (if SC/ST/OBC)", "Bonafide Certificate from institution", "Bank Account (Aadhaar-linked, student's name)", "Residence Proof (Puducherry domicile)", "Passport Photo"],
               hi: ["आधार कार्ड", "पिछली अंकसूची (10वीं / अंतिम योग्यता परीक्षा)", "आय प्रमाण पत्र (पारिवारिक आय ₹3 लाख/वर्ष से कम)", "जाति प्रमाण पत्र (SC/ST/OBC के लिए)", "संस्थान से बोनाफाइड प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास प्रमाण (पुदुच्चेरी)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Puducherry" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "puducherry_free_uniform_books",
    icon: "📚", color: "#0369A1", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of School Education", hi: "पुदुच्चेरी स्कूल शिक्षा विभाग" },
    name:    { en: "Free Uniform, Books & Noon Meal Scheme (Puducherry)",
               hi: "निःशुल्क वर्दी, पुस्तकें एवं मध्याह्न भोजन योजना (पुदुच्चेरी)" },
    benefit: { en: "All students enrolled in government schools in Puducherry receive: free textbooks and stationery, free school uniform (2 sets per year), free noon meals (hot cooked food during school days), free footwear, and a ₹1,000 annual cash incentive for girl students to prevent dropouts; covers Classes 1 to 12 in all Puducherry government schools",
               hi: "पुदुच्चेरी के सरकारी स्कूलों में नामांकित सभी छात्रों को: निःशुल्क पाठ्यपुस्तकें और स्टेशनरी, निःशुल्क स्कूल वर्दी (प्रति वर्ष 2 सेट), निःशुल्क मध्याह्न भोजन (स्कूल के दिनों में गर्म पका भोजन), निःशुल्क जूते और छात्राओं के ड्रॉपआउट रोकने के लिए ₹1,000 वार्षिक नकद प्रोत्साहन; पुदुच्चेरी के सभी सरकारी स्कूलों में कक्षा 1 से 12 तक" },
    tag:     { en: "Student / Education Support", hi: "छात्र / शिक्षा सहायता" },
    annual: 1000,
    apply:   { en: "Automatic enrollment via school admission in Puducherry govt. schools — no separate application needed", hi: "पुदुच्चेरी सरकारी स्कूलों में प्रवेश के माध्यम से स्वचालित नामांकन — कोई अलग आवेदन आवश्यक नहीं" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "School Admission Receipt / Student ID", "Residence Proof (Puducherry)"],
               hi: ["आधार कार्ड", "विद्यालय प्रवेश रसीद / छात्र पहचान पत्र", "निवास प्रमाण (पुदुच्चेरी)"] },
    match: (a) => a.state === "Puducherry" && a.who === "student",
  },

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "puducherry_farmer_input_subsidy",
    icon: "🌾", color: "#15803D", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Agriculture", hi: "पुदुच्चेरी कृषि विभाग" },
    name:    { en: "Agricultural Input Subsidy & Kisan Support (Puducherry)",
               hi: "कृषि इनपुट सब्सिडी एवं किसान सहायता (पुदुच्चेरी)" },
    benefit: { en: "Subsidised seeds (up to 50% cost subsidy), fertilisers, and pesticides supplied through the Agriculture Dept.; free soil testing at government labs; 50% subsidy on farm machinery and equipment purchase; ₹4,000/acre compensation for crop loss due to natural calamity; free irrigation support through minor irrigation channels; interest-free crop loans up to ₹1 lakh via cooperative banks; training in organic and integrated farming",
               hi: "कृषि विभाग के माध्यम से सब्सिडाइज्ड बीज (50% तक लागत सब्सिडी), उर्वरक और कीटनाशक; सरकारी प्रयोगशालाओं में निःशुल्क मिट्टी परीक्षण; कृषि मशीनरी व उपकरण खरीद पर 50% सब्सिडी; प्राकृतिक आपदा से फसल नुकसान पर ₹4,000/एकड़ मुआवज़ा; लघु सिंचाई नहरों के माध्यम से निःशुल्क सिंचाई सहायता; सहकारी बैंकों के माध्यम से ₹1 लाख तक ब्याज-मुक्त फसल ऋण; जैविक व एकीकृत खेती में प्रशिक्षण" },
    tag:     { en: "Farmer / Agriculture / Subsidy", hi: "किसान / कृषि / सब्सिडी" },
    annual: 0,
    apply:   { en: "Dept. of Agriculture, Puducherry / nearest Krishi Vigyan Kendra", hi: "कृषि विभाग, पुदुच्चेरी / निकटतम कृषि विज्ञान केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Patta (proof of land ownership)", "Farmer Registration Certificate", "Bank Account (Aadhaar-linked)", "Residence Proof (Puducherry)", "Crop sowing certificate (for crop loss compensation)"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / पट्टा (भूमि स्वामित्व प्रमाण)", "किसान पंजीकरण प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (पुदुच्चेरी)", "फसल बुवाई प्रमाण पत्र (फसल हानि मुआवज़े के लिए)"] },
    match: (a) => a.state === "Puducherry" && a.who === "farmer",
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "puducherry_chief_minister_health",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Health & Family Welfare", hi: "पुदुच्चेरी स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Chief Minister's Comprehensive Health Insurance Scheme (Puducherry)",
               hi: "मुख्यमंत्री व्यापक स्वास्थ्य बीमा योजना (पुदुच्चेरी)" },
    benefit: { en: "Cashless health insurance coverage up to ₹5 lakh per family per year at empanelled government and private hospitals in Puducherry and neighbouring states; covers hospitalisations, surgeries, cancer treatment, dialysis, and critical illnesses; for BPL families and those with annual income up to ₹3 lakh; all government hospitals in Puducherry also provide free OPD, diagnostics, and medicines",
               hi: "पुदुच्चेरी और पड़ोसी राज्यों के सूचीबद्ध सरकारी और निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख तक कैशलेस स्वास्थ्य बीमा; अस्पताल में भर्ती, सर्जरी, कैंसर उपचार, डायलिसिस और गंभीर बीमारियां शामिल; BPL परिवारों और ₹3 लाख तक की वार्षिक आय वालों के लिए; पुदुच्चेरी के सभी सरकारी अस्पतालों में निःशुल्क OPD, निदान और दवाइयां भी" },
    tag:     { en: "Health / Insurance", hi: "स्वास्थ्य / बीमा" },
    annual: 500000,
    apply:   { en: "Dept. of Health & Family Welfare, Puducherry / nearest govt. hospital or PHC", hi: "स्वास्थ्य एवं परिवार कल्याण विभाग, पुदुच्चेरी / निकटतम सरकारी अस्पताल या PHC" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card or Income Certificate (family income < ₹3 lakh/year)", "Residence Proof (Puducherry domicile)", "Family Composition Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड या आय प्रमाण पत्र (पारिवारिक आय ₹3 लाख/वर्ष से कम)", "निवास प्रमाण (पुदुच्चेरी)", "परिवार संरचना प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Puducherry" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "puducherry_housing_assistance",
    icon: "🏠", color: "#B45309", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Housing Board / Dept. of Housing", hi: "पुदुच्चेरी हाउसिंग बोर्ड / आवास विभाग" },
    name:    { en: "Housing Assistance for BPL Families (Puducherry)",
               hi: "BPL परिवारों के लिए आवास सहायता (पुदुच्चेरी)" },
    benefit: { en: "Financial assistance up to ₹1.50 lakh for construction or repair of houses for BPL / EWS families in Puducherry; free house sites (pattas) allotted to landless BPL families; Puducherry Housing Board also allots subsidised EWS/LIG flats at below-market rates via draw of lots; beneficiaries must contribute unskilled labour (sweat equity); must include a toilet under SBM",
               hi: "पुदुच्चेरी में BPL / EWS परिवारों के मकान निर्माण या मरम्मत के लिए ₹1.50 लाख तक वित्तीय सहायता; भूमिहीन BPL परिवारों को निःशुल्क मकान स्थल (पट्टा) आवंटन; पुदुच्चेरी हाउसिंग बोर्ड बाजार दर से कम पर लॉटरी के माध्यम से EWS/LIG फ्लैट भी आवंटित करता है; लाभार्थियों को अकुशल श्रम (स्वेट इक्विटी) का योगदान देना होगा; SBM के तहत शौचालय अनिवार्य" },
    tag:     { en: "Housing / BPL / EWS", hi: "आवास / BPL / EWS" },
    annual: 0,
    apply:   { en: "Dept. of Housing / Puducherry Housing Board, Puducherry (offline)", hi: "आवास विभाग / पुदुच्चेरी हाउसिंग बोर्ड, पुदुच्चेरी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card / EWS Certificate", "Land / House Site Documents (patta)", "Residence Proof (Puducherry domicile — minimum 5 years)", "Income Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Self-declaration of not owning a pucca house"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड / EWS प्रमाण पत्र", "भूमि / मकान स्थल दस्तावेज़ (पट्टा)", "निवास प्रमाण (पुदुच्चेरी — न्यूनतम 5 वर्ष)", "आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "पक्का मकान न होने की स्व-घोषणा"] },
    match: (a) => a.state === "Puducherry" && a.house === "no" && ["below1","1to3"].includes(a.income),
  },

  // ── SKILL / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "puducherry_skill_training",
    icon: "🛠️", color: "#D97706", scope: "state", state: "Puducherry",
    ministry: { en: "Puducherry Dept. of Labour & Employment / AAJEEVIKA", hi: "पुदुच्चेरी श्रम एवं रोजगार विभाग / आजीविका" },
    name:    { en: "Skill Development & Employment Scheme (Puducherry)",
               hi: "कौशल विकास एवं रोजगार योजना (पुदुच्चेरी)" },
    benefit: { en: "Free skill training programs of 3–6 months in Puducherry ITIs and empanelled private training centres under Pradhan Mantri Kaushal Vikas Yojana (PMKVY) and UT-funded schemes — trades include electronics, welding, tailoring, computer hardware, hospitality, beauty & wellness, and marine fisheries; monthly stipend of ₹1,000–₹2,500 during training; placement assistance; NSDC / NCVT-recognised certificates",
               hi: "PMKVY और UT-वित्त पोषित योजनाओं के तहत पुदुच्चेरी ITI और मान्यता प्राप्त निजी प्रशिक्षण केंद्रों में 3–6 माह के निःशुल्क कौशल प्रशिक्षण कार्यक्रम — इलेक्ट्रॉनिक्स, वेल्डिंग, सिलाई, कंप्यूटर हार्डवेयर, आतिथ्य, ब्यूटी एंड वेलनेस और समुद्री मत्स्य पालन जैसे व्यवसाय; प्रशिक्षण के दौरान ₹1,000–₹2,500/माह वजीफा; प्लेसमेंट सहायता; NSDC / NCVT मान्यता प्राप्त प्रमाण पत्र" },
    tag:     { en: "Skill / Employment / Youth", hi: "कौशल / रोजगार / युवा" },
    annual: 0,
    apply:   { en: "Dept. of Labour & Employment, Puducherry / nearest ITI, Puducherry", hi: "श्रम एवं रोजगार विभाग, पुदुच्चेरी / निकटतम ITI, पुदुच्चेरी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Residence Proof (Puducherry domicile)", "Educational Certificates (as per course eligibility)", "Bank Account (Aadhaar-linked — for stipend)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "निवास प्रमाण (पुदुच्चेरी)", "शैक्षिक प्रमाण पत्र (पाठ्यक्रम पात्रता के अनुसार)", "बैंक खाता (आधार-लिंक्ड — वजीफे के लिए)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Puducherry" && (a.who === "student" || a.who === "general" || a.who === "women") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE PUDUCHERRY SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "puducherry_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Puducherry",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Puducherry",
  // },

];
