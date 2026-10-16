// api/_lib/teamBoard.js — Yojana Sahay · the agents' shared team board
// ─────────────────────────────────────────────────────────────────────────────
// The background agents work at different times of day and never run
// together, so they "talk" by leaving notes for each other here — like a
// shared to-do board in an office:
//
//   Scheme Discovery ──"new scheme, please check it"──▶ Background Verifier
//   Auto-Fix         ──"I replaced this link, re-check"─▶ Background Verifier
//   Background Verifier ──"this link is dead (404)"───▶ Auto-Fix
//   …and each agent replies when it has done the job, so the admin Agents tab
//   shows the conversation ("Team room").
//
// Firestore collection agentTeam: { from, to, type, schemeId, schemeName, text,
//   status: "open" | "done" | "dropped", reply?, createdAt, doneAt? }
// type: "verify" (please verify this scheme) · "repair" (please fix this link)
//       · "info" (FYI, no action needed)
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_NAMES = {
  discover: "Scheme Discovery",
  verifyBatch: "Background Verifier",
  autoFix: "Auto-Fix",
  news: "News Refresh",
  deadlineAlerts: "Deadline E-mails",
  watchdog: "Watchdog",
};

const COLL = "agentTeam";
const MAX_OPEN_PER_SCHEME = 1; // never two open notes about the same scheme + job

// Leave a note for a teammate. Skips duplicates (same to/type/scheme still open).
export async function postNote(db, { from, to, type = "info", schemeId = null, schemeName = null, text }) {
  if (!db || !text) return null;
  try {
    if (schemeId && type !== "info") {
      const dup = await db.collection(COLL)
        .where("to", "==", to).where("schemeId", "==", schemeId).where("status", "==", "open")
        .limit(MAX_OPEN_PER_SCHEME).get();
      if (!dup.empty) return dup.docs[0].id;
    }
    const ref = await db.collection(COLL).add({
      from, to, type, schemeId, schemeName, text: String(text).slice(0, 240),
      status: "open", createdAt: new Date(),
    });
    return ref.id;
  } catch (err) {
    console.warn("[teamBoard] postNote failed:", err.message);
    return null;
  }
}

// Open notes addressed to an agent (oldest first).
export async function openNotesFor(db, to, { type = null, limit = 20 } = {}) {
  if (!db) return [];
  try {
    let q = db.collection(COLL).where("to", "==", to).where("status", "==", "open");
    if (type) q = q.where("type", "==", type);
    const snap = await q.limit(limit * 3).get();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0))
      .slice(0, limit);
  } catch (err) {
    console.warn("[teamBoard] openNotesFor failed:", err.message);
    return [];
  }
}

// Close a note with a short reply (shown in the team room).
export async function closeNote(db, noteId, reply, status = "done") {
  if (!db || !noteId) return;
  try {
    await db.collection(COLL).doc(noteId).set({ status, reply: String(reply ?? "").slice(0, 240), doneAt: new Date() }, { merge: true });
  } catch (err) {
    console.warn("[teamBoard] closeNote failed:", err.message);
  }
}

// Latest notes for the admin "Team room" (newest first).
export async function teamFeed(db, limit = 30) {
  if (!db) return { notes: [], open: 0 };
  const iso = v => v?.toDate?.().toISOString?.() ?? null;
  try {
    const snap = await db.collection(COLL).orderBy("createdAt", "desc").limit(limit).get();
    const notes = snap.docs.map(d => {
      const n = d.data();
      return { id: d.id, from: n.from, to: n.to, type: n.type, schemeId: n.schemeId ?? null, schemeName: n.schemeName ?? null,
        text: n.text, status: n.status, reply: n.reply ?? null, createdAt: iso(n.createdAt), doneAt: iso(n.doneAt) };
    });
    let open = notes.filter(n => n.status === "open").length;
    try {
      const c = await db.collection(COLL).where("status", "==", "open").count().get();
      open = c.data().count;
    } catch { /* count() unavailable — use the page */ }
    return { notes, open };
  } catch (err) {
    return { notes: [], open: 0, error: err.message };
  }
}
