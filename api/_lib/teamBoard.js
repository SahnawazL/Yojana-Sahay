// api/_lib/teamBoard.js — Yojana Sahay · the agents' shared team board
// ─────────────────────────────────────────────────────────────────────────────
// The background agents run at different times of day and never run
// together, so they work as a team through this board — like an office's
// shared hand-off board plus a morning briefing:
//
//   NOTES  — one agent asks another to do something, the other replies.
//     Scheme Discovery   ─ "new scheme, check it first" ─────▶ Background Verifier
//     Auto-Fix           ─ "I replaced this link, re-check" ─▶ Background Verifier
//     Deadline E-mails   ─ "deadline soon, confirm it" ──────▶ Background Verifier
//     News Refresh       ─ "news says the date changed" ─────▶ Background Verifier
//     Background Verifier ─ "this link is dead (404)" ───────▶ Auto-Fix
//     Deadline E-mails   ─ "dead link on a scheme closing soon" ▶ Auto-Fix
//
//   BRIEF  — before working, every agent reads teamBrief(): who is healthy,
//            whose inbox is piling up, which websites block readers, which
//            links are already waiting for repair. They adapt to it
//            (e.g. Discovery adds fewer schemes when the Verifier is behind).
//
// Strict rules (nothing is silently lost, nothing loops forever):
//   • one open request per agent + scheme — repeats upgrade the priority
//   • an inbox holds at most 25 open normal requests (urgent ones always fit)
//   • requests expire (urgent 3 days, normal 7) → "needs you" for the admin
//   • 3 failed tries → "needs you"
//   • a scheme passed back and forth 4+ times in 14 days → "needs you"
//
// Firestore collection agentTeam: { from, to, type, priority, schemeId,
//   schemeName, text, status: "open"|"done"|"dropped"|"escalated", reply?,
//   tries, createdAt, expiresAt, doneAt? }
// type: "verify" · "repair" · "info"
// ─────────────────────────────────────────────────────────────────────────────

// Who is on the team, what they do and when they work (IST). Shared with the
// admin Team room so every screen tells the same story.
export const TEAM = {
  discover:       { name: "Scheme Discovery",    role: "Finds new government schemes and adds them",         schedule: "Daily 12:30" },
  verifyBatch:    { name: "Background Verifier", role: "Reads official pages, confirms deadlines and status", schedule: "Daily 02:30" },
  autoFix:        { name: "Auto-Fix",            role: "Repairs dead or unofficial apply links",             schedule: "Daily 08:30" },
  deadlineAlerts: { name: "Deadline E-mails",    role: "Warns users before a deadline closes",               schedule: "Daily 10:30" },
  news:           { name: "News Refresh",        role: "Picks scheme news for the ticker",                   schedule: "Every 3 days 09:30" },
  watchdog:       { name: "Watchdog",            role: "Checks every agent and key is healthy",              schedule: "Every 6 h" },
};
export const AGENT_NAMES = Object.fromEntries(Object.entries(TEAM).map(([k, v]) => [k, v.name]));
const nameOf = k => TEAM[k]?.name ?? k;

const COLL = "agentTeam";
export const TEAM_RULES = {
  maxOpenPerInbox: 25,
  ttlDays: { high: 3, normal: 7 },
  maxTries: 3,
  pingPongWindowDays: 14,
  pingPongMax: 4,
};
const DAY = 864e5;
const ms = v => v?.toMillis?.() ?? (v instanceof Date ? v.getTime() : typeof v === "string" ? Date.parse(v) : null);
const rank = p => (p === "high" ? 0 : 1);

