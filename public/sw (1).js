/* ============================================================
   YojanaSahay — Service Worker v2
   public/sw.js
   ============================================================ */

const CACHE_NAME = "yojanasahay-v2";

const PRE_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/logo192.png",
  "/icons/logo512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/favicon.ico",
];

/* ── Install ──────────────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRE_CACHE).catch(() => {/* silent fail on missing files */})
    )
  );
  self.skipWaiting();
});

/* ── Activate ─────────────────────────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ────────────────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  /* Skip all external APIs */
  const skip =
    url.hostname.includes("firebase") ||
    url.hostname.includes("firestore") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("groq") ||
    url.hostname.includes("emailjs") ||
    url.hostname.includes("vercel") && url.pathname.startsWith("/api");

  if (skip) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached || caches.match("/index.html")
        )
      )
  );
});
