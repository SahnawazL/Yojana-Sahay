// api/_lib/vapid.js — Web Push (VAPID) key pair for phone notifications.
// Uses VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY if set; otherwise derives a stable
// P-256 key pair (HKDF-SHA256) from the existing FIREBASE_PRIVATE_KEY secret, so
// no new secret has to be created. Only the public half ever leaves the server.
import crypto from "crypto";

let cached;
export function vapidKeys() {
  if (cached !== undefined) return cached;
  const pub = process.env.VAPID_PUBLIC_KEY?.trim(), priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (pub && priv) return (cached = { publicKey: pub, privateKey: priv });
  const secret = process.env.FIREBASE_PRIVATE_KEY || "";
  if (!secret) return (cached = null);
  for (let i = 0; i < 16; i++) {
    const d = Buffer.from(crypto.hkdfSync("sha256", secret, "yojana-sahay-push", `vapid-p256-${i}`, 32));
    try {
      const ecdh = crypto.createECDH("prime256v1");
      ecdh.setPrivateKey(d); // throws if out of range (astronomically rare) → next i
      return (cached = { publicKey: ecdh.getPublicKey().toString("base64url"), privateKey: d.toString("base64url") });
    } catch {}
  }
  return (cached = null);
}
