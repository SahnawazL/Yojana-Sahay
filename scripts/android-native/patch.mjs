// scripts/android-native/patch.mjs — Yojana Sahay Android app (Capacitor)
// Run in CI after `npx cap add android` / `npx cap sync android`:
//   node scripts/android-native/patch.mjs <versionCode> <versionName> <withFirebase 0|1>
// Customises the generated android/ project: share-to-app + app shortcuts
// (MainActivity, manifest), branded splash, version, release signing (keystore
// from environment variables) and the Google sign-in plugin switch.
import fs from "node:fs";
import path from "node:path";

const [versionCode, versionName, withFirebase] = process.argv.slice(2);
const A = "android";
const app = path.join(A, "app");
const res = path.join(app, "src/main/res");
const here = path.dirname(new URL(import.meta.url).pathname);
const must = (cond, msg) => { if (!cond) { console.error("patch: " + msg); process.exit(1); } };
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };

// 1) MainActivity with share + shortcut handling
const javaDir = path.join(app, "src/main/java/com/yojanasahay/app");
must(fs.existsSync(path.join(javaDir, "MainActivity.java")), "MainActivity.java not found (appId changed?)");
fs.copyFileSync(path.join(here, "MainActivity.java"), path.join(javaDir, "MainActivity.java"));

// 2) shortcuts + labels
write(path.join(res, "xml/shortcuts.xml"), read(path.join(here, "shortcuts.xml")));
const stringsP = path.join(res, "values/strings.xml");
let strings = read(stringsP);
const labels = {
  sc_checker_short: "Eligibility", sc_checker_long: "Check my eligibility",
  sc_search_short: "Find schemes", sc_search_long: "Find schemes",
  sc_money_short: "Money check", sc_money_long: "Money not received?",
  sc_ai_short: "Ask AI", sc_ai_long: "Ask AI assistant"
};
for (const [k, v] of Object.entries(labels)) {
  if (!strings.includes(`name="${k}"`)) strings = strings.replace("</resources>", `    <string name="${k}">${v}</string>\n</resources>`);
}
write(stringsP, strings);

// 3) manifest: share target, yojanasahay:// links, shortcuts
const manP = path.join(app, "src/main/AndroidManifest.xml");
let man = read(manP);
const actStart = man.indexOf('android:name=".MainActivity"');
must(actStart > -1, "MainActivity not in manifest");
const actEnd = man.indexOf("</activity>", actStart);
must(actEnd > -1, "</activity> not found");
const extra = `
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:scheme="yojanasahay" android:host="go" />
            </intent-filter>
            <meta-data android:name="android.app.shortcuts" android:resource="@xml/shortcuts" />
        `;
if (!man.includes("android.intent.action.SEND")) man = man.slice(0, actEnd) + extra + man.slice(actEnd);
// microphone (voice questions to the AI) + Android 11+ visibility of the
// phone's text-to-speech and speech-recognition services (read-aloud, mic)
if (!man.includes("android.permission.RECORD_AUDIO")) {
  man = man.replace("</manifest>", '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n</manifest>');
}
if (!man.includes("android.intent.action.TTS_SERVICE")) {
  man = man.replace("</manifest>", `    <queries>
        <intent><action android:name="android.intent.action.TTS_SERVICE" /></intent>
        <intent><action android:name="android.speech.RecognitionService" /></intent>
    </queries>
</manifest>`);
}
write(manP, man);

// 4) branded splash (the website's launch card) instead of Capacitor's default
for (const d of fs.readdirSync(res)) {
  if (!d.startsWith("drawable")) continue;
  const f = path.join(res, d, "splash.png");
  if (fs.existsSync(f)) fs.rmSync(f);
}
const splashSrc = path.join("scripts/android/splash");
for (const d of fs.readdirSync(splashSrc)) {
  fs.mkdirSync(path.join(res, d), { recursive: true });
  fs.copyFileSync(path.join(splashSrc, d, "splash.png"), path.join(res, d, "splash.png"));
}
// a density-free fallback so @drawable/splash always resolves
fs.mkdirSync(path.join(res, "drawable"), { recursive: true });
fs.copyFileSync(path.join(splashSrc, "drawable-xxhdpi", "splash.png"), path.join(res, "drawable", "splash.png"));

// 4b) Android 12+ launch screen: same navy as the app's animated launch
//     screen, so the hand-over is seamless (icon stays the app icon)
const stylesP = path.join(res, "values/styles.xml");
let styles = read(stylesP);
if (!styles.includes("windowSplashScreenBackground")) {
  const launch = /(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)/;
  if (launch.test(styles)) {
    styles = styles.replace(launch, `$1\n        <item name="windowSplashScreenBackground">#001659</item>\n        <item name="android:windowBackground">@drawable/splash</item>`);
    write(stylesP, styles);
  } else console.warn("patch: launch style not found — default launch screen colours kept");
}

// 5) Google sign-in plugin: include its Google provider only when configured
const varsP = path.join(A, "variables.gradle");
let vars = read(varsP);
if (withFirebase === "1" && !vars.includes("rgcfaIncludeGoogle")) vars = vars.replace(/ext\s*\{/, "ext {\n    rgcfaIncludeGoogle = true");
write(varsP, vars);

// 6) version + release signing
const gradleP = path.join(app, "build.gradle");
let g = read(gradleP);
g = g.replace(/versionCode\s+\d+/, `versionCode ${Number(versionCode)}`)
     .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
if (!g.includes("ysRelease")) {
  g += `
// Yojana Sahay: release signing with the upload key re-created in CI
android {
    signingConfigs {
        ysRelease {
            storeFile file(System.getenv("YS_KEYSTORE") ?: "missing.p12")
            storePassword System.getenv("YS_STORE_PASS")
            keyAlias "upload"
            keyPassword System.getenv("YS_STORE_PASS")
            storeType "pkcs12"
        }
    }
    buildTypes { release { signingConfig signingConfigs.ysRelease } }
}
`;
}
write(gradleP, g);
console.log(`patched android/: version ${versionName} (${versionCode}), google sign-in ${withFirebase === "1" ? "on" : "off"}`);
