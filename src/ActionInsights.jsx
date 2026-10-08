// src/ActionInsights.jsx — Admin · "What people do" (usage insights)
// ─────────────────────────────────────────────────────────────────────────────
// Reads the anonymous counters in appStats/events (written by src/track.js →
// /api/log-checker-run type "events") plus the existing search log, and shows:
//   • key actions for a period (views, apply taps, marked applied, approved…)
//   • a 14-day chart, the quiz funnel (where people stop), top schemes,
//     special groups ticked, searches that found nothing
//   • plain-language "what to look at" tips worked out from those numbers
// Counters only — no names, user ids or answers are stored for these.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import { SCHEME_DB } from "./schemesData.js";

const SAFFRON = "#FF9933", NAVY = "#3B82F6", GREEN = "#16A34A", VIOLET = "#8B5CF6", PINK = "#EC4899", AMBER = "#F59E0B", TEAL = "#0EA5E9";
const NAME = new Map(SCHEME_DB.map(s => [s.id, s.name?.en || s.id]));
const ICON = new Map(SCHEME_DB.map(s => [s.id, s.icon || "📄"]));

const STEP_LABEL = {
  who: "Who are you", income: "Income", landHolding: "Farm land", educationLevel: "Class / course",
  rationCard: "Ration card", state: "State", house: "House", caste: "Category", age: "Age", area: "Area",
  gender: "Gender", disability: "Disability", groups: "Special groups",
};
const STEP_ORDER = ["who", "income", "landHolding", "educationLevel", "rationCard", "state", "house", "caste", "age", "area", "gender", "disability", "groups"];
const GROUP_LABEL = {
  construct: "Construction workers", fisher: "Fishermen", artisan: "Weavers & artisans", minority: "Minority communities",
  sports: "Sportspersons", artist: "Artists", defence: "Ex-servicemen", govt: "Govt employees", patient: "Patients",
  tea: "Tea garden workers", orphan: "Lost a parent", media: "Journalists & lawyers", merit: "Toppers", abroad: "Study abroad", graduate: "Fresh graduates",
};

function istDay(offsetDays = 0) {
  return new Date(Date.now() + 5.5 * 3600 * 1000 - offsetDays * 86400000).toISOString().slice(0, 10);
}
const fmt = n => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n || 0));
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

