// src/HaloMark.jsx — Yojana Sahay's own animated brand mark
// ─────────────────────────────────────────────────────────────────────────────
// Replaces every Ashoka Chakra / flag-style decoration in the app and website:
// YojanaSahay is an independent guide, so it uses no national symbol (Emblems
// and Names Act, 1950; Google Play / Indus Appstore rules on implied government
// affiliation). The mark is an orbit: glowing rings, light dots travelling
// around them and a four-point sparkle in the centre — "finding what's yours".
//
//   <HaloMark size color spinning />   small: a ring loader / badge mark
//                                       large: an animated orbit watermark
//   <AuroraOrb size />                  the AI assistant's avatar
//
// One shared stylesheet (injected once), GPU-friendly transforms only, and
// all motion stops for people who ask their phone for reduced motion.
// ─────────────────────────────────────────────────────────────────────────────

export const BRAND_GRADIENT = "linear-gradient(90deg,#FF9933 0%,#FF6B6B 52%,#7C5CFF 100%)";

const CSS = `
@keyframes ys-halo-spin { to { transform: rotate(360deg); } }
@keyframes ys-halo-spin-rev { to { transform: rotate(-360deg); } }
@keyframes ys-halo-pulse { 0%,100% { transform: scale(1); opacity: .95; } 50% { transform: scale(.78); opacity: .65; } }
@keyframes ys-halo-twinkle { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes ys-orb-spin { to { transform: rotate(360deg); } }
@keyframes ys-orb-breathe { 0%,100% { transform: scale(1); filter: saturate(1); } 50% { transform: scale(1.06); filter: saturate(1.25); } }
@media (prefers-reduced-motion: reduce) {
  .ys-halo-anim, .ys-halo-anim * , .ys-orb, .ys-orb * { animation: none !important; }
}`;
let cssDone = false;
function ensureCss() {
  if (cssDone || typeof document === "undefined") return;
  cssDone = true;
  if (document.getElementById("ys-halo-css")) return;
  const s = document.createElement("style");
  s.id = "ys-halo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// Four-point sparkle path centred on (c, c), radius r
const sparkle = (c, r) => {
  const k = r * 0.22;
  return `M${c} ${c - r} C${c + k} ${c - k} ${c + k} ${c - k} ${c + r} ${c} C${c + k} ${c + k} ${c + k} ${c + k} ${c} ${c + r} C${c - k} ${c + k} ${c - k} ${c + k} ${c - r} ${c} C${c - k} ${c - k} ${c - k} ${c - k} ${c} ${c - r}Z`;
};

export function HaloMark({ size = 18, color = "#4F46E5", spinning = false, style }) {
  ensureCss();
  const s = size, c = s / 2;
  // every moving part turns / pulses around the centre of the mark
  const O = (animation) => ({ transformBox: "view-box", transformOrigin: `${c}px ${c}px`, animation });
  // ── Small: ring loader (spinning) or ring badge (still) ──────────────────
  if (s <= 30) {
    const sw = Math.max(1.6, s * 0.12), r = c - sw / 2 - 0.5;
    const len = 2 * Math.PI * r;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" className="ys-halo-anim"
        style={{ flexShrink: 0, ...style }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={sw} />
        <g style={O(spinning ? "ys-halo-spin 1.1s cubic-bezier(.55,.15,.45,.85) infinite" : "none")}>
          <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${len * 0.32} ${len}`} transform={`rotate(-90 ${c} ${c})`} />
        </g>
        <path d={sparkle(c, r * 0.55)} fill={color}
          style={O(spinning ? "ys-halo-pulse 1.1s ease-in-out infinite" : "none")} />
      </svg>
    );
  }
  // ── Large: orbit watermark ────────────────────────────────────────────────
  const r1 = c * 0.94, r2 = c * 0.68, r3 = c * 0.42;
  const slow = spinning ? 1 : 2.2;                     // "spinning" = livelier
  const dot = (r, a, d) => ({ cx: c + r * Math.cos(a), cy: c + r * Math.sin(a), r: d });
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" className="ys-halo-anim"
      style={{ flexShrink: 0, overflow: "visible", ...style }}>
      <circle cx={c} cy={c} r={r1} fill="none" stroke={color} strokeWidth={s * 0.012} strokeDasharray={`${s * 0.012} ${s * 0.035}`} strokeLinecap="round" opacity={0.7} />
      <circle cx={c} cy={c} r={r2} fill="none" stroke={color} strokeWidth={s * 0.018} opacity={0.55} />
      <circle cx={c} cy={c} r={r3} fill="none" stroke={color} strokeWidth={s * 0.01} opacity={0.45} />
      <g style={O(`ys-halo-spin ${18 * slow}s linear infinite`)}>
        <circle {...dot(r1, -Math.PI / 2, s * 0.03)} fill={color} />
        <circle {...dot(r1, Math.PI / 2.4, s * 0.018)} fill={color} opacity={0.7} />
      </g>
      <g style={O(`ys-halo-spin-rev ${11 * slow}s linear infinite`)}>
        <circle {...dot(r2, 0, s * 0.026)} fill={color} />
        <circle {...dot(r2, Math.PI, s * 0.016)} fill={color} opacity={0.6} />
      </g>
      <g style={O(`ys-halo-spin ${7 * slow}s linear infinite`)}>
        <circle {...dot(r3, Math.PI / 3, s * 0.02)} fill={color} />
      </g>
      <path d={sparkle(c, c * 0.2)} fill={color}
        style={O(`ys-halo-twinkle ${3.2 * slow}s ease-in-out infinite`)} />
    </svg>
  );
}

// The AI assistant's avatar: a glossy aurora orb with a slowly turning
// colour field, a soft breathing glow and a white sparkle.
export function AuroraOrb({ size = 34, style }) {
  ensureCss();
  const s = size;
  return (
    <div className="ys-orb" aria-hidden="true" style={{
      width: s, height: s, borderRadius: "50%", position: "relative", flexShrink: 0, overflow: "hidden",
      boxShadow: `0 0 ${s * 0.45}px rgba(124,92,255,0.45), 0 ${s * 0.08}px ${s * 0.3}px rgba(255,107,107,0.35)`,
      animation: "ys-orb-breathe 3.6s ease-in-out infinite", ...style,
    }}>
      <div style={{
        position: "absolute", inset: "-25%",
        background: "conic-gradient(from 0deg,#FF9933,#FF6B6B,#C850C0,#7C5CFF,#3BA3FF,#FF9933)",
        animation: "ys-orb-spin 6s linear infinite",
      }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0.18) 32%,rgba(255,255,255,0) 60%)" }} />
      <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
        <path d={sparkle(50, 24)} fill="#fff" opacity={0.95} />
        <circle cx="72" cy="30" r="4.5" fill="#fff" opacity={0.85} />
      </svg>
    </div>
  );
}
