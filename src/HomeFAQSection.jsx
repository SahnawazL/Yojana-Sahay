/**
 * YojanaSahay — HomeFAQSection.jsx  (v12 · Premium)
 * Collapsible bilingual FAQ · Home Tab
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Usage: <HomeFAQSection lang={lang} dark={dark} />
 *
 * v14 changes vs v13:
 *   · Bug fix: feedback votes not restoring on refresh / cross-browser
 *     – Root cause: getVoterId() read getAuth().currentUser synchronously
 *       at the top of an async IIFE that ran immediately on component mount.
 *       Firebase Auth restores persisted sessions asynchronously — currentUser
 *       is null for 100–500 ms on every page load/refresh even for fully
 *       signed-in users. The restore query therefore ran with an anon ID,
 *       found nothing in Firestore, and showed all vote buttons as unvoted.
 *     – Fix: replaced the restore useEffect with an onAuthStateChanged
 *       subscriber that waits for Firebase to confirm the session before
 *       resolving the voter identity and querying. Added voterIdRef (set
 *       once when auth resolves) so logFeedback uses the same stable identity
 *       as the restore, eliminating any write/read uid mismatch.
 *     – Cross-browser / multi-device: works for signed-in users (real UID
 *       follows the account). For guests, sessionStorage is inherently
 *       tab-local by design — cross-browser persistence requires an account.
 *
 * v13 changes vs v12:
 *   · Bug fix: fragile index-based faqId corrupted Firestore vote records
 *     – faqId was derived as `${lang}_${faq.cat}_${globalIdx}` where
 *       globalIdx = allFaqs.indexOf(faq). This meant any reorder, insertion,
 *       or category-filter change could silently shift indices and make old
 *       vote records in Firestore point to the wrong questions forever.
 *     – Fix: every entry in FAQ_DATA (both `en` and `hi` arrays) now carries
 *       a stable `id` field (e.g. "schemes_003"). faqId in the render is now
 *       simply `faq.id` — immune to reordering and filter state.
 *     – Migration note: existing Firestore docs keyed to the old
 *       `${lang}_${cat}_${idx}` format are orphaned and will not restore.
 *       They used the wrong IDs anyway if any reorder had occurred.
 *
 * v12 changes vs v11:
 *   · Polish: vote button colour was the FAQ's category colour
 *     – Thumbs-up and thumbs-down both filled with whatever colour that
 *       row's category happened to be (navy, saffron, violet…), so a
 *       "helpful" vote on an AI question looked nothing like a "helpful"
 *       vote on a Privacy question.
 *     – Fix: introduced a fixed VOTE_COLOR pair — green for 👍, a soft
 *       light red for 👎 — independent of category, with dark-mode
 *       variants for contrast. Applied to both the chosen button's fill
 *       and the "Thanks for your feedback!" label colour, so the whole
 *       confirmation reads as one consistent sentiment colour.
 *
 * v11 changes vs v10:
 *   · Polish: voted feedback button looked clunky
 *     – The chosen 👍/👎 button stacked a 1.5px border AND a 3px box-shadow
 *       ring AND a scale(1.15) jump on top of each other, reading as a
 *       harsh navy square rather than a clean "liked" state. The other,
 *       un-chosen button just sat there at 30% opacity as a faded ghost,
 *       cluttering the row instead of receding.
 *     – Fix: once voted, only the CHOSEN button renders at all (the other
 *       is filtered out, not just faded) — a single clean pill, filled
 *       solid with the category colour, no border, one soft drop-shadow,
 *       a gentler scale(1.08) on a smoother easing curve, and the corners
 *       round further into a pill shape to read as "confirmed" rather
 *       than "selected in a list".
 *
 * v10 changes vs v9:
 *   · Bug fix: feedback vote didn't survive closing/reopening the FAQ
 *     – The 👍/👎 vote bar saved to Firestore correctly (one doc per
 *       faqId+uid, merge:true), but `feedbackState` — the local state that
 *       decides whether a row shows "Was this helpful?" vs "Thanks!" — was
 *       only ever set in memory when you tapped a button. It was never
 *       loaded FROM Firestore, so every time this component unmounted
 *       (closing the FAQ panel) and remounted (reopening it), it reset to
 *       an empty object and every question looked unvoted again — even
 *       though the underlying vote was saved forever.
 *     – Fix: on mount, fetch this voter's own past votes (one query, by
 *       uid) and pre-fill feedbackState before render. Signed-in users:
 *       persists forever, on any device, since it's keyed to their
 *       permanent Firebase UID. Guests: persists for the browser session
 *       (matches the existing anon-id design — see v8 note below).
 *     – Extracted the uid-resolution logic (signed-in UID vs per-session
 *       anon id) into a shared getVoterId() so the new restore-on-mount
 *       effect and the existing vote-writer use the exact same identity.
 *
 * v9 changes vs v8:
 *   · Bug fix: tap-to-close was closing the whole FAQ panel
 *     – The v8 "pop our own entry" fix called window.history.back() when a
 *       row was closed by tapping it. back() fires a REAL, global popstate
 *       event — and this app's parent screens (ProfileTab / top-level App)
 *       also listen for popstate to close their own overlay/sub-view when
 *       it's still open. They can't tell "an inner FAQ row just closed"
 *       apart from "the user pressed back to leave", so they closed the
 *       entire FAQ panel too, dropping the user back on whatever screen
 *       opened it (e.g. Profile).
 *     – Fix: tap-to-close now calls window.history.replaceState(null,"")
 *       instead. It still neutralises our own history slot in place (so a
 *       later real back-press doesn't need an extra press), but — unlike
 *       back() — replaceState() never dispatches popstate, so no other
 *       screen's listener hears about it or reacts.
 *     – Note: pressing the actual hardware/gesture back button while a row
 *       is open is a separate case (real navigation, can't be silenced the
 *       same way) and can still close the whole panel. Flagging this as a
 *       known follow-up — let me know if you want it fixed too.
 *
 * v8 changes vs v7:
 *   · Feature: "Was this helpful?" 👍/👎 feedback bar
 *     – Appears at the bottom of every open answer panel
 *     – Optimistic UI: vote registers instantly in local state
 *     – Logs to Firestore `faqFeedback/{faqId}__{uid}` (merge: true)
 *       so each user's vote is idempotent and updatable
 *     – Anonymous users write with uid = 'anon'
 *     – After voting: both buttons fade, chosen one stays highlighted
 *       with category colour + scale(1.15), label changes to "Thanks!"
 *     – Firestore doc fields: faqId, cat, vote, lang, uid, updatedAt
 *   · Bug fix: hardware back-button history stacking
 *     – Old code called pushState on EVERY openIdx change, so switching
 *       between open rows (A open -> tap B) pushed a new history entry
 *       each time. Users had to press back several extra times to leave
 *       the screen. Now pushes exactly one entry per "open" session via
 *       a ref, and pops it again if the row is closed by tapping instead
 *       of via the back button.
 *   · Bug fix: accordion content clipping
 *     – Old code used a hardcoded `maxHeight: 700`, silently clipping any
 *       answer (esp. ones with a `note` block, or longer Hindi text) that
 *       rendered taller than 700px, with no scroll affordance. Now
 *       measures each item's real height via ref + scrollHeight instead.
 *
 * v6 changes vs v5:
 *   · Premium visual redesign
 *     – Tiranga-inspired 3 px gradient top bar on main card
 *     – Dot-grid CSS header background
 *     – Gradient clip-text card title (NAVY→steel in light; saffron in dark)
 *     – Left category-colour accent stripe (3 px) on open accordion rows
 *     – Category pills: gradient active fill, faint glow, larger hit area
 *     – "A" answer badge: circle monogram with category gradient ring
 *     – Note block: left border stripe + tighter icon row
 *     – Shield header icon: soft glow ring on dark mode
 *     – Footer: Tiranga tint gradient + stronger CTA hierarchy
 *     – Section label: left accent bar + gradient shimmer
 *   · Bug fix: renderAnswer now receives `dark` as explicit 6th param
 *     (was resolving to module-scope undefined in v5 — always falsy)
 */

