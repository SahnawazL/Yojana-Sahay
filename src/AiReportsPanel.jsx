// AiReportsPanel.jsx — Yojana Sahay admin · "Report a problem" on AI answers
// Users long-press an AI answer (or tap ⋯) → Report. Those land in
// Firestore aiReports; this panel lists them so each one can be checked and
// marked Fixed or Dismissed. Reads/writes go through the admin-only API
// (api/log-checker-run.js type "admin_ai_reports").
import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "./adminFetch.js";

const REASONS = {
  wrong: "Wrong or outdated info",
  harmful: "Harmful or unsafe advice",
  offensive: "Offensive or inappropriate",
  other: "Something else",
};

async function call(body) {
  const res = await adminFetch("/api/log-checker-run", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "admin_ai_reports", ...body }),
  });
  let d = {}; try { d = await res.json(); } catch {}
  if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
  return d;
}

const ago = (ms) => {
  if (!ms) return "";
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  return new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function AiReportsPanel({ dark = false }) {
  const c = dark
    ? { card: "#16181d", line: "#2a2e36", text: "#e8e8ea", sub: "#9a9ca3", soft: "#1d2027", red: "#f87171", green: "#4ade80", accent: "#FFB366" }
    : { card: "#ffffff", line: "#e6e7ea", text: "#17181c", sub: "#6b6e76", soft: "#f6f7f9", red: "#c62828", green: "#138808", accent: "#C2410C" };
  const [view, setView] = useState("new");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const load = useCallback(async (v = view) => {
    setBusy(true); setErr("");
    try { const d = await call({ op: "list", status: v }); setItems(d.items || []); setOpen(d.openCount || 0); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  }, [view]);

  useEffect(() => { load(view); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  async function mark(id, status) {
    setErr("");
    try {
      await call({ op: "set", id, status });
      setItems((xs) => view === "new" ? xs.filter((x) => x.id !== id) : xs.map((x) => x.id === id ? { ...x, status } : x));
      setOpen((n) => Math.max(0, n + (status === "new" ? 1 : -1)));
    } catch (e) { setErr(e.message); }
  }

  const pill = (active) => ({ padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${active ? c.text : c.line}`, background: active ? c.text : "transparent", color: active ? c.card : c.sub });
  const act = (col) => ({ padding: "6px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1px solid ${c.line}`, background: c.card, color: col });

  return (
    <section style={{ background: c.card, border: `1px solid ${c.line}`, borderRadius: 12, margin: "10px 12px 14px", color: c.text }} aria-label="AI answer reports">
      <button type="button" onClick={() => setCollapsed((x) => !x)}
        style={{ all: "unset", boxSizing: "border-box", width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer" }}>
        <span style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>AI answer reports</span>
        {open > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: c.red, borderRadius: 20, padding: "2px 9px" }}>{open} new</span>}
        {open === 0 && !busy && <span style={{ fontSize: 12, color: c.sub }}>All clear</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.sub} strokeWidth="2.2" strokeLinecap="round" style={{ transform: collapsed ? "none" : "rotate(180deg)", transition: "transform .2s" }} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {!collapsed && (
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ fontSize: 12.5, color: c.sub, lineHeight: 1.5, marginBottom: 10 }}>
            People report an AI answer by long-pressing it. Check the answer, fix the scheme data or prompt if needed, then mark it Fixed or Dismiss it.
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
            <span role="button" tabIndex={0} style={pill(view === "new")} onClick={() => setView("new")}>To review</span>
            <span role="button" tabIndex={0} style={pill(view === "all")} onClick={() => setView("all")}>All</span>
            <span role="button" tabIndex={0} onClick={() => load()} style={{ marginLeft: "auto", fontSize: 12.5, color: c.accent, cursor: "pointer", fontWeight: 600 }}>{busy ? "Loading…" : "Refresh"}</span>
          </div>
          {err && <div role="alert" style={{ fontSize: 13, color: c.red, marginBottom: 8 }}>{err}</div>}
          {!busy && !err && items.length === 0 && (
            <div style={{ fontSize: 13, color: c.sub, padding: "14px 0", textAlign: "center" }}>{view === "new" ? "No reports waiting." : "No reports yet."}</div>
          )}
          {items.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} style={{ borderTop: `1px solid ${c.line}`, padding: "11px 0" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: r.reason === "harmful" || r.reason === "offensive" ? c.red : c.text }}>{REASONS[r.reason] || r.reason}</span>
                  <span style={{ fontSize: 11.5, color: c.sub }}>{ago(r.createdAt)}{r.lang === "hi" ? " · Hindi" : ""}</span>
                  {r.status !== "new" && <span style={{ fontSize: 11.5, fontWeight: 600, color: r.status === "resolved" ? c.green : c.sub }}>{r.status === "resolved" ? "Fixed" : "Dismissed"}</span>}
                </div>
                {r.note && <div style={{ fontSize: 13, marginTop: 4 }}>"{r.note}"</div>}
                {r.question && <div style={{ fontSize: 12.5, color: c.sub, marginTop: 4 }}><b style={{ fontWeight: 600 }}>Asked:</b> {r.question}</div>}
                <div onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{ fontSize: 12.5, marginTop: 6, background: c.soft, borderRadius: 8, padding: "8px 10px", whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "pointer", maxHeight: isOpen ? "none" : 72, overflow: "hidden", lineHeight: 1.5 }}>
                  {r.answer || "(no answer text)"}
                </div>
                {!isOpen && r.answer.length > 180 && <div style={{ fontSize: 11.5, color: c.accent, marginTop: 3, cursor: "pointer" }} onClick={() => setExpanded(r.id)}>Show full answer</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {r.status === "new" ? (
                    <>
                      <button type="button" style={act(c.green)} onClick={() => mark(r.id, "resolved")}>Fixed</button>
                      <button type="button" style={act(c.sub)} onClick={() => mark(r.id, "dismissed")}>Dismiss</button>
                    </>
                  ) : (
                    <button type="button" style={act(c.sub)} onClick={() => mark(r.id, "new")}>Reopen</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
