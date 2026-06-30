// vite.config.js — Yojana Sahay
//
// RUN ONCE before deploying:
//   npm install -D vite-plugin-pwa workbox-window
//
// ALSO: delete public/sw.js from your repo.
//   If it stays, Vite copies it to dist/sw.js and overwrites the generated one.
//   public/manifest.json → KEEP as-is (manifest: false below uses it unchanged).

import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import { VitePWA }      from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // Silently updates the service worker in the background.
      // New version activates on next navigation — no "reload to update" prompt.
      registerType: "autoUpdate",

      // ── Manifest ─────────────────────────────────────────────────────────────
      // false = don't generate a new manifest. Your existing public/manifest.json
      // is already perfect — Vite copies it to dist/ automatically.
      manifest: false,

      // ── Workbox (generates the real service worker at build time) ─────────────
      workbox: {
        // Precache EVERYTHING Vite outputs: hashed JS chunks, CSS, HTML,
        // icons, images, fonts bundled locally. This is the fix for Bug 1 —
        // the manual sw.js could never know these hashed filenames at build time.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],

        // Apply updates immediately — no tab-close required.
        skipWaiting:  true,
        clientsClaim: true,

        // Workbox's default precache limit is 2 MiB. App.jsx is a large single-file
        // component (9,600+ lines) so the built bundle exceeds that. Raised to 5 MiB
        // to cover it with headroom. Long-term, consider React.lazy() code-splitting
        // for AdminDashboard.jsx / SchemeVerifier.jsx to shrink the main bundle.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // SPA fallback: any navigation that isn't a precached file serves index.html.
        // Denylist: /api/* must never fall back to index.html (they're server functions).
        navigateFallback:          "/index.html",
        navigateFallbackDenylist:  [/^\/api\//],

        // ── Runtime caching strategies ──────────────────────────────────────────
        runtimeCaching: [

          // /api/stats and any other Vercel serverless functions:
          // NetworkFirst with 5-second timeout.
          // Fix for Bug 2: was accidentally skipped by the "vercel" hostname check.
          // Now: tries network → if offline or slow, returns last cached response.
          {
            urlPattern:  /^\/api\//,
            handler:     "NetworkFirst",
            options: {
              cacheName:             "ys-api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries:    20,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },

          // Noto Sans / Noto Sans Devanagari stylesheet from Google Fonts.
          // Fix for Bug 3: was in the skip list, re-downloaded every page load.
          // Now: CacheFirst — downloaded once, served from cache forever (URLs are versioned).
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:    "CacheFirst",
            options: {
              cacheName: "ys-fonts-css",
              expiration: {
                maxEntries:    10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },

          // Noto font .woff2 binaries from gstatic.
          // Same fix — these are the actual font files, largest render-blocking assets.
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler:    "CacheFirst",
            options: {
              cacheName:         "ys-fonts-woff2",
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries:    30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },

          // Firebase Auth endpoints — NetworkOnly.
          // Auth tokens must NEVER be served from cache.
          {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/i,
            handler:    "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/securetoken\.googleapis\.com\/.*/i,
            handler:    "NetworkOnly",
          },

          // Firestore REST/WebSocket — NetworkOnly.
          // Firestore's own IndexedDB persistence (enabled in firebase.js) handles
          // offline reads. The SW must not interfere with its WebSocket upgrade.
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler:    "NetworkOnly",
          },

          // Groq AI API — NetworkOnly.
          // AI responses are never stale-safe and must not be cached.
          {
            urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
            handler:    "NetworkOnly",
          },

          // EmailJS — NetworkOnly.
          {
            urlPattern: /^https:\/\/api\.emailjs\.com\/.*/i,
            handler:    "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
