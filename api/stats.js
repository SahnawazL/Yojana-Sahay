/**
 * GET /api/stats
 *
 * Same-origin proxy for the "Indians Helped" counter on the home screen.
 *
 * WHY THIS EXISTS:
 * The client used to read appStats/usage directly from Firestore using the
 * Firebase Web SDK. That call goes to firestore.googleapis.com, which
 * Instagram / Facebook / Threads in-app browsers frequently block or
 * throttle — the read would silently fail, time out after 8s, and the
 * counter would show 0 forever for anyone opening the link from those apps.
 *
 * This serverless function reads the SAME Firestore document, but from the
 * server using firebase-admin, and returns the number as plain JSON from
 * yojanasahay.vercel.app/api/stats — a same-origin request that no in-app
 * browser has any reason to block.
 *
 * The client (App.jsx) calls this first, and only falls back to the direct
 * Firestore SDK read if this endpoint itself is unreachable.
 *
 * REQUIRED SETUP (one-time, in the Vercel dashboard):
 *   1. Firebase console → Project settings → Service accounts →
 *      "Generate new private key" → downloads a JSON file.
 *   2. In Vercel → your project → Settings → Environment Variables, add:
 *        FIREBASE_PROJECT_ID    = <project_id from the JSON>
 *        FIREBASE_CLIENT_EMAIL  = <client_email from the JSON>
 *        FIREBASE_PRIVATE_KEY   = <private_key from the JSON, including
 *                                  the literal \n line breaks — paste it
 *                                  exactly as it appears in the JSON, with
 *                                  quotes left in by Vercel's UI is fine>
 *   3. Redeploy. Vercel auto-detects /api/*.js files as serverless
 *      functions — no extra config needed.
 *
 * Never commit the downloaded service-account JSON file to git.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel's env var UI sometimes stores literal "\n" as the two characters
  // backslash-n instead of an actual newline — convert them back.
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin credentials in environment variables");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export default async function handler(req, res) {
  // Small CDN-level cache so a traffic spike doesn't hammer Firestore —
  // the counter doesn't need to be second-accurate.
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");

  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const snap = await db.collection("appStats").doc("usage").get();
    const data = snap.exists ? snap.data() : {};
    const checkerTotal = typeof data.checkerTotal === "number" ? data.checkerTotal : 0;

    res.status(200).json({ checkerTotal });
  } catch (err) {
    // Never leak internals to the client — just signal failure so the
    // frontend falls back to a direct Firestore read.
    console.error("[/api/stats] failed:", err?.message || err);
    res.status(500).json({ error: "stats unavailable" });
  }
}
