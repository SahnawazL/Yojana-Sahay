/**
 * /api/deadline-alerts.js  —  Yojana Sahay
 *
 * Merged endpoint — replaces the old separate
 * api/send-deadline-alerts.js (cron) + api/admin-send-deadline-alerts.js (admin),
 * combined into ONE file to save a Serverless Function slot on the Vercel
 * Hobby plan (max 12 functions per deployment).
 *
 * GET  → admin-only: returns the last 20 runs from deadlineAlertRuns
 *         (requires Authorization: Bearer <Firebase ID token>, role === "admin")
 *
 * POST → admin/cron actions, routed by req.body.action:
 *   (no action / default) → triggers a deadline-alert run immediately. Two ways in:
 *     1. Vercel Cron (automatic daily) — identified by the "x-vercel-cron" header
 *        or a matching CRON_SECRET bearer token. Runs as trigger: "cron".
 *     2. Admin manual trigger from the Deadlines tab — identified by a valid
 *        Firebase ID token belonging to an admin. Runs as trigger: "manual".
 *   action: "draft" → admin-only. { toName, toEmail, notes, lang } → Groq drafts
 *        { subject, body } from admin-supplied facts (see AI Compose block below).
 *   action: "send"  → admin-only. { toName, toEmail, subject, body, lang } →
 *        sends the (admin-approved) email via Gmail, logs to adminCustomEmails.
 *
 * vercel.json cron entry should point here:
 *   { "path": "/api/deadline-alerts", "schedule": "0 5 * * *" }
 *
 * No new env vars needed — reuses FIREBASE_*, GMAIL_USER, GMAIL_APP_PASSWORD,
 * GROQ_* keys, and (optionally) CRON_SECRET for manual cron testing via curl.
 */

import { getAdminDb, getAdminAuth, recordAiCall }        from "./_lib/firebaseAdmin.js";
import { runDeadlineAlerts, DAILY_EMAIL_LIMIT } from "./_lib/deadlineAlerts.js";
import { getNextStartIdx }      from "./_lib/groqRotation.js";
import { logApiCallToHistory }  from "./_lib/apiCallHistory.js";
import { FieldValue }           from "firebase-admin/firestore";
import nodemailer               from "nodemailer";

// ═══════════════════════════════════════════════════════════════════════════
// AI Compose & Send — folded into this same file (not a separate function)
// to stay within the Vercel Hobby plan's 12-serverless-function limit.
// Reuses the identical Groq key-rotation pattern as _lib/deadlineAlerts.js.
//
// Hallucination guard: Groq is ONLY asked to write the framing/tone around
// facts the admin already typed into `notes` — it never invents scheme
// names, amounts, dates, or eligibility details.
// ═══════════════════════════════════════════════════════════════════════════

const GROQ_ENDPOINT     = "https://api.groq.com/openai/v1/chat/completions";
const COMPOSE_AI_MODEL  = "openai/gpt-oss-20b";
// gpt-oss-20b is a reasoning model — it spends part of the token budget on
// hidden chain-of-thought BEFORE writing the visible answer. The intro-line
// generator elsewhere in this codebase uses max_tokens:80 and gets away with
// it only because it silently falls back to a default sentence if Groq comes
// back empty. We need an actual subject+body, so we give it real headroom
// AND cap reasoning effort so it doesn't burn the whole budget "thinking".
const COMPOSE_MAX_TOKENS       = 900;
const COMPOSE_TEMPERATURE      = 0.6;
const COMPOSE_REASONING_EFFORT = "low"; // "low" | "medium" | "high" — low leaves more budget for the actual reply

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

