// src/applications.js — Yojana Sahay · "My applications" tracker
// ─────────────────────────────────────────────────────────────────────────────
// After applying for a scheme the person taps "I've applied" and we remember:
// the date, the application / reference number (optional) and the status.
// Thirty days after applying (or after the last "still waiting"), a pending
// application shows a reminder to check its status.
//
// Stored on the device (localStorage, per account) and — when signed in — in
// Firestore at userApplications/{uid} (its own document, so profile saves can
// never overwrite it). The two are merged by `updatedAt`, newest wins.
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";

export const STATUSES = ["pending", "approved", "received", "rejected"];
export const STATUS_TEXT = {
  pending:  { en: "Waiting for result", hi: "परिणाम का इंतज़ार", icon: "⏳", color: "#B45309", bg: "#FEF3C7" },
  approved: { en: "Approved",           hi: "मंज़ूर",            icon: "✅", color: "#15803D", bg: "#DCFCE7" },
  received: { en: "Benefit received",   hi: "लाभ मिल गया",       icon: "💰", color: "#047857", bg: "#D1FAE5" },
  rejected: { en: "Rejected",           hi: "अस्वीकृत",          icon: "❌", color: "#B91C1C", bg: "#FEE2E2" },
};
export const CHECK_AFTER_DAYS = 30;
const DAY = 86_400_000;

const lsKey = uid => `yojana_applications_${uid || "guest"}`;
let current = { uid: null, apps: {} };
const listeners = new Set();
let remoteWriter = null;
let writeTimer = null;

function readLS(uid) {
  try { const v = JSON.parse(localStorage.getItem(lsKey(uid)) || "{}"); return v && typeof v === "object" ? v : {}; }
  catch { return {}; }
}
function writeLS(uid, apps) { try { localStorage.setItem(lsKey(uid), JSON.stringify(apps)); } catch {} }
function emit() { for (const l of listeners) l(); }

function commit(apps, { push = true } = {}) {
  current = { uid: current.uid, apps };
  writeLS(current.uid, apps);
  emit();
  if (push && remoteWriter && current.uid) {
    clearTimeout(writeTimer);
    const uid = current.uid;
    writeTimer = setTimeout(() => { try { remoteWriter(uid, current.apps); } catch {} }, 600);
  }
}

// Newest `updatedAt` wins, per scheme.
function mergeMaps(a = {}, b = {}) {
  const out = { ...a };
  for (const [id, x] of Object.entries(b || {})) {
    if (!x || typeof x !== "object") continue;
    if (!out[id] || String(x.updatedAt ?? "") > String(out[id].updatedAt ?? "")) out[id] = x;
  }
  return out;
}

// Call on every sign-in / sign-out. Anything tracked as a guest on this device
// moves into the signed-in account.
export function initApplications(uid) {
  let apps = readLS(uid);
  if (uid) {
    const guest = readLS(null);
    if (Object.keys(guest).length) { apps = mergeMaps(apps, guest); try { localStorage.removeItem(lsKey(null)); } catch {} }
  }
  current = { uid: uid || null, apps };
  writeLS(current.uid, apps);
  emit();
}

// Merge what's in Firestore; if this device had newer/extra entries, push back.
export function mergeRemote(remote) {
  const merged = mergeMaps(current.apps, remote || {});
  const changed = JSON.stringify(merged) !== JSON.stringify(remote || {});
  commit(merged, { push: changed });
}

export function setRemoteWriter(fn) { remoteWriter = fn; }

export function trackApplication(id, { appliedAt, ref = "" } = {}) {
  const now = new Date().toISOString();
  const prev = current.apps[id];
  commit({ ...current.apps, [id]: {
    appliedAt: appliedAt || now.slice(0, 10),
    ref: String(ref || "").trim().slice(0, 60),
    status: prev?.status ?? "pending",
    createdAt: prev?.createdAt ?? now,
    lastCheckedAt: null,
    updatedAt: now,
  } });
}

export function updateApplication(id, patch) {
  const prev = current.apps[id];
  if (!prev) return;
  commit({ ...current.apps, [id]: { ...prev, ...patch, updatedAt: new Date().toISOString() } });
}

// "Still waiting" — push the next reminder another 30 days out.
export function snoozeApplication(id) { updateApplication(id, { lastCheckedAt: new Date().toISOString() }); }

export function removeApplication(id) {
  const { [id]: _gone, ...rest } = current.apps;
  commit(rest);
}

export function daysSince(iso, now = Date.now()) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, Math.floor((now - t) / DAY)) : 0;
}

// Pending and no check in the last 30 days.
export function isDueForCheck(app, now = Date.now()) {
  if (!app || app.status !== "pending") return false;
  return daysSince(app.lastCheckedAt || app.appliedAt, now) >= CHECK_AFTER_DAYS;
}

const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
const snapshot = () => current.apps;
export function useApplications() { return useSyncExternalStore(subscribe, snapshot, snapshot); }
export function getApplications() { return current.apps; }

// Load the guest/device list immediately, before auth resolves.
try { if (typeof localStorage !== "undefined") current = { uid: null, apps: readLS(null) }; } catch {}
