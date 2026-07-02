// api/_lib/deadlineAlerts.js — Yojana Sahay · Deadline Alert Core Logic
// ─────────────────────────────────────────────────────────────────────────────
// Shared logic used by api/deadline-alerts.js, which handles both:
//   • the automatic daily Vercel Cron trigger
//   • the manual "Send Alerts Now" trigger from AdminDashboard
// (both paths call runDeadlineAlerts() below, so they always behave identically
// and both get logged the same way)
//
// Official sender: yojanasahayofficial@gmail.com (set via GMAIL_USER env var)
//
// ENV VARS needed:
//   GMAIL_USER            — yojanasahayofficial@gmail.com
//   GMAIL_APP_PASSWORD    — 16-char Gmail App Password (Google Account → Security →
//                           2-Step Verification → App passwords)
// Already-existing env vars reused: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
// FIREBASE_PRIVATE_KEY (all read internally by _lib/firebaseAdmin.js)
//
// npm package needed: nodemailer  ("nodemailer": "^6.9.0" in package.json)
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminDb, recordAiCall } from "./firebaseAdmin.js";
import { getNextStartIdx }          from "./groqRotation.js";
import { logApiCallToHistory }      from "./apiCallHistory.js";
import { FieldValue }  from "firebase-admin/firestore";
import nodemailer      from "nodemailer";
import { SCHEME_DB }   from "../../src/schemesData.js";

const DAYS_WINDOW           = 7;  // first alert: deadline within this many days
const URGENT_DAYS           = 2;  // second, more urgent reminder if still not applied by this point
const MAX_SCHEMES_PER_EMAIL = 6;  // keep the digest readable
const RUN_LOG_KEEP          = 30; // trim deadlineAlertRuns to the latest N runs

// ── Daily Gmail sending-limit safeguard ────────────────────────────────────────
// A free/personal Gmail account (not Workspace) caps out around 500 recipients
// per rolling 24h. We stay well under that with our own hard limit, tracked in
// Firestore so it persists across runs (cron + manual) on the same calendar day.
export const DAILY_EMAIL_LIMIT = 450; // safety buffer below Gmail's real ~500/day cap

// UTC calendar day as YYYY-MM-DD. This is an approximation of Gmail's own reset
// window (which isn't a fixed public boundary) — good enough as our own safety
// margin, not a claim of matching Gmail's exact reset time.
function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10); // "2026-07-02"
}

// ── AI-personalized intro line — same fast model as refresh-news/verify-scheme ─
const GROQ_ENDPOINT  = "https://api.groq.com/openai/v1/chat/completions";
const AI_MODEL       = "openai/gpt-oss-20b"; // fast + cheap, one short sentence per user
const AI_MAX_TOKENS  = 80;
const AI_TEMPERATURE = 0.6; // a little warmth, still fast and on-topic

// ── Load Groq keys — dedicated verify pool first, same key-rotation pattern used elsewhere ─
function loadGroqKeys() {
  const seen = new Set();
  const keys = [];
  const verifyCandidates = [process.env.GROQ_VERIFY_KEY, process.env.GROQ_VERIFY_KEY_1, process.env.GROQ_VERIFY_KEY_2];
  for (const k of verifyCandidates) {
    const t = k && k.trim();
    if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
  }
  if (keys.length === 0) {
    const fallback = [
      process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_1, process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3, process.env.GROQ_API_KEY_4, process.env.GROQ_API_KEY_5,
    ];
    for (const k of fallback) {
      const t = k && k.trim();
      if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
    }
  }
  return keys;
}

function isKeyLevelFailure(status, errData) {
  if (status === 401) return true;
  const code = errData?.error?.code;
  return code === "organization_restricted" || code === "invalid_api_key";
}

async function callGroq(keys, bodyObject) {
  let lastError = null, count429 = 0;
  const n = keys.length;
  const startIdx = await getNextStartIdx(n);

  for (let offset = 0; offset < n; offset++) {
    const i = (startIdx + offset) % n;
    const key = keys[i];
    try {
      const groqRes = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify(bodyObject),
      });
      if (groqRes.status === 429) {
        const errData = await groqRes.json().catch(() => ({}));
        lastError = errData; count429++;
        continue;
      }
      const data = await groqRes.json();
      if (isKeyLevelFailure(groqRes.status, data)) { lastError = data; continue; }
      return { status: groqRes.status, data, keyIdx: i, count429 };
    } catch (err) {
      lastError = { message: err.message };
    }
  }
  return { status: 429, data: { error: { message: "All Groq keys exhausted", details: lastError } }, keyIdx: -1, count429 };
}

