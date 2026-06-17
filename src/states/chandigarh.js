// Chandigarh — YojanaSetu State/UT Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "chandigarh_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const CHANDIGARH_SCHEMES = [

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "chandigarh_sahara_yojana",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Social Welfare", hi: "चंडीगढ़ प्रशासन — समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Sahara Yojana (Chandigarh)",
               hi: "मुख्यमंत्री सहारा योजना (चंडीगढ़)" },
    benefit: { en: "₹3,000/month financial assistance to families of patients suffering from serious illnesses — Cancer, TB, Renal Failure, Heart Disease, Parkinson's, Hemophilia, Thalassemia, Muscular Dystrophy, Liver Failure; paid via DBT to Aadhaar-linked bank account; for UT Chandigarh residents with household income below ₹4 lakh per year",
               hi: "गंभीर बीमारियों — कैंसर, टीबी, किडनी फेलियर, हृदय रोग, पार्किंसन, हीमोफीलिया, थैलेसीमिया, मस्कुलर डिस्ट्रॉफी, लिवर फेलियर — से पीड़ित मरीज़ों के परिवारों को ₹3,000/माह वित्तीय सहायता; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; चंडीगढ़ UT के निवासी जिनकी वार्षिक घरेलू आय ₹4 लाख से कम हो" },
    tag:     { en: "Health / Financial Aid", hi: "स्वास्थ्य / वित्तीय सहायता" },
    annual: 36000,
    apply:   { en: "chandigarh.gov.in/socialwelfare or Dept. of Social Welfare, UT Chandigarh", hi: "chandigarh.gov.in/socialwelfare या समाज कल्याण विभाग, UT चंडीगढ़" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Residence Proof (Chandigarh domicile)", "Medical Certificate from government hospital (for the listed illness)", "Income Certificate (family income < ₹4 lakh/year)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Ration Card (if applicable)"],
               hi: ["आधार कार्ड", "निवास प्रमाण (चंडीगढ़ अधिवास)", "सरकारी अस्पताल से चिकित्सा प्रमाण पत्र (सूचीबद्ध बीमारी के लिए)", "आय प्रमाण पत्र (पारिवारिक आय ₹4 लाख/वर्ष से कम)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "राशन कार्ड (यदि उपलब्ध हो)"] },
    match: (a) => a.state === "Chandigarh" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "chandigarh_old_age_samman",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Social Welfare", hi: "चंडीगढ़ प्रशासन — समाज कल्याण विभाग" },
    name:    { en: "Old Age Samman Allowance (Chandigarh)",
               hi: "वृद्धावस्था सम्मान भत्ता (चंडीगढ़)" },
    benefit: { en: "₹1,500/month pension for senior citizens aged 60 years and above; ₹2,000/month for those aged 80+ years; paid via DBT directly to bank account; for Chandigarh residents with family income below ₹2 lakh/year; no other government pension should be received",
               hi: "60 वर्ष और उससे अधिक आयु के वरिष्ठ नागरिकों को ₹1,500/माह पेंशन; 80+ वर्ष के लिए ₹2,000/माह; DBT के माध्यम से सीधे बैंक खाते में; चंडीगढ़ के वे निवासी जिनकी पारिवारिक आय ₹2 लाख/वर्ष से कम हो; किसी अन्य सरकारी पेंशन का लाभ न हो" },
    tag:     { en: "Senior Citizen / Pension", hi: "वरिष्ठ नागरिक / पेंशन" },
    annual: 18000,
    apply:   { en: "Dept. of Social Welfare, UT Chandigarh (offline)", hi: "समाज कल्याण विभाग, UT चंडीगढ़ (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate)", "Residence Proof (Chandigarh domicile — minimum 3 years)", "Income Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo", "Self-declaration of no other pension"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र)", "निवास प्रमाण (चंडीगढ़ — न्यूनतम 3 वर्ष)", "आय प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो", "किसी अन्य पेंशन का न होने की स्व-घोषणा"] },
    match: (a) => a.state === "Chandigarh" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "chandigarh_widow_allowance",
    icon: "👩", color: "#BE185D", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Social Welfare", hi: "चंडीगढ़ प्रशासन — समाज कल्याण विभाग" },
    name:    { en: "Widow & Destitute Women Allowance (Chandigarh)",
               hi: "विधवा एवं असहाय महिला भत्ता (चंडीगढ़)" },
    benefit: { en: "₹1,500/month financial assistance for widows and destitute women aged 18 years and above; for Chandigarh residents with annual family income below ₹2 lakh; paid via DBT to Aadhaar-linked bank account; remarried widows are not eligible",
               hi: "18 वर्ष और उससे अधिक आयु की विधवाओं और असहाय महिलाओं को ₹1,500/माह वित्तीय सहायता; ₹2 लाख/वर्ष से कम वार्षिक पारिवारिक आय वाले चंडीगढ़ निवासियों के लिए; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; पुनर्विवाहित विधवाएं पात्र नहीं" },
    tag:     { en: "Women / Widow / Pension", hi: "महिला / विधवा / पेंशन" },
    annual: 18000,
    apply:   { en: "Dept. of Social Welfare, UT Chandigarh (offline)", hi: "समाज कल्याण विभाग, UT चंडीगढ़ (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Marriage Certificate", "Residence Proof (Chandigarh)", "Income Certificate (family income < ₹2 lakh/year)", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "विवाह प्रमाण पत्र", "निवास प्रमाण (चंडीगढ़)", "आय प्रमाण पत्र (पारिवारिक आय ₹2 लाख/वर्ष से कम)", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Chandigarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "chandigarh_disability_allowance",
    icon: "♿", color: "#0891B2", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Social Welfare", hi: "चंडीगढ़ प्रशासन — समाज कल्याण विभाग" },
    name:    { en: "Handicapped Allowance (Chandigarh)",
               hi: "दिव्यांगजन भत्ता (चंडीगढ़)" },
    benefit: { en: "₹1,500/month allowance for persons with 40% or more disability (physical, visual, hearing, mental); for Chandigarh residents with annual household income below ₹2 lakh; paid via DBT; higher disability (80%+) may attract enhanced benefit under national NSAP schemes",
               hi: "40% या उससे अधिक दिव्यांगता (शारीरिक, दृष्टि, श्रवण, मानसिक) वाले व्यक्तियों को ₹1,500/माह भत्ता; ₹2 लाख/वर्ष से कम वार्षिक घरेलू आय वाले चंडीगढ़ निवासियों के लिए; DBT के माध्यम से; 80%+ दिव्यांगता पर राष्ट्रीय NSAP योजनाओं से अतिरिक्त लाभ" },
    tag:     { en: "Disabled / Pension", hi: "दिव्यांग / पेंशन" },
    annual: 18000,
    apply:   { en: "Dept. of Social Welfare, UT Chandigarh (offline)", hi: "समाज कल्याण विभाग, UT चंडीगढ़ (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ — issued by Civil Surgeon / Medical Board)", "Residence Proof (Chandigarh)", "Income Certificate (family income < ₹2 lakh/year)", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+ — सिविल सर्जन / मेडिकल बोर्ड द्वारा जारी)", "निवास प्रमाण (चंडीगढ़)", "आय प्रमाण पत्र (पारिवारिक आय ₹2 लाख/वर्ष से कम)", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Chandigarh" && a.who === "disabled" && ["below1","1to3"].includes(a.income),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "chandigarh_post_matric_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Social Welfare (SC/ST/OBC Cell)", hi: "चंडीगढ़ प्रशासन — समाज कल्याण विभाग (SC/ST/OBC सेल)" },
    name:    { en: "Post Matric Scholarship — SC/ST/OBC (Chandigarh)",
               hi: "पोस्ट मैट्रिक छात्रवृत्ति — SC/ST/OBC (चंडीगढ़)" },
    benefit: { en: "Full tuition fee reimbursement + maintenance allowance for SC/ST/OBC students studying in Class 11, 12, graduation, post-graduation, or professional courses in Chandigarh institutions; maintenance allowance ranges from ₹250–1,200/month depending on course type; for students with family income below ₹2.5 lakh (SC/ST) and ₹1.5 lakh (OBC)",
               hi: "चंडीगढ़ के संस्थानों में कक्षा 11, 12, स्नातक, स्नातकोत्तर या व्यावसायिक पाठ्यक्रम में पढ़ने वाले SC/ST/OBC छात्रों के लिए पूर्ण ट्यूशन शुल्क प्रतिपूर्ति + रखरखाव भत्ता; रखरखाव भत्ता पाठ्यक्रम के आधार पर ₹250–1,200/माह; परिवार की आय SC/ST के लिए ₹2.5 लाख और OBC के लिए ₹1.5 लाख से कम हो" },
    tag:     { en: "Student / Scholarship / SC-ST-OBC", hi: "छात्र / छात्रवृत्ति / SC-ST-OBC" },
    annual: 14400,
    apply:   { en: "https://oasis.wb.gov.in", hi: "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल) — प्रत्येक वर्ष ऑनलाइन आवेदन करें" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC / ST / OBC — issued by competent authority in Chandigarh)", "Previous Marksheet (10th / last qualifying exam)", "Income Certificate (family income < ₹2.5 lakh for SC/ST, < ₹1.5 lakh for OBC)", "Current Bonafide Certificate from college/school", "Bank Account (Aadhaar-linked, student's name)", "Residence Proof (Chandigarh domicile)", "Admission Receipt / Fee receipt"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC / ST / OBC — चंडीगढ़ में सक्षम प्राधिकारी द्वारा जारी)", "पिछली अंकसूची (10वीं / अंतिम योग्यता परीक्षा)", "आय प्रमाण पत्र (SC/ST के लिए ₹2.5 लाख, OBC के लिए ₹1.5 लाख से कम)", "वर्तमान बोनाफाइड प्रमाण पत्र (कॉलेज/स्कूल से)", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "निवास प्रमाण (चंडीगढ़ अधिवास)", "प्रवेश रसीद / शुल्क रसीद"] },
    match: (a) => a.state === "Chandigarh" && a.who === "student" && (a.caste === "sc" || a.caste === "st" || a.caste === "obc"),
  },

  {
    id: "chandigarh_ladli_yojana",
    icon: "👧", color: "#EC4899", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Social Welfare", hi: "चंडीगढ़ प्रशासन — समाज कल्याण विभाग" },
    name:    { en: "Ladli Scheme (Chandigarh)",
               hi: "लाड़ली योजना (चंडीगढ़)" },
    benefit: { en: "₹21,000 total financial support for a girl child born in Chandigarh — ₹5,000 on birth, ₹2,000 on Class 1 admission, ₹3,000 on Class 6 admission, ₹4,000 on Class 9 admission, ₹5,000 on Class 12 admission, ₹2,000 on matriculation; for families with annual income below ₹2 lakh; encourages girl education and reduces school dropout",
               hi: "चंडीगढ़ में जन्मी बालिका के लिए कुल ₹21,000 वित्तीय सहायता — जन्म पर ₹5,000, कक्षा 1 में ₹2,000, कक्षा 6 में ₹3,000, कक्षा 9 में ₹4,000, कक्षा 12 में ₹5,000, मैट्रिकुलेशन पर ₹2,000; ₹2 लाख से कम वार्षिक आय वाले परिवारों के लिए; बालिका शिक्षा को प्रोत्साहित करती है" },
    tag:     { en: "Girl Child / Education", hi: "बालिका / शिक्षा" },
    annual: 0,
    apply:   { en: "Dept. of Social Welfare, UT Chandigarh / anganwadi centre at birth stage", hi: "समाज कल्याण विभाग, UT चंडीगढ़ / जन्म के समय आंगनवाड़ी केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (parent)", "Birth Certificate of girl child (issued by MC Chandigarh)", "Residence Proof (Chandigarh)", "Income Certificate (family income < ₹2 lakh/year)", "Bank Account (Aadhaar-linked, parent's name)", "School Admission Certificate (at each education stage)", "Passport Photos (parent + child)"],
               hi: ["आधार कार्ड (माता-पिता)", "बालिका का जन्म प्रमाण पत्र (MC चंडीगढ़ द्वारा जारी)", "निवास प्रमाण (चंडीगढ़)", "आय प्रमाण पत्र (पारिवारिक आय ₹2 लाख/वर्ष से कम)", "बैंक खाता (आधार-लिंक्ड, माता-पिता के नाम)", "विद्यालय प्रवेश प्रमाण पत्र (प्रत्येक शिक्षा चरण पर)", "पासपोर्ट फोटो (माता-पिता + बच्ची)"] },
    match: (a) => a.state === "Chandigarh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "chandigarh_chb_ews_housing",
    icon: "🏠", color: "#B45309", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh Housing Board (CHB)", hi: "चंडीगढ़ हाउसिंग बोर्ड (CHB)" },
    name:    { en: "CHB Affordable Housing — EWS / LIG Flats (Chandigarh)",
               hi: "CHB किफायती आवास — EWS / LIG फ्लैट (चंडीगढ़)" },
    benefit: { en: "Subsidised 1-BHK / 2-BHK flats for Economically Weaker Section (EWS) and Low Income Group (LIG) households in Chandigarh — flats allotted via draw of lots at below-market rates; EWS flats for family income up to ₹3 lakh/year; LIG flats for income up to ₹6 lakh/year; applicant must not own any residential property in Chandigarh/Panchkula/Mohali/SAS Nagar tricity",
               hi: "चंडीगढ़ में EWS और LIG परिवारों को सब्सिडाइज़्ड 1-BHK / 2-BHK फ्लैट — बाजार दर से कम पर लॉटरी के माध्यम से आवंटन; EWS फ्लैट परिवार आय ₹3 लाख/वर्ष तक के लिए; LIG फ्लैट ₹6 लाख/वर्ष तक के लिए; आवेदक के पास चंडीगढ़/पंचकुला/मोहाली/SAS नगर त्रि-शहर में कोई आवासीय संपत्ति नहीं होनी चाहिए" },
    tag:     { en: "Housing / EWS / LIG", hi: "आवास / EWS / LIG" },
    annual: 0,
    apply:   { en: "https://chbonline.in/schemes", hi: "chbonline.gov.in — खुली लॉटरी/योजना घोषणा के दौरान आवेदन करें" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Residence Proof (Chandigarh domicile — minimum 3 years)", "Income Certificate / Salary Slips / ITR (as applicable)", "PAN Card", "Self-declaration of no property ownership in tricity", "Bank Account details", "Passport Photo", "Marriage Certificate (if joint application)"],
               hi: ["आधार कार्ड", "निवास प्रमाण (चंडीगढ़ — न्यूनतम 3 वर्ष)", "आय प्रमाण पत्र / वेतन पर्ची / ITR (जैसा लागू हो)", "पैन कार्ड", "त्रि-शहर में संपत्ति न होने की स्व-घोषणा", "बैंक खाता विवरण", "पासपोर्ट फोटो", "विवाह प्रमाण पत्र (संयुक्त आवेदन के लिए)"] },
    match: (a) => a.state === "Chandigarh" && a.house === "no" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── FOOD / SUBSISTENCE ────────────────────────────────────────────────────

  {
    id: "chandigarh_annapurna_rasoi",
    icon: "🍱", color: "#15803D", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Food & Supplies", hi: "चंडीगढ़ प्रशासन — खाद्य एवं आपूर्ति विभाग" },
    name:    { en: "Annapurna Rasoi Yojana (Chandigarh)",
               hi: "अन्नपूर्णा रसोई योजना (चंडीगढ़)" },
    benefit: { en: "Subsidised nutritious meals — breakfast for ₹5 and full lunch/dinner for ₹10 — served from mobile canteens/vans at various locations across Chandigarh; targeted at daily wage workers, labourers, construction workers, slum residents and economically weaker sections; no registration required, walk-in service",
               hi: "सब्सिडाइज़्ड पौष्टिक भोजन — नाश्ता ₹5 और पूर्ण दोपहर/रात्रि भोज ₹10 — चंडीगढ़ में विभिन्न स्थानों पर मोबाइल कैंटीन/वैन से; दिहाड़ी मजदूरों, श्रमिकों, निर्माण मजदूरों, झुग्गी निवासियों और EWS के लिए; कोई पंजीकरण आवश्यक नहीं, वॉक-इन सेवा" },
    tag:     { en: "Food / Subsidised Meals", hi: "भोजन / सब्सिडाइज़्ड भोजन" },
    annual: 0,
    apply:   { en: "No application needed — walk-in service at designated Annapurna vans across Chandigarh", hi: "कोई आवेदन नहीं — चंडीगढ़ में निर्धारित अन्नपूर्णा वैनों पर वॉक-इन सेवा" }, applyType: "offline",
    docs:    { en: ["No documents required — available to anyone who visits the Annapurna van"],
               hi: ["कोई दस्तावेज़ आवश्यक नहीं — अन्नपूर्णा वैन पर आने वाले किसी भी व्यक्ति के लिए उपलब्ध"] },
    match: (a) => a.state === "Chandigarh" && ["below1","1to3"].includes(a.income),
  },

  // ── SKILL / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "chandigarh_skill_development",
    icon: "🛠️", color: "#D97706", scope: "state", state: "Chandigarh",
    ministry: { en: "Chandigarh UT Administration — Dept. of Technical Education & Industrial Training", hi: "चंडीगढ़ प्रशासन — तकनीकी शिक्षा एवं औद्योगिक प्रशिक्षण विभाग" },
    name:    { en: "Chandigarh Skill Development Mission (CSDM)",
               hi: "चंडीगढ़ कौशल विकास मिशन (CSDM)" },
    benefit: { en: "Free short-term skill training (3–6 months) in trades like electrician, plumbing, IT, beauty & wellness, retail, construction, hospitality, and healthcare for Chandigarh residents; training conducted at ITIs and empanelled training centres; placement assistance and job fairs organised post-training; stipend/allowance may be provided during training; certificates recognised by NCVT/NSDC",
               hi: "चंडीगढ़ निवासियों के लिए इलेक्ट्रीशियन, प्लंबिंग, IT, ब्यूटी एंड वेलनेस, रिटेल, निर्माण, आतिथ्य और स्वास्थ्य सेवा जैसे व्यवसायों में निःशुल्क अल्पकालिक कौशल प्रशिक्षण (3–6 माह); ITI और मान्यता प्राप्त प्रशिक्षण केंद्रों पर प्रशिक्षण; प्रशिक्षण के बाद प्लेसमेंट सहायता और रोजगार मेले; प्रशिक्षण के दौरान वजीफा/भत्ता; NCVT/NSDC द्वारा मान्यता प्राप्त प्रमाण पत्र" },
    tag:     { en: "Skill / Employment / Youth", hi: "कौशल / रोजगार / युवा" },
    annual: 0,
    apply:   { en: "chandigarh.gov.in/skill or nearest ITI, Chandigarh", hi: "chandigarh.gov.in/skill या निकटतम ITI, चंडीगढ़" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Residence Proof (Chandigarh domicile)", "Educational Certificates (as per course eligibility)", "Passport Photo", "Bank Account (Aadhaar-linked — for stipend)", "Mobile Number"],
               hi: ["आधार कार्ड", "निवास प्रमाण (चंडीगढ़)", "शैक्षिक प्रमाण पत्र (पाठ्यक्रम पात्रता के अनुसार)", "पासपोर्ट फोटो", "बैंक खाता (आधार-लिंक्ड — वजीफे के लिए)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Chandigarh" && (a.who === "student" || a.who === "general" || a.who === "women") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE CHANDIGARH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "chandigarh_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Chandigarh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Chandigarh",
  // },

];
