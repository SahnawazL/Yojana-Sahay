// api/_lib/push.js — Yojana Sahay · phone notifications (Web Push)
// ─────────────────────────────────────────────────────────────────────────────
// Signed-in users can turn on phone notifications. Their browser's push
// subscription is saved in Firestore at pushSubs/{uid}. Once a day (inside the
// deadline-alerts cron) each subscribed user gets AT MOST ONE notification,
// picked in this order:
//   1. a scheme they qualify for closes within 7 days
//   2. an application they're tracking has waited 30+ days → check its status
//   3. a new scheme they may qualify for was added
// Every item is remembered in pushSubs/{uid}.sent so it's never repeated
// (application reminders may repeat after 7 days if still unanswered).
//
// VAPID keys: VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY env vars if set; otherwise a
// key pair is derived (HKDF) from the existing FIREBASE_PRIVATE_KEY secret, so
// no new secret has to be created or handled. The public half is served by
// GET /api/stats?action=vapid.
// ─────────────────────────────────────────────────────────────────────────────

import { nicheAudience } from "../../src/audience.js";
import { vapidKeys } from "./vapid.js";
import { sendWebPush } from "./webPushSend.js";

const DAY = 86_400_000;
const SITE = "https://yojanasahay.vercel.app";

// Same rule as the app: special-group schemes (construction workers, athletes…)
// only when the person said that group applies to them.
function audienceOk(s, a) {
  const aud = nicheAudience(s);
  if (!aud) return true;
  if (aud.key === "disability") return !!a.disability && a.disability !== "none";
  if (aud.key === "trans") return a.gender === "other";
  return Array.isArray(a.groups) && a.groups.includes(aud.key);
}

const daysSince = iso => { const t = Date.parse(iso); return Number.isFinite(t) ? Math.floor((Date.now() - t) / DAY) : 0; };

function pickNotification({ hi, matched, apps, newSchemes, sent, daysUntil }) {
  const name = s => (hi ? s.name?.hi : s.name?.en) || s.name?.en || s.id;
  // 1 — closing soon
  const closing = matched
    .map(s => ({ s, d: daysUntil(s.lastDate) }))
    .filter(x => x.d !== null && x.d >= 0 && x.d <= 7 && !sent[`deadline:${x.s.id}`] && !apps?.[x.s.id]) // already applied → no nag
    .sort((a, b) => a.d - b.d);
  if (closing.length) {
    const { s, d } = closing[0];
    const more = closing.length - 1;
    return {
      key: `deadline:${s.id}`, marks: closing.map(x => `deadline:${x.s.id}`),
      title: hi ? `⏳ ${d === 0 ? "आज आख़िरी दिन" : `${d} दिन बाकी`}: ${name(s)}` : `⏳ ${d === 0 ? "Last day today" : `${d} day${d === 1 ? "" : "s"} left`}: ${name(s)}`,
      body: hi ? `इस योजना की आवेदन तिथि नज़दीक है${more ? ` · ${more} और योजनाएं भी जल्द बंद` : ""}। अभी आवेदन करें।` : `Applications close soon${more ? ` · ${more} more closing too` : ""}. Apply now.`,
      url: `${SITE}/?scheme=${encodeURIComponent(s.id)}`,
    };
  }
  // 2 — tracked application waiting 30+ days (repeat at most weekly)
  const due = Object.entries(apps || {})
    .filter(([, a]) => a?.status === "pending" && daysSince(a.lastCheckedAt || a.appliedAt) >= 30)
    .filter(([id]) => !sent[`app:${id}`] || daysSince(sent[`app:${id}`]) >= 7)
    .map(([id, a]) => ({ id, a, s: matched.byId.get(id) }))
    .filter(x => x.s);
  if (due.length) {
    const { id, a, s } = due[0];
    const d = daysSince(a.appliedAt);
    return {
      key: `app:${id}`, marks: [`app:${id}`],
      title: hi ? `🔔 अपने आवेदन की स्थिति जांचें` : `🔔 Time to check your application`,
      body: hi ? `${name(s)} — ${d} दिन पहले आवेदन किया${a.ref ? ` (रेफ़. ${a.ref})` : ""}। स्थिति जांचकर ऐप में अपडेट करें।` : `${name(s)} — applied ${d} days ago${a.ref ? ` (ref. ${a.ref})` : ""}. Check the status and update it in the app.`,
      url: `${SITE}/?scheme=${encodeURIComponent(id)}`,
    };
  }
  // 3 — new scheme that matches
  const fresh = newSchemes.filter(s => matched.ids.has(s.id) && !sent[`new:${s.id}`]);
  if (fresh.length) {
    const s = fresh[0];
    return {
      key: `new:${s.id}`, marks: fresh.map(x => `new:${x.id}`),
      title: hi ? `🆕 नई योजना जिसके आप पात्र हो सकते हैं` : `🆕 New scheme you may qualify for`,
      body: `${name(s)}${fresh.length > 1 ? (hi ? ` · और ${fresh.length - 1}` : ` · +${fresh.length - 1} more`) : ""}`,
      url: `${SITE}/?scheme=${encodeURIComponent(s.id)}`,
    };
  }
  return null;
}

