// firebase.js — Yojana Sahay Firebase initialisation
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from "firebase/firestore";

// Google sign-in helper on our OWN domain (vercel.json proxies /__/auth/* to
// Firebase). Phone browsers block the cross-site helper on
// yojanasetu-e24bb.firebaseapp.com, which made Google sign-in fail again and
// again. Turn on only after this redirect URI is added to the Google OAuth
// client: https://yojanasahay.vercel.app/__/auth/handler
const SAME_SITE_AUTH = true; // redirect URI added to the OAuth client on 8 Oct 2026
const onMainSite = typeof window !== "undefined" && window.location.hostname === "yojanasahay.vercel.app";

const firebaseConfig = {
  apiKey: "AIzaSyB4NoFNKDpH52eU2ZrqIeZHo1lacHu48vk",
  authDomain: SAME_SITE_AUTH && onMainSite ? "yojanasahay.vercel.app" : "yojanasetu-e24bb.firebaseapp.com",
  projectId: "yojanasetu-e24bb",
  storageBucket: "yojanasetu-e24bb.firebasestorage.app",
  messagingSenderId: "889660603092",
  appId: "1:889660603092:web:a988f9b87f915855dd9941",
  measurementId: "G-4ZZQ77LG0R",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// ── Firestore with offline persistence ────────────────────────────────────────
// Uses the correct v9+ API (initializeFirestore) instead of the deprecated
// enableIndexedDbPersistence().
//
// persistentLocalCache  → stores every Firestore read in IndexedDB so the app
//                         works offline after the first successful load.
// persistentMultipleTabManager → allows multiple browser tabs to share the
//                         same IndexedDB cache without conflicts.
//
// All existing getDoc() / setDoc() / onSnapshot() calls work unchanged —
// no other file needs to be modified.
//
// EXCEPT on /admin: the shared offline cache made the admin check hang on
// phones. With several tabs, only one "primary" tab talks to the server and
// the others wait for it — when the main app sits frozen in a background tab,
// /admin never got an answer ("Verifying…" → "Couldn't verify" → Retry…).
// The dashboard is always online anyway, so it uses a plain in-memory cache
// and talks to the server directly.
const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
export const db = initializeFirestore(app, isAdminRoute
  ? { localCache: memoryLocalCache() }
  : { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

export default app;
