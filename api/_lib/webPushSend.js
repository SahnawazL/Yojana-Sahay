// api/_lib/webPushSend.js — minimal Web Push sender (no npm dependency).
// Implements the two standards every browser push service accepts:
//   • RFC 8292  VAPID   — "Authorization: vapid t=<ES256 JWT>, k=<public key>"
//   • RFC 8291  payload encryption with Content-Encoding: aes128gcm
// sendWebPush(subscription, payloadString, { TTL, urgency }) → { statusCode }
// Throws an Error with .statusCode for non-2xx replies (404/410 = gone).
import crypto from "crypto";
import { vapidKeys } from "./vapid.js";

const b64u = buf => Buffer.from(buf).toString("base64url");
const fromB64u = s => Buffer.from(String(s), "base64url");
const hkdf = (salt, ikm, info, len) => Buffer.from(crypto.hkdfSync("sha256", ikm, salt, info, len));

let signingKey = null;
function privateKeyObject(k) {
  if (signingKey) return signingKey;
  const pub = fromB64u(k.publicKey); // 0x04 || X(32) || Y(32)
  signingKey = crypto.createPrivateKey({
    key: { kty: "EC", crv: "P-256", d: k.privateKey, x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) },
    format: "jwk",
  });
  return signingKey;
}

export function vapidAuthHeader(endpoint, subject) {
  const k = vapidKeys();
  if (!k) throw new Error("no VAPID keys");
  const aud = new URL(endpoint).origin;
  const header = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const claims = b64u(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject }));
  const sig = crypto.sign("sha256", Buffer.from(`${header}.${claims}`), { key: privateKeyObject(k), dsaEncoding: "ieee-p1363" });
  return `vapid t=${header}.${claims}.${b64u(sig)}, k=${k.publicKey}`;
}

export function encryptPayload(subscription, plaintext) {
  const uaPublic = fromB64u(subscription.keys.p256dh);
  const authSecret = fromB64u(subscription.keys.auth);
  const ecdh = crypto.createECDH("prime256v1");
  const asPublic = ecdh.generateKeys();
  const shared = ecdh.computeSecret(uaPublic);
  const salt = crypto.randomBytes(16);
  const ikm = hkdf(authSecret, shared, Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]), 32);
  const cek = hkdf(salt, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(salt, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(plaintext), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, body]);
}

export async function sendWebPush(subscription, payload, { TTL = 86400, urgency = "normal", subject = "mailto:yojanasahayofficial@gmail.com" } = {}) {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw Object.assign(new Error("bad subscription"), { statusCode: 410 });
  }
  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: vapidAuthHeader(subscription.endpoint, subject),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: String(TTL),
      Urgency: urgency,
    },
    body: encryptPayload(subscription, payload),
  });
  if (res.status >= 200 && res.status < 300) return { statusCode: res.status };
  const text = await res.text().catch(() => "");
  throw Object.assign(new Error(`push ${res.status}: ${text.slice(0, 200)}`), { statusCode: res.status });
}
