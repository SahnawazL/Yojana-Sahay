// adminFetch.js — Yojana Sahay · fetch() for admin-only API routes
// ─────────────────────────────────────────────────────────────────────────────
// The SchemeVerifier endpoints (/api/ping-url, /api/verify-scheme,
// /api/find-new-url, /api/update-schemes-meta, /api/batch-patch-urls) now
// require the signed-in admin's Firebase ID token. This wrapper attaches it
// and, on a 401 (token expired mid-run), refreshes the token once and retries.
//
// adminJson() additionally parses the reply and throws a readable Error for
// non-2xx responses or non-JSON bodies (e.g. a Vercel 504 HTML page), instead
// of the cryptic "Unexpected token '<'" the UI used to show.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "./firebase.js";

async function getToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

export async function adminFetch(url, options = {}) {
  const send = async (forceRefresh) => {
    const token   = await getToken(forceRefresh);
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  let res = await send(false);
  if (res.status === 401 && auth.currentUser) res = await send(true);
  return res;
}

export async function adminJson(url, body, { signal, method = "POST" } = {}) {
  const res = await adminFetch(url, {
    method,
    signal,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body:    body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : {}; } catch { data = null; }

  if (!res.ok) {
    const msg =
      (data && (data.error?.message || data.error)) ||
      (res.status === 504 ? "Server timed out (Vercel 504) — try again" : `HTTP ${res.status}`);
    const err = new Error(typeof msg === "string" ? msg : `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (data === null) {
    const err = new Error(`Unexpected non-JSON reply from ${url} (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