async function generateEmailDraft({ toName, notes, lang }) {
  const keys = loadGroqKeys();
  if (keys.length === 0) return { error: "No Groq API keys configured" };
  const isHindi = lang === "hi";

  const system = isHindi
    ? `आप YojanaSahay (भारतीय सरकारी योजना खोज ऐप) की आधिकारिक टीम की ओर से ईमेल लिखते हैं। आपको केवल वही तथ्य उपयोग करने हैं जो एडमिन नोट्स में दिए गए हैं — कभी भी कोई योजना का नाम, राशि, तारीख या पात्रता विवरण न बनाएं जो नोट्स में नहीं है। भाषा गर्मजोशी भरी, पेशेवर और संक्षिप्त हो (80-150 शब्द)। अपने पूरे उत्तर को केवल एक मान्य JSON ऑब्जेक्ट के रूप में दें, बिना किसी अतिरिक्त टेक्स्ट, व्याख्या या मार्कडाउन कोड-फेंस के, ठीक इस प्रारूप में: {"subject": "...", "body": "..."} — body में पैराग्राफ के बीच खाली लाइन (\\n\\n) हो।`
    : `You write emails on behalf of the official YojanaSahay team (an Indian government scheme discovery app). Use ONLY the facts given in the admin's notes below — never invent scheme names, amounts, dates, or eligibility details that aren't in the notes. Keep it warm, professional, and concise (80-150 words). Respond with your ENTIRE reply as a single valid JSON object, with no extra text, explanation, or markdown code fences, in exactly this shape: {"subject": "...", "body": "..."} — body should use blank lines (\\n\\n) between paragraphs, no markdown, and should end with a soft invitation to open the YojanaSahay app.`;

  const user = isHindi
    ? `उपयोगकर्ता का नाम: ${toName || "उपयोगकर्ता"}\nएडमिन के नोट्स (केवल यही तथ्य उपयोग करें): ${notes}`
    : `User's name: ${toName || "there"}\nAdmin's notes (use ONLY these facts): ${notes}`;

  // NOTE: deliberately NOT sending response_format:{type:"json_object"} — not
  // every Groq-hosted model honours that param the same way, and a rejected
  // param would fail every key identically. We just ask firmly for JSON in
  // the prompt and parse defensively below (stripping code fences etc).
  const { status, data, keyIdx, count429 } = await callGroq(keys, {
    model: COMPOSE_AI_MODEL,
    max_tokens: COMPOSE_MAX_TOKENS,
    temperature: COMPOSE_TEMPERATURE,
    reasoning_effort: COMPOSE_REASONING_EFFORT,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  if (status !== 200) {
    // Surface the REAL upstream reason instead of a generic message, so a
    // failure is self-diagnosing from the dashboard/logs next time.
    const upstreamMsg = data?.error?.message || data?.error?.details?.message || JSON.stringify(data?.error || data).slice(0, 200);
    console.error("[deadline-alerts] Groq draft call failed:", status, upstreamMsg);
    return { error: `AI draft generation failed (${status}): ${upstreamMsg}` };
  }

  recordAiCall({ service: "groq-verify", keyIdx, count429 }).catch(() => {});
  logApiCallToHistory("groqVerifyCalls").catch(() => {});

  const raw = data?.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    const finishReason = data?.choices?.[0]?.finish_reason;
    console.error("[deadline-alerts] Groq returned empty content. finish_reason:", finishReason, "full choice:", JSON.stringify(data?.choices?.[0]).slice(0, 300));
    const hint = finishReason === "length"
      ? " (model ran out of tokens — try again, this should be rarer now with a higher token budget)"
      : "";
    return { error: `AI returned an empty response — try again${hint}` };
  }

  // Defensive JSON extraction: strip ```json fences if present, then fall
  // back to grabbing the first {...} block in case the model added any
  // stray text before/after the JSON despite instructions.
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace  = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed.subject || !parsed.body) {
      console.error("[deadline-alerts] Groq JSON missing subject/body:", raw.slice(0, 300));
      return { error: "AI response was missing subject/body — try again" };
    }
    return { subject: String(parsed.subject).trim(), body: String(parsed.body).trim() };
  } catch (err) {
    console.error("[deadline-alerts] Could not parse Groq response as JSON:", raw.slice(0, 300));
    return { error: "Could not parse AI response — try again, or write the email manually" };
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildBrandedHtml(bodyText, isHindi = false) {
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="font-size:13px;color:#333;margin:0 0 12px;line-height:1.6;">${escapeHtml(p)}</p>`)
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#FF9933,#138808);padding:18px 20px;border-radius:10px 10px 0 0;">
      <h2 style="color:#fff;margin:0;font-size:18px;">📩 ${isHindi ? "योजना सहाय टीम की ओर से" : "A note from Team Yojana Sahay"}</h2>
    </div>
    <div style="padding:18px 20px 6px;background:#fff;">
      ${paragraphs}
    </div>
    <div style="padding:16px 20px;background:#fafafa;border-radius:0 0 10px 10px;text-align:center;">
      <a href="https://yojanasahay.vercel.app" style="display:inline-block;background:#06038D;color:#fff;
        text-decoration:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;">
        ${isHindi ? "Yojana Sahay खोलें" : "Open Yojana Sahay"}
      </a>
      <p style="font-size:10.5px;color:#999;margin-top:12px;">
        ${isHindi ? "यह ईमेल Yojana Sahay टीम द्वारा व्यक्तिगत रूप से भेजा गया है।" : "This email was sent to you personally by the Yojana Sahay team."}
      </p>
    </div>
  </div>`;
}

function getTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD not configured in env vars.");
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

// ── Verify the caller is an admin via Firebase ID token ────────────────────
async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"] ?? "";
  const idToken    = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!idToken) return { ok: false, status: 401, error: "Missing Authorization header" };

  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(idToken);
  } catch (err) {
    console.error("[deadline-alerts] Token verification failed:", err.code ?? err.message);
    return { ok: false, status: 401, error: "Invalid or expired auth token" };
  }

  try {
    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(decodedToken.uid).get();
    if (!userSnap.exists) return { ok: false, status: 403, error: "User not found" };

    const data    = userSnap.data() ?? {};
    const isAdmin = data.role === "admin" || data.isAdmin === true;
    if (!isAdmin) {
      console.warn("[deadline-alerts] Non-admin attempted access:", decodedToken.email);
      return { ok: false, status: 403, error: "Forbidden — admin access required" };
    }
    return { ok: true, db, email: decodedToken.email ?? decodedToken.uid };
  } catch (err) {
    console.error("[deadline-alerts] Firestore role check failed:", err.message);
    return { ok: false, status: 500, error: "Role verification failed" };
  }
}

