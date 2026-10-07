// api/_lib/urlTools.js — Yojana Sahay · Shared server-side URL helpers
// ─────────────────────────────────────────────────────────────────────────────
// One place for the URL rules the verifier endpoints share, so the browser
// verifier, the background batch and the URL finder all agree on what a
// "checkable URL" is.
// ─────────────────────────────────────────────────────────────────────────────

// Mirrors normalizeUrl() in src/verifySchemes.js. schemesData stores a mix of
// full URLs, bare domains ("pmkisan.gov.in") and text with a domain in front
// ("mss.edu.in (Maharashtra State Skills University)"). Returns a full
// https:// URL, or null for plain text such as "Nearest bank branch".
export function normalizeSchemeUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.split(/\s/)[0];

  if (/\s/.test(trimmed)) {
    const first = trimmed.split(/[\s(—–,]/)[0].trim();
    if (first && first.includes(".") && !first.includes("/")) return `https://${first}`;
    return null;
  }
  if (!trimmed.includes(".")) return null;
  return `https://${trimmed}`;
}

// Only public http(s) URLs may be fetched from our servers. Blocks localhost,
// private ranges and cloud metadata hosts so ping-url / find-new-url can't be
// abused to probe Vercel's internal network.
export function isPublicHttpUrl(value) {
  let u;
  try { u = new URL(value); } catch { return false; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || !host.includes(".") && host !== "localhost") return false;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return false;
  if (host === "metadata.google.internal") return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
  }
  if (host.includes(":")) return false; // raw IPv6 literals — never a scheme portal
  return true;
}

// Classify a Node fetch() failure. A DNS miss / refused connection means the
// site really is gone; a timeout or reset usually just means a slow or
// geo-blocking government server, which must NOT be reported as "dead".
export function classifyFetchError(err) {
  if (err?.name === "AbortError") return { definitive: false, message: "timeout" };
  const code = err?.cause?.code || err?.code || "";
  const msg  = err?.cause?.message || err?.message || "network error";
  const deadCodes = ["ENOTFOUND", "EAI_NONAME", "ECONNREFUSED", "ERR_INVALID_URL", "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID"];
  return { definitive: deadCodes.includes(code), message: code ? `${code}: ${msg}` : msg };
}