export default function ActionInsights({ events, usageData, th, dark, onRefresh, loading }) {
  const [range, setRange] = useState(30);       // 7 | 30 | 0 (all time)
  const [topTab, setTopTab] = useState("views"); // views | apply | success

  const days = events?.days || {};
  const sumRange = useMemo(() => {
    const out = {};
    const keys = Object.keys(days);
    const from = range ? istDay(range - 1) : "0000";
    for (const d of keys) if (d >= from) for (const [k, v] of Object.entries(days[d] || {})) out[k] = (out[k] || 0) + (v || 0);
    return out;
  }, [days, range]);

  const daily = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = istDay(13 - i);
    const r = days[d] || {};
    return { d, views: r.scheme_view || 0, apply: r.apply_click || 0, label: i === 13 ? "Today" : d.slice(8) };
  }), [days]);

  const schemes = useMemo(() => Object.entries(events?.schemes || {})
    .filter(([id]) => NAME.has(id))
    .map(([id, c]) => ({ id, name: NAME.get(id), icon: ICON.get(id), v: c.v || 0, a: c.a || 0, t: c.t || 0, ok: (c.ok || 0) + (c.rc || 0), rj: c.rj || 0 })),
  [events]);

  const top = useMemo(() => {
    const key = topTab === "views" ? "v" : topTab === "apply" ? "a" : "ok";
    return [...schemes].filter(s => s[key] > 0).sort((x, y) => y[key] - x[key] || y.v - x.v).slice(0, 10);
  }, [schemes, topTab]);

  const quiz = events?.quiz || {};
  const funnel = useMemo(() => {
    const start = quiz.start || 0;
    const rows = STEP_ORDER.filter(k => quiz[`step_${k}`]).map(k => ({ k, label: STEP_LABEL[k] || k, n: quiz[`step_${k}`] || 0 }));
    // Adaptive steps (farm land, class, ration card) are only asked to some people — keep them out of the drop-off maths.
    const main = rows.filter(r => !["landHolding", "educationLevel", "rationCard"].includes(r.k));
    let worst = null, prev = start;
    for (const r of main) {
      const drop = prev > 0 ? (prev - r.n) / prev : 0;
      if (prev >= 5 && (!worst || drop > worst.drop)) worst = { ...r, drop };
      prev = r.n;
    }
    const done = quiz.done || 0;
    if (prev >= 5) { const drop = (prev - done) / prev; if (!worst || drop > worst.drop) worst = { k: "done", label: "Final results", drop }; }
    return { start, rows, done, worst };
  }, [quiz]);

  const groups = useMemo(() => Object.entries(events?.groups || {}).sort((a, b) => b[1] - a[1]), [events]);

  const zeroSearches = useMemo(() => {
    const m = {};
    for (const r of usageData?.schemeSearches || []) {
      if (r?.n !== 0 || !r.q) continue;
      const k = r.q.toLowerCase().trim();
      m[k] = (m[k] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [usageData]);
  const searchesWithCount = (usageData?.schemeSearches || []).filter(r => typeof r?.n === "number").length;

  // ── Plain-language tips ──────────────────────────────────────────────────
  const tips = useMemo(() => {
    const t = [];
    if (funnel.worst && funnel.worst.drop >= 0.1) t.push({ icon: "🚪", text: `Most people who leave the quiz stop at “${funnel.worst.label}” (${Math.round(funnel.worst.drop * 100)}% drop there).` });
    const lowApply = schemes.filter(s => s.v >= 15 && s.a / s.v < 0.05).sort((a, b) => b.v - a.v)[0];
    if (lowApply) t.push({ icon: "🔗", text: `“${lowApply.name}” is opened a lot (${lowApply.v}×) but almost nobody taps Apply (${pct(lowApply.a, lowApply.v)}%). Check its link and how-to-apply text.` });
    const best = [...schemes].sort((a, b) => b.ok - a.ok)[0];
    if (best?.ok > 0) t.push({ icon: "🏆", text: `Biggest success: “${best.name}” — ${best.ok} people say they got it approved or received money.` });
    if (zeroSearches[0]) t.push({ icon: "🔍", text: `People searched “${zeroSearches[0][0]}” ${zeroSearches[0][1]}× and found nothing — a scheme to add, or a search word to teach.` });
    const v = sumRange.scheme_view || 0, a = sumRange.apply_click || 0;
    if (v >= 20) t.push({ icon: "📈", text: `${pct(a, v)}% of scheme views lead to an Apply tap in this period.` });
    return t;
  }, [funnel, schemes, zeroSearches, sumRange]);

  const card = { background: th.card, border: `1.5px solid ${th.border}`, borderRadius: 16, padding: "13px 14px" };
  const h = (txt, extra) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: th.textMid, letterSpacing: 0.3 }}>{txt}</div>
      {extra}
    </div>
  );
  const noData = !events || !Object.keys(events.totals || {}).length;

  const kpis = [
    { icon: "👀", label: "Scheme views", v: sumRange.scheme_view, color: NAVY },
    { icon: "↗️", label: "Apply taps", v: sumRange.apply_click, color: SAFFRON, sub: sumRange.scheme_view ? `${pct(sumRange.apply_click, sumRange.scheme_view)}% of views` : null },
    { icon: "📋", label: "Marked applied", v: sumRange.app_track, color: VIOLET },
    { icon: "✅", label: "Approved / got money", v: (sumRange.app_approved || 0) + (sumRange.app_received || 0), color: GREEN, sub: sumRange.app_rejected ? `${sumRange.app_rejected} rejected` : null },
    { icon: "📤", label: "Shares", v: (sumRange.share_result || 0) + (sumRange.share_checklist || 0), color: PINK },
    { icon: "👨‍👩‍👧", label: "Family added", v: sumRange.family_add, color: TEAL },
    { icon: "🎯", label: "Quiz finished", v: sumRange.quiz_done, color: AMBER, sub: sumRange.quiz_start ? `${pct(sumRange.quiz_done, sumRange.quiz_start)}% of starts` : null },
    { icon: "🔔", label: "Reminders on", v: Math.max(0, (sumRange.push_on || 0) - (sumRange.push_off || 0)), color: "#64748B", sub: sumRange.push_off ? `${sumRange.push_off} turned off` : null },
  ];
  const maxDay = Math.max(1, ...daily.map(d => Math.max(d.views, d.apply)));

  return (
    <div style={{ padding: "14px 14px 0", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: th.text }}>🎯 What people do</div>
          <div style={{ fontSize: 10, color: th.textSub, marginTop: 2 }}>Anonymous counts — no names or personal details</div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[[7, "7d"], [30, "30d"], [0, "All"]].map(([v, l]) => (
            <div key={l} onClick={() => setRange(v)} style={{ fontSize: 10, fontWeight: 800, padding: "5px 9px", borderRadius: 8, cursor: "pointer",
              background: range === v ? SAFFRON : th.card2, color: range === v ? "#fff" : th.textMid, border: `1px solid ${range === v ? SAFFRON : th.border}` }}>{l}</div>
          ))}
          {onRefresh && <div onClick={onRefresh} style={{ fontSize: 11, color: SAFFRON, fontWeight: 700, cursor: "pointer", padding: "5px 8px" }}>{loading ? "…" : "🔄"}</div>}
        </div>
      </div>

      {noData ? (
        <div style={{ ...card, textAlign: "center", color: th.textSub, fontSize: 12, lineHeight: 1.6 }}>
          📭 No actions counted yet. Counting started with this update — views, Apply taps, applications and shares will appear here as people use the app.
        </div>
      ) : (<>
        {tips.length > 0 && (
          <div style={{ ...card, background: dark ? "rgba(255,153,51,0.08)" : "#FFF7ED", border: `1.5px solid ${dark ? "rgba(255,153,51,0.3)" : "#FED7AA"}` }}>
            {h("💡 WHAT TO LOOK AT")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tips.map((x, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: th.text, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>{x.icon}</span><span>{x.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ ...card, padding: "10px 12px", borderLeft: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 10, color: th.textSub, fontWeight: 700 }}>{k.icon} {k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: th.text, marginTop: 3 }}>{fmt(k.v || 0)}</div>
              {k.sub && <div style={{ fontSize: 9.5, color: k.color, fontWeight: 700, marginTop: 1 }}>{k.sub}</div>}
            </div>
          ))}
        </div>

        <div style={card}>
          {h("📅 LAST 14 DAYS", <div style={{ display: "flex", gap: 10, fontSize: 9, color: th.textSub }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: NAVY, marginRight: 4 }} />Views</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: SAFFRON, marginRight: 4 }} />Apply taps</span>
          </div>)}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 86 }}>
            {daily.map(d => (
              <div key={d.d} title={`${d.d}: ${d.views} views, ${d.apply} apply taps`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 70, width: "100%", justifyContent: "center" }}>
                  <div style={{ width: "45%", height: `${Math.max(2, Math.round(d.views / maxDay * 70))}px`, background: NAVY, borderRadius: "2px 2px 0 0", opacity: d.views ? 1 : 0.2 }} />
                  <div style={{ width: "45%", height: `${Math.max(2, Math.round(d.apply / maxDay * 70))}px`, background: SAFFRON, borderRadius: "2px 2px 0 0", opacity: d.apply ? 1 : 0.2 }} />
                </div>
                <div style={{ fontSize: 7.5, color: th.textSub }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {funnel.start > 0 && (
          <div style={card}>
            {h("🪜 QUIZ — WHERE PEOPLE STOP", <span style={{ fontSize: 9.5, color: th.textSub }}>all time</span>)}
            {[{ k: "start", label: "Opened the quiz", n: funnel.start }, ...funnel.rows, { k: "done", label: "Saw results", n: funnel.done }].map(r => {
              const p = pct(r.n, funnel.start);
              const isWorst = funnel.worst && funnel.worst.k === r.k && funnel.worst.drop >= 0.1;
              const adaptive = ["landHolding", "educationLevel", "rationCard"].includes(r.k);
              return (
                <div key={r.k} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ color: isWorst ? "#DC2626" : th.textMid, fontWeight: isWorst ? 800 : 600 }}>{isWorst ? "⚠️ " : ""}{r.label}{adaptive ? " (only some people)" : ""}</span>
                    <span style={{ color: th.text, fontWeight: 800 }}>{r.n} <span style={{ color: th.textSub, fontWeight: 600 }}>· {p}%</span></span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: th.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, p)}%`, background: r.k === "done" ? GREEN : isWorst ? "#DC2626" : adaptive ? th.textSub : VIOLET, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={card}>
          {h("🏅 TOP SCHEMES", <span style={{ fontSize: 9.5, color: th.textSub }}>all time</span>)}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["views", "Most opened"], ["apply", "Most Apply taps"], ["success", "Most approved"]].map(([id, l]) => (
              <div key={id} onClick={() => setTopTab(id)} style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: "pointer",
                background: topTab === id ? NAVY : th.card2, color: topTab === id ? "#fff" : th.textMid, border: `1.5px solid ${topTab === id ? NAVY : th.border}` }}>{l}</div>
            ))}
          </div>
          {top.length === 0 ? (
            <div style={{ fontSize: 11, color: th.textSub, textAlign: "center", padding: "8px 0" }}>Nothing yet.</div>
          ) : top.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: i ? `1px solid ${th.border}` : "none" }}>
              <span style={{ fontSize: 15, width: 22, textAlign: "center", flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: th.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                <div style={{ fontSize: 9.5, color: th.textSub, marginTop: 1 }}>
                  👀 {s.v} · ↗️ {s.a}{s.v ? ` (${pct(s.a, s.v)}%)` : ""} · 📋 {s.t} · ✅ {s.ok}{s.rj ? ` · ❌ ${s.rj}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {groups.length > 0 && (
            <div style={{ ...card, flex: "1 1 240px" }}>
              {h("🧩 SPECIAL GROUPS TICKED")}
              {groups.slice(0, 8).map(([k, n]) => (
                <div key={k} style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ color: th.textMid, fontWeight: 600 }}>{GROUP_LABEL[k] || k}</span>
                    <span style={{ color: th.text, fontWeight: 800 }}>{n}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: th.border }}>
                    <div style={{ height: "100%", width: `${pct(n, groups[0][1])}%`, background: TEAL, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ ...card, flex: "1 1 240px" }}>
            {h("🔍 SEARCHES THAT FOUND NOTHING")}
            {zeroSearches.length === 0 ? (
              <div style={{ fontSize: 11, color: th.textSub, lineHeight: 1.5 }}>
                {searchesWithCount ? "None — every search found something. 👍" : "Result counts are recorded from now on."}
              </div>
            ) : zeroSearches.map(([q, n]) => (
              <div key={q} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11, padding: "4px 0" }}>
                <span style={{ color: th.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>“{q}”</span>
                <span style={{ color: "#DC2626", fontWeight: 800, flexShrink: 0 }}>{n}×</span>
              </div>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
}
