// src/track.js — Yojana Sahay · anonymous usage counters for the admin
// ─────────────────────────────────────────────────────────────────────────────
// Counts what people DO in the app — opened a scheme, tapped Apply, marked
// "I've applied", got approved, shared a result, added family, quiz steps —
// so the admin can see what works. Only counters: no names, no answers, no
// user ids are sent. Events are batched and sent every few seconds (or when
// the page is hidden) to /api/log-checker-run (type "events"), which adds
// them to appStats/events.
// ─────────────────────────────────────────────────────────────────────────────

export const EVENTS = [
  "scheme_view", "apply_click", "app_track", "app_approved", "app_received", "app_rejected",
  "share_result", "share_checklist", "family_add", "push_on", "push_off",
  "quiz_start", "quiz_step", "quiz_done", "quiz_group",
  "near_me", "life_event", "money_cal", "unlock", "money_check",
  "visit", "visit_new",
];

let queue = [];
let timer = null;
const seen = new Set(); // once-per-session events (e.g. viewing the same scheme twice)

function flush() {
  clearTimeout(timer); timer = null;
  if (!queue.length) return;
  const body = JSON.stringify({ type: "events", events: queue.splice(0, 40) });
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (!(navigator.sendBeacon && navigator.sendBeacon("/api/log-checker-run", blob))) {
      fetch("/api/log-checker-run", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* best effort */ }
  if (queue.length) timer = setTimeout(flush, 500);
}

// track("scheme_view", { s: "pmkisan" }) · track("quiz_step", { k: "income" })
// once: only count the first time this exact event happens in this session.
export function track(name, data = {}, { once = false } = {}) {
  try {
    if (!EVENTS.includes(name)) return;
    if (/bot|crawl|spider|headless/i.test(navigator.userAgent)) return;
    const ev = { e: name };
    if (data.s) ev.s = String(data.s).slice(0, 60);
    if (data.k) ev.k = String(data.k).slice(0, 30);
    if (once) {
      const key = `${ev.e}|${ev.s || ""}|${ev.k || ""}`;
      if (seen.has(key)) return;
      seen.add(key);
    }
    queue.push(ev);
    if (queue.length >= 25) flush();
    else if (!timer) timer = setTimeout(flush, 4000);
  } catch { /* never break the app */ }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);
}

// One "visit" per device per day (India time) — the admin's Visitors count.
// k says where it was opened: "app" (Play Store app), "installed" (added to
// home screen) or "web". "visit_new" marks a device's very first visit.
// Anonymous: only the day is remembered on this phone, nothing about the person.
export function trackVisit() {
  try {
    const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
    if (localStorage.getItem("ys_visit_day") === day) return;
    localStorage.setItem("ys_visit_day", day);
    let src = "web";
    try {
      if (sessionStorage.getItem("ys_twa") === "1" || document.referrer.indexOf("android-app://") === 0) src = "app";
      else if (window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone) src = "installed";
    } catch {}
    track("visit", { k: src });
    if (!localStorage.getItem("ys_first_seen")) { localStorage.setItem("ys_first_seen", day); track("visit_new", { k: src }); }
  } catch { /* storage blocked — skip */ }
}
