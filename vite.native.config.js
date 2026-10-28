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
try{window.Capacitor&&window.Capacitor.nativePromise&&window.Capacitor.nativePromise("SplashScreen","hide",{})}catch(x){}},9000);})();`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: "ys-native-entry",
      transformIndexHtml(html) {
        return html
          .replace(/\/src\/main\.jsx/g, "/src/main-native.jsx")
          // the website registers its service worker here; the app doesn't use one
          .replace('if ("serviceWorker" in navigator) {', 'if ("serviceWorker" in navigator && !window.Capacitor) {')
          // if the app ever fails to start, say why on screen instead of a blank/stuck screen
          .replace("<head>", "<head>\n<script>" + STARTUP_GUARD + "</script>");
      }
    },
    {
      name: "ys-native-public",
      apply: "build",
      closeBundle() {
        const out = path.resolve("dist-native");
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
  define: { "import.meta.env.VITE_NATIVE": JSON.stringify("1") },
  build: { outDir: "dist-native", emptyOutDir: true, chunkSizeWarningLimit: 6000 }
});
