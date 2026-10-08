// api/_lib/weeklyReport.js — Yojana Sahay · Monday summary e-mail
// ─────────────────────────────────────────────────────────────────────────────
// Every Monday (Vercel Cron → /api/agent-auto-fix?action=weekly) the owner gets
// one short e-mail about the last 7 days: schemes added, links fixed, link
// checks, news, anything waiting for approval, and agent health.
// Reads only what the agents already log — no AI calls, no searches.
// Recipient: WEEKLY_REPORT_TO (comma-separated) or, if unset, GMAIL_USER.
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";

const DAY = 86_400_000;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function safe(fn, fallback) { try { return await fn(); } catch { return fallback; } }

export async function collectWeeklyStats(db, now = Date.now()) {
  const since = new Date(now - 7 * DAY);

  const runs = await safe(async () =>
    (await db.collection("agentRuns").where("createdAt", ">=", since).get()).docs.map(d => d.data()), []);
  const discovery = runs.filter(r => r.agent === "scheme-discovery");
  const autoFix   = runs.filter(r => r.agent === "agent-auto-fix");

  const added = discovery.flatMap(r => r.published ?? []).map(p => ({ name: p.name ?? p.id, state: p.state ?? p.region ?? "" }));
  const repaired  = autoFix.flatMap(r => r.repair?.fixed ?? []);
  const recovered = autoFix.flatMap(r => r.repair?.recovered ?? []);
  const lastFix   = autoFix.sort((a, b) => String(b.finishedAt ?? "").localeCompare(String(a.finishedAt ?? "")))[0];
  const needsReview = lastFix?.needsReviewCount ?? lastFix?.needsReview?.length ?? 0;

  const pendingDrafts = await safe(async () =>
    (await db.collection("schemeDrafts").where("status", "==", "pending").get()).size, 0);

  const verify = await safe(async () =>
    (await db.collection("schemeVerifyRuns").where("runAt", ">=", since).get()).docs.map(d => d.data()), []);
  const verifyChecked = verify.reduce((n, r) => n + (Number(r.checked) || 0), 0);

  const news = await safe(async () =>
    (await db.collection("schemeNews").where("createdAt", ">=", since).get()).size, 0);

  const health = await safe(async () => (await db.collection("appMeta").doc("agentHealth").get()).data() ?? null, null);
  const problems = (health?.items ?? []).filter(i => i.status === "fail" || i.status === "warn")
    .map(i => ({ name: i.name, detail: i.detail, status: i.status }));

  return {
    from: since.toISOString(), to: new Date(now).toISOString(),
    added, discoveryRuns: discovery.length, pendingDrafts,
    repaired: repaired.length, recovered: recovered.length, needsReview, autoFixRuns: autoFix.length,
    verifyRuns: verify.length, verifyChecked,
    news, healthOverall: health?.overall ?? null, healthCheckedAt: health?.checkedAt ?? null, problems,
  };
}

