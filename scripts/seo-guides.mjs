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
};
