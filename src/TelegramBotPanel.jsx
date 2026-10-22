// TelegramBotPanel.jsx — Yojana Sahay admin · Telegram bot
// The eligibility checker as a Telegram bot (api/_lib/telegramBot.js). This
// panel shows whether it's set up, connects it to Telegram, and shows
// anonymous usage. The bot token lives only in Vercel (TELEGRAM_BOT_TOKEN).
import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "./adminFetch.js";

async function call(op) {
  const res = await adminFetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op }) });
  let d = {}; try { d = await res.json(); } catch {}
  if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
  return d;
}

export default function TelegramBotPanel({ dark = false }) {
  const c = dark
    ? { card: "#16181d", line: "#2a2e36", text: "#e8e8ea", sub: "#9a9ca3", soft: "#1d2027", red: "#f87171", green: "#4ade80", blue: "#60a5fa" }
    : { card: "#ffffff", line: "#e6e7ea", text: "#17181c", sub: "#6b6e76", soft: "#f6f7f9", red: "#c62828", green: "#138808", blue: "#229ED9" };
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  const run = useCallback(async (op = "status") => {
    setBusy(true); setErr("");
    try { setSt(await call(op)); } catch (e) { setErr(e.message); }
    setBusy(false);
  }, []);
  useEffect(() => { if (!collapsed && !st) run("status"); }, [collapsed, st, run]);

  const k = st?.counters || {};
  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const last7 = (f) => { let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(Date.now() + 5.5 * 3600e3 - i * 86400e3).toISOString().slice(0, 10); n += k.days?.[d]?.[f] || 0; } return n; };
  const btn = (col) => ({ padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: busy ? "default" : "pointer", border: `1px solid ${c.line}`, background: c.card, color: col, opacity: busy ? 0.6 : 1 });
  const Stat = ({ label, value }) => (
    <div style={{ flex: "1 1 90px", background: c.soft, borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ fontSize: 11, color: c.sub, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color: c.text }}>{value ?? 0}</div>
    </div>
  );
  const status = !st ? null : !st.configured ? { t: "Not set up", col: c.sub } : st.tokenError ? { t: "Token problem", col: c.red } : st.connected ? { t: "Live", col: c.green } : { t: "Not connected", col: c.red };

  return (
    <section style={{ background: c.card, border: `1px solid ${c.line}`, borderRadius: 14, color: c.text }} aria-label="Telegram bot">
      <button type="button" onClick={() => setCollapsed(x => !x)}
        style={{ all: "unset", boxSizing: "border-box", width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill={c.blue} /><path d="M5.5 11.8 17 7.3c.5-.2 1 .1.8.9l-2 9.3c-.1.6-.6.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.3-.1l-6.9 4.4-3-.9c-.6-.2-.6-.6.3-.9z" fill="#fff" /></svg>
        <span style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Telegram bot</span>
        {status && <span style={{ fontSize: 12, fontWeight: 700, color: status.col }}>{status.t}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.sub} strokeWidth="2.2" strokeLinecap="round" style={{ transform: collapsed ? "none" : "rotate(180deg)", transition: "transform .2s" }} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {!collapsed && (
        <div style={{ padding: "0 16px 14px", fontSize: 13, lineHeight: 1.55 }}>
          <div style={{ color: c.sub, fontSize: 12.5, marginBottom: 10 }}>
            The eligibility checker inside Telegram — same rules as the app, English and Hindi. Answers are kept in the chat buttons — saved only for people who turn on alerts (and deleted when they stop).
          </div>
          {err && <div role="alert" style={{ color: c.red, fontSize: 12.5, marginBottom: 8 }}>{err}</div>}
          {!st && busy && <div style={{ color: c.sub }}>Checking…</div>}

          {st && !st.configured && (
            <ol style={{ margin: "0 0 10px", paddingLeft: 18 }}>
              <li>In Telegram, open <b>@BotFather</b> (blue tick) and send <code>/newbot</code>.</li>
              <li>Name: <b>Yojana Sahay</b>. Username: something like <b>YojanaSahayBot</b> (must end in “bot”).</li>
              <li>BotFather replies with a token. Don't share it with anyone.</li>
              <li>Vercel → project → Settings → Environment Variables → add <code>TELEGRAM_BOT_TOKEN</code> = that token (Production), then redeploy.</li>
              <li>Come back here and press <b>Connect</b>.</li>
            </ol>
          )}
          {st?.tokenError && <div style={{ color: c.red, fontSize: 12.5, marginBottom: 8 }}>Telegram rejected the token: {st.tokenError}. Check TELEGRAM_BOT_TOKEN in Vercel.</div>}

          {st?.bot && (
            <div style={{ marginBottom: 10 }}>
              Bot: <a href={`https://t.me/${st.bot.username}`} target="_blank" rel="noopener noreferrer" style={{ color: c.blue, fontWeight: 700 }}>@{st.bot.username}</a>
              {st.connected ? <span style={{ color: c.green, fontWeight: 700 }}> · receiving messages</span> : <span style={{ color: c.red, fontWeight: 700 }}> · not connected — press Connect</span>}
              {st.webhook?.lastError && <div style={{ fontSize: 12, color: c.red, marginTop: 4 }}>Last error from Telegram: {st.webhook.lastError}{st.webhook.lastErrorAt ? ` (${new Date(st.webhook.lastErrorAt).toLocaleString("en-IN")})` : ""}</div>}
            </div>
          )}

          {st && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <Stat label="Started · today" value={k.days?.[today]?.started} />
              <Stat label="Started · 7 days" value={last7("started")} />
              <Stat label="Finished · 7 days" value={last7("finished")} />
              <Stat label="Finished · all time" value={k.finished} />
              <Stat label="Alerts turned on" value={st.alertSubscribers} />
              <Stat label="Money checks" value={k.moneyChecks} />
              <Stat label="Searches" value={k.searched} />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {st?.configured && !st.tokenError && <button type="button" disabled={busy} style={btn(c.green)} onClick={() => run("connect")}>{st.connected ? "Reconnect" : "Connect"}</button>}
            {st?.connected && <button type="button" disabled={busy} style={btn(c.red)} onClick={() => { if (window.confirm("Stop the bot from answering messages?")) run("disconnect"); }}>Disconnect</button>}
            <button type="button" disabled={busy} style={btn(c.sub)} onClick={() => run("status")}>{busy ? "…" : "Refresh"}</button>
          </div>
        </div>
      )}
    </section>
  );
}
