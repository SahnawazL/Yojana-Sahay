// src/moneyCheck.js — Yojana Sahay · "Why didn't my money come?"
// ─────────────────────────────────────────────────────────────────────────────
// A short question flow (3–6 taps) that finds the most likely reason a
// scheme's money hasn't reached the person, and the exact fix. The usual
// causes are not the scheme at all but the payment route: Aadhaar not linked
// (seeded) to the bank for DBT, the money going to a different account linked
// to Aadhaar, an inactive account or pending KYC, a name that is spelled
// differently, missing e-KYC, or a yearly life certificate / renewal.
// Only official links (.gov.in / .nic.in). Pure data + functions, no UI.
// ─────────────────────────────────────────────────────────────────────────────
import { benefitKind } from "./benefitMath.js";

export const LINKS = {
  aadhaarBank: { url: "https://myaadhaar.uidai.gov.in/", en: "myAadhaar → Bank Seeding Status", hi: "myAadhaar → बैंक सीडिंग स्टेटस" },
  pfms:        { url: "https://pfms.nic.in/", en: "PFMS → Know Your Payments (Central schemes)", hi: "PFMS → Know Your Payments (केंद्र की योजनाएं)" },
  cpgrams:     { url: "https://pgportal.gov.in/", en: "CPGRAMS — government complaint portal", hi: "CPGRAMS — सरकारी शिकायत पोर्टल" },
};

const t = (en, hi) => ({ en, hi });

// What kind of scheme this is — decides which questions make sense.
export function schemeTraits(s) {
  const txt = `${s?.name?.en ?? ""} ${s?.tag?.en ?? ""} ${s?.benefit?.en ?? ""} ${(s?.docs?.en || []).join(" ")}`.toLowerCase();
  return {
    pension: /pension/.test(txt) && !/after (the )?age (of )?60|maan-?dhan|atal pension/.test(txt),
    scholarship: /scholarship|fellowship|chhatravritti|chatravritti/.test(txt),
    ekyc: /e-?kyc|pm-?kisan/.test(txt) || s?.id === "pmkisan",
    central: s?.scope === "national",
    cash: ["yearly", "oneTime"].includes(benefitKind(s)),
  };
}

