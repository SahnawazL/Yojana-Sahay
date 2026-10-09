// src/agentTools.js — Yojana Sahay · the AI agent's tools (they run in the app)
// ─────────────────────────────────────────────────────────────────────────────
// The model decides which tools to call (schemas: api/chat.js AGENT_TOOLS);
// they run here, on the phone, against the app's own scheme database and the
// user's own data — fast, free, and nothing extra leaves the device except
// the compact results sent back to the model.
//
// Each tool returns { result, step, ui? }:
//   result — compact JSON-able data for the model
//   step   — short label shown to the user ("Checked eligibility for 3 schemes")
//   ui     — things the chat should show (checklist button, open-screen button…)
// ─────────────────────────────────────────────────────────────────────────────
import { SCHEME_DB as ALL } from "./schemesData.js";
import { scoreSchemes } from "./groqClient.js";
import { findSchemesInText, officialSchemeLink } from "./schemeMatch.js";
import { explainEligibility, eligibilityLine, nearMisses } from "./eligibilityExplain.js";
import { whoCanApply } from "./eligibilityText.js";
import { benefitSummary } from "./benefitMath.js";
import { getApplications, trackApplication, daysSince } from "./applications.js";
import { track } from "./track.js";

const DB = ALL.filter(s => !s.duplicateOf);
const BY_ID = new Map(ALL.map(s => [s.id, s]));

const L = (ctx) => (ctx.lang === "hi" ? "hi" : "en");
const nm = (s, ctx) => s?.name?.[L(ctx)] || s?.name?.en || s?.id;
const where = (s) => (s.scope === "state" ? s.state : "Central");
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function status(s) {
  const parts = [];
  if (s?.lastDate) {
    const d = new Date(s.lastDate);
    if (!isNaN(d)) parts.push(`${d < new Date() ? "last date passed" : "last date"}: ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`);
  }
  if (s?.isActive === false) parts.push("currently closed (may reopen)");
  else if (s?.isActive === true) parts.push("applications open");
  return parts.join(" · ") || undefined;
}

// Scheme from a name the model wrote ("PM Kisan", "pmkisan", "Ayushman card").
// Careful order — tracking an application must never pick the wrong scheme.
const norm = (t) => String(t || "").toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9\u0900-\u097F]+/g, " ").replace(/\b(yojana|yojna|scheme|card|the|of|for)\b/g, " ").replace(/\s+/g, " ").trim();
const squash = (t) => norm(t).replace(/\s+/g, "");
export function resolveScheme(name, ctx = {}) {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const main = (s) => (s?.duplicateOf ? BY_ID.get(s.duplicateOf) || s : s);
  // 1. id
  const byId = BY_ID.get(raw) || BY_ID.get(raw.toLowerCase().replace(/[\s-]+/g, "_"));
  if (byId) return main(byId);
  // 2. full name written in the text
  const named = findSchemesInText(raw, 1)[0];
  if (named) return main(named);
  // 2b. short acronym on its own ("KCC", "APY", "NSP")
  if (/^[A-Za-z]{2,8}$/.test(raw)) {
    const tag = `(${raw.toUpperCase()})`;
    const hit = DB.find(s => s.scope === "national" && (s.name?.en || "").includes(tag)) || DB.find(s => (s.name?.en || "").includes(tag));
    if (hit) return hit;
  }
  // 3. every word of the name appears in a scheme's name ("PM Kisan" → PM Kisan Samman Nidhi);
  //    prefer schemes the user qualifies for, then Central, then their state, then the shortest name.
  const qn = norm(raw), qs = squash(raw);
  if (qn) {
    const words = qn.split(" ");
    const mine = new Set((ctx.matched || []).map(s => s.id));
    const st = ctx.answers?.state || ctx.profile?.state;
    const cands = DB.filter(s => {
      const n = `${norm(s.name?.en)} ${norm(s.name?.hi)} ${s.id.replace(/_/g, " ")}`;
      return words.every(w => n.includes(w)) || squash(s.name?.en).includes(qs) || s.id.replace(/_/g, "") === qs;
    });
    if (cands.length) {
      const rank = (s) => (mine.has(s.id) ? 0 : 4) + (s.scope === "national" ? 0 : s.state === st ? 1 : 3);
      cands.sort((x, y) => rank(x) - rank(y) || (x.name?.en || "").length - (y.name?.en || "").length);
      return cands[0];
    }
  }
  // 4. best search hit, only if it's clearly a name match
  const { scored } = scoreSchemes(raw, null);
  const top = scored[0];
  return top && top.nameScore >= 15 ? top.scheme : null;
}

function brief(s, ctx) {
  const out = { name: nm(s, ctx), where: where(s), benefit: s.benefit?.[L(ctx)] || s.benefit?.en };
  if (s.annual > 0) out.yearly_value = inr(s.annual);
  const link = officialSchemeLink(s);
  out.official_link = link || "apply at nearest govt. office";
  if (ctx.answers) out.for_this_user = eligibilityLine(s, ctx.answers).replace(/^FOR THIS USER:\s*/, "");
  return out;
}

