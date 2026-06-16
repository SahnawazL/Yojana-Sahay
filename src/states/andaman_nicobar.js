// andaman_nicobar.js — YojanaSetu UT Schemes (Andaman & Nicobar Islands)
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "an_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
//
// NOTE: Andaman & Nicobar Islands is a Union Territory administered directly
//       by the Central Government through a Lt. Governor. It has 3 districts:
//       North & Middle Andaman, South Andaman, and Nicobar.
//       Home to several Particularly Vulnerable Tribal Groups (PVTGs):
//       Great Andamanese, Onge, Jarawa, Sentinelese, Nicobarese, Shompen.
// ─────────────────────────────────────────────────────────────────────────────

export const ANDAMAN_NICOBAR_SCHEMES = [

  // ── FISHERMEN / MARITIME LIVELIHOOD ──────────────────────────────────────

  {
    id: "an_pmmsy_fishermen",
    icon: "🎣", color: "#0369A1", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Fisheries Dept. / Ministry of Fisheries, Animal Husbandry & Dairying (GoI)", hi: "A&N मत्स्य पालन विभाग / मत्स्य पालन, पशुपालन एवं डेयरी मंत्रालय (भारत सरकार)" },
    name:    { en: "PM Matsya Sampada Yojana — PMMSY (Andaman & Nicobar)",
               hi: "PM मत्स्य संपदा योजना — PMMSY (अंडमान एवं निकोबार)" },
    benefit: { en: "Subsidy of 60% (SC/ST/Women) or 40% (General) on purchase of fishing boats, engines, and gear; up to ₹3 lakh subsidy for new fibreglass boat + engine; ₹50,000–₹1 lakh for deep-sea fishing equipment; cage aquaculture and seaweed cultivation assistance for island fishers; free Fish Farmer Producer Organisation (FFPO) membership; ₹5 lakh accident insurance for active fishermen at sea; ice plant and cold storage infrastructure support; training in modern deep-sea fishing techniques",
               hi: "मछली पकड़ने की नावें, इंजन और उपकरण खरीदने पर 60% (SC/ST/महिला) या 40% (सामान्य) सब्सिडी; नई फाइबरग्लास नाव + इंजन पर ₹3 लाख तक सब्सिडी; ₹50,000–₹1 लाख गहरे समुद्री मछली उपकरणों पर; द्वीप मछुआरों के लिए पिंजरा जलकृषि और समुद्री शैवाल खेती सहायता; निःशुल्क FFPO सदस्यता; समुद्र में सक्रिय मछुआरों के लिए ₹5 लाख दुर्घटना बीमा; बर्फ संयंत्र और शीत भंडारण अवसंरचना सहायता; आधुनिक गहरे समुद्री मछली पकड़ने की तकनीकों में प्रशिक्षण" },
    tag:     { en: "Fishermen / Boat / Equipment", hi: "मछुआरा / नाव / उपकरण" },
    annual: 300000,
    apply:   { en: "fisheries.and.nic.in / District Fisheries Office, Port Blair", hi: "fisheries.and.nic.in / जिला मत्स्य पालन कार्यालय, पोर्ट ब्लेयर" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "Fisher / Boat Registration Certificate", "Bank Account (Aadhaar-linked)", "Caste Certificate (for SC/ST priority subsidy)", "Fishing Licence issued by A&N Fisheries Dept.", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "मछुआरा / नाव पंजीकरण प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (SC/ST प्राथमिकता सब्सिडी के लिए)", "A&N मत्स्य पालन विभाग द्वारा जारी मछली पकड़ने का लाइसेंस", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Andaman & Nicobar" && (a.who === "farmer" || ["below1","1to3"].includes(a.income)),
  },

  {
    id: "an_fishermen_accident_insurance",
    icon: "⛵", color: "#1E40AF", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Fisheries Dept. / National Fisheries Development Board", hi: "A&N मत्स्य पालन विभाग / राष्ट्रीय मत्स्य विकास बोर्ड" },
    name:    { en: "Fishermen Welfare Fund & Accident Insurance (A&N UT)",
               hi: "मछुआरा कल्याण कोष एवं दुर्घटना बीमा (A&N UT)" },
    benefit: { en: "₹5 lakh accident-cum-life insurance for registered fishermen going to sea; ₹2 lakh for partial disability; ₹50,000 for hospitalisation due to sea accident; ₹10,000 annual saving-cum-relief benefit from Fishermen Welfare Fund; free life jacket and safety equipment for registered active fishermen; subsidy on diesel/petrol for fishing boats of up to ₹10,000 per year; compensation of ₹1,500/week during ban period (fishing ban season)",
               hi: "समुद्र में जाने वाले पंजीकृत मछुआरों के लिए ₹5 लाख दुर्घटना-सह-जीवन बीमा; आंशिक विकलांगता के लिए ₹2 लाख; समुद्री दुर्घटना से अस्पताल भर्ती पर ₹50,000; मछुआरा कल्याण कोष से ₹10,000 वार्षिक बचत-सह-राहत लाभ; पंजीकृत सक्रिय मछुआरों को निःशुल्क लाइफ जैकेट और सुरक्षा उपकरण; मछली पकड़ने की नावों पर डीजल/पेट्रोल सब्सिडी ₹10,000/वर्ष तक; प्रतिबंध अवधि (मछली पकड़ने पर प्रतिबंध) के दौरान ₹1,500/सप्ताह मुआवजा" },
    tag:     { en: "Fishermen / Insurance / Safety", hi: "मछुआरा / बीमा / सुरक्षा" },
    annual: 60000,
    apply:   { en: "District Fisheries Office, Port Blair / Mayabunder / Car Nicobar (offline registration)", hi: "जिला मत्स्य पालन कार्यालय, पोर्ट ब्लेयर / मायाबंदर / कार निकोबार (ऑफलाइन पंजीकरण)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "Active Fisherman Registration Certificate", "Fishing Boat Registration (if applicable)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Two Surety/References from village headman or Panchayat"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "सक्रिय मछुआरा पंजीकरण प्रमाण पत्र", "मछली पकड़ने की नाव पंजीकरण (यदि लागू हो)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "ग्राम प्रधान या पंचायत से दो जमानत/संदर्भ"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.who === "farmer",
  },

  // ── FARMER / HORTICULTURE / COCONUT ──────────────────────────────────────

  {
    id: "an_horticulture_coconut",
    icon: "🥥", color: "#15803D", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Horticulture & Agri Dept. / Coconut Development Board (GoI)", hi: "A&N बागवानी एवं कृषि विभाग / नारियल विकास बोर्ड (भारत सरकार)" },
    name:    { en: "Coconut & Horticulture Development Scheme (A&N UT)",
               hi: "नारियल एवं बागवानी विकास योजना (A&N UT)" },
    benefit: { en: "₹20,000–₹40,000/hectare replanting subsidy for aged/unproductive coconut gardens; free distribution of improved dwarf coconut and hybrid variety seedlings; 50% subsidy on spices, tropical fruits (mango, papaya, banana) and vegetable cultivation inputs; drip irrigation subsidy under PMKSY; free soil testing and crop advisory; Coconut Development Board grants of up to ₹75,000 for coconut-based product processing units; organic certification support for A&N produce",
               hi: "पुराने/अनुत्पादक नारियल बागों के लिए ₹20,000–₹40,000/हेक्टेयर पुनर्रोपण सब्सिडी; उन्नत बौनी नारियल और संकर किस्म के पौधों का निःशुल्क वितरण; मसाले, उष्णकटिबंधीय फल (आम, पपीता, केला) और सब्जी खेती इनपुट पर 50% सब्सिडी; PMKSY के तहत ड्रिप सिंचाई सब्सिडी; निःशुल्क मृदा परीक्षण और फसल परामर्श; नारियल आधारित उत्पाद प्रसंस्करण इकाइयों के लिए नारियल विकास बोर्ड से ₹75,000 तक अनुदान; A&N उत्पाद के लिए जैविक प्रमाणन सहायता" },
    tag:     { en: "Farmer / Coconut / Horticulture", hi: "किसान / नारियल / बागवानी" },
    annual: 40000,
    apply:   { en: "A&N Horticulture Dept. office, Port Blair / Coconut Development Board Regional Office", hi: "A&N बागवानी विभाग कार्यालय, पोर्ट ब्लेयर / नारियल विकास बोर्ड क्षेत्रीय कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "Land Records / Patta (registered in A&N UT)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Farmer Registration Certificate", "Caste Certificate (SC/ST for priority allocation)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "भूमि अभिलेख / पट्टा (A&N UT में पंजीकृत)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "किसान पंजीकरण प्रमाण पत्र", "जाति प्रमाण पत्र (SC/ST प्राथमिकता आवंटन के लिए)"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.who === "farmer",
  },

  // ── TRIBAL WELFARE (PVTG) ─────────────────────────────────────────────────

  {
    id: "an_pvtg_tribal_welfare",
    icon: "🏝️", color: "#78350F", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Tribal Welfare Dept. / Ministry of Tribal Affairs (GoI) — Andaman Adim Janjati Vikas Samiti (AAJVS)", hi: "A&N जनजातीय कल्याण विभाग / जनजातीय कार्य मंत्रालय (भारत सरकार) — अंडमान आदिम जनजाति विकास समिति (AAJVS)" },
    name:    { en: "PVTG Welfare & Protection Scheme — AAJVS (A&N UT)",
               hi: "PVTG कल्याण एवं संरक्षण योजना — AAJVS (A&N UT)" },
    benefit: { en: "Comprehensive welfare for Particularly Vulnerable Tribal Groups (Great Andamanese, Onge, Nicobarese, Shompen) — free housing with modern amenities in tribal reserves; free rations (rice, pulses, edible oil, sugar) provided monthly by AAJVS; free healthcare at dedicated AAJVS health units with resident doctors; free education including residential schools (ashram schools) in tribal areas; ₹500/month cash allowance per adult tribal member; traditional livelihood support (hunting, fishing, gathering tools); no forced displacement or tourism encroachment protections",
               hi: "विशेष रूप से कमजोर जनजातीय समूहों (ग्रेट अंडमानी, ओंगे, निकोबारी, शोम्पेन) के लिए व्यापक कल्याण — जनजातीय आरक्षित क्षेत्रों में आधुनिक सुविधाओं सहित निःशुल्क आवास; AAJVS द्वारा मासिक निःशुल्क राशन (चावल, दालें, खाद्य तेल, चीनी); समर्पित AAJVS स्वास्थ्य इकाइयों में निवासी डॉक्टरों के साथ निःशुल्क स्वास्थ्य सेवा; जनजातीय क्षेत्रों में आवासीय स्कूलों (आश्रम विद्यालयों) सहित निःशुल्क शिक्षा; प्रति वयस्क जनजातीय सदस्य ₹500/माह नकद भत्ता; पारंपरिक आजीविका सहायता; जबरन विस्थापन और पर्यटन अतिक्रमण से सुरक्षा" },
    tag:     { en: "Tribal / PVTG / Island Indigenous", hi: "जनजातीय / PVTG / द्वीप आदिवासी" },
    annual: 6000,
    apply:   { en: "AAJVS Headquarters, Port Blair — administered automatically; tribal members need not apply individually", hi: "AAJVS मुख्यालय, पोर्ट ब्लेयर — स्वत: प्रशासित; जनजातीय सदस्यों को व्यक्तिगत आवेदन की आवश्यकता नहीं" }, applyType: "offline",
    docs:    { en: ["Tribe Membership Certificate issued by AAJVS or Tribal Welfare Dept.", "Aadhaar Card (where applicable — some PVTGs exempt)", "Residence in designated Tribal Reserve / Protected Area"],
               hi: ["AAJVS या जनजातीय कल्याण विभाग द्वारा जारी जनजाति सदस्यता प्रमाण पत्र", "आधार कार्ड (जहां लागू हो — कुछ PVTG छूट प्राप्त)", "निर्धारित जनजातीय आरक्षित / संरक्षित क्षेत्र में निवास"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.caste === "st",
  },

  // ── WOMEN ─────────────────────────────────────────────────────────────────

  {
    id: "an_women_shg_nrlm",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Rural Development Dept. / NRLM — DAY-NRLM Mission", hi: "A&N ग्रामीण विकास विभाग / NRLM — DAY-NRLM मिशन" },
    name:    { en: "DAY-NRLM Women SHG & Livelihood Scheme (A&N UT)",
               hi: "DAY-NRLM महिला SHG एवं आजीविका योजना (A&N UT)" },
    benefit: { en: "Revolving fund of ₹15,000 per SHG; Community Investment Fund (CIF) of ₹50,000–₹1.5 lakh per group for income-generating activities; bank linkage loans at 7% interest (3% interest subvention); skill training in island-specific livelihoods — shell jewellery making, spice processing, Nicobarese crafts, bakery, tailoring, eco-tourism services; ₹500/month stipend during skill training; marketing linkage with national e-commerce platforms; special Nicobar Island Women Cluster programme",
               hi: "प्रति SHG ₹15,000 रिवॉल्विंग फंड; आय-सृजन गतिविधियों के लिए प्रति समूह ₹50,000–₹1.5 लाख सामुदायिक निवेश कोष (CIF); 7% ब्याज पर बैंक लिंकेज ऋण (3% ब्याज सब्वेंशन); द्वीप-विशिष्ट आजीविका में कौशल प्रशिक्षण — शेल आभूषण निर्माण, मसाला प्रसंस्करण, निकोबारी शिल्प, बेकरी, सिलाई, इको-पर्यटन सेवाएं; कौशल प्रशिक्षण के दौरान ₹500/माह वजीफा; राष्ट्रीय ई-कॉमर्स प्लेटफार्मों से विपणन लिंकेज; विशेष निकोबार द्वीप महिला क्लस्टर कार्यक्रम" },
    tag:     { en: "Women / SHG / Island Livelihood", hi: "महिला / SHG / द्वीप आजीविका" },
    annual: 0,
    apply:   { en: "Block Development Office (BDO), Port Blair / Rangat / Car Nicobar / nearest Panchayat", hi: "ब्लॉक विकास कार्यालय (BDO), पोर्ट ब्लेयर / रंगत / कार निकोबार / निकटतम पंचायत" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "SHG Registration Certificate / SHG Group Passbook", "Bank Account (Aadhaar-linked, preferably SHG group account)", "Residence Proof (A&N island village)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "SHG पंजीकरण प्रमाण पत्र / SHG समूह पासबुक", "बैंक खाता (आधार-लिंक्ड, अधिमानतः SHG समूह खाता)", "निवास प्रमाण (A&N द्वीप गांव)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.who === "women",
  },

  {
    id: "an_pmmvy_maternal",
    icon: "🤱", color: "#EC4899", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Health & Family Welfare Dept. / WCD Dept. / ICDS", hi: "A&N स्वास्थ्य एवं परिवार कल्याण विभाग / WCD विभाग / ICDS" },
    name:    { en: "PM Matru Vandana Yojana — PMMVY (A&N UT)",
               hi: "PM मातृ वंदना योजना — PMMVY (A&N UT)" },
    benefit: { en: "₹5,000 maternity benefit in 3 instalments for the first live birth — ₹1,000 at pregnancy registration, ₹2,000 at 6 months of pregnancy, ₹2,000 after delivery and first vaccination; additional ₹6,000 under Janani Suraksha Yojana (JSY) for institutional delivery at Government Hospital; ₹300 transport reimbursement for women from remote island areas reaching Port Blair hospital; total benefit up to ₹11,300 including transport incentive",
               hi: "पहले जीवित जन्म के लिए 3 किस्तों में ₹5,000 प्रसूति लाभ — गर्भावस्था पंजीकरण पर ₹1,000, 6 माह की गर्भावस्था पर ₹2,000, प्रसव और पहले टीकाकरण के बाद ₹2,000; सरकारी अस्पताल में संस्थागत प्रसव के लिए JSY के तहत अतिरिक्त ₹6,000; पोर्ट ब्लेयर अस्पताल पहुंचने वाली सुदूर द्वीप क्षेत्र की महिलाओं के लिए ₹300 परिवहन प्रतिपूर्ति; परिवहन प्रोत्साहन सहित कुल लाभ ₹11,300 तक" },
    tag:     { en: "Women / Maternal / Health", hi: "महिला / मातृ / स्वास्थ्य" },
    annual: 11300,
    apply:   { en: "Nearest Anganwadi Centre / PHC / GB Pant Hospital Port Blair", hi: "निकटतम आंगनवाड़ी केंद्र / PHC / GB पंत अस्पताल पोर्ट ब्लेयर" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "MCP (Mother & Child Protection) Card", "Pregnancy Certificate from ANM / Doctor", "Bank Account (Aadhaar-linked, woman's name)", "Age Proof (18+ years)", "Non-government employee declaration", "Domicile Certificate (A&N UT)"],
               hi: ["आधार कार्ड", "MCP (माँ व बाल संरक्षण) कार्ड", "ANM / डॉक्टर से गर्भावस्था प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड, महिला के नाम)", "आयु प्रमाण (18+ वर्ष)", "गैर-सरकारी कर्मचारी घोषणा पत्र", "अधिवास प्रमाण पत्र (A&N UT)"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.who === "women",
  },

  // ── STUDENT / YOUTH ───────────────────────────────────────────────────────

  {
    id: "an_sc_st_scholarship",
    icon: "📚", color: "#7C3AED", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Social Welfare Dept. / Ministry of Tribal Affairs & Ministry of Social Justice (GoI)", hi: "A&N समाज कल्याण विभाग / जनजातीय कार्य मंत्रालय एवं सामाजिक न्याय मंत्रालय (भारत सरकार)" },
    name:    { en: "Pre & Post Matric Scholarship for SC/ST Students (A&N UT)",
               hi: "SC/ST छात्रों के लिए प्री व पोस्ट मैट्रिक छात्रवृत्ति (A&N UT)" },
    benefit: { en: "Pre-Matric (Class 9–10): ₹150–₹350/month maintenance allowance + ₹750 annual book grant; Post-Matric (Class 11 and above): ₹570–₹1,200/month + ₹1,000–₹3,000 book grant + ₹190–₹380 hostel allowance/month; full tuition fee reimbursement for ST students pursuing degree/PG; additional A&N UT merit scholarship of ₹5,000–₹12,000 for top-performers; special overseas scholarship for tribal students admitted to foreign universities; free coaching for competitive exams (UPSC, SSC, banking)",
               hi: "प्री-मैट्रिक (कक्षा 9–10): ₹150–₹350/माह रखरखाव भत्ता + ₹750 वार्षिक पुस्तक अनुदान; पोस्ट-मैट्रिक (कक्षा 11 व उससे ऊपर): ₹570–₹1,200/माह + ₹1,000–₹3,000 पुस्तक अनुदान + ₹190–₹380/माह छात्रावास भत्ता; ST छात्रों के लिए डिग्री/PG में पूर्ण ट्यूशन फीस प्रतिपूर्ति; शीर्ष प्रदर्शनकर्ताओं के लिए ₹5,000–₹12,000 अतिरिक्त A&N UT मेरिट छात्रवृत्ति; विदेशी विश्वविद्यालयों में प्रवेश पाने वाले जनजातीय छात्रों के लिए विशेष विदेश छात्रवृत्ति; प्रतियोगी परीक्षाओं के लिए निःशुल्क कोचिंग (UPSC, SSC, बैंकिंग)" },
    tag:     { en: "Student / SC-ST Scholarship", hi: "छात्र / SC-ST छात्रवृत्ति" },
    annual: 21600,
    apply:   { en: "scholarships.gov.in (NSP) / Social Welfare Dept., Port Blair", hi: "scholarships.gov.in (NSP) / समाज कल्याण विभाग, पोर्ट ब्लेयर" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST) issued by A&N UT authority", "Domicile Certificate (A&N UT)", "Previous Year Marksheet / School Certificate", "Current Year Institution Enrollment Certificate", "Bank Account (student's name, Aadhaar-linked)", "Income Certificate (family income < ₹2.5 lakh for SC)", "Passport Photo", "Mobile Number & Email ID"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC/ST) — A&N UT प्राधिकरण द्वारा जारी", "अधिवास प्रमाण पत्र (A&N UT)", "पिछले वर्ष की अंकसूची / विद्यालय प्रमाण पत्र", "चालू वर्ष का संस्थान नामांकन प्रमाण पत्र", "बैंक खाता (छात्र के नाम, आधार-लिंक्ड)", "आय प्रमाण पत्र (SC के लिए पारिवारिक आय ₹2.5 लाख से कम)", "पासपोर्ट फोटो", "मोबाइल नंबर व ईमेल ID"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.who === "student" && (a.caste === "sc" || a.caste === "st"),
  },

  {
    id: "an_youth_skill_ddet",
    icon: "🎓", color: "#0F766E", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Directorate of Employment & Training (DDET) / NSDC", hi: "A&N रोजगार एवं प्रशिक्षण निदेशालय (DDET) / NSDC" },
    name:    { en: "Island Youth Skill Development & Placement Scheme (A&N UT)",
               hi: "द्वीप युवा कौशल विकास एवं रोजगार योजना (A&N UT)" },
    benefit: { en: "Free skill training of 3–12 months in trades relevant to island economy — scuba diving & marine tourism, hotel & hospitality, boat building & repair, IT/BPO, healthcare, construction; ₹1,500–₹2,500/month stipend during training; 70%+ post-training placement assistance; free ITI courses at Government ITIs in Port Blair and Andaman; apprenticeship with stipend under NAPS (National Apprenticeship Promotion Scheme); special eco-tourism guide certification tied to A&N forest dept.",
               hi: "द्वीप अर्थव्यवस्था से जुड़े व्यापारों में 3–12 माह का निःशुल्क कौशल प्रशिक्षण — स्कूबा डाइविंग व समुद्री पर्यटन, होटल व आतिथ्य, नाव निर्माण व मरम्मत, IT/BPO, स्वास्थ्य सेवा, निर्माण; प्रशिक्षण के दौरान ₹1,500–₹2,500/माह वजीफा; 70%+ प्रशिक्षण के बाद नियोजन सहायता; पोर्ट ब्लेयर और अंडमान के सरकारी ITI में निःशुल्क ITI पाठ्यक्रम; NAPS के तहत वजीफे के साथ अप्रेंटिसशिप; A&N वन विभाग से जुड़ा विशेष इको-पर्यटन गाइड प्रमाणपत्र" },
    tag:     { en: "Youth / Skill / Island Economy", hi: "युवा / कौशल / द्वीप अर्थव्यवस्था" },
    annual: 30000,
    apply:   { en: "https://ddet.and.nic.in", hi: "ddet.and.nic.in / ITI पोर्ट ब्लेयर / रोजगार एक्सचेंज कार्यालय, A&N" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "Educational Certificate (Class 8 minimum)", "Age Proof (15–35 years)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number", "Caste / PwD Certificate (if applicable)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "शैक्षिक प्रमाण पत्र (न्यूनतम कक्षा 8)", "आयु प्रमाण (15–35 वर्ष)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर", "जाति / दिव्यांग प्रमाण पत्र (यदि लागू हो)"] },
    match: (a) => a.state === "Andaman & Nicobar" && (a.who === "student" || a.age === "18to35"),
  },

  // ── SOCIAL SECURITY / PENSION ─────────────────────────────────────────────

  {
    id: "an_social_security_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Social Welfare Dept. / Ministry of Rural Development (IGNOAPS/IGNWPS)", hi: "A&N समाज कल्याण विभाग / ग्रामीण विकास मंत्रालय (IGNOAPS/IGNWPS)" },
    name:    { en: "Social Security Pension — IGNOAPS / IGNWPS (A&N UT)",
               hi: "सामाजिक सुरक्षा पेंशन — IGNOAPS / IGNWPS (A&N UT)" },
    benefit: { en: "Monthly pension under NSAP — Indira Gandhi National Old Age Pension Scheme (IGNOAPS): ₹200/month for BPL elderly aged 60–79; ₹500/month for aged 80+; Indira Gandhi National Widow Pension Scheme (IGNWPS): ₹300/month for BPL widows aged 40–79; Indira Gandhi National Disability Pension Scheme (IGNDPS): ₹300/month for BPL persons with severe disability (80%+); A&N UT tops up pensions to bring total to ₹1,000/month from state funds; paid directly to Aadhaar-linked bank account",
               hi: "NSAP के तहत मासिक पेंशन — IGNOAPS: BPL वृद्ध (60–79 वर्ष) को ₹200/माह; 80+ के लिए ₹500/माह; IGNWPS: BPL विधवाओं (40–79 वर्ष) को ₹300/माह; IGNDPS: गंभीर दिव्यांगता (80%+) वाले BPL व्यक्तियों को ₹300/माह; A&N UT राज्य निधि से कुल ₹1,000/माह तक पेंशन टॉप-अप करता है; आधार-लिंक्ड बैंक खाते में सीधे भुगतान" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 12000,
    apply:   { en: "Social Welfare Dept. / Block Development Office (BDO), Port Blair or respective island BDO (offline)", hi: "समाज कल्याण विभाग / ब्लॉक विकास कार्यालय (BDO), पोर्ट ब्लेयर या संबंधित द्वीप BDO (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "BPL Ration Card / Below Poverty Line certificate", "Age Proof (Voter ID / Birth Certificate) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (80%+ for IGNDPS, issued by CMO / Medical Board)", "Bank Account (Aadhaar-linked)", "Two Passport Photos"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "BPL राशन कार्ड / गरीबी रेखा से नीचे प्रमाण पत्र", "आयु प्रमाण (मतदाता ID / जन्म प्रमाण पत्र) — वृद्धों के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवाओं के लिए", "दिव्यांगता प्रमाण पत्र (IGNDPS के लिए 80%+, CMO / चिकित्सा बोर्ड से)", "बैंक खाता (आधार-लिंक्ड)", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Andaman & Nicobar" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled") && ["below1","1to3"].includes(a.income),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "an_pmay_gramin",
    icon: "🏠", color: "#B45309", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Rural Development Dept. / Ministry of Rural Development (GoI)", hi: "A&N ग्रामीण विकास विभाग / ग्रामीण विकास मंत्रालय (भारत सरकार)" },
    name:    { en: "PM Awas Yojana — Gramin (A&N UT)",
               hi: "PM आवास योजना — ग्रामीण (A&N UT)" },
    benefit: { en: "₹1.30 lakh financial assistance for constructing a pucca house (island/hilly terrain rate); paid in 3–4 instalments linked to construction stages; additional ₹12,000 for toilet construction under SBM Gramin; MGNREGS convergence provides 95 days of unskilled wage support; earthquake and cyclone-resistant construction designs mandated (A&N islands in seismic zone V); free technical guidance from Block Engineer; SC/ST, widows, ex-servicemen and PwD households given priority selection",
               hi: "पक्के मकान निर्माण के लिए ₹1.30 लाख सहायता (द्वीप/पहाड़ी भूभाग दर); निर्माण चरणों से जुड़ी 3–4 किस्तों में भुगतान; SBM ग्रामीण के तहत शौचालय निर्माण के लिए अतिरिक्त ₹12,000; MGNREGS अभिसरण से 95 दिन की अकुशल मजदूरी सहायता; भूकंप और चक्रवात प्रतिरोधी निर्माण डिजाइन अनिवार्य (A&N द्वीप भूकंपीय क्षेत्र V में); ब्लॉक इंजीनियर से निःशुल्क तकनीकी मार्गदर्शन; SC/ST, विधवाएं, पूर्व सैनिक और दिव्यांग परिवारों को प्राथमिकता" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 130000,
    apply:   { en: "pmayg.nic.in / Block Development Office (BDO), respective island block", hi: "pmayg.nic.in / ब्लॉक विकास कार्यालय (BDO), संबंधित द्वीप ब्लॉक" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (A&N UT)", "BPL Ration Card / SECC 2011 inclusion proof", "Patta / Land Ownership Document (A&N UT records)", "Bank Account (Aadhaar-linked)", "No House Certificate from Panchayat", "Passport Photo", "Caste Certificate (SC/ST for priority selection)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (A&N UT)", "BPL राशन कार्ड / SECC 2011 समावेश प्रमाण", "पट्टा / भूमि स्वामित्व दस्तावेज़ (A&N UT अभिलेख)", "बैंक खाता (आधार-लिंक्ड)", "पंचायत से बेघर प्रमाण पत्र", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST प्राथमिकता चयन के लिए)"] },
    match: (a) => a.state === "Andaman & Nicobar" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "an_pmjay_health",
    icon: "🏥", color: "#0E7490", scope: "state", state: "Andaman & Nicobar",
    ministry: { en: "A&N Health & Family Welfare Dept. / National Health Authority (GoI)", hi: "A&N स्वास्थ्य एवं परिवार कल्याण विभाग / राष्ट्रीय स्वास्थ्य प्राधिकरण (भारत सरकार)" },
    name:    { en: "Ayushman Bharat — PMJAY (A&N UT)",
               hi: "आयुष्मान भारत — PMJAY (A&N UT)" },
    benefit: { en: "Cashless health insurance coverage of ₹5 lakh per family per year at empanelled hospitals across India; covers 1,929+ medical procedures including surgeries, cancer, dialysis, ICU, orthopaedics; free treatment at GB Pant Hospital Port Blair and district hospitals across A&N; sea/air evacuation support for critical patients needing treatment in Chennai or mainland hospitals; free diagnostics and medicines at Jan Aushadhi Kendras; priority for island residents reaching Port Blair for treatment",
               hi: "भारत भर में सूचीबद्ध अस्पतालों में प्रति परिवार ₹5 लाख/वर्ष कैशलेस स्वास्थ्य बीमा; 1,929+ चिकित्सा प्रक्रियाएं — सर्जरी, कैंसर, डायलिसिस, ICU, अस्थि रोग; GB पंत अस्पताल पोर्ट ब्लेयर और A&N के जिला अस्पतालों में निःशुल्क उपचार; चेन्नई या मुख्य भूमि अस्पतालों में उपचार हेतु गंभीर मरीजों के लिए समुद्र/वायु निकासी सहायता; जन औषधि केंद्रों पर निःशुल्क निदान और दवाएं; उपचार के लिए पोर्ट ब्लेयर पहुंचने वाले द्वीप निवासियों को प्राथमिकता" },
    tag:     { en: "Health / Insurance / Cashless", hi: "स्वास्थ्य / बीमा / कैशलेस" },
    annual: 500000,
    apply:   { en: "https://pmjay.gov.in", hi: "pmjay.gov.in / GB पंत अस्पताल, पोर्ट ब्लेयर — अस्पताल या कॉमन सर्विस सेंटर पर आयुष्मान कार्ड" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card (NFSA) OR Domicile Certificate (A&N UT)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "राशन कार्ड (NFSA) या अधिवास प्रमाण पत्र (A&N UT)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर (आधार-लिंक्ड)"] },
    match: (a) => a.state === "Andaman & Nicobar" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE A&N SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "an_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Andaman & Nicobar",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Andaman & Nicobar",
  // },

];
