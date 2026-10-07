// api/refresh-news.js — Yojana Sahay · Scheme News Auto-Refresher
// ─────────────────────────────────────────────────────────────────────────────
//
// Vercel Cron — runs every Monday at ~09:30 AM IST (04:00 UTC)
// Schedule defined in vercel.json → "crons": [{ "path": "/api/refresh-news", "schedule": "0 4 * * 1" }]
//
// Flow:
//   1. Security  — verify Vercel cron header (auto-set by Vercel) or CRON_SECRET
//   2. Fetch     — Google News RSS, two queries (yojana + PM scheme India)
//   3. Parse     — XML → title + link + pubDate, strip source suffix from title
//   4. Deduplicate — compare titleHash against existing Firestore schemeNews docs
//   5. Groq      — batch filter: keep only scheme-relevant items, summarise EN,
//                  translate to Hindi (single API call for all new items)
//   6. Write     — save approved items to Firestore schemeNews collection
//   7. Trim      — keep only the latest MAX_NEWS auto-fetched docs, delete older ones
//
// Groq key used: GROQ_API_KEY (chat pool) — summarisation, not verification.
// Firebase Admin SDK bypasses Firestore security rules — writes freely.
//
// ENV VARS needed (all already in your Vercel project):
//   GROQ_API_KEY              — primary chat key  (required)
//   GROQ_API_KEY_1 … _5       — fallback keys     (optional)
//   FIREBASE_PROJECT_ID       — Firebase project
//   FIREBASE_CLIENT_EMAIL     — service account email
//   FIREBASE_PRIVATE_KEY      — service account private key (with \n escapes)
//   CRON_SECRET               — optional extra auth header check
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp }       from "firebase-admin/firestore";
import { createProgress }              from "./_lib/agentProgress.js";

// ── Firebase Admin init (safe — reuses existing app across hot reloads) ───────
// Initialised lazily inside the handler: a top-level cert() call throws at
// import time when an env var is missing, which also crashed every route
// that imports this module (admin-sync-news) with an opaque error.
let db = null;
function getDb() {
  if (db) return db;
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
      }),
    });
  }
  db = getFirestore();
  return db;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
const MODEL       = "openai/gpt-oss-20b"; // migrated from llama-3.1-8b-instant (Groq deprecated it June 17, 2026) — fast + cheap for summarisation, free tier, 200K TPD
const MAX_NEWS    = 20;   // max auto-fetched docs kept in Firestore at once
const MAX_NEW     = 12;   // max new items to process per cron run
const MAX_SKIPPED_HASHES = 400; // headlines the AI already judged irrelevant (not re-sent)
const FETCH_MS    = 8000; // RSS fetch timeout

// Two complementary RSS queries — union gives broader coverage
const RSS_QUERIES = [
  "sarkari+yojana+scheme+government+india+subsidy+benefit",
  "PM+scheme+india+2026+welfare+beneficiary+lakh+crore",
];

// ── Groq key loader — chat pool (same env vars as your AI chat) ───────────────
function loadGroqKeys() {
  const candidates = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ];
  const seen = new Set();
  const keys = [];
  for (const k of candidates) {
    const t = k?.trim();
    if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
  }
  return keys;
}

// ── Title hash for deduplication ─────────────────────────────────────────────
// Simple lowercase + whitespace-collapse — matches format already stored in Firestore.
// Near-duplicate detection is handled by the schemeKey 14-day window instead.
function makeTitleHash(title) {
  return title.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 70);
}

// ── Decode the HTML entities Google News leaves in titles (&amp; &#39; …) ─────
function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

// ── Strip "— Source Name" suffix Google News appends to every title ───────────
// e.g. "PM Kisan installment released — Economic Times" → "PM Kisan installment released"
function stripSource(title) {
  return title.replace(/\s[—–-]\s[^—–-]+$/, "").trim();
}

