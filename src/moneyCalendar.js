// src/moneyCalendar.js — Yojana Sahay · "My Money Calendar"
// ─────────────────────────────────────────────────────────────────────────────
// When money from a scheme usually arrives, and when the person has to pay or
// act (premium auto-debit, deposit, enrolment window) — for the schemes they
// applied for (applications.js) and the ones they qualify for.
//
// Honest by design: governments don't publish fixed payment dates, so every
// line says "usually" / "date varies", and only well-known, stable cycles are
// listed. Anything we can't place on a calendar is simply left out.
// Pure data + functions — no UI.
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB } from "./schemesData.js";

const BY_ID = new Map(SCHEME_DB.map(s => [s.id, s]));
const MON_RE = /₹\s?([\d,]+)(?:\s?[–-]\s?₹?\s?([\d,]+))?\s?\/\s?month/i;
const num = (x) => Number(String(x || "").replace(/,/g, "")) || 0;
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

// "₹1,250/month" → "₹1,250"; "₹200–₹500/month" → "₹200–₹500"; else "".
function monthlyAmount(s) {
  const m = MON_RE.exec(s.benefit?.en || "");
  if (!m) return "";
  return m[2] ? `${inr(num(m[1]))}–${inr(num(m[2]))}` : inr(num(m[1]));
}

// Monthly cash to women (state DBT schemes like Ladli Behna, Lakshmir Bhandar).
const WOMEN_CASH = /women|woman|mahila|homemaker|housewife/i;
const NOT_CASH = /hostel|stipend|scholar|training|pension|after|loan|insurance|widow|creche|nutrition|ration|grain|wage|unemploy/i;
// Social-security pensions that are paid now (not "₹3,000/month after age 60").
const PENSION_NAME = /old.?age|vridh|vriddh|budhapa|widow|vidhwa|vidhva|disab|divyang|viklang|nirashrit|niradhar|social security|sandhya suraksha|aasara|samman allowance|madhu babu|pension kanuka|jai bangla|ganga swarupa|shravan bal|sanjay gandhi/i;
const LATER_PENSION = /after (the )?age|at age 60|on reaching|after 60|on turning|invest/i;
// Pension savings where the person pays every month until 60.
const CONTRIB_IDS = new Set(["apy", "pmkmy", "pmkmy_kisan", "pmlvmy"]);
const CONTRIB_NAME = /maan.?dhan|shram yogi/i;

