// DeadlineAlertsTab.jsx — Yojana Sahay Admin · Deadline Alerts monitor
// ─────────────────────────────────────────────────────────────────────────────
// Mirrors the visual language of NewsTab.jsx / SchemeVerifier.jsx.
//
// Shows:
//   • Last-run stats (checked / sent / skipped, when, triggered by whom)
//   • "Send Alerts Now" manual trigger button
//   • A send log — recent runs, each expandable to see which emails got sent
//
// Talks to /api/deadline-alerts.js (GET for history, POST to trigger),
// authenticated with the current admin's Firebase ID token.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";

const NAVY   = "#06038D";
const GREEN  = "#138808";
const RED    = "#E53E3E";
const AMBER  = "#D97706";
const PURPLE = "#8B5CF6"; // matches the existing "AI" badge color used elsewhere in this file

// ── Preview-only mirror of buildBrandedHtml() in /api/deadline-alerts.js ───
// This duplicates that function's markup (now a full HTML document, with
// color-scheme-lock meta tags so Gmail's dark mode doesn't invert it) so the
// admin can see, before sending, exactly how the layout, 📌 callout, and
// **bold** syntax will render. Has no bearing on the actual email — the
// server always re-renders it independently at send time. If you change the
// template in deadline-alerts.js, mirror the change here too.
function escapeHtmlPreview(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function applyInlineEmphasisPreview(escaped) {
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0d0a9e;font-weight:700;">$1</strong>');
}
function buildBrandedHtmlPreview(bodyText, isHindi = false) {
  const rawParagraphs = (bodyText || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const paragraphs = rawParagraphs.map((p, i) => {
    const isCallout = /^📌/.test(p);
    const clean = isCallout ? p.replace(/^📌\s*/, "") : p;
    const text = applyInlineEmphasisPreview(escapeHtmlPreview(clean));
    if (isCallout) {
      return `<div style="background:#fdf8ee;border:1px solid #e6dcc4;border-left:3px solid #C9A961;border-radius:8px;padding:12px 16px;margin:0 0 16px;font-size:13.5px;color:#3d3520;line-height:1.6;">📌&nbsp; ${text}</div>`;
    }
    const style = i === 0
      ? "font-size:14.5px;color:#1a1a1a;margin:0 0 16px;line-height:1.75;letter-spacing:0.1px;"
      : "font-size:14px;color:#2d2d2d;margin:0 0 14px;line-height:1.7;";
    return `<p style="${style}">${text}</p>`;
  }).join("");

  const t = isHindi ? {
      title: "योजना सहाय टीम", subtitle: "सरकारी योजना खोज ऐप", cta: "YojanaSahay खोलें",
      footer: "यह ईमेल YojanaSahay टीम द्वारा व्यक्तिगत रूप से भेजा गया है।",
      legal: "YojanaSahay एक स्वतंत्र योजना-खोज सेवा है और किसी भी सरकारी विभाग से आधिकारिक रूप से संबद्ध नहीं है।",
      issued: "जारी दिनांक",
      help: "मदद चाहिए या कोई सवाल है? बस इस ईमेल का जवाब दें — यह सीधे हमारी टीम तक पहुंचेगा।",
    } : {
      title: "YojanaSahay Team", subtitle: "Government Schemes Finder App", cta: "Open YojanaSahay",
      footer: "This email was sent to you personally by the YojanaSahay team.",
      legal: "YojanaSahay is an independent scheme-discovery service and is not officially affiliated with any government department.",
      issued: "ISSUED",
      help: "Need help or have a question? Just reply to this email — it reaches our team directly.",
    };

  const issuedDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return `<!doctype html>
<html lang="${isHindi ? "hi" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;" bgcolor="#f0f0f0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;" bgcolor="#f0f0f0">
  <tr>
    <td align="center" style="padding:30px 12px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e8;" bgcolor="#ffffff">

        <tr>
          <td style="background-color:#1a1464;padding:22px 28px;border-bottom:2px solid #C9A961;" bgcolor="#1a1464">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:46px;vertical-align:middle;padding-right:14px;">
                  <div style="width:42px;height:42px;border-radius:10px;background-color:rgba(201,169,97,0.14);border:1px solid rgba(201,169,97,0.4);text-align:center;line-height:42px;font-size:20px;">🏛️</div>
                </td>
                <td style="vertical-align:middle;">
                  <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:0.2px;line-height:1.25;">${t.title}</div>
                  <div style="color:#C9A961;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin-top:3px;">${t.subtitle}</div>
                </td>
                <td style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:10px;">
                  <div style="border:1px solid #C9A961;border-radius:9px;padding:7px 13px;background-color:rgba(255,255,255,0.08);">
                    <div style="color:#C9A961;font-size:8.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${t.issued}</div>
                    <div style="color:#ffffff;font-size:11.5px;font-weight:600;margin-top:2px;">${issuedDate}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 28px 8px;background-color:#ffffff;" bgcolor="#ffffff">
            ${paragraphs}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 28px 28px;text-align:center;background-color:#ffffff;" bgcolor="#ffffff">
            <a href="https://yojanasahay.vercel.app" style="display:inline-block;background-color:#06038D;color:#ffffff;text-decoration:none;padding:13px 34px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.2px;border:1px solid rgba(201,169,97,0.5);">${t.cta} →</a>
          </td>
        </tr>

        <tr>
          <td style="padding:18px 28px;background-color:#f8f9fb;border-top:2px solid rgba(201,169,97,0.55);text-align:center;" bgcolor="#f8f9fb">
            <p style="font-size:11px;color:#8a8a8a;margin:0 0 6px;line-height:1.5;">${t.footer}</p>
            <p style="font-size:10.5px;color:#6b6b6b;margin:0 0 10px;line-height:1.55;">${t.help}</p>
            <p style="font-size:10px;color:#b0b0b0;margin:0 0 14px;line-height:1.5;">${t.legal}</p>
            <div style="border-top:1px solid #e6dcc4;margin:0 0 12px;width:60px;margin-left:auto;margin-right:auto;"></div>
            <p style="font-size:11px;color:#3d3520;margin:0 0 3px;font-weight:700;">${isHindi ? "टीम YojanaSahay" : "Team YojanaSahay"}</p>
            <p style="font-size:9.5px;color:#aaaaaa;margin:0;letter-spacing:0.2px;">© ${new Date().getFullYear()} YojanaSahay · ${isHindi ? "MIT लाइसेंस के तहत जारी" : "Released under the MIT License"}</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatBox({ label, value, color, dark }) {
  return (
    <div style={{
      flex: 1, minWidth: 90, background: dark ? "#1a1a1a" : "#fff",
      border: `1.5px solid ${color}30`, borderRadius: 12, padding: "12px 14px",
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: dark ? "#999" : "#666", marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function DeadlineAlertsTab({ dark, isDesktop }) {
  const [runs, setRuns]         = useState([]);
  const [todayQuota, setTodayQuota] = useState(null);
  const [verifyRuns, setVerifyRuns]     = useState([]);
  const [verifyCursor, setVerifyCursor] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast]       = useState(null);

  // ── AI Compose & Send — one-off personalized email, drafted by Groq from
  // facts the admin types in, editable before sending ──────────────────────
  const [composeOpen, setComposeOpen]   = useState(false);
  const [toName, setToName]             = useState("");
  const [toEmail, setToEmail]           = useState("");
  const [composeNotes, setComposeNotes] = useState("");
  const [composeLang, setComposeLang]   = useState("en");
  const [draft, setDraft]               = useState(null); // { subject, body }
  const [drafting, setDrafting]         = useState(false);
  const [sendingDraft, setSendingDraft] = useState(false);
  const [composeToast, setComposeToast] = useState(null);
  const [showPreview, setShowPreview]   = useState(false);

  const th = {
    bg:     dark ? "#0d0d0d" : "#f5f5f0",
    card:   dark ? "#161616" : "#fff",
    text:   dark ? "#f0f0f0" : "#1a1a1a",
    textSub:dark ? "#999" : "#666",
    border: dark ? "#2a2a2a" : "#e5e5e5",
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      const res = await fetch("/api/deadline-alerts", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setRuns(data.runs || []);
      setTodayQuota(data.todayQuota || null);
      setVerifyRuns(data.verifyRuns || []);
      setVerifyCursor(data.verifyCursor || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleTrigger = async () => {
    setTriggering(true);
    setToast(null);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      const res = await fetch("/api/deadline-alerts", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      const announcedText = data.announced > 0 ? ` · announced ${data.announced} new scheme${data.announced === 1 ? "" : "s"}` : "";
      setToast({ type: "success", text: `Sent ${data.sent} alert${data.sent === 1 ? "" : "s"}${announcedText} · checked ${data.checked} users` });
      await fetchHistory();
    } catch (err) {
      setToast({ type: "error", text: err.message });
    } finally {
      setTriggering(false);
    }
  };

  const latest = runs[0];

  // ── AI Compose handlers ─────────────────────────────────────────────────
  const handleDraft = async () => {
    setComposeToast(null);
    if (!toEmail.trim() || !/^\S+@\S+\.\S+$/.test(toEmail)) {
      setComposeToast({ type: "error", text: "Enter a valid recipient email first" });
      return;
    }
    if (!composeNotes.trim()) {
      setComposeToast({ type: "error", text: "Add a few notes for the AI to work from — e.g. what they searched, what changed" });
      return;
    }
    setDrafting(true);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");
      const res = await fetch("/api/deadline-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ action: "draft", toName, toEmail, notes: composeNotes, lang: composeLang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setDraft(data);
    } catch (err) {
      setComposeToast({ type: "error", text: err.message });
    } finally {
      setDrafting(false);
    }
  };

  const handleSendDraft = async () => {
    if (!draft) return;
    setComposeToast(null);
    setSendingDraft(true);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");
      const res = await fetch("/api/deadline-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          action: "send", toName, toEmail,
          subject: draft.subject, body: draft.body, lang: composeLang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setComposeToast({ type: "success", text: `Email sent to ${toEmail}` });
      setDraft(null);
      setToName(""); setToEmail(""); setComposeNotes("");
    } catch (err) {
      setComposeToast({ type: "error", text: err.message });
    } finally {
      setSendingDraft(false);
    }
  };

  return (
    <div style={{ padding: isDesktop ? "28px 40px 48px" : "14px 13px 36px", background: th.bg, minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: th.text }}>🔔 Deadline Alerts</div>
          <div style={{ fontSize: 12, color: th.textSub, marginTop: 2 }}>
            Emails users about scheme deadlines closing within 7 days · auto-runs daily via cron
          </div>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          style={{
            background: triggering ? "#999" : NAVY, color: "#fff", border: "none",
            borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700,
            cursor: triggering ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {triggering ? "Sending…" : "📤 Send Alerts Now"}
        </button>
      </div>

      {/* ── AI Compose & Send ── one-off personalized email for any user ── */}
      <div style={{
        background: th.card, border: `1.5px solid ${dark ? "rgba(139,92,246,0.35)" : "rgba(139,92,246,0.25)"}`,
        borderRadius: 14, marginBottom: 18, overflow: "hidden",
      }}>
        <div
          onClick={() => setComposeOpen(o => !o)}
          style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: "rgba(139,92,246,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>✨</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: th.text }}>AI Compose & Send</div>
              <div style={{ fontSize: 10.5, color: th.textSub }}>Groq drafts a personalized email from facts you give it — you edit, then send</div>
            </div>
          </div>
          <div style={{ fontSize: 16, color: th.textSub }}>{composeOpen ? "▲" : "▼"}</div>
        </div>

        {composeOpen && (
          <div style={{ borderTop: `1px solid ${th.border}`, padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>

            {composeToast && (
              <div style={{
                padding: "9px 12px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                background: composeToast.type === "success" ? "rgba(19,136,8,0.1)" : "rgba(229,62,62,0.1)",
                color: composeToast.type === "success" ? GREEN : RED,
                border: `1px solid ${composeToast.type === "success" ? GREEN : RED}30`,
              }}>
                {composeToast.type === "success" ? "✅ " : "⚠️ "}{composeToast.text}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={toName} onChange={e => setToName(e.target.value)}
                placeholder="Recipient name (optional)"
                style={{
                  flex: "1 1 160px", padding: "10px 12px", borderRadius: 9, fontSize: 12.5,
                  border: `1px solid ${th.border}`, background: dark ? "#0f0f0f" : "#fff", color: th.text,
                }}
              />
              <input
                value={toEmail} onChange={e => setToEmail(e.target.value)}
                placeholder="Recipient email *"
                style={{
                  flex: "1 1 200px", padding: "10px 12px", borderRadius: 9, fontSize: 12.5,
                  border: `1px solid ${th.border}`, background: dark ? "#0f0f0f" : "#fff", color: th.text,
                }}
              />
              <select
                value={composeLang} onChange={e => setComposeLang(e.target.value)}
                style={{
                  padding: "10px 12px", borderRadius: 9, fontSize: 12.5,
                  border: `1px solid ${th.border}`, background: dark ? "#0f0f0f" : "#fff", color: th.text,
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            <textarea
              value={composeNotes} onChange={e => setComposeNotes(e.target.value)}
              placeholder={`Notes for the AI — only real facts, e.g.:\n"He searched for 10th pass schemes on ${new Date().toLocaleDateString('en-IN', {month:'short'})} X. We fixed a tagging bug that was hiding relevant schemes and added new ones. Invite him to check the app again."`}
              rows={4}
              style={{
                padding: "10px 12px", borderRadius: 9, fontSize: 12.5, resize: "vertical",
                border: `1px solid ${th.border}`, background: dark ? "#0f0f0f" : "#fff", color: th.text,
                fontFamily: "inherit", lineHeight: 1.5,
              }}
            />

            <button
              onClick={handleDraft}
              disabled={drafting}
              style={{
                background: drafting ? "#999" : "#8B5CF6", color: "#fff", border: "none",
                borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 700,
                cursor: drafting ? "not-allowed" : "pointer", alignSelf: "flex-start",
              }}
            >
              {drafting ? "✨ Generating…" : draft ? "🔁 Regenerate Draft" : "✨ Generate with AI"}
            </button>

            {draft && (
              <div style={{
                marginTop: 4, padding: 14, borderRadius: 12,
                background: dark ? "#0f0f0f" : "#fafafa", border: `1px solid ${th.border}`,
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8B5CF6", letterSpacing: 0.4, textTransform: "uppercase" }}>
                  ✏️ Editable draft — review before sending
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: th.textSub, marginBottom: 4, fontWeight: 600 }}>Subject</div>
                  <input
                    value={draft.subject}
                    onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))}
                    style={{
                      width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                      border: `1px solid ${th.border}`, background: th.card, color: th.text, boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: th.textSub, marginBottom: 4, fontWeight: 600 }}>Body</div>
                  <textarea
                    value={draft.body}
                    onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
                    rows={7}
                    style={{
                      width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 12.5, lineHeight: 1.55,
                      border: `1px solid ${th.border}`, background: th.card, color: th.text,
                      fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setShowPreview(v => !v)}
                    type="button"
                    style={{
                      background: "transparent", color: "#8B5CF6", border: "1px solid #8B5CF6",
                      borderRadius: 10, padding: "10px 14px", fontSize: 12.5, fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {showPreview ? "🙈 Hide Preview" : "👁 Preview Email"}
                  </button>
                  <button
                    onClick={handleSendDraft}
                    disabled={sendingDraft}
                    style={{
                      background: sendingDraft ? "#999" : GREEN, color: "#fff", border: "none",
                      borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 700,
                      cursor: sendingDraft ? "not-allowed" : "pointer",
                    }}
                  >
                    {sendingDraft ? "Sending…" : `📤 Send to ${toEmail || "recipient"}`}
                  </button>
                </div>

                {showPreview && (
                  <div>
                    <div style={{ fontSize: 10.5, color: th.textSub, marginBottom: 6, fontWeight: 600 }}>
                      Live preview — 📌 callouts and **bold** text render as they will in the sent email
                    </div>
                    <iframe
                      title="Email preview"
                      sandbox=""
                      style={{
                        width: "100%", minHeight: 420, border: `1px solid ${th.border}`,
                        borderRadius: 12, background: "#f0f0f0",
                      }}
                      srcDoc={buildBrandedHtmlPreview(draft.body, composeLang === "hi")}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily Gmail quota — always visible, independent of any single run */}
      {todayQuota && (() => {
        const pct = Math.min(100, Math.round((todayQuota.used / todayQuota.limit) * 100));
        const nearLimit = pct >= 80;
        const barColor  = pct >= 100 ? RED : pct >= 80 ? AMBER : GREEN;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: th.textSub, marginBottom: 4 }}>
              <span>Today's email quota</span>
              <span style={{ fontWeight: 700, color: barColor }}>{todayQuota.used} / {todayQuota.limit}</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: dark ? "#222" : "#e8e8e8", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            {nearLimit && (
              <div style={{
                marginTop: 8, padding: "9px 12px", borderRadius: 9, fontSize: 11.5, fontWeight: 600,
                background: `${barColor}15`, color: barColor, border: `1px solid ${barColor}30`,
              }}>
                ⚠️ Approaching Gmail's daily sending safety limit ({todayQuota.limit}/day). Any users past this
                limit are automatically retried on the next run — no emails are lost, just delayed.
              </div>
            )}
          </div>
        );
      })()}

      {/* Scheme Verifier — the background batch job a GitHub Action pings
          every ~15-20 min. Previously ran completely invisibly; this card
          shows when it last ran and how far the rotation has gotten. */}
      {(() => {
        const latestVerify = verifyRuns[0];
        const pct = verifyCursor && verifyCursor.totalSchemes
          ? Math.round((verifyCursor.index / verifyCursor.totalSchemes) * 100)
          : null;
        return (
          <div style={{
            marginBottom: 16, padding: "12px 14px", borderRadius: 12,
            background: th.card, border: `1.5px solid ${th.border}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: th.text, marginBottom: 8 }}>
              🔄 Scheme Verifier (background)
            </div>
            {!latestVerify ? (
              <div style={{ fontSize: 11.5, color: th.textSub }}>
                No batch runs logged yet — the GitHub Action may not have pinged this endpoint yet, or it just hasn't run since this feature was added.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: th.textSub, marginBottom: 6 }}>
                  Last check: {fmtDateTime(latestVerify.runAt)} · checked {latestVerify.checked} scheme{latestVerify.checked === 1 ? "" : "s"}
                  {latestVerify.skippedNoUrl > 0 && ` (${latestVerify.skippedNoUrl} skipped, no URL)`}
                  {latestVerify.commitSuccess === false && (
                    <span style={{ color: RED, fontWeight: 700 }}> · commit failed: {latestVerify.commitError}</span>
                  )}
                </div>
                {pct !== null && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: th.textSub, marginBottom: 4 }}>
                      <span>Catalog sweep progress</span>
                      <span style={{ fontWeight: 700 }}>{verifyCursor.index} / {verifyCursor.totalSchemes}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: dark ? "#222" : "#e8e8e8", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: PURPLE, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* Toast */}
      {toast && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
          background: toast.type === "success" ? "rgba(19,136,8,0.1)" : "rgba(229,62,62,0.1)",
          color: toast.type === "success" ? GREEN : RED,
          border: `1px solid ${toast.type === "success" ? GREEN : RED}30`,
        }}>
          {toast.type === "success" ? "✅ " : "⚠️ "}{toast.text}
        </div>
      )}

      {/* Last run stats */}
      {loading ? (
        <div style={{ color: th.textSub, fontSize: 13 }}>Loading run history…</div>
      ) : error ? (
        <div style={{ color: RED, fontSize: 13 }}>⚠️ {error}</div>
      ) : !latest ? (
        <div style={{ color: th.textSub, fontSize: 13 }}>No runs yet — click "Send Alerts Now" to run it for the first time.</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <StatBox label="Users Checked" value={latest.checked} color={NAVY} dark={dark} />
            <StatBox label="Emails Sent"   value={latest.sent}    color={GREEN} dark={dark} />
            <StatBox label="Announced"     value={latest.announced ?? 0} color={PURPLE} dark={dark} />
            <StatBox label="Skipped"       value={latest.skipped} color={AMBER} dark={dark} />
          </div>
          <div style={{ fontSize: 11, color: th.textSub, marginBottom: 24 }}>
            Last run: {fmtDateTime(latest.runAt)} · {latest.trigger === "manual" ? `manually by ${latest.triggeredBy}` : "automatic (cron)"}
          </div>
        </>
      )}

      {/* Run log */}
      {!loading && !error && runs.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 10, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Send Log — last {runs.length} runs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {runs.map(run => (
              <div key={run.id} style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div
                  onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                  style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: th.text }}>
                      {fmtDateTime(run.runAt)}
                      <span style={{
                        marginLeft: 8, fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                        background: run.trigger === "manual" ? "rgba(6,3,141,0.1)" : "rgba(19,136,8,0.1)",
                        color: run.trigger === "manual" ? NAVY : GREEN,
                      }}>
                        {run.trigger === "manual" ? `MANUAL · ${run.triggeredBy}` : "AUTO CRON"}
                      </span>
                      {run.quotaHit && (
                        <span style={{
                          marginLeft: 6, fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                          background: "rgba(217,119,6,0.12)", color: AMBER,
                        }}>
                          QUOTA LIMIT HIT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: th.textSub, marginTop: 3 }}>
                      {run.checked} checked · {run.sent} sent · {run.announced ?? 0} announced · {run.skipped} skipped
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: th.textSub }}>{expandedId === run.id ? "▲" : "▼"}</div>
                </div>

                {expandedId === run.id && (
                  <div style={{ borderTop: `1px solid ${th.border}`, padding: "10px 14px", background: dark ? "#0f0f0f" : "#fafafa" }}>
                    {run.recipients.length === 0 ? (
                      <div style={{ fontSize: 11.5, color: th.textSub }}>No emails sent this run.</div>
                    ) : (
                      run.recipients.map((r, i) => (
                        <div key={i} style={{ padding: "8px 0", borderBottom: i < run.recipients.length - 1 ? `1px solid ${th.border}` : "none" }}>
                          <div style={{ fontSize: 11.5, color: th.text }}>
                            <span style={{ fontWeight: 600 }}>{r.email}</span>
                            <span style={{ color: th.textSub }}> — {r.schemeCount} scheme{r.schemeCount === 1 ? "" : "s"}, soonest in {r.soonestDays} day{r.soonestDays === 1 ? "" : "s"}</span>
                            {r.reminderCount > 0 && (
                              <span style={{
                                marginLeft: 6, fontSize: 9, fontWeight: 800, letterSpacing: 0.3,
                                padding: "1px 6px", borderRadius: 20, color: RED, background: "rgba(229,62,62,0.1)",
                              }}>
                                FINAL REMINDER ×{r.reminderCount}
                              </span>
                            )}
                          </div>
                          {r.introText && (
                            <div style={{
                              marginTop: 4, fontSize: 11, lineHeight: 1.5, color: th.textSub,
                              background: dark ? "#161616" : "#f0f0f0", borderRadius: 6,
                              padding: "6px 8px", display: "flex", gap: 6, alignItems: "flex-start",
                            }}>
                              <span style={{
                                flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                                padding: "1px 5px", borderRadius: 4,
                                color: r.aiPersonalized ? "#8B5CF6" : th.textSub,
                                background: r.aiPersonalized ? "rgba(139,92,246,0.14)" : (dark ? "#222" : "#e4e4e4"),
                              }}>
                                {r.aiPersonalized ? "AI" : "TEMPLATE"}
                              </span>
                              <span style={{ fontStyle: "italic" }}>"{r.introText}"</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {run.announcementRecipients?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${th.border}` }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: PURPLE, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 6 }}>
                          🆕 New Scheme Announcements
                        </div>
                        {run.announcementRecipients.map((r, i) => (
                          <div key={i} style={{ padding: "4px 0", fontSize: 11.5, color: th.text }}>
                            <span style={{ fontWeight: 600 }}>{r.email}</span>
                            <span style={{ color: th.textSub }}> — {r.schemes.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
