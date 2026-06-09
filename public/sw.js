/* ============================================================
   YojanaSahay — Service Worker v3
   public/sw.js
   ============================================================ */

const CACHE_NAME = "yojanasahay-v3";

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

/* External hostnames — SW hands these off to the browser entirely */
const SKIP_HOSTNAMES = [
  "firebase",
  "firestore",
  "googleapis",
  "groq",
  "emailjs",
];

/* ── Install ──────────────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRE_CACHE).catch(() => {/* silent fail on missing icons */})
    )
  );
  self.skipWaiting();
});

/* ── Activate — wipe ALL old caches ──────────────────────── */
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

  /* Skip external APIs — let browser handle them natively */
  if (SKIP_HOSTNAMES.some((h) => url.hostname.includes(h))) return;
  if (url.hostname.includes("vercel") && url.pathname.startsWith("/api")) return;

  /* ── Hashed assets (JS / CSS / fonts / images in /assets/) ──
     Cache-first: once a hashed file is cached it is valid forever.
     If not cached yet, fetch from network, cache it, return it.
     NEVER fall back to index.html for these — that was the bug.    */
  const isHashedAsset =
    url.pathname.startsWith("/assets/") ||
    /\.[0-9a-f]{8,}\.(js|css|woff2?|webp|png|svg)$/.test(url.pathname);

  if (isHashedAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        /* Not in cache yet — fetch from network, store, return */
        return fetch(event.request).then((res) => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        });
        /* If network also fails for an asset, the promise rejects
           and the browser shows its own error — NOT a broken HTML blob */
      })
    );
    return;
  }

  /* ── Navigation requests (HTML pages incl. /admin, /etc.) ──
     Network-first so the user always gets the latest index.html
     (which references the latest hashed bundle).
     Only fall back to cached index.html when truly offline.         */
  const isNavigation =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) => cached || caches.match("/index.html")
          )
        )
    );
    return;
  }

  /* ── Everything else (manifest, icons, fonts not in /assets/) ──
     Network-first, cache on success, no HTML fallback on failure.   */
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
      /* deliberate: no || caches.match("/index.html") here */
  );
});