// One scheme → its schedule, or null when it has no calendar-worthy cycle.
//   kind: "monthly_in" | "pension" | "monthly_out" | "dated"
//   dated items carry events: [{ month (1–12), day, en, hi, dir:"in"|"out"|"act", window? }]
export function scheduleFor(s) {
  if (!s || s.closed) return null;
  const id = s.duplicateOf || s.id;
  const base = BY_ID.get(id) || s;
  const ben = base.benefit?.en || "", name = base.name?.en || "";

  if (id === "pmkisan") return { kind: "dated", events: [
    { month: 4, day: 1, endMonth: 7, dir: "in", en: "₹2,000 instalment — usually released between April and July", hi: "₹2,000 की किस्त — आमतौर पर अप्रैल से जुलाई के बीच आती है" },
    { month: 8, day: 1, endMonth: 11, dir: "in", en: "₹2,000 instalment — usually released between August and November", hi: "₹2,000 की किस्त — आमतौर पर अगस्त से नवंबर के बीच आती है" },
    { month: 12, day: 1, endMonth: 3, dir: "in", en: "₹2,000 instalment — usually released between December and March", hi: "₹2,000 की किस्त — आमतौर पर दिसंबर से मार्च के बीच आती है" },
  ], tip: { en: "Keep e-KYC done and Aadhaar linked to your bank, or the instalment stops.", hi: "e-KYC पूरा और आधार बैंक से जुड़ा रखें, वरना किस्त रुक जाती है।" } };

  if (id === "pmsby") return { kind: "dated", events: [
    { month: 5, day: 25, dir: "out", en: "₹20 premium is auto-debited by 31 May — keep money in your account so the cover continues", hi: "₹20 प्रीमियम 31 मई तक खाते से अपने-आप कटता है — खाते में पैसे रखें ताकि बीमा चालू रहे" },
  ], tip: { en: "Cover year runs 1 June to 31 May.", hi: "बीमा वर्ष 1 जून से 31 मई तक चलता है।" } };

  if (id === "pmjjby") return { kind: "dated", events: [
    { month: 5, day: 25, dir: "out", en: "₹436 premium is auto-debited by 31 May — keep money in your account so the cover continues", hi: "₹436 प्रीमियम 31 मई तक खाते से अपने-आप कटता है — खाते में पैसे रखें ताकि बीमा चालू रहे" },
  ], tip: { en: "Cover year runs 1 June to 31 May.", hi: "बीमा वर्ष 1 जून से 31 मई तक चलता है।" } };

  if (id === "sukanya") return { kind: "dated", events: [
    { month: 3, day: 15, dir: "act", en: "Deposit at least ₹250 before 31 March — otherwise the account goes into default (₹50 penalty per year to restart it)", hi: "31 मार्च से पहले कम से कम ₹250 जमा करें — वरना खाता डिफ़ॉल्ट हो जाता है (दोबारा चालू करने पर ₹50 प्रति वर्ष जुर्माना)" },
  ] };

  if (id === "pmfby") return { kind: "dated", events: [
    { month: 7, day: 15, dir: "act", en: "Kharif crop insurance — enrolment usually closes 31 July (your state may set another date)", hi: "खरीफ फसल बीमा — पंजीकरण आमतौर पर 31 जुलाई तक (आपका राज्य दूसरी तारीख तय कर सकता है)" },
    { month: 12, day: 15, dir: "act", en: "Rabi crop insurance — enrolment usually closes 31 December (your state may set another date)", hi: "रबी फसल बीमा — पंजीकरण आमतौर पर 31 दिसंबर तक (आपका राज्य दूसरी तारीख तय कर सकता है)" },
  ], tip: { en: "Farmers with a crop loan may be enrolled through the bank — ask your branch.", hi: "फसल ऋण वाले किसानों का पंजीकरण बैंक से हो सकता है — अपनी शाखा से पूछें।" } };

  // Scholarships on the National Scholarship Portal — fresh and renewal.
  const url = `${base.apply?.en || ""} ${base.apply?.hi || ""}`;
  if (/scholarships\.gov\.in/i.test(url)) return { kind: "dated", events: [
    { month: 7, day: 15, dir: "act", group: "nsp", en: "National Scholarship Portal usually opens around July — apply or renew; last dates are usually between October and December", hi: "राष्ट्रीय छात्रवृत्ति पोर्टल आमतौर पर जुलाई के आसपास खुलता है — आवेदन या नवीनीकरण करें; अंतिम तिथि आमतौर पर अक्टूबर से दिसंबर के बीच" },
  ], tip: { en: "Money comes after your school/college and the department verify the form — check status on scholarships.gov.in.", hi: "स्कूल/कॉलेज और विभाग के सत्यापन के बाद पैसा आता है — स्टेटस scholarships.gov.in पर देखें।" } };

  if (CONTRIB_IDS.has(id) || (CONTRIB_NAME.test(name) && /pension/i.test(ben))) return { kind: "monthly_out",
    en: "Monthly contribution is auto-debited — keep enough balance; missed months add a penalty and can pause the account",
    hi: "मासिक अंशदान खाते से अपने-आप कटता है — पर्याप्त बैलेंस रखें; किस्त छूटने पर जुर्माना लगता है और खाता रुक सकता है" };

  const amt = monthlyAmount(base);
  if (/pension/i.test(name) && PENSION_NAME.test(name) && !LATER_PENSION.test(ben) && (amt || /^monthly/i.test(ben))) return { kind: "pension", amount: amt,
    en: `${amt ? amt + " " : ""}pension — paid every month in most states; some pay every 3 months. Date varies`,
    hi: `${amt ? amt + " " : ""}पेंशन — ज़्यादातर राज्यों में हर महीने; कुछ में हर 3 महीने। तारीख तय नहीं` };

  if (s.scope === "state" && amt && WOMEN_CASH.test(`${name} ${ben}`) && !NOT_CASH.test(`${name} ${ben}`)) return { kind: "monthly_in", amount: amt,
    en: `${amt} credited to your bank account every month — the date varies; watch for the bank SMS`,
    hi: `${amt} हर महीने बैंक खाते में आता है — तारीख तय नहीं; बैंक SMS देखते रहें` };

  return null;
}

