// api/_lib/urlRepairAgent.js — Yojana Sahay · autonomous dead-link repair
// ─────────────────────────────────────────────────────────────────────────────
// Runs inside the daily Auto-Fix agent (api/agent-auto-fix.js). For every
// scheme whose link is recorded dead in src/schemes-meta.json:
//
//   1. RE-PING the current URL (free). Government sites are often down for a
//      day — if it answers again, the "dead" flag is cleared. No search spent.
//   2. Still dead → SEARCH for a replacement (Serper, shared with the admin
//      "Find New URL" button) — at most MAX_SEARCHES_PER_RUN schemes a run and
//      each scheme at most once every RETRY_AFTER_DAYS, so the Serper credits
//      last.
//   3. AUTO-COMMIT the replacement to the scheme's source file ONLY when it is
//      unambiguous: the page answers 2xx/3xx right now AND either
//        · it is on the SAME site as the old link (site was reorganised) and
//          its title mentions the scheme, or
//        · it is on an official .gov.in / .nic.in site and its title clearly
//          names the scheme.
//      Anything less certain goes to `needsReview` with the top candidates so
//      an admin can pick one in one tap — the agent never guesses.
//   4. Every fixed / recovered scheme also gets linkAlive:true in
//      schemes-meta.json so the site stops showing it as broken immediately.
// ─────────────────────────────────────────────────────────────────────────────

import { SCHEME_DB } from "../../src/schemesData.js";
import { readRepoFile, commitPatches } from "./githubCommit.js";
import { commitSchemesMeta } from "../update-schemes-meta.js";
import { normalizeSchemeUrl, isPublicHttpUrl } from "./urlTools.js";
import { getUrlIssueFilePath } from "./urlIssues.js";
import { findUrlCandidates, registrableDomain, domainScore } from "./urlFinder.js";
import { pingUrlServer } from "../ping-url.js";

const MAX_SEARCHES_PER_RUN = Math.max(0, Number(process.env.URL_REPAIR_PER_RUN ?? 3) || 0);
const MAX_REPINGS_PER_RUN  = 40;
const RETRY_AFTER_DAYS     = 14;
const STATE_DOC            = ["appMeta", "urlRepairState"];

// Words that appear in almost every scheme name — they prove nothing.
const GENERIC = new Set([
  "scheme", "schemes", "yojana", "yojna", "pradhan", "mantri", "mukhyamantri", "chief", "minister",
  "national", "state", "government", "govt", "india", "indian", "the", "and", "for", "of", "under",
  "programme", "program", "mission", "abhiyan", "portal", "apply", "online", "registration", "new",
]);

export function nameTokens(name) {
  return [...new Set(
    String(name || "").toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !GENERIC.has(w))
  )];
}

