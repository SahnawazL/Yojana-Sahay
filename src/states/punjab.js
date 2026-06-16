// Punjab — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "punjab_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const PUNJAB_SCHEMES = [

  // ── Women & Marriage ────────────────────────────────────────────────────────

  {
    id: "punjab_ashirwad",
    icon: "👧", color: "#C026D3", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security Dept.", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Ashirwad Scheme (Punjab)",                        hi: "आशीर्वाद योजना (पंजाब)" },
    benefit: { en: "₹21,000 cash gift on daughter's marriage for BPL families", hi: "BPL परिवारों में बेटी की शादी पर ₹21,000 नकद सहायता" },
    tag:     { en: "Women / Marriage", hi: "महिला / विवाह" },
    annual: 21000,
    apply:   { en: "https://sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Marriage Certificate","Bank Account"],
               hi: ["आधार कार्ड","BPL राशन कार्ड","विवाह प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "punjab_mayee_boli",
    icon: "🤱", color: "#DB2777", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Women & Child Development", hi: "पंजाब महिला एवं बाल विकास विभाग" },
    name:    { en: "Mayee Boli Matritva Sahayata Scheme",            hi: "माई बोली मातृत्व सहायता योजना" },
    benefit: { en: "₹18,000 maternity benefit in 3 instalments for first two live births", hi: "पहले दो जन्मों पर 3 किस्तों में ₹18,000 मातृत्व लाभ" },
    tag:     { en: "Women / Maternity", hi: "महिला / मातृत्व" },
    annual: 18000,
    apply:   { en: "Punjab Anganwadi / CDPOOffice", hi: "पंजाब आंगनवाड़ी / CDPO कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Bank Account","MCP Card (Mother & Child Protection)","Ration Card"],
               hi: ["आधार कार्ड","बैंक खाता","MCP कार्ड","राशन कार्ड"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Farmers ─────────────────────────────────────────────────────────────────

  {
    id: "punjab_atta_dal",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Food & Civil Supplies Dept.", hi: "पंजाब खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Atta Dal Scheme (Punjab)",                        hi: "आटा दाल योजना (पंजाब)" },
    benefit: { en: "5 kg wheat flour + 1 kg dal at subsidised rates per month for BPL families", hi: "BPL परिवारों को प्रति माह 5 kg आटा + 1 kg दाल सब्सिडी पर" },
    tag:     { en: "Farmer / Food Security", hi: "किसान / खाद्य सुरक्षा" },
    annual: 0,
    apply:   { en: "https://edistrict.punjabgovt.gov.in", hi: "edistrict.punjabgovt.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Punjab Domicile Certificate"],
               hi: ["आधार कार्ड","BPL राशन कार्ड","पंजाब अधिवास प्रमाण पत्र"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "punjab_crop_insurance",
    icon: "🌱", color: "#15803D", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Agriculture Dept.", hi: "पंजाब कृषि विभाग" },
    name:    { en: "Punjab Fasal Bima Yojana",                        hi: "पंजाब फसल बीमा योजना" },
    benefit: { en: "Crop insurance coverage up to ₹50,000 per acre against natural calamities", hi: "प्राकृतिक आपदाओं में प्रति एकड़ ₹50,000 तक फसल बीमा कवरेज" },
    tag:     { en: "Farmer / Insurance", hi: "किसान / बीमा" },
    annual: 50000,
    apply:   { en: "https://agripb.gov.in", hi: "agripb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Girdawari)","Bank Account","Crop Sowing Certificate"],
               hi: ["आधार कार्ड","जमीन के कागज़ (गिरदावरी)","बैंक खाता","फसल बुवाई प्रमाण पत्र"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer",
  },

  {
    id: "punjab_kisan_karj_mafi",
    icon: "💳", color: "#065F46", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Agriculture Dept.", hi: "पंजाब कृषि विभाग" },
    name:    { en: "Punjab Kisan Karj Mafi Scheme",                   hi: "पंजाब किसान कर्ज माफी योजना" },
    benefit: { en: "Crop loan waiver up to ₹2 Lakh for small and marginal farmers", hi: "छोटे व सीमांत किसानों के ₹2 लाख तक के फसली ऋण माफ" },
    tag:     { en: "Farmer / Loan Waiver", hi: "किसान / कर्ज माफी" },
    annual: 200000,
    apply:   { en: "https://agripb.gov.in", hi: "agripb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records","Loan Documents","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","जमीन के कागज़","ऋण दस्तावेज़","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  // ── Education & Youth ────────────────────────────────────────────────────────

  {
    id: "punjab_medhavi_scholarship",
    icon: "🎓", color: "#1D4ED8", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Higher Education", hi: "पंजाब उच्च शिक्षा विभाग" },
    name:    { en: "Punjab Medhavi Chhatra Puraskar",                 hi: "पंजाब मेधावी छात्र पुरस्कार" },
    benefit: { en: "₹10,000 – ₹25,000 scholarship for meritorious students in 10th/12th board exams", hi: "10वीं/12वीं बोर्ड में मेधावी छात्रों को ₹10,000–₹25,000 छात्रवृत्ति" },
    tag:     { en: "Student / Scholarship", hi: "छात्र / छात्रवृत्ति" },
    annual: 25000,
    apply:   { en: "scholarships.punjab.gov.in", hi: "scholarships.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","10th/12th Marksheet","Income Certificate","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","10वीं/12वीं मार्कशीट","आय प्रमाण पत्र","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "punjab_gharkari_yojana",
    icon: "💻", color: "#4338CA", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Technical Education", hi: "पंजाब तकनीकी शिक्षा विभाग" },
    name:    { en: "Punjab Ghar Ghar Rozgar & Karobar Mission",       hi: "पंजाब घर घर रोजगार एवं कारोबार मिशन" },
    benefit: { en: "Free skill training + job placement assistance + ₹2,500/month stipend during training", hi: "मुफ्त कौशल प्रशिक्षण + नौकरी सहायता + प्रशिक्षण के दौरान ₹2,500/माह वजीफा" },
    tag:     { en: "Student / Employment", hi: "छात्र / रोजगार" },
    annual: 30000,
    apply:   { en: "pgrkam.com", hi: "pgrkam.com" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Educational Certificates","Punjab Domicile","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","शैक्षणिक प्रमाण पत्र","पंजाब अधिवास","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["18to35"].includes(a.age),
  },

  // ── Housing ──────────────────────────────────────────────────────────────────

  {
    id: "punjab_basera",
    icon: "🏠", color: "#0F766E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Housing & Urban Development Dept.", hi: "पंजाब आवास एवं शहरी विकास विभाग" },
    name:    { en: "Punjab Basera Scheme",                            hi: "पंजाब बसेरा योजना" },
    benefit: { en: "Low-cost housing units for urban slum dwellers at ₹1.50 Lakh total cost", hi: "शहरी झुग्गीवासियों को ₹1.50 लाख कुल लागत पर किफायती मकान" },
    tag:     { en: "Housing / Urban", hi: "आवास / शहरी" },
    annual: 150000,
    apply:   { en: "punjabhousing.nic.in", hi: "punjabhousing.nic.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card","Income Certificate","No Property Certificate","Punjab Domicile"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण पत्र","संपत्ति न होने का प्रमाण","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  // ── Senior Citizens ──────────────────────────────────────────────────────────

  {
    id: "punjab_budhapa_pension",
    icon: "👴", color: "#B45309", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security Dept.", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Punjab Old Age Pension Scheme",                   hi: "पंजाब बुढ़ापा पेंशन योजना" },
    benefit: { en: "₹1,500/month pension for senior citizens aged 58+ from BPL families", hi: "BPL परिवार के 58+ वर्ष के वरिष्ठ नागरिकों को ₹1,500/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 18000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (Birth Certificate / School Certificate)","BPL Ration Card","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","आयु प्रमाण (जन्म/स्कूल प्रमाण पत्र)","BPL राशन कार्ड","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "punjab_divyang_pension",
    icon: "🦽", color: "#6D28D9", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security Dept.", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Punjab Disabled Persons Pension Scheme",          hi: "पंजाब दिव्यांग पेंशन योजना" },
    benefit: { en: "₹1,500/month for persons with ≥50% disability from BPL families", hi: "BPL परिवार के ≥50% दिव्यांग व्यक्तियों को ₹1,500/माह" },
    tag:     { en: "Disability / Pension", hi: "दिव्यांग / पेंशन" },
    annual: 18000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Disability Certificate (≥50%)","BPL Ration Card","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","दिव्यांगता प्रमाण पत्र (≥50%)","BPL राशन कार्ड","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income),
  },

  // ── Business / Entrepreneurship ──────────────────────────────────────────────

  {
    id: "punjab_ghar_ghar_rozgar_loan",
    icon: "💼", color: "#7C3AED", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Scheduled Castes Land Development & Finance Corp.", hi: "पंजाब अनुसूचित जाति भूमि विकास एवं वित्त निगम" },
    name:    { en: "Punjab SC/BC Self Employment Loan Scheme",        hi: "पंजाब SC/BC स्व-रोजगार ऋण योजना" },
    benefit: { en: "Subsidised loan ₹5,000 – ₹5 Lakh at 4% interest for SC/BC entrepreneurs", hi: "SC/BC उद्यमियों को 4% ब्याज पर ₹5,000–₹5 लाख सब्सिडी ऋण" },
    tag:     { en: "Business / SC-BC Loan", hi: "व्यापार / SC-BC ऋण" },
    annual: 0,
    apply:   { en: "scsbc.punjab.gov.in", hi: "scsbc.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Caste Certificate","Business Plan","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र","व्यापार योजना","आय प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && (a.who === "business" || ["18to35","35to60"].includes(a.age)) && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Health ───────────────────────────────────────────────────────────────────

  {
    id: "punjab_sarbat_sehat_bima",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Health Dept.", hi: "पंजाब स्वास्थ्य विभाग" },
    name:    { en: "Sarbat Sehat Bima Yojana (Punjab)",              hi: "सरबत सेहत बीमा योजना (पंजाब)" },
    benefit: { en: "₹5 Lakh/year free cashless treatment at empanelled hospitals for all Punjab residents", hi: "पंजाब निवासियों को सूचीबद्ध अस्पतालों में ₹5 लाख/वर्ष मुफ्त नकद-रहित इलाज" },
    tag:     { en: "Health / Insurance", hi: "स्वास्थ्य / बीमा" },
    annual: 500000,
    apply:   { en: "shapunjab.gov.in", hi: "shapunjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Punjab Domicile / Voter ID","Ration Card or e-Card (SSBY)"],
               hi: ["आधार कार्ड","पंजाब अधिवास / मतदाता पहचान पत्र","राशन कार्ड या ई-कार्ड (SSBY)"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Widow / Dependent Women ──────────────────────────────────────────────────

  {
    id: "punjab_widow_pension",
    icon: "🕊️", color: "#9D174D", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security Dept.", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Punjab Vidhwa Pension Scheme",                    hi: "पंजाब विधवा पेंशन योजना" },
    benefit: { en: "₹1,500/month pension for widows aged 18–58 from BPL families", hi: "BPL परिवार की 18–58 वर्ष की विधवाओं को ₹1,500/माह पेंशन" },
    tag:     { en: "Women / Widow Pension", hi: "महिला / विधवा पेंशन" },
    annual: 18000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Husband's Death Certificate","BPL Ration Card","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","पति का मृत्यु प्रमाण पत्र","BPL राशन कार्ड","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "punjab_nanhi_chhaan",
    icon: "🌸", color: "#BE185D", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Women & Child Development", hi: "पंजाब महिला एवं बाल विकास विभाग" },
    name:    { en: "Nanhi Chhaan Scheme (Punjab)",                    hi: "नन्ही छाँव योजना (पंजाब)" },
    benefit: { en: "₹2,100 cash + free immunisation & nutrition support for girl child at birth in BPL families", hi: "BPL परिवार में बेटी के जन्म पर ₹2,100 नकद + मुफ्त टीकाकरण एवं पोषण सहायता" },
    tag:     { en: "Women / Girl Child", hi: "महिला / बालिका" },
    annual: 2100,
    apply:   { en: "Punjab Anganwadi Centre / CDPO Office", hi: "पंजाब आंगनवाड़ी केंद्र / CDPO कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (Mother)","Girl Child Birth Certificate","BPL Ration Card","Bank Account"],
               hi: ["आधार कार्ड (माँ का)","बालिका जन्म प्रमाण पत्र","BPL राशन कार्ड","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Farmers (Additional) ─────────────────────────────────────────────────────

  {
    id: "punjab_solar_pump",
    icon: "☀️", color: "#CA8A04", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Energy Development Agency (PEDA)", hi: "पंजाब ऊर्जा विकास एजेंसी (PEDA)" },
    name:    { en: "Punjab Kisan Solar Pump Scheme",                  hi: "पंजाब किसान सौर पम्प योजना" },
    benefit: { en: "75% subsidy on solar water pumps (2HP – 10HP) for farmers; saves ₹12,000–₹40,000/year on electricity", hi: "किसानों को 2HP–10HP सौर पम्प पर 75% सब्सिडी; बिजली में ₹12,000–₹40,000/वर्ष की बचत" },
    tag:     { en: "Farmer / Solar Energy", hi: "किसान / सौर ऊर्जा" },
    annual: 40000,
    apply:   { en: "peda.gov.in", hi: "peda.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Girdawari)","Bank Account","Punjab Domicile","Electricity Bill"],
               hi: ["आधार कार्ड","जमीन के कागज़ (गिरदावरी)","बैंक खाता","पंजाब अधिवास","बिजली बिल"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer",
  },

  {
    id: "punjab_free_electricity_farmer",
    icon: "⚡", color: "#D97706", scope: "state", state: "Punjab",
    ministry: { en: "Punjab State Power Corporation Ltd. (PSPCL)", hi: "पंजाब राज्य विद्युत निगम लि. (PSPCL)" },
    name:    { en: "Punjab Free Electricity Scheme for Farmers",      hi: "पंजाब किसान मुफ्त बिजली योजना" },
    benefit: { en: "Free 8 hours/day electricity supply for agricultural tubewells (up to 7HP motor)", hi: "कृषि ट्यूबवेल (7HP तक) के लिए प्रतिदिन 8 घंटे मुफ्त बिजली" },
    tag:     { en: "Farmer / Free Electricity", hi: "किसान / मुफ्त बिजली" },
    annual: 0,
    apply:   { en: "pspcl.in", hi: "pspcl.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records","Electricity Connection Documents","Bank Account"],
               hi: ["आधार कार्ड","जमीन के कागज़","बिजली कनेक्शन दस्तावेज़","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer",
  },

  // ── Education (Additional) ───────────────────────────────────────────────────

  {
    id: "punjab_sc_postmatric_scholarship",
    icon: "📖", color: "#1E40AF", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Welfare of SC/BC Dept.", hi: "पंजाब SC/BC कल्याण विभाग" },
    name:    { en: "Punjab SC Post-Matric Scholarship",               hi: "पंजाब SC पोस्ट-मैट्रिक छात्रवृत्ति" },
    benefit: { en: "Full tuition fee reimbursement + ₹1,200–₹2,250/month maintenance allowance for SC students in Class 11 to PhD", hi: "SC छात्रों के लिए पूर्ण ट्यूशन शुल्क + ₹1,200–₹2,250/माह रखरखाव भत्ता (कक्षा 11 से PhD तक)" },
    tag:     { en: "Student / SC Scholarship", hi: "छात्र / SC छात्रवृत्ति" },
    annual: 27000,
    apply:   { en: "scholarships.punjab.gov.in", hi: "scholarships.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC)","Previous Year Marksheet","Income Certificate (≤₹2.5L/year)","Bank Account","Admission Receipt"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC)","पिछले वर्ष की मार्कशीट","आय प्रमाण (≤₹2.5 लाख/वर्ष)","बैंक खाता","प्रवेश रसीद"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "punjab_smart_connect",
    icon: "📱", color: "#2563EB", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Governance Reforms", hi: "पंजाब शासन सुधार विभाग" },
    name:    { en: "Punjab Smart Connect Scheme (Smartphone)",         hi: "पंजाब स्मार्ट कनेक्ट योजना (स्मार्टफोन)" },
    benefit: { en: "Free smartphone for students studying in Govt. colleges (Class 12 pass from Govt. school)", hi: "सरकारी स्कूल से 12वीं पास और सरकारी कॉलेज में पढ़ने वाले छात्रों को मुफ्त स्मार्टफोन" },
    tag:     { en: "Student / Free Smartphone", hi: "छात्र / मुफ्त स्मार्टफोन" },
    annual: 8000,
    apply:   { en: "Punjab Government College / ilovepunjab.gov.in", hi: "पंजाब सरकारी कॉलेज / ilovepunjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","12th Marksheet (Govt. School)","College Admission Proof","Punjab Domicile"],
               hi: ["आधार कार्ड","12वीं मार्कशीट (सरकारी स्कूल)","कॉलेज प्रवेश प्रमाण","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["below1","1to3","3to6"].includes(a.income) && ["18to35"].includes(a.age),
  },

  // ── Labour & Unorganised Workers ─────────────────────────────────────────────

  {
    id: "punjab_labour_welfare",
    icon: "🔨", color: "#92400E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Labour Dept. / Punjab Labour Welfare Board", hi: "पंजाब श्रम विभाग / पंजाब श्रम कल्याण बोर्ड" },
    name:    { en: "Punjab Labour Welfare Fund Scheme",               hi: "पंजाब श्रम कल्याण निधि योजना" },
    benefit: { en: "Multiple benefits: ₹5,000 child education grant + ₹2,000 medical aid + ₹20,000 death relief for registered workers", hi: "पंजीकृत श्रमिकों को: ₹5,000 बाल शिक्षा अनुदान + ₹2,000 चिकित्सा सहायता + ₹20,000 मृत्यु राहत" },
    tag:     { en: "Labour / Welfare", hi: "श्रम / कल्याण" },
    annual: 5000,
    apply:   { en: "pblabour.gov.in", hi: "pblabour.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Labour Registration Card","Employer Certificate","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","श्रम पंजीकरण कार्ड","नियोक्ता प्रमाण पत्र","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "punjab_street_vendor_loan",
    icon: "🛒", color: "#D97706", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Local Govt.", hi: "पंजाब स्थानीय सरकार विभाग" },
    name:    { en: "Punjab PM SVANidhi Scheme (Street Vendor Loan)",   hi: "पंजाब PM SVANidhi योजना (रेहड़ी-पटरी ऋण)" },
    benefit: { en: "Collateral-free working capital loan ₹10,000 → ₹20,000 → ₹50,000 in 3 cycles for street vendors", hi: "रेहड़ी-पटरी विक्रेताओं को 3 चरणों में ₹10,000 → ₹20,000 → ₹50,000 बिना गारंटी ऋण" },
    tag:     { en: "Business / Street Vendor", hi: "व्यापार / रेहड़ी-पटरी" },
    annual: 0,
    apply:   { en: "pmsvanidhi.mohua.gov.in", hi: "pmsvanidhi.mohua.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Vendor ID / Certificate of Vending","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","वेंडर पहचान पत्र / विक्रय प्रमाण पत्र","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "business" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Sports & Youth ───────────────────────────────────────────────────────────

  {
    id: "punjab_khel_khilaadi",
    icon: "🏅", color: "#059669", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Sports & Youth Services", hi: "पंजाब खेल एवं युवा सेवाएं विभाग" },
    name:    { en: "Punjab Khel Khilaadi Scheme",                     hi: "पंजाब खेल खिलाड़ी योजना" },
    benefit: { en: "₹500/month kit allowance + ₹5 Lakh cash award for national level + ₹20 Lakh for international medal winners", hi: "₹500/माह किट भत्ता + राष्ट्रीय स्तर पर ₹5 लाख + अंतर्राष्ट्रीय पदक पर ₹20 लाख नकद पुरस्कार" },
    tag:     { en: "Student / Sports", hi: "छात्र / खेल" },
    annual: 6000,
    apply:   { en: "punjabsports.gov.in", hi: "punjabsports.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Sports Achievement Certificate","Punjab Domicile","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","खेल उपलब्धि प्रमाण पत्र","पंजाब अधिवास","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && ["18to35"].includes(a.age),
  },

  // ── Rural Development ────────────────────────────────────────────────────────

  {
    id: "punjab_mgnrega_punjab",
    icon: "⛏️", color: "#7C2D12", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Rural Development & Panchayati Raj Dept.", hi: "पंजाब ग्रामीण विकास एवं पंचायती राज विभाग" },
    name:    { en: "MGNREGA (Punjab Implementation)",                  hi: "मनरेगा (पंजाब क्रियान्वयन)" },
    benefit: { en: "Guaranteed 100 days/year unskilled wage employment at ₹321/day (Punjab rate) + job card", hi: "₹321/दिन (पंजाब दर) पर 100 दिन/वर्ष अकुशल मजदूरी गारंटी + जॉब कार्ड" },
    tag:     { en: "Farmer / Rural Employment", hi: "किसान / ग्रामीण रोजगार" },
    annual: 32100,
    apply:   { en: "nrega.nic.in / Nearest Gram Panchayat", hi: "nrega.nic.in / नजदीकी ग्राम पंचायत" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","राशन कार्ड","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ── Nutrition & Child Welfare ────────────────────────────────────────────────

  {
    id: "punjab_anganwadi_poshan",
    icon: "🍱", color: "#F59E0B", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Women & Child Development", hi: "पंजाब महिला एवं बाल विकास विभाग" },
    name:    { en: "Punjab Anganwadi Poshan Abhiyan",                  hi: "पंजाब आंगनवाड़ी पोषण अभियान" },
    benefit: { en: "Free supplementary nutrition (Take Home Ration) for children under 6 + pregnant/lactating women; hot cooked meals at centre", hi: "6 वर्ष तक के बच्चों + गर्भवती/धात्री महिलाओं को मुफ्त पूरक पोषण (THR); केंद्र पर गर्म भोजन" },
    tag:     { en: "Women / Child Nutrition", hi: "महिला / बाल पोषण" },
    annual: 0,
    apply:   { en: "Nearest Anganwadi Centre", hi: "नजदीकी आंगनवाड़ी केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Child Birth Certificate","Ration Card","MCP Card"],
               hi: ["आधार कार्ड","बच्चे का जन्म प्रमाण पत्र","राशन कार्ड","MCP कार्ड"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Women SHG / Self Help ────────────────────────────────────────────────────

  {
    id: "punjab_shg_loan",
    icon: "🤝", color: "#7E22CE", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Rural Development & Panchayati Raj Dept.", hi: "पंजाब ग्रामीण विकास एवं पंचायती राज विभाग" },
    name:    { en: "Punjab SHG Bank Linkage Scheme (NRLM)",            hi: "पंजाब SHG बैंक लिंकेज योजना (NRLM)" },
    benefit: { en: "Interest-free / low-interest revolving loan ₹1.5 Lakh–₹6 Lakh for women Self Help Groups; ₹3,000 group formation support", hi: "महिला स्वयं सहायता समूहों को ब्याज-मुक्त / कम ब्याज पर ₹1.5–₹6 लाख घूर्णनशील ऋण; ₹3,000 समूह गठन सहायता" },
    tag:     { en: "Women / SHG Loan", hi: "महिला / SHG ऋण" },
    annual: 0,
    apply:   { en: "ruraldevelopment.punjab.gov.in", hi: "ruraldevelopment.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (all members)","SHG Registration Certificate","Bank Account (Group)","Meeting Minutes Register"],
               hi: ["आधार कार्ड (सभी सदस्य)","SHG पंजीकरण प्रमाण पत्र","बैंक खाता (समूह)","बैठक कार्यवाही रजिस्टर"] },
    match: (a) => a.state === "Punjab" && a.who === "women",
  },

  // ── Sanitation & Housing ─────────────────────────────────────────────────────

  {
    id: "punjab_swachh_toilet",
    icon: "🚽", color: "#0D9488", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Water Supply & Sanitation Dept.", hi: "पंजाब जल आपूर्ति एवं स्वच्छता विभाग" },
    name:    { en: "Punjab Swachh Bharat Mission (Gramin) – Toilet Grant", hi: "पंजाब स्वच्छ भारत मिशन (ग्रामीण) – शौचालय अनुदान" },
    benefit: { en: "₹12,000 incentive for construction of individual household toilet for BPL / SC / ST families", hi: "BPL / SC / ST परिवारों को व्यक्तिगत घरेलू शौचालय निर्माण के लिए ₹12,000 प्रोत्साहन राशि" },
    tag:     { en: "Housing / Sanitation", hi: "आवास / स्वच्छता" },
    annual: 12000,
    apply:   { en: "swachhbharatmission.gov.in / Nearest Gram Panchayat", hi: "swachhbharatmission.gov.in / नजदीकी ग्राम पंचायत" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL / Caste Certificate","Land or House Ownership Proof","Bank Account"],
               hi: ["आधार कार्ड","BPL / जाति प्रमाण पत्र","भूमि या मकान स्वामित्व प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "punjab_sc_housing",
    icon: "🏡", color: "#1E3A5F", scope: "state", state: "Punjab",
    ministry: { en: "Punjab SC/BC Welfare Dept.", hi: "पंजाब SC/BC कल्याण विभाग" },
    name:    { en: "Punjab SC Housing Scheme (Dr. Ambedkar Awas Navinikaran Yojana)", hi: "पंजाब SC आवास योजना (डॉ. अम्बेडकर आवास नवीनीकरण योजना)" },
    benefit: { en: "₹1.80 Lakh grant for construction / renovation of house for SC BPL families", hi: "SC BPL परिवारों को मकान निर्माण / नवीनीकरण के लिए ₹1.80 लाख अनुदान" },
    tag:     { en: "Housing / SC Welfare", hi: "आवास / SC कल्याण" },
    annual: 180000,
    apply:   { en: "scsbc.punjab.gov.in", hi: "scsbc.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","BPL Ration Card","Land / Plot Documents","Bank Account"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","BPL राशन कार्ड","भूमि/प्लॉट दस्तावेज़","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  },

  // ── Students – Free Transport ─────────────────────────────────────────────────

  {
    id: "punjab_free_bus_pass",
    icon: "🚌", color: "#2563EB", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Transport Dept. / PUNBUS", hi: "पंजाब परिवहन विभाग / PUNBUS" },
    name:    { en: "Punjab Free Bus Pass Scheme for Students",         hi: "पंजाब छात्र मुफ्त बस पास योजना" },
    benefit: { en: "Free bus travel on PUNBUS/PRTC for students of Govt. schools & colleges (up to 100 km/day)", hi: "सरकारी स्कूल/कॉलेज के छात्रों को PUNBUS/PRTC पर मुफ्त बस यात्रा (100 km/दिन तक)" },
    tag:     { en: "Student / Free Transport", hi: "छात्र / मुफ्त परिवहन" },
    annual: 5000,
    apply:   { en: "School / College Principal Office", hi: "स्कूल / कॉलेज प्रधानाचार्य कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","School / College ID Card","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","स्कूल / कॉलेज पहचान पत्र","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "student",
  },

  // ── Fishermen ────────────────────────────────────────────────────────────────

  {
    id: "punjab_fishermen_welfare",
    icon: "🐟", color: "#0C4A6E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Fisheries Dept.", hi: "पंजाब मत्स्य पालन विभाग" },
    name:    { en: "Punjab Fishermen Welfare & Training Scheme",       hi: "पंजाब मछुआरा कल्याण एवं प्रशिक्षण योजना" },
    benefit: { en: "₹3,000/month accident insurance + free fishing net + 50% subsidy on boat purchase for registered fishermen", hi: "पंजीकृत मछुआरों को ₹3,000/माह दुर्घटना बीमा + मुफ्त मछली पकड़ने का जाल + नाव खरीद पर 50% सब्सिडी" },
    tag:     { en: "Farmer / Fishermen", hi: "किसान / मछुआरा" },
    annual: 36000,
    apply:   { en: "punjabfisheries.gov.in", hi: "punjabfisheries.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Fisherman Registration Certificate","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","मछुआरा पंजीकरण प्रमाण पत्र","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Artisans & Handicraft ────────────────────────────────────────────────────

  {
    id: "punjab_artisan_card",
    icon: "🧵", color: "#92400E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Industries & Commerce", hi: "पंजाब उद्योग एवं वाणिज्य विभाग" },
    name:    { en: "Punjab Artisan & Handicraft Worker Scheme",        hi: "पंजाब कारीगर एवं हस्तशिल्प कार्यकर्ता योजना" },
    benefit: { en: "Free tool kit + ₹2 Lakh credit at 4% interest + free design training for traditional artisans (phulkari, wood, pottery)", hi: "पारंपरिक कारीगरों (फुलकारी, लकड़ी, कुम्हारी) को मुफ्त टूल किट + 4% पर ₹2 लाख ऋण + मुफ्त डिज़ाइन प्रशिक्षण" },
    tag:     { en: "Business / Artisan", hi: "व्यापार / कारीगर" },
    annual: 0,
    apply:   { en: "punjabindustries.gov.in", hi: "punjabindustries.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Artisan / Caste Certificate","Bank Account","Passport Photo","Skill Proof or Work Sample"],
               hi: ["आधार कार्ड","कारीगर / जाति प्रमाण पत्र","बैंक खाता","पासपोर्ट फोटो","कौशल प्रमाण या कार्य नमूना"] },
    match: (a) => a.state === "Punjab" && a.who === "business" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Minority Welfare ─────────────────────────────────────────────────────────

  {
    id: "punjab_minority_scholarship",
    icon: "🕌", color: "#1D4ED8", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Minority Affairs", hi: "पंजाब अल्पसंख्यक मामलात विभाग" },
    name:    { en: "Punjab Minority Pre/Post-Matric Scholarship",      hi: "पंजाब अल्पसंख्यक प्री/पोस्ट-मैट्रिक छात्रवृत्ति" },
    benefit: { en: "₹1,000–₹10,000/year scholarship for minority community students (Muslim, Sikh, Christian, Buddhist, Jain, Parsi) with income ≤₹2L", hi: "अल्पसंख्यक समुदाय (मुस्लिम, सिख, ईसाई, बौद्ध, जैन, पारसी) के छात्रों को ₹1,000–₹10,000/वर्ष छात्रवृत्ति (आय ≤₹2 लाख)" },
    tag:     { en: "Student / Minority Scholarship", hi: "छात्र / अल्पसंख्यक छात्रवृत्ति" },
    annual: 10000,
    apply:   { en: "minorityaffairs.gov.in / scholarships.gov.in", hi: "minorityaffairs.gov.in / scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Minority Community Certificate","Previous Marksheet","Income Certificate","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","अल्पसंख्यक समुदाय प्रमाण पत्र","पिछले वर्ष की मार्कशीट","आय प्रमाण पत्र","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── Ex-Servicemen ────────────────────────────────────────────────────────────

  {
    id: "punjab_sainik_welfare",
    icon: "🎖️", color: "#1E3A5F", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Sainik Welfare Dept.", hi: "पंजाब सैनिक कल्याण विभाग" },
    name:    { en: "Punjab Ex-Servicemen Welfare Scheme",              hi: "पंजाब भूतपूर्व सैनिक कल्याण योजना" },
    benefit: { en: "₹2,000/month financial assistance + priority in govt. jobs + free education for children of ex-servicemen / war widows", hi: "भूतपूर्व सैनिकों / युद्ध विधवाओं को ₹2,000/माह सहायता + सरकारी नौकरियों में प्राथमिकता + बच्चों को मुफ्त शिक्षा" },
    tag:     { en: "Senior / Ex-Servicemen", hi: "वरिष्ठ / भूतपूर्व सैनिक" },
    annual: 24000,
    apply:   { en: "sainikwelfare.punjab.gov.in", hi: "sainikwelfare.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Discharge Certificate / PPO","Punjab Domicile","Bank Account","Service Records"],
               hi: ["आधार कार्ड","डिस्चार्ज सर्टिफिकेट / PPO","पंजाब अधिवास","बैंक खाता","सेवा अभिलेख"] },
    match: (a) => a.state === "Punjab" && (a.who === "senior" || a.age === "above60"),
  },

  // ── Construction Workers ─────────────────────────────────────────────────────

  {
    id: "punjab_bocw_welfare",
    icon: "🧱", color: "#78350F", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Building & Other Construction Workers Welfare Board", hi: "पंजाब भवन एवं अन्य निर्माण श्रमिक कल्याण बोर्ड" },
    name:    { en: "Punjab BOCW Welfare Scheme",                       hi: "पंजाब BOCW कल्याण योजना" },
    benefit: { en: "₹20,000 death/accident benefit + ₹3,000 medical aid + ₹5,000 child education grant + ₹50,000 maternity benefit for registered construction workers", hi: "पंजीकृत निर्माण श्रमिकों को ₹20,000 मृत्यु/दुर्घटना + ₹3,000 चिकित्सा + ₹5,000 बच्चा शिक्षा + ₹50,000 मातृत्व लाभ" },
    tag:     { en: "Labour / Construction Worker", hi: "श्रम / निर्माण श्रमिक" },
    annual: 5000,
    apply:   { en: "pblabour.gov.in", hi: "pblabour.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BOCW Registration Card","Bank Account","Employer Certificate (90 days construction work proof)","Punjab Domicile"],
               hi: ["आधार कार्ड","BOCW पंजीकरण कार्ड","बैंक खाता","नियोक्ता प्रमाण पत्र (90 दिन निर्माण कार्य प्रमाण)","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  // ── Free Electricity (General) ───────────────────────────────────────────────

  {
    id: "punjab_free_electricity_household",
    icon: "💡", color: "#CA8A04", scope: "state", state: "Punjab",
    ministry: { en: "Punjab State Power Corporation Ltd. (PSPCL)", hi: "पंजाब राज्य विद्युत निगम लि. (PSPCL)" },
    name:    { en: "Punjab Free Electricity Scheme (300 Units for Households)", hi: "पंजाब मुफ्त बिजली योजना (घरेलू 300 यूनिट)" },
    benefit: { en: "300 units of free electricity per month for all domestic consumers in Punjab", hi: "पंजाब के सभी घरेलू उपभोक्ताओं को प्रति माह 300 यूनिट मुफ्त बिजली" },
    tag:     { en: "General / Free Electricity", hi: "सामान्य / मुफ्त बिजली" },
    annual: 0,
    apply:   { en: "pspcl.in", hi: "pspcl.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Electricity Consumer Number","Punjab Domicile"],
               hi: ["आधार कार्ड","बिजली उपभोक्ता नंबर","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab",
  },

  // ── Water Supply ─────────────────────────────────────────────────────────────

  {
    id: "punjab_har_ghar_pani",
    icon: "💧", color: "#0891B2", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Water Supply & Sanitation Dept.", hi: "पंजाब जल आपूर्ति एवं स्वच्छता विभाग" },
    name:    { en: "Punjab Har Ghar Pani (Jal Jeevan Mission)",        hi: "पंजाब हर घर पानी (जल जीवन मिशन)" },
    benefit: { en: "Free piped potable water connection (Functional Household Tap Connection) for every rural household", hi: "प्रत्येक ग्रामीण परिवार को मुफ्त नल के ज़रिए पीने योग्य पानी का कनेक्शन (FHTC)" },
    tag:     { en: "General / Water Supply", hi: "सामान्य / जल आपूर्ति" },
    annual: 0,
    apply:   { en: "jaljeevanmission.gov.in / Nearest Gram Panchayat", hi: "jaljeevanmission.gov.in / नजदीकी ग्राम पंचायत" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Ration Card","Punjab Domicile","Proof of Residence"],
               hi: ["आधार कार्ड","राशन कार्ड","पंजाब अधिवास","निवास प्रमाण"] },
    match: (a) => a.state === "Punjab" && a.area === "rural",
  },

  // ── Dairy & Animal Husbandry ─────────────────────────────────────────────────

  {
    id: "punjab_dairy_subsidy",
    icon: "🐄", color: "#78350F", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Animal Husbandry, Dairying & Fisheries", hi: "पंजाब पशुपालन, डेयरी एवं मत्स्य पालन विभाग" },
    name:    { en: "Punjab Dairy Development Subsidy Scheme",          hi: "पंजाब डेयरी विकास सब्सिडी योजना" },
    benefit: { en: "25–33% subsidy on purchase of milch cattle (up to 2 animals); ₹50,000 max subsidy + free veterinary insurance cover", hi: "दुधारू पशु खरीद पर 25–33% सब्सिडी (अधिकतम 2 पशु); ₹50,000 तक सब्सिडी + मुफ्त पशु बीमा" },
    tag:     { en: "Farmer / Dairy", hi: "किसान / डेयरी" },
    annual: 50000,
    apply:   { en: "milkfed.punjab.gov.in", hi: "milkfed.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records / Shed Proof","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","जमीन / शेड प्रमाण","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "punjab_beekeeping",
    icon: "🐝", color: "#B45309", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Horticulture Dept.", hi: "पंजाब बागवानी विभाग" },
    name:    { en: "Punjab Beekeeping Promotion Scheme",               hi: "पंजाब मधुमक्खी पालन प्रोत्साहन योजना" },
    benefit: { en: "50% subsidy on beehive boxes (up to 50 boxes) + free training + ₹5,000 startup grant for new beekeepers", hi: "नए मधुमक्खी पालकों को 50% सब्सिडी (50 बक्से तक) + मुफ्त प्रशिक्षण + ₹5,000 स्टार्टअप अनुदान" },
    tag:     { en: "Farmer / Beekeeping", hi: "किसान / मधुमक्खी पालन" },
    annual: 5000,
    apply:   { en: "hortpb.gov.in", hi: "hortpb.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","जमीन के कागज़","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer",
  },

  {
    id: "punjab_organic_farming",
    icon: "🌿", color: "#15803D", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Agriculture Dept.", hi: "पंजाब कृषि विभाग" },
    name:    { en: "Punjab Organic Farming Promotion Scheme",          hi: "पंजाब जैविक खेती प्रोत्साहन योजना" },
    benefit: { en: "₹10,000/acre/year incentive (max 5 acres) for switching to organic farming + free organic certification support", hi: "जैविक खेती अपनाने पर ₹10,000/एकड़/वर्ष प्रोत्साहन (अधिकतम 5 एकड़) + मुफ्त जैविक प्रमाणन सहायता" },
    tag:     { en: "Farmer / Organic", hi: "किसान / जैविक खेती" },
    annual: 50000,
    apply:   { en: "agripb.gov.in", hi: "agripb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Girdawari)","Bank Account","Punjab Domicile","Previous Crop Records"],
               hi: ["आधार कार्ड","जमीन के कागज़ (गिरदावरी)","बैंक खाता","पंजाब अधिवास","पिछली फसल अभिलेख"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer",
  },

  // ── Health (Additional) ──────────────────────────────────────────────────────

  {
    id: "punjab_drug_deaddiction",
    icon: "🏨", color: "#7C3AED", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Health & Family Welfare Dept.", hi: "पंजाब स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Punjab Ot Ot (Drug De-Addiction) Scheme",          hi: "पंजाब ओट-ओट (नशामुक्ति) योजना" },
    benefit: { en: "Free residential drug de-addiction treatment at Govt. OAT centres; free medicines + counselling + rehabilitation support", hi: "सरकारी OAT केंद्रों पर मुफ्त आवासीय नशामुक्ति उपचार; मुफ्त दवाएं + परामर्श + पुनर्वास सहायता" },
    tag:     { en: "Health / De-Addiction", hi: "स्वास्थ्य / नशामुक्ति" },
    annual: 0,
    apply:   { en: "Nearest Govt. Hospital / OAT Centre", hi: "नजदीकी सरकारी अस्पताल / OAT केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Medical Referral (if any)","Punjab Domicile"],
               hi: ["आधार कार्ड","चिकित्सा रेफरल (यदि हो)","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "punjab_muft_ilaj",
    icon: "💊", color: "#0369A1", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Health Dept.", hi: "पंजाब स्वास्थ्य विभाग" },
    name:    { en: "Punjab Muft Ilaj Scheme (Free OPD & Medicines)",   hi: "पंजाब मुफ्त इलाज योजना (OPD एवं दवाएं)" },
    benefit: { en: "Free OPD consultation + free generic medicines at all Govt. hospitals & Aam Aadmi Clinics in Punjab", hi: "पंजाब के सभी सरकारी अस्पतालों और आम आदमी क्लीनिकों में मुफ्त OPD + मुफ्त जेनेरिक दवाएं" },
    tag:     { en: "Health / Free Medicine", hi: "स्वास्थ्य / मुफ्त दवा" },
    annual: 0,
    apply:   { en: "Nearest Govt. Hospital / Aam Aadmi Clinic", hi: "नजदीकी सरकारी अस्पताल / आम आदमी क्लीनिक" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Punjab Domicile (for AAC registration)"],
               hi: ["आधार कार्ड","पंजाब अधिवास (AAC पंजीकरण के लिए)"] },
    match: (a) => a.state === "Punjab",
  },

  // ── Disability & Special Needs ───────────────────────────────────────────────

  {
    id: "punjab_disability_scholarship",
    icon: "📚", color: "#6D28D9", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Social Security & Women & Child Development", hi: "पंजाब सामाजिक सुरक्षा एवं महिला बाल विकास विभाग" },
    name:    { en: "Punjab Divyang Students Scholarship Scheme",       hi: "पंजाब दिव्यांग छात्र छात्रवृत्ति योजना" },
    benefit: { en: "₹1,500–₹4,000/month scholarship for students with ≥40% disability studying in Class 1 to PG level", hi: "≥40% दिव्यांगता वाले कक्षा 1 से PG तक के छात्रों को ₹1,500–₹4,000/माह छात्रवृत्ति" },
    tag:     { en: "Student / Disability Scholarship", hi: "छात्र / दिव्यांग छात्रवृत्ति" },
    annual: 48000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Disability Certificate (>=40%)","School / College Enrolment Proof","Income Certificate","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","दिव्यांगता प्रमाण पत्र (>=40%)","स्कूल/कॉलेज प्रवेश प्रमाण","आय प्रमाण","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── Legal Aid ────────────────────────────────────────────────────────────────

  {
    id: "punjab_legal_aid",
    icon: "⚖️", color: "#1E3A5F", scope: "state", state: "Punjab",
    ministry: { en: "Punjab State Legal Services Authority (PSLSA)", hi: "पंजाब राज्य विधिक सेवा प्राधिकरण (PSLSA)" },
    name:    { en: "Punjab Free Legal Aid Scheme",                     hi: "पंजाब मुफ्त कानूनी सहायता योजना" },
    benefit: { en: "Free legal counsel, court representation, and advice for BPL / SC / women / disabled / children / prisoners", hi: "BPL / SC / महिला / दिव्यांग / बच्चे / कैदियों को मुफ्त कानूनी परामर्श, अदालत में प्रतिनिधित्व एवं सलाह" },
    tag:     { en: "General / Legal Aid", hi: "सामान्य / कानूनी सहायता" },
    annual: 0,
    apply:   { en: "pslsa.gov.in / Nearest District Legal Services Authority", hi: "pslsa.gov.in / नजदीकी जिला विधिक सेवा प्राधिकरण" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Income / BPL / Caste Certificate (as applicable)","Case Details"],
               hi: ["आधार कार्ड","आय / BPL / जाति प्रमाण पत्र (जैसा लागू हो)","मामले का विवरण"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income),
  },

  // ── Cycle-to-School ──────────────────────────────────────────────────────────

  {
    id: "punjab_cycle_yojana",
    icon: "🚲", color: "#0F766E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of School Education", hi: "पंजाब स्कूल शिक्षा विभाग" },
    name:    { en: "Punjab Free Cycle Scheme for Students",            hi: "पंजाब छात्रों के लिए मुफ्त साइकिल योजना" },
    benefit: { en: "Free bicycle for girl students of Class 9 and SC/BC boy students in Govt. schools (rural areas)", hi: "ग्रामीण सरकारी स्कूलों में कक्षा 9 की छात्राओं और SC/BC लड़कों को मुफ्त साइकिल" },
    tag:     { en: "Student / Free Cycle", hi: "छात्र / मुफ्त साइकिल" },
    annual: 3500,
    apply:   { en: "School Principal / Block Education Officer", hi: "स्कूल प्रधानाचार्य / खंड शिक्षा अधिकारी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","School Enrolment Certificate","Caste Certificate (for SC/BC boys)","Punjab Domicile"],
               hi: ["आधार कार्ड","स्कूल प्रवेश प्रमाण पत्र","जाति प्रमाण पत्र (SC/BC लड़कों के लिए)","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && a.age === "below18",
  },

  // ── Micro-Finance for Women ──────────────────────────────────────────────────

  {
    id: "punjab_women_microfinance",
    icon: "💰", color: "#B91C1C", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Women Development Corporation", hi: "पंजाब महिला विकास निगम" },
    name:    { en: "Punjab Women Micro-Finance Loan Scheme",           hi: "पंजाब महिला माइक्रो-फाइनेंस ऋण योजना" },
    benefit: { en: "Collateral-free loan ₹25,000–₹2 Lakh at 4% interest for women entrepreneurs; repayment up to 5 years", hi: "महिला उद्यमियों को 4% ब्याज पर ₹25,000–₹2 लाख बिना गारंटी ऋण; 5 वर्ष तक चुकौती" },
    tag:     { en: "Women / Micro Finance", hi: "महिला / माइक्रो फाइनेंस" },
    annual: 0,
    apply:   { en: "pwdc.co.in", hi: "pwdc.co.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Income Certificate","Bank Account","Business Plan","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","आय प्रमाण","बैंक खाता","व्यापार योजना","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Disaster Relief ──────────────────────────────────────────────────────────

  {
    id: "punjab_disaster_relief",
    icon: "🔥", color: "#DC2626", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Revenue & Disaster Management Dept.", hi: "पंजाब राजस्व एवं आपदा प्रबंधन विभाग" },
    name:    { en: "Punjab Natural Calamity / Fire Victim Relief Scheme", hi: "पंजाब प्राकृतिक आपदा / अग्निकांड पीड़ित राहत योजना" },
    benefit: { en: "Ex-gratia ₹95,100 for death + ₹4,100–₹8,200 for injury + ₹5,200 for house damage due to fire / flood / storm", hi: "मृत्यु पर ₹95,100 + चोट पर ₹4,100–₹8,200 + आग/बाढ़/तूफान से मकान क्षति पर ₹5,200 अनुग्रह राशि" },
    tag:     { en: "General / Disaster Relief", hi: "सामान्य / आपदा राहत" },
    annual: 0,
    apply:   { en: "Nearest Tehsildar / District Collector Office", hi: "नजदीकी तहसीलदार / जिला कलेक्टर कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","FIR / Incident Report","Damage Assessment Report (Patwari)","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","FIR / घटना रिपोर्ट","क्षति आकलन रिपोर्ट (पटवारी)","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab",
  },

  // ── Food Security ────────────────────────────────────────────────────────────

  {
    id: "punjab_ration_doorstep",
    icon: "🛍️", color: "#16A34A", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Food & Civil Supplies Dept.", hi: "पंजाब खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Punjab Doorstep Ration Delivery Scheme",           hi: "पंजाब दरवाज़े पर राशन वितरण योजना" },
    benefit: { en: "Free home delivery of monthly ration (wheat, rice, sugar) to elderly, disabled, and bedridden BPL beneficiaries", hi: "वृद्ध, दिव्यांग और बिस्तर पर पड़े BPL लाभार्थियों को प्रतिमाह राशन की मुफ्त घर डिलीवरी" },
    tag:     { en: "Senior / Food Delivery", hi: "वरिष्ठ / खाद्य वितरण" },
    annual: 0,
    apply:   { en: "Nearest Ration Depot / edistrict.punjabgovt.gov.in", hi: "नजदीकी राशन डिपो / edistrict.punjabgovt.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Disability / Age Certificate","Punjab Domicile"],
               hi: ["आधार कार्ड","BPL राशन कार्ड","दिव्यांगता / आयु प्रमाण पत्र","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  // ── Skill Development ────────────────────────────────────────────────────────

  {
    id: "punjab_himmat_scheme",
    icon: "🛠️", color: "#0369A1", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Social Security", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Punjab Himmat Scheme (Disability Skill & Self-Employment)", hi: "पंजाब हिम्मत योजना (दिव्यांग कौशल एवं स्वरोजगार)" },
    benefit: { en: "Free skill training (3–6 months) + ₹1,500/month stipend + ₹50,000 seed capital for self-employment for persons with disabilities", hi: "दिव्यांग व्यक्तियों को 3–6 माह मुफ्त कौशल प्रशिक्षण + ₹1,500/माह वजीफा + ₹50,000 स्वरोजगार बीज पूंजी" },
    tag:     { en: "Business / Disability Skill", hi: "व्यापार / दिव्यांग कौशल" },
    annual: 18000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Disability Certificate (>=40%)","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","दिव्यांगता प्रमाण पत्र (>=40%)","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3","3to6"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  // ── Horticulture & Allied Farming ────────────────────────────────────────────

  {
    id: "punjab_mushroom_cultivation",
    icon: "🍄", color: "#92400E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Horticulture Dept.", hi: "पंजाब बागवानी विभाग" },
    name:    { en: "Punjab Mushroom Cultivation Scheme",               hi: "पंजाब मशरूम उत्पादन योजना" },
    benefit: { en: "50% subsidy on mushroom spawn, infrastructure & equipment (up to ₹25,000); free 5-day training at Govt. centre", hi: "मशरूम स्पॉन, बुनियादी ढांचे एवं उपकरणों पर 50% सब्सिडी (₹25,000 तक); सरकारी केंद्र पर 5 दिन मुफ्त प्रशिक्षण" },
    tag:     { en: "Farmer / Horticulture", hi: "किसान / बागवानी" },
    annual: 25000,
    apply:   { en: "hortpb.gov.in", hi: "hortpb.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land / Room Ownership Proof","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","जमीन / कमरा स्वामित्व प्रमाण","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "punjab_poultry_subsidy",
    icon: "🐓", color: "#B45309", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Animal Husbandry", hi: "पंजाब पशुपालन विभाग" },
    name:    { en: "Punjab Poultry Development Subsidy Scheme",        hi: "पंजाब मुर्गीपालन विकास सब्सिडी योजना" },
    benefit: { en: "33% subsidy on poultry shed construction + chick purchase (up to 500 birds); ₹30,000 max subsidy + free veterinary support", hi: "मुर्गी शेड निर्माण + चूजे खरीद पर 33% सब्सिडी (500 पक्षी तक); ₹30,000 तक सब्सिडी + मुफ्त पशु चिकित्सा सहायता" },
    tag:     { en: "Farmer / Poultry", hi: "किसान / मुर्गीपालन" },
    annual: 30000,
    apply:   { en: "animalhusbandrypunjab.gov.in", hi: "animalhusbandrypunjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land / Shed Ownership Proof","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","जमीन / शेड स्वामित्व प्रमाण","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "punjab_cold_storage",
    icon: "🧊", color: "#0891B2", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Horticulture & Food Processing Dept.", hi: "पंजाब बागवानी एवं खाद्य प्रसंस्करण विभाग" },
    name:    { en: "Punjab Cold Storage & Food Processing Subsidy",    hi: "पंजाब शीत गृह एवं खाद्य प्रसंस्करण सब्सिडी" },
    benefit: { en: "35% capital subsidy on cold storage / pack house / food processing unit setup (max ₹1.5 Crore); soft loan at 6% for farmers & FPOs", hi: "शीत गृह / पैक हाउस / खाद्य प्रसंस्करण इकाई स्थापना पर 35% पूंजी सब्सिडी (अधिकतम ₹1.5 करोड़); किसानों और FPO को 6% पर सॉफ्ट लोन" },
    tag:     { en: "Farmer / Food Processing", hi: "किसान / खाद्य प्रसंस्करण" },
    annual: 0,
    apply:   { en: "hortpb.gov.in / Punjab Agro Industries Corp.", hi: "hortpb.gov.in / पंजाब एग्रो इंडस्ट्रीज कॉर्प." }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land / Lease Documents","Project Report","Bank Account","Punjab Domicile","GST Registration (if applicable)"],
               hi: ["आधार कार्ड","जमीन / लीज दस्तावेज़","परियोजना रिपोर्ट","बैंक खाता","पंजाब अधिवास","GST पंजीकरण (यदि लागू हो)"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer",
  },

  // ── Students (Additional) ─────────────────────────────────────────────────────

  {
    id: "punjab_nursing_scholarship",
    icon: "🩺", color: "#0F766E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Health Dept. / Punjab Nurses Registration Council", hi: "पंजाब स्वास्थ्य विभाग / पंजाब नर्स पंजीकरण परिषद" },
    name:    { en: "Punjab Nursing & Paramedical Student Scholarship",  hi: "पंजाब नर्सिंग एवं पैरामेडिकल छात्र छात्रवृत्ति" },
    benefit: { en: "₹12,000–₹20,000/year tuition support for nursing / paramedical students from BPL families in Govt. institutes", hi: "सरकारी संस्थानों में BPL परिवार के नर्सिंग/पैरामेडिकल छात्रों को ₹12,000–₹20,000/वर्ष ट्यूशन सहायता" },
    tag:     { en: "Student / Medical Scholarship", hi: "छात्र / मेडिकल छात्रवृत्ति" },
    annual: 20000,
    apply:   { en: "scholarships.punjab.gov.in", hi: "scholarships.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Admission Letter (Nursing / Paramedical)","Income Certificate (BPL)","Previous Marksheet","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","प्रवेश पत्र (नर्सिंग/पैरामेडिकल)","आय प्रमाण (BPL)","पिछले वर्ष की मार्कशीट","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ── Transgender Welfare ──────────────────────────────────────────────────────

  {
    id: "punjab_transgender_welfare",
    icon: "🏳️", color: "#7C3AED", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security & Women & Child Development Dept.", hi: "पंजाब सामाजिक सुरक्षा एवं महिला बाल विकास विभाग" },
    name:    { en: "Punjab Transgender Welfare Scheme",                hi: "पंजाब ट्रांसजेंडर कल्याण योजना" },
    benefit: { en: "₹1,500/month pension + free skill training + free medical treatment + identity certificate support for transgender persons", hi: "ट्रांसजेंडर व्यक्तियों को ₹1,500/माह पेंशन + मुफ्त कौशल प्रशिक्षण + मुफ्त चिकित्सा + पहचान प्रमाण पत्र सहायता" },
    tag:     { en: "General / Transgender Welfare", hi: "सामान्य / ट्रांसजेंडर कल्याण" },
    annual: 18000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Transgender Identity Certificate (NCERT/District)","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","ट्रांसजेंडर पहचान प्रमाण पत्र (NCERT/जिला)","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income),
  },

  // ── Transport & Green Energy ──────────────────────────────────────────────────

  {
    id: "punjab_evehicle_subsidy",
    icon: "🛺", color: "#16A34A", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Transport Dept.", hi: "पंजाब परिवहन विभाग" },
    name:    { en: "Punjab E-Vehicle / E-Rickshaw Subsidy Scheme",     hi: "पंजाब ई-वाहन / ई-रिक्शा सब्सिडी योजना" },
    benefit: { en: "₹30,000 subsidy on purchase of electric rickshaw / e-loader for BPL / SC / women applicants; low-interest loan at 5% for balance", hi: "BPL / SC / महिला आवेदकों को ई-रिक्शा / ई-लोडर खरीद पर ₹30,000 सब्सिडी; शेष राशि पर 5% ब्याज ऋण" },
    tag:     { en: "Business / E-Vehicle", hi: "व्यापार / ई-वाहन" },
    annual: 30000,
    apply:   { en: "transport.punjab.gov.in", hi: "transport.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL / Caste / Gender Certificate","Driving Licence","Bank Account","Punjab Domicile","Passport Photo"],
               hi: ["आधार कार्ड","BPL / जाति / लिंग प्रमाण पत्र","ड्राइविंग लाइसेंस","बैंक खाता","पंजाब अधिवास","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "business" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── SC Land Purchase ─────────────────────────────────────────────────────────

  {
    id: "punjab_sc_land_purchase",
    icon: "🗺️", color: "#1E3A5F", scope: "state", state: "Punjab",
    ministry: { en: "Punjab SC/BC Welfare Dept.", hi: "पंजाब SC/BC कल्याण विभाग" },
    name:    { en: "Punjab SC Land Purchase Scheme",                   hi: "पंजाब SC भूमि खरीद योजना" },
    benefit: { en: "Subsidised loan up to ₹5 Lakh at 4% interest for SC landless labourers to purchase agricultural land; 20% grant component", hi: "SC भूमिहीन मजदूरों को कृषि भूमि खरीद के लिए 4% ब्याज पर ₹5 लाख तक ऋण; 20% अनुदान घटक" },
    tag:     { en: "Farmer / SC Land", hi: "किसान / SC भूमि" },
    annual: 0,
    apply:   { en: "scsbc.punjab.gov.in", hi: "scsbc.punjab.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","SC Caste Certificate","Landless Certificate (Patwari)","Bank Account","Punjab Domicile","Income Certificate"],
               hi: ["आधार कार्ड","SC जाति प्रमाण पत्र","भूमिहीन प्रमाण पत्र (पटवारी)","बैंक खाता","पंजाब अधिवास","आय प्रमाण पत्र"] },
    match: (a) => a.state === "Punjab" && a.who === "farmer" && ["below1","1to3"].includes(a.income),
  },

  // ── Eye Health ───────────────────────────────────────────────────────────────

  {
    id: "punjab_free_eye_checkup",
    icon: "👁️", color: "#0369A1", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Health Dept. / National Programme for Control of Blindness", hi: "पंजाब स्वास्थ्य विभाग / राष्ट्रीय अंधता नियंत्रण कार्यक्रम" },
    name:    { en: "Punjab Free Cataract Surgery & Eye Care Scheme",   hi: "पंजाब मुफ्त मोतियाबिंद ऑपरेशन एवं नेत्र देखभाल योजना" },
    benefit: { en: "Free cataract surgery + free spectacles for BPL patients at empanelled Govt. / private hospitals; IOL implant included", hi: "BPL मरीजों को सूचीबद्ध सरकारी/निजी अस्पतालों पर मुफ्त मोतियाबिंद ऑपरेशन + मुफ्त चश्मा; IOL प्रत्यारोपण शामिल" },
    tag:     { en: "Health / Eye Care", hi: "स्वास्थ्य / नेत्र देखभाल" },
    annual: 0,
    apply:   { en: "Nearest Govt. District Hospital / Eye Camp", hi: "नजदीकी सरकारी जिला अस्पताल / नेत्र शिविर" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Doctor Referral Letter","Punjab Domicile"],
               hi: ["आधार कार्ड","BPL राशन कार्ड","डॉक्टर रेफरल पत्र","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  // ── Bonded Labour ────────────────────────────────────────────────────────────

  {
    id: "punjab_bonded_labour_rehab",
    icon: "🔓", color: "#DC2626", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Labour Dept.", hi: "पंजाब श्रम विभाग" },
    name:    { en: "Punjab Bonded Labour Rehabilitation Scheme",       hi: "पंजाब बंधुआ मजदूर पुनर्वास योजना" },
    benefit: { en: "₹20,000 immediate cash relief + free skill training + priority housing & ration card for released bonded labourers", hi: "मुक्त बंधुआ मजदूरों को ₹20,000 तत्काल नकद राहत + मुफ्त कौशल प्रशिक्षण + आवास एवं राशन कार्ड में प्राथमिकता" },
    tag:     { en: "Labour / Bonded Labour", hi: "श्रम / बंधुआ मजदूर" },
    annual: 20000,
    apply:   { en: "pblabour.gov.in / Nearest District Labour Office", hi: "pblabour.gov.in / नजदीकी जिला श्रम कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Release Certificate (District Magistrate)","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड","मुक्ति प्रमाण पत्र (जिला मजिस्ट्रेट)","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && ["below1","1to3"].includes(a.income),
  },

  // ── Startup & Innovation ──────────────────────────────────────────────────────

  {
    id: "punjab_startup_punjab",
    icon: "🚀", color: "#4F46E5", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Dept. of Industries & Commerce (Invest Punjab)", hi: "पंजाब उद्योग एवं वाणिज्य विभाग (इन्वेस्ट पंजाब)" },
    name:    { en: "Startup Punjab Scheme",                            hi: "स्टार्टअप पंजाब योजना" },
    benefit: { en: "₹5 Lakh seed grant + free incubation space (12 months) + mentorship + 100% SGST reimbursement for 3 years for registered Punjab startups", hi: "पंजीकृत पंजाब स्टार्टअप को ₹5 लाख बीज अनुदान + 12 माह मुफ्त इनक्यूबेशन + मेंटरशिप + 3 वर्ष 100% SGST प्रतिपूर्ति" },
    tag:     { en: "Business / Startup", hi: "व्यापार / स्टार्टअप" },
    annual: 500000,
    apply:   { en: "investpunjab.gov.in", hi: "investpunjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card / PAN","DPIIT / Startup India Recognition","Business Plan","GST Registration","Bank Account","Punjab Domicile"],
               hi: ["आधार कार्ड / PAN","DPIIT / स्टार्टअप इंडिया मान्यता","व्यापार योजना","GST पंजीकरण","बैंक खाता","पंजाब अधिवास"] },
    match: (a) => a.state === "Punjab" && a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  // ── Women in Panchayat ────────────────────────────────────────────────────────

  {
    id: "punjab_panchayat_women",
    icon: "🗳️", color: "#BE185D", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Rural Development & Panchayati Raj Dept.", hi: "पंजाब ग्रामीण विकास एवं पंचायती राज विभाग" },
    name:    { en: "Punjab Elected Women Panchayat Member Capacity Building Scheme", hi: "पंजाब निर्वाचित महिला पंचायत सदस्य क्षमता विकास योजना" },
    benefit: { en: "Free 5-day governance & leadership training + ₹3,000 training allowance + legal rights handbook for elected women panchayat members", hi: "निर्वाचित महिला पंचायत सदस्यों को 5 दिन मुफ्त शासन एवं नेतृत्व प्रशिक्षण + ₹3,000 प्रशिक्षण भत्ता + कानूनी अधिकार पुस्तिका" },
    tag:     { en: "Women / Panchayat Leadership", hi: "महिला / पंचायत नेतृत्व" },
    annual: 3000,
    apply:   { en: "ruraldevelopment.punjab.gov.in / Block Development Office", hi: "ruraldevelopment.punjab.gov.in / खंड विकास कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Panchayat Election Certificate","Punjab Domicile","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","पंचायत चुनाव प्रमाण पत्र","पंजाब अधिवास","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && a.area === "rural",
  },

  // ── Urban Poor ────────────────────────────────────────────────────────────────

  {
    id: "punjab_urban_shelter_fund",
    icon: "🏘️", color: "#0F766E", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Housing & Urban Development Dept.", hi: "पंजाब आवास एवं शहरी विकास विभाग" },
    name:    { en: "Punjab Urban Shelter Fund Scheme (Night Shelter)",  hi: "पंजाब शहरी आश्रय निधि योजना (नाइट शेल्टर)" },
    benefit: { en: "Free night shelter accommodation + meals + basic healthcare for urban homeless persons; ₹500/month vocational support", hi: "शहरी बेघर व्यक्तियों को मुफ्त रात्रि आश्रय + भोजन + बुनियादी स्वास्थ्य देखभाल; ₹500/माह व्यावसायिक सहायता" },
    tag:     { en: "General / Urban Homeless", hi: "सामान्य / शहरी बेघर" },
    annual: 6000,
    apply:   { en: "Nearest Urban Local Body / Municipal Corporation Office", hi: "नजदीकी शहरी स्थानीय निकाय / नगर निगम कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (if available)","Self-Declaration of Homelessness","Punjab Domicile (if available)"],
               hi: ["आधार कार्ड (यदि उपलब्ध हो)","बेघर होने का स्व-घोषणा पत्र","पंजाब अधिवास (यदि उपलब्ध हो)"] },
    match: (a) => a.state === "Punjab" && ["below1"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  // ADD MORE PUNJAB SCHEMES ABOVE THIS LINE
  // {
  //   id: "punjab_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Punjab",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Punjab",
  // },

];
