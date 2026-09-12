/**
 * GET /api/stats
 *
 * Same-origin proxy for the "Indians Helped" counter on the home screen —
 * PLUS a public, read-only "scheme health" snapshot (total schemes tracked +
 * % of links currently verified live) used by the portfolio site's project
 * card and by anything else that wants a live stat instead of a hardcoded one.
 *
 * WHY THIS EXISTS (checkerTotal part):
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
 * WHY THIS EXISTS (scheme health part):
 * schemes-meta.json (the "GitHub-as-database" verification results file,
 * see api/update-schemes-meta.js) lives in this repo, not in Firestore.
 * To surface a live "N schemes tracked · X% link health" stat elsewhere
 * (e.g. the portfolio site), this endpoint reads that same file straight
 * from GitHub via the Contents API — reusing the GITHUB_TOKEN / GITHUB_REPO
 * env vars already configured for update-schemes-meta.js. No new env vars.
 *
 * ── FIX (schemeCount) ────────────────────────────────────────────────────
 * schemes-meta.json only ever gets an entry for a scheme AFTER it has gone
 * through the Tier-1/Tier-2 verifier — i.e. it tracks the "verifiable /
 * active verify queue" subset (online schemes with a real URL), not every
 * scheme in the app. Offline-only schemes (bank/CSC/in-person) are
 * correctly never queued for verification, so they were never in
 * schemes-meta.json either — which meant `schemeCount` (previously
 * `Object.keys(meta).length`) was silently undercounting the real total
 * everywhere this stat is shown (portfolio hero bar, project card, case
 * study). schemeCount now comes from SCHEME_DB.length — the actual live
 * scheme database (national schemes + every state's schemes spread in via
 * stateSchemes.js) — which is the true total regardless of verification
 * status. schemes-meta.json is still used, unchanged, for linkHealthPercent
 * and lastVerifiedAt, since those specifically describe the verify queue.
 *
 * CORS: this endpoint is read-only, non-sensitive aggregate data, so it's
 * allowed cross-origin (Access-Control-Allow-Origin: *) so other sites
 * (like the portfolio) can fetch it directly.
 *
 * REQUIRED SETUP (one-time, in the Vercel dashboard) — unchanged from before:
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
import { SCHEME_DB } from "../src/schemesData.js";

const SCHEMES_META_PATH = "src/schemes-meta.json";

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

/**
 * Reads schemes-meta.json straight from GitHub (same file, same auth,
 * same pattern as commitSchemesMeta's "Step 1" in update-schemes-meta.js)
 * and reduces it to a small public-safe summary.
 *
 * schemeCount is NOT derived from this file — see the FIX note up top.
 * It comes from SCHEME_DB.length (the real, live total), so it's correct
 * even before the health-stats fetch below runs, and even if this whole
 * function falls through to its catch block.
 *
 * Deliberately isolated in its own try/catch so a GitHub hiccup NEVER
 * turns this into a 500 for the checkerTotal counter, which other code
 * depends on working.
 */
async function getSchemeHealthStats() {
  // The real total. Independent of GitHub/meta — always accurate even if
  // the fetch below fails, so schemeCount never silently reports 0 or the
  // wrong (verify-queue-sized) number again.
  const schemeCount = SCHEME_DB.length;

  try {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    if (!repo) throw new Error("GITHUB_REPO not configured");

    const apiUrl = `https://api.github.com/repos/${repo}/contents/${SCHEMES_META_PATH}`;
    const headers = { Accept: "application/vnd.github+json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const ghRes = await fetch(apiUrl, { headers });
    if (!ghRes.ok) throw new Error(`GitHub contents fetch failed: ${ghRes.status}`);

    const fileInfo = await ghRes.json();
    const decoded = Buffer.from(fileInfo.content, "base64").toString("utf8");
    const meta = JSON.parse(decoded);
    const ids = Object.keys(meta);

    if (ids.length === 0) {
      return { schemeCount, linkHealthPercent: null, lastVerifiedAt: null };
    }

    // Only count entries the two-tier verifier has actually RESOLVED
    // (isActive === true or === false) toward the health percentage.
    // Entries still pending verification (isActive missing/null) are
    // excluded from both sides of the ratio — including them in the
    // denominator without ever being able to count toward the numerator
    // unfairly drags the percentage down and doesn't reflect real link health.
    let activeCount = 0;
    let resolvedCount = 0;
    let latestMs = null;
    for (const id of ids) {
      const entry = meta[id] || {};
      if (entry.isActive === true) {
        activeCount++;
        resolvedCount++;
      } else if (entry.isActive === false) {
        resolvedCount++;
      }
      if (entry.lastVerified) {
        const t = new Date(entry.lastVerified).getTime();
        if (!Number.isNaN(t) && (latestMs === null || t > latestMs)) latestMs = t;
      }
    }

    return {
      schemeCount,
      linkHealthPercent: resolvedCount > 0 ? Math.round((activeCount / resolvedCount) * 100) : null,
      lastVerifiedAt: latestMs ? new Date(latestMs).toISOString() : null,
    };
  } catch (err) {
    console.error("[/api/stats] scheme health fetch failed:", err?.message || err);
    // schemeCount still comes back correctly even on a GitHub failure —
    // only linkHealthPercent/lastVerifiedAt are unavailable.
    return { schemeCount, linkHealthPercent: null, lastVerifiedAt: null };
  }
}

export default async function handler(req, res) {
  // Read-only, non-sensitive aggregate stats — safe to expose cross-origin
  // so other sites (e.g. the portfolio project card) can fetch this directly.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Small CDN-level cache so a traffic spike doesn't hammer Firestore —
  // the counter doesn't need to be second-accurate.
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");

  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const snap = await db.collection("appStats").doc("usage").get();
    const data = snap.exists ? snap.data() : {};
    const checkerTotal = typeof data.checkerTotal === "number" ? data.checkerTotal : 0;

    // Scheme health is fetched separately and can never fail this whole
    // response — if GitHub is briefly unreachable, checkerTotal (which the
    // app itself depends on) must still come back successfully.
    const schemeHealth = await getSchemeHealthStats();

    res.status(200).json({ checkerTotal, ...schemeHealth });
  } catch (err) {
    // Never leak internals to the client — just signal failure so the
    // frontend falls back to a direct Firestore read.
    console.error("[/api/stats] failed:", err?.message || err);
    res.status(500).json({ error: "stats unavailable" });
  }
}
