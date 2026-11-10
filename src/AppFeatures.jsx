// src/AppFeatures.jsx — "Made for your phone": what only the Android app can do
// ─────────────────────────────────────────────────────────────────────────────
// Shown once, a moment after the Android app first opens, and any time from
// Profile → "App features". Each row is something the website can't do, with a
// button that does it right there: put a widget on the home screen, turn on
// deadline notifications, search by voice. Never shown on the website.
import React, { useEffect, useState } from "react";

const SEEN_KEY = "ys_app_features_seen";

export const isNativeApp = () =>
  typeof window !== "undefined" && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

export function appFeaturesSeen() {
  try { return localStorage.getItem(SEEN_KEY) === "1"; } catch { return true; }
}
export function markAppFeaturesSeen() {
  try { localStorage.setItem(SEEN_KEY, "1"); } catch {}
}

const native = (plugin, method, args = {}) => {
  const C = window.Capacitor;
  if (!C || !C.isPluginAvailable || !C.isPluginAvailable(plugin)) return Promise.reject(new Error("unavailable"));
  return C.nativePromise(plugin, method, args);
};

// ── icons (stroke SVG, inherit colour) ──────────────────────────────────────
const I = {
  widget: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/></>,
  bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 20a1.9 1.9 0 0 0 3.4 0"/></>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4"/><path d="M8 21h8"/></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>,
  offline: <><path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5.5 12a10 10 0 0 1 13 0"/><path d="M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1.2"/></>,
  speaker: <><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></>,
  check: <path d="M20 6L9 17l-5-5"/>,
  close: <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
};
const Icon = ({ d, size = 20, sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export default function AppFeatures({ lang = "en", dark = false, onClose, pushSlot = null, signedIn = false, onSignIn, schemeCount }) {
  const hi = lang === "hi";
  const L = (en, h) => (hi ? h : en);
  const [canPin, setCanPin] = useState(null);       // null = checking
  const [pinned, setPinned] = useState({});          // kind → true once asked
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let live = true;
    native("YSWidget", "canPin").then(r => live && setCanPin(!!(r && r.supported))).catch(() => live && setCanPin(false));
    const t = requestAnimationFrame(() => setShown(true));
    const onKey = e => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { live = false; cancelAnimationFrame(t); window.removeEventListener("keydown", onKey); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { setShown(false); markAppFeaturesSeen(); setTimeout(() => onClose && onClose(), 220); };
  const pin = kind => {
    native("YSWidget", "pin", { kind }).then(r => { if (r && r.requested) setPinned(p => ({ ...p, [kind]: true })); }).catch(() => setCanPin(false));
  };
  const go = g => { close(); setTimeout(() => { try { window.__ysGo && window.__ysGo(g); } catch {} }, 260); };

  const C = dark ? {
    sheet: "#111826", card: "#182233", border: "rgba(255,255,255,0.08)", text: "#F1F4F9", sub: "rgba(241,244,249,0.62)",
    chipBg: "rgba(255,255,255,0.06)", btn: "#F59E0B", btnText: "#111", ghost: "rgba(255,255,255,0.08)", ghostText: "#F1F4F9",
  } : {
    sheet: "#FFFFFF", card: "#F6F8FB", border: "rgba(11,42,91,0.09)", text: "#0F1B2D", sub: "#5B6575",
    chipBg: "rgba(11,42,91,0.06)", btn: "#0B2A5B", btnText: "#fff", ghost: "rgba(11,42,91,0.07)", ghostText: "#0B2A5B",
  };
  const ACC = { widget: "#2F6FDB", bell: "#E8730C", mic: "#7C3AED", shield: "#0E9F6E", offline: "#0891B2", speaker: "#DB2777" };
  const font = hi ? "'Noto Sans Devanagari','Noto Sans',system-ui,sans-serif" : "'DM Sans','Noto Sans',system-ui,sans-serif";

  const btn = (label, onClick, { ghost = false, done = false } = {}) => (
    <button type="button" onClick={onClick} disabled={done} style={{
      border: 0, borderRadius: 10, padding: "8px 12px", fontFamily: font, fontSize: 12.5, fontWeight: 700, cursor: done ? "default" : "pointer",
      background: done ? "rgba(14,159,110,0.14)" : ghost ? C.ghost : C.btn, color: done ? "#0E9F6E" : ghost ? C.ghostText : C.btnText,
      display: "inline-flex", alignItems: "center", gap: 6, WebkitTapHighlightColor: "transparent",
    }}>{done && <Icon d={I.check} size={14} sw={2.6} />}{label}</button>
  );

  const rows = [
    {
      k: "widget",
      title: L("Home-screen widgets", "होम स्क्रीन विजेट"),
      desc: L("See your next scheme deadlines, or start a search, straight from your phone's home screen.",
              "अपने फ़ोन की होम स्क्रीन से ही योजनाओं की आखिरी तारीखें देखें या खोज शुरू करें।"),
      action: canPin ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {btn(pinned.quick ? L("Added", "जोड़ा गया") : L("Add deadline widget", "तारीख विजेट जोड़ें"), () => pin("quick"), { done: pinned.quick })}
          {btn(pinned.search ? L("Added", "जोड़ा गया") : L("Add search widget", "खोज विजेट जोड़ें"), () => pin("search"), { ghost: !pinned.search, done: pinned.search })}
        </div>
      ) : canPin === false ? (
        <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.5 }}>
          {L("Touch and hold an empty part of your home screen → Widgets → Yojana Sahay.",
             "होम स्क्रीन पर खाली जगह को दबाकर रखें → विजेट → योजना सहाय।")}
        </div>
      ) : null,
    },
    {
      k: "bell",
      title: L("Deadline reminders", "आखिरी तारीख के रिमाइंडर"),
      desc: L("A notification on this phone before a scheme's last date — even when the app is closed.",
              "योजना की आखिरी तारीख से पहले इस फ़ोन पर सूचना — ऐप बंद होने पर भी।"),
      action: signedIn ? pushSlot : btn(L("Sign in to turn on", "चालू करने के लिए साइन इन करें"), () => { close(); setTimeout(() => onSignIn && onSignIn(), 260); }, { ghost: true }),
    },
    {
      k: "mic",
      title: L("Search by speaking", "बोलकर खोजें"),
      desc: L("Say the scheme or benefit you need, in Hindi or English.", "जो योजना या लाभ चाहिए, हिंदी या अंग्रेज़ी में बोलें।"),
      action: btn(L("Try it", "आज़माएं"), () => go("voice")),
    },
    {
      k: "shield",
      title: L("Is this message real?", "क्या यह संदेश असली है?"),
      desc: L("Got a WhatsApp forward about a scheme? Share it to Yojana Sahay to check it before you trust it.",
              "किसी योजना के बारे में WhatsApp फ़ॉरवर्ड मिला? भरोसा करने से पहले उसे योजना सहाय पर शेयर करके जाँचें।"),
      note: L("In WhatsApp: hold the message → Share → Yojana Sahay", "WhatsApp में: संदेश दबाकर रखें → शेयर → योजना सहाय"),
    },
    {
      k: "offline",
      title: L("Works without internet", "बिना इंटरनेट के भी"),
      desc: L(`All ${schemeCount ? schemeCount.toLocaleString("en-IN") + " " : ""}schemes are stored inside the app, so you can browse them anywhere. Only the AI Assistant needs internet.`,
              `सभी ${schemeCount ? schemeCount.toLocaleString("en-IN") + " " : ""}योजनाएं ऐप के अंदर रखी हैं, इसलिए कहीं भी देख सकते हैं। सिर्फ़ AI सहायक को इंटरनेट चाहिए।`),
    },
    {
      k: "speaker",
      title: L("Read aloud", "पढ़कर सुनाएं"),
      desc: L("Listen to any scheme's details in Hindi or English, with your phone's own voice.", "किसी भी योजना की जानकारी हिंदी या अंग्रेज़ी में सुनें।"),
    },
  ];

  return (
    <div role="dialog" aria-modal="true" aria-label={L("App features", "ऐप की सुविधाएं")}
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: shown ? "rgba(6,12,24,0.55)" : "rgba(6,12,24,0)", transition: "background 220ms ease",
      }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", WebkitOverflowScrolling: "touch",
        background: C.sheet, color: C.text, fontFamily: font, borderRadius: "22px 22px 0 0",
        padding: "10px 18px calc(18px + env(safe-area-inset-bottom))", boxSizing: "border-box",
        transform: shown ? "translate3d(0,0,0)" : "translate3d(0,100%,0)", transition: "transform 260ms cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.25)",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: C.border, margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <img src="/icons/app-icon-192.png" alt="" width="44" height="44" style={{ borderRadius: 12, flexShrink: 0, background: "#fff" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "#E8730C" }}>
              {L("Only in the app", "सिर्फ़ ऐप में")}
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>{L("Made for your phone", "आपके फ़ोन के लिए बना")}</div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3, lineHeight: 1.45 }}>
              {L("Things the Yojana Sahay app does that a website can't.", "योजना सहाय ऐप ये काम करता है, जो वेबसाइट नहीं कर सकती।")}
            </div>
          </div>
          <button type="button" aria-label={L("Close", "बंद करें")} onClick={close} style={{
            border: 0, background: C.chipBg, color: C.sub, width: 34, height: 34, borderRadius: 17, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}><Icon d={I.close} size={16} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {rows.map(r => (
            <div key={r.k} style={{ display: "flex", gap: 12, padding: "12px 12px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}` }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                color: ACC[r.k], background: ACC[r.k] + (dark ? "26" : "16"),
              }}><Icon d={I[r.k]} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, marginTop: 2 }}>{r.desc}</div>
                {r.note && <div style={{ fontSize: 11.5, color: C.text, opacity: 0.8, marginTop: 6, padding: "6px 8px", borderRadius: 8, background: C.chipBg, lineHeight: 1.45 }}>{r.note}</div>}
                {r.action && <div style={{ marginTop: 9 }}>{r.action}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: C.chipBg, fontSize: 11.5, lineHeight: 1.5, color: C.sub }}>
          <b style={{ color: C.text }}>{L("Independent app.", "स्वतंत्र ऐप।")}</b>{" "}
          {L("Yojana Sahay is not a government app and is not linked to any government department. Always apply on the official website or office shown for each scheme.",
             "योजना सहाय सरकारी ऐप नहीं है और किसी सरकारी विभाग से जुड़ा नहीं है। हर योजना के लिए बताई गई आधिकारिक वेबसाइट या दफ़्तर पर ही आवेदन करें।")}
        </div>

        <button type="button" onClick={close} style={{
          width: "100%", marginTop: 12, border: 0, borderRadius: 14, padding: "13px 16px", fontFamily: font, fontSize: 14.5, fontWeight: 800,
          background: C.btn, color: C.btnText, cursor: "pointer",
        }}>{L("Continue", "आगे बढ़ें")}</button>
      </div>
    </div>
  );
}


