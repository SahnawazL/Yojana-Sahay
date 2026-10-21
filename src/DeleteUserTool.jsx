// DeleteUserTool.jsx — Yojana Sahay admin · handle e-mailed "Data Deletion Request"s
// Look a person up by e-mail / phone / user ID, see exactly what will be
// removed, type DELETE, done. Same deletion as Profile → Delete account
// (api/log-checker-run.js type "admin_delete_user").
import { useState } from "react";
import { adminFetch } from "./adminFetch.js";

async function call(body) {
  const res = await adminFetch("/api/log-checker-run", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "admin_delete_user", ...body }),
  });
  let data = {}; try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const fmt = (d) => { if (!d) return "—"; const t = new Date(d); return isNaN(t) ? "—" : t.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };

export default function DeleteUserTool({ dark = false }) {
  const c = dark
    ? { card: "#16181d", line: "#2a2e36", text: "#e8e8ea", sub: "#9a9ca3", field: "#0f1115", red: "#f87171", redBg: "rgba(248,113,113,.10)", ok: "#4ade80" }
    : { card: "#ffffff", line: "#e6e7ea", text: "#17181c", sub: "#6b6e76", field: "#f7f8fa", red: "#c62828", redBg: "#fdecec", ok: "#138808" };
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(null);

  const reset = () => { setUser(null); setNotFound(false); setTyped(""); setErr(""); };

  async function lookup(e) {
    e?.preventDefault();
    if (!q.trim() || busy) return;
    reset(); setDone(null); setBusy(true);
    try { const r = await call({ query: q.trim() }); if (r.found) setUser(r.user); else setNotFound(true); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  }

  async function remove() {
    if (!user || typed !== "DELETE" || busy) return;
    setBusy(true); setErr("");
    try { const r = await call({ uid: user.uid, confirm: true }); setDone(r.deleted?.email || r.deleted?.phone || user.uid); setUser(null); setQ(""); setTyped(""); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  }

  const box = { background: c.card, border: `1px solid ${c.line}`, borderRadius: 12, padding: 16, margin: "12px 0", color: c.text, fontFamily: "inherit" };
  const input = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${c.line}`, background: c.field, color: c.text, fontSize: 14, outline: "none" };
  const btn = (bg, fg, off) => ({ padding: "10px 14px", borderRadius: 8, border: "none", background: bg, color: fg, fontWeight: 600, fontSize: 13.5, cursor: off ? "not-allowed" : "pointer", opacity: off ? 0.5 : 1, whiteSpace: "nowrap" });
  const row = (k, v) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderTop: `1px solid ${c.line}`, fontSize: 13 }}>
      <span style={{ color: c.sub }}>{k}</span><span style={{ textAlign: "right", wordBreak: "break-all" }}>{v}</span>
    </div>
  );

  return (
    <section style={box} aria-label="Delete a user">
      <div style={{ fontSize: 15, fontWeight: 700 }}>Delete a user</div>
      <div style={{ fontSize: 12.5, color: c.sub, margin: "4px 0 12px", lineHeight: 1.5 }}>
        For e-mailed "Data Deletion Request"s. Check the request came from the account's own e-mail, then delete within 7 working days and reply to confirm.
      </div>

      <form onSubmit={lookup} style={{ display: "flex", gap: 8 }}>
        <input style={input} value={q} onChange={(e) => { setQ(e.target.value); if (user || notFound) reset(); }}
          placeholder="E-mail, phone number or user ID" autoComplete="off" spellCheck={false} />
        <button type="submit" style={btn(dark ? "#2a2e36" : "#17181c", "#fff", busy || !q.trim())} disabled={busy || !q.trim()}>
          {busy && !user ? "Searching…" : "Find"}
        </button>
      </form>

      {notFound && <div style={{ fontSize: 13, color: c.sub, marginTop: 10 }}>No account found. Check the spelling, or try their phone number.</div>}
      {err && <div role="alert" style={{ fontSize: 13, color: c.red, marginTop: 10 }}>{err}</div>}
      {done && <div role="status" style={{ fontSize: 13, color: c.ok, marginTop: 10 }}>Deleted {done}. Reply to their e-mail to confirm.</div>}

      {user && (
        <div style={{ marginTop: 12 }}>
          {row("Name", user.name || "—")}
          {row("E-mail", user.email || "—")}
          {row("Phone", user.phone || "—")}
          {row("Joined · last sign-in", `${fmt(user.created)} · ${fmt(user.lastSignIn)}`)}
          {row("Will be deleted", [
            "sign-in account",
            user.has.profile && "profile",
            user.has.applications ? `${user.has.applications} tracked application${user.has.applications === 1 ? "" : "s"}` : null,
            user.has.notifications && "notification settings",
          ].filter(Boolean).join(", "))}
          {row("Reports kept, anonymised", String(user.has.reports))}

          {user.isAdmin ? (
            <div style={{ fontSize: 13, color: c.red, marginTop: 10 }}>This is an admin account and can't be deleted here.</div>
          ) : (
            <div style={{ background: c.redBg, borderRadius: 8, padding: 12, marginTop: 12 }}>
              <div style={{ fontSize: 12.5, color: c.red, marginBottom: 8, lineHeight: 1.5 }}>This is permanent and can't be undone. Type DELETE to confirm.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={input} value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} placeholder="DELETE" autoComplete="off" />
                <button type="button" onClick={remove} style={btn(c.red, "#fff", busy || typed !== "DELETE")} disabled={busy || typed !== "DELETE"}>
                  {busy ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
