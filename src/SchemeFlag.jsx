// src/SchemeFlag.jsx — Yojana Sahay · "⚑ Something wrong with this scheme?"
// ─────────────────────────────────────────────────────────────────────────────
// Lives at the bottom of a scheme's detail sheet.
//  • One tap: pick what's wrong (link / amount / closed / eligibility / other).
//    Scheme, link and language are attached automatically.
//  • Works WITHOUT sign-in (rate-limited on the server). Signed-in users'
//    reports also appear in Profile → Report / Query → My Reports, and they
//    get the usual confirmation email.
//  • "Link not working" is checked by the server straight away and, if it is
//    really down, queued for the daily automatic link repair.
//  • Goes into the same admin Reports inbox (api/log-checker-run.js type:"flag").
//
// SchemeFlagNotice — a gentle warning on the sheet when other people have
// recently reported a problem (public summary: schemeFlags/{schemeId}).
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase.js";
import { sendReportConfirmation } from "./ReportIssueSheet.jsx";

const REASONS = [
  { v: "link",        icon: "🔗", en: "Link not working",            hi: "लिंक काम नहीं कर रहा" },
  { v: "amount",      icon: "💰", en: "Amount / benefit is wrong",   hi: "राशि / लाभ गलत है" },
  { v: "closed",      icon: "📅", en: "Scheme closed / date passed", hi: "योजना बंद / तारीख निकल गई" },
  { v: "eligibility", icon: "👥", en: "Eligibility is wrong",        hi: "पात्रता गलत है" },
  { v: "other",       icon: "✏️", en: "Something else",              hi: "कुछ और" },
];
const DAY = 86400000;

// This phone's own scheme reports (so a repeat visit shows the old report's
// status instead of a blank form — also for people who aren't signed in).
const LS_KEY = "ys_scheme_flags_v1";
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch { return {}; } };
const saveLocal = (schemeId, entry) => {
  try {
    const all = readLocal();
    const list = (all[schemeId] || []).filter(x => x.reason !== entry.reason);
    all[schemeId] = [entry, ...list].slice(0, 5);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* storage off — fine */ }
};
const toMs = (v) => (v?.toMillis ? v.toMillis() : typeof v === "number" ? v : Date.parse(v || "")) || Date.now();
const recent = (iso, days) => { const t = Date.parse(iso || ""); return Number.isFinite(t) && Date.now() - t < days * DAY; };

export function SchemeFlagNotice({ schemeId, lang, dark }) {
  const [f, setF] = useState(null);
  useEffect(() => {
    let alive = true;
    if (!schemeId) return;
    getDoc(doc(db, "schemeFlags", schemeId)).then(s => { if (alive && s.exists()) setF(s.data()); }).catch(() => {});
    return () => { alive = false; };
  }, [schemeId]);
  if (!f) return null;
  const isHindi = lang === "hi";
  const active = (k) => f[k] && f[k].status !== "resolved";
  const linkDown = active("link") && f.link?.alive === false && (f.link?.count || 0) >= 2 && recent(f.link?.lastAt, 14);
  const details = ["amount", "closed", "eligibility"].some(k => active(k) && (f[k]?.count || 0) >= 2 && recent(f[k]?.lastAt, 30));
  if (!linkDown && !details) return null;
  const text = linkDown
    ? (isHindi ? "कुछ लोगों ने बताया कि इस योजना का लिंक अभी काम नहीं कर रहा। हम इसे ठीक कर रहे हैं — तब तक 'गूगल पर खोजें' से आधिकारिक पेज ढूंढें।"
               : "Some people reported this scheme's link isn't working. We're fixing it — meanwhile, use 'Find on Google' to reach the official page.")
    : (isHindi ? "लोगों की रिपोर्ट के बाद इस योजना की कुछ जानकारी दोबारा जांची जा रही है। आवेदन से पहले आधिकारिक वेबसाइट पर ज़रूर देखें।"
               : "Some details of this scheme are being re-checked after user reports. Please confirm on the official website before applying.");
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "0 0 12px", padding: "9px 12px", borderRadius: 12,
      background: dark ? "rgba(217,119,6,0.12)" : "#FFFBEB", border: `1px solid ${dark ? "rgba(217,119,6,0.3)" : "#FDE68A"}`,
      fontSize: 11.5, lineHeight: 1.5, color: dark ? "#FCD34D" : "#92400E", overflowWrap: "anywhere" }}>
      <span style={{ flexShrink: 0 }}>⚠️</span><span style={{ minWidth: 0 }}>{text}</span>
    </div>
  );
}

