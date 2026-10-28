// scripts/android-native/diagnose.mjs — connects to the app's screen on the
// emulator (plain Chrome DevTools protocol over WebSocket; no browser tool)
// and checks every connection the app uses.
const out = (k, v) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const target = list.find(t => t.type === "page" && String(t.url).startsWith(process.env.YS_DIAG_URL || "https://localhost"));
if (!target) { out("ERROR", "app page not found " + JSON.stringify(list).slice(0, 300)); process.exit(0); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = bad; });
let seq = 0; const waiting = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); return; }
  if (d.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(d.params.type))
    console.log(`console.${d.params.type}: ` + d.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 400));
  if (d.method === "Runtime.exceptionThrown")
    console.log("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 500));
};
const send = (method, params = {}) => new Promise(r => { const id = ++seq; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
await send("Runtime.enable");
const T = (ms) => new Promise(r => setTimeout(r, ms));
const page = { url: () => target.url };
const ev = async (fn, arg) => {
  const r = await send("Runtime.evaluate", { expression: `(${fn.toString()})(${JSON.stringify(arg ?? null)})`, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.result?.exceptionDetails) return "EVAL-ERR " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result?.result?.value;
};

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
ws.close();
