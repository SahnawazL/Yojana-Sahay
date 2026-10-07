// api/_lib/agentProgress.js — Yojana Sahay · live progress for autonomous jobs
// ─────────────────────────────────────────────────────────────────────────────
// Every job (Auto-Fix, Background Verifier, Scheme Discovery, News, Deadline
// e-mails, Watchdog) reports what it is doing, step by step, into ONE Firestore
// doc: appMeta/agentLive → { [job]: { running, label, trigger, startedAt,
// updatedAt, finishedAt, steps: [{ t, text, kind }], result, error } }.
// The Agents tab shows it live — for "▶ Run" and for scheduled runs alike.
//
// Writes are throttled (≤ 1 per 1.2 s, always flushed at the end) so a long
// run costs a few dozen Firestore writes at most.
//
// isJobRunning() lets callers refuse a second start while one is in flight
// (a stale "running" older than STALE_MS is ignored — the function was killed).
// ─────────────────────────────────────────────────────────────────────────────

const DOC = ["appMeta", "agentLive"];
const MAX_STEPS = 60;
const THROTTLE_MS = 1200;
export const STALE_MS = 6 * 60 * 1000;

export const JOB_LABELS = {
  autoFix: "Auto-Fix + URL Repair",
  verifyBatch: "Background Verifier",
  discover: "Scheme Discovery",
  news: "News Refresh",
  deadlineAlerts: "Deadline E-mails",
  health: "Watchdog check",
};

export async function isJobRunning(db, job) {
  if (!db) return false;
  try {
    const d = (await db.collection(DOC[0]).doc(DOC[1]).get()).data()?.[job];
    if (!d?.running) return false;
    const upd = d.updatedAt?.toMillis?.() ?? (d.updatedAt ? new Date(d.updatedAt).getTime() : 0);
    return Date.now() - upd < STALE_MS;
  } catch {
    return false;
  }
}

const noop = { step() {}, async done() {}, async fail() {}, async flush() {} };

export function createProgress(db, job, { trigger = "cron", label } = {}) {
  if (!db) return noop;
  const ref = db.collection(DOC[0]).doc(DOC[1]);
  const startedAt = new Date();
  const state = { running: true, label: label ?? JOB_LABELS[job] ?? job, trigger, startedAt, updatedAt: startedAt, finishedAt: null, steps: [], result: null, error: null };
  let lastWrite = 0, timer = null, chain = Promise.resolve();

  const write = () => {
    lastWrite = Date.now();
    state.updatedAt = new Date();
    const snapshot = JSON.parse(JSON.stringify({ ...state, startedAt: state.startedAt.toISOString(), updatedAt: state.updatedAt.toISOString(), finishedAt: state.finishedAt ? state.finishedAt.toISOString() : null }));
    chain = chain.then(() => ref.set({ [job]: snapshot }, { merge: true })).catch(e => console.warn(`[agentProgress] ${job} write failed:`, e.message));
    return chain;
  };
  const schedule = () => {
    if (timer) return;
    const wait = Math.max(0, THROTTLE_MS - (Date.now() - lastWrite));
    timer = setTimeout(() => { timer = null; write(); }, wait);
  };

  write(); // "started"
  return {
    step(text, kind = "info") {
      state.steps.push({ t: new Date().toISOString(), text: String(text).slice(0, 220), kind });
      if (state.steps.length > MAX_STEPS) state.steps.splice(0, state.steps.length - MAX_STEPS);
      schedule();
    },
    async flush() { if (timer) { clearTimeout(timer); timer = null; } await write(); },
    async done(result = null) {
      if (timer) { clearTimeout(timer); timer = null; }
      state.running = false; state.finishedAt = new Date(); state.result = result;
      state.steps.push({ t: state.finishedAt.toISOString(), text: "Finished", kind: "done" });
      await write();
    },
    async fail(err) {
      if (timer) { clearTimeout(timer); timer = null; }
      state.running = false; state.finishedAt = new Date(); state.error = String(err?.message ?? err).slice(0, 300);
      state.steps.push({ t: state.finishedAt.toISOString(), text: `Failed: ${state.error}`, kind: "error" });
      await write();
    },
  };
}

export async function readAgentLive(db) {
  try { return (await db.collection(DOC[0]).doc(DOC[1]).get()).data() ?? {}; } catch { return {}; }
}
