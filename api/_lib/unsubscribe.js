// api/_lib/unsubscribe.js — Yojana Sahay · e-mail unsubscribe links
// ─────────────────────────────────────────────────────────────────────────────
// Every reminder e-mail carries a personal link
//   https://yojanasahay.vercel.app/unsubscribe?u=<uid>&t=<token>
// (vercel.json → /api/log-checker-run?action=unsubscribe) plus the standard
// List-Unsubscribe headers, so Gmail / Outlook show their own one-tap
// "Unsubscribe" button (RFC 8058). The token is an HMAC of the user id with a
// key derived from the server's Firebase key: it can't be guessed or reused for
// someone else, needs no database lookup and no extra setting in Vercel.
// Unsubscribing sets users/<uid>.emailAlerts = false — the same switch as
// Profile → E-mail reminders, which the daily alerts already respect.
import { createHmac, createHash, timingSafeEqual } from "crypto";

const SITE = "https://yojanasahay.vercel.app";

function key() {
  const base = process.env.UNSUBSCRIBE_SECRET || process.env.FIREBASE_PRIVATE_KEY || "";
  if (!base) throw new Error("no server key for unsubscribe links");
  return createHash("sha256").update("ys-unsubscribe-v1:" + base).digest();
}

export function unsubToken(uid) {
  return createHmac("sha256", key()).update(String(uid)).digest("base64url").slice(0, 32);
}

export function checkUnsubToken(uid, token) {
  try {
    if (!/^[A-Za-z0-9]{6,128}$/.test(String(uid || "")) || typeof token !== "string") return false;
    const a = Buffer.from(unsubToken(uid)), b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}

export function unsubUrl(uid) {
  return `${SITE}/unsubscribe?u=${encodeURIComponent(uid)}&t=${unsubToken(uid)}`;
}

/** extra nodemailer fields for every reminder e-mail to this user */
export function unsubHeaders(uid) {
  const url = unsubUrl(uid);
  return {
    headers: {
      "List-Unsubscribe": `<${url}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

/** footer shown at the bottom of every reminder e-mail */
export function unsubFooterHtml(uid) {
  return `
      <p style="font-size:10.5px;color:#999;margin:12px 0 0;line-height:1.5;">
        You get these e-mails because e-mail reminders are on in your Yojana Sahay profile.<br>
        <a href="${unsubUrl(uid)}" style="color:#6B7280;text-decoration:underline;">Unsubscribe from reminder e-mails</a>
        &nbsp;·&nbsp; or turn them off any time in the app: Profile → E-mail reminders.
      </p>
      <p style="font-size:10px;color:#aaa;margin:8px 0 0;">Yojana Sahay is an independent, free guide — not a government app.</p>`;
}

// ── The page people see after tapping the link ───────────────────────────────
function page(title, body, form = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} — Yojana Sahay</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F3F4F8;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111827;padding:20px;box-sizing:border-box}
  .c{max-width:420px;width:100%;background:#fff;border-radius:20px;padding:28px 24px;box-shadow:0 10px 40px rgba(6,3,141,.1);text-align:center}
  .bar{height:5px;border-radius:5px;background:linear-gradient(90deg,#FF9933,#FF6B6B,#7C5CFF);margin:-6px auto 20px;width:72px}
  h1{font-size:20px;margin:0 0 10px} p{font-size:14.5px;line-height:1.55;color:#4B5563;margin:0 0 14px}
  button,a.b{display:inline-block;border:0;border-radius:12px;padding:12px 20px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;margin:4px}
  .p{background:#06038D;color:#fff} .s{background:#EEF0FF;color:#06038D} small{display:block;color:#9CA3AF;font-size:12px;margin-top:16px}
</style></head><body><div class="c"><div class="bar"></div><h1>${title}</h1>${body}${form}
<small>Yojana Sahay · independent free guide — not a government app</small></div></body></html>`;
}

/**
 * GET  /unsubscribe?u&t            → asks to confirm (link checkers that open
 *                                    links on their own never unsubscribe anyone)
 * POST /unsubscribe?u&t            → unsubscribes (button above, or Gmail's
 *                                    one-tap "List-Unsubscribe=One-Click")
 * POST /unsubscribe?u&t&on=1       → turns reminder e-mails back on
 */
export async function handleUnsubscribe(req, res, db) {
  const q = req.query || {};
  const uid = String(q.u || ""), token = String(q.t || "");
  const send = (code, html) => { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.status(code).send(html); };
  if (!checkUnsubToken(uid, token)) {
    return send(400, page("Link not valid", "<p>This unsubscribe link is incomplete or has expired. You can turn reminder e-mails off in the app: <b>Profile → E-mail reminders</b>.</p>", `<a class="b p" href="${SITE}">Open Yojana Sahay</a>`));
  }
  const self = `/unsubscribe?u=${encodeURIComponent(uid)}&t=${encodeURIComponent(token)}`;
  if (req.method === "GET") {
    return send(200, page("Stop reminder e-mails?",
      "<p>You won't get scheme deadline reminders or new-scheme e-mails from Yojana Sahay any more. Your account and saved details stay as they are.</p>",
      `<form method="post" action="${self}"><button class="p" type="submit">Yes, unsubscribe</button></form><a class="b s" href="${SITE}">Keep them</a>`));
  }
  if (req.method !== "POST") return send(405, page("Not allowed", "<p>Please use the link from the e-mail.</p>"));
  const on = String(q.on || "") === "1";
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (snap.exists) await ref.set({ emailAlerts: on, emailAlertsChangedAt: new Date(), emailAlertsChangedVia: "email-link" }, { merge: true });
  if (on) {
    return send(200, page("Reminder e-mails are on again",
      "<p>You'll get an e-mail when a scheme you qualify for is about to close, or a new one is added.</p>",
      `<a class="b p" href="${SITE}">Open Yojana Sahay</a>`));
  }
  return send(200, page("You're unsubscribed",
    "<p>You won't get reminder e-mails from Yojana Sahay any more. Changed your mind? Turn them back on below, or any time in the app under <b>Profile → E-mail reminders</b>.</p>",
    `<form method="post" action="${self}&on=1"><button class="s" type="submit">Turn reminder e-mails back on</button></form>`));
}
