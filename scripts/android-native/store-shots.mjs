// scripts/android-native/store-shots.mjs — drives the app on the emulator
// (Chrome DevTools protocol, test builds only) and saves full-size store
// screenshots to $RUNNER_TEMP/shots. Each shot is independent: one failing
// never stops the rest.
import { execSync } from "node:child_process";
import fs from "node:fs";
const OUT = process.env.RUNNER_TEMP + "/shots";
const log = (...a) => { const line = a.join(" "); console.log(line); try { fs.appendFileSync(OUT + "/progress.txt", line + "\n"); } catch {} };
// never let the run hang: give up after 9 minutes, keeping what was taken
setTimeout(() => { log("TIMEOUT — stopping"); process.exit(0); }, 9 * 60 * 1000).unref();
const adb = (c) => { try { return execSync("adb " + c, { encoding: "utf8", timeout: 30000 }).trim(); } catch (e) { return "ADB-ERR " + e.message.slice(0, 200); } };
const T = (ms) => new Promise(r => setTimeout(r, ms));
let ws = null, seq = 0; const waiting = new Map();
const reforward = () => {
  const pid = adb("shell pidof com.yojanasahay.app").split(/\s+/)[0];
  if (pid && !pid.startsWith("ADB-ERR")) { adb("forward --remove tcp:9222"); adb(`forward tcp:9222 localabstract:webview_devtools_remote_${pid}`); }
};
async function connect() {
  let target = null;
  for (let i = 0; i < 15 && !target; i++) {
    if (i > 0) { reforward(); await T(1500); }
    try { target = (await (await fetch("http://127.0.0.1:9222/json/list", { signal: AbortSignal.timeout(4000) })).json()).find(t => t.type === "page" && String(t.url).startsWith("https://localhost")); } catch {}
  }
  if (!target) throw new Error("app page not found");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = bad; setTimeout(() => bad(new Error("connect timeout")), 8000); });
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
}
const send = (method, params = {}) => new Promise(r => {
  const id = ++seq; waiting.set(id, r);
  setTimeout(() => { if (waiting.has(id)) { waiting.delete(id); r({}); } }, 20000);
  try { ws.send(JSON.stringify({ id, method, params })); } catch { waiting.delete(id); r({}); }
});
const ev = async (fn, arg) => {
  if (!ws || ws.readyState !== 1) { reforward(); await connect(); }
  const r = await send("Runtime.evaluate", { expression: `(${fn.toString()})(${JSON.stringify(arg ?? null)})`, awaitPromise: true, returnByValue: true, userGesture: true });
  return r.result?.exceptionDetails ? "ERR " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text) : r.result?.result?.value;
};
const shot = (name) => { const png = execSync("adb exec-out screencap -p", { maxBuffer: 64 * 1024 * 1024, timeout: 20000 }); fs.writeFileSync(`${OUT}/${name}.png`, png); log("saved", name, png.length); };
const step = async (name, fn) => { try { await fn(); } catch (e) { log("FAILED", name, e.message); } };
const restart = async () => {
  try { ws && ws.close(); } catch {}
  ws = null;
  adb("shell am force-stop com.yojanasahay.app"); await T(1200);
  adb("shell am start -n com.yojanasahay.app/.MainActivity"); await T(9000);
  reforward(); await connect();
};
const clickText = (re) => ev((s) => { const r = new RegExp(s); const b = [...document.querySelectorAll("button,[role=button],div")].reverse().find(e => r.test((e.textContent || "").trim()) && e.offsetParent); if (b) { b.click(); return true; } return false; }, re);
const escape = () => ev(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return true; });

log("start");
await connect();
log("connected");
// English, light theme, fresh "first open" so the features sheet appears
await ev(() => { localStorage.setItem("yojana_lang", "en"); localStorage.setItem("yojana_dark", "false"); localStorage.removeItem("ys_app_features_seen"); return true; });
await restart();

