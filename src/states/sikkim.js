// Sikkim — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "sikkim_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const SIKKIM_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "sikkim_organic_mission",
    icon: "🌱", color: "#15803D", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Agriculture Dept. / Sikkim State Organic Certification Agency (SSOCA)", hi: "सिक्किम कृषि विभाग / सिक्किम राज्य जैविक प्रमाणन एजेंसी (SSOCA)" },
    name:    { en: "Sikkim Organic Mission — Farmer Support Scheme",
               hi: "सिक्किम जैविक मिशन — किसान सहायता योजना" },
    benefit: { en: "Sikkim being India's first 100% organic state, this flagship scheme provides registered farmers with: free group organic certification under PGS-India (Participatory Guarantee System) covering all farm produce; 75% subsidy on vermi-composting unit setup (₹20,000 subsidy per unit); supply of organic inputs — bio-fertilisers, neem-based pesticides — at 80% subsidy; premium market linkage through the 'Sikkim Organic' brand for exports and domestic premium markets; free soil health testing every season at block agriculture office; training on System of Rice Intensification (SRI) and organic cardamom, ginger, and large-cardamom cultivation (Sikkim's major cash crops); annual incentive of ₹5,000 per hectare for maintaining organic certification; covers all 4 districts — East, West, North, and South Sikkim",
               hi: "सिक्किम भारत का पहला 100% जैविक राज्य होने के कारण, यह प्रमुख योजना पंजीकृत किसानों को प्रदान करती है: PGS-इंडिया (सहभागिता गारंटी प्रणाली) के तहत सभी फार्म उत्पादों के लिए निःशुल्क सामूहिक जैविक प्रमाणन; वर्मी-कम्पोस्ट यूनिट स्थापना पर 75% सब्सिडी (₹20,000 प्रति यूनिट); जैविक इनपुट — जैव-उर्वरक, नीम आधारित कीटनाशक — 80% सब्सिडी पर; निर्यात और घरेलू प्रीमियम बाजारों के लिए 'सिक्किम ऑर्गेनिक' ब्रांड के माध्यम से बाजार संपर्क; ब्लॉक कृषि कार्यालय में हर सीजन निःशुल्क मृदा स्वास्थ्य परीक्षण; SRI पद्धति और जैविक इलायची, अदरक व बड़ी इलायची की खेती पर प्रशिक्षण; जैविक प्रमाणन बनाए रखने पर ₹5,000 प्रति हेक्टेयर वार्षिक प्रोत्साहन; पूर्व, पश्चिम, उत्तर और दक्षिण सिक्किम — सभी 4 जिलों को कवरेज" },
    tag:     { en: "Farmer / Organic / Subsidy", hi: "किसान / जैविक / सब्सिडी" },
    annual: 5000,
    apply:   { en: "sikkimagrisnet.nic.in / Block Agriculture Officer (offline)", hi: "sikkimagrisnet.nic.in / ब्लॉक कृषि अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate / Land Record (Parcha)", "Sikkim Subject Certificate / Residence Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number", "Caste Certificate (if applicable for priority)"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र / भूमि अभिलेख (परचा)", "सिक्किम सब्जेक्ट प्रमाण पत्र / निवास प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर", "जाति प्रमाण पत्र (प्राथमिकता हेतु यदि लागू हो)"] },
    match: (a) => a.state === "Sikkim" && a.who === "farmer",
  },

  {
    id: "sikkim_cmad",
    icon: "🌾", color: "#D97706", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Agriculture & Horticulture Dept. / Chief Minister's Agriculture Diversification Scheme", hi: "सिक्किम कृषि एवं बागवानी विभाग / मुख्यमंत्री कृषि विविधीकरण योजना" },
    name:    { en: "Chief Minister's Agriculture Diversification Scheme (CMADS) — Sikkim",
               hi: "मुख्यमंत्री कृषि विविधीकरण योजना (CMADS) — सिक्किम" },
    benefit: { en: "Encourages small and marginal farmers to diversify beyond subsistence crops into high-value horticulture and allied sectors — key benefits include: 60% capital subsidy on installation of polyhouse/greenhouse (up to ₹70,000 per unit); 50% subsidy on drip irrigation and micro-irrigation equipment; free supply of improved planting material for large cardamom, mandarin orange, kiwi, cherry, and dragon fruit — high-value crops suited to Sikkim's agro-climatic zones; ₹10,000 interest-free crop loan top-up per season for small/marginal farmers; linkage with Sikkim's cooperative marketing network (SIMFED) for assured buy-back of produce; covers all 4 districts with special focus on North and West Sikkim hill farmers",
               hi: "छोटे व सीमांत किसानों को जीविका फसलों से आगे उच्च मूल्य बागवानी और संबद्ध क्षेत्रों में विविधता लाने को प्रोत्साहित करती है — मुख्य लाभ: पॉलीहाउस/ग्रीनहाउस स्थापना पर 60% पूंजी सब्सिडी (प्रति यूनिट ₹70,000 तक); ड्रिप सिंचाई और सूक्ष्म सिंचाई उपकरण पर 50% सब्सिडी; बड़ी इलायची, मेंडेरिन संतरा, कीवी, चेरी और ड्रैगन फ्रूट के उन्नत पौध सामग्री की निःशुल्क आपूर्ति; छोटे/सीमांत किसानों को ₹10,000 ब्याज-मुक्त फसल ऋण टॉप-अप; SIMFED के माध्यम से उपज की सुनिश्चित बायबैक; उत्तर और पश्चिम सिक्किम पहाड़ी किसानों पर विशेष ध्यान के साथ सभी 4 जिलों में कवरेज" },
    tag:     { en: "Farmer / Horticulture / Subsidy", hi: "किसान / बागवानी / सब्सिडी" },
    annual: 10000,
    apply:   { en: "sikkimagrisnet.nic.in / District Horticulture Officer (offline)", hi: "sikkimagrisnet.nic.in / जिला बागवानी अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Land Record / Parcha (proof of agricultural land)", "Sikkim Subject Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Existing crop / land use details"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "भूमि अभिलेख / परचा (कृषि भूमि का प्रमाण)", "सिक्किम सब्जेक्ट प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मौजूदा फसल / भूमि उपयोग विवरण"] },
    match: (a) => a.state === "Sikkim" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "sikkim_silm_shg",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Integrated Livelihood Mission (SILM) / Rural Management & Development Dept.", hi: "सिक्किम समेकित आजीविका मिशन (SILM) / ग्रामीण प्रबंधन एवं विकास विभाग" },
    name:    { en: "Sikkim Integrated Livelihood Mission — Women SHG Support (Sikkim)",
               hi: "सिक्किम समेकित आजीविका मिशन — महिला SHG सहायता (सिक्किम)" },
    benefit: { en: "Comprehensive livelihood support for women through Self-Help Groups (SHGs) — benefits include: revolving fund of ₹15,000 per newly formed SHG (interest-free); community investment fund (CIF) loans up to ₹3 lakh per SHG at 0% interest for income-generating activities; skill training in Sikkim's traditional weaving (Lepcha and Limboo textiles), food processing (organic pickles, cardamom-based products), tailoring, and eco-tourism services; market linkage through state-level fairs and online platforms under 'Sikkim Organic' brand; group life and accident insurance; connects to Pradhan Mantri MUDRA Yojana pipeline; covers rural and semi-urban women across all 4 districts; priority to women from BPL households and ST/SC communities",
               hi: "SHGs के माध्यम से महिलाओं को व्यापक आजीविका सहायता — लाभ शामिल: नए गठित SHG को ₹15,000 रिवॉल्विंग फंड (ब्याज-मुक्त); आय-सृजन गतिविधियों के लिए प्रति SHG ₹3 लाख तक 0% ब्याज पर CIF ऋण; सिक्किम की पारंपरिक बुनाई (लेपचा और लिंबू वस्त्र), खाद्य प्रसंस्करण (जैविक अचार, इलायची उत्पाद), सिलाई और इको-टूरिज्म सेवाओं में कौशल प्रशिक्षण; 'सिक्किम ऑर्गेनिक' ब्रांड के तहत ऑनलाइन और राज्य स्तरीय मेलों में बाजार संपर्क; सामूहिक जीवन एवं दुर्घटना बीमा; PMMY पाइपलाइन से जुड़ाव; सभी 4 जिलों की ग्रामीण व अर्ध-शहरी महिलाएं; BPL और ST/SC समुदायों की महिलाओं को प्राथमिकता" },
    tag:     { en: "Women / SHG / Livelihood", hi: "महिला / SHG / आजीविका" },
    annual: 0,
    apply:   { en: "rmd.sikkim.gov.in / Block Development Office (offline)", hi: "rmd.sikkim.gov.in / ब्लॉक विकास कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG Passbook", "Bank Account (SHG joint account)", "Sikkim Subject Certificate / Residence Proof", "Caste Certificate (for ST/SC priority)", "Passport Photo", "BPL Card (if applicable)"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG संयुक्त खाता)", "सिक्किम सब्जेक्ट प्रमाण पत्र / निवास प्रमाण", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "पासपोर्ट फोटो", "BPL कार्ड (यदि लागू हो)"] },
    match: (a) => a.state === "Sikkim" && a.who === "women",
  },

  {
    id: "sikkim_maternity_support",
    icon: "🤱", color: "#9333EA", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / Health & Family Welfare Dept.", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Sikkim Maternity Benefit & Mother-Child Nutrition Scheme",
               hi: "सिक्किम मातृत्व लाभ एवं माँ-शिशु पोषण योजना" },
    benefit: { en: "Comprehensive maternity and early childcare support for women in Sikkim — benefits include: ₹6,000 cash incentive for institutional delivery (paid in 2 installments — ₹3,000 on registration of pregnancy + ₹3,000 post delivery); free antenatal check-ups, iron-folic acid supplementation, and full immunisation for mother and newborn at government hospitals and PHCs across all 4 districts; free nutritional supplement kits (Poshan Kit) for 6 months post delivery containing cereals, pulses, and micronutrient packets; additional ₹2,000 state top-up on PMMVY (Pradhan Mantri Matru Vandana Yojana) for Sikkim residents; free transport reimbursement to district hospital for deliveries from remote North Sikkim areas; priority to first-time mothers, BPL households, ST/SC women",
               hi: "सिक्किम की महिलाओं के लिए व्यापक मातृत्व एवं शिशु देखभाल सहायता — लाभ: संस्थागत प्रसव पर ₹6,000 नकद प्रोत्साहन (2 किस्तों में — गर्भावस्था पंजीकरण पर ₹3,000 + प्रसव के बाद ₹3,000); सभी 4 जिलों में सरकारी अस्पतालों और PHCs पर निःशुल्क प्रसवपूर्व जांच, आयरन-फोलिक एसिड और माँ-शिशु के लिए पूर्ण टीकाकरण; प्रसव के बाद 6 महीने के लिए निःशुल्क पोषण किट (अनाज, दाल, सूक्ष्म पोषक पैकेट); PMMVY पर ₹2,000 राज्य टॉप-अप; उत्तर सिक्किम के दूरदराज क्षेत्रों से जिला अस्पताल तक निःशुल्क परिवहन प्रतिपूर्ति; पहली बार माँ बनने वाली महिलाओं, BPL परिवारों, ST/SC महिलाओं को प्राथमिकता" },
    tag:     { en: "Women / Maternity / Nutrition", hi: "महिला / मातृत्व / पोषण" },
    annual: 8000,
    apply:   { en: "Nearest PHC / District Hospital / ICDS Anganwadi Centre (offline)", hi: "निकटतम PHC / जिला अस्पताल / ICDS आंगनबाड़ी केंद्र (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate / Residence Proof", "Mother & Child Protection (MCP) Card", "Bank Account (Aadhaar-linked)", "Pregnancy Registration Certificate (from PHC / Hospital)", "BPL / Income Certificate (if applicable)", "Caste Certificate (for ST/SC priority)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र / निवास प्रमाण", "माँ एवं बाल संरक्षण (MCP) कार्ड", "बैंक खाता (आधार-लिंक्ड)", "गर्भावस्था पंजीकरण प्रमाण पत्र (PHC / अस्पताल से)", "BPL / आय प्रमाण पत्र (यदि लागू हो)", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && a.who === "women",
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "sikkim_cmrhm",
    icon: "🏠", color: "#B45309", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Rural Development Dept. / Chief Minister's Rural Housing Mission (CMRHM)", hi: "सिक्किम ग्रामीण विकास विभाग / मुख्यमंत्री ग्रामीण आवास मिशन (CMRHM)" },
    name:    { en: "Chief Minister's Rural Housing Mission (CMRHM) — Sikkim",
               hi: "मुख्यमंत्री ग्रामीण आवास मिशन (CMRHM) — सिक्किम" },
    benefit: { en: "Financial assistance for construction or renovation of pucca houses for rural BPL/EWS households in Sikkim — key benefits: ₹1.3 lakh–₹1.6 lakh one-time grant per household (higher amount for North Sikkim due to remoteness and construction cost); released in 3 installments tied to construction milestones (foundation, walls, roof/completion); mandatory inclusion of functional toilet, safe drinking water connection, and kitchen garden; supplementary to PMAY-Gramin — households not covered under PMAY receive full CMRHM grant; earthquake-resistant construction guidelines mandatory given Sikkim's seismic zone; priority to ST/SC households, female-headed families, persons with disability, and households affected by natural disasters (landslides, floods); covers all 4 districts with special priority to North Sikkim, Dzongu, and remote Lepcha reserve areas",
               hi: "सिक्किम में ग्रामीण BPL/EWS परिवारों के लिए पक्के मकान के निर्माण या नवीनीकरण हेतु वित्तीय सहायता — मुख्य लाभ: प्रति परिवार ₹1.3 लाख–₹1.6 लाख एकमुश्त अनुदान (उत्तर सिक्किम में दूरदराज और निर्माण लागत के कारण अधिक); निर्माण मील के पत्थर (नींव, दीवार, छत) से जुड़ी 3 किस्तों में; कार्यात्मक शौचालय, सुरक्षित पेयजल कनेक्शन और किचन गार्डन अनिवार्य; PMAY-ग्रामीण का पूरक; सिक्किम के भूकंप क्षेत्र के कारण भूकंपरोधी निर्माण दिशा-निर्देश अनिवार्य; ST/SC परिवारों, महिला-प्रमुख परिवारों, दिव्यांगजनों और प्राकृतिक आपदा (भूस्खलन, बाढ़) प्रभावित परिवारों को प्राथमिकता; उत्तर सिक्किम, जोंगु और दूरदराज लेपचा आरक्षित क्षेत्रों पर विशेष प्राथमिकता के साथ सभी 4 जिलों में कवरेज" },
    tag:     { en: "Housing / BPL / Rural", hi: "आवास / BPL / ग्रामीण" },
    annual: 160000,
    apply:   { en: "Nearest Block Development Office (BDO) / District Collector Office (offline)", hi: "निकटतम ब्लॉक विकास कार्यालय (BDO) / जिला कलेक्टर कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Sikkim Subject Certificate", "Land Ownership Document / Patta", "Bank Account (Aadhaar-linked)", "Residence / Domicile Proof (Sikkim)", "Caste Certificate (for ST/SC priority)", "Disability Certificate (if applicable)", "Photograph of existing house / site", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण पत्र", "सिक्किम सब्जेक्ट प्रमाण पत्र", "भूमि स्वामित्व दस्तावेज / पट्टा", "बैंक खाता (आधार-लिंक्ड)", "निवास / अधिवास प्रमाण (सिक्किम)", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)", "मौजूदा मकान / स्थल की तस्वीर", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && ["below1","1to3"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "sikkim_cmses",
    icon: "💼", color: "#0F766E", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Industries Dept. / Chief Minister's Self Employment Scheme (CMSES)", hi: "सिक्किम उद्योग विभाग / मुख्यमंत्री स्वरोजगार योजना (CMSES)" },
    name:    { en: "Chief Minister's Self Employment Scheme (CMSES) — Sikkim",
               hi: "मुख्यमंत्री स्वरोजगार योजना (CMSES) — सिक्किम" },
    benefit: { en: "Collateral-free financial assistance to educated unemployed youth and first-generation entrepreneurs in Sikkim to start micro and small enterprises — key benefits: project loan of ₹50,000–₹15 lakh with 30–40% capital subsidy on project cost (higher subsidy for women, ST/SC applicants, and differently-abled); bank loan component facilitated through Sikkim Bank/nationalised banks; free entrepreneurship development programme (EDP) training through the District Industries Centre (DIC) and Sikkim Industrial Development & Investment Corporation (SIDICO); priority sectors: organic food processing, cardamom/ginger value addition, eco-tourism and homestay, handwoven textiles, IT/BPO services, and bamboo craft — aligned with Sikkim's economic strengths; special facilitation for ex-servicemen; one-time incentive of ₹5,000 for Sikkim Subject holders starting enterprise in rural areas",
               hi: "सिक्किम में शिक्षित बेरोजगार युवाओं और पहली पीढ़ी के उद्यमियों को सूक्ष्म व लघु उद्यम शुरू करने के लिए गारंटी-मुक्त वित्तीय सहायता — मुख्य लाभ: ₹50,000–₹15 लाख परियोजना ऋण, परियोजना लागत पर 30–40% पूंजी सब्सिडी (महिला, ST/SC और दिव्यांगजनों के लिए अधिक); सिक्किम बैंक/राष्ट्रीयकृत बैंकों के माध्यम से बैंक ऋण; DIC और SIDICO के माध्यम से निःशुल्क उद्यमिता विकास कार्यक्रम (EDP) प्रशिक्षण; प्राथमिक क्षेत्र: जैविक खाद्य प्रसंस्करण, इलायची/अदरक मूल्य संवर्धन, इको-टूरिज्म और होमस्टे, हस्तनिर्मित वस्त्र, IT/BPO सेवाएं और बांस शिल्प; पूर्व सैनिकों के लिए विशेष सुविधा; ग्रामीण क्षेत्र में उद्यम शुरू करने वाले सिक्किम सब्जेक्ट धारकों को ₹5,000 एकमुश्त प्रोत्साहन" },
    tag:     { en: "Youth / Self-Employment / Entrepreneur", hi: "युवा / स्वरोजगार / उद्यमी" },
    annual: 0,
    apply:   { en: "industries.sikkim.gov.in / District Industries Centre (DIC) (offline)", hi: "industries.sikkim.gov.in / जिला उद्योग केंद्र (DIC) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate (mandatory)", "Age Proof (Birth Certificate / Voter ID)", "Educational Qualification Certificate", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "Caste Certificate (for higher subsidy)", "Disability Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र (अनिवार्य)", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "शैक्षिक योग्यता प्रमाण पत्र", "परियोजना रिपोर्ट / व्यवसाय योजना", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (अधिक सब्सिडी के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && (a.who === "unemployed" || a.who === "business" || a.who === "general") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── TRIBAL / SCHEDULED TRIBE WELFARE ─────────────────────────────────────

  {
    id: "sikkim_st_welfare",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / Tribal Welfare Division", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / जनजातीय कल्याण प्रभाग" },
    name:    { en: "Sikkim Scheduled Tribe Welfare & Development Schemes",
               hi: "सिक्किम अनुसूचित जनजाति कल्याण एवं विकास योजनाएं" },
    benefit: { en: "Bundle of welfare and development benefits exclusively for ST communities (Lepcha, Bhutia, Limboo/Subba, and other recognised Sikkimese tribes) — includes: pre-matric and post-matric scholarship for ST students (₹400–₹1,200 per month depending on class and boarding/day status); free hostel accommodation in government tribal hostels at Gangtok, Namchi, Geyzing, and Mangan for students studying away from home; ₹5,000 annual cultural preservation grant for registered tribal cultural groups; tribal identity card issued by Tribal Welfare Dept. for priority access across all state schemes; ₹3,500 tool kit grant per annum for traditional artisans (Lepcha weavers, Bhutia thangka painters, bamboo-cane craftsmen); reservation in state government jobs and educational institutions; legal aid and land rights support through dedicated ST cell; special package for Dzongu Lepcha Reserve residents — fully protected ecological zone of North Sikkim",
               hi: "ST समुदायों (लेपचा, भूटिया, लिंबू/सुब्बा और अन्य मान्यता प्राप्त सिक्किमी जनजातियों) के लिए कल्याण एवं विकास लाभों का समूह — शामिल: ST छात्रों के लिए प्री-मैट्रिक और पोस्ट-मैट्रिक छात्रवृत्ति (कक्षा और बोर्डिंग/दिवस स्थिति के अनुसार ₹400–₹1,200 प्रतिमाह); गंगटोक, नामची, गेयज़िंग और मांगन में सरकारी जनजातीय छात्रावासों में निःशुल्क आवास; पंजीकृत जनजातीय सांस्कृतिक समूहों को ₹5,000 वार्षिक सांस्कृतिक संरक्षण अनुदान; जनजातीय कल्याण विभाग द्वारा जनजातीय पहचान पत्र; पारंपरिक कारीगरों (लेपचा बुनकर, भूटिया थांका चित्रकार, बांस-बेंत शिल्पकार) को ₹3,500 प्रतिवर्ष टूल किट; राज्य सरकारी नौकरियों और शैक्षणिक संस्थानों में आरक्षण; उत्तर सिक्किम के जोंगु लेपचा रिजर्व निवासियों के लिए विशेष पैकेज" },
    tag:     { en: "Tribal / ST / Scholarship / Welfare", hi: "जनजातीय / ST / छात्रवृत्ति / कल्याण" },
    annual: 14400,
    apply:   { en: "sikkimtribalwelfare.gov.in / District Tribal Welfare Officer (offline)", hi: "sikkimtribalwelfare.gov.in / जिला जनजातीय कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST (Scheduled Tribe) Certificate issued by Sikkim Govt.", "Sikkim Subject Certificate", "Residence / Domicile Certificate (Sikkim)", "Income Certificate (BPL preferred)", "Bank Account (Aadhaar-linked)", "Passport Photo", "For students: School / College Enrollment Certificate & Mark Sheet", "For artisans: Craft Registration Certificate / Tribal Welfare ID"],
               hi: ["आधार कार्ड", "सिक्किम सरकार द्वारा जारी ST प्रमाण पत्र", "सिक्किम सब्जेक्ट प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (सिक्किम)", "आय प्रमाण पत्र (BPL प्राथमिक)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "छात्रों के लिए: विद्यालय / महाविद्यालय नामांकन प्रमाण पत्र एवं अंकतालिका", "कारीगरों के लिए: शिल्प पंजीकरण प्रमाण पत्र / जनजातीय कल्याण ID"] },
    match: (a) => a.state === "Sikkim" && (a.caste === "st" || a.caste === "sc"),
  },

  // ── EDUCATION / SCHOLARSHIP ───────────────────────────────────────────────

  {
    id: "sikkim_cm_scholarship",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Human Resource Development Dept. / Chief Minister's Meritorious Scholarship", hi: "सिक्किम मानव संसाधन विकास विभाग / मुख्यमंत्री मेधावी छात्रवृत्ति" },
    name:    { en: "Chief Minister's Meritorious Scholarship — Sikkim",
               hi: "मुख्यमंत्री मेधावी छात्रवृत्ति — सिक्किम" },
    benefit: { en: "State merit scholarship for Sikkim Subject students excelling in board examinations and pursuing higher education — key benefits: ₹1,500–₹3,000 per month for undergraduate students (varies by stream: arts/commerce ₹1,500, science ₹2,000, professional/technical courses ₹3,000); ₹3,500–₹5,000 per month for postgraduate students (higher for engineering, medicine, law); one-time laptop grant of ₹25,000 for students scoring 80%+ in Class XII board exams pursuing degree courses; special additional ₹500/month incentive for girl students in STEM fields; scholarship continues for full course duration subject to annual renewal based on passing each year; covers students studying in Sikkim or at recognized institutions outside state; priority for first-generation learners from BPL families; managed through the scholarship portal of Sikkim HRD Dept.",
               hi: "बोर्ड परीक्षाओं में उत्कृष्ट प्रदर्शन करने वाले सिक्किम सब्जेक्ट छात्रों को उच्च शिक्षा के लिए राज्य मेरिट छात्रवृत्ति — मुख्य लाभ: स्नातक छात्रों के लिए ₹1,500–₹3,000 प्रतिमाह (स्ट्रीम अनुसार: आर्ट्स/कॉमर्स ₹1,500, विज्ञान ₹2,000, व्यावसायिक/तकनीकी पाठ्यक्रम ₹3,000); स्नातकोत्तर छात्रों के लिए ₹3,500–₹5,000 प्रतिमाह (इंजीनियरिंग, चिकित्सा, कानून के लिए अधिक); कक्षा XII में 80%+ स्कोर करने वाले डिग्री पाठ्यक्रम छात्रों को एकमुश्त ₹25,000 लैपटॉप अनुदान; STEM क्षेत्र में छात्राओं को अतिरिक्त ₹500/माह प्रोत्साहन; प्रत्येक वर्ष उत्तीर्ण होने की शर्त पर पूरे पाठ्यक्रम की अवधि तक छात्रवृत्ति जारी; सिक्किम या मान्यता प्राप्त बाहरी संस्थानों के छात्रों को कवरेज; BPL परिवारों के प्रथम पीढ़ी के शिक्षार्थियों को प्राथमिकता" },
    tag:     { en: "Student / Scholarship / Education", hi: "छात्र / छात्रवृत्ति / शिक्षा" },
    annual: 36000,
    apply:   { en: "scholarships.sikkim.gov.in / District Education Officer (offline)", hi: "scholarships.sikkim.gov.in / जिला शिक्षा अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate (mandatory)", "Class X & XII Mark Sheets", "College / University Admission Letter", "Income Certificate (family annual income)", "Bank Account (Aadhaar-linked, student's own account preferred)", "Caste Certificate (if applicable)", "Passport Photo", "Previous year's marks / result for renewal"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र (अनिवार्य)", "कक्षा X और XII की अंकतालिका", "कॉलेज / विश्वविद्यालय प्रवेश पत्र", "आय प्रमाण पत्र (पारिवारिक वार्षिक आय)", "बैंक खाता (आधार-लिंक्ड, छात्र का स्वयं का खाता अधिमान्य)", "जाति प्रमाण पत्र (यदि लागू)", "पासपोर्ट फोटो", "नवीनीकरण के लिए पिछले वर्ष की अंकतालिका / परिणाम"] },
    match: (a) => a.state === "Sikkim" && (a.who === "student" || a.who === "general") && a.age >= 17 && a.age <= 30,
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "sikkim_arogya",
    icon: "🏥", color: "#DC2626", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Health & Family Welfare Dept. / Arogya Sikkim Health Insurance Scheme", hi: "सिक्किम स्वास्थ्य एवं परिवार कल्याण विभाग / आरोग्य सिक्किम स्वास्थ्य बीमा योजना" },
    name:    { en: "Arogya Sikkim — State Health Insurance Scheme",
               hi: "आरोग्य सिक्किम — राज्य स्वास्थ्य बीमा योजना" },
    benefit: { en: "Universal health coverage for Sikkim Subject holders — key benefits: cashless hospitalisation cover of ₹5 lakh per family per year at empanelled government and private hospitals across Sikkim and referral hospitals in Siliguri, Kolkata, and Delhi; covers pre-existing conditions from Day 1 (no waiting period for Sikkim beneficiaries); free diagnostics, medicines, and follow-up consultations at government health facilities under Chief Minister's Free Drug Scheme; ₹5,000 transport reimbursement per major illness requiring inter-district or out-of-state referral; dedicated health desk at each CHC (Community Health Centre) to assist with claims and referrals; special enhanced cover of ₹10 lakh for cancer, kidney failure, cardiac surgery, and organ transplants; covers all family members enrolled under a single Arogya Sikkim card; integrates with Ayushman Bharat PM-JAY for seamless nationwide coverage; all 4 districts covered with 24/7 helpline support",
               hi: "सिक्किम सब्जेक्ट धारकों के लिए सार्वभौमिक स्वास्थ्य कवरेज — मुख्य लाभ: सिक्किम और सिलीगुड़ी, कोलकाता, दिल्ली के रेफरल अस्पतालों में ₹5 लाख प्रति परिवार प्रति वर्ष कैशलेस अस्पताल कवरेज; पहले दिन से पूर्व-मौजूदा बीमारियों का कवर; मुख्यमंत्री निःशुल्क दवा योजना के तहत सरकारी स्वास्थ्य सुविधाओं में निःशुल्क निदान, दवाएं और अनुवर्ती परामर्श; जिले के बाहर या राज्य के बाहर रेफरल पर ₹5,000 परिवहन प्रतिपूर्ति; दावों और रेफरल में सहायता के लिए प्रत्येक CHC पर समर्पित स्वास्थ्य डेस्क; कैंसर, किडनी विफलता, हृदय शल्य चिकित्सा और अंग प्रत्यारोपण के लिए ₹10 लाख का विशेष कवर; एकल आरोग्य सिक्किम कार्ड के तहत सभी परिवार सदस्य; PM-JAY से एकीकरण; 24/7 हेल्पलाइन सहायता" },
    tag:     { en: "Health / Insurance / Family", hi: "स्वास्थ्य / बीमा / परिवार" },
    annual: 0,
    apply:   { en: "sikkimhealth.gov.in / Nearest CHC or District Hospital (offline)", hi: "sikkimhealth.gov.in / निकटतम CHC या जिला अस्पताल (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (all family members)", "Sikkim Subject Certificate", "Residence / Domicile Certificate (Sikkim)", "Family Ration Card / BPL Card (if applicable)", "Bank Account (Aadhaar-linked)", "Passport Photos (all adult members)", "Existing health card (for renewal / migration)"],
               hi: ["आधार कार्ड (सभी परिवार सदस्य)", "सिक्किम सब्जेक्ट प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (सिक्किम)", "पारिवारिक राशन कार्ड / BPL कार्ड (यदि लागू)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो (सभी वयस्क सदस्य)", "मौजूदा स्वास्थ्य कार्ड (नवीनीकरण/माइग्रेशन के लिए)"] },
    match: (a) => a.state === "Sikkim",
  },

  // ── PENSION / SENIOR CITIZEN ──────────────────────────────────────────────

  {
    id: "sikkim_social_security_pension",
    icon: "👴", color: "#92400E", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / State Social Security Pension Division", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / राज्य सामाजिक सुरक्षा पेंशन प्रभाग" },
    name:    { en: "Sikkim State Social Security Pension — Old Age, Widow & Disability",
               hi: "सिक्किम राज्य सामाजिक सुरक्षा पेंशन — वृद्धावस्था, विधवा एवं दिव्यांगता" },
    benefit: { en: "Monthly pension support for vulnerable Sikkim Subject holders across three categories — Old Age Pension: ₹1,500/month for beneficiaries aged 60–79; ₹2,000/month for those aged 80 and above; Widow/Destitute Women Pension: ₹1,500/month for widows and abandoned women above 18 years with no independent income; Disability Pension: ₹1,500–₹2,000/month for persons with 40%+ disability (higher rate for severe/multiple disabilities); pension is directly credited to Aadhaar-linked bank accounts on the 1st of each month; integrates with Indira Gandhi National Old Age, Widow, and Disability pensions (IGNOAP/IGNWP/IGNDP) for topping up to state rate; no income ceiling for old age and widow categories for Sikkim Subject holders; recipients also receive priority allotment under state food security scheme and free health card under Arogya Sikkim",
               hi: "तीन श्रेणियों में असुरक्षित सिक्किम सब्जेक्ट धारकों के लिए मासिक पेंशन — वृद्धावस्था पेंशन: 60–79 वर्ष के लाभार्थियों के लिए ₹1,500/माह; 80 वर्ष और अधिक आयु के लिए ₹2,000/माह; विधवा/बेसहारा महिला पेंशन: 18 वर्ष से अधिक विधवा और परित्यक्त महिलाओं को ₹1,500/माह (स्वतंत्र आय नहीं होनी चाहिए); दिव्यांगता पेंशन: 40%+ दिव्यांगता वाले व्यक्तियों को ₹1,500–₹2,000/माह (गंभीर/बहु दिव्यांगता के लिए अधिक); प्रत्येक माह की पहली तारीख को आधार-लिंक्ड बैंक खाते में सीधे जमा; IGNOAP/IGNWP/IGNDP के साथ एकीकरण; राज्य खाद्य सुरक्षा और आरोग्य सिक्किम में प्राथमिकता" },
    tag:     { en: "Pension / Senior Citizen / Widow / Disability", hi: "पेंशन / वरिष्ठ नागरिक / विधवा / दिव्यांगता" },
    annual: 24000,
    apply:   { en: "Nearest Block Development Office (BDO) / District Social Welfare Office (offline)", hi: "निकटतम ब्लॉक विकास कार्यालय (BDO) / जिला समाज कल्याण कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate", "Age Proof — Birth Certificate / Voter ID / Aadhaar (for Old Age)", "Death Certificate of Husband (for Widow pension)", "Disability Certificate from CMO / Medical Board (for Disability pension)", "Income Certificate (BPL / No-income declaration)", "Bank Account (Aadhaar-linked)", "Residence / Domicile Certificate (Sikkim)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र", "आयु प्रमाण — जन्म प्रमाण पत्र / मतदाता ID / आधार (वृद्धावस्था के लिए)", "पति का मृत्यु प्रमाण पत्र (विधवा पेंशन के लिए)", "CMO / मेडिकल बोर्ड से दिव्यांगता प्रमाण पत्र (दिव्यांगता पेंशन के लिए)", "आय प्रमाण पत्र (BPL / कोई आय नहीं घोषणा)", "बैंक खाता (आधार-लिंक्ड)", "निवास / अधिवास प्रमाण पत्र (सिक्किम)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && (a.age >= 60 || a.who === "widow" || a.who === "disabled"),
  },

  // ── TOURISM / HOMESTAY ────────────────────────────────────────────────────

  {
    id: "sikkim_homestay_scheme",
    icon: "🏡", color: "#065F46", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Tourism & Civil Aviation Dept. / Sikkim Homestay Development Scheme", hi: "सिक्किम पर्यटन एवं नागरिक उड्डयन विभाग / सिक्किम होमस्टे विकास योजना" },
    name:    { en: "Sikkim Homestay Development & Registration Scheme",
               hi: "सिक्किम होमस्टे विकास एवं पंजीकरण योजना" },
    benefit: { en: "Financial and promotional support for Sikkim Subject holders to develop and register homestays as part of Sikkim's sustainable eco-tourism model — key benefits: one-time capital assistance of ₹1.5 lakh per homestay unit for renovation, bathroom fitting, and furnishing (for families converting existing home); additional ₹50,000 for constructing a dedicated guest room in rural/remote tourism zones (North and West Sikkim); free 5-day training in hospitality, hygiene, organic home-cooked food preparation, and English communication at Sikkim Tourism Institute; official 'Certified Sikkim Homestay' tag with listing on sikkim.gov.in/tourism portal and Incredible India platform for national and international visibility; priority inclusion in state-curated tour packages; ₹5,000 annual maintenance incentive for maintaining 4-star hygiene and cleanliness rating; electricity subsidy at domestic rate (not commercial) for registered homestays; one free refresher training per year on digital payments and online booking management",
               hi: "सिक्किम के टिकाऊ इको-पर्यटन मॉडल के हिस्से के रूप में होमस्टे विकसित और पंजीकृत करने के लिए सिक्किम सब्जेक्ट धारकों को वित्तीय और प्रचार सहायता — मुख्य लाभ: नवीनीकरण, बाथरूम फिटिंग और फर्निशिंग के लिए ₹1.5 लाख एकमुश्त पूंजी सहायता; ग्रामीण/दूरदराज पर्यटन क्षेत्रों में समर्पित गेस्ट रूम निर्माण के लिए अतिरिक्त ₹50,000; सिक्किम पर्यटन संस्थान में 5 दिवसीय निःशुल्क आतिथ्य, स्वच्छता, जैविक घरेलू भोजन और अंग्रेजी संचार प्रशिक्षण; 'प्रमाणित सिक्किम होमस्टे' टैग के साथ sikkim.gov.in और Incredible India पोर्टल पर लिस्टिंग; राज्य-क्यूरेटेड टूर पैकेजों में प्राथमिकता; स्वच्छता रेटिंग बनाए रखने पर ₹5,000 वार्षिक रखरखाव प्रोत्साहन; पंजीकृत होमस्टे के लिए घरेलू दर पर बिजली सब्सिडी; प्रतिवर्ष डिजिटल पेमेंट और ऑनलाइन बुकिंग पर निःशुल्क रिफ्रेशर प्रशिक्षण" },
    tag:     { en: "Tourism / Homestay / Self-Employment", hi: "पर्यटन / होमस्टे / स्वरोजगार" },
    annual: 5000,
    apply:   { en: "sikkimtourism.gov.in / District Tourism Office (offline)", hi: "sikkimtourism.gov.in / जिला पर्यटन कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate (mandatory)", "Property Ownership Document / Lease Agreement", "Residential Address Proof (Sikkim)", "Bank Account (Aadhaar-linked)", "Photographs of house / proposed homestay rooms", "No Objection Certificate from local Gram Panchayat / Ward", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र (अनिवार्य)", "संपत्ति स्वामित्व दस्तावेज / लीज एग्रीमेंट", "आवासीय पता प्रमाण (सिक्किम)", "बैंक खाता (आधार-लिंक्ड)", "घर / प्रस्तावित होमस्टे कमरों की तस्वीरें", "ग्राम पंचायत / वार्ड से अनापत्ति प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && (a.who === "business" || a.who === "general" || a.who === "unemployed"),
  },

  // ── FISHERIES ─────────────────────────────────────────────────────────────

  {
    id: "sikkim_fisheries_dev",
    icon: "🐟", color: "#0E7490", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Animal Husbandry, Livestock, Fisheries & Veterinary Services Dept.", hi: "सिक्किम पशुपालन, पशुधन, मत्स्यपालन एवं पशु चिकित्सा सेवा विभाग" },
    name:    { en: "Sikkim Fisheries Development Scheme — Cold Water Fish Farming",
               hi: "सिक्किम मत्स्यपालन विकास योजना — शीतजल मत्स्य पालन" },
    benefit: { en: "Support for cold-water fish farming suited to Sikkim's high-altitude rivers, streams, and ponds — key benefits: 60% subsidy on construction of raceway/trout hatchery units (up to ₹2 lakh per unit); free fingerlings (trout, mahseer, snow trout) supply from state fisheries department hatcheries at Ranipool and Legship; 50% subsidy on fish feed for the first 2 years; free training on scientific aquaculture, disease management, and post-harvest handling at the State Fisheries Training Centre; ₹10,000 one-time grant for purchase of fishing nets and gear for river/lake-based fishermen; interest subsidy on bank loans for constructing fish ponds or purchasing refrigeration equipment; priority market access at state fisheries cooperatives and weekly haat markets; special focus on communities in North Sikkim near Teesta River and high-altitude lakes in Lachung and Lachen areas; Pradhan Mantri Matsya Sampada Yojana (PMMSY) benefits also linked through this scheme",
               hi: "सिक्किम की ऊंचाई वाली नदियों, धाराओं और तालाबों के अनुकूल शीत जल मत्स्य पालन के लिए सहायता — मुख्य लाभ: रेसवे/ट्राउट हैचरी यूनिट निर्माण पर 60% सब्सिडी (प्रति यूनिट ₹2 लाख तक); राणीपूल और लेगशिप स्थित राज्य मत्स्य पालन विभाग हैचरी से निःशुल्क फिंगरलिंग (ट्राउट, महसीर, स्नो ट्राउट) आपूर्ति; पहले 2 वर्षों के लिए मछली चारे पर 50% सब्सिडी; राज्य मत्स्य पालन प्रशिक्षण केंद्र में वैज्ञानिक जलकृषि, रोग प्रबंधन और कटाई के बाद प्रबंधन का निःशुल्क प्रशिक्षण; मछुआरों के लिए जाल और उपकरण खरीद पर ₹10,000 एकमुश्त अनुदान; तालाब निर्माण या प्रशीतन उपकरण खरीद पर बैंक ऋण में ब्याज सब्सिडी; उत्तर सिक्किम में तीस्ता नदी के पास समुदायों पर विशेष ध्यान; PMMSY लाभों से एकीकरण" },
    tag:     { en: "Farmer / Fisheries / Subsidy", hi: "किसान / मत्स्यपालन / सब्सिडी" },
    annual: 0,
    apply:   { en: "ahvs.sikkim.gov.in / District Fisheries Development Officer (offline)", hi: "ahvs.sikkim.gov.in / जिला मत्स्य पालन विकास अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate", "Land / Water Body Ownership or Lease Document", "Bank Account (Aadhaar-linked)", "Residence Certificate (Sikkim)", "Caste Certificate (for ST/SC priority)", "Passport Photo", "Project / Proposal for fish farming activity"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र", "भूमि / जल निकाय स्वामित्व या लीज दस्तावेज", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण पत्र (सिक्किम)", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "पासपोर्ट फोटो", "मत्स्य पालन गतिविधि के लिए परियोजना / प्रस्ताव"] },
    match: (a) => a.state === "Sikkim" && (a.who === "farmer" || a.who === "general"),
  },

  // ── DISABILITY WELFARE ────────────────────────────────────────────────────

  {
    id: "sikkim_divyang_welfare",
    icon: "♿", color: "#4338CA", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / Divyangjan Welfare Division", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / दिव्यांगजन कल्याण प्रभाग" },
    name:    { en: "Sikkim Divyangjan (Differently-Abled) Welfare & Empowerment Scheme",
               hi: "सिक्किम दिव्यांगजन कल्याण एवं सशक्तिकरण योजना" },
    benefit: { en: "Comprehensive welfare package for persons with disabilities (40%+ disability certificate) who are Sikkim Subject holders — key benefits: free assistive devices — wheelchairs, crutches, hearing aids, white canes, Braille kits — through annual disability camps held in each district; ₹2,000/month disability pension (Sikkim State supplement on top of central IGNDP pension); 4% reservation in state government jobs for persons with benchmark disabilities; monthly scholarship of ₹500–₹800 for Divyangjan students in school and college; free skill development training at ITI/Polytechnic with hostel accommodation; priority allotment under Pradhan Mantri Awas Yojana (housing) and MGNREGA (employment); free legal aid and guardianship support under RPWD Act 2016; barrier-free access facilitation at government offices (ramp, tactile path installation); special transport subsidy card for 50% fare concession on State Transport buses; National Handicapped Finance & Development Corporation (NHFDC) loan linkage at subsidised interest rate for self-employment",
               hi: "40%+ दिव्यांगता प्रमाण पत्र वाले सिक्किम सब्जेक्ट धारक दिव्यांगजनों के लिए व्यापक कल्याण पैकेज — मुख्य लाभ: प्रत्येक जिले में वार्षिक दिव्यांगता शिविरों में निःशुल्क सहायक उपकरण — व्हीलचेयर, बैसाखी, श्रवण यंत्र, सफेद छड़ी, ब्रेल किट; ₹2,000/माह दिव्यांगता पेंशन (केंद्रीय IGNDP पेंशन के अतिरिक्त सिक्किम राज्य अनुपूरक); बेंचमार्क दिव्यांगजनों के लिए राज्य सरकारी नौकरियों में 4% आरक्षण; विद्यालय और महाविद्यालय में दिव्यांगजन छात्रों के लिए ₹500–₹800 मासिक छात्रवृत्ति; आईटीआई/पॉलिटेक्निक में छात्रावास सहित निःशुल्क कौशल विकास प्रशिक्षण; PMAY और MGNREGA में प्राथमिकता; राज्य परिवहन बसों में 50% किराया रियायत; स्वरोजगार के लिए NHFDC ऋण सुविधा" },
    tag:     { en: "Disability / Divyangjan / Welfare / Pension", hi: "दिव्यांगता / दिव्यांगजन / कल्याण / पेंशन" },
    annual: 24000,
    apply:   { en: "socialwelfare.sikkim.gov.in / District Social Welfare Office (offline)", hi: "socialwelfare.sikkim.gov.in / जिला समाज कल्याण कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+ issued by CMO / Medical Board)", "Sikkim Subject Certificate", "Residence / Domicile Certificate (Sikkim)", "Income Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "For students: School / College Enrollment Certificate", "UDID Card (Unique Disability ID) if available"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+ CMO / मेडिकल बोर्ड द्वारा जारी)", "सिक्किम सब्जेक्ट प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (सिक्किम)", "आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "छात्रों के लिए: विद्यालय / महाविद्यालय नामांकन प्रमाण पत्र", "UDID कार्ड (उपलब्ध होने पर)"] },
    match: (a) => a.state === "Sikkim" && a.who === "disabled",
  },

  // ── ANIMAL HUSBANDRY / DAIRY ──────────────────────────────────────────────

  {
    id: "sikkim_animal_husbandry",
    icon: "🐄", color: "#78350F", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Animal Husbandry, Livestock, Fisheries & Veterinary Services Dept.", hi: "सिक्किम पशुपालन, पशुधन, मत्स्यपालन एवं पशु चिकित्सा सेवा विभाग" },
    name:    { en: "Sikkim Animal Husbandry & Dairy Development Scheme",
               hi: "सिक्किम पशुपालन एवं डेयरी विकास योजना" },
    benefit: { en: "Comprehensive support for farmers and rural households engaged in livestock rearing suited to Sikkim's agro-climatic conditions — key benefits: 50% subsidy on purchase of improved-breed Jersey / HF dairy cows and cross-bred pigs (major income source in rural Sikkim), up to ₹25,000 per beneficiary; 75% subsidy on construction of scientific cattle shed or piggery unit (₹30,000 ceiling); special yak and chauri (yak-cattle hybrid) conservation incentive of ₹3,000 per head annually for herders in North and West Sikkim high-altitude zones; free vaccination drives for foot-and-mouth disease (FMD), PPR (for goats), and swine fever — conducted at village level twice a year; free AI (Artificial Insemination) service at doorstep for dairy cattle; free fodder seed kits (oat, berseem) every season; ₹5,000 interest subvention on short-term livestock loans; linkage with Sikkim Milk Union (SIMUL) for milk procurement and fair pricing; free 3-day training on scientific livestock management and dairy hygiene at District Veterinary Centre",
               hi: "सिक्किम की कृषि-जलवायु परिस्थितियों के अनुकूल पशुपालन में लगे किसानों और ग्रामीण परिवारों के लिए व्यापक सहायता — मुख्य लाभ: उन्नत नस्ल की जर्सी/HF दुधारू गाय और क्रॉस-ब्रीड सूअर की खरीद पर 50% सब्सिडी (प्रति लाभार्थी ₹25,000 तक); वैज्ञानिक गोशाला या सुअर बाड़े के निर्माण पर 75% सब्सिडी (₹30,000 की सीमा); उत्तर और पश्चिम सिक्किम के ऊंचाई वाले क्षेत्रों में याक और चौरी संरक्षण के लिए ₹3,000 प्रति पशु वार्षिक प्रोत्साहन; FMD, PPR और स्वाइन फीवर के लिए साल में दो बार निःशुल्क टीकाकरण अभियान; डेयरी मवेशियों के लिए दरवाजे पर निःशुल्क AI सेवा; प्रत्येक सीजन निःशुल्क चारा बीज किट; पशुधन ऋण पर ₹5,000 ब्याज सहायता; SIMUL के साथ दूध खरीद संपर्क; जिला पशु चिकित्सा केंद्र में 3 दिवसीय निःशुल्क प्रशिक्षण" },
    tag:     { en: "Farmer / Animal Husbandry / Dairy / Subsidy", hi: "किसान / पशुपालन / डेयरी / सब्सिडी" },
    annual: 3000,
    apply:   { en: "ahvs.sikkim.gov.in / District Veterinary Officer (offline)", hi: "ahvs.sikkim.gov.in / जिला पशु चिकित्सा अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate", "Land / Homestead Ownership Document", "Bank Account (Aadhaar-linked)", "Residence Certificate (Sikkim)", "Caste Certificate (for higher subsidy — ST/SC)", "Passport Photo", "Existing livestock details / photograph of existing shed (for expansion cases)"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र", "भूमि / गृहस्थान स्वामित्व दस्तावेज", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण पत्र (सिक्किम)", "जाति प्रमाण पत्र (ST/SC उच्च सब्सिडी के लिए)", "पासपोर्ट फोटो", "मौजूदा पशुधन विवरण / मौजूदा शेड की तस्वीर (विस्तार के मामलों में)"] },
    match: (a) => a.state === "Sikkim" && a.who === "farmer",
  },

  // ── SOLAR / RENEWABLE ENERGY ──────────────────────────────────────────────

  {
    id: "sikkim_solar_rooftop",
    icon: "☀️", color: "#D97706", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Energy & Power Dept. / Sikkim Renewable Energy Development Agency (SREDA)", hi: "सिक्किम ऊर्जा एवं विद्युत विभाग / सिक्किम नवीकरणीय ऊर्जा विकास एजेंसी (SREDA)" },
    name:    { en: "Sikkim Solar Rooftop & Off-Grid Energy Scheme",
               hi: "सिक्किम सौर रूफटॉप एवं ऑफ-ग्रिड ऊर्जा योजना" },
    benefit: { en: "Subsidised solar energy solutions for households, farmers, and institutions in Sikkim — key benefits: 40% state subsidy (on top of 30% central PM Surya Ghar subsidy) on grid-connected rooftop solar systems up to 3 kW for domestic consumers — effective combined subsidy up to 70%; fully subsidised off-grid solar home lighting system (2 LED lights + 1 fan + mobile charging point) for households in remote hamlets beyond grid reach in North and West Sikkim — no out-of-pocket cost for BPL families; 60% subsidy on solar water heaters for households (saves electricity in cold climate); free solar lanterns for tribal hamlets under ST Welfare convergence; solar-powered cold storage units for farmers at 50% capital cost subsidy — critical for preserving cardamom and large cardamom yield; ₹2,000 per kW annual generation incentive for net metering beneficiaries selling surplus power to grid; installation and maintenance by SREDA-empanelled local technicians — creating local employment; free 2-year maintenance warranty through SREDA for all subsidised installations",
               hi: "सिक्किम के घरों, किसानों और संस्थानों के लिए सब्सिडाइज्ड सौर ऊर्जा समाधान — मुख्य लाभ: घरेलू उपभोक्ताओं के लिए 3 kW तक ग्रिड-कनेक्टेड रूफटॉप सोलर सिस्टम पर 40% राज्य सब्सिडी (30% केंद्रीय PM सूर्य घर सब्सिडी के अतिरिक्त) — प्रभावी संयुक्त सब्सिडी 70% तक; उत्तर और पश्चिम सिक्किम के दूरदराज के गांवों में ग्रिड से परे घरों के लिए पूर्णतः सब्सिडाइज्ड ऑफ-ग्रिड सौर होम लाइटिंग सिस्टम; घरों के लिए सौर वॉटर हीटर पर 60% सब्सिडी; जनजातीय बस्तियों में निःशुल्क सौर लालटेन; किसानों के लिए 50% पूंजी लागत सब्सिडी पर सौर-संचालित कोल्ड स्टोरेज; नेट मीटरिंग लाभार्थियों के लिए ₹2,000 प्रति kW वार्षिक उत्पादन प्रोत्साहन; SREDA-पैनल स्थानीय तकनीशियनों द्वारा स्थापना और रखरखाव; सभी सब्सिडाइज्ड संस्थापनाओं के लिए 2 वर्ष की निःशुल्क रखरखाव वारंटी" },
    tag:     { en: "Solar / Energy / Subsidy / Green", hi: "सौर / ऊर्जा / सब्सिडी / हरित" },
    annual: 2000,
    apply:   { en: "sreda.sikkim.gov.in / District Energy Office (offline)", hi: "sreda.sikkim.gov.in / जिला ऊर्जा कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate", "Electricity Consumer Number / Latest Electricity Bill", "Residence / House Ownership Proof", "Bank Account (Aadhaar-linked)", "BPL / Income Certificate (for fully subsidised off-grid system)", "Passport Photo", "Roof photograph / site inspection clearance"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र", "बिजली उपभोक्ता नंबर / नवीनतम बिजली बिल", "निवास / मकान स्वामित्व प्रमाण", "बैंक खाता (आधार-लिंक्ड)", "BPL / आय प्रमाण पत्र (पूर्णतः सब्सिडाइज्ड ऑफ-ग्रिड सिस्टम के लिए)", "पासपोर्ट फोटो", "छत की तस्वीर / साइट निरीक्षण क्लीयरेंस"] },
    match: (a) => a.state === "Sikkim",
  },

  // ── SKILL DEVELOPMENT / VOCATIONAL ───────────────────────────────────────

  {
    id: "sikkim_skill_dev_mission",
    icon: "🛠️", color: "#1D4ED8", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Skill Development Mission (SSDM) / Labour Dept.", hi: "सिक्किम कौशल विकास मिशन (SSDM) / श्रम विभाग" },
    name:    { en: "Sikkim Skill Development Mission — Free Vocational Training",
               hi: "सिक्किम कौशल विकास मिशन — निःशुल्क व्यावसायिक प्रशिक्षण" },
    benefit: { en: "Free short-term and long-term vocational training for unemployed Sikkim Subject holders of age 18–40 to enhance employability in state-priority sectors — key benefits: 3–12 month fully free residential and non-residential courses at Sikkim ITIs (Rangpo, Jorethang, Gangtok), SSDM training centres, and partner private institutes; courses include: hospitality & hotel management, electrical work, plumbing, construction masonry, mobile phone repair, computer hardware, tally & accounts, nursing assistant, beauty & wellness, and Sikkim-specific crafts (thangka painting, bamboo-cane work, traditional weaving); ₹1,000 per month stipend for outstation trainees during training period; free NSQF-certified course completion certificate recognised nationally; 70% placement assistance through SSDM job portal and industry tie-ups with Sikkim hotels, hospitals, and government departments; special 6-month advanced course for ex-servicemen in security services and logistics; free tools/equipment kit at course completion for self-employment track trainees; priority for SC/ST, BPL, differently-abled, and women applicants",
               hi: "18–40 आयु वर्ग के बेरोजगार सिक्किम सब्जेक्ट धारकों के लिए राज्य-प्राथमिकता क्षेत्रों में रोजगार योग्यता बढ़ाने हेतु निःशुल्क लघु और दीर्घकालिक व्यावसायिक प्रशिक्षण — मुख्य लाभ: सिक्किम ITIs (रंगपो, जोरेथांग, गंगटोक), SSDM प्रशिक्षण केंद्रों और भागीदार निजी संस्थानों में 3–12 माह के पूर्णतः निःशुल्क आवासीय और गैर-आवासीय पाठ्यक्रम; पाठ्यक्रमों में: आतिथ्य एवं होटल प्रबंधन, विद्युत कार्य, प्लंबिंग, निर्माण चिनाई, मोबाइल मरम्मत, कंप्यूटर हार्डवेयर, टैली एवं एकाउंट्स, नर्सिंग सहायक, सौंदर्य एवं कल्याण, और सिक्किम-विशिष्ट शिल्प शामिल; बाहरी प्रशिक्षुओं के लिए प्रशिक्षण अवधि में ₹1,000 प्रतिमाह वजीफा; NSQF-प्रमाणित निःशुल्क पाठ्यक्रम समापन प्रमाण पत्र; SSDM जॉब पोर्टल के माध्यम से 70% प्लेसमेंट सहायता; पाठ्यक्रम समापन पर स्वरोजगार ट्रैक प्रशिक्षुओं को निःशुल्क उपकरण किट" },
    tag:     { en: "Youth / Skill / Vocational / Employment", hi: "युवा / कौशल / व्यावसायिक / रोजगार" },
    annual: 12000,
    apply:   { en: "ssdm.sikkim.gov.in / Nearest ITI or SSDM Centre (offline)", hi: "ssdm.sikkim.gov.in / निकटतम ITI या SSDM केंद्र (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate (mandatory)", "Educational Qualification Certificate (minimum Class VIII pass)", "Age Proof (Birth Certificate / Voter ID)", "Residence Certificate (Sikkim)", "Bank Account (Aadhaar-linked)", "Caste Certificate (for priority admission — SC/ST/OBC)", "Disability Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र (अनिवार्य)", "शैक्षिक योग्यता प्रमाण पत्र (न्यूनतम कक्षा VIII उत्तीर्ण)", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "निवास प्रमाण पत्र (सिक्किम)", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (SC/ST/OBC प्राथमिकता प्रवेश के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && (a.who === "unemployed" || a.who === "student" || a.who === "general") && a.age >= 18 && a.age <= 40,
  },

  // ── SPORTS & YOUTH DEVELOPMENT ────────────────────────────────────────────

  {
    id: "sikkim_sports_dev",
    icon: "🏅", color: "#0F766E", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Sports & Youth Affairs Dept. / Sikkim State Sports Council", hi: "सिक्किम खेल एवं युवा मामले विभाग / सिक्किम राज्य खेल परिषद" },
    name:    { en: "Sikkim Sports Excellence & Youth Development Scheme",
               hi: "सिक्किम खेल उत्कृष्टता एवं युवा विकास योजना" },
    benefit: { en: "Financial and institutional support for Sikkim's talented young athletes and sports infrastructure — key benefits: monthly stipend of ₹3,000–₹8,000 for selected athletes in priority sports — football, archery, boxing, weight-lifting, tae-kwon-do, and traditional Sikkimese games (Dahi Handi, Kabaddi) — shortlisted through district-level trials; free residential training at Paljor Stadium Complex, Gangtok and district sports training centres with diet allowance of ₹150/day; full sponsorship (travel, kit, accommodation, entry fee) for athletes representing Sikkim at National Games, Khelo India Games, and South Asian Games; ₹25,000–₹5 lakh cash award for medal winners at national and international events (scaled by level and medal colour); ₹10,000 sports equipment grant per year for school-level athletes identified as outstanding by their Sports Teacher; free sports injury treatment and physiotherapy at SSNM District Hospital, Gangtok; grassroots coaching programme — 1 coach deployed per block for football and archery talent identification; sports scholarship for Class IX–XII students who represent state in national-level competitions",
               hi: "सिक्किम के प्रतिभाशाली युवा एथलीटों और खेल बुनियादी ढांचे के लिए वित्तीय और संस्थागत सहायता — मुख्य लाभ: प्राथमिकता वाले खेलों में चुने गए एथलीटों के लिए ₹3,000–₹8,000 मासिक वजीफा; पलजोर स्टेडियम कॉम्प्लेक्स, गंगटोक और जिला खेल प्रशिक्षण केंद्रों में ₹150/दिन आहार भत्ते के साथ निःशुल्क आवासीय प्रशिक्षण; राष्ट्रीय खेल, खेलो इंडिया और दक्षिण एशियाई खेलों में सिक्किम का प्रतिनिधित्व करने वाले एथलीटों को पूर्ण प्रायोजन; राष्ट्रीय और अंतरराष्ट्रीय आयोजनों में पदक विजेताओं को ₹25,000–₹5 लाख नकद पुरस्कार; उत्कृष्ट विद्यालय-स्तरीय एथलीटों के लिए ₹10,000 खेल उपकरण अनुदान; SSNM जिला अस्पताल में निःशुल्क खेल चोट उपचार और फिजियोथेरेपी; प्रत्येक ब्लॉक में 1 कोच प्रतिनियुक्ति; राष्ट्रीय प्रतियोगिताओं में राज्य का प्रतिनिधित्व करने वाले कक्षा IX–XII छात्रों के लिए खेल छात्रवृत्ति" },
    tag:     { en: "Youth / Sports / Scholarship / Award", hi: "युवा / खेल / छात्रवृत्ति / पुरस्कार" },
    annual: 96000,
    apply:   { en: "sportsyouth.sikkim.gov.in / District Sports Officer (offline)", hi: "sportsyouth.sikkim.gov.in / जिला खेल अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate", "Age Proof / Birth Certificate", "School / College Enrollment Certificate", "Sports Achievement Certificates (district/state/national)", "Recommendation Letter from School Sports Teacher / District Sports Officer", "Bank Account (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र", "आयु प्रमाण / जन्म प्रमाण पत्र", "विद्यालय / महाविद्यालय नामांकन प्रमाण पत्र", "खेल उपलब्धि प्रमाण पत्र (जिला/राज्य/राष्ट्रीय)", "विद्यालय खेल शिक्षक / जिला खेल अधिकारी से अनुशंसा पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && (a.who === "student" || a.who === "general" || a.who === "unemployed") && a.age >= 10 && a.age <= 30,
  },

  // ── FOOD SECURITY / PDS ───────────────────────────────────────────────────

  {
    id: "sikkim_food_security",
    icon: "🌾", color: "#15803D", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Food & Civil Supplies Dept. / Sikkim State Food Security Scheme (SFSS)", hi: "सिक्किम खाद्य एवं नागरिक आपूर्ति विभाग / सिक्किम राज्य खाद्य सुरक्षा योजना (SFSS)" },
    name:    { en: "Sikkim State Food Security Scheme — Subsidised Ration & Nutrition Support",
               hi: "सिक्किम राज्य खाद्य सुरक्षा योजना — सब्सिडाइज्ड राशन एवं पोषण सहायता" },
    benefit: { en: "Subsidised food grain entitlements for Sikkim Subject holders under the National Food Security Act (NFSA) topped up by the state — key benefits: Priority Household (PHH) beneficiaries receive 5 kg rice per person per month at ₹1/kg (below NFSA rate — fully subsidised by Sikkim state government); Antyodaya Anna Yojana (AAY) families — the poorest of poor — receive 35 kg grain per family per month at ₹1/kg; additional state-funded supplementary nutrition: 1 litre edible oil per family per month at ₹20 (heavily subsidised); iodised salt pack at ₹2/kg; pulses (lentils) 1 kg per family at ₹10 under Chief Minister's Dal-Bhaat scheme; free monthly ration for destitute elderly (above 75 years) with no family support — doorstep delivery through Fair Price Shops; special nutritional supplement for pregnant & lactating women and children under 6 (in convergence with ICDS/Anganwadi); free school mid-day meal coverage for all government school students in Sikkim — includes egg / banana supplementation twice a week",
               hi: "राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) के तहत सिक्किम राज्य द्वारा पूरक सिक्किम सब्जेक्ट धारकों के लिए सब्सिडाइज्ड खाद्यान्न हकदारी — मुख्य लाभ: PHH लाभार्थियों को ₹1/किग्रा पर 5 किग्रा चावल प्रति व्यक्ति प्रति माह; AAY परिवारों को ₹1/किग्रा पर 35 किग्रा अनाज प्रति परिवार प्रति माह; ₹20 पर 1 लीटर खाद्य तेल; ₹2/किग्रा पर आयोडीनयुक्त नमक; मुख्यमंत्री दाल-भात योजना के तहत ₹10 पर 1 किग्रा दालें; परिवार के बिना 75 वर्ष से अधिक आयु के बेसहारा बुजुर्गों के लिए उचित मूल्य दुकानों के माध्यम से दरवाजे पर मुफ्त मासिक राशन; गर्भवती महिलाओं, स्तनपान कराने वाली माताओं और 6 वर्ष से कम उम्र के बच्चों के लिए विशेष पोषण पूरक; सरकारी विद्यालय के छात्रों के लिए मध्याह्न भोजन" },
    tag:     { en: "Food / Ration / PDS / Nutrition", hi: "खाद्य / राशन / PDS / पोषण" },
    annual: 0,
    apply:   { en: "food.sikkim.gov.in / Nearest Fair Price Shop / Block Food Officer (offline)", hi: "food.sikkim.gov.in / निकटतम उचित मूल्य दुकान / ब्लॉक खाद्य अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (all family members)", "Ration Card / Application for new ration card", "Sikkim Subject Certificate", "Residence / Domicile Certificate (Sikkim)", "Income Certificate / BPL Certificate", "Passport Photo (head of family)", "Family composition declaration"],
               hi: ["आधार कार्ड (सभी परिवार सदस्य)", "राशन कार्ड / नए राशन कार्ड के लिए आवेदन", "सिक्किम सब्जेक्ट प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (सिक्किम)", "आय प्रमाण पत्र / BPL प्रमाण पत्र", "पासपोर्ट फोटो (परिवार के मुखिया)", "परिवार संरचना घोषणा"] },
    match: (a) => a.state === "Sikkim" && ["below1","1to3"].includes(a.income),
  },

  // ── DISASTER RELIEF / REHABILITATION ─────────────────────────────────────

  {
    id: "sikkim_glof_disaster_relief",
    icon: "🆘", color: "#991B1B", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim State Disaster Management Authority (SSDMA) / Revenue & Disaster Management Dept.", hi: "सिक्किम राज्य आपदा प्रबंधन प्राधिकरण (SSDMA) / राजस्व एवं आपदा प्रबंधन विभाग" },
    name:    { en: "Sikkim Disaster Relief & GLOF Rehabilitation Scheme",
               hi: "सिक्किम आपदा राहत एवं GLOF पुनर्वास योजना" },
    benefit: { en: "Emergency and long-term rehabilitation support for Sikkim Subject holders affected by natural disasters — particularly the October 2023 South Lhonak Lake GLOF (Glacial Lake Outburst Flood) which devastated North Sikkim — key benefits: immediate relief cash of ₹5,000 per affected family within 7 days of disaster declaration; free temporary shelter (pre-fabricated housing or relief camp) for displaced families; ex-gratia of ₹4 lakh for death of a family member due to natural disaster (under SDRF norms); ₹1.10 lakh for full house collapse, ₹52,000 for partial damage, ₹3,200 for hut/kaccha house loss; agricultural land loss compensation: ₹18,000 per hectare for crop damage; full waiver of outstanding agricultural loans for disaster-affected farmers under Kisan Credit Card; free replacement of lost livestock — 1 milch cow or 5 goats per displaced farming family; priority housing under PMAY-Gramin for families who lost permanent homes; free counselling and mental health support at district hospitals; special GLOF-safe resettlement plots in Mangan and Chungthang for displaced North Sikkim communities; school re-enrollment support including free stationery and uniform for disaster-affected children",
               hi: "प्राकृतिक आपदाओं से प्रभावित सिक्किम सब्जेक्ट धारकों के लिए आपातकालीन और दीर्घकालिक पुनर्वास सहायता — मुख्य लाभ: आपदा घोषणा के 7 दिनों के भीतर प्रति प्रभावित परिवार ₹5,000 तत्काल राहत नकद; विस्थापित परिवारों के लिए निःशुल्क अस्थायी आश्रय; प्राकृतिक आपदा से मृत्यु पर ₹4 लाख अनुग्रह राशि; पूर्ण मकान क्षति के लिए ₹1.10 लाख, आंशिक क्षति के लिए ₹52,000; ₹18,000 प्रति हेक्टेयर फसल क्षति मुआवजा; आपदा-प्रभावित किसानों के लिए KCC बकाया ऋण माफी; विस्थापित परिवार को 1 दुधारू गाय या 5 बकरी निःशुल्क; PMAY-ग्रामीण के तहत प्राथमिकता आवास; जिला अस्पतालों में निःशुल्क मानसिक स्वास्थ्य सहायता; उत्तर सिक्किम समुदायों के लिए GLOF-सुरक्षित पुनर्वास भूखंड; आपदा-प्रभावित बच्चों के लिए निःशुल्क स्टेशनरी और वर्दी सहित स्कूल पुनः नामांकन सहायता" },
    tag:     { en: "Disaster / Relief / Rehabilitation / GLOF", hi: "आपदा / राहत / पुनर्वास / GLOF" },
    annual: 0,
    apply:   { en: "ssdma.sikkim.gov.in / District Collector / Sub-Divisional Magistrate (SDM) (offline)", hi: "ssdma.sikkim.gov.in / जिला कलेक्टर / उप-मंडल मजिस्ट्रेट (SDM) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate", "Disaster Victim / Affected Family Declaration (from local authority)", "Proof of loss — photograph of damaged house / land", "Death Certificate (for ex-gratia claim)", "Bank Account (Aadhaar-linked)", "Residence / Domicile Proof (Sikkim)", "Land / Property Records (for land loss claims)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र", "आपदा पीड़ित / प्रभावित परिवार घोषणा (स्थानीय प्राधिकरण से)", "हानि का प्रमाण — क्षतिग्रस्त मकान / भूमि की तस्वीर", "मृत्यु प्रमाण पत्र (अनुग्रह दावे के लिए)", "बैंक खाता (आधार-लिंक्ड)", "निवास / अधिवास प्रमाण (सिक्किम)", "भूमि / संपत्ति अभिलेख (भूमि हानि दावों के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim",
  },

  // ── SOCIAL / MARRIAGE ASSISTANCE ─────────────────────────────────────────

  {
    id: "sikkim_kanyadan_marriage",
    icon: "💐", color: "#BE185D", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / Chief Minister's Kanyadan & Marriage Assistance Scheme", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / मुख्यमंत्री कन्यादान एवं विवाह सहायता योजना" },
    name:    { en: "Chief Minister's Kanyadan & Marriage Assistance Scheme — Sikkim",
               hi: "मुख्यमंत्री कन्यादान एवं विवाह सहायता योजना — सिक्किम" },
    benefit: { en: "Financial assistance to BPL families and vulnerable groups for solemnising marriages of daughters — key benefits: ₹25,000 one-time cash assistance per marriage for daughters of BPL / EWS Sikkim Subject holder families; enhanced ₹30,000 for daughters belonging to SC/ST communities or differently-abled brides; assistance can be used for marriage expenses — wedding ceremony, household items, trousseau; collective/mass marriage (Samuhik Vivah) programme organised by district Social Welfare Office — fully subsidised ceremony covering meals, venue, registration, and ₹10,000 cash gift per couple; ₹5,000 special incentive for inter-caste marriage between Scheduled Caste and non-SC Sikkim Subject holders (promoting social harmony); free legal marriage registration support through sub-registrar office; widow remarriage assistance: ₹20,000 for widows below 45 years remarrying; applicable for the first two daughters only per family; girl must be above 18 years and groom above 21 years of age; application within 6 months of marriage",
               hi: "पुत्रियों के विवाह के लिए BPL परिवारों और असुरक्षित समूहों को वित्तीय सहायता — मुख्य लाभ: BPL/EWS सिक्किम सब्जेक्ट धारक परिवारों की बेटियों के प्रत्येक विवाह के लिए ₹25,000 एकमुश्त नकद; SC/ST या दिव्यांग दुल्हन के लिए ₹30,000; सामूहिक विवाह कार्यक्रम में पूर्णतः सब्सिडाइज्ड समारोह और प्रति जोड़े ₹10,000 नकद उपहार; SC और गैर-SC सिक्किम सब्जेक्ट धारकों के बीच अंतर-जातीय विवाह के लिए ₹5,000 विशेष प्रोत्साहन; उप-रजिस्ट्रार कार्यालय के माध्यम से निःशुल्क कानूनी विवाह पंजीकरण सहायता; 45 वर्ष से कम आयु की विधवाओं के पुनर्विवाह पर ₹20,000; प्रति परिवार केवल पहली दो बेटियों के लिए लागू; लड़की की आयु 18+ और लड़के की आयु 21+ होनी चाहिए; विवाह के 6 माह के भीतर आवेदन" },
    tag:     { en: "Women / Marriage / Social Assistance / BPL", hi: "महिला / विवाह / सामाजिक सहायता / BPL" },
    annual: 0,
    apply:   { en: "socialwelfare.sikkim.gov.in / District Social Welfare Office (offline)", hi: "socialwelfare.sikkim.gov.in / जिला समाज कल्याण कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (bride and parents)", "Sikkim Subject Certificate", "BPL / Income Certificate (family annual income below ₹1.5 lakh)", "Bride's Age Proof — Birth Certificate / Class X Certificate (must be 18+)", "Groom's Age Proof (must be 21+)", "Marriage Certificate / Registration (or invitation card at time of application)", "Caste Certificate (for SC/ST enhanced grant)", "Bank Account (Aadhaar-linked, in bride's or family's name)", "Passport Photo (bride)", "Disability Certificate (if applicable)"],
               hi: ["आधार कार्ड (दुल्हन और माता-पिता)", "सिक्किम सब्जेक्ट प्रमाण पत्र", "BPL / आय प्रमाण पत्र (पारिवारिक वार्षिक आय ₹1.5 लाख से कम)", "दुल्हन का आयु प्रमाण — जन्म प्रमाण पत्र / कक्षा X प्रमाण पत्र (18+ होना चाहिए)", "दूल्हे का आयु प्रमाण (21+ होना चाहिए)", "विवाह प्रमाण पत्र / पंजीकरण (या आवेदन के समय निमंत्रण कार्ड)", "जाति प्रमाण पत्र (SC/ST उन्नत अनुदान के लिए)", "बैंक खाता (आधार-लिंक्ड, दुल्हन या परिवार के नाम)", "पासपोर्ट फोटो (दुल्हन)", "दिव्यांगता प्रमाण पत्र (यदि लागू)"] },
    match: (a) => a.state === "Sikkim" && a.gender === "female" && ["below1","1to3"].includes(a.income) && a.age >= 18 && a.age <= 45,
  },

  // ADD MORE SIKKIM SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "sikkim_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Sikkim",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Sikkim",
  // },

];
