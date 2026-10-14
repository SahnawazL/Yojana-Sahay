// src/faqData.js — Yojana Sahay · the ONE source of FAQ text
// ─────────────────────────────────────────────────────────────────────────────
// Used by:  • the in-app FAQ (HomeFAQSection.jsx — Home for guests, Profile
//             for signed-in users)
//           • the public /faq.html page + its Google FAQ data
//             (scripts/generate-scheme-pages.mjs)
// So the app, the website and Google always say the same thing.
//
// Rules: plain words a first-time phone user understands; only facts that are
// true in the app today; keep each `id` stable (FAQ helpful-votes are stored
// by id). Plain JS only — no JSX — because the build script imports it.
// An answer is a string, or { text, note } (note = a highlighted tip).
// ─────────────────────────────────────────────────────────────────────────────

export const FAQ_DATA = {
  en: [
    // ── About the app ────────────────────────────────────────────────────────
    { cat: "about", id: "about_001", q: "What is YojanaSahay?",
      a: "YojanaSahay is a free app and website that helps people in India find the government schemes they can get — pensions, scholarships, farmer support, housing, health cover, loans and more. It lists 1,100+ Central and State schemes in one place, in simple Hindi and English, and tells you which ones you qualify for, what you will get, the documents you need and where to apply." },
    { cat: "about", id: "about_002", q: "Is YojanaSahay free?",
      a: "Yes. Finding schemes, the Eligibility Checker, scheme details, document lists and the AI assistant are all free. There are no ads and no hidden charges. A paid Pro plan with extra features is planned for later, but finding schemes will always stay free." },
    { cat: "about", id: "about_003", q: "Is this an official government app?",
      a: { text: "No. YojanaSahay is an independent app built to help citizens. It is not run by, or connected to, any Central or State Government department.",
           note: "We never ask for money, OTP, bank details or your Aadhaar number. If anyone asks for these in YojanaSahay's name, it is a scam." } },
    { cat: "about", id: "about_004", q: "Which states and schemes are covered?",
      a: "Central Government schemes plus State schemes from 34 states and union territories — from Uttar Pradesh, Bihar and Maharashtra to Assam, Ladakh and the Andaman & Nicobar Islands. That is 1,100+ schemes in total, and new ones are added regularly." },
    { cat: "about", id: "about_005", q: "Can I apply for a scheme directly in this app?",
      a: "No. YojanaSahay helps you find and understand schemes. To apply, every scheme shows the official government website or office. You always apply there — we never take, hold or submit applications for you." },

    // ── Privacy & data ───────────────────────────────────────────────────────
    { cat: "privacy", id: "privacy_001", q: "Is my data safe?",
      a: "Yes. Your data is stored securely on Google's Firebase cloud and is encrypted. Only your own account can see your profile and chats. We never sell or share your personal data, and we never use it for advertising." },
    { cat: "privacy", id: "privacy_002", q: "What personal data does the app keep?",
      a: "Only what is needed to show you the right schemes: your profile answers (state, age, income range, occupation, category and similar) and your sign-in details (name, email or mobile number, depending on how you sign in). We never ask for Aadhaar numbers, bank details, card details or biometrics." },
    { cat: "privacy", id: "privacy_003", q: "Does the app use my camera, microphone or location?",
      a: "The app never uses your camera, location or contacts. The microphone is used only if you tap the 🎤 mic button in AI Chat to speak your question — your phone asks your permission first, and you can always type instead." },
    { cat: "privacy", id: "privacy_004", q: "How do I delete my account and data?",
      a: "Email yojanasahayofficial@gmail.com from your registered email with the subject 'Data Deletion Request'. Your account, saved profile and chat history are permanently deleted within 7 working days, and you get a confirmation email." },

    // ── Schemes & eligibility ────────────────────────────────────────────────
    { cat: "schemes", id: "schemes_001", q: "How correct is the scheme information?",
      a: { text: "Scheme details are taken from official government websites and notifications. The official link of every scheme is checked automatically on a regular schedule, and each scheme shows the date it was last checked.",
           note: "Rules can change. Always confirm the details on the official website before you apply — every scheme has its official link." } },
    { cat: "schemes", id: "schemes_002", q: "How does the Eligibility Checker work?",
      a: "It asks a few simple questions — your state, age, gender, family income, occupation, category, ration card, land, disability and special groups (like construction workers or fishermen). It then checks your answers against the rules of every scheme and shows the ones you qualify for, with the money or benefit for each. The checking happens on your phone." },
    { cat: "schemes", id: "schemes_003", q: "What if a scheme link does not open?",
      a: { text: "Government websites are sometimes slow or down for a while — try again later, or tap 'Find on Google' to search for the official page. If the link is really wrong, tell us: Profile → 'Report / Query' (sign-in needed), or email yojanasahayofficial@gmail.com.",
           note: "Some government websites (.nic.in) block visitors from outside India. They usually work fine on an Indian mobile network or Wi-Fi." } },
    { cat: "schemes", id: "schemes_004", q: "Why am I not shown a scheme I expected?",
      a: "Results depend on your answers. Check that your profile is correct (state, income, category and so on) and run the Eligibility Checker again. Some schemes are only for a very specific group set by the government, so they appear only when your answers match those exact rules. You can also ask the AI assistant 'Why am I not eligible for …?' — it tells you which condition did not match." },
    { cat: "schemes", id: "schemes_005", q: "What is the scheme news strip on the Home screen?",
      a: "It shows the latest scheme news — new schemes, changes and closing dates. It updates by itself, so you don't need to refresh." },
    { cat: "schemes", id: "schemes_006", q: "How correct is the 'Govt. money you can receive' amount?",
      a: { text: "It adds up the benefits of all the schemes your answers match — monthly pensions, yearly support and one-time help.",
           note: "It is an estimate, not a promise. What you actually get depends on your application being approved and on the government's payment schedule." } },
    { cat: "schemes", id: "schemes_007", q: "What is the Document Checklist?",
      a: "One combined list of all the documents needed for the schemes you qualify for, with repeats removed — so you can collect everything in one go instead of checking each scheme separately. You can tick documents off as you gather them." },
    { cat: "schemes", id: "schemes_008", q: "How are new schemes added?",
      a: "New schemes are found from official government announcements and websites. A scheme is published only after its details are checked against an official government (.gov.in / .nic.in) page; anything not fully clear is reviewed by hand first. After that, official links are re-checked automatically, and schemes that close or change are updated." },
    { cat: "schemes", id: "schemes_009", q: "Can I check schemes for a family member?",
      a: "Yes. Use the 'Family Benefits' card on the Home screen, or in AI Chat ask something like 'Check schemes for my mother'. The assistant reuses your household details (state, income, ration card and so on) and asks only the few questions that are different for that person." },
    { cat: "schemes", id: "schemes_010", q: "Can I keep track of schemes I have applied for?",
      a: "Yes. Tell the AI assistant, for example 'I applied for PM Kisan, reference number 12345', or open the scheme and tap \"I've applied — track it\". It is saved in 'My Applications', where you can update the status — waiting, approved, money received or rejected." },

    // ── AI assistant ─────────────────────────────────────────────────────────
    { cat: "ai", id: "ai_001", q: "How does the AI assistant work?",
      a: "Ask any question about schemes in Hindi, English or Hinglish. The assistant uses YojanaSahay's scheme list and your saved profile to give answers that fit you, and it can look up the latest news on the internet when needed. It runs on fast AI models through Groq." },
    { cat: "ai", id: "ai_006", q: "What can the AI assistant do for me?",
      a: "It can find schemes for you, check your eligibility by asking a few questions in the chat, explain why you do or don't qualify, compare schemes, make a document checklist, save and track your applications, and open the right screen in the app. Tap ✨ in AI Chat to see everything it can do." },
    { cat: "ai", id: "ai_007", q: "Can I speak to the AI or listen to its answers?",
      a: "Yes. Tap the 🎤 mic to speak your question instead of typing, and tap 'Listen' under any answer to hear it read aloud. Voice quality depends on the voices installed on your phone." },
    { cat: "ai", id: "ai_002", q: "Is there a limit on AI messages?",
      a: "The AI assistant is free for everyone who signs in. When YojanaSahay Pro launches, free accounts will have a fair daily message limit, and Pro will allow more." },
    { cat: "ai", id: "ai_003", q: "Can the AI fill or submit forms for me?",
      a: "It can explain step by step how to fill a form and which documents to attach. It cannot submit anything for you — you always apply yourself on the official government website or at the office." },
    { cat: "ai", id: "ai_004", q: "Does the AI search the internet?",
      a: "Yes, when needed. For fresh information like new deadlines or recent changes, it searches the web and prefers official government sources." },
    { cat: "ai", id: "ai_005", q: "Can I fully trust the AI's answers?",
      a: { text: "The AI is a helper, not an official authority. It is usually right, but it can sometimes be incomplete or out of date.",
           note: "Before you apply or decide anything, confirm eligibility, dates and amounts on the official government website." } },

    // ── Account & support ────────────────────────────────────────────────────
    { cat: "account", id: "account_001", q: "Do I need an account?",
      a: "No. You can browse schemes and use the Eligibility Checker without signing in. Signing in is free — with your mobile number (OTP), Google or email — and lets you save your profile, use the AI assistant, track applications and send reports." },
    { cat: "account", id: "account_002", q: "Which languages are supported?",
      a: "English and Hindi (हिंदी). Switch any time with the EN / हिं button. The AI assistant also understands Hinglish. More Indian languages are planned." },
    { cat: "account", id: "account_003", q: "Is there a Pro version?",
      a: "YojanaSahay Pro is planned, with more AI messages, priority support and extra tools. Finding schemes and checking eligibility will always remain free." },
    { cat: "account", id: "account_004", q: "How do I report a problem or wrong scheme information?",
      a: "Sign in, open the Profile tab and tap 'Report / Query'. You can report a bug, request a missing scheme, ask a question or share feedback, and follow its status there. You can also email yojanasahayofficial@gmail.com. Every report is acknowledged within 24 hours." },
    { cat: "account", id: "account_005", q: "Where are the Terms, Privacy Policy and Grievance Officer details?",
      a: "Open 'About YojanaSahay' in the app — it has the Terms of Service, the Privacy Policy and the Grievance Officer's details. For a formal complaint, email yojanasahayofficial@gmail.com; it is acknowledged within 24 hours." },
  ],

  hi: [
    // ── ऐप के बारे में ──────────────────────────────────────────────────────────
    { cat: "about", id: "about_001", q: "योजना सहाय क्या है?",
      a: "योजना सहाय एक मुफ़्त ऐप और वेबसाइट है जो भारत के लोगों को वे सरकारी योजनाएं ढूंढने में मदद करती है जिनका लाभ वे ले सकते हैं — पेंशन, छात्रवृत्ति, किसान सहायता, आवास, इलाज, लोन और बहुत कुछ। इसमें केंद्र और राज्यों की 1,100+ योजनाएं एक जगह, आसान हिंदी और English में हैं, और यह बताता है कि आप किन योजनाओं के पात्र हैं, क्या मिलेगा, कौन से दस्तावेज़ चाहिए और कहां आवेदन करें।" },
    { cat: "about", id: "about_002", q: "क्या योजना सहाय मुफ़्त है?",
      a: "हां। योजनाएं खोजना, पात्रता जांच, योजना की जानकारी, दस्तावेज़ सूची और AI सहायक — सब मुफ़्त है। कोई विज्ञापन नहीं, कोई छुपा खर्च नहीं। आगे चलकर अतिरिक्त सुविधाओं वाला Pro प्लान आ सकता है, लेकिन योजनाएं खोजना हमेशा मुफ़्त रहेगा।" },
    { cat: "about", id: "about_003", q: "क्या यह सरकारी ऐप है?",
      a: { text: "नहीं। योजना सहाय नागरिकों की मदद के लिए बना एक स्वतंत्र ऐप है। यह किसी केंद्र या राज्य सरकार के विभाग द्वारा नहीं चलाया जाता, न ही उनसे जुड़ा है।",
           note: "हम कभी पैसे, OTP, बैंक जानकारी या आधार नंबर नहीं मांगते। अगर कोई योजना सहाय के नाम पर ये मांगे, तो वह धोखा है।" } },
    { cat: "about", id: "about_004", q: "कौन से राज्य और योजनाएं शामिल हैं?",
      a: "केंद्र सरकार की योजनाएं और 34 राज्यों व केंद्र शासित प्रदेशों की योजनाएं — उत्तर प्रदेश, बिहार और महाराष्ट्र से लेकर असम, लद्दाख और अंडमान-निकोबार तक। कुल 1,100+ योजनाएं, और नई योजनाएं लगातार जुड़ती रहती हैं।" },
    { cat: "about", id: "about_005", q: "क्या मैं इस ऐप से सीधे आवेदन कर सकता हूं?",
      a: "नहीं। योजना सहाय योजनाएं ढूंढने और समझने में मदद करता है। आवेदन के लिए हर योजना में आधिकारिक सरकारी वेबसाइट या कार्यालय बताया गया है — आवेदन हमेशा वहीं होता है। हम आपकी ओर से कोई आवेदन नहीं लेते या जमा नहीं करते।" },

    // ── गोपनीयता ────────────────────────────────────────────────────────────────
    { cat: "privacy", id: "privacy_001", q: "क्या मेरा डेटा सुरक्षित है?",
      a: "हां। आपका डेटा Google के Firebase क्लाउड पर सुरक्षित और एन्क्रिप्टेड रहता है। आपकी प्रोफाइल और चैट केवल आपका अपना अकाउंट देख सकता है। हम आपका डेटा कभी बेचते या साझा नहीं करते, और विज्ञापन के लिए इस्तेमाल नहीं करते।" },
    { cat: "privacy", id: "privacy_002", q: "ऐप कौन सा व्यक्तिगत डेटा रखता है?",
      a: "केवल वही जो सही योजनाएं दिखाने के लिए ज़रूरी है: आपकी प्रोफाइल के जवाब (राज्य, उम्र, आय, व्यवसाय, वर्ग आदि) और साइन-इन की जानकारी (नाम, ईमेल या मोबाइल नंबर — आप कैसे साइन इन करते हैं उसके अनुसार)। हम कभी आधार नंबर, बैंक या कार्ड की जानकारी या बायोमेट्रिक नहीं मांगते।" },
    { cat: "privacy", id: "privacy_003", q: "क्या ऐप मेरा कैमरा, माइक या लोकेशन इस्तेमाल करता है?",
      a: "ऐप कभी कैमरा, लोकेशन या कॉन्टैक्ट्स का इस्तेमाल नहीं करता। माइक का इस्तेमाल तभी होता है जब आप AI चैट में 🎤 माइक बटन दबाकर बोलकर सवाल पूछते हैं — पहले आपका फ़ोन अनुमति मांगता है, और आप हमेशा टाइप भी कर सकते हैं।" },
    { cat: "privacy", id: "privacy_004", q: "मैं अपना अकाउंट और डेटा कैसे हटाऊं?",
      a: "अपने रजिस्टर्ड ईमेल से yojanasahayofficial@gmail.com पर 'Data Deletion Request' विषय के साथ ईमेल करें। 7 कार्य दिवसों में आपका अकाउंट, सेव की गई प्रोफाइल और चैट हिस्ट्री हमेशा के लिए हटा दी जाती है, और आपको पुष्टि ईमेल मिलता है।" },

    // ── योजनाएं ──────────────────────────────────────────────────────────────────
    { cat: "schemes", id: "schemes_001", q: "योजनाओं की जानकारी कितनी सही है?",
      a: { text: "योजना की जानकारी आधिकारिक सरकारी वेबसाइटों और अधिसूचनाओं से ली जाती है। हर योजना का आधिकारिक लिंक नियमित रूप से अपने आप जांचा जाता है, और हर योजना पर आखिरी जांच की तारीख दिखती है।",
           note: "नियम बदल सकते हैं। आवेदन से पहले आधिकारिक वेबसाइट पर जानकारी ज़रूर पक्की करें — हर योजना में आधिकारिक लिंक दिया गया है।" } },
    { cat: "schemes", id: "schemes_002", q: "पात्रता जांच कैसे काम करती है?",
      a: "यह कुछ आसान सवाल पूछती है — राज्य, उम्र, लिंग, परिवार की आय, व्यवसाय, वर्ग, राशन कार्ड, ज़मीन, दिव्यांगता और विशेष समूह (जैसे निर्माण श्रमिक या मछुआरे)। फिर आपके जवाबों को हर योजना के नियमों से मिलाकर वे योजनाएं दिखाती है जिनके आप पात्र हैं, हर योजना के लाभ के साथ। यह जांच आपके फ़ोन पर ही होती है।" },
    { cat: "schemes", id: "schemes_003", q: "अगर किसी योजना का लिंक न खुले तो?",
      a: { text: "सरकारी वेबसाइटें कभी-कभी धीमी या कुछ समय के लिए बंद रहती हैं — बाद में फिर कोशिश करें, या 'गूगल पर खोजें' दबाकर आधिकारिक पेज ढूंढें। अगर लिंक सच में गलत है तो बताएं: प्रोफाइल → 'रिपोर्ट / सवाल' (साइन-इन ज़रूरी), या yojanasahayofficial@gmail.com पर ईमेल करें।",
           note: "कुछ सरकारी वेबसाइटें (.nic.in) भारत के बाहर से आने वालों को रोकती हैं। भारतीय मोबाइल नेटवर्क या Wi-Fi पर ये आमतौर पर ठीक खुलती हैं।" } },
    { cat: "schemes", id: "schemes_004", q: "जिस योजना की उम्मीद थी वह क्यों नहीं दिखी?",
      a: "नतीजे आपके जवाबों पर निर्भर करते हैं। देखें कि आपकी प्रोफाइल (राज्य, आय, वर्ग आदि) सही है और पात्रता जांच फिर से करें। कुछ योजनाएं सरकार ने बहुत खास समूह के लिए बनाई हैं, इसलिए वे तभी दिखती हैं जब आपके जवाब उन्हीं नियमों से मेल खाएं। आप AI सहायक से पूछ भी सकते हैं 'मैं … के लिए पात्र क्यों नहीं हूं?' — वह बताएगा कौन सी शर्त पूरी नहीं हुई।" },
    { cat: "schemes", id: "schemes_005", q: "होम स्क्रीन पर योजना समाचार पट्टी क्या है?",
      a: "इसमें योजनाओं की ताज़ा खबरें दिखती हैं — नई योजनाएं, बदलाव और आखिरी तारीखें। यह अपने आप अपडेट होती है, रीफ्रेश करने की ज़रूरत नहीं।" },
    { cat: "schemes", id: "schemes_006", q: "'सरकारी पैसा जो आप पा सकते हैं' राशि कितनी सही है?",
      a: { text: "यह उन सभी योजनाओं के लाभ जोड़ती है जिनसे आपके जवाब मेल खाते हैं — मासिक पेंशन, सालाना सहायता और एकमुश्त मदद।",
           note: "यह एक अनुमान है, वादा नहीं। असल में कितना मिलेगा यह आपके आवेदन की मंज़ूरी और सरकार के भुगतान पर निर्भर करता है।" } },
    { cat: "schemes", id: "schemes_007", q: "दस्तावेज़ चेकलिस्ट क्या है?",
      a: "आपकी पात्र योजनाओं के लिए ज़रूरी सभी दस्तावेज़ों की एक साझा सूची, जिसमें दोहराव हटा दिया गया है — ताकि आप हर योजना अलग-अलग देखने के बजाय सब कुछ एक बार में इकट्ठा कर सकें। दस्तावेज़ मिलने पर आप उन पर टिक भी लगा सकते हैं।" },
    { cat: "schemes", id: "schemes_008", q: "नई योजनाएं कैसे जोड़ी जाती हैं?",
      a: "नई योजनाएं आधिकारिक सरकारी घोषणाओं और वेबसाइटों से ढूंढी जाती हैं। कोई योजना तभी प्रकाशित होती है जब उसकी जानकारी आधिकारिक सरकारी (.gov.in / .nic.in) पेज से जांच ली जाए; जो पूरी तरह साफ़ न हो उसकी पहले हाथ से समीक्षा होती है। उसके बाद आधिकारिक लिंक अपने आप दोबारा जांचे जाते हैं, और बंद या बदली हुई योजनाएं अपडेट की जाती हैं।" },
    { cat: "schemes", id: "schemes_009", q: "क्या मैं परिवार के किसी सदस्य के लिए योजनाएं देख सकता हूं?",
      a: "हां। होम स्क्रीन पर 'परिवार के लाभ' कार्ड इस्तेमाल करें, या AI चैट में लिखें, जैसे 'मेरी मां के लिए योजनाएं देखो'। सहायक आपके घर की जानकारी (राज्य, आय, राशन कार्ड आदि) दोबारा इस्तेमाल करता है और केवल वही कुछ सवाल पूछता है जो उस व्यक्ति के लिए अलग हैं।" },
    { cat: "schemes", id: "schemes_010", q: "क्या मैं अपने आवेदनों को ट्रैक कर सकता हूं?",
      a: "हां। AI सहायक को बताएं, जैसे 'मैंने PM किसान में आवेदन किया, रेफरेंस नंबर 12345', या योजना खोलकर 'मैंने आवेदन कर दिया — ट्रैक करें' दबाएं। यह 'मेरे आवेदन' में सेव हो जाता है, जहां आप स्थिति बदल सकते हैं — इंतज़ार, मंज़ूर, पैसा मिला या अस्वीकृत।" },

    // ── AI सहायक ─────────────────────────────────────────────────────────────────
    { cat: "ai", id: "ai_001", q: "AI सहायक कैसे काम करता है?",
      a: "योजनाओं के बारे में कोई भी सवाल हिंदी, English या Hinglish में पूछें। सहायक योजना सहाय की योजना सूची और आपकी सेव की गई प्रोफाइल से आपके हिसाब से जवाब देता है, और ज़रूरत पड़ने पर इंटरनेट से ताज़ा खबर भी देखता है। यह Groq पर चलने वाले तेज़ AI मॉडल से चलता है।" },
    { cat: "ai", id: "ai_006", q: "AI सहायक मेरे लिए क्या-क्या कर सकता है?",
      a: "यह आपके लिए योजनाएं ढूंढ सकता है, चैट में कुछ सवाल पूछकर पात्रता जांच सकता है, बता सकता है कि आप पात्र क्यों हैं या क्यों नहीं, योजनाओं की तुलना कर सकता है, दस्तावेज़ सूची बना सकता है, आपके आवेदन सेव और ट्रैक कर सकता है, और ऐप की सही स्क्रीन खोल सकता है। सब कुछ देखने के लिए AI चैट में ✨ दबाएं।" },
    { cat: "ai", id: "ai_007", q: "क्या मैं AI से बोलकर पूछ सकता हूं या जवाब सुन सकता हूं?",
      a: "हां। टाइप करने के बजाय 🎤 माइक दबाकर बोलें, और किसी भी जवाब के नीचे 'सुनें' दबाकर उसे पढ़कर सुनें। आवाज़ की गुणवत्ता आपके फ़ोन में मौजूद आवाज़ों पर निर्भर करती है।" },
    { cat: "ai", id: "ai_002", q: "क्या AI संदेशों की कोई सीमा है?",
      a: "साइन इन करने वाले सभी लोगों के लिए AI सहायक मुफ़्त है। YojanaSahay Pro आने पर मुफ़्त अकाउंट में रोज़ के संदेशों की एक उचित सीमा होगी, और Pro में ज़्यादा संदेश मिलेंगे।" },
    { cat: "ai", id: "ai_003", q: "क्या AI मेरे लिए फॉर्म भर या जमा कर सकता है?",
      a: "यह कदम-दर-कदम समझा सकता है कि फॉर्म कैसे भरें और कौन से दस्तावेज़ लगाएं। यह आपकी ओर से कुछ जमा नहीं कर सकता — आवेदन हमेशा आप खुद आधिकारिक सरकारी वेबसाइट या कार्यालय में करते हैं।" },
    { cat: "ai", id: "ai_004", q: "क्या AI इंटरनेट पर खोजता है?",
      a: "हां, ज़रूरत पड़ने पर। नई आखिरी तारीख या हाल के बदलाव जैसी ताज़ा जानकारी के लिए यह वेब पर खोजता है और आधिकारिक सरकारी स्रोतों को प्राथमिकता देता है।" },
    { cat: "ai", id: "ai_005", q: "क्या मैं AI के जवाबों पर पूरा भरोसा कर सकता हूं?",
      a: { text: "AI एक सहायक है, कोई सरकारी अधिकारी नहीं। यह ज़्यादातर सही होता है, लेकिन कभी-कभी जानकारी अधूरी या पुरानी हो सकती है।",
           note: "आवेदन या कोई फैसला लेने से पहले पात्रता, तारीखें और राशि आधिकारिक सरकारी वेबसाइट पर ज़रूर जांच लें।" } },

    // ── अकाउंट और सहायता ─────────────────────────────────────────────────────────
    { cat: "account", id: "account_001", q: "क्या अकाउंट बनाना ज़रूरी है?",
      a: "नहीं। बिना साइन इन के भी आप योजनाएं देख सकते हैं और पात्रता जांच सकते हैं। साइन इन मुफ़्त है — मोबाइल नंबर (OTP), Google या ईमेल से — और इससे आप प्रोफाइल सेव कर सकते हैं, AI सहायक इस्तेमाल कर सकते हैं, आवेदन ट्रैक कर सकते हैं और रिपोर्ट भेज सकते हैं।" },
    { cat: "account", id: "account_002", q: "कौन सी भाषाएं उपलब्ध हैं?",
      a: "English और हिंदी। EN / हिं बटन से कभी भी भाषा बदलें। AI सहायक Hinglish भी समझता है। और भारतीय भाषाएं जोड़ने की योजना है।" },
    { cat: "account", id: "account_003", q: "क्या Pro संस्करण है?",
      a: "YojanaSahay Pro की योजना है — ज़्यादा AI संदेश, प्राथमिकता सहायता और अतिरिक्त टूल के साथ। योजनाएं खोजना और पात्रता जांचना हमेशा मुफ़्त रहेगा।" },
    { cat: "account", id: "account_004", q: "कोई समस्या या गलत योजना जानकारी कैसे बताऊं?",
      a: "साइन इन करें, प्रोफाइल टैब खोलें और 'रिपोर्ट / सवाल' दबाएं। वहां आप बग बता सकते हैं, छूटी हुई योजना जोड़ने को कह सकते हैं, सवाल पूछ सकते हैं या सुझाव दे सकते हैं, और उसकी स्थिति देख सकते हैं। आप yojanasahayofficial@gmail.com पर ईमेल भी कर सकते हैं। हर रिपोर्ट का जवाब 24 घंटे में स्वीकार किया जाता है।" },
    { cat: "account", id: "account_005", q: "सेवा की शर्तें, गोपनीयता नीति और शिकायत अधिकारी की जानकारी कहां है?",
      a: "ऐप में 'योजना सहाय के बारे में' खोलें — वहां सेवा की शर्तें, गोपनीयता नीति और शिकायत अधिकारी (Grievance Officer) की जानकारी है। औपचारिक शिकायत के लिए yojanasahayofficial@gmail.com पर ईमेल करें; इसे 24 घंटे में स्वीकार किया जाता है।" },
  ],
};

// Answer → plain text (for Google / the public FAQ page).
export const faqAnswerText = (a) => (typeof a === "string" ? a : [a?.text, a?.note].filter(Boolean).join(" "));
