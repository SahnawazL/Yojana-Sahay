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

export default defineConfig({
  plugins: [
    react(),
    {
      name: "ys-native-entry",
      transformIndexHtml(html) {
        return html
          .replace(/\/src\/main\.jsx/g, "/src/main-native.jsx")
          // the website registers its service worker here; the app doesn't use one
          .replace('if ("serviceWorker" in navigator) {', 'if ("serviceWorker" in navigator && !window.Capacitor) {');
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
