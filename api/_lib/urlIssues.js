// api/_lib/urlIssues.js — Yojana Sahay · Shared URL Issue Detection
// ─────────────────────────────────────────────────────────────────────────────
// Ported 1:1 from SchemeVerifier.jsx's detectUrlIssues()/getUrlIssueFilePath()
// so the automated agent flags the EXACT same issues the admin UI shows.
// If you ever change the detection rules in SchemeVerifier.jsx, mirror the
// change here too (or better: refactor SchemeVerifier.jsx to import from
// this file once it's confirmed working, so there's only one copy).
//
// Issue types (online schemes only — offline is always skipped):
//   NO_HTTPS   — bare domain like "pmkisan.gov.in"          → add https:// (SAFE to auto-fix)
//   MULTI_URL  — "ugc.ac.in / scholarships.gov.in"          → needs a human to pick one
//   TEXT_ONLY  — "Nearest bank branch" (no URL at all)      → needs a human to mark offline
//   NO_URL     — apply.en is null / empty string            → needs a human to add a URL
// ─────────────────────────────────────────────────────────────────────────────

export function isUrlLike(s) {
  if (!s) return false;
  const clean = s.trim();
  return /^(https?:\/\/)?[a-zA-Z0-9][^\s]*\.(gov\.in|nic\.in|ac\.in|org\.in|edu\.in|co\.in|com|net|org|in)(\S*)$/i.test(clean);
}

export function toHttpsUrl(raw) {
  const s = raw.trim();
  if (s.startsWith("https://") || s.startsWith("http://")) return s;
  return `https://${s}`;
}

// National → src/schemesData.js · State → src/states/<statename>.js
export function getUrlIssueFilePath(scheme) {
  if (scheme?.scope === "national") return "src/schemesData.js";
  const st = scheme?.state;
  if (!st) return "src/schemesData.js";
  const fname = st.toLowerCase().replace(/\s*&\s*/g, " ").replace(/\s+/g, "_");
  return `src/states/${fname}.js`;
}

// Scans SCHEME_DB and returns all online schemes with a URL format problem.
// scopeFilter: "all" | "national" | "state:<StateName>"
export function detectUrlIssues(schemes, scopeFilter = "all") {
  if (!Array.isArray(schemes)) return [];

  return schemes
    .filter(s => {
      if (scopeFilter === "national") return s.scope === "national";
      if (scopeFilter?.startsWith("state:")) {
        return s.state === scopeFilter.replace("state:", "").trim();
      }
      return true;
    })
    .filter(s => s.applyType === "online")
    .reduce((acc, s) => {
      const raw = (s.apply?.en ?? "").trim();

      if (!raw) {
        acc.push({ scheme: s, type: "NO_URL", parts: [] });
        return acc;
      }
      if (raw.startsWith("https://") || raw.startsWith("http://")) return acc;

      if (raw.includes(" / ")) {
        const parts = raw.split(" / ").map(p => p.trim()).filter(Boolean);
        const urlParts = parts.filter(isUrlLike);
        if (urlParts.length >= 1) {
          acc.push({ scheme: s, type: "MULTI_URL", parts, urlParts, rawUrl: raw });
          return acc;
        }
      }

      if (isUrlLike(raw)) {
        acc.push({ scheme: s, type: "NO_HTTPS", rawUrl: raw, suggestedUrl: toHttpsUrl(raw) });
        return acc;
      }

      acc.push({ scheme: s, type: "TEXT_ONLY", rawUrl: raw });
      return acc;
    }, []);
}
