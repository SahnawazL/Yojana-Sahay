// ladakh.js — YojanaSetu UT Schemes (Ladakh)
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "ladakh_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
//
// NOTE: Ladakh is a Union Territory (since Oct 31 2019). Schemes are governed
//       by the Ladakh Autonomous Hill Development Councils (LAHDC Leh & Kargil)
//       and the UT Administration of Ladakh.
// ─────────────────────────────────────────────────────────────────────────────

export const LADAKH_SCHEMES = [

  // ── FARMER / AGRICULTURE / HERDER ────────────────────────────────────────

  {
    id: "ladakh_pashmina_development",
    icon: "🐐", color: "#92400E", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Animal Husbandry & Sheep Husbandry Dept.", hi: "लद्दाख UT पशुपालन एवं भेड़ पालन विभाग" },
    name:    { en: "Pashmina Development Programme (Ladakh UT)",
               hi: "पश्मीना विकास कार्यक्रम (लद्दाख UT)" },
    benefit: { en: "Financial assistance of ₹10,000–₹25,000 per herder household for Pashmina goat rearing and wool processing; subsidised veterinary support and medicines for Changra goats; free training in Pashmina combing, spinning and weaving; marketing support through GI-tagged 'Ladakhi Pashmina' branding; improved breed distribution; special incentives for Changpa nomad community of Changthang plateau",
               hi: "पश्मीना बकरी पालन और ऊन प्रसंस्करण के लिए प्रति चरवाहा परिवार ₹10,000–₹25,000 सहायता; चांगरा बकरियों के लिए सब्सिडी युक्त पशु चिकित्सा और दवाएं; पश्मीना कंघी, कताई और बुनाई में निःशुल्क प्रशिक्षण; GI-टैग 'लद्दाखी पश्मीना' ब्रांडिंग के माध्यम से विपणन सहायता; उन्नत नस्ल वितरण; चांगथांग पठार के चांगपा खानाबदोश समुदाय के लिए विशेष प्रोत्साहन" },
    tag:     { en: "Farmer / Pashmina / Herder", hi: "किसान / पश्मीना / चरवाहा" },
    annual: 25000,
    apply:   { en: "Ladakh UT Animal Husbandry Dept. / LAHDC office, Leh or Kargil", hi: "लद्दाख UT पशुपालन विभाग / LAHDC कार्यालय, लेह या कारगिल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "Land / Grazing Rights Certificate (for Changpa nomads)", "Bank Account (Aadhaar-linked)", "ST Certificate (for Changpa / Scheduled Tribe category)", "Proof of Pashmina goat ownership (livestock register)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "भूमि / चराई अधिकार प्रमाण पत्र (चांगपा खानाबदोशों के लिए)", "बैंक खाता (आधार-लिंक्ड)", "ST प्रमाण पत्र (चांगपा / अनुसूचित जनजाति श्रेणी के लिए)", "पश्मीना बकरी स्वामित्व का प्रमाण (पशुधन रजिस्टर)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Ladakh" && (a.who === "farmer" || a.caste === "st"),
  },

  {
    id: "ladakh_lahdc_kisan_support",
    icon: "🌾", color: "#15803D", scope: "state", state: "Ladakh",
    ministry: { en: "LAHDC Leh / LAHDC Kargil — Agriculture Dept.", hi: "LAHDC लेह / LAHDC कारगिल — कृषि विभाग" },
    name:    { en: "LAHDC Kisan Agricultural Support Scheme (Ladakh)",
               hi: "LAHDC किसान कृषि सहायता योजना (लद्दाख)" },
    benefit: { en: "Input subsidy of up to ₹8,000 per season for small and marginal farmers covering seeds, fertilisers and pesticides at 50% subsidised rate; free distribution of improved cold-resistant seed varieties suited for high-altitude farming; agricultural tools and equipment subsidy of ₹5,000; drip irrigation support under PMKSY; crop insurance linkage; direct benefit transfer to Aadhaar-linked account",
               hi: "छोटे व सीमांत किसानों को प्रति मौसम ₹8,000 तक इनपुट सब्सिडी — बीज, उर्वरक और कीटनाशक 50% सब्सिडी दर पर; उच्च ऊंचाई खेती के लिए उपयुक्त उन्नत ठंड-प्रतिरोधी बीज किस्मों का निःशुल्क वितरण; ₹5,000 कृषि उपकरण सब्सिडी; PMKSY के तहत ड्रिप सिंचाई सहायता; फसल बीमा लिंकेज; आधार-लिंक्ड खाते में DBT" },
    tag:     { en: "Farmer / Agriculture Input", hi: "किसान / कृषि इनपुट" },
    annual: 8000,
    apply:   { en: "LAHDC Agriculture office (Leh / Kargil) or nearest Block Development Office", hi: "LAHDC कृषि कार्यालय (लेह / कारगिल) या निकटतम ब्लॉक विकास कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "Land Records / Khasra-Girdawari", "Bank Account (Aadhaar-linked)", "Farmer Registration Certificate", "Passport Photo", "Caste Certificate (if SC/ST for priority)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "भूमि अभिलेख / खसरा-गिरदावरी", "बैंक खाता (आधार-लिंक्ड)", "किसान पंजीकरण प्रमाण पत्र", "पासपोर्ट फोटो", "जाति प्रमाण पत्र (SC/ST प्राथमिकता के लिए)"] },
    match: (a) => a.state === "Ladakh" && a.who === "farmer",
  },

  // ── WOMEN ─────────────────────────────────────────────────────────────────

  {
    id: "ladakh_umeed_shg",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Rural Development Dept. / National Rural Livelihoods Mission (NRLM)", hi: "लद्दाख UT ग्रामीण विकास विभाग / राष्ट्रीय ग्रामीण आजीविका मिशन (NRLM)" },
    name:    { en: "Umeed — Women SHG & Livelihood Scheme (Ladakh)",
               hi: "उम्मीद — महिला SHG और आजीविका योजना (लद्दाख)" },
    benefit: { en: "Interest-free revolving fund of ₹15,000 per SHG; credit linkage with banks for loans up to ₹6 lakh at 7% interest (with 3% subvention making it 4% effective); seed capital of ₹10,000 for new SHGs; skill training in handicrafts (Thangka painting, carpet weaving, dried apricot processing, yak-wool products); marketing linkage with national platforms; ₹500/month capacity-building stipend during training",
               hi: "प्रति SHG ₹15,000 ब्याज-मुक्त रिवॉल्विंग फंड; बैंकों से ₹6 लाख तक 7% ब्याज पर ऋण (3% सब्वेंशन से प्रभावी 4%); नए SHGs के लिए ₹10,000 बीज पूंजी; हस्तशिल्प में कौशल प्रशिक्षण (थांगका चित्रकारी, कालीन बुनाई, सूखे खुबानी प्रसंस्करण, याक-ऊन उत्पाद); राष्ट्रीय प्लेटफार्म से विपणन लिंकेज; प्रशिक्षण के दौरान ₹500/माह क्षमता-निर्माण वजीफा" },
    tag:     { en: "Women / SHG / Livelihood", hi: "महिला / SHG / आजीविका" },
    annual: 0,
    apply:   { en: "Nearest Block Development Office (BDO) or Umeed CRP / SHG facilitator in village", hi: "निकटतम ब्लॉक विकास कार्यालय (BDO) या गांव में उम्मीद CRP / SHG सुविधाकर्ता" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "SHG Membership Certificate / SHG Group Registration", "Bank Account (Aadhaar-linked)", "Residence Proof (Ladakh village)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "SHG सदस्यता प्रमाण पत्र / SHG समूह पंजीकरण", "बैंक खाता (आधार-लिंक्ड)", "निवास प्रमाण (लद्दाख गांव)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Ladakh" && a.who === "women",
  },

  {
    id: "ladakh_women_maternal",
    icon: "🤱", color: "#EC4899", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Health & Medical Education Dept. / ICDS", hi: "लद्दाख UT स्वास्थ्य एवं चिकित्सा शिक्षा विभाग / ICDS" },
    name:    { en: "Pradhan Mantri Matru Vandana Yojana — PMMVY (Ladakh UT)",
               hi: "प्रधानमंत्री मातृ वंदना योजना — PMMVY (लद्दाख UT)" },
    benefit: { en: "₹5,000 maternity benefit in 3 instalments for the first live birth — ₹1,000 on early pregnancy registration, ₹2,000 after 6 months of pregnancy, ₹2,000 after child delivery and first vaccination cycle; additional ₹6,000 under Janani Suraksha Yojana (JSY) for institutional delivery in Ladakh, given difficult terrain and distance to health centres; total benefit can reach ₹11,000",
               hi: "पहले जीवित जन्म के लिए ₹5,000 प्रसूति लाभ 3 किस्तों में — गर्भावस्था पंजीकरण पर ₹1,000, 6 माह की गर्भावस्था के बाद ₹2,000, बच्चे के जन्म और पहले टीकाकरण चक्र के बाद ₹2,000; लद्दाख में संस्थागत प्रसव के लिए JSY के तहत अतिरिक्त ₹6,000 — कठिन भूभाग और स्वास्थ्य केंद्रों से दूरी को देखते हुए; कुल लाभ ₹11,000 तक" },
    tag:     { en: "Women / Maternal Health", hi: "महिला / मातृ स्वास्थ्य" },
    annual: 11000,
    apply:   { en: "Nearest Anganwadi Centre or PHC / District Hospital Leh or Kargil", hi: "निकटतम आंगनवाड़ी केंद्र या PHC / जिला अस्पताल लेह या कारगिल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "MCP (Mother & Child Protection) Card", "Bank Account (Aadhaar-linked)", "Pregnancy Registration Certificate from ANM / Doctor", "Age Proof (18+ years)", "Non-government employee declaration"],
               hi: ["आधार कार्ड", "MCP (माँ व बाल संरक्षण) कार्ड", "बैंक खाता (आधार-लिंक्ड)", "ANM / डॉक्टर से गर्भावस्था पंजीकरण प्रमाण पत्र", "आयु प्रमाण (18+ वर्ष)", "गैर-सरकारी कर्मचारी घोषणा पत्र"] },
    match: (a) => a.state === "Ladakh" && a.who === "women",
  },

  // ── STUDENT / YOUTH / SKILL ───────────────────────────────────────────────

  {
    id: "ladakh_himayat_skill",
    icon: "🎓", color: "#7C3AED", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Skill Development Dept. / Ministry of Rural Development (GoI)", hi: "लद्दाख UT कौशल विकास विभाग / ग्रामीण विकास मंत्रालय (भारत सरकार)" },
    name:    { en: "Himayat — Skill Training & Placement Scheme (Ladakh UT)",
               hi: "हिमायत — कौशल प्रशिक्षण एवं रोजगार योजना (लद्दाख UT)" },
    benefit: { en: "Free residential skill training for 3–12 months in sectors such as tourism, hospitality, construction, IT, healthcare, and retail for youth aged 15–35; ₹1,500–₹3,000/month stipend during training; free accommodation and food in residential batches; 70%+ placement guarantee after training; post-placement support for 2 years; applicable to school dropouts and unemployed graduates",
               hi: "15–35 वर्ष के युवाओं के लिए पर्यटन, आतिथ्य, निर्माण, IT, स्वास्थ्य, और खुदरा क्षेत्रों में 3–12 माह का निःशुल्क आवासीय कौशल प्रशिक्षण; प्रशिक्षण के दौरान ₹1,500–₹3,000/माह वजीफा; आवासीय बैचों में निःशुल्क आवास और भोजन; प्रशिक्षण के बाद 70%+ नियोजन गारंटी; 2 साल तक नियुक्ति के बाद सहायता; स्कूल छोड़ने वाले और बेरोजगार स्नातकों पर लागू" },
    tag:     { en: "Youth / Skill / Placement", hi: "युवा / कौशल / रोजगार" },
    annual: 36000,
    apply:   { en: "https://himayat.gov.in", hi: "himayat.gov.in / LAHDC कौशल विकास केंद्र, लेह या कारगिल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "Educational Qualification Certificate (Class 8 minimum)", "Age Proof (15–35 years)", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number", "Caste/PwD Certificate (if applicable for priority)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "शैक्षिक योग्यता प्रमाण पत्र (न्यूनतम कक्षा 8)", "आयु प्रमाण (15–35 वर्ष)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर", "जाति/दिव्यांग प्रमाण पत्र (यदि प्राथमिकता के लिए लागू हो)"] },
    match: (a) => a.state === "Ladakh" && (a.who === "student" || ["18to35"].includes(a.age)),
  },

  {
    id: "ladakh_sc_st_scholarship",
    icon: "📚", color: "#1D4ED8", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Social Welfare Dept. / Ministry of Tribal Affairs (GoI)", hi: "लद्दाख UT समाज कल्याण विभाग / जनजातीय कार्य मंत्रालय (भारत सरकार)" },
    name:    { en: "Pre & Post Matric Scholarship for SC/ST Students (Ladakh UT)",
               hi: "SC/ST छात्रों के लिए प्री व पोस्ट मैट्रिक छात्रवृत्ति (लद्दाख UT)" },
    benefit: { en: "Pre-Matric: ₹150–₹350/month for Class 9–10 students + ₹750–₹1,000 annual book grant; Post-Matric: ₹570–₹1,200/month for Class 11 and above + ₹1,000–₹3,000 book grant; hostel allowance of ₹190–₹380/month; full tuition fee reimbursement for degree and PG courses for ST students under the Tribal Sub-Plan; additional top-up from LAHDC scholarship fund of up to ₹10,000/year for meritorious students",
               hi: "प्री-मैट्रिक: कक्षा 9–10 के छात्रों के लिए ₹150–₹350/माह + ₹750–₹1,000 वार्षिक पुस्तक अनुदान; पोस्ट-मैट्रिक: कक्षा 11 और उससे ऊपर के लिए ₹570–₹1,200/माह + ₹1,000–₹3,000 पुस्तक अनुदान; ₹190–₹380/माह छात्रावास भत्ता; ST छात्रों के लिए जनजातीय उप-योजना के तहत डिग्री और PG पाठ्यक्रमों की पूर्ण ट्यूशन फीस प्रतिपूर्ति; LAHDC छात्रवृत्ति कोष से मेधावी छात्रों को ₹10,000/वर्ष तक अतिरिक्त टॉप-अप" },
    tag:     { en: "Student / SC-ST Scholarship", hi: "छात्र / SC-ST छात्रवृत्ति" },
    annual: 24400,
    apply:   { en: "https://leh.nic.in/notice/notice-opening-of-national-scholarship-portal-nsp-2-0-for-inviting-applications-fresh-and-renewal-under-centrally-sponsored-scheme-of-pre-and-post-matric-scholarship-for-st-students-ladakh", hi: "scholarships.gov.in (NSP) / समाज कल्याण विभाग लेह या कारगिल" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC or ST) issued by Ladakh UT authority", "Domicile Certificate (Ladakh UT)", "Last Exam Marksheet / School Certificate", "Institution Enrollment Certificate (current year)", "Bank Account (student's name, Aadhaar-linked)", "Income Certificate (family income < ₹2.5 lakh for SC / no income bar for ST)", "Passport Photo"],
               hi: ["आधार कार्ड", "जाति प्रमाण पत्र (SC या ST) — लद्दाख UT प्राधिकरण द्वारा", "अधिवास प्रमाण पत्र (लद्दाख UT)", "अंतिम परीक्षा की अंकसूची / विद्यालय प्रमाण पत्र", "संस्थान नामांकन प्रमाण पत्र (चालू वर्ष)", "बैंक खाता (छात्र के नाम, आधार-लिंक्ड)", "आय प्रमाण पत्र (SC के लिए पारिवारिक आय ₹2.5 लाख से कम / ST के लिए कोई आय सीमा नहीं)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Ladakh" && a.who === "student" && (a.caste === "sc" || a.caste === "st"),
  },

  // ── SOCIAL SECURITY / PENSION ─────────────────────────────────────────────

  {
    id: "ladakh_social_security_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Social Welfare Dept. / LAHDC (Leh & Kargil)", hi: "लद्दाख UT समाज कल्याण विभाग / LAHDC (लेह एवं कारगिल)" },
    name:    { en: "Social Security Pension — LAHDC (Ladakh UT)",
               hi: "सामाजिक सुरक्षा पेंशन — LAHDC (लद्दाख UT)" },
    benefit: { en: "Monthly pension for elderly, widows and disabled persons in Ladakh UT — Old Age (60+ years): ₹1,000/month; Widows: ₹1,000/month; Persons with Disability (40%+): ₹1,000/month; additional top-up from LAHDC councillor discretionary fund in some areas; paid directly to Aadhaar-linked bank account; doorstep delivery pilot underway in remote Changthang and Zanskar areas",
               hi: "लद्दाख UT में वृद्ध, विधवाओं और दिव्यांगजनों को मासिक पेंशन — वृद्धावस्था (60+ वर्ष): ₹1,000/माह; विधवाएं: ₹1,000/माह; दिव्यांगजन (40%+): ₹1,000/माह; कुछ क्षेत्रों में LAHDC पार्षद विवेकाधीन निधि से अतिरिक्त टॉप-अप; आधार-लिंक्ड बैंक खाते में सीधे भुगतान; सुदूर चांगथांग और जांस्कार क्षेत्रों में दरवाजे तक वितरण पायलट जारी" },
    tag:     { en: "Senior / Widow / Disabled / Pension", hi: "वृद्ध / विधवा / दिव्यांग / पेंशन" },
    annual: 12000,
    apply:   { en: "Social Welfare Dept. / LAHDC Office, Leh or Kargil (offline application at Block level)", hi: "समाज कल्याण विभाग / LAHDC कार्यालय, लेह या कारगिल (ब्लॉक स्तर पर ऑफलाइन आवेदन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "Age Proof (Voter ID / Birth Certificate) — for elderly", "Death Certificate of husband + Marriage Certificate — for widows", "Disability Certificate (40%+, issued by CMO / Medical Board) — for disabled", "Bank Account (Aadhaar-linked)", "BPL Ration Card / Income Certificate", "Two Passport Photos"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "आयु प्रमाण (मतदाता ID / जन्म प्रमाण पत्र) — वृद्धों के लिए", "पति का मृत्यु प्रमाण पत्र + विवाह प्रमाण पत्र — विधवाओं के लिए", "दिव्यांगता प्रमाण पत्र (40%+, CMO / चिकित्सा बोर्ड से) — दिव्यांगों के लिए", "बैंक खाता (आधार-लिंक्ड)", "BPL राशन कार्ड / आय प्रमाण पत्र", "दो पासपोर्ट फोटो"] },
    match: (a) => a.state === "Ladakh" && (a.who === "senior" || a.age === "above60" || a.who === "widow" || a.who === "disabled"),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "ladakh_pmay_gramin",
    icon: "🏠", color: "#B45309", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Rural Development Dept. / Ministry of Rural Development (GoI)", hi: "लद्दाख UT ग्रामीण विकास विभाग / ग्रामीण विकास मंत्रालय (भारत सरकार)" },
    name:    { en: "PM Awas Yojana — Gramin (Ladakh UT)",
               hi: "PM आवास योजना — ग्रामीण (लद्दाख UT)" },
    benefit: { en: "₹1.30 lakh financial assistance for constructing a pucca house in Ladakh (classified as hilly/difficult terrain — higher unit cost than plains); paid in instalments linked to construction progress; additional ₹12,000 for toilet construction under SBM; MGNREGS convergence provides 90 days of unskilled labour support; free technical assistance from Block-level engineers; duration 18–24 months from sanction to completion; preference given to SC/ST, ex-servicemen and PwD households",
               hi: "लद्दाख में पक्के मकान निर्माण के लिए ₹1.30 लाख सहायता (पहाड़ी/कठिन भूभाग — मैदानी से अधिक इकाई लागत); निर्माण प्रगति से जुड़ी किस्तों में भुगतान; SBM के तहत शौचालय निर्माण के लिए अतिरिक्त ₹12,000; MGNREGS अभिसरण से 90 दिन की अकुशल श्रम सहायता; ब्लॉक स्तरीय इंजीनियरों से निःशुल्क तकनीकी सहायता; स्वीकृति से पूर्णता तक 18–24 माह; SC/ST, पूर्व सैनिक और दिव्यांग परिवारों को प्राथमिकता" },
    tag:     { en: "Housing / Rural / BPL", hi: "आवास / ग्रामीण / BPL" },
    annual: 130000,
    apply:   { en: "pmayg.nic.in / Block Development Office (BDO) in Leh or Kargil district", hi: "pmayg.nic.in / ब्लॉक विकास कार्यालय (BDO) — लेह या कारगिल जिला" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "BPL Ration Card / SECC survey inclusion proof", "Land Ownership / Patwarkhana Land Record", "Bank Account (Aadhaar-linked)", "Passport Photo", "No House Certificate from Panchayat / Village Headman (Numbərdar)", "Caste Certificate (SC/ST for priority selection)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "BPL राशन कार्ड / SECC सर्वेक्षण समावेश प्रमाण", "भूमि स्वामित्व / पटवारखाना भूमि अभिलेख", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "ग्राम पंचायत / ग्राम प्रमुख (नंबरदार) से बेघर प्रमाण पत्र", "जाति प्रमाण पत्र (SC/ST प्राथमिकता चयन के लिए)"] },
    match: (a) => a.state === "Ladakh" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── ENERGY / SOLAR ────────────────────────────────────────────────────────

  {
    id: "ladakh_solar_lighting",
    icon: "☀️", color: "#D97706", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Energy & New Renewable Energy Dept. / LAHDC", hi: "लद्दाख UT ऊर्जा एवं नवीन नवीकरणीय ऊर्जा विभाग / LAHDC" },
    name:    { en: "Solar Home Lighting & SPV Power Plant Scheme (Ladakh UT)",
               hi: "सौर गृह प्रकाश एवं SPV विद्युत संयंत्र योजना (लद्दाख UT)" },
    benefit: { en: "Free or heavily subsidised (up to 90%) solar home lighting systems (2–4 LED lights + mobile charging point) for BPL/remote households not connected to the grid; 100% subsidy for SC/ST and BPL families; community solar micro-grid installation for hamlets without road access; free installation and 5-year annual maintenance under LAHDC; PM-KUSUM linkage for solar pump sets for farmers; special cold-weather-rated panels procured for Ladakh's extreme winters (−30°C)",
               hi: "BPL / सुदूर परिवारों के लिए निःशुल्क या भारी सब्सिडी (90% तक) सौर गृह प्रकाश प्रणाली (2–4 LED लाइटें + मोबाइल चार्जिंग पॉइंट) जो ग्रिड से जुड़े नहीं हैं; SC/ST और BPL परिवारों के लिए 100% सब्सिडी; सड़क-विहीन बस्तियों के लिए सामुदायिक सौर माइक्रो-ग्रिड; LAHDC के तहत निःशुल्क स्थापना और 5 वर्ष का वार्षिक रखरखाव; किसानों के लिए सौर पंप सेट हेतु PM-KUSUM लिंकेज; लद्दाख की कठोर सर्दियों (−30°C) के लिए विशेष ठंड-रेटेड पैनल" },
    tag:     { en: "Rural / Solar Energy / BPL", hi: "ग्रामीण / सौर ऊर्जा / BPL" },
    annual: 0,
    apply:   { en: "LAHDC Energy Dept. / District Industries Centre (DIC) Leh or Kargil / BDO office", hi: "LAHDC ऊर्जा विभाग / जिला उद्योग केंद्र (DIC) लेह या कारगिल / BDO कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "BPL Ration Card (for 100% subsidy)", "Proof that household has no grid electricity connection", "Bank Account (Aadhaar-linked) — for subsidy release", "Caste Certificate (SC/ST for 100% subsidy)", "Passport Photo"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "BPL राशन कार्ड (100% सब्सिडी के लिए)", "प्रमाण कि घर में ग्रिड बिजली कनेक्शन नहीं है", "बैंक खाता (आधार-लिंक्ड) — सब्सिडी जारी करने के लिए", "जाति प्रमाण पत्र (SC/ST — 100% सब्सिडी के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Ladakh" && (a.area === "rural" || ["below1","1to3"].includes(a.income)),
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "ladakh_sehat_health_insurance",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Ladakh",
    ministry: { en: "Ladakh UT Health Dept. / Ministry of Health & Family Welfare (GoI)", hi: "लद्दाख UT स्वास्थ्य विभाग / स्वास्थ्य एवं परिवार कल्याण मंत्रालय (भारत सरकार)" },
    name:    { en: "SEHAT — Health Insurance Scheme (Ladakh UT)",
               hi: "सेहत — स्वास्थ्य बीमा योजना (लद्दाख UT)" },
    benefit: { en: "Cashless health insurance coverage of ₹5 lakh per family per year at empanelled hospitals under AB-PMJAY (Ayushman Bharat) — extended to ALL residents of Ladakh UT (not just BPL); covers 1,929+ medical packages including surgeries, cancer treatment, dialysis, and ICU care; free treatment at SNM Hospital Leh and District Hospital Kargil for all UT residents; air evacuation support for critical cases to tertiary hospitals in Chandigarh/Delhi; free medicines at Jan Aushadhi Kendras across Ladakh",
               hi: "AB-PMJAY (आयुष्मान भारत) के तहत सूचीबद्ध अस्पतालों में प्रति परिवार ₹5 लाख/वर्ष कैशलेस स्वास्थ्य बीमा — लद्दाख UT के सभी निवासियों तक विस्तारित (केवल BPL नहीं); 1,929+ चिकित्सा पैकेज — सर्जरी, कैंसर उपचार, डायलिसिस और ICU देखभाल सहित; सभी UT निवासियों के लिए SNM अस्पताल लेह और जिला अस्पताल कारगिल में निःशुल्क उपचार; चंडीगढ़/दिल्ली के तृतीयक अस्पतालों में गंभीर मामलों के लिए एयर निकासी सहायता; लद्दाख में जन औषधि केंद्रों पर निःशुल्क दवाएं" },
    tag:     { en: "Health / Insurance / All Residents", hi: "स्वास्थ्य / बीमा / सभी निवासी" },
    annual: 500000,
    apply:   { en: "https://pmjay.gov.in", hi: "pmjay.gov.in / SNM अस्पताल लेह / जिला अस्पताल कारगिल — अस्पताल या कॉमन सर्विस सेंटर पर गोल्डन कार्ड" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Domicile Certificate (Ladakh UT)", "Ration Card (NFSA) OR any Ladakh UT residence proof", "Bank Account (Aadhaar-linked) — for DBT top-up if any", "Passport Photo", "Mobile Number (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "अधिवास प्रमाण पत्र (लद्दाख UT)", "राशन कार्ड (NFSA) या कोई लद्दाख UT निवास प्रमाण", "बैंक खाता (आधार-लिंक्ड) — यदि DBT टॉप-अप हो", "पासपोर्ट फोटो", "मोबाइल नंबर (आधार-लिंक्ड)"] },
    match: (a) => a.state === "Ladakh" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ADD MORE LADAKH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "ladakh_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Ladakh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Ladakh",
  // },

];