// Build the calendar.
//   apps:      useApplications() map  { schemeId: { status, … } }
//   eligible:  scheme objects the person qualifies for
//   now:       Date (for tests)
// Returns { monthly:[item], months:[{ y, m, items:[item] }], count }
//   item = { scheme, mine (applied & not rejected), status, sched, ev?, also? (more schemes in the same window) }
export function moneyCalendar(apps = {}, eligible = [], now = new Date()) {
  const seen = new Set();
  const rows = [];
  const add = (s, mine, status) => {
    if (!s || seen.has(s.id)) return;
    const sched = scheduleFor(s);
    if (!sched) return;
    seen.add(s.id);
    rows.push({ scheme: s, mine, status, sched });
  };
  for (const [id, a] of Object.entries(apps || {})) {
    if (!a || a.status === "rejected") continue;
    add(BY_ID.get(id), true, a.status);
  }
  for (const s of eligible || []) add(BY_ID.get(s.duplicateOf || s.id) || s, false, null);

  const byMine = (a, b) => (b.mine - a.mine);
  const monthly = rows.filter(r => r.sched.kind !== "dated").sort(byMine);
  const y0 = now.getFullYear(), m0 = now.getMonth() + 1;
  const months = [];
  for (let i = 0; i < 12; i++) {
    const m = ((m0 - 1 + i) % 12) + 1, y = y0 + Math.floor((m0 - 1 + i) / 12);
    const items = [];
    for (const r of rows) if (r.sched.kind === "dated") for (const ev of r.sched.events) {
      // A payment window that is already running shows up in this month too.
      const inWindow = i === 0 && ev.endMonth && ev.month !== m && within(m, ev.month, ev.endMonth);
      if (!(ev.month === m || inWindow)) continue;
      // Several NSP scholarships share one portal window — show it once.
      const same = ev.group && items.find(x => x.ev.group === ev.group);
      if (same) { same.also.push(r.scheme); same.mine = same.mine || r.mine; continue; }
      items.push({ ...r, ev, running: !!inWindow, also: [] });
    }
    items.sort((a, b) => byMine(a, b) || (a.ev.day - b.ev.day));
    months.push({ y, m, items });
  }
  return { monthly, months, count: rows.length };
}

// Is month m inside the window start..end (wrapping over the new year)?
function within(m, start, end) {
  return start <= end ? m >= start && m <= end : m >= start || m <= end;
}

// Google Calendar "add event" link (all-day, repeating). No account data is
// sent anywhere — the person's own Google Calendar opens with the details.
export function googleCalendarUrl({ title, details, month, day = 10, freq = "YEARLY", now = new Date() }) {
  const pad = (n) => String(n).padStart(2, "0");
  let y = now.getFullYear();
  let mo = month || (now.getMonth() + 1);
  let d = Math.min(day, 28);
  // First occurrence must not be in the past.
  const first = new Date(y, mo - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (first < today) { if (freq === "MONTHLY" && !month) { mo += 1; if (mo > 12) { mo = 1; y += 1; } } else y += 1; }
  const start = new Date(y, mo - 1, d), end = new Date(y, mo - 1, d + 1);
  const f = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}`;
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, details, dates: `${f(start)}/${f(end)}`, recur: `RRULE:FREQ=${freq}` });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// What to do when expected money hasn't come (schemes without a full guide).
export const NOT_RECEIVED_TIPS = {
  en: [
    "Check your bank passbook or SMS — DBT money often shows as \"DBT\", \"PFMS\" or the scheme's short name.",
    "Ask your bank to confirm Aadhaar is linked to this account for DBT (NPCI mapping) and your e-KYC is done.",
    "Check the payment on pfms.nic.in → \"Know Your Payments\" with your bank account number.",
    "Still nothing? Visit the office or CSC where you applied, with your application number.",
  ],
  hi: [
    "बैंक पासबुक या SMS देखें — DBT का पैसा अक्सर \"DBT\", \"PFMS\" या योजना के छोटे नाम से दिखता है।",
    "बैंक से पूछें कि DBT के लिए आधार इस खाते से जुड़ा है (NPCI मैपिंग) और e-KYC पूरा है।",
    "pfms.nic.in → \"Know Your Payments\" पर अपने खाता नंबर से भुगतान देखें।",
    "फिर भी नहीं? आवेदन नंबर लेकर उस दफ़्तर या CSC जाएं जहां आवेदन किया था।",
  ],
};