import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SCHEME_DB } from "./schemesData.js";
import { FAQ_DATA } from "./faqData.js";

// Plain links to the static "schemes by state" pages — lets Google (and
// people) reach every scheme page from the home page.
const STATE_LISTS = (() => {
  const m = new Map();
  for (const s of SCHEME_DB) {
    if (s?.scope !== "state" || !s.state) continue;
    m.set(s.state, (m.get(s.state) ?? 0) + 1);
  }
  const slug = st => "list-" + st.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [{ label: "Central", hi: "केंद्र सरकार", key: "list-central" },
    ...[...m.keys()].sort().map(st => ({ label: st, hi: st, key: slug(st) }))];
})();

// ── Resolve the current voter's identity — FALLBACK ONLY ──────────────────
// This is kept as a last-resort safety net for logFeedback.
// The primary identity resolution now happens inside the onAuthStateChanged
// listener in the component (see voterIdRef), which guarantees Firebase Auth
// has fully resolved the persisted session before we ever read currentUser.
// Calling getAuth().currentUser synchronously (as this function does) is
// inherently racy on page load — currentUser is null for 100–500 ms even
// for signed-in users while Firebase re-establishes the session from the
// stored token. Do NOT use this function for the restore query.
function getVoterId() {
  let uid = getAuth().currentUser?.uid;
  if (!uid) {
    try {
      uid = sessionStorage.getItem("ys_anon_faq_id");
      if (!uid) {
        uid = "anon_" + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem("ys_anon_faq_id", uid);
      }
    } catch {
      uid = "anon_" + Math.random().toString(36).slice(2, 10); // storage blocked — one-off id
    }
  }
  return uid;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    card:    "#fff",
    card2:   "#f8f9fa",
    text:    "#1a1a1a",
    textMid: "#555",
    textSub: "#888",
    border:  "#f0f0f0",
    divider: "#f3f3f3",
  },
  dark: {
    card:    "#1c1c1e",
    card2:   "#252527",
    text:    "#f0f0f0",
    textMid: "#aaa",
    textSub: "#888",
    border:  "#2c2c2e",
    divider: "#2c2c2e",
  },
};

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

// ─── BRAND COLOURS ────────────────────────────────────────────────────────────
const NAVY    = "#003580";
const SAFFRON = "#FF9933";
const GREEN   = "#138808";
const VIOLET  = "#7C3AED";

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CAT_CONFIG = {
  about:   { en: "About the App",  hi: "ऐप के बारे में", color: NAVY,      darkColor: "#6B90FF"  },
  privacy: { en: "Privacy & Data", hi: "गोपनीयता",        color: GREEN,     darkColor: "#4ADE80"  },
  schemes: { en: "Schemes",        hi: "योजनाएं",          color: "#C97400", darkColor: SAFFRON    },
  ai:      { en: "AI Assistant",   hi: "AI सहायक",        color: VIOLET,    darkColor: "#A78BFA"  },
  account: { en: "Account",        hi: "अकाउंट",          color: "#0284C7", darkColor: "#38BDF8"  },
};

