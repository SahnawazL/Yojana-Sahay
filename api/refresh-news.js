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

// ── Firebase Admin init (safe — reuses existing app across hot reloads) ───────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

// ── Constants ─────────────────────────────────────────────────────────────────
const GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
const MODEL       = "llama-3.1-8b-instant"; // fast + cheap for summarisation
const MAX_NEWS    = 20;   // max auto-fetched docs kept in Firestore at once
const MAX_NEW     = 8;    // max new items to process per cron run
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

// ── Simple title hash for deduplication ──────────────────────────────────────
// Lowercased, whitespace-collapsed, first 70 chars — good enough for news titles.
function makeTitleHash(title) {
  return title.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 70);
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

    const title = stripSource(rawTitle.trim());
    if (title.length < 10) continue; // skip empty / malformed entries

    items.push({ title, link: link.trim(), pubDate });
  }

  return items;
}

// ── Groq: batch filter + summarise + translate ────────────────────────────────
// Sends all candidate titles in ONE call to minimise API usage.
// Returns array of { idx, text_en, text_hi } for relevant items only.
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
    "\n\nRespond ONLY with a valid JSON array. No explanation, no markdown fences." +
    '\nFormat: [{"idx":1,"text_en":"...","text_hi":"...","desc_en":"...","desc_hi":"...","scope":"Central"},...]' +
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
          model:           MODEL,
          max_tokens:      1300,
          temperature:     0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt   },
          ],
        }),
      });

      if (res.status === 429) {
        console.warn("[refresh-news] Groq 429 — trying next key…");
        continue;
      }

      if (!res.ok) {
        console.error(`[refresh-news] Groq error ${res.status}`);
        return [];
      }

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content ?? "[]";

      // Groq with response_format json_object wraps arrays — unwrap if needed
      let parsed;
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const obj   = JSON.parse(clean);
        // Model may return { items: [...] } or { results: [...] } or directly [...]
        parsed = Array.isArray(obj)
          ? obj
          : Array.isArray(obj.items)   ? obj.items
          : Array.isArray(obj.results) ? obj.results
          : [];
      } catch {
        console.warn("[refresh-news] Groq JSON parse failed. Raw:", raw.slice(0, 200));
        return [];
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
      return [];
    }
  }

  console.warn("[refresh-news] All Groq keys exhausted.");
  return [];
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {

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

  if (!allItems.length) {
    return res.status(200).json({ message: "No RSS items fetched.", added: 0 });
  }

  // ── Step 4 — Deduplicate against existing Firestore docs ─────────────────────
  const newsRef   = db.collection("schemeNews");
  const existSnap = await newsRef.select("titleHash").get();
  const existingHashes = new Set(
    existSnap.docs.map((d) => d.data().titleHash).filter(Boolean)
  );

  const newItems = allItems
    .filter((it) => !existingHashes.has(it.titleHash))
    .slice(0, MAX_NEW); // cap per-run to keep Groq usage low

  console.log(
    `[refresh-news] After dedup: ${newItems.length} genuinely new items to process`
  );

  if (!newItems.length) {
    console.log("[refresh-news] Nothing new this week — collection is up to date.");
    return res.status(200).json({ message: "Already up to date.", added: 0 });
  }

  // ── Step 5 — Groq: filter relevance + summarise + translate ──────────────────
  const groqResults = await groqFilterAndSummarise(newItems, groqKeys);

  console.log(
    `[refresh-news] Groq approved ${groqResults.length} / ${newItems.length} items as relevant`
  );

  if (!groqResults.length) {
    return res.status(200).json({
      message: "No scheme-relevant items found in this week's news.",
      added:   0,
    });
  }

  // ── Step 6 — Write approved items to Firestore ───────────────────────────────
  // Groq returns 1-based idx matching newItems array position.
  const batch    = db.batch();
  let   addCount = 0;

  for (const result of groqResults) {
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
      url:         source.link || "",
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

  // ── Step 7 — Trim: keep only latest MAX_NEWS auto-fetched docs ───────────────
  // Protects against unbounded growth. Manual (autoFetched:false) items are
  // never deleted here — admin manages those from the dashboard.
  try {
    const autoSnap = await newsRef
      .where("autoFetched", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    if (autoSnap.size > MAX_NEWS) {
      const toDelete = autoSnap.docs.slice(MAX_NEWS); // oldest beyond limit
      const trimBatch = db.batch();
      toDelete.forEach((d) => trimBatch.delete(d.ref));
      await trimBatch.commit();
      console.log(`[refresh-news] Trimmed ${toDelete.length} old auto-fetched docs`);
    }
  } catch (trimErr) {
    // Non-fatal — old docs piling up is not a critical failure
    console.warn("[refresh-news] Trim step failed (non-fatal):", trimErr.message);
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  console.log("[refresh-news] ✅ Cron complete.");
  return res.status(200).json({
    message: `Scheme news refreshed successfully.`,
    added:   addCount,
    scanned: newItems.length,
  });
}
