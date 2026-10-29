// src/GlobalSearch.jsx — Yojana Sahay · one search for the whole app
// ─────────────────────────────────────────────────────────────────────────────
// Opened from the 🔍 icon on the Home header. One box finds:
//   • things to DO in the app  — "eligibility", "my applications", "kist kab
//     aayegi", "fake message", "dark mode"… (English, Hindi and Hinglish)
//   • SCHEMES                  — by name, benefit, ministry, state or topic
//   • and always offers "Ask AI" with the exact words typed
// Loaded lazily (React.lazy) so the home screen stays as light as before.
// The parent (App.jsx) performs the action through onAction({ kind, … }).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useMemo, useDeferredValue } from "react";
import { SCHEME_DB } from "./schemesData.js";

const RECENT_KEY = "ys_gsearch_recent";
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

// What the app can do — each with plain words people actually type.
const FEATURES = [
  { id: "eligibility", icon: "🎯", t: ["Check my eligibility", "मेरी पात्रता जांचें"], d: ["Answer a few questions — see every scheme you qualify for", "कुछ सवालों के जवाब दें — अपनी सभी योजनाएं देखें"],
    k: "eligibility eligible qualify which schemes can i get kaun si yojana milegi kaunsi yojana patrata checker quiz my schemes पात्रता योग्य कौन सी योजना मिलेगी जांच", a: { kind: "checker" } },
  { id: "myapps", icon: "🗂️", t: ["My Applications", "मेरे आवेदन"], d: ["Schemes you applied for, their status and check reminders", "जिन योजनाओं में आवेदन किया — स्थिति और याद"],
    k: "my applications application applied track tracking status aavedan avedan mera aavedan reference number मेरे आवेदन आवेदन ट्रैक स्थिति", a: { kind: "myapps" } },
  { id: "calendar", icon: "📅", t: ["My Money Calendar", "मेरा पैसा कैलेंडर"], d: ["When scheme money usually comes — with reminders", "योजना का पैसा कब आता है — याद दिलाने के साथ"],
    k: "money calendar payment installment instalment kist kisht kab aayega paisa kab milega date dbt पैसा किस्त कैलेंडर कब आएगा", a: { kind: "scroll", target: "home-calendar" } },
  { id: "benefits", icon: "💰", t: ["Govt. money you can receive", "आपको मिल सकने वाला सरकारी पैसा"], d: ["Your yearly benefit estimate", "आपका सालाना लाभ अनुमान"],
    k: "how much money total benefit estimate calculator kitna paisa kitna milega yearly annual लाभ कितना पैसा कुल", a: { kind: "scroll", target: "home-benefits", fallback: { kind: "checker" } } },
  { id: "family", icon: "👨‍👩‍👧", t: ["Family Benefits", "परिवार के लाभ"], d: ["Find schemes for your wife, children and parents", "पत्नी, बच्चों और माता-पिता के लिए योजनाएं"],
    k: "family wife husband mother father parents children son daughter beti beta maa papa parivar household परिवार पत्नी पति बच्चे माता पिता बेटी बेटा", a: { kind: "scroll", target: "home-family" } },
  { id: "life", icon: "🌱", t: ["Life events", "जीवन की घटनाएं"], d: ["Pregnancy, marriage, college, lost job, building a house…", "गर्भावस्था, शादी, कॉलेज, नौकरी छूटना, घर बनाना…"],
    k: "life event pregnancy pregnant baby marriage shaadi wedding job lost job naukri college house ghar death retirement 60 disability गर्भ शादी नौकरी कॉलेज घर मृत्यु", a: { kind: "scroll", target: "home-life" } },
  { id: "docs", icon: "📋", t: ["Document checklist", "दस्तावेज़ सूची"], d: ["Every document your schemes need, ticked off as you collect them", "आपकी योजनाओं के सभी दस्तावेज़ — जमा होते ही टिक करें"],
    k: "documents document papers kagaz kagzat certificate aadhaar income certificate checklist vault दस्तावेज़ कागज़ प्रमाण पत्र आधार", a: { kind: "scroll", target: "home-docs" } },
  { id: "reminders", icon: "🔔", t: ["Phone reminders", "फ़ोन पर याद दिलाना"], d: ["Deadline and application reminders on your phone", "आखिरी तारीख और आवेदन की याद फ़ोन पर"],
    k: "reminder reminders notification notifications notify alert alerts deadline push yaad याद सूचना नोटिफिकेशन", a: { kind: "scroll", target: "home-push", fallback: { kind: "tab", tab: "profile" } } },
  { id: "news", icon: "📰", t: ["Latest scheme news", "योजनाओं की ताज़ा खबर"], d: ["New schemes, deadlines and updates", "नई योजनाएं, तारीखें और अपडेट"],
    k: "news latest update updates new scheme khabar samachar खबर समाचार नया", a: { kind: "scroll", target: "home-news" } },
  { id: "categories", icon: "🗃️", t: ["Browse by category", "श्रेणी से देखें"], d: ["Farmer, Student, Women, Senior, Health, Housing…", "किसान, छात्र, महिला, वरिष्ठ, स्वास्थ्य, आवास…"],
    k: "category categories farmer student women senior business housing health insurance pension skill labour food rural disability solar maternity श्रेणी किसान छात्र महिला", a: { kind: "scroll", target: "home-categories" } },
  { id: "matched", icon: "⭐", t: ["Matched for you", "आपके लिए चुनी गई"], d: ["Your best-matching schemes", "आपकी सबसे सही योजनाएं"],
    k: "matched for me recommended best schemes for me mere liye meri yojana मेरे लिए", a: { kind: "scroll", target: "home-matched", fallback: { kind: "checker" } } },
  { id: "ai", icon: "🤖", t: ["Ask the AI assistant", "AI सहायक से पूछें"], d: ["Questions, documents, comparisons, how to apply", "सवाल, दस्तावेज़, तुलना, आवेदन कैसे करें"],
    k: "ai chat assistant ask help sahayak bot question how to apply compare पूछें सहायक मदद", a: { kind: "tab", tab: "ai" } },
  { id: "scam", icon: "🛡️", t: ["Is this message real or fake?", "यह मैसेज असली है या नकली?"], d: ["Paste a message or link — the AI checks it for scams", "मैसेज या लिंक डालें — AI धोखे की जांच करेगा"],
    k: "fake real scam fraud genuine safe message sms whatsapp link otp asli nakli farzi dhokha thagi असली नकली फर्जी धोखा ठगी लिंक मैसेज", a: { kind: "ai-draft", text: ["Is this message real? ", "क्या यह मैसेज असली है? "] } },
  { id: "compare", icon: "⚖️", t: ["Compare schemes", "योजनाओं की तुलना"], d: ["Side by side, by the AI", "AI से आमने-सामने तुलना"],
    k: "compare comparison vs versus difference better tulna तुलना फर्क अंतर", a: { kind: "ai-draft", text: ["Compare ", "तुलना करें: "] } },
  { id: "all", icon: "📚", t: ["All schemes, filters & states", "सभी योजनाएं, फ़िल्टर और राज्य"], d: ["Every scheme with state selector and filters", "राज्य चुनकर और फ़िल्टर के साथ सभी योजनाएं"],
    k: "all schemes list browse filter filters state states sort सभी योजनाएं राज्य फ़िल्टर सूची", a: { kind: "tab", tab: "schemes" } },
  { id: "profile", icon: "👤", t: ["My profile", "मेरी प्रोफ़ाइल"], d: ["Edit your details, sign in or out, settings", "अपनी जानकारी बदलें, साइन इन/आउट, सेटिंग्स"],
    k: "profile account edit profile my details name age income settings login sign in logout sign out प्रोफ़ाइल खाता सेटिंग लॉगिन", a: { kind: "tab", tab: "profile" } },
  { id: "help", icon: "☎️", t: ["Helpline, About & Contact", "हेल्पलाइन, परिचय और संपर्क"], d: ["Found in Profile → Help", "प्रोफ़ाइल → मदद में"],
    k: "helpline help contact about support call phone number email report problem हेल्पलाइन संपर्क मदद शिकायत", a: { kind: "tab", tab: "profile" } },
  { id: "faq", icon: "❓", t: ["FAQ", "अक्सर पूछे जाने वाले सवाल"], d: ["How the app works, safety, data", "ऐप कैसे काम करता है, सुरक्षा, डेटा"],
    k: "faq questions how it works is it free safe trust privacy सवाल जवाब मुफ्त सुरक्षित", a: { kind: "faq" } },
  { id: "dark", icon: "🌓", t: ["Dark / light mode", "डार्क / लाइट मोड"], d: ["Switch the app's look", "ऐप का रंग बदलें"],
    k: "dark mode light mode night theme colour color डार्क लाइट थीम", a: { kind: "toggleDark" } },
  { id: "lang", icon: "🔤", t: ["हिंदी / English", "हिंदी / English"], d: ["Change the app language", "ऐप की भाषा बदलें"],
    k: "language hindi english bhasha भाषा हिंदी अंग्रेज़ी", a: { kind: "toggleLang" } },
].map(f => ({ ...f, hay: norm(`${f.t[0]} ${f.t[1]} ${f.k}`), titleN: norm(`${f.t[0]} ${f.t[1]}`) }));

