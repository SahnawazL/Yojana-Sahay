// Karnataka — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "karnataka_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const KARNATAKA_SCHEMES = [

  // ── FARMER ───────────────────────────────────────────────────────────────

  {
    id: "karnataka_rythu",
    icon: "🌾", color: "#065F46", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Agriculture Dept.", hi: "कर्नाटक कृषि विभाग" },
    name:    { en: "Rythu Samruddhi Scheme (KA)",           hi: "रायतु समृद्धि योजना (कर्नाटक)" },
    benefit: { en: "₹2,000/acre crop bonus up to 2 acres", hi: "₹2,000/एकड़ फसल बोनस (अधिकतम 2 एकड़)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 4000,
    apply:   { en: "https://raitamitra.karnataka.gov.in", hi: "raitamitra.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Bank Account"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  {
    id: "karnataka_krishi_bhagya",
    icon: "💧", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Agriculture Dept.", hi: "कर्नाटक कृषि विभाग" },
    name:    { en: "Krishi Bhagya Scheme",                         hi: "कृषि भाग्य योजना" },
    benefit: { en: "Subsidy on farm pond, pump set & drip irrigation", hi: "खेत तालाब, पंप सेट और ड्रिप सिंचाई पर सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://raitamitra.karnataka.gov.in", hi: "raitamitra.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Bank Account", "Photo"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बैंक खाता", "फोटो"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "karnataka_raitha_siri",
    icon: "🐄", color: "#15803D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Animal Husbandry Dept.", hi: "कर्नाटक पशुपालन विभाग" },
    name:    { en: "Raitha Siri (Livestock Scheme)",                hi: "रैठा सिरी (पशुधन योजना)" },
    benefit: { en: "Subsidy up to ₹1 Lakh for purchasing milch cattle & poultry", hi: "दुधारू पशु और मुर्गी पालन के लिए ₹1 लाख तक सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://ahvs.karnataka.gov.in", hi: "ahvs.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land/Caste Certificate", "Bank Account", "Photo"],
               hi: ["आधार कार्ड", "जमीन/जाति प्रमाण", "बैंक खाता", "फोटो"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && ["below1", "1to3"].includes(a.income),
  },

  // ── WOMEN ────────────────────────────────────────────────────────────────

  {
    id: "karnataka_gruha_lakshmi",
    icon: "👩", color: "#BE185D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women & Child Dev. Dept.", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Gruha Lakshmi Scheme",                                     hi: "गृह लक्ष्मी योजना" },
    benefit: { en: "₹2,000/month to the woman head of every BPL household",   hi: "हर BPL घर की महिला मुखिया को ₹2,000/माह" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 24000,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card (BPL)", "Bank Account (women's name)", "Domicile Certificate"],
               hi: ["आधार कार्ड", "राशन कार्ड (BPL)", "बैंक खाता (महिला के नाम)", "अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_bhagyalakshmi",
    icon: "👧", color: "#DB2777", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women & Child Dev. Dept.", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Bhagyalakshmi Scheme",                                          hi: "भाग्यलक्ष्मी योजना" },
    benefit: { en: "₹25,000 bond for girl child at birth + ₹1 Lakh at age 18",    hi: "बालिका जन्म पर ₹25,000 बॉन्ड + 18 वर्ष पर ₹1 लाख" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Girl Child Birth Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "बालिका जन्म प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_mathru_poorna",
    icon: "🤱", color: "#9D174D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women & Child Dev. Dept.", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Mathru Poorna Scheme",                                   hi: "मातृ पूर्ण योजना" },
    benefit: { en: "Free nutritious meals for pregnant & lactating women via Anganwadi", hi: "आंगनवाड़ी के जरिए गर्भवती व स्तनपान कराने वाली महिलाओं को मुफ्त पोषण" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "Nearest Anganwadi Centre", hi: "नज़दीकी आंगनवाड़ी केंद्र" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Pregnancy Certificate", "Ration Card"],
               hi: ["आधार कार्ड", "गर्भावस्था प्रमाण", "राशन कार्ड"] },
    match: (a) => a.state === "Karnataka" && a.who === "women",
  },

  // ── STUDENT / EDUCATION ───────────────────────────────────────────────────

  {
    id: "karnataka_vidyasiri",
    icon: "📚", color: "#7C3AED", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Welfare", hi: "कर्नाटक समाज कल्याण विभाग" },
    name:    { en: "Vidya Siri Scholarship",                              hi: "विद्या सिरी छात्रवृत्ति" },
    benefit: { en: "₹5,000–₹20,000/year for SC/ST/OBC students", hi: "SC/ST/OBC छात्रों को ₹5,000–₹20,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 15000,
    apply:   { en: "https://scholarships.karnataka.gov.in", hi: "scholarships.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Mark Sheets", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण", "आय प्रमाण", "मार्कशीट", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_postmatric_scholarship",
    icon: "🎓", color: "#5B21B6", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Backward Classes", hi: "कर्नाटक पिछड़ा वर्ग विभाग" },
    name:    { en: "Post-Matric Scholarship (KA)",                           hi: "पोस्ट-मैट्रिक छात्रवृत्ति (कर्नाटक)" },
    benefit: { en: "Full tuition fee + ₹1,200–₹2,500/month maintenance allowance", hi: "पूरी फीस + ₹1,200–₹2,500/माह रखरखाव भत्ता" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 30000,
    apply:   { en: "https://scholarships.karnataka.gov.in", hi: "scholarships.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate", "Income Certificate (< ₹2.5L)", "Mark Sheets", "College Admission Proof", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण", "आय प्रमाण (< ₹2.5 लाख)", "मार्कशीट", "कॉलेज प्रवेश प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_sanchi_hosahalli",
    icon: "🖥️", color: "#1E40AF", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Education", hi: "कर्नाटक शिक्षा विभाग" },
    name:    { en: "Sanchi Hosahalli (Free Laptop Scheme)",        hi: "संची होसाहल्ली (मुफ्त लैपटॉप योजना)" },
    benefit: { en: "Free laptop for meritorious students of Class 12 from Govt. schools", hi: "सरकारी स्कूलों के कक्षा 12 के मेधावी छात्रों को मुफ्त लैपटॉप" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "https://schooleducation.kar.nic.in", hi: "schooleducation.kar.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Class 12 Marks Card", "Govt. School Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "कक्षा 12 मार्कशीट", "सरकारी स्कूल प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── SENIOR CITIZENS ───────────────────────────────────────────────────────

  {
    id: "karnataka_sandhya_suraksha",
    icon: "👴", color: "#D97706", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Security", hi: "कर्नाटक सामाजिक सुरक्षा विभाग" },
    name:    { en: "Sandhya Suraksha Yojana",                              hi: "संध्या सुरक्षा योजना" },
    benefit: { en: "₹1,000/month pension for BPL senior citizens (60+)",  hi: "BPL वरिष्ठ नागरिकों (60+) को ₹1,000/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 12000,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "BPL Ration Card", "Bank Account", "Domicile Certificate (15 yrs)"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "BPL राशन कार्ड", "बैंक खाता", "15 वर्ष का अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_disability_pension",
    icon: "♿", color: "#92400E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Disabled Welfare", hi: "कर्नाटक दिव्यांग कल्याण विभाग" },
    name:    { en: "Disability Pension Scheme (KA)",               hi: "विकलांगता पेंशन योजना (कर्नाटक)" },
    benefit: { en: "₹1,000/month for persons with 40%+ disability", hi: "40%+ विकलांगता वाले व्यक्तियों को ₹1,000/माह" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 12000,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "BPL Card", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+)", "BPL कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "karnataka_ashraya",
    icon: "🏠", color: "#B45309", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Housing Board / Rajiv Gandhi Rural Housing Corp.", hi: "कर्नाटक हाउसिंग बोर्ड / राजीव गांधी ग्रामीण आवास निगम" },
    name:    { en: "Ashraya Housing Scheme",                                  hi: "आश्रय आवास योजना" },
    benefit: { en: "₹1.75 Lakh grant for house construction for BPL rural families", hi: "BPL ग्रामीण परिवारों को मकान निर्माण हेतु ₹1.75 लाख अनुदान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 175000,
    apply:   { en: "https://rgjrhcl.karnataka.gov.in", hi: "rgjrhcl.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Land Ownership Document", "Bank Account", "Income Certificate"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "भूमि स्वामित्व दस्तावेज़", "बैंक खाता", "आय प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  {
    id: "karnataka_arogya_karnataka",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Health & Family Welfare Dept.", hi: "कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Arogya Karnataka (UASS)",                                      hi: "आरोग्य कर्नाटक (UASS)" },
    benefit: { en: "Free OPD, diagnostics & hospitalization up to ₹5 Lakh/year at Govt. hospitals", hi: "सरकारी अस्पतालों में OPD, जांच और ₹5 लाख/वर्ष तक मुफ्त अस्पताल उपचार" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "https://karunadu.karnataka.gov.in", hi: "karunadu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Income Certificate", "Domicile Proof"],
               hi: ["आधार कार्ड", "राशन कार्ड", "आय प्रमाण", "अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── BUSINESS / SKILL ──────────────────────────────────────────────────────

  {
    id: "karnataka_devaraj_urs_loan",
    icon: "💼", color: "#6D28D9", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka SC/ST Development Corp. (KSCDC)", hi: "कर्नाटक SC/ST विकास निगम (KSCDC)" },
    name:    { en: "Devaraj Urs Backward Classes Dev. Corp. Loan",      hi: "देवराज उर्स पिछड़ा वर्ग विकास निगम ऋण" },
    benefit: { en: "Loan ₹1–₹10 Lakh at 6% interest for SC/ST/OBC self-employment", hi: "SC/ST/OBC स्वरोजगार हेतु 6% ब्याज पर ₹1–₹10 लाख ऋण" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://dubckarnataka.org.in", hi: "dubckarnataka.org.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate", "Income Certificate (< ₹1.5L)", "Business Plan", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण", "आय प्रमाण (< ₹1.5 लाख)", "व्यापार योजना", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_skill_connect",
    icon: "🛠️", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Skill Development Corp. (KSDC)", hi: "कर्नाटक कौशल विकास निगम (KSDC)" },
    name:    { en: "Karnataka Skill Connect (Free Vocational Training)", hi: "कर्नाटक स्किल कनेक्ट (मुफ्त व्यावसायिक प्रशिक्षण)" },
    benefit: { en: "Free skill training (3–6 months) in IT, retail, healthcare & construction + placement support", hi: "IT, रिटेल, स्वास्थ्य और निर्माण में मुफ्त कौशल प्रशिक्षण (3–6 महीने) + नौकरी सहायता" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://kaushalkar.karnataka.gov.in", hi: "kaushalkar.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Qualification Proof", "Bank Account"],
               hi: ["आधार कार्ड", "शैक्षणिक योग्यता प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["18to35", "35to60"].includes(a.age) && ["below1", "1to3"].includes(a.income),
  },

  // ── FARMER (ADDITIONAL) ───────────────────────────────────────────────────

  {
    id: "karnataka_farmer_market_intervention",
    icon: "🏪", color: "#166534", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka State Agricultural Marketing Board", hi: "कर्नाटक राज्य कृषि विपणन बोर्ड" },
    name:    { en: "Raitha Samparka Kendra (RSK)",                       hi: "रैठा संपर्क केंद्र (RSK)" },
    benefit: { en: "Free soil testing, seeds & pesticides at subsidised rates via RSK centres", hi: "RSK केंद्रों पर मुफ्त मिट्टी परीक्षण और सब्सिडी दर पर बीज व कीटनाशक" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "Nearest RSK Centre / raitamitra.karnataka.gov.in", hi: "नज़दीकी RSK केंद्र / raitamitra.karnataka.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Farmer ID"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "किसान पहचान पत्र"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  {
    id: "karnataka_sericulture",
    icon: "🪲", color: "#4D7C0F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Sericulture", hi: "कर्नाटक रेशम उद्योग विभाग" },
    name:    { en: "Sericulture Development Scheme (KA)",                       hi: "रेशम उद्योग विकास योजना (कर्नाटक)" },
    benefit: { en: "Subsidy on mulberry cultivation, silkworm rearing & reeling equipment up to ₹50,000", hi: "शहतूत की खेती, रेशमकीट पालन और रीलिंग उपकरण पर ₹50,000 तक सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://seridept.karnataka.gov.in", hi: "seridept.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Bank Account", "Photo"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बैंक खाता", "फोटो"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "karnataka_horticulture_subsidy",
    icon: "🌿", color: "#365314", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Horticulture", hi: "कर्नाटक बागवानी विभाग" },
    name:    { en: "National Horticulture Mission (KA)",                hi: "राष्ट्रीय बागवानी मिशन (कर्नाटक)" },
    benefit: { en: "50%–75% subsidy on fruit/vegetable cultivation, greenhouses & micro-irrigation", hi: "फल/सब्जी की खेती, ग्रीनहाउस और माइक्रो-सिंचाई पर 50%–75% सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://horticulture.karnataka.gov.in", hi: "horticulture.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Bank Account", "Project Plan"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बैंक खाता", "परियोजना योजना"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  // ── WOMEN (ADDITIONAL) ───────────────────────────────────────────────────

  {
    id: "karnataka_widow_pension",
    icon: "🕊️", color: "#9F1239", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Women & Child Development", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Widow Pension Scheme (KA)",                    hi: "विधवा पेंशन योजना (कर्नाटक)" },
    benefit: { en: "₹1,000/month pension for BPL widows (18–64 yrs)", hi: "BPL विधवाओं (18–64 वर्ष) को ₹1,000/माह पेंशन" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 12000,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "BPL Ration Card", "Bank Account", "Domicile Certificate"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण", "BPL राशन कार्ड", "बैंक खाता", "अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_stree_shakti",
    icon: "💪", color: "#BE185D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Women & Child Development", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Stree Shakti Self-Help Group Programme",              hi: "स्त्री शक्ति स्वयं सहायता समूह कार्यक्रम" },
    benefit: { en: "Low-interest loans up to ₹2 Lakh + training & market linkage for women SHGs", hi: "महिला SHG को ₹2 लाख तक कम ब्याज ऋण + प्रशिक्षण और बाज़ार संपर्क" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "SHG Registration Certificate", "Bank Account (SHG)", "Group Meeting Records"],
               hi: ["आधार कार्ड", "SHG पंजीकरण प्रमाण", "SHG बैंक खाता", "समूह बैठक रिकॉर्ड"] },
    match: (a) => a.state === "Karnataka" && a.who === "women",
  },

  {
    id: "karnataka_indira_canteen",
    icon: "🍱", color: "#C2410C", scope: "state", state: "Karnataka",
    ministry: { en: "Bruhat Bengaluru Mahanagara Palike (BBMP)", hi: "बृहत बेंगलुरु महानगर पालिके (BBMP)" },
    name:    { en: "Indira Canteen Scheme",                             hi: "इंदिरा कैंटीन योजना" },
    benefit: { en: "Breakfast at ₹5 & meals at ₹10 for urban low-income workers", hi: "शहरी कम-आय कामगारों को ₹5 में नाश्ता और ₹10 में भोजन" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Nearest Indira Canteen (no registration needed)", hi: "नज़दीकी इंदिरा कैंटीन (पंजीकरण जरूरी नहीं)" }, applyType: "offline",
    docs:    { en: ["No documents required"],
               hi: ["कोई दस्तावेज़ जरूरी नहीं"] },
    match: (a) => a.state === "Karnataka" && a.area === "urban",
  },

  // ── STUDENT / EDUCATION (ADDITIONAL) ─────────────────────────────────────

  {
    id: "karnataka_morarji_desai",
    icon: "🏫", color: "#6D28D9", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Welfare", hi: "कर्नाटक समाज कल्याण विभाग" },
    name:    { en: "Morarji Desai Residential Schools",                   hi: "मोरारजी देसाई आवासीय विद्यालय" },
    benefit: { en: "Free residential schooling (Class 5–12) with meals, uniform & books for SC/ST/OBC students", hi: "SC/ST/OBC छात्रों के लिए मुफ्त आवासीय स्कूली शिक्षा (कक्षा 5–12) + भोजन, वर्दी और किताबें" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "https://schooleducation.kar.nic.in", hi: "schooleducation.kar.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Previous Class Mark Sheet"],
               hi: ["आधार कार्ड", "जाति प्रमाण", "आय प्रमाण", "पिछली कक्षा की मार्कशीट"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "karnataka_rajiv_gandhi_loan",
    icon: "🏦", color: "#1D4ED8", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka SC/ST Development Corp. (KSCDC)", hi: "कर्नाटक SC/ST विकास निगम (KSCDC)" },
    name:    { en: "Rajiv Gandhi Education Loan (KA)",                       hi: "राजीव गांधी शिक्षा ऋण (कर्नाटक)" },
    benefit: { en: "Education loan up to ₹5 Lakh at 4% interest for SC/ST students pursuing higher education", hi: "उच्च शिक्षा हेतु SC/ST छात्रों को 4% ब्याज पर ₹5 लाख तक शिक्षा ऋण" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "https://kscdc.net", hi: "kscdc.net" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate", "College Admission Letter", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण", "कॉलेज प्रवेश पत्र", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── HEALTH (ADDITIONAL) ───────────────────────────────────────────────────

  {
    id: "karnataka_yashasvini",
    icon: "💉", color: "#0F766E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Cooperation", hi: "कर्नाटक सहकारिता विभाग" },
    name:    { en: "Yashasvini Health Insurance Scheme",                           hi: "यशस्विनी स्वास्थ्य बीमा योजना" },
    benefit: { en: "Cashless surgeries up to ₹2.5 Lakh/year for cooperative members & rural workers", hi: "सहकारी सदस्यों व ग्रामीण कामगारों को ₹2.5 लाख/वर्ष तक कैशलेस सर्जरी" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 250000,
    apply:   { en: "https://karnataka.gov.in/yashasvini", hi: "karnataka.gov.in/yashasvini" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Cooperative Membership Card", "Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "सहकारी सदस्यता कार्ड", "राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "karnataka_jeevandayini",
    icon: "❤️", color: "#BE123C", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Health & Family Welfare Dept.", hi: "कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Jeevandayini — Critical Illness Assistance",                 hi: "जीवनदायिनी — गंभीर बीमारी सहायता" },
    benefit: { en: "Up to ₹1.5 Lakh financial aid for cancer, kidney failure, organ transplant & heart surgery", hi: "कैंसर, किडनी फेलियर, अंग प्रत्यारोपण और हृदय शल्य के लिए ₹1.5 लाख तक वित्तीय सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 150000,
    apply:   { en: "https://karunadu.karnataka.gov.in", hi: "karunadu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL Certificate", "Doctor's Diagnosis Report", "Hospital Estimate", "Bank Account"],
               hi: ["आधार कार्ड", "BPL प्रमाण", "डॉक्टर रिपोर्ट", "अस्पताल अनुमान", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── LABOUR / WORKERS ──────────────────────────────────────────────────────

  {
    id: "karnataka_unorganised_worker",
    icon: "👷", color: "#78350F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Building & Other Construction Workers Welfare Board", hi: "कर्नाटक भवन एवं अन्य निर्माण श्रमिक कल्याण बोर्ड" },
    name:    { en: "Construction Worker Welfare Scheme (BOCW-KA)",                hi: "निर्माण श्रमिक कल्याण योजना (BOCW-KA)" },
    benefit: { en: "Accident cover ₹2L, maternity ₹5,000, education aid ₹3K–₹20K, funeral ₹5,000 for registered workers", hi: "पंजीकृत मज़दूरों को दुर्घटना बीमा ₹2L, प्रसव सहायता ₹5,000, शिक्षा सहायता ₹3K–₹20K, अंत्येष्टि ₹5,000" },
    tag:     { en: "Labour", hi: "श्रमिक" },
    annual: 0,
    apply:   { en: "https://labour.karnataka.gov.in", hi: "labour.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BOCW Registration Card", "Work Proof (employer letter)", "Bank Account"],
               hi: ["आधार कार्ड", "BOCW पंजीकरण कार्ड", "कार्य प्रमाण (नियोक्ता पत्र)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  {
    id: "karnataka_beedi_worker",
    icon: "🏭", color: "#92400E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Labour Dept. / Ministry of Labour (Central)", hi: "कर्नाटक श्रम विभाग / केंद्रीय श्रम मंत्रालय" },
    name:    { en: "Beedi Workers Welfare Scheme (KA)",                        hi: "बीड़ी श्रमिक कल्याण योजना (कर्नाटक)" },
    benefit: { en: "Free healthcare, housing loan ₹50,000, scholarship for children & group insurance for beedi workers", hi: "मुफ्त स्वास्थ्य, ₹50,000 आवास ऋण, बच्चों की छात्रवृत्ति और बीड़ी मज़दूरों का समूह बीमा" },
    tag:     { en: "Labour", hi: "श्रमिक" },
    annual: 0,
    apply:   { en: "labour.gov.in/beedi", hi: "labour.gov.in/beedi" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Beedi Worker Identity Card", "Employer Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "बीड़ी श्रमिक पहचान पत्र", "नियोक्ता प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── SC / ST WELFARE ───────────────────────────────────────────────────────

  {
    id: "karnataka_ambedkar_pre_matric",
    icon: "✏️", color: "#4338CA", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Welfare", hi: "कर्नाटक समाज कल्याण विभाग" },
    name:    { en: "Dr. Ambedkar Pre-Matric Scholarship (SC/ST)",              hi: "डॉ. अम्बेडकर प्री-मैट्रिक छात्रवृत्ति (SC/ST)" },
    benefit: { en: "₹700–₹1,000/month + free uniform & books for SC/ST students (Class 1–10)", hi: "SC/ST छात्रों (कक्षा 1–10) को ₹700–₹1,000/माह + मुफ्त वर्दी और किताबें" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "https://scholarships.karnataka.gov.in", hi: "scholarships.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST)", "Income Certificate", "School Enrollment Proof"],
               hi: ["आधार कार्ड", "जाति प्रमाण (SC/ST)", "आय प्रमाण", "स्कूल नामांकन प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_sc_corporation_housing",
    icon: "🏘️", color: "#1E3A5F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka SC/ST Development Corp. (KSCDC)", hi: "कर्नाटक SC/ST विकास निगम (KSCDC)" },
    name:    { en: "SC/ST Housing Loan Scheme (KSCDC)",                      hi: "SC/ST आवास ऋण योजना (KSCDC)" },
    benefit: { en: "Loan up to ₹5 Lakh at 5% interest for SC/ST families to construct/repair house", hi: "SC/ST परिवारों को मकान निर्माण/मरम्मत हेतु 5% ब्याज पर ₹5 लाख ऋण" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "https://kscdc.net", hi: "kscdc.net" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Caste Certificate (SC/ST)", "Income Certificate", "Land/Site Documents", "Bank Account"],
               hi: ["आधार कार्ड", "जाति प्रमाण (SC/ST)", "आय प्रमाण", "जमीन के कागज़", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income),
  },

  // ── YOUTH / UNEMPLOYMENT ──────────────────────────────────────────────────

  {
    id: "karnataka_yuva_nidhi",
    icon: "🎯", color: "#0C4A6E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Skill Development", hi: "कर्नाटक कौशल विकास विभाग" },
    name:    { en: "Yuva Nidhi Unemployment Allowance",                          hi: "युवा निधि बेरोजगारी भत्ता" },
    benefit: { en: "₹3,000/month (graduates) or ₹1,500/month (diploma holders) for up to 2 years while job searching", hi: "नौकरी खोजते समय ₹3,000/माह (स्नातक) या ₹1,500/माह (डिप्लोमा) 2 वर्ष तक" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 36000,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Degree/Diploma Certificate", "Unemployment Registration Proof", "Bank Account"],
               hi: ["आधार कार्ड", "डिग्री/डिप्लोमा प्रमाण", "बेरोजगार पंजीकरण प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.age === "18to35" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_udyogini",
    icon: "🏪", color: "#7C3AED", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women Development Corp. (KWDC)", hi: "कर्नाटक महिला विकास निगम (KWDC)" },
    name:    { en: "Udyogini — Women Entrepreneur Scheme",                          hi: "उद्योगिनी — महिला उद्यमी योजना" },
    benefit: { en: "Interest-free or subsidised loan ₹1–₹3 Lakh for women starting small businesses (income < ₹1.5L)", hi: "छोटे व्यवसाय शुरू करने वाली महिलाओं को ₹1–₹3 लाख ब्याज मुक्त/सब्सिडी ऋण (आय < ₹1.5L)" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://kwdc.karnataka.gov.in", hi: "kwdc.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (< ₹1.5L)", "Business Plan", "Caste Certificate (if applicable)", "Bank Account"],
               hi: ["आधार कार्ड", "आय प्रमाण (< ₹1.5 लाख)", "व्यापार योजना", "जाति प्रमाण (लागू होने पर)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ── GENERAL / FOOD SECURITY ───────────────────────────────────────────────

  {
    id: "karnataka_anna_bhagya",
    icon: "🌾", color: "#A16207", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Food, Civil Supplies & Consumer Affairs Dept.", hi: "कर्नाटक खाद्य, नागरिक आपूर्ति एवं उपभोक्ता मामले विभाग" },
    name:    { en: "Anna Bhagya Scheme",                                           hi: "अन्न भाग्य योजना" },
    benefit: { en: "10 kg rice/month free per BPL family member (in addition to NFSA entitlement)", hi: "BPL परिवार के प्रति सदस्य को NFSA के अतिरिक्त 10 किलो चावल/माह मुफ्त" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Nearest Ration Shop (no separate application needed)", hi: "नज़दीकी राशन दुकान (अलग आवेदन जरूरी नहीं)" }, applyType: "offline",
    docs:    { en: ["BPL Ration Card", "Aadhaar Card (linked to ration card)"],
               hi: ["BPL राशन कार्ड", "आधार कार्ड (राशन कार्ड से लिंक)"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_ksrtc_concession",
    icon: "🚌", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka State Road Transport Corporation (KSRTC)", hi: "कर्नाटक राज्य सड़क परिवहन निगम (KSRTC)" },
    name:    { en: "KSRTC Bus Pass Concession Scheme",                          hi: "KSRTC बस पास रियायत योजना" },
    benefit: { en: "Free or 50%–75% bus pass concession for students, senior citizens, disabled persons & freedom fighters", hi: "छात्रों, वरिष्ठ नागरिकों, दिव्यांगों और स्वतंत्रता सेनानियों को मुफ्त या 50%–75% बस पास रियायत" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Nearest KSRTC depot / ksrtc.in", hi: "नज़दीकी KSRTC डिपो / ksrtc.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Relevant Certificate (Student ID / Age Proof / Disability Certificate)"],
               hi: ["आधार कार्ड", "संबंधित प्रमाण (छात्र ID / आयु प्रमाण / विकलांगता प्रमाण)"] },
    match: (a) => a.state === "Karnataka",
  },

  {
    id: "karnataka_suvarna_arogya_suraksha",
    icon: "🛡️", color: "#0D9488", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Health & Family Welfare Dept.", hi: "कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Suvarna Arogya Suraksha Trust (SAST)",                          hi: "सुवर्ण आरोग्य सुरक्षा ट्रस्ट (SAST)" },
    benefit: { en: "Health insurance up to ₹5 Lakh/year for APL families not covered under Ayushman Bharat", hi: "आयुष्मान भारत से बाहर APL परिवारों को ₹5 लाख/वर्ष स्वास्थ्य बीमा" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "https://karunadu.karnataka.gov.in", hi: "karunadu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card (APL/non-BPL)", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "राशन कार्ड (APL/गैर-BPL)", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["1to3", "3to6"].includes(a.income),
  },

  // ── FISHERMEN ─────────────────────────────────────────────────────────────

  {
    id: "karnataka_matsya_bhagya",
    icon: "🐟", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Fisheries", hi: "कर्नाटक मत्स्य पालन विभाग" },
    name:    { en: "Matsya Bhagya Scheme",                                         hi: "मत्स्य भाग्य योजना" },
    benefit: { en: "Subsidy up to ₹50,000 on fishing boats, nets & equipment for marine & inland fishermen", hi: "समुद्री व अंतर्देशीय मछुआरों को नाव, जाल और उपकरण पर ₹50,000 तक सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://fisheries.karnataka.gov.in", hi: "fisheries.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Fisherman Identity Card", "Bank Account", "Photo"],
               hi: ["आधार कार्ड", "मछुआरा पहचान पत्र", "बैंक खाता", "फोटो"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_fishermen_accident",
    icon: "⛵", color: "#075985", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Fisheries", hi: "कर्नाटक मत्स्य पालन विभाग" },
    name:    { en: "Fishermen Group Accident Insurance (KA)",              hi: "मछुआरा समूह दुर्घटना बीमा (कर्नाटक)" },
    benefit: { en: "₹5 Lakh death/disability cover for marine fishermen during fishing season at just ₹10 premium", hi: "मछली मौसम में समुद्री मछुआरों को मात्र ₹10 प्रीमियम पर ₹5 लाख मृत्यु/विकलांगता बीमा" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "fisheries.karnataka.gov.in", hi: "fisheries.karnataka.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Fisherman Identity Card", "Boat Registration Certificate"],
               hi: ["आधार कार्ड", "मछुआरा पहचान पत्र", "नाव पंजीकरण प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── HANDLOOM / WEAVERS ────────────────────────────────────────────────────

  {
    id: "karnataka_handloom_weaver",
    icon: "🧵", color: "#9D174D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Handloom & Textiles Dept.", hi: "कर्नाटक हथकरघा एवं वस्त्र विभाग" },
    name:    { en: "Handloom Weaver Welfare & Credit Scheme",                     hi: "हथकरघा बुनकर कल्याण एवं ऋण योजना" },
    benefit: { en: "Subsidised yarn, free loom upgrades, health insurance ₹15,000 & ₹2 Lakh accidental death cover for weavers", hi: "बुनकरों को सब्सिडी पर धागा, मुफ्त करघा उन्नयन, ₹15,000 स्वास्थ्य बीमा और ₹2 लाख दुर्घटना मृत्यु बीमा" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://handloom.karnataka.gov.in", hi: "handloom.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Weaver Identity Card", "Cooperative Membership (if any)", "Bank Account"],
               hi: ["आधार कार्ड", "बुनकर पहचान पत्र", "सहकारी सदस्यता (यदि हो)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── TRIBAL / MINORITY WELFARE ─────────────────────────────────────────────

  {
    id: "karnataka_tribal_ashrama",
    icon: "🏕️", color: "#78350F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Tribal Welfare", hi: "कर्नाटक आदिवासी कल्याण विभाग" },
    name:    { en: "Tribal Ashrama Shale (Residential Schools for ST)",            hi: "आदिवासी आश्रम शाले (ST हेतु आवासीय विद्यालय)" },
    benefit: { en: "Free residential schooling (Class 1–12) with food, clothing & books for Scheduled Tribe students", hi: "अनुसूचित जनजाति के छात्रों को कक्षा 1–12 तक मुफ्त आवासीय शिक्षा + भोजन, वस्त्र और किताबें" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "https://tribals.karnataka.gov.in", hi: "tribals.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "ST Caste Certificate", "Income Certificate", "Previous Mark Sheet"],
               hi: ["आधार कार्ड", "ST जाति प्रमाण", "आय प्रमाण", "पिछली मार्कशीट"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "karnataka_minorities_scholarship",
    icon: "🕌", color: "#1E3A5F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Minorities", hi: "कर्नाटक अल्पसंख्यक विभाग" },
    name:    { en: "Pre & Post-Matric Scholarship for Minorities (KA)",           hi: "अल्पसंख्यकों के लिए प्री और पोस्ट-मैट्रिक छात्रवृत्ति (कर्नाटक)" },
    benefit: { en: "₹1,000–₹12,000/year for Muslim, Christian, Jain, Sikh, Buddhist, Parsi minority students", hi: "मुस्लिम, ईसाई, जैन, सिख, बौद्ध, पारसी अल्पसंख्यक छात्रों को ₹1,000–₹12,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "https://minorityeducation.karnataka.gov.in", hi: "minorityeducation.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Minority Community Certificate", "Income Certificate (< ₹2L)", "Mark Sheets", "Bank Account"],
               hi: ["आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण", "आय प्रमाण (< ₹2 लाख)", "मार्कशीट", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── MARRIAGE ASSISTANCE ───────────────────────────────────────────────────

  {
    id: "karnataka_shaadi_bhagya",
    icon: "💍", color: "#BE185D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Welfare", hi: "कर्नाटक समाज कल्याण विभाग" },
    name:    { en: "Shaadi Bhagya (Marriage Assistance Scheme)",           hi: "शादी भाग्य (विवाह सहायता योजना)" },
    benefit: { en: "₹50,000 grant for marriage of SC/ST/OBC & minority girls from BPL families", hi: "BPL परिवारों की SC/ST/OBC व अल्पसंख्यक बालिकाओं के विवाह पर ₹50,000 अनुदान" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "https://sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Caste Certificate", "Girl's Age Proof (18+)", "Marriage Invitation / Registration", "Bank Account"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "जाति प्रमाण", "बालिका आयु प्रमाण (18+)", "विवाह निमंत्रण / पंजीकरण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1", "1to3"].includes(a.income),
  },

  // ── SOLAR / ENERGY ────────────────────────────────────────────────────────

  {
    id: "karnataka_solar_pump",
    icon: "☀️", color: "#CA8A04", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Renewable Energy Dev. Ltd. (KREDL)", hi: "कर्नाटक नवीकरणीय ऊर्जा विकास लिमिटेड (KREDL)" },
    name:    { en: "PM Kusum Solar Pump Scheme (KA)",                              hi: "पीएम कुसुम सोलर पंप योजना (कर्नाटक)" },
    benefit: { en: "90% subsidy on solar water pumps (3–7.5 HP) for farmers — only 10% farmer contribution", hi: "किसानों को सोलर वाटर पंप (3–7.5 HP) पर 90% सब्सिडी — केवल 10% किसान का योगदान" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://kredl.kar.nic.in", hi: "kredl.kar.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Electricity Connection Proof (or absence of grid power)", "Bank Account"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बिजली कनेक्शन प्रमाण (या ग्रिड न होने का प्रमाण)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "karnataka_surya_raitha",
    icon: "🔆", color: "#D97706", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Energy / BESCOM", hi: "कर्नाटक ऊर्जा विभाग / BESCOM" },
    name:    { en: "Surya Raitha Solar Scheme",                                       hi: "सूर्य रैठा सोलर योजना" },
    benefit: { en: "Free rooftop solar panels for farmers — excess power sold back to BESCOM at ₹3.5/unit", hi: "किसानों को मुफ्त रूफटॉप सोलर पैनल — अतिरिक्त बिजली ₹3.5/यूनिट पर BESCOM को बेचें" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://bescom.org", hi: "bescom.org / kredl.kar.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Electricity Bill (existing connection)", "Bank Account"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बिजली बिल (मौजूदा कनेक्शन)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  // ── SPORTS / YOUTH ────────────────────────────────────────────────────────

  {
    id: "karnataka_sports_scholarship",
    icon: "🏅", color: "#0F766E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Youth Empowerment & Sports", hi: "कर्नाटक युवा सशक्तिकरण एवं खेल विभाग" },
    name:    { en: "Ekalavya Sports Scholarship (KA)",                          hi: "एकलव्य खेल छात्रवृत्ति (कर्नाटक)" },
    benefit: { en: "₹10,000–₹60,000/year + equipment & coaching support for athletes representing Karnataka at state/national level", hi: "राज्य/राष्ट्रीय स्तर पर कर्नाटक का प्रतिनिधित्व करने वाले एथलीटों को ₹10,000–₹60,000/वर्ष + उपकरण और कोचिंग" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 60000,
    apply:   { en: "https://yas.karnataka.gov.in", hi: "yas.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Sports Achievement Certificate", "School/College Enrollment Proof", "Coach Recommendation", "Bank Account"],
               hi: ["आधार कार्ड", "खेल उपलब्धि प्रमाण", "स्कूल/कॉलेज नामांकन प्रमाण", "कोच सिफारिश पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["18to35", "below18"].includes(a.age),
  },

  // ── SANITATION / HOUSING (ADDITIONAL) ─────────────────────────────────────

  {
    id: "karnataka_namma_maneyinda_namma_school",
    icon: "🚽", color: "#065F46", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Rural Development & Panchayat Raj", hi: "कर्नाटक ग्रामीण विकास एवं पंचायत राज विभाग" },
    name:    { en: "Swachha Bharat (Gramin) — KA Individual Toilet Scheme",       hi: "स्वच्छ भारत (ग्रामीण) — कर्नाटक व्यक्तिगत शौचालय योजना" },
    benefit: { en: "₹12,000 incentive for construction of individual household toilet in rural Karnataka", hi: "ग्रामीण कर्नाटक में व्यक्तिगत घरेलू शौचालय निर्माण पर ₹12,000 प्रोत्साहन" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 12000,
    apply:   { en: "sbm.gov.in / Gram Panchayat office", hi: "sbm.gov.in / ग्राम पंचायत कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Land/House Ownership Proof", "Bank Account", "No existing toilet proof"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "जमीन/मकान स्वामित्व प्रमाण", "बैंक खाता", "शौचालय न होने का प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "karnataka_rajiv_gandhi_svagriha",
    icon: "🏡", color: "#1E40AF", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Housing Board (KHB)", hi: "कर्नाटक हाउसिंग बोर्ड (KHB)" },
    name:    { en: "Rajiv Gandhi Svagriha Housing Scheme",                         hi: "राजीव गांधी स्वगृह आवास योजना" },
    benefit: { en: "Affordable housing sites & apartments for EWS/LIG income groups in urban Karnataka", hi: "शहरी कर्नाटक में EWS/LIG आय वर्ग के लिए किफायती आवास प्लॉट और अपार्टमेंट" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "https://khb.gov.in", hi: "khb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Certificate (EWS/LIG)", "No Property Ownership Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "आय प्रमाण (EWS/LIG)", "संपत्ति न होने का प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── AUTO / TAXI DRIVERS ───────────────────────────────────────────────────

  {
    id: "karnataka_auto_driver_welfare",
    icon: "🛺", color: "#B45309", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Labour Dept.", hi: "कर्नाटक श्रम विभाग" },
    name:    { en: "Auto & Taxi Driver Welfare Scheme (KA)",                     hi: "ऑटो व टैक्सी चालक कल्याण योजना (कर्नाटक)" },
    benefit: { en: "Accident insurance ₹2 Lakh, hospitalisation ₹25,000/year & children's scholarship ₹5,000 for registered auto/taxi drivers", hi: "पंजीकृत ऑटो/टैक्सी चालकों को ₹2 लाख दुर्घटना बीमा, ₹25,000/वर्ष अस्पताल भत्ता और बच्चों को ₹5,000 छात्रवृत्ति" },
    tag:     { en: "Labour", hi: "श्रमिक" },
    annual: 0,
    apply:   { en: "https://labour.karnataka.gov.in", hi: "labour.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Driving Licence", "Vehicle Registration Certificate", "Auto/Taxi Permit", "Bank Account"],
               hi: ["आधार कार्ड", "ड्राइविंग लाइसेंस", "वाहन पंजीकरण प्रमाण", "ऑटो/टैक्सी परमिट", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  // ── STREET VENDORS ────────────────────────────────────────────────────────

  {
    id: "karnataka_pm_svanidhi",
    icon: "🛒", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Urban Development Dept. / MoHUA", hi: "कर्नाटक शहरी विकास विभाग / MoHUA" },
    name:    { en: "PM SVANidhi Street Vendor Loan (KA)",                          hi: "पीएम स्वनिधि पथ विक्रेता ऋण (कर्नाटक)" },
    benefit: { en: "Collateral-free working capital loan ₹10,000 → ₹20,000 → ₹50,000 in 3 cycles + digital payment incentive ₹1,200/year", hi: "3 चरणों में ₹10,000 → ₹20,000 → ₹50,000 बिना गारंटी कार्यशील ऋण + ₹1,200/वर्ष डिजिटल भुगतान प्रोत्साहन" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 1200,
    apply:   { en: "https://pmsvanidhi.mohua.gov.in", hi: "pmsvanidhi.mohua.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Vendor Certificate / Letter of Recommendation (LoR) from ULB", "Bank Account"],
               hi: ["आधार कार्ड", "विक्रेता प्रमाण / ULB से सिफारिश पत्र (LoR)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── ARTISANS / POTTERY ────────────────────────────────────────────────────

  {
    id: "karnataka_pm_vishwakarma",
    icon: "🪄", color: "#7C3AED", scope: "state", state: "Karnataka",
    ministry: { en: "Ministry of MSME (implemented via Karnataka MSME Dept.)", hi: "MSME मंत्रालय (कर्नाटक MSME विभाग के माध्यम से)" },
    name:    { en: "PM Vishwakarma Scheme (KA)",                                   hi: "पीएम विश्वकर्मा योजना (कर्नाटक)" },
    benefit: { en: "₹15,000 toolkit grant + loan ₹1–₹2 Lakh at 5% interest + free skill training for 18 traditional crafts (blacksmith, potter, carpenter, tailor etc.)", hi: "₹15,000 टूलकिट अनुदान + 5% ब्याज पर ₹1–₹2 लाख ऋण + 18 पारंपरिक शिल्पों (लोहार, कुम्हार, बढ़ई, दर्जी आदि) हेतु मुफ्त प्रशिक्षण" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://pmvishwakarma.gov.in", hi: "pmvishwakarma.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Trade/Craft Proof", "Bank Account", "Mobile Number linked to Aadhaar"],
               hi: ["आधार कार्ड", "व्यापार/शिल्प प्रमाण", "बैंक खाता", "आधार से जुड़ा मोबाइल नंबर"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && ["below1", "1to3"].includes(a.income),
  },

  // ── DRINKING WATER / RURAL INFRA ──────────────────────────────────────────

  {
    id: "karnataka_jal_jeevan",
    icon: "🚰", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Rural Development & Panchayat Raj (RDPR)", hi: "कर्नाटक ग्रामीण विकास एवं पंचायत राज विभाग (RDPR)" },
    name:    { en: "Jal Jeevan Mission — Har Ghar Jal (KA)",                       hi: "जल जीवन मिशन — हर घर जल (कर्नाटक)" },
    benefit: { en: "Free piped drinking water connection (55 litres/person/day) to every rural household", hi: "हर ग्रामीण घर को मुफ्त नल जल कनेक्शन (55 लीटर/व्यक्ति/दिन)" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Gram Panchayat office / jaljeevanmission.gov.in", hi: "ग्राम पंचायत कार्यालय / jaljeevanmission.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Ration Card", "House Ownership Proof"],
               hi: ["आधार कार्ड", "राशन कार्ड", "मकान स्वामित्व प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.area === "rural",
  },

  // ── LEGAL AID ─────────────────────────────────────────────────────────────

  {
    id: "karnataka_legal_aid",
    icon: "⚖️", color: "#1E3A5F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka State Legal Services Authority (KSLSA)", hi: "कर्नाटक राज्य विधिक सेवा प्राधिकरण (KSLSA)" },
    name:    { en: "Free Legal Aid Scheme (KSLSA)",                                hi: "मुफ्त कानूनी सहायता योजना (KSLSA)" },
    benefit: { en: "Free legal representation, advice & Lok Adalat services for SC/ST, women, children, disabled, BPL & accident victims", hi: "SC/ST, महिलाओं, बच्चों, दिव्यांगों, BPL और दुर्घटना पीड़ितों को मुफ्त कानूनी प्रतिनिधित्व, सलाह और लोक अदालत सेवा" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "kslsa.in / Nearest District Legal Services Authority", hi: "kslsa.in / नज़दीकी जिला विधिक सेवा प्राधिकरण" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Income Certificate (BPL or < ₹1L)", "Case/Problem Details"],
               hi: ["आधार कार्ड", "आय प्रमाण (BPL या < ₹1 लाख)", "मामले का विवरण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── DIFFERENTLY ABLED ─────────────────────────────────────────────────────

  {
    id: "karnataka_divyangjan_scholarship",
    icon: "♿", color: "#6D28D9", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Disabled Welfare", hi: "कर्नाटक दिव्यांग कल्याण विभाग" },
    name:    { en: "Divyangjan Education Scholarship (KA)",                    hi: "दिव्यांगजन शिक्षा छात्रवृत्ति (कर्नाटक)" },
    benefit: { en: "₹5,000–₹20,000/year + free assistive devices for students with 40%+ disability", hi: "40%+ विकलांगता वाले छात्रों को ₹5,000–₹20,000/वर्ष + मुफ्त सहायक उपकरण" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 20000,
    apply:   { en: "sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "School/College Enrollment Proof", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+)", "स्कूल/कॉलेज नामांकन प्रमाण", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student",
  },

  {
    id: "karnataka_divyangjan_self_employment",
    icon: "🦾", color: "#5B21B6", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Disabled Welfare", hi: "कर्नाटक दिव्यांग कल्याण विभाग" },
    name:    { en: "Divyangjan Self-Employment Loan (KA)",                     hi: "दिव्यांगजन स्वरोजगार ऋण (कर्नाटक)" },
    benefit: { en: "Loan up to ₹5 Lakh at 4% interest + ₹25,000 margin money grant for persons with 40%+ disability to start business", hi: "40%+ विकलांगता वाले व्यक्तियों को व्यवसाय हेतु 4% ब्याज पर ₹5 लाख ऋण + ₹25,000 मार्जिन मनी अनुदान" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+)", "Business Plan", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "विकलांगता प्रमाण पत्र (40%+)", "व्यापार योजना", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && ["below1", "1to3"].includes(a.income),
  },

  // ── CHILD WELFARE ─────────────────────────────────────────────────────────

  {
    id: "karnataka_child_labour_rehabilitation",
    icon: "🧒", color: "#BE123C", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Labour", hi: "कर्नाटक श्रम विभाग" },
    name:    { en: "Child Labour Rehabilitation & Welfare Fund (KA)",               hi: "बाल श्रम पुनर्वास एवं कल्याण कोष (कर्नाटक)" },
    benefit: { en: "₹3,000/month support + free bridge education & vocational training for rescued child labourers (9–14 yrs)", hi: "बचाए गए बाल मज़दूरों (9–14 वर्ष) को ₹3,000/माह सहायता + मुफ्त पुल शिक्षा और व्यावसायिक प्रशिक्षण" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 36000,
    apply:   { en: "labour.karnataka.gov.in", hi: "labour.karnataka.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card (child)", "Parent/Guardian Aadhaar", "Rescue Certificate from Labour Dept.", "Bank Account (guardian)"],
               hi: ["आधार कार्ड (बच्चा)", "माता-पिता/अभिभावक आधार", "श्रम विभाग का बचाव प्रमाण", "बैंक खाता (अभिभावक)"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── EX-SERVICEMEN ─────────────────────────────────────────────────────────

  {
    id: "karnataka_sainik_welfare",
    icon: "🎖️", color: "#1E3A5F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Rajya Sainik Board", hi: "कर्नाटक राज्य सैनिक बोर्ड" },
    name:    { en: "Ex-Servicemen Welfare Scheme (KA)",                           hi: "भूतपूर्व सैनिक कल्याण योजना (कर्नाटक)" },
    benefit: { en: "Priority land allotment, ₹1,000/month financial assistance, children's scholarship & free Rajya Sainik Board canteen access", hi: "प्राथमिकता भूमि आवंटन, ₹1,000/माह वित्तीय सहायता, बच्चों की छात्रवृत्ति और मुफ्त राज्य सैनिक बोर्ड कैंटीन सुविधा" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 12000,
    apply:   { en: "sainikwelfare.karnataka.gov.in", hi: "sainikwelfare.karnataka.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Discharge Certificate (Army/Navy/Air Force)", "Service Records", "Bank Account"],
               hi: ["आधार कार्ड", "डिस्चार्ज प्रमाण पत्र (थल/नौ/वायु सेना)", "सेवा रिकॉर्ड", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["35to60", "above60"].includes(a.age),
  },

  // ── ELECTRICITY / UTILITY ─────────────────────────────────────────────────

  {
    id: "karnataka_bhagya_jyoti",
    icon: "💡", color: "#CA8A04", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Energy / BESCOM-MESCOM-HESCOM", hi: "कर्नाटक ऊर्जा विभाग / BESCOM-MESCOM-HESCOM" },
    name:    { en: "Bhagya Jyoti / Kutira Jyoti Free Electricity Scheme",         hi: "भाग्य ज्योति / कुटीर ज्योति मुफ्त बिजली योजना" },
    benefit: { en: "First 30 units/month free electricity for BPL households consuming under 100 units/month", hi: "100 यूनिट/माह से कम खपत वाले BPL परिवारों को पहले 30 यूनिट/माह मुफ्त बिजली" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Nearest BESCOM/MESCOM/HESCOM office", hi: "नज़दीकी BESCOM/MESCOM/HESCOM कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Electricity Consumer Number"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "बिजली उपभोक्ता नंबर"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── ORGANIC FARMING ───────────────────────────────────────────────────────

  {
    id: "karnataka_organic_farming",
    icon: "🌱", color: "#15803D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Agriculture", hi: "कर्नाटक कृषि विभाग" },
    name:    { en: "Paramparagat Krishi Vikas Yojana — KA (Organic Farming)",      hi: "परंपरागत कृषि विकास योजना — KA (जैविक खेती)" },
    benefit: { en: "₹50,000/hectare over 3 years for conversion to organic farming + certification support & market linkage", hi: "3 वर्षों में ₹50,000/हेक्टेयर जैविक खेती रूपांतरण + प्रमाणीकरण सहायता और बाज़ार संपर्क" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "raitamitra.karnataka.gov.in", hi: "raitamitra.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Farmer Group/Cluster Registration", "Bank Account"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "किसान समूह/क्लस्टर पंजीकरण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "karnataka_micro_irrigation",
    icon: "💦", color: "#0284C7", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Agriculture / PMKSY", hi: "कर्नाटक कृषि विभाग / PMKSY" },
    name:    { en: "Pradhan Mantri Krishi Sinchayee Yojana — KA (Drip & Sprinkler)", hi: "प्रधानमंत्री कृषि सिंचाई योजना — KA (ड्रिप व स्प्रिंकलर)" },
    benefit: { en: "55%–75% subsidy on drip & sprinkler irrigation systems for small & marginal farmers", hi: "छोटे व सीमांत किसानों को ड्रिप व स्प्रिंकलर सिंचाई प्रणाली पर 55%–75% सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "raitamitra.karnataka.gov.in", hi: "raitamitra.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC, < 2 ha for max subsidy)", "Bank Account", "Quotation from approved vendor"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC, अधिकतम सब्सिडी हेतु < 2 हेक्टेयर)", "बैंक खाता", "अनुमोदित विक्रेता का कोटेशन"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  // ── DOMESTIC WORKERS ──────────────────────────────────────────────────────

  {
    id: "karnataka_domestic_worker_welfare",
    icon: "🧹", color: "#92400E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Labour Dept.", hi: "कर्नाटक श्रम विभाग" },
    name:    { en: "Domestic Worker Welfare Scheme (KA)",                          hi: "घरेलू कामगार कल्याण योजना (कर्नाटक)" },
    benefit: { en: "Accident insurance ₹1 Lakh, maternity benefit ₹5,000, hospitalisation ₹10,000 & children's scholarship for registered domestic workers", hi: "पंजीकृत घरेलू कामगारों को ₹1 लाख दुर्घटना बीमा, ₹5,000 प्रसव लाभ, ₹10,000 अस्पताल भत्ता और बच्चों की छात्रवृत्ति" },
    tag:     { en: "Labour", hi: "श्रमिक" },
    annual: 0,
    apply:   { en: "labour.karnataka.gov.in", hi: "labour.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Employer Reference Letter", "Bank Account", "Photo"],
               hi: ["आधार कार्ड", "नियोक्ता संदर्भ पत्र", "बैंक खाता", "फोटो"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  // ── TRANSGENDER WELFARE ───────────────────────────────────────────────────

  {
    id: "karnataka_transgender_welfare",
    icon: "🏳️", color: "#7C3AED", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Welfare", hi: "कर्नाटक समाज कल्याण विभाग" },
    name:    { en: "Mythri Transgender Welfare Scheme (KA)",                       hi: "मित्री ट्रांसजेंडर कल्याण योजना (कर्नाटक)" },
    benefit: { en: "₹1,000/month financial assistance + free skill training, healthcare & legal identity support for transgender persons", hi: "ट्रांसजेंडर व्यक्तियों को ₹1,000/माह वित्तीय सहायता + मुफ्त कौशल प्रशिक्षण, स्वास्थ्य और कानूनी पहचान सहायता" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 12000,
    apply:   { en: "sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Transgender Identity Certificate", "Bank Account", "Domicile Certificate"],
               hi: ["आधार कार्ड", "ट्रांसजेंडर पहचान प्रमाण पत्र", "बैंक खाता", "अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── MENTAL HEALTH ─────────────────────────────────────────────────────────

  {
    id: "karnataka_nimhans_mental_health",
    icon: "🧠", color: "#6D28D9", scope: "state", state: "Karnataka",
    ministry: { en: "NIMHANS / Karnataka Health & Family Welfare Dept.", hi: "NIMHANS / कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "District Mental Health Programme (DMHP) — KA",                hi: "जिला मानसिक स्वास्थ्य कार्यक्रम (DMHP) — कर्नाटक" },
    benefit: { en: "Free outpatient psychiatric consultation, medicines & counselling at all district hospitals across Karnataka", hi: "कर्नाटक के सभी जिला अस्पतालों में मुफ्त मनोचिकित्सा परामर्श, दवाइयाँ और काउंसलिंग" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "Nearest Govt. District Hospital / nimhans.ac.in", hi: "नज़दीकी सरकारी जिला अस्पताल / nimhans.ac.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Referral Letter (optional)", "BPL Card (for free medicines)"],
               hi: ["आधार कार्ड", "रेफरल पत्र (वैकल्पिक)", "BPL कार्ड (मुफ्त दवाओं हेतु)"] },
    match: (a) => a.state === "Karnataka",
  },

  // ── PALLIATIVE CARE ───────────────────────────────────────────────────────

  {
    id: "karnataka_palliative_care",
    icon: "🏨", color: "#0F766E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Health & Family Welfare Dept.", hi: "कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Karnataka Palliative Care Policy & Home Care Support",         hi: "कर्नाटक उपशामक देखभाल नीति एवं होम केयर सहायता" },
    benefit: { en: "Free home-based palliative nursing, medicines & physiotherapy for terminally ill & bedridden BPL patients", hi: "गंभीर और शय्याग्रस्त BPL रोगियों को घर पर मुफ्त उपशामक नर्सिंग, दवाइयाँ और फिज़ियोथेरेपी" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "Nearest PHC / District Hospital Palliative Care Unit", hi: "नज़दीकी PHC / जिला अस्पताल उपशामक देखभाल इकाई" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Doctor's Diagnosis Certificate", "Address Proof"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "डॉक्टर निदान प्रमाण पत्र", "पता प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && ["above60", "35to60"].includes(a.age),
  },

  // ── RURAL ROADS / INFRASTRUCTURE ──────────────────────────────────────────

  {
    id: "karnataka_pmgsy_connectivity",
    icon: "🛣️", color: "#78350F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Rural Development & Panchayat Raj", hi: "कर्नाटक ग्रामीण विकास एवं पंचायत राज विभाग" },
    name:    { en: "PMGSY — Rural Road Connectivity Scheme (KA)",                  hi: "PMGSY — ग्रामीण सड़क संपर्क योजना (कर्नाटक)" },
    benefit: { en: "All-weather road connectivity to unconnected rural habitations (500+ population plains, 250+ hilly areas)", hi: "असंपर्कित ग्रामीण बस्तियों (500+ जनसंख्या मैदान, 250+ पहाड़ी क्षेत्र) को हर मौसम में सड़क संपर्क" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Apply via Gram Panchayat / RDPR Dept.", hi: "ग्राम पंचायत / RDPR विभाग के माध्यम से आवेदन करें" }, applyType: "offline",
    docs:    { en: ["Gram Panchayat Resolution", "Habitation Population Certificate", "Land Availability Certificate"],
               hi: ["ग्राम पंचायत प्रस्ताव", "बस्ती जनसंख्या प्रमाण", "भूमि उपलब्धता प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.area === "rural",
  },

  // ── INSURANCE / FINANCIAL SECURITY ────────────────────────────────────────

  {
    id: "karnataka_pmjjby",
    icon: "🛡️", color: "#1D4ED8", scope: "state", state: "Karnataka",
    ministry: { en: "Ministry of Finance (via Karnataka banks)", hi: "वित्त मंत्रालय (कर्नाटक बैंकों के माध्यम से)" },
    name:    { en: "PM Jeevan Jyoti Bima Yojana (PMJJBY) — KA",                  hi: "पीएम जीवन ज्योति बीमा योजना (PMJJBY) — कर्नाटक" },
    benefit: { en: "₹2 Lakh life insurance cover at just ₹436/year premium for 18–50 age group with savings bank account", hi: "18–50 आयु वर्ग के बचत खाता धारकों को मात्र ₹436/वर्ष प्रीमियम पर ₹2 लाख जीवन बीमा" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 200000,
    apply:   { en: "Any nationalised/private bank branch or net banking", hi: "किसी भी राष्ट्रीयकृत/निजी बैंक शाखा या नेट बैंकिंग" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account", "Consent & Declaration Form"],
               hi: ["आधार कार्ड", "बचत बैंक खाता", "सहमति एवं घोषणा पत्र"] },
    match: (a) => a.state === "Karnataka" && ["18to35", "35to60"].includes(a.age) && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_pmsby",
    icon: "🦺", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Ministry of Finance (via Karnataka banks)", hi: "वित्त मंत्रालय (कर्नाटक बैंकों के माध्यम से)" },
    name:    { en: "PM Suraksha Bima Yojana (PMSBY) — KA",                        hi: "पीएम सुरक्षा बीमा योजना (PMSBY) — कर्नाटक" },
    benefit: { en: "₹2 Lakh accidental death & full disability cover at just ₹20/year for 18–70 age group", hi: "18–70 आयु वर्ग के लिए मात्र ₹20/वर्ष में ₹2 लाख दुर्घटना मृत्यु एवं पूर्ण विकलांगता बीमा" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 200000,
    apply:   { en: "Any nationalised/private bank branch or net banking", hi: "किसी भी राष्ट्रीयकृत/निजी बैंक शाखा या नेट बैंकिंग" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account", "Consent Form"],
               hi: ["आधार कार्ड", "बचत बैंक खाता", "सहमति पत्र"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── NUTRITION / CHILD HEALTH ──────────────────────────────────────────────

  {
    id: "karnataka_poshan_abhiyaan",
    icon: "🥗", color: "#16A34A", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women & Child Dev. Dept. (POSHAN Abhiyaan)", hi: "कर्नाटक महिला एवं बाल विकास विभाग (पोषण अभियान)" },
    name:    { en: "POSHAN Abhiyaan — Nutrition Mission (KA)",                     hi: "पोषण अभियान — राष्ट्रीय पोषण मिशन (कर्नाटक)" },
    benefit: { en: "Supplementary nutrition, growth monitoring, Iron & Folic Acid tablets & deworming for children (0–6 yrs), pregnant & lactating women", hi: "बच्चों (0–6 वर्ष), गर्भवती व स्तनपान कराने वाली महिलाओं को पूरक पोषण, वृद्धि निगरानी, IFA गोलियाँ व डीवर्मिंग" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "Nearest Anganwadi Centre (no application needed)", hi: "नज़दीकी आंगनवाड़ी केंद्र (आवेदन जरूरी नहीं)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Child Birth Certificate (for children)", "Pregnancy Certificate (for mothers)"],
               hi: ["आधार कार्ड", "बच्चे का जन्म प्रमाण", "गर्भावस्था प्रमाण (माताओं के लिए)"] },
    match: (a) => a.state === "Karnataka" && (a.who === "women" || a.age === "below18"),
  },

  // ── STARTUP / INNOVATION ──────────────────────────────────────────────────

  {
    id: "karnataka_startup_policy",
    icon: "🚀", color: "#0C4A6E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Innovation & Technology Society (KITS) / Dept. of IT-BT", hi: "कर्नाटक इनोवेशन एवं टेक्नोलॉजी सोसायटी / IT-BT विभाग" },
    name:    { en: "Karnataka Startup Policy 2022 — Seed Fund & Incentives",       hi: "कर्नाटक स्टार्टअप नीति 2022 — सीड फंड और प्रोत्साहन" },
    benefit: { en: "Seed funding ₹20–₹50 Lakh, 5-year SGST reimbursement, free co-working space & mentorship for DPIIT-recognised Karnataka startups", hi: "DPIIT-मान्यता प्राप्त कर्नाटक स्टार्टअप को ₹20–₹50 लाख सीड फंड, 5 वर्ष SGST प्रतिपूर्ति, मुफ्त को-वर्किंग स्पेस और मेंटरशिप" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "startup.karnataka.gov.in", hi: "startup.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar/PAN of Founders", "DPIIT Startup Recognition Certificate", "Company Registration (MCA)", "Business Plan / Pitch Deck", "Bank Account"],
               hi: ["संस्थापकों का आधार/पैन", "DPIIT स्टार्टअप मान्यता प्रमाण", "कंपनी पंजीकरण (MCA)", "व्यापार योजना / पिच डेक", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && ["18to35", "35to60"].includes(a.age),
  },

  // ── MIGRANT WORKERS ───────────────────────────────────────────────────────

  {
    id: "karnataka_migrant_worker_helpline",
    icon: "🧳", color: "#B45309", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Labour Dept. / Pravasi Bharatiya Sahayata Kendra", hi: "कर्नाटक श्रम विभाग / प्रवासी भारतीय सहायता केंद्र" },
    name:    { en: "Inter-State Migrant Worker Welfare Scheme (KA)",               hi: "अंतरराज्यीय प्रवासी श्रमिक कल्याण योजना (कर्नाटक)" },
    benefit: { en: "Accident insurance ₹1 Lakh, repatriation assistance up to ₹10,000, free medical aid & helpline (1800-425-1000) for migrant workers in Karnataka", hi: "कर्नाटक में प्रवासी मज़दूरों को ₹1 लाख दुर्घटना बीमा, ₹10,000 तक वापसी सहायता, मुफ्त चिकित्सा और हेल्पलाइन (1800-425-1000)" },
    tag:     { en: "Labour", hi: "श्रमिक" },
    annual: 0,
    apply:   { en: "labour.karnataka.gov.in / Nearest Labour Office", hi: "labour.karnataka.gov.in / नज़दीकी श्रम कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Migration Certificate / Employer Contract", "Bank Account"],
               hi: ["आधार कार्ड", "प्रवास प्रमाण / नियोक्ता अनुबंध", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  // ── WASTE PICKERS / SAFAI KARAMCHARIS ─────────────────────────────────────

  {
    id: "karnataka_safai_karamchari",
    icon: "♻️", color: "#065F46", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Welfare / BBMP", hi: "कर्नाटक समाज कल्याण विभाग / BBMP" },
    name:    { en: "Safai Karamchari & Waste Picker Welfare Scheme (KA)",          hi: "सफाई कर्मचारी व कचरा बीनने वाले कल्याण योजना (कर्नाटक)" },
    benefit: { en: "₹1,000/month allowance, free PPE kits, health insurance ₹2 Lakh & children's scholarship for registered sanitation workers & waste pickers", hi: "पंजीकृत सफाई कर्मियों को ₹1,000/माह, मुफ्त PPE किट, ₹2 लाख स्वास्थ्य बीमा और बच्चों की छात्रवृत्ति" },
    tag:     { en: "Labour", hi: "श्रमिक" },
    annual: 12000,
    apply:   { en: "sevasindhu.karnataka.gov.in / Nearest ULB office", hi: "sevasindhu.karnataka.gov.in / नज़दीकी ULB कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Identity Card from ULB/Employer", "BPL Ration Card", "Bank Account"],
               hi: ["आधार कार्ड", "ULB/नियोक्ता का पहचान पत्र", "BPL राशन कार्ड", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── DAIRY / ANIMAL HUSBANDRY ──────────────────────────────────────────────

  {
    id: "karnataka_ksddp_dairy",
    icon: "🐄", color: "#78350F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Milk Federation (KMF) / Dept. of Animal Husbandry", hi: "कर्नाटक दुग्ध महासंघ (KMF) / पशुपालन विभाग" },
    name:    { en: "KMF Dairy Development Scheme — Nandini Milk Cooperative",      hi: "KMF डेयरी विकास योजना — नंदिनी दुग्ध सहकारी" },
    benefit: { en: "Subsidised cattle feed, free veterinary visits, milk procurement at guaranteed price & loan up to ₹1 Lakh for dairy farmers joining KMF cooperative", hi: "KMF सहकारी में शामिल डेयरी किसानों को सब्सिडी पर पशु चारा, मुफ्त पशु चिकित्सा, गारंटीड दूध खरीद और ₹1 लाख तक ऋण" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "kmfnandini.coop / Nearest KMF Cooperative Society", hi: "kmfnandini.coop / नज़दीकी KMF सहकारी समिति" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land / Cattle Ownership Proof", "Bank Account", "KMF Membership Form"],
               hi: ["आधार कार्ड", "जमीन / पशु स्वामित्व प्रमाण", "बैंक खाता", "KMF सदस्यता फॉर्म"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "karnataka_cold_storage_subsidy",
    icon: "🧊", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Horticulture / NHB", hi: "कर्नाटक बागवानी विभाग / NHB" },
    name:    { en: "Cold Storage & Pack House Subsidy Scheme (KA)",                hi: "शीत भंडारण और पैक हाउस सब्सिडी योजना (कर्नाटक)" },
    benefit: { en: "35%–50% capital subsidy (max ₹10 Lakh) for setting up cold storage, ripening chambers & pack houses for fruits & vegetables", hi: "फल व सब्जियों के लिए शीत भंडारण, पकान कक्ष और पैक हाउस स्थापना पर 35%–50% पूंजी सब्सिडी (अधिकतम ₹10 लाख)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "horticulture.karnataka.gov.in", hi: "horticulture.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land/Lease Documents", "Project Report", "Bank Loan Sanction Letter", "Bank Account"],
               hi: ["आधार कार्ड", "जमीन/पट्टा दस्तावेज़", "परियोजना रिपोर्ट", "बैंक ऋण स्वीकृति पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  // ── MID-DAY MEAL ─────────────────────────────────────────────────────────

  {
    id: "karnataka_midday_meal",
    icon: "🍛", color: "#CA8A04", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Public Instruction (DPI)", hi: "कर्नाटक लोक शिक्षण विभाग (DPI)" },
    name:    { en: "PM POSHAN (Mid-Day Meal) Scheme — KA",                         hi: "पीएम पोषण (मिड-डे मील) योजना — कर्नाटक" },
    benefit: { en: "Free hot cooked meal every school day for all students (Class 1–8) in govt. & aided schools, with eggs thrice a week", hi: "सरकारी व अनुदान प्राप्त स्कूलों में कक्षा 1–8 के सभी छात्रों को प्रत्येक स्कूल दिन मुफ्त पका हुआ भोजन, सप्ताह में तीन बार अंडे सहित" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "School enrollment is sufficient — no separate application", hi: "स्कूल नामांकन पर्याप्त है — अलग आवेदन जरूरी नहीं" }, applyType: "offline",
    docs:    { en: ["School Enrollment Proof", "Aadhaar Card (for Aadhaar-seeded attendance)"],
               hi: ["स्कूल नामांकन प्रमाण", "आधार कार्ड (उपस्थिति सीडिंग हेतु)"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && a.area !== "urban",
  },

  // ── DIGITAL LITERACY ─────────────────────────────────────────────────────

  {
    id: "karnataka_digital_literacy",
    icon: "💻", color: "#1D4ED8", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Electronics, IT, BT & Science & Technology", hi: "कर्नाटक इलेक्ट्रॉनिक्स, IT, BT एवं विज्ञान प्रौद्योगिकी विभाग" },
    name:    { en: "PM Gramin Digital Saksharta Abhiyan — KA (PMGDISHA)",          hi: "पीएम ग्रामीण डिजिटल साक्षरता अभियान — KA (PMGDISHA)" },
    benefit: { en: "Free 20-hour digital literacy training covering internet, UPI, e-govt services & cybersecurity for one member per rural household", hi: "ग्रामीण परिवार के एक सदस्य को इंटरनेट, UPI, ई-सरकारी सेवाओं और साइबर सुरक्षा पर 20 घंटे का मुफ्त डिजिटल प्रशिक्षण" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "https://pmgdisha.in", hi: "pmgdisha.in / नज़दीकी CSC (सामान्य सेवा केंद्र)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Mobile Number"],
               hi: ["आधार कार्ड", "मोबाइल नंबर"] },
    match: (a) => a.state === "Karnataka" && a.area === "rural" && ["below1", "1to3"].includes(a.income),
  },

  // ── PRISON / AFTER-RELEASE WELFARE ───────────────────────────────────────

  {
    id: "karnataka_prison_rehabilitation",
    icon: "🔓", color: "#374151", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Prisons & Correctional Services Dept.", hi: "कर्नाटक कारागार एवं सुधारात्मक सेवा विभाग" },
    name:    { en: "After-Release Rehabilitation Scheme (KA)",                     hi: "रिहाई के बाद पुनर्वास योजना (कर्नाटक)" },
    benefit: { en: "₹5,000 one-time release grant, skill training in prison, job placement assistance & priority in state welfare schemes for released prisoners", hi: "रिहा कैदियों को ₹5,000 एकमुश्त अनुदान, जेल में कौशल प्रशिक्षण, नौकरी सहायता और राज्य कल्याण योजनाओं में प्राथमिकता" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Karnataka Prisons Dept. / Nearest Probation Officer", hi: "कर्नाटक कारागार विभाग / नज़दीकी परिवीक्षा अधिकारी" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Release Order from Jail", "Bank Account"],
               hi: ["आधार कार्ड", "जेल से रिहाई आदेश", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── ACID ATTACK / CRIME VICTIMS ───────────────────────────────────────────

  {
    id: "karnataka_acid_attack_victim",
    icon: "🩹", color: "#BE123C", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Home Dept. / State Legal Services Authority", hi: "कर्नाटक गृह विभाग / राज्य विधिक सेवा प्राधिकरण" },
    name:    { en: "Acid Attack & Crime Victim Compensation Scheme (KA)",          hi: "एसिड हमला और अपराध पीड़ित मुआवजा योजना (कर्नाटक)" },
    benefit: { en: "Compensation ₹3 Lakh–₹8 Lakh for acid attack victims + free reconstructive surgery, legal aid & rehabilitation support", hi: "एसिड हमले पीड़ितों को ₹3 लाख–₹8 लाख मुआवजा + मुफ्त पुनर्निर्माण शल्य, कानूनी सहायता और पुनर्वास" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "Nearest DLSA (District Legal Services Authority) / Police Station", hi: "नज़दीकी DLSA (जिला विधिक सेवा प्राधिकरण) / पुलिस स्टेशन" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "FIR Copy", "Medical Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "FIR की प्रति", "चिकित्सा प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "women",
  },

  // ── SENIOR CITIZEN (ADDITIONAL) ───────────────────────────────────────────

  {
    id: "karnataka_senior_daycare",
    icon: "🏡", color: "#D97706", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Social Security & Pensions", hi: "कर्नाटक सामाजिक सुरक्षा एवं पेंशन विभाग" },
    name:    { en: "Vayoshreshtha Samman — Senior Citizen Day Care Centres (KA)",  hi: "वयोश्रेष्ठ सम्मान — वरिष्ठ नागरिक दिवस देखभाल केंद्र (कर्नाटक)" },
    benefit: { en: "Free day-care centres for BPL senior citizens with meals, recreation, physiotherapy & health checkups across districts", hi: "BPL वरिष्ठ नागरिकों के लिए भोजन, मनोरंजन, फिज़ियोथेरेपी और स्वास्थ्य जांच के साथ मुफ्त दिवस देखभाल केंद्र" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 0,
    apply:   { en: "Nearest Zilla Panchayat / Social Welfare Office", hi: "नज़दीकी ज़िला पंचायत / समाज कल्याण कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "BPL Ration Card", "Domicile Certificate"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "BPL राशन कार्ड", "अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  // ── TOURISM / RURAL LIVELIHOODS ───────────────────────────────────────────

  {
    id: "karnataka_rural_homestay",
    icon: "🌄", color: "#15803D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Tourism Dept. / KSTDC", hi: "कर्नाटक पर्यटन विभाग / KSTDC" },
    name:    { en: "Karnataka Rural Homestay Scheme",                              hi: "कर्नाटक ग्रामीण होमस्टे योजना" },
    benefit: { en: "Subsidy up to ₹5 Lakh & interest-free loan for setting up rural homestays + branding & listing support via KarnataKa Tourism portal", hi: "ग्रामीण होमस्टे स्थापना हेतु ₹5 लाख तक सब्सिडी व ब्याज मुक्त ऋण + कर्नाटक पर्यटन पोर्टल पर ब्रांडिंग एवं लिस्टिंग सहायता" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://karnatakatourism.org", hi: "karnatakatourism.org / नज़दीकी पर्यटन कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land/Property Ownership Proof", "Bank Account", "NOC from Gram Panchayat", "Project Plan"],
               hi: ["आधार कार्ड", "जमीन/संपत्ति स्वामित्व प्रमाण", "बैंक खाता", "ग्राम पंचायत NOC", "परियोजना योजना"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && a.area === "rural",
  },

  {
    id: "karnataka_msme_subsidy",
    icon: "🏗️", color: "#0C4A6E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of MSME", hi: "कर्नाटक MSME विभाग" },
    name:    { en: "Karnataka MSME Investment Promotion Scheme",                   hi: "कर्नाटक MSME निवेश संवर्धन योजना" },
    benefit: { en: "15%–25% capital investment subsidy (max ₹50 Lakh), 5-year power tariff subsidy & stamp duty exemption for new MSME units in Karnataka", hi: "कर्नाटक में नई MSME इकाइयों को 15%–25% पूंजी निवेश सब्सिडी (अधिकतम ₹50 लाख), 5 वर्ष बिजली शुल्क सब्सिडी और स्टाम्प ड्यूटी छूट" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "https://udyamimitra.in", hi: "udyamimitra.in / कर्नाटक उद्योग मित्र पोर्टल" }, applyType: "online",
    docs:    { en: ["Aadhaar/PAN", "Udyam Registration Certificate", "Project Report", "Land/Factory Documents", "Bank Account"],
               hi: ["आधार/पैन", "उद्यम पंजीकरण प्रमाण पत्र", "परियोजना रिपोर्ट", "जमीन/कारखाना दस्तावेज़", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "business" && ["18to35", "35to60"].includes(a.age),
  },

  // ── CLIMATE / DISASTER RELIEF ─────────────────────────────────────────────

  {
    id: "karnataka_natural_calamity_relief",
    icon: "🌊", color: "#1E3A5F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Revenue Dept. / SDRF", hi: "कर्नाटक राजस्व विभाग / SDRF" },
    name:    { en: "State Disaster Relief Fund (SDRF) Crop & House Loss Compensation — KA", hi: "राज्य आपदा राहत कोष (SDRF) फसल और मकान नुकसान मुआवजा — कर्नाटक" },
    benefit: { en: "Crop loss: ₹8,500–₹17,000/hectare; house fully damaged: ₹95,100; partially: ₹5,200; human life loss: ₹4 Lakh ex-gratia", hi: "फसल नुकसान: ₹8,500–₹17,000/हेक्टेयर; पूरा मकान क्षतिग्रस्त: ₹95,100; आंशिक: ₹5,200; मानव जीवन हानि: ₹4 लाख अनुग्रह राशि" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "Nearest Tahsildar / Revenue Office", hi: "नज़दीकी तहसीलदार / राजस्व कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC) / House Ownership Proof", "Damage Assessment Certificate from Revenue Dept.", "Bank Account"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC) / मकान स्वामित्व प्रमाण", "राजस्व विभाग का नुकसान आकलन प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_fasal_bima",
    icon: "🌧️", color: "#0369A1", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Agriculture Dept. / PMFBY", hi: "कर्नाटक कृषि विभाग / PMFBY" },
    name:    { en: "Pradhan Mantri Fasal Bima Yojana — KA (Crop Insurance)",       hi: "प्रधानमंत्री फसल बीमा योजना — KA (फसल बीमा)" },
    benefit: { en: "Crop insurance covering drought, flood, pest & disease; farmer premium just 1.5%–5% of sum insured; claim up to ₹50,000/hectare", hi: "सूखा, बाढ़, कीट और बीमारी से फसल बीमा; किसान प्रीमियम केवल 1.5%–5%; ₹50,000/हेक्टेयर तक दावा" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "https://pmfby.gov.in", hi: "pmfby.gov.in / नज़दीकी बैंक / CSC" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records (RTC)", "Bank Account", "Crop Sowing Certificate"],
               hi: ["आधार कार्ड", "जमीन के कागज़ (RTC)", "बैंक खाता", "फसल बुवाई प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  // ── OBC WELFARE ───────────────────────────────────────────────────────────

  {
    id: "karnataka_obc_prematric",
    icon: "📖", color: "#7C3AED", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Backward Classes Welfare", hi: "कर्नाटक पिछड़ा वर्ग कल्याण विभाग" },
    name:    { en: "Pre-Matric Scholarship for OBC Students (KA)",                 hi: "OBC छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति (कर्नाटक)" },
    benefit: { en: "₹600–₹1,000/month + free uniform, books & stationery for OBC students (Class 1–10) with family income below ₹1 Lakh", hi: "₹1 लाख से कम आय वाले OBC परिवारों के छात्रों (कक्षा 1–10) को ₹600–₹1,000/माह + मुफ्त वर्दी, किताबें और स्टेशनरी" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 12000,
    apply:   { en: "scholarships.karnataka.gov.in", hi: "scholarships.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "OBC Caste Certificate", "Income Certificate (< ₹1L)", "School Enrollment Proof", "Bank Account"],
               hi: ["आधार कार्ड", "OBC जाति प्रमाण", "आय प्रमाण (< ₹1 लाख)", "स्कूल नामांकन प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_obc_hostel",
    icon: "🏠", color: "#5B21B6", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Backward Classes Welfare", hi: "कर्नाटक पिछड़ा वर्ग कल्याण विभाग" },
    name:    { en: "OBC Boys & Girls Hostel Scheme (KA)",                          hi: "OBC बालक-बालिका छात्रावास योजना (कर्नाटक)" },
    benefit: { en: "Free residential hostel with meals, bedding & study room for OBC students studying away from home (Classes 5–Degree)", hi: "घर से दूर पढ़ने वाले OBC छात्रों को मुफ्त आवासीय छात्रावास, भोजन, बिस्तर और अध्ययन कक्ष (कक्षा 5–स्नातक)" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "backwardclasses.karnataka.gov.in", hi: "backwardclasses.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "OBC Caste Certificate", "Income Certificate", "School/College Admission Letter", "Bank Account"],
               hi: ["आधार कार्ड", "OBC जाति प्रमाण", "आय प्रमाण", "स्कूल/कॉलेज प्रवेश पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── SC/ST LAND RIGHTS ─────────────────────────────────────────────────────

  {
    id: "karnataka_land_grant_scst",
    icon: "📜", color: "#78350F", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Revenue Dept.", hi: "कर्नाटक राजस्व विभाग" },
    name:    { en: "SC/ST Free Land Grant Scheme (KA)",                            hi: "SC/ST मुफ्त भूमि अनुदान योजना (कर्नाटक)" },
    benefit: { en: "Free govt. land (up to 2 acres irrigated / 5 acres dry) allotted to landless SC/ST families for agriculture or house construction", hi: "भूमिहीन SC/ST परिवारों को कृषि या मकान निर्माण हेतु 2 एकड़ (सिंचित) / 5 एकड़ (असिंचित) मुफ्त सरकारी जमीन आवंटन" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "Nearest Tahsildar / Revenue Office", hi: "नज़दीकी तहसीलदार / राजस्व कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SC/ST Caste Certificate", "Income Certificate", "No Land Ownership Certificate", "Domicile Certificate"],
               hi: ["आधार कार्ड", "SC/ST जाति प्रमाण", "आय प्रमाण", "भूमिहीन प्रमाण पत्र", "अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income) && a.area === "rural",
  },

  // ── FOLK ARTISTS / CULTURE ────────────────────────────────────────────────

  {
    id: "karnataka_folk_artist_pension",
    icon: "🎭", color: "#BE185D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Kannada & Culture", hi: "कर्नाटक कन्नड़ और संस्कृति विभाग" },
    name:    { en: "Folk & Traditional Artist Pension Scheme (KA)",                hi: "लोक एवं पारंपरिक कलाकार पेंशन योजना (कर्नाटक)" },
    benefit: { en: "₹2,000/month pension for recognised folk artists (Yakshagana, Dollu Kunitha, Kamsale etc.) aged 60+ with low income", hi: "60+ आयु के कम आय वाले मान्यता प्राप्त लोक कलाकारों (यक्षगान, डोल्लु कुनिता, कमसाले आदि) को ₹2,000/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 24000,
    apply:   { en: "kannadakalasahitya.kar.nic.in / Nearest Dept. of Kannada & Culture office", hi: "kannadakalasahitya.kar.nic.in / नज़दीकी कन्नड़ एवं संस्कृति विभाग कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Artist Recognition Certificate", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "कलाकार मान्यता प्रमाण पत्र", "आय प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_kannada_book_grant",
    icon: "📚", color: "#9D174D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Sahitya Parishat / Dept. of Kannada & Culture", hi: "कर्नाटक साहित्य परिषत् / कन्नड़ एवं संस्कृति विभाग" },
    name:    { en: "Kannada Sahitya Parishat Book Grant & Author Support",         hi: "कन्नड़ साहित्य परिषत् पुस्तक अनुदान और लेखक सहायता" },
    benefit: { en: "Up to ₹25,000 publication grant for new Kannada literary works + ₹5,000 honorarium for selected authors from BPL background", hi: "नई कन्नड़ साहित्यिक रचनाओं को ₹25,000 तक प्रकाशन अनुदान + BPL पृष्ठभूमि के चयनित लेखकों को ₹5,000 मानदेय" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "ksp.karnataka.gov.in", hi: "ksp.karnataka.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Manuscript of the Book", "Author Bio", "Income Certificate (for BPL honorarium)", "Bank Account"],
               hi: ["आधार कार्ड", "पुस्तक की पांडुलिपि", "लेखक का परिचय", "आय प्रमाण (BPL मानदेय हेतु)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── FILM / MEDIA WORKERS ──────────────────────────────────────────────────

  {
    id: "karnataka_film_worker_welfare",
    icon: "🎬", color: "#374151", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Chalanachitra Academy / Dept. of Kannada & Culture", hi: "कर्नाटक चलनचित्र अकादमी / कन्नड़ एवं संस्कृति विभाग" },
    name:    { en: "Karnataka Film Worker Welfare Fund",                            hi: "कर्नाटक फिल्म कर्मचारी कल्याण कोष" },
    benefit: { en: "₹1,000/month pension for senior/retired Kannada film workers (60+), medical reimbursement ₹10,000/year & funeral aid ₹5,000", hi: "वरिष्ठ/सेवानिवृत्त कन्नड़ फिल्म कर्मचारियों (60+) को ₹1,000/माह पेंशन, ₹10,000/वर्ष चिकित्सा प्रतिपूर्ति और ₹5,000 अंत्येष्टि सहायता" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 12000,
    apply:   { en: "Karnataka Chalanachitra Academy Office, Bengaluru", hi: "कर्नाटक चलनचित्र अकादमी कार्यालय, बेंगलुरु" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Age Proof (60+)", "Film Industry Work Experience Proof", "Bank Account"],
               hi: ["आधार कार्ड", "आयु प्रमाण (60+)", "फिल्म उद्योग कार्य अनुभव प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  // ── HEALTH (ADDITIONAL) ───────────────────────────────────────────────────

  {
    id: "karnataka_thalassemia_sickle",
    icon: "🩸", color: "#BE123C", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Health & Family Welfare Dept.", hi: "कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Thalassemia & Sickle Cell Anaemia Control Programme (KA)",     hi: "थैलेसीमिया और सिकल सेल एनीमिया नियंत्रण कार्यक्रम (कर्नाटक)" },
    benefit: { en: "Free blood transfusion, iron chelation therapy, hydroxyurea & bone marrow transplant support for registered thalassemia/sickle cell patients", hi: "पंजीकृत थैलेसीमिया/सिकल सेल रोगियों को मुफ्त रक्त आधान, आयरन चिलेशन थेरेपी, हाइड्रॉक्सीयूरिया और अस्थि मज्जा प्रत्यारोपण सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "Nearest Govt. Medical College Hospital / karunadu.karnataka.gov.in", hi: "नज़दीकी सरकारी मेडिकल कॉलेज अस्पताल / karunadu.karnataka.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Disease Diagnosis Report", "BPL Card (for additional support)", "Bank Account"],
               hi: ["आधार कार्ड", "रोग निदान रिपोर्ट", "BPL कार्ड (अतिरिक्त सहायता हेतु)", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "karnataka_dialysis_scheme",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Health & Family Welfare Dept. / PMNDP", hi: "कर्नाटक स्वास्थ्य एवं परिवार कल्याण विभाग / PMNDP" },
    name:    { en: "Pradhan Mantri National Dialysis Programme — KA",              hi: "प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम — कर्नाटक" },
    benefit: { en: "Free haemodialysis sessions (up to 3 per week) at govt. hospitals for BPL patients with chronic kidney disease", hi: "चिरकालिक गुर्दा रोग वाले BPL रोगियों को सरकारी अस्पतालों में सप्ताह में 3 बार मुफ्त हीमोडायलिसिस" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 0,
    apply:   { en: "Nearest Govt. District / Taluk Hospital", hi: "नज़दीकी सरकारी जिला / तालुक अस्पताल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Nephrologist Prescription / Diagnosis Report", "Bank Account"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "नेफ्रोलॉजिस्ट पर्चा / निदान रिपोर्ट", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ── SELF-HELP GROUPS (RURAL WOMEN) ───────────────────────────────────────

  {
    id: "karnataka_sanjeevini_shg",
    icon: "🤝", color: "#16A34A", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Rural Development & Panchayat Raj (RDPR) / NRLM", hi: "कर्नाटक ग्रामीण विकास एवं पंचायत राज (RDPR) / NRLM" },
    name:    { en: "Sanjeevini — NRLM Women SHG Credit Linkage (KA)",              hi: "संजीवनी — NRLM महिला SHG ऋण संपर्क (कर्नाटक)" },
    benefit: { en: "Bank linkage loan ₹1–₹5 Lakh at 7% interest (with 4% govt. subvention = effective 3%) for active women SHGs + enterprise support", hi: "सक्रिय महिला SHG को 7% ब्याज (4% सरकारी सब्सिडी = प्रभावी 3%) पर ₹1–₹5 लाख बैंक संपर्क ऋण + उद्यम सहायता" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 0,
    apply:   { en: "aajeevika.gov.in / Nearest NRLM Block Mission Management Unit", hi: "aajeevika.gov.in / नज़दीकी NRLM ब्लॉक मिशन प्रबंधन इकाई" }, applyType: "offline",
    docs:    { en: ["SHG Registration Documents", "Group Bank Account Passbook", "Meeting Minutes & Ledger", "Members' Aadhaar Cards"],
               hi: ["SHG पंजीकरण दस्तावेज़", "समूह बैंक खाता पासबुक", "बैठक कार्यवृत्त और बही खाता", "सदस्यों के आधार कार्ड"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && a.area === "rural" && ["below1", "1to3"].includes(a.income),
  },

  // ── BOOK BANK / HIGHER EDUCATION ─────────────────────────────────────────

  {
    id: "karnataka_book_bank",
    icon: "📗", color: "#1D4ED8", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Dept. of Higher Education", hi: "कर्नाटक उच्च शिक्षा विभाग" },
    name:    { en: "Book Bank Scheme for SC/ST/OBC College Students (KA)",         hi: "SC/ST/OBC कॉलेज छात्रों के लिए बुक बैंक योजना (कर्नाटक)" },
    benefit: { en: "Free set of textbooks for one full academic year (returnable) for SC/ST/OBC college students from government colleges", hi: "सरकारी कॉलेजों के SC/ST/OBC छात्रों को एक पूरे शैक्षणिक वर्ष के लिए मुफ्त पाठ्यपुस्तक सेट (वापसी योग्य)" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 0,
    apply:   { en: "College Library / Dept. of Collegiate Education", hi: "कॉलेज पुस्तकालय / कॉलेजिएट शिक्षा विभाग" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Caste Certificate", "College Admission Proof", "Income Certificate"],
               hi: ["आधार कार्ड", "जाति प्रमाण", "कॉलेज प्रवेश प्रमाण", "आय प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── URBAN POOR / SLUM DEVELOPMENT ────────────────────────────────────────

  {
    id: "karnataka_urban_slum_upgrade",
    icon: "🏙️", color: "#0C4A6E", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Slum Development Board (KSDB)", hi: "कर्नाटक झुग्गी विकास बोर्ड (KSDB)" },
    name:    { en: "In-Situ Slum Upgradation Scheme — KA (KSDB)",                 hi: "इन-सीटू झुग्गी उन्नयन योजना — KA (KSDB)" },
    benefit: { en: "Free/subsidised pucca house construction for slum dwellers with legal tenure + basic amenities (water, sanitation, electricity)", hi: "कानूनी अधिकार वाले झुग्गी निवासियों को मुफ्त/सब्सिडी पर पक्का मकान निर्माण + बुनियादी सुविधाएं (पानी, स्वच्छता, बिजली)" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "ksdb.karnataka.gov.in / Nearest KSDB Office", hi: "ksdb.karnataka.gov.in / नज़दीकी KSDB कार्यालय" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL Ration Card", "Slum Tenancy/Voter ID (as address proof)", "No Property Ownership Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "BPL राशन कार्ड", "झुग्गी किरायेदारी / मतदाता पहचान (पते के प्रमाण हेतु)", "संपत्ति न होने का प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── RATION CARD / FOOD SECURITY ───────────────────────────────────────────

  {
    id: "karnataka_sakaala_ration",
    icon: "🛍️", color: "#A16207", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Food, Civil Supplies & Consumer Affairs Dept.", hi: "कर्नाटक खाद्य, नागरिक आपूर्ति एवं उपभोक्ता मामले विभाग" },
    name:    { en: "Sakala — Priority Household Ration Card (PHH) Fast-Track",     hi: "सकाला — प्राथमिकता परिवार राशन कार्ड (PHH) फास्ट-ट्रैक" },
    benefit: { en: "5 kg rice/wheat per family member/month at ₹2–₹3/kg under NFSA; fast-track issuance within 30 days under Sakala framework", hi: "NFSA के तहत परिवार के प्रत्येक सदस्य को ₹2–₹3/किलो पर 5 किलो चावल/गेहूं/माह; सकाला ढांचे में 30 दिन के अंदर राशन कार्ड जारी" },
    tag:     { en: "General", hi: "सामान्य" },
    annual: 0,
    apply:   { en: "https://ahara.kar.nic.in", hi: "ahara.kar.nic.in / नज़दीकी राशन दुकान या तहसीलदार कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Income Proof", "Address Proof", "Family Photo"],
               hi: ["आधार कार्ड", "आय प्रमाण", "पता प्रमाण", "परिवार की फोटो"] },
    match: (a) => a.state === "Karnataka" && ["below1", "1to3"].includes(a.income),
  },

  // ADD MORE KARNATAKA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "karnataka_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Karnataka",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Karnataka",
  // },

];