// FAQ text lives in ./faqData.js — shared with the public /faq.html page
// and Google's FAQ data, so all three always say the same thing.

// ─── CHEVRON SVG ──────────────────────────────────────────────────────────────
function Chevron({ color, open }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round"
      style={{
        flexShrink:  0,
        transition:  "transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        transform:   open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── CATEGORY ICON SVG ────────────────────────────────────────────────────────
function CategoryIcon({ catId, size = 12, color = "currentColor" }) {
  const shared = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: "2",
    strokeLinecap: "round", strokeLinejoin: "round",
    style: { flexShrink: 0, display: "block" },
  };
  if (catId === "about") return (
    <svg {...shared}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
  if (catId === "privacy") return (
    <svg {...shared}>
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
  if (catId === "schemes") return (
    <svg {...shared}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="12" y2="16"/>
    </svg>
  );
  if (catId === "ai") return (
    <svg {...shared}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
  if (catId === "account") return (
    <svg {...shared}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
  return (
    <svg {...shared}>
      <rect x="3"  y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3"  y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

// ─── NOTE ICON SVG ────────────────────────────────────────────────────────────
function NoteIcon({ size = 10, color = "currentColor" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block" }}
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01" strokeWidth="3"/>
    </svg>
  );
}

// ─── ANSWER RENDERER ─────────────────────────────────────────────────────────
// v6: receives `dark` as 6th param (was reading undefined from module scope)
// v6: note block gets a prominent left border stripe instead of top header bar
function renderAnswer(a, cc, th, bf, isHindi, dark) {
  const isObj    = a && typeof a === "object";
  const mainText = isObj ? a.text : a;
  const noteText = isObj ? a.note : null;

  return (
    <div style={{ flex: 1, paddingTop: 1 }}>
      {/* Main answer text */}
      <div style={{
        fontSize:   12.5,
        color:      th.textMid,
        lineHeight: 1.75,
        fontFamily: bf,
        letterSpacing: 0.1,
      }}>
        {mainText}
      </div>

      {/* Note block — v6: left stripe + cleaner layout */}
      {noteText && (
        <div style={{
          marginTop:    12,
          borderRadius: "0 8px 8px 0",
          overflow:     "hidden",
          borderLeft:   `3px solid ${cc}`,
          background:   dark ? `${cc}0D` : `${cc}07`,
          boxShadow:    `inset 0 0 0 1px ${cc}1C`,
        }}>
          {/* Label row */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        5,
            padding:    "5px 10px 4px",
          }}>
            <NoteIcon size={10} color={cc} />
            <span style={{
              fontSize:      9.5,
              fontWeight:    800,
              color:         cc,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              fontFamily:    bf,
            }}>
              {isHindi ? "ध्यान दें" : "Note"}
            </span>
          </div>
          {/* Body */}
          <div style={{
            padding:    "0 10px 9px",
            fontSize:   11.5,
            lineHeight: 1.65,
            color:      th.textMid,
            fontFamily: bf,
          }}>
            {noteText}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HomeFAQSection({ lang, dark }) {
  const [openIdx,   setOpenIdx]   = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [feedbackState, setFeedbackState] = useState({});

  // Stable voter identity — set exactly once when onAuthStateChanged confirms
  // Firebase Auth has resolved the persisted session. Using this ref (instead
  // of calling getAuth().currentUser synchronously) prevents the race where
  // currentUser is null for 100–500 ms on page load even for signed-in users,
  // which caused the restore query to run under a wrong anon ID and find nothing.
  const voterIdRef = useRef(null);

  // ── Restore this voter's past FAQ votes on mount ──────────────────────────
  // onAuthStateChanged fires once Firebase Auth has confirmed who (if anyone)
  // is signed in — only then do we resolve the voter identity and query.
  // This is the fix for the auth race: the old code called getVoterId() at
  // the top of an async IIFE, which ran before onAuthStateChanged had fired,
  // so signed-in users were briefly treated as guests and the restore query
  // returned empty results.
  useEffect(() => {
    let cancelled = false;
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // We only need the first event — don't re-run on sign-out

      // Resolve and cache the stable voter identity
      let uid;
      if (user) {
        uid = user.uid;                                    // real Firebase UID
      } else {
        try {
          uid = sessionStorage.getItem("ys_anon_faq_id");   // anon: reuse existing
          if (!uid) {
            uid = "anon_" + Math.random().toString(36).slice(2, 10);
            sessionStorage.setItem("ys_anon_faq_id", uid);  // anon: create once per tab
          }
        } catch {
          uid = "anon_" + Math.random().toString(36).slice(2, 10); // storage blocked — use a one-off id for this render
        }
      }
      voterIdRef.current = uid;

      if (cancelled) return;
      try {
        const snap = await getDocs(
          query(collection(db, "faqFeedback"), where("uid", "==", uid))
        );
        if (cancelled) return;
        const restored = {};
        snap.forEach((d) => {
          const data = d.data();
          if (data?.faqId && data?.vote) restored[data.faqId] = data.vote;
        });
        if (Object.keys(restored).length) {
          setFeedbackState((prev) => ({ ...restored, ...prev }));
        }
      } catch (e) {
        console.warn("FAQ feedback restore failed:", e);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // ── FAQ feedback — logs 👍/👎 votes to Firestore faqFeedback collection ──
  const logFeedback = async (faqId, cat, vote, question) => {
    setFeedbackState(prev => ({ ...prev, [faqId]: vote }));
    try {
      // voterIdRef is guaranteed to be set by onAuthStateChanged before any
      // user interaction is possible. getVoterId() is kept only as a safety net.
      const uid   = voterIdRef.current ?? getVoterId();
      const docId = `${faqId}__${uid}`;
      await setDoc(doc(db, "faqFeedback", docId), {
        faqId,
        q: question,    // question text — shown in admin FAQ Feedback tab
        cat,
        vote,           // 'up' or 'down'
        lang,
        uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn("FAQ feedback log failed:", e);
    }
  };

  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const allFaqs = FAQ_DATA[lang] || FAQ_DATA.en;

  // Vote sentiment colours — fixed green/red regardless of the FAQ's own
  // category colour, so "helpful" and "not helpful" read as universal
  // signals at a glance rather than blending into the row's accent colour.
  const VOTE_COLOR = {
    up:   dark ? "#4ADE80" : "#138808", // green
    down: dark ? "#FCA5A5" : "#F87171", // light red — softer, not alarm-red
  };


  // v7 bugfix: accordion content height was a hardcoded `maxHeight: 700`,
  // which silently clipped any answer (esp. answers with a `note` block, or
  // Hindi text — which runs noticeably longer than English for the same
  // content) that happened to render taller than 700px, with no scroll
  // affordance. Fixed below by measuring each item's real content height via
  // ref + scrollHeight instead of guessing a fixed number.
  const itemRefs = useRef([]);

  const catColor = (catId) => {
    const cfg = CAT_CONFIG[catId];
    return dark ? cfg.darkColor : cfg.color;
  };

  const filteredFaqs = filterCat === "all"
    ? allFaqs
    : allFaqs.filter((f) => f.cat === filterCat);

  const handleFilter = (catId) => {
    setFilterCat(catId);
    setOpenIdx(null);
  };

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  // Android hardware back button — collapse open item instead of navigating away
  //
  // v7 bugfix: the old version called pushState on every openIdx change, so
  // switching between open FAQ rows (A open -> tap B -> A closes, B opens)
  // pushed a NEW history entry each time. After browsing a few questions,
  // the user had to press back several extra times before it actually left
  // the screen. Fix: push exactly ONE entry for the whole "something is
  // open" session (tracked via a ref, not state, so it doesn't re-trigger
  // renders), and pop it ourselves if the user closes by tapping instead of
  // by pressing back.
  const openIdxRef = useRef(openIdx);
  openIdxRef.current = openIdx;
  const faqHistoryPushed = useRef(false);

  // Single, stable popstate listener — mounted once, not re-subscribed on
  // every openIdx change.
  useEffect(() => {
    const handlePopState = () => {
      if (openIdxRef.current !== null) {
        faqHistoryPushed.current = false;
        setOpenIdx(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Push/pop our single history entry in step with the open/closed boundary.
  useEffect(() => {
    if (openIdx !== null && !faqHistoryPushed.current) {
      faqHistoryPushed.current = true;
      window.history.pushState({ ysFaq: true }, "");
    } else if (openIdx === null && faqHistoryPushed.current) {
      faqHistoryPushed.current = false;
      // v9 fix: was window.history.back() — that fires a real, GLOBAL
      // popstate event that the parent screen's own back-button listener
      // also hears, and reacts to by closing the whole FAQ panel (it can't
      // tell "a row closed" apart from "user pressed back to leave").
      // replaceState() neutralises our slot in place without dispatching
      // popstate at all, so nothing else gets notified or reacts.
      window.history.replaceState(null, "");
    }
  }, [openIdx]);

  // Pill config
  const pills = [
    {
      id:    "all",
      label: isHindi ? `सभी (${allFaqs.length})` : `All (${allFaqs.length})`,
      color: dark ? "#6B90FF" : NAVY,
    },
    ...Object.entries(CAT_CONFIG).map(([id, cfg]) => ({
      id,
      label: isHindi ? cfg.hi : cfg.en,
      color: dark ? cfg.darkColor : cfg.color,
    })),
  ];

  // ── Title gradient string (CSS background-clip trick) ──────────────────────
  const titleGrad = dark
    ? "linear-gradient(135deg, #6B90FF 0%, #A5C0FF 55%, #C8DAFF 100%)"
    : `linear-gradient(135deg, ${NAVY} 0%, #1a5bbf 55%, #2e72d2 100%)`;

  return (
    <div style={{ marginBottom: 14 }}>

      {/* ── Global styles ── */}
      <style>{`
        .ys-faq-pills::-webkit-scrollbar { display: none; }

        /* Accordion entrance */
        @keyframes ys-faq-in {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .ys-faq-item {
          animation: ys-faq-in 0.24s cubic-bezier(0.25,0.46,0.45,0.94) both;
        }

        /* Tiranga stripe shimmer */
        @keyframes ys-stripe-shimmer {
          0%   { opacity: 0.75; }
          50%  { opacity: 1;    }
          100% { opacity: 0.75; }
        }
        .ys-faq-stripe {
          animation: ys-stripe-shimmer 4s ease-in-out infinite;
        }

        /* Touch feedback on rows — the single source of truth for press
           feedback (previously duplicated by onTouchStart/End handlers that
           mutated DOM style directly, fighting this !important rule and
           risking a stuck style if touchend/touchcancel ever didn't fire).
           A flat mid-tone works in both themes, so no light/dark branching
           is needed here. */
        .ys-faq-row:active {
          background: rgba(127,127,127,0.14) !important;
          transform: scale(0.993);
        }

        /* Keyboard focus — buttons have no visible default ring set via
           inline styles, so a11y focus rings are added explicitly here.
           :focus-visible means mouse/touch taps don't show a ring, only
           keyboard (Tab) navigation does. */
        .ys-faq-row:focus-visible,
        .ys-faq-pill:focus-visible {
          outline: 2px solid ${dark ? "#6B90FF" : NAVY};
          outline-offset: 2px;
        }
        .ys-faq-row:focus-visible { outline-offset: -2px; }

        .ys-faq-mail:hover,
        .ys-faq-mail:focus-visible { text-decoration: underline; }
        .ys-faq-mail:focus-visible {
          outline: 2px solid ${dark ? "#6B90FF" : NAVY};
          outline-offset: 2px;
          border-radius: 3px;
        }

        /* Feedback button hover */
        .ys-vote-btn { transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease; }
        .ys-vote-btn:active { transform: scale(0.92) !important; }

        /* Thanks confirmation pop-in */
        @keyframes ys-thanks-in {
          0%   { opacity: 0; transform: scale(0.80) translateY(4px); }
          60%  { opacity: 1; transform: scale(1.06) translateY(-1px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .ys-thanks-badge {
          animation: ys-thanks-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        /* Icon pulse after vote */
        @keyframes ys-vote-pulse {
          0%   { box-shadow: 0 0 0 0px currentColor; }
          60%  { box-shadow: 0 0 0 5px transparent;  }
          100% { box-shadow: 0 0 0 0px transparent;  }
        }
        .ys-voted-icon { animation: ys-vote-pulse 0.5s ease 0.1s both; }
      `}</style>

      {/* ── Section label — v6: left accent bar ── */}
      <div style={{
        display:       "flex",
        alignItems:    "center",
        gap:           8,
        marginBottom:  10,
      }}>
        {/* Left accent bar */}
        <div style={{
          width:        3,
          height:       28,
          borderRadius: 2,
          flexShrink:   0,
          background:   dark
            ? `linear-gradient(180deg, #6B90FF 0%, ${SAFFRON} 100%)`
            : `linear-gradient(180deg, ${NAVY} 0%, ${SAFFRON} 100%)`,
        }} />
        <div>
          <div style={{
            fontSize:      11,
            fontWeight:    800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            fontFamily:    bf,
            background:    dark
              ? "linear-gradient(90deg, #6B90FF 0%, #A5BBFF 100%)"
              : `linear-gradient(90deg, ${NAVY} 0%, #2060C8 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>
            {isHindi ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
          </div>
          <div style={{
            fontSize:   9.5,
            color:      th.textSub,
            fontFamily: bf,
            marginTop:  1,
          }}>
            {isHindi
              ? `${allFaqs.length} सवाल · ${Object.keys(CAT_CONFIG).length} श्रेणियां`
              : `${allFaqs.length} answers · ${Object.keys(CAT_CONFIG).length} categories`}
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div style={{
        background:   th.card,
        borderRadius: 18,
        overflow:     "hidden",
        border:       `1.5px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,53,128,0.10)"}`,
        boxShadow:    dark
          ? "0 4px 24px rgba(0,0,0,0.30), 0 1px 4px rgba(0,0,0,0.20)"
          : "0 4px 24px rgba(0,53,128,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      }}>

        {/* ── Tiranga gradient top stripe ── */}
        <div
          className="ys-faq-stripe"
          style={{
            height:     3,
            background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY} 30%, ${SAFFRON} 50%, ${GREEN} 70%, ${GREEN} 100%)`,
          }}
        />

        {/* ── Card header — v6: dot-grid bg, gradient title ── */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          11,
          padding:      "14px 15px 13px",
          borderBottom: `1px solid ${th.divider}`,
          background:   dark
            ? `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px) 0 0 / 18px 18px, rgba(255,255,255,0.015)`
            : `radial-gradient(circle, rgba(0,53,128,0.04) 1px, transparent 1px) 0 0 / 18px 18px, rgba(0,53,128,0.018)`,
        }}>

          {/* Shield icon — v6: glow ring on dark */}
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   11,
            flexShrink:     0,
            background:     dark
              ? "rgba(0,53,128,0.28)"
              : "rgba(0,53,128,0.07)",
            border:         `1.5px solid ${dark ? "rgba(107,144,255,0.35)" : "rgba(0,53,128,0.14)"}`,
            boxShadow:      dark
              ? "0 0 0 3px rgba(107,144,255,0.10), 0 2px 10px rgba(0,53,128,0.40)"
              : "0 2px 8px rgba(0,53,128,0.10)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill={dark ? "#6B90FF" : NAVY}
                opacity="0.92"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Gradient title */}
            <div style={{
              fontSize:             13,
              fontWeight:           800,
              fontFamily:           bf,
              lineHeight:           1.2,
              background:           titleGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}>
              {isHindi ? "आपके सवाल, हमारे जवाब" : "Your Questions, Answered"}
            </div>
            <div style={{
              fontSize:   10,
              color:      th.textSub,
              marginTop:  3,
              fontFamily: bf,
              lineHeight: 1.3,
            }}>
              {isHindi
                ? "Firebase Auth · MIT लाइसेंस · सरकारी लिंक"
                : "Firebase Auth · MIT Licensed · Govt links only"}
            </div>
          </div>

          {/* Count pill */}
          <div style={{
            background:   dark
              ? "rgba(255,153,51,0.18)"
              : "rgba(255,153,51,0.12)",
            border:       `1px solid ${dark ? "rgba(255,153,51,0.40)" : "rgba(255,153,51,0.30)"}`,
            borderRadius: 20,
            padding:      "4px 10px",
            fontSize:     10,
            fontWeight:   800,
            color:        dark ? SAFFRON : "#C97400",
            fontFamily:   bf,
            flexShrink:   0,
            letterSpacing: 0.3,
          }}>
            {filteredFaqs.length} {isHindi ? "सवाल" : "Q&A"}
          </div>
        </div>

        {/* ── Category filter pills — v6: gradient active fill, glow ── */}
        <div
          className="ys-faq-pills"
          role="group"
          aria-label={isHindi ? "श्रेणी फ़िल्टर" : "Category filter"}
          style={{
            display:                 "flex",
            gap:                     6,
            padding:                 "11px 15px",
            overflowX:               "auto",
            WebkitOverflowScrolling: "touch",
            borderBottom:            `1px solid ${th.divider}`,
            msOverflowStyle:         "none",
            scrollbarWidth:          "none",
          }}
        >
          {pills.map((pill) => {
            const active = filterCat === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                className="ys-faq-pill"
                onClick={() => handleFilter(pill.id)}
                aria-pressed={active}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     5,
                  padding:                 "5px 12px",
                  borderRadius:            20,
                  flexShrink:              0,
                  fontSize:                10.5,
                  fontWeight:              700,
                  cursor:                  "pointer",
                  fontFamily:              bf,
                  margin:                  0,
                  appearance:              "none",
                  WebkitAppearance:        "none",
                  background:              active
                    ? `linear-gradient(135deg, ${pill.color}22 0%, ${pill.color}12 100%)`
                    : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.028)"),
                  color:                   active ? pill.color : th.textSub,
                  border:                  `1.5px solid ${active ? `${pill.color}55` : th.border}`,
                  boxShadow:               active
                    ? `0 0 0 3px ${pill.color}10, 0 1px 6px ${pill.color}18`
                    : "none",
                  WebkitTapHighlightColor: "transparent",
                  transition:              "background 0.20s, color 0.20s, border-color 0.20s, box-shadow 0.22s, transform 0.12s",
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.93)"; }}
                onTouchEnd={(e)   => { e.currentTarget.style.transform = "scale(1)";    }}
                onTouchCancel={(e)=> { e.currentTarget.style.transform = "scale(1)";    }}
              >
                <CategoryIcon catId={pill.id} size={10} color={active ? pill.color : th.textSub} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Accordion items ── */}
        {filteredFaqs.map((faq, i, arr) => {
          const isOpen  = openIdx === i;
          const isLast  = i === arr.length - 1;
          const cc      = catColor(faq.cat);
          const showCatHeader =
            filterCat === "all" && (i === 0 || arr[i - 1].cat !== faq.cat);
          const qId = `faq-q-${filterCat}-${faq.cat}-${i}`;
          const aId = `faq-a-${filterCat}-${faq.cat}-${i}`;

          return (
            <div
              key={`${filterCat}-${faq.cat}-${i}`}
              className="ys-faq-item"
              style={{ animationDelay: `${Math.min(i, 6) * 25}ms` }}
            >
              {/* ── Category section divider (All view only) ── */}
              {showCatHeader && (() => {
                const cfg      = CAT_CONFIG[faq.cat];
                const hdrColor = dark ? cfg.darkColor : cfg.color;
                return (
                  <div style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        9,
                    padding:    i === 0 ? "11px 15px 8px" : "16px 15px 8px",
                    background: dark
                      ? `linear-gradient(90deg, ${hdrColor}16 0%, transparent 65%)`
                      : `linear-gradient(90deg, ${hdrColor}0D 0%, transparent 65%)`,
                  }}>
                    <div style={{
                      width:          22,
                      height:         22,
                      borderRadius:   7,
                      flexShrink:     0,
                      background:     `${hdrColor}1E`,
                      border:         `1.5px solid ${hdrColor}32`,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                    }}>
                      <CategoryIcon catId={faq.cat} size={11} color={hdrColor} />
                    </div>
                    <span style={{
                      fontSize:      9.5,
                      fontWeight:    800,
                      color:         hdrColor,
                      letterSpacing: 0.9,
                      textTransform: "uppercase",
                      fontFamily:    bf,
                    }}>
                      {isHindi ? cfg.hi : cfg.en}
                    </span>
                    <div style={{
                      flex:       1,
                      height:     1,
                      background: `linear-gradient(90deg, ${hdrColor}30 0%, transparent 100%)`,
                    }} />
                  </div>
                );
              })()}

              {/* ── Question row — v6: left accent stripe, more padding ── */}
              <button
                type="button"
                className="ys-faq-row"
                id={qId}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={aId}
                style={{
                  display:                 "flex",
                  alignItems:              "center",
                  gap:                     11,
                  width:                   "100%",
                  padding:                 "14px 15px 14px 12px",
                  margin:                  0,
                  border:                  "none",
                  appearance:              "none",
                  WebkitAppearance:        "none",
                  textAlign:               "left",
                  font:                    "inherit",
                  color:                   "inherit",
                  cursor:                  "pointer",
                  background:              isOpen
                    ? (dark ? `${cc}14` : `${cc}07`)
                    : "transparent",
                  borderLeft:              isOpen ? `3px solid ${cc}` : "3px solid transparent",
                  borderBottom:            !isOpen && !isLast
                    ? `1px solid ${th.divider}`
                    : "none",
                  WebkitTapHighlightColor: "transparent",
                  userSelect:              "none",
                  transition:              "background 0.22s, border-left-color 0.22s, transform 0.12s",
                }}
              >
                {/* Category icon badge */}
                <div style={{
                  width:          34,
                  height:         34,
                  borderRadius:   10,
                  flexShrink:     0,
                  background:     isOpen
                    ? `${cc}1E`
                    : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                  border:         `1.5px solid ${
                    isOpen
                      ? `${cc}48`
                      : (dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)")
                  }`,
                  boxShadow:      isOpen
                    ? `0 0 0 3px ${cc}12, 0 2px 10px ${cc}1E`
                    : "none",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  transition:     "background 0.22s, border-color 0.22s, box-shadow 0.26s, transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
                  transform:      isOpen ? "scale(1.10)" : "scale(1)",
                }}>
                  <CategoryIcon
                    catId={faq.cat}
                    size={15}
                    color={isOpen ? cc : (dark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.22)")}
                  />
                </div>

                {/* Question text */}
                <div style={{
                  flex:       1,
                  fontSize:   13,
                  fontWeight: isOpen ? 700 : 600,
                  color:      isOpen ? cc : th.text,
                  fontFamily: bf,
                  lineHeight: 1.35,
                  transition: "color 0.22s",
                  letterSpacing: 0.05,
                }}>
                  {faq.q}
                </div>

                <Chevron color={isOpen ? cc : th.textSub} open={isOpen} />
              </button>

              {/* ── Answer panel — maxHeight CSS accordion ── */}
              <div
                id={aId}
                role="region"
                aria-labelledby={qId}
                aria-hidden={!isOpen}
                style={{
                  maxHeight:  isOpen ? `${itemRefs.current[i]?.scrollHeight ?? 2000}px` : "0px",
                  overflow:   "hidden",
                  transition: "max-height 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                <div
                  ref={(el) => { itemRefs.current[i] = el; }}
                  style={{
                  display:        "flex",
                  flexDirection:  "column",
                  borderBottom:   !isLast ? `1px solid ${th.divider}` : "none",
                  background:     dark ? `${cc}0A` : `${cc}05`,
                  opacity:        isOpen ? 1 : 0,
                  transition:     "opacity 0.20s ease 0.10s",
                }}>

                  {/* Badge + Answer row */}
                  <div style={{
                    display: "flex",
                    gap:     10,
                    padding: "2px 15px 12px 15px",
                  }}>

                  {/* "A" badge — v6: circle monogram with gradient ring */}
                  <div style={{
                    width:          26,
                    height:         26,
                    borderRadius:   13,
                    flexShrink:     0,
                    marginTop:      2,
                    background:     `linear-gradient(135deg, ${cc}28 0%, ${cc}14 100%)`,
                    border:         `1.5px solid ${cc}45`,
                    boxShadow:      `0 0 0 2px ${cc}10`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       10,
                    fontWeight:     800,
                    color:          cc,
                    fontFamily:     bf,
                  }}>
                    A
                  </div>

                  {/* Answer text */}
                  {renderAnswer(faq.a, cc, th, bf, isHindi, dark)}
                  </div>

                  {/* ── Was this helpful? feedback bar (v13 · professional) ── */}
                  {(() => {
                    // Stable ID — set on every FAQ_DATA entry as faq.id (e.g. "schemes_003").
                    // Old code derived faqId from the array index, which silently
                    // corrupted Firestore vote records whenever questions were
                    // reordered or new ones inserted before existing entries.
                    const faqId = faq.id;
                    const voted     = feedbackState[faqId] || null;

                    // SVG paths for thumbs-up (reused; down = scaleY(-1))
                    const thumbPath = (
                      <>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                      </>
                    );

                    return (
                      <div style={{
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "space-between",
                        padding:        "8px 14px 12px",
                        borderTop:      `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                        minHeight:      44,
                      }}>

                        {/* Left: label or thanks */}
                        {voted ? (
                          <div
                            className="ys-thanks-badge"
                            style={{
                              display:     "flex",
                              alignItems:  "center",
                              gap:         7,
                            }}
                          >
                            {/* Check circle */}
                            <div
                              className="ys-voted-icon"
                              style={{
                                width:          22,
                                height:         22,
                                borderRadius:   "50%",
                                background:     voted === "up"
                                  ? (dark ? "rgba(74,222,128,0.18)"  : "rgba(19,136,8,0.10)")
                                  : (dark ? "rgba(252,165,165,0.18)" : "rgba(248,113,113,0.12)"),
                                border:         `1.5px solid ${voted === "up" ? VOTE_COLOR.up : VOTE_COLOR.down}`,
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                flexShrink:     0,
                                color:          voted === "up" ? VOTE_COLOR.up : VOTE_COLOR.down,
                              }}
                            >
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path
                                  d="M2.5 6l2.5 2.5 4.5-4.5"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            {/* Thanks text */}
                            <span style={{
                              fontSize:      11,
                              fontWeight:    600,
                              color:         voted === "up" ? VOTE_COLOR.up : VOTE_COLOR.down,
                              fontFamily:    bf,
                              letterSpacing: 0.1,
                            }}>
                              {isHindi ? "धन्यवाद! 🙏" : "Thanks for your feedback!"}
                            </span>
                          </div>
                        ) : (
                          <span style={{
                            fontSize:   11,
                            color:      th.textSub,
                            fontFamily: bf,
                            fontWeight: 500,
                          }}>
                            {isHindi ? "क्या यह उपयोगी था?" : "Was this helpful?"}
                          </span>
                        )}

                        {/* Right: pill with Yes / No buttons (hidden after vote) */}
                        {!voted && (
                          <div style={{
                            display:      "flex",
                            alignItems:   "center",
                            background:   dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                            borderRadius: 20,
                            padding:      "2px 3px",
                            border:       `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                            gap:          2,
                          }}>
                            {["up", "down"].map((v) => {
                              const isUp = v === "up";
                              const hoverBg    = isUp
                                ? (dark ? "rgba(74,222,128,0.18)"  : "rgba(19,136,8,0.10)")
                                : (dark ? "rgba(252,165,165,0.18)" : "rgba(248,113,113,0.12)");
                              const hoverColor = isUp ? VOTE_COLOR.up : VOTE_COLOR.down;

                              return (
                                <button
                                  key={v}
                                  type="button"
                                  className="ys-vote-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    logFeedback(faqId, faq.cat, v, faq.q);
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = hoverBg;
                                    e.currentTarget.style.color      = hoverColor;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color      = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)";
                                  }}
                                  style={{
                                    display:                 "flex",
                                    alignItems:              "center",
                                    gap:                     4,
                                    padding:                 "5px 10px",
                                    borderRadius:            17,
                                    border:                  "none",
                                    background:              "transparent",
                                    cursor:                  "pointer",
                                    color:                   dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)",
                                    fontFamily:              bf,
                                    fontSize:                11,
                                    fontWeight:              600,
                                    WebkitTapHighlightColor: "transparent",
                                    userSelect:              "none",
                                  }}
                                >
                                  {/* Thumb SVG */}
                                  <svg
                                    width="13" height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ transform: isUp ? "none" : "scaleY(-1)", flexShrink: 0 }}
                                  >
                                    {thumbPath}
                                  </svg>
                                  {isUp
                                    ? (isHindi ? "हाँ" : "Yes")
                                    : (isHindi ? "नहीं" : "No")}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* After vote: small chosen-icon badge on the right */}
                        {voted && (
                          <div style={{
                            width:          28,
                            height:         28,
                            borderRadius:   "50%",
                            background:     voted === "up"
                              ? (dark ? "rgba(74,222,128,0.13)"  : "rgba(19,136,8,0.08)")
                              : (dark ? "rgba(252,165,165,0.13)" : "rgba(248,113,113,0.09)"),
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            flexShrink:     0,
                            color:          voted === "up" ? VOTE_COLOR.up : VOTE_COLOR.down,
                          }}>
                            <svg
                              width="13" height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ transform: voted === "up" ? "none" : "scaleY(-1)" }}
                            >
                              {thumbPath}
                            </svg>
                          </div>
                        )}

                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          );
        })}

        {/* ── Footer — v6: Tiranga tint gradient + cleaner CTA ── */}
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        10,
          padding:    "12px 15px",
          background: dark
            ? `linear-gradient(135deg, rgba(0,53,128,0.14) 0%, rgba(255,153,51,0.07) 100%)`
            : `linear-gradient(135deg, rgba(0,53,128,0.045) 0%, rgba(255,153,51,0.025) 100%)`,
          borderTop:  `1px solid ${th.divider}`,
        }}>
          {/* Mail icon in a pill */}
          <div style={{
            width:          28,
            height:         28,
            borderRadius:   8,
            flexShrink:     0,
            background:     dark ? "rgba(107,144,255,0.14)" : "rgba(0,53,128,0.07)",
            border:         `1px solid ${dark ? "rgba(107,144,255,0.28)" : "rgba(0,53,128,0.12)"}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={dark ? "#6B90FF" : NAVY} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize:   11,
              fontWeight: 600,
              color:      th.textMid,
              fontFamily: bf,
              lineHeight: 1.3,
            }}>
              {isHindi ? "और सवाल हैं?" : "Still have questions?"}
            </div>
            <a
              href="mailto:yojanasahayofficial@gmail.com"
              className="ys-faq-mail"
              style={{
                display:       "inline-block",
                fontSize:      10,
                fontWeight:    700,
                color:         dark ? "#6B90FF" : NAVY,
                fontFamily:    bf,
                marginTop:     2,
                letterSpacing: 0.1,
                textDecoration: "none",
              }}
            >
              yojanasahayofficial@gmail.com
            </a>
          </div>

          {/* Reply-time badge */}
          <div style={{
            background:   dark ? "rgba(19,136,8,0.18)" : "rgba(19,136,8,0.10)",
            border:       `1px solid ${dark ? "rgba(74,222,128,0.30)" : "rgba(19,136,8,0.20)"}`,
            borderRadius: 12,
            padding:      "3px 8px",
            fontSize:     9.5,
            fontWeight:   700,
            color:        dark ? "#4ADE80" : GREEN,
            fontFamily:   bf,
            flexShrink:   0,
            whiteSpace:   "nowrap",
          }}>
            {isHindi ? "48 घंटे में जवाब" : "Reply in 48h"}
          </div>
        </div>

        <nav aria-label={isHindi ? "राज्य के अनुसार योजनाएं" : "Schemes by state"} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: dark ? "#aaa" : "#555", fontFamily: bf, marginBottom: 8, letterSpacing: 0.3 }}>
            {isHindi ? "राज्य के अनुसार योजनाएं देखें" : "Browse schemes by state"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px" }}>
            {STATE_LISTS.map(l => (
              <a key={l.key} href={`/${isHindi ? "yojana" : "schemes"}/${l.key}.html`}
                style={{ fontSize: 11, fontFamily: bf, color: dark ? "#ccc" : "#444", textDecoration: "none",
                  border: `1px solid ${dark ? "#333" : "#e2e2e2"}`, borderRadius: 99, padding: "3px 9px" }}>
                {isHindi ? l.hi : l.label}
              </a>
            ))}
          </div>
        </nav>

      </div>
    </div>
  );
}