// Duplicate listings point to a main entry — show / count only the main one.
const MAIN = SCHEME_DB.filter(s => !s.duplicateOf);
const STATES = [...new Set(MAIN.map(s => s.state).filter(Boolean))];
const SCHEME_INDEX = MAIN.map(s => ({
  s,
  name: norm(s.name?.en),
  nameHi: norm(s.name?.hi),
  rest: norm(`${s.tag?.en ?? ""} ${s.tag?.hi ?? ""} ${s.ministry?.en ?? ""} ${s.state ?? (s.scope === "national" ? "central india" : "")} ${s.benefit?.en ?? ""}`),
}));

function scoreFeature(f, q, words) {
  if (!q) return 0;
  let sc = 0;
  if (f.titleN.startsWith(q)) sc += 60;
  else if (f.titleN.includes(q)) sc += 40;
  else if (f.hay.includes(q)) sc += 28;
  const hits = words.filter(w => w.length >= 2 && f.hay.includes(w)).length;
  if (!sc && hits < Math.max(1, Math.ceil(words.length * 0.6))) return 0;
  return sc + hits * 8;
}

function scoreScheme(x, q, words, tags) {
  let sc = 0;
  if (x.name === q || x.nameHi === q) sc += 120;
  else if (x.name.startsWith(q) || x.nameHi.startsWith(q)) sc += 70;
  else if (x.name.includes(q) || x.nameHi.includes(q)) sc += 45;
  let allHit = true;
  for (const w of words) {
    if (x.name.includes(w) || x.nameHi.includes(w)) sc += 10;
    else if (x.rest.includes(w)) sc += 4;
    else allHit = false;
  }
  const smart = tags?.size && x.s.keywords?.some(k => tags.has(k));
  if (smart) sc += 14;
  if (!allHit && !smart && sc < 45) return 0;
  return sc + (x.s.scope === "national" ? 1 : 0);
}

