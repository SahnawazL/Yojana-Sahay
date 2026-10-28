// scripts/android-native/diagnose.mjs — connects to the app's screen on the
// emulator (plain Chrome DevTools protocol over WebSocket; no browser tool)
// and checks every connection the app uses.
// braces are swapped for ( ) so GitHub's secret masking can't hide results
const out = (k, v) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`.replace(/[{]/g, "(").replace(/[}]/g, ")"));
import { execSync } from "node:child_process";
const adb = (c) => { try { return execSync("adb " + c, { encoding: "utf8", timeout: 30000 }).trim(); } catch (e) { return "ADB-ERR " + e.message.slice(0, 200); } };
// The app's screen reloads on some actions (shortcuts) — reconnect when that happens.
let ws = null, seq = 0, target = null; const waiting = new Map();
const reforward = () => {
  const pid = adb("shell pidof com.yojanasahay.app").split(/\s+/)[0];
  if (pid && !pid.startsWith("ADB-ERR")) { adb("forward --remove tcp:9222"); adb(`forward tcp:9222 localabstract:webview_devtools_remote_${pid}`); }
  return pid;
};
async function connect() {
  for (let i = 0; i < 12; i++) {
    if (i > 0) reforward();
    try {
      const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
      target = list.find(t => t.type === "page" && String(t.url).startsWith(process.env.YS_DIAG_URL || "https://localhost"));
      if (target) break;
    } catch {}
    await new Promise(r => setTimeout(r, 1500));
  }
  if (!target) { out("ERROR", "app page not found"); process.exit(0); }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = bad; });
  ws.onclose = () => { for (const [, r] of waiting) r({ result: { exceptionDetails: { text: "screen reloaded" } } }); waiting.clear(); };
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); return; }
    if (d.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(d.params.type))
      console.log(`console.${d.params.type}: ` + d.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 400));
    if (d.method === "Runtime.exceptionThrown")
      console.log("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 500));
  };
  await send("Runtime.enable");
}
const send = (method, params = {}) => new Promise(r => {
  const id = ++seq; waiting.set(id, r);
  const t = setTimeout(() => { if (waiting.has(id)) { waiting.delete(id); r({ result: { exceptionDetails: { text: "no answer in 25s" } } }); } }, 25000);
  try { ws.send(JSON.stringify({ id, method, params })); } catch { clearTimeout(t); waiting.delete(id); r({ result: { exceptionDetails: { text: "not connected" } } }); }
});
// ── Phase 0: what people see while the app opens (cold start) ──────────────
try {
  const sharp = (await import("sharp")).default;
  const fsx = await import("node:fs");
  adb("shell am force-stop com.yojanasahay.app"); await new Promise(r => setTimeout(r, 1500));
  const devStart = Number(adb("shell date +%s%3N")) || 0;
  adb("shell am start -n com.yojanasahay.app/.MainActivity");
  globalThis.__devStart = devStart;
  const t0 = Date.now(), lines = [];
  for (const at of [2200, 2900, 3500, 4100, 4700, 5300, 6000, 6800, 7800]) {
    const wait = at - (Date.now() - t0); if (wait > 0) await new Promise(r => setTimeout(r, wait));
    const png = execSync("adb exec-out screencap -p", { maxBuffer: 64 * 1024 * 1024 });
    const jpg = await sharp(png).resize(216).jpeg({ quality: 42 }).toBuffer();
    lines.push(`${Date.now() - t0}ms ${jpg.toString("base64")}`);
  }
  fsx.writeFileSync(process.env.RUNNER_TEMP + "/diag/frames.txt", lines.join("\n"));
  out("launch frames", lines.length + " captured");
  await new Promise(r => setTimeout(r, 4000));
} catch (e) { out("launch frames", "FAILED " + e.message); }
await connect();
const T = (ms) => new Promise(r => setTimeout(r, ms));
const page = { url: () => target.url };
const ev = async (fn, arg) => {
  if (!ws || ws.readyState !== 1) { await new Promise(r => setTimeout(r, 1500)); await connect(); }
  const r = await send("Runtime.evaluate", { expression: `(${fn.toString()})(${JSON.stringify(arg ?? null)})`, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.result?.exceptionDetails) return "EVAL-ERR " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result?.result?.value;
};
out("launch timing (ms after tapping the icon)", await ev((dev) => {
  const nav = performance.timeOrigin - dev;
  const paint = Object.fromEntries(performance.getEntriesByType("paint").map(p => [p.name, Math.round(nav + p.startTime)]));
  const t = performance.getEntriesByType("navigation")[0] || {};
  return { pageStarts: Math.round(nav), firstPaint: paint["first-paint"], firstContentfulPaint: paint["first-contentful-paint"],
           htmlParsed: Math.round(nav + (t.domInteractive || 0)), appCodeRan: Math.round(nav + (t.domContentLoadedEventEnd || 0)),
           splashPlay: typeof window.__hsStart === "number" ? Math.round(nav + window.__hsStart) : null,
           splashShown: !!document.getElementById("html-splash") || "removed" };
}, globalThis.__devStart || 0));

// ── Launch animation as Android's web engine draws it (frame by frame) ──────
try {
  await ev(() => { try { sessionStorage.removeItem("ys_splashed"); } catch {} location.reload(); return true; });
  await T(300);
  try { ws.close(); } catch {}
  await connect();
  const fsy = await import("node:fs"); const shots = []; const t0 = Date.now();
  for (let k = 0; k < 12; k++) {
    const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 40 });
    if (r.result && r.result.data) shots.push(`${Date.now() - t0}ms ${r.result.data}`);
    await T(220);
  }
  fsy.writeFileSync(process.env.RUNNER_TEMP + "/diag/frames.txt", shots.join("\n"));
  out("launch frames (web engine)", shots.length + " captured");
  await T(2500);
} catch (e) { out("launch frames (web engine)", "FAILED " + e.message); }
out("url", page.url());
out("basics", await ev(() => ({
  ua: navigator.userAgent, rootChildren: document.getElementById("root")?.childElementCount,
  bridgeErrors: window.__ysBridgeErrors || [], nativeClass: document.documentElement.classList.contains("ys-native"),
  plugins: Object.fromEntries(["App","Share","Browser","SplashScreen","StatusBar","Filesystem","TextToSpeech","SpeechRecognition","FirebaseAuthentication"].map(n => [n, window.Capacitor?.isPluginAvailable?.(n)])),
  speech: { synth: typeof window.speechSynthesis?.speak, rec: typeof window.webkitSpeechRecognition },
  helped: (document.body.innerText.match(/([\d,+—–-]+)\s*\n?\s*INDIANS HELPED/i) || [])[1]
})));
out("server /api/stats (app fetch)", await ev(async () => { try { const r = await fetch("/api/stats"); return r.status + " " + (await r.text()).slice(0, 160); } catch (e) { return "FAILED " + e.name + ": " + e.message; } }));
out("server direct", await ev(async () => { try { const r = await fetch("https://yojanasahay.vercel.app/api/stats", { cache: "no-store" }); return r.status + " acao=" + r.headers.get("access-control-allow-origin"); } catch (e) { return "FAILED " + e.name + ": " + e.message; } }));
out("google reachable", await ev(async () => { try { const r = await fetch("https://www.googleapis.com/discovery/v1/apis?name=identitytoolkit"); return String(r.status); } catch (e) { return "FAILED " + e.message; } }));
await T(3000);
out("firestore (app's Firebase)", await ev(async () => {
  const d = window.__ysDiag; if (!d) return "no __ysDiag (not a test build?)";
  try { const s = await Promise.race([d.getDoc(d.doc(d.db, "appStats", "usage")), new Promise((_, j) => setTimeout(() => j(new Error("timeout 15s")), 15000))]); return "ok exists=" + s.exists() + " checkerTotal=" + (s.data() || {}).checkerTotal; }
  catch (e) { return "FAILED " + (e.code || e.name) + ": " + e.message; }
}));
out("auth: signInWithCredential(fake token)", await ev(async () => {
  const d = window.__ysDiag; if (!d) return "no __ysDiag";
  try { await d.signInWithCredential(d.auth, d.GoogleAuthProvider.credential("eyJhbGciOiJSUzI1NiJ9.eyJhIjoxfQ.x", null)); return "unexpected success"; }
  catch (e) { return (e.code || e.name) + ": " + e.message + " | stack: " + String(e.stack || "").split("\n").slice(0, 6).join(" <- "); }
}));
out("native Google picker", await ev(async () => {
  try { const r = await Promise.race([window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle(), new Promise((_, j) => setTimeout(() => j(new Error("no answer in 20s (picker open?)")), 20000))]);
        return "returned " + JSON.stringify({ hasCred: !!(r && r.credential), hasIdToken: !!(r && r.credential && r.credential.idToken) }); }
  catch (e) { return "ERR " + (e.code || "") + " " + e.message; }
}));
// the real button, like a user
await ev(() => { const b = [...document.querySelectorAll("button,[role=button],div")].find(x => /^\s*Profile\s*$/i.test(x.innerText || "") && x.offsetParent); b && b.click(); });
await T(2500);
out("profile screen has Google button", await ev(() => !![...document.querySelectorAll("button,div")].find(x => /Continue with Google/i.test(x.innerText || "") && x.children.length < 4)));
await ev(() => { const b = [...document.querySelectorAll("button")].find(x => /Continue with Google/i.test(x.innerText || "")); b && b.click(); });
await T(12000);
out("after tapping Continue with Google", await ev(() => [...document.querySelectorAll("div")].filter(x => /Firebase|error|failed|cancel|set up/i.test(x.innerText || "") && x.children.length === 0).map(x => x.innerText.trim()).slice(0, 5)));

// ── Phase 2: server functions, Android integrations, offline ────────────────
out("AI chat server (POST, empty)", await ev(async () => { try { const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); return r.status + " " + (await r.text()).slice(0, 120); } catch (e) { return "FAILED " + e.message; } }));
out("all server functions reachable from the app (CORS)", await ev(async () => {
  const names = ["admin-sync-news","agent-auto-fix","batch-patch-urls","chat","deadline-alerts","find-new-url","log-checker-run","ping-url","refresh-news","stats","update-schemes-meta","verify-scheme"];
  const res = {};
  for (const n of names) { try { const r = await fetch("https://yojanasahay.vercel.app/api/" + n, { method: "OPTIONS" }); res[n] = r.status; } catch (e) { res[n] = "BLOCKED"; } }
  return res;
}));
out("news feed on home", await ev(() => (document.body.innerText.match(/scheme update[\s\S]{0,160}/i) || ["none"])[0].replace(/\n+/g, " | ")));
out("news in Firestore (schemeNews, active)", await ev(async () => { const d = window.__ysDiag; if (!d) return "no diag"; try { const s = await Promise.race([d.getDocs(d.query(d.collection(d.db, "schemeNews"), d.where("active", "==", true))), new Promise((_, j) => setTimeout(() => j(new Error("timeout 20s")), 20000))]); return "ok " + s.size + " items, fromCache=" + s.metadata.fromCache; } catch (e) { return "FAILED " + (e.code || "") + " " + e.message; } }));
adb("shell am start -a android.intent.action.VIEW -d yojanasahay://go/checker com.yojanasahay.app");
await T(6000);
out("shortcut yojanasahay://go/checker opens checker", await ev(() => /STEP 1|Eligibility Check|question/i.test(document.body.innerText) + " url=" + location.href));
adb("shell input keyevent 4"); await T(1500);
out("back button closes it (app still open)", await ev(() => "url=" + location.href + " stillChecker=" + /STEP 1 OF/i.test(document.body.innerText)) + " | top=" + adb("shell dumpsys activity activities | grep -m1 -E 'topResumedActivity|mResumedActivity'"));
adb("shell am start -a android.intent.action.SEND -t text/plain --es android.intent.extra.TEXT PM-Kisan-6000-bonus-click-bit.ly/x-to-claim -n com.yojanasahay.app/.MainActivity");
await T(7000);
out("text shared from another app reaches the AI check", await ev(() => ({ pending: !!window.__ysPendingChat || !!window.__ysPendingShare, onAI: /AI Assistant|Unlock AI|Is this message real/i.test(document.body.innerText) })));
await ev(() => { history.replaceState(null, "", "/"); });
await ev(() => { const a = [...document.querySelectorAll("a[href]")].find(x => /about\.html$/.test(x.getAttribute("href"))); if (a) a.click(); return !!a; });
await T(5000);
out("About us opens outside the app screen", adb("shell dumpsys activity activities | grep -m1 -E 'topResumedActivity|mResumedActivity'") + " | appUrl=" + (await ev(() => location.href)));
adb("shell input keyevent 4"); await T(2500);
adb("shell svc wifi disable"); adb("shell svc data disable"); await T(3000);
await ev(() => { location.reload(); });
await T(9000);
out("offline start", await ev(() => ({ drew: document.getElementById("root")?.childElementCount, text: document.body.innerText.slice(0, 160).replace(/\n+/g, " | ") })));
adb("shell svc wifi enable"); adb("shell svc data enable");

// ── Phase 3: Android notifications, end to end through the real server ─────
await T(8000); // network back after the offline test
out("notifications: permission", await ev(async () => { try { return await window.ysNative.push.request(); } catch (e) { return "ERR " + e.message; } }));
const tok = await ev(async () => { try { return await window.ysNative.push.token(); } catch (e) { return "ERR " + e.message; } });
out("notifications: Firebase token", typeof tok === "string" && !tok.startsWith("ERR") && !tok.startsWith("EVAL") ? tok.length + " characters" : tok);
if (typeof tok === "string" && tok.length > 20 && !tok.startsWith("ERR") && !tok.startsWith("EVAL") && process.env.CRON_SECRET) {
  adb("shell input keyevent 3"); await T(1500); // home screen, as when a reminder arrives
  try {
    const r = await fetch("https://yojanasahay.vercel.app/api/deadline-alerts", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.CRON_SECRET }, body: JSON.stringify({ action: "pushTest", token: tok }) });
    out("notifications: server sent one", r.status + " " + (await r.text()).slice(0, 160));
  } catch (e) { out("notifications: server sent one", "FAILED " + e.message); }
  await T(15000);
  const dump = adb("shell dumpsys notification --noredact");
  const mine = dump.split("\n").filter(l => /pkg=com\.yojanasahay\.app|android\.title=|android\.text=/.test(l)).map(l => l.trim()).slice(0, 8);
  out("notifications: shown on the phone", mine.length ? mine.join(" | ") : "NOT FOUND");
}

// ── Phase 3b: the REAL update feed on GitHub (what released apps use) ──────
out("live feed on GitHub (released apps)", await ev(async () => {
  const P = window.Capacitor.Plugins;
  try {
    const url = "https://github.com/SahnawazL/Yojana-Sahay/releases/download/app-live/latest-api1.json?t=" + Date.now();
    const r = await P.CapacitorHttp.get({ url, headers: { "Cache-Control": "no-cache" } });
    const m = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
    const res = { feed: r.status, build: m && m.build, api: m && m.api, sizeKB: m && Math.round(m.size / 1024) };
    const b = await P.CapacitorUpdater.download({ url: m.url, version: "github-check-" + m.build, checksum: m.sha256 });
    res.download = b && b.status; res.bundleId = b && b.id;
    await P.CapacitorUpdater.delete({ id: b.id }).catch(() => {});
    return res;
  } catch (e) { return "FAILED " + (e && e.message); }
}));

// ── Phase 4: live updates (local feed; app built to read it) ───────────────
const LIVE = process.env.LIVE_DIR, B0 = Number(process.env.YS_BUILD || 0);
if (LIVE && B0) {
  const fsm = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const sha = (file) => createHash("sha256").update(fsm.readFileSync(LIVE + "/" + file)).digest("hex");
  const feed = (build, file) => fsm.writeFileSync(LIVE + "/latest.json", JSON.stringify({ api: 1, build, url: `http://localhost:8000/${file}`, sha256: sha(file) }));
  const restart = async (wait) => { adb("shell am force-stop com.yojanasahay.app"); await T(1500); adb("shell am start -n com.yojanasahay.app/.MainActivity"); await T(wait); try { ws.close(); } catch {} };
  const liveInfo = () => ev(() => window.__ysLive ? { build: window.__ysLive.build, state: window.__ysLive.state, ready: !!window.__ysLive.ready, log: window.__ysLive.log.slice(-6) } : { none: document.title + " | " + document.body.innerText.slice(0, 60) });
  feed(B0 + 100, "bundle-good.zip");
  await restart(25000);
  out("live 1 (installed copy " + B0 + ") finds + downloads " + (B0 + 100), await liveInfo());
  await restart(20000);
  out("live 2 (next start) runs " + (B0 + 100), await liveInfo());
  out("live 2 app drew its screen", await ev(() => document.getElementById("root")?.childElementCount + " | " + /Yojana Sahay/.test(document.body.innerText)));
  feed(B0 + 200, "bundle-broken.zip");
  await ev(async () => { await window.ysNative.liveCheck(); return true; });
  await T(5000);
  out("live 3 broken copy " + (B0 + 200) + " downloaded", await liveInfo());
  await restart(50000); // switches to the broken copy, which never confirms → automatic roll-back
  out("live 4 after broken copy → rolled back to " + (B0 + 100), await liveInfo());
  await restart(20000);
  out("live 5 next start: still " + (B0 + 100) + ", broken one skipped", await liveInfo());
}

ws.close();