// The questions, in order. `when(a, tr)` decides if a question is asked
// given the replies so far (a) and the scheme's traits (tr).
export const QUESTIONS = [
  { id: "situation", q: t("What is happening?", "क्या हो रहा है?"),
    options: [
      ["approved", t("Approved, but no money yet", "मंज़ूर हो गया, पर पैसा नहीं आया")],
      ["stopped",  t("Money came before, now it stopped", "पहले पैसा आता था, अब रुक गया")],
      ["unsure",   t("Not sure if it was approved", "पता नहीं मंज़ूर हुआ या नहीं")],
    ] },
  { id: "wait", when: a => a.situation === "approved", q: t("How long ago was it approved?", "कितने समय पहले मंज़ूर हुआ?"),
    options: [["lt1", t("Less than a month", "एक महीने से कम")], ["1to3", t("1–3 months", "1–3 महीने")], ["gt3", t("More than 3 months", "3 महीने से ज़्यादा")]] },
  { id: "renew", when: (a, tr) => a.situation === "stopped" && (tr.pension || tr.scholarship),
    q: tr => tr.pension ? t("Did you give your life certificate (proof you are alive) this year?", "क्या आपने इस साल जीवन प्रमाण पत्र दिया?")
                        : t("Did you submit this year's renewal application?", "क्या आपने इस साल का रिन्यूअल आवेदन जमा किया?"),
    options: [["yes", t("Yes", "हां")], ["no", t("No", "नहीं")], ["unsure", t("Not sure", "पता नहीं")]] },
  { id: "sms", when: a => a.situation !== "unsure", q: t("Did you get an SMS saying the money was sent?", "क्या पैसा भेजे जाने का SMS आया?"),
    options: [["yes", t("Yes", "हां")], ["no", t("No", "नहीं")]] },
  { id: "seed", when: a => a.situation !== "unsure", q: t("Is your Aadhaar linked to your bank account for government payments (DBT)?", "क्या आपका आधार सरकारी भुगतान (DBT) के लिए बैंक खाते से जुड़ा है?"),
    options: [["yes", t("Yes, I checked", "हां, जांच लिया")], ["no", t("No", "नहीं")], ["unsure", t("Not sure", "पता नहीं")]] },
  { id: "newacct", when: a => a.situation !== "unsure" && (a.sms === "yes" || a.situation === "stopped"),
    q: t("Did you open a new bank account, or link Aadhaar to another bank, recently?", "क्या आपने हाल में नया बैंक खाता खोला या आधार किसी दूसरे बैंक से जोड़ा?"),
    options: [["yes", t("Yes", "हां")], ["no", t("No", "नहीं")], ["unsure", t("Not sure", "पता नहीं")]] },
  { id: "active", when: a => a.situation !== "unsure", q: t("Have you used this bank account (deposit or withdrawal) in the last 2 years, and is its KYC up to date?", "क्या पिछले 2 साल में इस बैंक खाते में लेन-देन किया है, और KYC अपडेट है?"),
    options: [["yes", t("Yes", "हां")], ["no", t("No", "नहीं")], ["unsure", t("Not sure", "पता नहीं")]] },
  { id: "name", when: a => a.situation !== "unsure", q: t("Is your name spelled exactly the same in Aadhaar, the bank account and the application?", "क्या आधार, बैंक खाते और आवेदन में आपका नाम बिल्कुल एक जैसा लिखा है?"),
    options: [["yes", t("Yes", "हां")], ["no", t("No", "नहीं")], ["unsure", t("Not sure", "पता नहीं")]] },
  { id: "ekyc", when: (a, tr) => a.situation !== "unsure" && tr.ekyc, q: t("Have you completed e-KYC for this scheme?", "क्या आपने इस योजना का e-KYC पूरा किया है?"),
    options: [["yes", t("Yes", "हां")], ["no", t("No", "नहीं")], ["unsure", t("Not sure", "पता नहीं")]] },
];

export const questionText = (q, tr) => (typeof q.q === "function" ? q.q(tr) : q.q);

// Next question to ask, or null when done.
export function nextQuestion(replies, scheme) {
  const tr = schemeTraits(scheme);
  return QUESTIONS.find(q => replies[q.id] == null && (!q.when || q.when(replies, tr))) || null;
}