// Share (0–1) of the scheme's distinctive name words found in a page title.
export function titleMatch(name, title) {
  const tokens = nameTokens(name);
  if (tokens.length === 0) return 0;
  const t = String(title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const hits = tokens.filter(w => t.includes(w)).length;
  return hits / tokens.length;
}

// Decide whether a candidate is safe to commit without a human.
export function pickAutoFix(scheme, oldUrl, candidates) {
  const name    = scheme.name?.en || scheme.id;
  const oldSite = registrableDomain(oldUrl);
  for (const c of candidates) {
    if (c.alive !== true || !(c.httpStatus >= 200 && c.httpStatus < 400)) continue;
    const match    = titleMatch(name, c.title);
    const sameSite = !!oldSite && registrableDomain(c.url) === oldSite;
    const official = domainScore(c.url) >= 0.9;
    if (sameSite && match >= 0.34) return { ...c, match, reason: "same site, page moved" };
    if (official && match >= 0.6)  return { ...c, match, reason: "official site, title matches scheme" };
  }
  return null;
}

function daysAgo(ms) { return (Date.now() - ms) / 86400000; }

export async function runUrlRepair({ db, log = console, progress = { step() {} } } = {}) {
  const out = {
    deadFound: 0, recovered: [], fixed: [], needsReview: [], skippedCooldown: 0,
    searchesUsed: 0, errors: [], stopReason: null,
  };

  // Live meta from GitHub — the bundled copy can be a deploy behind.
  const { text } = await readRepoFile("src/schemes-meta.json");
  const meta = text ? JSON.parse(text) : {};

  const dead = SCHEME_DB.filter(s =>
    meta[s.id]?.linkAlive === false &&
    s.applyType !== "offline" &&
    normalizeSchemeUrl(s.apply?.en)
  );
  out.deadFound = dead.length;
  progress.step(`${dead.length} scheme link(s) are recorded as dead`);
  if (dead.length === 0) return out;

  // Per-scheme retry bookkeeping (best effort — works without Firestore too).
  let attempts = {};
  const stateRef = db?.collection(STATE_DOC[0]).doc(STATE_DOC[1]);
  try { attempts = (await stateRef?.get())?.data()?.attempts ?? {}; } catch { /* ignore */ }

  // Oldest-attempted first, so every dead link gets its turn.
  dead.sort((a, b) => (attempts[a.id] ?? 0) - (attempts[b.id] ?? 0));

  // ── 1. Re-ping (free) ─────────────────────────────────────────────────────
  const toPing = dead.slice(0, MAX_REPINGS_PER_RUN);
  const stillDead = [];
  for (let i = 0; i < toPing.length; i += 8) {
    const chunk = toPing.slice(i, i + 8);
    const pings = await Promise.all(chunk.map(s => pingUrlServer(normalizeSchemeUrl(s.apply.en)).catch(() => ({ alive: null }))));
    chunk.forEach((s, j) => {
      if (pings[j].alive === true) out.recovered.push({ id: s.id, name: s.name?.en ?? s.id, httpStatus: pings[j].httpStatus });
      else stillDead.push(s);
    });
  }

  progress.step(`${out.recovered.length} came back online · ${stillDead.length} still dead`, out.recovered.length ? "ok" : "info");

  // ── 2/3. Search + decide ──────────────────────────────────────────────────
  const patches = [];
  for (const s of stillDead) {
    if (out.searchesUsed >= MAX_SEARCHES_PER_RUN) break;
    if (attempts[s.id] && daysAgo(attempts[s.id]) < RETRY_AFTER_DAYS) { out.skippedCooldown++; continue; }

    const oldUrl = normalizeSchemeUrl(s.apply.en);
    progress.step(`Searching for a new official page: ${s.name?.en ?? s.id}`);
    out.searchesUsed++;
    attempts[s.id] = Date.now();
    const { candidates, searchError, config } = await findUrlCandidates({
      name: s.name?.en ?? s.id,
      ministry: s.ministry?.en ?? (typeof s.ministry === "string" ? s.ministry : ""),
      oldUrl,
      state: s.scope === "national" ? "national" : (s.state ?? ""),
    });
    if (searchError) {
      out.errors.push(`${s.id}: ${searchError}`);
      delete attempts[s.id]; // not a real attempt — retry next run
      if (config || /rate-limit/i.test(searchError)) { out.stopReason = searchError; break; }
      continue;
    }

    const pick = pickAutoFix(s, oldUrl, candidates);
    progress.step(pick ? `  ↳ found ${pick.url} (${pick.reason}) — will replace` : `  ↳ ${candidates.length} candidate(s), none certain — sent for review`, pick ? "ok" : "warn");
    if (pick && isPublicHttpUrl(pick.url)) {
      patches.push({ id: s.id, oldUrl: s.apply.en, newUrl: pick.url, file: getUrlIssueFilePath(s), _pick: pick, _name: s.name?.en ?? s.id });
    } else {
      out.needsReview.push({
        id: s.id, name: s.name?.en ?? s.id, scope: s.scope, state: s.state ?? null,
        type: "DEAD_LINK", rawUrl: s.apply.en,
        candidates: candidates.slice(0, 3).map(c => ({ url: c.url, title: c.title, alive: c.alive, confidence: c.confidence })),
      });
    }
  }

  if (patches.length > 0) {
    const { results } = await commitPatches(patches.map(({ id, oldUrl, newUrl, file }) => ({ id, oldUrl, newUrl, file })), { source: "url-repair-agent" });
    for (const p of patches) {
      const r = results.find(x => x.id === p.id);
      if (r?.success) {
        out.fixed.push({ id: p.id, name: p._name, oldUrl: p.oldUrl, newUrl: p.newUrl, reason: p._pick.reason, commitUrl: r.commitUrl ?? null });
      } else {
        out.errors.push(`${p.id}: commit failed — ${r?.error ?? "unknown"}`);
      }
    }
  }

  // ── 4. Mark fixed + recovered links alive in schemes-meta.json ────────────
  const nowIso = new Date().toISOString();
  const metaUpdates = {};
  for (const r of out.recovered) metaUpdates[r.id] = { lastVerified: nowIso, linkAlive: true, httpStatus: r.httpStatus || 200 };
  for (const f of out.fixed)     metaUpdates[f.id] = { lastVerified: nowIso, linkAlive: true, httpStatus: 200 };
  if (Object.keys(metaUpdates).length > 0) {
    try { await commitSchemesMeta(metaUpdates); }
    catch (err) { out.errors.push(`schemes-meta update failed: ${err.message}`); }
  }

  try { await stateRef?.set({ attempts, updatedAt: new Date() }, { merge: true }); } catch { /* ignore */ }

  log.log?.(
    `[url-repair] dead ${out.deadFound} · recovered ${out.recovered.length} · fixed ${out.fixed.length} · ` +
    `review ${out.needsReview.length} · searches ${out.searchesUsed}`
  );
  return out;
}