// ── Is this a legitimate Vercel Cron invocation? ────────────────────────────
function isCronRequest(req) {
  const isVercelCron  = req.headers["x-vercel-cron"] === "1";
  const cronSecret    = process.env.CRON_SECRET?.trim();
  const authHeader     = req.headers["authorization"] ?? "";
  const secretMatches  = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;
  return isVercelCron || secretMatches;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
  }

  // ── GET — admin-only run history ──────────────────────────────────────────
  if (req.method === "GET") {
    const auth = await verifyAdmin(req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    try {
      const snap = await auth.db.collection("deadlineAlertRuns")
        .orderBy("runAt", "desc")
        .limit(20)
        .get();

      const runs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          trigger:     data.trigger,
          triggeredBy: data.triggeredBy,
          runAt:       data.runAt?.toDate?.().toISOString() ?? null,
          checked:     data.checked,
          sent:        data.sent,
          skipped:     data.skipped,
          recipients:  data.recipients ?? [],
          quotaUsed:   data.quotaUsed ?? null,
          quotaLimit:  data.quotaLimit ?? null,
          quotaHit:    data.quotaHit ?? false,
        };
      });

      // Live daily quota — independent of any single run, so the admin tab can
      // show "X / 450 sent today" even between runs.
      const todayKey  = new Date().toISOString().slice(0, 10);
      const quotaSnap = await auth.db.collection("emailQuota").doc(todayKey).get();
      const todayQuota = {
        used:  quotaSnap.exists ? (quotaSnap.data().count || 0) : 0,
        limit: DAILY_EMAIL_LIMIT,
      };

      return res.status(200).json({ runs, todayQuota });
    } catch (err) {
      console.error("[deadline-alerts] Failed to fetch history:", err.message);
      return res.status(500).json({ error: "Could not load run history" });
    }
  }

  // ── POST — cron run, or an authenticated admin action ───────────────────
  if (isCronRequest(req)) {
    try {
      const result = await runDeadlineAlerts({ trigger: "cron", triggeredBy: null });
      return res.status(200).json(result);
    } catch (err) {
      console.error("[deadline-alerts] Cron run failed:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Not a cron request — everything below requires an authenticated admin
  const auth = await verifyAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const { action, toName, toEmail, notes, subject, body, lang } = req.body || {};

  // ── action: "draft" — Groq writes subject+body from the admin's notes ────
  if (action === "draft") {
    if (!toEmail || !/^\S+@\S+\.\S+$/.test(toEmail)) {
      return res.status(400).json({ error: "Valid toEmail is required" });
    }
    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: "notes is required to generate a draft" });
    }
    const result = await generateEmailDraft({ toName, notes, lang });
    if (result.error) return res.status(502).json({ error: result.error });
    return res.status(200).json(result);
  }

  // ── action: "send" — sends the admin-approved draft via Gmail ─────────────
  // Shares the SAME daily quota counter (emailQuota/{dateKey}) as the cron job,
  // so a busy day of AI-composed emails can't push total sends past Gmail's
  // real ~500/day cap alongside the automated alerts.
  if (action === "send") {
    if (!toEmail || !/^\S+@\S+\.\S+$/.test(toEmail)) {
      return res.status(400).json({ error: "Valid toEmail is required" });
    }
    if (!subject || !subject.trim()) return res.status(400).json({ error: "subject is required" });
    if (!body || !body.trim())       return res.status(400).json({ error: "body is required" });

    const dateKey  = new Date().toISOString().slice(0, 10);
    const quotaRef = auth.db.collection("emailQuota").doc(dateKey);

    try {
      const quotaSnap = await quotaRef.get();
      const quotaUsed = quotaSnap.exists ? (quotaSnap.data().count || 0) : 0;
      if (quotaUsed >= DAILY_EMAIL_LIMIT) {
        return res.status(429).json({ error: `Daily email quota reached (${quotaUsed}/${DAILY_EMAIL_LIMIT}). Try again after midnight IST, or wait for tomorrow's quota reset.` });
      }

      const transporter = getTransporter();
      const html = buildBrandedHtml(body, lang === "hi");

      await transporter.sendMail({
        from: `"Yojana Sahay" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject,
        html,
      });

      // Same increment pattern as the cron job — write immediately after a
      // successful send so a crash mid-request never loses count.
      await quotaRef.set(
        { count: FieldValue.increment(1), lastUpdated: FieldValue.serverTimestamp() },
        { merge: true }
      );

      await auth.db.collection("adminCustomEmails").add({
        toName: toName || null,
        toEmail,
        subject,
        body,
        lang: lang || "en",
        sentBy: auth.email || null,
        sentAt: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ success: true, sentAt: new Date().toISOString() });
    } catch (err) {
      console.error("[deadline-alerts] Custom email send failed:", err.message);
      return res.status(500).json({ error: err.message || "Failed to send email" });
    }
  }

  // ── default (no action, or action: "run") — manual deadline-alert trigger ─
  try {
    const result = await runDeadlineAlerts({ trigger: "manual", triggeredBy: auth.email });
    return res.status(200).json(result);
  } catch (err) {
    console.error("[deadline-alerts] Manual run failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
