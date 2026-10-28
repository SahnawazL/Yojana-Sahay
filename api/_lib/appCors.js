// api/_lib/appCors.js — Yojana Sahay
// The Android app runs its own copy of the app from https://localhost and calls
// these APIs on yojanasahay.vercel.app. Browsers only allow that when the server
// says so (CORS). This allows exactly the app's origins — nothing else changes
// for the website (same-site requests carry no CORS checks).
// Usage at the top of a handler:  if (appCors(req, res)) return;
const APP_ORIGINS = new Set(["https://localhost", "http://localhost", "capacitor://localhost"]);

export function appCors(req, res) {
  const origin = req.headers && req.headers.origin;
  if (!origin || !APP_ORIGINS.has(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") { res.status(204).end(); return true; }
  return false;
}
