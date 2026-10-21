// AudiencePanel.jsx — Yojana Sahay admin · "How many people?"
// Two honest numbers that were mixed up before:
//   • Visitors — devices that opened the app/site (anonymous, once per device
//     per day; from appStats/events "visit" counters, see src/track.js).
//   • Accounts — people who signed in (Firebase Auth), and how many of them
//     finished the profile (the "Profiles" card = finished profiles only).
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "./adminFetch.js";

const istDay = (ms) => new Date(ms + 5.5 * 3600e3).toISOString().slice(0, 10);

export default function AudiencePanel({ events, dark = false }) {
  const c = dark
    ? { card: "#16181d", line: "#2a2e36", text: "#e8e8ea", sub: "#9a9ca3", soft: "#1d2027", bar: "#FF9933", bar2: "#3b82f6" }
    : { card: "#ffffff", line: "#e6e7ea", text: "#17181c", sub: "#6b6e76", soft: "#f6f7f9", bar: "#FF9933", bar2: "#003580" };
  const [aud, setAud] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const res = await adminFetch("/api/log-checker-run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "admin_audience" }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
        if (!off) setAud(d);
      } catch (e) { if (!off) setErr(e.message); }
    })();
    return () => { off = true; };
  }, []);

  const v = useMemo(() => {
    const days = events?.days || {};
    const now = Date.now();
    const sum = (n, key) => { let t = 0; for (let i = 0; i < n; i++) t += days[istDay(now - i * 86400e3)]?.[key] || 0; return t; };
    const tracked = Object.keys(days).filter(d => days[d]?.visit).sort();
    const last14 = Array.from({ length: 14 }, (_, i) => { const d = istDay(now - (13 - i) * 86400e3); return { d, n: days[d]?.visit || 0 }; });
    return {
      today: sum(1, "visit"), d7: sum(7, "visit"), d30: sum(30, "visit"), new7: sum(7, "visit_new"),
      since: tracked[0] || null, src: events?.features?.visit || {}, last14,
    };
  }, [events]);

  const a = aud?.accounts;
  const weeks = useMemo(() => {
    if (!a?.byWeek) return [];
    return Object.entries(a.byWeek).sort(([x], [y]) => x.localeCompare(y)).slice(-10);
  }, [a]);

  const Stat = ({ label, value, sub }) => (
    <div style={{ flex: "1 1 120px", minWidth: 110, background: c.soft, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11.5, color: c.sub, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginTop: 2 }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>{sub}</div>}
    </div>
  );
  const Bars = ({ data, color, labelOf }) => {
    const max = Math.max(1, ...data.map(x => x.n));
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 54, marginTop: 8 }}>
        {data.map(x => (
          <div key={x.d} title={`${labelOf(x.d)}: ${x.n}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", maxWidth: 22, height: Math.max(2, Math.round(x.n / max * 40)), background: x.n ? color : c.line, borderRadius: 3 }} />
            <div style={{ fontSize: 9, color: c.sub }}>{x.n}</div>
          </div>
        ))}
      </div>
    );
  };
  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <section style={{ background: c.card, border: `1px solid ${c.line}`, borderRadius: 14, padding: 16, color: c.text }} aria-label="Visitors and accounts">
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>Visitors</div>
        <div style={{ fontSize: 11.5, color: c.sub }}>
          Devices that opened the app or site, counted once a day{v.since ? ` · counting since ${fmt(v.since)}` : " · counting starts with the next visit"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <Stat label="Today" value={v.today} />
        <Stat label="Last 7 days" value={v.d7} sub="visits (device-days)" />
        <Stat label="Last 30 days" value={v.d30} />
        <Stat label="New devices · 7 days" value={v.new7} />
      </div>
      <Bars data={v.last14} color={c.bar} labelOf={fmt} />
      <div style={{ fontSize: 11.5, color: c.sub, marginTop: 6 }}>
        Opened from: Play Store app {v.src.app || 0} · Home-screen app {v.src.installed || 0} · Browser {v.src.web || 0}
      </div>

      <div style={{ height: 1, background: c.line, margin: "14px 0" }} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>Accounts</div>
        <div style={{ fontSize: 11.5, color: c.sub }}>People who signed in · "Profiles" below counts only people who finished sign-up</div>
      </div>
      {err ? <div style={{ fontSize: 12.5, color: "#dc2626", marginTop: 8 }}>{err}</div> : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <Stat label="Signed-in accounts" value={a?.total} sub={a ? `Google ${a.google} · Phone ${a.phone}${a.email ? ` · E-mail ${a.email}` : ""}` : "loading…"} />
            <Stat label="Finished profile" value={aud?.profiles} sub={a && aud?.profiles != null ? `${a.total ? Math.round(aud.profiles / a.total * 100) : 0}% of accounts` : null} />
            <Stat label="New accounts" value={a ? a.new7 : null} sub={a ? `7 days · ${a.new30} in 30 days` : null} />
            <Stat label="Used in last 7 days" value={a ? a.active7 : null} sub={a ? `${a.active30} in 30 days` : null} />
          </div>
          {weeks.length > 0 && (
            <>
              <div style={{ fontSize: 11.5, color: c.sub, marginTop: 10 }}>New accounts per week</div>
              <Bars data={weeks.map(([d, n]) => ({ d, n }))} color={c.bar2} labelOf={d => `Week of ${fmt(d)}`} />
            </>
          )}
        </>
      )}
    </section>
  );
}
