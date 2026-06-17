// Jammu & Kashmir — YojanaSetu UT Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "jk_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const JAMMU_KASHMIR_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "jk_kisan_samman",
    icon: "🌾", color: "#15803D", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Agriculture, Production & Farmers' Welfare", hi: "जम्मू-कश्मीर कृषि, उत्पादन एवं किसान कल्याण विभाग" },
    name:    { en: "J&K Kisan Samman — State Top-Up on PM-KISAN",
               hi: "जम्मू-कश्मीर किसान सम्मान — PM-KISAN पर राज्य टॉप-अप" },
    benefit: { en: "₹4,000/year additional top-up paid by J&K UT administration over and above the central PM-KISAN ₹6,000/year — total effective income support ₹10,000/year for eligible small and marginal farmers; paid in two instalments of ₹2,000 directly to Aadhaar-linked bank account; for farmers with cultivable land up to 2 hectares registered in J&K land records",
               hi: "केंद्रीय PM-KISAN ₹6,000/वर्ष के अतिरिक्त J&K UT प्रशासन द्वारा ₹4,000/वर्ष अतिरिक्त टॉप-अप — पात्र छोटे व सीमांत किसानों के लिए कुल प्रभावी आय सहायता ₹10,000/वर्ष; ₹2,000–₹2,000 दो किस्तों में आधार-लिंक्ड बैंक खाते में; J&K भूमि अभिलेखों में दर्ज 2 हेक्टेयर तक की कृषि भूमि वाले किसानों के लिए" },
    tag:     { en: "Farmer / Income Support", hi: "किसान / आय सहायता" },
    annual: 10000,
    apply:   { en: "https://agriJK.nic.in", hi: "agriJK.nic.in / निकटतम कृषि विस्तार अधिकारी या जन सेवा केंद्र (CSC)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Girdawari / Jamabandi (J&K)", "Farmer Registration on PM-KISAN Portal", "Bank Account (Aadhaar-linked)", "Mobile Number (Aadhaar-linked)", "Domicile Certificate (J&K)"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / गिरदावरी / जमाबंदी (J&K)", "PM-KISAN पोर्टल पर किसान पंजीकरण", "बैंक खाता (आधार-लिंक्ड)", "मोबाइल नंबर (आधार-लिंक्ड)", "अधिवास प्रमाण पत्र (J&K)"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "farmer",
  },

  {
    id: "jk_apple_mission",
    icon: "🍎", color: "#DC2626", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Horticulture Dept. — High Density Plantation Mission", hi: "जम्मू-कश्मीर बागवानी विभाग — उच्च घनत्व रोपण मिशन" },
    name:    { en: "J&K High Density Apple Plantation Mission",
               hi: "जम्मू-कश्मीर उच्च घनत्व सेब रोपण मिशन" },
    benefit: { en: "75% subsidy on cost of high-density apple saplings, trellis system, drip irrigation, and anti-hail nets under the Mission for Integrated Development of Horticulture (MIDH); additional 50% subsidy on cold storage infrastructure; average subsidy payout ₹1.5–3 lakh per hectare depending on orchard density; free technical training and soil testing for registered horticulture farmers in J&K",
               hi: "MIDH के तहत उच्च घनत्व सेब पौधों, ट्रेलिस सिस्टम, ड्रिप सिंचाई और एंटी-हेल नेट की लागत पर 75% सब्सिडी; शीत भंडारण अवसंरचना पर 50% अतिरिक्त सब्सिडी; बगीचे के घनत्व के आधार पर औसत ₹1.5–3 लाख प्रति हेक्टेयर; J&K में पंजीकृत बागवानी किसानों के लिए निःशुल्क तकनीकी प्रशिक्षण और मिट्टी परीक्षण" },
    tag:     { en: "Farmer / Horticulture / Subsidy", hi: "किसान / बागवानी / सब्सिडी" },
    annual: 0,
    apply:   { en: "https://jkhorticulture.nic.in", hi: "jkhorticulture.nic.in / निकटतम जिला बागवानी अधिकारी (DHO)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Girdawari (proof of horticulture land)", "Domicile Certificate (J&K)", "Bank Account (Aadhaar-linked)", "Kisan Credit Card (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / गिरदावरी (बागवानी भूमि का प्रमाण)", "अधिवास प्रमाण पत्र (J&K)", "बैंक खाता (आधार-लिंक्ड)", "किसान क्रेडिट कार्ड (यदि लागू हो)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "farmer",
  },

  {
    id: "jk_crop_insurance",
    icon: "🌱", color: "#78350F", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Agriculture — PMFBY Cell", hi: "जम्मू-कश्मीर कृषि विभाग — PMFBY सेल" },
    name:    { en: "Pradhan Mantri Fasal Bima Yojana — J&K (PMFBY)",
               hi: "प्रधानमंत्री फसल बीमा योजना — J&K (PMFBY)" },
    benefit: { en: "Crop insurance at just 1.5% premium for Rabi crops and 2% for Kharif crops (rest borne by J&K UT and Central Govt.); full sum insured paid on crop loss due to drought, flood, hailstorm, pest, or disease; sum insured calculated on district-level average yield; J&K UT also provides additional 2% premium subsidy over the central share making it nearly free for small farmers; swift claim settlement via satellite/technology-based yield assessment",
               hi: "रबी फसलों के लिए मात्र 1.5% और खरीफ फसलों के लिए 2% प्रीमियम पर फसल बीमा (शेष J&K UT और केंद्र सरकार वहन करती है); सूखा, बाढ़, ओलावृष्टि, कीट या रोग से फसल हानि पर पूरी बीमित राशि; जिला-स्तरीय औसत उपज पर बीमित राशि; J&K UT केंद्रीय हिस्से पर 2% अतिरिक्त प्रीमियम सब्सिडी भी देती है जिससे छोटे किसानों के लिए यह लगभग निःशुल्क; उपग्रह/प्रौद्योगिकी आधारित उपज आकलन से त्वरित दावा निपटान" },
    tag:     { en: "Farmer / Crop Insurance", hi: "किसान / फसल बीमा" },
    annual: 0,
    apply:   { en: "https://pmfby.gov.in", hi: "pmfby.gov.in / निकटतम बैंक या जन सेवा केंद्र (CSC)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Girdawari / Khasra (sowing details)", "Bank Account (Aadhaar-linked)", "Sowing Certificate from Patwari", "Kisan Credit Card (if applicable)", "Mobile Number"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / गिरदावरी / खसरा (बुवाई विवरण)", "बैंक खाता (आधार-लिंक्ड)", "पटवारी से बुवाई प्रमाण पत्र", "किसान क्रेडिट कार्ड (यदि लागू हो)", "मोबाइल नंबर"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "jk_tejaswini",
    icon: "👩‍💼", color: "#9333EA", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Mission Shakti / Rural Development Dept.", hi: "जम्मू-कश्मीर मिशन शक्ति / ग्रामीण विकास विभाग" },
    name:    { en: "Tejaswini — J&K Women SHG Empowerment Scheme",
               hi: "तेजस्विनी — J&K महिला SHG सशक्तिकरण योजना" },
    benefit: { en: "Interest-free loans up to ₹5 lakh for women SHG members; seed money of ₹15,000 per new SHG; revolving fund support; skill training in handicrafts (pashmina weaving, carpet making, willow wicker), food processing, and agro-based enterprises; market linkage via J&K Handicrafts Emporium and online platforms; NRLM-backed community investment fund of ₹2.5 lakh per village organisation",
               hi: "महिला SHG सदस्यों को ₹5 लाख तक ब्याज-मुक्त ऋण; प्रत्येक नए SHG के लिए ₹15,000 बीज राशि; रिवॉल्विंग फंड सहायता; हस्तशिल्प (पश्मीना बुनाई, कालीन निर्माण, विलो विकर), खाद्य प्रसंस्करण और कृषि उद्यमों में कौशल प्रशिक्षण; J&K हस्तशिल्प एम्पोरियम और ऑनलाइन प्लेटफॉर्म के माध्यम से बाजार संपर्क; NRLM-समर्थित प्रति ग्राम संगठन ₹2.5 लाख सामुदायिक निवेश निधि" },
    tag:     { en: "Women / SHG / Entrepreneurship", hi: "महिला / SHG / उद्यमिता" },
    annual: 0,
    apply:   { en: "https://jkrlm.nic.in", hi: "jkrlm.nic.in / खंड विकास अधिकारी (BDO) कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SHG Registration Certificate / SHG passbook", "Bank Account (SHG account, Aadhaar-linked)", "Domicile Certificate (J&K)", "Passport Photo", "Business plan / Project report (for loans above ₹1 lakh)"],
               hi: ["आधार कार्ड", "SHG पंजीकरण प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG खाता, आधार-लिंक्ड)", "अधिवास प्रमाण पत्र (J&K)", "पासपोर्ट फोटो", "व्यवसाय योजना / परियोजना रिपोर्ट (₹1 लाख से अधिक ऋण के लिए)"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "women",
  },

  {
    id: "jk_ladli_beti",
    icon: "👧", color: "#EC4899", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Social Welfare", hi: "जम्मू-कश्मीर समाज कल्याण विभाग" },
    name:    { en: "Ladli Beti Scheme (J&K)",
               hi: "लाड़ली बेटी योजना (जम्मू-कश्मीर)" },
    benefit: { en: "₹1,000/month deposited by J&K Government in a fixed deposit in the name of a girl child from birth until she turns 21 — total government corpus of ₹2.52 lakh with compounded interest estimated to reach ₹6.5 lakh at maturity; girl receives the full matured amount at age 21; for families with annual income below ₹75,000; also covers girls born to migrant Kashmiri Pandits",
               hi: "जम्मू-कश्मीर सरकार द्वारा बालिका के नाम पर जन्म से 21 वर्ष तक प्रतिमाह ₹1,000 सावधि जमा — कुल सरकारी जमा ₹2.52 लाख जो चक्रवृद्धि ब्याज सहित परिपक्वता पर अनुमानित ₹6.5 लाख; बालिका को 21 वर्ष की आयु पर पूरी परिपक्व राशि; ₹75,000 से कम वार्षिक आय वाले परिवारों के लिए; प्रवासी कश्मीरी पंडित परिवारों की बेटियां भी पात्र" },
    tag:     { en: "Girl Child / Financial Security", hi: "बालिका / वित्तीय सुरक्षा" },
    annual: 12000,
    apply:   { en: "Dept. of Social Welfare, J&K / District Social Welfare Officer (offline)", hi: "समाज कल्याण विभाग, J&K / जिला समाज कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (parent)", "Birth Certificate of girl child", "Domicile Certificate (J&K)", "Income Certificate (family income < ₹75,000/year)", "Bank Account (in girl's name, Aadhaar-linked)", "Passport Photos (parent + child)", "BPL Ration Card (if applicable)"],
               hi: ["आधार कार्ड (माता-पिता)", "बालिका का जन्म प्रमाण पत्र", "अधिवास प्रमाण पत्र (J&K)", "आय प्रमाण पत्र (पारिवारिक आय ₹75,000/वर्ष से कम)", "बैंक खाता (बालिका के नाम, आधार-लिंक्ड)", "पासपोर्ट फोटो (माता-पिता + बच्ची)", "BPL राशन कार्ड (यदि लागू हो)"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "jk_old_age_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Social Welfare", hi: "जम्मू-कश्मीर समाज कल्याण विभाग" },
    name:    { en: "Old Age Pension Scheme (J&K)",
               hi: "वृद्धावस्था पेंशन योजना (जम्मू-कश्मीर)" },
    benefit: { en: "₹1,000/month pension for senior citizens aged 60 years and above who are destitute or BPL; ₹1,500/month for those aged 80 years and above; paid via DBT directly to Aadhaar-linked bank account; for J&K domicile holders with no other government pension; ~3.5 lakh beneficiaries across J&K; enhanced under NSAP + UT top-up",
               hi: "60 वर्ष और उससे अधिक आयु के देstitute या BPL वरिष्ठ नागरिकों को ₹1,000/माह पेंशन; 80 वर्ष और उससे अधिक के लिए ₹1,500/माह; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; किसी अन्य सरकारी पेंशन के बिना J&K अधिवास धारकों के लिए; J&K में ~3.5 लाख लाभार्थी; NSAP + UT टॉप-अप के तहत बढ़ाई गई" },
    tag:     { en: "Senior Citizen / Pension", hi: "वरिष्ठ नागरिक / पेंशन" },
    annual: 12000,
    apply:   { en: "jksocialwelfare.nic.in / District Social Welfare Officer (offline)", hi: "jksocialwelfare.nic.in / जिला समाज कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID / School Certificate)", "Domicile Certificate (J&K)", "BPL Ration Card or Destitution Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo", "Self-declaration of no other pension"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID / विद्यालय प्रमाण पत्र)", "अधिवास प्रमाण पत्र (J&K)", "BPL राशन कार्ड या देstitution प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो", "किसी अन्य पेंशन का न होने की स्व-घोषणा"] },
    match: (a) => a.state === "Jammu & Kashmir" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "jk_widow_pension",
    icon: "👩", color: "#BE185D", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Social Welfare", hi: "जम्मू-कश्मीर समाज कल्याण विभाग" },
    name:    { en: "Widow Pension Scheme (J&K)",
               hi: "विधवा पेंशन योजना (जम्मू-कश्मीर)" },
    benefit: { en: "₹1,000/month financial assistance for widows aged 18 years and above who are destitute or BPL; paid via DBT to Aadhaar-linked bank account; for J&K domicile holders; includes widows of militants/terrorists and ex-servicemen who do not receive any government pension elsewhere; over 1.5 lakh beneficiaries in J&K",
               hi: "18 वर्ष और उससे अधिक आयु की destitute या BPL विधवाओं को ₹1,000/माह वित्तीय सहायता; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; J&K अधिवास धारकों के लिए; आतंकवादी/उग्रवादी विधवाएं और पूर्व-सैनिक विधवाएं जिन्हें अन्यत्र कोई सरकारी पेंशन नहीं मिलती, वे भी पात्र; J&K में 1.5 लाख से अधिक लाभार्थी" },
    tag:     { en: "Women / Widow / Pension", hi: "महिला / विधवा / पेंशन" },
    annual: 12000,
    apply:   { en: "jksocialwelfare.nic.in / District Social Welfare Officer (offline)", hi: "jksocialwelfare.nic.in / जिला समाज कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Marriage Certificate", "Domicile Certificate (J&K)", "BPL Ration Card or Income Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "विवाह प्रमाण पत्र", "अधिवास प्रमाण पत्र (J&K)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "jk_disability_pension",
    icon: "♿", color: "#0891B2", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Social Welfare", hi: "जम्मू-कश्मीर समाज कल्याण विभाग" },
    name:    { en: "Disability Pension Scheme (J&K)",
               hi: "दिव्यांगजन पेंशन योजना (जम्मू-कश्मीर)" },
    benefit: { en: "₹1,000/month pension for persons with 40% or more disability (locomotor, visual, hearing, speech, mental illness, intellectual) who are destitute or BPL; paid via DBT to Aadhaar-linked bank account; for J&K domicile holders; disability certificate from the Chief Medical Officer (CMO) / Medical Board is mandatory",
               hi: "40% या उससे अधिक दिव्यांगता (गतिशीलता, दृष्टि, श्रवण, वाणी, मानसिक बीमारी, बौद्धिक) वाले destitute या BPL व्यक्तियों को ₹1,000/माह पेंशन; DBT के माध्यम से आधार-लिंक्ड बैंक खाते में; J&K अधिवास धारकों के लिए; मुख्य चिकित्सा अधिकारी (CMO) / मेडिकल बोर्ड से दिव्यांगता प्रमाण पत्र अनिवार्य" },
    tag:     { en: "Disabled / Pension", hi: "दिव्यांग / पेंशन" },
    annual: 12000,
    apply:   { en: "jksocialwelfare.nic.in / District Social Welfare Officer (offline)", hi: "jksocialwelfare.nic.in / जिला समाज कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ — issued by CMO / Medical Board, J&K)", "Domicile Certificate (J&K)", "BPL Ration Card or Income Certificate", "Bank Account Passbook (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+ — CMO / मेडिकल बोर्ड, J&K द्वारा जारी)", "अधिवास प्रमाण पत्र (J&K)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक पासबुक (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "disabled" && ["below1","1to3"].includes(a.income),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "jk_sehat_health_insurance",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Health & Medical Education — SEHAT Scheme", hi: "जम्मू-कश्मीर स्वास्थ्य एवं चिकित्सा शिक्षा विभाग — SEHAT योजना" },
    name:    { en: "SEHAT — Social Endeavour for Health & Telemedicine (J&K)",
               hi: "SEHAT — सामाजिक स्वास्थ्य एवं टेलीमेडिसिन प्रयास (जम्मू-कश्मीर)" },
    benefit: { en: "₹5 lakh cashless health insurance per family per year for ALL J&K domicile holders — unique in being universal (not limited to BPL); covers hospitalisations, surgeries, cancer, cardiac care, dialysis, orthopaedic procedures and 1,500+ medical packages at empanelled government and private hospitals across India; includes ₹1,500 transport allowance per hospitalisation; also covers pre-existing diseases from day 1; launched by PM Modi in 2020 as extension of Ayushman Bharat",
               hi: "सभी J&K अधिवास धारकों के लिए प्रति परिवार प्रति वर्ष ₹5 लाख कैशलेस स्वास्थ्य बीमा — यह सार्वभौमिक होने में अनोखा है (BPL तक सीमित नहीं); पूरे भारत में सूचीबद्ध सरकारी और निजी अस्पतालों में अस्पताल भर्ती, सर्जरी, कैंसर, हृदय देखभाल, डायलिसिस, आर्थोपेडिक प्रक्रियाएं और 1,500+ चिकित्सा पैकेज; प्रति अस्पताल भर्ती ₹1,500 परिवहन भत्ता; पहले दिन से पूर्व-मौजूदा बीमारियां कवर; 2020 में PM मोदी द्वारा आयुष्मान भारत के विस्तार के रूप में शुरू" },
    tag:     { en: "Health / Universal Insurance", hi: "स्वास्थ्य / सार्वभौमिक बीमा" },
    annual: 500000,
    apply:   { en: "https://sehatjk.gov.in", hi: "sehatjk.gov.in / निकटतम आयुष्मान भारत सूचीबद्ध अस्पताल या जन सेवा केंद्र (CSC)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (mandatory — scheme is Aadhaar-seeded)", "Domicile Certificate (J&K)", "SEHAT / Ayushman Card (generated on portal)", "Family composition details (Aadhaar of all members)"],
               hi: ["आधार कार्ड (अनिवार्य — योजना आधार-सीडेड है)", "अधिवास प्रमाण पत्र (J&K)", "SEHAT / आयुष्मान कार्ड (पोर्टल पर बना)", "परिवार संरचना विवरण (सभी सदस्यों का आधार)"] },
    match: (a) => a.state === "Jammu & Kashmir",
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "jk_super75_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of School Education — JKBOSE", hi: "जम्मू-कश्मीर स्कूल शिक्षा विभाग — JKBOSE" },
    name:    { en: "J&K Super-75 Scholarship Scheme",
               hi: "जम्मू-कश्मीर सुपर-75 छात्रवृत्ति योजना" },
    benefit: { en: "Full fee waiver + ₹1,000/month stipend for top 75 meritorious students from each district of J&K who pass Class 10 with 75%+ marks and secure admission in government degree colleges; additionally, J&K's Prime Minister's Special Scholarship Scheme (PMSSS) provides ₹30,000/year academic allowance + ₹1 lakh/year maintenance for students from J&K studying professional and technical courses in institutions outside J&K",
               hi: "J&K के प्रत्येक जिले से कक्षा 10 में 75%+ अंकों के साथ उत्तीर्ण और सरकारी डिग्री कॉलेजों में प्रवेश लेने वाले शीर्ष 75 मेधावी छात्रों के लिए पूर्ण शुल्क माफी + ₹1,000/माह वजीफा; इसके अतिरिक्त, J&K का प्रधानमंत्री विशेष छात्रवृत्ति योजना (PMSSS) J&K से बाहर संस्थानों में व्यावसायिक व तकनीकी पाठ्यक्रम करने वाले छात्रों को ₹30,000/वर्ष शैक्षणिक भत्ता + ₹1 लाख/वर्ष रखरखाव प्रदान करती है" },
    tag:     { en: "Student / Merit Scholarship", hi: "छात्र / मेरिट छात्रवृत्ति" },
    annual: 142000,
    apply:   { en: "https://www.india.gov.in/services/details/apply-for-post-matric-scholarship-scheme-jammu-and-kashmir", hi: "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल) / JKBOSE पोर्टल / PMSSS के लिए AICTE पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 10 / 12 Marksheet (JKBOSE)", "Domicile Certificate (J&K — mandatory for PMSSS)", "Income Certificate (family income < ₹8 lakh for PMSSS)", "Admission Letter from college/university", "Bank Account (Aadhaar-linked, student's name)", "Passport Photo", "Caste Certificate (if SC/ST/OBC)"],
               hi: ["आधार कार्ड", "कक्षा 10 / 12 अंकसूची (JKBOSE)", "अधिवास प्रमाण पत्र (J&K — PMSSS के लिए अनिवार्य)", "आय प्रमाण पत्र (PMSSS के लिए पारिवारिक आय ₹8 लाख से कम)", "कॉलेज/विश्वविद्यालय से प्रवेश पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST/OBC के लिए)"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "student",
  },

  {
    id: "jk_post_matric_sc_st",
    icon: "📚", color: "#0369A1", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Dept. of Social Welfare — SC/ST/OBC Cell", hi: "जम्मू-कश्मीर समाज कल्याण विभाग — SC/ST/OBC सेल" },
    name:    { en: "Post Matric Scholarship — SC / ST / OBC (J&K)",
               hi: "पोस्ट मैट्रिक छात्रवृत्ति — SC / ST / OBC (जम्मू-कश्मीर)" },
    benefit: { en: "Full tuition fee reimbursement + maintenance allowance for SC/ST/OBC students of J&K studying in Class 11 and above — maintenance allowance ranges from ₹300–1,200/month depending on course level and hostel/day-scholar status; for SC/ST students with family income up to ₹2.5 lakh and OBC students with income up to ₹1.5 lakh; over 1.2 lakh students covered annually in J&K",
               hi: "कक्षा 11 और उससे ऊपर पढ़ने वाले J&K के SC/ST/OBC छात्रों के लिए पूर्ण ट्यूशन शुल्क प्रतिपूर्ति + रखरखाव भत्ता — पाठ्यक्रम स्तर और छात्रावास/दिवा-छात्र स्थिति के आधार पर ₹300–1,200/माह; SC/ST छात्रों के लिए ₹2.5 लाख और OBC के लिए ₹1.5 लाख तक की पारिवारिक आय; J&K में सालाना 1.2 लाख से अधिक छात्र लाभार्थी" },
    tag:     { en: "Student / SC-ST-OBC / Scholarship", hi: "छात्र / SC-ST-OBC / छात्रवृत्ति" },
    annual: 14400,
    apply:   { en: "https://oasis.wb.gov.in", hi: "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल) — समय-सीमा से पहले प्रत्येक वर्ष आवेदन करें" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC / ST / OBC — issued in J&K)", "Previous Marksheet (Class 10 / last qualifying exam)", "Income Certificate (< ₹2.5 lakh for SC/ST, < ₹1.5 lakh for OBC)", "Bonafide Certificate from institution", "Bank Account (Aadhaar-linked, student's name)", "Domicile Certificate (J&K)", "Admission Receipt / Fee receipt"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC / ST / OBC — J&K में जारी)", "पिछली अंकसूची (कक्षा 10 / अंतिम योग्यता परीक्षा)", "आय प्रमाण पत्र (SC/ST के लिए ₹2.5 लाख, OBC के लिए ₹1.5 लाख से कम)", "संस्थान से बोनाफाइड प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, छात्र के नाम)", "अधिवास प्रमाण पत्र (J&K)", "प्रवेश रसीद / शुल्क रसीद"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.who === "student" && (a.caste === "sc" || a.caste === "st" || a.caste === "obc"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "jk_pmay_rural",
    icon: "🏠", color: "#B45309", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Rural Development Dept. — PMAY-G Cell", hi: "जम्मू-कश्मीर ग्रामीण विकास विभाग — PMAY-G सेल" },
    name:    { en: "PMAY-Gramin — J&K Enhanced Housing Assistance",
               hi: "PMAY-ग्रामीण — जम्मू-कश्मीर उन्नत आवास सहायता" },
    benefit: { en: "₹1.30 lakh financial assistance for construction of pucca houses for BPL rural households in J&K (higher than plains rate of ₹1.20 lakh as J&K is classified as hilly/difficult terrain); 90 person-days of MGNREGS unskilled labour wages additionally provided; must include toilet (SBM-linked); J&K UT also provides ₹50,000 additional top-up from UT funds for Scheduled Tribe households; payment in 3 geo-tagged instalments",
               hi: "J&K के BPL ग्रामीण परिवारों के लिए पक्के मकान निर्माण हेतु ₹1.30 लाख वित्तीय सहायता (मैदानी दर ₹1.20 लाख से अधिक क्योंकि J&K पहाड़ी/कठिन भूभाग में वर्गीकृत है); अतिरिक्त 90 व्यक्ति-दिवस MGNREGS अकुशल श्रम मजदूरी; शौचालय अनिवार्य (SBM-लिंक्ड); J&K UT अनुसूचित जनजाति परिवारों को UT निधि से ₹50,000 अतिरिक्त टॉप-अप भी देती है; 3 जियो-टैग किस्तों में भुगतान" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 0,
    apply:   { en: "pmayg.nic.in / Block Development Officer (BDO) / Gram Panchayat office", hi: "pmayg.nic.in / खंड विकास अधिकारी (BDO) / ग्राम पंचायत कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card / Awaas+ Survey registration", "Land Records / Ownership Patta (J&K)", "Bank Account (Aadhaar-linked)", "Domicile Certificate (J&K)", "Passport Photo", "Caste Certificate (for ST top-up)", "Geo-tagged photograph of house site"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड / आवास+ सर्वे पंजीकरण", "भूमि अभिलेख / स्वामित्व पट्टा (J&K)", "बैंक खाता (आधार-लिंक्ड)", "अधिवास प्रमाण पत्र (J&K)", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (ST टॉप-अप के लिए)", "मकान स्थल की जियो-टैग तस्वीर"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.area === "rural" && a.house === "no" && ["below1","1to3"].includes(a.income),
  },

  // ── SKILL / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "jk_himayat",
    icon: "🛠️", color: "#D97706", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Rural Development Dept. — HIMAYAT (MoRD)", hi: "जम्मू-कश्मीर ग्रामीण विकास विभाग — हिमायत (MoRD)" },
    name:    { en: "HIMAYAT — Skill & Placement Programme (J&K)",
               hi: "हिमायत — कौशल एवं नियोजन कार्यक्रम (जम्मू-कश्मीर)" },
    benefit: { en: "Free skill training of 3–12 months for J&K youth aged 15–35 in 40+ trades — IT/ITeS, banking, retail, hospitality, beauty & wellness, electronics, construction, healthcare, and tourism; 100% training cost borne by government; ₹1,000–2,500/month stipend during training; post-training placement support with minimum ₹10,000/month salary guaranteed; special focus on youth from militancy-affected districts; training conducted at empanelled institutes across India",
               hi: "40+ व्यवसायों में 15–35 वर्ष के J&K युवाओं के लिए 3–12 माह का निःशुल्क कौशल प्रशिक्षण — IT/ITeS, बैंकिंग, रिटेल, आतिथ्य, ब्यूटी एंड वेलनेस, इलेक्ट्रॉनिक्स, निर्माण, स्वास्थ्य सेवा और पर्यटन; 100% प्रशिक्षण लागत सरकार वहन करती है; प्रशिक्षण के दौरान ₹1,000–2,500/माह वजीफा; प्रशिक्षण के बाद न्यूनतम ₹10,000/माह वेतन गारंटी के साथ प्लेसमेंट सहायता; उग्रवाद प्रभावित जिलों के युवाओं पर विशेष ध्यान; पूरे भारत में मान्यता प्राप्त संस्थानों में प्रशिक्षण" },
    tag:     { en: "Skill / Employment / Youth", hi: "कौशल / रोजगार / युवा" },
    annual: 0,
    apply:   { en: "https://jkhimayat.nic.in", hi: "jkhimayat.nic.in / जिला रोजगार एवं परामर्श केंद्र (DECC), J&K" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (J&K)", "Educational Certificates (as per trade eligibility)", "Bank Account (Aadhaar-linked — for stipend)", "Passport Photo", "Mobile Number", "Income Certificate (for priority allocation in affected districts)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (J&K)", "शैक्षिक प्रमाण पत्र (व्यवसाय पात्रता के अनुसार)", "बैंक खाता (आधार-लिंक्ड — वजीफे के लिए)", "पासपोर्ट फोटो", "मोबाइल नंबर", "आय प्रमाण पत्र (प्रभावित जिलों में प्राथमिकता आवंटन के लिए)"] },
    match: (a) => a.state === "Jammu & Kashmir" && (a.who === "student" || a.who === "general") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── BACK-TO-VILLAGE / RURAL ───────────────────────────────────────────────

  {
    id: "jk_back_to_village",
    icon: "🏡", color: "#1D4ED8", scope: "state", state: "Jammu & Kashmir",
    ministry: { en: "J&K Govt. — Back to Village Programme (B2V)", hi: "जम्मू-कश्मीर सरकार — बैक टू विलेज कार्यक्रम (B2V)" },
    name:    { en: "Back to Village Programme — Saturation of Entitlements (J&K)",
               hi: "बैक टू विलेज कार्यक्रम — हकदारियों की संतृप्ति (जम्मू-कश्मीर)" },
    benefit: { en: "Government officers visit every panchayat to ensure 100% saturation of all central and UT welfare schemes — BPL ration cards, PM-KISAN, Ayushman/SEHAT, PMAY, scholarship, pension — to eligible residents on the spot; on-site Aadhaar seeding, account opening, and document correction done free of charge; grievances resolved within 30 days; specifically designed to reach remote villages of J&K including border areas",
               hi: "सरकारी अधिकारी प्रत्येक पंचायत का दौरा करके सभी केंद्रीय और UT कल्याण योजनाओं — BPL राशन कार्ड, PM-KISAN, आयुष्मान/SEHAT, PMAY, छात्रवृत्ति, पेंशन — का पात्र निवासियों को मौके पर 100% संतृप्ति सुनिश्चित करते हैं; मौके पर आधार सीडिंग, खाता खोलना और दस्तावेज़ सुधार निःशुल्क; 30 दिनों के भीतर शिकायत निवारण; विशेष रूप से सीमावर्ती क्षेत्रों सहित J&K के दूरदराज गांवों तक पहुंचने के लिए डिजाइन किया गया" },
    tag:     { en: "Rural / Governance / Entitlements", hi: "ग्रामीण / शासन / हकदारियां" },
    annual: 0,
    apply:   { en: "No separate application — officers visit villages; contact Block Development Officer (BDO) or Sarpanch for schedule", hi: "कोई अलग आवेदन नहीं — अधिकारी गांवों में जाते हैं; कार्यक्रम के लिए खंड विकास अधिकारी (BDO) या सरपंच से संपर्क करें" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (J&K)", "Any existing entitlement documents for verification/correction"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (J&K)", "सत्यापन/सुधार के लिए कोई भी मौजूदा हकदारी दस्तावेज़"] },
    match: (a) => a.state === "Jammu & Kashmir" && a.area === "rural",
  },

  // ADD MORE J&K SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "jk_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Jammu & Kashmir",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Jammu & Kashmir",
  // },

];