// The causes, most likely first. Each: { id, level: "likely"|"check"|"info", title, why, fix[], links[] }
export function diagnose(replies, scheme, app = null) {
  const tr = schemeTraits(scheme);
  const r = replies;
  const out = [];
  const add = (c) => out.push(c);
  const ref = app?.ref ? ` (${app.ref})` : "";

  if (r.situation === "unsure") {
    add({ id: "status", level: "likely",
      title: t("First, check if your application was approved", "पहले जांचें कि आवेदन मंज़ूर हुआ या नहीं"),
      why: t("Money is only sent after the application is approved. It may still be under verification, or it may have been sent back for a correction.",
             "पैसा आवेदन मंज़ूर होने के बाद ही भेजा जाता है। आवेदन अभी जांच में हो सकता है, या सुधार के लिए लौटाया गया हो सकता है।"),
      fix: [t(`Check the status on the scheme's official website with your application number${ref}.`, `योजना की आधिकारिक वेबसाइट पर आवेदन नंबर${ref} से स्टेटस देखें।`),
            t("If it says \"returned\" or \"pending for correction\", fix the detail it asks for and submit again.", "अगर \"लौटाया गया\" या \"सुधार हेतु लंबित\" लिखा हो, तो मांगी गई जानकारी ठीक करके दोबारा जमा करें।"),
            t("No online status? Ask at the office or Common Service Centre (CSC) where you applied.", "ऑनलाइन स्टेटस नहीं? जहां आवेदन किया था उस कार्यालय या CSC पर पूछें।")],
      links: ["scheme"] });
    return out;
  }

  if (r.renew === "no" || r.renew === "unsure") {
    add({ id: "renew", level: r.renew === "no" ? "likely" : "check",
      title: tr.pension ? t("Yearly life certificate missing", "सालाना जीवन प्रमाण पत्र नहीं दिया") : t("This year's renewal missing", "इस साल का रिन्यूअल नहीं हुआ"),
      why: tr.pension ? t("Pensions stop if the yearly life certificate is not given.", "सालाना जीवन प्रमाण पत्र न देने पर पेंशन रुक जाती है।")
                      : t("Most scholarships must be renewed every year — without renewal the payment stops.", "ज़्यादातर छात्रवृत्तियों का हर साल रिन्यूअल ज़रूरी है — रिन्यूअल न हो तो भुगतान रुक जाता है।"),
      fix: tr.pension
        ? [t("Give your life certificate at the pension office, block office, bank or a Common Service Centre (CSC) — take Aadhaar and your pension details.", "पेंशन कार्यालय, ब्लॉक कार्यालय, बैंक या CSC पर जीवन प्रमाण पत्र दें — आधार और पेंशन विवरण साथ ले जाएं।"),
           t("Ask them to restart the payment; stopped months are often paid together after this.", "भुगतान फिर से शुरू करने को कहें; रुके हुए महीनों का पैसा अक्सर बाद में एक साथ मिल जाता है।")]
        : [t("Log in to the scholarship portal and submit the renewal (usually with marks of the last class and fee receipt).", "छात्रवृत्ति पोर्टल पर लॉगिन करके रिन्यूअल जमा करें (आम तौर पर पिछली कक्षा के अंक और फीस रसीद के साथ)।"),
           t("Then ask your school or college to verify it — the payment waits for their approval.", "फिर स्कूल / कॉलेज से इसे वेरिफ़ाई करवाएं — भुगतान उनकी मंज़ूरी के बाद ही आता है।")],
      links: ["scheme"] });
  }

  if (r.seed === "no" || r.seed === "unsure") {
    add({ id: "seed", level: r.seed === "no" ? "likely" : "check",
      title: t("Aadhaar not linked to your bank for DBT", "आधार बैंक खाते से DBT के लिए नहीं जुड़ा"),
      why: t("Most scheme money is sent using your Aadhaar number. If Aadhaar is not linked (\"seeded\") to a bank account for DBT, the payment fails even when the application is approved.",
             "ज़्यादातर योजनाओं का पैसा आधार नंबर से भेजा जाता है। अगर आधार किसी बैंक खाते से DBT के लिए नहीं जुड़ा (\"सीडेड\") है, तो मंज़ूरी के बाद भी भुगतान फ़ेल हो जाता है।"),
      fix: [t("Check first: on myAadhaar, log in with OTP and open \"Bank Seeding Status\" — it shows which bank, if any, gets your DBT money.", "पहले जांचें: myAadhaar पर OTP से लॉगिन करके \"Bank Seeding Status\" खोलें — इसमें दिखता है कि DBT का पैसा किस बैंक में आता है।"),
            t("Not linked? Go to your bank branch with Aadhaar and passbook and ask for \"Aadhaar seeding for DBT (NPCI mapping)\". Sign the consent form.", "नहीं जुड़ा? आधार और पासबुक लेकर बैंक शाखा जाएं और \"DBT के लिए आधार सीडिंग (NPCI मैपिंग)\" के लिए कहें। सहमति फ़ॉर्म पर साइन करें।"),
            t("Quickest option in many villages: open an India Post Payments Bank account at the post office and ask them to link Aadhaar to it for DBT.", "कई गांवों में सबसे आसान: डाकघर में इंडिया पोस्ट पेमेंट्स बैंक खाता खुलवाएं और उसमें DBT के लिए आधार जुड़वाएं।"),
            t("Linking usually takes a few days. Failed payments are often sent again in the next cycle.", "जुड़ने में आम तौर पर कुछ दिन लगते हैं। फ़ेल हुआ भुगतान अक्सर अगली किस्त में फिर भेजा जाता है।")],
      links: ["aadhaarBank"] });
  }

  if (r.sms === "yes" || r.newacct === "yes" || r.newacct === "unsure") {
    add({ id: "otherAccount", level: (r.sms === "yes" || r.newacct === "yes") ? "likely" : "check",
      title: t("Money may have gone to a different bank account", "पैसा किसी दूसरे बैंक खाते में गया हो सकता है"),
      why: t("Government payments go to the account LAST linked to your Aadhaar — not always the account you wrote on the form. A new account or a bank's own Aadhaar update can move your payments there.",
             "सरकारी भुगतान उस खाते में जाता है जो आधार से सबसे आखिर में जोड़ा गया — ज़रूरी नहीं कि फ़ॉर्म में लिखा खाता हो। नया खाता खुलने या बैंक के आधार अपडेट से भुगतान वहां जा सकता है।"),
      fix: [t("On myAadhaar → \"Bank Seeding Status\", see which bank is linked. Check that account's passbook or mini-statement.", "myAadhaar → \"Bank Seeding Status\" पर देखें कि कौन सा बैंक जुड़ा है। उस खाते की पासबुक या मिनी-स्टेटमेंट देखें।"),
            t("Want it in another account? Ask that bank to seed Aadhaar for DBT — future payments will go there.", "दूसरे खाते में चाहिए? उस बैंक से DBT के लिए आधार सीड करवाएं — आगे के भुगतान वहीं आएंगे।")],
      links: ["aadhaarBank", ...(tr.central ? ["pfms"] : [])] });
  }

  if (r.active === "no" || r.active === "unsure") {
    add({ id: "inactive", level: r.active === "no" ? "likely" : "check",
      title: t("Bank account inactive or KYC pending", "बैंक खाता बंद (निष्क्रिय) या KYC बाकी"),
      why: t("An account with no deposit or withdrawal for 2 years becomes inoperative, and banks can freeze an account when its KYC update is due. Payments to such accounts bounce back.",
             "2 साल तक कोई जमा या निकासी न होने पर खाता निष्क्रिय हो जाता है, और KYC अपडेट बाकी होने पर बैंक खाता रोक सकते हैं। ऐसे खाते में भुगतान वापस लौट जाता है।"),
      fix: [t("Visit your branch with Aadhaar, update KYC and ask them to make the account active.", "आधार लेकर बैंक शाखा जाएं, KYC अपडेट करवाएं और खाता चालू करवाएं।"),
            t("Make a small deposit or withdrawal so it stays active.", "खाता चालू रखने के लिए थोड़ी जमा या निकासी करें।")],
      links: [] });
  }

  if (r.name === "no" || r.name === "unsure") {
    add({ id: "name", level: r.name === "no" ? "likely" : "check",
      title: t("Name doesn't match", "नाम मेल नहीं खाता"),
      why: t("The payment system checks your name against the bank and Aadhaar records. A different spelling (e.g. \"Kumari\" vs \"Kumary\") can stop the payment.",
             "भुगतान प्रणाली आपका नाम बैंक और आधार रिकॉर्ड से मिलाती है। अलग वर्तनी (जैसे \"Kumari\" और \"Kumary\") से भुगतान रुक सकता है।"),
      fix: [t("Pick the correct spelling and fix the others: the bank can correct its records; Aadhaar can be updated at an Aadhaar Seva Kendra.", "सही वर्तनी तय करें और बाकी जगह ठीक करवाएं: बैंक अपना रिकॉर्ड सुधार सकता है; आधार, आधार सेवा केंद्र पर अपडेट होता है।"),
            t(`Then ask the scheme office to update your application${ref} with the corrected name.`, `फिर योजना कार्यालय से अपने आवेदन${ref} में सही नाम अपडेट करवाएं।`)],
      links: ["scheme"] });
  }

  if (r.ekyc === "no" || r.ekyc === "unsure") {
    add({ id: "ekyc", level: r.ekyc === "no" ? "likely" : "check",
      title: t("e-KYC not completed", "e-KYC पूरा नहीं"),
      why: t("This scheme holds payments until e-KYC is done.", "यह योजना e-KYC पूरा होने तक भुगतान रोक कर रखती है।"),
      fix: [t("Do e-KYC on the scheme's official website with the OTP sent to your Aadhaar-linked mobile.", "योजना की आधिकारिक वेबसाइट पर आधार से जुड़े मोबाइल पर आए OTP से e-KYC करें।"),
            t("Mobile not linked to Aadhaar? Do fingerprint e-KYC at a Common Service Centre (CSC).", "मोबाइल आधार से नहीं जुड़ा? CSC पर फ़िंगरप्रिंट से e-KYC करवाएं।")],
      links: ["scheme"] });
  }

  if (r.wait === "lt1" && !out.some(c => c.level === "likely")) {
    out.unshift({ id: "early", level: "info",
      title: t("It may just be early", "हो सकता है अभी जल्दी हो"),
      why: t("After approval, payments are released in batches — the first one can take several weeks.", "मंज़ूरी के बाद भुगतान किस्तों / बैच में जारी होता है — पहला भुगतान आने में कुछ हफ़्ते लग सकते हैं।"),
      fix: [t("Meanwhile, check that Aadhaar is linked to your bank (myAadhaar → Bank Seeding Status) so the payment doesn't fail when it is sent.", "तब तक जांच लें कि आधार बैंक से जुड़ा है (myAadhaar → Bank Seeding Status), ताकि भुगतान भेजे जाने पर फ़ेल न हो।")],
      links: ["aadhaarBank"] });
  }

  // Nothing obvious, or waiting long — escalate properly.
  const likely = out.some(c => c.level === "likely");
  if (!likely || r.wait === "gt3") {
    add({ id: "escalate", level: likely ? "info" : "likely",
      title: likely ? t("If it still doesn't come", "अगर फिर भी न आए") : t("Everything looks fine — ask the department", "सब ठीक लगता है — विभाग से पूछें"),
      why: t("When the bank side is fine, the payment is usually stuck at the department (verification, budget or a data error). A written complaint gets a tracking number and a reply.",
             "बैंक की तरफ़ सब ठीक हो, तो भुगतान आम तौर पर विभाग में अटका होता है (सत्यापन, बजट या डेटा की गलती)। लिखित शिकायत पर ट्रैकिंग नंबर और जवाब मिलता है।"),
      fix: [t(`Call the scheme's helpline or visit the office with your application number${ref}. Ask: "Was the payment sent, and if it failed, why?"`, `आवेदन नंबर${ref} के साथ योजना की हेल्पलाइन पर कॉल करें या कार्यालय जाएं। पूछें: "क्या भुगतान भेजा गया, और फ़ेल हुआ तो क्यों?"`),
            ...(tr.central ? [t("For Central schemes, check PFMS → \"Know Your Payments\" with your bank account number to see if a payment was attempted.", "केंद्र की योजनाओं के लिए PFMS → \"Know Your Payments\" पर बैंक खाता नंबर से देखें कि भुगतान भेजा गया या नहीं।")] : []),
            t("No answer in 2–3 weeks? File a complaint on CPGRAMS (it covers Central and State departments) or your state's CM helpline — keep the complaint number.", "2–3 हफ़्ते में जवाब नहीं? CPGRAMS (केंद्र व राज्य दोनों विभाग) या राज्य की CM हेल्पलाइन पर शिकायत करें — शिकायत नंबर संभाल कर रखें।")],
      links: [...(tr.central ? ["pfms"] : []), "cpgrams"] });
  }
  return out;
}
