// ReportIssueSheet.jsx — Yojana Sahay
// Bottom-sheet for users to report issues, request schemes, or ask queries.
// Saves to Firestore: collection("reports")

import { useState } from "react";
import { db, auth } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from "@emailjs/browser";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    overlay:"rgba(0,0,0,0.45)", sheet:"#fff",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", border2:"#f0f0f0",
    inputBg:"#f8f9fa", handle:"#e0e0e0",
    divider:"#f3f3f3",
  },
  dark: {
    overlay:"rgba(0,0,0,0.65)", sheet:"#1c1c1e",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", border2:"#3a3a3c",
    inputBg:"#2c2c2e", handle:"#3a3a3c",
    divider:"#2c2c2e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";

// ─── EMAILJS CONFIG ──────────────────────────────────────────────────────────
const EJS_SERVICE_ID  = "service_j0cvqgf";
const EJS_CONFIRM_TID = "template_gju4z27";   // User confirmation email
const EJS_PUBLIC_KEY  = "aV7SknFp6qPFayUkX";

// Confirmation email for a report (also used by the scheme "⚑" flag).
export function sendReportConfirmation({ email, name, typeLabel, subject, message }) {
  if (!email) return;
  emailjs.send(EJS_SERVICE_ID, EJS_CONFIRM_TID,
    { email, user_name: name || "User", report_type: typeLabel || "Report", subject: subject || "(no subject)", user_message: message || "" },
    { publicKey: EJS_PUBLIC_KEY }).catch(e => console.warn("Confirmation email failed:", e));
}

// ─── REPORT TYPES ────────────────────────────────────────────────────────────
const REPORT_TYPES = {
  en: [
    { v:"issue",          icon:"🐛", label:"Report a Bug / Issue",   sub:"App not working as expected",   color:"#DC2626" },
    { v:"scheme_request", icon:"📋", label:"Request a Scheme",       sub:"Scheme missing from the app",   color:NAVY      },
    { v:"query",          icon:"❓", label:"Ask a Query",            sub:"Have a question or need help",  color:IND_GREEN },
    { v:"feedback",       icon:"💡", label:"Share Feedback",          sub:"Suggestions to improve the app",color:SAFFRON   },
  ],
  hi: [
    { v:"issue",          icon:"🐛", label:"बग / समस्या बताएं",      sub:"ऐप सही से काम नहीं कर रहा",     color:"#DC2626" },
    { v:"scheme_request", icon:"📋", label:"योजना जोड़ने का अनुरोध", sub:"कोई योजना ऐप में नहीं है",       color:NAVY      },
    { v:"query",          icon:"❓", label:"सवाल पूछें",             sub:"कोई सवाल या मदद चाहिए",         color:IND_GREEN },
    { v:"feedback",       icon:"💡", label:"सुझाव दें",             sub:"ऐप सुधारने के सुझाव",            color:SAFFRON   },
  ],
};

const STRINGS = {
  en: {
    title:       "Report / Query",
    sub:         "We read every message and respond promptly",
    typLabel:    "What do you want to tell us?",
    subjectPh:   "Short subject (optional)",
    messagePh:   "Describe in detail — the more you share, the faster we can help…",
    messageReq:  "Please write your message before submitting.",
    submitBtn:   "Submit →",
    submitting:  "Submitting…",
    successTitle:"Submitted Successfully! 🎉",
    successSub:  "Thank you for reaching out. We'll review and get back to you soon.",
    closeBtn:    "Close",
    charLimit:   (n) => `${n} / 1000`,
  },
  hi: {
    title:       "रिपोर्ट / सवाल",
    sub:         "हम हर संदेश पढ़ते हैं और जल्दी जवाब देते हैं",
    typLabel:    "आप हमें क्या बताना चाहते हैं?",
    subjectPh:   "संक्षिप्त विषय (वैकल्पिक)",
    messagePh:   "विस्तार से बताएं — जितना बताएंगे, उतनी जल्दी मदद होगी…",
    messageReq:  "सबमिट करने से पहले अपना संदेश लिखें।",
    submitBtn:   "भेजें →",
    submitting:  "भेज रहे हैं…",
    successTitle:"सफलतापूर्वक भेजा गया! 🎉",
    successSub:  "संपर्क करने के लिए धन्यवाद। हम जल्द ही समीक्षा करेंगे।",
    closeBtn:    "बंद करें",
    charLimit:   (n) => `${n} / 1000`,
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ReportIssueSheet({ lang = "en", dark = false, onClose, userProfile, embeddedMode = false }) {
  const th = S[dark ? "dark" : "light"];
  const s  = STRINGS[lang] || STRINGS.en;
  const types = REPORT_TYPES[lang] || REPORT_TYPES.en;

  const [selectedType, setSelectedType] = useState("issue");
  const [subject,      setSubject]      = useState("");
  const [message,      setMessage]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState("");

  const user        = auth.currentUser;
  const charLen     = message.length;
  // Resolved name: explicit override → profile name → Google display name → fallback
  const resolvedName = userProfile?.name || user?.displayName || "Anonymous";

  async function handleSubmit() {
    if (!message.trim()) { setError(s.messageReq); return; }
    setError("");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), {
        uid:       user?.uid        || "guest",
        userName:  resolvedName,
        userPhone: userProfile?.phone || user?.phoneNumber || "",
        userEmail: userProfile?.email || user?.email       || "",
        type:      selectedType,
        subject:   subject.trim(),
        message:   message.trim(),
        status:    "open",
        lang,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);

      // ── Send confirmation email (non-blocking) ────────────────────────────
      const toEmail = userProfile?.email || user?.email;
      if (toEmail) {
        const typeLabel = (REPORT_TYPES.en.find(t => t.v === selectedType)?.label) || selectedType;
        emailjs.send(
          EJS_SERVICE_ID,
          EJS_CONFIRM_TID,
          {
            email:        toEmail,
            user_name:    resolvedName,
            report_type:  typeLabel,
            subject:      subject.trim() || "(no subject)",
            user_message: message.trim(),
          },
          { publicKey: EJS_PUBLIC_KEY }
        ).catch(e => console.warn("Confirmation email failed:", e));
      }
    } catch (err) {
      console.error("Report submit error:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const bf = lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";
  const activeType = types.find(t => t.v === selectedType);

  // In embedded mode: render inline (no backdrop, no fixed positioning, no drag handle)
  // In overlay mode: render as fixed bottom sheet with backdrop
  if (embeddedMode) {
    return (
      <div style={{
        background:th.sheet,
        fontFamily:bf,
        minHeight:"100%",
      }}>
        {/* Header */}
        <div style={{
          padding:"18px 20px 14px",
          borderBottom:`1px solid ${th.divider}`,
          display:"flex", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:42, height:42, borderRadius:13, flexShrink:0,
            background:`linear-gradient(135deg,${NAVY},${SAFFRON})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20,
          }}>📬</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:17, fontWeight:800, color:th.text }}>{s.title}</div>
            <div style={{ fontSize:11, color:th.textSub, marginTop:2 }}>{s.sub}</div>
          </div>
          <div
            onClick={onClose}
            style={{
              width:32, height:32, borderRadius:10,
              background:th.inputBg, border:`1px solid ${th.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, cursor:"pointer", color:th.textMid, flexShrink:0,
            }}
          >✕</div>
        </div>

        {/* ── SUCCESS STATE ── */}
        {submitted ? (
          <div style={{ padding:"40px 28px", textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:14 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:800, color:th.text, marginBottom:8 }}>
              {s.successTitle}
            </div>
            <div style={{ fontSize:13, color:th.textSub, lineHeight:1.6, marginBottom:28 }}>
              {s.successSub}
            </div>
            <div
              onClick={onClose}
              style={{
                background:`linear-gradient(135deg,${NAVY},rgba(0,53,128,0.85))`,
                borderRadius:14, padding:"13px 24px",
                color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
                display:"inline-block",
                boxShadow:"0 6px 20px rgba(0,53,128,0.3)",
              }}
            >
              {s.closeBtn}
            </div>
          </div>
        ) : (
          <div style={{ padding:"18px 20px 36px", display:"flex", flexDirection:"column", gap:16 }}>

            {/* Type selector */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:th.textMid, marginBottom:10, letterSpacing:0.3 }}>
                {s.typLabel}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {types.map(type => {
                  const active = selectedType === type.v;
                  return (
                    <div
                      key={type.v}
                      onClick={() => setSelectedType(type.v)}
                      style={{
                        padding:"11px 12px", borderRadius:14, cursor:"pointer",
                        border:`2px solid ${active ? type.color : th.border}`,
                        background: active
                          ? (dark ? `${type.color}22` : `${type.color}10`)
                          : th.inputBg,
                        transition:"all 0.18s",
                        boxShadow: active ? `0 4px 14px ${type.color}33` : "none",
                      }}
                    >
                      <div style={{ fontSize:18, marginBottom:4 }}>{type.icon}</div>
                      <div style={{ fontSize:12, fontWeight:active ? 700 : 500, color: active ? type.color : th.text, lineHeight:1.3 }}>
                        {type.label}
                      </div>
                      <div style={{ fontSize:10, color:th.textSub, marginTop:2 }}>
                        {type.sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent line */}
            {activeType && (
              <div style={{
                background: dark ? `${activeType.color}18` : `${activeType.color}0c`,
                border:`1px solid ${activeType.color}44`,
                borderRadius:10, padding:"9px 12px",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:15 }}>{activeType.icon}</span>
                <span style={{ fontSize:11, color:activeType.color, fontWeight:600 }}>
                  {activeType.label}
                </span>
              </div>
            )}

            {/* Subject */}
            <div>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={s.subjectPh}
                maxLength={120}
                style={{
                  width:"100%", boxSizing:"border-box",
                  padding:"12px 14px", borderRadius:12,
                  border:`1.5px solid ${th.border}`,
                  background:th.inputBg, color:th.text,
                  fontSize:13, outline:"none", fontFamily:bf,
                  transition:"border-color 0.18s",
                }}
                onFocus={e => (e.target.style.borderColor = NAVY)}
                onBlur={e  => (e.target.style.borderColor = th.border)}
              />
            </div>

            {/* Message */}
            <div style={{ position:"relative" }}>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 1000))}
                placeholder={s.messagePh}
                rows={5}
                style={{
                  width:"100%", boxSizing:"border-box",
                  padding:"12px 14px", borderRadius:12,
                  border:`1.5px solid ${error ? "#DC2626" : th.border}`,
                  background:th.inputBg, color:th.text,
                  fontSize:13, outline:"none", resize:"none",
                  lineHeight:1.6, fontFamily:bf,
                  transition:"border-color 0.18s",
                }}
                onFocus={e => { setError(""); e.target.style.borderColor = NAVY; }}
                onBlur={e  => (e.target.style.borderColor = error ? "#DC2626" : th.border)}
              />
              <div style={{
                position:"absolute", bottom:10, right:12,
                fontSize:10, color: charLen >= 900 ? "#DC2626" : th.textSub, fontWeight:600,
              }}>
                {s.charLimit(charLen)}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:"#FFF5F5", border:"1px solid #FED7D7",
                borderRadius:10, padding:"9px 12px",
                fontSize:12, color:"#DC2626", fontWeight:600,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* User info preview */}
            {user && (
              <div style={{
                background:th.inputBg, border:`1px solid ${th.border2}`,
                borderRadius:12, padding:"10px 14px",
                display:"flex", alignItems:"center", gap:10,
              }}>
                <div style={{ fontSize:14 }}>👤</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:th.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {resolvedName}
                  </div>
                  <div style={{ fontSize:10, color:th.textSub, marginTop:1 }}>
                    {user.phoneNumber || user.email || ""}
                  </div>
                </div>
                <div style={{
                  fontSize:9, fontWeight:700, color:IND_GREEN,
                  background:dark?"rgba(19,136,8,0.18)":"rgba(19,136,8,0.1)",
                  border:`1px solid ${IND_GREEN}44`,
                  borderRadius:8, padding:"2px 7px",
                }}>
                  Verified ✓
                </div>
              </div>
            )}

            {/* Submit */}
            <div
              onClick={submitting ? undefined : handleSubmit}
              style={{
                background: submitting
                  ? th.border
                  : `linear-gradient(135deg,${NAVY} 0%,rgba(0,53,128,0.88) 60%,rgba(255,153,51,0.9) 100%)`,
                borderRadius:14, padding:"15px 20px",
                color: submitting ? th.textSub : "#fff",
                fontSize:15, fontWeight:800, cursor: submitting ? "default" : "pointer",
                textAlign:"center",
                boxShadow: submitting ? "none" : "0 8px 28px rgba(0,53,128,0.32)",
                transition:"all 0.22s",
                letterSpacing:0.3,
              }}
            >
              {submitting ? s.submitting : s.submitBtn}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Overlay / bottom-sheet mode (default) ────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position:"fixed", inset:0, zIndex:10000, background:th.overlay }}
      />

      {/* Sheet */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        zIndex:10001,
        background:th.sheet,
        borderRadius:"22px 22px 0 0",
        maxHeight:"90vh",
        overflowY:"auto",
        boxShadow:"0 -12px 48px rgba(0,0,0,0.22)",
        fontFamily:bf,
      }}>
        {/* Handle */}
        <div style={{ width:36, height:4, borderRadius:2, background:th.handle, margin:"12px auto 0" }} />

        {/* Header */}
        <div style={{
          padding:"18px 20px 14px",
          borderBottom:`1px solid ${th.divider}`,
          display:"flex", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:42, height:42, borderRadius:13, flexShrink:0,
            background:`linear-gradient(135deg,${NAVY},${SAFFRON})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20,
          }}>📬</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:17, fontWeight:800, color:th.text }}>{s.title}</div>
            <div style={{ fontSize:11, color:th.textSub, marginTop:2 }}>{s.sub}</div>
          </div>
          <div
            onClick={onClose}
            style={{
              width:32, height:32, borderRadius:10,
              background:th.inputBg, border:`1px solid ${th.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, cursor:"pointer", color:th.textMid, flexShrink:0,
            }}
          >✕</div>
        </div>

        {/* ── SUCCESS STATE ── */}
        {submitted ? (
          <div style={{ padding:"40px 28px", textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:14 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:800, color:th.text, marginBottom:8 }}>
              {s.successTitle}
            </div>
            <div style={{ fontSize:13, color:th.textSub, lineHeight:1.6, marginBottom:28 }}>
              {s.successSub}
            </div>
            <div
              onClick={onClose}
              style={{
                background:`linear-gradient(135deg,${NAVY},rgba(0,53,128,0.85))`,
                borderRadius:14, padding:"13px 24px",
                color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
                display:"inline-block",
                boxShadow:"0 6px 20px rgba(0,53,128,0.3)",
              }}
            >
              {s.closeBtn}
            </div>
          </div>
        ) : (
          <div style={{ padding:"18px 20px 36px", display:"flex", flexDirection:"column", gap:16 }}>

            {/* Type selector */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:th.textMid, marginBottom:10, letterSpacing:0.3 }}>
                {s.typLabel}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {types.map(type => {
                  const active = selectedType === type.v;
                  return (
                    <div
                      key={type.v}
                      onClick={() => setSelectedType(type.v)}
                      style={{
                        padding:"11px 12px", borderRadius:14, cursor:"pointer",
                        border:`2px solid ${active ? type.color : th.border}`,
                        background: active
                          ? (dark ? `${type.color}22` : `${type.color}10`)
                          : th.inputBg,
                        transition:"all 0.18s",
                        boxShadow: active ? `0 4px 14px ${type.color}33` : "none",
                      }}
                    >
                      <div style={{ fontSize:18, marginBottom:4 }}>{type.icon}</div>
                      <div style={{ fontSize:12, fontWeight:active ? 700 : 500, color: active ? type.color : th.text, lineHeight:1.3 }}>
                        {type.label}
                      </div>
                      <div style={{ fontSize:10, color:th.textSub, marginTop:2 }}>
                        {type.sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent line for selected type */}
            {activeType && (
              <div style={{
                background: dark ? `${activeType.color}18` : `${activeType.color}0c`,
                border:`1px solid ${activeType.color}44`,
                borderRadius:10, padding:"9px 12px",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:15 }}>{activeType.icon}</span>
                <span style={{ fontSize:11, color:activeType.color, fontWeight:600 }}>
                  {activeType.label}
                </span>
              </div>
            )}

            {/* Subject */}
            <div>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={s.subjectPh}
                maxLength={120}
                style={{
                  width:"100%", boxSizing:"border-box",
                  padding:"12px 14px", borderRadius:12,
                  border:`1.5px solid ${th.border}`,
                  background:th.inputBg, color:th.text,
                  fontSize:13, outline:"none",
                  fontFamily:bf,
                  transition:"border-color 0.18s",
                }}
                onFocus={e => (e.target.style.borderColor = NAVY)}
                onBlur={e  => (e.target.style.borderColor = th.border)}
              />
            </div>

            {/* Message */}
            <div style={{ position:"relative" }}>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 1000))}
                placeholder={s.messagePh}
                rows={5}
                style={{
                  width:"100%", boxSizing:"border-box",
                  padding:"12px 14px", borderRadius:12,
                  border:`1.5px solid ${error ? "#DC2626" : th.border}`,
                  background:th.inputBg, color:th.text,
                  fontSize:13, outline:"none", resize:"none",
                  lineHeight:1.6, fontFamily:bf,
                  transition:"border-color 0.18s",
                }}
                onFocus={e => { setError(""); e.target.style.borderColor = NAVY; }}
                onBlur={e  => (e.target.style.borderColor = error ? "#DC2626" : th.border)}
              />
              {/* Char count */}
              <div style={{
                position:"absolute", bottom:10, right:12,
                fontSize:10, color: charLen >= 900 ? "#DC2626" : th.textSub, fontWeight:600,
              }}>
                {s.charLimit(charLen)}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:"#FFF5F5", border:"1px solid #FED7D7",
                borderRadius:10, padding:"9px 12px",
                fontSize:12, color:"#DC2626", fontWeight:600,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* User info preview (compact) */}
            {user && (
              <div style={{
                background:th.inputBg, border:`1px solid ${th.border2}`,
                borderRadius:12, padding:"10px 14px",
                display:"flex", alignItems:"center", gap:10,
              }}>
                <div style={{ fontSize:14 }}>👤</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:th.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {resolvedName}
                  </div>
                  <div style={{ fontSize:10, color:th.textSub, marginTop:1 }}>
                    {user.phoneNumber || user.email || ""}
                  </div>
                </div>
                <div style={{
                  fontSize:9, fontWeight:700, color:IND_GREEN,
                  background:dark?"rgba(19,136,8,0.18)":"rgba(19,136,8,0.1)",
                  border:`1px solid ${IND_GREEN}44`,
                  borderRadius:8, padding:"2px 7px",
                }}>
                  Verified ✓
                </div>
              </div>
            )}

            {/* Submit */}
            <div
              onClick={submitting ? undefined : handleSubmit}
              style={{
                background: submitting
                  ? th.border
                  : `linear-gradient(135deg,${NAVY} 0%,rgba(0,53,128,0.88) 60%,rgba(255,153,51,0.9) 100%)`,
                borderRadius:14, padding:"15px 20px",
                color: submitting ? th.textSub : "#fff",
                fontSize:15, fontWeight:800, cursor: submitting ? "default" : "pointer",
                textAlign:"center",
                boxShadow: submitting ? "none" : "0 8px 28px rgba(0,53,128,0.32)",
                transition:"all 0.22s",
                letterSpacing:0.3,
              }}
            >
              {submitting ? s.submitting : s.submitBtn}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Alias so we don't clash with external THEME
const S = THEME;