// ── Post a request / FYI ─────────────────────────────────────────────────────
// Returns { id, status: "posted" | "merged" | "escalated" | "skipped", why? }.
export async function postNote(db, { from, to, type = "info", schemeId = null, schemeName = null, text, priority = "normal" }) {
  if (!db || !text || !TEAM[from] || !TEAM[to] || from === to) return { id: null, status: "skipped", why: "invalid" };
  priority = priority === "high" ? "high" : "normal";
  try {
    const coll = db.collection(COLL);
    if (schemeId && type !== "info") {
      // 1. Already asked? Merge (and upgrade to urgent if needed).
      const dup = await coll.where("to", "==", to).where("schemeId", "==", schemeId).where("status", "==", "open").limit(3).get();
      const same = dup.docs.find(d => d.data().type === type);
      if (same) {
        if (priority === "high" && same.data().priority !== "high") {
          await same.ref.set({ priority: "high", expiresAt: new Date(Date.now() + TEAM_RULES.ttlDays.high * DAY),
            text: String(text).slice(0, 240), from }, { merge: true });
        }
        return { id: same.id, status: "merged" };
      }
      // 2. Ping-pong guard: the same scheme bounced too often → a human decides.
      const hist = await coll.where("schemeId", "==", schemeId).limit(40).get();
      const since = Date.now() - TEAM_RULES.pingPongWindowDays * DAY;
      const recent = hist.docs.map(d => d.data()).filter(n => n.type !== "info" && (ms(n.createdAt) ?? 0) > since);
      if (recent.length >= TEAM_RULES.pingPongMax) {
        if (recent.some(n => n.status === "escalated")) return { id: null, status: "skipped", why: "already with the admin" };
        const ref = await coll.add({
          from, to, type, priority, schemeId, schemeName, text: String(text).slice(0, 240), tries: 0,
          status: "escalated", reply: `Stopped automatically: this scheme was passed between agents ${recent.length} times in ${TEAM_RULES.pingPongWindowDays} days — it needs a human look.`,
          createdAt: new Date(), doneAt: new Date(), expiresAt: new Date(),
        });
        return { id: ref.id, status: "escalated" };
      }
    }
    // 3. Inbox cap — urgent requests always get in.
    if (priority !== "high") {
      const open = await countOpen(db, to);
      if (open >= TEAM_RULES.maxOpenPerInbox) return { id: null, status: "skipped", why: `${nameOf(to)}'s inbox is full (${open})` };
    }
    const now = Date.now();
    const ref = await coll.add({
      from, to, type, priority, schemeId, schemeName, text: String(text).slice(0, 240),
      status: "open", tries: 0, createdAt: new Date(now),
      expiresAt: new Date(now + (TEAM_RULES.ttlDays[priority] ?? 7) * DAY),
    });
    return { id: ref.id, status: "posted" };
  } catch (err) {
    console.warn("[teamBoard] postNote failed:", err.message);
    return { id: null, status: "skipped", why: err.message };
  }
}

async function countOpen(db, to) {
  try {
    let q = db.collection(COLL).where("status", "==", "open");
    if (to) q = q.where("to", "==", to);
    return (await q.count().get()).data().count;
  } catch {
    let q = db.collection(COLL).where("status", "==", "open");
    if (to) q = q.where("to", "==", to);
    return (await q.limit(200).get()).size;
  }
}

// ── Read an inbox (urgent first, then oldest) ───────────────────────────────
// Expired requests are escalated here, so they never just vanish.
export async function openNotesFor(db, to, { type = null, limit = 20 } = {}) {
  if (!db) return [];
  try {
    let q = db.collection(COLL).where("to", "==", to).where("status", "==", "open");
    if (type) q = q.where("type", "==", type);
    const snap = await q.limit(Math.max(60, limit * 3)).get();
    const now = Date.now();
    const live = [];
    for (const d of snap.docs) {
      const n = { id: d.id, ...d.data() };
      const exp = ms(n.expiresAt);
      if (exp && exp < now) {
        await closeNote(db, n.id, `Not handled within ${TEAM_RULES.ttlDays[n.priority] ?? 7} days — needs a look.`, "escalated");
        continue;
      }
      live.push(n);
    }
    return live
      .sort((a, b) => rank(a.priority) - rank(b.priority) || (ms(a.createdAt) ?? 0) - (ms(b.createdAt) ?? 0))
      .slice(0, limit);
  } catch (err) {
    console.warn("[teamBoard] openNotesFor failed:", err.message);
    return [];
  }
}

