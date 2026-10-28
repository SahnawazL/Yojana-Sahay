// scripts/android-native/icons.mjs — Yojana Sahay app icon for Android
// Writes the launcher icons straight into the Android project, replacing
// Capacitor's placeholder icon:
//   • adaptive icon (Android 8+): white background + the app's maskable icon,
//     plus a monochrome layer for Android 13+ themed icons
//   • legacy square + round icons (Android 7)
// Usage (after `npx cap add android`):  node icons.mjs android/app/src/main/res
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const res = process.argv[2];
if (!res || !fs.existsSync(res)) { console.error("icons: res folder not found: " + res); process.exit(1); }

const ICON = "public/icons/app-icon-512.png";          // full square icon (white background)
const MASKABLE = "public/icons/app-maskable-512.png";  // same art with safe-zone padding
const MONO = "public/icons/app-monochrome-512.png";    // single-colour silhouette
const D = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };

// adaptive layer: 108dp canvas; the maskable art fills the ~72dp visible area
async function layer(src, px) {
  const art = Math.round(px * 88 / 108);   // maskable art already has its own safe padding
  const buf = await sharp(src).resize(art, art).png().toBuffer();
  return sharp({ create: { width: px, height: px, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: buf, gravity: "center" }]).png().toBuffer();
}

for (const [d, k] of Object.entries(D)) {
  const dir = path.join(res, "mipmap-" + d);
  const legacy = Math.round(48 * k), adaptive = Math.round(108 * k);
  fs.mkdirSync(dir, { recursive: true });
  await sharp(ICON).resize(legacy, legacy).png().toFile(path.join(dir, "ic_launcher.png"));
  const circle = Buffer.from(`<svg width="${legacy}" height="${legacy}"><circle cx="${legacy / 2}" cy="${legacy / 2}" r="${legacy / 2}" fill="#fff"/></svg>`);
  await sharp(MASKABLE).resize(legacy, legacy).composite([{ input: circle, blend: "dest-in" }]).png()
    .toFile(path.join(dir, "ic_launcher_round.png"));
  fs.writeFileSync(path.join(dir, "ic_launcher_foreground.png"), await layer(MASKABLE, adaptive));
  if (fs.existsSync(MONO)) fs.writeFileSync(path.join(dir, "ic_launcher_monochrome.png"), await layer(MONO, adaptive));
}

const mono = fs.existsSync(MONO) ? '\n    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>' : "";
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>${mono}
</adaptive-icon>
`;
write(path.join(res, "mipmap-anydpi-v26/ic_launcher.xml"), adaptiveXml);
write(path.join(res, "mipmap-anydpi-v26/ic_launcher_round.xml"), adaptiveXml);
// Capacitor's placeholder vector foreground would win over the PNGs on some launchers
for (const f of ["drawable-v24/ic_launcher_foreground.xml", "drawable/ic_launcher_foreground.xml"]) {
  const p = path.join(res, f);
  if (fs.existsSync(p)) fs.rmSync(p);
}
write(path.join(res, "values/ic_launcher_background.xml"), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`);
console.log("app icon written to", res);