export function renderWeeklyEmail(st, appUrl = "https://yojanasahay.vercel.app") {
  const fmt = iso => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const healthy = st.problems.filter(p => p.status === "fail").length === 0;
  const headline = healthy ? "✅ Everything ran fine this week" : "⚠️ Something needs your attention";

  const row = (label, value, note = "") =>
    `<tr><td style="padding:8px 0;color:#57534e;font-size:14px">${label}</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:15px;color:#1c1917">${value}</td></tr>${note ? `<tr><td colspan="2" style="padding:0 0 8px;color:#a8a29e;font-size:12px">${note}</td></tr>` : ""}`;

  const addedList = st.added.length
    ? `<ul style="margin:6px 0 0;padding-left:18px;color:#44403c;font-size:13.5px;line-height:1.6">${st.added.slice(0, 15).map(a => `<li>${esc(a.name)}${a.state ? ` <span style="color:#a8a29e">· ${esc(a.state)}</span>` : ""}</li>`).join("")}</ul>`
    : "";
  const problemList = st.problems.length
    ? `<div style="margin-top:18px;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px"><div style="font-weight:800;font-size:14px;margin-bottom:6px">Needs a look</div><ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#44403c">${st.problems.slice(0, 8).map(p => `<li><b>${esc(p.name)}</b> — ${esc(p.detail)}</li>`).join("")}</ul></div>`
    : "";

  const subject = `Yojana Sahay weekly: ${st.added.length} new scheme${st.added.length === 1 ? "" : "s"}, ${st.repaired} link${st.repaired === 1 ? "" : "s"} fixed${healthy ? "" : " · needs attention"}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">
    <div style="height:4px;background:linear-gradient(90deg,#FF9933,#ffffff,#138808)"></div>
    <div style="padding:22px 22px 8px">
      <div style="font-size:12px;color:#a8a29e;font-weight:700;letter-spacing:.4px">WEEKLY SUMMARY · ${fmt(st.from)} – ${fmt(st.to)}</div>
      <div style="font-size:20px;font-weight:800;color:#1c1917;margin-top:6px">${headline}</div>
    </div>
    <div style="padding:6px 22px 22px">
      <table style="width:100%;border-collapse:collapse">
        ${row("New schemes added", st.added.length, st.discoveryRuns ? `${st.discoveryRuns} discovery run${st.discoveryRuns === 1 ? "" : "s"}` : "Discovery didn't run this week")}
        <tr><td colspan="2">${addedList}</td></tr>
        ${row("Waiting for your approval", st.pendingDrafts, st.pendingDrafts ? "Admin → Agents → Scheme Discovery" : "")}
        ${row("Broken links replaced", st.repaired)}
        ${row("Links back online", st.recovered)}
        ${row("Links needing your review", st.needsReview, st.needsReview ? "Listed in the GitHub issue \"links need review\"" : "")}
        ${row("Schemes checked for deadlines", st.verifyChecked, `${st.verifyRuns} nightly run${st.verifyRuns === 1 ? "" : "s"}`)}
        ${row("News items added", st.news)}
      </table>
      ${problemList}
      <a href="${appUrl}/admin" style="display:block;text-align:center;margin-top:20px;background:#FF9933;color:#fff;text-decoration:none;font-weight:700;padding:12px;border-radius:10px">Open the dashboard</a>
    </div>
  </div>
  <div style="text-align:center;color:#a8a29e;font-size:11.5px;margin-top:12px">Sent automatically every Monday by Yojana Sahay's agents.</div>
</div></body></html>`;
  const text = [
    headline, `${fmt(st.from)} – ${fmt(st.to)}`, "",
    `New schemes added: ${st.added.length}${st.added.length ? " — " + st.added.map(a => a.name).join(", ") : ""}`,
    `Waiting for approval: ${st.pendingDrafts}`,
    `Broken links replaced: ${st.repaired} · back online: ${st.recovered} · need review: ${st.needsReview}`,
    `Schemes checked for deadlines: ${st.verifyChecked} (${st.verifyRuns} runs)`,
    `News items added: ${st.news}`,
    ...(st.problems.length ? ["", "Needs a look:", ...st.problems.map(p => `- ${p.name}: ${p.detail}`)] : []),
    "", `${appUrl}/admin`,
  ].join("\n");
  return { subject, html, text };
}

export async function sendWeeklyReport(db) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD not configured");
  const to = (process.env.WEEKLY_REPORT_TO?.trim() || user);
  const stats = await collectWeeklyStats(db);
  const { subject, html, text } = renderWeeklyEmail(stats);
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({ from: `"Yojana Sahay" <${user}>`, to, subject, html, text });
  await db.collection("appMeta").doc("weeklyReport").set({ lastSentAt: new Date(), to, subject }, { merge: true }).catch(() => {});
  return { sent: true, to: to.replace(/(.).+(@.+)/, "$1…$2"), subject, stats };
}
