// Goa — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "goa_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const GOA_SCHEMES = [

  // ── WOMEN / HOMEMAKER ────────────────────────────────────────────────────

  {
    id: "goa_griha_aadhar",
    icon: "👩‍🍳", color: "#BE185D", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Women & Child Development", hi: "गोवा महिला एवं बाल विकास विभाग" },
    name:    { en: "Griha Aadhar Scheme (Goa)",
               hi: "गृह आधार योजना (गोवा)" },
    benefit: { en: "₹1,500/month (₹18,000/year) paid directly to the bank account of the homemaker/housewife in families with annual income ≤ ₹3 lakh; benefit revised periodically; Aadhaar-linked DBT; available to Goa domicile women who are not employed or self-employed",
               hi: "₹3 लाख तक वार्षिक आय वाले परिवारों की गृहिणी के बैंक खाते में ₹1,500/माह (₹18,000/वर्ष) सीधे DBT; लाभ समय-समय पर संशोधित; आधार-लिंक्ड; गोवा डोमिसाइल महिला जो नियोजित या स्वरोजगार में नहीं हैं" },
    tag:     { en: "Women / Homemaker Allowance", hi: "महिला / गृहिणी भत्ता" },
    annual: 18000,
    apply:   { en: "wcd.goa.gov.in / nearest Anganwadi or CDPOs office", hi: "wcd.goa.gov.in / निकटतम आंगनवाड़ी या CDPO कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (mandatory)", "Goa Domicile Certificate (15 years)", "Income Certificate (family income ≤ ₹3 lakh)", "Aadhaar-linked Bank Account passbook", "Marriage Certificate", "Proof of not being employed (self-declaration)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड (अनिवार्य)", "गोवा डोमिसाइल प्रमाण पत्र (15 वर्ष)", "आय प्रमाण पत्र (पारिवारिक आय ₹3 लाख तक)", "आधार-लिंक्ड बैंक पासबुक", "विवाह प्रमाण पत्र", "नियोजित न होने का स्व-घोषणा", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Goa" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "goa_ladli_laxmi",
    icon: "👧", color: "#DB2777", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Women & Child Development", hi: "गोवा महिला एवं बाल विकास विभाग" },
    name:    { en: "Ladli Laxmi Scheme (Goa)",
               hi: "लाडली लक्ष्मी योजना (गोवा)" },
    benefit: { en: "₹1,00,000 (₹1 lakh) financial assistance for a girl child on attaining age 18, provided she has completed Class 10 and remains unmarried; covers girls born on or after 1 April 2012 in families with annual income ≤ ₹3 lakh; amount deposited as fixed deposit at birth and released at maturity",
               hi: "18 वर्ष की आयु पर बालिका को ₹1,00,000 (₹1 लाख) वित्तीय सहायता, बशर्ते उसने कक्षा 10 पास की हो और अविवाहित हो; 1 अप्रैल 2012 के बाद जन्मी बालिकाएं पात्र; पारिवारिक आय ₹3 लाख तक; राशि जन्म पर FD में जमा, परिपक्वता पर जारी" },
    tag:     { en: "Women / Girl Child / Education", hi: "महिला / बालिका / शिक्षा" },
    annual: 0,
    apply:   { en: "wcd.goa.gov.in / ICDS / CDPOs office", hi: "wcd.goa.gov.in / ICDS / CDPO कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (child and parent)", "Birth Certificate of girl child", "Goa Domicile Certificate (parents)", "Income Certificate (≤ ₹3 lakh)", "Bank Account (child's/parent's)", "BPL Ration Card (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड (बच्चे और अभिभावक)", "बालिका का जन्म प्रमाण पत्र", "गोवा डोमिसाइल प्रमाण पत्र (माता-पिता)", "आय प्रमाण पत्र (₹3 लाख तक)", "बैंक खाता (बालिका/अभिभावक)", "BPL राशन कार्ड (यदि लागू)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Goa" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "goa_dsss_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Social Welfare", hi: "गोवा सामाजिक कल्याण विभाग" },
    name:    { en: "Dayanand Social Security Scheme — DSSS (Goa)",
               hi: "दयानंद सामाजिक सुरक्षा योजना — DSSS (गोवा)" },
    benefit: { en: "Monthly pension for vulnerable groups — Elderly (60–79 years): ₹2,000/month; Elderly (80+ years): ₹2,500/month; Widows: ₹2,000/month; Persons with Disability (40%+): ₹2,500/month; Destitute/Orphans: ₹2,000/month; paid directly to bank account; for Goa domicile residents with income below the prescribed threshold",
               hi: "कमजोर वर्गों को मासिक पेंशन — वृद्ध (60–79 वर्ष): ₹2,000/माह; वृद्ध (80+ वर्ष): ₹2,500/माह; विधवाएं: ₹2,000/माह; दिव्यांगजन (40%+): ₹2,500/माह; निराश्रित/अनाथ: ₹2,000/माह; सीधे बैंक खाते में; निर्धारित आय सीमा से कम आय वाले गोवा डोमिसाइल निवासियों के लिए" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 30000,
    apply:   { en: "socialwelfare.goa.gov.in / BDO / Mamlatdar office (offline)", hi: "socialwelfare.goa.gov.in / BDO / ममलतदार कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, issued by Medical Board) — for disabled", "Goa Domicile Certificate (15 years)", "Bank Account (Aadhaar-linked)", "Income Certificate", "Two Passport Photos", "BPL Card (if applicable)"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID) — वृद्ध के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवा के लिए", "दिव्यांगता प्रमाण पत्र (40%+, चिकित्सा बोर्ड से) — दिव्यांग के लिए", "गोवा डोमिसाइल प्रमाण पत्र (15 वर्ष)", "बैंक खाता (आधार-लिंक्ड)", "आय प्रमाण पत्र", "दो पासपोर्ट फोटो", "BPL कार्ड (यदि लागू)"] },
    match: (a) => a.state === "Goa" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "goa_post_matric_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Social Welfare / Tribal Welfare", hi: "गोवा सामाजिक कल्याण / जनजातीय कल्याण विभाग" },
    name:    { en: "Post-Matric Scholarship — SC/ST/OBC (Goa)",
               hi: "पोस्ट-मैट्रिक छात्रवृत्ति — SC/ST/OBC (गोवा)" },
    benefit: { en: "Full tuition fee reimbursement + maintenance allowance for SC/ST/OBC students pursuing Class 11 and above (including professional courses — Engineering, Medical, Law, MBA); maintenance allowance ₹300–₹1,200/month depending on course level and hosteller/day scholar status; central + state combined funding",
               hi: "SC/ST/OBC छात्रों को कक्षा 11 और उससे ऊपर (इंजीनियरिंग, चिकित्सा, कानून, MBA सहित) की पूर्ण ट्यूशन फीस प्रतिपूर्ति + रखरखाव भत्ता; रखरखाव भत्ता ₹300–₹1,200/माह (पाठ्यक्रम स्तर व हॉस्टलर/दिन-विद्वान के अनुसार); केंद्र + राज्य संयुक्त वित्त पोषण" },
    tag:     { en: "Student / SC-ST-OBC / Scholarship", hi: "छात्र / SC-ST-OBC / छात्रवृत्ति" },
    annual: 14400,
    apply:   { en: "scholarships.gov.in (National Scholarship Portal)", hi: "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST/OBC — issued by Goa govt.)", "Income Certificate (OBC: ≤ ₹2.5 lakh / SC/ST: ≤ ₹6 lakh)", "Class 10 Marksheet / Certificate", "Current Course Admission Proof / Fee Receipt", "Bank Account (student's, Aadhaar-linked)", "Goa Domicile Certificate", "Passport Photo", "Mobile Number & Email"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/OBC — गोवा सरकार द्वारा जारी)", "आय प्रमाण पत्र (OBC: ₹2.5 लाख तक / SC/ST: ₹6 लाख तक)", "कक्षा 10 अंकसूची / प्रमाण पत्र", "वर्तमान पाठ्यक्रम प्रवेश प्रमाण / फीस रसीद", "बैंक खाता (छात्र का, आधार-लिंक्ड)", "गोवा डोमिसाइल प्रमाण पत्र", "पासपोर्ट फोटो", "मोबाइल नंबर व ईमेल"] },
    match: (a) => a.state === "Goa" && a.who === "student" && ["sc","st","obc"].includes(a.caste),
  },

  {
    id: "goa_merit_scholarship",
    icon: "📚", color: "#1D4ED8", scope: "state", state: "Goa",
    ministry: { en: "Goa Directorate of Higher Education", hi: "गोवा उच्च शिक्षा निदेशालय" },
    name:    { en: "Goa Merit-cum-Means Scholarship",
               hi: "गोवा मेरिट-कम-मीन्स छात्रवृत्ति" },
    benefit: { en: "Financial assistance of ₹3,000–₹10,000/year for meritorious students from families with annual income ≤ ₹6 lakh pursuing graduation and post-graduation in Goa colleges; students with 60%+ marks in the qualifying exam are eligible; paid directly to student's Aadhaar-linked bank account",
               hi: "₹6 लाख तक वार्षिक आय वाले परिवारों के मेधावी छात्रों को गोवा के कॉलेजों में स्नातक व स्नातकोत्तर पाठ्यक्रम के लिए ₹3,000–₹10,000/वर्ष; अर्हक परीक्षा में 60%+ अंक आवश्यक; सीधे छात्र के आधार-लिंक्ड बैंक खाते में" },
    tag:     { en: "Student / Merit Scholarship", hi: "छात्र / मेरिट छात्रवृत्ति" },
    annual: 10000,
    apply:   { en: "dhegoa.gov.in / college principal's office", hi: "dhegoa.gov.in / कॉलेज प्राचार्य कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Class 12 / Graduation Marksheet (60%+ marks)", "Income Certificate (≤ ₹6 lakh)", "Goa Domicile Certificate", "Current Admission Proof / College ID", "Bank Account (student's, Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "कक्षा 12 / स्नातक अंकसूची (60%+ अंक)", "आय प्रमाण पत्र (₹6 लाख तक)", "गोवा डोमिसाइल प्रमाण पत्र", "वर्तमान प्रवेश प्रमाण / कॉलेज ID", "बैंक खाता (छात्र का, आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Goa" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "goa_krishi_input_subsidy",
    icon: "🌾", color: "#15803D", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Agriculture", hi: "गोवा कृषि विभाग" },
    name:    { en: "Goa Krishi Input Subsidy Scheme",
               hi: "गोवा कृषि इनपुट सब्सिडी योजना" },
    benefit: { en: "Input subsidies of up to 75% on certified seeds, fertilisers, bio-pesticides, and agricultural equipment for small and marginal farmers registered in Goa; direct benefit transfer to Aadhaar-linked bank accounts; drip/sprinkler irrigation installation at 50% subsidy; eligible farmers may also receive crop insurance under PMFBY at subsidised premium",
               hi: "गोवा में पंजीकृत छोटे व सीमांत किसानों को प्रमाणित बीज, उर्वरक, जैव-कीटनाशक और कृषि उपकरण पर 75% तक इनपुट सब्सिडी; आधार-लिंक्ड बैंक खाते में DBT; ड्रिप/स्प्रिंकलर सिंचाई पर 50% सब्सिडी; PMFBY के तहत रियायती प्रीमियम पर फसल बीमा भी उपलब्ध" },
    tag:     { en: "Farmer / Input Subsidy", hi: "किसान / इनपुट सब्सिडी" },
    annual: 0,
    apply:   { en: "agri.goa.gov.in / nearest Agriculture office", hi: "agri.goa.gov.in / निकटतम कृषि कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records / Form D or 7-12 Extract (Goa)", "Farmer Registration Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Caste Certificate (SC/ST for higher subsidy)", "Mobile Number"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / फॉर्म D या 7-12 उद्धरण (गोवा)", "किसान पंजीकरण प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST अधिक सब्सिडी के लिए)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Goa" && a.who === "farmer",
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "goa_housing_board_affordable",
    icon: "🏠", color: "#B45309", scope: "state", state: "Goa",
    ministry: { en: "Goa Housing Board / Dept. of Town & Country Planning", hi: "गोवा हाउसिंग बोर्ड / नगर एवं ग्राम नियोजन विभाग" },
    name:    { en: "Goa Housing Board — Affordable Housing Scheme",
               hi: "गोवा हाउसिंग बोर्ड — किफायती आवास योजना" },
    benefit: { en: "Subsidised flats/houses at below-market prices for EWS/LIG/MIG Goa domicile families; EWS units (up to 30 sqm) at concessional rates; eligible families may also avail PMAY-U credit-linked subsidy (₹1.5–2.67 lakh) additionally; allotment through lottery; priority to SC/ST/differently-abled/ex-servicemen",
               hi: "गोवा डोमिसाइल EWS/LIG/MIG परिवारों के लिए बाजार से कम कीमत पर सब्सिडी युक्त फ्लैट/घर; EWS इकाइयां (30 वर्गमीटर तक) रियायती दरों पर; PMAY-U क्रेडिट लिंक्ड सब्सिडी (₹1.5–2.67 लाख) भी उपलब्ध; लॉटरी द्वारा आवंटन; SC/ST/दिव्यांग/भूतपूर्व सैनिकों को प्राथमिकता" },
    tag:     { en: "Housing / EWS-LIG / Urban", hi: "आवास / EWS-LIG / शहरी" },
    annual: 0,
    apply:   { en: "https://leasewarehouse.in/blog/post_details/238", hi: "ghb.goa.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Goa Domicile Certificate (15 years)", "Income Certificate (EWS: ≤ ₹3 lakh / LIG: ₹3–6 lakh / MIG: ₹6–18 lakh)", "Proof of no existing pucca house anywhere in India", "PAN Card", "Bank Account (Aadhaar-linked)", "Caste Certificate (if SC/ST)", "Disability Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "गोवा डोमिसाइल प्रमाण पत्र (15 वर्ष)", "आय प्रमाण पत्र (EWS: ₹3 लाख तक / LIG: ₹3–6 लाख / MIG: ₹6–18 लाख)", "भारत में कहीं भी पक्का मकान न होने का प्रमाण", "PAN कार्ड", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (SC/ST के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Goa" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "goa_cm_rozgar_yojana",
    icon: "💼", color: "#0369A1", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Labour & Employment", hi: "गोवा श्रम एवं रोजगार विभाग" },
    name:    { en: "Chief Minister's Rozgar Yojana (Goa)",
               hi: "मुख्यमंत्री रोजगार योजना (गोवा)" },
    benefit: { en: "Subsidised loans of ₹10–25 lakh for Goa domicile youth (18–45 years) to start self-employment ventures; 30% capital subsidy (max ₹3 lakh) for general category; 40% subsidy for SC/ST/Women/differently-abled; repayable in 5–7 years; covers trade, service, and manufacturing sectors",
               hi: "गोवा डोमिसाइल युवाओं (18–45 वर्ष) को स्वरोजगार उद्यम शुरू करने के लिए ₹10–25 लाख तक सब्सिडी युक्त ऋण; सामान्य वर्ग के लिए 30% पूंजी सब्सिडी (अधिकतम ₹3 लाख); SC/ST/महिला/दिव्यांग के लिए 40%; 5–7 वर्षों में चुकाने योग्य; व्यापार, सेवा और विनिर्माण क्षेत्र शामिल" },
    tag:     { en: "Youth / Self-Employment / Loan", hi: "युवा / स्वरोजगार / ऋण" },
    annual: 0,
    apply:   { en: "labour.goa.gov.in / District Employment Exchange", hi: "labour.goa.gov.in / जिला रोजगार कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Goa Domicile Certificate (15 years)", "Age Proof (18–45 years)", "Educational Qualification Certificate", "Project Report / Business Plan", "Bank Account details", "Income Certificate (family)", "Caste Certificate (if SC/ST)", "Disability Certificate (if applicable)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "गोवा डोमिसाइल प्रमाण पत्र (15 वर्ष)", "आयु प्रमाण (18–45 वर्ष)", "शैक्षिक योग्यता प्रमाण पत्र", "प्रोजेक्ट रिपोर्ट / व्यापार योजना", "बैंक खाता विवरण", "आय प्रमाण पत्र (पारिवारिक)", "जाति प्रमाण पत्र (SC/ST के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Goa" && (a.who === "business" || a.who === "general") && ["18to35","35to60"].includes(a.age),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "goa_ddssy",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Goa",
    ministry: { en: "Goa Dept. of Health Services", hi: "गोवा स्वास्थ्य सेवा विभाग" },
    name:    { en: "Deen Dayal Swasthya Seva Yojana — DDSSY (Goa)",
               hi: "दीन दयाल स्वास्थ्य सेवा योजना — DDSSY (गोवा)" },
    benefit: { en: "Cashless medical treatment up to ₹2.5 lakh per family per year (₹4 lakh for chronic illnesses like cancer, heart disease, kidney failure) at all government and empanelled private hospitals in Goa; covers all Goa domicile families with annual income ≤ ₹8 lakh; family of 5 covered; pre-existing conditions included from day one; DDSSY card issued",
               hi: "गोवा के सभी सरकारी और सूचीबद्ध निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹2.5 लाख तक कैशलेस चिकित्सा (कैंसर/हृदय/किडनी जैसी गंभीर बीमारियों के लिए ₹4 लाख); वार्षिक आय ₹8 लाख तक सभी गोवा डोमिसाइल परिवारों के लिए; 5 सदस्यों का परिवार; पहले दिन से पूर्व-मौजूदा बीमारियां भी; DDSSY कार्ड जारी" },
    tag:     { en: "Health / Cashless Treatment", hi: "स्वास्थ्य / कैशलेस उपचार" },
    annual: 250000,
    apply:   { en: "goahealth.gov.in / nearest government hospital / Mamlatdar office", hi: "goahealth.gov.in / निकटतम सरकारी अस्पताल / ममलतदार कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (all family members)", "Goa Domicile Certificate (15 years)", "Income Certificate (≤ ₹8 lakh)", "Ration Card / Voter ID (family proof)", "Passport Photos (all family members)", "Mobile Number"],
               hi: ["आधार कार्ड (सभी परिवार के सदस्य)", "गोवा डोमिसाइल प्रमाण पत्र (15 वर्ष)", "आय प्रमाण पत्र (₹8 लाख तक)", "राशन कार्ड / मतदाता ID (पारिवारिक प्रमाण)", "पासपोर्ट फोटो (सभी परिवार के सदस्य)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Goa" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE GOA SCHEMES ABOVE THIS LINE
  // {
  //   id: "goa_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Goa",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Goa",
  // },

];