function details(s, ctx) {
  let who = ""; try { who = String(whoCanApply(s, L(ctx)) || "").replace(/\s+/g, " ").slice(0, 500); } catch {}
  return {
    ...brief(s, ctx),
    ministry: s.ministry?.[L(ctx)] || s.ministry?.en,
    who_can_apply: who || undefined,
    documents: s.docs?.[L(ctx)] || s.docs?.en || [],
    how_to_apply: s.applyType === "online" ? "Online" : "At the office / CSC",
    status: status(s),
  };
}

const notFound = (names) => ({ error: `Not found in the database: ${names.join(", ")}. Try search_schemes.` });

// ─── TOOLS ───────────────────────────────────────────────────────────────────
const TOOLS = {
  search_schemes({ query = "", state, limit = 6 }, ctx) {
    const n = Math.min(10, Math.max(1, Number(limit) || 6));
    const { scored } = scoreSchemes(String(query), ctx.profile, state || null);
    const list = scored.slice(0, n).map(x => x.scheme);
    return {
      result: list.length ? { count: list.length, schemes: list.map(s => brief(s, ctx)) } : { count: 0, note: "No matching schemes in the database." },
      step: `Searched schemes: “${String(query).slice(0, 40)}”${state ? ` in ${state}` : ""} — ${list.length} found`,
      schemeIds: list.map(s => s.id),
    };
  },

  scheme_details({ scheme }, ctx) {
    const s = resolveScheme(scheme, ctx);
    if (!s) return { result: notFound([scheme]), step: `Looked up “${scheme}” — not found` };
    return { result: details(s, ctx), step: `Opened details: ${nm(s, ctx)}`, schemeIds: [s.id] };
  },

  check_eligibility({ schemes = [] }, ctx) {
    if (!ctx.answers) {
      return {
        result: { note: "The user hasn't completed the eligibility check or profile yet. Suggest the eligibility checker (open_app_screen)." },
        step: "Checked eligibility — no answers yet",
      };
    }
    const names = (Array.isArray(schemes) ? schemes : [schemes]).filter(Boolean).slice(0, 6);
    if (!names.length) {
      const mine = ctx.matched || [];
      const sum = benefitSummary(mine);
      const top = [...mine].sort((a, b) => (b.annual || 0) - (a.annual || 0)).slice(0, 10);
      return {
        result: {
          eligible_count: mine.length,
          yearly_estimate: sum.yearly ? inr(sum.yearly) : undefined,
          health_cover: sum.health ? inr(sum.health) : undefined,
          one_time_help: sum.oneTime ? inr(sum.oneTime) : undefined,
          note: "Estimate only — money comes after applying with the right documents and approval.",
          top_schemes: top.map(s => brief(s, ctx)),
        },
        step: `Checked eligibility — ${mine.length} schemes match you`,
        schemeIds: top.map(s => s.id),
      };
    }
    const found = [], missing = [];
    for (const n of names) { const s = resolveScheme(n, ctx); s ? found.push(s) : missing.push(n); }
    return {
      result: {
        results: found.map(s => {
          const r = explainEligibility(s, ctx.answers);
          return { name: nm(s, ctx), eligible: r?.status === "eligible", detail: eligibilityLine(s, ctx.answers).replace(/^FOR THIS USER:\s*/, "") };
        }),
        ...(missing.length ? { not_found: missing } : {}),
      },
      step: `Checked eligibility for ${found.length} scheme${found.length === 1 ? "" : "s"}`,
      schemeIds: found.map(s => s.id),
    };
  },

  almost_eligible(_args, ctx) {
    if (!ctx.answers) return { result: { note: "No eligibility answers yet." }, step: "Looked for near-misses — no answers yet" };
    const ids = new Set((ctx.matched || []).map(s => s.id));
    const list = nearMisses(ctx.answers, ids, 6);
    return {
      result: list.length
        ? { schemes: list.map(x => ({ ...brief(x.scheme, ctx), whats_missing: x.line })) }
        : { note: "No schemes are just one realistic change away." },
      step: `Found ${list.length} scheme${list.length === 1 ? "" : "s"} you almost qualify for`,
      schemeIds: list.map(x => x.scheme.id),
    };
  },

  compare_schemes({ schemes = [] }, ctx) {
    const names = (Array.isArray(schemes) ? schemes : [schemes]).slice(0, 4);
    const found = names.map(n => resolveScheme(n, ctx)).filter(Boolean);
    if (found.length < 2) return { result: notFound(names), step: "Tried to compare — couldn't find the schemes" };
    return {
      result: { comparison: found.map(s => details(s, ctx)) },
      step: `Compared ${found.map(s => nm(s, ctx).replace(/\s*\(.*?\)/g, "")).join(" vs ")}`,
      schemeIds: found.map(s => s.id),
    };
  },

  my_applications(_args, ctx) {
    const apps = Object.entries(getApplications() || {});
    return {
      result: apps.length
        ? { applications: apps.map(([id, a]) => {
            const s = BY_ID.get(id);
            return { name: s ? nm(s, ctx) : id, applied_on: a.appliedAt, reference: a.ref || undefined, status: a.status, days_waiting: daysSince(a.appliedAt) };
          }) }
        : { note: "No applications tracked yet. They can tap “I've applied — track it” on a scheme page." },
      step: `Read My Applications — ${apps.length} tracked`,
    };
  },

  track_application({ scheme, reference = "", applied_on }, ctx) {
    const s = resolveScheme(scheme, ctx);
    if (!s) return { result: notFound([scheme]), step: `Couldn't find “${scheme}” to track` };
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(applied_on || "")) ? applied_on : undefined;
    const already = !!getApplications()?.[s.id];
    trackApplication(s.id, { appliedAt: date, ref: reference });
    track("app_track", { s: s.id });
    return {
      result: { ok: true, tracked: nm(s, ctx), was_already_tracked: already, note: "Saved in My Applications. The app will remind them to check the status after 30 days." },
      step: `Added ${nm(s, ctx)} to My Applications`,
      ui: { tracked: s.id },
      schemeIds: [s.id],
    };
  },

  documents_checklist({ schemes = [] }, ctx) {
    const names = (Array.isArray(schemes) ? schemes : [schemes]).slice(0, 6);
    const found = names.map(n => resolveScheme(n, ctx)).filter(Boolean);
    if (!found.length) return { result: notFound(names), step: "Couldn't build a checklist — schemes not found" };
    const seen = new Map();
    for (const s of found) for (const d of (s.docs?.[L(ctx)] || s.docs?.en || [])) {
      const k = String(d).toLowerCase().replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
      if (!seen.has(k)) seen.set(k, { document: d, needed_for: [] });
      seen.get(k).needed_for.push(nm(s, ctx));
    }
    return {
      result: { schemes: found.map(s => nm(s, ctx)), documents: [...seen.values()], note: "The app shows this to the user as a checklist they can tick and share." },
      step: `Built a documents checklist (${seen.size} documents)`,
      ui: { checklist: found.map(s => s.id) },
      schemeIds: found.map(s => s.id),
    };
  },

  open_app_screen({ screen, scheme }, ctx) {
    if (screen === "scheme_page") {
      const s = resolveScheme(scheme, ctx);
      if (!s) return { result: notFound([scheme]), step: "Couldn't find the scheme page" };
      return { result: { ok: true, shown: `button to open ${nm(s, ctx)}` }, step: `Added a button to open ${nm(s, ctx)}`, ui: { open: { screen, id: s.id } } };
    }
    return { result: { ok: true, shown: "button to open the eligibility checker" }, step: "Added a button to the eligibility checker", ui: { open: { screen: "eligibility_checker" } } };
  },

  async web_search({ query = "" }, ctx) {
    const q = String(query).slice(0, 200);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query: q }), signal: ctx.signal,
      });
      const data = await r.json().catch(() => ({}));
      return { result: { results: data.result || "No results." }, step: `Searched the web: “${q.slice(0, 50)}”` };
    } catch (e) {
      if (e?.name === "AbortError") throw e;
      return { result: { error: "Web search failed." }, step: "Web search failed" };
    }
  },
};

