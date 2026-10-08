// src/push.js — Yojana Sahay · phone notifications (browser side)
// ─────────────────────────────────────────────────────────────────────────────
// Turns Web Push on/off for the signed-in user. The subscription is saved in
// Firestore at pushSubs/{uid} (owner-only rule); the daily cron
// (api/_lib/push.js) sends at most one reminder a day: deadline closing soon,
// tracked application waiting 30+ days, or a new matching scheme.
// ─────────────────────────────────────────────────────────────────────────────

const flagKey = uid => `yojana_push_${uid}`;

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// iPhone/iPad only allow web notifications from an app added to the Home Screen.
export function needsIosInstall() {
  if (typeof navigator === "undefined") return false;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone === true;
  return ios && !standalone;
}

function b64ToBytes(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
function sameKey(sub, keyBytes) {
  try {
    const cur = new Uint8Array(sub.options.applicationServerKey);
    return cur.length === keyBytes.length && cur.every((v, i) => v === keyBytes[i]);
  } catch { return true; } // can't tell → keep it
}

async function registration(timeoutMs = 8000) {
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise(r => setTimeout(() => r(null), timeoutMs)),
  ]);
  if (!reg) throw Object.assign(new Error("Service worker not ready"), { code: "no-sw" });
  return reg;
}

// → "unsupported" | "ios-install" | "denied" | "on" | "off"
export async function pushState(uid) {
  if (needsIosInstall()) return "ios-install";
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub && localStorage.getItem(flagKey(uid)) === "1" ? "on" : "off";
  } catch { return "off"; }
}

// saveSub(subscriptionJSON) stores it for this user. Throws {code} on failure.
export async function enablePush(uid, saveSub) {
  if (!pushSupported()) throw Object.assign(new Error("unsupported"), { code: "unsupported" });
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw Object.assign(new Error("denied"), { code: "denied" });
  const reg = await registration();
  const res = await fetch("/api/stats?action=vapid");
  const { publicKey } = res.ok ? await res.json() : {};
  if (!publicKey) throw Object.assign(new Error("no key"), { code: "server" });
  const key = b64ToBytes(publicKey);
  let sub = await reg.pushManager.getSubscription();
  if (sub && !sameKey(sub, key)) { await sub.unsubscribe().catch(() => {}); sub = null; }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  await saveSub(sub.toJSON());
  try { localStorage.setItem(flagKey(uid), "1"); } catch {}
  return sub;
}

// removeSub(endpoint) deletes it for this user.
export async function disablePush(uid, removeSub) {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) { await removeSub(sub.endpoint); await sub.unsubscribe().catch(() => {}); }
  } finally {
    try { localStorage.removeItem(flagKey(uid)); } catch {}
  }
}
