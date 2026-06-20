// api/_lib/groqRotation.js
//
// Cross-instance round-robin pointer for Groq key rotation.
//
// Why this exists: under real traffic, Vercel runs several separate copies
// of an API route at the same time (roughly one per concurrent request).
// Each copy has its own private memory — so an in-memory counter doesn't
// coordinate between them. Every copy independently starts at key #1, and
// under load they all move in lockstep: all hit K1 together, all 429
// together, all fall through to K2 together. It LOOKS like only one key
// works, even though 5 are configured.
//
// Fix: use the KV store already provisioned in this Vercel project as one
// shared, atomic counter that every copy reads from. KV's INCR is atomic,
// so two requests arriving in the same millisecond still get two different
// numbers — they land on different keys instead of colliding.
//
// If KV is ever unreachable, this fails safe back to "always start at key
// #1" (the original behavior) rather than throwing — a missing shared
// counter should never break Groq calls.

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// Returns an index in [0, n). A different value for every call, even when
// many calls happen at the exact same instant.
export async function getNextStartIdx(n) {
  if (!KV_URL || !KV_TOKEN) {
    return 0; // KV not configured — fall back to old behavior
  }

  try {
    const res = await fetch(`${KV_URL}/incr/groq_rr_counter`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });

    if (!res.ok) {
      console.warn(`[groqRotation] KV INCR returned ${res.status} — defaulting to key #1.`);
      return 0;
    }

    const { result } = await res.json();
    if (typeof result !== "number") return 0;

    return ((result % n) + n) % n; // safe modulo, always 0..n-1
  } catch (err) {
    console.warn("[groqRotation] KV unavailable — defaulting to key #1:", err.message);
    return 0;
  }
}