// Close a request with a short reply (shown in the Team room).
export async function closeNote(db, noteId, reply, status = "done") {
  if (!db || !noteId) return;
  try {
    await db.collection(COLL).doc(noteId).set({ status, reply: String(reply ?? "").slice(0, 240), doneAt: new Date() }, { merge: true });
  } catch (err) {
    console.warn("[teamBoard] closeNote failed:", err.message);
  }
}

// A try that didn't finish (rate limit, budget). After maxTries → escalated.
export async function bumpTry(db, note, why) {
  if (!db || !note?.id) return;
  const tries = (note.tries ?? 0) + 1;
  if (tries >= TEAM_RULES.maxTries) return closeNote(db, note.id, `Tried ${tries} times without success (${why}) — needs a look.`, "escalated");
  try { await db.collection(COLL).doc(note.id).set({ tries, lastTry: String(why).slice(0, 120) }, { merge: true }); } catch { /* ignore */ }
}

// Admin buttons in the Team room.
export async function adminNoteAction(db, id, op) {
  const ref = db.collection(COLL).doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Note not found");
  const n = snap.data();
  if (op === "reopen") {
    await ref.set({ status: "open", tries: 0, reply: null, doneAt: null,
      expiresAt: new Date(Date.now() + (TEAM_RULES.ttlDays[n.priority] ?? 7) * DAY), reopenedAt: new Date() }, { merge: true });
    return { ok: true, text: `Sent back to ${nameOf(n.to)} — it will handle it on its next run.` };
  }
  if (op === "dismiss") {
    await ref.set({ status: "dropped", reply: "Dismissed by the admin.", doneAt: new Date() }, { merge: true });
    return { ok: true, text: "Dismissed." };
  }
  throw new Error(`Unknown op: ${op}`);
}

// ── Team brief: what every agent should know before it starts ───────────────
export async function teamBrief(db) {
  const brief = { inbox: {}, urgent: {}, health: {}, blockedSites: [], awaitingRepair: new Set(), escalated: 0 };
  if (!db) return brief;
  const now = Date.now();
  const [openSnap, healthSnap, failSnap, escCount] = await Promise.all([
    db.collection(COLL).where("status", "==", "open").limit(300).get().catch(() => null),
    db.collection("appMeta").doc("agentHealth").get().catch(() => null),
    db.collection("appMeta").doc("verifyFailures").get().catch(() => null),
    db.collection(COLL).where("status", "==", "escalated").count().get().then(c => c.data().count).catch(() => 0),
  ]);
  for (const d of openSnap?.docs ?? []) {
    const n = d.data();
    brief.inbox[n.to] = (brief.inbox[n.to] ?? 0) + 1;
    if (n.priority === "high") brief.urgent[n.to] = (brief.urgent[n.to] ?? 0) + 1;
    if (n.to === "autoFix" && n.type === "repair" && n.schemeId) brief.awaitingRepair.add(n.schemeId);
  }
  const h = healthSnap?.data();
  for (const it of h?.items ?? []) {
    if (TEAM[it.id]) brief.health[it.id] = { status: it.status, detail: it.detail ?? "", lastRunAt: it.lastRunAt ?? null };
  }
  if (h) brief.health.watchdog = { status: h.overall === "fail" ? "warn" : "ok", detail: "Checks everyone every 6 h", lastRunAt: h.savedAt ?? h.checkedAt ?? null };
  const sites = failSnap?.data()?.sites ?? {};
  brief.blockedSites = Object.entries(sites)
    .filter(([, s]) => s?.pausedUntil && Date.parse(s.pausedUntil) > now)
    .map(([k]) => k.replace(/\|/g, "."));
  brief.escalated = escCount;
  return brief;
}