// Called from runDeadlineAlerts. Never throws.
export async function runPushReminders({ db, schemes, newSchemes = [], buildProfileAnswers, daysUntil }) {
  const out = { subscribers: 0, sent: 0, removed: 0, failed: 0, skipped: 0 };
  try {
    if (!vapidKeys()) return { ...out, error: "no VAPID keys" };
    const subject = `mailto:${process.env.GMAIL_USER || "yojanasahayofficial@gmail.com"}`;
    const subsSnap = await db.collection("pushSubs").get();
    for (const doc of subsSnap.docs) {
      const data = doc.data() || {};
      const subs = Array.isArray(data.subs) ? data.subs : [];
      if (!subs.length) continue;
      out.subscribers++;
      try {
        const uid = doc.id;
        const [userSnap, appsSnap] = await Promise.all([
          db.collection("users").doc(uid).get(),
          db.collection("userApplications").doc(uid).get(),
        ]);
        const answers = userSnap.exists ? buildProfileAnswers(userSnap.data()) : null;
        const matchedList = answers ? schemes.filter(s => { try { return audienceOk(s, answers) && s.match(answers); } catch { return false; } }) : [];
        const matched = Object.assign(matchedList, {
          ids: new Set(matchedList.map(s => s.id)),
          byId: new Map(schemes.map(s => [s.id, s])), // tracked apps may be for any scheme
        });
        const sent = data.sent || {};
        const n = pickNotification({ hi: data.lang === "hi", matched, apps: appsSnap.exists ? appsSnap.data()?.apps : {}, newSchemes, sent, daysUntil });
        if (!n) { out.skipped++; continue; }

        const payload = JSON.stringify({ title: n.title, body: n.body, url: n.url, tag: n.key });
        const alive = [];
        let delivered = false;
        for (const sub of subs) {
          try {
            await sendWebPush(sub, payload, { TTL: 60 * 60 * 24, urgency: "normal", subject });
            delivered = true; alive.push(sub);
          } catch (e) {
            if (e?.statusCode === 404 || e?.statusCode === 410) out.removed++; // subscription gone → drop it
            else { out.failed++; alive.push(sub); }
          }
        }
        const now = new Date().toISOString();
        const update = { subs: alive, lastPushAt: delivered ? now : (data.lastPushAt ?? null) };
        if (delivered) {
          update.sent = { ...sent };
          for (const m of n.marks) update.sent[m] = now;
          // keep the map small
          const entries = Object.entries(update.sent).sort((a, b) => String(b[1]).localeCompare(String(a[1]))).slice(0, 300);
          update.sent = Object.fromEntries(entries);
          out.sent++;
        }
        await doc.ref.update(update); // replaces `sent` whole, so the trim sticks
      } catch (e) {
        out.failed++;
        console.warn("[push] user failed:", e?.message);
      }
    }
  } catch (e) {
    out.error = e?.message || String(e);
  }
  return out;
}
