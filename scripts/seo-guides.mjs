// scripts/seo-guides.mjs — "How to check status" + "Money not received?" guides
// ─────────────────────────────────────────────────────────────────────────────
// Hand-written, for the most-searched schemes only (people search "pm kisan
// status", "paise nahi aaye", "ayushman card kaise check kare"…). Kept to facts
// that are stable and checkable on the official portal; every guide ends by
// sending people to that portal. Review these when a scheme's process changes.
// Used by generate-scheme-pages.mjs.
// ─────────────────────────────────────────────────────────────────────────────

export const GUIDES_REVIEWED = "October 2026";

// Common to every cash-transfer scheme: money only reaches an Aadhaar-seeded,
// DBT-enabled bank account.
const DBT_EN = "Check that your Aadhaar is linked (seeded) to your bank account for DBT: on myaadhaar.uidai.gov.in → \"Bank Seeding Status\", or ask your bank branch.";
const DBT_HI = "जांचें कि आपका आधार बैंक खाते से DBT के लिए जुड़ा (seeded) है: myaadhaar.uidai.gov.in → \"Bank Seeding Status\" पर, या अपनी बैंक शाखा से पूछें।";

export const GUIDES = {
  pmkisan: {
    en: {
      status: [
        "Open pmkisan.gov.in and go to \"Know Your Status\" (Farmers Corner).",
        "Enter your registration number. If you don't know it, use \"Know your registration number\" with your mobile or Aadhaar number.",
        "Enter the captcha and the OTP sent to your registered mobile.",
        "You'll see each instalment, the date it was paid and any pending reason (for example eKYC or land seeding).",
      ],
      notReceived: [
        "eKYC not done — complete it on the portal with an OTP, at a CSC with your fingerprint, or by face authentication in the PM-Kisan app.",
        DBT_EN,
        "Land seeding not done — your land details must be verified by the state; ask your patwari / agriculture office.",
        "Name or bank details don't match Aadhaar — get them corrected at the agriculture office or CSC.",
        "Marked ineligible (for example income-tax payer or government employee in the family) — the status page shows the reason.",
      ],
      help: "PM-Kisan helpline: 155261 or 011-24300606.",
    },
    hi: {
      status: [
        "pmkisan.gov.in खोलें और \"Know Your Status\" (Farmers Corner) पर जाएं।",
        "अपना रजिस्ट्रेशन नंबर डालें। नंबर नहीं पता तो \"Know your registration number\" में मोबाइल या आधार नंबर से निकालें।",
        "कैप्चा और रजिस्टर्ड मोबाइल पर आया OTP डालें।",
        "हर किस्त, भुगतान की तारीख और रुकने का कारण (जैसे eKYC या लैंड सीडिंग) दिख जाएगा।",
      ],
      notReceived: [
        "eKYC नहीं हुआ — पोर्टल पर OTP से, CSC पर अंगूठे से, या PM-Kisan ऐप में फेस ऑथेंटिकेशन से पूरा करें।",
        DBT_HI,
        "लैंड सीडिंग नहीं हुई — ज़मीन का सत्यापन राज्य करता है; अपने पटवारी / कृषि कार्यालय से पूछें।",
        "नाम या बैंक विवरण आधार से मेल नहीं खाता — कृषि कार्यालय या CSC पर सही करवाएं।",
        "अपात्र चिह्नित (जैसे परिवार में आयकरदाता या सरकारी कर्मचारी) — स्टेटस पेज पर कारण लिखा होता है।",
      ],
      help: "PM-Kisan हेल्पलाइन: 155261 या 011-24300606।",
    },
  },

  ayushman: {
    en: {
      status: [
        "Open beneficiary.nha.gov.in (or the Ayushman app) and log in with your mobile number and OTP.",
        "Choose your state and search by Aadhaar, ration card / family ID or name.",
        "If your family is listed, you'll see each member's card status.",
        "Complete Aadhaar eKYC for each member, then download the Ayushman card.",
      ],
      notReceived: [
        "Name not in the list — eligibility comes from the SECC 2011 data and your state's own lists; ask at an empanelled hospital's Ayushman desk (Arogya Mitra) or a CSC.",
        "eKYC pending — do it in the app or at a CSC; the card is issued only after eKYC.",
        "Aged 70 or above — every senior citizen of 70+ can get the Ayushman Vay Vandana card, whatever the income.",
      ],
      help: "Ayushman Bharat helpline: 14555.",
    },
    hi: {
      status: [
        "beneficiary.nha.gov.in (या Ayushman ऐप) खोलें और मोबाइल नंबर व OTP से लॉगिन करें।",
        "अपना राज्य चुनें और आधार, राशन कार्ड / फैमिली ID या नाम से खोजें।",
        "परिवार सूची में है तो हर सदस्य के कार्ड की स्थिति दिखेगी।",
        "हर सदस्य का आधार eKYC करें, फिर आयुष्मान कार्ड डाउनलोड करें।",
      ],
      notReceived: [
        "सूची में नाम नहीं — पात्रता SECC 2011 डेटा और राज्य की सूचियों से तय होती है; सूचीबद्ध अस्पताल के आयुष्मान डेस्क (आरोग्य मित्र) या CSC पर पूछें।",
        "eKYC बाकी — ऐप में या CSC पर करें; कार्ड eKYC के बाद ही बनता है।",
        "70 वर्ष या उससे अधिक — 70+ के हर वरिष्ठ नागरिक को आय की परवाह किए बिना आयुष्मान वय वंदना कार्ड मिल सकता है।",
      ],
      help: "आयुष्मान भारत हेल्पलाइन: 14555।",
    },
  },

  nfsa_pds: {
    en: {
      status: [
        "Ration card status and details are on your state's food department portal — nfsa.gov.in lists the link for every state (\"Ration Card Details on State Portals\").",
        "Choose your district, block and fair price shop, or search by ration card number.",
        "The \"Mera Ration\" app shows your card, members and the ration you're entitled to anywhere in India (One Nation One Ration Card).",
      ],
      notReceived: [
        "Members' Aadhaar eKYC not done — get it done at your fair price shop on the ePoS machine.",
        "Card inactive, cancelled or a member's name removed — check on the state portal and apply for correction at the food / supply office.",
        "Fair price shop refusing ration — note the shop details and complain on your state food portal or helpline.",
      ],
      help: "Food & civil supplies helpline: 1967 in most states (some states use a 1800 number — see your state portal).",
    },
    hi: {
      status: [
        "राशन कार्ड की स्थिति आपके राज्य के खाद्य विभाग पोर्टल पर होती है — nfsa.gov.in पर हर राज्य का लिंक है (\"Ration Card Details on State Portals\")।",
        "अपना ज़िला, ब्लॉक और राशन दुकान चुनें, या राशन कार्ड नंबर से खोजें।",
        "\"Mera Ration\" ऐप में आपका कार्ड, सदस्य और मिलने वाला राशन दिखता है — पूरे भारत में (वन नेशन वन राशन कार्ड)।",
      ],
      notReceived: [
        "सदस्यों का आधार eKYC नहीं हुआ — राशन दुकान पर ePoS मशीन से करवाएं।",
        "कार्ड निष्क्रिय, रद्द या किसी सदस्य का नाम हटा — राज्य पोर्टल पर देखें और खाद्य / आपूर्ति कार्यालय में सुधार के लिए आवेदन करें।",
        "राशन दुकान राशन नहीं दे रही — दुकान का विवरण लिखें और राज्य खाद्य पोर्टल या हेल्पलाइन पर शिकायत करें।",
      ],
      help: "खाद्य एवं आपूर्ति हेल्पलाइन: ज़्यादातर राज्यों में 1967 (कुछ राज्यों में 1800 नंबर — अपने राज्य का पोर्टल देखें)।",
    },
  },

  e_shram: {
    en: {
      status: [
        "Open eshram.gov.in and choose Register / Login with the mobile number linked to your Aadhaar.",
        "Verify with the OTP and Aadhaar eKYC.",
        "After logging in you can update your details and download your e-Shram (UAN) card.",
      ],
      notReceived: [
        "Registering on e-Shram does not by itself pay a monthly amount. Messages promising money just for e-Shram registration are often fake — never share an OTP or pay anyone.",
        "Benefits come through linked schemes (for example PM Shram Yogi Maandhan pension or state worker schemes) — check what you qualify for.",
        "Mobile not linked to Aadhaar — register at a CSC with fingerprint authentication.",
      ],
      help: "e-Shram helpline: 14434.",
    },
    hi: {
      status: [
        "eshram.gov.in खोलें और आधार से जुड़े मोबाइल नंबर से Register / Login चुनें।",
        "OTP और आधार eKYC से सत्यापन करें।",
        "लॉगिन के बाद विवरण अपडेट करें और अपना ई-श्रम (UAN) कार्ड डाउनलोड करें।",
      ],
      notReceived: [
        "ई-श्रम पर रजिस्ट्रेशन से अपने आप कोई मासिक राशि नहीं मिलती। सिर्फ़ रजिस्ट्रेशन पर पैसे का वादा करने वाले संदेश अक्सर फर्जी होते हैं — कभी OTP न बताएं, न किसी को पैसे दें।",
        "लाभ जुड़ी योजनाओं से मिलते हैं (जैसे PM श्रम योगी मानधन पेंशन या राज्य की श्रमिक योजनाएं) — देखें आप किसके पात्र हैं।",
        "मोबाइल आधार से नहीं जुड़ा — CSC पर अंगूठे से रजिस्ट्रेशन करवाएं।",
      ],
      help: "ई-श्रम हेल्पलाइन: 14434।",
    },
  },

  maha_majhi_ladki_bahin: {
    en: {
      status: [
        "Open the official portal ladakibahin.maharashtra.gov.in and log in with your registered mobile number.",
        "Go to the applications section to see whether your application is approved, pending or rejected.",
        "Payments go by DBT to your Aadhaar-seeded bank account — check your bank passbook or SMS.",
      ],
      notReceived: [
        DBT_EN,
        "eKYC pending — complete the eKYC asked for on the official portal.",
        "Application rejected or under review — the portal shows the status; correct documents at the anganwadi / ward office.",
        "Eligibility — women aged 21 to 65 from Maharashtra with family income up to ₹2.5 lakh a year; families with an income-tax payer or government employee are not eligible.",
      ],
      help: "Women's helpline: 181. Use only the .gov.in portal — never pay agents.",
    },
    hi: {
      status: [
        "आधिकारिक पोर्टल ladakibahin.maharashtra.gov.in खोलें और रजिस्टर्ड मोबाइल नंबर से लॉगिन करें।",
        "आवेदन वाले हिस्से में देखें कि आवेदन स्वीकृत, लंबित या अस्वीकृत है।",
        "भुगतान DBT से आधार से जुड़े बैंक खाते में आता है — पासबुक या SMS देखें।",
      ],
      notReceived: [
        DBT_HI,
        "eKYC बाकी — आधिकारिक पोर्टल पर मांगा गया eKYC पूरा करें।",
        "आवेदन अस्वीकृत या जांच में — पोर्टल पर स्थिति दिखती है; दस्तावेज़ आंगनवाड़ी / वार्ड कार्यालय में सही करवाएं।",
        "पात्रता — महाराष्ट्र की 21 से 65 वर्ष की महिलाएं, परिवार की सालाना आय ₹2.5 लाख तक; परिवार में आयकरदाता या सरकारी कर्मचारी हो तो पात्र नहीं।",
      ],
      help: "महिला हेल्पलाइन: 181। केवल .gov.in पोर्टल का उपयोग करें — एजेंट को पैसे न दें।",
    },
  },

  mp_ladli_behna: {
    en: {
      status: [
        "Open cmladlibahna.mp.gov.in and choose \"Application & Payment Status\".",
        "Enter your application number or Samagra member ID and the captcha.",
        "Enter the OTP sent to your registered mobile to see approval and each payment.",
      ],
      notReceived: [
        DBT_EN,
        "Samagra ID eKYC not done — complete it at your gram panchayat / ward office or the Samagra portal.",
        "Application not approved or removed — check the reason on the status page and contact your gram panchayat / ward office.",
      ],
      help: "Contact your gram panchayat or ward office, or the helpline listed on cmladlibahna.mp.gov.in.",
    },
    hi: {
      status: [
        "cmladlibahna.mp.gov.in खोलें और \"आवेदन एवं भुगतान की स्थिति\" चुनें।",
        "अपना आवेदन क्रमांक या समग्र सदस्य ID और कैप्चा डालें।",
        "रजिस्टर्ड मोबाइल पर आया OTP डालें — स्वीकृति और हर भुगतान दिखेगा।",
      ],
      notReceived: [
        DBT_HI,
        "समग्र ID का eKYC नहीं हुआ — ग्राम पंचायत / वार्ड कार्यालय या समग्र पोर्टल पर पूरा करें।",
        "आवेदन स्वीकृत नहीं या हटाया गया — स्टेटस पेज पर कारण देखें और ग्राम पंचायत / वार्ड कार्यालय से संपर्क करें।",
      ],
      help: "अपनी ग्राम पंचायत या वार्ड कार्यालय से, या cmladlibahna.mp.gov.in पर दी गई हेल्पलाइन से संपर्क करें।",
    },
  },

  // ── Added October 2026 — more of the most-searched schemes ─────────────────
  pmawas_rural: {
    en: {
      status: [
        "Open pmayg.nic.in → \"Stakeholders\" → \"IAY / PMAYG Beneficiary\".",
        "Enter your PMAY-G registration number (on your sanction letter, or ask your gram panchayat).",
        "You'll see your sanction, each instalment paid and the house-construction stage. The AwaasApp shows the same.",
      ],
      notReceived: [
        "Instalments are paid stage by stage — the next one comes only after the geo-tagged photo of that construction stage is uploaded and approved. Ask your gram panchayat / block office if it's pending.",
        DBT_EN,
        "Name not in the list — selection comes from the Awaas+ survey / permanent wait list of your gram panchayat; ask the gram panchayat secretary.",
      ],
      help: "Your gram panchayat secretary or the Block Development Office.",
    },
    hi: {
      status: [
        "pmayg.nic.in खोलें → \"Stakeholders\" → \"IAY / PMAYG Beneficiary\"।",
        "अपना PMAY-G रजिस्ट्रेशन नंबर डालें (स्वीकृति पत्र पर होता है, या ग्राम पंचायत से पूछें)।",
        "स्वीकृति, हर किस्त का भुगतान और मकान निर्माण का चरण दिखेगा। AwaasApp में भी यही दिखता है।",
      ],
      notReceived: [
        "किस्तें निर्माण के चरण के हिसाब से मिलती हैं — उस चरण की जियो-टैग फोटो अपलोड और स्वीकृत होने के बाद ही अगली किस्त आती है। रुका हो तो ग्राम पंचायत / ब्लॉक कार्यालय से पूछें।",
        DBT_HI,
        "सूची में नाम नहीं — चयन आवास+ सर्वे / ग्राम पंचायत की स्थायी प्रतीक्षा सूची से होता है; ग्राम पंचायत सचिव से पूछें।",
      ],
      help: "अपने ग्राम पंचायत सचिव या ब्लॉक विकास कार्यालय से संपर्क करें।",
    },
  },

  pmay_urban2: {
    en: {
      status: [
        "Open pmay-urban.gov.in and use the application status / track option.",
        "Enter your application number (or the details asked) to see where your application is.",
        "You can also ask your municipality (Urban Local Body), which verifies and approves applications.",
      ],
      notReceived: [
        "Help for building a house is released in instalments after each construction stage is verified (geo-tagged) by the municipality.",
        "Interest subsidy on a home loan is credited to the loan account through your bank — ask the bank branch that gave the loan.",
        DBT_EN,
      ],
      help: "Your municipality / Urban Local Body PMAY cell, or the bank that gave your home loan.",
    },
    hi: {
      status: [
        "pmay-urban.gov.in खोलें और आवेदन की स्थिति / ट्रैक विकल्प इस्तेमाल करें।",
        "अपना आवेदन नंबर (या मांगी गई जानकारी) डालें — आवेदन कहां तक पहुंचा, दिखेगा।",
        "आप अपनी नगर पालिका / नगर निगम से भी पूछ सकते हैं, जो आवेदन की जांच और स्वीकृति करते हैं।",
      ],
      notReceived: [
        "घर बनाने की मदद किस्तों में मिलती है — नगर निकाय हर चरण की जांच (जियो-टैग) करता है, उसके बाद।",
        "होम लोन पर ब्याज सब्सिडी बैंक के ज़रिए लोन खाते में आती है — जिस बैंक से लोन लिया उस शाखा से पूछें।",
        DBT_HI,
      ],
      help: "अपनी नगर पालिका / नगर निगम का PMAY प्रकोष्ठ, या होम लोन देने वाला बैंक।",
    },
  },

  ujjwala: {
    en: {
      status: [
        "Ask your LPG distributor (Indane, Bharat Gas or HP Gas) with your application number — they process Ujjwala connections.",
        "Or check on pmuy.gov.in and your gas company's official app / website.",
        "Once approved, you get the connection, stove and first refill as per the scheme.",
      ],
      notReceived: [
        "Refill subsidy goes to your bank account — your LPG connection must be linked to Aadhaar and an Aadhaar-seeded bank account.",
        DBT_EN,
        "Complete Aadhaar eKYC (biometric) at your distributor if they ask for it — subsidy can stop until it's done.",
      ],
      help: "Your LPG distributor, or your gas company's official customer care.",
    },
    hi: {
      status: [
        "अपने LPG वितरक (इंडेन, भारत गैस या HP गैस) से आवेदन नंबर बताकर पूछें — उज्ज्वला कनेक्शन वही देते हैं।",
        "या pmuy.gov.in और अपनी गैस कंपनी के आधिकारिक ऐप / वेबसाइट पर देखें।",
        "स्वीकृति के बाद योजना के अनुसार कनेक्शन, चूल्हा और पहली रिफिल मिलती है।",
      ],
      notReceived: [
        "रिफिल सब्सिडी बैंक खाते में आती है — LPG कनेक्शन आधार से और आधार-सीडेड बैंक खाते से जुड़ा होना चाहिए।",
        DBT_HI,
        "वितरक मांगे तो आधार eKYC (बायोमेट्रिक) करवाएं — इसके बिना सब्सिडी रुक सकती है।",
      ],
      help: "अपना LPG वितरक, या गैस कंपनी का आधिकारिक कस्टमर केयर।",
    },
  },

  scholarship: {
    en: {
      status: [
        "Open scholarships.gov.in (National Scholarship Portal) and log in with your registration (OTR) number.",
        "Open your application to see its status — submitted, verified by your institute, by the district / state, or sanctioned and paid.",
        "Payment details are shown once the scholarship is sanctioned.",
      ],
      notReceived: [
        "Verification pending — your school / college must verify the application first, then the district or state. Ask your institute's nodal officer.",
        DBT_EN,
        "Renewal not done — continuing students must renew every year before the last date.",
      ],
      help: "NSP helpdesk: 0120-6619540, or your institute's scholarship nodal officer.",
    },
    hi: {
      status: [
        "scholarships.gov.in (राष्ट्रीय छात्रवृत्ति पोर्टल) खोलें और अपने रजिस्ट्रेशन (OTR) नंबर से लॉगिन करें।",
        "अपना आवेदन खोलें — स्थिति दिखेगी: जमा, संस्थान से सत्यापित, ज़िला / राज्य से सत्यापित, या स्वीकृत और भुगतान।",
        "छात्रवृत्ति स्वीकृत होने पर भुगतान की जानकारी दिखती है।",
      ],
      notReceived: [
        "सत्यापन बाकी — पहले स्कूल / कॉलेज आवेदन सत्यापित करता है, फिर ज़िला या राज्य। अपने संस्थान के नोडल अधिकारी से पूछें।",
        DBT_HI,
        "रिन्यूअल नहीं किया — पढ़ाई जारी रखने वाले छात्रों को हर साल आखिरी तारीख से पहले रिन्यू करना होता है।",
      ],
      help: "NSP हेल्पडेस्क: 0120-6619540, या अपने संस्थान के छात्रवृत्ति नोडल अधिकारी।",
    },
  },

  mgnrega: {
    en: {
      status: [
        "Open nrega.nic.in and go to the job card / reports section.",
        "Choose your state, district, block and gram panchayat to see the job card list.",
        "Open your job card to see work days, muster rolls and wage payments.",
      ],
      notReceived: [
        "Wages are paid to an Aadhaar-linked account — make sure your job card and bank account are linked to Aadhaar.",
        "Payment may be pending at the block (muster roll or payment order not processed) — ask the Gram Rozgar Sahayak or block Programme Officer.",
        "You can ask for work in writing at the gram panchayat and get a dated receipt — work should be given within 15 days.",
      ],
      help: "Your Gram Rozgar Sahayak, gram panchayat, or the block Programme Officer (MGNREGA).",
    },
    hi: {
      status: [
        "nrega.nic.in खोलें और जॉब कार्ड / रिपोर्ट वाले हिस्से में जाएं।",
        "अपना राज्य, ज़िला, ब्लॉक और ग्राम पंचायत चुनें — जॉब कार्ड की सूची दिखेगी।",
        "अपना जॉब कार्ड खोलें — काम के दिन, मस्टर रोल और मज़दूरी का भुगतान दिखेगा।",
      ],
      notReceived: [
        "मज़दूरी आधार से जुड़े खाते में आती है — जॉब कार्ड और बैंक खाता आधार से जुड़ा होना चाहिए।",
        "भुगतान ब्लॉक पर अटका हो सकता है (मस्टर रोल या भुगतान आदेश बाकी) — ग्राम रोज़गार सहायक या ब्लॉक कार्यक्रम अधिकारी से पूछें।",
        "ग्राम पंचायत में लिखित में काम मांगें और तारीख वाली रसीद लें — 15 दिन में काम मिलना चाहिए।",
      ],
      help: "अपने ग्राम रोज़गार सहायक, ग्राम पंचायत या ब्लॉक कार्यक्रम अधिकारी (मनरेगा) से संपर्क करें।",
    },
  },

  pmfby: {
    en: {
      status: [
        "Open pmfby.gov.in and choose the application status option.",
        "Enter the receipt / application number you got when your crop was insured.",
        "You'll see the policy details and, after a loss, the claim status.",
      ],
      notReceived: [
        "Crop loss must be reported within 72 hours — on the Crop Insurance app, to your bank / insurance company, or on the helpline 14447.",
        "Claims are paid after the loss is assessed (crop-cutting / survey) — this can take time after the season ends.",
        DBT_EN,
      ],
      help: "PMFBY / Krishi Rakshak helpline: 14447.",
    },
    hi: {
      status: [
        "pmfby.gov.in खोलें और आवेदन की स्थिति (application status) चुनें।",
        "फसल बीमा करवाते समय मिली रसीद / आवेदन संख्या डालें।",
        "पॉलिसी की जानकारी और नुकसान होने पर क्लेम की स्थिति दिखेगी।",
      ],
      notReceived: [
        "फसल नुकसान की सूचना 72 घंटे के अंदर दें — Crop Insurance ऐप पर, बैंक / बीमा कंपनी को, या हेल्पलाइन 14447 पर।",
        "क्लेम नुकसान के आकलन (फसल कटाई / सर्वे) के बाद मिलता है — सीज़न खत्म होने के बाद कुछ समय लग सकता है।",
        DBT_HI,
      ],
      help: "PMFBY / कृषि रक्षक हेल्पलाइन: 14447।",
    },
  },

  vriddhapension: {
    en: {
      status: [
        "Open nsap.nic.in and use the beneficiary search in the reports section (choose your state, district and area).",
        "Many states show old-age pension payments on their own social welfare / pension portal too.",
        "You can also check the credits in your bank or post office passbook.",
      ],
      notReceived: [
        DBT_EN,
        "Yearly life certificate / verification pending — complete it at the block / tehsil social welfare office, bank or CSC.",
        "Pension is paid by your state (the Centre adds its share) — the date can differ by state; ask the social welfare office.",
      ],
      help: "Your block / tehsil social welfare office.",
    },
    hi: {
      status: [
        "nsap.nic.in खोलें और रिपोर्ट वाले हिस्से में लाभार्थी खोज इस्तेमाल करें (राज्य, ज़िला और क्षेत्र चुनें)।",
        "कई राज्य अपने समाज कल्याण / पेंशन पोर्टल पर भी वृद्धावस्था पेंशन का भुगतान दिखाते हैं।",
        "आप बैंक या डाकघर की पासबुक में भी पैसे आने की जांच कर सकते हैं।",
      ],
      notReceived: [
        DBT_HI,
        "सालाना जीवन प्रमाण पत्र / सत्यापन बाकी — ब्लॉक / तहसील समाज कल्याण कार्यालय, बैंक या CSC पर करवाएं।",
        "पेंशन राज्य देता है (केंद्र अपना हिस्सा जोड़ता है) — तारीख राज्य के हिसाब से अलग हो सकती है; समाज कल्याण कार्यालय से पूछें।",
      ],
      help: "अपना ब्लॉक / तहसील समाज कल्याण कार्यालय।",
    },
  },

  apy: {
    en: {
      status: [
        "Your APY account (PRAN) is with your bank — ask the branch for a statement, or use its net-banking / app.",
        "You can also view the APY statement on the official NPS / APY record-keeping portal using your PRAN.",
        "Contributions are auto-debited every month / quarter from your savings account.",
      ],
      notReceived: [
        "Pension starts only after age 60 — before that you build the corpus with your contributions.",
        "Keep enough balance for the auto-debit; missed contributions attract a small penalty and the account can be frozen if left unpaid for long.",
        "If the subscriber dies, the spouse continues to get the pension; after both, the nominee gets the corpus — through the same bank.",
      ],
      help: "The bank branch where your APY account was opened.",
    },
    hi: {
      status: [
        "आपका APY खाता (PRAN) आपके बैंक में है — शाखा से स्टेटमेंट लें, या उसकी नेट-बैंकिंग / ऐप इस्तेमाल करें।",
        "आप अपने PRAN से आधिकारिक NPS / APY रिकॉर्ड पोर्टल पर भी APY स्टेटमेंट देख सकते हैं।",
        "अंशदान हर महीने / तिमाही बचत खाते से अपने आप कटता है।",
      ],
      notReceived: [
        "पेंशन 60 साल की उम्र के बाद ही शुरू होती है — उससे पहले आप अंशदान से राशि जमा करते हैं।",
        "ऑटो-डेबिट के लिए खाते में पैसे रखें; अंशदान छूटने पर थोड़ा जुर्माना लगता है और लंबे समय तक न भरने पर खाता रुक सकता है।",
        "सदस्य की मृत्यु पर पति / पत्नी को पेंशन मिलती रहती है; दोनों के बाद नॉमिनी को राशि मिलती है — उसी बैंक के ज़रिए।",
      ],
      help: "वह बैंक शाखा जहां आपका APY खाता खुला है।",
    },
  },

  sukanya: {
    en: {
      status: [
        "Check the balance in your Sukanya Samriddhi passbook at the post office or bank where the account was opened.",
        "If the bank / India Post (IPPB) app or net-banking is linked, you can see the balance there too.",
        "Interest is added once a year; the rate is set by the government every quarter.",
      ],
      notReceived: [
        "Deposit at least ₹250 every financial year — otherwise the account becomes 'default'; you can revive it with the missed deposits plus ₹50 penalty per year.",
        "Up to 50% can be withdrawn for the girl's higher education after she turns 18 or passes Class 10.",
        "The account matures 21 years after opening; it can also be closed for her marriage after age 18.",
      ],
      help: "The post office or bank branch where the account was opened.",
    },
    hi: {
      status: [
        "सुकन्या समृद्धि पासबुक में बैलेंस उसी डाकघर या बैंक में देखें जहां खाता खुला है।",
        "बैंक / इंडिया पोस्ट (IPPB) ऐप या नेट-बैंकिंग जुड़ी हो तो वहां भी बैलेंस दिखता है।",
        "ब्याज साल में एक बार जुड़ता है; दर सरकार हर तिमाही तय करती है।",
      ],
      notReceived: [
        "हर वित्त वर्ष कम से कम ₹250 जमा करें — नहीं तो खाता 'डिफ़ॉल्ट' हो जाता है; छूटी राशि और ₹50 प्रति वर्ष जुर्माना देकर फिर चालू कर सकते हैं।",
        "बेटी के 18 साल की होने या 10वीं पास करने के बाद उच्च शिक्षा के लिए 50% तक निकाल सकते हैं।",
        "खाता खुलने के 21 साल बाद पूरा होता है; 18 साल के बाद शादी के लिए भी बंद किया जा सकता है।",
      ],
      help: "वह डाकघर या बैंक शाखा जहां खाता खुला है।",
    },
  },

  pmsby: {
    en: {
      status: [
        "Check your bank passbook / statement for the yearly premium debit (around the end of May) — that means your cover is active.",
        "Cover runs from 1 June to 31 May and renews by auto-debit from your savings account.",
        "Your bank branch can confirm your enrolment and nominee.",
      ],
      notReceived: [
        "To claim, the nominee / insured submits the claim form with the required documents (such as FIR / post-mortem report for an accident death, or disability certificate) at the bank branch.",
        "Claim forms are on jansuraksha.gov.in and at the bank.",
        "No balance at renewal time means no premium was debited and the cover lapsed — keep balance in May.",
      ],
      help: "The bank branch where your savings account is.",
    },
    hi: {
      status: [
        "बैंक पासबुक / स्टेटमेंट में सालाना प्रीमियम कटने (लगभग मई के अंत में) की जांच करें — इसका मतलब बीमा चालू है।",
        "बीमा 1 जून से 31 मई तक रहता है और बचत खाते से ऑटो-डेबिट से रिन्यू होता है।",
        "आपकी बैंक शाखा नामांकन और नॉमिनी की पुष्टि कर सकती है।",
      ],
      notReceived: [
        "क्लेम के लिए नॉमिनी / बीमित व्यक्ति ज़रूरी दस्तावेज़ों (जैसे दुर्घटना मृत्यु में FIR / पोस्टमार्टम रिपोर्ट, या विकलांगता प्रमाण पत्र) के साथ क्लेम फॉर्म बैंक शाखा में जमा करें।",
        "क्लेम फॉर्म jansuraksha.gov.in पर और बैंक में मिलते हैं।",
        "रिन्यूअल के समय खाते में पैसे न हों तो प्रीमियम नहीं कटता और बीमा खत्म हो जाता है — मई में बैलेंस रखें।",
      ],
      help: "वह बैंक शाखा जहां आपका बचत खाता है।",
    },
  },

  pmjjby: {
    en: {
      status: [
        "Check your bank passbook / statement for the yearly premium debit (around the end of May) — that means your life cover is active.",
        "Cover runs from 1 June to 31 May and renews by auto-debit from your savings account.",
        "Your bank branch can confirm your enrolment and nominee.",
      ],
      notReceived: [
        "To claim, the nominee submits the claim form with the death certificate and other required documents at the bank branch.",
        "Claim forms are on jansuraksha.gov.in and at the bank.",
        "No balance at renewal time means the cover lapsed — keep balance in May.",
      ],
      help: "The bank branch where your savings account is.",
    },
    hi: {
      status: [
        "बैंक पासबुक / स्टेटमेंट में सालाना प्रीमियम कटने (लगभग मई के अंत में) की जांच करें — इसका मतलब जीवन बीमा चालू है।",
        "बीमा 1 जून से 31 मई तक रहता है और बचत खाते से ऑटो-डेबिट से रिन्यू होता है।",
        "आपकी बैंक शाखा नामांकन और नॉमिनी की पुष्टि कर सकती है।",
      ],
      notReceived: [
        "क्लेम के लिए नॉमिनी मृत्यु प्रमाण पत्र और बाकी ज़रूरी दस्तावेज़ों के साथ क्लेम फॉर्म बैंक शाखा में जमा करे।",
        "क्लेम फॉर्म jansuraksha.gov.in पर और बैंक में मिलते हैं।",
        "रिन्यूअल के समय खाते में पैसे न हों तो बीमा खत्म हो जाता है — मई में बैलेंस रखें।",
      ],
      help: "वह बैंक शाखा जहां आपका बचत खाता है।",
    },
  },

  pmsvanidhi: {
    en: {
      status: [
        "Open pmsvanidhi.mohua.gov.in and use the application status option with your mobile number.",
        "Approved applications go to the lending bank, which disburses the loan.",
        "Your municipality (Urban Local Body) confirms you are a street vendor (vending certificate / letter of recommendation).",
      ],
      notReceived: [
        "Pending with the municipality — ask the ULB town vending / PM SVANidhi cell to verify you.",
        "Pending with the bank — visit the branch shown in your application with your documents.",
        "The interest subsidy and digital cashback are credited to your account periodically when you repay on time and use digital payments.",
      ],
      help: "Your municipality / Urban Local Body PM SVANidhi cell, or the lending bank branch.",
    },
    hi: {
      status: [
        "pmsvanidhi.mohua.gov.in खोलें और मोबाइल नंबर से आवेदन की स्थिति देखें।",
        "स्वीकृत आवेदन ऋण देने वाले बैंक को जाते हैं, जो लोन देता है।",
        "आपकी नगर पालिका / नगर निगम पुष्टि करती है कि आप पथ विक्रेता हैं (वेंडिंग सर्टिफिकेट / सिफारिश पत्र)।",
      ],
      notReceived: [
        "नगर निकाय में अटका — नगर निकाय के टाउन वेंडिंग / PM SVANidhi प्रकोष्ठ से सत्यापन करवाएं।",
        "बैंक में अटका — आवेदन में दिखाई गई शाखा में दस्तावेज़ लेकर जाएं।",
        "समय पर किस्त भरने और डिजिटल भुगतान करने पर ब्याज सब्सिडी और डिजिटल कैशबैक समय-समय पर खाते में आते हैं।",
      ],
      help: "अपनी नगर पालिका / नगर निगम का PM SVANidhi प्रकोष्ठ, या ऋण देने वाली बैंक शाखा।",
    },
  },

  surya_ghar: {
    en: {
      status: [
        "Open pmsuryaghar.gov.in and log in with your state, electricity company, consumer number and mobile OTP.",
        "Your dashboard shows each step — feasibility, installation, net-meter, inspection and subsidy.",
        "Install only through a vendor registered on the portal.",
      ],
      notReceived: [
        "Subsidy is released after the rooftop system is installed, the net meter is fitted and the electricity company inspects it — and after you submit your bank details on the portal.",
        "Check the stage that is pending on your dashboard and contact the vendor or electricity company for that step.",
        DBT_EN,
      ],
      help: "PM Surya Ghar helpline: 15555, or your electricity company.",
    },
    hi: {
      status: [
        "pmsuryaghar.gov.in खोलें और राज्य, बिजली कंपनी, उपभोक्ता संख्या और मोबाइल OTP से लॉगिन करें।",
        "डैशबोर्ड पर हर चरण दिखेगा — फ़ीज़िबिलिटी, इंस्टॉलेशन, नेट-मीटर, निरीक्षण और सब्सिडी।",
        "इंस्टॉलेशन केवल पोर्टल पर पंजीकृत वेंडर से करवाएं।",
      ],
      notReceived: [
        "सब्सिडी तब मिलती है जब रूफटॉप सिस्टम लग जाए, नेट मीटर लग जाए और बिजली कंपनी निरीक्षण कर ले — और आप पोर्टल पर बैंक विवरण जमा करें।",
        "डैशबोर्ड पर कौन सा चरण बाकी है देखें और उसके लिए वेंडर या बिजली कंपनी से संपर्क करें।",
        DBT_HI,
      ],
      help: "PM सूर्य घर हेल्पलाइन: 15555, या अपनी बिजली कंपनी।",
    },
  },

  pmmvy: {
    en: {
      status: [
        "Ask your Anganwadi worker or ASHA — they register you and can tell the status of each instalment.",
        "You can also check on pmmvy.wcd.gov.in.",
        "Keep your Mother & Child Protection (MCP) card updated with check-ups and the child's vaccination.",
      ],
      notReceived: [
        "Each instalment needs its condition met — registration of pregnancy, antenatal check-up, and the child's birth registration / first vaccinations.",
        DBT_EN,
        "Name or Aadhaar details don't match the bank account — get them corrected through the Anganwadi worker.",
      ],
      help: "Your Anganwadi worker, ASHA, or the CDPO (ICDS) office of your block.",
    },
    hi: {
      status: [
        "अपनी आंगनवाड़ी कार्यकर्ता या आशा से पूछें — वही पंजीकरण करती हैं और हर किस्त की स्थिति बता सकती हैं।",
        "आप pmmvy.wcd.gov.in पर भी देख सकती हैं।",
        "मातृ एवं शिशु सुरक्षा (MCP) कार्ड में जांच और बच्चे के टीकाकरण की जानकारी अपडेट रखें।",
      ],
      notReceived: [
        "हर किस्त के लिए उसकी शर्त पूरी होनी चाहिए — गर्भावस्था का पंजीकरण, प्रसव पूर्व जांच, और बच्चे का जन्म पंजीकरण / पहले टीके।",
        DBT_HI,
        "नाम या आधार की जानकारी बैंक खाते से मेल नहीं खाती — आंगनवाड़ी कार्यकर्ता के ज़रिए सही करवाएं।",
      ],
      help: "अपनी आंगनवाड़ी कार्यकर्ता, आशा, या ब्लॉक का CDPO (ICDS) कार्यालय।",
    },
  },
};