await step("features sheet", async () => {
  await T(7000);   // the launch screen is gone and the sheet has slid up
  log("sheet open:", await ev(() => !!document.querySelector('[aria-label="App features"]')));
  shot("02-made-for-your-phone");
  await clickText("^Continue$"); await T(900);
});
await step("home", async () => { await ev(() => { document.querySelectorAll("*").forEach(e => { if (e.scrollTop) e.scrollTop = 0; }); return true; }); await T(800); shot("01-home"); });
await step("scheme details", async () => {
  adb("shell am start -a android.intent.action.VIEW -d yojanasahay://scheme/pmkisan -n com.yojanasahay.app/.MainActivity"); await T(4000);
  shot("04-scheme-details"); await escape(); await T(1200);
});
await step("search", async () => {
  adb("shell am start -a android.intent.action.VIEW -d yojanasahay://go/find -n com.yojanasahay.app/.MainActivity"); await T(3500);
  adb("shell input text widow%spension"); await T(3500);
  adb("shell input keyevent KEYCODE_BACK"); await T(700);   // hide the keyboard
  log("search open:", await ev(() => !!document.querySelector('[role="dialog"] input')));
  shot("03-search"); await escape(); await T(1200);
});
await step("ai", async () => { await ev(() => window.__ysGo && window.__ysGo("ai")); await T(3000); shot("05-ai-assistant"); await ev(() => window.__ysGo && window.__ysGo("home")); await T(800); });
await step("offline", async () => {
  adb("shell cmd connectivity airplane-mode enable"); await T(4000);
  await ev(() => window.__ysGo && window.__ysGo("schemes")); await T(3000);
  shot("06-offline-schemes");
  adb("shell cmd connectivity airplane-mode disable"); await T(2500);
  await ev(() => window.__ysGo && window.__ysGo("home")); await T(800);
});
await step("widget", async () => {
  await ev(async () => {
    const d = new Date(Date.now() + 5.5 * 3600e3), ymd = (n) => new Date(d.getTime() + n * 864e5).toISOString().slice(0, 10);
    const data = JSON.stringify({ v: 1, lang: "en", mine: true, items: [
      { id: "pmkisan", en: "PM Kisan Samman Nidhi", hi: "पीएम किसान", date: ymd(3) },
      { id: "scholarship", en: "National Scholarship (NSP)", hi: "राष्ट्रीय छात्रवृत्ति", date: ymd(12) },
      { id: "ayushman", en: "Ayushman Bharat (PMJAY)", hi: "आयुष्मान भारत", date: ymd(40) }] });
    await window.Capacitor.nativePromise("YSWidget", "update", { data }); return true;
  });
  const ui = () => { adb("shell uiautomator dump /sdcard/ui.xml"); return adb("shell cat /sdcard/ui.xml"); };
  const node = (xml, re) => { for (const m of xml.matchAll(/<node [^>]*>/g)) if (re.test(m[0])) { const b = /bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/.exec(m[0]); if (b) return { x: (+b[1] + +b[3]) >> 1, y: (+b[2] + +b[4]) >> 1 }; } return null; };
  // 1) the app's own "Add deadline widget": Android asks the launcher, we confirm
  log("pin:", JSON.stringify(await ev(() => window.Capacitor.nativePromise("YSWidget", "pin", { kind: "quick" }).catch(e => "err " + e.message))));
  await T(2500);
  const add = node(ui(), /text="(Add to home screen|ADD TO HOME SCREEN|Add|ADD)"/);
  if (add) { adb(`shell input tap ${add.x} ${add.y}`); await T(3000); }
  const placed = () => (adb("shell dumpsys appwidget").match(/YsWidgets\$(Quick|Search)/g) || []).length;
  log("widget dialog:", !!add, "placed entries:", placed());
  if (add) { adb("shell input keyevent KEYCODE_HOME"); await T(3500); shot("07-home-screen-widget"); return; }
  // 2) otherwise drag it from the widget picker
  const [W, H] = (/(\d+)x(\d+)/.exec(adb("shell wm size")) || [0, 1080, 2400]).slice(1).map(Number);
  adb("shell input keyevent KEYCODE_HOME"); await T(2000);
  adb(`shell input swipe ${W >> 1} ${Math.round(H * 0.55)} ${W >> 1} ${Math.round(H * 0.55)} 1500`); await T(1500);
  const n = node(ui(), /text="Widgets"/); if (n) { adb(`shell input tap ${n.x} ${n.y}`); await T(2500); }
  let app = null;
  for (let k = 0; k < 14 && !app; k++) { app = node(ui(), /text="Yojana Sahay"/); if (!app) { adb(`shell input swipe ${W >> 1} ${Math.round(H * 0.8)} ${W >> 1} ${Math.round(H * 0.35)} 400`); await T(900); } }
  if (!app) { log("widget: app not found in picker"); return; }
  adb(`shell input tap ${app.x} ${app.y}`); await T(2500);
  adb(`shell input swipe ${W >> 1} ${Math.round(H * 0.75)} ${W >> 1} ${Math.round(H * 0.45)} 600`); await T(1500);
  const x = W >> 1, y = Math.round(H * 0.5);
  adb(`shell input draganddrop ${x} ${y} ${x} ${Math.round(H * 0.35)} 2500`); await T(4000);
  adb("shell input keyevent KEYCODE_HOME"); await T(3000);
  shot("07-home-screen-widget");
});
log("done");