export function SchemeFlagButton({ scheme, lang, dark, onSignIn, userName }) {
  const isHindi = lang === "hi";
  const L = (en, hi) => (isHindi ? hi : en);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);   // server result
  const [err, setErr] = useState("");
  const [mine, setMine] = useState([]);       // [{ reason, at, status, reply }] — newest first
  const txt = dark ? "#e5e5e5" : "#1a1a1a", sub = dark ? "#9a9a9a" : "#777", line = dark ? "#2c2c2e" : "#ececec";

  // Load this person's earlier reports for this scheme + their current status.
  useEffect(() => {
    let alive = true;
    const sid = scheme?.id;
    if (!sid) return;
    (async () => {
      const local = readLocal()[sid] || [];
      let list = [];
      const u = auth.currentUser;
      if (u) {
        try {
          const snap = await getDocs(query(collection(db, "reports"), where("uid", "==", u.uid)));
          list = snap.docs.map(d => d.data()).filter(r => r.schemeId === sid && r.source === "scheme_flag")
            .map(r => {
              const hist = Array.isArray(r.replyHistory) ? r.replyHistory.filter(h => !h.isReopen) : [];
              return { reason: r.flagReason, at: toMs(r.createdAt), status: r.status || "open", reply: hist.length ? hist[hist.length - 1].text : (r.adminReply || "") };
            });
        } catch { /* offline — fall back to this phone's copy */ }
      }
      if (!list.length && local.length) {
        // Not signed in (or offline): status comes from the public summary —
        // the admin resolving the report removes that reason from it.
        let f = {};
        try { const d = await getDoc(doc(db, "schemeFlags", sid)); f = d.exists() ? d.data() : {}; } catch { /* keep "open" */ }
        // status + team reply as the admin set them (older reports without a
        // status: entry gone = resolved)
        list = local.map(x => {
          const e = f[x.reason];
          const status = e ? (e.status || "open") : (Date.now() - x.at > 60000 ? "resolved" : "open");
          return { ...x, status, reply: e?.reply || "" };
        });
      }
      // newest report per reason
      const seen = new Set();
      list = list.sort((a, b) => b.at - a.at).filter(x => !seen.has(x.reason) && seen.add(x.reason));
      if (alive) setMine(list);
    })();
    return () => { alive = false; };
  }, [scheme?.id]);
  const openReasons = new Set(mine.filter(m => m.status !== "resolved").map(m => m.reason));

  async function submit() {
    if (!reason || busy) return;
    if (reason === "other" && note.trim().length < 3) { setErr(L("Please write a few words.", "कृपया कुछ शब्द लिखें।")); return; }
    setBusy(true); setErr("");
    try {
      const u = auth.currentUser;
      const headers = { "Content-Type": "application/json" };
      if (u) { try { headers.Authorization = `Bearer ${await u.getIdToken()}`; } catch { /* send as guest */ } }
      const r = await fetch("/api/log-checker-run", { method: "POST", headers,
        body: JSON.stringify({ type: "flag", schemeId: scheme.id, reason, note: note.trim(), lang, userName: userName || u?.displayName || "" }) });
      if (r.status === 429) { setErr(L("You've sent many reports today — please try again tomorrow.", "आज आपने कई रिपोर्ट भेजी हैं — कृपया कल फिर कोशिश करें।")); return; }
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error();
      setDone(d);
      const entry = { reason, at: Date.now(), status: d.status || "open", reply: "" };
      saveLocal(scheme.id, { reason, at: entry.at, linkAlive: d.linkAlive ?? null });
      setMine(m => [entry, ...m.filter(x => x.reason !== reason)]);
      if (d.signedIn && u?.email && !d.duplicate && !d.existing) {
        const R = REASONS.find(x => x.v === reason);
        sendReportConfirmation({ email: u.email, name: userName || u.displayName || "User", typeLabel: "Scheme problem",
          subject: `${scheme.name?.en || scheme.id} — ${R?.en}`, message: note.trim() || R?.en });
      }
    } catch {
      setErr(L("Couldn't send — please check your internet and try again.", "भेज नहीं सके — इंटरनेट जांचकर फिर कोशिश करें।"));
    } finally { setBusy(false); }
  }

  const wrap = { marginTop: 14, borderTop: `1px dashed ${line}`, paddingTop: 12 };
  const ST = {
    open:        { c: "#D97706", t: L("🟡 Our team is checking", "🟡 हमारी टीम जांच रही है") },
    in_progress: { c: "#2563EB", t: L("🔵 Being fixed", "🔵 ठीक किया जा रहा है") },
    resolved:    { c: "#15803D", t: L("✅ Fixed — thank you!", "✅ ठीक हो गया — धन्यवाद!") },
  };
  const fmtDay = (ms) => new Date(ms).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { day: "numeric", month: "short" });
  if (!open && !done && mine.length) {
    const allFixed = mine.every(m => m.status === "resolved");
    return (
      <div style={wrap}>
        <div style={{ padding: "11px 13px", borderRadius: 12, border: `1px solid ${line}`, background: dark ? "rgba(255,255,255,0.03)" : "#FAFAF9" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: sub, letterSpacing: 0.3, marginBottom: 6 }}>⚑ {mine.length > 1 ? L("YOUR REPORTS", "आपकी रिपोर्ट") : L("YOUR REPORT", "आपकी रिपोर्ट")}</div>
          {mine.slice(0, 3).map(m => {
            const R = REASONS.find(x => x.v === m.reason);
            const st = ST[m.status] || ST.open;
            return (
              <div key={m.reason} style={{ padding: "6px 0", borderTop: mine[0] === m ? "none" : `1px dashed ${line}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: txt }}>{R?.icon} {isHindi ? R?.hi : R?.en}</span>
                  <span style={{ fontSize: 10.5, color: sub }}>· {L("sent", "भेजी")} {fmtDay(m.at)}</span>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: st.c, marginTop: 3 }}>{st.t}</div>
                {m.reply && <div style={{ fontSize: 11.5, color: txt, marginTop: 4, lineHeight: 1.45, overflowWrap: "anywhere" }}>💬 {L("Team", "टीम")}: {m.reply.length > 160 ? m.reply.slice(0, 157) + "…" : m.reply}</div>}
              </div>
            );
          })}
          {auth.currentUser && <div style={{ fontSize: 10.5, color: sub, marginTop: 6 }}>{L("Full details: Profile → Report / Query → My Reports", "पूरी जानकारी: प्रोफाइल → रिपोर्ट / सवाल → मेरी रिपोर्ट")}</div>}
        </div>
        <div role="button" onClick={() => setOpen(true)} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 600, color: sub, cursor: "pointer", padding: "9px 0 2px" }}>
          {allFixed ? L("Still wrong? Report again", "अब भी गलत है? फिर से बताएं") : L("Report a different problem", "कोई दूसरी समस्या बताएं")}
        </div>
      </div>
    );
  }
  if (!open) {
    return (
      <div style={wrap}>
        <div role="button" onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: sub, cursor: "pointer", padding: "6px 0" }}>
          <span>⚑</span>{L("Something wrong with this scheme? Tell us", "इस योजना में कुछ गलत है? हमें बताएं")}
        </div>
      </div>
    );
  }

  if (done) {
    const msg = done.duplicate ? L("You already reported this today — thank you!", "आप आज यह पहले ही बता चुके हैं — धन्यवाद!")
      : done.existing ? L("You'd already reported this — we added your new details to that report. Our team is on it.", "आप यह पहले ही बता चुके थे — आपकी नई जानकारी उसी रिपोर्ट में जोड़ दी गई है। हमारी टीम इस पर काम कर रही है।")
      : reason === "link" && done.linkAlive === true ? L("Thanks! We just checked — the official website is answering right now. It may be slow; please try again in a few minutes, or use 'Find on Google'.", "धन्यवाद! हमने अभी जांचा — आधिकारिक वेबसाइट अभी चल रही है। यह धीमी हो सकती है; कुछ मिनट बाद फिर कोशिश करें, या 'गूगल पर खोजें' इस्तेमाल करें।")
      : reason === "link" && done.linkAlive === false ? L("Thanks! Our check couldn't reach the website either, so it's queued for an automatic fix — usually within a day. Meanwhile, use 'Find on Google'.", "धन्यवाद! हमारी जांच भी वेबसाइट तक नहीं पहुंच सकी, इसलिए इसे अपने आप ठीक करने की कतार में डाल दिया है — आमतौर पर एक दिन में। तब तक 'गूगल पर खोजें' इस्तेमाल करें।")
      : L("Thanks! Our team will check this scheme.", "धन्यवाद! हमारी टीम इस योजना की जांच करेगी।");
    return (
      <div style={wrap}>
        <div style={{ padding: "11px 13px", borderRadius: 12, background: dark ? "rgba(19,136,8,0.12)" : "#F0FDF4", border: `1px solid ${dark ? "rgba(74,222,128,0.25)" : "#BBF7D0"}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: dark ? "#86EFAC" : "#166534", lineHeight: 1.5, overflowWrap: "anywhere" }}>✅ {msg}</div>
          {done.signedIn ? (
            <div style={{ fontSize: 11, color: sub, marginTop: 6, lineHeight: 1.45 }}>{L("Follow it in Profile → Report / Query → My Reports.", "इसे प्रोफाइल → रिपोर्ट / सवाल → मेरी रिपोर्ट में देखें।")}</div>
          ) : !done.duplicate && onSignIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: sub, lineHeight: 1.45 }}>{L("Want an update when it's fixed?", "ठीक होने पर जानकारी चाहिए?")}</span>
              <span role="button" onClick={onSignIn} style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 800, color: "#fff", background: "#FF9933", borderRadius: 99, padding: "6px 12px", cursor: "pointer" }}>{L("Sign in", "साइन इन करें")}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: txt, marginBottom: 8 }}>⚑ {L("What's wrong?", "क्या गलत है?")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {REASONS.map(x => {
          const on = reason === x.v;
          if (openReasons.has(x.v)) return (
            <span key={x.v} style={{ fontSize: 11.5, fontWeight: 600, padding: "7px 11px", borderRadius: 99, border: `1.5px dashed ${line}`, color: sub, opacity: 0.8 }}>
              {x.icon} {isHindi ? x.hi : x.en} · {L("already reported", "पहले ही बताया")}
            </span>
          );
          return (
            <span key={x.v} role="button" onClick={() => { setReason(x.v); setErr(""); }} style={{ fontSize: 11.5, fontWeight: on ? 800 : 600, padding: "7px 11px", borderRadius: 99, cursor: "pointer",
              border: `1.5px solid ${on ? "#FF9933" : line}`, color: on ? "#C2410C" : txt, background: on ? (dark ? "rgba(255,153,51,0.12)" : "#FFF7ED") : "transparent" }}>
              {x.icon} {isHindi ? x.hi : x.en}
            </span>
          );
        })}
      </div>
      {reason && (
        <textarea value={note} onChange={e => setNote(e.target.value.slice(0, 400))} rows={2}
          placeholder={reason === "other" ? L("Tell us what's wrong…", "बताएं क्या गलत है…") : L("Add a detail (optional)", "कुछ और बताना हो तो लिखें (वैकल्पिक)")}
          style={{ width: "100%", boxSizing: "border-box", marginTop: 9, padding: "9px 11px", borderRadius: 10, border: `1px solid ${line}`, background: dark ? "#1c1c1e" : "#fafafa",
            color: txt, fontSize: 12.5, fontFamily: "inherit", resize: "none", outline: "none" }} />
      )}
      {err && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 6 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <span role="button" onClick={() => { setOpen(false); setReason(null); setNote(""); setErr(""); }} style={{ flex: 1, textAlign: "center", padding: 10, borderRadius: 11, border: `1px solid ${line}`, fontSize: 12, fontWeight: 600, color: sub, cursor: "pointer" }}>{L("Cancel", "रद्द करें")}</span>
        <span role="button" onClick={submit} style={{ flex: 2, textAlign: "center", padding: 10, borderRadius: 11, fontSize: 12.5, fontWeight: 800, color: "#fff", cursor: reason ? "pointer" : "default",
          background: reason ? "linear-gradient(135deg,#FF9933,#F97316)" : (dark ? "#3a3a3c" : "#d4d4d4") }}>
          {busy ? (reason === "link" ? L("Checking the link…", "लिंक जांच रहे हैं…") : L("Sending…", "भेज रहे हैं…")) : L("Send", "भेजें")}
        </span>
      </div>
      <div style={{ fontSize: 10, color: sub, marginTop: 7, textAlign: "center" }}>{L("No sign-in needed · the scheme name is attached automatically", "साइन-इन ज़रूरी नहीं · योजना का नाम अपने आप जुड़ जाता है")}</div>
    </div>
  );
}
