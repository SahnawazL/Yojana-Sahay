// Uttar Pradesh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "up_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const UTTAR_PRADESH_SCHEMES = [

  // ── GIRL CHILD / WOMEN ────────────────────────────────────────────────────

  {
    id: "up_kanya",
    icon: "👧", color: "#E11D48", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Women Welfare Dept.", hi: "उत्तर प्रदेश महिला कल्याण विभाग" },
    name:    { en: "Mukhyamantri Kanya Sumangala Yojana (UP)",
               hi: "मुख्यमंत्री कन्या सुमंगला योजना (उत्तर प्रदेश)" },
    benefit: { en: "₹25,000 total in 6 milestone-based installments for girl children from birth to graduation — ₹2,000 at birth, ₹1,000 at vaccination (1 year), ₹2,000 at Class 1 admission, ₹3,000 at Class 6 admission, ₹5,000 at Class 9 admission, ₹7,000 at graduation/diploma admission; family income must be below ₹3 lakh/year; amount was increased from ₹15,000 in April 2024",
               hi: "जन्म से स्नातक तक 6 चरणों में ₹25,000 — जन्म पर ₹2,000, टीकाकरण (1 वर्ष) पर ₹1,000, कक्षा 1 में ₹2,000, कक्षा 6 में ₹3,000, कक्षा 9 में ₹5,000, स्नातक/डिप्लोमा प्रवेश पर ₹7,000; पारिवारिक आय ₹3 लाख/वर्ष से कम; राशि अप्रैल 2024 में ₹15,000 से बढ़ाकर ₹25,000 की गई" },
    tag:     { en: "Girl Child / Education", hi: "बालिका / शिक्षा" },
    annual: 25000,
    apply:   { en: "https://missionvatsalyaup.in", hi: "mksy.up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (parent/guardian)", "Girl Child's Birth Certificate", "Family Income Certificate (< ₹3 lakh/year)", "UP Domicile / Residence Proof", "Bank Account (Aadhaar-linked, parent/guardian)", "School Enrollment Certificate (for Class 1/6/9 installment)", "Graduation / Diploma Admission Certificate (for final installment)", "Passport Photo", "Family ID (UP Parivar Pahchan Patra)"],
               hi: ["आधार कार्ड (माता-पिता/अभिभावक)", "बालिका का जन्म प्रमाण पत्र", "पारिवारिक आय प्रमाण पत्र (₹3 लाख/वर्ष से कम)", "UP निवास प्रमाण", "बैंक खाता (आधार-लिंक्ड, माता-पिता/अभिभावक)", "स्कूल नामांकन प्रमाण पत्र (कक्षा 1/6/9 किस्त के लिए)", "स्नातक/डिप्लोमा प्रवेश प्रमाण पत्र (अंतिम किस्त के लिए)", "पासपोर्ट फोटो", "UP परिवार पहचान पत्र"] },
    match: (a) => a.state === "Uttar Pradesh" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "up_samuhik_vivah",
    icon: "💒", color: "#DB2777", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Social Welfare Dept.", hi: "उत्तर प्रदेश समाज कल्याण विभाग" },
    name:    { en: "Mukhyamantri Samuhik Vivah Yojana (UP)",
               hi: "मुख्यमंत्री सामूहिक विवाह योजना (उत्तर प्रदेश)" },
    benefit: { en: "₹51,000 total assistance per couple for daughters of BPL families — ₹35,000 directly to bride's bank account + ₹10,000 worth of household gifted items + ₹6,000 for wedding ceremony expenses; mass marriages organized at district level by the government; bride must be 18+, groom 21+; all castes and religions eligible",
               hi: "BPL परिवारों की बेटियों को प्रति जोड़ा ₹51,000 — ₹35,000 सीधे दुल्हन के बैंक खाते में + ₹10,000 के घरेलू उपहार + ₹6,000 शादी समारोह खर्च; जिला स्तर पर सरकार द्वारा सामूहिक विवाह आयोजित; दुल्हन 18+ और दूल्हा 21+; सभी जाति व धर्म पात्र" },
    tag:     { en: "Women / Marriage Assistance", hi: "महिला / विवाह सहायता" },
    annual: 51000,
    apply:   { en: "https://schemesinindia.in/schemes/uttar-pradesh/mukhyamantri-samuhik-vivah-yojana-up", hi: "shadianudan.upsdc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (bride and groom)", "Age Proof — Birth Certificate / Voter ID (bride 18+, groom 21+)", "Family Income Certificate (annual income ≤ ₹2 lakh)", "Caste Certificate (SC/ST/OBC/Minority if applicable)", "UP Residence / Domicile Proof", "Bank Account of Bride (Aadhaar-linked)", "Passport Photo (bride and groom)", "Marriage Card / Invitation (if available)"],
               hi: ["आधार कार्ड (वर-वधू दोनों)", "आयु प्रमाण — जन्म प्रमाण पत्र / मतदाता ID (दुल्हन 18+, दूल्हा 21+)", "पारिवारिक आय प्रमाण पत्र (वार्षिक आय ₹2 लाख से कम)", "जाति प्रमाण पत्र (SC/ST/OBC/अल्पसंख्यक हेतु)", "UP निवास प्रमाण", "दुल्हन का बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो (वर-वधू दोनों)", "विवाह कार्ड/निमंत्रण पत्र (यदि उपलब्ध)"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "up_bal_seva",
    icon: "👶", color: "#BE185D", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Women & Child Development Dept.", hi: "उत्तर प्रदेश महिला एवं बाल विकास विभाग" },
    name:    { en: "Mukhyamantri Bal Seva Yojana (UP)",
               hi: "मुख्यमंत्री बाल सेवा योजना (उत्तर प्रदेश)" },
    benefit: { en: "₹2,500/month financial assistance for children under 18 who have lost one or both parents due to COVID-19 or any other cause; free residential education at Atal Awasiya Vidyalayas; free tablet/laptop for older children; girls get support till marriage or age 21; monthly amount credited to bank account directly",
               hi: "COVID-19 या किसी अन्य कारण से माता-पिता में से एक या दोनों को खोने वाले 18 वर्ष से कम बच्चों को ₹2,500/माह; अटल आवासीय विद्यालयों में निःशुल्क आवासीय शिक्षा; बड़े बच्चों को निःशुल्क टैबलेट/लैपटॉप; लड़कियों को शादी या 21 वर्ष तक सहायता; मासिक राशि सीधे बैंक खाते में" },
    tag:     { en: "Child / Orphan / Social Support", hi: "बच्चे / अनाथ / सामाजिक सहायता" },
    annual: 30000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/upmbsyg", hi: "wecd.up.gov.in / जिला प्रोबेशन अधिकारी कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (child and guardian)", "Child's Birth Certificate", "Death Certificate of parent(s)", "Guardian's ID and Relationship Proof", "Bank Account (child/guardian, Aadhaar-linked)", "UP Residence Proof", "School Enrollment Certificate"],
               hi: ["आधार कार्ड (बच्चे और अभिभावक का)", "बच्चे का जन्म प्रमाण पत्र", "माता-पिता का मृत्यु प्रमाण पत्र", "अभिभावक की पहचान और संबंध प्रमाण", "बैंक खाता (बच्चे/अभिभावक, आधार-लिंक्ड)", "UP निवास प्रमाण", "स्कूल नामांकन प्रमाण पत्र"] },
    match: (a) => a.state === "Uttar Pradesh" && ["below1","1to3"].includes(a.income),
  },

  // ── SOCIAL PENSION ────────────────────────────────────────────────────────

  {
    id: "up_vidhva",
    icon: "👩‍🦳", color: "#7C3AED", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Social Welfare Dept.", hi: "उत्तर प्रदेश समाज कल्याण विभाग" },
    name:    { en: "UP Nirashrit Mahila (Vidhwa) Pension Yojana",
               hi: "उत्तर प्रदेश निराश्रित महिला (विधवा) पेंशन योजना" },
    benefit: { en: "₹1,000/month pension (recently revised from ₹500) for widows and destitute women of any age across UP; paid quarterly directly to Aadhaar-linked bank account; no income limit for women aged 60+ whose name is on the BPL list; all castes and religions eligible",
               hi: "UP में सभी आयु की विधवाओं व निराश्रित महिलाओं को ₹1,000/माह पेंशन (₹500 से हाल ही में संशोधित); सीधे आधार-लिंक्ड बैंक खाते में तिमाही भुगतान; BPL सूची में नाम होने पर 60+ महिलाओं के लिए कोई आय सीमा नहीं; सभी जाति व धर्म पात्र" },
    tag:     { en: "Widow / Pension", hi: "विधवा / पेंशन" },
    annual: 12000,
    apply:   { en: "https://mainpuri.nic.in/hi/scheme/%E0%A4%A8%E0%A4%BF%E0%A4%B0%E0%A4%BE%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%A4-%E0%A4%AE%E0%A4%B9%E0%A4%BF%E0%A4%B2%E0%A4%BE-%E0%A4%AA%E0%A5%87%E0%A4%82%E0%A4%B6%E0%A4%A8", hi: "sspy-up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Husband's Death Certificate", "Age Proof (Voter ID / Birth Certificate)", "BPL Ration Card or Income Certificate", "Bank Account (Aadhaar-linked)", "UP Residence / Domicile Proof", "Passport Photo"],
               hi: ["आधार कार्ड", "पति का मृत्यु प्रमाण पत्र", "आयु प्रमाण (मतदाता ID / जन्म प्रमाण पत्र)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "UP निवास प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "up_vridha_pension",
    icon: "👴", color: "#6D28D9", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Social Welfare Dept.", hi: "उत्तर प्रदेश समाज कल्याण विभाग" },
    name:    { en: "UP Vridhavastha Pension Yojana (Old Age Pension)",
               hi: "उत्तर प्रदेश वृद्धावस्था पेंशन योजना" },
    benefit: { en: "₹1,000/month for all senior citizens aged 60 years and above from BPL/economically weaker families; paid quarterly directly to Aadhaar-linked bank account; ~56 lakh beneficiaries across UP; no discrimination on basis of caste or religion",
               hi: "BPL/आर्थिक रूप से कमजोर परिवारों के 60 वर्ष व उससे अधिक के सभी वृद्ध नागरिकों को ₹1,000/माह; सीधे आधार-लिंक्ड बैंक खाते में तिमाही भुगतान; UP में ~56 लाख लाभार्थी; जाति या धर्म के आधार पर कोई भेदभाव नहीं" },
    tag:     { en: "Senior Citizen / Pension", hi: "वृद्धजन / पेंशन" },
    annual: 12000,
    apply:   { en: "https://moradabaddivision.nic.in/scheme/vridha-pension-yojana", hi: "sspy-up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Age Proof — Voter ID / Birth Certificate (60+ years)", "BPL Ration Card or Income Certificate", "Bank Account (Aadhaar-linked)", "UP Residence / Domicile Proof", "Passport Photo", "UP Family ID (Parivar Pahchan Patra) if available"],
               hi: ["आधार कार्ड", "आयु प्रमाण — मतदाता ID / जन्म प्रमाण पत्र (60+ वर्ष)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "UP निवास प्रमाण", "पासपोर्ट फोटो", "UP परिवार पहचान पत्र (यदि उपलब्ध)"] },
    match: (a) => a.state === "Uttar Pradesh" && (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "up_divyang_pension",
    icon: "♿", color: "#0891B2", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Divyangjan Empowerment Dept.", hi: "उत्तर प्रदेश दिव्यांगजन सशक्तिकरण विभाग" },
    name:    { en: "UP Divyangjan Pension Yojana",
               hi: "उत्तर प्रदेश दिव्यांगजन पेंशन योजना" },
    benefit: { en: "₹1,000/month pension for persons with 40% or above disability from BPL/economically weaker families, aged 18 and above; paid quarterly to Aadhaar-linked bank account; covers all disability types — physical, visual, hearing, intellectual, mental illness etc.",
               hi: "18 वर्ष व उससे अधिक आयु के 40% या अधिक दिव्यांगता वाले BPL/आर्थिक रूप से कमजोर व्यक्तियों को ₹1,000/माह पेंशन; तिमाही आधार-लिंक्ड बैंक खाते में भुगतान; सभी प्रकार की दिव्यांगता — शारीरिक, दृष्टि, श्रवण, बौद्धिक, मानसिक रोग आदि कवर" },
    tag:     { en: "Divyang / Disability / Pension", hi: "दिव्यांग / पेंशन" },
    annual: 12000,
    apply:   { en: "https://depwd.gov.in", hi: "sspy-up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Disability Certificate (40%+, issued by CMO/Medical Board)", "BPL Ration Card or Income Certificate", "Bank Account (Aadhaar-linked)", "Age Proof (Voter ID / Birth Certificate)", "UP Residence / Domicile Proof", "Passport Photo"],
               hi: ["आधार कार्ड", "दिव्यांगता प्रमाण पत्र (40%+, CMO/चिकित्सा बोर्ड से)", "BPL राशन कार्ड या आय प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "आयु प्रमाण (मतदाता ID / जन्म प्रमाण पत्र)", "UP निवास प्रमाण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "disabled" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "up_parivarik_labh",
    icon: "🕊️", color: "#475569", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Social Welfare Dept.", hi: "उत्तर प्रदेश समाज कल्याण विभाग" },
    name:    { en: "Rashtriya Parivarik Labh Yojana (UP)",
               hi: "राष्ट्रीय पारिवारिक लाभ योजना (उत्तर प्रदेश)" },
    benefit: { en: "₹30,000 one-time financial assistance to BPL families on the death of the primary bread-earner (aged 18–60 years); amount transferred directly to the widow/family member's bank account; must apply within 1 year of death; covers both natural and accidental deaths",
               hi: "मुख्य कमाने वाले (18–60 वर्ष) की मृत्यु पर BPL परिवारों को ₹30,000 एकमुश्त सहायता; विधवा/परिवार सदस्य के बैंक खाते में सीधे; मृत्यु के 1 वर्ष के भीतर आवेदन करना अनिवार्य; प्राकृतिक और दुर्घटना दोनों प्रकार की मृत्यु कवर" },
    tag:     { en: "BPL / Death of Bread-earner", hi: "BPL / मुखिया की मृत्यु" },
    annual: 30000,
    apply:   { en: "https://www.myscheme.gov.in/schemes/nfbsup", hi: "nfbs.upsdc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (deceased and applicant)", "Death Certificate of bread-earner", "BPL Ration Card or Income Certificate (annual income < ₹46,080 rural / ₹56,460 urban)", "Age Proof of deceased (18–60 years)", "Bank Account of widow/applicant (Aadhaar-linked)", "UP Residence Proof", "Relationship Proof (widow/son/daughter)", "Passport Photo (applicant)"],
               hi: ["आधार कार्ड (मृतक और आवेदक का)", "मुखिया का मृत्यु प्रमाण पत्र", "BPL राशन कार्ड या आय प्रमाण (वार्षिक ₹46,080 ग्रामीण/₹56,460 शहरी से कम)", "मृतक का आयु प्रमाण (18–60 वर्ष)", "विधवा/आवेदक का बैंक खाता (आधार-लिंक्ड)", "UP निवास प्रमाण", "संबंध प्रमाण (विधवा/पुत्र/पुत्री)", "पासपोर्ट फोटो (आवेदक)"] },
    match: (a) => a.state === "Uttar Pradesh" && ["below1","1to3"].includes(a.income),
  },

  // ── STUDENT / YOUTH / EDUCATION ───────────────────────────────────────────

  {
    id: "up_free_tablet",
    icon: "📱", color: "#1D4ED8", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP IT & Electronics Dept.", hi: "उत्तर प्रदेश IT और इलेक्ट्रॉनिक्स विभाग" },
    name:    { en: "UP Free Smartphone / Tablet Yojana (DigiShakti)",
               hi: "यूपी मुफ्त स्मार्टफोन/टैबलेट योजना (DigiShakti)" },
    benefit: { en: "Free smartphone or tablet with pre-loaded content and 1-year data SIM for youth currently enrolled in graduation, post-graduation, diploma, ITI, polytechnic, or other skill development courses in UP; device worth approx. ₹12,000 distributed directly through college/institute; scheme covers all categories — SC/ST/OBC/General",
               hi: "UP में स्नातक, स्नातकोत्तर, डिप्लोमा, ITI, पॉलिटेक्निक या अन्य कौशल विकास पाठ्यक्रमों में नामांकित युवाओं को प्री-लोडेड कंटेंट और 1 वर्ष की डेटा SIM के साथ मुफ्त स्मार्टफोन/टैबलेट; लगभग ₹12,000 मूल्य का डिवाइस कॉलेज/संस्था के माध्यम से; SC/ST/OBC/सामान्य सभी श्रेणियां पात्र" },
    tag:     { en: "Student / Youth / Technology", hi: "छात्र / युवा / तकनीक" },
    annual: 12000,
    apply:   { en: "https://negd.gov.in/isl/Directory/statedata/207", hi: "digishakti.up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "College / Institute Enrollment Certificate (current session)", "UP Domicile / Residence Proof", "Bank Account (Aadhaar-linked)", "Student ID Card", "Passport Photo", "Mobile Number (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "कॉलेज/संस्था नामांकन प्रमाण पत्र (वर्तमान सत्र)", "UP अधिवास/निवास प्रमाण", "बैंक खाता (आधार-लिंक्ड)", "छात्र पहचान पत्र", "पासपोर्ट फोटो", "मोबाइल नंबर (आधार-लिंक्ड)"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "student",
  },

  {
    id: "up_abhyudaya",
    icon: "🎓", color: "#0369A1", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Planning Dept. (Divisional Level Centres)", hi: "उत्तर प्रदेश योजना विभाग (मंडल स्तरीय केंद्र)" },
    name:    { en: "Mukhyamantri Abhyudaya Yojana — Free Coaching (UP)",
               hi: "मुख्यमंत्री अभ्युदय योजना — निःशुल्क कोचिंग (उत्तर प्रदेश)" },
    benefit: { en: "Completely free coaching for competitive exams — UPSC (IAS/IPS/IFS), UPPSC/PCS, JEE, NEET, NDA, CDS, SSC, Banking (PO/Clerk), UPSSSC, TET and other recruitment exams; direct mentorship by serving IAS/PCS officers; free digital library and study materials; both online classes and offline batches at divisional centres across UP; no fees at any stage",
               hi: "प्रतियोगी परीक्षाओं के लिए पूर्णतः निःशुल्क कोचिंग — UPSC (IAS/IPS/IFS), UPPSC/PCS, JEE, NEET, NDA, CDS, SSC, बैंकिंग (PO/क्लर्क), UPSSSC, TET व अन्य भर्ती परीक्षाएं; सेवारत IAS/PCS अधिकारियों द्वारा सीधी मेंटरशिप; निःशुल्क डिजिटल पुस्तकालय व अध्ययन सामग्री; UP के मंडल केंद्रों पर ऑनलाइन व ऑफलाइन बैचें; किसी भी स्तर पर शुल्क नहीं" },
    tag:     { en: "Student / Free Coaching", hi: "छात्र / निःशुल्क कोचिंग" },
    annual: 0,
    apply:   { en: "https://www.govtschemes.in/chief-minister-abhyuday-scheme", hi: "abhyuday.up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "UP Domicile / Residence Proof", "Educational Qualification Certificate (as per exam targeted)", "Age Proof (as per exam eligibility)", "Passport Photo", "Mobile Number (Aadhaar-linked)"],
               hi: ["आधार कार्ड", "UP अधिवास/निवास प्रमाण", "शैक्षिक योग्यता प्रमाण पत्र (लक्षित परीक्षा के अनुसार)", "आयु प्रमाण (परीक्षा पात्रता के अनुसार)", "पासपोर्ट फोटो", "मोबाइल नंबर (आधार-लिंक्ड)"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "student",
  },

  {
    id: "up_internship",
    icon: "💼", color: "#0F766E", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Sewayojan / Labour Dept.", hi: "उत्तर प्रदेश सेवायोजन / श्रम विभाग" },
    name:    { en: "UP Internship Scheme (Mukhyamantri Shishushiksha)",
               hi: "यूपी इंटर्नशिप योजना (मुख्यमंत्री शिक्षुता)" },
    benefit: { en: "₹2,500/month stipend for 6 months to 1 year internship with government departments or private sector companies; technical/engineering interns get ₹2,500/month (state contribution ₹1,500 + company ₹1,000); non-technical interns get ₹2,500/month; placement assistance after training completion; open to 10th/12th pass and graduates from UP",
               hi: "सरकारी विभागों या निजी कंपनियों के साथ 6 माह से 1 वर्ष की इंटर्नशिप के लिए ₹2,500/माह वजीफा; तकनीकी/इंजीनियरिंग इंटर्न को ₹2,500/माह (राज्य ₹1,500 + कंपनी ₹1,000); गैर-तकनीकी इंटर्न को ₹2,500/माह; प्रशिक्षण पूरा होने के बाद प्लेसमेंट सहायता; UP के 10वीं/12वीं पास व स्नातकों के लिए खुला" },
    tag:     { en: "Youth / Employment / Internship", hi: "युवा / रोजगार / इंटर्नशिप" },
    annual: 30000,
    apply:   { en: "https://sewayojan.up.nic.in", hi: "sewayojan.up.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Qualification Certificate (10th / 12th / Degree)", "UP Domicile / Residence Proof", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number (Aadhaar-linked)", "Sewayojan Portal Registration"],
               hi: ["आधार कार्ड", "शैक्षिक योग्यता प्रमाण पत्र (10वीं / 12वीं / डिग्री)", "UP अधिवास/निवास प्रमाण", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर (आधार-लिंक्ड)", "सेवायोजन पोर्टल पंजीकरण"] },
    match: (a) => a.state === "Uttar Pradesh" && (a.who === "student" || (a.who === "business" && ["18to35"].includes(a.age))),
  },

  // ── ENTREPRENEURSHIP / EMPLOYMENT ─────────────────────────────────────────

  {
    id: "up_vishwakarma_shram",
    icon: "🔨", color: "#B45309", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP MSME & Export Promotion Dept.", hi: "उत्तर प्रदेश MSME एवं निर्यात प्रोत्साहन विभाग" },
    name:    { en: "Vishwakarma Shram Samman Yojana (UP)",
               hi: "विश्वकर्मा श्रम सम्मान योजना (उत्तर प्रदेश)" },
    benefit: { en: "₹10,000 to ₹10 lakh financial assistance for traditional artisans and craftsmen to establish or scale small industries + free 6-day skill training at government centres; covers carpenters, tailors, barbers, goldsmiths, potters, basket weavers, cobblers, blacksmiths, hawkers, and other traditional trades; toolkit provided; amount transferred directly to bank account",
               hi: "पारंपरिक कारीगरों व दस्तकारों को छोटे उद्योग स्थापित/विस्तार हेतु ₹10,000 से ₹10 लाख वित्तीय सहायता + सरकारी केंद्रों पर निःशुल्क 6-दिन कौशल प्रशिक्षण; बढ़ई, दर्जी, नाई, सुनार, कुम्हार, बुनकर, मोची, लोहार, फेरीवाले व अन्य पारंपरिक शिल्पकार कवर; टूलकिट प्रदान; सीधे बैंक खाते में राशि" },
    tag:     { en: "Artisan / Self-employment / Skill", hi: "कारीगर / स्वरोजगार / कौशल" },
    annual: 0,
    apply:   { en: "http://msme1connect.up.gov.in", hi: "diupmsme.upsdc.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Proof of Traditional Trade / Craft (self-declaration or village certificate)", "UP Domicile / Residence Proof", "Bank Account (Aadhaar-linked)", "Caste Certificate (if SC/ST/OBC)", "Passport Photo", "Mobile Number"],
               hi: ["आधार कार्ड", "पारंपरिक व्यापार/शिल्प का प्रमाण (स्व-घोषणा या ग्राम प्रमाण पत्र)", "UP अधिवास/निवास प्रमाण", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (SC/ST/OBC हेतु)", "पासपोर्ट फोटो", "मोबाइल नंबर"] },
    match: (a) => a.state === "Uttar Pradesh" && (a.who === "business" || a.who === "labour"),
  },

  {
    id: "up_yuva_udyami",
    icon: "🚀", color: "#7C3AED", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP MSME Dept.", hi: "उत्तर प्रदेश MSME विभाग" },
    name:    { en: "Mukhyamantri Yuva Udyami Vikas Abhiyan (UP)",
               hi: "मुख्यमंत्री युवा उद्यमी विकास अभियान (उत्तर प्रदेश)" },
    benefit: { en: "Interest-free loan up to ₹5 lakh for youth (18–40 years) to start new micro-enterprises or self-employment ventures in manufacturing, service, or trade sector; government bears interest cost for loan repayment; scheme targets 1 lakh youth per year with goal of creating 10 lakh micro units in 10 years; minimum qualification Class 8 (preference to Class 12+)",
               hi: "विनिर्माण, सेवा या व्यापार क्षेत्र में नई सूक्ष्म इकाई/स्वरोजगार शुरू करने के लिए युवाओं (18–40 वर्ष) को ₹5 लाख तक ब्याज-मुक्त ऋण; सरकार ब्याज वहन करती है; प्रति वर्ष 1 लाख युवाओं को लक्षित, 10 वर्षों में 10 लाख सूक्ष्म इकाइयां बनाने का लक्ष्य; न्यूनतम योग्यता कक्षा 8 (कक्षा 12+ को प्राथमिकता)" },
    tag:     { en: "Youth / Entrepreneurship / MSME", hi: "युवा / उद्यमिता / MSME" },
    annual: 0,
    apply:   { en: "https://www.myscheme.gov.in/schemes/myuyb", hi: "msme.up.gov.in / जन सेवा केंद्र (CSC)" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Educational Certificate (Class 8 minimum)", "Age Proof (18–40 years)", "UP Domicile / Residence Proof", "Bank Account (Aadhaar-linked)", "Business Plan / Project Report", "Caste Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "शैक्षिक प्रमाण पत्र (न्यूनतम कक्षा 8)", "आयु प्रमाण (18–40 वर्ष)", "UP अधिवास/निवास प्रमाण", "बैंक खाता (आधार-लिंक्ड)", "व्यवसाय योजना / परियोजना रिपोर्ट", "जाति प्रमाण पत्र (यदि लागू)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "up_khet_suraksha",
    icon: "🌿", color: "#15803D", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Agriculture Dept.", hi: "उत्तर प्रदेश कृषि विभाग" },
    name:    { en: "Mukhyamantri Khet Suraksha Yojana (UP)",
               hi: "मुख्यमंत्री खेत सुरक्षा योजना (उत्तर प्रदेश)" },
    benefit: { en: "60% subsidy grant of up to ₹1.43 lakh per hectare for installation of solar-powered electric fencing around agricultural land; the 12-volt solar fence gives a mild, harmless shock to stray animals (Nilgai, monkeys, wild boars etc.) and triggers a siren alarm, protecting crops without harming animals; ₹50 crore budget allocated; for small and marginal farmers",
               hi: "कृषि भूमि के चारों ओर सौर ऊर्जा चालित विद्युत बाड़ लगाने के लिए 60% अनुदान ₹1.43 लाख प्रति हेक्टेयर तक; 12-वोल्ट सौर बाड़ आवारा पशुओं (नीलगाय, बंदर, जंगली सूअर आदि) को हल्का, हानिरहित झटका देती है और सायरन बजाती है — पशु को बिना नुकसान पहुंचाए फसल की रक्षा; ₹50 करोड़ बजट; छोटे व सीमांत किसानों के लिए" },
    tag:     { en: "Farmer / Crop Protection", hi: "किसान / फसल सुरक्षा" },
    annual: 143000,
    apply:   { en: "https://agriculture.up.gov.in", hi: "agriculture.up.gov.in / निकटतम कृषि विभाग कार्यालय" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Land Records / Khatauni (UP)", "Bank Account (Aadhaar-linked)", "UP Residence Proof", "Farmer Registration on UP Agriculture Portal", "Passport Photo"],
               hi: ["आधार कार्ड", "भूमि अभिलेख / खतौनी (UP)", "बैंक खाता (आधार-लिंक्ड)", "UP निवास प्रमाण", "UP कृषि पोर्टल पर किसान पंजीकरण", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "farmer",
  },

  // ADD MORE UTTAR PRADESH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "up_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Uttar Pradesh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Uttar Pradesh",
  // },

];
