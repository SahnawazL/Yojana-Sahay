// Arunachal Pradesh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "ap_arunachal_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const ARUNACHAL_PRADESH_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "arunachal_cm_agriculture",
    icon: "🌾", color: "#15803D", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Agriculture Dept. / Chief Minister's Agriculture Allied Sector Scheme (CMAAS)", hi: "अरुणाचल प्रदेश कृषि विभाग / मुख्यमंत्री कृषि संबद्ध क्षेत्र योजना (CMAAS)" },
    name:    { en: "Chief Minister's Agriculture Allied Sector Scheme (CMAAS) — Arunachal Pradesh",
               hi: "मुख्यमंत्री कृषि संबद्ध क्षेत्र योजना (CMAAS) — अरुणाचल प्रदेश" },
    benefit: { en: "Flagship state agriculture support scheme providing registered farmers with: 50–75% subsidised supply of improved seeds (paddy, maize, millet, wheat, pulses suited to hill agriculture); free soil health card and soil testing at district agriculture office every two years; supply of farm implements and power tillers at 60% subsidy for small and marginal farmers; demonstration plots and farmer field schools at village level under Krishi Vigyan Kendras; integrated pest management (IPM) training to reduce chemical input dependence; special thrust on wet rice cultivation in the valleys and terrace farming in the hills; convergence with RKVY (Rashtriya Krishi Vikas Yojana) for additional input subsidy; covers all 26 districts of Arunachal Pradesh with priority to remote frontier districts (Anjaw, Dibang Valley, Upper Siang, Kurung Kumey)",
               hi: "प्रमुख राज्य कृषि सहायता योजना जो पंजीकृत किसानों को प्रदान करती है: उन्नत बीज (धान, मक्का, बाजरा, गेहूं, दलहन) की 50–75% सब्सिडी आपूर्ति; जिला कृषि कार्यालय में हर दो वर्ष निःशुल्क मृदा स्वास्थ्य कार्ड; छोटे व सीमांत किसानों को 60% सब्सिडी पर कृषि उपकरण और पावर टिलर; KVKs के तहत ग्राम स्तर पर प्रदर्शन भूखंड और किसान-क्षेत्र विद्यालय; IPM प्रशिक्षण; घाटियों में सिंचित धान खेती और पहाड़ी सीढ़ीदार खेती पर विशेष ध्यान; RKVY से अभिसरण; सभी 26 जिलों में कवरेज, दूरदराज सीमावर्ती जिलों (अंजॉ, दिबांग घाटी, ऊपरी सियांग, कुरुंग कुमे) को प्राथमिकता" },
    tag:     { en: "Farmer / Input Subsidy / Hill Agriculture", hi: "किसान / इनपुट सब्सिडी / पहाड़ी खेती" },
    annual: 0,
    apply:   { en: "arunachalpradesh.gov.in/agriculture / District Agriculture Officer (offline)", hi: "arunachalpradesh.gov.in/agriculture / जिला कृषि अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Land Record / Patta (or Village Council Land Use Certificate for shifting cultivation)", "Permanent Resident Certificate (PRC) of Arunachal Pradesh", "ST Certificate (Arunachal Pradesh)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "भूमि अभिलेख / पट्टा (झूम खेती के लिए ग्राम परिषद भूमि उपयोग प्रमाण पत्र)", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC)", "ST प्रमाण पत्र (अरुणाचल प्रदेश)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Arunachal Pradesh" && a.who === "farmer",
  },

  {
    id: "arunachal_horticulture_mission",
    icon: "🍊", color: "#D97706", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Horticulture Dept. / State Horticulture Mission (SHM)", hi: "अरुणाचल प्रदेश बागवानी विभाग / राज्य बागवानी मिशन (SHM)" },
    name:    { en: "Arunachal Pradesh State Horticulture Mission — Farmer Support",
               hi: "अरुणाचल प्रदेश राज्य बागवानी मिशन — किसान सहायता" },
    benefit: { en: "Comprehensive horticulture development scheme leveraging Arunachal Pradesh's diverse agro-climatic zones for high-value fruit and spice cultivation — key benefits: 50–75% subsidy on planting material for kiwi, apple, mandarin orange, pineapple, passion fruit, large cardamom, ginger, and turmeric (major cash crops of Arunachal); 60% subsidy on drip and sprinkler irrigation systems for hill terrace farms; polyhouse/greenhouse setup subsidy up to ₹56,000 per unit (60% of cost); free cold storage access at district level to reduce post-harvest losses; market linkage through NAFED and state-level horticulture cooperatives; training at Central Horticultural Experiment Station (CHES), Sangla; ₹7,500 per hectare incentive for maintaining certified orchard; special assistance for Apatani (Ziro Valley) wetland rice and pisciculture integrated farming system",
               hi: "उच्च-मूल्य फल और मसाला खेती के लिए अरुणाचल की विविध कृषि-जलवायु क्षेत्रों का उपयोग करने वाली व्यापक बागवानी विकास योजना — मुख्य लाभ: कीवी, सेब, मेंडेरिन संतरा, अनानास, पैशन फ्रूट, बड़ी इलायची, अदरक और हल्दी के पौध सामग्री पर 50–75% सब्सिडी; 60% ड्रिप और स्प्रिंकलर सिंचाई सब्सिडी; ₹56,000 तक पॉलीहाउस सब्सिडी; जिला स्तर पर निःशुल्क कोल्ड स्टोरेज; NAFED और राज्य बागवानी सहकारी समितियों के माध्यम से बाजार संपर्क; CHES संगला में प्रशिक्षण; प्रमाणित बाग बनाए रखने पर ₹7,500/हेक्टेयर प्रोत्साहन; आपातानी (जीरो घाटी) एकीकृत धान-मत्स्य पालन प्रणाली के लिए विशेष सहायता" },
    tag:     { en: "Farmer / Horticulture / Kiwi-Apple-Cardamom", hi: "किसान / बागवानी / कीवी-सेब-इलायची" },
    annual: 7500,
    apply:   { en: "arunachalpradesh.gov.in/horticulture / District Horticulture Officer (offline)", hi: "arunachalpradesh.gov.in/horticulture / जिला बागवानी अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Land Record / Patta (proof of cultivable land holding)", "Permanent Resident Certificate (PRC) of Arunachal Pradesh", "ST Certificate (Arunachal Pradesh)", "Bank Account (Aadhaar-linked)", "Existing crop / land use details", "Passport Photo"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "भूमि अभिलेख / पट्टा (कृषि योग्य भूमि का प्रमाण)", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC)", "ST प्रमाण पत्र (अरुणाचल प्रदेश)", "बैंक खाता (आधार-लिंक्ड)", "मौजूदा फसल / भूमि उपयोग विवरण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Arunachal Pradesh" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "arunachal_apslrm_shg",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh State Livelihoods & Rural Management Society (APSLRMS) / Rural Development Dept.", hi: "अरुणाचल प्रदेश राज्य आजीविका एवं ग्रामीण प्रबंधन सोसायटी (APSLRMS) / ग्रामीण विकास विभाग" },
    name:    { en: "Arunachal Pradesh State Livelihoods Mission — Women SHG Support",
               hi: "अरुणाचल प्रदेश राज्य आजीविका मिशन — महिला SHG सहायता" },
    benefit: { en: "Comprehensive livelihood support for rural women through Self-Help Groups (SHGs) across Arunachal Pradesh — key benefits: ₹15,000 interest-free revolving fund for newly formed SHGs; community investment fund (CIF) loans up to ₹3 lakh per SHG at subsidised rates for income-generating activities; skill development training in Arunachal's traditional crafts — cane and bamboo weaving, Adi, Nyishi, Monpa, and Apatani handloom textiles, food processing (bamboo shoot, pickles, wild honey), and eco-tourism homestay management; market linkage through state-level fairs and 'Arunachal Handloom & Handicraft' brand; group insurance coverage under PM Jeevan Jyoti and Suraksha Bima; connects to MUDRA pipeline for individual business loans; covers all 26 districts with priority to remote frontier districts and women from ILP-zone villages; special focus on tribal women artisans preserving indigenous craft traditions",
               hi: "अरुणाचल प्रदेश में SHGs के माध्यम से ग्रामीण महिलाओं को व्यापक आजीविका सहायता — मुख्य लाभ: नए गठित SHGs को ₹15,000 ब्याज-मुक्त रिवॉल्विंग फंड; आय-सृजन के लिए प्रति SHG ₹3 लाख तक सब्सिडी दर पर CIF ऋण; पारंपरिक शिल्प — बेंत-बांस बुनाई, आदि, न्यिशी, मोनपा और आपातानी हथकरघा, खाद्य प्रसंस्करण (बांस की कोंपलें, अचार, जंगली शहद) और इको-टूरिज्म होमस्टे प्रबंधन में कौशल प्रशिक्षण; 'अरुणाचल हैंडलूम एंड हैंडीक्राफ्ट' ब्रांड के माध्यम से बाजार संपर्क; PMJJBY और PMSBY के तहत सामूहिक बीमा; MUDRA पाइपलाइन से जुड़ाव; सभी 26 जिलों में कवरेज; आदिवासी महिला कारीगरों पर विशेष ध्यान" },
    tag:     { en: "Women / SHG / Livelihood / Tribal Craft", hi: "महिला / SHG / आजीविका / जनजातीय शिल्प" },
    annual: 0,
    apply:   { en: "arunachalpradesh.gov.in/rural / Block Development Officer (offline)", hi: "arunachalpradesh.gov.in/rural / ब्लॉक विकास अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG Passbook", "Bank Account (SHG joint account)", "Permanent Resident Certificate (PRC) of Arunachal Pradesh", "ST Certificate (Arunachal Pradesh)", "Passport Photo", "BPL Card (if applicable for priority)"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG संयुक्त खाता)", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC)", "ST प्रमाण पत्र (अरुणाचल प्रदेश)", "पासपोर्ट फोटो", "BPL कार्ड (प्राथमिकता के लिए यदि लागू हो)"] },
    match: (a) => a.state === "Arunachal Pradesh" && a.who === "women",
  },

  {
    id: "arunachal_maternity_benefit",
    icon: "🤱", color: "#9333EA", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Health & Family Welfare Dept. / Social Welfare Dept.", hi: "अरुणाचल प्रदेश स्वास्थ्य एवं परिवार कल्याण विभाग / समाज कल्याण विभाग" },
    name:    { en: "Arunachal Pradesh Maternity Benefit & Institutional Delivery Scheme",
               hi: "अरुणाचल प्रदेश मातृत्व लाभ एवं संस्थागत प्रसव योजना" },
    benefit: { en: "Comprehensive maternal and newborn health support for women across Arunachal Pradesh — key benefits: ₹6,000 cash incentive for institutional delivery under JSY (Janani Suraksha Yojana) for BPL/SC/ST mothers — ₹3,000 on ANC registration + ₹3,000 post delivery; additional ₹2,500 state top-up for deliveries in remote and hard-to-reach areas (Category A & B districts — Dibang Valley, Anjaw, Upper Subansiri, Kurung Kumey, etc.); free ante-natal check-ups, iron-folic acid supplementation, TT immunisation, and ultrasound at government hospitals and CHCs; free transport from remote villages to district hospital through Asha & emergency transport scheme; free nutritional supplement kit for 6 months post delivery (Poshan kit with cereals, pulses, micronutrient sachets); free institutional delivery including C-section at district hospitals under Aarogyamaan Arunachal; new-born screening and BCG/OPV immunisation at delivery; special Asha incentive ensures house-to-house tracking in remote frontier areas",
               hi: "अरुणाचल प्रदेश में महिलाओं के लिए व्यापक मातृत्व एवं नवजात स्वास्थ्य सहायता — मुख्य लाभ: BPL/SC/ST माताओं के लिए JSY के तहत संस्थागत प्रसव पर ₹6,000 नकद प्रोत्साहन; दूरदराज क्षेत्रों में प्रसव के लिए ₹2,500 अतिरिक्त राज्य टॉप-अप; सरकारी अस्पतालों और CHCs पर निःशुल्क ANC जांच, IFA, TT टीकाकरण और अल्ट्रासाउंड; आशा और आपातकालीन परिवहन के माध्यम से निःशुल्क परिवहन; प्रसव के बाद 6 महीने के लिए निःशुल्क पोषण किट; आरोग्यमान अरुणाचल के तहत C-सेक्शन सहित निःशुल्क संस्थागत प्रसव; नवजात स्क्रीनिंग और BCG/OPV टीकाकरण" },
    tag:     { en: "Women / Maternity / Institutional Delivery", hi: "महिला / मातृत्व / संस्थागत प्रसव" },
    annual: 8500,
    apply:   { en: "Nearest PHC / Community Health Centre / District Hospital / ASHA worker (offline)", hi: "निकटतम PHC / सामुदायिक स्वास्थ्य केंद्र / जिला अस्पताल / आशा कार्यकर्ता (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Permanent Resident Certificate (PRC) of Arunachal Pradesh", "Mother & Child Protection (MCP) Card", "BPL / Income Certificate (for BPL category incentive)", "ST Certificate (for ST category incentive)", "Pregnancy Registration Certificate (from PHC)", "Bank Account (Aadhaar-linked)", "Passport Photo"],
               hi: ["आधार कार्ड", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC)", "माँ एवं बाल संरक्षण (MCP) कार्ड", "BPL / आय प्रमाण पत्र (BPL श्रेणी प्रोत्साहन के लिए)", "ST प्रमाण पत्र (ST श्रेणी प्रोत्साहन के लिए)", "गर्भावस्था पंजीकरण प्रमाण पत्र (PHC से)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Arunachal Pradesh" && a.who === "women",
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "arunachal_cm_rural_housing",
    icon: "🏠", color: "#B45309", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Rural Development Dept. / Chief Minister's Rural Housing Scheme", hi: "अरुणाचल प्रदेश ग्रामीण विकास विभाग / मुख्यमंत्री ग्रामीण आवास योजना" },
    name:    { en: "Chief Minister's Rural Housing Scheme — Arunachal Pradesh",
               hi: "मुख्यमंत्री ग्रामीण आवास योजना — अरुणाचल प्रदेश" },
    benefit: { en: "Financial assistance to BPL/EWS rural households in Arunachal Pradesh for construction of safe, permanent houses — key benefits: ₹1.30 lakh–₹1.70 lakh one-time construction grant per household (higher slab for remote districts like Anjaw, Dibang Valley, Upper Siang, Kurung Kumey due to high material transportation costs); released in 3 installments tied to construction milestones (foundation, walls, and roof/completion); supplementary to PMAY-Gramin — households excluded from PMAY waitlist receive full state grant; earthquake-resistant and flood-safe construction mandatory given Arunachal's seismic zone V classification and annual flood risks; mandatory functional toilet, safe drinking water tap, and bamboo-based kitchen garden; construction using local bamboo and timber permitted under regulated guidelines; priority to ST households, female-headed families, persons with disability, and flood/landslide-displaced families; covers all 26 districts with convergence with MGNREGS for unskilled labour wages",
               hi: "अरुणाचल प्रदेश में BPL/EWS ग्रामीण परिवारों को सुरक्षित, स्थायी मकान के निर्माण हेतु वित्तीय सहायता — मुख्य लाभ: प्रति परिवार ₹1.30 लाख–₹1.70 लाख एकमुश्त निर्माण अनुदान (दूरदराज जिलों में अधिक स्लैब); निर्माण मील के पत्थर से जुड़ी 3 किस्तों में; PMAY-ग्रामीण का पूरक; भूकंप क्षेत्र V और वार्षिक बाढ़ जोखिम के कारण भूकंपरोधी एवं बाढ़-सुरक्षित निर्माण अनिवार्य; कार्यात्मक शौचालय, सुरक्षित पेयजल नल और बांस-आधारित किचन गार्डन अनिवार्य; नियमित दिशा-निर्देशों के तहत स्थानीय बांस और लकड़ी से निर्माण अनुमत; ST परिवारों, महिला-प्रमुख परिवारों, दिव्यांगजनों और बाढ़/भूस्खलन-विस्थापित परिवारों को प्राथमिकता; MGNREGS के साथ अभिसरण" },
    tag:     { en: "Housing / BPL / Rural / ST", hi: "आवास / BPL / ग्रामीण / ST" },
    annual: 170000,
    apply:   { en: "Nearest Block Development Officer (BDO) / Deputy Commissioner Office (offline)", hi: "निकटतम ब्लॉक विकास अधिकारी (BDO) / उपायुक्त कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Permanent Resident Certificate (PRC) of Arunachal Pradesh", "ST Certificate (Arunachal Pradesh — for priority)", "Land Ownership Document / Village Council Land Certificate", "Bank Account (Aadhaar-linked)", "Residence / Domicile Proof (Arunachal Pradesh)", "Disability Certificate (if applicable)", "Photograph of existing house / site", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण पत्र", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC)", "ST प्रमाण पत्र (अरुणाचल प्रदेश — प्राथमिकता के लिए)", "भूमि स्वामित्व दस्तावेज / ग्राम परिषद भूमि प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "निवास / अधिवास प्रमाण (अरुणाचल प्रदेश)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)", "मौजूदा मकान / स्थल की तस्वीर", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Arunachal Pradesh" && ["below1","1to3"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "arunachal_cmses",
    icon: "💼", color: "#0F766E", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Industries Dept. / Chief Minister's Self Employment Scheme (CMSES)", hi: "अरुणाचल प्रदेश उद्योग विभाग / मुख्यमंत्री स्वरोजगार योजना (CMSES)" },
    name:    { en: "Chief Minister's Self Employment Scheme (CMSES) — Arunachal Pradesh",
               hi: "मुख्यमंत्री स्वरोजगार योजना (CMSES) — अरुणाचल प्रदेश" },
    benefit: { en: "Collateral-free financial assistance to educated unemployed youth and first-generation entrepreneurs of Arunachal Pradesh to set up micro and small enterprises — key benefits: project loan of ₹50,000–₹20 lakh with 30–50% capital subsidy (higher subsidy for women, ST applicants, differently-abled, and applicants from remote frontier districts); bank loan component facilitated through Arunachal Pradesh Rural Bank and nationalised banks; free Entrepreneurship Development Programme (EDP) training through District Industries Centre (DIC) and APIIC (Arunachal Pradesh Industrial Infrastructure Corporation); priority sectors aligned with Arunachal's strengths: eco-tourism and homestay, bamboo & cane products, food processing (kiwi/orange/cardamom value addition, bamboo shoot processing), handloom textiles, fisheries and pisciculture, IT/digital services; special higher subsidy package for applicants from Category A districts (most remote districts); mandatory Permanent Resident Certificate (PRC) for eligibility",
               hi: "अरुणाचल प्रदेश के शिक्षित बेरोजगार युवाओं और पहली पीढ़ी के उद्यमियों को सूक्ष्म व लघु उद्यम स्थापित करने के लिए गारंटी-मुक्त वित्तीय सहायता — मुख्य लाभ: ₹50,000–₹20 लाख परियोजना ऋण, 30–50% पूंजी सब्सिडी (महिला, ST, दिव्यांग और दूरदराज जिलों के लिए अधिक); APRRB और राष्ट्रीयकृत बैंकों के माध्यम से बैंक ऋण; DIC और APIIC के माध्यम से निःशुल्क EDP प्रशिक्षण; प्राथमिक क्षेत्र: इको-टूरिज्म और होमस्टे, बांस-बेंत उत्पाद, खाद्य प्रसंस्करण, हथकरघा, मत्स्य पालन, IT/डिजिटल सेवाएं; श्रेणी A जिलों के आवेदकों के लिए उच्च सब्सिडी पैकेज; पात्रता के लिए PRC अनिवार्य" },
    tag:     { en: "Youth / Self-Employment / Entrepreneur", hi: "युवा / स्वरोजगार / उद्यमी" },
    annual: 0,
    apply:   { en: "arunachalpradesh.gov.in/industries / District Industries Centre (DIC) (offline)", hi: "arunachalpradesh.gov.in/industries / जिला उद्योग केंद्र (DIC) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Permanent Resident Certificate (PRC) of Arunachal Pradesh (mandatory)", "Age Proof (Birth Certificate / Voter ID)", "Educational Qualification Certificate", "ST Certificate (Arunachal Pradesh — for higher subsidy)", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "Disability Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC) (अनिवार्य)", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "शैक्षिक योग्यता प्रमाण पत्र", "ST प्रमाण पत्र (अरुणाचल प्रदेश — अधिक सब्सिडी के लिए)", "परियोजना रिपोर्ट / व्यवसाय योजना", "बैंक खाता (आधार-लिंक्ड)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Arunachal Pradesh" && (a.who === "unemployed" || a.who === "business" || a.who === "general") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── TRIBAL / SCHEDULED TRIBE WELFARE ─────────────────────────────────────

  {
    id: "arunachal_st_welfare",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Welfare of ST & BC Dept. / Tribal Research Institute (TRI)", hi: "अरुणाचल प्रदेश ST एवं BC कल्याण विभाग / जनजातीय अनुसंधान संस्थान (TRI)" },
    name:    { en: "Arunachal Pradesh Scheduled Tribe Welfare & Scholarship Schemes",
               hi: "अरुणाचल प्रदेश अनुसूचित जनजाति कल्याण एवं छात्रवृत्ति योजनाएं" },
    benefit: { en: "Arunachal Pradesh has over 26 major tribes (Adi, Nyishi, Galo, Apatani, Monpa, Wancho, Nocte, Tangsa, Idu Mishmi, Tagin, and others) — this cluster of schemes covers: (1) Pre-Matric Scholarship: ₹500–₹1,100 per month for ST students in Classes 9–10 studying in government or aided schools; (2) Post-Matric Scholarship: ₹750–₹1,500 per month for ST students in Class 11 through post-graduation; (3) Free Residential Gurukul / Tribal Hostels: hostel accommodation at district headquarters with free boarding, lodging, and study material for ST students studying away from home; (4) Cultural Preservation Grant: ₹5,000–₹10,000 per registered tribal cultural group for organising tribe-specific festivals, craft exhibitions, and language preservation activities; (5) Artisan Support: ₹4,000 annual tool kit grant for registered tribal artisans (weavers, cane-bamboo craftsmen, wood carvers); (6) Overseas Scholarship: full scholarship for meritorious ST students for higher education abroad; (7) PRC-based priority in all state government jobs and educational institutions",
               hi: "अरुणाचल प्रदेश में 26 से अधिक प्रमुख जनजातियां (आदि, न्यिशी, गालो, आपातानी, मोनपा, वांचो, नोक्टे, तांगसा, इडु मिश्मी, तागिन आदि) — इस समूह में शामिल हैं: (1) प्री-मैट्रिक छात्रवृत्ति: कक्षा 9–10 के ST छात्रों को ₹500–₹1,100/माह; (2) पोस्ट-मैट्रिक छात्रवृत्ति: कक्षा 11 से स्नातकोत्तर तक ₹750–₹1,500/माह; (3) निःशुल्क आवासीय गुरुकुल/जनजातीय छात्रावास: जिला मुख्यालय पर निःशुल्क बोर्डिंग, लॉजिंग और अध्ययन सामग्री; (4) सांस्कृतिक संरक्षण अनुदान: पंजीकृत जनजातीय सांस्कृतिक समूहों को ₹5,000–₹10,000; (5) कारीगर सहायता: पंजीकृत कारीगरों को ₹4,000 वार्षिक टूल किट; (6) विदेश छात्रवृत्ति: प्रतिभाशाली ST छात्रों के लिए विदेश में उच्च शिक्षा हेतु पूर्ण छात्रवृत्ति; (7) सभी राज्य सरकारी नौकरियों और संस्थानों में PRC-आधारित आरक्षण" },
    tag:     { en: "Tribal / ST / Scholarship / Cultural Welfare", hi: "जनजातीय / ST / छात्रवृत्ति / सांस्कृतिक कल्याण" },
    annual: 18000,
    apply:   { en: "arunachalpradesh.gov.in/tribal / District Welfare Officer (offline)", hi: "arunachalpradesh.gov.in/tribal / जिला कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST Certificate issued by Arunachal Pradesh Govt. (specifying tribe name)", "Permanent Resident Certificate (PRC) of Arunachal Pradesh (mandatory)", "Residence / Domicile Certificate (Arunachal Pradesh)", "Income Certificate (family annual income)", "Bank Account (Aadhaar-linked)", "Passport Photo", "For Students: School / College Enrollment Certificate & latest Mark Sheet", "For Artisans: Craft Registration Certificate from Handloom & Handicraft Dept.", "For Cultural Groups: Registration Certificate from District Cultural Officer"],
               hi: ["आधार कार्ड", "अरुणाचल प्रदेश सरकार द्वारा जारी ST प्रमाण पत्र (जनजाति का नाम सहित)", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC) (अनिवार्य)", "निवास / अधिवास प्रमाण पत्र (अरुणाचल प्रदेश)", "आय प्रमाण पत्र (पारिवारिक वार्षिक आय)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "छात्रों के लिए: विद्यालय/महाविद्यालय नामांकन प्रमाण पत्र एवं नवीनतम अंकतालिका", "कारीगरों के लिए: हथकरघा एवं हस्तशिल्प विभाग से शिल्प पंजीकरण प्रमाण पत्र", "सांस्कृतिक समूहों के लिए: जिला सांस्कृतिक अधिकारी से पंजीकरण प्रमाण पत्र"] },
    keywords: ["class10","class12"],
    match: (a) => a.state === "Arunachal Pradesh" && (a.caste === "st" || a.caste === "sc"),
  },

  // ── SENIOR / SOCIAL SECURITY ──────────────────────────────────────────────

  {
    id: "arunachal_ignoaps_state_topup",
    icon: "👴", color: "#7C3AED", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Arunachal Pradesh Social Welfare Dept. / IGNOAPS State Top-Up & State Social Pension", hi: "अरुणाचल प्रदेश समाज कल्याण विभाग / IGNOAPS राज्य टॉप-अप एवं राज्य सामाजिक पेंशन" },
    name:    { en: "Arunachal Pradesh Social Security Pension — Old Age, Widow & Disability",
               hi: "अरुणाचल प्रदेश सामाजिक सुरक्षा पेंशन — वृद्धावस्था, विधवा एवं दिव्यांगता" },
    benefit: { en: "Monthly social security pension for vulnerable groups in Arunachal Pradesh combining Central IGNOAPS/IGNWPS/IGNDPS with state top-up — pension amounts: ₹1,500/month for BPL senior citizens (60–79 years) under IGNOAPS + state top-up; ₹2,000/month for senior citizens aged 80+ years (IGNOAPS higher slab + state top-up); ₹1,500/month for BPL widows aged 40–79 years under IGNWPS + state top-up; ₹1,500/month for persons with 40%+ disability under IGNDPS + state top-up; additional ₹500/month remoteness allowance for pensioners residing in Category A (remote frontier) districts including Anjaw, Dibang Valley, Upper Siang, Kurung Kumey, Upper Subansiri, Longding; pensions disbursed at village level through bank/post office accounts; all pensioners entitled to free health check-up at PHC quarterly; no family income ceiling for 80+ age category and disability pensioners",
               hi: "IGNOAPS/IGNWPS/IGNDPS के साथ राज्य टॉप-अप को मिलाकर अरुणाचल के कमजोर वर्गों के लिए मासिक सामाजिक सुरक्षा पेंशन — पेंशन राशि: BPL वरिष्ठ नागरिकों (60–79 वर्ष) को ₹1,500/माह; 80+ वर्ष के वरिष्ठ नागरिकों को ₹2,000/माह; BPL विधवाओं (40–79 वर्ष) को ₹1,500/माह; 40%+ दिव्यांगजनों को ₹1,500/माह; श्रेणी A (दूरदराज सीमावर्ती) जिलों के पेंशनधारकों को ₹500/माह अतिरिक्त दूरदराज भत्ता; बैंक/डाकघर खाते के माध्यम से ग्राम स्तर पर पेंशन; PHC में त्रैमासिक निःशुल्क स्वास्थ्य जांच" },
    tag:     { en: "Senior / Widow / Disability / Pension", hi: "वरिष्ठ / विधवा / दिव्यांग / पेंशन" },
    annual: 24000,
    apply:   { en: "District Social Welfare Officer (DSWO) / Block Development Officer (offline)", hi: "जिला समाज कल्याण अधिकारी (DSWO) / ब्लॉक विकास अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (Birth Certificate / Voter ID — for old age pension)", "Permanent Resident Certificate (PRC) of Arunachal Pradesh", "BPL / Income Certificate", "Widowhood Certificate (for widow pension — issued by District Magistrate)", "Disability Certificate (for disability pension — issued by Medical Board)", "Bank Account (Aadhaar-linked) or Post Office Account", "ST Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID — वृद्धावस्था पेंशन के लिए)", "अरुणाचल प्रदेश का स्थायी निवास प्रमाण पत्र (PRC)", "BPL / आय प्रमाण पत्र", "विधवापन प्रमाण पत्र (विधवा पेंशन के लिए — जिला मजिस्ट्रेट द्वारा जारी)", "दिव्यांगता प्रमाण पत्र (दिव्यांग पेंशन के लिए — चिकित्सा बोर्ड द्वारा जारी)", "बैंक खाता (आधार-लिंक्ड) या डाकघर खाता", "ST प्रमाण पत्र (यदि लागू हो)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Arunachal Pradesh" && (a.who === "senior" || (a.who === "women" && a.age === "above60")) && ["below1","1to3"].includes(a.income),
  },

  // ADD MORE ARUNACHAL PRADESH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "arunachal_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Arunachal Pradesh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Arunachal Pradesh",
  // },

  // <auto-scheme id="arunachal_deen_dayal_upadhyaya"> added by Scheme Discovery agent on 2026-10-07 · source: https://arunachalplan.gov.in/deen-dayal-upadhay-sawalamban-yojana/
  {
    id: "arunachal_deen_dayal_upadhyaya",
    icon: "💼", color: "#6B21A8", scope: "state", state: "Arunachal Pradesh",
    ministry: { en: "Government of Arunachal Pradesh, Planning & Investment Division", hi: "अरुणाचल प्रदेश सरकार, योजना एवं निवेश विभाग" },
    name:    { en: "Deen Dayal Upadhyaya Swavalamban Yojana", hi: "दीन दयाल उपाध्याय स्वावलंबन योजना" },
    benefit: { en: "40% front‑ended subsidy on startup loans up to ₹50 lakh (women get extra 5% interest subsidy)", hi: "स्टार्ट‑अप ऋण पर 40% अग्रिम सब्सिडी, अधिकतम ₹50 लाख (महिला उद्यमियों को अतिरिक्त 5% ब्याज सब्सिडी)" },
    tag:     { en: "Startup subsidy", hi: "स्टार्ट‑अप सब्सिडी" },
    annual: 0,
    apply:   { en: "https://arunachalplan.gov.in/deen-dayal-upadhay-sawalamban-yojana/", hi: "https://arunachalplan.gov.in/deen-dayal-upadhay-sawalamban-yojana/" }, applyType: "online",
    docs:    { en: ["Aadhaar Card"],
               hi: ["आधार कार्ड"] },
    keywords: ["skill"],
    autoAdded: "2026-10-07", source: "https://arunachalplan.gov.in/deen-dayal-upadhay-sawalamban-yojana/",
    match: (a) => a.state === "Arunachal Pradesh",
  },
  // </auto-scheme id="arunachal_deen_dayal_upadhyaya">

];