// ── Fetch one Google News RSS feed ────────────────────────────────────────────
async function fetchRSS(query) {
  const url =
    `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[refresh-news] RSS fetch failed (${res.status}) for query: ${query}`);
      return [];
    }
    const xml = await res.text();
    return parseRSSItems(xml);
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[refresh-news] RSS fetch error for query "${query}":`, err.message);
    return [];
  }
}

// ── Minimal XML RSS parser — no external deps ─────────────────────────────────
// Google News RSS uses CDATA for titles and plain text for links/dates.
function parseRSSItems(xml) {
  const items   = [];
  const itemRx  = /<item>([\s\S]*?)<\/item>/g;
  let   match;

  while ((match = itemRx.exec(xml)) !== null) {
    const block = match[1];

    // Title: may be wrapped in CDATA or plain text
    const rawTitle =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>([\s\S]*?)<\/title>/)?.[1]                 ??
      "";

    // Link: Google News RSS puts the real link right after <link> (before <guid>)
    const link =
      block.match(/<link>(https?:\/\/[^\s<]+)<\/link>/)?.[1] ??
      block.match(/<link\s*\/>\s*(https?:\/\/[^\s<]+)/)?.[1] ??
      "";

    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";

    const title = stripSource(decodeEntities(rawTitle.trim()));
    if (title.length < 10) continue; // skip empty / malformed entries

    items.push({ title, link: link.trim(), pubDate });
  }

  return items;
}

// ── Groq: batch filter + summarise + translate ────────────────────────────────
// Sends all candidate titles in ONE call to minimise API usage.
// Returns array of { idx, text_en, text_hi } for relevant items only.
// Returns [] when the AI judged nothing relevant, null when the call failed.
async function groqFilterAndSummarise(items, groqKeys) {
  if (!items.length || !groqKeys.length) return [];

  // Build the numbered list for the prompt
  const numbered = items
    .map((it, i) => `${i + 1}. ${it.title}`)
    .join("\n");

  const systemPrompt =
    "You are a news editor for YojanaSahay — an Indian government scheme discovery app " +
    "used by citizens to track welfare updates. From a list of news headlines, keep ONLY " +
    "those directly about Indian government welfare schemes, yojanas, subsidies, benefits, " +
    "or loan schemes for citizens." +
    "\n\nREJECT headlines about: politics, elections, cricket, entertainment, " +
    "international news, stock market, crime, or anything unrelated to citizen welfare schemes." +
    "\n\nALSO REJECT headlines that are too vague to explain anything concrete — e.g. just a " +
    "scheme name followed by generic words like 'Details', 'Update', 'News', 'Launched' with " +
    "no actual change, amount, deadline, or beneficiary action mentioned. These give a citizen " +
    "nothing to learn or act on. Skip them rather than inventing content to fill the gap." +
    "\n\nFor each RELEVANT and SUBSTANTIVE headline, produce:" +
    "\n  text_en — a short, punchy English headline (≤70 characters, include ₹ amount if mentioned)" +
    "\n  text_hi — accurate Hindi translation of text_en" +
    "\n  desc_en — ONE plain-English sentence (max 160 characters) explaining what this update " +
    "actually means for a citizen: what changed, who it affects, and what they might want to do " +
    "next. Use only facts present in the headline plus general, well-known facts about the " +
    "scheme itself (e.g. who PMAY is for). Never invent specific numbers, dates, or details that " +
    "are not implied by the headline." +
    "\n  desc_hi — accurate Hindi translation of desc_en" +
    "\n  scope — \"Central\" if this is a central/national government scheme (PM-prefix, central " +
    "ministry, or explicitly nationwide). Otherwise the Indian state name in English " +
    "(e.g. \"Maharashtra\", \"Uttar Pradesh\", \"Tamil Nadu\"). Omit the field entirely if unclear." +
    "\n  schemeKey — canonical short name of the scheme (e.g. \"PM Kisan\", \"PMAY\", \"PM Surya Ghar\", " +
    "\"MSME Loan\"). Max 30 chars. Used to prevent duplicate scheme coverage across cron runs." +
    "\n\nRespond ONLY with a valid JSON array. No explanation, no markdown fences." +
    '\nFormat: [{"idx":1,"text_en":"...","text_hi":"...","desc_en":"...","desc_hi":"...","scope":"Central","schemeKey":"PM Surya Ghar"},...]' +
    "\nOmit irrelevant or non-substantive items entirely. Return [] if nothing qualifies.";

  const userPrompt =
    `Evaluate these ${items.length} news headlines:\n\n${numbered}`;

  // Try each key in order, skip on 429
  for (const key of groqKeys) {
    try {
      const res = await fetch(GROQ_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model:       MODEL,
          // gpt-oss is a reasoning model — its hidden reasoning shares this
          // budget. 1300 tokens truncated the JSON for 8 bilingual items,
          // the parse failed and the run silently added nothing.
          max_completion_tokens: 4000,
          reasoning_effort:      "low",
          temperature: 0.3,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt   },
          ],
        }),
      });

      if (res.status === 429 || res.status === 401 || res.status === 403) {
        console.warn(`[refresh-news] Groq ${res.status} — trying next key…`);
        continue;
      }

      if (!res.ok) {
        console.error(`[refresh-news] Groq error ${res.status}`);
        return null; // failed — NOT "nothing relevant"
      }

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content || "[]";

      // Model may return { items: [...] } or { results: [...] } or directly [...] — unwrap if needed
      let parsed;
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        let obj;
        try { obj = JSON.parse(clean); }
        catch {
          const m = clean.match(/\[[\s\S]*\]/); // tolerate stray text around the array
          if (!m) throw new Error("no JSON array");
          obj = JSON.parse(m[0]);
        }
        // Model may return { items: [...] } or { results: [...] } or directly [...]
        parsed = Array.isArray(obj)
          ? obj
          : Array.isArray(obj.items)   ? obj.items
          : Array.isArray(obj.results) ? obj.results
          : [];
      } catch {
        console.warn("[refresh-news] Groq JSON parse failed. Raw:", raw.slice(0, 200));
        return null; // failed — NOT "nothing relevant"
      }

      // Validate shape — must have idx, text_en, text_hi, desc_en, desc_hi
      return parsed.filter(
        (r) =>
          typeof r?.idx      === "number" &&
          typeof r?.text_en  === "string" && r.text_en.length > 5 &&
          typeof r?.text_hi  === "string" && r.text_hi.length > 5 &&
          typeof r?.desc_en  === "string" && r.desc_en.length > 10 &&
          typeof r?.desc_hi  === "string" && r.desc_hi.length > 10
      );

    } catch (err) {
      console.error("[refresh-news] Groq network error:", err.message);
      return null; // failed — NOT "nothing relevant"
    }
  }

  console.warn("[refresh-news] All Groq keys exhausted.");
  return null; // failed — NOT "nothing relevant"
}

// ── Main handler ──────────────────────────────────────────────────────────────
async function refreshNewsCore(req, res) {
  const step = (text, kind) => req._progress?.step(text, kind);

  // ── Step 1 — Security ───────────────────────────────────────────────────────
  // Vercel automatically sets "x-vercel-cron: 1" on all cron-triggered calls.
  // Optionally also check a CRON_SECRET for extra protection during testing.
  const isVercelCron  = req.headers["x-vercel-cron"] === "1";
  const cronSecret    = process.env.CRON_SECRET?.trim();
  const authHeader    = req.headers["authorization"] ?? "";
  const secretMatches = cronSecret
    ? authHeader === `Bearer ${cronSecret}`
    : false;

  if (!isVercelCron && !secretMatches) {
    console.warn("[refresh-news] Unauthorised request — missing cron header / secret.");
    return res.status(401).json({ error: "Unauthorised" });
  }

  // Only GET (Vercel crons always use GET)
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("[refresh-news] ▶ Cron started at", new Date().toISOString());

  try {
    getDb();
  } catch (err) {
    console.error("[refresh-news] Firebase Admin init failed:", err.message);
    return res.status(500).json({ error: "Firebase Admin not configured (FIREBASE_* env vars)." });
  }

  // ── Step 1b — Run-interval guard ────────────────────────────────────────────
  // Prevents duplicate accumulation during manual testing and accidental double-runs.
  // Skips if last successful run was < MIN_RUN_INTERVAL_H hours ago.
  // Pass ?force=true (still requires auth) to bypass during testing.
  const MIN_RUN_INTERVAL_H = 20;
  const forceRun = req.query?.force === "true";

  if (!forceRun) {
    try {
      const configSnap = await db.collection("_config").doc("news").get();
      const lastRunMs  = configSnap.data()?.lastRunAt?.toMillis?.() ?? 0;
      const hoursAgo   = (Date.now() - lastRunMs) / 3600000;
      if (hoursAgo < MIN_RUN_INTERVAL_H) {
        const nextIn = (MIN_RUN_INTERVAL_H - hoursAgo).toFixed(1);
        console.log(`[refresh-news] Rate-limited — last run ${hoursAgo.toFixed(1)}h ago.`);
        return res.status(200).json({
          message: `Rate-limited. Last run ${hoursAgo.toFixed(1)}h ago. Next allowed in ${nextIn}h. Append ?force=true to bypass.`,
          skipped: true,
        });
      }
    } catch (guardErr) {
      // Non-fatal — if _config fetch fails, proceed normally
      console.warn("[refresh-news] Rate-limit check failed (proceeding):", guardErr.message);
    }
  } else {
    console.log("[refresh-news] ?force=true — skipping rate-limit guard.");
  }

  // ── Step 2 — Load Groq keys ─────────────────────────────────────────────────
  const groqKeys = loadGroqKeys();
  if (!groqKeys.length) {
    console.error("[refresh-news] No GROQ_API_KEY found in env.");
    return res.status(500).json({ error: "No Groq API keys configured." });
  }

  // ── Step 3 — Fetch Google News RSS (both queries, combine + deduplicate) ─────
  const [batch1, batch2] = await Promise.all(RSS_QUERIES.map(fetchRSS));

  const seenTitles = new Set();
  const allItems   = [];
  for (const item of [...batch1, ...batch2]) {
    const h = makeTitleHash(item.title);
    if (!seenTitles.has(h)) {
      seenTitles.add(h);
      allItems.push({ ...item, titleHash: h });
    }
  }

  console.log(`[refresh-news] RSS fetched: ${allItems.length} unique items`);
  step(`Fetched ${allItems.length} headlines from Google News`);

  if (!allItems.length) {
    return res.status(200).json({ message: "No RSS items fetched.", added: 0, scanned: 0 });
  }

  // ── Step 4 — Deduplicate against existing Firestore docs ─────────────────────
  const newsRef   = db.collection("schemeNews");

  // All title hashes — catches exact / near-exact repeats
  const existSnap = await newsRef.select("titleHash").get();
  const existingHashes = new Set(
    existSnap.docs.map((d) => d.data().titleHash).filter(Boolean)
  );

  // Recent schemeKeys (last 14 days) — prevents same-scheme duplicates across runs
  // even when the headline is worded differently each time.
  const twoWeeksAgo = Timestamp.fromMillis(Date.now() - 14 * 24 * 3600 * 1000);
  const recentSnap  = await newsRef
    .where("createdAt", ">", twoWeeksAgo)
    .select("schemeKey")
    .get();
  const recentSchemeKeys = new Set(
    recentSnap.docs
      .map((d) => d.data().schemeKey)
      .filter(Boolean)
      .map((k) => k.toLowerCase().trim())
  );

  // Headlines the AI already judged irrelevant on earlier runs. They used to
  // be re-sent every run: the same top-8 irrelevant headlines filled the
  // window forever and the job "succeeded" while adding nothing for weeks.
  let skippedHashes = [];
  try {
    skippedHashes = (await db.collection("_config").doc("news").get()).data()?.skippedHashes ?? [];
  } catch { /* ignore */ }
  const skipped = new Set(skippedHashes);

  const ts = (it) => Date.parse(it.pubDate) || 0;
  const newItems = allItems
    .filter((it) => !existingHashes.has(it.titleHash) && !skipped.has(it.titleHash))
    .sort((a, b) => ts(b) - ts(a)) // newest headlines first
    .slice(0, MAX_NEW); // cap per-run to keep Groq usage low

  console.log(
    `[refresh-news] After dedup: ${newItems.length} genuinely new items to process`
  );
  step(`${newItems.length} headline(s) not seen before — asking AI which are about government schemes…`);

  if (!newItems.length) {
    console.log("[refresh-news] Nothing new this week — collection is up to date.");
    step("No new headlines since the last run", "ok");
    return res.status(200).json({ message: "Already up to date.", added: 0, scanned: allItems.length });
  }

  // ── Step 5 — Groq: filter relevance + summarise + translate ──────────────────
  const groqResults = await groqFilterAndSummarise(newItems, groqKeys);

  // Remember what the AI rejected so the next run looks at different headlines.
  // (Only when the AI actually answered — a failed call returns null.)
  if (Array.isArray(groqResults)) {
    const approved = new Set(groqResults.map(r => newItems[r.idx - 1]?.titleHash).filter(Boolean));
    const rejected = newItems.map(it => it.titleHash).filter(h => h && !approved.has(h));
    if (rejected.length) {
      try {
        await db.collection("_config").doc("news").set(
          { skippedHashes: [...rejected, ...skippedHashes].slice(0, MAX_SKIPPED_HASHES) },
          { merge: true }
        );
      } catch (e) { console.warn("[refresh-news] could not save skipped headlines:", e.message); }
    }
  }

  console.log(
    `[refresh-news] Groq approved ${groqResults?.length ?? "?"} / ${newItems.length} items as relevant`
  );
  step(groqResults === null ? "AI filter failed (Groq error / busy)" : `AI kept ${groqResults.length} of ${newItems.length} as real scheme news (English + Hindi summaries written)`, groqResults === null ? "error" : "info");

  if (groqResults === null) {
    return res.status(502).json({ error: "AI news filter failed (Groq error or all keys busy) — will retry next run." });
  }

  if (!groqResults.length) {
    return res.status(200).json({
      message: "No scheme-relevant items found in this week's news.",
      added:   0,
      scanned: newItems.length,
    });
  }

  // ── Step 5b — Filter groqResults by schemeKey (last-14-day dedup) ─────────────
  // Even if title hashes differ, skip items whose canonical scheme was already
  // covered in the past two weeks — prevents "PM Surya Ghar" appearing 3x.
  const filteredResults = groqResults.filter((r) => {
    if (!r.schemeKey) return true; // no key → let it through
    const key = r.schemeKey.toLowerCase().trim();
    if (recentSchemeKeys.has(key)) {
      console.log(`[refresh-news] Skipping "${r.text_en}" — scheme "${r.schemeKey}" already in recent news`);
      return false;
    }
    recentSchemeKeys.add(key); // block duplicates within the same batch too
    return true;
  });

  console.log(
    `[refresh-news] After schemeKey dedup: ${filteredResults.length} / ${groqResults.length} remain`
  );

  if (!filteredResults.length) {
    return res.status(200).json({
      message: "All approved items are duplicates of recent scheme coverage.",
      added:   0,
      scanned: newItems.length,
    });
  }

  // ── Step 6 — Write approved items to Firestore ───────────────────────────────
  // Groq returns 1-based idx matching newItems array position.
  const batch    = db.batch();
  let   addCount = 0;

  for (const result of filteredResults) {
    const itemIdx = result.idx - 1; // convert 1-based → 0-based
    if (itemIdx < 0 || itemIdx >= newItems.length) continue;

    const source = newItems[itemIdx];
    const docRef = newsRef.doc(); // auto-ID

    batch.set(docRef, {
      text_en:     result.text_en.slice(0, 120),  // hard cap just in case
      text_hi:     result.text_hi.slice(0, 140),
      desc_en:     result.desc_en.slice(0, 200),
      desc_hi:     result.desc_hi.slice(0, 220),
      scope:       typeof result.scope === "string" ? result.scope.slice(0, 40) : "",
      schemeKey:   typeof result.schemeKey === "string" ? result.schemeKey.slice(0, 40).trim() : "",
      url:         decodeEntities(source.link || ""),
      source:      "Google News",
      active:      true,
      titleHash:   source.titleHash,
      autoFetched: true,
      pubDate:     source.pubDate || "",
      createdAt:   Timestamp.now(),
      // order is used for manual items; auto items sort by createdAt desc
      order:       0,
    });

    addCount++;
  }

  await batch.commit();
  console.log(`[refresh-news] ✓ Wrote ${addCount} new items to schemeNews`);
  step(`Added ${addCount} news item(s) to the ticker`, "ok");

  // Record this run's timestamp so the rate-limit guard works on next call
  try {
    await db.collection("_config").doc("news").set(
      { lastRunAt: Timestamp.now(), lastAddCount: addCount },
      { merge: true }
    );
  } catch (e) {
    console.warn("[refresh-news] Could not update lastRunAt (non-fatal):", e.message);
  }

  // ── Step 7 — Trim: keep only latest MAX_NEWS auto-fetched docs ───────────────
  // Protects against unbounded growth. Manual (autoFetched:false) items are
  // never deleted here — admin manages those from the dashboard.
  // NOTE: No .orderBy() on the Firestore query — that would require a composite
  // index on (autoFetched, createdAt). We fetch all auto docs and sort in JS.
  try {
    const autoSnap = await newsRef
      .where("autoFetched", "==", true)
      .get();

    if (autoSnap.size > MAX_NEWS) {
      // Sort newest-first in JS — no composite index needed
      const sorted = autoSnap.docs.sort((a, b) => {
        const aMs = a.data().createdAt?.toMillis?.() ?? 0;
        const bMs = b.data().createdAt?.toMillis?.() ?? 0;
        return bMs - aMs;
      });
      const toDelete = sorted.slice(MAX_NEWS); // oldest beyond limit
      const trimBatch = db.batch();
      toDelete.forEach((d) => trimBatch.delete(d.ref));
      await trimBatch.commit();
      console.log(`[refresh-news] Trimmed ${toDelete.length} old auto-fetched docs`);
    } else {
      console.log(`[refresh-news] No trim needed (${autoSnap.size} / ${MAX_NEWS} auto docs)`);
    }
  } catch (trimErr) {
    console.error("[refresh-news] Trim step failed:", trimErr.message);
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  console.log("[refresh-news] ✅ Cron complete.");
  return res.status(200).json({
    message: `Scheme news refreshed successfully.`,
    added:   addCount,
    scanned: newItems.length,
  });
}


// ── Run tracking for the Watchdog ───────────────────────────────────────────
// lastRunAt above is only written when new items were saved, so a job that
// ran fine but found nothing (or failed before writing) looked "never run".
// Every authorised run now records its outcome in _config/news.
export default async function handler(req, res) {
  // Capture the response instead of sending it, so the outcome can be
  // recorded (awaited — a serverless function may freeze right after it
  // responds) before it goes out.
  let statusCode = 200, body = null, captured = false;
  // Live progress for the Agents tab (only for authorised runs).
  const authorised = (() => {
    const secret = process.env.CRON_SECRET?.trim();
    const h = req.headers?.authorization ?? "";
    return req.headers?.["x-vercel-cron"] === "1" || (secret && h === `Bearer ${secret}`);
  })();
  if (authorised) {
    try { getDb(); req._progress = createProgress(db, "news", { trigger: req.query?.trigger ?? (req.query?.force === "true" ? "manual" : "cron") }); } catch { /* no Firebase */ }
  }
  const shim = {
    status(code) { statusCode = code; return shim; },
    json(b) { body = b; captured = true; return shim; },
  };
  try {
    await refreshNewsCore(req, shim);
  } catch (err) {
    console.error("[refresh-news] crashed:", err);
    statusCode = 500; body = { error: err.message }; captured = true;
  }
  if (!captured) { statusCode = 500; body = { error: "No response produced" }; }
  if (req._progress) {
    if (statusCode >= 400) await req._progress.fail(body?.error ?? `HTTP ${statusCode}`);
    else { if (body?.skipped) req._progress.step(String(body.message ?? "Skipped"), "warn"); await req._progress.done({ added: body?.added ?? 0 }); }
  }

  if (statusCode !== 401 && statusCode !== 405 && !body?.skipped) {
    const ok = statusCode < 400;
    const message = ok
      ? (typeof body?.added === "number" ? `Added ${body.added} news item${body.added === 1 ? "" : "s"}` : String(body?.message ?? "Ran"))
      : String(body?.error ?? `HTTP ${statusCode}`);
    try {
      getDb();
      await db.collection("_config").doc("news").set(
        { lastAttemptAt: Timestamp.now(), lastAttemptOk: ok, lastAttemptMessage: message.slice(0, 200) },
        { merge: true }
      );
    } catch (e) {
      console.warn("[refresh-news] attempt log failed:", e.message);
    }
  }
  return res.status(statusCode).json(body);
}
