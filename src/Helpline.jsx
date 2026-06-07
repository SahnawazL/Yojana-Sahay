import { useState, useMemo, useRef } from "react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg:           "#060c18",
  surface:      "#0c1526",
  surfaceAlt:   "#101c30",
  border:       "rgba(255,255,255,0.06)",
  borderHover:  "rgba(255,255,255,0.13)",
  saffron:      "#FF9933",
  saffronDim:   "rgba(255,153,51,0.15)",
  green:        "#22c55e",
  white:        "#eef2ff",
  muted:        "#7d8fa8",
  mutedLight:   "#a8b8cc",
  glass:        "rgba(255,255,255,0.04)",
  glassHover:   "rgba(255,255,255,0.07)",
  red:          "#f87171",
  redBg:        "rgba(248,113,113,0.1)",
  shadow:       "0 4px 24px rgba(0,0,0,0.45)",
};

// ─── Category Config ─────────────────────────────────────────────────────────
const CATS = {
  all:        { label: "All",            labelHi: "सभी",                icon: "☰",   color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  emergency:  { label: "Emergency",      labelHi: "आपातकाल",            icon: "🚨",  color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  health:     { label: "Health",         labelHi: "स्वास्थ्य",           icon: "🏥",  color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  agriculture:{ label: "Agriculture",    labelHi: "कृषि",                icon: "🌾",  color: "#a3e635", bg: "rgba(163,230,53,0.12)"  },
  senior:     { label: "Senior Citizens",labelHi: "वरिष्ठ नागरिक",       icon: "🤝",  color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  identity:   { label: "Identity",       labelHi: "पहचान",              icon: "🆔",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  women:      { label: "Women & Child",  labelHi: "महिला व बाल",         icon: "👩‍👧", color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  consumer:   { label: "Consumer",       labelHi: "उपभोक्ता",            icon: "🛡️",  color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  labour:     { label: "Labour",         labelHi: "श्रम",                icon: "⚒️",  color: "#22d3ee", bg: "rgba(34,211,238,0.12)"  },
  energy:     { label: "LPG / Energy",   labelHi: "ऊर्जा",               icon: "🔥",  color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
  transport:  { label: "Transport",      labelHi: "परिवहन",              icon: "🚂",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  mental:     { label: "Mental Health",  labelHi: "मानसिक स्वास्थ्य",    icon: "🧠",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  education:  { label: "Education",      labelHi: "शिक्षा",              icon: "🎓",  color: "#2dd4bf", bg: "rgba(45,212,191,0.12)"  },
  schemes:    { label: "Gov Schemes",    labelHi: "सरकारी योजनाएं",      icon: "📋",  color: "#38bdf8", bg: "rgba(56,189,248,0.12)"  },
};

// ─── Helpline Data ────────────────────────────────────────────────────────────
const HELPLINES = [
  // ── EMERGENCY ──────────────────────────────────────────────
  {
    id: 1, number: "112", dialNumber: "112",
    name: "National Emergency Response System",
    nameHi: "राष्ट्रीय आपातकालीन सेवा",
    category: "emergency", national: true, tollFree: true,
    ministry: "Ministry of Home Affairs",
    ministryHi: "गृह मंत्रालय",
    purpose: "Single national number combining police, fire brigade and ambulance across all states.",
    purposeHi: "पुलिस, दमकल और एम्बुलेंस को एक ही नंबर से जोड़ने वाली राष्ट्रीय सेवा — सभी राज्यों में उपलब्ध।",
    whenToCall: [
      "Life-threatening situation needing police, fire, or ambulance",
      "Road accident requiring immediate multi-agency response",
      "Any emergency where you're unsure which service to call",
    ],
    whenToCallHi: [
      "जानलेवा स्थिति जिसमें पुलिस, दमकल या एम्बुलेंस की जरूरत हो",
      "सड़क दुर्घटना जिसमें तत्काल बहु-एजेंसी सहायता चाहिए",
      "कोई भी आपातकाल जब यह तय न हो कि किस सेवा को बुलाएं",
    ],
    doNotCall: "Non-emergency queries, lost documents, general complaints",
    doNotCallHi: "गैर-आपातकालीन प्रश्न, दस्तावेज़ खोना, सामान्य शिकायतें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },
  {
    id: 2, number: "100", dialNumber: "100",
    name: "Police Emergency", nameHi: "पुलिस हेल्पलाइन",
    category: "emergency", national: false, tollFree: true,
    ministry: "State Police Departments",
    ministryHi: "राज्य पुलिस विभाग",
    purpose: "Direct line to local police for active crimes and law & order situations.",
    purposeHi: "सक्रिय अपराध और कानून-व्यवस्था की स्थितियों के लिए स्थानीय पुलिस से सीधा संपर्क।",
    whenToCall: [
      "Crime in progress — theft, assault, robbery",
      "Witnessing a crime or suspicious activity",
      "Immediate police assistance needed",
    ],
    whenToCallHi: [
      "अपराध हो रहा हो — चोरी, मारपीट, डकैती",
      "किसी अपराध या संदिग्ध गतिविधि को देखना",
      "तत्काल पुलिस सहायता की आवश्यकता",
    ],
    doNotCall: "Lost documents or general advice — visit your local police station",
    doNotCallHi: "दस्तावेज़ खोना या सामान्य सलाह — अपने नज़दीकी थाने जाएं",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
    note: "State police; protocols may vary slightly by state",
    noteHi: "राज्य पुलिस; प्रक्रियाएं राज्य के अनुसार थोड़ी भिन्न हो सकती हैं",
  },
  {
    id: 3, number: "101", dialNumber: "101",
    name: "Fire Brigade", nameHi: "अग्निशमन सेवा",
    category: "emergency", national: false, tollFree: true,
    ministry: "State / Municipal Fire Departments",
    ministryHi: "राज्य / नगरपालिका अग्निशमन विभाग",
    purpose: "Immediate fire emergency dispatch — building fires, gas fires, industrial fires.",
    purposeHi: "तत्काल अग्नि आपातकाल सेवा — इमारत, गैस या औद्योगिक आग के लिए।",
    whenToCall: [
      "Active fire in any building, home, or vehicle",
      "LPG cylinder or gas pipeline fire",
      "Forest fire or industrial blaze requiring urgent response",
    ],
    whenToCallHi: [
      "किसी इमारत, घर या वाहन में सक्रिय आग लगी हो",
      "LPG सिलेंडर या गैस पाइपलाइन में आग",
      "जंगल या औद्योगिक आग जिसमें तत्काल प्रतिक्रिया चाहिए",
    ],
    doNotCall: "Fire safety certificates or advice — contact your local fire office",
    doNotCallHi: "अग्नि सुरक्षा प्रमाणपत्र या सलाह — अपने स्थानीय अग्निशमन कार्यालय से संपर्क करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },
  {
    id: 4, number: "108", dialNumber: "108",
    name: "Emergency Ambulance", nameHi: "आपातकालीन एम्बुलेंस",
    category: "emergency", national: false, tollFree: true,
    ministry: "State Health Departments (GVK EMRI)",
    ministryHi: "राज्य स्वास्थ्य विभाग (GVK EMRI)",
    purpose: "Free emergency ambulance available in most Indian states, operated 24×7.",
    purposeHi: "अधिकांश भारतीय राज्यों में 24×7 उपलब्ध मुफ्त आपातकालीन एम्बुलेंस सेवा।",
    whenToCall: [
      "Road or workplace accident with serious injuries",
      "Heart attack, stroke, or sudden collapse",
      "Obstetric emergency during delivery",
      "Serious injury or poisoning needing hospital transport immediately",
    ],
    whenToCallHi: [
      "सड़क या कार्यस्थल दुर्घटना में गंभीर चोट",
      "हृदयाघात, स्ट्रोक या अचानक बेहोशी",
      "प्रसव के दौरान प्रसूति आपातकाल",
      "गंभीर चोट या जहर खाने पर तत्काल अस्पताल पहुंचाने की जरूरत",
    ],
    doNotCall: "Routine / planned hospital transport — contact hospital directly",
    doNotCallHi: "नियमित / नियोजित अस्पताल परिवहन — सीधे अस्पताल से संपर्क करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
    note: "Some states also use 102 for maternal ambulance (obstetric emergencies)",
    noteHi: "कुछ राज्यों में प्रसूति आपातकाल के लिए 102 भी उपलब्ध है",
  },

  // ── HEALTH ─────────────────────────────────────────────────
  {
    id: 5, number: "104", dialNumber: "104",
    name: "National Health Helpline", nameHi: "राष्ट्रीय स्वास्थ्य हेल्पलाइन",
    category: "health", national: true, tollFree: true,
    ministry: "Ministry of Health & Family Welfare / NHM",
    ministryHi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय / NHM",
    purpose: "Free tele-consultation, medical advice, NHM scheme info, and mental health support — all in one call.",
    purposeHi: "एक ही कॉल में मुफ्त टेली-परामर्श, चिकित्सीय सलाह, NHM योजना जानकारी और मानसिक स्वास्थ्य सहायता।",
    whenToCall: [
      "Basic medical advice before visiting a doctor",
      "Finding nearest PHC, CHC, or district hospital",
      "Information on national or state health programmes",
      "Mental health support or emotional counselling",
      "Reporting a disease outbreak or public health concern",
    ],
    whenToCallHi: [
      "डॉक्टर के पास जाने से पहले बुनियादी चिकित्सीय सलाह",
      "निकटतम PHC, CHC या जिला अस्पताल ढूंढना",
      "राष्ट्रीय या राज्य स्वास्थ्य कार्यक्रमों की जानकारी",
      "मानसिक स्वास्थ्य सहायता या भावनात्मक परामर्श",
      "बीमारी फैलने की सूचना देना या सार्वजनिक स्वास्थ्य समस्या",
    ],
    doNotCall: "Life-threatening emergency — call 108 immediately, not 104",
    doNotCallHi: "जानलेवा आपातकाल — 104 नहीं, तुरंत 108 कॉल करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },
  {
    id: 6, number: "14555", dialNumber: "14555",
    name: "Ayushman Bharat PM-JAY", nameHi: "आयुष्मान भारत PM-JAY",
    category: "health", national: true, tollFree: true,
    ministry: "National Health Authority (NHA)",
    ministryHi: "राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA)",
    purpose: "PM-JAY health insurance — card issues, empanelled hospital finder, fraud reporting.",
    purposeHi: "PM-JAY स्वास्थ्य बीमा — कार्ड समस्याएं, सूचीबद्ध अस्पताल खोजना और धोखाधड़ी की शिकायत।",
    whenToCall: [
      "Ayushman card rejected at an empanelled hospital",
      "Finding nearest government-empanelled hospital",
      "Checking your family's eligibility or beneficiary status",
      "Reporting fraud or overcharging by a PM-JAY hospital",
    ],
    whenToCallHi: [
      "सूचीबद्ध अस्पताल में आयुष्मान कार्ड अस्वीकार किया गया हो",
      "निकटतम सरकारी सूचीबद्ध अस्पताल ढूंढना हो",
      "परिवार की पात्रता या लाभार्थी स्थिति जांचनी हो",
      "PM-JAY अस्पताल द्वारा धोखाधड़ी या अधिक शुल्क की शिकायत करनी हो",
    ],
    doNotCall: "Fresh card enrollment — visit Common Service Centre (CSC) or Ayushman Mitra",
    doNotCallHi: "नया कार्ड बनवाना — कॉमन सर्विस सेंटर (CSC) या आयुष्मान मित्र के पास जाएं",
    availability: "Working Hours · Mon–Sat",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार",
    note: "Verify this number at pmjay.gov.in if in doubt, as government helplines may be updated",
    noteHi: "संदेह होने पर pmjay.gov.in पर यह नंबर सत्यापित करें, सरकारी हेल्पलाइन नंबर बदल सकते हैं",
  },
  {
    id: 22, number: "1800-111-255", dialNumber: "1800111255",
    name: "Jan Aushadhi Helpline", nameHi: "जन औषधि हेल्पलाइन",
    category: "health", national: true, tollFree: true,
    ministry: "Bureau of Pharma PSUs of India (BPPI) / Ministry of Chemicals & Fertilizers",
    ministryHi: "भारत के फार्मा PSU ब्यूरो (BPPI) / रसायन एवं उर्वरक मंत्रालय",
    purpose: "Jan Aushadhi Kendra locations, generic medicine availability, quality complaints, and new Kendra franchise queries.",
    purposeHi: "जन औषधि केंद्र की जानकारी, जेनेरिक दवाओं की उपलब्धता, गुणवत्ता शिकायत और नया केंद्र खोलने की जानकारी।",
    whenToCall: [
      "Finding nearest Pradhan Mantri Jan Aushadhi Kendra (PMJAK)",
      "Generic medicine not available at a Jan Aushadhi store",
      "Quality complaint about a medicine purchased from a PMJAK",
      "Applying to open a Jan Aushadhi franchise outlet",
      "Medicine listed in Jan Aushadhi catalogue but not stocked locally",
    ],
    whenToCallHi: [
      "निकटतम प्रधानमंत्री जन औषधि केंद्र (PMJAK) ढूंढना हो",
      "जन औषधि स्टोर पर जेनेरिक दवा उपलब्ध न हो",
      "PMJAK से खरीदी दवा की गुणवत्ता शिकायत करनी हो",
      "जन औषधि फ्रेंचाइज़ी केंद्र खोलने के लिए आवेदन करना हो",
      "जन औषधि कैटलॉग में दर्ज दवा स्थानीय स्तर पर न मिले",
    ],
    doNotCall: "Ayushman Bharat card issues — call 14555; medicine emergencies — call 108",
    doNotCallHi: "आयुष्मान भारत कार्ड समस्या — 14555 कॉल करें; दवाई आपातकाल — 108 कॉल करें",
    availability: "Working Hours · Mon–Fri · 9 AM – 5:30 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शुक्रवार · सुबह 9 बजे – शाम 5:30 बजे",
    note: "Jan Aushadhi medicines are 50–90% cheaper than branded equivalents; over 2,000 medicines covered",
    noteHi: "जन औषधि दवाएं ब्रांडेड दवाओं से 50–90% सस्ती हैं; 2,000 से अधिक दवाएं शामिल हैं",
  },

  // ── AGRICULTURE ────────────────────────────────────────────
  {
    id: 7, number: "14422", dialNumber: "14422",
    name: "PM-KISAN Helpline", nameHi: "पीएम-किसान हेल्पलाइन",
    category: "agriculture", national: true, tollFree: true,
    ministry: "Ministry of Agriculture & Farmers' Welfare",
    ministryHi: "कृषि एवं किसान कल्याण मंत्रालय",
    purpose: "PM-KISAN installment issues, registration corrections, and beneficiary status.",
    purposeHi: "PM-KISAN किस्त समस्याएं, पंजीकरण सुधार और लाभार्थी स्थिति की जानकारी।",
    whenToCall: [
      "PM-KISAN installment not credited to your bank account",
      "Wrong name, bank account, or Aadhaar in PM-KISAN records",
      "Registration application rejected or stuck in pending",
      "Checking payment status or date of next installment",
    ],
    whenToCallHi: [
      "PM-KISAN की किस्त बैंक खाते में नहीं आई हो",
      "PM-KISAN रिकॉर्ड में नाम, बैंक खाता या आधार गलत हो",
      "पंजीकरण आवेदन अस्वीकार या लंबित हो",
      "भुगतान स्थिति या अगली किस्त की तारीख जाननी हो",
    ],
    doNotCall: "General farming advice — call Kisan Call Center 1800-180-1111 instead",
    doNotCallHi: "सामान्य खेती की सलाह — किसान कॉल सेंटर 1800-180-1111 पर कॉल करें",
    availability: "Working Hours · Mon–Sat",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार",
  },
  {
    id: 8, number: "1800-180-1111", dialNumber: "18001801111",
    name: "Kisan Call Center (KCC)", nameHi: "किसान कॉल सेंटर",
    category: "agriculture", national: true, tollFree: true,
    ministry: "Ministry of Agriculture & Farmers' Welfare",
    ministryHi: "कृषि एवं किसान कल्याण मंत्रालय",
    purpose: "Free expert farming advice on crops, seeds, pests, soil, water, and agri-schemes — in local languages.",
    purposeHi: "फसल, बीज, कीट, मिट्टी, पानी और कृषि योजनाओं पर स्थानीय भाषाओं में मुफ्त विशेषज्ञ सलाह।",
    whenToCall: [
      "Crop disease, pest attack, or unexpected crop failure",
      "Advice on fertilizer, seeds, or irrigation for your crop",
      "Information on any central or state agricultural scheme",
      "Soil health, organic farming, or weather-related queries",
    ],
    whenToCallHi: [
      "फसल में बीमारी, कीट हमला या अचानक फसल बर्बादी",
      "उर्वरक, बीज या सिंचाई पर सलाह चाहिए",
      "किसी केंद्रीय या राज्य कृषि योजना की जानकारी",
      "मिट्टी की सेहत, जैविक खेती या मौसम से जुड़े प्रश्न",
    ],
    doNotCall: "PM-KISAN payment problems — call dedicated helpline 14422",
    doNotCallHi: "PM-KISAN भुगतान समस्या — समर्पित हेल्पलाइन 14422 पर कॉल करें",
    availability: "24×7 · All Days · 22 Languages",
    availabilityHi: "24×7 · सभी दिन · 22 भाषाओं में",
    note: "Answered by agriculture graduates & experts; available in all major Indian languages",
    noteHi: "कृषि स्नातक और विशेषज्ञों द्वारा उत्तर; सभी प्रमुख भारतीय भाषाओं में उपलब्ध",
  },
  {
    id: 21, number: "14447", dialNumber: "14447",
    name: "PM Fasal Bima Yojana (PMFBY)", nameHi: "प्रधानमंत्री फसल बीमा योजना",
    category: "agriculture", national: true, tollFree: true,
    ministry: "Ministry of Agriculture & Farmers' Welfare",
    ministryHi: "कृषि एवं किसान कल्याण मंत्रालय",
    purpose: "Crop insurance grievances under PMFBY — claim delays, rejection, premium deduction issues, and enrollment queries.",
    purposeHi: "PMFBY के तहत फसल बीमा शिकायतें — दावे में देरी, अस्वीकृति, प्रीमियम कटौती समस्याएं और नामांकन संबंधी प्रश्न।",
    whenToCall: [
      "Crop loss occurred but insurance claim not initiated or stuck",
      "Claim amount not received even after approval",
      "Premium deducted from account without enrolling in PMFBY",
      "Want to know if your crop is covered under PMFBY this season",
      "Reporting crop damage after natural calamity for survey",
    ],
    whenToCallHi: [
      "फसल बर्बाद हुई लेकिन बीमा दावा शुरू नहीं हुआ या अटका हो",
      "स्वीकृति के बाद भी दावे की राशि नहीं मिली हो",
      "PMFBY में नामांकन किए बिना खाते से प्रीमियम काट लिया गया हो",
      "जानना हो कि इस सीजन में आपकी फसल PMFBY में शामिल है या नहीं",
      "प्राकृतिक आपदा के बाद सर्वेक्षण के लिए फसल नुकसान की सूचना देनी हो",
    ],
    doNotCall: "PM-KISAN installment problems — call 14422 instead",
    doNotCallHi: "PM-KISAN किस्त समस्या — इसके बजाय 14422 पर कॉल करें",
    availability: "Working Hours · Mon–Sat",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार",
    note: "State agriculture departments handle actual claims; use 14447 to escalate if state is unresponsive",
    noteHi: "राज्य कृषि विभाग वास्तविक दावे संभालते हैं; राज्य से प्रतिक्रिया न मिले तो 14447 पर एस्केलेट करें",
  },

  // ── SENIOR CITIZENS ────────────────────────────────────────
  {
    id: 9, number: "14567", dialNumber: "14567",
    name: "ELDERLINE", nameHi: "एल्डरलाइन – वरिष्ठ नागरिक हेल्पलाइन",
    category: "senior", national: true, tollFree: true,
    ministry: "Ministry of Social Justice & Empowerment",
    ministryHi: "सामाजिक न्याय एवं अधिकारिता मंत्रालय",
    purpose: "Support, rescue, and referral for senior citizens facing abuse, neglect, loneliness, or financial fraud.",
    purposeHi: "दुर्व्यवहार, उपेक्षा, अकेलेपन या वित्तीय धोखाधड़ी का सामना कर रहे वरिष्ठ नागरिकों के लिए सहायता, बचाव और रेफरल।",
    whenToCall: [
      "Senior citizen facing domestic abuse or family neglect",
      "Elderly person subject to property fraud or financial exploitation",
      "Old age pension or senior welfare scheme not received",
      "Need referral to old age home or government welfare services",
      "Elderly person found alone, abandoned, or in distress",
    ],
    whenToCallHi: [
      "वरिष्ठ नागरिक घरेलू हिंसा या पारिवारिक उपेक्षा का शिकार हो",
      "बुजुर्ग व्यक्ति संपत्ति धोखाधड़ी या वित्तीय शोषण का शिकार हो",
      "वृद्धावस्था पेंशन या वरिष्ठ कल्याण योजना नहीं मिली",
      "वृद्धाश्रम या सरकारी कल्याण सेवाओं के लिए रेफरल चाहिए",
      "बुजुर्ग व्यक्ति अकेला, परित्यक्त या संकट में मिला हो",
    ],
    doNotCall: "Medical emergencies — call 108; active crime — call 100",
    doNotCallHi: "चिकित्सीय आपातकाल — 108 कॉल करें; सक्रिय अपराध — 100 कॉल करें",
    availability: "8 AM – 8 PM · All Days",
    availabilityHi: "सुबह 8 बजे – रात 8 बजे · सभी दिन",
  },

  // ── IDENTITY ───────────────────────────────────────────────
  {
    id: 10, number: "1947", dialNumber: "1947",
    name: "Aadhaar Helpline (UIDAI)", nameHi: "आधार हेल्पलाइन",
    category: "identity", national: true, tollFree: true,
    ministry: "Unique Identification Authority of India (UIDAI)",
    ministryHi: "भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)",
    purpose: "Aadhaar enrollment, name/address/DOB correction, mobile linking, biometric lock, and misuse reporting.",
    purposeHi: "आधार नामांकन, नाम/पता/जन्मतिथि सुधार, मोबाइल लिंकिंग, बायोमेट्रिक लॉक और दुरुपयोग की शिकायत।",
    whenToCall: [
      "Name, date of birth, or address needs correction in Aadhaar",
      "Mobile number or email not linked to Aadhaar",
      "Biometrics locked — need to unlock for authentication",
      "Aadhaar card lost — need e-Aadhaar download instructions",
      "Suspicious use of your Aadhaar number to be reported",
    ],
    whenToCallHi: [
      "आधार में नाम, जन्मतिथि या पता सुधारना हो",
      "आधार से मोबाइल नंबर या ईमेल लिंक नहीं है",
      "बायोमेट्रिक्स लॉक हो गया — प्रमाणीकरण के लिए अनलॉक करना हो",
      "आधार कार्ड खो गया — e-आधार डाउनलोड की जानकारी चाहिए",
      "आपके आधार नंबर का संदिग्ध उपयोग रिपोर्ट करना हो",
    ],
    doNotCall: "Scheme-specific Aadhaar issues — contact that scheme's own helpline",
    doNotCallHi: "योजना-विशिष्ट आधार समस्याएं — उस योजना की अपनी हेल्पलाइन से संपर्क करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },

  // ── WOMEN & CHILD ─────────────────────────────────────────
  {
    id: 11, number: "181", dialNumber: "181",
    name: "Women Helpline", nameHi: "महिला हेल्पलाइन",
    category: "women", national: true, tollFree: true,
    ministry: "Ministry of Women & Child Development",
    ministryHi: "महिला एवं बाल विकास मंत्रालय",
    purpose: "24×7 emergency support for women in distress — domestic violence, harassment, shelter, and legal aid.",
    purposeHi: "संकट में महिलाओं के लिए 24×7 आपातकालीन सहायता — घरेलू हिंसा, उत्पीड़न, आश्रय और कानूनी सहायता।",
    whenToCall: [
      "Domestic violence, physical abuse, or marital assault",
      "Sexual harassment, stalking, or molestation",
      "Dowry harassment, mental cruelty, or forced marriage",
      "Women trafficking or need of emergency shelter",
      "Legal guidance on women's rights",
    ],
    whenToCallHi: [
      "घरेलू हिंसा, शारीरिक दुर्व्यवहार या वैवाहिक हमला",
      "यौन उत्पीड़न, पीछा करना या छेड़छाड़",
      "दहेज उत्पीड़न, मानसिक क्रूरता या जबरन शादी",
      "महिला तस्करी या आपातकालीन आश्रय की जरूरत",
      "महिला अधिकारों पर कानूनी मार्गदर्शन",
    ],
    doNotCall: "General scheme info — visit nearest Anganwadi or WCD office",
    doNotCallHi: "सामान्य योजना जानकारी — निकटतम आंगनवाड़ी या WCD कार्यालय जाएं",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },
  {
    id: 12, number: "1098", dialNumber: "1098",
    name: "CHILDLINE India", nameHi: "चाइल्डलाइन इंडिया",
    category: "women", national: true, tollFree: true,
    ministry: "Ministry of Women & Child Development",
    ministryHi: "महिला एवं बाल विकास मंत्रालय",
    purpose: "Emergency support for any child (under 18) in distress — abuse, missing, trafficking, exploitation.",
    purposeHi: "संकट में किसी भी बच्चे (18 वर्ष से कम) के लिए आपातकालीन सहायता — दुर्व्यवहार, लापता, तस्करी, शोषण।",
    whenToCall: [
      "Child facing physical or sexual abuse",
      "Missing child or child found alone / abandoned",
      "Child labour or trafficking observed",
      "Child marriage being forced on a minor",
      "Runaway or orphaned child needing immediate help",
    ],
    whenToCallHi: [
      "बच्चे के साथ शारीरिक या यौन दुर्व्यवहार हो रहा हो",
      "बच्चा लापता हो या अकेला/परित्यक्त मिला हो",
      "बाल मजदूरी या तस्करी देखी गई हो",
      "नाबालिग पर जबरन बाल विवाह हो रहा हो",
      "भागे हुए या अनाथ बच्चे को तत्काल सहायता चाहिए",
    ],
    doNotCall: "Scholarship or school-related queries — contact district education authority",
    doNotCallHi: "छात्रवृत्ति या स्कूल से जुड़े प्रश्न — जिला शिक्षा प्राधिकरण से संपर्क करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },

  // ── CONSUMER ──────────────────────────────────────────────
  {
    id: 13, number: "1800-11-0001", dialNumber: "18001100001",
    name: "National Consumer Helpline", nameHi: "राष्ट्रीय उपभोक्ता हेल्पलाइन",
    category: "consumer", national: true, tollFree: true,
    ministry: "Ministry of Consumer Affairs, Food & Public Distribution",
    ministryHi: "उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय",
    purpose: "Consumer grievance redressal against any product, service, e-commerce, bank, insurance, or utility.",
    purposeHi: "किसी भी उत्पाद, सेवा, ई-कॉमर्स, बैंक, बीमा या उपयोगिता के खिलाफ उपभोक्ता शिकायत निवारण।",
    whenToCall: [
      "Defective product and seller refuses to replace or refund",
      "E-commerce fraud — order not delivered, fake product",
      "Overcharged on bill by telecom, electricity, or bank",
      "Insurance claim wrongly rejected or unreasonably delayed",
      "Misleading advertisement or unfair trade practice",
    ],
    whenToCallHi: [
      "खराब उत्पाद और विक्रेता बदलने या वापसी से मना कर रहा हो",
      "ई-कॉमर्स धोखाधड़ी — ऑर्डर नहीं आया, नकली उत्पाद",
      "टेलीकॉम, बिजली या बैंक ने अधिक बिल वसूला हो",
      "बीमा दावा गलत तरीके से अस्वीकार या अनुचित रूप से विलंबित",
      "भ्रामक विज्ञापन या अनुचित व्यापार व्यवहार",
    ],
    doNotCall: "Consumer complaint needing immediate police action — file FIR at police station directly",
    doNotCallHi: "तत्काल पुलिस कार्रवाई वाली शिकायत — सीधे थाने में FIR दर्ज करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },

  // ── LABOUR ────────────────────────────────────────────────
  {
    id: 14, number: "14566", dialNumber: "14566",
    name: "e-Shram Helpline", nameHi: "ई-श्रम हेल्पलाइन",
    category: "labour", national: true, tollFree: true,
    ministry: "Ministry of Labour & Employment",
    ministryHi: "श्रम एवं रोजगार मंत्रालय",
    purpose: "e-Shram card for unorganized workers — registration, updates, and linked welfare scheme queries.",
    purposeHi: "असंगठित श्रमिकों के लिए ई-श्रम कार्ड — पंजीकरण, अपडेट और जुड़ी कल्याण योजनाओं की जानकारी।",
    whenToCall: [
      "e-Shram card not generated after completing registration",
      "Need to update mobile number, address, or occupation",
      "Query about welfare schemes linked to your e-Shram card",
      "UAN under e-Shram not received",
    ],
    whenToCallHi: [
      "पंजीकरण पूरा होने के बाद भी ई-श्रम कार्ड नहीं बना हो",
      "मोबाइल नंबर, पता या पेशा अपडेट करना हो",
      "ई-श्रम कार्ड से जुड़ी कल्याण योजनाओं की जानकारी चाहिए",
      "ई-श्रम के तहत UAN नहीं मिला हो",
    ],
    doNotCall: "EPFO / organized sector (PF, pension) queries — call EPFO helpline 1800-118-005",
    doNotCallHi: "EPFO / संगठित क्षेत्र (PF, पेंशन) प्रश्न — EPFO हेल्पलाइन 1800-118-005 पर कॉल करें",
    availability: "Working Hours · Mon–Sat · 8 AM – 8 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार · सुबह 8 बजे – रात 8 बजे",
  },
  {
    id: 15, number: "1800-118-005", dialNumber: "1800118005",
    name: "EPFO Helpline", nameHi: "कर्मचारी भविष्य निधि संगठन",
    category: "labour", national: true, tollFree: true,
    ministry: "Employees' Provident Fund Organisation (EPFO)",
    ministryHi: "कर्मचारी भविष्य निधि संगठन (EPFO)",
    purpose: "PF balance, UAN activation, EPF withdrawal, pension (EPS), and employer compliance queries.",
    purposeHi: "PF बैलेंस, UAN सक्रियण, EPF निकासी, पेंशन (EPS) और नियोक्ता अनुपालन संबंधी प्रश्न।",
    whenToCall: [
      "PF withdrawal claim not processed or rejected",
      "UAN not activated or Aadhaar not seeded",
      "EPS (employee pension) not received after retirement",
      "PF account transfer stuck after changing jobs",
      "Employer not depositing your PF contribution",
    ],
    whenToCallHi: [
      "PF निकासी दावा प्रक्रिया में नहीं आया या अस्वीकार हुआ हो",
      "UAN सक्रिय नहीं हुआ या आधार सीड नहीं हुआ हो",
      "सेवानिवृत्ति के बाद EPS (कर्मचारी पेंशन) नहीं मिली हो",
      "नौकरी बदलने के बाद PF खाता ट्रांसफर अटका हो",
      "नियोक्ता आपका PF योगदान जमा नहीं कर रहा हो",
    ],
    doNotCall: "Unorganized workers' e-Shram queries — call 14566 instead",
    doNotCallHi: "असंगठित श्रमिकों की ई-श्रम जानकारी — इसके बजाय 14566 पर कॉल करें",
    availability: "Working Hours · Mon–Sat · 9:15 AM – 5:45 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार · सुबह 9:15 बजे – शाम 5:45 बजे",
  },

  // ── ENERGY ────────────────────────────────────────────────
  {
    id: 16, number: "1906", dialNumber: "1906",
    name: "LPG Emergency Helpline", nameHi: "एलपीजी आपातकालीन हेल्पलाइन",
    category: "energy", national: false, tollFree: true,
    ministry: "Ministry of Petroleum & Natural Gas",
    ministryHi: "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय",
    purpose: "LPG gas leak, cylinder fire, or any LPG-related safety emergency at home or shop.",
    purposeHi: "घर या दुकान में LPG गैस रिसाव, सिलेंडर में आग या किसी भी LPG से जुड़ी सुरक्षा आपात स्थिति।",
    whenToCall: [
      "Strong smell of gas from cylinder or pipeline",
      "LPG cylinder or stove on fire",
      "Suspected gas leak in kitchen or enclosed area",
    ],
    whenToCallHi: [
      "सिलेंडर या पाइपलाइन से गैस की तेज गंध आ रही हो",
      "LPG सिलेंडर या चूल्हे में आग लगी हो",
      "रसोई या बंद जगह में गैस रिसाव का संदेह हो",
    ],
    doNotCall: "Ujjwala Yojana new connection or subsidy — contact your LPG distributor",
    doNotCallHi: "उज्ज्वला योजना नया कनेक्शन या सब्सिडी — अपने LPG वितरक से संपर्क करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
    note: "Gas leak? Turn off cylinder valve → Open all windows → Do NOT touch electrical switches → Evacuate → Then call 1906",
    noteHi: "गैस रिसाव? सिलेंडर वाल्व बंद करें → सभी खिड़कियाँ खोलें → बिजली के स्विच न छुएं → बाहर निकलें → फिर 1906 कॉल करें",
  },

  // ── TRANSPORT ─────────────────────────────────────────────
  {
    id: 17, number: "139", dialNumber: "139",
    name: "Rail Madad – Railway Helpline", nameHi: "रेल मदद",
    category: "transport", national: true, tollFree: true,
    ministry: "Ministry of Railways / Indian Railways",
    ministryHi: "रेल मंत्रालय / भारतीय रेल",
    purpose: "Railway complaints, in-train security, medical emergencies while travelling, and grievances.",
    purposeHi: "रेलवे शिकायतें, ट्रेन में सुरक्षा, यात्रा के दौरान चिकित्सीय आपातकाल और अन्य समस्याएं।",
    whenToCall: [
      "Security threat or crime on a running train",
      "Medical emergency while travelling on a train",
      "Serious hygiene, food quality, or staff misconduct complaint",
      "Delay-related compensation or refund enquiry",
    ],
    whenToCallHi: [
      "चलती ट्रेन में सुरक्षा खतरा या अपराध",
      "ट्रेन में यात्रा के दौरान चिकित्सीय आपातकाल",
      "गंभीर स्वच्छता, खाना गुणवत्ता या कर्मचारी दुर्व्यवहार की शिकायत",
      "देरी से जुड़ा मुआवजा या वापसी की जानकारी",
    ],
    doNotCall: "Ticket booking — use IRCTC app/website; PNR status — SMS PNR to 139",
    doNotCallHi: "टिकट बुकिंग — IRCTC ऐप/वेबसाइट उपयोग करें; PNR स्थिति — 139 पर PNR SMS करें",
    availability: "24×7 · All Days",
    availabilityHi: "24×7 · सभी दिन",
  },

  // ── MENTAL HEALTH ─────────────────────────────────────────
  {
    id: 18, number: "9152987821", dialNumber: "9152987821",
    name: "iCall Mental Health Helpline", nameHi: "iCall मानसिक स्वास्थ्य",
    category: "mental", national: true, tollFree: false,
    ministry: "Tata Institute of Social Sciences (TISS), Mumbai",
    ministryHi: "टाटा सामाजिक विज्ञान संस्थान (TISS), मुंबई",
    purpose: "Free counselling by trained psychological counsellors for emotional distress, anxiety, and crisis support.",
    purposeHi: "प्रशिक्षित मनोवैज्ञानिक परामर्शदाताओं द्वारा भावनात्मक संकट, चिंता और आपातकालीन सहायता के लिए मुफ्त परामर्श।",
    whenToCall: [
      "Feeling depressed, anxious, or unable to cope",
      "Relationship issues, family conflict, or grief",
      "Suicidal thoughts or emotional crisis — call immediately",
      "Academic stress, career anxiety, or burnout",
    ],
    whenToCallHi: [
      "अवसाद, चिंता या सामना करने में असमर्थ महसूस हो",
      "रिश्तों की समस्या, पारिवारिक विवाद या शोक",
      "आत्मघाती विचार या भावनात्मक संकट — तुरंत कॉल करें",
      "पढ़ाई का तनाव, करियर की चिंता या थकान",
    ],
    doNotCall: "Psychiatric medication or diagnosis — visit a psychiatrist for those needs",
    doNotCallHi: "मनोचिकित्सा दवाएं या निदान — उन जरूरतों के लिए मनोचिकित्सक के पास जाएं",
    availability: "Mon–Sat · 8 AM – 10 PM",
    availabilityHi: "सोमवार–शनिवार · सुबह 8 बजे – रात 10 बजे",
    note: "Counselling in English, Hindi, and some regional languages. Confidential.",
    noteHi: "अंग्रेजी, हिंदी और कुछ क्षेत्रीय भाषाओं में परामर्श। पूरी तरह गोपनीय।",
  },
  {
    id: 19, number: "1860-2662-345", dialNumber: "18602662345",
    name: "Vandrevala Foundation", nameHi: "वंद्रेवाला फाउंडेशन",
    category: "mental", national: true, tollFree: false,
    ministry: "Vandrevala Foundation (NGO – Mental Health)",
    ministryHi: "वंद्रेवाला फाउंडेशन (NGO – मानसिक स्वास्थ्य)",
    purpose: "24×7 free crisis intervention and mental health counselling — completely anonymous and confidential.",
    purposeHi: "24×7 मुफ्त संकट हस्तक्षेप और मानसिक स्वास्थ्य परामर्श — पूरी तरह गुमनाम और गोपनीय।",
    whenToCall: [
      "Suicidal thoughts or active crisis — any time of day or night",
      "Grief, trauma, or loss you cannot cope with alone",
      "Severe emotional breakdown with no one to talk to",
      "Any mental health emergency requiring immediate support",
    ],
    whenToCallHi: [
      "आत्मघाती विचार या सक्रिय संकट — दिन या रात किसी भी समय",
      "शोक, आघात या हानि जिसे अकेले सहन नहीं कर पा रहे",
      "गंभीर भावनात्मक टूटन और बात करने वाला कोई नहीं",
      "तत्काल सहायता की जरूरत वाला कोई भी मानसिक स्वास्थ्य आपातकाल",
    ],
    doNotCall: "Psychiatric medication, diagnosis, or hospitalization — go to nearest govt hospital",
    doNotCallHi: "मनोचिकित्सा दवाएं, निदान या अस्पताल में भर्ती — निकटतम सरकारी अस्पताल जाएं",
    availability: "24×7 · All Days · Confidential",
    availabilityHi: "24×7 · सभी दिन · गोपनीय",
  },

  // ── EDUCATION ─────────────────────────────────────────────
  {
    id: 20, number: "0120-6619540", dialNumber: "01206619540",
    name: "National Scholarship Portal (NSP)", nameHi: "राष्ट्रीय छात्रवृत्ति पोर्टल",
    category: "education", national: true, tollFree: false,
    ministry: "Ministry of Education / National Informatics Centre (NIC)",
    ministryHi: "शिक्षा मंत्रालय / राष्ट्रीय सूचना विज्ञान केंद्र (NIC)",
    purpose: "NSP scholarship application errors, login issues, payment status, and document upload problems.",
    purposeHi: "NSP छात्रवृत्ति आवेदन त्रुटियां, लॉगिन समस्याएं, भुगतान स्थिति और दस्तावेज़ अपलोड की परेशानियां।",
    whenToCall: [
      "NSP application not submitting or showing technical error",
      "Scholarship payment approved but not credited",
      "Document upload failing or verification stuck for long",
      "Forgot NSP login credentials or OTP not receiving",
      "Scholarship status stuck on 'Under Institute Verification'",
    ],
    whenToCallHi: [
      "NSP आवेदन सबमिट नहीं हो रहा या तकनीकी त्रुटि आ रही हो",
      "छात्रवृत्ति भुगतान स्वीकृत हो लेकिन क्रेडिट न हुआ हो",
      "दस्तावेज़ अपलोड विफल हो रहा हो या सत्यापन लंबे समय से अटका हो",
      "NSP लॉगिन जानकारी भूल गए हों या OTP नहीं आ रहा हो",
      "छात्रवृत्ति स्थिति 'संस्थान सत्यापन में' पर अटकी हो",
    ],
    doNotCall: "State-specific scholarships not on NSP — contact your state scholarship board directly",
    doNotCallHi: "NSP पर न आने वाली राज्य-विशिष्ट छात्रवृत्तियां — सीधे राज्य छात्रवृत्ति बोर्ड से संपर्क करें",
    availability: "Working Hours · Mon–Fri · 9 AM – 6 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शुक्रवार · सुबह 9 बजे – शाम 6 बजे",
    note: "Also reachable via email: helpdesk@nsp.gov.in for written complaints",
    noteHi: "लिखित शिकायतों के लिए helpdesk@nsp.gov.in ईमेल पर भी संपर्क किया जा सकता है",
  },

  // ── GOV SCHEMES ───────────────────────────────────────────
  {
    id: 23, number: "1800-11-3377", dialNumber: "18001133377",
    name: "PM Awas Yojana – Urban (PMAY-U)", nameHi: "प्रधानमंत्री आवास योजना – शहरी",
    category: "schemes", national: true, tollFree: true,
    ministry: "Ministry of Housing & Urban Affairs",
    ministryHi: "आवास एवं शहरी मामले मंत्रालय",
    purpose: "PM Awas Yojana (Urban) — application status, subsidy not credited, beneficiary list queries, and technical errors on PMAY portal.",
    purposeHi: "PM आवास योजना (शहरी) — आवेदन स्थिति, सब्सिडी न मिलना, लाभार्थी सूची संबंधी प्रश्न और PMAY पोर्टल पर तकनीकी त्रुटियां।",
    whenToCall: [
      "PMAY-U housing application approved but subsidy not credited to bank",
      "Name missing from beneficiary list despite eligible application",
      "Technical error on pmayuclap.gov.in during application",
      "Allotted house construction not started by local body",
      "Wanting to check application status or lodge a grievance",
    ],
    whenToCallHi: [
      "PMAY-U आवास आवेदन स्वीकृत हो लेकिन बैंक में सब्सिडी न आई हो",
      "पात्र आवेदन के बावजूद लाभार्थी सूची में नाम न हो",
      "आवेदन के दौरान pmayuclap.gov.in पर तकनीकी त्रुटि आए",
      "आवंटित घर का निर्माण स्थानीय निकाय ने शुरू न किया हो",
      "आवेदन स्थिति जांचनी हो या शिकायत दर्ज करानी हो",
    ],
    doNotCall: "PMAY (Rural/Gramin) queries — contact your Gram Panchayat or Pradhan; rural scheme is managed separately",
    doNotCallHi: "PMAY (ग्रामीण) प्रश्न — अपनी ग्राम पंचायत या प्रधान से संपर्क करें; ग्रामीण योजना अलग से प्रबंधित होती है",
    availability: "Working Hours · Mon–Sat",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार",
    note: "For PMAY-Gramin, approach your Block Development Officer (BDO) or Gram Panchayat directly",
    noteHi: "PMAY-ग्रामीण के लिए सीधे अपने खंड विकास अधिकारी (BDO) या ग्राम पंचायत से संपर्क करें",
  },
  {
    id: 24, number: "1800-11-0707", dialNumber: "18001100707",
    name: "MGNREGS – Job Guarantee Helpline", nameHi: "मनरेगा – रोजगार गारंटी हेल्पलाइन",
    category: "schemes", national: true, tollFree: true,
    ministry: "Ministry of Rural Development",
    ministryHi: "ग्रामीण विकास मंत्रालय",
    purpose: "MGNREGA job card, wage payment delays, work demand not registered, and muster roll discrepancies.",
    purposeHi: "मनरेगा जॉब कार्ड, मजदूरी भुगतान में देरी, काम की मांग दर्ज न होना और मस्टर रोल में गड़बड़ी।",
    whenToCall: [
      "Job card applied for but not issued or name missing",
      "Wages not received within 15 days of work completion",
      "Demanded work under MGNREGA but not provided within 15 days",
      "Muster roll attendance incorrect or tampered",
      "Reporting corruption or irregularities in MGNREGA implementation",
    ],
    whenToCallHi: [
      "जॉब कार्ड के लिए आवेदन किया लेकिन जारी नहीं हुआ या नाम गायब हो",
      "काम पूरा होने के 15 दिन बाद भी मजदूरी नहीं मिली हो",
      "मनरेगा में काम मांगा लेकिन 15 दिन में काम नहीं मिला हो",
      "मस्टर रोल में उपस्थिति गलत हो या छेड़छाड़ की गई हो",
      "मनरेगा कार्यान्वयन में भ्रष्टाचार या अनियमितता रिपोर्ट करनी हो",
    ],
    doNotCall: "Urban employment or EPFO queries — MGNREGS covers only rural areas",
    doNotCallHi: "शहरी रोजगार या EPFO प्रश्न — मनरेगा केवल ग्रामीण क्षेत्रों में लागू होती है",
    availability: "Working Hours · Mon–Fri",
    availabilityHi: "कार्यालय समय · सोमवार–शुक्रवार",
    note: "Every rural household is entitled to 100 days of guaranteed work per year under MGNREGA",
    noteHi: "मनरेगा के तहत प्रत्येक ग्रामीण परिवार को प्रति वर्ष 100 दिन के गारंटीशुदा काम का अधिकार है",
  },
  {
    id: 25, number: "1800-103-4786", dialNumber: "18001034786",
    name: "GST Helpline (CBIC)", nameHi: "जीएसटी हेल्पलाइन",
    category: "schemes", national: true, tollFree: true,
    ministry: "Central Board of Indirect Taxes & Customs (CBIC), Ministry of Finance",
    ministryHi: "केंद्रीय अप्रत्यक्ष कर एवं सीमा शुल्क बोर्ड (CBIC), वित्त मंत्रालय",
    purpose: "GST registration, return filing errors, GSTIN queries, refund delays, and e-way bill issues.",
    purposeHi: "GST पंजीकरण, रिटर्न दाखिल करने में त्रुटियां, GSTIN प्रश्न, रिफंड में देरी और ई-वे बिल की समस्याएं।",
    whenToCall: [
      "GST registration application rejected or stuck in pending",
      "GSTR return submission showing technical error on portal",
      "Input Tax Credit (ITC) mismatch or not reflecting",
      "GST refund applied for but not received",
      "E-way bill generation error or cancellation query",
      "Business received incorrect GST notice",
    ],
    whenToCallHi: [
      "GST पंजीकरण आवेदन अस्वीकार हो गया हो या लंबित हो",
      "GSTR रिटर्न सबमिशन पर पोर्टल में तकनीकी त्रुटि आए",
      "इनपुट टैक्स क्रेडिट (ITC) में मेल न हो या दिखाई न दे",
      "GST रिफंड के लिए आवेदन किया हो लेकिन मिला न हो",
      "ई-वे बिल जनरेशन में त्रुटि या रद्दीकरण संबंधी प्रश्न",
      "व्यवसाय को गलत GST नोटिस मिला हो",
    ],
    doNotCall: "Income tax (direct tax) queries — call Aaykar helpline 1800-103-0025 instead",
    doNotCallHi: "आयकर (प्रत्यक्ष कर) प्रश्न — इसके बजाय आयकर हेल्पलाइन 1800-103-0025 पर कॉल करें",
    availability: "Working Hours · Mon–Sat · 9 AM – 6 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार · सुबह 9 बजे – शाम 6 बजे",
    note: "Also reachable via helpdesk.gst.gov.in for chat and ticket-based support",
    noteHi: "चैट और टिकट आधारित सहायता के लिए helpdesk.gst.gov.in पर भी उपलब्ध",
  },
  {
    id: 26, number: "1800-103-0025", dialNumber: "18001030025",
    name: "Aaykar – Income Tax Helpline", nameHi: "आयकर हेल्पलाइन",
    category: "schemes", national: true, tollFree: true,
    ministry: "Income Tax Department, Ministry of Finance",
    ministryHi: "आयकर विभाग, वित्त मंत्रालय",
    purpose: "ITR filing help, refund status, Aadhaar-PAN linking, income tax notices, and e-filing portal issues.",
    purposeHi: "ITR दाखिल करने में सहायता, रिफंड स्थिति, आधार-PAN लिंकिंग, आयकर नोटिस और ई-फाइलिंग पोर्टल की समस्याएं।",
    whenToCall: [
      "ITR filed but refund not received after 6+ weeks",
      "Aadhaar and PAN not linked — returns not processing",
      "Received an income tax notice and need guidance",
      "Technical error on incometax.gov.in during e-filing",
      "Form 26AS / AIS mismatch with actual TDS deducted",
      "Forgot ITR e-filing password or unable to log in",
    ],
    whenToCallHi: [
      "ITR दाखिल किया लेकिन 6+ सप्ताह बाद भी रिफंड नहीं मिला हो",
      "आधार और PAN लिंक नहीं हैं — रिटर्न प्रोसेस नहीं हो रहे",
      "आयकर नोटिस मिला हो और मार्गदर्शन चाहिए",
      "ई-फाइलिंग के दौरान incometax.gov.in पर तकनीकी त्रुटि आए",
      "फॉर्म 26AS / AIS में वास्तविक TDS से मेल न हो",
      "ITR ई-फाइलिंग पासवर्ड भूल गए हों या लॉगिन न हो पा रहा हो",
    ],
    doNotCall: "GST or indirect tax queries — call CBIC GST helpline 1800-103-4786",
    doNotCallHi: "GST या अप्रत्यक्ष कर प्रश्न — CBIC GST हेल्पलाइन 1800-103-4786 पर कॉल करें",
    availability: "Working Hours · Mon–Sat · 8 AM – 8 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शनिवार · सुबह 8 बजे – रात 8 बजे",
    note: "PAN–Aadhaar linking is mandatory; unlinked PANs are inoperative and subject to higher TDS",
    noteHi: "PAN–आधार लिंकिंग अनिवार्य है; बिना लिंक PAN निष्क्रिय होते हैं और उन पर अधिक TDS लागू होता है",
  },
  {
    id: 27, number: "1800-110-708", dialNumber: "1800110708",
    name: "NPS / PFRDA Helpline", nameHi: "राष्ट्रीय पेंशन प्रणाली हेल्पलाइन",
    category: "schemes", national: true, tollFree: true,
    ministry: "Pension Fund Regulatory & Development Authority (PFRDA)",
    ministryHi: "पेंशन निधि नियामक एवं विकास प्राधिकरण (PFRDA)",
    purpose: "National Pension System — PRAN not activated, contribution not reflecting, nominee changes, partial withdrawal, and exit/annuity queries.",
    purposeHi: "राष्ट्रीय पेंशन प्रणाली — PRAN सक्रिय नहीं, योगदान नहीं दिख रहा, नॉमिनी बदलाव, आंशिक निकासी और निकास/वार्षिकी प्रश्न।",
    whenToCall: [
      "PRAN (Permanent Retirement Account Number) not generated or activated",
      "NPS contribution deducted from salary but not reflecting in account",
      "Want to update nominee or change fund manager / scheme preference",
      "Requesting partial withdrawal for medical, education, or home loan",
      "Confusion about exit process, annuity selection, or final withdrawal at retirement",
    ],
    whenToCallHi: [
      "PRAN (स्थायी सेवानिवृत्ति खाता संख्या) नहीं बना हो या सक्रिय न हुआ हो",
      "NPS योगदान वेतन से कटा हो लेकिन खाते में नहीं दिख रहा हो",
      "नॉमिनी अपडेट करना हो या फंड मैनेजर / योजना प्राथमिकता बदलनी हो",
      "चिकित्सा, शिक्षा या गृह ऋण के लिए आंशिक निकासी का अनुरोध करना हो",
      "सेवानिवृत्ति पर निकास प्रक्रिया, वार्षिकी चुनाव या अंतिम निकासी को लेकर भ्रम हो",
    ],
    doNotCall: "EPFO / EPF pension queries — call EPFO helpline 1800-118-005; PFRDA handles NPS only",
    doNotCallHi: "EPFO / EPF पेंशन प्रश्न — EPFO हेल्पलाइन 1800-118-005 पर कॉल करें; PFRDA केवल NPS संभालता है",
    availability: "Working Hours · Mon–Fri · 9 AM – 6 PM",
    availabilityHi: "कार्यालय समय · सोमवार–शुक्रवार · सुबह 9 बजे – शाम 6 बजे",
    note: "NPS is open to all Indian citizens (18–70 yrs); government employees are enrolled mandatorily under NPS Tier-I",
    noteHi: "NPS सभी भारतीय नागरिकों (18–70 वर्ष) के लिए खुला है; सरकारी कर्मचारी NPS Tier-I में अनिवार्य रूप से नामांकित हैं",
  },
];

// IDs that belong to the "Government Schemes" section (all others = public helplines)
const SCHEME_IDS = new Set([6, 7, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27]);
const getType = h => SCHEME_IDS.has(h.id) ? "scheme" : "public";

// ─── UI Strings (Bilingual) ──────────────────────────────────────────────────
const UI = {
  en: {
    title: "Government Helplines",
    subtitle: "सरकारी हेल्पलाइन डायरेक्टरी",
    responsibleUse: "Use responsibly.",
    responsibleDesc: "These are real emergency and public service lines. Call only when you genuinely need assistance. Tap any card to see exactly when to call and when not to.",
    publicLabel: "Public Helplines",
    publicDesc: "Emergency, Health, Women, Transport…",
    schemeLabel: "Gov Schemes",
    schemeDesc: "PM-KISAN, PMAY, NPS, GST…",
    helplines: "Helplines",
    tollFree: "Toll Free",
    national: "National",
    allDay: "24×7",
    searchPlaceholder: "Search helpline, number, or scheme…",
    showing: (n, q) => `Showing ${n} helpline${n > 1 ? "s" : ""}${q ? ` for "${q}"` : ""}`,
    noResults: "No helplines found",
    noResultsTitle: "No results found",
    noResultsDesc: "Try a different keyword or category",
    emergencyBandTitle: "Emergency? Call 112 First",
    emergencyBandDesc: "For any life-threatening situation — police, fire, or ambulance. 112 is the single national emergency number, available everywhere.",
    whenToCall: "✅ When to Call",
    dontCall: "🚫 Don't Call For:",
    note: "ℹ️ Note:",
    disclaimerTitle: "Disclaimer:",
    disclaimerText: "All numbers are sourced from official government portals and verified at time of publishing. Numbers may change — always confirm at the official ministry website before calling. Helplines serve real needs; misuse may cause delays for those who genuinely need help.",
    tollFreeBadge: "TOLL FREE",
    nationalBadge: "NATIONAL",
  },
  hi: {
    title: "सरकारी हेल्पलाइन",
    subtitle: "Government Helplines Directory",
    responsibleUse: "जिम्मेदारी से उपयोग करें।",
    responsibleDesc: "ये वास्तविक आपातकालीन और सार्वजनिक सेवा लाइनें हैं। केवल तभी कॉल करें जब आपको वास्तव में सहायता की आवश्यकता हो। किसी भी कार्ड पर टैप करके देखें कब कॉल करें और कब नहीं।",
    publicLabel: "सार्वजनिक हेल्पलाइन",
    publicDesc: "आपातकाल, स्वास्थ्य, महिला, परिवहन…",
    schemeLabel: "सरकारी योजनाएं",
    schemeDesc: "पीएम-किसान, पीएमएवाई, एनपीएस, जीएसटी…",
    helplines: "हेल्पलाइन",
    tollFree: "टोल फ्री",
    national: "राष्ट्रीय",
    allDay: "24×7",
    searchPlaceholder: "हेल्पलाइन, नंबर या योजना खोजें…",
    showing: (n, q) => `${n} हेल्पलाइन${q ? ` "${q}" के लिए` : ""} दिखाए जा रहे हैं`,
    noResults: "कोई हेल्पलाइन नहीं मिली",
    noResultsTitle: "कोई परिणाम नहीं मिला",
    noResultsDesc: "कोई अलग कीवर्ड या श्रेणी आज़माएं",
    emergencyBandTitle: "आपातकाल? पहले 112 कॉल करें",
    emergencyBandDesc: "किसी भी जानलेवा स्थिति में — पुलिस, दमकल, या एम्बुलेंस। 112 एकमात्र राष्ट्रीय आपातकालीन नंबर है, हर जगह उपलब्ध।",
    whenToCall: "✅ कब कॉल करें",
    dontCall: "🚫 इसके लिए कॉल न करें:",
    note: "ℹ️ नोट:",
    disclaimerTitle: "अस्वीकरण:",
    disclaimerText: "सभी नंबर आधिकारिक सरकारी पोर्टलों से लिए गए हैं और प्रकाशन के समय सत्यापित हैं। नंबर बदल सकते हैं — कॉल करने से पहले हमेशा आधिकारिक मंत्रालय की वेबसाइट पर पुष्टि करें।",
    tollFreeBadge: "टोल फ्री",
    nationalBadge: "राष्ट्रीय",
  },
};

// ─── HelplineCard Component ───────────────────────────────────────────────────
function HelplineCard({ h, isEmergency, lang = "en", ui }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATS[h.category];
  const isHindi = lang === "hi";

  const cardStyle = {
    background: isEmergency
      ? `linear-gradient(135deg, rgba(248,113,113,0.07) 0%, ${C.surface} 60%)`
      : C.surface,
    border: `1px solid ${isEmergency ? "rgba(248,113,113,0.2)" : C.border}`,
    borderRadius: 16,
    padding: "18px 18px 0 18px",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
    boxShadow: C.shadow,
    overflow: "hidden",
    marginBottom: 0,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isEmergency ? "rgba(248,113,113,0.45)" : "rgba(255,153,51,0.35)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isEmergency ? "rgba(248,113,113,0.2)" : C.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={() => setExpanded(p => !p)}
    >
      {/* ── Top Row ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        {/* Category Icon Pill */}
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: cat.bg, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20, marginTop: 2,
          border: `1px solid ${cat.color}30`,
        }}>{cat.icon}</div>

        {/* Name + Ministry */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontWeight: 700,
            fontSize: 15, color: C.white, lineHeight: 1.3, marginBottom: 2 }}>
            {isHindi && h.nameHi ? h.nameHi : h.name}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.3, fontWeight: 500 }}>
            {isHindi && h.ministryHi ? h.ministryHi : h.ministry}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: C.muted, fontSize: 14, paddingTop: 4, flexShrink: 0,
          transition: "transform 0.25s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </div>
      </div>

      {/* ── Call Number Button ── */}
      <a
        href={`tel:${h.dialNumber}`}
        onClick={e => e.stopPropagation()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: isEmergency
            ? "linear-gradient(90deg, rgba(248,113,113,0.18), rgba(248,113,113,0.08))"
            : C.saffronDim,
          border: `1px solid ${isEmergency ? "rgba(248,113,113,0.3)" : "rgba(255,153,51,0.3)"}`,
          borderRadius: 10, padding: "10px 14px", textDecoration: "none",
          transition: "background 0.2s",
          marginBottom: 14,
        }}
        onMouseEnter={e => e.currentTarget.style.background = isEmergency
          ? "rgba(248,113,113,0.25)" : "rgba(255,153,51,0.22)"}
        onMouseLeave={e => e.currentTarget.style.background = isEmergency
          ? "linear-gradient(90deg, rgba(248,113,113,0.18), rgba(248,113,113,0.08))"
          : C.saffronDim}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📞</span>
          <span style={{
            fontFamily: "'Courier New', monospace", fontWeight: 800,
            fontSize: 22, color: isEmergency ? C.red : C.saffron, letterSpacing: 1,
          }}>{h.number}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {h.tollFree && (
            <span style={{
              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
              color: C.green, fontSize: 10, fontWeight: 700, padding: "2px 7px",
              borderRadius: 20, letterSpacing: 0.5,
            }}>{ui.tollFreeBadge}</span>
          )}
          {h.national && (
            <span style={{
              background: "rgba(255,153,51,0.12)", border: "1px solid rgba(255,153,51,0.25)",
              color: C.saffron, fontSize: 10, fontWeight: 700, padding: "2px 7px",
              borderRadius: 20, letterSpacing: 0.5,
            }}>{ui.nationalBadge}</span>
          )}
        </div>
      </a>

      {/* ── Purpose + Availability (always visible) ── */}
      <div style={{ paddingBottom: expanded ? 4 : 14 }}>
        <div style={{ fontSize: 12.5, color: C.mutedLight, lineHeight: 1.55, marginBottom: 8 }}>
          {isHindi && h.purposeHi ? h.purposeHi : h.purpose}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>🕐</span>
          <span style={{ fontSize: 11.5, color: cat.color, fontWeight: 600 }}>
            {isHindi && h.availabilityHi ? h.availabilityHi : h.availability}
          </span>
        </div>
      </div>

      {/* ── Expanded Section ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${C.border}`, paddingTop: 14, paddingBottom: 16,
          animation: "slideDown 0.2s ease",
        }}>

          {/* When to call */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green,
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
              {ui.whenToCall}
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
              {(isHindi && h.whenToCallHi ? h.whenToCallHi : h.whenToCall).map((item, i) => (
                <li key={i} style={{ fontSize: 12.5, color: C.mutedLight,
                  lineHeight: 1.55, marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Do not call */}
          <div style={{
            background: C.redBg, border: "1px solid rgba(248,113,113,0.18)",
            borderRadius: 8, padding: "9px 12px", marginBottom: h.note ? 10 : 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.red,
              textTransform: "uppercase", letterSpacing: 0.8 }}>{ui.dontCall} </span>
            <span style={{ fontSize: 12, color: "#fca5a5" }}>
              {isHindi && h.doNotCallHi ? h.doNotCallHi : h.doNotCall}
            </span>
          </div>

          {/* Note */}
          {h.note && (
            <div style={{
              background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)",
              borderRadius: 8, padding: "9px 12px",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24",
                textTransform: "uppercase", letterSpacing: 0.8 }}>{ui.note} </span>
              <span style={{ fontSize: 12, color: "#fde68a" }}>
                {isHindi && h.noteHi ? h.noteHi : h.note}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Helpline({ lang = "en" }) {
  const [activeType, setActiveType] = useState("public");
  const [activeCat, setActiveCat]   = useState("all");
  const [query, setQuery]           = useState("");
  const catScrollRef                = useRef(null);
  const isHindi                     = lang === "hi";
  const ui                          = UI[isHindi ? "hi" : "en"];

  const handleTypeChange = type => {
    setActiveType(type);
    setActiveCat("all");
    setQuery("");
  };

  const typeHelplines = useMemo(
    () => HELPLINES.filter(h => getType(h) === activeType),
    [activeType]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return typeHelplines.filter(h => {
      const catMatch = activeCat === "all" || h.category === activeCat;
      if (!q) return catMatch;
      return catMatch && (
        h.name.toLowerCase().includes(q) ||
        h.number.includes(q) ||
        h.ministry.toLowerCase().includes(q) ||
        h.purpose.toLowerCase().includes(q) ||
        (h.nameHi && h.nameHi.includes(q)) ||
        (h.ministryHi && h.ministryHi.includes(q)) ||
        (h.purposeHi && h.purposeHi.includes(q))
      );
    });
  }, [typeHelplines, activeCat, query]);

  const emergencyFirst = useMemo(() => [
    ...filtered.filter(h => h.category === "emergency"),
    ...filtered.filter(h => h.category !== "emergency"),
  ], [filtered]);

  // Only show category chips relevant to the active type
  const activeCatEntries = useMemo(() => {
    const catSet = new Set(typeHelplines.map(h => h.category));
    return Object.entries(CATS).filter(([key]) => key === "all" || catSet.has(key));
  }, [typeHelplines]);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.white,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      paddingBottom: 80,
    }}>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        input::placeholder { color: #4a5568; }
        input:focus { outline: none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(180deg, #0c1a2e 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "24px 20px 0 20px",
      }}>
        {/* Title Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #FF9933, #FF6600)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 16px rgba(255,153,51,0.35)",
          }}>📞</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, lineHeight: 1.2,
              letterSpacing: -0.5 }}>
              {ui.title}
            </div>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
              {ui.subtitle}
            </div>
          </div>
        </div>

        {/* Responsible Use Banner */}
        <div style={{
          background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)",
          borderRadius: 12, padding: "10px 14px", margin: "14px 0",
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: 12, color: "#fde68a", lineHeight: 1.5 }}>
            <strong>{ui.responsibleUse}</strong> {ui.responsibleDesc}
          </div>
        </div>

        {/* ── Type Segmented Control ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          {
            key: "public",
            label: ui.publicLabel,
            labelHi: isHindi ? "आपातकाल / सार्वजनिक" : "Emergency / Public",
            desc: ui.publicDesc,
            color: "#f87171",
            bg: "rgba(248,113,113,0.10)",
            border: "rgba(248,113,113,0.30)",
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity="0.85"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            ),
          },
          {
            key: "scheme",
            label: ui.schemeLabel,
            labelHi: isHindi ? "सरकारी योजनाएं" : "Gov Schemes",
            desc: ui.schemeDesc,
            color: "#38bdf8",
            bg: "rgba(56,189,248,0.10)",
            border: "rgba(56,189,248,0.30)",
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
              </svg>
            ),
          },
        ].map(t => {
          const isActive = activeType === t.key;
          const count = HELPLINES.filter(h => getType(h) === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => handleTypeChange(t.key)}
              style={{
                flex: 1, padding: "12px 10px", borderRadius: 13,
                border: `1.5px solid ${isActive ? t.border : C.border}`,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.22s",
                background: isActive ? t.bg : "transparent",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ color: isActive ? t.color : C.muted, lineHeight: 1 }}>{t.icon}</span>
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: isActive ? t.color : C.mutedLight,
                }}>{t.label}</span>
                <span style={{
                  marginLeft: "auto",
                  background: isActive ? t.border : "rgba(255,255,255,0.07)",
                  color: isActive ? t.color : C.muted,
                  fontSize: 11, fontWeight: 700, padding: "2px 7px",
                  borderRadius: 20,
                }}>{count}</span>
              </div>
              <div style={{ fontSize: 10.5, color: isActive ? t.color : C.muted, opacity: 0.85, fontWeight: 500 }}>
                {t.labelHi}
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>
                {t.desc}
              </div>
            </button>
          );
        })}
        </div>

        {/* Dynamic Stats Row */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
          {[
            { val: `${typeHelplines.length}`, label: ui.helplines },
            { val: `${typeHelplines.filter(h => h.tollFree).length}`, label: ui.tollFree },
            { val: `${typeHelplines.filter(h => h.national).length}`, label: ui.national },
            { val: `${typeHelplines.filter(h => h.availability.startsWith("24")).length}`, label: ui.allDay },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.saffron }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 16,
          transition: "border-color 0.2s",
        }}
          onFocus={e => e.currentTarget.style.borderColor = "rgba(255,153,51,0.4)"}
          onBlur={e => e.currentTarget.style.borderColor = C.border}
        >
          <span style={{ fontSize: 16, color: C.muted }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={ui.searchPlaceholder}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: C.white, fontSize: 14, fontFamily: "inherit",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")}
              style={{ background: "none", border: "none", color: C.muted,
                cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>

        {/* Category Chips — Horizontal Scroll */}
        <div
          ref={catScrollRef}
          onTouchStart={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          style={{
            display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14,
            scrollbarWidth: "none", msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {activeCatEntries.map(([key, cat]) => {
            const isActive = activeCat === key;
            const count = key === "all"
              ? typeHelplines.length
              : typeHelplines.filter(h => h.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveCat(key)}
                style={{
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 20, border: "1px solid",
                  cursor: "pointer", transition: "all 0.18s", fontFamily: "inherit",
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  background: isActive ? cat.bg : "transparent",
                  borderColor: isActive ? cat.color : C.border,
                  color: isActive ? cat.color : C.muted,
                }}
              >
                <span>{cat.icon}</span>
                <span>{isHindi ? cat.labelHi : cat.label}</span>
                <span style={{
                  background: isActive ? cat.color : "rgba(255,255,255,0.1)",
                  color: isActive ? "#000" : C.muted,
                  borderRadius: 20, padding: "1px 6px", fontSize: 10, fontWeight: 700,
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "16px 16px 0 16px" }}>

        {/* Emergency highlight band (only visible when "all" or "emergency" selected) */}
        {activeType === "public" && (activeCat === "all" || activeCat === "emergency") && !query && (
          <div style={{
            background: "linear-gradient(90deg, rgba(248,113,113,0.12), rgba(248,113,113,0.04))",
            border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14,
            padding: "12px 16px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 28 }}>🚨</div>
            <div>
              <div style={{ fontWeight: 800, color: C.red, fontSize: 15, marginBottom: 2 }}>
                {ui.emergencyBandTitle}
              </div>
              <div style={{ fontSize: 12, color: "#fca5a5" }}>
                {ui.emergencyBandDesc}
              </div>
            </div>
          </div>
        )}

        {/* Result count */}
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, fontWeight: 500 }}>
          {filtered.length === 0
            ? ui.noResults
            : ui.showing(filtered.length, query)}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{ui.noResultsTitle}</div>
            <div style={{ fontSize: 13 }}>{ui.noResultsDesc}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {emergencyFirst.map(h => (
              <div key={h.id} style={{ animation: "fadeIn 0.3s ease" }}>
                <HelplineCard h={h} isEmergency={h.category === "emergency"} lang={lang} ui={ui} />
              </div>
            ))}
          </div>
        )}

        {/* Footer Disclaimer */}
        <div style={{
          marginTop: 28, background: C.surface, borderRadius: 14,
          border: `1px solid ${C.border}`, padding: "14px 16px",
        }}>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
            <strong style={{ color: C.mutedLight }}>{ui.disclaimerTitle}</strong> {ui.disclaimerText}
          </div>
        </div>
      </div>
    </div>
  );
}