// Icon + "working on it" label shown while a tool runs.
export const TOOL_META = {
  search_schemes:      { icon: "🔍", en: "Searching schemes",            hi: "योजनाएं खोज रहे हैं" },
  scheme_details:      { icon: "📄", en: "Reading scheme details",       hi: "योजना की जानकारी पढ़ रहे हैं" },
  check_eligibility:   { icon: "✅", en: "Checking your eligibility",    hi: "आपकी पात्रता जांच रहे हैं" },
  almost_eligible:     { icon: "🎯", en: "Finding near-misses",          hi: "लगभग मिलने वाली योजनाएं ढूंढ रहे हैं" },
  compare_schemes:     { icon: "⚖️", en: "Comparing schemes",            hi: "योजनाओं की तुलना" },
  my_applications:     { icon: "🗂️", en: "Reading My Applications",      hi: "आपके आवेदन देख रहे हैं" },
  track_application:   { icon: "📌", en: "Adding to My Applications",    hi: "मेरे आवेदन में जोड़ रहे हैं" },
  documents_checklist: { icon: "📋", en: "Building documents checklist", hi: "दस्तावेज़ सूची बना रहे हैं" },
  open_app_screen:     { icon: "📱", en: "Preparing a shortcut",         hi: "शॉर्टकट तैयार कर रहे हैं" },
  web_search:          { icon: "🌐", en: "Searching the web",            hi: "वेब पर खोज रहे हैं" },
};

export async function runTool(name, argsJson, ctx) {
  const fnc = TOOLS[name];
  if (!fnc) return { result: { error: `Unknown tool ${name}` }, step: `Unknown tool ${name}` };
  let args = {};
  try { args = typeof argsJson === "string" ? JSON.parse(argsJson || "{}") : (argsJson || {}); } catch { args = {}; }
  try {
    return await fnc(args, ctx);
  } catch (e) {
    if (e?.name === "AbortError") throw e;
    return { result: { error: "The tool failed." }, step: `${TOOL_META[name]?.en || name} — failed` };
  }
}
