// scripts/android-native/icons.mjs — source images for `capacitor-assets`
// (uses sharp, which @capacitor/assets installs). Usage: node icons.mjs <outDir>
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const src = "public/icons/app-icon-512.png";
await sharp(src).resize(1024, 1024).png().toFile(path.join(out, "icon-only.png"));
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: "#ffffff" } }).png().toFile(path.join(out, "icon-background.png"));
const fg = await sharp(src).resize(640, 640).png().toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: fg, gravity: "center" }]).png().toFile(path.join(out, "icon-foreground.png"));
console.log("icons ready in", out);