// ── "Update available" — asked before anything is downloaded ────────────────
// The Android app gets newer scheme information and fixes as small updates.
// Nothing downloads until the person taps "Update now" (or chose to always
// update automatically); the size is shown first.
export function UpdatePrompt({ lang = "en", dark = false, size = 0, onClose }) {
  const hi = lang === "hi";
  const L = (en, h) => (hi ? h : en);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [auto, setAuto] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t); }, []);
  const mb = size > 0 ? (size / 1048576 < 0.1 ? "0.1" : (size / 1048576).toFixed(1)) : null;
  const C = dark
    ? { sheet: "#111826", text: "#F1F4F9", sub: "rgba(241,244,249,0.62)", chip: "rgba(255,255,255,0.06)", btn: "#F59E0B", btnText: "#111", ghost: "rgba(255,255,255,0.08)", ghostText: "#F1F4F9" }
    : { sheet: "#FFFFFF", text: "#0F1B2D", sub: "#5B6575", chip: "rgba(11,42,91,0.06)", btn: "#0B2A5B", btnText: "#fff", ghost: "rgba(11,42,91,0.07)", ghostText: "#0B2A5B" };
  const font = hi ? "'Noto Sans Devanagari','Noto Sans',system-ui,sans-serif" : "'DM Sans','Noto Sans',system-ui,sans-serif";
  const close = (choice) => {
    if (busy) return;
    if (choice === "later") { try { window.ysNative && window.ysNative.liveUpdate && window.ysNative.liveUpdate("later"); } catch {} }
    setShown(false); setTimeout(() => onClose && onClose(), 220);
  };
  const updateNow = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    let r = null;
    try { r = await window.ysNative.liveUpdate(auto ? "auto" : "now"); } catch (e) { r = { ok: false, error: e && e.message }; }
    if (!r || !r.ok) { setBusy(false); setErr(L("Couldn't download the update. Check your internet and try again.", "अपडेट डाउनलोड नहीं हो पाया। इंटरनेट जाँचकर फिर कोशिश करें।")); }
    // on success the app restarts on the new version by itself
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={L("Update available", "अपडेट उपलब्ध है")} onClick={() => close("later")}
      style={{ position: "fixed", inset: 0, zIndex: 9001, display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: shown ? "rgba(6,12,24,0.5)" : "rgba(6,12,24,0)", transition: "background 220ms ease" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, background: C.sheet, color: C.text, fontFamily: font, borderRadius: "22px 22px 0 0",
        padding: "18px 18px calc(18px + env(safe-area-inset-bottom))", boxSizing: "border-box",
        transform: shown ? "translate3d(0,0,0)" : "translate3d(0,100%,0)", transition: "transform 260ms cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(14,159,110,0.14)", color: "#0E9F6E" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>{L("Update available", "अपडेट उपलब्ध है")}</div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>
              {L("Newer scheme information and fixes for Yojana Sahay.", "योजना सहाय के लिए नई योजना जानकारी और सुधार।")}
              {mb && <> {L(`Download size: ${mb} MB.`, `डाउनलोड साइज़: ${mb} MB।`)}</>}
            </div>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 14, padding: "10px 12px", borderRadius: 12, background: C.chip, fontSize: 12.5, cursor: "pointer" }}>
          <input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} disabled={busy} style={{ width: 17, height: 17, accentColor: "#0E9F6E", margin: 0 }} />
          {L("Update automatically from now on", "आगे से अपने-आप अपडेट करें")}
        </label>
        {err && <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={() => close("later")} disabled={busy} style={{ flex: 1, border: 0, borderRadius: 13, padding: "12px", fontFamily: font, fontSize: 14, fontWeight: 700, background: C.ghost, color: C.ghostText, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
            {L("Later", "बाद में")}
          </button>
          <button type="button" onClick={updateNow} disabled={busy} style={{ flex: 1.4, border: 0, borderRadius: 13, padding: "12px", fontFamily: font, fontSize: 14, fontWeight: 800, background: C.btn, color: C.btnText, cursor: busy ? "default" : "pointer" }}>
            {busy ? L("Downloading…", "डाउनलोड हो रहा है…") : L("Update now", "अभी अपडेट करें")}
          </button>
        </div>
      </div>
    </div>
  );
}
