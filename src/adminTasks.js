// adminTasks.js — Yojana Sahay · background-task registry for the admin dashboard
// ─────────────────────────────────────────────────────────────────────────────
// Admin tabs stay mounted after their first visit (AdminDashboard → TabPane),
// so long jobs — a verification run, an agent "Run now" — keep going while
// you work in another tab. This tiny store lets those jobs announce
// themselves so the dashboard can show a "running in background" pill, a
// spinner on the tab, and warn before the dashboard is closed mid-run.
//
//   setAdminTask(id, { tab, label, detail? })   start / update
//   setAdminTask(id, null)                      finished
//   useAdminTasks() → [{ id, tab, label, detail }]
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore, useEffect } from "react";

const tasks = new Map();
const listeners = new Set();
let snapshot = [];

export function setAdminTask(id, task) {
  if (!id) return;
  const prev = tasks.get(id);
  if (task) {
    const next = { id, tab: task.tab ?? null, label: task.label ?? "Working…", detail: task.detail ?? null, startedAt: prev?.startedAt ?? Date.now() };
    if (prev && prev.tab === next.tab && prev.label === next.label && prev.detail === next.detail) return;
    tasks.set(id, next);
  } else {
    if (!prev) return;
    tasks.delete(id);
  }
  snapshot = [...tasks.values()];
  listeners.forEach(fn => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAdminTasks() {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

// Convenience: register a task while `active` is true; clears on unmount.
export function useAdminTaskFlag(id, active, task) {
  const label = task?.label, tab = task?.tab, detail = task?.detail;
  useEffect(() => {
    if (active) setAdminTask(id, { tab, label, detail });
    else setAdminTask(id, null);
  }, [id, active, tab, label, detail]);
  useEffect(() => () => setAdminTask(id, null), [id]);
}
