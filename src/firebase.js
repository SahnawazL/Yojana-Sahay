// firebase.js — Yojana Sahay Firebase initialisation
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4NoFNKDpH52eU2ZrqIeZHo1lacHu48vk",
  authDomain: "yojanasetu-e24bb.firebaseapp.com",
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
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