// ── Generate one warm, short personalized line for the email intro ────────────
// Falls back to null on any failure — caller uses a plain default line instead.
// Keeps the app running even if Groq is briefly unavailable or rate-limited.
async function generatePersonalizedIntro(keys, name, topScheme, days, isHindi, isReminder = false) {
  if (keys.length === 0) return null;
  try {
    const prompt = isHindi
      ? (isReminder
          ? `उपयोगकर्ता का नाम: ${name || "नागरिक"}. यह उन्हें ${topScheme} योजना के बारे में दूसरी और अंतिम याद दिलाना है — आवेदन की अंतिम तिथि केवल ${days} दिन में है और उन्होंने अभी तक आवेदन नहीं किया। एक छोटा, तत्काल लेकिन विनम्र वाक्य लिखें (अधिकतम 20 शब्द) जो नाम से संबोधित करे। केवल वाक्य लिखें, कुछ और नहीं।`
          : `उपयोगकर्ता का नाम: ${name || "नागरिक"}. उनकी सबसे जरूरी योजना: ${topScheme}, आवेदन की अंतिम तिथि ${days} दिन में। एक छोटा, गर्मजोशी भरा वाक्य लिखें (अधिकतम 20 शब्द) जो उन्हें नाम से संबोधित करे और आवेदन करने के लिए प्रोत्साहित करे। केवल वाक्य लिखें, कुछ और नहीं।`)
      : (isReminder
          ? `User's name: ${name || "there"}. This is a SECOND and FINAL reminder about the ${topScheme} scheme — deadline is only ${days} day${days === 1 ? "" : "s"} away and they still haven't applied. Write one short, urgent-but-polite sentence (max 20 words) addressing them by name. Only output the sentence, nothing else.`
          : `User's name: ${name || "there"}. Their most urgent scheme: ${topScheme}, deadline in ${days} days. Write one short, warm sentence (max 20 words) addressing them by name and encouraging them to apply now. Only output the sentence, nothing else.`);

    const { status, data, keyIdx, count429 } = await callGroq(keys, {
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      temperature: AI_TEMPERATURE,
      messages: [
        { role: "system", content: "You write single, warm, encouraging sentences for a government welfare app. No markdown, no quotes, just plain text." },
        { role: "user", content: prompt },
      ],
    });

    if (status === 200) {
      recordAiCall({ service: "groq-verify", keyIdx, count429 }).catch(() => {});
      logApiCallToHistory("groqVerifyCalls").catch(() => {});
      const text = data?.choices?.[0]?.message?.content?.trim();
      return text || null;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Gmail SMTP transporter ─────────────────────────────────────────────────────
function getTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD not configured in env vars.");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

// ── Build the profileAnswers object exactly like App.jsx does ─────────────────
function buildProfileAnswers(profile) {
  if (!profile || !profile.occupation) return null;
  return {
    who:    profile.occupation,
    income: profile.income,
    house:  profile.house,
    age:    profile.age,
    area:   profile.area,
    state:  profile.state,
    caste:  profile.caste,
    ...(profile.occupation === "farmer"  && profile.landHolding    ? { landHolding: profile.landHolding }       : {}),
    ...(profile.occupation === "student" && profile.educationLevel ? { educationLevel: profile.educationLevel } : {}),
    ...(profile.income === "below1"      && profile.ration         ? { rationCard: profile.ration }             : {}),
  };
}

// ── Days until a scheme's lastDate (null if no date or already passed) ────────
function daysUntil(lastDate) {
  if (!lastDate) return null;
  const target = new Date(lastDate).getTime();
  if (Number.isNaN(target)) return null;
  const diff = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

// ── Resolve the final intro line — AI text if it succeeded, else a plain default ──
// Shared by buildEmailHtml() and the recipient log, so what's LOGGED always matches
// exactly what was actually SENT.
function resolveIntroText(intro, isHindi = false) {
  return intro
    || (isHindi
      ? "आपकी योग्य योजनाओं की अंतिम तिथि नजदीक आ रही है — अभी आवेदन करें।"
      : "Schemes you qualify for are closing soon — apply now to avoid missing out.");
}

// ── Build the HTML email body ──────────────────────────────────────────────────
// intro: AI-generated personalized sentence (or null → falls back to a plain default)
// schemes: [{ scheme, days, isReminder }] — isReminder = true means this is the
// second, more urgent nudge (already alerted once before, now very close to deadline)
function buildEmailHtml(schemes, intro, isHindi = false) {
  const rows = schemes.map(({ scheme, days, isReminder }) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;">
        <div style="font-weight:700;font-size:14px;color:#111;">
          ${scheme.icon || "📋"} ${scheme.name?.en || "Scheme"}
          ${isReminder ? `<span style="margin-left:6px;font-size:9.5px;font-weight:800;letter-spacing:0.3px;
            color:#DC2626;background:rgba(220,38,38,0.1);padding:2px 6px;border-radius:20px;">FINAL REMINDER</span>` : ""}
        </div>
        <div style="font-size:12px;color:${days <= 3 ? "#DC2626" : "#EA580C"};margin-top:3px;">
          ${days === 0 ? "Deadline is TODAY" : `Only ${days} day${days === 1 ? "" : "s"} left to apply`}
        </div>
      </td>
    </tr>`).join("");

  const introText = resolveIntroText(intro, isHindi);

  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#FF9933,#138808);padding:18px 20px;border-radius:10px 10px 0 0;">
      <h2 style="color:#fff;margin:0;font-size:18px;">🔔 Scheme Deadline Alert</h2>
      <p style="color:#fff;opacity:0.9;margin:4px 0 0;font-size:12px;">Yojana Sahay — schemes you qualify for are closing soon</p>
    </div>
    <div style="padding:14px 20px 4px;background:#fff;">
      <p style="font-size:13px;color:#333;margin:0;line-height:1.5;">${introText}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;">
      ${rows}
    </table>
    <div style="padding:16px 20px;background:#fafafa;border-radius:0 0 10px 10px;text-align:center;">
      <a href="https://yojanasahay.vercel.app" style="display:inline-block;background:#06038D;color:#fff;
        text-decoration:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;">
        Open Yojana Sahay to Apply
      </a>
      <p style="font-size:10.5px;color:#999;margin-top:12px;">
        You're receiving this because you're signed in to Yojana Sahay and match these schemes.
      </p>
    </div>
  </div>`;
}

// ── Main runner — used by both the cron endpoint and the admin trigger ────────
// trigger: "cron" | "manual"
// triggeredBy: admin email string when trigger === "manual", else null
export async function runDeadlineAlerts({ trigger = "cron", triggeredBy = null } = {}) {
  const db          = getAdminDb();
  const transporter = getTransporter(); // throws early if env vars missing
  const groqKeys    = loadGroqKeys();   // empty array → generatePersonalizedIntro no-ops, template falls back automatically

  // ── Daily quota check-in ────────────────────────────────────────────────────
  const dateKey     = getTodayDateKey();
  const quotaRef    = db.collection("emailQuota").doc(dateKey);
  const quotaSnap    = await quotaRef.get();
  let quotaUsed      = quotaSnap.exists ? (quotaSnap.data().count || 0) : 0;
  let quotaHit        = false; // true once we start refusing sends this run

  let checked = 0, sent = 0, skipped = 0;
  const recipients = [];

  const usersSnap = await db.collection("users").get();

  for (const userDoc of usersSnap.docs) {
    checked++;
    const profile = userDoc.data();
    const email   = profile.email;
    if (!email) { skipped++; continue; }

    const profileAnswers = buildProfileAnswers(profile);
    if (!profileAnswers) { skipped++; continue; }

    // Two separate tracking arrays on the user doc:
    //   alertedSchemeIds       — has EVER been sent a first alert for this scheme
    //   urgentAlertedSchemeIds — has been sent the closer-to-deadline final reminder
    const alreadyStandardAlerted = new Set(profile.alertedSchemeIds || []);
    const alreadyUrgentAlerted   = new Set(profile.urgentAlertedSchemeIds || []);

    const matched = SCHEME_DB.filter(s => {
      try { return s.match(profileAnswers); } catch { return false; }
    });

    const urgent = matched
      .map(scheme => ({ scheme, days: daysUntil(scheme.lastDate) }))
      .filter(({ scheme, days }) => {
        if (days === null || days > DAYS_WINDOW) return false;
        const isFirstAlert      = !alreadyStandardAlerted.has(scheme.id);
        const isFinalReminder   = alreadyStandardAlerted.has(scheme.id)
          && days <= URGENT_DAYS
          && !alreadyUrgentAlerted.has(scheme.id);
        return isFirstAlert || isFinalReminder;
      })
      .map(({ scheme, days }) => ({
        scheme, days,
        isReminder: alreadyStandardAlerted.has(scheme.id), // true = this is the 2nd, escalated nudge
      }))
      .sort((a, b) => a.days - b.days)
      .slice(0, MAX_SCHEMES_PER_EMAIL);

    if (urgent.length === 0) { skipped++; continue; }

    // ── Daily quota gate — stop sending once we're at the safety limit ────────
    // Don't waste a Groq call generating an intro we won't be able to send.
    if (quotaUsed >= DAILY_EMAIL_LIMIT) {
      quotaHit = true;
      skipped++;
      continue; // not marked as alerted, so they're retried automatically next run
    }

    // ── AI-personalized intro line — falls back to plain default inside buildEmailHtml ──
    // Note: language preference (yojana_lang) lives only in the user's browser localStorage,
    // not on the Firestore profile, so scheduled/manual emails default to English for now.
    const topScheme = urgent[0].scheme.name?.en || urgent[0].scheme.id;
    const intro = await generatePersonalizedIntro(groqKeys, profile.name, topScheme, urgent[0].days, false, urgent[0].isReminder);

    try {
      const hasReminder = urgent.some(u => u.isReminder);
      const subject = hasReminder
        ? `⚠️ Final reminder: ${urgent.length} scheme deadline${urgent.length > 1 ? "s" : ""} closing very soon — Yojana Sahay`
        : `⏳ ${urgent.length} scheme deadline${urgent.length > 1 ? "s" : ""} closing soon — Yojana Sahay`;

      await transporter.sendMail({
        from:    `"Yojana Sahay" <${process.env.GMAIL_USER}>`,
        to:      email,
        subject,
        html:    buildEmailHtml(urgent, intro, false),
      });

      const urgentIdsThisSend = urgent.filter(u => u.days <= URGENT_DAYS).map(u => u.scheme.id);

      const updatePayload = {
        alertedSchemeIds:    FieldValue.arrayUnion(...urgent.map(u => u.scheme.id)),
        lastDeadlineAlertAt: FieldValue.serverTimestamp(),
      };
      // FieldValue.arrayUnion() throws if called with zero elements — only attach
      // this field when there's actually at least one urgent-tier scheme to record.
      if (urgentIdsThisSend.length > 0) {
        updatePayload.urgentAlertedSchemeIds = FieldValue.arrayUnion(...urgentIdsThisSend);
      }
      await userDoc.ref.update(updatePayload);

      // Update the daily quota counter immediately after each successful send,
      // so a crash mid-run never loses count or lets us silently over-send.
      quotaUsed++;
      await quotaRef.set(
        { count: FieldValue.increment(1), lastUpdated: FieldValue.serverTimestamp() },
        { merge: true }
      );

      recipients.push({
        email,
        schemeCount:    urgent.length,
        soonestDays:    urgent[0].days,
        schemes:        urgent.map(u => u.scheme.name?.en || u.scheme.id),
        reminderCount:  urgent.filter(u => u.isReminder).length, // how many were the 2nd, escalated nudge
        aiPersonalized: !!intro,
        introText:      resolveIntroText(intro, false), // exact line the user actually received
      });
      sent++;
    } catch (mailErr) {
      console.error(`[deadlineAlerts] Failed to email ${email}:`, mailErr.message);
      skipped++;
    }
  }

  // ── Log this run to Firestore so the Admin Dashboard can show history ───────
  const runDoc = {
    trigger,
    triggeredBy,
    runAt: FieldValue.serverTimestamp(),
    checked, sent, skipped,
    recipients,
    quotaUsed, quotaLimit: DAILY_EMAIL_LIMIT, quotaHit,
  };
  const runRef = await db.collection("deadlineAlertRuns").add(runDoc);

  // Trim old run logs — keep only the latest RUN_LOG_KEEP
  try {
    const oldRuns = await db.collection("deadlineAlertRuns")
      .orderBy("runAt", "desc")
      .offset(RUN_LOG_KEEP)
      .limit(20)
      .get();
    const batch = db.batch();
    oldRuns.docs.forEach(d => batch.delete(d.ref));
    if (!oldRuns.empty) await batch.commit();
  } catch (trimErr) {
    console.warn("[deadlineAlerts] Run-log trim skipped:", trimErr.message);
  }

  return {
    runId: runRef.id, trigger, triggeredBy, checked, sent, skipped, recipients,
    quotaUsed, quotaLimit: DAILY_EMAIL_LIMIT, quotaHit,
  };
}