function readRecent() { try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(v) ? v.slice(0, 6) : []; } catch { return []; } }
function saveRecent(q) {
  const t = String(q || "").trim(); if (t.length < 2) return;
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...readRecent().filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6))); } catch {}
}

const SpeechRec = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function GlobalSearch({ lang = "en", dark = false, onClose, onAction, expandTags = null, appsCount = 0, theme, startVoice = false }) {
  const hi = lang === "hi";
  const L = (pair) => (Array.isArray(pair) ? (hi ? pair[1] : pair[0]) : pair);
  const th = theme;
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState(readRecent);
  const [closing, setClosing] = useState(false);
  const dq = useDeferredValue(q);
  const inputRef = useRef(null);
  // 🎤 speak to search (phone's own speech recognition; also the widget's mic button)
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState("");
  const recRef = useRef(null);
  const startMic = () => {
    if (!SpeechRec || listening) return;
    try {
      const rec = new SpeechRec();
      rec.lang = hi ? "hi-IN" : "en-IN";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        let txt = "";
        for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        if (txt.trim()) setQ(txt.trim());
      };
      rec.onerror = (e) => {
        setMicNote(e.error === "not-allowed" || e.error === "service-not-allowed"
          ? (hi ? "माइक की अनुमति दें" : "Allow microphone access to speak")
          : e.error === "no-speech" ? (hi ? "कुछ सुनाई नहीं दिया — फिर कोशिश करें" : "Didn't catch that — try again") : "");
      };
      rec.onend = () => { setListening(false); recRef.current = null; };
      recRef.current = rec;
      setMicNote("");
      setListening(true);
      rec.start();
    } catch { setListening(false); }
  };
  const stopMic = () => { try { recRef.current?.stop(); } catch {} };
  useEffect(() => () => { try { recRef.current?.abort(); } catch {} }, []);
  useEffect(() => { if (startVoice) { const t = setTimeout(startMic, 350); return () => clearTimeout(t); } }, [startVoice]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { setClosing(true); setTimeout(() => onClose?.(), 160); };
  const run = (action, label) => {
    if (label) saveRecent(label);
    setClosing(true);
    setTimeout(() => { onClose?.(); onAction?.(action); }, 140);
  };

  const { features, schemes, stateHit } = useMemo(() => {
    const nq = norm(dq);
    if (!nq) return { features: [], schemes: [], stateHit: null };
    const words = nq.split(" ").filter(Boolean);
    const tags = expandTags ? expandTags(dq) : null;
    const features = FEATURES.map(f => ({ f, sc: scoreFeature(f, nq, words) })).filter(x => x.sc > 0)
      .sort((a, b) => b.sc - a.sc).slice(0, 4).map(x => x.f);
    const schemes = SCHEME_INDEX.map(x => ({ s: x.s, sc: scoreScheme(x, nq, words, tags) })).filter(x => x.sc > 0)
      .sort((a, b) => b.sc - a.sc).map(x => x.s);
    const st = STATES.find(n => norm(n) === nq || (nq.length >= 4 && norm(n).startsWith(nq)));
    const stateHit = st ? { name: st, count: MAIN.filter(s => s.state === st).length } : null;
    return { features, schemes, stateHit };
  }, [dq, expandTags]);

  const trimmed = q.trim();
  const shownSchemes = schemes.slice(0, 7);
  // A real question ("what documents for pm kisan", "kab milega", "कैसे…?")
  // goes to the AI on Enter; short lookups open the best match.
  const isQuestion = /\?|^(what|how|when|why|which|where|who|can|is|are|do|does|kya|kaise|kab|kaun|kitna|kitni|kahan|kyu|kyon|क्या|कैसे|कब|कौन|कितन|कहाँ|कहां|क्यों)\b/i.test(trimmed) || trimmed.split(/\s+/).length >= 5;
  const first = trimmed.length >= 2 && isQuestion ? () => run({ kind: "ai", q: trimmed }, trimmed)
    : features[0]
    ? () => run(featureAction(features[0]), trimmed)
    : shownSchemes[0] ? () => run({ kind: "scheme", id: shownSchemes[0].id }, trimmed)
    : trimmed.length >= 2 ? () => run({ kind: "ai", q: trimmed }, trimmed) : null;

  function featureAction(f) {
    if (f.id === "myapps" && !appsCount) return { kind: "tab", tab: "schemes", note: "myapps-empty" };
    if (f.a.kind === "ai-draft") return { kind: "ai-draft", text: L(f.a.text) };
    return f.a;
  }
  const featureDesc = (f) => (f.id === "myapps" && !appsCount
    ? (hi ? "अभी कोई आवेदन नहीं — योजना खोलें और \"मैंने आवेदन किया\" दबाएं" : "Nothing tracked yet — open a scheme and tap \"I've applied\"")
    : L(f.d));

  const card = dark ? "#1A1B1F" : "#FFFFFF";
  const line = dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)";
  const sub = dark ? "rgba(203,213,225,0.62)" : "#64748B";
  const bf = hi ? "'Noto Sans Devanagari','Noto Sans',sans-serif" : "'Noto Sans',system-ui,sans-serif";

  const Section = ({ title, children }) => (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: sub, margin: "0 4px 7px" }}>{title}</div>
      <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 16, overflow: "hidden" }}>{children}</div>
    </div>
  );
  const Row = ({ icon, title, desc, onClick, accent, idx = 0 }) => (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => { if (e.key === "Enter") onClick(); }}
      style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", cursor: "pointer", borderTop: idx ? `1px solid ${line}` : "none",
        WebkitTapHighlightColor: "transparent" }}>
      <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
        background: accent || (dark ? "rgba(255,255,255,0.05)" : "#F1F5F9") }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: th.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        {desc && <span style={{ display: "block", fontSize: 11.5, color: sub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</span>}
      </span>
      <span aria-hidden="true" style={{ color: sub, fontSize: 16, flexShrink: 0 }}>›</span>
    </div>
  );

  const SUGGEST = [
    { label: hi ? "पात्रता जांचें" : "Check eligibility", act: () => run({ kind: "checker" }) },
    { label: hi ? "मेरे आवेदन" : "My Applications", act: () => run(featureAction(FEATURES.find(f => f.id === "myapps"))) },
    { label: hi ? "छात्रवृत्ति" : "Scholarship", act: () => setQ(hi ? "छात्रवृत्ति" : "scholarship") },
    { label: hi ? "पेंशन" : "Pension", act: () => setQ(hi ? "पेंशन" : "pension") },
    { label: hi ? "परिवार के लाभ" : "Family benefits", act: () => run({ kind: "scroll", target: "home-family" }) },
    { label: hi ? "नकली मैसेज जांच" : "Fake message check", act: () => run(featureAction(FEATURES.find(f => f.id === "scam"))) },
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label={hi ? "खोजें" : "Search"}
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: dark ? "rgba(10,10,12,0.97)" : "rgba(246,247,249,0.98)", fontFamily: bf,
        display: "flex", flexDirection: "column",
        animation: closing ? "ys-gs-out .16s ease-in forwards" : "ys-gs-in .2s ease-out" }}>
      <style>{`@keyframes ys-gs-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}@keyframes ys-gs-out{to{opacity:0;transform:translateY(-6px)}}@keyframes ys-gs-mic{0%,100%{box-shadow:0 0 0 0 rgba(124,92,255,.45)}50%{box-shadow:0 0 0 7px rgba(124,92,255,0)}}`}</style>
      {/* Search bar */}
      <div style={{ padding: "calc(10px + env(safe-area-inset-top)) 12px 10px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${line}` }}>
        <button type="button" onClick={close} aria-label={hi ? "बंद करें" : "Close"}
          style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: "transparent", color: th.text, fontSize: 20, cursor: "pointer", flexShrink: 0 }}>‹</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: card, border: `1px solid ${line}`, borderRadius: 14, padding: "0 12px", height: 44 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={sub} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} enterKeyHint="search"
            onKeyDown={e => { if (e.key === "Enter" && first) { e.preventDefault(); first(); } }}
            placeholder={hi ? "योजना, सुविधा या सवाल खोजें…" : "Search schemes, features or ask…"}
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: th.text, fontSize: 15, fontFamily: bf }} />
          {q && <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label={hi ? "साफ़ करें" : "Clear"}
            style={{ border: "none", background: dark ? "rgba(255,255,255,0.1)" : "#E2E8F0", color: th.text, width: 22, height: 22, borderRadius: "50%", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>✕</button>}
          {SpeechRec && (listening || !q) && (
            <button type="button" onClick={listening ? stopMic : startMic}
              aria-label={listening ? (hi ? "सुनना बंद करें" : "Stop listening") : (hi ? "बोलकर खोजें" : "Search by voice")}
              style={{ border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: listening ? "linear-gradient(135deg,#FF6B6B,#7C5CFF)" : "transparent",
                animation: listening ? "ys-gs-mic 1.1s ease-in-out infinite" : "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill={listening ? "#fff" : sub} d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
            </button>
          )}
        </div>
      </div>

      {(listening || micNote) && (
        <div role="status" style={{ padding: "8px 16px 0", fontSize: 12.5, fontWeight: 700, color: listening ? "#7C5CFF" : sub }}>
          {listening ? (hi ? "बोलिए… जैसे “किसान योजना”" : "Listening… say something like “farmer scheme”") : micNote}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 14px calc(24px + env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch" }}>
        {!trimmed && (
          <>
            {recent.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", margin: "0 4px 7px" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: sub }}>{hi ? "हाल की खोज" : "Recent"}</span>
                  <span role="button" onClick={() => { try { localStorage.removeItem(RECENT_KEY); } catch {} setRecent([]); }}
                    style={{ marginLeft: "auto", fontSize: 11, color: sub, cursor: "pointer" }}>{hi ? "मिटाएं" : "Clear"}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {recent.map(r => (
                    <span key={r} role="button" onClick={() => setQ(r)}
                      style={{ fontSize: 12.5, padding: "6px 12px", borderRadius: 99, background: card, border: `1px solid ${line}`, color: th.text, cursor: "pointer" }}>🕘 {r}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.9, textTransform: "uppercase", color: sub, margin: "0 4px 7px" }}>{hi ? "सुझाव" : "Try"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {SUGGEST.map(sg => (
                  <span key={sg.label} role="button" onClick={sg.act}
                    style={{ fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 99, background: card, border: `1px solid ${line}`, color: th.text, cursor: "pointer" }}>{sg.label}</span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: sub, lineHeight: 1.6, padding: "0 4px" }}>
              {hi ? "योजना का नाम, ज़रूरत (जैसे \"बेटी की पढ़ाई\"), या ऐप की कोई सुविधा लिखें — हिंदी, English या Hinglish में।"
                  : "Type a scheme, a need (like \"loan for shop\") or anything in the app — English, Hindi or Hinglish."}
            </div>
          </>
        )}

        {trimmed.length >= 2 && isQuestion && (
          <Section title={hi ? "AI से पूछें" : "Ask AI"}>
            <Row icon="✨" accent="linear-gradient(135deg,rgba(255,153,51,0.22),rgba(99,102,241,0.22))"
              title={`“${trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed}”`}
              desc={hi ? "AI सहायक इसका जवाब देगा · Enter दबाएं" : "The AI assistant will answer this · press Enter"}
              onClick={() => run({ kind: "ai", q: trimmed }, trimmed)} />
          </Section>
        )}

        {trimmed && features.length > 0 && (
          <Section title={hi ? "ऐप में करें" : "In the app"}>
            {features.map((f, i) => <Row key={f.id} idx={i} icon={f.icon} title={L(f.t)} desc={featureDesc(f)} onClick={() => run(featureAction(f), trimmed)} />)}
          </Section>
        )}

        {trimmed && (shownSchemes.length > 0 || stateHit) && (
          <Section title={hi ? `योजनाएं${schemes.length ? ` · ${schemes.length}` : ""}` : `Schemes${schemes.length ? ` · ${schemes.length}` : ""}`}>
            {stateHit && (
              <Row icon="📍" accent={dark ? "rgba(255,153,51,0.14)" : "#FFF3E6"}
                title={hi ? `${stateHit.name} की सभी योजनाएं` : `All schemes in ${stateHit.name}`}
                desc={hi ? `${stateHit.count} योजनाएं + केंद्र की योजनाएं` : `${stateHit.count} state schemes + Central schemes`}
                onClick={() => run({ kind: "search", q: stateHit.name }, trimmed)} />
            )}
            {shownSchemes.map((s, i) => (
              <Row key={s.id} idx={i + (stateHit ? 1 : 0)} icon={s.icon || "📄"}
                title={s.name?.[lang] || s.name?.en}
                desc={`${s.scope === "national" ? (hi ? "केंद्र" : "Central") : (s.state || "")}${s.benefit?.[lang] || s.benefit?.en ? ` · ${s.benefit?.[lang] || s.benefit?.en}` : ""}`}
                onClick={() => run({ kind: "scheme", id: s.id }, trimmed)} />
            ))}
            {schemes.length > shownSchemes.length && (
              <Row idx={1} icon="🔎" title={hi ? `सभी ${schemes.length} परिणाम देखें` : `See all ${schemes.length} results`}
                desc={hi ? "खोज टैब में" : "in the Search tab"} onClick={() => run({ kind: "search", q: trimmed }, trimmed)} />
            )}
          </Section>
        )}

        {trimmed.length >= 2 && !isQuestion && (
          <Section title={hi ? "AI से पूछें" : "Ask AI"}>
            <Row icon="✨" accent="linear-gradient(135deg,rgba(255,153,51,0.22),rgba(99,102,241,0.22))"
              title={`“${trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed}”`}
              desc={hi ? "AI सहायक इसका जवाब देगा" : "The AI assistant will answer this"}
              onClick={() => run({ kind: "ai", q: trimmed }, trimmed)} />
          </Section>
        )}

        {trimmed && !features.length && !shownSchemes.length && !stateHit && (
          <div style={{ marginTop: 18, fontSize: 12.5, color: sub, textAlign: "center", lineHeight: 1.6 }}>
            {hi ? "कोई सीधा परिणाम नहीं — ऊपर AI से पूछें, वह मदद करेगा।" : "No direct match — ask the AI above, it can help."}
          </div>
        )}
      </div>
    </div>
  );
}
