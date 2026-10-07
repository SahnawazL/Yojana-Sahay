// scripts/agent-watchdog.mjs — Yojana Sahay · Agent Watchdog (GitHub Actions)
// ─────────────────────────────────────────────────────────────────────────────
// Run by .github/workflows/agents-watchdog.yml every 6 hours. No npm deps.
//
//   1. Ask the app for a health report  (POST /api/agent-auto-fix {action:"health"})
//   2. SELF-HEAL: re-trigger every job the report marks `rerun`
//        verifyBatch    → POST /api/deadline-alerts   {action:"verifyBatch"}
//        deadlineAlerts → POST /api/deadline-alerts   (daily e-mail run)
//        autoFix        → POST /api/agent-auto-fix    {trigger:"watchdog"}
//        news           → GET  /api/refresh-news?force=true
//   3. Re-check health after the re-runs.
//   4. GITHUB ISSUES (you get a GitHub notification / e-mail):
//        "🤖 Agent health" — opened/updated while something is still failing
//                            after self-heal (bad key, missing env var …),
//                            closed automatically once everything recovers.
//        "🔗 Dead links need review" — dead links the URL Repair agent could
//                            not fix safely, with candidate replacements;
//                            closed automatically when the list is empty.
//   5. Store the final report back in the app (shown in the Agents tab).
//
// Env: APP_URL, CRON_SECRET, GITHUB_TOKEN, GITHUB_REPOSITORY (set by Actions).
//      DRY_RUN=1 → print what would happen, touch nothing.
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = (process.env.APP_URL || "https://yojanasahay.vercel.app").replace(/\/+$/, "");
const SECRET  = process.env.CRON_SECRET?.trim();
const GH_TOKEN = process.env.GITHUB_TOKEN;
const REPO     = process.env.GITHUB_REPOSITORY;
const DRY_RUN  = process.env.DRY_RUN === "1";

const HEALTH_LABEL = "agent-health";
const REVIEW_LABEL = "links-review";
const ICON = { ok: "✅", warn: "⚠️", fail: "❌" };

const log = (...a) => console.log("[watchdog]", ...a);

async function app(path, { method = "POST", body, timeoutMs = 290_000 } = {}) {
  const res = await fetch(`${APP_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
  return { status: res.status, data };
}

const RERUNS = {
  verifyBatch:    () => app("/api/deadline-alerts", { body: { action: "verifyBatch" } }),
  deadlineAlerts: () => app("/api/deadline-alerts", { body: {} }),
  autoFix:        () => app("/api/agent-auto-fix",  { body: { trigger: "watchdog" } }),
  news:           () => app("/api/refresh-news?force=true", { method: "GET" }),
  discover:       () => app("/api/agent-auto-fix",  { body: { action: "discover", trigger: "watchdog" } }),
};

async function health(report) {
  const { status, data } = await app("/api/agent-auto-fix", { body: { action: "health", ...(report ? { report } : {}) }, timeoutMs: 60_000 });
  if (status !== 200) throw new Error(`Health check failed (HTTP ${status}): ${data?.error ?? JSON.stringify(data).slice(0, 200)}`);
  return data;
}

// ── GitHub REST helpers ──────────────────────────────────────────────────────
async function gh(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "yojana-sahay-watchdog",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub ${method} ${path} → HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.status === 204 ? null : res.json();
}

async function findOpenIssue(label) {
  const list = await gh(`/issues?state=open&labels=${encodeURIComponent(label)}&per_page=5`);
  return list.find(i => !i.pull_request && (i.labels ?? []).some(l => (l?.name ?? l) === label)) ?? null;
}

// Open / update / close one tracking issue. Returns { url, state } or null.
async function syncIssue({ label, title, body, wantOpen }) {
  if (!GH_TOKEN || !REPO) { log("No GITHUB_TOKEN/GITHUB_REPOSITORY — skipping issue sync."); return null; }
  if (DRY_RUN) { log(`[dry-run] issue "${title}" → ${wantOpen ? "open/update" : "close if open"}`); return null; }
  const open = await findOpenIssue(label);
  if (wantOpen) {
    if (!open) {
      // Make sure the label exists (422 = already there).
      await gh("/labels", { method: "POST", body: { name: label, color: label === HEALTH_LABEL ? "d73a4a" : "fbca04" } }).catch(() => {});
    }
    if (open) {
      if (open.body !== body) await gh(`/issues/${open.number}`, { method: "PATCH", body: { title, body } });
      return { url: open.html_url, state: "open" };
    }
    const created = await gh("/issues", { method: "POST", body: { title, body, labels: [label] } });
    return { url: created.html_url, state: "open" };
  }
  if (open) {
    await gh(`/issues/${open.number}/comments`, { method: "POST", body: { body: "✅ Resolved — the watchdog found no remaining problems. Closing automatically." } });
    await gh(`/issues/${open.number}`, { method: "PATCH", body: { state: "closed", state_reason: "completed" } });
    return { url: open.html_url, state: "closed" };
  }
  return null;
}

// ── Report formatting ────────────────────────────────────────────────────────
export function healthIssueBody(h, reruns) {
  const rows = h.items.map(i => `| ${ICON[i.status] ?? ""} | **${i.name}** | ${String(i.detail).replace(/\|/g, "\\|")} |`).join("\n");
  const rerunText = reruns.length
    ? reruns.map(r => `- \`${r.job}\` → ${r.ok ? "re-run OK" : `re-run failed: ${r.error}`}`).join("\n")
    : "- none needed";
  const fixes = h.items.filter(i => i.status === "fail" && !i.rerun)
    .map(i => `- **${i.name}** — ${i.detail}`).join("\n");
  return [
    `The watchdog checked every automatic job at **${new Date(h.checkedAt).toUTCString()}** and something still needs attention after trying to fix it itself.`,
    "",
    fixes ? `### Needs you\n${fixes}\n` : "",
    "### Status",
    "| | Agent / service | Detail |",
    "|---|---|---|",
    rows,
    "",
    "### Automatic re-runs tried",
    rerunText,
    "",
    "_This issue updates itself every 6 hours and closes automatically when everything is healthy._",
  ].join("\n");
}

