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
      if (u.protocol === "tel:" || u.protocol === "mailto:" || u.protocol === "sms:" || u.protocol === "whatsapp:" || u.protocol === "upi:") return { system: u.href };
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
    if (ext.system) window.location.href = ext.system;      // dialer, mail, WhatsApp…
    else Browser.open({ url: ext.web });
  }, true);
  const origOpen = window.open;
  window.open = (url, target, features) => {
    const ext = url ? external(String(url)) : null;
    if (ext && ext.web) { Browser.open({ url: ext.web }); return null; }
    if (ext && ext.system) { window.location.href = ext.system; return null; }
    return origOpen ? origOpen.call(window, url, target, features) : null;
  };

  // ── Android back button ───────────────────────────────────────────────────
  // 1) an open dialog/sheet → close it (the app's sheets close on Escape)
  // 2) page history → go back   3) otherwise → leave the app (stays in recents)
  const openDialog = () => {
    const list = document.querySelectorAll('[role="dialog"], [aria-modal="true"], .ys-sheet, .sheet-overlay');
    for (const el of list) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0") return el;
    }
    return null;
  };
  App.addListener("backButton", ({ canGoBack }) => {
    const d = openDialog();
    if (d) {
      const ev = new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true, cancelable: true });
      (document.activeElement || document.body).dispatchEvent(ev);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
      // still open (no Escape handler)? try its close button
      setTimeout(() => {
        if (openDialog() === d) {
          const btn = d.querySelector('[aria-label*="lose" i], [aria-label*="ack" i], button.close, .close');
          if (btn) btn.click();
        }
      }, 120);
      return;
    }
    if (window.dispatchEvent(new CustomEvent("ys-native-back", { cancelable: true })) === false) return; // app handled it
    if (canGoBack && history.length > 1) history.back();
    else App.minimizeApp();
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
