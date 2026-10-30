// src/adminReport.js — Admin · Export tab · official PDF report
// ─────────────────────────────────────────────────────────────────────────────
// Builds the printable "Administrative Report" as one HTML document and opens
// it in a new tab, where the browser's Print → Save as PDF turns it into the
// file. Pure functions only: everything it needs (users, reports, usage
// counters, labels, helpers) is passed in, so it can be rendered and checked
// outside the dashboard too.
//
// Layout: cover page → document control, contents and data-protection notice
// → executive summary → numbered sections → annexures (definitions,
// certification). Running header/footer with "Page X of Y" via @page margin
// boxes. Every value that came from a user is HTML-escaped before it goes in.
// ─────────────────────────────────────────────────────────────────────────────

// ── small helpers ────────────────────────────────────────────────────────────
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ESC[c]);
const RAW = "__rawHtml";
const raw = html => ({ [RAW]: html });
const cellHtml = v => (v && typeof v === "object" && RAW in v) ? v[RAW]
  : (v === null || v === undefined || v === "") ? "—" : esc(v);
export const clean = s => String(s ?? "")
  .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
  .replace(/\s{2,}/g, " ").trim();
const toMs = ts => {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  if (ts.seconds) return ts.seconds * 1000;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  const ms = new Date(ts).getTime();
  return isNaN(ms) ? null : ms;
};
const TZ = "Asia/Kolkata";
const fDate = ts => { const ms = toMs(ts); return ms == null ? "—" : new Date(ms).toLocaleDateString("en-IN", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" }); };
const fDateTime = ts => {
  const ms = toMs(ts); if (ms == null) return "—";
  const d = new Date(ms);
  return `${d.toLocaleDateString("en-IN", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: true })}`;
};
const istDay = ms => new Date(ms + 5.5 * 3600e3).toISOString().slice(0, 10);
const num = v => (v === null || v === undefined || v === "—") ? "—" : Number(v || 0).toLocaleString("en-IN");
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const pctS = (a, b) => (b > 0 ? `${pct(a, b)}%` : "—");
const plural = (n, one, many = one + "s") => `${num(n)} ${n === 1 ? one : many}`;
const DAY = 86400000;
const dur = ms => {
  if (ms == null || !isFinite(ms) || ms < 0) return "—";
  const h = ms / 3600e3;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (h < 48) return `${h.toFixed(h < 10 ? 1 : 0)} hrs`;
  return `${(h / 24).toFixed(1)} days`;
};
const median = arr => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const groupCount = (arr, key, fallback = "Not stated") => arr.reduce((acc, it) => {
  const k = it?.[key] || fallback; acc[k] = (acc[k] || 0) + 1; return acc;
}, {});

const maskPhone = p => {
  const d = String(p || "").replace(/\D/g, "").slice(-10);
  return d.length < 6 ? "XXXXXXXXXX" : `+91 ${d.slice(0, 2)}XXXXX${d.slice(-3)}`;
};
const maskEmail = e => {
  const [u = "", dom] = String(e || "").split("@");
  if (!dom) return "XXXX";
  return `${u.slice(0, 2)}${"X".repeat(Math.max(3, Math.min(6, u.length - 2)))}@${dom}`;
};
const fullPhone = p => {
  const d = String(p || "").replace(/\D/g, "");
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : String(p);
};

// Plain labels used only by this report (the dashboard's own copies carry emoji).
const LIFE_LABEL = {
  baby: "Pregnancy & new baby", girl_edu: "Daughter's education", farming: "Farming", job: "Lost job / need work",
  senior: "Parent turned 60", marriage: "Getting married", house: "Building a house", loss: "Death of earning member",
  disability: "Disability", college: "Going to college",
};
const MONEY_LABEL = {
  status: "Not approved yet / check status", renew: "Life certificate / renewal missing", seed: "Aadhaar not linked to bank",
  otherAccount: "Went to another bank account", inactive: "Account inactive / KYC", name: "Name mismatch", ekyc: "e-KYC pending",
  early: "Too early — just wait", escalate: "Ask the department / complaint", open: "Opened the check",
};
const STEP_LABEL = {
  who: "Who are you", income: "Income", landHolding: "Farm land", educationLevel: "Class / course",
  rationCard: "Ration card", state: "State", house: "House", caste: "Category", age: "Age", area: "Area",
  gender: "Gender", disability: "Disability", groups: "Special groups",
};
const STEP_ORDER = ["who", "income", "landHolding", "educationLevel", "rationCard", "state", "house", "caste", "age", "area", "gender", "disability", "groups"];
const ADAPTIVE_STEPS = ["landHolding", "educationLevel", "rationCard"];

export const REPORT_MODULES = [
  { id: "overview",  title: "Platform Overview",            desc: "Registered users, contact coverage, report status and welfare snapshot" },
  { id: "analytics", title: "Demographics & Analytics",     desc: "Occupation, income, age, area, gender, category, farmer and student profiles, cross-tabulations, state distribution" },
  { id: "users",     title: "User Registry",                desc: "Every registered user — identity and contact (Part A), socio-economic profile (Part B)" },
  { id: "activity",  title: "Activity & Engagement",        desc: "Active and dormant users, occupation engagement, recent and new users" },
  { id: "usage",     title: "Platform Usage",               desc: "Eligibility Checker runs, scheme searches, searches with no result, guest sessions" },
  { id: "impact",    title: "Citizen Actions & Outcomes",   desc: "Scheme views, Apply taps, applications tracked, approvals, quiz completion, most-used schemes" },
  { id: "schemes",   title: "Schemes Coverage",             desc: "Open schemes by level and state, coverage tiers, state-wise cross-reference with users" },
  { id: "reports",   title: "Reports & Grievances",         desc: "Reports by type and status, response times, ageing of open items, full register with replies" },
  { id: "agents",    title: "Human Agents & Attendance",    desc: "Agent roster and access, today's attendance, month-to-date attendance summary" },
];

// ── document building blocks ─────────────────────────────────────────────────
function makeDoc() {
  let sec = "", tblN = 0, figN = 0;
  const api = {
    start(id) { sec = id; tblN = 0; figN = 0; },
    h2: (n, title) => `<h2 class="h2"><span class="hn">${n}.</span>${esc(title)}</h2>`,
    h3: (n, title) => `<h3 class="h3"><span class="hn">${n}</span>${esc(title)}</h3>`,
    p: html => `<p class="para">${html}</p>`,
    note: html => `<p class="note">${html}</p>`,
    // numeric: array of column indexes to right-align (tabular figures)
    table(caption, headers, rows, o = {}) {
      tblN++;
      const right = new Set(o.numeric || []);
      const cls = o.cls ? ` ${o.cls}` : "";
      const body = rows.length === 0
        ? `<tr><td colspan="${headers.length}" class="empty">${esc(o.empty || "No records for this period.")}</td></tr>`
        : rows.map(r => `<tr${r.__cls ? ` class="${r.__cls}"` : ""}>${r.map((v, i) => `<td${right.has(i) ? ' class="r"' : ""}>${cellHtml(v)}</td>`).join("")}</tr>`).join("");
      const foot = o.total ? `<tfoot><tr>${o.total.map((v, i) => `<td${right.has(i) ? ' class="r"' : ""}>${cellHtml(v)}</td>`).join("")}</tr></tfoot>` : "";
      return `<figure class="tblwrap${cls}">
        <figcaption><span class="tno">Table ${sec}.${tblN}</span>${esc(caption)}</figcaption>
        <table>
          ${o.widths ? `<colgroup>${o.widths.map(w => `<col${w ? ` style="width:${w}"` : ""}>`).join("")}</colgroup>` : ""}
          <thead><tr>${headers.map((h, i) => `<th${right.has(i) ? ' class="r"' : ""}>${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${body}</tbody>${foot}
        </table>
        ${o.note ? `<div class="tnote">${o.note}</div>` : ""}
      </figure>`;
    },
    // Category | Count | Share | bar — sorted, "Not stated" last, with total row
    breakdown(caption, entries, o = {}) {
      const list = entries.filter(([, v]) => v > 0);
      const tail = list.filter(([k]) => /^(not stated|unknown)$/i.test(String(k)));
      const head = list.filter(([k]) => !/^(not stated|unknown)$/i.test(String(k))).sort((a, b) => b[1] - a[1]);
      const sorted = o.keepOrder ? list : [...head, ...tail];
      const total = sorted.reduce((s, [, v]) => s + v, 0);
      const max = Math.max(1, ...sorted.map(([, v]) => v));
      const rows = sorted.map(([k, v]) => [clean(k), num(v), pctS(v, total),
        raw(`<span class="bar"><i style="width:${Math.max(2, Math.round((v / max) * 100))}%"></i></span>`)]);
      return api.table(caption, [o.head || "Category", "Count", "Share", ""], rows, {
        numeric: [1, 2], widths: ["", "16%", "14%", "30%"], cls: "half",
        total: rows.length ? ["Total", num(total), total ? "100%" : "—", ""] : null,
        empty: o.empty || "No responses recorded.", note: o.note,
      });
    },
    kpis: items => `<div class="kpis">${items.map(k => `<div class="kpi">
        <div class="kv">${esc(k.value)}</div><div class="kl">${esc(k.label)}</div>${k.sub ? `<div class="ks">${esc(k.sub)}</div>` : ""}
      </div>`).join("")}</div>`,
    facts: rows => `<table class="facts"><tbody>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${cellHtml(v)}</td></tr>`).join("")}</tbody></table>`,
    // grouped column chart, CSS only
    chart(caption, labels, series) {
      figN++;
      const max = Math.max(1, ...series.flatMap(s => s.values));
      return `<figure class="chart">
        <figcaption><span class="tno">Figure ${sec}.${figN}</span>${esc(caption)}</figcaption>
        <div class="cols">${labels.map((l, i) => `<div class="col">
          <div class="cv">${series.map(s => num(s.values[i])).join(" / ")}</div>
          <div class="cb">${series.map((s, j) => `<i class="s${j}" style="height:${s.values[i] ? Math.max(2, Math.round((s.values[i] / max) * 100)) : 0}%"></i>`).join("")}</div></div>`).join("")}</div>
        <div class="xl">${labels.map(l => `<span>${esc(l)}</span>`).join("")}</div>
        ${series.length > 1 ? `<div class="legend">${series.map((s, j) => `<span><i class="s${j}"></i>${esc(s.name)}</span>`).join("")}</div>` : ""}
      </figure>`;
    },
  };
  return api;
}

// ── main builder ─────────────────────────────────────────────────────────────
export function buildAdminReportHtml(input) {
  const {
    users = [], reports = [], guestProfiles = [], usage = null, events = null,
    humanAgents = [], aiAgents = [], agentsData = null,
    schemes = [], states = [], audiences = [],
    labels: L = {}, helpers: H = {},
    sections: sectionsIn, theme = "light", orientation = "landscape", pageSize = "A4",
    preparedBy = "", dateRangeLabel = "All Time", rangeStart = null, rangeEnd = null,
    filters = {}, maskPII = false, logoUri = "", generatedAt = Date.now(), refSuffix,
  } = input;

  const S = sectionsIn instanceof Set && sectionsIn.size ? sectionsIn : new Set(REPORT_MODULES.map(m => m.id));
  const now = generatedAt;
  const D = makeDoc();
  const lab = (map, k) => clean((map && map[k]) || k || "—");
  const phone = p => (!p ? "—" : maskPII ? maskPhone(p) : fullPhone(p));
  const email = e => (!e ? "—" : maskPII ? maskEmail(e) : e);
  const isActive = (u, days) => { const ms = toMs(u.lastSeen); return ms != null && now - ms < days * DAY; };
  const isNew = (u, days) => { const ms = toMs(u.createdAt); return ms != null && now - ms < days * DAY; };

  const d0 = new Date(now);
  const dateStr = d0.toLocaleDateString("en-IN", { timeZone: TZ, day: "numeric", month: "long", year: "numeric" });
  const timeStr = d0.toLocaleTimeString("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: true });
  const ymd = istDay(now).replace(/-/g, "");
  const ref = `YS/ADM/${ymd.slice(0, 4)}/${ymd.slice(4)}-${refSuffix || Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const fileBase = `YojanaSahay_Administrative_Report_${istDay(now)}_${ref.slice(-4)}`;

  // ── shared figures (used by summary + sections) ────────────────────────────
  const R = users.length;
  const active1 = users.filter(u => isActive(u, 1)).length;
  const active7 = users.filter(u => isActive(u, 7)).length;
  const active30 = users.filter(u => isActive(u, 30)).length;
  const new1 = users.filter(u => isNew(u, 1)).length;
  const new7 = users.filter(u => isNew(u, 7)).length;
  const new30 = users.filter(u => isNew(u, 30)).length;
  const dormant = users.filter(u => { const ms = toMs(u.lastSeen); return ms != null && now - ms > 30 * DAY; });
  const neverSeen = users.filter(u => toMs(u.lastSeen) == null).length;
  const withPhone = users.filter(u => u.phone && String(u.phone).trim()).length;
  const withEmail = users.filter(u => u.email && String(u.email).trim()).length;
  const withBoth = users.filter(u => u.phone && u.email).length;
  const withNeither = users.filter(u => !u.phone && !u.email).length;
  const googleUsers = users.filter(u => u.photo).length;
  const incomplete = users.filter(u => !u.occupation || !u.state || !u.income).length;
  const byStateReg = groupCount(users.filter(u => u.state), "state");
  const stateCountReg = Object.keys(byStateReg).length;
  const topState = Object.entries(byStateReg).sort((a, b) => b[1] - a[1])[0];
  const byOccReg = groupCount(users.filter(u => u.occupation), "occupation");
  const topOcc = Object.entries(byOccReg).sort((a, b) => b[1] - a[1])[0];

  // reports
  const repOf = st => reports.filter(r => (r.status || "open") === st);
  const openRep = repOf("open"), progRep = repOf("in_progress"), resRep = repOf("resolved");
  const hasReply = r => !!(r.adminReply || (Array.isArray(r.replyHistory) && r.replyHistory.some(h => !h.isReopen)));
  const unrepliedOpen = openRep.filter(r => !hasReply(r));
  const reopened = reports.filter(r => Array.isArray(r.replyHistory) && r.replyHistory.some(h => h.isReopen) && r.status !== "resolved").length;
  const firstReplyMs = r => {
    const c = toMs(r.createdAt); if (c == null) return null;
    const first = (r.replyHistory || []).filter(h => !h.isReopen).map(h => toMs(h.sentAt)).filter(v => v != null).sort((a, b) => a - b)[0];
    const at = first ?? toMs(r.repliedAt);
    return at != null && at >= c ? at - c : null;
  };
  const respTimes = reports.map(firstReplyMs).filter(v => v != null);
  const avgResp = respTimes.length ? respTimes.reduce((s, v) => s + v, 0) / respTimes.length : null;
  const medResp = median(respTimes);
  const pendingRep = reports.filter(r => r.status !== "resolved");
  const ageOf = r => { const c = toMs(r.createdAt); return c == null ? null : now - c; };
  const olderThan7 = pendingRep.filter(r => (ageOf(r) ?? 0) > 7 * DAY);
  const flagsOpen = pendingRep.filter(r => r.source === "scheme_flag");
  const flagPeople = flagsOpen.reduce((s, r) => s + (r.flagCount || 1), 0);

  // schemes — "open" = not closed and not a duplicate record (same as the app)
  const live = schemes.filter(s => s && !s.duplicateOf && !s.closed);
  const closedCnt = schemes.filter(s => s && s.closed).length;
  const dupCnt = schemes.filter(s => s && s.duplicateOf && !s.closed).length;
  const centralCnt = live.filter(s => s.scope === "national").length;
  const stSch = {};
  live.forEach(s => { if (s.scope === "state" && s.state) stSch[s.state] = (stSch[s.state] || 0) + 1; });
  const stateList = states.length ? states : Object.keys(stSch);
  const stateLevelCnt = live.filter(s => s.scope === "state").length;
  const zeroStates = stateList.filter(s => !stSch[s]);
  const tierOf = n => (n === 0 ? "None" : n <= 30 ? "Low" : n <= 100 ? "Medium" : "Good");

  // usage log
  const runs = Array.isArray(usage?.checkerRuns) ? usage.checkerRuns : [];
  const searches = Array.isArray(usage?.schemeSearches) ? usage.schemeSearches : [];
  const stateSel = Array.isArray(usage?.stateSelections) ? usage.stateSelections : [];
  const totalRuns = usage?.checkerTotal || runs.length;
  const totalSearches = usage?.searchTotal || searches.length;
  const avgMatched = runs.length ? runs.reduce((s, r) => s + (r.matchedCount || 0), 0) / runs.length : null;
  const zeroSearch = {};
  searches.forEach(r => { if (r?.n === 0 && r.q) { const k = String(r.q).toLowerCase().trim(); zeroSearch[k] = (zeroSearch[k] || 0) + 1; } });
  const zeroList = Object.entries(zeroSearch).sort((a, b) => b[1] - a[1]);

  // anonymous action counters (appStats/events)
  const evDays = events?.days || {};
  const fromDay = rangeStart ? istDay(rangeStart) : "0000-00-00";
  const toDay = rangeEnd ? istDay(rangeEnd) : "9999-99-99";
  const ev = {};
  Object.entries(evDays).forEach(([d, c]) => { if (d >= fromDay && d <= toDay) Object.entries(c || {}).forEach(([k, v]) => { ev[k] = (ev[k] || 0) + (v || 0); }); });
  const hasEvents = Object.keys(evDays).length > 0;
  const evApproved = (ev.app_approved || 0) + (ev.app_received || 0);

  // ── MODULE BUILDERS ────────────────────────────────────────────────────────
  const built = [];   // { id, n, title, html, count }
  let secNo = 0;
  const add = (id, title, count, fn) => {
    if (!S.has(id)) return;
    secNo++; D.start(secNo);
    built.push({ id, n: secNo, title, count, html: `<section class="sec" id="sec-${id}">${D.h2(secNo, title)}${fn(secNo)}</section>` });
  };

  // 1 — Overview
  add("overview", "Platform Overview", `${num(R)} users`, n => `
    ${D.p(`This section summarises the registered user base, contact coverage and the status of reports for the reporting period (${esc(dateRangeLabel)}).`)}
    ${D.kpis([
      { label: "Registered users", value: num(R), sub: `${num(new30)} joined in the last 30 days` },
      { label: "Active in last 7 days", value: num(active7), sub: `${pctS(active7, R)} of registered` },
      { label: "States / UTs represented", value: num(stateCountReg) },
      { label: "Reports received", value: num(reports.length), sub: `${num(openRep.length)} open` },
    ])}
    <div class="grid3">
      ${D.table("User base", ["Measure", "Count"], [
        ["Total registered users", num(R)], ["Active today (24 hrs)", num(active1)], ["Active in last 7 days", num(active7)],
        ["Active in last 30 days", num(active30)], ["Joined today", num(new1)], ["Joined in last 7 days", num(new7)], ["Joined in last 30 days", num(new30)],
      ], { numeric: [1] })}
      ${D.table("Contact & account coverage", ["Measure", "Count"], [
        ["Phone number only", num(withPhone - withBoth)], ["Email only", num(withEmail - withBoth)], ["Both phone and email", num(withBoth)],
        ["No contact details", num(withNeither)], ["Google sign-in", num(googleUsers)], ["Other sign-in", num(R - googleUsers)],
        ["Profiles incomplete *", num(incomplete)],
      ], { numeric: [1], note: "* Occupation, state or income missing — such users cannot be matched to schemes." })}
      ${D.table("Reports status", ["Measure", "Count"], [
        ["Total reports", num(reports.length)], ["Open", num(openRep.length)], ["In progress", num(progRep.length)], ["Resolved", num(resRep.length)],
        ["Reopened (not yet resolved)", num(reopened)], ["Replied by admin", num(reports.filter(hasReply).length)], ["Open without any reply", num(unrepliedOpen.length)],
      ], { numeric: [1] })}
    </div>
    ${D.h3(`${n}.1`, "Welfare snapshot")}
    ${D.table("Welfare-relevant user groups", ["Group", "Users", "Share of registered"], [
      ["BPL / AAY ration card holders", num(users.filter(u => u.ration === "bpl" || u.ration === "aay").length), pctS(users.filter(u => u.ration === "bpl" || u.ration === "aay").length, R)],
      ["Persons with disability", num(users.filter(u => u.disability && u.disability !== "none").length), pctS(users.filter(u => u.disability && u.disability !== "none").length, R)],
      ["Need housing (no house / kutcha)", num(users.filter(u => u.house === "no" || u.house === "kutcha").length), pctS(users.filter(u => u.house === "no" || u.house === "kutcha").length, R)],
      ["Farmers", num(users.filter(u => u.occupation === "farmer").length), pctS(users.filter(u => u.occupation === "farmer").length, R)],
      ["Students", num(users.filter(u => u.occupation === "student").length), pctS(users.filter(u => u.occupation === "student").length, R)],
      ["Senior citizens (occupation)", num(users.filter(u => u.occupation === "senior").length), pctS(users.filter(u => u.occupation === "senior").length, R)],
      ["Families with a girl child", num(users.filter(u => u.hasGirls === "yes").length), pctS(users.filter(u => u.hasGirls === "yes").length, R)],
    ], { numeric: [1, 2], widths: ["", "18%", "24%"], cls: "half" })}`);

  // 2 — Demographics & analytics
  const withGuests = [...users, ...guestProfiles];
  add("analytics", "Demographics & Analytics", `${num(withGuests.length)} profiles`, n => {
    const g = (arr, key, map) => Object.entries(groupCount(arr, key)).map(([k, v]) => [k === "Not stated" ? k : lab(map, k), v]);
    const farmers = users.filter(u => u.occupation === "farmer");
    const students = users.filter(u => u.occupation === "student");
    const grp = {};
    users.forEach(u => (Array.isArray(u.groups) ? u.groups : []).forEach(k => { grp[k] = (grp[k] || 0) + 1; }));
    const grpEntries = Object.entries(grp).map(([k, v]) => [audiences.find(a => a.key === k)?.en || k, v]);
    const cross = (caption, rowKey, colKey, rows, cols) => {
      const m = {}; rows.forEach(([r]) => { m[r] = {}; cols.forEach(([c]) => { m[r][c] = 0; }); });
      withGuests.forEach(u => { if (m[u[rowKey]] && m[u[rowKey]][u[colKey]] !== undefined) m[u[rowKey]][u[colKey]]++; });
      const colTot = cols.map(([c]) => rows.reduce((s, [r]) => s + m[r][c], 0));
      return D.table(caption, ["", ...cols.map(([, l]) => l), "Total"],
        rows.map(([r, l]) => { const t = cols.reduce((s, [c]) => s + m[r][c], 0); return [l, ...cols.map(([c]) => m[r][c] ? `${num(m[r][c])} (${pct(m[r][c], t)}%)` : "·"), num(t)]; }),
        { numeric: cols.map((_, i) => i + 1).concat(cols.length + 1), total: ["Total", ...colTot.map(num), num(colTot.reduce((a, b) => a + b, 0))], note: "Figures in brackets are the share of the row total." });
    };
    return `
      ${D.p(`Breakdowns cover ${plural(R, "registered user")}${guestProfiles.length ? ` and ${plural(guestProfiles.length, "guest")} who used the Eligibility Checker without signing in (their latest answers only)` : ""}. Marital status, disability, housing, children, land, Kisan Credit Card, education and institution are asked only during profile setup, so those tables cover registered users only.`)}
      ${D.h3(`${n}.1`, "Core demographics")}
      <div class="grid2">
        ${D.breakdown("Occupation", g(withGuests, "occupation", L.OCC))}
        ${D.breakdown("Annual household income", g(withGuests, "income", L.INC))}
        ${D.breakdown("Age group", g(withGuests, "age", L.AGE))}
        ${D.breakdown("Area type", g(withGuests, "area", L.AREA))}
        ${D.breakdown("Gender", g(withGuests, "gender", L.GENDER))}
        ${D.breakdown("Ration card", g(withGuests, "ration", L.RATION))}
        ${D.breakdown("Social category", g(withGuests.filter(u => u.caste), "caste", L.CASTE), { empty: "Category not yet recorded." })}
        ${D.breakdown("Marital status (registered users)", g(users, "marital", L.MARITAL))}
        ${D.breakdown("Disability (registered users)", g(users.map(u => ({ ...u, disability: u.disability || "none" })), "disability", L.DISAB))}
        ${D.breakdown("Housing (registered users)", g(users, "house", L.HOUSE))}
        ${D.breakdown("Number of children (registered users)", g(users, "numChildren", L.CHILDREN))}
        ${D.breakdown("Special groups ticked (registered users)", grpEntries, { head: "Group", empty: "No special groups ticked.", note: "A user may tick more than one group." })}
      </div>
      ${D.h3(`${n}.2`, "Farmer and student profiles")}
      ${D.note(`${plural(farmers.length, "registered farmer")} · ${plural(students.length, "registered student")}`)}
      <div class="grid2">
        ${D.breakdown("Land holding (farmers)", g(farmers, "landHolding", L.LAND))}
        ${D.breakdown("Kisan Credit Card (farmers)", g(farmers, "kisanCard", L.KISAN))}
        ${D.breakdown("Education level (students)", g(students, "educationLevel", L.EDUC))}
        ${D.breakdown("Institution type (students)", g(students, "institutionType", L.INST))}
      </div>
      ${D.h3(`${n}.3`, "Cross-tabulations")}
      <div class="grid2">
        ${cross("Income against ration card", "income", "ration",
          [["below1", "Below ₹1 lakh"], ["1to3", "₹1–3 lakh"], ["3to6", "₹3–6 lakh"], ["above6", "Above ₹6 lakh"]],
          [["none", "None"], ["apl", "APL"], ["bpl", "BPL"], ["aay", "AAY"]])}
        ${cross("Occupation against area type", "occupation", "area",
          [["farmer", "Farmer"], ["student", "Student"], ["women", "Homemaker"], ["senior", "Senior citizen"], ["business", "Business owner"], ["general", "General"]],
          [["rural", "Rural"], ["urban", "Urban"], ["semi", "Semi-urban"]])}
      </div>
      ${D.h3(`${n}.4`, "State-wise distribution")}
      ${(() => {
        const byState = groupCount(withGuests.filter(u => u.state), "state");
        const tot = Object.values(byState).reduce((a, b) => a + b, 0);
        const rows = Object.entries(byState).sort((a, b) => b[1] - a[1]).map(([st, c], i) => [
          i + 1, st, num(byStateReg[st] || 0), num(c - (byStateReg[st] || 0)), num(c), pctS(c, tot),
          num(users.filter(u => u.state === st && isActive(u, 7)).length),
        ]);
        return D.table("Users by state / UT", ["#", "State / UT", "Registered", "Guests", "Total", "Share", "Active (7 days)"], rows,
          { numeric: [0, 2, 3, 4, 5, 6], widths: ["5%", "", "12%", "10%", "10%", "10%", "14%"], total: ["", "Total", num(Object.values(byStateReg).reduce((a, b) => a + b, 0)), num(tot - Object.values(byStateReg).reduce((a, b) => a + b, 0)), num(tot), tot ? "100%" : "—", num(users.filter(u => u.state && isActive(u, 7)).length)] });
      })()}`;
  });

  // 3 — User registry
  add("users", "User Registry", `${num(R)} records`, n => {
    const sorted = [...users].sort((a, b) => (toMs(a.createdAt) || 0) - (toMs(b.createdAt) || 0));
    const yn = v => (v === "yes" ? "Yes" : v === "no" ? "No" : "—");
    const groupsOf = u => (Array.isArray(u.groups) && u.groups.length ? u.groups.map(k => audiences.find(a => a.key === k)?.en || k).join(", ") : "—");
    return `
      ${D.p(`All ${plural(R, "registered user")} in the reporting period, in order of registration.${maskPII ? " Contact details are masked in this copy." : ""} N/A means the question does not apply to that user.`)}
      ${D.h3(`${n}.1`, "Part A — Identity and contact")}
      ${D.table("Registered users — identity and contact", ["#", "Name", "User ID", "Phone", "Email", "Sign-in", "Gender", "Age", "State / UT", "Area", "Joined", "Last seen"],
        sorted.map((u, i) => [i + 1, u.name || "—", u.id ? (maskPII ? `${String(u.id).slice(0, 6)}…` : u.id) : "—", phone(u.phone), email(u.email),
          u.photo ? "Google" : "Other", lab(L.GENDER, u.gender), lab(L.AGE, u.age), u.state || "—", lab(L.AREA, u.area), fDate(u.createdAt), fDate(u.lastSeen)]),
        { numeric: [0], cls: "dense", widths: ["3%", "11%", maskPII ? "6%" : "13%", "9%", "", "5%", "5%", "5%", "9%", "6%", "7%", "7%"] })}
      ${D.h3(`${n}.2`, "Part B — Socio-economic profile")}
      ${D.table("Registered users — socio-economic profile", ["#", "Name", "Occupation", "Income", "Marital", "Category", "Ration", "Housing", "Disability", "Children", "Girl child", "Land", "KCC", "Education", "Institution", "Special groups"],
        sorted.map((u, i) => {
          const farmer = u.occupation === "farmer", student = u.occupation === "student";
          return [i + 1, u.name || "—", lab(L.OCC, u.occupation), lab(L.INC, u.income), lab(L.MARITAL, u.marital), lab(L.CASTE, u.caste),
            lab(L.RATION, u.ration), lab(L.HOUSE, u.house), lab(L.DISAB, u.disability), lab(L.CHILDREN, u.numChildren),
            u.numChildren && u.numChildren !== "0" ? yn(u.hasGirls) : "N/A",
            farmer ? lab(L.LAND, u.landHolding) : "N/A", farmer ? lab(L.KISAN, u.kisanCard) : "N/A",
            student ? lab(L.EDUC, u.educationLevel) : "N/A", student ? lab(L.INST, u.institutionType) : "N/A", groupsOf(u)];
        }),
        { numeric: [0], cls: "dense" })}`;
  });

  // 4 — Activity
  add("activity", "Activity & Engagement", `${num(active7)} active`, n => {
    const occ = Object.keys(L.OCC || {}).map(k => {
      const c = users.filter(u => u.occupation === k), a = c.filter(u => isActive(u, 7)).length;
      return [lab(L.OCC, k), c.length, a];
    }).filter(r => r[1] > 0).sort((a, b) => b[2] - a[2] || b[1] - a[1]);
    const recent = [...users].filter(u => toMs(u.lastSeen)).sort((a, b) => toMs(b.lastSeen) - toMs(a.lastSeen)).slice(0, 30);
    const newWeek = users.filter(u => isNew(u, 7)).sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    const dorm = [...dormant].sort((a, b) => toMs(a.lastSeen) - toMs(b.lastSeen));
    const shown = (list, cap) => (list.length > cap ? `Showing ${cap} of ${num(list.length)}.` : "");
    return `
      ${D.kpis([
        { label: "Active today", value: num(active1) }, { label: "Active in last 7 days", value: num(active7), sub: `Engagement rate ${pctS(active7, R)}` },
        { label: "Active in last 30 days", value: num(active30), sub: `30-day retention ${pctS(active30, R)}` },
        { label: "Dormant (over 30 days)", value: num(dormant.length), sub: `${pctS(dormant.length, R)} of registered` },
      ])}
      ${neverSeen ? D.note(`${plural(neverSeen, "user")} have no recorded activity time and are excluded from the active and dormant counts.`) : ""}
      ${D.h3(`${n}.1`, "Engagement by occupation")}
      ${D.table("Weekly engagement by occupation", ["Occupation", "Registered", "Active (7 days)", "Engagement rate", ""],
        occ.map(([l, t, a]) => [l, num(t), num(a), pctS(a, t), raw(`<span class="bar"><i style="width:${Math.max(2, pct(a, t))}%"></i></span>`)]),
        { numeric: [1, 2, 3], widths: ["", "14%", "16%", "16%", "26%"], cls: "half" })}
      ${D.h3(`${n}.2`, "Most recently active users")}
      ${D.table("Most recently active users (up to 30)", ["#", "Name", "Phone", "Email", "State / UT", "Occupation", "Income", "Area", "Joined", "Last seen"],
        recent.map((u, i) => [i + 1, u.name || "—", phone(u.phone), email(u.email), u.state || "—", lab(L.OCC, u.occupation), lab(L.INC, u.income), lab(L.AREA, u.area), fDate(u.createdAt), fDateTime(u.lastSeen)]),
        { numeric: [0], cls: "dense" })}
      ${D.h3(`${n}.3`, "New registrations in the last 7 days")}
      ${D.table(`Users who joined in the last 7 days (${num(newWeek.length)})`, ["#", "Name", "Phone", "Email", "State / UT", "Occupation", "Area", "Ration", "Joined"],
        newWeek.slice(0, 60).map((u, i) => [i + 1, u.name || "—", phone(u.phone), email(u.email), u.state || "—", lab(L.OCC, u.occupation), lab(L.AREA, u.area), lab(L.RATION, u.ration), fDateTime(u.createdAt)]),
        { numeric: [0], cls: "dense", empty: "No new registrations in the last 7 days.", note: shown(newWeek, 60) })}
      ${D.h3(`${n}.4`, "Dormant users")}
      ${D.table(`Users inactive for more than 30 days (${num(dorm.length)})`, ["#", "Name", "State / UT", "Occupation", "Joined", "Last seen", "Days inactive"],
        dorm.slice(0, 40).map((u, i) => [i + 1, u.name || "—", u.state || "—", lab(L.OCC, u.occupation), fDate(u.createdAt), fDate(u.lastSeen), num(Math.floor((now - toMs(u.lastSeen)) / DAY))]),
        { numeric: [0, 6], empty: "No dormant users.", note: shown(dorm, 40) ? `${shown(dorm, 40)} Longest inactive first.` : "Longest inactive first." })}`;
  });

  // 5 — Platform usage
  add("usage", "Platform Usage", `${num(totalRuns)} checker runs`, n => {
    const spark = Array.from({ length: 14 }, (_, i) => {
      const day = istDay(now - (13 - i) * DAY);
      return { l: i === 13 ? "Today" : day.slice(8) + "/" + day.slice(5, 7), v: runs.filter(r => r.ts && istDay(toMs(r.ts)) === day).length };
    });
    const q = {};
    searches.forEach(r => { if (r?.q) { const k = String(r.q).toLowerCase().trim(); q[k] = (q[k] || 0) + 1; } });
    const who = {};
    runs.forEach(r => { if (r.who) who[r.who] = (who[r.who] || 0) + 1; });
    const gm = {}; let legacy = 0;
    const touch = (uid, ts, kind) => {
      if (!uid) return; if (uid === "anon") { legacy++; return; }
      if (typeof uid !== "string" || !uid.startsWith("guest_")) return;
      const g = gm[uid] || (gm[uid] = { uid, runs: 0, searches: 0, states: 0, first: ts, last: ts, matched: null });
      g[kind]++;
      if (ts && (!g.first || ts < g.first)) g.first = ts;
      if (ts && (!g.last || ts >= g.last)) { g.last = ts; if (kind === "runs") g.matched = null; }
    };
    runs.forEach(r => { touch(r.uid, r.ts, "runs"); const g = gm[r.uid]; if (g && r.ts === g.last) g.matched = r.matchedCount ?? null; });
    searches.forEach(r => touch(r.uid, r.ts, "searches"));
    stateSel.forEach(r => touch(r.uid, r.ts, "states"));
    const guests = Object.values(gm).map(g => ({ ...g, total: g.runs + g.searches + g.states })).sort((a, b) => b.total - a.total);
    const usersWithChecker = users.filter(u => u.matchedCount != null).length;
    return `
      ${D.p("Usage is taken from the platform's activity log (Eligibility Checker runs, scheme searches and state selections). The log keeps the most recent entries; lifetime totals are shown where the platform counts them separately.")}
      ${D.kpis([
        { label: "Eligibility Checker runs", value: num(totalRuns), sub: `${num(spark[13].v)} today` },
        { label: "Scheme searches", value: num(totalSearches), sub: zeroList.length ? `${num(zeroList.reduce((s, [, v]) => s + v, 0))} found nothing` : "" },
        { label: "Average schemes matched", value: avgMatched == null ? "—" : avgMatched.toFixed(1), sub: runs.length ? `Highest ${num(Math.max(...runs.map(r => r.matchedCount || 0)))}` : "" },
        { label: "Guest sessions", value: num(guests.length), sub: `${num(usersWithChecker)} registered users used the checker` },
      ])}
      ${D.chart("Eligibility Checker runs — last 14 days", spark.map(s => s.l), [{ name: "Runs", values: spark.map(s => s.v) }])}
      <div class="grid2">
        ${D.breakdown("Most frequent search terms (top 10)", Object.entries(q).sort((a, b) => b[1] - a[1]).slice(0, 10), { head: "Search term", empty: "No searches recorded." })}
        ${D.breakdown("Who ran the checker", Object.entries(who).map(([k, v]) => [lab(L.OCC, k), v]), { head: "Declared as", empty: "No checker runs recorded." })}
      </div>
      ${D.h3(`${n}.1`, "Searches that returned no scheme")}
      ${D.table("Search terms with no matching scheme (top 15)", ["#", "Search term", "Times searched"], zeroList.slice(0, 15).map(([k, v], i) => [i + 1, k, num(v)]),
        { numeric: [0, 2], widths: ["6%", "", "18%"], cls: "half", empty: "Every recorded search returned at least one scheme.", note: "These point to schemes that may be missing, or search words the app does not yet recognise." })}
      ${D.h3(`${n}.2`, "Guest activity")}
      ${D.table(`Guest sessions by activity (top 30 of ${num(guests.length)})`, ["#", "Guest ID", "Checker runs", "Searches", "State selections", "Total", "First seen", "Last seen", "Last matched"],
        guests.slice(0, 30).map((g, i) => [i + 1, `${g.uid.replace("guest_", "").slice(0, 10)}…`, num(g.runs), num(g.searches), num(g.states), num(g.total), fDateTime(g.first), fDateTime(g.last), g.matched ?? "—"]),
        { numeric: [0, 2, 3, 4, 5, 8], empty: "No guest activity recorded.", note: legacy ? `${plural(legacy, "older entry", "older entries")} recorded before guest IDs existed ${legacy === 1 ? "is" : "are"} not attributed to any session.` : "" })}`;
  });

  // 6 — Citizen actions & outcomes (anonymous counters)
  add("impact", "Citizen Actions & Outcomes", hasEvents ? `${num(ev.scheme_view || 0)} views` : "no data", n => {
    if (!hasEvents) return D.p("No action counters have been recorded yet, so this section has no figures.");
    const daily = Array.from({ length: 14 }, (_, i) => { const d = istDay(now - (13 - i) * DAY); const c = evDays[d] || {}; return { l: i === 13 ? "Today" : d.slice(8) + "/" + d.slice(5, 7), v: c.scheme_view || 0, a: c.apply_click || 0 }; });
    const names = new Map(schemes.map(s => [s.id, clean(s.name?.en || s.name || s.id)]));
    const sch = Object.entries(events?.schemes || {}).filter(([id]) => names.has(id))
      .map(([id, c]) => ({ name: names.get(id), v: c.v || 0, a: c.a || 0, t: c.t || 0, ok: (c.ok || 0) + (c.rc || 0), rj: c.rj || 0 }));
    const quiz = events?.quiz || {};
    const steps = STEP_ORDER.filter(k => quiz[`step_${k}`]).map(k => ({ k, label: STEP_LABEL[k] || k, n: quiz[`step_${k}`] || 0 }));
    let prev = quiz.start || 0;
    const funnel = [["Opened the quiz", num(quiz.start || 0), "—", "—"]];
    steps.forEach(s => {
      const adaptive = ADAPTIVE_STEPS.includes(s.k);
      funnel.push([`${s.label}${adaptive ? " (asked to some users only)" : ""}`, num(s.n), pctS(s.n, quiz.start || 0), adaptive ? "—" : (prev > 0 ? `${Math.max(0, pct(prev - s.n, prev))}%` : "—")]);
      if (!adaptive) prev = s.n;
    });
    funnel.push(["Saw results", num(quiz.done || 0), pctS(quiz.done || 0, quiz.start || 0), prev > 0 ? `${Math.max(0, pct(prev - (quiz.done || 0), prev))}%` : "—"]);
    const f = events?.features || {};
    const sortObj = o => Object.entries(o || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const cal = f.money_cal || {};
    return `
      ${D.p(`Anonymous action counters for ${rangeStart ? esc(dateRangeLabel) : "all recorded days"} (Indian Standard Time). These counters hold no names, user IDs or answers. Scheme-level and quiz figures are lifetime totals.`)}
      ${D.kpis([
        { label: "Scheme views", value: num(ev.scheme_view || 0) },
        { label: "Apply taps", value: num(ev.apply_click || 0), sub: `${pctS(ev.apply_click || 0, ev.scheme_view || 0)} of views` },
        { label: "Marked as applied", value: num(ev.app_track || 0) },
        { label: "Approved / money received", value: num(evApproved), sub: ev.app_rejected ? `${num(ev.app_rejected)} reported rejected` : "" },
      ])}
      ${D.table("Actions taken in the period", ["Action", "Count", "Note"], [
        ["Scheme pages viewed", num(ev.scheme_view || 0), ""],
        ["Apply link tapped", num(ev.apply_click || 0), `Conversion ${pctS(ev.apply_click || 0, ev.scheme_view || 0)} of views`],
        ["Application marked as applied", num(ev.app_track || 0), ""],
        ["Reported approved", num(ev.app_approved || 0), ""], ["Reported money received", num(ev.app_received || 0), ""],
        ["Reported rejected", num(ev.app_rejected || 0), ""],
        ["Results / checklists shared", num((ev.share_result || 0) + (ev.share_checklist || 0), ""), ""],
        ["Family members added", num(ev.family_add || 0), ""],
        ["Eligibility quiz started", num(ev.quiz_start || 0), ""], ["Eligibility quiz finished", num(ev.quiz_done || 0), `Completion ${pctS(ev.quiz_done || 0, ev.quiz_start || 0)}`],
        ["Reminders switched on (net)", num(Math.max(0, (ev.push_on || 0) - (ev.push_off || 0))), ev.push_off ? `${num(ev.push_off)} switched off` : ""],
      ], { numeric: [1], widths: ["", "14%", "34%"], cls: "half" })}
      ${D.chart("Scheme views and Apply taps — last 14 days", daily.map(d => d.l), [{ name: "Scheme views", values: daily.map(d => d.v) }, { name: "Apply taps", values: daily.map(d => d.a) }])}
      ${D.h3(`${n}.1`, "Most-used schemes")}
      ${D.table("Schemes ranked by views (top 15, lifetime)", ["#", "Scheme", "Views", "Apply taps", "Conversion", "Marked applied", "Approved / received", "Rejected"],
        [...sch].sort((a, b) => b.v - a.v).filter(s => s.v > 0).slice(0, 15).map((s, i) => [i + 1, s.name, num(s.v), num(s.a), pctS(s.a, s.v), num(s.t), num(s.ok), num(s.rj)]),
        { numeric: [0, 2, 3, 4, 5, 6, 7], widths: ["4%", "", "9%", "10%", "10%", "12%", "14%", "9%"], empty: "No scheme activity recorded." })}
      ${sch.some(s => s.ok > 0) ? D.table("Schemes with the most reported successes (top 10, lifetime)", ["#", "Scheme", "Approved / received", "Marked applied", "Views"],
        [...sch].filter(s => s.ok > 0).sort((a, b) => b.ok - a.ok).slice(0, 10).map((s, i) => [i + 1, s.name, num(s.ok), num(s.t), num(s.v)]),
        { numeric: [0, 2, 3, 4], widths: ["5%", "", "18%", "15%", "12%"], cls: "half" }) : ""}
      ${D.h3(`${n}.2`, "Eligibility quiz completion")}
      ${D.table("Quiz funnel (lifetime)", ["Step", "Users reaching step", "Of those who opened", "Drop from previous step"], funnel,
        { numeric: [1, 2, 3], widths: ["", "18%", "18%", "20%"], cls: "half", note: "Steps asked only to some users (farm land, class, ration card) are left out of the drop-off calculation." })}
      ${D.h3(`${n}.3`, "Feature use")}
      <div class="grid2">
        ${D.breakdown("Life events opened", sortObj(f.life_event).map(([k, v]) => [LIFE_LABEL[k] || k, v]), { head: "Life event", empty: "No life events opened." })}
        ${D.breakdown("Money check — reason selected", sortObj(f.money_check).map(([k, v]) => [MONEY_LABEL[k] || k, v]), { head: "Reason", empty: "No money checks recorded." })}
        ${D.breakdown("Special groups ticked in the quiz", sortObj(events?.groups).map(([k, v]) => [audiences.find(a => a.key === k)?.en || k, v]), { head: "Group", empty: "No special groups ticked." })}
        ${D.table("My Money Calendar", ["Action", "Count"], [["Opened the calendar", num(cal.open || 0)], ["Added a calendar reminder", num(cal.reminder || 0)], ["Tapped “Didn't get it?”", num(cal.not_received || 0)]], { numeric: [1], cls: "half" })}
      </div>`;
  });

  // 7 — Schemes coverage
  add("schemes", "Schemes Coverage", `${num(live.length)} open schemes`, n => {
    const tiers = { None: 0, Low: 0, Medium: 0, Good: 0 };
    stateList.forEach(st => { tiers[tierOf(stSch[st] || 0)]++; });
    const rows = stateList.map(st => [st, stSch[st] || 0, tierOf(stSch[st] || 0), byStateReg[st] || 0])
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
      .map((r, i) => [i + 1, r[0], num(r[1]), num(r[1] + centralCnt), r[2], num(r[3])]);
    return `
      ${D.p(`Counts include only open schemes — schemes marked closed and duplicate records are left out, which matches the figure shown in the app. Every user can also see the ${num(centralCnt)} central schemes in addition to their state's schemes.`)}
      ${D.kpis([
        { label: "Open schemes listed", value: num(live.length) }, { label: "Central schemes", value: num(centralCnt), sub: pctS(centralCnt, live.length) + " of open schemes" },
        { label: "State-level schemes", value: num(stateLevelCnt), sub: `across ${num(stateList.filter(s => stSch[s]).length)} states / UTs` },
        { label: "States / UTs without state schemes", value: num(zeroStates.length) },
      ])}
      <div class="grid2">
        ${D.table("Scheme catalogue", ["Measure", "Count"], [
          ["Open schemes (shown in the app)", num(live.length)], ["Central / national", num(centralCnt)], ["State-level", num(stateLevelCnt)],
          ["Other scope", num(live.length - centralCnt - stateLevelCnt)], ["Closed schemes (kept for reference)", num(closedCnt)], ["Duplicate records (merged)", num(dupCnt)],
          ["Total records in catalogue", num(schemes.length)],
        ], { numeric: [1], cls: "half" })}
        ${D.table("Coverage tiers (state-level schemes)", ["Tier", "Range", "States / UTs"], [
          ["None", "0 schemes", num(tiers.None)], ["Low", "1–30", num(tiers.Low)], ["Medium", "31–100", num(tiers.Medium)], ["Good", "More than 100", num(tiers.Good)],
        ], { numeric: [2], cls: "half", total: ["Total", "", num(stateList.length)] })}
      </div>
      ${D.h3(`${n}.1`, "State-wise coverage")}
      ${D.table("Open schemes by state / UT, with registered users", ["#", "State / UT", "State schemes", "Available incl. central", "Tier", "Registered users"], rows,
        { numeric: [0, 2, 3, 5], widths: ["5%", "", "14%", "18%", "10%", "16%"], total: ["", "Total", num(stateLevelCnt), "", "", num(Object.values(byStateReg).reduce((a, b) => a + b, 0))] })}`;
  });

  // 8 — Reports & grievances
  add("reports", "Reports & Grievances", `${num(reports.length)} reports`, n => {
    const typeLabel = r => (r.source === "scheme_flag" ? "Scheme page report" : clean(L.TYPE?.[r.type]?.label || r.type || "—"));
    const byType = {}; reports.forEach(r => { const k = typeLabel(r); byType[k] = (byType[k] || 0) + 1; });
    const ageBand = [["Up to 2 days", 0, 2], ["3 – 7 days", 2, 7], ["8 – 30 days", 7, 30], ["More than 30 days", 30, Infinity]].map(([l, a, b]) => {
      const list = pendingRep.filter(r => { const g = ageOf(r); return g != null && (a === 0 ? g <= b * DAY : g > a * DAY && g <= b * DAY); });
      return [l, num(list.filter(r => (r.status || "open") === "open").length), num(list.filter(r => r.status === "in_progress").length), num(list.length)];
    });
    const sorted = [...reports].sort((a, b) => (toMs(b.createdAt) || 0) - (toMs(a.createdAt) || 0));
    const replies = r => {
      const h = (r.replyHistory || []).filter(x => x && (x.text || x.isReopen));
      if (!h.length) return r.adminReply ? `${esc(String(r.adminReply).slice(0, 300))}${String(r.adminReply).length > 300 ? "…" : ""} <span class="muted">(${fDate(r.repliedAt)})</span>` : "—";
      return h.map(x => `<div class="rep"><span class="muted">${fDate(x.sentAt)}${x.isReopen ? " · reopened by user" : ""}:</span> ${esc(String(x.text || "").slice(0, 240))}${String(x.text || "").length > 240 ? "…" : ""}</div>`).join("");
    };
    const statusLabel = r => clean(L.STATUS?.[r.status || "open"]?.label || r.status || "Open");
    return `
      ${D.kpis([
        { label: "Reports received", value: num(reports.length) }, { label: "Resolved", value: num(resRep.length), sub: `${pctS(resRep.length, reports.length)} resolution rate` },
        { label: "Pending (open + in progress)", value: num(pendingRep.length), sub: `${num(olderThan7.length)} older than 7 days` },
        { label: "Median first response", value: dur(medResp), sub: `Average ${dur(avgResp)}` },
      ])}
      <div class="grid3">
        ${D.table("By status", ["Status", "Count", "Share"], [["Open", num(openRep.length), pctS(openRep.length, reports.length)], ["In progress", num(progRep.length), pctS(progRep.length, reports.length)], ["Resolved", num(resRep.length), pctS(resRep.length, reports.length)]],
          { numeric: [1, 2], total: ["Total", num(reports.length), reports.length ? "100%" : "—"] })}
        ${D.table("By type", ["Type", "Count", "Share"], Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, num(v), pctS(v, reports.length)]),
          { numeric: [1, 2], total: ["Total", num(reports.length), reports.length ? "100%" : "—"] })}
        ${D.table("Ageing of pending reports", ["Age", "Open", "In progress", "Total"], ageBand, { numeric: [1, 2, 3], total: ["Total", num(openRep.length), num(progRep.length), num(pendingRep.length)] })}
      </div>
      ${D.table("Response performance", ["Measure", "Value"], [
        ["Reports with at least one admin reply", `${num(reports.filter(hasReply).length)} (${pctS(reports.filter(hasReply).length, reports.length)})`],
        ["Open reports without any reply", num(unrepliedOpen.length)], ["Reopened by users and not yet resolved", num(reopened)],
        ["Median time to first response", dur(medResp)], ["Average time to first response", dur(avgResp)],
        ["Open scheme page reports", flagsOpen.length ? `${num(flagsOpen.length)} (raised by ${plural(flagPeople, "person", "people")})` : "0"],
      ], { numeric: [], cls: "half" })}
      ${D.h3(`${n}.1`, "Register of reports")}
      ${D.table("All reports in the period, newest first", ["#", "Submitted", "From", "Contact", "Type", "Status", "Message", "Replies"],
        sorted.map((r, i) => [i + 1, fDateTime(r.createdAt), r.userName || "—", r.userPhone ? phone(r.userPhone) : email(r.userEmail),
          typeLabel(r) + (r.source === "scheme_flag" && r.schemeName ? ` — ${clean(r.schemeName)}` : ""), statusLabel(r),
          `${String(r.message || r.flagReason || "—").slice(0, 400)}${String(r.message || "").length > 400 ? "…" : ""}`, raw(replies(r))]),
        { numeric: [0], cls: "dense wrap", widths: ["3%", "9%", "9%", "11%", "9%", "6%", "28%", ""], note: "Messages longer than 400 characters and replies longer than 240 characters are shortened; the full text is in the admin dashboard." })}`;
  });

  // 9 — Human agents
  add("agents", "Human Agents & Attendance", `${num(humanAgents.length)} agents`, n => {
    const rep = agentsData?.monthReport || null;
    const rows = rep?.rows || [];
    const today = agentsData?.todayStr || istDay(now);
    const byUid = new Map(rows.map(r => [r.uid, r]));
    const presence = a => (H.getPresenceState ? H.getPresenceState(a.lastSeen, "human") : "offline");
    const online = humanAgents.filter(a => presence(a) !== "offline").length;
    const fullAdmins = humanAgents.filter(a => a.allowedTabs == null).length;
    const access = t => (t == null ? "All tabs (full admin)" : !Array.isArray(t) || !t.length ? "—" : t.map(x => clean(L.TAB?.[x] || x)).join(", "));
    const f1 = v => (typeof v === "number" ? v.toFixed(1) : "—");
    const ago = ts => { const ms = toMs(ts); if (ms == null) return "—"; const m = Math.floor((now - ms) / 60000); return m < 1 ? "Just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} hrs ago` : fDateTime(ts); };
    return `
      ${D.p(`This section covers human agents (sub-admins). The dashboard also runs ${plural(aiAgents.length, "automated agent")}${aiAgents.length ? ` (${aiAgents.map(a => esc(clean(a.name))).join(", ")})` : ""}, whose health is reported on the Team tab and not here.`)}
      ${D.kpis([
        { label: "Human agents", value: num(humanAgents.length) }, { label: "Online now", value: num(online) },
        { label: "Full admins", value: num(fullAdmins) },
        { label: "Working days this month", value: rep ? num(rep.totalWorkingDays) : "—", sub: rep ? `${fDate(rep.startStr + "T00:00:00+05:30")} – ${fDate(rep.endStr + "T00:00:00+05:30")}` : "" },
      ])}
      ${D.h3(`${n}.1`, "Roster and access")}
      ${D.table("Agent roster", ["#", "Name", "Email", "Status", "Device", "Access", "Last seen", "Current / last session"],
        humanAgents.map((a, i) => {
          const st = presence(a);
          return [i + 1, a.name || "—", a.email || "—", st === "online" ? "Online" : st === "idle" ? "Idle" : "Offline",
            a.deviceType === "mobile" ? "Mobile" : a.deviceType === "desktop" ? "Desktop" : "—", access(a.allowedTabs), ago(a.lastSeen),
            st !== "offline" && H.sessionDuration ? H.sessionDuration(a.sessionStart, null) : (a.lastSessionDuration || "—")];
        }), { numeric: [0], cls: "wrap", empty: "No human agents on record." })}
      ${D.h3(`${n}.2`, `Attendance on ${fDate(today + "T00:00:00+05:30")}`)}
      ${D.table("Today's attendance", ["#", "Name", "In time", "Last active", "Hours today", "Status"],
        humanAgents.map((a, i) => { const day = byUid.get(a.uid || a.id)?.days?.find(d => d.date === today); return [i + 1, a.name || "—", day?.inTime || "—", day?.lastTime || "—", day ? `${f1(day.hours)} hrs` : "0.0 hrs", day ? day.status : "Absent"]; }),
        { numeric: [0, 4], cls: "half", empty: "No human agents on record." })}
      ${D.h3(`${n}.3`, "Month-to-date attendance summary")}
      ${D.table("Attendance summary", ["#", "Name", "Days present", "Full days", "Half days", "Days absent", "Attendance", "Total hours", "Average per day", "Overtime", "Shortfall"],
        rows.map((r, i) => [i + 1, r.name || "—", num(r.daysPresent), num(r.daysFull), num(r.daysHalf), num(r.daysAbsent), `${Math.round(r.attendancePct || 0)}%`, f1(r.totalHours), f1(r.avgHoursPerDay), f1(r.overtimeHours), f1(r.shortfallHours)]),
        { numeric: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10], empty: "Attendance logs could not be loaded for this export.", note: rows.length ? "Hours are in hours. Overtime and shortfall are measured against the standard working day." : "" })}`;
  });

  // ── EXECUTIVE SUMMARY ──────────────────────────────────────────────────────
  const obs = [];
  if (R || guestProfiles.length) obs.push(`This report covers ${plural(R, "registered user")}${guestProfiles.length ? ` and ${plural(guestProfiles.length, "guest user")} of the Eligibility Checker` : ""} for the period <b>${esc(dateRangeLabel)}</b>.`);
  if (R) obs.push(`${num(active7)} registered users (${pctS(active7, R)}) were active in the last 7 days and ${num(active30)} (${pctS(active30, R)}) in the last 30 days; ${num(dormant.length)} (${pctS(dormant.length, R)}) have been inactive for more than 30 days.`);
  if (R) obs.push(`${num(new30)} users joined in the last 30 days, of whom ${num(new7)} joined in the last 7 days.`);
  if (topState) obs.push(`Users come from ${plural(stateCountReg, "state / UT", "states / UTs")}. The largest group is from ${esc(topState[0])} (${num(topState[1])}, ${pctS(topState[1], R)})${topOcc ? `, and the most common occupation is ${esc(lab(L.OCC, topOcc[0]))} (${pctS(topOcc[1], R)})` : ""}.`);
  if (reports.length) obs.push(`${plural(reports.length, "report")} ${reports.length === 1 ? "was" : "were"} received: ${num(resRep.length)} resolved (${pctS(resRep.length, reports.length)}), ${num(progRep.length)} in progress and ${num(openRep.length)} open${unrepliedOpen.length ? `, of which ${num(unrepliedOpen.length)} ${unrepliedOpen.length === 1 ? "has" : "have"} no reply yet` : ""}. The median time to first response is ${dur(medResp)}.`);
  if (live.length) obs.push(`${num(live.length)} open schemes are listed — ${num(centralCnt)} central and ${num(stateLevelCnt)} state-level across ${plural(stateList.filter(s => stSch[s]).length, "state / UT", "states / UTs")}.${zeroStates.length ? ` ${plural(zeroStates.length, "state / UT", "states / UTs")} ${zeroStates.length === 1 ? "has" : "have"} no state-level scheme listed yet.` : ""}`);
  if (totalRuns) obs.push(`The Eligibility Checker has been run ${num(totalRuns)} times${avgMatched != null ? `, matching ${avgMatched.toFixed(1)} schemes on average` : ""}.`);
  if (hasEvents && ev.scheme_view) obs.push(`Scheme pages were viewed ${num(ev.scheme_view)} times in the period and the Apply link was tapped ${num(ev.apply_click || 0)} times (${pctS(ev.apply_click || 0, ev.scheme_view)} of views); ${plural(evApproved, "approval or payment", "approvals or payments")} ${evApproved === 1 ? "was" : "were"} reported back by users.`);

  const attn = [];
  if (unrepliedOpen.length) attn.push(["High", "Open reports without a reply", `${plural(unrepliedOpen.length, "report")}; oldest submitted ${fDate(Math.min(...unrepliedOpen.map(r => toMs(r.createdAt) || now)))}.`, "Reply and update the status."]);
  if (olderThan7.length) attn.push(["High", "Reports pending for more than 7 days", `${plural(olderThan7.length, "report")} still open or in progress.`, "Review and close or escalate."]);
  if (flagsOpen.length) attn.push(["Medium", "Scheme page reports open", `${plural(flagsOpen.length, "report")} raised by ${plural(flagPeople, "person", "people")} about scheme details.`, "Check and correct the scheme data."]);
  if (incomplete) attn.push(["Medium", "Incomplete user profiles", `${plural(incomplete, "user")} (${pctS(incomplete, R)}) without occupation, state or income cannot be matched to schemes.`, "Prompt users to complete their profile."]);
  if (zeroList.length) attn.push(["Medium", "Searches with no result", `${plural(zeroList.length, "search term")}; most frequent: “${esc(zeroList[0][0])}” (${num(zeroList[0][1])} times).`, "Add the missing scheme or search keyword."]);
  if (R && dormant.length / R >= 0.4) attn.push(["Low", "High share of dormant users", `${pctS(dormant.length, R)} of registered users inactive for more than 30 days.`, "Consider a re-engagement reminder."]);
  if (zeroStates.length) attn.push(["Low", "States / UTs without state-level schemes", zeroStates.slice(0, 8).map(esc).join(", ") + (zeroStates.length > 8 ? ` and ${zeroStates.length - 8} more` : "") + ".", "Add state schemes where available."]);

  const execHtml = `<section class="sec" id="sec-summary">
    <h2 class="h2">Executive Summary</h2>
    ${D.kpis([
      { label: "Registered users", value: num(R), sub: `${num(new30)} new in last 30 days` },
      { label: "Active in last 7 days", value: num(active7), sub: `${pctS(active7, R)} of registered` },
      { label: "Reports pending", value: num(pendingRep.length), sub: `${num(unrepliedOpen.length)} without reply` },
      { label: "Open schemes listed", value: num(live.length), sub: `${num(centralCnt)} central · ${num(stateLevelCnt)} state` },
    ])}
    <h3 class="h3">Key observations</h3>
    ${obs.length ? `<ol class="obs">${obs.map(o => `<li>${o}</li>`).join("")}</ol>` : D.p("No records fall within the selected period and filters.")}
    <h3 class="h3">Matters requiring attention</h3>
    ${attn.length ? `<table class="attn"><colgroup><col style="width:9%"><col style="width:24%"><col><col style="width:24%"></colgroup>
      <thead><tr><th>Priority</th><th>Matter</th><th>Details</th><th>Suggested action</th></tr></thead>
      <tbody>${attn.map(([p, m, d, a]) => `<tr><td><span class="pri p-${p.toLowerCase()}">${p}</span></td><td><b>${esc(m)}</b></td><td>${d}</td><td>${esc(a)}</td></tr>`).join("")}</tbody></table>`
      : D.p("No matters require attention at the time of generation.")}
  </section>`;

  // ── FRONT MATTER ───────────────────────────────────────────────────────────
  const OCC = L.OCC || {};
  const filterText = [
    filters.state && filters.state !== "all" ? `State / UT: ${esc(filters.state)}` : "",
    filters.occupation && filters.occupation !== "all" ? `Occupation: ${esc(lab(OCC, filters.occupation))}` : "",
    filters.reportStatus && filters.reportStatus !== "all" ? `Report status: ${esc(clean(L.STATUS?.[filters.reportStatus]?.label || filters.reportStatus))}` : "",
  ].filter(Boolean);
  const moduleTitles = built.map(b => `${b.n}. ${b.title}`);

  const control = `<section class="sec front">
    <h2 class="h2">Document Control</h2>
    ${D.facts([
      ["Document title", "Administrative Report — Platform Operations & User Analytics"],
      ["Reference number", raw(`<span class="mono">${esc(ref)}</span>`)],
      ["Version", "1.0 (system generated)"],
      ["Date and time of issue", `${esc(dateStr)}, ${esc(timeStr)} IST`],
      ["Reporting period", raw(`${esc(dateRangeLabel)}<span class="muted"> — applied to user registration date and report submission date</span>`)],
      ["Filters applied", filterText.length ? raw(filterText.join("; ")) : "None — all records in the period"],
      ["Records covered", `${plural(R, "registered user")} · ${plural(guestProfiles.length, "guest profile")} · ${plural(reports.length, "report")} · ${plural(humanAgents.length, "human agent")}`],
      ["Sections included", raw(moduleTitles.map(esc).join("<br>") || "—")],
      ["Personal data", maskPII ? "Phone numbers, email addresses and user IDs are masked in this copy" : "Shown in full — handle as confidential"],
      ["Data source", "Live YojanaSahay administration database, read at the time of issue"],
      ["Prepared by", preparedBy ? preparedBy : "Not stated"],
      ["Classification", raw(`<b>CONFIDENTIAL</b> — for authorised YojanaSahay administrators only`)],
    ])}
    <div class="notice">
      <div class="notice-h">Data protection notice</div>
      This document contains personal data of users of the YojanaSahay platform — names${maskPII ? "" : ", phone numbers, email addresses"} and socio-economic profile details — processed only to administer the platform. It must be handled in line with the Digital Personal Data Protection Act, 2023 and the YojanaSahay Privacy Policy: do not forward, upload, publish or print it except for authorised administrative work; keep it in a secure location; and delete it when it is no longer needed.
    </div>
  </section>
  <section class="sec" id="sec-toc">
    <h2 class="h2">Contents</h2>
    <table class="toc"><tbody>
      <tr><td class="tn"></td><td>Executive Summary</td><td class="td">Key observations and matters requiring attention</td><td></td></tr>
      ${built.map(b => `<tr><td class="tn">${b.n}.</td><td>${esc(b.title)}</td><td class="td">${esc(REPORT_MODULES.find(m => m.id === b.id)?.desc || "")}</td><td class="r">${esc(b.count || "")}</td></tr>`).join("")}
      <tr><td class="tn">A.</td><td>Definitions & Methodology</td><td class="td">How each figure in this report is worked out</td><td></td></tr>
      <tr><td class="tn">B.</td><td>Certification & Sign-off</td><td class="td">Preparation, review and approval</td><td></td></tr>
    </tbody></table>
  </section>`;

  const defs = [
    ["Registered user", "A person who has signed in and has a profile record on the platform."],
    ["Guest user", "A visitor who used the Eligibility Checker without signing in, identified by an anonymous ID stored in their browser. Each guest is counted once, using their latest answers."],
    ["Active (today / 7 days / 30 days)", "A registered user whose last recorded activity is within 24 hours, 7 days or 30 days of the time of issue."],
    ["Dormant user", "A registered user whose last recorded activity is more than 30 days before the time of issue."],
    ["Engagement rate", "Users active in the last 7 days as a share of all registered users in the period."],
    ["30-day retention", "Users active in the last 30 days as a share of all registered users in the period."],
    ["Incomplete profile", "A registered user without an occupation, state or income — the app cannot match schemes for them."],
    ["Open scheme", "A listed scheme that is not marked closed and is not a duplicate record. This is the same count shown in the app."],
    ["Coverage tier", "Grouping of states / UTs by number of open state-level schemes: None (0), Low (1–30), Medium (31–100), Good (more than 100)."],
    ["Pending report", "A report whose status is Open or In progress."],
    ["First response time", "Time from a report being submitted to the first reply sent by an admin."],
    ["Conversion", "Apply taps as a share of scheme page views."],
    ["Reporting period", "Applies to the registration date of users and the submission date of reports. Activity measures (active, dormant) are counted from the time of issue."],
    ["Action counters", "Anonymous daily totals of actions in the app (views, Apply taps, quiz steps). They contain no names, user IDs or answers."],
    ["Time zone", "All dates and times are in Indian Standard Time (IST, UTC+05:30)."],
  ];
  const annexA = `<section class="sec" id="sec-defs">
    <h2 class="h2"><span class="hn">A.</span>Definitions & Methodology</h2>
    <table class="defs"><colgroup><col style="width:26%"><col></colgroup><thead><tr><th>Term</th><th>Meaning in this report</th></tr></thead>
    <tbody>${defs.map(([t, d]) => `<tr><td><b>${esc(t)}</b></td><td>${esc(d)}</td></tr>`).join("")}</tbody></table>
  </section>`;

  const signBox = (role, name) => `<div class="sign">
      <div class="sign-role">${esc(role)}</div>
      <div class="sign-row"><span>Name</span><b>${name ? esc(name) : ""}</b></div>
      <div class="sign-row"><span>Designation</span><b></b></div>
      <div class="sign-row"><span>Signature</span><b></b></div>
      <div class="sign-row"><span>Date</span><b>${name ? esc(fDate(now)) : ""}</b></div>
    </div>`;
  const annexB = `<section class="sec keep" id="sec-sign">
    <h2 class="h2"><span class="hn">B.</span>Certification & Sign-off</h2>
    ${D.p(`Certified that this report was generated by the YojanaSahay administration system on ${esc(dateStr)} at ${esc(timeStr)} IST from records held at that time, and that the figures have not been altered by hand. Figures may differ from later reports as records are added or updated.`)}
    <div class="signs">${signBox("Prepared by", preparedBy)}${signBox("Reviewed by", "")}${signBox("Approved by", "")}</div>
    <div class="end">— End of document —</div>
  </section>`;

  // ── COVER ──────────────────────────────────────────────────────────────────
  const PAGE_MM = { A4: [210, 297], Letter: [215.9, 279.4] }[pageSize] || [210, 297];
  const [pw, ph] = orientation === "landscape" ? [PAGE_MM[1], PAGE_MM[0]] : PAGE_MM;
  const MT = 17, MB = 16, MS = 14;
  const coverH = (ph - MT - MB - 1).toFixed(1);
  const cover = `<section class="cover">
    <div class="cv-top">
      <div class="cv-brand">
        ${logoUri ? `<img src="${logoUri}" alt="" class="cv-logo">` : ""}
        <div><div class="cv-name">YojanaSahay</div><div class="cv-tag">Welfare scheme discovery platform</div></div>
      </div>
      <div class="cv-class">CONFIDENTIAL</div>
    </div>
    <div class="cv-rule"><i></i><i></i><i></i></div>
    <div class="cv-mid">
      <div class="cv-kind">Administrative Report</div>
      <h1 class="cv-title">Platform Operations &amp; User Analytics</h1>
      <div class="cv-period">Reporting period: <b>${esc(dateRangeLabel)}</b>${filterText.length ? ` · ${filterText.join(" · ")}` : ""}</div>
    </div>
    <table class="cv-meta"><tbody>
      <tr><th>Reference No.</th><td class="mono">${esc(ref)}</td><th>Date of issue</th><td>${esc(dateStr)}</td></tr>
      <tr><th>Time of generation</th><td>${esc(timeStr)} IST</td><th>Version</th><td>1.0</td></tr>
      <tr><th>Prepared by</th><td>${preparedBy ? esc(preparedBy) : "—"}</td><th>Sections</th><td>${built.length} of ${REPORT_MODULES.length}</td></tr>
      <tr><th>Records</th><td colspan="3">${plural(R, "registered user")} · ${plural(reports.length, "report")} · ${plural(live.length, "open scheme")}</td></tr>
    </tbody></table>
    <div class="cv-foot">
      <div class="cv-warn"><b>Restricted.</b> Contains personal data of platform users${maskPII ? " (contact details masked)" : ""}. For authorised administrative use only — not for public circulation.</div>
      <div class="cv-disc">YojanaSahay is an independent citizen-information platform. It is not a Government of India service and is not affiliated with or endorsed by any government department.</div>
    </div>
  </section>`;

  // ── THEME ──────────────────────────────────────────────────────────────────
  const dark = theme === "dark";
  const C = dark ? {
    paper: "#0f131a", ink: "#e6e9ef", head: "#cfdcf5", muted: "#9aa3b2", faint: "#6b7484", rule: "#283040", rule2: "#3a4456",
    th: "#182030", zebra: "#131924", tot: "#1b2433", accent: "#f0913a", green: "#3fbf73", navy: "#7ea6e8", bar: "#5b8fe0", bar2: "#f0913a",
    kpi: "#141b27", noticeBg: "#1d1a12", noticeBd: "#5a4a1e", hi: "#f87171", med: "#fbbf24", low: "#7ea6e8",
  } : {
    paper: "#ffffff", ink: "#16202e", head: "#0b2a5b", muted: "#556070", faint: "#8a93a2", rule: "#d6dbe3", rule2: "#b9c1cd",
    th: "#eef2f7", zebra: "#f8fafc", tot: "#e7ecf3", accent: "#d9680b", green: "#11803a", navy: "#0b2a5b", bar: "#2f5da8", bar2: "#e08a2e",
    kpi: "#f6f8fb", noticeBg: "#fff8ec", noticeBd: "#f0d29b", hi: "#b42318", med: "#b54708", low: "#1d4f91",
  };
  const nonce = Math.random().toString(36).slice(2, 12);
  const marginBox = (content, align = "left") => `content: ${content}; font-family: 'Noto Sans', Arial, sans-serif; font-size: 7pt; color: ${C.faint}; text-align: ${align}; vertical-align: middle;`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data:; script-src 'nonce-${nonce}'">
<title>${esc(fileBase)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600&family=Noto+Sans+Bengali:wght@400;600&family=Noto+Sans+Mono:wght@500&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap">
<style>
  @page { size: ${pageSize} ${orientation}; margin: ${MT}mm ${MS}mm ${MB}mm ${MS}mm; background: ${C.paper};
    @top-left { ${marginBox('"YojanaSahay  ·  Administrative Report"')} }
    @top-right { ${marginBox('"CONFIDENTIAL"', "right")} font-weight: 700; letter-spacing: .12em; color: ${C.accent}; }
    @bottom-left { ${marginBox(`"Ref. ${ref}"`)} }
    @bottom-center { ${marginBox(`"Issued ${esc(dateStr)}"`, "center")} }
    @bottom-right { ${marginBox('"Page " counter(page) " of " counter(pages)', "right")} }
  }
  @page :first { @top-left { content: none } @top-right { content: none } @bottom-left { content: none } @bottom-center { content: none } @bottom-right { content: none } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: ${C.paper}; }
  body { font-family: 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Bengali', Arial, sans-serif; color: ${C.ink}; font-size: 8.6pt; line-height: 1.45;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; font-variant-numeric: tabular-nums; }
  .mono { font-family: 'Noto Sans Mono', ui-monospace, monospace; font-size: .95em; }
  .muted { color: ${C.muted}; }
  b { font-weight: 600; }

  /* screen preview */
  .bar-top { display: none; }
  @media screen {
    html { background: ${dark ? "#05070b" : "#e9edf2"}; }
    body { max-width: ${pw}mm; margin: 0 auto; padding: 56px ${MS}mm 40px; background: ${C.paper}; box-shadow: 0 2px 24px rgba(0,0,0,.18); min-height: 100vh; }
    .bar-top { display: flex; position: fixed; top: 0; left: 0; right: 0; z-index: 9; align-items: center; gap: 12px; padding: 9px 16px;
      background: #0b2a5b; color: #fff; font: 600 13px/1.2 'Noto Sans', Arial, sans-serif; }
    .bar-top span { flex: 1; opacity: .85; font-weight: 500; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar-top button { font: 700 12.5px 'Noto Sans', Arial, sans-serif; border: 0; border-radius: 7px; padding: 8px 14px; background: #fff; color: #0b2a5b; cursor: pointer; }
    .cover { min-height: ${coverH}mm; margin-bottom: 18mm; border-bottom: 1px dashed ${C.rule2}; padding-bottom: 10mm; }
  }

  /* watermark */
  .wm { position: fixed; top: 50%; left: 50%; width: 70mm; height: 70mm; transform: translate(-50%, -50%); opacity: ${dark ? ".04" : ".045"}; filter: grayscale(1); pointer-events: none; z-index: 0; }
  .sec, .cover { position: relative; z-index: 1; }

  /* cover */
  .cover { display: flex; flex-direction: column; height: ${coverH}mm; break-after: page; page-break-after: always; }
  .cv-top { display: flex; justify-content: space-between; align-items: center; }
  .cv-brand { display: flex; align-items: center; gap: 4mm; }
  .cv-logo { width: 17mm; height: 17mm; object-fit: contain; ${dark ? "background:#fff;border-radius:50%;padding:1mm;" : ""} }
  .cv-name { font-family: 'Source Serif 4', Georgia, serif; font-weight: 700; font-size: 20pt; color: ${C.head}; line-height: 1; }
  .cv-tag { font-size: 8pt; color: ${C.muted}; margin-top: 1.5mm; letter-spacing: .02em; }
  .cv-class { border: 1.2pt solid ${C.accent}; color: ${C.accent}; font-weight: 700; letter-spacing: .18em; font-size: 8pt; padding: 1.6mm 3.4mm; }
  .cv-rule { display: flex; height: 1.6mm; margin: 6mm 0 0; }
  .cv-rule i { flex: 1; } .cv-rule i:nth-child(1) { background: ${C.accent}; } .cv-rule i:nth-child(2) { background: ${dark ? "#d8dde6" : "#e6e9ee"}; } .cv-rule i:nth-child(3) { background: ${C.green}; }
  .cv-mid { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 6mm 0; }
  .cv-kind { font-size: 9pt; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: ${C.accent}; margin-bottom: 4mm; }
  .cv-title { font-family: 'Source Serif 4', Georgia, serif; font-weight: 700; font-size: ${orientation === "landscape" ? "30pt" : "27pt"}; line-height: 1.12; color: ${C.head}; max-width: 170mm; }
  .cv-period { margin-top: 5mm; font-size: 10.5pt; color: ${C.muted}; }
  .cv-period b { color: ${C.ink}; }
  .cv-meta { width: 100%; border-collapse: collapse; font-size: 8.6pt; margin-bottom: 6mm; }
  .cv-meta th, .cv-meta td { border: .6pt solid ${C.rule}; padding: 2mm 3mm; text-align: left; vertical-align: top; }
  .cv-meta th { background: ${C.th}; color: ${C.muted}; font-weight: 600; width: 17%; white-space: nowrap; }
  .cv-foot { border-top: .8pt solid ${C.rule2}; padding-top: 3.5mm; font-size: 7.6pt; color: ${C.muted}; display: grid; gap: 1.6mm; }
  .cv-warn b { color: ${C.accent}; }

  /* headings & text */
  .sec { break-before: page; page-break-before: always; }
  .sec.front { break-before: auto; page-break-before: auto; }
  .h2 { font-family: 'Source Serif 4', Georgia, serif; font-size: 15pt; font-weight: 700; color: ${C.head}; padding-bottom: 2mm; margin-bottom: 3.5mm; border-bottom: 1.4pt solid ${C.head}; break-after: avoid; }
  .h2 .hn, .h3 .hn { color: ${C.accent}; margin-right: 2.2mm; }
  .h3 { font-size: 10pt; font-weight: 700; color: ${C.head}; margin: 5mm 0 2.2mm; break-after: avoid; page-break-after: avoid; }
  .para { margin: 0 0 3mm; max-width: 245mm; color: ${C.ink}; }
  .note { font-size: 7.6pt; color: ${C.muted}; margin: 0 0 2.5mm; }

  /* key figures */
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin: 1mm 0 4mm; break-inside: avoid; }
  .kpi { border: .6pt solid ${C.rule}; border-top: 2pt solid ${C.navy}; background: ${C.kpi}; padding: 2.6mm 3mm; }
  .kv { font-size: 15pt; font-weight: 700; color: ${C.head}; line-height: 1.1; }
  .kl { font-size: 7.6pt; font-weight: 600; color: ${C.ink}; margin-top: 1mm; }
  .ks { font-size: 7pt; color: ${C.muted}; margin-top: .6mm; }

  /* tables */
  .grid2, .grid3 { display: grid; gap: 4mm 5mm; align-items: start; }
  .grid2 { grid-template-columns: 1fr 1fr; } .grid3 { grid-template-columns: 1fr 1fr 1fr; }
  ${orientation === "portrait" ? ".grid3 { grid-template-columns: 1fr 1fr; }" : ""}
  .tblwrap { margin: 0 0 4mm; }
  .tblwrap.half, .grid2 .tblwrap, .grid3 .tblwrap { break-inside: avoid; page-break-inside: avoid; }
  figcaption { font-size: 7.8pt; font-weight: 700; color: ${C.ink}; margin-bottom: 1.4mm; break-after: avoid; }
  .tno { color: ${C.muted}; font-weight: 600; margin-right: 2mm; }
  table { width: 100%; border-collapse: collapse; font-size: 7.6pt; }
  th, td { border: .5pt solid ${C.rule}; padding: 1.3mm 1.8mm; text-align: left; vertical-align: top; }
  thead th { background: ${C.th}; color: ${C.head}; font-weight: 700; font-size: 7.2pt; }
  thead { display: table-header-group; } tfoot { display: table-row-group; }
  tbody tr:nth-child(even) td { background: ${C.zebra}; }
  tfoot td { background: ${C.tot}; font-weight: 700; border-top: 1pt solid ${C.rule2}; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  .r { text-align: right; white-space: nowrap; }
  td.empty { text-align: center; color: ${C.muted}; font-style: italic; padding: 3mm; }
  .dense table { font-size: ${orientation === "portrait" ? "6.2pt" : "6.8pt"}; } .dense th, .dense td { padding: 1mm 1.3mm; }
  .dense td { word-break: break-word; }
  .wrap td { white-space: normal; word-break: break-word; }
  .rep + .rep { margin-top: 1mm; padding-top: 1mm; border-top: .5pt dotted ${C.rule2}; }
  .tnote { font-size: 7pt; color: ${C.muted}; margin-top: 1.2mm; }
  .bar { display: block; height: 2.2mm; background: ${C.rule}; margin-top: .6mm; }
  .bar i { display: block; height: 100%; background: ${C.bar}; }
  .facts { font-size: 8.4pt; margin-bottom: 2mm; }
  .facts th { width: 24%; background: ${C.th}; color: ${C.muted}; font-weight: 600; }
  .facts th, .facts td { padding: 1.8mm 2.6mm; }
  .toc { font-size: 8.6pt; } .toc td { padding: 1.8mm 2.4mm; } .toc .tn { width: 7mm; color: ${C.accent}; font-weight: 700; } .toc .td { color: ${C.muted}; font-size: 7.8pt; }
  .toc td:nth-child(2) { font-weight: 600; width: 30%; }
  .notice { margin-top: 6mm; border: .8pt solid ${C.noticeBd}; background: ${C.noticeBg}; padding: 3mm 4mm; font-size: 8pt; break-inside: avoid; }
  .notice-h { font-weight: 700; color: ${C.accent}; text-transform: uppercase; letter-spacing: .1em; font-size: 7.6pt; margin-bottom: 1.2mm; }
  .obs { margin: 0 0 3mm 5mm; } .obs li { margin: 0 0 1.6mm; padding-left: 1.2mm; }
  .attn td, .attn th { padding: 1.8mm 2.2mm; font-size: 7.8pt; }
  .pri { display: inline-block; font-weight: 700; font-size: 7pt; padding: .3mm 1.8mm; border: .7pt solid; }
  .p-high { color: ${C.hi}; } .p-medium { color: ${C.med}; } .p-low { color: ${C.low}; }
  .defs td { padding: 1.7mm 2.4mm; font-size: 8pt; }

  /* charts */
  .chart { margin: 1mm 0 5mm; break-inside: avoid; page-break-inside: avoid; }
  .cols { display: flex; align-items: flex-end; gap: 1.4mm; height: 34mm; border-bottom: .8pt solid ${C.rule2}; }
  .col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; min-width: 0; }
  .cv { font-size: 6pt; color: ${C.muted}; white-space: nowrap; margin-bottom: .6mm; }
  .cb { display: flex; align-items: flex-end; justify-content: center; gap: .5mm; height: 27mm; width: 100%; }
  .cb i { display: block; width: 42%; max-width: 7mm; }
  .xl { display: flex; gap: 1.4mm; margin-top: 1.2mm; }
  .xl span { flex: 1; min-width: 0; text-align: center; font-size: 6.2pt; color: ${C.muted}; white-space: nowrap; }
  i.s0 { background: ${C.bar}; } i.s1 { background: ${C.bar2}; }
  .legend { display: flex; gap: 5mm; font-size: 7pt; color: ${C.muted}; margin-top: 2mm; }
  .legend i { display: inline-block; width: 2.6mm; height: 2.6mm; margin-right: 1.2mm; vertical-align: -.3mm; }

  /* sign-off */
  .keep { break-inside: avoid; }
  .signs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; margin-top: 6mm; }
  .sign { border: .6pt solid ${C.rule}; padding: 3mm; }
  .sign-role { font-weight: 700; color: ${C.head}; font-size: 8.6pt; margin-bottom: 2mm; }
  .sign-row { display: flex; align-items: flex-end; gap: 2mm; margin-top: 4mm; font-size: 7.6pt; color: ${C.muted}; }
  .sign-row span { width: 18mm; flex: none; } .sign-row b { flex: 1; border-bottom: .6pt solid ${C.rule2}; min-height: 4.6mm; color: ${C.ink}; font-weight: 600; }
  .end { text-align: center; color: ${C.faint}; font-size: 7.6pt; letter-spacing: .14em; margin-top: 12mm; text-transform: uppercase; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="bar-top"><span>${esc(fileBase)}.pdf — choose “Save as PDF” as the printer</span><button type="button" id="printBtn">Print / Save as PDF</button></div>
  ${logoUri ? `<img class="wm" src="${logoUri}" alt="">` : ""}
  ${cover}
  ${control}
  ${execHtml}
  ${built.map(b => b.html).join("\n")}
  ${annexA}
  ${annexB}
  <script nonce="${nonce}">
    (function () {
      var done = false;
      function go() { if (done) return; done = true; setTimeout(function () { window.print(); }, 250); }
      document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
      window.addEventListener('load', function () {
        if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go, go); setTimeout(go, 3500); } else go();
      });
    })();
  <\/script>
</body>
</html>`;
  return { html, ref, fileBase };
}

// Opens the report in a new tab (print dialog opens by itself). If pop-ups
// are blocked, downloads the HTML so nothing is lost.
export function openAdminReport({ html, fileBase }) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url; a.download = `${fileBase}.html`; a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return !!win;
}
