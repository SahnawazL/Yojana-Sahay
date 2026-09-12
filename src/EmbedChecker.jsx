/**
 * EmbedChecker.jsx — standalone entry for the /embed route.
 *
 * Renders the existing EligibilityChecker component full-bleed, with no
 * nav/header/footer chrome, so it can be iframe-embedded on the portfolio
 * site. Reuses the real checker as-is — same client-side matching against
 * SCHEME_DB, same /api/chat call for the AI brief, same /api/log-checker-run
 * analytics ping. No new backend logic, no new serverless functions.
 *
 * Requires EligibilityChecker to be exported from App.jsx (see the one-line
 * change noted in APP_JSX_PATCH.txt).
 */
import { useState, useCallback, useEffect } from "react";
import { EligibilityChecker } from "./App.jsx";

// Must match the constants defined in App.jsx (STORAGE_KEY / BRIEF_CACHE_KEY).
// Duplicated here rather than exporting them too, to keep the App.jsx diff
// to a single line.
const STORAGE_KEY = "yojana_eligibility_answers";
const BRIEF_CACHE_KEY = "yojana_brief_cache";

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export default function EmbedChecker() {
  const [runId, setRunId] = useState(0);
  const [lang, setLang] = useState("en");
  const [dark] = useState(prefersDark);

  // Dismiss the pure-CSS #html-splash from index.html — this normally
  // happens inside App.jsx's own mount effect, but /embed renders
  // EmbedChecker instead of the full App, so that effect never runs.
  // Without this, the splash overlay (z-index 99999, full-screen) sits
  // on top of the checker forever, even though it's rendering fine
  // underneath it.
  useEffect(() => {
    const el = document.getElementById("html-splash");
    if (!el) return;
    el.style.transition = "opacity 0.35s ease";
    el.style.opacity = "0";
    const t = setTimeout(() => {
      el.remove();
      try {
        sessionStorage.setItem("ys_splashed", "1");
      } catch {}
    }, 380);
    return () => clearTimeout(t);
  }, []);

  // Mirrors the checker's own internal retake() behaviour: clear saved
  // answers + cached AI brief, then force a full remount via key change
  // so EligibilityChecker's useState initializers read the cleared
  // localStorage and start fresh at question 1.
  const restart = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    try {
      localStorage.removeItem(BRIEF_CACHE_KEY);
    } catch {}
    setRunId((id) => id + 1);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: dark ? "#0d0d14" : "#f5f5fa",
        fontFamily: "'Noto Sans', system-ui, sans-serif",
      }}
    >
      {/* Minimal language toggle — the only chrome this embed keeps */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 12px",
        }}
      >
        <button
          type="button"
          onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: dark ? "#e5e5f0" : "#003580",
            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,53,128,0.08)",
            cursor: "pointer",
          }}
        >
          {lang === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <EligibilityChecker
          key={runId}
          lang={lang}
          dark={dark}
          onClose={restart}
          onComplete={() => {}}
          onExitFromResults={() => {}}
          prefilledAnswers={undefined}
          onOpenDetail={(schemeId) => {
            // No SchemeDetailSheet in this standalone bundle — send the
            // visitor to the real deep-linked scheme page instead.
            window.open(
              `https://yojanasahay.vercel.app/?scheme=${schemeId}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
        />
      </div>

      {/* Subtle attribution / escape hatch to the real product */}
      <a
        href="https://yojanasahay.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          padding: "8px 0 12px",
          fontSize: 11,
          fontWeight: 600,
          color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
          textDecoration: "none",
        }}
      >
        Powered by YojanaSahay ↗ view full app
      </a>
    </div>
  );
}
