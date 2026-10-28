// src/push.js — Yojana Sahay · phone notifications (browser side)
// ─────────────────────────────────────────────────────────────────────────────
// Turns Web Push on/off for the signed-in user. The subscription is saved in
// Firestore at pushSubs/{uid} (owner-only rule); the daily cron
// (api/_lib/push.js) sends at most one reminder a day: deadline closing soon,
// tracked application waiting 30+ days, or a new matching scheme.
// ─────────────────────────────────────────────────────────────────────────────

const flagKey = uid => `yojana_push_${uid}`;
const tokKey = uid => `yojana_push_tok_${uid}`;

// Android app: real Android notifications through Firebase Cloud Messaging
// (window.ysNative.push, src/native/bridge.js). The token is stored in the same
// pushSubs/{uid} list as website subscriptions, as { type: "fcm", endpoint:
// "fcm:<token>", token } — the daily server job (api/_lib/push.js) sends to both.
const isApp = () => typeof window !== "undefined" && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const appPush = () => (typeof window !== "undefined" && window.ysNative && window.ysNative.push) || null;
const fcmSub = token => ({ type: "fcm", endpoint: `fcm:${token}`, token, platform: "android" });
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch {} };
export const isAndroidApp = isApp;

export function pushSupported() {
  if (isApp()) return !!appPush();
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
// saveSub (optional): in the Android app, re-saves the token if it changed.
export async function pushState(uid, saveSub) {
  if (isApp()) {
    const P = appPush();
    if (!P) return "unsupported";
    let perm = "prompt";
    try { perm = await P.permission(); } catch {}
    if (perm === "denied") return "denied";
    if (lsGet(flagKey(uid)) !== "1" || perm !== "granted") return "off";
    try {
      const t = await P.token();
      if (t && saveSub && t !== lsGet(tokKey(uid))) { await saveSub(fcmSub(t)); lsSet(tokKey(uid), t); }
    } catch {}
    return "on";
  }
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
  if (isApp()) {
    const P = appPush();
    if (!P) throw Object.assign(new Error("unsupported"), { code: "unsupported" });
    const perm = await P.request();
    if (perm !== "granted") throw Object.assign(new Error("denied"), { code: "denied" });
    const t = await P.token();
    if (!t) throw Object.assign(new Error("no token"), { code: "server" });
    await saveSub(fcmSub(t));
    lsSet(tokKey(uid), t); lsSet(flagKey(uid), "1");
    return { token: t };
  }
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
  if (isApp()) {
    const t = lsGet(tokKey(uid));
    try { if (t) await removeSub(`fcm:${t}`); }
    finally { lsDel(flagKey(uid)); lsDel(tokKey(uid)); await appPush()?.remove(); }
    return;
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) { await removeSub(sub.endpoint); await sub.unsubscribe().catch(() => {}); }
  } finally {
    try { localStorage.removeItem(flagKey(uid)); } catch {}
  }
}