export function reviewIssueBody(items) {
  const lines = items.slice(0, 60).map(it => {
    const cands = (it.candidates ?? []).map(c => `  - ${c.alive === true ? "🟢" : c.alive === false ? "🔴" : "⚪"} ${c.url}${c.title ? ` — _${String(c.title).slice(0, 80)}_` : ""}`).join("\n");
    const what = { DEAD_LINK: "dead link", MULTI_URL: "several URLs in one field", TEXT_ONLY: "text instead of a URL", NO_URL: "no URL" }[it.type] ?? it.type;
    return `- [ ] **${it.name}** (\`${it.id}\`${it.state ? `, ${it.state}` : ""}) — ${what}${it.rawUrl ? `: ${it.rawUrl}` : ""}${it.type === "DEAD_LINK" ? `\n${cands || "  - no candidates found"}` : ""}`;
  });
  return [
    "The Auto-Fix agent found these scheme links but could not fix them **safely** on its own.",
    "Fix them in **Admin → Verify** (Find New URL / URL issues) or edit the scheme file. Candidate replacements found by search are listed under dead links.",
    "",
    ...lines,
    items.length > 60 ? `\n…and ${items.length - 60} more.` : "",
    "",
    "_Updated every 6 hours · closes automatically when nothing is left to review._",
  ].join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────
export async function main() {
  if (!SECRET) throw new Error("CRON_SECRET secret is missing in the GitHub repo (Settings → Secrets → Actions).");

  let h = await health();
  log(`Initial health: ${h.overall}`);
  for (const i of h.items) log(`  ${i.status.padEnd(4)} ${i.name} — ${i.detail}`);

  const reruns = [];
  const jobs = [...new Set(h.items.filter(i => i.rerun && RERUNS[i.rerun]).map(i => i.rerun))];
  for (const job of jobs) {
    if (DRY_RUN) { log(`[dry-run] would re-run ${job}`); continue; }
    log(`Re-running ${job}…`);
    try {
      const r = await RERUNS[job]();
      const ok = r.status < 400;
      reruns.push({ job, ok, at: new Date().toISOString(), ...(ok ? {} : { error: String(r.data?.error ?? `HTTP ${r.status}`).slice(0, 200) }) });
      log(`  ${job} → HTTP ${r.status}`);
    } catch (err) {
      reruns.push({ job, ok: false, at: new Date().toISOString(), error: err.message.slice(0, 200) });
      log(`  ${job} → ${err.message}`);
    }
  }
  if (jobs.length && !DRY_RUN) h = await health();

  // Still failing after self-heal → issue. Warnings alone don't open one.
  const stillFailing = h.items.some(i => i.status === "fail");
  const issue = await syncIssue({
    label: HEALTH_LABEL,
    title: "🤖 Agent health: something needs attention",
    body: healthIssueBody(h, reruns),
    wantOpen: stillFailing,
  }).catch(err => { log(`Issue sync failed: ${err.message}`); return null; });

  // Dead links waiting for a human — from the latest Auto-Fix run.
  let reviewIssue = null;
  const review = h.review ?? null;
  if (Array.isArray(review)) {
    reviewIssue = await syncIssue({
      label: REVIEW_LABEL,
      title: `🔗 ${review.length} scheme link${review.length === 1 ? "" : "s"} need review`,
      body: reviewIssueBody(review),
      wantOpen: review.length > 0,
    }).catch(err => { log(`Review issue sync failed: ${err.message}`); return null; });
  }

  // Store the final picture in the app (Agents tab → Watchdog card).
  if (!DRY_RUN) await health({ reruns, source: "github-watchdog", ...(issue ? { issue } : {}), ...(reviewIssue ? { reviewIssue } : {}) }).catch(err => log(`Saving report failed: ${err.message}`));

  log(`Final health: ${h.overall}${issue ? ` · issue ${issue.state}: ${issue.url}` : ""}`);
  // Fail the workflow run only on hard failures, so GitHub also e-mails you.
  if (stillFailing) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => { console.error("[watchdog] crashed:", err.message); process.exit(1); });
}
