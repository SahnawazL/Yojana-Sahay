// src/native/bridge.js — Yojana Sahay Android app (Capacitor) only
// ─────────────────────────────────────────────────────────────────────────────
// Loaded ONLY in the Android app build (vite.native.config.js → main-native.jsx);
// the website never includes it. The app's code is packaged inside the APK and
// runs from https://localhost, so this file connects it to the real services
// and to Android:
//   • /api/… calls go to https://yojanasahay.vercel.app (the website's server)
//   • Google sign-in uses the native Android account picker (Google blocks its
//     web sign-in inside apps) — App.jsx calls window.ysNative.googleSignIn()
//   • navigator.share → Android share sheet
//   • links to the website's pages and other sites open in an in-app browser tab
//   • Android back button closes the open sheet/dialog, then leaves the app
//   • text shared to the app from WhatsApp/SMS → "Is this message real?" check
//   • splash screen and status bar
// ─────────────────────────────────────────────────────────────────────────────
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Share } from "@capacitor/share";
import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const SITE = "https://yojanasahay.vercel.app";

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("ys-native");
  try { sessionStorage.setItem("ys_native", "1"); } catch {}

  // ── Server calls: relative /api/… → the website's server ─────────────────
  const toSite = (u) => (typeof u === "string" && u.startsWith("/api/")) ? SITE + u : u;
  const origFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string") return origFetch(toSite(input), init);
    if (input instanceof URL && input.origin === location.origin && input.pathname.startsWith("/api/")) return origFetch(SITE + input.pathname + input.search, init);
    if (input instanceof Request) {
      const u = new URL(input.url);
      if (u.origin === location.origin && u.pathname.startsWith("/api/")) return origFetch(new Request(SITE + u.pathname + u.search, input), init);
    }
    return origFetch(input, init);
  };
  // beacons can't be sent cross-site with JSON; returning false makes the
  // callers fall back to fetch (above)
  if (navigator.sendBeacon) {
    const origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => (typeof url === "string" && url.startsWith("/api/")) ? false : origBeacon(url, data);
  }

  // ── Native Google sign-in (account picker) ────────────────────────────────
  window.ysNative = {
    platform: Capacitor.getPlatform(),
    async googleSignIn() {
      const r = await FirebaseAuthentication.signInWithGoogle();
      const c = r && r.credential;
      if (!c || !c.idToken) throw Object.assign(new Error("Google sign-in was cancelled."), { code: "auth/cancelled-popup-request" });
      return { idToken: c.idToken, accessToken: c.accessToken || null };
    },
    async googleSignOut() { try { await FirebaseAuthentication.signOut(); } catch {} },
    openUrl(url) { return Browser.open({ url, presentationStyle: "popover" }); }
  };

  // ── Share sheet ────────────────────────────────────────────────────────────
  navigator.share = async (data = {}) => {
    const url = data.url && data.url.startsWith("/") ? SITE + data.url : data.url;
    await Share.share({ title: data.title, text: data.text, url, dialogTitle: data.title || "Share" });
  };
  navigator.canShare = () => true;

  // ── Links: website pages and other sites open in an in-app browser tab ────
  // The app itself is a single page; its SEO pages (/schemes/…, /yojana/…,
  // about.html, privacy.html …) live on the website.
  const external = (href) => {
    try {
      const u = new URL(href, location.href);
      // tel:, mailto:, sms:, whatsapp:, upi: … are left to Android (Capacitor opens the right app)
      if (u.origin === location.origin) {
        const p = u.pathname;
        if (p === "/" || p === "/index.html" || p.startsWith("/admin") || p.startsWith("/embed")) return null; // inside the app
        if (p.startsWith("/icons/") || p.startsWith("/assets/")) return null;
        return { web: SITE + p + u.search + u.hash };
      }
      if (u.protocol === "http:" || u.protocol === "https:") return { web: u.href };
    } catch {}
    return null;
  };
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("download")) return;
    const ext = external(a.getAttribute("href"));
    if (!ext) return;
    e.preventDefault();
    Browser.open({ url: ext.web });
  }, true);
  const origOpen = window.open;
  window.open = (url, target, features) => {
    const ext = url ? external(String(url)) : null;
    if (ext && ext.web) { Browser.open({ url: ext.web }); return null; }
    return origOpen ? origOpen.call(window, url, target, features) : null;
  };

  // ── Android back button ───────────────────────────────────────────────────
  // The app already adds a history entry for each screen it opens (scheme
  // details, eligibility check, FAQ…) and closes it on "back", exactly like the
  // website on Android. Order:
  //   1) an open pop-up without its own history entry (search, money check,
  //      chat sheets) → close it (Escape, then its close button)
  //   2) history → back (closes the top screen)
  //   3) nothing open → leave the app (it stays in recent apps)
  const openDialog = () => {
    const list = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
    for (let i = list.length - 1; i >= 0; i--) {
      const el = list[i], r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05) return el;
    }
    return null;
  };
  const escape = () => {
    const o = { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true, cancelable: true };
    (document.activeElement && document.activeElement !== document.body ? document.activeElement : document).dispatchEvent(new KeyboardEvent("keydown", o));
    window.dispatchEvent(new KeyboardEvent("keydown", o));
  };
  const back = (canGoBack) => {
    if (canGoBack && history.length > 1) history.back();
    else App.minimizeApp();
  };
  App.addListener("backButton", ({ canGoBack }) => {
    if (window.dispatchEvent(new CustomEvent("ys-native-back", { cancelable: true })) === false) return; // a screen handled it
    const d = openDialog();
    if (!d) { back(canGoBack); return; }
    escape();
    setTimeout(() => {
      if (openDialog() !== d) return;                          // closed on Escape
      const btn = d.querySelector('[aria-label*="close" i], [aria-label*="बंद"], [aria-label*="back" i], [data-close]');
      if (btn) { btn.click(); return; }
      if (canGoBack) history.back();                           // last resort: never trap the user
    }, 160);
  });

  // ── Text shared to the app (WhatsApp/SMS "Share" → Yojana Sahay) ─────────
  // MainActivity passes the text in; App.jsx listens for "ys-native-share".
  window.__ysShared = (text) => {
    const t = String(text || "").trim().slice(0, 2000);
    if (!t) return;
    window.__ysPendingShare = t;
    window.dispatchEvent(new CustomEvent("ys-native-share", { detail: { text: t } }));
  };

  // ── Splash + status bar ───────────────────────────────────────────────────
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: "#003580" }).catch(() => {});
  const hide = () => SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {});
  if (document.readyState === "complete") setTimeout(hide, 300);
  else window.addEventListener("load", () => setTimeout(hide, 300), { once: true });
  setTimeout(hide, 4000); // never stay on the splash
}
