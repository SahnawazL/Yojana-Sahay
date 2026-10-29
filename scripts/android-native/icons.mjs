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
// notification icon (status bar): white silhouette on transparent, 24dp
if (fs.existsSync(MONO)) {
  for (const [d, k] of Object.entries(D)) {
    const px = Math.round(24 * k);
    const dir = path.join(res, "drawable-" + d);
    fs.mkdirSync(dir, { recursive: true });
    const { data, info } = await sharp(MONO).resize(px, px).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; } // keep alpha only
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(path.join(dir, "ic_stat_notify.png"));
  }
}
write(path.join(res, "values/ic_launcher_background.xml"), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
    <color name="ys_notify">#FF9933</color>
</resources>
`);
// home-screen widgets (YsWidgets.java): the logo + picker previews for Android 11 and older
{
  const nodpi = path.join(res, "drawable-nodpi");
  fs.mkdirSync(nodpi, { recursive: true });
  await sharp(ICON).resize(144, 144).png().toFile(path.join(nodpi, "ys_w_logo.png"));
  const logo = (await sharp(ICON).resize(88, 88).png().toBuffer()).toString("base64");
  const card = (w, h, inner) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B2A7A"/><stop offset=".5" stop-color="#06195A"/><stop offset="1" stop-color="#231A6B"/></linearGradient>
    <radialGradient id="o" cx=".08" cy="0" r=".7"><stop offset="0" stop-color="#FF9933" stop-opacity=".35"/><stop offset="1" stop-color="#FF9933" stop-opacity="0"/></radialGradient></defs>
    ${inner}</svg>`);
  const pill = (x, y, w, h, text, fs, tx = 0.4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#fff"/>
    <text x="${x + h * tx}" y="${y + h * 0.64}" font-family="sans-serif" font-size="${fs}" fill="#46557A">${text}</text>`;
  const quick = card(600, 264, `<rect width="600" height="264" rx="52" fill="url(#g)"/><rect width="600" height="264" rx="52" fill="url(#o)"/>
    <rect x="20" y="20" width="96" height="96" rx="28" fill="#fff"/><image x="24" y="24" width="88" height="88" xlink:href="data:image/png;base64,${logo}"/>
    ${pill(132, 20, 448, 96, "Search 1,200+ schemes", 28)}
    ${["Eligibility", "Money check", "Ask AI"].map((t, i) => `<rect x="${20 + i * 192}" y="136" width="176" height="104" rx="32" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
      <text x="${108 + i * 192}" y="198" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#fff">${t}</text>`).join("")}`);
  const search = card(600, 120, `${pill(10, 12, 580, 96, "Search 1,200+ schemes", 30, 1.0)}<image x="22" y="24" width="72" height="72" xlink:href="data:image/png;base64,${logo}"/>`);
  await sharp(quick).png().toFile(path.join(nodpi, "ys_w_preview_quick.png"));
  await sharp(search).png().toFile(path.join(nodpi, "ys_w_preview_search.png"));
}
console.log("app icon written to", res);
