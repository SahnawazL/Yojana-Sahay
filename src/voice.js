// src/voice.js — Yojana Sahay · read-aloud with the best voice on the device
// ─────────────────────────────────────────────────────────────────────────────
// Browsers only offer the voices installed on the device. This picks the most
// natural one available, in this order:
//   1. Microsoft "Online (Natural)" neural voices — Swara / Madhur (Hindi),
//      Neerja / Prabhat (Indian English). Available in Microsoft Edge on any
//      device (Android, Windows, Mac).
//   2. Google network voices (Chrome) — "Google हिन्दी", Google English.
//   3. Apple / Samsung / other Indian voices, then any voice in the language.
// Also works around browser bugs: long text is cut into short pieces (some
// phones stop long utterances), utterances are kept referenced (Chrome drops
// unreferenced ones and never fires "end"), and Chrome desktop's ~15 s stall
// is avoided with a periodic resume.
// ─────────────────────────────────────────────────────────────────────────────

export const canSpeak = () =>
  typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

let voicesCache = [];
function loadVoices() {
  if (!canSpeak()) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length) { voicesCache = now; return Promise.resolve(now); }
  return new Promise(resolve => {
    const done = () => { voicesCache = window.speechSynthesis.getVoices(); resolve(voicesCache); };
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1200);
  });
}
if (canSpeak()) {
  loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => { voicesCache = window.speechSynthesis.getVoices(); });
}

function scoreVoice(v, want) {
  const name = v.name || "", lang = (v.lang || "").toLowerCase().replace("_", "-");
  if (!lang.startsWith(want)) return -1;
  let s = 0;
  if (/microsoft/i.test(name) && /natural|online/i.test(name)) s += 100;           // Edge neural voices
  if (/swara|madhur|neerja|prabhat|aarav|ananya|kavya|kunal|rehaan/i.test(name)) s += 15; // Indian neural names
  if (/^google/i.test(name)) s += 60;                                              // Chrome network voices
  if (/natural|neural|enhanced|premium|wavenet/i.test(name)) s += 25;
  if (/rishi|lekha|veena|isha/i.test(name)) s += 30;                               // Apple Indian voices
  if (lang === (want === "hi" ? "hi-in" : "en-in")) s += 30;
  else if (want === "en" && /en-gb|en-us/.test(lang)) s += 8;
  if (v.localService === false) s += 5;                                            // network voices sound better
  if (/compact|espeak/i.test(name)) s -= 40;
  return s;
}

export function pickBestVoice(lang) {
  const want = lang === "hi" ? "hi" : "en";
  let best = null, bestScore = -1;
  for (const v of voicesCache) {
    const sc = scoreVoice(v, want);
    if (sc > bestScore) { best = v; bestScore = sc; }
  }
  return best;
}

// Friendly label for the voice in use, e.g. "Microsoft Swara".
export function voiceLabel(v) {
  if (!v) return "";
  return v.name.replace(/\s*\(.*$/, "").replace(/\s+Online.*$/i, "").replace(/\s+-\s+.*$/, "").trim();
}

function speakableText(md, lang) {
  let t = md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`>]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*-{3,}\s*$/gm, "")
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/[ \t]+/g, " ")
    .trim();
  t = t.replace(/₹\s?/g, lang === "hi" ? "रुपये " : "rupees ");
  return t;
}

let live = [];        // keep utterances referenced until spoken
let keepAlive = null;
let currentRun = 0;

export function stopSpeaking() {
  currentRun++;
  clearInterval(keepAlive); keepAlive = null;
  live = [];
  try { window.speechSynthesis.cancel(); } catch {}
}

// Speaks markdown text. onEnd fires once when finished or stopped.
// Returns the voice used (or null).
export async function speak(md, lang, { onEnd, rate = 1 } = {}) {
  if (!canSpeak()) { onEnd?.(); return null; }
  stopSpeaking();
  const run = currentRun;
  await loadVoices();
  if (run !== currentRun) { onEnd?.(); return null; }

  const text = speakableText(md, lang);
  const parts = text.match(/[^.!?।\n]+[.!?।]?/g)?.map(t => t.trim()).filter(Boolean) || [];
  const chunks = [];
  for (const p of parts) {
    if (chunks.length && (chunks[chunks.length - 1] + " " + p).length < 200) chunks[chunks.length - 1] += " " + p;
    else chunks.push(p);
  }
  if (!chunks.length) { onEnd?.(); return null; }

  const voice = pickBestVoice(lang);
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    if (run === currentRun) { clearInterval(keepAlive); keepAlive = null; live = []; }
    onEnd?.();
  };
  live = chunks.map((c, i) => {
    const u = new SpeechSynthesisUtterance(c);
    u.lang = voice?.lang || (lang === "hi" ? "hi-IN" : "en-IN");
    if (voice) u.voice = voice;
    u.rate = rate;
    if (i === chunks.length - 1) u.onend = finish;
    u.onerror = finish;
    return u;
  });
  live.forEach(u => window.speechSynthesis.speak(u));
  // Chrome on desktop pauses long speech after ~15 s — a resume() keeps it going.
  keepAlive = setInterval(() => {
    if (run !== currentRun || !window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
    if (!/android|iphone|ipad/i.test(navigator.userAgent)) window.speechSynthesis.resume();
  }, 5000);
  return voice;
}
