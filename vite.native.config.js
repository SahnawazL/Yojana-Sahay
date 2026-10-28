// vite.native.config.js — Yojana Sahay Android app build (Capacitor)
//
// Builds the same app into dist-native/ for packaging inside the APK:
//   • entry src/main-native.jsx (adds src/native/bridge.js before the app)
//   • no service worker / PWA (the app files are already on the phone)
//   • only the files the app itself uses are copied — the website's SEO pages
//     and open-data files stay on the website
// Used by .github/workflows/android-native.yml; the website build (vite.config.js)
// is unchanged and never includes the native bridge.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

let nativeOut = null; // build.outDir (dist-native, or a test copy)
const KEEP_PUBLIC = ["icons", "favicon.ico", "manifest.json", "logo.webp", "robots.txt"];

// Shown only if the app hasn't drawn anything 9 s after launch: the error(s)
// that stopped it, so a screenshot tells us exactly what went wrong.
const STARTUP_GUARD = `(function(){var E=[];
window.addEventListener("error",function(e){E.push((e.message||"error")+(e.filename?" @"+String(e.filename).split("/").pop()+":"+e.lineno:""))});
window.addEventListener("unhandledrejection",function(e){var r=e.reason;E.push("promise: "+(r&&r.message||r))});
setTimeout(function(){var root=document.getElementById("root");if(root&&root.childElementCount)return;
var all=(window.__ysBridgeErrors||[]).concat(E);var d=document.createElement("div");
d.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#003580;color:#fff;padding:24px;font:15px/1.5 sans-serif;overflow:auto";
d.innerHTML='<h2 style="margin:0 0 8px">Yojana Sahay could not start</h2><p style="margin:0 0 12px">Please take a screenshot of this screen and send it to yojanasahayofficial@gmail.com.</p><pre style="white-space:pre-wrap;font-size:12px;background:rgba(0,0,0,.25);padding:10px;border-radius:8px;margin:0"></pre><button style="margin-top:14px;padding:11px 18px;border:0;border-radius:10px;font-weight:700;font-size:15px">Try again</button>';
d.querySelector("pre").textContent=(all.length?all.join("\\n"):"No error message (the app did not draw its screen).")+"\\n\\n"+navigator.userAgent;
d.querySelector("button").onclick=function(){location.reload()};document.body.appendChild(d);
try{var C=window.Capacitor;if(C&&C.nativePromise){C.nativePromise("SplashScreen","hide",{}).catch(function(){});if(C.isPluginAvailable&&C.isPluginAvailable("YSLaunch"))C.nativePromise("YSLaunch","ready",{}).catch(function(){})}}catch(x){}},9000);})();`;

// A newer app version is downloaded and will be switched to as soon as the
// app code runs (src/native/bridge.js, "live update"): tell the launch screen
// to wait for it, so the animation isn't cut off by the switch.
const BUILD_NUM = Number(process.env.YS_BUILD || 0) || 0;
const SWITCH_CHECK = `(function(){try{var g=function(k,d){try{return JSON.parse(localStorage.getItem(k)||d)}catch(e){return JSON.parse(d)}};
var p=g("ys_live_pending","null"),f=g("ys_live_failed","[]"),a=Number(localStorage.getItem("ys_live_applying")||0);
if(a&&${BUILD_NUM}<a)return;if(p&&p.build>${BUILD_NUM}&&f.indexOf(p.build)<0)window.__ysSwitching=1}catch(e){}})();`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: "ys-native-entry",
      // order "pre": must run BEFORE Vite reads the page's <script> entry —
      // otherwise the swap to main-native.jsx happens too late and the Android
      // bridge is silently left out of the build.
      transformIndexHtml: { order: "pre", handler(html) {
        if (!html.includes('src="/src/main.jsx"')) throw new Error("index.html entry /src/main.jsx not found");
        return html
          .replace(/\/src\/main\.jsx/g, "/src/main-native.jsx")
          // the website registers its service worker here; the app doesn't use one
          .replace('if ("serviceWorker" in navigator) {', 'if ("serviceWorker" in navigator && !window.Capacitor) {')
          // if the app ever fails to start, say why on screen instead of a blank/stuck screen
          .replace("<head>", "<head>\n<script>" + STARTUP_GUARD + "</script>\n<script>" + SWITCH_CHECK + "</script>");
      } }
    },
    {
      // The launch animation gets a free hand first: the app's code (a big
      // file the phone needs a moment to start) is loaded ~1.3 s after the
      // animation begins, so its first, most visible part never stutters.
      // Loaded at once when there is no animation (or an update switch is due).
      name: "ys-native-boot",
      apply: "build",
      transformIndexHtml: { order: "post", handler(html) {
        const m = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>\s*/);
        if (!m) throw new Error("ys-native-boot: app entry <script> not found in the built page");
        const boot = `<script>(function(){var src=${JSON.stringify(m[1])},done=0,t0=performance.now();
function go(){if(done)return;done=1;var s=document.createElement("script");s.type="module";s.crossOrigin="";s.src=src;document.head.appendChild(s)}
window.__ysBoot=go;var sp=document.getElementById("html-splash");
if(!sp||sp.style.display==="none"||window.__ysSwitching)return go();
(function wait(){var st=window.__hsStart;if(typeof st==="number")return setTimeout(go,Math.max(0,st+1300-performance.now()));
if(performance.now()-t0>3000)return go();setTimeout(wait,40)})()})();</script>`;
        return html.replace(m[0], "").replace("</body>", boot + "\n</body>");
      } }
    },
    {
      name: "ys-native-public",
      apply: "build",
      configResolved(c) { nativeOut = path.resolve(c.root || ".", c.build.outDir); },
      closeBundle() {
        const out = nativeOut || path.resolve("dist-native");
        for (const name of KEEP_PUBLIC) {
          const src = path.resolve("public", name);
          if (fs.existsSync(src)) fs.cpSync(src, path.join(out, name), { recursive: true });
        }
      }
    }
  ],
  publicDir: false,
  // Google sign-in needs google-services.json (Firebase → Android app). Until it
  // is added as the GOOGLE_SERVICES_JSON secret, builds use a stub.
  resolve: process.env.YS_NATIVE_FIREBASE === "1" ? {} : {
    alias: { "@capacitor-firebase/authentication": path.resolve("src/native/firebase-auth-stub.js") }
  },
  define: {
    "import.meta.env.VITE_NATIVE": JSON.stringify("1"),
    // live updates (src/native/bridge.js): this copy's build id (commit time),
    // the Android-side version it needs, and (test builds only) a local feed
    __YS_BUILD__: JSON.stringify(process.env.YS_BUILD || "0"),
    __YS_NATIVE_API__: JSON.stringify(process.env.YS_NATIVE_API || fs.readFileSync("scripts/android-native/native-api.txt", "utf8").trim()),
    __YS_LIVE_URL__: JSON.stringify(process.env.YS_LIVE_URL || "")
  },
  build: { outDir: "dist-native", emptyOutDir: true, chunkSizeWarningLimit: 6000 }
});