// One readable line for an agent's live log.
export function briefLine(brief, me) {
  const parts = [];
  const mine = brief.inbox[me] ?? 0;
  parts.push(mine ? `${mine} request(s) for me${brief.urgent[me] ? ` (${brief.urgent[me]} urgent)` : ""}` : "no requests for me");
  const sick = Object.entries(brief.health).filter(([id, h]) => id !== me && h.status === "fail").map(([id]) => nameOf(id));
  if (sick.length) parts.push(`teammate trouble: ${sick.join(", ")}`);
  const busy = Object.entries(brief.inbox).filter(([id, c]) => id !== me && c >= 10).map(([id, c]) => `${nameOf(id)} has ${c} waiting`);
  if (busy.length) parts.push(busy.join(", "));
  if (brief.blockedSites.length) parts.push(`${brief.blockedSites.length} website(s) block readers`);
  if (brief.escalated) parts.push(`${brief.escalated} item(s) waiting for the admin`);
  return `Team brief: ${parts.join(" · ")}`;
}

// ── Admin Team room feed ────────────────────────────────────────────────────
export async function teamFeed(db, limit = 40) {
  const empty = { notes: [], open: 0, escalated: 0, stats: null, crew: [] };
  if (!db) return empty;
  const iso = v => { const t = ms(v); return t ? new Date(t).toISOString() : null; };
  try {
    const [snap, brief, weekSnap] = await Promise.all([
      db.collection(COLL).orderBy("createdAt", "desc").limit(limit).get(),
      teamBrief(db),
      db.collection(COLL).where("createdAt", ">=", new Date(Date.now() - 7 * DAY)).limit(500).get().catch(() => null),
    ]);
    const notes = snap.docs.map(d => {
      const n = d.data();
      return { id: d.id, from: n.from, to: n.to, type: n.type, priority: n.priority ?? "normal", schemeId: n.schemeId ?? null,
        schemeName: n.schemeName ?? null, text: n.text, status: n.status, reply: n.reply ?? null, tries: n.tries ?? 0,
        createdAt: iso(n.createdAt), doneAt: iso(n.doneAt), expiresAt: iso(n.expiresAt) };
    });
    // Last-7-day teamwork stats.
    let stats = null;
    if (weekSnap) {
      const week = weekSnap.docs.map(d => d.data()).filter(n => n.type !== "info");
      const done = week.filter(n => n.status === "done");
      const replyH = done.map(n => ((ms(n.doneAt) ?? 0) - (ms(n.createdAt) ?? 0)) / 3600e3).filter(h => h >= 0);
      stats = {
        handoffs: week.length,
        done: done.length,
        avgReplyH: replyH.length ? Math.round((replyH.reduce((a, b) => a + b, 0) / replyH.length) * 10) / 10 : null,
      };
    }
    const crew = Object.entries(TEAM).map(([id, t]) => ({
      id, ...t,
      inbox: brief.inbox[id] ?? 0,
      urgent: brief.urgent[id] ?? 0,
      status: brief.health[id]?.status ?? null,
      detail: brief.health[id]?.detail ?? null,
      lastRunAt: iso(brief.health[id]?.lastRunAt),
    }));
    const open = Object.values(brief.inbox).reduce((a, b) => a + b, 0);
    return { notes, open, escalated: brief.escalated, stats, crew, blockedSites: brief.blockedSites.length, rules: TEAM_RULES };
  } catch (err) {
    return { ...empty, error: err.message };
  }
}

// For the Watchdog: are hand-offs flowing?
export async function teamHealth(db) {
  if (!db) return null;
  const brief = await teamBrief(db);
  const stuckSnap = await db.collection(COLL).where("status", "==", "open").limit(300).get().catch(() => null);
  const now = Date.now();
  const stuck = (stuckSnap?.docs ?? []).map(d => d.data()).filter(n => now - (ms(n.createdAt) ?? now) > 3 * DAY).length;
  const open = Object.values(brief.inbox).reduce((a, b) => a + b, 0);
  return { open, stuck, escalated: brief.escalated };
}
