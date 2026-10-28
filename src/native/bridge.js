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
//   • live updates: the newest app files are downloaded from GitHub in the
//     background and used from the next start (automatic roll-back if a new
//     version ever fails to start) — see .github/workflows/app-live-update.yml
//   • deadline reminders as Android notifications (Firebase Cloud Messaging)
// ─────────────────────────────────────────────────────────────────────────────
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Share } from "@capacitor/share";
import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

// Set at build time (vite.native.config.js): this copy's build id (commit time),
// the Android-side version it needs, and where new versions are announced.
const BUILD = Number(typeof __YS_BUILD__ !== "undefined" ? __YS_BUILD__ : 0) || 0;
const NATIVE_API = Number(typeof __YS_NATIVE_API__ !== "undefined" ? __YS_NATIVE_API__ : 0) || 0;
const LIVE_URL = (typeof __YS_LIVE_URL__ !== "undefined" && __YS_LIVE_URL__) ||
  `https://github.com/SahnawazL/Yojana-Sahay/releases/download/app-live/latest-api${NATIVE_API}.json`;

const SITE = "https://yojanasahay.vercel.app";

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("ys-native");
  try { sessionStorage.setItem("ys_native", "1"); } catch {}

  // ── Never stay on the launch screen (even if something below fails) ───────
  setTimeout(() => { SplashScreen.hide().catch(() => {}); }, 3500);
  // each part runs on its own: one failing part must never stop the app
  const part = (name, fn) => {
    try { fn(); }
    catch (e) { (window.__ysBridgeErrors = window.__ysBridgeErrors || []).push(name + ": " + (e && e.message || e)); console.error("[app] " + name, e); }
  };

  // ── Live updates: always the newest app files ─────────────────────────────
  // 1) once this copy has drawn its screen, tell the updater it works (a copy
  //    that never gets this far is rolled back automatically);
  // 2) a newer copy downloaded earlier is switched to at start-up, while the
  //    launch screen is still showing;
  // 3) every open checks for a newer copy and downloads it in the background;
  // 4) after 10+ minutes away, coming back switches to it too (never in the
  //    middle of something — Google sign-in, sharing, a form).
  part("live update", () => {
    const K = { pending: "ys_live_pending", failed: "ys_live_failed", applying: "ys_live_applying" };
    const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
                 set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
                 del: (k) => { try { localStorage.removeItem(k); } catch {} } };
    const failedList = () => { try { return JSON.parse(ls.get(K.failed) || "[]"); } catch { return []; } };
    const isFailed = (b) => failedList().includes(b);
    const addFailed = (b) => ls.set(K.failed, JSON.stringify([...new Set([...failedList(), b])].slice(-20)));
    const pendingInfo = () => { try { return JSON.parse(ls.get(K.pending) || "null"); } catch { return null; } };
    const live = window.__ysLive = { build: BUILD, api: NATIVE_API, url: LIVE_URL, state: "start", log: [] };
    const note = (m) => { live.log.push(new Date().toISOString().slice(11, 19) + " " + m); if (live.log.length > 30) live.log.shift(); };

    // a copy we switched to didn't confirm in time → the updater rolled back to this one
    const applying = Number(ls.get(K.applying) || 0);
    if (applying) {
      ls.del(K.applying);
      if (BUILD < applying) { addFailed(applying); ls.del(K.pending); note("rolled back from " + applying); }
    }

    // 1) confirm this copy works
    let tries = 0;
    const confirmTimer = setInterval(() => {
      tries++;
      const root = document.getElementById("root");
      if (root && root.childElementCount && !root.querySelector(".seo-fallback")) {
        clearInterval(confirmTimer);
        CapacitorUpdater.notifyAppReady().then(() => { live.ready = true; note("ready"); }).catch((e) => note("ready failed " + (e && e.message)));
      } else if (tries > 80) clearInterval(confirmTimer);
    }, 250);

    const apply = (p, why) => {
      ls.set(K.applying, String(p.build));
      live.state = "applying " + p.build; note("apply " + p.build + " (" + why + ")");
      CapacitorUpdater.set({ id: p.id }).catch((e) => {          // bundle missing (e.g. after an app update) → fetch it again later
        ls.del(K.applying); ls.del(K.pending); note("apply failed " + (e && e.message));
      });
    };

    // 2) switch to a newer copy at start-up
    const p0 = pendingInfo();
    if (p0 && p0.build > BUILD && !isFailed(p0.build)) { apply(p0, "start"); return; }
    if (p0) ls.del(K.pending);

    // 3) check for a newer copy
    let checking = false;
    const check = async () => {
      if (checking) return; checking = true;
      try {
        const info = await App.getInfo().catch(() => ({}));
        const nativeApi = Number(String(info.version || "").split(".")[1]) || 0;
        const r = await CapacitorHttp.get({ url: LIVE_URL + (LIVE_URL.includes("?") ? "&" : "?") + "t=" + Date.now(), headers: { "Cache-Control": "no-cache" }, connectTimeout: 10000, readTimeout: 15000 });
        if (r.status !== 200) { note("check " + r.status); return; }
        const m = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
        live.latest = m && m.build;
        if (!m || !m.url || !(m.build > BUILD)) { live.state = "up to date"; return; }
        if (!/^[0-9a-f]{64}$/i.test(String(m.sha256 || ""))) { live.state = "no checksum — skipped"; return; }
        if (m.api !== nativeApi || m.api !== NATIVE_API) { live.state = "needs app update (api " + m.api + ")"; return; }
        if (isFailed(m.build)) { live.state = "skipping failed " + m.build; return; }
        const have = pendingInfo();
        if (have && have.build >= m.build) { live.state = "ready to apply " + have.build; return; }
        live.state = "downloading " + m.build; note("download " + m.build);
        // checksum (SHA-256 of the zip): the updater only accepts the exact file that was published
        const b = await CapacitorUpdater.download({ url: m.url, version: String(m.build), checksum: String(m.sha256).toLowerCase() });
        ls.set(K.pending, JSON.stringify({ id: b.id, build: m.build }));
        live.state = "ready to apply " + m.build; note("downloaded " + m.build);
      } catch (e) {
        live.state = "check failed"; note("check failed " + (e && e.message));
      } finally { checking = false; }
    };
    setTimeout(check, 5000);

    // 4) back after 10+ minutes → switch; otherwise just check again
    let awaySince = 0;
    App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) { awaySince = Date.now(); return; }
      const away = awaySince ? Date.now() - awaySince : 0;
      awaySince = 0;
      const p = pendingInfo();
      if (away >= 10 * 60 * 1000 && p && p.build > BUILD && !isFailed(p.build)) apply(p, "resume");
      else if (away >= 60 * 1000) check();
    });
    window.ysNative = Object.assign(window.ysNative || {}, { liveCheck: check });
  });

  // ── Server calls: relative /api/… → the website's server ─────────────────
  part("server calls", () => {
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
  });

  // ── Native Google sign-in (account picker) ────────────────────────────────
  part("google sign-in", () => {
  window.ysNative = Object.assign(window.ysNative || {}, {
    platform: Capacitor.getPlatform(),
    async googleSignIn() {
      const r = await FirebaseAuthentication.signInWithGoogle();
      const c = r && r.credential;
      if (!c || !c.idToken) throw Object.assign(new Error("Google sign-in was cancelled."), { code: "auth/cancelled-popup-request" });
      return { idToken: c.idToken, accessToken: c.accessToken || null };
    },
    async googleSignOut() { try { await FirebaseAuthentication.signOut(); } catch {} },
    openUrl(url) { return Browser.open({ url, presentationStyle: "popover" }); }
  });
  });

  // ── Deadline reminders: Android notifications (Firebase Cloud Messaging) ──
  // src/push.js uses window.ysNative.push; the token is saved with the user's
  // reminder settings (pushSubs/{uid}) and the daily server job sends to it.
  part("notifications", () => {
    const perm = (r) => (r && r.receive) || "prompt";
    window.ysNative = Object.assign(window.ysNative || {}, {
      push: {
        permission: async () => perm(await FirebaseMessaging.checkPermissions()),
        request: async () => perm(await FirebaseMessaging.requestPermissions()),
        token: async () => (await FirebaseMessaging.getToken()).token || "",
        remove: async () => { try { await FirebaseMessaging.deleteToken(); } catch {} },
      }
    });
    FirebaseMessaging.createChannel({ id: "reminders", name: "Scheme reminders", description: "Deadlines closing soon, application checks and new schemes for you", importance: 4, visibility: 1 }).catch(() => {});
    // tapping a reminder opens that scheme in the app
    FirebaseMessaging.addListener("notificationActionPerformed", (e) => {
      try {
        const url = (e && e.notification && e.notification.data && e.notification.data.url) || "";
        const u = new URL(url, SITE);
        if (u.origin === SITE && (u.pathname === "/" || u.pathname === "/index.html")) {
          if (location.search !== u.search) location.replace("/" + u.search);
        } else if (/^https?:$/.test(u.protocol)) Browser.open({ url: u.href });
      } catch {}
    });
  });

  // ── Share sheet (text, links and images such as the benefits card) ──────
  part("share", () => {
  const blobToBase64 = (blob) => new Promise((ok, bad) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] || "");
    r.onerror = () => bad(r.error);
    r.readAsDataURL(blob);
  });
  navigator.share = async (data = {}) => {
    const url = data.url && data.url.startsWith("/") ? SITE + data.url : data.url;
    let files;
    if (data.files && data.files.length) {
      files = [];
      for (const f of Array.from(data.files).slice(0, 5)) {
        const name = (f.name || "share.png").replace(/[^\w.-]+/g, "_");
        const w = await Filesystem.writeFile({ path: "share/" + name, data: await blobToBase64(f), directory: Directory.Cache, recursive: true });
        files.push(w.uri);
      }
    }
    try {
      await Share.share({ title: data.title, text: data.text, url, files, dialogTitle: data.title || "Share" });
    } catch (e) {
      // closing the share sheet = cancelled (the website gets an AbortError too)
      if (/cancel/i.test(String(e && e.message))) throw new DOMException("Share cancelled", "AbortError");
      throw e;
    }
  };
  navigator.canShare = () => true;
  });

  // ── Read aloud: Android's own text-to-speech ──────────────────────────────
  part("read aloud", () => {
  // Android's app view has no Web Speech API, so the app's read-aloud
  // (src/voice.js, news ticker) is given the same API backed by Android TTS.
  // (Android's app view may list these APIs without them actually working, so
  // the app always uses the Android versions.)
  {
    class Utterance {
      constructor(text) { this.text = text || ""; this.lang = ""; this.rate = 1; this.pitch = 1; this.volume = 1; this.voice = null; this.onstart = null; this.onend = null; this.onerror = null; this.onboundary = null; }
    }
    const VOICES = [
      { name: "Android voice (Hindi)", lang: "hi-IN", localService: true, default: false, voiceURI: "android-hi" },
      { name: "Android voice (English, India)", lang: "en-IN", localService: true, default: true, voiceURI: "android-en" }
    ];
    const queue = [];
    let running = false, gen = 0;
    const synth = {
      speaking: false, pending: false, paused: false, onvoiceschanged: null,
      speak(u) { queue.push(u); synth.pending = true; run(); },
      cancel() { queue.length = 0; gen++; synth.speaking = false; synth.pending = false; TextToSpeech.stop().catch(() => {}); },
      pause() {}, resume() {},
      getVoices() { return VOICES.slice(); },
      addEventListener() {}, removeEventListener() {}
    };
    const run = async () => {
      if (running) return;
      running = true;
      const my = gen;
      while (queue.length && my === gen) {
        const u = queue.shift();
        synth.pending = queue.length > 0;
        synth.speaking = true;
        try {
          if (u.onstart) u.onstart({ utterance: u });
          if (!String(u.text).trim()) { if (u.onend) u.onend({ utterance: u }); continue; }
          // rate: web 1 = normal; Android 1 = normal too
          await TextToSpeech.speak({ text: u.text, lang: (u.voice && u.voice.lang) || u.lang || "en-IN", rate: u.rate || 1, pitch: u.pitch || 1, volume: u.volume == null ? 1 : u.volume, category: "playback" });
          if (my === gen && u.onend) u.onend({ utterance: u });
        } catch (e) {
          if (my === gen && u.onerror) u.onerror({ utterance: u, error: "synthesis-failed" });
        }
      }
      if (my === gen) synth.speaking = false;
      running = false;
      if (queue.length) run();          // speak() was called during a cancel
    };
    try {
      Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Utterance, configurable: true, writable: true });
      Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
    } catch {}
  }
  });

  // ── Voice input: Android's speech recognition ─────────────────────────────
  part("voice input", () => {
  // Same API the AI chat's mic button uses on the website.
  {
    class Recognition {
      constructor() { this.lang = "en-IN"; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1; this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null; this._aborted = false; this._ended = false; }
      _end() { if (this._ended) return; this._ended = true; if (this.onend) this.onend({}); }
      _fail(code) { if (this.onerror) this.onerror({ error: code }); this._end(); }
      async start() {
        try {
          const av = await SpeechRecognition.available();
          if (!av || !av.available) return this._fail("service-not-allowed");
          let perm = await SpeechRecognition.checkPermissions();
          if (perm.speechRecognition !== "granted") perm = await SpeechRecognition.requestPermissions();
          if (perm.speechRecognition !== "granted") return this._fail("not-allowed");
          if (this.onstart) this.onstart({});
          const r = await SpeechRecognition.start({ language: this.lang || "en-IN", maxResults: this.maxAlternatives || 1, partialResults: false, popup: false });
          if (this._aborted) return this._end();
          const text = r && r.matches && r.matches[0];
          if (text) {
            const alt = { transcript: text, confidence: 0.9 };
            const result = Object.assign([alt], { isFinal: true });
            if (this.onresult) this.onresult({ resultIndex: 0, results: Object.assign([result], { item: (i) => [result][i] }) });
          } else if (this.onerror) this.onerror({ error: "no-speech" });
          this._end();
        } catch (e) {
          if (this._aborted) return this._end();
          this._fail(/permission/i.test(String(e && e.message)) ? "not-allowed" : "no-speech");
        }
      }
      stop() { SpeechRecognition.stop().catch(() => {}); }
      abort() { this._aborted = true; SpeechRecognition.stop().catch(() => {}); this._end(); }
    }
    try {
      Object.defineProperty(window, "SpeechRecognition", { value: Recognition, configurable: true, writable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: Recognition, configurable: true, writable: true });
    } catch {}
  }
  });

  // ── Links: website pages and other sites open in an in-app browser tab ────
  part("links", () => {
  // The app itself is a single page; its SEO pages (/schemes/…, /yojana/…,
  // about.html, privacy.html …) live on the website.
  const external = (href) => {
    try {
      const u = new URL(href, location.href);
      // tel:, mailto:, sms:, whatsapp:, upi: … are left to Android (Capacitor opens the right app)
      if (u.origin === location.origin) {
        const p = u.pathname;
        // the admin dashboard always opens on the website (full browser: reports,
        // printing, downloads) — the app itself is only the people-facing part
        if (p === "/" || p === "/index.html" || p.startsWith("/embed")) return null; // inside the app
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
  });

  // ── Android back button ───────────────────────────────────────────────────
  part("back button", () => {
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
  });

  // ── Text shared to the app (WhatsApp/SMS "Share" → Yojana Sahay) ─────────
  part("shared text", () => {
  // MainActivity passes the text in; App.jsx listens for "ys-native-share".
  window.__ysShared = (text) => {
    const t = String(text || "").trim().slice(0, 2000);
    if (!t) return;
    window.__ysPendingShare = t;
    window.dispatchEvent(new CustomEvent("ys-native-share", { detail: { text: t } }));
  };
  });

  // ── Splash + status bar ───────────────────────────────────────────────────
  part("splash", () => {
  // white status-bar icons on the app's navy bar (MainActivity keeps the app
  // below the status bar and above the keyboard / navigation bar)
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  // Android's launch screen steps aside as soon as the app can draw, so the
  // app's own animated launch screen (#html-splash in index.html — chakra,
  // particles, logo) is what people see while the app loads.
  const hide = () => SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {});
  requestAnimationFrame(() => requestAnimationFrame(hide));
  setTimeout(hide, 1500); // in case the screen isn't drawing frames yet
  });

}
