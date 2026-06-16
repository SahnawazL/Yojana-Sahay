// Rajasthan — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "rajasthan_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const RAJASTHAN_SCHEMES = [

  // ── HEALTH ──────────────────────────────────────────────────────────────────

  {
    id: "rajasthan_chiranjeevi",
    icon: "🏥", color: "#7C3AED", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Health Dept.", hi: "राजस्थान स्वास्थ्य विभाग" },
    name:    { en: "Mukhyamantri Chiranjeevi Yojana",           hi: "मुख्यमंत्री चिरंजीवी योजना" },
    benefit: { en: "₹25 Lakh/year cashless hospital treatment",  hi: "₹25 लाख/वर्ष कैशलेस अस्पताल इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 2500000,
    apply:   { en: "https://www.bajajfinserv.in/insurance/mukhyamantri-chiranjeevi-swasthya-yojana", hi: "https://www.bajajfinserv.in/insurance/mukhyamantri-chiranjeevi-swasthya-yojana" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Income Certificate"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "आय प्रमाण"] },
    match: (a) => a.state === "Rajasthan" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── CHILD / SOCIAL ───────────────────────────────────────────────────────────

  {
    id: "raj_palanhar",
    icon: "👨‍👧", color: "#7C3AED", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Palanhar Yojana (Rajasthan)",                                          hi: "पालनहार योजना (राजस्थान)" },
    benefit: { en: "₹1,500/month for orphan/destitute child care till age 18",            hi: "अनाथ/निराश्रित बच्चे की 18 वर्ष तक देखभाल के लिए ₹1,500/माह" },
    tag:     { en: "Child / Social", hi: "बच्चे / सामाजिक" },
    annual: 18000,
    apply:   { en: "https://sje.rajasthan.gov.in", hi: "sje.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Child's Birth Certificate", "Orphan/Destitute Proof", "Guardian Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "बच्चे का जन्म प्रमाण", "अनाथ/निराश्रित प्रमाण", "अभिभावक बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && ["below1", "1to3"].includes(a.income),
  },

  // ── WOMEN / GIRL CHILD ───────────────────────────────────────────────────────

  {
    id: "raj_rajshri",
    icon: "👧", color: "#BE185D", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Women & Child Development Dept.", hi: "राजस्थान महिला एवं बाल विकास विभाग" },
    name:    { en: "Mukhyamantri Rajshri Yojana",                                                          hi: "मुख्यमंत्री राजश्री योजना" },
    benefit: { en: "₹50,000 total in 6 installments from birth through Class 12 for every girl child",     hi: "बालिका के जन्म से कक्षा 12 तक 6 किस्तों में कुल ₹50,000" },
    tag:     { en: "Women / Girl Child", hi: "महिला / बालिका" },
    annual: 50000,
    apply:   { en: "https://wcd.rajasthan.gov.in", hi: "wcd.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Girl Child's Birth Certificate", "Institutional Delivery Proof", "Bank Account (mother's)"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "बालिका का जन्म प्रमाण पत्र", "संस्थागत प्रसव प्रमाण", "बैंक खाता (माँ का)"] },
    // Eligibility: girl child born on/after 1 June 2016 in Rajasthan
    match: (a) => a.state === "Rajasthan" && a.who === "women",
  },

  {
    id: "raj_wfh_mahila",
    icon: "💻", color: "#9333EA", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Women Empowerment Dept.", hi: "राजस्थान महिला अधिकारिता विभाग" },
    name:    { en: "Mukhyamantri Work From Home Yojana",                                                                   hi: "मुख्यमंत्री वर्क फ्रॉम होम योजना" },
    benefit: { en: "Home-based employment for women · Priority to widows, divorcees & specially-abled women",             hi: "महिलाओं को घर से रोज़गार · विधवाओं, तलाकशुदा और दिव्यांग महिलाओं को प्राथमिकता" },
    tag:     { en: "Women / Employment", hi: "महिला / रोज़गार" },
    annual: 0,
    apply:   { en: "https://mahilawfh.rajasthan.gov.in", hi: "mahilawfh.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Educational / Skill Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "शैक्षणिक / कौशल प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && a.who === "women",
  },

  // ── EDUCATION / STUDENT ──────────────────────────────────────────────────────

  {
    id: "raj_anuprati_coaching",
    icon: "📖", color: "#1D4ED8", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Mukhyamantri Anuprati Coaching Yojana",                                                                  hi: "मुख्यमंत्री अनुप्रति कोचिंग योजना" },
    benefit: { en: "Free coaching for UPSC/RPSC/REET/CLAT/NEET + ₹40,000/year stipend for outstation students",            hi: "UPSC/RPSC/REET/CLAT/NEET हेतु निःशुल्क कोचिंग + बाहरी छात्रों को ₹40,000/वर्ष स्टाइपेंड" },
    tag:     { en: "Education / Student", hi: "शिक्षा / छात्र" },
    annual: 40000,
    apply:   { en: "https://sje.rajasthan.gov.in", hi: "sje.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Caste Certificate (SC/ST/OBC/EWS/BPL)", "Income Certificate (family ≤ ₹8 lakh/year)", "Last Qualifying Mark Sheet", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/OBC/EWS/BPL)", "आय प्रमाण (परिवार ≤ ₹8 लाख/वर्ष)", "अंतिम योग्यता मार्कशीट", "बैंक खाता"] },
    // Eligibility: SC/ST/OBC/EWS/BPL student, family income ≤ ₹8 lakh/year
    match: (a) => a.state === "Rajasthan" && a.who === "student" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  {
    id: "raj_aapki_beti",
    icon: "🎀", color: "#DC2626", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Education Dept.", hi: "राजस्थान शिक्षा विभाग" },
    name:    { en: "Aapki Beti Yojana (Rajasthan)",                                                                          hi: "आपकी बेटी योजना (राजस्थान)" },
    benefit: { en: "Annual grant: ₹2,100 (Class 1–8) · ₹2,500 (Class 9–12) for BPL girl students in govt schools",         hi: "सरकारी स्कूल में BPL बालिका छात्राओं को वार्षिक अनुदान: कक्षा 1–8 → ₹2,100 · कक्षा 9–12 → ₹2,500" },
    tag:     { en: "Education / Girl Child", hi: "शिक्षा / बालिका" },
    annual: 2500,
    apply:   { en: "https://rajshaladarpan.nic.in", hi: "rajshaladarpan.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "BPL Ration Card", "School Enrolment Certificate", "Parent/Guardian Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "BPL राशन कार्ड", "स्कूल नामांकन प्रमाण", "अभिभावक बैंक खाता"] },
    // Eligibility: BPL girl student studying in a government school
    match: (a) => a.state === "Rajasthan" && a.who === "student" && a.income === "below1",
  },

  {
    id: "raj_kalibai_scooty",
    icon: "🛵", color: "#0F766E", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Higher Education Dept.", hi: "राजस्थान उच्च शिक्षा विभाग" },
    name:    { en: "Kalibai Bheel Medhavi Chatra Scooty Yojana",                                                                   hi: "कालीबाई भील मेधावी छात्रा स्कूटी योजना" },
    benefit: { en: "Free scooty + ₹2,000 cash for SC/ST/OBC/Minority/EWS girl students scoring ≥65% in board exams",             hi: "बोर्ड परीक्षा में ≥65% पाने वाली SC/ST/OBC/अल्पसंख्यक/EWS छात्राओं को निःशुल्क स्कूटी + ₹2,000 नकद" },
    tag:     { en: "Student / Women", hi: "छात्र / महिला" },
    annual: 45000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/kbbmcss", hi: "https://www.myscheme.gov.in/schemes/kbbmcss" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Caste Certificate (SC/ST/OBC/EWS)", "10th / 12th Mark Sheet (≥65%)", "Admission Proof in Higher Education", "Income Certificate (family ≤ ₹2.5 lakh/year)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "जाति प्रमाण पत्र (SC/ST/OBC/EWS)", "10वीं / 12वीं मार्कशीट (≥65%)", "उच्च शिक्षा में प्रवेश प्रमाण", "आय प्रमाण (परिवार ≤ ₹2.5 लाख/वर्ष)", "बैंक खाता"] },
    // Eligibility: SC/ST/OBC/Minority/EWS girl, ≥65% in board, enrolled in college
    match: (a) => a.state === "Rajasthan" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  {
    id: "raj_devnarayan_scooty",
    icon: "🏍️", color: "#D97706", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Devnarayan Chatra Scooty Yojana",                                                                              hi: "देवनारायण छात्रा स्कूटी योजना" },
    benefit: { en: "Free scooty + ₹10,000–₹20,000/year stipend for OBC backward-class girl students scoring ≥50% in Class 12",   hi: "12वीं में ≥50% पाने वाली OBC पिछड़ा वर्ग छात्राओं को निःशुल्क स्कूटी + ₹10,000–₹20,000/वर्ष स्टाइपेंड" },
    tag:     { en: "Student / Women", hi: "छात्र / महिला" },
    annual: 20000,
    apply:   { en: "https://sje.rajasthan.gov.in", hi: "sje.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "OBC Caste Certificate (Gurjar/Raika/Banjara/Gadia Luhar)", "12th Mark Sheet (≥50%)", "College Admission Proof", "Income Certificate (family ≤ ₹2 lakh/year)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "OBC जाति प्रमाण (गुर्जर/राइका/बंजारा/गाडिया लोहार)", "12वीं मार्कशीट (≥50%)", "कॉलेज प्रवेश प्रमाण", "आय प्रमाण (परिवार ≤ ₹2 लाख/वर्ष)", "बैंक खाता"] },
    // Eligibility: girl from specific OBC backward communities, ≥50% in 12th board
    match: (a) => a.state === "Rajasthan" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── FARMER ───────────────────────────────────────────────────────────────────

  {
    id: "raj_tarbandi",
    icon: "🌿", color: "#15803D", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Agriculture Dept.", hi: "राजस्थान कृषि विभाग" },
    name:    { en: "Tarbandi Yojana (Rajasthan)",                                                         hi: "तारबंदी योजना (राजस्थान)" },
    benefit: { en: "50% subsidy on crop-field fencing · max ₹40,000 grant for 400 running metres",       hi: "खेत की तारबंदी पर 50% सब्सिडी · 400 रनिंग मीटर तक अधिकतम ₹40,000 अनुदान" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 40000,
    apply:   { en: "https://rajkisan.rajasthan.gov.in", hi: "rajkisan.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Land Records (Jamabandi)", "Bank Account", "Affidavit (not availed benefit in last 10 years)"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "जमाबंदी (भूमि अभिलेख)", "बैंक खाता", "शपथ पत्र (पिछले 10 वर्षों में लाभ नहीं लिया)"] },
    // Eligibility: Rajasthan farmer with ≥1.5 bigha land, rural area
    match: (a) => a.state === "Rajasthan" && a.who === "farmer" && a.area === "rural",
  },

  {
    id: "raj_krishak_sathi",
    icon: "🚜", color: "#CA8A04", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Agriculture Dept.", hi: "राजस्थान कृषि विभाग" },
    name:    { en: "Mukhyamantri Krishak Sathi Yojana",                                                                    hi: "मुख्यमंत्री कृषक साथी योजना" },
    benefit: { en: "Accident compensation ₹5,000–₹2,00,000 for farmers injured or killed during farm activities",         hi: "खेती कार्य के दौरान दुर्घटना पर ₹5,000–₹2,00,000 का मुआवज़ा" },
    tag:     { en: "Farmer / Insurance", hi: "किसान / बीमा" },
    annual: 200000,
    apply:   { en: "https://rajkisan.rajasthan.gov.in", hi: "rajkisan.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Land Records", "FIR / Post-mortem Report (on death)", "Hospital Disability Certificate (on injury)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "भूमि अभिलेख", "FIR / पोस्टमार्टम रिपोर्ट (मृत्यु पर)", "अस्पताल विकलांगता प्रमाण (चोट पर)", "बैंक खाता"] },
    // Eligibility: registered Rajasthan farmer aged 5–70 years
    match: (a) => a.state === "Rajasthan" && a.who === "farmer",
  },

  {
    id: "raj_dugdh_sambal",
    icon: "🥛", color: "#0EA5E9", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Animal Husbandry & Dairy Dept.", hi: "राजस्थान पशुपालन एवं डेयरी विभाग" },
    name:    { en: "Mukhyamantri Dugdh Utpadak Sambal Yojana",                                  hi: "मुख्यमंत्री दुग्ध उत्पादक संबल योजना" },
    benefit: { en: "₹5/litre bonus credited directly to dairy farmer selling milk via Saras cooperative", hi: "सरस डेयरी सहकारी को दूध बेचने पर ₹5/लीटर बोनस सीधे बैंक में" },
    tag:     { en: "Farmer / Dairy", hi: "किसान / डेयरी" },
    annual: 18250,
    apply:   { en: "https://government.economictimes.indiatimes.com/news/economy/rajasthan-budget-2026-major-investments-in-dairy-and-animal-husbandry-to-benefit-livestock-owners/128211291", hi: "https://government.economictimes.indiatimes.com/news/economy/rajasthan-budget-2026-major-investments-in-dairy-and-animal-husbandry-to-benefit-livestock-owners/128211291" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Milk Society Membership Certificate", "Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "दुग्ध समिति सदस्यता प्रमाण", "बैंक खाता (आधार लिंक)"] },
    // Eligibility: Rajasthan farmer registered with Saras/RCDF milk cooperative
    match: (a) => a.state === "Rajasthan" && a.who === "farmer",
  },

  // ── FOOD / GENERAL ───────────────────────────────────────────────────────────

  {
    id: "raj_indira_rasoi",
    icon: "🍱", color: "#F97316", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Food & Civil Supplies Dept.", hi: "राजस्थान खाद्य एवं नागरिक आपूर्ति विभाग" },
    name:    { en: "Indira Rasoi Yojana",                                                                          hi: "इंदिरा रसोई योजना" },
    benefit: { en: "Nutritious meal (daal, baati, sabji, roti) for just ₹8/plate at subsidised canteens statewide", hi: "राज्यभर में सब्सिडी कैंटीन पर सिर्फ ₹8/थाली में पौष्टिक भोजन (दाल, बाटी, सब्जी, रोटी)" },
    tag:     { en: "Food / General", hi: "भोजन / सामान्य" },
    annual: 0,
    apply:   { en: "indirarasoi.rajasthan.gov.in", hi: "indirarasoi.rajasthan.gov.in" }, applyType: "offline",
    docs:    { en: ["No documents required · Walk in to any Indira Rasoi canteen"],
               hi: ["कोई दस्तावेज़ आवश्यक नहीं · किसी भी इंदिरा रसोई में जाएं"] },
    // Eligibility: any Rajasthan resident (urban poor prioritised); no means-test for entry
    match: (a) => a.state === "Rajasthan" && ["below1", "1to3"].includes(a.income),
  },

  // ── BUSINESS / ARTISAN ───────────────────────────────────────────────────────

  {
    id: "raj_vishwakarma_kamgar",
    icon: "🔨", color: "#92400E", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Labour Dept.", hi: "राजस्थान श्रम विभाग" },
    name:    { en: "Rajasthan Vishwakarma Kamgar Kalyan Yojana",                                                             hi: "राजस्थान विश्वकर्मा कामगार कल्याण योजना" },
    benefit: { en: "₹5,000 toolkit grant + ₹2 Lakh accident insurance for artisans, craftsmen & unorganised workers",      hi: "कारीगरों, शिल्पकारों और असंगठित श्रमिकों को ₹5,000 टूलकिट अनुदान + ₹2 लाख दुर्घटना बीमा" },
    tag:     { en: "Business / Artisan", hi: "व्यापार / कारीगर" },
    annual: 5000,
    apply:   { en: "https://industries.rajasthan.gov.in/order/detail/946/0/106608", hi: "https://industries.rajasthan.gov.in/order/detail/946/0/106608" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Occupation / Craft Proof", "Income Certificate (≤ ₹3 lakh/year)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "व्यवसाय / शिल्प प्रमाण", "आय प्रमाण (≤ ₹3 लाख/वर्ष)", "बैंक खाता"] },
    // Eligibility: self-employed artisan/craftsman or unorganised worker in Rajasthan
    match: (a) => a.state === "Rajasthan" && (a.who === "business" || a.who === "general") && ["below1", "1to3"].includes(a.income),
  },

  // ── PENSION / SENIOR ─────────────────────────────────────────────────────────

  {
    id: "raj_ssp_pension",
    icon: "👴", color: "#B45309", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Rajasthan Samajik Suraksha Pension (RajSSP)",                                                                         hi: "राजस्थान सामाजिक सुरक्षा पेंशन (RajSSP)" },
    benefit: { en: "₹750–₹1,500/month for senior citizens (women 55+, men 58+), widows (18+) & persons with disabilities (18+)",         hi: "वरिष्ठ नागरिकों (महिला 55+, पुरुष 58+), विधवाओं (18+) और दिव्यांगजनों (18+) को ₹750–₹1,500/माह पेंशन" },
    tag:     { en: "Pension / Senior", hi: "पेंशन / वरिष्ठ" },
    annual: 18000,
    apply:   { en: "https://rajssp.raj.nic.in", hi: "rajssp.raj.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Age Proof", "BPL / Income Certificate", "Widowhood / Disability Certificate (if applicable)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "आयु प्रमाण", "BPL / आय प्रमाण", "विधवा / दिव्यांगता प्रमाण (लागू हो तो)", "बैंक खाता"] },
    // Eligibility: BPL senior citizen, widow, or person with ≥40% disability in Rajasthan
    match: (a) => a.state === "Rajasthan" && (a.who === "senior" || a.age === "above60") && ["below1", "1to3"].includes(a.income),
  },

  // ── EMPLOYMENT / YOUTH ───────────────────────────────────────────────────────

  {
    id: "raj_yuva_sambal",
    icon: "💼", color: "#4F46E5", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Skill, Employment & Entrepreneurship Dept.", hi: "राजस्थान कौशल, रोज़गार एवं उद्यमिता विभाग" },
    name:    { en: "Mukhyamantri Yuva Sambal Yojana",                                                                              hi: "मुख्यमंत्री युवा संबल योजना" },
    benefit: { en: "Unemployment allowance ₹3,500/month (male grad) · ₹3,750/month (female/disabled) for up to 2 years",         hi: "बेरोज़गारी भत्ता ₹3,500/माह (पुरुष स्नातक) · ₹3,750/माह (महिला/दिव्यांग) — अधिकतम 2 वर्ष" },
    tag:     { en: "Employment / Youth", hi: "रोज़गार / युवा" },
    annual: 45000,
    apply:   { en: "https://employment.rajasthan.gov.in", hi: "employment.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Graduation Degree Certificate", "Income Certificate (family ≤ ₹2 lakh/year)", "Employment Exchange Registration", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "स्नातक डिग्री प्रमाण पत्र", "आय प्रमाण (परिवार ≤ ₹2 लाख/वर्ष)", "रोज़गार कार्यालय पंजीकरण", "बैंक खाता"] },
    // Eligibility: unemployed Rajasthan graduate aged 21–35, family income ≤ ₹2 lakh/year
    match: (a) => a.state === "Rajasthan" && ["18to35"].includes(a.age) && ["below1", "1to3"].includes(a.income),
  },

  // ── SMARTPHONE / DIGITAL ─────────────────────────────────────────────────────

  {
    id: "raj_igsy_smartphone",
    icon: "📱", color: "#0369A1", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Information Technology & Communication Dept.", hi: "राजस्थान सूचना प्रौद्योगिकी एवं संचार विभाग" },
    name:    { en: "Indira Gandhi Smartphone Yojana (IGSY)",                                                                        hi: "इंदिरा गांधी स्मार्टफोन योजना (IGSY)" },
    benefit: { en: "Free smartphone + 3 years mobile data for women heads of NFSA/Chiranjeevi households & girls in Class 9–12 / college", hi: "NFSA/चिरंजीवी परिवार की महिला मुखिया और कक्षा 9–12/कॉलेज की छात्राओं को निःशुल्क स्मार्टफोन + 3 वर्ष मोबाइल डेटा" },
    tag:     { en: "Women / Digital", hi: "महिला / डिजिटल" },
    annual: 6800,
    apply:   { en: "igsy.rajasthan.gov.in", hi: "igsy.rajasthan.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "NFSA / Chiranjeevi Card (for women)", "School / College ID (for girls)", "Passport Photo"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "NFSA / चिरंजीवी कार्ड (महिलाओं के लिए)", "स्कूल / कॉलेज आईडी (छात्राओं के लिए)", "पासपोर्ट फोटो"] },
    // Eligibility: woman head of NFSA/Chiranjeevi household OR girl enrolled in Class 9–12/college
    match: (a) => a.state === "Rajasthan" && (a.who === "women" || (a.who === "student" && ["below1", "1to3"].includes(a.income))),
  },

  // ── HOUSING ──────────────────────────────────────────────────────────────────

  {
    id: "raj_jan_awas",
    icon: "🏠", color: "#0F766E", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Urban Development & Housing Dept. (UDH)", hi: "राजस्थान नगरीय विकास एवं आवासन विभाग (UDH)" },
    name:    { en: "Mukhyamantri Jan Awas Yojana (MJAY)",                                                                   hi: "मुख्यमंत्री जन आवास योजना (MJAY)" },
    benefit: { en: "Subsidised flats for EWS (≤₹3L income) & LIG (≤₹6L) · EWS units from ₹3.5 lakh in urban areas",     hi: "EWS (≤₹3 लाख आय) और LIG (≤₹6 लाख) को सब्सिडी पर फ्लैट · शहरी क्षेत्रों में EWS यूनिट ₹3.5 लाख से" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 0,
    apply:   { en: "urban.rajasthan.gov.in", hi: "urban.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Income Certificate", "No Property Ownership Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "आय प्रमाण पत्र", "संपत्ति न होने का प्रमाण", "बैंक खाता"] },
    // Eligibility: EWS/LIG household in urban Rajasthan with no pucca house
    match: (a) => a.state === "Rajasthan" && ["no", "kutcha"].includes(a.house) && ["below1", "1to3", "3to6"].includes(a.income) && ["urban", "semi"].includes(a.area),
  },

  // ── IRRIGATION / FARMER ──────────────────────────────────────────────────────

  {
    id: "raj_sinchai_pipeline",
    icon: "💧", color: "#0284C7", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Agriculture Dept.", hi: "राजस्थान कृषि विभाग" },
    name:    { en: "Sinchai Pipeline Yojana (Rajasthan)",                                                                              hi: "सिंचाई पाइपलाइन योजना (राजस्थान)" },
    benefit: { en: "60% subsidy on underground irrigation pipeline · max ₹18,000 for small/marginal farmers",                         hi: "भूमिगत सिंचाई पाइपलाइन पर 60% सब्सिडी · लघु/सीमांत किसानों को अधिकतम ₹18,000" },
    tag:     { en: "Farmer / Irrigation", hi: "किसान / सिंचाई" },
    annual: 18000,
    apply:   { en: "rajkisan.rajasthan.gov.in", hi: "rajkisan.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Land Records (Jamabandi)", "Water Source Proof (well / tubewell)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "जमाबंदी (भूमि अभिलेख)", "जल स्रोत प्रमाण (कुआँ / ट्यूबवेल)", "बैंक खाता"] },
    // Eligibility: any Rajasthan farmer with existing water source and agricultural land
    match: (a) => a.state === "Rajasthan" && a.who === "farmer",
  },

  // ── BUSINESS / MSME ──────────────────────────────────────────────────────────

  {
    id: "raj_mlupy",
    icon: "🏭", color: "#7C3AED", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Industries Dept. (Bureau of Investment Promotion)", hi: "राजस्थान उद्योग विभाग (निवेश प्रोत्साहन ब्यूरो)" },
    name:    { en: "Mukhyamantri Laghu Udhyog Protsahan Yojana (MLUPY)",                                                                hi: "मुख्यमंत्री लघु उद्योग प्रोत्साहन योजना (MLUPY)" },
    benefit: { en: "5–8% interest subsidy on bank loans up to ₹10 crore for new manufacturing, service & trading MSMEs",              hi: "नए विनिर्माण, सेवा और व्यापार MSME के लिए ₹10 करोड़ तक बैंक लोन पर 5–8% ब्याज सब्सिडी" },
    tag:     { en: "Business / MSME", hi: "व्यापार / MSME" },
    annual: 0,
    apply:   { en: "industries.rajasthan.gov.in", hi: "industries.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN Card", "Jan Aadhaar Card", "Business Registration / Udyam Certificate", "Project Report", "Bank Loan Sanction Letter", "Bank Account"],
               hi: ["आधार और पैन कार्ड", "जन आधार कार्ड", "व्यापार पंजीकरण / उद्यम प्रमाण पत्र", "प्रोजेक्ट रिपोर्ट", "बैंक लोन मंजूरी पत्र", "बैंक खाता"] },
    // Eligibility: new MSME unit in Rajasthan taking a bank loan; manufacturing gets 8%, service/trading gets 5%
    match: (a) => a.state === "Rajasthan" && a.who === "business",
  },

  // ── SC / OBC STUDENT ─────────────────────────────────────────────────────────

  {
    id: "raj_ambedkar_dbt",
    icon: "🏡", color: "#6D28D9", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Rajasthan Ambedkar DBT Voucher Yojana",                                                                              hi: "राजस्थान अंबेडकर DBT वाउचर योजना" },
    benefit: { en: "₹2,000/month rent voucher (urban) · ₹1,000/month (semi-urban) for SC/OBC/EWS/MBC students living away for studies", hi: "पढ़ाई के लिए घर से दूर रहने वाले SC/OBC/EWS/MBC छात्रों को ₹2,000/माह (शहरी) · ₹1,000/माह (अर्ध-शहरी) किराया वाउचर" },
    tag:     { en: "Student / SC-OBC", hi: "छात्र / SC-OBC" },
    annual: 24000,
    apply:   { en: "sje.rajasthan.gov.in", hi: "sje.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Caste Certificate (SC/OBC/EWS/MBC)", "Income Certificate (family ≤ ₹2.5 lakh/year)", "College / University Enrolment Certificate", "Rent Agreement or Hostel Receipt", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "जाति प्रमाण पत्र (SC/OBC/EWS/MBC)", "आय प्रमाण (परिवार ≤ ₹2.5 लाख/वर्ष)", "कॉलेज / विश्वविद्यालय नामांकन प्रमाण", "किराया अनुबंध या हॉस्टल रसीद", "बैंक खाता"] },
    // Eligibility: SC/OBC/EWS/MBC graduate/postgrad student living away from home; family income ≤ ₹2.5L
    match: (a) => a.state === "Rajasthan" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── DISABILITY ───────────────────────────────────────────────────────────────

  {
    id: "raj_vishesh_yogyajan",
    icon: "🦽", color: "#059669", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Mukhyamantri Vishesh Yogyajan Swarojgar Yojana",                                                      hi: "मुख्यमंत्री विशेष योग्यजन स्वरोज़गार योजना" },
    benefit: { en: "Interest-free self-employment loan up to ₹5 lakh for persons with ≥40% disability",                  hi: "≥40% विकलांगता वाले व्यक्तियों को ₹5 लाख तक ब्याजमुक्त स्वरोज़गार ऋण" },
    tag:     { en: "Disability / Business", hi: "दिव्यांग / व्यापार" },
    annual: 0,
    apply:   { en: "sje.rajasthan.gov.in", hi: "sje.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Disability Certificate (≥40%)", "Income Certificate (family ≤ ₹2 lakh/year)", "Business Plan / Project Report", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "विकलांगता प्रमाण पत्र (≥40%)", "आय प्रमाण (परिवार ≤ ₹2 लाख/वर्ष)", "व्यापार योजना / प्रोजेक्ट रिपोर्ट", "बैंक खाता"] },
    // Eligibility: person with ≥40% certified disability, aged 18–50, family income ≤ ₹2 lakh/year
    match: (a) => a.state === "Rajasthan" && ["below1", "1to3"].includes(a.income) && ["18to35", "35to60"].includes(a.age),
  },

  // ── ELECTRICITY / UTILITIES ──────────────────────────────────────────────────

  {
    id: "raj_nishulk_bijli",
    icon: "⚡", color: "#EAB308", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Energy Dept. / DISCOMs", hi: "राजस्थान ऊर्जा विभाग / डिस्कॉम" },
    name:    { en: "Mukhyamantri Nishulk Bijli Yojana (Rajasthan)",                                                          hi: "मुख्यमंत्री निःशुल्क बिजली योजना (राजस्थान)" },
    benefit: { en: "100 units/month free electricity for domestic BPL/NFSA households · zero bill up to the free limit",    hi: "BPL/NFSA घरेलू उपभोक्ताओं को 100 यूनिट/माह निःशुल्क बिजली · मुफ्त सीमा तक शून्य बिल" },
    tag:     { en: "Electricity / Utilities", hi: "बिजली / उपयोगिताएं" },
    annual: 9600,
    apply:   { en: "energy.rajasthan.gov.in", hi: "energy.rajasthan.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "NFSA / BPL Ration Card", "Existing Electricity Connection (meter number)", "Passport Photo"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "NFSA / BPL राशन कार्ड", "मौजूदा बिजली कनेक्शन (मीटर नंबर)", "पासपोर्ट फोटो"] },
    // Eligibility: BPL/NFSA domestic electricity consumer in Rajasthan; auto-applied on NFSA database match
    match: (a) => a.state === "Rajasthan" && a.income === "below1",
  },

  // ── FREE HEALTH SERVICES ─────────────────────────────────────────────────────

  {
    id: "raj_nishulk_dawa",
    icon: "💊", color: "#DC2626", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Health Dept. (RMSC)", hi: "राजस्थान स्वास्थ्य विभाग (RMSC)" },
    name:    { en: "Mukhyamantri Nishulk Dawa Yojana",                                                  hi: "मुख्यमंत्री निःशुल्क दवा योजना" },
    benefit: { en: "2,000+ essential medicines free at all govt hospitals & PHCs — no cost to patient",  hi: "सभी सरकारी अस्पतालों और PHC पर 2,000+ आवश्यक दवाइयाँ बिल्कुल मुफ्त" },
    tag:     { en: "Health / Medicine", hi: "स्वास्थ्य / दवा" },
    annual: 0,
    apply:   { en: "rajswasthya.nic.in", hi: "rajswasthya.nic.in" }, applyType: "offline",
    docs:    { en: ["Doctor's Prescription (from govt hospital OPD)", "Aadhaar Card (for record)"],
               hi: ["डॉक्टर का पर्चा (सरकारी OPD से)", "आधार कार्ड (रिकॉर्ड के लिए)"] },
    match: (a) => a.state === "Rajasthan" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  {
    id: "raj_nishulk_jaanch",
    icon: "🔬", color: "#0369A1", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Health Dept.", hi: "राजस्थान स्वास्थ्य विभाग" },
    name:    { en: "Mukhyamantri Nishulk Jaanch Yojana",                                                                hi: "मुख्यमंत्री निःशुल्क जाँच योजना" },
    benefit: { en: "90+ free diagnostic tests (blood, urine, X-ray, ECG, CT scan, MRI) at govt hospitals",              hi: "सरकारी अस्पतालों पर 90+ निःशुल्क जाँच (खून, मूत्र, X-रे, ECG, CT स्कैन, MRI)" },
    tag:     { en: "Health / Diagnostics", hi: "स्वास्थ्य / जाँच" },
    annual: 0,
    apply:   { en: "rajswasthya.nic.in", hi: "rajswasthya.nic.in" }, applyType: "offline",
    docs:    { en: ["Doctor's Referral Slip (from govt hospital OPD)", "Aadhaar Card"],
               hi: ["डॉक्टर की रेफरल पर्ची (सरकारी OPD से)", "आधार कार्ड"] },
    match: (a) => a.state === "Rajasthan" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── GIRL MERIT AWARD ─────────────────────────────────────────────────────────

  {
    id: "raj_gargi_puraskar",
    icon: "🏅", color: "#B45309", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Education Dept. (BSER)", hi: "राजस्थान शिक्षा विभाग (BSER)" },
    name:    { en: "Gargi Puraskar (Rajasthan)",                                                                              hi: "गार्गी पुरस्कार (राजस्थान)" },
    benefit: { en: "Cash award for girls scoring ≥75% in RBSE board: ₹3,000 (Class 10) · ₹5,000 (Class 12) + certificate", hi: "RBSE बोर्ड में ≥75% पाने वाली बालिकाओं को: ₹3,000 (कक्षा 10) · ₹5,000 (कक्षा 12) + प्रमाण पत्र" },
    tag:     { en: "Education / Merit", hi: "शिक्षा / मेरिट" },
    annual: 5000,
    apply:   { en: "rajshaladarpan.nic.in", hi: "rajshaladarpan.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "RBSE 10th / 12th Mark Sheet (≥75%)", "School Enrolment Certificate (studies must be continuing)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "RBSE 10वीं / 12वीं मार्कशीट (≥75%)", "स्कूल नामांकन प्रमाण (पढ़ाई जारी होनी चाहिए)", "बैंक खाता"] },
    // Eligibility: girl scoring ≥75% in RBSE Class 10 or 12, still enrolled in studies
    match: (a) => a.state === "Rajasthan" && a.who === "student",
  },

  // ── HIGHER EDUCATION SCHOLARSHIP ─────────────────────────────────────────────

  {
    id: "raj_cm_higher_scholarship",
    icon: "🎓", color: "#1D4ED8", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Higher Education Dept.", hi: "राजस्थान उच्च शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Uchch Shiksha Scholarship Yojana",                                                            hi: "मुख्यमंत्री उच्च शिक्षा छात्रवृत्ति योजना" },
    benefit: { en: "₹5,000/year scholarship for students scoring >60% in Class 12, pursuing graduation at govt college",      hi: "सरकारी कॉलेज में स्नातक पढ़ रहे कक्षा 12 में >60% छात्रों को ₹5,000/वर्ष छात्रवृत्ति" },
    tag:     { en: "Education / Scholarship", hi: "शिक्षा / छात्रवृत्ति" },
    annual: 5000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/cmhess", hi: "https://www.myscheme.gov.in/schemes/cmhess" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Class 12 Mark Sheet (>60%)", "Income Certificate (family ≤ ₹2.5 lakh/year)", "Govt College Admission Proof", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "कक्षा 12 मार्कशीट (>60%)", "आय प्रमाण (परिवार ≤ ₹2.5 लाख/वर्ष)", "सरकारी कॉलेज प्रवेश प्रमाण", "बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── WOMEN / SHG LOAN ─────────────────────────────────────────────────────────

  {
    id: "raj_mahila_nidhi",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan State Rural Livelihoods Mission (RSLM)", hi: "राजस्थान राज्य ग्रामीण आजीविका मिशन (RSLM)" },
    name:    { en: "Rajasthan Mahila Nidhi (SHG Microfinance)",                                                             hi: "राजस्थान महिला निधि (SHG माइक्रोफाइनेंस)" },
    benefit: { en: "Microloans ₹15,000–₹1,00,000 at 1–4% interest for women SHG members for livelihood activities",       hi: "महिला SHG सदस्यों को आजीविका के लिए ₹15,000–₹1,00,000 तक 1–4% ब्याज पर माइक्रोलोन" },
    tag:     { en: "Women / SHG / Loan", hi: "महिला / SHG / ऋण" },
    annual: 0,
    apply:   { en: "rajmahilanidhi.org", hi: "rajmahilanidhi.org" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "SHG Membership Proof (group min 6 months old)", "SHG Passbook & Meeting Register", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "SHG सदस्यता प्रमाण (समूह न्यूनतम 6 माह पुराना)", "SHG पासबुक और बैठक रजिस्टर", "बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && a.who === "women" && a.area === "rural",
  },

  // ── SENIOR PILGRIMAGE ─────────────────────────────────────────────────────────

  {
    id: "raj_teerth_yatra",
    icon: "🛕", color: "#F59E0B", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Devasthan Dept.", hi: "राजस्थान देवस्थान विभाग" },
    name:    { en: "Mukhyamantri Vriddhjan Teerth Yatra Yojana",                                                                           hi: "मुख्यमंत्री वृद्धजन तीर्थ यात्रा योजना" },
    benefit: { en: "Free pilgrimage (train + stay + meals) to Ayodhya, Haridwar, Varanasi, Tirupati, Shirdi etc. — once in a lifetime",    hi: "जीवन में एक बार अयोध्या, हरिद्वार, वाराणसी, तिरुपति, शिर्डी आदि — निःशुल्क ट्रेन, ठहरना और भोजन" },
    tag:     { en: "Senior / Pilgrimage", hi: "वरिष्ठ / तीर्थ यात्रा" },
    annual: 0,
    apply:   { en: "devasthan.rajasthan.gov.in", hi: "devasthan.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Age Proof (60+)", "Rajasthan Domicile Certificate", "Medical Fitness Certificate", "Passport Photo"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "आयु प्रमाण (60+)", "राजस्थान मूल निवास प्रमाण पत्र", "चिकित्सा स्वास्थ्य प्रमाण पत्र", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Rajasthan" && (a.who === "senior" || a.age === "above60"),
  },

  // ── SC / ST ENTERPRISE ───────────────────────────────────────────────────────

  {
    id: "raj_dadups",
    icon: "🏗️", color: "#6D28D9", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Industries Dept. / SJE Dept.", hi: "राजस्थान उद्योग विभाग / सामाजिक न्याय विभाग" },
    name:    { en: "Dr. B.R. Ambedkar Dalit Adivasi Udhyam Protsahan Yojana (DADUPS)",                                        hi: "डॉ. भीमराव अंबेडकर दलित आदिवासी उद्यम प्रोत्साहन योजना (DADUPS)" },
    benefit: { en: "Interest-free loan: ₹25 lakh (manufacturing) · ₹10 lakh (services) for SC/ST entrepreneurs",             hi: "SC/ST उद्यमियों को ब्याजमुक्त ऋण: विनिर्माण ₹25 लाख · सेवा क्षेत्र ₹10 लाख तक" },
    tag:     { en: "Business / SC-ST", hi: "व्यापार / SC-ST" },
    annual: 0,
    apply:   { en: "industries.rajasthan.gov.in", hi: "industries.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "SC / ST Caste Certificate", "Business / Udyam Registration", "Project Report", "Income Certificate", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "SC / ST जाति प्रमाण पत्र", "व्यापार / उद्यम पंजीकरण", "प्रोजेक्ट रिपोर्ट", "आय प्रमाण पत्र", "बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && a.who === "business" && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── SKILL TRAINING ───────────────────────────────────────────────────────────

  {
    id: "raj_rsldc_skill",
    icon: "🔧", color: "#0F766E", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Skill & Livelihoods Development Corporation (RSLDC)", hi: "राजस्थान कौशल एवं आजीविका विकास निगम (RSLDC)" },
    name:    { en: "RSLDC Free Vocational Skill Training",                                                                              hi: "RSLDC निःशुल्क व्यावसायिक कौशल प्रशिक्षण" },
    benefit: { en: "Free 3–6 month training in 50+ trades (IT, retail, construction, beauty, healthcare etc.) + placement support",    hi: "50+ ट्रेड में 3–6 माह का निःशुल्क प्रशिक्षण (IT, रिटेल, निर्माण, ब्यूटी, स्वास्थ्य आदि) + रोज़गार सहायता" },
    tag:     { en: "Skill / Employment", hi: "कौशल / रोज़गार" },
    annual: 0,
    apply:   { en: "https://negd.gov.in/isl/Directory/statedata/447", hi: "https://negd.gov.in/isl/Directory/statedata/447" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Educational Certificate (Class 8 / 10 / 12 per trade requirement)", "Passport Photo", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "शैक्षणिक प्रमाण (ट्रेड अनुसार कक्षा 8/10/12)", "पासपोर्ट फोटो", "बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && ["18to35", "35to60"].includes(a.age) && ["below1", "1to3", "3to6"].includes(a.income),
  },

  // ── FARMER / ELECTRICITY ─────────────────────────────────────────────────────

  {
    id: "raj_kisan_mitra_urja",
    icon: "⚡", color: "#15803D", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Energy Dept.", hi: "राजस्थान ऊर्जा विभाग" },
    name:    { en: "Mukhyamantri Kisan Mitra Urja Yojana",                                                                hi: "मुख्यमंत्री किसान मित्र ऊर्जा योजना" },
    benefit: { en: "₹1,000/month electricity subsidy (max ₹12,000/year) for farmers with metered agricultural connections", hi: "मीटर वाले कृषि बिजली कनेक्शन के किसानों को ₹1,000/माह बिजली सब्सिडी (अधिकतम ₹12,000/वर्ष)" },
    tag:     { en: "Farmer / Electricity", hi: "किसान / बिजली" },
    annual: 12000,
    apply:   { en: "energy.rajasthan.gov.in", hi: "energy.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Agricultural Electricity Connection Number", "Land Records (Jamabandi)", "Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "कृषि बिजली कनेक्शन नंबर", "जमाबंदी (भूमि अभिलेख)", "बैंक खाता (आधार लिंक)"] },
    // Eligibility: Rajasthan farmer with metered agricultural electricity connection; subsidy auto-credited to bill
    match: (a) => a.state === "Rajasthan" && a.who === "farmer",
  },

  // ── FARMER / HORTICULTURE ─────────────────────────────────────────────────────

  {
    id: "raj_polyhouse",
    icon: "🌱", color: "#16A34A", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Horticulture Dept.", hi: "राजस्थान उद्यान विभाग" },
    name:    { en: "Rajasthan Protected Cultivation Scheme (Polyhouse / Shadenet)",                                              hi: "राजस्थान संरक्षित खेती योजना (पॉलीहाउस / शेडनेट)" },
    benefit: { en: "50% subsidy on polyhouse or shadenet construction · up to ₹500/sqm for horticulture growers",               hi: "पॉलीहाउस या शेडनेट निर्माण पर 50% सब्सिडी · बागवानी किसानों को ₹500/वर्गमीटर तक" },
    tag:     { en: "Farmer / Horticulture", hi: "किसान / बागवानी" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/sh", hi: "https://www.myscheme.gov.in/schemes/sh" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Land Records (Jamabandi)", "Bank Account", "Quotation from approved vendor", "Soil & Water Test Report"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "जमाबंदी (भूमि अभिलेख)", "बैंक खाता", "अनुमोदित विक्रेता का कोटेशन", "मिट्टी और पानी परीक्षण रिपोर्ट"] },
    // Eligibility: Rajasthan farmer with min. 0.5 acres land intending to grow horticulture crops under protected structure
    match: (a) => a.state === "Rajasthan" && a.who === "farmer" && a.area === "rural",
  },

  // ── WOMEN / MATERNITY ─────────────────────────────────────────────────────────

  {
    id: "raj_janani_suraksha",
    icon: "🤱", color: "#DB2777", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Health Dept. (NHM)", hi: "राजस्थान स्वास्थ्य विभाग (NHM)" },
    name:    { en: "Janani Shishu Suraksha Karyakram (JSSK) — Rajasthan",                                                             hi: "जननी शिशु सुरक्षा कार्यक्रम (JSSK) — राजस्थान" },
    benefit: { en: "Free delivery + free medicines + free diet + free transport + ₹1,400 cash (rural) / ₹1,000 (urban) for institutional delivery", hi: "संस्थागत प्रसव पर निःशुल्क डिलीवरी + दवाइयाँ + आहार + परिवहन + ₹1,400 (ग्रामीण) / ₹1,000 (शहरी) नकद" },
    tag:     { en: "Women / Maternity", hi: "महिला / मातृत्व" },
    annual: 1400,
    apply:   { en: "rajswasthya.nic.in / Nearest govt hospital / ANM", hi: "rajswasthya.nic.in / नज़दीकी सरकारी अस्पताल / ANM" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Pregnancy Registration Card (ANC card)", "BPL / NFSA Card (if applicable)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "गर्भावस्था पंजीकरण कार्ड (ANC कार्ड)", "BPL / NFSA कार्ड (यदि लागू हो)", "बैंक खाता"] },
    // Eligibility: any pregnant woman delivering at a government health facility in Rajasthan
    match: (a) => a.state === "Rajasthan" && a.who === "women",
  },

  // ── WOMEN / DESTITUTE ────────────────────────────────────────────────────────

  {
    id: "raj_shakti_swaroopa",
    icon: "🌸", color: "#9333EA", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Women & Child Development Dept.", hi: "राजस्थान महिला एवं बाल विकास विभाग" },
    name:    { en: "Shakti Swaroopa Yojana (Rajasthan)",                                                                                hi: "शक्ति स्वरूपा योजना (राजस्थान)" },
    benefit: { en: "₹2,000 one-time grant + interest-free microloan + free skill training for destitute / divorced / abandoned women",  hi: "निराश्रित / तलाकशुदा / परित्यक्त महिलाओं को ₹2,000 एकमुश्त अनुदान + ब्याजमुक्त माइक्रोलोन + निःशुल्क कौशल प्रशिक्षण" },
    tag:     { en: "Women / Destitute", hi: "महिला / निराश्रित" },
    annual: 2000,
    apply:   { en: "wcd.rajasthan.gov.in", hi: "wcd.rajasthan.gov.in" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Destitution / Divorce / Abandonment Proof", "Income Certificate (≤ ₹50,000/year)", "Age Proof (18–45 years)", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "निराश्रिता / तलाक / परित्याग प्रमाण", "आय प्रमाण (≤ ₹50,000/वर्ष)", "आयु प्रमाण (18–45 वर्ष)", "बैंक खाता"] },
    // Eligibility: destitute/divorced/abandoned/separated Rajasthan woman aged 18–45, income ≤ ₹50,000/year
    match: (a) => a.state === "Rajasthan" && a.who === "women" && a.income === "below1",
  },

  // ── LIVESTOCK / FARMER ───────────────────────────────────────────────────────

  {
    id: "raj_pashudhan_dawai",
    icon: "🐄", color: "#92400E", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Animal Husbandry Dept.", hi: "राजस्थान पशुपालन विभाग" },
    name:    { en: "Mukhyamantri Pashudhan Nishulk Dawai Yojana",                                                            hi: "मुख्यमंत्री पशुधन निःशुल्क दवाई योजना" },
    benefit: { en: "Free veterinary medicines & vaccines for all livestock at govt animal hospitals & sub-centres",           hi: "सरकारी पशु चिकित्सालयों और उप-केंद्रों पर सभी पशुओं के लिए निःशुल्क पशु चिकित्सा दवाइयाँ और टीके" },
    tag:     { en: "Farmer / Livestock", hi: "किसान / पशुपालन" },
    annual: 0,
    apply:   { en: "animalhusbandry.rajasthan.gov.in / Nearest Govt Vet Hospital", hi: "animalhusbandry.rajasthan.gov.in / नज़दीकी सरकारी पशु अस्पताल" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Animal / Livestock Ownership Proof (or self-declaration)"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "पशु स्वामित्व प्रमाण (या स्व-घोषणा)"] },
    // Eligibility: any Rajasthan livestock owner visiting a govt veterinary facility
    match: (a) => a.state === "Rajasthan" && a.who === "farmer",
  },

  // ── EDUCATION / TOP MERIT ────────────────────────────────────────────────────

  {
    id: "raj_hamari_beti",
    icon: "🥇", color: "#CA8A04", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Education Dept. (RMSA)", hi: "राजस्थान शिक्षा विभाग (RMSA)" },
    name:    { en: "Hamari Beti Yojana (Rajasthan)",                                                                                      hi: "हमारी बेटी योजना (राजस्थान)" },
    benefit: { en: "Top-4 girl toppers per district (Class 12 RBSE): laptop + ₹1 lakh scholarship · State topper: additional ₹1 lakh for international study", hi: "प्रत्येक जिले की RBSE 12वीं टॉप-4 बालिकाओं को: लैपटॉप + ₹1 लाख छात्रवृत्ति · राज्य टॉपर को अतिरिक्त ₹1 लाख अंतर्राष्ट्रीय अध्ययन के लिए" },
    tag:     { en: "Education / Top Merit", hi: "शिक्षा / टॉप मेरिट" },
    annual: 100000,
    apply:   { en: "rajshaladarpan.nic.in", hi: "rajshaladarpan.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "RBSE Class 12 Mark Sheet (district top-4 rank proof)", "College Admission Proof", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "RBSE 12वीं मार्कशीट (जिला टॉप-4 रैंक प्रमाण)", "कॉलेज प्रवेश प्रमाण", "बैंक खाता"] },
    // Eligibility: girl student ranked in top 4 of district in RBSE Class 12 board exam
    match: (a) => a.state === "Rajasthan" && a.who === "student",
  },

  // ── MINORITY / SCHOLARSHIP ───────────────────────────────────────────────────

  {
    id: "raj_minority_scholarship",
    icon: "📜", color: "#0284C7", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Minority Affairs Dept.", hi: "राजस्थान अल्पसंख्यक मामलात विभाग" },
    name:    { en: "Rajasthan Minority Post-Matric Scholarship",                                                                           hi: "राजस्थान अल्पसंख्यक पोस्ट-मैट्रिक छात्रवृत्ति" },
    benefit: { en: "₹825–₹1,500/month scholarship for minority students (Muslim, Christian, Sikh, Buddhist, Parsi, Jain) in Class 11 onwards", hi: "कक्षा 11 से आगे पढ़ने वाले अल्पसंख्यक छात्रों (मुस्लिम, ईसाई, सिख, बौद्ध, पारसी, जैन) को ₹825–₹1,500/माह छात्रवृत्ति" },
    tag:     { en: "Student / Minority", hi: "छात्र / अल्पसंख्यक" },
    annual: 18000,
    apply:   { en: "minority.rajasthan.gov.in", hi: "minority.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Minority Community Certificate", "Income Certificate (family ≤ ₹2 lakh/year)", "Previous Year Mark Sheet", "School / College Enrolment Proof", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "अल्पसंख्यक समुदाय प्रमाण पत्र", "आय प्रमाण (परिवार ≤ ₹2 लाख/वर्ष)", "पिछले वर्ष की मार्कशीट", "स्कूल / कॉलेज नामांकन प्रमाण", "बैंक खाता"] },
    // Eligibility: minority community student, family income ≤ ₹2 lakh/year, enrolled Class 11 onwards
    match: (a) => a.state === "Rajasthan" && a.who === "student" && ["below1", "1to3"].includes(a.income),
  },

  // ── CONSTRUCTION WORKERS ─────────────────────────────────────────────────────

  {
    id: "raj_bocw_welfare",
    icon: "🏗️", color: "#78350F", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Labour Dept. (BOCW Welfare Board)", hi: "राजस्थान श्रम विभाग (BOCW कल्याण बोर्ड)" },
    name:    { en: "Rajasthan BOCW Construction Worker Welfare Scheme",                                                                           hi: "राजस्थान BOCW निर्माण श्रमिक कल्याण योजना" },
    benefit: { en: "Package for registered construction workers: ₹2 lakh death benefit + children scholarship + maternity ₹21,000 + housing loan", hi: "पंजीकृत निर्माण श्रमिकों को: ₹2 लाख मृत्यु लाभ + बच्चों की छात्रवृत्ति + मातृत्व ₹21,000 + आवास ऋण" },
    tag:     { en: "Labour / Construction", hi: "श्रम / निर्माण" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/asfcw", hi: "https://www.myscheme.gov.in/schemes/asfcw" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Jan Aadhaar Card", "Construction Work Proof (90+ days in last 12 months)", "Employer / Contractor Certificate", "Passport Photo", "Bank Account"],
               hi: ["आधार कार्ड", "जन आधार कार्ड", "निर्माण कार्य प्रमाण (पिछले 12 माह में 90+ दिन)", "नियोक्ता / ठेकेदार प्रमाण पत्र", "पासपोर्ट फोटो", "बैंक खाता"] },
    // Eligibility: construction worker who has worked 90+ days in last 12 months; register first with BOCW board
    match: (a) => a.state === "Rajasthan" && (a.who === "general" || a.who === "business") && ["below1", "1to3"].includes(a.income),
  },

  // ADD MORE RAJASTHAN SCHEMES ABOVE THIS LINE ↑
  // {
  //   id: "rajasthan_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Rajasthan",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Rajasthan",
  // },

];
