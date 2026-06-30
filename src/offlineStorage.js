/**
 * offlineStorage.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin IndexedDB wrapper for YojanaSahay offline data persistence.
 *
 * WHY IndexedDB over localStorage?
 *   - localStorage: 5 MB limit, synchronous (blocks UI), can be cleared by
 *     the OS or browser on low storage (especially on Android).
 *   - IndexedDB: 50–100 MB, async, persistent across "Clear Cache" on most
 *     Android browsers, survives low-storage eviction longer.
 *
 * Falls back to localStorage silently if IndexedDB is unavailable
 * (very old browsers, private browsing on Safari < 15).
 *
 * Usage:
 *   import { idbSet, idbGet, idbDelete, OFFLINE_KEYS } from "./offlineStorage";
 *
 *   await idbSet(OFFLINE_KEYS.PROFILE, profileObject);
 *   const profile = await idbGet(OFFLINE_KEYS.PROFILE);
 *   await idbDelete(OFFLINE_KEYS.PROFILE);
 */

// ─── DB Constants ─────────────────────────────────────────────────────────────
const DB_NAME    = "yojana-sahay-offline";
const DB_VERSION = 1;
const STORE_NAME = "kv"; // single key-value object store

// ─── Key Registry ─────────────────────────────────────────────────────────────
// Centralised so key typos are compile-time errors, not silent misses.
export const OFFLINE_KEYS = {
  PROFILE:          "ys_profile_v2",
  CHECKER_ANSWERS:  "ys_checker_answers_v2",
  BRIEF_CACHE:      "ys_brief_cache_v2",
  SAVED_SCHEMES:    "ys_saved_schemes_v2",  // schemes user has bookmarked
  CHECKER_TOTAL:    "ys_checker_total_v2",  // Indians helped stat
  LAST_SYNC:        "ys_last_sync_v2",      // timestamp of last Firestore sync
};

// ─── Internal DB handle ───────────────────────────────────────────────────────
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
      req.onerror   = ()  => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Store any JSON-serialisable value under `key`. */
export async function idbSet(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req   = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    // Fallback: localStorage mirror
    try { localStorage.setItem("_idb_" + key, JSON.stringify(value)); } catch {}
    return false;
  }
}

/** Retrieve the value for `key`, or null if not found. */
export async function idbGet(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    // Fallback: localStorage mirror
    try {
      const raw = localStorage.getItem("_idb_" + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

/** Delete the value for `key`. */
export async function idbDelete(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req   = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    try { localStorage.removeItem("_idb_" + key); } catch {}
    return false;
  }
}

/**
 * Migrate existing localStorage values into IndexedDB on first run.
 * Call once at app startup (inside a useEffect with no deps).
 *
 * Maps:  old localStorage key  →  OFFLINE_KEYS constant
 */
export async function migrateLocalStorageToIDB() {
  const migrations = [
    { lsKey: "yojana_profile",          idbKey: OFFLINE_KEYS.PROFILE          },
    { lsKey: "yojana_eligibility_answers", idbKey: OFFLINE_KEYS.CHECKER_ANSWERS },
    { lsKey: "yojana_brief_cache",      idbKey: OFFLINE_KEYS.BRIEF_CACHE      },
    { lsKey: "yojana_checker_total",    idbKey: OFFLINE_KEYS.CHECKER_TOTAL    },
  ];

  for (const { lsKey, idbKey } of migrations) {
    try {
      const existing = await idbGet(idbKey);
      if (existing !== null) continue; // already migrated

      const raw = localStorage.getItem(lsKey);
      if (!raw) continue;

      const value = JSON.parse(raw);
      await idbSet(idbKey, value);
    } catch {
      // Non-fatal — localStorage stays as fallback
    }
  }
}
