// scripts/android/make-upload-key.mjs — Yojana Sahay · Play Store upload key
// ─────────────────────────────────────────────────────────────────────────────
// The Android app file (AAB) must always be signed with the SAME upload key.
// Instead of storing a key file anywhere, this script RE-CREATES the exact same
// key on every build from one secret that already lives in GitHub's encrypted
// secrets (ANDROID_KEY_SEED if set, otherwise CRON_SECRET). The key never
// touches the repository, logs or any database.
//
//   seed ──HMAC-SHA256──▶ deterministic random stream ──▶ RSA-2048 key
//        ──▶ self-signed certificate with fixed dates ──▶ PKCS#12 keystore
//
// Same seed → same key → same certificate → same SHA-256 fingerprint, every
// time. (Google Play App Signing holds the real app-signing key; this is only
// the upload key, which Google can reset if the seed is ever changed.)
//
// Usage: node make-upload-key.mjs <outDir>
//   writes <outDir>/upload.p12 and prints, for the workflow:
//   fingerprint=AA:BB:…   (public — goes into assetlinks.json)
//   and exports masked passwords via $GITHUB_ENV.
// ─────────────────────────────────────────────────────────────────────────────
import { createHmac } from "node:crypto";
import { writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import forge from "node-forge";

const seedSecret = process.env.SEED;
if (!seedSecret || seedSecret.length < 16) {
  console.error("SEED secret is missing or too short (set ANDROID_KEY_SEED or CRON_SECRET).");
  process.exit(1);
}
const outDir = process.argv[2] || ".";
mkdirSync(outDir, { recursive: true });

const SALT = "yojanasahay-android-upload-key-v1";
const seed = createHmac("sha256", seedSecret).update(SALT).digest();
const derive = (label, n = 32) => createHmac("sha256", seed).update(label).digest("base64url").slice(0, n);

// Deterministic byte stream (HMAC-SHA256 in counter mode).
let counter = 0;
let pool = Buffer.alloc(0);
const prng = {
  getBytesSync(n) {
    while (pool.length < n) {
      pool = Buffer.concat([pool, createHmac("sha256", seed).update(`rsa-stream-${counter++}`).digest()]);
    }
    const out = pool.subarray(0, n);
    pool = pool.subarray(n);
    return out.toString("binary");
  },
};

forge.options.usePureJavaScript = true; // force the seeded generator (no native keygen)
const keys = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001, prng, algorithm: "PRIMEINC" });

const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date("2026-01-01T00:00:00Z");
cert.validity.notAfter = new Date("2076-01-01T00:00:00Z"); // Play needs ≥ 25 years
const attrs = [
  { name: "commonName", value: "Yojana Sahay" },
  { name: "organizationName", value: "Yojana Sahay" },
  { name: "countryName", value: "IN" },
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey, forge.md.sha256.create());

const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
const fp = forge.md.sha256.create().update(der).digest().toHex().toUpperCase().match(/../g).join(":");

const storePass = derive("storepass");
const p12 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], storePass, { algorithm: "3des", friendlyName: "upload", generateLocalKeyId: true });
writeFileSync(join(outDir, "upload.p12"), Buffer.from(forge.asn1.toDer(p12).getBytes(), "binary"));

if (process.env.GITHUB_ENV) {
  // ::add-mask:: keeps the password out of every log line.
  console.log(`::add-mask::${storePass}`);
  appendFileSync(process.env.GITHUB_ENV, `BUBBLEWRAP_KEYSTORE_PASSWORD=${storePass}\nBUBBLEWRAP_KEY_PASSWORD=${storePass}\n`);
}
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `fingerprint=${fp}\n`);
console.log(`fingerprint=${fp}`);
