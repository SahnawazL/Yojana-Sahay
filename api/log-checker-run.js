/**
 * POST /api/log-checker-run
 *
 * Writes ALL "appStats/usage" analytics — eligibility-checker runs, search
 * tracking, and state-filter tracking — for BOTH guests and logged-in users.
 * The write type is selected via the `type` field in the POST body:
 *   type: "checker" (default, backward-compatible) | "search" | "state"
 *
 * WHY THIS EXISTS:
 * The old approach had the browser write directly to Firestore. For
 * logged-in users that's simple (they already have a real auth session),
 * but for guests it required silently signing them into an invisible
 * second Firebase Auth session just so Firestore's security rules would
 * accept the write. That extra hop turned out to be fragile in practice —
 * permission-denied errors even with valid anonymous sessions, hard to
 * debug, dependent on Firebase Console settings.
 *
 * This endpoint sidesteps all of that: it runs on the server using
 * firebase-admin, which always has full access and is never subject to
 * client security rules. The browser just POSTs the event details here;
 * no login of any kind is required on the client side for this to work.
 *
 * WHY ONE FILE, NOT THREE:
 * Vercel's free tier caps a project at 12 serverless functions. This file
 * was already the 12th. Rather than add log-search.js / log-state.js and
 * blow past the limit, checker/search/state all share this single handler,
 * dispatched by the `type` field.
 *
 * REQUIRED SETUP: none beyond what /api/stats.js already needs — this
 * reuses the same FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL /
 * FIREBASE_PRIVATE_KEY environment variables already configured in Vercel.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue, FieldPath } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { createHash } from "crypto";

import { appCors } from "./_lib/appCors.js";
function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin credentials in environment variables");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

// Only these fields are ever trusted from the client for a checker run —
// anything else in the request body is ignored, so a malicious guest can't
// inject arbitrary fields into appStats/usage through this endpoint.
const ALLOWED_RUN_FIELDS = [
  "uid", "matchedCount", "state", "who", "income", "age", "area", "gender", "ration",
  "caste", "disability", "groups",
];

// ── Anonymous usage counters (type "events") → appStats/events ──────────
// Only counters are stored — no user ids, names or answers. Each event is
// whitelisted; scheme ids / keys are reduced to [A-Za-z0-9_].
const SCHEME_EVENT_FIELD = {
  scheme_view: "v", apply_click: "a", app_track: "t",
  app_approved: "ok", app_received: "rc", app_rejected: "rj",
};
const EVENT_NAMES = new Set([
  ...Object.keys(SCHEME_EVENT_FIELD),
  "share_result", "share_checklist", "family_add", "push_on", "push_off",
  "quiz_start", "quiz_step", "quiz_done", "quiz_group",
  "near_me", "life_event", "money_cal", "unlock", "money_check",
  "visit", "visit_new",
]);
// visit = one per device per day (k = where it was opened: app / installed / web)
const FEATURE_EVENTS = new Set(["near_me", "life_event", "money_cal", "unlock", "money_check", "visit"]);
const cleanKey = (v, max) => (typeof v === "string" && new RegExp(`^[A-Za-z0-9_]{1,${max}}$`).test(v) ? v : null);
function istDay(d = new Date()) {
  return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

// appStats/usage is ONE Firestore document and every event used to be
// arrayUnion()-ed onto it forever. Firestore caps a document at 1 MiB, so
// after a few thousand events every write — including the checkerTotal
// counter the home screen shows — would start failing permanently. The
// detail arrays now keep only the most recent entries (totals are separate
// counters and keep counting).
const MAX_ENTRIES = { checkerRuns: 1500, schemeSearches: 1500, stateSelections: 1000 };

async function appendCapped(db, ref, arrayField, record, extraUpdates) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const prev = Array.isArray(data[arrayField]) ? data[arrayField] : [];
    const next = prev.concat([record]).slice(-MAX_ENTRIES[arrayField]);
    tx.set(ref, { [arrayField]: next, ...extraUpdates }, { merge: true });
    return data;
  });
}

function safeUid(uid) {
  return typeof uid === "string" && uid.length > 0 && uid.length <= 100 ? uid : "guest_unknown";
}

// A dynamic Firestore field name (stateCount_<state>) is built from client
// input, so it's whitelisted down to letters/digits/underscore only — this
// stops a guest from smuggling a "." or other path-altering character into
// appStats/usage's top-level field list via the state name.
function safeStateKey(state) {
  if (typeof state !== "string") return null;
  const cleaned = state.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "");
  if (!cleaned || cleaned.length > 40) return null;
  return cleaned;
}

export default async function handler(req, res) {
  if (appCors(req, res)) return;   // Android app (api/_lib/appCors.js)
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    // Unrecognized/missing type falls back to "checker" — this is what keeps
    // the original client call (which never sent a `type` field) working
    // completely unchanged.
    const type = ["checker", "search", "state", "events", "flag", "claim", "ai_report", "delete_account", "email_prefs", "admin_delete_user", "admin_ai_reports", "admin_audience"].includes(body.type) ? body.type : "checker";

    const app = getAdminApp();
    const db = getFirestore(app);
    const ref = db.collection("appStats").doc("usage");

    // ── Eligibility checker run ──────────────────────────────────────────
    if (type === "flag") {
      await handleFlag(req, res, body, getFirestore(getAdminApp()), getAdminApp());
      return;
    }
    if (type === "ai_report") {
      await handleAiReport(req, res, body, getFirestore(getAdminApp()), getAdminApp());
      return;
    }
    if (type === "delete_account") {
      await handleDeleteAccount(req, res, getFirestore(getAdminApp()), getAdminApp());
      return;
    }
    if (type === "admin_audience") {
      await handleAdminAudience(req, res, getFirestore(getAdminApp()), getAdminApp());
      return;
    }
    if (type === "admin_ai_reports") {
      await handleAdminAiReports(req, res, body, getFirestore(getAdminApp()));
      return;
    }
    if (type === "admin_delete_user") {
      await handleAdminDeleteUser(req, res, body, getFirestore(getAdminApp()), getAdminApp());
      return;
    }
    if (type === "email_prefs") {
      const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
      let d; try { d = await getAuth(getAdminApp()).verifyIdToken(token); } catch { res.status(401).json({ error: "sign-in required" }); return; }
      await getFirestore(getAdminApp()).collection("users").doc(d.uid).set({ emailAlerts: body.on !== false }, { merge: true });
      res.status(200).json({ ok: true, emailAlerts: body.on !== false });
      return;
    }
    if (type === "claim") {
      await handleClaim(req, res, body, getFirestore(getAdminApp()), getAdminApp());
      return;
    }

    if (type === "checker") {
      const runRecord = {};
      for (const key of ALLOWED_RUN_FIELDS) {
        runRecord[key] = key in body ? body[key] : null;
      }
      for (const key of ALLOWED_RUN_FIELDS) {
        const v = runRecord[key];
        if (v != null && typeof v !== "number") runRecord[key] = String(v).slice(0, 60);
      }
      runRecord.uid = safeUid(runRecord.uid);
      runRecord.matchedCount = Number.isFinite(Number(runRecord.matchedCount)) ? Math.max(0, Math.min(5000, Number(runRecord.matchedCount))) : 0;
      runRecord.ts = new Date().toISOString();

      const before = await appendCapped(db, ref, "checkerRuns", runRecord, {
        checkerTotal: FieldValue.increment(1),
        lastRun: runRecord.ts,
      });
      const checkerTotal = typeof before.checkerTotal === "number" ? before.checkerTotal + 1 : null;

      res.status(200).json({ ok: true, checkerTotal });
      return;
    }

    // ── Anonymous usage counters ─────────────────────────────────────────
    if (type === "events") {
      const list = Array.isArray(body.events) ? body.events.slice(0, 40) : [];
      const day = istDay();
      const upd = { totals: {}, days: { [day]: {} }, schemes: {}, quiz: {}, groups: {} };
      let n = 0;
      const bump = (obj, k) => { obj[k] = (obj[k] || 0) + 1; };
      const counts = { totals: {}, day: {}, schemes: {}, quiz: {}, groups: {}, features: {} };
      for (const ev of list) {
        const e = ev && typeof ev.e === "string" ? ev.e : "";
        if (!EVENT_NAMES.has(e)) continue;
        n++;
        bump(counts.totals, e); bump(counts.day, e);
        const sid = cleanKey(ev.s, 60), k = cleanKey(ev.k, 30);
        if (SCHEME_EVENT_FIELD[e] && sid) {
          counts.schemes[sid] = counts.schemes[sid] || {};
          bump(counts.schemes[sid], SCHEME_EVENT_FIELD[e]);
        }
        if (e === "quiz_start") bump(counts.quiz, "start");
        if (e === "quiz_done") bump(counts.quiz, "done");
        if (e === "quiz_step" && k) bump(counts.quiz, `step_${k}`);
        if (e === "quiz_group" && k) bump(counts.groups, k);
        // Which life event / calendar action / place — for the admin "New features" card.
        if (FEATURE_EVENTS.has(e) && k) { counts.features[e] = counts.features[e] || {}; bump(counts.features[e], k); }
      }
      if (!n) { res.status(200).json({ ok: true, skipped: true }); return; }
      const asInc = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, FieldValue.increment(v)]));
      upd.totals = asInc(counts.totals);
      upd.days[day] = asInc(counts.day);
      upd.schemes = Object.fromEntries(Object.entries(counts.schemes).map(([sid, o]) => [sid, asInc(o)]));
      upd.quiz = asInc(counts.quiz);
      upd.groups = asInc(counts.groups);
      upd.features = Object.fromEntries(Object.entries(counts.features).map(([fe, o]) => [fe, asInc(o)]));
      upd.updatedAt = new Date().toISOString();
      for (const key of ["schemes", "quiz", "groups", "features"]) if (!Object.keys(upd[key]).length) delete upd[key];
      const evRef = db.collection("appStats").doc("events");
      await evRef.set(upd, { merge: true });

      // Keep ~90 days of daily counters (checked now and then, not every call).
      if (Math.random() < 0.03) {
        try {
          const snap = await evRef.get();
          const cutoff = istDay(new Date(Date.now() - 90 * 86400000));
          const old = Object.keys(snap.data()?.days || {}).filter(d => d < cutoff);
          if (old.length) await evRef.update(...old.flatMap(d => [new FieldPath("days", d), FieldValue.delete()]));
        } catch { /* ignore */ }
      }
      res.status(200).json({ ok: true, counted: n });
      return;
    }

    // ── Search query tracking ────────────────────────────────────────────
    if (type === "search") {
      const q = typeof body.q === "string" ? body.q.trim().slice(0, 200) : "";
      if (!q) {
        res.status(200).json({ ok: true, skipped: true });
        return;
      }
      const record = { q, uid: safeUid(body.uid), ts: new Date().toISOString() };
      // How many schemes the search found — 0 means people look for something we don't have.
      if (typeof body.n === "number" && Number.isFinite(body.n)) record.n = Math.max(0, Math.min(5000, Math.round(body.n)));

      await appendCapped(db, ref, "schemeSearches", record, { searchTotal: FieldValue.increment(1) });

      res.status(200).json({ ok: true });
      return;
    }

    // ── State-filter selection tracking ──────────────────────────────────
    if (type === "state") {
      const stateKey = safeStateKey(body.state);
      if (!stateKey) {
        res.status(200).json({ ok: true, skipped: true });
        return;
      }
      const record = { state: String(body.state).slice(0, 60), uid: safeUid(body.uid), ts: new Date().toISOString() };

      await appendCapped(db, ref, "stateSelections", record, { [`stateCount_${stateKey}`]: FieldValue.increment(1) });

      res.status(200).json({ ok: true });
      return;
    }
  } catch (err) {
    console.error("[/api/log-checker-run] failed:", err?.message || err);
    res.status(500).json({ ok: false, error: "log failed" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"flag" — "⚑ Something wrong with this scheme?" on a scheme's detail sheet.
// Works for guests (no sign-in) and signed-in users (send the Firebase ID token
// as "Authorization: Bearer …" so the report shows in their My Reports).
//
//  • Saved in the same `reports` collection the admin Reports section uses
//    (type "issue", source "scheme_flag", schemeId, flagReason) — no new inbox.
//  • Guest flags on the same scheme + reason are merged into ONE open report
//    (flagCount++) so the admin sees "5 people" instead of 5 copies.
//  • "Link not working": the link is checked from the server right away. If
//    it is really down, the scheme goes to the front of the daily auto-repair
//    queue (appMeta/urlRepairState.reported → _lib/urlRepairAgent.js).
//  • schemeFlags/{schemeId} — small public summary the app reads to warn other
//    users ("Some people reported this link isn't working").
//  • Abuse limits per network per day: guests 5 flags, signed-in 20; the same
//    scheme + reason once a day.
// ─────────────────────────────────────────────────────────────────────────────
const FLAG_REASONS = {
  link:        "Link not working",
  amount:      "Amount / benefit is wrong",
  closed:      "Scheme closed / date passed",
  eligibility: "Eligibility is wrong",
  other:       "Something else",
};
let SCHEMES_CACHE = null;
async function findScheme(id) {
  if (!SCHEMES_CACHE) SCHEMES_CACHE = (await import("../src/schemesData.js")).SCHEME_DB;
  return SCHEMES_CACHE.find(s => s.id === id && !s.duplicateOf) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"ai_report" — "Report this answer" under an AI reply (Google Play's
// generative-AI policy: users must be able to flag offensive / harmful AI
// content in the app). Stored in aiReports (server-only collection).
// ─────────────────────────────────────────────────────────────────────────────
const AI_REPORT_REASONS = { wrong: 1, harmful: 1, offensive: 1, other: 1 };
async function handleAiReport(req, res, body, db, app) {
  const reason = AI_REPORT_REASONS[body.reason] ? body.reason : null;
  if (!reason) { res.status(400).json({ error: "bad request" }); return; }
  const clip = (v, n) => String(v || "").replace(/\s+\n/g, "\n").trim().slice(0, n);
  let uid = null;
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  if (token) { try { uid = (await getAuth(app).verifyIdToken(token)).uid; } catch { /* guest */ } }
  const ip = String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const day = istDay();
  const who = createHash("sha256").update(`${ip}|${uid || "guest"}|${day}`).digest("hex").slice(0, 24);
  const limRef = db.collection("flagLimits").doc(`ai_${day}_${who}`);
  const ok = await db.runTransaction(async (tx) => {
    const n = (await tx.get(limRef)).data()?.n || 0;
    if (n >= 20) return false;
    tx.set(limRef, { n: n + 1, at: FieldValue.serverTimestamp() }, { merge: true });
    return true;
  });
  if (!ok) { res.status(429).json({ error: "Too many reports today — thank you, we have them." }); return; }
  await db.collection("aiReports").add({
    reason, note: clip(body.note, 400), answer: clip(body.answer, 2000), question: clip(body.question, 500),
    lang: body.lang === "hi" ? "hi" : "en", uid, status: "new", createdAt: FieldValue.serverTimestamp(),
  });
  await db.collection("appStats").doc("usage").set({ aiReports: FieldValue.increment(1) }, { merge: true }).catch(() => {});
  res.status(200).json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"delete_account" — Profile → Delete account (Google Play requires
// in-app account deletion). Deletes the user's saved data and their sign-in
// account; their problem reports are kept but anonymised.
// ─────────────────────────────────────────────────────────────────────────────
async function handleDeleteAccount(req, res, db, app) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  let d;
  try { d = await getAuth(app).verifyIdToken(token); } catch { res.status(401).json({ error: "Please sign in again, then try deleting." }); return; }
  const r = await wipeUser(db, app, d.uid);
  if (!r.ok) { res.status(500).json({ error: "Could not delete the sign-in account. Please try again or e-mail yojanasahayofficial@gmail.com.", steps: r.steps }); return; }
  res.status(200).json({ ok: true });
}

// Deletes one user's saved data + sign-in account; keeps their problem
// reports but strips name / e-mail / phone. Shared by the in-app button and
// the admin "Delete a user" tool (e-mailed deletion requests).
async function wipeUser(db, app, uid) {
  const steps = [];
  for (const coll of ["users", "userApplications", "pushSubs"]) {
    try { await db.collection(coll).doc(uid).delete(); steps.push(coll); } catch (e) { steps.push(`${coll}:fail`); }
  }
  try {
    const mine = await db.collection("reports").where("uid", "==", uid).limit(200).get();
    const batch = db.batch();
    mine.docs.forEach(doc => batch.update(doc.ref, { uid: "deleted", userName: "Deleted user", userEmail: FieldValue.delete(), userPhone: FieldValue.delete(), anonymisedAt: FieldValue.serverTimestamp() }));
    if (!mine.empty) await batch.commit();
    steps.push(`reports:${mine.size}`);
  } catch { steps.push("reports:fail"); }
  // Usage records (searches, checker runs, state filters) keep no trace of this account.
  try {
    const uref = db.collection("appStats").doc("usage");
    const n = await db.runTransaction(async tx => {
      const d = (await tx.get(uref)).data() ?? {};
      const upd = {}; let count = 0;
      for (const f of ["schemeSearches", "checkerRuns", "stateSelections"]) {
        if (!Array.isArray(d[f])) continue;
        let hit = false;
        const next = d[f].map(r => (r && r.uid === uid) ? (hit = true, count++, { ...r, uid: "deleted" }) : r);
        if (hit) upd[f] = next;
      }
      if (Object.keys(upd).length) tx.set(uref, upd, { merge: true });
      return count;
    });
    steps.push(`usage:${n}`);
  } catch { steps.push("usage:fail"); }
  try { await getAuth(app).deleteUser(uid); steps.push("auth"); }
  catch (e) { if (e?.code !== "auth/user-not-found") return { ok: false, steps }; }
  await db.collection("appStats").doc("usage").set({ accountsDeleted: FieldValue.increment(1) }, { merge: true }).catch(() => {});
  return { ok: true, steps };
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"admin_delete_user" — admin dashboard tool for e-mailed "Data Deletion
// Request"s. Step 1 { query } looks the person up by e-mail, phone or uid and
// returns what would be deleted; step 2 { uid, confirm:true } deletes it.
// ─────────────────────────────────────────────────────────────────────────────
async function handleAdminDeleteUser(req, res, body, db, app) {
  const { verifyAdminRequest } = await import("./_lib/adminAuth.js");
  const who = await verifyAdminRequest(req);
  if (!who.ok) { res.status(who.status).json({ error: who.error }); return; }
  const auth = getAuth(app);

  const describe = async (u) => {
    const [prof, apps, push, reps] = await Promise.all([
      db.collection("users").doc(u.uid).get().catch(() => null),
      db.collection("userApplications").doc(u.uid).get().catch(() => null),
      db.collection("pushSubs").doc(u.uid).get().catch(() => null),
      db.collection("reports").where("uid", "==", u.uid).limit(200).get().catch(() => null),
    ]);
    const p = prof?.exists ? (prof.data() || {}) : {};
    const appsData = apps?.exists ? (apps.data() || {}) : null;
    const appCount = appsData?.apps && typeof appsData.apps === "object" ? Object.keys(appsData.apps).length : 0;
    return {
      uid: u.uid, email: u.email || null, phone: u.phoneNumber || null, name: u.displayName || p.name || null,
      created: u.metadata?.creationTime || null, lastSignIn: u.metadata?.lastSignInTime || null,
      isAdmin: p.isAdmin === true || p.role === "admin",
      has: { profile: !!prof?.exists, applications: appCount, notifications: !!push?.exists, reports: reps?.size || 0 },
    };
  };

  if (body.confirm === true) {
    const uid = String(body.uid || "").trim();
    if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) { res.status(400).json({ error: "Look the user up first." }); return; }
    if (uid === who.uid) { res.status(400).json({ error: "You can't delete your own admin account here." }); return; }
    let u; try { u = await auth.getUser(uid); } catch { res.status(404).json({ error: "This user no longer exists — already deleted." }); return; }
    const info = await describe(u);
    if (info.isAdmin) { res.status(400).json({ error: "This account is an admin. Remove admin access first." }); return; }
    const r = await wipeUser(db, app, uid);
    await db.collection("adminAudit").add({ action: "delete_user", by: who.email, uid, steps: r.steps, ok: r.ok, at: FieldValue.serverTimestamp() }).catch(() => {});
    if (!r.ok) { res.status(500).json({ error: "Data was removed but the sign-in account could not be deleted. Try again.", steps: r.steps }); return; }
    res.status(200).json({ ok: true, deleted: { email: info.email, phone: info.phone } });
    return;
  }

  const q = String(body.query || "").trim().slice(0, 200);
  if (!q) { res.status(400).json({ error: "Enter an e-mail, phone number or user ID." }); return; }
  let u = null;
  try {
    if (q.includes("@")) u = await auth.getUserByEmail(q.toLowerCase());
    else if (/^\+?[\d\s-]{10,16}$/.test(q)) {
      const digits = q.replace(/\D/g, "");
      const phone = q.trim().startsWith("+") ? `+${digits}` : digits.length === 10 ? `+91${digits}` : `+${digits}`;
      u = await auth.getUserByPhoneNumber(phone);
    } else u = await auth.getUser(q);
  } catch (e) {
    if (e?.code === "auth/user-not-found" || e?.code === "auth/invalid-uid" || e?.code === "auth/invalid-email" || e?.code === "auth/invalid-phone-number") {
      res.status(200).json({ found: false }); return;
    }
    throw e;
  }
  res.status(200).json({ found: true, user: await describe(u) });
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"admin_ai_reports" — admin dashboard review of "Report this answer".
//   { op:"list", status?:"new"|"all" }   → latest 100
//   { op:"set", id, status:"resolved"|"dismissed"|"new", note? }
// ─────────────────────────────────────────────────────────────────────────────
async function handleAdminAiReports(req, res, body, db) {
  const { verifyAdminRequest } = await import("./_lib/adminAuth.js");
  const who = await verifyAdminRequest(req, "reports");
  if (!who.ok) { res.status(who.status).json({ error: who.error }); return; }
  const col = db.collection("aiReports");
  const clip = (v, n) => String(v || "").trim().slice(0, n);
  if (body.op === "set") {
    const id = cleanKey(body.id, 64);
    const status = ["resolved", "dismissed", "new"].includes(body.status) ? body.status : null;
    if (!id || !status) { res.status(400).json({ error: "bad request" }); return; }
    await col.doc(id).set({ status, adminNote: clip(body.note, 400), reviewedBy: who.email, reviewedAt: FieldValue.serverTimestamp() }, { merge: true });
    res.status(200).json({ ok: true });
    return;
  }
  const snap = await col.orderBy("createdAt", "desc").limit(100).get();
  const all = snap.docs.map(d => {
    const x = d.data() || {};
    return { id: d.id, reason: x.reason, note: x.note || "", question: x.question || "", answer: x.answer || "", lang: x.lang, status: x.status || "new",
      adminNote: x.adminNote || "", createdAt: x.createdAt?.toMillis?.() || null, reviewedAt: x.reviewedAt?.toMillis?.() || null };
  });
  const items = body.status === "all" ? all : all.filter(r => r.status === "new");
  res.status(200).json({ ok: true, items, openCount: all.filter(r => r.status === "new").length });
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"admin_audience" — real people numbers for the admin Overview:
// sign-in accounts (Firebase Auth) vs. finished profiles (users docs).
// Counts only — no names, e-mails or numbers leave the server.
// ─────────────────────────────────────────────────────────────────────────────
async function handleAdminAudience(req, res, db, app) {
  const { verifyAdminRequest } = await import("./_lib/adminAuth.js");
  const who = await verifyAdminRequest(req, "overview");
  if (!who.ok) { res.status(who.status).json({ error: who.error }); return; }
  const now = Date.now(), D = 86400000;
  const a = { total: 0, new7: 0, new30: 0, active7: 0, active30: 0, google: 0, phone: 0, email: 0, anonymous: 0, byWeek: {} };
  let token, pages = 0;
  do {
    const r = await getAuth(app).listUsers(1000, token);
    for (const u of r.users) {
      a.total++;
      const created = Date.parse(u.metadata?.creationTime || "") || 0;
      const seen = Date.parse(u.metadata?.lastRefreshTime || u.metadata?.lastSignInTime || "") || created;
      if (now - created < 7 * D) a.new7++;
      if (now - created < 30 * D) a.new30++;
      if (now - seen < 7 * D) a.active7++;
      if (now - seen < 30 * D) a.active30++;
      const p = (u.providerData || []).map(x => x.providerId);
      if (p.includes("google.com")) a.google++; else if (p.includes("phone") || u.phoneNumber) a.phone++; else if (p.includes("password")) a.email++; else a.anonymous++;
      if (created) { const wk = new Date(created - ((new Date(created).getUTCDay() + 6) % 7) * D).toISOString().slice(0, 10); a.byWeek[wk] = (a.byWeek[wk] || 0) + 1; }
    }
    token = r.pageToken; pages++;
  } while (token && pages < 20);
  let profiles = null;
  try { profiles = (await db.collection("users").count().get()).data().count; } catch { /* older SDK */ }
  res.status(200).json({ ok: true, accounts: a, profiles });
}

async function handleFlag(req, res, body, db, app) {
  const sid = cleanKey(body.schemeId, 80);
  const reason = typeof body.reason === "string" && FLAG_REASONS[body.reason] ? body.reason : null;
  const note = String(body.note || "").replace(/\s+/g, " ").trim().slice(0, 400);
  const lang = body.lang === "hi" ? "hi" : "en";
  if (!sid || !reason) { res.status(400).json({ error: "bad request" }); return; }
  if (reason === "other" && note.length < 3) { res.status(400).json({ error: "note required" }); return; }
  const scheme = await findScheme(sid);
  if (!scheme) { res.status(404).json({ error: "unknown scheme" }); return; }

  // Who is reporting (optional)
  let user = null;
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  if (token) {
    try {
      const d = await getAuth(app).verifyIdToken(token);
      user = { uid: d.uid, name: String(body.userName || d.name || "").slice(0, 80), email: d.email || "", phone: d.phone_number || "" };
    } catch { /* treat as guest */ }
  }

  // Rate limit — per network (hashed, never stored raw) per day
  const ip = String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const day = istDay();
  const who = createHash("sha256").update(`${ip}|${user?.uid || "guest"}|${day}`).digest("hex").slice(0, 24);
  const limRef = db.collection("flagLimits").doc(`${day}_${who}`);
  const key = `${sid}__${reason}`;
  const verdict = await db.runTransaction(async (tx) => {
    const d = (await tx.get(limRef)).data() || {};
    if (d[key]) return "duplicate";
    if ((d.count || 0) >= (user ? 20 : 5)) return "limit";
    tx.set(limRef, { count: FieldValue.increment(1), [key]: true, day }, { merge: true });
    return "ok";
  });
  if (verdict === "limit") { res.status(429).json({ error: "too many reports today" }); return; }
  if (verdict === "duplicate") { res.status(200).json({ ok: true, duplicate: true }); return; }

  // Link check (only for "link not working")
  let linkCheck = null;
  if (reason === "link" && scheme.applyType !== "offline") {
    const { normalizeSchemeUrl } = await import("./_lib/urlTools.js");
    const url = normalizeSchemeUrl(scheme.apply?.en);
    if (url) {
      const { pingUrlServer } = await import("./ping-url.js");
      const r = await Promise.race([
        pingUrlServer(url).catch(() => ({ alive: null, httpStatus: 0 })),
        new Promise(ok => setTimeout(() => ok({ alive: null, httpStatus: 0, error: "timeout" }), 9000)),
      ]);
      linkCheck = { url, alive: r.alive ?? null, httpStatus: r.httpStatus || 0, at: new Date().toISOString() };
      if (r.alive === false) {
        await db.collection("appMeta").doc("urlRepairState").set({ reported: { [sid]: Date.now() } }, { merge: true }).catch(() => {});
      }
    }
  }

  const label = FLAG_REASONS[reason];
  // Admin-only note (kept OUT of the user's message — it's emailed back to them)
  const checkLine = !linkCheck ? "" :
    linkCheck.alive === true ? `[Auto-check] Link answered OK (HTTP ${linkCheck.httpStatus}) from our server — may be slow or blocked for this user.`
    : linkCheck.alive === false ? `[Auto-check] Our server could not reach it (HTTP ${linkCheck.httpStatus || "no answer"}) — queued for the daily auto-repair (it re-checks before changing anything).`
    : "[Auto-check] Could not confirm (government sites often block servers outside India).";
  const base = {
    type: "issue", source: "scheme_flag", status: "open", lang,
    schemeId: sid, schemeName: scheme.name?.en || sid, flagReason: reason,
    subject: `⚑ ${scheme.name?.en || sid} — ${label}`.slice(0, 140),
    ...(linkCheck ? { linkCheck, autoCheck: checkLine } : {}),
  };

  let merged = false, flagCount = 1, reportId = null;
  if (user) {
    // Same person, same scheme + problem, still open → add to that report.
    const mineSnap = await db.collection("reports").where("uid", "==", user.uid).limit(200).get();
    const prev = mineSnap.docs.find(d => { const x = d.data(); return x.source === "scheme_flag" && x.schemeId === sid && x.flagReason === reason && x.status !== "resolved"; });
    if (prev) {
      await prev.ref.update({
        lastFlagAt: FieldValue.serverTimestamp(),
        ...(linkCheck ? { linkCheck, autoCheck: checkLine } : {}),
        ...(note ? { notes: FieldValue.arrayUnion(note) } : {}),
      });
      res.status(200).json({ ok: true, existing: true, status: prev.data().status || "open", linkAlive: linkCheck ? linkCheck.alive : undefined, signedIn: true });
      return;
    }
    await db.collection("reports").add({
      ...base, uid: user.uid, userName: user.name || "User", userEmail: user.email, userPhone: user.phone,
      message: note || label, flagCount: 1, createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    // Merge into the open guest report for the same scheme + reason
    const snap = await db.collection("reports").where("schemeId", "==", sid).limit(30).get();
    const open = snap.docs.find(d => { const x = d.data(); return x.source === "scheme_flag" && x.uid === "guest" && x.flagReason === reason && x.status !== "resolved"; });
    if (open) {
      merged = true;
      reportId = open.id;
      flagCount = (open.data().flagCount || 1) + 1;
      await open.ref.update({
        flagCount: FieldValue.increment(1), lastFlagAt: FieldValue.serverTimestamp(),
        ...(linkCheck ? { linkCheck, autoCheck: checkLine } : {}),
        ...(note ? { notes: FieldValue.arrayUnion(note) } : {}),
      });
    } else {
      reportId = (await db.collection("reports").add({
        ...base, uid: "guest", userName: "Guest (no sign-in)", userEmail: "", userPhone: "",
        message: note || label, flagCount: 1, createdAt: FieldValue.serverTimestamp(),
        ...(note ? { notes: [note] } : {}),
      })).id;
    }
  }

  // Public summary: in-app warning + status/reply for people not signed in.
  // A report after the last one was resolved starts a fresh round.
  try {
    const fRef = db.collection("schemeFlags").doc(sid);
    const cur = ((await fRef.get()).data() || {})[reason];
    const fresh = !cur || cur.status === "resolved";
    await fRef.set({
      [reason]: {
        count: fresh ? 1 : FieldValue.increment(1),
        status: fresh ? "open" : (cur.status || "open"),
        lastAt: new Date().toISOString(),
        ...(fresh ? { reply: FieldValue.delete() } : {}),
        ...(linkCheck ? { alive: linkCheck.alive } : {}),
      },
    }, { merge: true });
  } catch { /* summary is best-effort */ }

  res.status(200).json({ ok: true, merged, flagCount, reportId, linkAlive: linkCheck ? linkCheck.alive : undefined, signedIn: !!user });
}

// ─────────────────────────────────────────────────────────────────────────────
// type:"claim" — someone who reported without signing in has now signed in on
// the same phone. Their earlier reports (ids kept on the phone) move into their
// account so they show in My Reports and replies reach them by email.
//  • only they reported it → the report becomes theirs
//  • merged with other people → they get their own copy (with replies so far),
//    and the shared report counts one person less
// ─────────────────────────────────────────────────────────────────────────────
async function handleClaim(req, res, body, db, app) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  let d;
  try { d = await getAuth(app).verifyIdToken(token); } catch { res.status(401).json({ error: "sign-in required" }); return; }
  let profileName = "";
  try { profileName = (await db.collection("users").doc(d.uid).get()).data()?.name || ""; } catch { /* optional */ }
  const user = { uid: d.uid, name: String(profileName || body.userName || d.name || "User").slice(0, 80), email: d.email || "", phone: d.phone_number || "" };
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 10);
  const claimed = [];
  for (const it of items) {
    const rid = cleanKey(it?.reportId, 40), sid = cleanKey(it?.schemeId, 80);
    if (!rid || !sid) continue;
    const ref = db.collection("reports").doc(rid);
    const snap = await ref.get();
    const x = snap.exists ? snap.data() : null;
    if (!x || x.source !== "scheme_flag" || x.uid !== "guest" || x.schemeId !== sid || x.flagReason !== it.reason) continue;
    const who = { uid: user.uid, userName: user.name, userEmail: user.email, userPhone: user.phone, claimedAt: FieldValue.serverTimestamp() };
    if ((x.flagCount || 1) <= 1) {
      await ref.update(who);
    } else {
      const { notes, flagCount, lastFlagAt, ...rest } = x;
      await db.collection("reports").add({ ...rest, ...who, flagCount: 1, linkedGuestReport: rid, replyHistory: x.replyHistory || [] });
      await ref.update({ flagCount: FieldValue.increment(-1) });
    }
    claimed.push(rid);
  }
  res.status(200).json({ ok: true, claimed });
}
